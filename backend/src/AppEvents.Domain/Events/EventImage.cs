using AppEvents.Domain.Common;

namespace AppEvents.Domain.Events;

public class EventImage : BaseEntity
{
    public string ImageUrl { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public Guid EventId { get; set; }

    public Event? Event { get; set; }
}
