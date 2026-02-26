import { useState, useEffect } from "react"
import { Lock, Loader2, Home } from "lucide-react"
import { api, type UserProfile } from "@/lib/api"
import { Link } from "react-router-dom"

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const username = localStorage.getItem("faka_current_user")
        if (!username) {
          setAuthorized(false)
          setChecking(false)
          return
        }

        const userProfile = await api.getUser(username)

        if ("error" in userProfile) {
          setAuthorized(false)
        } else {
          const hasStaffAccess = userProfile.roles?.some((r) => {
            try {
              const perms = JSON.parse(r.permissions || "[]");
              if (Array.isArray(perms) && perms.includes("manage_magazine")) return true;
            } catch (e) {
              // Ignore parse error
            }
            return ["staff", "персонал", "admin", "owner"].includes(r.name.toLowerCase());
          });

          if (hasStaffAccess) {
            setAuthorized(true)
          } else {
            setAuthorized(false)
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        setAuthorized(false)
      } finally {
        setChecking(false)
      }
    }

    checkAuth()
  }, [])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h1 className="mb-2 font-serif text-2xl font-bold uppercase text-foreground">
            Ограничен Достъп
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Тази страница е достъпна само за членове на екипа. Нямате необходимите права (роля "staff" или "персонал").
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Home className="h-4 w-4" />
            Към Началото
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
