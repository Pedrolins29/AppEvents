namespace AppEvents.Application.Common.Interfaces;

/// <summary>
/// Sends a single HTML email. Implementations should apply their own short send timeout —
/// callers on the public RSVP path must never hang on an unreachable mail host.
/// </summary>
public interface IEmailSender
{
    Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default);
}
