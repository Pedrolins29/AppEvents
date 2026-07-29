using AppEvents.Application.Identity.Dtos;
using FluentValidation;

namespace AppEvents.Application.Identity.Validators;

public class ResendConfirmationRequestValidator : AbstractValidator<ResendConfirmationRequest>
{
    public ResendConfirmationRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);
    }
}
