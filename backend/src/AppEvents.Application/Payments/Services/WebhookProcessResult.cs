namespace AppEvents.Application.Payments.Services;

public enum WebhookProcessResult
{
    InvalidSignature,
    MalformedPayload,
    Processed,
}
