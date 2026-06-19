"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Zap, Layers, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentPanelProps {
  name: string;
  icon: React.ReactNode;
  description: string;
  onExecute: () => Promise<any>;
  results?: any;
  loading?: boolean;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ 
  name, icon, description, onExecute, results, loading 
}) => {
  return (
    <Card className="industrial-panel flex flex-col h-full rounded-none">
      <CardHeader className="p-3 border-b border-border bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-[11px] font-code uppercase tracking-tighter text-muted-foreground">
          {icon}
          <span>{name}</span>
          <div className="ml-auto flex items-center gap-1 opacity-50">
            <span className="w-1 h-1 bg-green-500 rounded-full" />
            <span>IDLE</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 flex-1 flex flex-col gap-3">
        <p className="text-[12px] text-muted-foreground leading-tight font-body">
          {description}
        </p>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full h-8 text-[11px] font-code uppercase border-primary/20 hover:bg-primary/10 hover:text-primary transition-all rounded-none"
          onClick={onExecute}
          disabled={loading}
        >
          {loading ? (
            <Activity className="w-3 h-3 animate-spin mr-2" />
          ) : (
            <Zap className="w-3 h-3 mr-2" />
          )}
          {loading ? 'Processing...' : 'Execute Analysis'}
        </Button>

        {results && (
          <ScrollArea className="flex-1 mt-2 border border-border bg-background/50 p-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-primary font-code border-b border-border pb-1">
                <Layers className="w-3 h-3" />
                <span>OUTPUT STREAM</span>
              </div>
              <pre className="text-[10px] font-code text-foreground whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
