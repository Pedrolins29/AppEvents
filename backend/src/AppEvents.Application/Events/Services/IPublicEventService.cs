using AppEvents.Application.Events.Dtos;

namespace AppEvents.Application.Events.Services;

public interface IPublicEventService
{
    Task<PublicEventResponse> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
}
