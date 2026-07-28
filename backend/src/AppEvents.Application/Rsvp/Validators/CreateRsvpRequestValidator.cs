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

        RuleFor(x => x.GuestEmail)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(320)
            .NoHtmlTags();

        RuleFor(x => x.GuestPhone)
            .MaximumLength(30)
            .NoHtmlTags()
            .When(x => !string.IsNullOrEmpty(x.GuestPhone));

        RuleFor(x => x.Status)
            .IsInEnum();

        RuleFor(x => x.HoneypotField)
            .Empty()
            .WithMessage("Submission rejected.");
    }
}
