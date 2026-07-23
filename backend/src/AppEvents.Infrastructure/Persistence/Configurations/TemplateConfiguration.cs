using AppEvents.Domain.Templates;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AppEvents.Infrastructure.Persistence.Configurations;

public class TemplateConfiguration : IEntityTypeConfiguration<Template>
{
    private static readonly DateTime SeedTimestamp = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    public void Configure(EntityTypeBuilder<Template> builder)
    {
        builder.ToTable("Templates");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(t => t.Theme)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(t => t.Theme).IsUnique();

        builder.Property(t => t.ThumbnailUrl)
            .IsRequired()
            .HasMaxLength(500);

        builder.HasData(
            Seed(TemplateThemes.ElegantId, "Elegant", TemplateThemes.Elegant),
            Seed(TemplateThemes.MinimalistId, "Minimalist", TemplateThemes.Minimalist),
            Seed(TemplateThemes.FloralId, "Floral", TemplateThemes.Floral),
            Seed(TemplateThemes.ModernId, "Modern", TemplateThemes.Modern));
    }

    private static Template Seed(Guid id, string name, string theme) => new()
    {
        Id = id,
        Name = name,
        Theme = theme,
        ThumbnailUrl = $"/templates/{theme}-thumbnail.jpg",
        CreatedAtUtc = SeedTimestamp,
        UpdatedAtUtc = SeedTimestamp,
    };
}
