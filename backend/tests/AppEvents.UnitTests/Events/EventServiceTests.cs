using AppEvents.Application.Common.Exceptions;
using AppEvents.Application.Events.Dtos;
using AppEvents.Application.Events.Interfaces;
using AppEvents.Application.Events.Services;
using AppEvents.Application.Identity.Interfaces;
using AppEvents.Application.Templates.Interfaces;
using AppEvents.Domain.Events;
using AppEvents.Domain.Templates;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace AppEvents.UnitTests.Events;

public class EventServiceTests
{
    private readonly IEventRepository _eventRepository = Substitute.For<IEventRepository>();
    private readonly ITemplateRepository _templateRepository = Substitute.For<ITemplateRepository>();
    private readonly IDateTimeProvider _dateTimeProvider = Substitute.For<IDateTimeProvider>();
    private readonly ILogger<EventService> _logger = Substitute.For<ILogger<EventService>>();

    private readonly DateTime _now = new(2026, 7, 22, 12, 0, 0, DateTimeKind.Utc);
    private readonly Guid _ownerId = Guid.NewGuid();
    private readonly Guid _otherUserId = Guid.NewGuid();

    private EventService CreateSut()
    {
        _dateTimeProvider.UtcNow.Returns(_now);
        return new EventService(_eventRepository, _templateRepository, _dateTimeProvider, _logger);
    }

    private CreateEventRequest ValidCreateRequest(
        Guid? templateId = null,
        string? dressCode = null,
        IReadOnlyList<TimelineItemDto>? timelineItems = null) => new(
        "John and Mary Wedding",
        "john-and-mary",
        EventType.Wedding,
        _now.AddDays(30),
        "A celebration of love",
        "123 Main St",
        dressCode,
        timelineItems,
        templateId);

    private UpdateEventRequest ValidCreateRequestAsUpdate(
        Guid? templateId = null,
        string? dressCode = null,
        IReadOnlyList<TimelineItemDto>? timelineItems = null) => new(
        "John and Mary Wedding",
        "john-and-mary",
        EventType.Wedding,
        _now.AddDays(30),
        "A celebration of love",
        "123 Main St",
        dressCode,
        timelineItems,
        templateId);

    private Event OwnedEvent() => new()
    {
        Id = Guid.NewGuid(),
        Name = "Existing Event",
        Slug = "existing-event",
        EventType = EventType.Birthday,
        EventDate = _now.AddDays(10),
        UserId = _ownerId,
    };

    [Fact]
    public async Task CreateAsync_WithNewSlug_CreatesEventOwnedByCaller()
    {
        var sut = CreateSut();
        _eventRepository.SlugExistsAsync("john-and-mary", null, Arg.Any<CancellationToken>()).Returns(false);

        var response = await sut.CreateAsync(_ownerId, ValidCreateRequest());

        response.Slug.Should().Be("john-and-mary");
        response.UserId.Should().Be(_ownerId);
        await _eventRepository.Received(1).AddAsync(
            Arg.Is<Event>(e => e!.UserId == _ownerId && e.Slug == "john-and-mary"),
            Arg.Any<CancellationToken>());
        await _eventRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_WithExistingSlug_ThrowsConflictException()
    {
        var sut = CreateSut();
        _eventRepository.SlugExistsAsync("john-and-mary", null, Arg.Any<CancellationToken>()).Returns(true);

        var act = () => sut.CreateAsync(_ownerId, ValidCreateRequest());

        await act.Should().ThrowAsync<ConflictException>();
        await _eventRepository.DidNotReceive().AddAsync(Arg.Any<Event>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_WithExistingTemplateId_SetsTemplateOnEvent()
    {
        var sut = CreateSut();
        var templateId = Guid.NewGuid();
        _eventRepository.SlugExistsAsync("john-and-mary", null, Arg.Any<CancellationToken>()).Returns(false);
        _templateRepository.GetByIdAsync(templateId, Arg.Any<CancellationToken>())
            .Returns(new Template { Id = templateId, Name = "Elegant", Theme = "elegant", ThumbnailUrl = "x" });

        var response = await sut.CreateAsync(_ownerId, ValidCreateRequest(templateId));

        response.TemplateId.Should().Be(templateId);
    }

    [Fact]
    public async Task CreateAsync_WithNonexistentTemplateId_ThrowsValidationAppException()
    {
        var sut = CreateSut();
        var templateId = Guid.NewGuid();
        _eventRepository.SlugExistsAsync("john-and-mary", null, Arg.Any<CancellationToken>()).Returns(false);
        _templateRepository.GetByIdAsync(templateId, Arg.Any<CancellationToken>()).Returns((Template?)null);

        var act = () => sut.CreateAsync(_ownerId, ValidCreateRequest(templateId));

        await act.Should().ThrowAsync<ValidationAppException>();
        await _eventRepository.DidNotReceive().AddAsync(Arg.Any<Event>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_WithDressCodeAndTimeline_PersistsBothOnEvent()
    {
        var sut = CreateSut();
        _eventRepository.SlugExistsAsync("john-and-mary", null, Arg.Any<CancellationToken>()).Returns(false);
        var timelineItems = new List<TimelineItemDto> { new("12:00", "Ceremony"), new("13:30", "Cocktail hour") };

        var response = await sut.CreateAsync(_ownerId, ValidCreateRequest(dressCode: "Black tie", timelineItems: timelineItems));

        response.DressCode.Should().Be("Black tie");
        response.TimelineItems.Should().BeEquivalentTo(timelineItems, options => options.WithStrictOrdering());
    }

    [Fact]
    public async Task UpdateAsync_ReplacesTimelineItemsEntirely()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        @event.TimelineItems = [new TimelineItem { Time = "10:00", Label = "Old item" }, new TimelineItem { Time = "11:00", Label = "Also old" }];
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);
        _eventRepository.SlugExistsAsync("john-and-mary", @event.Id, Arg.Any<CancellationToken>()).Returns(false);
        var newItems = new List<TimelineItemDto> { new("14:00", "New item") };

        var response = await sut.UpdateAsync(_ownerId, @event.Id, ValidCreateRequestAsUpdate(timelineItems: newItems));

        response.TimelineItems.Should().BeEquivalentTo(newItems);
    }

    [Fact]
    public async Task GetByIdAsync_WhenNotOwner_ThrowsNotFoundException()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        var act = () => sut.GetByIdAsync(_otherUserId, @event.Id);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task GetByIdAsync_WhenEventDoesNotExist_ThrowsNotFoundException()
    {
        var sut = CreateSut();
        var eventId = Guid.NewGuid();
        _eventRepository.GetByIdAsync(eventId, Arg.Any<CancellationToken>()).Returns((Event?)null);

        var act = () => sut.GetByIdAsync(_ownerId, eventId);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task GetByIdAsync_WhenOwner_ReturnsEvent()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        var response = await sut.GetByIdAsync(_ownerId, @event.Id);

        response.Id.Should().Be(@event.Id);
    }

    [Fact]
    public async Task UpdateAsync_WhenNotOwner_ThrowsNotFoundException()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        var act = () => sut.UpdateAsync(_otherUserId, @event.Id, ValidCreateRequestAsUpdate());

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task UpdateAsync_WithUnchangedSlug_DoesNotCheckSlugUniqueness()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);
        var request = ValidCreateRequestAsUpdate() with { Slug = @event.Slug };

        await sut.UpdateAsync(_ownerId, @event.Id, request);

        await _eventRepository.DidNotReceive().SlugExistsAsync(Arg.Any<string>(), Arg.Any<Guid?>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAsync_ChangingToExistingSlug_ThrowsConflictException()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);
        _eventRepository.SlugExistsAsync("john-and-mary", @event.Id, Arg.Any<CancellationToken>()).Returns(true);

        var act = () => sut.UpdateAsync(_ownerId, @event.Id, ValidCreateRequestAsUpdate());

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task UpdateAsync_WithNonexistentTemplateId_ThrowsValidationAppException()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        var templateId = Guid.NewGuid();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);
        _eventRepository.SlugExistsAsync("john-and-mary", @event.Id, Arg.Any<CancellationToken>()).Returns(false);
        _templateRepository.GetByIdAsync(templateId, Arg.Any<CancellationToken>()).Returns((Template?)null);

        var act = () => sut.UpdateAsync(_ownerId, @event.Id, ValidCreateRequestAsUpdate(templateId));

        await act.Should().ThrowAsync<ValidationAppException>();
    }

    [Fact]
    public async Task UpdateAsync_WhenOwnerWithValidChanges_UpdatesFields()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);
        _eventRepository.SlugExistsAsync("john-and-mary", @event.Id, Arg.Any<CancellationToken>()).Returns(false);

        var response = await sut.UpdateAsync(_ownerId, @event.Id, ValidCreateRequestAsUpdate());

        response.Name.Should().Be("John and Mary Wedding");
        response.Slug.Should().Be("john-and-mary");
        await _eventRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAsync_WhenNotOwner_ThrowsNotFoundException()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        var act = () => sut.DeleteAsync(_otherUserId, @event.Id);

        await act.Should().ThrowAsync<NotFoundException>();
        _eventRepository.DidNotReceive().Remove(Arg.Any<Event>());
    }

    [Fact]
    public async Task DeleteAsync_WhenOwner_RemovesEvent()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        await sut.DeleteAsync(_ownerId, @event.Id);

        _eventRepository.Received(1).Remove(@event);
        await _eventRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SetCoverImageAsync_WhenNotOwner_ThrowsNotFoundException()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        var act = () => sut.SetCoverImageAsync(_otherUserId, @event.Id, "/uploads/events/abc.jpg");

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task SetCoverImageAsync_WhenOwner_SetsCoverImageUrl()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        var response = await sut.SetCoverImageAsync(_ownerId, @event.Id, "/uploads/events/abc.jpg");

        response.CoverImageUrl.Should().Be("/uploads/events/abc.jpg");
        await _eventRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SetFeaturedPhotoAsync_WhenNotOwner_ThrowsNotFoundException()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        var act = () => sut.SetFeaturedPhotoAsync(_otherUserId, @event.Id, "/uploads/events/xyz.jpg");

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task SetFeaturedPhotoAsync_WhenOwner_SetsFeaturedPhotoUrl()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        var response = await sut.SetFeaturedPhotoAsync(_ownerId, @event.Id, "/uploads/events/xyz.jpg");

        response.FeaturedPhotoUrl.Should().Be("/uploads/events/xyz.jpg");
        await _eventRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task PublishAsync_WhenNotOwner_ThrowsNotFoundException()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        var act = () => sut.PublishAsync(_otherUserId, @event.Id);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task PublishAsync_WhenOwner_SetsIsPublishedTrue()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        var response = await sut.PublishAsync(_ownerId, @event.Id);

        response.IsPublished.Should().BeTrue();
        await _eventRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UnpublishAsync_WhenOwner_SetsIsPublishedFalse()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        @event.IsPublished = true;
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        var response = await sut.UnpublishAsync(_ownerId, @event.Id);

        response.IsPublished.Should().BeFalse();
    }

    [Fact]
    public async Task AddGalleryImageAsync_WhenNotOwner_ThrowsNotFoundException()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        var act = () => sut.AddGalleryImageAsync(_otherUserId, @event.Id, "/uploads/events/a.jpg");

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task AddGalleryImageAsync_WhenOwner_AddsImageViaRepository()
    {
        // EventImage must be added through the repository (not just appended to the tracked
        // Event's in-memory collection) — see EventRepository.AddGalleryImage's comment for why
        // relying on implicit EF graph-fixup for a client-generated key silently emits an UPDATE
        // instead of an INSERT. A mocked IEventRepository can't replicate that real EF fixup, so
        // this test verifies the service→repository contract rather than the resulting collection
        // shape (covered end-to-end by EventsEndpointsTests.AddGalleryImage_WithValidJpeg_AppendsImage).
        var sut = CreateSut();
        var @event = OwnedEvent();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        await sut.AddGalleryImageAsync(_ownerId, @event.Id, "/uploads/events/a.jpg");

        _eventRepository.Received(1).AddGalleryImage(Arg.Is<EventImage>(
            i => i!.ImageUrl == "/uploads/events/a.jpg" && i.EventId == @event.Id));
        await _eventRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddGalleryImageAsync_WhenAtCap_ThrowsValidationAppException()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        for (var i = 0; i < 10; i++)
        {
            @event.GalleryImages.Add(new EventImage { EventId = @event.Id, ImageUrl = $"/uploads/events/{i}.jpg", SortOrder = i });
        }
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        var act = () => sut.AddGalleryImageAsync(_ownerId, @event.Id, "/uploads/events/overflow.jpg");

        await act.Should().ThrowAsync<ValidationAppException>();
        await _eventRepository.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveGalleryImageAsync_WhenImageDoesNotExist_ThrowsNotFoundException()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        var act = () => sut.RemoveGalleryImageAsync(_ownerId, @event.Id, Guid.NewGuid());

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task RemoveGalleryImageAsync_WhenNotOwner_ThrowsNotFoundException()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        var image = new EventImage { Id = Guid.NewGuid(), EventId = @event.Id, ImageUrl = "/uploads/events/a.jpg" };
        @event.GalleryImages.Add(image);
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        var act = () => sut.RemoveGalleryImageAsync(_otherUserId, @event.Id, image.Id);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task RemoveGalleryImageAsync_WhenOwnerAndImageExists_RemovesImage()
    {
        var sut = CreateSut();
        var @event = OwnedEvent();
        var image = new EventImage { Id = Guid.NewGuid(), EventId = @event.Id, ImageUrl = "/uploads/events/a.jpg" };
        @event.GalleryImages.Add(image);
        _eventRepository.GetByIdAsync(@event.Id, Arg.Any<CancellationToken>()).Returns(@event);

        var response = await sut.RemoveGalleryImageAsync(_ownerId, @event.Id, image.Id);

        response.GalleryImages.Should().BeEmpty();
        await _eventRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}
