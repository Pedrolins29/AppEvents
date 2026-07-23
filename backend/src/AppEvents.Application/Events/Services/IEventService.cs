using AppEvents.Application.Events.Dtos;

namespace AppEvents.Application.Events.Services;

public interface IEventService
{
    Task<EventResponse> CreateAsync(Guid userId, CreateEventRequest request, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<EventResponse>> GetMyEventsAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<EventResponse> GetByIdAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default);

    Task<EventResponse> UpdateAsync(Guid userId, Guid eventId, UpdateEventRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default);

    Task<EventResponse> SetCoverImageAsync(Guid userId, Guid eventId, string coverImageUrl, CancellationToken cancellationToken = default);

    Task<EventResponse> PublishAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default);

    Task<EventResponse> UnpublishAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default);

    Task<EventResponse> AddGalleryImageAsync(Guid userId, Guid eventId, string imageUrl, CancellationToken cancellationToken = default);

    Task<EventResponse> RemoveGalleryImageAsync(Guid userId, Guid eventId, Guid imageId, CancellationToken cancellationToken = default);
}
