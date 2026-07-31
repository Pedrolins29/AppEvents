using AppEvents.Domain.Rsvp;

namespace AppEvents.Application.Rsvp.Dtos;

// Organizer adds an invitee to the guest list. Email/phone are optional - the organizer may only
// have one channel to chase them on (and needs at least a phone to send a WhatsApp reminder).
public record AddGuestRequest(string GuestName, string? GuestEmail, string? GuestPhone);

// Organizer edits an invitee, including manually overriding their RSVP status (e.g. they confirmed
// verbally). Status may be any RsvpStatus, including moving back to Pending.
public record UpdateGuestRequest(string GuestName, string? GuestEmail, string? GuestPhone, RsvpStatus Status);
