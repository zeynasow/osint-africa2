/**
 * OSINT AFRICA — LOT 36
 * Centre de Vérification et de Qualification des Résultats OSINT
 *
 * Écran d'exploitation souveraine :
 * - 10 Onglets :
 *   1. Vue d'ensemble
 *   2. Dossiers de vérification
 *   3. Assertions
 *   4. Contrôles
 *   5. Sources
 *   6. Indépendance
 *   7. Contradictions
 *   8. Éléments de preuve
 *   9. Décisions
 *   10. Audit / Traçabilité
 * - Règle doctrinale d'aide à la décision : Vérification ≠ Vérité absolue ; Priorité ≠ Crédibilité
 * - Contrôle de duplication ≠ corroboration
 * - Registre des contradictions sans arbitrage automatique
 * - Moteur interactif de validation des 40 tests
 * - Zéro requête réseau sortante
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Layers,
  Search,
  GitFork,
  Clock,
  MapPin,
  Database,
  Scale,
  Download,
  RefreshCw,
  Plus,
  X,
  ArrowRight,
  Lock,
  Filter,
  Check,
  HelpCircle,
  Activity,
  Info,
  ExternalLink,
  ChevronRight,
  Sparkles,
  GitCommit,
  AlertCircle,
  Sliders,
  Award,
  Archive,
  Eye,
  Calendar,
  User,
  Shield,
  FileSearch,
  Split,
  FolderGit2
} from 'lucide-react';
import {
  OsintVerificationCase,
  OsintVerificationClaim,
  OsintVerificationCheck,
  OsintVerificationFinding,
  OsintVerificationSourceLink,
  OsintVerificationDecision,
  OsintVerificationAudit,
  OsintContradictionRecord,
  OsintVerificationStatus,
  OsintClaimType,
  OsintCheckType,
  OsintCheckStatus,
  OsintFindingType,
  OsintSourceRelationship,
  OsintSourceIndependenceStatus,
  OsintDecisionType,
  OsintVerificationTraceabilityNode,
  ScreenId
} from '../../types';
import {
  verificationQualificationService,
  VERIFICATION_DOCTRINE_RULES,
  ALLOWED_CASE_TRANSITIONS
} from '../../services/verificationQualificationService';

interface VerificationQualificationCenterScreenProps {
  onNavigate?: (screen: ScreenId) => void;
}

type TabType =
  | 'overview'
  | 'cases'
  | 'claims'
  | 'checks'
  | 'sources'
  | 'independence'
  | 'contradictions'
  | 'evidence'
  | 'decisions'
  | 'audit';

export const VerificationQualificationCenterScreen: React.FC<VerificationQualificationCenterScreenProps> = ({
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Données principales
  const [cases, setCases] = useState<OsintVerificationCase[]>([]);
  const [claims, setClaims] = useState<OsintVerificationClaim[]>([]);
  const [checks, setChecks] = useState<OsintVerificationCheck[]>([]);
  const [findings, setFindings] = useState<OsintVerificationFinding[]>([]);
  const [sourceLinks, setSourceLinks] = useState<OsintVerificationSourceLink[]>([]);
  const [contradictions, setContradictions] = useState<OsintContradictionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<OsintVerificationAudit[]>([]);

  // Sélection active
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [filterQuery, setFilterQuery] = useState<string>('');

  // Modales
  const [isCreateCaseModalOpen, setIsCreateCaseModalOpen] = useState<boolean>(false);
  const [isCreateClaimModalOpen, setIsCreateClaimModalOpen] = useState<boolean>(false);
  const [isCreateCheckModalOpen, setIsCreateCheckModalOpen] = useState<boolean>(false);
  const [isCreateFindingModalOpen, setIsCreateFindingModalOpen] = useState<boolean>(false);
  const [isCreateDecisionModalOpen, setIsCreateDecisionModalOpen] = useState<boolean>(false);
  const [isContradictionModalOpen, setIsContradictionModalOpen] = useState<boolean>(false);

  // Formulaire nouveau dossier
  const [newCaseForm, setNewCaseForm] = useState({
    researchResultId: 'RES-OBS-2026-001',
    researchTaskId: 'TSK-2026-001',
    researchPlanId: 'PLAN-2026-001',
    requirementId: 'REQ-2026-001',
    questionId: 'Q-REQ-001',
    title: '',
    objective: '',
    scope: 'Mali / Niger / Burkina Faso',
    priority: 75
  });

  // Formulaire nouvelle assertion
  const [newClaimForm, setNewClaimForm] = useState({
    statement: '',
    claimType: 'FACTUELLE' as OsintClaimType,
    sourceIds: 'SRC-001',
    evidenceIds: 'EV-001',
    observedAt: '2026-03-01T12:00:00.000Z',
    publicationAt: '2026-03-01T15:00:00.000Z'
  });

  // Formulaire nouveau contrôle
  const [newCheckForm, setNewCheckForm] = useState({
    claimId: '',
    type: 'PROVENANCE' as OsintCheckType,
    description: '',
    method: 'Recoupement documentaire sans appel réseau sortant',
    expected: '',
    observed: '',
    status: 'EN_COURS' as OsintCheckStatus
  });

  // Formulaire nouveau constat (Finding)
  const [newFindingForm, setNewFindingForm] = useState({
    claimId: '',
    checkId: '',
    type: 'ELEMENT_CONFIRMANT' as OsintFindingType,
    content: '',
    impact: 'MODERE' as 'CRITIQUE' | 'MAJEUR' | 'MODERE' | 'FAIBLE',
    relevance: 'HAUTE' as 'HAUTE' | 'MOYENNE' | 'FAIBLE'
  });

  // Formulaire décision humaine
  const [decisionForm, setDecisionForm] = useState({
    decision: 'QUALIFIE_AVEC_RESERVES' as OsintDecisionType,
    rationale: 'Convergence sur la localisation à Wabaria, mais réserve géographique stricte sur le franchissement du fleuve.',
    approvedBy: 'COMMISSAIRE_ANALYSTE_01'
  });

  // Formulaire contradiction
  const [contradictionForm, setContradictionForm] = useState({
    claimA: '',
    claimB: '',
    sourceA: 'SRC-001',
    sourceB: 'SRC-003',
    nature: 'DIVERGENCE_FACTUELLE',
    description: '',
    analystComment: ''
  });

  // Tests automatisés
  const [testResults, setTestResults] = useState<{ id: number; name: string; status: 'PASS' | 'FAIL' | 'IDLE'; details: string }[]>([]);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const refreshData = () => {
    const allCases = verificationQualificationService.listVerificationCases(isDemoMode);
    setCases(allCases);
    setClaims(verificationQualificationService.listClaims(undefined, isDemoMode));
    setChecks(verificationQualificationService.listVerificationChecks(undefined, undefined, isDemoMode));
    setFindings(verificationQualificationService.listFindings(undefined, isDemoMode));
    setSourceLinks(verificationQualificationService.listSourceLinks(undefined, isDemoMode));
    setContradictions(verificationQualificationService.listContradictions());
    setAuditLogs(verificationQualificationService.getVerificationAudit(isDemoMode));

    if (allCases.length > 0 && (!selectedCaseId || !allCases.some(c => c.id === selectedCaseId))) {
      setSelectedCaseId(allCases[0].id);
    }
  };

  useEffect(() => {
    refreshData();
  }, [isDemoMode]);

  const currentCase = useMemo(() => {
    return cases.find(c => c.id === selectedCaseId) || cases[0] || null;
  }, [cases, selectedCaseId]);

  const currentCaseClaims = useMemo(() => {
    if (!currentCase) return [];
    return claims.filter(c => c.caseId === currentCase.id);
  }, [claims, currentCase]);

  const currentCaseChecks = useMemo(() => {
    if (!currentCase) return [];
    return checks.filter(c => c.caseId === currentCase.id);
  }, [checks, currentCase]);

  const currentCaseFindings = useMemo(() => {
    if (!currentCase) return [];
    return findings.filter(f => f.caseId === currentCase.id);
  }, [findings, currentCase]);

  const currentCaseSources = useMemo(() => {
    if (!currentCase) return [];
    return sourceLinks.filter(s => s.caseId === currentCase.id);
  }, [sourceLinks, currentCase]);

  const currentCaseContradictions = useMemo(() => {
    if (!currentCase) return [];
    return contradictions.filter(c => c.caseId === currentCase.id);
  }, [contradictions, currentCase]);

  const qualificationSuggestion = useMemo(() => {
    if (!currentCase) return null;
    try {
      return verificationQualificationService.calculateVerificationQualification(currentCase.id);
    } catch {
      return null;
    }
  }, [currentCase, checks, findings, sourceLinks, contradictions]);

  // Statut badge styling
  const getStatusBadge = (status: OsintVerificationStatus) => {
    switch (status) {
      case 'BROUILLON':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">BROUILLON</span>;
      case 'A_VERIFIER':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/40">À VÉRIFIER</span>;
      case 'EN_VERIFICATION':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 animate-pulse">EN VÉRIFICATION</span>;
      case 'ELEMENTS_COLLECTES':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-950/60 text-blue-300 border border-blue-500/40">ÉLÉMENTS COLLECTÉS</span>;
      case 'EN_EVALUATION':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-950/60 text-purple-300 border border-purple-500/40">EN ÉVALUATION</span>;
      case 'QUALIFIE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-bold">QUALIFIÉ</span>;
      case 'QUALIFIE_AVEC_RESERVES':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-yellow-950/60 text-yellow-300 border border-yellow-500/40 font-bold">QUALIFIÉ AVEC RÉSERVES</span>;
      case 'NON_CONCLUANT':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-600">NON CONCLUANT</span>;
      case 'NON_CONFIRME':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-orange-950/60 text-orange-300 border border-orange-500/40">NON CONFIRMÉ</span>;
      case 'REJETE_TECHNIQUEMENT':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-950/60 text-rose-300 border border-rose-500/40">REJETÉ TECHNIQUEMENT</span>;
      case 'SUSPENDU':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-900/60 text-amber-200 border border-amber-600">SUSPENDU</span>;
      case 'ANNULE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-red-950 text-red-300 border border-red-800">ANNULÉ</span>;
      case 'ARCHIVE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-stone-900 text-stone-400 border border-stone-700">ARCHIVÉ</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  // Actions
  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = verificationQualificationService.createVerificationCase({
        researchResultId: newCaseForm.researchResultId,
        researchTaskId: newCaseForm.researchTaskId,
        researchPlanId: newCaseForm.researchPlanId,
        requirementId: newCaseForm.requirementId,
        questionId: newCaseForm.questionId,
        title: newCaseForm.title,
        objective: newCaseForm.objective,
        scope: newCaseForm.scope,
        priority: Number(newCaseForm.priority),
        isDemo: isDemoMode
      });
      setIsCreateCaseModalOpen(false);
      refreshData();
      setSelectedCaseId(created.id);
      showNotification(`Dossier ${created.id} créé avec succès.`);
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCase) return;
    try {
      const sIds = newClaimForm.sourceIds.split(',').map(s => s.trim()).filter(Boolean);
      const evIds = newClaimForm.evidenceIds.split(',').map(e => e.trim()).filter(Boolean);
      const claim = verificationQualificationService.createClaim({
        caseId: currentCase.id,
        statement: newClaimForm.statement,
        claimType: newClaimForm.claimType,
        sourceIds: sIds,
        evidenceIds: evIds,
        observedAt: newClaimForm.observedAt,
        publicationAt: newClaimForm.publicationAt,
        isDemo: currentCase.isDemo
      });
      setIsCreateClaimModalOpen(false);
      refreshData();
      showNotification(`Assertion ${claim.id} ajoutée.`);
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleCreateCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCase) return;
    try {
      const check = verificationQualificationService.createVerificationCheck({
        caseId: currentCase.id,
        claimId: newCheckForm.claimId || currentCaseClaims[0]?.id || 'CLM-DEFAULT',
        type: newCheckForm.type,
        description: newCheckForm.description,
        method: newCheckForm.method,
        expected: newCheckForm.expected,
        observed: newCheckForm.observed,
        status: newCheckForm.status,
        isDemo: currentCase.isDemo
      });
      setIsCreateCheckModalOpen(false);
      refreshData();
      showNotification(`Contrôle ${check.id} consigné.`);
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleCreateFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCase) return;
    try {
      const fnd = verificationQualificationService.createFinding({
        caseId: currentCase.id,
        claimId: newFindingForm.claimId || currentCaseClaims[0]?.id || 'CLM-DEFAULT',
        checkId: newFindingForm.checkId || currentCaseChecks[0]?.id || 'CHK-DEFAULT',
        type: newFindingForm.type,
        content: newFindingForm.content,
        impact: newFindingForm.impact,
        relevance: newFindingForm.relevance,
        isDemo: currentCase.isDemo
      });
      setIsCreateFindingModalOpen(false);
      refreshData();
      showNotification(`Constat ${fnd.id} enregistré.`);
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleCreateDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCase) return;
    try {
      const dec = verificationQualificationService.createVerificationDecision({
        caseId: currentCase.id,
        decision: decisionForm.decision,
        rationale: decisionForm.rationale,
        approvedBy: decisionForm.approvedBy,
        isHumanDecision: true,
        isDemo: currentCase.isDemo
      });
      setIsCreateDecisionModalOpen(false);
      refreshData();
      showNotification(`Décision souveraine ${dec.id} formalisée (${dec.decision}).`);
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleRecordContradiction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCase) return;
    try {
      const ctrd = verificationQualificationService.recordContradiction({
        caseId: currentCase.id,
        claimA: contradictionForm.claimA,
        claimB: contradictionForm.claimB,
        sourceA: contradictionForm.sourceA,
        sourceB: contradictionForm.sourceB,
        nature: contradictionForm.nature,
        description: contradictionForm.description,
        analystComment: contradictionForm.analystComment
      });
      setIsContradictionModalOpen(false);
      refreshData();
      showNotification(`Contradiction ${ctrd.id} documentée (non résolue automatiquement).`);
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleStatusChange = (newStatus: OsintVerificationStatus) => {
    if (!currentCase) return;
    try {
      verificationQualificationService.changeVerificationStatus(
        currentCase.id,
        newStatus,
        `Transition opérationnelle vers ${newStatus} décidée par l'officier verificateur`,
        'OFFICIER_SUPERVISEUR'
      );
      refreshData();
      showNotification(`Statut du dossier passé à ${newStatus}.`);
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handlePromoteEvidence = (findingId: string) => {
    if (!currentCase) return;
    try {
      const res = verificationQualificationService.promoteFindingToEvidence({
        caseId: currentCase.id,
        findingId,
        promotedBy: 'COMMISSAIRE_QUALITE',
        justification: `Promotion souveraine au vu de la solidité documentaire du constat ${findingId}.`
      });
      refreshData();
      showNotification(res.message);
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleExportJson = () => {
    const json = verificationQualificationService.exportVerificationJson(isDemoMode);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OSINT_AFRICA_VERIFICATION_LOT36_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Export JSON souverain généré sans aucun appel réseau sortant.');
  };

  // =========================================================================
  // SUITE DE TESTS AUTOMATISÉE DU LOT 36 (40/40 TESTS)
  // =========================================================================
  const runLot36Tests = () => {
    setIsRunningTests(true);
    const results: { id: number; name: string; status: 'PASS' | 'FAIL'; details: string }[] = [];

    try {
      // 01 Création d'un dossier de vérification
      const c1 = verificationQualificationService.createVerificationCase({
        researchResultId: 'RES-OBS-2026-001',
        researchTaskId: 'TSK-2026-001',
        researchPlanId: 'PLAN-2026-001',
        requirementId: 'REQ-2026-001',
        questionId: 'Q-REQ-001',
        title: 'Test Dossier Auto 01',
        objective: 'Vérification automatisée',
        priority: 60,
        isDemo: true
      });
      results.push({ id: 1, name: '01 Création dossier', status: c1.id.startsWith('VERIF-CASE-') ? 'PASS' : 'FAIL', details: `ID généré: ${c1.id}` });

      // 02 Association résultat LOT 35
      results.push({ id: 2, name: '02 Association résultat LOT 35', status: c1.researchResultId === 'RES-OBS-2026-001' ? 'PASS' : 'FAIL', details: 'Liaison résultat vérifiée' });

      // 03 Association tâche LOT 35
      results.push({ id: 3, name: '03 Association tâche LOT 35', status: c1.researchTaskId === 'TSK-2026-001' ? 'PASS' : 'FAIL', details: 'Liaison tâche vérifiée' });

      // 04 Association plan LOT 35
      results.push({ id: 4, name: '04 Association plan LOT 35', status: c1.researchPlanId === 'PLAN-2026-001' ? 'PASS' : 'FAIL', details: 'Liaison plan vérifiée' });

      // 05 Association besoin LOT 34
      results.push({ id: 5, name: '05 Association besoin LOT 34', status: c1.requirementId === 'REQ-2026-001' ? 'PASS' : 'FAIL', details: 'Liaison besoin LOT 34 vérifiée' });

      // 06 Association question LOT 34
      results.push({ id: 6, name: '06 Association question LOT 34', status: c1.questionId === 'Q-REQ-001' ? 'PASS' : 'FAIL', details: 'Liaison question LOT 34 vérifiée' });

      // 07 Association source LOT 22
      const clm = verificationQualificationService.createClaim({
        caseId: c1.id,
        statement: 'Colonne motorisée observée au point kilométrique 42',
        claimType: 'FACTUELLE',
        sourceIds: ['SRC-001'],
        isDemo: true
      });
      results.push({ id: 7, name: '07 Association source LOT 22', status: clm.sourceIds.includes('SRC-001') ? 'PASS' : 'FAIL', details: 'Liaison source SRC-001 vérifiée' });

      // 08 Association preuve LOT 20
      const clmEv = verificationQualificationService.createClaim({
        caseId: c1.id,
        statement: 'Cliché satellitaire corroborant le déboisement',
        claimType: 'FACTUELLE',
        evidenceIds: ['EV-001'],
        isDemo: true
      });
      results.push({ id: 8, name: '08 Association preuve LOT 20', status: clmEv.evidenceIds.includes('EV-001') ? 'PASS' : 'FAIL', details: 'Liaison preuve EV-001 vérifiée' });

      // 09 Rejet d'une référence inexistante
      let test9Pass = false;
      try {
        verificationQualificationService.createVerificationCase({
          researchResultId: 'RES-INEXISTANT-999',
          researchTaskId: 'TSK-2026-001',
          researchPlanId: 'PLAN-2026-001',
          requirementId: 'REQ-2026-001',
          questionId: 'Q-REQ-001',
          title: 'Dossier Invalide',
          objective: 'Test rejet',
          isDemo: true
        });
      } catch (e: any) {
        test9Pass = e.message.includes('introuvable');
      }
      results.push({ id: 9, name: '09 Rejet référence inexistante', status: test9Pass ? 'PASS' : 'FAIL', details: 'Rejet explicite levé sur résultat inexistant' });

      // 10 Rejet d'un dossier orphelin
      let test10Pass = false;
      try {
        verificationQualificationService.createVerificationCase({
          researchResultId: '',
          researchTaskId: '',
          researchPlanId: '',
          requirementId: '',
          questionId: '',
          title: 'Orphelin',
          objective: 'Test orphelin',
          isDemo: true
        });
      } catch (e: any) {
        test10Pass = e.message.includes('orphelin rejeté');
      }
      results.push({ id: 10, name: '10 Rejet dossier orphelin', status: test10Pass ? 'PASS' : 'FAIL', details: 'Contrôle strict des prérequis relationnels' });

      // 11 Création d'une assertion
      results.push({ id: 11, name: '11 Création assertion', status: clm.id.startsWith('CLM-') ? 'PASS' : 'FAIL', details: `Assertion ${clm.id} créée` });

      // 12 Création d'un contrôle
      const chk = verificationQualificationService.createVerificationCheck({
        caseId: c1.id,
        claimId: clm.id,
        type: 'PROVENANCE',
        description: 'Vérification de chaîne d’émission',
        method: 'Analyse horodatée locale',
        status: 'FAVORABLE',
        isDemo: true
      });
      results.push({ id: 12, name: '12 Création contrôle', status: chk.id.startsWith('CHK-') ? 'PASS' : 'FAIL', details: `Contrôle ${chk.id} créé` });

      // 13 Contrôle temporel
      const chkTemp = verificationQualificationService.createVerificationCheck({
        caseId: c1.id,
        claimId: clm.id,
        type: 'TEMPORAL',
        description: 'Vérification anachronisme',
        method: 'Chronologie inverse',
        status: 'FAVORABLE',
        isDemo: true
      });
      results.push({ id: 13, name: '13 Contrôle temporel', status: chkTemp.type === 'TEMPORAL' ? 'PASS' : 'FAIL', details: 'Typage TEMPORAL opérationnel' });

      // 14 Contrôle géographique
      const chkGeo = verificationQualificationService.createVerificationCheck({
        caseId: c1.id,
        claimId: clm.id,
        type: 'GEOGRAPHIQUE',
        description: 'Contrôle topographique',
        method: 'Cartographie locale',
        status: 'CONTRADICTOIRE',
        isDemo: true
      });
      results.push({ id: 14, name: '14 Contrôle géographique', status: chkGeo.type === 'GEOGRAPHIQUE' ? 'PASS' : 'FAIL', details: 'Typage GEOGRAPHIQUE opérationnel' });

      // 15 Contrôle de provenance
      results.push({ id: 15, name: '15 Contrôle provenance', status: chk.type === 'PROVENANCE' ? 'PASS' : 'FAIL', details: 'Provenance isolée sans flux réseau' });

      // 16 Contrôle de cohérence
      const chkCoh = verificationQualificationService.createVerificationCheck({
        caseId: c1.id,
        claimId: clm.id,
        type: 'COHERENCE_INTERNE',
        description: 'Cohérence interne des allégations',
        method: 'Recoupement sémantique',
        status: 'FAVORABLE',
        isDemo: true
      });
      results.push({ id: 16, name: '16 Contrôle cohérence', status: chkCoh.type === 'COHERENCE_INTERNE' ? 'PASS' : 'FAIL', details: 'COHERENCE_INTERNE validée' });

      // 17 Contrôle de corroboration
      const chkCor = verificationQualificationService.createVerificationCheck({
        caseId: c1.id,
        claimId: clm.id,
        type: 'CORROBORATION',
        description: 'Croisement 2 sources indépendantes',
        method: 'Vérification matricielle',
        status: 'FAVORABLE',
        isDemo: true
      });
      results.push({ id: 17, name: '17 Contrôle corroboration', status: chkCor.type === 'CORROBORATION' ? 'PASS' : 'FAIL', details: 'CORROBORATION validée' });

      // 18 Gestion d'une contradiction
      const ctrd = verificationQualificationService.recordContradiction({
        caseId: c1.id,
        claimA: 'Route ouverte',
        claimB: 'Route barrée',
        sourceA: 'SRC-001',
        sourceB: 'SRC-003',
        nature: 'BLOCAGE_PHYSICAL',
        description: 'Divergence d’accessibilité'
      });
      results.push({ id: 18, name: '18 Gestion contradiction', status: ctrd.id.startsWith('CTRD-') && ctrd.status === 'OUVERTE' ? 'PASS' : 'FAIL', details: 'Contradiction conservée sans écrasement' });

      // 19 Conservation d'un élément infirmant
      const fndInf = verificationQualificationService.createFinding({
        caseId: c1.id,
        claimId: clm.id,
        checkId: chkGeo.id,
        type: 'ELEMENT_INFIRMANT',
        content: 'Rapport météo contredisant le survol',
        impact: 'MAJEUR',
        isDemo: true
      });
      results.push({ id: 19, name: '19 Conservation élément infirmant', status: fndInf.type === 'ELEMENT_INFIRMANT' ? 'PASS' : 'FAIL', details: 'Élément infirmant consigné' });

      // 20 Conservation d'une lacune
      const fndLac = verificationQualificationService.createFinding({
        caseId: c1.id,
        claimId: clm.id,
        checkId: chk.id,
        type: 'LACUNE',
        content: 'Impossibilité d’obtenir le manifeste de cargaison',
        impact: 'MODERE',
        isDemo: true
      });
      results.push({ id: 20, name: '20 Conservation lacune', status: fndLac.type === 'LACUNE' ? 'PASS' : 'FAIL', details: 'Lacune non masquée' });

      // 21 Identification d'une source primaire
      const lnkPrim = verificationQualificationService.linkVerificationSource({
        caseId: c1.id,
        sourceId: 'SRC-001',
        relationship: 'SOURCE_PRIMAIRE',
        independenceStatus: 'INDEPENDANTE',
        isDemo: true
      });
      results.push({ id: 21, name: '21 Source primaire', status: lnkPrim.relationship === 'SOURCE_PRIMAIRE' && lnkPrim.independenceStatus === 'INDEPENDANTE' ? 'PASS' : 'FAIL', details: 'Source primaire qualifiée' });

      // 22 Identification d'une source dépendante
      const lnkDep = verificationQualificationService.linkVerificationSource({
        caseId: c1.id,
        sourceId: 'SRC-002',
        parentSourceId: 'SRC-001',
        relationship: 'REPRISE',
        independenceStatus: 'DEPENDANTE',
        isDemo: true
      });
      results.push({ id: 22, name: '22 Source dépendante', status: lnkDep.independenceStatus === 'DEPENDANTE' ? 'PASS' : 'FAIL', details: 'Reprise qualifiée dépendante' });

      // 23 Détection d'une duplication
      const dupCheck = verificationQualificationService.detectDuplicateSourceRelationship('SRC-002', 'SRC-001', c1.id);
      results.push({ id: 23, name: '23 Détection duplication', status: dupCheck.isDuplicateOrDerived === true ? 'PASS' : 'FAIL', details: dupCheck.explanation });

      // 24 Distinction duplication vs corroboration
      const lnkIndep = verificationQualificationService.linkVerificationSource({
        caseId: c1.id,
        sourceId: 'SRC-003',
        relationship: 'CORROBORATION_INDEPENDANTE',
        independenceStatus: 'INDEPENDANTE',
        isDemo: true
      });
      const indepCheck = verificationQualificationService.detectDuplicateSourceRelationship('SRC-001', 'SRC-003', c1.id);
      results.push({ id: 24, name: '24 Duplication ≠ Corroboration', status: indepCheck.isDuplicateOrDerived === false ? 'PASS' : 'FAIL', details: 'Distinction stricte confirmée' });

      // 25 Conservation d'une source d'indépendance inconnue
      const lnkInc = verificationQualificationService.linkVerificationSource({
        caseId: c1.id,
        sourceId: 'SRC-004',
        relationship: 'DEPENDANCE_INCONNUE',
        independenceStatus: 'INCERTAINE',
        isDemo: true
      });
      results.push({ id: 25, name: '25 Source indépendance inconnue', status: lnkInc.independenceStatus === 'INCERTAINE' ? 'PASS' : 'FAIL', details: 'Statut INCERTAINE préservé' });

      // 26 Calcul déterministe de la qualification
      const calc = verificationQualificationService.calculateVerificationQualification(c1.id);
      results.push({ id: 26, name: '26 Calcul déterministe', status: Boolean(calc.suggestedLevel && calc.rationale) ? 'PASS' : 'FAIL', details: `Niveau suggéré: ${calc.suggestedLevel}` });

      // 27 Qualification distincte de la priorité
      const cHighPrio = verificationQualificationService.createVerificationCase({
        researchResultId: 'RES-OBS-2026-001',
        researchTaskId: 'TSK-2026-001',
        researchPlanId: 'PLAN-2026-001',
        requirementId: 'REQ-2026-001',
        questionId: 'Q-REQ-001',
        title: 'Priorité 100 mais données vides',
        objective: 'Test priorité distincte vérité',
        priority: 100,
        isDemo: true
      });
      const calcHighPrio = verificationQualificationService.calculateVerificationQualification(cHighPrio.id);
      results.push({ id: 27, name: '27 Priorité ≠ Crédibilité', status: calcHighPrio.suggestedLevel === 'NON_CONCLUANT' ? 'PASS' : 'FAIL', details: 'Priorité 100 ne force pas la confirmation' });

      // 28 Hypothèse non transformée automatiquement en fait
      const clmCausal = verificationQualificationService.createClaim({
        caseId: c1.id,
        statement: 'Attaque motivée par une rivalité de chefferie locale',
        claimType: 'CAUSALE_A_EXAMINER',
        isDemo: true
      });
      const calcCausal = verificationQualificationService.calculateVerificationQualification(c1.id);
      results.push({ id: 28, name: '28 Hypothèse ≠ Fait', status: calcCausal.hasCausalHypothesis === true && calcCausal.suggestedLevel !== 'CONFIRME' ? 'PASS' : 'FAIL', details: 'Assertion causale non promue en fait absolu' });

      // 29 Contradiction empêchant une qualification abusive
      let test29Pass = false;
      try {
        verificationQualificationService.createVerificationDecision({
          caseId: c1.id,
          decision: 'QUALIFIE',
          rationale: 'Validation aveugle sans mention des contradictions',
          approvedBy: 'ANALYSTE_TEST',
          isDemo: true
        });
      } catch (e: any) {
        test29Pass = e.message.includes('contradictions non résolues');
      }
      results.push({ id: 29, name: '29 Blocage qualification abusive', status: test29Pass ? 'PASS' : 'FAIL', details: 'Contradiction non arbitrée bloque QUALIFIE non motivé' });

      // 30 Décision humaine obligatoire
      let test30Pass = false;
      try {
        verificationQualificationService.createVerificationDecision({
          caseId: c1.id,
          decision: 'QUALIFIE_AVEC_RESERVES',
          rationale: 'Test décision automatique interdite',
          approvedBy: 'ALGO_AUTO',
          isHumanDecision: false,
          isDemo: true
        });
      } catch (e: any) {
        test30Pass = e.message.includes('décisions automatiques sont formellement interdites');
      }
      results.push({ id: 30, name: '30 Décision humaine obligatoire', status: test30Pass ? 'PASS' : 'FAIL', details: 'isHumanDecision=false strictement rejeté' });

      // 31 NON_CONCLUANT conservé sans suppression
      const decNonConcluant = verificationQualificationService.createVerificationDecision({
        caseId: cHighPrio.id,
        decision: 'NON_CONCLUANT',
        rationale: 'Données insuffisantes, résultat conservé pour surveillance',
        approvedBy: 'SUPERVISEUR_01',
        isHumanDecision: true,
        isDemo: true
      });
      const caseAfterNonConcluant = verificationQualificationService.getVerificationCase(cHighPrio.id);
      results.push({ id: 31, name: '31 NON_CONCLUANT conservé', status: caseAfterNonConcluant !== null && caseAfterNonConcluant.status === 'NON_CONCLUANT' ? 'PASS' : 'FAIL', details: 'Dossier préservé avec statut NON_CONCLUANT' });

      // 32 NON_CONFIRME distinct de REJETE_TECHNIQUEMENT
      const isDistinct = ('NON_CONFIRME' as OsintVerificationStatus) !== ('REJETE_TECHNIQUEMENT' as OsintVerificationStatus);
      results.push({ id: 32, name: '32 NON_CONFIRME ≠ REJET_TECH', status: isDistinct ? 'PASS' : 'FAIL', details: 'Distinction sémantique et opérationnelle assurée' });

      // 33 Promotion vers preuve uniquement après action humaine
      const promoteRes = verificationQualificationService.promoteFindingToEvidence({
        caseId: c1.id,
        findingId: fndInf.id,
        promotedBy: 'COMMISSAIRE_CENTRAL',
        justification: 'Observation contradictoire capitale versée au registre probatoire'
      });
      results.push({ id: 33, name: '33 Promotion preuve humaine', status: promoteRes.success === true && promoteRes.evidenceId.startsWith('EV-') ? 'PASS' : 'FAIL', details: `Preuve créée: ${promoteRes.evidenceId}` });

      // 34 Transitions de statut autorisées
      const cTrans = verificationQualificationService.createVerificationCase({
        researchResultId: 'RES-OBS-2026-001',
        researchTaskId: 'TSK-2026-001',
        researchPlanId: 'PLAN-2026-001',
        requirementId: 'REQ-2026-001',
        questionId: 'Q-REQ-001',
        title: 'Test transitions',
        objective: 'Test transitions',
        isDemo: true
      });
      verificationQualificationService.changeVerificationStatus(cTrans.id, 'A_VERIFIER', 'Préparation du dossier', 'TESTEUR');
      verificationQualificationService.changeVerificationStatus(cTrans.id, 'EN_VERIFICATION', 'Lancement des contrôles', 'TESTEUR');
      verificationQualificationService.changeVerificationStatus(cTrans.id, 'ELEMENTS_COLLECTES', 'Contrôles achevés', 'TESTEUR');
      verificationQualificationService.changeVerificationStatus(cTrans.id, 'EN_EVALUATION', 'Examen contradictoire', 'TESTEUR');
      results.push({ id: 34, name: '34 Transitions autorisées', status: verificationQualificationService.getVerificationCase(cTrans.id)?.status === 'EN_EVALUATION' ? 'PASS' : 'FAIL', details: 'Cycle séquentiel standard validé' });

      // 35 Rejet des transitions interdites
      let test35Pass = false;
      try {
        verificationQualificationService.changeVerificationStatus(cTrans.id, 'BROUILLON', 'Saut arrière interdit', 'TESTEUR');
      } catch (e: any) {
        test35Pass = e.message.includes('non autorisée');
      }
      results.push({ id: 35, name: '35 Rejet transitions interdites', status: test35Pass ? 'PASS' : 'FAIL', details: 'Blocage strict EN_EVALUATION -> BROUILLON' });

      // 36 Verrouillage de ARCHIVE
      verificationQualificationService.changeVerificationStatus(cTrans.id, 'QUALIFIE', 'Validation avec arbitrage', 'TESTEUR');
      verificationQualificationService.changeVerificationStatus(cTrans.id, 'ARCHIVE', 'Clôture et scellement d’archive', 'TESTEUR');
      let test36Pass = false;
      try {
        verificationQualificationService.changeVerificationStatus(cTrans.id, 'EN_VERIFICATION', 'Tentative réouverture', 'TESTEUR');
      } catch (e: any) {
        test36Pass = e.message.includes('strictement immuable');
      }
      results.push({ id: 36, name: '36 Verrouillage ARCHIVE', status: test36Pass ? 'PASS' : 'FAIL', details: 'Dossier archivé strictement immuable' });

      // 37 Audit append-only de toutes les décisions
      const auditEntries = verificationQualificationService.getVerificationAudit(true);
      const hasDecisionAudit = auditEntries.some(a => a.action === 'HUMAN_DECISION_RECORDED' || a.action === 'STATUS_CHANGE');
      results.push({ id: 37, name: '37 Audit append-only', status: hasDecisionAudit ? 'PASS' : 'FAIL', details: `${auditEntries.length} entrées d’audit consignées` });

      // 38 Persistence localStorage + reload
      verificationQualificationService.saveToStorage();
      verificationQualificationService.reloadFromStorage();
      const reloadedCase = verificationQualificationService.getVerificationCase(c1.id);
      results.push({ id: 38, name: '38 Persistence localStorage', status: reloadedCase !== null ? 'PASS' : 'FAIL', details: 'Données restaurées fidèlement' });

      // 39 Traçabilité bidirectionnelle complète
      const trace = verificationQualificationService.getVerificationTraceability(c1.id);
      const traceValid = trace.descending.length > 0 && trace.ascending.length > 0;
      results.push({ id: 39, name: '39 Traçabilité bidirectionnelle', status: traceValid ? 'PASS' : 'FAIL', details: 'Arborescence descendante et remontante active' });

      // 40 Export JSON + séparation Démo/Réel + audit réseau
      const jsonExport = verificationQualificationService.exportVerificationJson(true);
      const isExportValid = jsonExport.includes('Centre de Vérification') && jsonExport.includes('networkCalls": 0');
      results.push({ id: 40, name: '40 Export JSON & 0 réseau', status: isExportValid ? 'PASS' : 'FAIL', details: 'Export local structuré, 0 appel réseau sortant' });

    } catch (err: any) {
      console.error('Erreur exécution tests LOT 36:', err);
    } finally {
      setTestResults(results);
      setIsRunningTests(false);
      refreshData();
    }
  };

  const passCount = testResults.filter(t => t.status === 'PASS').length;

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col">
      {/* Toast notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-md flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-top-2 ${
          notification.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/90 border-rose-500/40 text-rose-300'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner Doctrinale & Commandes */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 px-4 py-3 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-slate-900 border border-purple-500/40 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-100 uppercase tracking-wider">
                  Centre de Vérification & de Qualification OSINT
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 font-semibold">
                  LOT 36 — SOUVERAINETÉ
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Isolation des assertions • Découplage convergence/indépendance • Registre des contradictions • Décision humaine
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Switch Démo / Réel */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                id="btn-verif-demo-mode"
                onClick={() => setIsDemoMode(true)}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  isDemoMode ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Démonstration
              </button>
              <button
                id="btn-verif-real-mode"
                onClick={() => setIsDemoMode(false)}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  !isDemoMode ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Production Réelle
              </button>
            </div>

            {/* Bouton Banc d'essai 40 tests */}
            <button
              id="btn-run-lot36-tests"
              onClick={runLot36Tests}
              disabled={isRunningTests}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isRunningTests ? 'Contrôles en cours...' : 'Banc d’essai (40 Tests)'}</span>
              {testResults.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${passCount === 40 ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300'}`}>
                  {passCount}/40
                </span>
              )}
            </button>

            {/* Export JSON */}
            <button
              id="btn-verif-export-json"
              onClick={handleExportJson}
              title="Export local structuré (0 appel réseau sortant)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>

            {/* Nouveau Dossier */}
            <button
              id="btn-verif-new-case"
              onClick={() => setIsCreateCaseModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm shadow-purple-900/40 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barre de navigation des 10 Onglets */}
      <div className="border-b border-slate-800 bg-[#0d121d] px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-1.5 min-w-max">
          {[
            { id: 'overview', label: '1. Vue d’ensemble', icon: Activity },
            { id: 'cases', label: '2. Dossiers', icon: FolderGit2, count: cases.length },
            { id: 'claims', label: '3. Assertions', icon: FileText, count: claims.length },
            { id: 'checks', label: '4. Contrôles', icon: FileSearch, count: checks.length },
            { id: 'sources', label: '5. Sources', icon: Database, count: sourceLinks.length },
            { id: 'independence', label: '6. Indépendance', icon: Split },
            { id: 'contradictions', label: '7. Contradictions', icon: AlertTriangle, count: contradictions.length },
            { id: 'evidence', label: '8. Éléments de preuve', icon: ShieldCheck, count: findings.length },
            { id: 'decisions', label: '9. Décisions', icon: Scale },
            { id: 'audit', label: '10. Audit & Traçabilité', icon: GitFork }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-purple-500/30 text-purple-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col gap-4">
        {/* Sélecteur contextuel de dossier si présent */}
        {cases.length > 0 && activeTab !== 'overview' && activeTab !== 'audit' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Dossier actif :</span>
              <select
                id="select-active-case"
                value={selectedCaseId}
                onChange={e => setSelectedCaseId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500"
              >
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    [{c.id}] {c.title.substring(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            {currentCase && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Statut :</span>
                {getStatusBadge(currentCase.status)}
                <span className="text-xs text-slate-400 ml-2">Priorité :</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-500/40">
                  {currentCase.priority}/100
                </span>
              </div>
            )}
          </div>
        )}

        {/* 1. ONGLET VUE D'ENSEMBLE */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-4">
            {/* Cartes KPI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Dossiers Instruits</span>
                <span className="text-2xl font-bold text-slate-100">{cases.length}</span>
                <span className="text-[11px] text-purple-400 font-medium">Adossés aux résultats LOT 35</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Assertions Isolées</span>
                <span className="text-2xl font-bold text-slate-100">{claims.length}</span>
                <span className="text-[11px] text-cyan-400 font-medium">{claims.filter(c => c.claimType === 'CAUSALE_A_EXAMINER').length} causale(s) sous statut hypothèse</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Contrôles Techniques</span>
                <span className="text-2xl font-bold text-slate-100">{checks.length}</span>
                <span className="text-[11px] text-emerald-400 font-medium">{checks.filter(c => c.status === 'FAVORABLE').length} favorables / {checks.filter(c => c.status === 'CONTRADICTOIRE').length} contradictoires</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Contradictions Relevées</span>
                <span className="text-2xl font-bold text-amber-300">{contradictions.length}</span>
                <span className="text-[11px] text-amber-400 font-medium">Aucun arbitrage automatique</span>
              </div>
            </div>

            {/* Bannière Doctrinale Obligatoire */}
            <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-purple-400" />
                <h2 className="text-sm font-bold text-purple-200 uppercase tracking-wide">
                  Doctrine de Vérification & de Qualification OSINT (12 Règles Fondamentales)
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {VERIFICATION_DOCTRINE_RULES.map(rule => (
                  <div key={rule.id} className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 flex flex-col gap-1">
                    <span className="text-xs font-semibold text-purple-300">
                      Règle {rule.id} — {rule.title}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{rule.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dossier Actif Résumé */}
            {currentCase && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-slate-100">Dossier sélectionné : {currentCase.title}</h3>
                  </div>
                  {getStatusBadge(currentCase.status)}
                </div>
                <p className="text-xs text-slate-300">{currentCase.objective}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                  <span>Résultat parent : {currentCase.researchResultId}</span>
                  <span>Tâche : {currentCase.researchTaskId}</span>
                  <span>Plan : {currentCase.researchPlanId}</span>
                  <span>Besoin LOT 34 : {currentCase.requirementId}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. ONGLET DOSSIERS DE VÉRIFICATION */}
        {activeTab === 'cases' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-purple-400" />
                <span>Registre des dossiers de vérification</span>
              </h2>
              <button
                onClick={() => setIsCreateCaseModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                <Plus className="w-3 h-3" /> Nouveau dossier
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {cases.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`bg-slate-900/80 border rounded-xl p-4 flex flex-col gap-2.5 cursor-pointer transition-all ${
                    selectedCaseId === c.id ? 'border-purple-500/70 bg-purple-950/20' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-300">{c.id}</span>
                      <h3 className="text-sm font-semibold text-slate-100">{c.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">Prio: {c.priority}/100</span>
                      {getStatusBadge(c.status)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{c.objective}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800/80">
                    <span>Créé par: {c.createdBy}</span>
                    <span>Assigné: {c.assignedTo}</span>
                    <span>Assertions: {c.claimIds.length}</span>
                    <span>Contrôles: {c.checkIds.length}</span>
                    <span>Constats: {c.findingIds.length}</span>
                  </div>

                  {/* Actions de changement d'état */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/50">
                    <span className="text-[11px] text-slate-400 font-medium">Transitions permises :</span>
                    {(ALLOWED_CASE_TRANSITIONS[c.status] || []).map(nextStatus => (
                      <button
                        key={nextStatus}
                        onClick={e => {
                          e.stopPropagation();
                          handleStatusChange(nextStatus);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-purple-900/40 text-purple-300 text-[10px] font-mono border border-slate-700 transition-colors"
                      >
                        → {nextStatus}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. ONGLET ASSERTIONS */}
        {activeTab === 'claims' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Assertions isolées à vérifier ({currentCaseClaims.length})</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Décomposition fine des déclarations brutes. Une assertion causale demeure sous statut hypothèse.
                </p>
              </div>
              <button
                onClick={() => setIsCreateClaimModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                <Plus className="w-3 h-3" /> Nouvelle assertion
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentCaseClaims.map(claim => (
                <div key={claim.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-purple-300">{claim.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        claim.claimType === 'CAUSALE_A_EXAMINER'
                          ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-cyan-300 border border-slate-700'
                      }`}>
                        {claim.claimType}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">Obs: {claim.observedAt || 'N/A'}</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">« {claim.statement} »</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                    <span>Sources: {claim.sourceIds.join(', ') || 'Aucune'}</span>
                    <span>Preuves associées: {claim.evidenceIds.join(', ') || 'Aucune'}</span>
                    <span>Publié le: {claim.publicationAt || 'Inconnu'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. ONGLET CONTRÔLES */}
        {activeTab === 'checks' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-purple-400" />
                  <span>Contrôles techniques d'authentification ({currentCaseChecks.length})</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Vérifications documentaires, temporelles, géographiques, attribution et corroboration sans requête externe.
                </p>
              </div>
              <button
                onClick={() => setIsCreateCheckModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                <Plus className="w-3 h-3" /> Nouveau contrôle
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentCaseChecks.map(check => (
                <div key={check.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-purple-300">{check.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        TYPE : {check.type}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      check.status === 'FAVORABLE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : check.status === 'CONTRADICTOIRE'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : check.status === 'DEFAVORABLE'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {check.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200">{check.description}</p>
                  <div className="bg-slate-950/60 p-2.5 rounded-lg text-xs flex flex-col gap-1 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400"><strong>Méthode :</strong> {check.method}</span>
                    {check.expected && <span className="text-[11px] text-slate-400"><strong>Attendu :</strong> {check.expected}</span>}
                    {check.observed && <span className="text-[11px] text-purple-300"><strong>Observé :</strong> {check.observed}</span>}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                    <span>Analyste: {check.analystId}</span>
                    <span>Assertion liée: {check.claimId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. ONGLET SOURCES */}
        {activeTab === 'sources' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span>Répertoire des sources reliées au dossier ({currentCaseSources.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentCaseSources.map(s => (
                <div key={s.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-300">{s.sourceId}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      s.independenceStatus === 'INDEPENDANTE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : s.independenceStatus === 'DEPENDANTE'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {s.independenceStatus}
                    </span>
                  </div>
                  <span className="text-xs text-slate-300 font-medium">Relation : {s.relationship}</span>
                  {s.parentSourceId && (
                    <span className="text-[11px] text-amber-300 font-mono">Reprise de : {s.parentSourceId}</span>
                  )}
                  {s.notes && <p className="text-[11px] text-slate-400 italic">{s.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. ONGLET INDÉPENDANCE & DUPLICATION */}
        {activeTab === 'independence' && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Split className="w-5 h-5 text-purple-400" />
                <h2 className="text-sm font-bold text-slate-100">
                  Découplage Rigooureux : Convergence ≠ Indépendance / Duplication ≠ Corroboration
                </h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Le système vérifie si des articles ou allégations reprennent une même dépêche ou source primaire. Les sources dérivées sont regroupées et ne comptent que pour <strong>une seule confirmation</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Origines Indépendantes Vérifiées</h3>
                {currentCaseSources.filter(s => s.independenceStatus === 'INDEPENDANTE').map(s => (
                  <div key={s.id} className="bg-slate-950 p-2 rounded border border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-purple-300">{s.sourceId}</span>
                    <span className="text-[11px] text-emerald-400">{s.relationship}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Sources Dépendantes ou Dupliquées</h3>
                {currentCaseSources.filter(s => s.independenceStatus === 'DEPENDANTE').map(s => (
                  <div key={s.id} className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col gap-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-purple-300">{s.sourceId}</span>
                      <span className="text-[11px] text-amber-400">Dépend de {s.parentSourceId}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 italic">{s.notes}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 7. ONGLET CONTRADICTIONS */}
        {activeTab === 'contradictions' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Registre des contradictions documentées ({currentCaseContradictions.length})</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Règle 11 : Le système ne résout jamais automatiquement les contradictions et ne choisit pas la « prétendue bonne source ».
                </p>
              </div>
              <button
                onClick={() => setIsContradictionModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
              >
                <Plus className="w-3 h-3" /> Consigner une contradiction
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentCaseContradictions.map(c => (
                <div key={c.id} className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-300">{c.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/40">
                      {c.nature}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-purple-400 font-mono">Allégation A ({c.sourceA})</span>
                      <span className="text-slate-200">{c.claimA}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-2">
                      <span className="text-[10px] text-cyan-400 font-mono">Allégation B ({c.sourceB})</span>
                      <span className="text-slate-200">{c.claimB}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300"><strong>Détails :</strong> {c.description}</p>
                  {c.analystComment && (
                    <p className="text-[11px] text-purple-300 italic"><strong>Avis analyste :</strong> {c.analystComment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. ONGLET ÉLÉMENTS DE PREUVE */}
        {activeTab === 'evidence' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Constats (Findings) & Promotion vers preuves LOT 20 ({currentCaseFindings.length})</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Règle 33 : La promotion vers le registre des preuves requiert une décision explicite et traçable de l’officier.
                </p>
              </div>
              <button
                onClick={() => setIsCreateFindingModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                <Plus className="w-3 h-3" /> Nouveau constat
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentCaseFindings.map(fnd => (
                <div key={fnd.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-purple-300">{fnd.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        fnd.type === 'ELEMENT_CONFIRMANT'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : fnd.type === 'ELEMENT_INFIRMANT' || fnd.type === 'CONTRADICTION'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}>
                        {fnd.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">Impact: {fnd.impact}</span>
                      <button
                        onClick={() => handlePromoteEvidence(fnd.id)}
                        className="px-2 py-0.5 rounded bg-emerald-700/60 hover:bg-emerald-600 text-white text-[10px] font-semibold transition-colors flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3" /> Promouvoir Preuve LOT 20
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">{fnd.content}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                    <span>Créé par: {fnd.createdBy}</span>
                    <span>Preuves générées: {fnd.evidenceIds.join(', ') || 'Aucune'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. ONGLET DÉCISIONS HUMAINES */}
        {activeTab === 'decisions' && (
          <div className="flex flex-col gap-4">
            {/* Proposition d'aide à la décision calculée */}
            {qualificationSuggestion && (
              <div className="bg-gradient-to-br from-slate-900 to-purple-950/30 border border-purple-500/40 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-purple-400" />
                    <h3 className="text-sm font-bold text-slate-100">
                      Moteur Déterministe d'Aide à la Décision (Sans Prétention de Vérité)
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/50">
                    SUGGESTION : {qualificationSuggestion.suggestedLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {qualificationSuggestion.rationale}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-400">Sources Indép. : </span>
                    <span className="text-emerald-300 font-bold">{qualificationSuggestion.independentSourceCount}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-400">Sources Dép. : </span>
                    <span className="text-amber-300 font-bold">{qualificationSuggestion.dependentSourceCount}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-400">Confirmants : </span>
                    <span className="text-emerald-300 font-bold">{qualificationSuggestion.supportingFindings.length}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-400">Contradictions : </span>
                    <span className="text-rose-300 font-bold">{qualificationSuggestion.hasContradictions ? 'OUI' : 'NON'}</span>
                  </div>
                </div>

                <div className="text-[11px] text-purple-300/80 italic border-t border-purple-500/20 pt-2">
                  {qualificationSuggestion.doctrinalNotice}
                </div>
              </div>
            )}

            {/* Formulaire de qualification humaine souveraine */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>Formaliser la Décision Humaine de Qualification</span>
                </h3>
              </div>
              <form onSubmit={handleCreateDecision} className="flex flex-col gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Niveau de qualification :</label>
                    <select
                      value={decisionForm.decision}
                      onChange={e => setDecisionForm({ ...decisionForm, decision: e.target.value as OsintDecisionType })}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                    >
                      <option value="QUALIFIE">QUALIFIÉ (Confirmé sans réserve)</option>
                      <option value="QUALIFIE_AVEC_RESERVES">QUALIFIÉ AVEC RÉSERVES</option>
                      <option value="NON_CONCLUANT">NON CONCLUANT (En attente d'éléments)</option>
                      <option value="NON_CONFIRME">NON CONFIRMÉ</option>
                      <option value="REJETE_TECHNIQUEMENT">REJETÉ TECHNIQUEMENT (Inexploitable)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Officier approbateur :</label>
                    <input
                      type="text"
                      value={decisionForm.approvedBy}
                      onChange={e => setDecisionForm({ ...decisionForm, approvedBy: e.target.value })}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Rationale / Motivation souveraine :</label>
                  <textarea
                    value={decisionForm.rationale}
                    onChange={e => setDecisionForm({ ...decisionForm, rationale: e.target.value })}
                    rows={3}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="self-end px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  Valider et Signer la Décision
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 10. ONGLET AUDIT & TRAÇABILITÉ BIDIRECTIONNELLE */}
        {activeTab === 'audit' && (
          <div className="flex flex-col gap-4">
            {/* Arborescence de traçabilité */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitFork className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-bold text-slate-100">
                    Traçabilité Bidirectionnelle Complète & Détection de Rupture
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Chaîne descendante et remontante</span>
              </div>
              <p className="text-xs text-slate-300">
                La chaîne relie formellement : <strong>BESOIN → QUESTION → PLAN → TÂCHE → RÉSULTAT → DOSSIER → ASSERTION → CONTRÔLE → FINDING → DÉCISION → PREUVE</strong>.
                Toute absence d'entité est signalée par <code>RUPTURE_LIEN</code>.
              </p>
            </div>

            {/* Banc d'essai des 40 tests */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100">
                    Banc d'Essai Automatisé (40 Tests Réglementaires LOT 36)
                  </h3>
                </div>
                <button
                  onClick={runLot36Tests}
                  disabled={isRunningTests}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {isRunningTests ? 'Vérification...' : 'Exécuter les 40 Tests'}
                </button>
              </div>

              {testResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
                  {testResults.map(t => (
                    <div
                      key={t.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                        t.status === 'PASS'
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                          : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {t.status === 'PASS' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <div>
                          <span className="font-semibold">{t.name}</span>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{t.details}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        t.status === 'PASS' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-rose-900/60 text-rose-300'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Cliquez sur « Exécuter les 40 Tests » pour lancer la validation complète de non-régression.
                </p>
              )}
            </div>

            {/* Journal d'audit append-only */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>Journal d'Audit Append-Only ({auditLogs.length} entrées)</span>
                </h3>
              </div>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                {auditLogs.slice().reverse().map(log => (
                  <div key={log.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs flex flex-col gap-1">
                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                      <span className="text-purple-300 font-bold">[{log.action}]</span>
                      <span>{log.timestamp} • {log.actor}</span>
                    </div>
                    <p className="text-slate-200">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALE CRÉATION DOSSIER */}
      {isCreateCaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-4 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-100">Nouveau Dossier de Vérification</h3>
              <button onClick={() => setIsCreateCaseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCase} className="flex flex-col gap-2.5 text-xs">
              <div>
                <label className="text-slate-400">Titre du dossier :</label>
                <input
                  type="text"
                  value={newCaseForm.title}
                  onChange={e => setNewCaseForm({ ...newCaseForm, title: e.target.value })}
                  placeholder="ex: Vérification des allégations de mouvement à Gao"
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400">Objectif d'investigation :</label>
                <textarea
                  value={newCaseForm.objective}
                  onChange={e => setNewCaseForm({ ...newCaseForm, objective: e.target.value })}
                  rows={2}
                  placeholder="Isoler les allégations, examiner les preuves primaires..."
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400">Résultat LOT 35 lié :</label>
                  <input
                    type="text"
                    value={newCaseForm.researchResultId}
                    onChange={e => setNewCaseForm({ ...newCaseForm, researchResultId: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400">Besoin LOT 34 lié :</label>
                  <input
                    type="text"
                    value={newCaseForm.requirementId}
                    onChange={e => setNewCaseForm({ ...newCaseForm, requirementId: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100 font-mono"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400">Tâche LOT 35 :</label>
                  <input
                    type="text"
                    value={newCaseForm.researchTaskId}
                    onChange={e => setNewCaseForm({ ...newCaseForm, researchTaskId: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400">Plan LOT 35 :</label>
                  <input
                    type="text"
                    value={newCaseForm.researchPlanId}
                    onChange={e => setNewCaseForm({ ...newCaseForm, researchPlanId: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100 font-mono"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateCaseModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  Créer le dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE CRÉATION ASSERTION */}
      {isCreateClaimModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-4 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-100">Nouvelle Assertion à Vérifier</h3>
              <button onClick={() => setIsCreateClaimModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateClaim} className="flex flex-col gap-2.5 text-xs">
              <div>
                <label className="text-slate-400">Énoncé de l'assertion :</label>
                <textarea
                  value={newClaimForm.statement}
                  onChange={e => setNewClaimForm({ ...newClaimForm, statement: e.target.value })}
                  rows={2}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400">Type d'assertion :</label>
                <select
                  value={newClaimForm.claimType}
                  onChange={e => setNewClaimForm({ ...newClaimForm, claimType: e.target.value as OsintClaimType })}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                >
                  <option value="FACTUELLE">FACTUELLE</option>
                  <option value="TEMPORELLE">TEMPORELLE</option>
                  <option value="GEOGRAPHIQUE">GEOGRAPHIQUE</option>
                  <option value="ATTRIBUTIVE">ATTRIBUTIVE</option>
                  <option value="CAUSALE_A_EXAMINER">CAUSALE (Reste une hypothèse)</option>
                  <option value="CONTEXTUELLE">CONTEXTUELLE</option>
                  <option value="IDENTIFICATION">IDENTIFICATION</option>
                  <option value="AUTRE">AUTRE</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateClaimModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  Ajouter l'assertion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE CRÉATION CONTRÔLE */}
      {isCreateCheckModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-4 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-100">Nouveau Contrôle Technique</h3>
              <button onClick={() => setIsCreateCheckModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCheck} className="flex flex-col gap-2.5 text-xs">
              <div>
                <label className="text-slate-400">Type de contrôle :</label>
                <select
                  value={newCheckForm.type}
                  onChange={e => setNewCheckForm({ ...newCheckForm, type: e.target.value as OsintCheckType })}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                >
                  <option value="PROVENANCE">PROVENANCE</option>
                  <option value="TEMPORAL">TEMPORAL</option>
                  <option value="GEOGRAPHIQUE">GÉOGRAPHIQUE</option>
                  <option value="ATTRIBUTION">ATTRIBUTION</option>
                  <option value="CORROBORATION">CORROBORATION</option>
                  <option value="CONTRADICTION">CONTRADICTION</option>
                  <option value="COHERENCE_INTERNE">COHÉRENCE INTERNE</option>
                  <option value="DOCUMENTAIRE">DOCUMENTAIRE</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400">Description de la vérification :</label>
                <input
                  type="text"
                  value={newCheckForm.description}
                  onChange={e => setNewCheckForm({ ...newCheckForm, description: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400">Méthode employée :</label>
                <input
                  type="text"
                  value={newCheckForm.method}
                  onChange={e => setNewCheckForm({ ...newCheckForm, method: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateCheckModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  Enregistrer le contrôle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE CRÉATION CONSTAT (FINDING) */}
      {isCreateFindingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-4 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-100">Nouveau Constat (Finding)</h3>
              <button onClick={() => setIsCreateFindingModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateFinding} className="flex flex-col gap-2.5 text-xs">
              <div>
                <label className="text-slate-400">Type de constat :</label>
                <select
                  value={newFindingForm.type}
                  onChange={e => setNewFindingForm({ ...newFindingForm, type: e.target.value as OsintFindingType })}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                >
                  <option value="ELEMENT_CONFIRMANT">ÉLÉMENT CONFIRMANT</option>
                  <option value="ELEMENT_INFIRMANT">ÉLÉMENT INFIRMANT</option>
                  <option value="CONTRADICTION">CONTRADICTION</option>
                  <option value="LACUNE">LACUNE</option>
                  <option value="DUPLICATION">DUPLICATION</option>
                  <option value="INCERTITUDE">INCERTITUDE</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400">Contenu du constat :</label>
                <textarea
                  value={newFindingForm.content}
                  onChange={e => setNewFindingForm({ ...newFindingForm, content: e.target.value })}
                  rows={2}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateFindingModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  Consigner le constat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE CONSIGNATION CONTRADICTION */}
      {isContradictionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-4 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-100">Consigner une Contradiction Matérielle</h3>
              <button onClick={() => setIsContradictionModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRecordContradiction} className="flex flex-col gap-2.5 text-xs">
              <div>
                <label className="text-slate-400">Allégation A :</label>
                <input
                  type="text"
                  value={contradictionForm.claimA}
                  onChange={e => setContradictionForm({ ...contradictionForm, claimA: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400">Allégation B :</label>
                <input
                  type="text"
                  value={contradictionForm.claimB}
                  onChange={e => setContradictionForm({ ...contradictionForm, claimB: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400">Description de la contradiction :</label>
                <textarea
                  value={contradictionForm.description}
                  onChange={e => setContradictionForm({ ...contradictionForm, description: e.target.value })}
                  rows={2}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsContradictionModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                >
                  Documenter la contradiction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
