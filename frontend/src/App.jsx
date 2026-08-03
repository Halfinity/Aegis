import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Terminal, Radar, Code2, GitBranch, Database, Layers,
  Search, ShieldAlert, Zap, Copy, Check, Loader2, ChevronRight,
  AlertTriangle, Sparkles, Lock, RotateCcw,
} from 'lucide-react'
import { generateRuleSet, ApiError } from './lib/api'
import { FORMATS } from './lib/languages'

/* ---------------------------------------------------------------------
   TOKENS — dark terminal / blue-team reference aesthetic
--------------------------------------------------------------------- */
const c = {
  void: '#07080b',
  panel: '#0d1016',
  panel2: '#12151d',
  line: '#1d222c',
  line2: '#272d3a',
  blue: '#3b8eff',
  blueSoft: '#3b8eff22',
  amber: '#f5b942',
  emerald: '#34d399',
  cyan: '#22d3ee',
  danger: '#ff4d5e',
  dangerSoft: '#ff4d5e1a',
  text: '#e8eaef',
  muted: '#8890a0',
  mutedDim: '#4d5464',
}

const STAGES = [
  'parsing detection intent…',
  'drafting rule logic across all languages…',
  'running ai qa / self-review pass…',
  'finalizing output…',
]

const PIPELINE = [
  { n: '01', title: 'PARSE', desc: 'Break the prompt into entities, techniques, and log sources.' },
  { n: '02', title: 'DRAFT', desc: 'Draft equivalent logic across every supported query language.' },
  { n: '03', title: 'QA', desc: 'Self-review pass checks syntax, field names, and false-positive risk.' },
  { n: '04', title: 'FINALIZE', desc: 'Assemble the final rule set with descriptions and metadata.' },
]

const STATS = [
  { value: '8', label: 'OUTPUT FORMATS', color: c.blue },
  { value: '4', label: 'PIPELINE STAGES', color: c.amber },
  { value: '100%', label: 'SELF-REVIEWED', color: c.emerald },
  { value: '<5s', label: 'TYPICAL RUNTIME', color: c.cyan },
]

const EXAMPLES = [
  'Inbound SSH connection from external IP address',
  'Suspicious encoded PowerShell execution',
  'Service account authenticating from two countries in 10 mins',
]

/* ---------------------------------------------------------------------
   PRIMITIVES
--------------------------------------------------------------------- */
function Pill({ children, tone = 'blue', outline = true }) {
  const tones = { blue: c.blue, emerald: c.emerald, amber: c.amber, cyan: c.cyan, muted: c.muted, danger: c.danger }
  const tc = tones[tone]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono uppercase tracking-wider"
      style={{
        color: tc,
        border: outline ? `1px solid ${tc}55` : 'none',
        backgroundColor: `${tc}14`,
      }}
    >
      {children}
    </span>
  )
}

function Dot({ color = c.emerald, pulse = false }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      {pulse && (
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    </span>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-1 rounded-sm" style={{ backgroundColor: c.blue }} />
      <span className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: c.blue }}>
        {children}
      </span>
    </div>
  )
}

/* ---------------------------------------------------------------------
   HEADER
--------------------------------------------------------------------- */
function Header() {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 backdrop-blur"
      style={{ backgroundColor: `${c.void}dd`, borderBottom: `1px solid ${c.line}` }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#ff5f57' }} />
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#febc2e' }} />
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#28c840' }} />
        </div>
        <span className="hidden sm:inline font-mono text-sm" style={{ color: c.muted }}>
          detectx <span style={{ color: c.mutedDim }}>::</span> rule_forge
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden md:inline-flex items-center gap-2 font-mono text-xs" style={{ color: c.muted }}>
          <Dot color={c.emerald} pulse /> ONLINE
        </span>
        <Pill tone="blue">
          <Lock size={11} /> ANALYST AUTH ONLY
        </Pill>
      </div>
    </header>
  )
}

/* ---------------------------------------------------------------------
   HERO & PROMPT FORM COMBINED (Pulled Up Closer)
--------------------------------------------------------------------- */
function HeroAndForm({ onSubmit, loading, promptValue, setPromptValue }) {
  const submit = () => {
    if (!promptValue.trim() || loading) return
    onSubmit(promptValue)
  }

  return (
    <section className="relative overflow-hidden pt-10 pb-6 sm:pt-14 sm:pb-8">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(${c.line}55 1px, transparent 1px),
            linear-gradient(90deg, ${c.line}55 1px, transparent 1px)`,
          backgroundSize: '42px 42px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 20%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 20%, black 30%, transparent 75%)',
        }}
      />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="animate-fadeUp">
          <Pill tone="blue">
            <Sparkles size={12} /> Multi-format · Autonomous · SOC-Ready
          </Pill>

          <h1 className="mt-4 font-mono font-black tracking-tight glow-text text-4xl sm:text-5xl">
            DETECT<span style={{ color: c.blue }}>X</span>
          </h1>

          <p className="mt-2 font-mono text-sm sm:text-base" style={{ color: c.text }}>
            <span style={{ color: c.blue }}>&gt;</span> natural language in. production detection logic out.
          </p>
        </div>

        {/* Prompt Box pulled right up under the hero */}
        <div
          className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-2xl text-left"
          style={{ border: `1px solid ${c.line}`, backgroundColor: c.panel, boxShadow: `0 0 0 1px ${c.void}, 0 20px 60px -20px ${c.blue}22` }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2 font-mono text-xs"
            style={{ borderBottom: `1px solid ${c.line}`, color: c.mutedDim, backgroundColor: c.panel2 }}
          >
            <Terminal size={13} /> detection_intent.prompt
          </div>
          <div className="p-4">
            <div className="flex items-start gap-2">
              <span className="mt-3 font-mono text-sm" style={{ color: c.blue }}>&gt;</span>
              <textarea
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit()
                }}
                rows={2}
                placeholder="e.g. alert when a service account authenticates from two countries within 10 minutes"
                className="w-full resize-none bg-transparent py-2 font-mono text-sm leading-relaxed outline-none placeholder:opacity-60"
                style={{ color: c.text }}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs" style={{ color: c.mutedDim }}>
                ⌘/Ctrl + Enter to run
              </span>
              <button
                onClick={submit}
                disabled={loading || !promptValue.trim()}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-opacity focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: c.blue, color: '#08090c' }}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                Generate rules
              </button>
            </div>
          </div>
        </div>

        {/* Example Rule Suggestions */}
        <div className="mx-auto mt-3 flex max-w-3xl flex-wrap items-center justify-center gap-2 font-mono text-xs">
          <span style={{ color: c.mutedDim }}>Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setPromptValue(ex)}
              className="rounded-md px-2.5 py-1 transition-colors hover:cursor-pointer"
              style={{ border: `1px solid ${c.line}`, backgroundColor: c.panel, color: c.muted }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------
   STAT STRIP
--------------------------------------------------------------------- */
function StatStrip({ elapsed }) {
  return (
    <div className="mx-auto max-w-6xl px-6 mt-6">
      <div
        className="grid grid-cols-2 sm:grid-cols-4 rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${c.line}`, backgroundColor: c.panel }}
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="px-5 py-6 text-center"
            style={{ borderLeft: i === 0 ? 'none' : `1px solid ${c.line}` }}
          >
            <div className="font-mono text-3xl font-extrabold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="mt-1 font-mono text-xs tracking-widest" style={{ color: c.mutedDim }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-xl px-5 py-3 font-mono text-xs"
        style={{ border: `1px solid ${c.line}`, backgroundColor: c.panel2, color: c.mutedDim }}
      >
        <span className="flex items-center gap-2">
          ENGINE <Dot color={c.emerald} /> <span style={{ color: c.muted }}>active</span>
        </span>
        <span>PIPELINE <span style={{ color: c.muted }}>4 stages loaded</span></span>
        <span>LAST RUN <span style={{ color: c.muted }}>{elapsed ?? '--:--'}</span></span>
        <span>MODEL <span style={{ color: c.muted }}>gemini-3.6-flash</span></span>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------
   PIPELINE STAGES
--------------------------------------------------------------------- */
function PipelineStages({ activeIdx, loading }) {
  return (
    <div className="mt-10">
      <SectionLabel>Pipeline</SectionLabel>
      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PIPELINE.map((p, i) => {
          const isActive = loading && i === activeIdx
          const isDone = loading && i < activeIdx
          return (
            <div
              key={p.n}
              className="rounded-xl px-4 py-4 transition-colors"
              style={{
                border: `1px solid ${isActive ? c.blue : c.line}`,
                backgroundColor: isActive ? c.blueSoft : c.panel,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs" style={{ color: isActive ? c.blue : c.mutedDim }}>
                  {p.n}
                </span>
                {isActive && <Loader2 size={13} className="animate-spin" style={{ color: c.blue }} />}
                {isDone && <Check size={13} style={{ color: c.emerald }} />}
                {!isActive && !isDone && <ChevronRight size={13} style={{ color: c.mutedDim }} />}
              </div>
              <div className="mt-2 font-mono text-sm font-bold tracking-wide" style={{ color: c.text }}>
                {p.title}
              </div>
              <div className="mt-1 text-xs leading-relaxed" style={{ color: c.muted }}>
                {p.desc}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------
   FORMAT GRID
--------------------------------------------------------------------- */
function FormatGrid() {
  return (
    <div className="mt-10">
      <SectionLabel>Output formats</SectionLabel>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {FORMATS.map((f) => {
          const Icon = f.icon
          return (
            <div
              key={f.id}
              className="group rounded-xl p-4 transition-colors hover:cursor-default"
              style={{ border: `1px solid ${c.line}`, backgroundColor: c.panel }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: c.panel2, border: `1px solid ${c.line}`, color: c.blue }}
                >
                  <Icon size={16} />
                </div>
                <Pill tone="muted" outline={false}>{f.badge}</Pill>
              </div>
              <div className="mt-3 font-mono text-sm font-bold" style={{ color: c.text }}>
                {f.label}
              </div>
              <div className="font-mono text-xs" style={{ color: c.mutedDim }}>
                {f.vendor}
              </div>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: c.muted }}>
                {f.desc}
              </p>
              <div
                className="mt-3 flex items-center justify-between font-mono text-xs"
                style={{ color: c.mutedDim }}
              >
                <span className="flex items-center gap-1.5" style={{ color: c.emerald }}>
                  <Dot color={c.emerald} /> supported
                </span>
                <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------
   LOADING / EMPTY / ERROR
--------------------------------------------------------------------- */
function LoadingPanel({ stageIdx }) {
  return (
    <div
      className="mt-10 flex flex-col items-center justify-center gap-4 rounded-2xl py-16 animate-fadeUp"
      style={{ border: `1px solid ${c.line}`, backgroundColor: c.panel }}
    >
      <div
        className="relative flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: c.blueSoft }}
      >
        <span className="absolute inset-0 rounded-full animate-pulseRing" style={{ border: `1px solid ${c.blue}` }} />
        <Loader2 size={18} className="animate-spin" style={{ color: c.blue }} />
      </div>
      <p className="font-mono text-sm" style={{ color: c.muted }}>
        <span style={{ color: c.blue }}>&gt;</span> {STAGES[stageIdx]}
      </p>
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className="mt-10 rounded-2xl px-8 py-14 text-center"
      style={{ border: `1px dashed ${c.line2}`, backgroundColor: c.panel }}
    >
      <div
        className="mx-auto flex h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: c.panel2, border: `1px solid ${c.line}`, color: c.mutedDim }}
      >
        <Terminal size={17} />
      </div>
      <p className="mt-4 font-mono text-sm" style={{ color: c.muted }}>
        <span style={{ color: c.blue }}>&gt;</span> awaiting input
        <span className="cursor-blink" style={{ color: c.blue }}>▌</span>
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed" style={{ color: c.mutedDim }}>
        Describe a behavior, technique, or log pattern above. Every run outputs eight
        review-ready rules, self-checked before they reach you.
      </p>
    </div>
  )
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div
      className="mt-10 flex items-start gap-3 rounded-2xl px-5 py-4"
      style={{ border: `1px solid ${c.danger}55`, backgroundColor: c.dangerSoft }}
    >
      <AlertTriangle size={17} style={{ color: c.danger }} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <div className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: c.danger }}>
          generation failed
        </div>
        <p className="mt-1 text-sm" style={{ color: c.text }}>{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider"
          style={{ border: `1px solid ${c.danger}`, color: c.danger }}
        >
          <RotateCcw size={12} /> retry
        </button>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------
   RESULT PANEL
--------------------------------------------------------------------- */
function ResultPanel({ result, prompt, onReset }) {
  const [active, setActive] = useState('kql')
  const [copied, setCopied] = useState(false)

  const activeLangData = result.languages?.[active]
  const codeContent = activeLangData?.code || '// No code generated for this format.'

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codeContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  const activeFormat = FORMATS.find((f) => f.id === active)

  return (
    <div className="mt-10 animate-fadeUp">
      <div className="flex items-center justify-between">
        <SectionLabel>Result</SectionLabel>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 font-mono text-xs"
          style={{ color: c.mutedDim }}
        >
          <RotateCcw size={12} /> new query
        </button>
      </div>

      <p className="mt-2 truncate font-mono text-xs" style={{ color: c.mutedDim }}>
        <span style={{ color: c.blue }}>&gt;</span> {prompt}
      </p>

      <div
        className="mt-3 overflow-hidden rounded-2xl"
        style={{ border: `1px solid ${c.line}`, backgroundColor: c.panel }}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${c.line}`, backgroundColor: c.panel2 }}>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#ff5f57' }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#febc2e' }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#28c840' }} />
          </div>
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs"
            style={{ border: `1px solid ${c.line2}`, color: copied ? c.emerald : c.muted }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'copied' : 'copy'}
          </button>
        </div>

        <div className="flex flex-wrap gap-1 px-3 pt-3" style={{ borderBottom: `1px solid ${c.line}` }}>
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className="rounded-t-md px-3 py-1.5 font-mono text-xs font-semibold transition-colors"
              style={{
                color: active === f.id ? c.blue : c.mutedDim,
                borderBottom: active === f.id ? `2px solid ${c.blue}` : '2px solid transparent',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="px-4 py-2 text-xs font-mono flex items-center justify-between" style={{ color: c.mutedDim, backgroundColor: c.panel2 }}>
          <span>{activeFormat?.vendor}</span>
          {activeLangData?.notes && <span className="italic opacity-80">{activeLangData.notes}</span>}
        </div>

        <pre className="overflow-x-auto px-4 py-4 font-mono text-xs leading-relaxed" style={{ color: c.text }}>
          <code>{codeContent}</code>
        </pre>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------
   APP
--------------------------------------------------------------------- */
export default function App() {
  const [result, setResult] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [promptValue, setPromptValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stageIdx, setStageIdx] = useState(0)
  const [elapsed, setElapsed] = useState(null)
  const abortRef = useRef(null)
  const stageTimer = useRef(null)

  useEffect(() => () => {
    clearInterval(stageTimer.current)
    abortRef.current?.abort()
  }, [])

  const handleSubmit = useCallback(async (value) => {
    setLoading(true)
    setError(null)
    setStageIdx(0)
    setPrompt(value)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const startedAt = Date.now()
    clearInterval(stageTimer.current)
    stageTimer.current = setInterval(() => {
      setStageIdx((i) => Math.min(i + 1, STAGES.length - 1))
    }, 1800)

    try {
      const data = await generateRuleSet(value, { signal: controller.signal })
      setResult(data)
      setElapsed(`${((Date.now() - startedAt) / 1000).toFixed(1)}s`)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      clearInterval(stageTimer.current)
      setLoading(false)
    }
  }, [])

  const handleReset = () => {
    setResult(null)
    setError(null)
    setPrompt('')
    setPromptValue('')
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: c.void, color: c.text }}>
      <style>{`
        .glow-text {
          color: #fff;
          text-shadow: 0 0 6px ${c.blue}aa, 0 0 26px ${c.blue}66, 0 0 60px ${c.blue}33;
          animation: flickerIn 1.4s ease-out;
        }
        @keyframes flickerIn {
          0% { opacity: 0; filter: blur(6px); }
          55% { opacity: .6; }
          70% { opacity: .3; }
          100% { opacity: 1; filter: blur(0); }
        }
        .animate-fadeUp { animation: fadeUp .5s ease-out both; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pulseRing { animation: pulseRing 1.8s ease-out infinite; }
        @keyframes pulseRing {
          0% { transform: scale(0.9); opacity: .9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .cursor-blink { animation: blink 1.1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .glow-text, .animate-fadeUp, .animate-pulseRing, .cursor-blink { animation: none !important; }
        }
      `}</style>

      <Header />

      <main className="flex-1">
        <HeroAndForm 
          onSubmit={handleSubmit} 
          loading={loading} 
          promptValue={promptValue} 
          setPromptValue={setPromptValue} 
        />

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <StatStrip elapsed={elapsed} />
          <PipelineStages activeIdx={stageIdx} loading={loading} />

          {loading && <LoadingPanel stageIdx={stageIdx} />}
          {!loading && error && <ErrorBanner message={error} onRetry={handleReset} />}
          {!loading && !error && result && (
            <ResultPanel result={result} prompt={prompt} onReset={handleReset} />
          )}
          {!loading && !error && !result && <EmptyState />}

          <FormatGrid />
        </section>
      </main>
    </div>
  )
}