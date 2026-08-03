namespace AppEvents.Application.Identity.Dtos;

/// <summary>
/// AccessToken/ExpiresInSeconds/User are populated only when a fresh (non-replay) confirmation
/// also issued a session — mirrors LoginResponse's shape so the frontend can treat it the same
/// way. The raw refresh token itself never appears here; it goes only into the HttpOnly cookie.
/// </summary>
public record ConfirmEmailResponse(
    bool AlreadyConfirmed,
    string? AccessToken = null,
    int? ExpiresInSeconds = null,
    UserProfileResponse? User = null);
