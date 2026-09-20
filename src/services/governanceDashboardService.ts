import { OsintGovernanceDashboard, OsintGovernanceKpi, OsintGovernanceIssue, OsintGovernanceAction, OsintGovernanceAudit } from '../types';

class GovernanceDashboardService {
  private readonly PREFIX = 'OSINT_GOVERNANCE_LOT41_';

  private save<T>(key: string, data: T): void {
    localStorage.setItem(this.PREFIX + key, JSON.stringify(data));
  }

  private load<T>(key: string): T[] {
    const data = localStorage.getItem(this.PREFIX + key);
    return data ? JSON.parse(data) : [];
  }

  buildGovernanceDashboard(analystId: string): OsintGovernanceDashboard {
    const dashboard: OsintGovernanceDashboard = {
      id: `DASH-${Date.now()}`,
      referenceDate: new Date().toISOString(),
      overallStatus: 'OPERATIONNEL',
      activeRequirements: 0,
      openResearchPlans: 0,
      resultsAwaitingEvaluation: 0,
      verificationCasesOpen: 0,
      assessmentsAwaitingValidation: 0,
      activeScenarios: 0,
      monitoredIndicators: 0,
      openSignals: 0,
      pendingReviews: 0,
      openGaps: 0,
      openContradictions: 0,
      pendingSituationSyntheses: 0,
      archivedItems: 0,
      obsoleteItems: 0,
      traceabilityHealth: 100,
      dataIntegrityHealth: 100,
      governanceHealth: 100,
      persistenceHealth: 100,
      lastAuditAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false
    };
    this.save('DASHBOARDS', [dashboard]);
    this.addAuditLog('BUILD', 'DASHBOARD', dashboard.id, analystId, 'Dashboard créé', null, dashboard);
    return dashboard;
  }

  private addAuditLog(action: string, entityType: string, entityId: string, actor: string, details: string, before: any, after: any) {
    const logs = this.load<OsintGovernanceAudit>('AUDIT');
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

  // Stubs
  calculateGovernanceKpis(dashboardId: string): OsintGovernanceKpi[] { return []; }
  calculateTraceabilityHealth(): number { return 100; }
  calculateDataIntegrityHealth(): number { return 100; }
  calculateGovernanceHealth(): number { return 100; }
  calculatePersistenceHealth(): number { return 100; }
  detectGovernanceIssues(dashboardId: string): OsintGovernanceIssue[] { return []; }
  createGovernanceIssue(issue: OsintGovernanceIssue): void {}
  updateGovernanceIssue(id: string, updates: Partial<OsintGovernanceIssue>): void {}
  createGovernanceAction(action: OsintGovernanceAction): void {}
  updateGovernanceAction(id: string, updates: Partial<OsintGovernanceAction>): void {}
  getGovernanceIssue(id: string): OsintGovernanceIssue | undefined { return undefined; }
  listGovernanceIssues(): OsintGovernanceIssue[] { return []; }
  getGovernanceActions(): OsintGovernanceAction[] { return []; }
  getGovernanceAudit(): OsintGovernanceAudit[] { return []; }
  validateGovernanceReferences(dashboardId: string): boolean { return true; }
  exportGovernanceDashboardJson(dashboardId: string): string {
    const dashboards = this.load<OsintGovernanceDashboard>('DASHBOARDS');
    const dashboard = dashboards.find(d => d.id === dashboardId);
    if (!dashboard) return JSON.stringify({ error: 'Not found' });
    
    return JSON.stringify({
      dashboard,
      kpis: this.calculateGovernanceKpis(dashboardId),
      issues: this.listGovernanceIssues(),
      actions: this.getGovernanceActions(),
      audit: this.getGovernanceAudit(),
      limitations: [],
      isDemo: dashboard.isDemo
    });
  }
}

export const governanceDashboardService = new GovernanceDashboardService();
