using System.Text;
using AppEvents.Application.Common.Exceptions;
using AppEvents.Application.Common.Interfaces;
using AppEvents.Application.Events.Dtos;
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
/// Owns both the public RSVP submission path and the organizer's guest-list management. Public
/// submissions reuse IEventRepository.GetPublishedBySlugAsync (404-for-missing-or-unpublished);
/// organizer operations reuse IEventService.GetByIdAsync for the ownership check (404-not-403), so
/// "does this user own this event" has one source of truth. A submission carrying a personal-link
/// token updates that pending guest in place; a tokenless submission creates a walk-in guest.
/// </summary>
public class GuestService : IGuestService
{
    private readonly IGuestRepository _guestRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IEventService _eventService;
    private readonly IUserRepository _userRepository;
    private readonly IEmailSender _emailSender;
    private readonly IGuestInviteLinkBuilder _inviteLinkBuilder;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly ILogger<GuestService> _logger;

    public GuestService(
        IGuestRepository guestRepository,
        IEventRepository eventRepository,
        IEventService eventService,
        IUserRepository userRepository,
        IEmailSender emailSender,
        IGuestInviteLinkBuilder inviteLinkBuilder,
        IDateTimeProvider dateTimeProvider,
        ILogger<GuestService> logger)
    {
        _guestRepository = guestRepository;
        _eventRepository = eventRepository;
        _eventService = eventService;
        _userRepository = userRepository;
        _emailSender = emailSender;
        _inviteLinkBuilder = inviteLinkBuilder;
        _dateTimeProvider = dateTimeProvider;
        _logger = logger;
    }

    public async Task<GuestDto> SubmitAsync(string slug, CreateRsvpRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedSlug = slug.Trim().ToLowerInvariant();
        var @event = await _eventRepository.GetPublishedBySlugAsync(normalizedSlug, cancellationToken)
            ?? throw new NotFoundException("Event not found.");

        var now = _dateTimeProvider.UtcNow;
        var name = request.GuestName.Trim();
        var email = request.GuestEmail.Trim();
        var phone = string.IsNullOrWhiteSpace(request.GuestPhone) ? null : request.GuestPhone.Trim();

        Guest guest;
        var existing = string.IsNullOrWhiteSpace(request.InviteToken)
            ? null
            : await _guestRepository.GetByEventAndTokenAsync(@event.Id, request.InviteToken.Trim(), cancellationToken);

        if (existing is not null)
        {
            // Personal-link submission: update the pending invitee in place.
            existing.GuestName = name;
            existing.ApplyResponse(request.Status, email, phone, now);
            existing.UpdatedAtUtc = now;
            guest = existing;
        }
        else
        {
            // Walk-in (open link, or an unrecognised token): create a fresh guest already responded.
            guest = new Guest
            {
                EventId = @event.Id,
                GuestName = name,
                GuestEmail = email,
                GuestPhone = phone,
                Status = request.Status,
                InviteToken = GuestInviteToken.Generate(),
                RespondedAtUtc = now,
                CreatedAtUtc = now,
                UpdatedAtUtc = now,
            };
            await _guestRepository.AddAsync(guest, cancellationToken);
        }

        await _guestRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Audit: RSVP {GuestId} submitted for event {EventId} with status {Status}", guest.Id, @event.Id, guest.Status);

        // Email is best-effort: the guest write above is the must-succeed action. Each recipient is
        // sent independently so one failure can't suppress the other.
        var organizer = await _userRepository.GetByIdAsync(@event.UserId, cancellationToken);

        if (guest.Status == RsvpStatus.Confirmed && !string.IsNullOrWhiteSpace(guest.GuestEmail))
        {
            await TrySendAsync(
                () => SendGuestConfirmationEmailAsync(@event, guest, cancellationToken),
                "guest confirmation", guest.Id);
        }

        if (organizer is not null)
        {
            await TrySendAsync(
                () => SendOrganizerNotificationEmailAsync(organizer.Email, @event, guest, cancellationToken),
                "organizer notification", guest.Id);
        }

        return ToDto(guest);
    }

    public async Task<GuestPrefillDto> GetPrefillByTokenAsync(string slug, string inviteToken, CancellationToken cancellationToken = default)
    {
        var normalizedSlug = slug.Trim().ToLowerInvariant();
        var @event = await _eventRepository.GetPublishedBySlugAsync(normalizedSlug, cancellationToken)
            ?? throw new NotFoundException("Event not found.");

        var guest = await _guestRepository.GetByEventAndTokenAsync(@event.Id, inviteToken.Trim(), cancellationToken)
            ?? throw new NotFoundException("Guest not found.");

        return new GuestPrefillDto(guest.GuestName, guest.GuestEmail, guest.GuestPhone, guest.Status, guest.HasResponded);
    }

    public async Task<GuestListResponse> GetGuestListAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default)
    {
        await _eventService.GetByIdAsync(userId, eventId, cancellationToken);

        var guests = await _guestRepository.GetByEventIdAsync(eventId, cancellationToken);
        var summary = new AttendanceSummary(
            guests.Count,
            guests.Count(g => g.Status == RsvpStatus.Pending),
            guests.Count(g => g.Status == RsvpStatus.Confirmed),
            guests.Count(g => g.Status == RsvpStatus.Declined));
        var dtos = guests
            .OrderByDescending(g => g.CreatedAtUtc)
            .Select(ToDto)
            .ToList();

        return new GuestListResponse(summary, dtos);
    }

    public async Task<GuestDto> AddGuestAsync(Guid userId, Guid eventId, AddGuestRequest request, CancellationToken cancellationToken = default)
    {
        await _eventService.GetByIdAsync(userId, eventId, cancellationToken);

        var now = _dateTimeProvider.UtcNow;
        var guest = new Guest
        {
            EventId = eventId,
            GuestName = request.GuestName.Trim(),
            GuestEmail = string.IsNullOrWhiteSpace(request.GuestEmail) ? null : request.GuestEmail.Trim(),
            GuestPhone = string.IsNullOrWhiteSpace(request.GuestPhone) ? null : request.GuestPhone.Trim(),
            Status = RsvpStatus.Pending,
            InviteToken = GuestInviteToken.Generate(),
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        await _guestRepository.AddAsync(guest, cancellationToken);
        await _guestRepository.SaveChangesAsync(cancellationToken);

        return ToDto(guest);
    }

    public async Task<GuestDto> UpdateGuestAsync(Guid userId, Guid eventId, Guid guestId, UpdateGuestRequest request, CancellationToken cancellationToken = default)
    {
        await _eventService.GetByIdAsync(userId, eventId, cancellationToken);
        var guest = await GetOwnedGuestAsync(eventId, guestId, cancellationToken);

        var now = _dateTimeProvider.UtcNow;
        guest.GuestName = request.GuestName.Trim();
        guest.GuestEmail = string.IsNullOrWhiteSpace(request.GuestEmail) ? null : request.GuestEmail.Trim();
        guest.GuestPhone = string.IsNullOrWhiteSpace(request.GuestPhone) ? null : request.GuestPhone.Trim();

        // An organizer manually marking a guest confirmed/declined counts as a response; moving them
        // back to Pending clears that.
        if (request.Status != guest.Status)
        {
            guest.Status = request.Status;
            guest.RespondedAtUtc = request.Status == RsvpStatus.Pending ? null : (guest.RespondedAtUtc ?? now);
        }

        guest.UpdatedAtUtc = now;
        await _guestRepository.SaveChangesAsync(cancellationToken);

        return ToDto(guest);
    }

    public async Task RemoveGuestAsync(Guid userId, Guid eventId, Guid guestId, CancellationToken cancellationToken = default)
    {
        await _eventService.GetByIdAsync(userId, eventId, cancellationToken);
        var guest = await GetOwnedGuestAsync(eventId, guestId, cancellationToken);

        _guestRepository.Remove(guest);
        await _guestRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task<GuestDto> SendReminderEmailAsync(Guid userId, Guid eventId, Guid guestId, CancellationToken cancellationToken = default)
    {
        var @event = await _eventService.GetByIdAsync(userId, eventId, cancellationToken);
        var guest = await GetOwnedGuestAsync(eventId, guestId, cancellationToken);

        if (string.IsNullOrWhiteSpace(guest.GuestEmail))
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                ["guestEmail"] = ["This guest has no email address to send a reminder to."],
            });
        }

        var link = _inviteLinkBuilder.Build(@event.Slug, guest.InviteToken);
        await _emailSender.SendAsync(guest.GuestEmail, $"Please confirm: {@event.Name}", BuildReminderEmailBody(@event, guest, link), cancellationToken);

        var now = _dateTimeProvider.UtcNow;
        guest.ReminderCount++;
        guest.LastReminderSentAtUtc = now;
        guest.UpdatedAtUtc = now;
        await _guestRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Audit: reminder email sent to guest {GuestId} for event {EventId}", guest.Id, eventId);

        return ToDto(guest);
    }

    private async Task<Guest> GetOwnedGuestAsync(Guid eventId, Guid guestId, CancellationToken cancellationToken)
    {
        var guest = await _guestRepository.GetByIdAsync(guestId, cancellationToken);
        // Event ownership is already proven by the caller's GetByIdAsync; this just confirms the
        // guest actually belongs to that event (404, not 403, on a mismatch - same pattern as events).
        if (guest is null || guest.EventId != eventId)
        {
            throw new NotFoundException("Guest not found.");
        }

        return guest;
    }

    private async Task TrySendAsync(Func<Task> send, string emailKind, Guid guestId)
    {
        try
        {
            await send();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Audit: failed to send {EmailKind} email for guest {GuestId}", emailKind, guestId);
        }
    }

    private Task SendGuestConfirmationEmailAsync(Event @event, Guest guest, CancellationToken cancellationToken)
    {
        var subject = $"You're confirmed: {@event.Name}";
        var body = BuildGuestEmailBody(@event, guest);
        return _emailSender.SendAsync(guest.GuestEmail!, subject, body, cancellationToken);
    }

    private Task SendOrganizerNotificationEmailAsync(string organizerEmail, Event @event, Guest guest, CancellationToken cancellationToken)
    {
        var subject = $"New RSVP for {@event.Name}: {guest.GuestName} ({guest.Status})";
        var body = BuildOrganizerEmailBody(@event, guest);
        return _emailSender.SendAsync(organizerEmail, subject, body, cancellationToken);
    }

    private static string BuildGuestEmailBody(Event @event, Guest guest)
    {
        var html = new StringBuilder();
        html.Append($"<p>Hi {System.Net.WebUtility.HtmlEncode(guest.GuestName)},</p>");
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

    private static string BuildOrganizerEmailBody(Event @event, Guest guest)
    {
        var html = new StringBuilder();
        html.Append($"<p>New RSVP for <strong>{System.Net.WebUtility.HtmlEncode(@event.Name)}</strong>:</p>");
        html.Append("<ul>");
        html.Append($"<li><strong>Name:</strong> {System.Net.WebUtility.HtmlEncode(guest.GuestName)}</li>");
        html.Append($"<li><strong>Status:</strong> {guest.Status}</li>");
        if (!string.IsNullOrWhiteSpace(guest.GuestEmail))
        {
            html.Append($"<li><strong>Email:</strong> {System.Net.WebUtility.HtmlEncode(guest.GuestEmail)}</li>");
        }
        if (!string.IsNullOrWhiteSpace(guest.GuestPhone))
        {
            html.Append($"<li><strong>Phone:</strong> {System.Net.WebUtility.HtmlEncode(guest.GuestPhone)}</li>");
        }
        html.Append("</ul>");
        return html.ToString();
    }

    private static string BuildReminderEmailBody(EventResponse @event, Guest guest, string personalLink)
    {
        var html = new StringBuilder();
        html.Append($"<p>Hi {System.Net.WebUtility.HtmlEncode(guest.GuestName)},</p>");
        html.Append($"<p>We'd love to know if you can join us for <strong>{System.Net.WebUtility.HtmlEncode(@event.Name)}</strong> on {@event.EventDate:dddd, MMMM d, yyyy}.</p>");
        html.Append($"<p>It only takes a moment — <a href=\"{System.Net.WebUtility.HtmlEncode(personalLink)}\">confirm your presence here</a>.</p>");
        html.Append("<p>Hope to see you there!</p>");
        return html.ToString();
    }

    private static string EventTypeLabel(EventType eventType) => eventType switch
    {
        EventType.FifteenYearsParty => "15th Birthday",
        EventType.BabyShower => "Baby Shower",
        EventType.GenderReveal => "Gender Reveal",
        _ => eventType.ToString(),
    };

    private static GuestDto ToDto(Guest guest) => new(
        guest.Id,
        guest.GuestName,
        guest.GuestEmail,
        guest.GuestPhone,
        guest.Status,
        guest.InviteToken,
        guest.RespondedAtUtc,
        guest.ReminderCount,
        guest.LastReminderSentAtUtc,
        guest.CreatedAtUtc);
}
