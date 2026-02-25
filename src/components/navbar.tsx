"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Link } from "react-router-dom"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Car of the Week", href: "/#car-of-the-week" },
  { label: "Live Contest", href: "/#live-contest" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Tracks", href: "/#tracks" },
  { label: "News", href: "/#news" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="h-8 w-2 bg-primary rounded-sm" />
              <div className="h-6 w-2 bg-primary/60 rounded-sm" />
            </div>
            <span className="font-serif text-xl font-bold uppercase tracking-wider text-foreground lg:text-2xl">
              Faka<span className="text-primary">Performance</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              link.href.startsWith("/") && !link.href.includes("#") ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </a>
              )
            ))}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <a
              href="/#live-contest"
              className="hidden rounded-sm bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 lg:block"
            >
              Submit Your Car
            </a>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground lg:hidden"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              link.href.startsWith("/") && !link.href.includes("#") ? (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-sm px-3 py-3 text-sm font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-sm px-3 py-3 text-sm font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {link.label}
                </a>
              )
            ))}
            <a
              href="/#live-contest"
              onClick={() => setIsOpen(false)}
              className="mt-2 block rounded-sm bg-primary px-3 py-3 text-center text-sm font-bold uppercase tracking-wide text-primary-foreground"
            >
              Submit Your Car
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
