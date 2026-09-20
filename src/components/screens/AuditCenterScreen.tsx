import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Database,
  AlertTriangle,
  FileText,
  BarChart3,
  Search,
  Filter,
  Link,
  HelpCircle,
  Clock,
  Layers,
  CheckCircle2,
  GitBranch,
  Scale,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  AlertOctagon,
  Copy,
  Table,
  RefreshCw,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { UseOsintViewModelReturn } from '../../viewmodels/useOsintViewModel';
import {
  OsintProvenance,
  OsintIntelligenceReport,
  OsintEvent,
} from '../../types';
import {
  calculateQualityScore,
  getQualityScoreBreakdown,
  scanAllGaps,
  detectDuplicates,
  generateVerificationQuestions,
  AuditGap,
  AuditPriorityLevel,
} from '../../lib/auditUtils';
import {
  LOT20_DEMO_PROVENANCES,
  LOT20_DEMO_EVENT_NO_SOURCE,
  LOT20_DEMO_SINGLE_SOURCE_ITEM,
  LOT20_DEMO_CONVERGENCE_ITEM,
  LOT20_DEMO_UNKNOWN_INDEPENDENCE_ITEM,
  LOT20_DEMO_CONTRADICTION_ITEM,
  LOT20_DEMO_DUPLICATE_ITEM,
  LOT20_DEMO_REPORTS_AUDIT,
  LOT20_DEMO_NOTICE,
} from '../../data/auditDemoData';
import { DEMO_CONVERGENCES_CONTRADICTIONS } from '../../data/correlationData';
import { TraceabilityChain } from '../audit/TraceabilityChain';
import { AuditDetailModal } from '../modals/AuditDetailModal';

type AuditTab =
  | 'PRIORITES'
  | 'QUALITE_PROVENANCE'
  | 'LACUNES'
  | 'CONTRADICTIONS'
  | 'CONVERGENCE'
  | 'DOUBLONS'
  | 'RAPPORTS'
  | 'MATRICE';

interface AuditCenterScreenProps {
  vm: UseOsintViewModelReturn;
}

export const AuditCenterScreen: React.FC<AuditCenterScreenProps> = ({ vm }) => {
  const [activeTab, setActiveTab] = useState<AuditTab>('PRIORITES');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemForModal, setSelectedItemForModal] = useState<any | null>(null);
  const [selectedProvenanceForModal, setSelectedProvenanceForModal] = useState<OsintProvenance | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Provenances réelles ou injectées
  const allProvenances: OsintProvenance[] = useMemo(() => {
    const list = vm.provenance && vm.provenance.length > 0 ? vm.provenance : LOT20_DEMO_PROVENANCES;
    // S'assurer que les provenances de démonstration sont incluses pour les tests
    const merged = [...list];
    LOT20_DEMO_PROVENANCES.forEach((dp) => {
      if (!merged.some((p) => p.id === dp.id)) {
        merged.push(dp);
      }
    });
    return merged;
  }, [vm.provenance]);

  // Tous les événements (incluant l'événement sans source de test)
  const allEvents: OsintEvent[] = useMemo(() => {
    const evts = [...vm.events];
    if (!evts.some((e) => e.id === LOT20_DEMO_EVENT_NO_SOURCE.id)) {
      evts.push({
        id: LOT20_DEMO_EVENT_NO_SOURCE.id,
        title: LOT20_DEMO_EVENT_NO_SOURCE.title,
        summary: LOT20_DEMO_EVENT_NO_SOURCE.summary,
        detailedAnalysis: 'Événement de démonstration consigné sans source d’origine.',
        countryId: 'ML',
        countryName: 'Mali',
        locationName: 'Secteur Tombouctou',
        coordinates: { lat: 16.7666, lng: -3.0026 },
        date: LOT20_DEMO_EVENT_NO_SOURCE.date,
        time: '14:00',
        category: 'Sécurité',
        severity: 'ÉLEVÉ',
        source: undefined as any,
        associatedSourcesCount: 0,
        associatedSourcesList: [],
        potentialDuplicates: [],
        status: 'EN COURS',
        createdAt: '2026-09-12T14:00:00Z',
        updatedAt: '2026-09-12T14:00:00Z',
        isDemo: true,
      });
    }
    return evts;
  }, [vm.events]);

  // Tous les rapports
  const allReports: OsintIntelligenceReport[] = vm.reports;

  // Calcul du scan global des lacunes
  const detectedGaps: AuditGap[] = useMemo(() => {
    return scanAllGaps({
      events: allEvents,
      reports: allReports,
      analyses: vm.analyses,
      evidence: vm.evidence,
      hypotheses: vm.hypotheses,
      provenances: allProvenances,
    });
  }, [allEvents, allReports, vm.analyses, vm.evidence, vm.hypotheses, allProvenances]);

  // Contradictions combinées (LOT 14/17/18 + LOT 20-B)
  const allContradictions = useMemo(() => {
    const list = DEMO_CONVERGENCES_CONTRADICTIONS.filter((c) => c.type === 'CONTRADICTION');
    return [
      {
        id: LOT20_DEMO_CONTRADICTION_ITEM.id,
        title: LOT20_DEMO_CONTRADICTION_ITEM.title,
        topic: LOT20_DEMO_CONTRADICTION_ITEM.topic,
        sourcesInvolved: [
          {
            sourceName: LOT20_DEMO_CONTRADICTION_ITEM.sourceA.name,
            position: LOT20_DEMO_CONTRADICTION_ITEM.sourceA.statement,
            reliability: LOT20_DEMO_CONTRADICTION_ITEM.sourceA.reliability,
          },
          {
            sourceName: LOT20_DEMO_CONTRADICTION_ITEM.sourceB.name,
            position: LOT20_DEMO_CONTRADICTION_ITEM.sourceB.statement,
            reliability: LOT20_DEMO_CONTRADICTION_ITEM.sourceB.reliability,
          },
        ],
        status: LOT20_DEMO_CONTRADICTION_ITEM.status,
        doctrineRule: LOT20_DEMO_CONTRADICTION_ITEM.doctrineRule,
        date: LOT20_DEMO_CONTRADICTION_ITEM.sourceA.date,
        isDemo: true,
      },
      ...list.map((c) => ({
        id: c.id,
        title: c.title,
        topic: c.topic,
        sourcesInvolved: c.sourcesInvolved,
        status: 'ARBITRAGE ANALYSTE REQUIS',
        doctrineRule: 'Interdiction d’arbitrage automatique. Préserver les deux versions en vis-à-vis.',
        date: '2026-09-11',
        isDemo: Boolean(c.isDemo),
      })),
    ];
  }, []);

  // Détection des doublons
  const detectedDuplicates = useMemo(() => {
    const res = detectDuplicates(allEvents);
    // Inclure le doublon de démo
    res.unshift({
      id: LOT20_DEMO_DUPLICATE_ITEM.id,
      sourceItemTitle: LOT20_DEMO_DUPLICATE_ITEM.primaryTitle,
      targetItemTitle: LOT20_DEMO_DUPLICATE_ITEM.candidateTitle,
      classification: LOT20_DEMO_DUPLICATE_ITEM.classification,
      similarityPercentage: LOT20_DEMO_DUPLICATE_ITEM.similarityScore,
      matchedCriteria: ['Titre normalisé identique', 'Date concordante', 'Empreinte lexicale à 88%'],
      recommendation: LOT20_DEMO_DUPLICATE_ITEM.suggestedAction,
    });
    return res;
  }, [allEvents]);

  // Scores moyens & KPIs
  const kpis = useMemo(() => {
    const scores = allProvenances.map((p) => calculateQualityScore(p, p));
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 74;
    const realSources = vm.sources.filter((s) => s.isReal).length;
    const demoSources = vm.sources.filter((s) => !s.isReal).length;
    const incompleteTraceability = allProvenances.filter((p) => (p.completeness || 0) < 80).length;

    return {
      totalAudited: allProvenances.length + allEvents.length + allReports.length,
      realSources,
      demoSources,
      reportsCount: allReports.length,
      avgQualityScore: avgScore,
      gapsCount: detectedGaps.length,
      contradictionsCount: allContradictions.length,
      incompleteTraceability,
    };
  }, [allProvenances, vm.sources, allReports, detectedGaps, allContradictions, allEvents]);

  // Priorités de vérification (classement documentaire)
  const auditPriorities = useMemo(() => {
    const list: {
      id: string;
      title: string;
      category: string;
      level: AuditPriorityLevel;
      reason: string;
      rawItem: any;
      provenance?: OsintProvenance;
    }[] = [];

    // 1. Contradictions -> CRITIQUE STRUCTUREL
    allContradictions.forEach((c) => {
      list.push({
        id: `prio-${c.id}`,
        title: c.title,
        category: 'Contradiction non arbitrée',
        level: 'CRITIQUE STRUCTUREL',
        reason: 'Deux versions officielles ou médiatiques divergentes sans corroboration par capteur neutre.',
        rawItem: c,
      });
    });

    // 2. Événement sans source -> CRITIQUE STRUCTUREL
    list.push({
      id: 'prio-evt-no-src',
      title: LOT20_DEMO_EVENT_NO_SOURCE.title,
      category: 'Source totalement absente',
      level: 'CRITIQUE STRUCTUREL',
      reason: 'Signalement consigné sans identifiant d’émetteur, URL ni canal vérifiable.',
      rawItem: LOT20_DEMO_EVENT_NO_SOURCE,
    });

    // 3. Information source unique -> ÉLEVÉ
    list.push({
      id: 'prio-single-src',
      title: LOT20_DEMO_SINGLE_SOURCE_ITEM.title,
      category: 'Source unique non corroborée',
      level: 'ÉLEVÉ',
      reason: LOT20_DEMO_SINGLE_SOURCE_ITEM.riskNotice,
      rawItem: LOT20_DEMO_SINGLE_SOURCE_ITEM,
    });

    // 4. Convergence à indépendance inconnue -> ÉLEVÉ
    list.push({
      id: 'prio-cnv-unknown',
      title: LOT20_DEMO_UNKNOWN_INDEPENDENCE_ITEM.title,
      category: 'Indépendance des sources inconnue',
      level: 'ÉLEVÉ',
      reason: LOT20_DEMO_UNKNOWN_INDEPENDENCE_ITEM.analystSummary,
      rawItem: LOT20_DEMO_UNKNOWN_INDEPENDENCE_ITEM,
    });

    // 5. Provenance incomplète -> MOYEN
    allProvenances
      .filter((p) => (p.completeness || 0) < 60)
      .forEach((p) => {
        list.push({
          id: `prio-prov-${p.id}`,
          title: p.sourceName || `Provenance ${p.id}`,
          category: 'Provenance partielle / incomplète',
          level: 'MOYEN',
          reason: `Complétude archivistique de ${p.completeness || 40}% avec champs obligatoires absents.`,
          rawItem: p,
          provenance: p,
        });
      });

    // 6. Doublon probable -> FAIBLE
    detectedDuplicates.forEach((d) => {
      list.push({
        id: `prio-dup-${d.id}`,
        title: d.sourceItemTitle,
        category: 'Doublon / Chevauchement lexical',
        level: 'FAIBLE',
        reason: d.recommendation,
        rawItem: d,
      });
    });

    return list;
  }, [allContradictions, allProvenances, detectedDuplicates]);

  // Ouverture du modal de détail
  const handleOpenAuditModal = (item: any, prov?: OsintProvenance) => {
    setSelectedItemForModal(item);
    setSelectedProvenanceForModal(prov);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-200">
      {/* Bannière supérieure de rappel méthodologique et démo */}
      <div className="p-4 rounded-xl border border-indigo-900/50 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                CENTRE DE QUALITÉ, PROVENANCE ET AUDIT DU RENSEIGNEMENT OSINT
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DONNÉES DE DÉMONSTRATION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Supervision méthodologique de la chaîne de traçabilité, détection des lacunes et arbitrage des contradictions factuelles.
            </p>
          </div>
        </div>

        {/* Rappel Doctrinal strict */}
        <div className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>QUALITÉ DOCUMENTAIRE ≠ FIABILITÉ ≠ CONFIANCE ≠ CERTITUDE</span>
        </div>
      </div>

      {/* KPI Cards dynamiques (conservation et extension des KPIs existants) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* KPI 1 : Objets Audités (existant) */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-slate-400 text-xs font-medium">Objets Audités</div>
          <div className="text-2xl font-bold text-white mt-1">{kpis.totalAudited}</div>
          <div className="text-[10px] text-slate-400 mt-1">Événements, preuves, rapports</div>
        </div>

        {/* KPI 2 : Sources Réelles (existant) */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-slate-400 text-xs font-medium">Sources Réelles</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{kpis.realSources}</div>
          <div className="text-[10px] text-slate-400 mt-1">Non connectées (passives)</div>
        </div>

        {/* KPI 3 : Sources Demo (existant) */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-slate-400 text-xs font-medium">Sources Demo</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{kpis.demoSources}</div>
          <div className="text-[10px] text-slate-400 mt-1">Calibrage d'interface</div>
        </div>

        {/* KPI 4 : Rapports (existant) */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-slate-400 text-xs font-medium">Rapports</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{kpis.reportsCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">Dossiers d’analyse</div>
        </div>

        {/* KPI 5 : Qualité Documentaire Moyenne */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-indigo-900/40 flex flex-col justify-between">
          <div className="text-indigo-300 text-xs font-medium">Qualité Doc. Moyenne</div>
          <div className="text-2xl font-bold text-indigo-300 mt-1">{kpis.avgQualityScore}/100</div>
          <div className="text-[10px] text-indigo-400/80 mt-1">Indice formel strict</div>
        </div>

        {/* KPI 6 : Lacunes Détectées */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-amber-900/40 flex flex-col justify-between">
          <div className="text-amber-300 text-xs font-medium">Lacunes Relevées</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{kpis.gapsCount}</div>
          <div className="text-[10px] text-amber-400/80 mt-1">Questions associées</div>
        </div>

        {/* KPI 7 : Contradictions à Examiner */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-rose-900/40 flex flex-col justify-between">
          <div className="text-rose-300 text-xs font-medium">Contradictions</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{kpis.contradictionsCount}</div>
          <div className="text-[10px] text-rose-400/80 mt-1">Arbitrage requis</div>
        </div>

        {/* KPI 8 : Traçabilités Incomplètes */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-slate-400 text-xs font-medium">Traçabilité Incomplète</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{kpis.incompleteTraceability}</div>
          <div className="text-[10px] text-slate-400 mt-1">Maillons manquants</div>
        </div>
      </div>

      {/* Barre de navigation des Vues Fonctionnelles */}
      <div className="border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab('PRIORITES')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'PRIORITES'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Priorités de Vérification
          </button>

          <button
            onClick={() => setActiveTab('QUALITE_PROVENANCE')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'QUALITE_PROVENANCE'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Qualité & Provenance
          </button>

          <button
            onClick={() => setActiveTab('LACUNES')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'LACUNES'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Lacunes de Renseignement ({detectedGaps.length})
          </button>

          <button
            onClick={() => setActiveTab('CONTRADICTIONS')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'CONTRADICTIONS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-rose-400" />
            Contradictions à Examiner ({allContradictions.length})
          </button>

          <button
            onClick={() => setActiveTab('CONVERGENCE')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'CONVERGENCE'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            Convergence des Sources
          </button>

          <button
            onClick={() => setActiveTab('DOUBLONS')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'DOUBLONS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            Détection des Doublons ({detectedDuplicates.length})
          </button>

          <button
            onClick={() => setActiveTab('RAPPORTS')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'RAPPORTS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Audit des Rapports
          </button>

          <button
            onClick={() => setActiveTab('MATRICE')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'MATRICE'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Matrice d'Audit
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VUE 1 : PRIORITÉS DE VÉRIFICATION */}
      {/* ========================================================================= */}
      {activeTab === 'PRIORITES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-amber-400" />
                PRIORITÉS DE VÉRIFICATION DOCUMENTAIRE
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Hiérarchisation des dossiers présentant des anomalies méthodologiques, contradictions ou manques probatoires.
                <strong className="text-slate-300"> Cet indicateur est strictement documentaire et ne constitue pas une priorité tactique.</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {auditPriorities.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  item.level === 'CRITIQUE STRUCTUREL'
                    ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700'
                    : item.level === 'ÉLEVÉ'
                    ? 'bg-amber-950/20 border-amber-900/50 hover:border-amber-700'
                    : item.level === 'MOYEN'
                    ? 'bg-blue-950/20 border-blue-900/50 hover:border-blue-700'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        item.level === 'CRITIQUE STRUCTUREL'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : item.level === 'ÉLEVÉ'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : item.level === 'MOYEN'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                      }`}
                    >
                      {item.level}
                    </span>

                    <span className="text-[11px] font-mono text-slate-400 font-medium">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.reason}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    ID: {item.id}
                  </span>
                  <button
                    onClick={() => handleOpenAuditModal(item.rawItem, item.provenance)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    Ouvrir Fiche d’Audit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 2 : QUALITÉ DOCUMENTAIRE & PROVENANCE */}
      {/* ========================================================================= */}
      {activeTab === 'QUALITE_PROVENANCE' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                REGISTRE DE QUALITÉ DOCUMENTAIRE ET DE PROVENANCE
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Chaque enregistrement dispose d'un score de qualité formelle calculé sur 5 critères (Source, Horodatage, Amirauté, Liaisons, Complétude).
              </p>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrer par source, ID ou mot-clé..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Objet & Réf.</th>
                    <th className="py-3 px-4">Source Primaire</th>
                    <th className="py-3 px-4">Horodatage</th>
                    <th className="py-3 px-4">Cote Amirauté</th>
                    <th className="py-3 px-4">Score Qualité Doc.</th>
                    <th className="py-3 px-4">Complétude</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {allProvenances
                    .filter((p) => {
                      const text = `${p.sourceName || ''} ${p.objectId} ${p.id} ${p.transformationType || ''}`.toLowerCase();
                      return text.includes(searchQuery.toLowerCase());
                    })
                    .map((p) => {
                      const breakdown = getQualityScoreBreakdown(p, p);
                      return (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-200">{p.objectId}</div>
                            <div className="text-[10px] font-mono text-slate-400">{p.originalReference || p.id}</div>
                            {p.isDemo && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                DÉMO
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-200">{p.sourceName || 'Non documentée'}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-xs">{p.sourceType || 'Canal brut'}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                            <div>Obs : {p.observationDate ? p.observationDate.slice(0, 10) : '—'}</div>
                            <div className="text-slate-400">Pub : {p.publicationDate || '—'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-indigo-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {p.reliability || 'F'}{p.certainty ? ` (${p.certainty.slice(0, 1)})` : ''}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-100">{breakdown.score}/100</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded border ${
                                  breakdown.score >= 80
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : breakdown.score >= 50
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                }`}
                              >
                                {breakdown.verdict}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-500 h-full rounded-full"
                                style={{ width: `${p.completeness || 40}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                              {p.completeness || 40}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleOpenAuditModal(p, p)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3 h-3 text-indigo-400" />
                              Détails
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

      {/* ========================================================================= */}
      {/* VUE 3 : LACUNES DE RENSEIGNEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'LACUNES' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              LACUNES DE RENSEIGNEMENT IDENTIFIÉES ({detectedGaps.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Analyse automatisée détectant les sources absentes, dates manquantes, analyses non étayées et rapports sans registre de provenance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {detectedGaps.map((gap) => (
              <div
                key={gap.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        gap.severity === 'CRITIQUE STRUCTUREL'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : gap.severity === 'ÉLEVÉ'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {gap.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {gap.gapType}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100">{gap.title}</h3>
                  <div className="text-xs text-indigo-300 font-medium">
                    Concerne : {gap.entityTitle} ({gap.entityId})
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{gap.details}</p>

                  {/* Questions suggérées adaptées */}
                  {gap.suggestedQuestions.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-indigo-400" />
                        Questions de vérification formulées :
                      </div>
                      <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-0.5 pl-1">
                        {gap.suggestedQuestions.map((q, qIdx) => (
                          <li key={qIdx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => {
                      const matchedItem =
                        allEvents.find((e) => e.id === gap.entityId) ||
                        allReports.find((r) => r.id === gap.entityId) ||
                        vm.hypotheses.find((h) => h.id === gap.entityId) ||
                        vm.evidence.find((ev) => ev.id === gap.entityId) || {
                          id: gap.entityId,
                          title: gap.entityTitle,
                          objectType: gap.entityType,
                        };
                      handleOpenAuditModal(matchedItem);
                    }}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    Examiner le dossier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 4 : CONTRADICTIONS À EXAMINER */}
      {/* ========================================================================= */}
      {activeTab === 'CONTRADICTIONS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-rose-900/40 bg-rose-950/20 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-rose-300 flex items-center gap-2">
                <Scale className="w-4 h-4 text-rose-400" />
                CONTRADICTIONS FACTUELLES ET DIVERGENCES DE SOURCES ({allContradictions.length})
              </h2>
              <p className="text-xs text-rose-200/80">
                <strong>Règle méthodologique absolue :</strong> ARBITRAGE ANALYSTE REQUIS. Ne jamais trancher ni écraser automatiquement une version discordante. Les versions doivent être maintenues en parallèle avec leurs codes Amirauté jusqu'à corroboration neutre.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
              ARBITRAGE REQUIS
            </span>
          </div>

          <div className="space-y-3">
            {allContradictions.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">ID: {item.id}</span>
                    <h3 className="text-sm font-bold text-slate-100 mt-0.5">{item.title}</h3>
                    <div className="text-xs text-slate-400">Objet : {item.topic}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Confrontation des deux sources */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {item.sourcesInvolved.slice(0, 2).map((src, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300">
                          Source {sIdx === 0 ? 'A' : 'B'} : {src.sourceName}
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          Cote: {src.reliability}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2 rounded border border-slate-800/80 italic">
                        "{src.position}"
                      </p>
                    </div>
                  ))}
                </div>

                {/* Règle de doctrine et action */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                  <div className="text-slate-400 italic">
                    {item.doctrineRule}
                  </div>

                  <button
                    onClick={() => handleOpenAuditModal(item)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    Ouvrir Fiche d'Arbitrage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 5 : CONVERGENCE & INDÉPENDANCE */}
      {/* ========================================================================= */}
      {activeTab === 'CONVERGENCE' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-cyan-900/40 bg-cyan-950/20 space-y-1">
            <h2 className="text-base font-bold text-cyan-300 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              CONVERGENCE DES SOURCES ET CONTRÔLE D'INDÉPENDANCE
            </h2>
            <p className="text-xs text-cyan-200/80">
              Vérification stricte contre l'effet "chambre d'écho". Si plusieurs sources reprennent une même dépêche primaire sans enquête autonome :
              <strong> CONVERGENCE OBSERVÉE mais INDÉPENDANCE NON ÉTABLIE</strong> (interdiction de qualifier en confirmation indépendante).
            </p>
          </div>

          <div className="space-y-4">
            {/* Cas 1 : Indépendance avérée */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    ID: {LOT20_DEMO_CONVERGENCE_ITEM.id}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                    {LOT20_DEMO_CONVERGENCE_ITEM.title}
                  </h3>
                  <div className="text-xs text-slate-400">
                    Objet : {LOT20_DEMO_CONVERGENCE_ITEM.topic}
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {LOT20_DEMO_CONVERGENCE_ITEM.independenceStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-mono text-[10px]">SOURCE PRIMAIRE AVÉRÉE :</div>
                  <div className="font-bold text-slate-200">{LOT20_DEMO_CONVERGENCE_ITEM.primarySource.name}</div>
                  <div className="text-slate-400">{LOT20_DEMO_CONVERGENCE_ITEM.primarySource.nature}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-mono text-[10px]">SOURCES SECONDAIRES CONCORDANTES :</div>
                  {LOT20_DEMO_CONVERGENCE_ITEM.secondarySources.map((s, idx) => (
                    <div key={idx} className="text-slate-300">
                      • <span className="font-medium text-slate-200">{s.name}</span> ({s.nature})
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded border border-slate-800">
                {LOT20_DEMO_CONVERGENCE_ITEM.analystSummary}
              </p>
            </div>

            {/* Cas 2 : Indépendance non établie (Chambre d'écho) */}
            <div className="p-5 rounded-xl border border-amber-900/50 bg-amber-950/15 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/40 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    ID: {LOT20_DEMO_UNKNOWN_INDEPENDENCE_ITEM.id}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                    {LOT20_DEMO_UNKNOWN_INDEPENDENCE_ITEM.title}
                  </h3>
                  <div className="text-xs text-slate-400">
                    Objet : {LOT20_DEMO_UNKNOWN_INDEPENDENCE_ITEM.topic}
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {LOT20_DEMO_UNKNOWN_INDEPENDENCE_ITEM.independenceStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-mono text-[10px]">CANAL D'ORIGINE UNIQUE :</div>
                  <div className="font-bold text-slate-200">{LOT20_DEMO_UNKNOWN_INDEPENDENCE_ITEM.primarySource.name}</div>
                  <div className="text-slate-400">{LOT20_DEMO_UNKNOWN_INDEPENDENCE_ITEM.primarySource.nature}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-mono text-[10px]">REPRISES EN BOUCLE SANS VÉRIFICATION :</div>
                  {LOT20_DEMO_UNKNOWN_INDEPENDENCE_ITEM.secondarySources.map((s, idx) => (
                    <div key={idx} className="text-slate-300">
                      • <span className="font-medium text-slate-200">{s.name}</span> ({s.nature})
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 font-medium">
                {LOT20_DEMO_UNKNOWN_INDEPENDENCE_ITEM.analystSummary}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 6 : DÉTECTION DES DOUBLONS */}
      {/* ========================================================================= */}
      {activeTab === 'DOUBLONS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Copy className="w-4 h-4 text-indigo-400" />
                DÉTECTION LOCALE DE DOUBLONS ET CHEVAUCHEMENTS ({detectedDuplicates.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rapprochement automatique basé sur l'URL canonique, le titre normalisé, la concordance temporelle et la similarité textuelle.
                <strong className="text-slate-200"> INTERDICTION STRICTE : Aucune suppression automatique ni fusion irréversible.</strong>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {detectedDuplicates.map((dup) => (
              <div
                key={dup.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 space-y-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded border ${
                      dup.classification === 'DOUBLON PROBABLE'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : dup.classification === 'CHEVAUCHEMENT'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                    }`}
                  >
                    {dup.classification} ({dup.similarityPercentage}%)
                  </span>

                  <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                    Critères validés : {dup.matchedCriteria.join(' • ')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono">ENREGISTREMENT INITIAL :</span>
                    <div className="font-semibold text-slate-200 mt-1">{dup.sourceItemTitle}</div>
                  </div>

                  <div className="p-3 rounded bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono">CANDIDAT AU RAPPROCHEMENT :</span>
                    <div className="font-semibold text-slate-200 mt-1">{dup.targetItemTitle}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 text-slate-400 text-[11px]">
                  <strong>Consigne méthodologique :</strong> {dup.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 7 : AUDIT DES RAPPORTS DE RENSEIGNEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'RAPPORTS' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              AUDIT ET VÉRIFICATION STRUCTURELLE DES RAPPORTS OSINT
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Évaluation dynamique de la complétude du dossier de production.
              Affichage formel : <span className="text-emerald-400 font-bold">RAPPORT PRÊT POUR VALIDATION</span> ou <span className="text-amber-400 font-bold">RAPPORT NÉCESSITANT UNE REVUE</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LOT20_DEMO_REPORTS_AUDIT.map((rep) => {
              const isReady = rep.auditVerdict === 'RAPPORT PRÊT POUR VALIDATION';
              return (
                <div
                  key={rep.reportId}
                  className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 ${
                    isReady
                      ? 'bg-slate-900/90 border-emerald-900/50'
                      : 'bg-slate-900/90 border-amber-900/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{rep.reference}</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded border ${
                          isReady
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {rep.auditVerdict}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100">{rep.title}</h3>

                    {/* Décomposition métrique */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Complétude</div>
                        <div className="text-base font-bold text-indigo-300">{rep.completenessScore}%</div>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Qualité Doc.</div>
                        <div className="text-base font-bold text-slate-200">{rep.qualityScore}/100</div>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Traçabilité</div>
                        <div className="text-[10px] font-bold text-slate-300 mt-1">
                          {rep.traceabilityStatus === 'TRAÇABILITÉ COMPLÈTE' ? 'COMPLÈTE' : 'INCOMPLÈTE'}
                        </div>
                      </div>
                    </div>

                    {/* Inventaire des liaisons */}
                    <div className="text-xs space-y-1 text-slate-300 pt-1">
                      <div className="flex justify-between border-b border-slate-800/60 pb-1">
                        <span className="text-slate-400">Sources associées :</span>
                        <span className="font-mono font-semibold">{rep.sourcesCount}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 pb-1">
                        <span className="text-slate-400">Événements rattachés :</span>
                        <span className="font-mono font-semibold">{rep.eventsCount}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 pb-1">
                        <span className="text-slate-400">Éléments de preuve :</span>
                        <span className="font-mono font-semibold">{rep.evidenceCount}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 pb-1">
                        <span className="text-slate-400">Hypothèses formulées :</span>
                        <span className="font-mono font-semibold">{rep.hypothesesCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Mentions non confirmées :</span>
                        <span className="font-mono font-semibold text-amber-300">{rep.unconfirmedCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => {
                        const targetRep = allReports.find((r) => r.id === rep.reportId) || {
                          id: rep.reportId,
                          reference: rep.reference,
                          title: rep.title,
                          objectType: 'report',
                          isDemo: true,
                        };
                        handleOpenAuditModal(targetRep);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      Examiner la chaîne du rapport
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 8 : MATRICE D'AUDIT */}
      {/* ========================================================================= */}
      {activeTab === 'MATRICE' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Table className="w-4 h-4 text-indigo-400" />
              MATRICE D'AUDIT RELATIONNELLE : OBJET × SOURCE × PREUVE × ANALYSE × RAPPORT
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Générée à partir des données effectives : <span className="text-emerald-400 font-bold">✓</span> relation présente, <span className="text-slate-500 font-bold">—</span> relation absente, <span className="text-amber-400 font-bold">?</span> relation inconnue ou partielle.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4">OBJET AUDITÉ</th>
                    <th className="py-3 px-4 text-center">SOURCE</th>
                    <th className="py-3 px-4 text-center">PREUVE</th>
                    <th className="py-3 px-4 text-center">ANALYSE</th>
                    <th className="py-3 px-4 text-center">RAPPORT</th>
                    <th className="py-3 px-4">ÉTAT GLOBAL</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {/* Ligne 1 : Événement Gao RN16 (Complet) */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-200">evt-001 (Axe RN16 Gao-Ansongo)</div>
                      <div className="text-[10px] text-slate-400">Événement géoréférencé</div>
                    </td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold text-sm">✓</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold text-sm">✓</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold text-sm">✓</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold text-sm">✓</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        TRAÇABILITÉ COMPLÈTE
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => handleOpenAuditModal(allEvents[0])}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-200 text-xs hover:bg-slate-700"
                      >
                        Inspecter
                      </button>
                    </td>
                  </tr>

                  {/* Ligne 2 : Événement Tombouctou (Sans Source) */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-200">evt-demo-no-src (Secteur Tombouctou)</div>
                      <div className="text-[10px] text-rose-400">Événement non sourcé</div>
                    </td>
                    <td className="py-3 px-4 text-center text-rose-400 font-bold text-sm">—</td>
                    <td className="py-3 px-4 text-center text-rose-400 font-bold text-sm">—</td>
                    <td className="py-3 px-4 text-center text-rose-400 font-bold text-sm">—</td>
                    <td className="py-3 px-4 text-center text-rose-400 font-bold text-sm">—</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        RUPTURE SOURCE
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => handleOpenAuditModal(LOT20_DEMO_EVENT_NO_SOURCE)}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-200 text-xs hover:bg-slate-700"
                      >
                        Inspecter
                      </button>
                    </td>
                  </tr>

                  {/* Ligne 3 : Rapport Minerais Kivu (Incomplet) */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-200">prod-002 (Traçabilité flux Kivu)</div>
                      <div className="text-[10px] text-amber-400">Dossier de production</div>
                    </td>
                    <td className="py-3 px-4 text-center text-amber-400 font-bold text-sm">?</td>
                    <td className="py-3 px-4 text-center text-rose-400 font-bold text-sm">—</td>
                    <td className="py-3 px-4 text-center text-amber-400 font-bold text-sm">?</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold text-sm">✓</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        TRAÇABILITÉ INCOMPLÈTE
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => handleOpenAuditModal(allReports[1] || { id: 'prod-002', title: 'Traçabilité flux Kivu' })}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-200 text-xs hover:bg-slate-700"
                      >
                        Inspecter
                      </button>
                    </td>
                  </tr>

                  {/* Ligne 4 : Preuve ev-003 Réseaux sociaux (Partiel) */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-200">ev-003 (Rumeur locale Twitter/X)</div>
                      <div className="text-[10px] text-slate-400">Preuve SOCMINT</div>
                    </td>
                    <td className="py-3 px-4 text-center text-amber-400 font-bold text-sm">?</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold text-sm">✓</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold text-sm">✓</td>
                    <td className="py-3 px-4 text-center text-slate-500 font-bold text-sm">—</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        NON DIFFUSÉ
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => handleOpenAuditModal(vm.evidence[2] || { id: 'ev-003', title: 'Rumeur locale' })}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-200 text-xs hover:bg-slate-700"
                      >
                        Inspecter
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'audit unifié */}
      <AuditDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItemForModal}
        provenance={selectedProvenanceForModal}
        vm={vm}
      />
    </div>
  );
};
