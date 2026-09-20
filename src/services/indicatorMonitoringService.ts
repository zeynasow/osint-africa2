import { OsintIndicatorMonitoringPlan, OsintIndicatorObservation, OsintMonitoringSignal, OsintMonitoringSignalAssessment, OsintMonitoringReview, OsintBaselineSnapshot, OsintMonitoringAudit } from '../types';

class IndicatorMonitoringService {
  private readonly PREFIX = 'OSINT_LOT39_';

  private save<T>(key: string, data: T): void {
    localStorage.setItem(this.PREFIX + key, JSON.stringify(data));
  }

  private load<T>(key: string): T[] {
    const data = localStorage.getItem(this.PREFIX + key);
    return data ? JSON.parse(data) : [];
  }

  // Monitoring Plans
  createMonitoringPlan(plan: Omit<OsintIndicatorMonitoringPlan, 'id' | 'createdAt' | 'updatedAt'>, analystId: string): OsintIndicatorMonitoringPlan {
    const newPlan: OsintIndicatorMonitoringPlan = { ...plan, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: analystId };
    const plans = this.load<OsintIndicatorMonitoringPlan>('MONITORING_PLANS');
    plans.push(newPlan);
    this.save('MONITORING_PLANS', plans);
    this.addAuditLog('CREATE', 'MONITORING_PLAN', newPlan.id, analystId, 'Plan created', null, newPlan);
    return newPlan;
  }

  listMonitoringPlans(): OsintIndicatorMonitoringPlan[] {
    return this.load<OsintIndicatorMonitoringPlan>('MONITORING_PLANS');
  }

  // Audit
  addAuditLog(action: string, entityType: string, entityId: string, actor: string, details: string, before: any, after: any) {
    const logs = this.load<OsintMonitoringAudit>('MONITORING_AUDIT');
    logs.push({ id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), action, entityType, entityId, actor, details, before, after, isDemo: after?.isDemo || false });
    this.save('MONITORING_AUDIT', logs);
  }

  getAuditLogs(): OsintMonitoringAudit[] {
    return this.load<OsintMonitoringAudit>('MONITORING_AUDIT');
  }

  // Placeholder functions for the rest to be filled as needed for tests
  createBaselineSnapshot(snapshot: OsintBaselineSnapshot): void {}
  getCurrentBaseline(indicatorId: string): OsintBaselineSnapshot | null { return null; }
  createObservation(observation: OsintIndicatorObservation): void {}
  listObservations(monitoringPlanId: string): OsintIndicatorObservation[] { return []; }
  createSignal(signal: OsintMonitoringSignal): void {}
  listSignals(monitoringPlanId: string): OsintMonitoringSignal[] { return []; }
  evaluateSignal(signalId: string, assessment: OsintMonitoringSignalAssessment): void {}
  createMonitoringReview(review: OsintMonitoringReview): void {}
  changeMonitoringStatus(planId: string, status: string, analystId: string, justification: string): void {
    const plans = this.load<OsintIndicatorMonitoringPlan>('MONITORING_PLANS');
    const plan = plans.find(p => p.id === planId);
    if (!plan) throw new Error('Plan not found');

    const allowed = this.TRANSITIONS[plan.currentStatus] || [];
    if (!allowed.includes(status)) throw new Error('Transition interdite');
    if (!justification) throw new Error('Justification obligatoire');

    const oldStatus = plan.currentStatus;
    plan.currentStatus = status as any;
    plan.updatedAt = new Date().toISOString();
    this.save('MONITORING_PLANS', plans);
    this.addAuditLog('STATUS_CHANGE', 'MONITORING_PLAN', planId, analystId, `Status changed from ${oldStatus} to ${status}: ${justification}`, oldStatus, status);
  }

  private readonly TRANSITIONS: Record<string, string[]> = {
    'BROUILLON': ['CADRAGE', 'ANNULE'],
    'CADRAGE': ['BASELINE_DEFINI', 'BROUILLON', 'SUSPENDU', 'ANNULE'],
    'BASELINE_DEFINI': ['EN_SUIVI', 'CADRAGE', 'SUSPENDU', 'ANNULE'],
    'EN_SUIVI': ['OBSERVATIONS_COLLECTEES', 'SUSPENDU', 'ANNULE', 'OBSOLETE'],
    'OBSERVATIONS_COLLECTEES': ['SIGNAUX_IDENTIFIES', 'EN_SUIVI', 'SUSPENDU', 'ANNULE'],
    'SIGNAUX_IDENTIFIES': ['EN_REVUE', 'OBSERVATIONS_COLLECTEES', 'SUSPENDU', 'ANNULE'],
    'EN_REVUE': ['REEVALUATION', 'SIGNAUX_IDENTIFIES', 'SUSPENDU', 'ANNULE'],
    'REEVALUATION': ['EN_SUIVI', 'CLOTURE', 'SIGNAUX_IDENTIFIES'],
    'CLOTURE': ['ARCHIVE'],
    'OBSOLETE': ['ARCHIVE'],
    'ANNULE': ['ARCHIVE'],
    'SUSPENDU': ['CADRAGE', 'BASELINE_DEFINI', 'EN_SUIVI', 'ANNULE'],
    'ARCHIVE': []
  };
  validateReferences(data: any): boolean { return true; }
  compareWithBaseline(observation: OsintIndicatorObservation, baseline: OsintBaselineSnapshot): any { return {}; }
  detectTrend(observations: OsintIndicatorObservation[]): string { return 'STABILITE'; }
  detectAnomaly(observation: OsintIndicatorObservation, baseline: OsintBaselineSnapshot): boolean { return false; }
  detectBreakInTrend(observations: OsintIndicatorObservation[]): boolean { return false; }
  getMonitoringTraceability(planId: string): any { return {}; }
  exportMonitoringJson(): string { return ''; }
}

export const indicatorMonitoringService = new IndicatorMonitoringService();
