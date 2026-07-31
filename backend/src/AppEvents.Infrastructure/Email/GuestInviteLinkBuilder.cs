using AppEvents.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace AppEvents.Infrastructure.Email;

public class GuestInviteLinkBuilder : IGuestInviteLinkBuilder
{
    private readonly IConfiguration _configuration;

    public GuestInviteLinkBuilder(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string Build(string slug, string inviteToken)
    {
        var baseUrl = (_configuration["Email:FrontendBaseUrl"]
            ?? _configuration["Cors:AllowedOrigin"]
            ?? "http://localhost:3000").TrimEnd('/');

        return $"{baseUrl}/e/{Uri.EscapeDataString(slug)}?g={Uri.EscapeDataString(inviteToken)}";
    }
}
