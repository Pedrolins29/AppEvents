namespace AppEvents.Application.Common.Interfaces;

/// <summary>
/// Builds a guest's personal RSVP link ({FrontendBaseUrl}/e/{slug}?g={token}). Its own interface
/// so the Application layer stays free of a direct IConfiguration dependency, matching
/// IEmailConfirmationLinkBuilder.
/// </summary>
public interface IGuestInviteLinkBuilder
{
    string Build(string slug, string inviteToken);
}
