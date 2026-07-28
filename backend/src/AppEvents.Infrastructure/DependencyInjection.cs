using AppEvents.Application.Common.Interfaces;
using AppEvents.Application.Events.Interfaces;
using AppEvents.Application.Events.Services;
using AppEvents.Application.Identity.Interfaces;
using AppEvents.Application.Identity.Services;
using AppEvents.Application.Rsvp.Interfaces;
using AppEvents.Application.Rsvp.Services;
using AppEvents.Application.Templates.Interfaces;
using AppEvents.Application.Templates.Services;
using AppEvents.Infrastructure.Common;
using AppEvents.Infrastructure.Email;
using AppEvents.Infrastructure.Events;
using AppEvents.Infrastructure.Identity;
using AppEvents.Infrastructure.Persistence;
using AppEvents.Infrastructure.Rsvp;
using AppEvents.Infrastructure.Storage;
using AppEvents.Infrastructure.Templates;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AppEvents.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppEventsDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("AppEventsDb")));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.AddSingleton<IDateTimeProvider, SystemDateTimeProvider>();
        services.AddScoped<IAuthService, AuthService>();

        services.AddScoped<IEventRepository, EventRepository>();
        services.AddScoped<IEventService, EventService>();
        services.AddScoped<IPublicEventService, PublicEventService>();

        services.AddScoped<ITemplateRepository, TemplateRepository>();
        services.AddScoped<ITemplateService, TemplateService>();
        services.AddScoped<IImageStorageService, LocalImageStorageService>();

        services.AddScoped<IRsvpRepository, RsvpRepository>();
        services.AddScoped<IRsvpService, RsvpService>();

        services.AddScoped<IEmailSender, SmtpEmailSender>();

        return services;
    }
}
