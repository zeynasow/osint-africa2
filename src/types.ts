/**
 * OSINT AFRICA - Types et Modèles de Données
 * Architecture modulaire découplée de l'interface
 */

export type SeverityLevel = 'CRITIQUE' | 'ELEVE' | 'MODERE' | 'NORMAL' | 'INFO';

export type EventStatus = 'Nouveau' | 'En analyse' | 'Confirmé' | 'Non confirmé' | 'Archivé' | 'En cours de vérification' | 'Contredit' | 'Information analysée';

export const ALL_EVENT_STATUSES: EventStatus[] = [
  'Nouveau',
  'En analyse',
  'Confirmé',
  'Non confirmé',
  'Archivé',
];

export type Category =
  | 'Sécurité'
  | 'Défense'
  | 'Politique'
  | 'Groupes armés'
  | 'Criminalité'
  | 'Frontières'
  | 'Migration'
  | 'Maritime'
  | 'Économie'
  | 'Ressources naturelles'
  | 'Humanitaire'
  | 'Environnement'
  | 'Information et désinformation'
  | 'Diplomatie'
  | 'Transport'
  | 'Technologie'
  | 'Élections'
  | 'Santé publique'
  | 'Infrastructure';

export const ALL_CATEGORIES: Category[] = [
  'Sécurité',
  'Défense',
  'Politique',
  'Groupes armés',
  'Criminalité',
  'Frontières',
  'Migration',
  'Maritime',
  'Économie',
  'Ressources naturelles',
  'Humanitaire',
  'Environnement',
  'Information et désinformation',
  'Diplomatie',
  'Transport',
  'Technologie',
  'Élections',
  'Santé publique',
  'Infrastructure'
];

export type AfricanRegion = 
  | 'Afrique de l’Ouest' 
  | 'Afrique Centrale' 
  | 'Afrique du Nord' 
  | 'Afrique de l’Est' 
  | 'Afrique Australe';

export type CanonicalSourceType =
  | 'Institutionnelle'
  | 'Gouvernementale'
  | 'Média'
  | 'Organisation internationale'
  | 'ONG'
  | 'Think tank'
  | 'RSS'
  | 'Source spécialisée';

export type SourceCategoryType =
  | CanonicalSourceType
  | 'Média / Agence de presse'
  | 'Données satellitaires / Observation de la Terre'
  | 'Sources institutionnelles'
  | 'Sources gouvernementales'
  | 'Médias'
  | 'Organisations internationales'
  | 'Think tanks'
  | 'Sources spécialisées'
  | string;

export type SourceType = SourceCategoryType;

export const ALL_SOURCE_TYPES: string[] = [
  'Institutionnelle',
  'Gouvernementale',
  'Média',
  'Média / Agence de presse',
  'Organisation internationale',
  'ONG',
  'Think tank',
  'RSS',
  'Source spécialisée',
  'Données satellitaires / Observation de la Terre',
];

export type SourceOperationalStatus =
  | 'Démonstration'
  | 'Réelle / non connectée'
  | 'Réelle / connectée'
  | 'Inactive'
  | 'Actif'
  | 'En veille'
  | 'Vérifié'
  | 'Inactif'
  | 'Erreur flux';

export interface OsintSourceItem {
  id: string;
  name: string;
  country: string;
  countryName?: string;
  countryId?: string;
  region: string;
  type: SourceCategoryType;
  url: string;
  rssUrl?: string;
  apiEndpoint?: string;
  sourceUrl?: string;
  language: string;
  description: string;
  reliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'Non évaluée' | 'À évaluer';
  reliabilityScore?: 'A' | 'B' | 'C' | 'D' | 'E' | 'Non évaluée' | 'À évaluer';
  status: SourceOperationalStatus;
  isReal: boolean;
  isConnected: boolean;
  lastChecked: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  isDemo?: boolean;
  lastUpdated?: string;
}

export type ActorType =
  | 'Personne publique'
  | 'Organisation'
  | 'Institution'
  | 'Entreprise'
  | 'Groupe armé'
  | 'Organisation internationale';

export const ALL_ACTOR_TYPES: ActorType[] = [
  'Personne publique',
  'Organisation',
  'Institution',
  'Entreprise',
  'Groupe armé',
  'Organisation internationale',
];

export interface OsintActor {
  id: string;
  name: string;
  type: ActorType;
  country: string;
  countryId: string;
  description: string;
  associatedEventIds: string[];
  associatedSources: string[];
  status: 'Sous surveillance' | 'Actif' | 'En observation' | 'Régulier';
  isDemo: true;
}

export interface IntelligenceNote {
  id: string;
  title: string;
  object: string;
  recipient?: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  classification: 'DIFFUSION RESTREINTE' | 'USAGE INTERNE' | 'NON CLASSIFIÉ';
  targetCountryIds: string[];
  synthese: string;
  faitsPrincipaux: string[];
  chronologie: { date: string; description: string }[];
  acteurs: string[];
  localisation: string;
  evolution: string;
  indicateursSurveillance: string[];
  appreciationAnalytique: string;
  conclusion: string;
  sources: string[];
  isDemo: true;
}

export interface Country {
  id: string;
  name: string;
  code: string; // ISO 2 code (ex: SN, ML)
  capital: string;
  region: AfricanRegion;
  isPriority: boolean;
  flag: string; // Emoji flag (ex: 🇸🇳)
  coordinates: {
    lat: number;
    lng: number;
  };
  riskLevel: SeverityLevel;
  manualRiskNote?: string;
  lastRiskUpdate?: string;
  activeAlertsCount: number;
  monitored: boolean;
  description: string;
}

export interface OsintSource {
  name: string;
  type: string; // Type de source
  reliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'; // Admiralty code: Fiabilité de la source
  credibility: '1' | '2' | '3' | '4' | '5' | '6'; // Admiralty code: Crédibilité de l'information
  isDemo: true;
  originalUrlPlaceholder?: string;
}

export interface DuplicateReport {
  id: string;
  sourceName: string;
  sourceType: string;
  title: string;
  timestamp: string;
  snippet: string;
  confidenceAdmiralty: string;
  urlPlaceholder?: string;
}

export interface OsintEvent {
  id: string;
  title: string;
  summary: string;
  description?: string;
  detailedAnalysis?: string; // Add back as optional
  sourceId?: string;
  sourceName?: string;
  originalUrl?: string;
  country?: string;
  region?: string;
  city?: string;
  category: Category;
  subCategory?: string;
  publishedAt?: string;
  detectedAt?: string;
  updatedAt?: string;
  language?: string;
  reliability?: string; // 'Très faible' | ... | 'Non évaluée'
  confidence?: string; // 'Démonstration' | 'Très faible' | ... | 'Non évaluée'
  status?: EventStatus;
  evidence?: string[]; // Optional
  uncertainty?: string[]; // Optional
  actors?: string[]; // Optional
  relatedEventIds?: string[]; // Optional
  dossierId?: string;
  alertLevel?: 'INFO' | 'FAIBLE' | 'MODÉRÉ' | 'ÉLEVÉ' | 'CRITIQUE'; // Optional
  isDemo: boolean;
  provenance?: string;
  contentHash?: string;
  normalizedTitle?: string;
  createdAt?: string; // Optional

  // Keep existing fields for backward compatibility
  countryId?: string;
  countryName?: string;
  severity?: SeverityLevel;
  confidenceScore?: number;
  date?: string;
  time?: string;
  source?: OsintSource;
  associatedSourcesCount?: number;
  associatedSourcesList?: string[];
  potentialDuplicates?: DuplicateReport[];
  admiraltyCode?: string;
  tags?: string[];
  dossierIds?: string[];
  verified?: boolean;
  locationName?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  
  // LOT 15 - Cartographie
  geoPrecision?: 'continent' | 'country' | 'region' | 'city' | 'approximate' | 'unknown';
  
  // AI Prep Fields (LOT 15)
  aiGeographicSummary?: string;
  aiPatternSummary?: string;
  aiSpatialCorrelation?: string;
  aiRiskInterpretation?: string;
}

export interface OsintAlert {
  id: string;
  sourceId?: string;
  connectorId?: string;
  watchPlanId?: string;
  executionId?: string;
  rawItemId?: string;
  normalizedItemId?: string;
  groupId?: string;
  title: string;
  summary?: string;
  detectedAt?: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  category?: Category | OsintAlertCategory | string;
  secondaryTags?: string[];
  priority?: OsintAlertPriority;
  severity?: SeverityLevel | OsintAlertSeverity;
  status?: OsintAlertStatus | 'Nouvelle' | 'Lue' | 'Analysée' | 'Archivée' | string;
  confidence?: OsintAlertConfidence;
  isDemo: boolean;
  provenance?: string;
  isHumanValidated?: boolean;
  requiresHumanReview?: boolean;
  priorityScore?: number;
  priorityFactors?: OsintAlertScoreFactor[];
  reasons?: string[];
  duplicateCount?: number;
  duplicateOfAlertId?: string;
  relatedItemIds?: string[];
  relatedEventIds?: string[];
  relatedActorIds?: string[];
  relatedCaseIds?: string[];
  evidenceCount?: number;
  sourceCount?: number;
  independenceLevel?: OsintIndependenceLevel;
  contradictionLevel?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  contradictions?: OsintAlertContradiction[];
  analystNote?: string;
  assessment?: OsintAlertAssessment;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  assignedTo?: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;

  // Provenance & Source Metadata
  sourceName?: string;
  sourceUrl?: string;
  originalUrl?: string;
  contentHash?: string;
  hashAlgorithm?: string;
  rawContentExcerpt?: string;
  language?: string;

  // Backward compatibility fields for LOTS 1-24
  eventId?: string;
  message?: string;
  alertLevel?: 'INFO' | 'FAIBLE' | 'MODÉRÉ' | 'ÉLEVÉ' | 'CRITIQUE';
  country?: string;
  countryId?: string;
  countryName?: string;
  acknowledgedAt?: string;
  timestamp?: string;
  acknowledged?: boolean;
}

export interface OsintEvidence {
  id: string;
  eventId?: string;
  analysisId?: string; // added for mock data compatibility
  sourceId?: string; // changed to optional
  type: 'Texte' | 'Image' | 'Vidéo' | 'Document' | 'Donnée géographique' | 'Donnée temporelle' | 'Statistique' | 'Déclaration officielle' | 'Autre' | 'IMINT' | 'SIGINT' | 'SOCMINT' | 'HUMINT' | 'OSINT';
  title: string;
  description: string;
  url?: string;
  timestamp?: string; // changed to optional
  dateAcquired?: string; // added for mock data compatibility
  verificationStatus: 'Non vérifié' | 'En cours de vérification' | 'Vérifié' | 'Contesté' | 'Rejeté' | 'Plausible' | 'Non Confirmé';
  contentHash?: string;
  metadata?: Record<string, any>;
  isDemo: boolean;
  provenance?: string;
}

export interface OsintHypothesis {
  id: string;
  analysisId?: string; // made optional for backward compatibility
  title: string;
  description: string;
  confidence?: 'TRÈS FAIBLE' | 'FAIBLE' | 'MOYENNE' | 'ÉLEVÉE' | 'TRÈS ÉLEVÉE' | 'NON EVALUE';
  supportingEvidenceIds?: string[];
  opposingEvidenceIds?: string[];
  supportingEventIds?: string[]; 
  opposingEventIds?: string[]; 
  analystComment?: string; 
  status: 'Ouverte' | 'En évaluation' | 'Plausible' | 'Privilégiée' | 'Écartée' | 'Alternative' | 'PROPOSEE' | 'EN_EVALUATION' | 'SOUTENUE' | 'FRAGILE' | 'CONTESTEE' | 'INSUFFISANTE' | 'ECARTEE' | 'CLOTUREE';
  isDemo: boolean;
  provenance?: string;
  
  // LOT 30 Extensions
  caseId?: string;
  situationId?: string;
  statement?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  analystId?: string;
  supportScore?: number;
  contradictionScore?: number;
  evidenceCount?: number;
  supportingEvidenceCount?: number;
  contradictingEvidenceCount?: number;
  neutralEvidenceCount?: number;
  unresolvedEvidenceCount?: number;
  sourceCount?: number;
  independentSourceCount?: number;
  gapsCount?: number;
  testCount?: number;
  lastAssessmentAt?: string;
  nextReviewAt?: string;
  conclusion?: string;
  limitations?: string;
}

export interface OsintHypothesisEvidence {
  id: string;
  hypothesisId: string;
  evidenceId: string; // Ref to OsintEvidence or Event or Alert
  entityType: 'EVIDENCE' | 'EVENT' | 'ALERT' | 'SIGNAL' | 'ANOMALY';
  stance: 'SUPPORTS' | 'CONTRADICTS' | 'NEUTRAL' | 'UNRESOLVED';
  analystId: string;
  justification?: string;
  createdAt: string;
  isDemo: boolean;
  provenance?: string;
}

export interface OsintHypothesisCriterion {
  id: string;
  code: string;
  name: string;
  description: string;
  weight: number;
}

export interface OsintHypothesisAssessment {
  id: string;
  hypothesisId: string;
  criterionId: string;
  value: 'FORTEMENT FAVORABLE' | 'FAVORABLE' | 'NEUTRE' | 'DEFAVORABLE' | 'FORTEMENT DEFAVORABLE' | 'NON EVALUABLE';
  justification: string;
  analystId: string;
  assessedAt: string;
  isDemo: boolean;
  provenance?: string;
}

export interface OsintHypothesisTest {
  id: string;
  hypothesisId: string;
  question: string;
  expectedObservation: string;
  alternativeObservation?: string;
  result?: string;
  status: 'A_TESTER' | 'EN_COURS' | 'RESULTAT_FAVORABLE' | 'RESULTAT_DEFAVORABLE' | 'NON_CONCLUANT' | 'IMPOSSIBLE_A_VERIFIER';
  sourceIds?: string[];
  evidenceIds?: string[];
  analystId: string;
  date: string;
  justification?: string;
  isDemo: boolean;
  provenance?: string;
}

export interface OsintHypothesisDiscriminant {
  id: string;
  description: string;
  hypothesisIds: string[];
  expectedValue: string;
  potentialSource?: string;
  status: 'A_RECHERCHER' | 'RECHERCHE_EN_COURS' | 'OBTENU' | 'NON_DISPONIBLE' | 'NON_CONCLUANT';
  analystId: string;
  date: string;
  justification?: string;
  isDemo: boolean;
  provenance?: string;
}

export interface OsintHypothesisAudit {
  id: string;
  hypothesisId?: string;
  timestamp: string;
  analystId: string;
  action: string;
  entityId: string;
  before?: string;
  after?: string;
  reason?: string;
  isDemo: boolean;
  provenance?: string;
}

export interface OsintHypothesisGroup {
  id: string;
  question: string;
  hypothesisIds: string[];
  analystId: string;
  createdAt: string;
  updatedAt: string;
  conclusion?: string;
  confidence?: 'TRES_FAIBLE' | 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'TRES_ELEVEE';
  limitations?: string;
  gaps?: string;
  nextSteps?: string;
  isDemo: boolean;
  provenance?: string;
}

export interface AnalysisNote {
  id: string;
  analysisId: string;
  category: 'Observation' | 'Question' | 'Point à vérifier' | 'Hypothèse' | 'Piste' | 'Information manquante' | 'Remarque';
  content: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
  provenance?: string;
}

export interface AnalysisQuestion {
  id: string;
  analysisId?: string; // made optional
  question: string;
  status: string; // broadened
  createdAt?: string; // made optional
}

export interface OsintAnalysis {
  id: string;
  eventId: string;
  title: string;
  objective: string;
  summary: string;
  establishedFacts: string[];
  reportedInformation: string[];
  unconfirmedInformation: string[];
  contradictoryInformation: {
    sourceAId: string;
    infoA: string;
    sourceBId: string;
    infoB: string;
  }[];
  hypothesisIds: string[];
  evidenceIds?: string[];
  analyticalAssessment: string;
  keyFindings?: string[];
  implications: string[];
  confidence: 'TRÈS FAIBLE' | 'FAIBLE' | 'MOYENNE' | 'ÉLEVÉE' | 'TRÈS ÉLEVÉE';
  confidenceReason: string;
  sourceIds: string[];
  relatedEventIds: string[];
  relatedActorIds: string[];
  analystNotes?: AnalysisNote[];
  questions?: AnalysisQuestion[];
  conclusion: string;
  createdAt?: string;
  updatedAt?: string;
  analystId?: string;
  status: 'Brouillon' | 'En cours d’analyse' | 'À vérifier' | 'Analysée' | 'Validée' | 'Archivée';
  isDemo: boolean;
  provenance?: string;
}

export interface ConfiguredAlertRule {
  id: string;
  name: string;
  countryId?: string;
  countryName?: string;
  category?: Category | 'TOUTES';
  severity?: SeverityLevel | 'TOUS' | 'ELEVE_OU_CRITIQUE';
  keyword?: string;
  keywords?: string;
  period?: '24h' | '7d' | '30d' | 'permanent';
  isActive?: boolean;
  channels?: ('in_app' | 'email' | 'webhook')[];
  emailNotification?: string;
  webhookUrl?: string;
  status?: 'active' | 'paused';
  createdAt: string;
  triggeredCount?: number;
  lastTriggered?: string;
  isDemo?: true;
}

export interface AnalyticalDossier {
  id: string;
  title: string;
  description: string;
  targetCountries: string[];
  categories: Category[];
  createdDate: string;
  lastUpdated: string;
  analystNotes: string;
  eventIds: string[];
  associatedActorIds?: string[];
  associatedSourceIds?: string[];
  associatedNoteIds?: string[];
  status?: 'Actif' | 'Archivé';
  isDemo: true;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  organization: string;
  email: string;
  monitoredCountryIds: string[];
  notificationSeverityThreshold: SeverityLevel;
  theme: 'dark' | 'amoled';
}

export type ScreenId = 
  | 'accueil' 
  | 'carte' 
  | 'pays' 
  | 'flux' 
  | 'alertes' 
  | 'dossiers' 
  | 'sources' 
  | 'acteurs' 
  | 'recherche' 
  | 'analyse'
  | 'temporel'
  | 'correlation'
  | 'fusion'
  | 'production'
  | 'qualite'
  | 'connecteurs'
  | 'gouvernance'
  | 'collecte'
  | 'veille'
  | 'signaux'
  | 'situation'
  | 'profil'
  | 'hypotheses'
  | 'diffusion'
  | 'feedback'
  | 'requirements'
  | 'research-planning'
  | 'verification-center'
  | 'analytical-assessment'
  | 'prospective-scenario'
  | 'indicator-monitoring'
  | 'situation-synthesis'
  | 'governance-dashboard'
  | 'security-center'
  | 'crisis-center'
  | 'coordination-center';

export interface FilterState {
  countryId: string;
  category: Category | 'TOUTES';
  severity: SeverityLevel | 'TOUS';
  status?: EventStatus | 'TOUS';
  sourceName?: string;
  searchQuery: string;
  dateRange: 'all' | '24h' | '7d' | '30d';
}

export type TemporalGranularity = 'HEURE' | 'JOUR' | 'SEMAINE' | 'MOIS';
export type TrendDirection = 'INCREASING' | 'STABLE' | 'DECREASING' | 'INSUFFICIENT_DATA';
export type TrendConfidence = 'FAIBLE' | 'MOYENNE' | 'ELEVEE';

export interface OsintTemporalTrend {
  id: string;
  label: string;
  periodStart: string;
  periodEnd: string;
  previousPeriodStart: string;
  previousPeriodEnd: string;
  country?: string;
  region?: string;
  category?: Category;
  actorId?: string;
  sourceId?: string;
  
  eventCount: number;
  alertCount: number;
  sourceCount: number;
  actorCount: number;
  
  previousEventCount: number;
  variation: number;
  variationPercent: number;
  trendDirection: TrendDirection;
  significance: string;
  confidence: TrendConfidence;
  
  isDemo: boolean;
  provenance?: string;
}

export interface TemporalAttentionPoint {
  id: string;
  type: 'SPIKE' | 'RECURRENCE' | 'CORRELATION' | 'CONVERGENCE' | 'CONTRADICTION' | 'NEW_CATEGORY' | 'ALERT_INCREASE';
  title: string;
  observation: string;
  interpretation?: string;
  period: string;
  eventIds: string[];
  relatedCountry?: string;
  relatedCategory?: string;
  confidence: TrendConfidence;
}

// ==========================================
// LOT 17 : CENTRE DE CORRÉLATION & SIGNAUX FAIBLES
// ==========================================

export type CorrelationType =
  | 'TEMPORAL'
  | 'SPATIAL'
  | 'ACTOR'
  | 'SOURCE'
  | 'CATEGORY'
  | 'SOURCE_ACTOR'
  | 'ACTOR_EVENT'
  | 'COUNTRY_CATEGORY'
  | 'EVENT_EVENT'
  | 'MULTI_FACTOR';

export type WeakSignalType =
  | 'REPETITION_TEMPORELLE'
  | 'REPETITION_GEOGRAPHIQUE'
  | 'CONVERGENCE_SOURCES'
  | 'CONVERGENCE_THEMATIQUE'
  | 'REAPPARITION_ACTEUR'
  | 'ASSOCIATION_ACTEUR_ZONE'
  | 'ASSOCIATION_SOURCE_EVENEMENT'
  | 'EVOLUTION_TEMPORELLE'
  | 'COMBINAISON_FACTEURS';

export type CorrelationConfidence = 'TRÈS FAIBLE' | 'FAIBLE' | 'MOYENNE' | 'ÉLEVÉE' | 'TRÈS ÉLEVÉE';

export type SignalSignificance = 'FAIBLE' | 'MODÉRÉE' | 'IMPORTANTE' | 'CRITIQUE';

export type CorrelationStatus =
  | 'NOUVEAU'
  | 'À EXAMINER'
  | 'EN COURS D’ANALYSE'
  | 'CONFIRMÉ'
  | 'INFIRMÉ'
  | 'INSUFFISAMMENT DOCUMENTÉ';

export type SignalEvolution = 'EN HAUSSE' | 'STABLE' | 'EN BAISSE' | 'INDETERMINE';

export type DuplicateDetectionStatus = 'UNIQUE' | 'PROBABLEMENT_DUPLIQUÉ' | 'CONFIRMÉ_DUPLIQUÉ';

export interface CorrelationFactorMatch {
  factor: string;
  description: string;
  matched: boolean;
}

export interface OsintCorrelation {
  id: string;
  title: string;
  description: string;
  correlationType: CorrelationType;
  eventIds: string[];
  sourceIds: string[];
  actorIds: string[];
  countryCodes: string[];
  categoryIds: (Category | string)[];
  firstObservedAt: string;
  lastObservedAt: string;
  occurrenceCount: number;
  confidence: CorrelationConfidence;
  significance: SignalSignificance;
  status: CorrelationStatus;
  evidenceIds?: string[];
  relatedAnalysisIds?: string[];
  relatedDossierIds?: string[];
  analystNote?: string;
  uncertainty: string[];
  score: number; // e.g. 6
  maxScore: number; // 8
  matchedFactors: CorrelationFactorMatch[];
  conclusion?: string;
  verificationRecommendations?: string[];
  // Préparation IA future (champs passifs, aucun appel externe)
  aiSummary?: string;
  aiCorrelationExplanation?: string;
  aiConfidence?: string;
  aiGeneratedAt?: string;
  isDemo: boolean;
  provenance?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OsintIndicator {
  id: string;
  name: string;
  description: string;
  category: string;
  definition: string;
  unit: string;
  baseline: number;
  currentValue: number;
  variation: number;
  direction: 'UP' | 'DOWN' | 'STABLE' | 'UNDEFINED';
  threshold: number;
  thresholdType: string;
  period: string;
  sourceIds: string[];
  relatedAlertIds: string[];
  relatedEventIds: string[];
  status: 'NORMAL' | 'WATCH' | 'ABNORMAL' | 'CRITICAL';
  confidence: string;
  isDemo: boolean;
  provenance?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OsintAnomaly {
  id: string;
  type: string;
  description: string;
  detectedAt: string;
  baselineValue: number;
  observedValue: number;
  deviation: number;
  score: number;
  severity: string;
  sourceIds: string[];
  itemIds: string[];
  alertIds: string[];
  status: string;
  isHumanValidated: boolean;
  analystNote?: string;
  isDemo: boolean;
  provenance?: string;
  createdAt: string;
}

export interface OsintWeakSignal {
  id: string;
  title: string;
  description: string;
  signalType: WeakSignalType;
  indicators: string[];
  relatedEventIds: string[];
  relatedSourceIds: string[];
  relatedActorIds: string[];
  countryCodes: string[];
  categoryIds: (Category | string)[];
  observedCount: number;
  firstObservedAt: string;
  lastObservedAt: string;
  evolution: SignalEvolution;
  confidence: CorrelationConfidence;
  significance: SignalSignificance;
  status: CorrelationStatus;
  evidenceIds?: string[];
  uncertainty: string[];
  analystAssessment?: string;
  recommendedVerification: string[];
  analyticalQuestions: string[];
  // Préparation IA future (champs passifs, aucun appel externe)
  aiWeakSignalAssessment?: string;
  aiSuggestedQuestions?: string[];
  isDemo: boolean;
  provenance?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SourceConvergenceItem {
  id: string;
  type: 'CONVERGENCE' | 'CONTRADICTION';
  title: string;
  topic: string;
  eventIds: string[];
  sourceIds: string[];
  sourcesInvolved: {
    sourceId: string;
    sourceName: string;
    position: string;
    reliability?: string;
  }[];
  description: string;
  observation: string;
  status: 'À EXAMINER' | 'DOCUMENTÉ' | 'EN COURS';
  confidence: CorrelationConfidence;
  uncertainty: string[];
  isDemo: boolean;
  provenance?: string;
}

export interface DuplicateCheckResult {
  id: string;
  primaryEventId: string;
  primaryEventTitle: string;
  candidateEventId: string;
  candidateEventTitle: string;
  similarityScore: number; // 0 à 100
  criteriaMatched: {
    canonicalUrlMatch: boolean;
    normalizedTitleMatch: boolean;
    dateMatch: boolean;
    sourceMatch: boolean;
    contentHashMatch: boolean;
    contentSimilarityScore: number;
  };
  status: DuplicateDetectionStatus;
  suggestedAction: string;
}

export interface CorrelationNetworkNode {
  id: string;
  label: string;
  type: 'event' | 'source' | 'actor' | 'country' | 'category';
  sublabel?: string;
  country?: string;
  category?: string;
  val: number; // node weight/size
}

export interface CorrelationNetworkLink {
  source: string;
  target: string;
  type:
    | 'SOURCE_TO_EVENT'
    | 'ACTOR_TO_EVENT'
    | 'EVENT_TO_EVENT'
    | 'ACTOR_TO_COUNTRY'
    | 'SOURCE_TO_COUNTRY'
    | 'CATEGORY_TO_EVENT';
  label?: string;
  strength?: number;
}

// ==========================================
// LOT 18 : CENTRE DE FUSION DU RENSEIGNEMENT OSINT
// ==========================================

export type FusionCaseStatus = 
  | 'OUVERT' 
  | 'EN COURS' 
  | 'SOUS SURVEILLANCE' 
  | 'STABILISÉ' 
  | 'CLOS' 
  | 'À VÉRIFIER';

export type FusionPriority = 'CRITIQUE' | 'HAUTE' | 'MOYENNE' | 'BASSE';

export type FusionSituationState = 
  | 'STABLE' 
  | 'EN ÉVOLUTION' 
  | 'À SURVEILLER' 
  | 'INCERTAINE' 
  | 'CONTRADICTOIRE' 
  | 'DONNÉES INSUFFISANTES';

export type SourceIndependenceLevel = 
  | 'INDÉPENDANTE' 
  | 'POSSIBLEMENT LIÉE' 
  | 'MÊME ORIGINE' 
  | 'INCONNUE';

export type ConcordanceLevel = 
  | 'CONCORDANTE' 
  | 'PARTIELLEMENT CONCORDANTE' 
  | 'CONTRADICTOIRE' 
  | 'NON VÉRIFIÉE';

export type ActorInvolvementLevel = 
  | 'MENTIONNÉ' 
  | 'IMPLIQUÉ' 
  | 'OBSERVATEUR' 
  | 'NON DÉTERMINÉ';

export interface FusionReportedInfo {
  id: string;
  sourceId: string;
  sourceName: string;
  claim: string;
  date: string;
  countryCode: string;
  actorMentioned?: string;
  actorInvolvement?: ActorInvolvementLevel;
  confidence: 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ' | 'NON ÉVALUÉ';
  concordance: ConcordanceLevel;
  sourceIndependence: SourceIndependenceLevel;
  eventId?: string;
}

export interface FusionContradiction {
  id: string;
  topic: string;
  sourceA: {
    sourceId: string;
    sourceName: string;
    statement: string;
    date?: string;
    reliability?: string;
  };
  sourceB: {
    sourceId: string;
    sourceName: string;
    statement: string;
    date?: string;
    reliability?: string;
  };
  divergence: string;
  analystActionRequired: string; // "Arbitrage analyste requis"
  status: 'NON RÉSOLU' | 'EN ARBITRAGE' | 'ÉLUCIDÉ';
  uncertaintyNote?: string;
}

export interface FusionConvergence {
  id: string;
  topic: string;
  sources: {
    sourceId: string;
    sourceName: string;
    statement: string;
    independence: SourceIndependenceLevel;
  }[];
  concordanceSummary: string;
  confidence: 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ' | 'NON ÉVALUÉ';
  evidenceIds?: string[];
}

export interface FusionTraceabilityLink {
  conclusionId: string;
  conclusionText: string;
  analysisId?: string;
  analysisTitle?: string;
  hypothesisId?: string;
  hypothesisTitle?: string;
  evidenceId?: string;
  evidenceTitle?: string;
  sourceId?: string;
  sourceName?: string;
  informationClaim?: string;
  eventId?: string;
  eventTitle?: string;
  isComplete: boolean;
  brokenLinks?: string[];
}

export interface OsintFusionCase {
  id: string;
  title: string;
  description: string;
  status: FusionCaseStatus;
  priority: FusionPriority;
  situationState: FusionSituationState;
  countryCodes: string[];
  regionIds: string[];
  eventIds: string[];
  sourceIds: string[];
  actorIds: string[];
  correlationIds: string[];
  weakSignalIds: string[];
  analysisIds: string[];
  dossierIds: string[];
  alertIds: string[];
  evidenceIds: string[];
  hypothesisIds: string[];
  keyFacts: string[];
  reportedInformation: FusionReportedInfo[];
  confirmedInformation: string[];
  unconfirmedInformation: string[];
  contradictions: FusionContradiction[];
  convergences: FusionConvergence[];
  analyticalAssessment: string;
  uncertainties: string[];
  informationGaps: string[];
  analystQuestions: string[];
  conclusion: string;
  confidence: 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ' | 'NON ÉVALUÉ';
  significance: 'FAIBLE' | 'MOYENNE' | 'ÉLEVÉE' | 'STRATÉGIQUE';
  firstObservedAt: string;
  lastUpdatedAt: string;
  isDemo: boolean;
  provenance?: string;
  createdAt: string;
  updatedAt: string;
  traceabilityChain?: FusionTraceabilityLink[];
  // Préparation IA future (champs passifs, aucun appel externe)
  aiFusionSummary?: string;
  aiSituationAssessment?: string;
  aiInformationGaps?: string[];
  aiSuggestedQuestions?: string[];
  aiHypothesisAssessment?: string;
  aiConfidence?: string;
  aiGeneratedAt?: string;
}

export interface FusionMatrixRow {
  countryCode: string;
  countryName: string;
  hasSources: boolean;
  sourcesCount: number;
  hasEvents: boolean;
  eventsCount: number;
  hasActors: boolean;
  actorsCount: number;
  hasCorrelations: boolean;
  correlationsCount: number;
  hasWeakSignals: boolean;
  weakSignalsCount: number;
  hasContradictions: boolean;
  concordanceRatio: number;
}

export interface FusionNetworkNode {
  id: string;
  label: string;
  type: 'case' | 'source' | 'event' | 'actor' | 'country' | 'correlation' | 'signal' | 'hypothesis' | 'analysis';
  sublabel?: string;
  status?: string;
  val: number;
  country?: string;
}

export interface FusionNetworkLink {
  source: string;
  target: string;
  type: string;
  label?: string;
}


// ==================================================
// LOT 20: CENTRE DE QUALITÉ, PROVENANCE ET AUDIT
// ==================================================

export interface OsintProvenance {
  id: string;
  objectType: 'event' | 'source' | 'evidence' | 'analysis' | 'report';
  objectId: string;
  sourceId?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceType?: string;
  sourceCountry?: string;
  sourceLanguage?: string;
  publicationDate?: string;
  observationDate?: string;
  ingestionDate: string;
  lastModified: string;
  analystLabel: string; // Compatible avec l'architecture actuelle
  transformationType?: string;
  transformationDescription?: string;
  originalReference?: string;
  parentObjectId?: string;
  confidence: ReportConfidence;
  reliability: string;
  certainty: string;
  completeness: number; // 0-100
  isDemo: boolean;
  provenance?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportType =
  | 'Note de renseignement'
  | 'Synthèse de renseignement'
  | 'Flash renseignement'
  | 'Point de situation'
  | 'Analyse thématique'
  | 'Analyse pays'
  | 'Analyse régionale'
  | 'Note de situation'
  | 'Note de veille'
  | 'Évaluation analytique';

export type ReportStatus = 'BROUILLON' | 'EN REVUE' | 'VALIDÉ' | 'DIFFUSÉ' | 'ARCHIVÉ' | 'REJETÉ';

export type ReportPriority = 'Faible' | 'Normale' | 'Élevée' | 'Critique';

export type ReportConfidence = 'Non évalué' | 'Faible' | 'Modéré' | 'Élevé' | 'Très élevé';

export type TraceabilityStatus = 'TRAÇABILITÉ COMPLÈTE' | 'TRAÇABILITÉ INCOMPLÈTE';

export type InformationCategory =
  | 'FAIT ÉTABLI'
  | 'INFORMATION RAPPORTÉE'
  | 'INFORMATION NON CONFIRMÉE'
  | 'ÉVIDENCE'
  | 'ANALYSE'
  | 'HYPOTHÈSE'
  | 'APPRÉCIATION'
  | 'CONCLUSION';

export interface ReportVersionLog {
  id: string;
  versionNumber: number;
  date: string;
  author: string;
  status: ReportStatus;
  changes: string;
  comment?: string;
}

export interface ReportValidationLog {
  id: string;
  date: string;
  author: string;
  action: string;
  oldStatus: ReportStatus;
  newStatus: ReportStatus;
  comment?: string;
}

export interface AnalyticalTimelineEvent {
  id: string;
  date: string;
  time?: string;
  description: string;
  sourceId?: string;
  confidence: ReportConfidence;
  status: 'DATE CERTAINE' | 'DATE ESTIMÉE' | 'DATE NON DISPONIBLE';
  relationToReport: string;
}

export interface ReportActor {
  actorId: string;
  role: 'ACTEUR MENTIONNÉ' | 'ACTEUR IMPLIQUÉ';
  justificationSourceIds: string[];
}

export interface ReportSourceAssessment {
  sourceId: string;
  informationProvided: string;
  concordance: 'Concordant' | 'Divergent' | 'Non vérifié' | 'Non disponible';
  independence: 'Avérée' | 'Supposée' | 'Incertaine' | 'Non indépendante';
  limitations: string;
  confidenceLevel: ReportConfidence;
  analystArbitrationRequired?: boolean;
}

export interface InformationGap {
  id: string;
  description: string;
  type:
    | 'Informations manquantes'
    | 'Sources insuffisantes'
    | 'Événements non confirmés'
    | 'Contradictions non résolues'
    | 'Acteurs insuffisamment documentés'
    | 'Données temporelles manquantes'
    | 'Données géographiques manquantes';
  priority: ReportPriority;
}

export interface AnalystQuestion {
  id: string;
  question: string;
  status: 'Ouverte' | 'Résolue' | 'En attente';
}

export interface OsintIntelligenceReport {
  id: string;
  reference: string;
  title: string;
  subtitle?: string;
  reportType: ReportType;
  classification: 'NON CLASSIFIÉ' | 'DIFFUSION RESTREINTE' | 'CONFIDENTIEL' | 'SECRET';
  status: ReportStatus;
  priority: ReportPriority;
  
  createdAt: string;
  updatedAt: string;
  validatedAt?: string;
  author: string;
  reviewer?: string;
  organization?: string;

  area: string;
  countryIds: string[];
  regionIds: string[];

  // Linked Entities
  actorIds: string[];
  sourceIds: string[];
  eventIds: string[];
  analysisIds: string[];
  correlationIds: string[];
  weakSignalIds: string[];
  fusionCaseIds: string[];
  evidenceIds: string[];
  folderIds: string[];
  alertIds: string[];

  // Content
  executiveSummary: string;
  context: string;
  establishedFacts: string[];
  reportedInformation: string[];
  unconfirmedInformation: string[];

  // Assessment & Analysis
  sourceAssessments: ReportSourceAssessment[];
  chronology: AnalyticalTimelineEvent[];
  actorsAssessment: ReportActor[];
  analysis: string;
  hypotheses: OsintHypothesis[]; // Using the existing hypothesis type
  implications: string;
  informationGaps: InformationGap[];
  analystQuestions: AnalystQuestion[];
  assessment: string;
  conclusion: string;

  // Metadata & Indicators
  confidenceLevel: ReportConfidence;
  isDemo: boolean;
  provenance?: string;
  version: number;
  versionHistory: ReportVersionLog[];
  validationHistory: ReportValidationLog[];
  traceabilityStatus: TraceabilityStatus;
  completenessScore: number;
  
  // Validation checklist state
  validationChecklist?: {
    sourcesIdentified: boolean;
    sourcesEvaluated: boolean;
    infoDistinguished: boolean;
    evidencePresent: boolean;
    contradictionsExamined: boolean;
    hypothesesDocumented: boolean;
    gapsIdentified: boolean;
    analysisSeparated: boolean;
    conclusionJustified: boolean;
    traceabilityVerified: boolean;
  };
}

// ==========================================
// LOT 21 : ARCHITECTURE D’INTÉGRATION DES SOURCES RÉELLES OSINT
// Modèles et structures de données découplés pour l'ingestion future
// Strictement HORS LIGNE — Aucune collecte Internet réelle dans ce LOT
// ==========================================

export type ConnectorType =
  | 'MANUAL'
  | 'RSS'
  | 'API'
  | 'ATOM'
  | 'WEB_FEED'
  | 'FILE'
  | 'FUTURE_WEB'
  | 'FUTURE_SOCIAL'
  | 'FUTURE_SATELLITE';

export type ConnectorStatus =
  | 'SOURCE_IDENTIFIED'       // Source identifiée mais non configurée
  | 'SOURCE_CONFIGURED'       // Connecteur configuré (paramètres spécifiés)
  | 'READY_TO_CONNECT'        // Connecteur validé, prêt pour future liaison
  | 'CONNECTED'               // Connecté (réservé aux futures connexions réelles)
  | 'ACTIVE'                  // Actif (en simulation / architecture dans LOT 21)
  | 'ERROR'                   // En erreur (défaillance technique ou parsing)
  | 'SUSPENDED'               // Temporairement suspendu (robots, rate limit)
  | 'DISABLED'                // Désactivé manuellement par l'analyste
  | 'PENDING_VALIDATION'
  | 'IDLE';

export type ConnectorMethod =
  | 'GET'
  | 'POST'
  | 'GRAPHQL'
  | 'MANUAL_IMPORT'
  | 'POLLING'
  | 'WEBHOOK';

export type ConnectorFormat =
  | 'JSON'
  | 'XML'
  | 'RSS'
  | 'ATOM'
  | 'GEOJSON'
  | 'CSV'
  | 'HTML'
  | 'PDF'
  | 'CUSTOM';

export type RobotsPolicy =
  | 'ALLOWED'
  | 'RESTRICTED'
  | 'DISALLOWED'
  | 'UNSPECIFIED';

export type LicensingStatus =
  | 'OPEN_ACCESS'
  | 'PUBLIC_DOMAIN'
  | 'CREATIVE_COMMONS'
  | 'EDITORIAL_RESTRICTED'
  | 'GOVERNMENT_OPEN_DATA'
  | 'UNKNOWN';

export interface OsintSourceConnector {
  id: string;
  sourceId: string;
  connectorType: ConnectorType;
  endpoint: string | null;
  method: ConnectorMethod;
  format: ConnectorFormat;
  language: string;
  authenticationRequired: boolean;
  authenticationConfigured: boolean;
  authenticationType?: 'NONE' | 'API_KEY' | 'BEARER_TOKEN' | 'BASIC_AUTH' | 'OAUTH2' | 'CUSTOM_HEADER';
  enabled: boolean;
  status: ConnectorStatus;
  statusLabel: string;
  lastAttempt: string | null;
  lastSuccess: string | null;
  lastError: string | null;
  fetchInterval: string; // Ex: '15m', '1h', '6h', '24h', 'MANUAL'
  rateLimit: string;    // Ex: '30 req/min', '1 req/sec'
  robotsPolicy: RobotsPolicy;
  robotsPolicyNotes?: string;
  termsAccepted: boolean;
  licensingStatus: LicensingStatus;
  legalNotes?: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
  provenance?: string;
  isSimulated?: boolean;
  notes?: string;

  // LOT 23-B: Pilotage réel contrôlé
  connectionMode?: 'SIMULATED' | 'REAL_PILOT' | 'REAL_DISABLED';
  authorizationStatus?:
    | 'SOURCE_IDENTIFIED'
    | 'SOURCE_CONFIGURED'
    | 'READY_TO_CONNECT'
    | 'HUMAN_REVIEW'
    | 'AUTHORIZED'
    | 'ACTIVE'
    | 'SUSPENDED'
    | 'DISABLED'
    | 'ERROR';
  lastSuccessfulCollection?: string | null;
  lastFailedCollection?: string | null;
  requestCount?: number;
  errorCount?: number;
  termsChecked?: boolean;
  robotsChecked?: boolean;
  licenseChecked?: boolean;
  humanApproved?: boolean;
  activationDate?: string | null;
  deactivationDate?: string | null;
  isPilot?: boolean;
}

export type CollectionJobStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCESS'
  | 'PARTIAL'
  | 'FAILED'
  | 'CANCELLED'
  | 'DISABLED';

export type CollectionExecutionMode =
  | 'SIMULATED'
  | 'FUTURE_REAL'
  | 'SIMULATION'
  | 'OFFLINE_TEST'
  | 'FUTURE_AUTOMATED'
  | 'REAL_PILOT_ONE_SHOT';

export interface OsintCollectionJob {
  id: string;
  sourceId: string;
  connectorId: string;
  status: CollectionJobStatus;
  startedAt: string;
  completedAt?: string | null;
  itemsReceived: number;
  itemsAccepted: number;
  itemsRejected: number;
  duplicatesDetected: number;
  errors: string[];
  executionMode: CollectionExecutionMode;
  durationMs?: number;
  initiatedBy?: string;
  isDemo: boolean;
  provenance?: string;
}

export type RawItemProcessingStatus =
  | 'RECEIVED'
  | 'NORMALIZED'
  | 'DUPLICATE'
  | 'REJECTED'
  | 'PROCESSED';

export interface OsintRawItem {
  id: string;
  sourceId: string;
  connectorId: string;
  externalId: string;
  originalUrl: string;
  canonicalUrl?: string;
  title: string;
  rawContent: string;
  publishedAt: string;
  collectedAt: string;
  language: string;
  contentHash: string;
  hashAlgorithm?: 'SHA-256' | 'FNV-1A-SIMULATED';
  metadata: Record<string, any>;
  processingStatus: RawItemProcessingStatus;
  rejectionReason?: string;
  isDemo: boolean;
  provenance?: string;
}

export type IngestionDuplicateStatus =
  | 'UNIQUE'
  | 'PROBABLE_DUPLICATE'
  | 'CONFIRMED_DUPLICATE'
  | 'POSSIBLE_OVERLAP';

export type DuplicateArbitrationAction =
  | 'KEEP_UNIQUE'
  | 'LINK_TO_EXISTING'
  | 'CONFIRM_DUPLICATE'
  | 'MARK_OVERLAP'
  | 'REQUEST_REVIEW';

export interface DuplicateAssessment {
  status: IngestionDuplicateStatus;
  score: number; // 0 to 100
  matchedFields: {
    canonicalUrl: boolean;
    externalId: boolean;
    normalizedTitle: boolean;
    publicationDate: boolean;
    sourceId: boolean;
    contentHash: boolean;
    similarContent: boolean;
    temporalProximity: boolean;
  };
  matchedItemId?: string;
  matchedItemTitle?: string;
  reason: string;
  analystArbitrationRequired: boolean;
  arbitrationAction?: DuplicateArbitrationAction;
  arbitratedBy?: string;
  arbitratedAt?: string;
}

export type NormalizedProcessingStatus =
  | 'NORMALIZED'
  | 'REVIEW_REQUIRED'
  | 'REJECTED'
  | 'DUPLICATE_CANDIDATE'
  | 'READY_FOR_EVENT';

export interface OsintNormalizedItem {
  id: string;
  rawItemId: string;
  sourceId: string;
  connectorId?: string;
  title: string;
  normalizedTitle?: string;
  summary: string;
  content: string;
  normalizedContent?: string;
  language: string;
  canonicalUrl: string;
  publishedAt: string;
  normalizedAt?: string;
  country?: string;
  countryId?: string;
  region?: AfricanRegion | string;
  category: Category;
  subcategory?: string;
  suggestedSeverity: SeverityLevel;
  contentHash: string;
  hashAlgorithm?: 'SHA-256' | 'FNV-1A-SIMULATED';
  duplicateStatus: IngestionDuplicateStatus;
  matchedExistingId?: string;
  validationStatus: 'VALID' | 'WARNING' | 'REJECTED';
  validationErrors: string[];
  confidence?: number;
  processingStatus?: NormalizedProcessingStatus;
  traceabilityId?: string;
  generatedEventId?: string;
  isDemo: boolean;
  provenance?: string;
}

export interface CollectionAuditLog {
  id: string;
  timestamp: string;
  jobId: string;
  sourceId: string;
  sourceName: string;
  action:
    | 'COLLECTION_SIMULATED'
    | 'RAW_ITEM_RECEIVED'
    | 'RAW_ITEM_REJECTED'
    | 'ITEM_NORMALIZED'
    | 'DUPLICATE_DETECTED'
    | 'DUPLICATE_ARBITRATED'
    | 'EVENT_CREATED'
    | 'PIPELINE_FAILED'
    | 'OFFLINE_ACTION_BLOCKED'
    | 'KILL_SWITCH_TRIGGERED'
    | 'REAL_COLLECTION_STARTED'
    | 'REAL_COLLECTION_COMPLETED'
    | 'REAL_COLLECTION_FAILED'
    | 'REAL_ITEM_RECEIVED'
    | 'REAL_ITEM_REJECTED'
    | 'REAL_ITEM_NORMALIZED'
    | 'REAL_DUPLICATE_DETECTED'
    | 'REAL_EVENT_CREATED';
  result: 'SUCCESS' | 'WARNING' | 'FAILURE' | 'BLOCKED_OFFLINE';
  items: number;
  errors: string[];
  initiator: string;
  mode: 'SIMULATED' | 'FUTURE_REAL' | 'REAL_PILOT';
  details?: string;
  isDemo: boolean;
  provenance?: string;
}

/** Journal réseau de collecte réelle (LOT 23-B) - Strictement sans secrets */
export interface OsintNetworkLog {
  id: string;
  timestamp: string;
  domain: string;
  endpoint: string;
  method: string;
  httpStatus: number | null;
  durationMs: number;
  itemsCount: number;
  result: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  error?: string;
  initiator: string;
  isPilot: boolean;
}

/** Élément de la checklist de préactivation pilote (13 points obligatoires) */
export interface PilotChecklistItem {
  id: string;
  label: string;
  isChecked: boolean;
  isCritical: boolean;
  category: 'IDENTIFICATION' | 'LEGAL' | 'TECHNICAL' | 'GOVERNANCE';
  notes: string;
}

export type IngestionStage =
  | 'COLLECTION'
  | 'VALIDATION'
  | 'NORMALISATION'
  | 'DEDUPLICATION'
  | 'CLASSIFICATION'
  | 'EVENT_CREATION'
  | 'SOURCE_LINK'
  | 'ANALYSIS_LINK';

export interface OsintIngestionError {
  id: string;
  sourceId?: string;
  connectorId?: string;
  rawItemId?: string;
  stage: IngestionStage;
  code: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  timestamp: string;
  resolved: boolean;
  resolutionNotes?: string;
  isDemo: boolean;
  provenance?: string;
}

export type ConnectorAuditAction =
  | 'CONNECTOR_CREATED'
  | 'CONNECTOR_CONFIGURED'
  | 'CONNECTOR_ENABLED'
  | 'CONNECTOR_DISABLED'
  | 'TEST_REQUESTED'
  | 'TEST_BLOCKED_OFFLINE'
  | 'INGESTION_SIMULATED'
  | 'ERROR_DETECTED'
  | 'DEDUPLICATION_ARBITRATED'
  | 'POLICY_UPDATED';

export interface OsintConnectorAudit {
  id: string;
  connectorId: string;
  sourceId?: string;
  action: ConnectorAuditAction;
  timestamp: string;
  actor: string;
  result: 'SUCCESS' | 'WARNING' | 'FAILURE' | 'BLOCKED_OFFLINE';
  message: string;
  details?: Record<string, any>;
  isDemo: boolean;
  provenance?: string;
}

export interface OsintTraceabilityLink {
  fromStage: string;
  fromId: string;
  toStage: string;
  toId: string;
  createdAt: string;
  isDirect: boolean;
  confidence: string;
}

// ============================================================================
// LOT 22: MODÈLES DE CONFIGURATION, GOUVERNANCE ET ORCHESTRATION DES SOURCES
// ============================================================================

/** Priorité opérationnelle de la source (indépendante de la fiabilité/certitude) */
export type SourcePriority = 'P1' | 'P2' | 'P3' | 'P4' | 'P5';

export const SOURCE_PRIORITY_LABELS: Record<SourcePriority, { label: string; desc: string; color: string; badgeBg: string }> = {
  P1: { label: 'P1 — CRITIQUE', desc: 'Surveillance immédiate et stratégique prioritaire', color: 'text-rose-400', badgeBg: 'bg-rose-500/20 border-rose-500/40 text-rose-300' },
  P2: { label: 'P2 — HAUTE', desc: 'Veille renforcée sur zones ou thématiques d’intérêt majeur', color: 'text-orange-400', badgeBg: 'bg-orange-500/20 border-orange-500/40 text-orange-300' },
  P3: { label: 'P3 — NORMALE', desc: 'Veille standard et flux d’actualité régulier', color: 'text-blue-400', badgeBg: 'bg-blue-500/20 border-blue-500/40 text-blue-300' },
  P4: { label: 'P4 — FAIBLE', desc: 'Source secondaire ou d’appoint thématique', color: 'text-slate-400', badgeBg: 'bg-slate-500/20 border-slate-500/40 text-slate-300' },
  P5: { label: 'P5 — À ÉVALUER', desc: 'Priorité non encore attribuée par l’analyste', color: 'text-amber-400', badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
};

/** Criticité opérationnelle de la source (CRITICITÉ ≠ FIABILITÉ) */
export type SourceCriticality = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export const SOURCE_CRITICALITY_LABELS: Record<SourceCriticality, { label: string; desc: string; badgeBg: string }> = {
  CRITICAL: { label: 'CRITIQUE', desc: 'Dispositif vital de couverture stratégique', badgeBg: 'bg-rose-600/30 border-rose-500/50 text-rose-200' },
  HIGH: { label: 'ÉLEVÉE', desc: 'Couverture opérationnelle forte', badgeBg: 'bg-orange-500/20 border-orange-500/40 text-orange-300' },
  MEDIUM: { label: 'MOYENNE', desc: 'Couverture standard', badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  LOW: { label: 'FAIBLE', desc: 'Source de recoupement mineure', badgeBg: 'bg-slate-700/40 border-slate-600 text-slate-300' },
  UNKNOWN: { label: 'INCONNUE', desc: 'Non qualifiée opérationnellement', badgeBg: 'bg-purple-500/20 border-purple-500/40 text-purple-300' },
};

/** Workflow de gouvernance d'une source */
export type GovernanceWorkflowStatus =
  | 'DRAFT'             // Brouillon
  | 'TO_VERIFY'         // À vérifier
  | 'VERIFIED'          // Vérifiée
  | 'TO_APPROVE'        // À approuver
  | 'APPROVED'          // Approuvée
  | 'READY_TO_CONNECT'  // Prête à connecter
  | 'AUTHORIZED'        // Autorisée
  | 'ACTIVE'            // Active — Simulation locale
  | 'SUSPENDED'         // Suspendue
  | 'DISABLED';         // Désactivée

export const GOVERNANCE_STATUS_LABELS: Record<GovernanceWorkflowStatus, { label: string; step: number; color: string; bg: string }> = {
  DRAFT: { label: 'Brouillon', step: 1, color: 'text-slate-400', bg: 'bg-slate-800 text-slate-300 border-slate-700' },
  TO_VERIFY: { label: 'À vérifier', step: 2, color: 'text-amber-400', bg: 'bg-amber-950/60 text-amber-300 border-amber-800' },
  VERIFIED: { label: 'Vérifiée', step: 3, color: 'text-cyan-400', bg: 'bg-cyan-950/60 text-cyan-300 border-cyan-800' },
  TO_APPROVE: { label: 'À approuver', step: 4, color: 'text-indigo-400', bg: 'bg-indigo-950/60 text-indigo-300 border-indigo-800' },
  APPROVED: { label: 'Approuvée', step: 5, color: 'text-emerald-400', bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800' },
  READY_TO_CONNECT: { label: 'Prête à connecter', step: 6, color: 'text-teal-400', bg: 'bg-teal-950/60 text-teal-300 border-teal-800' },
  AUTHORIZED: { label: 'Autorisée', step: 7, color: 'text-blue-400', bg: 'bg-blue-950/60 text-blue-300 border-blue-800' },
  ACTIVE: { label: 'Active (Simulée)', step: 8, color: 'text-emerald-400', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' },
  SUSPENDED: { label: 'Suspendue', step: 9, color: 'text-orange-400', bg: 'bg-orange-950/60 text-orange-300 border-orange-800' },
  DISABLED: { label: 'Désactivée', step: 10, color: 'text-rose-400', bg: 'bg-rose-950/60 text-rose-300 border-rose-800' },
};

/** Décision de validation humaine */
export type HumanValidationDecision =
  | 'APPROVED'                   // Approuvée
  | 'APPROVED_WITH_RESERVATIONS' // Approuvée avec réserves
  | 'REJECTED'                   // Refusée
  | 'TO_REEXAMINE';              // À réexaminer

/** Enregistrement d'une validation humaine */
export interface HumanValidationRecord {
  id: string;
  validator: string;
  date: string;
  decision: HumanValidationDecision;
  justification: string;
  reservations?: string;
  nextReviewDate: string;
  isDemo: boolean;
  provenance?: string;
}

/** Politique de collecte future (collectionEnabled = false par défaut) */
export interface OsintCollectionPolicy {
  collectionEnabled: boolean; // TOUJOURS FALSE pour sources réelles en mode hors ligne
  frequency: string;          // ex: 'MANUAL', '15m', '1h', '6h', '24h'
  rateLimit: string;          // ex: '30 req/h', '1 req/min'
  allowedHours: string;       // ex: '06:00-22:00 UTC', '24/7'
  maxItems: number;           // ex: 50 items par session
  retentionDays: number;      // ex: 365 jours
  duplicatePolicy: string;    // ex: 'STRICT_HASH_AND_URL'
  languagePolicy: string;     // ex: 'FR_ONLY', 'FR_EN', 'ANY'
  geographicScope: string;    // ex: 'SAHEL', 'OUEST_AFRIQUE', 'AFRIQUE'
  legalRestrictions: string;  // ex: 'Citations courtes autorisées', 'Open Data Gouvernemental'
  humanReviewRequired: boolean;
  isDemo: boolean;
  provenance?: string;
}

/** Politique de conservation des données */
export interface OsintRetentionPolicy {
  retentionDays: number;
  justification: string;
  informationType: string;
  status: string;
  futureDeletionPolicy: string;
  archivalPolicy: string;
}

/** Fiche complète de gouvernance d'une source OSINT */
export interface OsintSourceGovernance {
  id: string;
  sourceId: string;
  priority: SourcePriority;
  criticality: SourceCriticality;
  governanceStatus: GovernanceWorkflowStatus;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESERVATIONS' | 'REVOKED';
  validationStatus: 'NONE' | 'IN_PROGRESS' | 'VALIDATED' | 'REJECTED';
  legalStatus: string;
  licensingStatus: string;
  robotsStatus: string;
  termsStatus: 'UNKNOWN' | 'CHECKED_OK' | 'RESTRICTIVE' | 'FORBIDDEN';
  authenticationStatus: 'NONE' | 'CONFIGURED' | 'MISSING' | 'INVALID';
  collectionPolicy: OsintCollectionPolicy;
  retentionPolicy: OsintRetentionPolicy;
  responsibleAnalyst: string;
  reviewer: string;
  approvalDate: string | null;
  reviewDate: string | null;
  suspensionReason?: string;
  notes: string;
  validationHistory: HumanValidationRecord[];
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
  provenance?: string;
}

/** Calendrier & Enregistrement de revue périodique d'une source */
export interface OsintSourceReview {
  id: string;
  sourceId: string;
  reviewDate: string;
  reviewer: string;
  status: 'SCHEDULED' | 'OVERDUE' | 'COMPLETED' | 'CANCELLED';
  decision: HumanValidationDecision | 'PENDING';
  notes: string;
  nextReviewDate?: string;
  isDemo: boolean;
  provenance?: string;
}

/** Actions de journalisation de l'audit de gouvernance */
export type OsintGovernanceAuditAction =
  | 'SOURCE_CREATED'
  | 'SOURCE_UPDATED'
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'CRITICALITY_CHANGED'
  | 'VALIDATION_REQUESTED'
  | 'SOURCE_APPROVED'
  | 'SOURCE_REJECTED'
  | 'SOURCE_SUSPENDED'
  | 'SOURCE_DISABLED'
  | 'CONNECTOR_CONFIGURED'
  | 'POLICY_UPDATED'
  | 'REVIEW_COMPLETED'
  | 'CHECKLIST_VERIFIED'
  | 'OFFLINE_BLOCKED';

/** Événement d'audit de gouvernance infalsifiable (append-only) */
export interface OsintGovernanceAudit {
  id: string;
  sourceId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  previousValue?: string;
  newValue?: string;
  actor: string;
  timestamp: string;
  details?: string;
  before?: any;
  after?: any;
  reason?: string;
  result?: 'SUCCESS' | 'WARNING' | 'FAILURE' | 'BLOCKED_OFFLINE';
  isDemo: boolean;
  provenance?: string;
}

/** Rôles préparatoires RBAC */
export type GovernanceRole = 'ADMINISTRATOR' | 'ANALYST' | 'REVIEWER' | 'AUDITOR' | 'READ_ONLY';

export const GOVERNANCE_ROLE_DESCRIPTIONS: Record<GovernanceRole, { title: string; desc: string; permissions: string[] }> = {
  ADMINISTRATOR: {
    title: 'Administrateur Plateforme',
    desc: 'Configuration complète, gestion des droits et activation des politiques',
    permissions: ['Configurer connecteurs', 'Modifier statuts', 'Gérer politiques', 'Valider en recours']
  },
  ANALYST: {
    title: 'Analyste OSINT',
    desc: 'Proposition de sources, analyse, qualification et propositions de priorités',
    permissions: ['Proposer sources', 'Renseigner métadonnées', 'Qualifier priorité/criticité', 'Demander validation']
  },
  REVIEWER: {
    title: 'Réviseur / Validateur',
    desc: 'Validation humaine formelle, octroi des approbations et vérification juridique',
    permissions: ['Approuver sources', 'Émettre réserves', 'Planifier revues', 'Rejeter configurations']
  },
  AUDITOR: {
    title: 'Auditeur Déontologie & Conformité',
    desc: 'Consultation intégrale des registres d’audit, traçabilité et conformité juridique',
    permissions: ['Consulter journaux d’audit', 'Vérifier traçabilité', 'Contrôler conformité robots/CGU']
  },
  READ_ONLY: {
    title: 'Consultant / Observateur',
    desc: 'Consultation simple du registre des sources et des états de gouvernance',
    permissions: ['Lecture registre', 'Visualisation matrice', 'Lecture fiches']
  }
};

/** Élément de la checklist de préactivation (14 points obligatoires) */
export interface PreActivationCheckItem {
  id: string;
  label: string;
  category: 'IDENTIFICATION' | 'LEGAL' | 'TECHNICAL' | 'RESPONSIBILITY' | 'SECURITY';
  isChecked: boolean;
  isCritical: boolean;
  notes: string;
}

/** Élément de la file d'actions requises */
export interface GovernanceActionItem {
  id: string;
  sourceId: string;
  sourceName: string;
  countryName: string;
  problem: string;
  priority: 'CRITIQUE' | 'HAUTE' | 'MOYENNE' | 'INFO';
  recommendedAction: string;
  category: 'METADATA' | 'LEGAL' | 'VALIDATION' | 'CONNECTOR' | 'REVIEW';
  isDemo: boolean;
  provenance?: string;
}

// ==================================================
// LOT 24: MOTEUR DE VEILLE CONTINUE CONTRÔLÉE
// & LOT 29: CENTRE DE PILOTAGE DE LA VEILLE OSINT, INDICATEURS, PRIORISATION ET SUIVI DES ACTIONS
// ==================================================

export type WatchPlanStatus =
  | 'BROUILLON'
  | 'ACTIF'
  | 'SOUS_SURVEILLANCE'
  | 'SUSPENDU'
  | 'ARCHIVE'
  | 'ACTIVE'
  | 'PAUSED'
  | 'ERROR'
  | 'BLOCKED'
  | 'DISABLED';

export type WatchPlanPriority = 'CRITIQUE' | 'ELEVEE' | 'MOYENNE' | 'FAIBLE';

export type WatchPlanFrequency =
  | 'MANUAL'
  | '5_MIN'
  | '15_MIN'
  | '30_MIN'
  | '1_HOUR'
  | '3_HOURS'
  | '6_HOURS'
  | '12_HOURS'
  | '24_HOURS'
  | 'DAILY'
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY';

export type OsintWatchActionType =
  | 'VERIFIER_SOURCE'
  | 'COMPARER_SOURCES'
  | 'VERIFIER_CONTRADICTION'
  | 'RECHERCHER_INFORMATION_MANQUANTE'
  | 'REEVALUER_INDICATEUR'
  | 'REEVALUER_HYPOTHESE'
  | 'METTRE_A_JOUR_SITUATION'
  | 'METTRE_A_JOUR_DOSSIER'
  | 'PRODUIRE_SYNTHESE'
  | 'REVUE_ANALYTIQUE';

export type OsintWatchActionStatus = 'A_FAIRE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE' | 'EN_ATTENTE';

export interface OsintWatchAction {
  id: string;
  watchPlanId: string;
  title: string;
  description: string;
  type: OsintWatchActionType;
  priority: WatchPlanPriority;
  status: OsintWatchActionStatus;
  assignedTo: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string | null;
  justification?: string;
  notes?: string;
  provenance?: string;
  isDemo: boolean;
}

export interface OsintWatchReview {
  id: string;
  watchPlanId: string;
  analystId: string;
  reviewDate: string;
  assessment: string;
  facts: string[];
  unconfirmedInformation: string[];
  contradictions: string[];
  changes: string[];
  implications: string[];
  conclusion: string;
  confidence: 'TRES_FAIBLE' | 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'TRES_ELEVEE';
  questions: string[];
  gaps: string[];
  recommendedActions: string[];
  createdAt: string;
  provenance?: string;
  isDemo: boolean;
}

export type OsintWatchGapStatus = 'OUVERT' | 'EN_COURS' | 'RESOLU' | 'ACCEPTE' | 'ARCHIVE';

export interface OsintWatchGap {
  id: string;
  watchPlanId: string;
  title: string;
  description: string;
  priority: WatchPlanPriority;
  status: OsintWatchGapStatus;
  responsable: string;
  targetDate?: string;
  justification?: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  provenance?: string;
  isDemo: boolean;
}

export type OsintContradictionCategory =
  | 'DATE_HEURE'
  | 'CHIFFRES'
  | 'LOCALISATION'
  | 'STATUT'
  | 'RESULTAT'
  | 'ACTEUR'
  | 'NARRATION_INCOMPATIBLE';

export type OsintContradictionStatus = 'MAINTENUE' | 'EN_EXAMEN' | 'RESOLUE' | 'CLASSEE';

export interface OsintWatchContradiction {
  id: string;
  watchPlanId: string;
  title: string;
  category: OsintContradictionCategory;
  sourceA: string;
  claimA: string;
  sourceB: string;
  claimB: string;
  status: OsintContradictionStatus;
  resolutionNotes?: string;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  provenance?: string;
  isDemo: boolean;
}

export interface OsintWatchAuditLog {
  id: string;
  watchPlanId?: string;
  timestamp: string;
  analystId: string;
  action: string;
  objectType: string;
  objectId: string;
  previousValue?: string;
  newValue?: string;
  justification: string;
  provenance?: string;
  isDemo: boolean;
}

export interface OsintWatchPlan {
  id: string;
  title?: string; // Nom principal LOT 29
  name?: string; // Compatibilité LOT 24
  description: string;
  objective?: string;
  status: WatchPlanStatus;
  priority?: WatchPlanPriority;
  countries?: string[];
  regions?: string[];
  categories?: (Category | string)[];
  actorIds?: string[];
  sourceIds?: string[];
  indicatorIds?: string[];
  signalCriteria?: string[];
  searchTerms?: string[];
  analystId?: string;
  createdAt: string;
  updatedAt: string;
  nextReviewAt?: string;
  reviewFrequency?: WatchPlanFrequency | string;
  lastReviewAt?: string | null;
  linkedCaseIds?: string[];
  linkedSituationIds?: string[];
  linkedEventIds?: string[];
  linkedAlertIds?: string[];
  linkedWeakSignalIds?: string[];
  linkedCorrelationIds?: string[];
  linkedAnomalyIds?: string[];
  linkedIndicatorIds?: string[];
  analyticalQuestions?: string[];
  gaps?: OsintWatchGap[];
  actions?: OsintWatchAction[];
  reviews?: OsintWatchReview[];
  notes?: string;
  provenance?: string;
  isDemo: boolean;

  // Attributs d'orchestration technique LOT 24 (préservés sans altération)
  sourceId?: string;
  connectorId?: string;
  enabled?: boolean;
  frequency?: WatchPlanFrequency;
  frequencyMinutes?: number;
  maxItemsPerRun?: number;
  maxRequestsPerRun?: number;
  maxConsecutiveErrors?: number;
  consecutiveErrorsCount?: number;
  retryPolicy?: number;
  nextRunAt?: string | null;
  lastRunAt?: string | null;
  lastSuccessfulRunAt?: string | null;
  lastErrorAt?: string | null;
  createdBy?: string;
  killSwitchActive?: boolean;
}

export type WatchExecutionStatus = 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'BLOCKED' | 'STOPPED';

export interface OsintWatchExecution {
  id: string;
  watchPlanId: string;
  sourceId: string;
  connectorId: string;
  startedAt: string;
  finishedAt: string | null;
  status: WatchExecutionStatus;
  requestCount: number;
  itemsReceived: number;
  itemsAccepted: number;
  itemsRejected: number;
  itemsDuplicate: number;
  itemsNew: number;
  errorsCount: number;
  durationMs: number;
  errorMessage: string | null;
  networkDomains: string[];
  httpStatuses: number[];
  auditLogIds: string[];
  isDemo: boolean;
  provenance?: string;
}

export type WatchIncidentType =
  | 'NETWORK_ERROR'
  | 'HTTP_ERROR'
  | 'RATE_LIMIT'
  | 'TOO_MANY_ITEMS'
  | 'TOO_MANY_REQUESTS'
  | 'CONSECUTIVE_FAILURES'
  | 'INVALID_RESPONSE'
  | 'DOMAIN_VIOLATION'
  | 'DUPLICATION_SPIKE'
  | 'GOVERNANCE_BLOCK'
  | 'KILL_SWITCH';

export type WatchIncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface OsintWatchIncident {
  id: string;
  watchPlanId: string;
  executionId?: string;
  type: WatchIncidentType;
  severity: WatchIncidentSeverity;
  message: string;
  detectedAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  evidence: string;
  isDemo: boolean;
  provenance?: string;
}

// ==================================================
// LOT 25: CENTRE DE QUALIFICATION, PRIORISATION ET GESTION DES ALERTES
// Détection, priorisation transparente, qualification humaine et audit
// ==================================================

export type OsintAlertPriority = 
  | 'P1_CRITICAL' 
  | 'P2_HIGH' 
  | 'P3_MEDIUM' 
  | 'P4_LOW' 
  | 'P5_INFO';

export type OsintAlertSeverity = 
  | 'CRITICAL' 
  | 'HIGH' 
  | 'MEDIUM' 
  | 'LOW' 
  | 'INFO';

export type OsintAlertStatus = 
  | 'NEW' 
  | 'TRIAGED' 
  | 'UNDER_REVIEW' 
  | 'CONFIRMED' 
  | 'DISMISSED' 
  | 'DUPLICATE' 
  | 'CONTRADICTED' 
  | 'ESCALATED' 
  | 'RESOLVED' 
  | 'ARCHIVED';

export type OsintAlertConfidence = 
  | 'VERY_LOW' 
  | 'LOW' 
  | 'MEDIUM' 
  | 'HIGH' 
  | 'VERY_HIGH';

export type OsintAlertCategory = 
  | 'SECURITY'
  | 'POLITICS'
  | 'DIPLOMACY'
  | 'ECONOMY'
  | 'HEALTH'
  | 'DISASTER'
  | 'TRANSPORT'
  | 'MARITIME'
  | 'AVIATION'
  | 'ENERGY'
  | 'INFRASTRUCTURE'
  | 'JUSTICE'
  | 'GOVERNANCE'
  | 'SOCIAL'
  | 'MEDIA'
  | 'OTHER';

export type OsintIndependenceLevel = 
  | 'UNKNOWN' 
  | 'LOW' 
  | 'MEDIUM' 
  | 'HIGH';

export interface OsintAlertScoreFactor {
  code: string;
  name: string;
  score: number;
  weight: number;
  reason: string;
}

export type AlertAssessmentDecision = 
  | 'CONFIRMED' 
  | 'DISMISSED' 
  | 'UNDER_SURVEILLANCE' 
  | 'DUPLICATE' 
  | 'CONTRADICTED' 
  | 'ESCALATED';

export interface OsintAlertAssessment {
  id?: string;
  alertId?: string;
  decision: AlertAssessmentDecision;
  analystNote: string;
  justification: string;
  confirmationBasis?: string;
  dismissalReason?: string;
  escalationReason?: string;
  assessedBy: string;
  assessedAt: string;
  confidenceAssigned?: OsintAlertConfidence;
  priorityAssigned?: OsintAlertPriority;
}

export interface OsintAlertContradiction {
  id: string;
  alertId: string;
  itemAId: string;
  itemBId: string;
  field: string;
  valueA: string;
  valueB: string;
  detectedAt: string;
  status: 'DETECTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  analystAssessment?: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  isDemo: boolean;
  provenance?: string;
}

export interface OsintAlertGroup {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  itemIds: string[];
  alertIds: string[];
  sourceIds: string[];
  actorIds: string[];
  eventIds: string[];
  convergenceScore: number;
  independenceScore: number;
  independenceLevel: OsintIndependenceLevel;
  contradictionScore: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'MERGED';
  isDemo: boolean;
  provenance?: string;
}

export type AlertActionType = 
  | 'CREATED' 
  | 'TRIAGED' 
  | 'REVIEWED' 
  | 'CONFIRMED' 
  | 'DISMISSED' 
  | 'DUPLICATE' 
  | 'CONTRADICTED' 
  | 'ESCALATED' 
  | 'RESOLVED' 
  | 'ARCHIVED';

export interface OsintAlertAction {
  id: string;
  alertId: string;
  action: AlertActionType;
  actor: string;
  timestamp: string;
  previousStatus: string;
  newStatus: string;
  note?: string;
  isDemo: boolean;
  provenance?: string;
}

export interface OsintAlertAudit {
  id: string;
  alertId: string;
  action: string;
  actor: string;
  timestamp: string;
  reason: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  sourceIds?: string[];
  evidenceIds?: string[];
  isDemo: boolean;
  provenance?: string;
}

export interface OsintSignalAssessment {
  id: string;
  signalId: string;
  actor: string;
  timestamp: string;
  previousStatus: string;
  newStatus: string;
  reason: string;
  note?: string;
  isDemo: boolean;
  provenance?: string;
}

export interface OsintSignalRule {
  id: string;
  name: string;
  description: string;
  category: string;
  ruleType: string;
  conditions: Record<string, any>;
  scoreImpact: number;
  isEnabled: boolean;
  isDemo: boolean;
  provenance?: string;
  createdAt: string;
  updatedAt: string;
}









export type OsintCaseStatus = 'DRAFT' | 'OPEN' | 'UNDER_REVIEW' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED' | 'ARCHIVED';

export type OsintCaseTaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE' | 'CANCELLED';

export type OsintCaseMilestoneStatus = 'PLANNED' | 'ACHIEVED' | 'DELAYED' | 'CANCELLED';

export interface OsintCaseTask {
  id: string;
  caseId: string;
  title: string;
  description?: string;
  status: OsintCaseTaskStatus;
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isDemo: boolean;
  provenance?: string;
}

export interface OsintCaseMilestone {
  id: string;
  caseId: string;
  title: string;
  description?: string;
  status: OsintCaseMilestoneStatus;
  targetDate?: string;
  achievedDate?: string;
  isDemo: boolean;
  provenance?: string;
}

export interface OsintCaseAssessment {
  id: string;
  caseId: string;
  assessor: string;
  assessmentAt: string;
  summary: string;
  confidence: number;
  priorityAssigned: string;
  recommendations: string[];
  isDemo: boolean;
  provenance?: string;
}

export interface OsintCaseContradiction {
  id: string;
  caseId: string;
  description: string;
  elementAId?: string;
  elementBId?: string;
  sourceIds: string[];
  detectedAt: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  resolutionNote?: string;
  isDemo: boolean;
  provenance?: string;
}

export interface OsintIntelligenceGap {
  id: string;
  caseId: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'IDENTIFIED' | 'TARGETED' | 'FILLED' | 'ABANDONED';
  identifiedAt: string;
  isDemo: boolean;
  provenance?: string;
}

export interface OsintCase {
  id: string;
  title: string;
  description: string;
  status: OsintCaseStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  
  // Relations
  alertIds: string[];
  signalIds: string[];
  eventIds: string[];
  indicatorIds: string[];
  actorIds: string[];
  evidenceIds: string[];
  hypothesisIds?: string[];
  questionIds?: string[];
  reportIds?: string[];
  correlationIds?: string[];
  anomalyIds?: string[];
  
  // Embedded
  tasks: OsintCaseTask[];
  milestones: OsintCaseMilestone[];
  assessments: OsintCaseAssessment[];
  contradictions: OsintCaseContradiction[];
  intelligenceGaps: OsintIntelligenceGap[];

  owner?: string;
  team: string[];

  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  isDemo: boolean;
  provenance?: string;
}

export interface OsintCaseAudit {
  id: string;
  caseId: string;
  timestamp: string;
  analystId: string;
  action: string;
  object: string;
  oldValue?: string;
  newValue?: string;
  justification?: string;
  isDemo: boolean;
  provenance?: string;
}

export interface OsintSituation {
  id: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'STABLE' | 'EVOLVING' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: 'TRÈS FAIBLE' | 'FAIBLE' | 'MOYENNE' | 'ÉLEVÉE' | 'TRÈS ÉLEVÉE';
  countryIds: string[];
  regionIds: string[];
  eventIds: string[];
  alertIds: string[];
  weakSignalIds: string[];
  correlationIds: string[];
  anomalyIds: string[];
  indicatorIds: string[];
  actorIds: string[];
  evidenceIds: string[];
  hypothesisIds: string[];
  questionIds: string[];
  intelligenceGapIds: string[];
  caseIds: string[];
  reportIds: string[];
  startDate: string;
  lastUpdated: string;
  assessment: string;
  analystNote: string;
  conclusion: string;
  isDemo: boolean;
  provenance?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// LOT 31 : CENTRE DE PRODUCTION DES NOTES DE RENSEIGNEMENT
// ==========================================

export type OsintNoteStatus = 'BROUILLON' | 'EN_ELABORATION' | 'EN_REVISION' | 'A_VALIDER' | 'VALIDEE' | 'DIFFUSABLE' | 'ARCHIVEE';

export type OsintNoteType = 'NOTE DE SITUATION' | 'NOTE DE RENSEIGNEMENT' | 'NOTE D’ALERTE' | 'NOTE DE SYNTHÈSE' | 'NOTE DE VEILLE' | 'NOTE D’ANALYSE' | 'NOTE DE SUIVI';

export type OsintNoteConfidence = 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ' | 'NON ÉVALUÉ';

export type OsintNoteQualityScore = {
  score: number;
  completeness: boolean;
  traceability: boolean;
  sourceCoverage: boolean;
  contradictionCoverage: boolean;
  gapCoverage: boolean;
  conclusionPresent: boolean;
  structuralCoherence: boolean;
  validated: boolean;
};

export interface OsintNoteSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface OsintNoteEvent {
  id: string;
  eventId: string;
  title: string;
  summary: string;
  analyticalConclusion: string;
  confidence: OsintNoteConfidence;
  sourceIds: string[];
}

export interface OsintNoteSource {
  id: string;
  sourceId: string;
  url?: string;
  date: string;
  type: string;
  name: string;
  provenance: string;
  confidence: OsintNoteConfidence;
  isDemo: boolean;
}

export interface OsintNoteEvidence {
  id: string;
  evidenceId: string;
  nature: string;
  date: string;
  relevance: string;
  status: string;
  limitations: string;
}

export interface OsintNoteAssessment {
  id: string;
  established: string;
  notEstablished: string;
  trends: string;
  supportedHypotheses: string[];
  uncertainties: string;
  limitations: string;
  missingInfo: string;
}

export interface OsintNoteConclusion {
  id: string;
  currentSituation: string;
  keyTakeaways: string;
  dominantHypothesis?: string;
  uncertainties: string;
  gaps: string;
  watchIndicators: string;
}

export interface OsintNoteValidation {
  id: string;
  noteId: string;
  analystId: string;
  reviewerId?: string;
  decision: 'APPROUVER' | 'REJETER' | 'DEMANDER_CORRECTION' | 'MAINTENIR_EN_REVISION';
  justification: string;
  confidence: OsintNoteConfidence;
  timestamp: string;
  checklist: Record<string, boolean>;
  logicalSignature: string;
  isDemo: boolean;
}

export interface OsintNoteDistribution {
  id: string;
  noteId: string;
  analystId: string;
  date: string;
  justification: string;
}

export interface OsintNoteAudit {
  id: string;
  timestamp: string;
  analystId: string;
  action: string;
  entityId: string;
  before?: string;
  after?: string;
  reason?: string;
  isDemo: boolean;
}

export interface OsintNoteVersion {
  id: string;
  noteId: string;
  versionNumber: number;
  timestamp: string;
  authorId: string;
  reason: string;
  summary: string;
  status: OsintNoteStatus;
  data: any; // complete note snapshot
}

export interface OsintNoteTemplate {
  id: string;
  type: OsintNoteType;
  name: string;
  defaultSections: OsintNoteSection[];
}

export interface OsintIntelligenceNote {
  id: string;
  title: string;
  reference: string;
  noteType: OsintNoteType;
  classification: string;
  priority: string;
  status: OsintNoteStatus;
  subject: string;
  geographicScope: string;
  temporalScope: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  analystId: string;
  reviewerId?: string;
  validatedAt?: string;
  publishedAt?: string;
  
  executiveSummary: string;
  keyJudgments: string;
  situationOverview: string;
  
  events: OsintNoteEvent[];
  sources?: OsintNoteSource[];
  facts: string[];
  reportedInformation: string[];
  unconfirmedInformation: string[];
  
  evidence: OsintNoteEvidence[];
  actors: any[]; // generic array for actors summary
  contradictions: any[]; // generic array for contradictions
  hypotheses: any[]; // generic array for hypotheses
  gaps: any[]; // generic array for gaps
  indicators: any[]; // weak signals / indicators
  
  analyticalAssessment: OsintNoteAssessment;
  eventConclusions: OsintNoteEvent[]; // Usually redundant with events, but mapping as requested
  overallConclusion: OsintNoteConclusion;
  recommendations: string[];
  limitations: string[];
  
  confidence: OsintNoteConfidence;
  
  sourceCount: number;
  independentSourceCount: number;
  evidenceCount: number;
  contradictionCount: number;
  gapCount: number;
  
  qualityScore: OsintNoteQualityScore;
  
  isDemo: boolean;
  provenance: string;
}

// ==========================================
// LOT 32 : CENTRE DE DIFFUSION CONTRÔLÉE, SUIVI ET ARCHIVAGE
// ==========================================

export type OsintDistributionLevel = 
  | 'INTERNE' 
  | 'RESTREINT' 
  | 'CONFIDENTIEL' 
  | 'DIFFUSION_LIMITEE' 
  | 'PUBLIC';

export type OsintDistributionStatus = 
  | 'A_DIFFUSER' 
  | 'DIFFUSION_PLANIFIEE' 
  | 'DIFFUSEE' 
  | 'CONSULTEE' 
  | 'ACCUSÉE_DE_RECEPTION' 
  | 'REFUSEE' 
  | 'EXPIREE' 
  | 'RETIREE' 
  | 'ANNULEE';

export interface OsintDistributionRecipient {
  recipientId: string;
  name: string;
  organization: string;
  function: string;
  accessLevel: OsintDistributionLevel;
  needToKnow: string[];
  email?: string;
  phone?: string;
  status: 'ACTIF' | 'INACTIF';
  isDemo: boolean;
  provenance: string;
  createdAt: string;
  updatedAt: string;
}

export interface OsintDistributionGroup {
  groupId: string;
  name: string;
  description: string;
  members: string[]; // recipientIds
  accessLevel: OsintDistributionLevel;
  status: 'ACTIF' | 'INACTIF';
  isDemo: boolean;
  provenance: string;
  createdAt: string;
  updatedAt: string;
}

export interface OsintDistribution {
  distributionId: string;
  noteId: string;
  recipientId?: string;
  groupId?: string;
  distributionLevel: OsintDistributionLevel;
  status: OsintDistributionStatus;
  distributedAt?: string;
  scheduledFor?: string;
  distributedBy: string; // analystId / diffuseur
  justification: string;
  restrictions: string;
  expirationDate?: string;
  acknowledgmentRequired: boolean;
  acknowledgmentDate?: string;
  withdrawalDate?: string;
  withdrawalReason?: string;
  refusalReason?: string;
  provenance: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OsintDistributionAcknowledgment {
  id: string;
  distributionId: string;
  noteId: string;
  recipientId: string;
  timestamp: string;
  status: 'ACCEPTE' | 'REFUSE';
  comment?: string;
  logicalSignature?: string;
  provenance: string;
  isDemo: boolean;
}

export interface OsintDistributionAudit {
  id: string;
  timestamp: string;
  analystId: string;
  action: string;
  entityId: string;
  justification?: string;
  before?: string;
  after?: string;
  provenance: string;
  isDemo: boolean;
}

export interface OsintArchiveRecord {
  archiveId: string;
  noteId: string;
  archivedAt: string;
  archivedBy: string;
  justification: string;
  noteSnapshot: OsintIntelligenceNote;
  versionsSnapshot: OsintNoteVersion[];
  validationsSnapshot: OsintNoteValidation[];
  distributionsSnapshot: OsintDistribution[];
  acknowledgmentsSnapshot: OsintDistributionAcknowledgment[];
  auditSnapshot: (OsintNoteAudit | OsintDistributionAudit)[];
  provenance: string;
  isDemo: boolean;
}

export interface OsintPreDistributionChecklist {
  noteValidated: boolean;
  levelApproved: boolean;
  recipientDesignated: boolean;
  diffuserIdentified: boolean;
  provenanceVerified: boolean;
  sourcesVerified: boolean;
  contradictionsAddressed: boolean;
  hypothesesAttached: boolean;
  unconfirmedSeparated: boolean;
  conclusionPresent: boolean;
  restrictionsFormalized: boolean;
  validityDefined: boolean;
}

// ============================================================================
// LOT 33 : RETOUR D'EXPÉRIENCE, CAPITALISATION ET ÉVALUATION POST-DIFFUSION
// ============================================================================

export type OsintPostEvaluationStatus =
  | 'A_EVALUER'
  | 'EN_EVALUATION'
  | 'RETOURS_COLLECTES'
  | 'EN_ANALYSE'
  | 'LEÇONS_IDENTIFIEES'
  | 'ACTIONS_PLANIFIEES'
  | 'CLOTUREE';

export type OsintPostFindingType =
  | 'CONFIRMED'
  | 'PARTIALLY_CONFIRMED'
  | 'NOT_CONFIRMED'
  | 'CONTRADICTED'
  | 'OBSOLETE'
  | 'INCOMPLETE'
  | 'NEW_INFORMATION'
  | 'UNDETERMINED';

export type OsintFeedbackType =
  | 'CLARIFICATION'
  | 'CORRECTION'
  | 'COMPLEMENT'
  | 'CONTRADICTION'
  | 'INFORMATION_NOUVELLE'
  | 'ERREUR_FACTUELLE'
  | 'ERREUR_ANALYTIQUE'
  | 'LACUNE'
  | 'POSITIVE'
  | 'NEGATIVE'
  | 'AUTRE';

export type OsintLessonCategory =
  | 'SOURCING'
  | 'COLLECTION'
  | 'VERIFICATION'
  | 'CORRELATION'
  | 'ANALYSE'
  | 'REDACTION'
  | 'VALIDATION'
  | 'DIFFUSION'
  | 'ARCHIVAGE'
  | 'GOUVERNANCE';

export type OsintImprovementActionStatus =
  | 'IDENTIFIEE'
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'REALISEE'
  | 'ABANDONNEE';

export interface OsintInitialAssessmentSnapshot {
  facts: string[];
  reportedInfo: string[];
  unconfirmedInfo: string[];
  hypotheses: string[];
  confidence: string;
  conclusion: string;
  productionDate?: string;
  validationDate?: string;
  diffusionDate?: string;
  archiveDate?: string;
}

export interface OsintMethodologicalScore {
  traceability: number;
  completeness: number;
  evidenceQuality: number;
  separationFactsHypotheses: number;
  contradictionsHandling: number;
  datingAccuracy: number;
  provenanceQuality: number;
  totalScore: number;
}

export interface OsintPostEvaluation {
  evaluationId: string;
  noteId: string;
  distributionId?: string;
  evaluatorId: string;
  evaluatorRole: string;
  evaluationDate: string;
  evaluationStatus: OsintPostEvaluationStatus;
  initialAssessment: OsintInitialAssessmentSnapshot;
  retrospectiveAssessment: string;
  evaluationScope: string;
  overallFinding: OsintPostFindingType;
  confidence: 'TRES_FAIBLE' | 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'TRES_ELEVEE';
  methodologicalScore?: OsintMethodologicalScore;
  closedAt?: string;
  closedBy?: string;
  closeJustification?: string;
  isDemo: boolean;
  provenance: string;
  createdAt: string;
  updatedAt: string;
}

export interface OsintFeedback {
  feedbackId: string;
  noteId: string;
  distributionId?: string;
  authorId: string;
  authorRole: string;
  feedbackType: OsintFeedbackType;
  severity: 'INFO' | 'MINEURE' | 'MODEREE' | 'CRITIQUE';
  content: string;
  actionRequired: boolean;
  status: 'NOUVEAU' | 'PRIS_EN_COMPTE' | 'EN_COURS' | 'TRAITE' | 'REJETE';
  resolutionComment?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  provenance: string;
  isDemo: boolean;
}

export interface OsintEvaluationEvidence {
  evidenceId: string;
  evaluationId: string;
  sourceId: string;
  sourceUrl?: string;
  eventId?: string;
  evidenceType: 'DOCUMENT' | 'DECLARATION' | 'ARTICLE' | 'RAPPORT' | 'IMINT' | 'TEMOIGNAGE' | 'OFFICIEL' | 'AUTRE';
  publicationDate: string;
  discoveredDate: string;
  isPostPublication: boolean; // Flag d'information ultérieure pour éviter le biais rétrospectif
  relevance: 'FORTE' | 'MOYENNE' | 'FAIBLE';
  independence: 'INDEPENDANTE' | 'PARTIELLEMENT_LIEE' | 'NON_INDEPENDANTE';
  confidence: 'TRES_FAIBLE' | 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'TRES_ELEVEE';
  excerpt: string;
  provenance: string;
  isDemo: boolean;
  createdAt: string;
}

export interface OsintPostEvaluationFinding {
  findingId: string;
  evaluationId: string;
  type: OsintPostFindingType;
  description: string;
  evidenceIds: string[];
  severity: 'INFO' | 'MINEURE' | 'MODEREE' | 'CRITIQUE';
  confidence: 'TRES_FAIBLE' | 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'TRES_ELEVEE';
  recommendation: string;
  status: 'ACTIF' | 'VALIDE' | 'CLOTURE';
  isDemo: boolean;
  provenance: string;
  createdAt: string;
}

export interface OsintLessonLearned {
  lessonId: string;
  title: string;
  description: string;
  category: OsintLessonCategory;
  sourceEvaluationId: string;
  applicableScope: string;
  findingDescription?: string;
  probableCause: string; // Ex: "CAUSE NON DÉTERMINÉE" ou explication étayée
  impact: string;
  recommendation: string;
  priority: 'FAIBLE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
  status: 'PROPOSEE' | 'VALIDEE' | 'EN_INTEGRATION' | 'CLOTUREE';
  isDemo: boolean;
  provenance: string;
  createdAt: string;
  updatedAt: string;
}

export interface OsintImprovementAction {
  actionId: string;
  lessonId: string;
  title: string;
  description: string;
  responsibleRole: string;
  priority: 'FAIBLE' | 'MOYENNE' | 'HAUTE' | 'URGENTE';
  status: OsintImprovementActionStatus;
  dueDate?: string;
  completionDate?: string;
  relatedLot: string;
  provenance: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OsintEvaluationAudit {
  id: string;
  timestamp: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  justification?: string;
  before?: string;
  after?: string;
  provenance: string;
  isDemo: boolean;
}

// ==========================================
// LOT 34 : CENTRE DES BESOINS EN RENSEIGNEMENT, QUESTIONS PRIORITAIRES ET PLANIFICATION DE VEILLE
// ==========================================

export type OsintRequirementCategory =
  | 'SITUATION'
  | 'ACTEURS'
  | 'EVENEMENT'
  | 'TENDANCE'
  | 'CAPACITE'
  | 'INTENTION'
  | 'CONTEXTE'
  | 'INFRASTRUCTURE'
  | 'ECONOMIE'
  | 'SECURITE'
  | 'POLITIQUE'
  | 'SOCIETE'
  | 'ENVIRONNEMENT'
  | 'LOGISTIQUE'
  | 'INFORMATION'
  | 'VERIFICATION'
  | 'AUTRE';

export const ALL_REQUIREMENT_CATEGORIES: OsintRequirementCategory[] = [
  'SITUATION',
  'ACTEURS',
  'EVENEMENT',
  'TENDANCE',
  'CAPACITE',
  'INTENTION',
  'CONTEXTE',
  'INFRASTRUCTURE',
  'ECONOMIE',
  'SECURITE',
  'POLITIQUE',
  'SOCIETE',
  'ENVIRONNEMENT',
  'LOGISTIQUE',
  'INFORMATION',
  'VERIFICATION',
  'AUTRE'
];

export type OsintRequirementImportance = 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE';
export type OsintRequirementUrgency = 'ROUTINE' | 'A_SURVEILLER' | 'PRIORITAIRE' | 'URGENTE';

export type OsintRequirementStatus =
  | 'IDENTIFIE'
  | 'QUALIFIE'
  | 'PRIORISE'
  | 'PLANIFIE'
  | 'EN_SURVEILLANCE'
  | 'REPONSE_PARTIELLE'
  | 'REPONSE_SUFFISANTE'
  | 'EVALUE'
  | 'CLOTURE'
  | 'SUSPENDU'
  | 'ANNULE'
  | 'OBSOLETE';

export type OsintQuestionType =
  | 'FACTUELLE'
  | 'VERIFICATION'
  | 'COMPARATIVE'
  | 'CHRONOLOGIQUE'
  | 'CAUSALE_A_EXAMINER'
  | 'PROSPECTIVE'
  | 'CONTEXTUELLE';

export type OsintAnswerStatus =
  | 'PARTIELLE'
  | 'SUFFISANTE'
  | 'NON_CONFIRMEE'
  | 'CONTRADICTOIRE'
  | 'INDETERMINEE';

export interface OsintIntelligenceRequirement {
  requirementId: string;
  title: string;
  description: string;
  question: string;
  category: OsintRequirementCategory;
  priority: number; // Score transparent 0-100 (Priorité de traitement)
  priorityLevel: 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE';
  urgency: OsintRequirementUrgency;
  importance: OsintRequirementImportance;
  impactAnalytique: number; // 0-25
  echeanceScore: number; // 0-25
  scope: string;
  originLot?: string; // LOT 14, LOT 17, LOT 18, LOT 20, LOT 26, LOT 27, LOT 28, LOT 30, LOT 31, LOT 32, LOT 33, MANUEL
  countryIds: string[];
  eventIds: string[];
  caseIds: string[];
  analysisIds: string[];
  hypothesisIds: string[];
  gapIds: string[];
  sourceIds: string[];
  indicatorIds?: string[];
  planIds?: string[];
  questionIds?: string[];
  answerIds?: string[];
  retexLessonIds?: string[];
  retexEvaluationIds?: string[];
  status: OsintRequirementStatus;
  ownerId: string;
  dueDate?: string;
  resolution?: string;
  confidence: 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'NON_EVALUEE';
  closureJustification?: string;
  cancellationJustification?: string;
  isDemo: boolean;
  provenance: string;
  createdAt: string;
  updatedAt: string;
}

export interface OsintIntelligenceQuestion {
  questionId: string;
  requirementId: string;
  question: string;
  questionType: OsintQuestionType;
  expectedAnswerType: string;
  priority: 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'URGENTE';
  status: 'OUVERTE' | 'EN_COURS' | 'REPONDUE' | 'CONTRADICTOIRE' | 'INDETERMINEE' | 'ABANDONNEE';
  answer?: string;
  answerConfidence?: 'FAIBLE' | 'MOYENNE' | 'ELEVEE';
  evidenceIds: string[];
  sourceIds: string[];
  eventIds?: string[];
  hypothesisIds?: string[];
  isDemo: boolean;
  provenance: string;
  createdAt: string;
  updatedAt: string;
}

export interface OsintRequirementIndicator {
  indicatorId: string;
  requirementId: string;
  name: string;
  description: string;
  category: OsintRequirementCategory;
  observationCriteria: string;
  expectedDirection: 'HAUSSE' | 'STABILITE' | 'BAISSE' | 'APPARITION' | 'DISPARITION' | 'INDETERMINEE';
  sourceIds: string[];
  eventCategory?: string;
  countryScope: string[];
  threshold?: string;
  status: 'ACTIF' | 'EN_VEILLE' | 'DECLENCHE' | 'INACTIF';
  isDemo: boolean;
  provenance: string;
  createdAt: string;
  updatedAt: string;
}

export interface OsintRequirementAnswer {
  answerId: string;
  requirementId: string;
  questionId: string;
  answer: string;
  evidenceIds: string[];
  sourceIds: string[];
  eventIds: string[];
  confidence: 'FAIBLE' | 'MOYENNE' | 'ELEVEE';
  answerStatus: OsintAnswerStatus;
  stanceOnHypothesis?: 'POUR' | 'CONTRE' | 'INDETERMINE';
  hypothesisId?: string;
  isPostPublication?: boolean; // Anti-biais rétrospectif: information acquise postérieurement
  analystId: string;
  answeredAt: string;
  isDemo: boolean;
  provenance: string;
  createdAt: string;
}

export interface OsintRequirementGap {
  gapId: string;
  requirementId: string;
  description: string;
  severity: 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE';
  cause: string; // Par défaut: "CAUSE NON DÉTERMINÉE" si inconnue
  impact: string;
  reductionStatus: 'NON_REDUITE' | 'PARTIELLEMENT_REDUITE' | 'REDUITE' | 'IRREDUCTIBLE';
  reductionPercent: number; // 0 à 100%
  evidenceIds: string[];
  isDemo: boolean;
  provenance: string;
  createdAt: string;
  updatedAt: string;
}

export interface OsintRequirementPlan {
  planId: string;
  requirementId: string;
  name: string;
  objective: string;
  sourceIds: string[];
  indicatorIds: string[];
  frequency: 'QUOTIDIENNE' | 'HEBDOMADAIRE' | 'MENSUELLE' | 'EN_CONTINU' | 'A_LA_DEMANDE';
  startDate: string;
  endDate?: string;
  status: 'PLANIFIE' | 'ACTIF' | 'EN_PAUSE' | 'TERMINE' | 'ANNULE';
  ownerId: string;
  governanceStatus: 'CONFORME' | 'EN_REVUE' | 'APPROUVE_LOCALEMENT';
  isDemo: boolean;
  provenance: string;
  createdAt: string;
  updatedAt: string;
}

export interface OsintRequirementAudit {
  auditId: string;
  timestamp: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: string;
  after?: string;
  justification?: string;
  provenance: string;
  isDemo: boolean;
}

// ============================================================================
// LOT 35 — CENTRE DE PLANIFICATION DE LA RECHERCHE ET DE LA VEILLE OSINT
// ============================================================================

export type OsintResearchMethod =
  | 'veille_documentaire'
  | 'recherche_web_ouverte'
  | 'analyse_temporelle'
  | 'analyse_geographique'
  | 'analyse_sources'
  | 'comparaison_multi_sources'
  | 'analyse_acteurs'
  | 'analyse_evenementielle'
  | 'verification'
  | 'recherche_contextuelle'
  | 'analyse_donnees_publiques'
  | 'imagerie_geospatial_existante'
  | 'autre';

export type OsintResearchPlanStatus =
  | 'BROUILLON'
  | 'A_PREPARER'
  | 'PLANIFIE'
  | 'EN_RECHERCHE'
  | 'RESULTATS_COLLECTES'
  | 'EN_EVALUATION'
  | 'TERMINE'
  | 'ARCHIVE'
  | 'SUSPENDU'
  | 'ANNULE'
  | 'OBSOLETE';

export type OsintResearchTaskStatus =
  | 'A_FAIRE'
  | 'EN_COURS'
  | 'EN_REVUE'
  | 'TERMINEE'
  | 'BLOQUEE'
  | 'ANNULEE';

export type OsintResearchResultRelevance =
  | 'PERTINENT'
  | 'NON_PERTINENT'
  | 'A_VERIFIER'
  | 'CORROBORE'
  | 'CONTRADICTOIRE'
  | 'NON_CONCLUANT';

export type OsintResearchResultConfidence =
  | 'FAIBLE'
  | 'MOYENNE'
  | 'ELEVEE'
  | 'CONFIRMEE';

export type OsintResearchVerificationStatus =
  | 'BRUT'
  | 'EN_COURS_DE_VERIFICATION'
  | 'VERIFIE'
  | 'CONTESTE'
  | 'REJETE';

export interface OsintResearchPlan {
  id: string;
  requirementId: string;
  questionIds: string[];
  gapIds: string[];
  indicatorIds: string[];
  sourceIds: string[];
  title: string;
  objective: string;
  scope: string;
  geographicScope: string;
  temporalScope: string;
  researchMethod: OsintResearchMethod;
  priority: number; // 0 à 100
  urgency: 'ROUTINE' | 'A_SURVEILLER' | 'PRIORITAIRE' | 'URGENTE' | 'CRITIQUE';
  status: OsintResearchPlanStatus;
  taskIds: string[];
  resultIds: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isDemo: boolean;
  archiveReason?: string;
  archivedAt?: string;
}

export interface OsintResearchTask {
  id: string;
  planId: string;
  requirementId: string;
  questionId: string;
  indicatorId?: string;
  sourceIds: string[];
  description: string;
  objective: string;
  method: OsintResearchMethod;
  status: OsintResearchTaskStatus;
  assignedTo: string;
  dueDate: string;
  completedAt?: string;
  resultIds: string[];
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OsintResearchResult {
  id: string;
  taskId: string;
  planId: string;
  requirementId: string;
  questionId: string;
  sourceId: string;
  evidenceIds: string[];
  content: string;
  observedAt: string;
  discoveredAt: string;
  relevance: OsintResearchResultRelevance;
  confidence: OsintResearchResultConfidence;
  verificationStatus: OsintResearchVerificationStatus;
  isPostPublication: boolean;
  isPostT0?: boolean;
  isDemo: boolean;
  evaluatorNotes?: string;
  evaluatedAt?: string;
  evaluatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OsintResearchAudit {
  id: string;
  timestamp: string;
  action:
    | 'CREATE_PLAN'
    | 'UPDATE_PLAN'
    | 'STATUS_CHANGE'
    | 'CREATE_TASK'
    | 'UPDATE_TASK'
    | 'CREATE_RESULT'
    | 'UPDATE_RESULT'
    | 'LINK_REFERENCE'
    | 'UNLINK_REFERENCE'
    | 'EVALUATE_RESULT'
    | 'EXPORT_CREATED'
    | 'ARCHIVE_PLAN'
    | string;
  entityType: 'PLAN' | 'TASK' | 'RESULT' | 'REFERENCE' | 'ALL' | string;
  entityId: string;
  actor: string;
  details: string;
  before?: string;
  after?: string;
  isDemo: boolean;
}

// ============================================================================
// LOT 36 — CENTRE DE VÉRIFICATION ET DE QUALIFICATION DES RÉSULTATS OSINT
// ============================================================================

export type OsintVerificationStatus =
  | 'BROUILLON'
  | 'A_VERIFIER'
  | 'EN_VERIFICATION'
  | 'ELEMENTS_COLLECTES'
  | 'EN_EVALUATION'
  | 'QUALIFIE'
  | 'QUALIFIE_AVEC_RESERVES'
  | 'NON_CONCLUANT'
  | 'NON_CONFIRME'
  | 'REJETE_TECHNIQUEMENT'
  | 'SUSPENDU'
  | 'ANNULE'
  | 'ARCHIVE';

export type OsintClaimType =
  | 'FACTUELLE'
  | 'TEMPORELLE'
  | 'GEOGRAPHIQUE'
  | 'ATTRIBUTIVE'
  | 'CAUSALE_A_EXAMINER'
  | 'CONTEXTUELLE'
  | 'IDENTIFICATION'
  | 'AUTRE';

export type OsintCheckType =
  | 'PROVENANCE'
  | 'TEMPORAL'
  | 'GEOGRAPHIQUE'
  | 'ATTRIBUTION'
  | 'CORROBORATION'
  | 'CONTRADICTION'
  | 'COHERENCE_INTERNE'
  | 'COHERENCE_EXTERNE'
  | 'DOCUMENTAIRE'
  | 'CONTEXTUEL'
  | 'IDENTITE'
  | 'AUTRE';

export type OsintCheckStatus =
  | 'NON_REALISE'
  | 'EN_COURS'
  | 'FAVORABLE'
  | 'DEFAVORABLE'
  | 'CONTRADICTOIRE'
  | 'INCONCLUANT'
  | 'NON_APPLICABLE';

export type OsintFindingType =
  | 'ELEMENT_CONFIRMANT'
  | 'ELEMENT_INFIRMANT'
  | 'ELEMENT_CONTEXTUEL'
  | 'CONTRADICTION'
  | 'LACUNE'
  | 'DUPLICATION'
  | 'SOURCE_DEPENDANTE'
  | 'SOURCE_INDEPENDANTE'
  | 'INCERTITUDE'
  | 'ANOMALIE';

export type OsintSourceRelationship =
  | 'SOURCE_PRIMAIRE'
  | 'SOURCE_SECONDAIRE'
  | 'REPRISE'
  | 'CITATION'
  | 'SYNDICATION'
  | 'DUPLICATION'
  | 'CORROBORATION_INDEPENDANTE'
  | 'DEPENDANCE_INCONNUE';

export type OsintSourceIndependenceStatus =
  | 'INDEPENDANTE'
  | 'DEPENDANTE'
  | 'INCERTAINE'
  | 'NON_EVALUEE';

export type OsintDecisionType =
  | 'QUALIFIE'
  | 'QUALIFIE_AVEC_RESERVES'
  | 'NON_CONCLUANT'
  | 'NON_CONFIRME'
  | 'REJETE_TECHNIQUEMENT';

export interface OsintVerificationCase {
  id: string;
  researchResultId: string;
  researchTaskId: string;
  researchPlanId: string;
  requirementId: string;
  questionId: string;
  title: string;
  objective: string;
  scope: string;
  status: OsintVerificationStatus;
  priority: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo: string;
  claimIds: string[];
  checkIds: string[];
  findingIds: string[];
  decisionId?: string;
  isDemo: boolean;
}

export interface OsintVerificationClaim {
  id: string;
  caseId: string;
  researchResultId: string;
  statement: string;
  claimType: OsintClaimType;
  sourceIds: string[];
  evidenceIds: string[];
  observedAt?: string;
  publicationAt?: string;
  discoveredAt?: string;
  createdAt: string;
  isDemo: boolean;
}

export interface OsintVerificationCheck {
  id: string;
  caseId: string;
  claimId: string;
  type: OsintCheckType;
  description: string;
  method: string;
  expected?: string;
  observed?: string;
  status: OsintCheckStatus;
  sourceIds: string[];
  evidenceIds: string[];
  analystId: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export interface OsintVerificationFinding {
  id: string;
  caseId: string;
  claimId: string;
  checkId: string;
  type: OsintFindingType;
  content: string;
  sourceIds: string[];
  evidenceIds: string[];
  impact: 'CRITIQUE' | 'MAJEUR' | 'MODERE' | 'FAIBLE';
  relevance: 'HAUTE' | 'MOYENNE' | 'FAIBLE';
  createdAt: string;
  createdBy: string;
  isDemo: boolean;
}

export interface OsintVerificationSourceLink {
  id: string;
  caseId: string;
  sourceId: string;
  parentSourceId?: string;
  independenceGroupId?: string;
  relationship: OsintSourceRelationship;
  independenceStatus: OsintSourceIndependenceStatus;
  publicationAt?: string;
  discoveredAt?: string;
  notes?: string;
  isDemo: boolean;
}

export interface OsintVerificationDecision {
  id: string;
  caseId: string;
  decision: OsintDecisionType;
  qualificationLevel: 'CONFIRME' | 'CONFIRME_AVEC_RESERVES' | 'QUALIFIE' | 'QUALIFIE_AVEC_RESERVES' | 'NON_CONCLUANT' | 'NON_CONFIRME' | 'REJETE_TECHNIQUEMENT';
  rationale: string;
  limitations: string[];
  unresolvedContradictions: string[];
  unresolvedGaps: string[];
  approvedBy: string;
  approvedAt: string;
  createdAt: string;
  isHumanDecision: boolean;
  isDemo: boolean;
}

export interface OsintVerificationAudit {
  id: string;
  timestamp: string;
  action: string;
  entityType: string;
  entityId: string;
  actor: string;
  details: string;
  before?: string;
  after?: string;
  isDemo: boolean;
}

export interface OsintContradictionRecord {
  id: string;
  caseId: string;
  claimA: string;
  claimB: string;
  sourceA: string;
  sourceB: string;
  nature: string;
  date: string;
  description: string;
  status: 'OUVERTE' | 'DOCUMENTE' | 'SOUMISE_ARBITRAGE';
  analystComment?: string;
}

export interface OsintVerificationTraceabilityNode {
  type:
    | 'REQUIREMENT'
    | 'QUESTION'
    | 'GAP'
    | 'INDICATOR'
    | 'SOURCE'
    | 'PLAN'
    | 'TASK'
    | 'RESULT'
    | 'CASE'
    | 'CLAIM'
    | 'CHECK'
    | 'FINDING'
    | 'DECISION'
    | 'EVIDENCE';
  id: string;
  label: string;
  status: string;
  details?: string;
  children?: OsintVerificationTraceabilityNode[];
}

// ============================================================================
// LOT 37 — CENTRE D'ÉVALUATION ANALYTIQUE ET DE RAISONNEMENT STRUCTURÉ
// ============================================================================

export type OsintAnalyticalAssessmentStatus =
  | 'BROUILLON'
  | 'EN_ELABORATION'
  | 'EN_EXAMEN'
  | 'EN_ARBITRAGE'
  | 'A_VALIDER'
  | 'VALIDEE'
  | 'SUSPENDUE'
  | 'ANNULEE'
  | 'ARCHIVEE';

export type OsintAnalyticalAssessmentLevel =
  | 'TRES_FAIBLE'
  | 'FAIBLE'
  | 'MODERE'
  | 'SUBSTANTIEL'
  | 'ELEVE'
  | 'CRITIQUE';

export type OsintAnalyticalConfidenceLevel =
  | 'TRES_FAIBLE'
  | 'FAIBLE'
  | 'MOYENNE'
  | 'ELEVEE'
  | 'TRES_ELEVEE';

export interface OsintAnalyticalAssessment {
  id: string;
  title: string;
  objective: string;
  requirementId: string;
  questionId: string;
  verificationCaseIds: string[];
  evidenceIds: string[];
  claimIds: string[];
  hypothesisIds: string[];
  alternativeIds: string[];
  findingIds: string[];
  assessmentText: string;
  assessmentLevel: OsintAnalyticalAssessmentLevel;
  confidenceLevel: OsintAnalyticalConfidenceLevel;
  uncertainties: string[];
  limitations: string[];
  unresolvedContradictions: string[];
  unresolvedGaps: string[];
  status: OsintAnalyticalAssessmentStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  validatedBy?: string;
  validatedAt?: string;
  isHumanValidated: boolean;
  isDemo: boolean;
  archiveReason?: string;
  archivedAt?: string;
}

export type OsintAnalyticalHypothesisType =
  | 'EXPLICATIVE'
  | 'CAUSALE_A_EXAMINER'
  | 'PROSPECTIVE'
  | 'ATTRIBUTIVE'
  | 'CONTEXTUELLE'
  | 'ALTERNATIVE'
  | 'AUTRE';

export type OsintAnalyticalHypothesisStatus =
  | 'ACTIVE'
  | 'FAVORISEE'
  | 'AFFAIBLIE'
  | 'NON_CONCLUANTE'
  | 'REJETEE_ANALYTIQUEMENT'
  | 'ARCHIVEE';

export interface OsintAnalyticalHypothesis {
  id: string;
  assessmentId: string;
  statement: string;
  type: OsintAnalyticalHypothesisType;
  status: OsintAnalyticalHypothesisStatus;
  supportingFindingIds: string[];
  contradictingFindingIds: string[];
  evidenceIds: string[];
  assumptionIds: string[];
  confidenceLevel: OsintAnalyticalConfidenceLevel;
  rationale: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isDemo: boolean;
}

export interface OsintAnalyticalAlternative {
  id: string;
  assessmentId: string;
  hypothesisId: string;
  statement: string;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  keyAssumptions: string[];
  discriminants: string[];
  status: 'ACTIVE' | 'EN_EVALUATION' | 'REJETEE' | 'RETENUE';
  createdAt: string;
  isDemo: boolean;
}

export type OsintAnalyticalArgumentType =
  | 'SUPPORT'
  | 'CONTRADICTION'
  | 'CONTEXTE'
  | 'LIMITE'
  | 'INCERTITUDE'
  | 'ASSUMPTION'
  | 'DISCRIMINANT';

export interface OsintAnalyticalArgument {
  id: string;
  assessmentId: string;
  hypothesisId: string;
  type: OsintAnalyticalArgumentType;
  statement: string;
  evidenceIds: string[];
  findingIds: string[];
  sourceIds: string[];
  strength: 'FAIBLE' | 'MOYEN' | 'FORT' | 'DECISIF';
  createdAt: string;
  createdBy: string;
  isDemo: boolean;
}

export type OsintAnalyticalAssumptionStatus =
  | 'NON_VERIFIEE'
  | 'PARTIELLEMENT_VERIFIEE'
  | 'VERIFIEE'
  | 'CONTESTEE'
  | 'ABANDONNEE';

export interface OsintAnalyticalAssumption {
  id: string;
  assessmentId: string;
  statement: string;
  basis: string;
  riskLevel: 'FAIBLE' | 'MODERE' | 'ELEVE' | 'CRITIQUE';
  validationStatus: OsintAnalyticalAssumptionStatus;
  evidenceIds: string[];
  createdAt: string;
  isDemo: boolean;
}

export type OsintAnalyticalDiscriminantStatus =
  | 'A_RECHERCHER'
  | 'DISPONIBLE'
  | 'OBSERVE'
  | 'NON_OBSERVE'
  | 'INCONCLUANT';

export interface OsintAnalyticalDiscriminant {
  id: string;
  assessmentId: string;
  hypothesisIds: string[];
  question: string;
  expectedObservation: string;
  meaningIfObserved: string;
  meaningIfAbsent: string;
  sourceIds: string[];
  status: OsintAnalyticalDiscriminantStatus;
  createdAt: string;
  isDemo: boolean;
}

export type OsintAnalyticalGapStatus =
  | 'OUVERTE'
  | 'EN_EXAMEN'
  | 'PARTIELLEMENT_COMBLEE'
  | 'NON_RESOLUE'
  | 'CLOTUREE_HUMAINEMENT';

export interface OsintAnalyticalGap {
  id: string;
  assessmentId: string;
  description: string;
  impact: 'FAIBLE' | 'MODERE' | 'MAJEUR' | 'BLOQUANT';
  relatedHypothesisIds: string[];
  relatedQuestionIds: string[];
  priority: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
  status: OsintAnalyticalGapStatus;
  createdAt: string;
  isDemo: boolean;
}

export type OsintAnalyticalDecisionType =
  | 'APPRECIATION_RETENUE'
  | 'APPRECIATION_AVEC_RESERVES'
  | 'NON_CONCLUANT'
  | 'INFORMATIONS_INSUFFISANTES'
  | 'A_REEVALUER';

export interface OsintAnalyticalDecision {
  id: string;
  assessmentId: string;
  decision: OsintAnalyticalDecisionType;
  rationale: string;
  supportingHypothesisIds: string[];
  contradictingEvidenceIds: string[];
  limitations: string[];
  unresolvedGaps: string[];
  unresolvedContradictions: string[];
  approvedBy: string;
  approvedAt: string;
  isHumanDecision: boolean;
  createdAt: string;
  isDemo: boolean;
}

export interface OsintAnalyticalAudit {
  id: string;
  timestamp: string;
  actorId: string;
  action: string;
  entityType:
    | 'ASSESSMENT'
    | 'HYPOTHESIS'
    | 'ALTERNATIVE'
    | 'ARGUMENT'
    | 'ASSUMPTION'
    | 'DISCRIMINANT'
    | 'GAP'
    | 'DECISION'
    | 'ALL';
  entityId: string;
  details: string;
  previousState?: string;
  newState?: string;
  isDemo: boolean;
}

export interface OsintAnalyticalTraceabilityNode {
  type:
    | 'REQUIREMENT'
    | 'QUESTION'
    | 'PLAN'
    | 'TASK'
    | 'RESULT'
    | 'CASE'
    | 'CLAIM'
    | 'FINDING'
    | 'HYPOTHESIS'
    | 'ARGUMENT'
    | 'ASSESSMENT'
    | 'DECISION'
    | 'EVIDENCE'
    | 'SOURCE'
    | 'GAP'
    | 'RUPTURE_LIEN';
  id: string;
  label: string;
  status: string;
  details?: string;
  children?: OsintAnalyticalTraceabilityNode[];
}

// LOT 38 - Prospective Scenario Center
export interface OsintProspectiveAssessment {
  id: string;
  assessmentId: string;
  requirementId: string;
  questionId: string;
  title: string;
  objective: string;
  geographicScope: string;
  temporalHorizon: string;
  baselineDate: string;
  currentAssessment: string;
  scenarioIds: string[];
  indicatorIds: string[];
  assumptionIds: string[];
  gapIds: string[];
  decisionIds: string[];
  status: 'BROUILLON' | 'CADRAGE' | 'SCENARIOS_ELABORES' | 'INDICATEURS_DEFINIS' | 'EN_EVALUATION' | 'A_VALIDER' | 'VALIDEE' | 'EN_SUIVI' | 'SUSPENDUE' | 'OBSOLETE' | 'ANNULEE' | 'ARCHIVEE';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  validatedBy?: string;
  validatedAt?: string;
  isHumanValidated: boolean;
  isDemo: boolean;
}

export interface OsintScenario {
  id: string;
  prospectiveAssessmentId: string;
  title: string;
  description: string;
  scenarioType: 'CENTRAL' | 'ALTERNATIF' | 'RUPTURE' | 'DEGRADATION' | 'AMELIORATION' | 'STABILISATION' | 'TRANSFORMATION' | 'AUTRE';
  timeHorizon: string;
  baseline: string;
  drivers: string[];
  assumptions: string[];
  supportingAssessmentIds: string[];
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  indicatorIds: string[];
  triggerIds: string[];
  discriminantIds: string[];
  constraints: string[];
  uncertainties: string[];
  status: 'BROUILLON' | 'EN_ELABORATION' | 'VALIDE' | 'ARCHIVE';
  humanAssessment: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isDemo: boolean;
}

export interface OsintScenarioAssumption {
  id: string;
  scenarioId: string;
  statement: string;
  basis: string;
  sourceIds: string[];
  evidenceIds: string[];
  validationStatus: 'NON_VERIFIEE' | 'PARTIELLEMENT_VERIFIEE' | 'VERIFIEE' | 'CONTESTEE' | 'OBSOLETE';
  criticality: 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE';
  createdAt: string;
  createdBy: string;
  isDemo: boolean;
}

export interface OsintLeadingIndicator {
  id: string;
  scenarioId: string;
  title: string;
  description: string;
  indicatorType: 'TEMPORAL' | 'GEOGRAPHIQUE' | 'ACTOR' | 'INFORMATIONNEL' | 'ECONOMIQUE' | 'SOCIAL' | 'SECURITAIRE' | 'INFRASTRUCTURE' | 'LOGISTIQUE' | 'ENVIRONNEMENTAL' | 'DOCUMENTAIRE' | 'AUTRE';
  baseline: string;
  observationCriteria: string;
  expectedDirection: 'HAUSSE' | 'BAISSE' | 'STABILITE' | 'VARIATION' | 'APPARITION' | 'DISPARITION' | 'CHANGEMENT_STRUCTUREL' | 'INDETERMINEE';
  timeWindow: string;
  sourceIds: string[];
  evidenceIds: string[];
  discriminantForScenario: string;
  relevance: string;
  status: 'ACTIF' | 'OBSERVE' | 'INACTIF';
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export interface OsintProspectiveTrigger {
  id: string;
  scenarioId: string;
  indicatorId: string;
  description: string;
  triggerType: 'CONFIRMANT' | 'INFIRMANT' | 'ALERTE_REVUE' | 'REEVALUATION' | 'CONTEXTUEL';
  threshold: string;
  observationWindow: string;
  consequence: string;
  requiresHumanConfirmation: boolean;
  status: 'ACTIF' | 'DECLENCHE' | 'INACTIF';
  createdAt: string;
  isDemo: boolean;
}

export interface OsintScenarioAssessment {
  id: string;
  scenarioId: string;
  assessmentText: string;
  supportingIndicators: string[];
  contradictingIndicators: string[];
  unresolvedIndicators: string[];
  confidenceLevel: 'FAIBLE' | 'MODERE' | 'ELEVE' | 'TRES_ELEVE';
  limitations: string[];
  uncertainties: string[];
  reviewDate: string;
  analystId: string;
  createdAt: string;
  isHumanAssessment: boolean;
  isDemo: boolean;
}

export interface OsintScenarioReview {
  id: string;
  scenarioId: string;
  reviewDate: string;
  reviewReason: string;
  previousAssessment: string;
  newAssessment: string;
  changes: string[];
  newEvidenceIds: string[];
  newIndicatorIds: string[];
  newContradictionIds: string[];
  analystId: string;
  isHumanDecision: boolean;
  createdAt: string;
  isDemo: boolean;
}

// LOT 39 - Centre de Suivi des Indicateurs, Réévaluation et Signaux d'Évolution
export interface OsintIndicatorMonitoringPlan {
  id: string;
  prospectiveAssessmentId: string;
  scenarioId: string;
  indicatorId: string;
  requirementId: string;
  questionId: string;
  title: string;
  objective: string;
  baselineDescription: string;
  baselinePeriod: string;
  monitoringWindow: string;
  observationFrequency: string;
  observationMethod: string;
  currentStatus: 'BROUILLON' | 'CADRAGE' | 'BASELINE_DEFINI' | 'EN_SUIVI' | 'OBSERVATIONS_COLLECTEES' | 'SIGNAUX_IDENTIFIES' | 'EN_REVUE' | 'REEVALUATION' | 'CLOTURE' | 'SUSPENDU' | 'OBSOLETE' | 'ANNULE' | 'ARCHIVE';
  observationIds: string[];
  signalIds: string[];
  reviewIds: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isDemo: boolean;
}

export interface OsintIndicatorObservation {
  id: string;
  monitoringPlanId: string;
  indicatorId: string;
  scenarioId: string;
  sourceIds: string[];
  evidenceIds: string[];
  observedAt: string;
  discoveredAt: string;
  processedAt: string;
  value: string;
  unit: string;
  qualitativeObservation: string;
  baselineValue: string;
  deviation: string;
  deviationDirection: 'HAUSSE' | 'BAISSE' | 'STABILITE' | 'VARIATION' | 'APPARITION' | 'DISPARITION' | 'INDETERMINEE';
  observationQuality: 'FAIBLE' | 'MODEREE' | 'ELEVEE' | 'NON_EVALUEE';
  verificationStatus: string;
  isPostT0: boolean;
  isPostDecision: boolean;
  analystId: string;
  createdAt: string;
  isDemo: boolean;
}

export interface OsintMonitoringSignal {
  id: string;
  monitoringPlanId: string;
  indicatorId: string;
  scenarioId: string;
  observationIds: string[];
  type: 'SIGNAL_FAIBLE' | 'SIGNAL_MODERE' | 'SIGNAL_FORT' | 'ANOMALIE' | 'TENDANCE' | 'RUPTURE_TENDANCE' | 'CHANGEMENT_STRUCTUREL' | 'CONTRADICTION' | 'ABSENCE_SIGNIFICATIVE' | 'INFORMATION_INSUFFISANTE';
  title: string;
  description: string;
  signalLevel: string;
  novelty: string;
  persistence: string;
  corroboration: string;
  contradictions: string[];
  assessmentImpact: string;
  status: 'ACTIF' | 'EN_REVUE' | 'CLOTURE';
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export interface OsintMonitoringSignalAssessment {
  id: string;
  signalId: string;
  observationIds: string[];
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  alternativeExplanations: string[];
  assessmentText: string;
  uncertainties: string[];
  limitations: string[];
  analystId: string;
  isHumanAssessment: boolean;
  createdAt: string;
  isDemo: boolean;
}

export interface OsintMonitoringReview {
  id: string;
  monitoringPlanId: string;
  signalIds: string[];
  scenarioId: string;
  triggerReason: string;
  previousAssessment: string;
  currentAssessment: string;
  changes: string[];
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  newGaps: string[];
  recommendedAction: 'MAINTENIR' | 'REEVALUER' | 'REFORMULER' | 'SUSPENDRE' | 'CLOTURER_HUMAINEMENT' | 'ESCALADER_POUR_ANALYSE';
  decision: string;
  analystId: string;
  isHumanDecision: boolean;
  createdAt: string;
  isDemo: boolean;
}

export interface OsintBaselineSnapshot {
  id: string;
  indicatorId: string;
  monitoringPlanId: string;
  periodStart: string;
  periodEnd: string;
  referenceValue: string;
  referenceDescription: string;
  sourceIds: string[];
  createdAt: string;
  createdBy: string;
  isCurrent: boolean;
  isDemo: boolean;
}

export interface OsintMonitoringAudit {
  id: string;
  timestamp: string;
  action: string;
  entityType: string;
  entityId: string;
  actor: string;
  details: string;
  before: any;
  after: any;
  isDemo: boolean;
}

// LOT 40 - Centre de Synthèse Situationnelle et de Situation Courante
export interface OsintSituationSynthesis {
  id: string;
  title: string;
  requirementId: string;
  questionIds: string[];
  geographicScope: string;
  temporalScope: string;
  referenceDate: string;
  situationLevel: 'STRATEGIQUE' | 'OPERATIONNEL' | 'TACTIQUE';
  summary: string;
  keyFacts: string[];
  keyDevelopments: string[];
  analyticalAssessments: string[];
  activeScenarios: string[];
  leadingIndicators: string[];
  openContradictions: string[];
  openGaps: string[];
  pointsToMonitor: string[];
  sourceIds: string[];
  evidenceIds: string[];
  assessmentIds: string[];
  scenarioIds: string[];
  monitoringPlanIds: string[];
  status: 'BROUILLON' | 'EN_CONSTRUCTION' | 'CONSOLIDATION' | 'EN_REVUE' | 'A_VALIDER' | 'VALIDEE' | 'VALIDEE_AVEC_RESERVES' | 'A_REVISER' | 'SUSPENDUE' | 'ANNULEE' | 'ARCHIVEE';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  validatedBy?: string;
  validatedAt?: string;
  isHumanValidated: boolean;
  isDemo: boolean;
}

export interface OsintSituationItem {
  id: string;
  synthesisId: string;
  type: 'FAIT' | 'DEVELOPPEMENT' | 'APPRECIATION' | 'SCENARIO' | 'INDICATEUR' | 'SIGNAL' | 'CONTRADICTION' | 'LACUNE' | 'POINT_SURVEILLANCE' | 'CONTEXTE';
  title: string;
  content: string;
  sourceIds: string[];
  evidenceIds: string[];
  assessmentIds: string[];
  scenarioIds: string[];
  monitoringSignalIds: string[];
  temporalStatus: string;
  importance: 'FAIBLE' | 'MODEREE' | 'ELEVEE' | 'CRITIQUE';
  confidence: 'FAIBLE' | 'MODEREE' | 'ELEVEE';
  createdAt: string;
  isDemo: boolean;
}

export interface OsintSituationChange {
  id: string;
  synthesisId: string;
  previousReferenceDate: string;
  currentReferenceDate: string;
  subject: string;
  previousState: string;
  currentState: string;
  changeType: 'NOUVEAU' | 'DISPARU' | 'RENFORCE' | 'AFFAIBLI' | 'STABLE' | 'MODIFIE' | 'CONTRADICTOIRE' | 'INDETERMINEE';
  supportingEvidenceIds: string[];
  sourceIds: string[];
  assessmentText: string;
  isHumanValidated: boolean;
  createdAt: string;
  isDemo: boolean;
}

export interface OsintSituationGap {
  id: string;
  synthesisId: string;
  description: string;
  importance: string;
  impact: string;
  relatedRequirementIds: string[];
  relatedQuestionIds: string[];
  relatedAssessmentIds: string[];
  relatedScenarioIds: string[];
  status: 'OUVERTE' | 'EN_EXAMEN' | 'PARTIELLEMENT_COMBLEE' | 'NON_RESOLUE' | 'CLOTUREE_HUMAINEMENT';
  createdAt: string;
  isDemo: boolean;
}

export interface OsintSituationValidation {
  id: string;
  synthesisId: string;
  decision: 'VALIDEE' | 'VALIDEE_AVEC_RESERVES' | 'A_REVISER' | 'NON_CONCLUANTE';
  rationale: string;
  approvedBy: string;
  approvedAt: string;
  isHumanDecision: boolean;
  limitations: string[];
  unresolvedContradictions: string[];
  unresolvedGaps: string[];
  createdAt: string;
  isDemo: boolean;
}

export interface OsintSituationAudit {
  id: string;
  timestamp: string;
  action: string;
  entityType: string;
  entityId: string;
  actor: string;
  details: string;
  before: any;
  after: any;
  isDemo: boolean;
}

// LOT 41 - Centre de Pilotage Global et de Gouvernance
export interface OsintGovernanceDashboard {
  id: string;
  referenceDate: string;
  overallStatus: 'OPERATIONNEL' | 'DEGRADE' | 'ATTENTION' | 'INCIDENT' | 'MAINTENANCE';
  activeRequirements: number;
  openResearchPlans: number;
  resultsAwaitingEvaluation: number;
  verificationCasesOpen: number;
  assessmentsAwaitingValidation: number;
  activeScenarios: number;
  monitoredIndicators: number;
  openSignals: number;
  pendingReviews: number;
  openGaps: number;
  openContradictions: number;
  pendingSituationSyntheses: number;
  archivedItems: number;
  obsoleteItems: number;
  traceabilityHealth: number;
  dataIntegrityHealth: number;
  governanceHealth: number;
  persistenceHealth: number;
  lastAuditAt: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export interface OsintGovernanceKpi {
  id: string;
  dashboardId: string;
  category: 'ACTIVITE' | 'COUVERTURE' | 'QUALITE' | 'TRAITEMENT' | 'TRACEABILITE' | 'PERSISTENCE' | 'GOUVERNANCE' | 'SITUATION' | 'SCENARIOS' | 'MONITORING';
  name: string;
  description: string;
  value: number;
  unit: string;
  methodology: string;
  sourceEntityTypes: string[];
  calculatedAt: string;
  status: 'OPTIMAL' | 'ATTENTION' | 'ALERTE';
  limitations: string[];
  isDemo: boolean;
}

export interface OsintGovernanceIssue {
  id: string;
  dashboardId: string;
  type: 'REFERENCE_BROKEN' | 'DATA_INCONSISTENCY' | 'DUPLICATION' | 'TRACEABILITY_GAP' | 'STALE_DATA' | 'MISSING_VALIDATION' | 'ORPHAN_ENTITY' | 'WORKFLOW_INCONSISTENCY' | 'PERSISTENCE_ERROR' | 'EXPORT_INCONSISTENCY' | 'OTHER';
  severity: 'INFORMATION' | 'FAIBLE' | 'MODEREE' | 'IMPORTANTE' | 'CRITIQUE';
  title: string;
  description: string;
  entityType: string;
  entityId: string;
  detectedAt: string;
  status: 'OUVERTE' | 'EN_EXAMEN' | 'RESOLUE';
  recommendedAction: string;
  assignedTo: string;
  resolvedAt?: string;
  resolutionNote?: string;
  isHumanResolution: boolean;
  isDemo: boolean;
}

export interface OsintGovernanceAction {
  id: string;
  dashboardId: string;
  issueId: string;
  actionType: 'REVOIR' | 'VERIFIER' | 'COMPLETER' | 'CORRIGER' | 'REEVALUER' | 'ARCHIVER' | 'ESCALADER_POUR_ANALYSE' | 'AUTRE';
  description: string;
  targetEntityType: string;
  targetEntityId: string;
  assignedTo: string;
  status: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINEE';
  createdAt: string;
  completedAt?: string;
  isHumanAction: boolean;
  isDemo: boolean;
}

// ==========================================
// LOT 42 — CENTRE DE SÉCURITÉ, CONTRÔLE D'ACCÈS ET GOUVERNANCE DES UTILISATEURS
// ==========================================

export type OsintUserStatus = 'ACTIF' | 'SUSPENDU' | 'DESACTIVE' | 'ARCHIVE';

export interface OsintUser {
  id: string;
  username: string;
  displayName: string;
  roleIds: string[];
  status: OsintUserStatus;
  department: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  disabledAt?: string;
  isDemo: boolean;
}

export interface OsintRole {
  id: string;
  name: string;
  description: string;
  permissionIds: string[];
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export type OsintPermissionAction =
  | 'VIEW'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VALIDATE'
  | 'EXPORT'
  | 'ARCHIVE'
  | 'ADMIN'
  | 'ASSIGN'
  | 'REVIEW';

export type OsintPermissionSensitivity = 'NORMALE' | 'SENSIBLE' | 'CRITIQUE';

export interface OsintPermission {
  id: string;
  code: string;
  name: string;
  description: string;
  resource: string;
  action: OsintPermissionAction;
  sensitivity: OsintPermissionSensitivity;
  isSystemPermission: boolean;
  createdAt: string;
  isDemo: boolean;
}

export type OsintSessionStatus = 'ACTIVE' | 'EXPIREE' | 'REVOQUEE' | 'FERMEE';

export interface OsintSession {
  id: string;
  userId: string;
  startedAt: string;
  lastActivityAt: string;
  expiresAt: string;
  status: OsintSessionStatus;
  ipSimulation: string;
  deviceSimulation: string;
  isDemo: boolean;
}

export interface OsintAccessDecision {
  id: string;
  sessionId?: string;
  userId: string;
  resource: string;
  action: string;
  allowed: boolean;
  reason: string;
  roleIds: string[];
  permissionIds: string[];
  timestamp: string;
  isDemo: boolean;
}

export interface OsintSecurityAudit {
  id: string;
  timestamp: string;
  action: string;
  entityType: string;
  entityId: string;
  actorUserId: string;
  success: boolean;
  reason: string;
  before?: any;
  after?: any;
  isDemo: boolean;
}

// ============================================================================
// LOT 43 — CENTRE OPÉRATIONNEL DE GESTION DE CRISE ET CONDUITE DES OPÉRATIONS (COGC)
// ============================================================================

export type OsintCrisisPosture = 
  | 'VEILLE_RENFORCEE' 
  | 'PRE_ALERTE' 
  | 'CRISE_ACTIVE' 
  | 'RETOUR_A_LA_NORMALE';

export type OsintCrisisStatus = 
  | 'OUVERTE' 
  | 'EN_COURS' 
  | 'SOUS_CONTROLE' 
  | 'CLOTUREE' 
  | 'ARCHIVEE';

export type OsintCrisisSeverity = 
  | 'MINEURE' 
  | 'SIGNIFICATIVE' 
  | 'MAJEURE' 
  | 'CRITIQUE';

export type OsintCrisisIncidentType = 
  | 'OBSERVATION_TERRAIN' 
  | 'INCIDENT_MAJEUR' 
  | 'CONTACT_LIAISON' 
  | 'ORDRE_OPERATIONNEL' 
  | 'POINT_DE_SITUATION' 
  | 'ALERTE_TACTIQUE';

export type OsintCrisisUrgency = 
  | 'ROUTINE' 
  | 'URGENT' 
  | 'IMMEDIAT' 
  | 'FLASH';

export type OsintDirectiveStatus = 
  | 'PROPOSEE' 
  | 'DECIDEE' 
  | 'EN_COURS' 
  | 'EXECUTEE' 
  | 'ABANDONNEE';

export type OsintDirectivePriority = 
  | 'NORMALE' 
  | 'HAUTE' 
  | 'URGENTE' 
  | 'VITALE';

export interface OsintCrisisCell {
  id: string;
  code: string;
  title: string;
  theater: string;
  countryIds: string[];
  description: string;
  posture: OsintCrisisPosture;
  status: OsintCrisisStatus;
  severity: OsintCrisisSeverity;
  operationalImpactScore: number; // Calcul arithmétique 0-100 déterministe
  commanderId: string;
  leadAnalystId: string;
  liaisonOfficerId?: string;
  transmissionCoordinatorId?: string;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  closedAt?: string;
  closureJustification?: string;
  closureSummary?: string;
  // Liens de traçabilité amont vérifiables
  synthesisIds: string[];   // LOT 40
  indicatorIds: string[];   // LOT 39
  scenarioIds: string[];    // LOT 38
  hypothesisIds: string[];  // LOT 37
  eventIds: string[];       // LOT 18
  caseIds: string[];        // LOT 27
  requirementIds: string[]; // LOT 34
  isDemo: boolean;
}

export interface OsintCrisisLogEntry {
  id: string;
  crisisId: string;
  timestamp: string;
  incidentType: OsintCrisisIncidentType;
  urgency: OsintCrisisUrgency;
  title: string;
  content: string;
  location?: string;
  authorId: string;
  authorName?: string;
  evidenceIds: string[];
  sourceIds: string[];
  isPostPublication: boolean; // Discipline temporelle : doc postérieure T0
  isDemo: boolean;
}

export interface OsintCrisisDirective {
  id: string;
  crisisId: string;
  title: string;
  description: string;
  targetEntity: string;
  priority: OsintDirectivePriority;
  status: OsintDirectiveStatus;
  deadline?: string;
  proposedBy: string;
  proposedAt: string;
  // Décision humaine obligatoire
  isHumanDecision: boolean;
  decidedBy?: string;
  decidedAt?: string;
  decisionJustification?: string;
  executedBy?: string;
  executedAt?: string;
  executionReport?: string;
  isDemo: boolean;
}

export interface OsintCrisisSitrep {
  id: string;
  crisisId: string;
  number: number;
  title: string;
  classificationLevel: 'DIFFUSION_RESTREINTE' | 'CONFIDENTIEL' | 'SECRET';
  summary: string;
  situationPoints: string[];
  threatDevelopments: string[];
  decisionsAndDirectives: string[];
  recommendations: string[];
  authorId: string;
  validatedBy?: string;
  validatedAt?: string;
  isHumanDecision: boolean;
  publishedAt: string;
  recipients: string[];
  isDemo: boolean;
}

export interface OsintCrisisTraceLink {
  id: string;
  crisisId: string;
  targetLot: string;
  targetEntityType: string;
  targetEntityId: string;
  status: 'VALIDE' | 'RUPTURE_LIEN' | 'ARCHIVE';
  diagnostic: string;
  verifiedAt: string;
  isDemo: boolean;
}

export interface OsintCrisisAudit {
  id: string;
  timestamp: string;
  action: string;
  entityType: string;
  entityId: string;
  actorUserId: string;
  success: boolean;
  reason: string;
  before?: any;
  after?: any;
  isDemo: boolean;
}

// ============================================================================
// LOT 44 — CENTRE DE COORDINATION INTERSERVICES ET DE SUIVI OPÉRATIONNEL (CCISO)
// ============================================================================

export type OsintOrgType =
  | 'MINISTERE'
  | 'FORCES_DEFENSE'
  | 'SERVICES_RENSEIGNEMENT'
  | 'SECURITE_CIVILE'
  | 'ORGANISME_REGIONAL'
  | 'SANTE_LOGISTIQUE'
  | 'AUTRE';

export type OsintOrgStatus = 'ACTIF' | 'EN_ALERTE' | 'RESERVE' | 'INACTIF';

export interface OsintCoordinationOrganization {
  id: string;
  name: string;
  shortName: string;
  type: OsintOrgType;
  status: OsintOrgStatus;
  responsible: string;
  contactReference: string;
  classification: 'DIFFUSION_RESTREINTE' | 'CONFIDENTIEL' | 'SECRET';
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export type OsintTeamStatus =
  | 'OPERATIONNELLE'
  | 'ENGAGEE'
  | 'EN_TRANSIT'
  | 'REPOS'
  | 'INDISPONIBLE';

export type OsintTeamAvailability =
  | 'IMMEDIATE'
  | 'H_PLUS_2'
  | 'H_PLUS_6'
  | 'H_PLUS_24'
  | 'INDISPONIBLE';

export interface OsintOperationalTeam {
  id: string;
  organizationId: string;
  name: string;
  mission: string;
  status: OsintTeamStatus;
  responsible: string;
  locationReference: string;
  availability: OsintTeamAvailability;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export type OsintResourceCategory =
  | 'LOGISTIQUE_TRANSPORT'
  | 'TRANSMISSION_TELECOM'
  | 'SOIN_MEDICAL'
  | 'CARTOGRAPHIE_GEO'
  | 'CAPACITE_ANALYTIQUE'
  | 'SECOURS_SAUVETAGE'
  | 'LIAISON_INTERSERVICES'
  | 'AUTRE';

export type OsintResourceStatus =
  | 'DISPONIBLE'
  | 'PARTIELLEMENT_ENGAGEE'
  | 'ENGAGEE'
  | 'MAINTENANCE'
  | 'INDISPONIBLE';

export interface OsintOperationalResource {
  id: string;
  organizationId: string;
  name: string;
  category: OsintResourceCategory;
  quantity: number;
  availableQuantity: number;
  status: OsintResourceStatus;
  locationReference: string;
  responsible: string;
  classification: 'DIFFUSION_RESTREINTE' | 'CONFIDENTIEL' | 'SECRET';
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export type OsintRequestStatus =
  | 'PROPOSEE'
  | 'EN_ATTENTE'
  | 'VALIDEE'
  | 'AFFECTEE'
  | 'SATISFAITE'
  | 'REJETEE'
  | 'ANNULEE';

export type OsintRequestPriority =
  | 'BASSE'
  | 'NORMALE'
  | 'HAUTE'
  | 'URGENTE'
  | 'CRITIQUE';

export interface OsintResourceRequest {
  id: string;
  operationId: string;
  requestedBy: string;
  resourceCategory: OsintResourceCategory;
  quantity: number;
  priority: OsintRequestPriority;
  justification: string;
  status: OsintRequestStatus;
  requestedAt: string;
  validatedAt?: string;
  validatedBy?: string;
  humanDecision: boolean;
  rejectionReason?: string;
  isDemo: boolean;
}

export type OsintAssignmentStatus = 'ACTIVE' | 'LIBEREE' | 'ANNULEE';

export interface OsintResourceAssignment {
  id: string;
  resourceId: string;
  requestId: string;
  teamId: string;
  quantity: number;
  assignedBy: string;
  assignedAt: string;
  status: OsintAssignmentStatus;
  humanDecision: boolean;
  justification: string;
  isDemo: boolean;
}

export type OsintTaskStatus =
  | 'A_FAIRE'
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'BLOQUEE'
  | 'TERMINEE'
  | 'ANNULEE';

export type OsintTaskPriority =
  | 'BASSE'
  | 'NORMALE'
  | 'HAUTE'
  | 'URGENTE'
  | 'CRITIQUE';

export interface OsintOperationalTask {
  id: string;
  operationId: string;
  title: string;
  description: string;
  responsibleOrganization: string;
  responsibleTeam: string;
  priority: OsintTaskPriority;
  status: OsintTaskStatus;
  startDate: string;
  dueDate: string;
  completedAt?: string;
  dependencyIds: string[];
  completionReport?: string;
  humanValidation: boolean;
  isDemo: boolean;
}

export type OsintIncidentSeverity =
  | 'MINEURE'
  | 'MOYENNE'
  | 'MAJEURE'
  | 'CRITIQUE';

export type OsintIncidentStatus =
  | 'SIGNALE'
  | 'EN_COURS_DE_TRAITEMENT'
  | 'RESOLU'
  | 'CLOS';

export interface OsintCoordinationIncident {
  id: string;
  operationId: string;
  title: string;
  description: string;
  severity: OsintIncidentSeverity;
  detectedAt: string;
  detectedBy: string;
  affectedOrganizations: string[];
  impactScore: number; // 0 à 100 déterministe
  status: OsintIncidentStatus;
  resolution?: string;
  resolvedAt?: string;
  isDemo: boolean;
}

export interface OsintCoordinationAudit {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  previousState?: string;
  newState?: string;
  justification: string;
  humanDecision: boolean;
  classification: 'DIFFUSION_RESTREINTE' | 'CONFIDENTIEL' | 'SECRET';
  isDemo: boolean;
}

export interface OsintCoordinationRupture {
  id: string;
  type: 'RUPTURE_COORDINATION' | 'RUPTURE_LIEN';
  sourceEntity: string;
  targetLot?: string;
  targetId: string;
  diagnostic: string;
  detectedAt: string;
  isDemo: boolean;
}

export interface OsintCoordinationStats {
  totalOrganizations: number;
  activeOrganizations: number;
  engagedTeams: number;
  totalResources: number;
  availableResourcesCount: number;
  availableResourceRate: number; // 0-100%
  pendingRequests: number;
  validatedRequests: number;
  satisfiedRequestRate: number; // 0-100%
  inProgressTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  activeIncidents: number;
  coordinationRuptures: number;
  averageResolutionTimeHours: number;
  resourceSaturationLevel: 'FAIBLE' | 'MODEREE' | 'ELEVEE' | 'SATURATION_CRITIQUE';
}
