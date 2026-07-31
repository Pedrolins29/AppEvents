using AppEvents.Application.Events.Validators;
using AppEvents.Application.Rsvp.Dtos;
using FluentValidation;

namespace AppEvents.Application.Rsvp.Validators;

public class AddGuestRequestValidator : AbstractValidator<AddGuestRequest>
{
    public AddGuestRequestValidator()
    {
        RuleFor(x => x.GuestName)
            .NotEmpty()
            .MaximumLength(200)
            .NoHtmlTags();

        RuleFor(x => x.GuestEmail)
            .EmailAddress()
            .MaximumLength(320)
            .NoHtmlTags()
            .When(x => !string.IsNullOrEmpty(x.GuestEmail));

        RuleFor(x => x.GuestPhone)
            .MaximumLength(30)
            .NoHtmlTags()
            .When(x => !string.IsNullOrEmpty(x.GuestPhone));
    }
}

public class UpdateGuestRequestValidator : AbstractValidator<UpdateGuestRequest>
{
    public UpdateGuestRequestValidator()
    {
        RuleFor(x => x.GuestName)
            .NotEmpty()
            .MaximumLength(200)
            .NoHtmlTags();

        RuleFor(x => x.GuestEmail)
            .EmailAddress()
            .MaximumLength(320)
            .NoHtmlTags()
            .When(x => !string.IsNullOrEmpty(x.GuestEmail));

        RuleFor(x => x.GuestPhone)
            .MaximumLength(30)
            .NoHtmlTags()
            .When(x => !string.IsNullOrEmpty(x.GuestPhone));

        RuleFor(x => x.Status)
            .IsInEnum();
    }
}
