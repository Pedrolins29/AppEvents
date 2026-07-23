import { ImageResponse } from "next/og";
import { loadPlayfairDisplayFont } from "@/lib/ogFont";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // This image is statically generated at build time - don't let a transient Google Fonts
  // failure break the whole build; fall back to satori's default font instead.
  const playfairData = await loadPlayfairDisplayFont().catch(() => null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FDFBF7",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 1000,
            height: 480,
            border: "2px solid rgba(15,118,110,0.25)",
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              border: "2px solid rgba(15,118,110,0.25)",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                background: "#A16207",
                transform: "rotate(45deg)",
                marginBottom: 28,
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 22,
                letterSpacing: 8,
                color: "#0F766E",
                marginBottom: 20,
              }}
            >
              DIGITAL INVITATIONS
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                fontFamily: "Playfair Display",
                fontSize: 60,
                lineHeight: 1.2,
                color: "#14211D",
                textAlign: "center",
                width: 760,
              }}
            >
              Every celebration deserves its own page.
            </div>
          </div>
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
