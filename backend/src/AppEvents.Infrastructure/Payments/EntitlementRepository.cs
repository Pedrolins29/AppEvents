using AppEvents.Application.Payments.Interfaces;
using AppEvents.Domain.Payments;
using AppEvents.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppEvents.Infrastructure.Payments;

public class EntitlementRepository : IEntitlementRepository
{
    private readonly AppEventsDbContext _dbContext;

    public EntitlementRepository(AppEventsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(Entitlement entitlement, CancellationToken cancellationToken = default) =>
        await _dbContext.Entitlements.AddAsync(entitlement, cancellationToken);

    public async Task<IReadOnlyList<Entitlement>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
        await _dbContext.Entitlements
            .Where(e => e.UserId == userId)
            .ToListAsync(cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _dbContext.SaveChangesAsync(cancellationToken);
}
