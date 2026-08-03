// Canonical metadata for every detection language the app supports.
// Adding a new output format later means adding one entry here and
// updating the worker's system prompt / schema — the UI adapts automatically.
// Canonical metadata for every detection language the app supports.
import { Search, Terminal, Radar, GitBranch, Layers, Database, ShieldAlert, Code2 } from 'lucide-react'

export const FORMATS = [
  { id: 'kql', label: 'KQL', vendor: 'Microsoft Sentinel / Defender', badge: 'SIEM', icon: Search, desc: 'Query language for Sentinel and Defender XDR hunting and analytics rules.' },
  { id: 'spl', label: 'SPL', vendor: 'Splunk', badge: 'SIEM', icon: Terminal, desc: "Splunk's search processing language for correlation and saved searches." },
  { id: 'xql', label: 'XQL', vendor: 'Cortex XDR', badge: 'XDR', icon: Radar, desc: 'Cortex XDR query language for cross-telemetry hunting and rules.' },
  { id: 'eql', label: 'EQL', vendor: 'Elastic Security', badge: 'EDR', icon: GitBranch, desc: "Elastic's event query language for sequence and correlation detections." },
  { id: 'sql', label: 'SQL', vendor: 'Data lake / warehouse', badge: 'DATA', icon: Layers, desc: 'Standard SQL for detections run against a data lake or warehouse.' },
  { id: 'aql', label: 'AQL', vendor: 'IBM QRadar', badge: 'SIEM', icon: Database, desc: "QRadar's Ariel Query Language for searching normalized events and flows." },
  { id: 'cql', label: 'Trend Micro', vendor: 'Vision One', badge: 'XDR', icon: ShieldAlert, desc: "Vision One's query syntax for cross-layer detection and response." },
  { id: 'python', label: 'Python', vendor: 'SOAR / automation', badge: 'SCRIPT', icon: Code2, desc: 'Standalone enrichment or automation logic for SOAR playbooks.' },
]