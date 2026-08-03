// Canonical metadata for every detection language the app supports.
// Adding a new output format later means adding one entry here and
// updating the worker's system prompt / schema — the UI adapts automatically.
export const LANGUAGES = [
  {
    id: 'sigma',
    label: 'Sigma',
    group: 'Generic',
    ext: 'yml',
    prism: 'yaml',
    blurb: 'Vendor-agnostic YAML rule format, convertible to most SIEMs.',
  },
  {
    id: 'kql',
    label: 'KQL',
    group: 'Microsoft Sentinel',
    ext: 'kql',
    prism: 'kusto',
    blurb: 'Kusto Query Language for Microsoft Sentinel / Log Analytics.',
  },
  {
    id: 'spl',
    label: 'SPL',
    group: 'Splunk',
    ext: 'spl',
    prism: 'splunk-spl',
    blurb: 'Search Processing Language for Splunk Enterprise Security.',
  },
  {
    id: 'yaral',
    label: 'YARA-L 2.0',
    group: 'Google SecOps',
    ext: 'yaral',
    prism: 'clike',
    blurb: 'YARA-L 2.0 rule for Google Security Operations (Chronicle).',
  },
  {
    id: 'xql',
    label: 'XQL',
    group: 'Cortex XDR',
    ext: 'xql',
    prism: 'sql',
    blurb: 'Extended Query Language for Palo Alto Cortex XDR/XSIAM.',
  },
  {
    id: 'eql',
    label: 'EQL',
    group: 'Elastic',
    ext: 'eql',
    prism: 'sql',
    blurb: 'Event Query Language for the Elastic Stack.',
  },
  {
    id: 'esql_dsl',
    label: 'Elasticsearch DSL',
    group: 'Elastic',
    ext: 'json',
    prism: 'json',
    blurb: 'Elasticsearch Query DSL, ready for a detection rule or saved search.',
  },
  {
    id: 'sql',
    label: 'SQL',
    group: 'Generic',
    ext: 'sql',
    prism: 'sql',
    blurb: 'Standard SQL against a normalized log/event table.',
  },
  {
    id: 'python',
    label: 'Python',
    group: 'Generic',
    ext: 'py',
    prism: 'python',
    blurb: 'Standalone Python detection function over structured log events.',
  },
]

export const LANGUAGE_MAP = Object.fromEntries(LANGUAGES.map((l) => [l.id, l]))
