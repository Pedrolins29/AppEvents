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

public class RsvpEndpointsTests : IClassFixture<AppEventsWebApplicationFactory>
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };

    private readonly AppEventsWebApplicationFactory _factory;

    public RsvpEndpointsTests(AppEventsWebApplicationFactory factory)
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

    private async Task<(HttpClient owner, string slug, System.Guid eventId)> CreatePublishedEventAsync()
    {
        var owner = await CreateAuthenticatedClientAsync();
        var slug = UniqueSlug();
        var createResponse = await owner.PostAsJsonAsync("/api/events", ValidCreateRequest(slug));
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);
        await owner.PostAsync($"/api/events/{created!.Id}/publish", null);
        return (owner, slug, created.Id);
    }

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
        var body = await response.Content.ReadFromJsonAsync<RsvpResponseDto>(JsonOptions);
        body!.GuestName.Should().Be("Jane Doe");
        body.GuestEmail.Should().Be("jane@example.com");
        body.Status.Should().Be(RsvpStatus.Confirmed);
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
    public async Task SubmitRsvp_WithMissingGuestEmail_Returns400()
    {
        var (_, slug, _) = await CreatePublishedEventAsync();
        var anonymous = _factory.CreateClient();

        var response = await anonymous.PostAsJsonAsync(
            $"/api/public/events/{slug}/rsvp",
            new CreateRsvpRequest("Jane Doe", "", null, RsvpStatus.Confirmed, null),
            JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetAttendance_AsOwner_ReturnsCorrectCounts()
    {
        var (owner, slug, eventId) = await CreatePublishedEventAsync();
        var anonymous = _factory.CreateClient();
        await anonymous.PostAsJsonAsync($"/api/public/events/{slug}/rsvp", new CreateRsvpRequest("Guest A", "guesta@example.com", null, RsvpStatus.Confirmed, null), JsonOptions);
        await anonymous.PostAsJsonAsync($"/api/public/events/{slug}/rsvp", new CreateRsvpRequest("Guest B", "guestb@example.com", null, RsvpStatus.Declined, null), JsonOptions);

        var response = await owner.GetAsync($"/api/events/{eventId}/rsvps");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var attendance = await response.Content.ReadFromJsonAsync<AttendanceResponse>(JsonOptions);
        attendance!.Summary.Total.Should().Be(2);
        attendance.Summary.Confirmed.Should().Be(1);
        attendance.Summary.Declined.Should().Be(1);
        attendance.Responses.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAttendance_AsAnotherUser_Returns404()
    {
        var (_, _, eventId) = await CreatePublishedEventAsync();
        var otherClient = await CreateAuthenticatedClientAsync();

        var response = await otherClient.GetAsync($"/api/events/{eventId}/rsvps");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
