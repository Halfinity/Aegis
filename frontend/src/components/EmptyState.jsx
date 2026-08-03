import { Terminal } from 'lucide-react'
import { LANGUAGES } from '../lib/languages'

export default function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-ink-600/60 p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ink-800 text-accent-400">
        <Terminal size={20} />
      </div>
      <h3 className="text-base font-semibold text-white">Describe a detection, get {LANGUAGES.length} rule formats</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Enter a plain-English detection idea above. Each result includes {LANGUAGES.map((l) => l.label).join(', ')} — with
        comments, MITRE ATT&CK mapping where applicable, and an AI self-review pass.
      </p>
    </div>
  )
}
