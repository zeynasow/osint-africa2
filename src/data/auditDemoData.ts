/**
 * OSINT AFRICA - DONNÉES DE DÉMONSTRATION DÉDIÉES AU LOT 20
 * TOUTES CES DONNÉES SONT STRICTEMENT FICTIVES (isDemo: true)
 * MENTION OBLIGATOIRE : DONNÉES DE DÉMONSTRATION
 */

import { OsintProvenance } from '../types';

export const LOT20_DEMO_NOTICE = "DONNÉES DE DÉMONSTRATION — Conçues exclusivement pour le calibrage méthodologique, l'audit documentaire et le test de traçabilité OSINT.";

// 1. Deux provenances complètes et deux provenances partielles
export const LOT20_DEMO_PROVENANCES: OsintProvenance[] = [
  {
    id: 'prov-demo-001',
    objectType: 'event',
    objectId: 'evt-001',
    sourceId: 'src-001',
    sourceName: 'Observatoire Sahélien Démo / Sentinel-2',
    sourceUrl: 'https://demo-sources.osint-africa.org/sentinel-gao',
    sourceType: 'IMINT / Imagerie civile optique & thermique',
    sourceCountry: 'ML',
    sourceLanguage: 'Français',
    publicationDate: '2026-09-10',
    observationDate: '2026-09-10T09:45:00Z',
    ingestionDate: '2026-09-10T10:15:00Z',
    lastModified: '2026-09-10T11:00:00Z',
    analystLabel: 'Pôle Sahel - Imagerie',
    transformationType: 'Acquisition capteur + Corrélation thermique géoréférencée',
    transformationDescription: 'Détection d’anomalie thermique nocturne confirmée par imagerie multibande multispectrale Sentinel-2.',
    originalReference: 'ESA-S2-20260910-GAO-PK42',
    confidence: 'Élevé',
    reliability: 'B',
    certainty: '2 (Probable)',
    completeness: 100,
    isDemo: true,
    createdAt: '2026-09-10T10:15:00Z',
    updatedAt: '2026-09-10T11:00:00Z',
  },
  {
    id: 'prov-demo-002',
    objectType: 'report',
    objectId: 'prod-001',
    sourceId: 's10',
    sourceName: 'Direction de la Documentation OSINT - Registre Opérationnel',
    sourceUrl: 'https://archive.osint-africa.internal/dossiers/rn16-gao-2026',
    sourceType: 'Rapport d’analyse multi-sources consolidé',
    sourceCountry: 'ML',
    sourceLanguage: 'Français',
    publicationDate: '2026-09-11',
    observationDate: '2026-09-10T08:30:00Z',
    ingestionDate: '2026-09-11T14:45:00Z',
    lastModified: '2026-09-11T15:00:00Z',
    analystLabel: 'Chef de Pôle Sahel',
    transformationType: 'Production colligée, évaluée et validée',
    transformationDescription: 'Rapport consolidé intégrant 3 sources concordantes, 2 événements temporels et analyse d’hypothèses.',
    originalReference: 'OSINT-AFR-RAP-2026-0001',
    parentObjectId: 'evt-001',
    confidence: 'Très élevé',
    reliability: 'A',
    certainty: '1 (Confirmé)',
    completeness: 95,
    isDemo: true,
    createdAt: '2026-09-11T14:45:00Z',
    updatedAt: '2026-09-11T15:00:00Z',
  },
  {
    id: 'prov-demo-003',
    objectType: 'evidence',
    objectId: 'ev-003',
    sourceId: 'demo-011',
    sourceName: 'Compte anonyme réseau social (X/Twitter)',
    sourceUrl: 'https://x.com/demo_sahel_alert/status/987654321',
    sourceType: 'SOCMINT / Veille réseaux sociaux',
    sourceCountry: 'ML',
    sourceLanguage: 'Français',
    publicationDate: '2026-09-10',
    observationDate: undefined, // Date d'observation manquante
    ingestionDate: '2026-09-10T12:00:00Z',
    lastModified: '2026-09-10T12:00:00Z',
    analystLabel: 'Analyste Veille Réseaux',
    transformationType: 'Collecte brute sans corroboration',
    transformationDescription: 'Signalement isolé d’un prétendu convoi, sans identification de la source primaire ni métadonnées EXIF.',
    originalReference: undefined, // Référence originale manquante
    confidence: 'Faible',
    reliability: 'E',
    certainty: '5 (Douteux)',
    completeness: 45,
    isDemo: true,
    createdAt: '2026-09-10T12:00:00Z',
    updatedAt: '2026-09-10T12:00:00Z',
  },
  {
    id: 'prov-demo-004',
    objectType: 'report',
    objectId: 'prod-002',
    sourceId: undefined, // Source manquante
    sourceName: undefined,
    sourceUrl: undefined,
    sourceType: undefined,
    publicationDate: undefined,
    observationDate: undefined,
    ingestionDate: '2026-09-12T09:15:00Z',
    lastModified: '2026-09-13T11:20:00Z',
    analystLabel: 'Analyste Beta',
    transformationType: 'Ébauche en cours de rédaction',
    transformationDescription: 'Projet de synthèse sur les minerais de conflit au Kivu sans sources primaires rattachées ni preuves vérifiées.',
    originalReference: 'DRAFT-KIVU-COLTAN',
    parentObjectId: undefined,
    confidence: 'Non évalué',
    reliability: 'F',
    certainty: '6 (Impossible à juger)',
    completeness: 25,
    isDemo: true,
    createdAt: '2026-09-12T09:15:00Z',
    updatedAt: '2026-09-13T11:20:00Z',
  },
];

// 2. Événement sans source (dédié test lacune)
export interface AuditDemoEventNoSource {
  id: string;
  title: string;
  date: string;
  country: string;
  summary: string;
  sourceIds: string[];
  isDemo: boolean;
}

export const LOT20_DEMO_EVENT_NO_SOURCE: AuditDemoEventNoSource = {
  id: 'evt-demo-no-src',
  title: 'Mouvement de convoi non sourcé secteur Tombouctou [DONNÉES DE DÉMONSTRATION]',
  date: '2026-09-12',
  country: 'Mali',
  summary: 'Signalement informel relayé verbalement : aucune source primaire, aucun identifiant, aucune URL d’origine documentée.',
  sourceIds: [],
  isDemo: true,
};

// 3. Information avec source unique
export interface AuditDemoSingleSourceItem {
  id: string;
  title: string;
  sourceId: string;
  sourceName: string;
  sourceType: string;
  date: string;
  observation: string;
  riskNotice: string;
  isDemo: boolean;
}

export const LOT20_DEMO_SINGLE_SOURCE_ITEM: AuditDemoSingleSourceItem = {
  id: 'info-demo-single-src',
  title: 'Fermeture présumée du corridor fluvial de Diré [DONNÉES DE DÉMONSTRATION]',
  sourceId: 'src-demo-004',
  sourceName: 'Réseau Radio Communautaire Locale (Source unique)',
  sourceType: 'Radio locale associative',
  date: '2026-09-11',
  observation: 'Information rapportée par un unique canal communautaire sans confirmation portuaire ni recoupement indépendant.',
  riskNotice: 'Vigilance analytique : l’absence de source secondaire indépendante interdit d’élever cette mention au rang de fait établi.',
  isDemo: true,
};

// 4. Cas de convergence (avec indépendance avérée)
export interface AuditDemoConvergenceItem {
  id: string;
  title: string;
  eventId: string;
  topic: string;
  sourcesCount: number;
  primarySource: {
    name: string;
    nature: string;
    reliability: string;
  };
  secondarySources: {
    name: string;
    nature: string;
    reliability: string;
  }[];
  independenceStatus: 'INDÉPENDANCE AVÉRÉE' | 'INDÉPENDANCE NON ÉTABLIE' | 'POSSIBLEMENT LIÉE';
  analystSummary: string;
  isDemo: boolean;
}

export const LOT20_DEMO_CONVERGENCE_ITEM: AuditDemoConvergenceItem = {
  id: 'cnv-demo-001',
  title: 'Convergence sur l’axe logistique RN16 (Gao-Ansongo) [DONNÉES DE DÉMONSTRATION]',
  eventId: 'evt-001',
  topic: 'Regroupement matériel et ralentissement des flux civils',
  sourcesCount: 3,
  primarySource: {
    name: 'Observatoire Sahélien Démo / Sentinel-2',
    nature: 'Capteur spatial civil direct (IMINT optique & radar)',
    reliability: 'B2',
  },
  secondarySources: [
    {
      name: 'Studio Tamani - Correspondance locale',
      nature: 'Témoignages de conducteurs routiers sur place',
      reliability: 'B2',
    },
    {
      name: 'Réseau d’Alerte Communautaire Ansongo',
      nature: 'Collectif d’usagers civils locaux',
      reliability: 'C2',
    },
  ],
  independenceStatus: 'INDÉPENDANCE AVÉRÉE',
  analystSummary: 'Convergence robuste : un capteur physique orbital et deux chaînes humaines distinctes constatent des faits compatibles sans contradiction matérielle.',
  isDemo: true,
};

// 5. Cas où l'indépendance des sources est inconnue (reprise circulaire)
export const LOT20_DEMO_UNKNOWN_INDEPENDENCE_ITEM: AuditDemoConvergenceItem = {
  id: 'cnv-demo-002',
  title: 'Annonce d’un cessez-le-feu local dans le Liptako [DONNÉES DE DÉMONSTRATION]',
  eventId: 'evt-006',
  topic: 'Dépêches jumelles reprenant le même canal Telegram originel',
  sourcesCount: 2,
  primarySource: {
    name: 'Canal Telegram "Écho du Sahel"',
    nature: 'Canal anonyme d’influence (Source primaire unique)',
    reliability: 'D3',
  },
  secondarySources: [
    {
      name: 'Portail d’actualité régionale Sahel-Direct',
      nature: 'Reprise textuelle intégrale sans enquête autonome',
      reliability: 'D3',
    },
    {
      name: 'Blog de veille géopolitique régionale',
      nature: 'Citation de la seconde source citant la première',
      reliability: 'E4',
    },
  ],
  independenceStatus: 'INDÉPENDANCE NON ÉTABLIE',
  analystSummary: 'CONVERGENCE OBSERVÉE mais INDÉPENDANCE NON ÉTABLIE — Les multiples mentions proviennent d’une seule source primaire répercutée en chambre d’écho. Ne constitue en aucun cas une confirmation indépendante.',
  isDemo: true,
};

// 6. Contradiction avec arbitrage analyste requis
export interface AuditDemoContradictionItem {
  id: string;
  title: string;
  topic: string;
  eventId: string;
  sourceA: {
    name: string;
    statement: string;
    date: string;
    reliability: string;
  };
  sourceB: {
    name: string;
    statement: string;
    date: string;
    reliability: string;
  };
  status: 'ARBITRAGE ANALYSTE REQUIS';
  doctrineRule: string;
  isDemo: boolean;
}

export const LOT20_DEMO_CONTRADICTION_ITEM: AuditDemoContradictionItem = {
  id: 'cot-demo-001',
  title: 'Bilan de l’incident sécuritaire de Diffa [DONNÉES DE DÉMONSTRATION]',
  topic: 'Nombre de pertes et contrôle du poste de contrôle frontalier',
  eventId: 'evt-009',
  sourceA: {
    name: 'Communiqué officiel Ministère de la Défense',
    statement: 'Attaque repoussée avec succès : 2 blessés légers côté loyaliste, 7 assaillants neutralisés, poste sous contrôle complet.',
    date: '2026-09-11',
    reliability: 'B1',
  },
  sourceB: {
    name: 'Presse régionale indépendante Diffa Info',
    statement: 'Bilan lourd : au moins 6 militaires tués, repli d’urgence des défenseurs vers le chef-lieu et poste incendié.',
    date: '2026-09-11',
    reliability: 'C3',
  },
  status: 'ARBITRAGE ANALYSTE REQUIS',
  doctrineRule: 'Règle stricte : Ne jamais arbitrer automatiquement une contradiction factuelle. Conserver les deux versions en parallèle avec leurs codes d’évaluation et consigner les incertitudes jusqu’à vérification par capteur tiers.',
  isDemo: true,
};

// 7. Doublon probable
export interface AuditDemoDuplicateItem {
  id: string;
  primaryTitle: string;
  candidateTitle: string;
  similarityScore: number;
  criteria: {
    canonicalUrl: boolean;
    normalizedTitle: boolean;
    date: boolean;
    source: boolean;
    contentHash: boolean;
    textSimilarity: number;
  };
  classification: 'DOUBLON PROBABLE' | 'UNIQUE' | 'CHEVAUCHEMENT' | 'À EXAMINER';
  suggestedAction: string;
  isDemo: boolean;
}

export const LOT20_DEMO_DUPLICATE_ITEM: AuditDemoDuplicateItem = {
  id: 'dup-demo-001',
  primaryTitle: 'Détection d’activités suspectes sur un axe logistique nord de Gao [DONNÉES DE DÉMONSTRATION]',
  candidateTitle: 'Gao : des usagers de la RN16 signalent des mouvements de pick-ups suspects',
  similarityScore: 89,
  criteria: {
    canonicalUrl: false,
    normalizedTitle: true,
    date: true,
    source: false,
    contentHash: false,
    textSimilarity: 88,
  },
  classification: 'DOUBLON PROBABLE',
  suggestedAction: 'Rapprocher les deux flux comme variantes d’un même événement. Interdiction de supprimer automatiquement l’un des enregistrements.',
  isDemo: true,
};

// 8. Rapport complet et rapport incomplet
export interface AuditDemoReportAudit {
  reportId: string;
  reference: string;
  title: string;
  auditVerdict: 'RAPPORT PRÊT POUR VALIDATION' | 'RAPPORT NÉCESSITANT UNE REVUE';
  completenessScore: number;
  qualityScore: number;
  traceabilityStatus: 'TRAÇABILITÉ COMPLÈTE' | 'TRAÇABILITÉ INCOMPLÈTE';
  sourcesCount: number;
  eventsCount: number;
  evidenceCount: number;
  hypothesesCount: number;
  gapsCount: number;
  unconfirmedCount: number;
  isDemo: boolean;
}

export const LOT20_DEMO_REPORTS_AUDIT: AuditDemoReportAudit[] = [
  {
    reportId: 'prod-001',
    reference: 'RAP-2026-0001',
    title: 'Corridor logistique et sécuritaire RN16 (Gao-Ansongo)',
    auditVerdict: 'RAPPORT PRÊT POUR VALIDATION',
    completenessScore: 92,
    qualityScore: 94,
    traceabilityStatus: 'TRAÇABILITÉ COMPLÈTE',
    sourcesCount: 3,
    eventsCount: 2,
    evidenceCount: 1,
    hypothesesCount: 1,
    gapsCount: 1,
    unconfirmedCount: 1,
    isDemo: true,
  },
  {
    reportId: 'prod-002',
    reference: 'RAP-2026-0002',
    title: 'Traçabilité des flux miniers (Kivu)',
    auditVerdict: 'RAPPORT NÉCESSITANT UNE REVUE',
    completenessScore: 45,
    qualityScore: 35,
    traceabilityStatus: 'TRAÇABILITÉ INCOMPLÈTE',
    sourcesCount: 0,
    eventsCount: 0,
    evidenceCount: 0,
    hypothesesCount: 0,
    gapsCount: 3,
    unconfirmedCount: 2,
    isDemo: true,
  },
];
