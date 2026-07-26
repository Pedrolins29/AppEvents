using AppEvents.Application.Common.Exceptions;
using AppEvents.Application.Events.Dtos;
using AppEvents.Application.Events.Interfaces;
using AppEvents.Application.Events.Services;
using AppEvents.Application.Identity.Interfaces;
using AppEvents.Application.Rsvp.Dtos;
using AppEvents.Application.Rsvp.Interfaces;
using AppEvents.Application.Rsvp.Services;
using AppEvents.Domain.Events;
using AppEvents.Domain.Rsvp;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

namespace AppEvents.UnitTests.Rsvp;

public class RsvpServiceTests
{
    private readonly IRsvpRepository _rsvpRepository = Substitute.For<IRsvpRepository>();
    private readonly IEventRepository _eventRepository = Substitute.For<IEventRepository>();
    private readonly IEventService _eventService = Substitute.For<IEventService>();
    private readonly IDateTimeProvider _dateTimeProvider = Substitute.For<IDateTimeProvider>();
    private readonly ILogger<RsvpService> _logger = Substitute.For<ILogger<RsvpService>>();

    private readonly DateTime _now = new(2026, 7, 23, 12, 0, 0, DateTimeKind.Utc);
    private readonly Guid _ownerId = Guid.NewGuid();

    private RsvpService CreateSut()
    {
        _dateTimeProvider.UtcNow.Returns(_now);
        return new RsvpService(_rsvpRepository, _eventRepository, _eventService, _dateTimeProvider, _logger);
    }

    private static Event PublishedEvent() => new()
    {
        Id = Guid.NewGuid(),
        Name = "Existing Event",
        Slug = "existing-event",
        EventType = EventType.Wedding,
        EventDate = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc),
        IsPublished = true,
    };

    [Fact]
    public async Task SubmitAsync_WhenEventNotFoundOrUnpublished_ThrowsNotFoundException()
    {
        var sut = CreateSut();
        _eventRepository.GetPublishedBySlugAsync("missing-event", Arg.Any<CancellationToken>()).Returns((Event?)null);

        var act = () => sut.SubmitAsync("missing-event", new CreateRsvpRequest("Jane Doe", RsvpStatus.Confirmed, null));

        await act.Should().ThrowAsync<NotFoundException>();
        await _rsvpRepository.DidNotReceive().AddAsync(Arg.Any<RsvpResponse>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SubmitAsync_WhenEventPublished_CreatesRsvpAndReturnsDto()
    {
        var sut = CreateSut();
        var @event = PublishedEvent();
        _eventRepository.GetPublishedBySlugAsync(@event.Slug, Arg.Any<CancellationToken>()).Returns(@event);

        var response = await sut.SubmitAsync(@event.Slug, new CreateRsvpRequest("Jane Doe", RsvpStatus.Confirmed, null));

        response.GuestName.Should().Be("Jane Doe");
        response.Status.Should().Be(RsvpStatus.Confirmed);
        await _rsvpRepository.Received(1).AddAsync(
            Arg.Is<RsvpResponse>(r => r!.EventId == @event.Id && r.GuestName == "Jane Doe"),
            Arg.Any<CancellationToken>());
        await _rsvpRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAttendanceAsync_WhenNotOwner_ThrowsNotFoundException()
    {
        var sut = CreateSut();
        var eventId = Guid.NewGuid();
        _eventService.GetByIdAsync(_ownerId, eventId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new NotFoundException("Event not found."));

        var act = () => sut.GetAttendanceAsync(_ownerId, eventId);

        await act.Should().ThrowAsync<NotFoundException>();
        await _rsvpRepository.DidNotReceive().GetByEventIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAttendanceAsync_WhenOwner_ReturnsCorrectSummary()
    {
        var sut = CreateSut();
        var eventId = Guid.NewGuid();
        _eventService.GetByIdAsync(_ownerId, eventId, Arg.Any<CancellationToken>())
            .Returns(new EventResponse(eventId, "Event", "slug", EventType.Wedding, _now, null, null, null,
                true, [], _ownerId, null, _now, _now));
        _rsvpRepository.GetByEventIdAsync(eventId, Arg.Any<CancellationToken>()).Returns(
        [
            new RsvpResponse { EventId = eventId, GuestName = "A", Status = RsvpStatus.Confirmed },
            new RsvpResponse { EventId = eventId, GuestName = "B", Status = RsvpStatus.Confirmed },
            new RsvpResponse { EventId = eventId, GuestName = "C", Status = RsvpStatus.Declined },
        ]);

        var result = await sut.GetAttendanceAsync(_ownerId, eventId);

        result.Summary.Total.Should().Be(3);
        result.Summary.Confirmed.Should().Be(2);
        result.Summary.Declined.Should().Be(1);
        result.Responses.Should().HaveCount(3);
    }
}
