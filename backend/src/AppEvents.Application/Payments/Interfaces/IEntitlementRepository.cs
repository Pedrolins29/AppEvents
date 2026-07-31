using AppEvents.Domain.Payments;

namespace AppEvents.Application.Payments.Interfaces;

public interface IEntitlementRepository
{
    Task AddAsync(Entitlement entitlement, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Entitlement>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
