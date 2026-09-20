import React, { useState, useMemo } from 'react';
import {
  Network,
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
  MapPin,
  Calendar,
  Radio,
  Users2,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  RefreshCw,
  Eye,
  GitMerge,
  GitPullRequest,
  Copy,
  Info,
  ExternalLink,
} from 'lucide-react';
import {
  OsintCorrelation,
  OsintWeakSignal,
  CorrelationType,
  CorrelationConfidence,
  SignalSignificance,
  CorrelationStatus,
  OsintEvent,
  Category,
  ALL_CATEGORIES,
  CorrelationNetworkNode,
  CorrelationNetworkLink,
} from '../../types';
import { UseOsintViewModelReturn } from '../../viewmodels/useOsintViewModel';
import {
  DEMO_CORRELATIONS,
  DEMO_WEAK_SIGNALS,
  DEMO_CONVERGENCES_CONTRADICTIONS,
  DEMO_DUPLICATE_CANDIDATES,
  CORRELATION_DISCLAIMER,
  ANALYTICAL_EVALUATION_NOTICE,
} from '../../data/correlationData';
import {
  buildCorrelationNetwork,
  checkEventDuplicates,
} from '../../services/correlationEngine';
import { CorrelationDetailModal } from '../modals/CorrelationDetailModal';
import { DemoWatermarkBanner } from '../common/DemoWatermarkBanner';

interface Props {
  vm: UseOsintViewModelReturn;
}

type TabMode = 'dashboard' | 'correlations' | 'weak_signals' | 'network' | 'convergences';

export const CorrelationCenterScreen: React.FC<Props> = ({ vm }) => {
  // Active sub-tab
  const [activeTab, setActiveTab] = useState<TabMode>('dashboard');

  // Selected correlation / weak signal for deep inspection modal
  const [selectedCorrelation, setSelectedCorrelation] = useState<OsintCorrelation | null>(null);
  const [selectedWeakSignal, setSelectedWeakSignal] = useState<OsintWeakSignal | null>(null);

  // Search & Filter state for correlations table
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('TOUS');
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUTES');
  const [selectedType, setSelectedType] = useState<string>('TOUS');
  const [selectedConfidence, setSelectedConfidence] = useState<string>('TOUS');
  const [selectedSignificance, setSelectedSignificance] = useState<string>('TOUS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TOUS');
  const [sortBy, setSortBy] = useState<'recent' | 'score' | 'confidence' | 'significance' | 'occurrences'>('score');

  // Interactive Node selection for Network visualization
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeTypeFilter, setNodeTypeFilter] = useState<string>('ALL');

  // Local data lists
  const correlations: OsintCorrelation[] = useMemo(() => {
    return DEMO_CORRELATIONS;
  }, []);

  const weakSignals: OsintWeakSignal[] = useMemo(() => {
    return DEMO_WEAK_SIGNALS;
  }, []);

  // Compute dynamic KPIs
  const stats = useMemo(() => {
    const totalCorrelations = correlations.length;
    const strongCorrelations = correlations.filter((c) => c.score >= 6).length;
    const totalSignals = weakSignals.length;
    const signalsToExamine = weakSignals.filter(
      (s) => s.status === 'À EXAMINER' || s.status === 'NOUVEAU'
    ).length;
    const signalsIncreasing = weakSignals.filter((s) => s.evolution === 'EN HAUSSE').length;
    const convergencesCount = DEMO_CONVERGENCES_CONTRADICTIONS.filter((i) => i.type === 'CONVERGENCE').length;
    const contradictionsCount = DEMO_CONVERGENCES_CONTRADICTIONS.filter((i) => i.type === 'CONTRADICTION').length;

    return {
      totalCorrelations,
      strongCorrelations,
      totalSignals,
      signalsToExamine,
      signalsIncreasing,
      convergencesCount,
      contradictionsCount,
    };
  }, [correlations, weakSignals]);

  // Filtered & Sorted Correlations
  const filteredCorrelations = useMemo(() => {
    return correlations
      .filter((c) => {
        if (selectedCountry !== 'TOUS' && !c.countryCodes.includes(selectedCountry)) {
          return false;
        }
        if (selectedCategory !== 'TOUTES' && !c.categoryIds.includes(selectedCategory)) {
          return false;
        }
        if (selectedType !== 'TOUS' && c.correlationType !== selectedType) {
          return false;
        }
        if (selectedConfidence !== 'TOUS' && c.confidence !== selectedConfidence) {
          return false;
        }
        if (selectedSignificance !== 'TOUS' && c.significance !== selectedSignificance) {
          return false;
        }
        if (selectedStatus !== 'TOUS' && c.status !== selectedStatus) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchDesc = c.description.toLowerCase().includes(q);
          const matchActor = c.actorIds.some((a) => a.toLowerCase().includes(q));
          const matchCountry = c.countryCodes.some((code) => code.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchActor && !matchCountry) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.score - a.score;
        if (sortBy === 'recent') return new Date(b.lastObservedAt).getTime() - new Date(a.lastObservedAt).getTime();
        if (sortBy === 'occurrences') return b.occurrenceCount - a.occurrenceCount;
        if (sortBy === 'significance') {
          const weights: Record<string, number> = { CRITIQUE: 4, IMPORTANTE: 3, MODÉRÉE: 2, FAIBLE: 1 };
          return (weights[b.significance] || 0) - (weights[a.significance] || 0);
        }
        return 0;
      });
  }, [
    correlations,
    selectedCountry,
    selectedCategory,
    selectedType,
    selectedConfidence,
    selectedSignificance,
    selectedStatus,
    searchQuery,
    sortBy,
  ]);

  // Network graph data
  const networkData = useMemo(() => {
    return buildCorrelationNetwork(
      correlations,
      vm.events,
      vm.actors,
      vm.sources,
      vm.priorityCountries
    );
  }, [correlations, vm.events, vm.actors, vm.sources, vm.priorityCountries]);

  // Duplicate analysis
  const duplicateResults = useMemo(() => {
    return [...DEMO_DUPLICATE_CANDIDATES, ...checkEventDuplicates(vm.events)];
  }, [vm.events]);

  const getConfidenceStyle = (conf: CorrelationConfidence) => {
    switch (conf) {
      case 'TRÈS ÉLEVÉE':
      case 'ÉLEVÉE':
        return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400';
      case 'MOYENNE':
        return 'bg-amber-500/15 border-amber-500/40 text-amber-400';
      case 'FAIBLE':
      case 'TRÈS FAIBLE':
        return 'bg-orange-500/15 border-orange-500/40 text-orange-400';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  const getSignificanceStyle = (sig: SignalSignificance) => {
    switch (sig) {
      case 'CRITIQUE':
        return 'bg-rose-500/20 border-rose-500/50 text-rose-400';
      case 'IMPORTANTE':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
      case 'MODÉRÉE':
        return 'bg-amber-500/20 border-amber-500/50 text-amber-300';
      case 'FAIBLE':
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div id="screen-correlation-center" className="space-y-6 pb-12 animate-fadeIn text-slate-100">
      {/* 1. Header & Official Title Banner */}
      <div className="bg-gradient-to-br from-[#131929] via-[#0f1422] to-[#0a0d16] border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-wider text-amber-400 font-bold uppercase">
                CENTRE DE CORRÉLATION & SIGNAUX FAIBLES
              </span>
              <span className="hidden md:inline text-slate-600 text-xs">•</span>
              <span className="text-[11px] font-mono text-slate-400">
                Détection locale de patterns et convergences multi-sources
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-slate-100 uppercase flex items-center gap-2.5">
              <Network className="w-6 h-6 text-amber-400" />
              <span>CENTRE DE CORRÉLATION OSINT</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              « Analyse des relations, convergences et signaux faibles »
            </p>
          </div>

          <div className="flex items-center gap-2">
            <DemoWatermarkBanner compact />
          </div>
        </div>

        {/* Permanent Methodological Disclaimer (Requirement Sections 2 & 7) */}
        <div className="mt-4 p-3 rounded-xl bg-amber-950/25 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-300">
              « {CORRELATION_DISCLAIMER} »
            </p>
            <p className="text-[11px] text-amber-400/80">
              {ANALYTICAL_EVALUATION_NOTICE} — Ne jamais qualifier automatiquement une corrélation d'intention d'acteur ou de causalité sans vérification primaire.
            </p>
          </div>
        </div>

        {/* Dynamic KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-4">
          <div
            onClick={() => setActiveTab('correlations')}
            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-colors group"
          >
            <div className="text-[11px] text-slate-400">Corrélations</div>
            <div className="text-xl font-mono font-black text-amber-400 group-hover:scale-105 transition-transform mt-0.5">
              {stats.totalCorrelations}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">observées</div>
          </div>

          <div
            onClick={() => setActiveTab('correlations')}
            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-colors group"
          >
            <div className="text-[11px] text-slate-400">Scores élevés (≥6/8)</div>
            <div className="text-xl font-mono font-black text-emerald-400 group-hover:scale-105 transition-transform mt-0.5">
              {stats.strongCorrelations}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-1">Multi-facteurs</div>
          </div>

          <div
            onClick={() => setActiveTab('weak_signals')}
            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 cursor-pointer transition-colors group"
          >
            <div className="text-[11px] text-slate-400">Signaux faibles</div>
            <div className="text-xl font-mono font-black text-sky-400 group-hover:scale-105 transition-transform mt-0.5">
              {stats.totalSignals}
            </div>
            <div className="text-[10px] text-sky-400/80 mt-1">Détectés localement</div>
          </div>

          <div
            onClick={() => setActiveTab('weak_signals')}
            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 cursor-pointer transition-colors group"
          >
            <div className="text-[11px] text-slate-400">À examiner</div>
            <div className="text-xl font-mono font-black text-rose-400 group-hover:scale-105 transition-transform mt-0.5">
              {stats.signalsToExamine}
            </div>
            <div className="text-[10px] text-rose-400/80 mt-1">Priorité analyste</div>
          </div>

          <div
            onClick={() => setActiveTab('convergences')}
            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-colors group"
          >
            <div className="text-[11px] text-slate-400">Convergences</div>
            <div className="text-xl font-mono font-black text-indigo-400 group-hover:scale-105 transition-transform mt-0.5">
              {stats.convergencesCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Sources croisées</div>
          </div>

          <div
            onClick={() => setActiveTab('convergences')}
            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/40 cursor-pointer transition-colors group"
          >
            <div className="text-[11px] text-slate-400">Contradictions</div>
            <div className="text-xl font-mono font-black text-orange-400 group-hover:scale-105 transition-transform mt-0.5">
              {stats.contradictionsCount}
            </div>
            <div className="text-[10px] text-orange-400/80 mt-1">À arbitrer</div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto text-xs select-none">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tableau de Bord</span>
        </button>

        <button
          onClick={() => setActiveTab('correlations')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'correlations'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Tableau des Corrélations ({correlations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('weak_signals')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'weak_signals'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Signaux Faibles ({weakSignals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'network'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <GitMerge className="w-3.5 h-3.5" />
          <span>Réseau Analytique</span>
        </button>

        <button
          onClick={() => setActiveTab('convergences')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'convergences'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          <span>Convergences & Contradictions</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: DASHBOARD & KPIS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Explanatory Guide Box */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Network className="w-4 h-4" />
                <span>1. Corrélation observée</span>
              </div>
              <p className="text-slate-400">
                Convergence de métadonnées (temps, lieu, source, acteur). Calcul transparent basé sur un score auditable sur 8.
              </p>
            </div>

            <div className="space-y-1">
              <div className="font-bold text-sky-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                <span>2. Signal faible</span>
              </div>
              <p className="text-slate-400">
                Indice précurseur ou anomalie discrète nécessitant une surveillance attentive avant toute confirmation.
              </p>
            </div>

            <div className="space-y-1">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>3. Vérification humaine</span>
              </div>
              <p className="text-slate-400">
                Recoupement strict en sources ouvertes. Jamais de transformation automatique d'une corrélation en preuve.
              </p>
            </div>
          </div>

          {/* Top Priority Correlations */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Corrélations prioritaires récentes</span>
              </h2>
              <button
                onClick={() => setActiveTab('correlations')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                <span>Toutes les corrélations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {correlations.slice(0, 4).map((cor) => (
                <div
                  key={cor.id}
                  onClick={() => setSelectedCorrelation(cor)}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all hover:bg-slate-900 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {cor.correlationType}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSignificanceStyle(cor.significance)}`}>
                          {cor.significance}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-400">
                        <span>Score {cor.score}/{cor.maxScore}</span>
                      </div>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {cor.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5">
                      {cor.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>Pays : {cor.countryCodes.join(', ')}</span>
                      <span>•</span>
                      <span>{cor.occurrenceCount} obs.</span>
                    </div>
                    <span className="text-amber-400/90 group-hover:text-amber-300 flex items-center gap-1 font-medium">
                      Examiner <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Top Priority Weak Signals */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span>Signaux faibles à surveiller en priorité</span>
              </h2>
              <button
                onClick={() => setActiveTab('weak_signals')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
              >
                <span>Tous les signaux faibles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {weakSignals.slice(0, 4).map((sig) => (
                <div
                  key={sig.id}
                  onClick={() => setSelectedWeakSignal(sig)}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 cursor-pointer transition-all hover:bg-slate-900 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                          {sig.signalType}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getConfidenceStyle(sig.confidence)}`}>
                          {sig.confidence}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        {sig.evolution === 'EN HAUSSE' ? (
                          <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                        ) : sig.evolution === 'EN BAISSE' ? (
                          <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Minus className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{sig.evolution}</span>
                      </div>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                      {sig.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5">
                      {sig.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{sig.indicators.length} indicateurs observés</span>
                    <span className="text-sky-400/90 group-hover:text-sky-300 flex items-center gap-1 font-medium">
                      Examiner le signal <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: TABLEAU DES CORRÉLATIONS */}
      {activeTab === 'correlations' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Multi-criteria Search & Filters Bar */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Recherche multicritère (titre, acteur, source, pays, mot-clé)..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-800/70 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-xs rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="score">Trier par Score de Corrélation</option>
                  <option value="recent">Trier par Plus Récent</option>
                  <option value="significance">Trier par Importance</option>
                  <option value="occurrences">Trier par Nombre d'Occurrences</option>
                </select>
              </div>
            </div>

            {/* Filter Pills / Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1.5 text-slate-200"
              >
                <option value="TOUS">Tous les Pays</option>
                {vm.priorityCountries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1.5 text-slate-200"
              >
                <option value="TOUTES">Toutes les Catégories</option>
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1.5 text-slate-200"
              >
                <option value="TOUS">Tous les Types</option>
                <option value="MULTI_FACTOR">MULTI_FACTOR</option>
                <option value="TEMPORAL">TEMPORAL</option>
                <option value="SPATIAL">SPATIAL</option>
                <option value="ACTOR_EVENT">ACTOR_EVENT</option>
                <option value="SOURCE">SOURCE</option>
                <option value="COUNTRY_CATEGORY">COUNTRY_CATEGORY</option>
                <option value="EVENT_EVENT">EVENT_EVENT</option>
                <option value="CATEGORY">CATEGORY</option>
              </select>

              <select
                value={selectedConfidence}
                onChange={(e) => setSelectedConfidence(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1.5 text-slate-200"
              >
                <option value="TOUS">Toute Confiance</option>
                <option value="ÉLEVÉE">ÉLEVÉE</option>
                <option value="MOYENNE">MOYENNE</option>
                <option value="FAIBLE">FAIBLE</option>
              </select>

              <select
                value={selectedSignificance}
                onChange={(e) => setSelectedSignificance(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1.5 text-slate-200"
              >
                <option value="TOUS">Toute Importance</option>
                <option value="CRITIQUE">CRITIQUE</option>
                <option value="IMPORTANTE">IMPORTANTE</option>
                <option value="MODÉRÉE">MODÉRÉE</option>
                <option value="FAIBLE">FAIBLE</option>
              </select>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCountry('TOUS');
                  setSelectedCategory('TOUTES');
                  setSelectedType('TOUS');
                  setSelectedConfidence('TOUS');
                  setSelectedSignificance('TOUS');
                  setSelectedStatus('TOUS');
                }}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-medium text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Réinitialiser</span>
              </button>
            </div>
          </div>

          {/* Table (Requirement Section 24) */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0e1424] border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold select-none">
                  <tr>
                    <th className="py-3 px-3">ID / Titre</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Zone</th>
                    <th className="py-3 px-3">Score</th>
                    <th className="py-3 px-3">Confiance</th>
                    <th className="py-3 px-3">Importance</th>
                    <th className="py-3 px-3">Statut</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredCorrelations.length > 0 ? (
                    filteredCorrelations.map((cor) => (
                      <tr
                        key={cor.id}
                        onClick={() => setSelectedCorrelation(cor)}
                        className="hover:bg-slate-900/80 cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-500">{cor.id}</span>
                            <span className="font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                              {cor.title}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                            {cor.description}
                          </div>
                        </td>

                        <td className="py-3 px-3 shrink-0">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {cor.correlationType}
                          </span>
                        </td>

                        <td className="py-3 px-3 shrink-0">
                          <span className="text-amber-400 font-mono text-xs font-semibold">
                            {cor.countryCodes.join(', ')}
                          </span>
                        </td>

                        <td className="py-3 px-3 shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-400">
                              {cor.score}/{cor.maxScore}
                            </span>
                            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full"
                                style={{ width: `${(cor.score / cor.maxScore) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getConfidenceStyle(cor.confidence)}`}>
                            {cor.confidence}
                          </span>
                        </td>

                        <td className="py-3 px-3 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getSignificanceStyle(cor.significance)}`}>
                            {cor.significance}
                          </span>
                        </td>

                        <td className="py-3 px-3 shrink-0">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-400 border border-slate-700">
                            {cor.status}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right shrink-0">
                          <span className="text-amber-400/90 group-hover:text-amber-300 font-semibold flex items-center justify-end gap-1">
                            Examiner <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                        Aucune corrélation ne correspond aux critères de recherche actuels.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SIGNAUX FAIBLES À SURVEILLER */}
      {activeTab === 'weak_signals' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              La surveillance des signaux faibles permet de repérer des tendances avant leur consolidation formelle.
            </span>
            <span className="font-mono text-sky-400 font-semibold">
              {weakSignals.length} signaux répertoriés
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weakSignals.map((sig) => (
              <div
                key={sig.id}
                onClick={() => setSelectedWeakSignal(sig)}
                className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-all hover:bg-slate-900/80 shadow-lg flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold">
                        {sig.id}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        {sig.signalType}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold">
                      {sig.evolution === 'EN HAUSSE' ? (
                        <span className="text-rose-400 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> En hausse
                        </span>
                      ) : sig.evolution === 'EN BAISSE' ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" /> En baisse
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Minus className="w-3.5 h-3.5" /> Stable
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                    {sig.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {sig.description}
                  </p>

                  {/* Indicators bullets */}
                  <div className="space-y-1 pt-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Observations & Indicateurs :
                    </div>
                    {sig.indicators.slice(0, 2).map((ind, i) => (
                      <div key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                        <span className="line-clamp-1">{ind}</span>
                      </div>
                    ))}
                  </div>

                  {/* Uncertainties reminder */}
                  {sig.uncertainty.length > 0 && (
                    <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300/90 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{sig.uncertainty[0]}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getConfidenceStyle(sig.confidence)}`}>
                      {sig.confidence}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getSignificanceStyle(sig.significance)}`}>
                      {sig.significance}
                    </span>
                  </div>

                  <span className="text-sky-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Examiner le signal <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RÉSEAU ANALYTIQUE (Section 9) */}
      {activeTab === 'network' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-slate-200">Graphe de Relations Analytiques Multi-Entités</div>
              <p className="text-slate-400 text-[11px]">
                Visualisation des relations : Source → Événement, Acteur → Événement, Acteur → Pays, Événement ↔ Événement.
              </p>
            </div>

            {/* Filter by Node Type */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">Afficher :</span>
              <select
                value={nodeTypeFilter}
                onChange={(e) => setNodeTypeFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200"
              >
                <option value="ALL">Tous les Nœuds ({networkData.nodes.length})</option>
                <option value="event">Événements uniquement</option>
                <option value="actor">Acteurs uniquement</option>
                <option value="source">Sources uniquement</option>
                <option value="country">Pays uniquement</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Interactive SVG / Node Canvas Area */}
            <div className="lg:col-span-2 bg-[#090d15] border border-slate-800 rounded-2xl p-4 min-h-[480px] flex flex-col justify-between relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Pays
                  </span>
                  <span className="flex items-center gap-1 text-purple-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Acteur
                  </span>
                  <span className="flex items-center gap-1 text-sky-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Événement
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Source
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {networkData.nodes.length} nœuds • {networkData.links.length} relations
                </span>
              </div>

              {/* Graphical Nodes Matrix Representation */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 py-3">
                {networkData.nodes
                  .filter((n) => nodeTypeFilter === 'ALL' || n.type === nodeTypeFilter)
                  .map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const colorClasses =
                      node.type === 'country'
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                        : node.type === 'actor'
                        ? 'border-purple-500/40 bg-purple-950/20 text-purple-300'
                        : node.type === 'source'
                        ? 'border-amber-500/40 bg-amber-950/20 text-amber-300'
                        : 'border-sky-500/40 bg-sky-950/20 text-sky-300';

                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all text-xs flex flex-col justify-between select-none ${colorClasses} ${
                          isSelected
                            ? 'ring-2 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-[1.02]'
                            : 'hover:border-slate-600 hover:bg-slate-900/60'
                        }`}
                      >
                        <div>
                          <div className="text-[10px] uppercase font-mono tracking-wider opacity-70">
                            {node.type}
                          </div>
                          <div className="font-bold line-clamp-1 mt-0.5">{node.label}</div>
                        </div>

                        <div className="text-[10px] opacity-70 mt-1 flex items-center justify-between">
                          <span>{node.country || node.category || 'Afrique'}</span>
                          <span className="font-mono">w:{node.val}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Cliquez sur un nœud pour inspecter son faisceau de relations</span>
                <span className="text-amber-400/90 font-mono">Vue relationnelle OSINT</span>
              </div>
            </div>

            {/* Node Inspection Side Panel */}
            <div className="lg:col-span-1 bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-xl">
              {selectedNodeId ? (
                (() => {
                  const node = networkData.nodes.find((n) => n.id === selectedNodeId);
                  const relatedLinks = networkData.links.filter(
                    (l) => l.source === selectedNodeId || l.target === selectedNodeId
                  );

                  return (
                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] uppercase font-mono text-amber-400 font-bold">
                          Détails du Nœud
                        </div>
                        <h3 className="text-sm font-bold text-white mt-0.5">{node?.label}</h3>
                        <p className="text-xs text-slate-400 mt-1">{node?.sublabel || node?.type}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Relations connectées ({relatedLinks.length})
                        </div>
                        {relatedLinks.length > 0 ? (
                          <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                            {relatedLinks.map((l, i) => {
                              const otherNodeId = l.source === selectedNodeId ? l.target : l.source;
                              const otherNode = networkData.nodes.find((n) => n.id === otherNodeId);
                              return (
                                <div
                                  key={i}
                                  onClick={() => setSelectedNodeId(otherNodeId)}
                                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 cursor-pointer text-xs flex items-center justify-between transition-colors"
                                >
                                  <div>
                                    <span className="text-[10px] font-mono text-amber-400">
                                      {l.type}
                                    </span>
                                    <div className="text-slate-200 font-medium truncate max-w-[160px]">
                                      {otherNode?.label || otherNodeId}
                                    </div>
                                  </div>
                                  <ArrowRight className="w-3 h-3 text-slate-500" />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">
                            Aucune relation directe répertoriée dans le sous-graphe courant.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <Network className="w-8 h-8 text-slate-600" />
                  <div className="text-xs font-medium">Aucun nœud sélectionné</div>
                  <p className="text-[11px] text-slate-500">
                    Sélectionnez un acteur, une source, un événement ou un pays dans la grille pour visualiser ses liaisons.
                  </p>
                </div>
              )}

              <button
                onClick={() => setSelectedNodeId(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-xl text-slate-300 transition-colors"
              >
                Réinitialiser la sélection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CONVERGENCES & CONTRADICTIONS (Section 14 & 13) */}
      {activeTab === 'convergences' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Methodological rule notice */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Règle de neutralité analytique OSINT :</span>{' '}
              Ne jamais choisir arbitrairement ou automatiquement quelle source dit vrai en cas de contradiction. Présenter les deux versions avec leur code d'évaluation Amirauté et inciter à la recherche d'une source primaire.
            </div>
          </div>

          {/* Section 1: Convergences & Contradictions */}
          <div className="space-y-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-amber-400" />
              <span>Convergences & Contradictions de Sources Identifiées</span>
            </h2>

            <div className="space-y-3">
              {DEMO_CONVERGENCES_CONTRADICTIONS.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-3 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono border ${
                          item.type === 'CONVERGENCE'
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                            : 'bg-orange-950/40 border-orange-500/40 text-orange-400'
                        }`}
                      >
                        {item.title}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">• {item.topic}</span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Statut : {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                  {/* Sources involved comparative cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {item.sourcesInvolved.map((src, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                            <span className="truncate">{src.sourceName}</span>
                            {src.reliability && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">
                                {src.reliability}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1.5 italic">
                            « {src.position} »
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Observation analytique :</span>{' '}
                    {item.observation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Duplication & Information Consistency Checker (Section 13) */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Copy className="w-4 h-4 text-sky-400" />
                <span>Détection des Duplications d'Information (Audit Local)</span>
              </h2>
              <span className="text-[11px] text-slate-500 font-mono">
                {duplicateResults.length} cas examinés
              </span>
            </div>

            <div className="space-y-2.5">
              {duplicateResults.map((dup) => (
                <div
                  key={dup.id}
                  className="p-3.5 rounded-xl bg-[#0b0f19] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          dup.status === 'CONFIRMÉ_DUPLIQUÉ'
                            ? 'bg-rose-950/50 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-950/50 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {dup.status}
                      </span>
                      <span className="text-slate-400">Similarité : {dup.similarityScore}%</span>
                    </div>

                    <div className="text-xs font-bold text-slate-200 line-clamp-1">
                      Notice Principale : {dup.primaryEventTitle}
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-1">
                      Candidat Dupliqué : {dup.candidateEventTitle}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400 max-w-xs text-right">
                      {dup.suggestedAction}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Deep Inspection Modal */}
      {(selectedCorrelation || selectedWeakSignal) && (
        <CorrelationDetailModal
          correlation={selectedCorrelation}
          weakSignal={selectedWeakSignal}
          onClose={() => {
            setSelectedCorrelation(null);
            setSelectedWeakSignal(null);
          }}
          vm={vm}
          onOpenEvent={(evt) => {
            setSelectedCorrelation(null);
            setSelectedWeakSignal(null);
            vm.selectEvent(evt);
          }}
        />
      )}
    </div>
  );
};
