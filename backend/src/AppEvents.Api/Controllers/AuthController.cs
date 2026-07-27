using AppEvents.Api.Extensions;
using AppEvents.Application.Common.Exceptions;
using AppEvents.Application.Identity.Dtos;
using AppEvents.Application.Identity.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AppEvents.Api.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting(RateLimitingExtensions.AuthPolicy)]
public class AuthController : ControllerBase
{
    private const string RefreshTokenCookieName = "appevents_rt";
    private const string CsrfHeaderName = "X-Requested-With";
    private const string CsrfHeaderValue = "AppEventsFrontend";

    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<RegisterResponse>> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var response = await _authService.RegisterAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, GetClientIp(), cancellationToken);
        SetRefreshTokenCookie(result.RefreshToken, result.RefreshTokenExpiresAtUtc);
        return Ok(new LoginResponse(result.AccessToken, result.ExpiresInSeconds, result.User));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<LoginResponse>> Refresh(CancellationToken cancellationToken)
    {
        RequireCsrfHeader();

        var rawToken = Request.Cookies[RefreshTokenCookieName];
        if (string.IsNullOrEmpty(rawToken))
        {
            throw new UnauthorizedAppException("No refresh token was provided.");
        }

        var result = await _authService.RefreshAsync(rawToken, GetClientIp(), cancellationToken);
        SetRefreshTokenCookie(result.RefreshToken, result.RefreshTokenExpiresAtUtc);
        return Ok(new LoginResponse(result.AccessToken, result.ExpiresInSeconds, result.User));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        RequireCsrfHeader();

        var rawToken = Request.Cookies[RefreshTokenCookieName];
        if (!string.IsNullOrEmpty(rawToken))
        {
            await _authService.LogoutAsync(rawToken, cancellationToken);
        }

        Response.Cookies.Delete(RefreshTokenCookieName, new CookieOptions { Path = "/api/auth" });
        return NoContent();
    }

    private void SetRefreshTokenCookie(string rawToken, DateTime expiresAtUtc)
    {
        // SameSite=None: the frontend (Next.js) and this API are separate origins (different
        // ports in dev, likely different subdomains in prod), which Chrome's schemeful-same-site
        // rules treat as cross-site even when the hostname matches (e.g. http://localhost:3000
        // vs https://localhost:5001) — SameSite=Lax silently drops the cookie on those requests.
        // CORS (AllowedOrigin, no wildcard) is the actual cross-origin control here: an attacker
        // site cannot read this endpoint's response even if it can trigger a cross-site request.
        Response.Cookies.Append(RefreshTokenCookieName, rawToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/api/auth",
            Expires = expiresAtUtc,
        });
    }

    private string? GetClientIp() => HttpContext.Connection.RemoteIpAddress?.ToString();

    // The refresh cookie is SameSite=None (required cross-origin, see SetRefreshTokenCookie),
    // so it rides along on a forged cross-site request too — a plain HTML form can trigger
    // these two cookie-authenticated actions with zero JS. A form can't set custom headers, and
    // a script-based attempt from another origin fails our CORS allowlist before it's even
    // sent. Only these two actions need this: every other endpoint is bearer-JWT-authenticated
    // and structurally immune (a forged request can't carry an Authorization header it doesn't
    // have).
    private void RequireCsrfHeader()
    {
        if (Request.Headers[CsrfHeaderName] != CsrfHeaderValue)
        {
            throw new UnauthorizedAppException("Missing or invalid anti-forgery header.");
        }
    }
}
