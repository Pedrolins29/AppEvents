import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* Typography extensions — responsive font sizes using CSS clamp() */
      fontSize: {
        /* h1: Responsive from 38px to 64px based on viewport width */
        "display-xl": [
          "clamp(38px, 5.4vw, 64px)",
          {
            lineHeight: "1.1",
            letterSpacing: "-0.01em",
          },
        ],
        /* h2: Responsive from 30px to 44px */
        "display-lg": [
          "clamp(30px, 4vw, 44px)",
          {
            lineHeight: "1.1",
          },
        ],
        /* h3: Medium heading, responsive from 24px to 32px */
        "display-md": [
          "clamp(24px, 3.2vw, 32px)",
          {
            lineHeight: "1.2",
          },
        ],
        /* h4: Small heading, fixed at 22px */
        "display-sm": [
          "22px",
          {
            lineHeight: "1.3",
          },
        ],
        /* Body text base size */
        "body-base": [
          "16px",
          {
            lineHeight: "1.6",
          },
        ],
        /* Body text small */
        "body-sm": [
          "14px",
          {
            lineHeight: "1.6",
          },
        ],
        /* Body text extra small (labels, captions) */
        "body-xs": [
          "13px",
          {
            lineHeight: "1.5",
          },
        ],
      },
      /* Color extensions — added by globals.css via @theme inline */
      colors: {
        porcelain: "var(--porcelain)",
        "porcelain-2": "var(--porcelain-2)",
        ink: "var(--ink)",
        charcoal: "var(--charcoal)",
        pinewood: "var(--pinewood)",
        gold: "var(--gold)",
        champagne: "var(--champagne)",
      },
      /* Font family extensions */
      fontFamily: {
        display: "var(--font-display), serif",
      },
      /* Animation durations — match motion tokens in globals.css */
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },
      /* Easing function for premium animations */
      transitionTimingFunction: {
        premium: "var(--ease-premium)",
      },
    },
  },
  plugins: [],
};

export default config;
