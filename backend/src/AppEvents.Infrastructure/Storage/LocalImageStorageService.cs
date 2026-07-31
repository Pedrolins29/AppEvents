using AppEvents.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace AppEvents.Infrastructure.Storage;

/// <summary>
/// Stores images on local disk under the content root, outside wwwroot, served back via a
/// dedicated static-file mapping (see Program.cs). Swappable for a cloud-storage implementation
/// behind the same IImageStorageService interface — see R2ImageStorageService, selected via
/// Storage:Provider in config.
/// </summary>
public class LocalImageStorageService : IImageStorageService
{
    private readonly string _physicalPath;
    private readonly string _publicBaseUrl;

    public LocalImageStorageService(IHostEnvironment environment, IConfiguration configuration)
    {
        var relativePath = configuration["Storage:LocalPath"] ?? "App_Data/uploads/events";
        _physicalPath = Path.Combine(environment.ContentRootPath, relativePath);
        _publicBaseUrl = (configuration["Storage:PublicBaseUrl"] ?? "/uploads/events").TrimEnd('/');

        Directory.CreateDirectory(_physicalPath);
    }

    public async Task<string> SaveAsync(Stream content, string originalFileName, string contentType, CancellationToken cancellationToken = default)
    {
        var extension = await ImageValidation.ValidateAsync(content, originalFileName, cancellationToken);

        // Never trust the caller-supplied file name — generate a new one.
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(_physicalPath, fileName);

        await using (var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write))
        {
            await content.CopyToAsync(fileStream, cancellationToken);
        }

        return $"{_publicBaseUrl}/{fileName}";
    }
}
