namespace AppEvents.Application.Identity.Dtos;

public record UserProfileResponse(Guid Id, string Email, string FullName, string Role);
