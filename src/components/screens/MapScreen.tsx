import React, { useState, useMemo } from 'react';
import { 
  Compass, RefreshCw, Layers, ShieldAlert, Calendar, 
  MapPin, X, ArrowRight, BarChart2, Activity, Globe, List
} from 'lucide-react';
import { Country, OsintEvent, Category, SeverityLevel, FilterState, ALL_CATEGORIES } from '../../types';
import { AfricaMapSVG } from '../map/AfricaMapSVG';
import { MapEventDetailPanel } from '../map/MapEventDetailPanel';
import { SeverityBadge } from '../common/SeverityBadge';

interface Props {
  vm: any;
  countries: Country[];
  events: OsintEvent[];
  filters: FilterState;
  onSetFilter: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onSelectEvent: (event: OsintEvent) => void;
  onSelectCountry: (country: Country) => void;
}

export const MapScreen: React.FC<Props> = ({
  vm,
  countries,
  events,
  filters,
  onSetFilter,
  onResetFilters,
  onSelectEvent,
  onSelectCountry,
}) => {
  const [activeTab, setActiveTab] = useState<'map' | 'activity' | 'matrix'>('map');
  const [selectedPinEvent, setSelectedPinEvent] = useState<OsintEvent | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<OsintEvent[] | null>(null);
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const filteredEvents = vm.filteredEvents || events;

  // KPIs
  const highConfidenceCount = filteredEvents.filter(e => e.confidenceScore && e.confidenceScore >= 75).length;
  const criticalAlertsCount = filteredEvents.filter(e => e.severity === 'CRITIQUE' || e.alertLevel === 'CRITIQUE').length;
  const activeCountries = new Set(filteredEvents.map(e => e.countryId)).size;
  
  // Grouping by country for "Activité par pays"
  const activityByCountry = useMemo(() => {
    const map = new Map<string, { count: number, crit: number, sources: Set<string>, actors: Set<string>, country: Country | undefined }>();
    filteredEvents.forEach(e => {
      if (!map.has(e.countryId!)) {
        map.set(e.countryId!, { count: 0, crit: 0, sources: new Set(), actors: new Set(), country: countries.find(c => c.id === e.countryId) });
      }
      const st = map.get(e.countryId!)!;
      st.count++;
      if (e.severity === 'CRITIQUE' || e.alertLevel === 'CRITIQUE') st.crit++;
      e.associatedSourcesList?.forEach(s => st.sources.add(s));
      e.actors?.forEach(a => st.actors.add(a));
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [filteredEvents, countries]);

  // Matrix Country x Category
  const categoriesPresent = useMemo(() => {
    const cats = new Set<string>();
    filteredEvents.forEach(e => cats.add(e.category));
    return Array.from(cats);
  }, [filteredEvents]);

  const matrixData = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    activityByCountry.forEach(ac => {
      if (!ac.country) return;
      matrix[ac.country.id] = {};
      categoriesPresent.forEach(cat => matrix[ac.country!.id][cat] = 0);
    });
    filteredEvents.forEach(e => {
      if (e.countryId && matrix[e.countryId] && matrix[e.countryId][e.category] !== undefined) {
        matrix[e.countryId][e.category]++;
      }
    });
    return matrix;
  }, [filteredEvents, activityByCountry, categoriesPresent]);

  return (
    <div className="space-y-4 pb-8 animate-fadeIn">
      {/* HEADER DASHBOARD */}
      <div className="bg-[#0f1422] p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-400" />
              <span>Centre de Cartographie OSINT</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Visualisation géopolitique, analyse spatiale et relations inter-sources (Mode Hors Ligne)
            </p>
          </div>
          
          <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
             <button onClick={() => setActiveTab('map')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${activeTab === 'map' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-slate-200'}`}>Carte Africaine</button>
             <button onClick={() => setActiveTab('activity')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${activeTab === 'activity' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-slate-200'}`}>Activité Pays</button>
             <button onClick={() => setActiveTab('matrix')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${activeTab === 'matrix' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-slate-200'}`}>Matrice Analytique</button>
          </div>
        </div>
        
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Événements</div>
            <div className="text-xl font-bold text-slate-100">{filteredEvents.length}</div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Pays Actifs</div>
            <div className="text-xl font-bold text-sky-400">{activeCountries}</div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Alertes (Critique)</div>
            <div className="text-xl font-bold text-rose-400">{criticalAlertsCount}</div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Confiance Élevée</div>
            <div className="text-xl font-bold text-emerald-400">{highConfidenceCount}</div>
          </div>
        </div>
      </div>

      {activeTab === 'map' && (
        <div className="flex flex-col lg:flex-row gap-4 h-[750px]">
          <div className="flex-1 relative bg-gradient-to-b from-[#090d15] via-[#0c101c] to-[#070a12] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Map Controls */}
            <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur rounded-xl p-2 border border-slate-700/80 shadow-lg">
               <button 
                 onClick={() => setHeatmapMode(!heatmapMode)}
                 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${heatmapMode ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'}`}
               >
                 Mode Densité
               </button>
            </div>

            <div className="absolute bottom-4 left-4 z-10">
               <div className="bg-slate-900/90 backdrop-blur rounded-xl p-3 border border-slate-800 text-[10px] space-y-2">
                 <div className="font-bold text-slate-400 uppercase">Légende (Gravité)</div>
                 <div className="flex flex-col gap-1.5">
                   <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_5px_#f43f5e]" /> Critique</div>
                   <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Élevé</div>
                   <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Modéré</div>
                   <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Normal</div>
                 </div>
               </div>
            </div>

            <AfricaMapSVG 
              countries={countries} 
              events={filteredEvents}
              selectedEventId={selectedPinEvent?.id || null}
              selectedCountryId={filters.countryId === 'ALL' ? null : filters.countryId || null}
              heatmapMode={heatmapMode}
              zoomLevel={zoomLevel}
              onSelectEvent={(evt) => { setSelectedPinEvent(evt); setSelectedCluster(null); }}
              onSelectCluster={(evts) => { setSelectedCluster(evts); setSelectedPinEvent(null); }}
              onSelectCountry={onSelectCountry}
            />
          </div>

          <div className="w-full lg:w-96 flex flex-col gap-4">
             {selectedPinEvent ? (
               <MapEventDetailPanel 
                 event={selectedPinEvent}
                 sources={vm.sources}
                 actors={vm.actors}
                 analyses={vm.notes}
                 dossiers={vm.dossiers}
                 alerts={vm.alerts}
                 onClose={() => setSelectedPinEvent(null)}
                 onOpenFullDetail={onSelectEvent}
               />
             ) : selectedCluster ? (
               <div className="bg-[#0f1422] border border-slate-700/80 rounded-2xl p-4 shadow-2xl flex flex-col max-h-[750px]">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-slate-100 flex items-center gap-2">
                     <Layers className="w-4 h-4 text-amber-400" /> Cluster Géographique
                   </h3>
                   <button onClick={() => setSelectedCluster(null)}><X className="w-4 h-4 text-slate-400" /></button>
                 </div>
                 <div className="text-xs text-slate-400 mb-4">{selectedCluster.length} événements regroupés dans cette zone.</div>
                 <div className="overflow-y-auto space-y-2 custom-scrollbar">
                   {selectedCluster.map(e => (
                     <div key={e.id} onClick={() => { setSelectedPinEvent(e); setSelectedCluster(null); }} className="bg-slate-800/50 p-2 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                       <div className="text-xs font-bold text-slate-200 truncate">{e.title}</div>
                       <div className="text-[10px] text-slate-500 flex justify-between mt-1">
                         <span>{e.category}</span>
                         <SeverityBadge severity={e.severity || 'NORMAL'} size="sm" />
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             ) : (
               <div className="bg-[#0f1422] border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex-1 flex flex-col items-center justify-center text-center">
                 <Globe className="w-12 h-12 text-slate-700 mb-4" />
                 <h3 className="text-sm font-bold text-slate-300">Exploration Cartographique</h3>
                 <p className="text-xs text-slate-500 mt-2">Cliquez sur un marqueur, un cluster ou un pays pour afficher les détails, les sources et les acteurs associés.</p>
               </div>
             )}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-[#0f1422] rounded-2xl border border-slate-800 p-4">
          <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-amber-400"/> Activité OSINT par pays</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="p-3 font-semibold rounded-tl-xl">Pays</th>
                  <th className="p-3 font-semibold">Événements</th>
                  <th className="p-3 font-semibold">Alertes Critiques</th>
                  <th className="p-3 font-semibold">Sources Distinctes</th>
                  <th className="p-3 font-semibold">Acteurs Impliqués</th>
                  <th className="p-3 font-semibold rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {activityByCountry.map(ac => (
                  <tr key={ac.country?.id || Math.random()} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-bold text-slate-200 flex items-center gap-2">
                      {ac.country?.flag} {ac.country?.name || 'Inconnu'}
                    </td>
                    <td className="p-3 font-mono text-amber-400">{ac.count}</td>
                    <td className="p-3 font-mono text-rose-400">{ac.crit}</td>
                    <td className="p-3 text-slate-400">{ac.sources.size}</td>
                    <td className="p-3 text-slate-400">{ac.actors.size}</td>
                    <td className="p-3">
                       <button onClick={() => { onSetFilter({ countryId: ac.country?.id }); setActiveTab('map'); }} className="text-amber-400 hover:underline">Filtrer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'matrix' && (
        <div className="bg-[#0f1422] rounded-2xl border border-slate-800 p-4 overflow-x-auto">
           <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-amber-400"/> Matrice Pays × Catégories</h3>
           <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="p-2 font-semibold border-b border-slate-700">Pays</th>
                  {categoriesPresent.map(cat => (
                    <th key={cat} className="p-2 font-semibold border-b border-slate-700 text-center">{cat}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activityByCountry.map(ac => {
                  if (!ac.country) return null;
                  return (
                    <tr key={ac.country.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="p-2 font-bold text-slate-300">{ac.country.name}</td>
                      {categoriesPresent.map(cat => {
                        const val = matrixData[ac.country!.id][cat];
                        return (
                          <td key={cat} className={`p-2 text-center font-mono ${val > 0 ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-600'}`}>
                            {val > 0 ? val : '-'}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
           </table>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <span className="text-[10px] text-slate-500 font-mono tracking-wider border border-slate-700 bg-slate-800 px-3 py-1 rounded">
          CARTOGRAPHIE LOCALE — AUCUNE COLLECTE INTERNET
        </span>
      </div>
    </div>
  );
};

