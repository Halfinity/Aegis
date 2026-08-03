// Cloudflare Worker: proxies detection-rule generation requests to the
// Claude API, holding the API key server-side, and runs a two-pass
// generate-then-review pipeline before returning a result to the frontend.

import { AUTHOR_SYSTEM_PROMPT, QA_SYSTEM_PROMPT } from './prompts.js'
import { validateRuleSet } from './schema.js'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'
const MAX_PROMPT_LENGTH = 800
const MAX_AUTHOR_ATTEMPTS = 3
const MAX_TOKENS = 8192

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

/** Strips accidental markdown fences and extracts the outermost JSON object. */
function extractJson(text) {
  let cleaned = text.trim()
  cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in model response.')
  }
  return JSON.parse(cleaned.slice(start, end + 1))
}

async function callClaude(env, { system, messages }) {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: env.MODEL_ID || 'claude-sonnet-5',
      max_tokens: MAX_TOKENS,
      temperature: 0.2,
      system,
      messages,
    }),
  })

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    throw new Error(`Claude API error (${res.status}): ${errBody.slice(0, 300)}`)
  }

  const data = await res.json()
  const text = data?.content?.find((b) => b.type === 'text')?.text
  if (!text) throw new Error('Claude API returned no text content.')
  return text
}

/** Pass 1: draft the rule set. Retries with error feedback if JSON is malformed/invalid. */
async function runAuthorPass(env, userPrompt) {
  const messages = [{ role: 'user', content: `Detection request: "${userPrompt}"` }]
  let lastError = null

  for (let attempt = 1; attempt <= MAX_AUTHOR_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      messages.push({
        role: 'user',
        content: `Your previous response was invalid: ${lastError}. Return ONLY the corrected JSON object, no other text.`,
      })
    }
    const text = await callClaude(env, { system: AUTHOR_SYSTEM_PROMPT, messages })
    messages.push({ role: 'assistant', content: text })

    try {
      const parsed = extractJson(text)
      const { valid, errors } = validateRuleSet(parsed)
      if (valid) return parsed
      lastError = errors.join('; ')
    } catch (err) {
      lastError = err.message
    }
  }

  throw new Error(`Failed to produce a valid rule set after ${MAX_AUTHOR_ATTEMPTS} attempts: ${lastError}`)
}

/** Pass 2: independent QA review. Falls back to pass-1 output (marked unverified) on any failure. */
async function runQaPass(env, draft) {
  try {
    const text = await callClaude(env, {
      system: QA_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: JSON.stringify(draft) }],
    })
    const parsed = extractJson(text)
    const { valid, errors } = validateRuleSet(parsed)
    if (!valid) throw new Error(errors.join('; '))
    if (!parsed.validation) {
      parsed.validation = { pass: true, notes: 'QA pass completed.', issues_fixed: [] }
    }
    return parsed
  } catch (err) {
    return {
      ...draft,
      validation: {
        pass: false,
        notes: `Automated QA pass could not complete (${err.message}). Review this rule set manually before deploying.`,
        issues_fixed: [],
      },
    }
  }
}

async function handleGenerate(request, env, origin) {
  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400, origin)
  }

  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : ''
  if (!prompt) return json({ error: 'Missing "prompt" string.' }, 400, origin)
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return json({ error: `Prompt too long (max ${MAX_PROMPT_LENGTH} characters).` }, 400, origin)
  }
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: 'Server misconfiguration: ANTHROPIC_API_KEY is not set.' }, 500, origin)
  }

  try {
    const draft = await runAuthorPass(env, prompt)
    const reviewed = await runQaPass(env, draft)
    return json(reviewed, 200, origin)
  } catch (err) {
    return json({ error: err.message || 'Unknown error generating rules.' }, 502, origin)
  }
}

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN && env.ALLOWED_ORIGIN !== '*' ? env.ALLOWED_ORIGIN : '*'

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    const url = new URL(request.url)
    if (url.pathname === '/generate' && request.method === 'POST') {
      return handleGenerate(request, env, origin)
    }
    if (url.pathname === '/' || url.pathname === '/health') {
      return json({ status: 'ok', service: 'detection-rule-forge-worker' }, 200, origin)
    }
    return json({ error: 'Not found.' }, 404, origin)
  },
}
