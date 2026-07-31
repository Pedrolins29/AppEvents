using AppEvents.Domain.Payments;

namespace AppEvents.Application.Payments.Interfaces;

public interface IOrderRepository
{
    Task<Order?> GetByExternalOrderIdAsync(string externalOrderId, CancellationToken cancellationToken = default);

    Task AddAsync(Order order, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
