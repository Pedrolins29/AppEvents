using AppEvents.Domain.Rsvp;

namespace AppEvents.Application.Rsvp.Dtos;

/// <summary>
/// HoneypotField must arrive empty - it's a hidden input real guests never see or fill, so a
/// non-empty value marks the submission as automated (see CreateRsvpRequestValidator).
/// GuestPhone is optional and unused today - collected ahead of a planned WhatsApp reminder
/// integration, not gated on since that feature doesn't exist yet.
/// </summary>
public record CreateRsvpRequest(string GuestName, string GuestEmail, string? GuestPhone, RsvpStatus Status, string? HoneypotField);
