using AppEvents.Application.Identity.Interfaces;

namespace AppEvents.Infrastructure.Common;

public class SystemDateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
