using System.Security.Cryptography;

namespace AppEvents.Application.Identity.Services;

public static class RefreshTokenGenerator
{
    public static string GenerateRawToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

    public static string Hash(string rawToken)
    {
        var bytes = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToBase64String(bytes);
    }
}
