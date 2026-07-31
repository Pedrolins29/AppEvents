using AppEvents.Domain.Common;
using AppEvents.Domain.Events;
using AppEvents.Domain.Identity;

namespace AppEvents.Domain.Payments;

// Grants a user (optionally scoped to one event) access to a premium feature, keyed by one of
// PremiumFeatureKeys. Always traceable back to the Order that paid for it.
public class Entitlement : BaseEntity
{
    public Guid UserId { get; set; }

    public User? User { get; set; }

    // Null for account-wide entitlements (e.g. white-label removal); set for entitlements tied to
    // one specific invitation (e.g. the groomsmen manual for that wedding).
    public Guid? EventId { get; set; }

    public Event? Event { get; set; }

    public string FeatureKey { get; set; } = string.Empty;

    public Guid SourceOrderId { get; set; }

    public Order? SourceOrder { get; set; }

    public DateTime GrantedAtUtc { get; set; }

    public DateTime? RevokedAtUtc { get; set; }

    public bool IsActive(DateTime nowUtc) => !RevokedAtUtc.HasValue || RevokedAtUtc.Value > nowUtc;
}
