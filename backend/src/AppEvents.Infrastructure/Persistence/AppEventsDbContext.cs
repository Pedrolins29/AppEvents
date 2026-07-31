using AppEvents.Domain.Events;
using AppEvents.Domain.Identity;
using AppEvents.Domain.Payments;
using AppEvents.Domain.Rsvp;
using AppEvents.Domain.Templates;
using Microsoft.EntityFrameworkCore;

namespace AppEvents.Infrastructure.Persistence;

public class AppEventsDbContext : DbContext
{
    public AppEventsDbContext(DbContextOptions<AppEventsDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Role> Roles => Set<Role>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<Event> Events => Set<Event>();

    public DbSet<EventImage> EventImages => Set<EventImage>();

    public DbSet<Template> Templates => Set<Template>();

    public DbSet<RsvpResponse> RsvpResponses => Set<RsvpResponse>();

    public DbSet<Order> Orders => Set<Order>();

    public DbSet<Entitlement> Entitlements => Set<Entitlement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppEventsDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
