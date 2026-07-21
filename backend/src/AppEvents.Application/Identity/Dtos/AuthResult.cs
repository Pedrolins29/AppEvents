namespace AppEvents.Application.Identity.Dtos;

/// <summary>
/// Internal service-layer result. The raw refresh token must never be serialized to a
/// JSON response body — the Api layer extracts it to set the HttpOnly cookie only.
/// </summary>
public record AuthResult(
    string AccessToken,
    int ExpiresInSeconds,
    string RefreshToken,
    DateTime RefreshTokenExpiresAtUtc,
    UserProfileResponse User);
