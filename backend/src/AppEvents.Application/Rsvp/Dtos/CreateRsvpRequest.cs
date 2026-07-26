using AppEvents.Domain.Rsvp;

namespace AppEvents.Application.Rsvp.Dtos;

/// <summary>
/// HoneypotField must arrive empty - it's a hidden input real guests never see or fill, so a
/// non-empty value marks the submission as automated (see CreateRsvpRequestValidator).
/// </summary>
public record CreateRsvpRequest(string GuestName, RsvpStatus Status, string? HoneypotField);
