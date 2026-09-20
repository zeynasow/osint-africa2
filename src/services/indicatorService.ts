import { OsintIndicator } from '../types';
import { INITIAL_DEMO_INDICATORS } from '../data/weakSignalDemoData';

export class IndicatorService {
  /**
   * Retourne les indicateurs précurseurs locaux.
   * DOCTRINE : ABNORMAL ≠ menace, CRITICAL ≠ menace confirmée.
   */
  public getIndicators(isDemo: boolean = true): OsintIndicator[] {
    try {
      const stored = localStorage.getItem('OSINT_INDICATORS');
      if (stored) {
        const parsed: OsintIndicator[] = JSON.parse(stored);
        return parsed.filter(i => Boolean(i.isDemo) === isDemo);
      }
    } catch {
      // Fallback
    }
    return isDemo ? INITIAL_DEMO_INDICATORS : [];
  }

  /**
   * Calcul local des indicateurs précurseurs basés sur l'activité
   */
  public calculateIndicatorsLocally(alertCount24h: number = 12): OsintIndicator[] {
    const indicators: OsintIndicator[] = [
      {
        id: 'ind-loc-001',
        name: 'Volume d\'alertes qualifiées (24h)',
        description: 'Nombre d\'alertes P1/P2/P3 enregistrées sur les dernières 24 heures.',
        category: 'VOLUMÉTRIE',
        definition: 'Mesure la fréquence de création d\'alertes OSINT par période.',
        unit: 'alertes/24h',
        baseline: 5,
        currentValue: alertCount24h,
        variation: Math.round(((alertCount24h - 5) / 5) * 100),
        direction: alertCount24h > 5 ? 'UP' : alertCount24h < 5 ? 'DOWN' : 'STABLE',
        threshold: 15,
        thresholdType: 'INHABITUEL',
        period: '24H',
        sourceIds: ['src-real-001'],
        relatedAlertIds: [],
        relatedEventIds: [],
        status: alertCount24h > 15 ? 'CRITICAL' : alertCount24h > 8 ? 'ABNORMAL' : 'NORMAL',
        confidence: 'ÉLEVÉE',
        isDemo: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ind-loc-002',
        name: 'Diversité des sources actives',
        description: 'Nombre de sources distinctes ayant émis des signaux.',
        category: 'PROVENANCE',
        definition: 'Mesure le recoupement multi-sources sur les dernières 48h.',
        unit: 'sources distinctes',
        baseline: 1,
        currentValue: 1,
        variation: 0,
        direction: 'STABLE',
        threshold: 3,
        thresholdType: 'DIVERGENCE',
        period: '7J',
        sourceIds: ['src-real-001'],
        relatedAlertIds: [],
        relatedEventIds: [],
        status: 'WATCH',
        confidence: 'MOYENNE',
        isDemo: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return indicators;
  }
}

export const indicatorService = new IndicatorService();
