using AppEvents.Application.Rsvp.Dtos;

namespace AppEvents.Application.Rsvp.Services;

public interface IGuestService
{
    // Public: a guest's own RSVP submission. With an InviteToken it updates that pending guest;
    // without one it creates a new (walk-in) guest.
    Task<GuestDto> SubmitAsync(string slug, CreateRsvpRequest request, CancellationToken cancellationToken = default);

    // Public: prefill data for a guest opening their personal link.
    Task<GuestPrefillDto> GetPrefillByTokenAsync(string slug, string inviteToken, CancellationToken cancellationToken = default);

    // Organizer (owner-scoped): the full guest list + summary.
    Task<GuestListResponse> GetGuestListAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default);

    Task<GuestDto> AddGuestAsync(Guid userId, Guid eventId, AddGuestRequest request, CancellationToken cancellationToken = default);

    Task<GuestDto> UpdateGuestAsync(Guid userId, Guid eventId, Guid guestId, UpdateGuestRequest request, CancellationToken cancellationToken = default);

    Task RemoveGuestAsync(Guid userId, Guid eventId, Guid guestId, CancellationToken cancellationToken = default);

    // Organizer: send a reminder email to one pending guest now, with their personal link.
    Task<GuestDto> SendReminderEmailAsync(Guid userId, Guid eventId, Guid guestId, CancellationToken cancellationToken = default);
}
