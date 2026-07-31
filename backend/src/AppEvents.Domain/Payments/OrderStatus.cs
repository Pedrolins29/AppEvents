namespace AppEvents.Domain.Payments;

public enum OrderStatus
{
    Pending,
    Paid,
    Refunded,
    Failed,

    // The webhook payload didn't carry a resolvable ExternalReference back to a known
    // user/event - the order is kept (with its raw payload) for manual reconciliation
    // rather than silently dropped.
    Unmatched,
}
