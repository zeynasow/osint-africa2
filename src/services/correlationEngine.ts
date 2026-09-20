/**
 * OSINT AFRICA - Moteur de Corrélation & Détection des Signaux Faibles
 * LOT 17 : MOTEUR ANALYTIQUE 100% LOCAL ET HORS-LIGNE
 * 
 * RÈGLE FONDAMENTALE :
 * Une corrélation indique une relation observée entre plusieurs éléments.
 * Elle ne démontre pas une relation causale, une intention ou une menace certaine.
 * Les scores sont transparents, vérifiables et auditables (facteurs explicites sur 8).
 * Aucun appel réseau, aucune API externe, aucun algorithme opaque.
 */

import {
  OsintEvent,
  OsintActor,
  OsintSourceItem,
  Country,
  OsintCorrelation,
  OsintWeakSignal,
  CorrelationFactorMatch,
  CorrelationNetworkNode,
  CorrelationNetworkLink,
  DuplicateCheckResult,
} from '../types';

export interface ScoreCalculationResult {
  score: number;
  maxScore: number;
  matchedFactors: CorrelationFactorMatch[];
  summary: string;
}

/**
 * Calcule le score de corrélation transparent entre deux événements
 * basé sur 8 facteurs explicites (+1 par facteur validé).
 */
export function calculateCorrelationScore(
  evtA: OsintEvent,
  evtB: OsintEvent,
  actors: OsintActor[] = [],
  sources: OsintSourceItem[] = []
): ScoreCalculationResult {
  const matchedFactors: CorrelationFactorMatch[] = [];

  // Facteur 1 : Même catégorie
  const sameCategory =
    Boolean(evtA.category && evtB.category && evtA.category === evtB.category);
  matchedFactors.push({
    factor: 'Même catégorie',
    description: sameCategory
      ? `Tous deux classés en « ${evtA.category} »`
      : `Catégories distinctes (${evtA.category || 'N/A'} vs ${evtB.category || 'N/A'})`,
    matched: sameCategory,
  });

  // Facteur 2 : Même pays
  const sameCountry =
    Boolean(evtA.countryId && evtB.countryId && evtA.countryId === evtB.countryId) ||
    Boolean(evtA.countryName && evtB.countryName && evtA.countryName.toLowerCase() === evtB.countryName.toLowerCase());
  matchedFactors.push({
    factor: 'Même pays',
    description: sameCountry
      ? `Localisés dans le même pays (${evtA.countryName || evtA.countryId})`
      : 'Pays distincts',
    matched: sameCountry,
  });

  // Facteur 3 : Même région
  const sameRegion =
    Boolean(evtA.region && evtB.region && evtA.region === evtB.region);
  matchedFactors.push({
    factor: 'Même région',
    description: sameRegion
      ? `Région géographique commune (${evtA.region})`
      : 'Régions géographiques différentes',
    matched: sameRegion,
  });

  // Facteur 4 : Acteur commun mentionné
  const actorsA = evtA.actors || [];
  const actorsB = evtB.actors || [];
  // Recherche aussi dans les correspondances de noms ou associations
  const commonActor = actorsA.some((a) => actorsB.includes(a)) ||
    actors.some(act => 
      (act.associatedEventIds?.includes(evtA.id) && act.associatedEventIds?.includes(evtB.id))
    );
  matchedFactors.push({
    factor: 'Acteur commun mentionné',
    description: commonActor
      ? 'Présence d’un même acteur mentionné dans les deux fiches'
      : 'Aucun acteur commun identifié dans les données actuelles',
    matched: commonActor,
  });

  // Facteur 5 : Source commune ou convergente
  const sameSource = Boolean(
    (evtA.source?.name && evtB.source?.name && evtA.source.name === evtB.source.name) ||
    (evtA.sourceId && evtB.sourceId && evtA.sourceId === evtB.sourceId)
  );
  matchedFactors.push({
    factor: 'Source commune ou convergence',
    description: sameSource
      ? `Même source d’information (${evtA.source?.name || evtA.sourceId})`
      : 'Sources différentes (opportunité de recoupement indépendant)',
    matched: sameSource,
  });

  // Facteur 6 : Proximité temporelle (<= 7 jours)
  let temporalClose = false;
  try {
    const dateA = new Date(evtA.publishedAt || evtA.date || '').getTime();
    const dateB = new Date(evtB.publishedAt || evtB.date || '').getTime();
    if (!isNaN(dateA) && !isNaN(dateB)) {
      const diffDays = Math.abs(dateA - dateB) / (1000 * 60 * 60 * 24);
      temporalClose = diffDays <= 7;
    }
  } catch {
    temporalClose = false;
  }
  matchedFactors.push({
    factor: 'Proximité temporelle (≤ 7 jours)',
    description: temporalClose
      ? 'Événements observés dans un intervalle resserré de moins de 7 jours'
      : 'Intervalle temporel supérieur à 7 jours',
    matched: temporalClose,
  });

  // Facteur 7 : Relation événementielle explicite
  const explicitLink = Boolean(
    evtA.relatedEventIds?.includes(evtB.id) ||
    evtB.relatedEventIds?.includes(evtA.id)
  );
  matchedFactors.push({
    factor: 'Relation événementielle explicite',
    description: explicitLink
      ? 'Lien de renvoi documentaire préalablement indexé entre les fiches'
      : 'Aucune relation documentaire directe préalablement enregistrée',
    matched: explicitLink,
  });

  // Facteur 8 : Éléments d'évidence concordants
  const evA = (evtA.evidence || []).length > 0;
  const evB = (evtB.evidence || []).length > 0;
  const concordantEvidence = evA && evB;
  matchedFactors.push({
    factor: 'Éléments d’évidence concordants',
    description: concordantEvidence
      ? 'Présence de pièces documentaires ou télémétriques associées'
      : 'Données primaires limitées ou non rattachées',
    matched: concordantEvidence,
  });

  const score = matchedFactors.filter((f) => f.matched).length;

  return {
    score,
    maxScore: 8,
    matchedFactors,
    summary: `Score de corrélation : ${score}/8 (${matchedFactors.filter((f) => f.matched).map((f) => f.factor).join(', ')})`,
  };
}

/**
 * Détection automatique locale de proximités temporelles entre événements
 */
export function detectTemporalCorrelations(events: OsintEvent[]): {
  clusterKey: string;
  events: OsintEvent[];
  timeWindow: string;
}[] {
  const clusters: { clusterKey: string; events: OsintEvent[]; timeWindow: string }[] = [];
  const sorted = [...events].sort((a, b) => {
    const da = new Date(a.publishedAt || a.date || '').getTime() || 0;
    const db = new Date(b.publishedAt || b.date || '').getTime() || 0;
    return da - db;
  });

  // Regroupement glissant sur fenêtres de 5 jours
  const windowMs = 5 * 24 * 3600 * 1000;
  const visited = new Set<string>();

  for (let i = 0; i < sorted.length; i++) {
    const pivot = sorted[i];
    if (visited.has(pivot.id)) continue;

    const pivotTime = new Date(pivot.publishedAt || pivot.date || '').getTime();
    if (isNaN(pivotTime)) continue;

    const group = [pivot];
    visited.add(pivot.id);

    for (let j = i + 1; j < sorted.length; j++) {
      const candidate = sorted[j];
      const candTime = new Date(candidate.publishedAt || candidate.date || '').getTime();
      if (!isNaN(candTime) && Math.abs(candTime - pivotTime) <= windowMs) {
        group.push(candidate);
        visited.add(candidate.id);
      }
    }

    if (group.length >= 2) {
      clusters.push({
        clusterKey: `temporal-${pivot.id}`,
        events: group,
        timeWindow: 'Fenêtre de 5 jours',
      });
    }
  }

  return clusters;
}

/**
 * Détection de concentrations spatiales locales
 */
export function detectSpatialCorrelations(events: OsintEvent[]): {
  countryName: string;
  countryId: string;
  eventCount: number;
  events: OsintEvent[];
}[] {
  const map = new Map<string, { countryName: string; countryId: string; events: OsintEvent[] }>();

  events.forEach((e) => {
    const key = e.countryId || e.countryName || 'Inconnu';
    if (!map.has(key)) {
      map.set(key, {
        countryId: e.countryId || '',
        countryName: e.countryName || key,
        events: [],
      });
    }
    map.get(key)!.events.push(e);
  });

  return Array.from(map.values())
    .filter((g) => g.events.length >= 2)
    .map((g) => ({
      ...g,
      eventCount: g.events.length,
    }))
    .sort((a, b) => b.eventCount - a.eventCount);
}

/**
 * Détection des acteurs récurrents
 */
export function detectActorCorrelations(
  events: OsintEvent[],
  actors: OsintActor[]
): {
  actor: OsintActor;
  associatedEvents: OsintEvent[];
  countriesMentioned: string[];
}[] {
  return actors
    .map((act) => {
      const associated = events.filter((e) => {
        const inEvt = e.actors?.includes(act.name) || e.actors?.includes(act.id);
        const inActor = act.associatedEventIds?.includes(e.id);
        return inEvt || inActor;
      });

      const countries = Array.from(
        new Set(associated.map((e) => e.countryName || e.countryId).filter(Boolean))
      ) as string[];

      return {
        actor: act,
        associatedEvents: associated,
        countriesMentioned: countries,
      };
    })
    .filter((r) => r.associatedEvents.length > 0)
    .sort((a, b) => b.associatedEvents.length - a.associatedEvents.length);
}

/**
 * Détection des convergences de sources indépendantes
 */
export function detectSourceConvergences(events: OsintEvent[]): {
  event: OsintEvent;
  sourcesCount: number;
  sources: string[];
}[] {
  return events
    .filter((e) => (e.associatedSourcesCount && e.associatedSourcesCount > 1) || (e.associatedSourcesList && e.associatedSourcesList.length > 1))
    .map((e) => ({
      event: e,
      sourcesCount: e.associatedSourcesCount || e.associatedSourcesList?.length || 1,
      sources: e.associatedSourcesList || (e.source?.name ? [e.source.name] : []),
    }))
    .sort((a, b) => b.sourcesCount - a.sourcesCount);
}

/**
 * Vérification locale des doublons potentiels (Canonique, titre normalisé, date, source, similarité)
 */
export function checkEventDuplicates(events: OsintEvent[]): DuplicateCheckResult[] {
  const results: DuplicateCheckResult[] = [];

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .trim();

  for (let i = 0; i < events.length; i++) {
    const e1 = events[i];
    const normTitle1 = normalize(e1.title);
    const date1 = (e1.publishedAt || e1.date || '').slice(0, 10);
    const url1 = e1.originalUrl || e1.source?.originalUrlPlaceholder || '';

    for (let j = i + 1; j < events.length; j++) {
      const e2 = events[j];
      const normTitle2 = normalize(e2.title);
      const date2 = (e2.publishedAt || e2.date || '').slice(0, 10);
      const url2 = e2.originalUrl || e2.source?.originalUrlPlaceholder || '';

      const canonicalUrlMatch = Boolean(url1 && url2 && url1 === url2);
      const dateMatch = Boolean(date1 && date2 && date1 === date2);
      const sourceMatch = Boolean(
        (e1.source?.name && e2.source?.name && e1.source.name === e2.source.name) ||
        (e1.sourceId && e2.sourceId && e1.sourceId === e2.sourceId)
      );

      // Calcul simple de distance Jaccard sur les mots du titre
      const words1 = new Set(normTitle1.split(/\s+/).filter((w) => w.length > 2));
      const words2 = new Set(normTitle2.split(/\s+/).filter((w) => w.length > 2));
      let intersection = 0;
      words1.forEach((w) => {
        if (words2.has(w)) intersection++;
      });
      const union = new Set([...words1, ...words2]).size;
      const titleSim = union > 0 ? Math.round((intersection / union) * 100) : 0;
      const normalizedTitleMatch = titleSim >= 70;

      let score = 0;
      if (canonicalUrlMatch) score += 40;
      if (normalizedTitleMatch) score += 35;
      if (dateMatch) score += 15;
      if (sourceMatch) score += 10;

      if (score >= 50) {
        results.push({
          id: `dup-${e1.id}-${e2.id}`,
          primaryEventId: e1.id,
          primaryEventTitle: e1.title,
          candidateEventId: e2.id,
          candidateEventTitle: e2.title,
          similarityScore: score,
          criteriaMatched: {
            canonicalUrlMatch,
            normalizedTitleMatch,
            dateMatch,
            sourceMatch,
            contentHashMatch: canonicalUrlMatch && normalizedTitleMatch,
            contentSimilarityScore: titleSim,
          },
          status: score >= 85 ? 'CONFIRMÉ_DUPLIQUÉ' : 'PROBABLEMENT_DUPLIQUÉ',
          suggestedAction:
            score >= 85
              ? 'Consolider les enregistrements sous la notice la plus complète'
              : 'Examiner manuellement avant regroupement éventuel',
        });
      }
    }
  }

  return results;
}

/**
 * Construit un graphe de nœuds et liens pour la visualisation de réseau analytique
 */
export function buildCorrelationNetwork(
  correlations: OsintCorrelation[],
  events: OsintEvent[],
  actors: OsintActor[],
  sources: OsintSourceItem[],
  countries: Country[]
): {
  nodes: CorrelationNetworkNode[];
  links: CorrelationNetworkLink[];
} {
  const nodeMap = new Map<string, CorrelationNetworkNode>();
  const links: CorrelationNetworkLink[] = [];

  const addNode = (node: CorrelationNetworkNode) => {
    if (!nodeMap.has(node.id)) {
      nodeMap.set(node.id, node);
    } else {
      const existing = nodeMap.get(node.id)!;
      existing.val = Math.max(existing.val, node.val);
    }
  };

  // 1. Nœuds Pays principaux
  countries.slice(0, 10).forEach((c) => {
    addNode({
      id: `country-${c.code}`,
      label: `${c.flag || '🌍'} ${c.name}`,
      type: 'country',
      country: c.name,
      val: 20,
    });
  });

  // 2. Nœuds Acteurs
  actors.forEach((a) => {
    addNode({
      id: `actor-${a.id}`,
      label: a.name.split('[')[0].trim(),
      sublabel: `Acteur (${a.type})`,
      type: 'actor',
      country: a.country,
      val: 18,
    });

    if (a.countryId) {
      links.push({
        source: `actor-${a.id}`,
        target: `country-${a.countryId}`,
        type: 'ACTOR_TO_COUNTRY',
        label: 'Zone d’opération',
        strength: 1,
      });
    }
  });

  // 3. Nœuds Événements sélectionnés (présents dans les corrélations ou récents)
  const eventSubset = events.slice(0, 15);
  eventSubset.forEach((e) => {
    addNode({
      id: `evt-${e.id}`,
      label: e.title.length > 40 ? e.title.slice(0, 37) + '...' : e.title,
      sublabel: e.category,
      type: 'event',
      country: e.countryName,
      category: e.category,
      val: 14,
    });

    if (e.countryId) {
      links.push({
        source: `evt-${e.id}`,
        target: `country-${e.countryId}`,
        type: 'EVENT_TO_EVENT',
        label: 'Localisé en',
        strength: 2,
      });
    }

    if (e.category) {
      const catNodeId = `cat-${e.category}`;
      addNode({
        id: catNodeId,
        label: e.category,
        type: 'category',
        category: e.category,
        val: 12,
      });

      links.push({
        source: catNodeId,
        target: `evt-${e.id}`,
        type: 'CATEGORY_TO_EVENT',
        label: 'Catégorisation',
        strength: 1,
      });
    }
  });

  // 4. Nœuds Sources
  sources.slice(0, 8).forEach((s) => {
    addNode({
      id: `src-${s.id}`,
      label: s.name,
      sublabel: s.type,
      type: 'source',
      country: s.country,
      val: 15,
    });

    if (s.countryId) {
      links.push({
        source: `src-${s.id}`,
        target: `country-${s.countryId}`,
        type: 'SOURCE_TO_COUNTRY',
        label: 'Couverture nationale',
        strength: 1,
      });
    }
  });

  // 5. Relations Acteurs -> Événements
  actors.forEach((act) => {
    (act.associatedEventIds || []).forEach((eId) => {
      const targetId = `evt-${eId}`;
      if (nodeMap.has(targetId)) {
        links.push({
          source: `actor-${act.id}`,
          target: targetId,
          type: 'ACTOR_TO_EVENT',
          label: 'Mentionné dans',
          strength: 3,
        });
      }
    });
  });

  // 6. Liens issus des corrélations
  correlations.slice(0, 10).forEach((cor) => {
    cor.eventIds.forEach((eId, idx) => {
      if (idx > 0) {
        const sourceEvt = `evt-${cor.eventIds[0]}`;
        const targetEvt = `evt-${eId}`;
        if (nodeMap.has(sourceEvt) && nodeMap.has(targetEvt)) {
          links.push({
            source: sourceEvt,
            target: targetEvt,
            type: 'EVENT_TO_EVENT',
            label: `Corrélation (${cor.score}/8)`,
            strength: cor.score,
          });
        }
      }
    });
  });

  return {
    nodes: Array.from(nodeMap.values()),
    links,
  };
}

/**
 * Générateur local de questions analytiques clés pour guider l'investigation sans IA
 */
export function generateAnalyticalQuestions(item: {
  categoryIds?: (string | undefined)[];
  actorIds?: string[];
  sourceIds?: string[];
  countryCodes?: string[];
}): string[] {
  const questions: string[] = [
    'Le phénomène se répète-t-il sur des périodes ou zones adjacentes ?',
    'Les sources d’alerte sont-elles mutuellement indépendantes ou citent-elles une même dépêche ?',
    'Existe-t-il des informations ou versions contradictoires documentées ?',
  ];

  if (item.actorIds && item.actorIds.length > 0) {
    questions.push(
      'L’acteur mentionné a-t-il fait une déclaration officielle confirmant son implication ?',
      'S’agit-il d’une présence opérationnelle démontrée ou d’une simple citation de tiers ?'
    );
  }

  if (item.countryCodes && item.countryCodes.length > 1) {
    questions.push('Existe-t-il une coordination transfrontalière ou s’agit-il d’effets miroirs séparés ?');
  }

  questions.push('Quelles informations primaires manquent encore pour consolider le niveau de certitude ?');

  return questions;
}

/**
 * Recommandations méthodologiques de vérification OSINT
 */
export function generateVerificationRecommendations(type: string): string[] {
  return [
    'Rechercher une seconde source primaire indépendante non affiliée à la première.',
    'Vérifier la date exacte de prise de vue ou de première parution des médias associés.',
    'Vérifier la localisation géographique précise à l’aide des toponymes et données d’imagerie.',
    'Comparer avec les événements et déclarations institutionnelles antérieures.',
    'Contrôler si plusieurs articles de presse ne constituent pas une simple reprise de dépêche agence.',
  ];
}
