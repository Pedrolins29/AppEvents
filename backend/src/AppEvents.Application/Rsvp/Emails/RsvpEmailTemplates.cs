using System.Globalization;
using System.Net;
using System.Text;
using AppEvents.Application.Events.Dtos;
using AppEvents.Domain.Events;
using AppEvents.Domain.Identity;
using AppEvents.Domain.Rsvp;

namespace AppEvents.Application.Rsvp.Emails;

/// <summary>
/// Same hand-maintained-copy convention as Identity/Emails/ConfirmationEmailTemplates.cs - the
/// backend has no i18n runtime, so these are duplicated per locale deliberately. Dates are also
/// formatted against an explicit CultureInfo per locale (not the server's default thread culture),
/// otherwise "segunda-feira" would come out as "Monday" even inside an otherwise-Portuguese email.
/// </summary>
public static class RsvpEmailTemplates
{
    private sealed record GuestConfirmationLabels(
        string SubjectFormat, string GreetingFormat, string ConfirmedFormat, string DateLabel,
        string LocationLabel, string MapsText, string WazeText, string Closing);

    private sealed record OrganizerNotificationLabels(
        string SubjectFormat, string Intro, string NameLabel, string StatusLabel, string EmailLabel, string PhoneLabel);

    private sealed record ReminderLabels(
        string SubjectFormat, string GreetingFormat, string BodyFormat, string LinkIntro, string LinkText, string Closing);

    private static readonly Dictionary<string, GuestConfirmationLabels> GuestConfirmation = new()
    {
        [SupportedLocales.English] = new GuestConfirmationLabels(
            SubjectFormat: "You're confirmed: {0}",
            GreetingFormat: "Hi {0},",
            ConfirmedFormat: "You're confirmed for <strong>{0}</strong> ({1}).",
            DateLabel: "Date:",
            LocationLabel: "Location:",
            MapsText: "Open in Google Maps",
            WazeText: "Open in Waze",
            Closing: "We can't wait to see you there."),

        [SupportedLocales.Portuguese] = new GuestConfirmationLabels(
            SubjectFormat: "Você está confirmado(a): {0}",
            GreetingFormat: "Olá, {0},",
            ConfirmedFormat: "Sua presença está confirmada em <strong>{0}</strong> ({1}).",
            DateLabel: "Data:",
            LocationLabel: "Local:",
            MapsText: "Abrir no Google Maps",
            WazeText: "Abrir no Waze",
            Closing: "Mal podemos esperar para ver você lá."),

        [SupportedLocales.Spanish] = new GuestConfirmationLabels(
            SubjectFormat: "Estás confirmado/a: {0}",
            GreetingFormat: "Hola, {0},",
            ConfirmedFormat: "Tu presencia está confirmada en <strong>{0}</strong> ({1}).",
            DateLabel: "Fecha:",
            LocationLabel: "Ubicación:",
            MapsText: "Abrir en Google Maps",
            WazeText: "Abrir en Waze",
            Closing: "No podemos esperar a verte allí."),
    };

    private static readonly Dictionary<string, OrganizerNotificationLabels> OrganizerNotification = new()
    {
        [SupportedLocales.English] = new OrganizerNotificationLabels(
            SubjectFormat: "New RSVP for {0}: {1} ({2})",
            Intro: "New RSVP for",
            NameLabel: "Name:",
            StatusLabel: "Status:",
            EmailLabel: "Email:",
            PhoneLabel: "Phone:"),

        [SupportedLocales.Portuguese] = new OrganizerNotificationLabels(
            SubjectFormat: "Nova confirmação para {0}: {1} ({2})",
            Intro: "Nova resposta de RSVP para",
            NameLabel: "Nome:",
            StatusLabel: "Status:",
            EmailLabel: "E-mail:",
            PhoneLabel: "Telefone:"),

        [SupportedLocales.Spanish] = new OrganizerNotificationLabels(
            SubjectFormat: "Nueva confirmación para {0}: {1} ({2})",
            Intro: "Nueva respuesta de RSVP para",
            NameLabel: "Nombre:",
            StatusLabel: "Estado:",
            EmailLabel: "Correo:",
            PhoneLabel: "Teléfono:"),
    };

    private static readonly Dictionary<string, ReminderLabels> Reminder = new()
    {
        [SupportedLocales.English] = new ReminderLabels(
            SubjectFormat: "Please confirm: {0}",
            GreetingFormat: "Hi {0},",
            BodyFormat: "We'd love to know if you can join us for <strong>{0}</strong> on {1}.",
            LinkIntro: "It only takes a moment — ",
            LinkText: "confirm your presence here",
            Closing: "Hope to see you there!"),

        [SupportedLocales.Portuguese] = new ReminderLabels(
            SubjectFormat: "Confirme sua presença: {0}",
            GreetingFormat: "Olá, {0},",
            BodyFormat: "Adoraríamos saber se você poderá vir para <strong>{0}</strong> em {1}.",
            LinkIntro: "Leva só um instante — ",
            LinkText: "confirme sua presença aqui",
            Closing: "Esperamos ver você lá!"),

        [SupportedLocales.Spanish] = new ReminderLabels(
            SubjectFormat: "Confirma tu asistencia: {0}",
            GreetingFormat: "Hola, {0},",
            BodyFormat: "Nos encantaría saber si podrás acompañarnos en <strong>{0}</strong> el {1}.",
            LinkIntro: "Solo toma un momento — ",
            LinkText: "confirma tu asistencia aquí",
            Closing: "¡Esperamos verte allí!"),
    };

    private static readonly Dictionary<string, Dictionary<EventType, string>> EventTypeLabels = new()
    {
        [SupportedLocales.English] = new()
        {
            [EventType.Wedding] = "Wedding",
            [EventType.Birthday] = "Birthday",
            [EventType.Graduation] = "Graduation",
            [EventType.FifteenYearsParty] = "15th Birthday",
            [EventType.BabyShower] = "Baby Shower",
            [EventType.GenderReveal] = "Gender Reveal",
        },
        [SupportedLocales.Portuguese] = new()
        {
            [EventType.Wedding] = "Casamento",
            [EventType.Birthday] = "Aniversário",
            [EventType.Graduation] = "Formatura",
            [EventType.FifteenYearsParty] = "Debutante (15 anos)",
            [EventType.BabyShower] = "Chá de Bebê",
            [EventType.GenderReveal] = "Chá Revelação",
        },
        [SupportedLocales.Spanish] = new()
        {
            [EventType.Wedding] = "Boda",
            [EventType.Birthday] = "Cumpleaños",
            [EventType.Graduation] = "Graduación",
            [EventType.FifteenYearsParty] = "Quince Años",
            [EventType.BabyShower] = "Baby Shower",
            [EventType.GenderReveal] = "Revelación de Género",
        },
    };

    private static readonly Dictionary<string, Dictionary<RsvpStatus, string>> StatusLabels = new()
    {
        [SupportedLocales.English] = new()
        {
            [RsvpStatus.Pending] = "Pending",
            [RsvpStatus.Confirmed] = "Confirmed",
            [RsvpStatus.Declined] = "Declined",
        },
        [SupportedLocales.Portuguese] = new()
        {
            [RsvpStatus.Pending] = "Pendente",
            [RsvpStatus.Confirmed] = "Confirmado",
            [RsvpStatus.Declined] = "Recusado",
        },
        [SupportedLocales.Spanish] = new()
        {
            [RsvpStatus.Pending] = "Pendiente",
            [RsvpStatus.Confirmed] = "Confirmado",
            [RsvpStatus.Declined] = "Rechazado",
        },
    };

    private static readonly Dictionary<string, CultureInfo> DateCultures = new()
    {
        [SupportedLocales.English] = CultureInfo.GetCultureInfo("en-US"),
        [SupportedLocales.Portuguese] = CultureInfo.GetCultureInfo("pt-BR"),
        [SupportedLocales.Spanish] = CultureInfo.GetCultureInfo("es-ES"),
    };

    public static (string Subject, string HtmlBody) BuildGuestConfirmation(string locale, Event @event, Guest guest)
    {
        var labels = GuestConfirmation.GetValueOrDefault(locale) ?? GuestConfirmation[SupportedLocales.Default];
        var eventTypeLabel = EventTypeLabel(locale, @event.EventType);
        var encodedName = WebUtility.HtmlEncode(guest.GuestName);
        var encodedEventName = WebUtility.HtmlEncode(@event.Name);

        var html = new StringBuilder();
        html.Append($"<p>{string.Format(labels.GreetingFormat, encodedName)}</p>");
        html.Append($"<p>{string.Format(labels.ConfirmedFormat, encodedEventName, eventTypeLabel)}</p>");
        html.Append($"<p><strong>{labels.DateLabel}</strong> {FormatEventDate(locale, @event.EventDate)}</p>");

        if (!string.IsNullOrWhiteSpace(@event.Description))
        {
            html.Append($"<p>{WebUtility.HtmlEncode(@event.Description)}</p>");
        }

        if (!string.IsNullOrWhiteSpace(@event.Address))
        {
            var encodedAddress = Uri.EscapeDataString(@event.Address);
            html.Append($"<p><strong>{labels.LocationLabel}</strong> {WebUtility.HtmlEncode(@event.Address)}<br/>");
            html.Append($"<a href=\"https://www.google.com/maps/search/?api=1&query={encodedAddress}\">{labels.MapsText}</a> &middot; ");
            html.Append($"<a href=\"https://waze.com/ul?q={encodedAddress}&navigate=yes\">{labels.WazeText}</a></p>");
        }

        html.Append($"<p>{labels.Closing}</p>");

        return (string.Format(labels.SubjectFormat, @event.Name), html.ToString());
    }

    public static (string Subject, string HtmlBody) BuildOrganizerNotification(string locale, Event @event, Guest guest)
    {
        var labels = OrganizerNotification.GetValueOrDefault(locale) ?? OrganizerNotification[SupportedLocales.Default];
        var statusLabel = StatusLabel(locale, guest.Status);

        var html = new StringBuilder();
        html.Append($"<p>{labels.Intro} <strong>{WebUtility.HtmlEncode(@event.Name)}</strong>:</p>");
        html.Append("<ul>");
        html.Append($"<li><strong>{labels.NameLabel}</strong> {WebUtility.HtmlEncode(guest.GuestName)}</li>");
        html.Append($"<li><strong>{labels.StatusLabel}</strong> {statusLabel}</li>");
        if (!string.IsNullOrWhiteSpace(guest.GuestEmail))
        {
            html.Append($"<li><strong>{labels.EmailLabel}</strong> {WebUtility.HtmlEncode(guest.GuestEmail)}</li>");
        }
        if (!string.IsNullOrWhiteSpace(guest.GuestPhone))
        {
            html.Append($"<li><strong>{labels.PhoneLabel}</strong> {WebUtility.HtmlEncode(guest.GuestPhone)}</li>");
        }
        html.Append("</ul>");

        var subject = string.Format(labels.SubjectFormat, @event.Name, guest.GuestName, statusLabel);
        return (subject, html.ToString());
    }

    public static (string Subject, string HtmlBody) BuildReminder(string locale, EventResponse @event, Guest guest, string personalLink)
    {
        var labels = Reminder.GetValueOrDefault(locale) ?? Reminder[SupportedLocales.Default];
        var encodedName = WebUtility.HtmlEncode(guest.GuestName);

        var html = new StringBuilder();
        html.Append($"<p>{string.Format(labels.GreetingFormat, encodedName)}</p>");
        html.Append($"<p>{string.Format(labels.BodyFormat, WebUtility.HtmlEncode(@event.Name), FormatEventDate(locale, @event.EventDate))}</p>");
        html.Append($"<p>{labels.LinkIntro}<a href=\"{WebUtility.HtmlEncode(personalLink)}\">{labels.LinkText}</a>.</p>");
        html.Append($"<p>{labels.Closing}</p>");

        return (string.Format(labels.SubjectFormat, @event.Name), html.ToString());
    }

    private static string EventTypeLabel(string locale, EventType eventType)
    {
        var map = EventTypeLabels.GetValueOrDefault(locale) ?? EventTypeLabels[SupportedLocales.Default];
        return map.GetValueOrDefault(eventType) ?? eventType.ToString();
    }

    private static string StatusLabel(string locale, RsvpStatus status)
    {
        var map = StatusLabels.GetValueOrDefault(locale) ?? StatusLabels[SupportedLocales.Default];
        return map.GetValueOrDefault(status) ?? status.ToString();
    }

    private static string FormatEventDate(string locale, DateTime date)
    {
        var culture = DateCultures.GetValueOrDefault(locale) ?? DateCultures[SupportedLocales.Default];
        return date.ToString("dddd, MMMM d, yyyy", culture);
    }
}
