namespace AppEvents.Application.Identity.Dtos;

public record RegisterResponse(Guid Id, string Email, string FullName, string Role);
