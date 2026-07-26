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
    private readonly IRsvpService _rsvpService;

    public PublicEventsController(IPublicEventService publicEventService, IRsvpService rsvpService)
    {
        _publicEventService = publicEventService;
        _rsvpService = rsvpService;
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<PublicEventResponse>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var response = await _publicEventService.GetBySlugAsync(slug, cancellationToken);
        return Ok(response);
    }

    [HttpPost("{slug}/rsvp")]
    [EnableRateLimiting(RateLimitingExtensions.RsvpPolicy)]
    public async Task<ActionResult<RsvpResponseDto>> SubmitRsvp(string slug, CreateRsvpRequest request, CancellationToken cancellationToken)
    {
        var response = await _rsvpService.SubmitAsync(slug, request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, response);
    }
}
