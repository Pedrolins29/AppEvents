using AppEvents.Application.Templates.Interfaces;
using AppEvents.Domain.Templates;
using AppEvents.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppEvents.Infrastructure.Templates;

public class TemplateRepository : ITemplateRepository
{
    private readonly AppEventsDbContext _dbContext;

    public TemplateRepository(AppEventsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<Template>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _dbContext.Templates
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);

    public Task<Template?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _dbContext.Templates.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
}
