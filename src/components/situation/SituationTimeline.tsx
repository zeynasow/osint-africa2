import React, { useState, useMemo } from 'react';
import { Clock, Calendar, Activity, AlertTriangle, Radio, GitMerge, AlertOctagon, ExternalLink } from 'lucide-react';
import { OsintEvent, OsintAlert, OsintWeakSignal, OsintCorrelation, OsintAnomaly } from '../../types';

export interface TimelineItem {
  id: string;
  type: 'EVENT' | 'ALERT' | 'SIGNAL' | 'CORRELATION' | 'ANOMALY';
  title: string;
  description: string;
  date: string;
  country?: string;
  category?: string;
  severityOrConfidence?: string;
  isDemo: boolean;
  provenance?: string;
  sourceName?: string;
}

interface SituationTimelineProps {
  events: OsintEvent[];
  alerts: OsintAlert[];
  weakSignals: OsintWeakSignal[];
  correlations: OsintCorrelation[];
  anomalies: OsintAnomaly[];
  onSelectEvent?: (id: string) => void;
  onSelectAlert?: (id: string) => void;
}

export const SituationTimeline: React.FC<SituationTimelineProps> = ({
  events,
  alerts,
  weakSignals,
  correlations,
  anomalies,
  onSelectEvent,
  onSelectAlert,
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | '24h' | '7d' | '30d' | '90d'>('all');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'EVENT' | 'ALERT' | 'SIGNAL' | 'CORRELATION' | 'ANOMALY'>('ALL');

  // Unified items
  const allTimelineItems = useMemo(() => {
    const items: TimelineItem[] = [];

    // Events
    events.forEach((e) => {
      const d = e.publishedAt || e.detectedAt || e.createdAt || e.date;
      if (d) {
        items.push({
          id: e.id,
          type: 'EVENT',
          title: e.title,
          description: e.summary || e.description || '',
          date: d,
          country: e.country || e.countryName || e.countryId,
          category: e.category,
          severityOrConfidence: e.confidence || (e.confidenceScore ? `${e.confidenceScore}%` : undefined),
          isDemo: Boolean(e.isDemo),
          provenance: e.sourceName || (e.source ? e.source.name : undefined) || 'Source OSINT',
          sourceName: e.sourceName || (e.source ? e.source.name : undefined),
        });
      }
    });

    // Alerts
    alerts.forEach((a) => {
      const d = a.detectedAt || a.timestamp || a.createdAt;
      if (d) {
        items.push({
          id: a.id,
          type: 'ALERT',
          title: a.title,
          description: a.summary || '',
          date: d,
          country: a.country || a.countryName || a.countryId,
          category: a.category,
          severityOrConfidence: a.priority || a.severity,
          isDemo: Boolean(a.isDemo),
          provenance: a.sourceName || 'Pôle Traitement des Alertes',
          sourceName: a.sourceName,
        });
      }
    });

    // Weak Signals
    weakSignals.forEach((s) => {
      const d = s.lastObservedAt || s.firstObservedAt || s.createdAt;
      if (d) {
        items.push({
          id: s.id,
          type: 'SIGNAL',
          title: s.title,
          description: s.description || '',
          date: d,
          country: s.countryCodes?.join(', '),
          category: s.categoryIds?.join(', '),
          severityOrConfidence: s.confidence,
          isDemo: Boolean(s.isDemo),
          provenance: 'Moteur de Détection Signaux Faibles',
        });
      }
    });

    // Correlations
    correlations.forEach((c) => {
      const d = c.lastObservedAt || c.firstObservedAt || c.createdAt;
      if (d) {
        items.push({
          id: c.id,
          type: 'CORRELATION',
          title: c.title,
          description: c.description || '',
          date: d,
          country: c.countryCodes?.join(', '),
          category: c.categoryIds?.join(', '),
          severityOrConfidence: `Score: ${c.score}/${c.maxScore || 8}`,
          isDemo: Boolean(c.isDemo),
          provenance: 'Moteur Analytique de Corrélation',
        });
      }
    });

    // Anomalies
    anomalies.forEach((ano) => {
      const d = ano.detectedAt || ano.createdAt;
      if (d) {
        items.push({
          id: ano.id,
          type: 'ANOMALY',
          title: `Anomalie ${ano.type}: ${ano.description}`,
          description: `Baseline: ${ano.baselineValue} | Observé: ${ano.observedValue} (Variation: +${ano.deviation}%)`,
          date: d,
          severityOrConfidence: ano.severity,
          isDemo: Boolean(ano.isDemo),
          provenance: 'Détecteur Local d’Anomalies Statistiques',
        });
      }
    });

    // Sort by date desc
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items;
  }, [events, alerts, weakSignals, correlations, anomalies]);

  // Filtered by time
  const filteredTimeline = useMemo(() => {
    let result = allTimelineItems;

    if (typeFilter !== 'ALL') {
      result = result.filter((item) => item.type === typeFilter);
    }

    if (timeFilter !== 'all') {
      // Find latest date in dataset to avoid anchor issues with demo historical dates
      const maxDate = result.length > 0 ? new Date(result[0].date).getTime() : Date.now();
      const hoursMap: Record<string, number> = {
        '24h': 24,
        '7d': 24 * 7,
        '30d': 24 * 30,
        '90d': 24 * 90,
      };
      const limitMs = hoursMap[timeFilter] * 60 * 60 * 1000;
      result = result.filter((item) => {
        const itemTime = new Date(item.date).getTime();
        return maxDate - itemTime <= limitMs;
      });
    }

    return result;
  }, [allTimelineItems, timeFilter, typeFilter]);

  const getTypeBadge = (type: TimelineItem['type']) => {
    switch (type) {
      case 'EVENT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-950/60 text-sky-400 border border-sky-800/40">
            <Activity className="w-3 h-3" /> ÉVÉNEMENT
          </span>
        );
      case 'ALERT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950/60 text-rose-400 border border-rose-800/40">
            <AlertTriangle className="w-3 h-3" /> ALERTE
          </span>
        );
      case 'SIGNAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/40">
            <Radio className="w-3 h-3" /> SIGNAL FAIBLE
          </span>
        );
      case 'CORRELATION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950/60 text-indigo-400 border border-indigo-800/40">
            <GitMerge className="w-3 h-3" /> CORRÉLATION
          </span>
        );
      case 'ANOMALY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-950/60 text-orange-400 border border-orange-800/40">
            <AlertOctagon className="w-3 h-3" /> ANOMALIE
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 space-y-4">
      {/* Entête Chronologie */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            Chronologie Intégrée de Situation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Séquence temporelle réelle combinant faits, alertes qualifiées, signaux, corrélations et anomalies.
          </p>
        </div>

        {/* Filtres Temporels */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#131926] border border-slate-800 rounded-lg p-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {(['all', '24h', '7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setTimeFilter(p)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  timeFilter === p
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p === 'all' ? 'Toutes' : p.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Filtre par type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-[#131926] border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">Tous les types ({allTimelineItems.length})</option>
            <option value="EVENT">Événements</option>
            <option value="ALERT">Alertes</option>
            <option value="SIGNAL">Signaux faibles</option>
            <option value="CORRELATION">Corrélations</option>
            <option value="ANOMALY">Anomalies</option>
          </select>
        </div>
      </div>

      {/* Liste temporelle */}
      {filteredTimeline.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs italic bg-[#0d121d] rounded-lg border border-slate-800/40">
          Aucun événement ni signal répertorié sur la plage temporelle sélectionnée.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {filteredTimeline.map((item) => (
            <div key={`${item.type}-${item.id}`} className="relative group">
              {/* Point sur la timeline */}
              <div
                className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#0b0f19] ${
                  item.type === 'EVENT'
                    ? 'bg-sky-400'
                    : item.type === 'ALERT'
                    ? 'bg-rose-500'
                    : item.type === 'SIGNAL'
                    ? 'bg-amber-400'
                    : item.type === 'CORRELATION'
                    ? 'bg-indigo-400'
                    : 'bg-orange-400'
                }`}
              />

              <div className="bg-[#0e1422] border border-slate-800/80 rounded-lg p-3 hover:border-slate-700 transition">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {getTypeBadge(item.type)}
                    <span className="text-xs font-semibold text-white group-hover:text-sky-300 transition">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.date.replace('T', ' ').substring(0, 16)}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                        item.isDemo
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                          : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                      }`}
                    >
                      {item.isDemo ? 'DÉMO' : 'RÉEL'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-2">
                  {item.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/50 text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    {item.country && (
                      <span>
                        <strong className="text-slate-400">Zone :</strong> {item.country}
                      </span>
                    )}
                    {item.category && (
                      <span>
                        <strong className="text-slate-400">Catégorie :</strong> {item.category}
                      </span>
                    )}
                    {item.severityOrConfidence && (
                      <span>
                        <strong className="text-slate-400">Évaluation :</strong>{' '}
                        {item.severityOrConfidence}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Provenance : {item.provenance || 'Non documentée'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
