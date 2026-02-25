import { ArrowRight, Newspaper } from "lucide-react"
import { useState } from "react"
import type { ArticleData } from "@/lib/magazine-store"
import { ComingSoonModal } from "./coming-soon-modal"

interface NewsSectionProps {
  articles: ArticleData[]
}

export function NewsSection({ articles }: NewsSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <section id="news" className="scroll-mt-20 bg-secondary py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="mb-3 flex items-center gap-3">
            <Newspaper className="h-5 w-5 text-primary" />
            <span className="font-sans text-sm font-semibold uppercase tracking-widest text-primary">
              Latest
            </span>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="font-serif text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl lg:text-6xl">
              News & Articles
            </h2>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary transition-colors hover:text-primary/80"
            >
              View All News
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-2">
          {articles.map((article, idx) => (
            <button
              key={idx}
              onClick={() => setModalOpen(true)}
              className="w-full text-left group bg-card p-6 transition-colors hover:bg-card/80 lg:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-sm bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  {article.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {article.date}
                </span>
              </div>
              <h3 className="mt-4 font-serif text-xl font-bold uppercase leading-tight text-foreground transition-colors group-hover:text-primary lg:text-2xl">
                {article.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {article.excerpt}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {article.readTime} read
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Read
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <ComingSoonModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="News Portal Update"
        description="The full news portal with expanded articles and builder interviews is coming in the next major update!"
      />
    </section>
  )
}
