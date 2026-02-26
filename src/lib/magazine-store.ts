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
  votes: number
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
  headline: "Където Производителността Среща Общността",
  subheadline:
    "Вашият седмичен източник за най-добрите проекти на общността, ревюта на писти и най-горещите коли. Състезавайте се за Кола на Седмицата и печелете награди.",
  heroImageUrl: "/images/hero-car.jpg",
  stats: [
    { value: "24", label: "Седмични Издания" },
    { value: "156", label: "Избрани Коли" },
    { value: "$10K", label: "Седмична Награда" },
    { value: "$1K", label: "Такса Участие" },
  ],
}

const defaultTicker: string[] = [
  "НОВО: Турбо китове налични този уикенд",
  "КОЛА НА СЕДМИЦАТА: Shadow RSX от IwanoW печели $10,000",
  "ДРАГ СЪСТЕЗАНИЕ: Събитие в неделя вечер - регистрирайте се сега",
  "ИЗДАНИЕ #24 е НА ЖИВО - вижте най-новите проекти",
  "РЕВЮ НА ПИСТА: Midnight Circuit оценена с 4.8 звезди",
  "ИНТЕРВЮ: Raw говори за своя проект с 1000 к.с.",
]

const defaultCarOfTheWeek: CarOfTheWeekData = {
  carName: "Shadow RSX",
  builderName: "IwanoW",
  imageUrl: "/images/car-of-week.jpg",
  prizePool: "$10,000",
  entryFee: "$1,000",
  timeLeft: "3d 14h",
  entries: 47,
  votes: 189,
}

const defaultFeaturedBuilds: FeaturedBuild[] = [
  {
    title: "Alpine Thunder GT",
    owner: "Raw",
    category: "Европейски",
    imageUrl: "/images/featured-1.jpg",
    votes: 234,
    edition: "#22",
  },
  {
    title: "Midnight Stallion",
    owner: "elempius",
    category: "Мъсъл",
    imageUrl: "/images/featured-2.jpg",
    votes: 189,
    edition: "#21",
  },
  {
    title: "Dust Devil Rally",
    owner: "Coble2537",
    category: "Рали",
    imageUrl: "/images/featured-3.jpg",
    votes: 312,
    edition: "#20",
  },
]

const defaultTracks: TrackData[] = [
  {
    name: "Midnight Circuit",
    location: "Център",
    rating: 4.8,
    difficulty: "Експерт",
    laps: 12,
  },
  {
    name: "Mountain Pass",
    location: "Планини",
    rating: 4.5,
    difficulty: "Средно",
    laps: 8,
  },
  {
    name: "Desert Storm Rally",
    location: "Околности",
    rating: 4.9,
    difficulty: "Напреднали",
    laps: 6,
  },
]

const defaultArticles: ArticleData[] = [
  {
    category: "Обновление",
    title: "Нови Части Налични Този Уикенд",
    excerpt:
      "Най-новата партида турбо китове и изпускателни системи е налична. Вижте какво ново има за вашия проект.",
    date: "22 Фев, 2026",
    readTime: "3 мин",
  },
  {
    category: "Събитие",
    title: "Драг Състезание на Общността - Неделя Вечер",
    excerpt:
      "Подгответе най-бързите си коли за седмичното драг събитие. Регистрацията отваря в петък в 20:00 ч.",
    date: "21 Фев, 2026",
    readTime: "2 мин",
  },
  {
    category: "Ръководство",
    title: "Ръководство за Смяна на Двигател: Всичко, Което Трябва да Знаете",
    excerpt:
      "Пълно ръководство за смяна на двигатели. От избора на правилния мотор до настройката за максимална мощност.",
    date: "20 Фев, 2026",
    readTime: "8 мин",
  },
  {
    category: "Интервю",
    title: "Прожектор: Raw Говори за Своя Проект с 1000 к.с.",
    excerpt:
      "Сядаме с Raw, за да поговорим за неговия безумен процес на изграждане и какво следва в гаража му.",
    date: "19 Фев, 2026",
    readTime: "5 мин",
  },
]

// ---- Helpers ----

export function generateId(): string {
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
