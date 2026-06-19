"use client";

import React, { useState } from 'react';
import { initialMCPs, initialGoals, MCP } from '@/lib/mcp-store';
import { 
  Terminal, 
  Database, 
  Cpu, 
  GitBranch, 
  Package, 
  Target, 
  AlertTriangle,
  LayoutGrid,
  FileSearch,
  Settings2,
  ExternalLink,
  Plus,
  Layers,
  Clock
} from 'lucide-react';
import { KnowledgeGraph } from '@/components/dashboard/KnowledgeGraph';
import { AgentPanel } from '@/components/dashboard/AgentPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// AI Flow imports
import { identifyImplicitCapabilities } from '@/ai/flows/identify-implicit-capabilities-flow';
import { identifyMissingToolsForGoals } from '@/ai/flows/identify-missing-tools-for-goals';
import { generateNovelSystems } from '@/ai/flows/generate-novel-systems';

export default function MOEPage() {
  const [mcps, setMcps] = useState<MCP[]>(initialMCPs);
  const [goals, setGoals] = useState(initialGoals);
  
  // Agent states
  const [capResults, setCapResults] = useState<any>(null);
  const [collResults, setCollResults] = useState<any>(null);
  const [intentResults, setIntentResults] = useState<any>(null);
  
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const toggleLoading = (agent: string, state: boolean) => {
    setLoadingStates(prev => ({ ...prev, [agent]: state }));
  };

  const runCapabilityAgent = async () => {
    toggleLoading('capability', true);
    try {
      const desc = mcps.map(m => `${m.name}: ${m.description}`).join('\n');
      const result = await identifyImplicitCapabilities({ mcpDescriptions: desc });
      setCapResults(result);
      
      // Update local graph with implicit findings
      if (result.implicitCapabilities?.length > 0) {
        setMcps(prev => prev.map((m, i) => i === 0 ? {
          ...m, 
          implicitCapabilities: [...m.implicitCapabilities, ...result.implicitCapabilities.slice(0, 2)]
        } : m));
      }
    } finally {
      toggleLoading('capability', false);
    }
  };

  const runCollisionAgent = async () => {
    toggleLoading('collision', true);
    try {
      const mcpDescs = mcps.map(m => m.description);
      const capDescs = mcps.flatMap(m => m.explicitCapabilities);
      const result = await generateNovelSystems({ 
        mcpDescriptions: mcpDescs,
        capabilityDescriptions: capDescs,
        contextOrConstraints: "Focus on AI-driven devops orchestration"
      });
      setCollResults(result);
    } finally {
      toggleLoading('collision', false);
    }
  };

  const runIntentAgent = async () => {
    toggleLoading('intent', true);
    try {
      const result = await identifyMissingToolsForGoals({
        goals: goals.map(g => g.title),
        existingCapabilities: mcps.flatMap(m => m.explicitCapabilities)
      });
      setIntentResults(result);
    } finally {
      toggleLoading('intent', false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background font-body select-none overflow-hidden">
      {/* Top Header Layer: Navigation and Global State */}
      <header className="h-12 border-b border-border bg-card flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-background" />
            </div>
            <h1 className="font-code text-sm font-bold tracking-tighter uppercase text-primary">MOE // OP-ENGINE</h1>
          </div>
          <Separator orientation="vertical" className="h-6 mx-2 opacity-50" />
          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 text-[11px] font-code uppercase text-primary bg-primary/10 rounded-none border-b-2 border-primary">Dashboard</Button>
            <Button variant="ghost" size="sm" className="h-8 text-[11px] font-code uppercase text-muted-foreground hover:text-foreground rounded-none">Registry</Button>
            <Button variant="ghost" size="sm" className="h-8 text-[11px] font-code uppercase text-muted-foreground hover:text-foreground rounded-none">Graph Explorer</Button>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[9px] font-code text-muted-foreground uppercase leading-none">Graph Density</div>
              <div className="text-xs font-code text-primary leading-none">0.842 η</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-code text-muted-foreground uppercase leading-none">MCP Nodes</div>
              <div className="text-xs font-code text-primary leading-none">{mcps.length} Active</div>
            </div>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-none border-border">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </header>

      {/* Main Workspace: 3-Column Industrial Layout */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Core (Registry & Inventory) */}
        <div className="w-[320px] border-r border-border flex flex-col shrink-0 bg-muted/10">
          <div className="p-3 bg-muted/20 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-code uppercase text-muted-foreground">
              <Database className="w-3.5 h-3.5" />
              <span>Core Registry</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {mcps.map(mcp => (
                <div key={mcp.id} className="industrial-panel p-2 mb-2 group hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-code text-muted-foreground uppercase tracking-widest">{mcp.id}</span>
                    <Badge variant={mcp.status === 'active' ? 'secondary' : 'outline'} className="text-[8px] h-3 px-1 rounded-none border-border">
                      {mcp.status}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1 font-headline truncate">{mcp.name}</h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 font-body mb-2 leading-tight">
                    {mcp.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {mcp.explicitCapabilities.slice(0, 2).map(cap => (
                      <span key={cap} className="text-[9px] font-code px-1 bg-muted text-muted-foreground border border-border">
                        {cap}
                      </span>
                    ))}
                    {mcp.explicitCapabilities.length > 2 && (
                      <span className="text-[9px] font-code px-1 text-muted-foreground">+{mcp.explicitCapabilities.length - 2} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-border bg-muted/20">
            <div className="text-[9px] font-code text-muted-foreground uppercase mb-2">System Goals</div>
            <div className="space-y-1">
              {goals.map(goal => (
                <div key={goal.id} className="flex items-start gap-2 p-1.5 border border-border/50 bg-background/50">
                  <Target className="w-3 h-3 text-primary mt-0.5" />
                  <span className="text-[10px] text-foreground font-body leading-tight">{goal.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Experience & Intelligence (Visualization & Analytics) */}
        <div className="flex-1 flex flex-col bg-background relative">
          {/* Top Panel: The Knowledge Graph */}
          <div className="p-3-flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[11px] font-code uppercase text-muted-foreground">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Experience Layer: Shared Knowledge Graph</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] font-code text-primary">
                  <div className="w-2 h-2 rounded-full border border-primary flex items-center justify-center">
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                  </div>
                  <span>ACTIVE REASONING</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative flex flex-col gap-3 overflow-hidden">
              <KnowledgeGraph mcps={mcps} />
              
              {/* Dashboard Matrix */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Network Latency', value: '14ms', unit: 'ms', trend: 'down' },
                  { label: 'Reasoning Depth', value: '0.94', unit: 'σ', trend: 'up' },
                  { label: 'Collision Prob.', value: '18.4%', unit: '%', trend: 'up' },
                  { label: 'Gap Criticality', value: 'HIGH', unit: '', trend: 'none' },
                ].map(stat => (
                  <div key={stat.label} className="industrial-panel p-2 bg-muted/10">
                    <div className="text-[9px] font-code text-muted-foreground uppercase">{stat.label}</div>
                    <div className="text-lg font-code text-primary leading-tight mt-1">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Intelligence Report Viewer */}
              <div className="flex-1 industrial-panel bg-muted/5 flex flex-col overflow-hidden">
                <div className="p-2 border-b border-border bg-muted/20 flex items-center gap-2 text-[10px] font-code uppercase text-muted-foreground">
                  <FileSearch className="w-3 h-3" />
                  <span>Integrated Intelligence Feed</span>
                </div>
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-4">
                    {!capResults && !collResults && !intentResults && (
                      <div className="flex flex-col items-center justify-center h-48 opacity-20 text-center">
                        <Terminal className="w-8 h-8 mb-2" />
                        <p className="font-code text-xs">AWAITING AGENT INPUT STREAMS...</p>
                      </div>
                    )}
                    
                    {capResults && (
                      <div className="border-l-2 border-primary pl-3 py-1 bg-primary/5 mb-4">
                        <h4 className="text-[11px] font-code uppercase text-primary mb-1">Implicit Capability Expansion</h4>
                        <div className="space-y-2">
                          {capResults.implicitCapabilities.map((ic: any, idx: number) => (
                            <div key={idx} className="bg-background border border-border p-2">
                              <div className="text-[10px] font-bold text-foreground font-headline mb-0.5">{ic.name}</div>
                              <div className="text-[10px] text-muted-foreground font-body leading-relaxed">{ic.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {collResults && (
                      <div className="border-l-2 border-chart-2 pl-3 py-1 bg-chart-2/5 mb-4">
                        <h4 className="text-[11px] font-code uppercase text-chart-2 mb-1">Novel System Collisions</h4>
                        <div className="space-y-2">
                          {collResults.novelSystems.map((ns: any, idx: number) => (
                            <div key={idx} className="bg-background border border-border p-2">
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-[10px] font-bold text-foreground font-headline">{ns.name}</div>
                                <div className="text-[10px] font-code text-chart-2">RANK: {ns.noveltyRank}</div>
                              </div>
                              <div className="text-[10px] text-muted-foreground font-body leading-relaxed mb-2">{ns.description}</div>
                              <div className="flex flex-wrap gap-1">
                                {ns.combinedMcps.map((mcp: string) => (
                                  <span key={mcp} className="text-[8px] font-code px-1 border border-border/50 text-muted-foreground bg-muted/20">{mcp}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {intentResults && (
                      <div className="border-l-2 border-chart-3 pl-3 py-1 bg-chart-3/5">
                        <h4 className="text-[11px] font-code uppercase text-chart-3 mb-1">Intent Gap Analysis</h4>
                        <div className="bg-background border border-border p-2">
                          <div className="text-[10px] text-muted-foreground font-body leading-relaxed mb-3">{intentResults.reasoning}</div>
                          <div className="grid grid-cols-1 gap-1">
                            {intentResults.missingTools.map((tool: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 p-1.5 bg-muted/20 border border-border/30">
                                <AlertTriangle className="w-3 h-3 text-chart-3" />
                                <span className="text-[10px] font-code text-foreground">{tool}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Intelligence (Agents) */}
        <div className="w-[300px] border-l border-border flex flex-col shrink-0 bg-muted/10">
          <div className="p-3 bg-muted/20 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-code uppercase text-muted-foreground">
              <Cpu className="w-3.5 h-3.5" />
              <span>Intelligence Layer</span>
            </div>
          </div>
          <ScrollArea className="flex-1 p-2">
            <div className="flex flex-col gap-3">
              <AgentPanel 
                name="Capability Agent"
                icon={<GitBranch className="w-3.5 h-3.5" />}
                description="Decides when to expand explicit capabilities into implicit potential by exploring the knowledge graph."
                onExecute={runCapabilityAgent}
                loading={loadingStates['capability']}
              />
              <AgentPanel 
                name="Collision Agent"
                icon={<Layers className="w-3.5 h-3.5" />}
                description="Performs combinatorial reasoning to generate novel systems and project ideas using the novelty ranker."
                onExecute={runCollisionAgent}
                loading={loadingStates['collision']}
              />
              <AgentPanel 
                name="Intent Agent"
                icon={<Target className="w-3.5 h-3.5" />}
                description="Analyzes goals versus current capabilities to identify specific missing tools in the ecosystem."
                onExecute={runIntentAgent}
                loading={loadingStates['intent']}
              />
              <AgentPanel 
                name="Future Agent"
                icon={<Clock className="w-3.5 h-3.5" />}
                description="Projects the ecosystem 18 months forward to predict potential bottlenecks and tool obsolescence."
                onExecute={async () => {
                   // Mocked as requested logic not available in ai flows
                   toggleLoading('future', true);
                   await new Promise(r => setTimeout(r, 1500));
                   toggleLoading('future', false);
                }}
                loading={loadingStates['future']}
              />
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-border bg-muted/20">
            <div className="flex items-center justify-between text-[9px] font-code text-muted-foreground uppercase mb-2">
              <span>System Integrity</span>
              <span className="text-primary">99.98%</span>
            </div>
            <div className="w-full h-1 bg-muted border border-border">
              <div className="w-[99.98%] h-full bg-primary" />
            </div>
          </div>
        </div>
      </main>

      {/* Industrial Footer Status Bar */}
      <footer className="h-6 border-t border-border bg-muted/30 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 text-[9px] font-code text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>CORE_SYNC_ESTABLISHED</span>
          </div>
          <Separator orientation="vertical" className="h-3 opacity-30" />
          <div className="flex items-center gap-1">
            <span>GRAPH_VERSION: v4.1.2-ALPHA</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-code text-muted-foreground uppercase">
          <span className="flex items-center gap-1">
            <ExternalLink className="w-2.5 h-2.5" />
            Connect to Mainframe
          </span>
          <span>LATENCY: 0.002ms</span>
          <span className="text-primary">Ready</span>
        </div>
      </footer>
    </div>
  );
}
