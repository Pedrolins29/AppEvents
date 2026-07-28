using AppEvents.Domain.Rsvp;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AppEvents.Infrastructure.Persistence.Configurations;

public class RsvpResponseConfiguration : IEntityTypeConfiguration<RsvpResponse>
{
    public void Configure(EntityTypeBuilder<RsvpResponse> builder)
    {
        builder.ToTable("RsvpResponses");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.GuestName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.GuestEmail)
            .IsRequired()
            .HasMaxLength(320);

        builder.Property(r => r.GuestPhone)
            .HasMaxLength(30);

        builder.Property(r => r.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasOne(r => r.Event)
            .WithMany()
            .HasForeignKey(r => r.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(r => r.EventId);
    }
}
