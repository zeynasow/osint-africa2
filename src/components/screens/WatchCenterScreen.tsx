import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
  Layers,
  Database,
  Hash,
  Activity,
  Lock,
  Unlock,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Server,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  X,
  FileText,
  StopCircle,
  Timer,
  Cpu,
  ArrowUpRight,
  Filter,
  CheckSquare,
  Search,
  ChevronRight,
  Info,
  Scale,
  Plus,
  Download,
  HelpCircle,
} from 'lucide-react';
import {
  watchOrchestrationService,
  FREQUENCY_MINUTES_MAP,
} from '../../services/watchOrchestrationService';
import { sourceIngestionService } from '../../services/sourceIngestionService';
import { watchPilotService } from '../../services/watchPilotService';
import {
  OsintWatchPlan,
  OsintWatchAction,
  OsintWatchReview,
  OsintWatchGap,
  OsintWatchContradiction,
  OsintWatchExecution,
  OsintWatchIncident,
  WatchPlanFrequency,
  WatchPlanStatus,
  WatchPlanPriority,
  WatchExecutionStatus,
  WatchIncidentSeverity,
  OsintRawItem,
  OsintNormalizedItem,
  CollectionAuditLog,
  ScreenId,
} from '../../types';
import { RawItemInspectModal } from '../modals/RawItemInspectModal';
import { WatchKpiBar } from '../watch/WatchKpiBar';
import { WatchFiltersBar, WatchFilterState } from '../watch/WatchFiltersBar';
import { WatchPlanCard } from '../watch/WatchPlanCard';
import { WatchPlanDetailModal } from '../watch/WatchPlanDetailModal';
import { WatchPlanFormModal } from '../watch/WatchPlanFormModal';
import { WatchActionModal } from '../watch/WatchActionModal';
import { WatchReviewModal } from '../watch/WatchReviewModal';
import { WatchGapModal } from '../watch/WatchGapModal';
import { WatchContradictionModal } from '../watch/WatchContradictionModal';

interface Props {
  onNavigate?: (screen: ScreenId) => void;
}

type MainTabType =
  | 'PILOTAGE'
  | 'ACTIONS_GLOBALES'
  | 'REVUES_HUMAINES'
  | 'GAPS_CONTRADICTIONS'
  | 'EXECUTIONS'
  | 'ITEMS'
  | 'INCIDENTS'
  | 'AUDIT';

export const WatchCenterScreen: React.FC<Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<MainTabType>('PILOTAGE');

  // Données du service de pilotage (LOT 29)
  const [pilotPlans, setPilotPlans] = useState<OsintWatchPlan[]>(() =>
    watchPilotService.getWatchPlans('ALL')
  );
  const [pilotKpi, setPilotKpi] = useState(() => watchPilotService.getPilotKpis('ALL'));

  // Données de l'orchestration technique (LOT 24)
  const [orchestratorPlans, setOrchestratorPlans] = useState<OsintWatchPlan[]>(() =>
    watchOrchestrationService.getPlans()
  );
  const [executions, setExecutions] = useState<OsintWatchExecution[]>(() =>
    watchOrchestrationService.getExecutions()
  );
  const [incidents, setIncidents] = useState<OsintWatchIncident[]>(() =>
    watchOrchestrationService.getIncidents()
  );
  const [auditLogs, setAuditLogs] = useState<CollectionAuditLog[]>(() =>
    watchOrchestrationService.getAuditLogs()
  );
  const [isGlobalKillSwitch, setIsGlobalKillSwitch] = useState<boolean>(() =>
    watchOrchestrationService.isGlobalKillSwitchActive()
  );

  // Données brutes et normalisées (Source Ingestion)
  const [rawItems, setRawItems] = useState<OsintRawItem[]>(() =>
    sourceIngestionService.getAllRawItems()
  );
  const [normalizedItems, setNormalizedItems] = useState<OsintNormalizedItem[]>(() =>
    sourceIngestionService.getAllNormalizedItems()
  );

  // Filtres du pilotage LOT 29
  const [filters, setFilters] = useState<WatchFilterState>({
    search: '',
    status: 'ALL',
    priority: 'ALL',
    region: 'ALL',
    category: 'ALL',
    sortBy: 'SCORE_DESC',
  });

  // Filtre d'environnement Global (ALL / REAL / DEMO)
  const [globalScope, setGlobalScope] = useState<'ALL' | 'REAL' | 'DEMO'>('ALL');

  // États locaux UI
  const [isExecutingPlanId, setIsExecutingPlanId] = useState<string | null>(null);
  const [selectedRawItem, setSelectedRawItem] = useState<OsintRawItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'warning' | 'error';
  } | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Modales interactives de pilotage
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState<OsintWatchPlan | null>(null);
  const [isPlanFormOpen, setIsPlanFormOpen] = useState<boolean>(false);
  const [planToEdit, setPlanToEdit] = useState<OsintWatchPlan | null>(null);

  const [isActionModalOpen, setIsActionModalOpen] = useState<boolean>(false);
  const [actionTargetPlan, setActionTargetPlan] = useState<OsintWatchPlan | null>(null);
  const [actionToEdit, setActionToEdit] = useState<OsintWatchAction | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewTargetPlan, setReviewTargetPlan] = useState<OsintWatchPlan | null>(null);

  const [isGapModalOpen, setIsGapModalOpen] = useState<boolean>(false);
  const [gapTargetPlan, setGapTargetPlan] = useState<OsintWatchPlan | null>(null);
  const [gapToResolve, setGapToResolve] = useState<OsintWatchGap | null>(null);
  const [gapModalMode, setGapModalMode] = useState<'CREATE' | 'RESOLVE'>('CREATE');

  const [isContradictionModalOpen, setIsContradictionModalOpen] = useState<boolean>(false);
  const [contradictionTargetPlan, setContradictionTargetPlan] = useState<OsintWatchPlan | null>(
    null
  );
  const [contradictionToArbitrate, setContradictionToArbitrate] =
    useState<OsintWatchContradiction | null>(null);
  const [contradictionModalMode, setContradictionModalMode] = useState<'CREATE' | 'ARBITRATE'>(
    'CREATE'
  );

  // Modale résolution incident LOT 24
  const [resolvingIncident, setResolvingIncident] = useState<OsintWatchIncident | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Synchronisation des services
  const refreshData = () => {
    setPilotPlans(watchPilotService.getWatchPlans(globalScope));
    setPilotKpi(watchPilotService.getPilotKpis(globalScope));
    setOrchestratorPlans(watchOrchestrationService.getPlans());
    setExecutions(watchOrchestrationService.getExecutions());
    setIncidents(watchOrchestrationService.getIncidents());
    setAuditLogs(watchOrchestrationService.getAuditLogs());
    setIsGlobalKillSwitch(watchOrchestrationService.isGlobalKillSwitchActive());
    setRawItems(sourceIngestionService.getAllRawItems());
    setNormalizedItems(sourceIngestionService.getAllNormalizedItems());
  };

  useEffect(() => {
    const unsubPilot = watchPilotService.subscribe(() => {
      refreshData();
    });
    const unsubOrch = watchOrchestrationService.subscribe(() => {
      refreshData();
    });
    return () => {
      unsubPilot();
      unsubOrch();
    };
  }, [globalScope]);

  const showToast = (text: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  // Liste des régions et catégories uniques pour les filtres
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    pilotPlans.forEach((p) => {
      (p.regions || []).forEach((r) => set.add(r));
    });
    return Array.from(set).sort();
  }, [pilotPlans]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    pilotPlans.forEach((p) => {
      (p.categories || []).forEach((c) => set.add(String(c)));
    });
    return Array.from(set).sort();
  }, [pilotPlans]);

  // Filtrage et Tri des Plans de Veille (LOT 29)
  const filteredPlans = useMemo(() => {
    let list = [...pilotPlans];

    // Scope global
    if (globalScope === 'REAL') list = list.filter((p) => !p.isDemo);
    if (globalScope === 'DEMO') list = list.filter((p) => p.isDemo);

    // Statut
    if (filters.status !== 'ALL') {
      list = list.filter((p) => p.status === filters.status);
    }

    // Priorité
    if (filters.priority !== 'ALL') {
      list = list.filter((p) => p.priority === filters.priority);
    }

    // Région
    if (filters.region !== 'ALL') {
      list = list.filter((p) => (p.regions || []).includes(filters.region));
    }

    // Catégorie
    if (filters.category !== 'ALL') {
      list = list.filter((p) => (p.categories || []).map(String).includes(filters.category));
    }

    // Recherche plein texte
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter((p) => {
        const titleMatch = (p.title || p.name || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        const objMatch = (p.objective || '').toLowerCase().includes(q);
        const countryMatch = (p.countries || []).some((c) => c.toLowerCase().includes(q));
        const termsMatch = (p.searchTerms || []).some((t) => t.toLowerCase().includes(q));
        const analystMatch = (p.analystId || '').toLowerCase().includes(q);
        return titleMatch || descMatch || objMatch || countryMatch || termsMatch || analystMatch;
      });
    }

    // Tri
    list.sort((a, b) => {
      if (filters.sortBy === 'SCORE_DESC') {
        const scoreA = watchPilotService.calculatePriorityScore(a).score;
        const scoreB = watchPilotService.calculatePriorityScore(b).score;
        return scoreB - scoreA;
      }
      if (filters.sortBy === 'NEXT_REVIEW_ASC') {
        const tA = a.nextReviewAt ? new Date(a.nextReviewAt).getTime() : Infinity;
        const tB = b.nextReviewAt ? new Date(b.nextReviewAt).getTime() : Infinity;
        return tA - tB;
      }
      if (filters.sortBy === 'UPDATED_DESC') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (filters.sortBy === 'TITLE_ASC') {
        return (a.title || a.name || '').localeCompare(b.title || b.name || '');
      }
      return 0;
    });

    return list;
  }, [pilotPlans, globalScope, filters]);

  // Export JSON consolidé
  const handleExportConsolidatedJson = () => {
    const jsonStr = watchPilotService.exportAllWatchPilotJson(globalScope);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OSINT_AFRICA_CENTRE_PILOTAGE_VEILLE_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Export JSON consolidé du Centre de Pilotage généré avec succès !', 'success');
  };

  // Actions d'orchestration (LOT 24 préservé)
  const handleExecuteNow = async (planId: string) => {
    setIsExecutingPlanId(planId);
    try {
      const result = await watchOrchestrationService.executePlan(
        planId,
        'Analyste Principal OSINT'
      );
      if (result.success) {
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l’exécution', 'error');
    } finally {
      setIsExecutingPlanId(null);
    }
  };

  const handleTogglePlanState = (plan: OsintWatchPlan) => {
    if (plan.enabled) {
      const res = watchOrchestrationService.pausePlan(plan.id, 'Analyste Principal OSINT');
      showToast(res.message, 'warning');
    } else {
      const res = watchOrchestrationService.activatePlan(plan.id, 'Analyste Principal OSINT');
      showToast(res.message, res.success ? 'success' : 'error');
    }
  };

  const handleToggleGlobalKillSwitch = () => {
    const newState = !isGlobalKillSwitch;
    watchOrchestrationService.setGlobalKillSwitch(newState, 'Analyste Principal OSINT');
    showToast(
      newState
        ? 'KILL SWITCH GLOBAL ACTIVÉ : Toutes les collectes et planifications sont verrouillées immédiatement.'
        : 'Kill switch global désactivé : Exécutions nominales réautorisées.',
      newState ? 'error' : 'success'
    );
  };

  const handleConfirmResolveIncident = () => {
    if (!resolvingIncident) return;
    const res = watchOrchestrationService.resolveIncident(
      resolvingIncident.id,
      'Analyste Principal OSINT',
      resolutionNotes
    );
    showToast(res.message, 'success');
    setResolvingIncident(null);
    setResolutionNotes('');
  };

  return (
    <div
      id="screen-centre-pilotage-veille"
      className="space-y-6 pb-16 animate-fadeIn max-w-7xl mx-auto px-2 sm:px-4"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : toastMessage.type === 'warning'
              ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          {toastMessage.type === 'success' && (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          {toastMessage.type === 'warning' && (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          {toastMessage.type === 'error' && (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* En-tête officiel — CENTRE DE PILOTAGE DE LA VEILLE OSINT (LOT 29) */}
      <div className="bg-gradient-to-br from-[#121927] via-[#0f1523] to-[#0a0d16] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono tracking-wider text-blue-400 font-bold uppercase">
                LOT 29 — CENTRE DE PILOTAGE DE LA VEILLE OSINT
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Source réelle connectée : APS (Sénégal)
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700">
                LOTS 15-28 Intégrés
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-3">
              <Timer className="w-6 h-6 text-blue-400" />
              Centre de Pilotage de la Veille OSINT
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-normal mt-1.5 max-w-3xl leading-relaxed">
              Direction opérationnelle et stratégique des plans de veille, priorisation déterministe
              explicable, suivi des actions d'investigation, revues analytiques humaines périodiques et
              arbitrage rigoureux des lacunes (gaps) et contradictions.
            </p>
          </div>

          {/* Contrôles globaux de droite : Kill Switch & Sélecteur d'environnement */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            {/* Filtre de périmètre RÉEL / DÉMO */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setGlobalScope('ALL')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  globalScope === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tous ({pilotPlans.length})
              </button>
              <button
                type="button"
                onClick={() => setGlobalScope('REAL')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                  globalScope === 'REAL'
                    ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Réel APS ({pilotPlans.filter((p) => !p.isDemo).length})
              </button>
              <button
                type="button"
                onClick={() => setGlobalScope('DEMO')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  globalScope === 'DEMO'
                    ? 'bg-amber-900/60 text-amber-200 border border-amber-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Démo ({pilotPlans.filter((p) => p.isDemo).length})
              </button>
            </div>

            {/* Kill Switch Global Header Control */}
            <button
              id="btn-global-kill-switch"
              onClick={handleToggleGlobalKillSwitch}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs tracking-wide transition-all shadow-lg ${
                isGlobalKillSwitch
                  ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-900/50 ring-2 ring-rose-400 animate-pulse'
                  : 'bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50'
              }`}
            >
              <StopCircle className="w-4 h-4 text-rose-400" />
              <span>{isGlobalKillSwitch ? 'KILL SWITCH : ACTIF' : 'KILL SWITCH : OFF'}</span>
            </button>
          </div>
        </div>

        {/* Bannière Doctrinale OSINT visible en permanence */}
        <div className="mt-4 pt-3 border-t border-slate-800/70 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-950/70 px-2.5 py-1 rounded border border-slate-800">
            <span className="text-amber-400 font-bold">1.</span>
            <span><strong className="text-slate-200">Priorité ≠ Vérité :</strong> Score d’attention, pas de certitude.</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/70 px-2.5 py-1 rounded border border-slate-800">
            <span className="text-purple-400 font-bold">2.</span>
            <span><strong className="text-slate-200">Corrélation ≠ Causalité :</strong> Liens à corroborer.</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/70 px-2.5 py-1 rounded border border-slate-800">
            <span className="text-rose-400 font-bold">3.</span>
            <span><strong className="text-slate-200">Anomalie ≠ Menace :</strong> Écart statistique à qualifier.</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/70 px-2.5 py-1 rounded border border-slate-800">
            <span className="text-emerald-400 font-bold">4.</span>
            <span><strong className="text-slate-200">Arbitrage humain :</strong> Validation obligatoire de l’analyste.</span>
          </div>
        </div>
      </div>

      {/* Barre des 10 KPIs de pilotage (LOT 29) */}
      <WatchKpiBar
        kpis={pilotKpi}
        isDemoFilter={globalScope}
        onFilterChange={(filter) => setGlobalScope(filter)}
      />

      {/* Navigation entre Onglets Principaux */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1 overflow-x-auto no-scrollbar text-xs">
        <button
          id="tab-pilotage-plans"
          type="button"
          onClick={() => setActiveTab('PILOTAGE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
            activeTab === 'PILOTAGE'
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          <Timer className="w-4 h-4 text-blue-400" />
          <span>Plans de veille ({pilotPlans.length})</span>
        </button>

        <button
          id="tab-actions-globales"
          type="button"
          onClick={() => setActiveTab('ACTIONS_GLOBALES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
            activeTab === 'ACTIONS_GLOBALES'
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-400" />
          <span>Actions ({pilotKpi.pendingActionsCount} en cours)</span>
        </button>

        <button
          id="tab-revues-humaines"
          type="button"
          onClick={() => setActiveTab('REVUES_HUMAINES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
            activeTab === 'REVUES_HUMAINES'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          <span>Revues Humaines</span>
        </button>

        <button
          id="tab-gaps-contradictions"
          type="button"
          onClick={() => setActiveTab('GAPS_CONTRADICTIONS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
            activeTab === 'GAPS_CONTRADICTIONS'
              ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          <Scale className="w-4 h-4 text-amber-400" />
          <span>Gaps ({pilotKpi.openGapsCount}) & Contradictions ({pilotKpi.activeContradictionsCount})</span>
        </button>

        <span className="text-slate-700">|</span>

        {/* Onglets Techniques LOT 24 préservés */}
        <button
          id="tab-watch-executions"
          type="button"
          onClick={() => setActiveTab('EXECUTIONS')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${
            activeTab === 'EXECUTIONS'
              ? 'bg-slate-800 text-slate-100 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Exécutions ({executions.length})</span>
        </button>

        <button
          id="tab-watch-items"
          type="button"
          onClick={() => setActiveTab('ITEMS')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${
            activeTab === 'ITEMS'
              ? 'bg-slate-800 text-slate-100 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Items bruts ({rawItems.length})</span>
        </button>

        <button
          id="tab-watch-incidents"
          type="button"
          onClick={() => setActiveTab('INCIDENTS')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${
            activeTab === 'INCIDENTS'
              ? 'bg-rose-950/40 text-rose-300 border border-rose-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Incidents ({incidents.filter((i) => i.status === 'ACTIVE').length})</span>
        </button>

        <button
          id="tab-watch-audit"
          type="button"
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${
            activeTab === 'AUDIT'
              ? 'bg-slate-800 text-slate-100 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Audit & Traçabilité</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* VUE 1 : CENTRE DE PILOTAGE DES PLANS DE VEILLE (LOT 29)             */}
      {/* ==================================================================== */}
      {activeTab === 'PILOTAGE' && (
        <div className="space-y-4">
          {/* Barre de Filtres & Recherche */}
          <WatchFiltersBar
            filters={filters}
            onFilterChange={(newF) => setFilters(newF)}
            onReset={() =>
              setFilters({
                search: '',
                status: 'ALL',
                priority: 'ALL',
                region: 'ALL',
                category: 'ALL',
                sortBy: 'SCORE_DESC',
              })
            }
            onNewPlan={() => {
              setPlanToEdit(null);
              setIsPlanFormOpen(true);
            }}
            onExportJson={handleExportConsolidatedJson}
            availableRegions={availableRegions}
            availableCategories={availableCategories}
            totalCount={pilotPlans.length}
            filteredCount={filteredPlans.length}
          />

          {/* Grille des Plans de Veille */}
          {filteredPlans.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
              <Search className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">
                Aucun plan de veille ne correspond aux filtres actuels.
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Modifiez vos critères de recherche ou réinitialisez les filtres pour afficher l'ensemble des plans.
              </p>
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    search: '',
                    status: 'ALL',
                    priority: 'ALL',
                    region: 'ALL',
                    category: 'ALL',
                    sortBy: 'SCORE_DESC',
                  })
                }
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlans.map((plan) => (
                <WatchPlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={(p) => setSelectedPlanForDetail(p)}
                  onAddAction={(p) => {
                    setActionTargetPlan(p);
                    setActionToEdit(null);
                    setIsActionModalOpen(true);
                  }}
                  onNewReview={(p) => {
                    setReviewTargetPlan(p);
                    setIsReviewModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* VUE 2 : TABLEAU DE BORD TRANSVERSAL DES ACTIONS DE VEILLE           */}
      {/* ==================================================================== */}
      {activeTab === 'ACTIONS_GLOBALES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Registre des actions de veille opérationnelle</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Suivi des vérifications de sources, réévaluations d'indicateurs et enquêtes contradictoires.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (pilotPlans.length > 0) {
                  setActionTargetPlan(pilotPlans[0]);
                  setActionToEdit(null);
                  setIsActionModalOpen(true);
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouvelle action
            </button>
          </div>

          <div className="space-y-2.5">
            {watchPilotService.getActions(undefined, globalScope).map((act) => {
              const linkedPlan = pilotPlans.find((p) => p.id === act.watchPlanId);
              return (
                <div
                  key={act.id}
                  className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          act.status === 'TERMINEE'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {act.status}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                        {act.type}
                      </span>
                      <span className="text-slate-400 font-mono">
                        Plan : <strong className="text-slate-200">{linkedPlan?.title || act.watchPlanId}</strong>
                      </span>
                      <span className="text-slate-500">• Échéance : {act.dueDate}</span>
                    </div>

                    <div className="text-sm font-bold text-slate-100">{act.title}</div>
                    {act.description && <p className="text-slate-400">{act.description}</p>}
                    {act.justification && (
                      <p className="text-emerald-400 text-[11px]">Clôture : {act.justification}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const nextStatus = act.status === 'TERMINEE' ? 'EN_COURS' : 'TERMINEE';
                        watchPilotService.updateActionStatus(
                          act.id,
                          nextStatus,
                          'Analyste Pôle Veille',
                          'Mise à jour rapide'
                        );
                      }}
                      className={`px-3 py-1.5 rounded text-xs font-semibold ${
                        act.status === 'TERMINEE'
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      {act.status === 'TERMINEE' ? 'Rouvrir' : 'Terminer'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VUE 3 : REGISTRE CONSOLIDÉ DES REVUES HUMAINES                      */}
      {/* ==================================================================== */}
      {activeTab === 'REVUES_HUMAINES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Revues analytiques humaines formelles</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Jalons périodiques d'évaluation : faits vérifiés, incertitudes, degré de confiance et conclusions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (pilotPlans.length > 0) {
                  setReviewTargetPlan(pilotPlans[0]);
                  setIsReviewModalOpen(true);
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouvelle revue formelle
            </button>
          </div>

          <div className="space-y-4">
            {watchPilotService.getReviews(undefined, globalScope).map((rev) => {
              const linkedPlan = pilotPlans.find((p) => p.id === rev.watchPlanId);
              return (
                <div
                  key={rev.id}
                  className="p-5 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 text-sm">
                        Revue du {new Date(rev.reviewDate).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="text-slate-400">
                        • Plan : <strong className="text-blue-400">{linkedPlan?.title || rev.watchPlanId}</strong>
                      </span>
                      <span className="text-slate-500">• Analyste : {rev.analystId}</span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-semibold text-[10px]">
                      Confiance : {rev.confidence}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-400 block mb-1">Évaluation globale :</span>
                    <p className="text-slate-200 leading-relaxed">{rev.assessment}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                    <div>
                      <span className="font-semibold text-emerald-400 block mb-1">Faits constatés :</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {rev.facts.map((f, idx) => (
                          <li key={idx}>{f}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-amber-400 block mb-1">Éléments non confirmés :</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {rev.unconfirmedInformation.map((u, idx) => (
                          <li key={idx}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="font-semibold text-slate-300 block mb-0.5">Conclusion motivée :</span>
                    <p className="text-slate-200 font-medium">{rev.conclusion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VUE 4 : GAPS D'INFORMATION & CONTRADICTIONS                         */}
      {/* ==================================================================== */}
      {activeTab === 'GAPS_CONTRADICTIONS' && (
        <div className="space-y-6">
          {/* Section Gaps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <div>
                <h2 className="text-sm font-bold text-orange-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  Lacunes d’information critiques & Zones grises
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Identification formelle des manques documentaires et suivi de leur comblement.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (pilotPlans.length > 0) {
                    setGapTargetPlan(pilotPlans[0]);
                    setGapToResolve(null);
                    setGapModalMode('CREATE');
                    setIsGapModalOpen(true);
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Signaler une lacune
              </button>
            </div>

            <div className="space-y-2.5">
              {watchPilotService.getGaps(undefined, globalScope).map((g) => (
                <div
                  key={g.id}
                  className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          g.status === 'RESOLU'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-orange-950 text-orange-300 border border-orange-800'
                        }`}
                      >
                        {g.status}
                      </span>
                      <span className="text-slate-400">Priorité : {g.priority}</span>
                      <span className="text-slate-500">• Responsable : {g.responsable}</span>
                    </div>
                    <div className="font-bold text-slate-100 text-sm">{g.title}</div>
                    {g.description && <p className="text-slate-400">{g.description}</p>}
                    {g.justification && (
                      <p className="text-emerald-400 text-[11px]">Résolution : {g.justification}</p>
                    )}
                  </div>

                  {g.status !== 'RESOLU' && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetPlan = pilotPlans.find((p) => p.id === g.watchPlanId) || pilotPlans[0];
                        setGapTargetPlan(targetPlan);
                        setGapToResolve(g);
                        setGapModalMode('RESOLVE');
                        setIsGapModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold shrink-0"
                    >
                      Résoudre avec justification
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section Contradictions */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <div>
                <h2 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  Contradictions et divergences entre sources
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recensement des déclarations incompatibles et arbitrages analytiques motivés.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (pilotPlans.length > 0) {
                    setContradictionTargetPlan(pilotPlans[0]);
                    setContradictionToArbitrate(null);
                    setContradictionModalMode('CREATE');
                    setIsContradictionModalOpen(true);
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Consigner une divergence
              </button>
            </div>

            <div className="space-y-3">
              {watchPilotService.getContradictions(undefined, globalScope).map((ctrd) => (
                <div
                  key={ctrd.id}
                  className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{ctrd.title}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                        {ctrd.category}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        ctrd.status === 'RESOLUE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : ctrd.status === 'EN_EXAMEN'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {ctrd.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                      <strong className="text-blue-400 block text-xs mb-1">Source A : {ctrd.sourceA}</strong>
                      <p className="text-slate-300 italic">« {ctrd.claimA} »</p>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                      <strong className="text-amber-400 block text-xs mb-1">Source B : {ctrd.sourceB}</strong>
                      <p className="text-slate-300 italic">« {ctrd.claimB} »</p>
                    </div>
                  </div>

                  {ctrd.resolutionNotes && (
                    <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded text-slate-300">
                      <strong className="text-slate-400 block text-[11px]">Arbitrage analytique :</strong>
                      <p className="text-slate-200">{ctrd.resolutionNotes}</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const targetPlan =
                          pilotPlans.find((p) => p.id === ctrd.watchPlanId) || pilotPlans[0];
                        setContradictionTargetPlan(targetPlan);
                        setContradictionToArbitrate(ctrd);
                        setContradictionModalMode('ARBITRATE');
                        setIsContradictionModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
                    >
                      Modifier l'arbitrage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VUE 5 : EXÉCUTIONS TECHNIQUES (LOT 24 PRÉSERVÉ)                     */}
      {/* ==================================================================== */}
      {activeTab === 'EXECUTIONS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <div className="text-xs text-slate-400">
              Historique local des cycles d'exécution cadencés ({executions.length} exécutions enregistrées)
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Horodatage ISO • Empreintes SHA-256 certifiées
            </div>
          </div>

          <div className="space-y-2">
            {executions.map((exec) => {
              const plan = orchestratorPlans.find((p) => p.id === exec.watchPlanId);
              return (
                <div
                  key={exec.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${
                          exec.status === 'SUCCESS'
                            ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400'
                            : exec.status === 'ERROR'
                            ? 'bg-rose-950/70 border-rose-500/50 text-rose-400'
                            : exec.status === 'BLOCKED_KILL_SWITCH'
                            ? 'bg-purple-950/70 border-purple-500/50 text-purple-400'
                            : 'bg-amber-950/70 border-amber-500/50 text-amber-400'
                        }`}
                      >
                        {exec.status}
                      </span>
                      <span className="font-bold text-slate-200">
                        {plan?.name || exec.watchPlanId}
                      </span>
                      <span className="text-slate-500 font-mono">({exec.durationMs} ms)</span>
                    </div>

                    <div className="text-slate-400">
                      Items récupérés : <strong className="text-slate-300">{exec.itemsFetchedCount}</strong> • Nouveaux items :{' '}
                      <strong className="text-emerald-400">{exec.newItemsCount}</strong>
                    </div>

                    {exec.errorMessage && (
                      <div className="text-rose-400 text-[11px] font-mono">{exec.errorMessage}</div>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-500 font-mono shrink-0">
                    <div>{new Date(exec.startedAt).toLocaleTimeString()}</div>
                    <div>{new Date(exec.startedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VUE 6 : ITEMS BRUTS ET NORMALISÉS (LOT 24 PRÉSERVÉ)                 */}
      {/* ==================================================================== */}
      {activeTab === 'ITEMS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <div className="text-xs text-slate-400">
              Flux d'ingestion des dépêches et données brutes ({rawItems.length} items en cache local)
            </div>
            <div className="text-xs font-mono text-slate-400">
              Source Réelle : APS (Agence de Presse Sénégalaise)
            </div>
          </div>

          <div className="space-y-2">
            {rawItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold text-[10px]">
                      {item.sourceId}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">{item.id}</span>
                  </div>
                  <div className="font-bold text-slate-100 text-sm">{item.title}</div>
                  <p className="text-slate-400 text-xs line-clamp-1">{item.content}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedRawItem(item)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold"
                  >
                    Inspecter l'item
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VUE 7 : GESTION DES INCIDENTS (LOT 24 PRÉSERVÉ)                     */}
      {/* ==================================================================== */}
      {activeTab === 'INCIDENTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <div className="text-xs text-slate-400">
              Registre des incidents techniques et coupures réseau ({incidents.length} enregistrés)
            </div>
            <div className="text-xs font-mono text-slate-400">
              Résolution obligatoire avec traçabilité humaine
            </div>
          </div>

          <div className="space-y-2.5">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.status === 'RESOLVED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {inc.status}
                    </span>
                    <span className="font-mono text-slate-300 font-semibold">{inc.type}</span>
                    <span className="text-slate-500">• Plan : {inc.watchPlanId}</span>
                  </div>
                  <div className="text-slate-200 text-sm font-semibold">{inc.message}</div>
                  {inc.resolutionNotes && (
                    <p className="text-emerald-400 text-[11px]">Résolution : {inc.resolutionNotes}</p>
                  )}
                </div>

                {inc.status !== 'RESOLVED' && (
                  <button
                    type="button"
                    onClick={() => {
                      setResolvingIncident(inc);
                      setResolutionNotes('');
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold shrink-0"
                  >
                    Résoudre l'incident
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VUE 8 : AUDIT ET TRAÇABILITÉ CONSOLIDÉE                             */}
      {/* ==================================================================== */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <div className="text-xs text-slate-400">
              Journal d'audit infalsifiable et traçabilité des opérations de veille ({auditLogs.length} entrées)
            </div>
            <div className="text-xs font-mono text-slate-400">
              Intégrité garantie • Non-répudiation des arbitrages
            </div>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      log.result === 'SUCCESS'
                        ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400'
                        : log.result === 'WARNING'
                        ? 'bg-amber-950/70 border-amber-500/40 text-amber-400'
                        : log.result === 'BLOCKED_OFFLINE'
                        ? 'bg-purple-950/70 border-purple-500/40 text-purple-400'
                        : 'bg-rose-950/70 border-rose-500/40 text-rose-400'
                    }`}
                  >
                    {log.result}
                  </span>

                  <span className="font-bold text-slate-200">{log.action}</span>
                  <span className="text-slate-400 hidden md:inline">— {log.details}</span>
                </div>

                <div className="text-[11px] text-slate-400 shrink-0">
                  {log.timestamp} • Initiateur : <strong className="text-slate-300">{log.initiator}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODALES INTERACTIVES DE PILOTAGE DE LA VEILLE                        */}
      {/* ==================================================================== */}

      {/* Modale Fiche Détaillée d'un Plan de Veille */}
      {selectedPlanForDetail && (
        <WatchPlanDetailModal
          plan={selectedPlanForDetail}
          onClose={() => setSelectedPlanForDetail(null)}
          onEditPlan={(p) => {
            setSelectedPlanForDetail(null);
            setPlanToEdit(p);
            setIsPlanFormOpen(true);
          }}
          onAddAction={(p) => {
            setActionTargetPlan(p);
            setActionToEdit(null);
            setIsActionModalOpen(true);
          }}
          onNewReview={(p) => {
            setReviewTargetPlan(p);
            setIsReviewModalOpen(true);
          }}
          onAddGap={(p) => {
            setGapTargetPlan(p);
            setGapToResolve(null);
            setGapModalMode('CREATE');
            setIsGapModalOpen(true);
          }}
          onResolveGap={(p, g) => {
            setGapTargetPlan(p);
            setGapToResolve(g);
            setGapModalMode('RESOLVE');
            setIsGapModalOpen(true);
          }}
          onAddContradiction={(p) => {
            setContradictionTargetPlan(p);
            setContradictionToArbitrate(null);
            setContradictionModalMode('CREATE');
            setIsContradictionModalOpen(true);
          }}
          onArbitrateContradiction={(p, ctrd) => {
            setContradictionTargetPlan(p);
            setContradictionToArbitrate(ctrd);
            setContradictionModalMode('ARBITRATE');
            setIsContradictionModalOpen(true);
          }}
          onPlanStatusChange={(p, newStatus) => {
            watchPilotService.updatePlanStatus(
              p.id,
              newStatus,
              'Analyste Pôle Veille',
              `Changement de statut vers ${newStatus}`
            );
            setSelectedPlanForDetail({ ...p, status: newStatus });
            showToast(`Statut du plan mis à jour : ${newStatus}`, 'success');
          }}
        />
      )}

      {/* Modale Création / Édition de Plan de Veille */}
      {isPlanFormOpen && (
        <WatchPlanFormModal
          plan={planToEdit}
          onClose={() => setIsPlanFormOpen(false)}
          onSaved={(saved) => {
            showToast(`Plan de veille « ${saved.title || saved.name} » enregistré !`, 'success');
            refreshData();
          }}
          defaultIsDemo={globalScope === 'REAL' ? false : true}
        />
      )}

      {/* Modale Action de Veille */}
      {isActionModalOpen && actionTargetPlan && (
        <WatchActionModal
          watchPlanId={actionTargetPlan.id}
          action={actionToEdit}
          onClose={() => setIsActionModalOpen(false)}
          onSaved={(saved) => {
            showToast(`Action « ${saved.title} » enregistrée avec succès !`, 'success');
            refreshData();
          }}
          isDemo={actionTargetPlan.isDemo}
        />
      )}

      {/* Modale Revue Analytique Humaine */}
      {isReviewModalOpen && reviewTargetPlan && (
        <WatchReviewModal
          watchPlanId={reviewTargetPlan.id}
          onClose={() => setIsReviewModalOpen(false)}
          onSaved={(saved) => {
            showToast(`Revue analytique humaine consignée avec succès !`, 'success');
            refreshData();
          }}
          isDemo={reviewTargetPlan.isDemo}
        />
      )}

      {/* Modale Gap / Lacune d'information */}
      {isGapModalOpen && gapTargetPlan && (
        <WatchGapModal
          watchPlanId={gapTargetPlan.id}
          gap={gapToResolve}
          mode={gapModalMode}
          onClose={() => setIsGapModalOpen(false)}
          onSaved={(saved) => {
            showToast(
              gapModalMode === 'RESOLVE'
                ? `Lacune (Gap) résolue avec justification humaine !`
                : `Nouvelle lacune documentée.`,
              'success'
            );
            refreshData();
          }}
          isDemo={gapTargetPlan.isDemo}
        />
      )}

      {/* Modale Contradiction / Divergence documentaire */}
      {isContradictionModalOpen && contradictionTargetPlan && (
        <WatchContradictionModal
          watchPlanId={contradictionTargetPlan.id}
          contradiction={contradictionToArbitrate}
          mode={contradictionModalMode}
          onClose={() => setIsContradictionModalOpen(false)}
          onSaved={(saved) => {
            showToast(
              contradictionModalMode === 'ARBITRATE'
                ? `Arbitrage de la divergence enregistré !`
                : `Contradiction entre sources consignée.`,
              'success'
            );
            refreshData();
          }}
          isDemo={contradictionTargetPlan.isDemo}
        />
      )}

      {/* Modal Résolution d'incident LOT 24 */}
      {resolvingIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              Résolution de l'incident
            </h3>

            <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-mono">
              <div>
                Type : <strong className="text-amber-400">{resolvingIncident.type}</strong>
              </div>
              <div>
                Plan : <strong>{resolvingIncident.watchPlanId}</strong>
              </div>
              <div>Message : {resolvingIncident.message}</div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Notes d'arbitrage et mesures correctives de l'analyste :
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Ex: Cause réseau identifiée, ajustement de la cadence ou vérification du flux effectuée..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResolvingIncident(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmResolveIncident}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                Confirmer la résolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Inspect Raw Item */}
      {selectedRawItem && (
        <RawItemInspectModal
          item={selectedRawItem}
          onClose={() => setSelectedRawItem(null)}
        />
      )}
    </div>
  );
};
