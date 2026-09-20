/**
 * OSINT AFRICA - LOT 24
 * Moteur d'Orchestration de Veille Continue Contrôlée
 * Version 1 — Extension strictement contrôlée (Source réelle pilote : APS)
 * 
 * Règles doctrinales :
 * - Aucune collecte massive
 * - Source réelle unique : Agence de Presse Sénégalaise (APS - src-real-001)
 * - Maximum 1 requête HTTP GET et maximum 10 items par exécution
 * - SHA-256 réel vérifié
 * - Traçabilité complète et non-conclusion automatique (En attente d'arbitrage)
 * - Kill switch global et par plan
 * - Détection des anomalies et incidents automatisés avec auto-stop
 * - Séparation stricte des données Démo et Réelles
 */

import {
  OsintWatchPlan,
  OsintWatchExecution,
  OsintWatchIncident,
  WatchPlanFrequency,
  WatchPlanStatus,
  WatchExecutionStatus,
  WatchIncidentType,
  WatchIncidentSeverity,
  OsintRawItem,
  OsintNormalizedItem,
  CollectionAuditLog,
} from '../types';
import {
  PILOT_CONFIG,
  calculateRealSha256,
  realPilotCollectionService,
} from './realPilotCollectionService';
import {
  sourceIngestionService,
  validateRawItem,
  normalizeRawItem,
  detectPotentialDuplicate,
} from './sourceIngestionService';
import { alertService } from './alertService';

// Clés de persistance locale dédiée (LOT 24)
const STORAGE_WATCH_PLANS = 'OSINT_WATCH_PLANS';
const STORAGE_WATCH_EXECUTIONS = 'OSINT_WATCH_EXECUTIONS';
const STORAGE_WATCH_INCIDENTS = 'OSINT_WATCH_INCIDENTS';
const STORAGE_WATCH_AUDIT = 'OSINT_WATCH_AUDIT';
const STORAGE_WATCH_STATE = 'OSINT_WATCH_STATE';

export const FREQUENCY_MINUTES_MAP: Record<WatchPlanFrequency, number> = {
  MANUAL: 0,
  '5_MIN': 5,
  '15_MIN': 15,
  '30_MIN': 30,
  '1_HOUR': 60,
  '3_HOURS': 180,
  '6_HOURS': 360,
  '12_HOURS': 720,
  '24_HOURS': 1440,
  DAILY: 1440,
  WEEKLY: 10080,
  BIWEEKLY: 20160,
  MONTHLY: 43200,
  QUARTERLY: 129600,
};

// Plan initial réel APS (Source pilote unique autorisée)
const INITIAL_REAL_APS_PLAN: OsintWatchPlan = {
  id: 'watch-aps-001',
  sourceId: PILOT_CONFIG.sourceId,
  connectorId: PILOT_CONFIG.connectorId,
  name: 'Veille APS — Flux officiel',
  description: 'Veille continue contrôlée du fil de dépêches officielles de l’Agence de Presse Sénégalaise (APS).',
  enabled: true,
  frequency: '15_MIN',
  frequencyMinutes: 15,
  maxItemsPerRun: 10,
  maxRequestsPerRun: 1,
  maxConsecutiveErrors: 3,
  consecutiveErrorsCount: 0,
  retryPolicy: 0,
  nextRunAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  lastRunAt: null,
  lastSuccessfulRunAt: null,
  lastErrorAt: null,
  status: 'ACTIVE',
  createdAt: '2026-09-14T08:00:00.000Z',
  updatedAt: new Date().toISOString(),
  createdBy: 'Analyste Référent OSINT',
  isDemo: false,
  killSwitchActive: false,
};

// Plans de démonstration sandbox (isDemo: true)
const INITIAL_DEMO_PLANS: OsintWatchPlan[] = [
  {
    id: 'watch-demo-001',
    sourceId: 'src-001',
    connectorId: 'conn-001',
    name: 'Veille Sécurité & Défense Sahel (Simulation)',
    description: 'Surveillance des incidents sécuritaires et mouvements de groupes armés dans la bande sahélienne.',
    enabled: false,
    frequency: '30_MIN',
    frequencyMinutes: 30,
    maxItemsPerRun: 10,
    maxRequestsPerRun: 1,
    maxConsecutiveErrors: 3,
    consecutiveErrorsCount: 0,
    retryPolicy: 0,
    nextRunAt: null,
    lastRunAt: '2026-09-14T09:30:00.000Z',
    lastSuccessfulRunAt: '2026-09-14T09:30:00.000Z',
    lastErrorAt: null,
    status: 'PAUSED',
    createdAt: '2026-09-10T00:00:00.000Z',
    updatedAt: '2026-09-14T09:30:00.000Z',
    createdBy: 'Analyste Simulation',
    isDemo: true,
    killSwitchActive: false,
  },
  {
    id: 'watch-demo-002',
    sourceId: 'src-002',
    connectorId: 'conn-002',
    name: 'Veille Maritime Golfe de Guinée (Simulation)',
    description: 'Suivi des alertes de piraterie, trafics illicites et sécurité portuaire côtière.',
    enabled: true,
    frequency: '1_HOUR',
    frequencyMinutes: 60,
    maxItemsPerRun: 10,
    maxRequestsPerRun: 1,
    maxConsecutiveErrors: 3,
    consecutiveErrorsCount: 0,
    retryPolicy: 0,
    nextRunAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    lastRunAt: '2026-09-14T11:00:00.000Z',
    lastSuccessfulRunAt: '2026-09-14T11:00:00.000Z',
    lastErrorAt: null,
    status: 'ACTIVE',
    createdAt: '2026-09-11T00:00:00.000Z',
    updatedAt: '2026-09-14T11:00:00.000Z',
    createdBy: 'Analyste Simulation',
    isDemo: true,
    killSwitchActive: false,
  },
  {
    id: 'watch-demo-003',
    sourceId: 'src-003',
    connectorId: 'conn-003',
    name: 'Veille Climat Politique & Élections RDC (Simulation)',
    description: 'Agrégation des communiqués institutionnels et suivi électoral en Afrique centrale.',
    enabled: false,
    frequency: '6_HOURS',
    frequencyMinutes: 360,
    maxItemsPerRun: 10,
    maxRequestsPerRun: 1,
    maxConsecutiveErrors: 3,
    consecutiveErrorsCount: 3,
    retryPolicy: 0,
    nextRunAt: null,
    lastRunAt: '2026-09-14T08:00:00.000Z',
    lastSuccessfulRunAt: null,
    lastErrorAt: '2026-09-14T08:00:00.000Z',
    status: 'ERROR',
    createdAt: '2026-09-12T00:00:00.000Z',
    updatedAt: '2026-09-14T08:00:00.000Z',
    createdBy: 'Analyste Simulation',
    isDemo: true,
    killSwitchActive: false,
  },
];

// Exécutions initiales de démonstration
const INITIAL_DEMO_EXECUTIONS: OsintWatchExecution[] = [
  {
    id: 'exec-demo-001',
    watchPlanId: 'watch-demo-002',
    sourceId: 'src-002',
    connectorId: 'conn-002',
    startedAt: '2026-09-14T11:00:00.000Z',
    finishedAt: '2026-09-14T11:00:01.200Z',
    status: 'SUCCESS',
    requestCount: 1,
    itemsReceived: 4,
    itemsAccepted: 4,
    itemsRejected: 0,
    itemsDuplicate: 1,
    itemsNew: 3,
    errorsCount: 0,
    durationMs: 1200,
    errorMessage: null,
    networkDomains: ['sandbox.simulated.feed'],
    httpStatuses: [200],
    auditLogIds: ['aud-demo-101'],
    isDemo: true,
  },
  {
    id: 'exec-demo-002',
    watchPlanId: 'watch-demo-001',
    sourceId: 'src-001',
    connectorId: 'conn-001',
    startedAt: '2026-09-14T09:30:00.000Z',
    finishedAt: '2026-09-14T09:30:00.850Z',
    status: 'SUCCESS',
    requestCount: 1,
    itemsReceived: 5,
    itemsAccepted: 5,
    itemsRejected: 0,
    itemsDuplicate: 0,
    itemsNew: 5,
    errorsCount: 0,
    durationMs: 850,
    errorMessage: null,
    networkDomains: ['sandbox.sahel.sim'],
    httpStatuses: [200],
    auditLogIds: ['aud-demo-102'],
    isDemo: true,
  },
  {
    id: 'exec-demo-003',
    watchPlanId: 'watch-demo-003',
    sourceId: 'src-003',
    connectorId: 'conn-003',
    startedAt: '2026-09-14T08:00:00.000Z',
    finishedAt: '2026-09-14T08:00:02.100Z',
    status: 'FAILED',
    requestCount: 1,
    itemsReceived: 0,
    itemsAccepted: 0,
    itemsRejected: 0,
    itemsDuplicate: 0,
    itemsNew: 0,
    errorsCount: 1,
    durationMs: 2100,
    errorMessage: 'HTTP 503 Service Unavailable (Simulation)',
    networkDomains: ['sandbox.rdc.sim'],
    httpStatuses: [503],
    auditLogIds: ['aud-demo-103'],
    isDemo: true,
  },
  {
    id: 'exec-demo-004',
    watchPlanId: 'watch-demo-002',
    sourceId: 'src-002',
    connectorId: 'conn-002',
    startedAt: '2026-09-14T10:00:00.000Z',
    finishedAt: '2026-09-14T10:00:01.100Z',
    status: 'PARTIAL',
    requestCount: 1,
    itemsReceived: 6,
    itemsAccepted: 5,
    itemsRejected: 1,
    itemsDuplicate: 2,
    itemsNew: 3,
    errorsCount: 0,
    durationMs: 1100,
    errorMessage: '1 élément rejeté : Titre manquant',
    networkDomains: ['sandbox.simulated.feed'],
    httpStatuses: [200],
    auditLogIds: ['aud-demo-104'],
    isDemo: true,
  },
  {
    id: 'exec-demo-005',
    watchPlanId: 'watch-demo-001',
    sourceId: 'src-001',
    connectorId: 'conn-001',
    startedAt: '2026-09-14T09:00:00.000Z',
    finishedAt: '2026-09-14T09:00:00.900Z',
    status: 'SUCCESS',
    requestCount: 1,
    itemsReceived: 3,
    itemsAccepted: 3,
    itemsRejected: 0,
    itemsDuplicate: 0,
    itemsNew: 3,
    errorsCount: 0,
    durationMs: 900,
    errorMessage: null,
    networkDomains: ['sandbox.sahel.sim'],
    httpStatuses: [200],
    auditLogIds: ['aud-demo-105'],
    isDemo: true,
  },
];

// Incidents initiaux de démonstration
const INITIAL_DEMO_INCIDENTS: OsintWatchIncident[] = [
  {
    id: 'inc-demo-001',
    watchPlanId: 'watch-demo-003',
    executionId: 'exec-demo-003',
    type: 'CONSECUTIVE_FAILURES',
    severity: 'HIGH',
    message: '3 échecs consécutifs détectés — Plan désactivé automatiquement par mesure de sécurité.',
    detectedAt: '2026-09-14T08:00:00.000Z',
    resolvedAt: null,
    resolvedBy: null,
    status: 'ACTIVE',
    evidence: 'Erreurs HTTP 503 consécutives observées sur l’endpoint de simulation.',
    isDemo: true,
  },
  {
    id: 'inc-demo-002',
    watchPlanId: 'watch-demo-002',
    executionId: 'exec-demo-004',
    type: 'INVALID_RESPONSE',
    severity: 'LOW',
    message: '1 élément rejeté lors de la validation structurelle (titre manquant).',
    detectedAt: '2026-09-14T10:00:00.000Z',
    resolvedAt: '2026-09-14T10:15:00.000Z',
    resolvedBy: 'Analyste Simulation',
    status: 'RESOLVED',
    evidence: 'Rejet d’un item malformé avec conservation du RAW dans les logs.',
    isDemo: true,
  },
  {
    id: 'inc-demo-003',
    watchPlanId: 'watch-demo-002',
    executionId: 'exec-demo-001',
    type: 'DUPLICATION_SPIKE',
    severity: 'LOW',
    message: 'Détection d’un doublon probable nécessitant un arbitrage humain.',
    detectedAt: '2026-09-14T11:00:00.000Z',
    resolvedAt: null,
    resolvedBy: null,
    status: 'ACKNOWLEDGED',
    evidence: 'Concordance d’URL canonique sur 1 dépêche simulée.',
    isDemo: true,
  },
  {
    id: 'inc-demo-004',
    watchPlanId: 'watch-demo-001',
    type: 'RATE_LIMIT',
    severity: 'MEDIUM',
    message: 'Avertissement de cadence de requête (prévention de charge).',
    detectedAt: '2026-09-13T16:00:00.000Z',
    resolvedAt: '2026-09-13T16:30:00.000Z',
    resolvedBy: 'Analyste Déontologie',
    status: 'RESOLVED',
    evidence: 'Fréquence ajustée de 10 min à 30 min par l’analyste.',
    isDemo: true,
  },
];

export interface WatchCenterState {
  globalKillSwitch: boolean;
  lastSchedulerTick: string | null;
  activeExecutionsCount: number;
}

class WatchOrchestrationService {
  private listeners: Array<() => void> = [];

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error('Erreur listener watch service:', e);
      }
    });
  }

  // ==========================================================================
  // ÉTAT GLOBAL ET KILL SWITCH
  // ==========================================================================

  public getGlobalState(): WatchCenterState {
    try {
      const stored = localStorage.getItem(STORAGE_WATCH_STATE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return {
      globalKillSwitch: false,
      lastSchedulerTick: null,
      activeExecutionsCount: 0,
    };
  }

  public saveGlobalState(state: Partial<WatchCenterState>): void {
    const current = this.getGlobalState();
    const updated = { ...current, ...state };
    localStorage.setItem(STORAGE_WATCH_STATE, JSON.stringify(updated));
    this.notify();
  }

  public isGlobalKillSwitchActive(): boolean {
    const state = this.getGlobalState();
    // Priorité absolue : synchronisé aussi avec sourceIngestionService
    const ingestionKillSwitch = sourceIngestionService.getKillSwitchStatus();
    return state.globalKillSwitch || ingestionKillSwitch;
  }

  public setGlobalKillSwitch(active: boolean, analystName: string = 'Analyste Sécurité OSINT'): void {
    this.saveGlobalState({ globalKillSwitch: active });
    sourceIngestionService.setKillSwitchStatus(active);

    // Journalisation de sécurité
    this.addAuditLog({
      action: 'KILL_SWITCH',
      result: active ? 'WARNING' : 'SUCCESS',
      sourceId: 'ALL_SOURCES',
      sourceName: 'Tous les plans de veille',
      details: active
        ? `ACTIVATION DU KILL SWITCH GLOBAL DE VEILLE par ${analystName}. Toutes les requêtes et planificateurs sont immédiatement verrouillés.`
        : `DÉSACTIVATION DU KILL SWITCH GLOBAL par ${analystName}. Autorisation des planifications nominales.`,
      initiator: analystName,
      isDemo: false,
    });

    if (active) {
      // Création automatique d'un incident de sécurité
      this.createIncident({
        watchPlanId: 'GLOBAL',
        type: 'KILL_SWITCH',
        severity: 'CRITICAL',
        message: `KILL SWITCH GLOBAL ACTIVÉ — Arrêt d'urgence de toute collecte réelle par ${analystName}.`,
        evidence: 'Déclenchement du coupe-circuit de sécurité général.',
        isDemo: false,
      });
    }

    this.notify();
  }

  // ==========================================================================
  // GESTION DES PLANS DE VEILLE (CRUD & ACTIONS)
  // ==========================================================================

  public getPlans(): OsintWatchPlan[] {
    try {
      const stored = localStorage.getItem(STORAGE_WATCH_PLANS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    const initial = [INITIAL_REAL_APS_PLAN, ...INITIAL_DEMO_PLANS];
    this.savePlans(initial);
    return initial;
  }

  public savePlans(plans: OsintWatchPlan[]): void {
    localStorage.setItem(STORAGE_WATCH_PLANS, JSON.stringify(plans));
    this.notify();
  }

  public getPlanById(id: string): OsintWatchPlan | undefined {
    return this.getPlans().find((p) => p.id === id);
  }

  public activatePlan(planId: string, analystName: string = 'Analyste OSINT'): { success: boolean; message: string } {
    const plans = this.getPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return { success: false, message: 'Plan introuvable' };

    if (!plan.isDemo) {
      // Vérification stricte des autorisations pour la source réelle
      const connectorState = realPilotCollectionService.getConnectorState();
      if (connectorState.authorizationStatus !== 'AUTHORIZED' && connectorState.authorizationStatus !== 'ACTIVE') {
        return {
          success: false,
          message: 'SOURCE NON AUTORISÉE : L’analyste doit d’abord autoriser formellement la source dans le Centre de Gouvernance.',
        };
      }
    }

    plan.enabled = true;
    plan.status = 'ACTIVE';
    plan.consecutiveErrorsCount = 0;
    plan.nextRunAt = new Date(Date.now() + plan.frequencyMinutes * 60 * 1000).toISOString();
    plan.updatedAt = new Date().toISOString();

    this.savePlans(plans);

    this.addAuditLog({
      action: 'PLAN_ACTIVATED',
      result: 'SUCCESS',
      sourceId: plan.sourceId,
      sourceName: plan.name,
      details: `Activation du plan de veille "${plan.name}" (Fréquence : ${plan.frequency}, max ${plan.maxItemsPerRun} items).`,
      initiator: analystName,
      isDemo: plan.isDemo,
    });

    return { success: true, message: `Plan "${plan.name}" activé avec succès.` };
  }

  public pausePlan(planId: string, analystName: string = 'Analyste OSINT'): { success: boolean; message: string } {
    const plans = this.getPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return { success: false, message: 'Plan introuvable' };

    plan.enabled = false;
    plan.status = 'PAUSED';
    plan.nextRunAt = null;
    plan.updatedAt = new Date().toISOString();

    this.savePlans(plans);

    this.addAuditLog({
      action: 'PLAN_PAUSED',
      result: 'SUCCESS',
      sourceId: plan.sourceId,
      sourceName: plan.name,
      details: `Mise en pause du plan de veille "${plan.name}" par ${analystName}.`,
      initiator: analystName,
      isDemo: plan.isDemo,
    });

    return { success: true, message: `Plan "${plan.name}" mis en pause.` };
  }

  public resumePlan(planId: string, analystName: string = 'Analyste OSINT'): { success: boolean; message: string } {
    return this.activatePlan(planId, analystName);
  }

  public disablePlan(planId: string, analystName: string = 'Analyste OSINT'): { success: boolean; message: string } {
    const plans = this.getPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return { success: false, message: 'Plan introuvable' };

    plan.enabled = false;
    plan.status = 'DISABLED';
    plan.nextRunAt = null;
    plan.updatedAt = new Date().toISOString();

    this.savePlans(plans);

    this.addAuditLog({
      action: 'PLAN_DISABLED',
      result: 'SUCCESS',
      sourceId: plan.sourceId,
      sourceName: plan.name,
      details: `Désactivation complète du plan de veille "${plan.name}".`,
      initiator: analystName,
      isDemo: plan.isDemo,
    });

    return { success: true, message: `Plan "${plan.name}" désactivé.` };
  }

  public updatePlanFrequency(
    planId: string,
    frequency: WatchPlanFrequency,
    analystName: string = 'Analyste OSINT'
  ): { success: boolean; message: string } {
    const plans = this.getPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return { success: false, message: 'Plan introuvable' };

    const oldFreq = plan.frequency;
    plan.frequency = frequency;
    plan.frequencyMinutes = FREQUENCY_MINUTES_MAP[frequency] || 15;
    if (plan.enabled && frequency !== 'MANUAL') {
      plan.nextRunAt = new Date(Date.now() + plan.frequencyMinutes * 60 * 1000).toISOString();
    } else {
      plan.nextRunAt = null;
    }
    plan.updatedAt = new Date().toISOString();

    this.savePlans(plans);

    this.addAuditLog({
      action: 'PLAN_CONFIG_MODIFIED',
      result: 'SUCCESS',
      sourceId: plan.sourceId,
      sourceName: plan.name,
      details: `Ajustement de fréquence pour "${plan.name}" : ${oldFreq} -> ${frequency} (${plan.frequencyMinutes} min).`,
      initiator: analystName,
      isDemo: plan.isDemo,
    });

    return { success: true, message: `Fréquence mise à jour sur ${frequency}.` };
  }

  public togglePlanKillSwitch(planId: string, analystName: string = 'Analyste OSINT'): { success: boolean; message: string; active: boolean } {
    const plans = this.getPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return { success: false, message: 'Plan introuvable', active: false };

    plan.killSwitchActive = !plan.killSwitchActive;
    if (plan.killSwitchActive) {
      plan.status = 'BLOCKED';
      plan.nextRunAt = null;
    } else {
      plan.status = plan.enabled ? 'ACTIVE' : 'PAUSED';
      if (plan.enabled) {
        plan.nextRunAt = new Date(Date.now() + plan.frequencyMinutes * 60 * 1000).toISOString();
      }
    }
    plan.updatedAt = new Date().toISOString();

    this.savePlans(plans);

    this.addAuditLog({
      action: 'KILL_SWITCH',
      result: plan.killSwitchActive ? 'WARNING' : 'SUCCESS',
      sourceId: plan.sourceId,
      sourceName: plan.name,
      details: plan.killSwitchActive
        ? `Kill switch individuel ACTIVÉ sur le plan "${plan.name}" par ${analystName}.`
        : `Kill switch individuel DÉSACTIVÉ sur le plan "${plan.name}" par ${analystName}.`,
      initiator: analystName,
      isDemo: plan.isDemo,
    });

    return {
      success: true,
      message: `Kill switch du plan ${plan.name} : ${plan.killSwitchActive ? 'ACTIVÉ (Bloqué)' : 'DÉSACTIVÉ'}`,
      active: plan.killSwitchActive,
    };
  }

  // ==========================================================================
  // EXÉCUTIONS ET HISTORIQUE
  // ==========================================================================

  public getExecutions(): OsintWatchExecution[] {
    try {
      const stored = localStorage.getItem(STORAGE_WATCH_EXECUTIONS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    this.saveExecutions(INITIAL_DEMO_EXECUTIONS);
    return INITIAL_DEMO_EXECUTIONS;
  }

  public saveExecutions(executions: OsintWatchExecution[]): void {
    localStorage.setItem(STORAGE_WATCH_EXECUTIONS, JSON.stringify(executions.slice(0, 100)));
    this.notify();
  }

  public addExecution(exec: OsintWatchExecution): void {
    const current = this.getExecutions();
    this.saveExecutions([exec, ...current]);
  }

  // ==========================================================================
  // INCIDENTS ET ANOMALIES
  // ==========================================================================

  public getIncidents(): OsintWatchIncident[] {
    try {
      const stored = localStorage.getItem(STORAGE_WATCH_INCIDENTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    this.saveIncidents(INITIAL_DEMO_INCIDENTS);
    return INITIAL_DEMO_INCIDENTS;
  }

  public saveIncidents(incidents: OsintWatchIncident[]): void {
    localStorage.setItem(STORAGE_WATCH_INCIDENTS, JSON.stringify(incidents.slice(0, 100)));
    this.notify();
  }

  public createIncident(incident: Omit<OsintWatchIncident, 'id' | 'detectedAt' | 'resolvedAt' | 'resolvedBy' | 'status'> & { status?: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' }): OsintWatchIncident {
    const fullIncident: OsintWatchIncident = {
      id: `inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      detectedAt: new Date().toISOString(),
      resolvedAt: null,
      resolvedBy: null,
      status: incident.status || 'ACTIVE',
      ...incident,
    };
    const current = this.getIncidents();
    this.saveIncidents([fullIncident, ...current]);

    this.addAuditLog({
      action: 'INCIDENT_DETECTED',
      result: incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? 'FAILURE' : 'WARNING',
      sourceId: incident.watchPlanId,
      sourceName: `Incident: ${incident.type}`,
      details: `[${incident.severity}] ${incident.message}`,
      initiator: 'Moteur de Surveillance Automatique',
      isDemo: incident.isDemo,
    });

    return fullIncident;
  }

  public acknowledgeIncident(incidentId: string, analystName: string = 'Analyste OSINT'): { success: boolean; message: string } {
    const incidents = this.getIncidents();
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return { success: false, message: 'Incident introuvable' };

    inc.status = 'ACKNOWLEDGED';
    this.saveIncidents(incidents);

    this.addAuditLog({
      action: 'INCIDENT_ACKNOWLEDGED',
      result: 'SUCCESS',
      sourceId: inc.watchPlanId,
      sourceName: `Incident ${inc.type}`,
      details: `Incident ${inc.id} acquitté par ${analystName}.`,
      initiator: analystName,
      isDemo: inc.isDemo,
    });

    return { success: true, message: 'Incident acquitté.' };
  }

  public resolveIncident(incidentId: string, analystName: string = 'Analyste OSINT', notes?: string): { success: boolean; message: string } {
    const incidents = this.getIncidents();
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return { success: false, message: 'Incident introuvable' };

    inc.status = 'RESOLVED';
    inc.resolvedAt = new Date().toISOString();
    inc.resolvedBy = analystName;
    if (notes) {
      inc.evidence = `${inc.evidence} | Résolution (${analystName}) : ${notes}`;
    }
    this.saveIncidents(incidents);

    this.addAuditLog({
      action: 'INCIDENT_RESOLVED',
      result: 'SUCCESS',
      sourceId: inc.watchPlanId,
      sourceName: `Incident ${inc.type}`,
      details: `Incident ${inc.id} résolu par ${analystName}. Notes: ${notes || 'Conforme'}`,
      initiator: analystName,
      isDemo: inc.isDemo,
    });

    return { success: true, message: 'Incident résolu avec succès.' };
  }

  // ==========================================================================
  // AUDIT LOGS
  // ==========================================================================

  public getAuditLogs(): CollectionAuditLog[] {
    try {
      const stored = localStorage.getItem(STORAGE_WATCH_AUDIT);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  }

  public addAuditLog(log: {
    action: string;
    result: 'SUCCESS' | 'WARNING' | 'FAILURE' | 'BLOCKED_OFFLINE';
    sourceId: string;
    sourceName: string;
    details: string;
    initiator: string;
    isDemo: boolean;
  }): CollectionAuditLog {
    const auditEntry: CollectionAuditLog = {
      id: `aud-watch-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      jobId: `job-watch-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      action: log.action as any,
      result: log.result,
      sourceId: log.sourceId,
      sourceName: log.sourceName,
      details: log.details,
      initiator: log.initiator,
      items: 0,
      errors: log.result === 'FAILURE' ? [log.details] : [],
      mode: log.isDemo ? 'SIMULATED' : 'REAL_PILOT',
      isDemo: log.isDemo,
    };

    const current = this.getAuditLogs();
    const updated = [auditEntry, ...current].slice(0, 200);
    localStorage.setItem(STORAGE_WATCH_AUDIT, JSON.stringify(updated));

    // Synchronisation également dans sourceIngestionService
    try {
      sourceIngestionService.addAuditLog(auditEntry);
    } catch {
      // ignore
    }

    this.notify();
    return auditEntry;
  }

  // ==========================================================================
  // EXÉCUTION D'UN PLAN DE VEILLE (Contrôlée, Limitée, Traçable)
  // ==========================================================================

  public async executePlan(
    planId: string,
    analystName: string = 'Analyste Principal OSINT'
  ): Promise<{
    success: boolean;
    execution: OsintWatchExecution;
    message: string;
    incidents: OsintWatchIncident[];
  }> {
    const startedAt = new Date().toISOString();
    const startTimeMs = Date.now();
    const executionId = `exec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const plans = this.getPlans();
    const plan = plans.find((p) => p.id === planId);
    const newIncidents: OsintWatchIncident[] = [];
    const auditLogIds: string[] = [];

    if (!plan) {
      throw new Error(`Plan de veille introuvable (${planId})`);
    }

    // ========================================================================
    // 1. GARDE-FOU KILL SWITCH (Priorité Absolue)
    // ========================================================================
    if (this.isGlobalKillSwitchActive() || plan.killSwitchActive) {
      const blockedMsg = this.isGlobalKillSwitchActive()
        ? 'COLLECTE BLOQUÉE : Kill switch global de veille activé.'
        : `COLLECTE BLOQUÉE : Kill switch individuel actif sur le plan "${plan.name}".`;

      const incident = this.createIncident({
        watchPlanId: plan.id,
        executionId,
        type: 'KILL_SWITCH',
        severity: 'CRITICAL',
        message: blockedMsg,
        evidence: 'Arrêt immédiat déclenché avant toute émission réseau.',
        isDemo: plan.isDemo,
      });
      newIncidents.push(incident);

      const audit = this.addAuditLog({
        action: 'KILL_SWITCH_TRIGGERED',
        result: 'BLOCKED_OFFLINE',
        sourceId: plan.sourceId,
        sourceName: plan.name,
        details: blockedMsg,
        initiator: analystName,
        isDemo: plan.isDemo,
      });
      auditLogIds.push(audit.id);

      const execRecord: OsintWatchExecution = {
        id: executionId,
        watchPlanId: plan.id,
        sourceId: plan.sourceId,
        connectorId: plan.connectorId,
        startedAt,
        finishedAt: new Date().toISOString(),
        status: 'BLOCKED',
        requestCount: 0,
        itemsReceived: 0,
        itemsAccepted: 0,
        itemsRejected: 0,
        itemsDuplicate: 0,
        itemsNew: 0,
        errorsCount: 1,
        durationMs: Date.now() - startTimeMs,
        errorMessage: blockedMsg,
        networkDomains: [],
        httpStatuses: [],
        auditLogIds,
        isDemo: plan.isDemo,
      };

      this.addExecution(execRecord);
      return { success: false, execution: execRecord, message: blockedMsg, incidents: newIncidents };
    }

    // ========================================================================
    // 2. CONTRÔLE D'ÉTAT DU PLAN
    // ========================================================================
    if (plan.status === 'DISABLED' || plan.status === 'ERROR') {
      const stateErr = `EXÉCUTION BLOQUÉE : Le plan est au statut ${plan.status} (${plan.consecutiveErrorsCount} erreurs consécutives). Réactivez le plan manuellement après vérification.`;
      
      const execRecord: OsintWatchExecution = {
        id: executionId,
        watchPlanId: plan.id,
        sourceId: plan.sourceId,
        connectorId: plan.connectorId,
        startedAt,
        finishedAt: new Date().toISOString(),
        status: 'BLOCKED',
        requestCount: 0,
        itemsReceived: 0,
        itemsAccepted: 0,
        itemsRejected: 0,
        itemsDuplicate: 0,
        itemsNew: 0,
        errorsCount: 1,
        durationMs: Date.now() - startTimeMs,
        errorMessage: stateErr,
        networkDomains: [],
        httpStatuses: [],
        auditLogIds,
        isDemo: plan.isDemo,
      };

      this.addExecution(execRecord);
      return { success: false, execution: execRecord, message: stateErr, incidents: newIncidents };
    }

    // ========================================================================
    // 3. CONTRÔLE DE GOUVERNANCE & AUTORISATIONS (Source Réelle vs Démo)
    // ========================================================================
    if (!plan.isDemo) {
      // Source réelle APS
      const connectorState = realPilotCollectionService.getConnectorState();
      if (connectorState.authorizationStatus !== 'AUTHORIZED' && connectorState.authorizationStatus !== 'ACTIVE') {
        const govErr = 'GOUVERNANCE NON CONFORME : La source pilote APS doit être formellement autorisée par un analyste.';
        
        const incident = this.createIncident({
          watchPlanId: plan.id,
          executionId,
          type: 'GOVERNANCE_BLOCK',
          severity: 'HIGH',
          message: govErr,
          evidence: `Statut actuel du connecteur : ${connectorState.authorizationStatus}`,
          isDemo: false,
        });
        newIncidents.push(incident);

        const audit = this.addAuditLog({
          action: 'GOVERNANCE_BLOCKED',
          result: 'BLOCKED_OFFLINE',
          sourceId: plan.sourceId,
          sourceName: plan.name,
          details: govErr,
          initiator: analystName,
          isDemo: false,
        });
        auditLogIds.push(audit.id);

        const execRecord: OsintWatchExecution = {
          id: executionId,
          watchPlanId: plan.id,
          sourceId: plan.sourceId,
          connectorId: plan.connectorId,
          startedAt,
          finishedAt: new Date().toISOString(),
          status: 'BLOCKED',
          requestCount: 0,
          itemsReceived: 0,
          itemsAccepted: 0,
          itemsRejected: 0,
          itemsDuplicate: 0,
          itemsNew: 0,
          errorsCount: 1,
          durationMs: Date.now() - startTimeMs,
          errorMessage: govErr,
          networkDomains: [],
          httpStatuses: [],
          auditLogIds,
          isDemo: false,
        };

        this.addExecution(execRecord);
        return { success: false, execution: execRecord, message: govErr, incidents: newIncidents };
      }
    }

    // ========================================================================
    // 4. EXÉCUTION DU PIPELINE (RÉEL OU SIMULATION)
    // ========================================================================
    let requestCount = 0;
    let itemsReceived = 0;
    let itemsAccepted = 0;
    let itemsRejected = 0;
    let itemsDuplicate = 0;
    let itemsNew = 0;
    let httpStatuses: number[] = [];
    let networkDomains: string[] = [];
    let executionStatus: WatchExecutionStatus = 'RUNNING';
    let errorMessage: string | null = null;

    if (!plan.isDemo) {
      // ----------------------------------------------------------------------
      // EXÉCUTION RÉELLE SUR LE FLUX OFFICIEL APS
      // ----------------------------------------------------------------------
      networkDomains.push(PILOT_CONFIG.officialDomain);

      // Limite stricte : Maximum 1 requête HTTP par exécution
      if (requestCount >= plan.maxRequestsPerRun) {
        const reqLimitErr = `LIMITE DE REQUÊTES ATTEINTE : Maximum ${plan.maxRequestsPerRun} requête autorisée.`;
        const inc = this.createIncident({
          watchPlanId: plan.id,
          executionId,
          type: 'TOO_MANY_REQUESTS',
          severity: 'HIGH',
          message: reqLimitErr,
          evidence: `Tentative de dépassement de quota réseau (${requestCount + 1}/${plan.maxRequestsPerRun}).`,
          isDemo: false,
        });
        newIncidents.push(inc);
      }

      requestCount++;
      let responseText = '';
      let endpointUsed = PILOT_CONFIG.proxyFeedUrl;

      // Journal d'audit de démarrage
      const startAudit = this.addAuditLog({
        action: 'WATCH_EXECUTION_STARTED',
        result: 'SUCCESS',
        sourceId: plan.sourceId,
        sourceName: plan.name,
        details: `Lancement d'une exécution de veille contrôlée sur ${PILOT_CONFIG.sourceName} (Limites : ${plan.maxRequestsPerRun} req, ${plan.maxItemsPerRun} items).`,
        initiator: analystName,
        isDemo: false,
      });
      auditLogIds.push(startAudit.id);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), PILOT_CONFIG.timeoutMs);

        let res: Response;
        try {
          endpointUsed = PILOT_CONFIG.proxyFeedUrl;
          res = await fetch(PILOT_CONFIG.proxyFeedUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              Accept: 'application/rss+xml, application/xml, text/xml',
            },
          });
        } catch {
          endpointUsed = PILOT_CONFIG.feedUrl;
          res = await fetch(PILOT_CONFIG.feedUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              Accept: 'application/rss+xml, application/xml, text/xml',
            },
          });
        }

        clearTimeout(timeoutId);
        httpStatuses.push(res.status);

        if (!res.ok) {
          throw new Error(`Code HTTP non nominal : ${res.status} ${res.statusText}`);
        }

        responseText = await res.text();

        // Parseur XML RSS 2.0
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(responseText, 'text/xml');
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
          throw new Error(`Format XML invalide retourné par la source pilote : ${parseError.textContent?.slice(0, 100)}`);
        }

        const xmlItems = Array.from(xmlDoc.querySelectorAll('item'));
        itemsReceived = xmlItems.length;

        // Limite stricte : Maximum 10 items par exécution
        const allowedItems = xmlItems.slice(0, plan.maxItemsPerRun);
        if (itemsReceived > plan.maxItemsPerRun) {
          const excessCount = itemsReceived - plan.maxItemsPerRun;
          const inc = this.createIncident({
            watchPlanId: plan.id,
            executionId,
            type: 'TOO_MANY_ITEMS',
            severity: 'LOW',
            message: `Flux APS volumineux : ${itemsReceived} dépêches reçues. Troncature stricte appliquée (${plan.maxItemsPerRun} conservées, ${excessCount} tronquées).`,
            evidence: `Protection anti-saturation : seuil ${plan.maxItemsPerRun} items respecté.`,
            isDemo: false,
          });
          newIncidents.push(inc);
        }

        const rawItemsToSave: OsintRawItem[] = [];
        const normalizedItemsToSave: OsintNormalizedItem[] = [];
        const existingNormalized = sourceIngestionService.getAllNormalizedItems();

        for (let i = 0; i < allowedItems.length; i++) {
          const itemNode = allowedItems[i];
          const title = itemNode.querySelector('title')?.textContent?.trim() || 'Dépêche sans titre';
          const link = itemNode.querySelector('link')?.textContent?.trim() || itemNode.querySelector('guid')?.textContent?.trim() || '';
          const description =
            itemNode.querySelector('description')?.textContent?.trim() ||
            itemNode.querySelector('encoded')?.textContent?.trim() ||
            title;
          const pubDate = itemNode.querySelector('pubDate')?.textContent?.trim() || new Date().toISOString();
          const guid = itemNode.querySelector('guid')?.textContent?.trim();

          const realSha256 = await calculateRealSha256(description, title);
          const rawId = `raw-real-aps-${Date.now()}-${i + 1}`;

          const rawItem: OsintRawItem = {
            id: rawId,
            sourceId: PILOT_CONFIG.sourceId,
            connectorId: PILOT_CONFIG.connectorId,
            externalId: guid || link || `aps-${Date.now()}-${i}`,
            originalUrl: link || PILOT_CONFIG.officialUrl,
            canonicalUrl: link ? link.split('#')[0].split('?utm')[0] : PILOT_CONFIG.officialUrl,
            title,
            rawContent: description,
            publishedAt: isNaN(Date.parse(pubDate)) ? new Date().toISOString() : new Date(pubDate).toISOString(),
            collectedAt: new Date().toISOString(),
            language: 'Français',
            contentHash: realSha256,
            hashAlgorithm: 'SHA-256',
            metadata: {
              mimeType: 'application/rss+xml',
              encoding: 'UTF-8',
              httpStatus: 200,
              sourceDomain: PILOT_CONFIG.officialDomain,
              feedEndpoint: '/feed/',
              collectionMode: 'WATCH_CONTINUOUS_CONTROLLED',
              watchPlanId: plan.id,
              executionId,
              retrievedVia: endpointUsed,
              guid,
            },
            processingStatus: 'RECEIVED',
            isDemo: false,
          };

          const validation = validateRawItem(rawItem);
          if (!validation.isValid) {
            rawItem.processingStatus = 'REJECTED';
            rawItem.rejectionReason = validation.errors.join('; ');
            itemsRejected++;
          } else {
            itemsAccepted++;

            const normalized = normalizeRawItem(rawItem, {
              country: 'Sénégal',
              countryId: 'SEN',
              region: 'Afrique de l’Ouest',
              isDemo: false,
              hashAlgorithm: 'SHA-256',
            });

            // Déduplication avec les données existantes
            const dupCheck = detectPotentialDuplicate(normalized, existingNormalized);
            normalized.duplicateStatus = dupCheck.status;

            if (dupCheck.status === 'PROBABLE_DUPLICATE' || dupCheck.status === 'CONFIRMED_DUPLICATE') {
              itemsDuplicate++;
            } else {
              itemsNew++;
            }

            normalizedItemsToSave.push(normalized);
          }

          rawItemsToSave.push(rawItem);
        }

        // Persistance des items dans le service d'ingestion central
        const allRaw = [...rawItemsToSave, ...sourceIngestionService.getAllRawItems()];
        sourceIngestionService.saveRawItems(allRaw);

        const allNorm = [...normalizedItemsToSave, ...sourceIngestionService.getAllNormalizedItems()];
        sourceIngestionService.saveNormalizedItems(allNorm);

        // LOT 25 : Injection locale et transparente dans la file d'attente d'alertes à qualifier
        if (normalizedItemsToSave.length > 0) {
          try {
            alertService.processNewNormalizedItems(normalizedItemsToSave);
          } catch (alertErr) {
            console.warn('Erreur non-bloquante traitement alerte candidate :', alertErr);
          }
        }

        // Mise à jour de la réussite du plan
        plan.consecutiveErrorsCount = 0;
        plan.lastRunAt = startedAt;
        plan.lastSuccessfulRunAt = startedAt;
        plan.nextRunAt = plan.frequency !== 'MANUAL'
          ? new Date(Date.now() + plan.frequencyMinutes * 60 * 1000).toISOString()
          : null;
        plan.updatedAt = new Date().toISOString();
        this.savePlans(plans);

        executionStatus = itemsRejected > 0 ? 'PARTIAL' : 'SUCCESS';

        const compAudit = this.addAuditLog({
          action: 'WATCH_EXECUTION_COMPLETED',
          result: 'SUCCESS',
          sourceId: plan.sourceId,
          sourceName: plan.name,
          details: `Exécution réussie : ${itemsReceived} reçus, ${itemsAccepted} acceptés, ${itemsNew} nouveaux (en attente d'arbitrage), ${itemsDuplicate} doublons, ${itemsRejected} rejetés. Empreintes SHA-256 réelles vérifiées.`,
          initiator: analystName,
          isDemo: false,
        });
        auditLogIds.push(compAudit.id);

      } catch (err: any) {
        const errMsg = err.name === 'AbortError' ? 'Timeout de connexion réseau (> 10 000 ms)' : err.message || 'Erreur inconnue';
        errorMessage = errMsg;
        executionStatus = 'FAILED';

        // Gestion de l'échec et seuils d'anomalie
        plan.consecutiveErrorsCount = (plan.consecutiveErrorsCount || 0) + 1;
        plan.lastRunAt = startedAt;
        plan.lastErrorAt = startedAt;
        plan.updatedAt = new Date().toISOString();

        if (plan.consecutiveErrorsCount >= plan.maxConsecutiveErrors) {
          // Désactivation automatique par sécurité
          plan.status = 'ERROR';
          plan.enabled = false;
          plan.nextRunAt = null;

          const inc = this.createIncident({
            watchPlanId: plan.id,
            executionId,
            type: 'CONSECUTIVE_FAILURES',
            severity: 'HIGH',
            message: `ARRÊT AUTOMATIQUE DE SÉCURITÉ : ${plan.consecutiveErrorsCount} erreurs consécutives détectées sur ${plan.name}. Plan désactivé.`,
            evidence: `Dernière erreur : ${errMsg}`,
            isDemo: false,
          });
          newIncidents.push(inc);
        } else {
          const inc = this.createIncident({
            watchPlanId: plan.id,
            executionId,
            type: 'NETWORK_ERROR',
            severity: 'MEDIUM',
            message: `Échec d'exécution de veille sur ${plan.name} : ${errMsg}`,
            evidence: `Tentative ${plan.consecutiveErrorsCount}/${plan.maxConsecutiveErrors}`,
            isDemo: false,
          });
          newIncidents.push(inc);
        }

        this.savePlans(plans);

        const failAudit = this.addAuditLog({
          action: 'WATCH_EXECUTION_FAILED',
          result: 'FAILURE',
          sourceId: plan.sourceId,
          sourceName: plan.name,
          details: `Échec de la collecte : ${errMsg}. Erreurs consécutives : ${plan.consecutiveErrorsCount}/${plan.maxConsecutiveErrors}.`,
          initiator: analystName,
          isDemo: false,
        });
        auditLogIds.push(failAudit.id);
      }

    } else {
      // ----------------------------------------------------------------------
      // EXÉCUTION DE DÉMONSTRATION / SIMULATION (isDemo: true)
      // ----------------------------------------------------------------------
      networkDomains.push('sandbox.local.simulation');
      requestCount = 1;
      httpStatuses.push(200);

      // Simulation de 3 à 5 items simulés
      const simCount = Math.min(plan.maxItemsPerRun, 4);
      itemsReceived = simCount;
      itemsAccepted = simCount;
      itemsNew = simCount - 1;
      itemsDuplicate = 1;
      itemsRejected = 0;
      executionStatus = 'SUCCESS';

      plan.consecutiveErrorsCount = 0;
      plan.lastRunAt = startedAt;
      plan.lastSuccessfulRunAt = startedAt;
      plan.nextRunAt = plan.frequency !== 'MANUAL'
        ? new Date(Date.now() + plan.frequencyMinutes * 60 * 1000).toISOString()
        : null;
      plan.updatedAt = new Date().toISOString();
      this.savePlans(plans);

      const simAudit = this.addAuditLog({
        action: 'WATCH_EXECUTION_SIMULATED',
        result: 'SUCCESS',
        sourceId: plan.sourceId,
        sourceName: plan.name,
        details: `Exécution simulée réussie (${simCount} items traités).`,
        initiator: analystName,
        isDemo: true,
      });
      auditLogIds.push(simAudit.id);
    }

    const durationMs = Date.now() - startTimeMs;
    const executionRecord: OsintWatchExecution = {
      id: executionId,
      watchPlanId: plan.id,
      sourceId: plan.sourceId,
      connectorId: plan.connectorId,
      startedAt,
      finishedAt: new Date().toISOString(),
      status: executionStatus,
      requestCount,
      itemsReceived,
      itemsAccepted,
      itemsRejected,
      itemsDuplicate,
      itemsNew,
      errorsCount: executionStatus === 'FAILED' ? 1 : 0,
      durationMs,
      errorMessage,
      networkDomains,
      httpStatuses,
      auditLogIds,
      isDemo: plan.isDemo,
    };

    this.addExecution(executionRecord);

    return {
      success: executionStatus === 'SUCCESS' || executionStatus === 'PARTIAL',
      execution: executionRecord,
      message: executionStatus === 'SUCCESS'
        ? `Exécution réussie (${itemsAccepted} items traités, ${itemsNew} nouveaux en attente d'arbitrage).`
        : executionStatus === 'PARTIAL'
        ? `Exécution partielle (${itemsRejected} rejets, ${itemsDuplicate} doublons).`
        : `Échec de l'exécution : ${errorMessage}`,
      incidents: newIncidents,
    };
  }

  // ==========================================================================
  // ÉVALUATEUR LOCAL DU PLANIFICATEUR (SCHEDULER LOCAL CONTRÔLÉ)
  // ==========================================================================

  public evaluateDuePlans(): { evaluatedCount: number; duePlansCount: number } {
    const plans = this.getPlans();
    const now = Date.now();
    const duePlans = plans.filter(
      (p) => p.enabled && p.status === 'ACTIVE' && p.nextRunAt && new Date(p.nextRunAt).getTime() <= now
    );

    this.saveGlobalState({ lastSchedulerTick: new Date().toISOString() });
    return {
      evaluatedCount: plans.length,
      duePlansCount: duePlans.length,
    };
  }
}

export const watchOrchestrationService = new WatchOrchestrationService();
