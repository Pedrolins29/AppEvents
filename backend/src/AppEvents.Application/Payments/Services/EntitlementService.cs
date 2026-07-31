using AppEvents.Application.Identity.Interfaces;
using AppEvents.Application.Payments.Dtos;
using AppEvents.Application.Payments.Interfaces;

namespace AppEvents.Application.Payments.Services;

public class EntitlementService : IEntitlementService
{
    private readonly IEntitlementRepository _entitlementRepository;
    private readonly IDateTimeProvider _dateTimeProvider;

    public EntitlementService(IEntitlementRepository entitlementRepository, IDateTimeProvider dateTimeProvider)
    {
        _entitlementRepository = entitlementRepository;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<bool> HasEntitlementAsync(Guid userId, string featureKey, Guid? eventId = null, CancellationToken cancellationToken = default)
    {
        var now = _dateTimeProvider.UtcNow;
        var entitlements = await _entitlementRepository.GetByUserIdAsync(userId, cancellationToken);

        return entitlements.Any(e =>
            e.FeatureKey == featureKey &&
            e.IsActive(now) &&
            (e.EventId is null || e.EventId == eventId));
    }

    public async Task<IReadOnlyList<EntitlementResponse>> GetForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var now = _dateTimeProvider.UtcNow;
        var entitlements = await _entitlementRepository.GetByUserIdAsync(userId, cancellationToken);

        return entitlements
            .Where(e => e.IsActive(now))
            .OrderByDescending(e => e.GrantedAtUtc)
            .Select(e => new EntitlementResponse(e.FeatureKey, e.GrantedAtUtc, e.EventId))
            .ToList();
    }
}
