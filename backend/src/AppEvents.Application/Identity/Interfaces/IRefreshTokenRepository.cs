using AppEvents.Domain.Identity;

namespace AppEvents.Application.Identity.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);

    Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<RefreshToken>> GetActiveTokensForUserAsync(Guid userId, DateTime nowUtc, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
