/**
 * OSINT AFRICA - MOTEUR DE FUSION DU RENSEIGNEMENT OSINT
 * LOT 18 : Fusion Engine & Cross-Entity Intelligence Matrix
 * 
 * Strictement hors-ligne, calculs transparents et audités.
 * Ne produit aucune conclusion automatique. Met à disposition de l'analyste
 * les matrices, graphes et chaînes de traçabilité.
 */

import {
  OsintFusionCase,
  FusionMatrixRow,
  FusionNetworkNode,
  FusionNetworkLink,
  Country,
  OsintEvent,
  OsintSourceItem,
  OsintActor,
  OsintCorrelation,
  OsintWeakSignal,
} from '../types';

export interface FusionKPIs {
  openCasesCount: number;
  associatedEventsCount: number;
  associatedSourcesCount: number;
  associatedActorsCount: number;
  associatedCorrelationsCount: number;
  associatedWeakSignalsCount: number;
  contradictionsCount: number;
  unconfirmedInfoCount: number;
  criticalPriorityCount: number;
}

export function calculateFusionKPIs(
  cases: OsintFusionCase[],
  allEvents: OsintEvent[],
  allSources: OsintSourceItem[],
  allActors: OsintActor[],
  allCorrelations: OsintCorrelation[],
  allWeakSignals: OsintWeakSignal[]
): FusionKPIs {
  const activeCases = cases.filter(c => c.status !== 'CLOS');

  const uniqueEventIds = new Set<string>();
  const uniqueSourceIds = new Set<string>();
  const uniqueActorIds = new Set<string>();
  const uniqueCorrelationIds = new Set<string>();
  const uniqueWeakSignalIds = new Set<string>();

  let totalContradictions = 0;
  let totalUnconfirmed = 0;
  let criticalCount = 0;

  activeCases.forEach(c => {
    c.eventIds.forEach(id => uniqueEventIds.add(id));
    c.sourceIds.forEach(id => uniqueSourceIds.add(id));
    c.actorIds.forEach(id => uniqueActorIds.add(id));
    c.correlationIds.forEach(id => uniqueCorrelationIds.add(id));
    c.weakSignalIds.forEach(id => uniqueWeakSignalIds.add(id));

    totalContradictions += (c.contradictions || []).length;
    totalUnconfirmed += (c.unconfirmedInformation || []).length;

    if (c.priority === 'CRITIQUE') {
      criticalCount++;
    }
  });

  return {
    openCasesCount: activeCases.length,
    associatedEventsCount: uniqueEventIds.size,
    associatedSourcesCount: uniqueSourceIds.size,
    associatedActorsCount: uniqueActorIds.size,
    associatedCorrelationsCount: uniqueCorrelationIds.size,
    associatedWeakSignalsCount: uniqueWeakSignalIds.size,
    contradictionsCount: totalContradictions,
    unconfirmedInfoCount: totalUnconfirmed,
    criticalPriorityCount: criticalCount,
  };
}

export function generateFusionMatrix(
  cases: OsintFusionCase[],
  countries: Country[],
  events: OsintEvent[],
  sources: OsintSourceItem[],
  actors: OsintActor[],
  correlations: OsintCorrelation[],
  weakSignals: OsintWeakSignal[]
): FusionMatrixRow[] {
  // Collect all country codes that appear in fusion cases or have events
  const countryCodeSet = new Set<string>();
  cases.forEach(c => c.countryCodes.forEach(code => countryCodeSet.add(code.toUpperCase())));
  events.slice(0, 30).forEach(e => {
    if (e.country) {
      const match = countries.find(c => c.name.toLowerCase() === e.country.toLowerCase() || c.id.toLowerCase() === e.country.toLowerCase());
      if (match) countryCodeSet.add(match.id.toUpperCase());
    }
  });

  const matrixRows: FusionMatrixRow[] = [];

  countryCodeSet.forEach(code => {
    const countryObj = countries.find(c => c.id.toUpperCase() === code || c.name.toUpperCase() === code);
    const countryName = countryObj ? countryObj.name : code;

    // Filter entities related to this country
    const countryCases = cases.filter(c => c.countryCodes.map(x => x.toUpperCase()).includes(code));
    
    // Events in this country
    const countryEvents = events.filter(e => {
      if (!e.country) return false;
      return e.country.toUpperCase() === code || (countryObj && e.country.toLowerCase() === countryObj.name.toLowerCase());
    });

    // Sources associated
    const countrySources = sources.filter(s => {
      return s.country && (s.country.toUpperCase() === code || (countryObj && s.country.toLowerCase() === countryObj.name.toLowerCase()));
    });

    // Actors in this country
    const countryActors = actors.filter(a => {
      return a.countryId?.toUpperCase() === code || (a.country && countryObj && a.country.toLowerCase() === countryObj.name.toLowerCase());
    });

    // Correlations
    const countryCorrelations = correlations.filter(corr => {
      return corr.countryCodes.map(x => x.toUpperCase()).includes(code);
    });

    // Weak signals
    const countryWeakSignals = weakSignals.filter(sig => {
      return sig.countryCodes.map(x => x.toUpperCase()).includes(code);
    });

    // Contradictions check in country cases
    const contradictionsInCountry = countryCases.some(c => (c.contradictions || []).length > 0);

    // Calculate reported concordance ratio
    let totalReported = 0;
    let concordantCount = 0;
    countryCases.forEach(c => {
      (c.reportedInformation || []).forEach(rep => {
        totalReported++;
        if (rep.concordance === 'CONCORDANTE') concordantCount++;
      });
    });

    const concordanceRatio = totalReported > 0 ? Math.round((concordantCount / totalReported) * 100) : 85;

    matrixRows.push({
      countryCode: code,
      countryName,
      hasSources: countrySources.length > 0,
      sourcesCount: countrySources.length,
      hasEvents: countryEvents.length > 0,
      eventsCount: countryEvents.length,
      hasActors: countryActors.length > 0,
      actorsCount: countryActors.length,
      hasCorrelations: countryCorrelations.length > 0,
      correlationsCount: countryCorrelations.length,
      hasWeakSignals: countryWeakSignals.length > 0,
      weakSignalsCount: countryWeakSignals.length,
      hasContradictions: contradictionsInCountry,
      concordanceRatio,
    });
  });

  return matrixRows.sort((a, b) => b.eventsCount + b.correlationsCount - (a.eventsCount + a.correlationsCount));
}

export function buildFusionNetworkGraph(
  caseItem: OsintFusionCase,
  allEvents: OsintEvent[],
  allSources: OsintSourceItem[],
  allActors: OsintActor[],
  allCorrelations: OsintCorrelation[],
  allWeakSignals: OsintWeakSignal[]
): { nodes: FusionNetworkNode[]; links: FusionNetworkLink[] } {
  const nodes: FusionNetworkNode[] = [];
  const links: FusionNetworkLink[] = [];
  const addedNodeIds = new Set<string>();

  const addNode = (node: FusionNetworkNode) => {
    if (!addedNodeIds.has(node.id)) {
      addedNodeIds.add(node.id);
      nodes.push(node);
    }
  };

  // Central Case Node
  const caseNodeId = `case-${caseItem.id}`;
  addNode({
    id: caseNodeId,
    label: caseItem.title.slice(0, 30) + '...',
    sublabel: `Situation (${caseItem.status})`,
    type: 'case',
    status: caseItem.situationState,
    val: 32,
  });

  // Country Nodes
  caseItem.countryCodes.forEach(code => {
    const cId = `country-${code}`;
    addNode({
      id: cId,
      label: code,
      sublabel: 'Pays',
      type: 'country',
      country: code,
      val: 20,
    });
    links.push({
      source: caseNodeId,
      target: cId,
      type: 'CASE_TO_COUNTRY',
      label: 'Localisation',
    });
  });

  // Event Nodes
  caseItem.eventIds.forEach(eId => {
    const ev = allEvents.find(e => e.id === eId);
    const nId = `event-${eId}`;
    addNode({
      id: nId,
      label: ev ? ev.title.slice(0, 24) + '...' : eId,
      sublabel: 'Événement',
      type: 'event',
      val: 16,
    });
    links.push({
      source: caseNodeId,
      target: nId,
      type: 'CASE_TO_EVENT',
      label: 'Événement documenté',
    });
  });

  // Source Nodes
  caseItem.sourceIds.forEach(sId => {
    const src = allSources.find(s => s.id === sId);
    const nId = `source-${sId}`;
    addNode({
      id: nId,
      label: src ? src.name : sId,
      sublabel: src ? src.type : 'Source',
      type: 'source',
      val: 14,
    });
    links.push({
      source: caseNodeId,
      target: nId,
      type: 'CASE_TO_SOURCE',
      label: 'Source contributrice',
    });
  });

  // Actor Nodes
  caseItem.actorIds.forEach(aId => {
    const act = allActors.find(a => a.id === aId);
    const nId = `actor-${aId}`;
    addNode({
      id: nId,
      label: act ? act.name.slice(0, 24) + '...' : aId,
      sublabel: 'Acteur mentionné',
      type: 'actor',
      val: 18,
    });
    links.push({
      source: caseNodeId,
      target: nId,
      type: 'CASE_TO_ACTOR',
      label: 'Acteur associé',
    });
  });

  // Correlation Nodes
  caseItem.correlationIds.forEach(cId => {
    const corr = allCorrelations.find(c => c.id === cId);
    const nId = `correlation-${cId}`;
    addNode({
      id: nId,
      label: corr ? corr.title.slice(0, 26) + '...' : cId,
      sublabel: 'Corrélation multi-critères',
      type: 'correlation',
      val: 18,
    });
    links.push({
      source: caseNodeId,
      target: nId,
      type: 'CASE_TO_CORRELATION',
      label: 'Corrélation observée',
    });
  });

  // Weak Signal Nodes
  caseItem.weakSignalIds.forEach(sigId => {
    const sig = allWeakSignals.find(s => s.id === sigId);
    const nId = `signal-${sigId}`;
    addNode({
      id: nId,
      label: sig ? sig.title.slice(0, 26) + '...' : sigId,
      sublabel: 'Signal faible',
      type: 'signal',
      val: 15,
    });
    links.push({
      source: caseNodeId,
      target: nId,
      type: 'CASE_TO_SIGNAL',
      label: 'Signal rattaché',
    });
  });

  return { nodes, links };
}

export interface FusionComparisonResult {
  canCompare: boolean;
  reason?: string;
  caseA?: OsintFusionCase;
  caseB?: OsintFusionCase;
  sharedCountries: string[];
  sharedEvents: string[];
  sharedActors: string[];
  sharedSources: string[];
  sharedCorrelations: string[];
  sharedWeakSignals: string[];
  contradictionComparison: {
    caseAContradictionsCount: number;
    caseBContradictionsCount: number;
  };
  confidenceComparison: {
    caseAConfidence: string;
    caseBConfidence: string;
  };
}

export function compareFusionCases(
  caseA: OsintFusionCase | null | undefined,
  caseB: OsintFusionCase | null | undefined
): FusionComparisonResult {
  if (!caseA || !caseB) {
    return {
      canCompare: false,
      reason: 'Veuillez sélectionner deux situations pour procéder à la comparaison comparative.',
      sharedCountries: [],
      sharedEvents: [],
      sharedActors: [],
      sharedSources: [],
      sharedCorrelations: [],
      sharedWeakSignals: [],
      contradictionComparison: { caseAContradictionsCount: 0, caseBContradictionsCount: 0 },
      confidenceComparison: { caseAConfidence: '', caseBConfidence: '' },
    };
  }

  if (caseA.id === caseB.id) {
    return {
      canCompare: false,
      reason: 'Comparaison impossible — les deux situations sélectionnées sont identiques.',
      sharedCountries: [],
      sharedEvents: [],
      sharedActors: [],
      sharedSources: [],
      sharedCorrelations: [],
      sharedWeakSignals: [],
      contradictionComparison: { caseAContradictionsCount: 0, caseBContradictionsCount: 0 },
      confidenceComparison: { caseAConfidence: '', caseBConfidence: '' },
    };
  }

  const sharedCountries = caseA.countryCodes.filter(c => caseB.countryCodes.includes(c));
  const sharedEvents = caseA.eventIds.filter(e => caseB.eventIds.includes(e));
  const sharedActors = caseA.actorIds.filter(a => caseB.actorIds.includes(a));
  const sharedSources = caseA.sourceIds.filter(s => caseB.sourceIds.includes(s));
  const sharedCorrelations = caseA.correlationIds.filter(c => caseB.correlationIds.includes(c));
  const sharedWeakSignals = caseA.weakSignalIds.filter(w => caseB.weakSignalIds.includes(w));

  return {
    canCompare: true,
    caseA,
    caseB,
    sharedCountries,
    sharedEvents,
    sharedActors,
    sharedSources,
    sharedCorrelations,
    sharedWeakSignals,
    contradictionComparison: {
      caseAContradictionsCount: (caseA.contradictions || []).length,
      caseBContradictionsCount: (caseB.contradictions || []).length,
    },
    confidenceComparison: {
      caseAConfidence: caseA.confidence,
      caseBConfidence: caseB.confidence,
    },
  };
}

export function validateTraceabilityChain(caseItem: OsintFusionCase): {
  isFullyTraceable: boolean;
  auditResults: {
    conclusion: string;
    hasAnalysis: boolean;
    hasHypothesis: boolean;
    hasEvidence: boolean;
    hasSource: boolean;
    hasEvent: boolean;
    isComplete: boolean;
    brokenLinks: string[];
  }[];
} {
  const auditResults: {
    conclusion: string;
    hasAnalysis: boolean;
    hasHypothesis: boolean;
    hasEvidence: boolean;
    hasSource: boolean;
    hasEvent: boolean;
    isComplete: boolean;
    brokenLinks: string[];
  }[] = [];

  if (!caseItem.traceabilityChain || caseItem.traceabilityChain.length === 0) {
    // Audit base case
    const hasAnalysis = caseItem.analysisIds.length > 0;
    const hasHypothesis = caseItem.hypothesisIds.length > 0;
    const hasEvidence = caseItem.evidenceIds.length > 0;
    const hasSource = caseItem.sourceIds.length > 0;
    const hasEvent = caseItem.eventIds.length > 0;

    const broken: string[] = [];
    if (!hasAnalysis) broken.push('Aucun dossier d’analyse rattaché');
    if (!hasHypothesis) broken.push('Aucune hypothèse formalisée (H1/H2/H3)');
    if (!hasEvidence) broken.push('Aucune pièce d’évidence (IMINT/SIGINT/OSINT) liée');
    if (!hasSource) broken.push('Source primaire non identifiée');
    if (!hasEvent) broken.push('Événement initial manquant');

    const isComplete = broken.length === 0;

    auditResults.push({
      conclusion: caseItem.conclusion,
      hasAnalysis,
      hasHypothesis,
      hasEvidence,
      hasSource,
      hasEvent,
      isComplete,
      brokenLinks: broken,
    });
  } else {
    caseItem.traceabilityChain.forEach(link => {
      const broken: string[] = link.brokenLinks ? [...link.brokenLinks] : [];
      if (!link.analysisId) broken.push('Dossier d’analyse manquant');
      if (!link.hypothesisId) broken.push('Hypothèse analytique non connectée');
      if (!link.evidenceId) broken.push('Élément d’évidence absent');
      if (!link.sourceId) broken.push('Source primaire non tracée');
      if (!link.eventId) broken.push('Événement racine non lié');

      auditResults.push({
        conclusion: link.conclusionText,
        hasAnalysis: !!link.analysisId,
        hasHypothesis: !!link.hypothesisId,
        hasEvidence: !!link.evidenceId,
        hasSource: !!link.sourceId,
        hasEvent: !!link.eventId,
        isComplete: link.isComplete && broken.length === 0,
        brokenLinks: broken,
      });
    });
  }

  const isFullyTraceable = auditResults.every(r => r.isComplete);
  return { isFullyTraceable, auditResults };
}
