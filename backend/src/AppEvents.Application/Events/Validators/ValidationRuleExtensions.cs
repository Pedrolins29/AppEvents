using FluentValidation;

namespace AppEvents.Application.Events.Validators;

public static class ValidationRuleExtensions
{
    /// <summary>
    /// Rejects raw angle brackets in free-text fields. React escapes output by default, but this
    /// blocks stored XSS payloads at the point of entry too, per the OWASP input-sanitization
    /// requirement for Sprint 02.
    /// </summary>
    public static IRuleBuilderOptions<T, string?> NoHtmlTags<T>(this IRuleBuilder<T, string?> ruleBuilder) =>
        ruleBuilder.Must(value => value is null || (!value.Contains('<') && !value.Contains('>')))
            .WithMessage("must not contain '<' or '>' characters.");
}
