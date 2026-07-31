namespace AppEvents.Application.Payments.Dtos;

// Provider-neutral shape a webhook payload gets parsed into. Reference is our own correlation id
// (see Order.ExternalReference); RawStatus is the provider's own status string, mapped to
// OrderStatus by the processor.
public record WebhookOrderPayload(
    string ExternalOrderId,
    string? Reference,
    string? RawStatus,
    int? AmountCents,
    string? Currency,
    IReadOnlyList<string> ProductKeys);
