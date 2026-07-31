using AppEvents.Application.Payments.Dtos;

namespace AppEvents.Application.Payments.Services;

public interface IEntitlementService
{
    /// The reusable gate future premium-feature sprints call. eventId is only checked when the
    /// matching entitlement is itself event-scoped — account-wide entitlements (EventId == null)
    /// apply regardless of which event is asked about.
    Task<bool> HasEntitlementAsync(Guid userId, string featureKey, Guid? eventId = null, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<EntitlementResponse>> GetForUserAsync(Guid userId, CancellationToken cancellationToken = default);
}
