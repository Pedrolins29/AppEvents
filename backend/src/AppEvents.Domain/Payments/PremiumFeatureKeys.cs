namespace AppEvents.Domain.Payments;

// Stable identifiers for the premium features Sprint 14's checkout unlocks. None of these
// features exist yet - each is built in its own later sprint, already gated by
// IEntitlementService.HasEntitlementAsync(userId, key, eventId?) against one of these keys.
public static class PremiumFeatureKeys
{
    public const string WeddingGroomsmenManual = "wedding.groomsmen-manual";

    // Same feature as Sprint 15's planned WhatsApp RSVP-reminder bot - the key exists now so the
    // entitlement model is ready before that sprint builds the bot itself.
    public const string WeddingRsvpWhatsappReminders = "wedding.rsvp-whatsapp-reminders";

    public const string BabyShowerGenderGuessGame = "babyshower.gender-guess-game";

    public const string BabyShowerRegistryAssistant = "babyshower.registry-assistant";

    public const string CorporateQrCheckin = "corporate.qr-checkin";

    public const string CorporateWhiteLabel = "corporate.white-label";
}
