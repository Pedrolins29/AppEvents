using AppEvents.Domain.Payments;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AppEvents.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.ExternalOrderId)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasIndex(o => o.ExternalOrderId).IsUnique();

        builder.Property(o => o.ExternalReference)
            .HasMaxLength(200);

        builder.Property(o => o.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(o => o.Currency)
            .HasMaxLength(10);

        builder.Property(o => o.ProductKeysRaw)
            .HasMaxLength(1000);

        builder.Property(o => o.RawPayload)
            .IsRequired()
            .HasColumnType("jsonb");

        builder.HasOne(o => o.User)
            .WithMany()
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(o => o.UserId);

        builder.HasOne(o => o.Event)
            .WithMany()
            .HasForeignKey(o => o.EventId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(o => o.EventId);
    }
}
