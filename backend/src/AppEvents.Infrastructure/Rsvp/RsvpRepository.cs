using AppEvents.Application.Rsvp.Interfaces;
using AppEvents.Domain.Rsvp;
using AppEvents.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppEvents.Infrastructure.Rsvp;

public class RsvpRepository : IRsvpRepository
{
    private readonly AppEventsDbContext _dbContext;

    public RsvpRepository(AppEventsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(RsvpResponse response, CancellationToken cancellationToken = default) =>
        await _dbContext.RsvpResponses.AddAsync(response, cancellationToken);

    public async Task<IReadOnlyList<RsvpResponse>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default) =>
        await _dbContext.RsvpResponses
            .Where(r => r.EventId == eventId)
            .ToListAsync(cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _dbContext.SaveChangesAsync(cancellationToken);
}
