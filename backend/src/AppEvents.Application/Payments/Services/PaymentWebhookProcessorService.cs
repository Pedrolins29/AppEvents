using AppEvents.Application.Identity.Interfaces;
using AppEvents.Application.Payments.Interfaces;
using AppEvents.Domain.Payments;
using Microsoft.Extensions.Logging;

namespace AppEvents.Application.Payments.Services;

/// <summary>
/// Orchestrates an inbound payment webhook: verify signature -> parse payload -> upsert Order
/// (idempotent on ExternalOrderId) -> resolve the correlation reference to a user/event -> grant
/// Entitlements for any product keys mapped in IPremiumProductCatalog. The real payload field
/// names, status strings, and signature scheme are unverified against Lastlink documentation
/// (none exists yet) - those assumptions live entirely in the Infrastructure implementations of
/// IWebhookSignatureVerifier/IWebhookPayloadParser, not here.
/// </summary>
public class PaymentWebhookProcessorService : IPaymentWebhookProcessor
{
    private readonly IWebhookSignatureVerifier _signatureVerifier;
    private readonly IWebhookPayloadParser _payloadParser;
    private readonly IPremiumProductCatalog _productCatalog;
    private readonly IOrderRepository _orderRepository;
    private readonly IEntitlementRepository _entitlementRepository;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly ILogger<PaymentWebhookProcessorService> _logger;

    public PaymentWebhookProcessorService(
        IWebhookSignatureVerifier signatureVerifier,
        IWebhookPayloadParser payloadParser,
        IPremiumProductCatalog productCatalog,
        IOrderRepository orderRepository,
        IEntitlementRepository entitlementRepository,
        IDateTimeProvider dateTimeProvider,
        ILogger<PaymentWebhookProcessorService> logger)
    {
        _signatureVerifier = signatureVerifier;
        _payloadParser = payloadParser;
        _productCatalog = productCatalog;
        _orderRepository = orderRepository;
        _entitlementRepository = entitlementRepository;
        _dateTimeProvider = dateTimeProvider;
        _logger = logger;
    }

    public async Task<WebhookProcessResult> ProcessAsync(string rawBody, string? signatureHeader, CancellationToken cancellationToken = default)
    {
        if (!_signatureVerifier.Verify(rawBody, signatureHeader))
        {
            _logger.LogWarning("Audit: payment webhook signature verification failed");
            return WebhookProcessResult.InvalidSignature;
        }

        var payload = _payloadParser.Parse(rawBody);
        if (payload is null || string.IsNullOrWhiteSpace(payload.ExternalOrderId))
        {
            _logger.LogWarning("Audit: payment webhook payload malformed or missing an order id");
            return WebhookProcessResult.MalformedPayload;
        }

        var existing = await _orderRepository.GetByExternalOrderIdAsync(payload.ExternalOrderId, cancellationToken);
        if (existing is not null)
        {
            _logger.LogInformation(
                "Audit: payment webhook replay ignored for already-processed order {ExternalOrderId}",
                payload.ExternalOrderId);
            return WebhookProcessResult.Processed;
        }

        var now = _dateTimeProvider.UtcNow;
        var (userId, eventId) = ParseReference(payload.Reference);
        var status = userId is null ? OrderStatus.Unmatched : ToOrderStatus(payload.RawStatus);

        var order = new Order
        {
            ExternalOrderId = payload.ExternalOrderId,
            ExternalReference = payload.Reference,
            UserId = userId,
            EventId = eventId,
            Status = status,
            AmountCents = payload.AmountCents,
            Currency = payload.Currency,
            ProductKeysRaw = payload.ProductKeys.Count > 0 ? string.Join(",", payload.ProductKeys) : null,
            RawPayload = rawBody,
            ReceivedAtUtc = now,
        };

        await _orderRepository.AddAsync(order, cancellationToken);

        if (status == OrderStatus.Paid && userId is not null)
        {
            foreach (var productKey in payload.ProductKeys)
            {
                var featureKey = _productCatalog.ResolveFeatureKey(productKey);
                if (featureKey is null)
                {
                    _logger.LogWarning(
                        "Audit: payment webhook product key {ProductKey} has no configured feature mapping (order {ExternalOrderId})",
                        productKey, payload.ExternalOrderId);
                    continue;
                }

                await _entitlementRepository.AddAsync(new Entitlement
                {
                    UserId = userId.Value,
                    EventId = eventId,
                    FeatureKey = featureKey,
                    SourceOrderId = order.Id,
                    GrantedAtUtc = now,
                }, cancellationToken);

                _logger.LogInformation(
                    "Audit: granted entitlement {FeatureKey} to user {UserId} from order {ExternalOrderId}",
                    featureKey, userId, payload.ExternalOrderId);
            }
        }
        else if (status == OrderStatus.Unmatched)
        {
            _logger.LogWarning(
                "Audit: payment webhook order {ExternalOrderId} has no resolvable reference - stored unmatched for manual reconciliation",
                payload.ExternalOrderId);
        }

        order.ProcessedAtUtc = _dateTimeProvider.UtcNow;
        await _orderRepository.SaveChangesAsync(cancellationToken);

        return WebhookProcessResult.Processed;
    }

    // Expected shape: "{userId}.{eventId}" or a bare "{userId}" - appended as
    // ?appeventsRef=... on the checkout link. Unverified against real passthrough behavior;
    // absent/malformed references fall back to (null, null) rather than throwing.
    private static (Guid? UserId, Guid? EventId) ParseReference(string? reference)
    {
        if (string.IsNullOrWhiteSpace(reference))
        {
            return (null, null);
        }

        var parts = reference.Split('.', 2);
        if (!Guid.TryParse(parts[0], out var userId))
        {
            return (null, null);
        }

        if (parts.Length == 1)
        {
            return (userId, null);
        }

        return Guid.TryParse(parts[1], out var eventId) ? (userId, eventId) : (userId, null);
    }

    private static OrderStatus ToOrderStatus(string? rawStatus) => rawStatus?.Trim().ToLowerInvariant() switch
    {
        "paid" or "approved" or "completed" => OrderStatus.Paid,
        "refunded" or "chargeback" => OrderStatus.Refunded,
        "failed" or "canceled" or "cancelled" => OrderStatus.Failed,
        _ => OrderStatus.Pending,
    };
}
