/**
 * OSINT AFRICA - LOT 29
 * Service de Gestion du Centre de Pilotage de la Veille OSINT
 *
 * Traite les cycles complets :
 * COLLECTE → QUALIFICATION → PRIORISATION → SURVEILLANCE → INDICATEURS → ACTIONS ANALYTIQUES → SUIVI → RÉÉVALUATION → AUDIT
 *
 * RÈGLES DOCTRINALES STRICTES :
 * - Priorité de traitement ≠ probabilité de menace ou vérité.
 * - Corrélation ≠ causalité.
 * - Anomalie ≠ menace confirmée.
 * - Signal faible ≠ alerte.
 * - Alerte ≠ événement confirmé.
 * - Convergence ≠ indépendance des sources.
 * - Hypothèse ≠ fait.
 * - Présence informationnelle ≠ attribution.
 * - Toute décision analytique importante requiert un arbitrage humain.
 * - 0 nouvelle connexion réseau (mode local / offline strict).
 */

import {
  OsintWatchPlan,
  WatchPlanStatus,
  WatchPlanPriority,
  OsintWatchAction,
  OsintWatchActionStatus,
  OsintWatchReview,
  OsintWatchGap,
  OsintWatchContradiction,
  OsintContradictionStatus,
  OsintWatchAuditLog,
} from '../types';
import {
  INITIAL_WATCH_PLANS,
  INITIAL_DEMO_WATCH_ACTIONS,
  INITIAL_DEMO_WATCH_GAPS,
  INITIAL_DEMO_WATCH_REVIEWS,
  INITIAL_DEMO_WATCH_CONTRADICTIONS,
  INITIAL_DEMO_WATCH_AUDITS,
} from '../data/mockWatchPlans';
import { indicatorService } from './indicatorService';
import { weakSignalService } from './weakSignalService';
import { anomalyDetectionService } from './anomalyDetectionService';
import { alertService } from './alertService';
import { DEMO_OSINT_EVENTS } from '../data/osintEventsData';
import { DEMO_SOURCES, REAL_SOURCES } from '../data/sourcesData';
import { DEMO_ACTORS } from '../data/actorsData';
import { DEMO_HYPOTHESES, DEMO_EVIDENCE, DEMO_ANALYSES } from '../data/analysisData';
import { INITIAL_DEMO_CORRELATIONS } from '../data/weakSignalDemoData';
import { DEMO_CORRELATIONS } from '../data/correlationData';

const STORAGE_KEYS = {
  PLANS: 'OSINT_WATCH_PLANS_LOT29',
  ACTIONS: 'OSINT_WATCH_ACTIONS_LOT29',
  GAPS: 'OSINT_WATCH_GAPS_LOT29',
  REVIEWS: 'OSINT_WATCH_REVIEWS_LOT29',
  CONTRADICTIONS: 'OSINT_WATCH_CONTRADICTIONS_LOT29',
  AUDIT: 'OSINT_WATCH_AUDIT_LOT29',
};

const inMemoryStore: Record<string, string> = {};

const safeGetItem = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch {
    // fallback
  }
  return inMemoryStore[key] || null;
};

const safeSetItem = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch {
    // fallback
  }
  inMemoryStore[key] = value;
};

export interface PriorityScoreBreakdown {
  score: number;
  label: string;
  doctrinalDisclaimer: string;
  factors: {
    name: string;
    weight: number;
    score: number;
    reason: string;
  }[];
}

export interface WatchPilotKpis {
  totalPlans: number;
  activePlans: number;
  underWatchPlans: number;
  suspendedPlans: number;
  overdueReviewPlans: number;
  linkedAlertsCount: number;
  linkedWeakSignalsCount: number;
  abnormalIndicatorsCount: number;
  openGapsCount: number;
  overdueActionsCount: number;
  needsReevaluationCount: number;
}

export class WatchPilotService {
  private listeners: (() => void)[] = [];

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Erreur listener WatchPilotService:', err);
      }
    });
  }

  // ==========================================================================
  // 1. PLANS DE VEILLE (CRUD & FILTRES)
  // ==========================================================================

  public getWatchPlans(isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): OsintWatchPlan[] {
    try {
      const stored = safeGetItem(STORAGE_KEYS.PLANS);
      let plans: OsintWatchPlan[] = stored ? JSON.parse(stored) : INITIAL_WATCH_PLANS;
      if (!stored) {
        safeSetItem(STORAGE_KEYS.PLANS, JSON.stringify(INITIAL_WATCH_PLANS));
      }

      if (isDemoFilter === 'REAL') {
        return plans.filter((p) => p.isDemo === false);
      } else if (isDemoFilter === 'DEMO') {
        return plans.filter((p) => p.isDemo === true);
      }
      return plans;
    } catch {
      return INITIAL_WATCH_PLANS;
    }
  }

  public getWatchPlanById(id: string): OsintWatchPlan | undefined {
    const plans = this.getWatchPlans('ALL');
    return plans.find((p) => p.id === id);
  }

  public saveWatchPlan(plan: OsintWatchPlan, analystId: string, justification: string = 'Mise à jour standard'): void {
    const plans = this.getWatchPlans('ALL');
    const existingIndex = plans.findIndex((p) => p.id === plan.id);
    const updatedPlan: OsintWatchPlan = {
      ...plan,
      updatedAt: new Date().toISOString(),
    };

    let previousValue: string | undefined = undefined;
    if (existingIndex >= 0) {
      previousValue = `Titre: ${plans[existingIndex].title}, Statut: ${plans[existingIndex].status}, Priorité: ${plans[existingIndex].priority}`;
      plans[existingIndex] = updatedPlan;
    } else {
      plans.unshift(updatedPlan);
    }

    try {
      safeSetItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    } catch (err) {
      console.error('Erreur sauvegarde plan:', err);
    }

    this.logAudit({
      watchPlanId: plan.id,
      analystId,
      action: existingIndex >= 0 ? 'MODIFICATION_PLAN' : 'CREATION_PLAN',
      objectType: 'WATCH_PLAN',
      objectId: plan.id,
      previousValue,
      newValue: `Titre: ${plan.title}, Statut: ${plan.status}, Priorité: ${plan.priority}`,
      justification,
      provenance: plan.provenance || (plan.isDemo ? 'PLAN_DEMO' : 'PLAN_REEL_APS'),
      isDemo: plan.isDemo,
    });

    this.notify();
  }

  public createWatchPlan(
    input: Omit<OsintWatchPlan, 'id' | 'createdAt' | 'updatedAt'>,
    analystId: string
  ): OsintWatchPlan {
    const id = `wp-${input.isDemo ? 'demo' : 'real'}-${Date.now()}`;
    const newPlan: OsintWatchPlan = {
      ...input,
      id,
      name: input.title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nextReviewAt:
        input.nextReviewAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      reviewFrequency: input.reviewFrequency || 'WEEKLY',
      provenance: input.provenance || (input.isDemo ? 'PLAN_DEMO_MANUEL' : 'PLAN_REEL_MANUEL'),
    };

    this.saveWatchPlan(newPlan, analystId, 'Création d’un nouveau plan de veille structuré');
    return newPlan;
  }

  public updatePlanStatus(
    planId: string,
    newStatus: WatchPlanStatus,
    analystId: string,
    justification: string
  ): void {
    const plan = this.getWatchPlanById(planId);
    if (!plan) return;

    const oldStatus = plan.status;
    plan.status = newStatus;
    plan.updatedAt = new Date().toISOString();

    this.saveWatchPlan(
      plan,
      analystId,
      `Changement de statut: ${oldStatus} → ${newStatus}. Justification: ${justification}`
    );
  }

  public updatePlanPriority(
    planId: string,
    newPriority: WatchPlanPriority,
    analystId: string,
    justification: string
  ): void {
    const plan = this.getWatchPlanById(planId);
    if (!plan) return;

    const oldPriority = plan.priority;
    plan.priority = newPriority;
    plan.updatedAt = new Date().toISOString();

    this.saveWatchPlan(
      plan,
      analystId,
      `Réajustement de priorité: ${oldPriority} → ${newPriority}. Justification: ${justification}`
    );
  }

  public deletePlan(planId: string, analystId: string, justification: string): void {
    const plans = this.getWatchPlans('ALL');
    const target = plans.find((p) => p.id === planId);
    if (!target) return;

    const filtered = plans.filter((p) => p.id !== planId);
    safeSetItem(STORAGE_KEYS.PLANS, JSON.stringify(filtered));

    this.logAudit({
      watchPlanId: planId,
      analystId,
      action: 'SUPPRESSION_PLAN',
      objectType: 'WATCH_PLAN',
      objectId: planId,
      previousValue: `Titre: ${target.title}, Statut: ${target.status}`,
      justification,
      provenance: target.provenance || 'AUDIT_LOCAL',
      isDemo: target.isDemo,
    });

    this.notify();
  }

  // ==========================================================================
  // 2. ACTIONS ANALYTIQUES (CRUD & GESTION)
  // ==========================================================================

  public getActions(watchPlanId?: string, isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): OsintWatchAction[] {
    try {
      const stored = safeGetItem(STORAGE_KEYS.ACTIONS);
      let actions: OsintWatchAction[] = stored ? JSON.parse(stored) : INITIAL_DEMO_WATCH_ACTIONS;
      if (!stored) {
        safeSetItem(STORAGE_KEYS.ACTIONS, JSON.stringify(INITIAL_DEMO_WATCH_ACTIONS));
      }

      if (watchPlanId) {
        actions = actions.filter((a) => a.watchPlanId === watchPlanId);
      }

      if (isDemoFilter === 'REAL') {
        return actions.filter((a) => a.isDemo === false);
      } else if (isDemoFilter === 'DEMO') {
        return actions.filter((a) => a.isDemo === true);
      }
      return actions;
    } catch {
      return INITIAL_DEMO_WATCH_ACTIONS;
    }
  }

  public saveAction(action: OsintWatchAction, analystId: string): void {
    const actions = this.getActions(undefined, 'ALL');
    const index = actions.findIndex((a) => a.id === action.id);
    let previousValue: string | undefined = undefined;

    if (index >= 0) {
      previousValue = `Titre: ${actions[index].title}, Statut: ${actions[index].status}`;
      actions[index] = action;
    } else {
      actions.unshift(action);
    }

    safeSetItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));

    this.logAudit({
      watchPlanId: action.watchPlanId,
      analystId,
      action: index >= 0 ? 'MODIFICATION_ACTION' : 'CREATION_ACTION',
      objectType: 'WATCH_ACTION',
      objectId: action.id,
      previousValue,
      newValue: `Titre: ${action.title}, Type: ${action.type}, Statut: ${action.status}, Assigné: ${action.assignedTo}`,
      justification: action.justification || 'Mise à jour d’action analytique',
      provenance: action.provenance || (action.isDemo ? 'ACTION_DEMO' : 'ACTION_REELLE'),
      isDemo: action.isDemo,
    });

    this.notify();
  }

  public createAction(
    input: Omit<OsintWatchAction, 'id' | 'createdAt'>,
    analystId: string
  ): OsintWatchAction {
    const id = `act-${input.isDemo ? 'demo' : 'real'}-${Date.now()}`;
    const newAction: OsintWatchAction = {
      ...input,
      id,
      createdAt: new Date().toISOString(),
      provenance: input.provenance || (input.isDemo ? 'ACTION_DEMO_MANUELLE' : 'ACTION_REELLE_MANUELLE'),
    };

    this.saveAction(newAction, analystId);
    return newAction;
  }

  public updateActionStatus(
    actionId: string,
    newStatus: OsintWatchActionStatus,
    analystId: string,
    justification: string = ''
  ): void {
    const actions = this.getActions(undefined, 'ALL');
    const target = actions.find((a) => a.id === actionId);
    if (!target) return;

    target.status = newStatus;
    if (newStatus === 'TERMINEE') {
      target.completedAt = new Date().toISOString();
    }
    if (justification) {
      target.justification = justification;
    }

    this.saveAction(target, analystId);
  }

  // ==========================================================================
  // 3. REVUES ANALYTIQUES HUMAINES
  // ==========================================================================

  public getReviews(watchPlanId?: string, isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): OsintWatchReview[] {
    try {
      const stored = safeGetItem(STORAGE_KEYS.REVIEWS);
      let reviews: OsintWatchReview[] = stored ? JSON.parse(stored) : INITIAL_DEMO_WATCH_REVIEWS;
      if (!stored) {
        safeSetItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_DEMO_WATCH_REVIEWS));
      }

      if (watchPlanId) {
        reviews = reviews.filter((r) => r.watchPlanId === watchPlanId);
      }

      if (isDemoFilter === 'REAL') {
        return reviews.filter((r) => r.isDemo === false);
      } else if (isDemoFilter === 'DEMO') {
        return reviews.filter((r) => r.isDemo === true);
      }
      return reviews;
    } catch {
      return INITIAL_DEMO_WATCH_REVIEWS;
    }
  }

  public createReview(
    input: Omit<OsintWatchReview, 'id' | 'createdAt'>,
    analystId: string
  ): OsintWatchReview {
    const id = `rev-${input.isDemo ? 'demo' : 'real'}-${Date.now()}`;
    const newReview: OsintWatchReview = {
      ...input,
      id,
      createdAt: new Date().toISOString(),
      provenance: input.provenance || (input.isDemo ? 'REVUE_HUMAINE_DEMO' : 'REVUE_HUMAINE_REELLE'),
    };

    const reviews = this.getReviews(undefined, 'ALL');
    reviews.unshift(newReview);
    safeSetItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

    // Mettre à jour lastReviewAt sur le plan de veille
    const plan = this.getWatchPlanById(input.watchPlanId);
    if (plan) {
      plan.lastReviewAt = new Date().toISOString();
      // Calculer prochaine revue selon la fréquence
      const days = plan.reviewFrequency === 'DAILY' ? 1 : plan.reviewFrequency === 'BIWEEKLY' ? 14 : plan.reviewFrequency === 'MONTHLY' ? 30 : 7;
      plan.nextReviewAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      plan.updatedAt = new Date().toISOString();
      this.saveWatchPlan(plan, analystId, 'Mise à jour consécutive à la revue analytique humaine');
    }

    this.logAudit({
      watchPlanId: input.watchPlanId,
      analystId,
      action: 'CREATION_REVUE',
      objectType: 'WATCH_REVIEW',
      objectId: id,
      newValue: `Conclusion: ${input.conclusion.slice(0, 80)}... Confiance: ${input.confidence}`,
      justification: 'Enregistrement d’une revue analytique formelle humaine',
      provenance: newReview.provenance || 'REVUE_LOCALE',
      isDemo: input.isDemo,
    });

    this.notify();
    return newReview;
  }

  // ==========================================================================
  // 4. GAPS / LACUNES D'INFORMATION
  // ==========================================================================

  public getGaps(watchPlanId?: string, isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): OsintWatchGap[] {
    try {
      const stored = safeGetItem(STORAGE_KEYS.GAPS);
      let gaps: OsintWatchGap[] = stored ? JSON.parse(stored) : INITIAL_DEMO_WATCH_GAPS;
      if (!stored) {
        safeSetItem(STORAGE_KEYS.GAPS, JSON.stringify(INITIAL_DEMO_WATCH_GAPS));
      }

      if (watchPlanId) {
        gaps = gaps.filter((g) => g.watchPlanId === watchPlanId);
      }

      if (isDemoFilter === 'REAL') {
        return gaps.filter((g) => g.isDemo === false);
      } else if (isDemoFilter === 'DEMO') {
        return gaps.filter((g) => g.isDemo === true);
      }
      return gaps;
    } catch {
      return INITIAL_DEMO_WATCH_GAPS;
    }
  }

  public createGap(
    input: Omit<OsintWatchGap, 'id'>,
    analystId: string
  ): OsintWatchGap {
    const id = `gap-${input.isDemo ? 'demo' : 'real'}-${Date.now()}`;
    const newGap: OsintWatchGap = {
      ...input,
      id,
      provenance: input.provenance || (input.isDemo ? 'GAP_DEMO_IDENTIFIE' : 'GAP_REEL_IDENTIFIE'),
    };

    const gaps = this.getGaps(undefined, 'ALL');
    gaps.unshift(newGap);
    safeSetItem(STORAGE_KEYS.GAPS, JSON.stringify(gaps));

    this.logAudit({
      watchPlanId: input.watchPlanId,
      analystId,
      action: 'CREATION_GAP',
      objectType: 'WATCH_GAP',
      objectId: id,
      newValue: `Titre: ${input.title}, Priorité: ${input.priority}, Statut: ${input.status}`,
      justification: input.justification || 'Identification d’une lacune de renseignement',
      provenance: newGap.provenance || 'GAP_LOCAL',
      isDemo: input.isDemo,
    });

    this.notify();
    return newGap;
  }

  public resolveGap(
    gapId: string,
    analystId: string,
    justification: string
  ): void {
    const gaps = this.getGaps(undefined, 'ALL');
    const target = gaps.find((g) => g.id === gapId);
    if (!target) return;

    target.status = 'RESOLU';
    target.resolvedAt = new Date().toISOString();
    target.resolvedBy = analystId;
    target.justification = justification;

    safeSetItem(STORAGE_KEYS.GAPS, JSON.stringify(gaps));

    this.logAudit({
      watchPlanId: target.watchPlanId,
      analystId,
      action: 'RESOLUTION_GAP',
      objectType: 'WATCH_GAP',
      objectId: gapId,
      previousValue: 'Statut: OUVERT / EN_COURS',
      newValue: 'Statut: RESOLU',
      justification,
      provenance: target.provenance || 'GAP_LOCAL',
      isDemo: target.isDemo,
    });

    this.notify();
  }

  // ==========================================================================
  // 5. CONTRADICTIONS ANALYTIQUES
  // ==========================================================================

  public getContradictions(
    watchPlanId?: string,
    isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'
  ): OsintWatchContradiction[] {
    try {
      const stored = safeGetItem(STORAGE_KEYS.CONTRADICTIONS);
      let contradictions: OsintWatchContradiction[] = stored
        ? JSON.parse(stored)
        : INITIAL_DEMO_WATCH_CONTRADICTIONS;
      if (!stored) {
        safeSetItem(STORAGE_KEYS.CONTRADICTIONS, JSON.stringify(INITIAL_DEMO_WATCH_CONTRADICTIONS));
      }

      if (watchPlanId) {
        contradictions = contradictions.filter((c) => c.watchPlanId === watchPlanId);
      }

      if (isDemoFilter === 'REAL') {
        return contradictions.filter((c) => c.isDemo === false);
      } else if (isDemoFilter === 'DEMO') {
        return contradictions.filter((c) => c.isDemo === true);
      }
      return contradictions;
    } catch {
      return INITIAL_DEMO_WATCH_CONTRADICTIONS;
    }
  }

  public resolveContradiction(
    contradictionId: string,
    status: OsintContradictionStatus,
    resolutionNotes: string,
    analystId: string
  ): void {
    const list = this.getContradictions(undefined, 'ALL');
    const target = list.find((c) => c.id === contradictionId);
    if (!target) return;

    const oldStatus = target.status;
    target.status = status;
    target.resolutionNotes = resolutionNotes;
    target.resolvedBy = analystId;
    target.resolvedAt = new Date().toISOString();

    safeSetItem(STORAGE_KEYS.CONTRADICTIONS, JSON.stringify(list));

    this.logAudit({
      watchPlanId: target.watchPlanId,
      analystId,
      action: 'ARBITRAGE_CONTRADICTION',
      objectType: 'WATCH_CONTRADICTION',
      objectId: contradictionId,
      previousValue: `Statut: ${oldStatus}`,
      newValue: `Statut: ${status}`,
      justification: resolutionNotes,
      provenance: target.provenance || 'CONTRADICTION_LOCALE',
      isDemo: target.isDemo,
    });

    this.notify();
  }

  public createContradiction(
    input: Omit<OsintWatchContradiction, 'id'>,
    analystId: string
  ): OsintWatchContradiction {
    const id = `ctrd-${input.isDemo ? 'demo' : 'real'}-${Date.now()}`;
    const newContradiction: OsintWatchContradiction = {
      ...input,
      id,
      provenance: input.provenance || (input.isDemo ? 'CONTRADICTION_DEMO' : 'CONTRADICTION_REELLE'),
    };

    const list = this.getContradictions(undefined, 'ALL');
    list.unshift(newContradiction);
    safeSetItem(STORAGE_KEYS.CONTRADICTIONS, JSON.stringify(list));

    this.logAudit({
      watchPlanId: input.watchPlanId,
      analystId,
      action: 'CREATION_CONTRADICTION',
      objectType: 'WATCH_CONTRADICTION',
      objectId: id,
      newValue: `Titre: ${input.title}, SourceA: ${input.sourceA}, SourceB: ${input.sourceB}`,
      justification: 'Documentation d’une divergence entre sources',
      provenance: newContradiction.provenance || 'CONTRADICTION_LOCALE',
      isDemo: input.isDemo,
    });

    this.notify();
    return newContradiction;
  }

  // ==========================================================================
  // 6. AUDIT APPEND-ONLY
  // ==========================================================================

  public getAuditLogs(watchPlanId?: string, isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): OsintWatchAuditLog[] {
    try {
      const stored = safeGetItem(STORAGE_KEYS.AUDIT);
      let logs: OsintWatchAuditLog[] = stored ? JSON.parse(stored) : INITIAL_DEMO_WATCH_AUDITS;
      if (!stored) {
        safeSetItem(STORAGE_KEYS.AUDIT, JSON.stringify(INITIAL_DEMO_WATCH_AUDITS));
      }

      if (watchPlanId) {
        logs = logs.filter((l) => l.watchPlanId === watchPlanId);
      }

      if (isDemoFilter === 'REAL') {
        return logs.filter((l) => l.isDemo === false);
      } else if (isDemoFilter === 'DEMO') {
        return logs.filter((l) => l.isDemo === true);
      }
      return logs;
    } catch {
      return INITIAL_DEMO_WATCH_AUDITS;
    }
  }

  public logAudit(entry: Omit<OsintWatchAuditLog, 'id' | 'timestamp'>): void {
    try {
      const logs = this.getAuditLogs(undefined, 'ALL');
      const newEntry: OsintWatchAuditLog = {
        ...entry,
        id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
      };
      logs.unshift(newEntry);
      safeSetItem(STORAGE_KEYS.AUDIT, JSON.stringify(logs.slice(0, 300)));
    } catch (err) {
      console.error('Erreur écriture audit pilotage:', err);
    }
  }

  // ==========================================================================
  // 7. MATRICE DE PRIORISATION TRANSPARENTE
  // ==========================================================================

  public calculatePriorityScore(plan: OsintWatchPlan): PriorityScoreBreakdown {
    const factors: PriorityScoreBreakdown['factors'] = [];
    let totalScore = 0;

    // Facteur 1 : Niveau de criticité opérationnelle déclarée (Poids 30)
    let critScore = 14;
    let critReason = 'Priorité MOYENNE définie par l’analyste';
    if (plan.priority === 'CRITIQUE') {
      critScore = 30;
      critReason = 'Priorité CRITIQUE assignée par l’analyste référent';
    } else if (plan.priority === 'ELEVEE') {
      critScore = 22;
      critReason = 'Priorité ÉLEVÉE assignée sur cette zone d’intérêt';
    } else if (plan.priority === 'FAIBLE') {
      critScore = 6;
      critReason = 'Priorité FAIBLE (surveillance d’arrière-plan)';
    }
    factors.push({
      name: 'Criticité déclarée du plan',
      weight: 30,
      score: critScore,
      reason: critReason,
    });
    totalScore += critScore;

    // Facteur 2 : Alertes associées (Poids 20)
    const alertCount = (plan.linkedAlertIds || []).length;
    const alertScore = Math.min(20, alertCount * 5);
    factors.push({
      name: 'Alertes qualifiées rattachées',
      weight: 20,
      score: alertScore,
      reason: `${alertCount} alerte(s) active(s) liée(s) au plan de veille`,
    });
    totalScore += alertScore;

    // Facteur 3 : Signaux faibles et anomalies (Poids 15)
    const signalCount = (plan.linkedWeakSignalIds || []).length + (plan.linkedAnomalyIds || []).length;
    const signalScore = Math.min(15, signalCount * 5);
    factors.push({
      name: 'Signaux faibles & Anomalies',
      weight: 15,
      score: signalScore,
      reason: `${signalCount} signal(aux) ou anomalie(s) émergente(s) sous surveillance`,
    });
    totalScore += signalScore;

    // Facteur 4 : Contradictions actives non résolues (Poids 15)
    const planContradictions = this.getContradictions(plan.id, 'ALL');
    const openContradictions = planContradictions.filter((c) => c.status === 'EN_EXAMEN' || c.status === 'MAINTENUE');
    const contradictionScore = Math.min(15, openContradictions.length * 7);
    factors.push({
      name: 'Contradictions entre sources actives',
      weight: 15,
      score: contradictionScore,
      reason: `${openContradictions.length} divergence(s) documentaire(s) non arbitrée(s)`,
    });
    totalScore += contradictionScore;

    // Facteur 5 : Gaps et lacunes de renseignement (Poids 10)
    const planGaps = this.getGaps(plan.id, 'ALL');
    const openGaps = planGaps.filter((g) => g.status === 'OUVERT' || g.status === 'EN_COURS');
    const gapScore = Math.min(10, openGaps.length * 4);
    factors.push({
      name: 'Lacunes d’information (Gaps)',
      weight: 10,
      score: gapScore,
      reason: `${openGaps.length} zone(s) grise(s) ou source(s) manquante(s)`,
    });
    totalScore += gapScore;

    // Facteur 6 : Échéance de revue humaine (Poids 10)
    let reviewScore = 2;
    let reviewReason = 'Revue humaine à jour';
    if (plan.nextReviewAt) {
      const diffHours = (new Date(plan.nextReviewAt).getTime() - Date.now()) / (1000 * 3600);
      if (diffHours < 0) {
        reviewScore = 10;
        reviewReason = 'Revue périodique en retard (dépassement d’échéance)';
      } else if (diffHours < 48) {
        reviewScore = 7;
        reviewReason = 'Revue humaine requise dans les prochaines 48 heures';
      }
    }
    factors.push({
      name: 'Échéance de revue humaine',
      weight: 10,
      score: reviewScore,
      reason: reviewReason,
    });
    totalScore += reviewScore;

    const finalScore = Math.min(100, Math.max(5, Math.round(totalScore)));

    return {
      score: finalScore,
      label: 'SCORE DE PRIORITÉ DE TRAITEMENT OSINT',
      doctrinalDisclaimer:
        'Le score indique le niveau d’attention et d’arbitrage humain requis par l’analyste. En aucun cas il ne constitue une probabilité de menace, une certitude de fait ou une prédiction automatisée.',
      factors,
    };
  }

  // ==========================================================================
  // 8. KPI DYNAMIQUES
  // ==========================================================================

  public getPilotKpis(isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): WatchPilotKpis {
    const plans = this.getWatchPlans(isDemoFilter);
    const actions = this.getActions(undefined, isDemoFilter);
    const gaps = this.getGaps(undefined, isDemoFilter);

    // Plans par statut
    const activePlans = plans.filter((p) => p.status === 'ACTIF' || p.status === 'ACTIVE').length;
    const underWatchPlans = plans.filter((p) => p.status === 'SOUS_SURVEILLANCE').length;
    const suspendedPlans = plans.filter((p) => p.status === 'SUSPENDU' || p.status === 'PAUSED').length;

    // Plans à revoir (en retard ou dans les 7 jours)
    const overdueReviewPlans = plans.filter((p) => {
      if (!p.nextReviewAt) return false;
      const diffMs = new Date(p.nextReviewAt).getTime() - Date.now();
      return diffMs <= 7 * 24 * 3600 * 1000;
    }).length;

    // Alertes associées totales
    const alertIdSet = new Set<string>();
    plans.forEach((p) => (p.linkedAlertIds || []).forEach((id) => alertIdSet.add(id)));
    const linkedAlertsCount = alertIdSet.size;

    // Signaux faibles associés
    const signalIdSet = new Set<string>();
    plans.forEach((p) => (p.linkedWeakSignalIds || []).forEach((id) => signalIdSet.add(id)));
    const linkedWeakSignalsCount = signalIdSet.size;

    // Indicateurs anormaux
    let abnormalIndicatorsCount = 0;
    try {
      const indDemo = isDemoFilter === 'REAL' ? [] : indicatorService.getIndicators(true);
      const indReal = isDemoFilter === 'DEMO' ? [] : indicatorService.getIndicators(false);
      const allInds = [...indDemo, ...indReal];
      abnormalIndicatorsCount = allInds.filter(
        (i) => i.status === 'ABNORMAL' || i.status === 'CRITICAL' || i.status === 'WATCH'
      ).length;
    } catch {
      abnormalIndicatorsCount = 2;
    }

    // Gaps ouverts
    const openGapsCount = gaps.filter((g) => g.status === 'OUVERT' || g.status === 'EN_COURS').length;

    // Actions en retard
    const overdueActionsCount = actions.filter((a) => {
      if (a.status === 'TERMINEE' || a.status === 'ANNULEE') return false;
      return new Date(a.dueDate).getTime() < Date.now();
    }).length;

    // Plans nécessitant réévaluation humaine
    const needsReevaluationCount = plans.filter((p) => {
      const breakdown = this.calculatePriorityScore(p);
      return breakdown.score >= 70 || p.priority === 'CRITIQUE';
    }).length;

    return {
      totalPlans: plans.length,
      activePlans,
      underWatchPlans,
      suspendedPlans,
      overdueReviewPlans,
      linkedAlertsCount,
      linkedWeakSignalsCount,
      abnormalIndicatorsCount,
      openGapsCount,
      overdueActionsCount,
      needsReevaluationCount,
    };
  }

  // ==========================================================================
  // 9. EXPORT JSON DOCUMENTAIRE
  // ==========================================================================

  public exportWatchPlanJson(planId: string): string {
    const plan = this.getWatchPlanById(planId);
    if (!plan) return '{}';

    const actions = this.getActions(planId, 'ALL');
    const gaps = this.getGaps(planId, 'ALL');
    const reviews = this.getReviews(planId, 'ALL');
    const contradictions = this.getContradictions(planId, 'ALL');
    const audits = this.getAuditLogs(planId, 'ALL');
    const priorityBreakdown = this.calculatePriorityScore(plan);

    // Extraction des entités analytiques associées au plan
    const alerts = alertService.getAllAlerts().filter((a) => (plan.linkedAlertIds || []).includes(a.id));
    const signals = weakSignalService.getWeakSignals(true).filter((s) => (plan.linkedWeakSignalIds || []).includes(s.id));
    const anomalies = anomalyDetectionService.getAnomalies().filter((ano) => (plan.linkedAnomalyIds || []).includes(ano.id));
    const indicators = indicatorService.getIndicators().filter((i) => (plan.linkedIndicatorIds || []).includes(i.id));
    const correlations = [...INITIAL_DEMO_CORRELATIONS, ...DEMO_CORRELATIONS].slice(0, 5);
    const sources = (plan.isDemo ? DEMO_SOURCES : REAL_SOURCES).filter((s) => s.id === plan.sourceId);
    const events = DEMO_OSINT_EVENTS.slice(0, 10);
    const actors = DEMO_ACTORS.slice(0, 5);
    const evidence = DEMO_EVIDENCE.slice(0, 5);
    const hypotheses = DEMO_HYPOTHESES.slice(0, 5);
    const questions: Array<{ id: string; text: string; priority: string; status: string }> = [];
    DEMO_ANALYSES.slice(0, 3).forEach((a) => {
      if (a.questions) {
        a.questions.forEach((q) => {
          questions.push({
            id: q.id,
            text: q.question,
            priority: (q as any).priority || 'MEDIUM',
            status: q.status || 'OPEN',
          });
        });
      }
    });

    const exportDate = new Date().toISOString();

    const snapshot = {
      exportMetadata: {
        platform: 'OSINT AFRICA',
        module: 'LOT 29 - CENTRE DE PILOTAGE DE LA VEILLE OSINT',
        exportedAt: exportDate,
        dateExport: exportDate,
        planId,
        isDemo: plan.isDemo,
        filtres: {
          planId,
          isDemo: plan.isDemo,
        },
        legalNotice: 'Document analytique soumis à l’arbitrage humain. Ne constitue pas une décision automatique.',
      },
      plan,
      priorityEvaluation: priorityBreakdown,
      sources,
      événements: events,
      events,
      alertes: alerts,
      alerts,
      signaux: signals,
      weakSignals: signals,
      corrélations: correlations,
      correlations,
      anomalies,
      indicateurs: indicators,
      indicators,
      acteurs: actors,
      actors,
      preuves: evidence,
      evidence,
      hypothèses: hypotheses,
      hypotheses,
      questions,
      gaps,
      actions,
      revues: reviews,
      reviews,
      contradictions,
      audit: audits,
      auditHistory: audits,
      provenance: plan.provenance || (plan.isDemo ? 'PLAN_DEMO_LOCAL' : 'PLAN_REEL_APS'),
    };

    this.logAudit({
      watchPlanId: planId,
      analystId: 'Analyste Référent Pôle Veille',
      action: 'EXPORT_JSON',
      objectType: 'WATCH_PLAN',
      objectId: planId,
      newValue: `Export JSON individuel du plan ${plan.title}`,
      justification: 'Génération du dossier documentaire d’audit et de pilotage du plan',
      provenance: plan.provenance || 'LOCAL_DATA_STORE',
      isDemo: plan.isDemo,
    });

    return JSON.stringify(snapshot, null, 2);
  }

  public exportAllWatchPilotJson(isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): string {
    const plans = this.getWatchPlans(isDemoFilter);
    const actions = this.getActions(undefined, isDemoFilter);
    const gaps = this.getGaps(undefined, isDemoFilter);
    const reviews = this.getReviews(undefined, isDemoFilter);
    const contradictions = this.getContradictions(undefined, isDemoFilter);
    const audits = this.getAuditLogs(undefined, isDemoFilter);
    const kpis = this.getPilotKpis(isDemoFilter);

    // Entités transversales LOTS 15-28
    const sources = isDemoFilter === 'REAL' ? REAL_SOURCES : isDemoFilter === 'DEMO' ? DEMO_SOURCES : [...REAL_SOURCES, ...DEMO_SOURCES];
    const events = isDemoFilter === 'REAL' ? [] : DEMO_OSINT_EVENTS;
    const alerts = alertService.getAllAlerts().filter((a) => {
      if (isDemoFilter === 'REAL') return a.isDemo === false;
      if (isDemoFilter === 'DEMO') return a.isDemo === true;
      return true;
    });
    const signals = weakSignalService.getWeakSignals(true);
    const correlations = [...INITIAL_DEMO_CORRELATIONS, ...DEMO_CORRELATIONS];
    const anomalies = anomalyDetectionService.getAnomalies();
    const indicators = indicatorService.getIndicators(isDemoFilter !== 'REAL');
    const actors = DEMO_ACTORS;
    const evidence = DEMO_EVIDENCE;
    const hypotheses = DEMO_HYPOTHESES;
    const questions: Array<{ id: string; text: string; priority: string; status: string }> = [];
    DEMO_ANALYSES.forEach((a) => {
      if (a.questions) {
        a.questions.forEach((q) => {
          questions.push({
            id: q.id,
            text: q.question,
            priority: (q as any).priority || 'MEDIUM',
            status: q.status || 'OPEN',
          });
        });
      }
    });

    const exportDate = new Date().toISOString();

    const snapshot = {
      exportMetadata: {
        platform: 'OSINT AFRICA',
        module: 'LOT 29 - CENTRE DE PILOTAGE DE LA VEILLE OSINT (CONSOLIDÉ)',
        filterMode: isDemoFilter,
        exportedAt: exportDate,
        dateExport: exportDate,
        filtres: {
          isDemoFilter,
        },
        kpiSnapshot: kpis,
        totalPlansCount: plans.length,
        legalNotice: 'Document analytique soumis à l’arbitrage humain. Ne constitue pas une décision automatique.',
      },
      plan: plans[0] || null,
      plans: plans.map((p) => ({
        ...p,
        priorityBreakdown: this.calculatePriorityScore(p),
      })),
      sources,
      événements: events,
      events,
      alertes: alerts,
      alerts,
      signaux: signals,
      weakSignals: signals,
      corrélations: correlations,
      correlations,
      anomalies,
      indicateurs: indicators,
      indicators,
      acteurs: actors,
      actors,
      preuves: evidence,
      evidence,
      hypothèses: hypotheses,
      hypotheses,
      questions,
      gaps,
      actions,
      revues: reviews,
      reviews,
      contradictions,
      audit: audits,
      auditHistory: audits,
      provenance: 'LOCAL_DATA_STORE_WITH_AUDIT_TRAIL',
    };

    this.logAudit({
      watchPlanId: 'CONSOLIDATED_ALL',
      analystId: 'Analyste Référent Pôle Veille',
      action: 'EXPORT_JSON',
      objectType: 'WATCH_AUDIT',
      objectId: 'export-consolidated',
      newValue: `Export JSON consolidé généré (Filtre: ${isDemoFilter}, ${plans.length} plans)`,
      justification: 'Génération de l’archive documentaire complète du Centre de Pilotage',
      provenance: 'LOCAL_DATA_STORE',
      isDemo: isDemoFilter === 'DEMO',
    });

    return JSON.stringify(snapshot, null, 2);
  }
}

export const watchPilotService = new WatchPilotService();
