import { ShieldCheck, ShieldQuestion, Tag, Eye, Ban } from 'lucide-react'
import LanguageTabs from './LanguageTabs'

const SEVERITY_STYLES = {
  critical: 'bg-red-500/10 text-red-300 ring-red-500/30',
  high: 'bg-orange-500/10 text-orange-300 ring-orange-500/30',
  medium: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  low: 'bg-sky-500/10 text-sky-300 ring-sky-500/30',
  informational: 'bg-slate-500/10 text-slate-300 ring-slate-500/30',
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48) || 'detection-rule'
}

export default function ResultPanel({ result }) {
  const severity = (result.severity || 'medium').toLowerCase()
  const severityClass = SEVERITY_STYLES[severity] || SEVERITY_STYLES.medium
  const baseFilename = slugify(result.title || 'detection-rule')
  const validated = result.validation?.pass !== false

  return (
    <div className="animate-fade-up rounded-2xl border border-ink-600/60 bg-ink-900/40 p-6 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-ink-600/50 pb-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">{result.title}</h2>
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-400">{result.description}</p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${severityClass}`}>
            {severity}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(result.mitre_attack || []).map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-md bg-signal-500/10 px-2.5 py-1 text-[11px] font-medium text-signal-400 ring-1 ring-signal-500/25">
              <Tag size={11} />
              {t}
            </span>
          ))}
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium ring-1 ${
              validated
                ? 'bg-accent-500/10 text-accent-400 ring-accent-500/25'
                : 'bg-amber-500/10 text-amber-300 ring-amber-500/25'
            }`}
            title={result.validation?.notes || ''}
          >
            {validated ? <ShieldCheck size={12} /> : <ShieldQuestion size={12} />}
            {validated ? 'Self-reviewed by AI QA pass' : 'Review recommended'}
          </span>
        </div>
      </div>

      {(result.false_positives?.length > 0 || result.log_sources?.length > 0) && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {result.log_sources?.length > 0 && (
            <div className="rounded-xl border border-ink-600/50 bg-ink-900/60 p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Eye size={13} /> Required log sources
              </div>
              <ul className="space-y-1 text-sm text-slate-400">
                {result.log_sources.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
          )}
          {result.false_positives?.length > 0 && (
            <div className="rounded-xl border border-ink-600/50 bg-ink-900/60 p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Ban size={13} /> Known false positives
              </div>
              <ul className="space-y-1 text-sm text-slate-400">
                {result.false_positives.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <LanguageTabs result={result} baseFilename={baseFilename} />
    </div>
  )
}
