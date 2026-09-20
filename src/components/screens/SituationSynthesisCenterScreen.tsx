import React, { useState } from 'react';
import { Layers, FileText, BarChart, AlertTriangle, HelpCircle, CheckSquare, Search, GitGraph, Activity, ShieldAlert, FileOutput } from 'lucide-react';

export function SituationSynthesisCenterScreen() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Layers },
    { id: 'current', label: 'Situation courante', icon: Activity },
    { id: 'facts', label: 'Faits', icon: FileText },
    { id: 'developments', label: 'Développements', icon: BarChart },
    { id: 'evolutions', label: 'Évolutions', icon: GitGraph },
    { id: 'assessments', label: 'Appréciations', icon: ShieldAlert },
    { id: 'scenarios', label: 'Scénarios', icon: Layers },
    { id: 'indicators', label: 'Indicateurs', icon: Activity },
    { id: 'contradictions', label: 'Contradictions', icon: AlertTriangle },
    { id: 'gaps', label: 'Lacunes', icon: HelpCircle },
    { id: 'monitoring', label: 'Points à surveiller', icon: Search },
    { id: 'validation', label: 'Validation / Audit', icon: CheckSquare },
  ];

  return (
    <div className="p-6 h-full overflow-hidden flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Centre de Synthèse Situationnelle et de Situation Courante (LOT 40)</h1>
      </div>
      
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-600/20 text-amber-300 border border-amber-600/50'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-y-auto">
        <p className="text-slate-400">Contenu pour l'onglet : {tabs.find(t => t.id === activeTab)?.label}</p>
      </div>
    </div>
  );
}
