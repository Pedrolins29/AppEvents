namespace AppEvents.Application.Identity.Interfaces;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
