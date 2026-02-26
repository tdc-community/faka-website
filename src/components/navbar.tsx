"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Link } from "react-router-dom"

const navLinks = [
  { label: "Начало", href: "/" },
  { label: "Кола на Седмицата", href: "/#car-of-the-week" },
  { label: "Конкурс на Живо", href: "/#live-contest" },
  { label: "Табло", href: "/dashboard" },
]

import { useEffect } from "react"
import { api } from "@/lib/api"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isStaff, setIsStaff] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  useEffect(() => {
    async function checkStaffStatus() {
      const username = localStorage.getItem("faka_current_user")
      if (!username) return
      setCurrentUser(username)
      try {
        const data = await api.getUser(username)
        if (data && !("error" in data) && data.roles) {
          const hasStaffRole = data.roles.some((r: any) => {
            try {
              const perms = JSON.parse(r.permissions || "[]");
              if (Array.isArray(perms) && perms.includes("manage_magazine")) return true;
            } catch (e) {
              // Ignore parse error
            }
            return ["staff", "персонал", "admin", "owner"].includes(r.name.toLowerCase());
          });
          setIsStaff(hasStaffRole)
        }
      } catch (e) { }
    }
    checkStaffStatus()
  }, [])

  function handleLogout() {
    localStorage.removeItem("faka_current_user")
    window.location.reload()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
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

          {/* Profile Part + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3">
              {currentUser ? (
                <>
                  {isStaff && (
                    <a
                      href="/staff"
                      className="rounded-sm bg-secondary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-secondary/80 border border-border"
                    >
                      Табло на Екипа
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className="rounded-sm bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Изход
                  </button>
                </>
              ) : (
                <a
                  href="/dashboard"
                  className="rounded-sm bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Вход / Профил
                </a>
              )}
            </div>

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

            {currentUser ? (
              <>
                {isStaff && (
                  <a
                    href="/staff"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-sm px-3 py-3 text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-secondary"
                  >
                    Табло на Екипа
                  </a>
                )}
                <button
                  onClick={handleLogout}
                  className="mt-2 w-full block rounded-sm bg-primary px-3 py-3 text-center text-sm font-bold uppercase tracking-wide text-primary-foreground"
                >
                  Изход
                </button>
              </>
            ) : (
              <a
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="mt-2 block rounded-sm bg-primary px-3 py-3 text-center text-sm font-bold uppercase tracking-wide text-primary-foreground"
              >
                Вход / Профил
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
