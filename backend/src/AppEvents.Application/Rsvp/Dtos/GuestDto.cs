using AppEvents.Domain.Rsvp;

namespace AppEvents.Application.Rsvp.Dtos;

// Organizer-facing view of a guest. Includes InviteToken (so the dashboard can build the personal
// link) and reminder tracking - this is only ever returned from authenticated, owner-scoped
// endpoints.
public record GuestDto(
    Guid Id,
    string GuestName,
    string? GuestEmail,
    string? GuestPhone,
    RsvpStatus Status,
    string InviteToken,
    DateTime? RespondedAtUtc,
    int ReminderCount,
    DateTime? LastReminderSentAtUtc,
    DateTime CreatedAtUtc);

public record AttendanceSummary(int Total, int Pending, int Confirmed, int Declined);

public record GuestListResponse(AttendanceSummary Summary, IReadOnlyList<GuestDto> Guests);

// Minimal, self-scoped prefill returned to a guest who opened their own personal link. Carries
// only their own details.
public record GuestPrefillDto(string GuestName, string? GuestEmail, string? GuestPhone, RsvpStatus Status, bool HasResponded);
