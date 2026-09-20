import React, { useState, useMemo } from 'react';
import { 
  Users2, 
  Search, 
  Filter, 
  User, 
  Building, 
  Landmark, 
  Briefcase, 
  ShieldAlert, 
  Globe, 
  Clock, 
  Activity, 
  Eye, 
  FileText,
  X,
  Sparkles
} from 'lucide-react';
import { OsintActor, ActorType, OsintEvent } from '../../types';
import { DemoWatermarkBanner } from '../common/DemoWatermarkBanner';

interface ActorsScreenProps {
  actors: OsintActor[];
  events: OsintEvent[];
  onSelectEvent?: (event: OsintEvent) => void;
  onOpenAiAnalysis?: (target: { event?: OsintEvent }) => void;
}

const ACTOR_TYPE_ICONS: Record<ActorType, React.ComponentType<{ className?: string }>> = {
  'Personne publique': User,
  'Organisation': Building,
  'Institution': Landmark,
  'Entreprise': Briefcase,
  'Groupe armé': ShieldAlert,
  'Organisation internationale': Globe,
};

const ALL_ACTOR_TYPES: ActorType[] = [
  'Personne publique',
  'Organisation',
  'Institution',
  'Entreprise',
  'Groupe armé',
  'Organisation internationale',
];

export const ActorsScreen: React.FC<ActorsScreenProps> = ({
  actors,
  events,
  onSelectEvent,
  onOpenAiAnalysis,
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActorModal, setSelectedActorModal] = useState<OsintActor | null>(null);

  const filteredActors = useMemo(() => {
    return actors.filter((a) => {
      if (selectedType !== 'ALL' && a.type !== selectedType) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.country.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [actors, selectedType, searchQuery]);

  return (
    <div id="screen-acteurs" className="space-y-5 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-[#131929] to-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100 uppercase tracking-wide">
                Cartographie des Acteurs
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                {actors.length} entités suivies
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Documentation factuelle issue de sources ouvertes (institutions, groupes armés, organisations, entreprises)
            </p>
          </div>
        </div>

        <DemoWatermarkBanner compact />
      </div>

      {/* Actor Types Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedType('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            selectedType === 'ALL'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <span>Tous les acteurs</span>
          <span className="text-[10px] opacity-75 font-mono">({actors.length})</span>
        </button>

        {ALL_ACTOR_TYPES.map((type) => {
          const Icon = ACTOR_TYPE_ICONS[type] || Users2;
          const count = actors.filter((a) => a.type === type).length;
          const isSelected = selectedType === type;

          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{type}</span>
              <span className="text-[10px] opacity-70 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Rechercher un acteur par nom, type, zone d'action ou mots-clés factuels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
        />
      </div>

      {/* Actors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActors.map((actor) => {
          const Icon = ACTOR_TYPE_ICONS[actor.type] || Users2;
          return (
            <div
              key={actor.id}
              onClick={() => setSelectedActorModal(actor)}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-amber-500/50 hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Type & Status */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <Icon className="w-3.5 h-3.5" />
                    {actor.type}
                  </span>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                    actor.status === 'Sous surveillance'
                      ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                      : actor.status === 'Actif'
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}>
                    {actor.status}
                  </span>
                </div>

                {/* Actor Name */}
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors mb-1 line-clamp-1">
                  {actor.name}
                </h3>

                <div className="text-xs text-slate-400 font-mono mb-2">
                  Zone / Pays : <strong className="text-slate-200">{actor.country}</strong>
                </div>

                {/* Factual Description */}
                <p className="text-xs text-slate-300/90 leading-relaxed line-clamp-3 mb-3">
                  {actor.description}
                </p>
              </div>

              {/* Associations */}
              <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Activity className="w-3 h-3 text-amber-400" />
                    Événements associés :
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {actor.associatedEventIds?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Eye className="w-3 h-3 text-emerald-400" />
                    Sources ouvertes :
                  </span>
                  <span className="font-mono text-slate-300">
                    {actor.associatedSources?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actor Detail Modal */}
      {selectedActorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0b1120]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Users2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                    Fiche Entité / Acteur • {selectedActorModal.type}
                  </span>
                  <h2 className="text-base font-bold text-slate-100">
                    {selectedActorModal.name}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedActorModal(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Description Factuelle (Sources Ouvertes)
                </span>
                <p className="leading-relaxed text-slate-200">
                  {selectedActorModal.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] text-slate-500 font-mono">Pays / Théâtre</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-200 mt-0.5">
                    {selectedActorModal.country}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] text-slate-500 font-mono">Niveau de Suivi</div>
                  <div className="text-xs sm:text-sm font-bold text-amber-400 mt-0.5">
                    {selectedActorModal.status}
                  </div>
                </div>
              </div>

              {/* Associated Sources */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono mb-2">
                  Sources Associées à cet Acteur
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedActorModal.associatedSources?.map((src, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono"
                    >
                      {src}
                    </span>
                  ))}
                </div>
              </div>

              {/* Associated Events list */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono mb-2">
                  Événements Reliés ({selectedActorModal.associatedEventIds?.length || 0})
                </h4>
                <div className="space-y-2">
                  {events
                    .filter((e) => selectedActorModal.associatedEventIds?.includes(e.id))
                    .map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => {
                          setSelectedActorModal(null);
                          if (onSelectEvent) onSelectEvent(evt);
                        }}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                          <span>{evt.date} • {evt.countryName}</span>
                          <span className="text-amber-400">{evt.category}</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-200">{evt.title}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-[#0b1120] flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">DONNÉES DE DÉMONSTRATION</span>
              <button
                onClick={() => setSelectedActorModal(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
