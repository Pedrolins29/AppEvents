using AppEvents.Application.Events.Dtos;
using AppEvents.Application.Events.Services;
using Microsoft.AspNetCore.Mvc;

namespace AppEvents.Api.Controllers;

[ApiController]
[Route("api/public/events")]
public class PublicEventsController : ControllerBase
{
    private readonly IPublicEventService _publicEventService;

    public PublicEventsController(IPublicEventService publicEventService)
    {
        _publicEventService = publicEventService;
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<PublicEventResponse>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var response = await _publicEventService.GetBySlugAsync(slug, cancellationToken);
        return Ok(response);
    }
}
