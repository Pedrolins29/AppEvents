using AppEvents.Domain.Common;

namespace AppEvents.Domain.Templates;

public class Template : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string Theme { get; set; } = string.Empty;

    public string ThumbnailUrl { get; set; } = string.Empty;
}
