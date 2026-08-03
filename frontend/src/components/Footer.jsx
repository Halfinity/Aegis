export default function Footer() {
  return (
    <footer className="border-t border-ink-600/40 py-8 mt-16">
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p>Detection Rule Forge — always review generated rules against your own environment before deploying to production.</p>
        <p>Built with Claude · MIT Licensed</p>
      </div>
    </footer>
  )
}
