using AppEvents.Application.Common.Exceptions;

namespace AppEvents.Infrastructure.Storage;

/// <summary>
/// Size/extension/magic-byte validation shared by every IImageStorageService implementation
/// (LocalImageStorageService, R2ImageStorageService) — kept in one place so the two never
/// silently drift (e.g. a new allowed extension added to one but not the other).
/// </summary>
internal static class ImageValidation
{
    private const long MaxFileSizeBytes = 5 * 1024 * 1024;

    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp" };

    private static readonly byte[] JpegSignature = [0xFF, 0xD8, 0xFF];
    private static readonly byte[] PngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

    /// <summary>
    /// Validates <paramref name="content"/> against the size/extension/signature rules and
    /// returns the sanitized lowercase extension (e.g. ".jpg"). Rewinds the stream back to
    /// position 0 before returning, since callers upload/copy the full stream afterward. Throws
    /// ValidationAppException on any failure.
    /// </summary>
    public static async Task<string> ValidateAsync(Stream content, string originalFileName, CancellationToken cancellationToken)
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

        return extension.ToLowerInvariant();
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
