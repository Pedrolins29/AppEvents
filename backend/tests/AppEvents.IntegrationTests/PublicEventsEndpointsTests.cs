using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using AppEvents.Application.Events.Dtos;
using AppEvents.Application.Identity.Dtos;
using AppEvents.Domain.Events;
using FluentAssertions;

namespace AppEvents.IntegrationTests;

public class PublicEventsEndpointsTests : IClassFixture<AppEventsWebApplicationFactory>
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };

    private readonly AppEventsWebApplicationFactory _factory;

    public PublicEventsEndpointsTests(AppEventsWebApplicationFactory factory)
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

    private static CreateEventRequest ValidCreateRequest(
        string? slug = null,
        string? dressCode = null,
        IReadOnlyList<TimelineItemDto>? timelineItems = null) => new(
        "John and Mary Wedding",
        slug ?? UniqueSlug(),
        EventType.Wedding,
        DateTime.UtcNow.AddDays(30),
        "A celebration of love",
        "123 Main St",
        dressCode,
        timelineItems,
        null);

    [Fact]
    public async Task GetBySlug_WhenPublished_Returns200WithNarrowShape()
    {
        var owner = await CreateAuthenticatedClientAsync();
        var slug = UniqueSlug();
        var createResponse = await owner.PostAsJsonAsync("/api/events", ValidCreateRequest(slug));
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);
        await owner.PostAsync($"/api/events/{created!.Id}/publish", null);

        var anonymous = _factory.CreateClient();
        var response = await anonymous.GetAsync($"/api/public/events/{slug}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var raw = await response.Content.ReadAsStringAsync();
        raw.Should().NotContain("\"userId\"", "the public response must not leak the owner's user id");
        raw.Should().NotContain("\"id\"", "the public response must not leak the internal event id");

        var body = await response.Content.ReadFromJsonAsync<PublicEventResponse>(JsonOptions);
        body!.Slug.Should().Be(slug);
        body.Name.Should().Be("John and Mary Wedding");
    }

    [Fact]
    public async Task GetBySlug_WhenPublished_ReturnsDressCodeAndTimelineItems()
    {
        var owner = await CreateAuthenticatedClientAsync();
        var slug = UniqueSlug();
        var timelineItems = new List<TimelineItemDto> { new("12:00", "Ceremony"), new("13:30", "Cocktail hour") };
        var createResponse = await owner.PostAsJsonAsync(
            "/api/events",
            ValidCreateRequest(slug, dressCode: "Garden formal", timelineItems: timelineItems));
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);
        await owner.PostAsync($"/api/events/{created!.Id}/publish", null);

        var anonymous = _factory.CreateClient();
        var body = await anonymous.GetFromJsonAsync<PublicEventResponse>($"/api/public/events/{slug}", JsonOptions);

        body!.DressCode.Should().Be("Garden formal");
        body.TimelineItems.Should().BeEquivalentTo(timelineItems, options => options.WithStrictOrdering());
    }

    [Fact]
    public async Task GetBySlug_WhenUnpublished_Returns404()
    {
        var owner = await CreateAuthenticatedClientAsync();
        var slug = UniqueSlug();
        await owner.PostAsJsonAsync("/api/events", ValidCreateRequest(slug));

        var anonymous = _factory.CreateClient();
        var response = await anonymous.GetAsync($"/api/public/events/{slug}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetBySlug_WhenSlugDoesNotExist_Returns404()
    {
        var anonymous = _factory.CreateClient();

        var response = await anonymous.GetAsync($"/api/public/events/{UniqueSlug()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
