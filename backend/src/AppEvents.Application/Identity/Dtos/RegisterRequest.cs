namespace AppEvents.Application.Identity.Dtos;

/// <summary>
/// HoneypotField must arrive empty - it's a hidden input real registrants never see or fill, so a
/// non-empty value marks the submission as automated (see RegisterRequestValidator). Locale is the
/// frontend's current UI language (en/pt/es) at signup time, used to pick the confirmation email's
/// language and stored on the user for later resends. Both default to null/absent so existing
/// positional-constructor call sites (tests) keep compiling unchanged; AuthService falls back to
/// SupportedLocales.Default when Locale is null or unrecognized.
/// </summary>
public record RegisterRequest(string Email, string Password, string FullName, string? HoneypotField = null, string? Locale = null);
