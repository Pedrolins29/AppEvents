using AppEvents.Application.Common.Exceptions;
using AppEvents.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace AppEvents.Infrastructure.Storage;

/// <summary>
/// Stores images on local disk under the content root, outside wwwroot, served back via a
/// dedicated static-file mapping (see Program.cs). Swappable for an Azure Blob Storage
/// implementation later behind the same IImageStorageService interface — no Azure resources
/// exist yet, so this is the pragmatic MVP choice rather than a speculative cloud integration.
/// </summary>
public class LocalImageStorageService : IImageStorageService
{
    private const long MaxFileSizeBytes = 5 * 1024 * 1024;

    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp" };

    private static readonly byte[] JpegSignature = [0xFF, 0xD8, 0xFF];
    private static readonly byte[] PngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

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
        if (content.Length > MaxFileSizeBytes)
        {
            throw ValidationError("File exceeds the maximum allowed size of 5 MB.");
        }

        var extension = Path.GetExtension(originalFileName);
        if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
        {
            throw ValidationError("File type not allowed. Use JPG, PNG, or WEBP.");
        }

        var signatureBuffer = new byte[16];
        var bytesRead = await content.ReadAsync(signatureBuffer.AsMemory(0, signatureBuffer.Length), cancellationToken);
        content.Position = 0;

        if (!MatchesKnownImageSignature(signatureBuffer, bytesRead))
        {
            throw ValidationError("File content does not match a supported image format.");
        }

        // Never trust the caller-supplied file name — generate a new one.
        var fileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var filePath = Path.Combine(_physicalPath, fileName);

        await using (var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write))
        {
            await content.CopyToAsync(fileStream, cancellationToken);
        }

        return $"{_publicBaseUrl}/{fileName}";
    }

    private static bool MatchesKnownImageSignature(byte[] buffer, int bytesRead)
    {
        if (bytesRead >= JpegSignature.Length && buffer.AsSpan(0, JpegSignature.Length).SequenceEqual(JpegSignature))
        {
            return true;
        }

        if (bytesRead >= PngSignature.Length && buffer.AsSpan(0, PngSignature.Length).SequenceEqual(PngSignature))
        {
            return true;
        }

        // WebP: "RIFF" (bytes 0-3) + size + "WEBP" (bytes 8-11)
        if (bytesRead >= 12
            && buffer[0] == (byte)'R' && buffer[1] == (byte)'I' && buffer[2] == (byte)'F' && buffer[3] == (byte)'F'
            && buffer[8] == (byte)'W' && buffer[9] == (byte)'E' && buffer[10] == (byte)'B' && buffer[11] == (byte)'P')
        {
            return true;
        }

        return false;
    }

    private static ValidationAppException ValidationError(string message) =>
        new(new Dictionary<string, string[]> { ["File"] = [message] });
}
