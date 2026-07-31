using AppEvents.Application.Payments.Dtos;

namespace AppEvents.Application.Payments.Interfaces;

/// <summary>
/// Parses a raw webhook body into a provider-neutral WebhookOrderPayload. The real Lastlink field
/// names are unverified — this is the one seam where that assumption lives, so Application logic
/// (PaymentWebhookProcessorService) never touches provider-specific JSON shape directly.
/// </summary>
public interface IWebhookPayloadParser
{
    /// Returns null if the body isn't parseable JSON or is missing a usable order id.
    WebhookOrderPayload? Parse(string rawBody);
}
