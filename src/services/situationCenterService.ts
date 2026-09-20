import { OsintSituation } from '../types';
import { mockSituations } from '../data/mockSituations';

const STORAGE_KEY = 'OSINT_SITUATIONS';
const STORAGE_KEY_AUDITS = 'OSINT_SITUATION_AUDITS';

export interface OsintSituationAudit {
  id: string;
  situationId: string;
  situationTitle: string;
  timestamp: string;
  analystId: string;
  action: 'OPEN' | 'UPDATE' | 'STATUS_CHANGE' | 'EXPORT' | 'EVALUATION_UPDATE';
  details: string;
  oldValue?: string;
  newValue?: string;
  isDemo: boolean;
  provenance: string;
}

export const SituationCenterService = {
  getAllSituations: (isDemoFilter: 'ALL' | boolean = 'ALL'): OsintSituation[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      let list: OsintSituation[] = data ? JSON.parse(data) : [];
      if (list.length === 0) {
        list = [...mockSituations];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }
      if (isDemoFilter === 'ALL') return list;
      return list.filter(s => s.isDemo === isDemoFilter);
    } catch {
      return [...mockSituations];
    }
  },

  getSituationById: (id: string): OsintSituation | undefined => {
    const list = SituationCenterService.getAllSituations();
    return list.find(s => s.id === id);
  },

  saveSituation: (
    situation: OsintSituation, 
    analystId: string = 'Analyste OSINT - Pôle Situation', 
    reason: string = 'Mise à jour situation'
  ): void => {
    const situations = SituationCenterService.getAllSituations();
    const index = situations.findIndex(s => s.id === situation.id);
    const now = new Date().toISOString();
    const updatedSituation: OsintSituation = {
      ...situation,
      updatedAt: now,
      lastUpdated: now.split('T')[0]
    };

    let actionType: 'UPDATE' | 'STATUS_CHANGE' = 'UPDATE';
    let oldValue = '';
    let newValue = '';

    if (index >= 0) {
      const prev = situations[index];
      if (prev.status !== updatedSituation.status) {
        actionType = 'STATUS_CHANGE';
        oldValue = prev.status;
        newValue = updatedSituation.status;
      }
      situations[index] = updatedSituation;
    } else {
      situations.push(updatedSituation);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(situations));

    // Audit trace
    SituationCenterService.logAudit({
      id: `sit-aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      situationId: updatedSituation.id,
      situationTitle: updatedSituation.title,
      timestamp: now,
      analystId,
      action: actionType,
      details: reason,
      oldValue,
      newValue,
      isDemo: updatedSituation.isDemo,
      provenance: 'Centre de Situation Opérationnelle'
    });
  },

  deleteSituation: (id: string): void => {
    const situations = SituationCenterService.getAllSituations().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(situations));
  },

  getAudits: (situationId?: string): OsintSituationAudit[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_AUDITS);
      const list: OsintSituationAudit[] = data ? JSON.parse(data) : [];
      if (situationId) {
        return list.filter(a => a.situationId === situationId);
      }
      return list;
    } catch {
      return [];
    }
  },

  logAudit: (entry: OsintSituationAudit): void => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_AUDITS);
      const list: OsintSituationAudit[] = data ? JSON.parse(data) : [];
      list.unshift(entry);
      // Keep last 100 entries
      localStorage.setItem(STORAGE_KEY_AUDITS, JSON.stringify(list.slice(0, 100)));
    } catch (e) {
      console.warn('Audit storage error:', e);
    }
  },

  exportSituationJson: (situation: OsintSituation, contextData: Record<string, any>): string => {
    const exportData = {
      exportMetadata: {
        system: 'OSINT AFRICA',
        module: 'CENTRE DE SITUATION OPÉRATIONNELLE',
        lot: 'LOT 28',
        exportDate: new Date().toISOString(),
        isDemo: situation.isDemo,
        provenance: situation.provenance || 'Système OSINT Africa'
      },
      situation,
      contextData
    };

    SituationCenterService.logAudit({
      id: `sit-aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      situationId: situation.id,
      situationTitle: situation.title,
      timestamp: new Date().toISOString(),
      analystId: 'Analyste Opérationnel',
      action: 'EXPORT',
      details: `Export local JSON complet de la situation "${situation.title}"`,
      isDemo: situation.isDemo,
      provenance: 'Centre de Situation Opérationnelle'
    });

    return JSON.stringify(exportData, null, 2);
  }
};
