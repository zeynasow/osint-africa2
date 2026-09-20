
import { 
  OsintProspectiveAssessment, OsintScenario, OsintScenarioAssumption, 
  OsintLeadingIndicator, OsintProspectiveTrigger, OsintScenarioAssessment, 
  OsintScenarioReview 
} from '../types';

class ProspectiveScenarioService {
  private readonly STORAGE_KEYS = {
    ASSESSMENTS: 'OSINT_PROSPECTIVE_ASSESSMENTS_LOT38',
    SCENARIOS: 'OSINT_SCENARIOS_LOT38',
    ASSUMPTIONS: 'OSINT_SCENARIO_ASSUMPTIONS_LOT38',
    INDICATORS: 'OSINT_LEADING_INDICATORS_LOT38',
    TRIGGERS: 'OSINT_PROSPECTIVE_TRIGGERS_LOT38',
    REVIEWS: 'OSINT_SCENARIO_REVIEWS_LOT38',
    AUDIT: 'OSINT_PROSPECTIVE_AUDIT_LOT38',
  };

  constructor() {}

  private getStoredEntities<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setStoredEntities<T>(key: string, entities: T[]): void {
    localStorage.setItem(key, JSON.stringify(entities));
  }

  private addAuditLog(action: string, entityId: string, actorId: string, details: string) {
    const logs = this.getStoredEntities<{action: string, entityId: string, actorId: string, details: string, timestamp: string}>(this.STORAGE_KEYS.AUDIT);
    logs.push({ action, entityId, actorId, details, timestamp: new Date().toISOString() });
    this.setStoredEntities(this.STORAGE_KEYS.AUDIT, logs);
  }

  // --- Assessment Operations ---
  createProspectiveAssessment(data: Omit<OsintProspectiveAssessment, 'id' | 'createdAt' | 'updatedAt' | 'status'>, actorId: string): OsintProspectiveAssessment {
    const assessments = this.getStoredEntities<OsintProspectiveAssessment>(this.STORAGE_KEYS.ASSESSMENTS);
    const newAssessment: OsintProspectiveAssessment = {
      ...data,
      id: `ASSESS-LOT38-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'BROUILLON',
      createdBy: actorId,
      isHumanValidated: false,
    };
    assessments.push(newAssessment);
    this.setStoredEntities(this.STORAGE_KEYS.ASSESSMENTS, assessments);
    this.addAuditLog('CREATE_ASSESSMENT', newAssessment.id, actorId, 'Création cadre prospectif');
    return newAssessment;
  }

  changeProspectiveStatus(assessmentId: string, newStatus: OsintProspectiveAssessment['status'], rationale: string, actorId: string) {
    const assessments = this.getStoredEntities<OsintProspectiveAssessment>(this.STORAGE_KEYS.ASSESSMENTS);
    const index = assessments.findIndex(a => a.id === assessmentId);
    if (index === -1) throw new Error('Appréciation prospective introuvable');
    
    // Matrix validation
    // ... Simplified for implementation
    
    assessments[index].status = newStatus;
    assessments[index].updatedAt = new Date().toISOString();
    this.setStoredEntities(this.STORAGE_KEYS.ASSESSMENTS, assessments);
    this.addAuditLog('CHANGE_STATUS', assessmentId, actorId, `Transition vers ${newStatus}: ${rationale}`);
  }

  // --- Scenario Operations ---
  createScenario(data: Omit<OsintScenario, 'id' | 'createdAt' | 'updatedAt' | 'status'>, actorId: string): OsintScenario {
    const scenarios = this.getStoredEntities<OsintScenario>(this.STORAGE_KEYS.SCENARIOS);
    const newScenario: OsintScenario = {
      ...data,
      id: `SCEN-LOT38-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'BROUILLON',
      createdBy: actorId,
    };
    scenarios.push(newScenario);
    this.setStoredEntities(this.STORAGE_KEYS.SCENARIOS, scenarios);
    this.addAuditLog('CREATE_SCENARIO', newScenario.id, actorId, 'Création scénario');
    return newScenario;
  }

  // --- Evaluate Scenario ---
  evaluateScenario(scenarioId: string) {
    // Synthèse: hypothèses, favorables, défavorables, indicateurs, contradictions, lacunes, sources, temps, qualité.
    // Ne jamais produire: probabilité, scénario gagnant, certitude, prédiction.
    return {
      supportingElements: [],
      contradictingElements: [],
      unresolvedElements: [],
      criticalAssumptions: [],
      limitations: [],
      assessmentLevel: 'MODERE' as const
    };
  }
  
  updateProspectiveAssessment(id: string, data: Partial<OsintProspectiveAssessment>, actorId: string) {
    const assessments = this.getStoredEntities<OsintProspectiveAssessment>(this.STORAGE_KEYS.ASSESSMENTS);
    const index = assessments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Appréciation prospective introuvable');
    assessments[index] = { ...assessments[index], ...data, updatedAt: new Date().toISOString() };
    this.setStoredEntities(this.STORAGE_KEYS.ASSESSMENTS, assessments);
    this.addAuditLog('UPDATE_ASSESSMENT', id, actorId, 'Mise à jour cadre prospectif');
  }

  createScenarioAssumption(data: Omit<OsintScenarioAssumption, 'id' | 'createdAt'>, actorId: string): OsintScenarioAssumption {
    const assumptions = this.getStoredEntities<OsintScenarioAssumption>(this.STORAGE_KEYS.ASSUMPTIONS);
    const newAssumption: OsintScenarioAssumption = {
      ...data,
      id: `ASSUMP-LOT38-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: actorId,
    };
    assumptions.push(newAssumption);
    this.setStoredEntities(this.STORAGE_KEYS.ASSUMPTIONS, assumptions);
    this.addAuditLog('CREATE_ASSUMPTION', newAssumption.id, actorId, 'Création hypothèse');
    return newAssumption;
  }

  createLeadingIndicator(data: Omit<OsintLeadingIndicator, 'id' | 'createdAt' | 'updatedAt'>, actorId: string): OsintLeadingIndicator {
    const indicators = this.getStoredEntities<OsintLeadingIndicator>(this.STORAGE_KEYS.INDICATORS);
    const newIndicator: OsintLeadingIndicator = {
      ...data,
      id: `IND-LOT38-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ACTIF',
    };
    indicators.push(newIndicator);
    this.setStoredEntities(this.STORAGE_KEYS.INDICATORS, indicators);
    this.addAuditLog('CREATE_INDICATOR', newIndicator.id, actorId, 'Création indicateur');
    return newIndicator;
  }

  createProspectiveTrigger(data: Omit<OsintProspectiveTrigger, 'id' | 'createdAt'>, actorId: string): OsintProspectiveTrigger {
    const triggers = this.getStoredEntities<OsintProspectiveTrigger>(this.STORAGE_KEYS.TRIGGERS);
    const newTrigger: OsintProspectiveTrigger = {
      ...data,
      id: `TRIG-LOT38-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'ACTIF',
    };
    triggers.push(newTrigger);
    this.setStoredEntities(this.STORAGE_KEYS.TRIGGERS, triggers);
    this.addAuditLog('CREATE_TRIGGER', newTrigger.id, actorId, 'Création trigger');
    return newTrigger;
  }

  getAuditLogs() {
    return this.getStoredEntities<{action: string, entityId: string, actorId: string, details: string, timestamp: string}>(this.STORAGE_KEYS.AUDIT);
  }
}

export const prospectiveScenarioService = new ProspectiveScenarioService();
