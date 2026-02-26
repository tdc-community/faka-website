import { X } from "lucide-react"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    description: string
}

export function ComingSoonModal({ isOpen, onClose, title, description }: ModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-sm border border-border bg-card p-6 shadow-lg relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-5 w-5" />
                </button>
                <h2 className="mb-2 font-serif text-2xl font-bold uppercase tracking-wide text-foreground">
                    {title}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                    {description}
                </p>
                <button
                    onClick={onClose}
                    className="w-full rounded-sm bg-primary px-4 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
                >
                    Добре
                </button>
            </div>
        </div>
    )
}
