using AppEvents.Api.Extensions;
using AppEvents.Application.Events.Dtos;
using AppEvents.Application.Events.Services;
using AppEvents.Application.Rsvp.Dtos;
using AppEvents.Application.Rsvp.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AppEvents.Api.Controllers;

[ApiController]
[Route("api/public/events")]
public class PublicEventsController : ControllerBase
{
    private readonly IPublicEventService _publicEventService;
    private readonly IGuestService _guestService;

    public PublicEventsController(IPublicEventService publicEventService, IGuestService guestService)
    {
        _publicEventService = publicEventService;
        _guestService = guestService;
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<PublicEventResponse>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var response = await _publicEventService.GetBySlugAsync(slug, cancellationToken);
        return Ok(response);
    }

    // Prefill for a guest who opened their personal link (/e/{slug}?g={token}) - returns only that
    // one guest's own details.
    [HttpGet("{slug}/guest/{token}")]
    public async Task<ActionResult<GuestPrefillDto>> GetGuestPrefill(string slug, string token, CancellationToken cancellationToken)
    {
        var response = await _guestService.GetPrefillByTokenAsync(slug, token, cancellationToken);
        return Ok(response);
    }

    [HttpPost("{slug}/rsvp")]
    [EnableRateLimiting(RateLimitingExtensions.RsvpPolicy)]
    public async Task<ActionResult<GuestDto>> SubmitRsvp(string slug, CreateRsvpRequest request, CancellationToken cancellationToken)
    {
        var response = await _guestService.SubmitAsync(slug, request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, response);
    }
}
