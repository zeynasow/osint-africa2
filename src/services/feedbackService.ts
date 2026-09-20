/**
 * OSINT AFRICA - LOT 33 : Service de Retour d'Expérience, Capitalisation et Évaluation Post-Diffusion
 * Moteur souverain local : Évaluations rétrospectives, Feedbacks, Preuves datées, Leçons apprises, Actions d'amélioration et Audit Append-Only.
 * 0 appel réseau.
 */

import {
  OsintPostEvaluation,
  OsintPostEvaluationStatus,
  OsintPostFindingType,
  OsintFeedback,
  OsintFeedbackType,
  OsintEvaluationEvidence,
  OsintPostEvaluationFinding,
  OsintLessonLearned,
  OsintLessonCategory,
  OsintImprovementAction,
  OsintImprovementActionStatus,
  OsintEvaluationAudit,
  OsintMethodologicalScore,
  OsintIntelligenceNote
} from '../types';
import { intelligenceNoteService } from './intelligenceNoteService';
import { distributionService } from './distributionService';

const STORAGE_KEYS = {
  EVALUATIONS: 'OSINT_POST_EVALUATIONS_LOT33',
  FEEDBACK: 'OSINT_FEEDBACK_LOT33',
  FINDINGS: 'OSINT_EVALUATION_FINDINGS_LOT33',
  EVIDENCE: 'OSINT_EVALUATION_EVIDENCE_LOT33',
  LESSONS: 'OSINT_LESSONS_LEARNED_LOT33',
  ACTIONS: 'OSINT_IMPROVEMENT_ACTIONS_LOT33',
  AUDIT: 'OSINT_EVALUATION_AUDIT_LOT33',
};

export const RETEX_DOCTRINAL_NOTICES = [
  "Une évaluation rétrospective ne doit pas être utilisée pour juger automatiquement la qualité d'une analyse uniquement à partir de son résultat final.",
  "Une analyse correcte au moment T peut devenir incomplète après l'apparition d'informations nouvelles.",
  "Une information ultérieure ne doit pas être rétroactivement considérée comme disponible au moment de l'analyse initiale.",
  "Une erreur identifiée doit être distinguée d'une évolution de la situation.",
  "Une appréciation analytique n'est pas un fait.",
  "Une hypothèse ne devient pas automatiquement un fait parce qu'elle s'est réalisée.",
  "Une hypothèse non réalisée n'est pas automatiquement une mauvaise analyse.",
  "La corrélation entre une appréciation et un événement ultérieur ne constitue pas une preuve de causalité.",
  "Les indicateurs de performance mesurent la qualité du processus documenté, et non la vérité absolue du renseignement."
];

class FeedbackService {
  private evaluations: OsintPostEvaluation[] = [];
  private feedbackList: OsintFeedback[] = [];
  private findings: OsintPostEvaluationFinding[] = [];
  private evidenceList: OsintEvaluationEvidence[] = [];
  private lessons: OsintLessonLearned[] = [];
  private actions: OsintImprovementAction[] = [];
  private auditLogs: OsintEvaluationAudit[] = [];

  constructor() {
    this.loadState();
    if (this.evaluations.length === 0) {
      this.initDemoData();
    }
  }

  private loadState() {
    try {
      const storedEvals = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
      const storedFb = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
      const storedFindings = localStorage.getItem(STORAGE_KEYS.FINDINGS);
      const storedEvidence = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
      const storedLessons = localStorage.getItem(STORAGE_KEYS.LESSONS);
      const storedActions = localStorage.getItem(STORAGE_KEYS.ACTIONS);
      const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT);

      if (storedEvals) this.evaluations = JSON.parse(storedEvals);
      if (storedFb) this.feedbackList = JSON.parse(storedFb);
      if (storedFindings) this.findings = JSON.parse(storedFindings);
      if (storedEvidence) this.evidenceList = JSON.parse(storedEvidence);
      if (storedLessons) this.lessons = JSON.parse(storedLessons);
      if (storedActions) this.actions = JSON.parse(storedActions);
      if (storedAudit) this.auditLogs = JSON.parse(storedAudit);
    } catch (e) {
      console.error('Erreur chargement LOT 33 localStorage', e);
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(this.evaluations));
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(this.feedbackList));
      localStorage.setItem(STORAGE_KEYS.FINDINGS, JSON.stringify(this.findings));
      localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(this.evidenceList));
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(this.lessons));
      localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(this.actions));
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.error('Erreur persistance LOT 33', e);
    }
  }

  // Journal d'audit Append-Only strict (aucune suppression, aucune modification)
  private logAudit(
    actorId: string,
    action: string,
    entityType: string,
    entityId: string,
    justification?: string,
    before?: string,
    after?: string,
    isDemo: boolean = true,
    provenance: string = 'OSINT-AFRICA-RETEX'
  ) {
    const log: OsintEvaluationAudit = {
      id: `audit-ret-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorId: actorId || 'Analyste-RETEX',
      action,
      entityType,
      entityId,
      justification,
      before,
      after,
      provenance,
      isDemo
    };
    this.auditLogs.unshift(log);
    this.persist();
  }

  public getAuditLogs(): OsintEvaluationAudit[] {
    return [...this.auditLogs];
  }

  // --------------------------------------------------------------------------
  // CALCUL ET QUALITÉ DOCUMENTAIRE
  // --------------------------------------------------------------------------
  public calculateMethodologicalScore(
    evalData: Partial<OsintPostEvaluation>,
    evidenceCount: number,
    hasContradictions: boolean,
    allEvidenceDated: boolean
  ): OsintMethodologicalScore {
    const traceability = Math.min(20, 10 + (evidenceCount > 0 ? 10 : 0));
    const completeness = evalData.retrospectiveAssessment && evalData.retrospectiveAssessment.length > 50 ? 20 : 10;
    const evidenceQuality = evidenceCount >= 2 ? 20 : evidenceCount === 1 ? 10 : 5;
    const separationFactsHypotheses = 15;
    const contradictionsHandling = hasContradictions ? 15 : 10;
    const datingAccuracy = allEvidenceDated ? 10 : 5;
    const provenanceQuality = evalData.provenance ? 10 : 5;

    const totalScore = Math.min(100, Math.round(
      (traceability + completeness + evidenceQuality + separationFactsHypotheses + contradictionsHandling + datingAccuracy + provenanceQuality) * 0.95
    ));

    return {
      traceability,
      completeness,
      evidenceQuality,
      separationFactsHypotheses,
      contradictionsHandling,
      datingAccuracy,
      provenanceQuality,
      totalScore
    };
  }

  // --------------------------------------------------------------------------
  // GESTION DES ÉVALUATIONS POST-DIFFUSION
  // --------------------------------------------------------------------------
  public getEvaluations(filterDemo?: 'ALL' | 'REAL' | 'DEMO'): OsintPostEvaluation[] {
    if (filterDemo === 'REAL') return this.evaluations.filter(e => !e.isDemo);
    if (filterDemo === 'DEMO') return this.evaluations.filter(e => e.isDemo);
    return [...this.evaluations];
  }

  public getEvaluationById(evaluationId: string): OsintPostEvaluation | undefined {
    return this.evaluations.find(e => e.evaluationId === evaluationId);
  }

  public getEvaluationsByNoteId(noteId: string): OsintPostEvaluation[] {
    return this.evaluations.filter(e => e.noteId === noteId);
  }

  public createEvaluation(params: {
    noteId: string;
    distributionId?: string;
    evaluatorId: string;
    evaluatorRole: string;
    evaluationScope: string;
    retrospectiveAssessment: string;
    overallFinding: OsintPostFindingType;
    confidence: 'TRES_FAIBLE' | 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'TRES_ELEVEE';
    isDemo?: boolean;
    provenance?: string;
  }): OsintPostEvaluation {
    // Règle de blocage 1 : La note doit obligatoirement exister
    const note = intelligenceNoteService.getNoteById(params.noteId);
    if (!note) {
      throw new Error(`Contrôle doctrinal bloquant : Impossible de créer une évaluation sur la note inexistante '${params.noteId}'.`);
    }

    // Capture de la situation au moment T (Fait initial vs Appréciation initiale)
    const initialSnapshot = {
      facts: note.facts && note.facts.length > 0
        ? note.facts
        : note.analyticalAssessment?.established
        ? [note.analyticalAssessment.established]
        : [note.title],
      reportedInfo: note.reportedInformation || (note.analyticalAssessment?.notEstablished ? [note.analyticalAssessment.notEstablished] : []),
      unconfirmedInfo: note.unconfirmedInformation || (note.analyticalAssessment?.missingInfo ? [note.analyticalAssessment.missingInfo] : []),
      hypotheses: note.analyticalAssessment?.supportedHypotheses || [],
      confidence: note.confidence || 'MOYENNE',
      conclusion: note.overallConclusion?.currentSituation || note.executiveSummary || note.title,
      productionDate: note.createdAt,
      validationDate: note.validatedAt,
      diffusionDate: new Date().toISOString()
    };

    const evaluationId = `eval-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const score = this.calculateMethodologicalScore({ retrospectiveAssessment: params.retrospectiveAssessment, provenance: params.provenance }, 0, false, true);

    const newEval: OsintPostEvaluation = {
      evaluationId,
      noteId: params.noteId,
      distributionId: params.distributionId,
      evaluatorId: params.evaluatorId || 'Analyste-RETEX',
      evaluatorRole: params.evaluatorRole || 'Évaluateur Post-Diffusion',
      evaluationDate: new Date().toISOString(),
      evaluationStatus: 'EN_EVALUATION',
      initialAssessment: initialSnapshot,
      retrospectiveAssessment: params.retrospectiveAssessment || '',
      evaluationScope: params.evaluationScope || 'Évaluation globale de cohérence',
      overallFinding: params.overallFinding || 'UNDETERMINED',
      confidence: params.confidence || 'MOYENNE',
      methodologicalScore: score,
      isDemo: params.isDemo !== undefined ? params.isDemo : note.isDemo,
      provenance: params.provenance || 'OSINT-AFRICA-EVAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.evaluations.unshift(newEval);
    this.logAudit(
      params.evaluatorId,
      'EVALUATION_CREATED',
      'EVALUATION',
      evaluationId,
      `Création évaluation post-diffusion pour note ${params.noteId}`,
      undefined,
      JSON.stringify({ status: newEval.evaluationStatus, finding: newEval.overallFinding }),
      newEval.isDemo,
      newEval.provenance
    );
    this.persist();
    return newEval;
  }

  public updateEvaluation(evaluationId: string, updates: Partial<OsintPostEvaluation>, actorId: string): OsintPostEvaluation {
    const index = this.evaluations.findIndex(e => e.evaluationId === evaluationId);
    if (index === -1) {
      throw new Error(`Évaluation introuvable : '${evaluationId}'`);
    }

    const current = this.evaluations[index];

    // Règle de blocage 2 : Blocage de modification directe après clôture
    if (current.evaluationStatus === 'CLOTUREE') {
      throw new Error(`Contrôle doctrinal bloquant : L'évaluation '${evaluationId}' est CLÔTURÉE et ne peut pas être modifiée directement sans nouvelle réévaluation.`);
    }

    const beforeStr = JSON.stringify(current);
    const updated: OsintPostEvaluation = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.evaluations[index] = updated;
    this.logAudit(
      actorId,
      'EVALUATION_UPDATED',
      'EVALUATION',
      evaluationId,
      `Mise à jour évaluation`,
      beforeStr,
      JSON.stringify(updated),
      updated.isDemo,
      updated.provenance
    );
    this.persist();
    return updated;
  }

  public closeEvaluation(evaluationId: string, closedBy: string, justification: string): OsintPostEvaluation {
    const index = this.evaluations.findIndex(e => e.evaluationId === evaluationId);
    if (index === -1) {
      throw new Error(`Évaluation introuvable : '${evaluationId}'`);
    }

    const current = this.evaluations[index];
    if (current.evaluationStatus === 'CLOTUREE') {
      return current;
    }

    const beforeStr = JSON.stringify(current);
    const updated: OsintPostEvaluation = {
      ...current,
      evaluationStatus: 'CLOTUREE',
      closedAt: new Date().toISOString(),
      closedBy: closedBy || 'Responsable-RETEX',
      closeJustification: justification || 'Clôture formelle après consolidation des enseignements.',
      updatedAt: new Date().toISOString()
    };

    this.evaluations[index] = updated;
    this.logAudit(
      closedBy,
      'EVALUATION_CLOSED',
      'EVALUATION',
      evaluationId,
      `Clôture formelle évaluation : ${justification}`,
      beforeStr,
      JSON.stringify(updated),
      updated.isDemo,
      updated.provenance
    );
    this.persist();
    return updated;
  }

  // --------------------------------------------------------------------------
  // GESTION DES PREUVES D'ÉVALUATION & PROTECTION CONTRE LE BIAIS RÉTROSPECTIF
  // --------------------------------------------------------------------------
  public getEvidenceByEvaluationId(evaluationId: string): OsintEvaluationEvidence[] {
    return this.evidenceList.filter(e => e.evaluationId === evaluationId);
  }

  public attachEvidence(params: {
    evaluationId: string;
    sourceId: string;
    sourceUrl?: string;
    eventId?: string;
    evidenceType: OsintEvaluationEvidence['evidenceType'];
    publicationDate: string;
    discoveredDate: string;
    relevance: 'FORTE' | 'MOYENNE' | 'FAIBLE';
    independence: 'INDEPENDANTE' | 'PARTIELLEMENT_LIEE' | 'NON_INDEPENDANTE';
    confidence: 'TRES_FAIBLE' | 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'TRES_ELEVEE';
    excerpt: string;
    provenance?: string;
    isDemo?: boolean;
    actorId?: string;
  }): OsintEvaluationEvidence {
    const evalObj = this.getEvaluationById(params.evaluationId);
    if (!evalObj) {
      throw new Error(`Évaluation '${params.evaluationId}' introuvable pour rattachement de preuve.`);
    }
    if (evalObj.evaluationStatus === 'CLOTUREE') {
      throw new Error(`Contrôle doctrinal bloquant : Impossible d'attacher une preuve à une évaluation clôturée.`);
    }

    // Protection contre le biais rétrospectif : calcul automatique
    const noteProductionDate = evalObj.initialAssessment.productionDate || evalObj.createdAt;
    const isPostPublication = new Date(params.publicationDate).getTime() > new Date(noteProductionDate).getTime();

    const evidenceId = `evd-ret-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newEvidence: OsintEvaluationEvidence = {
      evidenceId,
      evaluationId: params.evaluationId,
      sourceId: params.sourceId,
      sourceUrl: params.sourceUrl,
      eventId: params.eventId,
      evidenceType: params.evidenceType,
      publicationDate: params.publicationDate,
      discoveredDate: params.discoveredDate || new Date().toISOString(),
      isPostPublication,
      relevance: params.relevance,
      independence: params.independence,
      confidence: params.confidence,
      excerpt: params.excerpt,
      provenance: params.provenance || evalObj.provenance,
      isDemo: params.isDemo !== undefined ? params.isDemo : evalObj.isDemo,
      createdAt: new Date().toISOString()
    };

    this.evidenceList.push(newEvidence);
    this.logAudit(
      params.actorId || 'Analyste-RETEX',
      'EVIDENCE_ATTACHED',
      'EVIDENCE',
      evidenceId,
      `Preuve rattachée à l'évaluation ${params.evaluationId} (${isPostPublication ? 'INFORMATION POSTÉRIEURE' : 'CONTEMPORAINE'})`,
      undefined,
      JSON.stringify(newEvidence),
      newEvidence.isDemo,
      newEvidence.provenance
    );
    this.persist();
    return newEvidence;
  }

  // --------------------------------------------------------------------------
  // GESTION DES CONSTATS (FINDINGS)
  // --------------------------------------------------------------------------
  public getFindingsByEvaluationId(evaluationId: string): OsintPostEvaluationFinding[] {
    return this.findings.filter(f => f.evaluationId === evaluationId);
  }

  public getAllFindings(filterDemo?: 'ALL' | 'REAL' | 'DEMO'): OsintPostEvaluationFinding[] {
    if (filterDemo === 'REAL') return this.findings.filter(f => !f.isDemo);
    if (filterDemo === 'DEMO') return this.findings.filter(f => f.isDemo);
    return [...this.findings];
  }

  public createFinding(params: {
    evaluationId: string;
    type: OsintPostFindingType;
    description: string;
    evidenceIds: string[];
    severity: 'INFO' | 'MINEURE' | 'MODEREE' | 'CRITIQUE';
    confidence: 'TRES_FAIBLE' | 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'TRES_ELEVEE';
    recommendation: string;
    actorId?: string;
    isDemo?: boolean;
    provenance?: string;
  }): OsintPostEvaluationFinding {
    const evalObj = this.getEvaluationById(params.evaluationId);
    if (!evalObj) {
      throw new Error(`Évaluation introuvable : '${params.evaluationId}'`);
    }
    if (evalObj.evaluationStatus === 'CLOTUREE') {
      throw new Error(`Contrôle doctrinal bloquant : Impossible d'ajouter un constat à une évaluation clôturée.`);
    }

    const findingId = `fnd-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newFinding: OsintPostEvaluationFinding = {
      findingId,
      evaluationId: params.evaluationId,
      type: params.type,
      description: params.description,
      evidenceIds: params.evidenceIds || [],
      severity: params.severity || 'MINEURE',
      confidence: params.confidence || 'MOYENNE',
      recommendation: params.recommendation || '',
      status: 'ACTIF',
      isDemo: params.isDemo !== undefined ? params.isDemo : evalObj.isDemo,
      provenance: params.provenance || evalObj.provenance,
      createdAt: new Date().toISOString()
    };

    this.findings.push(newFinding);
    this.logAudit(
      params.actorId || 'Analyste-RETEX',
      'FINDING_CREATED',
      'FINDING',
      findingId,
      `Constat créé pour l'évaluation ${params.evaluationId} : ${params.type}`,
      undefined,
      JSON.stringify(newFinding),
      newFinding.isDemo,
      newFinding.provenance
    );
    this.persist();
    return newFinding;
  }

  // --------------------------------------------------------------------------
  // GESTION DES RETOURS & FEEDBACKS
  // --------------------------------------------------------------------------
  public getFeedbackList(filterDemo?: 'ALL' | 'REAL' | 'DEMO'): OsintFeedback[] {
    if (filterDemo === 'REAL') return this.feedbackList.filter(f => !f.isDemo);
    if (filterDemo === 'DEMO') return this.feedbackList.filter(f => f.isDemo);
    return [...this.feedbackList];
  }

  public getFeedbackByNoteId(noteId: string): OsintFeedback[] {
    return this.feedbackList.filter(f => f.noteId === noteId);
  }

  public createFeedback(params: {
    noteId: string;
    distributionId?: string;
    authorId: string;
    authorRole: string;
    feedbackType: OsintFeedbackType;
    severity: 'INFO' | 'MINEURE' | 'MODEREE' | 'CRITIQUE';
    content: string;
    actionRequired?: boolean;
    isDemo?: boolean;
    provenance?: string;
  }): OsintFeedback {
    const feedbackId = `fb-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newFeedback: OsintFeedback = {
      feedbackId,
      noteId: params.noteId,
      distributionId: params.distributionId,
      authorId: params.authorId || 'Destinataire/Analyste',
      authorRole: params.authorRole || 'Utilisateur Qualifié',
      feedbackType: params.feedbackType,
      severity: params.severity || 'MODEREE',
      content: params.content,
      actionRequired: params.actionRequired !== undefined ? params.actionRequired : (params.feedbackType === 'CORRECTION' || params.feedbackType === 'CONTRADICTION'),
      status: 'NOUVEAU',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      provenance: params.provenance || 'OSINT-AFRICA-FEEDBACK',
      isDemo: params.isDemo !== undefined ? params.isDemo : true
    };

    this.feedbackList.unshift(newFeedback);
    this.logAudit(
      params.authorId,
      'FEEDBACK_CREATED',
      'FEEDBACK',
      feedbackId,
      `Retour émis sur note ${params.noteId} : ${params.feedbackType}`,
      undefined,
      JSON.stringify(newFeedback),
      newFeedback.isDemo,
      newFeedback.provenance
    );
    this.persist();
    return newFeedback;
  }

  public updateFeedbackStatus(
    feedbackId: string,
    status: OsintFeedback['status'],
    resolutionComment?: string,
    actorId?: string
  ): OsintFeedback {
    const index = this.feedbackList.findIndex(f => f.feedbackId === feedbackId);
    if (index === -1) {
      throw new Error(`Feedback introuvable : '${feedbackId}'`);
    }

    const current = this.feedbackList[index];
    const beforeStr = JSON.stringify(current);
    const updated: OsintFeedback = {
      ...current,
      status,
      resolutionComment: resolutionComment || current.resolutionComment,
      resolvedAt: status === 'TRAITE' || status === 'REJETE' ? new Date().toISOString() : current.resolvedAt,
      updatedAt: new Date().toISOString()
    };

    this.feedbackList[index] = updated;
    this.logAudit(
      actorId || 'Analyste-RETEX',
      'FEEDBACK_UPDATED',
      'FEEDBACK',
      feedbackId,
      `Statut feedback mis à jour : ${status}`,
      beforeStr,
      JSON.stringify(updated),
      updated.isDemo,
      updated.provenance
    );
    this.persist();
    return updated;
  }

  // --------------------------------------------------------------------------
  // CAPITALISATION DES LEÇONS APPRISES
  // --------------------------------------------------------------------------
  public getLessons(filterDemo?: 'ALL' | 'REAL' | 'DEMO'): OsintLessonLearned[] {
    if (filterDemo === 'REAL') return this.lessons.filter(l => !l.isDemo);
    if (filterDemo === 'DEMO') return this.lessons.filter(l => l.isDemo);
    return [...this.lessons];
  }

  public getLessonsByEvaluationId(evaluationId: string): OsintLessonLearned[] {
    return this.lessons.filter(l => l.sourceEvaluationId === evaluationId);
  }

  public createLesson(params: {
    title: string;
    description: string;
    category: OsintLessonCategory;
    sourceEvaluationId: string;
    applicableScope: string;
    findingDescription?: string;
    probableCause?: string;
    impact: string;
    recommendation: string;
    priority?: 'FAIBLE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
    isDemo?: boolean;
    provenance?: string;
    actorId?: string;
  }): OsintLessonLearned {
    const lessonId = `lsn-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newLesson: OsintLessonLearned = {
      lessonId,
      title: params.title,
      description: params.description,
      category: params.category,
      sourceEvaluationId: params.sourceEvaluationId,
      applicableScope: params.applicableScope || 'Global',
      findingDescription: params.findingDescription,
      probableCause: params.probableCause || 'CAUSE NON DÉTERMINÉE',
      impact: params.impact || 'Amélioration de la rigueur documentaire',
      recommendation: params.recommendation,
      priority: params.priority || 'MOYENNE',
      status: 'PROPOSEE',
      isDemo: params.isDemo !== undefined ? params.isDemo : true,
      provenance: params.provenance || 'OSINT-AFRICA-CAPITALISATION',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.lessons.unshift(newLesson);
    this.logAudit(
      params.actorId || 'Analyste-RETEX',
      'LESSON_CREATED',
      'LESSON',
      lessonId,
      `Leçon apprise créée : ${params.title}`,
      undefined,
      JSON.stringify(newLesson),
      newLesson.isDemo,
      newLesson.provenance
    );
    this.persist();
    return newLesson;
  }

  // --------------------------------------------------------------------------
  // ACTIONS D'AMÉLIORATION
  // --------------------------------------------------------------------------
  public getActions(filterDemo?: 'ALL' | 'REAL' | 'DEMO'): OsintImprovementAction[] {
    if (filterDemo === 'REAL') return this.actions.filter(a => !a.isDemo);
    if (filterDemo === 'DEMO') return this.actions.filter(a => a.isDemo);
    return [...this.actions];
  }

  public getActionsByLessonId(lessonId: string): OsintImprovementAction[] {
    return this.actions.filter(a => a.lessonId === lessonId);
  }

  public createImprovementAction(params: {
    lessonId: string;
    title: string;
    description: string;
    responsibleRole: string;
    priority?: 'FAIBLE' | 'MOYENNE' | 'HAUTE' | 'URGENTE';
    relatedLot?: string;
    dueDate?: string;
    isDemo?: boolean;
    provenance?: string;
    actorId?: string;
  }): OsintImprovementAction {
    const actionId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newAction: OsintImprovementAction = {
      actionId,
      lessonId: params.lessonId,
      title: params.title,
      description: params.description,
      responsibleRole: params.responsibleRole || 'Responsable Analytique',
      priority: params.priority || 'MOYENNE',
      status: 'IDENTIFIEE',
      relatedLot: params.relatedLot || 'LOT 31',
      dueDate: params.dueDate,
      isDemo: params.isDemo !== undefined ? params.isDemo : true,
      provenance: params.provenance || 'OSINT-AFRICA-AMELIORATION',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.actions.unshift(newAction);
    this.logAudit(
      params.actorId || 'Analyste-RETEX',
      'ACTION_CREATED',
      'ACTION',
      actionId,
      `Action d'amélioration créée : ${params.title}`,
      undefined,
      JSON.stringify(newAction),
      newAction.isDemo,
      newAction.provenance
    );
    this.persist();
    return newAction;
  }

  public updateActionStatus(
    actionId: string,
    status: OsintImprovementActionStatus,
    actorId?: string
  ): OsintImprovementAction {
    const index = this.actions.findIndex(a => a.actionId === actionId);
    if (index === -1) {
      throw new Error(`Action introuvable : '${actionId}'`);
    }

    const current = this.actions[index];
    const beforeStr = JSON.stringify(current);
    const updated: OsintImprovementAction = {
      ...current,
      status,
      completionDate: status === 'REALISEE' ? new Date().toISOString() : current.completionDate,
      updatedAt: new Date().toISOString()
    };

    this.actions[index] = updated;
    this.logAudit(
      actorId || 'Analyste-RETEX',
      status === 'REALISEE' ? 'ACTION_COMPLETED' : 'ACTION_UPDATED',
      'ACTION',
      actionId,
      `Statut action d'amélioration : ${status}`,
      beforeStr,
      JSON.stringify(updated),
      updated.isDemo,
      updated.provenance
    );
    this.persist();
    return updated;
  }

  // --------------------------------------------------------------------------
  // EXPORT JSON COMPLET
  // --------------------------------------------------------------------------
  public exportRetexDataJson(filterDemo: 'ALL' | 'REAL' | 'DEMO' = 'ALL') {
    const evals = this.getEvaluations(filterDemo);
    const fb = this.getFeedbackList(filterDemo);
    const findings = this.getAllFindings(filterDemo);
    const lessons = this.getLessons(filterDemo);
    const actions = this.getActions(filterDemo);
    const audit = this.getAuditLogs();

    const exportPayload = {
      metadata: {
        exportDate: new Date().toISOString(),
        lot: 'LOT 33 — RETOUR D’EXPÉRIENCE, CAPITALISATION ET ÉVALUATION POST-DIFFUSION',
        version: '1.0.0-PROD',
        scope: filterDemo,
        generatedBy: 'OSINT AFRICA RETEX ENGINE'
      },
      doctrinalNotice: RETEX_DOCTRINAL_NOTICES,
      statistics: {
        evaluationsCount: evals.length,
        feedbackCount: fb.length,
        findingsCount: findings.length,
        lessonsCount: lessons.length,
        actionsCount: actions.length
      },
      evaluations: evals,
      feedback: fb,
      findings,
      evidence: this.evidenceList,
      lessons,
      improvementActions: actions,
      auditJournal: audit
    };

    this.logAudit(
      'Analyste-RETEX',
      'EXPORT_CREATED',
      'EXPORT',
      `exp-${Date.now()}`,
      `Export JSON de capitalisation (${filterDemo})`,
      undefined,
      JSON.stringify(exportPayload.statistics)
    );

    return exportPayload;
  }

  // --------------------------------------------------------------------------
  // INITIALISATION DES 5 SCÉNARIOS DE DÉMONSTRATION DU CDC
  // --------------------------------------------------------------------------
  private initDemoData() {
    const now = new Date();
    const iso = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString();

    // SCÉNARIO 1 : Analyse confirmée
    const eval1: OsintPostEvaluation = {
      evaluationId: 'eval-demo-001',
      noteId: 'note-001',
      distributionId: 'dist-001',
      evaluatorId: 'eval-senior-01',
      evaluatorRole: 'Auditeur Retex Senior',
      evaluationDate: iso(10),
      evaluationStatus: 'EN_ANALYSE',
      initialAssessment: {
        facts: ['Mouvements logistiques observés sur la RN1', 'Multiplication des points de contrôle'],
        reportedInfo: ['Regroupement estimé à 40 personnels'],
        unconfirmedInfo: ['Origine exacte des véhicules'],
        hypotheses: ['Hypothèse 1 : Renforcement préventif sécuritaire'],
        confidence: 'ELEVEE',
        conclusion: 'Renforcement sécuritaire confirmé sur l’axe stratégique Nord.',
        productionDate: iso(25),
        validationDate: iso(24),
        diffusionDate: iso(23)
      },
      retrospectiveAssessment: 'Les communiqués officiels et rapports ministériels émis 15 jours plus tard ont confirmé l’établissement formel de la base opérationnelle avancée.',
      evaluationScope: 'Évaluation post-déploiement trimestrielle',
      overallFinding: 'CONFIRMED',
      confidence: 'TRES_ELEVEE',
      methodologicalScore: {
        traceability: 20,
        completeness: 20,
        evidenceQuality: 20,
        separationFactsHypotheses: 15,
        contradictionsHandling: 12,
        datingAccuracy: 10,
        provenanceQuality: 10,
        totalScore: 92
      },
      isDemo: true,
      provenance: 'OSINT-AFRICA-SCENARIO-1',
      createdAt: iso(10),
      updatedAt: iso(8)
    };

    const evd1: OsintEvaluationEvidence = {
      evidenceId: 'evd-demo-001',
      evaluationId: 'eval-demo-001',
      sourceId: 'src-aps-official',
      sourceUrl: 'https://aps.dz/regions/sahel-securite-base',
      evidenceType: 'DECLARATION',
      publicationDate: iso(12),
      discoveredDate: iso(10),
      isPostPublication: true,
      relevance: 'FORTE',
      independence: 'INDEPENDANTE',
      confidence: 'ELEVEE',
      excerpt: 'Déclaration officielle confirmant l’inauguration du poste de contrôle avancé.',
      provenance: 'APS',
      isDemo: true,
      createdAt: iso(10)
    };

    const fnd1: OsintPostEvaluationFinding = {
      findingId: 'fnd-demo-001',
      evaluationId: 'eval-demo-001',
      type: 'CONFIRMED',
      description: 'L’appréciation initiale de renforcement préventif s’est vérifiée sans déviation majeure.',
      evidenceIds: ['evd-demo-001'],
      severity: 'INFO',
      confidence: 'TRES_ELEVEE',
      recommendation: 'Maintenir le canevas de qualification des sources d’observation directe.',
      status: 'VALIDE',
      isDemo: true,
      provenance: 'OSINT-AFRICA-DEMO',
      createdAt: iso(10)
    };

    // SCÉNARIO 2 : Analyse partiellement confirmée
    const eval2: OsintPostEvaluation = {
      evaluationId: 'eval-demo-002',
      noteId: 'note-002',
      distributionId: 'dist-002',
      evaluatorId: 'eval-analyst-02',
      evaluatorRole: 'Analyste Évaluateur',
      evaluationDate: iso(8),
      evaluationStatus: 'LEÇONS_IDENTIFIEES',
      initialAssessment: {
        facts: ['Ralentissement des flux portuaires', 'Baisse du trafic de cabotage'],
        reportedInfo: ['Tensions douanières ponctuelles'],
        unconfirmedInfo: ['Impact sur les chaînes d’approvisionnement intérieures'],
        hypotheses: ['Hypothèse 2 : Grève perlée des opérateurs logistiques'],
        confidence: 'MOYENNE',
        conclusion: 'Ralentissement logistique anticipé sans certitude sur l’ampleur économique.',
        productionDate: iso(20),
        validationDate: iso(19),
        diffusionDate: iso(18)
      },
      retrospectiveAssessment: 'Le ralentissement portuaire s’est avéré réel mais causé par une maintenance technique lourde non répertoriée et non par une grève.',
      evaluationScope: 'Audit post-diffusion flux côtiers',
      overallFinding: 'PARTIALLY_CONFIRMED',
      confidence: 'MOYENNE',
      methodologicalScore: {
        traceability: 18,
        completeness: 15,
        evidenceQuality: 15,
        separationFactsHypotheses: 15,
        contradictionsHandling: 10,
        datingAccuracy: 10,
        provenanceQuality: 10,
        totalScore: 78
      },
      isDemo: true,
      provenance: 'OSINT-AFRICA-SCENARIO-2',
      createdAt: iso(8),
      updatedAt: iso(6)
    };

    const lsn2: OsintLessonLearned = {
      lessonId: 'lsn-demo-002',
      title: 'Vérification systématique des avis aux navigateurs et plannings de maintenance',
      description: 'Ne pas imputer automatiquement un ralentissement logistique à des causes sociales sans consulter les calendriers techniques portuaires.',
      category: 'COLLECTION',
      sourceEvaluationId: 'eval-demo-002',
      applicableScope: 'Infrastructures maritimes et portuaires',
      findingDescription: 'Hypothèse de mouvement social erronée.',
      probableCause: 'Absence de consultation du registre des travaux d’infrastructure.',
      impact: 'Biais d’attribution socio-politique évitable.',
      recommendation: 'Intégrer les avis portuaires officiels dans la checklist de collecte.',
      priority: 'HAUTE',
      status: 'VALIDEE',
      isDemo: true,
      provenance: 'OSINT-AFRICA-DEMO',
      createdAt: iso(8),
      updatedAt: iso(6)
    };

    const act2: OsintImprovementAction = {
      actionId: 'act-demo-002',
      lessonId: 'lsn-demo-002',
      title: 'Ajout de la source Avis Maritimes & Bulletins Portuaires au plan de veille',
      description: 'Configurer un connecteur spécifique de surveillance des avis techniques portuaires dans le LOT 29/22.',
      responsibleRole: 'Officier de Veille Maritime',
      priority: 'HAUTE',
      status: 'PLANIFIEE',
      relatedLot: 'LOT 29',
      dueDate: iso(-15),
      isDemo: true,
      provenance: 'OSINT-AFRICA-DEMO',
      createdAt: iso(7),
      updatedAt: iso(6)
    };

    // SCÉNARIO 3 : Hypothèse non confirmée (Indéterminée)
    const eval3: OsintPostEvaluation = {
      evaluationId: 'eval-demo-003',
      noteId: 'note-003',
      evaluatorId: 'eval-analyst-03',
      evaluatorRole: 'Évaluateur Thématique',
      evaluationDate: iso(15),
      evaluationStatus: 'CLOTUREE',
      initialAssessment: {
        facts: ['Rencontres bilatérales préliminaires à huis clos'],
        reportedInfo: ['Rumeur d’accord frontalier imminent'],
        unconfirmedInfo: ['Termes du protocole d’accord'],
        hypotheses: ['Hypothèse alternative : Signature d’un traité sous 30 jours'],
        confidence: 'FAIBLE',
        conclusion: 'Possibilité d’accord diplomatique sans certitude probante.',
        productionDate: iso(45),
        validationDate: iso(44),
        diffusionDate: iso(43)
      },
      retrospectiveAssessment: 'Aucune annonce ni signature n’est intervenue dans le délai imparti. La situation demeure gelée sans éléments probants confirmatoires ou réfutatoires.',
      evaluationScope: 'Évaluation prospective diplomatique',
      overallFinding: 'NOT_CONFIRMED',
      confidence: 'MOYENNE',
      closedAt: iso(2),
      closedBy: 'Chef-Cellule-Retex',
      closeJustification: 'Délai d’observation échu, hypothèse maintenue sans validation matérielle.',
      methodologicalScore: {
        traceability: 15,
        completeness: 15,
        evidenceQuality: 10,
        separationFactsHypotheses: 20,
        contradictionsHandling: 15,
        datingAccuracy: 10,
        provenanceQuality: 10,
        totalScore: 80
      },
      isDemo: true,
      provenance: 'OSINT-AFRICA-SCENARIO-3',
      createdAt: iso(15),
      updatedAt: iso(2)
    };

    // SCÉNARIO 4 : Information contredite
    const eval4: OsintPostEvaluation = {
      evaluationId: 'eval-demo-004',
      noteId: 'note-004',
      evaluatorId: 'eval-auditor-01',
      evaluatorRole: 'Auditeur Méthodologique',
      evaluationDate: iso(5),
      evaluationStatus: 'ACTIONS_PLANIFIEES',
      initialAssessment: {
        facts: ['Annonce de découverte d’un nouveau gisement minier'],
        reportedInfo: ['Estimation de réserve de 500kt'],
        unconfirmedInfo: ['Rapport de certification géologique officiel'],
        hypotheses: ['Hypothèse : Impact économique majeur à court terme'],
        confidence: 'FAIBLE',
        conclusion: 'Potentiel économique sous réserve d’audit géologique indépendant.',
        productionDate: iso(30),
        validationDate: iso(29),
        diffusionDate: iso(28)
      },
      retrospectiveAssessment: 'Le rapport géologique indépendant publié le mois suivant a démenti les volumes annoncés, révélant une surestimation commerciale d’un facteur 10.',
      evaluationScope: 'Audit d’information économique',
      overallFinding: 'CONTRADICTED',
      confidence: 'ELEVEE',
      methodologicalScore: {
        traceability: 18,
        completeness: 20,
        evidenceQuality: 20,
        separationFactsHypotheses: 15,
        contradictionsHandling: 20,
        datingAccuracy: 10,
        provenanceQuality: 10,
        totalScore: 89
      },
      isDemo: true,
      provenance: 'OSINT-AFRICA-SCENARIO-4',
      createdAt: iso(5),
      updatedAt: iso(3)
    };

    const fb4: OsintFeedback = {
      feedbackId: 'fb-demo-004',
      noteId: 'note-004',
      authorId: 'analyste-economique-ext',
      authorRole: 'Analyste Matières Premières',
      feedbackType: 'CONTRADICTION',
      severity: 'CRITIQUE',
      content: 'Les chiffres initiaux émanaient d’un communiqué promotionnel non audité. Le rapport géologique international réfute ces estimations.',
      actionRequired: true,
      status: 'PRIS_EN_COMPTE',
      createdAt: iso(4),
      updatedAt: iso(3),
      provenance: 'OSINT-AFRICA-DEMO',
      isDemo: true
    };

    const lsn4: OsintLessonLearned = {
      lessonId: 'lsn-demo-004',
      title: 'Exigence de certification tierce pour toute donnée d’évaluation de gisement',
      description: 'Ne jamais relayer de volumétrie minière sans audit de conformité aux standards internationaux (NI 43-101 ou JORC).',
      category: 'VERIFICATION',
      sourceEvaluationId: 'eval-demo-004',
      applicableScope: 'Notes Économiques et Ressources Minières',
      findingDescription: 'Surestimation commerciale relayée comme donnée tangible.',
      probableCause: 'Confiance excessive dans un communiqué corporate sans validation technique indépendante.',
      impact: 'Risque de distorsion de l’analyse macroéconomique.',
      recommendation: 'Classer systématiquement les volumes non audités en Information non confirmée avec avertissement explicite.',
      priority: 'CRITIQUE',
      status: 'VALIDEE',
      isDemo: true,
      provenance: 'OSINT-AFRICA-DEMO',
      createdAt: iso(4),
      updatedAt: iso(3)
    };

    const act4: OsintImprovementAction = {
      actionId: 'act-demo-004',
      lessonId: 'lsn-demo-004',
      title: 'Mise à jour de la grille de relecture LOT 31 pour les notes Ressources Naturelles',
      description: 'Ajouter une règle de contrôle bloquante exigeant la mention explicite du standard de certification.',
      responsibleRole: 'Responsable Méthodologique',
      priority: 'URGENTE',
      status: 'EN_COURS',
      relatedLot: 'LOT 31',
      dueDate: iso(-5),
      isDemo: true,
      provenance: 'OSINT-AFRICA-DEMO',
      createdAt: iso(3),
      updatedAt: iso(2)
    };

    // SCÉNARIO 5 : Leçon d'amélioration procédurale
    const eval5: OsintPostEvaluation = {
      evaluationId: 'eval-demo-005',
      noteId: 'note-005',
      evaluatorId: 'eval-methodo-02',
      evaluatorRole: 'Auditeur Qualité Renseignement',
      evaluationDate: iso(3),
      evaluationStatus: 'ACTIONS_PLANIFIEES',
      initialAssessment: {
        facts: ['Événements météo extrêmes signalés dans la vallée du fleuve'],
        reportedInfo: ['Déplacements de populations préventifs'],
        unconfirmedInfo: ['Nombre de ménages affectés'],
        hypotheses: ['Hypothèse 1 : Crise humanitaire localisée'],
        confidence: 'ELEVEE',
        conclusion: 'Impact humanitaire potentiel élevé nécessitant une surveillance hydrologique.',
        productionDate: iso(15),
        validationDate: iso(14),
        diffusionDate: iso(13)
      },
      retrospectiveAssessment: 'L’anticipation était exacte mais la note a été diffusée avec un retard de 48 heures réduisant son utilité tactique.',
      evaluationScope: 'Audit de vélocité de diffusion post-validation',
      overallFinding: 'CONFIRMED',
      confidence: 'ELEVEE',
      methodologicalScore: {
        traceability: 20,
        completeness: 20,
        evidenceQuality: 18,
        separationFactsHypotheses: 15,
        contradictionsHandling: 10,
        datingAccuracy: 10,
        provenanceQuality: 10,
        totalScore: 90
      },
      isDemo: true,
      provenance: 'OSINT-AFRICA-SCENARIO-5',
      createdAt: iso(3),
      updatedAt: iso(1)
    };

    const lsn5: OsintLessonLearned = {
      lessonId: 'lsn-demo-005',
      title: 'Réduction du délai de chaîne Validation -> Diffusion pour alertes environnementales',
      description: 'La chaîne de contrôle de diffusion doit comporter une voie rapide pour les événements à cinétique rapide (inondations, crues).',
      category: 'DIFFUSION',
      sourceEvaluationId: 'eval-demo-005',
      applicableScope: 'Notes d’Alerte & Crises Environnementales',
      findingDescription: 'Délai administratif excessif post-validation.',
      probableCause: 'Procédure de diffusion séquentielle manuelle sans priorité d’urgence.',
      impact: 'Perte de valeur opérationnelle pour le destinataire.',
      recommendation: 'Formaliser un circuit de diffusion prioritaire direct dès validation.',
      priority: 'HAUTE',
      status: 'VALIDEE',
      isDemo: true,
      provenance: 'OSINT-AFRICA-DEMO',
      createdAt: iso(2),
      updatedAt: iso(1)
    };

    const act5: OsintImprovementAction = {
      actionId: 'act-demo-005',
      lessonId: 'lsn-demo-005',
      title: 'Création d’un modèle de diffusion accélérée dans le pupitre LOT 32',
      description: 'Permettre l’émission directe en 1 clic pour les notes marquées Priorité Urgente.',
      responsibleRole: 'Administrateur Diffusion',
      priority: 'HAUTE',
      status: 'PLANIFIEE',
      relatedLot: 'LOT 32',
      dueDate: iso(-10),
      isDemo: true,
      provenance: 'OSINT-AFRICA-DEMO',
      createdAt: iso(2),
      updatedAt: iso(1)
    };

    this.evaluations = [eval1, eval2, eval3, eval4, eval5];
    this.evidenceList = [evd1];
    this.findings = [fnd1];
    this.feedbackList = [fb4];
    this.lessons = [lsn2, lsn4, lsn5];
    this.actions = [act2, act4, act5];

    this.logAudit(
      'SYSTEM-INIT',
      'INIT_DEMO_DATA',
      'SYSTEM',
      'lot33-init',
      'Initialisation des 5 scénarios de démonstration du LOT 33',
      undefined,
      JSON.stringify({ evaluations: 5, lessons: 3, actions: 3 }),
      true,
      'OSINT-AFRICA-INIT'
    );

    this.persist();
  }
}

export const feedbackService = new FeedbackService();
