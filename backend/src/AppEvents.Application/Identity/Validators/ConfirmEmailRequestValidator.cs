using AppEvents.Application.Identity.Dtos;
using FluentValidation;

namespace AppEvents.Application.Identity.Validators;

public class ConfirmEmailRequestValidator : AbstractValidator<ConfirmEmailRequest>
{
    public ConfirmEmailRequestValidator()
    {
        RuleFor(x => x.Token)
            .NotEmpty();
    }
}
