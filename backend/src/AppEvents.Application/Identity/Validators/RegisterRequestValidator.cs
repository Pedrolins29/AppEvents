using AppEvents.Application.Identity.Dtos;
using AppEvents.Domain.Identity;
using FluentValidation;

namespace AppEvents.Application.Identity.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(x => x.FullName)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(10)
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain at least one digit.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character.");

        RuleFor(x => x.HoneypotField)
            .Empty()
            .WithMessage("Submission rejected.");

        RuleFor(x => x.Locale)
            .Must(SupportedLocales.IsSupported)
            .When(x => x.Locale is not null)
            .WithMessage("Locale must be one of: en, pt, es.");
    }
}
