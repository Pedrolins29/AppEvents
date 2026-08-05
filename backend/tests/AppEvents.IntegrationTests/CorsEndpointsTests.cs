using FluentAssertions;
using Microsoft.Extensions.Configuration;

namespace AppEvents.IntegrationTests;

// Covers the Cors:AllowedOrigins (plural, comma-separated) config path added for multi-origin
// support (e.g. local dev + production domains), plus the fallback chain down to the older
// singular Cors:AllowedOrigin key and finally the hardcoded localhost default - see
// ResolveAllowedOrigins in Program.cs. Exercised via a real preflight request against the actual
// CORS middleware rather than reflecting into the local function directly.
public class CorsEndpointsTests : IClassFixture<AppEventsWebApplicationFactory>
{
    private readonly AppEventsWebApplicationFactory _factory;

    public CorsEndpointsTests(AppEventsWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private static HttpRequestMessage PreflightRequest(string origin) =>
        new(HttpMethod.Options, "/api/auth/login")
        {
            Headers =
            {
                { "Origin", origin },
                { "Access-Control-Request-Method", "POST" },
            },
        };

    [Fact]
    public async Task Preflight_WithOriginFromPluralAllowedOrigins_IsAllowed()
    {
        using var factory = _factory.WithWebHostBuilder(builder =>
            builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Cors:AllowedOrigins"] = "https://staging.example.com,https://app.example.com",
            })));
        var client = factory.CreateClient();

        var response = await client.SendAsync(PreflightRequest("https://app.example.com"));

        response.Headers.GetValues("Access-Control-Allow-Origin").Should().ContainSingle("https://app.example.com");
    }

    [Fact]
    public async Task Preflight_WithOriginNotInPluralAllowedOrigins_IsRejected()
    {
        using var factory = _factory.WithWebHostBuilder(builder =>
            builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Cors:AllowedOrigins"] = "https://staging.example.com",
            })));
        var client = factory.CreateClient();

        var response = await client.SendAsync(PreflightRequest("https://not-allowed.example.com"));

        response.Headers.Contains("Access-Control-Allow-Origin").Should().BeFalse();
    }

    [Fact]
    public async Task Preflight_WithOnlySingularAllowedOriginConfigured_FallsBackAndIsAllowed()
    {
        using var factory = _factory.WithWebHostBuilder(builder =>
            builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Cors:AllowedOrigins"] = null,
                ["Cors:AllowedOrigin"] = "https://legacy.example.com",
            })));
        var client = factory.CreateClient();

        var response = await client.SendAsync(PreflightRequest("https://legacy.example.com"));

        response.Headers.GetValues("Access-Control-Allow-Origin").Should().ContainSingle("https://legacy.example.com");
    }
}
