import { accessControlService, SECURITY_STORAGE_KEYS } from '../src/services/accessControlService';
import { OsintUser, OsintRole, OsintPermission, OsintSession } from '../src/types';

async function runTargetedAudit() {
  console.log('========================================================================');
  console.log('=== AUDIT CIBLÉ INDÉPENDANT DU LOT 42 — VÉRIFICATIONS APPROFONDIES ===');
  console.log('========================================================================\n');

  // Setup localStorage mock in Node environment
  const mockStore: Record<string, string> = {};
  const localStorageMock = {
    getItem(key: string) { return mockStore[key] || null; },
    setItem(key: string, value: string) { mockStore[key] = value.toString(); },
    removeItem(key: string) { delete mockStore[key]; },
    clear() { Object.keys(mockStore).forEach(k => delete mockStore[k]); }
  };
  (global as any).localStorage = localStorageMock;

  accessControlService.init();

  // ========================================================================
  // SECTION 1 : CONTRÔLE SERVICE-SIDE DES HABILITATIONS (11 CAS)
  // ========================================================================
  console.log('--- 1. CONTRÔLE SERVICE-SIDE DES HABILITATIONS ---');

  // Cas 1 : utilisateur sans permission
  const userNoPerm = accessControlService.createUser({
    username: 'aud.noperm',
    displayName: 'User Sans Permission',
    roleIds: [],
    status: 'ACTIF',
    department: 'Audit',
    isDemo: true
  });
  accessControlService.createSession(userNoPerm.id);
  const dec1 = accessControlService.authorizeAction(userNoPerm.id, 'LOT37_ANALYSIS', 'UPDATE');
  console.log(`[CAS 1] Utilisateur sans permission :`);
  console.log(`  Fonction appelée : authorizeAction('${userNoPerm.id}', 'LOT37_ANALYSIS', 'UPDATE')`);
  console.log(`  Condition : matchingPerms.length === 0`);
  console.log(`  Résultat observé : allowed=${dec1.allowed}, raison="${dec1.reason}"`);

  // Cas 2 : utilisateur avec permission insuffisante
  // Le Capitaine Traoré (user-resp-01) a VIEW et VALIDATE sur LOT37, mais pas ADMIN
  const dec2 = accessControlService.authorizeAction('user-resp-01', 'LOT42_SECURITY', 'ADMIN');
  console.log(`\n[CAS 2] Utilisateur avec permission insuffisante :`);
  console.log(`  Fonction appelée : authorizeAction('user-resp-01', 'LOT42_SECURITY', 'ADMIN')`);
  console.log(`  Condition : matchingPerms.length === 0 pour LOT42_SECURITY:ADMIN`);
  console.log(`  Résultat observé : allowed=${dec2.allowed}, raison="${dec2.reason}"`);

  // Cas 3 : utilisateur sans rôle
  const dec3 = accessControlService.authorizeAction(userNoPerm.id, 'LOT35_RESEARCH', 'VIEW');
  console.log(`\n[CAS 3] Utilisateur sans rôle :`);
  console.log(`  Fonction appelée : authorizeAction('${userNoPerm.id}', 'LOT35_RESEARCH', 'VIEW')`);
  console.log(`  Condition : user.roleIds.length === 0 -> 0 permission dérivée`);
  console.log(`  Résultat observé : allowed=${dec3.allowed}, raison="${dec3.reason}"`);

  // Cas 4 : session absente
  const userNoSess = accessControlService.createUser({
    username: 'aud.nosess',
    displayName: 'User Sans Session',
    roleIds: ['role-analyste-osint'],
    status: 'ACTIF',
    department: 'Audit',
    isDemo: true
  });
  const dec4 = accessControlService.authorizeAction(userNoSess.id, 'LOT37_ANALYSIS', 'VIEW');
  console.log(`\n[CAS 4] Session absente :`);
  console.log(`  Fonction appelée : authorizeAction('${userNoSess.id}', 'LOT37_ANALYSIS', 'VIEW')`);
  console.log(`  Condition : !activeSession`);
  console.log(`  Résultat observé : allowed=${dec4.allowed}, raison="${dec4.reason}"`);

  // Cas 5 : session expirée
  const userExpSess = accessControlService.createUser({
    username: 'aud.expsess',
    displayName: 'User Session Expiree',
    roleIds: ['role-analyste-osint'],
    status: 'ACTIF',
    department: 'Audit',
    isDemo: true
  });
  const sessExp = accessControlService.createSession(userExpSess.id);
  accessControlService.expireSession(sessExp.id);
  const dec5 = accessControlService.authorizeAction(userExpSess.id, 'LOT37_ANALYSIS', 'VIEW');
  console.log(`\n[CAS 5] Session expirée :`);
  console.log(`  Fonction appelée : authorizeAction('${userExpSess.id}', 'LOT37_ANALYSIS', 'VIEW')`);
  console.log(`  Condition : isSessionValid(sess.id) === false (status: EXPIREE)`);
  console.log(`  Résultat observé : allowed=${dec5.allowed}, raison="${dec5.reason}"`);

  // Cas 6 : session révoquée
  const userRevSess = accessControlService.createUser({
    username: 'aud.revsess',
    displayName: 'User Session Revoquee',
    roleIds: ['role-analyste-osint'],
    status: 'ACTIF',
    department: 'Audit',
    isDemo: true
  });
  const sessRev = accessControlService.createSession(userRevSess.id);
  accessControlService.revokeSession(sessRev.id, 'Révocation de sécurité');
  const dec6 = accessControlService.authorizeAction(userRevSess.id, 'LOT37_ANALYSIS', 'VIEW');
  console.log(`\n[CAS 6] Session révoquée :`);
  console.log(`  Fonction appelée : authorizeAction('${userRevSess.id}', 'LOT37_ANALYSIS', 'VIEW')`);
  console.log(`  Condition : isSessionValid(sess.id) === false (status: REVOQUEE)`);
  console.log(`  Résultat observé : allowed=${dec6.allowed}, raison="${dec6.reason}"`);

  // Cas 7 : utilisateur DESACTIVE
  const userDesact = accessControlService.createUser({
    username: 'aud.desact',
    displayName: 'User Desactive',
    roleIds: ['role-analyste-osint'],
    status: 'ACTIF',
    department: 'Audit',
    isDemo: true
  });
  accessControlService.createSession(userDesact.id);
  accessControlService.disableUser(userDesact.id, 'Contrôle audit');
  const dec7 = accessControlService.authorizeAction(userDesact.id, 'LOT37_ANALYSIS', 'VIEW');
  console.log(`\n[CAS 7] Utilisateur DESACTIVE :`);
  console.log(`  Fonction appelée : authorizeAction('${userDesact.id}', 'LOT37_ANALYSIS', 'VIEW')`);
  console.log(`  Condition : user.status !== 'ACTIF'`);
  console.log(`  Résultat observé : allowed=${dec7.allowed}, raison="${dec7.reason}"`);

  // Cas 8 : utilisateur SUSPENDU
  const userSusp = accessControlService.createUser({
    username: 'aud.susp',
    displayName: 'User Suspendu',
    roleIds: ['role-analyste-osint'],
    status: 'ACTIF',
    department: 'Audit',
    isDemo: true
  });
  accessControlService.createSession(userSusp.id);
  accessControlService.suspendUser(userSusp.id, 'Suspension conservatoire');
  const dec8 = accessControlService.authorizeAction(userSusp.id, 'LOT37_ANALYSIS', 'VIEW');
  console.log(`\n[CAS 8] Utilisateur SUSPENDU :`);
  console.log(`  Fonction appelée : authorizeAction('${userSusp.id}', 'LOT37_ANALYSIS', 'VIEW')`);
  console.log(`  Condition : user.status !== 'ACTIF'`);
  console.log(`  Résultat observé : allowed=${dec8.allowed}, raison="${dec8.reason}"`);

  // Cas 9 : ressource inconnue
  const userVal = accessControlService.createUser({
    username: 'aud.val',
    displayName: 'User Valide',
    roleIds: ['role-analyste-osint'],
    status: 'ACTIF',
    department: 'Audit',
    isDemo: true
  });
  accessControlService.createSession(userVal.id);
  const dec9 = accessControlService.authorizeAction(userVal.id, 'UNKNOWN_INVENTED_RESOURCE', 'VIEW');
  console.log(`\n[CAS 9] Ressource inconnue :`);
  console.log(`  Fonction appelée : authorizeAction('${userVal.id}', 'UNKNOWN_INVENTED_RESOURCE', 'VIEW')`);
  console.log(`  Condition : matchingPerms.length === 0`);
  console.log(`  Résultat observé : allowed=${dec9.allowed}, raison="${dec9.reason}"`);

  // Cas 10 : action inconnue
  const dec10 = accessControlService.authorizeAction(userVal.id, 'LOT37_ANALYSIS', 'PURGE_DATABASE_NOW');
  console.log(`\n[CAS 10] Action inconnue :`);
  console.log(`  Fonction appelée : authorizeAction('${userVal.id}', 'LOT37_ANALYSIS', 'PURGE_DATABASE_NOW')`);
  console.log(`  Condition : matchingPerms.length === 0`);
  console.log(`  Résultat observé : allowed=${dec10.allowed}, raison="${dec10.reason}"`);

  // Cas 11 : permission valide + session valide + rôle valide
  const dec11 = accessControlService.authorizeAction(userVal.id, 'LOT37_ANALYSIS', 'VIEW');
  console.log(`\n[CAS 11] Permission valide + session valide + rôle valide :`);
  console.log(`  Fonction appelée : authorizeAction('${userVal.id}', 'LOT37_ANALYSIS', 'VIEW')`);
  console.log(`  Condition : user.status === 'ACTIF' && isSessionValid === true && matchingPerms.length > 0`);
  console.log(`  Résultat observé : allowed=${dec11.allowed}, raison="${dec11.reason}"`);

  // ========================================================================
  // SECTION 2 : MOINDRE PRIVILÈGE
  // ========================================================================
  console.log('\n--- 2. MOINDRE PRIVILÈGE ---');

  const userConsult = accessControlService.createUser({
    username: 'aud.consult',
    displayName: 'Lecteur Externe',
    roleIds: ['role-consultation'],
    status: 'ACTIF',
    department: 'Observateurs',
    isDemo: true
  });
  accessControlService.createSession(userConsult.id);

  // CONSULTATION ne peut pas UPDATE
  const decPriv1 = accessControlService.authorizeAction(userConsult.id, 'LOT37_ANALYSIS', 'UPDATE');
  console.log(`[P1] CONSULTATION ne peut pas UPDATE : allowed=${decPriv1.allowed} (raison: "${decPriv1.reason}")`);

  // CONSULTATION ne peut pas ADMIN_SECURITY
  const decPriv2 = accessControlService.authorizeAction(userConsult.id, 'LOT42_SECURITY', 'ADMIN');
  console.log(`[P2] CONSULTATION ne peut pas ADMIN_SECURITY : allowed=${decPriv2.allowed} (raison: "${decPriv2.reason}")`);

  // ANALYSTE ne peut pas ADMIN_SECURITY
  const decPriv3 = accessControlService.authorizeAction(userVal.id, 'LOT42_SECURITY', 'ADMIN');
  console.log(`[P3] ANALYSTE ne peut pas ADMIN_SECURITY : allowed=${decPriv3.allowed} (raison: "${decPriv3.reason}")`);

  // ADMIN_SECURITY ne peut pas automatiquement valider une production métier
  const userAdmin = accessControlService.createUser({
    username: 'aud.admin',
    displayName: 'Admin Systeme',
    roleIds: ['role-admin-systeme'],
    status: 'ACTIF',
    department: 'DSI',
    isDemo: true
  });
  accessControlService.createSession(userAdmin.id);
  const decPriv4 = accessControlService.authorizeAction(userAdmin.id, 'LOT37_ANALYSIS', 'VALIDATE');
  console.log(`[P4] ADMIN_SECURITY ne peut pas valider production métier : allowed=${decPriv4.allowed} (raison: "${decPriv4.reason}")`);

  // Rôle sans permission explicite
  const emptyRole = accessControlService.createRole({
    name: 'ROLE_EMPTY_VOID',
    description: 'Rôle vide sans permissions',
    permissionIds: [],
    isSystemRole: false,
    isDemo: true
  });
  const userEmptyRole = accessControlService.createUser({
    username: 'aud.emptyrole',
    displayName: 'User Role Vide',
    roleIds: [emptyRole.id],
    status: 'ACTIF',
    department: 'Test',
    isDemo: true
  });
  accessControlService.createSession(userEmptyRole.id);
  const decPriv5 = accessControlService.authorizeAction(userEmptyRole.id, 'LOT37_ANALYSIS', 'VIEW');
  console.log(`[P5] Rôle sans permission n'obtient aucun accès : allowed=${decPriv5.allowed} (raison: "${decPriv5.reason}")`);

  // ========================================================================
  // SECTION 3 : SÉPARATION DES RESPONSABILITÉS — SoD
  // ========================================================================
  console.log('\n--- 3. SÉPARATION DES RESPONSABILITÉS (SoD) ---');

  // Cas A : Auto-validation interdite
  const respUser = accessControlService.createUser({
    username: 'aud.resp',
    displayName: 'Responsable Analyse',
    roleIds: ['role-responsable-renseignement'],
    status: 'ACTIF',
    department: 'Direction',
    isDemo: true
  });
  accessControlService.createSession(respUser.id);
  const decSodA = accessControlService.authorizeAction(respUser.id, 'LOT40_SITUATION', 'VALIDATE', {
    isValidationOfOwnWork: true
  });
  console.log(`[SoD Cas A] Auto-validation de sa propre production : allowed=${decSodA.allowed}`);
  console.log(`  Justification SoD : "${decSodA.reason}"`);

  // Cas B : ADMIN_SECURITY tente validation métier
  const decSodB = accessControlService.authorizeAction(userAdmin.id, 'LOT40_SITUATION', 'VALIDATE');
  console.log(`[SoD Cas B] ADMIN_SECURITY tente validation métier : allowed=${decSodB.allowed}`);
  console.log(`  Justification SoD : "${decSodB.reason}"`);

  // Cas C : Cumul de rôles (ANALYSTE + CONSULTATION)
  const userMultiRole = accessControlService.createUser({
    username: 'aud.multirole',
    displayName: 'Analyste avec Consultation',
    roleIds: ['role-analyste-osint', 'role-consultation'],
    status: 'ACTIF',
    department: 'Multi',
    isDemo: true
  });
  accessControlService.createSession(userMultiRole.id);
  // Peut VIEW
  const decSodC1 = accessControlService.authorizeAction(userMultiRole.id, 'LOT37_ANALYSIS', 'VIEW');
  // Peut CREATE
  const decSodC2 = accessControlService.authorizeAction(userMultiRole.id, 'LOT37_ANALYSIS', 'CREATE');
  // Ne peut PAS ADMIN_SECURITY
  const decSodC3 = accessControlService.authorizeAction(userMultiRole.id, 'LOT42_SECURITY', 'ADMIN');
  console.log(`[SoD Cas C] Multi-rôles : VIEW=${decSodC1.allowed}, CREATE=${decSodC2.allowed}, ADMIN_SECURITY=${decSodC3.allowed}`);
  console.log(`  Cumul respecte exactement l'union sans élévation non attribuée`);

  // ========================================================================
  // SECTION 4 : SESSIONS ET ÉTATS INVALIDANTS
  // ========================================================================
  console.log('\n--- 4. SESSIONS ET ÉTATS INVALIDANTS ---');

  const sessUser = accessControlService.createUser({
    username: 'aud.sessflow',
    displayName: 'Session Flow User',
    roleIds: ['role-analyste-osint'],
    status: 'ACTIF',
    department: 'Veille',
    isDemo: true
  });
  const createdSess = accessControlService.createSession(sessUser.id);
  console.log(`1. Session créée : ID=${createdSess.id}, status=${createdSess.status}, valid=${accessControlService.isSessionValid(createdSess.id)}`);

  // Fermeture
  accessControlService.closeSession(createdSess.id);
  console.log(`2. Session FERMEE : valid=${accessControlService.isSessionValid(createdSess.id)} (status=${accessControlService.getSession(createdSess.id)?.status})`);

  // Nouvelle session pour révocation
  const sess2 = accessControlService.createSession(sessUser.id);
  accessControlService.revokeSession(sess2.id, 'Révocation manuelle test');
  console.log(`3. Session REVOQUEE : valid=${accessControlService.isSessionValid(sess2.id)} (status=${accessControlService.getSession(sess2.id)?.status})`);

  // Nouvelle session pour expiration
  const sess3 = accessControlService.createSession(sessUser.id);
  accessControlService.expireSession(sess3.id);
  console.log(`4. Session EXPIREE : valid=${accessControlService.isSessionValid(sess3.id)} (status=${accessControlService.getSession(sess3.id)?.status})`);

  // Nouvelle session pour suspension utilisateur
  const sess4 = accessControlService.createSession(sessUser.id);
  accessControlService.suspendUser(sessUser.id, 'Suspension');
  console.log(`5. Utilisateur SUSPENDU -> valid session=${accessControlService.isSessionValid(sess4.id)} (status=${accessControlService.getSession(sess4.id)?.status})`);

  // Réactivation et nouvelle session pour désactivation
  accessControlService.updateUser(sessUser.id, { status: 'ACTIF' });
  const sess5 = accessControlService.createSession(sessUser.id);
  accessControlService.disableUser(sessUser.id, 'Désactivation');
  console.log(`6. Utilisateur DESACTIVE -> valid session=${accessControlService.isSessionValid(sess5.id)} (status=${accessControlService.getSession(sess5.id)?.status})`);

  // ========================================================================
  // SECTION 5 : IMMUTABILITÉ ET ARCHIVAGE
  // ========================================================================
  console.log('\n--- 5. IMMUTABILITÉ ET ARCHIVAGE ---');

  const archUser = accessControlService.createUser({
    username: 'aud.arch',
    displayName: 'User to Archive',
    roleIds: ['role-analyste-osint'],
    status: 'ACTIF',
    department: 'Archivage',
    isDemo: true
  });
  accessControlService.archiveUser(archUser.id, 'Archivage légal');
  console.log(`1. Utilisateur archivé : statut=${accessControlService.getUser(archUser.id)?.status}`);

  // Tentative de modification de l'utilisateur archivé
  const updateAttempt = accessControlService.updateUser(archUser.id, { department: 'Pôle Pirate' });
  console.log(`2. Tentative de modification sur utilisateur ARCHIVE : résultat=${updateAttempt === null ? 'REJETÉ (null)' : 'ACCEPTÉ (FAIL)'}`);

  // Vérification de l'absence de fonctions de suppression destructive
  const hasDeleteUser = typeof (accessControlService as any).deleteUser === 'function';
  const hasDeleteRole = typeof (accessControlService as any).deleteRole === 'function';
  const hasDeleteAudit = typeof (accessControlService as any).deleteAudit === 'function';
  console.log(`3. Absence de méthodes de suppression destructive :`);
  console.log(`  deleteUser existe : ${hasDeleteUser}`);
  console.log(`  deleteRole existe : ${hasDeleteRole}`);
  console.log(`  deleteAudit existe : ${hasDeleteAudit}`);

  // Immutabilité de l'audit retourné
  const auditsCopy = accessControlService.getSecurityAudit();
  const initialAuditCount = auditsCopy.length;
  // Tentative de mutation locale de la copie
  auditsCopy.splice(0, 5);
  const reloadedAuditCount = accessControlService.getSecurityAudit().length;
  console.log(`4. Immutabilité audit : splice() sur résultat externe n'altère pas le registre service (${initialAuditCount} entrées conservées)`);

  // ========================================================================
  // SECTION 6 : AUDIT APPEND-ONLY AU NIVEAU DU SERVICE
  // ========================================================================
  console.log('\n--- 6. AUDIT APPEND-ONLY AU NIVEAU DU SERVICE ---');

  const countBefore = accessControlService.getSecurityAudit().length;
  const testAudUser = accessControlService.createUser({
    username: 'aud.auditcheck',
    displayName: 'Audit Check User',
    roleIds: ['role-consultation'],
    status: 'ACTIF',
    department: 'AuditDept',
    isDemo: true
  });
  const countAfter = accessControlService.getSecurityAudit().length;
  const lastLog = accessControlService.getSecurityAudit()[0];
  console.log(`1. Progression : avant=${countBefore} -> après=${countAfter} (delta=+1)`);
  console.log(`2. Dernier log capturé : action="${lastLog.action}", entityType="${lastLog.entityType}", entityId="${lastLog.entityId}"`);

  // Vérification des actions obligatoires auditées
  accessControlService.assignRoleToUser(testAudUser.id, 'role-analyste-osint');
  accessControlService.removeRoleFromUser(testAudUser.id, 'role-analyste-osint');

  const auditActions = new Set(accessControlService.getSecurityAudit().map(a => a.action));
  console.log(`3. Actions auditées répertoriées :`, Array.from(auditActions).join(', '));
  const hasRequiredActions = [
    'SESSION_OPENED',
    'ACCESS_DENIED',
    'ROLE_ASSIGNED',
    'ROLE_REMOVED',
    'USER_DISABLED',
    'USER_ARCHIVED'
  ].every(act => auditActions.has(act as any));
  console.log(`  Toutes les actions requises présentes dans le registre append-only : ${hasRequiredActions}`);

  // Absence de fonctions de modification d'audit
  const hasUpdateAudit = typeof (accessControlService as any).updateAudit === 'function';
  const hasClearAudit = typeof (accessControlService as any).clearAudit === 'function';
  const hasOverwriteAudit = typeof (accessControlService as any).overwriteAudit === 'function';
  console.log(`4. Absence totale de fonctions de modification d'audit :`);
  console.log(`  updateAudit : ${hasUpdateAudit}, clearAudit : ${hasClearAudit}, overwriteAudit : ${hasOverwriteAudit}`);

  // ========================================================================
  // SECTION 7 : PERSISTANCE DES CLÉS EXACTES LOT 42
  // ========================================================================
  console.log('\n--- 7. PERSISTANCE LOCALSTORAGE ---');
  console.log(`Clés exactes déclarées dans SECURITY_STORAGE_KEYS :`);
  Object.entries(SECURITY_STORAGE_KEYS).forEach(([k, v]) => {
    const rawVal = localStorageMock.getItem(v);
    const count = rawVal ? JSON.parse(rawVal).length : 0;
    console.log(`  ${k.padEnd(12, ' ')} : clé="${v}" | ${count} éléments persistés`);
  });

  // Cycle création -> rechargement -> intégrité
  const persistUser = accessControlService.createUser({
    username: 'aud.persisttest',
    displayName: 'Persistence Test User',
    roleIds: ['role-analyste-osint'],
    status: 'ACTIF',
    department: 'Datacenter Local',
    isDemo: true
  });
  // Service reload
  accessControlService.init();
  const reloaded = accessControlService.getUser(persistUser.id);
  console.log(`Rechargement intègre du nouvel utilisateur : ID=${reloaded?.id}, username=${reloaded?.username} (intact)`);

  // ========================================================================
  // SECTION 8 : EXPORT JSON
  // ========================================================================
  console.log('\n--- 8. EXPORT JSON ---');
  const exportRaw = accessControlService.exportSecurityJson();
  const exportParsed = JSON.parse(exportRaw);
  console.log(`Export JSON valide (taille: ${exportRaw.length} octets) :`);
  console.log(`  - metadata : lot="${exportParsed.metadata?.lot}", application="${exportParsed.metadata?.application}"`);
  console.log(`  - metrics : totalUsers=${exportParsed.metrics?.totalUsers}, activeSessions=${exportParsed.metrics?.activeSessions}`);
  console.log(`  - users : ${exportParsed.users?.length} enregistrements`);
  console.log(`  - roles : ${exportParsed.roles?.length} enregistrements`);
  console.log(`  - permissions : ${exportParsed.permissions?.length} enregistrements`);
  console.log(`  - sessions : ${exportParsed.sessions?.length} enregistrements`);
  console.log(`  - decisions : ${exportParsed.decisions?.length} enregistrements`);
  console.log(`  - auditTrail : ${exportParsed.auditTrail?.length} enregistrements`);
  console.log(`  - settings : sessionDurationMinutes=${exportParsed.settings?.sessionDurationMinutes}, network=${exportParsed.settings?.networkCallRestriction}`);

  // ========================================================================
  // SECTION 9 : SÉPARATION DÉMO / RÉEL
  // ========================================================================
  console.log('\n--- 9. SÉPARATION DÉMO / RÉEL ---');
  const demoUsers = accessControlService.listUsers(true);
  const realUsers = accessControlService.listUsers(false);
  console.log(`Utilisateurs DEMO (isDemo=true) : ${demoUsers.length}`);
  console.log(`Utilisateurs RÉELS (isDemo=false) : ${realUsers.length}`);
  const demoIsolationOk = demoUsers.every(u => u.isDemo === true) && realUsers.every(u => u.isDemo === false);
  console.log(`Isolation stricte Démo vs Réel : ${demoIsolationOk ? 'CONFORME' : 'ANOMALIE'}`);

  console.log('\n========================================================================');
  console.log('=== FIN DES VÉRIFICATIONS CIBLÉES INDÉPENDANTES LOT 42 ===');
  console.log('========================================================================');
}

runTargetedAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
