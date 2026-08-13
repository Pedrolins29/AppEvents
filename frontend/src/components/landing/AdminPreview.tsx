import { useTranslations } from "next-intl";
import { Reveal } from "@/components/Reveal";

interface AdminFeature {
  title: string;
  description: string;
}

export function AdminPreview() {
  const t = useTranslations("landing.adminPreview");
  const features = t.raw("features") as AdminFeature[];

  return (
    <section className="px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <Reveal className="mb-12 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--pinewood)]">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 font-display text-4xl font-light text-[var(--ink)] sm:text-5xl">
            {t("heading")}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
            {t("description")}
          </p>
        </Reveal>

        {/* Side-by-side: browser mockup + feature list */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Left: Browser chrome mockup with placeholder dashboard */}
          <Reveal>
            <div
              className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--porcelain)] shadow-[0_30px_60px_-30px_rgba(22,19,14,0.4)]"
              style={{ aspectRatio: "16 / 11" }}
            >
              {/* Browser chrome bar */}
              <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--muted)] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" aria-hidden />
                <div className="ml-3 h-5 flex-1 rounded-sm bg-[var(--porcelain)]" aria-hidden />
              </div>

              {/* Dashboard content: Guest list mockup */}
              <div className="p-4">
                {/* Dashboard header */}
                <div className="mb-4 border-b border-[var(--border)] pb-3">
                  <h3 className="text-sm font-semibold text-[var(--ink)]">Guests</h3>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">42 responses • 38 attending</p>
                </div>

                {/* Guest list table */}
                <div className="space-y-2">
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_80px_24px] gap-3 px-2 py-2 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                    <div>Name</div>
                    <div>Status</div>
                    <div aria-hidden />
                  </div>

                  {/* Sample guest rows */}
                  {[
                    { name: "Ana & Pedro", status: "Confirmed", confirmed: true },
                    { name: "Sofia Costa", status: "Confirmed", confirmed: true },
                    { name: "Marco Rossi", status: "Pending", confirmed: false },
                    { name: "Julie Bernard", status: "Confirmed", confirmed: true },
                    { name: "Lucas Mendes", status: "Confirmed", confirmed: true },
                  ].map((guest, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_80px_24px] gap-3 rounded px-2 py-2.5 text-xs hover:bg-[var(--muted)]"
                    >
                      <div className="font-medium text-[var(--ink)]">{guest.name}</div>
                      <div className="flex items-center">
                        <span
                          className={`inline-block rounded px-2 py-1 text-[10px] font-medium ${
                            guest.confirmed
                              ? "bg-[var(--champagne)] text-[var(--ink)]"
                              : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                          }`}
                        >
                          {guest.status}
                        </span>
                      </div>
                      <div aria-hidden className="flex items-center justify-center">
                        {guest.confirmed && (
                          <svg
                            className="h-4 w-4 text-[var(--gold)]"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M13.5 4L6 12L2.5 8.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer hint */}
                <div className="mt-4 border-t border-[var(--border)] pt-3">
                  <p className="text-[10px] text-[var(--muted-foreground)]">
                    → See all guests in your dashboard
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: Feature list */}
          <div className="flex flex-col gap-8">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.06}>
                <div className="flex gap-4">
                  <div
                    className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--gold)] text-xs font-semibold text-[var(--ink)]"
                    aria-hidden
                  >
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-[var(--ink)]">{feature.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted-foreground)]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
