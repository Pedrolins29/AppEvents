import Link from "next/link";
import { PhoneMockup } from "@/components/PhoneMockup";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TemplateCard } from "@/components/TemplateCard";
import { EVENT_TYPE_LABELS, EVENT_TYPES } from "@/types/event";
import type { ThemeKey } from "@/types/template";

function Diamond({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 10 10" aria-hidden className={className}>
      <path d="M5 0L10 5L5 10L0 5Z" fill="currentColor" />
    </svg>
  );
}

function ThemesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none">
      <rect x="1" y="1" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="13" y="1" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function CountdownIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none">
      <circle cx="11" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 6.5V12L14.5 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8 1.5H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none">
      <rect x="4" y="5" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 15L8 11L11 14L15 10L18 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.25" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none">
      <path
        d="M11 20C11 20 18 13.8 18 9.2C18 5.2 14.9 2 11 2C7.1 2 4 5.2 4 9.2C4 13.8 11 20 11 20Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="9.2" r="2.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

const TEMPLATE_THEMES: { theme: ThemeKey; name: string }[] = [
  { theme: "elegant", name: "Elegant" },
  { theme: "minimalist", name: "Minimalist" },
  { theme: "floral", name: "Floral" },
  { theme: "modern", name: "Modern" },
];

const STEPS = [
  {
    number: "01",
    title: "Choose a theme",
    body: "Elegant, Minimalist, Floral, or Modern — pick the one that feels like your event.",
  },
  {
    number: "02",
    title: "Add your details",
    body: "Name, date, story, cover photo, and a gallery — all on your own invitation page.",
  },
  {
    number: "03",
    title: "Share the link",
    body: "Publish when you're ready and send one link. Everyone sees the same page.",
  },
];

const FEATURES = [
  {
    icon: ThemesIcon,
    title: "Four designer themes",
    body: "Elegant, Minimalist, Floral, or Modern — each with its own type, color, and mood. Pick the one that feels like your event.",
  },
  {
    icon: CountdownIcon,
    title: "A countdown that ticks",
    body: "Every visit shows guests exactly how close the day is, right on your invitation page.",
  },
  {
    icon: GalleryIcon,
    title: "Cover photo & gallery",
    body: "Add a cover image and a set of photos to tell the story before the big day.",
  },
  {
    icon: MapIcon,
    title: "Maps built in",
    body: "One tap opens Google Maps or Waze with your venue address already filled in.",
  },
];

const FAQS = [
  {
    question: "Is AppEvents free?",
    answer: "Yes — it's free to create and publish your invitation right now.",
  },
  {
    question: "What kinds of events can I create?",
    answer: `${EVENT_TYPES.map((type) => EVENT_TYPE_LABELS[type]).join(", ")}, and more.`,
  },
  {
    question: "Can guests RSVP?",
    answer:
      "Yes — every published invitation has a built-in RSVP form, and you can see who's confirmed or declined from your dashboard.",
  },
  {
    question: "Can I edit my invitation after publishing?",
    answer: "Yes, anytime. Changes go live immediately at the same link.",
  },
  {
    question: "Is there a limit on guests?",
    answer: "No — share your one link with as many guests as you like.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[#FDFBF7] dark:bg-[#0F1714]">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl border border-[#0F766E]/25 p-1.5 dark:border-[#14B8A6]/25">
            <div className="border border-[#0F766E]/25 px-6 py-12 text-center sm:px-14 sm:py-16 dark:border-[#14B8A6]/25">
              <Diamond className="mx-auto mb-6 text-[#A16207] dark:text-[#D4A017]" />
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-[#0F766E] dark:text-[#14B8A6]">
                Digital Invitations
              </p>
              <h1
                className="font-serif text-4xl leading-tight text-[#14211D] sm:text-5xl dark:text-[#F3F1EA]"
                style={{ fontWeight: 600 }}
              >
                Every celebration deserves its own page.
              </h1>
              <p className="mx-auto mt-5 max-w-md text-base text-[#5B6B67] dark:text-[#9CA9A5]">
                Pick a designer theme, add your story and photos, and share one link with a live
                countdown and map built in.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="rounded-full bg-[#0F766E] px-6 py-3 text-sm font-medium text-white hover:bg-[#0C5C56] dark:bg-[#14B8A6] dark:text-[#062420] dark:hover:bg-[#2DD4BF]"
                >
                  Create your invitation
                </Link>
                <Link
                  href="/templates"
                  className="rounded-full border border-[#0F766E]/40 px-6 py-3 text-sm font-medium text-[#14211D] hover:bg-[#0F766E]/5 dark:border-[#14B8A6]/40 dark:text-[#F3F1EA] dark:hover:bg-[#14B8A6]/10"
                >
                  Browse themes
                </Link>
              </div>
              <p className="mt-6 text-xs uppercase tracking-[0.15em] text-[#5B6B67]/80 dark:text-[#9CA9A5]/80">
                Four designer themes &middot; Live countdown &middot; Photo gallery &middot; Maps
                built in
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {EVENT_TYPES.map((type) => (
                  <span
                    key={type}
                    className="rounded-full border border-[#E2DFD3] px-3 py-1 text-xs text-[#5B6B67] dark:border-[#2A3532] dark:text-[#9CA9A5]"
                  >
                    {EVENT_TYPE_LABELS[type]}
                  </span>
                ))}
              </div>

              <div className="mt-12 flex justify-center">
                <PhoneMockup />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 pb-20 sm:pb-28">
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="border border-[#E2DFD3] p-6 dark:border-[#2A3532]"
              >
                <div className="mb-3 text-[#0F766E] dark:text-[#14B8A6]">
                  <Icon />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-[#14211D] dark:text-[#F3F1EA]">
                  {title}
                </h3>
                <p className="text-sm text-[#5B6B67] dark:text-[#9CA9A5]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Choose your style */}
        <section className="px-6 pb-20 sm:pb-28">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-xs font-medium uppercase tracking-[0.35em] text-[#0F766E] dark:text-[#14B8A6]">
              Choose your style
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {TEMPLATE_THEMES.map(({ theme, name }) => (
                <Link key={theme} href={`/templates/${theme}`} className="block">
                  <TemplateCard theme={theme} name={name} />
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/templates"
                className="text-sm font-medium text-[#0F766E] hover:underline dark:text-[#14B8A6]"
              >
                See all templates &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 pb-20 sm:pb-28">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-xs font-medium uppercase tracking-[0.35em] text-[#0F766E] dark:text-[#14B8A6]">
              How it works
            </h2>
            <div className="grid grid-cols-1 divide-y divide-[#E2DFD3] border-t border-b border-[#E2DFD3] sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-[#2A3532] dark:border-[#2A3532]">
              {STEPS.map(({ number, title, body }) => (
                <div key={number} className="px-6 py-8 text-center sm:px-8">
                  <span
                    className="font-serif text-3xl text-[#A16207] dark:text-[#D4A017]"
                    style={{ fontWeight: 600 }}
                  >
                    {number}
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-[#14211D] dark:text-[#F3F1EA]">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm text-[#5B6B67] dark:text-[#9CA9A5]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 pb-20 sm:pb-28">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-10 text-center text-xs font-medium uppercase tracking-[0.35em] text-[#0F766E] dark:text-[#14B8A6]">
              Questions
            </h2>
            <div className="flex flex-col gap-4">
              {FAQS.map(({ question, answer }) => (
                <div
                  key={question}
                  className="border border-[#E2DFD3] p-6 dark:border-[#2A3532]"
                >
                  <h3 className="mb-1.5 text-sm font-semibold text-[#14211D] dark:text-[#F3F1EA]">
                    {question}
                  </h3>
                  <p className="text-sm text-[#5B6B67] dark:text-[#9CA9A5]">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-xl border border-[#0F766E]/25 px-8 py-12 text-center dark:border-[#14B8A6]/25">
            <h2
              className="font-serif text-2xl text-[#14211D] sm:text-3xl dark:text-[#F3F1EA]"
              style={{ fontWeight: 600 }}
            >
              Your invitation, live in minutes.
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-[#5B6B67] dark:text-[#9CA9A5]">
              Pick a theme, add your details, and share the link when you&apos;re ready.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-block rounded-full bg-[#0F766E] px-6 py-3 text-sm font-medium text-white hover:bg-[#0C5C56] dark:bg-[#14B8A6] dark:text-[#062420] dark:hover:bg-[#2DD4BF]"
            >
              Create your invitation
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
