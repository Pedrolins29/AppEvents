using AppEvents.Domain.Common;
using AppEvents.Domain.Events;

namespace AppEvents.Domain.Rsvp;

// An invited guest. Two ways a Guest row comes to exist:
//   1. The organizer adds them to the guest list ahead of time (Status = Pending) - this is what
//      makes reminder-chasing possible, since a not-yet-responded guest now has a record.
//   2. Someone submits the open (tokenless) public RSVP form - created directly Confirmed/Declined,
//      like the old response-only model.
// Each guest gets a unique InviteToken so the organizer can share a personal link
// (/e/{slug}?g={token}) whose RSVP submission updates exactly this row.
public class Guest : BaseEntity
{
    public string GuestName { get; set; } = string.Empty;

    // Nullable: an organizer may add a guest they'll chase only by phone/WhatsApp, with no email.
    public string? GuestEmail { get; set; }

    public string? GuestPhone { get; set; }

    public RsvpStatus Status { get; set; } = RsvpStatus.Pending;

    // Unique, URL-safe. Backfilled for pre-existing rows by the AddGuestList migration.
    public string InviteToken { get; set; } = string.Empty;

    public DateTime? RespondedAtUtc { get; set; }

    public int ReminderCount { get; set; }

    public DateTime? LastReminderSentAtUtc { get; set; }

    public Guid EventId { get; set; }

    public Event? Event { get; set; }

    public bool HasResponded => Status != RsvpStatus.Pending;

    // Applies a guest's own RSVP submission (via their personal link or the open form), filling in
    // any contact details they provided that the organizer left blank.
    public void ApplyResponse(RsvpStatus status, string? email, string? phone, DateTime nowUtc)
    {
        Status = status;
        RespondedAtUtc = nowUtc;
        if (!string.IsNullOrWhiteSpace(email))
        {
            GuestEmail = email;
        }
        if (!string.IsNullOrWhiteSpace(phone))
        {
            GuestPhone = phone;
        }
    }
}
