using AppEvents.Domain.Rsvp;

namespace AppEvents.Application.Rsvp.Interfaces;

public interface IGuestRepository
{
    Task AddAsync(Guest guest, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Guest>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default);

    Task<Guest?> GetByIdAsync(Guid guestId, CancellationToken cancellationToken = default);

    // Looks up a guest by their personal-link token, scoped to the event so a token from one event
    // can't resolve against another.
    Task<Guest?> GetByEventAndTokenAsync(Guid eventId, string inviteToken, CancellationToken cancellationToken = default);

    void Remove(Guest guest);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
