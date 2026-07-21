using AppEvents.Domain.Identity;

namespace AppEvents.Application.Identity.Interfaces;

public record AccessToken(string Value, int ExpiresInSeconds);

public interface IJwtTokenService
{
    AccessToken GenerateAccessToken(User user);
}
