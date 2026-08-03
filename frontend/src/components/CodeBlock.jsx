import { useState } from 'react'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import kusto from 'react-syntax-highlighter/dist/esm/languages/prism/kusto'
import splunkSpl from 'react-syntax-highlighter/dist/esm/languages/prism/splunk-spl'
import clike from 'react-syntax-highlighter/dist/esm/languages/prism/clike'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy, Download } from 'lucide-react'

SyntaxHighlighter.registerLanguage('sql', sql)
SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('yaml', yaml)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('kusto', kusto)
SyntaxHighlighter.registerLanguage('splunk-spl', splunkSpl)
SyntaxHighlighter.registerLanguage('clike', clike)

const theme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: 'transparent',
    margin: 0,
    padding: '1.25rem',
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: 'transparent',
  },
}

export default function CodeBlock({ code, language, filename }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  }

  function handleDownload() {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative rounded-xl border border-ink-600/60 bg-ink-900/80 overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink-600/60 bg-ink-850/80 px-4 py-2">
        <span className="font-mono text-xs text-slate-400">{filename}</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-ink-700/70 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check size={13} className="text-accent-400" />
                <span className="text-accent-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                Copy
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-ink-700/70 hover:text-white transition-colors"
          >
            <Download size={13} />
            Download
          </button>
        </div>
      </div>
      <div className="max-h-[520px] overflow-auto text-[13px] leading-relaxed">
        <SyntaxHighlighter language={language} style={theme} showLineNumbers wrapLongLines={false}>
          {code || ''}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
