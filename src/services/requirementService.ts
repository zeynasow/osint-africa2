/**
 * OSINT AFRICA - LOT 34 : Centre des Besoins en Renseignement, Questions Prioritaires et Planification de Veille
 * Moteur souverain local : Pilotage intellectuel des besoins, questions d'orientation, indicateurs, lacunes, plans de veille et audit append-only.
 * 0 appel réseau. Respect strict du principe : Distinction entre BESOIN et ACTION DE COLLECTE.
 */

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
  OsintAnswerStatus
} from '../types';

const STORAGE_KEYS = {
  REQUIREMENTS: 'OSINT_REQUIREMENTS_LOT34',
  QUESTIONS: 'OSINT_REQUIREMENT_QUESTIONS_LOT34',
  INDICATORS: 'OSINT_REQUIREMENT_INDICATORS_LOT34',
  ANSWERS: 'OSINT_REQUIREMENT_ANSWERS_LOT34',
  GAPS: 'OSINT_REQUIREMENT_GAPS_LOT34',
  PLANS: 'OSINT_REQUIREMENT_PLANS_LOT34',
  AUDIT: 'OSINT_REQUIREMENT_AUDIT_LOT34'
};

export const REQUIREMENT_DOCTRINAL_NOTICES = [
  "La création d'un besoin ne doit jamais déclencher automatiquement une requête Internet.",
  "Le LOT 34 distingue formellement le BESOIN DE RENSEIGNEMENT (pilotage intellectuel) de l'ACTION DE COLLECTE (exécution opérationnelle).",
  "La priorité globale est dérivée d'un score transparent (importance + urgence + impact analytique + criticité échéance) et jamais comme probabilité de menace ou vérité absolue.",
  "Une question analytique vise à combler une lacune ou tester une hypothèse sans induire de biais de confirmation.",
  "Les indicateurs de veille surveillent des critères observables sans affirmer une vérité définitive.",
  "Une réponse partielle ou suffisante documente les preuves associées et leur niveau de confiance sans préjuger des événements futurs.",
  "Toute clôture ou annulation de besoin exige une justification analytique formelle tracée dans l'audit append-only.",
  "La séparation stricte entre données réelles et données de démonstration (isDemo) est garantie sur toutes les entités."
];

class RequirementService {
  private requirements: OsintIntelligenceRequirement[] = [];
  private questions: OsintIntelligenceQuestion[] = [];
  private indicators: OsintRequirementIndicator[] = [];
  private answers: OsintRequirementAnswer[] = [];
  private gaps: OsintRequirementGap[] = [];
  private plans: OsintRequirementPlan[] = [];
  private auditLogs: OsintRequirementAudit[] = [];

  constructor() {
    this.loadState();
    if (this.requirements.length === 0) {
      this.initDemoData();
    }
  }

  private loadState() {
    try {
      const storedReqs = localStorage.getItem(STORAGE_KEYS.REQUIREMENTS);
      const storedQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      const storedIndicators = localStorage.getItem(STORAGE_KEYS.INDICATORS);
      const storedAnswers = localStorage.getItem(STORAGE_KEYS.ANSWERS);
      const storedGaps = localStorage.getItem(STORAGE_KEYS.GAPS);
      const storedPlans = localStorage.getItem(STORAGE_KEYS.PLANS);
      const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT);

      if (storedReqs) this.requirements = JSON.parse(storedReqs);
      if (storedQuestions) this.questions = JSON.parse(storedQuestions);
      if (storedIndicators) this.indicators = JSON.parse(storedIndicators);
      if (storedAnswers) this.answers = JSON.parse(storedAnswers);
      if (storedGaps) this.gaps = JSON.parse(storedGaps);
      if (storedPlans) this.plans = JSON.parse(storedPlans);
      if (storedAudit) this.auditLogs = JSON.parse(storedAudit);
    } catch (e) {
      console.error('Erreur chargement LOT 34 localStorage', e);
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(this.requirements));
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(this.questions));
      localStorage.setItem(STORAGE_KEYS.INDICATORS, JSON.stringify(this.indicators));
      localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(this.answers));
      localStorage.setItem(STORAGE_KEYS.GAPS, JSON.stringify(this.gaps));
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(this.plans));
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.error('Erreur persistance LOT 34', e);
    }
  }

  // Journal d'audit Append-Only strict
  public addAuditLog(
    actorId: string,
    action: string,
    entityType: string,
    entityId: string,
    justification?: string,
    before?: string,
    after?: string,
    isDemo: boolean = false
  ): OsintRequirementAudit {
    const log: OsintRequirementAudit = {
      auditId: `AUDIT-REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorId,
      action,
      entityType,
      entityId,
      justification,
      before,
      after,
      provenance: 'LOT34_REQUIREMENT_CENTER',
      isDemo
    };
    this.auditLogs.unshift(log);
    this.persist();
    return log;
  }

  // Calcul transparent du score de priorité de traitement (0 à 100)
  public calculatePriorityScore(
    importance: OsintRequirementImportance,
    urgency: OsintRequirementUrgency,
    impactAnalytique: number = 15,
    echeanceScore: number = 15
  ): { score: number; level: 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE' } {
    let importanceScore = 15;
    if (importance === 'FAIBLE') importanceScore = 10;
    else if (importance === 'MOYENNE') importanceScore = 20;
    else if (importance === 'ELEVEE') importanceScore = 30;
    else if (importance === 'CRITIQUE') importanceScore = 40;

    let urgencyScore = 5;
    if (urgency === 'ROUTINE') urgencyScore = 5;
    else if (urgency === 'A_SURVEILLER') urgencyScore = 10;
    else if (urgency === 'PRIORITAIRE') urgencyScore = 15;
    else if (urgency === 'URGENTE') urgencyScore = 20;

    const clampedImpact = Math.max(0, Math.min(25, impactAnalytique));
    const clampedEcheance = Math.max(0, Math.min(15, echeanceScore));

    const total = Math.min(100, Math.round(importanceScore + urgencyScore + clampedImpact + clampedEcheance));

    let level: 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE' = 'MOYENNE';
    if (total < 35) level = 'FAIBLE';
    else if (total < 65) level = 'MOYENNE';
    else if (total < 85) level = 'ELEVEE';
    else level = 'CRITIQUE';

    return { score: total, level };
  }

  // =========================================================================
  // GESTION DES BESOINS DE RENSEIGNEMENT (REQUIREMENTS)
  // =========================================================================

  public getRequirements(filterDemo?: boolean): OsintIntelligenceRequirement[] {
    if (filterDemo === undefined) return [...this.requirements];
    return this.requirements.filter(r => r.isDemo === filterDemo);
  }

  public getRequirementById(requirementId: string): OsintIntelligenceRequirement | undefined {
    return this.requirements.find(r => r.requirementId === requirementId);
  }


  private validateReferences(req: Partial<OsintIntelligenceRequirement>) {
    const validateIds = (ids: string[] | undefined, storageKey: string, entityName: string, idField: string = 'id') => {
      if (!ids || ids.length === 0) return;
      const stored = localStorage.getItem(storageKey);
      const items: any[] = stored ? JSON.parse(stored) : [];
      const validIds = items.map(item => item[idField]);
      ids.forEach(id => {
        if (!validIds.includes(id)) {
          throw new Error(`Référence invalide : ${entityName} ${id} inexistante`);
        }
      });
    };

    validateIds(req.sourceIds, 'osint_africa_sources_v2', 'Source');
    validateIds(req.eventIds, 'osint_africa_events_v2', 'Événement');
    validateIds(req.caseIds, 'osint_africa_dossiers_v2', 'Dossier LOT 27');
    validateIds(req.hypothesisIds, 'OSINT_HYPOTHESES_LOT30', 'Hypothèse LOT 30', 'hypothesisId');
    validateIds(req.analysisIds, 'OSINT_NOTES_LOT31', 'Note LOT 31');
    validateIds(req.retexLessonIds, 'OSINT_LESSONS_LEARNED_LOT33', 'Leçon RETEX LOT 33', 'lessonId');
    validateIds(req.retexEvaluationIds, 'OSINT_POST_EVALUATIONS_LOT33', 'Évaluation RETEX LOT 33', 'evaluationId');
  }

  public createRequirement(
    req: Omit<OsintIntelligenceRequirement, 'requirementId' | 'priority' | 'priorityLevel' | 'createdAt' | 'updatedAt' | 'provenance'>,
    actorId: string = 'ANALYSTE-REF-01'
  ): OsintIntelligenceRequirement {
    this.validateReferences(req);
    const calculated = this.calculatePriorityScore(req.importance, req.urgency, req.impactAnalytique, req.echeanceScore);

    const newReq: OsintIntelligenceRequirement = {
      ...req,
      requirementId: `REQ-${new Date().getFullYear()}-${String(this.requirements.length + 1).padStart(3, '0')}`,
      priority: calculated.score,
      priorityLevel: calculated.level,
      countryIds: req.countryIds || [],
      eventIds: req.eventIds || [],
      caseIds: req.caseIds || [],
      analysisIds: req.analysisIds || [],
      hypothesisIds: req.hypothesisIds || [],
      gapIds: req.gapIds || [],
      sourceIds: req.sourceIds || [],
      indicatorIds: req.indicatorIds || [],
      planIds: req.planIds || [],
      questionIds: req.questionIds || [],
      answerIds: req.answerIds || [],
      retexLessonIds: req.retexLessonIds || [],
      retexEvaluationIds: req.retexEvaluationIds || [],
      status: req.status || 'IDENTIFIE',
      confidence: req.confidence || 'NON_EVALUEE',
      provenance: 'LOT34_REQUIREMENT_CENTER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.requirements.unshift(newReq);
    this.addAuditLog(actorId, 'CREATE_REQUIREMENT', 'REQUIREMENT', newReq.requirementId, 'Création d\'un nouveau besoin de renseignement', undefined, JSON.stringify(newReq), newReq.isDemo);
    this.persist();
    return newReq;
  }

  public updateRequirement(
    requirementId: string,
    updates: Partial<OsintIntelligenceRequirement>,
    actorId: string = 'ANALYSTE-REF-01',
    justification?: string
  ): OsintIntelligenceRequirement {
    const index = this.requirements.findIndex(r => r.requirementId === requirementId);
    this.validateReferences(updates);
    if (index === -1) throw new Error(`Besoin ${requirementId} non trouvé`);

    const current = this.requirements[index];
    if (current.status === 'CLOTURE') {
      throw new Error("Un besoin clôturé est immuable. Toute modification nécessite la création d'une nouvelle version ou d'un nouveau besoin.");
    }

    let calculatedPriority = current.priority;
    let calculatedLevel = current.priorityLevel;
    if (updates.importance || updates.urgency || updates.impactAnalytique !== undefined || updates.echeanceScore !== undefined) {
      const imp = updates.importance || current.importance;
      const urg = updates.urgency || current.urgency;
      const impAn = updates.impactAnalytique !== undefined ? updates.impactAnalytique : current.impactAnalytique;
      const ech = updates.echeanceScore !== undefined ? updates.echeanceScore : current.echeanceScore;
      const res = this.calculatePriorityScore(imp, urg, impAn, ech);
      calculatedPriority = res.score;
      calculatedLevel = res.level;
    }

    const updated: OsintIntelligenceRequirement = {
      ...current,
      ...updates,
      priority: calculatedPriority,
      priorityLevel: calculatedLevel,
      updatedAt: new Date().toISOString()
    };

    this.requirements[index] = updated;
    this.addAuditLog(
      actorId,
      'UPDATE_REQUIREMENT',
      'REQUIREMENT',
      requirementId,
      justification || 'Mise à jour des paramètres du besoin',
      JSON.stringify(current),
      JSON.stringify(updated),
      updated.isDemo
    );
    this.persist();
    return updated;
  }

  public closeRequirement(
    requirementId: string,
    justification: string,
    resolution: string,
    actorId: string = 'ANALYSTE-REF-01'
  ): OsintIntelligenceRequirement {
    if (!justification || justification.trim().length < 5) {
      throw new Error("Une justification détaillée est obligatoire pour clôturer un besoin de renseignement.");
    }
    return this.updateRequirement(
      requirementId,
      {
        status: 'CLOTURE',
        closureJustification: justification,
        resolution
      },
      actorId,
      `Clôture du besoin: ${justification}`
    );
  }

  public cancelRequirement(
    requirementId: string,
    justification: string,
    actorId: string = 'ANALYSTE-REF-01'
  ): OsintIntelligenceRequirement {
    if (!justification || justification.trim().length < 5) {
      throw new Error("Une justification détaillée est obligatoire pour annuler un besoin.");
    }
    return this.updateRequirement(
      requirementId,
      {
        status: 'ANNULE',
        cancellationJustification: justification
      },
      actorId,
      `Annulation du besoin: ${justification}`
    );
  }

  // =========================================================================
  // GESTION DES QUESTIONS PRIORITAIRES (QUESTIONS)
  // =========================================================================

  public getQuestions(requirementId?: string, filterDemo?: boolean): OsintIntelligenceQuestion[] {
    let list = [...this.questions];
    if (requirementId) list = list.filter(q => q.requirementId === requirementId);
    if (filterDemo !== undefined) list = list.filter(q => q.isDemo === filterDemo);
    return list;
  }

  public createQuestion(
    questionData: Omit<OsintIntelligenceQuestion, 'questionId' | 'createdAt' | 'updatedAt' | 'provenance'>,
    actorId: string = 'ANALYSTE-REF-01'
  ): OsintIntelligenceQuestion {
    const newQ: OsintIntelligenceQuestion = {
      ...questionData,
      questionId: `Q-REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      evidenceIds: questionData.evidenceIds || [],
      sourceIds: questionData.sourceIds || [],
      eventIds: questionData.eventIds || [],
      hypothesisIds: questionData.hypothesisIds || [],
      status: questionData.status || 'OUVERTE',
      provenance: 'LOT34_REQUIREMENT_CENTER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.questions.unshift(newQ);

    // Lier la question au besoin parent
    const req = this.getRequirementById(newQ.requirementId);
    if (req) {
      const qIds = req.questionIds || [];
      if (!qIds.includes(newQ.questionId)) {
        this.updateRequirement(req.requirementId, { questionIds: [...qIds, newQ.questionId] }, actorId, 'Ajout d\'une question prioritaire');
      }
    }

    this.addAuditLog(actorId, 'CREATE_QUESTION', 'QUESTION', newQ.questionId, `Ajout de la question pour le besoin ${newQ.requirementId}`, undefined, JSON.stringify(newQ), newQ.isDemo);
    this.persist();
    return newQ;
  }

  public updateQuestion(
    questionId: string,
    updates: Partial<OsintIntelligenceQuestion>,
    actorId: string = 'ANALYSTE-REF-01',
    justification?: string
  ): OsintIntelligenceQuestion {
    const index = this.questions.findIndex(q => q.questionId === questionId);
    if (index === -1) throw new Error(`Question ${questionId} non trouvée`);

    const current = this.questions[index];
    const updated: OsintIntelligenceQuestion = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.questions[index] = updated;
    this.addAuditLog(actorId, 'UPDATE_QUESTION', 'QUESTION', questionId, justification || 'Mise à jour de la question analytique', JSON.stringify(current), JSON.stringify(updated), updated.isDemo);
    this.persist();
    return updated;
  }

  // =========================================================================
  // GESTION DES INDICATEURS D'OBSERVATION (INDICATORS)
  // =========================================================================

  public getIndicators(requirementId?: string, filterDemo?: boolean): OsintRequirementIndicator[] {
    let list = [...this.indicators];
    if (requirementId) list = list.filter(i => i.requirementId === requirementId);
    if (filterDemo !== undefined) list = list.filter(i => i.isDemo === filterDemo);
    return list;
  }

  public createIndicator(
    indicatorData: Omit<OsintRequirementIndicator, 'indicatorId' | 'createdAt' | 'updatedAt' | 'provenance'>,
    actorId: string = 'ANALYSTE-REF-01'
  ): OsintRequirementIndicator {
    const newInd: OsintRequirementIndicator = {
      ...indicatorData,
      indicatorId: `IND-REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sourceIds: indicatorData.sourceIds || [],
      countryScope: indicatorData.countryScope || [],
      status: indicatorData.status || 'ACTIF',
      provenance: 'LOT34_REQUIREMENT_CENTER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.indicators.unshift(newInd);

    // Lier l'indicateur au besoin parent
    const req = this.getRequirementById(newInd.requirementId);
    if (req) {
      const indIds = req.indicatorIds || [];
      if (!indIds.includes(newInd.indicatorId)) {
        this.updateRequirement(req.requirementId, { indicatorIds: [...indIds, newInd.indicatorId] }, actorId, 'Ajout d\'un indicateur de veille');
      }
    }

    this.addAuditLog(actorId, 'CREATE_INDICATOR', 'INDICATOR', newInd.indicatorId, `Création indicateur: ${newInd.name}`, undefined, JSON.stringify(newInd), newInd.isDemo);
    this.persist();
    return newInd;
  }

  public updateIndicator(
    indicatorId: string,
    updates: Partial<OsintRequirementIndicator>,
    actorId: string = 'ANALYSTE-REF-01',
    justification?: string
  ): OsintRequirementIndicator {
    const index = this.indicators.findIndex(i => i.indicatorId === indicatorId);
    if (index === -1) throw new Error(`Indicateur ${indicatorId} non trouvé`);

    const current = this.indicators[index];
    const updated: OsintRequirementIndicator = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.indicators[index] = updated;
    this.addAuditLog(actorId, 'UPDATE_INDICATOR', 'INDICATOR', indicatorId, justification || 'Mise à jour de l\'indicateur', JSON.stringify(current), JSON.stringify(updated), updated.isDemo);
    this.persist();
    return updated;
  }

  // =========================================================================
  // GESTION DES RÉPONSES AUX BESOINS ET QUESTIONS (ANSWERS)
  // =========================================================================

  public getAnswers(requirementId?: string, questionId?: string, filterDemo?: boolean): OsintRequirementAnswer[] {
    let list = [...this.answers];
    if (requirementId) list = list.filter(a => a.requirementId === requirementId);
    if (questionId) list = list.filter(a => a.questionId === questionId);
    if (filterDemo !== undefined) list = list.filter(a => a.isDemo === filterDemo);
    return list;
  }

  public recordAnswer(
    answerData: Omit<OsintRequirementAnswer, 'answerId' | 'createdAt' | 'provenance'>,
    actorId: string = 'ANALYSTE-REF-01'
  ): OsintRequirementAnswer {
    // Validation
    const validateIds = (ids: string[] | undefined, storageKey: string, entityName: string, idField: string = 'id') => {
      if (!ids || ids.length === 0) return;
      const stored = localStorage.getItem(storageKey);
      const items: any[] = stored ? JSON.parse(stored) : [];
      const validIds = items.map(item => item[idField]);
      ids.forEach(id => {
        if (!validIds.includes(id)) {
          throw new Error(`Référence invalide : ${entityName} ${id} inexistante`);
        }
      });
    };
    validateIds(answerData.sourceIds, 'osint_africa_sources_v2', 'Source');
    validateIds(answerData.evidenceIds, 'osint_africa_evidence_v2', 'Preuve');

    const newAnswer: OsintRequirementAnswer = {
      ...answerData,
      answerId: `ANS-REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      evidenceIds: answerData.evidenceIds || [],
      sourceIds: answerData.sourceIds || [],
      eventIds: answerData.eventIds || [],
      provenance: 'LOT34_REQUIREMENT_CENTER',
      createdAt: new Date().toISOString()
    };

    this.answers.unshift(newAnswer);

    // Mettre à jour le statut de la question
    const q = this.questions.find(item => item.questionId === newAnswer.questionId);
    if (q) {
      let nextStatus: 'OUVERTE' | 'EN_COURS' | 'REPONDUE' | 'CONTRADICTOIRE' | 'INDETERMINEE' | 'ABANDONNEE' = 'REPONDUE';
      if (newAnswer.answerStatus === 'PARTIELLE') nextStatus = 'EN_COURS';
      else if (newAnswer.answerStatus === 'CONTRADICTOIRE') nextStatus = 'CONTRADICTOIRE';
      else if (newAnswer.answerStatus === 'INDETERMINEE') nextStatus = 'INDETERMINEE';

      this.updateQuestion(q.questionId, {
        status: nextStatus,
        answer: newAnswer.answer,
        answerConfidence: newAnswer.confidence
      }, actorId, 'Enregistrement d\'une réponse documentée');
    }

    // Mettre à jour le besoin parent si statut suffisant
    const req = this.getRequirementById(newAnswer.requirementId);
    if (req) {
      const ansIds = req.answerIds || [];
      const newStatus = newAnswer.answerStatus === 'SUFFISANTE' ? 'REPONSE_SUFFISANTE' : 'REPONSE_PARTIELLE';
      this.updateRequirement(req.requirementId, {
        answerIds: [...ansIds, newAnswer.answerId],
        status: req.status === 'CLOTURE' ? req.status : newStatus,
        confidence: newAnswer.confidence
      }, actorId, 'Mise à jour suite à nouvel élément de réponse');
    }

    this.addAuditLog(actorId, 'RECORD_ANSWER', 'ANSWER', newAnswer.answerId, `Réponse apportée à la question ${newAnswer.questionId}`, undefined, JSON.stringify(newAnswer), newAnswer.isDemo);
    this.persist();
    return newAnswer;
  }

  // =========================================================================
  // GESTION DES LACUNES DE RENSEIGNEMENT (GAPS)
  // =========================================================================

  public getGaps(requirementId?: string, filterDemo?: boolean): OsintRequirementGap[] {
    let list = [...this.gaps];
    if (requirementId) list = list.filter(g => g.requirementId === requirementId);
    if (filterDemo !== undefined) list = list.filter(g => g.isDemo === filterDemo);
    return list;
  }

  public createGap(
    gapData: Omit<OsintRequirementGap, 'gapId' | 'createdAt' | 'updatedAt' | 'provenance'>,
    actorId: string = 'ANALYSTE-REF-01'
  ): OsintRequirementGap {
    const newGap: OsintRequirementGap = {
      ...gapData,
      gapId: `GAP-REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      cause: gapData.cause && gapData.cause.trim().length > 0 ? gapData.cause : "CAUSE NON DÉTERMINÉE",
      reductionPercent: Math.max(0, Math.min(100, gapData.reductionPercent || 0)),
      evidenceIds: gapData.evidenceIds || [],
      provenance: 'LOT34_REQUIREMENT_CENTER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.gaps.unshift(newGap);

    const req = this.getRequirementById(newGap.requirementId);
    if (req) {
      const gIds = req.gapIds || [];
      if (!gIds.includes(newGap.gapId)) {
        this.updateRequirement(req.requirementId, { gapIds: [...gIds, newGap.gapId] }, actorId, 'Association d\'une lacune de renseignement');
      }
    }

    this.addAuditLog(actorId, 'CREATE_GAP', 'GAP', newGap.gapId, `Création lacune: ${newGap.description.substring(0, 40)}`, undefined, JSON.stringify(newGap), newGap.isDemo);
    this.persist();
    return newGap;
  }

  public updateGap(
    gapId: string,
    updates: Partial<OsintRequirementGap>,
    actorId: string = 'ANALYSTE-REF-01',
    justification?: string
  ): OsintRequirementGap {
    const index = this.gaps.findIndex(g => g.gapId === gapId);
    if (index === -1) throw new Error(`Lacune ${gapId} non trouvée`);

    const current = this.gaps[index];
    const updated: OsintRequirementGap = {
      ...current,
      ...updates,
      reductionPercent: updates.reductionPercent !== undefined ? Math.max(0, Math.min(100, updates.reductionPercent)) : current.reductionPercent,
      updatedAt: new Date().toISOString()
    };

    this.gaps[index] = updated;
    this.addAuditLog(actorId, 'UPDATE_GAP', 'GAP', gapId, justification || 'Mise à jour de la lacune', JSON.stringify(current), JSON.stringify(updated), updated.isDemo);
    this.persist();
    return updated;
  }

  // =========================================================================
  // GESTION DES PLANS DE VEILLE ET ORIENTATION (PLANS)
  // =========================================================================

  public getPlans(requirementId?: string, filterDemo?: boolean): OsintRequirementPlan[] {
    let list = [...this.plans];
    if (requirementId) list = list.filter(p => p.requirementId === requirementId);
    if (filterDemo !== undefined) list = list.filter(p => p.isDemo === filterDemo);
    return list;
  }

  public createPlan(
    planData: Omit<OsintRequirementPlan, 'planId' | 'createdAt' | 'updatedAt' | 'provenance'>,
    actorId: string = 'ANALYSTE-REF-01'
  ): OsintRequirementPlan {
    const newPlan: OsintRequirementPlan = {
      ...planData,
      planId: `PLAN-REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sourceIds: planData.sourceIds || [],
      indicatorIds: planData.indicatorIds || [],
      status: planData.status || 'PLANIFIE',
      governanceStatus: planData.governanceStatus || 'CONFORME',
      provenance: 'LOT34_REQUIREMENT_CENTER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.plans.unshift(newPlan);

    const req = this.getRequirementById(newPlan.requirementId);
    if (req) {
      const pIds = req.planIds || [];
      if (!pIds.includes(newPlan.planId)) {
        this.updateRequirement(req.requirementId, { planIds: [...pIds, newPlan.planId], status: 'PLANIFIE' }, actorId, 'Association d\'un plan de veille');
      }
    }

    this.addAuditLog(actorId, 'CREATE_PLAN', 'PLAN', newPlan.planId, `Création plan de veille: ${newPlan.name}`, undefined, JSON.stringify(newPlan), newPlan.isDemo);
    this.persist();
    return newPlan;
  }

  public updatePlan(
    planId: string,
    updates: Partial<OsintRequirementPlan>,
    actorId: string = 'ANALYSTE-REF-01',
    justification?: string
  ): OsintRequirementPlan {
    const index = this.plans.findIndex(p => p.planId === planId);
    if (index === -1) throw new Error(`Plan ${planId} non trouvé`);

    const current = this.plans[index];
    const updated: OsintRequirementPlan = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.plans[index] = updated;
    this.addAuditLog(actorId, 'UPDATE_PLAN', 'PLAN', planId, justification || 'Mise à jour du plan de veille', JSON.stringify(current), JSON.stringify(updated), updated.isDemo);
    this.persist();
    return updated;
  }

  // =========================================================================
  // AUDIT ET STATISTIQUES
  // =========================================================================

  public getAuditLogs(filterDemo?: boolean): OsintRequirementAudit[] {
    if (filterDemo === undefined) return [...this.auditLogs];
    return this.auditLogs.filter(a => a.isDemo === filterDemo);
  }

  public getStatistics(filterDemo?: boolean) {
    const reqs = this.getRequirements(filterDemo);
    const questions = this.getQuestions(undefined, filterDemo);
    const indicators = this.getIndicators(undefined, filterDemo);
    const gaps = this.getGaps(undefined, filterDemo);
    const plans = this.getPlans(undefined, filterDemo);
    const answers = this.getAnswers(undefined, undefined, filterDemo);

    const activeReqs = reqs.filter(r => r.status !== 'CLOTURE' && r.status !== 'ANNULE' && r.status !== 'OBSOLETE');
    const criticalReqs = reqs.filter(r => r.priorityLevel === 'CRITIQUE');
    const highReqs = reqs.filter(r => r.priorityLevel === 'ELEVEE');
    const openQuestions = questions.filter(q => q.status === 'OUVERTE' || q.status === 'EN_COURS');
    const answeredQuestions = questions.filter(q => q.status === 'REPONDUE');
    const activeIndicators = indicators.filter(i => i.status === 'ACTIF' || i.status === 'DECLENCHE');
    const unreducedGaps = gaps.filter(g => g.reductionStatus === 'NON_REDUITE');
    const activePlans = plans.filter(p => p.status === 'ACTIF' || p.status === 'PLANIFIE');

    // Répartition par catégorie
    const byCategory: Record<string, number> = {};
    reqs.forEach(r => {
      byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    });

    // Répartition par statut
    const byStatus: Record<string, number> = {};
    reqs.forEach(r => {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    });

    // Répartition par priorité
    const byPriority: Record<string, number> = {
      CRITIQUE: criticalReqs.length,
      ELEVEE: highReqs.length,
      MOYENNE: reqs.filter(r => r.priorityLevel === 'MOYENNE').length,
      FAIBLE: reqs.filter(r => r.priorityLevel === 'FAIBLE').length
    };

    return {
      totalRequirements: reqs.length,
      activeRequirements: activeReqs.length,
      closedRequirements: reqs.filter(r => r.status === 'CLOTURE').length,
      criticalRequirements: criticalReqs.length,
      highRequirements: highReqs.length,
      totalQuestions: questions.length,
      openQuestions: openQuestions.length,
      answeredQuestions: answeredQuestions.length,
      totalIndicators: indicators.length,
      activeIndicators: activeIndicators.length,
      totalGaps: gaps.length,
      unreducedGaps: unreducedGaps.length,
      totalPlans: plans.length,
      activePlans: activePlans.length,
      totalAnswers: answers.length,
      byCategory,
      byStatus,
      byPriority
    };
  }

  // =========================================================================
  // INITIALISATION DES DONNÉES DE DÉMONSTRATION DOCTRINALES
  // =========================================================================

  private initDemoData() {
    // 1. Besoins de Démonstration (Sahel, Corne de l'Afrique, Golfe de Guinée, RDC)
    const demoReq1: OsintIntelligenceRequirement = {
      requirementId: 'REQ-2026-001',
      title: 'Surveillance des corridors logistiques transfrontaliers Liptako-Gourma',
      description: 'Documenter les flux logistiques et mouvements suspects de convois non identifiés entre le Mali, le Niger et le Burkina Faso.',
      question: 'Quels sont les points de passage privilégiés et les modes opératoires des convois de ravitaillement dans la zone des trois frontières ?',
      category: 'LOGISTIQUE',
      priority: 88,
      priorityLevel: 'CRITIQUE',
      urgency: 'URGENTE',
      importance: 'CRITIQUE',
      impactAnalytique: 23,
      echeanceScore: 15,
      scope: 'Zone des trois frontières (Mali, Niger, Burkina Faso)',
      originLot: 'LOT 30',
      countryIds: ['ML', 'NE', 'BF'],
      eventIds: ['EVT-2026-089', 'EVT-2026-112'],
      caseIds: ['DOS-2026-014'],
      analysisIds: ['ANA-2026-033'],
      hypothesisIds: ['HYP-2026-012'],
      gapIds: ['GAP-REQ-001'],
      sourceIds: ['SRC-001', 'SRC-004', 'SRC-012'],
      indicatorIds: ['IND-REQ-001', 'IND-REQ-002'],
      planIds: ['PLAN-REQ-001'],
      questionIds: ['Q-REQ-001', 'Q-REQ-002'],
      answerIds: ['ANS-REQ-001'],
      status: 'EN_SURVEILLANCE',
      ownerId: 'ANALYSTE-SAHEL-01',
      dueDate: '2026-06-30',
      confidence: 'MOYENNE',
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-03-01T08:30:00Z',
      updatedAt: '2026-03-15T14:20:00Z'
    };

    const demoReq2: OsintIntelligenceRequirement = {
      requirementId: 'REQ-2026-002',
      title: 'Évolution de la gouvernance portuaire et sécurisation maritime dans le Golfe de Guinée',
      description: 'Identifier les nouvelles vulnérabilités côtières et les transferts illicites de cargaisons d hydrocarbures dans les eaux sous juridiction régionale.',
      question: 'Quelle est la corrélation entre les transbordements offshore non déclarés et les zones d ancrage non surveillées au large du Delta ?',
      category: 'SECURITE',
      priority: 76,
      priorityLevel: 'ELEVEE',
      urgency: 'PRIORITAIRE',
      importance: 'ELEVEE',
      impactAnalytique: 20,
      echeanceScore: 11,
      scope: 'Golfe de Guinée (Nigéria, Bénin, Togo, Ghana, Côte d\'Ivoire)',
      originLot: 'LOT 27',
      countryIds: ['NG', 'BJ', 'TG', 'GH', 'CI'],
      eventIds: ['EVT-2026-045'],
      caseIds: ['DOS-2026-008'],
      analysisIds: ['ANA-2026-019'],
      hypothesisIds: ['HYP-2026-007'],
      gapIds: ['GAP-REQ-002'],
      sourceIds: ['SRC-007', 'SRC-015'],
      indicatorIds: ['IND-REQ-003'],
      planIds: ['PLAN-REQ-002'],
      questionIds: ['Q-REQ-003'],
      answerIds: [],
      status: 'PLANIFIE',
      ownerId: 'ANALYSTE-MARITIME-02',
      dueDate: '2026-07-15',
      confidence: 'MOYENNE',
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-03-05T09:15:00Z',
      updatedAt: '2026-03-14T11:00:00Z'
    };

    const demoReq3: OsintIntelligenceRequirement = {
      requirementId: 'REQ-2026-003',
      title: 'Dynamiques minières artisanales et chaînes d approvisionnement au Nord-Kivu',
      description: 'Cartographier les circuits d évacuation du coltan et de l or dans les territoires sous influence de groupes armés.',
      question: 'Quels négociants et intermédiaires transfrontaliers facilitent l écoulement des minerais vers les plateformes de négoce régionales ?',
      category: 'ECONOMIE',
      priority: 84,
      priorityLevel: 'CRITIQUE',
      urgency: 'URGENTE',
      importance: 'CRITIQUE',
      impactAnalytique: 22,
      echeanceScore: 12,
      scope: 'Est de la RDC (Nord-Kivu, Sud-Kivu, Ituri) et pays limitrophes',
      originLot: 'LOT 33',
      countryIds: ['CD', 'RW', 'UG'],
      eventIds: ['EVT-2026-150', 'EVT-2026-155'],
      caseIds: ['DOS-2026-022'],
      analysisIds: ['ANA-2026-040'],
      hypothesisIds: ['HYP-2026-018'],
      gapIds: ['GAP-REQ-003'],
      sourceIds: ['SRC-003', 'SRC-020'],
      indicatorIds: ['IND-REQ-004'],
      planIds: ['PLAN-REQ-003'],
      questionIds: ['Q-REQ-004'],
      answerIds: ['ANS-REQ-002'],
      status: 'REPONSE_PARTIELLE',
      ownerId: 'ANALYSTE-GRANDS-LACS-01',
      dueDate: '2026-05-30',
      confidence: 'ELEVEE',
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-02-20T10:00:00Z',
      updatedAt: '2026-03-12T16:45:00Z'
    };

    const demoReq4: OsintIntelligenceRequirement = {
      requirementId: 'REQ-2026-004',
      title: 'Tensions pastorales et accès aux points d eau dans le Bassin du Lac Tchad',
      description: 'Suivre les trajectoires de transhumance précoce induite par les déficits pluviométriques et les risques d affrontements intercommunautaires.',
      question: 'Quelles zones d accueil temporaire enregistrent la plus forte concentration de troupeaux non régulés ?',
      category: 'ENVIRONNEMENT',
      priority: 62,
      priorityLevel: 'MOYENNE',
      urgency: 'A_SURVEILLER',
      importance: 'MOYENNE',
      impactAnalytique: 18,
      echeanceScore: 9,
      scope: 'Pourtour du Lac Tchad (Tchad, Cameroun, Niger, Nigéria)',
      originLot: 'LOT 18',
      countryIds: ['TD', 'CM', 'NE', 'NG'],
      eventIds: ['EVT-2026-070'],
      caseIds: ['DOS-2026-011'],
      analysisIds: [],
      hypothesisIds: [],
      gapIds: [],
      sourceIds: ['SRC-002', 'SRC-011'],
      indicatorIds: [],
      planIds: [],
      questionIds: ['Q-REQ-005'],
      answerIds: [],
      status: 'QUALIFIE',
      ownerId: 'ANALYSTE-TCHAD-01',
      dueDate: '2026-08-31',
      confidence: 'NON_EVALUEE',
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-03-10T14:00:00Z',
      updatedAt: '2026-03-10T14:00:00Z'
    };

    // 2. Questions prioritaires
    const q1: OsintIntelligenceQuestion = {
      questionId: 'Q-REQ-001',
      requirementId: 'REQ-2026-001',
      question: 'Quelles pistes secondaires non goudronnées contournent les postes de contrôle fixes entre Menaka et Tillabéri ?',
      questionType: 'FACTUELLE',
      expectedAnswerType: 'Cartographie des itinéraires et rapports d observation locale',
      priority: 'URGENTE',
      status: 'REPONDUE',
      answer: 'Trois axes secondaires identifiés à l ouest d Andéramboukane évitant les patrouilles sur la RN24.',
      answerConfidence: 'ELEVEE',
      evidenceIds: ['EVD-091', 'EVD-092'],
      sourceIds: ['SRC-001', 'SRC-012'],
      eventIds: ['EVT-2026-089'],
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-03-02T09:00:00Z',
      updatedAt: '2026-03-08T11:30:00Z'
    };

    const q2: OsintIntelligenceQuestion = {
      questionId: 'Q-REQ-002',
      requirementId: 'REQ-2026-001',
      question: 'Y a-t-il eu utilisation de véhicules civils réquisitionnés lors des mouvements du 4 mars 2026 ?',
      questionType: 'VERIFICATION',
      expectedAnswerType: 'Témoignages croisés, immatriculations documentées, communiqués',
      priority: 'ELEVEE',
      status: 'EN_COURS',
      evidenceIds: ['EVD-093'],
      sourceIds: ['SRC-004'],
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-03-04T15:00:00Z',
      updatedAt: '2026-03-06T10:00:00Z'
    };

    const q3: OsintIntelligenceQuestion = {
      questionId: 'Q-REQ-003',
      requirementId: 'REQ-2026-002',
      question: 'Quels navires pétroliers ont coupé leurs émetteurs AIS plus de 6 heures dans la ZEE du Bénin au premier trimestre 2026 ?',
      questionType: 'CHRONOLOGIQUE',
      expectedAnswerType: 'Historiques de trajectoires maritimes et anomalies AIS',
      priority: 'ELEVEE',
      status: 'OUVERTE',
      evidenceIds: [],
      sourceIds: ['SRC-007'],
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-03-06T08:00:00Z',
      updatedAt: '2026-03-06T08:00:00Z'
    };

    const q4: OsintIntelligenceQuestion = {
      questionId: 'Q-REQ-004',
      requirementId: 'REQ-2026-003',
      question: 'Quelles sociétés de négoce basées à Kigali ou Kampala ont enregistré des hausses d exportations disproportionnées au T1 2026 ?',
      questionType: 'COMPARATIVE',
      expectedAnswerType: 'Statistiques douanières publiques, registres de commerce, rapports du groupe d experts',
      priority: 'URGENTE',
      status: 'REPONDUE',
      answer: 'Hausse de 42% constatée sur deux entités récemment enregistrées sous statut d exportation franche.',
      answerConfidence: 'MOYENNE',
      evidenceIds: ['EVD-140'],
      sourceIds: ['SRC-020'],
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-02-25T11:00:00Z',
      updatedAt: '2026-03-12T16:00:00Z'
    };

    const q5: OsintIntelligenceQuestion = {
      questionId: 'Q-REQ-005',
      requirementId: 'REQ-2026-004',
      question: 'Quels accords traditionnels de transhumance ont été rompus entre éleveurs Peuls et agriculteurs Massa ?',
      questionType: 'CONTEXTUELLE',
      expectedAnswerType: 'Déclarations des chefs traditionnels, procès-verbaux de conciliation',
      priority: 'MOYENNE',
      status: 'OUVERTE',
      evidenceIds: [],
      sourceIds: ['SRC-002'],
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-03-10T14:30:00Z',
      updatedAt: '2026-03-10T14:30:00Z'
    };

    // 3. Indicateurs de veille
    const ind1: OsintRequirementIndicator = {
      indicatorId: 'IND-REQ-001',
      requirementId: 'REQ-2026-001',
      name: 'Variation des prix du carburant au marché noir à Gao et Ménaka',
      description: 'Hausse anormale du litre d essence signalant des achats massifs pour constitution de dépôts clandestins.',
      category: 'LOGISTIQUE',
      observationCriteria: 'Relevés hebdomadaires des prix sur les marchés informels',
      expectedDirection: 'HAUSSE',
      sourceIds: ['SRC-001', 'SRC-012'],
      countryScope: ['ML', 'NE'],
      threshold: '+25% en 14 jours',
      status: 'DECLENCHE',
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-03-01T10:00:00Z',
      updatedAt: '2026-03-14T09:00:00Z'
    };

    const ind2: OsintRequirementIndicator = {
      indicatorId: 'IND-REQ-002',
      requirementId: 'REQ-2026-001',
      name: 'Fréquence des survols et frappes déclarées par les FAMA et partenaires',
      description: 'Nombre de communiqués officiels faisant état d interventions aériennes dans le secteur Gourma.',
      category: 'SECURITE',
      observationCriteria: 'Communiqués militaires officiels et dépêches d agences',
      expectedDirection: 'HAUSSE',
      sourceIds: ['SRC-004'],
      countryScope: ['ML', 'BF'],
      threshold: '> 3 interventions / semaine',
      status: 'ACTIF',
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-03-01T10:30:00Z',
      updatedAt: '2026-03-15T12:00:00Z'
    };

    const ind3: OsintRequirementIndicator = {
      indicatorId: 'IND-REQ-003',
      requirementId: 'REQ-2026-002',
      name: 'Nombre d incidents de piraterie / vols à main armée au mouillage de Cotonou',
      description: 'Signalements MDAT-GoG et IMB Piracy Reporting Centre.',
      category: 'SECURITE',
      observationCriteria: 'Rapports mensuels de sécurité maritime',
      expectedDirection: 'STABILITE',
      sourceIds: ['SRC-007', 'SRC-015'],
      countryScope: ['BJ', 'TG', 'NG'],
      threshold: '> 2 incidents / mois',
      status: 'EN_VEILLE',
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-03-05T10:00:00Z',
      updatedAt: '2026-03-05T10:00:00Z'
    };

    const ind4: OsintRequirementIndicator = {
      indicatorId: 'IND-REQ-004',
      requirementId: 'REQ-2026-003',
      name: 'Volumes certifiés de coltan via le système de traçabilité ITSCI à Rubaya',
      description: 'Baisse soudaine des volumes officiellement étiquetés indiquant un détournement vers des canaux parallèles.',
      category: 'ECONOMIE',
      observationCriteria: 'Statistiques mensuelles de production et de traçabilité minière',
      expectedDirection: 'BAISSE',
      sourceIds: ['SRC-003', 'SRC-020'],
      countryScope: ['CD', 'RW'],
      threshold: '-30% sur 1 mois',
      status: 'DECLENCHE',
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-02-22T11:00:00Z',
      updatedAt: '2026-03-11T14:30:00Z'
    };

    // 4. Lacunes de renseignement
    const gap1: OsintRequirementGap = {
      gapId: 'GAP-REQ-001',
      requirementId: 'REQ-2026-001',
      description: 'Absence d imagerie satellitaire récente haute résolution sur la forêt de Ouagadou et le secteur d In-Delimane.',
      severity: 'ELEVEE',
      cause: 'Couverture nuageuse saisonnière et coût des requêtes optiques commerciales non prioritaires.',
      impact: 'Incapacité à vérifier visuellement la création de dépôts de munitions enterrés.',
      reductionStatus: 'PARTIELLEMENT_REDUITE',
      reductionPercent: 45,
      evidenceIds: ['EVD-091'],
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-03-02T11:00:00Z',
      updatedAt: '2026-03-12T15:00:00Z'
    };

    const gap2: OsintRequirementGap = {
      gapId: 'GAP-REQ-002',
      requirementId: 'REQ-2026-002',
      description: 'Manque de sources locales fiables sur les terminaux pétroliers privés de la zone franche de Calabar.',
      severity: 'MOYENNE',
      cause: 'Accès restreint aux installations portuaires et opacité des registres douaniers locaux.',
      impact: 'Difficulté à distinguer les navires en escale légitime des navires effectuant du soutage clandestin.',
      reductionStatus: 'NON_REDUITE',
      reductionPercent: 10,
      evidenceIds: [],
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-03-05T12:00:00Z',
      updatedAt: '2026-03-05T12:00:00Z'
    };

    const gap3: OsintRequirementGap = {
      gapId: 'GAP-REQ-003',
      requirementId: 'REQ-2026-003',
      description: 'Identification précise des bénéficiaires effectifs finaux des sociétés de courtage enregistrées à l étranger.',
      severity: 'CRITIQUE',
      cause: 'Utilisation de sociétés écrans et de prête-noms dans des juridictions à secret d affaires élevé.',
      impact: 'Rupture de la chaîne d attribution formelle des profits illicites vers les groupes armés.',
      reductionStatus: 'PARTIELLEMENT_REDUITE',
      reductionPercent: 60,
      evidenceIds: ['EVD-140'],
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-02-24T14:00:00Z',
      updatedAt: '2026-03-13T17:00:00Z'
    };

    // 5. Plans de veille méthodologiques
    const plan1: OsintRequirementPlan = {
      planId: 'PLAN-REQ-001',
      requirementId: 'REQ-2026-001',
      name: 'Plan de surveillance continue - Logistique Sahel Central',
      objective: 'Croiser quotidiennement les sources d information locale, les avis de sécurité et les comptes-rendus institutionnels sur les axes routiers.',
      sourceIds: ['SRC-001', 'SRC-004', 'SRC-012'],
      indicatorIds: ['IND-REQ-001', 'IND-REQ-002'],
      frequency: 'QUOTIDIENNE',
      startDate: '2026-03-01',
      endDate: '2026-06-30',
      status: 'ACTIF',
      ownerId: 'ANALYSTE-SAHEL-01',
      governanceStatus: 'CONFORME',
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-03-01T11:00:00Z',
      updatedAt: '2026-03-15T08:00:00Z'
    };

    const plan2: OsintRequirementPlan = {
      planId: 'PLAN-REQ-002',
      requirementId: 'REQ-2026-002',
      name: 'Revue hebdomadaire du trafic maritime - ZEE Bénin / Nigéria',
      objective: 'Relever chaque lundi les alertes MDAT-GoG et les anomalies de trajectoire des caboteurs fluvio-maritimes.',
      sourceIds: ['SRC-007', 'SRC-015'],
      indicatorIds: ['IND-REQ-003'],
      frequency: 'HEBDOMADAIRE',
      startDate: '2026-03-05',
      endDate: '2026-09-01',
      status: 'PLANIFIE',
      ownerId: 'ANALYSTE-MARITIME-02',
      governanceStatus: 'APPROUVE_LOCALEMENT',
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-03-05T14:00:00Z',
      updatedAt: '2026-03-05T14:00:00Z'
    };

    const plan3: OsintRequirementPlan = {
      planId: 'PLAN-REQ-003',
      requirementId: 'REQ-2026-003',
      name: 'Plan d observation mensuel des circuits miniers Est-RDC',
      objective: 'Compiler les rapports mensuels des ONG spécialisées, du groupe d experts de l ONU et les bilans des comptoirs officiels.',
      sourceIds: ['SRC-003', 'SRC-020'],
      indicatorIds: ['IND-REQ-004'],
      frequency: 'MENSUELLE',
      startDate: '2026-02-20',
      endDate: '2026-12-31',
      status: 'ACTIF',
      ownerId: 'ANALYSTE-GRANDS-LACS-01',
      governanceStatus: 'CONFORME',
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-02-20T15:00:00Z',
      updatedAt: '2026-03-01T09:00:00Z'
    };

    // 6. Réponses documentées
    const ans1: OsintRequirementAnswer = {
      answerId: 'ANS-REQ-001',
      requirementId: 'REQ-2026-001',
      questionId: 'Q-REQ-001',
      answer: 'Documentation confirmée de passages réguliers par la piste de Bankilaré-Inates évitant les check-points fixes.',
      evidenceIds: ['EVD-091', 'EVD-092'],
      sourceIds: ['SRC-001', 'SRC-012'],
      eventIds: ['EVT-2026-089'],
      confidence: 'ELEVEE',
      answerStatus: 'SUFFISANTE',
      stanceOnHypothesis: 'POUR',
      hypothesisId: 'HYP-2026-012',
      isPostPublication: false,
      analystId: 'ANALYSTE-SAHEL-01',
      answeredAt: '2026-03-08T11:30:00Z',
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-03-08T11:30:00Z'
    };

    const ans2: OsintRequirementAnswer = {
      answerId: 'ANS-REQ-002',
      requirementId: 'REQ-2026-003',
      questionId: 'Q-REQ-004',
      answer: 'Mise en évidence de flux financiers atypiques corroborant le contournement des circuits légaux certifiés.',
      evidenceIds: ['EVD-140'],
      sourceIds: ['SRC-020'],
      eventIds: ['EVT-2026-150'],
      confidence: 'MOYENNE',
      answerStatus: 'PARTIELLE',
      stanceOnHypothesis: 'POUR',
      hypothesisId: 'HYP-2026-018',
      isPostPublication: true,
      analystId: 'ANALYSTE-GRANDS-LACS-01',
      answeredAt: '2026-03-12T16:00:00Z',
      isDemo: true,
      provenance: 'LOT34_DEMO_DATA',
      createdAt: '2026-03-12T16:00:00Z'
    };

    // 7. Journal d'audit initial
    const audit1: OsintRequirementAudit = {
      auditId: 'AUDIT-REQ-001',
      timestamp: '2026-03-01T08:30:00Z',
      actorId: 'ANALYSTE-SAHEL-01',
      action: 'CREATE_REQUIREMENT',
      entityType: 'REQUIREMENT',
      entityId: 'REQ-2026-001',
      justification: 'Initialisation du besoin de renseignement sur le corridor Liptako-Gourma',
      provenance: 'LOT34_DEMO_DATA',
      isDemo: true
    };

    const audit2: OsintRequirementAudit = {
      auditId: 'AUDIT-REQ-002',
      timestamp: '2026-03-08T11:30:00Z',
      actorId: 'ANALYSTE-SAHEL-01',
      action: 'RECORD_ANSWER',
      entityType: 'ANSWER',
      entityId: 'ANS-REQ-001',
      justification: 'Apport de preuves confirmant l itinéraire de contournement',
      provenance: 'LOT34_DEMO_DATA',
      isDemo: true
    };

    this.requirements = [demoReq1, demoReq2, demoReq3, demoReq4];
    this.questions = [q1, q2, q3, q4, q5];
    this.indicators = [ind1, ind2, ind3, ind4];
    this.gaps = [gap1, gap2, gap3];
    this.plans = [plan1, plan2, plan3];
    this.answers = [ans1, ans2];
    this.auditLogs = [audit2, audit1];

    this.persist();
  }

  public exportAllRequirementsJson(isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): string {
    const d = isDemoFilter === 'ALL' ? undefined : isDemoFilter === 'DEMO';
    const data = {
      exportVersion: '1.0.0',
      applicationVersion: '34.0.0',
      generatedAt: new Date().toISOString(),
      filtres: {
        isDemo: isDemoFilter
      },
      provenance: 'OSINT_AFRICA_LOT34',
      requirements: this.getRequirements(d),
      questions: this.getQuestions(undefined, d),
      indicators: this.getIndicators(undefined, d),
      answers: this.getAnswers(undefined, undefined, d),
      gaps: this.getGaps(undefined, d),
      plans: this.getPlans(undefined, d),
      audit: this.getAuditLogs(d)
    };
    
    this.addAuditLog(
      'USER',
      'EXPORT_CREATED',
      'ALL',
      'ALL',
      'Export JSON manuel des besoins de renseignement',
      undefined,
      undefined,
      isDemoFilter === 'DEMO'
    );
    
    return JSON.stringify(data, null, 2);
  }
}
export const requirementService = new RequirementService();
