using Amazon.S3;
using AppEvents.Application.Common.Interfaces;
using AppEvents.Application.Events.Interfaces;
using AppEvents.Application.Events.Services;
using AppEvents.Application.Identity.Interfaces;
using AppEvents.Application.Identity.Services;
using AppEvents.Application.Payments.Interfaces;
using AppEvents.Application.Payments.Services;
using AppEvents.Application.Rsvp.Interfaces;
using AppEvents.Application.Rsvp.Services;
using AppEvents.Application.Templates.Interfaces;
using AppEvents.Application.Templates.Services;
using AppEvents.Infrastructure.Common;
using AppEvents.Infrastructure.Email;
using AppEvents.Infrastructure.Events;
using AppEvents.Infrastructure.Identity;
using AppEvents.Infrastructure.Payments;
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

        // Storage:Provider = "R2" once real Cloudflare R2 credentials exist; defaults to local
        // disk otherwise. See R2ImageStorageService/LocalImageStorageService.
        if (string.Equals(configuration["Storage:Provider"], "R2", StringComparison.OrdinalIgnoreCase))
        {
            services.AddSingleton<IAmazonS3>(_ =>
            {
                var accountId = configuration["Storage:R2:AccountId"] ?? "";
                var accessKey = configuration["Storage:R2:AccessKeyId"] ?? "";
                var secretKey = configuration["Storage:R2:SecretAccessKey"] ?? "";
                var s3Config = new AmazonS3Config
                {
                    ServiceURL = $"https://{accountId}.r2.cloudflarestorage.com",
                    ForcePathStyle = true,
                };
                return new AmazonS3Client(accessKey, secretKey, s3Config);
            });
            services.AddScoped<IImageStorageService, R2ImageStorageService>();
        }
        else
        {
            services.AddScoped<IImageStorageService, LocalImageStorageService>();
        }

        services.AddScoped<IGuestRepository, GuestRepository>();
        services.AddScoped<IGuestService, GuestService>();

        services.AddScoped<IEmailSender, SmtpEmailSender>();
        services.AddScoped<IEmailConfirmationLinkBuilder, EmailConfirmationLinkBuilder>();
        services.AddScoped<IGuestInviteLinkBuilder, GuestInviteLinkBuilder>();

        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IEntitlementRepository, EntitlementRepository>();
        services.AddScoped<IEntitlementService, EntitlementService>();
        services.AddScoped<IWebhookSignatureVerifier, HmacWebhookSignatureVerifier>();
        services.AddScoped<IWebhookPayloadParser, LastlinkWebhookPayloadParser>();
        services.AddScoped<IPremiumProductCatalog, PremiumProductCatalog>();
        services.AddScoped<IPaymentWebhookProcessor, PaymentWebhookProcessorService>();

        return services;
    }
}
