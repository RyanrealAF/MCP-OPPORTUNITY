"use client";

import React, { useState, useEffect } from 'react';
import { MCP } from '@/lib/mcp-store';

interface KnowledgeGraphProps {
  mcps: MCP[];
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ mcps }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="relative w-full h-[300px] industrial-panel overflow-hidden bg-background/80 flex items-center justify-center">
        <div className="text-[10px] font-code text-muted-foreground animate-pulse uppercase tracking-[0.2em]">Initialising Graph...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[300px] industrial-panel overflow-hidden bg-background/80 flex items-center justify-center">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
      
      <svg className="w-full h-full p-8" viewBox="0 0 800 400">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted-foreground/30" />
          </marker>
        </defs>

        {/* Central Core Node */}
        <circle cx="400" cy="200" r="40" className="fill-background stroke-primary stroke-[0.5px]" />
        <text x="400" y="200" textAnchor="middle" dominantBaseline="middle" className="fill-primary font-code text-[10px] uppercase">Core Graph</text>

        {/* MCP Nodes and Connections */}
        {mcps.map((mcp, idx) => {
          const angle = (idx / mcps.length) * 2 * Math.PI;
          const x = 400 + 200 * Math.cos(angle);
          const y = 200 + 120 * Math.sin(angle);
          
          return (
            <g key={mcp.id}>
              <line 
                x1="400" y1="200" x2={x} y2={y} 
                className="schematic-line" 
                strokeDasharray="4 2"
                markerEnd="url(#arrow)"
              />
              <rect 
                x={x - 60} y={y - 15} width="120" height="30" 
                className="fill-background stroke-border stroke-[0.5px]" 
              />
              <text 
                x={x} y={y} textAnchor="middle" dominantBaseline="middle" 
                className="fill-foreground font-code text-[9px] pointer-events-none"
              >
                {mcp.name.toUpperCase()}
              </text>
              {mcp.explicitCapabilities.map((cap, cIdx) => {
                const cAngle = angle + (cIdx - (mcp.explicitCapabilities.length - 1) / 2) * 0.2;
                const cX = x + 80 * Math.cos(cAngle);
                const cY = y + 60 * Math.sin(cAngle);
                return (
                  <g key={`${mcp.id}-cap-${cIdx}`}>
                    <line x1={x} y1={y} x2={cX} y2={cY} className="schematic-line opacity-50" />
                    <circle cx={cX} cy={cY} r="4" className="fill-primary/20 stroke-primary/40 stroke-[0.5px]" />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="absolute top-2 left-2 flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
        <span className="text-[10px] font-code text-primary uppercase tracking-widest">Live Node Map v4.1.2</span>
      </div>
    </div>
  );
};