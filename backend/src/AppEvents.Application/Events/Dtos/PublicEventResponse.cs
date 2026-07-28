using AppEvents.Domain.Events;

namespace AppEvents.Application.Events.Dtos;

public record PublicEventResponse(
    string Name,
    string Slug,
    EventType EventType,
    DateTime EventDate,
    string? Description,
    string? Address,
    string? DressCode,
    IReadOnlyList<TimelineItemDto> TimelineItems,
    string? CoverImageUrl,
    string? FeaturedPhotoUrl,
    IReadOnlyList<string> GalleryImageUrls,
    string? ThemeKey);
