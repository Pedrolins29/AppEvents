using System.Text.Json;
using AppEvents.Domain.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace AppEvents.Infrastructure.Persistence.Configurations;

public class EventConfiguration : IEntityTypeConfiguration<Event>
{
    public void Configure(EntityTypeBuilder<Event> builder)
    {
        builder.ToTable("Events");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Slug)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(e => e.Slug).IsUnique();

        builder.Property(e => e.EventType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(e => e.Description)
            .HasMaxLength(2000);

        builder.Property(e => e.Address)
            .HasMaxLength(300);

        builder.Property(e => e.DressCode)
            .HasMaxLength(150);

        var timelineItemsConverter = new ValueConverter<List<TimelineItem>, string>(
            v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
            v => JsonSerializer.Deserialize<List<TimelineItem>>(v, (JsonSerializerOptions?)null) ?? new List<TimelineItem>());
        var timelineItemsComparer = new ValueComparer<List<TimelineItem>>(
            (a, b) => (a ?? new List<TimelineItem>()).SequenceEqual(b ?? new List<TimelineItem>()),
            v => v.Aggregate(0, (hash, item) => HashCode.Combine(hash, item.Time, item.Label)),
            v => v.ToList());

        builder.Property(e => e.TimelineItems)
            .HasConversion(timelineItemsConverter, timelineItemsComparer)
            .HasColumnType("jsonb")
            .HasColumnName("TimelineItems")
            .HasDefaultValueSql("'[]'::jsonb")
            .IsRequired();

        builder.Property(e => e.CoverImageUrl)
            .HasMaxLength(500);

        builder.Property(e => e.FeaturedPhotoUrl)
            .HasMaxLength(500);

        builder.Property(e => e.IsPublished)
            .IsRequired()
            .HasDefaultValue(false);

        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.UserId);

        builder.HasOne(e => e.Template)
            .WithMany()
            .HasForeignKey(e => e.TemplateId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(e => e.TemplateId);
    }
}
