using AppEvents.Application.Templates.Dtos;

namespace AppEvents.Application.Templates.Services;

public interface ITemplateService
{
    Task<IReadOnlyList<TemplateResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<TemplateResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
