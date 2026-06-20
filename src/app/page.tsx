"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Terminal, 
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
  Clock,
  ShieldCheck,
  Zap,
  Code2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  History
} from 'lucide-react';
import { KnowledgeGraph } from '@/components/dashboard/KnowledgeGraph';
import { AgentPanel } from '@/components/dashboard/AgentPanel';
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

export default function BWBPage() {
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
    return query(collection(db, 'users', user.uid, 'simulations'), orderBy('timestamp', 'desc'), limit(5));
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
        title: "Action Required",
        description: "Select an MCP from the registry to generate boilerplate code.",
        variant: "destructive"
      });
      return;
    }
    toggleLoading('code', true);
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
      name: 'New Capability Provider',
      description: 'Define the provider purpose and explicit capabilities here.',
      explicitCapabilities: ['Capability Item'],
      implicitCapabilities: [],
      version: '1.0.0',
      status: 'experimental',
      updatedAt: serverTimestamp()
    };

    addDoc(collection(db, path), data)
      .catch(async (err) => {
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

    addDoc(collection(db, path), data)
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path,
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleSignIn = () => {
    if (!auth) return;
    signInWithPopup(auth, new GoogleAuthProvider());
  };

  const handleSignOut = () => {
    if (!auth) return;
    signOut(auth);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Success",
      description: "Code copied to clipboard.",
    });
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return 'Recent';
    if (ts instanceof Timestamp) return ts.toDate().toLocaleTimeString();
    if (ts?.toDate) return ts.toDate().toLocaleTimeString();
    return 'Recent';
  };

  if (authLoading || !mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse font-code text-primary">SYNCING_CORE_RESOURCES...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full industrial-panel bg-card border-primary/20">
          <CardContent className="p-8 flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-primary/10 flex items-center justify-center border border-primary/30">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="font-code text-xl font-bold text-primary mb-2 tracking-tighter uppercase">BWB // CODE-ASSISTANT</h1>
              <p className="text-xs text-muted-foreground font-body">Production portal. Authentication required for system access.</p>
            </div>
            <Button onClick={handleSignIn} className="w-full font-code uppercase tracking-widest rounded-none h-12">
              Authenticate via Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background font-body select-none overflow-hidden text-foreground">
      <header className="h-12 border-b border-border bg-card flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5 text-background" />
            </div>
            <h1 className="font-code text-sm font-bold tracking-tighter uppercase text-primary">BWB // CODE-ASSISTANT</h1>
          </div>
          <Separator orientation="vertical" className="h-6 mx-2 opacity-50" />
          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 text-[11px] font-code uppercase text-primary bg-primary/10 rounded-none border-b-2 border-primary">Dashboard</Button>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[9px] font-code text-muted-foreground uppercase leading-none">MCP Nodes</div>
              <div className="text-xs font-code text-primary leading-none">{mcps.length} Synchronized</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-code text-muted-foreground uppercase leading-none">Active Goals</div>
              <div className="text-xs font-code text-primary leading-none">{goals.length} Tracked</div>
            </div>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-none border-border">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="w-[320px] border-r border-border flex flex-col shrink-0 bg-muted/10">
          <div className="p-3 bg-muted/20 border-b border-border flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-code uppercase text-muted-foreground">
                <Database className="w-3.5 h-3.5" />
                <span>Capability Registry</span>
              </div>
              <Button onClick={handleAddMcp} variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
              <Input 
                placeholder="Query Registry..." 
                className="h-8 pl-8 text-[11px] font-code rounded-none border-border bg-background"
                value={registrySearch}
                onChange={(e) => setRegistrySearch(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {filteredMcps.length === 0 ? (
                <div className="p-4 text-center opacity-30">
                  <Database className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-[10px] font-code uppercase tracking-widest leading-relaxed">No Providers Registered</p>
                </div>
              ) : (
                filteredMcps.map((mcp) => (
                  <div 
                    key={mcp.id} 
                    onClick={() => setSelectedMcp(mcp)}
                    className={`industrial-panel p-2 mb-2 group transition-colors cursor-pointer ${selectedMcp?.id === mcp.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-code text-muted-foreground uppercase tracking-widest">{mcp.id?.slice(-6)}</span>
                      <Badge variant={mcp.status === 'active' ? 'secondary' : 'outline'} className="text-[8px] h-3 px-1 rounded-none border-border uppercase">
                        {mcp.status}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-bold text-foreground mb-1 font-headline truncate uppercase tracking-tighter">{mcp.name || 'UNNAMED'}</h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 font-body mb-2 leading-tight">
                      {mcp.description || 'No description provided.'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(mcp.explicitCapabilities || []).slice(0, 2).map((cap: string) => (
                        <span key={cap} className="text-[9px] font-code px-1 bg-muted text-muted-foreground border border-border">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          <div className="p-3 border-t border-border bg-muted/20 max-h-[200px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[9px] font-code text-muted-foreground uppercase">Strategic Objectives</div>
              <Button onClick={handleAddGoal} variant="ghost" size="icon" className="h-5 w-5 text-primary">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {goals.length === 0 ? (
                  <div className="py-4 text-center opacity-20">
                    <p className="text-[9px] font-code uppercase">No Goals Active</p>
                  </div>
                ) : (
                  goals.map((goal) => (
                    <div key={goal.id} className="flex items-start gap-2 p-1.5 border border-border/50 bg-background/50">
                      <Target className="w-3 h-3 text-primary mt-0.5" />
                      <span className="text-[10px] text-foreground font-body leading-tight">{goal.title || 'Untitled Goal'}</span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="p-3 border-t border-border bg-card">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleSignOut}
              className="w-full h-10 font-code uppercase text-[10px] tracking-[0.2em] rounded-none bg-red-900/40 border border-red-500/50 hover:bg-red-800/60"
            >
              <LogOut className="w-3 h-3 mr-2" />
              Terminate Interface
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-background relative">
          <div className="p-3 flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[11px] font-code uppercase text-muted-foreground">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Ecosystem Visualization</span>
              </div>
              {selectedMcp && (
                <div className="text-[10px] font-code text-primary flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>TARGET_NODE: {(selectedMcp.name || 'UNNAMED').toUpperCase()}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 relative flex flex-col gap-3 overflow-hidden">
              <KnowledgeGraph mcps={mcps} />
              
              <div className="flex-1 industrial-panel bg-muted/5 flex flex-col overflow-hidden">
                <div className="p-2 border-b border-border bg-muted/20 flex items-center justify-between text-[10px] font-code uppercase text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileSearch className="w-3 h-3" />
                    <span>Analytical Stream</span>
                  </div>
                </div>
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-4">
                    {!capResults && !collResults && !intentResults && !codeResults && (
                      <div className="flex flex-col items-center justify-center h-48 opacity-20 text-center">
                        <Terminal className="w-8 h-8 mb-2" />
                        <p className="font-code text-xs tracking-[0.5em]">SYSTEM_IDLE_AWAITING_INPUT</p>
                      </div>
                    )}
                    
                    {codeResults && (
                      <div className="border-l-2 border-primary pl-3 py-1 bg-primary/5 mb-4 animate-in slide-in-from-left-2 duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[11px] font-code uppercase text-primary">Boilerplate Generation</h4>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-primary"
                            onClick={() => copyToClipboard(codeResults.code)}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="bg-background border border-border p-3 font-code text-[10px] overflow-x-auto whitespace-pre">
                          {codeResults.code}
                        </div>
                        <p className="mt-2 text-[10px] text-muted-foreground italic leading-relaxed">{codeResults.explanation}</p>
                      </div>
                    )}

                    {capResults && (
                      <div className="border-l-2 border-primary pl-3 py-1 bg-primary/5 mb-4 animate-in slide-in-from-left-2 duration-300">
                        <h4 className="text-[11px] font-code uppercase text-primary mb-2">Capability Expansion Vector</h4>
                        <div className="space-y-2">
                          {capResults.implicitCapabilities.map((ic: any, idx: number) => (
                            <div key={idx} className="bg-background border border-border p-2">
                              <div className="text-[10px] font-bold text-foreground font-headline mb-0.5 uppercase tracking-tighter">{ic.name}</div>
                              <div className="text-[10px] text-muted-foreground font-body leading-relaxed">{ic.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {collResults && (
                      <div className="border-l-2 border-chart-2 pl-3 py-1 bg-chart-2/5 mb-4 animate-in slide-in-from-left-2 duration-300">
                        <h4 className="text-[11px] font-code uppercase text-chart-2 mb-2">Novel Architecture Propositions</h4>
                        <div className="space-y-2">
                          {collResults.novelSystems.map((ns: any, idx: number) => (
                            <div key={idx} className="bg-background border border-border p-2">
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-[10px] font-bold text-foreground font-headline uppercase">{ns.name}</div>
                                <div className="text-[10px] font-code text-chart-2 px-1 border border-chart-2 bg-chart-2/10">MATCH: {ns.noveltyRank}%</div>
                              </div>
                              <div className="text-[10px] text-muted-foreground font-body leading-relaxed mb-2">{ns.description}</div>
                              <div className="flex flex-wrap gap-1">
                                {ns.combinedMcps.map((mcp: string) => (
                                  <span key={mcp} className="text-[8px] font-code px-1 border border-border/50 text-muted-foreground bg-muted/20 uppercase">{mcp}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {intentResults && (
                      <div className="border-l-2 border-chart-3 pl-3 py-1 bg-chart-3/5 animate-in slide-in-from-left-2 duration-300">
                        <h4 className="text-[11px] font-code uppercase text-chart-3 mb-2">Gap Analysis Matrix</h4>
                        <div className="bg-background border border-border p-2">
                          <div className="text-[10px] text-muted-foreground font-body leading-relaxed mb-3">{intentResults.reasoning}</div>
                          <div className="grid grid-cols-1 gap-1">
                            {intentResults.missingTools.map((tool: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 p-1.5 bg-muted/20 border border-border/30">
                                <AlertTriangle className="w-3 h-3 text-chart-3" />
                                <span className="text-[10px] font-code text-foreground uppercase tracking-tight">{tool}</span>
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

        <div className="w-[300px] border-l border-border flex flex-col shrink-0 bg-muted/10">
          <div className="p-3 bg-muted/20 border-b border-border">
            <div className="flex items-center gap-2 text-[11px] font-code uppercase text-muted-foreground">
              <Cpu className="w-3.5 h-3.5" />
              <span>Inference Agents</span>
            </div>
          </div>
          <ScrollArea className="flex-1 p-2">
            <div className="flex flex-col gap-3">
              <AgentPanel 
                name="Capability Agent"
                icon={<GitBranch className="w-3.5 h-3.5" />}
                description="Derive implicit expansion potential from existing node metadata."
                onExecute={runCapabilityAgent}
                loading={loadingStates['capability']}
              />
              <AgentPanel 
                name="Collision Agent"
                icon={<Layers className="w-3.5 h-3.5" />}
                description="Simulate combinatorial collisions between providers to discover novel systems."
                onExecute={runCollisionAgent}
                loading={loadingStates['collision']}
              />
              <AgentPanel 
                name="Intent Agent"
                icon={<Target className="w-3.5 h-3.5" />}
                description="Cross-reference strategic objectives against capabilities to map technological gaps."
                onExecute={runIntentAgent}
                loading={loadingStates['intent']}
              />
              <Separator className="my-2 bg-border/50" />
              <AgentPanel 
                name="Boilerplate Agent"
                icon={<Code2 className="w-3.5 h-3.5" />}
                description="Generate industrial-grade TypeScript implementation for the selected MCP target."
                onExecute={runCodeAgent}
                loading={loadingStates['code']}
              />
              
              {simulations.length > 0 && (
                <>
                  <Separator className="my-2 bg-border/50" />
                  <div className="flex flex-col gap-2 p-1">
                    <div className="flex items-center gap-2 text-[10px] font-code uppercase text-muted-foreground mb-1">
                      <History className="w-3 h-3" />
                      <span>Simulation History</span>
                    </div>
                    {simulations.map((sim) => (
                      <div key={sim.id} className="industrial-panel p-2 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] font-code text-muted-foreground uppercase leading-none">
                            {formatTimestamp(sim.timestamp)}
                          </span>
                          <span className="text-[8px] font-code text-primary leading-none uppercase">{sim.results?.length || 0} Concepts</span>
                        </div>
                        <div className="text-[9px] font-headline text-foreground truncate uppercase">
                          {sim.results?.[0]?.name || 'Untitled Simulation'}
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

      <footer className="h-6 border-t border-border bg-muted/30 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 text-[9px] font-code text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
            <span>CORE_STABLE</span>
          </div>
          <Separator orientation="vertical" className="h-3 opacity-30" />
          <div className="flex items-center gap-1">
            <Clock className="w-2 h-2" />
            <span>SYNC_TICK: {currentTime}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-code text-muted-foreground uppercase">
          <span>{user?.email}</span>
          <span className="text-primary font-bold">SECURE_LINK_ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}
