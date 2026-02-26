
import { useState, useEffect, type FormEvent } from "react"
import { Lock, AlertCircle, Loader2 } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem("faka_admin_auth")
    if (token === "authenticated") {
      setAuthenticated(true)
    }
    setChecking(false)
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Client-side fallback check since there is no server API
      if (password === "faka2026") {
        sessionStorage.setItem("faka_admin_auth", "authenticated")
        setAuthenticated(true)
      } else {
        setError("Невалидна парола. Достъпът е отказан.")
        setPassword("")
      }
    } catch {
      setError("Грешка при свързване. Моля, опитайте отново.")
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <div className="flex items-center gap-1">
                <div className="h-8 w-2 rounded-sm bg-primary" />
                <div className="h-6 w-2 rounded-sm bg-primary/60" />
              </div>
              <span className="font-serif text-xl font-bold uppercase tracking-wider text-foreground">
                Faka<span className="text-primary">Performance</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Табло на Екипа</p>
          </div>

          {/* Card */}
          <div className="rounded-sm border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-serif text-lg font-bold uppercase text-foreground">
                  Админски Достъп
                </h1>
                <p className="text-xs text-muted-foreground">
                  Въведете парола за да продължите
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Парола
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Въведете админска парола"
                  required
                  className="w-full rounded-sm border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-sm bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Вход"
                )}
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Свържете се със сървърен админ, ако се нуждаете от достъп.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
