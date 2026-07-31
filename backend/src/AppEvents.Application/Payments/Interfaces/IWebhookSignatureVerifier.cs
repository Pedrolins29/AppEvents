namespace AppEvents.Application.Payments.Interfaces;

/// <summary>
/// Verifies the authenticity of an inbound payment-webhook request. The concrete algorithm and
/// header name are an Infrastructure implementation detail (see HmacWebhookSignatureVerifier) —
/// Application only needs a yes/no answer.
/// </summary>
public interface IWebhookSignatureVerifier
{
    bool Verify(string rawBody, string? signatureHeader);
}
