using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace AppEvents.Api.Extensions;

public static class AuthenticationExtensions
{
    /// <summary>
    /// Resolves Jwt:* settings lazily via IConfiguration (through Configure&lt;IConfiguration&gt;)
    /// rather than capturing them in a local variable at registration time. WebApplicationFactory
    /// layers additional configuration sources (e.g. test user-secrets) onto the same
    /// ConfigurationManager after Program.cs runs, so an eager read here would silently
    /// capture a stale/empty value in integration tests.
    /// </summary>
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer();

        services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<IConfiguration>((options, config) =>
            {
                var signingKey = config["Jwt:SigningKey"]
                    ?? throw new InvalidOperationException("Jwt:SigningKey is not configured.");
                var issuer = config["Jwt:Issuer"] ?? "AppEvents";
                var audience = config["Jwt:Audience"] ?? "AppEvents";

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = issuer,
                    ValidateAudience = true,
                    ValidAudience = audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                };
            });

        services.AddAuthorization();

        return services;
    }
}
