// Cloudflare Worker: proxies detection-rule generation requests to the
// Google Gemini API using stable single-turn generation payloads and auto-repairing JSON.

import { AUTHOR_SYSTEM_PROMPT, QA_SYSTEM_PROMPT } from './prompts.js'
import { validateRuleSet } from './schema.js'

const MAX_PROMPT_LENGTH = 800
const MAX_AUTHOR_ATTEMPTS = 3

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

/** Strips markdown fences, repairs minor trailing commas or formatting issues, and parses JSON. */
function extractJson(text) {
  let cleaned = text.trim()
  cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in model response.')
  }
  
  const jsonString = cleaned.slice(start, end + 1)
  
  try {
    return JSON.parse(jsonString)
  } catch (e) {
    // Attempt auto-repair for common LLM JSON syntax errors (trailing commas)
    const repaired = jsonString
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
    try {
      return JSON.parse(repaired)
    } catch (e2) {
      throw e // Throw original error if repair fails
    }
  }
}

async function callGemini(env, { systemInstruction, promptText }) {
  const modelName = env.MODEL_ID || 'gemini-1.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${env.GEMINI_API_KEY}`

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: promptText }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 16384,
    }
  }

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const rawText = await res.text()
  if (!res.ok) {
    throw new Error(`Gemini API error (${res.status}): ${rawText.slice(0, 300)}`)
  }

  let data
  try {
    data = JSON.parse(rawText)
  } catch {
    throw new Error('Failed to parse Gemini API response JSON.')
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error('Gemini API returned no text content (possible safety block or empty output).')
  }
  return text
}

/** Pass 1: draft the rule set. Retries with error feedback if JSON is malformed/invalid. */
async function runAuthorPass(env, userPrompt) {
  let currentPrompt = `Detection request: "${userPrompt}"`
  let lastError = null

  for (let attempt = 1; attempt <= MAX_AUTHOR_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      currentPrompt = `Detection request: "${userPrompt}"\n\nYour previous response was invalid: ${lastError}. Return ONLY the corrected valid JSON object matching the required schema, no other text.`
    }

    try {
      const text = await callGemini(env, { 
        systemInstruction: AUTHOR_SYSTEM_PROMPT, 
        promptText: currentPrompt 
      })
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

/** Pass 2: independent QA review. Falls back to pass-1 output on any failure. */
async function runQaPass(env, draft) {
  try {
    const text = await callGemini(env, {
      systemInstruction: QA_SYSTEM_PROMPT,
      promptText: `Review and refine this detection rule set JSON:\n${JSON.stringify(draft)}`
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
  if (!env.GEMINI_API_KEY) {
    return json({ error: 'Server misconfiguration: GEMINI_API_KEY is not set.' }, 500, origin)
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
    
    // Handle POST requests sent to either root '/' or '/generate'
    if ((url.pathname === '/' || url.pathname === '/generate') && request.method === 'POST') {
      return handleGenerate(request, env, origin)
    }
    if (url.pathname === '/health') {
      return json({ status: 'ok', service: 'detection-rule-forge-worker-gemini' }, 200, origin)
    }
    return json({ error: 'Not found.' }, 404, origin)
  },
}