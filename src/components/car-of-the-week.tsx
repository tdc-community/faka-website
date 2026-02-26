"use client"


import { Trophy, Timer, Users, DollarSign, Star } from "lucide-react"
import type { CarOfTheWeekData } from "@/lib/magazine-store"

interface CarOfTheWeekProps {
  data: CarOfTheWeekData
}

export function CarOfTheWeek({ data }: CarOfTheWeekProps) {
  return (
    <section id="car-of-the-week" className="scroll-mt-20 bg-background py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-sans text-sm font-semibold uppercase tracking-widest text-primary">
                Състезание
              </span>
            </div>
            <h2 className="font-serif text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Кола на Седмицата
            </h2>
          </div>
          <a
            href="/#live-contest"
            className="rounded-sm bg-primary px-6 py-3 text-center text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 md:self-end"
          >
            Участвай в Състезанието - {data.entryFee}
          </a>
        </div>

        {/* Current Winner */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Main Image */}
          <div className="relative overflow-hidden rounded-sm lg:col-span-3">
            <div className="aspect-[4/3] lg:aspect-auto lg:h-full">
              <img
                src={data.imageUrl}
                alt={`Car of the Week - ${data.carName}`}
                className="absolute h-full w-full object-cover"
              />
            </div>
            <div className="absolute left-4 top-4">
              <span className="rounded-sm bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                Текущ Победител
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-6">
              <h3 className="font-serif text-3xl font-bold uppercase text-foreground">
                {data.carName}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Построена от {data.builderName}
              </p>
            </div>
          </div>

          {/* Info Panel */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {/* Prize Card */}
            <div className="flex-1 rounded-sm border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2 text-primary">
                <DollarSign className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Награден Фонд
                </span>
              </div>
              <div className="font-serif text-5xl font-bold text-foreground">
                {data.prizePool}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Седмична награда за най-впечатляващия проект, избран от общността.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-sm border border-border bg-card p-5">
                <Timer className="mb-2 h-5 w-5 text-primary" />
                <div className="font-serif text-2xl font-bold text-foreground">
                  {data.timeLeft}
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Оставащо Време
                </div>
              </div>
              <div className="rounded-sm border border-border bg-card p-5">
                <Users className="mb-2 h-5 w-5 text-primary" />
                <div className="font-serif text-2xl font-bold text-foreground">
                  {data.entries}
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Участници
                </div>
              </div>
              <div className="rounded-sm border border-border bg-card p-5">
                <Star className="mb-2 h-5 w-5 text-primary" />
                <div className="font-serif text-2xl font-bold text-foreground">
                  {data.votes}
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Гласове
                </div>
              </div>
            </div>

            {/* Voting */}
            <a
              href="/#live-contest"
              className="block flex items-center justify-center text-center w-full rounded-sm border border-primary bg-primary/10 px-6 py-4 text-sm font-bold uppercase tracking-wide text-primary transition-colors hover:bg-primary/20"
            >
              Гласувай за Този Проект
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
