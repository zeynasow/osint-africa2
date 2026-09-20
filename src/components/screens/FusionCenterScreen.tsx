/**
 * OSINT AFRICA - CENTRE DE FUSION DU RENSEIGNEMENT OSINT
 * LOT 18 : FusionCenterScreen.tsx
 * 
 * "Vue intégrée de la situation OSINT"
 * Couche centrale de synthèse et de mise en relation des sources, événements,
 * acteurs, pays, cartographie, veille temporelle, corrélations, signaux faibles,
 * analyses, dossiers et alertes.
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Layers,
  Search,
  Filter,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MapPin,
  Calendar,
  Users2,
  Radio,
  Network,
  Activity,
  Compass,
  FileText,
  ChevronRight,
  Shield,
  SlidersHorizontal,
  ArrowUpDown,
  SplitSquareVertical,
  Maximize2,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Scale,
  Crosshair,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import {
  OsintFusionCase,
  FusionCaseStatus,
  FusionPriority,
  FusionSituationState,
  OsintEvent,
  OsintSourceItem,
  OsintActor,
  ScreenId,
} from '../../types';
import { UseOsintViewModelReturn } from '../../viewmodels/useOsintViewModel';
import { DEMO_FUSION_CASES, FUSION_DISCLAIMER, FUSION_CHAIN_STEPS } from '../../data/fusionData';
import { DEMO_CORRELATIONS, DEMO_WEAK_SIGNALS } from '../../data/correlationData';
import { DEMO_EVIDENCE, DEMO_HYPOTHESES } from '../../data/analysisData';
import {
  calculateFusionKPIs,
  generateFusionMatrix,
  buildFusionNetworkGraph,
  compareFusionCases,
  validateTraceabilityChain,
} from '../../services/fusionEngine';
import { FusionDetailModal } from '../modals/FusionDetailModal';

interface FusionCenterScreenProps {
  vm: UseOsintViewModelReturn;
}

type MainTab =
  | 'dashboard'
  | 'synthese'
  | 'matrice'
  | 'reseau'
  | 'chronocarte'
  | 'multisources'
  | 'comparateur';

export const FusionCenterScreen: React.FC<FusionCenterScreenProps> = ({ vm }) => {
  // Navigation & view states
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [selectedCase, setSelectedCase] = useState<OsintFusionCase | null>(DEMO_FUSION_CASES[0]);
  const [detailModalCase, setDetailModalCase] = useState<OsintFusionCase | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterState, setFilterState] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'confidence'>('date');

  // Comparator selection
  const [comparatorCaseAId, setComparatorCaseAId] = useState<string>(DEMO_FUSION_CASES[0]?.id || '');
  const [comparatorCaseBId, setComparatorCaseBId] = useState<string>(DEMO_FUSION_CASES[1]?.id || '');

  // Canvas graph state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedGraphNode, setSelectedGraphNode] = useState<string | null>(null);
  const [graphZoom, setGraphZoom] = useState<number>(1);

  // Dynamic KPIs
  const kpis = useMemo(() => {
    return calculateFusionKPIs(
      DEMO_FUSION_CASES,
      vm.events,
      vm.sources,
      vm.actors,
      DEMO_CORRELATIONS,
      DEMO_WEAK_SIGNALS
    );
  }, [vm.events, vm.sources, vm.actors]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return DEMO_FUSION_CASES.filter(c => {
      if (filterCountry !== 'ALL' && !c.countryCodes.includes(filterCountry)) {
        return false;
      }
      if (filterPriority !== 'ALL' && c.priority !== filterPriority) {
        return false;
      }
      if (filterStatus !== 'ALL' && c.status !== filterStatus) {
        return false;
      }
      if (filterState !== 'ALL' && c.situationState !== filterState) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchDesc = c.description.toLowerCase().includes(q);
        const matchFacts = c.keyFacts.some(f => f.toLowerCase().includes(q));
        const matchCountries = c.countryCodes.some(cc => cc.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchFacts && !matchCountries) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'priority') {
        const prioWeight: Record<string, number> = { CRITIQUE: 4, HAUTE: 3, MOYENNE: 2, BASSE: 1 };
        return (prioWeight[b.priority] || 0) - (prioWeight[a.priority] || 0);
      }
      if (sortBy === 'confidence') {
        const confWeight: Record<string, number> = { ÉLEVÉ: 3, MOYEN: 2, FAIBLE: 1, 'NON ÉVALUÉ': 0 };
        return (confWeight[b.confidence] || 0) - (confWeight[a.confidence] || 0);
      }
      return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
    });
  }, [filterCountry, filterPriority, filterStatus, filterState, searchQuery, sortBy]);

  // Matrix generation
  const fusionMatrix = useMemo(() => {
    return generateFusionMatrix(
      DEMO_FUSION_CASES,
      vm.countries,
      vm.events,
      vm.sources,
      vm.actors,
      DEMO_CORRELATIONS,
      DEMO_WEAK_SIGNALS
    );
  }, [vm.countries, vm.events, vm.sources, vm.actors]);

  // Comparator calculation
  const comparisonResult = useMemo(() => {
    const caseA = DEMO_FUSION_CASES.find(c => c.id === comparatorCaseAId);
    const caseB = DEMO_FUSION_CASES.find(c => c.id === comparatorCaseBId);
    return compareFusionCases(caseA, caseB);
  }, [comparatorCaseAId, comparatorCaseBId]);

  // Graph generation for the currently selected case
  const activeGraphCase = selectedCase || DEMO_FUSION_CASES[0];
  const networkGraph = useMemo(() => {
    if (!activeGraphCase) return { nodes: [], links: [] };
    return buildFusionNetworkGraph(
      activeGraphCase,
      vm.events,
      vm.sources,
      vm.actors,
      DEMO_CORRELATIONS,
      DEMO_WEAK_SIGNALS
    );
  }, [activeGraphCase, vm.events, vm.sources, vm.actors]);

  // Canvas drawing for interactive relation graph
  useEffect(() => {
    if (activeTab !== 'reseau') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const nodes = networkGraph.nodes;
    if (nodes.length === 0) return;

    // Node positioning in orbit around central case node
    const nodeCoords: Record<string, { x: number; y: number }> = {};
    nodeCoords[nodes[0].id] = { x: centerX, y: centerY };

    const outerNodes = nodes.slice(1);
    const angleStep = (2 * Math.PI) / (outerNodes.length || 1);
    const radius = 180 * graphZoom;

    outerNodes.forEach((n, idx) => {
      const angle = idx * angleStep;
      nodeCoords[n.id] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    });

    // Draw links
    networkGraph.links.forEach(l => {
      const from = nodeCoords[l.source];
      const to = nodeCoords[l.target];
      if (from && to) {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        // Arrow midpoint marker
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(midX, midY, 2.5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw nodes
    nodes.forEach(n => {
      const coord = nodeCoords[n.id];
      if (!coord) return;

      const isSelected = selectedGraphNode === n.id;
      const isCase = n.type === 'case';

      // Colors by type
      let fillCol = '#0284c7'; // event
      let strokeCol = '#38bdf8';

      if (n.type === 'case') {
        fillCol = '#0e7490';
        strokeCol = '#22d3ee';
      } else if (n.type === 'country') {
        fillCol = '#1e293b';
        strokeCol = '#94a3b8';
      } else if (n.type === 'source') {
        fillCol = '#065f46';
        strokeCol = '#34d399';
      } else if (n.type === 'actor') {
        fillCol = '#854d0e';
        strokeCol = '#facc15';
      } else if (n.type === 'correlation') {
        fillCol = '#78350f';
        strokeCol = '#fb923c';
      } else if (n.type === 'signal') {
        fillCol = '#581c87';
        strokeCol = '#c084fc';
      }

      ctx.fillStyle = fillCol;
      ctx.strokeStyle = isSelected ? '#ffffff' : strokeCol;
      ctx.lineWidth = isSelected ? 3 : 1.5;

      const nodeRadius = (isCase ? 26 : 16) * graphZoom;

      ctx.beginPath();
      ctx.arc(coord.x, coord.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Node label
      ctx.fillStyle = '#f8fafc';
      ctx.font = isCase ? 'bold 12px sans-serif' : '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(n.label, coord.x, coord.y + nodeRadius + 14);

      if (n.sublabel) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px sans-serif';
        ctx.fillText(n.sublabel, coord.x, coord.y + nodeRadius + 26);
      }
    });
  }, [activeTab, networkGraph, selectedGraphNode, graphZoom]);

  return (
    <div id="screen-fusion-center" className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Top Header */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                  Centre de Fusion du Renseignement
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-700/60 text-[10px] font-mono text-cyan-300 font-bold">
                  LOT 18
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-300 font-bold">
                  DÉMONSTRATION
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Vue intégrée de la situation OSINT • Convergence multi-sources & Faisceau d’indices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
              <span className="px-2 text-slate-400 font-mono text-[11px]">Chaîne cognitive :</span>
              <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded font-semibold text-[10px]">
                FAITS → CONCORDANCES → ANALYSE
              </span>
            </div>
          </div>
        </div>

        {/* Epistemological Banner */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Avertissement méthodologique :</strong> {FUSION_DISCLAIMER}
            </span>
          </div>
          <span className="hidden lg:inline text-[10px] font-mono text-slate-500">
            HORS-LIGNE STRICT • 0 SCRAPER • 0 API
          </span>
        </div>

        {/* Dynamic KPIs bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-3">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Situations</span>
            <span className="text-base font-bold font-mono text-cyan-300">{kpis.openCasesCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Événements</span>
            <span className="text-base font-bold font-mono text-slate-200">{kpis.associatedEventsCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Sources</span>
            <span className="text-base font-bold font-mono text-slate-200">{kpis.associatedSourcesCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Acteurs</span>
            <span className="text-base font-bold font-mono text-slate-200">{kpis.associatedActorsCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Corrélations</span>
            <span className="text-base font-bold font-mono text-amber-300">{kpis.associatedCorrelationsCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Signaux faibles</span>
            <span className="text-base font-bold font-mono text-purple-300">{kpis.associatedWeakSignalsCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Contradictions</span>
            <span className="text-base font-bold font-mono text-rose-300">{kpis.contradictionsCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Non confirmées</span>
            <span className="text-base font-bold font-mono text-amber-400">{kpis.unconfirmedInfoCount}</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 border-t border-slate-800/80 mt-3 no-scrollbar">
          {[
            { id: 'dashboard', label: 'Tableau Opérationnel', icon: Activity },
            { id: 'synthese', label: 'Situation Générale', icon: FileText },
            { id: 'matrice', label: 'Matrice de Fusion', icon: SlidersHorizontal },
            { id: 'reseau', label: 'Réseau Relationnel', icon: Network },
            { id: 'chronocarte', label: 'Carte & Chronologie', icon: MapPin },
            { id: 'multisources', label: 'Sources & Contradictions', icon: Scale },
            { id: 'comparateur', label: 'Comparateur (A vs B)', icon: SplitSquareVertical },
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-fusion-${tab.id}`}
                onClick={() => setActiveTab(tab.id as MainTab)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-200'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: TABLEAU OPÉRATIONNEL & GESTION DES DOSSIERS       */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Rechercher une situation, pays, mot-clé, acteur..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-slate-100 placeholder-slate-500 text-xs focus:outline-none w-full"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={filterCountry}
                  onChange={e => setFilterCountry(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
                >
                  <option value="ALL">Tous les pays</option>
                  <option value="ML">Mali (ML)</option>
                  <option value="CD">RDC (CD)</option>
                  <option value="NG">Nigéria (NG)</option>
                  <option value="TD">Tchad (TD)</option>
                  <option value="SO">Somalie (SO)</option>
                </select>

                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
                >
                  <option value="ALL">Toutes priorités</option>
                  <option value="CRITIQUE">Priorité Critique</option>
                  <option value="HAUTE">Priorité Haute</option>
                  <option value="MOYENNE">Priorité Moyenne</option>
                </select>

                <select
                  value={filterState}
                  onChange={e => setFilterState(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
                >
                  <option value="ALL">Tous les états</option>
                  <option value="STABLE">STABLE</option>
                  <option value="EN ÉVOLUTION">EN ÉVOLUTION</option>
                  <option value="À SURVEILLER">À SURVEILLER</option>
                  <option value="INCERTAINE">INCERTAINE</option>
                  <option value="DONNÉES INSUFFISANTES">DONNÉES INSUFFISANTES</option>
                </select>

                <button
                  onClick={() => {
                    setFilterCountry('ALL');
                    setFilterPriority('ALL');
                    setFilterState('ALL');
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </div>

            {/* Operational Situations Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Situation</th>
                      <th className="py-3 px-3">Pays</th>
                      <th className="py-3 px-3 text-center">Événements</th>
                      <th className="py-3 px-3 text-center">Sources</th>
                      <th className="py-3 px-3 text-center">Acteurs</th>
                      <th className="py-3 px-3 text-center">Corrélations</th>
                      <th className="py-3 px-3 text-center">Signaux</th>
                      <th className="py-3 px-3">Confiance</th>
                      <th className="py-3 px-3">Statut</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredCases.map(c => {
                      const isSelected = selectedCase?.id === c.id;
                      return (
                        <tr
                          key={c.id}
                          className={`transition-colors cursor-pointer ${
                            isSelected ? 'bg-cyan-950/20' : 'hover:bg-slate-850/50'
                          }`}
                          onClick={() => setSelectedCase(c)}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-cyan-400 font-bold">{c.id}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  c.priority === 'CRITIQUE'
                                    ? 'bg-red-950 text-red-300 border border-red-800'
                                    : c.priority === 'HAUTE'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-blue-950 text-blue-300 border border-blue-800'
                                }`}
                              >
                                {c.priority}
                              </span>
                            </div>
                            <div className="font-bold text-slate-200 mt-1 line-clamp-1">{c.title}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{c.description}</div>
                          </td>

                          <td className="py-3 px-3 font-mono">
                            <div className="flex gap-1 flex-wrap">
                              {c.countryCodes.map(cc => (
                                <span key={cc} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                                  {cc}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center font-mono text-slate-300">{c.eventIds.length}</td>
                          <td className="py-3 px-3 text-center font-mono text-slate-300">{c.sourceIds.length}</td>
                          <td className="py-3 px-3 text-center font-mono text-slate-300">{c.actorIds.length}</td>
                          <td className="py-3 px-3 text-center font-mono text-amber-400 font-bold">{c.correlationIds.length}</td>
                          <td className="py-3 px-3 text-center font-mono text-purple-400 font-bold">{c.weakSignalIds.length}</td>

                          <td className="py-3 px-3 font-mono">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] ${
                                c.confidence === 'ÉLEVÉ'
                                  ? 'bg-emerald-950/80 text-emerald-300'
                                  : c.confidence === 'MOYEN'
                                  ? 'bg-amber-950/80 text-amber-300'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {c.confidence}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                              {c.situationState}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              id={`btn-open-detail-${c.id}`}
                              onClick={e => {
                                e.stopPropagation();
                                setDetailModalCase(c);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Inspecter
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: VUE SYNTHÉTIQUE ("SITUATION GÉNÉRALE")              */}
        {/* ========================================================= */}
        {activeTab === 'synthese' && selectedCase && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="font-mono text-xs text-cyan-400 font-bold">{selectedCase.id}</span>
                  <h2 className="text-lg font-bold text-white mt-0.5">{selectedCase.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-950 border border-cyan-800 text-cyan-300">
                    État : {selectedCase.situationState}
                  </span>
                  <button
                    onClick={() => setDetailModalCase(selectedCase)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Fiche Complète (18 sections)
                  </button>
                </div>
              </div>

              {/* Résumé factuel */}
              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Résumé Factuel</h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {selectedCase.description}
                </p>
              </div>

              {/* Grid with main observations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Principaux événements */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-cyan-400 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" />
                    Principaux événements ({selectedCase.eventIds.length})
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {vm.events
                      .filter(e => selectedCase.eventIds.includes(e.id))
                      .map(e => (
                        <li key={e.id} className="p-2 rounded bg-slate-900 border border-slate-800/80">
                          <span className="font-bold text-slate-200 block">{e.title}</span>
                          <span className="text-[11px] text-slate-400">{e.summary}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Principaux acteurs mentionnés */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400 flex items-center gap-2">
                    <Users2 className="w-3.5 h-3.5" />
                    Acteurs mentionnés ({selectedCase.actorIds.length})
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {vm.actors
                      .filter(a => selectedCase.actorIds.includes(a.id))
                      .map(a => (
                        <li key={a.id} className="p-2 rounded bg-slate-900 border border-slate-800/80">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{a.name}</span>
                            <span className="text-[10px] text-amber-400 font-mono">MENTIONNÉ</span>
                          </div>
                          <span className="text-[11px] text-slate-400">{a.description}</span>
                        </li>
                      ))}
                    {selectedCase.actorIds.length === 0 && (
                      <li className="text-xs text-slate-500 italic">Aucun acteur spécifique mentionné.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Signaux faibles & Incertitudes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-purple-400 flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5" />
                    Signaux Faibles Associés ({selectedCase.weakSignalIds.length})
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {DEMO_WEAK_SIGNALS.filter(w => selectedCase.weakSignalIds.includes(w.id)).map(sig => (
                      <li key={sig.id} className="p-2 rounded bg-slate-900 border border-slate-800/80">
                        <span className="font-bold text-purple-300 block">{sig.title}</span>
                        <span className="text-[11px] text-slate-400">{sig.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Niveau d'Incertitude & Lacunes
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {selectedCase.uncertainties.map((u, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{u}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: MATRICE DE FUSION DYNAMIQUE                         */}
        {/* ========================================================= */}
        {activeTab === 'matrice' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  Matrice de Fusion Multi-Entités
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recoupement dynamique par pays des composantes de renseignement collectées.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {fusionMatrix.length} pays documentés
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                    <tr>
                      <th className="py-3 px-4">Pays</th>
                      <th className="py-3 px-3 text-center">Sources</th>
                      <th className="py-3 px-3 text-center">Événements</th>
                      <th className="py-3 px-3 text-center">Acteurs</th>
                      <th className="py-3 px-3 text-center">Corrélations</th>
                      <th className="py-3 px-3 text-center">Signaux Faibles</th>
                      <th className="py-3 px-3 text-center">Contradictions</th>
                      <th className="py-3 px-4 text-center">Taux de Concordance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {fusionMatrix.map(row => (
                      <tr key={row.countryCode} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-sans font-bold text-slate-200 flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-xs font-mono text-cyan-300">
                            {row.countryCode}
                          </span>
                          <span>{row.countryName}</span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          {row.hasSources ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300">
                              ✓ ({row.sourcesCount})
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {row.hasEvents ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300">
                              ✓ ({row.eventsCount})
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {row.hasActors ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300">
                              ✓ ({row.actorsCount})
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {row.hasCorrelations ? (
                            <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800 text-amber-300">
                              ✓ ({row.correlationsCount})
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {row.hasWeakSignals ? (
                            <span className="px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800 text-purple-300">
                              ✓ ({row.weakSignalsCount})
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {row.hasContradictions ? (
                            <span className="px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800 text-rose-300">
                              Oui (Arbitrage)
                            </span>
                          ) : (
                            <span className="text-slate-500">Non</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center font-bold">
                          <span
                            className={`${
                              row.concordanceRatio >= 80
                                ? 'text-emerald-400'
                                : row.concordanceRatio >= 60
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {row.concordanceRatio}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: RÉSEAU RELATIONNEL INTERACTIF                       */}
        {/* ========================================================= */}
        {activeTab === 'reseau' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Network className="w-4 h-4 text-cyan-400" />
                  Graphe Relationnel de Fusion : {activeGraphCase.id}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualisation interactive des relations : Situation ↔ Événements ↔ Sources ↔ Acteurs ↔ Corrélations ↔ Signaux.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGraphZoom(z => Math.min(z + 0.15, 1.8))}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  + Zoom
                </button>
                <button
                  onClick={() => setGraphZoom(z => Math.max(z - 0.15, 0.6))}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  - Zoom
                </button>
                <button
                  onClick={() => setGraphZoom(1)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="relative w-full rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
              <canvas
                ref={canvasRef}
                width={900}
                height={550}
                className="w-full h-[550px] cursor-crosshair block"
              />

              {/* Legend overlay */}
              <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-[11px] space-y-1.5">
                <div className="font-bold text-slate-300 text-xs mb-1">Typologie des Nœuds</div>
                <div className="flex items-center gap-2 text-cyan-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Situation Foyer
                </div>
                <div className="flex items-center gap-2 text-sky-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Événements
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Sources Contributrices
                </div>
                <div className="flex items-center gap-2 text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Acteurs Mentionnés
                </div>
                <div className="flex items-center gap-2 text-orange-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Corrélations
                </div>
                <div className="flex items-center gap-2 text-purple-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Signaux Faibles
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: CARTE & CHRONOLOGIE DE SITUATION                    */}
        {/* ========================================================= */}
        {activeTab === 'chronocarte' && selectedCase && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Carte observationnelle */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    Points d'Observation Géospatiale
                  </h3>
                  <span className="text-xs font-mono text-cyan-300">
                    {selectedCase.countryCodes.join(' • ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Représentation des coordonnées et périmètres d'intérêt sans mention belliqueuse arbitraire.
                </p>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="text-xs text-slate-300">
                    <strong>Région d'intérêt :</strong> {selectedCase.regionIds.join(', ')}
                  </div>
                  <div className="space-y-2">
                    {vm.events
                      .filter(e => selectedCase.eventIds.includes(e.id))
                      .map(e => (
                        <div key={e.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-200 block">{e.title}</span>
                            <span className="text-[11px] text-slate-400">Localisation : {e.country}</span>
                          </div>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                            Obs. Récente
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Chronologie fusionnée */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    Chronologie Temporelle Faisceau
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Ordre chronologique
                  </span>
                </div>

                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 pl-7 max-h-[420px] overflow-y-auto">
                  {vm.events
                    .filter(e => selectedCase.eventIds.includes(e.id))
                    .map(e => (
                      <div key={e.id} className="relative p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        <div className="absolute -left-[21px] top-3.5 w-2 h-2 rounded-full bg-cyan-400" />
                        <span className="font-mono text-[10px] text-cyan-400 block">
                          {new Date(e.publishedAt || e.detectedAt || '').toLocaleString('fr-FR')}
                        </span>
                        <div className="font-bold text-slate-200 mt-0.5">{e.title}</div>
                        <p className="text-[11px] text-slate-400 mt-1">{e.summary}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: MULTI-SOURCES & CONTRADICTIONS                     */}
        {/* ========================================================= */}
        {activeTab === 'multisources' && selectedCase && (
          <div className="space-y-6">
            {/* Multi-Sources Convergence */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Convergence des Sources d'Information
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Évaluation de l'indépendance réelle des sources et concordances des récits.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                  {selectedCase.reportedInformation.length} déclarations indexées
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Source</th>
                      <th className="py-2.5 px-3">Information rapportée</th>
                      <th className="py-2.5 px-3">Indépendance</th>
                      <th className="py-2.5 px-3">Concordance</th>
                      <th className="py-2.5 px-3">Acteur Cité</th>
                      <th className="py-2.5 px-3">Confiance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedCase.reportedInformation.map(rep => (
                      <tr key={rep.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-bold text-slate-200">
                          {rep.sourceName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          « {rep.claim} »
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              rep.sourceIndependence === 'INDÉPENDANTE'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {rep.sourceIndependence}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              rep.concordance === 'CONCORDANTE'
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-amber-950 text-amber-300'
                            }`}
                          >
                            {rep.concordance}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {rep.actorMentioned || '—'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-cyan-300">
                          {rep.confidence}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contradictions à examiner */}
            <div className="p-5 rounded-2xl bg-amber-950/10 border border-amber-800/40 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-800/30 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400" />
                    Contradictions à Examiner ({selectedCase.contradictions.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    L'application ne tranche pas les contradictions : un arbitrage humain de l'analyste est exigé.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-amber-950 text-amber-300 border border-amber-800">
                  Arbitrage Analyste Requis
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {selectedCase.contradictions.map(cot => (
                  <div key={cot.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 text-sm">{cot.topic}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
                        {cot.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="font-bold text-slate-300 block mb-1">Source A : {cot.sourceA.sourceName}</span>
                        <p className="text-slate-400 italic">« {cot.sourceA.statement} »</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="font-bold text-slate-300 block mb-1">Source B : {cot.sourceB.sourceName}</span>
                        <p className="text-slate-400 italic">« {cot.sourceB.statement} »</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/30 text-amber-200">
                      <strong>Divergence constatée :</strong> {cot.divergence}
                    </div>

                    <div className="text-amber-400 font-semibold text-[11px]">
                      {cot.analystActionRequired}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: COMPARATEUR DE SITUATIONS (A vs B)                  */}
        {/* ========================================================= */}
        {activeTab === 'comparateur' && (
          <div className="space-y-6">
            {/* Situation Selection Selectors */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="w-full md:w-1/2 flex flex-col gap-1">
                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Situation A :
                </label>
                <select
                  value={comparatorCaseAId}
                  onChange={e => setComparatorCaseAId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  {DEMO_FUSION_CASES.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.id}] {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-slate-500 font-bold">VS</div>

              <div className="w-full md:w-1/2 flex flex-col gap-1">
                <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Situation B :
                </label>
                <select
                  value={comparatorCaseBId}
                  onChange={e => setComparatorCaseBId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  {DEMO_FUSION_CASES.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.id}] {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Results */}
            {!comparisonResult.canCompare ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-amber-300">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-sm font-bold">{comparisonResult.reason || 'Comparaison impossible — données insuffisantes.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Situation A Column */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-cyan-500/30 space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono text-cyan-400 font-bold">Situation A</span>
                    <h3 className="text-base font-bold text-white mt-1">{comparisonResult.caseA?.title}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                        {comparisonResult.caseA?.status}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-[10px] text-cyan-300 font-mono">
                        Priorité {comparisonResult.caseA?.priority}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div><strong>Pays :</strong> {comparisonResult.caseA?.countryCodes.join(', ')}</div>
                    <div><strong>Événements rattachés :</strong> {comparisonResult.caseA?.eventIds.length}</div>
                    <div><strong>Sources :</strong> {comparisonResult.caseA?.sourceIds.length}</div>
                    <div><strong>Acteurs :</strong> {comparisonResult.caseA?.actorIds.length}</div>
                    <div><strong>Corrélations :</strong> {comparisonResult.caseA?.correlationIds.length}</div>
                    <div><strong>Signaux faibles :</strong> {comparisonResult.caseA?.weakSignalIds.length}</div>
                    <div><strong>Niveau de confiance :</strong> {comparisonResult.caseA?.confidence}</div>
                    <div><strong>Contradictions :</strong> {comparisonResult.contradictionComparison.caseAContradictionsCount}</div>
                  </div>
                </div>

                {/* Situation B Column */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-purple-500/30 space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono text-purple-400 font-bold">Situation B</span>
                    <h3 className="text-base font-bold text-white mt-1">{comparisonResult.caseB?.title}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                        {comparisonResult.caseB?.status}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-[10px] text-purple-300 font-mono">
                        Priorité {comparisonResult.caseB?.priority}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div><strong>Pays :</strong> {comparisonResult.caseB?.countryCodes.join(', ')}</div>
                    <div><strong>Événements rattachés :</strong> {comparisonResult.caseB?.eventIds.length}</div>
                    <div><strong>Sources :</strong> {comparisonResult.caseB?.sourceIds.length}</div>
                    <div><strong>Acteurs :</strong> {comparisonResult.caseB?.actorIds.length}</div>
                    <div><strong>Corrélations :</strong> {comparisonResult.caseB?.correlationIds.length}</div>
                    <div><strong>Signaux faibles :</strong> {comparisonResult.caseB?.weakSignalIds.length}</div>
                    <div><strong>Niveau de confiance :</strong> {comparisonResult.caseB?.confidence}</div>
                    <div><strong>Contradictions :</strong> {comparisonResult.contradictionComparison.caseBContradictionsCount}</div>
                  </div>
                </div>

                {/* Intersection Panel */}
                <div className="md:col-span-2 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                  <span className="font-bold text-slate-200 block uppercase tracking-wider text-[11px]">
                    Points de Recoupement Identifiés
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400">
                    <div>Pays partagés : <span className="text-slate-200 font-mono">{comparisonResult.sharedCountries.length || 'Aucun'}</span></div>
                    <div>Événements communs : <span className="text-slate-200 font-mono">{comparisonResult.sharedEvents.length || 'Aucun'}</span></div>
                    <div>Acteurs partagés : <span className="text-slate-200 font-mono">{comparisonResult.sharedActors.length || 'Aucun'}</span></div>
                    <div>Sources communes : <span className="text-slate-200 font-mono">{comparisonResult.sharedSources.length || 'Aucune'}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal Component */}
      {detailModalCase && (
        <FusionDetailModal
          fusionCase={detailModalCase}
          onClose={() => setDetailModalCase(null)}
          vm={vm}
          onOpenEvent={evt => {
            setDetailModalCase(null);
            vm.selectEvent(evt);
          }}
          onOpenSource={src => {
            setDetailModalCase(null);
            vm.selectSource(src);
          }}
          onOpenActor={act => {
            setDetailModalCase(null);
            vm.selectActor(act);
          }}
        />
      )}
    </div>
  );
};
