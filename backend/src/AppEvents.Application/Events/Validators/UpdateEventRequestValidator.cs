using AppEvents.Application.Events.Dtos;
using AppEvents.Application.Identity.Interfaces;
using FluentValidation;

namespace AppEvents.Application.Events.Validators;

public class UpdateEventRequestValidator : AbstractValidator<UpdateEventRequest>
{
    public UpdateEventRequestValidator(IDateTimeProvider dateTimeProvider)
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200)
            .NoHtmlTags();

        RuleFor(x => x.Slug)
            .NotEmpty()
            .Length(3, 100)
            .Matches("^[a-z0-9]+(-[a-z0-9]+)*$")
            .WithMessage("Slug must contain only lowercase letters, numbers, and single hyphens between segments.");

        RuleFor(x => x.EventType)
            .IsInEnum();

        RuleFor(x => x.EventDate)
            .Must(date => date.Date >= dateTimeProvider.UtcNow.Date)
            .WithMessage("Event date must not be in the past.");

        RuleFor(x => x.Description)
            .MaximumLength(2000)
            .NoHtmlTags();

        RuleFor(x => x.Address)
            .MaximumLength(300)
            .NoHtmlTags();

        RuleFor(x => x.DressCode)
            .MaximumLength(150)
            .NoHtmlTags();

        RuleFor(x => x.TimelineItems)
            .Must(items => items == null || items.Count <= MaxTimelineItems)
            .WithMessage($"An event can have at most {MaxTimelineItems} timeline items.");

        RuleForEach(x => x.TimelineItems).ChildRules(item =>
        {
            item.RuleFor(i => i.Time)
                .NotEmpty()
                .MaximumLength(20)
                .NoHtmlTags();

            item.RuleFor(i => i.Label)
                .NotEmpty()
                .MaximumLength(100)
                .NoHtmlTags();
        });
    }

    private const int MaxTimelineItems = 15;
}
