using System.Security.Claims;
using AppEvents.Application.Identity.Dtos;
using AppEvents.Application.Identity.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppEvents.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IAuthService _authService;

    public UsersController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserProfileResponse>> Me(CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var profile = await _authService.GetProfileAsync(userId, cancellationToken);
        return Ok(profile);
    }
}
