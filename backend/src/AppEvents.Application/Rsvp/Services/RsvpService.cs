using AppEvents.Application.Common.Exceptions;
using AppEvents.Application.Events.Interfaces;
using AppEvents.Application.Events.Services;
using AppEvents.Application.Identity.Interfaces;
using AppEvents.Application.Rsvp.Dtos;
using AppEvents.Application.Rsvp.Interfaces;
using AppEvents.Domain.Rsvp;
using Microsoft.Extensions.Logging;

namespace AppEvents.Application.Rsvp.Services;

/// <summary>
/// Submission reuses IEventRepository.GetPublishedBySlugAsync (same 404-for-missing-or-
/// unpublished pattern as the public read endpoint). The dashboard reuses IEventService's own
/// ownership check rather than duplicating it, so "does this user own this event" has one
/// source of truth.
/// </summary>
public class RsvpService : IRsvpService
{
    private readonly IRsvpRepository _rsvpRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IEventService _eventService;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly ILogger<RsvpService> _logger;

    public RsvpService(
        IRsvpRepository rsvpRepository,
        IEventRepository eventRepository,
        IEventService eventService,
        IDateTimeProvider dateTimeProvider,
        ILogger<RsvpService> logger)
    {
        _rsvpRepository = rsvpRepository;
        _eventRepository = eventRepository;
        _eventService = eventService;
        _dateTimeProvider = dateTimeProvider;
        _logger = logger;
    }

    public async Task<RsvpResponseDto> SubmitAsync(string slug, CreateRsvpRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedSlug = slug.Trim().ToLowerInvariant();
        var @event = await _eventRepository.GetPublishedBySlugAsync(normalizedSlug, cancellationToken)
            ?? throw new NotFoundException("Event not found.");

        var now = _dateTimeProvider.UtcNow;
        var response = new RsvpResponse
        {
            EventId = @event.Id,
            GuestName = request.GuestName.Trim(),
            Status = request.Status,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        await _rsvpRepository.AddAsync(response, cancellationToken);
        await _rsvpRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Audit: RSVP {RsvpId} submitted for event {EventId} with status {Status}", response.Id, @event.Id, response.Status);

        return ToDto(response);
    }

    public async Task<AttendanceResponse> GetAttendanceAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default)
    {
        // Throws NotFoundException if the event doesn't exist or isn't owned by this user -
        // same 404-not-403 pattern as every other owned-event action.
        await _eventService.GetByIdAsync(userId, eventId, cancellationToken);

        var responses = await _rsvpRepository.GetByEventIdAsync(eventId, cancellationToken);
        var confirmed = responses.Count(r => r.Status == RsvpStatus.Confirmed);
        var declined = responses.Count(r => r.Status == RsvpStatus.Declined);
        var summary = new AttendanceSummary(responses.Count, confirmed, declined);
        var dtos = responses.OrderByDescending(r => r.CreatedAtUtc).Select(ToDto).ToList();

        return new AttendanceResponse(summary, dtos);
    }

    private static RsvpResponseDto ToDto(RsvpResponse response) =>
        new(response.Id, response.GuestName, response.Status, response.CreatedAtUtc);
}
