/**
 * OSINT AFRICA - LOT 25
 * Service Central de Gestion, Qualification et Arbitrage des Alertes
 *
 * Principes stricts :
 * 1. 100% Local (localStorage) sans backend, sans Firebase, sans IA opaque.
 * 2. Strict respect de la séparation Réel / Démo.
 * 3. AUCUNE conclusion automatique : l'analyste garde l'autorité finale.
 * 4. Traçabilité et audit immuable de chaque décision.
 */

import {
  OsintAlert,
  OsintAlertGroup,
  OsintAlertContradiction,
  OsintAlertAction,
  OsintAlertAudit,
  OsintAlertAssessment,
  OsintNormalizedItem,
  OsintAlertPriority,
  OsintAlertSeverity,
  OsintAlertStatus,
  OsintAlertConfidence,
  OsintAlertCategory,
} from '../types';
import { alertPrioritizationService } from './alertPrioritizationService';
import { alertConvergenceService } from './alertConvergenceService';
import { alertContradictionService } from './alertContradictionService';
import {
  INITIAL_DEMO_ALERTS,
  INITIAL_DEMO_GROUPS,
  INITIAL_DEMO_CONTRADICTIONS,
  INITIAL_DEMO_ACTIONS,
  INITIAL_DEMO_AUDITS,
} from '../data/alertDemoData';

const STORAGE_KEYS = {
  ALERTS: 'OSINT_ALERTS',
  GROUPS: 'OSINT_ALERT_GROUPS',
  ACTIONS: 'OSINT_ALERT_ACTIONS',
  AUDITS: 'OSINT_ALERT_AUDIT',
  CONTRADICTIONS: 'OSINT_ALERT_CONTRADICTIONS',
};

export interface AlertFilterOptions {
  priority?: OsintAlertPriority | 'ALL';
  severity?: OsintAlertSeverity | 'ALL';
  status?: OsintAlertStatus | 'ALL';
  category?: OsintAlertCategory | 'ALL' | string;
  country?: string;
  sourceId?: string;
  confidence?: OsintAlertConfidence | 'ALL';
  isDemo?: boolean | 'ALL';
  requiresReview?: boolean | 'ALL';
  search?: string;
  sortBy?: 'score_desc' | 'score_asc' | 'date_desc' | 'date_asc' | 'priority';
}

export interface AlertKPISummary {
  total: number;
  newAlerts: number;
  p1Count: number;
  p2Count: number;
  toQualifyCount: number;
  underSurveillanceCount: number;
  contradictionCount: number;
  duplicateCount: number;
  confirmedCount: number;
  dismissedCount: number;
  escalatedCount: number;
  resolvedCount: number;
}

export interface FullAlertKPIs {
  total: AlertKPISummary;
  real: AlertKPISummary;
  demo: AlertKPISummary;
}

export class AlertService {
  private alerts: OsintAlert[] = [];
  private groups: OsintAlertGroup[] = [];
  private actions: OsintAlertAction[] = [];
  private audits: OsintAlertAudit[] = [];
  private contradictions: OsintAlertContradiction[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Erreur notification listener AlertService:', err);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private loadFromStorage(): void {
    try {
      const rawAlerts = localStorage.getItem(STORAGE_KEYS.ALERTS);
      if (rawAlerts) {
        this.alerts = JSON.parse(rawAlerts);
      } else {
        this.alerts = [...INITIAL_DEMO_ALERTS];
        this.saveAlerts();
      }

      const rawGroups = localStorage.getItem(STORAGE_KEYS.GROUPS);
      if (rawGroups) {
        this.groups = JSON.parse(rawGroups);
      } else {
        this.groups = [...INITIAL_DEMO_GROUPS];
        this.saveGroups();
      }

      const rawActions = localStorage.getItem(STORAGE_KEYS.ACTIONS);
      if (rawActions) {
        this.actions = JSON.parse(rawActions);
      } else {
        this.actions = [...INITIAL_DEMO_ACTIONS];
        this.saveActions();
      }

      const rawAudits = localStorage.getItem(STORAGE_KEYS.AUDITS);
      if (rawAudits) {
        this.audits = JSON.parse(rawAudits);
      } else {
        this.audits = [...INITIAL_DEMO_AUDITS];
        this.saveAudits();
      }

      const rawContradictions = localStorage.getItem(STORAGE_KEYS.CONTRADICTIONS);
      if (rawContradictions) {
        this.contradictions = JSON.parse(rawContradictions);
      } else {
        this.contradictions = [...INITIAL_DEMO_CONTRADICTIONS];
        this.saveContradictions();
      }
    } catch (e) {
      console.warn('Erreur lecture localStorage AlertService, repli sur données démo :', e);
      this.alerts = [...INITIAL_DEMO_ALERTS];
      this.groups = [...INITIAL_DEMO_GROUPS];
      this.actions = [...INITIAL_DEMO_ACTIONS];
      this.audits = [...INITIAL_DEMO_AUDITS];
      this.contradictions = [...INITIAL_DEMO_CONTRADICTIONS];
    }
  }

  public saveAlerts(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(this.alerts));
    } catch (e) {
      console.error('Erreur sauvegarde alertes :', e);
    }
  }

  public saveGroups(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(this.groups));
    } catch (e) {
      console.error('Erreur sauvegarde groupes alertes :', e);
    }
  }

  public saveActions(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(this.actions));
    } catch (e) {
      console.error('Erreur sauvegarde actions alertes :', e);
    }
  }

  public saveAudits(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDITS, JSON.stringify(this.audits));
    } catch (e) {
      console.error('Erreur sauvegarde audits alertes :', e);
    }
  }

  public saveContradictions(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTRADICTIONS, JSON.stringify(this.contradictions));
    } catch (e) {
      console.error('Erreur sauvegarde contradictions :', e);
    }
  }

  // ==========================================
  // INGESTION & PIPELINE LOT 24 -> LOT 25
  // ==========================================

  /**
   * Reçoit les nouveaux items normalisés (ex: APS réel ou simulation)
   * et génère les alertes candidates dans la file de qualification
   */
  public processNewNormalizedItems(items: OsintNormalizedItem[]): OsintAlert[] {
    const createdAlerts: OsintAlert[] = [];

    for (const item of items) {
      // Vérifier si une alerte existe déjà pour cet item ou son hash
      const existing = this.alerts.find(
        (a) => a.rawItemId === item.rawItemId || a.normalizedItemId === item.id || (a.contentHash && a.contentHash === item.contentHash)
      );

      if (existing) {
        // Mettre à jour le compteur de détection
        existing.lastSeenAt = item.publishedAt || new Date().toISOString();
        if (item.duplicateStatus === 'CONFIRMED_DUPLICATE' || item.duplicateStatus === 'PROBABLE_DUPLICATE') {
          existing.duplicateCount = (existing.duplicateCount || 0) + 1;
        }
        continue;
      }

      const isDuplicate = item.duplicateStatus === 'CONFIRMED_DUPLICATE' || item.duplicateStatus === 'PROBABLE_DUPLICATE';

      // Calcul du score transparent de priorisation
      const prioResult = alertPrioritizationService.calculatePriorityScore({
        title: item.title,
        content: item.summary,
        category: item.category,
        country: item.country,
        sourceId: item.sourceId,
        publishedAt: item.publishedAt,
        detectedAt: item.publishedAt || new Date().toISOString(),
        isDuplicate,
        duplicateCount: isDuplicate ? 1 : 0,
        sourceCount: 1,
        independenceLevel: 'UNKNOWN',
        isOfficialSource: item.sourceId === 'src-real-001' || item.sourceId === 'src-aps-001',
        isGovernedSource: true,
        rawItemAvailable: !!item.rawItemId,
        hasSha256: !!item.contentHash,
      });

      const alertId = `alt-${item.isDemo ? 'demo' : 'real'}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const newAlert: OsintAlert = {
        id: alertId,
        sourceId: item.sourceId,
        connectorId: item.connectorId,
        watchPlanId: undefined,
        executionId: undefined,
        rawItemId: item.rawItemId,
        normalizedItemId: item.id,
        title: item.title,
        summary: item.summary || item.title,
        detectedAt: item.publishedAt || new Date().toISOString(),
        firstSeenAt: item.publishedAt || new Date().toISOString(),
        lastSeenAt: item.publishedAt || new Date().toISOString(),
        category: (item.category as any) || 'OTHER',
        secondaryTags: item.subcategory ? [item.subcategory] : [],
        priority: prioResult.priority,
        severity: prioResult.severity,
        status: isDuplicate ? 'DUPLICATE' : 'NEW',
        confidence: prioResult.confidence,
        isDemo: item.isDemo,
        isHumanValidated: false,
        requiresHumanReview: !isDuplicate,
        priorityScore: prioResult.score,
        priorityFactors: prioResult.factors,
        reasons: prioResult.reasons,
        duplicateCount: isDuplicate ? 1 : 0,
        relatedItemIds: item.rawItemId ? [item.rawItemId] : [],
        relatedEventIds: item.generatedEventId ? [item.generatedEventId] : [],
        relatedActorIds: [],
        relatedCaseIds: [],
        evidenceCount: 1,
        sourceCount: 1,
        independenceLevel: 'UNKNOWN',
        contradictionLevel: 'NONE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: item.isDemo ? 'Veille Simulation Sandbox' : 'Veille Continue Réelle (APS)',
        sourceName: item.sourceId === 'src-real-001' ? 'Agence de Presse Sénégalaise (APS)' : 'Source OSINT',
        sourceUrl: item.canonicalUrl,
        originalUrl: item.canonicalUrl,
        contentHash: item.contentHash,
        hashAlgorithm: item.hashAlgorithm || 'SHA-256',
        rawContentExcerpt: item.summary?.slice(0, 300),
        language: item.language || 'Français',
        country: item.country,
        countryId: item.countryId,
        countryName: item.country,
      };

      this.alerts.unshift(newAlert);
      createdAlerts.push(newAlert);

      // Création de l'action initiale
      const initialAction: OsintAlertAction = {
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        alertId: newAlert.id,
        action: 'CREATED',
        actor: item.isDemo ? 'Scheduler Sandbox' : 'Moteur de Veille Réel (APS)',
        timestamp: new Date().toISOString(),
        previousStatus: 'NONE',
        newStatus: newAlert.status as string,
        note: `Signal détecté (${prioResult.priority}, score: ${prioResult.score}/100, récence: < 2h). En attente d'arbitrage analyste.`,
        isDemo: newAlert.isDemo,
      };
      this.actions.unshift(initialAction);

      // Audit d'ingestion
      const auditEntry: OsintAlertAudit = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        alertId: newAlert.id,
        action: 'SIGNAL_INGESTION',
        actor: 'Veille Continue Contrôlée',
        timestamp: new Date().toISOString(),
        reason: `Nouvel item ingéré via connector ${item.connectorId}.`,
        newState: {
          priority: newAlert.priority,
          score: newAlert.priorityScore,
          status: newAlert.status,
          contentHash: newAlert.contentHash,
        },
        sourceIds: item.sourceId ? [item.sourceId] : [],
        evidenceIds: item.rawItemId ? [item.rawItemId] : [],
        isDemo: newAlert.isDemo,
      };
      this.audits.unshift(auditEntry);
    }

    if (createdAlerts.length > 0) {
      // Mise à jour des groupes de convergence
      this.groups = alertConvergenceService.clusterAlertsIntoGroups(this.alerts, this.groups);

      // Recherche de contradictions potentielles avec les alertes récentes
      for (const newAlert of createdAlerts) {
        for (const existing of this.alerts.slice(0, 15)) {
          if (existing.id !== newAlert.id && existing.countryId === newAlert.countryId) {
            const detectedContradictions = alertContradictionService.detectContradictions(newAlert, existing);
            if (detectedContradictions.length > 0) {
              this.contradictions.unshift(...detectedContradictions);
              newAlert.contradictionLevel = 'MEDIUM';
              newAlert.contradictions = detectedContradictions;
            }
          }
        }
      }

      this.saveAlerts();
      this.saveGroups();
      this.saveActions();
      this.saveAudits();
      this.saveContradictions();
      this.notify();
    }

    return createdAlerts;
  }

  // ==========================================
  // ACTIONS DE QUALIFICATION HUMAINE
  // ==========================================

  /**
   * Triage d'une alerte
   */
  public triageAlert(alertId: string, analystName: string = 'Analyste OSINT'): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;

    const prevStatus = alert.status;
    alert.status = 'TRIAGED';
    alert.updatedAt = new Date().toISOString();

    this.recordAction(alert.id, 'TRIAGED', analystName, prevStatus as string, 'TRIAGED', 'Alerte triée et assignée pour revue détaillée.', alert.isDemo);
    this.recordAudit(alert.id, 'TRIAGE_STATUS_UPDATE', analystName, 'Prise en compte dans la file de triage.', { status: prevStatus }, { status: 'TRIAGED' }, alert.isDemo);

    this.saveAlerts();
    this.notify();
    return true;
  }

  /**
   * Début de revue détaillée
   */
  public startReview(alertId: string, analystName: string = 'Analyste OSINT'): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;

    const prevStatus = alert.status;
    alert.status = 'UNDER_REVIEW';
    alert.assignedTo = analystName;
    alert.updatedAt = new Date().toISOString();

    this.recordAction(alert.id, 'REVIEWED', analystName, prevStatus as string, 'UNDER_REVIEW', 'Revue d’analyse engagée.', alert.isDemo);
    this.recordAudit(alert.id, 'REVIEW_START', analystName, 'Examen approfondi des sources.', { status: prevStatus }, { status: 'UNDER_REVIEW' }, alert.isDemo);

    this.saveAlerts();
    this.notify();
    return true;
  }

  /**
   * Arbitrage humain formel (Confirmation, Infirmation, Mise sous surveillance, etc.)
   */
  public assessAlert(alertId: string, assessment: OsintAlertAssessment): { success: boolean; message: string } {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) {
      return { success: false, message: 'Alerte introuvable' };
    }

    if (!assessment.analystNote || !assessment.justification) {
      return { success: false, message: 'La note d’analyse et la justification sont strictement obligatoires.' };
    }

    const prevStatus = alert.status;
    const now = new Date().toISOString();

    alert.assessment = {
      ...assessment,
      assessedAt: now,
    };
    alert.analystNote = assessment.analystNote;
    alert.updatedAt = now;

    switch (assessment.decision) {
      case 'CONFIRMED':
        if (!assessment.confirmationBasis) {
          return { success: false, message: 'La base de confirmation factuelle est obligatoire pour confirmer une alerte.' };
        }
        alert.status = 'CONFIRMED';
        alert.isHumanValidated = true;
        alert.requiresHumanReview = false;
        alert.confidence = assessment.confidenceAssigned || 'HIGH';
        alert.resolvedAt = now;
        alert.resolvedBy = assessment.assessedBy;
        this.recordAction(alert.id, 'CONFIRMED', assessment.assessedBy, prevStatus as string, 'CONFIRMED', assessment.justification, alert.isDemo);
        this.recordAudit(alert.id, 'HUMAN_CONFIRMATION', assessment.assessedBy, `Confirmé sur base: ${assessment.confirmationBasis}`, { status: prevStatus }, { status: 'CONFIRMED', confidence: alert.confidence }, alert.isDemo);
        break;

      case 'DISMISSED':
        if (!assessment.dismissalReason) {
          return { success: false, message: 'Le motif d’infirmation est obligatoire pour écarter un signal.' };
        }
        alert.status = 'DISMISSED';
        alert.isHumanValidated = true;
        alert.requiresHumanReview = false;
        alert.confidence = 'VERY_LOW';
        alert.resolvedAt = now;
        alert.resolvedBy = assessment.assessedBy;
        this.recordAction(alert.id, 'DISMISSED', assessment.assessedBy, prevStatus as string, 'DISMISSED', `Infirmé : ${assessment.dismissalReason}`, alert.isDemo);
        this.recordAudit(alert.id, 'HUMAN_DISMISSAL', assessment.assessedBy, assessment.dismissalReason, { status: prevStatus }, { status: 'DISMISSED' }, alert.isDemo);
        break;

      case 'UNDER_SURVEILLANCE':
        alert.status = 'UNDER_REVIEW';
        alert.requiresHumanReview = true;
        this.recordAction(alert.id, 'REVIEWED', assessment.assessedBy, prevStatus as string, 'UNDER_REVIEW', `Maintien sous surveillance : ${assessment.justification}`, alert.isDemo);
        this.recordAudit(alert.id, 'MAINTAIN_SURVEILLANCE', assessment.assessedBy, assessment.justification, { status: prevStatus }, { status: 'UNDER_REVIEW' }, alert.isDemo);
        break;

      case 'DUPLICATE':
        alert.status = 'DUPLICATE';
        alert.isHumanValidated = true;
        alert.requiresHumanReview = false;
        this.recordAction(alert.id, 'DUPLICATE', assessment.assessedBy, prevStatus as string, 'DUPLICATE', assessment.justification, alert.isDemo);
        this.recordAudit(alert.id, 'HUMAN_DUPLICATE_FLAG', assessment.assessedBy, assessment.justification, { status: prevStatus }, { status: 'DUPLICATE' }, alert.isDemo);
        break;

      case 'CONTRADICTED':
        alert.status = 'CONTRADICTED';
        alert.contradictionLevel = 'HIGH';
        alert.requiresHumanReview = true;
        this.recordAction(alert.id, 'CONTRADICTED', assessment.assessedBy, prevStatus as string, 'CONTRADICTED', assessment.justification, alert.isDemo);
        this.recordAudit(alert.id, 'HUMAN_CONTRADICTION_FLAG', assessment.assessedBy, assessment.justification, { status: prevStatus }, { status: 'CONTRADICTED', contradictionLevel: 'HIGH' }, alert.isDemo);
        break;

      case 'ESCALATED':
        if (!assessment.escalationReason) {
          return { success: false, message: 'Le motif d’escalade prioritaire est obligatoire.' };
        }
        alert.status = 'ESCALATED';
        alert.priority = 'P1_CRITICAL';
        alert.requiresHumanReview = true;
        this.recordAction(alert.id, 'ESCALATED', assessment.assessedBy, prevStatus as string, 'ESCALATED', `Escalade P1 : ${assessment.escalationReason}`, alert.isDemo);
        this.recordAudit(alert.id, 'HUMAN_ESCALATION', assessment.assessedBy, assessment.escalationReason, { status: prevStatus, priority: alert.priority }, { status: 'ESCALATED', priority: 'P1_CRITICAL' }, alert.isDemo);
        break;
    }

    this.saveAlerts();
    this.notify();
    return { success: true, message: 'Arbitrage analyste enregistré avec succès.' };
  }

  /**
   * Marquer comme doublon d'une autre alerte
   */
  public markAsDuplicate(alertId: string, duplicateOfId: string, analystName: string = 'Analyste OSINT', note: string = ''): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;

    const prevStatus = alert.status;
    alert.status = 'DUPLICATE';
    alert.duplicateOfAlertId = duplicateOfId;
    alert.isHumanValidated = true;
    alert.requiresHumanReview = false;
    alert.updatedAt = new Date().toISOString();

    this.recordAction(alert.id, 'DUPLICATE', analystName, prevStatus as string, 'DUPLICATE', `Rattaché comme doublon de l'alerte ${duplicateOfId}. Note : ${note}`, alert.isDemo);
    this.recordAudit(alert.id, 'LINK_DUPLICATE', analystName, `Rattachement à ${duplicateOfId}`, { status: prevStatus }, { status: 'DUPLICATE', duplicateOfAlertId: duplicateOfId }, alert.isDemo);

    this.saveAlerts();
    this.notify();
    return true;
  }

  /**
   * Résolution d'une alerte
   */
  public resolveAlert(alertId: string, analystName: string = 'Analyste OSINT', note: string = ''): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;

    const prevStatus = alert.status;
    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = analystName;
    alert.requiresHumanReview = false;
    alert.updatedAt = new Date().toISOString();

    this.recordAction(alert.id, 'RESOLVED', analystName, prevStatus as string, 'RESOLVED', note || 'Alerte clôturée après traitement complet.', alert.isDemo);
    this.recordAudit(alert.id, 'ALERT_RESOLVED', analystName, note || 'Clôture opérationnelle', { status: prevStatus }, { status: 'RESOLVED' }, alert.isDemo);

    this.saveAlerts();
    this.notify();
    return true;
  }

  /**
   * Archivage
   */
  public archiveAlert(alertId: string, analystName: string = 'Analyste OSINT', note: string = ''): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;

    const prevStatus = alert.status;
    alert.status = 'ARCHIVED';
    alert.updatedAt = new Date().toISOString();

    this.recordAction(alert.id, 'ARCHIVED', analystName, prevStatus as string, 'ARCHIVED', note || 'Alerte versée aux archives.', alert.isDemo);
    this.recordAudit(alert.id, 'ALERT_ARCHIVED', analystName, note || 'Archivage', { status: prevStatus }, { status: 'ARCHIVED' }, alert.isDemo);

    this.saveAlerts();
    this.notify();
    return true;
  }

  // ==========================================
  // AUDIT & ACTIONS LOGGING
  // ==========================================

  private recordAction(
    alertId: string,
    action: OsintAlertAction['action'],
    actor: string,
    previousStatus: string,
    newStatus: string,
    note?: string,
    isDemo: boolean = true
  ) {
    const act: OsintAlertAction = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      alertId,
      action,
      actor,
      timestamp: new Date().toISOString(),
      previousStatus,
      newStatus,
      note,
      isDemo,
    };
    this.actions.unshift(act);
    this.saveActions();
  }

  private recordAudit(
    alertId: string,
    action: string,
    actor: string,
    reason: string,
    previousState?: Record<string, any>,
    newState?: Record<string, any>,
    isDemo: boolean = true
  ) {
    const aud: OsintAlertAudit = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      alertId,
      action,
      actor,
      timestamp: new Date().toISOString(),
      reason,
      previousState,
      newState,
      isDemo,
    };
    this.audits.unshift(aud);
    this.saveAudits();
  }

  // ==========================================
  // CONSULTATION & FILTRES
  // ==========================================

  public getAllAlerts(): OsintAlert[] {
    return [...this.alerts];
  }

  public getAlertById(id: string): OsintAlert | undefined {
    return this.alerts.find((a) => a.id === id);
  }

  public getFilteredAlerts(options: AlertFilterOptions = {}): OsintAlert[] {
    let result = [...this.alerts];

    if (options.isDemo !== undefined && options.isDemo !== 'ALL') {
      result = result.filter((a) => a.isDemo === options.isDemo);
    }

    if (options.priority && options.priority !== 'ALL') {
      result = result.filter((a) => a.priority === options.priority);
    }

    if (options.severity && options.severity !== 'ALL') {
      result = result.filter((a) => a.severity === options.severity);
    }

    if (options.status && options.status !== 'ALL') {
      result = result.filter((a) => a.status === options.status);
    }

    if (options.category && options.category !== 'ALL') {
      result = result.filter((a) => a.category === options.category);
    }

    if (options.confidence && options.confidence !== 'ALL') {
      result = result.filter((a) => a.confidence === options.confidence);
    }

    if (options.country && options.country !== 'ALL') {
      result = result.filter((a) => a.countryId === options.country || a.country === options.country);
    }

    if (options.sourceId && options.sourceId !== 'ALL') {
      result = result.filter((a) => a.sourceId === options.sourceId);
    }

    if (options.requiresReview !== undefined && options.requiresReview !== 'ALL') {
      result = result.filter((a) => a.requiresHumanReview === options.requiresReview);
    }

    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.summary && a.summary.toLowerCase().includes(q)) ||
          a.id.toLowerCase().includes(q) ||
          (a.sourceName && a.sourceName.toLowerCase().includes(q)) ||
          (a.country && a.country.toLowerCase().includes(q)) ||
          (a.contentHash && a.contentHash.toLowerCase().includes(q))
      );
    }

    // Tri
    const sortBy = options.sortBy || 'date_desc';
    result.sort((a, b) => {
      if (sortBy === 'score_desc') {
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      }
      if (sortBy === 'score_asc') {
        return (a.priorityScore || 0) - (b.priorityScore || 0);
      }
      if (sortBy === 'priority') {
        const order: Record<OsintAlertPriority, number> = {
          P1_CRITICAL: 5,
          P2_HIGH: 4,
          P3_MEDIUM: 3,
          P4_LOW: 2,
          P5_INFO: 1,
        };
        const prioA = order[a.priority as OsintAlertPriority] || 0;
        const prioB = order[b.priority as OsintAlertPriority] || 0;
        return prioB - prioA;
      }
      if (sortBy === 'date_asc') {
        return new Date(a.detectedAt || a.createdAt || 0).getTime() - new Date(b.detectedAt || b.createdAt || 0).getTime();
      }
      // date_desc par défaut
      return new Date(b.detectedAt || b.createdAt || 0).getTime() - new Date(a.detectedAt || a.createdAt || 0).getTime();
    });

    return result;
  }

  /**
   * File d'attente analyste : Alertes "À QUALIFIER"
   */
  public getAnalystQueueAlerts(): OsintAlert[] {
    return this.alerts
      .filter((a) => a.requiresHumanReview || a.status === 'NEW' || a.status === 'TRIAGED' || a.status === 'UNDER_REVIEW' || a.status === 'CONTRADICTED' || a.status === 'ESCALATED')
      .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
  }

  /**
   * Compteur d'alertes P1 / P2 non traitées (pour badge TopAppBar)
   */
  public getPendingUrgentAlertsCount(): number {
    return this.alerts.filter(
      (a) =>
        (a.priority === 'P1_CRITICAL' || a.priority === 'P2_HIGH') &&
        (a.status === 'NEW' || a.status === 'TRIAGED' || a.status === 'UNDER_REVIEW' || a.status === 'ESCALATED') &&
        !a.isHumanValidated
    ).length;
  }

  /**
   * Calcul des KPIs avec séparation stricte Réel / Démo / Total
   */
  public getKPIs(): FullAlertKPIs {
    const computeSummary = (list: OsintAlert[]): AlertKPISummary => {
      return {
        total: list.length,
        newAlerts: list.filter((a) => a.status === 'NEW').length,
        p1Count: list.filter((a) => a.priority === 'P1_CRITICAL').length,
        p2Count: list.filter((a) => a.priority === 'P2_HIGH').length,
        toQualifyCount: list.filter((a) => a.requiresHumanReview || a.status === 'NEW' || a.status === 'TRIAGED' || a.status === 'UNDER_REVIEW').length,
        underSurveillanceCount: list.filter((a) => a.status === 'UNDER_REVIEW').length,
        contradictionCount: list.filter((a) => a.status === 'CONTRADICTED' || (a.contradictionLevel && a.contradictionLevel !== 'NONE')).length,
        duplicateCount: list.filter((a) => a.status === 'DUPLICATE').length,
        confirmedCount: list.filter((a) => a.status === 'CONFIRMED').length,
        dismissedCount: list.filter((a) => a.status === 'DISMISSED').length,
        escalatedCount: list.filter((a) => a.status === 'ESCALATED').length,
        resolvedCount: list.filter((a) => a.status === 'RESOLVED').length,
      };
    };

    const realList = this.alerts.filter((a) => !a.isDemo);
    const demoList = this.alerts.filter((a) => a.isDemo);

    return {
      total: computeSummary(this.alerts),
      real: computeSummary(realList),
      demo: computeSummary(demoList),
    };
  }

  public getGroups(): OsintAlertGroup[] {
    return [...this.groups];
  }

  public getContradictions(): OsintAlertContradiction[] {
    return [...this.contradictions];
  }

  public getActions(): OsintAlertAction[] {
    return [...this.actions];
  }

  public getAudits(): OsintAlertAudit[] {
    return [...this.audits];
  }

  /**
   * Export JSON local et structuré
   */
  public exportAlertsAsJson(includeDemo: boolean = true): string {
    const dataset = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: 'OSINT AFRICA - Centre de Qualification et Gestion des Alertes',
        lot: 'LOT 25',
        totalAlerts: includeDemo ? this.alerts.length : this.alerts.filter((a) => !a.isDemo).length,
        kpis: this.getKPIs(),
      },
      alerts: includeDemo ? this.alerts : this.alerts.filter((a) => !a.isDemo),
      groups: includeDemo ? this.groups : this.groups.filter((g) => !g.isDemo),
      contradictions: includeDemo ? this.contradictions : this.contradictions.filter((c) => !c.isDemo),
      actions: includeDemo ? this.actions : this.actions.filter((ac) => !ac.isDemo),
      auditTrail: includeDemo ? this.audits : this.audits.filter((au) => !au.isDemo),
    };

    return JSON.stringify(dataset, null, 2);
  }
}

export const alertService = new AlertService();
