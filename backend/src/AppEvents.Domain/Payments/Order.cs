using AppEvents.Domain.Common;
using AppEvents.Domain.Events;
using AppEvents.Domain.Identity;

namespace AppEvents.Domain.Payments;

// A purchase confirmed by an external checkout webhook (Lastlink). The payload shape is not yet
// verified against real Lastlink documentation - RawPayload is kept in full so a mapping mistake
// can be corrected retroactively without having lost the source data.
public class Order : BaseEntity
{
    public Guid? UserId { get; set; }

    public User? User { get; set; }

    public Guid? EventId { get; set; }

    public Event? Event { get; set; }

    // The webhook sender's own id for this transaction - unique, used to make webhook retries
    // idempotent.
    public string ExternalOrderId { get; set; } = string.Empty;

    // Our own correlation id, expected to be echoed back by the checkout provider (passed as a
    // query param on the checkout link, e.g. ?appeventsRef={userId}.{eventId}). Null/unparseable
    // when the provider doesn't support passthrough params - see OrderStatus.Unmatched.
    public string? ExternalReference { get; set; }

    public OrderStatus Status { get; set; }

    public int? AmountCents { get; set; }

    public string? Currency { get; set; }

    // Raw product/bump identifiers from the payload, comma-separated - mapped against
    // Lastlink:ProductKeyMap to grant Entitlements.
    public string? ProductKeysRaw { get; set; }

    public string RawPayload { get; set; } = string.Empty;

    public DateTime ReceivedAtUtc { get; set; }

    public DateTime? ProcessedAtUtc { get; set; }

    public ICollection<Entitlement> Entitlements { get; set; } = new List<Entitlement>();
}
