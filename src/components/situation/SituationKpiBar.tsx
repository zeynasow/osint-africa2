import React from 'react';
import { 
  Activity, AlertTriangle, Radio, GitMerge, AlertOctagon, 
  TrendingUp, Briefcase, Users, ShieldAlert, Layers
} from 'lucide-react';

interface SituationKpiBarProps {
  eventCount: number;
  alertCount: number;
  criticalAlertCount: number;
  weakSignalCount: number;
  correlationCount: number;
  anomalyCount: number;
  indicatorCount: number;
  activeCaseCount: number;
  actorCount: number;
}

export const SituationKpiBar: React.FC<SituationKpiBarProps> = ({
  eventCount,
  alertCount,
  criticalAlertCount,
  weakSignalCount,
  correlationCount,
  anomalyCount,
  indicatorCount,
  activeCaseCount,
  actorCount,
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Événements */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-3 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Événements</span>
            <Activity className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">{eventCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Faits répertoriés</div>
        </div>

        {/* Alertes */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-3 hover:border-rose-900/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Alertes</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-rose-400 tracking-tight">{alertCount}</span>
            {criticalAlertCount > 0 && (
              <span className="text-[10px] font-semibold text-rose-300 bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-800/40">
                {criticalAlertCount} P1
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">À qualifier / qualifiées</div>
        </div>

        {/* Signaux Faibles */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-3 hover:border-amber-900/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Signaux</span>
            <Radio className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 tracking-tight">{weakSignalCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Précurseurs détectés</div>
        </div>

        {/* Corrélations */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-3 hover:border-indigo-900/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Corrélations</span>
            <GitMerge className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-indigo-400 tracking-tight">{correlationCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Relations observées</div>
        </div>

        {/* Anomalies */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-3 hover:border-orange-900/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Anomalies</span>
            <AlertOctagon className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-xl font-bold text-orange-400 tracking-tight">{anomalyCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Écarts baseline</div>
        </div>

        {/* Indicateurs */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-3 hover:border-emerald-900/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Indicateurs</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 tracking-tight">{indicatorCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Mesures continues</div>
        </div>

        {/* Dossiers Lot 27 */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-3 hover:border-cyan-900/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Dossiers</span>
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400 tracking-tight">{activeCaseCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Enquêtes Lot 27</div>
        </div>

        {/* Acteurs */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-3 hover:border-purple-900/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Acteurs</span>
            <Users className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400 tracking-tight">{actorCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Entités suivies</div>
        </div>
      </div>

      {/* Rappels doctrinaux stricts */}
      <div className="flex flex-wrap gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-950/40 border border-indigo-800/40 rounded-md text-indigo-300">
          <ShieldAlert className="w-3 h-3 text-indigo-400" />
          <strong>Rappel doctrinal :</strong> CORRÉLATION ≠ CAUSALITÉ
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-950/40 border border-orange-800/40 rounded-md text-orange-300">
          <AlertOctagon className="w-3 h-3 text-orange-400" />
          <strong>Rappel doctrinal :</strong> ANOMALIE ≠ MENACE CONFIRMÉE
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/40 border border-purple-800/40 rounded-md text-purple-300">
          <Users className="w-3 h-3 text-purple-400" />
          <strong>Rappel doctrinal :</strong> Présence informationnelle ≠ attribution ou responsabilité
        </span>
      </div>
    </div>
  );
};
