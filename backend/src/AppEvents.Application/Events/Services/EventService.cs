using AppEvents.Application.Common.Exceptions;
using AppEvents.Application.Events.Dtos;
using AppEvents.Application.Events.Interfaces;
using AppEvents.Application.Identity.Interfaces;
using AppEvents.Application.Templates.Interfaces;
using AppEvents.Domain.Events;
using Microsoft.Extensions.Logging;

namespace AppEvents.Application.Events.Services;

/// <summary>
/// Ownership failures (GetById/Update/Delete on another user's event) throw NotFoundException
/// (404), not a 403 — this avoids confirming to a caller that an event id exists but isn't
/// theirs, satisfying A01 without an information-disclosure side channel.
/// </summary>
public class EventService : IEventService
{
    private const int MaxGalleryImages = 10;

    private readonly IEventRepository _eventRepository;
    private readonly ITemplateRepository _templateRepository;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly ILogger<EventService> _logger;

    public EventService(
        IEventRepository eventRepository,
        ITemplateRepository templateRepository,
        IDateTimeProvider dateTimeProvider,
        ILogger<EventService> logger)
    {
        _eventRepository = eventRepository;
        _templateRepository = templateRepository;
        _dateTimeProvider = dateTimeProvider;
        _logger = logger;
    }

    public async Task<EventResponse> CreateAsync(Guid userId, CreateEventRequest request, CancellationToken cancellationToken = default)
    {
        var slug = NormalizeSlug(request.Slug);

        if (await _eventRepository.SlugExistsAsync(slug, cancellationToken: cancellationToken))
        {
            throw new ConflictException("An event with this slug already exists.");
        }

        await EnsureTemplateExistsAsync(request.TemplateId, cancellationToken);

        var now = _dateTimeProvider.UtcNow;
        var @event = new Event
        {
            Name = request.Name.Trim(),
            Slug = slug,
            EventType = request.EventType,
            EventDate = request.EventDate,
            Description = request.Description?.Trim(),
            Address = request.Address?.Trim(),
            DressCode = request.DressCode?.Trim(),
            TimelineItems = ToTimelineItems(request.TimelineItems),
            TemplateId = request.TemplateId,
            UserId = userId,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        await _eventRepository.AddAsync(@event, cancellationToken);
        await _eventRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Audit: event {EventId} created by user {UserId}", @event.Id, userId);

        return ToResponse(@event);
    }

    public async Task<IReadOnlyList<EventResponse>> GetMyEventsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var events = await _eventRepository.GetByUserIdAsync(userId, cancellationToken);
        return events.Select(ToResponse).ToList();
    }

    public async Task<EventResponse> GetByIdAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default)
    {
        var @event = await GetOwnedEventAsync(userId, eventId, cancellationToken);
        return ToResponse(@event);
    }

    public async Task<EventResponse> UpdateAsync(Guid userId, Guid eventId, UpdateEventRequest request, CancellationToken cancellationToken = default)
    {
        var @event = await GetOwnedEventAsync(userId, eventId, cancellationToken);

        var slug = NormalizeSlug(request.Slug);
        if (!string.Equals(slug, @event.Slug, StringComparison.Ordinal)
            && await _eventRepository.SlugExistsAsync(slug, eventId, cancellationToken))
        {
            throw new ConflictException("An event with this slug already exists.");
        }

        await EnsureTemplateExistsAsync(request.TemplateId, cancellationToken);

        @event.Name = request.Name.Trim();
        @event.Slug = slug;
        @event.EventType = request.EventType;
        @event.EventDate = request.EventDate;
        @event.Description = request.Description?.Trim();
        @event.Address = request.Address?.Trim();
        @event.DressCode = request.DressCode?.Trim();
        @event.TimelineItems = ToTimelineItems(request.TimelineItems);
        @event.TemplateId = request.TemplateId;
        @event.UpdatedAtUtc = _dateTimeProvider.UtcNow;

        await _eventRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Audit: event {EventId} updated by user {UserId}", @event.Id, userId);

        return ToResponse(@event);
    }

    public async Task DeleteAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default)
    {
        var @event = await GetOwnedEventAsync(userId, eventId, cancellationToken);

        _eventRepository.Remove(@event);
        await _eventRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Audit: event {EventId} deleted by user {UserId}", eventId, userId);
    }

    public async Task<EventResponse> SetCoverImageAsync(Guid userId, Guid eventId, string coverImageUrl, CancellationToken cancellationToken = default)
    {
        var @event = await GetOwnedEventAsync(userId, eventId, cancellationToken);

        @event.CoverImageUrl = coverImageUrl;
        @event.UpdatedAtUtc = _dateTimeProvider.UtcNow;

        await _eventRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Audit: cover image set for event {EventId} by user {UserId}", eventId, userId);

        return ToResponse(@event);
    }

    public async Task<EventResponse> SetFeaturedPhotoAsync(Guid userId, Guid eventId, string featuredPhotoUrl, CancellationToken cancellationToken = default)
    {
        var @event = await GetOwnedEventAsync(userId, eventId, cancellationToken);

        @event.FeaturedPhotoUrl = featuredPhotoUrl;
        @event.UpdatedAtUtc = _dateTimeProvider.UtcNow;

        await _eventRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Audit: featured photo set for event {EventId} by user {UserId}", eventId, userId);

        return ToResponse(@event);
    }

    public async Task<EventResponse> PublishAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default)
    {
        var @event = await GetOwnedEventAsync(userId, eventId, cancellationToken);

        @event.IsPublished = true;
        @event.UpdatedAtUtc = _dateTimeProvider.UtcNow;

        await _eventRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Audit: event {EventId} published by user {UserId}", eventId, userId);

        return ToResponse(@event);
    }

    public async Task<EventResponse> UnpublishAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default)
    {
        var @event = await GetOwnedEventAsync(userId, eventId, cancellationToken);

        @event.IsPublished = false;
        @event.UpdatedAtUtc = _dateTimeProvider.UtcNow;

        await _eventRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Audit: event {EventId} unpublished by user {UserId}", eventId, userId);

        return ToResponse(@event);
    }

    public async Task<EventResponse> AddGalleryImageAsync(Guid userId, Guid eventId, string imageUrl, CancellationToken cancellationToken = default)
    {
        var @event = await GetOwnedEventAsync(userId, eventId, cancellationToken);

        if (@event.GalleryImages.Count >= MaxGalleryImages)
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                ["File"] = [$"An event can have at most {MaxGalleryImages} gallery images."],
            });
        }

        var image = new EventImage
        {
            EventId = @event.Id,
            ImageUrl = imageUrl,
            SortOrder = @event.GalleryImages.Count,
        };
        // EF's relationship fixup adds `image` to @event.GalleryImages automatically since
        // EventId matches this already-tracked Event — adding it again here would duplicate it.
        _eventRepository.AddGalleryImage(image);
        @event.UpdatedAtUtc = _dateTimeProvider.UtcNow;

        await _eventRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Audit: gallery image added to event {EventId} by user {UserId}", eventId, userId);

        return ToResponse(@event);
    }

    public async Task<EventResponse> RemoveGalleryImageAsync(Guid userId, Guid eventId, Guid imageId, CancellationToken cancellationToken = default)
    {
        var @event = await GetOwnedEventAsync(userId, eventId, cancellationToken);

        var image = @event.GalleryImages.FirstOrDefault(i => i.Id == imageId)
            ?? throw new NotFoundException("Gallery image not found.");

        @event.GalleryImages.Remove(image);
        @event.UpdatedAtUtc = _dateTimeProvider.UtcNow;

        await _eventRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Audit: gallery image removed from event {EventId} by user {UserId}", eventId, userId);

        return ToResponse(@event);
    }

    private async Task EnsureTemplateExistsAsync(Guid? templateId, CancellationToken cancellationToken)
    {
        if (templateId is null)
        {
            return;
        }

        var template = await _templateRepository.GetByIdAsync(templateId.Value, cancellationToken);
        if (template is null)
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                [nameof(CreateEventRequest.TemplateId)] = ["Template not found."],
            });
        }
    }

    private async Task<Event> GetOwnedEventAsync(Guid userId, Guid eventId, CancellationToken cancellationToken)
    {
        var @event = await _eventRepository.GetByIdAsync(eventId, cancellationToken);
        if (@event is null || @event.UserId != userId)
        {
            throw new NotFoundException("Event not found.");
        }

        return @event;
    }

    private static string NormalizeSlug(string slug) => slug.Trim().ToLowerInvariant();

    private static List<TimelineItem> ToTimelineItems(IReadOnlyList<TimelineItemDto>? items) =>
        items?.Select(i => new TimelineItem { Time = i.Time.Trim(), Label = i.Label.Trim() }).ToList()
            ?? new List<TimelineItem>();

    private static EventResponse ToResponse(Event @event) => new(
        @event.Id,
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
        @event.IsPublished,
        @event.GalleryImages
            .OrderBy(i => i.SortOrder)
            .Select(i => new EventImageResponse(i.Id, i.ImageUrl))
            .ToList(),
        @event.UserId,
        @event.TemplateId,
        @event.CreatedAtUtc,
        @event.UpdatedAtUtc);
}
