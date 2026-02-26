import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Loader2, AlertCircle, Copy, Check } from "lucide-react"
import { api, UserProfile } from "@/lib/api"

export default function DashboardPage() {
    const [usernameInput, setUsernameInput] = useState("")
    const [passwordInput, setPasswordInput] = useState("")
    const [profile, setProfile] = useState<UserProfile | null>(null)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [successMsg, setSuccessMsg] = useState("")
    const [copied, setCopied] = useState(false)

    // Withdraw state
    const [withdrawAmount, setWithdrawAmount] = useState("")
    const [withdrawLoading, setWithdrawLoading] = useState(false)
    const [withdrawError, setWithdrawError] = useState("")

    // IBAN Setup State
    const [setupIban, setSetupIban] = useState("")
    const [setupLoading, setSetupLoading] = useState(false)
    const [setupError, setSetupError] = useState("")

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
            setError("Неуспешно зареждане на профил.")
        } finally {
            setLoading(false)
        }
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        if (!usernameInput.trim() || !passwordInput.trim()) return

        setLoading(true)
        setError("")
        setSuccessMsg("")

        try {
            const res = await api.register(usernameInput.trim(), passwordInput.trim())
            if (res.error) {
                setError(res.error)
            } else if (res.fp_code) {
                setSuccessMsg(`Успешна регистрация! Вашият нов FP-код е FP-${res.fp_code}`)
                // Automatically log them in by fetching their new profile
                await handleLoginAction(usernameInput.trim(), passwordInput.trim());
            }
        } catch {
            setError("Неуспешна регистрация. Сървърът може да е офлайн.")
        } finally {
            setLoading(false)
        }
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        if (!usernameInput.trim() || !passwordInput.trim()) return
        await handleLoginAction(usernameInput.trim(), passwordInput.trim());
    }

    async function handleLoginAction(username: string, password: string) {
        setLoading(true)
        setError("")
        try {
            const res = await api.login(username, password)
            if ("error" in res) {
                setError(res.error)
                localStorage.removeItem("faka_current_user")
                setProfile(null)
            } else {
                setProfile(res)
                localStorage.setItem("faka_current_user", username)
                setPasswordInput("")
            }
        } catch {
            setError("Неуспешен вход.")
        } finally {
            setLoading(false)
        }
    }

    function handleLogout() {
        localStorage.removeItem("faka_current_user")
        setProfile(null)
        setUsernameInput("")
    }

    async function handleSaveIban(e: React.FormEvent) {
        e.preventDefault()
        if (!profile || !setupIban.trim()) return

        setSetupLoading(true)
        setSetupError("")

        try {
            const res = await api.saveIban(profile.username, setupIban.trim())
            if (res.error) {
                setSetupError(res.error)
            } else {
                setSuccessMsg("IBAN е запазен успешно!")
                await fetchUser(profile.username) // Refresh profile to get the IBAN
            }
        } catch {
            setSetupError("Неуспешно запазване на IBAN.")
        } finally {
            setSetupLoading(false)
        }
    }

    async function handleWithdraw(e: React.FormEvent) {
        e.preventDefault()
        if (!profile) return
        if (!withdrawAmount) {
            setWithdrawError("Моля, въведете сума.")
            return
        }

        setWithdrawLoading(true)
        setWithdrawError("")
        setSuccessMsg("")

        try {
            const res = await api.withdraw(profile.id, parseFloat(withdrawAmount))
            if (res.error) {
                setWithdrawError(res.error)
            } else {
                setSuccessMsg(`Успешно изтеглени $${withdrawAmount}!`)
                setWithdrawAmount("")
                // Refresh balance
                await fetchUser(profile.username)
            }
        } catch {
            setWithdrawError("Грешка в свързването при теглене.")
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
                <br></br>
                <br></br>
                <div className="mb-10">
                    <h1 className="font-serif text-4xl font-bold uppercase italic tracking-wider text-primary">
                        Табло на Играча
                    </h1>
                    <p className="text-muted-foreground mt-2">Управлявайте своя Faka Performance акаунт, вижте баланса си и теглете средства.</p>
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
                        <h2 className="text-xl font-bold uppercase mb-4">Вход в Акаунт</h2>
                        <form className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="text"
                                    placeholder="Потребителско Име"
                                    className="flex-1 rounded border border-border bg-secondary px-4 py-3 focus:border-primary focus:outline-none"
                                    value={usernameInput}
                                    onChange={(e) => setUsernameInput(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Парола"
                                    className="flex-1 rounded border border-border bg-secondary px-4 py-3 focus:border-primary focus:outline-none"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4 sm:justify-end">
                                <button
                                    type="button"
                                    className="flex-1 sm:flex-none rounded bg-secondary px-6 py-3 font-bold hover:bg-secondary/80 flex items-center justify-center min-w-[120px]"
                                    onClick={handleLogin}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Вход"}
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 sm:flex-none rounded bg-primary px-6 py-3 font-bold text-black hover:bg-primary/90 flex items-center justify-center min-w-[120px]"
                                    onClick={handleRegister}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Регистрация"}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : !profile.iban ? (
                    <div className="rounded border border-border bg-card p-6 shadow-sm max-w-lg mx-auto mt-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold uppercase text-primary">Изисква се Настройка</h2>
                            <p className="text-muted-foreground mt-2">
                                Моля, предоставете вашия IBAN в играта. Това е необходимо за обработка на автоматизирани тегления.
                            </p>
                        </div>
                        <form onSubmit={handleSaveIban} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-bold uppercase text-muted-foreground mb-1.5">IBAN в Играта</label>
                                <input
                                    type="text"
                                    placeholder="BG98XXXX0000..."
                                    className="w-full rounded border border-border bg-secondary px-4 py-3 focus:border-primary focus:outline-none font-mono"
                                    value={setupIban}
                                    onChange={(e) => setSetupIban(e.target.value)}
                                    disabled={setupLoading}
                                />
                            </div>

                            {setupError && (
                                <p className="text-sm text-destructive">{setupError}</p>
                            )}

                            <button
                                type="submit"
                                disabled={setupLoading || !setupIban.trim()}
                                className="w-full flex items-center justify-center gap-2 rounded bg-primary px-4 py-3 font-bold uppercase text-black transition-colors hover:bg-primary/90 disabled:opacity-50"
                            >
                                {setupLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Запази IBAN"}
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
                                    <p className="text-muted-foreground">Активен Член</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-semibold text-muted-foreground hover:text-foreground hover:underline"
                                >
                                    Изход
                                </button>
                            </div>

                            <div className="mt-auto space-y-6">
                                <div>
                                    <p className="text-sm uppercase tracking-wider text-muted-foreground mb-1">Наличен Баланс</p>
                                    <p className="text-4xl font-bold text-primary">${profile.balance.toLocaleString()}</p>
                                </div>

                                <div className="rounded bg-secondary/50 p-4 border border-border/50">
                                    <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Вашият Код за Депозит</p>
                                    <div className="flex items-center gap-3">
                                        <code className="bg-background px-3 py-2 rounded text-lg font-mono">FP-{profile.fp_code}</code>
                                        <button
                                            onClick={copyCode}
                                            className="p-2 rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                                            title="Копирай Код"
                                        >
                                            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                                        За да депозирате средства, направете стандартен банков превод в играта към IBAN-а на компанията Faka Performance и използвайте точно <strong>FP-{profile.fp_code}</strong> като основание/описание.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Withdraw Funds */}
                        <div className="rounded border border-border bg-card p-6 shadow-sm">
                            <h2 className="text-xl font-bold uppercase mb-6">Теглене на Средства</h2>

                            <form onSubmit={handleWithdraw} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold uppercase text-muted-foreground mb-1.5">Сума ($)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={profile.balance.toString()}
                                        placeholder="напр. 500"
                                        className="w-full rounded border border-border bg-secondary px-4 py-3 focus:border-primary focus:outline-none"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        disabled={withdrawLoading}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1 text-right">Макс: ${profile.balance}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold uppercase text-muted-foreground mb-1.5">Получаващ IBAN</label>
                                    <div className="w-full rounded border border-border bg-secondary/50 px-4 py-3 font-mono text-muted-foreground flex items-center justify-between">
                                        <span>{profile.iban}</span>
                                        <Check className="h-4 w-4 text-green-500" />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Средствата ще бъдат изпратени автоматично към вашия запазен IBAN.</p>
                                </div>

                                {withdrawError && (
                                    <p className="text-sm text-destructive mt-2">{withdrawError}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={withdrawLoading || !withdrawAmount || parseFloat(withdrawAmount) > profile.balance}
                                    className="w-full flex items-center justify-center gap-2 rounded bg-primary px-4 py-3 font-bold uppercase text-black transition-colors hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {withdrawLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Заявка за Теглене"}
                                </button>
                            </form>
                        </div>

                    </div>
                )}
            </main>
        </div>
    )
}
