import { ShieldHalf, Github } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink-600/40 bg-ink-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-signal-500">
            <ShieldHalf size={17} className="text-ink-950" strokeWidth={2.4} />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white">Detection Rule Forge</div>
            <div className="text-[10.5px] text-slate-500 -mt-0.5">AI-generated detection logic, in your language</div>
          </div>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-ink-600/60 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-accent-500/40 hover:text-white transition-colors"
        >
          <Github size={14} />
          View on GitHub
        </a>
      </div>
    </header>
  )
}
