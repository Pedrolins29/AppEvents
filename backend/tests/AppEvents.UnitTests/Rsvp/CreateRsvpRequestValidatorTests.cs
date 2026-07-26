using AppEvents.Application.Rsvp.Dtos;
using AppEvents.Application.Rsvp.Validators;
using AppEvents.Domain.Rsvp;
using FluentAssertions;

namespace AppEvents.UnitTests.Rsvp;

public class CreateRsvpRequestValidatorTests
{
    private readonly CreateRsvpRequestValidator _sut = new();

    private static CreateRsvpRequest ValidRequest() => new("Jane Doe", RsvpStatus.Confirmed, null);

    [Fact]
    public void Validate_WithValidRequest_HasNoErrors()
    {
        var result = _sut.Validate(ValidRequest());

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_WithEmptyGuestName_HasError()
    {
        var request = ValidRequest() with { GuestName = "" };

        var result = _sut.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateRsvpRequest.GuestName));
    }

    [Theory]
    [InlineData("<script>alert(1)</script>")]
    [InlineData("Jane <b>Doe</b>")]
    public void Validate_WithHtmlInGuestName_HasError(string maliciousName)
    {
        var request = ValidRequest() with { GuestName = maliciousName };

        var result = _sut.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateRsvpRequest.GuestName));
    }

    [Fact]
    public void Validate_WithInvalidStatus_HasError()
    {
        var request = ValidRequest() with { Status = (RsvpStatus)999 };

        var result = _sut.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateRsvpRequest.Status));
    }

    [Fact]
    public void Validate_WithFilledHoneypot_HasError()
    {
        var request = ValidRequest() with { HoneypotField = "I am a bot" };

        var result = _sut.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateRsvpRequest.HoneypotField));
    }
}
