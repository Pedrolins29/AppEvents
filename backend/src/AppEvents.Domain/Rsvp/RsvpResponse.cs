using AppEvents.Domain.Common;
using AppEvents.Domain.Events;

namespace AppEvents.Domain.Rsvp;

public class RsvpResponse : BaseEntity
{
    public string GuestName { get; set; } = string.Empty;

    public RsvpStatus Status { get; set; }

    public Guid EventId { get; set; }

    public Event? Event { get; set; }
}
