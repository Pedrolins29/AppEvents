namespace AppEvents.Application.Common.Interfaces;

/// <summary>
/// Builds the frontend URL a registrant clicks to confirm their email. Kept as its own interface
/// (rather than reading configuration directly in AuthService) so the Application layer stays
/// free of a direct IConfiguration dependency, matching the rest of its services.
/// </summary>
public interface IEmailConfirmationLinkBuilder
{
    string Build(string rawToken);
}
