// Types for the magazine edition data model

export interface HeroData {
  headline: string
  subheadline: string
  heroImageUrl: string
  stats: { value: string; label: string }[]
}

export interface CarOfTheWeekData {
  carName: string
  builderName: string
  imageUrl: string
  prizePool: string
  entryFee: string
  timeLeft: string
  entries: number
}

export interface FeaturedBuild {
  title: string
  owner: string
  category: string
  imageUrl: string
  votes: number
  edition: string
}

export interface TrackData {
  name: string
  location: string
  rating: number
  difficulty: string
  laps: number
}

export interface ArticleData {
  category: string
  title: string
  excerpt: string
  date: string
  readTime: string
}

export interface MagazineEdition {
  id: string
  editionNumber: number
  status: "draft" | "published"
  createdAt: string
  publishedAt?: string
  hero: HeroData
  ticker: string[]
  carOfTheWeek: CarOfTheWeekData
  featuredBuilds: FeaturedBuild[]
  tracks: TrackData[]
  articles: ArticleData[]
}

// ---- Default data (matches current hardcoded values) ----

const defaultHero: HeroData = {
  headline: "Where Performance Meets Community",
  subheadline:
    "Your weekly source for the best community builds, track reviews, and the hottest cars. Compete for Car of the Week and win prizes.",
  heroImageUrl: "/images/hero-car.jpg",
  stats: [
    { value: "24", label: "Weekly Editions" },
    { value: "156", label: "Featured Cars" },
    { value: "$10K", label: "Weekly Prize" },
    { value: "$1K", label: "Entry Fee" },
  ],
}

const defaultTicker: string[] = [
  "NEW: Turbo kit drop this weekend",
  "CAR OF THE WEEK: Shadow RSX by IwanoW wins $10,000",
  "DRAG RACE: Sunday Night event - register now",
  "EDITION #24 is LIVE - check out the latest builds",
  "TRACK REVIEW: Midnight Circuit rated 4.8 stars",
  "BUILDER SPOTLIGHT: Raw talks about his 1000HP build",
]

const defaultCarOfTheWeek: CarOfTheWeekData = {
  carName: "Shadow RSX",
  builderName: "IwanoW",
  imageUrl: "/images/car-of-week.jpg",
  prizePool: "$10,000",
  entryFee: "$1,000",
  timeLeft: "3d 14h",
  entries: 47,
}

const defaultFeaturedBuilds: FeaturedBuild[] = [
  {
    title: "Alpine Thunder GT",
    owner: "Raw",
    category: "European",
    imageUrl: "/images/featured-1.jpg",
    votes: 234,
    edition: "#22",
  },
  {
    title: "Midnight Stallion",
    owner: "elempius",
    category: "Muscle",
    imageUrl: "/images/featured-2.jpg",
    votes: 189,
    edition: "#21",
  },
  {
    title: "Dust Devil Rally",
    owner: "Coble2537",
    category: "Rally",
    imageUrl: "/images/featured-3.jpg",
    votes: 312,
    edition: "#20",
  },
]

const defaultTracks: TrackData[] = [
  {
    name: "Midnight Circuit",
    location: "Downtown",
    rating: 4.8,
    difficulty: "Expert",
    laps: 12,
  },
  {
    name: "Mountain Pass",
    location: "Highlands",
    rating: 4.5,
    difficulty: "Intermediate",
    laps: 8,
  },
  {
    name: "Desert Storm Rally",
    location: "Outskirts",
    rating: 4.9,
    difficulty: "Advanced",
    laps: 6,
  },
]

const defaultArticles: ArticleData[] = [
  {
    category: "Update",
    title: "New Performance Parts Drop This Weekend",
    excerpt:
      "The latest batch of turbo kits and exhaust systems are available. Check out what's new for your build.",
    date: "Feb 22, 2026",
    readTime: "3 min",
  },
  {
    category: "Event",
    title: "Community Drag Race - Sunday Night",
    excerpt:
      "Line up your fastest builds for the weekly drag event. Registration opens Friday at 8pm.",
    date: "Feb 21, 2026",
    readTime: "2 min",
  },
  {
    category: "Guide",
    title: "Engine Swap Guide: Everything You Need",
    excerpt:
      "A complete walkthrough on engine swaps. From choosing the right motor to tuning for max output.",
    date: "Feb 20, 2026",
    readTime: "8 min",
  },
  {
    category: "Interview",
    title: "Builder Spotlight: Raw on His 1000HP Build",
    excerpt:
      "We sit down with Raw to talk about his insane build process and what's next in his garage.",
    date: "Feb 19, 2026",
    readTime: "5 min",
  },
]

// ---- Helpers ----

const STORAGE_KEY = "faka_magazine_editions"

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function getDefaultTemplate(editionNumber?: number): MagazineEdition {
  return {
    id: generateId(),
    editionNumber: editionNumber ?? 25,
    status: "draft",
    createdAt: new Date().toISOString(),
    hero: { ...defaultHero, stats: defaultHero.stats.map((s) => ({ ...s })) },
    ticker: [...defaultTicker],
    carOfTheWeek: { ...defaultCarOfTheWeek },
    featuredBuilds: defaultFeaturedBuilds.map((b) => ({ ...b })),
    tracks: defaultTracks.map((t) => ({ ...t })),
    articles: defaultArticles.map((a) => ({ ...a })),
  }
}

export function getAllEditions(): MagazineEdition[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as MagazineEdition[]) : []
  } catch {
    return []
  }
}

export function saveEdition(edition: MagazineEdition): void {
  const all = getAllEditions()
  const idx = all.findIndex((e) => e.id === edition.id)
  if (idx >= 0) {
    all[idx] = edition
  } else {
    all.push(edition)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function publishEdition(id: string): void {
  const all = getAllEditions()
  for (const edition of all) {
    if (edition.id === id) {
      edition.status = "published"
      edition.publishedAt = new Date().toISOString()
    } else {
      edition.status = "draft"
      edition.publishedAt = undefined
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function deleteEdition(id: string): void {
  const all = getAllEditions().filter((e) => e.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function getPublishedEdition(): MagazineEdition | null {
  const all = getAllEditions()
  return all.find((e) => e.status === "published") ?? null
}
