using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using AppEvents.Application.Events.Dtos;
using AppEvents.Application.Identity.Dtos;
using AppEvents.Application.Rsvp.Dtos;
using AppEvents.Domain.Events;
using AppEvents.Domain.Rsvp;
using FluentAssertions;

namespace AppEvents.IntegrationTests;

public class GuestEndpointsTests : IClassFixture<AppEventsWebApplicationFactory>
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };

    private readonly AppEventsWebApplicationFactory _factory;

    public GuestEndpointsTests(AppEventsWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private static string UniqueEmail() => $"test-{Guid.NewGuid():N}@example.com";

    private static string UniqueSlug() => $"event-{Guid.NewGuid():N}"[..20];

    private async Task<HttpClient> CreateAuthenticatedClientAsync()
    {
        var client = _factory.CreateClient();
        var email = UniqueEmail();
        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Str0ng!Passw0rd", "Test User"));
        await _factory.ConfirmUserAsync(email);
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "Str0ng!Passw0rd"));
        var loginBody = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginBody!.AccessToken);
        return client;
    }

    private static CreateEventRequest ValidCreateRequest(string? slug = null) => new(
        "John and Mary Wedding",
        slug ?? UniqueSlug(),
        EventType.Wedding,
        DateTime.UtcNow.AddDays(30),
        "A celebration of love",
        "123 Main St",
        null,
        null,
        null);

    private async Task<(HttpClient owner, string slug, Guid eventId)> CreatePublishedEventAsync()
    {
        var owner = await CreateAuthenticatedClientAsync();
        var slug = UniqueSlug();
        var createResponse = await owner.PostAsJsonAsync("/api/events", ValidCreateRequest(slug));
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);
        await owner.PostAsync($"/api/events/{created!.Id}/publish", null);
        return (owner, slug, created.Id);
    }

    // ---- Public RSVP submission (walk-in / tokenless) ----

    [Fact]
    public async Task SubmitRsvp_ToPublishedEvent_Returns201()
    {
        var (_, slug, _) = await CreatePublishedEventAsync();
        var anonymous = _factory.CreateClient();

        var response = await anonymous.PostAsJsonAsync(
            $"/api/public/events/{slug}/rsvp",
            new CreateRsvpRequest("Jane Doe", "jane@example.com", null, RsvpStatus.Confirmed, null),
            JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<GuestDto>(JsonOptions);
        body!.GuestName.Should().Be("Jane Doe");
        body.GuestEmail.Should().Be("jane@example.com");
        body.Status.Should().Be(RsvpStatus.Confirmed);
        body.InviteToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task SubmitRsvp_ToUnpublishedEvent_Returns404()
    {
        var owner = await CreateAuthenticatedClientAsync();
        var slug = UniqueSlug();
        await owner.PostAsJsonAsync("/api/events", ValidCreateRequest(slug));
        var anonymous = _factory.CreateClient();

        var response = await anonymous.PostAsJsonAsync(
            $"/api/public/events/{slug}/rsvp",
            new CreateRsvpRequest("Jane Doe", "jane@example.com", null, RsvpStatus.Confirmed, null),
            JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task SubmitRsvp_WithHoneypotFilled_Returns400()
    {
        var (_, slug, _) = await CreatePublishedEventAsync();
        var anonymous = _factory.CreateClient();

        var response = await anonymous.PostAsJsonAsync(
            $"/api/public/events/{slug}/rsvp",
            new CreateRsvpRequest("Jane Doe", "jane@example.com", null, RsvpStatus.Confirmed, "I am a bot"),
            JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SubmitRsvp_WithPendingStatus_Returns400()
    {
        var (_, slug, _) = await CreatePublishedEventAsync();
        var anonymous = _factory.CreateClient();

        var response = await anonymous.PostAsJsonAsync(
            $"/api/public/events/{slug}/rsvp",
            new CreateRsvpRequest("Jane Doe", "jane@example.com", null, RsvpStatus.Pending, null),
            JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ---- Organizer guest list ----

    [Fact]
    public async Task AddGuest_ThenGetGuests_ShowsPendingGuest()
    {
        var (owner, _, eventId) = await CreatePublishedEventAsync();

        var addResponse = await owner.PostAsJsonAsync($"/api/events/{eventId}/guests", new AddGuestRequest("Carlos", null, "+5511988887777"), JsonOptions);
        addResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var added = await addResponse.Content.ReadFromJsonAsync<GuestDto>(JsonOptions);
        added!.Status.Should().Be(RsvpStatus.Pending);
        added.InviteToken.Should().NotBeNullOrEmpty();

        var listResponse = await owner.GetFromJsonAsync<GuestListResponse>($"/api/events/{eventId}/guests", JsonOptions);
        listResponse!.Summary.Pending.Should().Be(1);
        listResponse.Guests.Should().ContainSingle(g => g.GuestName == "Carlos");
    }

    [Fact]
    public async Task GetGuests_AsAnotherUser_Returns404()
    {
        var (_, _, eventId) = await CreatePublishedEventAsync();
        var otherClient = await CreateAuthenticatedClientAsync();

        var response = await otherClient.GetAsync($"/api/events/{eventId}/guests");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ---- Personal-link flow: add guest -> prefill by token -> tokened submit updates that guest ----

    [Fact]
    public async Task PersonalLink_PrefillThenTokenedSubmit_UpdatesTheSameGuest()
    {
        var (owner, slug, eventId) = await CreatePublishedEventAsync();
        var added = await (await owner.PostAsJsonAsync($"/api/events/{eventId}/guests", new AddGuestRequest("Marina", "marina@example.com", null), JsonOptions))
            .Content.ReadFromJsonAsync<GuestDto>(JsonOptions);
        var token = added!.InviteToken;

        var anonymous = _factory.CreateClient();

        // Prefill returns the invitee's own details, still pending.
        var prefill = await anonymous.GetFromJsonAsync<GuestPrefillDto>($"/api/public/events/{slug}/guest/{token}", JsonOptions);
        prefill!.GuestName.Should().Be("Marina");
        prefill.HasResponded.Should().BeFalse();

        // Tokened submit updates that pending guest in place - no new row, status flips to Confirmed.
        var submit = await anonymous.PostAsJsonAsync(
            $"/api/public/events/{slug}/rsvp",
            new CreateRsvpRequest("Marina", "marina@example.com", "+5511977776666", RsvpStatus.Confirmed, null, token),
            JsonOptions);
        submit.StatusCode.Should().Be(HttpStatusCode.Created);

        var list = await owner.GetFromJsonAsync<GuestListResponse>($"/api/events/{eventId}/guests", JsonOptions);
        list!.Summary.Total.Should().Be(1);
        list.Summary.Confirmed.Should().Be(1);
        list.Summary.Pending.Should().Be(0);
        list.Guests.Single().GuestPhone.Should().Be("+5511977776666");
    }

    [Fact]
    public async Task GetGuestPrefill_WithUnknownToken_Returns404()
    {
        var (_, slug, _) = await CreatePublishedEventAsync();
        var anonymous = _factory.CreateClient();

        var response = await anonymous.GetAsync($"/api/public/events/{slug}/guest/nonexistent-token");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ---- Reminder email ----

    [Fact]
    public async Task RemindByEmail_SendsEmail_AndBumpsReminderCount()
    {
        var (owner, _, eventId) = await CreatePublishedEventAsync();
        var added = await (await owner.PostAsJsonAsync($"/api/events/{eventId}/guests", new AddGuestRequest("Reminded Guest", "remind-me@example.com", null), JsonOptions))
            .Content.ReadFromJsonAsync<GuestDto>(JsonOptions);

        var response = await owner.PostAsync($"/api/events/{eventId}/guests/{added!.Id}/remind-email", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await response.Content.ReadFromJsonAsync<GuestDto>(JsonOptions);
        updated!.ReminderCount.Should().Be(1);
        updated.LastReminderSentAtUtc.Should().NotBeNull();
        _factory.EmailSender.Sent.Should().Contain(e => e.To == "remind-me@example.com");
    }

    [Fact]
    public async Task RemindByEmail_ForGuestWithNoEmail_Returns400()
    {
        var (owner, _, eventId) = await CreatePublishedEventAsync();
        var added = await (await owner.PostAsJsonAsync($"/api/events/{eventId}/guests", new AddGuestRequest("Phone Only", null, "+5511900000000"), JsonOptions))
            .Content.ReadFromJsonAsync<GuestDto>(JsonOptions);

        var response = await owner.PostAsync($"/api/events/{eventId}/guests/{added!.Id}/remind-email", null);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task RemoveGuest_ThenGetGuests_IsEmpty()
    {
        var (owner, _, eventId) = await CreatePublishedEventAsync();
        var added = await (await owner.PostAsJsonAsync($"/api/events/{eventId}/guests", new AddGuestRequest("Temp", null, "+5511911112222"), JsonOptions))
            .Content.ReadFromJsonAsync<GuestDto>(JsonOptions);

        var deleteResponse = await owner.DeleteAsync($"/api/events/{eventId}/guests/{added!.Id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var list = await owner.GetFromJsonAsync<GuestListResponse>($"/api/events/{eventId}/guests", JsonOptions);
        list!.Summary.Total.Should().Be(0);
    }
}
