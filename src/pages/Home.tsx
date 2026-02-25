
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { MarqueeTicker } from "@/components/marquee-ticker"
import { CarOfTheWeek } from "@/components/car-of-the-week"
import { LiveContestGallery } from "@/components/LiveContestGallery"
import { TrackReviews } from "@/components/track-reviews"
import { NewsSection } from "@/components/news-section"
import { Footer } from "@/components/footer"
import { api } from "@/lib/api"
import type { MagazineEdition } from "@/lib/magazine-store"

export default function HomePage() {
  const [edition, setEdition] = useState<MagazineEdition | null>(null)
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    async function init() {
      // Fetch dynamic settings from DB
      try {
        const dbSettings = await api.getSettings()
        if (!("error" in dbSettings)) {
          setSettings(dbSettings)
        }
      } catch (err) {
        console.error("Failed to fetch settings", err)
      }

      try {
        const published = await api.getPublishedEdition()
        if (!("error" in published) && published) {
          setEdition(published)
        } else {
          setEdition(null)
        }
      } catch (err) {
        console.error("Failed to fetch published edition:", err)
        setEdition(null)
      }
    }
    init()
  }, [])

  if (edition === null) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h1 className="font-serif text-4xl font-bold uppercase text-foreground">
            No Data Available
          </h1>
          <p className="mt-4 text-muted-foreground">
            Please publish a new magazine edition from the Admin Panel.
          </p>
        </div>
        <Footer />
      </main>
    )
  }

  // Merge dynamic settings into the edition data
  const finalEdition = { ...edition }
  if (settings) {
    if (finalEdition.hero) {
      finalEdition.hero.stats = finalEdition.hero.stats.map(s =>
        s.label === "Entry Fee" ? { ...s, value: `$${settings.entryFee.toLocaleString()}` } : s
      )
    }
    if (finalEdition.carOfTheWeek) {
      finalEdition.carOfTheWeek.entryFee = `$${settings.entryFee.toLocaleString()}`
    }
  }

  return (
    <main>
      <Navbar />
      <Hero data={finalEdition.hero} editionNumber={finalEdition.editionNumber} />
      <MarqueeTicker headlines={finalEdition.ticker} />
      <CarOfTheWeek data={finalEdition.carOfTheWeek} />
      <LiveContestGallery />
      {finalEdition.tracks && finalEdition.tracks.length > 0 && (
        <TrackReviews tracks={finalEdition.tracks} />
      )}
      {finalEdition.articles && finalEdition.articles.length > 0 && (
        <NewsSection articles={finalEdition.articles} />
      )}
      <Footer />
    </main>
  )
}
