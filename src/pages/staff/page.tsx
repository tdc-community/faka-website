
import React, { useState, useEffect, useCallback } from "react"
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  X,
  FileText,
  Clock,
  Loader2,
  Star,
  List,
  Trophy,
  Car,
  Map as MapIcon,
} from "lucide-react"
import { api } from "@/lib/api"

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
            Отказ
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
  const [editions, setEditions] = useState<any[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [edition, setEdition] = useState<any | null>(null)
  const [saved, setSaved] = useState(false)
  const [confirmPublish, setConfirmPublish] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Global Settings state
  const [settings, setSettings] = useState<any | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)

  const refreshEditions = useCallback(async () => {
    const data = await api.getEditions()
    if (!("error" in data)) {
      setEditions(data)
      return data
    }
    return []
  }, [])

  useEffect(() => {
    refreshEditions()

    // Fetch global settings
    api.getSettings().then((data) => {
      if (!("error" in data)) setSettings(data)
    }).catch(console.error)
  }, [refreshEditions])

  async function selectEdition(id: string) {
    const all = await refreshEditions()
    const found = all.find((e: any) => e.id === id)
    if (found) {
      setEdition(structuredClone(found))
      setActiveId(id)
      setSaved(false)
    }
  }

  async function createNewEdition() {
    const maxNum = editions.reduce((m, e) => Math.max(m, e.editionNumber), 0)
    // Using a default empty structure for now since getDefaultTemplate isn't exported directly from api
    const template: any = {
      id: crypto.randomUUID(),
      editionNumber: maxNum + 1,
      status: "draft" as const,
      publishedAt: undefined,
      createdAt: new Date().toISOString(),
      hero: { headline: "", subheadline: "", heroImageUrl: "", stats: [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }] },
      ticker: ["News 1", "News 2"],
      carOfTheWeek: {
        carName: "", builderName: "", imageUrl: "", prizePool: "$0", entryFee: "$0", timeLeft: "7 Days", votes: 0, entries: 0,
        visionText: "", specs: { topSpeed: "", acceleration: "", handling: "", braking: "" }
      },
      featuredBuilds: [],
      tracks: [],
      articles: [],
      merch: [],
      staffPicks: [],
      upcomingEvents: []
    }
    await api.saveEdition(template)
    const all = await refreshEditions()
    const found = all.find((e: any) => e.id === template.id)
    if (found) {
      setEdition(structuredClone(found))
      setActiveId(found.id)
      setSaved(false)
    }
  }

  async function handleSave() {
    if (!edition) return
    await api.saveEdition(edition)
    await refreshEditions()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handlePublish() {
    if (!edition) return
    await api.saveEdition(edition)
    await api.publishEdition(edition.id)
    const all = await refreshEditions()
    const found = all.find((e: any) => e.id === edition.id)
    if (found) {
      setEdition(structuredClone(found))
    }
    setConfirmPublish(false)
  }

  async function handleDelete() {
    if (!edition) return
    await api.deleteEdition(edition.id)
    await refreshEditions()
    setEdition(null)
    setActiveId(null)
    setConfirmDelete(false)
  }

  // Update helpers for nested state
  function updateEdition(partial: any) {
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
    setEdition({ ...edition, ticker: edition.ticker.filter((_: any, i: number) => i !== idx) })
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

  function updateBuild(idx: number, key: string, value: string | number) {
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
      featuredBuilds: edition.featuredBuilds.filter((_: any, i: number) => i !== idx),
    })
    setSaved(false)
  }

  function updateTrack(idx: number, key: string, value: string | number) {
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
    setEdition({ ...edition, tracks: edition.tracks.filter((_: any, i: number) => i !== idx) })
    setSaved(false)
  }

  function updateArticle(idx: number, key: string, value: string) {
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
      articles: edition.articles.filter((_: any, i: number) => i !== idx),
    })
    setSaved(false)
  }

  // ---- Settings Handlers ----
  function updateSetting(key: string, value: any) {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
    setSettingsSaved(false)
  }

  async function handleSaveSettings() {
    if (!settings) return
    setSettingsLoading(true)
    try {
      await api.updateSettings(settings)
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 2000)
    } catch {
      alert("Failed to save settings")
    } finally {
      setSettingsLoading(false)
    }
  }
  // ---- No edition selected: show edition list ----
  if (!edition) {
    const publishedEdition = editions.find((e) => e.status === "published")

    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Top bar */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="h-7 w-1.5 rounded-sm bg-primary" />
                <div className="h-5 w-1.5 rounded-sm bg-primary/60" />
              </div>
              <span className="font-serif text-lg font-bold uppercase tracking-wider text-foreground">
                Faka<span className="text-primary">Performance</span>
                <span className="ml-2 text-xs font-normal normal-case tracking-normal text-muted-foreground">
                  Екип
                </span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="/"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <Eye className="h-4 w-4" />
                Виж Сайта
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
            <div className="rounded-sm border border-border bg-card p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Общо Издания
              </div>
              <div className="mt-1 font-serif text-3xl font-bold text-foreground">
                {editions.length}
              </div>
            </div>
            <div className="rounded-sm border border-border bg-card p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Активно в Момента
              </div>
              <div className="mt-1 font-serif text-3xl font-bold text-primary">
                {publishedEdition ? `#${publishedEdition.editionNumber}` : "Няма"}
              </div>
            </div>
            <div className="col-span-2 rounded-sm border border-border bg-card p-5 lg:col-span-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Чернови Издания
              </div>
              <div className="mt-1 font-serif text-3xl font-bold text-foreground">
                {editions.filter((e) => e.status === "draft").length}
              </div>
            </div>
          </div>

          {/* New Edition */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-12">
            <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-foreground">
              Всички Издания
            </h2>
            <button
              onClick={createNewEdition}
              className="flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 min-w-[140px]"
            >
              <Plus className="h-4 w-4" />
              Ново Издание
            </button>
          </div>

          {/* Edition List */}
          {editions.length === 0 ? (
            <div className="rounded-sm border border-dashed border-border bg-card p-12 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-serif text-lg font-bold uppercase text-foreground">
                Все още няма издания
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Създайте първото си седмично списание.
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
                          Издание #{ed.editionNumber}
                        </span>
                        {ed.status === "published" ? (
                          <span className="rounded-sm bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                            На Живо
                          </span>
                        ) : (
                          <span className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Чернова
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Създадено{" "}
                          {new Date(ed.createdAt).toLocaleDateString()}
                        </span>
                        {ed.publishedAt && (
                          <span>
                            Публикувано{" "}
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

  // ---- Edition selected: show editor ----
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setEdition(null)}
              className="rounded-sm bg-secondary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
            >
              Назад
            </button>
            <h1 className="font-serif text-xl font-bold uppercase text-foreground">
              Издание #{edition.editionNumber}
              {edition.status === "published" ? (
                <span className="ml-3 rounded-sm bg-primary/10 px-2 py-0.5 text-xs text-primary">На Живо</span>
              ) : (
                <span className="ml-3 rounded-sm bg-secondary px-2 py-0.5 text-xs text-muted-foreground">Чернова</span>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {edition.id !== "new" && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-sm bg-destructive/10 px-4 py-2 text-sm font-bold uppercase tracking-wide text-destructive transition-colors hover:bg-destructive/20"
              >
                <Trash2 className="h-4 w-4" />
                Изтрий
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Запази
            </button>
            {edition.status === "draft" && edition.id !== "new" && (
              <button
                onClick={handlePublish}
                className="flex items-center gap-2 rounded-sm bg-accent px-5 py-2 text-sm font-bold uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent/90"
              >
                Публикувай
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8 space-y-6">

        {/* Edition Number */}
        <div className="rounded-sm border border-border bg-card p-5">
          <NumberInput
            label="Номер на Изданието"
            value={edition.editionNumber}
            onChange={(v) => { setEdition({ ...edition, editionNumber: v }); setSaved(false); }}
            min={1}
          />
        </div>

        {/* Hero Section */}
        <Section title="Главна Секция (Hero)" icon={<Star className="h-4 w-4" />} defaultOpen>
          <div className="space-y-4">
            <TextInput label="Заглавие" value={edition.hero?.headline || edition.hero?.title || ""} onChange={(v) => updateHero("headline", v)} />
            <TextInput label="Подзаглавие" value={edition.hero?.subheadline || edition.hero?.subtitle || ""} onChange={(v) => updateHero("subheadline", v)} />
            <TextInput label="URL на Изображение" value={edition.hero?.heroImageUrl || edition.hero?.imageUrl || ""} onChange={(v) => updateHero("heroImageUrl", v)} />

            <div className="mt-4 border-t border-border pt-4">
              <FieldLabel>Статистики (Stats)</FieldLabel>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {(edition.hero?.stats || []).map((stat: any, i: number) => (
                  <div key={i} className="flex flex-col gap-2 rounded-sm bg-secondary/50 p-3">
                    <TextInput label={`Стойност ${i + 1}`} value={stat.value || ""} onChange={(v) => updateHeroStat(i, "value", v)} />
                    <TextInput label={`Етикет ${i + 1}`} value={stat.label || ""} onChange={(v) => updateHeroStat(i, "label", v)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Ticker */}
        <Section title="Бягащ Текст (Ticker)" icon={<List className="h-4 w-4" />}>
          <div className="space-y-3">
            {(edition.ticker || []).map((item: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1">
                  <TextInput label={`Текст ${i + 1}`} value={item || ""} onChange={(v) => updateTicker(i, v)} />
                </div>
                <button onClick={() => removeTicker(i)} className="mt-6 p-2 text-muted-foreground hover:text-destructive">
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button onClick={addTicker} className="mt-2 text-sm text-primary hover:underline font-bold uppercase">+ Добави Текст</button>
          </div>
        </Section>

        {/* Car of the Week */}
        <Section title="Кола на Седмицата" icon={<Trophy className="h-4 w-4" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label="Име на Колата" value={edition.carOfTheWeek?.carName || ""} onChange={(v) => updateCOTW("carName", v)} />
            <TextInput label="Име на Билдъра" value={edition.carOfTheWeek?.builderName || ""} onChange={(v) => updateCOTW("builderName", v)} />
            <div className="md:col-span-2">
              <TextInput label="URL на Изображение" value={edition.carOfTheWeek?.imageUrl || ""} onChange={(v) => updateCOTW("imageUrl", v)} />
            </div>
            <NumberInput label="Брой Участници" value={edition.carOfTheWeek?.entries || 0} onChange={(v) => updateCOTW("entries", v)} />
            <NumberInput label="Брой Гласове" value={edition.carOfTheWeek?.votes || 0} onChange={(v) => updateCOTW("votes", v)} />
            <div className="md:col-span-2">
              <TextArea label="Визия / Описание на Билда" value={edition.carOfTheWeek?.visionText || ""} onChange={(v) => updateCOTW("visionText", v)} />
            </div>
            <TextInput label="Топ Скорост" value={edition.carOfTheWeek?.specs?.topSpeed || ""} onChange={(v) => updateCOTW("specs", { ...(edition.carOfTheWeek?.specs || {}), topSpeed: v })} />
            <TextInput label="Ускорение (0-100)" value={edition.carOfTheWeek?.specs?.acceleration || ""} onChange={(v) => updateCOTW("specs", { ...(edition.carOfTheWeek?.specs || {}), acceleration: v })} />
            <TextInput label="Управление (Handling)" value={edition.carOfTheWeek?.specs?.handling || ""} onChange={(v) => updateCOTW("specs", { ...(edition.carOfTheWeek?.specs || {}), handling: v })} />
            <TextInput label="Спиране (Braking)" value={edition.carOfTheWeek?.specs?.braking || ""} onChange={(v) => updateCOTW("specs", { ...(edition.carOfTheWeek?.specs || {}), braking: v })} />
          </div>
        </Section>

        {/* Featured Builds */}
        <Section title="Представени Билдове" icon={<Car className="h-4 w-4" />}>
          <div className="space-y-6">
            {(edition.featuredBuilds || []).map((build: any, i: number) => (
              <div key={i} className="relative rounded-sm border border-border p-4 bg-secondary/20">
                <button onClick={() => removeBuild(i)} className="absolute right-4 top-4 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-5 w-5" />
                </button>
                <h3 className="font-bold uppercase text-primary mb-4">Билд #{i + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput label="Заглавие на Билда" value={build.title || ""} onChange={(v) => updateBuild(i, "title", v)} />
                  <TextInput label="Собственик" value={build.owner || ""} onChange={(v) => updateBuild(i, "owner", v)} />
                  <TextInput label="Категория (Напр. Дрифт)" value={build.category || ""} onChange={(v) => updateBuild(i, "category", v)} />
                  <TextInput label="URL на Изображение" value={build.imageUrl || ""} onChange={(v) => updateBuild(i, "imageUrl", v)} />
                  <NumberInput label="Гласове" value={build.votes || 0} onChange={(v) => updateBuild(i, "votes", v)} />
                  <TextInput label="Номер на Издание (Display)" value={build.edition || ""} onChange={(v) => updateBuild(i, "edition", v)} />
                </div>
              </div>
            ))}
            <button onClick={addBuild} className="text-sm font-bold uppercase text-primary hover:underline">+ Добави Билд</button>
          </div>
        </Section>

        {/* Tracks */}
        <Section title="Ревюта на Писти" icon={<MapIcon className="h-4 w-4" />}>
          <div className="space-y-6">
            {(edition.tracks || []).map((track: any, i: number) => (
              <div key={i} className="relative rounded-sm border border-border p-4 bg-secondary/20">
                <button onClick={() => removeTrack(i)} className="absolute right-4 top-4 text-muted-foreground hover:text-destructive"><Trash2 className="h-5 w-5" /></button>
                <h3 className="font-bold uppercase text-primary mb-4">Писта #{i + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput label="Име на Писта" value={track.name || ""} onChange={(v) => updateTrack(i, "name", v)} />
                  <TextInput label="Локация" value={track.location || ""} onChange={(v) => updateTrack(i, "location", v)} />
                  <TextInput label="Трудност" value={track.difficulty || ""} onChange={(v) => updateTrack(i, "difficulty", v)} />
                  <NumberInput label="Оценка (1-10)" value={track.rating || 0} onChange={(v) => updateTrack(i, "rating", v)} min={1} max={10} step={0.1} />
                  <NumberInput label="Брой Обиколки" value={track.laps || 0} onChange={(v) => updateTrack(i, "laps", v)} min={1} />
                </div>
              </div>
            ))}
            <button onClick={addTrack} className="text-sm font-bold uppercase text-primary hover:underline">+ Добави Писта</button>
          </div>
        </Section>

        {/* Articles */}
        <Section title="Статии / Новини" icon={<FileText className="h-4 w-4" />}>
          <div className="space-y-6">
            {(edition.articles || []).map((art: any, i: number) => (
              <div key={i} className="relative rounded-sm border border-border p-4 bg-secondary/20">
                <button onClick={() => removeArticle(i)} className="absolute right-4 top-4 text-muted-foreground hover:text-destructive"><Trash2 className="h-5 w-5" /></button>
                <h3 className="font-bold uppercase text-primary mb-4">Статия #{i + 1}</h3>
                <div className="grid grid-cols-1 gap-4">
                  <TextInput label="Категория" value={art.category || ""} onChange={(v) => updateArticle(i, "category", v)} />
                  <TextInput label="Заглавие" value={art.title || ""} onChange={(v) => updateArticle(i, "title", v)} />
                  <TextArea label="Кратко Резюме" value={art.excerpt || ""} onChange={(v) => updateArticle(i, "excerpt", v)} />
                  <div className="grid grid-cols-2 gap-4">
                    <TextInput label="Дата (Текст)" value={art.date || ""} onChange={(v) => updateArticle(i, "date", v)} />
                    <TextInput label="Време за Четене (напр. '3 МИН')" value={art.readTime || ""} onChange={(v) => updateArticle(i, "readTime", v)} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addArticle} className="text-sm font-bold uppercase text-primary hover:underline">+ Добави Статия</button>
          </div>
        </Section>

      </div>
    </div>
  )
}
