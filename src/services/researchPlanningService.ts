/**
 * OSINT AFRICA - LOT 35 : Centre de Planification de la Recherche et de la Veille OSINT
 * 
 * Moteur souverain local :
 * - Planification de la recherche et de la veille à partir des besoins en renseignement (LOT 34)
 * - Découplage strict : PLANIFICATION ≠ COLLECTE
 * - 0 appel réseau (aucun fetch, axios, WebSocket, API Gemini, scraper ou crawler)
 * - Flux APS historique (LOT 24) strictement inchangé
 * - Verrouillage d'immutabilité des plans archivés côté service
 * - Traçabilité bidirectionnelle complète : Besoin <-> Question <-> Lacune <-> Indicateur <-> Plan <-> Tâche <-> Résultat <-> Source <-> Preuve
 * - Audit append-only et persistance exclusive dans localStorage
 */

import {
  OsintResearchPlan,
  OsintResearchTask,
  OsintResearchResult,
  OsintResearchAudit,
  OsintResearchMethod,
  OsintResearchPlanStatus,
  OsintResearchTaskStatus,
  OsintResearchResultRelevance,
  OsintResearchResultConfidence,
  OsintResearchVerificationStatus
} from '../types';

export const RESEARCH_STORAGE_KEYS = {
  PLANS: 'OSINT_RESEARCH_PLANS_LOT35',
  TASKS: 'OSINT_RESEARCH_TASKS_LOT35',
  RESULTS: 'OSINT_RESEARCH_RESULTS_LOT35',
  AUDIT: 'OSINT_RESEARCH_AUDIT_LOT35'
};

export const RESEARCH_METHODS_TAXONOMY: { id: OsintResearchMethod; label: string; description: string }[] = [
  {
    id: 'veille_documentaire',
    label: 'Veille documentaire',
    description: 'Surveillance et collationnement passif des publications périodiques et rapports institutionnels.'
  },
  {
    id: 'recherche_web_ouverte',
    label: 'Recherche web ouverte',
    description: 'Investigation manuelle ciblée sur moteurs et portails publics sans scraper ni crawler automatique.'
  },
  {
    id: 'analyse_temporelle',
    label: 'Analyse temporelle',
    description: 'Établissement de chronologies comparées et identification d anomalies de séquence.'
  },
  {
    id: 'analyse_geographique',
    label: 'Analyse géographique',
    description: 'Croisement cartographique des axes, frontières et infrastructures critiques observées.'
  },
  {
    id: 'analyse_sources',
    label: 'Analyse de sources',
    description: 'Évaluation critique de fiabilité, d alignement doctrinal et de gouvernance des sources (LOT 22).'
  },
  {
    id: 'comparaison_multi_sources',
    label: 'Comparaison multi-sources',
    description: 'Corrélation et recherche de divergences ou convergences entre déclarations indépendantes.'
  },
  {
    id: 'analyse_acteurs',
    label: 'Analyse d’acteurs',
    description: 'Cartographie des chaînes de commandement, réseaux d influence et affiliations d acteurs.'
  },
  {
    id: 'analyse_evenementielle',
    label: 'Analyse événementielle',
    description: 'Décomposition systématique des incidents et signaux forts du registre opérationnel (LOT 28).'
  },
  {
    id: 'verification',
    label: 'Vérification',
    description: 'Contrôle d authenticité factuelle, technique et textuelle d allégations diffusées.'
  },
  {
    id: 'recherche_contextuelle',
    label: 'Recherche contextuelle',
    description: 'Éclairage sociopolitique, coutumier, historique ou juridique d une zone d intérêt.'
  },
  {
    id: 'analyse_donnees_publiques',
    label: 'Analyse de données publiques',
    description: 'Exploitation des registres commerciaux, cadastres, JO et statistiques étatiques officielles.'
  },
  {
    id: 'imagerie_geospatial_existante',
    label: 'Imagerie / géospatial préexistant',
    description: 'Exploitation visuelle de clichés satellites ou d imageries déjà enregistrés dans le système.'
  },
  {
    id: 'autre',
    label: 'Autre méthode',
    description: 'Méthode spécialisée consignée dans le plan de travail de l analyste.'
  }
];

export const RESEARCH_WORKFLOW_STEPS: { status: OsintResearchPlanStatus; label: string; stepOrder: number }[] = [
  { status: 'BROUILLON', label: 'Brouillon', stepOrder: 1 },
  { status: 'A_PREPARER', label: 'À préparer', stepOrder: 2 },
  { status: 'PLANIFIE', label: 'Planifié', stepOrder: 3 },
  { status: 'EN_RECHERCHE', label: 'En recherche active', stepOrder: 4 },
  { status: 'RESULTATS_COLLECTES', label: 'Résultats collectés', stepOrder: 5 },
  { status: 'EN_EVALUATION', label: 'En évaluation humaine', stepOrder: 6 },
  { status: 'TERMINE', label: 'Terminé', stepOrder: 7 },
  { status: 'ARCHIVE', label: 'Archivé (Verrouillé)', stepOrder: 8 }
];

export const RESEARCH_DOCTRINAL_PRINCIPLES = [
  {
    id: 'PLANIFICATION_VS_COLLECTE',
    title: 'Planification ≠ Collecte',
    text: 'La planification organise la démarche intellectuelle et assigne des axes de travail. Elle ne déclenche aucun scraper, aucun crawler, aucun flux réseau automatisé.'
  },
  {
    id: 'PRIORITE_VS_MENACE',
    title: 'Priorité ≠ Menace / Probabilité',
    text: 'Le score de priorité (0 à 100) reflète l urgence analytique et l importance du besoin décisionnel, jamais la gravité intrinsèque d une menace ni la véracité d une hypothèse.'
  },
  {
    id: 'ANTI_BIAIS_TEMPOREL',
    title: 'Discipline anti-biais temporel (Post-T0)',
    text: 'Tout élément découvert ou publié postérieurement à l instant de référence T0 doit porter la mention explicite isPostT0 / isPostPublication et ne peut être imputé à la situation initiale.'
  },
  {
    id: 'IMMUTABILITE_ARCHIVE',
    title: 'Verrouillage d immutabilité des archives',
    text: 'Dès qu un plan de recherche passe au statut ARCHIVE, il devient strictement immuable au niveau du service. Aucune altération ultérieure n est tolérée.'
  }
];

export interface TraceabilityChainNode {
  type: 'REQUIREMENT' | 'QUESTION' | 'GAP' | 'INDICATOR' | 'PLAN' | 'TASK' | 'RESULT' | 'SOURCE' | 'EVIDENCE';
  id: string;
  label: string;
  status?: string;
  details?: string;
  children?: TraceabilityChainNode[];
}

export class ResearchPlanningService {
  private plans: OsintResearchPlan[] = [];
  private tasks: OsintResearchTask[] = [];
  private results: OsintResearchResult[] = [];
  private auditLogs: OsintResearchAudit[] = [];

  constructor() {
    this.loadFromStorage();
    if (this.plans.length === 0) {
      this.initializeDemoData();
    }
  }

  // =========================================================================
  // PERSISTANCE LOCALE & AUDIT APPEND-ONLY
  // =========================================================================

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const storedPlans = localStorage.getItem(RESEARCH_STORAGE_KEYS.PLANS);
      const storedTasks = localStorage.getItem(RESEARCH_STORAGE_KEYS.TASKS);
      const storedResults = localStorage.getItem(RESEARCH_STORAGE_KEYS.RESULTS);
      const storedAudit = localStorage.getItem(RESEARCH_STORAGE_KEYS.AUDIT);

      if (storedPlans) this.plans = JSON.parse(storedPlans);
      if (storedTasks) this.tasks = JSON.parse(storedTasks);
      if (storedResults) this.results = JSON.parse(storedResults);
      if (storedAudit) this.auditLogs = JSON.parse(storedAudit);
    } catch (e) {
      console.error('Erreur chargement LOT 35 localStorage', e);
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(RESEARCH_STORAGE_KEYS.PLANS, JSON.stringify(this.plans));
      localStorage.setItem(RESEARCH_STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
      localStorage.setItem(RESEARCH_STORAGE_KEYS.RESULTS, JSON.stringify(this.results));
      localStorage.setItem(RESEARCH_STORAGE_KEYS.AUDIT, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.error('Erreur persistance LOT 35', e);
    }
  }

  public addAuditLog(
    actor: string,
    action: string,
    entityType: 'PLAN' | 'TASK' | 'RESULT' | 'REFERENCE' | 'ALL' | string,
    entityId: string,
    details: string,
    before?: string,
    after?: string,
    isDemo: boolean = false
  ): OsintResearchAudit {
    const log: OsintResearchAudit = {
      id: `AUDIT-PLAN-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      actor: actor || 'ANALYSTE-REF-01',
      action,
      entityType,
      entityId,
      details,
      before,
      after,
      isDemo
    };
    // Append-only : unshift pour lecture chronologique inversée, aucune suppression
    this.auditLogs.unshift(log);
    this.persist();
    return log;
  }

  public getAuditLogs(filterDemo?: boolean): OsintResearchAudit[] {
    if (filterDemo === undefined) return [...this.auditLogs];
    return this.auditLogs.filter(a => a.isDemo === filterDemo);
  }

  public getStoredEntity(storageKey: string, id: string, idField: string = 'id'): any | null {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const items: any[] = JSON.parse(stored);
        return items.find((item: any) => (item[idField] || item.id) === id) || null;
      }
    } catch {
      return null;
    }
    return null;
  }

  // =========================================================================
  // DISCIPLINE TEMPORELLE T0 DÉTERMINISTE (TEST 30)
  // RÈGLE UNIQUE : T0 = date de création du Plan de Recherche parent (parentPlan.createdAt)
  // isPostT0 et isPostPublication sont strictement distincts.
  // =========================================================================

  public computeTemporalDiscipline(params: {
    t0Str?: string | null;
    observedAtStr?: string | null;
    discoveredAtStr?: string | null;
    publicationAtStr?: string | null;
    manualPostT0Override?: boolean | null;
  }): {
    t0: string | null;
    isPostT0: boolean;
    isPostPublication: boolean;
    determinationMethod: 'CHRONOLOGIQUE_DETERMINISTE' | 'INDICATION_HUMAINE' | 'INDETERMINEE_DEFAUT';
    details: string;
  } {
    const t0 = params.t0Str && !isNaN(new Date(params.t0Str).getTime()) ? params.t0Str : null;
    const t0Ms = t0 ? new Date(t0).getTime() : NaN;

    const pubStr = params.publicationAtStr || params.observedAtStr;
    const pubMs = pubStr && !isNaN(new Date(pubStr).getTime()) ? new Date(pubStr).getTime() : NaN;

    const discStr = params.discoveredAtStr;
    const discMs = discStr && !isNaN(new Date(discStr).getTime()) ? new Date(discStr).getTime() : NaN;

    // 1. Calcul de isPostPublication : la découverte par l'analyste est-elle postérieure à la publication de la source ?
    let isPostPublication = false;
    if (!isNaN(discMs) && !isNaN(pubMs)) {
      isPostPublication = discMs > pubMs;
    }

    // 2. Calcul déterministe de isPostT0 :
    let isPostT0 = false;
    let determinationMethod: 'CHRONOLOGIQUE_DETERMINISTE' | 'INDICATION_HUMAINE' | 'INDETERMINEE_DEFAUT' = 'INDETERMINEE_DEFAUT';
    let details = '';

    if (!isNaN(t0Ms) && !isNaN(pubMs)) {
      // Les deux dates sont disponibles : calcul chronologique déterministe
      isPostT0 = pubMs > t0Ms;
      determinationMethod = 'CHRONOLOGIQUE_DETERMINISTE';
      details = `Calcul chronologique strict: Publication/Observation (${new Date(pubMs).toISOString()}) ${isPostT0 ? '>' : '<='} T0 (${new Date(t0Ms).toISOString()}).`;
      
      // Contrôle anti-falsification : si un override manuel contredit le calcul chronologique réel,
      // la réalité chronologique prévaut impérativement.
      if (params.manualPostT0Override !== undefined && params.manualPostT0Override !== null && params.manualPostT0Override !== isPostT0) {
        details += ` AVERTISSEMENT : L'indication manuelle (${params.manualPostT0Override}) contredit la chronologie réelle et a été rejetée.`;
      }
    } else if (params.manualPostT0Override !== undefined && params.manualPostT0Override !== null) {
      // Dates chronologiques absentes ou invalides : recours contrôlé à l'indication humaine
      isPostT0 = params.manualPostT0Override;
      determinationMethod = 'INDICATION_HUMAINE';
      details = `Indication humaine qualifiée retenue en l'absence de date chronologique complète pour T0 ou la publication.`;
    } else {
      // Dates et indication absentes
      isPostT0 = false;
      determinationMethod = 'INDETERMINEE_DEFAUT';
      details = `Date T0 ou de publication indéterminée. Statut post-T0 fixé à false par précaution doctrinale.`;
    }

    return {
      t0,
      isPostT0,
      isPostPublication,
      determinationMethod,
      details
    };
  }

  // =========================================================================
  // VALIDATION STRICTE DES RÉFÉRENCES (INTER-LOTS)
  // =========================================================================

  public validateReferences(refs: {
    requirementId?: string;
    questionIds?: string[];
    gapIds?: string[];
    indicatorIds?: string[];
    sourceIds?: string[];
    evidenceIds?: string[];
    planId?: string;
    taskId?: string;
  }): void {
    const validateStorageList = (
      ids: string[] | undefined,
      storageKey: string,
      entityName: string,
      idField: string = 'id'
    ) => {
      if (!ids || ids.length === 0) return;
      let validIds: string[] = [];
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const items: any[] = JSON.parse(stored);
          validIds = items.map(item => item[idField] || item.id);
        }
      } catch (e) {
        console.warn(`Erreur lecture ${storageKey}`, e);
      }

      ids.forEach(id => {
        if (!validIds.includes(id)) {
          throw new Error(`Référence invalide : ${entityName} ${id} inexistante`);
        }
      });
    };

    // 1. Besoin LOT 34
    if (refs.requirementId) {
      validateStorageList([refs.requirementId], 'OSINT_REQUIREMENTS_LOT34', 'Besoin LOT 34', 'requirementId');
    }

    // 2. Questions LOT 34
    if (refs.questionIds && refs.questionIds.length > 0) {
      validateStorageList(refs.questionIds, 'OSINT_REQUIREMENT_QUESTIONS_LOT34', 'Question LOT 34', 'questionId');
    }

    // 3. Lacunes LOT 34
    if (refs.gapIds && refs.gapIds.length > 0) {
      validateStorageList(refs.gapIds, 'OSINT_REQUIREMENT_GAPS_LOT34', 'Lacune LOT 34', 'gapId');
    }

    // 4. Indicateurs LOT 34
    if (refs.indicatorIds && refs.indicatorIds.length > 0) {
      validateStorageList(refs.indicatorIds, 'OSINT_REQUIREMENT_INDICATORS_LOT34', 'Indicateur LOT 34', 'indicatorId');
    }

    // 5. Sources LOT 22 / v2
    if (refs.sourceIds && refs.sourceIds.length > 0) {
      validateStorageList(refs.sourceIds, 'osint_africa_sources_v2', 'Source', 'id');
    }

    // 6. Preuves LOT 20 / v2
    if (refs.evidenceIds && refs.evidenceIds.length > 0) {
      validateStorageList(refs.evidenceIds, 'osint_africa_evidence_v2', 'Preuve', 'id');
    }

    // 7. Plan parent interne
    if (refs.planId) {
      const exists = this.plans.some(p => p.id === refs.planId);
      if (!exists) {
        throw new Error(`Référence invalide : Plan de recherche ${refs.planId} inexistant`);
      }
    }

    // 8. Tâche parente interne
    if (refs.taskId) {
      const exists = this.tasks.some(t => t.id === refs.taskId);
      if (!exists) {
        throw new Error(`Référence invalide : Tâche de recherche ${refs.taskId} inexistante`);
      }
    }
  }

  // =========================================================================
  // CALCUL TRANSPARENT DE PRIORITÉ DE RECHERCHE (0 À 100)
  // PRIORITÉ ≠ MENACE, PRIORITÉ ≠ PROBABILITÉ, PRIORITÉ ≠ CONFIANCE
  // =========================================================================

  public calculateResearchPriority(
    urgency: 'ROUTINE' | 'A_SURVEILLER' | 'PRIORITAIRE' | 'URGENTE' | 'CRITIQUE',
    gapCount: number = 1,
    hasCriticalGap: boolean = false,
    sourceCoverageDeficit: number = 0 // 0 (bien couvert) à 30 (lacune totale de sources)
  ): { priority: number; rationale: string } {
    let baseUrgencyScore = 15;
    switch (urgency) {
      case 'CRITIQUE': baseUrgencyScore = 40; break;
      case 'URGENTE': baseUrgencyScore = 30; break;
      case 'PRIORITAIRE': baseUrgencyScore = 22; break;
      case 'A_SURVEILLER': baseUrgencyScore = 15; break;
      case 'ROUTINE': baseUrgencyScore = 8; break;
    }

    const gapScore = Math.min(30, (gapCount * 8) + (hasCriticalGap ? 12 : 0));
    const coverageScore = Math.max(0, Math.min(30, sourceCoverageDeficit));

    const rawTotal = baseUrgencyScore + gapScore + coverageScore;
    const priority = Math.max(0, Math.min(100, Math.round(rawTotal)));

    const rationale = `Score Priorité: ${priority}/100 (Urgence traitement: ${baseUrgencyScore}pts, Lacunes de renseignement: ${gapScore}pts, Déficit de couverture sources: ${coverageScore}pts). Ne représente ni la gravité d une menace ni la véracité d une allégation.`;

    return { priority, rationale };
  }

  // =========================================================================
  // GESTION DES PLANS DE RECHERCHE (PLANS)
  // =========================================================================

  public listResearchPlans(filterDemo?: boolean): OsintResearchPlan[] {
    if (filterDemo === undefined) return [...this.plans];
    return this.plans.filter(p => p.isDemo === filterDemo);
  }

  public getResearchPlan(planId: string): OsintResearchPlan | undefined {
    return this.plans.find(p => p.id === planId);
  }

  public createResearchPlan(
    data: {
      requirementId: string;
      title: string;
      objective: string;
      scope: string;
      geographicScope: string;
      temporalScope: string;
      researchMethod: OsintResearchMethod;
      urgency?: 'ROUTINE' | 'A_SURVEILLER' | 'PRIORITAIRE' | 'URGENTE' | 'CRITIQUE';
      priority?: number;
      questionIds?: string[];
      gapIds?: string[];
      indicatorIds?: string[];
      sourceIds?: string[];
      isDemo?: boolean;
    },
    actorId: string = 'ANALYSTE-PLAN-01'
  ): OsintResearchPlan {
    // 1. Validation stricte des références
    this.validateReferences({
      requirementId: data.requirementId,
      questionIds: data.questionIds,
      gapIds: data.gapIds,
      indicatorIds: data.indicatorIds,
      sourceIds: data.sourceIds
    });

    const urgency = data.urgency || 'PRIORITAIRE';
    const computedPriority = data.priority !== undefined
      ? Math.max(0, Math.min(100, Math.round(data.priority)))
      : this.calculateResearchPriority(urgency, (data.gapIds || []).length, false, 15).priority;

    const newPlan: OsintResearchPlan = {
      id: `PLAN-RES-${new Date().getFullYear()}-${String(this.plans.length + 1).padStart(3, '0')}`,
      requirementId: data.requirementId,
      questionIds: data.questionIds || [],
      gapIds: data.gapIds || [],
      indicatorIds: data.indicatorIds || [],
      sourceIds: data.sourceIds || [],
      title: data.title.trim(),
      objective: data.objective.trim(),
      scope: data.scope.trim(),
      geographicScope: data.geographicScope.trim(),
      temporalScope: data.temporalScope.trim(),
      researchMethod: data.researchMethod,
      priority: computedPriority,
      urgency,
      status: 'PLANIFIE',
      taskIds: [],
      resultIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: actorId,
      isDemo: data.isDemo ?? false
    };

    this.plans.unshift(newPlan);
    this.addAuditLog(
      actorId,
      'CREATE_PLAN',
      'PLAN',
      newPlan.id,
      `Création du plan de recherche: ${newPlan.title}`,
      undefined,
      JSON.stringify(newPlan),
      newPlan.isDemo
    );
    this.persist();
    return newPlan;
  }

  public updateResearchPlan(
    planId: string,
    updates: Partial<OsintResearchPlan>,
    actorId: string = 'ANALYSTE-PLAN-01',
    justification?: string
  ): OsintResearchPlan {
    const index = this.plans.findIndex(p => p.id === planId);
    if (index === -1) throw new Error(`Plan de recherche ${planId} non trouvé`);

    const current = this.plans[index];

    // VERROUILLAGE CRITIQUE D'IMMUTABILITÉ CÔTÉ SERVICE
    if (current.status === 'ARCHIVE') {
      throw new Error("Un plan de recherche archivé est immuable et verrouillé au niveau service. Aucune modification n'est permise.");
    }
    if (current.status === 'ANNULE') {
      throw new Error("Un plan de recherche annulé ne peut plus être modifié. Seul son archivage réglementaire est possible.");
    }

    // Validation des références si modifiées
    this.validateReferences({
      requirementId: updates.requirementId,
      questionIds: updates.questionIds,
      gapIds: updates.gapIds,
      indicatorIds: updates.indicatorIds,
      sourceIds: updates.sourceIds
    });

    let newPriority = current.priority;
    if (updates.priority !== undefined) {
      newPriority = Math.max(0, Math.min(100, Math.round(updates.priority)));
    } else if (updates.urgency || updates.gapIds) {
      const urg = updates.urgency || current.urgency;
      const gCount = updates.gapIds ? updates.gapIds.length : current.gapIds.length;
      newPriority = this.calculateResearchPriority(urg, gCount, false, 15).priority;
    }

    const updated: OsintResearchPlan = {
      ...current,
      ...updates,
      priority: newPriority,
      updatedAt: new Date().toISOString()
    };

    this.plans[index] = updated;
    this.addAuditLog(
      actorId,
      'UPDATE_PLAN',
      'PLAN',
      planId,
      justification || 'Mise à jour des paramètres du plan de recherche',
      JSON.stringify(current),
      JSON.stringify(updated),
      current.isDemo
    );
    this.persist();
    return updated;
  }

  // Matrice des transitions d'état formelles du workflow des plans de recherche
  public static readonly ALLOWED_PLAN_TRANSITIONS: Record<OsintResearchPlanStatus, OsintResearchPlanStatus[]> = {
    BROUILLON: ['A_PREPARER', 'ANNULE'],
    A_PREPARER: ['PLANIFIE', 'BROUILLON', 'ANNULE'],
    PLANIFIE: ['EN_RECHERCHE', 'SUSPENDU', 'ANNULE'],
    EN_RECHERCHE: ['RESULTATS_COLLECTES', 'SUSPENDU', 'ANNULE'],
    RESULTATS_COLLECTES: ['EN_EVALUATION', 'EN_RECHERCHE', 'SUSPENDU', 'ANNULE'],
    EN_EVALUATION: ['TERMINE', 'EN_RECHERCHE', 'SUSPENDU', 'ANNULE'],
    SUSPENDU: ['PLANIFIE', 'EN_RECHERCHE', 'ANNULE'],
    TERMINE: ['ARCHIVE', 'OBSOLETE'],
    OBSOLETE: ['ARCHIVE'],
    ANNULE: ['ARCHIVE'],
    ARCHIVE: [] // État terminal scellé
  };

  public validatePlanStatusTransition(currentStatus: OsintResearchPlanStatus, targetStatus: OsintResearchPlanStatus): void {
    if (currentStatus === 'ARCHIVE') {
      throw new Error("Un plan archivé est immuable et verrouillé au niveau service. Aucune transition de statut n'est permise.");
    }
    if (currentStatus === targetStatus) return;

    const allowed = ResearchPlanningService.ALLOWED_PLAN_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new Error(
        `Transition de statut non autorisée : passage impossible de ${currentStatus} vers ${targetStatus}. Transitions valides autorisées : [${allowed.join(', ') || 'aucune (état terminal)'}].`
      );
    }
  }

  public changeResearchPlanStatus(
    planId: string,
    newStatus: OsintResearchPlanStatus,
    justification: string,
    actorId: string = 'ANALYSTE-PLAN-01'
  ): OsintResearchPlan {
    const index = this.plans.findIndex(p => p.id === planId);
    if (index === -1) throw new Error(`Plan de recherche ${planId} non trouvé`);

    const current = this.plans[index];
    if (current.status === 'ARCHIVE') {
      throw new Error("Un plan archivé ne peut plus changer de statut.");
    }

    if (!justification || justification.trim().length < 5) {
      throw new Error("Une justification formelle d'au moins 5 caractères est requise pour tout changement de statut de plan.");
    }

    // Contrôle strict du workflow de transitions (bloque notamment BROUILLON -> ARCHIVE)
    this.validatePlanStatusTransition(current.status, newStatus);

    const before = current.status;
    const updated: OsintResearchPlan = {
      ...current,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      ...(newStatus === 'ARCHIVE' ? { archivedAt: new Date().toISOString(), archiveReason: justification } : {})
    };

    this.plans[index] = updated;
    this.addAuditLog(
      actorId,
      newStatus === 'ARCHIVE' ? 'ARCHIVE_PLAN' : 'STATUS_CHANGE',
      'PLAN',
      planId,
      `Changement statut: ${before} -> ${newStatus} (${justification})`,
      before,
      newStatus,
      current.isDemo
    );
    this.persist();
    return updated;
  }

  public archiveResearchPlan(
    planId: string,
    reason: string,
    actorId: string = 'ANALYSTE-PLAN-01'
  ): OsintResearchPlan {
    return this.changeResearchPlanStatus(planId, 'ARCHIVE', reason || 'Archivage réglementaire du plan de recherche', actorId);
  }

  // =========================================================================
  // GESTION DES TÂCHES DE RECHERCHE (TASKS)
  // =========================================================================

  public listResearchTasks(planId?: string, filterDemo?: boolean): OsintResearchTask[] {
    let list = [...this.tasks];
    if (planId) list = list.filter(t => t.planId === planId);
    if (filterDemo !== undefined) list = list.filter(t => t.isDemo === filterDemo);
    return list;
  }

  public getResearchTask(taskId: string): OsintResearchTask | undefined {
    return this.tasks.find(t => t.id === taskId);
  }

  public createResearchTask(
    data: {
      planId: string;
      requirementId: string;
      questionId: string;
      indicatorId?: string;
      sourceIds: string[];
      description: string;
      objective: string;
      method: OsintResearchMethod;
      assignedTo?: string;
      dueDate?: string;
      isDemo?: boolean;
    },
    actorId: string = 'ANALYSTE-PLAN-01'
  ): OsintResearchTask {
    // 1. Verrouillage si le plan parent est archivé
    const parentPlan = this.getResearchPlan(data.planId);
    if (!parentPlan) throw new Error(`Plan parent ${data.planId} introuvable`);
    if (parentPlan.status === 'ARCHIVE') {
      throw new Error("Impossible d'ajouter une tâche à un plan archivé.");
    }

    // 2. Validation stricte des références
    this.validateReferences({
      planId: data.planId,
      requirementId: data.requirementId,
      questionIds: [data.questionId],
      indicatorIds: data.indicatorId ? [data.indicatorId] : undefined,
      sourceIds: data.sourceIds
    });

    const newTask: OsintResearchTask = {
      id: `TASK-RES-${new Date().getFullYear()}-${String(this.tasks.length + 1).padStart(3, '0')}`,
      planId: data.planId,
      requirementId: data.requirementId,
      questionId: data.questionId,
      indicatorId: data.indicatorId,
      sourceIds: data.sourceIds || [],
      description: data.description.trim(),
      objective: data.objective.trim(),
      method: data.method,
      status: 'A_FAIRE',
      assignedTo: data.assignedTo || 'ANALYSTE-OPS-01',
      dueDate: data.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      resultIds: [],
      isDemo: data.isDemo ?? parentPlan.isDemo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.tasks.unshift(newTask);

    // Mettre à jour la relation sur le plan parent
    if (!parentPlan.taskIds.includes(newTask.id)) {
      parentPlan.taskIds.push(newTask.id);
      parentPlan.updatedAt = new Date().toISOString();
      if (parentPlan.status === 'BROUILLON' || parentPlan.status === 'A_PREPARER') {
        parentPlan.status = 'PLANIFIE';
      }
    }

    this.addAuditLog(
      actorId,
      'CREATE_TASK',
      'TASK',
      newTask.id,
      `Création tâche ${newTask.id} liée au plan ${newTask.planId}`,
      undefined,
      JSON.stringify(newTask),
      newTask.isDemo
    );
    this.persist();
    return newTask;
  }

  public updateResearchTask(
    taskId: string,
    updates: Partial<OsintResearchTask>,
    actorId: string = 'ANALYSTE-PLAN-01',
    justification?: string
  ): OsintResearchTask {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index === -1) throw new Error(`Tâche ${taskId} non trouvée`);

    const current = this.tasks[index];
    const parentPlan = this.getResearchPlan(current.planId);
    if (parentPlan && parentPlan.status === 'ARCHIVE') {
      throw new Error("Impossible de modifier une tâche d'un plan archivé.");
    }

    // Validation des références si modifiées
    this.validateReferences({
      requirementId: updates.requirementId,
      questionIds: updates.questionId ? [updates.questionId] : undefined,
      indicatorIds: updates.indicatorId ? [updates.indicatorId] : undefined,
      sourceIds: updates.sourceIds
    });

    const updated: OsintResearchTask = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
      ...(updates.status === 'TERMINEE' && !current.completedAt ? { completedAt: new Date().toISOString() } : {})
    };

    this.tasks[index] = updated;
    this.addAuditLog(
      actorId,
      'UPDATE_TASK',
      'TASK',
      taskId,
      justification || 'Mise à jour des paramètres de la tâche',
      JSON.stringify(current),
      JSON.stringify(updated),
      current.isDemo
    );
    this.persist();
    return updated;
  }

  // =========================================================================
  // GESTION DES RÉSULTATS DE RECHERCHE (RESULTS)
  // RÉSULTAT BRUT ≠ FAIT VALIDÉ
  // =========================================================================

  public listResearchResults(planId?: string, taskId?: string, filterDemo?: boolean): OsintResearchResult[] {
    let list = [...this.results];
    if (planId) list = list.filter(r => r.planId === planId);
    if (taskId) list = list.filter(r => r.taskId === taskId);
    if (filterDemo !== undefined) list = list.filter(r => r.isDemo === filterDemo);
    return list;
  }

  public getResearchResult(resultId: string): OsintResearchResult | undefined {
    return this.results.find(r => r.id === resultId);
  }

  public createResearchResult(
    data: {
      taskId: string;
      planId: string;
      requirementId: string;
      questionId: string;
      sourceId: string;
      evidenceIds?: string[];
      content: string;
      observedAt: string;
      discoveredAt?: string;
      relevance?: OsintResearchResultRelevance;
      confidence?: OsintResearchResultConfidence;
      verificationStatus?: OsintResearchVerificationStatus;
      isPostPublication?: boolean;
      isPostT0?: boolean;
      isDemo?: boolean;
    },
    actorId: string = 'ANALYSTE-OPS-01'
  ): OsintResearchResult {
    // 1. Verrouillage si plan archivé
    const parentPlan = this.getResearchPlan(data.planId);
    if (!parentPlan) throw new Error(`Plan parent ${data.planId} introuvable`);
    if (parentPlan.status === 'ARCHIVE') {
      throw new Error("Impossible d'ajouter un résultat à un plan archivé.");
    }

    // 2. Validation stricte des références
    this.validateReferences({
      taskId: data.taskId,
      planId: data.planId,
      requirementId: data.requirementId,
      questionIds: [data.questionId],
      sourceIds: [data.sourceId],
      evidenceIds: data.evidenceIds
    });

    // 3. Détermination rigoureuse et déterministe de la discipline temporelle T0 :
    // T0 unique = date de création du plan parent cadrant les recherches.
    const temporal = this.computeTemporalDiscipline({
      t0Str: parentPlan.createdAt,
      observedAtStr: data.observedAt,
      discoveredAtStr: data.discoveredAt,
      manualPostT0Override: data.isPostT0
    });

    const newResult: OsintResearchResult = {
      id: `RES-OBS-${new Date().getFullYear()}-${String(this.results.length + 1).padStart(3, '0')}`,
      taskId: data.taskId,
      planId: data.planId,
      requirementId: data.requirementId,
      questionId: data.questionId,
      sourceId: data.sourceId,
      evidenceIds: data.evidenceIds || [],
      content: data.content.trim(),
      observedAt: data.observedAt || new Date().toISOString(),
      discoveredAt: data.discoveredAt || new Date().toISOString(),
      relevance: data.relevance || 'A_VERIFIER',
      confidence: data.confidence || 'MOYENNE',
      verificationStatus: data.verificationStatus || 'BRUT',
      isPostPublication: temporal.isPostPublication,
      isPostT0: temporal.isPostT0,
      isDemo: data.isDemo ?? parentPlan.isDemo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.results.unshift(newResult);

    // Mettre à jour la tâche et le plan
    const task = this.getResearchTask(data.taskId);
    if (task && !task.resultIds.includes(newResult.id)) {
      task.resultIds.push(newResult.id);
      task.updatedAt = new Date().toISOString();
      if (task.status === 'A_FAIRE') task.status = 'EN_COURS';
    }

    if (!parentPlan.resultIds.includes(newResult.id)) {
      parentPlan.resultIds.push(newResult.id);
      parentPlan.updatedAt = new Date().toISOString();
      if (parentPlan.status === 'PLANIFIE' || parentPlan.status === 'EN_RECHERCHE') {
        parentPlan.status = 'RESULTATS_COLLECTES';
      }
    }

    this.addAuditLog(
      actorId,
      'CREATE_RESULT',
      'RESULT',
      newResult.id,
      `Consignation du résultat de recherche ${newResult.id} lié à la source ${newResult.sourceId}`,
      undefined,
      JSON.stringify(newResult),
      newResult.isDemo
    );
    this.persist();
    return newResult;
  }

  public updateResearchResult(
    resultId: string,
    updates: Partial<OsintResearchResult>,
    actorId: string = 'ANALYSTE-EVAL-01',
    evaluatorNotes?: string
  ): OsintResearchResult {
    const index = this.results.findIndex(r => r.id === resultId);
    if (index === -1) throw new Error(`Résultat ${resultId} non trouvé`);

    const current = this.results[index];
    const parentPlan = this.getResearchPlan(current.planId);
    if (parentPlan && parentPlan.status === 'ARCHIVE') {
      throw new Error("Impossible de modifier un résultat d'un plan archivé.");
    }

    // Validation des références si modifiées
    this.validateReferences({
      requirementId: updates.requirementId,
      questionIds: updates.questionId ? [updates.questionId] : undefined,
      sourceIds: updates.sourceId ? [updates.sourceId] : undefined,
      evidenceIds: updates.evidenceIds
    });

    const isPostT0 = updates.isPostT0 ?? updates.isPostPublication ?? current.isPostT0 ?? current.isPostPublication;

    const updated: OsintResearchResult = {
      ...current,
      ...updates,
      isPostPublication: isPostT0,
      isPostT0,
      evaluatorNotes: evaluatorNotes || updates.evaluatorNotes || current.evaluatorNotes,
      evaluatedAt: evaluatorNotes ? new Date().toISOString() : current.evaluatedAt,
      evaluatedBy: evaluatorNotes ? actorId : current.evaluatedBy,
      updatedAt: new Date().toISOString()
    };

    this.results[index] = updated;

    this.addAuditLog(
      actorId,
      evaluatorNotes ? 'EVALUATE_RESULT' : 'UPDATE_RESULT',
      'RESULT',
      resultId,
      evaluatorNotes ? `Évaluation humaine du résultat ${resultId} : ${updated.relevance} / ${updated.verificationStatus}` : 'Mise à jour du résultat de recherche',
      JSON.stringify(current),
      JSON.stringify(updated),
      current.isDemo
    );
    this.persist();
    return updated;
  }

  // =========================================================================
  // TRAÇABILITÉ INTÉGRALE DESCENDANTE & REMONTANTE
  // =========================================================================

  public getTraceabilityChain(planId?: string): {
    descending: TraceabilityChainNode[];
    ascending: TraceabilityChainNode[];
  } {
    const plansToInspect = planId ? this.plans.filter(p => p.id === planId) : this.plans.slice(0, 5);

    // 1. Arborescence descendante :
    // BESOIN -> QUESTION -> LACUNE -> INDICATEUR -> SOURCE -> PLAN -> TÂCHE -> RÉSULTAT -> PREUVE
    const descending: TraceabilityChainNode[] = plansToInspect.map(plan => {
      const planTasks = this.tasks.filter(t => t.planId === plan.id);
      const planResults = this.results.filter(r => r.planId === plan.id);

      const tasksNodes: TraceabilityChainNode[] = planTasks.map(task => {
        const taskResults = planResults.filter(r => r.taskId === task.id);
        const resultsNodes: TraceabilityChainNode[] = taskResults.map(res => {
          const evidenceChildren: TraceabilityChainNode[] = res.evidenceIds.map(evId => {
            const ev = this.getStoredEntity('osint_africa_evidence_v2', evId, 'id');
            return ev ? {
              type: 'EVIDENCE',
              id: evId,
              label: `Preuve ${evId} (${ev.name || ev.type || 'Consignée'})`,
              status: 'CONSIGNÉE',
              details: `Réf source: ${res.sourceId}`
            } : {
              type: 'EVIDENCE',
              id: evId,
              label: `Preuve ${evId} introuvable (rupture de traçabilité)`,
              status: 'RUPTURE_LIEN'
            };
          });

          return {
            type: 'RESULT',
            id: res.id,
            label: `Résultat: ${res.content.substring(0, 55)}...`,
            status: `${res.relevance} (${res.verificationStatus})`,
            details: `Obs: ${res.observedAt} | Post-T0: ${res.isPostT0 ? 'OUI' : 'NON'} | Confiance: ${res.confidence}`,
            children: evidenceChildren
          };
        });

        return {
          type: 'TASK',
          id: task.id,
          label: `Tâche: ${task.description.substring(0, 50)}...`,
          status: task.status,
          details: `Méthode: ${task.method} | Échéance: ${task.dueDate}`,
          children: resultsNodes
        };
      });

      const planNode: TraceabilityChainNode = {
        type: 'PLAN',
        id: plan.id,
        label: `Plan: ${plan.title}`,
        status: plan.status,
        details: `Priorité: ${plan.priority}/100 | Méthode: ${plan.researchMethod}`,
        children: tasksNodes
      };

      const sourceNodes: TraceabilityChainNode[] = plan.sourceIds.map(sId => {
        const s = this.getStoredEntity('osint_africa_sources_v2', sId, 'id');
        return s ? {
          type: 'SOURCE',
          id: sId,
          label: `Source ciblée ${sId} (${s.name || s.type || 'Documentée'})`,
          status: 'QUALIFIÉE',
          children: [planNode]
        } : {
          type: 'SOURCE',
          id: sId,
          label: `Source ${sId} introuvable (rupture de traçabilité)`,
          status: 'RUPTURE_LIEN',
          children: [planNode]
        };
      });

      const indicatorNodes: TraceabilityChainNode[] = plan.indicatorIds.map(indId => {
        const ind = this.getStoredEntity('OSINT_REQUIREMENT_INDICATORS_LOT34', indId, 'indicatorId');
        return ind ? {
          type: 'INDICATOR',
          id: indId,
          label: `Indicateur de veille ${indId} (${ind.label || 'Actif'})`,
          status: 'ACTIF',
          children: sourceNodes.length > 0 ? sourceNodes : [planNode]
        } : {
          type: 'INDICATOR',
          id: indId,
          label: `Indicateur ${indId} introuvable (rupture de traçabilité)`,
          status: 'RUPTURE_LIEN',
          children: sourceNodes.length > 0 ? sourceNodes : [planNode]
        };
      });

      const gapNodes: TraceabilityChainNode[] = plan.gapIds.map(gapId => {
        const gap = this.getStoredEntity('OSINT_REQUIREMENT_GAPS_LOT34', gapId, 'gapId');
        return gap ? {
          type: 'GAP',
          id: gapId,
          label: `Lacune de renseignement ${gapId}`,
          status: gap.status || 'A_COMBATTRE',
          children: indicatorNodes.length > 0 ? indicatorNodes : (sourceNodes.length > 0 ? sourceNodes : [planNode])
        } : {
          type: 'GAP',
          id: gapId,
          label: `Lacune ${gapId} introuvable (rupture de traçabilité)`,
          status: 'RUPTURE_LIEN',
          children: indicatorNodes.length > 0 ? indicatorNodes : (sourceNodes.length > 0 ? sourceNodes : [planNode])
        };
      });

      const questionNodes: TraceabilityChainNode[] = plan.questionIds.map(qId => {
        const q = this.getStoredEntity('OSINT_REQUIREMENT_QUESTIONS_LOT34', qId, 'questionId');
        return q ? {
          type: 'QUESTION',
          id: qId,
          label: `Question: ${q.question ? q.question.substring(0, 45) : qId}...`,
          status: q.status || 'OUVERTE',
          children: gapNodes.length > 0 ? gapNodes : (indicatorNodes.length > 0 ? indicatorNodes : (sourceNodes.length > 0 ? sourceNodes : [planNode]))
        } : {
          type: 'QUESTION',
          id: qId,
          label: `Question ${qId} introuvable (rupture de traçabilité)`,
          status: 'RUPTURE_LIEN',
          children: gapNodes.length > 0 ? gapNodes : (indicatorNodes.length > 0 ? indicatorNodes : (sourceNodes.length > 0 ? sourceNodes : [planNode]))
        };
      });

      const req = this.getStoredEntity('OSINT_REQUIREMENTS_LOT34', plan.requirementId, 'requirementId');
      return req ? {
        type: 'REQUIREMENT',
        id: plan.requirementId,
        label: `Besoin parent: ${req.title || plan.requirementId}`,
        status: req.status || 'ACTIF',
        children: questionNodes.length > 0 ? questionNodes : (gapNodes.length > 0 ? gapNodes : [planNode])
      } : {
        type: 'REQUIREMENT',
        id: plan.requirementId,
        label: `Besoin parent ${plan.requirementId} introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN',
        children: questionNodes.length > 0 ? questionNodes : (gapNodes.length > 0 ? gapNodes : [planNode])
      };
    });

    // 2. Arborescence remontante :
    // PREUVE -> RÉSULTAT -> TÂCHE -> PLAN -> QUESTION -> BESOIN
    const ascending: TraceabilityChainNode[] = [];
    const recentResults = this.results.slice(0, 10);

    recentResults.forEach(res => {
      const task = this.getResearchTask(res.taskId);
      const plan = this.getResearchPlan(res.planId);
      const q = this.getStoredEntity('OSINT_REQUIREMENT_QUESTIONS_LOT34', res.questionId, 'questionId');
      const req = this.getStoredEntity('OSINT_REQUIREMENTS_LOT34', res.requirementId, 'requirementId');

      const requirementNode: TraceabilityChainNode = req ? {
        type: 'REQUIREMENT',
        id: res.requirementId,
        label: `Besoin parent: ${req.title || res.requirementId}`,
        status: req.status || 'RETROACTION_VALIDE'
      } : {
        type: 'REQUIREMENT',
        id: res.requirementId,
        label: `Besoin ${res.requirementId} introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN'
      };

      const questionNode: TraceabilityChainNode = q ? {
        type: 'QUESTION',
        id: res.questionId,
        label: `Question: ${q.question ? q.question.substring(0, 45) : res.questionId}...`,
        status: q.status || 'ANALYSEE',
        children: [requirementNode]
      } : {
        type: 'QUESTION',
        id: res.questionId,
        label: `Question ${res.questionId} introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN',
        children: [requirementNode]
      };

      const planNode: TraceabilityChainNode = plan ? {
        type: 'PLAN',
        id: plan.id,
        label: `Plan ${plan.id} (${plan.title})`,
        status: plan.status,
        children: [questionNode]
      } : {
        type: 'PLAN',
        id: res.planId,
        label: `Plan ${res.planId} introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN',
        children: [questionNode]
      };

      const taskNode: TraceabilityChainNode = task ? {
        type: 'TASK',
        id: task.id,
        label: `Tâche ${task.id} (${task.status})`,
        status: task.status,
        details: `Méthode: ${task.method}`,
        children: [planNode]
      } : {
        type: 'TASK',
        id: res.taskId,
        label: `Tâche ${res.taskId} introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN',
        children: [planNode]
      };

      const resultNode: TraceabilityChainNode = {
        type: 'RESULT',
        id: res.id,
        label: `Résultat: ${res.content.substring(0, 50)}...`,
        status: `${res.relevance} (${res.verificationStatus})`,
        details: `Post-T0: ${res.isPostT0 ? 'OUI' : 'NON'} | Confiance: ${res.confidence}`,
        children: [taskNode]
      };

      // Si le résultat est adossé à des preuves, la preuve est le point de départ de la chaîne remontante
      if (res.evidenceIds && res.evidenceIds.length > 0) {
        res.evidenceIds.forEach(evId => {
          const ev = this.getStoredEntity('osint_africa_evidence_v2', evId, 'id');
          ascending.push(ev ? {
            type: 'EVIDENCE',
            id: evId,
            label: `Preuve: ${ev.name || ev.id}`,
            status: 'CONSIGNÉE',
            details: `Source parente: ${res.sourceId}`,
            children: [resultNode]
          } : {
            type: 'EVIDENCE',
            id: evId,
            label: `Preuve ${evId} introuvable (rupture de traçabilité)`,
            status: 'RUPTURE_LIEN',
            details: `Source parente: ${res.sourceId}`,
            children: [resultNode]
          });
        });
      } else {
        // Sinon, la source d'observation est le point de départ
        const s = this.getStoredEntity('osint_africa_sources_v2', res.sourceId, 'id');
        ascending.push(s ? {
          type: 'SOURCE',
          id: res.sourceId,
          label: `Source d'origine: ${s.name || res.sourceId}`,
          status: 'QUALIFIÉE',
          children: [resultNode]
        } : {
          type: 'SOURCE',
          id: res.sourceId,
          label: `Source ${res.sourceId} introuvable (rupture de traçabilité)`,
          status: 'RUPTURE_LIEN',
          children: [resultNode]
        });
      }
    });

    return { descending, ascending };
  }

  // =========================================================================
  // EXPORT JSON SOUVERAIN (0 APPEL RÉSEAU)
  // =========================================================================

  public exportResearchPlanningJson(isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): string {
    const d = isDemoFilter === 'ALL' ? undefined : isDemoFilter === 'DEMO';

    const data = {
      exportVersion: '1.0.0',
      applicationVersion: '35.0.0',
      lot: 'LOT_35_RESEARCH_PLANNING_CENTER',
      generatedAt: new Date().toISOString(),
      filtres: {
        isDemo: isDemoFilter
      },
      provenance: 'OSINT_AFRICA_SOVEREIGN_LOCAL',
      doctrinalNotice: 'PLANIFICATION ≠ COLLECTE. Données issues exclusivement du stockage local sans scraping, ni crawler, ni appel réseau sortant.',
      plans: this.listResearchPlans(d),
      tasks: this.listResearchTasks(undefined, d),
      results: this.listResearchResults(undefined, undefined, d),
      audit: this.getAuditLogs(d)
    };

    this.addAuditLog(
      'USER',
      'EXPORT_CREATED',
      'ALL',
      'ALL',
      'Export JSON manuel complet du Centre de Planification de la Recherche',
      undefined,
      undefined,
      isDemoFilter === 'DEMO'
    );

    return JSON.stringify(data, null, 2);
  }

  // =========================================================================
  // INITIALISATION DU JEU DE DONNÉES DE DÉMO (CONNECTÉ AUX LOTS 34, 22, 20)
  // =========================================================================

  private initializeDemoData(): void {
    // Plans connectés aux vrais besoins du LOT 34
    const plan1: OsintResearchPlan = {
      id: 'PLAN-RES-2026-001',
      requirementId: 'REQ-2026-001',
      questionIds: ['Q-REQ-001', 'Q-REQ-002'],
      gapIds: ['GAP-REQ-001'],
      indicatorIds: ['IND-REQ-001'],
      sourceIds: ['SRC-001', 'SRC-012'],
      title: 'Plan d investigation sur les pistes logistiques d évitement au Liptako-Gourma',
      objective: 'Documenter les itinéraires de contournement des check-points fixes entre Menaka et Tillabéri et identifier les flux de carburant clandestin.',
      scope: 'Corridor transfrontalier Mali-Niger, axes non goudronnés à l ouest d Andéramboukane.',
      geographicScope: 'Mali (Ménaka, Gao), Niger (Tillabéri, Bankilaré)',
      temporalScope: 'Février - Mars 2026',
      researchMethod: 'analyse_geographique',
      priority: 85,
      urgency: 'URGENTE',
      status: 'EN_RECHERCHE',
      taskIds: ['TASK-RES-2026-001', 'TASK-RES-2026-002'],
      resultIds: ['RES-OBS-2026-001'],
      createdAt: '2026-03-03T10:00:00Z',
      updatedAt: '2026-03-09T14:30:00Z',
      createdBy: 'ANALYSTE-SAHEL-01',
      isDemo: true
    };

    const plan2: OsintResearchPlan = {
      id: 'PLAN-RES-2026-002',
      requirementId: 'REQ-2026-002',
      questionIds: ['Q-REQ-003'],
      gapIds: ['GAP-REQ-002'],
      indicatorIds: ['IND-REQ-002'],
      sourceIds: ['SRC-004'],
      title: 'Surveillance des transbordements maritimes atypiques dans le Golfe de Guinée',
      objective: 'Corréler les coupures d émetteurs AIS des pétroliers et les approvisionnements côtiers illicites dans la ZEE du Bénin et du Nigéria.',
      scope: 'ZEE Bénin / Nigéria, mouillages forains hors radar portuaire.',
      geographicScope: 'Bénin (Cotonou offshore), Nigéria (Lagos roadstead)',
      temporalScope: 'T1 2026 (Janvier - Mars)',
      researchMethod: 'analyse_temporelle',
      priority: 72,
      urgency: 'PRIORITAIRE',
      status: 'RESULTATS_COLLECTES',
      taskIds: ['TASK-RES-2026-003'],
      resultIds: ['RES-OBS-2026-002'],
      createdAt: '2026-03-04T11:00:00Z',
      updatedAt: '2026-03-10T16:15:00Z',
      createdBy: 'ANALYSTE-MARITIME-01',
      isDemo: true
    };

    const plan3: OsintResearchPlan = {
      id: 'PLAN-RES-2026-003',
      requirementId: 'REQ-2026-003',
      questionIds: ['Q-REQ-004'],
      gapIds: ['GAP-REQ-003'],
      indicatorIds: ['IND-REQ-003'],
      sourceIds: ['SRC-020'],
      title: 'Cartographie des circuits d orpaillage artisanal et flux transfrontaliers Grands Lacs',
      objective: 'Mettre en évidence les divergences entre production déclarée des comptoirs du Sud-Kivu et volumes réexportés par les pays voisins.',
      scope: 'Comptoirs de Bukavu, postes de transit frontière Rwanda/Burundi.',
      geographicScope: 'RDC (Sud-Kivu), Rwanda (Kamembe), Burundi',
      temporalScope: 'Janvier - Mars 2026',
      researchMethod: 'analyse_donnees_publiques',
      priority: 68,
      urgency: 'PRIORITAIRE',
      status: 'EN_EVALUATION',
      taskIds: ['TASK-RES-2026-004'],
      resultIds: ['RES-OBS-2026-003'],
      createdAt: '2026-02-28T09:30:00Z',
      updatedAt: '2026-03-12T17:00:00Z',
      createdBy: 'ANALYSTE-GRANDS-LACS-01',
      isDemo: true
    };

    const plan4: OsintResearchPlan = {
      id: 'PLAN-RES-2026-004',
      requirementId: 'REQ-2026-004',
      questionIds: ['Q-REQ-005'],
      gapIds: [],
      indicatorIds: [],
      sourceIds: ['SRC-002', 'SRC-011'],
      title: 'Observatoire des corridors pastoraux et points d eau - Bassin du Lac Tchad',
      objective: 'Établir la carte des zones d accueil temporaire des éleveurs nomades évitant les tensions avec les communautés sédentaires.',
      scope: 'Zones inondables du Chari-Logone et rives méridionales du Lac Tchad.',
      geographicScope: 'Tchad, Cameroun (Extrême-Nord), Niger',
      temporalScope: 'Saison sèche 2026',
      researchMethod: 'recherche_contextuelle',
      priority: 45,
      urgency: 'A_SURVEILLER',
      status: 'ARCHIVE',
      taskIds: ['TASK-RES-2026-005'],
      resultIds: [],
      createdAt: '2026-03-01T08:00:00Z',
      updatedAt: '2026-03-11T12:00:00Z',
      createdBy: 'ANALYSTE-TCHAD-01',
      isDemo: true,
      archiveReason: 'Cycle d observation initial clôturé et capitalisé vers RETEX',
      archivedAt: '2026-03-11T12:00:00Z'
    };

    // Tâches
    const task1: OsintResearchTask = {
      id: 'TASK-RES-2026-001',
      planId: 'PLAN-RES-2026-001',
      requirementId: 'REQ-2026-001',
      questionId: 'Q-REQ-001',
      indicatorId: 'IND-REQ-001',
      sourceIds: ['SRC-001', 'SRC-012'],
      description: 'Relever les témoignages locaux et bulletins d information sur la piste Bankilaré-Inates.',
      objective: 'Confirmer si des convois de pick-ups sans immatriculation empruntent ce passage nocturne.',
      method: 'veille_documentaire',
      status: 'EN_COURS',
      assignedTo: 'ANALYSTE-SAHEL-01',
      dueDate: '2026-03-20',
      resultIds: ['RES-OBS-2026-001'],
      isDemo: true,
      createdAt: '2026-03-03T10:30:00Z',
      updatedAt: '2026-03-08T11:00:00Z'
    };

    const task2: OsintResearchTask = {
      id: 'TASK-RES-2026-002',
      planId: 'PLAN-RES-2026-001',
      requirementId: 'REQ-2026-001',
      questionId: 'Q-REQ-002',
      sourceIds: ['SRC-004'],
      description: 'Vérification croisée des immatriculations signalées lors des mouvements du 4 mars.',
      objective: 'Distinguer véhicules commerciaux réguliers et véhicules réquisitionnés sous la contrainte.',
      method: 'verification',
      status: 'A_FAIRE',
      assignedTo: 'ANALYSTE-SAHEL-02',
      dueDate: '2026-03-25',
      resultIds: [],
      isDemo: true,
      createdAt: '2026-03-05T14:00:00Z',
      updatedAt: '2026-03-05T14:00:00Z'
    };

    const task3: OsintResearchTask = {
      id: 'TASK-RES-2026-003',
      planId: 'PLAN-RES-2026-002',
      requirementId: 'REQ-2026-002',
      questionId: 'Q-REQ-003',
      indicatorId: 'IND-REQ-002',
      sourceIds: ['SRC-004'],
      description: 'Croisement chronologique des escales déclarées à Cotonou et des fenêtres de silence AIS.',
      objective: 'Isoler les anomalies de temps de parcours entre Cotonou et les terminaux pétroliers du delta.',
      method: 'analyse_temporelle',
      status: 'TERMINEE',
      assignedTo: 'ANALYSTE-MARITIME-01',
      dueDate: '2026-03-12',
      completedAt: '2026-03-10T16:00:00Z',
      resultIds: ['RES-OBS-2026-002'],
      isDemo: true,
      createdAt: '2026-03-04T11:30:00Z',
      updatedAt: '2026-03-10T16:00:00Z'
    };

    const task4: OsintResearchTask = {
      id: 'TASK-RES-2026-004',
      planId: 'PLAN-RES-2026-003',
      requirementId: 'REQ-2026-003',
      questionId: 'Q-REQ-004',
      indicatorId: 'IND-REQ-003',
      sourceIds: ['SRC-020'],
      description: 'Audit des registres d exportation douaniers et statistiques des comptoirs agréés.',
      objective: 'Quantifier l écart entre volume extrait déclaré et volume exporté certifié.',
      method: 'analyse_donnees_publiques',
      status: 'TERMINEE',
      assignedTo: 'ANALYSTE-GRANDS-LACS-01',
      dueDate: '2026-03-15',
      completedAt: '2026-03-12T16:30:00Z',
      resultIds: ['RES-OBS-2026-003'],
      isDemo: true,
      createdAt: '2026-03-01T10:00:00Z',
      updatedAt: '2026-03-12T16:30:00Z'
    };

    const task5: OsintResearchTask = {
      id: 'TASK-RES-2026-005',
      planId: 'PLAN-RES-2026-004',
      requirementId: 'REQ-2026-004',
      questionId: 'Q-REQ-005',
      sourceIds: ['SRC-002'],
      description: 'Recueil des conventions locales de transhumance auprès des chefs de canton.',
      objective: 'Identifier les couloirs de passage officiellement convenus et non contestés.',
      method: 'recherche_contextuelle',
      status: 'TERMINEE',
      assignedTo: 'ANALYSTE-TCHAD-01',
      dueDate: '2026-03-10',
      completedAt: '2026-03-09T17:00:00Z',
      resultIds: [],
      isDemo: true,
      createdAt: '2026-03-01T08:30:00Z',
      updatedAt: '2026-03-09T17:00:00Z'
    };

    // Résultats d'observation (bruts, vérifiés ou contradictoires avec anti-biais temporel)
    const res1: OsintResearchResult = {
      id: 'RES-OBS-2026-001',
      taskId: 'TASK-RES-2026-001',
      planId: 'PLAN-RES-2026-001',
      requirementId: 'REQ-2026-001',
      questionId: 'Q-REQ-001',
      sourceId: 'SRC-001',
      evidenceIds: ['EVD-091'],
      content: 'Rapport d informateur local signalant le transit de 4 pick-ups non immatriculés transportant des fûts de carburant par la piste de Bankilaré le 6 mars à 23h.',
      observedAt: '2026-03-06T23:00:00Z',
      discoveredAt: '2026-03-07T08:15:00Z',
      relevance: 'CORROBORE',
      confidence: 'ELEVEE',
      verificationStatus: 'VERIFIE',
      isPostPublication: false,
      isPostT0: false,
      isDemo: true,
      evaluatorNotes: 'Information corroborée par le rapport de synthèse de la gendarmerie locale (EVD-091).',
      evaluatedAt: '2026-03-08T11:00:00Z',
      evaluatedBy: 'ANALYSTE-SAHEL-01',
      createdAt: '2026-03-07T08:30:00Z',
      updatedAt: '2026-03-08T11:00:00Z'
    };

    const res2: OsintResearchResult = {
      id: 'RES-OBS-2026-002',
      taskId: 'TASK-RES-2026-003',
      planId: 'PLAN-RES-2026-002',
      requirementId: 'REQ-2026-002',
      questionId: 'Q-REQ-003',
      sourceId: 'SRC-004',
      evidenceIds: [],
      content: 'Déclaration contradictoire de l armateur indiquant une panne transitoire de transpondeur VHF/AIS durant 14 heures sans opérations de transbordement.',
      observedAt: '2026-03-08T14:00:00Z',
      discoveredAt: '2026-03-09T10:00:00Z',
      relevance: 'CONTRADICTOIRE',
      confidence: 'FAIBLE',
      verificationStatus: 'CONTESTE',
      isPostPublication: true,
      isPostT0: true, // Éléments fournis a posteriori après la sommation portuaire
      isDemo: true,
      evaluatorNotes: 'La justification technique est jugée invraisemblable compte tenu de la météo clémente et de la trajectoire en boucle fermée.',
      evaluatedAt: '2026-03-10T16:15:00Z',
      evaluatedBy: 'ANALYSTE-MARITIME-01',
      createdAt: '2026-03-09T10:30:00Z',
      updatedAt: '2026-03-10T16:15:00Z'
    };

    const res3: OsintResearchResult = {
      id: 'RES-OBS-2026-003',
      taskId: 'TASK-RES-2026-004',
      planId: 'PLAN-RES-2026-003',
      requirementId: 'REQ-2026-003',
      questionId: 'Q-REQ-004',
      sourceId: 'SRC-020',
      evidenceIds: ['EVD-140'],
      content: 'Relevé statistique faisant état d une augmentation de 42% des flux aurifères transitant par deux comptoirs enregistrés en franchise douanière.',
      observedAt: '2026-02-24T18:00:00Z',
      discoveredAt: '2026-03-11T09:00:00Z',
      relevance: 'PERTINENT',
      confidence: 'MOYENNE',
      verificationStatus: 'VERIFIE',
      isPostPublication: true,
      isPostT0: true,
      isDemo: true,
      evaluatorNotes: 'Publication rétrospective des registres fiscaux. Intégrée en tant que donnée différée post-T0.',
      evaluatedAt: '2026-03-12T16:50:00Z',
      evaluatedBy: 'ANALYSTE-GRANDS-LACS-01',
      createdAt: '2026-03-11T09:30:00Z',
      updatedAt: '2026-03-12T16:50:00Z'
    };

    // Audit initial
    const audit1: OsintResearchAudit = {
      id: 'AUDIT-PLAN-001',
      timestamp: '2026-03-03T10:00:00Z',
      actor: 'ANALYSTE-SAHEL-01',
      action: 'CREATE_PLAN',
      entityType: 'PLAN',
      entityId: 'PLAN-RES-2026-001',
      details: 'Initialisation du plan de recherche sur le corridor Liptako-Gourma',
      isDemo: true
    };

    const audit2: OsintResearchAudit = {
      id: 'AUDIT-PLAN-002',
      timestamp: '2026-03-07T08:30:00Z',
      actor: 'ANALYSTE-SAHEL-01',
      action: 'CREATE_RESULT',
      entityType: 'RESULT',
      entityId: 'RES-OBS-2026-001',
      details: 'Consignation du résultat de recherche corroboré',
      isDemo: true
    };

    const audit3: OsintResearchAudit = {
      id: 'AUDIT-PLAN-003',
      timestamp: '2026-03-11T12:00:00Z',
      actor: 'ANALYSTE-TCHAD-01',
      action: 'ARCHIVE_PLAN',
      entityType: 'PLAN',
      entityId: 'PLAN-RES-2026-004',
      details: 'Archivage réglementaire et verrouillage du plan d observation pastorale',
      isDemo: true
    };

    this.plans = [plan1, plan2, plan3, plan4];
    this.tasks = [task1, task2, task3, task4, task5];
    this.results = [res1, res2, res3];
    this.auditLogs = [audit3, audit2, audit1];
    this.persist();
  }
}

export const researchPlanningService = new ResearchPlanningService();
