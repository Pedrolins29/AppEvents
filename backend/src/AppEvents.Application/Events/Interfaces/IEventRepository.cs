using AppEvents.Domain.Events;

namespace AppEvents.Application.Events.Interfaces;

public interface IEventRepository
{
    Task<Event?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Event>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<Event?> GetPublishedBySlugAsync(string slug, CancellationToken cancellationToken = default);

    Task<bool> SlugExistsAsync(string slug, Guid? excludeEventId = null, CancellationToken cancellationToken = default);

    Task AddAsync(Event @event, CancellationToken cancellationToken = default);

    void AddGalleryImage(EventImage image);

    void Remove(Event @event);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
