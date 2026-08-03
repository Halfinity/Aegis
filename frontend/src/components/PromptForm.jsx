import { useState } from 'react'
import { Sparkles, Loader2, ArrowRight } from 'lucide-react'

const EXAMPLES = [
  'Detect SSH connections from external IP addresses',
  'Multiple failed logins followed by a success (password spray)',
  'PowerShell downloading and executing a remote script',
  'New IAM access key created and used within minutes',
  'DNS query volume anomaly indicative of tunneling',
]

export default function PromptForm({ onSubmit, loading }) {
  const [value, setValue] = useState('')

  function submit(e) {
    e?.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || loading) return
    onSubmit(trimmed)
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="relative rounded-2xl border border-ink-600/60 bg-ink-900/70 shadow-glow focus-within:border-accent-500/50 transition-colors">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(e)
          }}
          placeholder="Describe the behavior you want to detect, e.g. “SSH from external IP address”…"
          rows={3}
          className="w-full resize-none bg-transparent px-5 pt-5 pb-14 text-[15px] text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
          <span className="hidden sm:inline text-[11px] text-slate-500 px-2">⌘ / Ctrl + Enter to generate</span>
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-ink-950 transition-all hover:bg-accent-400 disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-slate-500"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate rules
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 mr-1">Try:</span>
        {EXAMPLES.map((ex) => (
          <button
            type="button"
            key={ex}
            disabled={loading}
            onClick={() => setValue(ex)}
            className="group inline-flex items-center gap-1 rounded-full border border-ink-600/60 bg-ink-900/60 px-3 py-1.5 text-xs text-slate-400 hover:border-accent-500/40 hover:text-accent-300 transition-colors disabled:opacity-50"
          >
            {ex}
            <ArrowRight size={11} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </button>
        ))}
      </div>
    </form>
  )
}
