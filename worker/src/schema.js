// Canonical response schema shared by the generation prompt, the QA prompt,
// and the server-side structural validator. Keep this in sync with
// frontend/src/lib/languages.js when adding a new output language.

export const LANGUAGE_IDS = [
  'kql',
  'spl',
  'xql',
  'eql',
  'sql',
  'aql',
  'trendmicro',
  'python',
]

export const JSON_SHAPE = `{
  "title": string,
  "description": string,
  "severity": "critical"|"high"|"medium"|"low"|"informational",
  "mitre_attack": string[],
  "log_sources": string[],
  "false_positives": string[],
  "languages": {
    "kql":        { "code": string, "notes": string },
    "spl":        { "code": string, "notes": string },
    "xql":        { "code": string, "notes": string },
    "eql":        { "code": string, "notes": string },
    "sql":        { "code": string, "notes": string },
    "aql":        { "code": string, "notes": string },
    "trendmicro": { "code": string, "notes": string },
    "python":     { "code": string, "notes": string }
  }
}`

export const SEVERITIES = ['critical', 'high', 'medium', 'low', 'informational']

/**
 * Validates the structural shape of a rule-set object returned by the model.
 * Returns { valid: boolean, errors: string[] }.
 * This is deliberately permissive about prose fields and strict about the
 * one thing that actually breaks the UI: every language having a code string.
 */
export function validateRuleSet(obj) {
  const errors = []
  if (!obj || typeof obj !== 'object') {
    return { valid: false, errors: ['Response is not a JSON object.'] }
  }
  if (!obj.title || typeof obj.title !== 'string') errors.push('Missing "title" string.')
  if (!obj.description || typeof obj.description !== 'string') errors.push('Missing "description" string.')
  if (!SEVERITIES.includes((obj.severity || '').toLowerCase())) {
    errors.push(`"severity" must be one of ${SEVERITIES.join(', ')}.`)
  }
  if (!obj.languages || typeof obj.languages !== 'object') {
    errors.push('Missing "languages" object.')
  } else {
    for (const id of LANGUAGE_IDS) {
      const block = obj.languages[id]
      if (!block || typeof block.code !== 'string' || !block.code.trim()) {
        errors.push(`languages.${id}.code is missing or empty.`)
      }
    }
  }
  return { valid: errors.length === 0, errors }
}