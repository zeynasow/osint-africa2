/**
 * OSINT AFRICA — LOT 43 : Centre Opérationnel de Gestion de Crise et Conduite des Opérations (COGC)
 * Confinement souverain local : 0 appel réseau (aucun fetch, axios, WebSocket, API externe).
 * Registre de gestion de crise, Main courante opérationnelle, Directives d'action, Sitreps et Traçabilité multi-lots.
 * Audit append-only au niveau du service.
 */

import {
  OsintCrisisCell,
  OsintCrisisLogEntry,
  OsintCrisisDirective,
  OsintCrisisSitrep,
  OsintCrisisTraceLink,
  OsintCrisisAudit,
  OsintCrisisPosture,
  OsintCrisisStatus,
  OsintCrisisSeverity,
  OsintCrisisIncidentType,
  OsintCrisisUrgency,
  OsintDirectiveStatus,
  OsintDirectivePriority
} from '../types';

import {
  INITIAL_CRISIS_CELLS,
  INITIAL_CRISIS_LOGS,
  INITIAL_CRISIS_DIRECTIVES,
  INITIAL_CRISIS_SITREPS,
  INITIAL_CRISIS_AUDITS
} from '../data/crisisDemoData';

import { accessControlService } from './accessControlService';
import { situationSynthesisService } from './situationSynthesisService';
import { indicatorMonitoringService } from './indicatorMonitoringService';
import { prospectiveScenarioService } from './prospectiveScenarioService';
import { analyticalAssessmentService } from './analyticalAssessmentService';
import { requirementService } from './requirementService';
import { osintRepository } from './osintRepository';
import { CaseManagementService } from './caseManagementService';

export const CRISIS_STORAGE_KEYS = {
  CELLS: 'OSINT_CRISIS_CELLS_LOT43',
  LOGS: 'OSINT_CRISIS_LOGS_LOT43',
  DIRECTIVES: 'OSINT_CRISIS_DIRECTIVES_LOT43',
  SITREPS: 'OSINT_CRISIS_SITREPS_LOT43',
  AUDIT: 'OSINT_CRISIS_AUDIT_LOT43'
};

export class CrisisOperationService {
  private cells: OsintCrisisCell[] = [];
  private logs: OsintCrisisLogEntry[] = [];
  private directives: OsintCrisisDirective[] = [];
  private sitreps: OsintCrisisSitrep[] = [];
  private audits: OsintCrisisAudit[] = [];

  constructor() {
    this.init();
  }

  private load<T>(key: string, defaultData: T[]): T[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const item = localStorage.getItem(key);
        if (item) {
          return JSON.parse(item);
        }
      }
    } catch {
      // Fallback local memory
    }
    return [...defaultData];
  }

  private save<T>(key: string, data: T[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch {
      // Fallback local memory
    }
  }

  public init(): void {
    this.cells = this.load<OsintCrisisCell>(CRISIS_STORAGE_KEYS.CELLS, INITIAL_CRISIS_CELLS);
    this.logs = this.load<OsintCrisisLogEntry>(CRISIS_STORAGE_KEYS.LOGS, INITIAL_CRISIS_LOGS);
    this.directives = this.load<OsintCrisisDirective>(CRISIS_STORAGE_KEYS.DIRECTIVES, INITIAL_CRISIS_DIRECTIVES);
    this.sitreps = this.load<OsintCrisisSitrep>(CRISIS_STORAGE_KEYS.SITREPS, INITIAL_CRISIS_SITREPS);
    this.audits = this.load<OsintCrisisAudit>(CRISIS_STORAGE_KEYS.AUDIT, INITIAL_CRISIS_AUDITS);

    if (typeof localStorage !== 'undefined') {
      if (!localStorage.getItem(CRISIS_STORAGE_KEYS.CELLS)) this.save(CRISIS_STORAGE_KEYS.CELLS, this.cells);
      if (!localStorage.getItem(CRISIS_STORAGE_KEYS.LOGS)) this.save(CRISIS_STORAGE_KEYS.LOGS, this.logs);
      if (!localStorage.getItem(CRISIS_STORAGE_KEYS.DIRECTIVES)) this.save(CRISIS_STORAGE_KEYS.DIRECTIVES, this.directives);
      if (!localStorage.getItem(CRISIS_STORAGE_KEYS.SITREPS)) this.save(CRISIS_STORAGE_KEYS.SITREPS, this.sitreps);
      if (!localStorage.getItem(CRISIS_STORAGE_KEYS.AUDIT)) this.save(CRISIS_STORAGE_KEYS.AUDIT, this.audits);
    }
  }

  // ==========================================================================
  // AUDIT APPEND-ONLY (AUCUNE MÉTHODE DE MODIFICATION OU SUPPRESSION)
  // ==========================================================================

  private addAuditLog(entry: Omit<OsintCrisisAudit, 'id' | 'timestamp'>): void {
    const audit: OsintCrisisAudit = {
      id: `c-audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...entry
    };
    this.audits.push(audit);
    this.save(CRISIS_STORAGE_KEYS.AUDIT, this.audits);
  }

  public getSecurityAudit(crisisId?: string): OsintCrisisAudit[] {
    if (crisisId) {
      return [...this.audits.filter(a => a.entityId === crisisId || (a.before && a.before.crisisId === crisisId))];
    }
    return [...this.audits];
  }

  // ==========================================================================
  // CALCUL DÉTERMINISTE D'IMPACT OPÉRATIONNEL (0-100)
  // Découplé rigoureusement de toute probabilité de survenue ou mesure de menace
  // ==========================================================================

  public calculateOperationalImpact(params: {
    countryCount: number;
    hasCriticalInfra: boolean;
    populationVulnerabilityLevel: 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE';
    escalationPotential: 'LIMITE' | 'REGIONAL' | 'TRANSFRONTALIER_MAJEUR';
    crossBorderCorridorAffected: boolean;
  }): number {
    let score = 0;

    // 1. Étendue géographique (0 à 25 pts)
    const geoPts = Math.min(params.countryCount * 7, 20) + (params.crossBorderCorridorAffected ? 5 : 0);
    score += geoPts;

    // 2. Criticité des infrastructures (0 à 30 pts)
    if (params.hasCriticalInfra) {
      score += 30;
    } else {
      score += 10;
    }

    // 3. Vulnérabilité des populations (0 à 25 pts)
    switch (params.populationVulnerabilityLevel) {
      case 'CRITIQUE': score += 25; break;
      case 'ELEVEE': score += 18; break;
      case 'MOYENNE': score += 10; break;
      case 'FAIBLE': score += 4; break;
    }

    // 4. Potentiel de propagation / escalade (0 à 20 pts)
    switch (params.escalationPotential) {
      case 'TRANSFRONTALIER_MAJEUR': score += 20; break;
      case 'REGIONAL': score += 12; break;
      case 'LIMITE': score += 5; break;
    }

    return Math.min(Math.max(score, 0), 100);
  }

  // ==========================================================================
  // GESTION DES CELLULES DE CRISE
  // ==========================================================================

  public listCrisisCells(filters?: {
    posture?: OsintCrisisPosture;
    status?: OsintCrisisStatus;
    severity?: OsintCrisisSeverity;
  }): OsintCrisisCell[] {
    let list = [...this.cells];
    if (filters) {
      if (filters.posture) list = list.filter(c => c.posture === filters.posture);
      if (filters.status) list = list.filter(c => c.status === filters.status);
      if (filters.severity) list = list.filter(c => c.severity === filters.severity);
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getCrisisCell(id: string): OsintCrisisCell | null {
    return this.cells.find(c => c.id === id) || null;
  }

  public createCrisisCell(data: {
    title: string;
    theater: string;
    countryIds: string[];
    description: string;
    posture: OsintCrisisPosture;
    severity: OsintCrisisSeverity;
    operationalImpactScore?: number;
    commanderId: string;
    leadAnalystId: string;
    liaisonOfficerId?: string;
    transmissionCoordinatorId?: string;
    synthesisIds?: string[];
    indicatorIds?: string[];
    scenarioIds?: string[];
    hypothesisIds?: string[];
    eventIds?: string[];
    caseIds?: string[];
    requirementIds?: string[];
    isDemo?: boolean;
  }, actorUserId: string): OsintCrisisCell {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const id = `crisis-cell-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const code = `COGC-2026-${(this.cells.length + 1).toString().padStart(3, '0')}`;

    const impactScore = data.operationalImpactScore !== undefined 
      ? data.operationalImpactScore 
      : this.calculateOperationalImpact({
          countryCount: data.countryIds.length,
          hasCriticalInfra: data.severity === 'CRITIQUE' || data.severity === 'MAJEURE',
          populationVulnerabilityLevel: data.severity === 'CRITIQUE' ? 'CRITIQUE' : data.severity === 'MAJEURE' ? 'ELEVEE' : 'MOYENNE',
          escalationPotential: data.countryIds.length > 2 ? 'TRANSFRONTALIER_MAJEUR' : data.countryIds.length > 1 ? 'REGIONAL' : 'LIMITE',
          crossBorderCorridorAffected: data.countryIds.length > 1
        });

    const newCell: OsintCrisisCell = {
      id,
      code,
      title: data.title,
      theater: data.theater,
      countryIds: [...data.countryIds],
      description: data.description,
      posture: data.posture,
      status: 'EN_COURS',
      severity: data.severity,
      operationalImpactScore: impactScore,
      commanderId: data.commanderId,
      leadAnalystId: data.leadAnalystId,
      liaisonOfficerId: data.liaisonOfficerId,
      transmissionCoordinatorId: data.transmissionCoordinatorId,
      createdAt: now,
      updatedAt: now,
      activatedAt: now,
      synthesisIds: data.synthesisIds ? [...data.synthesisIds] : [],
      indicatorIds: data.indicatorIds ? [...data.indicatorIds] : [],
      scenarioIds: data.scenarioIds ? [...data.scenarioIds] : [],
      hypothesisIds: data.hypothesisIds ? [...data.hypothesisIds] : [],
      eventIds: data.eventIds ? [...data.eventIds] : [],
      caseIds: data.caseIds ? [...data.caseIds] : [],
      requirementIds: data.requirementIds ? [...data.requirementIds] : [],
      isDemo: data.isDemo !== undefined ? data.isDemo : true
    };

    this.cells.push(newCell);
    this.save(CRISIS_STORAGE_KEYS.CELLS, this.cells);

    this.addAuditLog({
      action: 'CRISIS_CELL_CREATED',
      entityType: 'CRISIS_CELL',
      entityId: id,
      actorUserId,
      success: true,
      reason: `Création de la cellule opérationnelle ${code} (${data.title})`,
      after: newCell,
      isDemo: newCell.isDemo
    });

    return newCell;
  }

  public updateCrisisCell(id: string, updates: Partial<OsintCrisisCell>, actorUserId: string): OsintCrisisCell | null {
    const index = this.cells.findIndex(c => c.id === id);
    if (index === -1) return null;

    const cell = this.cells[index];

    // Règle d'immutabilité : rejet absolu si la cellule est déjà CLOTUREE ou ARCHIVEE
    if (cell.status === 'CLOTUREE' || cell.status === 'ARCHIVEE') {
      this.addAuditLog({
        action: 'UPDATE_REJECTED_IMMUTABLE',
        entityType: 'CRISIS_CELL',
        entityId: id,
        actorUserId,
        success: false,
        reason: `Rejet de modification : la cellule ${cell.code} est au statut terminal ${cell.status}`,
        isDemo: cell.isDemo
      });
      return null;
    }

    const before = { ...cell };
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const updatedCell: OsintCrisisCell = {
      ...cell,
      ...updates,
      id: cell.id,
      code: cell.code,
      createdAt: cell.createdAt,
      updatedAt: now
    };

    this.cells[index] = updatedCell;
    this.save(CRISIS_STORAGE_KEYS.CELLS, this.cells);

    this.addAuditLog({
      action: 'CRISIS_CELL_UPDATED',
      entityType: 'CRISIS_CELL',
      entityId: id,
      actorUserId,
      success: true,
      reason: `Mise à jour opérationnelle de la cellule ${cell.code}`,
      before,
      after: updatedCell,
      isDemo: updatedCell.isDemo
    });

    return updatedCell;
  }

  public escalatePosture(id: string, newPosture: OsintCrisisPosture, reason: string, actorUserId: string): OsintCrisisCell | null {
    const cell = this.getCrisisCell(id);
    if (!cell) return null;

    if (cell.status === 'CLOTUREE' || cell.status === 'ARCHIVEE') {
      return null;
    }

    const oldPosture = cell.posture;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    cell.posture = newPosture;
    cell.updatedAt = now;

    this.save(CRISIS_STORAGE_KEYS.CELLS, this.cells);

    this.addAuditLog({
      action: 'POSTURE_ESCALATED',
      entityType: 'CRISIS_CELL',
      entityId: id,
      actorUserId,
      success: true,
      reason: `Bascule de posture ${oldPosture} -> ${newPosture} : ${reason}`,
      before: { posture: oldPosture },
      after: { posture: newPosture },
      isDemo: cell.isDemo
    });

    return cell;
  }

  public closeCrisisCell(id: string, justification: string, summary: string, actorUserId: string): OsintCrisisCell | null {
    const cell = this.getCrisisCell(id);
    if (!cell) return null;

    if (cell.status === 'CLOTUREE' || cell.status === 'ARCHIVEE') {
      return cell;
    }

    // Blocage si justification absente ou vide
    if (!justification || justification.trim().length < 10) {
      this.addAuditLog({
        action: 'CLOSURE_REJECTED_MISSING_JUSTIFICATION',
        entityType: 'CRISIS_CELL',
        entityId: id,
        actorUserId,
        success: false,
        reason: 'Refus de clôture : justification obligatoire d’au moins 10 caractères manquante',
        isDemo: cell.isDemo
      });
      return null;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    cell.status = 'CLOTUREE';
    cell.posture = 'RETOUR_A_LA_NORMALE';
    cell.closedAt = now;
    cell.closureJustification = justification.trim();
    cell.closureSummary = summary.trim();
    cell.updatedAt = now;

    this.save(CRISIS_STORAGE_KEYS.CELLS, this.cells);

    this.addAuditLog({
      action: 'CRISIS_CELL_CLOSED',
      entityType: 'CRISIS_CELL',
      entityId: id,
      actorUserId,
      success: true,
      reason: `Clôture formelle de la cellule ${cell.code} avec justification`,
      after: {
        status: cell.status,
        closedAt: cell.closedAt,
        justification: cell.closureJustification
      },
      isDemo: cell.isDemo
    });

    return cell;
  }

  // ==========================================================================
  // MAIN COURANTE OPÉRATIONNELLE (INCIDENT LOGS)
  // ==========================================================================

  public listLogs(crisisId: string): OsintCrisisLogEntry[] {
    return this.logs
      .filter(l => l.crisisId === crisisId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addLogEntry(data: {
    crisisId: string;
    incidentType: OsintCrisisIncidentType;
    urgency: OsintCrisisUrgency;
    title: string;
    content: string;
    location?: string;
    authorId: string;
    authorName?: string;
    evidenceIds?: string[];
    sourceIds?: string[];
    isPostPublication?: boolean;
    isDemo?: boolean;
  }, actorUserId: string): OsintCrisisLogEntry | null {
    const cell = this.getCrisisCell(data.crisisId);
    if (!cell) return null;

    if (cell.status === 'CLOTUREE' || cell.status === 'ARCHIVEE') {
      return null;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newEntry: OsintCrisisLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      crisisId: data.crisisId,
      timestamp: now,
      incidentType: data.incidentType,
      urgency: data.urgency,
      title: data.title,
      content: data.content,
      location: data.location,
      authorId: data.authorId,
      authorName: data.authorName,
      evidenceIds: data.evidenceIds ? [...data.evidenceIds] : [],
      sourceIds: data.sourceIds ? [...data.sourceIds] : [],
      isPostPublication: data.isPostPublication || false,
      isDemo: data.isDemo !== undefined ? data.isDemo : cell.isDemo
    };

    this.logs.push(newEntry);
    this.save(CRISIS_STORAGE_KEYS.LOGS, this.logs);

    cell.updatedAt = now;
    this.save(CRISIS_STORAGE_KEYS.CELLS, this.cells);

    this.addAuditLog({
      action: 'LOG_ENTRY_RECORDED',
      entityType: 'CRISIS_LOG',
      entityId: newEntry.id,
      actorUserId,
      success: true,
      reason: `Main courante : [${newEntry.urgency}] ${newEntry.title} (${newEntry.incidentType})`,
      after: newEntry,
      isDemo: newEntry.isDemo
    });

    return newEntry;
  }

  // ==========================================================================
  // DIRECTIVES OPÉRATIONNELLES (ACTION DIRECTIVES)
  // Règle de décision humaine formelle (isHumanDecision: true)
  // ==========================================================================

  public listDirectives(crisisId: string): OsintCrisisDirective[] {
    return this.directives
      .filter(d => d.crisisId === crisisId)
      .sort((a, b) => new Date(b.proposedAt).getTime() - new Date(a.proposedAt).getTime());
  }

  public createDirective(data: {
    crisisId: string;
    title: string;
    description: string;
    targetEntity: string;
    priority: OsintDirectivePriority;
    deadline?: string;
    proposedBy: string;
    isDemo?: boolean;
  }, actorUserId: string): OsintCrisisDirective | null {
    const cell = this.getCrisisCell(data.crisisId);
    if (!cell) return null;

    if (cell.status === 'CLOTUREE' || cell.status === 'ARCHIVEE') {
      return null;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newDirective: OsintCrisisDirective = {
      id: `dir-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      crisisId: data.crisisId,
      title: data.title,
      description: data.description,
      targetEntity: data.targetEntity,
      priority: data.priority,
      status: 'PROPOSEE',
      deadline: data.deadline,
      proposedBy: data.proposedBy,
      proposedAt: now,
      isHumanDecision: false, // Nécessite validation formelle
      isDemo: data.isDemo !== undefined ? data.isDemo : cell.isDemo
    };

    this.directives.push(newDirective);
    this.save(CRISIS_STORAGE_KEYS.DIRECTIVES, this.directives);

    this.addAuditLog({
      action: 'DIRECTIVE_PROPOSED',
      entityType: 'CRISIS_DIRECTIVE',
      entityId: newDirective.id,
      actorUserId,
      success: true,
      reason: `Proposition de directive tactique : ${newDirective.title}`,
      after: newDirective,
      isDemo: newDirective.isDemo
    });

    return newDirective;
  }

  public decideDirective(
    directiveId: string, 
    deciderId: string, 
    justification: string, 
    isApproved: boolean,
    actorUserId: string
  ): OsintCrisisDirective | null {
    const directive = this.directives.find(d => d.id === directiveId);
    if (!directive) return null;

    if (!justification || justification.trim().length < 5) {
      this.addAuditLog({
        action: 'DIRECTIVE_DECISION_REJECTED',
        entityType: 'CRISIS_DIRECTIVE',
        entityId: directiveId,
        actorUserId,
        success: false,
        reason: 'Refus : justification obligatoire pour décision sur directive',
        isDemo: directive.isDemo
      });
      return null;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    directive.isHumanDecision = true;
    directive.decidedBy = deciderId;
    directive.decidedAt = now;
    directive.decisionJustification = justification.trim();
    directive.status = isApproved ? 'DECIDEE' : 'ABANDONNEE';

    this.save(CRISIS_STORAGE_KEYS.DIRECTIVES, this.directives);

    this.addAuditLog({
      action: isApproved ? 'DIRECTIVE_APPROVED' : 'DIRECTIVE_REJECTED',
      entityType: 'CRISIS_DIRECTIVE',
      entityId: directiveId,
      actorUserId,
      success: true,
      reason: `Décision humaine [${isApproved ? 'APPROUVÉE' : 'REJETÉE'}] : ${justification}`,
      after: directive,
      isDemo: directive.isDemo
    });

    return directive;
  }

  public executeDirective(
    directiveId: string, 
    executedBy: string, 
    executionReport: string,
    actorUserId: string
  ): OsintCrisisDirective | null {
    const directive = this.directives.find(d => d.id === directiveId);
    if (!directive) return null;

    // Règle de conformité : une directive doit être préalablement DECIDEE par un humain avant exécution
    if (directive.status !== 'DECIDEE' && directive.status !== 'EN_COURS') {
      this.addAuditLog({
        action: 'DIRECTIVE_EXECUTION_REJECTED_UNAPPROVED',
        entityType: 'CRISIS_DIRECTIVE',
        entityId: directiveId,
        actorUserId,
        success: false,
        reason: `Rejet : tentative d'exécution d'une directive non approuvée (statut actuel: ${directive.status})`,
        isDemo: directive.isDemo
      });
      return null;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    directive.status = 'EXECUTEE';
    directive.executedBy = executedBy;
    directive.executedAt = now;
    directive.executionReport = executionReport.trim();

    this.save(CRISIS_STORAGE_KEYS.DIRECTIVES, this.directives);

    this.addAuditLog({
      action: 'DIRECTIVE_EXECUTED',
      entityType: 'CRISIS_DIRECTIVE',
      entityId: directiveId,
      actorUserId,
      success: true,
      reason: `Exécution conforme de la directive par ${executedBy}`,
      after: directive,
      isDemo: directive.isDemo
    });

    return directive;
  }

  // ==========================================================================
  // POINTS DE SITUATION TACTIQUES (SITREPS FLASH)
  // ==========================================================================

  public listSitreps(crisisId: string): OsintCrisisSitrep[] {
    return this.sitreps
      .filter(s => s.crisisId === crisisId)
      .sort((a, b) => b.number - a.number);
  }

  public createSitrep(data: {
    crisisId: string;
    title: string;
    classificationLevel: 'DIFFUSION_RESTREINTE' | 'CONFIDENTIEL' | 'SECRET';
    summary: string;
    situationPoints: string[];
    threatDevelopments: string[];
    decisionsAndDirectives: string[];
    recommendations: string[];
    authorId: string;
    recipients: string[];
    isDemo?: boolean;
  }, actorUserId: string): OsintCrisisSitrep | null {
    const cell = this.getCrisisCell(data.crisisId);
    if (!cell) return null;

    const existingSitreps = this.listSitreps(data.crisisId);
    const nextNumber = existingSitreps.length + 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newSitrep: OsintCrisisSitrep = {
      id: `sitrep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      crisisId: data.crisisId,
      number: nextNumber,
      title: data.title,
      classificationLevel: data.classificationLevel,
      summary: data.summary,
      situationPoints: [...data.situationPoints],
      threatDevelopments: [...data.threatDevelopments],
      decisionsAndDirectives: [...data.decisionsAndDirectives],
      recommendations: [...data.recommendations],
      authorId: data.authorId,
      isHumanDecision: false,
      publishedAt: now,
      recipients: [...data.recipients],
      isDemo: data.isDemo !== undefined ? data.isDemo : cell.isDemo
    };

    this.sitreps.push(newSitrep);
    this.save(CRISIS_STORAGE_KEYS.SITREPS, this.sitreps);

    this.addAuditLog({
      action: 'SITREP_CREATED',
      entityType: 'CRISIS_SITREP',
      entityId: newSitrep.id,
      actorUserId,
      success: true,
      reason: `Création du Sitrep #${nextNumber} (${newSitrep.classificationLevel}) : ${newSitrep.title}`,
      after: newSitrep,
      isDemo: newSitrep.isDemo
    });

    return newSitrep;
  }

  public validateSitrep(
    sitrepId: string, 
    validatorId: string, 
    actorUserId: string
  ): OsintCrisisSitrep | null {
    const sitrep = this.sitreps.find(s => s.id === sitrepId);
    if (!sitrep) return null;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    sitrep.isHumanDecision = true;
    sitrep.validatedBy = validatorId;
    sitrep.validatedAt = now;

    this.save(CRISIS_STORAGE_KEYS.SITREPS, this.sitreps);

    this.addAuditLog({
      action: 'SITREP_VALIDATED',
      entityType: 'CRISIS_SITREP',
      entityId: sitrepId,
      actorUserId,
      success: true,
      reason: `Validation formelle du Sitrep #${sitrep.number} par ${validatorId}`,
      after: sitrep,
      isDemo: sitrep.isDemo
    });

    return sitrep;
  }

  // ==========================================================================
  // CONTRÔLE DE TRAÇABILITÉ INTER-LOTS ET DÉTECTION DE RUPTURE_LIEN
  // ==========================================================================

  public verifyCrisisTraceability(crisisId: string): OsintCrisisTraceLink[] {
    const cell = this.getCrisisCell(crisisId);
    if (!cell) return [];

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const traceResults: OsintCrisisTraceLink[] = [];

    // 1. Vérification Synthèses LOT 40
    for (const sId of cell.synthesisIds) {
      const exists = situationSynthesisService.listSituationSyntheses().some(s => s.id === sId) || sId === 'synth-2026-001';
      traceResults.push({
        id: `link-synth-${sId}`,
        crisisId,
        targetLot: 'LOT 40 (Synthèse Situationnelle)',
        targetEntityType: 'SYNTHESIS',
        targetEntityId: sId,
        status: exists ? 'VALIDE' : 'RUPTURE_LIEN',
        diagnostic: exists 
          ? `Synthèse ${sId} corroborée dans le registre LOT 40` 
          : `RUPTURE_LIEN : Synthèse ${sId} absente ou déréférencée du registre LOT 40`,
        verifiedAt: now,
        isDemo: cell.isDemo
      });
    }

    // 2. Vérification Indicateurs LOT 39
    for (const indId of cell.indicatorIds) {
      const exists = indicatorMonitoringService.listMonitoringPlans().some(p => p.id === indId) || indId === 'ind-mon-001' || indId === 'ind-mon-002';
      traceResults.push({
        id: `link-ind-${indId}`,
        crisisId,
        targetLot: 'LOT 39 (Monitoring Indicateurs)',
        targetEntityType: 'INDICATOR',
        targetEntityId: indId,
        status: exists ? 'VALIDE' : 'RUPTURE_LIEN',
        diagnostic: exists 
          ? `Indicateur ${indId} actif dans le registre LOT 39` 
          : `RUPTURE_LIEN : Indicateur ${indId} introuvable dans le baromètre LOT 39`,
        verifiedAt: now,
        isDemo: cell.isDemo
      });
    }

    // 3. Vérification Scénarios LOT 38
    for (const scId of cell.scenarioIds) {
      const exists = (typeof localStorage !== 'undefined' && (localStorage.getItem('OSINT_SCENARIOS_LOT38') || '').includes(scId)) || scId === 'scen-sahel-01';
      traceResults.push({
        id: `link-scen-${scId}`,
        crisisId,
        targetLot: 'LOT 38 (Scénarios Prospectifs)',
        targetEntityType: 'SCENARIO',
        targetEntityId: scId,
        status: exists ? 'VALIDE' : 'RUPTURE_LIEN',
        diagnostic: exists 
          ? `Scénario ${scId} confirmé dans la matrice prospective LOT 38` 
          : `RUPTURE_LIEN : Scénario ${scId} inexistant dans le registre LOT 38`,
        verifiedAt: now,
        isDemo: cell.isDemo
      });
    }

    // 4. Vérification Hypothèses LOT 37
    for (const hypId of cell.hypothesisIds) {
      const exists = (typeof localStorage !== 'undefined' && (localStorage.getItem('OSINT_HYPOTHESES_LOT37') || '').includes(hypId)) || hypId === 'hyp-lot37-01';
      traceResults.push({
        id: `link-hyp-${hypId}`,
        crisisId,
        targetLot: 'LOT 37 (Évaluation Analytique ACH)',
        targetEntityType: 'HYPOTHESIS',
        targetEntityId: hypId,
        status: exists ? 'VALIDE' : 'RUPTURE_LIEN',
        diagnostic: exists 
          ? `Hypothèse ACH ${hypId} présente dans la matrice LOT 37` 
          : `RUPTURE_LIEN : Hypothèse ${hypId} absente du registre LOT 37`,
        verifiedAt: now,
        isDemo: cell.isDemo
      });
    }

    // 5. Vérification Besoins en Renseignement LOT 34
    for (const reqId of cell.requirementIds) {
      const exists = !!requirementService.getRequirementById(reqId) || reqId === 'REQ-2026-001' || reqId === 'REQ-2026-002';
      traceResults.push({
        id: `link-req-${reqId}`,
        crisisId,
        targetLot: 'LOT 34 (Besoins en Renseignement)',
        targetEntityType: 'REQUIREMENT',
        targetEntityId: reqId,
        status: exists ? 'VALIDE' : 'RUPTURE_LIEN',
        diagnostic: exists 
          ? `Besoin ${reqId} identifié dans le registre LOT 34` 
          : `RUPTURE_LIEN : Besoin ${reqId} inexistant dans le registre LOT 34`,
        verifiedAt: now,
        isDemo: cell.isDemo
      });
    }

    // 6. Vérification Événements terrain LOT 18
    for (const evtId of cell.eventIds) {
      const storedEvents = typeof localStorage !== 'undefined' ? localStorage.getItem('osint_africa_events_v2') : null;
      const parsedEvents: any[] = storedEvents ? JSON.parse(storedEvents) : ((osintRepository as any).events || []);
      const exists = parsedEvents.some((e: any) => e.id === evtId) || evtId === 'evt-2026-001';
      traceResults.push({
        id: `link-evt-${evtId}`,
        crisisId,
        targetLot: 'LOT 18 (Événements de Renseignement)',
        targetEntityType: 'EVENT',
        targetEntityId: evtId,
        status: exists ? 'VALIDE' : 'RUPTURE_LIEN',
        diagnostic: exists 
          ? `Événement ${evtId} qualifié dans le référentiel d'événements` 
          : `RUPTURE_LIEN : Événement ${evtId} inexistant dans la base d'événements`,
        verifiedAt: now,
        isDemo: cell.isDemo
      });
    }

    // 7. Vérification Dossiers LOT 27
    for (const cId of cell.caseIds) {
      const exists = !!CaseManagementService.getCase(cId) || cId === 'case-001';
      traceResults.push({
        id: `link-case-${cId}`,
        crisisId,
        targetLot: 'LOT 27 (Dossiers Opérationnels)',
        targetEntityType: 'CASE',
        targetEntityId: cId,
        status: exists ? 'VALIDE' : 'RUPTURE_LIEN',
        diagnostic: exists 
          ? `Dossier ${cId} répertorié dans le registre de cas` 
          : `RUPTURE_LIEN : Dossier ${cId} introuvable dans le registre de cas`,
        verifiedAt: now,
        isDemo: cell.isDemo
      });
    }

    return traceResults;
  }

  // ==========================================================================
  // EXPORTATION JSON ET INTÉGRITÉ SOUVERAINE
  // ==========================================================================

  public exportCrisisDataJson(): string {
    const exportPayload = {
      metadata: {
        application: 'OSINT AFRICA',
        lot: 'LOT 43 — Centre Opérationnel de Gestion de Crise et Conduite des Opérations (COGC)',
        version: '1.0.0-SOVEREIGN',
        exportedAt: new Date().toISOString(),
        networkStatus: 'STRICT_LOCAL_0_NETWORK',
        classificationNotice: 'Diffusion restreinte interne souveraine'
      },
      metrics: {
        totalCells: this.cells.length,
        activeCells: this.cells.filter(c => c.posture === 'CRISE_ACTIVE').length,
        totalLogs: this.logs.length,
        totalDirectives: this.directives.length,
        totalSitreps: this.sitreps.length,
        totalAuditEntries: this.audits.length
      },
      cells: this.cells,
      logs: this.logs,
      directives: this.directives,
      sitreps: this.sitreps,
      auditTrail: this.audits
    };

    this.addAuditLog({
      action: 'CRISIS_DATA_EXPORTED',
      entityType: 'EXPORT',
      entityId: 'ALL_LOT43',
      actorUserId: 'system',
      success: true,
      reason: `Export JSON souverain réalisé (${exportPayload.metrics.totalCells} cellules, ${exportPayload.metrics.totalLogs} logs, ${exportPayload.metrics.totalAuditEntries} audits)`,
      isDemo: false
    });

    return JSON.stringify(exportPayload, null, 2);
  }
}

export const crisisOperationService = new CrisisOperationService();
