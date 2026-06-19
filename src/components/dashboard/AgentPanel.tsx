"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentPanelProps {
  name: string;
  icon: React.ReactNode;
  description: string;
  onExecute: () => Promise<any>;
  loading?: boolean;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ 
  name, icon, description, onExecute, loading 
}) => {
  return (
    <Card className="industrial-panel flex flex-col rounded-none">
      <CardHeader className="p-3 border-b border-border bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-[11px] font-code uppercase tracking-tighter text-muted-foreground">
          {icon}
          <span>{name}</span>
          <div className="ml-auto flex items-center gap-1">
            <span className={cn(
              "w-1 h-1 rounded-full", 
              loading ? "bg-primary animate-pulse" : "bg-green-500/50"
            )} />
            <span className="text-[8px] opacity-70">{loading ? 'ACTIVE' : 'IDLE'}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 flex-1 flex flex-col gap-3">
        <p className="text-[11px] text-muted-foreground leading-tight font-body">
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
      </CardContent>
    </Card>
  );
};
