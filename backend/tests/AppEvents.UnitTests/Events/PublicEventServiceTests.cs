using AppEvents.Application.Common.Exceptions;
using AppEvents.Application.Events.Interfaces;
using AppEvents.Application.Events.Services;
using AppEvents.Domain.Events;
using AppEvents.Domain.Templates;
using FluentAssertions;
using NSubstitute;

namespace AppEvents.UnitTests.Events;

public class PublicEventServiceTests
{
    private readonly IEventRepository _eventRepository = Substitute.For<IEventRepository>();

    private PublicEventService CreateSut() => new(_eventRepository);

    [Fact]
    public async Task GetBySlugAsync_WhenPublished_ReturnsResponse()
    {
        var sut = CreateSut();
        var @event = new Event
        {
            Id = Guid.NewGuid(),
            Name = "John and Mary",
            Slug = "john-and-mary",
            EventType = EventType.Wedding,
            EventDate = new DateTime(2026, 12, 1, 0, 0, 0, DateTimeKind.Utc),
            Description = "A celebration",
            Address = "123 Main St",
            IsPublished = true,
            Template = new Template { Id = Guid.NewGuid(), Name = "Elegant", Theme = "elegant", ThumbnailUrl = "x" },
        };
        _eventRepository.GetPublishedBySlugAsync("john-and-mary", Arg.Any<CancellationToken>()).Returns(@event);

        var response = await sut.GetBySlugAsync("john-and-mary");

        response.Name.Should().Be("John and Mary");
        response.ThemeKey.Should().Be("elegant");
    }

    [Fact]
    public async Task GetBySlugAsync_WhenNotFoundOrUnpublished_ThrowsNotFoundException()
    {
        var sut = CreateSut();
        _eventRepository.GetPublishedBySlugAsync("missing", Arg.Any<CancellationToken>()).Returns((Event?)null);

        var act = () => sut.GetBySlugAsync("missing");

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
