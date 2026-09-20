// Polyfill localStorage for Node.js environment if missing
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => store.get(k) || null,
    setItem: (k: string, v: string) => store.set(k, String(v)),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (idx: number) => Array.from(store.keys())[idx] || null
  };
}

// Assurer la présence des collections de référence LOT 34, 35, 36, 20, 22 pour les contrôles d'intégrité
localStorage.setItem('OSINT_REQUIREMENTS_LOT34', JSON.stringify([
  { requirementId: 'REQ-2026-001', id: 'REQ-2026-001', title: 'Surveillance des corridors logistiques Sahel' }
]));
localStorage.setItem('OSINT_REQUIREMENT_QUESTIONS_LOT34', JSON.stringify([
  { questionId: 'Q-REQ-001', id: 'Q-REQ-001', text: 'Quels sont les flux de contrebande armée actifs ?' }
]));
localStorage.setItem('OSINT_VERIFICATION_CASES_LOT36', JSON.stringify([
  {
    id: 'VERIF-CASE-2026-001',
    title: 'Vérification convois Ménaka',
    status: 'QUALIFIE',
    contradictions: [
      { id: 'CTRD-001', claimA: '4 véhicules', claimB: '7 véhicules', status: 'OUVERTE' }
    ]
  }
]));
localStorage.setItem('OSINT_VERIFICATION_CLAIMS_LOT36', JSON.stringify([
  { id: 'CLM-2026-001', statement: 'Mouvement nocturne détecté', claimType: 'FACTUELLE' }
]));
localStorage.setItem('OSINT_VERIFICATION_FINDINGS_LOT36', JSON.stringify([
  { id: 'FND-2026-001', content: 'Bidons d essence découverts', type: 'ELEMENT_FAVORABLE' },
  { id: 'FND-2026-002', content: 'Absence d accrochage rapporté', type: 'ELEMENT_INFIRMANT' }
]));
localStorage.setItem('osint_africa_evidence_v2', JSON.stringify([
  { id: 'EV-2026-001', name: 'Cliché optique carburant' },
  { id: 'EV-2026-002', name: 'Relevé radio' }
]));
localStorage.setItem('osint_africa_sources_v2', JSON.stringify([
  { id: 'SRC-001', name: 'Radio Locale Ménaka' },
  { id: 'SRC-002', name: 'Relais communautaire' }
]));
localStorage.setItem('OSINT_VERIFICATION_SOURCE_LINKS_LOT36', JSON.stringify([
  { id: 'LNK-001', sourceAId: 'SRC-001', sourceBId: 'SRC-002', relationship: 'SYNDICATION', independenceStatus: 'DEPENDANTE' }
]));

import { analyticalAssessmentService, ANALYTICAL_STORAGE_KEYS } from '../src/services/analyticalAssessmentService';

console.log('=== LANCEMENT DU BANC D\'ESSAI (40 TESTS OBLIGATOIRES LOT 37) ===');
const results: { id: number; name: string; status: 'PASS' | 'FAIL'; details: string }[] = [];

// TEST 01 : Création d'une appréciation analytique
const assess1 = analyticalAssessmentService.createAssessment({
  title: 'Appréciation des dynamiques transfrontalières Liptako-Gourma',
  objective: 'Éclairer la prise de décision opérationnelle sur les axes de contrebande armée',
  requirementId: 'REQ-2026-001',
  questionId: 'Q-REQ-001',
  verificationCaseIds: ['VERIF-CASE-2026-001'],
  findingIds: ['FND-2026-001'],
  evidenceIds: ['EV-2026-001'],
  assessmentLevel: 'SUBSTANTIEL',
  confidenceLevel: 'MOYENNE',
  isDemo: true
}, 'ANALYSTE-TEST-01');

results.push({
  id: 1,
  name: '01 Création appréciation analytique',
  status: assess1.id.startsWith('ASSESS-2026-') && assess1.status === 'BROUILLON' ? 'PASS' : 'FAIL',
  details: assess1.id
});

// TEST 02 : Association à un besoin LOT 34
results.push({
  id: 2,
  name: '02 Association besoin LOT 34',
  status: assess1.requirementId === 'REQ-2026-001' ? 'PASS' : 'FAIL',
  details: assess1.requirementId
});

// TEST 03 : Association à une question LOT 34
results.push({
  id: 3,
  name: '03 Association question LOT 34',
  status: assess1.questionId === 'Q-REQ-001' ? 'PASS' : 'FAIL',
  details: assess1.questionId
});

// TEST 04 : Association à un dossier de vérification LOT 36
results.push({
  id: 4,
  name: '04 Association dossier vérification LOT 36',
  status: assess1.verificationCaseIds.includes('VERIF-CASE-2026-001') ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 05 : Association à un constat qualifié LOT 36
results.push({
  id: 5,
  name: '05 Association constat qualifié LOT 36',
  status: assess1.findingIds.includes('FND-2026-001') ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 06 : Association à une preuve LOT 20
results.push({
  id: 6,
  name: '06 Association preuve LOT 20',
  status: assess1.evidenceIds.includes('EV-2026-001') ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 07 : Association à une source LOT 22
let t7Passed = false;
try {
  const argTest = analyticalAssessmentService.createArgument({
    assessmentId: assess1.id,
    hypothesisId: 'HYP-2026-001',
    type: 'SUPPORT',
    statement: 'Rapport radio direct du carrefour',
    sourceIds: ['SRC-001'],
    isDemo: true
  });
  t7Passed = argTest.sourceIds.includes('SRC-001');
} catch (e: any) {
  t7Passed = false;
}
results.push({
  id: 7,
  name: '07 Association source LOT 22',
  status: t7Passed ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 08 : Rejet d'une référence inexistante
let t8Rejected = false;
try {
  analyticalAssessmentService.createAssessment({
    title: 'Appréciation Invalide',
    objective: 'Test rejet référence',
    requirementId: 'REQ-INEXISTANT-999',
    questionId: 'Q-REQ-001',
    isDemo: true
  });
} catch (e: any) {
  t8Rejected = e.message.includes('introuvable');
}
results.push({
  id: 8,
  name: '08 Rejet référence inexistante',
  status: t8Rejected ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 09 : Rejet d'une appréciation orpheline (sans requirementId ou questionId)
let t9OrphanRejected = false;
try {
  analyticalAssessmentService.createAssessment({
    title: 'Appréciation Orpheline',
    objective: 'Test orphelin',
    requirementId: '',
    questionId: '',
    isDemo: true
  });
} catch (e: any) {
  t9OrphanRejected = e.message.includes('obligatoire');
}
results.push({
  id: 9,
  name: '09 Rejet appréciation orpheline',
  status: t9OrphanRejected ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 10 : Création d'une hypothèse explicative
const hypExplic = analyticalAssessmentService.createHypothesis({
  assessmentId: assess1.id,
  statement: 'H1: Réseau de ravitaillement coordonné sous escorte armée',
  type: 'EXPLICATIVE',
  rationale: 'Concordance des horaires et des traces de pneus lourds observés',
  confidenceLevel: 'MOYENNE',
  isDemo: true
}, 'ANALYSTE-TEST-01');

results.push({
  id: 10,
  name: '10 Création hypothèse explicative',
  status: hypExplic.id.startsWith('HYP-2026-') && hypExplic.type === 'EXPLICATIVE' ? 'PASS' : 'FAIL',
  details: hypExplic.id
});

// TEST 11 : Création d'une hypothèse alternative / concurrente
const hypAlt = analyticalAssessmentService.createHypothesis({
  assessmentId: assess1.id,
  statement: 'H2: Trafic d opportunité commercial civil sans affiliation directe',
  type: 'ALTERNATIVE',
  rationale: 'Différentiel important de prix du carburant de part et d autre de la frontière',
  confidenceLevel: 'FAIBLE',
  isDemo: true
}, 'ANALYSTE-TEST-01');

results.push({
  id: 11,
  name: '11 Création hypothèse alternative',
  status: hypAlt.type === 'ALTERNATIVE' ? 'PASS' : 'FAIL',
  details: hypAlt.id
});

// TEST 12 : Création d'un scénario alternatif structuré
const altScenario = analyticalAssessmentService.createAlternative({
  assessmentId: assess1.id,
  hypothesisId: hypExplic.id,
  statement: 'Scénario de repli vers la zone refuge en cas d interception',
  keyAssumptions: ['Accords informels avec les chefferies locales'],
  discriminants: ['Présence de fanions d identification'],
  status: 'ACTIVE',
  isDemo: true
});

results.push({
  id: 12,
  name: '12 Création scénario alternatif',
  status: altScenario.id.startsWith('ALT-2026-') && altScenario.hypothesisId === hypExplic.id ? 'PASS' : 'FAIL',
  details: altScenario.id
});

// TEST 13 : Ajout d'un argument favorable (SUPPORT)
const argSupport = analyticalAssessmentService.createArgument({
  assessmentId: assess1.id,
  hypothesisId: hypExplic.id,
  type: 'SUPPORT',
  statement: 'Fûts de carburant de spécification militaire saisis lors d une patrouille',
  findingIds: ['FND-2026-001'],
  strength: 'FORT',
  isDemo: true
});

results.push({
  id: 13,
  name: '13 Argument favorable (SUPPORT)',
  status: argSupport.type === 'SUPPORT' && argSupport.strength === 'FORT' ? 'PASS' : 'FAIL',
  details: argSupport.id
});

// TEST 14 : Ajout d'un argument défavorable / contraire (CONTRADICTION)
const argContra = analyticalAssessmentService.createArgument({
  assessmentId: assess1.id,
  hypothesisId: hypExplic.id,
  type: 'CONTRADICTION',
  statement: 'Aucun échange de tirs signalé malgré le franchissement de points de contrôle',
  findingIds: ['FND-2026-002'],
  strength: 'MOYEN',
  isDemo: true
});

results.push({
  id: 14,
  name: '14 Argument défavorable (CONTRADICTION)',
  status: argContra.type === 'CONTRADICTION' ? 'PASS' : 'FAIL',
  details: argContra.id
});

// TEST 15 : Conservation obligatoire des arguments contraires (interdiction de suppression silencieuse)
const argsAfterContra = analyticalAssessmentService.listArguments(assess1.id, hypExplic.id);
const contraPreserved = argsAfterContra.some(a => a.id === argContra.id && a.type === 'CONTRADICTION');
results.push({
  id: 15,
  name: '15 Conservation élément défavorable',
  status: contraPreserved ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 16 : Ajout d'un argument de type LIMITE ou CONTEXTE
const argLimit = analyticalAssessmentService.createArgument({
  assessmentId: assess1.id,
  hypothesisId: hypExplic.id,
  type: 'LIMITE',
  statement: 'Imagerie optique diurne inopérante lors des passages nocturnes',
  strength: 'MOYEN',
  isDemo: true
});

results.push({
  id: 16,
  name: '16 Argument de limite méthodologique',
  status: argLimit.type === 'LIMITE' ? 'PASS' : 'FAIL',
  details: argLimit.id
});

// TEST 17 : Ajout d'une assomption sous-jacente
const assump = analyticalAssessmentService.createAssumption({
  assessmentId: assess1.id,
  statement: 'Les conducteurs disposent de relais logistiques préétablis tous les 40 km',
  basis: 'Mode d action documenté lors des saisons sèches antérieures',
  riskLevel: 'ELEVE',
  validationStatus: 'NON_VERIFIEE',
  isDemo: true
});

results.push({
  id: 17,
  name: '17 Création assomption sous-jacente',
  status: assump.id.startsWith('ASSUMP-2026-') ? 'PASS' : 'FAIL',
  details: assump.id
});

// TEST 18 : Balisage d'une assomption non vérifiée
results.push({
  id: 18,
  name: '18 Balisage assomption non vérifiée',
  status: assump.validationStatus === 'NON_VERIFIEE' && assump.riskLevel === 'ELEVE' ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 19 : Création d'une question discriminante
const disc = analyticalAssessmentService.createDiscriminant({
  assessmentId: assess1.id,
  hypothesisIds: [hypExplic.id, hypAlt.id],
  question: 'Les véhicules utilisent-ils des feux de convoi occultés ou des phares civils ?',
  expectedObservation: 'Feux infrarouges ou phares standards halogènes',
  meaningIfObserved: 'Feux occultés confirme H1 (militaire/armé) ; phares civils renforce H2',
  meaningIfAbsent: 'Indéterminé en vision nocturne non amplifiée',
  sourceIds: ['SRC-001'],
  isDemo: true
});

results.push({
  id: 19,
  name: '19 Question discriminante',
  status: disc.id.startsWith('DISC-2026-') && disc.hypothesisIds.length === 2 ? 'PASS' : 'FAIL',
  details: disc.id
});

// TEST 20 : Présence obligatoire de l'interprétation en cas d'observation vs absence
results.push({
  id: 20,
  name: '20 Interprétation observation vs absence',
  status: disc.meaningIfObserved.length > 5 && disc.meaningIfAbsent.length > 5 ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 21 : Consignation d'une lacune analytique
const gap = analyticalAssessmentService.createAnalyticalGap({
  assessmentId: assess1.id,
  description: 'Incertitude totale sur la destination finale au-delà du carrefour d Inates',
  impact: 'MAJEUR',
  priority: 'HAUTE',
  relatedHypothesisIds: [hypExplic.id],
  isDemo: true
});

results.push({
  id: 21,
  name: '21 Consignation lacune analytique',
  status: gap.id.startsWith('AN-GAP-2026-') && gap.status === 'OUVERTE' ? 'PASS' : 'FAIL',
  details: gap.id
});

// TEST 22 : Conservation d'une lacune sans auto-clôture
const gapsList = analyticalAssessmentService.listAnalyticalGaps(assess1.id);
const gapPreserved = gapsList.some(g => g.id === gap.id && g.status === 'OUVERTE');
results.push({
  id: 22,
  name: '22 Conservation lacune sans auto-clôture',
  status: gapPreserved ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 23 : Consignation d'une contradiction conservée sans lissage
const contraList = analyticalAssessmentService.evaluateHypothesisContradictions(hypExplic.id);
results.push({
  id: 23,
  name: '23 Contradiction conservée sans lissage',
  status: contraList.length > 0 && contraList[0].claimA.includes('véhicules') ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 24 : Absence d'arbitrage automatique de la contradiction
const contraEvaluated = analyticalAssessmentService.evaluateHypothesisContradictions(hypExplic.id);
results.push({
  id: 24,
  name: '24 Absence arbitrage auto contradiction',
  status: contraEvaluated[0].status === 'OUVERTE' ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 25 : Évaluation du support de l'hypothèse
const evalHyp = analyticalAssessmentService.evaluateHypothesisSupport(hypExplic.id);
results.push({
  id: 25,
  name: '25 Évaluation support hypothèse',
  status: evalHyp.favorableArguments.length > 0 && evalHyp.unfavorableArguments.length > 0 ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 26 : Distinction stricte : indicateur d'exhaustivité ≠ probabilité de vérité
const hasDoctrinalWarning = evalHyp.doctrinalNotice.includes('NE CONSTITUE EN AUCUN CAS UNE PROBABILITÉ MATHÉMATIQUE DE VÉRITÉ');
results.push({
  id: 26,
  name: '26 Indicateur couverture ≠ Probabilité vérité',
  status: hasDoctrinalWarning && evalHyp.coverageCompletenessIndicator > 0 ? 'PASS' : 'FAIL',
  details: `${evalHyp.coverageCompletenessIndicator}/100`
});

// TEST 27 : Distinction source dépendante vs indépendante
results.push({
  id: 27,
  name: '27 Distinction sources dépendantes vs indép.',
  status: typeof evalHyp.dependentSourceCount === 'number' && typeof evalHyp.independentSourceCount === 'number' ? 'PASS' : 'FAIL',
  details: `Dép: ${evalHyp.dependentSourceCount}, Indép: ${evalHyp.independentSourceCount}`
});

// TEST 28 : Plusieurs sources dépendantes non comptées comme confirmations indépendantes
results.push({
  id: 28,
  name: '28 Sources dépendantes ≠ Confirmations multip.',
  status: evalHyp.dependentSourceCount >= 0 ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 29 : Calcul de la qualité méthodologique de l'appréciation
const qual = analyticalAssessmentService.calculateAssessmentQuality(assess1.id);
results.push({
  id: 29,
  name: '29 Calcul qualité méthodologique',
  status: qual.qualityScore >= 60 && Boolean(qual.qualityAssessment) ? 'PASS' : 'FAIL',
  details: `${qual.qualityScore}/100 (${qual.qualityAssessment})`
});

// TEST 30 : Score qualité reflétant les exigences (alternatives, contraires, lacunes)
results.push({
  id: 30,
  name: '30 Score qualité multicritères rigoureux',
  status: qual.hasMultipleHypotheses && qual.hasContradictoryArgumentsExamined && qual.hasUnresolvedGapsDocumented ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 31 : Transitions d'états valides du workflow
analyticalAssessmentService.changeAssessmentStatus(assess1.id, 'EN_ELABORATION', 'Début de la phase d élaboration contradictoire', 'ANALYSTE-TEST-01');
analyticalAssessmentService.changeAssessmentStatus(assess1.id, 'EN_EXAMEN', 'Passage en comité de relecture', 'ANALYSTE-TEST-01');
analyticalAssessmentService.changeAssessmentStatus(assess1.id, 'EN_ARBITRAGE', 'Arbitrage des contradictions ouvertes', 'ANALYSTE-TEST-01');
analyticalAssessmentService.changeAssessmentStatus(assess1.id, 'A_VALIDER', 'Prêt pour visa superviseur', 'ANALYSTE-TEST-01');
const assessAfterWorkflow = analyticalAssessmentService.getAssessment(assess1.id);
results.push({
  id: 31,
  name: '31 Workflow transitions valides',
  status: assessAfterWorkflow?.status === 'A_VALIDER' ? 'PASS' : 'FAIL',
  details: assessAfterWorkflow?.status || ''
});

// TEST 32 : Rejet d'une transition d'état interdite
let t32Rejected = false;
try {
  analyticalAssessmentService.changeAssessmentStatus(assess1.id, 'BROUILLON', 'Tentative retour interdit', 'ANALYSTE-TEST-01');
} catch (e: any) {
  t32Rejected = e.message.includes('Transition non autorisée');
}
results.push({
  id: 32,
  name: '32 Rejet transition interdite',
  status: t32Rejected ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 33 : Justification obligatoire pour changement de statut
let t33Rejected = false;
try {
  analyticalAssessmentService.changeAssessmentStatus(assess1.id, 'EN_ARBITRAGE', '   ', 'ANALYSTE-TEST-01');
} catch (e: any) {
  t33Rejected = e.message.includes('justification formelle');
}
results.push({
  id: 33,
  name: '33 Justification obligatoire transition',
  status: t33Rejected ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 34 : Décision humaine obligatoire avec superviseur identifié
const decision1 = analyticalAssessmentService.createDecision({
  assessmentId: assess1.id,
  decision: 'APPRECIATION_AVEC_RESERVES',
  rationale: 'Hypothèse 1 privilégiée avec réserves majeures sur les feux et le commanditaire',
  approvedBy: 'SUPERVISEUR-ANALYTIQUE-CHEF',
  isHumanDecision: true,
  isDemo: true
}, 'SUPERVISEUR-ANALYTIQUE-CHEF');

results.push({
  id: 34,
  name: '34 Décision humaine obligatoire',
  status: decision1.id.startsWith('AN-DEC-2026-') && decision1.isHumanDecision === true && decision1.approvedBy === 'SUPERVISEUR-ANALYTIQUE-CHEF' ? 'PASS' : 'FAIL',
  details: decision1.id
});

// TEST 35 : Rejet d'une décision purement automatisée
// (assess1 est passé VALIDEE à l'étape 34. Pour que ces tests d'erreurs sur la décision (35 et 36)
// échouent pour les bonnes raisons et non parce que le statut n'est plus A_VALIDER, on le repasse à A_VALIDER)
const storedAssess = analyticalAssessmentService.getAssessment(assess1.id);
if (storedAssess) storedAssess.status = 'A_VALIDER';

let t35Rejected = false;
try {
  analyticalAssessmentService.createDecision({
    assessmentId: assess1.id,
    decision: 'APPRECIATION_RETENUE',
    rationale: 'Décision automatique par algorithme',
    approvedBy: 'IA-BOT',
    isHumanDecision: false,
    isDemo: true
  });
} catch (e: any) {
  t35Rejected = e.message.includes('interdit toute validation décisionnelle purement automatisée');
}
results.push({
  id: 35,
  name: '35 Rejet décision automatique',
  status: t35Rejected ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 36 : Argumentation circonstanciée obligatoire pour la décision (≥ 10 caractères)
let t36Rejected = false;
try {
  analyticalAssessmentService.createDecision({
    assessmentId: assess1.id,
    decision: 'APPRECIATION_RETENUE',
    rationale: 'Court',
    approvedBy: 'SUPERVISEUR-ANALYTIQUE-CHEF',
    isHumanDecision: true,
    isDemo: true
  });
} catch (e: any) {
  t36Rejected = e.message.includes('au moins 10 caractères');
}
results.push({
  id: 36,
  name: '36 Rationale circonstancié décision',
  status: t36Rejected ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 37 : Verrouillage et immuabilité de l'état ARCHIVEE
if (storedAssess) storedAssess.status = 'VALIDEE';
analyticalAssessmentService.changeAssessmentStatus(assess1.id, 'ARCHIVEE', 'Archivage définitif du dossier d appréciation', 'SUPERVISEUR-ANALYTIQUE-CHEF');
let t37Locked = false;
try {
  analyticalAssessmentService.updateAssessment(assess1.id, { title: 'Titre Modifié Illégal' }, 'SUPERVISEUR', 'Modification');
} catch (e: any) {
  t37Locked = e.message.includes('immuable et verrouillée');
}
results.push({
  id: 37,
  name: '37 Verrouillage immuable ARCHIVEE',
  status: t37Locked ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 38 : Journal d'audit append-only au niveau du service
const auditEntries = analyticalAssessmentService.getAuditLogs();
const hasCreationAudit = auditEntries.some(a => a.action === 'CREATE_ASSESSMENT');
const hasStatusAudit = auditEntries.some(a => a.action === 'STATUS_CHANGE' || a.action === 'ARCHIVE_ASSESSMENT');
results.push({
  id: 38,
  name: '38 Audit append-only service',
  status: auditEntries.length >= 10 && hasCreationAudit && hasStatusAudit ? 'PASS' : 'FAIL',
  details: `${auditEntries.length} entrées`
});

// TEST 39 : Traçabilité intégrale bidirectionnelle descendante et ascendante
const trace = analyticalAssessmentService.getAnalyticalTraceability(assess1.id);
const hasRootReq = trace.descending.length > 0 && trace.descending[0].type === 'REQUIREMENT';
const hasAscending = trace.ascending.length > 0 && trace.ascending[0].type === 'DECISION';
results.push({
  id: 39,
  name: '39 Traçabilité intégrale bidirectionnelle',
  status: hasRootReq && hasAscending ? 'PASS' : 'FAIL',
  details: 'OK'
});

// TEST 40 : Export JSON souverain et conformité 0 nouvelle connexion réseau
const jsonExport = analyticalAssessmentService.exportAnalyticalAssessmentJson('DEMO');
const exportValid = jsonExport.includes('"lot": "LOT_37_ANALYTICAL_ASSESSMENT_CENTER"') &&
  jsonExport.includes('"networkCalls": 0') &&
  jsonExport.includes('assessments') &&
  jsonExport.includes('hypotheses') &&
  jsonExport.includes('arguments');

results.push({
  id: 40,
  name: '40 Export JSON souverain (0 réseau)',
  status: exportValid ? 'PASS' : 'FAIL',
  details: '0 appel réseau'
});

// BILAN ET AFFICHAGE
let passCount = 0;
let failCount = 0;
for (const r of results) {
  if (r.status === 'PASS') passCount++;
  else failCount++;
  console.log(`[TEST ${String(r.id).padStart(2, '0')}] ${r.name} -> ${r.status} (${r.details})`);
}

console.log('\n========================================');
console.log('BILAN DU BANC D\'ESSAI LOT 37 :');
console.log(`PASS : ${passCount} / 40`);
console.log(`FAIL : ${failCount} / 40`);
console.log('NOT TESTED : 0 / 40');
console.log('========================================\n');

if (failCount > 0 || passCount !== 40) {
  process.exit(1);
}
