// Setup localStorage mock in Node environment before any service imports
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) { return this.store[key] || null; },
  setItem(key: string, value: string) { this.store[key] = value.toString(); },
  removeItem(key: string) { delete this.store[key]; },
  clear() { this.store = {}; }
};
(global as any).localStorage = localStorageMock;

import { crisisOperationService, CRISIS_STORAGE_KEYS } from '../src/services/crisisOperationService';
import { accessControlService } from '../src/services/accessControlService';

async function runLot43TargetedAudit() {
  console.log('===========================================================================');
  console.log('=== AUDIT CIBLÉ INDÉPENDANT DU LOT 43 — VÉRIFICATIONS APPROFONDIES ===');
  console.log('=== Centre Opérationnel de Gestion de Crise & Conduite (COGC) ===');
  console.log('===========================================================================\n');

  accessControlService.init();
  crisisOperationService.init();

  let pass = 0;
  let total = 0;

  function auditAssert(section: string, testName: string, passed: boolean, details: string) {
    total++;
    if (passed) {
      pass++;
      console.log(`[PASS] [${section}] ${testName} -> ${details}`);
    } else {
      console.error(`[FAIL] [${section}] ${testName} -> ${details}`);
      process.exit(1);
    }
  }

  // --- 1. CYCLE DE VIE ET IMMUTABILITÉ ---
  const cell = crisisOperationService.createCrisisCell({
    title: 'Audit Cellule Sahel Sud',
    theater: 'Théâtre Centre-Sahel',
    countryIds: ['ML', 'BF'],
    description: 'Cellule dédiée aux tests d’audit ciblé.',
    posture: 'CRISE_ACTIVE',
    severity: 'MAJEURE',
    commanderId: 'user-resp-01',
    leadAnalystId: 'user-ana-01',
    synthesisIds: ['synth-2026-001'],
    indicatorIds: ['ind-mon-001'],
    scenarioIds: ['scen-sahel-01'],
    hypothesisIds: ['hyp-lot37-01'],
    eventIds: ['evt-2026-001'],
    caseIds: ['case-001'],
    requirementIds: ['REQ-2026-001'],
    isDemo: true
  }, 'user-resp-01');

  auditAssert('CYCLE_VIE', 'Création conforme', !!cell && cell.posture === 'CRISE_ACTIVE', `Code=${cell.code}`);

  // Rejet clôture justification courte
  const rejectShortClose = crisisOperationService.closeCrisisCell(cell.id, 'court', 'bilan', 'user-resp-01');
  auditAssert('CYCLE_VIE', 'Rejet justification < 10 car.', rejectShortClose === null, 'Clôture rejetée');

  // Clôture valide
  const validClose = crisisOperationService.closeCrisisCell(
    cell.id,
    'Stabilisation complète et définitive de la situation observée sur le terrain.',
    'Bilan transmis au RETEX.',
    'user-resp-01'
  );
  auditAssert('CYCLE_VIE', 'Clôture valide avec justification', !!validClose && validClose.status === 'CLOTUREE', 'Statut CLOTUREE');

  // Immutabilité après clôture
  const editAfterClose = crisisOperationService.updateCrisisCell(cell.id, { title: 'Titre Hack' }, 'user-resp-01');
  auditAssert('IMMUTABILITE', 'Rejet modification post-clôture', editAfterClose === null, 'Modification bloquée');

  // Rejet log sur cellule close
  const logAfterClose = crisisOperationService.addLogEntry({
    crisisId: cell.id,
    incidentType: 'OBSERVATION_TERRAIN',
    urgency: 'ROUTINE',
    title: 'Log après clôture',
    content: 'Test',
    authorId: 'user-op-01'
  }, 'user-op-01');
  auditAssert('IMMUTABILITE', 'Rejet ajout log sur cellule clôturée', logAfterClose === null, 'Log bloqué');

  // --- 2. DIRECTIVES ET DÉCISION HUMAINE OBLIGATOIRE ---
  const activeCell = crisisOperationService.createCrisisCell({
    title: 'Cellule Active pour Directives',
    theater: 'Théâtre Est',
    countryIds: ['NE'],
    description: 'Veille',
    posture: 'CRISE_ACTIVE',
    severity: 'SIGNIFICATIVE',
    commanderId: 'user-resp-01',
    leadAnalystId: 'user-ana-01'
  }, 'user-resp-01');

  const dir = crisisOperationService.createDirective({
    crisisId: activeCell.id,
    title: 'Directive A',
    description: 'Description A',
    targetEntity: 'Unité 1',
    priority: 'HAUTE',
    proposedBy: 'user-ana-01'
  }, 'user-ana-01');

  auditAssert('DIRECTIVES', 'Proposition sans validation automatique', dir?.status === 'PROPOSEE' && dir.isHumanDecision === false, 'isHumanDecision=false');

  // Rejet exécution directive proposée
  const execPrecoce = crisisOperationService.executeDirective(dir!.id, 'user-op-01', 'Rapport', 'user-op-01');
  auditAssert('DIRECTIVES', 'Blocage exécution directive PROPOSEE', execPrecoce === null, 'Exécution précoce interdite');

  // Rejet décision sans justification
  const decideSansMotif = crisisOperationService.decideDirective(dir!.id, 'user-resp-01', '', true, 'user-resp-01');
  auditAssert('DIRECTIVES', 'Blocage décision sans justification', decideSansMotif === null, 'Justification obligatoire');

  // Validation humaine formelle
  const decideValide = crisisOperationService.decideDirective(dir!.id, 'user-resp-01', 'Approbation opérationnelle motivée', true, 'user-resp-01');
  auditAssert('DIRECTIVES', 'Décision humaine formelle (DECIDEE)', decideValide?.status === 'DECIDEE' && decideValide.isHumanDecision === true, 'Statut DECIDEE');

  // Exécution autorisée après validation
  const execValide = crisisOperationService.executeDirective(dir!.id, 'user-op-01', 'Action effectuée', 'user-op-01');
  auditAssert('DIRECTIVES', 'Exécution permise après décision humaine', execValide?.status === 'EXECUTEE' && !!execValide.executedAt, 'Statut EXECUTEE');

  // --- 3. DÉTERMINISME DU CALCUL D’IMPACT (0-100) ---
  const impact1 = crisisOperationService.calculateOperationalImpact({
    countryCount: 2,
    hasCriticalInfra: true,
    populationVulnerabilityLevel: 'MOYENNE',
    escalationPotential: 'REGIONAL',
    crossBorderCorridorAffected: true
  });
  const impact2 = crisisOperationService.calculateOperationalImpact({
    countryCount: 2,
    hasCriticalInfra: true,
    populationVulnerabilityLevel: 'MOYENNE',
    escalationPotential: 'REGIONAL',
    crossBorderCorridorAffected: true
  });
  auditAssert('CALCUL_IMPACT', 'Répétabilité et déterminisme', impact1 === impact2 && impact1 >= 0 && impact1 <= 100, `Impact=${impact1}/100`);

  // --- 4. TRAÇABILITÉ INTER-LOTS & RUPTURE_LIEN ---
  const brokenRefCell = crisisOperationService.createCrisisCell({
    title: 'Cellule Test Traçabilité',
    theater: 'Théâtre Test',
    countryIds: ['TG'],
    description: 'Test',
    posture: 'PRE_ALERTE',
    severity: 'MINEURE',
    commanderId: 'user-resp-01',
    leadAnalystId: 'user-ana-01',
    synthesisIds: ['synth-fantome-1'],
    indicatorIds: ['ind-fantome-1'],
    scenarioIds: ['scen-fantome-1'],
    hypothesisIds: ['hyp-fantome-1'],
    requirementIds: ['req-fantome-1'],
    eventIds: ['evt-fantome-1'],
    caseIds: ['case-fantome-1']
  }, 'user-resp-01');

  const traceList = crisisOperationService.verifyCrisisTraceability(brokenRefCell.id);
  const allBroken = traceList.every(t => t.status === 'RUPTURE_LIEN');
  auditAssert('TRACABILITE', 'Détection exhaustive de RUPTURE_LIEN', allBroken && traceList.length === 7, `7 ruptures détectées sur 7 cibles`);

  // --- 5. AUDIT APPEND-ONLY AU NIVEAU DU SERVICE ---
  const audits = crisisOperationService.getSecurityAudit();
  const hasDestructive = 'deleteAudit' in (crisisOperationService as any) || 'clearAudit' in (crisisOperationService as any);
  auditAssert('AUDIT', 'Journal append-only inaltérable', !hasDestructive && audits.length > 0, `Total entrées d’audit: ${audits.length}`);

  // --- 6. PERSISTANCE DANS LES 5 CLÉS ---
  const keysPresent = Object.values(CRISIS_STORAGE_KEYS).every(k => !!localStorageMock.getItem(k));
  auditAssert('PERSISTANCE', 'Persistance dans les 5 clés OSINT_*_LOT43', keysPresent, 'Toutes les clés présentes');

  console.log('\n===========================================================================');
  console.log(`=== BILAN AUDIT CIBLÉ LOT 43 : ${pass}/${total} VÉRIFICATIONS VALIDÉES (0 FAIL) ===`);
  console.log('===========================================================================');
}

runLot43TargetedAudit().catch(e => {
  console.error('Erreur audit ciblé :', e);
  process.exit(1);
});
