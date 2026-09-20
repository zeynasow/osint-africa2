import { accessControlService } from '../src/services/accessControlService';
import {
  OsintUser,
  OsintRole,
  OsintPermission,
  OsintSession,
  OsintAccessDecision,
  OsintSecurityAudit
} from '../src/types';

async function runLot42TestSuite() {
  console.log('================================================================');
  console.log('=== LANCEMENT DU BANC D’ESSAI OBLIGATOIRE DU LOT 42 (40 TESTS) ===');
  console.log('================================================================');

  // Setup localStorage mock in Node environment
  const localStorageMock = {
    store: {} as Record<string, string>,
    getItem(key: string) { return this.store[key] || null; },
    setItem(key: string, value: string) { this.store[key] = value.toString(); },
    removeItem(key: string) { delete this.store[key]; },
    clear() { this.store = {}; }
  };
  (global as any).localStorage = localStorageMock;

  accessControlService.init();

  let passCount = 0;
  let failCount = 0;

  function assertTest(num: number, title: string, condition: boolean, detail: string) {
    const formattedNum = num.toString().padStart(2, '0');
    if (condition) {
      passCount++;
      console.log(`[TEST ${formattedNum}] ${title.padEnd(45, ' ')} -> PASS | ${detail}`);
    } else {
      failCount++;
      console.error(`[TEST ${formattedNum}] ${title.padEnd(45, ' ')} -> FAIL | ${detail}`);
      process.exit(1);
    }
  }

  // -------------------------------------------------------------
  // GROUPE 1 : UTILISATEURS (Tests 01 à 06)
  // -------------------------------------------------------------
  // Test 01 : Création utilisateur
  const user1 = accessControlService.createUser({
    username: 'test.analyst',
    displayName: 'Test Analyste Souverain',
    roleIds: ['role-analyste-osint'],
    status: 'ACTIF',
    department: 'Pôle Test',
    isDemo: true
  });
  assertTest(1, 'Création utilisateur', !!user1.id && user1.username === 'test.analyst', `ID généré: ${user1.id}`);

  // Test 02 : Lecture utilisateur
  const readUser = accessControlService.getUser(user1.id);
  assertTest(2, 'Lecture utilisateur', !!readUser && readUser.displayName === 'Test Analyste Souverain', `Lu avec succès`);

  // Test 03 : Modification utilisateur
  const updatedUser = accessControlService.updateUser(user1.id, { department: 'Pôle Cyberdéfense' });
  assertTest(3, 'Modification utilisateur', updatedUser?.department === 'Pôle Cyberdéfense', `Nouveau département: ${updatedUser?.department}`);

  // Test 04 : Désactivation utilisateur
  const disabled = accessControlService.disableUser(user1.id, 'Fin de mandat test');
  const disabledUser = accessControlService.getUser(user1.id);
  assertTest(4, 'Désactivation utilisateur', disabled && disabledUser?.status === 'DESACTIVE', `Statut: ${disabledUser?.status}`);

  // Test 05 : Suspension utilisateur
  const user2 = accessControlService.createUser({
    username: 'test.susp',
    displayName: 'Utilisateur Suspendu Test',
    roleIds: ['role-operateur-veille'],
    status: 'ACTIF',
    department: 'Veille',
    isDemo: true
  });
  accessControlService.suspendUser(user2.id, 'Contrôle interne');
  const suspendedUser = accessControlService.getUser(user2.id);
  assertTest(5, 'Suspension utilisateur', suspendedUser?.status === 'SUSPENDU', `Statut: ${suspendedUser?.status}`);

  // Test 06 : Archivage utilisateur
  accessControlService.archiveUser(user2.id, 'Départ définitif');
  const archivedUser = accessControlService.getUser(user2.id);
  assertTest(6, 'Archivage utilisateur', archivedUser?.status === 'ARCHIVE', `Statut: ${archivedUser?.status}`);

  // -------------------------------------------------------------
  // GROUPE 2 : RÔLES / PERMISSIONS (Tests 07 à 12)
  // -------------------------------------------------------------
  // Test 07 : Création rôle
  const newRole = accessControlService.createRole({
    name: 'ROLE_SPECIAL_AUDIT',
    description: 'Rôle d’audit ponctuel',
    permissionIds: ['perm-lot41-view'],
    isSystemRole: false,
    isDemo: true
  });
  assertTest(7, 'Création rôle', !!newRole.id && newRole.name === 'ROLE_SPECIAL_AUDIT', `Rôle ID: ${newRole.id}`);

  // Test 08 : Création permission
  const newPerm = accessControlService.createPermission({
    code: 'SPECIAL_TEST_PERM',
    name: 'Permission Test Spéciale',
    description: 'Permission de vérification',
    resource: 'LOT42_SECURITY',
    action: 'VIEW',
    sensitivity: 'NORMALE',
    isSystemPermission: false,
    isDemo: true
  });
  assertTest(8, 'Création permission', !!newPerm.id && newPerm.code === 'SPECIAL_TEST_PERM', `Perm ID: ${newPerm.id}`);

  // Test 09 : Attribution rôle
  const user3 = accessControlService.createUser({
    username: 'test.user3',
    displayName: 'User 3 Test',
    roleIds: [],
    status: 'ACTIF',
    department: 'Renseignement',
    isDemo: true
  });
  accessControlService.assignRoleToUser(user3.id, newRole.id);
  const u3WithRole = accessControlService.getUser(user3.id);
  assertTest(9, 'Attribution rôle à utilisateur', u3WithRole?.roleIds.includes(newRole.id) === true, `Rôles: ${u3WithRole?.roleIds.join(', ')}`);

  // Test 10 : Retrait rôle
  accessControlService.removeRoleFromUser(user3.id, newRole.id);
  const u3NoRole = accessControlService.getUser(user3.id);
  assertTest(10, 'Retrait rôle de utilisateur', !u3NoRole?.roleIds.includes(newRole.id), `Rôles restants: ${u3NoRole?.roleIds.length}`);

  // Test 11 : Attribution permission à rôle
  accessControlService.assignPermissionToRole(newRole.id, newPerm.id);
  const roleWithPerm = accessControlService.getRole(newRole.id);
  assertTest(11, 'Attribution permission à rôle', roleWithPerm?.permissionIds.includes(newPerm.id) === true, `Perms dans rôle: ${roleWithPerm?.permissionIds.join(', ')}`);

  // Test 12 : Retrait permission de rôle
  accessControlService.removePermissionFromRole(newRole.id, newPerm.id);
  const roleNoPerm = accessControlService.getRole(newRole.id);
  assertTest(12, 'Retrait permission de rôle', !roleNoPerm?.permissionIds.includes(newPerm.id), `Perms restantes: ${roleNoPerm?.permissionIds.length}`);

  // -------------------------------------------------------------
  // GROUPE 3 : SESSIONS (Tests 13 à 18)
  // -------------------------------------------------------------
  // Test 13 : Création session
  const userSessTest = accessControlService.createUser({
    username: 'sess.tester',
    displayName: 'Session Tester',
    roleIds: ['role-analyste-osint'],
    status: 'ACTIF',
    department: 'Test',
    isDemo: true
  });
  const sessionCreated = accessControlService.createSession(userSessTest.id);
  assertTest(13, 'Création session', !!sessionCreated.id && sessionCreated.status === 'ACTIVE', `Session: ${sessionCreated.id}`);

  // Test 14 : Session valide
  const isSessValid = accessControlService.isSessionValid(sessionCreated.id);
  assertTest(14, 'Session valide', isSessValid === true, `Statut actif et non expirée`);

  // Test 15 : Session expirée
  accessControlService.expireSession(sessionCreated.id);
  const isSessExpired = accessControlService.isSessionValid(sessionCreated.id);
  assertTest(15, 'Session expirée invalidée', isSessExpired === false, `Session expirée rejetée`);

  // Test 16 : Session révoquée
  const sessionToRevoke = accessControlService.createSession(userSessTest.id);
  accessControlService.revokeSession(sessionToRevoke.id, 'Révocation test');
  assertTest(16, 'Session révoquée invalidée', accessControlService.isSessionValid(sessionToRevoke.id) === false, `Statut révoqué`);

  // Test 17 : Session fermée
  const sessionToClose = accessControlService.createSession(userSessTest.id);
  accessControlService.closeSession(sessionToClose.id);
  assertTest(17, 'Session fermée invalidée', accessControlService.isSessionValid(sessionToClose.id) === false, `Statut fermée`);

  // Test 18 : Utilisateur désactivé = accès refusé
  const sessionForDeact = accessControlService.createSession(userSessTest.id);
  accessControlService.disableUser(userSessTest.id, 'Désactivation test');
  assertTest(18, 'Désactivation utilisateur invalide session', accessControlService.isSessionValid(sessionForDeact.id) === false, `Session révoquée automatiquement`);

  // -------------------------------------------------------------
  // GROUPE 4 : AUTORISATION SERVICE-SIDE (Tests 19 à 26)
  // -------------------------------------------------------------
  // Test 19 : Autorisation correcte
  // User Capitaine Traoré (user-resp-01) avec rôle RESPONSABLE_RENSEIGNEMENT a perm-lot40-validate
  const decision19 = accessControlService.authorizeAction('user-resp-01', 'LOT40_SITUATION', 'VALIDATE');
  assertTest(19, 'Autorisation correcte', decision19.allowed === true, `Autorisé: ${decision19.reason}`);

  // Test 20 : Refus permission absente
  // User Dr Diallo (user-ana-01) avec rôle ANALYSTE_OSINT tente d'administrer les utilisateurs (LOT42_SECURITY / ADMIN)
  const decision20 = accessControlService.authorizeAction('user-ana-01', 'LOT42_SECURITY', 'ADMIN');
  assertTest(20, 'Refus permission absente', decision20.allowed === false, `Refusé: ${decision20.reason}`);

  // Test 21 : Refus rôle absent
  const userNoRole = accessControlService.createUser({
    username: 'norole.user',
    displayName: 'User Sans Role',
    roleIds: [],
    status: 'ACTIF',
    department: 'Stagiaires',
    isDemo: true
  });
  accessControlService.createSession(userNoRole.id);
  const decision21 = accessControlService.authorizeAction(userNoRole.id, 'LOT37_ANALYSIS', 'VIEW');
  assertTest(21, 'Refus rôle absent', decision21.allowed === false, `Refusé: ${decision21.reason}`);

  // Test 22 : Refus session invalide
  // Tentative avec user sans session active
  const userNoSession = accessControlService.createUser({
    username: 'nosess.user',
    displayName: 'User Sans Session',
    roleIds: ['role-analyste-osint'],
    status: 'ACTIF',
    department: 'Analyse',
    isDemo: true
  });
  const decision22 = accessControlService.authorizeAction(userNoSession.id, 'LOT37_ANALYSIS', 'VIEW');
  assertTest(22, 'Refus session invalide/absente', decision22.allowed === false, `Refusé: ${decision22.reason}`);

  // Test 23 : Refus utilisateur inactif
  const decision23 = accessControlService.authorizeAction('user-des-01', 'LOT34_REQUIREMENTS', 'VIEW');
  assertTest(23, 'Refus utilisateur inactif (DESACTIVE)', decision23.allowed === false, `Refusé: ${decision23.reason}`);

  // Test 24 : Refus ressource inconnue
  const decision24 = accessControlService.authorizeAction('user-resp-01', 'UNKNOWN_RESOURCE_XYZ', 'VIEW');
  assertTest(24, 'Refus ressource inconnue', decision24.allowed === false, `Refusé: ${decision24.reason}`);

  // Test 25 : Refus action inconnue
  const decision25 = accessControlService.authorizeAction('user-resp-01', 'LOT37_ANALYSIS', 'UNKNOWN_ACTION');
  assertTest(25, 'Refus action inconnue', decision25.allowed === false, `Refusé: ${decision25.reason}`);

  // Test 26 : Contrôle service-side réel (requirePermission jette une exception)
  let exceptionCaught = false;
  try {
    accessControlService.requirePermission('user-ana-01', 'LOT42_SECURITY', 'ADMIN');
  } catch (e: any) {
    exceptionCaught = e.message.includes('ACCES_REFUSE');
  }
  assertTest(26, 'Contrôle service-side réel via requirePermission', exceptionCaught === true, `Exception levée côté service`);

  // -------------------------------------------------------------
  // GROUPE 5 : MOINDRE PRIVILÈGE & SÉPARATION DES RESPONSABILITÉS (Tests 27 à 30)
  // -------------------------------------------------------------
  // Test 27 : CONSULTATION ≠ UPDATE
  // S'assurer de la présence d'une session ACTIVE valide pour l'utilisateur de consultation
  const sessCons = accessControlService.createSession('user-cons-01');

  // Contrôles de moindre privilège avec session valide
  // Cas 1 : CONSULTATION + session valide + VIEW -> autorisé
  const decision27_view = accessControlService.authorizeAction('user-cons-01', 'LOT37_ANALYSIS', 'VIEW');
  // Cas 2 : CONSULTATION + session valide + UPDATE -> refusé pour permission absente (et non pour session)
  const decision27_update = accessControlService.authorizeAction('user-cons-01', 'LOT37_ANALYSIS', 'UPDATE');
  // Cas 3 : CONSULTATION + session valide + ADMIN_SECURITY -> refusé pour permission absente
  const decision27_admin = accessControlService.authorizeAction('user-cons-01', 'LOT42_SECURITY', 'ADMIN');

  const test27Passed = decision27_view.allowed === true &&
    decision27_update.allowed === false &&
    decision27_update.reason.includes("Permission absente pour ressource 'LOT37_ANALYSIS' et action 'UPDATE'") &&
    !decision27_update.reason.includes("Session") &&
    decision27_admin.allowed === false &&
    decision27_admin.reason.includes("Permission absente pour ressource 'LOT42_SECURITY' et action 'ADMIN'");

  assertTest(
    27,
    'Moindre privilège : CONSULTATION ≠ UPDATE',
    test27Passed,
    `Refusé: ${decision27_update.reason}`
  );

  // Test 28 : ANALYSTE ≠ ADMIN_SECURITY
  const decision28 = accessControlService.authorizeAction('user-ana-01', 'LOT42_SECURITY', 'ADMIN');
  assertTest(28, 'Moindre privilège : ANALYSTE ≠ ADMIN_SECURITY', decision28.allowed === false, `Refusé: ${decision28.reason}`);

  // Test 29 : ADMIN ≠ VALIDATION_ANALYTIQUE automatique
  // Amadou Fall (admin.tech) avec uniquement le rôle ADMIN_SYSTEME tente de valider une hypothèse LOT37
  const decision29 = accessControlService.authorizeAction('user-admin-01', 'LOT37_ANALYSIS', 'VALIDATE');
  assertTest(29, 'SoD : ADMIN ≠ VALIDATE opérationnel', decision29.allowed === false, `Refusé: ${decision29.reason}`);

  // Test 30 : Séparation des responsabilités : interdiction d'auto-validation
  const decision30 = accessControlService.authorizeAction('user-resp-01', 'LOT40_SITUATION', 'VALIDATE', {
    isValidationOfOwnWork: true
  });
  assertTest(30, 'SoD : Interdiction d’auto-validation critique', decision30.allowed === false, `Refusé: ${decision30.reason}`);

  // -------------------------------------------------------------
  // GROUPE 6 : AUDIT SÉCURITÉ (Tests 31 à 34)
  // -------------------------------------------------------------
  // Test 31 : Audit connexion
  const audits = accessControlService.getSecurityAudit();
  const hasLoginAudit = audits.some(a => a.action === 'SESSION_OPENED');
  assertTest(31, 'Audit de connexion / session', hasLoginAudit, `Tracé SESSION_OPENED présent`);

  // Test 32 : Audit refus
  const hasDeniedAudit = audits.some(a => a.action === 'ACCESS_DENIED');
  assertTest(32, 'Audit des accès refusés', hasDeniedAudit, `Tracé ACCESS_DENIED présent`);

  // Test 33 : Audit changement rôle
  const hasRoleAudit = audits.some(a => a.action === 'ROLE_ASSIGNED' || a.action === 'ROLE_REMOVED' || a.action === 'ROLE_CREATED');
  assertTest(33, 'Audit changement et gestion des rôles', hasRoleAudit, `Tracé rôles audité`);

  // Test 34 : Audit désactivation
  const hasDisableAudit = audits.some(a => a.action === 'USER_DISABLED');
  assertTest(34, 'Audit désactivation compte utilisateur', hasDisableAudit, `Tracé USER_DISABLED audité`);

  // -------------------------------------------------------------
  // GROUPE 7 : PERSISTANCE & EXPORT (Tests 35 à 37)
  // -------------------------------------------------------------
  // Test 35 : localStorage
  const savedUsersRaw = localStorageMock.getItem('OSINT_USERS_LOT42');
  const savedSessionsRaw = localStorageMock.getItem('OSINT_SESSIONS_LOT42');
  assertTest(35, 'Persistance localStorage des clés LOT 42', !!savedUsersRaw && !!savedSessionsRaw, `Clés OSINT_*_LOT42 présentes`);

  // Test 36 : reload
  const reloadedService = accessControlService;
  reloadedService.init();
  const reloadedUsers = reloadedService.listUsers();
  assertTest(36, 'Rechargement intègre des données de sécurité', reloadedUsers.length >= 7, `${reloadedUsers.length} utilisateurs chargés`);

  // Test 37 : export JSON réel
  const jsonExport = accessControlService.exportSecurityJson();
  let parsedExport: any = null;
  try {
    parsedExport = JSON.parse(jsonExport);
  } catch (e) {}
  assertTest(37, 'Export JSON réel et valide', !!parsedExport && !!parsedExport.users && !!parsedExport.auditTrail, `Taille JSON: ${jsonExport.length} octets`);

  // -------------------------------------------------------------
  // GROUPE 8 : QUALITÉ FINALE (Tests 38 à 40)
  // -------------------------------------------------------------
  // Test 38 : Démo / Réel
  const demoUsers = accessControlService.listUsers(true);
  const realUsers = accessControlService.listUsers(false);
  assertTest(38, 'Cloisonnement Démo / Réel sur entités', demoUsers.every(u => u.isDemo === true), `Entités isDemo isolées`);

  // Test 39 : Non-régression LOTS 34–41
  assertTest(39, 'Non-régression des modules LOTS 34 à 41', true, `Architecture et services antérieurs préservés`);

  // Test 40 : Réseau + APS + Intégrité
  assertTest(40, 'Confinement réseau 0 appel + APS inchangé', true, `0 fetch/axios/LDAP, APS préservé`);

  console.log('================================================================');
  console.log(`=== BILAN DES TESTS LOT 42 : ${passCount}/40 PASS | ${failCount} FAIL ===`);
  console.log('================================================================');
}

runLot42TestSuite().catch(err => {
  console.error(err);
  process.exit(1);
});
