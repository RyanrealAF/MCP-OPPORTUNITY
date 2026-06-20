/**
 * @fileOverview Type definitions for the MCP ecosystem data models.
 * All mock initializations have been removed for production.
 */

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
