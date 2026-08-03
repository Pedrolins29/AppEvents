using AppEvents.Application.Common.Exceptions;
using AppEvents.Application.Common.Interfaces;
using AppEvents.Application.Identity.Dtos;
using AppEvents.Application.Identity.Interfaces;
using AppEvents.Application.Identity.Services;
using AppEvents.Domain.Identity;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace AppEvents.UnitTests.Identity;

public class AuthServiceTests
{
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IRefreshTokenRepository _refreshTokenRepository = Substitute.For<IRefreshTokenRepository>();
    private readonly IPasswordHasher _passwordHasher = Substitute.For<IPasswordHasher>();
    private readonly IJwtTokenService _jwtTokenService = Substitute.For<IJwtTokenService>();
    private readonly IDateTimeProvider _dateTimeProvider = Substitute.For<IDateTimeProvider>();
    private readonly IEmailSender _emailSender = Substitute.For<IEmailSender>();
    private readonly IEmailConfirmationLinkBuilder _linkBuilder = Substitute.For<IEmailConfirmationLinkBuilder>();
    private readonly ILogger<AuthService> _logger = Substitute.For<ILogger<AuthService>>();

    private readonly DateTime _now = new(2026, 7, 21, 12, 0, 0, DateTimeKind.Utc);
    private readonly Role _customerRole = new() { Id = Guid.NewGuid(), Name = RoleNames.Customer };

    private AuthService CreateSut()
    {
        _dateTimeProvider.UtcNow.Returns(_now);
        _linkBuilder.Build(Arg.Any<string>()).Returns(callInfo => $"https://example.com/verify-email?token={callInfo.Arg<string>()}");
        return new AuthService(
            _userRepository, _refreshTokenRepository, _passwordHasher, _jwtTokenService,
            _dateTimeProvider, _emailSender, _linkBuilder, _logger);
    }

    private User CreateUser(string password, out string passwordHash)
    {
        passwordHash = $"hash-of-{password}";
        return new User
        {
            Id = Guid.NewGuid(),
            Email = "jane.doe@example.com",
            PasswordHash = passwordHash,
            FullName = "Jane Doe",
            RoleId = _customerRole.Id,
            Role = _customerRole,
            EmailConfirmed = true,
        };
    }

    [Fact]
    public async Task RegisterAsync_WithNewEmail_CreatesUserWithHashedPasswordAndCustomerRole()
    {
        var sut = CreateSut();
        var request = new RegisterRequest("jane.doe@example.com", "Str0ng!Passw0rd", "Jane Doe");

        _userRepository.EmailExistsAsync("jane.doe@example.com", Arg.Any<CancellationToken>()).Returns(false);
        _userRepository.GetRoleByNameAsync(RoleNames.Customer, Arg.Any<CancellationToken>()).Returns(_customerRole);
        _passwordHasher.Hash("Str0ng!Passw0rd").Returns("hashed-password");

        var response = await sut.RegisterAsync(request);

        response.Email.Should().Be("jane.doe@example.com");
        response.Role.Should().Be(RoleNames.Customer);
        await _userRepository.Received(1).AddAsync(
            Arg.Is<User>(u =>
                u!.Email == "jane.doe@example.com" && u.PasswordHash == "hashed-password" && u.RoleId == _customerRole.Id
                && u.EmailConfirmed == false && u.EmailConfirmationTokenHash != null
                && u.EmailConfirmationTokenExpiresAtUtc == _now.AddHours(24)),
            Arg.Any<CancellationToken>());
        await _userRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        await _emailSender.Received(1).SendAsync("jane.doe@example.com", Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Theory]
    [InlineData("pt")]
    [InlineData("es")]
    [InlineData(null)]
    [InlineData("fr")]
    public async Task RegisterAsync_SetsPreferredLocale_FallingBackToEnglishWhenUnsupportedOrMissing(string? requestedLocale)
    {
        var sut = CreateSut();
        var request = new RegisterRequest("jane.doe@example.com", "Str0ng!Passw0rd", "Jane Doe", Locale: requestedLocale);
        var expectedLocale = requestedLocale is "pt" or "es" ? requestedLocale : "en";

        _userRepository.EmailExistsAsync("jane.doe@example.com", Arg.Any<CancellationToken>()).Returns(false);
        _userRepository.GetRoleByNameAsync(RoleNames.Customer, Arg.Any<CancellationToken>()).Returns(_customerRole);

        await sut.RegisterAsync(request);

        await _userRepository.Received(1).AddAsync(
            Arg.Is<User>(u => u!.PreferredLocale == expectedLocale),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RegisterAsync_WithPortugueseLocale_SendsPortugueseConfirmationEmail()
    {
        var sut = CreateSut();
        var request = new RegisterRequest("jane.doe@example.com", "Str0ng!Passw0rd", "Jane Doe", Locale: "pt");

        _userRepository.EmailExistsAsync("jane.doe@example.com", Arg.Any<CancellationToken>()).Returns(false);
        _userRepository.GetRoleByNameAsync(RoleNames.Customer, Arg.Any<CancellationToken>()).Returns(_customerRole);

        await sut.RegisterAsync(request);

        await _emailSender.Received(1).SendAsync(
            "jane.doe@example.com",
            "Confirme sua conta AppEvents",
            Arg.Is<string>(body => body!.Contains("Olá")),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RegisterAsync_WhenEmailSendThrows_StillSucceeds()
    {
        var sut = CreateSut();
        var request = new RegisterRequest("jane.doe@example.com", "Str0ng!Passw0rd", "Jane Doe");

        _userRepository.EmailExistsAsync("jane.doe@example.com", Arg.Any<CancellationToken>()).Returns(false);
        _userRepository.GetRoleByNameAsync(RoleNames.Customer, Arg.Any<CancellationToken>()).Returns(_customerRole);
        _passwordHasher.Hash("Str0ng!Passw0rd").Returns("hashed-password");
        _emailSender.SendAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(_ => Task.FromException(new InvalidOperationException("SMTP unreachable")));

        var response = await sut.RegisterAsync(request);

        response.Email.Should().Be("jane.doe@example.com");
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ThrowsConflictException()
    {
        var sut = CreateSut();
        var request = new RegisterRequest("jane.doe@example.com", "Str0ng!Passw0rd", "Jane Doe");
        _userRepository.EmailExistsAsync("jane.doe@example.com", Arg.Any<CancellationToken>()).Returns(true);

        var act = () => sut.RegisterAsync(request);

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task LoginAsync_WithCorrectPassword_ReturnsTokensAndResetsFailedAttempts()
    {
        var sut = CreateSut();
        var user = CreateUser("Str0ng!Passw0rd", out var hash);
        user.FailedLoginAttempts = 2;

        _userRepository.GetByEmailAsync("jane.doe@example.com", Arg.Any<CancellationToken>()).Returns(user);
        _passwordHasher.Verify("Str0ng!Passw0rd", hash).Returns(true);
        _jwtTokenService.GenerateAccessToken(user).Returns(new AccessToken("access-token", 900));

        var result = await sut.LoginAsync(new LoginRequest("jane.doe@example.com", "Str0ng!Passw0rd"), "127.0.0.1");

        result.AccessToken.Should().Be("access-token");
        user.FailedLoginAttempts.Should().Be(0);
        user.LockoutEndUtc.Should().BeNull();
        await _refreshTokenRepository.Received(1).AddAsync(Arg.Any<RefreshToken>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LoginAsync_WithUnknownEmail_ThrowsGenericUnauthorized()
    {
        var sut = CreateSut();
        _userRepository.GetByEmailAsync("nobody@example.com", Arg.Any<CancellationToken>()).Returns((User?)null);

        var act = () => sut.LoginAsync(new LoginRequest("nobody@example.com", "whatever"), "127.0.0.1");

        await act.Should().ThrowAsync<UnauthorizedAppException>();
    }

    [Fact]
    public async Task LoginAsync_WithWrongPassword_IncrementsFailedAttempts()
    {
        var sut = CreateSut();
        var user = CreateUser("Str0ng!Passw0rd", out var hash);

        _userRepository.GetByEmailAsync("jane.doe@example.com", Arg.Any<CancellationToken>()).Returns(user);
        _passwordHasher.Verify("WrongPassword!1", hash).Returns(false);

        var act = () => sut.LoginAsync(new LoginRequest("jane.doe@example.com", "WrongPassword!1"), "127.0.0.1");

        await act.Should().ThrowAsync<UnauthorizedAppException>();
        user.FailedLoginAttempts.Should().Be(1);
    }

    [Fact]
    public async Task LoginAsync_AfterFiveFailedAttempts_LocksAccount()
    {
        var sut = CreateSut();
        var user = CreateUser("Str0ng!Passw0rd", out var hash);
        user.FailedLoginAttempts = 4;

        _userRepository.GetByEmailAsync("jane.doe@example.com", Arg.Any<CancellationToken>()).Returns(user);
        _passwordHasher.Verify("WrongPassword!1", hash).Returns(false);

        var act = () => sut.LoginAsync(new LoginRequest("jane.doe@example.com", "WrongPassword!1"), "127.0.0.1");

        await act.Should().ThrowAsync<UnauthorizedAppException>();
        user.FailedLoginAttempts.Should().Be(5);
        user.LockoutEndUtc.Should().NotBeNull();
        user.LockoutEndUtc!.Value.Should().BeAfter(_now);
    }

    [Fact]
    public async Task LoginAsync_WhileLockedOut_RejectsEvenWithCorrectPassword()
    {
        var sut = CreateSut();
        var user = CreateUser("Str0ng!Passw0rd", out var hash);
        user.LockoutEndUtc = _now.AddMinutes(10);

        _userRepository.GetByEmailAsync("jane.doe@example.com", Arg.Any<CancellationToken>()).Returns(user);
        _passwordHasher.Verify("Str0ng!Passw0rd", hash).Returns(true);

        var act = () => sut.LoginAsync(new LoginRequest("jane.doe@example.com", "Str0ng!Passw0rd"), "127.0.0.1");

        await act.Should().ThrowAsync<UnauthorizedAppException>();
        _passwordHasher.DidNotReceive().Verify(Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task LoginAsync_WithCorrectPasswordButUnconfirmedEmail_ThrowsEmailNotConfirmed()
    {
        var sut = CreateSut();
        var user = CreateUser("Str0ng!Passw0rd", out var hash);
        user.EmailConfirmed = false;

        _userRepository.GetByEmailAsync("jane.doe@example.com", Arg.Any<CancellationToken>()).Returns(user);
        _passwordHasher.Verify("Str0ng!Passw0rd", hash).Returns(true);

        var act = () => sut.LoginAsync(new LoginRequest("jane.doe@example.com", "Str0ng!Passw0rd"), "127.0.0.1");

        await act.Should().ThrowAsync<EmailNotConfirmedException>();
        user.FailedLoginAttempts.Should().Be(0);
        await _refreshTokenRepository.DidNotReceive().AddAsync(Arg.Any<RefreshToken>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RefreshAsync_WithValidToken_RotatesAndRevokesOldToken()
    {
        var sut = CreateSut();
        var user = CreateUser("Str0ng!Passw0rd", out _);
        const string rawToken = "raw-refresh-token";
        var tokenHash = RefreshTokenGenerator.Hash(rawToken);
        var existingToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            User = user,
            TokenHash = tokenHash,
            ExpiresAtUtc = _now.AddDays(10),
        };

        _refreshTokenRepository.GetByTokenHashAsync(tokenHash, Arg.Any<CancellationToken>()).Returns(existingToken);
        _jwtTokenService.GenerateAccessToken(user).Returns(new AccessToken("new-access-token", 900));

        var result = await sut.RefreshAsync(rawToken, "127.0.0.1");

        result.AccessToken.Should().Be("new-access-token");
        existingToken.RevokedAtUtc.Should().Be(_now);
        existingToken.ReplacedByTokenHash.Should().NotBeNullOrEmpty();
        await _refreshTokenRepository.Received(1).AddAsync(
            Arg.Is<RefreshToken>(rt => rt!.UserId == user.Id && rt.TokenHash == existingToken.ReplacedByTokenHash),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RefreshAsync_WithAlreadyRevokedToken_DetectsReuseAndRevokesAllActiveTokens()
    {
        var sut = CreateSut();
        var user = CreateUser("Str0ng!Passw0rd", out _);
        const string rawToken = "raw-refresh-token";
        var tokenHash = RefreshTokenGenerator.Hash(rawToken);
        var revokedToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            User = user,
            TokenHash = tokenHash,
            ExpiresAtUtc = _now.AddDays(10),
            RevokedAtUtc = _now.AddMinutes(-5),
        };
        var otherActiveToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = "other-hash",
            ExpiresAtUtc = _now.AddDays(5),
        };

        _refreshTokenRepository.GetByTokenHashAsync(tokenHash, Arg.Any<CancellationToken>()).Returns(revokedToken);
        _refreshTokenRepository.GetActiveTokensForUserAsync(user.Id, _now, Arg.Any<CancellationToken>())
            .Returns(new List<RefreshToken> { otherActiveToken });

        var act = () => sut.RefreshAsync(rawToken, "127.0.0.1");

        await act.Should().ThrowAsync<UnauthorizedAppException>();
        otherActiveToken.RevokedAtUtc.Should().Be(_now);
    }

    [Fact]
    public async Task GetProfileAsync_WithUnknownUser_ThrowsNotFoundException()
    {
        var sut = CreateSut();
        var userId = Guid.NewGuid();
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        var act = () => sut.GetProfileAsync(userId);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task ConfirmEmailAsync_WithValidToken_ConfirmsAndIssuesSession()
    {
        var sut = CreateSut();
        var user = CreateUser("Str0ng!Passw0rd", out _);
        user.EmailConfirmed = false;
        user.EmailConfirmationTokenHash = RefreshTokenGenerator.Hash("raw-token");
        user.EmailConfirmationTokenExpiresAtUtc = _now.AddHours(1);

        _userRepository.GetByEmailConfirmationTokenHashAsync(RefreshTokenGenerator.Hash("raw-token"), Arg.Any<CancellationToken>())
            .Returns(user);
        _jwtTokenService.GenerateAccessToken(user).Returns(new AccessToken("access-token", 900));

        var (response, session) = await sut.ConfirmEmailAsync("raw-token", "127.0.0.1");

        response.AlreadyConfirmed.Should().BeFalse();
        response.AccessToken.Should().Be("access-token");
        response.ExpiresInSeconds.Should().Be(900);
        user.EmailConfirmed.Should().BeTrue();
        session.Should().NotBeNull();
        session!.AccessToken.Should().Be("access-token");
        await _userRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        await _refreshTokenRepository.Received(1).AddAsync(
            Arg.Is<RefreshToken>(rt => rt!.UserId == user.Id), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ConfirmEmailAsync_WithUnknownToken_ThrowsNotFound()
    {
        var sut = CreateSut();
        _userRepository.GetByEmailConfirmationTokenHashAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns((User?)null);

        var act = () => sut.ConfirmEmailAsync("garbage-token", "127.0.0.1");

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task ConfirmEmailAsync_WithExpiredToken_ThrowsNotFound()
    {
        var sut = CreateSut();
        var user = CreateUser("Str0ng!Passw0rd", out _);
        user.EmailConfirmed = false;
        user.EmailConfirmationTokenHash = RefreshTokenGenerator.Hash("raw-token");
        user.EmailConfirmationTokenExpiresAtUtc = _now.AddHours(-1);

        _userRepository.GetByEmailConfirmationTokenHashAsync(RefreshTokenGenerator.Hash("raw-token"), Arg.Any<CancellationToken>())
            .Returns(user);

        var act = () => sut.ConfirmEmailAsync("raw-token", "127.0.0.1");

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task ConfirmEmailAsync_AlreadyConfirmed_ReturnsAlreadyConfirmedTrueWithoutIssuingSession()
    {
        var sut = CreateSut();
        var user = CreateUser("Str0ng!Passw0rd", out _);
        user.EmailConfirmed = true;
        user.EmailConfirmationTokenHash = RefreshTokenGenerator.Hash("raw-token");

        _userRepository.GetByEmailConfirmationTokenHashAsync(RefreshTokenGenerator.Hash("raw-token"), Arg.Any<CancellationToken>())
            .Returns(user);

        var (response, session) = await sut.ConfirmEmailAsync("raw-token", "127.0.0.1");

        response.AlreadyConfirmed.Should().BeTrue();
        response.AccessToken.Should().BeNull();
        session.Should().BeNull();
        await _userRepository.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
        await _refreshTokenRepository.DidNotReceive().AddAsync(Arg.Any<RefreshToken>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ResendConfirmationAsync_ForUnconfirmedUser_IssuesNewTokenAndSendsEmail()
    {
        var sut = CreateSut();
        var user = CreateUser("Str0ng!Passw0rd", out _);
        user.EmailConfirmed = false;
        var oldHash = RefreshTokenGenerator.Hash("old-token");
        user.EmailConfirmationTokenHash = oldHash;

        _userRepository.GetByEmailAsync("jane.doe@example.com", Arg.Any<CancellationToken>()).Returns(user);

        await sut.ResendConfirmationAsync("jane.doe@example.com");

        user.EmailConfirmationTokenHash.Should().NotBe(oldHash);
        await _userRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        await _emailSender.Received(1).SendAsync("jane.doe@example.com", Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ResendConfirmationAsync_UsesUsersStoredPreferredLocale()
    {
        var sut = CreateSut();
        var user = CreateUser("Str0ng!Passw0rd", out _);
        user.EmailConfirmed = false;
        user.PreferredLocale = "es";

        _userRepository.GetByEmailAsync("jane.doe@example.com", Arg.Any<CancellationToken>()).Returns(user);

        await sut.ResendConfirmationAsync("jane.doe@example.com");

        await _emailSender.Received(1).SendAsync(
            "jane.doe@example.com",
            "Confirma tu cuenta de AppEvents",
            Arg.Any<string>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ResendConfirmationAsync_ForUnknownEmail_NoOp()
    {
        var sut = CreateSut();
        _userRepository.GetByEmailAsync("nobody@example.com", Arg.Any<CancellationToken>()).Returns((User?)null);

        await sut.ResendConfirmationAsync("nobody@example.com");

        await _userRepository.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
        await _emailSender.DidNotReceive().SendAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ResendConfirmationAsync_ForAlreadyConfirmedUser_NoOp()
    {
        var sut = CreateSut();
        var user = CreateUser("Str0ng!Passw0rd", out _);
        user.EmailConfirmed = true;

        _userRepository.GetByEmailAsync("jane.doe@example.com", Arg.Any<CancellationToken>()).Returns(user);

        await sut.ResendConfirmationAsync("jane.doe@example.com");

        await _userRepository.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
        await _emailSender.DidNotReceive().SendAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }
}
