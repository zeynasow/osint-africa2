import React, { useState } from 'react';
import {
  Activity, AlertTriangle, Radio, GitMerge, AlertOctagon,
  TrendingUp, Users, HelpCircle, FileCheck, Layers,
  Briefcase, ArrowRight, ShieldAlert, CheckCircle2, XCircle,
  ExternalLink, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import {
  OsintEvent, OsintAlert, OsintWeakSignal, OsintCorrelation,
  OsintAnomaly, OsintIndicator, OsintActor, OsintHypothesis,
  OsintEvidence, OsintCase, OsintAlertContradiction
} from '../../types';

interface SituationEntitiesGridProps {
  events: OsintEvent[];
  alerts: OsintAlert[];
  weakSignals: OsintWeakSignal[];
  correlations: OsintCorrelation[];
  anomalies: OsintAnomaly[];
  indicators: OsintIndicator[];
  actors: OsintActor[];
  hypotheses: OsintHypothesis[];
  evidence: OsintEvidence[];
  questions: Array<{ id: string; text: string; priority: string; status: string; assignee?: string; date?: string }>;
  intelligenceGaps: Array<{ id: string; title: string; priority: string; status: string; description: string; missingElements?: string[] }>;
  contradictions: OsintAlertContradiction[];
  cases: OsintCase[];
  onOpenCaseModal: (caseId: string) => void;
  onSelectEvent?: (eventId: string) => void;
}

export const SituationEntitiesGrid: React.FC<SituationEntitiesGridProps> = ({
  events,
  alerts,
  weakSignals,
  correlations,
  anomalies,
  indicators,
  actors,
  hypotheses,
  evidence,
  questions,
  intelligenceGaps,
  contradictions,
  cases,
  onOpenCaseModal,
  onSelectEvent,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'ALL' | 'EVENTS' | 'ALERTS' | 'SIGNALS_ANOMALIES' | 'ACTORS' | 'ANALYSIS' | 'CASES'
  >('ALL');

  return (
    <div className="space-y-6">
      {/* Sélecteur de sous-vues d'agrégation */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0b0f19] border border-slate-800/80 rounded-xl text-xs">
        {[
          { id: 'ALL', label: 'Vue Globale des 12 Briques' },
          { id: 'EVENTS', label: `Événements (${events.length})` },
          { id: 'ALERTS', label: `Alertes (${alerts.length})` },
          { id: 'SIGNALS_ANOMALIES', label: `Signaux, Corrélations & Anomalies (${weakSignals.length + correlations.length + anomalies.length})` },
          { id: 'ACTORS', label: `Acteurs & Indicateurs (${actors.length + indicators.length})` },
          { id: 'ANALYSIS', label: `Hypothèses, Preuves & Lacunes (${hypotheses.length + evidence.length + intelligenceGaps.length})` },
          { id: 'CASES', label: `Dossiers Lot 27 (${cases.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === tab.id
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: ÉVÉNEMENTS RÉCENTS */}
      {(activeSubTab === 'ALL' || activeSubTab === 'EVENTS') && (
        <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              Événements Rattachés à la Situation ({events.length})
            </h3>
            <span className="text-[11px] text-slate-400">Faits constatés et normalisés</span>
          </div>

          {events.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 italic bg-[#0e1422] rounded-lg border border-slate-800/40">
              Aucun événement rattaché à cette situation pour les filtres sélectionnés.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent && onSelectEvent(evt.id)}
                  className="bg-[#0e1422] border border-slate-800/90 rounded-lg p-3 hover:border-sky-500/50 transition cursor-pointer space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-white group-hover:text-sky-300 transition line-clamp-1">
                      {evt.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                        evt.isDemo
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                          : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                      }`}
                    >
                      {evt.isDemo ? 'DÉMO' : 'RÉEL'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {evt.summary || evt.description}
                  </p>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      {evt.country || evt.countryName} • {evt.category}
                    </span>
                    <span className="font-mono">
                      {(evt.publishedAt || evt.detectedAt || '').substring(0, 10)}
                    </span>
                  </div>

                  <div className="text-[9px] text-slate-400 truncate">
                    Source: {evt.sourceName || (evt.source ? evt.source.name : 'Non spécifiée')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: ALERTES À EXAMINER & CONTRADICTIONS */}
      {(activeSubTab === 'ALL' || activeSubTab === 'ALERTS') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Colonne Alertes (2 cols) */}
          <div className="lg:col-span-2 bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Alertes Qualifiées & Flux Prioritaire ({alerts.length})
              </h3>
              <span className="text-[11px] text-slate-400">Triage P1-P4</span>
            </div>

            {alerts.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 italic bg-[#0e1422] rounded-lg border border-slate-800/40">
                Aucune alerte correspondante aux filtres actuels.
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="bg-[#0e1422] border border-slate-800/80 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-rose-900/60 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                            alt.priority === 'P1_CRITICAL' || alt.priority === 'CRITICAL'
                              ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                              : 'bg-amber-950/60 text-amber-300 border-amber-800'
                          }`}
                        >
                          {alt.priority || 'P2'}
                        </span>
                        <span className="text-xs font-semibold text-white">{alt.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{alt.summary}</div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-[10px] text-slate-400">
                      <span>Score: <strong className="text-white">{alt.priorityScore || 85}/100</strong></span>
                      <span className="px-1.5 py-0.5 bg-slate-800 rounded font-mono">{alt.status}</span>
                      <span
                        className={`font-bold px-1 py-0.5 rounded border text-[9px] ${
                          alt.isDemo
                            ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                            : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                        }`}
                      >
                        {alt.isDemo ? 'DÉMO' : 'RÉEL'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Colonne Contradictions (1 col) */}
          <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Contradictions Détectées ({contradictions.length})
              </h3>
            </div>
            <div className="text-[10px] text-amber-400/90 font-medium">
              Règle stricte : Ne jamais résoudre automatiquement une contradiction.
            </div>

            {contradictions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 italic bg-[#0e1422] rounded-lg border border-slate-800/40">
                Aucune contradiction non arbitrée.
              </div>
            ) : (
              <div className="space-y-2.5">
                {contradictions.map((c) => (
                  <div key={c.id} className="bg-[#0e1422] border border-amber-900/40 rounded-lg p-2.5 space-y-1.5">
                    <div className="text-xs font-semibold text-amber-300">{c.nature}</div>
                    <div className="text-[11px] text-slate-300 leading-tight">
                      {c.description}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>Niveau: <strong className="text-white">{c.contradictionLevel || 'HIGH'}</strong></span>
                      <span className="text-amber-400 font-mono">Arbitrage humain requis</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: SIGNAUX FAIBLES, CORRÉLATIONS & ANOMALIES */}
      {(activeSubTab === 'ALL' || activeSubTab === 'SIGNALS_ANOMALIES') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Signaux faibles */}
          <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400" />
                Signaux Faibles ({weakSignals.length})
              </h3>
            </div>
            {weakSignals.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 italic bg-[#0e1422] rounded-lg border border-slate-800/40">
                Aucun signal faible répertorié.
              </div>
            ) : (
              <div className="space-y-2">
                {weakSignals.map((ws) => (
                  <div key={ws.id} className="bg-[#0e1422] border border-slate-800 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                      <span className="line-clamp-1">{ws.title}</span>
                      <span className="text-[10px] text-amber-400 font-mono">{ws.confidence}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{ws.description}</p>
                    <div className="text-[9px] text-slate-400 font-mono">
                      Zone : {ws.countryCodes?.join(', ') || 'Régionale'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Corrélations */}
          <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-indigo-400" />
                Corrélations ({correlations.length})
              </h3>
            </div>
            <div className="text-[10px] text-indigo-300/80 font-medium">
              Rappel doctrinal : CORRÉLATION ≠ CAUSALITÉ
            </div>
            {correlations.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 italic bg-[#0e1422] rounded-lg border border-slate-800/40">
                Aucune corrélation active.
              </div>
            ) : (
              <div className="space-y-2">
                {correlations.map((corr) => (
                  <div key={corr.id} className="bg-[#0e1422] border border-slate-800 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                      <span className="line-clamp-1">{corr.title}</span>
                      <span className="text-[10px] text-indigo-400 font-mono">
                        Score: {corr.score}/{corr.maxScore || 8}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{corr.description}</p>
                    <div className="text-[9px] text-slate-400">
                      Type: {corr.correlationType || 'Spatio-temporelle'} • Statut: {corr.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Anomalies */}
          <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-orange-400" />
                Anomalies Détectées ({anomalies.length})
              </h3>
            </div>
            <div className="text-[10px] text-orange-300/80 font-medium">
              Rappel doctrinal : ANOMALIE ≠ MENACE CONFIRMÉE
            </div>
            {anomalies.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 italic bg-[#0e1422] rounded-lg border border-slate-800/40">
                Aucune anomalie détectée.
              </div>
            ) : (
              <div className="space-y-2">
                {anomalies.map((ano) => (
                  <div key={ano.id} className="bg-[#0e1422] border border-slate-800 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-orange-300">
                      <span>Anomalie {ano.type}</span>
                      <span className="text-[10px] font-mono text-white">+{ano.deviation}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{ano.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>Baseline: {ano.baselineValue}</span>
                      <span>Observé: {ano.observedValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: ACTEURS & INDICATEURS */}
      {(activeSubTab === 'ALL' || activeSubTab === 'ACTORS') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Acteurs */}
          <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Acteurs Associés ({actors.length})
              </h3>
            </div>
            <div className="text-[10px] text-purple-300/80 font-medium">
              Rappel doctrinal : Présence informationnelle ≠ attribution ou culpabilité
            </div>
            {actors.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 italic bg-[#0e1422] rounded-lg border border-slate-800/40">
                Aucun acteur associé directement.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {actors.map((act) => (
                  <div key={act.id} className="bg-[#0e1422] border border-slate-800 rounded-lg p-3 space-y-1">
                    <div className="text-xs font-semibold text-white flex items-center justify-between">
                      <span className="truncate">{act.name}</span>
                      <span className="text-[9px] font-mono bg-purple-950/60 text-purple-300 px-1 py-0.5 rounded border border-purple-800/40">
                        {act.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">Pays : {act.country || 'Régional'}</div>
                    <div className="text-[10px] text-slate-400">
                      Événements reliés : {act.eventsCount || 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Indicateurs */}
          <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Indicateurs Clés de Situation ({indicators.length})
              </h3>
            </div>
            {indicators.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 italic bg-[#0e1422] rounded-lg border border-slate-800/40">
                Aucun indicateur de suivi rattaché.
              </div>
            ) : (
              <div className="space-y-2">
                {indicators.map((ind) => (
                  <div key={ind.id} className="bg-[#0e1422] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{ind.name}</div>
                      <div className="text-[10px] text-slate-400">
                        Seuil critique : {ind.threshold || 50} • Statut : {ind.status}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-white">
                        {ind.currentValue} {ind.unit || ''}
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        Baseline: {ind.baselineValue}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: HYPOTHÈSES, PREUVES & LACUNES */}
      {(activeSubTab === 'ALL' || activeSubTab === 'ANALYSIS') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Hypothèses */}
          <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                Hypothèses Analytiques ({hypotheses.length})
              </h3>
            </div>
            <div className="text-[10px] text-cyan-400/90 font-medium">
              Règle : Une hypothèse ne doit jamais être affichée comme un fait.
            </div>
            {hypotheses.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 italic bg-[#0e1422] rounded-lg border border-slate-800/40">
                Aucune hypothèse consignée.
              </div>
            ) : (
              <div className="space-y-2">
                {hypotheses.map((h) => (
                  <div key={h.id} className="bg-[#0e1422] border border-slate-800 rounded-lg p-3 space-y-1.5">
                    <div className="text-xs font-semibold text-cyan-300">{h.title}</div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">{h.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>Statut: {h.status}</span>
                      <span className="text-cyan-400 font-mono">Confiance: {h.confidenceScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preuves */}
          <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Preuves & Éléments Matériels ({evidence.length})
              </h3>
            </div>
            {evidence.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 italic bg-[#0e1422] rounded-lg border border-slate-800/40">
                Aucune preuve versée au dossier de situation.
              </div>
            ) : (
              <div className="space-y-2">
                {evidence.map((ev) => (
                  <div key={ev.id} className="bg-[#0e1422] border border-slate-800 rounded-lg p-3 space-y-1">
                    <div className="text-xs font-semibold text-white">{ev.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{ev.sourceName}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>Type: {ev.evidenceType}</span>
                      <span className="text-emerald-400 font-mono">
                        Fiabilité: {ev.reliabilityScore ? `${ev.reliabilityScore}%` : 'Élevée'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Questions & Lacunes */}
          <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Questions & Lacunes ({questions.length + intelligenceGaps.length})
              </h3>
            </div>

            <div className="space-y-3">
              {/* Questions analytiques */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Questions analytiques en suspens ({questions.length})
                </div>
                {questions.length === 0 ? (
                  <div className="text-[11px] text-slate-400 italic">Aucune question ouverte.</div>
                ) : (
                  <div className="space-y-1.5">
                    {questions.map((q) => (
                      <div key={q.id} className="bg-[#0e1422] border border-slate-800 p-2 rounded text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="text-sky-400 font-bold">•</span>
                        <span className="leading-snug">{q.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lacunes de renseignement */}
              <div className="pt-2 border-t border-slate-800">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 mb-1.5">
                  Lacunes de renseignement (Gaps) ({intelligenceGaps.length})
                </div>
                {intelligenceGaps.length === 0 ? (
                  <div className="text-[11px] text-slate-400 italic">Aucune lacune critique identifiée.</div>
                ) : (
                  <div className="space-y-1.5">
                    {intelligenceGaps.map((gap) => (
                      <div key={gap.id} className="bg-[#0e1422] border border-amber-900/30 p-2 rounded text-xs text-amber-300/90 leading-snug">
                        <strong>{gap.title} :</strong> {gap.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: DOSSIERS D'INVESTIGATION (LOT 27) */}
      {(activeSubTab === 'ALL' || activeSubTab === 'CASES') && (
        <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                Dossiers d'Investigation LOT 27 Associés ({cases.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Accès direct au module complet de gestion des dossiers. Cliquez pour ouvrir la fiche détaillée LOT 27.
              </p>
            </div>
          </div>

          {cases.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 italic bg-[#0e1422] rounded-lg border border-slate-800/40">
              Aucun dossier d'investigation rattaché à cette situation.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onOpenCaseModal(c.id)}
                  className="bg-[#0e1422] border border-slate-800/90 rounded-lg p-3 hover:border-cyan-500/50 hover:bg-[#11192a] transition cursor-pointer space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition line-clamp-1">
                      {c.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                        c.priority === 'CRITICAL' || c.priority === 'HIGH'
                          ? 'bg-rose-950/60 text-rose-400 border-rose-800/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {c.priority}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {c.summary || c.description}
                  </p>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Progression</span>
                      <span className="font-mono text-white">{c.progress || 0}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${c.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Statut : <strong className="text-white">{c.status}</strong></span>
                    <span className="text-cyan-400 group-hover:underline flex items-center gap-1">
                      Inspecter LOT 27 <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
