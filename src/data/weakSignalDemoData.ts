import { OsintWeakSignal, OsintCorrelation, OsintAnomaly, OsintIndicator } from '../types';

export const INITIAL_DEMO_WEAK_SIGNALS: OsintWeakSignal[] = [
  {
    id: 'ws-demo-001',
    title: 'Hausse inhabituelle des mentions d\'infrastructure critique',
    description: 'Fréquence accrue de termes liés aux infrastructures énergétiques.',
    signalType: 'REPETITION_TEMPORELLE',
    indicators: [],
    relatedEventIds: [],
    relatedSourceIds: [],
    relatedActorIds: [],
    countryCodes: ['SEN'],
    categoryIds: ['ENERGY'],
    observedCount: 1,
    firstObservedAt: '2026-09-14T08:00:00Z',
    lastObservedAt: '2026-09-14T10:00:00Z',
    evolution: 'EN HAUSSE',
    confidence: 'MOYENNE',
    significance: 'MODÉRÉE',
    status: 'NOUVEAU',
    uncertainty: [],
    recommendedVerification: [],
    analyticalQuestions: [],
    isDemo: true,
    createdAt: '2026-09-14T10:00:00Z',
    updatedAt: '2026-09-14T10:00:00Z'
  }
];

export const INITIAL_DEMO_CORRELATIONS: OsintCorrelation[] = [
  {
    id: 'corr-demo-001',
    title: 'Corrélation temporelle entre incident maritime et coupure internet',
    description: 'Les deux incidents surviennent dans un intervalle de 2 heures.',
    correlationType: 'TEMPORAL',
    eventIds: [],
    sourceIds: [],
    actorIds: [],
    countryCodes: ['CIV'],
    categoryIds: ['MARITIME'],
    firstObservedAt: '2026-09-13T09:00:00Z',
    lastObservedAt: '2026-09-13T11:00:00Z',
    occurrenceCount: 2,
    confidence: 'ÉLEVÉE',
    significance: 'IMPORTANTE',
    status: 'NOUVEAU',
    score: 80,
    maxScore: 100,
    matchedFactors: [],
    uncertainty: [],
    createdAt: '2026-09-14T12:00:00Z',
    updatedAt: '2026-09-14T12:00:00Z',
    isDemo: true
  }
];

export const INITIAL_DEMO_ANOMALIES: OsintAnomaly[] = [
  {
    id: 'ano-demo-001',
    type: 'VOLUME_SPIKE',
    description: 'Pic de trafic sur les mentions de sécurité nationale.',
    detectedAt: '2026-09-14T11:00:00Z',
    baselineValue: 10,
    observedValue: 50,
    deviation: 400,
    score: 75,
    severity: 'MEDIUM',
    sourceIds: ['src-demo-001'],
    itemIds: [],
    alertIds: [],
    status: 'NEW',
    isHumanValidated: false,
    isDemo: true,
    createdAt: '2026-09-14T11:00:00Z'
  }
];

export const INITIAL_DEMO_INDICATORS: OsintIndicator[] = [
  {
    id: 'ind-demo-001',
    name: 'Nombre d\'alertes / 24h',
    description: 'Volume quotidien des alertes.',
    category: 'VOLUME',
    definition: 'Alertes créées',
    unit: 'count',
    baseline: 5,
    currentValue: 12,
    variation: 140,
    direction: 'UP',
    threshold: 15,
    thresholdType: 'ABNORMAL',
    period: '24H',
    sourceIds: [],
    relatedAlertIds: [],
    relatedEventIds: [],
    status: 'WATCH',
    confidence: 'HIGH',
    isDemo: true,
    createdAt: '2026-09-14T12:00:00Z',
    updatedAt: '2026-09-14T12:00:00Z'
  }
];
