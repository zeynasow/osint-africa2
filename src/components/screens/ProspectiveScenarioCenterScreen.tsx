
import React, { useState } from 'react';

const tabs = ['overview', 'cadres', 'scenarios', 'comparaison', 'hypotheses', 'indicateurs', 'triggers', 'discriminants', 'reevaluations', 'incertitudes', 'tracabilite', 'audit'];

export const ProspectiveScenarioCenterScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Centre d'Anticipation, de Scénarios et d'Indicateurs Précurseurs</h1>
      <div className="grid grid-cols-4 lg:grid-cols-6 gap-2 mb-4 bg-slate-800 p-1">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm font-medium rounded ${activeTab === tab ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
        <p>Contenu pour {activeTab}</p>
      </div>
    </div>
  );
};
