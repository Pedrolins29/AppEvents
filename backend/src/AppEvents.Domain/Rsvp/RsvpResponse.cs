using AppEvents.Domain.Common;
using AppEvents.Domain.Events;

namespace AppEvents.Domain.Rsvp;

public class RsvpResponse : BaseEntity
{
    public string GuestName { get; set; } = string.Empty;

    public string GuestEmail { get; set; } = string.Empty;

    // Optional and unused today - collected ahead of a planned WhatsApp reminder integration,
    // not gated on since that feature doesn't exist yet.
    public string? GuestPhone { get; set; }

    public RsvpStatus Status { get; set; }

    public Guid EventId { get; set; }

    public Event? Event { get; set; }
}
