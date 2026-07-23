using AppEvents.Domain.Templates;

namespace AppEvents.Application.Templates.Interfaces;

public interface ITemplateRepository
{
    Task<IReadOnlyList<Template>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<Template?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
