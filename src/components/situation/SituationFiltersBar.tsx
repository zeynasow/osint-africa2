import React from 'react';
import { Search, Filter, RotateCcw, Calendar, Globe, Tag, Shield, CheckCircle } from 'lucide-react';
import { Country } from '../../types';

export interface SituationFilterValues {
  searchQuery: string;
  period: 'all' | '24h' | '7d' | '30d' | '90d';
  countryCode: string;
  category: string;
  priority: string;
  confidence: string;
  status: string;
  demoFilter: 'ALL' | 'REAL' | 'DEMO';
  objectType: 'ALL' | 'EVENTS' | 'ALERTS' | 'SIGNALS' | 'CORRELATIONS' | 'ANOMALIES' | 'CASES' | 'ACTORS';
}

interface SituationFiltersBarProps {
  filters: SituationFilterValues;
  countries: Country[];
  availableCategories: string[];
  onChange: (updated: Partial<SituationFilterValues>) => void;
  onReset: () => void;
}

export const SituationFiltersBar: React.FC<SituationFiltersBarProps> = ({
  filters,
  countries,
  availableCategories,
  onChange,
  onReset,
}) => {
  return (
    <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-3.5 space-y-3">
      {/* Ligne 1 : Recherche + Période + Réel/Démo + Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Recherche locale textuelle */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par mot-clé, acteur, ville, source..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            className="w-full bg-[#131926] border border-slate-800 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-sky-500 transition placeholder:text-slate-500"
          />
        </div>

        {/* Filtre Période */}
        <div className="flex items-center gap-1 bg-[#131926] border border-slate-800 rounded-lg p-1 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {(['all', '24h', '7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onChange({ period: p })}
              className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                filters.period === p
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {p === 'all' ? 'Toutes' : p.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Sélecteur Strict Réel / Démo */}
        <div className="flex items-center gap-1 bg-[#131926] border border-slate-800 rounded-lg p-1 text-xs">
          <span className="text-[11px] text-slate-400 font-medium px-1.5">Origine :</span>
          {(['ALL', 'REAL', 'DEMO'] as const).map((d) => (
            <button
              key={d}
              onClick={() => onChange({ demoFilter: d })}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                filters.demoFilter === d
                  ? d === 'REAL'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : d === 'DEMO'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {d === 'ALL' ? 'Toutes' : d === 'REAL' ? 'RÉELLES (APS)' : 'DÉMONSTRATION'}
            </button>
          ))}
        </div>

        {/* Bouton Réinitialiser */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg text-xs font-medium border border-slate-700/60 transition"
          title="Réinitialiser tous les filtres"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Réinitialiser</span>
        </button>
      </div>

      {/* Ligne 2 : Sélecteurs fins (Pays, Catégorie, Priorité, Confiance, Statut, Type d'objet) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1 border-t border-slate-800/60 text-xs">
        {/* Pays */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
            Pays
          </label>
          <select
            value={filters.countryCode}
            onChange={(e) => onChange({ countryCode: e.target.value })}
            className="w-full bg-[#131926] border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 transition text-xs"
          >
            <option value="ALL">Tous les pays</option>
            {countries.map((c) => (
              <option key={c.code || c.id} value={c.code || c.id}>
                {c.name} ({c.code || c.id})
              </option>
            ))}
          </select>
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
            Catégorie
          </label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full bg-[#131926] border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 transition text-xs"
          >
            <option value="ALL">Toutes catégories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Priorité / Sévérité */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
            Priorité / Sévérité
          </label>
          <select
            value={filters.priority}
            onChange={(e) => onChange({ priority: e.target.value })}
            className="w-full bg-[#131926] border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 transition text-xs"
          >
            <option value="ALL">Toutes priorités</option>
            <option value="CRITICAL">CRITIQUE (P1)</option>
            <option value="HIGH">ÉLEVÉE (P2)</option>
            <option value="MEDIUM">MODÉRÉE (P3)</option>
            <option value="LOW">FAIBLE (P4)</option>
          </select>
        </div>

        {/* Niveau de Confiance */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
            Confiance
          </label>
          <select
            value={filters.confidence}
            onChange={(e) => onChange({ confidence: e.target.value })}
            className="w-full bg-[#131926] border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 transition text-xs"
          >
            <option value="ALL">Tous niveaux</option>
            <option value="TRÈS ÉLEVÉE">TRÈS ÉLEVÉE</option>
            <option value="ÉLEVÉE">ÉLEVÉE</option>
            <option value="MOYENNE">MOYENNE</option>
            <option value="FAIBLE">FAIBLE</option>
          </select>
        </div>

        {/* Statut Opérationnel */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
            Statut
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value })}
            className="w-full bg-[#131926] border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 transition text-xs"
          >
            <option value="ALL">Tous statuts</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="UNDER_REVIEW">EN EXAMEN</option>
            <option value="STABLE">STABLE</option>
            <option value="EVOLVING">EN ÉVOLUTION</option>
            <option value="CLOSED">CLÔTURÉE</option>
          </select>
        </div>

        {/* Type d'Objet Cible */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
            Filtre Type d'Objet
          </label>
          <select
            value={filters.objectType}
            onChange={(e) => onChange({ objectType: e.target.value as any })}
            className="w-full bg-[#131926] border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 transition text-xs"
          >
            <option value="ALL">Tous les types d'objets</option>
            <option value="EVENTS">Événements uniquement</option>
            <option value="ALERTS">Alertes uniquement</option>
            <option value="SIGNALS">Signaux faibles uniquement</option>
            <option value="CORRELATIONS">Corrélations uniquement</option>
            <option value="ANOMALIES">Anomalies uniquement</option>
            <option value="CASES">Dossiers uniquement</option>
            <option value="ACTORS">Acteurs uniquement</option>
          </select>
        </div>
      </div>
    </div>
  );
};
