"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Database, 
  Cpu, 
  GitBranch, 
  Target, 
  LayoutGrid,
  FileSearch,
  Settings2,
  Plus,
  Layers,
  Search,
  LogOut,
  Code2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  History,
  ChevronRight,
  Terminal,
  Activity,
  Boxes
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
import { useToast } from '@/hooks/use-toast';

import { useAuth, useUser, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

import { identifyImplicitCapabilities } from '@/ai/flows/identify-implicit-capabilities-flow';
import { identifyMissingToolsForGoals } from '@/ai/flows/identify-missing-tools-for-goals';
import { generateNovelSystems } from '@/ai/flows/generate-novel-systems';
import { generateMcpBoilerplate } from '@/ai/flows/generate-mcp-boilerplate';
import { MCP, Goal, Simulation } from '@/lib/mcp-store';

export default function BWBHub() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [selectedMcp, setSelectedMcp] = useState<MCP | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mcpsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'mcps'), orderBy('updatedAt', 'desc'));
  }, [db, user]);

  const goalsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'goals'), orderBy('updatedAt', 'desc'));
  }, [db, user]);

  const simQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'simulations'), orderBy('timestamp', 'desc'), limit(10));
  }, [db, user]);

  const { data: mcps = [] } = useCollection<MCP>(mcpsQuery);
  const { data: goals = [] } = useCollection<Goal>(goalsQuery);
  const { data: simulations = [] } = useCollection<Simulation>(simQuery);

  const [registrySearch, setRegistrySearch] = useState('');
  
  const [capResults, setCapResults] = useState<any>(null);
  const [collResults, setCollResults] = useState<any>(null);
  const [intentResults, setIntentResults] = useState<any>(null);
  const [codeResults, setCodeResults] = useState<any>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const toggleLoading = (agent: string, state: boolean) => {
    setLoadingStates(prev => ({ ...prev, [agent]: state }));
  };

  const filteredMcps = useMemo(() => {
    return (mcps as MCP[]).filter((m) => {
      const search = registrySearch.toLowerCase();
      const nameMatch = (m.name || '').toLowerCase().includes(search);
      const descMatch = (m.description || '').toLowerCase().includes(search);
      return nameMatch || descMatch;
    });
  }, [mcps, registrySearch]);

  const runCapabilityAgent = async () => {
    if (mcps.length === 0) {
      toast({ title: "Insufficient Data", description: "Register at least one MCP to perform analysis.", variant: "destructive" });
      return;
    }
    toggleLoading('capability', true);
    setCapResults(null);
    try {
      const desc = mcps.map((m: any) => `${m.name || 'Unnamed'}: ${m.description || 'No description'}`).join('\n');
      const result = await identifyImplicitCapabilities({ mcpDescriptions: desc });
      setCapResults(result);
    } catch (e: any) {
      toast({ title: "Analysis Failed", description: e.message, variant: "destructive" });
    } finally {
      toggleLoading('capability', false);
    }
  };

  const runCollisionAgent = async () => {
    if (mcps.length < 2) {
      toast({ title: "Insufficient Data", description: "At least two MCPs are required for combinatorial analysis.", variant: "destructive" });
      return;
    }
    toggleLoading('collision', true);
    setCollResults(null);
    try {
      const mcpDescs = mcps.map((m: any) => m.description || 'No description');
      const capDescs = mcps.flatMap((m: any) => m.explicitCapabilities || []);
      const result = await generateNovelSystems({ 
        mcpDescriptions: mcpDescs,
        capabilityDescriptions: capDescs,
        contextOrConstraints: "Focus on industrial automation and developer experience"
      });
      setCollResults(result);
      
      if (db && user) {
        const path = `users/${user.uid}/simulations`;
        const simData = {
          timestamp: serverTimestamp(),
          results: result.novelSystems
        };
        addDoc(collection(db, path), simData).catch(async () => {
          const permissionError = new FirestorePermissionError({
            path,
            operation: 'create',
            requestResourceData: simData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      }
    } catch (e: any) {
      toast({ title: "Analysis Failed", description: e.message, variant: "destructive" });
    } finally {
      toggleLoading('collision', false);
    }
  };

  const runIntentAgent = async () => {
    if (goals.length === 0) {
      toast({ title: "No Goals Defined", description: "Add a strategic goal to analyze ecosystem gaps.", variant: "destructive" });
      return;
    }
    toggleLoading('intent', true);
    setIntentResults(null);
    try {
      const result = await identifyMissingToolsForGoals({
        goals: goals.map((g: any) => g.title || 'Untitled Goal'),
        existingCapabilities: mcps.flatMap((m: any) => m.explicitCapabilities || [])
      });
      setIntentResults(result);
    } catch (e: any) {
      toast({ title: "Analysis Failed", description: e.message, variant: "destructive" });
    } finally {
      toggleLoading('intent', false);
    }
  };

  const runCodeAgent = async () => {
    if (!selectedMcp) {
      toast({
        title: "Target Selection Required",
        description: "Select an MCP from the registry to generate BWB-MCP-SERVER boilerplate.",
        variant: "destructive"
      });
      return;
    }
    toggleLoading('code', true);
    setCodeResults(null);
    try {
      const result = await generateMcpBoilerplate({
        name: selectedMcp.name || 'UnnamedProvider',
        description: selectedMcp.description || 'No description provided',
        capabilities: selectedMcp.explicitCapabilities || []
      });
      setCodeResults(result);
    } catch (e: any) {
      toast({ title: "Generation Failed", description: e.message, variant: "destructive" });
    } finally {
      toggleLoading('code', false);
    }
  };

  const handleAddMcp = () => {
    if (!db || !user) return;
    const path = `users/${user.uid}/mcps`;
    const data = {
      name: 'New Provider Node',
      description: 'Define the functional scope and integration parameters.',
      explicitCapabilities: ['Capability Root'],
      implicitCapabilities: [],
      version: '1.0.0',
      status: 'experimental',
      updatedAt: serverTimestamp()
    };

    addDoc(collection(db, path), data).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path,
        operation: 'create',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleAddGoal = () => {
    if (!db || !user) return;
    const path = `users/${user.uid}/goals`;
    const data = {
      title: 'Define Strategic Objective',
      status: 'pending',
      updatedAt: serverTimestamp()
    };

    addDoc(collection(db, path), data).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path,
        operation: 'create',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return 'N/A';
    if (ts instanceof Timestamp) return ts.toDate().toLocaleTimeString();
    if (ts?.toDate) return ts.toDate().toLocaleTimeString();
    return 'Recent';
  };

  if (authLoading || !mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Terminal className="w-10 h-10 text-primary animate-pulse" />
          <div className="font-code text-xs text-primary uppercase tracking-[0.5em]">INITIALIZING_HUB_INTERFACE...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
        <div className="scanline-overlay" />
        <div className="absolute inset-0 grid-bg opacity-10" />
        <Card className="max-w-md w-full industrial-panel bg-card border-primary/20 z-10">
          <CardContent className="p-10 flex flex-col items-center gap-8">
            <div className="relative">
              <div className="w-20 h-20 bg-primary/5 border border-primary/30 flex items-center justify-center">
                <Boxes className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary animate-ping opacity-20" />
            </div>
            <div className="text-center">
              <h1 className="font-code text-2xl font-bold text-primary mb-3 tracking-tighter uppercase">BWB // HUB</h1>
              <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground font-code uppercase tracking-widest opacity-60">
                <span>ROOT</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-primary font-bold">ASSISTANT</span>
                <ChevronRight className="w-3 h-3" />
                <span>SERVER</span>
              </div>
            </div>
            <Button onClick={() => signInWithPopup(auth!, new GoogleAuthProvider())} className="w-full font-code uppercase tracking-widest rounded-none h-14 bg-primary text-background hover:bg-primary/90 transition-all">
              Initialize Connection
            </Button>
          </CardContent>
        </Card>
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
                <span className="text-[9px] font-code text-muted-foreground uppercase tracking-widest">Active Node Orchestrator</span>
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
              <div className="text-[9px] font-code text-muted-foreground uppercase leading-none mb-1">Synchronized Nodes</div>
              <div className="text-xs font-code text-primary leading-none font-bold">{mcps.length}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-code text-muted-foreground uppercase leading-none mb-1">Latency Metrics</div>
              <div className="text-xs font-code text-primary leading-none font-bold">12ms</div>
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
                  <p className="text-[10px] font-code uppercase tracking-[0.2em] leading-relaxed">No Nodes Identified</p>
                </div>
              ) : (
                filteredMcps.map((mcp) => (
                  <div 
                    key={mcp.id} 
                    onClick={() => setSelectedMcp(mcp)}
                    className={`industrial-panel p-3 transition-all cursor-pointer group ${selectedMcp?.id === mcp.id ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'hover:border-primary/40 hover:bg-muted/10'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-code text-muted-foreground uppercase tracking-widest">UID_{mcp.id?.slice(-8).toUpperCase()}</span>
                      <Badge variant="outline" className={`text-[8px] h-4 px-1.5 rounded-none uppercase border-border font-code ${mcp.status === 'active' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-primary border-primary/20'}`}>
                        {mcp.status}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-bold text-foreground mb-1.5 font-headline uppercase tracking-tighter group-hover:text-primary transition-colors">{mcp.name || 'UNNAMED_NODE'}</h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 font-body mb-3 leading-snug">
                      {mcp.description || 'No descriptive metadata provided.'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(mcp.explicitCapabilities || []).slice(0, 3).map((cap: string) => (
                        <span key={cap} className="text-[8px] font-code px-2 py-0.5 bg-muted/40 text-muted-foreground border border-border/50 uppercase tracking-tighter">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t border-border bg-muted/10 max-h-[250px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[10px] font-code text-muted-foreground uppercase font-bold tracking-widest">
                <Target className="w-3.5 h-3.5 text-primary" />
                <span>Strategic Roadmap</span>
              </div>
              <Button onClick={handleAddGoal} variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-2">
                {goals.length === 0 ? (
                  <div className="py-6 text-center opacity-10">
                    <p className="text-[9px] font-code uppercase">Zero Objectives Defined</p>
                  </div>
                ) : (
                  goals.map((goal) => (
                    <div key={goal.id} className="flex items-start gap-3 p-2 border border-border/30 bg-background/30 hover:bg-background/50 transition-colors group">
                      <div className="w-1.5 h-1.5 bg-primary mt-1.5 group-hover:scale-125 transition-transform" />
                      <span className="text-[10px] text-foreground font-body leading-tight group-hover:text-primary transition-colors">{goal.title || 'Untitled Objective'}</span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="p-4 border-t border-border bg-card">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => signOut(auth!)}
              className="w-full h-11 font-code uppercase text-[10px] tracking-[0.2em] rounded-none bg-red-950/20 border border-red-500/30 hover:bg-red-900/40 text-red-500 transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sever Interface Link
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-background relative z-10">
          <div className="p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
            <SystemMonitor />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-[11px] font-code uppercase text-muted-foreground font-bold tracking-widest">
                <LayoutGrid className="w-4 h-4 text-primary" />
                <span>Ecosystem Topology</span>
              </div>
              {selectedMcp && (
                <div className="flex items-center gap-3 px-3 py-1 bg-primary/10 border border-primary/30 rounded-none animate-in fade-in duration-500">
                  <div className="status-glow-blue" />
                  <span className="text-[10px] font-code text-primary font-bold uppercase tracking-widest">FOCUSED: {(selectedMcp.name || 'UNNAMED').toUpperCase()}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 relative flex flex-col gap-4 overflow-hidden">
              <KnowledgeGraph mcps={mcps} />
              
              <div className="flex-1 industrial-panel bg-card/30 backdrop-blur-sm flex flex-col overflow-hidden border-t-0">
                <div className="px-4 py-2 border-b border-border bg-muted/20 flex items-center justify-between text-[10px] font-code uppercase font-bold tracking-widest text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileSearch className="w-3.5 h-3.5 text-primary" />
                    <span>Inference Stream</span>
                  </div>
                  <div className="flex items-center gap-4 opacity-50">
                    <span>Buffer: 1024KB</span>
                    <span>Status: RUNNING</span>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 p-5">
                  <div className="space-y-6">
                    {!capResults && !collResults && !intentResults && !codeResults && (
                      <div className="flex flex-col items-center justify-center h-64 opacity-[0.05] text-center">
                        <Activity className="w-16 h-16 mb-4" />
                        <p className="font-code text-sm tracking-[1em] uppercase">Awaiting_Neural_Inference</p>
                      </div>
                    )}
                    
                    {codeResults && (
                      <div className="border-l-2 border-primary pl-5 py-2 bg-primary/5 animate-in slide-in-from-left-4 duration-500">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-[12px] font-code uppercase text-primary font-bold tracking-widest">Generated BWB-MCP-SERVER Implementation</h4>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary hover:bg-primary/20 border border-primary/20 rounded-none"
                            onClick={() => {
                              navigator.clipboard.writeText(codeResults.code);
                              toast({ title: "Copied", description: "Implementation code copied to clipboard." });
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="bg-background/80 border border-border p-5 font-code text-[11px] overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                          {codeResults.code}
                        </div>
                        <div className="mt-3 flex items-start gap-3 text-[11px] text-muted-foreground bg-muted/10 p-3 border-l-2 border-muted-foreground/30">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <p className="italic">{codeResults.explanation}</p>
                        </div>
                      </div>
                    )}

                    {capResults && (
                      <div className="border-l-2 border-primary pl-5 py-2 bg-primary/5 animate-in slide-in-from-left-4 duration-500">
                        <h4 className="text-[12px] font-code uppercase text-primary font-bold tracking-widest mb-4">Capability Expansion Propositions</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {capResults.implicitCapabilities.map((ic: any, idx: number) => (
                            <div key={idx} className="bg-background/50 border border-border p-4 hover:border-primary/50 transition-colors group">
                              <div className="text-[11px] font-bold text-foreground font-headline mb-2 uppercase tracking-tight group-hover:text-primary">{ic.name}</div>
                              <div className="text-[11px] text-muted-foreground font-body leading-relaxed">{ic.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {collResults && (
                      <div className="border-l-2 border-chart-2 pl-5 py-2 bg-chart-2/5 animate-in slide-in-from-left-4 duration-500">
                        <h4 className="text-[12px] font-code uppercase text-chart-2 font-bold tracking-widest mb-4">Ecosystem Collision Simulations</h4>
                        <div className="grid grid-cols-1 gap-4">
                          {collResults.novelSystems.map((ns: any, idx: number) => (
                            <div key={idx} className="bg-background/50 border border-border p-4 hover:border-chart-2/50 transition-colors">
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-[11px] font-bold text-foreground font-headline uppercase tracking-widest">{ns.name}</div>
                                <div className="text-[10px] font-code text-chart-2 px-2 py-0.5 border border-chart-2/30 bg-chart-2/10 font-bold uppercase">NOVELTY: {ns.noveltyRank}%</div>
                              </div>
                              <div className="text-[11px] text-muted-foreground font-body leading-relaxed mb-4">{ns.description}</div>
                              <div className="flex flex-wrap gap-2">
                                {ns.combinedMcps.map((mcp: string) => (
                                  <span key={mcp} className="text-[9px] font-code px-2 py-0.5 border border-border/50 text-muted-foreground bg-muted/30 uppercase tracking-tighter">{mcp}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {intentResults && (
                      <div className="border-l-2 border-chart-3 pl-5 py-2 bg-chart-3/5 animate-in slide-in-from-left-4 duration-500">
                        <h4 className="text-[12px] font-code uppercase text-chart-3 font-bold tracking-widest mb-4">Strategic Gap Analysis Matrix</h4>
                        <div className="bg-background/50 border border-border p-4">
                          <div className="flex items-start gap-3 text-[11px] text-muted-foreground font-body leading-relaxed mb-5 bg-muted/10 p-3">
                            <AlertTriangle className="w-5 h-5 text-chart-3 shrink-0 mt-0.5" />
                            <p>{intentResults.reasoning}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {intentResults.missingTools.map((tool: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-3 p-2 bg-muted/20 border border-border/40 group hover:border-chart-3/50 transition-colors">
                                <div className="w-1.5 h-1.5 bg-chart-3 rounded-full animate-pulse" />
                                <span className="text-[10px] font-code text-foreground uppercase tracking-tighter group-hover:text-chart-3">{tool}</span>
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

        <div className="w-[320px] border-l border-border flex flex-col shrink-0 bg-card/30 backdrop-blur-sm z-10">
          <div className="p-4 bg-muted/20 border-b border-border">
            <div className="flex items-center gap-2 text-[11px] font-code uppercase text-muted-foreground font-bold tracking-widest">
              <Cpu className="w-4 h-4 text-primary" />
              <span>Inference Agents</span>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-4">
              <AgentPanel 
                name="Capability Agent"
                icon={<GitBranch className="w-4 h-4" />}
                description="Derive implicit expansion potential from existing node metadata and explicit capability definitions."
                onExecute={runCapabilityAgent}
                loading={loadingStates['capability']}
              />
              <AgentPanel 
                name="Collision Agent"
                icon={<Layers className="w-4 h-4" />}
                description="Simulate combinatorial collisions between multiple MCP providers to discover novel emergent systems."
                onExecute={runCollisionAgent}
                loading={loadingStates['collision']}
              />
              <AgentPanel 
                name="Intent Agent"
                icon={<Target className="w-4 h-4" />}
                description="Cross-reference strategic objectives against synchronized capabilities to map critical technological gaps."
                onExecute={runIntentAgent}
                loading={loadingStates['intent']}
              />
              
              <Separator className="my-4 bg-border/40" />
              
              <AgentPanel 
                name="Boilerplate Agent"
                icon={<Code2 className="w-4 h-4" />}
                description="Generate production-ready BWB-MCP-SERVER TypeScript implementation for the selected ecosystem target."
                onExecute={runCodeAgent}
                loading={loadingStates['code']}
              />
              
              {simulations.length > 0 && (
                <>
                  <Separator className="my-4 bg-border/40" />
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-code uppercase text-muted-foreground font-bold tracking-[0.2em] mb-1">
                      <History className="w-3.5 h-3.5" />
                      <span>Simulation History</span>
                    </div>
                    {simulations.map((sim) => (
                      <div key={sim.id} className="industrial-panel p-3 bg-muted/5 hover:bg-muted/15 transition-all cursor-pointer group border-border/40">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-code text-muted-foreground uppercase leading-none">
                            TICK_{formatTimestamp(sim.timestamp)}
                          </span>
                          <span className="text-[9px] font-code text-primary font-bold leading-none uppercase">{sim.results?.length || 0} Nodes</span>
                        </div>
                        <div className="text-[10px] font-headline text-foreground truncate uppercase font-bold group-hover:text-primary transition-colors">
                          {sim.results?.[0]?.name || 'UNTITLED_SIM'}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </main>

      <footer className="h-7 border-t border-border bg-card px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-6 text-[9px] font-code text-muted-foreground tracking-widest">
          <div className="flex items-center gap-2">
            <div className="status-glow-green" />
            <span className="font-bold text-foreground">CORE_STABLE</span>
          </div>
          <Separator orientation="vertical" className="h-3 opacity-30" />
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3" />
            <span>SYNC_CLOCK: {currentTime}</span>
          </div>
          <Separator orientation="vertical" className="h-3 opacity-30" />
          <div className="flex items-center gap-2">
            <Network className="w-3 h-3" />
            <span>BWB-MCP-SERVER_UPLINK: ACTIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-[9px] font-code uppercase tracking-widest">
          <span className="text-muted-foreground opacity-60">AUTH_SIG: <span className="text-foreground font-bold">{user?.email?.split('@')[0]}</span></span>
          <Separator orientation="vertical" className="h-3 opacity-30" />
          <span className="text-primary font-bold animate-pulse">SYSTEM_ONLINE_ENCRYPTED</span>
        </div>
      </footer>
    </div>
  );
}