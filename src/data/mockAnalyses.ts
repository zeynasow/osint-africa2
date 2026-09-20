import { OsintAnalysis } from '../types';

export const mockAnalyses: OsintAnalysis[] = [
  {
    id: 'analysis-1',
    eventId: 'event-1',
    title: 'Analyse incident zone frontalière',
    objective: 'Évaluer la véracité des rapports sur l’incursion',
    summary: 'Rapports contradictoires sur un mouvement de troupes',
    establishedFacts: ['Mouvements observés le 2026-09-10'],
    reportedInformation: ['Source A rapporte des tirs', 'Source B rapporte un exercice'],
    unconfirmedInformation: ['Présence de chars'],
    contradictoryInformation: [
      {
        sourceAId: 'src-a',
        infoA: 'A: Tirs confirmés',
        sourceBId: 'src-b',
        infoB: 'B: Exercice sans munitions'
      }
    ],
    hypothesisIds: ['h1'],
    analyticalAssessment: 'Situation confuse nécessitant confirmation',
    keyFindings: ['Incertitude élevée'],
    implications: ['Risque d’escalade'],
    confidence: 'FAIBLE',
    confidenceReason: 'Informations contradictoires',
    sourceIds: ['src-a', 'src-b'],
    relatedEventIds: ['event-2'],
    relatedActorIds: ['actor-1'],
    analystNotes: [],
    conclusion: 'Zone sous surveillance',
    createdAt: '2026-09-12T10:00:00Z',
    updatedAt: '2026-09-12T10:00:00Z',
    analystId: 'analyst-1',
    status: 'En cours d’analyse',
    isDemo: true,
  },
];
