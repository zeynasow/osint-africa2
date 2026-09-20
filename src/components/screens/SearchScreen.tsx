import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Tag, 
  MapPin, 
  Calendar, 
  Activity, 
  ArrowRight, 
  Compass,
  FileText
} from 'lucide-react';
import { OsintEvent, Country } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

interface Props {
  events: OsintEvent[];
  countries: Country[];
  onSelectEvent: (event: OsintEvent) => void;
  onSelectCountry: (country: Country) => void;
}

export const SearchScreen: React.FC<Props> = ({
  events,
  countries,
  onSelectEvent,
  onSelectCountry,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUTES');

  const popularKeywords = ['Sahel', 'Gao', 'Maritime', 'RN16', 'Pêche', 'Frontière', 'Kivu', 'AIS', 'Mines'];

  const results = useMemo(() => {
    let list = events;
    if (selectedCategory !== 'TOUTES') {
      list = list.filter((e) => e.category === selectedCategory);
    }
    if (query.trim() === '') {
      return list;
    }
    const q = query.toLowerCase().trim();
    return list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.detailedAnalysis.toLowerCase().includes(q) ||
        e.countryName.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.source.name.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [events, query, selectedCategory]);

  return (
    <div id="screen-recherche" className="space-y-4 pb-8 animate-fadeIn">
      {/* Search Bar Header */}
      <div className="bg-[#0f1422] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100">
            Recherche Avancée Renseignement Ouvert
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Interrogez l'ensemble des rapports, synthèses, métadonnées et sources de démonstration
        </p>

        {/* Input */}
        <div className="relative pt-1">
          <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-global-search"
            type="text"
            autoFocus
            placeholder="Rechercher un mot-clé (ex: radar, Gao, bauxite, AIS, convoi)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/90 rounded-xl pl-11 pr-10 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggestion tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-500 text-[11px] mr-1">Mots-clés fréquents :</span>
          {popularKeywords.map((kw) => (
            <button
              key={kw}
              onClick={() => setQuery(kw)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors border ${
                query.toLowerCase() === kw.toLowerCase()
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              #{kw}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <span>{results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}</span>
        <span className="font-mono text-[10px] text-amber-400/80">DONNÉES DE DÉMONSTRATION</span>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {results.map((evt) => (
          <div
            key={evt.id}
            id={`search-result-${evt.id}`}
            onClick={() => onSelectEvent(evt)}
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <SeverityBadge severity={evt.severity} size="sm" />
                <span className="text-xs font-bold text-amber-400">{evt.countryName}</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  {evt.category}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{evt.date}</span>
            </div>

            <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
              {evt.title}
            </h3>

            <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {evt.summary}
            </p>

            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px]">Source : {evt.source.name}</span>
              <span className="text-amber-400 group-hover:text-amber-300 flex items-center gap-1">
                Consulter la fiche <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-xs">
          Aucun événement ne correspond à votre requête « {query} ».
        </div>
      )}
    </div>
  );
};
