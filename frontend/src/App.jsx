import { useCallback, useRef, useState } from 'react'
import Header from './components/Header'
import PromptForm from './components/PromptForm'
import ResultPanel from './components/ResultPanel'
import EmptyState from './components/EmptyState'
import ErrorBanner from './components/ErrorBanner'
import { generateRuleSet, ApiError } from './lib/api'
import { Loader2 } from 'lucide-react'

const STAGES = [
  'Parsing detection intent…',
  'Drafting rule logic across all languages…',
  'Running AI QA / self-review pass…',
  'Finalizing output…',
]

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stageIdx, setStageIdx] = useState(0)
  const abortRef = useRef(null)
  const stageTimer = useRef(null)

  const handleSubmit = useCallback(async (prompt) => {
    setLoading(true)
    setError(null)
    setStageIdx(0)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    clearInterval(stageTimer.current)
    stageTimer.current = setInterval(() => {
      setStageIdx((i) => Math.min(i + 1, STAGES.length - 1))
    }, 2200)

    try {
      const data = await generateRuleSet(prompt, { signal: controller.signal })
      setResult(data)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      clearInterval(stageTimer.current)
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-fade" />
          <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-10 sm:pt-24 sm:pb-14">
            <div className="mx-auto max-w-2xl text-center animate-fade-up">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-600/60 bg-ink-900/60 px-3 py-1 text-[11px] font-medium text-accent-400 cyber-badge">
                Multi-format · Autonomous · SOC-Ready
              </span>
              <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
                Natural Language in.<br />Production SIEM Logic out.
              </h1>
              <p className="mt-4 text-base text-slate-400">
                Transform threat descriptions into production-grade detection logic across KQL, SPL, XQL, EQL, SQL, AQL, Trend Micro, and Python.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-3xl">
              <PromptForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-ink-600/60 bg-ink-900/40 py-16 animate-fade-up">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/10 animate-pulse-ring">
                <Loader2 size={20} className="animate-spin text-accent-400" />
              </div>
              <p className="text-sm text-slate-400 font-mono">{STAGES[stageIdx]}</p>
            </div>
          )}

          {!loading && error && <ErrorBanner message={error} />}

          {!loading && !error && result && <ResultPanel result={result} />}

          {!loading && !error && !result && <EmptyState />}
        </section>
      </main>
    </div>
  )
}