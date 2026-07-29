using System.Net;
using System.Net.Http.Json;
using System.Text.RegularExpressions;
using System.Web;
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

    private static string ExtractConfirmationToken(string emailHtmlBody)
    {
        var match = Regex.Match(emailHtmlBody, "token=([^\"&]+)");
        match.Success.Should().BeTrue("the confirmation email body should contain a token= link");
        return HttpUtility.UrlDecode(match.Groups[1].Value);
    }

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
    public async Task Register_WithHoneypotFilled_Returns400()
    {
        var client = _factory.CreateClient();
        var request = new RegisterRequest(UniqueEmail(), "Str0ng!Passw0rd", "Test User", "I am a bot");

        var response = await client.PostAsJsonAsync("/api/auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithValidCredentials_Returns200WithAccessTokenAndRefreshCookie()
    {
        var client = _factory.CreateClient();
        var email = UniqueEmail();
        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Str0ng!Passw0rd", "Test User"));
        await _factory.ConfirmUserAsync(email);

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
        await _factory.ConfirmUserAsync(email);
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
        await _factory.ConfirmUserAsync(email);
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
        await _factory.ConfirmUserAsync(email);
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
        await _factory.ConfirmUserAsync(email);
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "Str0ng!Passw0rd"));
        var rawCookieValue = loginResponse.Headers.GetValues("Set-Cookie").First().Split(';')[0];

        using var logoutRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/logout");
        logoutRequest.Headers.Add("Cookie", rawCookieValue);
        logoutRequest.Headers.Add("X-Requested-With", "AppEventsFrontend");
        var response = await client.SendAsync(logoutRequest);

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Register_SendsConfirmationEmailWithLink()
    {
        var client = _factory.CreateClient();
        var email = UniqueEmail();

        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Str0ng!Passw0rd", "Test User"));

        var sentEmails = _factory.EmailSender.Sent.Where(e => e.To == email).ToList();
        sentEmails.Should().HaveCount(1);
        sentEmails[0].HtmlBody.Should().Contain("/verify-email?token=");
    }

    [Fact]
    public async Task Register_WithPortugueseLocale_SendsPortugueseConfirmationEmail()
    {
        var client = _factory.CreateClient();
        var email = UniqueEmail();

        await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterRequest(email, "Str0ng!Passw0rd", "Test User", Locale: "pt"));

        var sentEmail = _factory.EmailSender.Sent.Single(e => e.To == email);
        sentEmail.Subject.Should().Be("Confirme sua conta AppEvents");
        sentEmail.HtmlBody.Should().Contain("Olá");
    }

    [Fact]
    public async Task Register_WithUnsupportedLocale_Returns400()
    {
        var client = _factory.CreateClient();
        var request = new RegisterRequest(UniqueEmail(), "Str0ng!Passw0rd", "Test User", Locale: "fr");

        var response = await client.PostAsJsonAsync("/api/auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithUnconfirmedAccount_Returns403()
    {
        var client = _factory.CreateClient();
        var email = UniqueEmail();
        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Str0ng!Passw0rd", "Test User"));

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "Str0ng!Passw0rd"));

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Login_WithUnconfirmedAccount_Returns403NotUnauthorized_DistinguishableFromWrongPassword()
    {
        var client = _factory.CreateClient();
        var email = UniqueEmail();
        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Str0ng!Passw0rd", "Test User"));

        var wrongPasswordResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "WrongPassword!1"));
        var unconfirmedResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "Str0ng!Passw0rd"));

        wrongPasswordResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        unconfirmedResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task ConfirmEmail_WithTokenFromRegistrationEmail_ActivatesAccountAndAllowsLogin()
    {
        var client = _factory.CreateClient();
        var email = UniqueEmail();
        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Str0ng!Passw0rd", "Test User"));
        var sentEmail = _factory.EmailSender.Sent.Single(e => e.To == email);
        var token = ExtractConfirmationToken(sentEmail.HtmlBody);

        var confirmResponse = await client.PostAsJsonAsync("/api/auth/confirm-email", new ConfirmEmailRequest(token));

        confirmResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var confirmBody = await confirmResponse.Content.ReadFromJsonAsync<ConfirmEmailResponse>();
        confirmBody!.AlreadyConfirmed.Should().BeFalse();

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "Str0ng!Passw0rd"));
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ConfirmEmail_CalledTwiceWithSameToken_IsIdempotent()
    {
        var client = _factory.CreateClient();
        var email = UniqueEmail();
        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Str0ng!Passw0rd", "Test User"));
        var sentEmail = _factory.EmailSender.Sent.Single(e => e.To == email);
        var token = ExtractConfirmationToken(sentEmail.HtmlBody);

        var firstResponse = await client.PostAsJsonAsync("/api/auth/confirm-email", new ConfirmEmailRequest(token));
        var secondResponse = await client.PostAsJsonAsync("/api/auth/confirm-email", new ConfirmEmailRequest(token));

        firstResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        secondResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        (await firstResponse.Content.ReadFromJsonAsync<ConfirmEmailResponse>())!.AlreadyConfirmed.Should().BeFalse();
        (await secondResponse.Content.ReadFromJsonAsync<ConfirmEmailResponse>())!.AlreadyConfirmed.Should().BeTrue();
    }

    [Fact]
    public async Task ConfirmEmail_WithGarbageToken_Returns404()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/confirm-email", new ConfirmEmailRequest("not-a-real-token"));

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ResendConfirmation_ForUnconfirmedAccount_SendsNewEmailWithDifferentToken()
    {
        var client = _factory.CreateClient();
        var email = UniqueEmail();
        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Str0ng!Passw0rd", "Test User"));
        var firstToken = ExtractConfirmationToken(_factory.EmailSender.Sent.Single(e => e.To == email).HtmlBody);

        var resendResponse = await client.PostAsJsonAsync("/api/auth/resend-confirmation", new ResendConfirmationRequest(email));

        resendResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
        // ConcurrentBag enumeration order is unspecified, so identify "the new one" by set
        // difference rather than by index.
        var tokensToUser = _factory.EmailSender.Sent.Where(e => e.To == email)
            .Select(e => ExtractConfirmationToken(e.HtmlBody)).ToList();
        tokensToUser.Should().HaveCount(2);
        tokensToUser.Should().Contain(firstToken);
        var secondToken = tokensToUser.Single(t => t != firstToken);

        // The superseded first token no longer confirms the account.
        var oldTokenResponse = await client.PostAsJsonAsync("/api/auth/confirm-email", new ConfirmEmailRequest(firstToken));
        oldTokenResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);

        var newTokenResponse = await client.PostAsJsonAsync("/api/auth/confirm-email", new ConfirmEmailRequest(secondToken));
        newTokenResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ResendConfirmation_ForUnknownEmail_StillReturns204AndSendsNothing()
    {
        var client = _factory.CreateClient();
        var email = UniqueEmail();

        var response = await client.PostAsJsonAsync("/api/auth/resend-confirmation", new ResendConfirmationRequest(email));

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        _factory.EmailSender.Sent.Should().NotContain(e => e.To == email);
    }

    [Fact]
    public async Task ResendConfirmation_ForAlreadyConfirmedAccount_Returns204AndSendsNothing()
    {
        var client = _factory.CreateClient();
        var email = UniqueEmail();
        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Str0ng!Passw0rd", "Test User"));
        await _factory.ConfirmUserAsync(email);

        var response = await client.PostAsJsonAsync("/api/auth/resend-confirmation", new ResendConfirmationRequest(email));

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        var emailsToUser = _factory.EmailSender.Sent.Where(e => e.To == email).ToList();
        emailsToUser.Should().HaveCount(1, "only the original registration email, no resend");
    }
}
