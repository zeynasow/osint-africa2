import React, { useState, useMemo, useEffect } from 'react';
import {
  Play,
  Pause,
  Layers,
  Database,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  GitMerge,
  GitBranch,
  FileText,
  FileCode,
  Hash,
  Activity,
  Send,
  Lock,
  Eye,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Power,
  Radio
} from 'lucide-react';
import { UseOsintViewModelReturn } from '../../viewmodels/useOsintViewModel';
import {
  OsintCollectionJob,
  OsintRawItem,
  OsintNormalizedItem,
  CollectionAuditLog,
  DuplicateArbitrationAction,
  OsintSourceItem
} from '../../types';
import { sourceIngestionService } from '../../services/sourceIngestionService';
import { CollectionJobDetailModal } from '../modals/CollectionJobDetailModal';
import { RawItemInspectModal } from '../modals/RawItemInspectModal';
import { ArbitrateDuplicateModal } from '../modals/ArbitrateDuplicateModal';
import { LaunchCollectionModal } from '../modals/LaunchCollectionModal';
import { RealPilotCollectionTab } from '../collection/RealPilotCollectionTab';

interface CollectionCenterScreenProps {
  vm: UseOsintViewModelReturn;
}

type TabType = 'pilot' | 'jobs' | 'raw' | 'normalized' | 'duplicates' | 'pipeline' | 'audit';

export const CollectionCenterScreen: React.FC<CollectionCenterScreenProps> = ({ vm }) => {
  // Navigation interne
  const [activeTab, setActiveTab] = useState<TabType>('pilot');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dataOriginFilter, setDataOriginFilter] = useState<'ALL' | 'REAL' | 'DEMO'>('ALL');

  // État du service local
  const [killSwitch, setKillSwitch] = useState<boolean>(() => sourceIngestionService.getKillSwitchStatus());
  const [jobs, setJobs] = useState<OsintCollectionJob[]>(() => sourceIngestionService.getAllJobs());
  const [rawItems, setRawItems] = useState<OsintRawItem[]>(() => sourceIngestionService.getAllRawItems());
  const [normalizedItems, setNormalizedItems] = useState<OsintNormalizedItem[]>(() => sourceIngestionService.getAllNormalizedItems());
  const [auditLogs, setAuditLogs] = useState<CollectionAuditLog[]>(() => sourceIngestionService.getAuditLogs());
  const [metrics, setMetrics] = useState(() => sourceIngestionService.getMetrics());

  // Modales
  const [selectedJob, setSelectedJob] = useState<OsintCollectionJob | null>(null);
  const [selectedRawItem, setSelectedRawItem] = useState<OsintRawItem | null>(null);
  const [arbitrateItem, setArbitrateItem] = useState<OsintNormalizedItem | null>(null);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Synchronisation avec le service
  const refreshLocalState = () => {
    setKillSwitch(sourceIngestionService.getKillSwitchStatus());
    setJobs(sourceIngestionService.getAllJobs());
    setRawItems(sourceIngestionService.getAllRawItems());
    setNormalizedItems(sourceIngestionService.getAllNormalizedItems());
    setAuditLogs(sourceIngestionService.getAuditLogs());
    setMetrics(sourceIngestionService.getMetrics());
  };

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Bascule du Kill Switch (Arrêt d'urgence)
  const handleToggleKillSwitch = () => {
    const nextState = !killSwitch;
    sourceIngestionService.setKillSwitchStatus(nextState);
    refreshLocalState();
    showToast(
      nextState
        ? "ARRÊT D'URGENCE ACTIVÉ : Toutes les collectes simulées sont verrouillées."
        : 'Arrêt d’urgence levé : Le banc d’essai local est opérationnel.',
      nextState ? 'warning' : 'info'
    );
  };

  // Lancement de collecte simulée
  const handleLaunchCollection = async (
    sourceId: string,
    connectorId: string,
    options: { maxItems: number; simulateErrors?: boolean }
  ) => {
    const result = await sourceIngestionService.simulateCollection(sourceId, connectorId, {
      maxItems: options.maxItems,
      simulateErrors: options.simulateErrors,
      initiatedBy: 'Analyste OSINT (Console Locale)',
    });

    refreshLocalState();

    if (result.blockedReason) {
      showToast(result.blockedReason, 'warning');
    } else {
      showToast(
        `Collecte simulée ${result.job.id} terminée avec succès (${result.rawItems.length} items traités).`,
        'success'
      );
    }
  };

  // Arbitrage manuel d'un doublon
  const handleArbitrate = (
    itemId: string,
    action: DuplicateArbitrationAction,
    comment: string
  ) => {
    sourceIngestionService.arbitrateDuplicate(itemId, action, comment, 'Analyste OSINT');
    refreshLocalState();
    showToast(`Décision d'arbitrage enregistrée : ${action}`, 'success');
  };

  // Rejet manuel d'un item brut
  const handleRejectRaw = (rawItemId: string, reason: string) => {
    sourceIngestionService.rejectRawItem(rawItemId, reason, 'Analyste OSINT');
    refreshLocalState();
    showToast(`Item brut ${rawItemId} rejeté. Motif consigné dans l'audit.`, 'warning');
  };

  // Conversion en événement OSINT
  const handleConvertToEvent = (normalizedItemId: string) => {
    const res = sourceIngestionService.convertNormalizedItemToEvent(normalizedItemId, 'Analyste Renseignement');
    if (res.success && res.eventId) {
      refreshLocalState();
      showToast(`Événement ${res.eventId} créé avec succès. Traçabilité établie.`, 'success');
    } else {
      showToast(res.error || 'Erreur lors de la création d’événement', 'warning');
    }
  };

  // Réinitialisation du banc d'essai
  const handleResetSandbox = () => {
    if (window.confirm('Confirmez-vous la réinitialisation complète des données du banc d’essai local ?')) {
      sourceIngestionService.resetSandboxData();
      refreshLocalState();
      showToast('Banc d’essai de collecte réinitialisé à l’état initial.', 'info');
    }
  };

  // Résolution du libellé de source
  const getSourceDisplay = (sourceId: string) => {
    const src = vm.sources.find((s) => s.id === sourceId);
    if (src) return src.name;
    return sourceId;
  };

  // Filtrage des données
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchSearch =
        j.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.sourceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.connectorId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || j.status === statusFilter;
      const matchOrigin =
        dataOriginFilter === 'ALL' ||
        (dataOriginFilter === 'REAL' && j.isDemo === false) ||
        (dataOriginFilter === 'DEMO' && j.isDemo === true);
      return matchSearch && matchStatus && matchOrigin;
    });
  }, [jobs, searchQuery, statusFilter, dataOriginFilter]);

  const filteredRawItems = useMemo(() => {
    return rawItems.filter((r) => {
      const matchSearch =
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.sourceId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || r.processingStatus === statusFilter;
      const matchOrigin =
        dataOriginFilter === 'ALL' ||
        (dataOriginFilter === 'REAL' && r.isDemo === false) ||
        (dataOriginFilter === 'DEMO' && r.isDemo === true);
      return matchSearch && matchStatus && matchOrigin;
    });
  }, [rawItems, searchQuery, statusFilter, dataOriginFilter]);

  const filteredNormalizedItems = useMemo(() => {
    return normalizedItems.filter((n) => {
      const matchSearch =
        n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.country.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'DUPLICATES' && n.duplicateStatus !== 'UNIQUE') ||
        (statusFilter === 'UNIQUE' && n.duplicateStatus === 'UNIQUE') ||
        n.processingStatus === statusFilter;
      const matchOrigin =
        dataOriginFilter === 'ALL' ||
        (dataOriginFilter === 'REAL' && n.isDemo === false) ||
        (dataOriginFilter === 'DEMO' && n.isDemo === true);
      return matchSearch && matchStatus && matchOrigin;
    });
  }, [normalizedItems, searchQuery, statusFilter, dataOriginFilter]);

  const duplicateCandidateItems = useMemo(() => {
    return normalizedItems.filter((n) => n.duplicateStatus !== 'UNIQUE');
  }, [normalizedItems]);

  return (
    <div id="screen-collection-center" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div
          id="toast-collection-notification"
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl border text-xs font-semibold flex items-center gap-2 animate-fade-in ${
            notification.type === 'warning'
              ? 'bg-amber-950/90 text-amber-200 border-amber-500/50'
              : notification.type === 'info'
              ? 'bg-blue-950/90 text-blue-200 border-blue-500/50'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
          }`}
        >
          {notification.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          {notification.message}
        </div>
      )}

      {/* RÈGLE ABSOLUE N°1 & N°2 : BANDEAU PERMANENT SANDBOX HORS LIGNE (Consigne 2 & 27) */}
      <div
        id="banner-offline-sandbox"
        className="bg-purple-950/80 border-b border-purple-800/80 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 text-purple-200 font-semibold">
          <Shield className="w-4 h-4 text-purple-400 shrink-0" />
          <span>
            SANDBOX DE COLLECTE & D'INGESTION — STRICTEMENT HORS LIGNE (AUCUNE CONNEXION INTERNET)
          </span>
          <span className="hidden md:inline text-purple-400 font-normal">
            • Mode simulation locale actif • 112 sources réelles non connectées
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-purple-300">
          <span className="px-2 py-0.5 rounded bg-purple-900/60 border border-purple-700/60 font-mono font-bold">
            LOT 23-A SANDBOX
          </span>
          <span className="text-purple-400">Prêt pour qualification</span>
        </div>
      </div>

      {/* EN-TÊTE DU CENTRE DE COLLECTE */}
      <header className="border-b border-slate-800 bg-slate-900/60 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Centre de Collecte & d'Ingestion OSINT
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    SANDBOX LOCALE
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Orchestration locale, validation structurelle, déduplication et traçabilité du renseignement
                </p>
              </div>
            </div>
          </div>

          {/* Actions rapides du Header */}
          <div className="flex flex-wrap items-center gap-3">
            {/* KILL SWITCH (Consigne 26) */}
            <button
              id="btn-toggle-kill-switch"
              onClick={handleToggleKillSwitch}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition flex items-center gap-2 shadow-sm ${
                killSwitch
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
              title="Arrêt d'urgence immédiat pour suspendre toute collecte"
            >
              <Power className="w-4 h-4" />
              {killSwitch ? 'KILL SWITCH : ACTIF (BLOQUÉ)' : 'Kill Switch (Veille)'}
            </button>

            {/* Bouton de réinitialisation de la sandbox */}
            <button
              id="btn-reset-sandbox"
              onClick={handleResetSandbox}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
              title="Réinitialiser le jeu d'essai local"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Réinitialiser
            </button>

            {/* BOUTON LANCER COLLECTE SIMULÉE (Consigne 10) */}
            <button
              id="btn-open-launch-modal"
              onClick={() => setIsLaunchModalOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md transition flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> Lancer une Collecte Simulée
            </button>
          </div>
        </div>

        {/* ALERTE KILL SWITCH VISIBLE LORSQU'IL EST ACTIVÉ */}
        {killSwitch && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>ARRÊT D’URGENCE DÉCLENCHÉ :</strong> Toutes les requêtes d’ingestion et de simulation sont bloquées par le superviseur. Cliquez sur « KILL SWITCH : ACTIF » pour déverrouiller.
              </span>
            </div>
            <button
              onClick={handleToggleKillSwitch}
              className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] whitespace-nowrap"
            >
              Désactiver
            </button>
          </div>
        )}

        {/* 10 KPI STATISTIQUES (Consigne 8) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 mt-4 pt-4 border-t border-slate-800/80">
          <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-medium truncate">Jobs Totaux</div>
            <div className="text-lg font-bold text-white mt-0.5">{metrics.totalJobs}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-center">
            <div className="text-[10px] text-purple-400 font-medium truncate">Jobs Simulés</div>
            <div className="text-lg font-bold text-purple-300 mt-0.5">{metrics.simulatedJobs}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-center">
            <div className="text-[10px] text-emerald-400 font-medium truncate">Succès</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{metrics.successJobs}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-center">
            <div className="text-[10px] text-amber-400 font-medium truncate">Partiels</div>
            <div className="text-lg font-bold text-amber-400 mt-0.5">{metrics.partialJobs}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-center">
            <div className="text-[10px] text-rose-400 font-medium truncate">Échecs/Bloqués</div>
            <div className="text-lg font-bold text-rose-400 mt-0.5">{metrics.failedJobs}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-center">
            <div className="text-[10px] text-blue-400 font-medium truncate">Items Reçus</div>
            <div className="text-lg font-bold text-blue-300 mt-0.5">{metrics.itemsReceived}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-center">
            <div className="text-[10px] text-emerald-400 font-medium truncate">Normalisés</div>
            <div className="text-lg font-bold text-emerald-300 mt-0.5">{metrics.itemsNormalized}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-center">
            <div className="text-[10px] text-rose-400 font-medium truncate">Rejetés</div>
            <div className="text-lg font-bold text-rose-300 mt-0.5">{metrics.itemsRejected}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-center">
            <div className="text-[10px] text-amber-400 font-medium truncate">Doublons</div>
            <div className="text-lg font-bold text-amber-300 mt-0.5">{metrics.duplicatesDetected}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-center">
            <div className="text-[10px] text-purple-400 font-medium truncate">Événements</div>
            <div className="text-lg font-bold text-purple-300 mt-0.5">{metrics.eventsCreated}</div>
          </div>
        </div>
      </header>

      {/* BARRE D'ONGLETS & FILTRES */}
      <div className="border-b border-slate-800 bg-slate-900/40 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          {/* NOUVEAU ONGLET PILOTE RÉEL (LOT 23-B) */}
          <button
            id="tab-btn-pilot"
            onClick={() => {
              setActiveTab('pilot');
              setStatusFilter('ALL');
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pilot'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Collecte Réelle Pilote (APS)</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/30 text-amber-300 font-mono font-bold">
              1 SOURCE RÉELLE
            </span>
          </button>

          <button
            id="tab-btn-jobs"
            onClick={() => {
              setActiveTab('jobs');
              setStatusFilter('ALL');
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'jobs'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Jobs de Collecte ({jobs.length})
          </button>
          <button
            id="tab-btn-raw"
            onClick={() => {
              setActiveTab('raw');
              setStatusFilter('ALL');
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'raw'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" /> Données Brutes ({rawItems.length})
          </button>
          <button
            id="tab-btn-normalized"
            onClick={() => {
              setActiveTab('normalized');
              setStatusFilter('ALL');
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'normalized'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Normalisation ({normalizedItems.length})
          </button>
          <button
            id="tab-btn-duplicates"
            onClick={() => {
              setActiveTab('duplicates');
              setStatusFilter('ALL');
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'duplicates'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" /> Arbitrage Doublons ({duplicateCandidateItems.length})
          </button>
          <button
            id="tab-btn-pipeline"
            onClick={() => setActiveTab('pipeline')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" /> Pipeline & Traçabilité
          </button>
          <button
            id="tab-btn-audit"
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Journal d'Audit ({auditLogs.length})
          </button>
        </div>

        {/* Barre de Recherche Rapide & Filtre Global Origine (Consigne 35) */}
        <div className="flex flex-wrap items-center gap-2 py-2">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            <span className="px-2 py-1 text-[11px] text-slate-400 font-semibold hidden md:inline">
              Filtre Origine :
            </span>
            <button
              onClick={() => setDataOriginFilter('ALL')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                dataOriginFilter === 'ALL'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              TOUT
            </button>
            <button
              onClick={() => setDataOriginFilter('REAL')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                dataOriginFilter === 'REAL'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              RÉEL
            </button>
            <button
              onClick={() => setDataOriginFilter('DEMO')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                dataOriginFilter === 'DEMO'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-purple-300'
              }`}
            >
              DEMO
            </button>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher ID, source, titre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL PAR ONGLET */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* =========================================================================
            ONGLET 0 : COLLECTE RÉELLE PILOTE (LOT 23-B)
           ========================================================================= */}
        {activeTab === 'pilot' && (
          <RealPilotCollectionTab onRefreshParent={refreshLocalState} />
        )}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Affichage de <strong className="text-white">{filteredJobs.length}</strong> jobs de collecte simulés
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filtrer statut :
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2 py-1 text-xs rounded bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="SUCCESS">Succès</option>
                  <option value="PARTIAL">Partiel</option>
                  <option value="FAILED">Échec</option>
                  <option value="DISABLED">Bloqué / Désactivé</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3">ID Job</th>
                      <th className="p-3">Source & Connecteur</th>
                      <th className="p-3">Mode</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3">Horodatage</th>
                      <th className="p-3">Reçus / Validés / Rejetés</th>
                      <th className="p-3">Doublons</th>
                      <th className="p-3">Durée</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-500">
                          Aucun job de collecte ne correspond aux critères de filtre.
                        </td>
                      </tr>
                    ) : (
                      filteredJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-850/50 transition">
                          <td className="p-3 font-mono font-bold text-slate-200">
                            {job.id}
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-white">{getSourceDisplay(job.sourceId)}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{job.connectorId}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                              {job.executionMode}
                            </span>
                          </td>
                          <td className="p-3">
                            {job.status === 'SUCCESS' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" /> SUCCÈS
                              </span>
                            )}
                            {job.status === 'PARTIAL' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                <AlertTriangle className="w-3 h-3" /> PARTIEL
                              </span>
                            )}
                            {job.status === 'FAILED' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                <XCircle className="w-3 h-3" /> ÉCHEC
                              </span>
                            )}
                            {job.status === 'DISABLED' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">
                                <Lock className="w-3 h-3" /> BLOQUÉ
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-300 font-mono text-[11px]">
                            {job.startedAt}
                          </td>
                          <td className="p-3">
                            <span className="text-white font-bold">{job.itemsReceived}</span>
                            <span className="text-slate-500 mx-1">/</span>
                            <span className="text-emerald-400 font-bold">{job.itemsAccepted}</span>
                            <span className="text-slate-500 mx-1">/</span>
                            <span className="text-rose-400 font-bold">{job.itemsRejected}</span>
                          </td>
                          <td className="p-3 font-semibold text-amber-400">
                            {job.duplicatesDetected}
                          </td>
                          <td className="p-3 text-slate-400">
                            {job.durationMs ? `${(job.durationMs / 1000).toFixed(2)}s` : 'N/A'}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              id={`btn-view-job-${job.id}`}
                              onClick={() => setSelectedJob(job)}
                              className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Détail
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET 2 : DONNÉES BRUTES (RAW ITEMS)
           ========================================================================= */}
        {activeTab === 'raw' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Affichage de <strong className="text-white">{filteredRawItems.length}</strong> items bruts dans le tampon d'ingestion
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Statut :
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2 py-1 text-xs rounded bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="RECEIVED">Reçus (RECEIVED)</option>
                  <option value="NORMALIZED">Normalisés (NORMALIZED)</option>
                  <option value="DUPLICATE">Doublons (DUPLICATE)</option>
                  <option value="REJECTED">Rejetés (REJECTED)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRawItems.map((raw) => {
                const norm = normalizedItems.find((n) => n.rawItemId === raw.id);
                return (
                  <div
                    key={raw.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">{raw.id}</span>
                          {raw.isDemo ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
                              DEMO
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                              DONNÉES RÉELLES
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              raw.processingStatus === 'NORMALIZED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : raw.processingStatus === 'DUPLICATE'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : raw.processingStatus === 'REJECTED'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {raw.processingStatus}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                            {raw.language}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-200 mt-1.5 line-clamp-2">
                          {raw.title || '<Titre absent>'}
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedRawItem(raw)}
                        className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-750 text-slate-200 transition flex items-center gap-1 shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspecter
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-3 bg-slate-950/40 p-2.5 rounded border border-slate-800/60">
                      {raw.rawContent}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                      <div>Source : <strong className="text-slate-300">{raw.sourceId}</strong></div>
                      <div>Connecteur : <strong className="text-slate-300 font-mono">{raw.connectorId}</strong></div>
                      <div className="truncate">Publié : {raw.publishedAt || 'N/A'}</div>
                      <div className="font-mono text-[10px] text-emerald-400/90 truncate flex items-center gap-1">
                        <Hash className="w-3 h-3 shrink-0" /> {raw.contentHash}
                      </div>
                    </div>

                    {raw.rejectionReason && (
                      <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
                        Motif rejet : {raw.rejectionReason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET 3 : NORMALISATION
           ========================================================================= */}
        {activeTab === 'normalized' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Affichage de <strong className="text-white">{filteredNormalizedItems.length}</strong> éléments normalisés
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Statut Doublon :
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2 py-1 text-xs rounded bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="ALL">Tous les éléments</option>
                  <option value="UNIQUE">Uniques uniquement</option>
                  <option value="DUPLICATES">Doublons / Chevauchements</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredNormalizedItems.map((norm) => (
                <div
                  key={norm.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-300">{norm.id}</span>
                        {norm.isDemo ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
                            DEMO
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                            DONNÉES RÉELLES
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {norm.category}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                          {norm.country}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            norm.duplicateStatus === 'UNIQUE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {norm.duplicateStatus}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Confiance : <strong className="text-white">{Math.round(norm.confidence * 100)}%</strong>
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1.5">{norm.title}</h3>
                    </div>

                    {/* Actions sur l'item normalisé */}
                    <div className="flex items-center gap-2 shrink-0">
                      {norm.duplicateStatus !== 'UNIQUE' && (
                        <button
                          onClick={() => setArbitrateItem(norm)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition flex items-center gap-1.5"
                        >
                          <GitMerge className="w-3.5 h-3.5" /> Arbitrer
                        </button>
                      )}
                      {!norm.generatedEventId ? (
                        <button
                          onClick={() => handleConvertToEvent(norm.id)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" /> Créer Événement
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 text-[11px] font-mono rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                          Événement : {norm.generatedEventId}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                    {norm.summary}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <div>
                      Source : <strong className="text-slate-200">{getSourceDisplay(norm.sourceId)}</strong> • Raw : <span className="font-mono text-slate-300">{norm.rawItemId}</span>
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      Hash : <span className="text-emerald-400">{norm.contentHash}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET 4 : ARBITRAGE DES DOUBLONS
           ========================================================================= */}
        {activeTab === 'duplicates' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3">
              <GitMerge className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-300 uppercase tracking-wider mb-0.5">
                  Arbitrage Humain des Doublons — Règle Doctrinale OSINT AFRICA
                </strong>
                L’algorithme de déduplication opère selon 8 critères formels (URL canonique, ID externe, titre normalisé, date, source, hash, similarité, proximité temporelle). <strong>Aucun élément n’est supprimé automatiquement.</strong> L’analyste conserve le pouvoir décisionnel exclusif de fusion, d’enrichissement ou de disjonction.
              </div>
            </div>

            <div className="space-y-3">
              {duplicateCandidateItems.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
                  Aucun doublon en attente d'arbitrage dans le banc d'essai actuel.
                </div>
              ) : (
                duplicateCandidateItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl bg-slate-900/60 border border-amber-500/20 hover:border-amber-500/40 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400">{item.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.duplicateStatus}
                        </span>
                        <span className="text-xs text-slate-400">
                          Réf. concordance : <strong className="text-slate-200 font-mono">{item.matchedExistingId || 'Similitude sémantique'}</strong>
                        </span>
                      </div>
                      <button
                        onClick={() => setArbitrateItem(item)}
                        className="px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 transition flex items-center gap-1.5 shadow-sm"
                      >
                        <GitMerge className="w-4 h-4" /> Décider de l’Arbitrage
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-300">{item.summary}</p>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <div className="font-semibold text-slate-300">Critères de détection constatés :</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                        <div>• Proximité temporelle : <span className="text-emerald-400">CONSTATÉE</span></div>
                        <div>• Titre normalisé : <span className="text-emerald-400">SIMILITUDE ÉLEVÉE</span></div>
                        <div>• Empreinte hash : <span className="text-amber-400">COLLISION PARTIELLE</span></div>
                        <div>• Source émettrice : <span className="text-slate-300">{item.sourceId}</span></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET 5 : PIPELINE & TRAÇABILITÉ
           ========================================================================= */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-emerald-400" /> Architecture Technique du Pipeline d'Ingestion (12 Étapes)
              </h2>
              <p className="text-xs text-slate-400">
                La chaîne d’ingestion OSINT AFRICA garantit une traçabilité totale sans perte d'information depuis la capture initiale jusqu'à la production du renseignement :
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase">1. Acquisition Locale</div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>Source immatriculée au registre</li>
                    <li>Connecteur d’acquisition normalisé</li>
                    <li>Job de collecte simulé</li>
                    <li>Capture du Raw Item brut</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-blue-400 uppercase">2. Normalisation & Hash</div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>Validation structurelle & MIME</li>
                    <li>Nettoyage balises parasites</li>
                    <li>Hachage déterministe SHA-256</li>
                    <li>Détection doublons (8 critères)</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-purple-400 uppercase">3. Production Renseignement</div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>Classification géo-thématique</li>
                    <li>Validation de cohérence</li>
                    <li>Génération Événement OSINT</li>
                    <li>Chaînage infalsifiable d'audit</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Visualisation de la chaîne complète */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Exemple de Chaîne de Traçabilité Complète Réalisée
              </h3>
              <div className="flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center w-full">
                  <div className="text-[10px] text-slate-400 font-bold">SOURCE</div>
                  <div className="font-semibold text-white mt-1">Dépêches & Vigies Sahel</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">src-sandbox-media-01</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 shrink-0 hidden lg:block" />
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center w-full">
                  <div className="text-[10px] text-slate-400 font-bold">CONNECTEUR</div>
                  <div className="font-semibold text-white mt-1">Flux RSS XML</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">conn-sb-01</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 shrink-0 hidden lg:block" />
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center w-full">
                  <div className="text-[10px] text-slate-400 font-bold">JOB DE COLLECTE</div>
                  <div className="font-semibold text-emerald-400 font-mono mt-1">job-sb-001</div>
                  <div className="text-[10px] text-emerald-500 mt-0.5">Statut : SUCCÈS</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 shrink-0 hidden lg:block" />
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center w-full">
                  <div className="text-[10px] text-slate-400 font-bold">RAW ITEM</div>
                  <div className="font-semibold text-white mt-1">raw-sb-01</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">sha256-sim-84a1e9b2</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 shrink-0 hidden lg:block" />
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center w-full">
                  <div className="text-[10px] text-slate-400 font-bold">NORMALISÉ</div>
                  <div className="font-semibold text-white mt-1">norm-sb-01</div>
                  <div className="text-[10px] text-purple-400 mt-0.5">UNIQUE (100%)</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 shrink-0 hidden lg:block" />
                <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-800/60 text-center w-full">
                  <div className="text-[10px] text-purple-300 font-bold">ÉVÉNEMENT OSINT</div>
                  <div className="font-semibold text-purple-200 font-mono mt-1">evt-sb-001</div>
                  <div className="text-[10px] text-purple-400 mt-0.5">Prêt pour Analyse</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET 6 : JOURNAL D'AUDIT DE COLLECTE
           ========================================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Affichage de <strong className="text-white">{auditLogs.length}</strong> événements d'audit enregistrés
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3">Horodatage (UTC)</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Cible / Source</th>
                      <th className="p-3">Résultat</th>
                      <th className="p-3">Opérateur / Initiateur</th>
                      <th className="p-3">Mode</th>
                      <th className="p-3">Détails d'Exécution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-850/50 transition">
                        <td className="p-3 font-mono text-[11px] text-slate-300">
                          {log.timestamp}
                        </td>
                        <td className="p-3 font-bold text-white">
                          {log.action}
                        </td>
                        <td className="p-3 text-slate-300">
                          {log.sourceName || log.sourceId}
                        </td>
                        <td className="p-3">
                          {log.result === 'SUCCESS' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              SUCCÈS
                            </span>
                          )}
                          {log.result === 'WARNING' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              AVERTISSEMENT
                            </span>
                          )}
                          {log.result === 'FAILURE' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              ÉCHEC
                            </span>
                          )}
                          {log.result === 'BLOCKED_OFFLINE' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                              BLOQUÉ HORS LIGNE
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-300">
                          {log.initiator}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-purple-300">
                            {log.mode}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALES D'INTERACTION */}
      {selectedJob && (
        <CollectionJobDetailModal
          job={selectedJob}
          source={vm.sources.find((s) => s.id === selectedJob.sourceId)}
          rawItems={rawItems}
          normalizedItems={normalizedItems}
          isOpen={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          onSelectRawItem={(raw) => {
            setSelectedJob(null);
            setSelectedRawItem(raw);
          }}
        />
      )}

      {selectedRawItem && (
        <RawItemInspectModal
          item={selectedRawItem}
          normalizedItem={normalizedItems.find((n) => n.rawItemId === selectedRawItem.id)}
          isOpen={Boolean(selectedRawItem)}
          onClose={() => setSelectedRawItem(null)}
          onRejectItem={handleRejectRaw}
          onConvertToEvent={handleConvertToEvent}
        />
      )}

      {arbitrateItem && (
        <ArbitrateDuplicateModal
          item={arbitrateItem}
          existingItem={normalizedItems.find((n) => n.id === arbitrateItem.matchedExistingId)}
          isOpen={Boolean(arbitrateItem)}
          onClose={() => setArbitrateItem(null)}
          onArbitrate={handleArbitrate}
        />
      )}

      <LaunchCollectionModal
        isOpen={isLaunchModalOpen}
        onClose={() => setIsLaunchModalOpen(false)}
        onLaunch={handleLaunchCollection}
        killSwitchActive={killSwitch}
        allSources={vm.sources}
        allConnectors={[]}
      />
    </div>
  );
};
