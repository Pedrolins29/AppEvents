namespace AppEvents.Domain.Events;

// Not a BaseEntity - never queried or referenced independently of its parent Event, so it needs
// no Id/timestamps of its own. Stored as a JSON array on Event.TimelineItems (see
// EventConfiguration), where array order is the display order.
public record TimelineItem
{
    public string Time { get; set; } = string.Empty;

    public string Label { get; set; } = string.Empty;
}
