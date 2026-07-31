using AppEvents.Application.Rsvp.Interfaces;
using AppEvents.Domain.Rsvp;
using AppEvents.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppEvents.Infrastructure.Rsvp;

public class GuestRepository : IGuestRepository
{
    private readonly AppEventsDbContext _dbContext;

    public GuestRepository(AppEventsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(Guest guest, CancellationToken cancellationToken = default) =>
        await _dbContext.Guests.AddAsync(guest, cancellationToken);

    public async Task<IReadOnlyList<Guest>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default) =>
        await _dbContext.Guests
            .Where(g => g.EventId == eventId)
            .ToListAsync(cancellationToken);

    public Task<Guest?> GetByIdAsync(Guid guestId, CancellationToken cancellationToken = default) =>
        _dbContext.Guests.FirstOrDefaultAsync(g => g.Id == guestId, cancellationToken);

    public Task<Guest?> GetByEventAndTokenAsync(Guid eventId, string inviteToken, CancellationToken cancellationToken = default) =>
        _dbContext.Guests.FirstOrDefaultAsync(g => g.EventId == eventId && g.InviteToken == inviteToken, cancellationToken);

    public void Remove(Guest guest) => _dbContext.Guests.Remove(guest);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _dbContext.SaveChangesAsync(cancellationToken);
}
