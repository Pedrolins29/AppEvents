using System.Security.Cryptography;

namespace AppEvents.Application.Rsvp.Services;

// A URL-safe, unguessable token for a guest's personal RSVP link (/e/{slug}?g={token}).
// 16 random bytes -> 32 lowercase hex chars: safe to drop straight into a query string, and
// far too large a space to enumerate. A unique DB index on Guest.InviteToken is the backstop.
public static class GuestInviteToken
{
    public static string Generate() => Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(16));
}
