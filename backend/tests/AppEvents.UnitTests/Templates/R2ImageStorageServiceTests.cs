using System.Text;
using Amazon.S3;
using Amazon.S3.Model;
using AppEvents.Application.Common.Exceptions;
using AppEvents.Infrastructure.Storage;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using NSubstitute;

namespace AppEvents.UnitTests.Templates;

public class R2ImageStorageServiceTests
{
    private static R2ImageStorageService CreateSut(IAmazonS3 s3Client, string bucketName = "test-bucket", string publicBaseUrl = "https://cdn.example.com")
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Storage:R2:BucketName"] = bucketName,
                ["Storage:R2:PublicBaseUrl"] = publicBaseUrl,
            })
            .Build();

        return new R2ImageStorageService(s3Client, configuration);
    }

    private static byte[] BuildBytes(byte[] signature, int totalLength = 64)
    {
        var bytes = new byte[totalLength];
        signature.CopyTo(bytes, 0);
        return bytes;
    }

    private static readonly byte[] JpegBytes = BuildBytes([0xFF, 0xD8, 0xFF]);

    [Fact]
    public async Task SaveAsync_WithValidImage_ReturnsR2PublicUrl()
    {
        var s3Client = Substitute.For<IAmazonS3>();
        s3Client.PutObjectAsync(Arg.Any<PutObjectRequest>(), Arg.Any<CancellationToken>())
            .Returns(new PutObjectResponse());
        var sut = CreateSut(s3Client);
        using var stream = new MemoryStream(JpegBytes);

        var url = await sut.SaveAsync(stream, "photo.jpg", "image/jpeg");

        url.Should().StartWith("https://cdn.example.com/");
        url.Should().NotContain("/uploads/");
    }

    [Fact]
    public async Task SaveAsync_WithValidImage_UploadsToConfiguredBucketWithGuidKey()
    {
        var s3Client = Substitute.For<IAmazonS3>();
        s3Client.PutObjectAsync(Arg.Any<PutObjectRequest>(), Arg.Any<CancellationToken>())
            .Returns(new PutObjectResponse());
        var sut = CreateSut(s3Client, bucketName: "my-bucket");
        using var stream = new MemoryStream(JpegBytes);

        await sut.SaveAsync(stream, "photo.jpg", "image/jpeg");

        await s3Client.Received(1).PutObjectAsync(
            Arg.Is<PutObjectRequest>(r => r.BucketName == "my-bucket" && r.Key != null && r.Key.EndsWith(".jpg") && r.Key.Length == 36),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SaveAsync_WithDisallowedExtension_ThrowsAndNeverCallsS3()
    {
        var s3Client = Substitute.For<IAmazonS3>();
        var sut = CreateSut(s3Client);
        using var stream = new MemoryStream(JpegBytes);

        var act = () => sut.SaveAsync(stream, "malicious.exe", "application/octet-stream");

        await act.Should().ThrowAsync<ValidationAppException>();
        await s3Client.DidNotReceive().PutObjectAsync(Arg.Any<PutObjectRequest>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SaveAsync_WithOversizedFile_ThrowsAndNeverCallsS3()
    {
        var s3Client = Substitute.For<IAmazonS3>();
        var sut = CreateSut(s3Client);
        var oversized = new byte[6 * 1024 * 1024];
        new byte[] { 0xFF, 0xD8, 0xFF }.CopyTo(oversized, 0);
        using var stream = new MemoryStream(oversized);

        var act = () => sut.SaveAsync(stream, "big.jpg", "image/jpeg");

        await act.Should().ThrowAsync<ValidationAppException>();
        await s3Client.DidNotReceive().PutObjectAsync(Arg.Any<PutObjectRequest>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SaveAsync_WithSpoofedExtension_ThrowsAndNeverCallsS3()
    {
        var s3Client = Substitute.For<IAmazonS3>();
        var sut = CreateSut(s3Client);
        var textBytes = Encoding.UTF8.GetBytes("<?php echo 'not an image'; ?>");
        using var stream = new MemoryStream(textBytes);

        var act = () => sut.SaveAsync(stream, "innocent.png", "image/png");

        await act.Should().ThrowAsync<ValidationAppException>();
        await s3Client.DidNotReceive().PutObjectAsync(Arg.Any<PutObjectRequest>(), Arg.Any<CancellationToken>());
    }
}
