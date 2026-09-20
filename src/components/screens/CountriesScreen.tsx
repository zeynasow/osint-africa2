import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Flag, 
  MapPin, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  ChevronRight, 
  Compass, 
  Filter,
  Layers
} from 'lucide-react';
import { Country, AfricanRegion } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';
import { DemoWatermarkBanner } from '../common/DemoWatermarkBanner';

interface Props {
  countries: Country[];
  priorityCountries: Country[];
  onSelectCountry: (country: Country) => void;
  onToggleMonitoring: (countryId: string) => void;
}

export const CountriesScreen: React.FC<Props> = ({
  countries,
  priorityCountries,
  onSelectCountry,
  onToggleMonitoring,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('TOUTES');
  const [showOnlyPriority, setShowOnlyPriority] = useState(true);

  const baseList = showOnlyPriority ? priorityCountries : countries;

  const filteredCountries = useMemo(() => {
    return baseList.filter((c) => {
      if (selectedRegion !== 'TOUTES' && c.region !== selectedRegion) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        return (
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.capital.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [baseList, selectedRegion, searchQuery]);

  const regions = ['TOUTES', 'Afrique de l’Ouest', 'Afrique Centrale', 'Afrique du Nord', 'Afrique de l’Est', 'Afrique Australe'];

  return (
    <div id="screen-pays" className="space-y-4 pb-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-[#0f1422] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Périmètre Géographique & 25 Pays Prioritaires
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Veille active sur les 25 pays cibles • Architecture extensible à l'ensemble du continent africain
            </p>
          </div>

          {/* Extensibility Switch */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-1 shrink-0">
            <button
              id="tab-priority-countries"
              onClick={() => setShowOnlyPriority(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                showOnlyPriority
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              25 Prioritaires
            </button>
            <button
              id="tab-all-countries"
              onClick={() => setShowOnlyPriority(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !showOnlyPriority
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tous ({countries.length})
            </button>
          </div>
        </div>

        {/* Search & Region Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un pays, capitale, code (ex: Sénégal, ML, Niamey)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/90 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/90 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
            >
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg === 'TOUTES' ? 'Toutes les régions' : reg}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCountries.map((country) => (
          <div
            key={country.id}
            id={`country-card-${country.code.toLowerCase()}`}
            onClick={() => onSelectCountry(country)}
            className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 cursor-pointer transition-all duration-200 group relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl" role="img" aria-label={`Drapeau ${country.name}`}>
                    {country.flag || '🌍'}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                        {country.name}
                      </h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {country.code}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Capitale : {country.capital} • {country.region}
                    </span>
                  </div>
                </div>

                {/* Surveillance toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMonitoring(country.id);
                  }}
                  title={country.monitored ? 'Retirer de ma surveillance' : 'Ajouter à ma surveillance'}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    country.monitored
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {country.monitored ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {country.description}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <SeverityBadge severity={country.riskLevel} size="sm" />
              
              <div className="flex items-center gap-2">
                {country.activeAlertsCount > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{country.activeAlertsCount} alertes</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 font-mono">
                    Veille normale
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCountries.length === 0 && (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-xs">
          Aucun pays ne correspond à votre recherche.
        </div>
      )}
    </div>
  );
};
