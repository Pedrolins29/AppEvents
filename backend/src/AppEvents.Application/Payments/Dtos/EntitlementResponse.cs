namespace AppEvents.Application.Payments.Dtos;

public record EntitlementResponse(string FeatureKey, DateTime GrantedAtUtc, Guid? EventId);
