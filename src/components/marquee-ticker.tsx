"use client"

import { useEffect, useRef } from "react"

interface MarqueeTickerProps {
  headlines: string[]
}

export function MarqueeTicker({ headlines }: MarqueeTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let animationId: number
    let position = 0

    const animate = () => {
      position -= 0.5
      if (Math.abs(position) >= el.scrollWidth / 2) {
        position = 0
      }
      el.style.transform = `translateX(${position}px)`
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <div className="overflow-hidden border-y border-border bg-primary py-3">
      <div ref={scrollRef} className="flex whitespace-nowrap">
        {[...headlines, ...headlines].map((headline, i) => (
          <span
            key={i}
            className="mx-8 text-sm font-bold uppercase tracking-wider text-primary-foreground"
          >
            {headline}
            <span className="ml-8 text-primary-foreground/40">{"///"}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
