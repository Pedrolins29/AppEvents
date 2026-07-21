using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AppEvents.Domain.Identity;
using AppEvents.Infrastructure.Identity;
using FluentAssertions;
using Microsoft.Extensions.Configuration;

namespace AppEvents.UnitTests.Identity;

public class JwtTokenServiceTests
{
    private static JwtTokenService CreateService(int accessTokenMinutes = 15)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:SigningKey"] = "unit-test-signing-key-that-is-long-enough-1234567890",
                ["Jwt:Issuer"] = "AppEvents.Tests",
                ["Jwt:Audience"] = "AppEvents.Tests",
                ["Jwt:AccessTokenMinutes"] = accessTokenMinutes.ToString(),
            })
            .Build();

        return new JwtTokenService(configuration);
    }

    [Fact]
    public void GenerateAccessToken_IncludesExpectedClaims()
    {
        var service = CreateService();
        var role = new Role { Id = Guid.NewGuid(), Name = RoleNames.Customer };
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "jane.doe@example.com",
            FullName = "Jane Doe",
            RoleId = role.Id,
            Role = role,
        };

        var accessToken = service.GenerateAccessToken(user);

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(accessToken.Value);
        jwt.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == user.Id.ToString());
        jwt.Claims.Should().Contain(c => c.Type == ClaimTypes.Email && c.Value == user.Email);
        jwt.Claims.Should().Contain(c => c.Type == ClaimTypes.Role && c.Value == RoleNames.Customer);
    }

    [Fact]
    public void GenerateAccessToken_SetsExpiryAccordingToConfiguration()
    {
        var service = CreateService(accessTokenMinutes: 30);
        var role = new Role { Id = Guid.NewGuid(), Name = RoleNames.Customer };
        var user = new User { Id = Guid.NewGuid(), Email = "jane.doe@example.com", RoleId = role.Id, Role = role };

        var accessToken = service.GenerateAccessToken(user);

        accessToken.ExpiresInSeconds.Should().Be(30 * 60);

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(accessToken.Value);
        jwt.ValidTo.Should().BeCloseTo(DateTime.UtcNow.AddMinutes(30), TimeSpan.FromSeconds(10));
    }
}
