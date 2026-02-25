import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Loader2, AlertCircle, Copy, Check } from "lucide-react"
import { api, UserProfile } from "@/lib/api"

export default function DashboardPage() {
    const [usernameInput, setUsernameInput] = useState("")
    const [profile, setProfile] = useState<UserProfile | null>(null)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [successMsg, setSuccessMsg] = useState("")
    const [copied, setCopied] = useState(false)

    // Withdraw state
    const [withdrawAmount, setWithdrawAmount] = useState("")
    const [withdrawIban, setWithdrawIban] = useState("")
    const [withdrawLoading, setWithdrawLoading] = useState(false)
    const [withdrawError, setWithdrawError] = useState("")

    useEffect(() => {
        // Check if user is already saved in session/local storage
        const savedUser = localStorage.getItem("faka_current_user")
        if (savedUser) {
            fetchUser(savedUser)
        }
    }, [])

    async function fetchUser(username: string) {
        setLoading(true)
        setError("")
        try {
            const res = await api.getUser(username)
            if ("error" in res) {
                setError(res.error)
                localStorage.removeItem("faka_current_user")
                setProfile(null)
            } else {
                setProfile(res)
                localStorage.setItem("faka_current_user", username)
            }
        } catch {
            setError("Failed to fetch profile.")
        } finally {
            setLoading(false)
        }
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        if (!usernameInput.trim()) return

        setLoading(true)
        setError("")
        setSuccessMsg("")

        try {
            const res = await api.register(usernameInput.trim())
            if (res.error) {
                setError(res.error)
            } else if (res.fp_code) {
                setSuccessMsg(`Registered successfully! Your new FP-Code is FP-${res.fp_code}`)
                await fetchUser(usernameInput.trim())
            }
        } catch {
            setError("Failed to register. Server might be offline.")
        } finally {
            setLoading(false)
        }
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        if (!usernameInput.trim()) return
        await fetchUser(usernameInput.trim())
    }

    function handleLogout() {
        localStorage.removeItem("faka_current_user")
        setProfile(null)
        setUsernameInput("")
    }

    async function handleWithdraw(e: React.FormEvent) {
        e.preventDefault()
        if (!profile) return
        if (!withdrawAmount || !withdrawIban) {
            setWithdrawError("Please fill out both fields.")
            return
        }

        setWithdrawLoading(true)
        setWithdrawError("")
        setSuccessMsg("")

        try {
            const res = await api.withdraw(profile.id, parseFloat(withdrawAmount), withdrawIban)
            if (res.error) {
                setWithdrawError(res.error)
            } else {
                setSuccessMsg(`Successfully withdrew $${withdrawAmount}!`)
                setWithdrawAmount("")
                setWithdrawIban("")
                // Refresh balance
                await fetchUser(profile.username)
            }
        } catch {
            setWithdrawError("Connection error during withdrawal.")
        } finally {
            setWithdrawLoading(false)
        }
    }

    function copyCode() {
        if (!profile) return
        navigator.clipboard.writeText(`FP-${profile.fp_code}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="container mx-auto max-w-4xl px-4 py-12">
                <div className="mb-10">
                    <h1 className="font-serif text-4xl font-bold uppercase italic tracking-wider text-primary">
                        Player Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2">Manage your Faka Performance account, view balance, and withdraw funds.</p>
                </div>

                {error && (
                    <div className="mb-6 flex items-center gap-2 rounded bg-destructive/10 p-4 text-destructive border border-destructive/20">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-6 flex items-center gap-2 rounded bg-green-500/10 p-4 text-green-500 border border-green-500/20">
                        <Check className="h-5 w-5 flex-shrink-0" />
                        <p>{successMsg}</p>
                    </div>
                )}

                {!profile ? (
                    <div className="rounded border border-border bg-card p-6 shadow-sm">
                        <h2 className="text-xl font-bold uppercase mb-4">Access Account</h2>
                        <form className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Enter Username"
                                className="flex-1 rounded border border-border bg-secondary px-4 py-3 focus:border-primary focus:outline-none"
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                            />
                            <button
                                type="button"
                                className="rounded bg-secondary px-6 py-3 font-bold hover:bg-secondary/80 flex items-center justify-center min-w-[120px]"
                                onClick={handleLogin}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
                            </button>
                            <button
                                type="submit"
                                className="rounded bg-primary px-6 py-3 font-bold text-black hover:bg-primary/90 flex items-center justify-center min-w-[120px]"
                                onClick={handleRegister}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Register"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">

                        {/* Profile Overview */}
                        <div className="rounded border border-border bg-card p-6 shadow-sm flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold uppercase">{profile.username}</h2>
                                    <p className="text-muted-foreground">Active Member</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-semibold text-muted-foreground hover:text-foreground hover:underline"
                                >
                                    Logout
                                </button>
                            </div>

                            <div className="mt-auto space-y-6">
                                <div>
                                    <p className="text-sm uppercase tracking-wider text-muted-foreground mb-1">Available Balance</p>
                                    <p className="text-4xl font-bold text-primary">${profile.balance.toLocaleString()}</p>
                                </div>

                                <div className="rounded bg-secondary/50 p-4 border border-border/50">
                                    <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Your Deposit Code</p>
                                    <div className="flex items-center gap-3">
                                        <code className="bg-background px-3 py-2 rounded text-lg font-mono">FP-{profile.fp_code}</code>
                                        <button
                                            onClick={copyCode}
                                            className="p-2 rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                                            title="Copy Code"
                                        >
                                            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                                        To deposit funds, make a standard bank transfer in-game to the Faka Performance company IBAN and use exactly <strong>FP-{profile.fp_code}</strong> as the reason/description.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Withdraw Funds */}
                        <div className="rounded border border-border bg-card p-6 shadow-sm">
                            <h2 className="text-xl font-bold uppercase mb-6">Withdraw Funds</h2>

                            <form onSubmit={handleWithdraw} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold uppercase text-muted-foreground mb-1.5">Amount ($)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={profile.balance.toString()}
                                        placeholder="e.g. 500"
                                        className="w-full rounded border border-border bg-secondary px-4 py-3 focus:border-primary focus:outline-none"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        disabled={withdrawLoading}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1 text-right">Max: ${profile.balance}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold uppercase text-muted-foreground mb-1.5">Receiving IBAN</label>
                                    <input
                                        type="text"
                                        placeholder="BG98XXXX0000..."
                                        className="w-full rounded border border-border bg-secondary px-4 py-3 focus:border-primary focus:outline-none font-mono"
                                        value={withdrawIban}
                                        onChange={(e) => setWithdrawIban(e.target.value)}
                                        disabled={withdrawLoading}
                                    />
                                </div>

                                {withdrawError && (
                                    <p className="text-sm text-destructive mt-2">{withdrawError}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={withdrawLoading || !withdrawAmount || !withdrawIban || parseFloat(withdrawAmount) > profile.balance}
                                    className="w-full flex items-center justify-center gap-2 rounded bg-primary px-4 py-3 font-bold uppercase text-black transition-colors hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {withdrawLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Request Withdrawal"}
                                </button>
                            </form>
                        </div>

                    </div>
                )}
            </main>
        </div>
    )
}
