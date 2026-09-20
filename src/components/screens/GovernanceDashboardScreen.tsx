import React, { useState } from 'react';
import { Layers, Activity, FileText, BarChart, GitGraph, ShieldAlert, CheckSquare, Search, AlertTriangle, HelpCircle, FileOutput, ShieldCheck } from 'lucide-react';

export function GovernanceDashboardScreen() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const tabs = [
    { id: 'overview', label: 'Vue générale', icon: Layers },
    { id: 'activity', label: 'Activité', icon: Activity },
    { id: 'coverage', label: 'Couverture', icon: FileText },
    { id: 'quality', label: 'Qualité', icon: BarChart },
    { id: 'verification', label: 'Vérification', icon: CheckSquare },
    { id: 'analysis', label: 'Analyse', icon: ShieldAlert },
    { id: 'scenarios', label: 'Scénarios', icon: GitGraph },
    { id: 'monitoring', label: 'Monitoring', icon: Activity },
    { id: 'situation', label: 'Situation', icon: FileOutput },
    { id: 'integrity', label: 'Intégrité', icon: ShieldCheck },
    { id: 'issues', label: 'Incidents', icon: AlertTriangle },
    { id: 'audit', label: 'Audit', icon: Search },
  ];

  return (
    <div className="p-6 h-full overflow-hidden flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Centre de Pilotage Global et de Gouvernance (LOT 41)</h1>
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
