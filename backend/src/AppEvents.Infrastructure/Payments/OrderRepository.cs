using AppEvents.Application.Payments.Interfaces;
using AppEvents.Domain.Payments;
using AppEvents.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppEvents.Infrastructure.Payments;

public class OrderRepository : IOrderRepository
{
    private readonly AppEventsDbContext _dbContext;

    public OrderRepository(AppEventsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Order?> GetByExternalOrderIdAsync(string externalOrderId, CancellationToken cancellationToken = default) =>
        _dbContext.Orders.FirstOrDefaultAsync(o => o.ExternalOrderId == externalOrderId, cancellationToken);

    public async Task AddAsync(Order order, CancellationToken cancellationToken = default) =>
        await _dbContext.Orders.AddAsync(order, cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _dbContext.SaveChangesAsync(cancellationToken);
}
