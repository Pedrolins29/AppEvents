namespace AppEvents.Application.Payments.Services;

public interface IPaymentWebhookProcessor
{
    Task<WebhookProcessResult> ProcessAsync(string rawBody, string? signatureHeader, CancellationToken cancellationToken = default);
}
