/**
 * OSINT AFRICA - Centre de Configuration, Gouvernance et Orchestration des Sources (LOT 22)
 * 
 * Strictement HORS LIGNE — Aucune collecte Internet réelle
 * Points d'ancrage doctrinaux :
 * - CRITICITÉ ≠ FIABILITÉ
 * - APPROUVÉE ≠ FIABLE
 * - PRIORITÉ CRITIQUE ≠ INFORMATION VRAIE
 * - PRÊTE À CONNECTER ≠ CONNECTÉE
 * - VALIDATION HUMAINE OBLIGATOIRE
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  FileText,
  Layers,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Calendar,
  AlertCircle,
  Eye,
  Lock,
  GitBranch,
  Server,
  Activity,
  History,
  Check,
  X,
  HelpCircle,
  ExternalLink,
  Ban
} from 'lucide-react';
import { UseOsintViewModelReturn } from '../../viewmodels/useOsintViewModel';
import {
  OsintSourceItem,
  OsintSourceGovernance,
  OsintSourceReview,
  OsintGovernanceAudit,
  GovernanceActionItem,
  SourcePriority,
  SourceCriticality,
  GovernanceWorkflowStatus,
  SOURCE_PRIORITY_LABELS,
  SOURCE_CRITICALITY_LABELS,
  GOVERNANCE_STATUS_LABELS,
  GOVERNANCE_ROLE_DESCRIPTIONS,
  GovernanceRole,
  OsintSourceConnector
} from '../../types';
import { governanceService, GovernanceKPIs } from '../../services/governanceService';
import { realPilotCollectionService } from '../../services/realPilotCollectionService';
import { ALL_CONNECTORS } from '../../data/connectorDemoData';
import { SourceGovernanceDetailModal } from './governance/SourceGovernanceDetailModal';

interface GovernanceCenterScreenProps {
  vm: UseOsintViewModelReturn;
}

export const GovernanceCenterScreen: React.FC<GovernanceCenterScreenProps> = ({ vm }) => {
  const { sources } = vm;

  // Vue thématique active
  const [activeTab, setActiveTab] = useState<'matrice' | 'actions' | 'revues' | 'orchestration' | 'checklist' | 'audit' | 'rbac'>('matrice');

  // Source sélectionnée pour la modale détaillée
  const [selectedSourceForDetail, setSelectedSourceForDetail] = useState<{
    source: OsintSourceItem;
    governance: OsintSourceGovernance;
    connector?: OsintSourceConnector;
  } | null>(null);

  // État local des gouvernances, rechargé à chaque modification
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Filtres avancés pour la matrice
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('ALL');
  const [filterNature, setFilterNature] = useState<'ALL' | 'REAL' | 'DEMO'>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterCriticality, setFilterCriticality] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterRobots, setFilterRobots] = useState<string>('ALL');
  const [filterReviewStatus, setFilterReviewStatus] = useState<'ALL' | 'NEED_REVIEW' | 'READY'>('ALL');

  // Planification de nouvelle revue
  const [newReviewSourceId, setNewReviewSourceId] = useState(sources[0]?.id || '');
  const [newReviewDate, setNewReviewDate] = useState('2026-10-15');
  const [newReviewer, setNewReviewer] = useState('Dr. Diallo (Réviseur Senior)');
  const [newReviewNotes, setNewReviewNotes] = useState('');
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);

  // Rôle de visualisation RBAC
  const [selectedRole, setSelectedRole] = useState<GovernanceRole>('ADMINISTRATOR');

  // Calcul dynamique des KPI
  const kpis: GovernanceKPIs = useMemo(() => {
    return governanceService.calculateKPIs(sources);
  }, [sources, refreshKey]);

  // Actions requises dynamiques
  const requiredActions: GovernanceActionItem[] = useMemo(() => {
    return governanceService.generateRequiredActions(sources);
  }, [sources, refreshKey]);

  // Map des connecteurs indexés par sourceId
  const connectorsMap = useMemo(() => {
    const map = new Map<string, OsintSourceConnector>();
    ALL_CONNECTORS.forEach((c) => map.set(c.sourceId, c));
    return map;
  }, []);

  // Liste des pays uniques pour le filtre
  const availableCountries = useMemo(() => {
    const set = new Set(sources.map((s) => s.countryName).filter(Boolean));
    return Array.from(set).sort();
  }, [sources]);

  // Sources filtrées pour la matrice
  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      const gov = governanceService.getGovernanceBySourceId(s.id);
      if (!gov) return false;

      // Recherche texte
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchCountry = s.countryName?.toLowerCase().includes(q) ?? false;
        const matchType = s.type?.toLowerCase().includes(q) ?? false;
        const matchId = s.id.toLowerCase().includes(q);
        if (!matchName && !matchCountry && !matchType && !matchId) return false;
      }

      // Pays
      if (filterCountry !== 'ALL' && s.countryName !== filterCountry) return false;

      // Réel / Démo
      if (filterNature === 'REAL' && !s.isReal) return false;
      if (filterNature === 'DEMO' && s.isReal) return false;

      // Priorité
      if (filterPriority !== 'ALL' && gov.priority !== filterPriority) return false;

      // Criticité
      if (filterCriticality !== 'ALL' && gov.criticality !== filterCriticality) return false;

      // Statut workflow
      if (filterStatus !== 'ALL' && gov.governanceStatus !== filterStatus) return false;

      // Robots.txt
      if (filterRobots !== 'ALL' && gov.robotsStatus !== filterRobots) return false;

      // Filtres spécifiques
      if (filterReviewStatus === 'NEED_REVIEW') {
        const isNeed = gov.governanceStatus === 'TO_VERIFY' || gov.priority === 'P5' || gov.criticality === 'UNKNOWN';
        if (!isNeed) return false;
      }
      if (filterReviewStatus === 'READY') {
        if (gov.governanceStatus !== 'READY_TO_CONNECT') return false;
      }

      return true;
    });
  }, [sources, searchQuery, filterCountry, filterNature, filterPriority, filterCriticality, filterStatus, filterRobots, filterReviewStatus, refreshKey]);

  const handleOpenDetail = (source: OsintSourceItem) => {
    const gov = governanceService.getGovernanceBySourceId(source.id);
    if (!gov) return;
    const conn = connectorsMap.get(source.id);
    setSelectedSourceForDetail({ source, governance: gov, connector: conn });
  };

  const handleScheduleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewSourceId) return;

    governanceService.scheduleReview({
      sourceId: newReviewSourceId,
      reviewDate: newReviewDate,
      nextReviewDate: `${parseInt(newReviewDate.slice(0, 4), 10) + 1}${newReviewDate.slice(4)}`,
      reviewer: newReviewer,
      status: 'SCHEDULED',
      decision: 'PENDING',
      notes: newReviewNotes.trim() || 'Revue de conformité et de qualification périodique programmée'
    });

    setReviewNotice('Revue planifiée et enregistrée dans le calendrier.');
    setTimeout(() => setReviewNotice(null), 4000);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div id="screen-gouvernance" className="space-y-5 pb-12 animate-fadeIn text-slate-100">
      
      {/* 1. Header Officiel & Avertissement Doctrinal Omniprésent */}
      <div className="bg-gradient-to-br from-[#0c1322] via-[#090d18] to-[#060911] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                LOT 22 — GOUVERNANCE, CONFIGURATION & ORCHESTRATION
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 font-bold">
                100% HORS LIGNE
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-xs font-mono text-slate-400">
                Isolation Réseau Stricte (Aucune Requête Externe)
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-slate-100 uppercase flex items-center gap-2.5">
              <Scale className="w-6 h-6 text-amber-400" />
              <span>Centre de Gouvernance des Sources OSINT</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1 max-w-3xl">
              Dispositif centralisé de qualification déontologique, d'attribution des priorités, de validation humaine formelle, et d'orchestration future des collectes en Afrique.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 border border-slate-700/80 p-3 rounded-xl">
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Poste Opérateur</div>
              <div className="text-xs font-bold text-amber-300 font-mono">DR. DIALLO (RÉVISEUR SENIOR)</div>
            </div>
            <div className="w-px h-8 bg-slate-800 mx-1" />
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Mode Sécurité</div>
              <div className="text-xs font-bold text-emerald-400 font-mono">CONFINEMENT TOTAL</div>
            </div>
          </div>
        </div>

        {/* Bannière Doctrinale Obligatoire */}
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold">
              RÈGLE DOCTRINALE ABSOLUE : « CRITICITÉ ≠ FIABILITÉ » • « APPROUVÉE ≠ FIABLE » • « PRÊTE À CONNECTER ≠ CONNECTÉE »
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Les 112 sources réelles restent non connectées (0% d'émission réseau)
          </span>
        </div>
      </div>

      {/* 2. Tableau de Bord — 14 KPI Dynamiques Calculés */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Sources Totales</div>
          <div className="text-xl font-black text-slate-100 font-mono">{kpis.totalSources}</div>
          <div className="text-[10px] text-slate-500">112 réelles / 18 démo</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-blue-400 uppercase font-mono">Sources Réelles</div>
          <div className="text-xl font-black text-blue-300 font-mono">{kpis.realSources}</div>
          <div className="text-[10px] text-blue-400/80">Identifiées (0 connectée)</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-amber-400 uppercase font-mono">Sources Démo</div>
          <div className="text-xl font-black text-amber-300 font-mono">{kpis.demoSources}</div>
          <div className="text-[10px] text-amber-400/80">Bac à sable pédagogique</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-cyan-400 uppercase font-mono">Configurées</div>
          <div className="text-xl font-black text-cyan-300 font-mono">{kpis.configuredSources}</div>
          <div className="text-[10px] text-slate-500">Spécifications prêtes</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-teal-400 uppercase font-mono">Prêtes à Connecter</div>
          <div className="text-xl font-black text-teal-300 font-mono">{kpis.readySources}</div>
          <div className="text-[10px] text-teal-400/80">Validées sans réseau</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-emerald-400 uppercase font-mono">Approuvées</div>
          <div className="text-xl font-black text-emerald-300 font-mono">{kpis.approvedSources}</div>
          <div className="text-[10px] text-slate-500">Avis motivé humain</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-orange-400 uppercase font-mono">Suspendues</div>
          <div className="text-xl font-black text-orange-300 font-mono">{kpis.suspendedSources}</div>
          <div className="text-[10px] text-orange-400/80">Conformité / Robots</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-rose-400 uppercase font-mono">Désactivées</div>
          <div className="text-xl font-black text-rose-300 font-mono">{kpis.disabledSources}</div>
          <div className="text-[10px] text-slate-500">Caduques / Inactives</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-indigo-400 uppercase font-mono">Connecteurs Config.</div>
          <div className="text-xl font-black text-indigo-300 font-mono">{kpis.configuredConnectors}</div>
          <div className="text-[10px] text-slate-500">Modèles LOT 21</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-purple-400 uppercase font-mono">Connecteurs Simulés</div>
          <div className="text-xl font-black text-purple-300 font-mono">{kpis.simulatedConnectors}</div>
          <div className="text-[10px] text-slate-500">Simulateur local</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30">
          <div className="text-[10px] text-amber-400 uppercase font-mono">À Vérifier</div>
          <div className="text-xl font-black text-amber-300 font-mono">{kpis.requiringVerification}</div>
          <div className="text-[10px] text-amber-400/80">Métadonnées à fixer</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-indigo-500/30">
          <div className="text-[10px] text-indigo-400 uppercase font-mono">À Approuver</div>
          <div className="text-xl font-black text-indigo-300 font-mono">{kpis.requiringValidation}</div>
          <div className="text-[10px] text-slate-500">En attente signature</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/30">
          <div className="text-[10px] text-rose-400 uppercase font-mono">Revues en Retard</div>
          <div className="text-xl font-black text-rose-400 font-mono">{kpis.overdueReviews}</div>
          <div className="text-[10px] text-rose-400/80">Échues &gt; 30j</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Actions Requises</div>
          <div className="text-xl font-black text-amber-300 font-mono">{requiredActions.length}</div>
          <div className="text-[10px] text-slate-500">File priorisée</div>
        </div>
      </div>

      {/* 3. Navigation par Onglets Analytiques */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 rounded-xl p-1 overflow-x-auto gap-1">
        {[
          { id: 'matrice', label: 'Matrice Source × Gouvernance', icon: Scale, count: filteredSources.length },
          { id: 'actions', label: 'File d’Actions Requises', icon: AlertCircle, count: requiredActions.length, highlight: requiredActions.length > 0 },
          { id: 'revues', label: 'Calendrier des Revues', icon: Calendar },
          { id: 'orchestration', label: 'Orchestration Future & Politiques', icon: GitBranch },
          { id: 'checklist', label: 'Contrôle Avant Activation (14)', icon: ShieldCheck },
          { id: 'audit', label: 'Journal d’Audit (Append-Only)', icon: History },
          { id: 'rbac', label: 'RBAC & Déontologie', icon: UserCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2.5 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                  isActive
                    ? 'bg-slate-950 text-amber-400'
                    : tab.highlight ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* VUE 1 : MATRICE SOURCE × GOUVERNANCE */}
      {/* ==================================================================== */}
      {activeTab === 'matrice' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Barre de Filtres Avancés Combinables */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Recherche par nom de source, pays, identifiant (ex: src-real-040)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">Tous les pays ({availableCountries.length})</option>
                  {availableCountries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={filterNature}
                  onChange={(e) => setFilterNature(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">Nature (Toutes)</option>
                  <option value="REAL">Réelles uniquement (112)</option>
                  <option value="DEMO">Démonstration (18)</option>
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">Priorité (Toutes)</option>
                  <option value="P1">P1 — Critique</option>
                  <option value="P2">P2 — Haute</option>
                  <option value="P3">P3 — Normale</option>
                  <option value="P4">P4 — Faible</option>
                  <option value="P5">P5 — À évaluer</option>
                </select>

                <select
                  value={filterCriticality}
                  onChange={(e) => setFilterCriticality(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">Criticité (Toutes)</option>
                  <option value="CRITICAL">Critique</option>
                  <option value="HIGH">Élevée</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="LOW">Faible</option>
                  <option value="UNKNOWN">Inconnue</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">Statut Workflow (Tous)</option>
                  <option value="DRAFT">Brouillon</option>
                  <option value="TO_VERIFY">À vérifier</option>
                  <option value="VERIFIED">Vérifiée</option>
                  <option value="TO_APPROVE">À approuver</option>
                  <option value="APPROVED">Approuvée</option>
                  <option value="READY_TO_CONNECT">Prête à connecter</option>
                  <option value="AUTHORIZED">Autorisée</option>
                  <option value="ACTIVE">Active (Simulée)</option>
                  <option value="SUSPENDED">Suspendue</option>
                  <option value="DISABLED">Désactivée</option>
                </select>

                <select
                  value={filterReviewStatus}
                  onChange={(e) => setFilterReviewStatus(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">Filtres Rapides</option>
                  <option value="NEED_REVIEW">Sources à revoir</option>
                  <option value="READY">Sources prêtes à connecter</option>
                </select>
              </div>
            </div>

            {/* Légende Doctrinale des Symboles */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <span className="font-semibold text-slate-300">Symbolique matricielle :</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="font-bold font-mono">✓</span> Conforme / Validé
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="font-bold font-mono">⚠</span> Réserve / Restriction
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="font-bold font-mono">—</span> Non applicable / Bloqué
              </span>
              <span className="flex items-center gap-1 text-purple-400">
                <span className="font-bold font-mono">?</span> Non évalué (ne signifie pas mauvais)
              </span>
            </div>
          </div>

          {/* Tableau Matrice Source × Gouvernance */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="p-3">Source & Identifiant</th>
                    <th className="p-3">Pays</th>
                    <th className="p-3">Nature</th>
                    <th className="p-3">Priorité</th>
                    <th className="p-3">Criticité</th>
                    <th className="p-3">Fiabilité</th>
                    <th className="p-3">Statut Workflow</th>
                    <th className="p-3 text-center">Robots</th>
                    <th className="p-3 text-center">Licence</th>
                    <th className="p-3 text-center">Validation</th>
                    <th className="p-3 text-center">Connecteur</th>
                    <th className="p-3">Dernière Revue</th>
                    <th className="p-3">Prochaine</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredSources.map((source) => {
                    const gov = governanceService.getGovernanceBySourceId(source.id);
                    if (!gov) return null;
                    const conn = connectorsMap.get(source.id);

                    // Symboles
                    const robotsSymbol = gov.robotsStatus === 'ALLOWED' ? '✓' : (gov.robotsStatus === 'DISALLOWED' ? '⚠' : (gov.robotsStatus === 'CRAWL_DELAY' ? '⚠' : '?'));
                    const licenseSymbol = gov.licensingStatus === 'GOVERNMENT_OPEN_DATA' || gov.licensingStatus === 'OPEN_DATA' ? '✓' : (gov.licensingStatus === 'EDITORIAL_RESTRICTED' ? '⚠' : (gov.licensingStatus === 'UNKNOWN' ? '?' : '—'));
                    const validationSymbol = gov.validationStatus === 'VALIDATED' ? '✓' : (gov.validationStatus === 'IN_PROGRESS' ? '⚠' : (gov.validationStatus === 'REJECTED' ? '—' : '?'));
                    const connectorSymbol = conn?.status === 'READY_TO_CONNECT' || conn?.status === 'ACTIVE' ? '✓' : (conn?.status === 'SOURCE_CONFIGURED' ? '⚠' : (conn?.status === 'SUSPENDED' ? '—' : '?'));

                    return (
                      <tr
                        key={source.id}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => handleOpenDetail(source)}
                      >
                        <td className="p-3">
                          <div className="font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                            {source.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">{source.id}</div>
                        </td>

                        <td className="p-3 font-mono text-slate-300">
                          {source.countryName}
                        </td>

                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            source.isReal 
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {source.isReal ? 'RÉELLE' : 'DÉMO'}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${SOURCE_PRIORITY_LABELS[gov.priority].badgeBg}`}>
                            {gov.priority}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${SOURCE_CRITICALITY_LABELS[gov.criticality].badgeBg}`}>
                            {gov.criticality}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className="font-mono text-[11px] text-slate-300">
                            {source.reliability}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${GOVERNANCE_STATUS_LABELS[gov.governanceStatus].bg}`}>
                            {GOVERNANCE_STATUS_LABELS[gov.governanceStatus].label}
                          </span>
                        </td>

                        {/* Symboles d'état */}
                        <td className="p-3 text-center font-mono font-bold text-xs" title={`Robots: ${gov.robotsStatus}`}>
                          <span className={robotsSymbol === '✓' ? 'text-emerald-400' : (robotsSymbol === '⚠' ? 'text-amber-400' : (robotsSymbol === '?' ? 'text-purple-400' : 'text-slate-500'))}>
                            {robotsSymbol}
                          </span>
                        </td>

                        <td className="p-3 text-center font-mono font-bold text-xs" title={`Licence: ${gov.licensingStatus}`}>
                          <span className={licenseSymbol === '✓' ? 'text-emerald-400' : (licenseSymbol === '⚠' ? 'text-amber-400' : (licenseSymbol === '?' ? 'text-purple-400' : 'text-slate-500'))}>
                            {licenseSymbol}
                          </span>
                        </td>

                        <td className="p-3 text-center font-mono font-bold text-xs" title={`Validation: ${gov.validationStatus}`}>
                          <span className={validationSymbol === '✓' ? 'text-emerald-400' : (validationSymbol === '⚠' ? 'text-amber-400' : (validationSymbol === '?' ? 'text-purple-400' : 'text-slate-500'))}>
                            {validationSymbol}
                          </span>
                        </td>

                        <td className="p-3 text-center font-mono font-bold text-xs" title={`Connecteur: ${conn?.statusLabel || 'Non configuré'}`}>
                          <span className={connectorSymbol === '✓' ? 'text-emerald-400' : (connectorSymbol === '⚠' ? 'text-amber-400' : (connectorSymbol === '?' ? 'text-purple-400' : 'text-slate-500'))}>
                            {connectorSymbol}
                          </span>
                        </td>

                        <td className="p-3 font-mono text-[10px] text-slate-400">
                          {gov.approvalDate?.substring(0, 10) || '—'}
                        </td>

                        <td className="p-3 font-mono text-[10px] text-slate-400">
                          {gov.reviewDate || 'À fixer'}
                        </td>

                        <td className="p-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(source);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1 ml-auto"
                          >
                            <span>Gérer</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span>Affichage de {filteredSources.length} sources sur {sources.length} répertoriées</span>
              <span className="font-mono text-emerald-400">Toutes les 112 sources réelles sont préservées</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VUE 2 : FILE D'ACTIONS REQUISES */}
      {/* ==================================================================== */}
      {activeTab === 'actions' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>File d'Actions Requises & Arbitrages Déontologiques</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Détection algorithmique des anomalies de qualification (licences inconnues, robots.txt manquants, revues échues, checklists incomplètes).
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {requiredActions.length} action(s) prioritaire(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requiredActions.map((act) => {
              const src = sources.find((s) => s.id === act.sourceId);
              return (
                <div
                  key={act.id}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        act.priority === 'CRITIQUE'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : act.priority === 'HAUTE'
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        PRIORITÉ : {act.priority}
                      </span>

                      <span className="text-[10px] font-mono text-slate-500">
                        {act.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-200">
                        {act.sourceName} <span className="font-mono text-slate-500 font-normal">({act.countryName})</span>
                      </h3>
                      <p className="text-xs font-semibold text-amber-300 mt-1">
                        PROBLÈME : {act.problem}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300">
                      <span className="text-slate-400 font-semibold block mb-0.5">Action Recommandée :</span>
                      <span>{act.recommendedAction}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">{act.sourceId}</span>
                    {src && (
                      <button
                        onClick={() => handleOpenDetail(src)}
                        className="px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <span>Traiter l'anomalie</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VUE 3 : CALENDRIER DE REVUES PÉRIODIQUES */}
      {/* ==================================================================== */}
      {activeTab === 'revues' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Formulaire de Planification de Revue */}
            <div className="lg:col-span-1 p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Programmer une Revue Périodique</span>
              </h2>
              <p className="text-xs text-slate-400">
                La doctrine impose une réévaluation annuelle des conditions juridiques et de la conformité des sources.
              </p>

              {reviewNotice && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                  {reviewNotice}
                </div>
              )}

              <form onSubmit={handleScheduleReviewSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Source Cible :</label>
                  <select
                    value={newReviewSourceId}
                    onChange={(e) => setNewReviewSourceId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    {sources.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.countryName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date d'Échéance :</label>
                  <input
                    type="date"
                    value={newReviewDate}
                    onChange={(e) => setNewReviewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Réviseur Désigné :</label>
                  <input
                    type="text"
                    value={newReviewer}
                    onChange={(e) => setNewReviewer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    placeholder="Ex: Dr. Diallo (Réviseur Senior)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Objet de la Revue :</label>
                  <textarea
                    value={newReviewNotes}
                    onChange={(e) => setNewReviewNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    placeholder="Ex: Vérification du Crawl-Delay et respect de la charge serveur."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Enregistrer la Revue au Calendrier
                </button>
              </form>
            </div>

            {/* Registre des Revues */}
            <div className="lg:col-span-2 p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Registre des Revues Périodiques & Audits de Conformité</span>
              </h2>

              <div className="space-y-2.5">
                {governanceService.getAllReviews().map((rev) => {
                  const src = sources.find((s) => s.id === rev.sourceId);
                  return (
                    <div
                      key={rev.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            rev.status === 'OVERDUE'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : rev.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}>
                            {rev.status === 'OVERDUE' ? 'EN RETARD' : rev.status === 'COMPLETED' ? 'TERMINÉE' : 'PROGRAMMÉE'}
                          </span>
                          <span className="font-bold text-slate-200 text-xs">
                            {src?.name || rev.sourceId}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">({src?.countryName})</span>
                        </div>

                        <p className="text-xs text-slate-300">{rev.notes}</p>

                        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
                          <span>Échéance : <strong className="text-amber-400">{rev.reviewDate}</strong></span>
                          <span>Réviseur : <strong className="text-slate-200">{rev.reviewer}</strong></span>
                          {rev.decision !== 'PENDING' && (
                            <span>Décision : <strong className="text-emerald-400">{rev.decision}</strong></span>
                          )}
                        </div>
                      </div>

                      {src && (
                        <button
                          onClick={() => handleOpenDetail(src)}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold self-end sm:self-center transition-colors"
                        >
                          Fiche Source
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VUE 4 : ORCHESTRATION FUTURE & POLITIQUES */}
      {/* ==================================================================== */}
      {activeTab === 'orchestration' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Architecture conceptuelle */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  <span>Architecture Conceptuelle d'Orchestration des Collectes Futures</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualisation du pipeline cible de collecte automatisée (Actuellement désactivé conformément à la doctrine hors ligne).
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                COLLECTE INTERNET : 0% INACTIVE
              </span>
            </div>

            {/* Chaîne de flux en 9 étapes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2 text-center pt-2">
              {[
                { step: '1', title: 'SOURCE', desc: 'Identifiée & Qualifiée', status: '112 Réelles' },
                { step: '2', title: 'PLANIFICATION', desc: 'Fréquence & Rate Limit', status: 'Borné' },
                { step: '3', title: 'CONNECTEUR', desc: 'Découplé & Sécurisé', status: 'LOT 21' },
                { step: '4', title: 'COLLECTE', desc: 'Exécution réseau', status: 'DÉSACTIVÉE', highlight: true },
                { step: '5', title: 'INGESTION', desc: 'Stockage brut SHA256', status: 'Local' },
                { step: '6', title: 'NORMALISATION', desc: 'Typage & Nettoyage', status: 'Opérationnel' },
                { step: '7', title: 'DÉDUPLICATION', desc: '8 Critères d’arbitrage', status: 'Sans suppression' },
                { step: '8', title: 'VALIDATION', desc: 'Signature de l’analyste', status: 'Obligatoire' },
                { step: '9', title: 'ÉVÉNEMENT', desc: 'Intégration au Renseignement', status: 'Traçabilité 12/12' }
              ].map((item, idx) => (
                <div
                  key={item.step}
                  className={`p-3 rounded-xl border flex flex-col justify-between relative ${
                    item.highlight
                      ? 'bg-rose-950/40 border-rose-500/60 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-[10px] font-mono text-slate-500 mb-1">Étape #{item.step}</div>
                  <div className="font-black text-xs uppercase tracking-wider text-slate-100">{item.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{item.desc}</div>
                  <div className={`mt-2 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    item.highlight ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.status}
                  </div>
                </div>
              ))}
            </div>

            {/* Politique de Collecte Future & Politique de Rétention */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <h3 className="font-bold text-amber-400 uppercase tracking-wider text-xs">
                  Politique Standard de Collecte Future (OsintCollectionPolicy)
                </h3>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  <li>• <strong className="text-slate-100">Statut initial :</strong> collectionEnabled = false pour toutes les sources réelles</li>
                  <li>• <strong className="text-slate-100">Rate Limiting :</strong> Maximum 30 requêtes/heure par domaine pour éviter tout déni de service</li>
                  <li>• <strong className="text-slate-100">Plage horaire :</strong> Respect des créneaux éditoriaux ouvrés (06:00-22:00 UTC)</li>
                  <li>• <strong className="text-slate-100">Déduplication :</strong> Hachage SHA256 du contenu et détection textuelle stricte</li>
                  <li>• <strong className="text-slate-100">Contrôle humain :</strong> Revue obligatoire avant toute génération d'événement</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <h3 className="font-bold text-cyan-400 uppercase tracking-wider text-xs">
                  Politique de Conservation & Archivage (OsintRetentionPolicy)
                </h3>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  <li>• <strong className="text-slate-100">Durée standard :</strong> 180 à 365 jours selon la criticité opérationnelle</li>
                  <li>• <strong className="text-slate-100">Justification légale :</strong> Veille documentaire géopolitique et sécurité sahélienne</li>
                  <li>• <strong className="text-slate-100">Purge automatique :</strong> Suppression programmée des médias et pièces jointes volumineuses</li>
                  <li>• <strong className="text-slate-100">Archivage permanent :</strong> Métadonnées, résumés et analyses signées uniquement</li>
                  <li>• <strong className="text-slate-100">Préservation LOT 22 :</strong> Aucune suppression des données existantes dans ce lot</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VUE 5 : CONTRÔLE AVANT ACTIVATION (CHECKLIST DE PRÉACTIVATION) */}
      {/* ==================================================================== */}
      {activeTab === 'checklist' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Contrôle Doctrinal Avant Activation (Grille des 14 Points)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tout connecteur vers une source réelle doit satisfaire les 14 vérifications obligatoires avant toute mise en ligne.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PILOTE LOT 23-B : 1 SOURCE AUTORISÉE (APS)
              </span>
            </div>
          </div>

          {/* Grille des 14 points pour la source pilote APS */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    PILOTE UNIQUE LOT 23-B
                  </span>
                  <span className="text-xs text-slate-400 font-mono">src-real-001 • conn-pilot-aps-001</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  APS — Agence de Presse Sénégalaise (Sénégal)
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Score de conformité</div>
                  <div className="text-lg font-black font-mono text-emerald-400">14 / 14 (100%)</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Liste dynamique des 14 critères */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              {realPilotCollectionService.getChecklist().map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-200 truncate">{item.label}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {item.notes}
                    </p>
                    <div className="text-[10px] text-emerald-400/90 font-mono pt-0.5">
                      Statut : {item.isChecked ? 'Validé (Conforme)' : 'En attente'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cas Pratique 1 : Rappel de Doctrine */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold">
                DOCTRINE D'ÉTANCHÉITÉ OSINT
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-1">
                Isolement Strict des 111 Autres Sources Réelles
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Le passage en pilote d'une source unique (APS) n'active aucune des 111 autres sources du référentiel. Celles-ci demeurent rigoureusement au statut <code>RÉELLE — NON CONNECTÉE</code> sans aucun connecteur actif.
              </p>
            </div>

            {/* Cas Pratique 2 : Source Bloquée par non-conformité */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/40 space-y-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                EXEMPLE DE SOURCE BLOQUÉE
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-1">Gabon Review (src-real-032) — Non autorisée</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Éléments critiques manquants : Directives robots.txt restrictives, CGU interdisant le moissonnage automatisé, absence d'autorisation formelle. Score : <strong>5 / 14</strong>. Statut : <strong>SUSPENSION MAINTENUE</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VUE 6 : JOURNAL D'AUDIT (APPEND-ONLY) */}
      {/* ==================================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Journal d'Audit Global de Gouvernance (Append-Only)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Historique infalsifiable des arbitrages, créations de connecteurs, changements de priorités et blocages hors ligne.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {governanceService.getAllAudits().length} événement(s) consigné(s)
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="p-3">Horodatage (UTC)</th>
                    <th className="p-3">Source Cible</th>
                    <th className="p-3">Action Consignée</th>
                    <th className="p-3">Acteur / Rôle</th>
                    <th className="p-3">Résultat</th>
                    <th className="p-3">Motif & Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {governanceService.getAllAudits().map((a) => {
                    const src = sources.find((s) => s.id === a.sourceId);
                    return (
                      <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 font-mono text-slate-400 whitespace-nowrap">{a.timestamp}</td>
                        <td className="p-3 font-semibold text-slate-200">
                          {src?.name || a.sourceId}
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                            {a.action}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300 font-mono text-[11px]">{a.actor}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            a.result === 'SUCCESS'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : a.result === 'BLOCKED_OFFLINE'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {a.result}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300 text-[11px]">{a.reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VUE 7 : RBAC & CADRE DÉONTOLOGIQUE */}
      {/* ==================================================================== */}
      {activeTab === 'rbac' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Séparation des Responsabilités & Rôles Préparatoires (RBAC)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Principe cardinal de l'OSINT professionnel : « Celui qui configure ≠ Celui qui valide ≠ Celui qui audite ».
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {(Object.keys(GOVERNANCE_ROLE_DESCRIPTIONS) as GovernanceRole[]).map((roleKey) => {
              const roleInfo = GOVERNANCE_ROLE_DESCRIPTIONS[roleKey];
              const isCurrent = selectedRole === roleKey;
              return (
                <div
                  key={roleKey}
                  onClick={() => setSelectedRole(roleKey)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-slate-900 border-amber-400 shadow-lg scale-[1.02]'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-mono text-amber-400 font-bold mb-1">{roleKey}</div>
                    <h3 className="text-xs font-bold text-slate-100">{roleInfo.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">{roleInfo.desc}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Droits :</span>
                    <ul className="text-[10px] text-slate-300 space-y-1">
                      {roleInfo.permissions.map((p, idx) => (
                        <li key={idx}>✓ {p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Synthèse Déontologique */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <h3 className="font-bold text-amber-400 uppercase tracking-wider">
              Chartes d'Analyse et Principes de Sécurité Déontologique
            </h3>
            <p>
              Le système OSINT AFRICA ne remplace en aucun cas l'esprit critique de l'analyste. Il fournit des garde-fous stricts :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <strong className="text-amber-300 block mb-1">1. Pas de passage automatique</strong>
                Une source ne devient jamais « APPROUVÉE » ou « AUTORISÉE » par déduction algorithmique.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <strong className="text-cyan-300 block mb-1">2. Non-assimilation à la vérité</strong>
                Une source hautement prioritaire (P1) ou critique n'est pas réputée infaillible. Le croisement des preuves reste la règle.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <strong className="text-emerald-300 block mb-1">3. Confinement hors ligne</strong>
                Tant que le dispositif est en mode bac à sable, aucune émission HTTP/HTTPS n'est techniquement possible.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale de Détail & Validation de Source */}
      {selectedSourceForDetail && (
        <SourceGovernanceDetailModal
          source={selectedSourceForDetail.source}
          governance={selectedSourceForDetail.governance}
          connector={selectedSourceForDetail.connector}
          onClose={() => setSelectedSourceForDetail(null)}
          onUpdated={() => setRefreshKey((prev) => prev + 1)}
        />
      )}

    </div>
  );
};
