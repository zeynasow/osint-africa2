import React, { useState, useEffect } from 'react';
import {
  Bell,
  ShieldCheck,
  AlertTriangle,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  FileText,
  Download,
  Eye,
  RefreshCw,
  Hash,
  Activity,
  UserCheck,
  Copy,
  ArrowUpRight,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';
import {
  OsintAlert,
  OsintAlertGroup,
  OsintAlertContradiction,
  OsintAlertAction,
  OsintAlertAudit,
  OsintAlertPriority,
  OsintAlertStatus,
  OsintAlertCategory,
  OsintAlertConfidence,
  OsintAlertAssessment,
} from '../../types';
import { alertService, AlertFilterOptions } from '../../services/alertService';
import { AlertDetailModal } from '../modals/AlertDetailModal';
import { AlertAssessmentModal } from '../modals/AlertAssessmentModal';

interface Props {
  onNavigateToWatch?: () => void;
}

export const AlertCenterScreen: React.FC<Props> = ({ onNavigateToWatch }) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'all' | 'groups' | 'contradictions' | 'audit'>('queue');
  const [demoFilter, setDemoFilter] = useState<'ALL' | 'REAL' | 'DEMO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<OsintAlertPriority | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<OsintAlertStatus | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<OsintAlertCategory | 'ALL'>('ALL');
  const [selectedConfidence, setSelectedConfidence] = useState<OsintAlertConfidence | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'score_desc' | 'date_desc' | 'priority'>('score_desc');

  // Modals state
  const [selectedAlertForDetail, setSelectedAlertForDetail] = useState<OsintAlert | null>(null);
  const [selectedAlertForAssessment, setSelectedAlertForAssessment] = useState<OsintAlert | null>(null);

  // Trigger state update
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = alertService.subscribe(() => {
      setRefreshIndex((prev) => prev + 1);
    });
    return () => unsubscribe();
  }, []);

  const kpis = alertService.getKPIs();
  const activeKpi = demoFilter === 'REAL' ? kpis.real : demoFilter === 'DEMO' ? kpis.demo : kpis.total;

  // Filter options
  const filterOptions: AlertFilterOptions = {
    search: searchQuery,
    priority: selectedPriority,
    status: selectedStatus,
    category: selectedCategory,
    confidence: selectedConfidence,
    isDemo: demoFilter === 'REAL' ? false : demoFilter === 'DEMO' ? true : 'ALL',
    sortBy,
  };

  const allAlerts = alertService.getFilteredAlerts(filterOptions);
  const queueAlerts = alertService.getAnalystQueueAlerts().filter((a) => {
    if (demoFilter === 'REAL') return !a.isDemo;
    if (demoFilter === 'DEMO') return a.isDemo;
    return true;
  });

  const groups = alertService.getGroups().filter((g) => {
    if (demoFilter === 'REAL') return !g.isDemo;
    if (demoFilter === 'DEMO') return g.isDemo;
    return true;
  });

  const contradictions = alertService.getContradictions().filter((c) => {
    if (demoFilter === 'REAL') return !c.isDemo;
    if (demoFilter === 'DEMO') return c.isDemo;
    return true;
  });

  const actions = alertService.getActions();
  const audits = alertService.getAudits();

  const handleExportJson = () => {
    const jsonStr = alertService.exportAlertsAsJson(demoFilter !== 'REAL');
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `osint-africa-alerts-lot25-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveAssessment = (alertId: string, assessment: OsintAlertAssessment) => {
    alertService.assessAlert(alertId, assessment);
    // Refresh modal if opened
    if (selectedAlertForDetail?.id === alertId) {
      setSelectedAlertForDetail(alertService.getAlertById(alertId) || null);
    }
  };

  const handleTriage = (alertId: string) => {
    alertService.triageAlert(alertId, 'Analyste OSINT');
    if (selectedAlertForDetail?.id === alertId) {
      setSelectedAlertForDetail(alertService.getAlertById(alertId) || null);
    }
  };

  const handleStartReview = (alertId: string) => {
    alertService.startReview(alertId, 'Analyste OSINT');
    if (selectedAlertForDetail?.id === alertId) {
      setSelectedAlertForDetail(alertService.getAlertById(alertId) || null);
    }
  };

  const handleResolve = (alertId: string) => {
    alertService.resolveAlert(alertId, 'Analyste OSINT', 'Clôture opérationnelle');
    if (selectedAlertForDetail?.id === alertId) {
      setSelectedAlertForDetail(alertService.getAlertById(alertId) || null);
    }
  };

  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority) {
      case 'P1_CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'P2_HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'P3_MEDIUM':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'P4_LOW':
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                <Bell className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100">
                CENTRE DE QUALIFICATION & GESTION DES ALERTES
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
                LOT 25
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              File d'attente de priorisation explicable, détection des convergences multi-sources, divergence factuelle et arbitrage méthodologique humain.
            </p>
          </div>

          {/* Controls: Real/Demo Selector & Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-1 flex items-center">
              <button
                onClick={() => setDemoFilter('ALL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  demoFilter === 'ALL'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tout ({kpis.total.total})
              </button>
              <button
                onClick={() => setDemoFilter('REAL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                  demoFilter === 'REAL'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Réel ({kpis.real.total})</span>
              </button>
              <button
                onClick={() => setDemoFilter('DEMO')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                  demoFilter === 'DEMO'
                    ? 'bg-amber-600 text-slate-100 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Sandbox ({kpis.demo.total})</span>
              </button>
            </div>

            <button
              onClick={handleExportJson}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Exporter le jeu de données d'alertes en JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Doctrinal 4 Mandates Box */}
      <div className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <ShieldCheck className="w-4 h-4" />
          <span>MANDATS DOCTRINAUX OSINT AFRICA</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] text-slate-300">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-amber-400 font-bold block mb-0.5">1. Détection ≠ Confirmation</span>
            Un signal détecté n'est jamais un fait acquis sans arbitrage formel.
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-amber-400 font-bold block mb-0.5">2. Priorité ≠ Fiabilité</span>
            Le score (0-100) mesure l'urgence de revue analyste, non la véracité.
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-amber-400 font-bold block mb-0.5">3. Convergence ≠ Indépendance</span>
            Deux reprises d'une même dépêche ne constituent pas deux sources indépendantes.
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-amber-400 font-bold block mb-0.5">4. Automatisation ≠ Décision</span>
            L'analyste conserve l'entière autorité et responsabilité d'arbitrage.
          </div>
        </div>
      </div>

      {/* KPI Metrics Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-[#0e1422] border border-amber-500/30 rounded-xl p-3.5 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-amber-400 block uppercase tracking-wider">
            À Qualifier
          </span>
          <div className="text-2xl font-black text-amber-300 font-mono">
            {activeKpi.toQualifyCount}
          </div>
          <span className="text-[10px] text-slate-400 block">File d'attente analyste</span>
        </div>

        <div className="bg-[#0e1422] border border-red-500/30 rounded-xl p-3.5 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-red-400 block uppercase tracking-wider">
            P1 Critique
          </span>
          <div className="text-2xl font-black text-red-400 font-mono">
            {activeKpi.p1Count}
          </div>
          <span className="text-[10px] text-slate-400 block">Score $\ge$ 80 / 100</span>
        </div>

        <div className="bg-[#0e1422] border border-amber-500/20 rounded-xl p-3.5 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-amber-300 block uppercase tracking-wider">
            P2 Haute
          </span>
          <div className="text-2xl font-black text-amber-300 font-mono">
            {activeKpi.p2Count}
          </div>
          <span className="text-[10px] text-slate-400 block">Score 65 à 79</span>
        </div>

        <div className="bg-[#0e1422] border border-purple-500/30 rounded-xl p-3.5 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-purple-400 block uppercase tracking-wider">
            Contradictions
          </span>
          <div className="text-2xl font-black text-purple-300 font-mono">
            {activeKpi.contradictionCount}
          </div>
          <span className="text-[10px] text-slate-400 block">Divergences factuelles</span>
        </div>

        <div className="bg-[#0e1422] border border-slate-700/60 rounded-xl p-3.5 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
            Doublons
          </span>
          <div className="text-2xl font-black text-slate-300 font-mono">
            {activeKpi.duplicateCount}
          </div>
          <span className="text-[10px] text-slate-400 block">Dédupliqués</span>
        </div>

        <div className="bg-[#0e1422] border border-emerald-500/30 rounded-xl p-3.5 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-400 block uppercase tracking-wider">
            Confirmées
          </span>
          <div className="text-2xl font-black text-emerald-300 font-mono">
            {activeKpi.confirmedCount}
          </div>
          <span className="text-[10px] text-slate-400 block">Validées par humain</span>
        </div>

        <div className="bg-[#0e1422] border border-rose-500/30 rounded-xl p-3.5 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-rose-400 block uppercase tracking-wider">
            Infirmées
          </span>
          <div className="text-2xl font-black text-rose-300 font-mono">
            {activeKpi.dismissedCount}
          </div>
          <span className="text-[10px] text-slate-400 block">Écartées avec motif</span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'queue'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>File d'Attente Analyste ({queueAlerts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'all'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Toutes les Alertes ({allAlerts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'groups'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Groupes de Convergence ({groups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contradictions')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'contradictions'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Contradictions ({contradictions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit & Actions ({actions.length})</span>
        </button>
      </div>

      {/* Filters Toolbar for List Views */}
      {(activeTab === 'queue' || activeTab === 'all') && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre, résumé, source, pays, hash SHA-256..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400">Trier par :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="score_desc">Score de revue (décroissant)</option>
                <option value="date_desc">Date de détection (plus récent)</option>
                <option value="priority">Priorité (P1 à P5)</option>
              </select>
            </div>
          </div>

          {/* Quick Filters Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 flex items-center gap-1 font-semibold">
              <Filter className="w-3.5 h-3.5" />
              Filtres :
            </span>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Priorité : Toutes</option>
              <option value="P1_CRITICAL">P1 - Critique (score &gt;= 80)</option>
              <option value="P2_HIGH">P2 - Haute (score 65-79)</option>
              <option value="P3_MEDIUM">P3 - Moyenne (score 45-64)</option>
              <option value="P4_LOW">P4 - Basse (score 25-44)</option>
              <option value="P5_INFO">P5 - Info (&lt; 25)</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Statut : Tous</option>
              <option value="NEW">NEW (Nouveau signal)</option>
              <option value="TRIAGED">TRIAGED (En cours de triage)</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW (Sous revue)</option>
              <option value="CONFIRMED">CONFIRMED (Validé humain)</option>
              <option value="DISMISSED">DISMISSED (Écarté / infirmé)</option>
              <option value="DUPLICATE">DUPLICATE (Doublon)</option>
              <option value="CONTRADICTED">CONTRADICTED (Contradiction)</option>
              <option value="ESCALATED">ESCALATED (Escaladé)</option>
              <option value="RESOLVED">RESOLVED (Clôturé)</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Catégorie : Toutes</option>
              <option value="SECURITY">Sécurité / Défense</option>
              <option value="POLITICS">Politique</option>
              <option value="DIPLOMACY">Diplomatie</option>
              <option value="ECONOMY">Économie</option>
              <option value="HEALTH">Santé</option>
              <option value="DISASTER">Catastrophe / Sinistre</option>
              <option value="TRANSPORT">Transport</option>
              <option value="MARITIME">Maritime</option>
              <option value="AVIATION">Aviation</option>
              <option value="ENERGY">Énergie</option>
              <option value="INFRASTRUCTURE">Infrastructure</option>
              <option value="JUSTICE">Justice</option>
              <option value="GOVERNANCE">Gouvernance</option>
              <option value="SOCIAL">Social</option>
              <option value="MEDIA">Médias</option>
              <option value="OTHER">Autre</option>
            </select>

            {/* Reset Filters */}
            {(selectedPriority !== 'ALL' || selectedStatus !== 'ALL' || selectedCategory !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedPriority('ALL');
                  setSelectedStatus('ALL');
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
                className="text-amber-400 hover:text-amber-300 text-[11px] underline ml-auto"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: ANALYST QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-3">
          {queueAlerts.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">File d'attente à jour</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Tous les signaux prioritaires ont été arbitrés par les analystes. Les nouveaux items collectés lors des prochaines exécutions de veille apparaîtront ici automatiquement.
              </p>
            </div>
          ) : (
            queueAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-[#0f1422] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition-all shadow-md space-y-3"
              >
                {/* Top badges row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-xs font-bold font-mono rounded-lg border ${getPriorityBadgeClass(alert.priority)}`}>
                      {alert.priority} • Score: {alert.priorityScore}/100
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                      {alert.category}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg border ${alert.isDemo ? 'bg-amber-950/60 text-amber-300 border-amber-600/40' : 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'}`}>
                      {alert.isDemo ? '🧪 Sandbox' : '🟢 Réel (APS)'}
                    </span>
                    {alert.contradictionLevel && alert.contradictionLevel !== 'NONE' && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Contradiction
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {new Date(alert.detectedAt || alert.createdAt).toLocaleString('fr-FR')}
                  </span>
                </div>

                {/* Title & Excerpt */}
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-100 hover:text-amber-400 cursor-pointer transition-colors"
                    onClick={() => setSelectedAlertForDetail(alert)}
                  >
                    {alert.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {alert.summary}
                  </p>
                </div>

                {/* Explicability summary pill */}
                {alert.reasons && alert.reasons.length > 0 && (
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2 text-xs text-slate-300">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">
                      <strong>Facteurs clés :</strong> {alert.reasons.join(' • ')}
                    </span>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>Source : <strong className="text-slate-300">{alert.sourceName || alert.sourceId}</strong></span>
                    {alert.country && <span>Pays : <strong className="text-slate-300">{alert.country}</strong></span>}
                    {alert.contentHash && (
                      <span className="hidden sm:inline font-mono text-[11px] text-slate-500">
                        SHA-256: {alert.contentHash.substring(0, 12)}...
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAlertForDetail(alert)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      Détails & Score
                    </button>
                    <button
                      onClick={() => setSelectedAlertForAssessment(alert)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-950/40 flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Qualifier / Arbitrer</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: ALL ALERTS */}
      {activeTab === 'all' && (
        <div className="space-y-3">
          {allAlerts.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400">
              Aucune alerte correspondant aux critères de recherche sélectionnés.
            </div>
          ) : (
            allAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-[#0f1422] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-xs font-bold font-mono rounded-lg border ${getPriorityBadgeClass(alert.priority)}`}>
                      {alert.priority} • Score: {alert.priorityScore}/100
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                      {alert.status}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg border ${alert.isDemo ? 'bg-amber-950/60 text-amber-300 border-amber-600/40' : 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'}`}>
                      {alert.isDemo ? '🧪 Sandbox' : '🟢 Réel (APS)'}
                    </span>
                    {alert.isHumanValidated && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Validé analyste
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {new Date(alert.detectedAt || alert.createdAt).toLocaleString('fr-FR')}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3
                    className="text-sm sm:text-base font-bold text-slate-100 hover:text-amber-400 cursor-pointer transition-colors"
                    onClick={() => setSelectedAlertForDetail(alert)}
                  >
                    {alert.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {alert.summary}
                  </p>
                </div>

                {alert.assessment && (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Arbitrage : <strong className="text-emerald-400">{alert.assessment.decision}</strong></span>
                      <span>Analyste : <strong className="text-slate-200">{alert.assessment.assessedBy}</strong></span>
                    </div>
                    {alert.assessment.analystNote && (
                      <p className="text-slate-400 text-[11px] italic">"{alert.assessment.analystNote}"</p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>Source : <strong className="text-slate-300">{alert.sourceName || alert.sourceId}</strong></span>
                    {alert.country && <span>Pays : <strong className="text-slate-300">{alert.country}</strong></span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAlertForDetail(alert)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      Détails complets
                    </button>
                    <button
                      onClick={() => setSelectedAlertForAssessment(alert)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
                    >
                      Qualifier
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: CONVERGENCE GROUPS */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
            <strong>Moteur de Convergence & Corrélation Multi-Sources :</strong> Les alertes sémantiquement, géographiquement et temporellement proches sont automatiquement regroupées. L'indépendance des sources est mesurée afin d'éviter les biais de répétition de dépêches syndiquées.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((grp) => (
              <div
                key={grp.id}
                className="bg-[#0f1422] border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-md flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Convergence : {grp.convergenceScore}/100
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${grp.independenceLevel === 'HIGH' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : grp.independenceLevel === 'MEDIUM' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                      Indépendance : {grp.independenceLevel} ({grp.independenceScore}/100)
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100">{grp.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{grp.description}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Alertes rattachées : <strong className="text-slate-200">{grp.alertIds.length}</strong></span>
                    <span>Sources distinctes : <strong className="text-slate-200">{grp.sourceIds.length}</strong></span>
                    <span className="font-mono text-[11px] text-slate-500">{new Date(grp.updatedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CONTRADICTIONS */}
      {activeTab === 'contradictions' && (
        <div className="space-y-4">
          <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-4 text-xs text-purple-200 leading-relaxed">
            <strong>Gestion des Divergences & Contradictions :</strong> Une contradiction ne décrémente pas la priorité de traitement, elle l'augmente. Elle signale une divergence de statut, de chiffres ou de localisation nécessitant un examen approfondi.
          </div>

          <div className="space-y-3">
            {contradictions.map((ctrd) => (
              <div
                key={ctrd.id}
                className="bg-[#0f1422] border border-purple-500/30 rounded-2xl p-5 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-purple-200">{ctrd.field}</h3>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded ${ctrd.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/30 text-purple-200'}`}>
                    {ctrd.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold block text-[11px]">Donnée Source A</span>
                    <p className="text-slate-200 leading-relaxed">{ctrd.valueA}</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold block text-[11px]">Donnée Source B</span>
                    <p className="text-slate-200 leading-relaxed">{ctrd.valueB}</p>
                  </div>
                </div>

                {ctrd.analystAssessment && (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <strong>Note d'arbitrage :</strong> {ctrd.analystAssessment}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300">
            <strong>Traçabilité Immuable des Actions & Qualifications :</strong> Chaque création de signal, changement de statut, notation, arbitrage ou infirmation est horodaté et conservé.
          </div>

          <div className="space-y-2">
            {actions.map((act) => (
              <div
                key={act.id}
                className="bg-[#0f1422] border border-slate-800 rounded-xl p-3.5 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">{act.action}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300 font-semibold">{act.actor}</span>
                    <span className="text-slate-500">•</span>
                    <span className="font-mono text-slate-400">Alerte: {act.alertId}</span>
                  </div>
                  {act.note && <p className="text-slate-300 text-[11px]">{act.note}</p>}
                </div>
                <span className="font-mono text-[10px] text-slate-500 shrink-0">
                  {new Date(act.timestamp).toLocaleString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AlertDetailModal
        alert={selectedAlertForDetail}
        isOpen={!!selectedAlertForDetail}
        onClose={() => setSelectedAlertForDetail(null)}
        onOpenAssessment={(alert) => {
          setSelectedAlertForDetail(null);
          setSelectedAlertForAssessment(alert);
        }}
        onTriage={handleTriage}
        onStartReview={handleStartReview}
        onResolve={handleResolve}
        actions={actions}
        audits={audits}
        group={groups.find((g) => g.id === selectedAlertForDetail?.groupId)}
      />

      <AlertAssessmentModal
        alert={selectedAlertForAssessment}
        isOpen={!!selectedAlertForAssessment}
        onClose={() => setSelectedAlertForAssessment(null)}
        onSaveAssessment={handleSaveAssessment}
      />
    </div>
  );
};
