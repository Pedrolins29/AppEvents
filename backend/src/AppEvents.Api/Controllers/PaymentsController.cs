using System.Security.Claims;
using AppEvents.Api.Extensions;
using AppEvents.Application.Payments.Dtos;
using AppEvents.Application.Payments.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AppEvents.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    // Header name is a best-effort guess (Stripe/Hotmart-style) — unverified against real
    // Lastlink webhook documentation, which doesn't exist yet. Confirm and adjust once it does.
    private const string SignatureHeaderName = "X-Lastlink-Signature";

    private readonly IPaymentWebhookProcessor _webhookProcessor;
    private readonly IEntitlementService _entitlementService;

    public PaymentsController(IPaymentWebhookProcessor webhookProcessor, IEntitlementService entitlementService)
    {
        _webhookProcessor = webhookProcessor;
        _entitlementService = entitlementService;
    }

    // Absolute route (outside api/payments) to match the conventional "/api/webhooks/..."
    // namespace for inbound third-party callbacks. Public/unauthenticated by design — the
    // signature check inside IPaymentWebhookProcessor is the actual security boundary.
    // Always returns 200 for a validly-signed, parseable payload — including "unmatched
    // reference" and "unmapped product key" outcomes, since those are expected states (not
    // client errors) and a non-2xx response would make Lastlink retry indefinitely.
    [HttpPost("/api/webhooks/lastlink")]
    [EnableRateLimiting(RateLimitingExtensions.WebhookPolicy)]
    public async Task<IActionResult> LastlinkWebhook(CancellationToken cancellationToken)
    {
        string rawBody;
        using (var reader = new StreamReader(Request.Body))
        {
            rawBody = await reader.ReadToEndAsync(cancellationToken);
        }

        var signature = Request.Headers[SignatureHeaderName].ToString();
        var result = await _webhookProcessor.ProcessAsync(rawBody, signature, cancellationToken);

        return result switch
        {
            WebhookProcessResult.InvalidSignature => Unauthorized(),
            WebhookProcessResult.MalformedPayload => BadRequest(),
            _ => Ok(),
        };
    }

    [HttpGet("entitlements")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<EntitlementResponse>>> GetEntitlements(CancellationToken cancellationToken)
    {
        var entitlements = await _entitlementService.GetForUserAsync(GetUserId(), cancellationToken);
        return Ok(entitlements);
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
