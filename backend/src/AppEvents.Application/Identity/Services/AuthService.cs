using AppEvents.Application.Common.Exceptions;
using AppEvents.Application.Identity.Dtos;
using AppEvents.Application.Identity.Interfaces;
using AppEvents.Domain.Identity;
using Microsoft.Extensions.Logging;

namespace AppEvents.Application.Identity.Services;

/// <summary>
/// Assumes IUserRepository and IRefreshTokenRepository are registered against the same
/// scoped DbContext instance, so a SaveChangesAsync call on either repository persists
/// pending changes made through both (e.g. a User mutation flushed by a refresh-token save).
/// </summary>
public class AuthService : IAuthService
{
    private const int RefreshTokenDays = 14;
    private const string GenericLoginFailureMessage = "Invalid email or password.";

    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        IDateTimeProvider dateTimeProvider,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _dateTimeProvider = dateTimeProvider;
        _logger = logger;
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = NormalizeEmail(request.Email);

        if (await _userRepository.EmailExistsAsync(normalizedEmail, cancellationToken))
        {
            throw new ConflictException("An account with this email already exists.");
        }

        var customerRole = await _userRepository.GetRoleByNameAsync(RoleNames.Customer, cancellationToken)
            ?? throw new InvalidOperationException($"Role '{RoleNames.Customer}' is not seeded.");

        var user = new User
        {
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.Hash(request.Password),
            FullName = request.FullName.Trim(),
            RoleId = customerRole.Id,
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _userRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Audit: registration succeeded for user {UserId} ({Email})", user.Id, user.Email);

        return new RegisterResponse(user.Id, user.Email, user.FullName, customerRole.Name);
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        var now = _dateTimeProvider.UtcNow;

        var user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
        if (user is null)
        {
            _logger.LogWarning("Audit: login failed for {Email} from {ClientIp} — no such account", normalizedEmail, ipAddress);
            throw new UnauthorizedAppException(GenericLoginFailureMessage);
        }

        if (user.IsLockedOut(now))
        {
            _logger.LogWarning("Audit: login rejected for user {UserId} — account locked until {LockoutEndUtc}", user.Id, user.LockoutEndUtc);
            throw new UnauthorizedAppException(GenericLoginFailureMessage);
        }

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            user.RegisterFailedLogin(now);
            await _userRepository.SaveChangesAsync(cancellationToken);

            if (user.IsLockedOut(now))
            {
                _logger.LogWarning("Audit: account locked for user {UserId} until {LockoutEndUtc}", user.Id, user.LockoutEndUtc);
            }
            else
            {
                _logger.LogWarning(
                    "Audit: login failed for {Email} from {ClientIp} — attempt {AttemptCount}",
                    normalizedEmail, ipAddress, user.FailedLoginAttempts);
            }

            throw new UnauthorizedAppException(GenericLoginFailureMessage);
        }

        user.RegisterSuccessfulLogin();
        var result = await IssueTokensAsync(user, ipAddress, cancellationToken);

        _logger.LogInformation("Audit: login succeeded for user {UserId} from {ClientIp}", user.Id, ipAddress);

        return result;
    }

    public async Task<AuthResult> RefreshAsync(string rawRefreshToken, string? ipAddress, CancellationToken cancellationToken = default)
    {
        var now = _dateTimeProvider.UtcNow;
        var tokenHash = RefreshTokenGenerator.Hash(rawRefreshToken);

        var presentedToken = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);
        if (presentedToken is null)
        {
            throw new UnauthorizedAppException("Invalid refresh token.");
        }

        if (presentedToken.RevokedAtUtc is not null)
        {
            _logger.LogWarning(
                "Audit: refresh token reuse detected for user {UserId} — all tokens revoked", presentedToken.UserId);
            await RevokeAllActiveTokensAsync(presentedToken.UserId, ipAddress, now, cancellationToken);
            throw new UnauthorizedAppException("Refresh token has already been used. Please log in again.");
        }

        if (!presentedToken.IsActive(now))
        {
            throw new UnauthorizedAppException("Refresh token has expired.");
        }

        var user = presentedToken.User ?? await _userRepository.GetByIdAsync(presentedToken.UserId, cancellationToken)
            ?? throw new UnauthorizedAppException("Invalid refresh token.");

        var newRawToken = RefreshTokenGenerator.GenerateRawToken();
        var newTokenHash = RefreshTokenGenerator.Hash(newRawToken);

        presentedToken.RevokedAtUtc = now;
        presentedToken.RevokedByIp = ipAddress;
        presentedToken.ReplacedByTokenHash = newTokenHash;

        var newRefreshToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = newTokenHash,
            ExpiresAtUtc = now.AddDays(RefreshTokenDays),
            CreatedByIp = ipAddress,
        };

        await _refreshTokenRepository.AddAsync(newRefreshToken, cancellationToken);
        await _refreshTokenRepository.SaveChangesAsync(cancellationToken);

        var accessToken = _jwtTokenService.GenerateAccessToken(user);

        _logger.LogInformation("Audit: token refreshed for user {UserId}", user.Id);

        return new AuthResult(
            accessToken.Value,
            accessToken.ExpiresInSeconds,
            newRawToken,
            newRefreshToken.ExpiresAtUtc,
            ToProfile(user));
    }

    public async Task LogoutAsync(string rawRefreshToken, CancellationToken cancellationToken = default)
    {
        var tokenHash = RefreshTokenGenerator.Hash(rawRefreshToken);
        var token = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

        if (token is null || token.RevokedAtUtc is not null)
        {
            return;
        }

        token.RevokedAtUtc = _dateTimeProvider.UtcNow;
        await _refreshTokenRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task<UserProfileResponse> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        return ToProfile(user);
    }

    private async Task<AuthResult> IssueTokensAsync(User user, string? ipAddress, CancellationToken cancellationToken)
    {
        var now = _dateTimeProvider.UtcNow;
        var accessToken = _jwtTokenService.GenerateAccessToken(user);

        var rawRefreshToken = RefreshTokenGenerator.GenerateRawToken();
        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = RefreshTokenGenerator.Hash(rawRefreshToken),
            ExpiresAtUtc = now.AddDays(RefreshTokenDays),
            CreatedByIp = ipAddress,
        };

        await _refreshTokenRepository.AddAsync(refreshToken, cancellationToken);
        await _refreshTokenRepository.SaveChangesAsync(cancellationToken);

        return new AuthResult(
            accessToken.Value,
            accessToken.ExpiresInSeconds,
            rawRefreshToken,
            refreshToken.ExpiresAtUtc,
            ToProfile(user));
    }

    private async Task RevokeAllActiveTokensAsync(Guid userId, string? ipAddress, DateTime now, CancellationToken cancellationToken)
    {
        var activeTokens = await _refreshTokenRepository.GetActiveTokensForUserAsync(userId, now, cancellationToken);
        foreach (var token in activeTokens)
        {
            token.RevokedAtUtc = now;
            token.RevokedByIp = ipAddress;
        }

        await _refreshTokenRepository.SaveChangesAsync(cancellationToken);
    }

    private static UserProfileResponse ToProfile(User user) =>
        new(user.Id, user.Email, user.FullName, user.Role?.Name ?? string.Empty);

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
