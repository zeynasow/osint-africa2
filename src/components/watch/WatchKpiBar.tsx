import React from 'react';
import {
  ShieldAlert,
  Activity,
  Clock,
  Eye,
  AlertTriangle,
  Radio,
  FileCheck2,
  TrendingUp,
  HelpCircle,
  PauseCircle,
  Sparkles,
} from 'lucide-react';
import { WatchPilotKpis } from '../../services/watchPilotService';

interface WatchKpiBarProps {
  kpis: WatchPilotKpis;
  isDemoFilter: 'ALL' | 'REAL' | 'DEMO';
  onFilterChange: (filter: 'ALL' | 'REAL' | 'DEMO') => void;
}

export const WatchKpiBar: React.FC<WatchKpiBarProps> = ({
  kpis,
  isDemoFilter,
  onFilterChange,
}) => {
  return (
    <div className="space-y-3" id="watch-pilot-kpis-container">
      {/* Bannière de doctrine analytique professionnelle */}
      <div
        id="doctrinal-pilotage-banner"
        className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Doctrine OSINT :
          </span>
          <span className="text-slate-300">
            Priorité ≠ Vérité • Corrélation ≠ Causalité • Anomalie ≠ Menace • Signal faible ≠ Alerte • Arbitrage humain obligatoire
          </span>
        </div>

        {/* Sélecteur de périmètre RÉEL / DÉMO */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => onFilterChange('ALL')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              isDemoFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tous ({kpis.totalPlans})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('REAL')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
              isDemoFilter === 'REAL'
                ? 'bg-emerald-700/80 text-white shadow-sm'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Réel APS
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('DEMO')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              isDemoFilter === 'DEMO'
                ? 'bg-amber-700/80 text-white shadow-sm'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            Sandbox Démo
          </button>
        </div>
      </div>

      {/* Grille des 10 KPIs dynamiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 gap-2.5">
        {/* 1. Plans actifs */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Actifs</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">{kpis.activePlans}</div>
          <p className="text-[10px] text-emerald-400/80 mt-0.5 font-medium">En veille nominale</p>
        </div>

        {/* 2. Sous surveillance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Surveillance</span>
            <Eye className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">{kpis.underWatchPlans}</div>
          <p className="text-[10px] text-amber-400/80 mt-0.5 font-medium">Attention renforcée</p>
        </div>

        {/* 3. Suspendus */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Suspendus</span>
            <PauseCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">{kpis.suspendedPlans}</div>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Mis en sommeil</p>
        </div>

        {/* 4. Revues en retard ou à venir */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">À revoir</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">{kpis.overdueReviewPlans}</div>
          <p className="text-[10px] text-blue-400/80 mt-0.5 font-medium">Revue &lt; 7 jours</p>
        </div>

        {/* 5. Alertes associées */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Alertes</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">{kpis.linkedAlertsCount}</div>
          <p className="text-[10px] text-rose-400/80 mt-0.5 font-medium">Rattachées aux plans</p>
        </div>

        {/* 6. Signaux & Anomalies */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Signaux</span>
            <Radio className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">{kpis.linkedWeakSignalsCount}</div>
          <p className="text-[10px] text-purple-400/80 mt-0.5 font-medium">Signaux & anomalies</p>
        </div>

        {/* 7. Indicateurs anormaux */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Indicateurs</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">{kpis.abnormalIndicatorsCount}</div>
          <p className="text-[10px] text-amber-400/80 mt-0.5 font-medium">Dépassement seuil</p>
        </div>

        {/* 8. Gaps ouverts */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Gaps</span>
            <HelpCircle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">{kpis.openGapsCount}</div>
          <p className="text-[10px] text-orange-400/80 mt-0.5 font-medium">Lacunes actives</p>
        </div>

        {/* 9. Actions en retard */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Actions</span>
            <FileCheck2 className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">{kpis.overdueActionsCount}</div>
          <p className="text-[10px] text-red-400/80 mt-0.5 font-medium">Échéance échue</p>
        </div>

        {/* 10. Plans à réévaluer */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Prioritaires</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">{kpis.needsReevaluationCount}</div>
          <p className="text-[10px] text-yellow-400/80 mt-0.5 font-medium">Score ≥ 70 / Critique</p>
        </div>
      </div>
    </div>
  );
};
