import {
  OsintProvenance,
  OsintIntelligenceReport,
  OsintEvent,
  OsintAnalysis,
  OsintEvidence,
  OsintHypothesis,
} from '../types';

export interface AuditCriterion {
  id: string;
  name: string;
  points: number;
  maxPoints: number;
  status: 'CONFORME' | 'PARTIEL' | 'MANQUANT';
  detail: string;
}

export interface QualityScoreBreakdown {
  score: number; // 0 - 100
  criteria: AuditCriterion[];
  verdict: 'EXCELLENT' | 'SATISFAISANT' | 'INSUFFISANT' | 'CRITIQUE STRUCTUREL';
  notice: string;
}

export interface AuditGap {
  id: string;
  gapType:
    | 'SOURCE_ABSENTE'
    | 'DATE_ABSENTE'
    | 'URL_ABSENTE'
    | 'PREUVE_ABSENTE'
    | 'ANALYSE_SANS_EVENEMENT'
    | 'HYPOTHESE_SANS_PREUVE'
    | 'CORRELATION_SANS_SOURCE'
    | 'FUSION_SANS_RELATION'
    | 'RAPPORT_SANS_PROVENANCE'
    | 'INFORMATION_NON_CONFIRMEE'
    | 'CONTRADICTION_NON_ARBITREE';
  title: string;
  entityType: 'event' | 'source' | 'evidence' | 'analysis' | 'hypothesis' | 'report' | 'fusion' | 'correlation';
  entityId: string;
  entityTitle: string;
  severity: 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ' | 'CRITIQUE STRUCTUREL';
  details: string;
  suggestedQuestions: string[];
}

export type AuditPriorityLevel = 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ' | 'CRITIQUE STRUCTUREL';

export interface AuditPriorityItem {
  id: string;
  entityId: string;
  entityType: string;
  title: string;
  priority: AuditPriorityLevel;
  trigger: string;
  gapsCount: number;
  qualityScore: number;
  traceability: 'TRAÇABILITÉ COMPLÈTE' | 'TRAÇABILITÉ INCOMPLÈTE';
}

/**
 * Calcul du Score de Qualité Documentaire (0 - 100).
 * IMPORTANT : Ce score est un INDICATEUR DE QUALITÉ DOCUMENTAIRE STRICT.
 * Il ne mesure en aucun cas la "vérité" ou la probabilité que l'information soit vraie.
 * Distinction doctrinale :
 * QUALITÉ DOCUMENTAIRE (rigueur du dossier)
 * ≠ FIABILITÉ (crédibilité de l'émetteur)
 * ≠ CONFIANCE (poids du faisceau indiciaire)
 * ≠ CERTITUDE (degré de validation factuelle).
 */
export const calculateQualityScore = (item: any, provenance: OsintProvenance | undefined): number => {
  if (!provenance && !item) return 10;
  const breakdown = getQualityScoreBreakdown(item, provenance);
  return breakdown.score;
};

export const getQualityScoreBreakdown = (
  item: any,
  provenance: OsintProvenance | undefined
): QualityScoreBreakdown => {
  const criteria: AuditCriterion[] = [];

  // 1. Identification de la source (Nom, Type, Canal) (25 pts)
  const hasSource = Boolean(
    provenance?.sourceId ||
    provenance?.sourceName ||
    item?.source?.name ||
    (item?.sourceIds && item.sourceIds.length > 0) ||
    item?.sourceId
  );
  const hasSourceUrl = Boolean(provenance?.sourceUrl || item?.source?.originalUrlPlaceholder || item?.url);

  if (hasSource && hasSourceUrl) {
    criteria.push({
      id: 'crit-source',
      name: 'Identification de la source & URL d’origine',
      points: 25,
      maxPoints: 25,
      status: 'CONFORME',
      detail: 'Source formellement identifiée avec référence/URL d’accès originelle.',
    });
  } else if (hasSource) {
    criteria.push({
      id: 'crit-source',
      name: 'Identification de la source (URL manquante)',
      points: 15,
      maxPoints: 25,
      status: 'PARTIEL',
      detail: 'Source nommée mais URL/référence primaire manquante.',
    });
  } else {
    criteria.push({
      id: 'crit-source',
      name: 'Identification de la source',
      points: 0,
      maxPoints: 25,
      status: 'MANQUANT',
      detail: 'Aucun identifiant de source primaire documenté.',
    });
  }

  // 2. Horodatage & Traçabilité Temporelle (20 pts)
  const hasObsDate = Boolean(provenance?.observationDate || item?.date || item?.createdAt);
  const hasPubDate = Boolean(provenance?.publicationDate || item?.dateAcquired || item?.updatedAt);

  if (hasObsDate && hasPubDate) {
    criteria.push({
      id: 'crit-time',
      name: 'Horodatage complet (Observation & Ingestion)',
      points: 20,
      maxPoints: 20,
      status: 'CONFORME',
      detail: 'Dates d’observation et de publication/ingestion précisément archivées.',
    });
  } else if (hasObsDate || hasPubDate) {
    criteria.push({
      id: 'crit-time',
      name: 'Horodatage partiel',
      points: 10,
      maxPoints: 20,
      status: 'PARTIEL',
      detail: 'Une seule des dates (observation ou publication) est renseignée.',
    });
  } else {
    criteria.push({
      id: 'crit-time',
      name: 'Horodatage temporel',
      points: 0,
      maxPoints: 20,
      status: 'MANQUANT',
      detail: 'Absence totale de datation temporelle vérifiable.',
    });
  }

  // 3. Évaluation Méthodologique (Code Amirauté / Fiabilité) (20 pts)
  const hasReliability = Boolean(
    (provenance?.reliability && provenance.reliability !== 'F' && provenance.reliability !== 'Non évalué') ||
    (item?.source?.reliability && item?.source?.reliability !== 'F')
  );
  const hasConfidence = Boolean(
    (provenance?.confidence && provenance.confidence !== 'Non évalué') ||
    (item?.confidenceLevel && item.confidenceLevel !== 'Non évalué') ||
    (item?.confidence && item.confidence !== 'Non évalué')
  );

  if (hasReliability && hasConfidence) {
    criteria.push({
      id: 'crit-eval',
      name: 'Évaluation méthodologique Amirauté / Confiance',
      points: 20,
      maxPoints: 20,
      status: 'CONFORME',
      detail: 'Cotation formelle de la fiabilité de la source et niveau de confiance renseignés.',
    });
  } else if (hasReliability || hasConfidence) {
    criteria.push({
      id: 'crit-eval',
      name: 'Évaluation méthodologique incomplète',
      points: 10,
      maxPoints: 20,
      status: 'PARTIEL',
      detail: 'Seul l’un des deux indices (fiabilité ou niveau de confiance) est documenté.',
    });
  } else {
    criteria.push({
      id: 'crit-eval',
      name: 'Évaluation méthodologique',
      points: 0,
      maxPoints: 20,
      status: 'MANQUANT',
      detail: 'Non évalué selon la grille standardisée.',
    });
  }

  // 4. Chaîne de Traçabilité & Références Parentes (20 pts)
  const hasParent = Boolean(
    provenance?.parentObjectId ||
    item?.analysisId ||
    item?.eventId ||
    item?.reportId ||
    (item?.eventIds && item.eventIds.length > 0) ||
    (item?.evidenceIds && item.evidenceIds.length > 0)
  );
  const hasOriginalRef = Boolean(provenance?.originalReference || item?.reference || item?.id);

  if (hasParent && hasOriginalRef) {
    criteria.push({
      id: 'crit-trace',
      name: 'Traçabilité relationnelle ascendante & référence',
      points: 20,
      maxPoints: 20,
      status: 'CONFORME',
      detail: 'Rattachement explicite à un nœud parent et identifiant unique archivé.',
    });
  } else if (hasOriginalRef) {
    criteria.push({
      id: 'crit-trace',
      name: 'Référence enregistrée sans parent direct',
      points: 10,
      maxPoints: 20,
      status: 'PARTIEL',
      detail: 'Identifiant présent mais relation ascendante manquante ou orpheline.',
    });
  } else {
    criteria.push({
      id: 'crit-trace',
      name: 'Traçabilité relationnelle',
      points: 0,
      maxPoints: 20,
      status: 'MANQUANT',
      detail: 'Objet orphelin sans ancrage dans la chaîne documentaire.',
    });
  }

  // 5. Complétude rédactionnelle & distinction des faits (15 pts)
  const hasDescription = Boolean(item?.summary || item?.description || item?.executiveSummary || item?.statement);
  const hasFactDistinction = Boolean(
    (item?.establishedFacts && item.establishedFacts.length > 0) ||
    item?.verificationStatus ||
    provenance?.transformationType
  );

  if (hasDescription && hasFactDistinction) {
    criteria.push({
      id: 'crit-content',
      name: 'Distinction faits / hypothèses & substance',
      points: 15,
      maxPoints: 15,
      status: 'CONFORME',
      detail: 'Corps descriptif substantiel distinguant clairement les faits matériels des interprétations.',
    });
  } else if (hasDescription) {
    criteria.push({
      id: 'crit-content',
      name: 'Description présente sans catégorisation formelle',
      points: 8,
      maxPoints: 15,
      status: 'PARTIEL',
      detail: 'Description existante mais sans séparation formelle des faits établis et des informations rapportées.',
    });
  } else {
    criteria.push({
      id: 'crit-content',
      name: 'Complétude du contenu',
      points: 0,
      maxPoints: 15,
      status: 'MANQUANT',
      detail: 'Contenu descriptif quasi inexistant ou non structuré.',
    });
  }

  const score = criteria.reduce((sum, c) => sum + c.points, 0);

  let verdict: 'EXCELLENT' | 'SATISFAISANT' | 'INSUFFISANT' | 'CRITIQUE STRUCTUREL' = 'INSUFFISANT';
  if (score >= 85) verdict = 'EXCELLENT';
  else if (score >= 60) verdict = 'SATISFAISANT';
  else if (score >= 35) verdict = 'INSUFFISANT';
  else verdict = 'CRITIQUE STRUCTUREL';

  return {
    score,
    criteria,
    verdict,
    notice: 'INDICATEUR DE QUALITÉ DOCUMENTAIRE — Mesure la rigueur archivistique et la traçabilité (≠ Fiabilité ≠ Confiance ≠ Certitude).',
  };
};

/**
 * Détecte les lacunes documentaires et méthodologiques réelles sur un jeu d'objets.
 */
export const detectGaps = (item: any, provenance?: OsintProvenance): string[] => {
  const gaps: string[] = [];
  if (!item && !provenance) return ['INFORMATION MANQUANTE'];

  // Source absente
  const hasSource = Boolean(
    provenance?.sourceId ||
    item?.source?.name ||
    (item?.sourceIds && item.sourceIds.length > 0) ||
    item?.sourceId
  );
  if (!hasSource) {
    gaps.push('SOURCE_ABSENTE : Aucune source d’origine documentée');
  }

  // Date absente
  const hasDate = Boolean(provenance?.observationDate || provenance?.publicationDate || item?.date || item?.createdAt);
  if (!hasDate) {
    gaps.push('DATE_ABSENTE : Aucune date temporelle vérifiable');
  }

  // URL absente
  const hasUrl = Boolean(provenance?.sourceUrl || item?.source?.originalUrlPlaceholder || item?.url);
  if (!hasUrl && hasSource) {
    gaps.push('URL_ABSENTE : Référence d’accès primaire non renseignée');
  }

  // Preuve absente pour analyse
  if (item?.analysisId && !item?.supportingEvidenceIds?.length && !item?.evidenceIds?.length) {
    gaps.push('PREUVE_ABSENTE : Assertion sans élément de preuve matérielle rattaché');
  }

  // Analyse sans événement
  if (item?.objectType === 'analysis' && (!item?.eventIds || item.eventIds.length === 0)) {
    gaps.push('ANALYSE_SANS_EVENEMENT : Analyse théorique sans ancrage événementiel précis');
  }

  // Hypothèse sans preuve
  if (item?.supportingEvidenceIds && item.supportingEvidenceIds.length === 0) {
    gaps.push('HYPOTHESE_SANS_PREUVE : Hypothèse formulée sans faisceau de preuves documenté');
  }

  // Rapport sans provenance
  if (item?.reportType && !provenance) {
    gaps.push('RAPPORT_SANS_PROVENANCE : Dossier de production sans registre de provenance archivé');
  }

  // Information non confirmée
  if (item?.unconfirmedInformation && item.unconfirmedInformation.length > 0) {
    gaps.push(`INFORMATION_NON_CONFIRMEE : ${item.unconfirmedInformation.length} mention(s) non confirmée(s)`);
  }

  return gaps;
};

/**
 * Analyse globale des lacunes sur les objets du ViewModel.
 */
export const scanAllGaps = (params: {
  events: OsintEvent[];
  reports: OsintIntelligenceReport[];
  analyses: OsintAnalysis[];
  evidence: OsintEvidence[];
  hypotheses: OsintHypothesis[];
  provenances: OsintProvenance[];
}): AuditGap[] => {
  const result: AuditGap[] = [];

  // 1. Événements sans source
  params.events.forEach((evt) => {
    const prov = params.provenances.find((p) => p.objectId === evt.id);
    const hasSource = Boolean(evt.source?.name || (evt as any).sourceId || (evt as any).sourceIds?.length || prov?.sourceId);
    if (!hasSource) {
      result.push({
        id: `gap-evt-nosrc-${evt.id}`,
        gapType: 'SOURCE_ABSENTE',
        title: 'Événement sans source primaire identifiée',
        entityType: 'event',
        entityId: evt.id,
        entityTitle: evt.title,
        severity: 'CRITIQUE STRUCTUREL',
        details: 'L’événement a été consigné sans qu’aucun émetteur, agence, capteur ou canal ne soit rattaché.',
        suggestedQuestions: [
          'Quelle est la source primaire à l’origine de ce signalement ?',
          'S’agit-il d’une rumeur locale ou d’un fait directement observé par un tiers ?',
          'Existe-t-il une trace numérique ou un document attestant l’occurrence de l’événement ?',
        ],
      });
    }

    // Événement sans date
    if (!evt.date) {
      result.push({
        id: `gap-evt-nodate-${evt.id}`,
        gapType: 'DATE_ABSENTE',
        title: 'Événement sans horodatage chronologique',
        entityType: 'event',
        entityId: evt.id,
        entityTitle: evt.title,
        severity: 'ÉLEVÉ',
        details: 'Aucune date de survenance n’est enregistrée.',
        suggestedQuestions: [
          'À quelle date exacte le phénomène s’est-il produit ?',
          'S’agit-il d’un événement ponctuel ou d’un processus étalé dans le temps ?',
        ],
      });
    }
  });

  // 2. Hypothèses sans preuves matérielles
  params.hypotheses.forEach((hyp) => {
    if (!hyp.supportingEvidenceIds || hyp.supportingEvidenceIds.length === 0) {
      result.push({
        id: `gap-hyp-noev-${hyp.id}`,
        gapType: 'HYPOTHESE_SANS_PREUVE',
        title: 'Hypothèse analytique sans élément de preuve rattaché',
        entityType: 'hypothesis',
        entityId: hyp.id,
        entityTitle: hyp.title,
        severity: 'ÉLEVÉ',
        details: 'Cette hypothèse ne s’appuie sur aucune preuve matérielle (IMINT, SIGINT, SOCMINT) consignée.',
        suggestedQuestions: [
          'Quelle preuve matérielle soutient cette affirmation ?',
          'S’agit-il d’une déduction logique ou d’une spéculation non étayée ?',
          'Quelles démarches de collecte permettraient d’infirmer ou de corroborer cette piste ?',
        ],
      });
    }
  });

  // 3. Preuves sans source URL
  params.evidence.forEach((ev) => {
    const prov = params.provenances.find((p) => p.objectId === ev.id);
    if (!prov?.sourceUrl && !(ev as any).url) {
      result.push({
        id: `gap-ev-nourl-${ev.id}`,
        gapType: 'URL_ABSENTE',
        title: 'Preuve sans référence numérique d’origine (URL/Fichier)',
        entityType: 'evidence',
        entityId: ev.id,
        entityTitle: ev.title,
        severity: 'MOYEN',
        details: 'La preuve mentionne un support mais sans identifiant d’accès ou trace numérique vérifiable.',
        suggestedQuestions: [
          'Quelle est l’URL ou l’empreinte de fichier (hash) permettant de consulter la pièce originale ?',
          'La source est-elle toujours accessible en ligne ou archivée ?',
        ],
      });
    }
  });

  // 4. Rapports incomplets ou sans provenance
  params.reports.forEach((rep) => {
    const prov = params.provenances.find((p) => p.objectId === rep.id);
    if (!prov) {
      result.push({
        id: `gap-rep-noprov-${rep.id}`,
        gapType: 'RAPPORT_SANS_PROVENANCE',
        title: 'Rapport de renseignement sans enregistrement de provenance',
        entityType: 'report',
        entityId: rep.id,
        entityTitle: rep.title,
        severity: 'CRITIQUE STRUCTUREL',
        details: 'Ce rapport ne dispose pas d’entrée dédiée dans le registre d’audit documentaire.',
        suggestedQuestions: [
          'La chaîne de provenance du rapport a-t-elle été vérifiée avant validation ?',
          'Qui est l’autorité ayant consolidé ces conclusions ?',
        ],
      });
    }

    if (rep.unconfirmedInformation && rep.unconfirmedInformation.length > 0) {
      result.push({
        id: `gap-rep-unconf-${rep.id}`,
        gapType: 'INFORMATION_NON_CONFIRMEE',
        title: `Rapport comportant ${rep.unconfirmedInformation.length} élément(s) non confirmé(s)`,
        entityType: 'report',
        entityId: rep.id,
        entityTitle: rep.title,
        severity: 'MOYEN',
        details: `Présence d’informations non confirmées : "${rep.unconfirmedInformation.slice(0, 1).join(' ; ')}..."`,
        suggestedQuestions: [
          'Existe-t-il une seconde source indépendante pour confirmer ces mentions ?',
          'Ces éléments doivent-ils demeurer dans le corps du rapport ou être requalifiés en hypothèses ?',
        ],
      });
    }
  });

  return result;
};

/**
 * Génération dynamique des questions de vérification adaptées.
 * "Ne générer une question que lorsqu'elle correspond réellement à une lacune."
 */
export const generateVerificationQuestions = (item: any, gaps: string[]): string[] => {
  const questions: string[] = [];

  if (gaps.some((g) => g.includes('SOURCE_ABSENTE'))) {
    questions.push('Quelle est la source primaire à l’origine de cette déclaration ?');
    questions.push('Cette information dispose-t-elle d’une source indépendante vérifiable ?');
  }
  if (gaps.some((g) => g.includes('URL_ABSENTE'))) {
    questions.push('Existe-t-il un permalien, un DOI ou une empreinte cryptographique de la source originale ?');
  }
  if (gaps.some((g) => g.includes('PREUVE_ABSENTE') || g.includes('HYPOTHESE_SANS_PREUVE'))) {
    questions.push('Quelle preuve tangible (image, relevé capteur, document signé) soutient cette affirmation ?');
  }
  if (gaps.some((g) => g.includes('DATE_ABSENTE'))) {
    questions.push('Quelle est la fenêtre temporelle exacte (horodatage certain ou estimé) ?');
  }
  if (gaps.some((g) => g.includes('INFORMATION_NON_CONFIRMEE'))) {
    questions.push('La conclusion est-elle proportionnée aux éléments probatoires disponibles ?');
    questions.push('L’acteur est-il seulement mentionné ou réellement impliqué de manière avérée ?');
  }
  if (gaps.some((g) => g.includes('RAPPORT_SANS_PROVENANCE') || g.includes('INCOMPLETE'))) {
    questions.push('La chaîne de provenance est-elle complète depuis l’acquisition brute jusqu’à la conclusion ?');
  }
  if (gaps.some((g) => g.includes('CONTRADICTION'))) {
    questions.push('Existe-t-il une information contradictoire et quel capteur neutre permettrait de trancher ?');
  }

  // Si aucune question spécifique générée
  if (questions.length === 0) {
    questions.push('La qualification descriptive respecte-t-elle la séparation faits/analyses ?');
  }

  return Array.from(new Set(questions));
};

/**
 * Détection locale de doublons potentiels (interdiction stricte de suppression automatique).
 */
export interface PotentialDuplicateResult {
  id: string;
  sourceItemTitle: string;
  targetItemTitle: string;
  classification: 'UNIQUE' | 'DOUBLON PROBABLE' | 'CHEVAUCHEMENT' | 'À EXAMINER';
  similarityPercentage: number;
  matchedCriteria: string[];
  recommendation: string;
}

export const detectDuplicates = (events: OsintEvent[]): PotentialDuplicateResult[] => {
  const results: PotentialDuplicateResult[] = [];

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const e1 = events[i];
      const e2 = events[j];

      const normTitle1 = e1.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normTitle2 = e2.title.toLowerCase().replace(/[^a-z0-9]/g, '');

      const sameCountry = e1.countryId === e2.countryId;
      const sameDate = e1.date === e2.date;
      const titleOverlap = normTitle1.includes(normTitle2.substring(0, 15)) || normTitle2.includes(normTitle1.substring(0, 15));

      const matched: string[] = [];
      if (sameCountry) matched.push('Pays identique');
      if (sameDate) matched.push('Date concordante');
      if (titleOverlap) matched.push('Chevauchement lexical');
      if (e1.source?.name === e2.source?.name) matched.push('Même émetteur');

      if (sameCountry && sameDate && titleOverlap) {
        results.push({
          id: `dup-${e1.id}-${e2.id}`,
          sourceItemTitle: e1.title,
          targetItemTitle: e2.title,
          classification: 'DOUBLON PROBABLE',
          similarityPercentage: 89,
          matchedCriteria: matched,
          recommendation: 'Maintenir les deux enregistrements en liant les identifiants en relation secondaire. Aucune suppression automatique.',
        });
      } else if (sameCountry && sameDate && matched.length >= 2) {
        results.push({
          id: `dup-${e1.id}-${e2.id}`,
          sourceItemTitle: e1.title,
          targetItemTitle: e2.title,
          classification: 'CHEVAUCHEMENT',
          similarityPercentage: 65,
          matchedCriteria: matched,
          recommendation: 'Examiner la granularité géographique pour déterminer s’il s’agit du même incident ou d’actions simultanées.',
        });
      }
    }
  }

  return results;
};
