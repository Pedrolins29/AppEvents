using AppEvents.Domain.Rsvp;

namespace AppEvents.Application.Rsvp.Dtos;

/// <summary>
/// A guest's own RSVP submission from the public page. HoneypotField must arrive empty - it's a
/// hidden input real guests never see or fill, so a non-empty value marks the submission as
/// automated (see CreateRsvpRequestValidator). InviteToken is present when the guest opened their
/// personal link (/e/{slug}?g={token}), in which case the submission updates that pre-existing
/// pending Guest row instead of creating a new one. Status must be Confirmed or Declined - a guest
/// can never submit "Pending".
/// </summary>
public record CreateRsvpRequest(
    string GuestName,
    string GuestEmail,
    string? GuestPhone,
    RsvpStatus Status,
    string? HoneypotField,
    string? InviteToken = null);
