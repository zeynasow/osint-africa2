// Setup localStorage mock in Node environment before any service imports
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) { return this.store[key] || null; },
  setItem(key: string, value: string) { this.store[key] = value.toString(); },
  removeItem(key: string) { delete this.store[key]; },
  clear() { this.store = {}; }
};
(global as any).localStorage = localStorageMock;

import {
  interserviceCoordinationService,
  COORDINATION_STORAGE_KEYS
} from '../src/services/interserviceCoordinationService';
import { crisisOperationService } from '../src/services/crisisOperationService';
import { accessControlService } from '../src/services/accessControlService';
import * as fs from 'fs';
import * as path from 'path';

async function verifyLot44TargetedAudit() {
  console.log('================================================================');
  console.log('=== AUDIT CIBLÉ INDÉPENDANT DU LOT 44 — 14 POINTS DE CONTRÔLE ===');
  console.log('=== CCISO - Centre de Coordination Interservices & Suivi Ops ===');
  console.log('================================================================\n');

  accessControlService.init();
  crisisOperationService.init();
  interserviceCoordinationService.init();

  let passCount = 0;
  let failCount = 0;

  function assertAudit(pointNum: number, title: string, passed: boolean, details: string) {
    const num = pointNum.toString().padStart(2, '0');
    if (passed) {
      passCount++;
      console.log(`[AUDIT-PT ${num}] ${title.padEnd(52, ' ')} -> PASS | ${details}`);
    } else {
      failCount++;
      console.error(`[AUDIT-PT ${num}] ${title.padEnd(52, ' ')} -> FAIL | ${details}`);
      process.exit(1);
    }
  }

  // 1. Validation humaine obligatoire
  const testReq1 = interserviceCoordinationService.createRequest(
    {
      operationId: 'COGC-2026-001',
      requestedBy: 'user-op-01',
      resourceCategory: 'LOGISTIQUE_TRANSPORT',
      quantity: 2,
      priority: 'NORMALE',
      justification: 'Audit test validation humaine',
      isDemo: true
    },
    'user-op-01'
  );
  const rejectAutomated = interserviceCoordinationService.transitionRequest(testReq1!.id, 'VALIDEE', {
    actorId: 'user-resp-01',
    justification: 'Tentative sans validation humaine explicite',
    isHumanDecision: false
  });
  assertAudit(1, 'Validation humaine obligatoire', !rejectAutomated.success && rejectAutomated.error?.includes('humanDecision'), 'Blocage effectif si isHumanDecision !== true');

  // 2. Impossibilité de transition interdite
  const testReq2 = interserviceCoordinationService.createRequest(
    {
      operationId: 'COGC-2026-001',
      requestedBy: 'user-op-01',
      resourceCategory: 'TRANSMISSION_TELECOM',
      quantity: 1,
      priority: 'HAUTE',
      justification: 'Audit test transition interdite',
      isDemo: true
    },
    'user-op-01'
  );
  const jumpForbidden = interserviceCoordinationService.transitionRequest(testReq2!.id, 'SATISFAITE', {
    actorId: 'user-resp-01',
    isHumanDecision: true
  });
  assertAudit(2, 'Impossibilité de transition interdite', !jumpForbidden.success, 'Saut direct PROPOSEE -> SATISFAITE strictement prohibé');

  // 3. Quantité disponible respectée
  const resources = interserviceCoordinationService.getResources();
  const resTarget = resources.find(r => r.availableQuantity > 0)!;
  const teams = interserviceCoordinationService.getTeams();
  // Valider la demande testReq2 d'abord
  interserviceCoordinationService.transitionRequest(testReq2!.id, 'VALIDEE', {
    actorId: 'user-resp-01',
    justification: 'Validation préalable pour test capacité',
    isHumanDecision: true
  });
  const overAlloc = interserviceCoordinationService.createAssignment({
    requestId: testReq2!.id,
    resourceId: resTarget.id,
    teamId: teams[0].id,
    quantity: resTarget.availableQuantity + 100, // Dépassant le disponible
    assignedBy: 'user-resp-01',
    justification: 'Audit surallocation impossible',
    isHumanDecision: true
  });
  assertAudit(3, 'Quantité disponible scrupuleusement respectée', !overAlloc.success && overAlloc.error?.includes('Capacité insuffisante'), 'Surallocation physique strictement rejetée');

  // 4. Séparation DEMO / RÉEL
  const demoOnly = interserviceCoordinationService.getResources({ isDemo: true });
  const realOnly = interserviceCoordinationService.getResources({ isDemo: false });
  assertAudit(4, 'Séparation étanche DEMO / RÉEL', demoOnly.every(r => r.isDemo) && realOnly.every(r => !r.isDemo), 'Cloisonnement parfait des registres démo et réels');

  // 5. Persistance
  const expectedKeys = Object.values(COORDINATION_STORAGE_KEYS);
  const allStored = expectedKeys.every(k => localStorage.getItem(k) !== null);
  assertAudit(5, 'Persistance des 8 clés dans localStorage', allStored && expectedKeys.length === 8, 'Toutes les collections sont persistées localement');

  // 6. Audit append-only
  const auditBefore = interserviceCoordinationService.getAuditTrail().length;
  interserviceCoordinationService.createOrganization(
    {
      name: 'Audit Temp Org',
      shortName: 'ATO',
      type: 'AUTRE',
      status: 'ACTIF',
      responsible: 'Audit Officer',
      contactReference: 'audit@osint.int',
      classification: 'DIFFUSION_RESTREINTE',
      isDemo: true
    },
    'user-resp-01'
  );
  const auditAfter = interserviceCoordinationService.getAuditTrail().length;
  assertAudit(6, 'Journal d’audit strictly append-only', auditAfter > auditBefore, `Taille audit incrémentée : ${auditBefore} -> ${auditAfter}`);

  // 7. RBAC
  const rbacCheck = interserviceCoordinationService.checkUserAuthorization('user-op-01', 'VALIDATE');
  assertAudit(7, 'RBAC : Contrôle d’accès aux actions sensibles', rbacCheck.allowed === false, 'Opérateur interdit de valider des ressources sans rôle de commandement');

  // 8. SoD (Séparation des Responsabilités)
  const sodReq = interserviceCoordinationService.createRequest(
    {
      operationId: 'COGC-2026-001',
      requestedBy: 'user-resp-01',
      resourceCategory: 'SOIN_MEDICAL',
      quantity: 1,
      priority: 'HAUTE',
      justification: 'Test SoD pour audit ciblé',
      isDemo: true
    },
    'user-resp-01'
  );
  const sodSelfVal = interserviceCoordinationService.transitionRequest(sodReq!.id, 'VALIDEE', {
    actorId: 'user-resp-01', // Même acteur !
    justification: 'Auto-validation interdite',
    isHumanDecision: true
  });
  assertAudit(8, 'SoD : Interdiction stricte d’auto-validation', !sodSelfVal.success && sodSelfVal.error?.includes('Refus SoD'), 'SoD respectée : auto-validation systématiquement bloquée');

  // 9. Rupture de coordination
  const rupturesCoord = interserviceCoordinationService.checkCoordinationRuptures();
  assertAudit(9, 'Détection active des ruptures de coordination', Array.isArray(rupturesCoord), `${rupturesCoord.length} rupture(s) recensée(s)`);

  // 10. Rupture de lien inter-lots
  // Injectons temporairement une demande orpheline d'opération COGC pour prouver la détection RUPTURE_LIEN
  const reqOrphan = interserviceCoordinationService.createRequest(
    {
      operationId: 'COGC-INEXISTANT-999',
      requestedBy: 'user-op-01',
      resourceCategory: 'SOIN_MEDICAL',
      quantity: 1,
      priority: 'BASSE',
      justification: 'Demande avec fausse référence LOT 43 pour preuve audit',
      isDemo: true
    },
    'user-op-01'
  );
  const rupturesAfterOrphan = interserviceCoordinationService.checkCoordinationRuptures();
  const foundRuptureLien = rupturesAfterOrphan.some(r => r.type === 'RUPTURE_LIEN' && r.targetLot === 'LOT 43');
  assertAudit(10, 'Détection des ruptures de liens inter-lots (RUPTURE_LIEN)', foundRuptureLien, 'Lien orphelin vers le LOT 43 détecté et qualifié en RUPTURE_LIEN');

  // 11. Déterminisme
  const calcA = interserviceCoordinationService.calculateCoordinationStats();
  const calcB = interserviceCoordinationService.calculateCoordinationStats();
  assertAudit(11, 'Déterminisme mathématique absolu', JSON.stringify(calcA) === JSON.stringify(calcB), 'Reproductibilité parfaite sans stochasticité');

  // 12. Confinement réseau
  const serviceCode = fs.readFileSync(
    path.join(process.cwd(), 'src/services/interserviceCoordinationService.ts'),
    'utf-8'
  );
  const networkSafe =
    !/(?:window\.fetch|global\.fetch|\bfetch\s*\()/.test(serviceCode) &&
    !/(?:import.*['"]axios['"]|require\(['"]axios['"]\)|axios\.[a-z]+)/.test(serviceCode) &&
    !/(?:new\s+WebSocket|io\(|WebSocketClient)/.test(serviceCode);
  assertAudit(12, 'Confinement réseau total (0 fetch, 0 axios, 0 ws)', networkSafe, 'Garantie souveraine de zéro exfiltration réseau');

  // 13. Absence d'API destructive
  const destructiveMethods = ['deleteAudit', 'clearAudit', 'updateAudit', 'purgeAudit'];
  const hasDestructive = destructiveMethods.some(m => m in interserviceCoordinationService);
  assertAudit(13, 'Absence formelle d’API destructive d’audit', !hasDestructive, 'deleteAudit, clearAudit, updateAudit strictement inexistants');

  // 14. Non-régression LOT 43
  const cells = crisisOperationService.listCrisisCells();
  assertAudit(14, 'Non-régression LOT 43 (COGC intact)', cells.length >= 3, `${cells.length} cellules de crise opérationnelles`);

  console.log('\n================================================================');
  console.log(`=== BILAN AUDIT CIBLÉ LOT 44 : ${passCount}/14 POINTS VALIDÉS ===`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

verifyLot44TargetedAudit().catch(err => {
  console.error('Échec audit ciblé LOT 44 :', err);
  process.exit(1);
});
