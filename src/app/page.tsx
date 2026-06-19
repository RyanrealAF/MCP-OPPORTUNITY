"use client";

import React, { useState, useMemo } from 'react';
import { initialMCPs, initialGoals, MCP, Goal } from '@/lib/mcp-store';
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
  Plus,
  Layers,
  Search
} from 'lucide-react';
import { KnowledgeGraph } from '@/components/dashboard/KnowledgeGraph';
import { AgentPanel } from '@/components/dashboard/AgentPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

// AI Flow imports
import { identifyImplicitCapabilities } from '@/ai/flows/identify-implicit-capabilities-flow';
import { identifyMissingToolsForGoals } from '@/ai/flows/identify-missing-tools-for-goals';
import { generateNovelSystems } from '@/ai/flows/generate-novel-systems';

export default function MOEPage() {
  const [mcps, setMcps] = useState<MCP[]>(initialMCPs);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [registrySearch, setRegistrySearch] = useState('');
  
  // Agent states
  const [capResults, setCapResults] = useState<any>(null);
  const [collResults, setCollResults] = useState<any>(null);
  const [intentResults, setIntentResults] = useState<any>(null);
  
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const toggleLoading = (agent: string, state: boolean) => {
    setLoadingStates(prev => ({ ...prev, [agent]: state }));
  };

  const filteredMcps = useMemo(() => {
    return mcps.filter(m => 
      m.name.toLowerCase().includes(registrySearch.toLowerCase()) ||
      m.description.toLowerCase().includes(registrySearch.toLowerCase())
    );
  }, [mcps, registrySearch]);

  const runCapabilityAgent = async () => {
    toggleLoading('capability', true);
    try {
      const desc = mcps.map(m => `${m.name}: ${m.description}`).join('\n');
      const result = await identifyImplicitCapabilities({ mcpDescriptions: desc });
      setCapResults(result);
      
      // Update local graph with implicit findings for the first node as a sample
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
        contextOrConstraints: "Focus on industrial automation and developer experience"
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

  const handleAddMcp = () => {
    const newId = `mcp-${String(mcps.length + 1).padStart(3, '0')}`;
    const newMcp: MCP = {
      id: newId,
      name: `New Capability Provider ${mcps.length + 1}`,
      description: 'A newly registered capability interface awaiting configuration.',
      explicitCapabilities: ['Interface Stub'],
      implicitCapabilities: [],
      version: '1.0.0',
      status: 'experimental'
    };
    setMcps([...mcps, newMcp]);
  };

  const handleAddGoal = () => {
    const newGoal: Goal = {
      id: `g-${String(goals.length + 1).padStart(3, '0')}`,
      title: 'New Strategic Objective ' + (goals.length + 1),
      status: 'pending'
    };
    setGoals([...goals, newGoal]);
  };

  return (
    <div className="flex flex-col h-screen bg-background font-body select-none overflow-hidden">
      {/* Top Header Layer */}
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
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[9px] font-code text-muted-foreground uppercase leading-none">MCP Nodes</div>
              <div className="text-xs font-code text-primary leading-none">{mcps.length} Registered</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-code text-muted-foreground uppercase leading-none">Active Goals</div>
              <div className="text-xs font-code text-primary leading-none">{goals.length} Processing</div>
            </div>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-none border-border">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Core Registry */}
        <div className="w-[320px] border-r border-border flex flex-col shrink-0 bg-muted/10">
          <div className="p-3 bg-muted/20 border-b border-border flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-code uppercase text-muted-foreground">
                <Database className="w-3.5 h-3.5" />
                <span>Registry Inventory</span>
              </div>
              <Button onClick={handleAddMcp} variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
              <Input 
                placeholder="Search MCPs..." 
                className="h-8 pl-8 text-[11px] font-code rounded-none border-border bg-background"
                value={registrySearch}
                onChange={(e) => setRegistrySearch(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {filteredMcps.map(mcp => (
                <div key={mcp.id} className="industrial-panel p-2 mb-2 group hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-code text-muted-foreground uppercase tracking-widest">{mcp.id}</span>
                    <Badge variant={mcp.status === 'active' ? 'secondary' : 'outline'} className="text-[8px] h-3 px-1 rounded-none border-border uppercase">
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
            <div className="flex items-center justify-between mb-2">
              <div className="text-[9px] font-code text-muted-foreground uppercase">Strategic Goals</div>
              <Button onClick={handleAddGoal} variant="ghost" size="icon" className="h-5 w-5 text-primary">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
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

        {/* Center Column: Experience Layer */}
        <div className="flex-1 flex flex-col bg-background relative">
          <div className="p-3 flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[11px] font-code uppercase text-muted-foreground">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Ecosystem Visualization</span>
              </div>
            </div>
            
            <div className="flex-1 relative flex flex-col gap-3 overflow-hidden">
              <KnowledgeGraph mcps={mcps} />
              
              {/* Intelligence Feed */}
              <div className="flex-1 industrial-panel bg-muted/5 flex flex-col overflow-hidden">
                <div className="p-2 border-b border-border bg-muted/20 flex items-center gap-2 text-[10px] font-code uppercase text-muted-foreground">
                  <FileSearch className="w-3 h-3" />
                  <span>Agent Analysis Stream</span>
                </div>
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-4">
                    {!capResults && !collResults && !intentResults && (
                      <div className="flex flex-col items-center justify-center h-48 opacity-20 text-center">
                        <Terminal className="w-8 h-8 mb-2" />
                        <p className="font-code text-xs">AWAITING ANALYSIS TRIGGER...</p>
                      </div>
                    )}
                    
                    {capResults && (
                      <div className="border-l-2 border-primary pl-3 py-1 bg-primary/5 mb-4">
                        <h4 className="text-[11px] font-code uppercase text-primary mb-1">Capability Expansion</h4>
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
                        <h4 className="text-[11px] font-code uppercase text-chart-2 mb-1">Novel System Propositions</h4>
                        <div className="space-y-2">
                          {collResults.novelSystems.map((ns: any, idx: number) => (
                            <div key={idx} className="bg-background border border-border p-2">
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-[10px] font-bold text-foreground font-headline">{ns.name}</div>
                                <div className="text-[10px] font-code text-chart-2 px-1 border border-chart-2 bg-chart-2/10">STRENGTH: {ns.noveltyRank}%</div>
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
                        <h4 className="text-[11px] font-code uppercase text-chart-3 mb-1">Ecosystem Gap Identification</h4>
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

        {/* Right Column: Agents */}
        <div className="w-[300px] border-l border-border flex flex-col shrink-0 bg-muted/10">
          <div className="p-3 bg-muted/20 border-b border-border">
            <div className="flex items-center gap-2 text-[11px] font-code uppercase text-muted-foreground">
              <Cpu className="w-3.5 h-3.5" />
              <span>Reasoning Agents</span>
            </div>
          </div>
          <ScrollArea className="flex-1 p-2">
            <div className="flex flex-col gap-3">
              <AgentPanel 
                name="Capability Agent"
                icon={<GitBranch className="w-3.5 h-3.5" />}
                description="Identifies hidden potential within existing MCP providers by analyzing explicit metadata."
                onExecute={runCapabilityAgent}
                loading={loadingStates['capability']}
              />
              <AgentPanel 
                name="Collision Agent"
                icon={<Layers className="w-3.5 h-3.5" />}
                description="Discovers novel system architectures by simulating combinatorial collisions between providers."
                onExecute={runCollisionAgent}
                loading={loadingStates['collision']}
              />
              <AgentPanel 
                name="Intent Agent"
                icon={<Target className="w-3.5 h-3.5" />}
                description="Compares strategic goals against registered capabilities to map out missing technological pieces."
                onExecute={runIntentAgent}
                loading={loadingStates['intent']}
              />
            </div>
          </ScrollArea>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-6 border-t border-border bg-muted/30 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 text-[9px] font-code text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>ECOSYSTEM_CONNECTED</span>
          </div>
          <Separator orientation="vertical" className="h-3 opacity-30" />
          <span>GRAPH_DENSITY: {((mcps.length * 2) / 100).toFixed(3)} η</span>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-code text-muted-foreground uppercase">
          <span>{mcps.length} Nodes</span>
          <span className="text-primary">System Ready</span>
        </div>
      </footer>
    </div>
  );
}
