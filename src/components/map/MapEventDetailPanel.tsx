import React from 'react';
import { FileText, ShieldAlert, Layers, MapPin, X, AlertTriangle, Link as LinkIcon, User, Folder, Activity } from 'lucide-react';
import { OsintEvent, OsintSourceItem, OsintActor, IntelligenceNote, OsintAlert } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

interface MapEventDetailPanelProps {
  event: OsintEvent;
  sources: OsintSourceItem[];
  actors: OsintActor[];
  analyses: IntelligenceNote[];
  dossiers: any[];
  alerts: OsintAlert[];
  onClose: () => void;
  onOpenFullDetail: (evt: OsintEvent) => void;
}

export const MapEventDetailPanel: React.FC<MapEventDetailPanelProps> = ({
  event,
  sources,
  actors,
  analyses,
  dossiers,
  alerts,
  onClose,
  onOpenFullDetail
}) => {
  // Find related data
  const relatedSources = sources.filter(s => event.associatedSourcesList?.some(name => name.includes(s.name)));
  const relatedActors = actors.filter(a => a.associatedEventIds?.includes(event.id));
  const relatedAnalyses = analyses.filter(a => a.acteurs?.some(act => event.actors?.includes(act)) || false);
  const relatedAlert = alerts.find(a => a.eventId === event.id);

  return (
    <div className="bg-[#0f1422] border border-slate-700/80 rounded-2xl p-4 shadow-2xl space-y-4 flex flex-col max-h-[750px] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityBadge severity={event.severity || 'NORMAL'} size="sm" />
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
            {event.category}
          </span>
          {event.subCategory && (
             <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-400 font-medium">
               {event.subCategory}
             </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
          <X className="w-4 h-4" />
        </button>
      </div>

      <h3 className="text-sm font-bold text-slate-100">{event.title}</h3>

      {/* Meta Info */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>{event.countryName} {event.geoPrecision && `(${event.geoPrecision})`}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>{event.status}</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/50">
        {event.summary}
      </p>

      {/* Confidence */}
      <div className="flex items-center gap-3 py-2 border-y border-slate-800/80">
        <span className="text-xs font-semibold text-slate-400">Niveau de Confiance:</span>
        <ConfidenceBadge admiraltyCode={event.admiraltyCode} confidenceScore={event.confidenceScore} size="sm" />
      </div>

      {/* Relations */}
      <div className="space-y-3">
        {relatedAlert && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-rose-400 block uppercase">Alerte Déclenchée</span>
              <span className="text-xs text-slate-300">{relatedAlert.title}</span>
            </div>
          </div>
        )}

        {relatedSources.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <LinkIcon className="w-3 h-3" /> Sources Associées ({relatedSources.length})
            </h4>
            <ul className="space-y-1.5">
              {relatedSources.map(s => (
                <li key={s.id} className="text-xs text-slate-300 flex items-center justify-between bg-slate-800/40 px-2 py-1.5 rounded-lg">
                  <span className="truncate">{s.name}</span>
                  <span className="text-[10px] text-slate-500 ml-2 shrink-0">{s.isReal && !s.isConnected ? 'Réelle / Non connectée' : s.type}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {relatedActors.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3 h-3" /> Acteurs ({relatedActors.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {relatedActors.map(a => (
                <span key={a.id} className="text-[11px] px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {event.dossierIds && event.dossierIds.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Folder className="w-3 h-3" /> Dossiers ({event.dossierIds.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {event.dossierIds.map(dId => {
                const d = dossiers.find(dx => dx.id === dId);
                return (
                  <span key={dId} className="text-[11px] px-2 py-1 rounded bg-blue-900/20 border border-blue-500/30 text-blue-300">
                    {d?.title || dId}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 mt-auto">
        <button
          onClick={() => onOpenFullDetail(event)}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <FileText className="w-4 h-4" />
          <span>Ouvrir la fiche analytique</span>
        </button>
      </div>
    </div>
  );
};
