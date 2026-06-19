export interface MCP {
  id: string;
  name: string;
  description: string;
  explicitCapabilities: string[];
  implicitCapabilities: { name: string; description: string }[];
  version: string;
  status: 'active' | 'deprecated' | 'experimental';
}

export interface Goal {
  id: string;
  title: string;
  status: 'pending' | 'analyzing' | 'complete';
}

export const initialMCPs: MCP[] = [
  {
    id: 'mcp-001',
    name: 'GitHub API Bridge',
    description: 'Managed capability for read/write access to repository structures and workflow states.',
    explicitCapabilities: ['Repo Listing', 'Commit History', 'Issue Management'],
    implicitCapabilities: [],
    version: '1.2.0',
    status: 'active',
  },
  {
    id: 'mcp-002',
    name: 'Postgres Vector Connector',
    description: 'Interface for high-dimensional vector search and persistent embedding storage.',
    explicitCapabilities: ['Vector Search', 'SQL Querying', 'Data Indexing'],
    implicitCapabilities: [],
    version: '0.9.5',
    status: 'experimental',
  },
  {
    id: 'mcp-003',
    name: 'Slack Notification Engine',
    description: 'Automated messaging and event-driven alerting for workspace collaboration.',
    explicitCapabilities: ['Message Dispatch', 'Channel Management', 'User Presence'],
    implicitCapabilities: [],
    version: '2.0.1',
    status: 'active',
  },
  {
    id: 'mcp-004',
    name: 'Linear Project Sync',
    description: 'Capability for syncing project tasks, teams, and milestones with external tools.',
    explicitCapabilities: ['Issue Tracking', 'Milestone Planning', 'Team Analytics'],
    implicitCapabilities: [],
    version: '1.1.0',
    status: 'active',
  }
];

export const initialGoals: Goal[] = [
  { id: 'g-001', title: 'Automated Code Review Pipeline with Slack Alerts', status: 'pending' },
  { id: 'g-002', title: 'Knowledge Base semantic search across multiple data sources', status: 'pending' },
  { id: 'g-003', title: 'Automated developer onboarding via GitHub and Linear integration', status: 'pending' },
];
