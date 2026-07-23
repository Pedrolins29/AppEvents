using System.Net;
using System.Net.Http.Json;
using AppEvents.Application.Templates.Dtos;
using FluentAssertions;

namespace AppEvents.IntegrationTests;

public class TemplatesEndpointsTests : IClassFixture<AppEventsWebApplicationFactory>
{
    private readonly AppEventsWebApplicationFactory _factory;

    public TemplatesEndpointsTests(AppEventsWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetAll_WithoutAuthentication_ReturnsSeededCatalog()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/templates");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var templates = await response.Content.ReadFromJsonAsync<List<TemplateResponse>>();
        templates.Should().HaveCount(4);
        templates!.Select(t => t.Theme).Should().BeEquivalentTo(["elegant", "minimalist", "floral", "modern"]);
    }

    [Fact]
    public async Task GetById_WithValidId_Returns200()
    {
        var client = _factory.CreateClient();
        var all = await client.GetFromJsonAsync<List<TemplateResponse>>("/api/templates");

        var response = await client.GetAsync($"/api/templates/{all!.First().Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetById_WithUnknownId_Returns404()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync($"/api/templates/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
