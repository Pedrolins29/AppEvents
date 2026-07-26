using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace AppEvents.Api.Extensions;

public static class RateLimitingExtensions
{
    public const string AuthPolicy = "auth";
    public const string RsvpPolicy = "rsvp";

    /// <summary>
    /// The "Testing" environment (used by AppEventsWebApplicationFactory) gets much higher
    /// limits — integration tests fire many requests from the same loopback IP in quick
    /// succession, and a 5-req/min limit would produce flaky 429s unrelated to what's
    /// actually being tested. Rate-limiting behavior itself is verified manually (see
    /// Sprints/sprints01.md verification plan), not via automated tests.
    /// </summary>
    public static IServiceCollection AddRateLimiting(this IServiceCollection services, IHostEnvironment environment)
    {
        var isTesting = environment.IsEnvironment("Testing");

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: GetClientIp(httpContext),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = isTesting ? 10_000 : 100,
                        Window = TimeSpan.FromSeconds(60),
                        QueueLimit = 0,
                    }));

            options.AddPolicy(AuthPolicy, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: GetClientIp(httpContext),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = isTesting ? 10_000 : 5,
                        Window = TimeSpan.FromSeconds(60),
                        QueueLimit = 0,
                    }));

            // Looser than auth's 5/60s — guests legitimately retry (typo in name, changed their
            // mind) more often than login attempts, but this is still a bounded, public,
            // unauthenticated endpoint that needs its own spam-mitigation limit.
            options.AddPolicy(RsvpPolicy, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: GetClientIp(httpContext),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = isTesting ? 10_000 : 10,
                        Window = TimeSpan.FromSeconds(60),
                        QueueLimit = 0,
                    }));
        });

        return services;
    }

    private static string GetClientIp(HttpContext httpContext) =>
        httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}
