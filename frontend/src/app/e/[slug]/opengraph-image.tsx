import { ImageResponse } from "next/og";
import { DEFAULT_THEME_STYLE, THEME_STYLES } from "@/components/InvitationHero";
import { publicEventsApi } from "@/lib/publicEventsApi";
import { loadPlayfairDisplayFont } from "@/lib/ogFont";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params;
  // A social-media scraper hitting this route should never see a broken image - fall back to
  // the generic branded card on any failure (network blip, backend hiccup), not just a genuine
  // "event not found," same as the case where event is null below.
  const [event, playfairData] = await Promise.all([
    publicEventsApi.get(slug).catch(() => null),
    loadPlayfairDisplayFont().catch(() => null),
  ]);

  const theme = event?.themeKey ? THEME_STYLES[event.themeKey] : DEFAULT_THEME_STYLE;
  const name = event?.name ?? "You're invited";
  const formattedDate = event
    ? new Date(event.eventDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: theme.pageBg,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            fontFamily: "Playfair Display",
            fontSize: 68,
            lineHeight: 1.2,
            color: theme.heading,
            textAlign: "center",
            width: 900,
          }}
        >
          {name}
        </div>
        {formattedDate && (
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 26,
              letterSpacing: 2,
              color: theme.accent,
            }}
          >
            {formattedDate}
          </div>
        )}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 40,
            fontSize: 20,
            letterSpacing: 4,
            color: theme.body,
          }}
        >
          APPEVENTS
        </div>
      </div>
    ),
    {
      ...size,
      fonts: playfairData
        ? [{ name: "Playfair Display", data: playfairData, style: "normal", weight: 700 }]
        : undefined,
    },
  );
}
