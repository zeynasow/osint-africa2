import React from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Flame, 
  Clock, 
  Eye, 
  ArrowRight, 
  TrendingUp, 
  MapPin, 
  FileSearch, 
  Compass,
  FolderGit2,
  ShieldCheck,
  ChevronRight,
  FileText,
  Radio,
  Users2,
  Layers,
  Sparkles,
  BarChart3,
  Network,
  FileCheck,
  Server,
  Scale,
  Timer,
} from 'lucide-react';
import { Country, OsintEvent, OsintAlert, AnalyticalDossier, IntelligenceNote, ScreenId } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { DemoWatermarkBanner } from '../common/DemoWatermarkBanner';

interface Props {
  stats: {
    totalEvents: number;
    criticalAlertsCount: number;
    highAlertsCount: number;
    monitoredCountriesCount: number;
    dossiersCount: number;
    sourcesCount?: number;
    actorsCount?: number;
    notesCount?: number;
  };
  alerts: OsintAlert[];
  recentEvents: OsintEvent[];
  countries: Country[];
  dossiers: AnalyticalDossier[];
  notes?: IntelligenceNote[];
  onSelectEvent: (event: OsintEvent) => void;
  onSelectCountry: (country: Country) => void;
  onNavigate: (screen: ScreenId) => void;
  onOpenNote?: (note: IntelligenceNote) => void;
  onOpenAiAnalysis?: (target: { event?: OsintEvent; country?: Country }) => void;
}

export const HomeScreen: React.FC<Props> = ({
  stats,
  alerts,
  recentEvents,
  countries,
  dossiers,
  notes = [],
  onSelectEvent,
  onSelectCountry,
  onNavigate,
  onOpenNote,
  onOpenAiAnalysis,
}) => {
  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITIQUE');
  const highAlerts = alerts.filter((a) => a.severity === 'ELEVE');
  const monitoredCountries = countries.filter((c) => c.monitored);

  // Compute Risk Breakdown for all events
  const critCount = recentEvents.filter((e) => e.severity === 'CRITIQUE').length;
  const highCount = recentEvents.filter((e) => e.severity === 'ELEVE').length;
  const modCount = recentEvents.filter((e) => e.severity === 'MODERE').length;
  const normCount = recentEvents.filter((e) => e.severity === 'NORMAL').length;
  const totalEvts = Math.max(recentEvents.length, 1);

  const critPercent = Math.round((critCount / totalEvts) * 100);
  const highPercent = Math.round((highCount / totalEvts) * 100);
  const modPercent = Math.round((modCount / totalEvts) * 100);
  const normPercent = Math.max(0, 100 - critPercent - highPercent - modPercent);

  // Top 5 Most Active Countries by total alerts & events
  const topActiveCountries = [...countries]
    .sort((a, b) => b.activeAlertsCount - a.activeAlertsCount)
    .slice(0, 5);

  return (
    <div id="screen-accueil" className="space-y-6 pb-8 animate-fadeIn">
      {/* Official Subtitle Header & Overview */}
      <div className="bg-gradient-to-br from-[#121927] via-[#0f1523] to-[#0a0d16] border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[11px] font-mono tracking-wider text-amber-400 font-semibold uppercase">
                PLATEFORME OSINT — MODE DÉMONSTRATION
              </span>
              <span className="hidden md:inline text-slate-600 text-xs">•</span>
              <span className="text-[11px] font-mono text-slate-400">
                Architecture prête pour le raccordement de sources réelles
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-slate-100 uppercase">
              OSINT <span className="text-amber-400">AFRICA</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
              « Veille et analyse de l'information ouverte en Afrique »
            </p>
          </div>

          <div className="flex items-center gap-2">
            <DemoWatermarkBanner compact />
          </div>
        </div>

        {/* Quick KPI stats bar (Requirement 13) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div 
            onClick={() => onNavigate('alertes')}
            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Alertes critiques</span>
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-xl font-black text-rose-400 group-hover:scale-105 transition-transform">
              {stats.criticalAlertsCount}
            </div>
          </div>

          <div 
            onClick={() => onNavigate('alertes')}
            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/40 cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Alertes élevées</span>
              <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="text-xl font-black text-orange-400 group-hover:scale-105 transition-transform">
              {stats.highAlertsCount}
            </div>
          </div>

          <div 
            onClick={() => onNavigate('pays')}
            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Pays prioritaires</span>
              <Eye className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black text-amber-400 group-hover:scale-105 transition-transform">
              25 / 25
            </div>
          </div>

          <div 
            onClick={() => onNavigate('dossiers')}
            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Dossiers d’analyse</span>
              <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl font-black text-sky-400 group-hover:scale-105 transition-transform">
              {stats.dossiersCount}
            </div>
          </div>
        </div>

        {/* Second row of indicators: Sources, Acteurs, Notes, Corrélations */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
          <div 
            onClick={() => onNavigate('sources')}
            className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Sources</span>
            </div>
            <span className="font-mono font-bold text-slate-200">{stats.sourcesCount || 8}</span>
          </div>

          <div 
            onClick={() => onNavigate('acteurs')}
            className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Acteurs</span>
            </div>
            <span className="font-mono font-bold text-slate-200">{stats.actorsCount || 6}</span>
          </div>

          <div 
            onClick={() => onNavigate('dossiers')}
            className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Notes d'analyse</span>
            </div>
            <span className="font-mono font-bold text-slate-200">{notes.length || 3}</span>
          </div>

          <div 
            onClick={() => onNavigate('correlation')}
            className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400/60 cursor-pointer flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Network className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 font-medium">Corrélations</span>
            </div>
            <span className="font-mono font-bold text-amber-400">10</span>
          </div>
        </div>
      </div>

      {/* LOT 18: CENTRE DE FUSION DU RENSEIGNEMENT OSINT */}
      <div
        id="banner-fusion-center"
        onClick={() => onNavigate('fusion')}
        className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-blue-950/40 border border-cyan-500/40 hover:border-cyan-400/80 cursor-pointer transition-all shadow-lg group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                Centre de Fusion du Renseignement OSINT
              </span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-[10px] font-mono text-cyan-300 font-bold">
                LOT 18
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-300 font-bold">
                DÉMONSTRATION
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Vue intégrée de la situation : croisement multi-sources, matrice par pays, contradictions & réseau relationnel.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-semibold group-hover:translate-x-1 transition-transform self-end sm:self-center">
          <span>Accéder à la fusion</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* LOT 19: CENTRE DE PRODUCTION ET TRAÇABILITÉ */}
      <div
        id="banner-production-center"
        onClick={() => onNavigate('production')}
        className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/90 to-purple-950/40 border border-indigo-500/40 hover:border-indigo-400/80 cursor-pointer transition-all shadow-lg group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 group-hover:scale-105 transition-transform">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                Centre de Production du Renseignement
              </span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-[10px] font-mono text-indigo-300 font-bold">
                LOT 19
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Production analytique structurée, évaluation des sources, conclusion de l'analyste, et chaîne de traçabilité complète.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold group-hover:translate-x-1 transition-transform self-end sm:self-center">
          <span>Ouvrir l'atelier</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* LOT 22: CENTRE DE CONFIGURATION, GOUVERNANCE ET ORCHESTRATION */}
      <div
        id="banner-governance-center"
        onClick={() => onNavigate('gouvernance')}
        className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-slate-950 border border-amber-500/40 hover:border-amber-400/80 cursor-pointer transition-all shadow-lg group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition-transform">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Centre de Gouvernance & Orchestration des Sources
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-[10px] font-mono text-amber-300 font-bold">
                LOT 22
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold">
                100% HORS LIGNE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Qualification déontologique des 130 sources, attribution de priorités (P1-P5), validation humaine obligatoire et isolation réseau.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold group-hover:translate-x-1 transition-transform self-end sm:self-center">
          <span>Gérer la gouvernance</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* LOT 24: MOTEUR DE VEILLE CONTINUE CONTRÔLÉE */}
      <div
        id="banner-watch-center"
        onClick={() => onNavigate('veille')}
        className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-amber-950/40 border border-emerald-500/40 hover:border-emerald-400/80 cursor-pointer transition-all shadow-lg group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Centre de Veille Continue & Orchestration
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px] font-mono text-emerald-300 font-bold">
                LOT 24
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-300 font-bold">
                SOURCE RÉELLE PILOTE APS
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Planification cadencée, détection d'anomalies, kill switches, limitation stricte de volume et historique des exécutions.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold group-hover:translate-x-1 transition-transform self-end sm:self-center">
          <span>Accéder à la veille</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Requirement 13: Répartition des risques & Pays les plus actifs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Répartition des risques */}
        <div className="lg:col-span-1 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Répartition des risques</span>
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">{recentEvents.length} événements</span>
            </div>

            {/* Stacked percentage bar */}
            <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-slate-800 p-0.5 gap-0.5 border border-slate-700">
              <div 
                style={{ width: `${critPercent}%` }} 
                className="h-full bg-rose-500 rounded-l-full transition-all duration-500" 
                title={`Critique: ${critPercent}%`}
              />
              <div 
                style={{ width: `${highPercent}%` }} 
                className="h-full bg-orange-500 transition-all duration-500" 
                title={`Élevé: ${highPercent}%`}
              />
              <div 
                style={{ width: `${modPercent}%` }} 
                className="h-full bg-amber-400 transition-all duration-500" 
                title={`Modéré: ${modPercent}%`}
              />
              <div 
                style={{ width: `${normPercent}%` }} 
                className="h-full bg-emerald-400 rounded-r-full transition-all duration-500" 
                title={`Normal: ${normPercent}%`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-rose-500/30 flex items-center justify-between">
              <span className="text-rose-400 font-medium">Critique</span>
              <span className="font-mono font-bold text-slate-200">{critCount} ({critPercent}%)</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-orange-500/30 flex items-center justify-between">
              <span className="text-orange-400 font-medium">Élevé</span>
              <span className="font-mono font-bold text-slate-200">{highCount} ({highPercent}%)</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-amber-500/30 flex items-center justify-between">
              <span className="text-amber-400 font-medium">Modéré</span>
              <span className="font-mono font-bold text-slate-200">{modCount} ({modPercent}%)</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-emerald-500/30 flex items-center justify-between">
              <span className="text-emerald-400 font-medium">Normal</span>
              <span className="font-mono font-bold text-slate-200">{normCount} ({normPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Pays les plus actifs */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Pays les plus actifs sous veille</span>
            </h2>
            <button
              onClick={() => onNavigate('pays')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <span>Tous les pays</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {topActiveCountries.map((c, index) => (
              <div
                key={c.id}
                onClick={() => onSelectCountry(c)}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between text-center group"
              >
                <div>
                  <div className="text-2xl mb-1">{c.flag || '🌍'}</div>
                  <div className="text-xs font-bold text-slate-100 group-hover:text-amber-300 truncate">
                    {c.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">{c.code}</div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80">
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300">
                    {c.activeAlertsCount} alertes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 1. Alertes Critiques Section */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
              Alertes Critiques Prioritaires ({criticalAlerts.length})
            </h2>
          </div>
          <button
            onClick={() => onNavigate('alertes')}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>Toutes les alertes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {criticalAlerts.map((alert) => {
            const correspondingEvent = recentEvents.find((e) => e.id === alert.eventId);
            return (
              <div
                key={alert.id}
                onClick={() => correspondingEvent && onSelectEvent(correspondingEvent)}
                className="p-3.5 rounded-xl bg-[#141219] border border-rose-500/40 hover:border-rose-400 cursor-pointer transition-all shadow-md group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                <div className="flex items-center justify-between gap-2 mb-1.5 pl-1">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity="CRITIQUE" size="sm" />
                    <span className="text-xs font-bold text-amber-400">{alert.countryName}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {alert.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{alert.timestamp}</span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-rose-200 transition-colors pl-1">
                  {alert.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 pl-1">
                  {alert.summary}
                </p>
                <div className="mt-2.5 pl-1 flex items-center justify-between text-[11px] text-rose-400/90 font-medium">
                  <span className="font-mono text-[10px]">DONNÉES DE DÉMONSTRATION</span>
                  <span className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    Ouvrir la fiche analytique <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Requirement 13: Dernières Notes d'Analyse */}
      {notes.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
                Dernières Notes d'Analyse Opérationnelle
              </h2>
            </div>
            <button
              onClick={() => onNavigate('dossiers')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <span>Voir les notes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {notes.slice(0, 2).map((note) => (
              <div
                key={note.id}
                onClick={() => onOpenNote && onOpenNote(note)}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">
                    {note.classification}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{note.createdAt}</span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {note.synthese}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Auteur: <strong className="text-slate-400">{note.author}</strong></span>
                  <span className="text-amber-400 font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Consulter <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Requirement 13: Accès rapide aux 25 pays prioritaires */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
              Accès Rapide aux 25 Pays Prioritaires
            </h2>
          </div>
          <button
            onClick={() => onNavigate('pays')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
          >
            <span>Fiches complètes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {countries.slice(0, 25).map((country) => (
            <button
              key={country.id}
              onClick={() => onSelectCountry(country)}
              className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all flex items-center gap-2 text-left group"
            >
              <span className="text-xl shrink-0">{country.flag || '🌍'}</span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 truncate">
                  {country.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>{country.code}</span>
                  <span className="text-rose-400 font-semibold">{country.activeAlertsCount} evt</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Dernières informations & Événements récents */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
              Dernières informations & Événements récents
            </h2>
          </div>
          <button
            onClick={() => onNavigate('flux')}
            className="text-xs text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1"
          >
            <span>Flux complet</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {recentEvents.slice(0, 5).map((evt) => (
            <div
              key={evt.id}
              onClick={() => onSelectEvent(evt)}
              className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={evt.severity} size="sm" />
                  <ConfidenceBadge
                    admiraltyCode={evt.admiraltyCode}
                    confidenceScore={evt.confidenceScore}
                    size="sm"
                  />
                  <span className="text-xs font-semibold text-amber-400">{evt.countryName}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{evt.date}</span>
              </div>

              <h3 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                {evt.title}
              </h3>

              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {evt.summary}
              </p>

              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Source Démo : {evt.source.name}</span>
                <span className="text-amber-400/80 group-hover:text-amber-300 flex items-center gap-1">
                  Examiner <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
