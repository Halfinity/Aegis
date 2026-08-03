// Canonical metadata for every detection language the app supports.
// Adding a new output format later means adding one entry here and
// updating the worker's system prompt / schema — the UI adapts automatically.
export const LANGUAGES = [
  { id: 'sigma', label: 'Sigma', group: 'Generic', ext: 'yml', prism: 'yaml', blurb: 'Vendor-agnostic YAML rule format.' },
  { id: 'kql', label: 'KQL', group: 'Microsoft Sentinel', ext: 'kql', prism: 'kusto', blurb: 'Kusto Query Language for Sentinel.' },
  { id: 'spl', label: 'SPL', group: 'Splunk', ext: 'spl', prism: 'splunk-spl', blurb: 'Search Processing Language for Splunk.' },
  { id: 'yaral', label: 'YARA-L 2.0', group: 'Google SecOps', ext: 'yaral', prism: 'clike', blurb: 'YARA-L 2.0 for Google SecOps.' },
  { id: 'xql', label: 'XQL', group: 'Cortex XDR', ext: 'xql', prism: 'sql', blurb: 'Extended Query Language for Cortex XDR.' },
  { id: 'eql', label: 'EQL', group: 'Elastic', ext: 'eql', prism: 'sql', blurb: 'Event Query Language for Elastic.' },
  { id: 'sql', label: 'SQL', group: 'Generic', ext: 'sql', prism: 'sql', blurb: 'Standard ANSI SQL query.' },
  { id: 'python', label: 'Python', group: 'Generic', ext: 'py', prism: 'python', blurb: 'Standalone Python detection logic.' },
  { id: 'aql', label: 'AQL', group: 'IBM QRadar', ext: 'aql', prism: 'sql', blurb: 'Ariel Query Language for QRadar.' },
  { id: 'defender_kql', label: 'Defender KQL', group: 'Microsoft Defender', ext: 'kql', prism: 'kusto', blurb: 'Advanced Hunting KQL for Defender XDR.' },
]

export const LANGUAGE_MAP = Object.fromEntries(LANGUAGES.map((l) => [l.id, l]))