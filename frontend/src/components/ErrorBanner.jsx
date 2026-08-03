import { AlertTriangle } from 'lucide-react'

export default function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300 animate-fade-up">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-medium">Generation failed</p>
        <p className="mt-0.5 text-red-300/80">{message}</p>
      </div>
    </div>
  )
}
