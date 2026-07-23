using AppEvents.Domain.Events;

namespace AppEvents.Application.Events.Dtos;

public record PublicEventResponse(
    string Name,
    string Slug,
    EventType EventType,
    DateTime EventDate,
    string? Description,
    string? Address,
    string? CoverImageUrl,
    IReadOnlyList<string> GalleryImageUrls,
    string? ThemeKey);
