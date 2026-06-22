"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Database, Cpu, GitBranch, Target, LayoutGrid, FileSearch, Settings2, Plus, Layers, Search, Code2, 
  CheckCircle2, AlertTriangle, History, ChevronRight, Terminal as TerminalIcon, Activity, Boxes, 
  Network, Zap, GitPullRequest, RefreshCw, HardDrive, Save, Clock, Edit3, Trash2, Image as ImageIcon
} from 'lucide-react';
import { KnowledgeGraph } from '@/components/dashboard/KnowledgeGraph';
import { AgentPanel } from '@/components/dashboard/AgentPanel';
import { SystemMonitor } from '@/components/dashboard/SystemMonitor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';

import { identifyImplicitCapabilities } from '@/ai/flows/identify-implicit-capabilities-flow';
import { identifyMissingToolsForGoals } from '@/ai/flows/identify-missing-tools-for-goals';
import { generateNovelSystems } from '@/ai/flows/generate-novel-systems';
import { generateMcpBoilerplate } from '@/ai/flows/generate-mcp-boilerplate';
import { executeEvolution } from '@/ai/flows/evolution-agent-flow';
import { generateMcpIcon } from '@/ai/flows/generate-mcp-icon-flow';
import { MCP, Goal, RepositoryTarget, EvolutionAgentOutput } from '@/lib/mcp-store';

const SINGLE_USER_ID = 'bwb-admin-01';

export default function BWBHub() {
  const db = useFirestore();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [selectedMcp, setSelectedMcp] = useState<MCP | null>(null);
  const [evolutionTarget, setEvolutionTarget] = useState<RepositoryTarget>('BWB-MCP-SERVER');
  const [evolutionInstruction, setEvolutionInstruction] = useState('');
  const [activeTab, setActiveTab] = useState('insights');
  const [logs, setLogs] = useState<{ id: string; msg: string; type: 'info' | 'warn' | 'error' | 'ai' | 'status'; time: string }[]>([]);
  
  const [isMcpEditorOpen, setIsMcpEditorOpen] = useState(false);
  const [editingMcp, setEditingMcp] = useState<Partial<MCP> | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string, type: 'info' | 'warn' | 'error' | 'ai' | 'status' = 'info') => {
    setLogs(prev => [...prev, { id: Math.random().toString(), msg, type, time: new Date().toLocaleTimeString() }].slice(-50));
  };

  const mcpsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'users', SINGLE_USER_ID, 'mcps'), orderBy('updatedAt', 'desc'));
  }, [db]);

  const goalsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'users', SINGLE_USER_ID, 'goals'), orderBy('updatedAt', 'desc'));
  }, [db]);

  const { data: mcps = [] } = useCollection<MCP>(mcpsQuery);
  const { data: goals = [] } = useCollection<Goal>(goalsQuery);

  const [registrySearch, setRegistrySearch] = useState('');
  
  const [capResults, setCapResults] = useState<any>(null);
  const [collResults, setCollResults] = useState<any>(null);
  const [intentResults, setIntentResults] = useState<any>(null);
  const [codeResults, setCodeResults] = useState<any>(null);
  const [evolutionResults, setEvolutionResults] = useState<EvolutionAgentOutput | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const toggleLoading = (agent: string, state: boolean) => {
    setLoadingStates(prev => ({ ...prev, [agent]: state }));
  };

  const filteredMcps = useMemo(() => {
    const list = Array.isArray(mcps) ? mcps : [];
    return list.filter((m) => {
      const search = registrySearch.toLowerCase();
      const nameMatch = (m.name || '').toLowerCase().includes(search);
      const descMatch = (m.description || '').toLowerCase().includes(search);
      return nameMatch || descMatch;
    });
  }, [mcps, registrySearch]);

  const runCapabilityAgent = async () => {
    if (mcps.length === 0) {
      toast({ title: "Insufficient Data", description: "Register at least one MCP.", variant: "destructive" });
      return;
    }
    toggleLoading('capability', true);
    addLog('Executing Capability Agent: Analyzing implicit potential...', 'ai');
    setCapResults(null);
    setActiveTab('insights');
    try {
      const desc = mcps.map((m: any) => `${m.name || 'Unnamed'}: ${m.description || 'No description'}`).join('\n');
      const result = await identifyImplicitCapabilities({ mcpDescriptions: desc });
      setCapResults(result);
      addLog(`Capability Agent completed. Identified ${result.implicitCapabilities.length} latent functions.`, 'info');
    } catch (e: any) {
      addLog(`Capability Agent Error: ${e.message}`, 'error');
      toast({ title: "Agent Failure", description: e.message, variant: "destructive" });
    } finally {
      toggleLoading('capability', false);
    }
  };

  const runCollisionAgent = async () => {
    if (mcps.length < 2) {
      toast({ title: "Insufficient Data", description: "Need at least two MCPs for collision simulation.", variant: "destructive" });
      return;
    }
    toggleLoading('collision', true);
    addLog('Executing Collision Agent: Simulating system emergence...', 'ai');
    setCollResults(null);
    setActiveTab('simulations');
    try {
      const mcpDescs = mcps.map((m: any) => m.description || 'No description');
      const capDescs = mcps.flatMap((m: any) => m.explicitCapabilities || []);
      const result = await generateNovelSystems({ 
        mcpDescriptions: mcpDescs,
        capabilityDescriptions: capDescs,
        contextOrConstraints: "Focus on industrial automation and developer experience"
      });
      setCollResults(result);
      
      if (db) {
        addDoc(collection(db, `users/${SINGLE_USER_ID}/simulations`), {
          timestamp: serverTimestamp(),
          results: result.novelSystems
        });
      }
      addLog(`Collision Agent completed. Generated ${result.novelSystems.length} novel architectures.`, 'info');
    } catch (e: any) {
      addLog(`Collision Agent Error: ${e.message}`, 'error');
      toast({ title: "Agent Failure", description: e.message, variant: "destructive" });
    } finally {
      toggleLoading('collision', false);
    }
  };

  const runIntentAgent = async () => {
    if (goals.length === 0) {
      toast({ title: "No Goals Defined", description: "Add a strategic goal first.", variant: "destructive" });
      return;
    }
    toggleLoading('intent', true);
    addLog('Executing Intent Agent: Mapping strategic gaps...', 'ai');
    setIntentResults(null);
    setActiveTab('insights');
    try {
      const result = await identifyMissingToolsForGoals({
        goals: goals.map((g: any) => g.title || 'Untitled Goal'),
        existingCapabilities: mcps.flatMap((m: any) => m.explicitCapabilities || [])
      });
      setIntentResults(result);
      addLog('Intent Agent completed. Strategic gap matrix generated.', 'info');
    } catch (e: any) {
      addLog(`Intent Agent Error: ${e.message}`, 'error');
      toast({ title: "Agent Failure", description: e.message, variant: "destructive" });
    } finally {
      toggleLoading('intent', false);
    }
  };

  const runCodeAgent = async () => {
    if (!selectedMcp) {
      toast({ title: "Target Selection Required", description: "Select an MCP from the registry.", variant: "destructive" });
      return;
    }
    toggleLoading('code', true);
    addLog(`Executing Boilerplate Agent for target: ${selectedMcp.name}...`, 'ai');
    setCodeResults(null);
    setActiveTab('code');
    try {
      const result = await generateMcpBoilerplate({
        name: selectedMcp.name || 'UnnamedProvider',
        description: selectedMcp.description || 'No description provided',
        capabilities: selectedMcp.explicitCapabilities || []
      });
      setCodeResults(result);
      addLog('Boilerplate generation successful. Code buffered.', 'info');
    } catch (e: any) {
      addLog(`Boilerplate Agent Error: ${e.message}`, 'error');
      toast({ title: "Agent Failure", description: e.message, variant: "destructive" });
    } finally {
      toggleLoading('code', false);
    }
  };

  const runEvolutionAgent = async () => {
    if (!evolutionInstruction.trim()) {
      toast({ title: "Missing Instructions", description: "Provide specific evolution instructions.", variant: "destructive" });
      return;
    }
    toggleLoading('evolution', true);
    addLog(`Executing Evolution Agent on ${evolutionTarget}: ${evolutionInstruction.slice(0, 30)}...`, 'ai');
    setEvolutionResults(null);
    setActiveTab('evolution');
    try {
      const result = await executeEvolution({
        target: evolutionTarget,
        instruction: evolutionInstruction,
        context: selectedMcp ? `Selected MCP context: ${selectedMcp.name} - ${selectedMcp.description}` : undefined
      });
      setEvolutionResults(result);
      
      if (db) {
        addDoc(collection(db, `users/${SINGLE_USER_ID}/evolution_logs`), {
          target: evolutionTarget,
          description: evolutionInstruction,
          timestamp: serverTimestamp(),
          status: 'proposed'
        });
      }
      addLog(`Evolution Agent proposed a patch for ${evolutionTarget}.`, 'info');
    } catch (e: any) {
      addLog(`Evolution Agent Error: ${e.message}`, 'error');
      toast({ title: "Agent Failure", description: e.message, variant: "destructive" });
    } finally {
      toggleLoading('evolution', false);
    }
  };

  const runIconGeneration = async (mcp: MCP) => {
    if (!db) return;
    addLog(`Generating industrial icon for ${mcp.name}...`, 'ai');
    try {
      const result = await generateMcpIcon({
        name: mcp.name,
        description: mcp.description
      });
      const mcpRef = doc(db, 'users', SINGLE_USER_ID, 'mcps', mcp.id);
      await updateDoc(mcpRef, {
        iconUrl: result.iconDataUri,
        updatedAt: serverTimestamp()
      });
      addLog(`Icon generated and persisted for ${mcp.name}.`, 'info');
      toast({ title: "Icon Generated", description: `Visual identifier mapped to ${mcp.name}.` });
    } catch (e: any) {
      addLog(`Icon Generation Error: ${e.message}`, 'error');
      toast({ title: "Generation Failure", description: e.message, variant: "destructive" });
    }
  };

  const handleUpdateMcp = () => {
    if (!db || !editingMcp?.id) return;
    const mcpRef = doc(db, 'users', SINGLE_USER_ID, 'mcps', editingMcp.id);
    updateDoc(mcpRef, {
      ...editingMcp,
      updatedAt: serverTimestamp()
    }).then(() => {
      setIsMcpEditorOpen(false);
      addLog(`Node ${editingMcp.name} metadata synchronized.`, 'info');
    });
  };

  const handleDeleteMcp = (id: string) => {
    if (!db || !confirm('Permanently decommission this node?')) return;
    deleteDoc(doc(db, 'users', SINGLE_USER_ID, 'mcps', id)).then(() => {
      addLog(`Node ${id} decommissioned from registry.`, 'warn');
      if (selectedMcp?.id === id) setSelectedMcp(null);
    });
  };

  const handleAddMcp = () => {
    if (!db) return;
    const path = `users/${SINGLE_USER_ID}/mcps`;
    const data = {
      name: 'New Provider Node',
      description: 'Define the functional scope and integration parameters.',
      explicitCapabilities: ['Capability Root'],
      implicitCapabilities: [],
      version: '1.0.0',
      status: 'experimental',
      updatedAt: serverTimestamp()
    };
    addDoc(collection(db, path), data);
    addLog('New node initialized in registry.', 'info');
  };

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <TerminalIcon className="w-10 h-10 text-primary animate-pulse" />
          <div className="font-code text-xs text-primary uppercase tracking-[0.5em]">INITIALIZING_HUB_INTERFACE...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background font-body select-none overflow-hidden text-foreground">
      <div className="scanline-overlay" />
      
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center px-4 justify-between shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-primary flex items-center justify-center">
              <Activity className="w-4 h-4 text-background" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-code text-base font-bold tracking-tighter uppercase text-primary leading-none">BWB-CODE-ASSISTANT</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="status-glow-green" />
                <span className="text-[9px] font-code text-muted-foreground uppercase tracking-widest">Enhanced Node Orchestrator</span>
              </div>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8 opacity-30" />
          <div className="flex items-center gap-4 text-[10px] font-code uppercase tracking-widest text-muted-foreground">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/20 border border-border">
              <span className="opacity-50">Repo:</span>
              <span className="text-foreground">BWB-ROOT</span>
            </div>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 border border-primary/20 text-primary">
              <span className="opacity-50">Interface:</span>
              <span className="font-bold">ASSISTANT</span>
            </div>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/20 border border-border">
              <span className="opacity-50">Target:</span>
              <span className="text-foreground">MCP-SERVER</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6 pr-4">
            <div className="text-right">
              <div className="text-[9px] font-code text-muted-foreground uppercase leading-none mb-1">Active Hub Nodes</div>
              <div className="text-xs font-code text-primary leading-none font-bold">{mcps.length}</div>
            </div>
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-none border-border bg-muted/10 hover:bg-muted/20">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <div className="absolute inset-0 grid-bg opacity-[0.03] pointer-events-none" />
        
        <div className="w-[340px] border-r border-border flex flex-col shrink-0 bg-card/30 backdrop-blur-sm z-10">
          <div className="p-4 bg-muted/20 border-b border-border flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-code uppercase text-muted-foreground font-bold tracking-widest">
                <Database className="w-4 h-4 text-primary" />
                <span>Node Registry</span>
              </div>
              <Button onClick={handleAddMcp} variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10 border border-primary/20 rounded-none">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Query MCP Ecosystem..." 
                className="h-9 pl-10 text-[11px] font-code rounded-none border-border bg-background/50 focus:border-primary/50 transition-all"
                value={registrySearch}
                onChange={(e) => setRegistrySearch(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {filteredMcps.length === 0 ? (
                <div className="p-8 text-center opacity-20 flex flex-col items-center gap-4">
                  <Boxes className="w-12 h-12" />
                  <p className="text-[10px] font-code uppercase tracking-[0.2em]">No Nodes Found</p>
                </div>
              ) : (
                filteredMcps.map((mcp) => (
                  <div 
                    key={mcp.id} 
                    onClick={() => setSelectedMcp(mcp)}
                    className={`industrial-panel p-3 transition-all cursor-pointer group ${selectedMcp?.id === mcp.id ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'hover:border-primary/40 hover:bg-muted/10'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {mcp.iconUrl ? (
                          <img src={mcp.iconUrl} alt={mcp.name} className="w-6 h-6 border border-primary/20 p-0.5" />
                        ) : (
                          <div className="w-6 h-6 border border-border flex items-center justify-center">
                            <ImageIcon className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                        <span className="text-[9px] font-code text-muted-foreground uppercase tracking-widest">UID_{mcp.id?.slice(-4).toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 hover:text-primary"
                          onClick={(e) => { e.stopPropagation(); setEditingMcp(mcp); setIsMcpEditorOpen(true); }}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDeleteMcp(mcp.id); }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-foreground mb-1 font-headline uppercase tracking-tighter group-hover:text-primary">{mcp.name}</h3>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mb-3 leading-snug">{mcp.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {(mcp.explicitCapabilities || []).slice(0, 2).map((cap: string) => (
                          <span key={cap} className="text-[7px] font-code px-1.5 py-0.5 bg-muted/40 text-muted-foreground border border-border/50 uppercase">{cap}</span>
                        ))}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-primary/40 hover:text-primary"
                        title="Generate Industrial Icon"
                        onClick={(e) => { e.stopPropagation(); runIconGeneration(mcp); }}
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col bg-background relative z-10">
          <div className="p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
            <SystemMonitor />
            
            <div className="flex-1 relative flex flex-col gap-4 overflow-hidden mb-4">
              <KnowledgeGraph mcps={mcps} />
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 industrial-panel bg-card/30 backdrop-blur-sm flex flex-col overflow-hidden border-t-0">
                <div className="px-4 py-1 border-b border-border bg-muted/20 flex items-center justify-between">
                  <TabsList className="bg-transparent border-0 h-9 p-0 gap-4">
                    <TabsTrigger value="insights" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-[10px] font-code uppercase tracking-widest">
                      <FileSearch className="w-3 h-3 mr-2" />
                      Inference
                    </TabsTrigger>
                    <TabsTrigger value="simulations" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-[10px] font-code uppercase tracking-widest">
                      <Layers className="w-3 h-3 mr-2" />
                      Simulations
                    </TabsTrigger>
                    <TabsTrigger value="evolution" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-[10px] font-code uppercase tracking-widest">
                      <Zap className="w-3 h-3 mr-2" />
                      Evolution
                    </TabsTrigger>
                    <TabsTrigger value="code" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-[10px] font-code uppercase tracking-widest">
                      <Code2 className="w-3 h-3 mr-2" />
                      Code
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-5">
                    {activeTab === 'insights' && (
                      <div className="space-y-6">
                        {capResults && (
                          <div className="border-l-2 border-primary pl-5 py-2 bg-primary/5">
                            <h4 className="text-[12px] font-code uppercase text-primary font-bold tracking-widest mb-4">Implicit Potential</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {capResults.implicitCapabilities.map((ic: any, idx: number) => (
                                <div key={idx} className="bg-background/50 border border-border p-4">
                                  <div className="text-[11px] font-bold text-foreground mb-1 uppercase tracking-tight">{ic.name}</div>
                                  <div className="text-[10px] text-muted-foreground leading-relaxed">{ic.description}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {intentResults && (
                          <div className="border-l-2 border-chart-3 pl-5 py-2 bg-chart-3/5">
                            <h4 className="text-[12px] font-code uppercase text-chart-3 font-bold tracking-widest mb-4">Strategic Gaps</h4>
                            <div className="bg-background/50 border border-border p-4">
                              <p className="text-[10px] text-muted-foreground mb-4">{intentResults.reasoning}</p>
                              <div className="grid grid-cols-2 gap-2">
                                {intentResults.missingTools.map((tool: string, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2 p-2 bg-muted/20 border border-border/40">
                                    <div className="w-1 h-1 bg-chart-3 rounded-full" />
                                    <span className="text-[9px] font-code uppercase">{tool}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {!capResults && !intentResults && (
                          <div className="flex flex-col items-center justify-center py-20 opacity-20">
                            <Activity className="w-16 h-16 mb-4" />
                            <p className="text-[10px] font-code uppercase tracking-[0.2em]">Ready for Inference</p>
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === 'simulations' && collResults && (
                      <div className="grid grid-cols-1 gap-4">
                        {collResults.novelSystems.map((ns: any, idx: number) => (
                          <div key={idx} className="bg-background/50 border border-border p-4 hover:border-chart-2/50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-[11px] font-bold uppercase tracking-widest">{ns.name}</div>
                              <Badge variant="outline" className="text-[9px] font-code border-chart-2/20 text-chart-2">Novelty: {ns.noveltyRank}%</Badge>
                            </div>
                            <div className="text-[10px] text-muted-foreground leading-relaxed mb-3">{ns.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeTab === 'evolution' && evolutionResults && (
                      <div className="space-y-4">
                        <div className="bg-background/80 border border-border p-4 font-code text-[10px] overflow-x-auto whitespace-pre leading-relaxed">
                          {evolutionResults.code}
                        </div>
                        <div className="p-3 bg-muted/10 border-l-2 border-primary/50 text-[10px] text-foreground italic">
                          {evolutionResults.impactAnalysis}
                        </div>
                      </div>
                    )}
                    {activeTab === 'code' && codeResults && (
                      <div className="space-y-4">
                        <div className="bg-background/80 border border-border p-4 font-code text-[10px] overflow-x-auto whitespace-pre leading-relaxed">
                          {codeResults.code}
                        </div>
                        <div className="p-3 bg-muted/10 border-l-2 border-green-500/50 text-[10px] text-muted-foreground italic">
                          {codeResults.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Tabs>
            </div>

            <div className="h-40 industrial-panel bg-black/80 border-t-0 flex flex-col shrink-0">
              <div className="h-7 border-b border-border/50 bg-muted/20 px-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] font-code text-primary uppercase tracking-[0.2em]">
                  <TerminalIcon className="w-3 h-3" />
                  <span>Real-time System Terminal</span>
                </div>
                <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-muted" onClick={() => setLogs([])}>
                  <RefreshCw className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-1">
                  {logs.map((log) => (
                    <div key={log.id} className="font-code text-[10px] flex items-start gap-2">
                      <span className="opacity-30 shrink-0">[{log.time}]</span>
                      <span className={cn(
                        "font-bold uppercase shrink-0",
                        log.type === 'ai' ? 'text-primary' : 
                        log.type === 'error' ? 'text-destructive' : 
                        log.type === 'warn' ? 'text-chart-3' : 'text-muted-foreground'
                      )}>[{log.type}]</span>
                      <span className="opacity-80">{log.msg}</span>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <div className="w-[320px] border-l border-border flex flex-col shrink-0 bg-card/30 backdrop-blur-sm z-10">
          <div className="p-4 bg-muted/20 border-b border-border">
            <div className="flex items-center gap-2 text-[11px] font-code uppercase text-muted-foreground font-bold tracking-widest">
              <Cpu className="w-4 h-4 text-primary" />
              <span>Inference Agents</span>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-4">
              <div className="industrial-panel p-3 bg-primary/5 border-primary/20 rounded-none mb-2">
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="text-[9px] font-code text-muted-foreground uppercase tracking-widest">Evolution Target</label>
                  <select 
                    value={evolutionTarget}
                    onChange={(e) => setEvolutionTarget(e.target.value as RepositoryTarget)}
                    className="h-8 bg-background border border-border px-2 text-[10px] font-code uppercase text-primary outline-none"
                  >
                    <option value="BWB-ROOT">BWB-ROOT</option>
                    <option value="BWB-CODE-ASSISTANT">BWB-CODE-ASSISTANT</option>
                    <option value="BWB-MCP-SERVER">BWB-MCP-SERVER</option>
                  </select>
                </div>
                <Input 
                  placeholder="Evolution logic..." 
                  className="h-8 text-[10px] font-code rounded-none border-border bg-background/50 mb-3"
                  value={evolutionInstruction}
                  onChange={(e) => setEvolutionInstruction(e.target.value)}
                />
                <Button 
                  className="w-full h-9 bg-primary text-background font-code uppercase tracking-widest text-[10px] rounded-none hover:bg-primary/90"
                  disabled={loadingStates['evolution']}
                  onClick={runEvolutionAgent}
                >
                  {loadingStates['evolution'] ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 mr-2" />}
                  {loadingStates['evolution'] ? 'Evolving...' : 'Execute Evolution'}
                </Button>
              </div>

              <AgentPanel name="Capability Agent" icon={<GitBranch className="w-4 h-4" />} description="Analyze implicit expansion potential." onExecute={runCapabilityAgent} loading={loadingStates['capability']} />
              <AgentPanel name="Collision Agent" icon={<Layers className="w-4 h-4" />} description="Simulate combinatorial collisions." onExecute={runCollisionAgent} loading={loadingStates['collision']} />
              <AgentPanel name="Intent Agent" icon={<Target className="w-4 h-4" />} description="Map strategic gaps for goals." onExecute={runIntentAgent} loading={loadingStates['intent']} />
              <AgentPanel name="Boilerplate Agent" icon={<Code2 className="w-4 h-4" />} description="Generate industrial code." onExecute={runCodeAgent} loading={loadingStates['code']} />
            </div>
          </ScrollArea>
        </div>
      </main>

      <Dialog open={isMcpEditorOpen} onOpenChange={setIsMcpEditorOpen}>
        <DialogContent className="max-w-md industrial-panel bg-card p-6 border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-sm font-code uppercase text-primary tracking-widest">Edit Node Parameters</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-code uppercase opacity-70">Node Identity</Label>
              <Input 
                value={editingMcp?.name || ''} 
                onChange={(e) => setEditingMcp(prev => ({ ...prev, name: e.target.value }))}
                className="font-code text-xs bg-background/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-code uppercase opacity-70">Functional Scope</Label>
              <Textarea 
                value={editingMcp?.description || ''} 
                onChange={(e) => setEditingMcp(prev => ({ ...prev, description: e.target.value }))}
                className="font-body text-xs min-h-[100px] bg-background/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-code uppercase opacity-70">Status Protocol</Label>
              <select 
                value={editingMcp?.status || 'experimental'}
                onChange={(e) => setEditingMcp(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full h-9 bg-background border border-border px-2 text-[10px] font-code uppercase text-primary"
              >
                <option value="active">ACTIVE</option>
                <option value="deprecated">DEPRECATED</option>
                <option value="experimental">EXPERIMENTAL</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMcpEditorOpen(false)} className="rounded-none font-code uppercase text-[10px]">Cancel</Button>
            <Button onClick={handleUpdateMcp} className="rounded-none bg-primary text-background font-code uppercase text-[10px]">Synchronize</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="h-7 border-t border-border bg-card px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-6 text-[9px] font-code text-muted-foreground tracking-widest">
          <div className="flex items-center gap-2">
            <div className="status-glow-green" />
            <span className="font-bold text-foreground">ENHANCED_HUB_V2</span>
          </div>
          <Separator orientation="vertical" className="h-3 opacity-30" />
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3" />
            <span>SYNC_CLOCK: {currentTime}</span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-[9px] font-code uppercase tracking-widest">
          <span className="text-muted-foreground opacity-60">AUTH_SIG: <span className="text-foreground font-bold">ADMIN</span></span>
          <Separator orientation="vertical" className="h-3 opacity-30" />
          <span className="text-primary font-bold animate-pulse">SYSTEM_UPLINK_STABLE</span>
        </div>
      </footer>
    </div>
  );
}