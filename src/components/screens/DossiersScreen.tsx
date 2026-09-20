import React from 'react';
import { 
  FolderGit2, 
  Plus, 
  Calendar, 
  MapPin, 
  Layers, 
  ArrowRight, 
  FileText, 
  Clock,
  ShieldAlert
} from 'lucide-react';
import { AnalyticalDossier, Country, OsintEvent } from '../../types';

interface Props {
  dossiers: AnalyticalDossier[];
  countries: Country[];
  allEvents: OsintEvent[];
  onSelectDossier: (dossier: AnalyticalDossier) => void;
  onOpenCreateDossier: () => void;
}

export const DossiersScreen: React.FC<Props> = ({
  dossiers,
  countries,
  allEvents,
  onSelectDossier,
  onOpenCreateDossier,
}) => {
  return (
    <div id="screen-dossiers" className="space-y-4 pb-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-[#0f1422] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Dossiers Thématiques & Synthèses d’Analyse
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Espace de centralisation méthodologique, de recoupement d'indices et de rédaction de notes
            </p>
          </div>

          <button
            id="btn-create-new-dossier"
            onClick={onOpenCreateDossier}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau dossier d’analyse</span>
          </button>
        </div>
      </div>

      {/* Dossiers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {dossiers.map((dossier) => {
          const eventCount = dossier.eventIds.length;

          return (
            <div
              key={dossier.id}
              id={`dossier-card-${dossier.id}`}
              onClick={() => onSelectDossier(dossier)}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <FolderGit2 className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Réf: {dossier.id}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    Màj : {dossier.lastUpdated}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  {dossier.title}
                </h3>

                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {dossier.description}
                </p>

                {/* Scope chips */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {dossier.targetCountries.map((code) => (
                    <span
                      key={code}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono font-medium"
                    >
                      {code}
                    </span>
                  ))}
                  {dossier.categories.slice(0, 2).map((cat) => (
                    <span
                      key={cat}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/60 text-slate-400"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  {eventCount} événements rattachés
                </span>
                <span className="text-amber-400 group-hover:text-amber-300 font-semibold flex items-center gap-1">
                  Ouvrir <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
