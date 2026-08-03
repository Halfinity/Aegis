import { useState, useMemo } from 'react'
import { LANGUAGES } from '../lib/languages'
import CodeBlock from './CodeBlock'
import { FileWarning } from 'lucide-react'

export default function LanguageTabs({ result, baseFilename }) {
  const available = useMemo(
    () => LANGUAGES.filter((l) => result.languages?.[l.id]?.code),
    [result],
  )
  const [active, setActive] = useState(available[0]?.id)
  const current = available.find((l) => l.id === active) || available[0]
  const block = result.languages?.[current?.id]

  if (!available.length) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-300">
        <FileWarning size={16} />
        No rule languages were returned for this request.
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 border-b border-ink-600/50 pb-3 mb-4">
        {available.map((lang) => {
          const isActive = lang.id === current?.id
          return (
            <button
              key={lang.id}
              onClick={() => setActive(lang.id)}
              className={`group relative rounded-lg px-3 py-2 text-left transition-colors ${
                isActive
                  ? 'bg-ink-800 ring-1 ring-accent-500/40'
                  : 'hover:bg-ink-800/60'
              }`}
            >
              <div className={`text-xs font-semibold ${isActive ? 'text-accent-400' : 'text-slate-300 group-hover:text-white'}`}>
                {lang.label}
              </div>
              <div className="text-[10.5px] text-slate-500">{lang.group}</div>
            </button>
          )
        })}
      </div>

      {block && (
        <div className="space-y-3 animate-fade-up" key={current.id}>
          <p className="text-sm text-slate-400">{current.blurb}</p>
          <CodeBlock
            code={block.code}
            language={current.prism}
            filename={`${baseFilename}.${current.ext}`}
          />
          {block.notes && (
            <div className="rounded-lg border border-ink-600/50 bg-ink-900/50 px-4 py-3 text-sm text-slate-400">
              <span className="font-semibold text-slate-300">Implementation notes: </span>
              {block.notes}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
