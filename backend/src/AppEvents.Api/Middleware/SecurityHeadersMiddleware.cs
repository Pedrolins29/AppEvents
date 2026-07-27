namespace AppEvents.Api.Middleware;

public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.Headers["X-Content-Type-Options"] = "nosniff";
        context.Response.Headers["X-Frame-Options"] = "DENY";
        context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        context.Response.Headers["Content-Security-Policy"] = "default-src 'self'";
        context.Response.Headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()";
        context.Response.Headers["Cross-Origin-Opener-Policy"] = "same-origin";
        // "cross-origin" (not "same-origin") — this middleware runs before UseStaticFiles, and
        // uploaded event cover/gallery images are deliberately loaded cross-origin by the
        // frontend's <img> tags. A stricter value would silently break every event image.
        context.Response.Headers["Cross-Origin-Resource-Policy"] = "cross-origin";

        await _next(context);
    }
}
