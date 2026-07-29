namespace AppEvents.Domain.Identity;

public static class SupportedLocales
{
    public const string English = "en";
    public const string Portuguese = "pt";
    public const string Spanish = "es";

    public const string Default = English;

    public static readonly string[] All = [English, Portuguese, Spanish];

    public static bool IsSupported(string? locale) => locale is not null && All.Contains(locale);
}
