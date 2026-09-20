/**
 * OSINT AFRICA - Service de Gouvernance & Orchestration des Sources (LOT 22)
 * 
 * Strictement HORS LIGNE — Aucune collecte Internet réelle
 * Persistance locale : clé 'osint_africa_governance_v1'
 * Règle doctrinale : CRITICITÉ ≠ FIABILITÉ, APPROUVÉE ≠ FIABLE, PRIORITÉ ≠ VÉRITÉ
 */

import {
  OsintSourceGovernance,
  OsintSourceReview,
  OsintGovernanceAudit,
  PreActivationCheckItem,
  GovernanceActionItem,
  HumanValidationRecord,
  HumanValidationDecision,
  GovernanceWorkflowStatus,
  SourcePriority,
  SourceCriticality,
  OsintSourceItem
} from '../types';
import {
  generateAllSourceGovernance,
  INITIAL_PRE_ACTIVATION_CHECKLIST,
  INITIAL_SOURCE_REVIEWS,
  INITIAL_GOVERNANCE_AUDITS
} from '../data/governanceDemoData';
import { ALL_CONNECTORS } from '../data/connectorDemoData';

const GOVERNANCE_STORAGE_KEY = 'osint_africa_governance_v1';
const REVIEWS_STORAGE_KEY = 'osint_africa_reviews_v1';
const AUDITS_STORAGE_KEY = 'osint_africa_gov_audits_v1';
const CHECKLIST_STORAGE_KEY = 'osint_africa_checklist_v1';

export interface GovernanceKPIs {
  totalSources: number;
  realSources: number;
  demoSources: number;
  unconnectedSources: number;
  configuredSources: number;
  readySources: number;
  approvedSources: number;
  suspendedSources: number;
  disabledSources: number;
  configuredConnectors: number;
  simulatedConnectors: number;
  requiringVerification: number;
  requiringValidation: number;
  overdueReviews: number;
}

export class GovernanceService {
  private governances: Map<string, OsintSourceGovernance> = new Map();
  private reviews: OsintSourceReview[] = [];
  private audits: OsintGovernanceAudit[] = [];
  private checklistMap: Map<string, PreActivationCheckItem[]> = new Map();

  constructor() {
    this.loadState();
  }

  /**
   * Charge l'état depuis le stockage local avec initialisation robuste
   */
  private loadState(): void {
    try {
      // 1. Governances
      const savedGov = localStorage.getItem(GOVERNANCE_STORAGE_KEY);
      if (savedGov) {
        const parsed: OsintSourceGovernance[] = JSON.parse(savedGov);
        parsed.forEach((g) => this.governances.set(g.sourceId, g));
      } else {
        const initialGov = generateAllSourceGovernance();
        initialGov.forEach((g) => this.governances.set(g.sourceId, g));
        this.saveGovernances();
      }

      // 2. Reviews
      const savedReviews = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (savedReviews) {
        this.reviews = JSON.parse(savedReviews);
      } else {
        this.reviews = [...INITIAL_SOURCE_REVIEWS];
        this.saveReviews();
      }

      // 3. Audits
      const savedAudits = localStorage.getItem(AUDITS_STORAGE_KEY);
      if (savedAudits) {
        this.audits = JSON.parse(savedAudits);
      } else {
        this.audits = [...INITIAL_GOVERNANCE_AUDITS];
        this.saveAudits();
      }

      // 4. Checklist Map
      const savedChecklists = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (savedChecklists) {
        const parsed = JSON.parse(savedChecklists) as Record<string, PreActivationCheckItem[]>;
        Object.entries(parsed).forEach(([srcId, list]) => {
          this.checklistMap.set(srcId, list);
        });
      }
    } catch (e) {
      console.warn('[GovernanceService] Erreur de chargement local, réinitialisation standard:', e);
      const initialGov = generateAllSourceGovernance();
      initialGov.forEach((g) => this.governances.set(g.sourceId, g));
      this.reviews = [...INITIAL_SOURCE_REVIEWS];
      this.audits = [...INITIAL_GOVERNANCE_AUDITS];
    }
  }

  private saveGovernances(): void {
    try {
      const arr = Array.from(this.governances.values());
      localStorage.setItem(GOVERNANCE_STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      console.error('[GovernanceService] Échec de sauvegarde des gouvernances:', e);
    }
  }

  private saveReviews(): void {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(this.reviews));
    } catch (e) {
      console.error('[GovernanceService] Échec de sauvegarde des revues:', e);
    }
  }

  private saveAudits(): void {
    try {
      localStorage.setItem(AUDITS_STORAGE_KEY, JSON.stringify(this.audits));
    } catch (e) {
      console.error('[GovernanceService] Échec de sauvegarde des audits:', e);
    }
  }

  private saveChecklists(): void {
    try {
      const obj: Record<string, PreActivationCheckItem[]> = {};
      this.checklistMap.forEach((val, key) => {
        obj[key] = val;
      });
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.error('[GovernanceService] Échec de sauvegarde des checklists:', e);
    }
  }

  // ==========================================================================
  // LECTURE DES DONNÉES
  // ==========================================================================

  public getAllGovernances(): OsintSourceGovernance[] {
    return Array.from(this.governances.values());
  }

  public getGovernanceBySourceId(sourceId: string): OsintSourceGovernance | undefined {
    return this.governances.get(sourceId);
  }

  public getAllReviews(): OsintSourceReview[] {
    return [...this.reviews];
  }

  public getAllAudits(): OsintGovernanceAudit[] {
    return [...this.audits].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getChecklistForSource(sourceId: string): PreActivationCheckItem[] {
    if (this.checklistMap.has(sourceId)) {
      return this.checklistMap.get(sourceId)!;
    }
    // Générer une checklist par défaut basée sur les métadonnées actuelles de la source
    const gov = this.governances.get(sourceId);
    const list: PreActivationCheckItem[] = INITIAL_PRE_ACTIVATION_CHECKLIST.map((item) => {
      let isChecked = false;
      if (gov) {
        if (item.id === 'chk-01') isChecked = true;
        if (item.id === 'chk-02') isChecked = true;
        if (item.id === 'chk-03') isChecked = true;
        if (item.id === 'chk-04') isChecked = gov.termsStatus === 'CHECKED_OK';
        if (item.id === 'chk-05') isChecked = gov.licensingStatus !== 'UNKNOWN' && gov.licensingStatus !== 'EDITORIAL_RESTRICTED';
        if (item.id === 'chk-06') isChecked = gov.robotsStatus === 'ALLOWED';
        if (item.id === 'chk-07') isChecked = !!gov.collectionPolicy?.geographicScope;
        if (item.id === 'chk-08') isChecked = gov.collectionPolicy?.rateLimit !== 'Non défini';
        if (item.id === 'chk-09') isChecked = gov.authenticationStatus !== 'MISSING';
        if (item.id === 'chk-10') isChecked = gov.responsibleAnalyst !== 'Non assigné';
        if (item.id === 'chk-11') isChecked = gov.approvalStatus === 'APPROVED' || gov.approvalStatus === 'RESERVATIONS';
        if (item.id === 'chk-12') isChecked = gov.validationStatus === 'VALIDATED';
        if (item.id === 'chk-13') isChecked = !!gov.retentionPolicy?.justification;
        if (item.id === 'chk-14') isChecked = true; // Mode hors ligne garanti
      }
      return { ...item, isChecked };
    });
    this.checklistMap.set(sourceId, list);
    this.saveChecklists();
    return list;
  }

  // ==========================================================================
  // CALCUL DES KPI DYNAMIQUES
  // ==========================================================================

  public calculateKPIs(sources: OsintSourceItem[]): GovernanceKPIs {
    const allGov = this.getAllGovernances();
    const sourceMap = new Map(sources.map((s) => [s.id, s]));

    let realCount = 0;
    let demoCount = 0;
    let unconnected = 0;
    let configured = 0;
    let ready = 0;
    let approved = 0;
    let suspended = 0;
    let disabled = 0;
    let reqVerification = 0;
    let reqValidation = 0;

    allGov.forEach((gov) => {
      const src = sourceMap.get(gov.sourceId);
      const isReal = src?.isReal ?? false;
      if (isReal) realCount++;
      else demoCount++;

      // Connectivité
      const isConn = src?.isConnected ?? false;
      if (!isConn) unconnected++;

      // Statuts workflow
      if (gov.governanceStatus === 'VERIFIED') configured++;
      if (gov.governanceStatus === 'READY_TO_CONNECT') ready++;
      if (gov.governanceStatus === 'APPROVED' || gov.governanceStatus === 'AUTHORIZED' || gov.governanceStatus === 'ACTIVE') approved++;
      if (gov.governanceStatus === 'SUSPENDED') suspended++;
      if (gov.governanceStatus === 'DISABLED') disabled++;

      if (gov.governanceStatus === 'TO_VERIFY' || gov.governanceStatus === 'DRAFT') reqVerification++;
      if (gov.governanceStatus === 'TO_APPROVE') reqValidation++;
    });

    // Connecteurs configurés et simulés
    const configuredConnectors = ALL_CONNECTORS.filter((c) => c.status === 'SOURCE_CONFIGURED' || c.status === 'READY_TO_CONNECT').length;
    const simulatedConnectors = ALL_CONNECTORS.filter((c) => c.isSimulated || c.status === 'ACTIVE').length;

    // Revues en retard
    const now = new Date('2026-09-14T12:00:00Z').getTime();
    const overdue = this.reviews.filter((r) => {
      if (r.status === 'OVERDUE') return true;
      if (r.status === 'SCHEDULED' && new Date(r.reviewDate).getTime() < now) return true;
      return false;
    }).length;

    return {
      totalSources: sources.length,
      realSources: realCount,
      demoSources: demoCount,
      unconnectedSources: unconnected,
      configuredSources: configured,
      readySources: ready,
      approvedSources: approved,
      suspendedSources: suspended,
      disabledSources: disabled,
      configuredConnectors,
      simulatedConnectors,
      requiringVerification: reqVerification,
      requiringValidation: reqValidation,
      overdueReviews: overdue
    };
  }

  // ==========================================================================
  // DÉTECTION DES ACTIONS REQUISES (FILE D'ACTIONS)
  // ==========================================================================

  public generateRequiredActions(sources: OsintSourceItem[]): GovernanceActionItem[] {
    const actions: GovernanceActionItem[] = [];
    const sourceMap = new Map(sources.map((s) => [s.id, s]));
    const now = new Date('2026-09-14T12:00:00Z').getTime();

    this.getAllGovernances().forEach((gov) => {
      const src = sourceMap.get(gov.sourceId);
      const srcName = src?.name || gov.sourceId;
      const country = src?.countryName || src?.country || 'Afrique';

      // 1. Priorité non définie
      if (gov.priority === 'P5') {
        actions.push({
          id: `act-prio-${gov.sourceId}`,
          sourceId: gov.sourceId,
          sourceName: srcName,
          countryName: country,
          problem: 'Priorité opérationnelle non attribuée (P5 — À ÉVALUER)',
          priority: 'HAUTE',
          recommendedAction: 'Attribuer un niveau de priorité d’observation (P1 à P4)',
          category: 'METADATA',
          isDemo: true
        });
      }

      // 2. Criticité inconnue
      if (gov.criticality === 'UNKNOWN') {
        actions.push({
          id: `act-crit-${gov.sourceId}`,
          sourceId: gov.sourceId,
          sourceName: srcName,
          countryName: country,
          problem: 'Niveau de criticité opérationnelle indéterminé',
          priority: 'MOYENNE',
          recommendedAction: 'Évaluer l’impact de la source dans le dispositif de veille',
          category: 'METADATA',
          isDemo: true
        });
      }

      // 3. Licence ou Droits inconnus
      if (gov.licensingStatus === 'UNKNOWN') {
        actions.push({
          id: `act-lic-${gov.sourceId}`,
          sourceId: gov.sourceId,
          sourceName: srcName,
          countryName: country,
          problem: 'Statut de licence ou propriété intellectuelle non identifié',
          priority: 'CRITIQUE',
          recommendedAction: 'Consulter les mentions légales du diffuseur et qualifier la licence',
          category: 'LEGAL',
          isDemo: true
        });
      }

      // 4. Robots.txt inconnu ou restrictif
      if (gov.robotsStatus === 'UNSPECIFIED' || gov.robotsStatus === 'UNKNOWN') {
        actions.push({
          id: `act-rob-${gov.sourceId}`,
          sourceId: gov.sourceId,
          sourceName: srcName,
          countryName: country,
          problem: 'Directives robots.txt non renseignées ou non vérifiées',
          priority: 'HAUTE',
          recommendedAction: 'Examiner le fichier robots.txt public et renseigner le crawl-delay ou disallow',
          category: 'LEGAL',
          isDemo: true
        });
      }

      // 5. Conditions d'utilisation inconnues
      if (gov.termsStatus === 'UNKNOWN') {
        actions.push({
          id: `act-trm-${gov.sourceId}`,
          sourceId: gov.sourceId,
          sourceName: srcName,
          countryName: country,
          problem: 'Conditions Générales d’Utilisation (CGU) non vérifiées',
          priority: 'HAUTE',
          recommendedAction: 'Procéder à la vérification juridique des clauses d’agrégation',
          category: 'LEGAL',
          isDemo: true
        });
      }

      // 6. Validation humaine absente sur source vérifiée
      if (gov.governanceStatus === 'TO_APPROVE' && gov.approvalStatus === 'PENDING') {
        actions.push({
          id: `act-val-${gov.sourceId}`,
          sourceId: gov.sourceId,
          sourceName: srcName,
          countryName: country,
          problem: 'Source prête pour décision humaine : approbation requise',
          priority: 'CRITIQUE',
          recommendedAction: 'Soumettre la fiche au Réviseur ou Auditeur pour avis motivé',
          category: 'VALIDATION',
          isDemo: true
        });
      }

      // 7. Source suspendue pour non-conformité
      if (gov.governanceStatus === 'SUSPENDED') {
        actions.push({
          id: `act-susp-${gov.sourceId}`,
          sourceId: gov.sourceId,
          sourceName: srcName,
          countryName: country,
          problem: `Source suspendue : ${gov.suspensionReason || 'Non conformité juridique'}`,
          priority: 'MOYENNE',
          recommendedAction: 'Examiner si une autorisation d’accès écrite peut être négociée',
          category: 'LEGAL',
          isDemo: true
        });
      }

      // 8. Traçabilité ou checklist incomplète
      const checklist = this.getChecklistForSource(gov.sourceId);
      const missingCritical = checklist.some((c) => c.isCritical && !c.isChecked);
      if (missingCritical && (gov.governanceStatus === 'READY_TO_CONNECT' || gov.governanceStatus === 'APPROVED')) {
        actions.push({
          id: `act-chk-${gov.sourceId}`,
          sourceId: gov.sourceId,
          sourceName: srcName,
          countryName: country,
          problem: 'Éléments critiques de la checklist de préactivation non satisfaits',
          priority: 'CRITIQUE',
          recommendedAction: 'Compléter les vérifications obligatoires avant toute autorisation future',
          category: 'CONNECTOR',
          isDemo: true
        });
      }
    });

    // 9. Revues expirées / en retard
    this.reviews.forEach((rev) => {
      const isLate = rev.status === 'OVERDUE' || (rev.status === 'SCHEDULED' && new Date(rev.reviewDate).getTime() < now);
      if (isLate) {
        const src = sourceMap.get(rev.sourceId);
        actions.push({
          id: `act-rev-${rev.id}`,
          sourceId: rev.sourceId,
          sourceName: src?.name || rev.sourceId,
          countryName: src?.countryName || src?.country || 'Afrique',
          problem: `Revue périodique échue (${rev.reviewDate}) - Réviseur : ${rev.reviewer}`,
          priority: 'HAUTE',
          recommendedAction: 'Conduire la réévaluation annuelle de la source et mettre à jour le calendrier',
          category: 'REVIEW',
          isDemo: true
        });
      }
    });

    return actions;
  }

  // ==========================================================================
  // ACTIONS DE MUTATION & VALIDATION HUMAINE (APPEND-ONLY AUDIT)
  // ==========================================================================

  /**
   * Enregistre une validation humaine formelle pour une source
   */
  public submitHumanValidation(
    sourceId: string,
    record: Omit<HumanValidationRecord, 'id' | 'isDemo'>
  ): OsintSourceGovernance {
    const gov = this.governances.get(sourceId);
    if (!gov) throw new Error(`Source de gouvernance non trouvée: ${sourceId}`);

    const newRecord: HumanValidationRecord = {
      ...record,
      id: `val-${Date.now()}`,
      isDemo: true
    };

    let newGovStatus: GovernanceWorkflowStatus = gov.governanceStatus;
    let newApprovalStatus: OsintSourceGovernance['approvalStatus'] = 'PENDING';

    switch (record.decision) {
      case 'APPROVED':
        newApprovalStatus = 'APPROVED';
        newGovStatus = 'APPROVED';
        break;
      case 'APPROVED_WITH_RESERVATIONS':
        newApprovalStatus = 'RESERVATIONS';
        newGovStatus = 'APPROVED';
        break;
      case 'REJECTED':
        newApprovalStatus = 'REJECTED';
        newGovStatus = 'SUSPENDED';
        break;
      case 'TO_REEXAMINE':
        newApprovalStatus = 'PENDING';
        newGovStatus = 'TO_VERIFY';
        break;
    }

    const previousStatus = gov.governanceStatus;
    const updated: OsintSourceGovernance = {
      ...gov,
      governanceStatus: newGovStatus,
      approvalStatus: newApprovalStatus,
      validationStatus: record.decision === 'REJECTED' ? 'REJECTED' : 'VALIDATED',
      approvalDate: record.decision === 'APPROVED' || record.decision === 'APPROVED_WITH_RESERVATIONS' ? record.date : gov.approvalDate,
      reviewer: record.validator,
      reviewDate: record.nextReviewDate,
      suspensionReason: record.decision === 'REJECTED' ? record.justification : undefined,
      validationHistory: [newRecord, ...(gov.validationHistory || [])],
      updatedAt: new Date().toISOString()
    };

    this.governances.set(sourceId, updated);
    this.saveGovernances();

    // Audit append-only
    this.appendAudit({
      sourceId,
      action: record.decision === 'REJECTED' ? 'SOURCE_REJECTED' : 'SOURCE_APPROVED',
      previousValue: previousStatus,
      newValue: newGovStatus,
      actor: record.validator,
      reason: record.justification + (record.reservations ? ` [Réserves: ${record.reservations}]` : ''),
      result: record.decision === 'APPROVED_WITH_RESERVATIONS' ? 'WARNING' : 'SUCCESS'
    });

    return updated;
  }

  /**
   * Met à jour le statut du workflow de gouvernance
   */
  public updateGovernanceStatus(
    sourceId: string,
    newStatus: GovernanceWorkflowStatus,
    actor: string,
    reason: string
  ): OsintSourceGovernance {
    const gov = this.governances.get(sourceId);
    if (!gov) throw new Error(`Source non trouvée: ${sourceId}`);

    const previousStatus = gov.governanceStatus;
    const updated: OsintSourceGovernance = {
      ...gov,
      governanceStatus: newStatus,
      updatedAt: new Date().toISOString()
    };

    this.governances.set(sourceId, updated);
    this.saveGovernances();

    this.appendAudit({
      sourceId,
      action: 'STATUS_CHANGED',
      previousValue: previousStatus,
      newValue: newStatus,
      actor,
      reason,
      result: 'SUCCESS'
    });

    return updated;
  }

  /**
   * Met à jour la priorité ou la criticité (indépendantes de la fiabilité)
   */
  public updatePriorityAndCriticality(
    sourceId: string,
    priority: SourcePriority,
    criticality: SourceCriticality,
    actor: string,
    reason: string
  ): OsintSourceGovernance {
    const gov = this.governances.get(sourceId);
    if (!gov) throw new Error(`Source non trouvée: ${sourceId}`);

    const prevPrio = gov.priority;
    const prevCrit = gov.criticality;

    const updated: OsintSourceGovernance = {
      ...gov,
      priority,
      criticality,
      updatedAt: new Date().toISOString()
    };

    this.governances.set(sourceId, updated);
    this.saveGovernances();

    if (prevPrio !== priority) {
      this.appendAudit({
        sourceId,
        action: 'PRIORITY_CHANGED',
        previousValue: prevPrio,
        newValue: priority,
        actor,
        reason: `Mise à jour de la priorité opérationnelle: ${reason}`,
        result: 'SUCCESS'
      });
    }

    if (prevCrit !== criticality) {
      this.appendAudit({
        sourceId,
        action: 'CRITICALITY_CHANGED',
        previousValue: prevCrit,
        newValue: criticality,
        actor,
        reason: `Mise à jour de la criticité opérationnelle: ${reason}`,
        result: 'SUCCESS'
      });
    }

    return updated;
  }

  /**
   * Met à jour la checklist de préactivation
   */
  public updateChecklistItem(sourceId: string, itemId: string, isChecked: boolean, actor: string): PreActivationCheckItem[] {
    const current = this.getChecklistForSource(sourceId);
    const updated = current.map((item) => (item.id === itemId ? { ...item, isChecked } : item));
    this.checklistMap.set(sourceId, updated);
    this.saveChecklists();

    const changedItem = updated.find((i) => i.id === itemId);
    this.appendAudit({
      sourceId,
      action: 'CHECKLIST_VERIFIED',
      previousValue: (!isChecked).toString(),
      newValue: isChecked.toString(),
      actor,
      reason: `Point de contrôle « ${changedItem?.label} » marqué ${isChecked ? 'satisfait' : 'non satisfait'}`,
      result: isChecked ? 'SUCCESS' : 'WARNING'
    });

    return updated;
  }

  /**
   * Planifie ou met à jour une revue périodique
   */
  public scheduleReview(review: Omit<OsintSourceReview, 'id' | 'isDemo'>): OsintSourceReview {
    const newRev: OsintSourceReview = {
      ...review,
      id: `rev-${Date.now()}`,
      isDemo: true
    };
    this.reviews.push(newRev);
    this.saveReviews();

    this.appendAudit({
      sourceId: review.sourceId,
      action: 'REVIEW_COMPLETED',
      previousValue: 'NON_PROGRAMMÉE',
      newValue: review.reviewDate,
      actor: review.reviewer,
      reason: `Revue programmée pour le ${review.reviewDate}`,
      result: 'SUCCESS'
    });

    return newRev;
  }

  /**
   * Ajoute un événement d'audit infalsifiable (append-only)
   */
  public appendAudit(audit: Omit<OsintGovernanceAudit, 'id' | 'timestamp' | 'isDemo'>): OsintGovernanceAudit {
    const newAudit: OsintGovernanceAudit = {
      ...audit,
      id: `gov-aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      isDemo: true
    };
    this.audits.unshift(newAudit);
    this.saveAudits();
    return newAudit;
  }

  /**
   * Règle absolue d'isolation : Bloque toute tentative d'action réseau réelle
   */
  public blockOfflineAction(sourceId: string, actionDescription: string, actor: string): { blocked: true; message: string } {
    this.appendAudit({
      sourceId,
      action: 'OFFLINE_BLOCKED',
      previousValue: 'OFFLINE_MODE',
      newValue: 'BLOCKED',
      actor,
      reason: `Tentative d'opération réseau (${actionDescription}) interceptée et bloquée par la doctrine de confinement local.`,
      result: 'BLOCKED_OFFLINE'
    });

    return {
      blocked: true,
      message: 'ACTION RÉSEAU DÉSACTIVÉE — MODE HORS LIGNE'
    };
  }
}

export const governanceService = new GovernanceService();
