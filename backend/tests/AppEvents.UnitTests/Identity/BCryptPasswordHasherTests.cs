using AppEvents.Infrastructure.Identity;
using FluentAssertions;

namespace AppEvents.UnitTests.Identity;

public class BCryptPasswordHasherTests
{
    private readonly BCryptPasswordHasher _hasher = new();

    [Fact]
    public void Hash_ThenVerify_WithCorrectPassword_ReturnsTrue()
    {
        var hash = _hasher.Hash("Str0ng!Passw0rd");

        _hasher.Verify("Str0ng!Passw0rd", hash).Should().BeTrue();
    }

    [Fact]
    public void Verify_WithWrongPassword_ReturnsFalse()
    {
        var hash = _hasher.Hash("Str0ng!Passw0rd");

        _hasher.Verify("SomethingElse!1", hash).Should().BeFalse();
    }

    [Fact]
    public void Hash_CalledTwiceWithSamePassword_ProducesDifferentHashes()
    {
        var hash1 = _hasher.Hash("Str0ng!Passw0rd");
        var hash2 = _hasher.Hash("Str0ng!Passw0rd");

        hash1.Should().NotBe(hash2);
    }
}
