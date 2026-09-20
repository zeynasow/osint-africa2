import { 
  OsintHypothesis, 
  OsintHypothesisGroup, 
  OsintHypothesisEvidence, 
  OsintHypothesisAssessment, 
  OsintHypothesisTest,
  OsintHypothesisDiscriminant,
  OsintHypothesisAudit,
  OsintHypothesisCriterion
} from '../types';

import {
  DEMO_HYPOTHESIS_GROUPS,
  DEMO_HYPOTHESES_LOT30,
  DEMO_HYPOTHESIS_EVIDENCE,
  DEMO_HYPOTHESIS_ASSESSMENTS,
  DEMO_HYPOTHESIS_CRITERIA,
  DEMO_HYPOTHESIS_TESTS,
  DEMO_HYPOTHESIS_DISCRIMINANTS,
  DEMO_HYPOTHESIS_AUDIT
} from '../data/hypothesisDemoData';

const STORAGE_KEYS = {
  GROUPS: 'OSINT_HYPOTHESIS_GROUPS_LOT30',
  HYPOTHESES: 'OSINT_HYPOTHESES_LOT30',
  EVIDENCE: 'OSINT_HYPOTHESIS_EVIDENCE_LOT30',
  ASSESSMENTS: 'OSINT_HYPOTHESIS_ASSESSMENTS_LOT30',
  TESTS: 'OSINT_HYPOTHESIS_TESTS_LOT30',
  DISCRIMINANTS: 'OSINT_HYPOTHESIS_DISCRIMINANTS_LOT30',
  AUDIT: 'OSINT_HYPOTHESIS_AUDIT_LOT30'
};

const inMemoryStore: Record<string, string> = {};

const safeGetItem = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch {
    // fallback
  }
  return inMemoryStore[key] || null;
};

const safeSetItem = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch {
    // fallback
  }
  inMemoryStore[key] = value;
};

class HypothesisCenterService {
  private logAudit(entry: Omit<OsintHypothesisAudit, 'id' | 'timestamp'>) {
    try {
      const logs = this.getAuditLogs();
      const newEntry: OsintHypothesisAudit = {
        ...entry,
        id: `haud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString()
      };
      logs.unshift(newEntry);
      safeSetItem(STORAGE_KEYS.AUDIT, JSON.stringify(logs.slice(0, 1000)));
    } catch (e) {
      console.error('Erreur audit hypothesis:', e);
    }
  }

  public getAuditLogs(isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): OsintHypothesisAudit[] {
    const stored = safeGetItem(STORAGE_KEYS.AUDIT);
    let logs: OsintHypothesisAudit[] = stored ? JSON.parse(stored) : DEMO_HYPOTHESIS_AUDIT;
    if (!stored) safeSetItem(STORAGE_KEYS.AUDIT, JSON.stringify(DEMO_HYPOTHESIS_AUDIT));
    
    if (isDemoFilter === 'REAL') return logs.filter(l => !l.isDemo);
    if (isDemoFilter === 'DEMO') return logs.filter(l => l.isDemo);
    return logs;
  }

  public getGroups(isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): OsintHypothesisGroup[] {
    const stored = safeGetItem(STORAGE_KEYS.GROUPS);
    let items: OsintHypothesisGroup[] = stored ? JSON.parse(stored) : DEMO_HYPOTHESIS_GROUPS;
    if (!stored) safeSetItem(STORAGE_KEYS.GROUPS, JSON.stringify(DEMO_HYPOTHESIS_GROUPS));
    
    if (isDemoFilter === 'REAL') return items.filter(i => !i.isDemo);
    if (isDemoFilter === 'DEMO') return items.filter(i => i.isDemo);
    return items;
  }

  public getHypotheses(isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): OsintHypothesis[] {
    const stored = safeGetItem(STORAGE_KEYS.HYPOTHESES);
    let items: OsintHypothesis[] = stored ? JSON.parse(stored) : DEMO_HYPOTHESES_LOT30;
    if (!stored) safeSetItem(STORAGE_KEYS.HYPOTHESES, JSON.stringify(DEMO_HYPOTHESES_LOT30));
    
    if (isDemoFilter === 'REAL') return items.filter(i => !i.isDemo);
    if (isDemoFilter === 'DEMO') return items.filter(i => i.isDemo);
    return items;
  }

  public getCriteria(): OsintHypothesisCriterion[] {
    return DEMO_HYPOTHESIS_CRITERIA; // Hardcoded reference for criteria
  }

  public updateHypothesisStatus(id: string, newStatus: OsintHypothesis['status'], analystId: string, reason: string) {
    const items = this.getHypotheses('ALL');
    const target = items.find(i => i.id === id);
    if (target) {
      const oldStatus = target.status;
      target.status = newStatus;
      target.updatedAt = new Date().toISOString();
      safeSetItem(STORAGE_KEYS.HYPOTHESES, JSON.stringify(items));
      
      this.logAudit({
        analystId,
        action: 'HYPOTHESIS_STATUS_CHANGED',
        entityId: id,
        before: oldStatus,
        after: newStatus,
        reason,
        isDemo: target.isDemo,
        provenance: target.provenance
      });
    }
  }

  public getEvidences(hypothesisId?: string): OsintHypothesisEvidence[] {
    const stored = safeGetItem(STORAGE_KEYS.EVIDENCE);
    let items: OsintHypothesisEvidence[] = stored ? JSON.parse(stored) : DEMO_HYPOTHESIS_EVIDENCE;
    if (!stored) safeSetItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(DEMO_HYPOTHESIS_EVIDENCE));
    
    if (hypothesisId) {
      return items.filter(i => i.hypothesisId === hypothesisId);
    }
    return items;
  }

  public getAssessments(hypothesisId?: string): OsintHypothesisAssessment[] {
    const stored = safeGetItem(STORAGE_KEYS.ASSESSMENTS);
    let items: OsintHypothesisAssessment[] = stored ? JSON.parse(stored) : DEMO_HYPOTHESIS_ASSESSMENTS;
    if (!stored) safeSetItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(DEMO_HYPOTHESIS_ASSESSMENTS));
    
    if (hypothesisId) {
      return items.filter(i => i.hypothesisId === hypothesisId);
    }
    return items;
  }

  public getTests(hypothesisId?: string): OsintHypothesisTest[] {
    const stored = safeGetItem(STORAGE_KEYS.TESTS);
    let items: OsintHypothesisTest[] = stored ? JSON.parse(stored) : DEMO_HYPOTHESIS_TESTS;
    if (!stored) safeSetItem(STORAGE_KEYS.TESTS, JSON.stringify(DEMO_HYPOTHESIS_TESTS));
    
    if (hypothesisId) {
      return items.filter(i => i.hypothesisId === hypothesisId);
    }
    return items;
  }

  public getDiscriminants(groupId?: string): OsintHypothesisDiscriminant[] {
    const stored = safeGetItem(STORAGE_KEYS.DISCRIMINANTS);
    let items: OsintHypothesisDiscriminant[] = stored ? JSON.parse(stored) : DEMO_HYPOTHESIS_DISCRIMINANTS;
    if (!stored) safeSetItem(STORAGE_KEYS.DISCRIMINANTS, JSON.stringify(DEMO_HYPOTHESIS_DISCRIMINANTS));
    
    if (groupId) {
      const group = this.getGroups('ALL').find(g => g.id === groupId);
      if (group) {
        return items.filter(i => i.hypothesisIds.some(hid => group.hypothesisIds.includes(hid)));
      }
    }
    return items;
  }

  public getKpis(isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL') {
    const hypotheses = this.getHypotheses(isDemoFilter);
    const discriminants = this.getDiscriminants(); // Can be filtered by isDemo later
    
    return {
      activeCount: hypotheses.filter(h => h.status !== 'ECARTEE' && h.status !== 'CLOTUREE').length,
      evaluatingCount: hypotheses.filter(h => h.status === 'EN_EVALUATION').length,
      supportedCount: hypotheses.filter(h => h.status === 'SOUTENUE').length,
      contestedCount: hypotheses.filter(h => h.status === 'CONTESTEE').length,
      insufficientCount: hypotheses.filter(h => h.status === 'INSUFFISANTE').length,
      discardedCount: hypotheses.filter(h => h.status === 'ECARTEE').length,
      openDiscriminantsCount: discriminants.filter(d => d.status === 'A_RECHERCHER' || d.status === 'RECHERCHE_EN_COURS').length
    };
  }

  public exportAllHypothesesJson(isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): string {
    const data = {
      exportVersion: '1.0.0',
      applicationVersion: '30.0.0',
      generatedAt: new Date().toISOString(),
      filtres: {
        isDemo: isDemoFilter
      },
      provenance: 'OSINT_AFRICA_LOT30',
      questions: this.getGroups(isDemoFilter),
      hypotheses: this.getHypotheses(isDemoFilter),
      preuves: this.getEvidences(),
      evaluations: this.getAssessments(),
      criteres: this.getCriteria(),
      tests: this.getTests(),
      discriminants: this.getDiscriminants(),
      audit: this.getAuditLogs(isDemoFilter)
    };
    
    this.logAudit({
      analystId: 'USER',
      action: 'EXPORT_CREATED',
      entityId: 'ALL',
      reason: 'Export JSON manuel',
      isDemo: isDemoFilter === 'DEMO',
      provenance: 'SYSTEM'
    });
    
    return JSON.stringify(data, null, 2);
  }
}

export const hypothesisCenterService = new HypothesisCenterService();
