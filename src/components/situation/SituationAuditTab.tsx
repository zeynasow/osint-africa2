import React from 'react';
import { History, Shield, CheckCircle, Clock, FileText, Download } from 'lucide-react';
import { OsintSituationAudit } from '../../services/situationCenterService';
import { OsintProvenance } from '../../types';

interface SituationAuditTabProps {
  audits: OsintSituationAudit[];
  provenances: OsintProvenance[];
  currentSituationTitle: string;
}

export const SituationAuditTab: React.FC<SituationAuditTabProps> = ({
  audits,
  provenances,
  currentSituationTitle,
}) => {
  return (
    <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-5 space-y-5">
      {/* Entête */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-sky-400" />
            Traçabilité & Journal d'Audit Opérationnel
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Historique immuable des arbitrages, modifications d'état et consultations de la situation.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Situation : <span className="text-sky-300 font-semibold">{currentSituationTitle}</span>
        </div>
      </div>

      {/* Journal d'audit de la situation */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          Actions & Arbitrages Enregistrés ({audits.length})
        </h3>

        {audits.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 italic bg-[#0e1422] rounded-lg border border-slate-800/40">
            Aucun événement d'audit consigné pour cette situation.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-[#0e1422] text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Date & Heure</th>
                  <th className="p-2.5">Action</th>
                  <th className="p-2.5">Analyste</th>
                  <th className="p-2.5">Détails / Justification</th>
                  <th className="p-2.5">Changement d'état</th>
                  <th className="p-2.5">Origine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-[#0a0e17]">
                {audits.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-2.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {a.timestamp.replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.action === 'STATUS_CHANGE'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                            : a.action === 'EXPORT'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            : 'bg-sky-950/60 text-sky-400 border border-sky-800/40'
                        }`}
                      >
                        {a.action}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-300 font-medium whitespace-nowrap">{a.analystId}</td>
                    <td className="p-2.5 text-slate-300 max-w-xs">{a.details}</td>
                    <td className="p-2.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {a.oldValue && a.newValue ? `${a.oldValue} ➔ ${a.newValue}` : '—'}
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          a.isDemo
                            ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                            : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                        }`}
                      >
                        {a.isDemo ? 'DÉMO' : 'RÉEL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registre de Provenance Documentaire */}
      <div className="space-y-3 pt-4 border-t border-slate-800/60">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          Chaîne de Provenance & Fiabilité des Sources ({provenances.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {provenances.slice(0, 4).map((p) => (
            <div key={p.id} className="bg-[#0e1422] border border-slate-800 p-3 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span className="truncate">{p.sourceName}</span>
                <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                  Reliability: {p.reliability || 'B2'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                <strong>Type de transformation :</strong> {p.transformationType}
              </div>
              <div className="text-[11px] text-slate-400">
                <strong>Réf d'origine :</strong> {p.originalReference || 'N/A'}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                <span>Collecte : {p.observationDate || p.publicationDate || '2026-09'}</span>
                <span>Complétude : {p.completeness}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
