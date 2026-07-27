using System.Security.Claims;
using AppEvents.Application.Common.Exceptions;
using AppEvents.Application.Common.Interfaces;
using AppEvents.Application.Events.Dtos;
using AppEvents.Application.Events.Services;
using AppEvents.Application.Rsvp.Dtos;
using AppEvents.Application.Rsvp.Services;
using AppEvents.Api.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AppEvents.Api.Controllers;

[ApiController]
[Route("api/events")]
[Authorize]
public class EventsController : ControllerBase
{
    private readonly IEventService _eventService;
    private readonly IImageStorageService _imageStorageService;
    private readonly IRsvpService _rsvpService;

    public EventsController(IEventService eventService, IImageStorageService imageStorageService, IRsvpService rsvpService)
    {
        _eventService = eventService;
        _imageStorageService = imageStorageService;
        _rsvpService = rsvpService;
    }

    [HttpPost]
    public async Task<ActionResult<EventResponse>> Create(CreateEventRequest request, CancellationToken cancellationToken)
    {
        var response = await _eventService.CreateAsync(GetUserId(), request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, response);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EventResponse>>> GetMyEvents(CancellationToken cancellationToken)
    {
        var events = await _eventService.GetMyEventsAsync(GetUserId(), cancellationToken);
        return Ok(events);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EventResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var response = await _eventService.GetByIdAsync(GetUserId(), id, cancellationToken);
        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EventResponse>> Update(Guid id, UpdateEventRequest request, CancellationToken cancellationToken)
    {
        var response = await _eventService.UpdateAsync(GetUserId(), id, request, cancellationToken);
        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _eventService.DeleteAsync(GetUserId(), id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/cover-image")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [EnableRateLimiting(RateLimitingExtensions.UploadPolicy)]
    public async Task<ActionResult<EventResponse>> UploadCoverImage(Guid id, IFormFile? file, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                ["File"] = ["A file is required."],
            });
        }

        var userId = GetUserId();

        // Ownership check happens before touching the file — an unauthorized caller's upload
        // is rejected (404) without ever writing it to disk.
        await _eventService.GetByIdAsync(userId, id, cancellationToken);

        await using var stream = file.OpenReadStream();
        var url = await _imageStorageService.SaveAsync(stream, file.FileName, file.ContentType, cancellationToken);

        var response = await _eventService.SetCoverImageAsync(userId, id, url, cancellationToken);
        return Ok(response);
    }

    [HttpPost("{id:guid}/publish")]
    public async Task<ActionResult<EventResponse>> Publish(Guid id, CancellationToken cancellationToken)
    {
        var response = await _eventService.PublishAsync(GetUserId(), id, cancellationToken);
        return Ok(response);
    }

    [HttpPost("{id:guid}/unpublish")]
    public async Task<ActionResult<EventResponse>> Unpublish(Guid id, CancellationToken cancellationToken)
    {
        var response = await _eventService.UnpublishAsync(GetUserId(), id, cancellationToken);
        return Ok(response);
    }

    [HttpPost("{id:guid}/gallery-images")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [EnableRateLimiting(RateLimitingExtensions.UploadPolicy)]
    public async Task<ActionResult<EventResponse>> AddGalleryImage(Guid id, IFormFile? file, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                ["File"] = ["A file is required."],
            });
        }

        var userId = GetUserId();

        // Ownership check happens before touching the file — same pattern as cover-image.
        await _eventService.GetByIdAsync(userId, id, cancellationToken);

        await using var stream = file.OpenReadStream();
        var url = await _imageStorageService.SaveAsync(stream, file.FileName, file.ContentType, cancellationToken);

        var response = await _eventService.AddGalleryImageAsync(userId, id, url, cancellationToken);
        return Ok(response);
    }

    [HttpDelete("{id:guid}/gallery-images/{imageId:guid}")]
    public async Task<ActionResult<EventResponse>> RemoveGalleryImage(Guid id, Guid imageId, CancellationToken cancellationToken)
    {
        var response = await _eventService.RemoveGalleryImageAsync(GetUserId(), id, imageId, cancellationToken);
        return Ok(response);
    }

    [HttpGet("{id:guid}/rsvps")]
    public async Task<ActionResult<AttendanceResponse>> GetAttendance(Guid id, CancellationToken cancellationToken)
    {
        var response = await _rsvpService.GetAttendanceAsync(GetUserId(), id, cancellationToken);
        return Ok(response);
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
