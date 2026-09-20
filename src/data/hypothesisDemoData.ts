import { 
  OsintHypothesis, 
  OsintHypothesisGroup, 
  OsintHypothesisEvidence, 
  OsintHypothesisAssessment, 
  OsintHypothesisTest,
  OsintHypothesisDiscriminant,
  OsintHypothesisAudit, OsintHypothesisCriterion
} from '../types';

export const DEMO_HYPOTHESIS_GROUPS: OsintHypothesisGroup[] = [
  {
    id: 'hg-001',
    question: 'Quelle est la principale cause de la recrudescence des incidents sécuritaires transfrontaliers entre le pays Alpha et Beta ?',
    hypothesisIds: ['hyp-001', 'hyp-002', 'hyp-003'],
    analystId: 'Analyste Senior OSINT',
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-09-14T15:30:00Z',
    conclusion: 'L’hypothèse d’un conflit de ressources (H2) est actuellement la mieux soutenue, bien que la présence d’acteurs non étatiques (H1) joue un rôle amplificateur documenté.',
    confidence: 'ELEVEE',
    limitations: 'Manque de données sources directes côté Beta, forte dépendance aux rapports satellites.',
    gaps: 'Nécessite confirmation des mouvements de troupes côté frontière est.',
    nextSteps: 'Activer un plan de veille spécifique sur les réseaux sociaux locaux pour identifier d’éventuelles revendications.',
    isDemo: true,
    provenance: 'SCENARIO_DEMO'
  },
  {
    id: 'hg-002',
    question: 'Quel est l’objectif stratégique de la nouvelle campagne de désinformation détectée sur les réseaux régionaux ?',
    hypothesisIds: ['hyp-004', 'hyp-005', 'hyp-006'],
    analystId: 'Analyste Cyber',
    createdAt: '2026-09-12T08:00:00Z',
    updatedAt: '2026-09-15T09:00:00Z',
    isDemo: true,
    provenance: 'SCENARIO_DEMO'
  },
  {
    id: 'hg-003',
    question: 'Quels facteurs expliquent la rupture soudaine de la chaîne d’approvisionnement en céréales dans la région X ?',
    hypothesisIds: ['hyp-007', 'hyp-008', 'hyp-009'],
    analystId: 'Analyste Économique',
    createdAt: '2026-09-13T11:00:00Z',
    updatedAt: '2026-09-14T10:00:00Z',
    isDemo: true,
    provenance: 'SCENARIO_DEMO'
  },
  {
    id: 'hg-004',
    question: 'Quelle entité est responsable du sabotage de l’infrastructure de télécommunication du 12 Septembre ?',
    hypothesisIds: ['hyp-010', 'hyp-011', 'hyp-012'],
    analystId: 'Analyste Infra',
    createdAt: '2026-09-14T14:00:00Z',
    updatedAt: '2026-09-15T08:00:00Z',
    isDemo: true,
    provenance: 'SCENARIO_DEMO'
  },
  {
    id: 'hg-005',
    question: 'Comment interpréter les mouvements navals atypiques observés au large du port de Gamma ?',
    hypothesisIds: ['hyp-013', 'hyp-014', 'hyp-015'],
    analystId: 'Analyste Maritime',
    createdAt: '2026-09-15T07:00:00Z',
    updatedAt: '2026-09-15T09:30:00Z',
    isDemo: true,
    provenance: 'SCENARIO_DEMO'
  }
];

export const DEMO_HYPOTHESES_LOT30: OsintHypothesis[] = [
  // Group 1
  {
    id: 'hyp-001',
    title: 'Infiltration de groupes non étatiques',
    description: 'Des éléments armés non étatiques exploitent la porosité de la frontière pour mener des attaques ciblées.',
    statement: 'Les incidents sont le fait de GANE (Groupes Armés Non Étatiques) cherchant à déstabiliser la région.',
    status: 'FRAGILE',
    isDemo: true,
    provenance: 'SCENARIO_DEMO',
    createdAt: '2026-09-10T10:05:00Z',
    analystId: 'Analyste Senior OSINT',
    supportScore: 45,
    contradictionScore: 30,
    evidenceCount: 4,
    supportingEvidenceCount: 2,
    contradictingEvidenceCount: 1,
    neutralEvidenceCount: 1,
    unresolvedEvidenceCount: 0,
    sourceCount: 3,
    independentSourceCount: 2,
    gapsCount: 1,
    testCount: 1,
    lastAssessmentAt: '2026-09-14T15:00:00Z'
  },
  {
    id: 'hyp-002',
    title: 'Conflit de contrôle des ressources en eau',
    description: 'La sécheresse récente a exacerbé les tensions pour le contrôle des points d’eau transfrontaliers.',
    statement: 'La raréfaction des ressources en eau est le moteur direct des affrontements observés.',
    status: 'SOUTENUE',
    isDemo: true,
    provenance: 'SCENARIO_DEMO',
    createdAt: '2026-09-10T10:10:00Z',
    analystId: 'Analyste Senior OSINT',
    supportScore: 85,
    contradictionScore: 10,
    evidenceCount: 6,
    supportingEvidenceCount: 5,
    contradictingEvidenceCount: 0,
    neutralEvidenceCount: 1,
    unresolvedEvidenceCount: 0,
    sourceCount: 5,
    independentSourceCount: 4,
    gapsCount: 0,
    testCount: 2,
    lastAssessmentAt: '2026-09-14T15:15:00Z'
  },
  {
    id: 'hyp-003',
    title: 'Opération militaire de représailles non reconnue',
    description: 'Les forces régulières d’un des pays mènent des incursions non officielles.',
    statement: 'Les incidents impliquent des unités régulières agissant de manière dissimulée.',
    status: 'ECARTEE',
    isDemo: true,
    provenance: 'SCENARIO_DEMO',
    createdAt: '2026-09-10T10:15:00Z',
    analystId: 'Analyste Senior OSINT',
    supportScore: 20,
    contradictionScore: 75,
    evidenceCount: 3,
    supportingEvidenceCount: 0,
    contradictingEvidenceCount: 3,
    neutralEvidenceCount: 0,
    unresolvedEvidenceCount: 0,
    sourceCount: 2,
    independentSourceCount: 1,
    gapsCount: 0,
    testCount: 1,
    lastAssessmentAt: '2026-09-14T15:20:00Z'
  },
  
  // Group 2
  {
    id: 'hyp-004',
    title: 'Campagne de manipulation électorale étrangère',
    description: 'Une puissance étrangère cherche à influencer les prochaines élections régionales.',
    statement: 'La campagne vise à manipuler le processus électoral à venir.',
    status: 'EN_EVALUATION',
    isDemo: true,
    provenance: 'SCENARIO_DEMO',
    createdAt: '2026-09-12T08:05:00Z',
    analystId: 'Analyste Cyber',
    supportScore: 50,
    contradictionScore: 0,
    evidenceCount: 2,
    supportingEvidenceCount: 2,
    contradictingEvidenceCount: 0,
    neutralEvidenceCount: 0,
    unresolvedEvidenceCount: 0,
    sourceCount: 2,
    independentSourceCount: 2,
    gapsCount: 2
  },
  {
    id: 'hyp-005',
    title: 'Action coordonnée de l’opposition locale',
    description: 'Des acteurs politiques locaux orchestrent une campagne de discrédit.',
    statement: 'L’origine de la campagne est purement interne.',
    status: 'PROPOSEE',
    isDemo: true,
    provenance: 'SCENARIO_DEMO',
    createdAt: '2026-09-12T08:10:00Z',
    analystId: 'Analyste Cyber',
    supportScore: 0,
    contradictionScore: 0,
    evidenceCount: 0,
    supportingEvidenceCount: 0,
    contradictingEvidenceCount: 0,
    neutralEvidenceCount: 0,
    unresolvedEvidenceCount: 0,
    sourceCount: 0,
    independentSourceCount: 0,
    gapsCount: 1
  },
  {
    id: 'hyp-006',
    title: 'Opportunisme de fermes à clics commerciales',
    description: 'Des acteurs motivés financièrement surfent sur les tendances politiques.',
    statement: 'La motivation est financière et non idéologique.',
    status: 'CONTESTEE',
    isDemo: true,
    provenance: 'SCENARIO_DEMO',
    createdAt: '2026-09-12T08:15:00Z',
    analystId: 'Analyste Cyber',
    supportScore: 10,
    contradictionScore: 60,
    evidenceCount: 3,
    supportingEvidenceCount: 0,
    contradictingEvidenceCount: 2,
    neutralEvidenceCount: 1,
    unresolvedEvidenceCount: 0,
    sourceCount: 2,
    independentSourceCount: 1,
    gapsCount: 0
  },
  
  // Group 3
  { id: 'hyp-007', title: 'Impact direct des sanctions économiques internationales', description: '...', statement: '...', status: 'FRAGILE', isDemo: true, provenance: 'SCENARIO_DEMO', analystId: 'Analyste Économique' },
  { id: 'hyp-008', title: 'Blocage logistique dû aux intempéries extrêmes', description: '...', statement: '...', status: 'SOUTENUE', isDemo: true, provenance: 'SCENARIO_DEMO', analystId: 'Analyste Économique' },
  { id: 'hyp-009', title: 'Spéculation massive des grossistes locaux', description: '...', statement: '...', status: 'PROPOSEE', isDemo: true, provenance: 'SCENARIO_DEMO', analystId: 'Analyste Économique' },
  
  // Group 4
  { id: 'hyp-010', title: 'Cyberattaque d’origine étatique', description: '...', statement: '...', status: 'EN_EVALUATION', isDemo: true, provenance: 'SCENARIO_DEMO', analystId: 'Analyste Infra' },
  { id: 'hyp-011', title: 'Sabotage physique par un groupe rebelle', description: '...', statement: '...', status: 'EN_EVALUATION', isDemo: true, provenance: 'SCENARIO_DEMO', analystId: 'Analyste Infra' },
  { id: 'hyp-012', title: 'Défaillance technique critique non intentionnelle', description: '...', statement: '...', status: 'ECARTEE', isDemo: true, provenance: 'SCENARIO_DEMO', analystId: 'Analyste Infra' },

  // Group 5
  { id: 'hyp-013', title: 'Exercice militaire naval inopiné', description: '...', statement: '...', status: 'SOUTENUE', isDemo: true, provenance: 'SCENARIO_DEMO', analystId: 'Analyste Maritime' },
  { id: 'hyp-014', title: 'Opération de contrebande à grande échelle', description: '...', statement: '...', status: 'CONTESTEE', isDemo: true, provenance: 'SCENARIO_DEMO', analystId: 'Analyste Maritime' },
  { id: 'hyp-015', title: 'Surveillance de navires de pêche illégale', description: '...', statement: '...', status: 'INSUFFISANTE', isDemo: true, provenance: 'SCENARIO_DEMO', analystId: 'Analyste Maritime' }
];

export const DEMO_HYPOTHESIS_EVIDENCE: OsintHypothesisEvidence[] = [
  {
    id: 'hev-001', hypothesisId: 'hyp-001', evidenceId: 'evid-001', entityType: 'EVIDENCE', stance: 'SUPPORTS', analystId: 'Analyste Senior OSINT', createdAt: '2026-09-10T11:00:00Z', isDemo: true, provenance: 'SCENARIO_DEMO'
  },
  {
    id: 'hev-002', hypothesisId: 'hyp-001', evidenceId: 'alert-002', entityType: 'ALERT', stance: 'SUPPORTS', analystId: 'Analyste Senior OSINT', createdAt: '2026-09-11T11:00:00Z', isDemo: true, provenance: 'SCENARIO_DEMO'
  },
  {
    id: 'hev-003', hypothesisId: 'hyp-001', evidenceId: 'event-005', entityType: 'EVENT', stance: 'CONTRADICTS', justification: 'Le groupe a nié l’attaque via ses canaux officiels.', analystId: 'Analyste Senior OSINT', createdAt: '2026-09-12T11:00:00Z', isDemo: true, provenance: 'SCENARIO_DEMO'
  },
  {
    id: 'hev-004', hypothesisId: 'hyp-002', evidenceId: 'evid-008', entityType: 'EVIDENCE', stance: 'SUPPORTS', analystId: 'Analyste Senior OSINT', createdAt: '2026-09-10T12:00:00Z', isDemo: true, provenance: 'SCENARIO_DEMO'
  },
  {
    id: 'hev-005', hypothesisId: 'hyp-002', evidenceId: 'evid-009', entityType: 'EVIDENCE', stance: 'SUPPORTS', analystId: 'Analyste Senior OSINT', createdAt: '2026-09-10T12:30:00Z', isDemo: true, provenance: 'SCENARIO_DEMO'
  }
];

export const DEMO_HYPOTHESIS_CRITERIA: OsintHypothesisCriterion[] = [
  { id: 'crit-01', code: 'FACTS', name: 'COHÉRENCE AVEC LES FAITS', description: 'L’hypothèse est-elle cohérente avec les faits incontestables ?', weight: 20 },
  { id: 'crit-02', code: 'EVIDENCE_QUALITY', name: 'QUALITÉ DES ÉLÉMENTS DE PREUVE', description: 'Fiabilité et pertinence des preuves soutenant l’hypothèse.', weight: 15 },
  { id: 'crit-03', code: 'SOURCE_INDEPENDENCE', name: 'INDÉPENDANCE DES SOURCES', description: 'Les sources soutenant l’hypothèse sont-elles indépendantes ?', weight: 15 },
  { id: 'crit-04', code: 'SOURCE_CONVERGENCE', name: 'CONVERGENCE DES SOURCES', description: 'Plusieurs sources indépendantes pointent-elles vers cette hypothèse ?', weight: 10 },
  { id: 'crit-05', code: 'CONTRADICTIONS', name: 'CONTRADICTIONS', description: 'Absence de contradictions fatales.', weight: 15 },
  { id: 'crit-06', code: 'CHRONOLOGY', name: 'CHRONOLOGIE', description: 'Respect de la logique temporelle.', weight: 5 },
  { id: 'crit-07', code: 'GEOGRAPHY', name: 'COHÉRENCE GÉOGRAPHIQUE', description: 'Faisabilité spatiale.', weight: 5 },
  { id: 'crit-08', code: 'ACTORS', name: 'COHÉRENCE AVEC LES ACTEURS', description: 'Moyens, motifs et opportunités des acteurs.', weight: 10 },
  { id: 'crit-09', code: 'GAPS', name: 'INFORMATIONS MANQUANTES', description: 'Faible impact des lacunes sur la validité.', weight: 5 }
];

export const DEMO_HYPOTHESIS_ASSESSMENTS: OsintHypothesisAssessment[] = [
  { id: 'has-001', hypothesisId: 'hyp-002', criterionId: 'crit-01', value: 'FORTEMENT FAVORABLE', justification: 'L’assèchement du puits principal correspond exactement au début des affrontements.', analystId: 'Analyste Senior OSINT', assessedAt: '2026-09-13T10:00:00Z', isDemo: true, provenance: 'SCENARIO_DEMO' },
  { id: 'has-002', hypothesisId: 'hyp-002', criterionId: 'crit-02', value: 'FAVORABLE', justification: 'Imagerie satellite confirmée par des rapports d’ONG locales.', analystId: 'Analyste Senior OSINT', assessedAt: '2026-09-13T10:05:00Z', isDemo: true, provenance: 'SCENARIO_DEMO' },
  { id: 'has-003', hypothesisId: 'hyp-002', criterionId: 'crit-05', value: 'FAVORABLE', justification: 'Aucune contradiction majeure relevée à ce jour.', analystId: 'Analyste Senior OSINT', assessedAt: '2026-09-13T10:10:00Z', isDemo: true, provenance: 'SCENARIO_DEMO' }
];

export const DEMO_HYPOTHESIS_TESTS: OsintHypothesisTest[] = [
  {
    id: 'ht-001', hypothesisId: 'hyp-002', question: 'Si c’est un conflit pour l’eau, observe-t-on une corrélation spatiale entre les incidents et les points d’eau asséchés ?', expectedObservation: 'Oui, forte concentration des incidents autour des puits asséchés.', alternativeObservation: 'Incidents répartis uniformément le long de la frontière indépendamment de l’eau.', result: 'Concentration confirmée à 85% autour des points d’eau asséchés.', status: 'RESULTAT_FAVORABLE', analystId: 'Analyste Senior OSINT', date: '2026-09-14T09:00:00Z', isDemo: true, provenance: 'SCENARIO_DEMO'
  }
];

export const DEMO_HYPOTHESIS_DISCRIMINANTS: OsintHypothesisDiscriminant[] = [
  {
    id: 'hdis-001', description: 'Présence de douilles de calibre OTAN (indiquant possiblement un groupe structuré ou armée) vs fusils de chasse artisanaux (conflit inter-communautaire).', hypothesisIds: ['hyp-001', 'hyp-002', 'hyp-003'], expectedValue: 'Débris balistiques sur site.', potentialSource: 'Rapport gendarmerie locale', status: 'A_RECHERCHER', analystId: 'Analyste Senior OSINT', date: '2026-09-15T08:00:00Z', isDemo: true, provenance: 'SCENARIO_DEMO'
  }
];

export const DEMO_HYPOTHESIS_AUDIT: OsintHypothesisAudit[] = [
  { id: 'haud-001', timestamp: '2026-09-10T10:05:00Z', analystId: 'Analyste Senior OSINT', action: 'HYPOTHESIS_CREATED', entityId: 'hyp-001', reason: 'Création de l’hypothèse initiale', isDemo: true, provenance: 'SCENARIO_DEMO' },
  { id: 'haud-002', timestamp: '2026-09-14T15:15:00Z', analystId: 'Analyste Senior OSINT', action: 'HYPOTHESIS_STATUS_CHANGED', entityId: 'hyp-002', before: 'EN_EVALUATION', after: 'SOUTENUE', reason: 'Confirmation par l’imagerie satellite', isDemo: true, provenance: 'SCENARIO_DEMO' }
];
