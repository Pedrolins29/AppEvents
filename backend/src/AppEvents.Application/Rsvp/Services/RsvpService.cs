using System.Text;
using AppEvents.Application.Common.Exceptions;
using AppEvents.Application.Common.Interfaces;
using AppEvents.Application.Events.Interfaces;
using AppEvents.Application.Events.Services;
using AppEvents.Application.Identity.Interfaces;
using AppEvents.Application.Rsvp.Dtos;
using AppEvents.Application.Rsvp.Interfaces;
using AppEvents.Domain.Events;
using AppEvents.Domain.Rsvp;
using Microsoft.Extensions.Logging;

namespace AppEvents.Application.Rsvp.Services;

/// <summary>
/// Submission reuses IEventRepository.GetPublishedBySlugAsync (same 404-for-missing-or-
/// unpublished pattern as the public read endpoint). The dashboard reuses IEventService's own
/// ownership check rather than duplicating it, so "does this user own this event" has one
/// source of truth. The organizer is looked up separately via IUserRepository (a cheap PK
/// lookup) rather than adding a User include to GetPublishedBySlugAsync - that method also
/// backs the much higher-traffic, less rate-limited public event read endpoint, and shouldn't
/// pay for a join it doesn't need.
/// </summary>
public class RsvpService : IRsvpService
{
    private readonly IRsvpRepository _rsvpRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IEventService _eventService;
    private readonly IUserRepository _userRepository;
    private readonly IEmailSender _emailSender;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly ILogger<RsvpService> _logger;

    public RsvpService(
        IRsvpRepository rsvpRepository,
        IEventRepository eventRepository,
        IEventService eventService,
        IUserRepository userRepository,
        IEmailSender emailSender,
        IDateTimeProvider dateTimeProvider,
        ILogger<RsvpService> logger)
    {
        _rsvpRepository = rsvpRepository;
        _eventRepository = eventRepository;
        _eventService = eventService;
        _userRepository = userRepository;
        _emailSender = emailSender;
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
            GuestEmail = request.GuestEmail.Trim(),
            GuestPhone = string.IsNullOrWhiteSpace(request.GuestPhone) ? null : request.GuestPhone.Trim(),
            Status = request.Status,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        await _rsvpRepository.AddAsync(response, cancellationToken);
        await _rsvpRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Audit: RSVP {RsvpId} submitted for event {EventId} with status {Status}", response.Id, @event.Id, response.Status);

        // Email is best-effort: the RSVP write above is the must-succeed action. Each recipient
        // is sent independently so one failure (e.g. a bad guest address) can't suppress the
        // other (the organizer should still hear about the RSVP either way).
        var organizer = await _userRepository.GetByIdAsync(@event.UserId, cancellationToken);

        if (response.Status == RsvpStatus.Confirmed)
        {
            await TrySendAsync(
                () => SendGuestConfirmationEmailAsync(@event, response, cancellationToken),
                "guest confirmation", response.Id);
        }

        if (organizer is not null)
        {
            await TrySendAsync(
                () => SendOrganizerNotificationEmailAsync(organizer.Email, @event, response, cancellationToken),
                "organizer notification", response.Id);
        }

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

    private async Task TrySendAsync(Func<Task> send, string emailKind, Guid rsvpId)
    {
        try
        {
            await send();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Audit: failed to send {EmailKind} email for RSVP {RsvpId}", emailKind, rsvpId);
        }
    }

    private Task SendGuestConfirmationEmailAsync(Event @event, RsvpResponse response, CancellationToken cancellationToken)
    {
        var subject = $"You're confirmed: {@event.Name}";
        var body = BuildGuestEmailBody(@event, response);
        return _emailSender.SendAsync(response.GuestEmail, subject, body, cancellationToken);
    }

    private Task SendOrganizerNotificationEmailAsync(string organizerEmail, Event @event, RsvpResponse response, CancellationToken cancellationToken)
    {
        var subject = $"New RSVP for {@event.Name}: {response.GuestName} ({response.Status})";
        var body = BuildOrganizerEmailBody(@event, response);
        return _emailSender.SendAsync(organizerEmail, subject, body, cancellationToken);
    }

    private static string BuildGuestEmailBody(Event @event, RsvpResponse response)
    {
        var html = new StringBuilder();
        html.Append($"<p>Hi {System.Net.WebUtility.HtmlEncode(response.GuestName)},</p>");
        html.Append($"<p>You're confirmed for <strong>{System.Net.WebUtility.HtmlEncode(@event.Name)}</strong> ({EventTypeLabel(@event.EventType)}).</p>");
        html.Append($"<p><strong>Date:</strong> {@event.EventDate:dddd, MMMM d, yyyy}</p>");

        if (!string.IsNullOrWhiteSpace(@event.Description))
        {
            html.Append($"<p>{System.Net.WebUtility.HtmlEncode(@event.Description)}</p>");
        }

        if (!string.IsNullOrWhiteSpace(@event.Address))
        {
            var encodedAddress = Uri.EscapeDataString(@event.Address);
            html.Append($"<p><strong>Location:</strong> {System.Net.WebUtility.HtmlEncode(@event.Address)}<br/>");
            html.Append($"<a href=\"https://www.google.com/maps/search/?api=1&query={encodedAddress}\">Open in Google Maps</a> &middot; ");
            html.Append($"<a href=\"https://waze.com/ul?q={encodedAddress}&navigate=yes\">Open in Waze</a></p>");
        }

        html.Append("<p>We can't wait to see you there.</p>");
        return html.ToString();
    }

    private static string BuildOrganizerEmailBody(Event @event, RsvpResponse response)
    {
        var html = new StringBuilder();
        html.Append($"<p>New RSVP for <strong>{System.Net.WebUtility.HtmlEncode(@event.Name)}</strong>:</p>");
        html.Append("<ul>");
        html.Append($"<li><strong>Name:</strong> {System.Net.WebUtility.HtmlEncode(response.GuestName)}</li>");
        html.Append($"<li><strong>Status:</strong> {response.Status}</li>");
        html.Append($"<li><strong>Email:</strong> {System.Net.WebUtility.HtmlEncode(response.GuestEmail)}</li>");
        if (!string.IsNullOrWhiteSpace(response.GuestPhone))
        {
            html.Append($"<li><strong>Phone:</strong> {System.Net.WebUtility.HtmlEncode(response.GuestPhone)}</li>");
        }
        html.Append("</ul>");
        return html.ToString();
    }

    private static string EventTypeLabel(EventType eventType) => eventType switch
    {
        EventType.FifteenYearsParty => "15th Birthday",
        EventType.BabyShower => "Baby Shower",
        EventType.GenderReveal => "Gender Reveal",
        _ => eventType.ToString(),
    };

    private static RsvpResponseDto ToDto(RsvpResponse response) =>
        new(response.Id, response.GuestName, response.GuestEmail, response.GuestPhone, response.Status, response.CreatedAtUtc);
}
