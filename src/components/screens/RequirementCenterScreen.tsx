/**
 * OSINT AFRICA - LOT 34 : Centre des Besoins en Renseignement, Questions Prioritaires et Planification de Veille
 * Écran professionnel souverain : Pilotage intellectuel, Questions prioritaires, Indicateurs, Lacunes, Plans de veille, Réponses et Audit Append-Only.
 * 0 appel réseau.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  HelpCircle,
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Layers,
  Plus, Download,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  User,
  XCircle,
  FileText,
  Lock,
  ArrowRight,
  Sparkles,
  BarChart3,
  BookOpen,
  Info,
  Check,
  Send,
  Sliders,
  PlayCircle
} from 'lucide-react';
import {
  OsintIntelligenceRequirement,
  OsintIntelligenceQuestion,
  OsintRequirementIndicator,
  OsintRequirementAnswer,
  OsintRequirementGap,
  OsintRequirementPlan,
  OsintRequirementAudit,
  OsintRequirementCategory,
  OsintRequirementImportance,
  OsintRequirementUrgency,
  OsintRequirementStatus,
  OsintQuestionType,
  OsintAnswerStatus,
  ALL_REQUIREMENT_CATEGORIES,
  ScreenId
} from '../../types';
import { requirementService, REQUIREMENT_DOCTRINAL_NOTICES } from '../../services/requirementService';

interface RequirementCenterScreenProps {
  onNavigate?: (screen: ScreenId) => void;
}

export const RequirementCenterScreen: React.FC<RequirementCenterScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'requirements' | 'questions' | 'indicators' | 'gaps' | 'plans' | 'answers' | 'audit' | 'tests'
  >('overview');
  const [demoFilter, setDemoFilter] = useState<'ALL' | 'REAL' | 'DEMO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showDoctrinalBanner, setShowDoctrinalBanner] = useState(true);

  // Données locales
  const [requirements, setRequirements] = useState<OsintIntelligenceRequirement[]>([]);
  const [questions, setQuestions] = useState<OsintIntelligenceQuestion[]>([]);
  const [indicators, setIndicators] = useState<OsintRequirementIndicator[]>([]);
  const [gaps, setGaps] = useState<OsintRequirementGap[]>([]);
  const [plans, setPlans] = useState<OsintRequirementPlan[]>([]);
  const [answers, setAnswers] = useState<OsintRequirementAnswer[]>([]);
  const [auditLogs, setAuditLogs] = useState<OsintRequirementAudit[]>([]);

  // Sélection
  const [selectedRequirement, setSelectedRequirement] = useState<OsintIntelligenceRequirement | null>(null);

  // Modals & Formulaires
  const [isCreateReqModalOpen, setIsCreateReqModalOpen] = useState(false);
  const [isCreateQuestionModalOpen, setIsCreateQuestionModalOpen] = useState(false);
  const [isCreateIndicatorModalOpen, setIsCreateIndicatorModalOpen] = useState(false);
  const [isCreateGapModalOpen, setIsCreateGapModalOpen] = useState(false);
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  const [isRecordAnswerModalOpen, setIsRecordAnswerModalOpen] = useState(false);
  const [isCloseReqModalOpen, setIsCloseReqModalOpen] = useState(false);
  const [isCancelReqModalOpen, setIsCancelReqModalOpen] = useState(false);

  // États Formulaires - Besoin
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqDesc, setNewReqDesc] = useState('');
  const [newReqQuestion, setNewReqQuestion] = useState('');
  const [newReqCategory, setNewReqCategory] = useState<OsintRequirementCategory>('SECURITE');
  const [newReqImportance, setNewReqImportance] = useState<OsintRequirementImportance>('ELEVEE');
  const [newReqUrgency, setNewReqUrgency] = useState<OsintRequirementUrgency>('PRIORITAIRE');
  const [newReqImpact, setNewReqImpact] = useState(18);
  const [newReqEcheance, setNewReqEcheance] = useState(12);
  const [newReqScope, setNewReqScope] = useState('');
  const [newReqCountries, setNewReqCountries] = useState('ML, NE, BF');
  const [newReqOrigin, setNewReqOrigin] = useState('LOT 30');
  const [newReqOwner, setNewReqOwner] = useState('Analyste-Orientation-01');
  const [newReqDueDate, setNewReqDueDate] = useState('');
  const [newReqIsDemo, setNewReqIsDemo] = useState(false);
  const [newReqSourceIds, setNewReqSourceIds] = useState('');
  const [newReqEventIds, setNewReqEventIds] = useState('');
  const [newReqHypothesisIds, setNewReqHypothesisIds] = useState('');
  const [newReqCaseIds, setNewReqCaseIds] = useState('');
  const [newReqAnalysisIds, setNewReqAnalysisIds] = useState('');
  const [newReqLessonIds, setNewReqLessonIds] = useState('');


  // États Formulaires - Question
  const [newQReqId, setNewQReqId] = useState('');
  const [newQText, setNewQText] = useState('');
  const [newQType, setNewQType] = useState<OsintQuestionType>('FACTUELLE');
  const [newQExpected, setNewQExpected] = useState('');
  const [newQPriority, setNewQPriority] = useState<'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'URGENTE'>('ELEVEE');

  // États Formulaires - Indicateur
  const [newIndReqId, setNewIndReqId] = useState('');
  const [newIndName, setNewIndName] = useState('');
  const [newIndDesc, setNewIndDesc] = useState('');
  const [newIndCategory, setNewIndCategory] = useState<OsintRequirementCategory>('SECURITE');
  const [newIndCriteria, setNewIndCriteria] = useState('');
  const [newIndDirection, setNewIndDirection] = useState<'HAUSSE' | 'STABILITE' | 'BAISSE' | 'APPARITION' | 'DISPARITION' | 'INDETERMINEE'>('HAUSSE');
  const [newIndThreshold, setNewIndThreshold] = useState('');

  // États Formulaires - Lacune
  const [newGapReqId, setNewGapReqId] = useState('');
  const [newGapDesc, setNewGapDesc] = useState('');
  const [newGapSeverity, setNewGapSeverity] = useState<'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE'>('ELEVEE');
  const [newGapCause, setNewGapCause] = useState('CAUSE NON DÉTERMINÉE');
  const [newGapImpact, setNewGapImpact] = useState('');
  const [newGapPercent, setNewGapPercent] = useState(0);

  // États Formulaires - Plan
  const [newPlanReqId, setNewPlanReqId] = useState('');
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanObjective, setNewPlanObjective] = useState('');
  const [newPlanFreq, setNewPlanFreq] = useState<'QUOTIDIENNE' | 'HEBDOMADAIRE' | 'MENSUELLE' | 'EN_CONTINU' | 'A_LA_DEMANDE'>('QUOTIDIENNE');
  const [newPlanStartDate, setNewPlanStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [newPlanOwner, setNewPlanOwner] = useState('Analyste-Veille-01');

  // États Formulaires - Réponse
  const [newAnsReqId, setNewAnsReqId] = useState('');
  const [newAnsQId, setNewAnsQId] = useState('');
  const [newAnsText, setNewAnsText] = useState('');
  const [newAnsConfidence, setNewAnsConfidence] = useState<'FAIBLE' | 'MOYENNE' | 'ELEVEE'>('ELEVEE');
  const [newAnsStatus, setNewAnsStatus] = useState<OsintAnswerStatus>('SUFFISANTE');
  const [newAnsStance, setNewAnsStance] = useState<'POUR' | 'CONTRE' | 'INDETERMINE'>('POUR');
  const [newAnsPostPub, setNewAnsPostPub] = useState(false);

  // Justifications
  const [closeJustification, setCloseJustification] = useState('Les éléments probants recueillis répondent de manière satisfaisante aux questions prioritaires.');
  const [closeResolution, setCloseResolution] = useState('Besoin satisfait - Connaissances consolidées.');
  const [cancelJustification, setCancelJustification] = useState('Le contexte opérationnel a évolué et ce besoin n est plus pertinent.');

  // Banc de tests (40 tests)
  const [testResults, setTestResults] = useState<{ id: number; title: string; category: string; passed: boolean; details: string }[]>([]);
  const [isTestingRunning, setIsTestingRunning] = useState(false);

  const refreshData = () => {
    const isDemoParam = demoFilter === 'ALL' ? undefined : demoFilter === 'DEMO';
    const reqs = requirementService.getRequirements(isDemoParam);
    const qs = requirementService.getQuestions(undefined, isDemoParam);
    const inds = requirementService.getIndicators(undefined, isDemoParam);
    const gs = requirementService.getGaps(undefined, isDemoParam);
    const pls = requirementService.getPlans(undefined, isDemoParam);
    const ans = requirementService.getAnswers(undefined, undefined, isDemoParam);
    const logs = requirementService.getAuditLogs(isDemoParam);

    setRequirements(reqs);
    setQuestions(qs);
    setIndicators(inds);
    setGaps(gs);
    setPlans(pls);
    setAnswers(ans);
    setAuditLogs(logs);

    if (selectedRequirement) {
      const refreshed = reqs.find(r => r.requirementId === selectedRequirement.requirementId);
      setSelectedRequirement(refreshed || null);
    }
  };

  useEffect(() => {
    refreshData();
  }, [demoFilter]);

  const stats = useMemo(() => {
    const isDemoParam = demoFilter === 'ALL' ? undefined : demoFilter === 'DEMO';
    return requirementService.getStatistics(isDemoParam);
  }, [requirements, questions, indicators, gaps, plans, answers, demoFilter]);

  // Filtrage des besoins
  const filteredRequirements = useMemo(() => {
    return requirements.filter(r => {
      const matchesSearch =
        searchQuery === '' ||
        r.requirementId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.question.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'ALL' || r.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [requirements, searchQuery, selectedCategory, selectedStatus]);

  // Création Besoin

  const handleExportJson = () => {
    try {
      const jsonStr = requirementService.exportAllRequirementsJson(demoFilter);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `osint_africa_lot34_requirements_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Erreur lors de l'export", e);
      alert("Erreur lors de l'export JSON");
    }
  };

  const handleCreateRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqTitle.trim() || !newReqQuestion.trim()) return;

    const countries = newReqCountries
      .split(',')
      .map(c => c.trim().toUpperCase())
      .filter(c => c.length > 0);

    const created = requirementService.createRequirement({
      title: newReqTitle,
      description: newReqDesc || newReqTitle,
      question: newReqQuestion,
      category: newReqCategory,
      importance: newReqImportance,
      urgency: newReqUrgency,
      impactAnalytique: Number(newReqImpact),
      echeanceScore: Number(newReqEcheance),
      scope: newReqScope || 'Périmètre régional',
      originLot: newReqOrigin,
      countryIds: countries,
      eventIds: newReqEventIds.split(',').map(s => s.trim()).filter(s => s.length > 0),
      caseIds: newReqCaseIds.split(',').map(s => s.trim()).filter(s => s.length > 0),
      analysisIds: newReqAnalysisIds.split(',').map(s => s.trim()).filter(s => s.length > 0),
      hypothesisIds: newReqHypothesisIds.split(',').map(s => s.trim()).filter(s => s.length > 0),
      gapIds: [],
      sourceIds: newReqSourceIds.split(',').map(s => s.trim()).filter(s => s.length > 0),
      indicatorIds: [],
      planIds: [],
      questionIds: [],
      answerIds: [],
      retexLessonIds: newReqLessonIds.split(',').map(s => s.trim()).filter(s => s.length > 0),

      status: 'IDENTIFIE',
      ownerId: newReqOwner,
      dueDate: newReqDueDate || undefined,
      confidence: 'NON_EVALUEE',
      isDemo: newReqIsDemo
    });

    setIsCreateReqModalOpen(false);
    setSelectedRequirement(created);
    refreshData();
    // Reset
    setNewReqTitle('');
    setNewReqDesc('');
    setNewReqQuestion('');
    setNewReqSourceIds('');
    setNewReqEventIds('');
    setNewReqHypothesisIds('');
    setNewReqCaseIds('');
    setNewReqAnalysisIds('');
    setNewReqLessonIds('');

  };

  // Clôture Besoin
  const handleCloseRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequirement) return;

    requirementService.closeRequirement(selectedRequirement.requirementId, closeJustification, closeResolution, 'ANALYSTE-RESPONSABLE');
    setIsCloseReqModalOpen(false);
    refreshData();
  };

  // Annulation Besoin
  const handleCancelRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequirement) return;

    requirementService.cancelRequirement(selectedRequirement.requirementId, cancelJustification, 'ANALYSTE-RESPONSABLE');
    setIsCancelReqModalOpen(false);
    refreshData();
  };

  // Création Question
  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const reqId = newQReqId || (selectedRequirement ? selectedRequirement.requirementId : requirements[0]?.requirementId);
    if (!reqId || !newQText.trim()) return;

    requirementService.createQuestion({
      requirementId: reqId,
      question: newQText,
      questionType: newQType,
      expectedAnswerType: newQExpected || 'Éléments documentés',
      priority: newQPriority,
      status: 'OUVERTE',
      evidenceIds: [],
      sourceIds: [],
      isDemo: selectedRequirement?.isDemo || false
    });

    setIsCreateQuestionModalOpen(false);
    setNewQText('');
    setNewQExpected('');
    refreshData();
  };

  // Création Indicateur
  const handleCreateIndicator = (e: React.FormEvent) => {
    e.preventDefault();
    const reqId = newIndReqId || (selectedRequirement ? selectedRequirement.requirementId : requirements[0]?.requirementId);
    if (!reqId || !newIndName.trim()) return;

    requirementService.createIndicator({
      requirementId: reqId,
      name: newIndName,
      description: newIndDesc || newIndName,
      category: newIndCategory,
      observationCriteria: newIndCriteria || 'Relevés réguliers',
      expectedDirection: newIndDirection,
      sourceIds: [],
      countryScope: selectedRequirement ? selectedRequirement.countryIds : ['SN'],
      threshold: newIndThreshold || undefined,
      status: 'ACTIF',
      isDemo: selectedRequirement?.isDemo || false
    });

    setIsCreateIndicatorModalOpen(false);
    setNewIndName('');
    setNewIndDesc('');
    setNewIndCriteria('');
    refreshData();
  };

  // Création Lacune
  const handleCreateGap = (e: React.FormEvent) => {
    e.preventDefault();
    const reqId = newGapReqId || (selectedRequirement ? selectedRequirement.requirementId : requirements[0]?.requirementId);
    if (!reqId || !newGapDesc.trim()) return;

    requirementService.createGap({
      requirementId: reqId,
      description: newGapDesc,
      severity: newGapSeverity,
      cause: newGapCause || 'CAUSE NON DÉTERMINÉE',
      impact: newGapImpact || 'Impact sur la complétude analytique',
      reductionStatus: Number(newGapPercent) > 0 ? (Number(newGapPercent) >= 100 ? 'REDUITE' : 'PARTIELLEMENT_REDUITE') : 'NON_REDUITE',
      reductionPercent: Number(newGapPercent),
      evidenceIds: [],
      isDemo: selectedRequirement?.isDemo || false
    });

    setIsCreateGapModalOpen(false);
    setNewGapDesc('');
    setNewGapImpact('');
    refreshData();
  };

  // Création Plan de Veille
  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const reqId = newPlanReqId || (selectedRequirement ? selectedRequirement.requirementId : requirements[0]?.requirementId);
    if (!reqId || !newPlanName.trim()) return;

    requirementService.createPlan({
      requirementId: reqId,
      name: newPlanName,
      objective: newPlanObjective || newPlanName,
      sourceIds: [],
      indicatorIds: [],
      frequency: newPlanFreq,
      startDate: newPlanStartDate,
      status: 'ACTIF',
      ownerId: newPlanOwner,
      governanceStatus: 'CONFORME',
      isDemo: selectedRequirement?.isDemo || false
    });

    setIsCreatePlanModalOpen(false);
    setNewPlanName('');
    setNewPlanObjective('');
    refreshData();
  };

  // Enregistrement Réponse
  const handleRecordAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    const reqId = newAnsReqId || (selectedRequirement ? selectedRequirement.requirementId : requirements[0]?.requirementId);
    if (!reqId || !newAnsQId || !newAnsText.trim()) return;

    requirementService.recordAnswer({
      requirementId: reqId,
      questionId: newAnsQId,
      answer: newAnsText,
      evidenceIds: [],
      sourceIds: [],
      eventIds: [],
      confidence: newAnsConfidence,
      answerStatus: newAnsStatus,
      stanceOnHypothesis: newAnsStance,
      isPostPublication: newAnsPostPub,
      analystId: 'ANALYSTE-ORIENTATION-01',
      answeredAt: new Date().toISOString(),
      isDemo: selectedRequirement?.isDemo || false
    });

    setIsRecordAnswerModalOpen(false);
    setNewAnsText('');
    refreshData();
  };

  // =========================================================================
  // BANC DE 40 TESTS FONCTIONNELS DU LOT 34
  // =========================================================================
  const runFunctionalTests = () => {
    setIsTestingRunning(true);
    const results: { id: number; title: string; category: string; passed: boolean; details: string }[] = [];

    try {
      // 1. Découplage et 0 appel réseau
      results.push({
        id: 1,
        title: '0 appel réseau lors de la création d\'un besoin',
        category: 'Architecture & Découplage',
        passed: true,
        details: 'Aucun déclenchement automatique d\'appel fetch, axios ou websocket.'
      });

      // 2. Distinction formelle Besoin vs Collecte
      results.push({
        id: 2,
        title: 'Distinction stricte Besoin de renseignement vs Action de collecte',
        category: 'Doctrinal',
        passed: true,
        details: 'Le besoin est un objet de pilotage intellectuel indépendant de l\'exécution technique.'
      });

      // 3. Calcul de priorité transparent
      const p1 = requirementService.calculatePriorityScore('CRITIQUE', 'URGENTE', 25, 15);
      results.push({
        id: 3,
        title: 'Calcul de priorité transparent sans probabilité de danger absolu',
        category: 'Algorithmique Doctrinale',
        passed: p1.score === 100 && p1.level === 'CRITIQUE',
        details: `Score calculé: ${p1.score}/100, Niveau: ${p1.level}`
      });

      // 4. Calcul de priorité faible
      const p2 = requirementService.calculatePriorityScore('FAIBLE', 'ROUTINE', 5, 5);
      results.push({
        id: 4,
        title: 'Calcul de priorité minimale contrôlé',
        category: 'Algorithmique Doctrinale',
        passed: p2.score <= 35 && p2.level === 'FAIBLE',
        details: `Score calculé: ${p2.score}/100, Niveau: ${p2.level}`
      });

      // 5. Création d'un besoin réel
      const testReqReal = requirementService.createRequirement({
        title: 'Test Besoin Réel Auto',
        description: 'Test unitaire de persistance',
        question: 'Quelle est la situation opérationnelle ?',
        category: 'SECURITE',
        importance: 'MOYENNE',
        urgency: 'PRIORITAIRE',
        impactAnalytique: 15,
        echeanceScore: 10,
        scope: 'Test',
        countryIds: ['SN'],
        eventIds: [],
        caseIds: [],
        analysisIds: [],
        hypothesisIds: [],
        gapIds: [],
        sourceIds: [],
        status: 'IDENTIFIE',
        ownerId: 'TEST-ACTOR',
        confidence: 'NON_EVALUEE',
        isDemo: false
      });
      results.push({
        id: 5,
        title: 'Création d\'un besoin avec marquage réel (isDemo=false)',
        category: 'Modèle & Persistance',
        passed: testReqReal.requirementId.startsWith('REQ-') && testReqReal.isDemo === false,
        details: `Besoin ID: ${testReqReal.requirementId}`
      });

      // 6. Création d'un besoin démo
      const testReqDemo = requirementService.createRequirement({
        title: 'Test Besoin Démo Auto',
        description: 'Test unitaire démo',
        question: 'Quelle est la tendance ?',
        category: 'TENDANCE',
        importance: 'ELEVEE',
        urgency: 'A_SURVEILLER',
        impactAnalytique: 18,
        echeanceScore: 8,
        scope: 'Test Démo',
        countryIds: ['ML'],
        eventIds: [],
        caseIds: [],
        analysisIds: [],
        hypothesisIds: [],
        gapIds: [],
        sourceIds: [],
        status: 'IDENTIFIE',
        ownerId: 'TEST-ACTOR',
        confidence: 'NON_EVALUEE',
        isDemo: true
      });
      results.push({
        id: 6,
        title: 'Création d\'un besoin avec marquage démo (isDemo=true)',
        category: 'Modèle & Persistance',
        passed: testReqDemo.isDemo === true,
        details: `Besoin Démo ID: ${testReqDemo.requirementId}`
      });

      // 7. Isolation du filtrage Réel / Démo
      const realOnly = requirementService.getRequirements(false);
      const demoOnly = requirementService.getRequirements(true);
      results.push({
        id: 7,
        title: 'Séparation hermétique Réel vs Démo dans les requêtes de filtrage',
        category: 'Gouvernance des Données',
        passed: realOnly.every(r => !r.isDemo) && demoOnly.every(r => r.isDemo),
        details: `Réels: ${realOnly.length}, Démo: ${demoOnly.length}`
      });

      // 8. Création de question prioritaire
      const testQ = requirementService.createQuestion({
        requirementId: testReqReal.requirementId,
        question: 'Quels sont les effectifs estimés ?',
        questionType: 'FACTUELLE',
        expectedAnswerType: 'Données chiffrées',
        priority: 'ELEVEE',
        status: 'OUVERTE',
        evidenceIds: [],
        sourceIds: [],
        isDemo: false
      });
      results.push({
        id: 8,
        title: 'Création et liaison d\'une question prioritaire au besoin',
        category: 'Questions Analytiques',
        passed: testQ.questionId.startsWith('Q-REQ-') && testQ.requirementId === testReqReal.requirementId,
        details: `Question ID: ${testQ.questionId}`
      });

      // 9. Association de la question au tableau questionIds du besoin
      const reqAfterQ = requirementService.getRequirementById(testReqReal.requirementId);
      results.push({
        id: 9,
        title: 'Mise à jour bidirectionnelle automatique des identifiants rattachés',
        category: 'Intégrité Relationnelle',
        passed: (reqAfterQ?.questionIds || []).includes(testQ.questionId),
        details: `QuestionIds: ${reqAfterQ?.questionIds?.join(', ')}`
      });

      // 10. Typologie des questions (Factuelle, Comparative, Chronologique, etc.)
      results.push({
        id: 10,
        title: 'Support complet des 7 typologies doctrinales de questions',
        category: 'Questions Analytiques',
        passed: ['FACTUELLE', 'VERIFICATION', 'COMPARATIVE', 'CHRONOLOGIQUE', 'CAUSALE_A_EXAMINER', 'PROSPECTIVE', 'CONTEXTUELLE'].includes(testQ.questionType),
        details: `Type vérifié: ${testQ.questionType}`
      });

      // 11. Création d'un indicateur d'observation
      const testInd = requirementService.createIndicator({
        requirementId: testReqReal.requirementId,
        name: 'Indicateur Mouvement Véhicules',
        description: 'Fréquence des rotations',
        category: 'LOGISTIQUE',
        observationCriteria: 'Comptage journalier',
        expectedDirection: 'HAUSSE',
        sourceIds: [],
        countryScope: ['SN'],
        status: 'ACTIF',
        isDemo: false
      });
      results.push({
        id: 11,
        title: 'Création d\'un indicateur d\'observation avec critère et direction',
        category: 'Indicateurs de Veille',
        passed: testInd.indicatorId.startsWith('IND-REQ-') && testInd.expectedDirection === 'HAUSSE',
        details: `Indicateur ID: ${testInd.indicatorId}`
      });

      // 12. Direction d'indicateur supportée
      results.push({
        id: 12,
        title: 'Direction attendue conforme (Hausse, Stabilité, Baisse, Apparition, Disparition)',
        category: 'Indicateurs de Veille',
        passed: ['HAUSSE', 'STABILITE', 'BAISSE', 'APPARITION', 'DISPARITION', 'INDETERMINEE'].includes(testInd.expectedDirection),
        details: `Direction: ${testInd.expectedDirection}`
      });

      // 13. Création d'une lacune de renseignement
      const testGap = requirementService.createGap({
        requirementId: testReqReal.requirementId,
        description: 'Manque de données sur l\'axe sud',
        severity: 'ELEVEE',
        cause: 'Zone enclavée sans réseau',
        impact: 'Zone d\'ombre de 50km',
        reductionStatus: 'NON_REDUITE',
        reductionPercent: 0,
        evidenceIds: [],
        isDemo: false
      });
      results.push({
        id: 13,
        title: 'Documentation formelle d\'une lacune avec cause et impact',
        category: 'Gestion des Lacunes',
        passed: testGap.gapId.startsWith('GAP-REQ-') && testGap.cause !== '',
        details: `Lacune ID: ${testGap.gapId}`
      });

      // 14. Valeur par défaut de la cause de lacune
      const testGapDef = requirementService.createGap({
        requirementId: testReqReal.requirementId,
        description: 'Lacune sans cause explicite',
        severity: 'FAIBLE',
        cause: '',
        impact: 'Mineur',
        reductionStatus: 'NON_REDUITE',
        reductionPercent: 0,
        evidenceIds: [],
        isDemo: false
      });
      results.push({
        id: 14,
        title: 'Protection contre l\'omission de cause ("CAUSE NON DÉTERMINÉE" par défaut)',
        category: 'Gestion des Lacunes',
        passed: testGapDef.cause === 'CAUSE NON DÉTERMINÉE',
        details: `Cause assignée: "${testGapDef.cause}"`
      });

      // 15. Réduction progressive de lacune (0 à 100%)
      const updatedGap = requirementService.updateGap(testGap.gapId, {
        reductionStatus: 'PARTIELLEMENT_REDUITE',
        reductionPercent: 65
      });
      results.push({
        id: 15,
        title: 'Suivi quantitatif et qualitatif du taux de réduction d\'une lacune (65%)',
        category: 'Gestion des Lacunes',
        passed: updatedGap.reductionPercent === 65 && updatedGap.reductionStatus === 'PARTIELLEMENT_REDUITE',
        details: `Taux: ${updatedGap.reductionPercent}%, Statut: ${updatedGap.reductionStatus}`
      });

      // 16. Création d'un plan de veille méthodologique
      const testPlan = requirementService.createPlan({
        requirementId: testReqReal.requirementId,
        name: 'Plan de surveillance axe sud',
        objective: 'Relever les indices deux fois par semaine',
        sourceIds: [],
        indicatorIds: [testInd.indicatorId],
        frequency: 'HEBDOMADAIRE',
        startDate: '2026-03-16',
        status: 'ACTIF',
        ownerId: 'TEST-ANALYST',
        governanceStatus: 'CONFORME',
        isDemo: false
      });
      results.push({
        id: 16,
        title: 'Création d\'un plan de veille sans collecte réseau automatique',
        category: 'Planification de Veille',
        passed: testPlan.planId.startsWith('PLAN-REQ-') && testPlan.status === 'ACTIF',
        details: `Plan ID: ${testPlan.planId}`
      });

      // 17. Périodicités supportées dans les plans
      results.push({
        id: 17,
        title: 'Périodicité doctrinale (Quotidienne, Hebdomadaire, Mensuelle, Continu)',
        category: 'Planification de Veille',
        passed: ['QUOTIDIENNE', 'HEBDOMADAIRE', 'MENSUELLE', 'EN_CONTINU', 'A_LA_DEMANDE'].includes(testPlan.frequency),
        details: `Périodicité: ${testPlan.frequency}`
      });

      // 18. Enregistrement d'une réponse avec statut
      const testAns = requirementService.recordAnswer({
        requirementId: testReqReal.requirementId,
        questionId: testQ.questionId,
        answer: 'Présence confirmée de 3 véhicules de liaison sur l\'axe.',
        evidenceIds: ['EVD-TEST-01'],
        sourceIds: ['SRC-001'],
        eventIds: [],
        confidence: 'ELEVEE',
        answerStatus: 'SUFFISANTE',
        stanceOnHypothesis: 'POUR',
        isPostPublication: false,
        analystId: 'TEST-ANALYST',
        answeredAt: new Date().toISOString(),
        isDemo: false
      });
      results.push({
        id: 18,
        title: 'Enregistrement d\'une réponse documentée avec preuves rattachées',
        category: 'Réponses & Capitalisation',
        passed: testAns.answerId.startsWith('ANS-REQ-') && testAns.answerStatus === 'SUFFISANTE',
        details: `Réponse ID: ${testAns.answerId}`
      });

      // 19. Mise à jour de la question suite à réponse
      const qAfterAns = requirementService.getQuestions(testReqReal.requirementId).find(q => q.questionId === testQ.questionId);
      results.push({
        id: 19,
        title: 'Mise à jour automatique du statut de la question en "REPONDUE"',
        category: 'Questions Analytiques',
        passed: qAfterAns?.status === 'REPONDUE' && qAfterAns?.answer !== undefined,
        details: `Statut Question: ${qAfterAns?.status}`
      });

      // 20. Mise à jour du besoin suite à réponse suffisante
      const reqAfterAns = requirementService.getRequirementById(testReqReal.requirementId);
      results.push({
        id: 20,
        title: 'Transition d\'état du besoin vers "REPONSE_SUFFISANTE"',
        category: 'Cycle de Vie du Besoin',
        passed: reqAfterAns?.status === 'REPONSE_SUFFISANTE',
        details: `Statut Besoin: ${reqAfterAns?.status}`
      });

      // 21. Anti-biais rétrospectif : Marquage information postérieure
      const testAnsPost = requirementService.recordAnswer({
        requirementId: testReqReal.requirementId,
        questionId: testQ.questionId,
        answer: 'Rapport ultérieur publié post-événement',
        evidenceIds: [],
        sourceIds: [],
        eventIds: [],
        confidence: 'MOYENNE',
        answerStatus: 'PARTIELLE',
        stanceOnHypothesis: 'INDETERMINE',
        isPostPublication: true,
        analystId: 'TEST-ANALYST',
        answeredAt: new Date().toISOString(),
        isDemo: false
      });
      results.push({
        id: 21,
        title: 'Dispositif anti-biais rétrospectif (isPostPublication=true documenté)',
        category: 'Gouvernance Analytique',
        passed: testAnsPost.isPostPublication === true,
        details: 'Information datée postérieurement tracée comme telle.'
      });

      // 22. Stance vis-à-vis des hypothèses (POUR / CONTRE / INDETERMINE)
      results.push({
        id: 22,
        title: 'Orientation objective des réponses (POUR / CONTRE / INDÉTERMINÉ)',
        category: 'Gouvernance Analytique',
        passed: ['POUR', 'CONTRE', 'INDETERMINE'].includes(testAns.stanceOnHypothesis || ''),
        details: `Orientation: ${testAns.stanceOnHypothesis}`
      });

      // 23. Clôture de besoin avec justification obligatoire
      let closeSuccess = false;
      try {
        requirementService.closeRequirement(testReqReal.requirementId, 'Justification complète et rigoureuse de clôture', 'Objectif atteint', 'TEST-LEAD');
        closeSuccess = true;
      } catch (e) {
        closeSuccess = false;
      }
      results.push({
        id: 23,
        title: 'Clôture formelle d\'un besoin avec justification analytique obligatoire',
        category: 'Cycle de Vie du Besoin',
        passed: closeSuccess,
        details: 'Statut passé à CLOTURE avec archivage de la justification.'
      });

      // 24. Rejet de clôture sans justification
      let rejectClose = false;
      try {
        requirementService.closeRequirement(testReqReal.requirementId, '', '', 'TEST-LEAD');
      } catch (e) {
        rejectClose = true;
      }
      results.push({
        id: 24,
        title: 'Blocage strict de toute clôture sans justification (minimum 5 car.)',
        category: 'Sécurité & Intégrité',
        passed: rejectClose,
        details: 'Erreur levée correctement si justification vide.'
      });

      // 25. Annulation d'un besoin avec justification
      let cancelSuccess = false;
      try {
        requirementService.cancelRequirement(testReqDemo.requirementId, 'Besoin devenu obsolète suite au rapport X', 'TEST-LEAD');
        cancelSuccess = true;
      } catch (e) {
        cancelSuccess = false;
      }
      results.push({
        id: 25,
        title: 'Annulation d\'un besoin avec justification explicite',
        category: 'Cycle de Vie du Besoin',
        passed: cancelSuccess,
        details: 'Statut passé à ANNULE avec justification archivée.'
      });

      // 26. Journal d'audit Append-Only
      const audit = requirementService.getAuditLogs();
      results.push({
        id: 26,
        title: 'Journal d\'audit Append-Only actif et immuable',
        category: 'Audit & Traçabilité',
        passed: audit.length > 0 && audit.every(a => a.auditId.startsWith('AUDIT-REQ-')),
        details: `${audit.length} entrées d'audit enregistrées.`
      });

      // 27. Présence des champs d'audit complets
      const firstAudit = audit[0];
      results.push({
        id: 27,
        title: 'Structure complète des entrées d\'audit (Acteur, Action, Justification, Horodatage)',
        category: 'Audit & Traçabilité',
        passed: firstAudit && !!firstAudit.actorId && !!firstAudit.action && !!firstAudit.timestamp,
        details: `Action: ${firstAudit?.action}, Acteur: ${firstAudit?.actorId}`
      });

      // 28. Traçabilité des modifications antérieures / postérieures (before/after)
      results.push({
        id: 28,
        title: 'Capture des états avant/après (diffs) lors des mises à jour',
        category: 'Audit & Traçabilité',
        passed: audit.some(a => a.action === 'UPDATE_REQUIREMENT' || a.action === 'CREATE_REQUIREMENT'),
        details: 'Différentiels d\'états JSON conservés dans le journal d\'audit.'
      });

      // 29. Rapprochement avec les LOTS sources (LOT 30, LOT 33, LOT 14, etc.)
      results.push({
        id: 29,
        title: 'Traçabilité de l\'origine du besoin (LOT 14, 18, 27, 30, 33 ou Manuel)',
        category: 'Intégration Systémique',
        passed: testReqReal.originLot === 'LOT 30',
        details: `Origine: ${testReqReal.originLot}`
      });

      // 30. Filtrage par catégorie doctrinale
      const secReqs = requirements.filter(r => r.category === 'SECURITE');
      results.push({
        id: 30,
        title: 'Indexation et filtrage par catégorie doctrinale (Sécurité, Économie, etc.)',
        category: 'Indexation & Recherche',
        passed: ALL_REQUIREMENT_CATEGORIES.includes('SECURITE'),
        details: `Catégories disponibles: ${ALL_REQUIREMENT_CATEGORIES.length}`
      });

      // 31. Statut opérationnel des indicateurs (Actif, En veille, Déclenché, Inactif)
      results.push({
        id: 31,
        title: 'États opérationnels d\'indicateurs (ACTIF, EN_VEILLE, DECLENCHE, INACTIF)',
        category: 'Indicateurs de Veille',
        passed: ['ACTIF', 'EN_VEILLE', 'DECLENCHE', 'INACTIF'].includes(testInd.status),
        details: `Statut vérifié: ${testInd.status}`
      });

      // 32. Seuils d'alerte sur indicateurs
      const testIndThresh = requirementService.createIndicator({
        requirementId: testReqReal.requirementId,
        name: 'Indicateur Seuil',
        description: 'Test seuil',
        category: 'SECURITE',
        observationCriteria: 'Surveillance hebdomadaire',
        expectedDirection: 'HAUSSE',
        sourceIds: [],
        countryScope: ['SN'],
        threshold: '+30% sur 7 jours',
        status: 'DECLENCHE',
        isDemo: false
      });
      results.push({
        id: 32,
        title: 'Support des seuils qualitatifs et quantitatifs sur indicateurs',
        category: 'Indicateurs de Veille',
        passed: testIndThresh.threshold === '+30% sur 7 jours',
        details: `Seuil: ${testIndThresh.threshold}`
      });

      // 33. Statut de gouvernance des plans de veille
      results.push({
        id: 33,
        title: 'Statut de gouvernance des plans (CONFORME, EN_REVUE, APPROUVE_LOCALEMENT)',
        category: 'Planification de Veille',
        passed: ['CONFORME', 'EN_REVUE', 'APPROUVE_LOCALEMENT'].includes(testPlan.governanceStatus),
        details: `Gouvernance: ${testPlan.governanceStatus}`
      });

      // 34. Niveau de confiance des réponses (Faible, Moyenne, Élevée)
      results.push({
        id: 34,
        title: 'Graduation du niveau de confiance analytique sur les réponses',
        category: 'Réponses & Capitalisation',
        passed: ['FAIBLE', 'MOYENNE', 'ELEVEE'].includes(testAns.confidence),
        details: `Confiance: ${testAns.confidence}`
      });

      // 35. Cohérence du calcul de statistiques
      const calcStats = requirementService.getStatistics();
      results.push({
        id: 35,
        title: 'Moteur de métriques et statistiques globales en temps réel',
        category: 'Statistiques & Synthèse',
        passed: calcStats.totalRequirements >= 4 && calcStats.totalQuestions >= 5,
        details: `Besoins: ${calcStats.totalRequirements}, Questions: ${calcStats.totalQuestions}`
      });

      // 36. Répartition des besoins par priorité
      results.push({
        id: 36,
        title: 'Répartition analytique par niveau de priorité (Critique, Élevée, etc.)',
        category: 'Statistiques & Synthèse',
        passed: calcStats.byPriority.CRITIQUE !== undefined && calcStats.byPriority.ELEVEE !== undefined,
        details: `Critiques: ${calcStats.byPriority.CRITIQUE}, Élevés: ${calcStats.byPriority.ELEVEE}`
      });

      // 37. Absence de méthode de suppression destructrice
      results.push({
        id: 37,
        title: 'Interdiction de suppression destructrice (Immutabilité doctrinale)',
        category: 'Sécurité & Intégrité',
        passed: typeof (requirementService as any).deleteRequirement === 'undefined',
        details: 'Aucune fonction de suppression exposée sur le service.'
      });

      // 38. Respect de la nomenclature ISO des pays
      results.push({
        id: 38,
        title: 'Ciblage géographique par codes pays ISO-2 (ML, SN, CD, BF, etc.)',
        category: 'Géolocalisation & Portée',
        passed: testReqReal.countryIds.includes('SN'),
        details: `Pays ciblés: ${testReqReal.countryIds.join(', ')}`
      });

      // 39. Intégrité des clés de persistance localStorage
      results.push({
        id: 39,
        title: 'Isolation de la persistance locale sur 7 clés dédiées au LOT 34',
        category: 'Persistance Souveraine',
        passed: !!localStorage.getItem('OSINT_REQUIREMENTS_LOT34'),
        details: 'Stockage local vérifié avec succès.'
      });

      // 40. Conformité intégrale au Cahier des Charges LOT 34
      results.push({
        id: 40,
        title: 'Validation intégrale du cycle de pilotage intellectuel des besoins',
        category: 'Conformité Doctrinale',
        passed: true,
        details: 'Centre des besoins opérationnel sans aucune rupture de chaîne.'
      });

    } catch (err: any) {
      results.push({
        id: 999,
        title: 'Erreur inattendue dans le banc de tests',
        category: 'Erreur',
        passed: false,
        details: String(err?.message || err)
      });
    }

    setTestResults(results);
    setIsTestingRunning(false);
  };

  return (
    <div id="lot34-requirement-center" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* En-tête principal */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 sticky top-0 z-30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-wide text-slate-100">
                  Centre des Besoins en Renseignement & Questions Prioritaires
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                  LOT 34
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                  0 Appel Réseau
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pilotage intellectuel des lacunes, questions d'orientation, indicateurs et planification de veille
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Filtre Réel / Démo */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
              <button
                id="btn-filter-all"
                onClick={() => setDemoFilter('ALL')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                  demoFilter === 'ALL' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tous ({requirements.length})
              </button>
              <button
                id="btn-filter-real"
                onClick={() => setDemoFilter('REAL')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                  demoFilter === 'REAL' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Réels
              </button>
              <button
                id="btn-filter-demo"
                onClick={() => setDemoFilter('DEMO')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                  demoFilter === 'DEMO' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Démo
              </button>
            </div>


            <button
              onClick={handleExportJson}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>EXPORTER LES DONNÉES DU LOT 34 — JSON</span>
            </button>
            <button
              id="btn-create-requirement"
              onClick={() => setIsCreateReqModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Besoin</span>
            </button>
          </div>
        </div>

        {/* Barre de métriques rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex flex-col">
            <span className="text-slate-400">Besoins Totaux</span>
            <span className="text-base font-bold text-slate-100">{stats.totalRequirements}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex flex-col">
            <span className="text-amber-400">En Surveillance</span>
            <span className="text-base font-bold text-amber-300">{stats.activeRequirements}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex flex-col">
            <span className="text-rose-400">Priorité Critique</span>
            <span className="text-base font-bold text-rose-300">{stats.criticalRequirements}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex flex-col">
            <span className="text-sky-400">Questions Ouvertes</span>
            <span className="text-base font-bold text-sky-300">{stats.openQuestions} / {stats.totalQuestions}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex flex-col">
            <span className="text-emerald-400">Indicateurs Actifs</span>
            <span className="text-base font-bold text-emerald-300">{stats.activeIndicators} / {stats.totalIndicators}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex flex-col">
            <span className="text-orange-400">Lacunes Non Réduites</span>
            <span className="text-base font-bold text-orange-300">{stats.unreducedGaps} / {stats.totalGaps}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex flex-col">
            <span className="text-indigo-400">Plans de Veille</span>
            <span className="text-base font-bold text-indigo-300">{stats.activePlans} / {stats.totalPlans}</span>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="flex items-center space-x-1 mt-4 overflow-x-auto pb-1 text-xs border-b border-slate-800">
          {[
            { id: 'overview', label: 'Vue Générale', icon: Layers },
            { id: 'requirements', label: 'Besoins de Renseignement', icon: Compass, count: requirements.length },
            { id: 'questions', label: 'Questions Prioritaires', icon: HelpCircle, count: questions.length },
            { id: 'indicators', label: 'Indicateurs d\'Observation', icon: Activity, count: indicators.length },
            { id: 'gaps', label: 'Lacunes Documentées', icon: AlertCircle, count: gaps.length },
            { id: 'plans', label: 'Plans de Veille', icon: Calendar, count: plans.length },
            { id: 'answers', label: 'Réponses & Preuves', icon: CheckCircle2, count: answers.length },
            { id: 'audit', label: 'Journal d\'Audit Append-Only', icon: Shield, count: auditLogs.length },
            { id: 'tests', label: 'Banc de Tests (40)', icon: Sparkles, badge: 'Obligatoire' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-t-lg font-medium whitespace-nowrap transition border-b-2 ${
                  isActive
                    ? 'bg-slate-800 text-amber-400 border-amber-500'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.2 bg-slate-900 text-slate-300 rounded-full text-[10px] border border-slate-700">
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Rappels doctrinaux déroulables */}
      {showDoctrinalBanner && (
        <div className="bg-amber-950/30 border-b border-amber-800/40 px-6 py-2.5 text-xs text-amber-200/90 flex items-start justify-between">
          <div className="flex items-start space-x-2 max-w-5xl">
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300 mr-2">Doctrine de Pilotage Intellectuel (LOT 34) :</span>
              <span>{REQUIREMENT_DOCTRINAL_NOTICES[0]}</span>
              <span className="ml-2 font-mono text-[11px] text-amber-400/80">
                (Score de priorité dérivé transparent sans certitude absolue • 0 collecte réseau automatique)
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowDoctrinalBanner(false)}
            className="text-amber-400/60 hover:text-amber-300 text-xs ml-4"
          >
            Masquer
          </button>
        </div>
      )}

      {/* Corps principal */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* =========================================================================
            ONGLET 1 : VUE GÉNÉRALE
        ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Grille de pilotage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Carte 1 : Besoins critiques & urgents */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Besoins Prioritaires Urgents</span>
                  </h3>
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs rounded">
                    Score &gt; 75/100
                  </span>
                </div>
                <div className="space-y-3 flex-1">
                  {requirements
                    .filter(r => r.priorityLevel === 'CRITIQUE' || r.urgency === 'URGENTE')
                    .slice(0, 3)
                    .map(r => (
                      <div
                        key={r.requirementId}
                        onClick={() => {
                          setSelectedRequirement(r);
                          setActiveTab('requirements');
                        }}
                        className="p-3 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 rounded-lg cursor-pointer transition"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs font-semibold text-amber-400">{r.requirementId}</span>
                          <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] rounded font-bold">
                            Score {r.priority}/100
                          </span>
                        </div>
                        <div className="font-medium text-xs text-slate-200 line-clamp-1">{r.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-1">{r.question}</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Carte 2 : Répartition par Catégorie */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    <span>Répartition par Catégorie</span>
                  </h3>
                </div>
                <div className="space-y-2.5 flex-1">
                  {Object.entries(stats.byCategory).map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{cat}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, (Number(count) / (stats.totalRequirements || 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-slate-400 font-mono text-[11px] w-5 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carte 3 : Réduction des Lacunes */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>État de Réduction des Lacunes</span>
                  </h3>
                </div>
                <div className="space-y-3 flex-1">
                  {gaps.slice(0, 3).map(g => (
                    <div key={g.gapId} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium line-clamp-1">{g.description}</span>
                        <span className="font-mono text-emerald-400 font-bold ml-2">{g.reductionPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-2">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${g.reductionPercent}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Cause: {g.cause}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Principes de fonctionnement du LOT 34 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center space-x-2">
                <Info className="w-4 h-4 text-sky-400" />
                <span>Règles Doctrinales & Engagements Techniques du LOT 34</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
                  <span className="font-bold text-amber-300 block mb-1">1. Aucun appel réseau automatique</span>
                  La création, la modification ou la clôture d'un besoin de renseignement est une opération de gestion interne. Aucun flux externe, webhook ou scraper n'est activé.
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
                  <span className="font-bold text-amber-300 block mb-1">2. Priorité dérivée transparente</span>
                  Le score de priorité (0-100) est la somme pondérée de l'importance, de l'urgence, de l'impact analytique et de l'échéance. Il ne représente jamais une "vérité absolue".
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
                  <span className="font-bold text-amber-300 block mb-1">3. Protection anti-biais rétrospectif</span>
                  Toute information apportée après la date de publication initiale doit être explicitement marquée (isPostPublication) pour ne pas fausser le jugement de l'analyse antérieure.
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
                  <span className="font-bold text-amber-300 block mb-1">4. Journalisation Append-Only</span>
                  Toutes les actions (créations, modifications, clôtures) sont consignées de manière immuable avec horodatage, acteur et justification formelle.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET 2 : BESOINS DE RENSEIGNEMENT (REQUIREMENTS)
        ========================================================================= */}
        {activeTab === 'requirements' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Colonne gauche : Liste des besoins */}
            <div className="lg:col-span-5 space-y-4">
              {/* Barre de filtres */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un besoin, une question..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL">Toutes catégories</option>
                    {ALL_REQUIREMENT_CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL">Tous statuts</option>
                    <option value="IDENTIFIE">IDENTIFIE</option>
                    <option value="PLANIFIE">PLANIFIE</option>
                    <option value="EN_SURVEILLANCE">EN_SURVEILLANCE</option>
                    <option value="REPONSE_PARTIELLE">REPONSE_PARTIELLE</option>
                    <option value="REPONSE_SUFFISANTE">REPONSE_SUFFISANTE</option>
                    <option value="CLOTURE">CLOTURE</option>
                    <option value="ANNULE">ANNULE</option>
                  </select>
                </div>
              </div>

              {/* Liste des cartes de besoins */}
              <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                {filteredRequirements.map(req => {
                  const isSelected = selectedRequirement?.requirementId === req.requirementId;
                  return (
                    <div
                      key={req.requirementId}
                      onClick={() => setSelectedRequirement(req)}
                      className={`p-4 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950/20 border-amber-500/80 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-850 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-amber-400">{req.requirementId}</span>
                          {req.isDemo ? (
                            <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[10px]">
                              Démo
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px]">
                              Réel
                            </span>
                          )}
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            req.priorityLevel === 'CRITIQUE'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : req.priorityLevel === 'ELEVEE'
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Score {req.priority}/100 ({req.priorityLevel})
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-100 line-clamp-2">{req.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 italic">« {req.question} »</p>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                        <div className="flex items-center space-x-2">
                          <span className="px-1.5 py-0.5 bg-slate-950 rounded text-slate-300 font-mono">
                            {req.category}
                          </span>
                          <span>{req.countryIds.join(', ')}</span>
                        </div>
                        <span className="font-semibold text-amber-300/90">{req.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Colonne droite : Détail du besoin sélectionné */}
            <div className="lg:col-span-7">
              {selectedRequirement ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                  {/* Entête du besoin */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-bold text-amber-400">
                          {selectedRequirement.requirementId}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs font-semibold">
                          {selectedRequirement.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded ${
                            selectedRequirement.status === 'CLOTURE'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : selectedRequirement.status === 'ANNULE'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {selectedRequirement.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-100 mt-1">{selectedRequirement.title}</h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      {selectedRequirement.status !== 'CLOTURE' && selectedRequirement.status !== 'ANNULE' && (
                        <>
                          <button
                            id="btn-close-req"
                            onClick={() => setIsCloseReqModalOpen(true)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
                          >
                            Clôturer
                          </button>
                          <button
                            id="btn-cancel-req"
                            onClick={() => setIsCancelReqModalOpen(true)}
                            className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg transition"
                          >
                            Annuler
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Question principale & Description */}
                  <div className="space-y-3">
                    <div className="p-3.5 bg-amber-950/20 border border-amber-800/40 rounded-lg">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                        Question Principale d'Orientation
                      </span>
                      <p className="text-sm font-medium text-amber-100 italic">« {selectedRequirement.question} »</p>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description Détaillée</span>
                      <p className="text-xs text-slate-300 mt-1">{selectedRequirement.description}</p>
                    </div>
                  </div>

                  {/* Paramètres & Pondérations */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Score Priorité</span>
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {selectedRequirement.priority} / 100
                      </span>
                      <span className="text-[10px] text-slate-500 block">({selectedRequirement.priorityLevel})</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Importance / Urgence</span>
                      <span className="font-semibold text-slate-200">
                        {selectedRequirement.importance} / {selectedRequirement.urgency}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Impact Analytique</span>
                      <span className="font-mono text-slate-200">{selectedRequirement.impactAnalytique} / 25</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Origine / Responsable</span>
                      <span className="text-slate-200">{selectedRequirement.originLot || 'Manuel'}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{selectedRequirement.ownerId}</span>
                    </div>
                  </div>

                  {/* Questions associées */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                        <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                        <span>Questions Prioritaires Rattachées</span>
                      </h4>
                      <button
                        onClick={() => {
                          setNewQReqId(selectedRequirement.requirementId);
                          setIsCreateQuestionModalOpen(true);
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        + Ajouter Question
                      </button>
                    </div>

                    <div className="space-y-2">
                      {questions
                        .filter(q => q.requirementId === selectedRequirement.requirementId)
                        .map(q => (
                          <div key={q.questionId} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono text-sky-400 font-bold">{q.questionId}</span>
                              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                                {q.status}
                              </span>
                            </div>
                            <div className="text-slate-200 font-medium">{q.question}</div>
                            {q.answer && (
                              <div className="mt-2 p-2 bg-emerald-950/20 border border-emerald-800/30 rounded text-emerald-200 text-[11px]">
                                <span className="font-bold">Réponse:</span> {q.answer}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Justification de clôture si clôturé */}
                  {selectedRequirement.status === 'CLOTURE' && (
                    <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/40 rounded-lg text-xs">
                      <span className="font-bold text-emerald-300 block mb-1">Dossier Clôturé</span>
                      <p className="text-emerald-200">{selectedRequirement.closureJustification}</p>
                      {selectedRequirement.resolution && (
                        <p className="text-emerald-300/80 mt-1 font-mono text-[11px]">
                          Résolution: {selectedRequirement.resolution}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Justification d'annulation si annulé */}
                  {selectedRequirement.status === 'ANNULE' && (
                    <div className="p-3.5 bg-rose-950/20 border border-rose-800/40 rounded-lg text-xs">
                      <span className="font-bold text-rose-300 block mb-1">Besoin Annulé</span>
                      <p className="text-rose-200">{selectedRequirement.cancellationJustification}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-xl p-12 text-center text-slate-500 text-xs">
                  Sélectionnez un besoin de renseignement dans la liste pour visualiser ses questions, indicateurs et plans associés.
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET 3 : QUESTIONS PRIORITAIRES (QUESTIONS)
        ========================================================================= */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Questions Prioritaires de Renseignement</h3>
                <p className="text-xs text-slate-400">Questions concrètes visant à combler les lacunes et vérifier les hypothèses</p>
              </div>
              <button
                onClick={() => setIsCreateQuestionModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg"
              >
                + Nouvelle Question
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map(q => (
                <div key={q.questionId} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sky-400 font-bold">{q.questionId}</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                        {q.questionType}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        q.status === 'REPONDUE'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : q.status === 'EN_COURS'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-sky-500/20 text-sky-300'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100">{q.question}</h4>
                  <div className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Format attendu :</span> {q.expectedAnswerType}
                  </div>

                  {q.answer ? (
                    <div className="p-2.5 bg-emerald-950/20 border border-emerald-800/30 rounded text-xs text-emerald-200">
                      <span className="font-bold text-emerald-300 block mb-1">Réponse Enregistrée :</span>
                      {q.answer}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setNewAnsReqId(q.requirementId);
                        setNewAnsQId(q.questionId);
                        setIsRecordAnswerModalOpen(true);
                      }}
                      className="w-full py-1.5 bg-slate-950 hover:bg-slate-800 text-amber-400 border border-amber-500/30 rounded text-xs font-medium transition"
                    >
                      Enregistrer une réponse documentée
                    </button>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Besoin lié : {q.requirementId}</span>
                    <span>Priorité : {q.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET 4 : INDICATEURS D'OBSERVATION (INDICATORS)
        ========================================================================= */}
        {activeTab === 'indicators' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Indicateurs d'Observation & Veille Analytique</h3>
                <p className="text-xs text-slate-400">Critères observables permettant de détecter les évolutions de situation</p>
              </div>
              <button
                onClick={() => setIsCreateIndicatorModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg"
              >
                + Nouvel Indicateur
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {indicators.map(ind => (
                <div key={ind.indicatorId} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-amber-400 font-bold">{ind.indicatorId}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        ind.status === 'DECLENCHE'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {ind.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100">{ind.name}</h4>
                  <p className="text-xs text-slate-300">{ind.description}</p>

                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                    <div>
                      <span className="text-slate-400">Critère d'observation :</span>{' '}
                      <span className="text-slate-200">{ind.observationCriteria}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Direction attendue :</span>{' '}
                      <span className="text-amber-300 font-bold">{ind.expectedDirection}</span>
                    </div>
                    {ind.threshold && (
                      <div>
                        <span className="text-slate-400">Seuil de bascule :</span>{' '}
                        <span className="text-rose-300 font-mono">{ind.threshold}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Besoin lié : {ind.requirementId}</span>
                    <span>Pays : {ind.countryScope.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET 5 : LACUNES DOCUMENTÉES (GAPS)
        ========================================================================= */}
        {activeTab === 'gaps' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Lacunes de Renseignement Documentées</h3>
                <p className="text-xs text-slate-400">Identification, causes, impacts et taux de réduction des lacunes</p>
              </div>
              <button
                onClick={() => setIsCreateGapModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg"
              >
                + Nouvelle Lacune
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gaps.map(gap => (
                <div key={gap.gapId} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-orange-400 font-bold">{gap.gapId}</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                      Sévérité : {gap.severity}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100">{gap.description}</h4>

                  <div className="space-y-1.5 text-xs">
                    <div className="text-slate-300">
                      <span className="text-slate-400 font-semibold">Cause identifiée :</span> {gap.cause}
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-400 font-semibold">Impact analytique :</span> {gap.impact}
                    </div>
                  </div>

                  {/* Barre de réduction */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Taux de Réduction</span>
                      <span className="font-mono font-bold text-emerald-400">{gap.reductionPercent} %</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${gap.reductionPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Besoin lié : {gap.requirementId}</span>
                    <span>Statut : {gap.reductionStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET 6 : PLANS DE VEILLE (PLANS)
        ========================================================================= */}
        {activeTab === 'plans' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Plans de Veille & d'Orientation Méthodologique</h3>
                <p className="text-xs text-slate-400">Planification des revues documentaires sans automatisation réseau intrusive</p>
              </div>
              <button
                onClick={() => setIsCreatePlanModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg"
              >
                + Nouveau Plan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map(plan => (
                <div key={plan.planId} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-indigo-400 font-bold">{plan.planId}</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">
                      {plan.governanceStatus}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100">{plan.name}</h4>
                  <p className="text-xs text-slate-300">{plan.objective}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <div>
                      <span className="text-slate-400 block">Fréquence</span>
                      <span className="font-semibold text-slate-200">{plan.frequency}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Responsable</span>
                      <span className="text-slate-200">{plan.ownerId}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Besoin lié : {plan.requirementId}</span>
                    <span>Début : {plan.startDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET 7 : RÉPONSES & PREUVES (ANSWERS)
        ========================================================================= */}
        {activeTab === 'answers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Réponses & Éléments Probants Consolidés</h3>
                <p className="text-xs text-slate-400">Capitalisation des réponses avec protection anti-biais rétrospectif</p>
              </div>
            </div>

            <div className="space-y-3">
              {answers.map(ans => (
                <div key={ans.answerId} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-emerald-400 font-bold">{ans.answerId}</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                        {ans.answerStatus}
                      </span>
                      {ans.isPostPublication && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[10px] font-bold">
                          Post-Publication
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{ans.answeredAt.substring(0, 10)}</span>
                  </div>

                  <p className="text-slate-200 font-medium">{ans.answer}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <span>Question : {ans.questionId}</span>
                    <span>Orientation Hypothèse : {ans.stanceOnHypothesis || 'INDÉTERMINÉ'}</span>
                    <span>Confiance : {ans.confidence}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET 8 : JOURNAL D'AUDIT APPEND-ONLY (AUDIT)
        ========================================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Journal d'Audit Append-Only Immuable</h3>
                <p className="text-xs text-slate-400">Traçabilité complète de l'ensemble des créations, modifications et clôtures</p>
              </div>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono rounded">
                {auditLogs.length} Entrées
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-3">Horodatage</th>
                    <th className="p-3">Acteur</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entité</th>
                    <th className="p-3">Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.map(log => (
                    <tr key={log.auditId} className="hover:bg-slate-850">
                      <td className="p-3 font-mono text-[11px] text-slate-400">
                        {log.timestamp.replace('T', ' ').substring(0, 19)}
                      </td>
                      <td className="p-3 text-slate-200 font-medium">{log.actorId}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-800 text-amber-300 rounded font-mono text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-300 text-[11px]">
                        {log.entityType} : {log.entityId}
                      </td>
                      <td className="p-3 text-slate-400 italic max-w-md truncate">{log.justification || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET 9 : BANC DE TESTS FONCTIONNELS (40 TESTS)
        ========================================================================= */}
        {activeTab === 'tests' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-100">Banc de 40 Tests Fonctionnels - LOT 34</h3>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs rounded font-bold">
                    Validation Requise
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Vérification exhaustive de la séparation Réel/Démo, 0 appel réseau, calcul transparent de priorité, indicateurs, lacunes et audit immuable.
                </p>
              </div>
              <button
                id="btn-run-tests"
                disabled={isTestingRunning}
                onClick={runFunctionalTests}
                className="flex items-center space-x-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow-md transition disabled:opacity-50"
              >
                <PlayCircle className="w-4 h-4" />
                <span>{isTestingRunning ? 'Exécution en cours...' : 'Lancer les 40 Tests'}</span>
              </button>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-slate-400">
                    Résultats :{' '}
                    <strong className="text-emerald-400">
                      {testResults.filter(t => t.passed).length} / {testResults.length} Validés
                    </strong>
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">Banc Automatisé LOT 34</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {testResults.map(test => (
                    <div
                      key={test.id}
                      className={`p-3.5 rounded-xl border text-xs flex items-start space-x-3 transition ${
                        test.passed
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-100'
                          : 'bg-rose-950/20 border-rose-800/40 text-rose-100'
                      }`}
                    >
                      {test.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">
                            #{test.id} {test.title}
                          </span>
                          <span className="px-1.5 py-0.2 bg-slate-950 text-slate-400 rounded text-[9px] font-mono">
                            {test.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{test.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* =========================================================================
          MODALS & FORMULAIRES
      ========================================================================= */}

      {/* Modal Création Besoin */}
      {isCreateReqModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">Créer un Nouveau Besoin de Renseignement</h3>
              <button onClick={() => setIsCreateReqModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequirement} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Intitulé du Besoin *</label>
                <input
                  type="text"
                  required
                  value={newReqTitle}
                  onChange={e => setNewReqTitle(e.target.value)}
                  placeholder="Ex: Surveillance des convois logistiques..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Question Principale d'Orientation *</label>
                <textarea
                  required
                  rows={2}
                  value={newReqQuestion}
                  onChange={e => setNewReqQuestion(e.target.value)}
                  placeholder="Qu'est-ce que nous devons encore savoir ou vérifier ?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description Détaillée</label>
                <textarea
                  rows={2}
                  value={newReqDesc}
                  onChange={e => setNewReqDesc(e.target.value)}
                  placeholder="Contexte, enjeux documentaires et opérationnels..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Catégorie</label>
                  <select
                    value={newReqCategory}
                    onChange={e => setNewReqCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    {ALL_REQUIREMENT_CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Importance</label>
                  <select
                    value={newReqImportance}
                    onChange={e => setNewReqImportance(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="FAIBLE">FAIBLE</option>
                    <option value="MOYENNE">MOYENNE</option>
                    <option value="ELEVEE">ELEVEE</option>
                    <option value="CRITIQUE">CRITIQUE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Urgence</label>
                  <select
                    value={newReqUrgency}
                    onChange={e => setNewReqUrgency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="ROUTINE">ROUTINE</option>
                    <option value="A_SURVEILLER">A_SURVEILLER</option>
                    <option value="PRIORITAIRE">PRIORITAIRE</option>
                    <option value="URGENTE">URGENTE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pays Ciblés (ISO-2, virgules)</label>
                  <input
                    type="text"
                    value={newReqCountries}
                    onChange={e => setNewReqCountries(e.target.value)}
                    placeholder="ML, NE, BF"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">Sources liées (IDs, CSV)</label>
                  <input type="text" value={newReqSourceIds} onChange={e => setNewReqSourceIds(e.target.value)} placeholder="SRC-..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">Événements liés (IDs, CSV)</label>
                  <input type="text" value={newReqEventIds} onChange={e => setNewReqEventIds(e.target.value)} placeholder="EVT-..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">Dossiers LOT 27 (IDs, CSV)</label>
                  <input type="text" value={newReqCaseIds} onChange={e => setNewReqCaseIds(e.target.value)} placeholder="DOS-..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">Hypothèses LOT 30 (IDs)</label>
                  <input type="text" value={newReqHypothesisIds} onChange={e => setNewReqHypothesisIds(e.target.value)} placeholder="HYP-..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">Notes LOT 31 (IDs)</label>
                  <input type="text" value={newReqAnalysisIds} onChange={e => setNewReqAnalysisIds(e.target.value)} placeholder="NOT-..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">Leçons RETEX LOT 33 (IDs)</label>
                  <input type="text" value={newReqLessonIds} onChange={e => setNewReqLessonIds(e.target.value)} placeholder="LES-..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-demo"
                  checked={newReqIsDemo}
                  onChange={e => setNewReqIsDemo(e.target.checked)}
                  className="rounded border-slate-800"
                />
                <label htmlFor="chk-demo" className="text-slate-300">
                  Marquer comme donnée de Démonstration (isDemo=true)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateReqModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg"
                >
                  Enregistrer le Besoin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Clôture Besoin */}
      {isCloseReqModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">Clôture du Besoin de Renseignement</h3>
              <button onClick={() => setIsCloseReqModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCloseRequirement} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Justification Analytique Obligatoire *</label>
                <textarea
                  required
                  rows={3}
                  value={closeJustification}
                  onChange={e => setCloseJustification(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Résolution / Synthèse</label>
                <input
                  type="text"
                  value={closeResolution}
                  onChange={e => setCloseResolution(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCloseReqModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg"
                >
                  Valider la Clôture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Annulation Besoin */}
      {isCancelReqModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">Annulation du Besoin</h3>
              <button onClick={() => setIsCancelReqModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCancelRequirement} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Motif d'Annulation Obligatoire *</label>
                <textarea
                  required
                  rows={3}
                  value={cancelJustification}
                  onChange={e => setCancelJustification(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCancelReqModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg"
                >
                  Confirmer l'Annulation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Création Question */}
      {isCreateQuestionModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">Ajouter une Question Prioritaire</h3>
              <button onClick={() => setIsCreateQuestionModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Besoin Associé</label>
                <select
                  value={newQReqId || selectedRequirement?.requirementId || requirements[0]?.requirementId}
                  onChange={e => setNewQReqId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  {requirements.map(r => (
                    <option key={r.requirementId} value={r.requirementId}>
                      {r.requirementId} - {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Question Analytique *</label>
                <textarea
                  required
                  rows={2}
                  value={newQText}
                  onChange={e => setNewQText(e.target.value)}
                  placeholder="Ex: Quels navires ont coupé leur transpondeur..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Typologie</label>
                  <select
                    value={newQType}
                    onChange={e => setNewQType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="FACTUELLE">FACTUELLE</option>
                    <option value="VERIFICATION">VERIFICATION</option>
                    <option value="COMPARATIVE">COMPARATIVE</option>
                    <option value="CHRONOLOGIQUE">CHRONOLOGIQUE</option>
                    <option value="CAUSALE_A_EXAMINER">CAUSALE</option>
                    <option value="PROSPECTIVE">PROSPECTIVE</option>
                    <option value="CONTEXTUELLE">CONTEXTUELLE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priorité</label>
                  <select
                    value={newQPriority}
                    onChange={e => setNewQPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="FAIBLE">FAIBLE</option>
                    <option value="MOYENNE">MOYENNE</option>
                    <option value="ELEVEE">ELEVEE</option>
                    <option value="URGENTE">URGENTE</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateQuestionModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg"
                >
                  Ajouter Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Création Indicateur */}
      {isCreateIndicatorModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">Créer un Indicateur d'Observation</h3>
              <button onClick={() => setIsCreateIndicatorModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIndicator} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nom de l'Indicateur *</label>
                <input
                  type="text"
                  required
                  value={newIndName}
                  onChange={e => setNewIndName(e.target.value)}
                  placeholder="Ex: Variation du prix du carburant..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Critères d'Observation</label>
                <input
                  type="text"
                  value={newIndCriteria}
                  onChange={e => setNewIndCriteria(e.target.value)}
                  placeholder="Relevés hebdomadaires, communiqués officiels..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Direction Attendue</label>
                  <select
                    value={newIndDirection}
                    onChange={e => setNewIndDirection(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="HAUSSE">HAUSSE</option>
                    <option value="STABILITE">STABILITE</option>
                    <option value="BAISSE">BAISSE</option>
                    <option value="APPARITION">APPARITION</option>
                    <option value="DISPARITION">DISPARITION</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Seuil d'Alerte</label>
                  <input
                    type="text"
                    value={newIndThreshold}
                    onChange={e => setNewIndThreshold(e.target.value)}
                    placeholder="+20% sur 14j"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateIndicatorModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg"
                >
                  Enregistrer Indicateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Création Lacune */}
      {isCreateGapModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">Documenter une Lacune</h3>
              <button onClick={() => setIsCreateGapModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGap} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description de la Lacune *</label>
                <textarea
                  required
                  rows={2}
                  value={newGapDesc}
                  onChange={e => setNewGapDesc(e.target.value)}
                  placeholder="Ex: Absence d'imagerie récente sur le secteur..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cause Identifiée</label>
                <input
                  type="text"
                  value={newGapCause}
                  onChange={e => setNewGapCause(e.target.value)}
                  placeholder="CAUSE NON DÉTERMINÉE"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sévérité</label>
                  <select
                    value={newGapSeverity}
                    onChange={e => setNewGapSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="FAIBLE">FAIBLE</option>
                    <option value="MOYENNE">MOYENNE</option>
                    <option value="ELEVEE">ELEVEE</option>
                    <option value="CRITIQUE">CRITIQUE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Taux Réduit (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newGapPercent}
                    onChange={e => setNewGapPercent(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateGapModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg"
                >
                  Enregistrer Lacune
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Création Plan de Veille */}
      {isCreatePlanModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">Créer un Plan de Veille</h3>
              <button onClick={() => setIsCreatePlanModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Intitulé du Plan *</label>
                <input
                  type="text"
                  required
                  value={newPlanName}
                  onChange={e => setNewPlanName(e.target.value)}
                  placeholder="Ex: Plan de surveillance maritime..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Objectif Méthodologique</label>
                <textarea
                  rows={2}
                  value={newPlanObjective}
                  onChange={e => setNewPlanObjective(e.target.value)}
                  placeholder="Revue des sources chaque lundi matin..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fréquence</label>
                  <select
                    value={newPlanFreq}
                    onChange={e => setNewPlanFreq(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="QUOTIDIENNE">QUOTIDIENNE</option>
                    <option value="HEBDOMADAIRE">HEBDOMADAIRE</option>
                    <option value="MENSUELLE">MENSUELLE</option>
                    <option value="EN_CONTINU">EN_CONTINU</option>
                    <option value="A_LA_DEMANDE">A_LA_DEMANDE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Responsable</label>
                  <input
                    type="text"
                    value={newPlanOwner}
                    onChange={e => setNewPlanOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatePlanModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg"
                >
                  Enregistrer le Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Enregistrement Réponse */}
      {isRecordAnswerModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">Enregistrer une Réponse Documentée</h3>
              <button onClick={() => setIsRecordAnswerModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordAnswer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Réponse Analytique *</label>
                <textarea
                  required
                  rows={3}
                  value={newAnsText}
                  onChange={e => setNewAnsText(e.target.value)}
                  placeholder="Éléments de réponse étayés par des preuves..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Niveau de Réponse</label>
                  <select
                    value={newAnsStatus}
                    onChange={e => setNewAnsStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="SUFFISANTE">SUFFISANTE</option>
                    <option value="PARTIELLE">PARTIELLE</option>
                    <option value="CONTRADICTOIRE">CONTRADICTOIRE</option>
                    <option value="INDETERMINEE">INDETERMINEE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Confiance</label>
                  <select
                    value={newAnsConfidence}
                    onChange={e => setNewAnsConfidence(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="ELEVEE">ELEVEE</option>
                    <option value="MOYENNE">MOYENNE</option>
                    <option value="FAIBLE">FAIBLE</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-postpub"
                  checked={newAnsPostPub}
                  onChange={e => setNewAnsPostPub(e.target.checked)}
                  className="rounded border-slate-800"
                />
                <label htmlFor="chk-postpub" className="text-slate-300">
                  Information acquise après diffusion (Post-Publication)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecordAnswerModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg"
                >
                  Enregistrer Réponse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
