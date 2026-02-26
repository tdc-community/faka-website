
import { MapPin, Star, ArrowRight } from "lucide-react"
import { useState } from "react"
import type { TrackData } from "@/lib/magazine-store"
import { ComingSoonModal } from "./coming-soon-modal"

interface TrackReviewsProps {
  tracks: TrackData[]
}

export function TrackReviews({ tracks }: TrackReviewsProps) {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <section id="tracks" className="scroll-mt-20 bg-background py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left - Image */}
          <div className="relative overflow-hidden rounded-sm">
            <div className="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[500px]">
              <img
                src="/images/track.jpg"
                alt="Aerial view of a race track"
                className="absolute h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent lg:hidden" />
          </div>

          {/* Right - Content */}
          <div className="flex flex-col justify-center">
            <div className="mb-3 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-sans text-sm font-semibold uppercase tracking-widest text-primary">
                Ревюта на Писти
              </span>
            </div>
            <h2 className="font-serif text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
              Разгледайте Пистите
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
              Открийте най-добрите писти, оценени от нашата общност. От нощни писти до планински проходи, намерете следващия си адреналин.
            </p>

            {/* Track List */}
            <div className="mt-8 space-y-4">
              {tracks.map((track) => (
                <button
                  key={track.name}
                  onClick={() => setModalOpen(true)}
                  className="w-full text-left group flex items-center gap-4 rounded-sm border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-secondary"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-sm bg-primary/10 font-serif text-lg font-bold text-primary">
                    {track.laps}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold uppercase text-foreground">
                        {track.name}
                      </h3>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {track.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                        {track.rating}
                      </span>
                      <span className="rounded-sm bg-secondary px-2 py-0.5 text-xs font-medium uppercase tracking-wider">
                        {track.difficulty}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ComingSoonModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Обновление за Ревюта на Писти"
        description="Подробните страници с ревюта на писти и интерактивни карти в момента се разработват. Те ще бъдат налични във Фаза 4!"
      />
    </section>
  )
}
