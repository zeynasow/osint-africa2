import { OsintIntelligenceReport } from '../types';

export const mockProductionReports: OsintIntelligenceReport[] = [
  {
    id: 'prod-001',
    reference: 'RAP-2026-0001',
    title: 'Corridor logistique et sécuritaire RN16',
    subtitle: 'Évaluation des flux entre Gao et Ansongo',
    reportType: 'Analyse thématique',
    classification: 'DIFFUSION RESTREINTE',
    status: 'VALIDÉ',
    priority: 'Élevée',
    createdAt: '2026-09-10T08:30:00Z',
    updatedAt: '2026-09-11T14:45:00Z',
    validatedAt: '2026-09-11T15:00:00Z',
    author: 'Analyste Alpha',
    reviewer: 'Chef de Pôle Sahel',
    organization: 'OSINT AFRICA',
    area: 'Sahel',
    countryIds: ['ml'],
    regionIds: [],
    actorIds: ['act-01'],
    sourceIds: ['s10', 's11', 's20'],
    eventIds: ['evt-2026-01', 'evt-2026-02'],
    analysisIds: [],
    correlationIds: [],
    weakSignalIds: [],
    fusionCaseIds: ['fus-001'],
    evidenceIds: ['evd-101'],
    folderIds: [],
    alertIds: [],

    executiveSummary: "Une augmentation significative des incidents sécuritaires est observée sur l'axe RN16 entre Gao et Ansongo. Les groupes armés non étatiques consolident leur emprise sur les nœuds logistiques, entravant la circulation civile.",
    context: "La RN16 représente une artère vitale pour l'approvisionnement du nord Mali. Depuis le retrait de la MINUSMA et la réorganisation des FAMA, la zone fait l'objet de contestations territoriales.",
    establishedFacts: [
      "Augmentation de 40% des attaques aux engins explosifs improvisés sur l'axe.",
      "Destruction partielle du pont de Tassiga."
    ],
    reportedInformation: [
      "Installation de postes de contrôle irréguliers près de la forêt de Seyna.",
      "Taxes prélevées sur les véhicules de transport en commun."
    ],
    unconfirmedInformation: [
      "Médiation locale en cours avec des chefs coutumiers pour permettre le passage des vivres."
    ],
    sourceAssessments: [
      {
        sourceId: 's10',
        informationProvided: "Rapport sur les attaques d'infrastructures.",
        concordance: 'Concordant',
        independence: 'Avérée',
        limitations: "Données limitées aux axes majeurs.",
        confidenceLevel: 'Élevé'
      }
    ],
    chronology: [
      {
        id: 'chr-001',
        date: '2026-08-25',
        description: 'Destruction partielle du pont.',
        confidence: 'Très élevé',
        status: 'DATE CERTAINE',
        relationToReport: 'Déclencheur de la crise logistique.'
      }
    ],
    actorsAssessment: [
      {
        actorId: 'act-01',
        role: 'ACTEUR IMPLIQUÉ',
        justificationSourceIds: ['s10']
      }
    ],
    analysis: "La stratégie observée vise l'isolement économique des centres urbains. Les groupes cherchent à démontrer leur capacité de nuisance tout en instaurant une économie de prédation par le racket.",
    hypotheses: [
      {
        id: 'hyp-01',
        analysisId: 'ana-prod-1',
        title: 'H1: Isolement stratégique de Gao',
        description: 'Les attaques visent à étouffer Gao économiquement.',
        supportingEvidenceIds: [],
        opposingEvidenceIds: [],
        confidence: 'MOYENNE',
        evidenceIds: [],
        status: 'Ouverte',
        analystComment: '',
        isDemo: true
      }
    ] as any,
    implications: "Pénurie probable de denrées de première nécessité à Gao. Risque d'inflation rapide.",
    informationGaps: [
      {
        id: 'gap-01',
        description: 'Implication réelle des notables locaux dans les négociations de passage.',
        type: 'Informations manquantes',
        priority: 'Normale'
      }
    ],
    analystQuestions: [
      {
        id: 'q-01',
        question: 'Qui contrôle réellement les postes de péage informels au sud d\'Ansongo ?',
        status: 'Ouverte'
      }
    ],
    assessment: "La situation s'enlise vers un blocus larvé. Les acteurs locaux s'adaptent, mais le coût sécuritaire pèse sur les civils.",
    conclusion: "Tant qu'une force de sécurisation permanente n'est pas déployée, l'axe restera hautement volatil.",
    
    confidenceLevel: 'Modéré',
    isDemo: true,
    version: 2,
    versionHistory: [
      {
        id: 'vh-001',
        versionNumber: 1,
        date: '2026-09-10T10:00:00Z',
        author: 'Analyste Alpha',
        status: 'BROUILLON',
        changes: 'Création initiale'
      },
      {
        id: 'vh-002',
        versionNumber: 2,
        date: '2026-09-11T14:45:00Z',
        author: 'Analyste Alpha',
        status: 'EN REVUE',
        changes: 'Ajout de l\'évaluation des sources'
      }
    ],
    validationHistory: [
      {
        id: 'val-001',
        date: '2026-09-11T15:00:00Z',
        author: 'Chef de Pôle Sahel',
        action: 'Validation du rapport',
        oldStatus: 'EN REVUE',
        newStatus: 'VALIDÉ'
      }
    ],
    traceabilityStatus: 'TRAÇABILITÉ COMPLÈTE',
    completenessScore: 92,
    validationChecklist: {
      sourcesIdentified: true,
      sourcesEvaluated: true,
      infoDistinguished: true,
      evidencePresent: true,
      contradictionsExamined: true,
      hypothesesDocumented: true,
      gapsIdentified: true,
      analysisSeparated: true,
      conclusionJustified: true,
      traceabilityVerified: true
    }
  },
  {
    id: 'prod-002',
    reference: 'RAP-2026-0002',
    title: 'Traçabilité des flux miniers (Kivu)',
    subtitle: 'Dynamiques transfrontalières récentes',
    reportType: 'Synthèse de renseignement',
    classification: 'NON CLASSIFIÉ',
    status: 'BROUILLON',
    priority: 'Normale',
    createdAt: '2026-09-12T09:15:00Z',
    updatedAt: '2026-09-13T11:20:00Z',
    author: 'Analyste Beta',
    area: 'Grands Lacs',
    countryIds: ['cd', 'rw'],
    regionIds: [],
    actorIds: [],
    sourceIds: [],
    eventIds: [],
    analysisIds: [],
    correlationIds: [],
    weakSignalIds: [],
    fusionCaseIds: ['fus-002'],
    evidenceIds: [],
    folderIds: [],
    alertIds: [],
    executiveSummary: "De nouvelles routes de contrebande semblent émerger au Nord-Kivu pour le coltan.",
    context: "La réglementation sur les minerais de conflit pousse les réseaux à innover.",
    establishedFacts: [],
    reportedInformation: ["Mouvements nocturnes suspects observés près de Rubaya."],
    unconfirmedInformation: [],
    sourceAssessments: [],
    chronology: [],
    actorsAssessment: [],
    analysis: "Les itinéraires traditionnels étant surveillés, le transit se déplace.",
    hypotheses: [],
    implications: "",
    informationGaps: [],
    analystQuestions: [],
    assessment: "Le niveau d'organisation suggère une collusion à haut niveau.",
    conclusion: "L'analyse doit se poursuivre en attendant de nouvelles données satellitaires.",
    confidenceLevel: 'Faible',
    isDemo: true,
    version: 1,
    versionHistory: [],
    validationHistory: [],
    traceabilityStatus: 'TRAÇABILITÉ INCOMPLÈTE',
    completenessScore: 45
  },
  {
    id: 'prod-003',
    reference: 'RAP-2026-0003',
    title: 'Anomalies AIS - Golfe de Guinée',
    subtitle: 'Évolution de la piraterie',
    reportType: 'Note de veille',
    classification: 'DIFFUSION RESTREINTE',
    status: 'EN REVUE',
    priority: 'Élevée',
    createdAt: '2026-09-13T16:00:00Z',
    updatedAt: '2026-09-13T16:45:00Z',
    author: 'Analyste Gamma',
    area: 'Golfe de Guinée',
    countryIds: ['ng', 'bj'],
    regionIds: [],
    actorIds: [],
    sourceIds: [],
    eventIds: [],
    analysisIds: [],
    correlationIds: [],
    weakSignalIds: [],
    fusionCaseIds: ['fus-003'],
    evidenceIds: [],
    folderIds: [],
    alertIds: [],
    executiveSummary: "Multiplication des coupures AIS par les chalutiers industriels.",
    context: "La surpêche et les actes de piraterie se croisent dans la région.",
    establishedFacts: ["15 navires ont désactivé leur AIS plus de 12h la semaine dernière."],
    reportedInformation: [],
    unconfirmedInformation: [],
    sourceAssessments: [],
    chronology: [],
    actorsAssessment: [],
    analysis: "",
    hypotheses: [],
    implications: "",
    informationGaps: [],
    analystQuestions: [],
    assessment: "",
    conclusion: "",
    confidenceLevel: 'Non évalué',
    isDemo: true,
    version: 1,
    versionHistory: [],
    validationHistory: [],
    traceabilityStatus: 'TRAÇABILITÉ INCOMPLÈTE',
    completenessScore: 30
  }
];
