using Amazon.S3;
using Amazon.S3.Model;
using AppEvents.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace AppEvents.Infrastructure.Storage;

/// <summary>
/// Stores images in a Cloudflare R2 bucket (S3-API-compatible) behind the same
/// IImageStorageService interface LocalImageStorageService implements. Selected via
/// Storage:Provider = "R2" in config (see DependencyInjection.cs, which also wires the
/// R2-specific IAmazonS3 endpoint/credentials). No real bucket exists yet — this is unverified
/// against a live R2 account until Storage:R2:* config is filled in.
/// </summary>
public class R2ImageStorageService : IImageStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly string _publicBaseUrl;

    public R2ImageStorageService(IAmazonS3 s3Client, IConfiguration configuration)
    {
        _s3Client = s3Client;
        _bucketName = configuration["Storage:R2:BucketName"]
            ?? throw new InvalidOperationException("Storage:R2:BucketName is required when Storage:Provider is R2.");
        _publicBaseUrl = (configuration["Storage:R2:PublicBaseUrl"] ?? "").TrimEnd('/');
    }

    public async Task<string> SaveAsync(Stream content, string originalFileName, string contentType, CancellationToken cancellationToken = default)
    {
        var extension = await ImageValidation.ValidateAsync(content, originalFileName, cancellationToken);

        // Never trust the caller-supplied file name — generate a new one.
        var fileName = $"{Guid.NewGuid():N}{extension}";

        await _s3Client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = fileName,
            InputStream = content,
            ContentType = contentType,
            // The caller (EventsController) owns and disposes `content` itself (`await using`) —
            // don't let the SDK close it out from under that.
            AutoCloseStream = false,
            // R2 doesn't support S3 canned ACLs the same way AWS does; public access is a
            // bucket-level setting configured in the Cloudflare dashboard, not per-object here.
        }, cancellationToken);

        return $"{_publicBaseUrl}/{fileName}";
    }
}
