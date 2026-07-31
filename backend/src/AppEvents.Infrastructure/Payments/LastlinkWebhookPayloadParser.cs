using System.Text.Json;
using AppEvents.Application.Payments.Dtos;
using AppEvents.Application.Payments.Interfaces;
using Microsoft.Extensions.Logging;

namespace AppEvents.Infrastructure.Payments;

/// <summary>
/// Parses the assumed Lastlink webhook shape — unverified against real documentation (none
/// exists yet). Tries a couple of common field-name variants per value so a close-but-not-exact
/// real payload has a chance of still working; falls back to null quietly rather than throwing,
/// since a malformed/unexpected payload should surface as MalformedPayload, not a 500. Confirm
/// and adjust the property names below once real Lastlink docs/sample payloads exist.
/// </summary>
public class LastlinkWebhookPayloadParser : IWebhookPayloadParser
{
    private readonly ILogger<LastlinkWebhookPayloadParser> _logger;

    public LastlinkWebhookPayloadParser(ILogger<LastlinkWebhookPayloadParser> logger)
    {
        _logger = logger;
    }

    public WebhookOrderPayload? Parse(string rawBody)
    {
        JsonDocument document;
        try
        {
            document = JsonDocument.Parse(rawBody);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Audit: payment webhook body is not valid JSON");
            return null;
        }

        using (document)
        {
            var root = document.RootElement;

            var orderId = FirstString(root, "order_id", "id", "transaction_id");
            if (string.IsNullOrWhiteSpace(orderId))
            {
                return null;
            }

            var reference = FirstString(root, "reference", "custom_reference", "external_reference");
            var status = FirstString(root, "status", "order_status", "payment_status");
            var currency = FirstString(root, "currency", "currency_code");
            var amountCents = ParseAmountCents(root);
            var productKeys = FirstStringArray(root, "products", "items", "bumps");

            return new WebhookOrderPayload(orderId, reference, status, amountCents, currency, productKeys);
        }
    }

    private static string? FirstString(JsonElement root, params string[] propertyNames)
    {
        foreach (var name in propertyNames)
        {
            if (root.TryGetProperty(name, out var value) && value.ValueKind == JsonValueKind.String)
            {
                return value.GetString();
            }
        }

        return null;
    }

    // "amount_cents" is assumed to already be integer cents; "amount"/"total" are assumed to be
    // a decimal currency amount (e.g. 89.00) needing conversion — both shapes are common across
    // checkout providers and can't be told apart without a real sample payload.
    private static int? ParseAmountCents(JsonElement root)
    {
        if (root.TryGetProperty("amount_cents", out var cents) && cents.ValueKind == JsonValueKind.Number
            && cents.TryGetInt32(out var wholeCents))
        {
            return wholeCents;
        }

        foreach (var name in new[] { "amount", "total" })
        {
            if (root.TryGetProperty(name, out var value) && value.ValueKind == JsonValueKind.Number
                && value.TryGetDecimal(out var decimalAmount))
            {
                return (int)Math.Round(decimalAmount * 100, MidpointRounding.AwayFromZero);
            }
        }

        return null;
    }

    private static IReadOnlyList<string> FirstStringArray(JsonElement root, params string[] propertyNames)
    {
        foreach (var name in propertyNames)
        {
            if (!root.TryGetProperty(name, out var value) || value.ValueKind != JsonValueKind.Array)
            {
                continue;
            }

            var keys = new List<string>();
            foreach (var item in value.EnumerateArray())
            {
                // Each array item may be a bare string id, or an object carrying one under a
                // nested id-like field — both patterns are common across checkout providers.
                if (item.ValueKind == JsonValueKind.String)
                {
                    var s = item.GetString();
                    if (!string.IsNullOrWhiteSpace(s))
                    {
                        keys.Add(s);
                    }
                }
                else if (item.ValueKind == JsonValueKind.Object)
                {
                    var id = FirstString(item, "id", "sku", "product_id");
                    if (!string.IsNullOrWhiteSpace(id))
                    {
                        keys.Add(id);
                    }
                }
            }

            if (keys.Count > 0)
            {
                return keys;
            }
        }

        return Array.Empty<string>();
    }
}
