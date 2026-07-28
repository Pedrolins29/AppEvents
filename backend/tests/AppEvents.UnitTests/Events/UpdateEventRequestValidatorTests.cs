using AppEvents.Application.Events.Dtos;
using AppEvents.Application.Events.Validators;
using AppEvents.Application.Identity.Interfaces;
using AppEvents.Domain.Events;
using FluentAssertions;
using NSubstitute;

namespace AppEvents.UnitTests.Events;

public class UpdateEventRequestValidatorTests
{
    private readonly IDateTimeProvider _dateTimeProvider = Substitute.For<IDateTimeProvider>();
    private readonly DateTime _now = new(2026, 7, 22, 12, 0, 0, DateTimeKind.Utc);

    private UpdateEventRequestValidator CreateSut()
    {
        _dateTimeProvider.UtcNow.Returns(_now);
        return new UpdateEventRequestValidator(_dateTimeProvider);
    }

    private UpdateEventRequest ValidRequest() => new(
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

    [Fact]
    public void Validate_WithInvalidSlug_HasError()
    {
        var request = ValidRequest() with { Slug = "Invalid Slug!" };

        var result = CreateSut().Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateEventRequest.Slug));
    }

    [Fact]
    public void Validate_WithPastEventDate_HasError()
    {
        var request = ValidRequest() with { EventDate = _now.AddDays(-1) };

        var result = CreateSut().Validate(request);

        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void Validate_WithHtmlInAddress_HasError()
    {
        var request = ValidRequest() with { Address = "<script>evil()</script>" };

        var result = CreateSut().Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateEventRequest.Address));
    }
}
