import React, { useState } from 'react';
import { Map, Layers, ZoomIn, ZoomOut, RotateCcw, Info, MapPin } from 'lucide-react';
import { Country, OsintEvent } from '../../types';
import { AfricaMapSVG } from '../map/AfricaMapSVG';

interface SituationMapTabProps {
  countries: Country[];
  events: OsintEvent[];
  activeCountryCodes: string[];
  onSelectCountry?: (code: string) => void;
}

export const SituationMapTab: React.FC<SituationMapTabProps> = ({
  countries,
  events,
  activeCountryCodes,
  onSelectCountry,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [heatmapMode, setHeatmapMode] = useState<boolean>(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<OsintEvent | null>(null);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.75));
  const handleReset = () => {
    setZoomLevel(1);
    setSelectedEventId(null);
    setSelectedCountryId(null);
    setActiveEvent(null);
  };

  const handleEventClick = (evt: OsintEvent) => {
    setSelectedEventId(evt.id);
    setActiveEvent(evt);
  };

  const handleCountryClick = (c: Country) => {
    setSelectedCountryId(c.id || c.code);
    if (onSelectCountry) {
      onSelectCountry(c.code || c.id);
    }
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 space-y-4">
      {/* Barre de contrôle carte */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Map className="w-4 h-4 text-sky-400" />
            Cartographie Opérationnelle de la Situation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualisation géospatiale de la concentration d'activité informationnelle (
            <span className="text-amber-400 font-medium">Présence informationnelle ≠ attribution de menace</span>
            ).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Bascule Mode Concentration d'activité */}
          <button
            onClick={() => setHeatmapMode(!heatmapMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              heatmapMode
                ? 'bg-amber-950/60 border-amber-600 text-amber-300 shadow-sm'
                : 'bg-[#131926] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Concentration d'activité informationnelle</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-[#131926] border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
              title="Zoomer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 text-slate-300">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
              title="Dézoomer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition ml-1"
              title="Réinitialiser vue"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Zone Cartographique */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-[#080c14] border border-slate-800 rounded-xl overflow-hidden relative min-h-[520px] flex items-center justify-center p-2">
          <AfricaMapSVG
            countries={countries}
            events={events}
            selectedEventId={selectedEventId}
            selectedCountryId={selectedCountryId}
            heatmapMode={heatmapMode}
            zoomLevel={zoomLevel}
            onSelectEvent={handleEventClick}
            onSelectCluster={(evts) => {
              if (evts.length > 0) handleEventClick(evts[0]);
            }}
            onSelectCountry={handleCountryClick}
          />

          {/* Légende cartographique en incrustation */}
          <div className="absolute bottom-3 left-3 bg-[#0e1422]/90 backdrop-blur-sm border border-slate-800 p-2.5 rounded-lg text-[11px] text-slate-300 space-y-1">
            <div className="font-semibold text-white text-[10px] uppercase tracking-wider mb-1">Légende</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
              <span>Événements rattachés</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>Signaux / Alertes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded border border-sky-400 bg-sky-950/40 inline-block" />
              <span>Pays concernés par la situation</span>
            </div>
          </div>
        </div>

        {/* Panneau latéral détails événement / pays sélectionné */}
        <div className="space-y-3">
          <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-3.5">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              Focus Géographique
            </h3>

            {activeEvent ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-sky-300">{activeEvent.title}</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  {activeEvent.summary || activeEvent.description}
                </div>
                <div className="pt-2 border-t border-slate-800 text-[10px] space-y-1 text-slate-400">
                  <div><strong>Pays :</strong> {activeEvent.country || activeEvent.countryName}</div>
                  <div><strong>Catégorie :</strong> {activeEvent.category}</div>
                  <div><strong>Date :</strong> {activeEvent.publishedAt || activeEvent.detectedAt}</div>
                  <div><strong>Source :</strong> {activeEvent.sourceName || 'Non spécifiée'}</div>
                  <div><strong>Confiance :</strong> {activeEvent.confidence || 'Démonstration'}</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">
                Cliquez sur un marqueur ou un pays sur la carte pour afficher les détails opérationnels.
              </div>
            )}
          </div>

          {/* Pays rattachés à la situation active */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-3.5">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
              Pays sous surveillance ({activeCountryCodes.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {activeCountryCodes.length === 0 ? (
                <span className="text-xs text-slate-400 italic">Aucun pays ciblé</span>
              ) : (
                activeCountryCodes.map((code) => {
                  const cObj = countries.find((c) => (c.code || c.id) === code);
                  return (
                    <button
                      key={code}
                      onClick={() => onSelectCountry && onSelectCountry(code)}
                      className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded text-xs text-slate-200 transition"
                    >
                      {cObj ? cObj.name : code} ({code})
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
