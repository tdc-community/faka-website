
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { MarqueeTicker } from "@/components/marquee-ticker"
import { CarOfTheWeek } from "@/components/car-of-the-week"
import { LiveContestGallery } from "@/components/LiveContestGallery"
import { TrackReviews } from "@/components/track-reviews"
import { NewsSection } from "@/components/news-section"
import { Footer } from "@/components/footer"
import { getPublishedEdition, getDefaultTemplate } from "@/lib/magazine-store"
import type { MagazineEdition } from "@/lib/magazine-store"

export default function HomePage() {
  const [edition, setEdition] = useState<MagazineEdition | null>(null)

  useEffect(() => {
    const published = getPublishedEdition()
    setEdition(published ?? getDefaultTemplate())
  }, [])

  if (!edition) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <main>
      <Navbar />
      <Hero data={edition.hero} editionNumber={edition.editionNumber} />
      <MarqueeTicker headlines={edition.ticker} />
      <CarOfTheWeek data={edition.carOfTheWeek} />
      <LiveContestGallery />
      <TrackReviews tracks={edition.tracks} />
      <NewsSection articles={edition.articles} />
      <Footer />
    </main>
  )
}
