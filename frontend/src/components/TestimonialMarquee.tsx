import { Reveal } from "@/components/Reveal";

export interface Testimonial {
  name: string;
  location: string;
  quote: string;
  rating: number;
}

interface TestimonialMarqueeProps {
  eyebrow: string;
  heading: string;
  testimonials: Testimonial[];
}

// A thin antique-gold foil rule — the recurring editorial divider under section headings,
// duplicated here rather than imported since it's a local one-liner already redefined the same
// way in HomeLanding.tsx and SalesLanding.tsx (this repo's existing convention for this element).
function FoilRule({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block h-px w-14 bg-[var(--gold)] ${className}`} />;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden fill={filled ? "var(--gold)" : "none"}>
      <path
        d="M7 1L8.7 5.1L13 5.6L9.8 8.5L10.7 12.8L7 10.6L3.3 12.8L4.2 8.5L1 5.6L5.3 5.1L7 1Z"
        stroke="var(--gold)"
        strokeWidth={filled ? "0" : "1"}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex h-full w-72 shrink-0 flex-col gap-3 rounded-sm border border-[var(--border)] bg-white/70 p-6 shadow-[0_14px_36px_-26px_rgba(22,19,14,0.4)] transition-shadow duration-300 ease-[var(--ease-premium)] motion-reduce:transition-none hover:shadow-[0_22px_44px_-20px_rgba(22,19,14,0.4)]">
      <div className="flex gap-0.5" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} filled={i < testimonial.rating} />
        ))}
      </div>
      <p className="text-sm italic leading-relaxed text-[var(--ink)]">&ldquo;{testimonial.quote}&rdquo;</p>
      <div className="mt-auto pt-2">
        <p className="text-sm font-semibold text-[var(--ink)]">{testimonial.name}</p>
        <p className="text-xs text-[var(--muted-foreground)]">{testimonial.location}</p>
      </div>
    </div>
  );
}

// PLACEHOLDER: `testimonials` (sourced from the `landing.socialProof.testimonials` i18n key by
// the caller) is mock/example content, not real customer quotes — replace with genuine
// testimonials before launch. SalesLanding.tsx already documents a deliberate "no fabricated
// ratings, counters, or testimonials" principle; this section is the one intentional, clearly
// disclosed exception, scoped to HomeLanding.tsx only.
export function TestimonialMarquee({ eyebrow, heading, testimonials }: TestimonialMarqueeProps) {
  // Duplicated once so the CSS loop can translate exactly one copy-width (-50%) and wrap
  // seamlessly — see `.testimonial-marquee-track` in globals.css.
  const track = [...testimonials, ...testimonials];

  return (
    <section className="overflow-hidden bg-[var(--muted)] px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <Reveal className="mb-12 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--pinewood)]">{eyebrow}</p>
          <h2 className="mt-4 font-display text-4xl font-light text-[var(--ink)] sm:text-5xl">{heading}</h2>
          <FoilRule className="mx-auto mt-5" />
        </Reveal>
      </div>
      <div className="overflow-hidden">
        <div className="testimonial-marquee-track flex w-max gap-5">
          {track.map((testimonial, i) => (
            <TestimonialCard key={`${testimonial.name}-${i}`} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
