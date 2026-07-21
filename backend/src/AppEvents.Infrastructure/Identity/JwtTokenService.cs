using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AppEvents.Application.Identity.Interfaces;
using AppEvents.Domain.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace AppEvents.Infrastructure.Identity;

public class JwtTokenService : IJwtTokenService
{
    private readonly string _signingKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _accessTokenMinutes;

    public JwtTokenService(IConfiguration configuration)
    {
        _signingKey = configuration["Jwt:SigningKey"]
            ?? throw new InvalidOperationException("Jwt:SigningKey is not configured.");
        _issuer = configuration["Jwt:Issuer"] ?? "AppEvents";
        _audience = configuration["Jwt:Audience"] ?? "AppEvents";
        _accessTokenMinutes = int.TryParse(configuration["Jwt:AccessTokenMinutes"], out var minutes) ? minutes : 15;
    }

    public AccessToken GenerateAccessToken(User user)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_accessTokenMinutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role?.Name ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_signingKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        var value = new JwtSecurityTokenHandler().WriteToken(token);

        return new AccessToken(value, _accessTokenMinutes * 60);
    }
}
