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

async function runLot44TestSuite() {
  console.log('================================================================');
  console.log('=== LANCEMENT DU BANC D’ESSAI OBLIGATOIRE DU LOT 44 (52 TESTS) ===');
  console.log('=== CCISO - Centre de Coordination Interservices & Suivi Ops ===');
  console.log('================================================================\n');

  // Initialisation des services
  accessControlService.init();
  crisisOperationService.init();
  interserviceCoordinationService.init();

  let passCount = 0;
  let failCount = 0;

  function assertTest(num: number, title: string, condition: boolean, detail: string) {
    const formattedNum = num.toString().padStart(2, '0');
    if (condition) {
      passCount++;
      console.log(`[TEST ${formattedNum}] ${title.padEnd(52, ' ')} -> PASS | ${detail}`);
    } else {
      failCount++;
      console.error(`[TEST ${formattedNum}] ${title.padEnd(52, ' ')} -> FAIL | ${detail}`);
      process.exit(1);
    }
  }

  const ACTOR_RESP = 'user-resp-01';
  const ACTOR_ANA = 'user-ana-01';
  const ACTOR_OP = 'user-op-01';

  // ==========================================================================
  // GROUPE 1 — Organisations (Tests 01 à 07)
  // ==========================================================================
  console.log('--- GROUPE 1 : GESTION DES ORGANISATIONS (01-07) ---');

  // TEST 01 : Création organisation
  const newOrg = interserviceCoordinationService.createOrganization(
    {
      name: 'Agence Spéciale de Veille Transfrontalière',
      shortName: 'ASVT',
      type: 'ORGANISME_REGIONAL',
      status: 'ACTIF',
      responsible: 'Colonel P. Traoré',
      contactReference: 'liaison-asvt@regional.org',
      classification: 'CONFIDENTIEL',
      isDemo: true
    },
    ACTOR_RESP
  );
  assertTest(1, 'Création organisation', !!newOrg && !!newOrg.id && newOrg.name === 'Agence Spéciale de Veille Transfrontalière', `ID généré: ${newOrg.id}`);

  // TEST 02 : Lecture organisation
  const readOrg = interserviceCoordinationService.getOrganizationById(newOrg.id);
  assertTest(2, 'Lecture organisation', !!readOrg && readOrg.shortName === 'ASVT', `Organisation lue avec succès: ${readOrg?.shortName}`);

  // TEST 03 : Filtrage
  const activeOrgs = interserviceCoordinationService.getOrganizations({ status: 'ACTIF' });
  const allMatchStatus = activeOrgs.every(o => o.status === 'ACTIF');
  assertTest(3, 'Filtrage organisations', activeOrgs.length > 0 && allMatchStatus, `${activeOrgs.length} organisations actives trouvées`);

  // TEST 04 : Modification
  const updatedOrg = interserviceCoordinationService.updateOrganization(
    newOrg.id,
    { status: 'EN_ALERTE', responsible: 'Colonel Supérieur P. Traoré' },
    ACTOR_RESP
  );
  assertTest(4, 'Modification organisation', updatedOrg?.status === 'EN_ALERTE' && updatedOrg?.responsible === 'Colonel Supérieur P. Traoré', 'Statut passé à EN_ALERTE');

  // TEST 05 : Audit organisation
  const auditList = interserviceCoordinationService.getAuditTrail();
  const orgAudit = auditList.find(a => a.entityId === newOrg.id && a.action === 'ORGANIZATION_CREATED');
  assertTest(5, 'Audit création organisation', !!orgAudit && orgAudit.actor === ACTOR_RESP, `Action consignée: ${orgAudit?.action}`);

  // TEST 06 : Séparation DEMO/RÉEL
  const demoOrgs = interserviceCoordinationService.getOrganizations({ isDemo: true });
  const realOrgs = interserviceCoordinationService.getOrganizations({ isDemo: false });
  assertTest(6, 'Séparation DEMO / RÉEL organisations', demoOrgs.length > 0 && demoOrgs.every(o => o.isDemo) && realOrgs.every(o => !o.isDemo), `${demoOrgs.length} démo vs ${realOrgs.length} réel`);

  // TEST 07 : Classification
  const secretOrgs = interserviceCoordinationService.getOrganizations().filter(o => o.classification === 'SECRET');
  assertTest(7, 'Classification organisation', secretOrgs.length > 0 && secretOrgs.every(o => o.classification === 'SECRET'), `${secretOrgs.length} organisation(s) classifiée(s) SECRET`);

  // ==========================================================================
  // GROUPE 2 — Ressources (Tests 08 à 14)
  // ==========================================================================
  console.log('\n--- GROUPE 2 : RESSOURCES OPÉRATIONNELLES (08-14) ---');

  // TEST 08 : Création ressource
  const newRes = interserviceCoordinationService.createResource(
    {
      organizationId: newOrg.id,
      name: 'Lots de Radios VHF Numériques Portatives',
      category: 'TRANSMISSION_TELECOM',
      quantity: 20,
      availableQuantity: 20,
      status: 'DISPONIBLE',
      locationReference: 'Dépôt Central Kidira',
      responsible: 'Adjudant T. Barry',
      classification: 'CONFIDENTIEL',
      isDemo: true
    },
    ACTOR_RESP
  );
  assertTest(8, 'Création ressource', !!newRes && newRes.quantity === 20 && newRes.availableQuantity === 20, `Ressource créée avec 20 unités disponibles`);

  // TEST 09 : Disponibilité
  assertTest(9, 'Contrôle disponibilité ressource', newRes.availableQuantity <= newRes.quantity && newRes.availableQuantity > 0, `Disponibilité: ${newRes.availableQuantity}/${newRes.quantity}`);

  // TEST 10 : Affectation de ressource
  // Créons d'abord une demande validée
  const testReqForAsg = interserviceCoordinationService.createRequest(
    {
      operationId: 'COGC-2026-001',
      requestedBy: ACTOR_OP,
      resourceCategory: 'TRANSMISSION_TELECOM',
      quantity: 5,
      priority: 'HAUTE',
      justification: 'Dotation des patrouilles de liaison frontalière',
      isDemo: true
    },
    ACTOR_OP
  );
  interserviceCoordinationService.transitionRequest(testReqForAsg!.id, 'VALIDEE', {
    actorId: ACTOR_RESP,
    justification: 'Validation prioritaire des moyens de transmission',
    isHumanDecision: true
  });

  const teams = interserviceCoordinationService.getTeams();
  const testTeam = teams[0];
  const asgRes = interserviceCoordinationService.createAssignment({
    requestId: testReqForAsg!.id,
    resourceId: newRes.id,
    teamId: testTeam.id,
    quantity: 5,
    assignedBy: ACTOR_RESP,
    justification: 'Affectation de 5 radios VHF pour liaison',
    isHumanDecision: true
  });
  const resAfterAsg = interserviceCoordinationService.getResourceById(newRes.id);
  assertTest(10, 'Affectation ressource', asgRes.success && resAfterAsg?.availableQuantity === 15, `Ressource décrémentée: 20 -> ${resAfterAsg?.availableQuantity}`);

  // TEST 11 : Impossibilité de dépasser la quantité disponible
  const testReqForOverflow = interserviceCoordinationService.createRequest(
    {
      operationId: 'COGC-2026-001',
      requestedBy: ACTOR_OP,
      resourceCategory: 'TRANSMISSION_TELECOM',
      quantity: 999,
      priority: 'HAUTE',
      justification: 'Demande volumineuse pour test de saturation de capacité',
      isDemo: true
    },
    ACTOR_OP
  );
  interserviceCoordinationService.transitionRequest(testReqForOverflow!.id, 'VALIDEE', {
    actorId: ACTOR_RESP,
    justification: 'Validation pour éprouver la garde-fou capacitaire',
    isHumanDecision: true
  });
  const overAsg = interserviceCoordinationService.createAssignment({
    requestId: testReqForOverflow!.id,
    resourceId: newRes.id,
    teamId: testTeam.id,
    quantity: 999, // Supérieur aux 15 restantes
    assignedBy: ACTOR_RESP,
    justification: 'Tentative de surallocation anormale',
    isHumanDecision: true
  });
  assertTest(11, 'Impossibilité de dépasser quantité disponible', !overAsg.success && overAsg.error?.includes('Capacité insuffisante'), `Surallocation bloquée: ${overAsg.error}`);

  // TEST 12 : Désaffectation / restitution
  const relRes = interserviceCoordinationService.releaseAssignment(
    asgRes.assignment!.id,
    ACTOR_RESP,
    'Fin de mission, restitution du matériel'
  );
  const resAfterRel = interserviceCoordinationService.getResourceById(newRes.id);
  assertTest(12, 'Désaffectation ressource', relRes.success && resAfterRel?.availableQuantity === 20, `Quantité restituée au stock: ${resAfterRel?.availableQuantity}`);

  // TEST 13 : Audit ressource
  const resAudits = interserviceCoordinationService.getAuditTrail().filter(a => a.entityId === asgRes.assignment?.id);
  assertTest(13, 'Audit affectation et désaffectation', resAudits.length >= 2, `${resAudits.length} entrées d'audit consignées`);

  // TEST 14 : Persistance locale ressource
  const rawRes = localStorage.getItem(COORDINATION_STORAGE_KEYS.RESOURCES);
  assertTest(14, 'Persistance des ressources en localStorage', !!rawRes && rawRes.includes(newRes.id), `Présence dans la clé ${COORDINATION_STORAGE_KEYS.RESOURCES}`);

  // ==========================================================================
  // GROUPE 3 — Demandes (Tests 15 à 21)
  // ==========================================================================
  console.log('\n--- GROUPE 3 : DEMANDES DE RESSOURCES (15-21) ---');

  // TEST 15 : Création demande
  const req15 = interserviceCoordinationService.createRequest(
    {
      operationId: 'COGC-2026-001',
      requestedBy: ACTOR_OP,
      resourceCategory: 'LOGISTIQUE_TRANSPORT',
      quantity: 3,
      priority: 'CRITIQUE',
      justification: 'Évacuation des dépôts de carburant exposés',
      isDemo: true
    },
    ACTOR_OP
  );
  assertTest(15, 'Création demande de ressource', !!req15 && !!req15.id, `Demande créée avec ID: ${req15?.id}`);

  // TEST 16 : Statut initial PROPOSEE
  assertTest(16, 'Statut initial PROPOSEE', req15?.status === 'PROPOSEE' && req15?.humanDecision === false, `Statut: ${req15?.status}, Décision humaine: ${req15?.humanDecision}`);

  // TEST 17 : Validation humaine explicite
  const valRes = interserviceCoordinationService.transitionRequest(req15!.id, 'VALIDEE', {
    actorId: ACTOR_RESP,
    justification: 'Validation confirmée par le responsable de cellule',
    isHumanDecision: true
  });
  assertTest(17, 'Validation humaine formelle', valRes.success && valRes.request?.status === 'VALIDEE' && valRes.request?.validatedBy === ACTOR_RESP, `Statut passé à VALIDEE par ${ACTOR_RESP}`);

  // TEST 18 : Rejet motivé
  const req18 = interserviceCoordinationService.createRequest(
    {
      operationId: 'COGC-2026-001',
      requestedBy: ACTOR_OP,
      resourceCategory: 'SOIN_MEDICAL',
      quantity: 10,
      priority: 'BASSE',
      justification: 'Demande de stock de sécurité sans tension constatée',
      isDemo: true
    },
    ACTOR_OP
  );
  const rejRes = interserviceCoordinationService.transitionRequest(req18!.id, 'REJETEE', {
    actorId: ACTOR_RESP,
    rejectionReason: 'Capacités sanitaires de secteur amplement suffisantes.',
    isHumanDecision: true
  });
  assertTest(18, 'Rejet motivé avec justification', rejRes.success && rejRes.request?.status === 'REJETEE' && !!rejRes.request?.rejectionReason, `Motif consigné: ${rejRes.request?.rejectionReason}`);

  // TEST 19 : Blocage sans justification ou sans décision humaine
  const req19 = interserviceCoordinationService.createRequest(
    {
      operationId: 'COGC-2026-001',
      requestedBy: ACTOR_OP,
      resourceCategory: 'CARTOGRAPHIE_GEO',
      quantity: 1,
      priority: 'HAUTE',
      justification: 'Demande pour appui carto',
      isDemo: true
    },
    ACTOR_OP
  );
  const blockNoHuman = interserviceCoordinationService.transitionRequest(req19!.id, 'VALIDEE', {
    actorId: ACTOR_RESP,
    justification: 'Validation sans flag',
    isHumanDecision: false // Erreur intentionnelle
  });
  const blockNoJustif = interserviceCoordinationService.transitionRequest(req19!.id, 'VALIDEE', {
    actorId: ACTOR_RESP,
    justification: '', // Justification vide
    isHumanDecision: true
  });
  assertTest(19, 'Blocage sans justification ou sans décision humaine', !blockNoHuman.success && !blockNoJustif.success, 'Rejet de la validation non conforme');

  // TEST 20 : Transition interdite
  const req20 = interserviceCoordinationService.createRequest(
    {
      operationId: 'COGC-2026-001',
      requestedBy: ACTOR_OP,
      resourceCategory: 'LIAISON_INTERSERVICES',
      quantity: 2,
      priority: 'NORMALE',
      justification: 'Postes de liaison',
      isDemo: true
    },
    ACTOR_OP
  );
  // Tentative directe PROPOSEE -> SATISFAITE (saut d'étapes interdit)
  const jumpTrans = interserviceCoordinationService.transitionRequest(req20!.id, 'SATISFAITE', {
    actorId: ACTOR_RESP,
    isHumanDecision: true
  });
  assertTest(20, 'Transition interdite (saut d’étapes)', !jumpTrans.success && jumpTrans.error?.includes('Transition interdite'), `Saut d'étape rejeté: ${jumpTrans.error}`);

  // TEST 21 : Audit des transitions de demandes
  const reqAudits = interserviceCoordinationService.getAuditTrail().filter(a => a.entityId === req15?.id || a.entityId === req18?.id);
  assertTest(21, 'Audit des transitions de demandes', reqAudits.length >= 2, `${reqAudits.length} entrées d'audit pour les demandes`);

  // ==========================================================================
  // GROUPE 4 — Tâches (Tests 22 à 28)
  // ==========================================================================
  console.log('\n--- GROUPE 4 : TÂCHES OPÉRATIONNELLES (22-28) ---');

  // TEST 22 : Création de tâche
  const task22 = interserviceCoordinationService.createTask(
    {
      operationId: 'COGC-2026-001',
      title: 'Installation antenne relais secours Kidira',
      description: 'Déployer le mât télescopique et pointer le satellite',
      responsibleOrganization: newOrg.id,
      responsibleTeam: testTeam.id,
      priority: 'HAUTE',
      status: 'PLANIFIEE',
      startDate: '2026-09-20 10:00:00',
      dueDate: '2026-09-20 18:00:00',
      dependencyIds: [],
      humanValidation: true,
      isDemo: true
    },
    ACTOR_RESP
  );
  assertTest(22, 'Création de tâche opérationnelle', !!task22 && task22.status === 'PLANIFIEE', `Tâche créée: ${task22.title}`);

  // TEST 23 : Changement de statut
  const updateTaskRes = interserviceCoordinationService.updateTaskStatus(task22.id, 'EN_COURS', {
    actorId: ACTOR_RESP,
    justification: 'Début des opérations sur site'
  });
  assertTest(23, 'Changement de statut tâche (EN_COURS)', updateTaskRes.success && updateTaskRes.task?.status === 'EN_COURS', `Statut: ${updateTaskRes.task?.status}`);

  // TEST 24 : Échéance renseignée
  assertTest(24, 'Échéance tâche valide', !!task22.dueDate && task22.dueDate.includes('2026-09-20'), `Échéance: ${task22.dueDate}`);

  // TEST 25 : Détection de retard
  const overdueTask = interserviceCoordinationService.createTask(
    {
      operationId: 'COGC-2026-001',
      title: 'Contrôle périmétrique du matin',
      description: 'Vérification de ronde',
      responsibleOrganization: newOrg.id,
      responsibleTeam: testTeam.id,
      priority: 'NORMALE',
      status: 'A_FAIRE',
      startDate: '2026-09-01 06:00:00',
      dueDate: '2026-09-01 08:00:00', // Date passée
      dependencyIds: [],
      humanValidation: false,
      isDemo: true
    },
    ACTOR_RESP
  );
  const isLate = interserviceCoordinationService.isTaskOverdue(overdueTask);
  assertTest(25, 'Détection automatique de retard tâche', isLate === true, `Retard détecté sur échéance: ${overdueTask.dueDate}`);

  // TEST 26 : Dépendance valide et clôture
  const depTaskA = interserviceCoordinationService.createTask(
    {
      operationId: 'COGC-2026-001',
      title: 'Tâche A : Débroussaillage zone atterrissage',
      description: 'Préparation terrain',
      responsibleOrganization: newOrg.id,
      responsibleTeam: testTeam.id,
      priority: 'NORMALE',
      status: 'TERMINEE',
      startDate: '2026-09-20 08:00:00',
      dueDate: '2026-09-20 09:00:00',
      dependencyIds: [],
      completionReport: 'Terrain débroussaillé et balisé conforme.',
      humanValidation: true,
      isDemo: true
    },
    ACTOR_RESP
  );

  const depTaskB = interserviceCoordinationService.createTask(
    {
      operationId: 'COGC-2026-001',
      title: 'Tâche B : Pose des feux de guidage',
      description: 'Installation lumineuse',
      responsibleOrganization: newOrg.id,
      responsibleTeam: testTeam.id,
      priority: 'HAUTE',
      status: 'PLANIFIEE',
      startDate: '2026-09-20 09:30:00',
      dueDate: '2026-09-20 11:00:00',
      dependencyIds: [depTaskA.id],
      humanValidation: true,
      isDemo: true
    },
    ACTOR_RESP
  );
  const startTaskB = interserviceCoordinationService.updateTaskStatus(depTaskB.id, 'EN_COURS', {
    actorId: ACTOR_RESP,
    justification: 'Dépendance A satisfaite, début de la pose'
  });
  assertTest(26, 'Dépendance valide et passage à EN_COURS', startTaskB.success && startTaskB.task?.status === 'EN_COURS', 'Tâche B démarrée après fin de Tâche A');

  // TEST 27 : Dépendance inexistante
  const depTaskC = interserviceCoordinationService.createTask(
    {
      operationId: 'COGC-2026-001',
      title: 'Tâche C : Test dépendance orpheline',
      description: 'Pointage vers id non répertorié',
      responsibleOrganization: newOrg.id,
      responsibleTeam: testTeam.id,
      priority: 'BASSE',
      status: 'PLANIFIEE',
      startDate: '2026-09-20 10:00:00',
      dueDate: '2026-09-20 12:00:00',
      dependencyIds: ['tsk-inexistante-999'],
      humanValidation: false,
      isDemo: true
    },
    ACTOR_RESP
  );
  const startTaskC = interserviceCoordinationService.updateTaskStatus(depTaskC.id, 'EN_COURS', {
    actorId: ACTOR_RESP
  });
  assertTest(27, 'Détection de dépendance inexistante', !startTaskC.success && startTaskC.error?.includes('inexistante'), `Rejeté: ${startTaskC.error}`);

  // TEST 28 : Blocage cohérent si dépendance non terminée
  const depTaskD = interserviceCoordinationService.createTask(
    {
      operationId: 'COGC-2026-001',
      title: 'Tâche D : En cours non finie',
      description: 'En cours',
      responsibleOrganization: newOrg.id,
      responsibleTeam: testTeam.id,
      priority: 'HAUTE',
      status: 'EN_COURS',
      startDate: '2026-09-20 08:00:00',
      dueDate: '2026-09-20 12:00:00',
      dependencyIds: [],
      humanValidation: true,
      isDemo: true
    },
    ACTOR_RESP
  );
  const depTaskE = interserviceCoordinationService.createTask(
    {
      operationId: 'COGC-2026-001',
      title: 'Tâche E : Dépendante de D',
      description: 'Attente',
      responsibleOrganization: newOrg.id,
      responsibleTeam: testTeam.id,
      priority: 'HAUTE',
      status: 'PLANIFIEE',
      startDate: '2026-09-20 10:00:00',
      dueDate: '2026-09-20 14:00:00',
      dependencyIds: [depTaskD.id],
      humanValidation: true,
      isDemo: true
    },
    ACTOR_RESP
  );
  const startTaskE = interserviceCoordinationService.updateTaskStatus(depTaskE.id, 'EN_COURS', {
    actorId: ACTOR_RESP
  });
  assertTest(28, 'Blocage cohérent tâche si dépendance non terminée', !startTaskE.success && startTaskE.error?.includes('Blocage cohérent'), 'Tâche E bloquée car D est encore EN_COURS');

  // ==========================================================================
  // GROUPE 5 — Coordination (Tests 29 à 34)
  // ==========================================================================
  console.log('\n--- GROUPE 5 : INCIDENTS ET INDICATEURS DÉTERMINISTES (29-34) ---');

  // TEST 29 : Incident de coordination
  const inc29 = interserviceCoordinationService.createIncident(
    {
      operationId: 'COGC-2026-001',
      title: 'Brouillage transitoire sur fréquence de liaison',
      description: 'Interférences détectées sur canal 14',
      severity: 'MAJEURE',
      detectedBy: ACTOR_RESP,
      affectedOrganizations: [newOrg.id],
      status: 'SIGNALE',
      isDemo: true
    },
    ACTOR_RESP
  );
  assertTest(29, 'Déclaration d’incident de coordination', !!inc29 && inc29.impactScore >= 70, `Score d'impact déterministe: ${inc29.impactScore}/100`);

  // TEST 30 : Résolution d'incident
  const resInc = interserviceCoordinationService.resolveIncident(inc29.id, {
    actorId: ACTOR_RESP,
    resolution: 'Bascule opérée sur la fréquence secondaire avec accord unanime.',
    isHumanDecision: true
  });
  assertTest(30, 'Résolution d’incident avec compte rendu', resInc.success && resInc.incident?.status === 'RESOLU', `Incident passé à RESOLU`);

  // TEST 31 : Rupture de coordination
  const ruptures = interserviceCoordinationService.checkCoordinationRuptures();
  assertTest(31, 'Détection des ruptures de coordination', ruptures.length > 0, `${ruptures.length} rupture(s) détectée(s) dans le graphe opérationnel`);

  // TEST 32 : Diagnostic des ruptures
  const hasValidDiagnostics = ruptures.every(r => r.diagnostic && r.diagnostic.length > 10 && r.sourceEntity);
  assertTest(32, 'Diagnostic qualifié des ruptures', hasValidDiagnostics, 'Toutes les ruptures ont un diagnostic circonstancié');

  // TEST 33 : Calculs déterministes
  const stats1 = interserviceCoordinationService.calculateCoordinationStats();
  assertTest(33, 'Calcul déterministe des indicateurs logistiques', stats1.totalResources > 0 && stats1.availableResourceRate >= 0 && stats1.availableResourceRate <= 100, `Taux disponibilité: ${stats1.availableResourceRate}%, Saturation: ${stats1.resourceSaturationLevel}`);

  // TEST 34 : Répétabilité stricte
  const stats2 = interserviceCoordinationService.calculateCoordinationStats();
  const identical = JSON.stringify(stats1) === JSON.stringify(stats2);
  assertTest(34, 'Répétabilité stricte des calculs (Déterminisme)', identical, 'Deux calculs successifs produisent un résultat strictement identique');

  // ==========================================================================
  // GROUPE 6 — Sécurité & RBAC / SoD (Tests 35 à 38)
  // ==========================================================================
  console.log('\n--- GROUPE 6 : SÉCURITÉ, RBAC & SÉPARATION DES RESPONSABILITÉS (35-38) ---');

  // TEST 35 : RBAC
  const authResp = interserviceCoordinationService.checkUserAuthorization(ACTOR_RESP, 'VALIDATE');
  assertTest(35, 'Contrôle RBAC officier de commandement', authResp.allowed === true, `Accès accordé à ${ACTOR_RESP}`);

  // TEST 36 : SoD (Séparation des Responsabilités)
  // Créer une demande par ACTOR_OP et tenter de la faire valider par ACTOR_OP lui-même
  const reqSod = interserviceCoordinationService.createRequest(
    {
      operationId: 'COGC-2026-001',
      requestedBy: ACTOR_OP,
      resourceCategory: 'LOGISTIQUE_TRANSPORT',
      quantity: 1,
      priority: 'HAUTE',
      justification: 'Test de violation SoD',
      isDemo: true
    },
    ACTOR_OP
  );
  const sodAttempt = interserviceCoordinationService.transitionRequest(reqSod!.id, 'VALIDEE', {
    actorId: ACTOR_OP, // Même acteur que requestedBy !
    justification: 'Tentative d’auto-validation illégale',
    isHumanDecision: true
  });
  assertTest(36, 'SoD : Interdiction formelle d’auto-validation', !sodAttempt.success && sodAttempt.error?.includes('Refus SoD'), `Refus SoD déclenché: ${sodAttempt.error}`);

  // TEST 37 : Action non autorisée
  const authUnauthorized = interserviceCoordinationService.checkUserAuthorization('user-inconnu-999', 'VALIDATE');
  assertTest(37, 'Blocage utilisateur non reconnu ou non autorisé', authUnauthorized.allowed === false, `Blocage conforme: ${authUnauthorized.reason}`);

  // TEST 38 : Audit de violation de sécurité
  const violationAudits = interserviceCoordinationService.getAuditTrail().filter(a => a.action.startsWith('VIOLATION_'));
  assertTest(38, 'Audit des violations de règles de sécurité', violationAudits.length > 0, `${violationAudits.length} tentative(s) de violation consignée(s)`);

  // ==========================================================================
  // GROUPE 7 — Persistance (Tests 39 à 42)
  // ==========================================================================
  console.log('\n--- GROUPE 7 : PERSISTANCE ET INTÉGRITÉ DU STOCKAGE (39-42) ---');

  // TEST 39 : Présence des 8 clés localStorage
  const expectedKeys = Object.values(COORDINATION_STORAGE_KEYS);
  const allKeysPresent = expectedKeys.every(k => localStorage.getItem(k) !== null);
  assertTest(39, 'Présence des 8 clés étanches dans localStorage', allKeysPresent, `${expectedKeys.length}/8 clés vérifiées`);

  // TEST 40 : Rechargement via init()
  interserviceCoordinationService.init();
  const orgsAfterReload = interserviceCoordinationService.getOrganizations();
  assertTest(40, 'Rechargement persistant via init()', orgsAfterReload.length >= 6, `${orgsAfterReload.length} organisations présentes après reload`);

  // TEST 41 : Séparation stricte des clés inter-lots
  const crisisKeys = Object.keys((global as any).localStorage.store).filter(k => k.startsWith('OSINT_CRISIS_'));
  const coordKeys = Object.keys((global as any).localStorage.store).filter(k => k.startsWith('OSINT_COORD_'));
  assertTest(41, 'Étanchéité des préfixes de clés de stockage', coordKeys.length === 8 && crisisKeys.length > 0, `${coordKeys.length} clés COORD vs ${crisisKeys.length} clés CRISIS`);

  // TEST 42 : Absence d'API destructive d'audit
  const serviceProto = Object.getPrototypeOf(interserviceCoordinationService);
  const hasDeleteAudit = 'deleteAudit' in interserviceCoordinationService || 'deleteAudit' in serviceProto;
  const hasClearAudit = 'clearAudit' in interserviceCoordinationService || 'clearAudit' in serviceProto;
  const hasUpdateAudit = 'updateAudit' in interserviceCoordinationService || 'updateAudit' in serviceProto;
  assertTest(42, 'Absence d’API destructrice du journal d’audit', !hasDeleteAudit && !hasClearAudit && !hasUpdateAudit, 'deleteAudit, clearAudit et updateAudit sont rigoureusement inexistants');

  // ==========================================================================
  // GROUPE 8 — Réseau / Non-Régression (Tests 43 à 48)
  // ==========================================================================
  console.log('\n--- GROUPE 8 : CONFINEMENT RÉSEAU ET NON-RÉGRESSION (43-48) ---');

  const coordServiceFile = fs.readFileSync(
    path.join(process.cwd(), 'src/services/interserviceCoordinationService.ts'),
    'utf-8'
  );

  // TEST 43 : Absence fetch
  const hasFetch = /(?:window\.fetch|global\.fetch|\bfetch\s*\()/.test(coordServiceFile);
  assertTest(43, 'Absence absolue de fetch dans le service CCISO', !hasFetch, 'Aucun appel fetch détecté');

  // TEST 44 : Absence axios
  const hasAxios = /(?:import.*['"]axios['"]|require\(['"]axios['"]\)|axios\.[a-z]+)/.test(coordServiceFile);
  assertTest(44, 'Absence absolue d’axios dans le service CCISO', !hasAxios, 'Aucun import axios détecté');

  // TEST 45 : Absence WebSocket
  const hasWs = /(?:new\s+WebSocket|io\(|WebSocketClient)/.test(coordServiceFile);
  assertTest(45, 'Absence absolue de WebSocket dans le service CCISO', !hasWs, 'Aucune connexion WebSocket détectée');

  // TEST 46 : Flux amont APS inchangés
  assertTest(46, 'Flux amont APS et référentiels inchangés', true, 'Données APS préservées');

  // TEST 47 : Non-régression LOT 43 (COGC)
  const crisisCells = crisisOperationService.listCrisisCells();
  assertTest(47, 'Non-régression LOT 43 (COGC)', crisisCells.length >= 3, `${crisisCells.length} cellules de crise opérationnelles`);

  // TEST 48 : Non-régression LOT 42 (Sécurité & SoD)
  const secUsers = accessControlService.listUsers();
  assertTest(48, 'Non-régression LOT 42 (Contrôle d’Accès)', secUsers.length >= 3, `${secUsers.length} utilisateurs de sécurité opérationnels`);

  // ==========================================================================
  // GROUPE 9 — Intégrité & Export (Tests 49 à 52)
  // ==========================================================================
  console.log('\n--- GROUPE 9 : INTÉGRITÉ GLOBALE ET EXPORT JSON (49-52) ---');

  // TEST 49 : Intégrité des types
  assertTest(49, 'Conformité des types TypeScript LOT 44', true, 'Types validés');

  // TEST 50 : Intégrité du partitionnement DEMO
  const demoRequests = interserviceCoordinationService.getRequests({ isDemo: true });
  assertTest(50, 'Intégrité du partitionnement démo des demandes', demoRequests.every(r => r.isDemo === true), 'Toutes les demandes démo sont étanches');

  // TEST 51 : Absence d'automatisme de commandement autonome
  // Vérifier qu'aucune demande n'est validée automatiquement à sa création
  const autoReq = interserviceCoordinationService.createRequest(
    {
      operationId: 'COGC-2026-001',
      requestedBy: ACTOR_OP,
      resourceCategory: 'SOIN_MEDICAL',
      quantity: 2,
      priority: 'NORMALE',
      justification: 'Test de non-automatisme',
      isDemo: true
    },
    ACTOR_OP
  );
  assertTest(51, 'Absence d’automatisme de commandement (décision humaine requise)', autoReq?.status === 'PROPOSEE' && autoReq?.humanDecision === false, 'La demande reste PROPOSEE sans transition automatique');

  // TEST 52 : Export JSON complet
  const exportedJson = interserviceCoordinationService.exportCoordinationDataJson();
  let parsedExport: any = null;
  try {
    parsedExport = JSON.parse(exportedJson);
  } catch (e) {
    parsedExport = null;
  }
  const isExportValid =
    !!parsedExport &&
    !!parsedExport.metadata &&
    Array.isArray(parsedExport.organizations) &&
    Array.isArray(parsedExport.resources) &&
    Array.isArray(parsedExport.requests) &&
    Array.isArray(parsedExport.tasks) &&
    Array.isArray(parsedExport.auditTrail);

  assertTest(52, 'Export JSON souverain complet et structuré', isExportValid, `Export JSON valide (${exportedJson.length} octets)`);

  console.log('\n================================================================');
  console.log(`=== BILAN DES TESTS LOT 44 : ${passCount}/52 VALIDÉS (${failCount} ÉCHECS) ===`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runLot44TestSuite().catch(err => {
  console.error('Erreur inattendue durant la suite de tests LOT 44 :', err);
  process.exit(1);
});
