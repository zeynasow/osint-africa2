import { OsintAnomaly } from '../types';
import { INITIAL_DEMO_ANOMALIES } from '../data/weakSignalDemoData';

export type AnomalyType = 
  | 'VOLUME_SPIKE'
  | 'VOLUME_DROP'
  | 'RECENCY_CLUSTER'
  | 'ACTOR_SURGE'
  | 'GEOGRAPHIC_CLUSTER'
  | 'CATEGORY_SPIKE'
  | 'NEW_PATTERN'
  | 'CONTRADICTION_SPIKE'
  | 'SOURCE_BEHAVIOR_CHANGE';

export class AnomalyDetectionService {
  /**
   * Retourne la liste des anomalies locales.
   * RAPPEL DOCTRINAL : ANOMALIE ≠ MENACE
   */
  public getAnomalies(isDemo: boolean = true): OsintAnomaly[] {
    try {
      const stored = localStorage.getItem('OSINT_ANOMALIES');
      if (stored) {
        const parsed: OsintAnomaly[] = JSON.parse(stored);
        return parsed.filter(a => Boolean(a.isDemo) === isDemo);
      }
    } catch {
      // Fallback
    }
    return isDemo ? INITIAL_DEMO_ANOMALIES : [];
  }

  /**
   * Analyse locale des anomalies sur la base des items/alertes
   */
  public detectAnomaliesLocally(items: any[]): OsintAnomaly[] {
    if (!items || items.length === 0) {
      return this.getAnomalies(true);
    }
    const detected: OsintAnomaly[] = [];

    // Exemple de détection déterministe locale VOLUME_SPIKE
    if (items.length > 5) {
      detected.push({
        id: `ano-loc-${Date.now()}-01`,
        type: 'VOLUME_SPIKE',
        description: 'Hausse inhabituelle du volume de dépêches collectées (+180% vs baseline)',
        detectedAt: new Date().toISOString(),
        baselineValue: 5,
        observedValue: items.length,
        deviation: Math.round(((items.length - 5) / 5) * 100),
        score: 72,
        severity: 'MOYENNE',
        sourceIds: ['src-real-001'],
        itemIds: items.slice(0, 3).map(i => i.id || 'item-0'),
        alertIds: [],
        status: 'NÉCESSITE_REVUE',
        isHumanValidated: false,
        isDemo: false,
        createdAt: new Date().toISOString()
      });
    }

    return detected.length > 0 ? detected : this.getAnomalies(true);
  }
}

export const anomalyDetectionService = new AnomalyDetectionService();
