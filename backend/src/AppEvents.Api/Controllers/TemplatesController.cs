using AppEvents.Application.Templates.Dtos;
using AppEvents.Application.Templates.Services;
using Microsoft.AspNetCore.Mvc;

namespace AppEvents.Api.Controllers;

[ApiController]
[Route("api/templates")]
public class TemplatesController : ControllerBase
{
    private readonly ITemplateService _templateService;

    public TemplatesController(ITemplateService templateService)
    {
        _templateService = templateService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TemplateResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var templates = await _templateService.GetAllAsync(cancellationToken);
        return Ok(templates);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TemplateResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var template = await _templateService.GetByIdAsync(id, cancellationToken);
        return Ok(template);
    }
}
