using AppEvents.Domain.Common;

namespace AppEvents.Domain.Identity;

public class RefreshToken : BaseEntity
{
    public Guid UserId { get; set; }

    public User? User { get; set; }

    public string TokenHash { get; set; } = string.Empty;

    public DateTime ExpiresAtUtc { get; set; }

    public string? CreatedByIp { get; set; }

    public DateTime? RevokedAtUtc { get; set; }

    public string? RevokedByIp { get; set; }

    public string? ReplacedByTokenHash { get; set; }

    public bool IsActive(DateTime nowUtc) => RevokedAtUtc is null && ExpiresAtUtc > nowUtc;
}
