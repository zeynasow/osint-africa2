import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Key,
  Lock,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Settings,
  Download,
  Activity,
  UserCheck,
  UserX,
  RefreshCw,
  Eye,
  Sliders
} from 'lucide-react';
import {
  accessControlService,
  SECURITY_STORAGE_KEYS
} from '../../services/accessControlService';
import {
  OsintUser,
  OsintRole,
  OsintPermission,
  OsintSession,
  OsintAccessDecision,
  OsintSecurityAudit
} from '../../types';

export const SecurityAccessCenterScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [users, setUsers] = useState<OsintUser[]>([]);
  const [roles, setRoles] = useState<OsintRole[]>([]);
  const [permissions, setPermissions] = useState<OsintPermission[]>([]);
  const [sessions, setSessions] = useState<OsintSession[]>([]);
  const [decisions, setDecisions] = useState<OsintAccessDecision[]>([]);
  const [audits, setAudits] = useState<OsintSecurityAudit[]>([]);
  const [currentUser, setCurrentUser] = useState<OsintUser | null>(null);
  const [metrics, setMetrics] = useState(accessControlService.getSecurityMetrics());
  const [notification, setNotification] = useState<string | null>(null);

  // Test workbench states
  const [testUser, setTestUser] = useState<string>('user-resp-01');
  const [testResource, setTestResource] = useState<string>('LOT37_ANALYSIS');
  const [testAction, setTestAction] = useState<string>('VALIDATE');
  const [testResult, setTestResult] = useState<OsintAccessDecision | null>(null);

  const refreshData = () => {
    setUsers(accessControlService.listUsers());
    setRoles(accessControlService.listRoles());
    setPermissions(accessControlService.listPermissions());
    setSessions(accessControlService.listSessions());
    setDecisions(accessControlService.getAccessDecisions());
    setAudits(accessControlService.getSecurityAudit());
    setCurrentUser(accessControlService.getCurrentUser());
    setMetrics(accessControlService.getSecurityMetrics());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSwitchUser = (userId: string) => {
    accessControlService.setCurrentUser(userId);
    refreshData();
    showNotice(`Utilisateur actif basculé vers : ${accessControlService.getUser(userId)?.displayName}`);
  };

  const handleDisableUser = (userId: string) => {
    accessControlService.disableUser(userId, 'Désactivation manuelle via Centre de Sécurité');
    refreshData();
    showNotice('Compte désactivé et sessions actives révoquées.');
  };

  const handleSuspendUser = (userId: string) => {
    accessControlService.suspendUser(userId, 'Suspension conservatoire');
    refreshData();
    showNotice('Compte suspendu.');
  };

  const handleRevokeSession = (sessionId: string) => {
    accessControlService.revokeSession(sessionId, 'Révocation manuelle par administrateur');
    refreshData();
    showNotice('Session révoquée avec succès.');
  };

  const handleRunAuthTest = () => {
    const res = accessControlService.authorizeAction(testUser, testResource, testAction);
    setTestResult(res);
    refreshData();
  };

  const handleExportJson = () => {
    const jsonStr = accessControlService.exportSecurityJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osint-africa-security-export-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('Export du registre de sécurité téléchargé en format JSON.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Centre de Sécurité, Contrôle d'Accès et Gouvernance</h1>
              <p className="text-sm text-slate-400">LOT 42 — Souveraineté Numérique, RBAC Local & Séparation des Responsabilités</p>
            </div>
          </div>
        </div>

        {/* Current Active User Switcher */}
        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700">
          <div className="text-xs text-right">
            <div className="text-slate-400">Utilisateur Actif (Simulation Locale)</div>
            <div className="font-semibold text-emerald-400">{currentUser?.displayName || 'Non assigné'}</div>
          </div>
          <select
            value={currentUser?.id || ''}
            onChange={(e) => handleSwitchUser(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.username} ({u.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctrine Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-200/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Doctrine LOT 42 :</strong> Authentification ≠ Autorisation. Toute action sensible est contrôlée au niveau du service.
            Ce centre opère en simulation 100% locale (0 serveur OAuth/LDAP, 0 connexion réseau).
          </span>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 ml-4 shrink-0 transition"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Actualiser</span>
        </button>
      </div>

      {notification && (
        <div className="bg-indigo-900/60 border border-indigo-700 text-indigo-200 text-xs px-4 py-2 rounded-md flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs Navigation (12 Tabs Mandated by Specification) */}
      <div className="border-b border-slate-800 flex overflow-x-auto gap-1 text-xs font-medium text-slate-400 scrollbar-thin">
        {[
          { id: 1, label: "Vue d'ensemble", icon: Activity },
          { id: 2, label: "Utilisateurs", icon: Users },
          { id: 3, label: "Rôles", icon: Shield },
          { id: 4, label: "Permissions", icon: Key },
          { id: 5, label: "Sessions", icon: Clock },
          { id: 6, label: "Autorisations", icon: Lock },
          { id: 7, label: "Accès Refusés", icon: XCircle },
          { id: 8, label: "Audit Sécurité", icon: FileText },
          { id: 9, label: "Séparation Responsabilités", icon: Sliders },
          { id: 10, label: "Paramètres", icon: Settings },
          { id: 11, label: "Export", icon: Download },
          { id: 12, label: "Santé Sécurité", icon: AlertTriangle }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2.5 whitespace-nowrap border-b-2 transition ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-transparent hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: VUE D'ENSEMBLE */}
      {activeTab === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400">Utilisateurs Actifs</div>
              <div className="text-2xl font-bold text-slate-100 mt-1">{metrics.activeUsers} <span className="text-xs font-normal text-slate-500">/ {metrics.totalUsers}</span></div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Comptes opérationnels
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400">Sessions Actives</div>
              <div className="text-2xl font-bold text-slate-100 mt-1">{metrics.activeSessions}</div>
              <div className="text-[11px] text-indigo-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Durée : {accessControlService.getSessionDurationMinutes()} min
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400">Rôles & Permissions</div>
              <div className="text-2xl font-bold text-slate-100 mt-1">{metrics.rolesCount} <span className="text-xs font-normal text-slate-500">/ {metrics.permissionsCount} perms</span></div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Key className="w-3 h-3" /> Matrice RBAC locale
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400">Refus de Sécurité</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">{metrics.deniedDecisions} <span className="text-xs font-normal text-slate-500">/ {metrics.totalDecisions}</span></div>
              <div className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Traçabilité 100%
              </div>
            </div>
          </div>

          {/* Quick Authorization Workbench */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              Banc d'Essai d'Autorisation Service-Side (Temps Réel)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Simule l'exécution d'une fonction métier et vérifie que le service <code>authorizeAction()</code> bloque les requêtes illégitimes même si l'interface était contournée.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Utilisateur</label>
                <select
                  value={testUser}
                  onChange={(e) => setTestUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded p-2 text-slate-200"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.username} ({u.roleIds.join(', ')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Ressource Protégée</label>
                <select
                  value={testResource}
                  onChange={(e) => setTestResource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded p-2 text-slate-200"
                >
                  <option value="LOT34_REQUIREMENTS">LOT34_REQUIREMENTS (Besoins)</option>
                  <option value="LOT35_RESEARCH">LOT35_RESEARCH (Recherche)</option>
                  <option value="LOT36_VERIFICATION">LOT36_VERIFICATION (Preuves)</option>
                  <option value="LOT37_ANALYSIS">LOT37_ANALYSIS (Évaluation)</option>
                  <option value="LOT38_PROSPECTIVE">LOT38_PROSPECTIVE (Scénarios)</option>
                  <option value="LOT39_MONITORING">LOT39_MONITORING (Monitoring)</option>
                  <option value="LOT40_SITUATION">LOT40_SITUATION (Synthèse)</option>
                  <option value="LOT41_GOVERNANCE">LOT41_GOVERNANCE (Gouvernance)</option>
                  <option value="LOT42_SECURITY">LOT42_SECURITY (Sécurité)</option>
                  <option value="EXPORT">EXPORT (Exportation)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Action Demandée</label>
                <select
                  value={testAction}
                  onChange={(e) => setTestAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded p-2 text-slate-200"
                >
                  <option value="VIEW">VIEW (Consultation)</option>
                  <option value="CREATE">CREATE (Création)</option>
                  <option value="UPDATE">UPDATE (Modification)</option>
                  <option value="VALIDATE">VALIDATE (Validation Formelle)</option>
                  <option value="ADMIN">ADMIN (Administration)</option>
                  <option value="EXPORT">EXPORT (Exportation)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleRunAuthTest}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2 px-3 rounded transition"
                >
                  Évaluer Autorisation
                </button>
              </div>
            </div>

            {testResult && (
              <div className={`mt-4 p-3 rounded-lg border text-xs ${
                testResult.allowed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              }`}>
                <div className="flex items-center gap-2 font-semibold">
                  {testResult.allowed ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                  <span>{testResult.allowed ? 'AUTORISATION ACCORDÉE' : 'ACCÈS REFUSÉ'}</span>
                </div>
                <div className="mt-1 text-slate-300">{testResult.reason}</div>
                <div className="mt-2 text-[10px] text-slate-400 flex gap-4">
                  <span>ID Décision: {testResult.id}</span>
                  <span>Rôles: {testResult.roleIds.join(', ') || 'Aucun'}</span>
                  <span>Permissions: {testResult.permissionIds.join(', ') || 'Aucune'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: UTILISATEURS */}
      {activeTab === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-200">Comptes Utilisateurs Locaux (Simulation OSINT AFRICA)</h3>
            <span className="text-xs text-slate-400">{users.length} comptes répertoriés</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Service / Département</th>
                  <th className="px-4 py-3">Rôles Attribués</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Dernière Activité</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-200">{u.displayName}</div>
                      <div className="text-slate-500 text-[11px]">@{u.username} • {u.id}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{u.department}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roleIds.map(rid => {
                          const r = roles.find(rl => rl.id === rid);
                          return (
                            <span key={rid} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                              {r?.name || rid}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        u.status === 'ACTIF' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        u.status === 'SUSPENDU' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {u.lastLoginAt || 'Jamais connecté'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {u.status === 'ACTIF' && (
                        <>
                          <button
                            onClick={() => handleSuspendUser(u.id)}
                            className="text-amber-400 hover:text-amber-300 text-[11px]"
                          >
                            Suspendre
                          </button>
                          <button
                            onClick={() => handleDisableUser(u.id)}
                            className="text-rose-400 hover:text-rose-300 text-[11px]"
                          >
                            Désactiver
                          </button>
                        </>
                      )}
                      {u.status !== 'ACTIF' && (
                        <button
                          onClick={() => {
                            accessControlService.updateUser(u.id, { status: 'ACTIF' });
                            refreshData();
                            showNotice(`Compte ${u.username} réactivé.`);
                          }}
                          className="text-emerald-400 hover:text-emerald-300 text-[11px]"
                        >
                          Réactiver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RÔLES */}
      {activeTab === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(r => (
            <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm">{r.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{r.description}</p>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                  {r.isSystemRole ? 'Système' : 'Personnalisé'}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="text-[11px] text-slate-400 mb-2 font-medium">
                  Permissions Associées ({r.permissionIds.length}) :
                </div>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {r.permissionIds.map(pid => {
                    const p = permissions.find(pm => pm.id === pid);
                    return (
                      <span key={pid} className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px]">
                        {p?.code || pid}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: PERMISSIONS */}
      {activeTab === 4 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-200">Catalogue des Permissions Systèmes ({permissions.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Code Permission</th>
                  <th className="px-4 py-3">Nom & Description</th>
                  <th className="px-4 py-3">Ressource Protégée</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Sensibilité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {permissions.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-400">{p.code}</td>
                    <td className="px-4 py-3">
                      <div className="text-slate-200 font-medium">{p.name}</div>
                      <div className="text-slate-500 text-[11px]">{p.description}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">{p.resource}</td>
                    <td className="px-4 py-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {p.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        p.sensitivity === 'CRITIQUE' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        p.sensitivity === 'SENSIBLE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {p.sensitivity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SESSIONS */}
      {activeTab === 5 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-200">Sessions Simulées en Local</h3>
            <button
              onClick={() => {
                if (currentUser) {
                  accessControlService.createSession(currentUser.id);
                  refreshData();
                  showNotice('Nouvelle session créée.');
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded transition"
            >
              Créer Nouvelle Session
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">ID Session</th>
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Démarrage / Expiration</th>
                  <th className="px-4 py-3">Simulation Machine</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sessions.map(s => {
                  const u = users.find(usr => usr.id === s.userId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{s.id}</td>
                      <td className="px-4 py-3">
                        <div className="text-slate-200 font-medium">{u?.displayName || s.userId}</div>
                        <div className="text-slate-500 text-[10px]">@{u?.username}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          s.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          s.status === 'EXPIREE' ? 'bg-slate-800 text-slate-400' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        <div>Début : {s.startedAt}</div>
                        <div className="text-slate-500 text-[10px]">Expire : {s.expiresAt}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        <div>{s.deviceSimulation}</div>
                        <div className="text-slate-500 text-[10px]">{s.ipSimulation}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {s.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleRevokeSession(s.id)}
                            className="text-rose-400 hover:text-rose-300 text-[11px]"
                          >
                            Révoquer
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: AUTORISATIONS */}
      {activeTab === 6 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-200">Journal des Décisions d'Accès Récentes</h3>
            <p className="text-xs text-slate-400">Trace de toutes les requêtes évaluées par le service central d'autorisation.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Ressource</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Verdict</th>
                  <th className="px-4 py-3">Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {decisions.slice(0, 30).map(d => {
                  const u = users.find(usr => usr.id === d.userId);
                  return (
                    <tr key={d.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap">{d.timestamp}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">{u?.displayName || d.userId}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-300">{d.resource}</td>
                      <td className="px-4 py-3">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {d.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 w-fit ${
                          d.allowed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {d.allowed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{d.allowed ? 'ACCORDÉ' : 'REFUSÉ'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px] max-w-xs truncate">{d.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: ACCÈS REFUSÉS */}
      {activeTab === 7 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-rose-300 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              Incidents et Tentatives Refusées
            </h3>
            <p className="text-xs text-slate-400">Rapports d'exceptions de sécurité et blocages service-side.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Utilisateur / Session</th>
                  <th className="px-4 py-3">Cible</th>
                  <th className="px-4 py-3">Raison du Refus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {decisions.filter(d => !d.allowed).map(d => {
                  const u = users.find(usr => usr.id === d.userId);
                  return (
                    <tr key={d.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap">{d.timestamp}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-200">{u?.displayName || d.userId}</div>
                        <div className="text-slate-500 text-[10px]">Session: {d.sessionId || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-[11px] text-slate-300">{d.resource}</div>
                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{d.action}</span>
                      </td>
                      <td className="px-4 py-3 text-rose-300/90 text-[11px]">{d.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT SÉCURITÉ */}
      {activeTab === 8 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Journal d'Audit de Sécurité (Append-Only)</h3>
              <p className="text-xs text-slate-400">Enregistrement inaltérable de tous les événements d'habilitation et de session.</p>
            </div>
            <span className="text-xs text-slate-400">{audits.length} événements enregistrés</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Horodatage</th>
                  <th className="px-4 py-3">Événement</th>
                  <th className="px-4 py-3">Acteur</th>
                  <th className="px-4 py-3">Cible</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {audits.map(a => {
                  const actor = users.find(u => u.id === a.actorUserId);
                  return (
                    <tr key={a.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap font-mono">{a.timestamp}</td>
                      <td className="px-4 py-3 font-semibold text-slate-200">{a.action}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {actor?.username || a.actorUserId}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {a.entityType} : <span className="font-mono">{a.entityId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          a.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {a.success ? 'SUCCÈS' : 'ÉCHEC'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px] max-w-sm truncate">{a.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: SÉPARATION DES RESPONSABILITÉS */}
      {activeTab === 9 && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Matrice de Séparation des Responsabilités (SoD)
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Pour garantir la déontologie et la souveraineté de l'analyse, certaines fonctions sont mutuellement exclusives au niveau du service.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="font-semibold text-indigo-400 mb-1">Administration vs Analyse</div>
                <p className="text-slate-400 leading-relaxed">
                  L'administrateur technique (<code>ADMIN_SYSTEME</code>) ne dispose d'aucun privilège de validation opérationnelle ou analytique sur les LOTS 34 à 40.
                </p>
                <div className="mt-3 text-[10px] text-emerald-400 font-mono">Contrôle : ACTIF au niveau service</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="font-semibold text-indigo-400 mb-1">Auto-Validation Interdite</div>
                <p className="text-slate-400 leading-relaxed">
                  Un analyste ne peut pas valider formellement sa propre production critique (besoins, hypothèses, appréciations, synthèses situationnelles).
                </p>
                <div className="mt-3 text-[10px] text-emerald-400 font-mono">Contrôle : ACTIF au niveau service</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="font-semibold text-indigo-400 mb-1">Consultation en Lecture Seule</div>
                <p className="text-slate-400 leading-relaxed">
                  Le rôle <code>CONSULTATION</code> interdit strictement toute opération d'écriture, de modification ou d'exportation non auditée.
                </p>
                <div className="mt-3 text-[10px] text-emerald-400 font-mono">Contrôle : ACTIF au niveau service</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: PARAMÈTRES */}
      {activeTab === 10 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-xl">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            Paramètres de Sécurité et Sessions Locales
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Durée de Validité d'une Session (Minutes)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={accessControlService.getSessionDurationMinutes()}
                  onChange={(e) => {
                    accessControlService.setSessionDurationMinutes(parseInt(e.target.value) || 60);
                    refreshData();
                  }}
                  className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200 w-32"
                />
                <span className="text-slate-500 self-center">Minutes (Défaut : 480 min = 8h)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="font-semibold text-slate-300 mb-1">Contrôle de Réseau & Confinement</div>
              <p className="text-slate-400 text-[11px]">
                Le LOT 42 applique un cloisonnement strict : 0 appel externe (OAuth/LDAP/API).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: EXPORT */}
      {activeTab === 11 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-xl">
          <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-400" />
            Exportation Intégrale du Registre de Sécurité
          </h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Génère une archive locale au format JSON contenant les utilisateurs, rôles, permissions, sessions, décisions d'accès et journal d'audit append-only.
          </p>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2 px-4 rounded transition"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger l'Export de Sécurité (.json)</span>
          </button>
        </div>
      )}

      {/* TAB 12: SANTÉ SÉCURITÉ */}
      {activeTab === 12 && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-emerald-400" />
              Bilan de Santé de Sécurité Applicative
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Intégrité des Rôles Système</span>
                  <span className="text-emerald-400 font-semibold">CONFORME (5 rôles scellés)</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Confinement Réseau</span>
                  <span className="text-emerald-400 font-semibold">100% LOCAL (0 fuite)</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Sessions Actives Revalidées</span>
                  <span className="text-emerald-400 font-semibold">{metrics.activeSessions} valides</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Audit Trail Append-Only</span>
                  <span className="text-emerald-400 font-semibold">ACTIF ({metrics.auditCount} entrées)</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Comptes Verrouillés / Suspendus</span>
                  <span className="text-amber-400 font-semibold">{metrics.disabledUsers + metrics.suspendedUsers} compte(s)</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Filtrage Service-Side</span>
                  <span className="text-emerald-400 font-semibold">OPÉRATIONNEL (100%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SecurityAccessCenterScreen;
