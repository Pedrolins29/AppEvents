using AppEvents.Application.Events.Interfaces;
using AppEvents.Domain.Events;
using AppEvents.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppEvents.Infrastructure.Events;

public class EventRepository : IEventRepository
{
    private readonly AppEventsDbContext _dbContext;

    public EventRepository(AppEventsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Event?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _dbContext.Events
            .Include(e => e.GalleryImages)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Event>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
        await _dbContext.Events
            .Include(e => e.GalleryImages)
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.CreatedAtUtc)
            .ToListAsync(cancellationToken);

    public Task<Event?> GetPublishedBySlugAsync(string slug, CancellationToken cancellationToken = default) =>
        _dbContext.Events
            .Include(e => e.Template)
            .Include(e => e.GalleryImages)
            .FirstOrDefaultAsync(e => e.Slug == slug && e.IsPublished, cancellationToken);

    public Task<bool> SlugExistsAsync(string slug, Guid? excludeEventId = null, CancellationToken cancellationToken = default) =>
        _dbContext.Events.AnyAsync(
            e => e.Slug == slug && (excludeEventId == null || e.Id != excludeEventId),
            cancellationToken);

    public async Task AddAsync(Event @event, CancellationToken cancellationToken = default) =>
        await _dbContext.Events.AddAsync(@event, cancellationToken);

    // Must be added explicitly via the DbSet rather than just appended to a tracked Event's
    // GalleryImages collection: EventImage.Id is a client-generated GUID, and EF Core's implicit
    // graph-fixup change detection can't tell a "new entity with a pre-set key" apart from "an
    // existing entity being re-attached" — without an explicit Add, it infers Modified and emits
    // an UPDATE instead of an INSERT, which matches 0 rows and throws.
    public void AddGalleryImage(EventImage image) => _dbContext.EventImages.Add(image);

    public void Remove(Event @event) => _dbContext.Events.Remove(@event);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _dbContext.SaveChangesAsync(cancellationToken);
}
