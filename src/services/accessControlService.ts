import {
  OsintUser,
  OsintRole,
  OsintPermission,
  OsintSession,
  OsintAccessDecision,
  OsintSecurityAudit,
  OsintPermissionAction
} from '../types';
import {
  INITIAL_SECURITY_USERS,
  INITIAL_SECURITY_ROLES,
  INITIAL_SECURITY_PERMISSIONS,
  INITIAL_SECURITY_SESSIONS,
  INITIAL_ACCESS_DECISIONS,
  INITIAL_SECURITY_AUDITS
} from '../data/securityDemoData';

export const SECURITY_STORAGE_KEYS = {
  USERS: 'OSINT_USERS_LOT42',
  ROLES: 'OSINT_ROLES_LOT42',
  PERMISSIONS: 'OSINT_PERMISSIONS_LOT42',
  SESSIONS: 'OSINT_SESSIONS_LOT42',
  DECISIONS: 'OSINT_ACCESS_DECISIONS_LOT42',
  AUDIT: 'OSINT_SECURITY_AUDIT_LOT42'
};

export class AccessControlService {
  private users: OsintUser[] = [];
  private roles: OsintRole[] = [];
  private permissions: OsintPermission[] = [];
  private sessions: OsintSession[] = [];
  private decisions: OsintAccessDecision[] = [];
  private audits: OsintSecurityAudit[] = [];
  private currentSessionId: string | null = null;
  private currentUserId: string = 'user-resp-01'; // Default active user (Capitaine Traoré)
  private sessionDurationMinutes: number = 480; // 8 hours default

  constructor() {
    this.init();
  }

  private load<T>(key: string, defaultData: T[]): T[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(key);
        if (data) {
          return JSON.parse(data);
        }
      }
    } catch (e) {
      console.warn(`Error loading key ${key}:`, e);
    }
    return [...defaultData];
  }

  private save<T>(key: string, data: T[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.warn(`Error saving key ${key}:`, e);
    }
  }

  public init(): void {
    this.users = this.load<OsintUser>(SECURITY_STORAGE_KEYS.USERS, INITIAL_SECURITY_USERS);
    this.roles = this.load<OsintRole>(SECURITY_STORAGE_KEYS.ROLES, INITIAL_SECURITY_ROLES);
    this.permissions = this.load<OsintPermission>(SECURITY_STORAGE_KEYS.PERMISSIONS, INITIAL_SECURITY_PERMISSIONS);
    this.sessions = this.load<OsintSession>(SECURITY_STORAGE_KEYS.SESSIONS, INITIAL_SECURITY_SESSIONS);
    this.decisions = this.load<OsintAccessDecision>(SECURITY_STORAGE_KEYS.DECISIONS, INITIAL_ACCESS_DECISIONS);
    this.audits = this.load<OsintSecurityAudit>(SECURITY_STORAGE_KEYS.AUDIT, INITIAL_SECURITY_AUDITS);

    // Initialisation immédiate dans localStorage pour garantir la présence des clés
    if (typeof localStorage !== 'undefined') {
      if (!localStorage.getItem(SECURITY_STORAGE_KEYS.USERS)) this.save(SECURITY_STORAGE_KEYS.USERS, this.users);
      if (!localStorage.getItem(SECURITY_STORAGE_KEYS.ROLES)) this.save(SECURITY_STORAGE_KEYS.ROLES, this.roles);
      if (!localStorage.getItem(SECURITY_STORAGE_KEYS.PERMISSIONS)) this.save(SECURITY_STORAGE_KEYS.PERMISSIONS, this.permissions);
      if (!localStorage.getItem(SECURITY_STORAGE_KEYS.SESSIONS)) this.save(SECURITY_STORAGE_KEYS.SESSIONS, this.sessions);
      if (!localStorage.getItem(SECURITY_STORAGE_KEYS.DECISIONS)) this.save(SECURITY_STORAGE_KEYS.DECISIONS, this.decisions);
      if (!localStorage.getItem(SECURITY_STORAGE_KEYS.AUDIT)) this.save(SECURITY_STORAGE_KEYS.AUDIT, this.audits);
    }

    // Ensure at least one active session for current user
    const active = this.sessions.find(s => s.userId === this.currentUserId && s.status === 'ACTIVE');
    if (active) {
      this.currentSessionId = active.id;
    } else {
      const newSess = this.createSession(this.currentUserId, '127.0.0.1 (Local)', 'Station Souveraine');
      this.currentSessionId = newSess.id;
    }
  }

  // ==========================================
  // AUDIT LOGGING (APPEND-ONLY)
  // ==========================================
  public addAuditLog(entry: Omit<OsintSecurityAudit, 'id' | 'timestamp'>): OsintSecurityAudit {
    const audit: OsintSecurityAudit = {
      id: `sec-aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...entry
    };
    this.audits.unshift(audit);
    this.save(SECURITY_STORAGE_KEYS.AUDIT, this.audits);
    return audit;
  }

  public getSecurityAudit(): OsintSecurityAudit[] {
    return [...this.audits];
  }

  // ==========================================
  // USER MANAGEMENT
  // ==========================================
  public createUser(user: Omit<OsintUser, 'id' | 'createdAt' | 'updatedAt'>, actorUserId?: string): OsintUser {
    const newUser: OsintUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...user
    };
    this.users.push(newUser);
    this.save(SECURITY_STORAGE_KEYS.USERS, this.users);

    this.addAuditLog({
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: newUser.id,
      actorUserId: actorUserId || this.currentUserId,
      success: true,
      reason: `Création de l'utilisateur ${newUser.username} (${newUser.displayName})`,
      after: newUser,
      isDemo: newUser.isDemo
    });

    return newUser;
  }

  public updateUser(id: string, updates: Partial<OsintUser>, actorUserId?: string): OsintUser | null {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    // Règle d'immutabilité : un utilisateur au statut ARCHIVE est dans un état terminal non modifiable
    if (this.users[index].status === 'ARCHIVE') {
      console.warn(`[IMMUTABILITE] Rejet de modification : compte ${this.users[index].username} au statut ARCHIVE (état terminal)`);
      return null;
    }

    const before = { ...this.users[index] };
    const updated: OsintUser = {
      ...this.users[index],
      ...updates,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.users[index] = updated;
    this.save(SECURITY_STORAGE_KEYS.USERS, this.users);

    this.addAuditLog({
      action: 'USER_UPDATED',
      entityType: 'USER',
      entityId: id,
      actorUserId: actorUserId || this.currentUserId,
      success: true,
      reason: `Mise à jour des informations de l'utilisateur ${updated.username}`,
      before,
      after: updated,
      isDemo: updated.isDemo
    });

    return updated;
  }

  public disableUser(id: string, reason?: string, actorUserId?: string): boolean {
    const user = this.getUser(id);
    if (!user) return false;

    const beforeStatus = user.status;
    user.status = 'DESACTIVE';
    user.disabledAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    user.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.save(SECURITY_STORAGE_KEYS.USERS, this.users);

    // Invalidate/revoke all active sessions for this user
    this.sessions.forEach(sess => {
      if (sess.userId === id && sess.status === 'ACTIVE') {
        sess.status = 'REVOQUEE';
      }
    });
    this.save(SECURITY_STORAGE_KEYS.SESSIONS, this.sessions);

    this.addAuditLog({
      action: 'USER_DISABLED',
      entityType: 'USER',
      entityId: id,
      actorUserId: actorUserId || this.currentUserId,
      success: true,
      reason: reason || `Désactivation administrative de l'utilisateur ${user.username}`,
      before: { status: beforeStatus },
      after: { status: 'DESACTIVE', disabledAt: user.disabledAt },
      isDemo: user.isDemo
    });

    return true;
  }

  public suspendUser(id: string, reason?: string, actorUserId?: string): boolean {
    const user = this.getUser(id);
    if (!user) return false;

    const beforeStatus = user.status;
    user.status = 'SUSPENDU';
    user.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.save(SECURITY_STORAGE_KEYS.USERS, this.users);

    // Invalidate active sessions
    this.sessions.forEach(sess => {
      if (sess.userId === id && sess.status === 'ACTIVE') {
        sess.status = 'REVOQUEE';
      }
    });
    this.save(SECURITY_STORAGE_KEYS.SESSIONS, this.sessions);

    this.addAuditLog({
      action: 'USER_SUSPENDED',
      entityType: 'USER',
      entityId: id,
      actorUserId: actorUserId || this.currentUserId,
      success: true,
      reason: reason || `Suspension de sécurité de l'utilisateur ${user.username}`,
      before: { status: beforeStatus },
      after: { status: 'SUSPENDU' },
      isDemo: user.isDemo
    });

    return true;
  }

  public archiveUser(id: string, reason?: string, actorUserId?: string): boolean {
    const user = this.getUser(id);
    if (!user) return false;
    if (user.status === 'ARCHIVE') return false;

    const beforeStatus = user.status;
    user.status = 'ARCHIVE';
    user.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.save(SECURITY_STORAGE_KEYS.USERS, this.users);

    // Invalidation immédiate de toutes les sessions actives de l'utilisateur archivé
    this.sessions.forEach(sess => {
      if (sess.userId === id && sess.status === 'ACTIVE') {
        sess.status = 'REVOQUEE';
      }
    });
    this.save(SECURITY_STORAGE_KEYS.SESSIONS, this.sessions);

    this.addAuditLog({
      action: 'USER_ARCHIVED',
      entityType: 'USER',
      entityId: id,
      actorUserId: actorUserId || this.currentUserId,
      success: true,
      reason: reason || `Archivage du compte utilisateur ${user.username}`,
      before: { status: beforeStatus },
      after: { status: 'ARCHIVE' },
      isDemo: user.isDemo
    });

    return true;
  }

  public getUser(id: string): OsintUser | null {
    return this.users.find(u => u.id === id) || null;
  }

  public getUserByUsername(username: string): OsintUser | null {
    return this.users.find(u => u.username === username) || null;
  }

  public listUsers(isDemo?: boolean): OsintUser[] {
    if (isDemo !== undefined) {
      return this.users.filter(u => u.isDemo === isDemo);
    }
    return [...this.users];
  }

  // ==========================================
  // ROLE MANAGEMENT
  // ==========================================
  public createRole(role: Omit<OsintRole, 'id' | 'createdAt' | 'updatedAt'>, actorUserId?: string): OsintRole {
    const newRole: OsintRole = {
      id: `role-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...role
    };
    this.roles.push(newRole);
    this.save(SECURITY_STORAGE_KEYS.ROLES, this.roles);

    this.addAuditLog({
      action: 'ROLE_CREATED',
      entityType: 'ROLE',
      entityId: newRole.id,
      actorUserId: actorUserId || this.currentUserId,
      success: true,
      reason: `Création du rôle ${newRole.name}`,
      after: newRole,
      isDemo: newRole.isDemo
    });

    return newRole;
  }

  public updateRole(id: string, updates: Partial<OsintRole>, actorUserId?: string): OsintRole | null {
    const index = this.roles.findIndex(r => r.id === id);
    if (index === -1) return null;

    const before = { ...this.roles[index] };
    const updated: OsintRole = {
      ...this.roles[index],
      ...updates,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.roles[index] = updated;
    this.save(SECURITY_STORAGE_KEYS.ROLES, this.roles);

    this.addAuditLog({
      action: 'ROLE_UPDATED',
      entityType: 'ROLE',
      entityId: id,
      actorUserId: actorUserId || this.currentUserId,
      success: true,
      reason: `Mise à jour du rôle ${updated.name}`,
      before,
      after: updated,
      isDemo: updated.isDemo
    });

    return updated;
  }

  public getRole(id: string): OsintRole | null {
    return this.roles.find(r => r.id === id) || null;
  }

  public listRoles(): OsintRole[] {
    return [...this.roles];
  }

  public assignRoleToUser(userId: string, roleId: string, actorUserId?: string): boolean {
    const user = this.getUser(userId);
    const role = this.getRole(roleId);
    if (!user || !role) return false;

    if (!user.roleIds.includes(roleId)) {
      const beforeRoles = [...user.roleIds];
      user.roleIds.push(roleId);
      user.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      this.save(SECURITY_STORAGE_KEYS.USERS, this.users);

      this.addAuditLog({
        action: 'ROLE_ASSIGNED',
        entityType: 'USER',
        entityId: userId,
        actorUserId: actorUserId || this.currentUserId,
        success: true,
        reason: `Attribution du rôle ${role.name} à l'utilisateur ${user.username}`,
        before: { roleIds: beforeRoles },
        after: { roleIds: user.roleIds },
        isDemo: user.isDemo
      });
    }
    return true;
  }

  public removeRoleFromUser(userId: string, roleId: string, actorUserId?: string): boolean {
    const user = this.getUser(userId);
    const role = this.getRole(roleId);
    if (!user || !role) return false;

    if (user.roleIds.includes(roleId)) {
      const beforeRoles = [...user.roleIds];
      user.roleIds = user.roleIds.filter(id => id !== roleId);
      user.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      this.save(SECURITY_STORAGE_KEYS.USERS, this.users);

      this.addAuditLog({
        action: 'ROLE_REMOVED',
        entityType: 'USER',
        entityId: userId,
        actorUserId: actorUserId || this.currentUserId,
        success: true,
        reason: `Retrait du rôle ${role.name} pour l'utilisateur ${user.username}`,
        before: { roleIds: beforeRoles },
        after: { roleIds: user.roleIds },
        isDemo: user.isDemo
      });
    }
    return true;
  }

  // ==========================================
  // PERMISSION MANAGEMENT
  // ==========================================
  public createPermission(perm: Omit<OsintPermission, 'id' | 'createdAt'>, actorUserId?: string): OsintPermission {
    const newPerm: OsintPermission = {
      id: `perm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...perm
    };
    this.permissions.push(newPerm);
    this.save(SECURITY_STORAGE_KEYS.PERMISSIONS, this.permissions);

    this.addAuditLog({
      action: 'PERMISSION_CREATED',
      entityType: 'PERMISSION',
      entityId: newPerm.id,
      actorUserId: actorUserId || this.currentUserId,
      success: true,
      reason: `Création de la permission ${newPerm.code} (${newPerm.name})`,
      after: newPerm,
      isDemo: newPerm.isDemo
    });

    return newPerm;
  }

  public updatePermission(id: string, updates: Partial<OsintPermission>, actorUserId?: string): OsintPermission | null {
    const index = this.permissions.findIndex(p => p.id === id);
    if (index === -1) return null;

    const before = { ...this.permissions[index] };
    const updated = { ...this.permissions[index], ...updates };
    this.permissions[index] = updated;
    this.save(SECURITY_STORAGE_KEYS.PERMISSIONS, this.permissions);

    this.addAuditLog({
      action: 'PERMISSION_UPDATED',
      entityType: 'PERMISSION',
      entityId: id,
      actorUserId: actorUserId || this.currentUserId,
      success: true,
      reason: `Mise à jour de la permission ${updated.code}`,
      before,
      after: updated,
      isDemo: updated.isDemo
    });

    return updated;
  }

  public listPermissions(): OsintPermission[] {
    return [...this.permissions];
  }

  public assignPermissionToRole(roleId: string, permissionId: string, actorUserId?: string): boolean {
    const role = this.getRole(roleId);
    const perm = this.permissions.find(p => p.id === permissionId);
    if (!role || !perm) return false;

    if (!role.permissionIds.includes(permissionId)) {
      const beforePerms = [...role.permissionIds];
      role.permissionIds.push(permissionId);
      role.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      this.save(SECURITY_STORAGE_KEYS.ROLES, this.roles);

      this.addAuditLog({
        action: 'PERMISSION_ASSIGNED_TO_ROLE',
        entityType: 'ROLE',
        entityId: roleId,
        actorUserId: actorUserId || this.currentUserId,
        success: true,
        reason: `Attribution de la permission ${perm.code} au rôle ${role.name}`,
        before: { permissionIds: beforePerms },
        after: { permissionIds: role.permissionIds },
        isDemo: role.isDemo
      });
    }
    return true;
  }

  public removePermissionFromRole(roleId: string, permissionId: string, actorUserId?: string): boolean {
    const role = this.getRole(roleId);
    const perm = this.permissions.find(p => p.id === permissionId);
    if (!role || !perm) return false;

    if (role.permissionIds.includes(permissionId)) {
      const beforePerms = [...role.permissionIds];
      role.permissionIds = role.permissionIds.filter(id => id !== permissionId);
      role.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      this.save(SECURITY_STORAGE_KEYS.ROLES, this.roles);

      this.addAuditLog({
        action: 'PERMISSION_REMOVED_FROM_ROLE',
        entityType: 'ROLE',
        entityId: roleId,
        actorUserId: actorUserId || this.currentUserId,
        success: true,
        reason: `Retrait de la permission ${perm.code} du rôle ${role.name}`,
        before: { permissionIds: beforePerms },
        after: { permissionIds: role.permissionIds },
        isDemo: role.isDemo
      });
    }
    return true;
  }

  // ==========================================
  // SESSION MANAGEMENT
  // ==========================================
  public createSession(userId: string, ipSimulation = '127.0.0.1 (Local)', deviceSimulation = 'Poste OSINT'): OsintSession {
    const user = this.getUser(userId);
    if (!user || user.status !== 'ACTIF') {
      throw new Error('Impossible de créer une session : Utilisateur introuvable ou non actif');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.sessionDurationMinutes * 60000);

    const newSession: OsintSession = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      startedAt: now.toISOString().replace('T', ' ').substring(0, 19),
      lastActivityAt: now.toISOString().replace('T', ' ').substring(0, 19),
      expiresAt: expiresAt.toISOString().replace('T', ' ').substring(0, 19),
      status: 'ACTIVE',
      ipSimulation,
      deviceSimulation,
      isDemo: user.isDemo
    };

    this.sessions.unshift(newSession);
    this.save(SECURITY_STORAGE_KEYS.SESSIONS, this.sessions);

    this.addAuditLog({
      action: 'SESSION_OPENED',
      entityType: 'SESSION',
      entityId: newSession.id,
      actorUserId: userId,
      success: true,
      reason: `Ouverture de session locale pour ${user.username}`,
      after: newSession,
      isDemo: newSession.isDemo
    });

    return newSession;
  }

  public getSession(sessionId: string): OsintSession | null {
    return this.sessions.find(s => s.id === sessionId) || null;
  }

  public listSessions(): OsintSession[] {
    return [...this.sessions];
  }

  public closeSession(sessionId: string, actorUserId?: string): boolean {
    const sess = this.getSession(sessionId);
    if (!sess) return false;

    sess.status = 'FERMEE';
    this.save(SECURITY_STORAGE_KEYS.SESSIONS, this.sessions);

    this.addAuditLog({
      action: 'SESSION_CLOSED',
      entityType: 'SESSION',
      entityId: sessionId,
      actorUserId: actorUserId || sess.userId,
      success: true,
      reason: `Fermeture normale de session`,
      isDemo: sess.isDemo
    });

    return true;
  }

  public revokeSession(sessionId: string, reason?: string, actorUserId?: string): boolean {
    const sess = this.getSession(sessionId);
    if (!sess) return false;

    sess.status = 'REVOQUEE';
    this.save(SECURITY_STORAGE_KEYS.SESSIONS, this.sessions);

    this.addAuditLog({
      action: 'SESSION_REVOKED',
      entityType: 'SESSION',
      entityId: sessionId,
      actorUserId: actorUserId || this.currentUserId,
      success: true,
      reason: reason || `Révocation de sécurité de la session`,
      isDemo: sess.isDemo
    });

    return true;
  }

  public expireSession(sessionId: string): boolean {
    const sess = this.getSession(sessionId);
    if (!sess) return false;

    sess.status = 'EXPIREE';
    this.save(SECURITY_STORAGE_KEYS.SESSIONS, this.sessions);

    this.addAuditLog({
      action: 'SESSION_EXPIRED',
      entityType: 'SESSION',
      entityId: sessionId,
      actorUserId: sess.userId,
      success: true,
      reason: `Expiration temporelle de la session`,
      isDemo: sess.isDemo
    });

    return true;
  }

  public isSessionValid(sessionId: string | null): boolean {
    if (!sessionId) return false;
    const sess = this.getSession(sessionId);
    if (!sess) return false;
    if (sess.status !== 'ACTIVE') return false;

    // Check expiration date
    const now = new Date();
    const expiry = new Date(sess.expiresAt.replace(' ', 'T'));
    if (isNaN(expiry.getTime()) || now > expiry) {
      sess.status = 'EXPIREE';
      this.save(SECURITY_STORAGE_KEYS.SESSIONS, this.sessions);
      return false;
    }

    // Check user status
    const user = this.getUser(sess.userId);
    if (!user || user.status !== 'ACTIF') {
      sess.status = 'REVOQUEE';
      this.save(SECURITY_STORAGE_KEYS.SESSIONS, this.sessions);
      return false;
    }

    return true;
  }

  public touchSession(sessionId: string): void {
    const sess = this.getSession(sessionId);
    if (sess && sess.status === 'ACTIVE') {
      sess.lastActivityAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      this.save(SECURITY_STORAGE_KEYS.SESSIONS, this.sessions);
    }
  }

  public setCurrentUser(userId: string): boolean {
    const user = this.getUser(userId);
    if (!user) return false;

    this.currentUserId = userId;
    let activeSess = this.sessions.find(s => s.userId === userId && s.status === 'ACTIVE');
    if (!activeSess && user.status === 'ACTIF') {
      activeSess = this.createSession(userId);
    }
    this.currentSessionId = activeSess ? activeSess.id : null;
    return true;
  }

  public getCurrentUser(): OsintUser | null {
    return this.getUser(this.currentUserId);
  }

  public getCurrentSession(): OsintSession | null {
    if (!this.currentSessionId) return null;
    return this.getSession(this.currentSessionId);
  }

  // ==========================================
  // AUTHORIZATION SERVICE-SIDE
  // ==========================================
  public getUserPermissions(userId: string): OsintPermission[] {
    const user = this.getUser(userId);
    if (!user || user.status !== 'ACTIF') return [];

    const permIds = new Set<string>();
    user.roleIds.forEach(roleId => {
      const role = this.getRole(roleId);
      if (role) {
        role.permissionIds.forEach(pId => permIds.add(pId));
      }
    });

    return this.permissions.filter(p => permIds.has(p.id));
  }

  public hasPermission(userId: string, resource: string, action: OsintPermissionAction): boolean {
    const userPerms = this.getUserPermissions(userId);
    return userPerms.some(p => p.resource === resource && p.action === action);
  }

  public authorizeAction(
    userId: string,
    resource: string,
    action: string,
    context?: {
      targetAuthorUserId?: string;
      isValidationOfOwnWork?: boolean;
    }
  ): OsintAccessDecision {
    const user = this.getUser(userId);
    const activeSession = this.sessions.find(s => s.userId === userId && s.status === 'ACTIVE');
    const roleIds = user ? user.roleIds : [];
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Rule 1: User must exist
    if (!user) {
      const decision = this.recordAccessDecision({
        userId,
        resource,
        action,
        allowed: false,
        reason: `Refus : Utilisateur introuvable (RUPTURE_LIEN)`,
        roleIds: [],
        permissionIds: [],
        timestamp,
        isDemo: true
      });
      return decision;
    }

    // Rule 2: User must be active
    if (user.status !== 'ACTIF') {
      const decision = this.recordAccessDecision({
        sessionId: activeSession?.id,
        userId,
        resource,
        action,
        allowed: false,
        reason: `Refus : Utilisateur non actif (Statut: ${user.status})`,
        roleIds,
        permissionIds: [],
        timestamp,
        isDemo: user.isDemo
      });
      return decision;
    }

    // Rule 3: Valid active session required
    if (!activeSession || !this.isSessionValid(activeSession.id)) {
      const decision = this.recordAccessDecision({
        sessionId: activeSession?.id,
        userId,
        resource,
        action,
        allowed: false,
        reason: `Refus : Session inexistante, expirée ou révoquée`,
        roleIds,
        permissionIds: [],
        timestamp,
        isDemo: user.isDemo
      });
      return decision;
    }

    // Rule 4: Resource & Action validation
    const matchingPerms = this.getUserPermissions(userId).filter(
      p => p.resource === resource && (p.action === action || (action === 'VIEW' && p.action === 'VIEW'))
    );

    if (matchingPerms.length === 0) {
      const decision = this.recordAccessDecision({
        sessionId: activeSession.id,
        userId,
        resource,
        action,
        allowed: false,
        reason: `Refus : Permission absente pour ressource '${resource}' et action '${action}'`,
        roleIds,
        permissionIds: [],
        timestamp,
        isDemo: user.isDemo
      });
      return decision;
    }

    // Rule 5: Separation of duties (SoD)
    // Principle: Admin is not operational validator, and an analyst cannot validate their own sensitive analysis
    if (action === 'VALIDATE') {
      const isAdminOnly = user.roleIds.includes('role-admin-systeme') && !user.roleIds.includes('role-responsable-renseignement');
      if (isAdminOnly) {
        const decision = this.recordAccessDecision({
          sessionId: activeSession.id,
          userId,
          resource,
          action,
          allowed: false,
          reason: `Refus SoD : Un administrateur technique ne peut pas valider des contenus opérationnels de renseignement`,
          roleIds,
          permissionIds: matchingPerms.map(p => p.id),
          timestamp,
          isDemo: user.isDemo
        });
        return decision;
      }

      if (context?.isValidationOfOwnWork) {
        const decision = this.recordAccessDecision({
          sessionId: activeSession.id,
          userId,
          resource,
          action,
          allowed: false,
          reason: `Refus SoD : Un analyste ne peut pas valider formellement sa propre production critique (séparation des responsabilités)`,
          roleIds,
          permissionIds: matchingPerms.map(p => p.id),
          timestamp,
          isDemo: user.isDemo
        });
        return decision;
      }
    }

    // Granted
    this.touchSession(activeSession.id);
    const decision = this.recordAccessDecision({
      sessionId: activeSession.id,
      userId,
      resource,
      action,
      allowed: true,
      reason: `Autorisation accordée : permission(s) vérifiée(s) [${matchingPerms.map(p => p.code).join(', ')}]`,
      roleIds,
      permissionIds: matchingPerms.map(p => p.id),
      timestamp,
      isDemo: user.isDemo
    });

    return decision;
  }

  public requirePermission(
    userId: string,
    resource: string,
    action: string,
    context?: { isValidationOfOwnWork?: boolean }
  ): void {
    const decision = this.authorizeAction(userId, resource, action, context);
    if (!decision.allowed) {
      throw new Error(`ACCES_REFUSE: ${decision.reason}`);
    }
  }

  public recordAccessDecision(dec: Omit<OsintAccessDecision, 'id'>): OsintAccessDecision {
    const decision: OsintAccessDecision = {
      id: `dec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...dec
    };

    this.decisions.unshift(decision);
    if (this.decisions.length > 200) {
      this.decisions.pop();
    }
    this.save(SECURITY_STORAGE_KEYS.DECISIONS, this.decisions);

    // If denied, log in security audit automatically
    if (!decision.allowed) {
      this.addAuditLog({
        action: 'ACCESS_DENIED',
        entityType: 'RESOURCE',
        entityId: decision.resource,
        actorUserId: decision.userId,
        success: false,
        reason: decision.reason,
        before: { action: decision.action, resource: decision.resource },
        after: { allowed: false },
        isDemo: decision.isDemo
      });
    }

    return decision;
  }

  public getAccessDecisions(): OsintAccessDecision[] {
    return [...this.decisions];
  }

  // ==========================================
  // CONFIGURATION & METRICS
  // ==========================================
  public setSessionDurationMinutes(mins: number): void {
    this.sessionDurationMinutes = Math.max(5, mins);
  }

  public getSessionDurationMinutes(): number {
    return this.sessionDurationMinutes;
  }

  public getSecurityMetrics() {
    const activeUsers = this.users.filter(u => u.status === 'ACTIF').length;
    const suspendedUsers = this.users.filter(u => u.status === 'SUSPENDU').length;
    const disabledUsers = this.users.filter(u => u.status === 'DESACTIVE').length;
    const activeSessions = this.sessions.filter(s => s.status === 'ACTIVE' && this.isSessionValid(s.id)).length;
    const deniedDecisions = this.decisions.filter(d => !d.allowed).length;
    const totalDecisions = this.decisions.length;

    return {
      activeUsers,
      suspendedUsers,
      disabledUsers,
      totalUsers: this.users.length,
      rolesCount: this.roles.length,
      permissionsCount: this.permissions.length,
      activeSessions,
      deniedDecisions,
      totalDecisions,
      auditCount: this.audits.length,
      securityHealthStatus: disabledUsers > 0 || suspendedUsers > 0 ? 'ATTENTION_REQUISE' : 'OPTIMAL'
    };
  }

  // ==========================================
  // EXPORT JSON
  // ==========================================
  public exportSecurityJson(): string {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        lot: 'LOT 42 — Centre de Sécurité et Contrôle d’Accès',
        application: 'OSINT AFRICA',
        classification: 'DIFFUSION RESTREINTE - USAGE LOCAL SOUVERAIN'
      },
      metrics: this.getSecurityMetrics(),
      users: this.users,
      roles: this.roles,
      permissions: this.permissions,
      sessions: this.sessions,
      decisions: this.decisions,
      auditTrail: this.audits,
      settings: {
        sessionDurationMinutes: this.sessionDurationMinutes,
        enforceSeparationOfDuties: true,
        networkCallRestriction: 'STRICT_LOCAL_0_NETWORK'
      }
    };

    return JSON.stringify(exportData, null, 2);
  }
}

export const accessControlService = new AccessControlService();
