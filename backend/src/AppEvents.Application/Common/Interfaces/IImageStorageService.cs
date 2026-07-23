namespace AppEvents.Application.Common.Interfaces;

/// <summary>
/// Validates and persists an uploaded image. Implementations must never trust the caller-supplied
/// file name or Content-Type alone — validate actual file content (size, magic-byte signature)
/// before storing, and throw ValidationAppException (400) on any failure.
/// </summary>
public interface IImageStorageService
{
    Task<string> SaveAsync(Stream content, string originalFileName, string contentType, CancellationToken cancellationToken = default);
}
