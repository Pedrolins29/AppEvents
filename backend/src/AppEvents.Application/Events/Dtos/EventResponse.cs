using AppEvents.Domain.Events;

namespace AppEvents.Application.Events.Dtos;

public record EventResponse(
    Guid Id,
    string Name,
    string Slug,
    EventType EventType,
    DateTime EventDate,
    string? Description,
    string? Address,
    string? CoverImageUrl,
    string? FeaturedPhotoUrl,
    bool IsPublished,
    IReadOnlyList<EventImageResponse> GalleryImages,
    Guid UserId,
    Guid? TemplateId,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc);

public record EventImageResponse(Guid Id, string ImageUrl);
