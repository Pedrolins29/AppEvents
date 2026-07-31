namespace AppEvents.Application.Payments.Interfaces;

/// <summary>
/// Resolves a Lastlink-side product/order-bump identifier to one of PremiumFeatureKeys, via the
/// Lastlink:ProductKeyMap config section — filled in once the user creates the real checkout
/// products, with no code change required.
/// </summary>
public interface IPremiumProductCatalog
{
    /// Returns null if externalProductKey has no configured mapping yet.
    string? ResolveFeatureKey(string externalProductKey);
}
