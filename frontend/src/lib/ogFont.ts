// next/og's ImageResponse (satori) has no access to next/font's CSS variables - it needs raw
// font bytes passed via its `fonts` option. This fetches Playfair Display's TTF from the Google
// Fonts CSS API, the standard next/og pattern. Cached at module scope so the dynamic per-event
// OG image route only fetches it once per server lifetime, not once per request.
let cachedFont: ArrayBuffer | null = null;

export async function loadPlayfairDisplayFont(): Promise<ArrayBuffer> {
  if (cachedFont) {
    return cachedFont;
  }

  // Deliberately no browser-like User-Agent: Google's CSS API serves woff2 to modern browsers
  // (which satori can't parse) but falls back to ttf/otf for unrecognized clients like this one -
  // exactly what the `fonts` option below needs.
  const cssUrl = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700";
  const css = await (await fetch(cssUrl)).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/);
  if (!match) {
    throw new Error("Could not resolve Playfair Display font URL from Google Fonts CSS.");
  }

  const fontResponse = await fetch(match[1]);
  cachedFont = await fontResponse.arrayBuffer();
  return cachedFont;
}
