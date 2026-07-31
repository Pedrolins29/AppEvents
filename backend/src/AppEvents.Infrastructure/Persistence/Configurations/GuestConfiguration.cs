using AppEvents.Domain.Rsvp;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AppEvents.Infrastructure.Persistence.Configurations;

public class GuestConfiguration : IEntityTypeConfiguration<Guest>
{
    public void Configure(EntityTypeBuilder<Guest> builder)
    {
        builder.ToTable("Guests");

        builder.HasKey(g => g.Id);

        builder.Property(g => g.GuestName)
            .IsRequired()
            .HasMaxLength(200);

        // Nullable now: an organizer-added invitee may have only a phone (for WhatsApp).
        builder.Property(g => g.GuestEmail)
            .HasMaxLength(320);

        builder.Property(g => g.GuestPhone)
            .HasMaxLength(30);

        builder.Property(g => g.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(g => g.InviteToken)
            .IsRequired()
            .HasMaxLength(64);

        builder.HasIndex(g => g.InviteToken).IsUnique();

        builder.HasOne(g => g.Event)
            .WithMany()
            .HasForeignKey(g => g.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(g => g.EventId);
    }
}
