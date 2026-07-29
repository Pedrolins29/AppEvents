using AppEvents.Application.Identity.Dtos;

namespace AppEvents.Application.Identity.Services;

public interface IAuthService
{
    Task<RegisterResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);

    Task<AuthResult> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken cancellationToken = default);

    Task<AuthResult> RefreshAsync(string rawRefreshToken, string? ipAddress, CancellationToken cancellationToken = default);

    Task LogoutAsync(string rawRefreshToken, CancellationToken cancellationToken = default);

    Task<UserProfileResponse> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<ConfirmEmailResponse> ConfirmEmailAsync(string rawToken, CancellationToken cancellationToken = default);

    Task ResendConfirmationAsync(string email, CancellationToken cancellationToken = default);
}
