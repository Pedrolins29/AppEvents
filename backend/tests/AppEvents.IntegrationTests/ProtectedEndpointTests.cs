using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using AppEvents.Application.Identity.Dtos;
using FluentAssertions;

namespace AppEvents.IntegrationTests;

public class ProtectedEndpointTests : IClassFixture<AppEventsWebApplicationFactory>
{
    private readonly AppEventsWebApplicationFactory _factory;

    public ProtectedEndpointTests(AppEventsWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private static string UniqueEmail() => $"test-{Guid.NewGuid():N}@example.com";

    [Fact]
    public async Task Me_WithoutAuthorizationHeader_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/users/me");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Me_WithValidBearerToken_Returns200WithMatchingProfile()
    {
        var client = _factory.CreateClient();
        var email = UniqueEmail();
        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Str0ng!Passw0rd", "Test User"));
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "Str0ng!Passw0rd"));
        var loginBody = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginBody!.AccessToken);
        var response = await client.GetAsync("/api/users/me");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var profile = await response.Content.ReadFromJsonAsync<UserProfileResponse>();
        profile!.Email.Should().Be(email);
        profile.Role.Should().Be("Customer");
    }

    [Fact]
    public async Task Me_WithInvalidBearerToken_Returns401()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "not-a-valid-token");

        var response = await client.GetAsync("/api/users/me");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
