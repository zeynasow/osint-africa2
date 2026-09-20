cat << 'INNER_EOF' >> src/types.ts

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
INNER_EOF
