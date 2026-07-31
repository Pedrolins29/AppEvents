using AppEvents.Domain.Payments;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AppEvents.Infrastructure.Persistence.Configurations;

public class EntitlementConfiguration : IEntityTypeConfiguration<Entitlement>
{
    public void Configure(EntityTypeBuilder<Entitlement> builder)
    {
        builder.ToTable("Entitlements");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.FeatureKey)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(e => new { e.UserId, e.FeatureKey });

        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Event)
            .WithMany()
            .HasForeignKey(e => e.EventId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(e => e.EventId);

        builder.HasOne(e => e.SourceOrder)
            .WithMany(o => o.Entitlements)
            .HasForeignKey(e => e.SourceOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.SourceOrderId);
    }
}
