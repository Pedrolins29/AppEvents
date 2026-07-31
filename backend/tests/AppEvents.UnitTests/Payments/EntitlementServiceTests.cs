using AppEvents.Application.Identity.Interfaces;
using AppEvents.Application.Payments.Interfaces;
using AppEvents.Application.Payments.Services;
using AppEvents.Domain.Payments;
using FluentAssertions;
using NSubstitute;

namespace AppEvents.UnitTests.Payments;

public class EntitlementServiceTests
{
    private readonly IEntitlementRepository _entitlementRepository = Substitute.For<IEntitlementRepository>();
    private readonly IDateTimeProvider _dateTimeProvider = Substitute.For<IDateTimeProvider>();

    private readonly DateTime _now = new(2026, 7, 30, 12, 0, 0, DateTimeKind.Utc);
    private readonly Guid _userId = Guid.NewGuid();

    private EntitlementService CreateSut()
    {
        _dateTimeProvider.UtcNow.Returns(_now);
        return new EntitlementService(_entitlementRepository, _dateTimeProvider);
    }

    private Entitlement MakeEntitlement(string featureKey, Guid? eventId = null, DateTime? revokedAtUtc = null) => new()
    {
        UserId = _userId,
        EventId = eventId,
        FeatureKey = featureKey,
        SourceOrderId = Guid.NewGuid(),
        GrantedAtUtc = _now.AddDays(-1),
        RevokedAtUtc = revokedAtUtc,
    };

    [Fact]
    public async Task HasEntitlementAsync_WhenActiveMatchingFeature_ReturnsTrue()
    {
        var sut = CreateSut();
        _entitlementRepository.GetByUserIdAsync(_userId, Arg.Any<CancellationToken>())
            .Returns([MakeEntitlement(PremiumFeatureKeys.WeddingGroomsmenManual)]);

        var result = await sut.HasEntitlementAsync(_userId, PremiumFeatureKeys.WeddingGroomsmenManual);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task HasEntitlementAsync_WhenNoMatchingFeature_ReturnsFalse()
    {
        var sut = CreateSut();
        _entitlementRepository.GetByUserIdAsync(_userId, Arg.Any<CancellationToken>())
            .Returns([MakeEntitlement(PremiumFeatureKeys.BabyShowerGenderGuessGame)]);

        var result = await sut.HasEntitlementAsync(_userId, PremiumFeatureKeys.WeddingGroomsmenManual);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task HasEntitlementAsync_WhenRevoked_ReturnsFalse()
    {
        var sut = CreateSut();
        _entitlementRepository.GetByUserIdAsync(_userId, Arg.Any<CancellationToken>())
            .Returns([MakeEntitlement(PremiumFeatureKeys.WeddingGroomsmenManual, revokedAtUtc: _now.AddHours(-1))]);

        var result = await sut.HasEntitlementAsync(_userId, PremiumFeatureKeys.WeddingGroomsmenManual);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task HasEntitlementAsync_WhenAccountWide_MatchesAnyEvent()
    {
        var sut = CreateSut();
        _entitlementRepository.GetByUserIdAsync(_userId, Arg.Any<CancellationToken>())
            .Returns([MakeEntitlement(PremiumFeatureKeys.CorporateWhiteLabel, eventId: null)]);

        var result = await sut.HasEntitlementAsync(_userId, PremiumFeatureKeys.CorporateWhiteLabel, Guid.NewGuid());

        result.Should().BeTrue();
    }

    [Fact]
    public async Task HasEntitlementAsync_WhenEventScopedForADifferentEvent_ReturnsFalse()
    {
        var sut = CreateSut();
        var grantedEventId = Guid.NewGuid();
        _entitlementRepository.GetByUserIdAsync(_userId, Arg.Any<CancellationToken>())
            .Returns([MakeEntitlement(PremiumFeatureKeys.WeddingGroomsmenManual, eventId: grantedEventId)]);

        var result = await sut.HasEntitlementAsync(_userId, PremiumFeatureKeys.WeddingGroomsmenManual, Guid.NewGuid());

        result.Should().BeFalse();
    }

    [Fact]
    public async Task GetForUserAsync_ExcludesRevoked_OrderedByGrantedDescending()
    {
        var sut = CreateSut();
        var older = MakeEntitlement(PremiumFeatureKeys.WeddingGroomsmenManual);
        older.GrantedAtUtc = _now.AddDays(-5);
        var newer = MakeEntitlement(PremiumFeatureKeys.BabyShowerGenderGuessGame);
        newer.GrantedAtUtc = _now.AddDays(-1);
        var revoked = MakeEntitlement(PremiumFeatureKeys.CorporateQrCheckin, revokedAtUtc: _now.AddHours(-1));

        _entitlementRepository.GetByUserIdAsync(_userId, Arg.Any<CancellationToken>())
            .Returns([older, newer, revoked]);

        var result = await sut.GetForUserAsync(_userId);

        result.Should().HaveCount(2);
        result[0].FeatureKey.Should().Be(PremiumFeatureKeys.BabyShowerGenderGuessGame);
        result[1].FeatureKey.Should().Be(PremiumFeatureKeys.WeddingGroomsmenManual);
    }
}
