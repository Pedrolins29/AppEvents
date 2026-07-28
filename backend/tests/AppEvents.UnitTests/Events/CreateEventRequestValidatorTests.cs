using AppEvents.Application.Events.Dtos;
using AppEvents.Application.Events.Validators;
using AppEvents.Application.Identity.Interfaces;
using AppEvents.Domain.Events;
using FluentAssertions;
using NSubstitute;

namespace AppEvents.UnitTests.Events;

public class CreateEventRequestValidatorTests
{
    private readonly IDateTimeProvider _dateTimeProvider = Substitute.For<IDateTimeProvider>();
    private readonly DateTime _now = new(2026, 7, 22, 12, 0, 0, DateTimeKind.Utc);

    private CreateEventRequestValidator CreateSut()
    {
        _dateTimeProvider.UtcNow.Returns(_now);
        return new CreateEventRequestValidator(_dateTimeProvider);
    }

    private CreateEventRequest ValidRequest() => new(
        "John and Mary's Wedding",
        "john-and-mary",
        EventType.Wedding,
        _now.AddDays(30),
        "A celebration of love",
        "123 Main St",
        null,
        null,
        null);

    [Fact]
    public void Validate_WithValidRequest_HasNoErrors()
    {
        var result = CreateSut().Validate(ValidRequest());

        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("Has Spaces")]
    [InlineData("UPPERCASE")]
    [InlineData("double--hyphen")]
    [InlineData("ab")]
    [InlineData("has_underscore")]
    public void Validate_WithInvalidSlug_HasError(string invalidSlug)
    {
        var request = ValidRequest() with { Slug = invalidSlug };

        var result = CreateSut().Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateEventRequest.Slug));
    }

    [Fact]
    public void Validate_WithPastEventDate_HasError()
    {
        var request = ValidRequest() with { EventDate = _now.AddDays(-1) };

        var result = CreateSut().Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateEventRequest.EventDate));
    }

    [Theory]
    [InlineData("<script>alert(1)</script>")]
    [InlineData("Name with <b>tag</b>")]
    public void Validate_WithHtmlInName_HasError(string maliciousName)
    {
        var request = ValidRequest() with { Name = maliciousName };

        var result = CreateSut().Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateEventRequest.Name));
    }

    [Fact]
    public void Validate_WithHtmlInDescription_HasError()
    {
        var request = ValidRequest() with { Description = "<img src=x onerror=alert(1)>" };

        var result = CreateSut().Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateEventRequest.Description));
    }

    [Fact]
    public void Validate_WithInvalidEventType_HasError()
    {
        var request = ValidRequest() with { EventType = (EventType)999 };

        var result = CreateSut().Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateEventRequest.EventType));
    }

    [Fact]
    public void Validate_WithHtmlInDressCode_HasError()
    {
        var request = ValidRequest() with { DressCode = "<script>alert(1)</script>" };

        var result = CreateSut().Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateEventRequest.DressCode));
    }

    [Fact]
    public void Validate_WithOverlongDressCode_HasError()
    {
        var request = ValidRequest() with { DressCode = new string('a', 151) };

        var result = CreateSut().Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateEventRequest.DressCode));
    }

    [Fact]
    public void Validate_WithTooManyTimelineItems_HasError()
    {
        var items = Enumerable.Range(0, 16).Select(i => new TimelineItemDto($"{i}:00", $"Item {i}")).ToList();
        var request = ValidRequest() with { TimelineItems = items };

        var result = CreateSut().Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateEventRequest.TimelineItems));
    }

    [Fact]
    public void Validate_WithEmptyTimelineItemLabel_HasError()
    {
        var request = ValidRequest() with { TimelineItems = [new TimelineItemDto("12:00", "")] };

        var result = CreateSut().Validate(request);

        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void Validate_WithHtmlInTimelineItem_HasError()
    {
        var request = ValidRequest() with { TimelineItems = [new TimelineItemDto("12:00", "<b>Ceremony</b>")] };

        var result = CreateSut().Validate(request);

        result.IsValid.Should().BeFalse();
    }
}
