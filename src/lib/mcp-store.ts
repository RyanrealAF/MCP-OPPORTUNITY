
/**
 * @fileOverview Type definitions for the MCP ecosystem data models.
 */

export interface MCP {
  id: string;
  name: string;
  description: string;
  explicitCapabilities: string[];
  implicitCapabilities: { name: string; description: string }[];
  version: string;
  status: 'active' | 'deprecated' | 'experimental';
  updatedAt?: any;
}

export interface Goal {
  id: string;
  title: string;
  status: 'pending' | 'analyzing' | 'complete';
  updatedAt?: any;
}

export interface SimulationResult {
  name: string;
  description: string;
  combinedMcps: string[];
  combinedCapabilities: string[];
  noveltyRank: number;
}

export interface Simulation {
  id: string;
  timestamp: any;
  results: SimulationResult[];
}
