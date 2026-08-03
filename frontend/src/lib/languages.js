// Canonical metadata for every detection language the app supports.
// Adding a new output format later means adding one entry here and
// updating the worker's system prompt / schema — the UI adapts automatically.
// Canonical metadata for every detection language the app supports.
export const LANGUAGES = [
  { id: 'kql', label: 'KQL', group: 'Microsoft Sentinel', ext: 'kql', prism: 'kusto', blurb: 'Kusto Query Language for Sentinel.' },
  { id: 'spl', label: 'SPL', group: 'Splunk', ext: 'spl', prism: 'splunk-spl', blurb: 'Search Processing Language for Splunk.' },
  { id: 'xql', label: 'XQL', group: 'Cortex XDR', ext: 'xql', prism: 'sql', blurb: 'Extended Query Language for Cortex XDR.' },
  { id: 'eql', label: 'EQL', group: 'Elastic', ext: 'eql', prism: 'sql', blurb: 'Event Query Language for Elastic.' },
  { id: 'sql', label: 'SQL', group: 'Generic', ext: 'sql', prism: 'sql', blurb: 'Standard ANSI SQL query.' },
  { id: 'aql', label: 'AQL', group: 'IBM QRadar', ext: 'aql', prism: 'sql', blurb: 'Ariel Query Language for QRadar.' },
  { id: 'trendmicro', label: 'CQL', group: 'Trend Micro', ext: 'txt', prism: 'sql', blurb: 'Trend Micro Vision One Search Query Language.' },
  { id: 'python', label: 'Python', group: 'Generic', ext: 'py', prism: 'python', blurb: 'Standalone Python detection logic.' },
]

export const LANGUAGE_MAP = Object.fromEntries(LANGUAGES.map((l) => [l.id, l]))