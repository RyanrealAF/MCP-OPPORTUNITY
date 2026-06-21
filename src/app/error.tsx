"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical System Error:", error);
  }, [error]);

  return (
    <div className="h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full border border-destructive/30 bg-destructive/5 p-8 flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <div>
          <h2 className="font-code text-xl font-bold text-destructive uppercase tracking-tighter mb-2">
            System Fault Detected
          </h2>
          <p className="text-xs text-muted-foreground font-code uppercase opacity-60">
            Internal module collision or service interruption.
          </p>
        </div>
        <div className="w-full bg-black/40 p-4 border border-border">
          <p className="text-[10px] font-code text-destructive text-left overflow-auto max-h-24">
            {error.message || "Unknown error detected in the BWB kernel."}
          </p>
        </div>
        <Button 
          onClick={() => reset()} 
          className="w-full h-12 rounded-none font-code uppercase tracking-widest bg-destructive text-white hover:bg-destructive/90"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Attempt Hot-Reload
        </Button>
      </div>
    </div>
  );
}
