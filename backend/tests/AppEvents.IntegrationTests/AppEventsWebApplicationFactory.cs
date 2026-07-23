using AppEvents.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AppEvents.IntegrationTests;

/// <summary>
/// Points at a real local Postgres test database (appevents_test) rather than EF's InMemory
/// provider, because the unique-email constraint is a real correctness concern for auth tests.
/// The connection string and signing key come from this project's own user-secrets (see
/// README) so nothing sensitive is committed to git.
/// </summary>
public class AppEventsWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly string _uploadsPath = Path.Combine(Path.GetTempPath(), $"appevents-test-uploads-{Guid.NewGuid():N}");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((_, configBuilder) =>
        {
            configBuilder.AddUserSecrets<AppEventsWebApplicationFactory>(optional: true);
            // Keeps uploaded test files out of the real dev App_Data folder.
            configBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Storage:LocalPath"] = _uploadsPath,
            });
        });
    }

    public async Task InitializeAsync()
    {
        using var scope = Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppEventsDbContext>();
        await dbContext.Database.MigrateAsync();
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        await base.DisposeAsync();
        if (Directory.Exists(_uploadsPath))
        {
            Directory.Delete(_uploadsPath, recursive: true);
        }
    }
}
