using AppEvents.Domain.Common;

namespace AppEvents.Domain.Identity;

public class User : BaseEntity
{
    private const int MaxFailedLoginAttempts = 5;
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public Guid RoleId { get; set; }

    public Role? Role { get; set; }

    public bool IsActive { get; set; } = true;

    public int FailedLoginAttempts { get; set; }

    public DateTime? LockoutEndUtc { get; set; }

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    public bool IsLockedOut(DateTime nowUtc) => LockoutEndUtc.HasValue && LockoutEndUtc.Value > nowUtc;

    public void RegisterFailedLogin(DateTime nowUtc)
    {
        FailedLoginAttempts++;
        if (FailedLoginAttempts >= MaxFailedLoginAttempts)
        {
            LockoutEndUtc = nowUtc.Add(LockoutDuration);
        }
    }

    public void RegisterSuccessfulLogin()
    {
        FailedLoginAttempts = 0;
        LockoutEndUtc = null;
    }
}
