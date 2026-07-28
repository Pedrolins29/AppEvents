using AppEvents.Application.Common.Interfaces;
using AppEvents.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

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

        // Real SmtpEmailSender would otherwise try to actually connect to whatever Email:Host
        // is configured on every RSVP-submitting test - slow (blocks on the send timeout) and
        // flaky (depends on Mailpit happening to be running). Swap in a no-op fake instead.
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<IEmailSender>();
            services.AddScoped<IEmailSender, NoOpEmailSender>();
        });
    }

    private class NoOpEmailSender : IEmailSender
    {
        public Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;
    }

    // xUnit creates a separate factory instance per test class under IClassFixture, and runs
    // classes in parallel - against a genuinely fresh database (every CI run; only ever once
    // locally, since the dev Postgres volume persists) every instance races to apply the same
    // pending migrations, and all but the first fail with "column already exists". Guard so the
    // migration only actually runs once per process, regardless of how many factories start it.
    private static readonly SemaphoreSlim MigrationLock = new(1, 1);
    private static bool _migrated;

    public async Task InitializeAsync()
    {
        await MigrationLock.WaitAsync();
        try
        {
            if (!_migrated)
            {
                using var scope = Services.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppEventsDbContext>();
                await dbContext.Database.MigrateAsync();
                _migrated = true;
            }
        }
        finally
        {
            MigrationLock.Release();
        }
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
