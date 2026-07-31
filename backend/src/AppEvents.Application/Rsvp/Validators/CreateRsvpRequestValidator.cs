using AppEvents.Application.Events.Validators;
using AppEvents.Application.Rsvp.Dtos;
using AppEvents.Domain.Rsvp;
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

        // A guest submission is always a decision - "Pending" is an organizer-only state a guest
        // can never post back.
        RuleFor(x => x.Status)
            .IsInEnum()
            .Must(status => status is RsvpStatus.Confirmed or RsvpStatus.Declined)
            .WithMessage("Status must be Confirmed or Declined.");

        RuleFor(x => x.InviteToken)
            .MaximumLength(64)
            .When(x => !string.IsNullOrEmpty(x.InviteToken));

        RuleFor(x => x.HoneypotField)
            .Empty()
            .WithMessage("Submission rejected.");
    }
}
