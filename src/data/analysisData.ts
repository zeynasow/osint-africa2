import { OsintAnalysis, OsintEvidence, OsintHypothesis } from '../types';

export const DEMO_EVIDENCE: OsintEvidence[] = [
  {
    id: 'ev-001',
    analysisId: 'ana-001',
    title: 'Image Satellite Sentinel-2 - Anomalie thermique',
    description: 'Anomalie thermique détectée par Sentinel-2 correspondant à des véhicules en stationnement prolongé, non répertoriés dans les convois officiels.',
    type: 'IMINT',
    sourceId: 'demo-001',
    verificationStatus: 'Vérifié',
    dateAcquired: '2026-09-10',
    isDemo: true,
  },
  {
    id: 'ev-002',
    analysisId: 'ana-001',
    title: 'Trafic Radioamateur VHF (Interception de routine)',
    description: 'Signalement local d\'un regroupement inhabituel à l\'extérieur du village. Communications brèves et codées en Tamasheq et Arabe.',
    type: 'SIGINT',
    sourceId: 'demo-002',
    verificationStatus: 'Plausible',
    dateAcquired: '2026-09-09',
    isDemo: true,
  },
  {
    id: 'ev-003',
    analysisId: 'ana-001',
    title: 'Rumeur locale Twitter/X',
    description: 'Comptes anonymes signalant "l\'arrivée de forces" près de Gao, sans précision sur l\'appartenance.',
    type: 'SOCMINT',
    sourceId: 'demo-011', // Some demo source
    verificationStatus: 'Non Confirmé',
    dateAcquired: '2026-09-10',
    isDemo: true,
  }
];

export const DEMO_HYPOTHESES: OsintHypothesis[] = [
  {
    id: 'hyp-001',
    analysisId: 'ana-001',
    title: 'Préparation d\'une embuscade sur la RN16',
    description: 'Le regroupement de véhicules (IMINT) et le silence radio partiel (SIGINT) indiquent une possible préparation d\'attaque contre le prochain convoi logistique militaire.',
    status: 'Privilégiée',
    confidence: 'ÉLEVÉE',
    supportingEvidenceIds: ['ev-001', 'ev-002'],
    opposingEvidenceIds: [],
    isDemo: true,
  },
  {
    id: 'hyp-002',
    analysisId: 'ana-001',
    title: 'Rassemblement de contrebandiers',
    description: 'Il pourrait s\'agir d\'un point de rendez-vous pour des trafiquants de carburant ou d\'armes, fréquent dans cette zone (PK 42).',
    status: 'Alternative',
    confidence: 'MOYENNE',
    supportingEvidenceIds: ['ev-003'],
    opposingEvidenceIds: ['ev-001'],
    isDemo: true,
  }
];

export const DEMO_ANALYSES: OsintAnalysis[] = [
  {
    id: 'ana-001',
    eventId: 'evt-001',
    title: 'Regroupement Tactique RN16 (Gao) - Évaluation de la Menace',
    objective: 'Déterminer la nature et l\'objectif du regroupement de véhicules armés observé le long de la RN16 le 10 Septembre.',
    summary: 'Suite aux remontées IMINT (Sentinel-2) et SIGINT (radioamateur) le 10 Septembre, un regroupement suspect de 6 à 8 pick-ups est identifié sur l\'axe logistique nord de Gao.',
    establishedFacts: [
      'Présence physique d\'au moins 6 véhicules type pick-up confirmée par anomalie thermique.',
      'Emplacement stratégique au PK 42, zone d\'embuscade connue.',
      'Absence de patrouille officielle programmée dans ce secteur selon les sources ouvertes.'
    ],
    reportedInformation: [
      'Trafic radio atypique détecté la veille (9 Sept).',
      'Rumeurs locales faisant état de l\'arrivée de combattants.'
    ],
    unconfirmedInformation: [
      'Appartenance exacte du groupe armé (JNIM vs ISGS).',
      'Présence potentielle d\'armement lourd (type 12.7mm ou 14.5mm) sur les véhicules.'
    ],
    contradictoryInformation: [
      {
        sourceAId: 'demo-011',
        sourceBId: 'demo-002',
        infoA: 'Le groupe appartiendrait à l\'ISGS (selon réseaux sociaux).',
        infoB: 'Les dialectes entendus à la radio (Tamasheq) pointent plutôt vers une Katiba du JNIM.',
      }
    ],
    confidence: 'ÉLEVÉE',
    confidenceReason: 'Corrélation solide entre l\'imagerie spatiale (IMINT) et le renseignement d\'origine électromagnétique local (SIGINT). L\'incertitude demeure uniquement sur l\'appartenance exacte du groupe.',
    hypothesisIds: ['hyp-001', 'hyp-002'],
    evidenceIds: ['ev-001', 'ev-002', 'ev-003'],
    relatedEventIds: ['evt-004'], // some other event
    sourceIds: ['demo-001', 'demo-002', 'demo-011'],
    relatedActorIds: ['act-001', 'act-002'], // JNIM / ISGS
    conclusion: 'Le regroupement observé constitue une menace crédible et imminente pour tout convoi empruntant la RN16 dans les prochaines 48h. La probabilité d\'une embuscade (Hypothèse 1) est jugée élevée.',
    analyticalAssessment: 'L\'analyse de la zone d\'intérêt (NAI) au PK 42 indique un point de rassemblement classique. L\'absence de mouvement depuis 24h suggère une posture d\'attente, caractéristique des embuscades complexes (Complex Ambush). La divergence sur l\'appartenance du groupe est secondaire quant à la létalité de la menace immédiate.',
    implications: [
      'Risque critique pour les convois logistiques civils et militaires sur la RN16.',
      'Possible perturbation des chaînes d\'approvisionnement de Gao.',
      'Risque collatéral pour les populations locales d\'Ansongo.'
    ],
    questions: [
      {
        id: 'q-001',
        question: 'Quelle est la véritable appartenance de ce groupe armé ?',
        status: 'En cours',
      },
      {
        id: 'q-002',
        question: 'Le groupe dispose-t-il d\'appuis de tirs indirects ?',
        status: 'Ouverte',
      }
    ],
    status: 'Validée',
    isDemo: true,
  },
  {
    id: 'ana-002',
    eventId: 'evt-002',
    title: 'Analyse d\'une Campagne de Désinformation - Scénario Électoral',
    objective: 'Évaluer la portée, les acteurs et l\'impact de la campagne inauthentique coordonnée sur X/Twitter concernant le processus électoral.',
    summary: 'Une prolifération soudaine de comptes inauthentiques diffuse un narratif accusant la commission électorale de préparer une fraude informatique.',
    establishedFacts: [
      'Création de plus de 400 comptes X/Twitter dans les dernières 72h.',
      'Utilisation coordonnée des mêmes hashtags (#Fraude2026, #ElectionsVolees).',
      'Partage d\'images manipulées par intelligence artificielle (Deepfakes identifiés).'
    ],
    reportedInformation: [
      'Financement potentiel par des acteurs étatiques étrangers.',
      'Amplification par certains influenceurs politiques locaux.'
    ],
    unconfirmedInformation: [
      'Implication directe d\'un candidat de l\'opposition.',
      'Existence d\'un réseau de bots similaire sur Facebook ou TikTok.'
    ],
    contradictoryInformation: [],
    confidence: 'MOYENNE',
    confidenceReason: 'Si la nature artificielle de la campagne (CIB) est prouvée, l\'attribution à un commanditaire final reste incertaine sans données de renseignement d\'origine cyber (CYBINT) plus poussées.',
    hypothesisIds: [],
    evidenceIds: [],
    relatedEventIds: [],
    sourceIds: ['demo-008'], // OSD
    relatedActorIds: [],
    conclusion: 'Une opération d\'influence (IO) modérée est en cours, visant à saper la confiance dans les institutions électorales. L\'impact reste pour l\'instant confiné aux sphères militantes en ligne.',
    analyticalAssessment: 'L\'utilisation de deepfakes rudimentaires et de bots non sophistiqués indique une campagne hâtive, potentiellement lancée par un acteur proxy. La viralité organique est faible.',
    implications: [
      'Baisse de la confiance du public dans le processus démocratique.',
      'Risque de tensions post-électorales si le narratif s\'implante.'
    ],
    questions: [
      {
        id: 'q-003',
        question: 'Qui finance cette ferme de trolls ?',
        status: 'Ouverte',
      }
    ],
    status: 'Brouillon',
    isDemo: true,
  }
];
