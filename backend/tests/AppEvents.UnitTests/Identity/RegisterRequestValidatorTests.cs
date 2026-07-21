using AppEvents.Application.Identity.Dtos;
using AppEvents.Application.Identity.Validators;
using FluentAssertions;

namespace AppEvents.UnitTests.Identity;

public class RegisterRequestValidatorTests
{
    private readonly RegisterRequestValidator _validator = new();

    [Fact]
    public void Validate_WithValidRequest_HasNoErrors()
    {
        var request = new RegisterRequest("jane.doe@example.com", "Str0ng!Passw0rd", "Jane Doe");

        var result = _validator.Validate(request);

        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("short1!A")]
    [InlineData("alllowercase1!")]
    [InlineData("ALLUPPERCASE1!")]
    [InlineData("NoDigitsHere!")]
    [InlineData("NoSpecialChars123")]
    public void Validate_WithWeakPassword_HasError(string weakPassword)
    {
        var request = new RegisterRequest("jane.doe@example.com", weakPassword, "Jane Doe");

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterRequest.Password));
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-an-email")]
    [InlineData("missing-domain@")]
    public void Validate_WithInvalidEmail_HasError(string invalidEmail)
    {
        var request = new RegisterRequest(invalidEmail, "Str0ng!Passw0rd", "Jane Doe");

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterRequest.Email));
    }

    [Fact]
    public void Validate_WithEmptyFullName_HasError()
    {
        var request = new RegisterRequest("jane.doe@example.com", "Str0ng!Passw0rd", "");

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterRequest.FullName));
    }
}
