import React, { useState, useMemo } from 'react';
import { OsintWeakSignal, OsintCorrelation, OsintAnomaly, OsintIndicator } from '../../types';
import { weakSignalService } from '../../services/weakSignalService';
import { anomalyDetectionService } from '../../services/anomalyDetectionService';
import { indicatorService } from '../../services/indicatorService';
import { INITIAL_DEMO_CORRELATIONS } from '../../data/weakSignalDemoData';
import { WeakSignalDetailModal } from '../modals/WeakSignalDetailModal';
import { WeakSignalAssessmentModal } from '../modals/WeakSignalAssessmentModal';
import { 
  Network, 
  Activity, 
  AlertTriangle, 
  Gauge, 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Info, 
  CheckCircle2, 
  Clock, 
  Eye, 
  SlidersHorizontal 
} from 'lucide-react';

export const WeakSignalCenterScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SIGNALS' | 'CORRELATIONS' | 'ANOMALIES' | 'INDICATORS'>('SIGNALS');
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [timeWindow, setTimeWindow] = useState<'24H' | '7J' | '30J' | '90J' | 'PERSONNALISE'>('7J');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  
  const [selectedSignal, setSelectedSignal] = useState<OsintWeakSignal | null>(null);
  const [assessmentSignal, setAssessmentSignal] = useState<OsintWeakSignal | null>(null);

  // Charger les données
  const signals = useMemo(() => weakSignalService.getWeakSignals(isDemo), [isDemo]);
  const anomalies = useMemo(() => anomalyDetectionService.getAnomalies(isDemo), [isDemo]);
  const indicators = useMemo(() => indicatorService.getIndicators(isDemo), [isDemo]);
  const correlations = useMemo(() => INITIAL_DEMO_CORRELATIONS.filter(c => Boolean(c.isDemo) === isDemo), [isDemo]);

  // Filtrage des signaux
  const filteredSignals = useMemo(() => {
    return signals.filter(s => {
      const matchSearch = searchQuery === '' || 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === 'ALL' || s.categoryIds.includes(categoryFilter);
      return matchSearch && matchCategory;
    });
  }, [signals, searchQuery, categoryFilter]);

  const handleExportJSON = () => {
    const dataStr = weakSignalService.exportWeakSignalsJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OSINT_AFRICA_SIGNAUX_FAIBLES_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Centre Avancé des Signaux Faibles & Corrélation
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 font-mono">
              LOT 26
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Détection locale de signaux émergents, calcul d'indicateurs précurseurs et corrélations explicables sans prédiction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Demo / Réel */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setIsDemo(false)}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                !isDemo ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Données Réelles (APS)
            </button>
            <button
              onClick={() => setIsDemo(true)}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                isDemo ? 'bg-indigo-500 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mode Simulation / Démo
            </button>
          </div>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Export Audit JSON
          </button>
        </div>
      </div>

      {/* Doctrinal Warning Banner */}
      <div className="p-4 bg-slate-900/90 border border-amber-500/30 rounded-xl space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-semibold uppercase tracking-wider">
          <Info className="w-4 h-4 shrink-0" />
          Garde-Fous Doctrinaux OSINT AFRICA
        </div>
        <p className="text-slate-300">
          • <strong>CORRÉLATION ≠ CAUSALITÉ</strong> : Toute corrélation temporelle ou géographique est observée sans présumer d'un lien de causalité.
          <br />
          • <strong>SCORE DE PRIORISATION DU SIGNAL (0-100)</strong> : Indice d'intérêt d'investigation pour l'analyste, non une probabilité de survenue.
          <br />
          • <strong>SANS ARBITRAGE HUMAIN, AUCUN ÉVÉNEMENT N'EST CRÉÉ</strong> : Tout signal reste "Non confirmé" tant qu'il n'a pas été validé par un humain.
        </p>
      </div>

      {/* Navigation Tabs & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        {/* Tabs */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          {[
            { id: 'SIGNALS', label: `Signaux Faibles (${filteredSignals.length})`, icon: Network },
            { id: 'CORRELATIONS', label: `Corrélations (${correlations.length})`, icon: Activity },
            { id: 'ANOMALIES', label: `Anomalies Stat. (${anomalies.length})`, icon: AlertTriangle },
            { id: 'INDICATORS', label: `Indicateurs (${indicators.length})`, icon: Gauge }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  active 
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-bold shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Time Window Selector */}
        <div className="flex items-center gap-2 text-xs">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-400">Fenêtre :</span>
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {(['24H', '7J', '30J', '90J', 'PERSONNALISE'] as const).map(w => (
              <button
                key={w}
                onClick={() => setTimeWindow(w)}
                className={`px-2 py-1 rounded text-[11px] font-medium ${
                  timeWindow === w ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'SIGNALS' && (
        <div className="space-y-4">
          {/* Search & Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un signal faible par titre, mots-clés..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">Toutes catégories</option>
              <option value="ENERGY">Infrastructures & Énergie</option>
              <option value="MARITIME">Sécurité Maritime</option>
              <option value="POLITICS">Gouvernance & Politique</option>
            </select>
          </div>

          {/* List of signals */}
          <div className="grid grid-cols-1 gap-4">
            {filteredSignals.map(signal => {
              const scoreResult = weakSignalService.calculateSignalPriorityScore(signal);
              return (
                <div 
                  key={signal.id} 
                  className="p-5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl space-y-3 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-amber-400 font-bold">{signal.id}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                          {signal.signalType}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 font-semibold">
                          {signal.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{signal.title}</h3>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                          Score de Priorisation
                        </span>
                        <span className="text-lg font-black text-amber-400">
                          {scoreResult.score} <span className="text-xs font-normal text-slate-400">/ 100</span>
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedSignal(signal)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        Détails
                      </button>
                      <button
                        onClick={() => setAssessmentSignal(signal)}
                        className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Arbitrer
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {signal.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-400">
                    <div><strong>Pays :</strong> {signal.countryCodes.join(', ') || 'Sénégal'}</div>
                    <div><strong>Evolution :</strong> {signal.evolution}</div>
                    <div><strong>Confiance :</strong> {signal.confidence}</div>
                    <div><strong>Signification :</strong> {signal.significance}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Corrélations */}
      {activeTab === 'CORRELATIONS' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400">
            <strong>Rappel Doctrinal :</strong> La corrélation observe la concomitance temporelle ou spatiale. Elle ne constitue en aucun cas une démonstration de causalité.
          </div>
          <div className="grid grid-cols-1 gap-4">
            {correlations.map(corr => (
              <div key={corr.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs text-amber-400">{corr.id}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{corr.title}</h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                    Type: {corr.correlationType}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{corr.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>Score : <strong className="text-amber-400">{corr.score}/100</strong></span>
                  <span>Pays : <strong>{corr.countryCodes.join(', ')}</strong></span>
                  <span>Confiance : <strong>{corr.confidence}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Anomalies */}
      {activeTab === 'ANOMALIES' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400">
            <strong>Rappel Doctrinal :</strong> Une anomalie statistique mesure un écart à la ligne de base. Une anomalie n'est pas une menace confirmée.
          </div>
          <div className="grid grid-cols-1 gap-4">
            {anomalies.map(ano => (
              <div key={ano.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs text-amber-400">{ano.id}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{ano.type}</h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 font-semibold">
                    Déviation : +{ano.deviation}%
                  </span>
                </div>
                <p className="text-xs text-slate-300">{ano.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>Baseline : {ano.baselineValue}</span>
                  <span>Valeur observée : {ano.observedValue}</span>
                  <span>Statut : {ano.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Indicateurs */}
      {activeTab === 'INDICATORS' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400">
            <strong>Rappel Doctrinal :</strong> Les indicateurs précurseurs (WATCH/ABNORMAL) servent à guider l'attention de la veille.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {indicators.map(ind => (
              <div key={ind.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">{ind.category}</span>
                    <h3 className="text-base font-bold text-white">{ind.name}</h3>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded font-bold ${
                    ind.status === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    ind.status === 'ABNORMAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {ind.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{ind.description}</p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Baseline</span>
                    <span className="font-mono text-slate-300">{ind.baseline}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Actuel</span>
                    <span className="font-mono text-amber-400 font-bold">{ind.currentValue}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Variation</span>
                    <span className="font-mono text-emerald-400">+{ind.variation}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSignal && (
        <WeakSignalDetailModal
          signal={selectedSignal}
          onClose={() => setSelectedSignal(null)}
          onOpenAssessment={() => {
            const sig = selectedSignal;
            setSelectedSignal(null);
            setAssessmentSignal(sig);
          }}
        />
      )}

      {/* Assessment Modal */}
      {assessmentSignal && (
        <WeakSignalAssessmentModal
          signal={assessmentSignal}
          onClose={() => setAssessmentSignal(null)}
          onSave={() => {
            // refresh page view
          }}
        />
      )}
    </div>
  );
};
