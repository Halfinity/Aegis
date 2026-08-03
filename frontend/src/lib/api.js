// Talks to the Cloudflare Worker that proxies requests to the Claude API.
// The worker holds the Anthropic API key server-side — the frontend never
// sees or sends any secret.

const DEFAULT_ENDPOINT = 'http://127.0.0.1:8787/generate'

function resolveEndpoint() {
  // Vite exposes build-time env vars prefixed with VITE_.
  // Set VITE_API_ENDPOINT in frontend/.env(.production) to your deployed
  // Worker URL, e.g. https://detection-rule-forge.<you>.workers.dev/generate
  const fromEnv = import.meta.env?.VITE_API_ENDPOINT
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_ENDPOINT
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function generateRuleSet(prompt, { signal } = {}) {
  const endpoint = resolveEndpoint()

  let res
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError(
      `Could not reach the generation service at ${endpoint}. Is the Worker deployed and VITE_API_ENDPOINT set correctly?`,
      0,
    )
  }

  let body
  try {
    body = await res.json()
  } catch {
    throw new ApiError('The generation service returned a non-JSON response.', res.status)
  }

  if (!res.ok) {
    throw new ApiError(body?.error || `Request failed with status ${res.status}.`, res.status)
  }

  return body
}
