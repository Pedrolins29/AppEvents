using AppEvents.Application.Common.Exceptions;
using AppEvents.Application.Events.Dtos;
using AppEvents.Application.Events.Interfaces;

namespace AppEvents.Application.Events.Services;

/// <summary>
/// A nonexistent slug and an unpublished event both throw NotFoundException (404) — same
/// info-disclosure-safe pattern as EventService's ownership checks, so a scraper can't tell
/// "no such event" from "exists but not public yet."
/// </summary>
public class PublicEventService : IPublicEventService
{
    private readonly IEventRepository _eventRepository;

    public PublicEventService(IEventRepository eventRepository)
    {
        _eventRepository = eventRepository;
    }

    public async Task<PublicEventResponse> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var @event = await _eventRepository.GetPublishedBySlugAsync(slug.Trim().ToLowerInvariant(), cancellationToken)
            ?? throw new NotFoundException("Event not found.");

        return new PublicEventResponse(
            @event.Name,
            @event.Slug,
            @event.EventType,
            @event.EventDate,
            @event.Description,
            @event.Address,
            @event.DressCode,
            @event.TimelineItems.Select(i => new TimelineItemDto(i.Time, i.Label)).ToList(),
            @event.CoverImageUrl,
            @event.FeaturedPhotoUrl,
            @event.GalleryImages.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).ToList(),
            @event.Template?.Theme);
    }
}
