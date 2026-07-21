using Serilog;

namespace AppEvents.Api.Extensions;

public static class SerilogExtensions
{
    public static void ConfigureSerilog(HostBuilderContext context, LoggerConfiguration loggerConfiguration)
    {
        loggerConfiguration
            .ReadFrom.Configuration(context.Configuration)
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .WriteTo.File(
                path: "logs/appevents-.log",
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 14);
    }
}
