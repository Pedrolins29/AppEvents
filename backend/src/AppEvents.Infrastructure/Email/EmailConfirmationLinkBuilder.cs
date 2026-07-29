using AppEvents.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace AppEvents.Infrastructure.Email;

public class EmailConfirmationLinkBuilder : IEmailConfirmationLinkBuilder
{
    private readonly IConfiguration _configuration;

    public EmailConfirmationLinkBuilder(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string Build(string rawToken)
    {
        var baseUrl = (_configuration["Email:FrontendBaseUrl"]
            ?? _configuration["Cors:AllowedOrigin"]
            ?? "http://localhost:3000").TrimEnd('/');

        return $"{baseUrl}/verify-email?token={Uri.EscapeDataString(rawToken)}";
    }
}
