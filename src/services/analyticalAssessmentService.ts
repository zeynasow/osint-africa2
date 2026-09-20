import {
  OsintAnalyticalAssessment,
  OsintAnalyticalAssessmentStatus,
  OsintAnalyticalAssessmentLevel,
  OsintAnalyticalConfidenceLevel,
  OsintAnalyticalHypothesis,
  OsintAnalyticalHypothesisType,
  OsintAnalyticalHypothesisStatus,
  OsintAnalyticalAlternative,
  OsintAnalyticalArgument,
  OsintAnalyticalArgumentType,
  OsintAnalyticalAssumption,
  OsintAnalyticalAssumptionStatus,
  OsintAnalyticalDiscriminant,
  OsintAnalyticalDiscriminantStatus,
  OsintAnalyticalGap,
  OsintAnalyticalGapStatus,
  OsintAnalyticalDecision,
  OsintAnalyticalDecisionType,
  OsintAnalyticalAudit,
  OsintAnalyticalTraceabilityNode
} from '../types';

export const ANALYTICAL_STORAGE_KEYS = {
  ASSESSMENTS: 'OSINT_ASSESSMENTS_LOT37',
  HYPOTHESES: 'OSINT_HYPOTHESES_LOT37',
  ALTERNATIVES: 'OSINT_ALTERNATIVES_LOT37',
  ARGUMENTS: 'OSINT_ARGUMENTS_LOT37',
  ASSUMPTIONS: 'OSINT_ASSUMPTIONS_LOT37',
  DISCRIMINANTS: 'OSINT_DISCRIMINANTS_LOT37',
  GAPS: 'OSINT_ANALYTICAL_GAPS_LOT37',
  DECISIONS: 'OSINT_ANALYTICAL_DECISIONS_LOT37',
  AUDIT: 'OSINT_ANALYTICAL_AUDIT_LOT37'
};

export const ANALYTICAL_DOCTRINAL_PRINCIPLES = [
  {
    id: 'PRINCIPLE_1',
    title: 'Une appréciation analytique n\'est pas un fait',
    text: 'Une appréciation est une construction intellectuelle élaborée à partir de données vérifiées mais sujette à l\'incertitude inhérente au renseignement.'
  },
  {
    id: 'PRINCIPLE_2',
    title: 'Une hypothèse n\'est pas une preuve',
    text: 'Formuler une explication ou un scénario ne lui confère aucune réalité matérielle sans éléments probants corroborés.'
  },
  {
    id: 'PRINCIPLE_3',
    title: 'Un élément favorable ne suffit pas à démontrer une hypothèse',
    text: 'La confirmation apparente peut résulter d\'une coïncidence ou d\'une tromperie ; l\'examen des hypothèses concurrentes demeure obligatoire.'
  },
  {
    id: 'PRINCIPLE_4',
    title: 'Un élément défavorable doit être conservé',
    text: 'Tout constat contredisant une hypothèse doit être consigné et pesé avec la même rigueur qu\'un élément concordant.'
  },
  {
    id: 'PRINCIPLE_5',
    title: 'Une absence d\'information n\'est pas une preuve d\'absence',
    text: 'Ne pas observer un phénomène peut refléter une lacune de couverture ou des mesures de dissimulation de l\'adversaire.'
  },
  {
    id: 'PRINCIPLE_6',
    title: 'Une contradiction non résolue doit rester visible',
    text: 'Le système interdit tout lissage arbitraire des divergences entre sources ; les dissonances doivent éclairer le décideur.'
  },
  {
    id: 'PRINCIPLE_7',
    title: 'Sources dépendantes ≠ Confirmations indépendantes',
    text: 'Plusieurs sources relayant la même dépêche ou appartenant au même réseau ne constituent pas une corroboration multiple.'
  },
  {
    id: 'PRINCIPLE_8',
    title: 'Confiance analytique ≠ Probabilité mathématique',
    text: 'Le niveau de confiance qualitatif ne doit jamais être assimilé à un pourcentage de vérité sans formalisation statistique rigoureuse.'
  },
  {
    id: 'PRINCIPLE_9',
    title: 'L\'analyste reste responsable de l\'appréciation finale',
    text: 'Les algorithmes et les interfaces assistent la mise en ordre des faits mais la responsabilité décisionnelle est humaine et individuelle.'
  },
  {
    id: 'PRINCIPLE_10',
    title: 'Assistance au raisonnement, non substitution',
    text: 'L\'outil structure le questionnement et prévient les biais cognitifs sans jamais générer automatiquement de verdict apodictique.'
  },
  {
    id: 'PRINCIPLE_11',
    title: 'Discipline temporelle post-T0',
    text: 'Les informations survenues ou découvertes postérieurement à l\'instant de référence T0 doivent être explicitement étiquetées.'
  },
  {
    id: 'PRINCIPLE_12',
    title: 'Traçabilité intégrale vers les justifications',
    text: 'Toute conclusion opérationnelle doit pouvoir être déconstruite jusqu\'aux constats, assertions, sources et preuves sources.'
  }
];

export class AnalyticalAssessmentService {
  private assessments: OsintAnalyticalAssessment[] = [];
  private hypotheses: OsintAnalyticalHypothesis[] = [];
  private alternatives: OsintAnalyticalAlternative[] = [];
  private arguments: OsintAnalyticalArgument[] = [];
  private assumptions: OsintAnalyticalAssumption[] = [];
  private discriminants: OsintAnalyticalDiscriminant[] = [];
  private gaps: OsintAnalyticalGap[] = [];
  private decisions: OsintAnalyticalDecision[] = [];
  private auditLogs: OsintAnalyticalAudit[] = [];

  // Matrice formelle des transitions d'états du workflow analytique
  public static readonly ALLOWED_TRANSITIONS: Record<OsintAnalyticalAssessmentStatus, OsintAnalyticalAssessmentStatus[]> = {
    BROUILLON: ['EN_ELABORATION', 'ANNULEE'],
    EN_ELABORATION: ['EN_EXAMEN', 'SUSPENDUE', 'ANNULEE', 'BROUILLON'],
    EN_EXAMEN: ['EN_ARBITRAGE', 'EN_ELABORATION', 'SUSPENDUE', 'ANNULEE'],
    EN_ARBITRAGE: ['A_VALIDER', 'EN_EXAMEN', 'SUSPENDUE', 'ANNULEE'],
    A_VALIDER: ['VALIDEE', 'EN_ARBITRAGE', 'SUSPENDUE', 'ANNULEE'],
    VALIDEE: ['ARCHIVEE'],
    SUSPENDUE: ['EN_ELABORATION', 'EN_EXAMEN', 'ANNULEE'],
    ANNULEE: ['ARCHIVEE'],
    ARCHIVEE: [] // État terminal immuable scellé
  };

  constructor() {
    this.loadFromStorage();
    if (this.assessments.length === 0) {
      this.initializeDemoData();
    }
  }

  // =========================================================================
  // PERSISTANCE ET AUDIT (0 APPEL RÉSEAU)
  // =========================================================================

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const storedAssess = localStorage.getItem(ANALYTICAL_STORAGE_KEYS.ASSESSMENTS);
      const storedHypo = localStorage.getItem(ANALYTICAL_STORAGE_KEYS.HYPOTHESES);
      const storedAlt = localStorage.getItem(ANALYTICAL_STORAGE_KEYS.ALTERNATIVES);
      const storedArgs = localStorage.getItem(ANALYTICAL_STORAGE_KEYS.ARGUMENTS);
      const storedAssump = localStorage.getItem(ANALYTICAL_STORAGE_KEYS.ASSUMPTIONS);
      const storedDisc = localStorage.getItem(ANALYTICAL_STORAGE_KEYS.DISCRIMINANTS);
      const storedGaps = localStorage.getItem(ANALYTICAL_STORAGE_KEYS.GAPS);
      const storedDec = localStorage.getItem(ANALYTICAL_STORAGE_KEYS.DECISIONS);
      const storedAudit = localStorage.getItem(ANALYTICAL_STORAGE_KEYS.AUDIT);

      if (storedAssess) this.assessments = JSON.parse(storedAssess);
      if (storedHypo) this.hypotheses = JSON.parse(storedHypo);
      if (storedAlt) this.alternatives = JSON.parse(storedAlt);
      if (storedArgs) this.arguments = JSON.parse(storedArgs);
      if (storedAssump) this.assumptions = JSON.parse(storedAssump);
      if (storedDisc) this.discriminants = JSON.parse(storedDisc);
      if (storedGaps) this.gaps = JSON.parse(storedGaps);
      if (storedDec) this.decisions = JSON.parse(storedDec);
      if (storedAudit) this.auditLogs = JSON.parse(storedAudit);
    } catch (e) {
      console.error('[LOT 37] Erreur chargement localStorage:', e);
    }
  }

  public persist(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(ANALYTICAL_STORAGE_KEYS.ASSESSMENTS, JSON.stringify(this.assessments));
      localStorage.setItem(ANALYTICAL_STORAGE_KEYS.HYPOTHESES, JSON.stringify(this.hypotheses));
      localStorage.setItem(ANALYTICAL_STORAGE_KEYS.ALTERNATIVES, JSON.stringify(this.alternatives));
      localStorage.setItem(ANALYTICAL_STORAGE_KEYS.ARGUMENTS, JSON.stringify(this.arguments));
      localStorage.setItem(ANALYTICAL_STORAGE_KEYS.ASSUMPTIONS, JSON.stringify(this.assumptions));
      localStorage.setItem(ANALYTICAL_STORAGE_KEYS.DISCRIMINANTS, JSON.stringify(this.discriminants));
      localStorage.setItem(ANALYTICAL_STORAGE_KEYS.GAPS, JSON.stringify(this.gaps));
      localStorage.setItem(ANALYTICAL_STORAGE_KEYS.DECISIONS, JSON.stringify(this.decisions));
      localStorage.setItem(ANALYTICAL_STORAGE_KEYS.AUDIT, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.error('[LOT 37] Erreur sauvegarde localStorage:', e);
    }
  }

  public addAuditLog(
    actorId: string,
    action: string,
    entityType: OsintAnalyticalAudit['entityType'],
    entityId: string,
    details: string,
    previousState?: string,
    newState?: string,
    isDemo: boolean = false
  ): OsintAnalyticalAudit {
    const log: OsintAnalyticalAudit = {
      id: `AUDIT-LOT37-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      actorId: actorId || 'ANALYSTE-RESPONSABLE',
      action,
      entityType,
      entityId,
      details: details.trim(),
      previousState,
      newState,
      isDemo
    };
    this.auditLogs.unshift(log);
    this.persist();
    return log;
  }

  public getAuditLogs(isDemoFilter?: boolean): OsintAnalyticalAudit[] {
    if (isDemoFilter === undefined) return [...this.auditLogs];
    return this.auditLogs.filter(a => a.isDemo === isDemoFilter);
  }

  public getStoredEntity(storageKey: string, id: string, idField: string = 'id'): any | null {
    if (typeof localStorage === 'undefined') return null;
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
  // VALIDATION D'INTÉGRITÉ ET DE RÉFÉRENCES (INTER-LOTS)
  // =========================================================================

  public validateReferences(refs: {
    requirementId?: string;
    questionId?: string;
    verificationCaseIds?: string[];
    evidenceIds?: string[];
    claimIds?: string[];
    findingIds?: string[];
    sourceIds?: string[];
    assessmentId?: string;
    hypothesisId?: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Besoin LOT 34
    if (refs.requirementId) {
      const req = this.getStoredEntity('OSINT_REQUIREMENTS_LOT34', refs.requirementId, 'requirementId')
        || this.getStoredEntity('OSINT_REQUIREMENTS_LOT34', refs.requirementId, 'id');
      if (!req) errors.push(`Besoin en renseignement LOT 34 introuvable: ${refs.requirementId}`);
    }

    // 2. Question LOT 34
    if (refs.questionId) {
      const q = this.getStoredEntity('OSINT_REQUIREMENT_QUESTIONS_LOT34', refs.questionId, 'questionId')
        || this.getStoredEntity('OSINT_REQUIREMENT_QUESTIONS_LOT34', refs.questionId, 'id');
      if (!q) errors.push(`Question prioritaire LOT 34 introuvable: ${refs.questionId}`);
    }

    // 3. Dossiers de vérification LOT 36
    if (refs.verificationCaseIds && refs.verificationCaseIds.length > 0) {
      refs.verificationCaseIds.forEach(cId => {
        const c = this.getStoredEntity('OSINT_VERIFICATION_CASES_LOT36', cId, 'id');
        if (!c) errors.push(`Dossier de vérification LOT 36 introuvable: ${cId}`);
      });
    }

    // 4. Assertions (claims) LOT 36
    if (refs.claimIds && refs.claimIds.length > 0) {
      refs.claimIds.forEach(clmId => {
        const clm = this.getStoredEntity('OSINT_VERIFICATION_CLAIMS_LOT36', clmId, 'id');
        if (!clm) errors.push(`Assertion LOT 36 introuvable: ${clmId}`);
      });
    }

    // 5. Constats (findings) LOT 36
    if (refs.findingIds && refs.findingIds.length > 0) {
      refs.findingIds.forEach(fId => {
        const f = this.getStoredEntity('OSINT_VERIFICATION_FINDINGS_LOT36', fId, 'id');
        if (!f) errors.push(`Constat qualifié LOT 36 introuvable: ${fId}`);
      });
    }

    // 6. Preuves LOT 20
    if (refs.evidenceIds && refs.evidenceIds.length > 0) {
      refs.evidenceIds.forEach(evId => {
        const ev = this.getStoredEntity('osint_africa_evidence_v2', evId, 'id');
        if (!ev) errors.push(`Élément de preuve LOT 20 introuvable: ${evId}`);
      });
    }

    // 7. Sources LOT 22
    if (refs.sourceIds && refs.sourceIds.length > 0) {
      refs.sourceIds.forEach(sId => {
        const s = this.getStoredEntity('osint_africa_sources_v2', sId, 'id');
        if (!s) errors.push(`Source OSINT LOT 22 introuvable: ${sId}`);
      });
    }

    // 8. Appréciation locale LOT 37
    if (refs.assessmentId) {
      const a = this.getAssessment(refs.assessmentId);
      if (!a) errors.push(`Appréciation analytique parente introuvable: ${refs.assessmentId}`);
    }

    // 9. Hypothèse locale LOT 37
    if (refs.hypothesisId) {
      const h = this.hypotheses.find(item => item.id === refs.hypothesisId);
      if (!h) errors.push(`Hypothèse analytique parente introuvable: ${refs.hypothesisId}`);
    }

    if (errors.length > 0) {
      throw new Error(`Contrôle de références échoué :\n- ${errors.join('\n- ')}`);
    }

    return { valid: true, errors: [] };
  }

  // =========================================================================
  // 1. APPRÉCIATION ANALYTIQUE (OsintAnalyticalAssessment)
  // =========================================================================

  public createAssessment(
    data: {
      title: string;
      objective: string;
      requirementId: string;
      questionId: string;
      verificationCaseIds?: string[];
      evidenceIds?: string[];
      claimIds?: string[];
      findingIds?: string[];
      assessmentText?: string;
      assessmentLevel?: OsintAnalyticalAssessmentLevel;
      confidenceLevel?: OsintAnalyticalConfidenceLevel;
      uncertainties?: string[];
      limitations?: string[];
      unresolvedContradictions?: string[];
      unresolvedGaps?: string[];
      createdBy?: string;
      isDemo?: boolean;
    },
    actorId: string = 'ANALYSTE-SENIOR-01'
  ): OsintAnalyticalAssessment {
    if (!data.title || !data.title.trim()) throw new Error("Le titre de l'appréciation est obligatoire.");
    if (!data.objective || !data.objective.trim()) throw new Error("L'objectif décisionnel de l'appréciation est obligatoire.");
    if (!data.requirementId) throw new Error("Le rattachement au besoin LOT 34 est obligatoire.");
    if (!data.questionId) throw new Error("Le rattachement à la question LOT 34 est obligatoire.");

    // Validation des références inter-lots
    this.validateReferences({
      requirementId: data.requirementId,
      questionId: data.questionId,
      verificationCaseIds: data.verificationCaseIds,
      evidenceIds: data.evidenceIds,
      claimIds: data.claimIds,
      findingIds: data.findingIds
    });

    const newAssessment: OsintAnalyticalAssessment = {
      id: `ASSESS-2026-${String(this.assessments.length + 1).padStart(3, '0')}`,
      title: data.title.trim(),
      objective: data.objective.trim(),
      requirementId: data.requirementId,
      questionId: data.questionId,
      verificationCaseIds: data.verificationCaseIds || [],
      evidenceIds: data.evidenceIds || [],
      claimIds: data.claimIds || [],
      hypothesisIds: [],
      alternativeIds: [],
      findingIds: data.findingIds || [],
      assessmentText: (data.assessmentText || '').trim(),
      assessmentLevel: data.assessmentLevel || 'MODERE',
      confidenceLevel: data.confidenceLevel || 'MOYENNE',
      uncertainties: data.uncertainties || [],
      limitations: data.limitations || [],
      unresolvedContradictions: data.unresolvedContradictions || [],
      unresolvedGaps: data.unresolvedGaps || [],
      status: 'BROUILLON',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.createdBy || actorId,
      isHumanValidated: false,
      isDemo: data.isDemo ?? false
    };

    this.assessments.unshift(newAssessment);
    this.addAuditLog(
      actorId,
      'CREATE_ASSESSMENT',
      'ASSESSMENT',
      newAssessment.id,
      `Création de l'appréciation analytique: "${newAssessment.title}" adossée au besoin ${newAssessment.requirementId}`,
      undefined,
      JSON.stringify(newAssessment),
      newAssessment.isDemo
    );
    this.persist();
    return newAssessment;
  }

  public updateAssessment(
    id: string,
    updates: Partial<OsintAnalyticalAssessment>,
    actorId: string = 'ANALYSTE-SENIOR-01',
    justification?: string
  ): OsintAnalyticalAssessment {
    const idx = this.assessments.findIndex(a => a.id === id);
    if (idx === -1) throw new Error(`Appréciation ${id} introuvable.`);

    const current = this.assessments[idx];
    if (current.status === 'ARCHIVEE') {
      throw new Error("Une appréciation archivée est immuable et verrouillée. Aucune altération n'est permise.");
    }
    if (current.status === 'ANNULEE') {
      throw new Error("Une appréciation annulée ne peut plus être modifiée.");
    }

    this.validateReferences({
      requirementId: updates.requirementId,
      questionId: updates.questionId,
      verificationCaseIds: updates.verificationCaseIds,
      evidenceIds: updates.evidenceIds,
      claimIds: updates.claimIds,
      findingIds: updates.findingIds
    });

    const updated: OsintAnalyticalAssessment = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.assessments[idx] = updated;
    this.addAuditLog(
      actorId,
      'UPDATE_ASSESSMENT',
      'ASSESSMENT',
      id,
      justification || `Mise à jour des paramètres de l'appréciation ${id}`,
      JSON.stringify(current),
      JSON.stringify(updated),
      current.isDemo
    );
    this.persist();
    return updated;
  }

  public getAssessment(id: string): OsintAnalyticalAssessment | undefined {
    return this.assessments.find(a => a.id === id);
  }

  public listAssessments(isDemoFilter?: boolean): OsintAnalyticalAssessment[] {
    if (isDemoFilter === undefined) return [...this.assessments];
    return this.assessments.filter(a => a.isDemo === isDemoFilter);
  }

  public changeAssessmentStatus(
    assessmentId: string,
    targetStatus: OsintAnalyticalAssessmentStatus,
    justification: string,
    actorId: string = 'ANALYSTE-RESPONSABLE'
  ): OsintAnalyticalAssessment {
    const idx = this.assessments.findIndex(a => a.id === assessmentId);
    if (idx === -1) throw new Error(`Appréciation ${assessmentId} introuvable.`);

    const current = this.assessments[idx];
    if (current.status === 'ARCHIVEE') {
      throw new Error("Une appréciation archivée est immuable et verrouillée. Aucune transition n'est autorisée.");
    }
    if (current.status === targetStatus) return current;

    if (!justification || justification.trim().length < 5) {
      throw new Error("Une justification formelle d'au moins 5 caractères est exigée pour toute transition de statut.");
    }

    const allowed = AnalyticalAssessmentService.ALLOWED_TRANSITIONS[current.status] || [];
    if (!allowed.includes(targetStatus)) {
      throw new Error(
        `Transition non autorisée : impossible de passer de ${current.status} à ${targetStatus}. Transitions valides autorisées : [${allowed.join(', ') || 'aucune (état terminal)'}].`
      );
    }

    const before = current.status;
    const updated: OsintAnalyticalAssessment = {
      ...current,
      status: targetStatus,
      updatedAt: new Date().toISOString(),
      ...(targetStatus === 'VALIDEE' ? { validatedBy: actorId, validatedAt: new Date().toISOString(), isHumanValidated: true } : {}),
      ...(targetStatus === 'ARCHIVEE' ? { archivedAt: new Date().toISOString(), archiveReason: justification } : {})
    };

    this.assessments[idx] = updated;
    this.addAuditLog(
      actorId,
      targetStatus === 'ARCHIVEE' ? 'ARCHIVE_ASSESSMENT' : 'STATUS_CHANGE',
      'ASSESSMENT',
      assessmentId,
      `Changement de statut: ${before} -> ${targetStatus} (${justification})`,
      before,
      targetStatus,
      current.isDemo
    );
    this.persist();
    return updated;
  }

  // =========================================================================
  // 2. HYPOTHÈSES ANALYTIQUES (OsintAnalyticalHypothesis)
  // =========================================================================

  public createHypothesis(
    data: {
      assessmentId: string;
      statement: string;
      type: OsintAnalyticalHypothesisType;
      supportingFindingIds?: string[];
      contradictingFindingIds?: string[];
      evidenceIds?: string[];
      assumptionIds?: string[];
      confidenceLevel?: OsintAnalyticalConfidenceLevel;
      rationale: string;
      createdBy?: string;
      isDemo?: boolean;
    },
    actorId: string = 'ANALYSTE-RESPONSABLE'
  ): OsintAnalyticalHypothesis {
    const parentAssess = this.getAssessment(data.assessmentId);
    if (!parentAssess) throw new Error(`Appréciation parente ${data.assessmentId} introuvable.`);
    if (parentAssess.status === 'ARCHIVEE') {
      throw new Error("Impossible d'ajouter une hypothèse à une appréciation archivée.");
    }

    if (!data.statement || !data.statement.trim()) {
      throw new Error("L'énoncé de l'hypothèse est obligatoire.");
    }
    if (!data.rationale || !data.rationale.trim()) {
      throw new Error("Le raisonnement sous-jacent (rationale) de l'hypothèse est obligatoire.");
    }

    this.validateReferences({
      findingIds: [...(data.supportingFindingIds || []), ...(data.contradictingFindingIds || [])],
      evidenceIds: data.evidenceIds
    });

    const newHypothesis: OsintAnalyticalHypothesis = {
      id: `HYP-2026-${String(this.hypotheses.length + 1).padStart(3, '0')}`,
      assessmentId: data.assessmentId,
      statement: data.statement.trim(),
      type: data.type,
      status: 'ACTIVE',
      supportingFindingIds: data.supportingFindingIds || [],
      contradictingFindingIds: data.contradictingFindingIds || [],
      evidenceIds: data.evidenceIds || [],
      assumptionIds: data.assumptionIds || [],
      confidenceLevel: data.confidenceLevel || 'MOYENNE',
      rationale: data.rationale.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.createdBy || actorId,
      isDemo: data.isDemo ?? parentAssess.isDemo
    };

    this.hypotheses.unshift(newHypothesis);
    if (!parentAssess.hypothesisIds.includes(newHypothesis.id)) {
      parentAssess.hypothesisIds.push(newHypothesis.id);
      parentAssess.updatedAt = new Date().toISOString();
    }

    this.addAuditLog(
      actorId,
      'CREATE_HYPOTHESIS',
      'HYPOTHESIS',
      newHypothesis.id,
      `Création de l'hypothèse analytique [${newHypothesis.type}]: "${newHypothesis.statement.substring(0, 60)}..."`,
      undefined,
      JSON.stringify(newHypothesis),
      newHypothesis.isDemo
    );
    this.persist();
    return newHypothesis;
  }

  public updateHypothesis(
    id: string,
    updates: Partial<OsintAnalyticalHypothesis>,
    actorId: string = 'ANALYSTE-RESPONSABLE',
    justification?: string
  ): OsintAnalyticalHypothesis {
    const idx = this.hypotheses.findIndex(h => h.id === id);
    if (idx === -1) throw new Error(`Hypothèse ${id} introuvable.`);

    const current = this.hypotheses[idx];
    const parentAssess = this.getAssessment(current.assessmentId);
    if (parentAssess && parentAssess.status === 'ARCHIVEE') {
      throw new Error("Impossible de modifier une hypothèse liée à une appréciation archivée.");
    }

    const updated: OsintAnalyticalHypothesis = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.hypotheses[idx] = updated;
    this.addAuditLog(
      actorId,
      'UPDATE_HYPOTHESIS',
      'HYPOTHESIS',
      id,
      justification || `Mise à jour de l'hypothèse ${id} (Statut: ${updated.status})`,
      JSON.stringify(current),
      JSON.stringify(updated),
      current.isDemo
    );
    this.persist();
    return updated;
  }

  public listHypotheses(assessmentId?: string, isDemoFilter?: boolean): OsintAnalyticalHypothesis[] {
    let list = this.hypotheses;
    if (assessmentId) list = list.filter(h => h.assessmentId === assessmentId);
    if (isDemoFilter !== undefined) list = list.filter(h => h.isDemo === isDemoFilter);
    return list;
  }

  // =========================================================================
  // 3. ALTERNATIVES ANALYTIQUES (OsintAnalyticalAlternative)
  // =========================================================================

  public createAlternative(
    data: {
      assessmentId: string;
      hypothesisId: string;
      statement: string;
      supportingEvidenceIds?: string[];
      contradictingEvidenceIds?: string[];
      keyAssumptions?: string[];
      discriminants?: string[];
      status?: 'ACTIVE' | 'EN_EVALUATION' | 'REJETEE' | 'RETENUE';
      isDemo?: boolean;
    },
    actorId: string = 'ANALYSTE-RESPONSABLE'
  ): OsintAnalyticalAlternative {
    const parentAssess = this.getAssessment(data.assessmentId);
    if (!parentAssess) throw new Error(`Appréciation parente ${data.assessmentId} introuvable.`);
    if (parentAssess.status === 'ARCHIVEE') {
      throw new Error("Impossible d'ajouter une alternative à une appréciation archivée.");
    }

    if (!data.statement || !data.statement.trim()) {
      throw new Error("L'énoncé du scénario alternatif est obligatoire.");
    }

    this.validateReferences({
      hypothesisId: data.hypothesisId,
      evidenceIds: [...(data.supportingEvidenceIds || []), ...(data.contradictingEvidenceIds || [])]
    });

    const newAlt: OsintAnalyticalAlternative = {
      id: `ALT-2026-${String(this.alternatives.length + 1).padStart(3, '0')}`,
      assessmentId: data.assessmentId,
      hypothesisId: data.hypothesisId,
      statement: data.statement.trim(),
      supportingEvidenceIds: data.supportingEvidenceIds || [],
      contradictingEvidenceIds: data.contradictingEvidenceIds || [],
      keyAssumptions: data.keyAssumptions || [],
      discriminants: data.discriminants || [],
      status: data.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      isDemo: data.isDemo ?? parentAssess.isDemo
    };

    this.alternatives.unshift(newAlt);
    if (!parentAssess.alternativeIds.includes(newAlt.id)) {
      parentAssess.alternativeIds.push(newAlt.id);
      parentAssess.updatedAt = new Date().toISOString();
    }

    this.addAuditLog(
      actorId,
      'CREATE_ALTERNATIVE',
      'ALTERNATIVE',
      newAlt.id,
      `Création du scénario alternatif pour ${newAlt.hypothesisId}: "${newAlt.statement.substring(0, 50)}..."`,
      undefined,
      JSON.stringify(newAlt),
      newAlt.isDemo
    );
    this.persist();
    return newAlt;
  }

  public updateAlternative(
    id: string,
    updates: Partial<OsintAnalyticalAlternative>,
    actorId: string = 'ANALYSTE-RESPONSABLE'
  ): OsintAnalyticalAlternative {
    const idx = this.alternatives.findIndex(a => a.id === id);
    if (idx === -1) throw new Error(`Alternative ${id} introuvable.`);

    const current = this.alternatives[idx];
    const parentAssess = this.getAssessment(current.assessmentId);
    if (parentAssess && parentAssess.status === 'ARCHIVEE') {
      throw new Error("Impossible de modifier une alternative liée à une appréciation archivée.");
    }

    const updated: OsintAnalyticalAlternative = {
      ...current,
      ...updates
    };

    this.alternatives[idx] = updated;
    this.addAuditLog(
      actorId,
      'UPDATE_ALTERNATIVE',
      'ALTERNATIVE',
      id,
      `Mise à jour de l'alternative ${id}`,
      JSON.stringify(current),
      JSON.stringify(updated),
      current.isDemo
    );
    this.persist();
    return updated;
  }

  public listAlternatives(assessmentId?: string, isDemoFilter?: boolean): OsintAnalyticalAlternative[] {
    let list = this.alternatives;
    if (assessmentId) list = list.filter(a => a.assessmentId === assessmentId);
    if (isDemoFilter !== undefined) list = list.filter(a => a.isDemo === isDemoFilter);
    return list;
  }

  // =========================================================================
  // 4. ARGUMENTS ANALYTIQUES (OsintAnalyticalArgument)
  // =========================================================================

  public createArgument(
    data: {
      assessmentId: string;
      hypothesisId: string;
      type: OsintAnalyticalArgumentType;
      statement: string;
      evidenceIds?: string[];
      findingIds?: string[];
      sourceIds?: string[];
      strength?: 'FAIBLE' | 'MOYEN' | 'FORT' | 'DECISIF';
      createdBy?: string;
      isDemo?: boolean;
    },
    actorId: string = 'ANALYSTE-RESPONSABLE'
  ): OsintAnalyticalArgument {
    const parentAssess = this.getAssessment(data.assessmentId);
    if (!parentAssess) throw new Error(`Appréciation parente ${data.assessmentId} introuvable.`);
    if (parentAssess.status === 'ARCHIVEE') {
      throw new Error("Impossible d'ajouter un argument à une appréciation archivée.");
    }

    if (!data.statement || !data.statement.trim()) {
      throw new Error("L'énoncé de l'argument est obligatoire.");
    }

    this.validateReferences({
      hypothesisId: data.hypothesisId,
      findingIds: data.findingIds,
      evidenceIds: data.evidenceIds,
      sourceIds: data.sourceIds
    });

    const newArg: OsintAnalyticalArgument = {
      id: `ARG-2026-${String(this.arguments.length + 1).padStart(3, '0')}`,
      assessmentId: data.assessmentId,
      hypothesisId: data.hypothesisId,
      type: data.type,
      statement: data.statement.trim(),
      evidenceIds: data.evidenceIds || [],
      findingIds: data.findingIds || [],
      sourceIds: data.sourceIds || [],
      strength: data.strength || 'MOYEN',
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy || actorId,
      isDemo: data.isDemo ?? parentAssess.isDemo
    };

    this.arguments.unshift(newArg);
    this.addAuditLog(
      actorId,
      'CREATE_ARGUMENT',
      'ARGUMENT',
      newArg.id,
      `Création d'argument [${newArg.type}] (${newArg.strength}) pour ${newArg.hypothesisId}: "${newArg.statement.substring(0, 50)}..."`,
      undefined,
      JSON.stringify(newArg),
      newArg.isDemo
    );
    this.persist();
    return newArg;
  }

  public listArguments(assessmentId?: string, hypothesisId?: string, isDemoFilter?: boolean): OsintAnalyticalArgument[] {
    let list = this.arguments;
    if (assessmentId) list = list.filter(a => a.assessmentId === assessmentId);
    if (hypothesisId) list = list.filter(a => a.hypothesisId === hypothesisId);
    if (isDemoFilter !== undefined) list = list.filter(a => a.isDemo === isDemoFilter);
    return list;
  }

  // =========================================================================
  // 5. ASSOMPTIONS / HYPOTHÈSES SOUS-JACENTES (OsintAnalyticalAssumption)
  // =========================================================================

  public createAssumption(
    data: {
      assessmentId: string;
      statement: string;
      basis: string;
      riskLevel?: 'FAIBLE' | 'MODERE' | 'ELEVE' | 'CRITIQUE';
      validationStatus?: OsintAnalyticalAssumptionStatus;
      evidenceIds?: string[];
      isDemo?: boolean;
    },
    actorId: string = 'ANALYSTE-RESPONSABLE'
  ): OsintAnalyticalAssumption {
    const parentAssess = this.getAssessment(data.assessmentId);
    if (!parentAssess) throw new Error(`Appréciation parente ${data.assessmentId} introuvable.`);
    if (parentAssess.status === 'ARCHIVEE') {
      throw new Error("Impossible d'ajouter une assomption à une appréciation archivée.");
    }

    if (!data.statement || !data.statement.trim()) {
      throw new Error("L'énoncé de l'assomption est obligatoire.");
    }
    if (!data.basis || !data.basis.trim()) {
      throw new Error("Le fondement ou justification de l'assomption est obligatoire.");
    }

    this.validateReferences({
      evidenceIds: data.evidenceIds
    });

    const newAssump: OsintAnalyticalAssumption = {
      id: `ASSUMP-2026-${String(this.assumptions.length + 1).padStart(3, '0')}`,
      assessmentId: data.assessmentId,
      statement: data.statement.trim(),
      basis: data.basis.trim(),
      riskLevel: data.riskLevel || 'MODERE',
      validationStatus: data.validationStatus || 'NON_VERIFIEE',
      evidenceIds: data.evidenceIds || [],
      createdAt: new Date().toISOString(),
      isDemo: data.isDemo ?? parentAssess.isDemo
    };

    this.assumptions.unshift(newAssump);
    this.addAuditLog(
      actorId,
      'CREATE_ASSUMPTION',
      'ASSUMPTION',
      newAssump.id,
      `Création de l'assomption [${newAssump.validationStatus} / Risque ${newAssump.riskLevel}]: "${newAssump.statement.substring(0, 50)}..."`,
      undefined,
      JSON.stringify(newAssump),
      newAssump.isDemo
    );
    this.persist();
    return newAssump;
  }

  public listAssumptions(assessmentId?: string, isDemoFilter?: boolean): OsintAnalyticalAssumption[] {
    let list = this.assumptions;
    if (assessmentId) list = list.filter(a => a.assessmentId === assessmentId);
    if (isDemoFilter !== undefined) list = list.filter(a => a.isDemo === isDemoFilter);
    return list;
  }

  // =========================================================================
  // 6. DISCRIMINANTS (OsintAnalyticalDiscriminant)
  // =========================================================================

  public createDiscriminant(
    data: {
      assessmentId: string;
      hypothesisIds: string[];
      question: string;
      expectedObservation: string;
      meaningIfObserved: string;
      meaningIfAbsent: string;
      sourceIds?: string[];
      status?: OsintAnalyticalDiscriminantStatus;
      isDemo?: boolean;
    },
    actorId: string = 'ANALYSTE-RESPONSABLE'
  ): OsintAnalyticalDiscriminant {
    const parentAssess = this.getAssessment(data.assessmentId);
    if (!parentAssess) throw new Error(`Appréciation parente ${data.assessmentId} introuvable.`);
    if (parentAssess.status === 'ARCHIVEE') {
      throw new Error("Impossible d'ajouter un discriminant à une appréciation archivée.");
    }

    if (!data.question || !data.question.trim()) throw new Error("La question discriminante est obligatoire.");
    if (!data.expectedObservation || !data.expectedObservation.trim()) throw new Error("L'observation attendue est obligatoire.");
    if (!data.meaningIfObserved || !data.meaningIfObserved.trim()) throw new Error("L'interprétation en cas d'observation est obligatoire.");
    if (!data.meaningIfAbsent || !data.meaningIfAbsent.trim()) throw new Error("L'interprétation en cas d'absence est obligatoire.");

    this.validateReferences({
      sourceIds: data.sourceIds
    });

    const newDisc: OsintAnalyticalDiscriminant = {
      id: `DISC-2026-${String(this.discriminants.length + 1).padStart(3, '0')}`,
      assessmentId: data.assessmentId,
      hypothesisIds: data.hypothesisIds || [],
      question: data.question.trim(),
      expectedObservation: data.expectedObservation.trim(),
      meaningIfObserved: data.meaningIfObserved.trim(),
      meaningIfAbsent: data.meaningIfAbsent.trim(),
      sourceIds: data.sourceIds || [],
      status: data.status || 'A_RECHERCHER',
      createdAt: new Date().toISOString(),
      isDemo: data.isDemo ?? parentAssess.isDemo
    };

    this.discriminants.unshift(newDisc);
    this.addAuditLog(
      actorId,
      'CREATE_DISCRIMINANT',
      'DISCRIMINANT',
      newDisc.id,
      `Création du discriminant [${newDisc.status}]: "${newDisc.question.substring(0, 50)}..."`,
      undefined,
      JSON.stringify(newDisc),
      newDisc.isDemo
    );
    this.persist();
    return newDisc;
  }

  public listDiscriminants(assessmentId?: string, isDemoFilter?: boolean): OsintAnalyticalDiscriminant[] {
    let list = this.discriminants;
    if (assessmentId) list = list.filter(d => d.assessmentId === assessmentId);
    if (isDemoFilter !== undefined) list = list.filter(d => d.isDemo === isDemoFilter);
    return list;
  }

  // =========================================================================
  // 7. INCERTITUDES ET LACUNES ANALYTIQUES (OsintAnalyticalGap)
  // =========================================================================

  public createAnalyticalGap(
    data: {
      assessmentId: string;
      description: string;
      impact?: 'FAIBLE' | 'MODERE' | 'MAJEUR' | 'BLOQUANT';
      relatedHypothesisIds?: string[];
      relatedQuestionIds?: string[];
      priority?: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
      status?: OsintAnalyticalGapStatus;
      isDemo?: boolean;
    },
    actorId: string = 'ANALYSTE-RESPONSABLE'
  ): OsintAnalyticalGap {
    const parentAssess = this.getAssessment(data.assessmentId);
    if (!parentAssess) throw new Error(`Appréciation parente ${data.assessmentId} introuvable.`);
    if (parentAssess.status === 'ARCHIVEE') {
      throw new Error("Impossible d'ajouter une lacune à une appréciation archivée.");
    }

    if (!data.description || !data.description.trim()) {
      throw new Error("La description de la lacune analytique est obligatoire.");
    }

    const newGap: OsintAnalyticalGap = {
      id: `AN-GAP-2026-${String(this.gaps.length + 1).padStart(3, '0')}`,
      assessmentId: data.assessmentId,
      description: data.description.trim(),
      impact: data.impact || 'MODERE',
      relatedHypothesisIds: data.relatedHypothesisIds || [],
      relatedQuestionIds: data.relatedQuestionIds || [],
      priority: data.priority || 'MOYENNE',
      status: data.status || 'OUVERTE',
      createdAt: new Date().toISOString(),
      isDemo: data.isDemo ?? parentAssess.isDemo
    };

    this.gaps.unshift(newGap);
    if (!parentAssess.unresolvedGaps.includes(newGap.id)) {
      parentAssess.unresolvedGaps.push(newGap.id);
      parentAssess.updatedAt = new Date().toISOString();
    }

    this.addAuditLog(
      actorId,
      'CREATE_ANALYTICAL_GAP',
      'GAP',
      newGap.id,
      `Consignation de la lacune analytique [${newGap.priority} / ${newGap.status}]: "${newGap.description.substring(0, 50)}..."`,
      undefined,
      JSON.stringify(newGap),
      newGap.isDemo
    );
    this.persist();
    return newGap;
  }

  public listAnalyticalGaps(assessmentId?: string, isDemoFilter?: boolean): OsintAnalyticalGap[] {
    let list = this.gaps;
    if (assessmentId) list = list.filter(g => g.assessmentId === assessmentId);
    if (isDemoFilter !== undefined) list = list.filter(g => g.isDemo === isDemoFilter);
    return list;
  }

  // =========================================================================
  // 8. DÉCISION ANALYTIQUE HUMAINE (OsintAnalyticalDecision)
  // =========================================================================

  public createDecision(
    data: {
      assessmentId: string;
      decision: OsintAnalyticalDecisionType;
      rationale: string;
      supportingHypothesisIds?: string[];
      contradictingEvidenceIds?: string[];
      limitations?: string[];
      unresolvedGaps?: string[];
      unresolvedContradictions?: string[];
      approvedBy?: string;
      isHumanDecision?: boolean;
      isDemo?: boolean;
    },
    actorId: string = 'SUPERVISEUR-ANALYTIQUE'
  ): OsintAnalyticalDecision {
    const parentAssess = this.getAssessment(data.assessmentId);
    if (!parentAssess) throw new Error(`Appréciation parente ${data.assessmentId} introuvable.`);
    if (parentAssess.status === 'ARCHIVEE') {
      throw new Error("Impossible d'ajouter une décision à une appréciation archivée.");
    }
    if (parentAssess.status !== 'A_VALIDER') {
      throw new Error(`Une décision ne peut être consignée que pour une appréciation au statut 'A_VALIDER'. Statut actuel : ${parentAssess.status}.`);
    }

    const approver = data.approvedBy || actorId;
    if (!approver || approver.trim().length < 3) {
      throw new Error("Décision humaine obligatoire : l'identité d'un analyste superviseur est requise.");
    }
    if (data.isHumanDecision === false) {
      throw new Error("Décision invalide : le système interdit toute validation décisionnelle purement automatisée.");
    }

    if (!data.rationale || data.rationale.trim().length < 10) {
      throw new Error("Une argumentation circonstanciée d'au moins 10 caractères est obligatoire pour consigner la décision.");
    }

    const newDecision: OsintAnalyticalDecision = {
      id: `AN-DEC-2026-${String(this.decisions.length + 1).padStart(3, '0')}`,
      assessmentId: data.assessmentId,
      decision: data.decision,
      rationale: data.rationale.trim(),
      supportingHypothesisIds: data.supportingHypothesisIds || [],
      contradictingEvidenceIds: data.contradictingEvidenceIds || [],
      limitations: data.limitations || parentAssess.limitations,
      unresolvedGaps: data.unresolvedGaps || parentAssess.unresolvedGaps,
      unresolvedContradictions: data.unresolvedContradictions || parentAssess.unresolvedContradictions,
      approvedBy: approver.trim(),
      approvedAt: new Date().toISOString(),
      isHumanDecision: true,
      createdAt: new Date().toISOString(),
      isDemo: data.isDemo ?? parentAssess.isDemo
    };

    this.decisions.unshift(newDecision);

    // Mettre à jour l'appréciation
    parentAssess.status = 'VALIDEE';
    parentAssess.validatedBy = approver.trim();
    parentAssess.validatedAt = new Date().toISOString();
    parentAssess.isHumanValidated = true;
    parentAssess.updatedAt = new Date().toISOString();

    this.addAuditLog(
      approver,
      'APPROVE_ANALYTICAL_DECISION',
      'DECISION',
      newDecision.id,
      `Validation humaine décisionnelle [${newDecision.decision}] par ${approver}: "${newDecision.rationale.substring(0, 60)}..."`,
      undefined,
      JSON.stringify(newDecision),
      newDecision.isDemo
    );
    this.persist();
    return newDecision;
  }

  public updateDecision(
    id: string,
    updates: Partial<OsintAnalyticalDecision>,
    actorId: string = 'SUPERVISEUR-ANALYTIQUE',
    justification?: string
  ): OsintAnalyticalDecision {
    const idx = this.decisions.findIndex(d => d.id === id);
    if (idx === -1) throw new Error(`Décision ${id} introuvable.`);

    const current = this.decisions[idx];
    const parentAssess = this.getAssessment(current.assessmentId);
    if (parentAssess && parentAssess.status === 'ARCHIVEE') {
      throw new Error("Impossible de modifier une décision rattachée à une appréciation archivée.");
    }

    const updated: OsintAnalyticalDecision = {
      ...current,
      ...updates,
      approvedBy: updates.approvedBy || current.approvedBy,
      approvedAt: new Date().toISOString(),
      isHumanDecision: true
    };

    this.decisions[idx] = updated;
    this.addAuditLog(
      actorId,
      'UPDATE_DECISION',
      'DECISION',
      id,
      justification || `Mise à jour de la décision analytique ${id}`,
      JSON.stringify(current),
      JSON.stringify(updated),
      current.isDemo
    );
    this.persist();
    return updated;
  }

  public listDecisions(assessmentId?: string, isDemoFilter?: boolean): OsintAnalyticalDecision[] {
    let list = this.decisions;
    if (assessmentId) list = list.filter(d => d.assessmentId === assessmentId);
    if (isDemoFilter !== undefined) list = list.filter(d => d.isDemo === isDemoFilter);
    return list;
  }

  // =========================================================================
  // 9. ÉVALUATION DES HYPOTHÈSES (evaluateHypothesisSupport)
  // AUCUN CALCUL DE "PROBABILITÉ DE VÉRITÉ" INVENTÉE
  // =========================================================================

  public evaluateHypothesisSupport(hypothesisId: string): {
    hypothesisId: string;
    favorableArguments: OsintAnalyticalArgument[];
    unfavorableArguments: OsintAnalyticalArgument[];
    neutralArguments: OsintAnalyticalArgument[];
    supportingFindings: any[];
    contradictingFindings: any[];
    dependentHypotheses: OsintAnalyticalAlternative[];
    assumptions: OsintAnalyticalAssumption[];
    discriminants: OsintAnalyticalDiscriminant[];
    unresolvedGaps: OsintAnalyticalGap[];
    unresolvedContradictions: any[];
    independentSourceCount: number;
    dependentSourceCount: number;
    coverageCompletenessIndicator: number; // 0 à 100 : indicateur d'exhaustivité documentaire
    doctrinalNotice: string;
  } {
    const hyp = this.hypotheses.find(h => h.id === hypothesisId);
    if (!hyp) throw new Error(`Hypothèse ${hypothesisId} introuvable.`);

    const allArgs = this.arguments.filter(a => a.hypothesisId === hypothesisId);
    const favorableArgs = allArgs.filter(a => a.type === 'SUPPORT');
    const unfavorableArgs = allArgs.filter(a => a.type === 'CONTRADICTION');
    const neutralArgs = allArgs.filter(a => a.type !== 'SUPPORT' && a.type !== 'CONTRADICTION');

    // Findings LOT 36
    const supportingFindings: any[] = hyp.supportingFindingIds
      .map(id => this.getStoredEntity('OSINT_VERIFICATION_FINDINGS_LOT36', id, 'id'))
      .filter(Boolean);

    const contradictingFindings: any[] = hyp.contradictingFindingIds
      .map(id => this.getStoredEntity('OSINT_VERIFICATION_FINDINGS_LOT36', id, 'id'))
      .filter(Boolean);

    // Alternatives concurrentes
    const dependentHypotheses = this.alternatives.filter(alt => alt.hypothesisId === hypothesisId);

    // Assomptions
    const assumptions = this.assumptions.filter(a => a.assessmentId === hyp.assessmentId);

    // Discriminants
    const discriminants = this.discriminants.filter(d => d.hypothesisIds.includes(hypothesisId));

    // Lacunes
    const unresolvedGaps = this.gaps.filter(g =>
      g.assessmentId === hyp.assessmentId &&
      (g.relatedHypothesisIds.length === 0 || g.relatedHypothesisIds.includes(hypothesisId)) &&
      g.status !== 'CLOTUREE_HUMAINEMENT'
    );

    // Contradictions issues du LOT 36
    const contradictions = this.evaluateHypothesisContradictions(hypothesisId);

    // Évaluation rigoureuse des sources (indépendantes vs dépendantes)
    const sourceIds = new Set<string>();
    allArgs.forEach(a => a.sourceIds.forEach(sId => sourceIds.add(sId)));

    // Récupérer les liens de dépendance du LOT 36
    const sourceLinksStored = this.getStoredEntity('OSINT_VERIFICATION_SOURCE_LINKS_LOT36', '', 'id');
    const rawLinks: any[] = [];
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('OSINT_VERIFICATION_SOURCE_LINKS_LOT36');
        if (stored) rawLinks.push(...JSON.parse(stored));
      } catch {
        // Ignorer
      }
    }

    let dependentSourceCount = 0;
    let independentSourceCount = 0;

    sourceIds.forEach(sId => {
      const isDep = rawLinks.some(link =>
        (link.sourceAId === sId || link.sourceBId === sId) &&
        (link.relationship === 'SYNDICATION' || link.relationship === 'AGENCE_FILIALE' || link.relationship === 'REPRIS_SANS_ATTRIBUTION')
      );
      if (isDep) dependentSourceCount++;
      else independentSourceCount++;
    });

    // Calcul d'un indicateur de couverture documentaire (0-100) — strictement distinct d'une probabilité
    let coverageScore = 0;
    if (favorableArgs.length > 0) coverageScore += 25;
    if (unfavorableArgs.length > 0) coverageScore += 25; // Rigueur : chercher l'infirmation
    if (assumptions.length > 0) coverageScore += 15;
    if (discriminants.length > 0) coverageScore += 15;
    if (dependentHypotheses.length > 0) coverageScore += 10;
    if (independentSourceCount > 1) coverageScore += 10;
    coverageScore = Math.min(100, coverageScore);

    return {
      hypothesisId,
      favorableArguments: favorableArgs,
      unfavorableArguments: unfavorableArgs,
      neutralArguments: neutralArgs,
      supportingFindings,
      contradictingFindings,
      dependentHypotheses,
      assumptions,
      discriminants,
      unresolvedGaps,
      unresolvedContradictions: contradictions,
      independentSourceCount,
      dependentSourceCount,
      coverageCompletenessIndicator: coverageScore,
      doctrinalNotice: "AVERTISSEMENT DOCTRINAL : L'indicateur de couverture (0-100) mesure l'exhaustivité du travail contradictoire et la complétude documentaire. IL NE CONSTITUE EN AUCUN CAS UNE PROBABILITÉ MATHÉMATIQUE DE VÉRITÉ DE L'HYPOTHÈSE."
    };
  }

  public evaluateHypothesisContradictions(hypothesisId: string): any[] {
    const hyp = this.hypotheses.find(h => h.id === hypothesisId);
    if (!hyp) return [];

    const parentAssess = this.getAssessment(hyp.assessmentId);
    if (!parentAssess) return [];

    // Récupérer les contradictions conservées dans les dossiers LOT 36 associés
    const contradictions: any[] = [];
    if (typeof localStorage !== 'undefined') {
      try {
        const storedCases = localStorage.getItem('OSINT_VERIFICATION_CASES_LOT36');
        if (storedCases) {
          const cases: any[] = JSON.parse(storedCases);
          cases.filter(c => parentAssess.verificationCaseIds.includes(c.id)).forEach(c => {
            if (c.contradictions && Array.isArray(c.contradictions)) {
              contradictions.push(...c.contradictions);
            }
          });
        }
      } catch {
        // Ignorer
      }
    }

    return contradictions;
  }

  public calculateAssessmentQuality(assessmentId: string): {
    qualityScore: number;
    hasMultipleHypotheses: boolean;
    hasContradictoryArgumentsExamined: boolean;
    hasUnverifiedAssumptionsFlagged: boolean;
    hasUnresolvedGapsDocumented: boolean;
    hasDiscriminantsEstablished: boolean;
    qualityAssessment: 'INSUFFISANTE' | 'ACCEPTABLE' | 'RIGOUROUSE' | 'EXEMPLAIRE';
    explanation: string;
    doctrinalNotice: string;
  } {
    const assess = this.getAssessment(assessmentId);
    if (!assess) throw new Error(`Appréciation ${assessmentId} introuvable.`);

    const hypList = this.hypotheses.filter(h => h.assessmentId === assessmentId);
    const argList = this.arguments.filter(a => a.assessmentId === assessmentId);
    const assumpList = this.assumptions.filter(a => a.assessmentId === assessmentId);
    const discList = this.discriminants.filter(d => d.assessmentId === assessmentId);
    const gapList = this.gaps.filter(g => g.assessmentId === assessmentId);

    const hasMultipleHypotheses = hypList.length >= 2;
    const hasContradictoryArgumentsExamined = argList.some(a => a.type === 'CONTRADICTION' || a.type === 'LIMITE');
    const hasUnverifiedAssumptionsFlagged = assumpList.some(a => a.validationStatus === 'NON_VERIFIEE');
    const hasUnresolvedGapsDocumented = gapList.length > 0;
    const hasDiscriminantsEstablished = discList.length > 0;

    let score = 0;
    if (hasMultipleHypotheses) score += 25;
    if (hasContradictoryArgumentsExamined) score += 25;
    if (hasUnverifiedAssumptionsFlagged) score += 20;
    if (hasUnresolvedGapsDocumented) score += 15;
    if (hasDiscriminantsEstablished) score += 15;

    let qualityAssessment: 'INSUFFISANTE' | 'ACCEPTABLE' | 'RIGOUROUSE' | 'EXEMPLAIRE' = 'INSUFFISANTE';
    if (score >= 80) qualityAssessment = 'EXEMPLAIRE';
    else if (score >= 60) qualityAssessment = 'RIGOUROUSE';
    else if (score >= 40) qualityAssessment = 'ACCEPTABLE';

    return {
      qualityScore: score,
      hasMultipleHypotheses,
      hasContradictoryArgumentsExamined,
      hasUnverifiedAssumptionsFlagged,
      hasUnresolvedGapsDocumented,
      hasDiscriminantsEstablished,
      qualityAssessment,
      explanation: `Examen méthodique de ${hypList.length} hypothèses, ${argList.length} arguments et ${gapList.length} lacunes. Ce score évalue la rigueur méthodologique, non la véracité des faits.`,
      doctrinalNotice: "AVERTISSEMENT DOCTRINAL : Indicateur de couverture/complétude documentaire ou de qualité méthodologique ; ne constitue pas une probabilité de vérité."
    };
  }

  // =========================================================================
  // 10. TRAÇABILITÉ INTÉGRALE DESCENDANTE ET ASCENDANTE
  // BESOIN -> QUESTION -> PLAN -> TÂCHE -> RÉSULTAT -> VÉRIFICATION -> CLAIM -> FINDING -> HYPOTHÈSE -> ARGUMENT -> APPRÉCIATION -> DÉCISION
  // =========================================================================

  public getAnalyticalTraceability(assessmentId: string): {
    descending: OsintAnalyticalTraceabilityNode[];
    ascending: OsintAnalyticalTraceabilityNode[];
  } {
    const assess = this.getAssessment(assessmentId);
    if (!assess) return { descending: [], ascending: [] };

    const hypList = this.hypotheses.filter(h => h.assessmentId === assessmentId);
    const decList = this.decisions.filter(d => d.assessmentId === assessmentId);

    // Reconstruction descendante :
    // BESOIN -> QUESTION -> CAS VÉRIFICATION -> HYPOTHÈSE -> ARGUMENT -> APPRÉCIATION -> DÉCISION
    const decisionNodes: OsintAnalyticalTraceabilityNode[] = decList.map(dec => ({
      type: 'DECISION',
      id: dec.id,
      label: `Décision: [${dec.decision}] par ${dec.approvedBy}`,
      status: dec.decision,
      details: dec.rationale
    }));

    const assessmentNode: OsintAnalyticalTraceabilityNode = {
      type: 'ASSESSMENT',
      id: assess.id,
      label: `Appréciation: "${assess.title}"`,
      status: assess.status,
      details: `Niveau: ${assess.assessmentLevel} | Confiance: ${assess.confidenceLevel}`,
      children: decisionNodes
    };

    const hypothesisNodes: OsintAnalyticalTraceabilityNode[] = hypList.map(hyp => {
      const args = this.arguments.filter(a => a.hypothesisId === hyp.id);
      const argNodes: OsintAnalyticalTraceabilityNode[] = args.map(arg => ({
        type: 'ARGUMENT',
        id: arg.id,
        label: `Argument [${arg.type} / ${arg.strength}]: "${arg.statement.substring(0, 45)}..."`,
        status: arg.type,
        children: [assessmentNode]
      }));

      return {
        type: 'HYPOTHESIS',
        id: hyp.id,
        label: `Hypothèse [${hyp.type} / ${hyp.status}]: "${hyp.statement.substring(0, 45)}..."`,
        status: hyp.status,
        children: argNodes.length > 0 ? argNodes : [assessmentNode]
      };
    });

    // Cas de vérification LOT 36
    const caseNodes: OsintAnalyticalTraceabilityNode[] = assess.verificationCaseIds.map(cId => {
      const c = this.getStoredEntity('OSINT_VERIFICATION_CASES_LOT36', cId, 'id');
      if (c) {
        return {
          type: 'CASE',
          id: cId,
          label: `Dossier de vérification LOT 36: ${c.title || cId}`,
          status: c.status || 'QUALIFIE',
          children: hypothesisNodes
        };
      }
      return {
        type: 'RUPTURE_LIEN',
        id: cId,
        label: `Dossier LOT 36 ${cId} introuvable (rupture de traçabilité)`,
        status: 'RUPTURE_LIEN',
        children: hypothesisNodes
      };
    });

    // Question LOT 34
    const q = this.getStoredEntity('OSINT_REQUIREMENT_QUESTIONS_LOT34', assess.questionId, 'questionId');
    const questionNode: OsintAnalyticalTraceabilityNode = q ? {
      type: 'QUESTION',
      id: assess.questionId,
      label: `Question LOT 34: "${(q.text || q.label || assess.questionId).substring(0, 50)}..."`,
      status: q.importance || 'HAUTE',
      children: caseNodes.length > 0 ? caseNodes : hypothesisNodes
    } : {
      type: 'RUPTURE_LIEN',
      id: assess.questionId,
      label: `Question ${assess.questionId} introuvable (rupture de traçabilité)`,
      status: 'RUPTURE_LIEN',
      children: caseNodes.length > 0 ? caseNodes : hypothesisNodes
    };

    // Besoin LOT 34 (racine descendante)
    const req = this.getStoredEntity('OSINT_REQUIREMENTS_LOT34', assess.requirementId, 'requirementId');
    const rootReqNode: OsintAnalyticalTraceabilityNode = req ? {
      type: 'REQUIREMENT',
      id: assess.requirementId,
      label: `Besoin LOT 34: "${(req.title || assess.requirementId).substring(0, 50)}..."`,
      status: req.status || 'ACTIF',
      children: [questionNode]
    } : {
      type: 'RUPTURE_LIEN',
      id: assess.requirementId,
      label: `Besoin parent ${assess.requirementId} introuvable (rupture de traçabilité)`,
      status: 'RUPTURE_LIEN',
      children: [questionNode]
    };

    // Reconstruction ascendante :
    // DÉCISION -> APPRÉCIATION -> HYPOTHÈSE -> ARGUMENT -> FINDING -> CLAIM -> DOSSIER LOT 36 -> RÉSULTAT LOT 35 -> TÂCHE -> PLAN -> QUESTION -> BESOIN
    const ascending: OsintAnalyticalTraceabilityNode[] = decList.map(dec => {
      return {
        type: 'DECISION',
        id: dec.id,
        label: `Décision finale [${dec.decision}] validée par ${dec.approvedBy}`,
        status: dec.decision,
        children: [
          {
            type: 'ASSESSMENT',
            id: assess.id,
            label: `Appréciation: "${assess.title}" (${assess.status})`,
            status: assess.status,
            children: hypList.map(hyp => ({
              type: 'HYPOTHESIS',
              id: hyp.id,
              label: `Hypothèse sous-jacente [${hyp.type}]: "${hyp.statement.substring(0, 40)}..."`,
              status: hyp.status,
              children: this.arguments.filter(a => a.hypothesisId === hyp.id).map(arg => ({
                type: 'ARGUMENT',
                id: arg.id,
                label: `Argument: "${arg.statement.substring(0, 40)}..."`,
                status: arg.type,
                children: (arg.findingIds || []).length > 0 ? arg.findingIds!.map(fId => {
                  const f = this.getStoredEntity('OSINT_VERIFICATION_FINDINGS_LOT36', fId, 'id');
                  return f ? {
                    type: 'FINDING',
                    id: fId,
                    label: `Finding LOT 36: ${f.content?.substring(0, 40)}...`,
                    status: f.type,
                    children: [{
                       type: 'CLAIM',
                       id: f.claimId || 'unknown',
                       label: `Assertion LOT 36`,
                       status: 'CLAIM',
                       children: [{
                         type: 'CASE',
                         id: f.caseId || assess.verificationCaseIds[0] || 'unknown',
                         label: `Dossier de vérification LOT 36`,
                         status: 'CASE',
                         children: [{
                            type: 'RESULT',
                            id: 'RES-OBS-LOT35',
                            label: `Résultat LOT 35`,
                            status: 'RESULT',
                            children: [{
                               type: 'TASK',
                               id: 'TASK-LOT35',
                               label: `Tâche LOT 35`,
                               status: 'TASK',
                               children: [{
                                  type: 'PLAN',
                                  id: 'PLAN-LOT35',
                                  label: `Plan LOT 35`,
                                  status: 'PLAN',
                                  children: [questionNode ? {
                                    ...questionNode,
                                    children: [rootReqNode ? { ...rootReqNode, children: [] } : { type: 'RUPTURE_LIEN', id: 'req', label: 'Rupture', status: 'RUPTURE_LIEN', children: [] }]
                                  } : { type: 'RUPTURE_LIEN', id: 'q', label: 'Rupture', status: 'RUPTURE_LIEN', children: [] }]
                               }]
                            }]
                         }]
                       }]
                    }]
                  } : {
                    type: 'RUPTURE_LIEN',
                    id: fId,
                    label: `Finding LOT 36 introuvable`,
                    status: 'RUPTURE_LIEN',
                    children: [questionNode ? {
                      ...questionNode,
                      children: [rootReqNode ? { ...rootReqNode, children: [] } : { type: 'RUPTURE_LIEN', id: 'req', label: 'Rupture', status: 'RUPTURE_LIEN', children: [] }]
                    } : { type: 'RUPTURE_LIEN', id: 'q', label: 'Rupture', status: 'RUPTURE_LIEN', children: [] }]
                  };
                }) : [questionNode ? {
                  ...questionNode,
                  children: [rootReqNode ? { ...rootReqNode, children: [] } : { type: 'RUPTURE_LIEN', id: 'req', label: 'Rupture', status: 'RUPTURE_LIEN', children: [] }]
                } : { type: 'RUPTURE_LIEN', id: 'q', label: 'Rupture', status: 'RUPTURE_LIEN', children: [] }]
              }))
            }))
          }
        ]
      };
    });

    return {
      descending: [rootReqNode],
      ascending
    };
  }

  // =========================================================================
  // 11. EXPORT JSON SOUVERAIN (0 APPEL RÉSEAU)
  // =========================================================================

  public exportAnalyticalAssessmentJson(isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): string {
    const d = isDemoFilter === 'ALL' ? undefined : isDemoFilter === 'DEMO';

    const data = {
      exportMetadata: {
        exportVersion: '1.0.0',
        applicationVersion: '37.0.0',
        lot: 'LOT_37_ANALYTICAL_ASSESSMENT_CENTER',
        generatedAt: new Date().toISOString(),
        provenance: 'OSINT_AFRICA_SOVEREIGN_LOCAL',
        networkCalls: 0,
        doctrinalNotice: 'CENTRE D\'ÉVALUATION ANALYTIQUE ET DE RAISONNEMENT STRUCTURÉ. Éléments strictement issus du stockage local. Les scores sont des indicateurs d\'exhaustivité méthodologique et ne constituent aucune probabilité mathématique de vérité.'
      },
      filtres: {
        isDemo: isDemoFilter
      },
      assessments: this.listAssessments(d),
      hypotheses: this.listHypotheses(undefined, d),
      alternatives: this.listAlternatives(undefined, d),
      arguments: this.listArguments(undefined, undefined, d),
      assumptions: this.listAssumptions(undefined, d),
      discriminants: this.listDiscriminants(undefined, d),
      analyticalGaps: this.listAnalyticalGaps(undefined, d),
      decisions: this.listDecisions(undefined, d),
      auditLogs: this.getAuditLogs(d)
    };

    this.addAuditLog(
      'UTILISATEUR',
      'EXPORT_ANALYTICAL_JSON',
      'ALL',
      'ALL',
      `Export JSON souverain complet du Centre d'Évaluation Analytique (Filtre: ${isDemoFilter})`,
      undefined,
      undefined,
      isDemoFilter === 'DEMO'
    );

    return JSON.stringify(data, null, 2);
  }

  // =========================================================================
  // INITIALISATION DES DONNÉES DÉMO
  // =========================================================================

  private initializeDemoData(): void {
    const assess1: OsintAnalyticalAssessment = {
      id: 'ASSESS-2026-001',
      title: 'Appréciation des axes logistiques d\'évitement et approvisionnements clandestins - Liptako-Gourma',
      objective: 'Caractériser la finalité des convois nocturnes non immatriculés détectés entre Ménaka et Bankilaré pour éclairer les options de sécurisation territoriale.',
      requirementId: 'REQ-2026-001',
      questionId: 'Q-REQ-001',
      verificationCaseIds: ['VERIF-CASE-2026-001'],
      evidenceIds: ['EV-2026-001', 'EV-2026-002'],
      claimIds: ['CLM-2026-001', 'CLM-2026-002'],
      hypothesisIds: ['HYP-2026-001', 'HYP-2026-002', 'HYP-2026-003'],
      alternativeIds: ['ALT-2026-001'],
      findingIds: ['FND-2026-001', 'FND-2026-002'],
      assessmentText: 'Il est hautement probable que les convois observés correspondent à un approvisionnement logistique structuré combinant contrebande de carburant et soutien matériel à des groupes armés locaux. L\'hypothèse purement commerciale sans affiliation est affaiblie par l\'usage systématique de balises optiques infrarouges et l\'escorte armée signalée par les témoins.',
      assessmentLevel: 'SUBSTANTIEL',
      confidenceLevel: 'MOYENNE',
      uncertainties: [
        'Commanditaire exact au niveau décisionnel',
        'Fréquence exacte des passages pendant la saison des pluies'
      ],
      limitations: [
        'Absence de capteur thermique fixe sur le tronçon Bankilaré-Inates',
        'Témoignages locaux indirects non recoupés par imagerie satellite haute résolution continue'
      ],
      unresolvedContradictions: [
        'Divergence sur le nombre exact de véhicules (4 pick-ups signalés par source radio vs 7 rapportés par le relais communautaire)'
      ],
      unresolvedGaps: ['AN-GAP-2026-001'],
      status: 'EN_ARBITRAGE',
      createdAt: '2026-03-12T10:00:00Z',
      updatedAt: '2026-03-14T15:30:00Z',
      createdBy: 'ANALYSTE-SAHEL-01',
      isHumanValidated: false,
      isDemo: true
    };

    const hyp1: OsintAnalyticalHypothesis = {
      id: 'HYP-2026-001',
      assessmentId: 'ASSESS-2026-001',
      statement: 'Les convois nocturnes constituent une chaîne logistique dédiée au ravitaillement en carburant et vivres d\'une faction armée implantée au sud de Ménaka.',
      type: 'EXPLICATIVE',
      status: 'FAVORISEE',
      supportingFindingIds: ['FND-2026-001'],
      contradictingFindingIds: [],
      evidenceIds: ['EV-2026-001'],
      assumptionIds: ['ASSUMP-2026-001'],
      confidenceLevel: 'MOYENNE',
      rationale: 'La régularité des rotations nocturnes, l\'absence d\'immatriculation et l\'évitement des postes fixes étatiques concordent avec les modes d\'action logistiques documentés.',
      createdAt: '2026-03-12T11:00:00Z',
      updatedAt: '2026-03-14T14:00:00Z',
      createdBy: 'ANALYSTE-SAHEL-01',
      isDemo: true
    };

    const hyp2: OsintAnalyticalHypothesis = {
      id: 'HYP-2026-002',
      assessmentId: 'ASSESS-2026-001',
      statement: 'Il s\'agit d\'un trafic d\'opportunité commercial strictement civil cherchant à échapper aux taxes douanières sans lien direct avec les factions armées.',
      type: 'ALTERNATIVE',
      status: 'AFFAIBLIE',
      supportingFindingIds: [],
      contradictingFindingIds: ['FND-2026-001'],
      evidenceIds: ['EV-2026-002'],
      assumptionIds: ['ASSUMP-2026-002'],
      confidenceLevel: 'FAIBLE',
      rationale: 'Bien que la contrebande civile soit endémique, le port d\'armes automatiques par les escortes et les traces de fûts de qualité militaire affaiblissent cette thèse.',
      createdAt: '2026-03-12T11:30:00Z',
      updatedAt: '2026-03-14T14:00:00Z',
      createdBy: 'ANALYSTE-SAHEL-02',
      isDemo: true
    };

    const hyp3: OsintAnalyticalHypothesis = {
      id: 'HYP-2026-003',
      assessmentId: 'ASSESS-2026-001',
      statement: 'Mouvement de repli tactique de pasteurs transhumants déroutés par les conflits fonciers dans le secteur d\'Andéramboukane.',
      type: 'CONTEXTUELLE',
      status: 'NON_CONCLUANTE',
      supportingFindingIds: [],
      contradictingFindingIds: [],
      evidenceIds: [],
      assumptionIds: [],
      confidenceLevel: 'FAIBLE',
      rationale: 'Données insuffisantes pour établir ou infirmer la présence de troupeaux associés aux mouvements de véhicules.',
      createdAt: '2026-03-13T09:00:00Z',
      updatedAt: '2026-03-13T09:00:00Z',
      createdBy: 'ANALYSTE-SAHEL-01',
      isDemo: true
    };

    const alt1: OsintAnalyticalAlternative = {
      id: 'ALT-2026-001',
      assessmentId: 'ASSESS-2026-001',
      hypothesisId: 'HYP-2026-001',
      statement: 'Scénario mixte : transporteurs civils rackettés contraints de livrer du carburant à un point de contact intermédiaire sans allégeance idéologique.',
      supportingEvidenceIds: ['EV-2026-002'],
      contradictingEvidenceIds: [],
      keyAssumptions: ['Rétribution financière des chauffeurs par intermédiaire marchand'],
      discriminants: ['DISC-2026-001'],
      status: 'ACTIVE',
      createdAt: '2026-03-13T10:00:00Z',
      isDemo: true
    };

    const arg1: OsintAnalyticalArgument = {
      id: 'ARG-2026-001',
      assessmentId: 'ASSESS-2026-001',
      hypothesisId: 'HYP-2026-001',
      type: 'SUPPORT',
      statement: 'Traces d\'ornières lourdes et bidons de carburant abandonnés de provenance nigériane découverts aux abords immédiats du campement temporaire.',
      evidenceIds: ['EV-2026-001'],
      findingIds: ['FND-2026-001'],
      sourceIds: ['SRC-001'],
      strength: 'FORT',
      createdAt: '2026-03-12T14:00:00Z',
      createdBy: 'ANALYSTE-SAHEL-01',
      isDemo: true
    };

    const arg2: OsintAnalyticalArgument = {
      id: 'ARG-2026-002',
      assessmentId: 'ASSESS-2026-001',
      hypothesisId: 'HYP-2026-001',
      type: 'CONTRADICTION',
      statement: 'Absence d\'affrontements signalés sur la piste malgré la proximité d\'un détachement des forces régulières à moins de 15 km.',
      evidenceIds: ['EV-2026-002'],
      findingIds: ['FND-2026-002'],
      sourceIds: ['SRC-002'],
      strength: 'MOYEN',
      createdAt: '2026-03-12T15:00:00Z',
      createdBy: 'ANALYSTE-SAHEL-02',
      isDemo: true
    };

    const arg3: OsintAnalyticalArgument = {
      id: 'ARG-2026-003',
      assessmentId: 'ASSESS-2026-001',
      hypothesisId: 'HYP-2026-001',
      type: 'LIMITE',
      statement: 'Les observations directes n\'ont pu être corroborées que pendant les nuits sans lune ; les nuits éclairées ne font l\'objet d\'aucune donnée.',
      evidenceIds: [],
      findingIds: [],
      sourceIds: [],
      strength: 'MOYEN',
      createdAt: '2026-03-13T11:00:00Z',
      createdBy: 'ANALYSTE-SAHEL-01',
      isDemo: true
    };

    const assump1: OsintAnalyticalAssumption = {
      id: 'ASSUMP-2026-001',
      assessmentId: 'ASSESS-2026-001',
      statement: 'Les stocks de carburant dans les localités frontalières nigériennes proviennent de circuits non officiels de revente transfrontalière.',
      basis: 'Rapports économiques historiques sur les différentiels de prix du carburant entre Niger et Mali.',
      riskLevel: 'MODERE',
      validationStatus: 'PARTIELLEMENT_VERIFIEE',
      evidenceIds: ['EV-2026-001'],
      createdAt: '2026-03-12T12:00:00Z',
      isDemo: true
    };

    const assump2: OsintAnalyticalAssumption = {
      id: 'ASSUMP-2026-002',
      assessmentId: 'ASSESS-2026-001',
      statement: 'Les conducteurs de véhicules ne sont pas soumis à des fouilles systématiques lors des traversées nocturnes.',
      basis: 'Déclarations orales des chefs de village recueillies en février 2026.',
      riskLevel: 'ELEVE',
      validationStatus: 'NON_VERIFIEE',
      evidenceIds: [],
      createdAt: '2026-03-12T12:30:00Z',
      isDemo: true
    };

    const disc1: OsintAnalyticalDiscriminant = {
      id: 'DISC-2026-001',
      assessmentId: 'ASSESS-2026-001',
      hypothesisIds: ['HYP-2026-001', 'HYP-2026-002'],
      question: 'Les fûts transportés portent-ils des marquages de raffinerie officielle ou des inscriptions artisanales ?',
      expectedObservation: 'Présence de fûts métalliques scellés de 200L avec marquage de compagnie nationale ou récipients plastiques disparates.',
      meaningIfObserved: 'Des fûts industriels scellés renforcent HYP-2026-001 (chaîne logistique organisée). Des récipients plastiques renforcent HYP-2026-002.',
      meaningIfAbsent: 'Indéterminé en l\'absence de photographie rapprochée ou de saisie matérielle.',
      sourceIds: ['SRC-001'],
      status: 'A_RECHERCHER',
      createdAt: '2026-03-13T10:30:00Z',
      isDemo: true
    };

    const gap1: OsintAnalyticalGap = {
      id: 'AN-GAP-2026-001',
      assessmentId: 'ASSESS-2026-001',
      description: 'Absence de données sur l\'identité du destinataire final au-delà de la ligne de crête d\'Inates.',
      impact: 'MAJEUR',
      relatedHypothesisIds: ['HYP-2026-001', 'HYP-2026-002'],
      relatedQuestionIds: ['Q-REQ-001'],
      priority: 'HAUTE',
      status: 'OUVERTE',
      createdAt: '2026-03-12T16:00:00Z',
      isDemo: true
    };

    this.assessments = [assess1];
    this.hypotheses = [hyp1, hyp2, hyp3];
    this.alternatives = [alt1];
    this.arguments = [arg1, arg2, arg3];
    this.assumptions = [assump1, assump2];
    this.discriminants = [disc1];
    this.gaps = [gap1];
    this.decisions = [];
    this.persist();
  }
}

export const analyticalAssessmentService = new AnalyticalAssessmentService();
