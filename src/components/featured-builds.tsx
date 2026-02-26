"use client"

import { useState } from "react"

import { ArrowRight, Heart } from "lucide-react"
import type { FeaturedBuild } from "@/lib/magazine-store"

interface FeaturedBuildsProps {
  builds: FeaturedBuild[]
}

export function FeaturedBuilds({ builds }: FeaturedBuildsProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <section id="featured" className="scroll-mt-20 bg-secondary py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="mb-3 flex items-center gap-3">
            <span className="inline-block h-px w-12 bg-primary" />
            <span className="font-sans text-sm font-semibold uppercase tracking-widest text-primary">
              Прожектор на Общността
            </span>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="font-serif text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Избрани Проекти
            </h2>
            <a
              href="#"
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary transition-colors hover:text-primary/80"
            >
              Виж Всички Проекти
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {builds.map((build, idx) => (
            <article
              key={idx}
              className="group relative overflow-hidden rounded-sm border border-border bg-card transition-all hover:border-primary/50"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={build.imageUrl}
                  alt={build.title}
                  className={`absolute h-full w-full object-cover transition-transform duration-500 ${hoveredIdx === idx ? "scale-105" : "scale-100"
                    }`}
                />
                <div className="absolute left-3 top-3 flex gap-2">
                  <span className="rounded-sm bg-secondary/90 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-foreground backdrop-blur-sm">
                    {build.category}
                  </span>
                  <span className="rounded-sm bg-primary/90 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground backdrop-blur-sm">
                    Издание {build.edition}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-serif text-xl font-bold uppercase text-foreground">
                  {build.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Построена от{" "}
                  <span className="font-medium text-foreground">{build.owner}</span>
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <button className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                    <Heart className="h-4 w-4" />
                    <span>{build.votes} гласа</span>
                  </button>
                  <a
                    href="#"
                    className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-primary transition-colors hover:text-primary/80"
                  >
                    Виж
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
