import React from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import { WatchPlanStatus, WatchPlanPriority } from '../../types';

export interface WatchFilterState {
  search: string;
  status: string; // 'ALL' | WatchPlanStatus
  priority: string; // 'ALL' | WatchPlanPriority
  region: string; // 'ALL' | ...
  category: string; // 'ALL' | ...
  sortBy: 'SCORE_DESC' | 'NEXT_REVIEW_ASC' | 'UPDATED_DESC' | 'TITLE_ASC';
}

interface WatchFiltersBarProps {
  filters: WatchFilterState;
  onFilterChange: (newFilters: WatchFilterState) => void;
  onReset: () => void;
  onNewPlan: () => void;
  onExportJson: () => void;
  availableRegions: string[];
  availableCategories: string[];
  totalCount: number;
  filteredCount: number;
}

export const WatchFiltersBar: React.FC<WatchFiltersBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  onNewPlan,
  onExportJson,
  availableRegions,
  availableCategories,
  totalCount,
  filteredCount,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3" id="watch-filters-bar">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Champ de recherche texte */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="watch-search-input"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Rechercher par titre, zone, pays, mot-clé, acteur ou analyste..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Boutons d'action principaux */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="btn-new-watch-plan"
            onClick={onNewPlan}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau Plan de Veille
          </button>

          <button
            type="button"
            id="btn-export-watch-json"
            onClick={onExportJson}
            title="Exporter l’ensemble des plans et métriques en JSON"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Rangée des sélecteurs de filtres */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="text-slate-500 font-medium flex items-center gap-1 mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          Filtres :
        </span>

        {/* Filtre Statut */}
        <select
          id="filter-status"
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="ACTIF">ACTIF (En cours)</option>
          <option value="SOUS_SURVEILLANCE">SOUS SURVEILLANCE</option>
          <option value="SUSPENDU">SUSPENDU</option>
          <option value="BROUILLON">BROUILLON</option>
          <option value="ARCHIVE">ARCHIVÉ</option>
        </select>

        {/* Filtre Priorité */}
        <select
          id="filter-priority"
          value={filters.priority}
          onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">Toutes priorités</option>
          <option value="CRITIQUE">CRITIQUE (Urgence d'analyse)</option>
          <option value="ELEVEE">ÉLEVÉE</option>
          <option value="MOYENNE">MOYENNE</option>
          <option value="FAIBLE">FAIBLE</option>
        </select>

        {/* Filtre Région */}
        <select
          id="filter-region"
          value={filters.region}
          onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">Toutes régions</option>
          {availableRegions.map((reg) => (
            <option key={reg} value={reg}>
              {reg}
            </option>
          ))}
        </select>

        {/* Filtre Catégorie */}
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">Toutes catégories</option>
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Tri */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            Trier :
          </span>
          <select
            id="sort-by"
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({ ...filters, sortBy: e.target.value as WatchFilterState['sortBy'] })
            }
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="SCORE_DESC">Score Priorité (Décroissant)</option>
            <option value="NEXT_REVIEW_ASC">Prochaine revue (Plus proche)</option>
            <option value="UPDATED_DESC">Dernière mise à jour</option>
            <option value="TITLE_ASC">Titre alphabétique (A-Z)</option>
          </select>

          {/* Bouton Réinitialiser */}
          <button
            type="button"
            onClick={onReset}
            title="Réinitialiser tous les filtres"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Résumé du compteur filtré */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 border-t border-slate-800/60">
        <span>
          Affichage de <strong className="text-slate-200">{filteredCount}</strong> plan(s) de veille sur un total de{' '}
          <strong className="text-slate-200">{totalCount}</strong>.
        </span>
        <span className="text-slate-500">
          Chaque plan encapsule les alertes, signaux faibles, anomalies, indicateurs et gaps associés.
        </span>
      </div>
    </div>
  );
};
