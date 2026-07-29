using System.Net;
using System.Text;
using AppEvents.Domain.Identity;

namespace AppEvents.Application.Identity.Emails;

/// <summary>
/// The backend has no i18n runtime of its own (that's a frontend-only concern via next-intl's
/// message files) - these strings are hand-maintained copies of the same handful of lines,
/// duplicated deliberately rather than shared across the runtime boundary.
/// </summary>
public static class ConfirmationEmailTemplates
{
    private sealed record Template(string Subject, string GreetingFormat, string Intro, string ButtonText, string Footer);

    private static readonly Dictionary<string, Template> Templates = new()
    {
        [SupportedLocales.English] = new Template(
            Subject: "Confirm your AppEvents account",
            GreetingFormat: "Hi {0},",
            Intro: "Thanks for creating an AppEvents account. Please confirm your email address to activate it:",
            ButtonText: "Confirm my email",
            Footer: "This link expires in 24 hours. If you didn't create this account, you can safely ignore this email."),

        [SupportedLocales.Portuguese] = new Template(
            Subject: "Confirme sua conta AppEvents",
            GreetingFormat: "Olá {0},",
            Intro: "Obrigado por criar uma conta no AppEvents. Confirme seu endereço de email para ativá-la:",
            ButtonText: "Confirmar meu email",
            Footer: "Este link expira em 24 horas. Se você não criou esta conta, pode ignorar este email com segurança."),

        [SupportedLocales.Spanish] = new Template(
            Subject: "Confirma tu cuenta de AppEvents",
            GreetingFormat: "Hola {0},",
            Intro: "Gracias por crear una cuenta en AppEvents. Confirma tu dirección de correo para activarla:",
            ButtonText: "Confirmar mi correo",
            Footer: "Este enlace caduca en 24 horas. Si no creaste esta cuenta, puedes ignorar este correo de forma segura."),
    };

    public static (string Subject, string HtmlBody) Build(string locale, string fullName, string confirmationLink)
    {
        var template = Templates.GetValueOrDefault(locale) ?? Templates[SupportedLocales.Default];
        var encodedName = WebUtility.HtmlEncode(fullName);

        var html = new StringBuilder();
        html.Append($"<p>{string.Format(template.GreetingFormat, encodedName)}</p>");
        html.Append($"<p>{template.Intro}</p>");
        html.Append($"<p><a href=\"{confirmationLink}\">{template.ButtonText}</a></p>");
        html.Append($"<p>{template.Footer}</p>");

        return (template.Subject, html.ToString());
    }
}
