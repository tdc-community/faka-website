import { useState, useRef, useEffect } from "react"
import { Upload, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { api, UserProfile } from "@/lib/api"

interface UploadFormProps {
    user: UserProfile
    onSuccess: () => void
}

export function UploadForm({ user, onSuccess }: UploadFormProps) {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [entryFee, setEntryFee] = useState<number>(1000)

    // Fetch settings on mount
    useEffect(() => {
        api.getSettings().then(data => {
            if (!("error" in data) && data.entryFee) {
                setEntryFee(data.entryFee)
            }
        }).catch(console.error)
    }, [])

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected) {
            if (!selected.type.startsWith('image/')) {
                setError("Моля, изберете файл с изображение.")
                return
            }
            setFile(selected)
            setPreview(URL.createObjectURL(selected))
            setError("")
        }
    }

    const handleClear = () => {
        setFile(null)
        setPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) {
            setError("Моля, изберете изображение за качване.")
            return
        }

        if (user.balance < entryFee) {
            setError(`Недостатъчен баланс. Таксата за участие е $${entryFee.toLocaleString()}.`)
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await api.uploadEntry(user.id, file, description)
            if (res.error) {
                setError(res.error)
            } else {
                setSuccess(true)
                setTimeout(() => {
                    setSuccess(false)
                    handleClear()
                    setDescription("")
                    onSuccess() // Notify parent to refresh data
                }, 3000)
            }
        } catch {
            setError("Мрежова грешка. Неуспешно качване на участието.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="rounded border border-border bg-card p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-bold uppercase">Качете Своя Проект</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Участвайте в седмичния конкурс на Faka Performance.
                    <span className="font-semibold text-primary ml-1">Такса за Участие: ${entryFee.toLocaleString()}</span>
                </p>
            </div>

            {success ? (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 bg-green-500/10 border border-green-500/20 rounded">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                    <p className="font-bold text-lg text-green-500">Участието е Успешно Качено!</p>
                    <p className="text-sm text-muted-foreground">Късмет в конкурса тази седмица.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">
                            Снимка на Колата
                        </label>

                        {!preview ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-secondary/50"
                            >
                                <Upload className="h-8 w-8 text-muted-foreground mb-3" />
                                <p className="text-sm font-medium">Кликнете, за да качите най-добрата си снимка</p>
                                <p className="text-xs text-muted-foreground mt-1">JPG, PNG до 10MB</p>
                            </div>
                        ) : (
                            <div className="relative rounded-lg overflow-hidden border border-border bg-secondary aspect-video">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-black transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">
                            Описание на Проекта (По Избор)
                        </label>
                        <textarea
                            placeholder="Разкажете ни за модификациите..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full min-h-[100px] rounded border border-border bg-secondary px-4 py-3 text-sm focus:border-primary focus:outline-none resize-none"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded bg-destructive/10 p-3 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !file || user.balance < entryFee}
                            className="w-full flex items-center justify-center gap-2 rounded bg-primary px-4 py-4 font-bold uppercase tracking-wide text-black transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Качи Участие (-$${entryFee.toLocaleString()})`}
                        </button>
                        {user.balance < entryFee && (
                            <p className="text-xs text-center text-destructive mt-2 font-medium">
                                Нуждаете се от поне ${entryFee.toLocaleString()} в баланса си, за да участвате.
                            </p>
                        )}
                    </div>
                </form>
            )}
        </div>
    )
}
