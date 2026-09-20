import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Eye, 
  EyeOff, 
  Compass, 
  Activity, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck, 
  Globe,
  Sparkles,
  FileText,
  Sliders,
  Check,
  Calendar,
  Layers,
  Users2
} from 'lucide-react';
import { Country, OsintEvent, OsintAlert, SeverityLevel, Category } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

interface Props {
  country: Country | null;
  onClose: () => void;
  events: OsintEvent[];
  alerts: OsintAlert[];
  onSelectEvent: (event: OsintEvent) => void;
  onToggleMonitoring: (countryId: string) => void;
  onNavigateToMapWithCountry?: (countryId: string) => void;
  onUpdateRiskLevel?: (countryId: string, level: SeverityLevel, note?: string) => Promise<void>;
  onOpenAiAnalysis?: (target: { country: Country }) => void;
  onOpenCreateNote?: (presetEvents?: OsintEvent[], presetCountry?: Country) => void;
}

const RISK_LEVELS: { id: SeverityLevel; label: string; color: string; bg: string; border: string }[] = [
  { id: 'CRITIQUE', label: 'CRITIQUE', color: 'text-rose-400', bg: 'bg-rose-950/60', border: 'border-rose-500/60' },
  { id: 'ELEVE', label: 'ÉLEVÉ', color: 'text-orange-400', bg: 'bg-orange-950/60', border: 'border-orange-500/60' },
  { id: 'MODERE', label: 'MODÉRÉ', color: 'text-amber-400', bg: 'bg-amber-950/60', border: 'border-amber-500/60' },
  { id: 'NORMAL', label: 'NORMAL', color: 'text-emerald-400', bg: 'bg-emerald-950/60', border: 'border-emerald-500/60' },
];

export const CountryDetailDrawer: React.FC<Props> = ({
  country,
  onClose,
  events,
  alerts,
  onSelectEvent,
  onToggleMonitoring,
  onNavigateToMapWithCountry,
  onUpdateRiskLevel,
  onOpenAiAnalysis,
  onOpenCreateNote,
}) => {
  const [isEditingRisk, setIsEditingRisk] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<SeverityLevel | null>(null);
  const [riskNote, setRiskNote] = useState('');
  const [riskSaveSuccess, setRiskSaveSuccess] = useState(false);

  if (!country) return null;

  const countryEvents = events.filter((e) => e.countryId === country.id || e.countryId === country.code);
  const countryAlerts = alerts.filter((a) => a.countryId === country.id || a.countryId === country.code);

  // Group events by category
  const categoryCounts: Record<string, number> = {};
  countryEvents.forEach((e) => {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  });

  const handleSaveRiskLevel = async (level: SeverityLevel) => {
    if (onUpdateRiskLevel) {
      await onUpdateRiskLevel(country.id, level, riskNote || undefined);
      setRiskSaveSuccess(true);
      setTimeout(() => {
        setRiskSaveSuccess(false);
        setIsEditingRisk(false);
      }, 1200);
    }
  };

  return (
    <div
      id="country-detail-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-end p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="country-detail-sheet"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl h-[94vh] sm:h-[95vh] bg-[#0f1422] border-l border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Mobile handle */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3 bg-[#0b101d]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl" role="img" aria-label={`Drapeau ${country.name}`}>
                {country.flag || '🌍'}
              </span>
              <span className="text-sm font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                {country.code}
              </span>
              <h2 className="text-xl font-bold text-slate-100">{country.name}</h2>
              <SeverityBadge severity={country.riskLevel} size="sm" />
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span className="text-slate-300 font-medium">{country.region}</span>
              <span>•</span>
              <span>Capitale : <strong className="text-slate-200">{country.capital}</strong></span>
              {country.lastRiskUpdate && (
                <>
                  <span>•</span>
                  <span className="font-mono text-[10px] text-slate-500">MAJ : {country.lastRiskUpdate}</span>
                </>
              )}
            </p>
          </div>

          <button
            id="btn-close-country-drawer"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar (IA, Note, Carte, Watch) */}
        <div className="p-3 sm:px-5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Analyser avec IA */}
            {onOpenAiAnalysis && (
              <button
                id="btn-country-ai-analyze"
                onClick={() => {
                  onClose();
                  onOpenAiAnalysis({ country });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Analyser avec IA</span>
              </button>
            )}

            {/* Créer une note */}
            {onOpenCreateNote && (
              <button
                id="btn-country-create-note"
                onClick={() => {
                  onClose();
                  onOpenCreateNote(countryEvents, country);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Créer une note</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Localiser carte */}
            <button
              id="btn-view-country-on-map"
              onClick={() => {
                onClose();
                onNavigateToMapWithCountry?.(country.id);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs"
              title="Localiser sur la carte interactive"
            >
              <Compass className="w-4 h-4 text-amber-400" />
            </button>

            {/* Surveillance toggle */}
            <button
              id="btn-toggle-country-watch"
              onClick={() => onToggleMonitoring(country.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                country.monitored
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {country.monitored ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{country.monitored ? 'Suivi' : 'Suivre'}</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar text-slate-200">
          {/* Risk Level Modifier Box (Requirement 4) */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Niveau de Surveillance Actuel :
                </span>
              </div>
              <SeverityBadge severity={country.riskLevel} size="md" />
            </div>

            {/* Manual Calibration Selector */}
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 block font-mono">
                Ajustement manuel par l'analyste :
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {RISK_LEVELS.map((lvl) => {
                  const isActive = country.riskLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => handleSaveRiskLevel(lvl.id)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all border text-center ${
                        isActive
                          ? `${lvl.bg} ${lvl.border} ${lvl.color} shadow`
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  );
                })}
              </div>

              {country.manualRiskNote && (
                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 mt-2">
                  <span className="text-amber-400 font-semibold font-mono">Note analyste : </span>
                  {country.manualRiskNote}
                </div>
              )}

              {riskSaveSuccess && (
                <div className="text-[11px] text-emerald-300 flex items-center gap-1.5 font-mono pt-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Niveau de surveillance mis à jour avec succès.
                </div>
              )}
            </div>
          </div>

          {/* Strategic Overview */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-amber-400 block mb-1 font-mono uppercase tracking-wider text-[11px]">
              Résumé de la situation stratégique :
            </span>
            {country.description}
          </div>

          {/* Categories breakdown */}
          {Object.keys(categoryCounts).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Distribution par catégorie ({countryEvents.length} événements)
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <span
                    key={cat}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono flex items-center gap-1.5"
                  >
                    <span>{cat}</span>
                    <strong className="text-amber-400 bg-slate-800 px-1.5 py-0.2 rounded text-[10px]">
                      {count}
                    </strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Active Alerts */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Alertes actives pour {country.name} ({countryAlerts.length})
            </h3>

            {countryAlerts.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Aucune alerte critique active sur ce pays.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {countryAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <SeverityBadge severity={alt.severity} size="sm" />
                      <span className="text-[10px] text-slate-500 font-mono">{alt.timestamp}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200">{alt.title}</p>
                    <p className="text-[11px] text-slate-400">{alt.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chronology & Associated Events */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Chronologie récente des événements ({countryEvents.length})
            </h3>

            {countryEvents.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-center text-xs text-slate-400">
                Aucun événement répertorié pour {country.name} dans ce jeu de données de démonstration.
              </div>
            ) : (
              <div className="space-y-2.5">
                {countryEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      onClose();
                      onSelectEvent(evt);
                    }}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all hover:translate-x-0.5 group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <SeverityBadge severity={evt.severity} size="sm" />
                        <ConfidenceBadge
                          admiraltyCode={evt.admiraltyCode}
                          confidenceScore={evt.confidenceScore}
                          size="sm"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{evt.date} {evt.time || ''}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-2">
                      {evt.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {evt.summary}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-amber-400/80">
                      <span>Source : {evt.source.name}</span>
                      <span className="flex items-center gap-0.5 text-xs group-hover:translate-x-1 transition-transform">
                        Fiche complète <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
