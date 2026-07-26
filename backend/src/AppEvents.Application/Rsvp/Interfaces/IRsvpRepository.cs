using AppEvents.Domain.Rsvp;

namespace AppEvents.Application.Rsvp.Interfaces;

public interface IRsvpRepository
{
    Task AddAsync(RsvpResponse response, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<RsvpResponse>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
