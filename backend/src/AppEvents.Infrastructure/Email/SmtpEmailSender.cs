using AppEvents.Application.Common.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace AppEvents.Infrastructure.Email;

/// <summary>
/// Generic SMTP client (MailKit), not a provider-specific SDK — every real transactional email
/// provider (Resend, SendGrid, Postmark, Mailgun, SES) also exposes an SMTP relay alongside its
/// API, so swapping providers is a config change here, never a code change. In local dev this
/// points at Mailpit (docker-compose.yaml), which needs no credentials at all.
/// </summary>
public class SmtpEmailSender : IEmailSender
{
    private static readonly TimeSpan SendTimeout = TimeSpan.FromSeconds(10);

    private readonly IConfiguration _configuration;

    public SmtpEmailSender(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        var host = _configuration["Email:Host"] ?? "localhost";
        var port = int.TryParse(_configuration["Email:Port"], out var parsedPort) ? parsedPort : 1025;
        var username = _configuration["Email:Username"];
        var password = _configuration["Email:Password"];
        var fromAddress = _configuration["Email:FromAddress"] ?? "no-reply@appevents.local";
        var fromName = _configuration["Email:FromName"] ?? "AppEvents";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromAddress));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(SendTimeout);

        using var client = new SmtpClient();
        await client.ConnectAsync(host, port, SecureSocketOptions.Auto, cts.Token);
        if (!string.IsNullOrEmpty(username))
        {
            await client.AuthenticateAsync(username, password ?? string.Empty, cts.Token);
        }
        await client.SendAsync(message, cts.Token);
        await client.DisconnectAsync(true, cts.Token);
    }
}
