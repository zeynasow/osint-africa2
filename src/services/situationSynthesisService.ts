import { OsintSituationSynthesis, OsintSituationItem, OsintSituationChange, OsintSituationGap, OsintSituationValidation, OsintSituationAudit } from '../types';

class SituationSynthesisService {
  private readonly PREFIX = 'OSINT_SITUATION_SYNTHESES_LOT40_';

  private save<T>(key: string, data: T): void {
    localStorage.setItem(this.PREFIX + key, JSON.stringify(data));
  }

  private load<T>(key: string): T[] {
    const data = localStorage.getItem(this.PREFIX + key);
    return data ? JSON.parse(data) : [];
  }

  createSituationSynthesis(synthesis: Omit<OsintSituationSynthesis, 'id' | 'createdAt' | 'updatedAt'>, analystId: string): OsintSituationSynthesis {
    const syntheses = this.load<OsintSituationSynthesis>('SYNTHESES');
    const newSynthesis: OsintSituationSynthesis = {
      ...synthesis,
      id: `SYNTH-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: analystId,
      status: 'BROUILLON'
    };
    syntheses.push(newSynthesis);
    this.save('SYNTHESES', syntheses);
    this.addAuditLog('CREATE', 'SITUATION_SYNTHESIS', newSynthesis.id, analystId, 'Synthèse créée', null, newSynthesis);
    return newSynthesis;
  }

  listSituationSyntheses(): OsintSituationSynthesis[] {
    return this.load<OsintSituationSynthesis>('SYNTHESES');
  }

  private addAuditLog(action: string, entityType: string, entityId: string, actor: string, details: string, before: any, after: any) {
    const logs = this.load<OsintSituationAudit>('AUDIT');
    logs.push({
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      entityType,
      entityId,
      actor,
      details,
      before,
      after,
      isDemo: after?.isDemo || false
    });
    this.save('AUDIT', logs);
  }
  
  // Stubs for remaining required functions
  updateSituationSynthesis(id: string, updates: Partial<OsintSituationSynthesis>): void {}
  getSituationSynthesis(id: string): OsintSituationSynthesis | undefined { return undefined; }
  createSituationItem(item: OsintSituationItem): void {}
  updateSituationItem(id: string, updates: Partial<OsintSituationItem>): void {}
  removeSituationItem(id: string): void {}
  createSituationChange(change: OsintSituationChange): void {}
  updateSituationChange(id: string, updates: Partial<OsintSituationChange>): void {}
  createSituationGap(gap: OsintSituationGap): void {}
  updateSituationGap(id: string, updates: Partial<OsintSituationGap>): void {}
  generateSituationDraft(synthesisId: string): void {}
  buildCurrentSituation(referenceDate: string): any {}
  compareSituationPeriods(date1: string, date2: string): any {}
  validateReferences(data: any): boolean { return true; }
  changeSituationStatus(synthesisId: string, status: string, analystId: string, justification: string): void {}
  createSituationValidation(validation: OsintSituationValidation): void {}
  updateSituationValidation(id: string, updates: Partial<OsintSituationValidation>): void {}
  getSituationTraceability(synthesisId: string): any { return {}; }
  exportSituationSynthesisJson(synthesisId: string): string { return ''; }
  getAuditLogs(): OsintSituationAudit[] { return []; }
}

export const situationSynthesisService = new SituationSynthesisService();
