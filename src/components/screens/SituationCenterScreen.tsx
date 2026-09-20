import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Activity, AlertTriangle, Radio, GitMerge, AlertOctagon, 
  TrendingUp, Briefcase, Users, Map, Clock, ShieldCheck, History, Download, 
  Plus, Edit, CheckCircle2, ChevronRight, Filter, RefreshCw, X
} from 'lucide-react';
import { 
  OsintSituation, OsintEvent, OsintAlert, OsintWeakSignal, OsintCorrelation, 
  OsintAnomaly, OsintIndicator, OsintActor, OsintHypothesis, OsintEvidence, 
  OsintCase, OsintAlertContradiction, Country 
} from '../../types';
import { SituationCenterService, OsintSituationAudit } from '../../services/situationCenterService';
import { alertService } from '../../services/alertService';
import { weakSignalService } from '../../services/weakSignalService';
import { anomalyDetectionService } from '../../services/anomalyDetectionService';
import { indicatorService } from '../../services/indicatorService';
import { CaseManagementService } from '../../services/caseManagementService';
import { osintRepository } from '../../services/osintRepository';

// Data imports
import { mockSituations } from '../../data/mockSituations';
import { DEMO_OSINT_EVENTS } from '../../data/osintEventsData';
import { DEMO_EVENTS, ALL_COUNTRIES } from '../../data/mockData';
import { INITIAL_DEMO_ALERTS, INITIAL_DEMO_CONTRADICTIONS } from '../../data/alertDemoData';
import { INITIAL_DEMO_WEAK_SIGNALS, INITIAL_DEMO_CORRELATIONS, INITIAL_DEMO_ANOMALIES, INITIAL_DEMO_INDICATORS } from '../../data/weakSignalDemoData';
import { DEMO_CORRELATIONS } from '../../data/correlationData';
import { DEMO_ACTORS } from '../../data/actorsData';
import { DEMO_HYPOTHESES, DEMO_EVIDENCE, DEMO_ANALYSES } from '../../data/analysisData';
import { LOT20_DEMO_PROVENANCES } from '../../data/auditDemoData';

// Modular Components
import { SituationKpiBar } from '../situation/SituationKpiBar';
import { SituationFiltersBar, SituationFilterValues } from '../situation/SituationFiltersBar';
import { SituationTimeline } from '../situation/SituationTimeline';
import { SituationMapTab } from '../situation/SituationMapTab';
import { SituationAnalyticalEvaluation } from '../situation/SituationAnalyticalEvaluation';
import { SituationEntitiesGrid } from '../situation/SituationEntitiesGrid';
import { SituationAuditTab } from '../situation/SituationAuditTab';
import { CaseDetailModal } from '../modals/CaseDetailModal';

const DEFAULT_FILTERS: SituationFilterValues = {
  searchQuery: '',
  period: 'all',
  countryCode: 'ALL',
  category: 'ALL',
  priority: 'ALL',
  confidence: 'ALL',
  status: 'ALL',
  demoFilter: 'ALL',
  objectType: 'ALL',
};

export const SituationCenterScreen: React.FC = () => {
  // Situations
  const [situations, setSituations] = useState<OsintSituation[]>([]);
  const [activeSituationId, setActiveSituationId] = useState<string>('sit-001');
  const [rawEvents, setRawEvents] = useState<OsintEvent[]>(DEMO_OSINT_EVENTS);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MAP' | 'TIMELINE' | 'EVALUATION' | 'AUDIT'>('OVERVIEW');

  // Filters State
  const [filters, setFilters] = useState<SituationFilterValues>(DEFAULT_FILTERS);

  // Modal inspection of Case LOT 27
  const [selectedCaseModal, setSelectedCaseModal] = useState<OsintCase | null>(null);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);

  // Status edit modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<OsintSituation['status']>('ACTIVE');
  const [statusJustification, setStatusJustification] = useState('');

  // Create situation modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSituationTitle, setNewSituationTitle] = useState('');
  const [newSituationDesc, setNewSituationDesc] = useState('');
  const [newSituationCountry, setNewSituationCountry] = useState('ML');

  // Load Situations and Events
  useEffect(() => {
    const list = SituationCenterService.getAllSituations();
    if (list.length === 0) {
      mockSituations.forEach((s) => SituationCenterService.saveSituation(s));
      setSituations(mockSituations);
      setActiveSituationId(mockSituations[0]?.id || 'sit-001');
    } else {
      setSituations(list);
      if (!list.some((s) => s.id === activeSituationId)) {
        setActiveSituationId(list[0]?.id || 'sit-001');
      }
    }

    // Load events from repository
    osintRepository.getEvents().then((repoEvents) => {
      const combined = [...repoEvents, ...DEMO_OSINT_EVENTS];
      const map = new Map<string, OsintEvent>();
      combined.forEach((e) => {
        if (!map.has(e.id)) map.set(e.id, e);
      });
      setRawEvents(Array.from(map.values()));
    }).catch(() => {
      setRawEvents(DEMO_OSINT_EVENTS);
    });
  }, []);

  const activeSituation = useMemo(() => {
    return situations.find((s) => s.id === activeSituationId) || situations[0] || mockSituations[0];
  }, [situations, activeSituationId]);

  // Available countries
  const countries = useMemo(() => {
    return ALL_COUNTRIES || [];
  }, []);

  // Available categories
  const availableCategories = useMemo(() => {
    return [
      'Sécurité',
      'Politique',
      'Maritime',
      'Économie',
      'Humanitaire',
      'Infrastructures',
      'Désinformation',
      'Ressources Naturelles',
    ];
  }, []);

  // ALL RAW DATA FROM LOTS 15-27
  const rawAlerts = useMemo(() => {
    const alerts = alertService.getAllAlerts();
    return alerts.length > 0 ? alerts : INITIAL_DEMO_ALERTS;
  }, []);

  const rawSignals = useMemo(() => {
    const signals = weakSignalService.getWeakSignals(true);
    return signals.length > 0 ? signals : INITIAL_DEMO_WEAK_SIGNALS;
  }, []);

  const rawCorrelations = useMemo(() => {
    return [...INITIAL_DEMO_CORRELATIONS, ...DEMO_CORRELATIONS];
  }, []);

  const rawAnomalies = useMemo(() => {
    const anos = anomalyDetectionService.getAnomalies();
    return anos.length > 0 ? anos : INITIAL_DEMO_ANOMALIES;
  }, []);

  const rawIndicators = useMemo(() => {
    const inds = indicatorService.getIndicators();
    return inds.length > 0 ? inds : INITIAL_DEMO_INDICATORS;
  }, []);

  const rawActors = useMemo(() => {
    return DEMO_ACTORS;
  }, []);

  const rawHypotheses = useMemo(() => {
    return DEMO_HYPOTHESES;
  }, []);

  const rawEvidence = useMemo(() => {
    return DEMO_EVIDENCE;
  }, []);

  const rawQuestions = useMemo(() => {
    const list: Array<{ id: string; text: string; priority: string; status: string; assignee?: string; date?: string }> = [];
    DEMO_ANALYSES.forEach((a) => {
      if (a.questions) {
        a.questions.forEach((q) => {
          list.push({
            id: q.id,
            text: q.question,
            priority: (q as any).priority || 'MEDIUM',
            status: q.status || 'OPEN',
            assignee: (q as any).assignedTo,
            date: a.createdAt,
          });
        });
      }
    });
    if (list.length === 0) {
      list.push(
        { id: 'q-001', text: 'Quels sont les couloirs logistiques prioritaires empruntés ?', priority: 'HIGH', status: 'OPEN', assignee: 'Analyste Terrain' },
        { id: 'q-002', text: 'Existe-t-il une coordination avérée entre les cellules régionales ?', priority: 'HIGH', status: 'IN_PROGRESS', assignee: 'Cellule Sahel' },
        { id: 'q-003', text: 'Quelle est la part d’amplification artificielle dans la diffusion des narratifs ?', priority: 'MEDIUM', status: 'OPEN', assignee: 'Pôle Cyber' }
      );
    }
    return list;
  }, []);

  const rawIntelligenceGaps = useMemo(() => {
    return [
      {
        id: 'ig-01',
        title: 'Couverture optique basse résolution zone frontière',
        priority: 'HIGH',
        status: 'OPEN',
        description: 'Imagerie optique diurne indisponible lors des épisodes de tempête de sable.',
        missingElements: ['Images radar SAR Sentinel-1 récentes', 'Signalements terrestres vérifiés']
      },
      {
        id: 'ig-02',
        title: 'Traçabilité des transpondeurs AIS dans les rades fluviales',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        description: 'Arrêt récurrent des transpondeurs à proximité des terminaux de transbordement non conventionnés.',
        missingElements: ['Registres portuaires physiques', 'Croisement imagerie thermique']
      }
    ];
  }, []);

  const rawContradictions = useMemo(() => {
    const list = alertService.getContradictions();
    return list.length > 0 ? list : INITIAL_DEMO_CONTRADICTIONS;
  }, []);

  const rawCases = useMemo(() => {
    return CaseManagementService.getCases();
  }, []);

  const rawProvenances = useMemo(() => {
    return LOT20_DEMO_PROVENANCES;
  }, []);

  // FILTERED DATA APPLIED ACCORDING TO SITUATION & GLOBAL FILTERS
  const filteredEvents = useMemo(() => {
    return rawEvents.filter((e) => {
      // Situation match
      if (activeSituation?.eventIds?.length) {
        if (!activeSituation.eventIds.includes(e.id) && !activeSituation.countryIds.includes(e.countryId || '')) {
          // Allow if country match or explicit id
        }
      }
      // Demo Filter
      if (filters.demoFilter === 'REAL' && e.isDemo) return false;
      if (filters.demoFilter === 'DEMO' && !e.isDemo) return false;

      // Country Filter
      if (filters.countryCode !== 'ALL' && (e.countryId !== filters.countryCode && e.country !== filters.countryCode)) {
        return false;
      }
      // Category Filter
      if (filters.category !== 'ALL' && e.category !== filters.category) return false;
      // Search
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const text = `${e.title} ${e.summary || ''} ${e.country || ''} ${e.category || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [rawEvents, activeSituation, filters]);

  const filteredAlerts = useMemo(() => {
    return rawAlerts.filter((a) => {
      // Demo filter
      if (filters.demoFilter === 'REAL' && a.isDemo) return false;
      if (filters.demoFilter === 'DEMO' && !a.isDemo) return false;
      // Priority filter
      if (filters.priority !== 'ALL') {
        const p = a.priority?.toUpperCase();
        if (filters.priority === 'CRITICAL' && !p?.includes('CRITICAL') && !p?.includes('P1')) return false;
        if (filters.priority === 'HIGH' && !p?.includes('HIGH') && !p?.includes('P2')) return false;
        if (filters.priority === 'MEDIUM' && !p?.includes('MEDIUM') && !p?.includes('P3')) return false;
        if (filters.priority === 'LOW' && !p?.includes('LOW') && !p?.includes('P4')) return false;
      }
      // Search
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const text = `${a.title} ${a.summary || ''} ${a.country || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [rawAlerts, filters]);

  const filteredSignals = useMemo(() => {
    return rawSignals.filter((s) => {
      if (filters.demoFilter === 'REAL' && s.isDemo) return false;
      if (filters.demoFilter === 'DEMO' && !s.isDemo) return false;
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const text = `${s.title} ${s.description || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [rawSignals, filters]);

  const filteredCorrelations = useMemo(() => {
    return rawCorrelations.filter((c) => {
      if (filters.demoFilter === 'REAL' && c.isDemo) return false;
      if (filters.demoFilter === 'DEMO' && !c.isDemo) return false;
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const text = `${c.title} ${c.description || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [rawCorrelations, filters]);

  const filteredAnomalies = useMemo(() => {
    return rawAnomalies.filter((ano) => {
      if (filters.demoFilter === 'REAL' && ano.isDemo) return false;
      if (filters.demoFilter === 'DEMO' && !ano.isDemo) return false;
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const text = `${ano.type} ${ano.description || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [rawAnomalies, filters]);

  const filteredIndicators = useMemo(() => {
    return rawIndicators.filter((i) => {
      if (filters.demoFilter === 'REAL' && i.isDemo) return false;
      if (filters.demoFilter === 'DEMO' && !i.isDemo) return false;
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const text = `${i.name} ${i.description || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [rawIndicators, filters]);

  const filteredActors = useMemo(() => {
    return rawActors.filter((act) => {
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const text = `${act.name} ${act.type || ''} ${act.country || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [rawActors, filters]);

  const filteredCases = useMemo(() => {
    return rawCases.filter((c) => {
      if (filters.demoFilter === 'REAL' && c.isDemo) return false;
      if (filters.demoFilter === 'DEMO' && !c.isDemo) return false;
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const text = `${c.title} ${c.description || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [rawCases, filters]);

  // Audits of active situation
  const situationAudits = useMemo(() => {
    return SituationCenterService.getAudits(activeSituation.id);
  }, [activeSituation.id, situations]);

  // Export JSON handler
  const handleExportJson = () => {
    const contextData = {
      filteredCounts: {
        events: filteredEvents.length,
        alerts: filteredAlerts.length,
        signals: filteredSignals.length,
        correlations: filteredCorrelations.length,
        anomalies: filteredAnomalies.length,
        indicators: filteredIndicators.length,
        actors: filteredActors.length,
        cases: filteredCases.length,
      },
      events: filteredEvents,
      alerts: filteredAlerts,
      signals: filteredSignals,
      correlations: filteredCorrelations,
      anomalies: filteredAnomalies,
      indicators: filteredIndicators,
      hypotheses: rawHypotheses,
      evidence: rawEvidence,
      questions: rawQuestions,
      intelligenceGaps: rawIntelligenceGaps,
      contradictions: rawContradictions,
      cases: filteredCases,
      appliedFilters: filters,
    };

    const jsonStr = SituationCenterService.exportSituationJson(activeSituation, contextData);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OSINT_SITUATION_${activeSituation.id}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Refresh situations to see audit entry
    setSituations(SituationCenterService.getAllSituations());
  };

  // Status update
  const handleConfirmStatusChange = () => {
    if (!statusJustification.trim()) {
      alert('Une justification de l’analyste est requise pour modifier le statut opérationnel.');
      return;
    }
    const updated = {
      ...activeSituation,
      status: statusToUpdate,
    };
    SituationCenterService.saveSituation(
      updated,
      'Analyste Chef de Quart',
      `Changement de statut vers ${statusToUpdate} : ${statusJustification}`
    );
    setSituations(SituationCenterService.getAllSituations());
    setIsStatusModalOpen(false);
    setStatusJustification('');
  };

  // Save analytical evaluation
  const handleSaveEvaluation = (updated: {
    assessment: string;
    conclusion: string;
    analystNote: string;
    confidence: OsintSituation['confidence'];
  }) => {
    const newSit: OsintSituation = {
      ...activeSituation,
      assessment: updated.assessment,
      conclusion: updated.conclusion,
      analystNote: updated.analystNote,
      confidence: updated.confidence,
    };
    SituationCenterService.saveSituation(
      newSit,
      'Analyste Référent',
      'Mise à jour formelle de l’évaluation analytique humaine'
    );
    setSituations(SituationCenterService.getAllSituations());
  };

  // Create situation
  const handleCreateSituation = () => {
    if (!newSituationTitle.trim()) return;
    const created: OsintSituation = {
      id: `sit-${Date.now()}`,
      title: newSituationTitle,
      description: newSituationDesc || 'Situation créée par l’analyste.',
      status: 'ACTIVE',
      priority: 'HIGH',
      confidence: 'MOYENNE',
      countryIds: [newSituationCountry],
      regionIds: ['Afrique de l’Ouest'],
      eventIds: [],
      alertIds: [],
      weakSignalIds: [],
      correlationIds: [],
      anomalyIds: [],
      indicatorIds: [],
      actorIds: [],
      evidenceIds: [],
      hypothesisIds: [],
      questionIds: [],
      intelligenceGapIds: [],
      caseIds: [],
      reportIds: [],
      startDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      assessment: '',
      analystNote: 'Nouvelle cellule de veille ouverte.',
      conclusion: '',
      isDemo: true,
      provenance: 'Poste de Commandement OSINT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    SituationCenterService.saveSituation(created, 'Analyste Opérateur', 'Création d’une nouvelle situation');
    const updatedList = SituationCenterService.getAllSituations();
    setSituations(updatedList);
    setActiveSituationId(created.id);
    setIsCreateModalOpen(false);
    setNewSituationTitle('');
    setNewSituationDesc('');
  };

  // Open case modal
  const handleOpenCaseModal = (caseId: string) => {
    const targetCase = CaseManagementService.getCase(caseId) || rawCases.find((c) => c.id === caseId);
    if (targetCase) {
      setSelectedCaseModal(targetCase);
      setIsCaseModalOpen(true);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-24 text-slate-200">
      {/* ======================================================== */}
      {/* 1. ENTÊTE OPÉRATIONNELLE DU CENTRE DE SITUATION */}
      {/* ======================================================== */}
      <header className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Centre Opérationnel Actif • LOT 28
              </span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                  activeSituation.isDemo
                    ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                    : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                }`}
              >
                {activeSituation.isDemo ? 'Environnement Démonstration' : 'Environnement Réel'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              CENTRE DE SITUATION OPÉRATIONNELLE OSINT
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Agrégation continue multi-sources des faits, signaux faibles, alertes qualifiées, corrélations et dossiers d’investigation (LOTS 15 à 27).
            </p>
          </div>

          {/* Actions globales : Export JSON & Nouvelle Situation */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setStatusToUpdate(activeSituation.status);
                setIsStatusModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition"
              title="Changer le statut opérationnel de la situation"
            >
              <Edit className="w-3.5 h-3.5 text-sky-400" />
              <span>Statut : {activeSituation.status}</span>
            </button>

            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-md transition"
              title="Exporter les données consolidées en JSON local"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter JSON</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouvelle Situation</span>
            </button>
          </div>
        </div>

        {/* Sélecteur de situations sous forme d'onglets de surveillance */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/60 scrollbar-thin">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap mr-1">
            Situations :
          </span>
          {situations.map((sit) => {
            const isActive = sit.id === activeSituation.id;
            return (
              <button
                key={sit.id}
                onClick={() => setActiveSituationId(sit.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                  isActive
                    ? 'bg-sky-600 border-sky-500 text-white shadow-md'
                    : 'bg-[#131926] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{sit.title}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    isActive ? 'bg-sky-800 text-sky-200' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {sit.status}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. BARRE DES FILTRES MULTI-CRITÈRES */}
      {/* ======================================================== */}
      <SituationFiltersBar
        filters={filters}
        countries={countries}
        availableCategories={availableCategories}
        onChange={(upd) => setFilters((prev) => ({ ...prev, ...upd }))}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {/* ======================================================== */}
      {/* 3. BARRE DES KPIS DYNAMIQUES & RAPPELS DOCTRINAUX */}
      {/* ======================================================== */}
      <SituationKpiBar
        eventCount={filteredEvents.length}
        alertCount={filteredAlerts.length}
        criticalAlertCount={filteredAlerts.filter((a) => a.priority === 'P1_CRITICAL' || a.priority === 'CRITICAL').length}
        weakSignalCount={filteredSignals.length}
        correlationCount={filteredCorrelations.length}
        anomalyCount={filteredAnomalies.length}
        indicatorCount={filteredIndicators.length}
        activeCaseCount={filteredCases.length}
        actorCount={filteredActors.length}
      />

      {/* ======================================================== */}
      {/* 4. NAVIGATION ENTRE LES VUES PRINCIPALES */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'OVERVIEW'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Vue Synthèse (12 Briques)</span>
        </button>

        <button
          onClick={() => setActiveTab('MAP')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'MAP'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Cartographie de Situation</span>
        </button>

        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'TIMELINE'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Chronologie Temporelle</span>
        </button>

        <button
          onClick={() => setActiveTab('EVALUATION')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'EVALUATION'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Évaluation Analytique Humaine</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'AUDIT'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Traçabilité & Audit ({situationAudits.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 5. VUES PRINCIPALES CONDITIONNELLES */}
      {/* ======================================================== */}

      {/* VUE 1 : VUE D'ENSEMBLE & 12 BRIQUES */}
      {activeTab === 'OVERVIEW' && (
        <SituationEntitiesGrid
          events={filteredEvents}
          alerts={filteredAlerts}
          weakSignals={filteredSignals}
          correlations={filteredCorrelations}
          anomalies={filteredAnomalies}
          indicators={filteredIndicators}
          actors={filteredActors}
          hypotheses={rawHypotheses}
          evidence={rawEvidence}
          questions={rawQuestions}
          intelligenceGaps={rawIntelligenceGaps}
          contradictions={rawContradictions}
          cases={filteredCases}
          onOpenCaseModal={handleOpenCaseModal}
          onSelectEvent={(id) => {
            // Basculer vers timeline ou focus
            setActiveTab('TIMELINE');
          }}
        />
      )}

      {/* VUE 2 : CARTOGRAPHIE */}
      {activeTab === 'MAP' && (
        <SituationMapTab
          countries={countries}
          events={filteredEvents}
          activeCountryCodes={activeSituation.countryIds}
          onSelectCountry={(code) => setFilters((prev) => ({ ...prev, countryCode: code }))}
        />
      )}

      {/* VUE 3 : CHRONOLOGIE */}
      {activeTab === 'TIMELINE' && (
        <SituationTimeline
          events={filteredEvents}
          alerts={filteredAlerts}
          weakSignals={filteredSignals}
          correlations={filteredCorrelations}
          anomalies={filteredAnomalies}
        />
      )}

      {/* VUE 4 : ÉVALUATION ANALYTIQUE HUMAINE */}
      {activeTab === 'EVALUATION' && (
        <SituationAnalyticalEvaluation
          situation={activeSituation}
          onSaveEvaluation={handleSaveEvaluation}
        />
      )}

      {/* VUE 5 : AUDIT & PROVENANCE */}
      {activeTab === 'AUDIT' && (
        <SituationAuditTab
          audits={situationAudits}
          provenances={rawProvenances}
          currentSituationTitle={activeSituation.title}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL : INSPECTION COMPLÈTE DOSSIER LOT 27 */}
      {/* ======================================================== */}
      {selectedCaseModal && (
        <CaseDetailModal
          osintCase={selectedCaseModal}
          isOpen={isCaseModalOpen}
          onClose={() => {
            setIsCaseModalOpen(false);
            setSelectedCaseModal(null);
          }}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL : CHANGEMENT DE STATUT AVEC JUSTIFICATION HUMAINE */}
      {/* ======================================================== */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-sky-400" />
                Changement de Statut Opérationnel
              </h3>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nouveau statut opérationnel
                </label>
                <select
                  value={statusToUpdate}
                  onChange={(e) => setStatusToUpdate(e.target.value as any)}
                  className="w-full bg-[#131926] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="UNDER_REVIEW">EN EXAMEN</option>
                  <option value="STABLE">STABLE</option>
                  <option value="EVOLVING">EN ÉVOLUTION</option>
                  <option value="CLOSED">CLÔTURÉE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Justification opérationnelle obligatoire
                </label>
                <textarea
                  rows={3}
                  value={statusJustification}
                  onChange={(e) => setStatusJustification(e.target.value)}
                  placeholder="Expliquez la raison du changement de statut pour le journal d'audit..."
                  className="w-full bg-[#131926] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Valider le changement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL : CRÉATION D'UNE NOUVELLE SITUATION */}
      {/* ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-400" />
                Créer une Nouvelle Situation Opérationnelle
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Intitulé de la situation
                </label>
                <input
                  type="text"
                  value={newSituationTitle}
                  onChange={(e) => setNewSituationTitle(e.target.value)}
                  placeholder="ex: Surveillance Axe Fluvial Niger Central"
                  className="w-full bg-[#131926] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pays principal ciblé
                </label>
                <select
                  value={newSituationCountry}
                  onChange={(e) => setNewSituationCountry(e.target.value)}
                  className="w-full bg-[#131926] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  {countries.map((c) => (
                    <option key={c.code || c.id} value={c.code || c.id}>
                      {c.name} ({c.code || c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description & Objectif de veille
                </label>
                <textarea
                  rows={3}
                  value={newSituationDesc}
                  onChange={(e) => setNewSituationDesc(e.target.value)}
                  placeholder="Objectif opérationnel et périmètre de veille..."
                  className="w-full bg-[#131926] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateSituation}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Créer la Situation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

