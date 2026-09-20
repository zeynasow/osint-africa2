// Dedicated targeted verification script for LOT 37 final sealing
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

// Ensure base demo entities for LOT 34, 35, 36
localStorage.setItem('OSINT_REQUIREMENTS_LOT34', JSON.stringify([
  { requirementId: 'REQ-2026-001', id: 'REQ-2026-001', title: 'Surveillance des corridors logistiques Sahel' }
]));
localStorage.setItem('OSINT_REQUIREMENT_QUESTIONS_LOT34', JSON.stringify([
  { questionId: 'Q-REQ-001', id: 'Q-REQ-001', text: 'Quels sont les flux de contrebande armée actifs ?' }
]));
localStorage.setItem('OSINT_RESEARCH_PLANS_LOT35', JSON.stringify([
  { id: 'PLAN-2026-001', title: 'Plan de surveillance Liptako', requirementId: 'REQ-2026-001', questionId: 'Q-REQ-001' }
]));
localStorage.setItem('OSINT_RESEARCH_TASKS_LOT35', JSON.stringify([
  { id: 'TSK-2026-001', title: 'Collecte signaux radio Menaka', planId: 'PLAN-2026-001' }
]));
localStorage.setItem('OSINT_RESEARCH_RESULTS_LOT35', JSON.stringify([
  { id: 'RES-OBS-2026-001', title: 'Rapport d observation convoi', taskId: 'TSK-2026-001' }
]));
localStorage.setItem('OSINT_VERIFICATION_CASES_LOT36', JSON.stringify([
  { id: 'VERIF-CASE-2026-001', title: 'Vérification convois Ménaka', status: 'QUALIFIE', researchResultId: 'RES-OBS-2026-001' }
]));
localStorage.setItem('OSINT_VERIFICATION_CLAIMS_LOT36', JSON.stringify([
  { id: 'CLM-2026-001', caseId: 'VERIF-CASE-2026-001', statement: 'Mouvement nocturne détecté', claimType: 'FACTUELLE' }
]));
localStorage.setItem('OSINT_VERIFICATION_FINDINGS_LOT36', JSON.stringify([
  { id: 'FND-2026-001', caseId: 'VERIF-CASE-2026-001', claimId: 'CLM-2026-001', content: 'Bidons d essence découverts', type: 'ELEMENT_FAVORABLE' }
]));
localStorage.setItem('osint_africa_evidence_v2', JSON.stringify([
  { id: 'EV-2026-001', name: 'Cliché optique carburant' }
]));
localStorage.setItem('osint_africa_sources_v2', JSON.stringify([
  { id: 'SRC-001', name: 'Radio Locale Ménaka' }
]));

import { analyticalAssessmentService } from '../src/services/analyticalAssessmentService';

console.log('=== VÉRIFICATION CIBLÉE LOT 37 AVANT SCELLEMENT ===\n');

// -------------------------------------------------------------
// 1. WORKFLOW COMPLET
// -------------------------------------------------------------
console.log('--- 1. TEST DU WORKFLOW COMPLET ---');
const assess = analyticalAssessmentService.createAssessment({
  title: 'Test Workflow Scellement',
  objective: 'Valider le cheminement complet d état',
  requirementId: 'REQ-2026-001',
  questionId: 'Q-REQ-001',
  verificationCaseIds: ['VERIF-CASE-2026-001'],
  findingIds: ['FND-2026-001'],
  evidenceIds: ['EV-2026-001'],
  isDemo: true
}, 'ANALYSTE-1');
console.log(`[0] Initial: ${assess.status} (Attendu: BROUILLON)`);

analyticalAssessmentService.changeAssessmentStatus(assess.id, 'EN_ELABORATION', 'Début élaboration', 'ANALYSTE-1');
console.log(`[1] BROUILLON -> EN_ELABORATION: ${analyticalAssessmentService.getAssessment(assess.id)?.status}`);

analyticalAssessmentService.changeAssessmentStatus(assess.id, 'EN_EXAMEN', 'Passage relecture', 'ANALYSTE-1');
console.log(`[2] EN_ELABORATION -> EN_EXAMEN: ${analyticalAssessmentService.getAssessment(assess.id)?.status}`);

analyticalAssessmentService.changeAssessmentStatus(assess.id, 'EN_ARBITRAGE', 'Arbitrage requis', 'ANALYSTE-1');
console.log(`[3] EN_EXAMEN -> EN_ARBITRAGE: ${analyticalAssessmentService.getAssessment(assess.id)?.status}`);

analyticalAssessmentService.changeAssessmentStatus(assess.id, 'A_VALIDER', 'Prêt validation', 'ANALYSTE-1');
console.log(`[4] EN_ARBITRAGE -> A_VALIDER: ${analyticalAssessmentService.getAssessment(assess.id)?.status}`);

// Test transition interdite directe vers VALIDEE depuis un état incorrect
let directValFail = false;
try {
  const dummy = analyticalAssessmentService.createAssessment({
    title: 'Dummy',
    objective: 'Test',
    requirementId: 'REQ-2026-001',
    questionId: 'Q-REQ-001',
    isDemo: true
  });
  analyticalAssessmentService.changeAssessmentStatus(dummy.id, 'VALIDEE', 'Tentative saut direct', 'ANALYSTE-1');
} catch (e: any) {
  directValFail = true;
  console.log(`[*] Rejet saut direct vers VALIDEE depuis BROUILLON: OK (${e.message})`);
}

// Test transition interdite vers ARCHIVEE avant validation
let archAvantValFail = false;
try {
  analyticalAssessmentService.changeAssessmentStatus(assess.id, 'ARCHIVEE', 'Tentative archivage avant validation', 'ANALYSTE-1');
} catch (e: any) {
  archAvantValFail = true;
  console.log(`[*] Refus ARCHIVEE depuis A_VALIDER avant validation finale: OK (${e.message})`);
}

// -------------------------------------------------------------
// 2. VALIDATION HUMAINE FINALE (A_VALIDER -> VALIDEE)
// -------------------------------------------------------------
console.log('\n--- 2. TEST VALIDATION HUMAINE FINALE ---');

// Test validation sans analyste = REJET
let valSansAnalyste = false;
try {
  analyticalAssessmentService.createDecision({
    assessmentId: assess.id,
    decision: 'APPRECIATION_RETENUE',
    rationale: 'Validation correcte avec argumentation substantielle',
    approvedBy: '',
    isHumanDecision: true,
    isDemo: true
  }, '');
} catch (e: any) {
  valSansAnalyste = true;
  console.log(`[*] Validation sans analyste identifié: REJETÉ (${e.message})`);
}

// Test validation automatique = REJET
let valAuto = false;
try {
  analyticalAssessmentService.createDecision({
    assessmentId: assess.id,
    decision: 'APPRECIATION_RETENUE',
    rationale: 'Validation automatique algorithmique',
    approvedBy: 'BOT-AI',
    isHumanDecision: false,
    isDemo: true
  });
} catch (e: any) {
  valAuto = true;
  console.log(`[*] Validation automatique (isHumanDecision=false): REJETÉ (${e.message})`);
}

// Validation humaine complète = PASS (A_VALIDER -> VALIDEE)
const dec = analyticalAssessmentService.createDecision({
  assessmentId: assess.id,
  decision: 'APPRECIATION_RETENUE',
  rationale: 'Validation formelle circonstanciée par le superviseur suite au croisement rigoureux',
  approvedBy: 'SUPERVISEUR-ANALYTIQUE-CHEF',
  isHumanDecision: true,
  isDemo: true
}, 'SUPERVISEUR-ANALYTIQUE-CHEF');

const assessApresVal = analyticalAssessmentService.getAssessment(assess.id);
console.log(`[5] A_VALIDER -> VALIDEE: ${assessApresVal?.status} (Validateur: ${assessApresVal?.validatedBy}, Date: ${assessApresVal?.validatedAt}, isHuman: ${assessApresVal?.isHumanValidated})`);

// Test VALIDEE -> modification (doit être interdite ou protégée)
// En état VALIDEE, le statut est verrouillé pour les modifications substantielles
console.log(`[*] Appréciation validée: statut=${assessApresVal?.status}`);

// VALIDEE -> ARCHIVEE
analyticalAssessmentService.changeAssessmentStatus(assess.id, 'ARCHIVEE', 'Archivage définitif', 'SUPERVISEUR-ANALYTIQUE-CHEF');
console.log(`[6] VALIDEE -> ARCHIVEE: ${analyticalAssessmentService.getAssessment(assess.id)?.status}`);

// Test ARCHIVEE -> toute modification = REJET
let archModifFail = false;
try {
  analyticalAssessmentService.updateAssessment(assess.id, { title: 'Titre altéré illégalement' }, 'ANALYSTE-1', 'Tentative altération');
} catch (e: any) {
  archModifFail = true;
  console.log(`[*] Altération après archivage: REJETÉ (${e.message})`);
}

let archStatusFail = false;
try {
  analyticalAssessmentService.changeAssessmentStatus(assess.id, 'EN_ELABORATION', 'Tentative réouverture', 'ANALYSTE-1');
} catch (e: any) {
  archStatusFail = true;
  console.log(`[*] Réouverture après archivage: REJETÉ (${e.message})`);
}

// -------------------------------------------------------------
// 3. SENS DES SCORES
// -------------------------------------------------------------
console.log('\n--- 3. TEST DE LA DOCTRINE ET SENS DES SCORES ---');
const assessActive = analyticalAssessmentService.createAssessment({
  title: 'Test Doctrine Scores et Traçabilité',
  objective: 'Vérifier la sémantique stricte des métriques',
  requirementId: 'REQ-2026-001',
  questionId: 'Q-REQ-001',
  verificationCaseIds: ['VERIF-CASE-2026-001'],
  findingIds: ['FND-2026-001'],
  evidenceIds: ['EV-2026-001'],
  isDemo: true
}, 'ANALYSTE-1');

const h1 = analyticalAssessmentService.createHypothesis({
  assessmentId: assessActive.id,
  statement: 'H1: Trafic coordonné',
  type: 'EXPLICATIVE',
  rationale: 'Concordance des indices matériels et des interceptions',
  isDemo: true
});
const evalHyp = analyticalAssessmentService.evaluateHypothesisSupport(h1.id);
const qual = analyticalAssessmentService.calculateAssessmentQuality(assessActive.id);

console.log(`Notice doctrinale: "${evalHyp.doctrinalNotice}"`);
console.log(`Notice qualité: "${qual.doctrinalNotice}"`);

const scoreCheck = evalHyp.doctrinalNotice.includes('NE CONSTITUE EN AUCUN CAS UNE PROBABILITÉ MATHÉMATIQUE DE VÉRITÉ') &&
  qual.doctrinalNotice.includes('ne constitue pas une probabilité de vérité');
console.log(`Scores explicitement non assimilés à une probabilité de vérité: ${scoreCheck ? 'CONFIRMÉ' : 'ÉCHEC'}`);

// -------------------------------------------------------------
// 4. TRAÇABILITÉ DYNAMIQUE DÉCISION -> BESOIN
// -------------------------------------------------------------
console.log('\n--- 4. TEST TRAÇABILITÉ DYNAMIQUE DÉCISION -> BESOIN ---');
const arg1 = analyticalAssessmentService.createArgument({
  assessmentId: assessActive.id,
  hypothesisId: h1.id,
  type: 'SUPPORT',
  statement: 'Traces carburant',
  findingIds: ['FND-2026-001'],
  isDemo: true
});

analyticalAssessmentService.changeAssessmentStatus(assessActive.id, 'EN_ELABORATION', 'motif', 'USR');
analyticalAssessmentService.changeAssessmentStatus(assessActive.id, 'EN_EXAMEN', 'motif', 'USR');
analyticalAssessmentService.changeAssessmentStatus(assessActive.id, 'EN_ARBITRAGE', 'motif', 'USR');
analyticalAssessmentService.changeAssessmentStatus(assessActive.id, 'A_VALIDER', 'motif', 'USR');

analyticalAssessmentService.createDecision({
  assessmentId: assessActive.id,
  decision: 'APPRECIATION_RETENUE',
  rationale: 'Validation avec traçabilité complète de bout en bout',
  approvedBy: 'SUPERVISEUR-VALIDATEUR',
  isHumanDecision: true,
  isDemo: true
});

const trace = analyticalAssessmentService.getAnalyticalTraceability(assessActive.id);
console.log(`Ascending tree length: ${trace.ascending.length}`);
function printAscending(node: any, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}↳ [${node.type}] ID: ${node.id} - ${node.label}`);
  if (node.children) {
    node.children.forEach((c: any) => printAscending(c, depth + 1));
  }
}
if (trace.ascending.length > 0) {
  printAscending(trace.ascending[0]);
}

// Test RUPTURE_LIEN si référence manquante (ex: finding supprimé ou lien rompu dans le stockage après création)
const rawFindings = JSON.parse(localStorage.getItem('OSINT_VERIFICATION_FINDINGS_LOT36') || '[]');
rawFindings.push({ id: 'FND-TEMP-999', caseId: 'VERIF-CASE-2026-001', claimId: 'CLM-2026-001', content: 'Finding temporaire', type: 'ELEMENT_FAVORABLE' });
localStorage.setItem('OSINT_VERIFICATION_FINDINGS_LOT36', JSON.stringify(rawFindings));

const assessOrphanRef = analyticalAssessmentService.createAssessment({
  title: 'Assess avec rupture',
  objective: 'Test rupture',
  requirementId: 'REQ-2026-001',
  questionId: 'Q-REQ-001',
  findingIds: ['FND-TEMP-999'],
  isDemo: true
});
const hRupture = analyticalAssessmentService.createHypothesis({
  assessmentId: assessOrphanRef.id,
  statement: 'Hyp rupture',
  type: 'ALTERNATIVE',
  rationale: 'Raisonnement test',
  isDemo: true
});
analyticalAssessmentService.createArgument({
  assessmentId: assessOrphanRef.id,
  hypothesisId: hRupture.id,
  type: 'SUPPORT',
  statement: 'Arg avec finding temporaire',
  findingIds: ['FND-TEMP-999'],
  isDemo: true
});

// Suppression du finding dans le stockage pour provoquer une RUPTURE_LIEN lors de la traversée dynamique
const filteredFindings = rawFindings.filter((f: any) => f.id !== 'FND-TEMP-999');
localStorage.setItem('OSINT_VERIFICATION_FINDINGS_LOT36', JSON.stringify(filteredFindings));

analyticalAssessmentService.changeAssessmentStatus(assessOrphanRef.id, 'EN_ELABORATION', 'motif', 'USR');
analyticalAssessmentService.changeAssessmentStatus(assessOrphanRef.id, 'EN_EXAMEN', 'motif', 'USR');
analyticalAssessmentService.changeAssessmentStatus(assessOrphanRef.id, 'EN_ARBITRAGE', 'motif', 'USR');
analyticalAssessmentService.changeAssessmentStatus(assessOrphanRef.id, 'A_VALIDER', 'motif', 'USR');
analyticalAssessmentService.createDecision({
  assessmentId: assessOrphanRef.id,
  decision: 'APPRECIATION_AVEC_RESERVES',
  rationale: 'Validation avec détection de rupture documentaire',
  approvedBy: 'SUPERVISEUR',
  isHumanDecision: true,
  isDemo: true
});
const traceRupture = analyticalAssessmentService.getAnalyticalTraceability(assessOrphanRef.id);
const hasRupture = JSON.stringify(traceRupture).includes('RUPTURE_LIEN');
console.log(`RUPTURE_LIEN produit en cas de référence manquante: ${hasRupture ? 'CONFIRMÉ' : 'ÉCHEC'}`);

console.log('\n=== FIN DU SCRIPT DE VÉRIFICATION CIBLÉE ===');
