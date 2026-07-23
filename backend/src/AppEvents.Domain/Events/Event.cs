using AppEvents.Domain.Common;
using AppEvents.Domain.Identity;
using AppEvents.Domain.Templates;

namespace AppEvents.Domain.Events;

public class Event : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public EventType EventType { get; set; }

    public DateTime EventDate { get; set; }

    public string? Description { get; set; }

    public string? Address { get; set; }

    public string? CoverImageUrl { get; set; }

    public bool IsPublished { get; set; }

    public Guid UserId { get; set; }

    public User? User { get; set; }

    public Guid? TemplateId { get; set; }

    public Template? Template { get; set; }

    public ICollection<EventImage> GalleryImages { get; set; } = new List<EventImage>();
}
