using AppEvents.Application.Identity.Interfaces;
using AppEvents.Application.Payments.Dtos;
using AppEvents.Application.Payments.Interfaces;
using AppEvents.Application.Payments.Services;
using AppEvents.Domain.Payments;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace AppEvents.UnitTests.Payments;

public class PaymentWebhookProcessorServiceTests
{
    private readonly IWebhookSignatureVerifier _signatureVerifier = Substitute.For<IWebhookSignatureVerifier>();
    private readonly IWebhookPayloadParser _payloadParser = Substitute.For<IWebhookPayloadParser>();
    private readonly IPremiumProductCatalog _productCatalog = Substitute.For<IPremiumProductCatalog>();
    private readonly IOrderRepository _orderRepository = Substitute.For<IOrderRepository>();
    private readonly IEntitlementRepository _entitlementRepository = Substitute.For<IEntitlementRepository>();
    private readonly IDateTimeProvider _dateTimeProvider = Substitute.For<IDateTimeProvider>();
    private readonly ILogger<PaymentWebhookProcessorService> _logger = Substitute.For<ILogger<PaymentWebhookProcessorService>>();

    private readonly DateTime _now = new(2026, 7, 30, 12, 0, 0, DateTimeKind.Utc);

    private PaymentWebhookProcessorService CreateSut()
    {
        _dateTimeProvider.UtcNow.Returns(_now);
        _signatureVerifier.Verify(Arg.Any<string>(), Arg.Any<string?>()).Returns(true);
        return new PaymentWebhookProcessorService(
            _signatureVerifier, _payloadParser, _productCatalog, _orderRepository, _entitlementRepository, _dateTimeProvider, _logger);
    }

    private static WebhookOrderPayload Payload(
        string orderId = "order-1",
        string? reference = null,
        string? status = "paid",
        IReadOnlyList<string>? productKeys = null) =>
        new(orderId, reference, status, 8900, "BRL", productKeys ?? []);

    [Fact]
    public async Task ProcessAsync_WhenSignatureInvalid_ReturnsInvalidSignature_AndDoesNotPersist()
    {
        var sut = CreateSut();
        _signatureVerifier.Verify(Arg.Any<string>(), Arg.Any<string?>()).Returns(false);

        var result = await sut.ProcessAsync("{}", "bad-signature");

        result.Should().Be(WebhookProcessResult.InvalidSignature);
        await _orderRepository.DidNotReceive().AddAsync(Arg.Any<Order>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ProcessAsync_WhenPayloadUnparseable_ReturnsMalformedPayload()
    {
        var sut = CreateSut();
        _payloadParser.Parse(Arg.Any<string>()).Returns((WebhookOrderPayload?)null);

        var result = await sut.ProcessAsync("not json", "sig");

        result.Should().Be(WebhookProcessResult.MalformedPayload);
        await _orderRepository.DidNotReceive().AddAsync(Arg.Any<Order>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ProcessAsync_WhenDuplicateExternalOrderId_ReturnsProcessed_WithoutReAdding()
    {
        var sut = CreateSut();
        var payload = Payload();
        _payloadParser.Parse(Arg.Any<string>()).Returns(payload);
        _orderRepository.GetByExternalOrderIdAsync("order-1", Arg.Any<CancellationToken>())
            .Returns(new Order { ExternalOrderId = "order-1" });

        var result = await sut.ProcessAsync("{}", "sig");

        result.Should().Be(WebhookProcessResult.Processed);
        await _orderRepository.DidNotReceive().AddAsync(Arg.Any<Order>(), Arg.Any<CancellationToken>());
        await _entitlementRepository.DidNotReceive().AddAsync(Arg.Any<Entitlement>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ProcessAsync_WhenPaidWithMappedProduct_GrantsEntitlement()
    {
        var sut = CreateSut();
        var userId = Guid.NewGuid();
        var eventId = Guid.NewGuid();
        var payload = Payload(reference: $"{userId}.{eventId}", productKeys: ["bump-groomsmen"]);
        _payloadParser.Parse(Arg.Any<string>()).Returns(payload);
        _orderRepository.GetByExternalOrderIdAsync("order-1", Arg.Any<CancellationToken>()).Returns((Order?)null);
        _productCatalog.ResolveFeatureKey("bump-groomsmen").Returns(PremiumFeatureKeys.WeddingGroomsmenManual);

        var result = await sut.ProcessAsync("{}", "sig");

        result.Should().Be(WebhookProcessResult.Processed);
        await _orderRepository.Received(1).AddAsync(
            Arg.Is<Order>(o => o.Status == OrderStatus.Paid && o.UserId == userId && o.EventId == eventId),
            Arg.Any<CancellationToken>());
        await _entitlementRepository.Received(1).AddAsync(
            Arg.Is<Entitlement>(e => e.UserId == userId && e.EventId == eventId && e.FeatureKey == PremiumFeatureKeys.WeddingGroomsmenManual),
            Arg.Any<CancellationToken>());
        await _orderRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ProcessAsync_WhenPaidWithUnmappedProduct_SavesOrderButGrantsNoEntitlement()
    {
        var sut = CreateSut();
        var userId = Guid.NewGuid();
        var payload = Payload(reference: userId.ToString(), productKeys: ["unknown-bump"]);
        _payloadParser.Parse(Arg.Any<string>()).Returns(payload);
        _orderRepository.GetByExternalOrderIdAsync("order-1", Arg.Any<CancellationToken>()).Returns((Order?)null);
        _productCatalog.ResolveFeatureKey("unknown-bump").Returns((string?)null);

        var result = await sut.ProcessAsync("{}", "sig");

        result.Should().Be(WebhookProcessResult.Processed);
        await _orderRepository.Received(1).AddAsync(Arg.Is<Order>(o => o.Status == OrderStatus.Paid), Arg.Any<CancellationToken>());
        await _entitlementRepository.DidNotReceive().AddAsync(Arg.Any<Entitlement>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ProcessAsync_WhenReferenceUnresolvable_StoresUnmatched_GrantsNoEntitlement()
    {
        var sut = CreateSut();
        var payload = Payload(reference: null, productKeys: ["bump-groomsmen"]);
        _payloadParser.Parse(Arg.Any<string>()).Returns(payload);
        _orderRepository.GetByExternalOrderIdAsync("order-1", Arg.Any<CancellationToken>()).Returns((Order?)null);

        var result = await sut.ProcessAsync("{}", "sig");

        result.Should().Be(WebhookProcessResult.Processed);
        await _orderRepository.Received(1).AddAsync(
            Arg.Is<Order>(o => o.Status == OrderStatus.Unmatched && o.UserId == null),
            Arg.Any<CancellationToken>());
        await _entitlementRepository.DidNotReceive().AddAsync(Arg.Any<Entitlement>(), Arg.Any<CancellationToken>());
    }
}
