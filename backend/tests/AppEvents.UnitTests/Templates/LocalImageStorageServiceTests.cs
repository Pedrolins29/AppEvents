using System.Text;
using AppEvents.Application.Common.Exceptions;
using AppEvents.Infrastructure.Storage;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using NSubstitute;

namespace AppEvents.UnitTests.Templates;

public class LocalImageStorageServiceTests : IDisposable
{
    private readonly string _tempContentRoot = Path.Combine(Path.GetTempPath(), $"appevents-tests-{Guid.NewGuid():N}");

    private LocalImageStorageService CreateSut()
    {
        var environment = Substitute.For<IHostEnvironment>();
        environment.ContentRootPath.Returns(_tempContentRoot);

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Storage:LocalPath"] = "uploads",
                ["Storage:PublicBaseUrl"] = "/uploads",
            })
            .Build();

        return new LocalImageStorageService(environment, configuration);
    }

    private static byte[] BuildBytes(byte[] signature, int totalLength = 64)
    {
        var bytes = new byte[totalLength];
        signature.CopyTo(bytes, 0);
        return bytes;
    }

    private static readonly byte[] JpegBytes = BuildBytes([0xFF, 0xD8, 0xFF]);
    private static readonly byte[] PngBytes = BuildBytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    private static readonly byte[] WebpBytes = BuildWebp();

    private static byte[] BuildWebp()
    {
        var bytes = new byte[64];
        Encoding.ASCII.GetBytes("RIFF").CopyTo(bytes, 0);
        Encoding.ASCII.GetBytes("WEBP").CopyTo(bytes, 8);
        return bytes;
    }

    [Theory]
    [InlineData("photo.jpg")]
    [InlineData("photo.jpeg")]
    [InlineData("photo.PNG")]
    [InlineData("photo.webp")]
    public async Task SaveAsync_WithValidImage_ReturnsPublicUrl(string fileName)
    {
        var sut = CreateSut();
        var bytes = fileName.EndsWith(".webp") ? WebpBytes : fileName.Contains("png", StringComparison.OrdinalIgnoreCase) ? PngBytes : JpegBytes;
        using var stream = new MemoryStream(bytes);

        var url = await sut.SaveAsync(stream, fileName, "image/jpeg");

        url.Should().StartWith("/uploads/");
    }

    [Fact]
    public async Task SaveAsync_WithDisallowedExtension_ThrowsValidationAppException()
    {
        var sut = CreateSut();
        using var stream = new MemoryStream(JpegBytes);

        var act = () => sut.SaveAsync(stream, "malicious.exe", "application/octet-stream");

        await act.Should().ThrowAsync<ValidationAppException>();
    }

    [Fact]
    public async Task SaveAsync_WithOversizedFile_ThrowsValidationAppException()
    {
        var sut = CreateSut();
        var oversized = new byte[6 * 1024 * 1024];
        new byte[] { 0xFF, 0xD8, 0xFF }.CopyTo(oversized, 0);
        using var stream = new MemoryStream(oversized);

        var act = () => sut.SaveAsync(stream, "big.jpg", "image/jpeg");

        await act.Should().ThrowAsync<ValidationAppException>();
    }

    [Fact]
    public async Task SaveAsync_WithSpoofedExtension_ThrowsValidationAppException()
    {
        var sut = CreateSut();
        var textBytes = Encoding.UTF8.GetBytes("<?php echo 'not an image'; ?>");
        using var stream = new MemoryStream(textBytes);

        var act = () => sut.SaveAsync(stream, "innocent.png", "image/png");

        await act.Should().ThrowAsync<ValidationAppException>();
    }

    public void Dispose()
    {
        if (Directory.Exists(_tempContentRoot))
        {
            Directory.Delete(_tempContentRoot, recursive: true);
        }
    }
}
