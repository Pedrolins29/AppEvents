using AppEvents.Application.Payments.Interfaces;
using Microsoft.Extensions.Configuration;

namespace AppEvents.Infrastructure.Payments;

/// <summary>
/// Reads Lastlink:ProductKeyMap from configuration — a Lastlink product/bump id -> one of
/// PremiumFeatureKeys. Empty by default; the user fills this in once real checkout products
/// exist, with no code change required.
/// </summary>
public class PremiumProductCatalog : IPremiumProductCatalog
{
    private readonly IConfiguration _configuration;

    public PremiumProductCatalog(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string? ResolveFeatureKey(string externalProductKey) =>
        _configuration[$"Lastlink:ProductKeyMap:{externalProductKey}"];
}
