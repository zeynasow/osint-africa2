import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  AlertCircle, 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  Check, 
  ArrowRight,
  Filter,
  MapPin
} from 'lucide-react';
import { OsintAlert, OsintEvent, SeverityLevel, Country } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';

interface Props {
  alerts: OsintAlert[];
  events: OsintEvent[];
  countries: Country[];
  onSelectEvent: (event: OsintEvent) => void;
  onAcknowledgeAlert: (alertId: string) => Promise<void>;
  onSelectCountry: (country: Country) => void;
}

export const AlertsScreen: React.FC<Props> = ({
  alerts,
  events,
  countries,
  onSelectEvent,
  onAcknowledgeAlert,
  onSelectCountry,
}) => {
  const [selectedTab, setSelectedTab] = useState<SeverityLevel | 'TOUS'>('TOUS');
  const [filterCountry, setFilterCountry] = useState<string>('ALL');

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (selectedTab !== 'TOUS' && a.severity !== selectedTab) return false;
      if (filterCountry !== 'ALL' && a.countryId !== filterCountry) return false;
      return true;
    });
  }, [alerts, selectedTab, filterCountry]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: alerts.length,
      critique: alerts.filter((a) => a.severity === 'CRITIQUE').length,
      eleve: alerts.filter((a) => a.severity === 'ELEVE').length,
      modere: alerts.filter((a) => a.severity === 'MODERE').length,
      normal: alerts.filter((a) => a.severity === 'NORMAL').length,
    };
  }, [alerts]);

  return (
    <div id="screen-alertes" className="space-y-4 pb-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-[#0f1422] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-rose-500" />
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Centre de Gestion des Alertes OSINT
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Veille active multi-niveaux • Notifications selon la matrice de criticité
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Tous les pays</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Severity Level Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 custom-scrollbar">
          <button
            onClick={() => setSelectedTab('TOUS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedTab === 'TOUS'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Toutes ({counts.all})
          </button>

          <button
            onClick={() => setSelectedTab('CRITIQUE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedTab === 'CRITIQUE'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-slate-900 border-slate-800 text-rose-400/80 hover:text-rose-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)]" />
            <span>CRITIQUE ({counts.critique})</span>
          </button>

          <button
            onClick={() => setSelectedTab('ELEVE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedTab === 'ELEVE'
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                : 'bg-slate-900 border-slate-800 text-orange-400/80 hover:text-orange-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>ÉLEVÉ ({counts.eleve})</span>
          </button>

          <button
            onClick={() => setSelectedTab('MODERE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedTab === 'MODERE'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900 border-slate-800 text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>MODÉRÉ ({counts.modere})</span>
          </button>

          <button
            onClick={() => setSelectedTab('NORMAL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedTab === 'NORMAL'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900 border-slate-800 text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>NORMAL ({counts.normal})</span>
          </button>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const correspondingEvent = events.find((e) => e.id === alert.eventId);
          const country = countries.find((c) => c.id === alert.countryId);

          return (
            <div
              key={alert.id}
              id={`alert-card-${alert.id}`}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                alert.severity === 'CRITIQUE'
                  ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400'
                  : alert.severity === 'ELEVE'
                  ? 'bg-orange-950/20 border-orange-500/40 hover:border-orange-400'
                  : alert.severity === 'MODERE'
                  ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-400'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={alert.severity} size="sm" />
                  <button
                    onClick={() => country && onSelectCountry(country)}
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{alert.countryName}</span>
                  </button>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300 font-medium">
                    {alert.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-mono">{alert.timestamp}</span>
                  {alert.acknowledged ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      Traité
                    </span>
                  ) : (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
                      title="Marquer cette alerte comme lue / prise en compte"
                    >
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Accuser réception</span>
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-100 leading-snug">
                {alert.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                {alert.summary}
              </p>

              {correspondingEvent && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-400/80 uppercase">
                    DONNÉES DE DÉMONSTRATION
                  </span>
                  <button
                    onClick={() => onSelectEvent(correspondingEvent)}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Inspecter l’événement lié</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-xs">
          Aucune alerte enregistrée pour ce niveau ou ce pays.
        </div>
      )}
    </div>
  );
};
