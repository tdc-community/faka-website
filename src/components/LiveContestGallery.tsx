import { useState, useEffect } from "react"
import { api, UserProfile } from "@/lib/api"
import { UploadForm } from "@/components/UploadForm"
import { Loader2, Heart, Trash2 } from "lucide-react"

export function LiveContestGallery() {
    const [entries, setEntries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<UserProfile | null>(null)
    const [voteLoadingId, setVoteLoadingId] = useState<number | null>(null)
    const [cancelLoadingId, setCancelLoadingId] = useState<number | null>(null)
    const [entryFee, setEntryFee] = useState<number>(1000)

    useEffect(() => {
        fetchData()
        api.getSettings().then(data => {
            if (!("error" in data) && data.entryFee) setEntryFee(data.entryFee)
        }).catch(console.error)
    }, [])

    async function fetchData() {
        setLoading(true)

        // Attempt to load user
        const savedUser = localStorage.getItem("faka_current_user")
        if (savedUser) {
            const u = await api.getUser(savedUser)
            if (!("error" in u)) {
                setUser(u)
            } else {
                localStorage.removeItem("faka_current_user")
            }
        }

        try {
            const data = await api.getEntries(1) // Week 1
            setEntries(data)
        } catch {
            console.error("Failed to load entries")
        } finally {
            setLoading(false)
        }
    }

    async function handleVote(entryId: number) {
        if (!user) {
            alert("You must be logged in (via Dashboard) to vote!")
            return
        }

        setVoteLoadingId(entryId)
        try {
            const res = await api.vote(user.id, entryId, 1)
            if (res.error) {
                alert(res.error)
            } else {
                // Refresh entries to show new vote count
                await fetchData()
            }
        } catch {
            alert("Failed to cast vote.")
        } finally {
            setVoteLoadingId(null)
        }
    }

    async function handleCancel(entryId: number) {
        if (!user) return
        if (!confirm(`Are you sure you want to cancel your entry? You will be refunded the $${entryFee.toLocaleString()} entry fee.`)) return

        setCancelLoadingId(entryId)
        try {
            const res = await api.cancelEntry(user.id, entryId)
            if (res.error) {
                alert(res.error)
            } else {
                alert(`Entry successfully canceled. $${entryFee.toLocaleString()} refunded.`)
                await fetchData()
            }
        } catch {
            alert("Failed to cancel entry.")
        } finally {
            setCancelLoadingId(null)
        }
    }

    return (
        <section id="live-contest" className="scroll-mt-20 bg-secondary/30 py-24">
            <div className="container mx-auto px-4">

                <div className="mb-12 flex flex-col items-center justify-between gap-6 border-b border-border pb-6 md:flex-row">
                    <div>
                        <h2 className="font-serif text-3xl font-bold uppercase italic tracking-wider">
                            <span className="text-primary">Live</span> Contest Entries
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                            Vote for your favorite build. You can only vote once per week! The winner takes home the prize pool.
                        </p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">

                    {/* Gallery View */}
                    <div className="lg:col-span-2 space-y-8">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="rounded border border-border border-dashed p-12 text-center bg-secondary/20">
                                <p className="text-lg font-medium text-muted-foreground">No entries yet this week.</p>
                                <p className="text-sm text-muted-foreground mt-1">Be the first to submit your build!</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2">
                                {entries.map((entry) => (
                                    <div key={entry.id} className="group relative overflow-hidden rounded bg-card border border-border shadow-sm">
                                        <div className="aspect-[4/3] relative overflow-hidden">
                                            <img
                                                src={`http://localhost:5000${entry.imageUrl}`}
                                                alt={entry.ownerUsername}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={(e) => {
                                                    // Fallback if full URL pathing acts weird or hasn't loaded
                                                    (e.target as HTMLImageElement).src = entry.imageUrl;
                                                }}
                                            />
                                            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur px-3 py-1 rounded text-xs font-bold text-white uppercase tracking-wider">
                                                {entry.ownerUsername}
                                            </div>
                                        </div>

                                        <div className="p-4 flex flex-col justify-between items-start gap-4">
                                            {entry.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">{entry.description}</p>
                                            )}

                                            <div className="flex w-full items-center justify-between border-t border-border/50 pt-4 mt-auto">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Heart className="h-4 w-4 text-primary fill-primary" />
                                                    <span className="font-bold">{entry.votesCount} Votes</span>
                                                </div>

                                                <div className="flex gap-2">
                                                    {user && entry.ownerUsername === user.username && (
                                                        <button
                                                            onClick={() => handleCancel(entry.id)}
                                                            disabled={cancelLoadingId === entry.id}
                                                            className="rounded bg-destructive/10 hover:bg-destructive/20 text-destructive px-3 py-2 transition-colors disabled:opacity-50 border border-destructive/20"
                                                            title="Cancel Entry"
                                                        >
                                                            {cancelLoadingId === entry.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleVote(entry.id)}
                                                        disabled={voteLoadingId === entry.id || !user}
                                                        className="rounded bg-secondary hover:bg-secondary/80 px-4 py-2 text-xs font-bold uppercase transition-colors disabled:opacity-50 border border-border"
                                                    >
                                                        {voteLoadingId === entry.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vote"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Upload Form */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            {user ? (
                                <UploadForm user={user} onSuccess={fetchData} />
                            ) : (
                                <div className="rounded border border-border bg-card p-6 shadow-sm text-center">
                                    <h3 className="font-bold uppercase text-lg mb-3">Want to participate?</h3>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Log in to your dashboard to submit your car and vote.
                                    </p>
                                    <a href="/dashboard" className="block w-full rounded bg-primary px-4 py-3 font-bold uppercase text-black text-sm">
                                        Go to Dashboard
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
