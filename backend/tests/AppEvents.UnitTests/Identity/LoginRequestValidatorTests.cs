using AppEvents.Application.Identity.Dtos;
using AppEvents.Application.Identity.Validators;
using FluentAssertions;

namespace AppEvents.UnitTests.Identity;

public class LoginRequestValidatorTests
{
    private readonly LoginRequestValidator _validator = new();

    [Fact]
    public void Validate_WithValidRequest_HasNoErrors()
    {
        var request = new LoginRequest("jane.doe@example.com", "anything");

        var result = _validator.Validate(request);

        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-an-email")]
    public void Validate_WithInvalidEmail_HasError(string invalidEmail)
    {
        var request = new LoginRequest(invalidEmail, "anything");

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void Validate_WithEmptyPassword_HasError()
    {
        var request = new LoginRequest("jane.doe@example.com", "");

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(LoginRequest.Password));
    }
}
