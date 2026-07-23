using AppEvents.Application.Common.Exceptions;
using AppEvents.Application.Templates.Interfaces;
using AppEvents.Application.Templates.Services;
using AppEvents.Domain.Templates;
using FluentAssertions;
using NSubstitute;

namespace AppEvents.UnitTests.Templates;

public class TemplateServiceTests
{
    private readonly ITemplateRepository _templateRepository = Substitute.For<ITemplateRepository>();

    private TemplateService CreateSut() => new(_templateRepository);

    [Fact]
    public async Task GetAllAsync_ReturnsMappedTemplates()
    {
        var sut = CreateSut();
        var template = new Template { Id = Guid.NewGuid(), Name = "Elegant", Theme = "elegant", ThumbnailUrl = "/templates/elegant-thumbnail.jpg" };
        _templateRepository.GetAllAsync(Arg.Any<CancellationToken>()).Returns(new List<Template> { template });

        var result = await sut.GetAllAsync();

        result.Should().ContainSingle(t => t.Theme == "elegant" && t.Name == "Elegant");
    }

    [Fact]
    public async Task GetByIdAsync_WhenNotFound_ThrowsNotFoundException()
    {
        var sut = CreateSut();
        var id = Guid.NewGuid();
        _templateRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((Template?)null);

        var act = () => sut.GetByIdAsync(id);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task GetByIdAsync_WhenFound_ReturnsTemplate()
    {
        var sut = CreateSut();
        var template = new Template { Id = Guid.NewGuid(), Name = "Modern", Theme = "modern", ThumbnailUrl = "/templates/modern-thumbnail.jpg" };
        _templateRepository.GetByIdAsync(template.Id, Arg.Any<CancellationToken>()).Returns(template);

        var result = await sut.GetByIdAsync(template.Id);

        result.Name.Should().Be("Modern");
    }
}
