/**
 * OSINT AFRICA - Centre de Gestion des Connecteurs & Architecture d'Intégration (LOT 21)
 * Couche d'intégration professionnelle entre les sources OSINT et le pipeline de renseignement
 * 
 * STRICTEMENT HORS LIGNE — CONNECTEURS RÉELS NON ACTIVÉS
 * Toutes les sources réelles (112) restent « Réelle / non connectée » (isReal: true, isConnected: false)
 */

import React, { useState, useMemo } from 'react';
import {
  Server,
  Database,
  Radio,
  Search,
  Filter,
  Layers,
  FileCode,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Power,
  RefreshCw,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  FileText,
  Scale,
  GitBranch,
  Hash,
  Activity,
  AlertCircle,
  Eye,
  Check,
  X,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { UseOsintViewModelReturn } from '../../viewmodels/useOsintViewModel';
import {
  OsintSourceConnector,
  ConnectorStatus,
  ConnectorType,
  RobotsPolicy,
  LicensingStatus,
  OsintRawItem,
  OsintNormalizedItem,
  IngestionDuplicateStatus
} from '../../types';
import {
  ALL_CONNECTORS,
  DEMO_COLLECTION_JOBS,
  DEMO_RAW_ITEMS,
  DEMO_NORMALIZED_ITEMS,
  DEMO_INGESTION_ERRORS,
  DEMO_CONNECTOR_AUDITS,
  COMPLETE_TRACEABILITY_SCENARIO,
  INCOMPLETE_TRACEABILITY_SCENARIO,
  PIPELINE_STAGES_METRICS
} from '../../data/connectorDemoData';
import { ConnectorDetailModal } from '../modals/ConnectorDetailModal';
import { detectPotentialDuplicate, testConnectorOffline } from '../../services/sourceIngestionService';

type SubViewTab =
  | 'connectors'
  | 'pipeline'
  | 'raw_items'
  | 'deduplication'
  | 'traceability'
  | 'audit'
  | 'compliance';

interface ConnectorCenterScreenProps {
  vm: UseOsintViewModelReturn;
}

export const ConnectorCenterScreen: React.FC<ConnectorCenterScreenProps> = ({ vm }) => {
  const [activeTab, setActiveTab] = useState<SubViewTab>('connectors');
  const [selectedConnector, setSelectedConnector] = useState<OsintSourceConnector | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filtres locaux pour la liste des connecteurs
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSourceNature, setFilterSourceNature] = useState<'ALL' | 'REAL' | 'DEMO'>('ALL');
  const [filterConnectionStatus, setFilterConnectionStatus] = useState<'ALL' | 'CONNECTED' | 'DISCONNECTED'>('ALL');
  const [filterRobots, setFilterRobots] = useState<string>('ALL');

  // État local des connecteurs pour bascule activer/désactiver en mémoire
  const [connectorsList, setConnectorsList] = useState<OsintSourceConnector[]>(ALL_CONNECTORS);
  const [arbitrationSuccessMessage, setArbitrationSuccessMessage] = useState<string | null>(null);

  // Total des sources dans l'application
  const totalSourcesCount = vm.sources.length; // 130
  const realSourcesCount = vm.sources.filter((s) => s.isReal).length; // 112
  const demoSourcesCount = vm.sources.filter((s) => s.isDemo).length; // 18
  const disconnectedSourcesCount = vm.sources.filter((s) => !s.isConnected).length; // 112

  // Compteurs dynamiques des connecteurs
  const activeSimulatedCount = connectorsList.filter((c) => c.status === 'ACTIVE').length;
  const configuredCount = connectorsList.filter((c) => c.status === 'SOURCE_CONFIGURED' || c.status === 'READY_TO_CONNECT').length;
  const disabledCount = connectorsList.filter((c) => !c.enabled || c.status === 'DISABLED' || c.status === 'SUSPENDED').length;
  const errorCount = connectorsList.filter((c) => c.status === 'ERROR').length;

  // Filtrage des connecteurs
  const filteredConnectors = useMemo(() => {
    return connectorsList.filter((conn) => {
      const source = vm.sources.find((s) => s.id === conn.sourceId);
      const sourceName = source ? source.name.toLowerCase() : '';
      const sourceCountry = source ? source.country.toLowerCase() : '';
      const query = searchQuery.toLowerCase().trim();

      if (query && !conn.id.toLowerCase().includes(query) && !sourceName.includes(query) && !sourceCountry.includes(query) && !(conn.endpoint || '').toLowerCase().includes(query)) {
        return false;
      }

      if (filterType !== 'ALL' && conn.connectorType !== filterType) {
        return false;
      }

      if (filterStatus !== 'ALL' && conn.status !== filterStatus) {
        return false;
      }

      if (filterSourceNature === 'REAL' && conn.isDemo) {
        return false;
      }
      if (filterSourceNature === 'DEMO' && !conn.isDemo) {
        return false;
      }

      if (filterConnectionStatus === 'CONNECTED' && conn.status !== 'CONNECTED') {
        return false;
      }
      if (filterConnectionStatus === 'DISCONNECTED' && conn.status === 'CONNECTED') {
        return false;
      }

      if (filterRobots !== 'ALL' && conn.robotsPolicy !== filterRobots) {
        return false;
      }

      return true;
    });
  }, [connectorsList, vm.sources, searchQuery, filterType, filterStatus, filterSourceNature, filterConnectionStatus, filterRobots]);

  const handleOpenDetail = (conn: OsintSourceConnector) => {
    setSelectedConnector(conn);
    setIsDetailModalOpen(true);
  };

  const handleToggleEnabled = (connectorId: string) => {
    setConnectorsList((prev) =>
      prev.map((c) => {
        if (c.id === connectorId) {
          const nextEnabled = !c.enabled;
          return {
            ...c,
            enabled: nextEnabled,
            status: nextEnabled ? ('ACTIVE' as ConnectorStatus) : ('DISABLED' as ConnectorStatus),
            statusLabel: nextEnabled ? 'Active (Simulation locale)' : 'Désactivé par l’analyste',
          };
        }
        return c;
      })
    );
  };

  const handleArbitrate = (decision: string, title: string) => {
    setArbitrationSuccessMessage(`Arbitrage consigné : "${decision}" sur l'information "${title}". Aucune information n'a été supprimée.`);
    setTimeout(() => setArbitrationSuccessMessage(null), 5000);
  };

  return (
    <div id="screen-connector-center" className="space-y-6 pb-12 animate-fadeIn text-slate-100">
      {/* 1. En-tête Principal & Avertissement Doctrinal Strict */}
      <div className="bg-gradient-to-br from-[#121826] via-[#0e1420] to-[#0a0d16] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-wider text-amber-400 font-bold uppercase">
                LOT 21 — ARCHITECTURE D’INTÉGRATION DES SOURCES OSINT
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                100% HORS LIGNE
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-wide uppercase text-slate-100">
              Centre de Gestion des <span className="text-amber-400">Connecteurs & Ingestion</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Couche d’intégration technique découplée préparant la réception ultérieure de données ouvertes,
              maintenant une séparation stricte entre les sources réelles passives et les modèles de simulation.
            </p>
          </div>

          {/* Badge officiel de statut hors ligne */}
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 flex items-center gap-3 shrink-0 shadow-lg">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-300">
                MODE HORS LIGNE STRICT
              </div>
              <div className="text-[11px] text-amber-200/80 font-medium">
                Aucune collecte Internet réelle active
              </div>
            </div>
          </div>
        </div>

        {/* Bannière d'avertissement de sécurité analytique */}
        <div className="mt-5 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-200 uppercase tracking-wider block">
              Principe Doctrinal d'Intégrité OSINT :
            </span>
            <p className="text-slate-400 leading-relaxed">
              Les 112 sources réelles restent étiquetées <strong className="text-slate-200">« Réelle / non connectée »</strong> avec fiabilité <strong className="text-slate-200">« Non évaluée »</strong>.
              Aucun endpoint ou token inventé n'est actif. Les statuts "ACTIVE" sont strictement réservés à des simulateurs locaux.
            </p>
          </div>
        </div>

        {/* 2. KPI Cards dynamiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mt-5">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Sources Totales</div>
            <div className="text-lg font-black text-slate-100 mt-0.5">{totalSourcesCount}</div>
            <div className="text-[10px] text-slate-500">112 réelles / 18 démo</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] text-emerald-400 uppercase font-mono">Sources Réelles</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{realSourcesCount}</div>
            <div className="text-[10px] text-emerald-500/80">Identifiées passives</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Non Connectées</div>
            <div className="text-lg font-black text-slate-300 mt-0.5">{disconnectedSourcesCount}</div>
            <div className="text-[10px] text-slate-500">Aucun flux distant</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] text-cyan-400 uppercase font-mono">Connecteurs Réels</div>
            <div className="text-lg font-black text-cyan-400 mt-0.5">0</div>
            <div className="text-[10px] text-cyan-500/80">0% connexion Internet</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] text-amber-400 uppercase font-mono">Simulés Actifs</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">{activeSimulatedCount}</div>
            <div className="text-[10px] text-amber-500/80">Sandbox local</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] text-blue-400 uppercase font-mono">Configurés</div>
            <div className="text-lg font-black text-blue-400 mt-0.5">{configuredCount}</div>
            <div className="text-[10px] text-blue-500/80">En attente liaison</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Désactivés</div>
            <div className="text-lg font-black text-slate-400 mt-0.5">{disabledCount}</div>
            <div className="text-[10px] text-slate-500">Manuel ou suspendu</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] text-rose-400 uppercase font-mono">Erreurs Simulées</div>
            <div className="text-lg font-black text-rose-400 mt-0.5">{errorCount}</div>
            <div className="text-[10px] text-rose-500/80">Timeouts gérés</div>
          </div>
        </div>
      </div>

      {/* 3. Navigation par Sous-Onglets Thématiques */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 text-xs select-none">
        <button
          onClick={() => setActiveTab('connectors')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'connectors'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Connecteurs & Sources ({connectorsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pipeline'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Pipeline d'Ingestion (9 Étapes)</span>
        </button>

        <button
          onClick={() => setActiveTab('raw_items')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'raw_items'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Données Brutes & SHA256 ({DEMO_RAW_ITEMS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('deduplication')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'deduplication'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Déduplication & Arbitrage</span>
        </button>

        <button
          onClick={() => setActiveTab('traceability')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'traceability'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Traçabilité (12 Échelons)</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Journal d'Audit & Incidents</span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'compliance'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Conformité & Robots.txt</span>
        </button>
      </div>

      {/* Message de succès d'arbitrage */}
      {arbitrationSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{arbitrationSuccessMessage}</span>
          </div>
          <button onClick={() => setArbitrationSuccessMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          VUE 1 : CONNECTEURS & SOURCES (Tableau complet avec filtres)
      ========================================================================= */}
      {activeTab === 'connectors' && (
        <div className="space-y-4">
          {/* Barre de Recherche et Filtres multi-critères */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par source, pays, connecteur ou endpoint..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Reset Filtres */}
              {(searchQuery || filterType !== 'ALL' || filterStatus !== 'ALL' || filterSourceNature !== 'ALL' || filterRobots !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('ALL');
                    setFilterStatus('ALL');
                    setFilterSourceNature('ALL');
                    setFilterConnectionStatus('ALL');
                    setFilterRobots('ALL');
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Rangée de sélecteurs de filtre */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {/* Filtre Type Connecteur */}
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Type Connecteur</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs"
                >
                  <option value="ALL">Tous les types</option>
                  <option value="MANUAL">MANUAL (Passif)</option>
                  <option value="RSS">RSS</option>
                  <option value="API">API</option>
                  <option value="WEB_FEED">WEB FEED</option>
                  <option value="FUTURE_SATELLITE">SATELLITE</option>
                  <option value="FUTURE_WEB">WEB MOISSONNAGE</option>
                </select>
              </div>

              {/* Filtre Statut */}
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Statut Connecteur</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="SOURCE_IDENTIFIED">SOURCE IDENTIFIÉE</option>
                  <option value="SOURCE_CONFIGURED">CONFIGURÉE</option>
                  <option value="READY_TO_CONNECT">PRÊTE À ÊTRE CONNECTÉE</option>
                  <option value="ACTIVE">ACTIVE (SIMULATION)</option>
                  <option value="ERROR">EN ERREUR</option>
                  <option value="SUSPENDED">SUSPENDUE</option>
                  <option value="DISABLED">DÉSACTIVÉE</option>
                </select>
              </div>

              {/* Filtre Réelle vs Démo */}
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Nature Source</label>
                <select
                  value={filterSourceNature}
                  onChange={(e) => setFilterSourceNature(e.target.value as any)}
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs"
                >
                  <option value="ALL">Toutes natures</option>
                  <option value="REAL">112 Sources Réelles</option>
                  <option value="DEMO">18 Sources Démo</option>
                </select>
              </div>

              {/* Filtre Connecté vs Non Connecté */}
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Liaison Réseau</label>
                <select
                  value={filterConnectionStatus}
                  onChange={(e) => setFilterConnectionStatus(e.target.value as any)}
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs"
                >
                  <option value="ALL">Toutes les liaisons</option>
                  <option value="DISCONNECTED">Non connectée (100% des réelles)</option>
                  <option value="CONNECTED">Connectée (0 réel)</option>
                </select>
              </div>

              {/* Filtre Robots.txt */}
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Robots.txt</label>
                <select
                  value={filterRobots}
                  onChange={(e) => setFilterRobots(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs"
                >
                  <option value="ALL">Toutes politiques</option>
                  <option value="ALLOWED">Autorisé (Allowed)</option>
                  <option value="RESTRICTED">Restreint (Crawl-delay)</option>
                  <option value="DISALLOWED">Exclusion stricte</option>
                  <option value="UNSPECIFIED">Non audité</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tableau des Connecteurs */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">ID / Source</th>
                    <th className="p-3.5">Pays & Région</th>
                    <th className="p-3.5">Protocole & Type</th>
                    <th className="p-3.5">Statut Opérationnel</th>
                    <th className="p-3.5">Conformité Robots</th>
                    <th className="p-3.5">Dernière Tentative</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredConnectors.slice(0, 40).map((conn) => {
                    const source = vm.sources.find((s) => s.id === conn.sourceId);
                    return (
                      <tr
                        key={conn.id}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => handleOpenDetail(conn)}
                      >
                        {/* Source */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-slate-800 text-amber-400 font-mono text-[10px]">
                              {conn.id}
                            </div>
                            <div>
                              <div className="font-bold text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-1">
                                {source?.name || conn.sourceId}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {conn.endpoint ? conn.endpoint.slice(0, 40) + '...' : 'Déclarative / passive'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Pays & Région */}
                        <td className="p-3.5 text-slate-300">
                          <div>{source?.country || 'Panafricain'}</div>
                          <div className="text-[10px] text-slate-500">{source?.region || 'Afrique'}</div>
                        </td>

                        {/* Type & Format */}
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono font-semibold text-slate-300">
                            {conn.connectorType}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {conn.format} • {conn.method}
                          </span>
                        </td>

                        {/* Statut */}
                        <td className="p-3.5">
                          {conn.status === 'ACTIVE' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              ACTIVE (SIMULATION)
                            </span>
                          )}
                          {conn.status === 'SOURCE_IDENTIFIED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800/80 border border-slate-700 text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              IDENTIFIÉE (NON CONNECTÉE)
                            </span>
                          )}
                          {conn.status === 'SOURCE_CONFIGURED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-950/80 border border-blue-800 text-blue-300">
                              CONFIGURÉE
                            </span>
                          )}
                          {conn.status === 'READY_TO_CONNECT' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                              PRÊTE À CONNECTER
                            </span>
                          )}
                          {conn.status === 'ERROR' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950/80 border border-rose-800 text-rose-300">
                              <AlertTriangle className="w-3 h-3" /> EN ERREUR
                            </span>
                          )}
                          {conn.status === 'SUSPENDED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 border border-amber-800 text-amber-300">
                              SUSPENDUE
                            </span>
                          )}
                          {conn.status === 'DISABLED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-500">
                              DÉSACTIVÉE
                            </span>
                          )}
                        </td>

                        {/* Robots.txt */}
                        <td className="p-3.5">
                          {conn.robotsPolicy === 'ALLOWED' && (
                            <span className="text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Autorisé
                            </span>
                          )}
                          {conn.robotsPolicy === 'RESTRICTED' && (
                            <span className="text-amber-400 font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Restreint
                            </span>
                          )}
                          {conn.robotsPolicy === 'DISALLOWED' && (
                            <span className="text-rose-400 font-medium flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5" /> Exclusion
                            </span>
                          )}
                          {conn.robotsPolicy === 'UNSPECIFIED' && (
                            <span className="text-slate-500">Non audité</span>
                          )}
                        </td>

                        {/* Horodatage */}
                        <td className="p-3.5 font-mono text-[11px] text-slate-400">
                          {conn.lastAttempt || 'Aucune (Hors ligne)'}
                        </td>

                        {/* Bouton inspecter */}
                        <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenDetail(conn)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                          >
                            Inspecter
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredConnectors.length > 40 && (
              <div className="p-3 bg-slate-950/90 text-center text-xs text-slate-500 border-t border-slate-800">
                Affichage de 40 connecteurs sur {filteredConnectors.length} correspondants aux filtres.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VUE 2 : PIPELINE D'INGESTION (Étape | Entrées | Sorties | Statut)
      ========================================================================= */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-1 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-amber-400" />
              <span>Pipeline d'Ingestion & Normalisation en 9 Étapes</span>
            </h2>
            <p className="text-xs text-slate-400">
              Flux continu d'intégration reliant la source brute aux rapports de renseignement validés,
              garantissant l'absence de rupture de traçabilité et le contrôle de complétude.
            </p>
          </div>

          <div className="space-y-2.5">
            {PIPELINE_STAGES_METRICS.map((stage, idx) => (
              <div
                key={stage.step}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs">
                    0{stage.step}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                      <span>{stage.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">
                        {stage.statusLabel}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                      {stage.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center font-mono text-xs">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Entrées</span>
                    <span className="text-slate-200 font-bold">{stage.inputsCount}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Sorties</span>
                    <span className="text-amber-400 font-bold">{stage.outputsCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VUE 3 : DONNÉES BRUTES (RAW ITEMS) & HASH SHA256
      ========================================================================= */}
      {activeTab === 'raw_items' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-1 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Registre des Données Brutes (Raw Items)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Chaque élément collecté reçoit une empreinte cryptographique SHA256 déterministe
              et conserve ses en-têtes bruts pour audit indépendant avant normalisation.
            </p>
          </div>

          <div className="space-y-3">
            {DEMO_RAW_ITEMS.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber-400 font-bold">{item.id}</span>
                    <span className="text-slate-500 text-xs">•</span>
                    <span className="text-xs text-slate-300 font-semibold">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.processingStatus === 'NORMALIZED' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
                        NORMALISÉ
                      </span>
                    )}
                    {item.processingStatus === 'DUPLICATE' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 font-bold">
                        DOUBLON IDENTIFIÉ
                      </span>
                    )}
                    {item.processingStatus === 'REJECTED' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-bold">
                        REJETÉ DU PIPELINE
                      </span>
                    )}
                    {item.processingStatus === 'PROCESSED' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                        TRAITÉ & INDEXÉ
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300">
                  <div className="text-[10px] text-slate-500 mb-1 flex items-center justify-between">
                    <span>Charge utile brute (Raw text payload) :</span>
                    <span className="text-cyan-400 font-bold">Hash: {item.contentHash}</span>
                  </div>
                  <p className="font-sans text-xs text-slate-300">{item.rawContent}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono pt-1">
                  <span>Source : {item.sourceId} ({item.connectorId})</span>
                  <span>URL canonique : {item.originalUrl}</span>
                  <span>Collecté le : {item.collectedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VUE 4 : DÉDUPLICATION & ARBITRAGE (8 Critères)
      ========================================================================= */}
      {activeTab === 'deduplication' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Déduplication & Arbitrage de l'Analyste (8 Critères)</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              RÈGLE STRICTE : Le système n'efface jamais automatiquement une information.
              L'évaluation croisée utilise 8 critères précis pour soumettre les cas suspects à l'arbitrage humain.
            </p>
          </div>

          {/* Présentation des 8 critères */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-mono">Critère 1</span>
              <span className="font-bold text-slate-200">1. Canonical URL</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-mono">Critère 2</span>
              <span className="font-bold text-slate-200">2. External ID</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-mono">Critère 3</span>
              <span className="font-bold text-slate-200">3. Normalized Title</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-mono">Critère 4</span>
              <span className="font-bold text-slate-200">4. Publication Date</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-mono">Critère 5</span>
              <span className="font-bold text-slate-200">5. Source ID</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-mono">Critère 6</span>
              <span className="font-bold text-slate-200">6. Content Hash SHA</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-mono">Critère 7</span>
              <span className="font-bold text-slate-200">7. Similar Content</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-mono">Critère 8</span>
              <span className="font-bold text-slate-200">8. Temporal Proximity</span>
            </div>
          </div>

          {/* Cas d'arbitrage concret simulé */}
          <div className="p-5 rounded-2xl bg-[#111622] border border-amber-500/40 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                  ARBITRAGE ANALYSTE REQUIS
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                  Cas #DUP-2026-001 : Recoupement Dépêche UA vs Reprise Presse Sahélienne
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">Score de similarité : 85%</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Entrée A */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-emerald-400 font-bold">Document Principal #norm-sim-001</span>
                  <span>UA CPS (Dépêche primaire)</span>
                </div>
                <div className="font-bold text-slate-200">
                  Union Africaine : Bilan sécuritaire et maintien des corridors logistiques de la FMM
                </div>
                <p className="text-slate-400 text-[11px]">
                  Le Conseil de Paix et de Sécurité de l’UA a tenu sa 1224e réunion consacrée à la FMM dans le bassin du lac Tchad.
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1">
                  Hash: sha256-sim-a7f4b821 • URL: demo-sources.osint-africa.org/au-psc/1224
                </div>
              </div>

              {/* Entrée B */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-amber-400 font-bold">Document Suspect #norm-sim-002</span>
                  <span>Réseau Investigation (Reprise)</span>
                </div>
                <div className="font-bold text-slate-200">
                  Reprise presse : Évaluation du CPS sur le bassin du lac Tchad
                </div>
                <p className="text-slate-400 text-[11px]">
                  Dépêche secondaire reprenant in extenso les éléments du communiqué du CPS de l’Union Africaine...
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1">
                  Hash: sha256-sim-a7f4b821 • URL: demo-sources.osint-africa.org/investigation/lake-chad
                </div>
              </div>
            </div>

            {/* Boutons d'arbitrage */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleArbitrate('DOUBLON CONFIRMÉ (FUSION)', 'Reprise presse')}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all"
              >
                Confirmer comme doublon (Lier sans effacer)
              </button>
              <button
                onClick={() => handleArbitrate('MAINTIEN DISTINCT', 'Reprise presse')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
              >
                Garder comme information distincte
              </button>
              <button
                onClick={() => handleArbitrate('SIGNALER CHEVAUCHEMENT PARTIEL', 'Reprise presse')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
              >
                Chevauchement partiel (Veille)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VUE 5 : TRAÇABILITÉ EN 12 ÉCHELONS (Complet vs Incomplet)
      ========================================================================= */}
      {activeTab === 'traceability' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-1 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Chaîne de Traçabilité Intégrale (12 Échelons d'Ingestion à la Décision)</span>
            </h2>
            <p className="text-xs text-slate-400">
              SOURCE ↓ CONNECTEUR ↓ RAW ITEM ↓ NORMALISATION ↓ ÉVÉNEMENT ↓ PREUVE ↓ ANALYSE ↓ HYPOTHÈSE ↓ CORRÉLATION ↓ FUSION ↓ RAPPORT ↓ CONCLUSION.
              Si un maillon intermédiaire est manquant, le système affiche formellement « TRAÇABILITÉ INCOMPLÈTE ».
            </p>
          </div>

          {/* Scénario 1 : Traçabilité Complète */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Scénario A : Traçabilité Complète — Décision Stratégique FMM
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-800">
                12 / 12 MAILLONS VALIDÉS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {COMPLETE_TRACEABILITY_SCENARIO.map((step) => (
                <div key={step.stageNumber} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>0{step.stageNumber}. {step.stageName}</span>
                    <span className="text-emerald-400 font-bold">✓ VALIDÉ</span>
                  </div>
                  <div className="font-bold text-slate-200 line-clamp-1">{step.label}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{step.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scénario 2 : Traçabilité Incomplète */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-rose-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Scénario B : Traçabilité Incomplète (Rupture au Stade Normalisation)
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 font-mono text-[10px] font-bold border border-rose-800">
                TRAÇABILITÉ INCOMPLÈTE (9 MAILLONS MANQUANTS)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300">
              Avertissement : Une rupture de traçabilité est constatée entre le Raw Item (#raw-sim-003) et l'événement.
              Interdiction de produire un rapport ou une conclusion sur cette base sans corroboration ascendante.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {INCOMPLETE_TRACEABILITY_SCENARIO.map((step) => (
                <div
                  key={step.stageNumber}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    step.status === 'MISSING'
                      ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">0{step.stageNumber}. {step.stageName}</span>
                    {step.status === 'MISSING' ? (
                      <span className="text-rose-400 font-bold">✗ MANQUANT</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">✓ PRÉSENT</span>
                    )}
                  </div>
                  <div className="font-bold line-clamp-1">{step.label}</div>
                  <p className="text-[11px] opacity-80 line-clamp-2">{step.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VUE 6 : JOURNAL D'AUDIT & INCIDENTS (OsintConnectorAudit)
      ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Journal d'Audit d'Ingestion & Incidents Techniques</span>
            </h2>
            <p className="text-xs text-slate-400">
              Consigne infalsifiable de toutes les requêtes de test bloquées hors ligne,
              modifications de politiques de connecteurs et erreurs d'ingestion.
            </p>
          </div>

          <div className="space-y-2.5">
            {DEMO_CONNECTOR_AUDITS.map((audit) => (
              <div
                key={audit.id}
                className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400 font-bold">{audit.action}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{audit.actor}</span>
                  </div>
                  <p className="text-slate-200 font-medium">{audit.message}</p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center font-mono text-[11px] text-slate-500 shrink-0">
                  <span>{audit.timestamp}</span>
                  {audit.result === 'BLOCKED_OFFLINE' && (
                    <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 font-bold">
                      BLOQUÉ HORS LIGNE
                    </span>
                  )}
                  {audit.result === 'SUCCESS' && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
                      SUCCÈS
                    </span>
                  )}
                  {audit.result === 'WARNING' && (
                    <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-bold">
                      AVERTISSEMENT
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VUE 7 : CONFORMITÉ OSINT & ROBOTS.TXT
      ========================================================================= */}
      {activeTab === 'compliance' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-1 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Matrice de Conformité OSINT & Éthique de Collecte</span>
            </h2>
            <p className="text-xs text-slate-400">
              Audit préalable des droits d'accès, directives robots.txt, conditions d'utilisation et conservation.
              Toute source dont les termes interdisent la collecte automatisée est immédiatement bloquée ou suspendue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Accès Libre & Open Data</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sources institutionnelles, bulletins sous licence Creative Commons, flux gouvernementaux ouverts
                et données satellitaires publiques (Copernicus, Sentinel-2). Collecte automatisée légitime sous respect de rate limit.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Accès Restreint & Crawl-Delay</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Portails de presse régionale et agences locales imposant un espacement temporel strict entre requêtes
                (crawl-delay de 60s à 120s) pour préserver la bande passante locale.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Exclusion Formelle (Disallow)</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Médias payants ou sites institutionnels avec clause expresse de refus de moissonnage.
                Connecteurs automatiquement placés en statut <strong>SUSPENDED</strong> par le système.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'inspection approfondie du connecteur */}
      <ConnectorDetailModal
        connector={selectedConnector}
        source={vm.sources.find((s) => s.id === selectedConnector?.sourceId)}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedConnector(null);
        }}
        onToggleEnabled={handleToggleEnabled}
      />
    </div>
  );
};
