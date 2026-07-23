using AppEvents.Application.Common.Exceptions;
using AppEvents.Application.Templates.Dtos;
using AppEvents.Application.Templates.Interfaces;
using AppEvents.Domain.Templates;

namespace AppEvents.Application.Templates.Services;

public class TemplateService : ITemplateService
{
    private readonly ITemplateRepository _templateRepository;

    public TemplateService(ITemplateRepository templateRepository)
    {
        _templateRepository = templateRepository;
    }

    public async Task<IReadOnlyList<TemplateResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var templates = await _templateRepository.GetAllAsync(cancellationToken);
        return templates.Select(ToResponse).ToList();
    }

    public async Task<TemplateResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var template = await _templateRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Template not found.");

        return ToResponse(template);
    }

    private static TemplateResponse ToResponse(Template template) =>
        new(template.Id, template.Name, template.Theme, template.ThumbnailUrl);
}
