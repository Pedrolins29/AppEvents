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

public class EventsEndpointsTests : IClassFixture<AppEventsWebApplicationFactory>
{
    // Web defaults (camelCase, case-insensitive) match what HttpClient's JSON helpers use
    // implicitly when no options are passed — a bare `new JsonSerializerOptions()` does not
    // carry those defaults, which silently breaks every property, not just the enum.
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };

    private readonly AppEventsWebApplicationFactory _factory;

    public EventsEndpointsTests(AppEventsWebApplicationFactory factory)
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
        "John and Mary's Wedding",
        slug ?? UniqueSlug(),
        EventType.Wedding,
        DateTime.UtcNow.AddDays(30),
        "A celebration of love",
        "123 Main St",
        null);

    [Fact]
    public async Task Create_WithValidRequest_Returns201()
    {
        var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/events", ValidCreateRequest());

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task Create_WithoutAuthentication_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/events", ValidCreateRequest());

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Create_WithDuplicateSlug_Returns409()
    {
        var client = await CreateAuthenticatedClientAsync();
        var slug = UniqueSlug();
        await client.PostAsJsonAsync("/api/events", ValidCreateRequest(slug));

        var response = await client.PostAsJsonAsync("/api/events", ValidCreateRequest(slug));

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Create_WithXssPayloadInName_Returns400()
    {
        var client = await CreateAuthenticatedClientAsync();
        var request = ValidCreateRequest() with { Name = "<script>alert(document.cookie)</script>" };

        var response = await client.PostAsJsonAsync("/api/events", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Create_WithSqlInjectionPayload_IsRejectedOrStoredSafelyWithoutExploitation()
    {
        var client = await CreateAuthenticatedClientAsync();
        var request = ValidCreateRequest() with { Name = "Robert'); DROP TABLE Events;--" };

        var response = await client.PostAsJsonAsync("/api/events", request);

        // Either accepted and stored as an inert string (EF parameterizes all queries), or
        // rejected by validation — either way the Events table must still be queryable afterward.
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
        var listResponse = await client.GetAsync("/api/events");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetMyEvents_OnlyReturnsOwnEvents()
    {
        var clientA = await CreateAuthenticatedClientAsync();
        var clientB = await CreateAuthenticatedClientAsync();
        var slugA = UniqueSlug();
        await clientA.PostAsJsonAsync("/api/events", ValidCreateRequest(slugA));
        await clientB.PostAsJsonAsync("/api/events", ValidCreateRequest());

        var response = await clientA.GetFromJsonAsync<List<EventResponse>>("/api/events", JsonOptions);

        response.Should().ContainSingle(e => e.Slug == slugA);
    }

    [Fact]
    public async Task GetById_AsOwner_Returns200()
    {
        var client = await CreateAuthenticatedClientAsync();
        var createResponse = await client.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        var response = await client.GetAsync($"/api/events/{created!.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetById_AsAnotherUser_Returns404()
    {
        var ownerClient = await CreateAuthenticatedClientAsync();
        var otherClient = await CreateAuthenticatedClientAsync();
        var createResponse = await ownerClient.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        var response = await otherClient.GetAsync($"/api/events/{created!.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Update_AsAnotherUser_Returns404AndDoesNotModify()
    {
        var ownerClient = await CreateAuthenticatedClientAsync();
        var otherClient = await CreateAuthenticatedClientAsync();
        var createResponse = await ownerClient.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        var updateRequest = new UpdateEventRequest(
            "Hijacked Name", created!.Slug, EventType.Birthday, DateTime.UtcNow.AddDays(1), null, null, null);
        var response = await otherClient.PutAsJsonAsync($"/api/events/{created.Id}", updateRequest);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var stillOwned = await ownerClient.GetFromJsonAsync<EventResponse>($"/api/events/{created.Id}", JsonOptions);
        stillOwned!.Name.Should().Be(created.Name);
    }

    [Fact]
    public async Task Update_AsOwner_Returns200WithUpdatedFields()
    {
        var client = await CreateAuthenticatedClientAsync();
        var createResponse = await client.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        var updateRequest = new UpdateEventRequest(
            "Updated Name", created!.Slug, EventType.Birthday, DateTime.UtcNow.AddDays(5), "Updated", "New Addr", null);
        var response = await client.PutAsJsonAsync($"/api/events/{created.Id}", updateRequest);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await response.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);
        updated!.Name.Should().Be("Updated Name");
        updated.EventType.Should().Be(EventType.Birthday);
    }

    [Fact]
    public async Task Delete_AsAnotherUser_Returns404AndEventStillExists()
    {
        var ownerClient = await CreateAuthenticatedClientAsync();
        var otherClient = await CreateAuthenticatedClientAsync();
        var createResponse = await ownerClient.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        var response = await otherClient.DeleteAsync($"/api/events/{created!.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var stillThere = await ownerClient.GetAsync($"/api/events/{created.Id}");
        stillThere.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Delete_AsOwner_Returns204AndEventNoLongerExists()
    {
        var client = await CreateAuthenticatedClientAsync();
        var createResponse = await client.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        var response = await client.DeleteAsync($"/api/events/{created!.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        var afterDelete = await client.GetAsync($"/api/events/{created.Id}");
        afterDelete.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Create_WithValidTemplateId_SetsTemplateOnEvent()
    {
        var client = await CreateAuthenticatedClientAsync();
        var templates = await client.GetFromJsonAsync<List<AppEvents.Application.Templates.Dtos.TemplateResponse>>("/api/templates");
        var templateId = templates!.First().Id;

        var response = await client.PostAsJsonAsync("/api/events", ValidCreateRequest() with { TemplateId = templateId });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await response.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);
        created!.TemplateId.Should().Be(templateId);
    }

    [Fact]
    public async Task Create_WithUnknownTemplateId_Returns400()
    {
        var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/events", ValidCreateRequest() with { TemplateId = Guid.NewGuid() });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    private static byte[] MinimalJpegBytes()
    {
        var bytes = new byte[64];
        new byte[] { 0xFF, 0xD8, 0xFF }.CopyTo(bytes, 0);
        return bytes;
    }

    [Fact]
    public async Task UploadCoverImage_WithValidJpeg_SetsCoverImageUrl()
    {
        var client = await CreateAuthenticatedClientAsync();
        var createResponse = await client.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        using var content = new MultipartFormDataContent();
        using var fileContent = new ByteArrayContent(MinimalJpegBytes());
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
        content.Add(fileContent, "file", "cover.jpg");

        var response = await client.PostAsync($"/api/events/{created!.Id}/cover-image", content);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await response.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);
        updated!.CoverImageUrl.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task UploadCoverImage_WithDisallowedExtension_Returns400()
    {
        var client = await CreateAuthenticatedClientAsync();
        var createResponse = await client.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        using var content = new MultipartFormDataContent();
        using var fileContent = new ByteArrayContent(MinimalJpegBytes());
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
        content.Add(fileContent, "file", "malicious.exe");

        var response = await client.PostAsync($"/api/events/{created!.Id}/cover-image", content);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UploadCoverImage_WithSpoofedExtension_Returns400()
    {
        var client = await CreateAuthenticatedClientAsync();
        var createResponse = await client.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        using var content = new MultipartFormDataContent();
        var notActuallyAnImage = System.Text.Encoding.UTF8.GetBytes("just some plain text");
        using var fileContent = new ByteArrayContent(notActuallyAnImage);
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/png");
        content.Add(fileContent, "file", "innocent.png");

        var response = await client.PostAsync($"/api/events/{created!.Id}/cover-image", content);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UploadCoverImage_AsAnotherUser_Returns404()
    {
        var ownerClient = await CreateAuthenticatedClientAsync();
        var otherClient = await CreateAuthenticatedClientAsync();
        var createResponse = await ownerClient.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        using var content = new MultipartFormDataContent();
        using var fileContent = new ByteArrayContent(MinimalJpegBytes());
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
        content.Add(fileContent, "file", "cover.jpg");

        var response = await otherClient.PostAsync($"/api/events/{created!.Id}/cover-image", content);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UploadFeaturedPhoto_WithValidJpeg_SetsFeaturedPhotoUrl()
    {
        var client = await CreateAuthenticatedClientAsync();
        var createResponse = await client.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        using var content = new MultipartFormDataContent();
        using var fileContent = new ByteArrayContent(MinimalJpegBytes());
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
        content.Add(fileContent, "file", "featured.jpg");

        var response = await client.PostAsync($"/api/events/{created!.Id}/featured-photo", content);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await response.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);
        updated!.FeaturedPhotoUrl.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task UploadFeaturedPhoto_WithSpoofedExtension_Returns400()
    {
        var client = await CreateAuthenticatedClientAsync();
        var createResponse = await client.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        using var content = new MultipartFormDataContent();
        var notActuallyAnImage = System.Text.Encoding.UTF8.GetBytes("just some plain text");
        using var fileContent = new ByteArrayContent(notActuallyAnImage);
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/png");
        content.Add(fileContent, "file", "innocent.png");

        var response = await client.PostAsync($"/api/events/{created!.Id}/featured-photo", content);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UploadFeaturedPhoto_AsAnotherUser_Returns404()
    {
        var ownerClient = await CreateAuthenticatedClientAsync();
        var otherClient = await CreateAuthenticatedClientAsync();
        var createResponse = await ownerClient.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        using var content = new MultipartFormDataContent();
        using var fileContent = new ByteArrayContent(MinimalJpegBytes());
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
        content.Add(fileContent, "file", "featured.jpg");

        var response = await otherClient.PostAsync($"/api/events/{created!.Id}/featured-photo", content);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Publish_AsOwner_SetsIsPublishedTrue()
    {
        var client = await CreateAuthenticatedClientAsync();
        var createResponse = await client.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        var response = await client.PostAsync($"/api/events/{created!.Id}/publish", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await response.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);
        updated!.IsPublished.Should().BeTrue();
    }

    [Fact]
    public async Task Publish_AsAnotherUser_Returns404()
    {
        var ownerClient = await CreateAuthenticatedClientAsync();
        var otherClient = await CreateAuthenticatedClientAsync();
        var createResponse = await ownerClient.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        var response = await otherClient.PostAsync($"/api/events/{created!.Id}/publish", null);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Unpublish_AsOwner_SetsIsPublishedFalse()
    {
        var client = await CreateAuthenticatedClientAsync();
        var createResponse = await client.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);
        await client.PostAsync($"/api/events/{created!.Id}/publish", null);

        var response = await client.PostAsync($"/api/events/{created.Id}/unpublish", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await response.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);
        updated!.IsPublished.Should().BeFalse();
    }

    [Fact]
    public async Task AddGalleryImage_WithValidJpeg_AppendsImage()
    {
        var client = await CreateAuthenticatedClientAsync();
        var createResponse = await client.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        using var content = new MultipartFormDataContent();
        using var fileContent = new ByteArrayContent(MinimalJpegBytes());
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(fileContent, "file", "gallery.jpg");

        var response = await client.PostAsync($"/api/events/{created!.Id}/gallery-images", content);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await response.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);
        updated!.GalleryImages.Should().ContainSingle();
    }

    [Fact]
    public async Task AddGalleryImage_WithSpoofedExtension_Returns400()
    {
        var client = await CreateAuthenticatedClientAsync();
        var createResponse = await client.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        using var content = new MultipartFormDataContent();
        var notActuallyAnImage = System.Text.Encoding.UTF8.GetBytes("just some plain text");
        using var fileContent = new ByteArrayContent(notActuallyAnImage);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        content.Add(fileContent, "file", "innocent.png");

        var response = await client.PostAsync($"/api/events/{created!.Id}/gallery-images", content);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task AddGalleryImage_AsAnotherUser_Returns404()
    {
        var ownerClient = await CreateAuthenticatedClientAsync();
        var otherClient = await CreateAuthenticatedClientAsync();
        var createResponse = await ownerClient.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        using var content = new MultipartFormDataContent();
        using var fileContent = new ByteArrayContent(MinimalJpegBytes());
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(fileContent, "file", "gallery.jpg");

        var response = await otherClient.PostAsync($"/api/events/{created!.Id}/gallery-images", content);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task AddGalleryImage_PastCap_Returns400()
    {
        var client = await CreateAuthenticatedClientAsync();
        var createResponse = await client.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        HttpResponseMessage? lastResponse = null;
        for (var i = 0; i < 11; i++)
        {
            using var content = new MultipartFormDataContent();
            using var fileContent = new ByteArrayContent(MinimalJpegBytes());
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
            content.Add(fileContent, "file", $"gallery{i}.jpg");
            lastResponse = await client.PostAsync($"/api/events/{created!.Id}/gallery-images", content);
        }

        lastResponse!.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task RemoveGalleryImage_AsOwner_RemovesImage()
    {
        var client = await CreateAuthenticatedClientAsync();
        var createResponse = await client.PostAsJsonAsync("/api/events", ValidCreateRequest());
        var created = await createResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);

        using var content = new MultipartFormDataContent();
        using var fileContent = new ByteArrayContent(MinimalJpegBytes());
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(fileContent, "file", "gallery.jpg");
        var uploadResponse = await client.PostAsync($"/api/events/{created!.Id}/gallery-images", content);
        var uploaded = await uploadResponse.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);
        var imageId = uploaded!.GalleryImages.Single().Id;

        var response = await client.DeleteAsync($"/api/events/{created.Id}/gallery-images/{imageId}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await response.Content.ReadFromJsonAsync<EventResponse>(JsonOptions);
        updated!.GalleryImages.Should().BeEmpty();
    }
}
