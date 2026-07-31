using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace AppEvents.Api.Extensions;

public static class RateLimitingExtensions
{
    public const string AuthPolicy = "auth";
    public const string RsvpPolicy = "rsvp";
    public const string UploadPolicy = "upload";
    public const string ResendConfirmationPolicy = "resend-confirmation";

    public const string WebhookPolicy = "webhook";

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

            // Disk I/O per request — bounded separately from the general authenticated-CRUD
            // traffic that only falls under the 100/60s global default.
            options.AddPolicy(UploadPolicy, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: GetClientIp(httpContext),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = isTesting ? 10_000 : 10,
                        Window = TimeSpan.FromSeconds(60),
                        QueueLimit = 0,
                    }));

            // Tighter than auth's 5/60s: this endpoint accepts an arbitrary target email with no
            // account-ownership proof, so it's the easiest of the auth endpoints to abuse for spam.
            options.AddPolicy(ResendConfirmationPolicy, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: GetClientIp(httpContext),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = isTesting ? 10_000 : 3,
                        Window = TimeSpan.FromMinutes(15),
                        QueueLimit = 0,
                    }));

            // IP-partitioned as a rough guard only — Lastlink's real source IPs are unknown, so
            // this isn't a meaningful allowlist. The actual security boundary for this endpoint
            // is the webhook signature check in IWebhookSignatureVerifier, not this limit.
            options.AddPolicy(WebhookPolicy, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: GetClientIp(httpContext),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = isTesting ? 10_000 : 30,
                        Window = TimeSpan.FromSeconds(60),
                        QueueLimit = 0,
                    }));
        });

        return services;
    }

    private static string GetClientIp(HttpContext httpContext) =>
        httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}
