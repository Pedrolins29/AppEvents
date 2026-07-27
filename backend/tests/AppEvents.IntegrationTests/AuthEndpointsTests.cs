using System.Net;
using System.Net.Http.Json;
using AppEvents.Application.Identity.Dtos;
using FluentAssertions;

namespace AppEvents.IntegrationTests;

public class AuthEndpointsTests : IClassFixture<AppEventsWebApplicationFactory>
{
    private readonly AppEventsWebApplicationFactory _factory;

    public AuthEndpointsTests(AppEventsWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private static string UniqueEmail() => $"test-{Guid.NewGuid():N}@example.com";

    [Fact]
    public async Task Register_WithValidRequest_Returns201WithoutPasswordHash()
    {
        var client = _factory.CreateClient();
        var request = new RegisterRequest(UniqueEmail(), "Str0ng!Passw0rd", "Test User");

        var response = await client.PostAsJsonAsync("/api/auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().NotContain("password", "the response must never leak the password or its hash");
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_Returns409()
    {
        var client = _factory.CreateClient();
        var email = UniqueEmail();
        var request = new RegisterRequest(email, "Str0ng!Passw0rd", "Test User");
        await client.PostAsJsonAsync("/api/auth/register", request);

        var response = await client.PostAsJsonAsync("/api/auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Register_WithWeakPassword_Returns400()
    {
        var client = _factory.CreateClient();
        var request = new RegisterRequest(UniqueEmail(), "weak", "Test User");

        var response = await client.PostAsJsonAsync("/api/auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithValidCredentials_Returns200WithAccessTokenAndRefreshCookie()
    {
        var client = _factory.CreateClient();
        var email = UniqueEmail();
        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Str0ng!Passw0rd", "Test User"));

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "Str0ng!Passw0rd"));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<LoginResponse>();
        body!.AccessToken.Should().NotBeNullOrEmpty();
        response.Headers.Should().Contain(h => h.Key == "Set-Cookie");
    }

    [Fact]
    public async Task Login_WithInvalidPassword_Returns401()
    {
        var client = _factory.CreateClient();
        var email = UniqueEmail();
        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Str0ng!Passw0rd", "Test User"));

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "WrongPassword!1"));

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Refresh_WithValidCookie_RotatesTokenAndOldCookieIsRejected()
    {
        var client = _factory.CreateDefaultClient();
        var email = UniqueEmail();
        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Str0ng!Passw0rd", "Test User"));
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "Str0ng!Passw0rd"));

        var setCookieHeader = loginResponse.Headers.GetValues("Set-Cookie").First();
        var rawCookieValue = setCookieHeader.Split(';')[0];

        using var refreshRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
        refreshRequest.Headers.Add("Cookie", rawCookieValue);
        refreshRequest.Headers.Add("X-Requested-With", "AppEventsFrontend");
        var refreshResponse = await client.SendAsync(refreshRequest);

        refreshResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        using var reuseRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
        reuseRequest.Headers.Add("Cookie", rawCookieValue);
        reuseRequest.Headers.Add("X-Requested-With", "AppEventsFrontend");
        var reuseResponse = await client.SendAsync(reuseRequest);

        reuseResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Refresh_WithoutCsrfHeader_Returns401EvenWithValidCookie()
    {
        var client = _factory.CreateDefaultClient();
        var email = UniqueEmail();
        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Str0ng!Passw0rd", "Test User"));
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "Str0ng!Passw0rd"));
        var rawCookieValue = loginResponse.Headers.GetValues("Set-Cookie").First().Split(';')[0];

        using var refreshRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
        refreshRequest.Headers.Add("Cookie", rawCookieValue);
        // Deliberately no X-Requested-With header — simulates a forged cross-site request
        // (e.g. a plain HTML form) riding on the SameSite=None cookie.
        var response = await client.SendAsync(refreshRequest);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Logout_WithoutCsrfHeader_Returns401EvenWithValidCookie()
    {
        var client = _factory.CreateDefaultClient();
        var email = UniqueEmail();
        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Str0ng!Passw0rd", "Test User"));
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "Str0ng!Passw0rd"));
        var rawCookieValue = loginResponse.Headers.GetValues("Set-Cookie").First().Split(';')[0];

        using var logoutRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/logout");
        logoutRequest.Headers.Add("Cookie", rawCookieValue);
        var response = await client.SendAsync(logoutRequest);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Logout_WithCsrfHeaderAndValidCookie_Returns204()
    {
        var client = _factory.CreateDefaultClient();
        var email = UniqueEmail();
        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Str0ng!Passw0rd", "Test User"));
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "Str0ng!Passw0rd"));
        var rawCookieValue = loginResponse.Headers.GetValues("Set-Cookie").First().Split(';')[0];

        using var logoutRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/logout");
        logoutRequest.Headers.Add("Cookie", rawCookieValue);
        logoutRequest.Headers.Add("X-Requested-With", "AppEventsFrontend");
        var response = await client.SendAsync(logoutRequest);

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }
}
