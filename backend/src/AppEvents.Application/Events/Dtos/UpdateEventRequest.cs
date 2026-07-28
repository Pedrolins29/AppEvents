using AppEvents.Domain.Events;

namespace AppEvents.Application.Events.Dtos;

public record UpdateEventRequest(
    string Name,
    string Slug,
    EventType EventType,
    DateTime EventDate,
    string? Description,
    string? Address,
    string? DressCode,
    IReadOnlyList<TimelineItemDto>? TimelineItems,
    Guid? TemplateId);
