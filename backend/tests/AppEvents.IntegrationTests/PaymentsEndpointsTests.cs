using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using AppEvents.Application.Identity.Dtos;
using AppEvents.Application.Payments.Dtos;
using AppEvents.Domain.Payments;
using FluentAssertions;

namespace AppEvents.IntegrationTests;

public class PaymentsEndpointsTests : IClassFixture<AppEventsWebApplicationFactory>
{
    // Matches Lastlink:ProductKeyMap:test-bump-groomsmen configured for the "Testing"
    // environment in AppEventsWebApplicationFactory.
    private const string MappedProductKey = "test-bump-groomsmen";

    private readonly AppEventsWebApplicationFactory _factory;

    public PaymentsEndpointsTests(AppEventsWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private static string UniqueEmail() => $"test-{Guid.NewGuid():N}@example.com";

    private async Task<(HttpClient client, Guid userId)> CreateAuthenticatedClientAsync()
    {
        var client = _factory.CreateClient();
        var email = UniqueEmail();
        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Str0ng!Passw0rd", "Test User"));
        await _factory.ConfirmUserAsync(email);
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "Str0ng!Passw0rd"));
        var loginBody = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginBody!.AccessToken);
        return (client, loginBody.User.Id);
    }

    private static string Sign(string body) =>
        Convert.ToHexStringLower(HMACSHA256.HashData(
            Encoding.UTF8.GetBytes(AppEventsWebApplicationFactory.TestWebhookSecret),
            Encoding.UTF8.GetBytes(body)));

    private async Task<HttpResponseMessage> PostWebhookAsync(string body, string? signature)
    {
        var client = _factory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/webhooks/lastlink")
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json"),
        };
        if (signature is not null)
        {
            request.Headers.Add("X-Lastlink-Signature", signature);
        }
        return await client.SendAsync(request);
    }

    [Fact]
    public async Task Webhook_WithInvalidSignature_Returns401()
    {
        var body = """{"order_id":"order-invalid-sig","status":"paid"}""";

        var response = await PostWebhookAsync(body, "not-a-real-signature");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Webhook_WithMissingSignature_Returns401()
    {
        var body = """{"order_id":"order-no-sig","status":"paid"}""";

        var response = await PostWebhookAsync(body, null);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Webhook_WithUnparseableBody_ReturnsBadRequest()
    {
        var body = "not json at all";

        var response = await PostWebhookAsync(body, Sign(body));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Webhook_WithValidSignatureAndMappedProduct_Returns200_AndGrantsEntitlement()
    {
        var (owner, userId) = await CreateAuthenticatedClientAsync();
        var orderId = $"order-{Guid.NewGuid():N}";
        var body = $$"""
            {"order_id":"{{orderId}}","reference":"{{userId}}","status":"paid","amount_cents":8900,"currency":"BRL","products":["{{MappedProductKey}}"]}
            """;

        var response = await PostWebhookAsync(body, Sign(body));

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var entitlements = await owner.GetFromJsonAsync<List<EntitlementResponse>>("/api/payments/entitlements");
        entitlements.Should().ContainSingle(e => e.FeatureKey == PremiumFeatureKeys.WeddingGroomsmenManual);
    }

    [Fact]
    public async Task Webhook_ReplayedWithSameOrderId_DoesNotGrantEntitlementTwice()
    {
        var (owner, userId) = await CreateAuthenticatedClientAsync();
        var orderId = $"order-{Guid.NewGuid():N}";
        var body = $$"""
            {"order_id":"{{orderId}}","reference":"{{userId}}","status":"paid","products":["{{MappedProductKey}}"]}
            """;

        await PostWebhookAsync(body, Sign(body));
        var replay = await PostWebhookAsync(body, Sign(body));

        replay.StatusCode.Should().Be(HttpStatusCode.OK);
        var entitlements = await owner.GetFromJsonAsync<List<EntitlementResponse>>("/api/payments/entitlements");
        entitlements.Should().HaveCount(1);
    }

    [Fact]
    public async Task Webhook_WithUnmappedProduct_Returns200_ButGrantsNoEntitlement()
    {
        var (owner, userId) = await CreateAuthenticatedClientAsync();
        var orderId = $"order-{Guid.NewGuid():N}";
        var body = $$"""
            {"order_id":"{{orderId}}","reference":"{{userId}}","status":"paid","products":["totally-unmapped-product"]}
            """;

        var response = await PostWebhookAsync(body, Sign(body));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var entitlements = await owner.GetFromJsonAsync<List<EntitlementResponse>>("/api/payments/entitlements");
        entitlements.Should().BeEmpty();
    }

    [Fact]
    public async Task Webhook_WithUnresolvableReference_Returns200_ButGrantsNoEntitlement()
    {
        var orderId = $"order-{Guid.NewGuid():N}";
        var body = $$"""
            {"order_id":"{{orderId}}","status":"paid","products":["{{MappedProductKey}}"]}
            """;

        var response = await PostWebhookAsync(body, Sign(body));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetEntitlements_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/payments/entitlements");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetEntitlements_WhenNoneGranted_ReturnsEmptyArray()
    {
        var (owner, _) = await CreateAuthenticatedClientAsync();

        var entitlements = await owner.GetFromJsonAsync<List<EntitlementResponse>>("/api/payments/entitlements");

        entitlements.Should().NotBeNull();
        entitlements.Should().BeEmpty();
    }
}
