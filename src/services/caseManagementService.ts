import { OsintCase, OsintCaseTask, OsintCaseMilestone, OsintCaseAssessment, OsintCaseContradiction, OsintIntelligenceGap, OsintCaseAudit } from '../types';

const STORAGE_KEYS = {
  CASES: 'OSINT_CASES',
  TASKS: 'OSINT_CASE_TASKS',
  MILESTONES: 'OSINT_CASE_MILESTONES',
  ASSESSMENTS: 'OSINT_CASE_ASSESSMENTS',
  AUDIT: 'OSINT_CASE_AUDIT'
};

const DEMO_CASES: OsintCase[] = [
  {
    id: 'case-demo-001',
    title: 'Trafics maritimes suspects - Golfe de Guinée',
    description: 'Analyse d\'une série d\'anomalies de trajectoire AIS corrélées avec des signaux de transbordement illégal.',
    status: 'ACTIVE',
    priority: 'HIGH',
    category: 'MARITIME',
    alertIds: ['alt-demo-001', 'alt-demo-002'],
    signalIds: ['ws-demo-001'],
    eventIds: ['evt-001', 'evt-002'],
    indicatorIds: ['ind-demo-001'],
    actorIds: ['act-001', 'act-003'],
    evidenceIds: ['ev-001', 'ev-002'],
    hypothesisIds: ['hyp-001'],
    questionIds: ['q-001'],
    reportIds: ['prod-001'],
    correlationIds: ['corr-demo-001'],
    anomalyIds: ['ano-demo-001'],
    tasks: [],
    milestones: [],
    assessments: [],
    contradictions: [],
    intelligenceGaps: [
      { id: 'ig-01', caseId: 'case-demo-001', title: 'Propriétaire réel du navire', description: 'Société écran offshore', priority: 'HIGH', status: 'IDENTIFIED', identifiedAt: new Date().toISOString(), isDemo: true, provenance: 'Analyst' }
    ],
    owner: 'Analyst_A',
    team: ['Analyst_A', 'Analyst_B'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true,
    provenance: 'System'
  },
  {
    id: 'case-demo-002',
    title: 'Campagne de désinformation - Élections 2024',
    description: 'Réseau coordonné d\'amplification artificielle détecté sur les réseaux sociaux visant à discréditer le processus électoral.',
    status: 'OPEN',
    priority: 'CRITICAL',
    category: 'POLITICS',
    alertIds: ['alt-demo-003'],
    signalIds: ['ws-demo-001'],
    eventIds: ['evt-003'],
    indicatorIds: ['ind-demo-001'],
    actorIds: ['act-002'],
    evidenceIds: ['ev-002', 'ev-003'],
    hypothesisIds: ['hyp-002'],
    questionIds: ['q-002', 'q-003'],
    reportIds: ['prod-002'],
    correlationIds: ['corr-demo-001'],
    anomalyIds: ['ano-demo-001'],
    tasks: [],
    milestones: [],
    assessments: [],
    contradictions: [
      { id: 'ct-01', caseId: 'case-demo-002', description: 'Volume de posts vs Nouveaux comptes', sourceIds: [], detectedAt: new Date().toISOString(), impact: 'HIGH', status: 'UNDER_REVIEW', isDemo: true, provenance: 'Analysis' }
    ],
    intelligenceGaps: [],
    owner: 'Analyst_C',
    team: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true,
    provenance: 'System'
  },
  {
    id: 'case-demo-003',
    title: 'Flambée inexpliquée de fièvres hémorragiques',
    description: 'Surveillance des signaux faibles épidémiologiques dans la région frontalière.',
    status: 'UNDER_REVIEW',
    priority: 'HIGH',
    category: 'HEALTH',
    alertIds: ['alt-demo-004'],
    signalIds: ['ws-demo-001'],
    eventIds: ['evt-004'],
    indicatorIds: ['ind-demo-001'],
    actorIds: ['act-004'],
    evidenceIds: ['ev-003'],
    hypothesisIds: ['hyp-001'],
    questionIds: ['q-001'],
    reportIds: ['prod-003'],
    correlationIds: ['corr-demo-001'],
    anomalyIds: ['ano-demo-001'],
    tasks: [],
    milestones: [],
    assessments: [],
    contradictions: [],
    intelligenceGaps: [],
    owner: 'Analyst_Med',
    team: [],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true,
    provenance: 'System'
  },
  {
    id: 'case-demo-004',
    title: 'Sabotage infrastructure énergétique',
    description: 'Coupures ciblées du réseau électrique coïncidant avec des mouvements de groupes armés.',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    category: 'ENERGY',
    alertIds: ['alt-demo-005'],
    signalIds: ['ws-demo-001'],
    eventIds: ['evt-005'],
    indicatorIds: ['ind-demo-001'],
    actorIds: ['act-005'],
    evidenceIds: ['ev-001'],
    hypothesisIds: ['hyp-001'],
    questionIds: ['q-001'],
    reportIds: ['prod-001'],
    correlationIds: ['corr-demo-001'],
    anomalyIds: ['ano-demo-001'],
    tasks: [],
    milestones: [],
    assessments: [],
    contradictions: [],
    intelligenceGaps: [],
    owner: 'Analyst_Infra',
    team: [],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true,
    provenance: 'System'
  },
  {
    id: 'case-demo-005',
    title: 'Flux migratoires anormaux et réseaux de passeurs',
    description: 'Augmentation des détections de groupes en transit dans la zone sahélienne.',
    status: 'SUSPENDED',
    priority: 'MEDIUM',
    category: 'SECURITY',
    alertIds: [],
    signalIds: [],
    eventIds: [],
    indicatorIds: [],
    actorIds: [],
    evidenceIds: [],
    hypothesisIds: [],
    questionIds: [],
    reportIds: [],
    correlationIds: [],
    anomalyIds: [],
    tasks: [],
    milestones: [],
    assessments: [],
    contradictions: [],
    intelligenceGaps: [],
    owner: 'Analyst_Sec',
    team: [],
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true,
    provenance: 'System'
  }
];

const DEMO_TASKS: OsintCaseTask[] = [
  { id: 'tsk-01', caseId: 'case-demo-001', title: 'Vérifier l\'immatriculation du navire', status: 'DONE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isDemo: true, provenance: 'Analyst' },
  { id: 'tsk-02', caseId: 'case-demo-001', title: 'Corréler avec les données satellitaires', status: 'IN_PROGRESS', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isDemo: true, provenance: 'Analyst' }
];

const DEMO_MILESTONES: OsintCaseMilestone[] = [
  { id: 'ms-01', caseId: 'case-demo-001', title: 'Identification primaire', status: 'ACHIEVED', isDemo: true, provenance: 'Analyst' },
  { id: 'ms-02', caseId: 'case-demo-001', title: 'Transmission aux garde-côtes', status: 'PLANNED', isDemo: true, provenance: 'Analyst' }
];

const DEMO_ASSESSMENTS: OsintCaseAssessment[] = [];
const DEMO_AUDIT: OsintCaseAudit[] = [];

export class CaseManagementService {
  static init() {
    if (!localStorage.getItem(STORAGE_KEYS.CASES)) localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(DEMO_CASES));
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEMO_TASKS));
    if (!localStorage.getItem(STORAGE_KEYS.MILESTONES)) localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(DEMO_MILESTONES));
    if (!localStorage.getItem(STORAGE_KEYS.ASSESSMENTS)) localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(DEMO_ASSESSMENTS));
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT)) localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(DEMO_AUDIT));
  }

  static getCases(): OsintCase[] {
    this.init();
    const cases: OsintCase[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CASES) || '[]');
    const tasks: OsintCaseTask[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    const milestones: OsintCaseMilestone[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MILESTONES) || '[]');
    const assessments: OsintCaseAssessment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSESSMENTS) || '[]');

    return cases.map(c => ({
      ...c,
      tasks: tasks.filter(t => t.caseId === c.id),
      milestones: milestones.filter(m => m.caseId === c.id),
      assessments: assessments.filter(a => a.caseId === c.id)
    }));
  }

  static getCase(id: string): OsintCase | undefined {
    return this.getCases().find(c => c.id === id);
  }

  static saveCase(osintCase: OsintCase, analystId: string = 'System', reason: string = 'Update'): OsintCase {
    const cases: OsintCase[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CASES) || '[]');
    const index = cases.findIndex(c => c.id === osintCase.id);
    const now = new Date().toISOString();
    
    // Copy the case and strip relations for separate storage
    const caseToSave = { ...osintCase };
    const tasks = caseToSave.tasks || [];
    const milestones = caseToSave.milestones || [];
    const assessments = caseToSave.assessments || [];
    
    caseToSave.tasks = [];
    caseToSave.milestones = [];
    caseToSave.assessments = [];
    caseToSave.updatedAt = now;

    let oldValue = undefined;
    
    if (index >= 0) {
      oldValue = JSON.stringify(cases[index]);
      cases[index] = caseToSave;
    } else {
      cases.push(caseToSave);
    }
    
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    
    // Save relations
    this.saveTasks(tasks, osintCase.id);
    this.saveMilestones(milestones, osintCase.id);
    this.saveAssessments(assessments, osintCase.id);
    
    // Audit log
    this.logAudit({
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      caseId: osintCase.id,
      timestamp: now,
      analystId,
      action: index >= 0 ? 'UPDATE_CASE' : 'CREATE_CASE',
      object: 'OsintCase',
      oldValue,
      newValue: JSON.stringify(caseToSave),
      justification: reason,
      isDemo: osintCase.isDemo,
      provenance: 'System'
    });

    return this.getCase(osintCase.id)!;
  }

  private static saveTasks(tasks: OsintCaseTask[], caseId: string) {
    let allTasks: OsintCaseTask[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    allTasks = allTasks.filter(t => t.caseId !== caseId).concat(tasks);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(allTasks));
  }

  private static saveMilestones(milestones: OsintCaseMilestone[], caseId: string) {
    let allMilestones: OsintCaseMilestone[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MILESTONES) || '[]');
    allMilestones = allMilestones.filter(m => m.caseId !== caseId).concat(milestones);
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(allMilestones));
  }

  private static saveAssessments(assessments: OsintCaseAssessment[], caseId: string) {
    let allAssessments: OsintCaseAssessment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSESSMENTS) || '[]');
    allAssessments = allAssessments.filter(a => a.caseId !== caseId).concat(assessments);
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(allAssessments));
  }

  static logAudit(audit: OsintCaseAudit) {
    const audits: OsintCaseAudit[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT) || '[]');
    audits.push(audit);
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(audits));
  }

  static getAudits(caseId: string): OsintCaseAudit[] {
    this.init();
    const audits: OsintCaseAudit[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT) || '[]');
    return audits.filter(a => a.caseId === caseId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static exportCaseJson(id: string): string | null {
    const osintCase = this.getCase(id);
    if (!osintCase) return null;
    const audits = this.getAudits(id);
    
    const exportData = {
      ...osintCase,
      auditTrail: audits,
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  static deleteCase(id: string, analystId: string = 'System', reason: string = 'Delete'): void {
    const osintCase = this.getCase(id);
    if (!osintCase) return;

    this.logAudit({
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      caseId: id,
      timestamp: new Date().toISOString(),
      analystId,
      action: 'DELETE_CASE',
      object: 'OsintCase',
      oldValue: JSON.stringify(osintCase),
      justification: reason,
      isDemo: osintCase.isDemo,
      provenance: 'System'
    });

    const cases = JSON.parse(localStorage.getItem(STORAGE_KEYS.CASES) || '[]');
    const newCases = cases.filter((c: any) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(newCases));
  }
}
