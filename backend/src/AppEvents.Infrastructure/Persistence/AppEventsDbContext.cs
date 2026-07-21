using AppEvents.Domain.Identity;
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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppEventsDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
