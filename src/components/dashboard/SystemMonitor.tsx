"use client";

import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Network } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const SystemMonitor = () => {
  const [cpuUsage, setCpuUsage] = useState(42);
  const [memUsage, setMemUsage] = useState(65);
  const [latency, setLatency] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.max(10, Math.min(95, prev + (Math.random() * 10 - 5))));
      setMemUsage(prev => Math.max(40, Math.min(85, prev + (Math.random() * 4 - 2))));
      setLatency(prev => Math.max(5, Math.min(50, prev + (Math.random() * 6 - 3))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="industrial-panel p-3 bg-muted/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[10px] font-code uppercase text-muted-foreground">
            <Cpu className="w-3 h-3" />
            <span>Inference Load</span>
          </div>
          <span className="text-[10px] font-code text-primary">{cpuUsage.toFixed(1)}%</span>
        </div>
        <Progress value={cpuUsage} className="h-1 rounded-none bg-muted" />
      </div>

      <div className="industrial-panel p-3 bg-muted/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[10px] font-code uppercase text-muted-foreground">
            <HardDrive className="w-3 h-3" />
            <span>Memory Allocation</span>
          </div>
          <span className="text-[10px] font-code text-primary">{memUsage.toFixed(1)}%</span>
        </div>
        <Progress value={memUsage} className="h-1 rounded-none bg-muted" />
      </div>

      <div className="industrial-panel p-3 bg-muted/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[10px] font-code uppercase text-muted-foreground">
            <Activity className="w-3 h-3" />
            <span>Bus Latency</span>
          </div>
          <span className="text-[10px] font-code text-primary">{latency.toFixed(0)}ms</span>
        </div>
        <Progress value={latency * 2} className="h-1 rounded-none bg-muted" />
      </div>
    </div>
  );
};