import React, { useState } from 'react';

const tabs = [
  'Vue d\'ensemble', 'Plans de suivi', 'Indicateurs', 'Baselines', 
  'Observations', 'Tendances', 'Anomalies', 'Signaux', 
  'Contradictions', 'Réévaluations', 'Traçabilité', 'Audit'
];

export const IndicatorMonitoringCenterScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-200">
      <h1 className="text-2xl font-bold mb-4 text-white">Centre de Suivi des Indicateurs, Réévaluation et Signaux d'Évolution</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4 bg-slate-800 p-1 rounded">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-xs md:text-sm font-medium rounded ${activeTab === tab ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-white">{activeTab}</h2>
        <p className="text-slate-400">Interface de {activeTab.toLowerCase()}. (En cours de développement selon doctrine LOT 39)</p>
      </div>
    </div>
  );
};
