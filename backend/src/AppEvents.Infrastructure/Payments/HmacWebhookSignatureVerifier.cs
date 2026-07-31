using System.Security.Cryptography;
using System.Text;
using AppEvents.Application.Payments.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AppEvents.Infrastructure.Payments;

/// <summary>
/// HMAC-SHA256 over the raw request body, compared against a hex-encoded signature header —
/// the most common webhook-signing scheme (Stripe/Hotmart-style), used here as a best-effort
/// default since no real Lastlink webhook documentation exists yet. Confirm the actual header
/// name/algorithm once real docs are available and adjust accordingly.
/// </summary>
public class HmacWebhookSignatureVerifier : IWebhookSignatureVerifier
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<HmacWebhookSignatureVerifier> _logger;

    public HmacWebhookSignatureVerifier(IConfiguration configuration, ILogger<HmacWebhookSignatureVerifier> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public bool Verify(string rawBody, string? signatureHeader)
    {
        var secret = _configuration["Lastlink:WebhookSecret"];
        if (string.IsNullOrEmpty(secret))
        {
            // Fail closed: an unconfigured secret must never be treated as "accept anything".
            _logger.LogWarning("Audit: payment webhook rejected — Lastlink:WebhookSecret is not configured");
            return false;
        }

        if (string.IsNullOrEmpty(signatureHeader))
        {
            return false;
        }

        var expected = Convert.ToHexStringLower(HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(rawBody)));
        var provided = signatureHeader.Trim().ToLowerInvariant();

        if (expected.Length != provided.Length)
        {
            return false;
        }

        return CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(provided));
    }
}
