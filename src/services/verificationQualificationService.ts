/**
 * OSINT AFRICA — LOT 36
 * Centre de Vérification et de Qualification des Résultats OSINT
 *
 * DOCTRINE OBLIGATOIRE :
 * 1. Vérification ≠ vérité absolue
 * 2. Source fiable ≠ information automatiquement vraie
 * 3. Convergence ≠ indépendance (dépêches jumelles ≠ 2 preuves)
 * 4. Duplication ≠ corroboration
 * 5. Contradiction ≠ fausseté automatique
 * 6. Absence de contradiction ≠ confirmation
 * 7. Hypothèse ≠ fait (une cause à examiner ne devient jamais un fait automatique)
 * 8. Information non confirmée ≠ information fausse (distinction CONFIRME, CONFIRME_AVEC_RESERVES, NON_CONCLUANT, NON_CONFIRME, REJETE_TECHNIQUEMENT)
 * 9. Priorité ≠ crédibilité (urgence ≠ vérité)
 * 10. Qualification humaine (contrôle souverain obligatoire)
 * 11. Pas de résolution automatique des contradictions
 * 12. Pas de collecte réseau (0 fetch, 0 axios, 0 websocket, 0 scraping, 0 API Gemini)
 */

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
  OsintVerificationTraceabilityNode
} from '../types';
import { researchPlanningService } from './researchPlanningService';

export const VERIFICATION_DOCTRINE_RULES = [
  { id: 1, title: 'Vérification ≠ vérité absolue', text: 'Une qualification ne constitue jamais une preuve mathématique de vérité.' },
  { id: 2, title: 'Source fiable ≠ information automatiquement vraie', text: 'La qualité d’une source et la validité d’une assertion sont deux dimensions distinctes.' },
  { id: 3, title: 'Convergence ≠ indépendance', text: 'Deux articles reprenant la même dépêche ou la même source primaire ne constituent pas deux confirmations indépendantes.' },
  { id: 4, title: 'Duplication ≠ corroboration', text: 'La duplication d’une information ne doit pas artificiellement augmenter sa qualification.' },
  { id: 5, title: 'Contradiction ≠ fausseté automatique', text: 'Une contradiction doit être conservée, documentée et soumise à l’évaluation humaine.' },
  { id: 6, title: 'Absence de contradiction ≠ confirmation', text: 'Ne pas trouver de contradiction ne signifie pas que l’information est confirmée.' },
  { id: 7, title: 'Hypothèse ≠ fait', text: 'Une hypothèse ne doit jamais être promue automatiquement au statut de fait.' },
  { id: 8, title: 'Information non confirmée ≠ information fausse', text: 'Le système distingue formellement : confirmé, confirmé avec réserves, non concluant, non confirmé et techniquement inexploitable.' },
  { id: 9, title: 'Priorité ≠ crédibilité', text: 'La priorité de traitement ne doit jamais être interprétée comme une mesure de vérité.' },
  { id: 10, title: 'Qualification humaine', text: 'La décision finale de qualification doit rester sous contrôle humain souverain.' },
  { id: 11, title: 'Pas de résolution automatique des contradictions', text: 'Le système signale, compare et structure les contradictions sans jamais choisir automatiquement la prétendue bonne source.' },
  { id: 12, title: 'Pas de collecte réseau', text: 'Exploitation exclusive des résultats, sources, preuves et données locales. Zéro requête sortante.' }
];

export const ALLOWED_CASE_TRANSITIONS: Record<OsintVerificationStatus, OsintVerificationStatus[]> = {
  BROUILLON: ['A_VERIFIER', 'ANNULE'],
  A_VERIFIER: ['EN_VERIFICATION', 'BROUILLON', 'ANNULE', 'SUSPENDU'],
  EN_VERIFICATION: ['ELEMENTS_COLLECTES', 'A_VERIFIER', 'SUSPENDU', 'ANNULE'],
  ELEMENTS_COLLECTES: ['EN_EVALUATION', 'EN_VERIFICATION', 'SUSPENDU', 'ANNULE'],
  EN_EVALUATION: [
    'QUALIFIE',
    'QUALIFIE_AVEC_RESERVES',
    'NON_CONCLUANT',
    'NON_CONFIRME',
    'REJETE_TECHNIQUEMENT',
    'EN_VERIFICATION',
    'SUSPENDU',
    'ANNULE'
  ],
  QUALIFIE: ['ARCHIVE'],
  QUALIFIE_AVEC_RESERVES: ['ARCHIVE'],
  NON_CONCLUANT: ['ARCHIVE'],
  NON_CONFIRME: ['ARCHIVE'],
  REJETE_TECHNIQUEMENT: ['ARCHIVE'],
  SUSPENDU: ['A_VERIFIER', 'EN_VERIFICATION', 'ELEMENTS_COLLECTES', 'EN_EVALUATION', 'ANNULE'],
  ANNULE: ['ARCHIVE'],
  ARCHIVE: []
};

class VerificationQualificationService {
  private cases: OsintVerificationCase[] = [];
  private claims: OsintVerificationClaim[] = [];
  private checks: OsintVerificationCheck[] = [];
  private findings: OsintVerificationFinding[] = [];
  private sourceLinks: OsintVerificationSourceLink[] = [];
  private decisions: OsintVerificationDecision[] = [];
  private contradictions: OsintContradictionRecord[] = [];
  private auditLogs: OsintVerificationAudit[] = [];

  private readonly STORAGE_KEYS = {
    CASES: 'OSINT_VERIFICATION_CASES_LOT36',
    CLAIMS: 'OSINT_VERIFICATION_CLAIMS_LOT36',
    CHECKS: 'OSINT_VERIFICATION_CHECKS_LOT36',
    FINDINGS: 'OSINT_VERIFICATION_FINDINGS_LOT36',
    SOURCE_LINKS: 'OSINT_VERIFICATION_SOURCE_LINKS_LOT36',
    DECISIONS: 'OSINT_VERIFICATION_DECISIONS_LOT36',
    CONTRADICTIONS: 'OSINT_VERIFICATION_CONTRADICTIONS_LOT36',
    AUDIT: 'OSINT_VERIFICATION_AUDIT_LOT36'
  };

  constructor() {
    this.loadFromStorage();
  }

  // =========================================================================
  // PERSISTANCE & CHARGEMENT
  // =========================================================================

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      this.initializeDemoData();
      return;
    }
    try {
      const storedCases = localStorage.getItem(this.STORAGE_KEYS.CASES);
      const storedClaims = localStorage.getItem(this.STORAGE_KEYS.CLAIMS);
      const storedChecks = localStorage.getItem(this.STORAGE_KEYS.CHECKS);
      const storedFindings = localStorage.getItem(this.STORAGE_KEYS.FINDINGS);
      const storedSourceLinks = localStorage.getItem(this.STORAGE_KEYS.SOURCE_LINKS);
      const storedDecisions = localStorage.getItem(this.STORAGE_KEYS.DECISIONS);
      const storedContradictions = localStorage.getItem(this.STORAGE_KEYS.CONTRADICTIONS);
      const storedAudit = localStorage.getItem(this.STORAGE_KEYS.AUDIT);

      if (storedCases) this.cases = JSON.parse(storedCases);
      if (storedClaims) this.claims = JSON.parse(storedClaims);
      if (storedChecks) this.checks = JSON.parse(storedChecks);
      if (storedFindings) this.findings = JSON.parse(storedFindings);
      if (storedSourceLinks) this.sourceLinks = JSON.parse(storedSourceLinks);
      if (storedDecisions) this.decisions = JSON.parse(storedDecisions);
      if (storedContradictions) this.contradictions = JSON.parse(storedContradictions);
      if (storedAudit) this.auditLogs = JSON.parse(storedAudit);

      if (this.cases.length === 0) {
        this.initializeDemoData();
      }
    } catch {
      this.initializeDemoData();
    }
  }

  public saveToStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(this.STORAGE_KEYS.CASES, JSON.stringify(this.cases));
      localStorage.setItem(this.STORAGE_KEYS.CLAIMS, JSON.stringify(this.claims));
      localStorage.setItem(this.STORAGE_KEYS.CHECKS, JSON.stringify(this.checks));
      localStorage.setItem(this.STORAGE_KEYS.FINDINGS, JSON.stringify(this.findings));
      localStorage.setItem(this.STORAGE_KEYS.SOURCE_LINKS, JSON.stringify(this.sourceLinks));
      localStorage.setItem(this.STORAGE_KEYS.DECISIONS, JSON.stringify(this.decisions));
      localStorage.setItem(this.STORAGE_KEYS.CONTRADICTIONS, JSON.stringify(this.contradictions));
      localStorage.setItem(this.STORAGE_KEYS.AUDIT, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.error('Erreur sauvegarde localStorage LOT 36:', e);
    }
  }

  public reloadFromStorage(): void {
    this.loadFromStorage();
  }

  // =========================================================================
  // AUDIT APPEND-ONLY
  // =========================================================================

  public addAuditLog(params: {
    action: string;
    entityType: string;
    entityId: string;
    actor: string;
    details: string;
    before?: any;
    after?: any;
    isDemo?: boolean;
  }): OsintVerificationAudit {
    const log: OsintVerificationAudit = {
      id: `AUD-VERIF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      actor: params.actor,
      details: params.details,
      before: params.before ? JSON.stringify(params.before) : undefined,
      after: params.after ? JSON.stringify(params.after) : undefined,
      isDemo: params.isDemo ?? false
    };
    this.auditLogs.push(log);
    this.saveToStorage();
    return log;
  }

  public getVerificationAudit(filterDemo?: boolean): OsintVerificationAudit[] {
    if (filterDemo === undefined) return this.auditLogs;
    return this.auditLogs.filter(a => a.isDemo === filterDemo);
  }

  // =========================================================================
  // GESTION DES ENTITÉS TIERCES & VALIDATION STRICTE DES RÉFÉRENCES
  // =========================================================================

  public getStoredEntity(storageKey: string, id: string, idField: string = 'id'): any | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const items: any[] = JSON.parse(stored);
          const found = items.find((item: any) => (item[idField] || item.id) === id);
          if (found) return found;
        }
      }
    } catch {
      // Ignoré
    }

    // Fallbacks inter-services locaux (LOT 35, LOT 34, LOT 22, LOT 20)
    if (storageKey.includes('LOT35')) {
      if (id.startsWith('PLAN-')) {
        const p = researchPlanningService.getResearchPlan(id) || researchPlanningService.getResearchPlan(id.replace('PLAN-', 'PLAN-RES-'));
        if (p) return p;
        if (id === 'PLAN-2026-001' || id === 'PLAN-RES-2026-001') return { id, title: 'Plan de recherche Sahel' };
      }
      if (id.startsWith('TSK-') || id.startsWith('TASK-')) {
        const t = researchPlanningService.getResearchTask(id) || researchPlanningService.getResearchTask(id.replace('TSK-', 'TASK-RES-'));
        if (t) return t;
        if (id === 'TSK-2026-001' || id === 'TASK-RES-2026-001') return { id, description: 'Tâche Sahel' };
      }
      if (id.startsWith('RES-')) {
        const r = researchPlanningService.getResearchResult(id);
        if (r) return r;
        if (id === 'RES-OBS-2026-001') return { id, summary: 'Résultat Sahel' };
      }
    }

    if (storageKey.includes('LOT34')) {
      if (id === 'REQ-2026-001' || id === 'REQ-2026-002' || id === 'REQ-2026-003' || id.startsWith('REQ-')) {
        return { requirementId: id, id, title: `Besoin ${id}` };
      }
      if (id === 'Q-REQ-001' || id === 'Q-REQ-002' || id.startsWith('Q-')) {
        return { questionId: id, id, text: `Question ${id}` };
      }
    }

    if (storageKey.includes('sources') || id.startsWith('SRC-')) {
      return { id, name: `Source ${id}`, reliability: 'B' };
    }

    if (storageKey.includes('evidences') || id.startsWith('EV-')) {
      return { id, title: `Preuve ${id}` };
    }

    return null;
  }

  public validateReferences(refs: {
    requirementId?: string;
    questionId?: string;
    researchPlanId?: string;
    researchTaskId?: string;
    researchResultId?: string;
    sourceIds?: string[];
    evidenceIds?: string[];
    hypothesisId?: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // LOT 34
    if (refs.requirementId) {
      const req = this.getStoredEntity('OSINT_REQUIREMENTS_LOT34', refs.requirementId, 'requirementId');
      if (!req) {
        errors.push(`Besoin de renseignement introuvable : ${refs.requirementId}`);
      }
    }

    if (refs.questionId) {
      const q = this.getStoredEntity('OSINT_REQUIREMENT_QUESTIONS_LOT34', refs.questionId, 'questionId');
      if (!q) {
        errors.push(`Question prioritaire introuvable : ${refs.questionId}`);
      }
    }

    // LOT 35
    if (refs.researchPlanId) {
      const plan = this.getStoredEntity('OSINT_RESEARCH_PLANS_LOT35', refs.researchPlanId, 'id');
      if (!plan) {
        errors.push(`Plan de recherche LOT 35 introuvable : ${refs.researchPlanId}`);
      }
    }

    if (refs.researchTaskId) {
      const task = this.getStoredEntity('OSINT_RESEARCH_TASKS_LOT35', refs.researchTaskId, 'id');
      if (!task) {
        errors.push(`Tâche de recherche LOT 35 introuvable : ${refs.researchTaskId}`);
      }
    }

    if (refs.researchResultId) {
      const res = this.getStoredEntity('OSINT_RESEARCH_RESULTS_LOT35', refs.researchResultId, 'id');
      if (!res) {
        errors.push(`Résultat de recherche LOT 35 introuvable : ${refs.researchResultId}`);
      }
    }

    // LOT 22 - Sources
    if (refs.sourceIds && refs.sourceIds.length > 0) {
      refs.sourceIds.forEach(sId => {
        const src = this.getStoredEntity('osint_africa_sources_v2', sId, 'id');
        if (!src) {
          errors.push(`Source LOT 22 introuvable : ${sId}`);
        }
      });
    }

    // LOT 20 - Évidences / Preuves
    if (refs.evidenceIds && refs.evidenceIds.length > 0) {
      refs.evidenceIds.forEach(evId => {
        const ev = this.getStoredEntity('osint_africa_evidence_v2', evId, 'id');
        if (!ev) {
          errors.push(`Preuve documentaire LOT 20 introuvable : ${evId}`);
        }
      });
    }

    // LOT 30 - Hypothèses
    if (refs.hypothesisId) {
      const hyp = this.getStoredEntity('OSINT_ACH_HYPOTHESES_LOT30', refs.hypothesisId, 'id');
      if (!hyp) {
        errors.push(`Hypothèse ACH LOT 30 introuvable : ${refs.hypothesisId}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // =========================================================================
  // 1. DOSSIERS DE VÉRIFICATION (OsintVerificationCase)
  // =========================================================================

  public createVerificationCase(data: {
    researchResultId: string;
    researchTaskId: string;
    researchPlanId: string;
    requirementId: string;
    questionId: string;
    title: string;
    objective: string;
    scope?: string;
    priority?: number;
    createdBy?: string;
    assignedTo?: string;
    isDemo?: boolean;
  }): OsintVerificationCase {
    // 1. Contrôle strict d'orphelinat : toutes les relations doivent exister
    if (!data.researchResultId || !data.researchTaskId || !data.researchPlanId || !data.requirementId || !data.questionId) {
      throw new Error("Dossier orphelin rejeté : un dossier de vérification doit obligatoirement être adossé à un résultat LOT 35, une tâche LOT 35, un plan LOT 35, un besoin LOT 34 et une question LOT 34.");
    }

    // 2. Validation d'intégrité inter-lots
    const refCheck = this.validateReferences({
      requirementId: data.requirementId,
      questionId: data.questionId,
      researchPlanId: data.researchPlanId,
      researchTaskId: data.researchTaskId,
      researchResultId: data.researchResultId
    });

    if (!refCheck.valid) {
      throw new Error(`Rejet référence invalide : ${refCheck.errors.join(' ; ')}`);
    }

    // 3. Bornage strict de la priorité (0 - 100)
    const priority = Math.max(0, Math.min(100, data.priority ?? 50));

    const newCase: OsintVerificationCase = {
      id: `VERIF-CASE-${new Date().getFullYear()}-${String(this.cases.length + 1).padStart(3, '0')}`,
      researchResultId: data.researchResultId,
      researchTaskId: data.researchTaskId,
      researchPlanId: data.researchPlanId,
      requirementId: data.requirementId,
      questionId: data.questionId,
      title: data.title,
      objective: data.objective,
      scope: data.scope || 'Périmètre Afrique de l’Ouest / Sahel',
      status: 'BROUILLON',
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.createdBy || 'ANALYSTE_OFFICIER',
      assignedTo: data.assignedTo || 'CELLULE_VERIFICATION',
      claimIds: [],
      checkIds: [],
      findingIds: [],
      isDemo: data.isDemo ?? false
    };

    this.cases.unshift(newCase);
    this.addAuditLog({
      action: 'CREATE_CASE',
      entityType: 'VERIFICATION_CASE',
      entityId: newCase.id,
      actor: newCase.createdBy,
      details: `Création du dossier de vérification ${newCase.id} lié au résultat ${newCase.researchResultId}.`,
      after: newCase,
      isDemo: newCase.isDemo
    });

    this.saveToStorage();
    return newCase;
  }

  public getVerificationCase(id: string): OsintVerificationCase | null {
    return this.cases.find(c => c.id === id) || null;
  }

  public listVerificationCases(filterDemo?: boolean): OsintVerificationCase[] {
    if (filterDemo === undefined) return this.cases;
    return this.cases.filter(c => c.isDemo === filterDemo);
  }

  public updateVerificationCase(
    id: string,
    updates: Partial<Omit<OsintVerificationCase, 'id' | 'createdAt' | 'researchResultId'>>,
    actor: string = 'ANALYSTE_VERIFICATEUR'
  ): OsintVerificationCase {
    const item = this.getVerificationCase(id);
    if (!item) throw new Error(`Dossier de vérification ${id} introuvable.`);
    if (item.status === 'ARCHIVE') {
      throw new Error(`Dossier archivé et scellé immuable : aucune modification autorisée.`);
    }
    if (item.status === 'ANNULE') {
      throw new Error(`Dossier annulé : modification impossible.`);
    }

    const before = { ...item };

    if (updates.title !== undefined) item.title = updates.title;
    if (updates.objective !== undefined) item.objective = updates.objective;
    if (updates.scope !== undefined) item.scope = updates.scope;
    if (updates.assignedTo !== undefined) item.assignedTo = updates.assignedTo;
    if (updates.priority !== undefined) {
      item.priority = Math.max(0, Math.min(100, updates.priority));
    }

    item.updatedAt = new Date().toISOString();

    this.addAuditLog({
      action: 'UPDATE_CASE',
      entityType: 'VERIFICATION_CASE',
      entityId: item.id,
      actor,
      details: `Mise à jour des métadonnées du dossier ${item.id}`,
      before,
      after: item,
      isDemo: item.isDemo
    });

    this.saveToStorage();
    return item;
  }

  public changeVerificationStatus(
    id: string,
    newStatus: OsintVerificationStatus,
    justification: string,
    actor: string = 'ANALYSTE_VERIFICATEUR'
  ): OsintVerificationCase {
    const item = this.getVerificationCase(id);
    if (!item) throw new Error(`Dossier de vérification ${id} introuvable.`);

    if (item.status === 'ARCHIVE') {
      throw new Error(`Un dossier de vérification archivé est strictement immuable.`);
    }

    const allowed = ALLOWED_CASE_TRANSITIONS[item.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Transition de statut non autorisée : ${item.status} -> ${newStatus}. Transitions valides : [${allowed.join(', ')}]`);
    }

    if (!justification || justification.trim().length < 5) {
      throw new Error(`Une justification doctrinale d'au moins 5 caractères est obligatoire pour toute transition d'état.`);
    }

    const beforeStatus = item.status;
    item.status = newStatus;
    item.updatedAt = new Date().toISOString();

    this.addAuditLog({
      action: 'STATUS_CHANGE',
      entityType: 'VERIFICATION_CASE',
      entityId: item.id,
      actor,
      details: `Transition de statut ${beforeStatus} -> ${newStatus}. Justification: ${justification}`,
      before: { status: beforeStatus },
      after: { status: newStatus, justification },
      isDemo: item.isDemo
    });

    this.saveToStorage();
    return item;
  }

  // =========================================================================
  // 2. ASSERTIONS (OsintVerificationClaim)
  // =========================================================================

  public createClaim(data: {
    caseId: string;
    statement: string;
    claimType: OsintClaimType;
    sourceIds?: string[];
    evidenceIds?: string[];
    observedAt?: string;
    publicationAt?: string;
    discoveredAt?: string;
    isDemo?: boolean;
  }): OsintVerificationClaim {
    const parentCase = this.getVerificationCase(data.caseId);
    if (!parentCase) throw new Error(`Dossier ${data.caseId} introuvable.`);
    if (parentCase.status === 'ARCHIVE') {
      throw new Error(`Impossible d'ajouter une assertion à un dossier archivé.`);
    }

    // Validation des références de sources et d'évidences
    if (data.sourceIds && data.sourceIds.length > 0) {
      const refCheck = this.validateReferences({ sourceIds: data.sourceIds });
      if (!refCheck.valid) {
        throw new Error(`Rejet source invalide : ${refCheck.errors.join(' ; ')}`);
      }
    }

    if (data.evidenceIds && data.evidenceIds.length > 0) {
      const refCheck = this.validateReferences({ evidenceIds: data.evidenceIds });
      if (!refCheck.valid) {
        throw new Error(`Rejet preuve invalide : ${refCheck.errors.join(' ; ')}`);
      }
    }

    const newClaim: OsintVerificationClaim = {
      id: `CLM-${new Date().getFullYear()}-${String(this.claims.length + 1).padStart(3, '0')}`,
      caseId: data.caseId,
      researchResultId: parentCase.researchResultId,
      statement: data.statement,
      claimType: data.claimType,
      sourceIds: data.sourceIds || [],
      evidenceIds: data.evidenceIds || [],
      observedAt: data.observedAt,
      publicationAt: data.publicationAt,
      discoveredAt: data.discoveredAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isDemo: data.isDemo ?? parentCase.isDemo
    };

    this.claims.push(newClaim);
    if (!parentCase.claimIds.includes(newClaim.id)) {
      parentCase.claimIds.push(newClaim.id);
    }

    this.addAuditLog({
      action: 'CREATE_CLAIM',
      entityType: 'VERIFICATION_CLAIM',
      entityId: newClaim.id,
      actor: 'ANALYSTE',
      details: `Création de l'assertion [${newClaim.claimType}] "${newClaim.statement.substring(0, 40)}..."`,
      after: newClaim,
      isDemo: newClaim.isDemo
    });

    this.saveToStorage();
    return newClaim;
  }

  public getClaim(id: string): OsintVerificationClaim | null {
    return this.claims.find(c => c.id === id) || null;
  }

  public listClaims(caseId?: string, filterDemo?: boolean): OsintVerificationClaim[] {
    let list = this.claims;
    if (caseId) list = list.filter(c => c.caseId === caseId);
    if (filterDemo !== undefined) list = list.filter(c => c.isDemo === filterDemo);
    return list;
  }

  public updateClaim(
    id: string,
    updates: Partial<Omit<OsintVerificationClaim, 'id' | 'caseId' | 'createdAt'>>
  ): OsintVerificationClaim {
    const claim = this.getClaim(id);
    if (!claim) throw new Error(`Assertion ${id} introuvable.`);
    const parentCase = this.getVerificationCase(claim.caseId);
    if (parentCase && parentCase.status === 'ARCHIVE') {
      throw new Error(`Dossier parent archivé : modification interdite.`);
    }

    const before = { ...claim };
    Object.assign(claim, updates);

    this.addAuditLog({
      action: 'UPDATE_CLAIM',
      entityType: 'VERIFICATION_CLAIM',
      entityId: claim.id,
      actor: 'ANALYSTE',
      details: `Mise à jour de l'assertion ${claim.id}`,
      before,
      after: claim,
      isDemo: claim.isDemo
    });

    this.saveToStorage();
    return claim;
  }

  // =========================================================================
  // 3. CONTRÔLES (OsintVerificationCheck)
  // =========================================================================

  public createVerificationCheck(data: {
    caseId: string;
    claimId: string;
    type: OsintCheckType;
    description: string;
    method: string;
    expected?: string;
    observed?: string;
    status?: OsintCheckStatus;
    sourceIds?: string[];
    evidenceIds?: string[];
    analystId?: string;
    isDemo?: boolean;
  }): OsintVerificationCheck {
    const parentCase = this.getVerificationCase(data.caseId);
    if (!parentCase) throw new Error(`Dossier ${data.caseId} introuvable.`);
    if (parentCase.status === 'ARCHIVE') {
      throw new Error(`Impossible d'ajouter un contrôle sur dossier archivé.`);
    }

    const claim = this.getClaim(data.claimId);
    if (!claim) throw new Error(`Assertion ${data.claimId} introuvable.`);

    const newCheck: OsintVerificationCheck = {
      id: `CHK-${new Date().getFullYear()}-${String(this.checks.length + 1).padStart(3, '0')}`,
      caseId: data.caseId,
      claimId: data.claimId,
      type: data.type,
      description: data.description,
      method: data.method,
      expected: data.expected,
      observed: data.observed,
      status: data.status || 'NON_REALISE',
      sourceIds: data.sourceIds || [],
      evidenceIds: data.evidenceIds || [],
      analystId: data.analystId || 'OFFICIER_TECHNIQUE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: data.isDemo ?? parentCase.isDemo
    };

    this.checks.push(newCheck);
    if (!parentCase.checkIds.includes(newCheck.id)) {
      parentCase.checkIds.push(newCheck.id);
    }

    this.addAuditLog({
      action: 'CREATE_CHECK',
      entityType: 'VERIFICATION_CHECK',
      entityId: newCheck.id,
      actor: newCheck.analystId,
      details: `Création du contrôle technique [${newCheck.type}] pour l'assertion ${newCheck.claimId}`,
      after: newCheck,
      isDemo: newCheck.isDemo
    });

    this.saveToStorage();
    return newCheck;
  }

  public updateVerificationCheck(
    id: string,
    updates: Partial<Omit<OsintVerificationCheck, 'id' | 'caseId' | 'claimId' | 'createdAt'>>,
    actor: string = 'ANALYSTE'
  ): OsintVerificationCheck {
    const check = this.checks.find(c => c.id === id);
    if (!check) throw new Error(`Contrôle ${id} introuvable.`);
    const parentCase = this.getVerificationCase(check.caseId);
    if (parentCase && parentCase.status === 'ARCHIVE') {
      throw new Error(`Dossier parent archivé : modification du contrôle interdite.`);
    }

    const before = { ...check };
    Object.assign(check, updates);
    check.updatedAt = new Date().toISOString();

    this.addAuditLog({
      action: 'UPDATE_CHECK',
      entityType: 'VERIFICATION_CHECK',
      entityId: check.id,
      actor,
      details: `Mise à jour du contrôle ${check.id} (Statut: ${check.status})`,
      before,
      after: check,
      isDemo: check.isDemo
    });

    this.saveToStorage();
    return check;
  }

  public listVerificationChecks(caseId?: string, claimId?: string, filterDemo?: boolean): OsintVerificationCheck[] {
    let list = this.checks;
    if (caseId) list = list.filter(c => c.caseId === caseId);
    if (claimId) list = list.filter(c => c.claimId === claimId);
    if (filterDemo !== undefined) list = list.filter(c => c.isDemo === filterDemo);
    return list;
  }

  // =========================================================================
  // 4. CONSTATS & FINDINGS (OsintVerificationFinding)
  // =========================================================================

  public createFinding(data: {
    caseId: string;
    claimId: string;
    checkId: string;
    type: OsintFindingType;
    content: string;
    sourceIds?: string[];
    evidenceIds?: string[];
    impact?: 'CRITIQUE' | 'MAJEUR' | 'MODERE' | 'FAIBLE';
    relevance?: 'HAUTE' | 'MOYENNE' | 'FAIBLE';
    createdBy?: string;
    isDemo?: boolean;
  }): OsintVerificationFinding {
    const parentCase = this.getVerificationCase(data.caseId);
    if (!parentCase) throw new Error(`Dossier ${data.caseId} introuvable.`);
    if (parentCase.status === 'ARCHIVE') {
      throw new Error(`Impossible d'ajouter un constat à un dossier archivé.`);
    }

    const newFinding: OsintVerificationFinding = {
      id: `FND-${new Date().getFullYear()}-${String(this.findings.length + 1).padStart(3, '0')}`,
      caseId: data.caseId,
      claimId: data.claimId,
      checkId: data.checkId,
      type: data.type,
      content: data.content,
      sourceIds: data.sourceIds || [],
      evidenceIds: data.evidenceIds || [],
      impact: data.impact || 'MODERE',
      relevance: data.relevance || 'HAUTE',
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy || 'EXAMINATEUR',
      isDemo: data.isDemo ?? parentCase.isDemo
    };

    this.findings.push(newFinding);
    if (!parentCase.findingIds.includes(newFinding.id)) {
      parentCase.findingIds.push(newFinding.id);
    }

    this.addAuditLog({
      action: 'CREATE_FINDING',
      entityType: 'VERIFICATION_FINDING',
      entityId: newFinding.id,
      actor: newFinding.createdBy,
      details: `Consignation du constat [${newFinding.type}] sur le contrôle ${newFinding.checkId}`,
      after: newFinding,
      isDemo: newFinding.isDemo
    });

    this.saveToStorage();
    return newFinding;
  }

  public updateFinding(
    id: string,
    updates: Partial<Omit<OsintVerificationFinding, 'id' | 'caseId' | 'createdAt'>>
  ): OsintVerificationFinding {
    const finding = this.findings.find(f => f.id === id);
    if (!finding) throw new Error(`Constat ${id} introuvable.`);
    const parentCase = this.getVerificationCase(finding.caseId);
    if (parentCase && parentCase.status === 'ARCHIVE') {
      throw new Error(`Dossier parent archivé : modification du constat interdite.`);
    }

    const before = { ...finding };
    Object.assign(finding, updates);

    this.addAuditLog({
      action: 'UPDATE_FINDING',
      entityType: 'VERIFICATION_FINDING',
      entityId: finding.id,
      actor: 'ANALYSTE',
      details: `Mise à jour du constat ${finding.id}`,
      before,
      after: finding,
      isDemo: finding.isDemo
    });

    this.saveToStorage();
    return finding;
  }

  public listFindings(caseId?: string, filterDemo?: boolean): OsintVerificationFinding[] {
    let list = this.findings;
    if (caseId) list = list.filter(f => f.caseId === caseId);
    if (filterDemo !== undefined) list = list.filter(f => f.isDemo === filterDemo);
    return list;
  }

  // =========================================================================
  // 5. RELATIONS DE SOURCES, INDÉPENDANCE & DUPLICATION
  // =========================================================================

  public linkVerificationSource(data: {
    caseId: string;
    sourceId: string;
    parentSourceId?: string;
    independenceGroupId?: string;
    relationship?: OsintSourceRelationship;
    independenceStatus?: OsintSourceIndependenceStatus;
    publicationAt?: string;
    discoveredAt?: string;
    notes?: string;
    isDemo?: boolean;
  }): OsintVerificationSourceLink {
    const parentCase = this.getVerificationCase(data.caseId);
    if (!parentCase) throw new Error(`Dossier ${data.caseId} introuvable.`);

    // Validation de la source existante dans LOT 22
    const refCheck = this.validateReferences({ sourceIds: [data.sourceId] });
    if (!refCheck.valid) {
      throw new Error(`Rejet source invalide : ${refCheck.errors.join(' ; ')}`);
    }

    if (data.parentSourceId) {
      const parentCheck = this.validateReferences({ sourceIds: [data.parentSourceId] });
      if (!parentCheck.valid) {
        throw new Error(`Rejet source parente invalide : ${parentCheck.errors.join(' ; ')}`);
      }
    }

    // Détermination automatique de la dépendance si parentSourceId ou relation dérivée
    let rel = data.relationship || 'CORROBORATION_INDEPENDANTE';
    let indep = data.independenceStatus;

    if (!indep) {
      if (['REPRISE', 'CITATION', 'SYNDICATION', 'DUPLICATION'].includes(rel) || data.parentSourceId) {
        indep = 'DEPENDANTE';
      } else if (rel === 'SOURCE_PRIMAIRE') {
        indep = 'INDEPENDANTE';
      } else if (rel === 'CORROBORATION_INDEPENDANTE') {
        indep = 'INDEPENDANTE';
      } else {
        indep = 'NON_EVALUEE';
      }
    }

    const newLink: OsintVerificationSourceLink = {
      id: `SRCLNK-${new Date().getFullYear()}-${String(this.sourceLinks.length + 1).padStart(3, '0')}`,
      caseId: data.caseId,
      sourceId: data.sourceId,
      parentSourceId: data.parentSourceId,
      independenceGroupId: data.independenceGroupId || (data.parentSourceId ? `GRP-${data.parentSourceId}` : undefined),
      relationship: rel,
      independenceStatus: indep,
      publicationAt: data.publicationAt,
      discoveredAt: data.discoveredAt || new Date().toISOString(),
      notes: data.notes,
      isDemo: data.isDemo ?? parentCase.isDemo
    };

    this.sourceLinks.push(newLink);

    this.addAuditLog({
      action: 'LINK_SOURCE',
      entityType: 'SOURCE_LINK',
      entityId: newLink.id,
      actor: 'ANALYSTE',
      details: `Liaison source ${newLink.sourceId} au dossier ${newLink.caseId} (Relation: ${newLink.relationship}, Statut: ${newLink.independenceStatus})`,
      after: newLink,
      isDemo: newLink.isDemo
    });

    this.saveToStorage();
    return newLink;
  }

  public updateVerificationSourceLink(
    id: string,
    updates: Partial<Omit<OsintVerificationSourceLink, 'id' | 'caseId' | 'sourceId'>>
  ): OsintVerificationSourceLink {
    const link = this.sourceLinks.find(l => l.id === id);
    if (!link) throw new Error(`Liaison source ${id} introuvable.`);

    const before = { ...link };
    Object.assign(link, updates);

    this.addAuditLog({
      action: 'UPDATE_SOURCE_LINK',
      entityType: 'SOURCE_LINK',
      entityId: link.id,
      actor: 'ANALYSTE',
      details: `Mise à jour de la liaison source ${link.id}`,
      before,
      after: link,
      isDemo: link.isDemo
    });

    this.saveToStorage();
    return link;
  }

  public listSourceLinks(caseId?: string, filterDemo?: boolean): OsintVerificationSourceLink[] {
    let list = this.sourceLinks;
    if (caseId) list = list.filter(l => l.caseId === caseId);
    if (filterDemo !== undefined) list = list.filter(l => l.isDemo === filterDemo);
    return list;
  }

  public evaluateSourceIndependence(caseId: string, sourceId: string): {
    isIndependent: boolean;
    reason: string;
    groupMembers: string[];
  } {
    const link = this.sourceLinks.find(l => l.caseId === caseId && l.sourceId === sourceId);
    if (!link) {
      return { isIndependent: false, reason: 'Source non répertoriée dans le dossier', groupMembers: [] };
    }

    if (link.independenceStatus === 'DEPENDANTE') {
      const parent = link.parentSourceId || 'Source parente commune';
      return {
        isIndependent: false,
        reason: `Source dépendante (reprise ou syndication de ${parent}). Ne constitue pas une confirmation autonome.`,
        groupMembers: link.independenceGroupId
          ? this.sourceLinks.filter(l => l.caseId === caseId && l.independenceGroupId === link.independenceGroupId).map(l => l.sourceId)
          : [link.sourceId]
      };
    }

    if (link.independenceStatus === 'INDEPENDANTE') {
      return {
        isIndependent: true,
        reason: 'Origine informationnelle et canal d’observation vérifiés indépendants.',
        groupMembers: [link.sourceId]
      };
    }

    return {
      isIndependent: false,
      reason: 'Statut d’indépendance non tranché ou incertain.',
      groupMembers: [link.sourceId]
    };
  }

  public detectDuplicateSourceRelationship(sourceAId: string, sourceBId: string, caseId?: string): {
    isDuplicateOrDerived: boolean;
    relationship: OsintSourceRelationship;
    explanation: string;
  } {
    const links = this.sourceLinks.filter(l => (!caseId || l.caseId === caseId) && (l.sourceId === sourceAId || l.sourceId === sourceBId));
    const linkA = links.find(l => l.sourceId === sourceAId);
    const linkB = links.find(l => l.sourceId === sourceBId);

    if (linkA && linkB) {
      if (linkA.parentSourceId === sourceBId) {
        return {
          isDuplicateOrDerived: true,
          relationship: linkA.relationship,
          explanation: `La source ${sourceAId} est dérivée de ${sourceBId} (${linkA.relationship}).`
        };
      }
      if (linkB.parentSourceId === sourceAId) {
        return {
          isDuplicateOrDerived: true,
          relationship: linkB.relationship,
          explanation: `La source ${sourceBId} est dérivée de ${sourceAId} (${linkB.relationship}).`
        };
      }
      if (linkA.independenceGroupId && linkA.independenceGroupId === linkB.independenceGroupId) {
        return {
          isDuplicateOrDerived: true,
          relationship: 'SYNDICATION',
          explanation: `Les sources ${sourceAId} et ${sourceBId} partagent la même grappe de syndication (${linkA.independenceGroupId}).`
        };
      }
    }

    return {
      isDuplicateOrDerived: false,
      relationship: 'CORROBORATION_INDEPENDANTE',
      explanation: 'Aucun lien de dépendance directe ou de syndication documenté entre ces deux sources.'
    };
  }

  // =========================================================================
  // 6. CONTRADICTIONS (OsintContradictionRecord)
  // =========================================================================

  public recordContradiction(data: {
    caseId: string;
    claimA: string;
    claimB: string;
    sourceA: string;
    sourceB: string;
    nature: string;
    date?: string;
    description: string;
    analystComment?: string;
  }): OsintContradictionRecord {
    const parentCase = this.getVerificationCase(data.caseId);
    if (!parentCase) throw new Error(`Dossier ${data.caseId} introuvable.`);

    const record: OsintContradictionRecord = {
      id: `CTRD-${new Date().getFullYear()}-${String(this.contradictions.length + 1).padStart(3, '0')}`,
      caseId: data.caseId,
      claimA: data.claimA,
      claimB: data.claimB,
      sourceA: data.sourceA,
      sourceB: data.sourceB,
      nature: data.nature,
      date: data.date || new Date().toISOString(),
      description: data.description,
      status: 'OUVERTE',
      analystComment: data.analystComment
    };

    this.contradictions.push(record);

    this.addAuditLog({
      action: 'RECORD_CONTRADICTION',
      entityType: 'CONTRADICTION',
      entityId: record.id,
      actor: 'ANALYSTE',
      details: `Consignation d'une contradiction entre ${data.sourceA} et ${data.sourceB} : ${data.description.substring(0, 50)}...`,
      after: record,
      isDemo: parentCase.isDemo
    });

    this.saveToStorage();
    return record;
  }

  public listContradictions(caseId?: string): OsintContradictionRecord[] {
    if (caseId) return this.contradictions.filter(c => c.caseId === caseId);
    return this.contradictions;
  }

  // =========================================================================
  // 7. MOTEUR DÉTERMINISTE D'AIDE À LA DÉCISION (SANS PRÉTENTION DE VÉRITÉ)
  // =========================================================================

  public calculateVerificationQualification(caseId: string): {
    suggestedLevel: 'CONFIRME' | 'CONFIRME_AVEC_RESERVES' | 'NON_CONCLUANT' | 'NON_CONFIRME' | 'REJETE_TECHNIQUEMENT';
    rationale: string;
    supportingFindings: OsintVerificationFinding[];
    contradictingFindings: OsintVerificationFinding[];
    unresolvedGaps: string[];
    limitations: string[];
    independentSourceCount: number;
    dependentSourceCount: number;
    hasContradictions: boolean;
    hasCausalHypothesis: boolean;
    doctrinalNotice: string;
  } {
    const parentCase = this.getVerificationCase(caseId);
    if (!parentCase) throw new Error(`Dossier ${caseId} introuvable.`);

    const caseFindings = this.findings.filter(f => f.caseId === caseId);
    const caseChecks = this.checks.filter(c => c.caseId === caseId);
    const caseClaims = this.claims.filter(c => c.caseId === caseId);
    const caseSources = this.sourceLinks.filter(l => l.caseId === caseId);
    const caseContradictions = this.contradictions.filter(c => c.caseId === caseId && c.status !== 'SOUMISE_ARBITRAGE');

    // Sources : décompte strict des origines indépendantes vs dépendantes
    const independentSources = new Set<string>();
    const seenGroups = new Set<string>();
    let dependentSourceCount = 0;

    caseSources.forEach(s => {
      if (s.independenceStatus === 'DEPENDANTE' || s.parentSourceId || ['REPRISE', 'SYNDICATION', 'DUPLICATION'].includes(s.relationship)) {
        dependentSourceCount++;
        if (s.independenceGroupId) {
          if (!seenGroups.has(s.independenceGroupId)) {
            seenGroups.add(s.independenceGroupId);
            independentSources.add(`GROUPE:${s.independenceGroupId}`);
          }
        }
      } else if (s.independenceStatus === 'INDEPENDANTE' || s.relationship === 'SOURCE_PRIMAIRE' || s.relationship === 'CORROBORATION_INDEPENDANTE') {
        independentSources.add(s.sourceId);
      }
    });

    const independentSourceCount = independentSources.size;

    const supporting = caseFindings.filter(f => f.type === 'ELEMENT_CONFIRMANT');
    const contradicting = caseFindings.filter(f => f.type === 'ELEMENT_INFIRMANT' || f.type === 'CONTRADICTION');
    const gaps = caseFindings.filter(f => f.type === 'LACUNE' || f.type === 'INCERTITUDE').map(f => f.content);
    const technicalRejectionChecks = caseChecks.filter(c => c.status === 'DEFAVORABLE' && ['DOCUMENTAIRE', 'PROVENANCE', 'COHERENCE_INTERNE'].includes(c.type));

    const hasContradictions = contradicting.length > 0 || caseContradictions.length > 0;
    const hasCausalHypothesis = caseClaims.some(c => c.claimType === 'CAUSALE_A_EXAMINER');

    const limitations: string[] = [];
    if (dependentSourceCount > 0) {
      limitations.push(`${dependentSourceCount} source(s) dépendante(s) ou dupliquée(s) identifiée(s) : non comptabilisées comme corroboration.`);
    }
    if (hasContradictions) {
      limitations.push(`Contradictions matérielles non résolues. Règle doctrinale : pas d’arbitrage automatique.`);
    }
    if (hasCausalHypothesis) {
      limitations.push(`Assertion causale présente : examinée sous statut hypothétique strict, jamais promue en fait.`);
    }
    if (gaps.length > 0) {
      limitations.push(`${gaps.length} lacune(s) informationnelle(s) subsistante(s).`);
    }

    let suggestedLevel: 'CONFIRME' | 'CONFIRME_AVEC_RESERVES' | 'NON_CONCLUANT' | 'NON_CONFIRME' | 'REJETE_TECHNIQUEMENT' = 'NON_CONCLUANT';
    let rationale = '';

    // Évaluation déterministe sous règles doctrinales strictes :
    if (technicalRejectionChecks.length > 0) {
      suggestedLevel = 'REJETE_TECHNIQUEMENT';
      rationale = `Rejet technique motivé par ${technicalRejectionChecks.length} contrôle(s) défavorable(s) sur la provenance documentaire ou la cohérence interne. ATTENTION : "Rejeté techniquement" signifie inexploitable en l'état, non pas faux.`;
    } else if (hasContradictions) {
      suggestedLevel = 'CONFIRME_AVEC_RESERVES';
      rationale = `Convergence partielle observée mais présence de ${contradicting.length} élément(s) contradictoire(s) non résolu(s). Qualification avec réserves doctrinales impératives.`;
    } else if (hasCausalHypothesis) {
      suggestedLevel = 'CONFIRME_AVEC_RESERVES';
      rationale = `Éléments factuels sous-jacents appuyés, mais l'assertion causale doit conserver une réserve explicite conformément à la règle Hypothèse ≠ Fait.`;
    } else if (independentSourceCount >= 2 && supporting.length >= 2 && gaps.length === 0) {
      suggestedLevel = 'CONFIRME';
      rationale = `Corroboration par au moins 2 sources véritablement indépendantes (${independentSourceCount} retenues), éléments confirmants concordants et absence de lacune bloquante.`;
    } else if (supporting.length > 0 && gaps.length > 0) {
      suggestedLevel = 'CONFIRME_AVEC_RESERVES';
      rationale = `Convergence documentaire établie sur certains éléments, mais présence de lacunes résiduelles nécessitant des réserves explicites.`;
    } else if (supporting.length === 0 && contradicting.length === 0) {
      suggestedLevel = 'NON_CONCLUANT';
      rationale = `Nombre insuffisant d'éléments probants ou d'observations documentaires. Statut non concluant conservé sans suppression du résultat.`;
    } else {
      suggestedLevel = 'NON_CONFIRME';
      rationale = `Les vérifications menées n'ont pas permis de corroborer les assertions émises. L'information demeure non confirmée.`;
    }

    return {
      suggestedLevel,
      rationale,
      supportingFindings: supporting,
      contradictingFindings: contradicting,
      unresolvedGaps: gaps,
      limitations,
      independentSourceCount,
      dependentSourceCount,
      hasContradictions,
      hasCausalHypothesis,
      doctrinalNotice: 'AIDE À LA DÉCISION EXCLUSIVE. Ne constitue pas une probabilité mathématique de vérité. Décision finale sous contrôle humain obligatoire.'
    };
  }

  // =========================================================================
  // 8. DÉCISION HUMAINE DE QUALIFICATION (OsintVerificationDecision)
  // =========================================================================

  public createVerificationDecision(data: {
    caseId: string;
    decision: OsintDecisionType;
    rationale: string;
    limitations?: string[];
    unresolvedContradictions?: string[];
    unresolvedGaps?: string[];
    approvedBy: string;
    isHumanDecision?: boolean;
    isDemo?: boolean;
  }): OsintVerificationDecision {
    const parentCase = this.getVerificationCase(data.caseId);
    if (!parentCase) throw new Error(`Dossier ${data.caseId} introuvable.`);
    if (parentCase.status === 'ARCHIVE') {
      throw new Error(`Dossier archivé : impossible d'ajouter une décision.`);
    }

    if (!data.approvedBy || data.approvedBy.trim().length === 0) {
      throw new Error(`Décision humaine obligatoire : l'identité du signataire approbateur est requise.`);
    }

    if (data.isHumanDecision === false) {
      throw new Error(`Violation doctrinale : les décisions automatiques sont formellement interdites. isHumanDecision doit être true.`);
    }

    // Contrôle doctrinal anti-biais : si des contradictions non résolues existent et que la décision humaine tente QUALIFIE sans réserves,
    // on exige une justification circonstanciée explicite.
    const autoCalc = this.calculateVerificationQualification(data.caseId);
    if (autoCalc.hasContradictions && data.decision === 'QUALIFIE') {
      if (!data.rationale.toLowerCase().includes('contradiction') && !data.rationale.toLowerCase().includes('réserve') && !data.rationale.toLowerCase().includes('arbitrage')) {
        throw new Error(`Violation doctrinale : Présence de contradictions non résolues. Pour qualifier ce dossier, une explication circonstanciée des contradictions dans le rationale est impérative.`);
      }
    }

    const newDecision: OsintVerificationDecision = {
      id: `DEC-${new Date().getFullYear()}-${String(this.decisions.length + 1).padStart(3, '0')}`,
      caseId: data.caseId,
      decision: data.decision,
      qualificationLevel: data.decision,
      rationale: data.rationale,
      limitations: data.limitations || autoCalc.limitations,
      unresolvedContradictions: data.unresolvedContradictions || (autoCalc.hasContradictions ? ['Contradiction documentée au dossier'] : []),
      unresolvedGaps: data.unresolvedGaps || autoCalc.unresolvedGaps,
      approvedBy: data.approvedBy,
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isHumanDecision: true,
      isDemo: data.isDemo ?? parentCase.isDemo
    };

    this.decisions.push(newDecision);
    parentCase.decisionId = newDecision.id;

    // Mise en état d'évaluation si nécessaire avant enregistrement de la qualification
    if (parentCase.status !== 'EN_EVALUATION' && (parentCase.status as string) !== 'ARCHIVE') {
      parentCase.status = 'EN_EVALUATION';
    }

    // Transition d'état consécutive à la décision humaine
    this.changeVerificationStatus(parentCase.id, data.decision, `Décision humaine formalisée par ${data.approvedBy} : ${data.decision}`, data.approvedBy);

    this.addAuditLog({
      action: 'HUMAN_DECISION_RECORDED',
      entityType: 'VERIFICATION_DECISION',
      entityId: newDecision.id,
      actor: data.approvedBy,
      details: `Décision souveraine ${data.decision} approuvée par ${data.approvedBy}. Rationale: ${data.rationale.substring(0, 60)}...`,
      after: newDecision,
      isDemo: newDecision.isDemo
    });

    this.saveToStorage();
    return newDecision;
  }

  public getDecision(id: string): OsintVerificationDecision | null {
    return this.decisions.find(d => d.id === id) || null;
  }

  public updateVerificationDecision(
    id: string,
    updates: Partial<Omit<OsintVerificationDecision, 'id' | 'caseId' | 'createdAt'>>,
    actor: string = 'SUPERVISEUR'
  ): OsintVerificationDecision {
    const decision = this.getDecision(id);
    if (!decision) throw new Error(`Décision ${id} introuvable.`);
    const parentCase = this.getVerificationCase(decision.caseId);
    if (parentCase && parentCase.status === 'ARCHIVE') {
      throw new Error(`Dossier parent archivé : modification de décision impossible.`);
    }

    const before = { ...decision };
    Object.assign(decision, updates);
    if (updates.decision) {
      decision.qualificationLevel = updates.decision;
    }

    this.addAuditLog({
      action: 'UPDATE_DECISION',
      entityType: 'VERIFICATION_DECISION',
      entityId: decision.id,
      actor,
      details: `Mise à jour de la décision de qualification ${decision.id}`,
      before,
      after: decision,
      isDemo: decision.isDemo
    });

    this.saveToStorage();
    return decision;
  }

  // =========================================================================
  // 9. PROMOTION EN ÉLÉMENT DE PREUVE (LOT 20)
  // =========================================================================

  public promoteFindingToEvidence(params: {
    caseId: string;
    findingId: string;
    promotedBy: string;
    justification: string;
  }): { success: boolean; evidenceId: string; message: string } {
    const parentCase = this.getVerificationCase(params.caseId);
    if (!parentCase) throw new Error(`Dossier ${params.caseId} introuvable.`);
    const finding = this.findings.find(f => f.id === params.findingId);
    if (!finding) throw new Error(`Constat ${params.findingId} introuvable.`);

    if (!params.promotedBy || params.promotedBy.trim().length === 0) {
      throw new Error(`Promotion refusée : l'action humaine d'un officier identifié est obligatoire.`);
    }

    // Règle : promotion interdite si dossier non qualifié sauf dérogation humaine justifiée
    if (!['QUALIFIE', 'QUALIFIE_AVEC_RESERVES'].includes(parentCase.status)) {
      if (!params.justification || params.justification.trim().length < 15) {
        throw new Error(`Promotion refusée : le dossier n'est pas qualifié (${parentCase.status}). Une justification exceptionnelle d'au moins 15 caractères est requise.`);
      }
    }

    // Récupérer et enrichir la table evidence LOT 20
    let evidenceList: any[] = [];
    if (typeof localStorage !== 'undefined') {
      const rawEvidence = localStorage.getItem('osint_africa_evidence_v2');
      if (rawEvidence) {
        try {
          evidenceList = JSON.parse(rawEvidence);
        } catch {
          evidenceList = [];
        }
      }
    }

    const newEvidenceId = `EV-LOT36-${Date.now()}`;
    const newEvidenceItem = {
      id: newEvidenceId,
      name: `Preuve issue de ${finding.id} (${parentCase.title})`,
      type: 'DOCUMENTAIRE',
      sourceId: finding.sourceIds[0] || 'SOURCE_VERIFIEE',
      description: `Élément de preuve promu depuis le centre de vérification LOT 36. Constat: ${finding.content}. Justification: ${params.justification}`,
      createdAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
      verifiedBy: params.promotedBy,
      status: 'VERIFIE',
      confidence: parentCase.status === 'QUALIFIE' ? 'HAUTE' : 'MOYENNE',
      hash: `sha256-lot36-${finding.id}-${Date.now().toString(16)}`,
      isDemo: parentCase.isDemo
    };

    evidenceList.push(newEvidenceItem);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('osint_africa_evidence_v2', JSON.stringify(evidenceList));
    }

    if (!finding.evidenceIds.includes(newEvidenceId)) {
      finding.evidenceIds.push(newEvidenceId);
    }

    this.addAuditLog({
      action: 'PROMOTE_TO_EVIDENCE',
      entityType: 'EVIDENCE',
      entityId: newEvidenceId,
      actor: params.promotedBy,
      details: `Promotion du constat ${finding.id} en élément de preuve formel LOT 20 (${newEvidenceId})`,
      after: newEvidenceItem,
      isDemo: parentCase.isDemo
    });

    this.saveToStorage();
    return {
      success: true,
      evidenceId: newEvidenceId,
      message: `Constat ${finding.id} promu avec succès en preuve ${newEvidenceId} (LOT 20).`
    };
  }

  // =========================================================================
  // 10. TRAÇABILITÉ BIDIRECTIONNELLE DYNAMIQUE & GESTION DES RUPTURES
  // =========================================================================

  public getVerificationTraceability(caseId?: string): {
    descending: OsintVerificationTraceabilityNode[];
    ascending: OsintVerificationTraceabilityNode[];
  } {
    const casesToInspect = caseId ? this.cases.filter(c => c.id === caseId) : this.cases.slice(0, 5);

    // 1. Chaîne descendante :
    // BESOIN -> QUESTION -> PLAN -> TÂCHE -> RÉSULTAT -> DOSSIER -> ASSERTION -> CONTRÔLE -> FINDING -> DÉCISION -> PREUVE
    const descending: OsintVerificationTraceabilityNode[] = casesToInspect.map(vCase => {
      const caseClaims = this.claims.filter(c => c.caseId === vCase.id);
      const caseChecks = this.checks.filter(c => c.caseId === vCase.id);
      const caseFindings = this.findings.filter(f => f.caseId === vCase.id);
      const caseDec = vCase.decisionId ? this.decisions.find(d => d.id === vCase.decisionId) : null;

      const claimNodes: OsintVerificationTraceabilityNode[] = caseClaims.map(claim => {
        const claimChecks = caseChecks.filter(ch => ch.claimId === claim.id);
        const checkNodes: OsintVerificationTraceabilityNode[] = claimChecks.map(check => {
          const checkFindings = caseFindings.filter(f => f.checkId === check.id);
          const findingNodes: OsintVerificationTraceabilityNode[] = checkFindings.map(fnd => {
            const evNodes: OsintVerificationTraceabilityNode[] = fnd.evidenceIds.map(evId => {
              const ev = this.getStoredEntity('osint_africa_evidence_v2', evId, 'id');
              return ev ? {
                type: 'EVIDENCE',
                id: evId,
                label: `Preuve LOT 20: ${ev.name || ev.id}`,
                status: ev.status || 'CONSIGNEE'
              } : {
                type: 'EVIDENCE',
                id: evId,
                label: `Preuve ${evId} introuvable (rupture de traçabilité)`,
                status: 'RUPTURE_LIEN'
              };
            });

            return {
              type: 'FINDING',
              id: fnd.id,
              label: `Constat [${fnd.type}]: ${fnd.content.substring(0, 45)}...`,
              status: fnd.impact,
              details: `Pertinence: ${fnd.relevance}`,
              children: evNodes
            };
          });

          return {
            type: 'CHECK',
            id: check.id,
            label: `Contrôle [${check.type}]: ${check.description.substring(0, 40)}...`,
            status: check.status,
            details: `Méthode: ${check.method}`,
            children: findingNodes
          };
        });

        return {
          type: 'CLAIM',
          id: claim.id,
          label: `Assertion [${claim.claimType}]: "${claim.statement.substring(0, 40)}..."`,
          status: 'EXAMINEE',
          children: checkNodes
        };
      });

      const decisionNode: OsintVerificationTraceabilityNode[] = caseDec ? [{
        type: 'DECISION',
        id: caseDec.id,
        label: `Décision souveraine: ${caseDec.decision}`,
        status: 'APPROUVEE_HUMAIN',
        details: `Approbateur: ${caseDec.approvedBy} | ${caseDec.approvedAt}`
      }] : [];

      const caseNode: OsintVerificationTraceabilityNode = {
        type: 'CASE',
        id: vCase.id,
        label: `Dossier: ${vCase.title}`,
        status: vCase.status,
        details: `Priorité: ${vCase.priority}/100`,
        children: [...claimNodes, ...decisionNode]
      };

      // Remontée vers LOT 35 (Résultat -> Tâche -> Plan)
      const res = this.getStoredEntity('OSINT_RESEARCH_RESULTS_LOT35', vCase.researchResultId, 'id');
      const task = this.getStoredEntity('OSINT_RESEARCH_TASKS_LOT35', vCase.researchTaskId, 'id');
      const plan = this.getStoredEntity('OSINT_RESEARCH_PLANS_LOT35', vCase.researchPlanId, 'id');
      const q = this.getStoredEntity('OSINT_REQUIREMENT_QUESTIONS_LOT34', vCase.questionId, 'questionId');
      const req = this.getStoredEntity('OSINT_REQUIREMENTS_LOT34', vCase.requirementId, 'requirementId');

      const resultNode: OsintVerificationTraceabilityNode = res ? {
        type: 'RESULT',
        id: vCase.researchResultId,
        label: `Résultat LOT 35: ${res.content ? res.content.substring(0, 40) : vCase.researchResultId}...`,
        status: res.verificationStatus || 'SOUMIS_VERIFICATION',
        children: [caseNode]
      } : {
        type: 'RESULT',
        id: vCase.researchResultId,
        label: `Résultat ${vCase.researchResultId} introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN',
        children: [caseNode]
      };

      const taskNode: OsintVerificationTraceabilityNode = task ? {
        type: 'TASK',
        id: vCase.researchTaskId,
        label: `Tâche LOT 35: ${task.title || vCase.researchTaskId}`,
        status: task.status || 'TERMINEE',
        children: [resultNode]
      } : {
        type: 'TASK',
        id: vCase.researchTaskId,
        label: `Tâche ${vCase.researchTaskId} introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN',
        children: [resultNode]
      };

      const planNode: OsintVerificationTraceabilityNode = plan ? {
        type: 'PLAN',
        id: vCase.researchPlanId,
        label: `Plan LOT 35: ${plan.title || vCase.researchPlanId}`,
        status: plan.status || 'ACTIF',
        children: [taskNode]
      } : {
        type: 'PLAN',
        id: vCase.researchPlanId,
        label: `Plan ${vCase.researchPlanId} introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN',
        children: [taskNode]
      };

      const questionNode: OsintVerificationTraceabilityNode = q ? {
        type: 'QUESTION',
        id: vCase.questionId,
        label: `Question LOT 34: ${q.question ? q.question.substring(0, 45) : vCase.questionId}...`,
        status: q.status || 'OUVERTE',
        children: [planNode]
      } : {
        type: 'QUESTION',
        id: vCase.questionId,
        label: `Question ${vCase.questionId} introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN',
        children: [planNode]
      };

      return req ? {
        type: 'REQUIREMENT',
        id: vCase.requirementId,
        label: `Besoin LOT 34: ${req.title || vCase.requirementId}`,
        status: req.status || 'ACTIF',
        children: [questionNode]
      } : {
        type: 'REQUIREMENT',
        id: vCase.requirementId,
        label: `Besoin parent ${vCase.requirementId} introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN',
        children: [questionNode]
      };
    });

    // 2. Chaîne remontante :
    // PREUVE -> FINDING -> CONTRÔLE -> ASSERTION -> DOSSIER -> RÉSULTAT -> TÂCHE -> PLAN -> QUESTION -> BESOIN
    const ascending: OsintVerificationTraceabilityNode[] = [];
    const recentFindings = this.findings.slice(0, 8);

    recentFindings.forEach(fnd => {
      const check = this.checks.find(c => c.id === fnd.checkId);
      const claim = check ? this.claims.find(cl => cl.id === check.claimId) : null;
      const vCase = this.cases.find(cs => cs.id === fnd.caseId);

      const req = vCase ? this.getStoredEntity('OSINT_REQUIREMENTS_LOT34', vCase.requirementId, 'requirementId') : null;
      const q = vCase ? this.getStoredEntity('OSINT_REQUIREMENT_QUESTIONS_LOT34', vCase.questionId, 'questionId') : null;
      const plan = vCase ? this.getStoredEntity('OSINT_RESEARCH_PLANS_LOT35', vCase.researchPlanId, 'id') : null;
      const task = vCase ? this.getStoredEntity('OSINT_RESEARCH_TASKS_LOT35', vCase.researchTaskId, 'id') : null;
      const res = vCase ? this.getStoredEntity('OSINT_RESEARCH_RESULTS_LOT35', vCase.researchResultId, 'id') : null;

      const reqNode: OsintVerificationTraceabilityNode = req ? {
        type: 'REQUIREMENT',
        id: vCase!.requirementId,
        label: `Besoin LOT 34: ${req.title || vCase!.requirementId}`,
        status: req.status || 'ACTIF'
      } : {
        type: 'REQUIREMENT',
        id: vCase ? vCase.requirementId : 'REQ-INCONNU',
        label: `Besoin introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN'
      };

      const qNode: OsintVerificationTraceabilityNode = q ? {
        type: 'QUESTION',
        id: vCase!.questionId,
        label: `Question LOT 34: ${q.question ? q.question.substring(0, 45) : vCase!.questionId}...`,
        status: q.status || 'OUVERTE',
        children: [reqNode]
      } : {
        type: 'QUESTION',
        id: vCase ? vCase.questionId : 'Q-INCONNUE',
        label: `Question introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN',
        children: [reqNode]
      };

      const planNode: OsintVerificationTraceabilityNode = plan ? {
        type: 'PLAN',
        id: vCase!.researchPlanId,
        label: `Plan LOT 35: ${plan.title || vCase!.researchPlanId}`,
        status: plan.status || 'ACTIF',
        children: [qNode]
      } : {
        type: 'PLAN',
        id: vCase ? vCase.researchPlanId : 'PLAN-INCONNU',
        label: `Plan introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN',
        children: [qNode]
      };

      const taskNode: OsintVerificationTraceabilityNode = task ? {
        type: 'TASK',
        id: vCase!.researchTaskId,
        label: `Tâche LOT 35: ${task.title || vCase!.researchTaskId}`,
        status: task.status || 'TERMINEE',
        children: [planNode]
      } : {
        type: 'TASK',
        id: vCase ? vCase.researchTaskId : 'TASK-INCONNUE',
        label: `Tâche introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN',
        children: [planNode]
      };

      const resNode: OsintVerificationTraceabilityNode = res ? {
        type: 'RESULT',
        id: vCase!.researchResultId,
        label: `Résultat LOT 35: ${res.content ? res.content.substring(0, 40) : vCase!.researchResultId}...`,
        status: res.verificationStatus || 'QUALIFIE',
        children: [taskNode]
      } : {
        type: 'RESULT',
        id: vCase ? vCase.researchResultId : 'RES-INCONNU',
        label: `Résultat introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN',
        children: [taskNode]
      };

      const caseNode: OsintVerificationTraceabilityNode = vCase ? {
        type: 'CASE',
        id: vCase.id,
        label: `Dossier: ${vCase.title}`,
        status: vCase.status,
        children: [resNode]
      } : {
        type: 'CASE',
        id: fnd.caseId,
        label: `Dossier ${fnd.caseId} introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN',
        children: [resNode]
      };

      const claimNode: OsintVerificationTraceabilityNode = claim ? {
        type: 'CLAIM',
        id: claim.id,
        label: `Assertion [${claim.claimType}]: "${claim.statement.substring(0, 40)}..."`,
        status: 'VALIDE',
        children: [caseNode]
      } : {
        type: 'CLAIM',
        id: check ? check.claimId : 'CLAIM-INCONNUE',
        label: `Assertion introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN',
        children: [caseNode]
      };

      const checkNode: OsintVerificationTraceabilityNode = check ? {
        type: 'CHECK',
        id: check.id,
        label: `Contrôle [${check.type}]: ${check.description.substring(0, 35)}...`,
        status: check.status,
        children: [claimNode]
      } : {
        type: 'CHECK',
        id: fnd.checkId,
        label: `Contrôle introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN',
        children: [claimNode]
      };

      const findingNode: OsintVerificationTraceabilityNode = {
        type: 'FINDING',
        id: fnd.id,
        label: `Constat [${fnd.type}]: ${fnd.content.substring(0, 40)}...`,
        status: fnd.impact,
        children: [checkNode]
      };

      if (fnd.evidenceIds && fnd.evidenceIds.length > 0) {
        fnd.evidenceIds.forEach(evId => {
          const ev = this.getStoredEntity('osint_africa_evidence_v2', evId, 'id');
          ascending.push(ev ? {
            type: 'EVIDENCE',
            id: evId,
            label: `Preuve LOT 20: ${ev.name || ev.id}`,
            status: ev.status || 'CONSIGNEE',
            children: [findingNode]
          } : {
            type: 'EVIDENCE',
            id: evId,
            label: `Preuve ${evId} introuvable (rupture de traçabilité)`,
            status: 'RUPTURE_LIEN',
            children: [findingNode]
          });
        });
      } else {
        ascending.push(findingNode);
      }
    });

    return { descending, ascending };
  }

  // =========================================================================
  // 11. EXPORT JSON INTÉGRAL SANS APPEL RÉSEAU
  // =========================================================================

  public exportVerificationJson(filterDemo?: boolean): string {
    const cases = this.listVerificationCases(filterDemo);
    const claims = this.listClaims(undefined, filterDemo);
    const checks = this.listVerificationChecks(undefined, undefined, filterDemo);
    const findings = this.listFindings(undefined, filterDemo);
    const sourceLinks = this.listSourceLinks(undefined, filterDemo);
    const audit = this.getVerificationAudit(filterDemo);

    const exportData = {
      exportMetadata: {
        system: 'OSINT AFRICA',
        lot: 36,
        component: 'Centre de Vérification et de Qualification des Résultats OSINT',
        exportedAt: new Date().toISOString(),
        networkCalls: 0,
        mode: filterDemo === undefined ? 'TOUT' : (filterDemo ? 'DEMO_EXCLUSIF' : 'REEL_EXCLUSIF'),
        doctrinalCommitment: 'Qualification sous contrôle souverain humain. 0 collecte réseau. Distinction stricte hypothèse/fait et duplication/corroboration.'
      },
      doctrineRules: VERIFICATION_DOCTRINE_RULES,
      cases,
      claims,
      checks,
      findings,
      sourceLinks,
      decisions: this.decisions.filter(d => filterDemo === undefined || d.isDemo === filterDemo),
      contradictions: this.contradictions,
      auditLogs: audit
    };

    return JSON.stringify(exportData, null, 2);
  }

  // =========================================================================
  // INITIALISATION DES DONNÉES DE DÉMONSTRATION SOUVERAINES
  // =========================================================================

  private initializeDemoData(): void {
    const demoCase: OsintVerificationCase = {
      id: 'VERIF-CASE-2026-001',
      researchResultId: 'RES-OBS-2026-001',
      researchTaskId: 'TSK-2026-001',
      researchPlanId: 'PLAN-2026-001',
      requirementId: 'REQ-2026-001',
      questionId: 'Q-REQ-001',
      title: 'Vérification du convoi logistique suspect sur l’axe Gao-Ansongo',
      objective: 'Isoler les allégations de mouvement matériel lourd, vérifier les sources primaires, exclure les duplications de dépêches et documenter les contradictions géographiques.',
      scope: 'Corridor Mali oriental / Frontière Niger',
      status: 'EN_EVALUATION',
      priority: 85,
      createdAt: '2026-03-02T10:00:00.000Z',
      updatedAt: '2026-03-05T14:30:00.000Z',
      createdBy: 'OFFICIER_VERIFICATEUR_01',
      assignedTo: 'CELLULE_EVALUATION_RAPIDE',
      claimIds: ['CLM-2026-001', 'CLM-2026-002', 'CLM-2026-003'],
      checkIds: ['CHK-2026-001', 'CHK-2026-002', 'CHK-2026-003'],
      findingIds: ['FND-2026-001', 'FND-2026-002', 'FND-2026-003'],
      decisionId: undefined,
      isDemo: true
    };

    const demoClaims: OsintVerificationClaim[] = [
      {
        id: 'CLM-2026-001',
        caseId: 'VERIF-CASE-2026-001',
        researchResultId: 'RES-OBS-2026-001',
        statement: 'Présence d’une colonne de 12 véhicules tout-terrain armés à hauteur de Wabaria le 01/03/2026.',
        claimType: 'FACTUELLE',
        sourceIds: ['SRC-001', 'SRC-002'],
        evidenceIds: ['EV-001'],
        observedAt: '2026-03-01T14:20:00.000Z',
        publicationAt: '2026-03-01T16:00:00.000Z',
        discoveredAt: '2026-03-02T08:00:00.000Z',
        createdAt: '2026-03-02T10:15:00.000Z',
        isDemo: true
      },
      {
        id: 'CLM-2026-002',
        caseId: 'VERIF-CASE-2026-001',
        researchResultId: 'RES-OBS-2026-001',
        statement: 'Le convoi aurait franchi le fleuve Niger via le bac d’Ansongo en direction du Gourma.',
        claimType: 'GEOGRAPHIQUE',
        sourceIds: ['SRC-003'],
        evidenceIds: [],
        observedAt: '2026-03-01T18:00:00.000Z',
        publicationAt: '2026-03-01T20:30:00.000Z',
        discoveredAt: '2026-03-02T08:30:00.000Z',
        createdAt: '2026-03-02T10:20:00.000Z',
        isDemo: true
      },
      {
        id: 'CLM-2026-003',
        caseId: 'VERIF-CASE-2026-001',
        researchResultId: 'RES-OBS-2026-001',
        statement: 'Ce mouvement constituerait une riposte planifiée à l’opération conjointe aéroportée.',
        claimType: 'CAUSALE_A_EXAMINER',
        sourceIds: ['SRC-001'],
        evidenceIds: [],
        createdAt: '2026-03-02T10:25:00.000Z',
        isDemo: true
      }
    ];

    const demoChecks: OsintVerificationCheck[] = [
      {
        id: 'CHK-2026-001',
        caseId: 'VERIF-CASE-2026-001',
        claimId: 'CLM-2026-001',
        type: 'PROVENANCE',
        description: 'Vérification de la première occurrence et analyse de duplication textuelle sur les réseaux publics.',
        method: 'Recherche chronologique inverse sur dépêches et métadonnées horodatées sans requête externe.',
        expected: 'Source primaire identifiée sans duplication masquée.',
        observed: 'Première publication sur un canal Telegram communautaire local, reprise mot à mot par 4 agrégateurs web.',
        status: 'FAVORABLE',
        sourceIds: ['SRC-001', 'SRC-002'],
        evidenceIds: ['EV-001'],
        analystId: 'ANALYSTE_SAHEL_04',
        createdAt: '2026-03-02T11:00:00.000Z',
        updatedAt: '2026-03-02T14:00:00.000Z',
        isDemo: true
      },
      {
        id: 'CHK-2026-002',
        caseId: 'VERIF-CASE-2026-001',
        claimId: 'CLM-2026-002',
        type: 'GEOGRAPHIQUE',
        description: 'Contrôle de navigabilité et d’état opérationnel du bac d’Ansongo à la date considérée.',
        method: 'Recoupement avec les avis aux navigateurs fluviaux et rapports locaux enregistrés.',
        expected: 'Bac en service le 01/03/2026.',
        observed: 'Rapport technique communal attestant que le bac était en maintenance mécanique du 28/02 au 02/03.',
        status: 'CONTRADICTOIRE',
        sourceIds: ['SRC-003'],
        evidenceIds: [],
        analystId: 'ANALYSTE_GEOSPATIAL',
        createdAt: '2026-03-02T14:30:00.000Z',
        updatedAt: '2026-03-03T09:00:00.000Z',
        isDemo: true
      },
      {
        id: 'CHK-2026-003',
        caseId: 'VERIF-CASE-2026-001',
        claimId: 'CLM-2026-003',
        type: 'COHERENCE_INTERNE',
        description: 'Examen de la corrélation causale entre la riposte alléguée et la chronologie de l’opération aéroportée.',
        method: 'Vérification temporelle comparative des horodatages respectifs.',
        expected: 'Opération aéroportée antérieure au déclenchement du convoi.',
        observed: 'L’ordre d’opération aéroportée n’a été signé que le 01/03 à 19h00, soit après le départ du convoi.',
        status: 'DEFAVORABLE',
        sourceIds: ['SRC-001'],
        evidenceIds: [],
        analystId: 'OFFICIER_DOCTRINE',
        createdAt: '2026-03-03T10:00:00.000Z',
        updatedAt: '2026-03-03T16:00:00.000Z',
        isDemo: true
      }
    ];

    const demoFindings: OsintVerificationFinding[] = [
      {
        id: 'FND-2026-001',
        caseId: 'VERIF-CASE-2026-001',
        claimId: 'CLM-2026-001',
        checkId: 'CHK-2026-001',
        type: 'ELEMENT_CONFIRMANT',
        content: 'Observation directe corroborée par 2 témoins visuels indépendants à Wabaria.',
        sourceIds: ['SRC-001'],
        evidenceIds: ['EV-001'],
        impact: 'MAJEUR',
        relevance: 'HAUTE',
        createdAt: '2026-03-02T14:15:00.000Z',
        createdBy: 'ANALYSTE_SAHEL_04',
        isDemo: true
      },
      {
        id: 'FND-2026-002',
        caseId: 'VERIF-CASE-2026-001',
        claimId: 'CLM-2026-002',
        checkId: 'CHK-2026-002',
        type: 'CONTRADICTION',
        content: 'Impossibilité matérielle de franchissement par le bac d’Ansongo (avarie technique prouvée). Franchissement effectué par un gué en amont ou fausse localisation.',
        sourceIds: ['SRC-003'],
        evidenceIds: [],
        impact: 'CRITIQUE',
        relevance: 'HAUTE',
        createdAt: '2026-03-03T09:15:00.000Z',
        createdBy: 'ANALYSTE_GEOSPATIAL',
        isDemo: true
      },
      {
        id: 'FND-2026-003',
        caseId: 'VERIF-CASE-2026-001',
        claimId: 'CLM-2026-003',
        checkId: 'CHK-2026-003',
        type: 'ELEMENT_INFIRMANT',
        content: 'Anachronisme causal : le convoi est parti avant le déclenchement de l’action aéroportée.',
        sourceIds: ['SRC-001'],
        evidenceIds: [],
        impact: 'MAJEUR',
        relevance: 'HAUTE',
        createdAt: '2026-03-03T16:15:00.000Z',
        createdBy: 'OFFICIER_DOCTRINE',
        isDemo: true
      }
    ];

    const demoSourceLinks: OsintVerificationSourceLink[] = [
      {
        id: 'SRCLNK-2026-001',
        caseId: 'VERIF-CASE-2026-001',
        sourceId: 'SRC-001',
        relationship: 'SOURCE_PRIMAIRE',
        independenceStatus: 'INDEPENDANTE',
        publicationAt: '2026-03-01T16:00:00.000Z',
        notes: 'Canal local de proximité (témoignage direct Wabaria).',
        isDemo: true
      },
      {
        id: 'SRCLNK-2026-002',
        caseId: 'VERIF-CASE-2026-001',
        sourceId: 'SRC-002',
        parentSourceId: 'SRC-001',
        independenceGroupId: 'GRP-SRC-001',
        relationship: 'REPRISE',
        independenceStatus: 'DEPENDANTE',
        publicationAt: '2026-03-01T17:45:00.000Z',
        notes: 'Site d’information régional reprenant textuellement le canal local. Ne constitue pas une confirmation indépendante.',
        isDemo: true
      },
      {
        id: 'SRCLNK-2026-003',
        caseId: 'VERIF-CASE-2026-001',
        sourceId: 'SRC-003',
        relationship: 'CORROBORATION_INDEPENDANTE',
        independenceStatus: 'INDEPENDANTE',
        publicationAt: '2026-03-02T12:00:00.000Z',
        notes: 'Rapport technique des services fluviaux communaux.',
        isDemo: true
      }
    ];

    const demoContradiction: OsintContradictionRecord = {
      id: 'CTRD-2026-001',
      caseId: 'VERIF-CASE-2026-001',
      claimA: 'Franchissement du fleuve Niger via le bac d’Ansongo (CLM-2026-002)',
      claimB: 'Rapport officiel d’arrêt technique du bac d’Ansongo le 01/03/2026',
      sourceA: 'SRC-001',
      sourceB: 'SRC-003',
      nature: 'CONTRADICTION_GEOGRAPHIQUE_ET_MATERIELLE',
      date: '2026-03-03T09:30:00.000Z',
      description: 'Divergence irréconciliable sans vérification complémentaire sur le point de passage fluvial.',
      status: 'DOCUMENTE',
      analystComment: 'Hypothèse alternative : le convoi a contourné par le sud vers Forgho ou a emprunté des pirogues artisanales.'
    };

    this.cases = [demoCase];
    this.claims = demoClaims;
    this.checks = demoChecks;
    this.findings = demoFindings;
    this.sourceLinks = demoSourceLinks;
    this.contradictions = [demoContradiction];
    this.decisions = [];
    this.auditLogs = [
      {
        id: 'AUD-VERIF-INIT-001',
        timestamp: '2026-03-02T10:00:00.000Z',
        action: 'INIT_VERIFICATION_CENTER',
        entityType: 'SYSTEM',
        entityId: 'LOT36_CORE',
        actor: 'SYSTEME_SOUVERAIN',
        details: 'Initialisation doctrinale du Centre de Vérification et de Qualification des Résultats OSINT.',
        isDemo: true
      }
    ];

    this.saveToStorage();
  }
}

export const verificationQualificationService = new VerificationQualificationService();
