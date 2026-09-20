/**
 * OSINT AFRICA — LOT 37
 * Centre d'Évaluation Analytique et de Raisonnement Structuré
 *
 * Écran d'exploitation analytique souveraine :
 * - 12 Onglets :
 *   1. Vue d'ensemble
 *   2. Appréciations
 *   3. Hypothèses
 *   4. Alternatives
 *   5. Arguments
 *   6. Assomptions
 *   7. Discriminants
 *   8. Contradictions
 *   9. Lacunes
 *   10. Décisions
 *   11. Traçabilité
 *   12. Audit
 * - 12 Principes doctrinaux d'aide à la décision
 * - Distinction stricte : Hypothèse ≠ Fait ; Favorable ≠ Preuve ; Absence ≠ Preuve d'absence
 * - Préservation des contradictions sans arbitrage automatique
 * - Zéro probabilité de vérité inventée ; indicateur d'exhaustivité documentaire
 * - 0 nouvelle connexion réseau ; fonctionnement en chambre sourde locale
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Brain,
  Scale,
  GitFork,
  HelpCircle,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  Shield,
  Download,
  RefreshCw,
  Plus,
  X,
  ArrowRight,
  Filter,
  Check,
  Activity,
  Info,
  ChevronRight,
  AlertCircle,
  Archive,
  Eye,
  Calendar,
  User,
  GitCommit,
  Split,
  Layers,
  Compass,
  FileSearch,
  Key,
  ShieldAlert,
  Search
} from 'lucide-react';
import {
  OsintAnalyticalAssessment,
  OsintAnalyticalAssessmentStatus,
  OsintAnalyticalAssessmentLevel,
  OsintAnalyticalConfidenceLevel,
  OsintAnalyticalHypothesis,
  OsintAnalyticalHypothesisType,
  OsintAnalyticalHypothesisStatus,
  OsintAnalyticalAlternative,
  OsintAnalyticalArgument,
  OsintAnalyticalArgumentType,
  OsintAnalyticalAssumption,
  OsintAnalyticalAssumptionStatus,
  OsintAnalyticalDiscriminant,
  OsintAnalyticalDiscriminantStatus,
  OsintAnalyticalGap,
  OsintAnalyticalGapStatus,
  OsintAnalyticalDecision,
  OsintAnalyticalDecisionType,
  OsintAnalyticalAudit,
  OsintAnalyticalTraceabilityNode
} from '../../types';
import {
  analyticalAssessmentService,
  ANALYTICAL_DOCTRINAL_PRINCIPLES
} from '../../services/analyticalAssessmentService';

type TabId =
  | 'overview'
  | 'assessments'
  | 'hypotheses'
  | 'alternatives'
  | 'arguments'
  | 'assumptions'
  | 'discriminants'
  | 'contradictions'
  | 'gaps'
  | 'decisions'
  | 'traceability'
  | 'audit';

export const AnalyticalAssessmentCenterScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isDemoFilter, setIsDemoFilter] = useState<'ALL' | 'REAL' | 'DEMO'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('ASSESS-2026-001');
  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string | null>(null);

  // Données réactives
  const [assessments, setAssessments] = useState<OsintAnalyticalAssessment[]>([]);
  const [hypotheses, setHypotheses] = useState<OsintAnalyticalHypothesis[]>([]);
  const [alternatives, setAlternatives] = useState<OsintAnalyticalAlternative[]>([]);
  const [argumentsList, setArgumentsList] = useState<OsintAnalyticalArgument[]>([]);
  const [assumptions, setAssumptions] = useState<OsintAnalyticalAssumption[]>([]);
  const [discriminants, setDiscriminants] = useState<OsintAnalyticalDiscriminant[]>([]);
  const [gaps, setGaps] = useState<OsintAnalyticalGap[]>([]);
  const [decisions, setDecisions] = useState<OsintAnalyticalDecision[]>([]);
  const [auditLogs, setAuditLogs] = useState<OsintAnalyticalAudit[]>([]);

  // Modals
  const [showNewAssessmentModal, setShowNewAssessmentModal] = useState(false);
  const [showNewHypothesisModal, setShowNewHypothesisModal] = useState(false);
  const [showNewArgumentModal, setShowNewArgumentModal] = useState(false);
  const [showNewAssumptionModal, setShowNewAssumptionModal] = useState(false);
  const [showNewDiscriminantModal, setShowNewDiscriminantModal] = useState(false);
  const [showNewGapModal, setShowNewGapModal] = useState(false);
  const [showNewDecisionModal, setShowNewDecisionModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState<OsintAnalyticalAssessmentStatus>('EN_EXAMEN');
  const [statusJustification, setStatusJustification] = useState('');
  const [statusError, setStatusError] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');

  // Form states
  const [newAssessForm, setNewAssessForm] = useState({
    title: '',
    objective: '',
    requirementId: 'REQ-2026-001',
    questionId: 'Q-REQ-001',
    verificationCaseIds: 'VERIF-CASE-2026-001',
    assessmentLevel: 'MODERE' as OsintAnalyticalAssessmentLevel,
    confidenceLevel: 'MOYENNE' as OsintAnalyticalConfidenceLevel,
    assessmentText: ''
  });

  const [newHypoForm, setNewHypoForm] = useState({
    statement: '',
    type: 'EXPLICATIVE' as OsintAnalyticalHypothesisType,
    rationale: '',
    confidenceLevel: 'MOYENNE' as OsintAnalyticalConfidenceLevel
  });

  const [newArgForm, setNewArgForm] = useState({
    hypothesisId: '',
    type: 'SUPPORT' as OsintAnalyticalArgumentType,
    statement: '',
    strength: 'MOYEN' as 'FAIBLE' | 'MOYEN' | 'FORT' | 'DECISIF',
    sourceIds: 'SRC-001'
  });

  const [newAssumpForm, setNewAssumpForm] = useState({
    statement: '',
    basis: '',
    riskLevel: 'MODERE' as 'FAIBLE' | 'MODERE' | 'ELEVE' | 'CRITIQUE',
    validationStatus: 'NON_VERIFIEE' as OsintAnalyticalAssumptionStatus
  });

  const [newDiscForm, setNewDiscForm] = useState({
    question: '',
    expectedObservation: '',
    meaningIfObserved: '',
    meaningIfAbsent: '',
    sourceIds: 'SRC-001'
  });

  const [newGapForm, setNewGapForm] = useState({
    description: '',
    impact: 'MAJEUR' as 'FAIBLE' | 'MODERE' | 'MAJEUR' | 'BLOQUANT',
    priority: 'HAUTE' as 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE'
  });

  const [newDecForm, setNewDecForm] = useState({
    decision: 'APPRECIATION_AVEC_RESERVES' as OsintAnalyticalDecisionType,
    rationale: '',
    approvedBy: 'ANALYSTE-SUPERVISEUR'
  });

  const refreshData = () => {
    const d = isDemoFilter === 'ALL' ? undefined : isDemoFilter === 'DEMO';
    setAssessments(analyticalAssessmentService.listAssessments(d));
    setHypotheses(analyticalAssessmentService.listHypotheses(undefined, d));
    setAlternatives(analyticalAssessmentService.listAlternatives(undefined, d));
    setArgumentsList(analyticalAssessmentService.listArguments(undefined, undefined, d));
    setAssumptions(analyticalAssessmentService.listAssumptions(undefined, d));
    setDiscriminants(analyticalAssessmentService.listDiscriminants(undefined, d));
    setGaps(analyticalAssessmentService.listAnalyticalGaps(undefined, d));
    setDecisions(analyticalAssessmentService.listDecisions(undefined, d));
    setAuditLogs(analyticalAssessmentService.getAuditLogs(d));
  };

  useEffect(() => {
    refreshData();
  }, [isDemoFilter]);

  const selectedAssessment = useMemo(() => {
    return assessments.find(a => a.id === selectedAssessmentId) || assessments[0];
  }, [assessments, selectedAssessmentId]);

  const selectedAssessmentHypotheses = useMemo(() => {
    if (!selectedAssessment) return [];
    return hypotheses.filter(h => h.assessmentId === selectedAssessment.id);
  }, [hypotheses, selectedAssessment]);

  const selectedHypothesisEvaluation = useMemo(() => {
    if (!selectedHypothesisId) return null;
    try {
      return analyticalAssessmentService.evaluateHypothesisSupport(selectedHypothesisId);
    } catch {
      return null;
    }
  }, [selectedHypothesisId, hypotheses, argumentsList, assumptions, discriminants, gaps]);

  const assessmentQuality = useMemo(() => {
    if (!selectedAssessment) return null;
    try {
      return analyticalAssessmentService.calculateAssessmentQuality(selectedAssessment.id);
    } catch {
      return null;
    }
  }, [selectedAssessment, hypotheses, argumentsList, assumptions, discriminants, gaps]);

  const traceabilityData = useMemo(() => {
    if (!selectedAssessment) return { descending: [], ascending: [] };
    return analyticalAssessmentService.getAnalyticalTraceability(selectedAssessment.id);
  }, [selectedAssessment, hypotheses, decisions]);

  // Contradictions conservées pour l'appréciation sélectionnée
  const preservedContradictions = useMemo(() => {
    if (!selectedAssessment) return [];
    const list: any[] = [];
    selectedAssessmentHypotheses.forEach(h => {
      const contras = analyticalAssessmentService.evaluateHypothesisContradictions(h.id);
      list.push(...contras);
    });
    // Ajouter celles renseignées dans l'appréciation
    selectedAssessment.unresolvedContradictions.forEach((text, i) => {
      list.push({
        id: `CTRL-CONTRA-${i + 1}`,
        description: text,
        status: 'NON_RESOLUE_CONSERVEE',
        nature: 'DIVERGENCE_FACTUELLE'
      });
    });
    return list;
  }, [selectedAssessment, selectedAssessmentHypotheses]);

  const handleExportJson = () => {
    const jsonStr = analyticalAssessmentService.exportAnalyticalAssessmentJson(isDemoFilter);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OSINT_AFRICA_LOT37_EVALUATION_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    refreshData();
  };

  const handleStatusChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError('');
    setStatusSuccess('');
    if (!selectedAssessment) return;
    try {
      analyticalAssessmentService.changeAssessmentStatus(
        selectedAssessment.id,
        statusTarget,
        statusJustification,
        'ANALYSTE-SUPERVISEUR'
      );
      setStatusSuccess(`Statut mis à jour avec succès vers ${statusTarget}.`);
      refreshData();
      setTimeout(() => {
        setShowStatusModal(false);
        setStatusSuccess('');
        setStatusJustification('');
      }, 900);
    } catch (err: any) {
      setStatusError(err.message || 'Erreur lors du changement de statut.');
    }
  };

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const vCaseIds = newAssessForm.verificationCaseIds.split(',').map(s => s.trim()).filter(Boolean);
      const created = analyticalAssessmentService.createAssessment(
        {
          title: newAssessForm.title,
          objective: newAssessForm.objective,
          requirementId: newAssessForm.requirementId,
          questionId: newAssessForm.questionId,
          verificationCaseIds: vCaseIds,
          assessmentLevel: newAssessForm.assessmentLevel,
          confidenceLevel: newAssessForm.confidenceLevel,
          assessmentText: newAssessForm.assessmentText,
          isDemo: isDemoFilter === 'DEMO'
        },
        'ANALYSTE-SENIOR'
      );
      setSelectedAssessmentId(created.id);
      setShowNewAssessmentModal(false);
      refreshData();
    } catch (err: any) {
      alert(`Erreur création appréciation : ${err.message}`);
    }
  };

  const handleCreateHypothesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment) return;
    try {
      analyticalAssessmentService.createHypothesis(
        {
          assessmentId: selectedAssessment.id,
          statement: newHypoForm.statement,
          type: newHypoForm.type,
          rationale: newHypoForm.rationale,
          confidenceLevel: newHypoForm.confidenceLevel,
          isDemo: selectedAssessment.isDemo
        },
        'ANALYSTE-RESPONSABLE'
      );
      setShowNewHypothesisModal(false);
      setNewHypoForm({
        statement: '',
        type: 'EXPLICATIVE',
        rationale: '',
        confidenceLevel: 'MOYENNE'
      });
      refreshData();
    } catch (err: any) {
      alert(`Erreur création hypothèse : ${err.message}`);
    }
  };

  const handleCreateArgument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment) return;
    const hypId = newArgForm.hypothesisId || (selectedAssessmentHypotheses[0] ? selectedAssessmentHypotheses[0].id : '');
    if (!hypId) {
      alert("Veuillez d'abord créer au moins une hypothèse.");
      return;
    }
    try {
      const sIds = newArgForm.sourceIds.split(',').map(s => s.trim()).filter(Boolean);
      analyticalAssessmentService.createArgument(
        {
          assessmentId: selectedAssessment.id,
          hypothesisId: hypId,
          type: newArgForm.type,
          statement: newArgForm.statement,
          strength: newArgForm.strength,
          sourceIds: sIds,
          isDemo: selectedAssessment.isDemo
        },
        'ANALYSTE-RESPONSABLE'
      );
      setShowNewArgumentModal(false);
      setNewArgForm({
        hypothesisId: '',
        type: 'SUPPORT',
        statement: '',
        strength: 'MOYEN',
        sourceIds: 'SRC-001'
      });
      refreshData();
    } catch (err: any) {
      alert(`Erreur création argument : ${err.message}`);
    }
  };

  const handleCreateAssumption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment) return;
    try {
      analyticalAssessmentService.createAssumption(
        {
          assessmentId: selectedAssessment.id,
          statement: newAssumpForm.statement,
          basis: newAssumpForm.basis,
          riskLevel: newAssumpForm.riskLevel,
          validationStatus: newAssumpForm.validationStatus,
          isDemo: selectedAssessment.isDemo
        },
        'ANALYSTE-RESPONSABLE'
      );
      setShowNewAssumptionModal(false);
      setNewAssumpForm({
        statement: '',
        basis: '',
        riskLevel: 'MODERE',
        validationStatus: 'NON_VERIFIEE'
      });
      refreshData();
    } catch (err: any) {
      alert(`Erreur création assomption : ${err.message}`);
    }
  };

  const handleCreateDiscriminant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment) return;
    try {
      const hypIds = selectedAssessmentHypotheses.slice(0, 2).map(h => h.id);
      const sIds = newDiscForm.sourceIds.split(',').map(s => s.trim()).filter(Boolean);
      analyticalAssessmentService.createDiscriminant(
        {
          assessmentId: selectedAssessment.id,
          hypothesisIds: hypIds,
          question: newDiscForm.question,
          expectedObservation: newDiscForm.expectedObservation,
          meaningIfObserved: newDiscForm.meaningIfObserved,
          meaningIfAbsent: newDiscForm.meaningIfAbsent,
          sourceIds: sIds,
          isDemo: selectedAssessment.isDemo
        },
        'ANALYSTE-RESPONSABLE'
      );
      setShowNewDiscriminantModal(false);
      setNewDiscForm({
        question: '',
        expectedObservation: '',
        meaningIfObserved: '',
        meaningIfAbsent: '',
        sourceIds: 'SRC-001'
      });
      refreshData();
    } catch (err: any) {
      alert(`Erreur création discriminant : ${err.message}`);
    }
  };

  const handleCreateGap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment) return;
    try {
      analyticalAssessmentService.createAnalyticalGap(
        {
          assessmentId: selectedAssessment.id,
          description: newGapForm.description,
          impact: newGapForm.impact,
          priority: newGapForm.priority,
          isDemo: selectedAssessment.isDemo
        },
        'ANALYSTE-RESPONSABLE'
      );
      setShowNewGapModal(false);
      setNewGapForm({
        description: '',
        impact: 'MAJEUR',
        priority: 'HAUTE'
      });
      refreshData();
    } catch (err: any) {
      alert(`Erreur création lacune : ${err.message}`);
    }
  };

  const handleCreateDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment) return;
    try {
      analyticalAssessmentService.createDecision(
        {
          assessmentId: selectedAssessment.id,
          decision: newDecForm.decision,
          rationale: newDecForm.rationale,
          approvedBy: newDecForm.approvedBy,
          isHumanDecision: true,
          isDemo: selectedAssessment.isDemo
        },
        newDecForm.approvedBy
      );
      setShowNewDecisionModal(false);
      setNewDecForm({
        decision: 'APPRECIATION_AVEC_RESERVES',
        rationale: '',
        approvedBy: 'ANALYSTE-SUPERVISEUR'
      });
      refreshData();
    } catch (err: any) {
      alert(`Erreur validation décision humaine : ${err.message}`);
    }
  };

  // Rendu de l'arbre de traçabilité récursif
  const renderTraceabilityTree = (node: OsintAnalyticalTraceabilityNode, depth: number = 0) => {
    const isBreak = node.type === 'RUPTURE_LIEN';
    return (
      <div key={`${node.type}-${node.id}-${depth}`} className="ml-4 pl-3 border-l-2 border-slate-700/60 my-2">
        <div
          className={`flex items-start gap-3 p-3 rounded-lg border text-xs sm:text-sm ${
            isBreak
              ? 'bg-rose-950/40 border-rose-600/60 text-rose-200'
              : node.type === 'DECISION'
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : node.type === 'ASSESSMENT'
              ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200'
              : node.type === 'HYPOTHESIS'
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
              : 'bg-slate-800/60 border-slate-700 text-slate-200'
          }`}
        >
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase font-bold shrink-0 ${
              isBreak
                ? 'bg-rose-600 text-white'
                : node.type === 'DECISION'
                ? 'bg-emerald-600 text-white'
                : node.type === 'ASSESSMENT'
                ? 'bg-indigo-600 text-white'
                : node.type === 'HYPOTHESIS'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-200'
            }`}
          >
            {node.type}
          </span>
          <div className="flex-1">
            <div className="font-semibold">{node.label}</div>
            <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-2 items-center">
              <span>ID: <span className="font-mono text-slate-300">{node.id}</span></span>
              <span>• Statut: <span className="font-mono text-amber-300">{node.status}</span></span>
              {node.details && <span>• {node.details}</span>}
            </div>
          </div>
        </div>
        {node.children && node.children.map(child => renderTraceabilityTree(child, depth + 1))}
      </div>
    );
  };

  return (
    <div id="analytical-assessment-center" className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      {/* HEADER PRINCIPAL */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Centre d'Évaluation Analytique et de Raisonnement Structuré
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  LOT 37
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Examen méthodique, différenciation hypothèse / preuve, traitement des contradictions et validation humaine.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Filtre Démo / Réel */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs">
            <button
              id="filter-all-btn"
              onClick={() => setIsDemoFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                isDemoFilter === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tous ({assessments.length})
            </button>
            <button
              id="filter-real-btn"
              onClick={() => setIsDemoFilter('REAL')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                isDemoFilter === 'REAL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Réel
            </button>
            <button
              id="filter-demo-btn"
              onClick={() => setIsDemoFilter('DEMO')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                isDemoFilter === 'DEMO' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Démo
            </button>
          </div>

          <button
            id="export-json-btn"
            onClick={handleExportJson}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
            title="Export JSON souverain (0 appel réseau)"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            Export JSON
          </button>

          <button
            id="new-assessment-btn"
            onClick={() => setShowNewAssessmentModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Appréciation
          </button>
        </div>
      </header>

      {/* BANDEAU SÉLECTION APPRÉCIATION COURANTE */}
      {selectedAssessment && (
        <section className="mb-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                {selectedAssessment.id}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                Besoin: {selectedAssessment.requirementId}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                Question: {selectedAssessment.questionId}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  selectedAssessment.status === 'VALIDEE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : selectedAssessment.status === 'ARCHIVEE'
                    ? 'bg-slate-800 text-slate-400 border border-slate-700'
                    : selectedAssessment.status === 'EN_ARBITRAGE'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {selectedAssessment.status}
              </span>
              {selectedAssessment.isDemo && (
                <span className="text-[11px] px-2 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded">
                  Mode Démo
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {selectedAssessment.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2">
              {selectedAssessment.objective}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedAssessment.status !== 'ARCHIVEE' && (
              <button
                id="change-status-btn"
                onClick={() => {
                  setStatusTarget('EN_EXAMEN');
                  setShowStatusModal(true);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
              >
                Changer statut
              </button>
            )}
            <button
              id="decide-assessment-btn"
              onClick={() => setShowNewDecisionModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Consigner Décision
            </button>
          </div>
        </section>
      )}

      {/* NAVIGATION ONGLET (12 ONGLETS MINIMUM) */}
      <nav className="mb-6 flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 text-xs sm:text-sm">
        {[
          { id: 'overview', label: "Vue d'ensemble", icon: Activity, count: null },
          { id: 'assessments', label: 'Appréciations', icon: FileText, count: assessments.length },
          { id: 'hypotheses', label: 'Hypothèses', icon: GitFork, count: hypotheses.length },
          { id: 'alternatives', label: 'Alternatives', icon: Split, count: alternatives.length },
          { id: 'arguments', label: 'Arguments', icon: Scale, count: argumentsList.length },
          { id: 'assumptions', label: 'Assomptions', icon: AlertTriangle, count: assumptions.length },
          { id: 'discriminants', label: 'Discriminants', icon: Compass, count: discriminants.length },
          { id: 'contradictions', label: 'Contradictions', icon: ShieldAlert, count: preservedContradictions.length },
          { id: 'gaps', label: 'Lacunes', icon: HelpCircle, count: gaps.length },
          { id: 'decisions', label: 'Décisions', icon: CheckCircle2, count: decisions.length },
          { id: 'traceability', label: 'Traçabilité', icon: Layers, count: null },
          { id: 'audit', label: 'Audit', icon: Clock, count: auditLogs.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* CONTENU DES ONGLETS */}

      {/* 1. VUE D'ENSEMBLE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Appréciations</div>
              <div className="text-2xl font-bold text-white mt-1">{assessments.length}</div>
              <div className="text-[11px] text-amber-400 mt-1">Actives / Examen</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Hypothèses</div>
              <div className="text-2xl font-bold text-white mt-1">{hypotheses.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">Scénarios concurrents</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Arguments</div>
              <div className="text-2xl font-bold text-white mt-1">{argumentsList.length}</div>
              <div className="text-[11px] text-emerald-400 mt-1">
                {argumentsList.filter(a => a.type === 'SUPPORT').length} favorables / {argumentsList.filter(a => a.type === 'CONTRADICTION').length} défavorables
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Assomptions</div>
              <div className="text-2xl font-bold text-white mt-1">{assumptions.length}</div>
              <div className="text-[11px] text-amber-400 mt-1">
                {assumptions.filter(a => a.validationStatus === 'NON_VERIFIEE').length} non vérifiées
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Contradictions</div>
              <div className="text-2xl font-bold text-white mt-1">{preservedContradictions.length}</div>
              <div className="text-[11px] text-rose-400 mt-1">Conservées sans lissage</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Décisions Humaines</div>
              <div className="text-2xl font-bold text-white mt-1">{decisions.length}</div>
              <div className="text-[11px] text-emerald-400 mt-1">Validées formellement</div>
            </div>
          </div>

          {/* ÉVALUATION QUALITÉ DE L'APPRÉCIATION SÉLECTIONNÉE */}
          {assessmentQuality && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Scale className="w-5 h-5 text-amber-400" />
                    Indicateur d'Exhaustivité Méthodologique de l'Appréciation
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mesure de la rigueur du questionnement contradictoire. Ce score N'EST PAS une probabilité de vérité.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-amber-400">
                      {assessmentQuality.qualityScore} / 100
                    </div>
                    <div className="text-[11px] uppercase font-bold text-slate-300">
                      Niveau : {assessmentQuality.qualityAssessment}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div className={`p-3 rounded-lg border ${assessmentQuality.hasMultipleHypotheses ? 'bg-emerald-950/20 border-emerald-600/40 text-emerald-300' : 'bg-slate-800/40 border-slate-700 text-slate-400'}`}>
                  <div className="font-semibold">Plusieurs hypothèses</div>
                  <div className="mt-1">{assessmentQuality.hasMultipleHypotheses ? 'Examinées (+25)' : 'Manquantes'}</div>
                </div>
                <div className={`p-3 rounded-lg border ${assessmentQuality.hasContradictoryArgumentsExamined ? 'bg-emerald-950/20 border-emerald-600/40 text-emerald-300' : 'bg-slate-800/40 border-slate-700 text-slate-400'}`}>
                  <div className="font-semibold">Arguments contraires</div>
                  <div className="mt-1">{assessmentQuality.hasContradictoryArgumentsExamined ? 'Consignés (+25)' : 'Absents'}</div>
                </div>
                <div className={`p-3 rounded-lg border ${assessmentQuality.hasUnverifiedAssumptionsFlagged ? 'bg-emerald-950/20 border-emerald-600/40 text-emerald-300' : 'bg-slate-800/40 border-slate-700 text-slate-400'}`}>
                  <div className="font-semibold">Assomptions balisées</div>
                  <div className="mt-1">{assessmentQuality.hasUnverifiedAssumptionsFlagged ? 'Signalées (+20)' : 'Non documentées'}</div>
                </div>
                <div className={`p-3 rounded-lg border ${assessmentQuality.hasUnresolvedGapsDocumented ? 'bg-emerald-950/20 border-emerald-600/40 text-emerald-300' : 'bg-slate-800/40 border-slate-700 text-slate-400'}`}>
                  <div className="font-semibold">Lacunes identifiées</div>
                  <div className="mt-1">{assessmentQuality.hasUnresolvedGapsDocumented ? 'Maintenues (+15)' : 'Aucune'}</div>
                </div>
                <div className={`p-3 rounded-lg border ${assessmentQuality.hasDiscriminantsEstablished ? 'bg-emerald-950/20 border-emerald-600/40 text-emerald-300' : 'bg-slate-800/40 border-slate-700 text-slate-400'}`}>
                  <div className="font-semibold">Discriminants posés</div>
                  <div className="mt-1">{assessmentQuality.hasDiscriminantsEstablished ? 'Établis (+15)' : 'Non définis'}</div>
                </div>
              </div>
            </div>
          )}

          {/* LES 12 PRINCIPES DOCTRINAUX OBLIGATOIRES */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              Doctrine Analytique OSINT AFRICA (12 Principes Directeurs)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {ANALYTICAL_DOCTRINAL_PRINCIPLES.map(p => (
                <div key={p.id} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-slate-500">[{p.id}]</span>
                    <span>{p.title}</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. APPRÉCIATIONS ANALYTIQUES */}
      {activeTab === 'assessments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              Appréciations Analytiques ({assessments.length})
            </h3>
            <button
              onClick={() => setShowNewAssessmentModal(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Nouvelle Appréciation
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {assessments.map(a => {
              const isSelected = a.id === selectedAssessmentId;
              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedAssessmentId(a.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500/70 shadow-md ring-1 ring-amber-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                        {a.id}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                        Besoin: {a.requirementId}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                        Question: {a.questionId}
                      </span>
                      <span className="text-xs px-2 py-0.5 font-bold uppercase rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                        {a.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Niveau: <span className="text-slate-200 font-medium">{a.assessmentLevel}</span> | Confiance: <span className="text-slate-200 font-medium">{a.confidenceLevel}</span>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-white mb-1">{a.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-300 mb-3">{a.objective}</p>

                  {a.assessmentText && (
                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 italic mb-3">
                      "{a.assessmentText}"
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                    <div>
                      {a.hypothesisIds.length} hypothèses • {a.verificationCaseIds.length} cas LOT 36 • {a.unresolvedGaps.length} lacunes
                    </div>
                    <div>
                      Créée le {new Date(a.createdAt).toLocaleDateString()} par {a.createdBy}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. HYPOTHÈSES */}
      {activeTab === 'hypotheses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Hypothèses Analytiques de l'Appréciation ({selectedAssessmentHypotheses.length})
              </h3>
              <p className="text-xs text-slate-400">
                Principe doctrinal : une hypothèse n'est pas un fait ; elle est soumise au test de réfutation.
              </p>
            </div>
            <button
              onClick={() => setShowNewHypothesisModal(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Nouvelle Hypothèse
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {selectedAssessmentHypotheses.map(hyp => {
              const isSelected = hyp.id === selectedHypothesisId;
              const hypArgs = argumentsList.filter(a => a.hypothesisId === hyp.id);
              const favorable = hypArgs.filter(a => a.type === 'SUPPORT');
              const unfavorable = hypArgs.filter(a => a.type === 'CONTRADICTION');

              return (
                <div
                  key={hyp.id}
                  className={`p-4 rounded-xl border transition ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                        {hyp.id}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        Type: {hyp.type}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          hyp.status === 'FAVORISEE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : hyp.status === 'AFFAIBLIE'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {hyp.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Confiance: <span className="font-medium text-slate-200">{hyp.confidenceLevel}</span>
                    </div>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-white mb-1.5">{hyp.statement}</h4>
                  <p className="text-xs sm:text-sm text-slate-300 mb-3">{hyp.rationale}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-600/30 text-emerald-200">
                      <span className="font-bold">Arguments favorables ({favorable.length}) :</span>
                      {favorable.length === 0 ? (
                        <div className="text-slate-500 italic mt-0.5">Aucun argument favorable consigné</div>
                      ) : (
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          {favorable.map(a => (
                            <li key={a.id} className="truncate">{a.statement}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-600/30 text-rose-200">
                      <span className="font-bold">Arguments contraires / défavorables ({unfavorable.length}) :</span>
                      {unfavorable.length === 0 ? (
                        <div className="text-slate-500 italic mt-0.5">Aucun argument défavorable consigné</div>
                      ) : (
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          {unfavorable.map(a => (
                            <li key={a.id} className="truncate">{a.statement}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                    <div>
                      Rattachée à l'appréciation {hyp.assessmentId}
                    </div>
                    <button
                      onClick={() => setSelectedHypothesisId(isSelected ? null : hyp.id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-medium text-xs flex items-center gap-1"
                    >
                      {isSelected ? 'Masquer bilan contradictoire' : 'Examiner bilan contradictoire'}
                    </button>
                  </div>

                  {/* BILAN CONTRADICTOIRE DÉTAILLÉ DE L'HYPOTHÈSE SÉLECTIONNÉE */}
                  {isSelected && selectedHypothesisEvaluation && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                          <Scale className="w-4 h-4" /> Bilan de Couverture Contradictoire
                        </div>
                        <div className="text-xs font-mono text-slate-400">
                          Couverture documentaire: <span className="font-bold text-amber-300">{selectedHypothesisEvaluation.coverageCompletenessIndicator}/100</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
                        {selectedHypothesisEvaluation.doctrinalNotice}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <div className="text-slate-400 text-[11px]">Sources Indépendantes</div>
                          <div className="text-lg font-bold text-emerald-400">{selectedHypothesisEvaluation.independentSourceCount}</div>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <div className="text-slate-400 text-[11px]">Sources Dépendantes</div>
                          <div className="text-lg font-bold text-amber-400">{selectedHypothesisEvaluation.dependentSourceCount}</div>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <div className="text-slate-400 text-[11px]">Lacunes associées</div>
                          <div className="text-lg font-bold text-rose-400">{selectedHypothesisEvaluation.unresolvedGaps.length}</div>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <div className="text-slate-400 text-[11px]">Discriminants posés</div>
                          <div className="text-lg font-bold text-indigo-400">{selectedHypothesisEvaluation.discriminants.length}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. ALTERNATIVES */}
      {activeTab === 'alternatives' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Scénarios Alternatifs et Concurrents ({alternatives.length})
              </h3>
              <p className="text-xs text-slate-400">
                L'examen d'alternatives protège contre le biais de confirmation et l'ancrage prématuré.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {alternatives.map(alt => (
              <div key={alt.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                      {alt.id}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                      Hypothèse concurrencée: {alt.hypothesisId}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-bold uppercase">
                      {alt.status}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-white mb-2">{alt.statement}</h4>

                {alt.keyAssumptions.length > 0 && (
                  <div className="text-xs text-slate-400 mb-2">
                    <span className="text-slate-300 font-medium">Assomptions clés :</span> {alt.keyAssumptions.join(' • ')}
                  </div>
                )}

                {alt.discriminants.length > 0 && (
                  <div className="text-xs text-slate-400">
                    <span className="text-indigo-300 font-medium">Discriminants requis :</span> {alt.discriminants.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ARGUMENTS */}
      {activeTab === 'arguments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Registre des Arguments Analytiques ({argumentsList.length})
              </h3>
              <p className="text-xs text-slate-400">
                Chaque élément doit préciser son statut (support, contradiction, contexte, limite, incertitude).
              </p>
            </div>
            <button
              onClick={() => setShowNewArgumentModal(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter Argument
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {argumentsList.map(arg => {
              const isSupport = arg.type === 'SUPPORT';
              const isContra = arg.type === 'CONTRADICTION';
              return (
                <div
                  key={arg.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    isSupport
                      ? 'bg-emerald-950/20 border-emerald-600/40'
                      : isContra
                      ? 'bg-rose-950/20 border-rose-600/40'
                      : 'bg-slate-900/70 border-slate-800'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        {arg.id}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                          isSupport
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isContra
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {arg.type}
                      </span>
                      <span className="text-xs text-slate-400">
                        Force: <span className="font-medium text-slate-200">{arg.strength}</span>
                      </span>
                      <span className="text-xs text-slate-400">
                        Hypothèse: <span className="font-mono text-amber-300">{arg.hypothesisId}</span>
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-200">{arg.statement}</div>
                  </div>

                  <div className="text-xs text-slate-400 shrink-0">
                    {arg.sourceIds.length > 0 && <span>Sources: {arg.sourceIds.join(', ')}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. ASSOMPTIONS */}
      {activeTab === 'assumptions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Balisage des Assomptions / Présupposés ({assumptions.length})
              </h3>
              <p className="text-xs text-slate-400">
                Principe doctrinal : toute hypothèse reposant sur une assomption non vérifiée doit rester explicitement signalée.
              </p>
            </div>
            <button
              onClick={() => setShowNewAssumptionModal(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Nouvelle Assomption
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {assumptions.map(as => {
              const isUnverified = as.validationStatus === 'NON_VERIFIEE';
              return (
                <div
                  key={as.id}
                  className={`p-4 rounded-xl border ${
                    isUnverified
                      ? 'bg-amber-950/20 border-amber-600/50'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        {as.id}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          isUnverified
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {as.validationStatus}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        Risque: {as.riskLevel}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-white mb-1">{as.statement}</h4>
                  <div className="text-xs text-slate-400">
                    <span className="text-slate-300 font-medium">Fondement invoqué :</span> {as.basis}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. DISCRIMINANTS */}
      {activeTab === 'discriminants' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Questions et Critères Discriminants ({discriminants.length})
              </h3>
              <p className="text-xs text-slate-400">
                Critères empiriques permettant de trancher rationnellement entre deux hypothèses concurrentes.
              </p>
            </div>
            <button
              onClick={() => setShowNewDiscriminantModal(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Nouveau Discriminant
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {discriminants.map(disc => (
              <div key={disc.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-400/30">
                      {disc.id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 font-bold uppercase">
                      {disc.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      Concerne : {disc.hypothesisIds.join(', ')}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-white mb-2">{disc.question}</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="text-emerald-400 font-bold">Si observé :</span>
                    <div className="text-slate-300 mt-0.5">{disc.meaningIfObserved}</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="text-rose-400 font-bold">Si absent :</span>
                    <div className="text-slate-300 mt-0.5">{disc.meaningIfAbsent}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. CONTRADICTIONS */}
      {activeTab === 'contradictions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                Contradictions Conservées et Divergences ({preservedContradictions.length})
              </h3>
              <p className="text-xs text-slate-400">
                Principe doctrinal : aucune contradiction n'est supprimée ni résolue d'autorité par un algorithme.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {preservedContradictions.map((c, i) => (
              <div key={c.id || i} className="p-4 rounded-xl bg-slate-900 border border-rose-950 text-xs sm:text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/30">
                    {c.id || `CONTRA-${i + 1}`}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase text-xs">
                    {c.status || 'CONSERVÉE SANS LISSAGE'}
                  </span>
                </div>
                <div className="text-slate-200 font-medium">{c.description || c.claimA}</div>
                {c.nature && <div className="text-slate-400 text-xs mt-1">Nature: {c.nature}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. LACUNES */}
      {activeTab === 'gaps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Lacunes et Incertitudes Analytiques ({gaps.length})
              </h3>
              <p className="text-xs text-slate-400">
                Principe doctrinal : absence d'information ≠ preuve d'absence. Aucune lacune n'est auto-clôturée.
              </p>
            </div>
            <button
              onClick={() => setShowNewGapModal(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Consigner Lacune
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {gaps.map(g => (
              <div key={g.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                      {g.id}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700 font-bold uppercase">
                      {g.status}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded">
                      Impact: {g.impact} • Priorité: {g.priority}
                    </span>
                  </div>
                </div>

                <div className="text-sm font-semibold text-white">{g.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. DÉCISIONS */}
      {activeTab === 'decisions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Décisions Analytiques et Appréciations Validées ({decisions.length})
              </h3>
              <p className="text-xs text-slate-400">
                Validation formelle humaine obligatoire. L'analyste ou le superviseur reste responsable de l'appréciation.
              </p>
            </div>
            <button
              onClick={() => setShowNewDecisionModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Valider Décision
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {decisions.map(d => (
              <div key={d.id} className="p-4 rounded-xl bg-slate-900 border border-emerald-600/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/30">
                      {d.id}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase">
                      {d.decision}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Appréciation: {d.assessmentId}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Validé par: <span className="font-bold text-white">{d.approvedBy}</span>
                  </div>
                </div>

                <div className="text-sm text-slate-200 mb-3">{d.rationale}</div>

                <div className="text-xs text-slate-400 flex items-center gap-4 pt-2 border-t border-slate-800">
                  <span>Horodatage : {new Date(d.approvedAt).toLocaleString()}</span>
                  <span className="text-emerald-400 font-semibold">Décision 100% Humaine</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. TRAÇABILITÉ */}
      {activeTab === 'traceability' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Traçabilité Intégrale Bidirectionnelle
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Chaîne descendante (Besoin → Décision) et chaîne ascendante (Décision → Besoin). Toute référence absente est notée RUPTURE_LIEN.
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider mb-2">
                  1. Arborescence Descendante :
                </h4>
                {traceabilityData.descending.map(node => renderTraceabilityTree(node))}
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-wider mb-2">
                  2. Arborescence Ascendante (Remontée Justificative) :
                </h4>
                {traceabilityData.ascending.length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-3 rounded bg-slate-950">
                    Aucune décision formalisée pour remonter l'arborescence ascendante de cette appréciation.
                  </div>
                ) : (
                  traceabilityData.ascending.map(node => renderTraceabilityTree(node))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. AUDIT */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Journal d'Audit Append-Only au Niveau du Service ({auditLogs.length} entrées)
              </h3>
              <p className="text-xs text-slate-400">
                Traçabilité des actions et changements d'états. Aucune suppression autorisée.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Date / Heure</th>
                  <th className="p-3">Acteur</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entité</th>
                  <th className="p-3">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-slate-300">{log.actorId}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">
                      {log.entityType}:{log.entityId}
                    </td>
                    <td className="p-3 text-slate-300 max-w-md truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL NOUVELLE APPRÉCIATION */}
      {showNewAssessmentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Nouvelle Appréciation Analytique</h3>
              <button onClick={() => setShowNewAssessmentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAssessment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Titre de l'appréciation *</label>
                <input
                  type="text"
                  required
                  value={newAssessForm.title}
                  onChange={e => setNewAssessForm({ ...newAssessForm, title: e.target.value })}
                  placeholder="ex: Appréciation des mouvements de vecteurs armés..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Objectif décisionnel *</label>
                <textarea
                  required
                  rows={2}
                  value={newAssessForm.objective}
                  onChange={e => setNewAssessForm({ ...newAssessForm, objective: e.target.value })}
                  placeholder="Finalité pour le commandement ou le décideur..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Réf. Besoin LOT 34 *</label>
                  <input
                    type="text"
                    required
                    value={newAssessForm.requirementId}
                    onChange={e => setNewAssessForm({ ...newAssessForm, requirementId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Réf. Question LOT 34 *</label>
                  <input
                    type="text"
                    required
                    value={newAssessForm.questionId}
                    onChange={e => setNewAssessForm({ ...newAssessForm, questionId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Dossiers de vérification LOT 36 (virgules)</label>
                <input
                  type="text"
                  value={newAssessForm.verificationCaseIds}
                  onChange={e => setNewAssessForm({ ...newAssessForm, verificationCaseIds: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Niveau d'appréciation</label>
                  <select
                    value={newAssessForm.assessmentLevel}
                    onChange={e => setNewAssessForm({ ...newAssessForm, assessmentLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="FAIBLE">FAIBLE</option>
                    <option value="MODERE">MODERE</option>
                    <option value="SUBSTANTIEL">SUBSTANTIEL</option>
                    <option value="ELEVE">ELEVE</option>
                    <option value="CRITIQUE">CRITIQUE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Confiance qualitative</label>
                  <select
                    value={newAssessForm.confidenceLevel}
                    onChange={e => setNewAssessForm({ ...newAssessForm, confidenceLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="FAIBLE">FAIBLE</option>
                    <option value="MOYENNE">MOYENNE</option>
                    <option value="ELEVEE">ELEVEE</option>
                    <option value="TRES_ELEVEE">TRES_ELEVEE</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewAssessmentModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400"
                >
                  Créer Appréciation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOUVELLE HYPOTHÈSE */}
      {showNewHypothesisModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Nouvelle Hypothèse Analytique</h3>
              <button onClick={() => setShowNewHypothesisModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateHypothesis} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Énoncé de l'hypothèse *</label>
                <textarea
                  required
                  rows={2}
                  value={newHypoForm.statement}
                  onChange={e => setNewHypoForm({ ...newHypoForm, statement: e.target.value })}
                  placeholder="Énoncé falsifiable et testable..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Type d'hypothèse</label>
                  <select
                    value={newHypoForm.type}
                    onChange={e => setNewHypoForm({ ...newHypoForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="EXPLICATIVE">EXPLICATIVE</option>
                    <option value="CAUSALE_A_EXAMINER">CAUSALE_A_EXAMINER</option>
                    <option value="PROSPECTIVE">PROSPECTIVE</option>
                    <option value="ATTRIBUTIVE">ATTRIBUTIVE</option>
                    <option value="CONTEXTUELLE">CONTEXTUELLE</option>
                    <option value="ALTERNATIVE">ALTERNATIVE</option>
                    <option value="AUTRE">AUTRE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Confiance qualitative</label>
                  <select
                    value={newHypoForm.confidenceLevel}
                    onChange={e => setNewHypoForm({ ...newHypoForm, confidenceLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="FAIBLE">FAIBLE</option>
                    <option value="MOYENNE">MOYENNE</option>
                    <option value="ELEVEE">ELEVEE</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Raisonnement sous-jacent (rationale) *</label>
                <textarea
                  required
                  rows={3}
                  value={newHypoForm.rationale}
                  onChange={e => setNewHypoForm({ ...newHypoForm, rationale: e.target.value })}
                  placeholder="Justification logique initiale..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewHypothesisModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400"
                >
                  Créer Hypothèse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOUVEL ARGUMENT */}
      {showNewArgumentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Ajouter un Argument Analytique</h3>
              <button onClick={() => setShowNewArgumentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateArgument} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Hypothèse concernée</label>
                <select
                  value={newArgForm.hypothesisId}
                  onChange={e => setNewArgForm({ ...newArgForm, hypothesisId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                >
                  {selectedAssessmentHypotheses.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.id} - {h.statement.substring(0, 40)}...
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Type d'argument</label>
                  <select
                    value={newArgForm.type}
                    onChange={e => setNewArgForm({ ...newArgForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold"
                  >
                    <option value="SUPPORT">SUPPORT (Favorable)</option>
                    <option value="CONTRADICTION">CONTRADICTION (Défavorable)</option>
                    <option value="CONTEXTE">CONTEXTE</option>
                    <option value="LIMITE">LIMITE</option>
                    <option value="INCERTITUDE">INCERTITUDE</option>
                    <option value="DISCRIMINANT">DISCRIMINANT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Force probante</label>
                  <select
                    value={newArgForm.strength}
                    onChange={e => setNewArgForm({ ...newArgForm, strength: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="FAIBLE">FAIBLE</option>
                    <option value="MOYEN">MOYEN</option>
                    <option value="FORT">FORT</option>
                    <option value="DECISIF">DECISIF</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Énoncé de l'argument *</label>
                <textarea
                  required
                  rows={2}
                  value={newArgForm.statement}
                  onChange={e => setNewArgForm({ ...newArgForm, statement: e.target.value })}
                  placeholder="Constat vérifié venant à l'appui ou en infirmation..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Sources OSINT (virgules)</label>
                <input
                  type="text"
                  value={newArgForm.sourceIds}
                  onChange={e => setNewArgForm({ ...newArgForm, sourceIds: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewArgumentModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400"
                >
                  Ajouter Argument
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOUVELLE ASSOMPTION */}
      {showNewAssumptionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Consigner une Assomption</h3>
              <button onClick={() => setShowNewAssumptionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAssumption} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Énoncé de l'assomption *</label>
                <textarea
                  required
                  rows={2}
                  value={newAssumpForm.statement}
                  onChange={e => setNewAssumpForm({ ...newAssumpForm, statement: e.target.value })}
                  placeholder="Postulat tenu pour acquis sans démonstration absolue..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Fondement invoqué *</label>
                <textarea
                  required
                  rows={2}
                  value={newAssumpForm.basis}
                  onChange={e => setNewAssumpForm({ ...newAssumpForm, basis: e.target.value })}
                  placeholder="Rapports historiques, usages locaux..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Niveau de risque</label>
                  <select
                    value={newAssumpForm.riskLevel}
                    onChange={e => setNewAssumpForm({ ...newAssumpForm, riskLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="FAIBLE">FAIBLE</option>
                    <option value="MODERE">MODERE</option>
                    <option value="ELEVE">ELEVE</option>
                    <option value="CRITIQUE">CRITIQUE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Statut de vérification</label>
                  <select
                    value={newAssumpForm.validationStatus}
                    onChange={e => setNewAssumpForm({ ...newAssumpForm, validationStatus: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="NON_VERIFIEE">NON_VERIFIEE</option>
                    <option value="PARTIELLEMENT_VERIFIEE">PARTIELLEMENT_VERIFIEE</option>
                    <option value="VERIFIEE">VERIFIEE</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewAssumptionModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400"
                >
                  Consigner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOUVEAU DISCRIMINANT */}
      {showNewDiscriminantModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Nouveau Discriminant</h3>
              <button onClick={() => setShowNewDiscriminantModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDiscriminant} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Question discriminante *</label>
                <input
                  type="text"
                  required
                  value={newDiscForm.question}
                  onChange={e => setNewDiscForm({ ...newDiscForm, question: e.target.value })}
                  placeholder="ex: Les convois disposent-ils de marquages officiels ?"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Observation attendue *</label>
                <input
                  type="text"
                  required
                  value={newDiscForm.expectedObservation}
                  onChange={e => setNewDiscForm({ ...newDiscForm, expectedObservation: e.target.value })}
                  placeholder="ex: Plaques minéralogiques ou fanions d'unité..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Interprétation si observé *</label>
                  <input
                    type="text"
                    required
                    value={newDiscForm.meaningIfObserved}
                    onChange={e => setNewDiscForm({ ...newDiscForm, meaningIfObserved: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Interprétation si absent *</label>
                  <input
                    type="text"
                    required
                    value={newDiscForm.meaningIfAbsent}
                    onChange={e => setNewDiscForm({ ...newDiscForm, meaningIfAbsent: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewDiscriminantModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400"
                >
                  Créer Discriminant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOUVELLE LACUNE */}
      {showNewGapModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Consigner une Lacune Analytique</h3>
              <button onClick={() => setShowNewGapModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGap} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Description de la lacune *</label>
                <textarea
                  required
                  rows={3}
                  value={newGapForm.description}
                  onChange={e => setNewGapForm({ ...newGapForm, description: e.target.value })}
                  placeholder="Informations manquantes cruciales pour le raisonnement..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Impact sur l'appréciation</label>
                  <select
                    value={newGapForm.impact}
                    onChange={e => setNewGapForm({ ...newGapForm, impact: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="FAIBLE">FAIBLE</option>
                    <option value="MODERE">MODERE</option>
                    <option value="MAJEUR">MAJEUR</option>
                    <option value="BLOQUANT">BLOQUANT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priorité de comblement</label>
                  <select
                    value={newGapForm.priority}
                    onChange={e => setNewGapForm({ ...newGapForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="BASSE">BASSE</option>
                    <option value="MOYENNE">MOYENNE</option>
                    <option value="HAUTE">HAUTE</option>
                    <option value="CRITIQUE">CRITIQUE</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewGapModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400"
                >
                  Consigner Lacune
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONSIGNATION DÉCISION HUMAINE */}
      {showNewDecisionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Validation Décisionnelle Humaine
              </h3>
              <button onClick={() => setShowNewDecisionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDecision} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nature de la décision *</label>
                <select
                  value={newDecForm.decision}
                  onChange={e => setNewDecForm({ ...newDecForm, decision: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold text-xs"
                >
                  <option value="APPRECIATION_RETENUE">APPRECIATION_RETENUE (Conclusion consolidée)</option>
                  <option value="APPRECIATION_AVEC_RESERVES">APPRECIATION_AVEC_RESERVES (Incertitudes ouvertes)</option>
                  <option value="NON_CONCLUANT">NON_CONCLUANT (Éléments contradictoires ou insuffisants)</option>
                  <option value="INFORMATIONS_INSUFFISANTES">INFORMATIONS_INSUFFISANTES (Nécessite recherche LOT 35)</option>
                  <option value="A_REEVALUER">A_REEVALUER</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Argumentation circonstanciée * (≥ 10 car.)</label>
                <textarea
                  required
                  rows={4}
                  value={newDecForm.rationale}
                  onChange={e => setNewDecForm({ ...newDecForm, rationale: e.target.value })}
                  placeholder="Justifiez la décision en rappelant les réserves, lacunes et limites..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Identité de l'analyste superviseur *</label>
                <input
                  type="text"
                  required
                  value={newDecForm.approvedBy}
                  onChange={e => setNewDecForm({ ...newDecForm, approvedBy: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-300">
                Avertissement : Cette action scellera l'appréciation en statut VALIDEE avec mention explicite de validation humaine.
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewDecisionModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500"
                >
                  Valider la Décision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHANGEMENT DE STATUT (WORKFLOW) */}
      {showStatusModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Transition de Statut</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleStatusChangeSubmit} className="space-y-3 text-xs">
              <div>
                <div className="text-slate-400 mb-1">Statut actuel :</div>
                <div className="font-bold text-amber-400 font-mono text-sm">{selectedAssessment.status}</div>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nouveau statut cible</label>
                <select
                  value={statusTarget}
                  onChange={e => setStatusTarget(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold"
                >
                  <option value="EN_ELABORATION">EN_ELABORATION</option>
                  <option value="EN_EXAMEN">EN_EXAMEN</option>
                  <option value="EN_ARBITRAGE">EN_ARBITRAGE</option>
                  <option value="A_VALIDER">A_VALIDER</option>
                  <option value="VALIDEE">VALIDEE</option>
                  <option value="SUSPENDUE">SUSPENDUE</option>
                  <option value="ANNULEE">ANNULEE</option>
                  <option value="ARCHIVEE">ARCHIVEE (Immuable)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Justification formelle * (≥ 5 car.)</label>
                <textarea
                  required
                  rows={3}
                  value={statusJustification}
                  onChange={e => setStatusJustification(e.target.value)}
                  placeholder="Motif de la transition formelle..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              {statusError && (
                <div className="p-2.5 rounded bg-rose-950/40 border border-rose-600/60 text-rose-200 text-xs">
                  {statusError}
                </div>
              )}
              {statusSuccess && (
                <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-600/60 text-emerald-200 text-xs">
                  {statusSuccess}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400"
                >
                  Appliquer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
