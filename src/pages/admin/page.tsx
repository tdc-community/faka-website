
import { useState, useEffect, useCallback } from "react"
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Save,
  Send,
  Trash2,
  ArrowLeft,
  FileText,
  Eye,
  Clock,
  X,
} from "lucide-react"
import type {
  MagazineEdition,
  FeaturedBuild,
  TrackData,
  ArticleData,
} from "@/lib/magazine-store"
import {
  getAllEditions,
  getDefaultTemplate,
  saveEdition,
  publishEdition,
  deleteEdition,
} from "@/lib/magazine-store"

// ---- Collapsible Section ----

function Section({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string
  icon: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-sm border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-secondary/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
            {icon}
          </div>
          <span className="font-serif text-base font-bold uppercase tracking-wide text-foreground">
            {title}
          </span>
        </div>
        {open ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {open && <div className="border-t border-border px-5 py-5">{children}</div>}
    </div>
  )
}

// ---- Input helpers ----

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </label>
  )
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-sm border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-none rounded-sm border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-sm border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}

// ---- Confirm Dialog ----

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-sm border border-border bg-card p-6">
        <h3 className="font-serif text-lg font-bold uppercase text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-sm border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-sm bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Main Admin Page ----

export default function AdminPage() {
  const [editions, setEditions] = useState<MagazineEdition[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [edition, setEdition] = useState<MagazineEdition | null>(null)
  const [saved, setSaved] = useState(false)
  const [confirmPublish, setConfirmPublish] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const refreshEditions = useCallback(() => {
    const all = getAllEditions()
    setEditions(all)
    return all
  }, [])

  useEffect(() => {
    refreshEditions()
  }, [refreshEditions])

  function selectEdition(id: string) {
    const all = refreshEditions()
    const found = all.find((e) => e.id === id)
    if (found) {
      setEdition(structuredClone(found))
      setActiveId(id)
      setSaved(false)
    }
  }

  function createNewEdition() {
    const maxNum = editions.reduce((m, e) => Math.max(m, e.editionNumber), 0)
    const template = getDefaultTemplate(maxNum + 1)
    saveEdition(template)
    const all = refreshEditions()
    const found = all.find((e) => e.id === template.id)
    if (found) {
      setEdition(structuredClone(found))
      setActiveId(found.id)
      setSaved(false)
    }
  }

  function handleSave() {
    if (!edition) return
    saveEdition(edition)
    refreshEditions()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handlePublish() {
    if (!edition) return
    saveEdition(edition)
    publishEdition(edition.id)
    const all = refreshEditions()
    const found = all.find((e) => e.id === edition.id)
    if (found) {
      setEdition(structuredClone(found))
    }
    setConfirmPublish(false)
  }

  function handleDelete() {
    if (!edition) return
    deleteEdition(edition.id)
    refreshEditions()
    setEdition(null)
    setActiveId(null)
    setConfirmDelete(false)
  }

  // Update helpers for nested state
  function updateEdition(partial: Partial<MagazineEdition>) {
    if (!edition) return
    setEdition({ ...edition, ...partial })
    setSaved(false)
  }

  function updateHero(key: string, value: string) {
    if (!edition) return
    setEdition({
      ...edition,
      hero: { ...edition.hero, [key]: value },
    })
    setSaved(false)
  }

  function updateHeroStat(idx: number, key: "value" | "label", val: string) {
    if (!edition) return
    const stats = [...edition.hero.stats]
    stats[idx] = { ...stats[idx], [key]: val }
    setEdition({
      ...edition,
      hero: { ...edition.hero, stats },
    })
    setSaved(false)
  }

  function updateTicker(idx: number, val: string) {
    if (!edition) return
    const ticker = [...edition.ticker]
    ticker[idx] = val
    setEdition({ ...edition, ticker })
    setSaved(false)
  }

  function addTicker() {
    if (!edition) return
    setEdition({ ...edition, ticker: [...edition.ticker, ""] })
    setSaved(false)
  }

  function removeTicker(idx: number) {
    if (!edition) return
    setEdition({ ...edition, ticker: edition.ticker.filter((_, i) => i !== idx) })
    setSaved(false)
  }

  function updateCOTW(key: string, value: string | number) {
    if (!edition) return
    setEdition({
      ...edition,
      carOfTheWeek: { ...edition.carOfTheWeek, [key]: value },
    })
    setSaved(false)
  }

  function updateBuild(idx: number, key: keyof FeaturedBuild, value: string | number) {
    if (!edition) return
    const builds = [...edition.featuredBuilds]
    builds[idx] = { ...builds[idx], [key]: value }
    setEdition({ ...edition, featuredBuilds: builds })
    setSaved(false)
  }

  function addBuild() {
    if (!edition) return
    setEdition({
      ...edition,
      featuredBuilds: [
        ...edition.featuredBuilds,
        { title: "", owner: "", category: "", imageUrl: "", votes: 0, edition: "" },
      ],
    })
    setSaved(false)
  }

  function removeBuild(idx: number) {
    if (!edition) return
    setEdition({
      ...edition,
      featuredBuilds: edition.featuredBuilds.filter((_, i) => i !== idx),
    })
    setSaved(false)
  }

  function updateTrack(idx: number, key: keyof TrackData, value: string | number) {
    if (!edition) return
    const tracks = [...edition.tracks]
    tracks[idx] = { ...tracks[idx], [key]: value }
    setEdition({ ...edition, tracks })
    setSaved(false)
  }

  function addTrack() {
    if (!edition) return
    setEdition({
      ...edition,
      tracks: [
        ...edition.tracks,
        { name: "", location: "", rating: 0, difficulty: "", laps: 0 },
      ],
    })
    setSaved(false)
  }

  function removeTrack(idx: number) {
    if (!edition) return
    setEdition({ ...edition, tracks: edition.tracks.filter((_, i) => i !== idx) })
    setSaved(false)
  }

  function updateArticle(idx: number, key: keyof ArticleData, value: string) {
    if (!edition) return
    const articles = [...edition.articles]
    articles[idx] = { ...articles[idx], [key]: value }
    setEdition({ ...edition, articles })
    setSaved(false)
  }

  function addArticle() {
    if (!edition) return
    setEdition({
      ...edition,
      articles: [
        ...edition.articles,
        { category: "", title: "", excerpt: "", date: "", readTime: "" },
      ],
    })
    setSaved(false)
  }

  function removeArticle(idx: number) {
    if (!edition) return
    setEdition({
      ...edition,
      articles: edition.articles.filter((_, i) => i !== idx),
    })
    setSaved(false)
  }

  // ---- No edition selected: show edition list ----
  if (!edition) {
    const publishedEdition = editions.find((e) => e.status === "published")

    return (
      <div className="min-h-screen bg-background">
        {/* Top bar */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="h-7 w-1.5 rounded-sm bg-primary" />
                <div className="h-5 w-1.5 rounded-sm bg-primary/60" />
              </div>
              <span className="font-serif text-lg font-bold uppercase tracking-wider text-foreground">
                Faka<span className="text-primary">Performance</span>
                <span className="ml-2 text-xs font-normal normal-case tracking-normal text-muted-foreground">
                  Admin
                </span>
              </span>
            </div>
            <a
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <Eye className="h-4 w-4" />
              View Site
            </a>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
            <div className="rounded-sm border border-border bg-card p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Editions
              </div>
              <div className="mt-1 font-serif text-3xl font-bold text-foreground">
                {editions.length}
              </div>
            </div>
            <div className="rounded-sm border border-border bg-card p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Currently Live
              </div>
              <div className="mt-1 font-serif text-3xl font-bold text-primary">
                {publishedEdition ? `#${publishedEdition.editionNumber}` : "None"}
              </div>
            </div>
            <div className="col-span-2 rounded-sm border border-border bg-card p-5 lg:col-span-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Draft Editions
              </div>
              <div className="mt-1 font-serif text-3xl font-bold text-foreground">
                {editions.filter((e) => e.status === "draft").length}
              </div>
            </div>
          </div>

          {/* New Edition */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-foreground">
              All Editions
            </h2>
            <button
              onClick={createNewEdition}
              className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Edition
            </button>
          </div>

          {/* Edition List */}
          {editions.length === 0 ? (
            <div className="rounded-sm border border-dashed border-border bg-card p-12 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-serif text-lg font-bold uppercase text-foreground">
                No editions yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first weekly magazine edition.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[...editions]
                .sort((a, b) => b.editionNumber - a.editionNumber)
                .map((ed) => (
                  <button
                    key={ed.id}
                    onClick={() => selectEdition(ed.id)}
                    className="flex items-center gap-4 rounded-sm border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-secondary/50"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-sm bg-primary/10 font-serif text-lg font-bold text-primary">
                      #{ed.editionNumber}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold uppercase text-foreground">
                          Edition #{ed.editionNumber}
                        </span>
                        {ed.status === "published" ? (
                          <span className="rounded-sm bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                            Live
                          </span>
                        ) : (
                          <span className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Draft
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created{" "}
                          {new Date(ed.createdAt).toLocaleDateString()}
                        </span>
                        {ed.publishedAt && (
                          <span>
                            Published{" "}
                            {new Date(ed.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---- Edition editor ----
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setEdition(null)
                setActiveId(null)
                refreshEditions()
              }}
              className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold uppercase text-foreground">
                Edition #{edition.editionNumber}
              </span>
              {edition.status === "published" ? (
                <span className="rounded-sm bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  Live
                </span>
              ) : (
                <span className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Draft
                </span>
              )}
            </div>
          </div>
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <Eye className="h-4 w-4" />
            Preview
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8">
        {/* Edition Number */}
        <div className="mb-6">
          <TextInput
            label="Edition Number"
            value={String(edition.editionNumber)}
            onChange={(v) => updateEdition({ editionNumber: Number(v) || 0 })}
            type="number"
          />
        </div>

        <div className="flex flex-col gap-4">
          {/* === HERO === */}
          <Section title="Hero Section" icon={<FileText className="h-4 w-4" />} defaultOpen>
            <div className="flex flex-col gap-4">
              <TextInput
                label="Headline"
                value={edition.hero.headline}
                onChange={(v) => updateHero("headline", v)}
                placeholder="Where Performance Meets Community"
              />
              <TextArea
                label="Subheadline"
                value={edition.hero.subheadline}
                onChange={(v) => updateHero("subheadline", v)}
                rows={2}
              />
              <TextInput
                label="Hero Image URL"
                value={edition.hero.heroImageUrl}
                onChange={(v) => updateHero("heroImageUrl", v)}
                placeholder="/images/hero-car.jpg"
              />
              <div>
                <FieldLabel>Stats (4 items)</FieldLabel>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {edition.hero.stats.map((stat, i) => (
                    <div key={i} className="flex flex-col gap-2 rounded-sm border border-border bg-secondary/50 p-3">
                      <input
                        value={stat.value}
                        onChange={(e) => updateHeroStat(i, "value", e.target.value)}
                        placeholder="Value"
                        className="w-full rounded-sm border border-border bg-secondary px-2 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                      <input
                        value={stat.label}
                        onChange={(e) => updateHeroStat(i, "label", e.target.value)}
                        placeholder="Label"
                        className="w-full rounded-sm border border-border bg-secondary px-2 py-1.5 text-xs text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* === TICKER === */}
          <Section title="Marquee Ticker" icon={<span className="text-xs font-bold">///</span>}>
            <div className="flex flex-col gap-3">
              {edition.ticker.map((headline, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={headline}
                    onChange={(e) => updateTicker(i, e.target.value)}
                    placeholder="Ticker headline..."
                    className="flex-1 rounded-sm border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={() => removeTicker(i)}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addTicker}
                className="flex items-center gap-2 self-start rounded-sm border border-dashed border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                Add Headline
              </button>
            </div>
          </Section>

          {/* === CAR OF THE WEEK === */}
          <Section title="Car of the Week" icon={<span className="text-xs font-bold">CW</span>}>
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Car Name"
                value={edition.carOfTheWeek.carName}
                onChange={(v) => updateCOTW("carName", v)}
              />
              <TextInput
                label="Builder Name"
                value={edition.carOfTheWeek.builderName}
                onChange={(v) => updateCOTW("builderName", v)}
              />
              <TextInput
                label="Image URL"
                value={edition.carOfTheWeek.imageUrl}
                onChange={(v) => updateCOTW("imageUrl", v)}
              />
              <TextInput
                label="Prize Pool"
                value={edition.carOfTheWeek.prizePool}
                onChange={(v) => updateCOTW("prizePool", v)}
              />
              <TextInput
                label="Entry Fee"
                value={edition.carOfTheWeek.entryFee}
                onChange={(v) => updateCOTW("entryFee", v)}
              />
              <TextInput
                label="Time Left"
                value={edition.carOfTheWeek.timeLeft}
                onChange={(v) => updateCOTW("timeLeft", v)}
              />
              <NumberInput
                label="Entries"
                value={edition.carOfTheWeek.entries}
                onChange={(v) => updateCOTW("entries", v)}
                min={0}
              />
            </div>
          </Section>

          {/* === FEATURED BUILDS === */}
          <Section title="Featured Builds" icon={<span className="text-xs font-bold">FB</span>}>
            <div className="flex flex-col gap-4">
              {edition.featuredBuilds.map((build, i) => (
                <div
                  key={i}
                  className="rounded-sm border border-border bg-secondary/30 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-serif text-sm font-bold uppercase text-foreground">
                      Build {i + 1}
                    </span>
                    <button
                      onClick={() => removeBuild(i)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <TextInput
                      label="Title"
                      value={build.title}
                      onChange={(v) => updateBuild(i, "title", v)}
                    />
                    <TextInput
                      label="Owner"
                      value={build.owner}
                      onChange={(v) => updateBuild(i, "owner", v)}
                    />
                    <TextInput
                      label="Category"
                      value={build.category}
                      onChange={(v) => updateBuild(i, "category", v)}
                    />
                    <TextInput
                      label="Image URL"
                      value={build.imageUrl}
                      onChange={(v) => updateBuild(i, "imageUrl", v)}
                    />
                    <NumberInput
                      label="Votes"
                      value={build.votes}
                      onChange={(v) => updateBuild(i, "votes", v)}
                      min={0}
                    />
                    <TextInput
                      label="Edition Tag"
                      value={build.edition}
                      onChange={(v) => updateBuild(i, "edition", v)}
                      placeholder="#22"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addBuild}
                className="flex items-center gap-2 self-start rounded-sm border border-dashed border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                Add Build
              </button>
            </div>
          </Section>

          {/* === TRACK REVIEWS === */}
          <Section title="Track Reviews" icon={<span className="text-xs font-bold">TR</span>}>
            <div className="flex flex-col gap-4">
              {edition.tracks.map((track, i) => (
                <div
                  key={i}
                  className="rounded-sm border border-border bg-secondary/30 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-serif text-sm font-bold uppercase text-foreground">
                      Track {i + 1}
                    </span>
                    <button
                      onClick={() => removeTrack(i)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <TextInput
                      label="Name"
                      value={track.name}
                      onChange={(v) => updateTrack(i, "name", v)}
                    />
                    <TextInput
                      label="Location"
                      value={track.location}
                      onChange={(v) => updateTrack(i, "location", v)}
                    />
                    <NumberInput
                      label="Rating"
                      value={track.rating}
                      onChange={(v) => updateTrack(i, "rating", v)}
                      min={0}
                      max={5}
                      step={0.1}
                    />
                    <TextInput
                      label="Difficulty"
                      value={track.difficulty}
                      onChange={(v) => updateTrack(i, "difficulty", v)}
                    />
                    <NumberInput
                      label="Laps"
                      value={track.laps}
                      onChange={(v) => updateTrack(i, "laps", v)}
                      min={1}
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addTrack}
                className="flex items-center gap-2 self-start rounded-sm border border-dashed border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                Add Track
              </button>
            </div>
          </Section>

          {/* === NEWS & ARTICLES === */}
          <Section title="News & Articles" icon={<span className="text-xs font-bold">NA</span>}>
            <div className="flex flex-col gap-4">
              {edition.articles.map((article, i) => (
                <div
                  key={i}
                  className="rounded-sm border border-border bg-secondary/30 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-serif text-sm font-bold uppercase text-foreground">
                      Article {i + 1}
                    </span>
                    <button
                      onClick={() => removeArticle(i)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <TextInput
                      label="Category"
                      value={article.category}
                      onChange={(v) => updateArticle(i, "category", v)}
                      placeholder="Update, Event, Guide, Interview..."
                    />
                    <TextInput
                      label="Title"
                      value={article.title}
                      onChange={(v) => updateArticle(i, "title", v)}
                    />
                    <div className="md:col-span-2">
                      <TextArea
                        label="Excerpt"
                        value={article.excerpt}
                        onChange={(v) => updateArticle(i, "excerpt", v)}
                        rows={2}
                      />
                    </div>
                    <TextInput
                      label="Date"
                      value={article.date}
                      onChange={(v) => updateArticle(i, "date", v)}
                      placeholder="Feb 22, 2026"
                    />
                    <TextInput
                      label="Read Time"
                      value={article.readTime}
                      onChange={(v) => updateArticle(i, "readTime", v)}
                      placeholder="3 min"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addArticle}
                className="flex items-center gap-2 self-start rounded-sm border border-dashed border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                Add Article
              </button>
            </div>
          </Section>
        </div>
      </div>

      {/* ---- Sticky Action Bar ---- */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 lg:px-8">
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-sm border border-border bg-secondary px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-secondary/80"
            >
              <Save className="h-4 w-4" />
              {saved ? "Saved!" : "Save Draft"}
            </button>
            <button
              onClick={() => setConfirmPublish(true)}
              className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Dialogs */}
      {confirmPublish && (
        <ConfirmDialog
          title="Publish Edition"
          message={`This will make Edition #${edition.editionNumber} the live homepage content. Any previously published edition will be unpublished.`}
          confirmLabel="Publish Now"
          onConfirm={handlePublish}
          onCancel={() => setConfirmPublish(false)}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Edition"
          message={`Are you sure you want to permanently delete Edition #${edition.editionNumber}? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}
