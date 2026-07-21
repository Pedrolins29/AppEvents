using AppEvents.Application.Identity.Interfaces;
using AppEvents.Domain.Identity;
using AppEvents.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppEvents.Infrastructure.Identity;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly AppEventsDbContext _dbContext;

    public RefreshTokenRepository(AppEventsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default) =>
        _dbContext.RefreshTokens
            .Include(rt => rt.User)
            .ThenInclude(u => u!.Role)
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, cancellationToken);

    public async Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default) =>
        await _dbContext.RefreshTokens.AddAsync(refreshToken, cancellationToken);

    public async Task<IReadOnlyList<RefreshToken>> GetActiveTokensForUserAsync(Guid userId, DateTime nowUtc, CancellationToken cancellationToken = default) =>
        await _dbContext.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.RevokedAtUtc == null && rt.ExpiresAtUtc > nowUtc)
            .ToListAsync(cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _dbContext.SaveChangesAsync(cancellationToken);
}
