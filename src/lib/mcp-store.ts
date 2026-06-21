/**
 * @fileOverview Type definitions for the MCP ecosystem data models.
 */

export type RepositoryTarget = 'BWB-ROOT' | 'BWB-CODE-ASSISTANT' | 'BWB-MCP-SERVER';

export interface MCP {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
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

export interface EvolutionPatch {
  target: RepositoryTarget;
  description: string;
  code: string;
  filesAffected: string[];
  impactAnalysis: string;
}

/**
 * Interface representing the output of the Evolution Agent.
 * Synchronized with the Genkit EvolutionAgentOutput type.
 */
export interface EvolutionAgentOutput {
  patchDescription: string;
  code: string;
  filesAffected: string[];
  impactAnalysis: string;
  target: RepositoryTarget;
}
