namespace AppEvents.Application.Identity.Dtos;

public record LoginResponse(string AccessToken, int ExpiresInSeconds, UserProfileResponse User);
