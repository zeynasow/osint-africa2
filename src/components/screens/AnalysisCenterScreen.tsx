import React, { useState } from 'react';
import { OsintAnalysis, OsintEvent } from '../../types';
import { Shield, AlertTriangle, FileText, Users, Database, Clock, BrainCircuit } from 'lucide-react';

interface AnalysisCenterScreenProps {
  analyses: OsintAnalysis[];
  events: OsintEvent[];
  onSelectAnalysis: (analysis: OsintAnalysis) => void;
  onOpenCreateAnalysis: (eventId?: string) => void;
}

export const AnalysisCenterScreen: React.FC<AnalysisCenterScreenProps> = ({
  analyses,
  events,
  onSelectAnalysis,
  onOpenCreateAnalysis,
}) => {
  const stats = {
    total: analyses.length,
    drafts: analyses.filter(a => a.status === 'Brouillon').length,
    validated: analyses.filter(a => a.status === 'Validée').length,
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Centre d'Analyse</h1>
          <p className="text-slate-400 mt-1">Plateforme de renseignement et de synthèse</p>
        </div>
        <button
          onClick={() => onOpenCreateAnalysis()}
          className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Nouvelle Analyse
        </button>
      </header>

      {/* Tableau de Bord */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0d121d] p-4 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">Total Analyses</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-[#0d121d] p-4 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">En Brouillon</div>
          <div className="text-2xl font-bold text-slate-300">{stats.drafts}</div>
        </div>
        <div className="bg-[#0d121d] p-4 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">Validées</div>
          <div className="text-2xl font-bold text-amber-500">{stats.validated}</div>
        </div>
      </section>

      {/* Analyses Récentes */}
      <section className="bg-[#0b0f17] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 font-medium text-white flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-amber-500" />
          Analyses Récentes
        </div>
        <div className="divide-y divide-slate-800">
          {analyses.length > 0 ? (
            analyses.slice(0, 5).map((analysis) => (
              <div
                key={analysis.id}
                onClick={() => onSelectAnalysis(analysis)}
                className="p-4 hover:bg-[#0d121d] cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-white">{analysis.title}</div>
                  <div className="text-xs text-slate-400 mt-1">Status: {analysis.status}</div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${analysis.isDemo ? 'bg-amber-900/30 text-amber-500' : 'bg-slate-800 text-slate-300'}`}>
                  {analysis.isDemo ? 'DÉMO' : 'RÉEL'}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 italic">Aucune analyse disponible</div>
          )}
        </div>
      </section>
    </div>
  );
};
