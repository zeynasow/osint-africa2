import React from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface Props {
  compact?: boolean;
}

export const DemoWatermarkBanner: React.FC<Props> = ({ compact = false }) => {
  if (compact) {
    return (
      <div 
        id="demo-banner-compact"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium tracking-wide"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="font-semibold uppercase tracking-wider">DONNÉES DE DÉMONSTRATION</span>
      </div>
    );
  }

  return (
    <div
      id="demo-banner-full"
      className="bg-gradient-to-r from-amber-950/40 via-amber-900/25 to-amber-950/40 border-y border-amber-500/30 px-3.5 py-2 text-amber-200/90 text-xs flex items-center justify-between gap-2"
    >
      <div className="flex items-center gap-2">
        <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5" />
        </div>
        <div className="leading-tight">
          <span className="font-bold tracking-wider text-amber-300 mr-2 uppercase">
            DONNÉES DE DÉMONSTRATION
          </span>
          <span className="text-amber-200/70 hidden sm:inline">
            Événements et flux fictifs à usage d’évaluation méthodologique OSINT. Aucune source temps réel connectée.
          </span>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-1 text-[11px] text-amber-400/80 font-mono">
        <Info className="w-3 h-3" />
        <span>V1.0.0-PROTOTYPE</span>
      </div>
    </div>
  );
};
