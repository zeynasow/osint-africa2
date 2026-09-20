import React, { useState } from 'react';
import { Target, FileText, BarChart2, ShieldAlert, FileQuestion, Users, Crosshair, CheckSquare, Layers } from 'lucide-react';
import { hypothesisCenterService } from '../../services/hypothesisCenterService';

export const HypothesisCenterScreen: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'REAL' | 'DEMO'>('ALL');
  
  const kpis = hypothesisCenterService.getKpis(filterMode);
  const groups = hypothesisCenterService.getGroups(filterMode);
  const hypotheses = hypothesisCenterService.getHypotheses(filterMode);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center space-x-3">
          <Target className="w-6 h-6 text-amber-500" />
          <div>
            <h2 className="text-lg font-bold text-slate-100">CENTRE DES HYPOTHÈSES</h2>
            <p className="text-xs text-slate-400">Construction, comparaison et évaluation structurée des hypothèses OSINT</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 bg-slate-900 rounded-lg p-1">
          <button 
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filterMode === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Tous
          </button>
          <button 
            onClick={() => setFilterMode('REAL')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filterMode === 'REAL' ? 'bg-emerald-900/60 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Réel opérationnel
          </button>
          <button 
            onClick={() => setFilterMode('DEMO')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filterMode === 'DEMO' ? 'bg-amber-900/60 text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Démonstration
          </button>
        </div>
      </div>
      
      {/* Rules Notice */}
      <div className="bg-slate-800 border-b border-slate-700 p-2 text-xs flex justify-center space-x-6 text-slate-400">
        <span><span className="text-amber-500 font-bold">RÈGLE 1:</span> SCORE ≠ PROBABILITÉ</span>
        <span><span className="text-amber-500 font-bold">RÈGLE 2:</span> CONVERGENCE ≠ INDÉPENDANCE</span>
        <span><span className="text-amber-500 font-bold">RÈGLE 3:</span> CORRÉLATION ≠ CAUSALITÉ</span>
        <span><span className="text-amber-500 font-bold">RÈGLE 4:</span> HYPOTHÈSE ≠ FAIT</span>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-200">{kpis.activeCount}</span>
            <span className="text-xs text-slate-400 text-center mt-1">Actives</span>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-blue-400">{kpis.evaluatingCount}</span>
            <span className="text-xs text-slate-400 text-center mt-1">En évaluation</span>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-emerald-400">{kpis.supportedCount}</span>
            <span className="text-xs text-slate-400 text-center mt-1">Soutenues</span>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-rose-400">{kpis.contestedCount}</span>
            <span className="text-xs text-slate-400 text-center mt-1">Contestées</span>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-amber-400">{kpis.insufficientCount}</span>
            <span className="text-xs text-slate-400 text-center mt-1">Insuffisantes</span>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-500">{kpis.discardedCount}</span>
            <span className="text-xs text-slate-400 text-center mt-1">Écartées</span>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-purple-400">{kpis.openDiscriminantsCount}</span>
            <span className="text-xs text-slate-400 text-center mt-1">Discrim. Ouverts</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {groups.map(group => {
            const groupHypotheses = hypotheses.filter(h => group.hypothesisIds.includes(h.id));
            
            return (
              <div key={group.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <FileQuestion className="w-5 h-5 text-blue-400" />
                      <h3 className="text-sm font-semibold text-slate-300">QUESTION ANALYTIQUE</h3>
                      {group.isDemo && <span className="bg-amber-900/40 text-amber-400 text-[10px] px-2 py-0.5 rounded font-mono">DÉMO</span>}
                    </div>
                    <p className="text-lg font-medium text-slate-100">{group.question}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Analyste: {group.analystId}</span>
                    <span className="text-xs text-slate-500 block">MAJ: {new Date(group.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="p-4 overflow-x-auto">
                  <div className="flex space-x-4 min-w-max">
                    {groupHypotheses.map(hyp => (
                      <div key={hyp.id} className="w-80 bg-slate-900 border border-slate-700 rounded-lg p-4 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs px-2 py-1 rounded font-bold ${
                            hyp.status === 'SOUTENUE' ? 'bg-emerald-900/50 text-emerald-400' :
                            hyp.status === 'FRAGILE' ? 'bg-amber-900/50 text-amber-400' :
                            hyp.status === 'CONTESTEE' ? 'bg-rose-900/50 text-rose-400' :
                            hyp.status === 'ECARTEE' ? 'bg-slate-800 text-slate-500' :
                            'bg-blue-900/50 text-blue-400'
                          }`}>
                            {hyp.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-mono text-slate-500">{hyp.id}</span>
                        </div>
                        
                        <h4 className="font-bold text-slate-200 mb-2 line-clamp-2" title={hyp.title}>{hyp.title}</h4>
                        <p className="text-xs text-slate-400 mb-4 line-clamp-3 italic">"{hyp.statement}"</p>
                        
                        <div className="mt-auto space-y-3">
                          <div className="bg-slate-800 p-2 rounded text-xs">
                            <div className="flex justify-between mb-1">
                              <span className="text-slate-400">Soutien analytique</span>
                              <span className="font-bold text-slate-200">{hyp.supportScore ?? 0}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, hyp.supportScore ?? 0)}%` }}></div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="bg-emerald-900/20 border border-emerald-900/50 rounded p-1.5 flex justify-between items-center text-emerald-400">
                              <span>Favorables</span>
                              <span className="font-bold text-sm">{hyp.supportingEvidenceCount ?? 0}</span>
                            </div>
                            <div className="bg-rose-900/20 border border-rose-900/50 rounded p-1.5 flex justify-between items-center text-rose-400">
                              <span>Défavorables</span>
                              <span className="font-bold text-sm">{hyp.contradictingEvidenceCount ?? 0}</span>
                            </div>
                            <div className="bg-slate-800 border border-slate-700 rounded p-1.5 flex justify-between items-center text-slate-300">
                              <span>Neutres</span>
                              <span className="font-bold text-sm">{hyp.neutralEvidenceCount ?? 0}</span>
                            </div>
                            <div className="bg-amber-900/20 border border-amber-900/50 rounded p-1.5 flex justify-between items-center text-amber-400">
                              <span>Lacunes</span>
                              <span className="font-bold text-sm">{hyp.gapsCount ?? 0}</span>
                            </div>
                          </div>
                          
                          <button className="w-full mt-2 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium text-slate-200 transition-colors">
                            OUVRIR L'ÉVALUATION
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {group.conclusion && (
                  <div className="bg-slate-900/50 border-t border-slate-700 p-4">
                    <h4 className="text-xs font-bold text-slate-400 mb-1">APPRÉCIATION ANALYTIQUE</h4>
                    <p className="text-sm text-slate-300">{group.conclusion}</p>
                    <p className="text-[10px] text-slate-500 mt-2 italic">Cette appréciation reflète l'état des informations disponibles à la date de l'évaluation. Elle peut évoluer avec l'arrivée de nouveaux éléments.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HypothesisCenterScreen;
