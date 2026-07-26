using AppEvents.Application.Events.Validators;
using AppEvents.Application.Rsvp.Dtos;
using FluentValidation;

namespace AppEvents.Application.Rsvp.Validators;

public class CreateRsvpRequestValidator : AbstractValidator<CreateRsvpRequest>
{
    public CreateRsvpRequestValidator()
    {
        RuleFor(x => x.GuestName)
            .NotEmpty()
            .MaximumLength(200)
            .NoHtmlTags();

        RuleFor(x => x.Status)
            .IsInEnum();

        RuleFor(x => x.HoneypotField)
            .Empty()
            .WithMessage("Submission rejected.");
    }
}
