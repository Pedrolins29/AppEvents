using AppEvents.Application.Common.Exceptions;
using AppEvents.Application.Common.Interfaces;
using AppEvents.Application.Events.Dtos;
using AppEvents.Application.Events.Interfaces;
using AppEvents.Application.Events.Services;
using AppEvents.Application.Identity.Interfaces;
using AppEvents.Application.Rsvp.Dtos;
using AppEvents.Application.Rsvp.Interfaces;
using AppEvents.Application.Rsvp.Services;
using AppEvents.Domain.Events;
using AppEvents.Domain.Identity;
using AppEvents.Domain.Rsvp;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

namespace AppEvents.UnitTests.Rsvp;

public class GuestServiceTests
{
    private readonly IGuestRepository _guestRepository = Substitute.For<IGuestRepository>();
    private readonly IEventRepository _eventRepository = Substitute.For<IEventRepository>();
    private readonly IEventService _eventService = Substitute.For<IEventService>();
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IEmailSender _emailSender = Substitute.For<IEmailSender>();
    private readonly IGuestInviteLinkBuilder _inviteLinkBuilder = Substitute.For<IGuestInviteLinkBuilder>();
    private readonly IDateTimeProvider _dateTimeProvider = Substitute.For<IDateTimeProvider>();
    private readonly ILogger<GuestService> _logger = Substitute.For<ILogger<GuestService>>();

    private readonly DateTime _now = new(2026, 7, 31, 12, 0, 0, DateTimeKind.Utc);
    private readonly Guid _ownerId = Guid.NewGuid();

    private GuestService CreateSut()
    {
        _dateTimeProvider.UtcNow.Returns(_now);
        _inviteLinkBuilder.Build(Arg.Any<string>(), Arg.Any<string>()).Returns(ci => $"http://localhost:3000/e/{ci.ArgAt<string>(0)}?g={ci.ArgAt<string>(1)}");
        return new GuestService(_guestRepository, _eventRepository, _eventService, _userRepository, _emailSender, _inviteLinkBuilder, _dateTimeProvider, _logger);
    }

    private static Event PublishedEvent() => new()
    {
        Id = Guid.NewGuid(),
        Name = "Existing Event",
        Slug = "existing-event",
        EventType = EventType.Wedding,
        EventDate = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc),
        IsPublished = true,
        UserId = Guid.NewGuid(),
    };

    private static EventResponse OwnedEventResponse(Guid eventId, Guid ownerId, DateTime now) =>
        new(eventId, "Existing Event", "existing-event", EventType.Wedding, now, null, null, null, [], null, null, true, [], ownerId, null, now, now);

    private static CreateRsvpRequest ValidSubmit(RsvpStatus status = RsvpStatus.Confirmed, string? token = null) =>
        new("Jane Doe", "jane@example.com", null, status, null, token);

    [Fact]
    public async Task SubmitAsync_WhenEventNotFound_ThrowsNotFoundException()
    {
        var sut = CreateSut();
        _eventRepository.GetPublishedBySlugAsync("missing-event", Arg.Any<CancellationToken>()).Returns((Event?)null);

        var act = () => sut.SubmitAsync("missing-event", ValidSubmit());

        await act.Should().ThrowAsync<NotFoundException>();
        await _guestRepository.DidNotReceive().AddAsync(Arg.Any<Guest>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SubmitAsync_WithoutToken_CreatesWalkInGuest()
    {
        var sut = CreateSut();
        var @event = PublishedEvent();
        _eventRepository.GetPublishedBySlugAsync(@event.Slug, Arg.Any<CancellationToken>()).Returns(@event);

        var result = await sut.SubmitAsync(@event.Slug, ValidSubmit());

        result.GuestName.Should().Be("Jane Doe");
        result.Status.Should().Be(RsvpStatus.Confirmed);
        await _guestRepository.Received(1).AddAsync(
            Arg.Is<Guest>(g => g!.EventId == @event.Id && g.Status == RsvpStatus.Confirmed && g.RespondedAtUtc == _now && g.InviteToken != ""),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SubmitAsync_WithValidToken_UpdatesExistingPendingGuest_AndSetsRespondedAt()
    {
        var sut = CreateSut();
        var @event = PublishedEvent();
        _eventRepository.GetPublishedBySlugAsync(@event.Slug, Arg.Any<CancellationToken>()).Returns(@event);
        var pending = new Guest { EventId = @event.Id, GuestName = "Jane", Status = RsvpStatus.Pending, InviteToken = "tok123" };
        _guestRepository.GetByEventAndTokenAsync(@event.Id, "tok123", Arg.Any<CancellationToken>()).Returns(pending);

        var result = await sut.SubmitAsync(@event.Slug, ValidSubmit(RsvpStatus.Confirmed, "tok123"));

        result.Status.Should().Be(RsvpStatus.Confirmed);
        pending.Status.Should().Be(RsvpStatus.Confirmed);
        pending.RespondedAtUtc.Should().Be(_now);
        pending.GuestEmail.Should().Be("jane@example.com");
        // Updated in place - not added as a new row.
        await _guestRepository.DidNotReceive().AddAsync(Arg.Any<Guest>(), Arg.Any<CancellationToken>());
        await _guestRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetGuestListAsync_WhenNotOwner_ThrowsNotFoundException()
    {
        var sut = CreateSut();
        var eventId = Guid.NewGuid();
        _eventService.GetByIdAsync(_ownerId, eventId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new NotFoundException("Event not found."));

        var act = () => sut.GetGuestListAsync(_ownerId, eventId);

        await act.Should().ThrowAsync<NotFoundException>();
        await _guestRepository.DidNotReceive().GetByEventIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetGuestListAsync_WhenOwner_ReturnsSummaryWithPendingCount()
    {
        var sut = CreateSut();
        var eventId = Guid.NewGuid();
        _eventService.GetByIdAsync(_ownerId, eventId, Arg.Any<CancellationToken>()).Returns(OwnedEventResponse(eventId, _ownerId, _now));
        _guestRepository.GetByEventIdAsync(eventId, Arg.Any<CancellationToken>()).Returns(
        [
            new Guest { EventId = eventId, GuestName = "A", Status = RsvpStatus.Confirmed },
            new Guest { EventId = eventId, GuestName = "B", Status = RsvpStatus.Pending },
            new Guest { EventId = eventId, GuestName = "C", Status = RsvpStatus.Pending },
            new Guest { EventId = eventId, GuestName = "D", Status = RsvpStatus.Declined },
        ]);

        var result = await sut.GetGuestListAsync(_ownerId, eventId);

        result.Summary.Total.Should().Be(4);
        result.Summary.Pending.Should().Be(2);
        result.Summary.Confirmed.Should().Be(1);
        result.Summary.Declined.Should().Be(1);
        result.Guests.Should().HaveCount(4);
    }

    [Fact]
    public async Task AddGuestAsync_CreatesPendingGuestWithToken()
    {
        var sut = CreateSut();
        var eventId = Guid.NewGuid();
        _eventService.GetByIdAsync(_ownerId, eventId, Arg.Any<CancellationToken>()).Returns(OwnedEventResponse(eventId, _ownerId, _now));

        var result = await sut.AddGuestAsync(_ownerId, eventId, new AddGuestRequest("Bob", null, "+5511999999999"));

        result.Status.Should().Be(RsvpStatus.Pending);
        result.InviteToken.Should().NotBeNullOrEmpty();
        await _guestRepository.Received(1).AddAsync(
            Arg.Is<Guest>(g => g!.Status == RsvpStatus.Pending && g.GuestPhone == "+5511999999999" && g.GuestEmail == null),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SendReminderEmailAsync_WhenGuestHasNoEmail_ThrowsValidationException()
    {
        var sut = CreateSut();
        var eventId = Guid.NewGuid();
        var guestId = Guid.NewGuid();
        _eventService.GetByIdAsync(_ownerId, eventId, Arg.Any<CancellationToken>()).Returns(OwnedEventResponse(eventId, _ownerId, _now));
        _guestRepository.GetByIdAsync(guestId, Arg.Any<CancellationToken>())
            .Returns(new Guest { Id = guestId, EventId = eventId, GuestName = "NoEmail", GuestEmail = null, Status = RsvpStatus.Pending, InviteToken = "t" });

        var act = () => sut.SendReminderEmailAsync(_ownerId, eventId, guestId);

        await act.Should().ThrowAsync<ValidationAppException>();
        await _emailSender.DidNotReceive().SendAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SendReminderEmailAsync_HappyPath_SendsEmailAndBumpsCounter()
    {
        var sut = CreateSut();
        var eventId = Guid.NewGuid();
        var guestId = Guid.NewGuid();
        _eventService.GetByIdAsync(_ownerId, eventId, Arg.Any<CancellationToken>()).Returns(OwnedEventResponse(eventId, _ownerId, _now));
        var guest = new Guest { Id = guestId, EventId = eventId, GuestName = "Pat", GuestEmail = "pat@example.com", Status = RsvpStatus.Pending, InviteToken = "tok" };
        _guestRepository.GetByIdAsync(guestId, Arg.Any<CancellationToken>()).Returns(guest);

        var result = await sut.SendReminderEmailAsync(_ownerId, eventId, guestId);

        await _emailSender.Received(1).SendAsync("pat@example.com", Arg.Any<string>(), Arg.Is<string>(b => b.Contains("existing-event") && b.Contains("tok")), Arg.Any<CancellationToken>());
        result.ReminderCount.Should().Be(1);
        result.LastReminderSentAtUtc.Should().Be(_now);
    }

    [Fact]
    public async Task SendReminderEmailAsync_WhenGuestBelongsToADifferentEvent_ThrowsNotFound()
    {
        var sut = CreateSut();
        var eventId = Guid.NewGuid();
        var guestId = Guid.NewGuid();
        _eventService.GetByIdAsync(_ownerId, eventId, Arg.Any<CancellationToken>()).Returns(OwnedEventResponse(eventId, _ownerId, _now));
        _guestRepository.GetByIdAsync(guestId, Arg.Any<CancellationToken>())
            .Returns(new Guest { Id = guestId, EventId = Guid.NewGuid(), GuestName = "X", GuestEmail = "x@example.com", InviteToken = "t" });

        var act = () => sut.SendReminderEmailAsync(_ownerId, eventId, guestId);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
