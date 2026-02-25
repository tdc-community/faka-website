
import { ChevronDown } from "lucide-react"
import type { HeroData } from "@/lib/magazine-store"

interface HeroProps {
  data: HeroData
  editionNumber: number
}

export function Hero({ data, editionNumber }: HeroProps) {
  return (
    <section className="relative flex min-h-screen items-end overflow-hidden">
      {/* Background Image */}
      <img
        src={data.heroImageUrl}
        alt="High performance sports car"
        className="absolute h-full w-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-32 lg:px-8 lg:pb-24">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-block h-px w-12 bg-primary" />
            <span className="font-sans text-sm font-semibold uppercase tracking-widest text-primary">
              Weekly Edition #{editionNumber}
            </span>
          </div>

          <h1 className="font-serif text-5xl font-bold uppercase leading-none tracking-tight text-foreground md:text-7xl lg:text-8xl">
            <span className="text-balance">
              {data.headline.includes("Performance") ? (
                <>
                  {data.headline.split("Performance")[0]}
                  <span className="text-gradient">Performance</span>
                  {data.headline.split("Performance")[1]}
                </>
              ) : (
                data.headline
              )}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            {data.subheadline}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#car-of-the-week"
              className="rounded-sm bg-primary px-8 py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Car of the Week
            </a>
            <a
              href="#live-contest"
              className="rounded-sm border border-border bg-secondary/50 px-8 py-4 text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-secondary"
            >
              Live Contest
            </a>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-4">
          {data.stats.map((stat) => (
            <div key={stat.label} className="bg-card px-6 py-5">
              <div className="font-serif text-2xl font-bold text-primary lg:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-muted-foreground" />
      </div>
    </section>
  )
}
