namespace AppEvents.Domain.Identity;

public static class RoleNames
{
    public const string Admin = "Admin";

    public const string Customer = "Customer";

    public static readonly Guid AdminRoleId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public static readonly Guid CustomerRoleId = Guid.Parse("22222222-2222-2222-2222-222222222222");
}
