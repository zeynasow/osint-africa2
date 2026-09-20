import {
  OsintUser,
  OsintRole,
  OsintPermission,
  OsintSession,
  OsintAccessDecision,
  OsintSecurityAudit
} from '../types';

export const INITIAL_SECURITY_PERMISSIONS: OsintPermission[] = [
  // LOT 34 - Requirements
  {
    id: 'perm-lot34-view',
    code: 'LOT34_VIEW',
    name: 'Consulter Besoins et Questions',
    description: 'Permet de consulter les besoins et questions d’orientation renseignement',
    resource: 'LOT34_REQUIREMENTS',
    action: 'VIEW',
    sensitivity: 'NORMALE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },
  {
    id: 'perm-lot34-create',
    code: 'LOT34_CREATE',
    name: 'Créer Besoins et Questions',
    description: 'Permet de formaliser de nouveaux besoins et questions',
    resource: 'LOT34_REQUIREMENTS',
    action: 'CREATE',
    sensitivity: 'SENSIBLE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },
  {
    id: 'perm-lot34-validate',
    code: 'LOT34_VALIDATE',
    name: 'Valider Besoins Prioritaires',
    description: 'Validation hiérarchique des besoins en renseignement',
    resource: 'LOT34_REQUIREMENTS',
    action: 'VALIDATE',
    sensitivity: 'CRITIQUE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },

  // LOT 35 - Research
  {
    id: 'perm-lot35-view',
    code: 'LOT35_VIEW',
    name: 'Consulter Plans et Résultats',
    description: 'Permet de voir les plans de collecte et résultats T0',
    resource: 'LOT35_RESEARCH',
    action: 'VIEW',
    sensitivity: 'NORMALE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },
  {
    id: 'perm-lot35-create',
    code: 'LOT35_CREATE',
    name: 'Créer Plans de Recherche',
    description: 'Permet d’élaborer des plans de recherche OSINT',
    resource: 'LOT35_RESEARCH',
    action: 'CREATE',
    sensitivity: 'SENSIBLE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },

  // LOT 36 - Verification
  {
    id: 'perm-lot36-view',
    code: 'LOT36_VIEW',
    name: 'Consulter Qualifications et Preuves',
    description: 'Permet de voir les vérifications techniques',
    resource: 'LOT36_VERIFICATION',
    action: 'VIEW',
    sensitivity: 'NORMALE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },
  {
    id: 'perm-lot36-update',
    code: 'LOT36_UPDATE',
    name: 'Qualifier les Éléments de Preuve',
    description: 'Permet de noter la fiabilité et corroboration',
    resource: 'LOT36_VERIFICATION',
    action: 'UPDATE',
    sensitivity: 'SENSIBLE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },

  // LOT 37 - Analysis
  {
    id: 'perm-lot37-view',
    code: 'LOT37_VIEW',
    name: 'Consulter Évaluations Analytiques',
    description: 'Permet de consulter les hypothèses et matrices',
    resource: 'LOT37_ANALYSIS',
    action: 'VIEW',
    sensitivity: 'NORMALE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },
  {
    id: 'perm-lot37-update',
    code: 'LOT37_UPDATE',
    name: 'Modifier Évaluations et Matrices',
    description: 'Permet de pondérer et évaluer les hypothèses',
    resource: 'LOT37_ANALYSIS',
    action: 'UPDATE',
    sensitivity: 'SENSIBLE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },
  {
    id: 'perm-lot37-validate',
    code: 'LOT37_VALIDATE',
    name: 'Valider Hypothèse / Appréciation',
    description: 'Permet de sceller une appréciation analytique',
    resource: 'LOT37_ANALYSIS',
    action: 'VALIDATE',
    sensitivity: 'CRITIQUE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },

  // LOT 38 - Prospective
  {
    id: 'perm-lot38-view',
    code: 'LOT38_VIEW',
    name: 'Consulter Scénarios et Indicateurs',
    description: 'Permet de voir les scénarios prospectifs',
    resource: 'LOT38_PROSPECTIVE',
    action: 'VIEW',
    sensitivity: 'NORMALE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },
  {
    id: 'perm-lot38-update',
    code: 'LOT38_UPDATE',
    name: 'Modifier Scénarios',
    description: 'Permet d’ajuster les indicateurs précurseurs',
    resource: 'LOT38_PROSPECTIVE',
    action: 'UPDATE',
    sensitivity: 'SENSIBLE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },

  // LOT 39 - Monitoring
  {
    id: 'perm-lot39-view',
    code: 'LOT39_VIEW',
    name: 'Consulter Monitoring et Signaux',
    description: 'Permet de voir les observations et alertes passives',
    resource: 'LOT39_MONITORING',
    action: 'VIEW',
    sensitivity: 'NORMALE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },
  {
    id: 'perm-lot39-create',
    code: 'LOT39_CREATE',
    name: 'Enregistrer Observations et Signaux',
    description: 'Permet d’ajouter des observations de veille',
    resource: 'LOT39_MONITORING',
    action: 'CREATE',
    sensitivity: 'NORMALE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },
  {
    id: 'perm-lot39-update',
    code: 'LOT39_UPDATE',
    name: 'Mettre à jour Monitoring',
    description: 'Permet d’ajuster les seuils de suivi',
    resource: 'LOT39_MONITORING',
    action: 'UPDATE',
    sensitivity: 'SENSIBLE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },

  // LOT 40 - Situation
  {
    id: 'perm-lot40-view',
    code: 'LOT40_VIEW',
    name: 'Consulter Synthèses Situationnelles',
    description: 'Permet de lire les points de situation',
    resource: 'LOT40_SITUATION',
    action: 'VIEW',
    sensitivity: 'NORMALE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },
  {
    id: 'perm-lot40-validate',
    code: 'LOT40_VALIDATE',
    name: 'Valider Synthèse Situationnelle',
    description: 'Validation humaine formelle d’une synthèse',
    resource: 'LOT40_SITUATION',
    action: 'VALIDATE',
    sensitivity: 'CRITIQUE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },

  // LOT 41 - Governance
  {
    id: 'perm-lot41-view',
    code: 'LOT41_VIEW',
    name: 'Consulter Gouvernance et Audit',
    description: 'Permet de voir le tableau de bord de gouvernance',
    resource: 'LOT41_GOVERNANCE',
    action: 'VIEW',
    sensitivity: 'NORMALE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },
  {
    id: 'perm-lot41-update',
    code: 'LOT41_UPDATE',
    name: 'Traiter Actions de Gouvernance',
    description: 'Permet d’assigner et résoudre les actions',
    resource: 'LOT41_GOVERNANCE',
    action: 'UPDATE',
    sensitivity: 'SENSIBLE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },

  // LOT 42 - Security
  {
    id: 'perm-lot42-view',
    code: 'LOT42_VIEW',
    name: 'Consulter Centre de Sécurité',
    description: 'Permet de voir les utilisateurs, rôles et sessions',
    resource: 'LOT42_SECURITY',
    action: 'VIEW',
    sensitivity: 'SENSIBLE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },
  {
    id: 'perm-lot42-admin',
    code: 'LOT42_ADMIN',
    name: 'Administration Utilisateurs et Sécurité',
    description: 'Permet de créer, modifier, désactiver des comptes et rôles',
    resource: 'LOT42_SECURITY',
    action: 'ADMIN',
    sensitivity: 'CRITIQUE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },

  // Cross-cutting: Export & Audit
  {
    id: 'perm-export-general',
    code: 'EXPORT_DATA',
    name: 'Exporter les Données Métier',
    description: 'Permet d’exporter des rapports en format JSON/Fichier',
    resource: 'EXPORT',
    action: 'EXPORT',
    sensitivity: 'SENSIBLE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  },
  {
    id: 'perm-audit-view',
    code: 'AUDIT_VIEW',
    name: 'Consulter Journaux d’Audit',
    description: 'Permet d’inspecter les logs d’audit technique et déontologique',
    resource: 'AUDIT',
    action: 'VIEW',
    sensitivity: 'SENSIBLE',
    isSystemPermission: true,
    createdAt: '2026-09-20 00:00:00',
    isDemo: true
  }
];

export const INITIAL_SECURITY_ROLES: OsintRole[] = [
  {
    id: 'role-admin-systeme',
    name: 'ADMIN_SYSTEME',
    description: 'Administrateur technique de l’infrastructure locale et des habilitations.',
    permissionIds: [
      'perm-lot41-view',
      'perm-lot42-view',
      'perm-lot42-admin',
      'perm-audit-view'
    ],
    isSystemRole: true,
    createdAt: '2026-09-20 00:00:00',
    updatedAt: '2026-09-20 00:00:00',
    isDemo: true
  },
  {
    id: 'role-responsable-renseignement',
    name: 'RESPONSABLE_RENSEIGNEMENT',
    description: 'Directeur ou chef de section : supervision globale et validation analytique.',
    permissionIds: [
      'perm-lot34-view',
      'perm-lot34-create',
      'perm-lot34-validate',
      'perm-lot35-view',
      'perm-lot35-create',
      'perm-lot36-view',
      'perm-lot36-update',
      'perm-lot37-view',
      'perm-lot37-update',
      'perm-lot37-validate',
      'perm-lot38-view',
      'perm-lot38-update',
      'perm-lot39-view',
      'perm-lot39-create',
      'perm-lot39-update',
      'perm-lot40-view',
      'perm-lot40-validate',
      'perm-lot41-view',
      'perm-lot41-update',
      'perm-export-general',
      'perm-audit-view'
    ],
    isSystemRole: true,
    createdAt: '2026-09-20 00:00:00',
    updatedAt: '2026-09-20 00:00:00',
    isDemo: true
  },
  {
    id: 'role-analyste-osint',
    name: 'ANALYSTE_OSINT',
    description: 'Analyste opérationnel en charge de la recherche, qualification et hypothèses.',
    permissionIds: [
      'perm-lot34-view',
      'perm-lot34-create',
      'perm-lot35-view',
      'perm-lot35-create',
      'perm-lot36-view',
      'perm-lot36-update',
      'perm-lot37-view',
      'perm-lot37-update',
      'perm-lot38-view',
      'perm-lot38-update',
      'perm-lot39-view',
      'perm-lot40-view',
      'perm-lot41-view',
      'perm-export-general'
    ],
    isSystemRole: true,
    createdAt: '2026-09-20 00:00:00',
    updatedAt: '2026-09-20 00:00:00',
    isDemo: true
  },
  {
    id: 'role-operateur-veille',
    name: 'OPERATEUR_VEILLE',
    description: 'Veilleur chargé de la capture passive et du monitoring des signaux.',
    permissionIds: [
      'perm-lot34-view',
      'perm-lot35-view',
      'perm-lot36-view',
      'perm-lot38-view',
      'perm-lot39-view',
      'perm-lot39-create',
      'perm-lot39-update',
      'perm-lot40-view'
    ],
    isSystemRole: true,
    createdAt: '2026-09-20 00:00:00',
    updatedAt: '2026-09-20 00:00:00',
    isDemo: true
  },
  {
    id: 'role-consultation',
    name: 'CONSULTATION',
    description: 'Auditeur ou observateur en lecture seule sans capacité de modification.',
    permissionIds: [
      'perm-lot34-view',
      'perm-lot35-view',
      'perm-lot36-view',
      'perm-lot37-view',
      'perm-lot38-view',
      'perm-lot39-view',
      'perm-lot40-view',
      'perm-lot41-view'
    ],
    isSystemRole: true,
    createdAt: '2026-09-20 00:00:00',
    updatedAt: '2026-09-20 00:00:00',
    isDemo: true
  }
];

export const INITIAL_SECURITY_USERS: OsintUser[] = [
  {
    id: 'user-admin-01',
    username: 'admin.tech',
    displayName: 'Amadou Fall (Ingénieur Système)',
    roleIds: ['role-admin-systeme'],
    status: 'ACTIF',
    department: 'Sécurité Numérique & Infrastructure',
    createdAt: '2026-09-10 08:00:00',
    updatedAt: '2026-09-20 05:00:00',
    lastLoginAt: '2026-09-20 05:30:00',
    isDemo: true
  },
  {
    id: 'user-resp-01',
    username: 'cpt.traore',
    displayName: 'Capitaine Traoré (Directeur d’Analyse)',
    roleIds: ['role-responsable-renseignement'],
    status: 'ACTIF',
    department: 'Direction du Renseignement Stratégique',
    createdAt: '2026-09-10 08:30:00',
    updatedAt: '2026-09-20 05:00:00',
    lastLoginAt: '2026-09-20 05:15:00',
    isDemo: true
  },
  {
    id: 'user-ana-01',
    username: 'dr.diallo',
    displayName: 'Dr. Aïssatou Diallo (Analyste Senior Sahel)',
    roleIds: ['role-analyste-osint'],
    status: 'ACTIF',
    department: 'Pôle Géopolitique & Dynamiques Transfrontalières',
    createdAt: '2026-09-12 09:00:00',
    updatedAt: '2026-09-19 14:00:00',
    lastLoginAt: '2026-09-20 04:45:00',
    isDemo: true
  },
  {
    id: 'user-op-01',
    username: 'op.keita',
    displayName: 'Moussa Keïta (Opérateur Veille OSINT)',
    roleIds: ['role-operateur-veille'],
    status: 'ACTIF',
    department: 'Centre de Capture & Monitoring',
    createdAt: '2026-09-14 10:00:00',
    updatedAt: '2026-09-18 16:30:00',
    lastLoginAt: '2026-09-20 03:20:00',
    isDemo: true
  },
  {
    id: 'user-cons-01',
    username: 'auditeur.externe',
    displayName: 'Maître Wade (Observateur Déontologique)',
    roleIds: ['role-consultation'],
    status: 'ACTIF',
    department: 'Comité Éthique & Souveraineté',
    createdAt: '2026-09-15 11:00:00',
    updatedAt: '2026-09-15 11:00:00',
    lastLoginAt: '2026-09-19 10:00:00',
    isDemo: true
  },
  {
    id: 'user-susp-01',
    username: 'temp.stagiaire',
    displayName: 'Stagiaire Veille (Accès Suspendu)',
    roleIds: ['role-consultation'],
    status: 'SUSPENDU',
    department: 'Centre de Capture & Monitoring',
    createdAt: '2026-09-01 08:00:00',
    updatedAt: '2026-09-18 12:00:00',
    isDemo: true
  },
  {
    id: 'user-des-01',
    username: 'ancien.collaborateur',
    displayName: 'Kouassi Mensah (Compte Désactivé)',
    roleIds: ['role-analyste-osint'],
    status: 'DESACTIVE',
    department: 'Pôle Maritime Golfe de Guinée',
    createdAt: '2026-08-01 08:00:00',
    updatedAt: '2026-09-16 18:00:00',
    disabledAt: '2026-09-16 18:00:00',
    isDemo: true
  }
];

export const INITIAL_SECURITY_SESSIONS: OsintSession[] = [
  {
    id: 'sess-resp-active',
    userId: 'user-resp-01',
    startedAt: '2026-09-20 05:00:00',
    lastActivityAt: '2026-09-20 05:40:00',
    expiresAt: '2026-12-31 23:59:59',
    status: 'ACTIVE',
    ipSimulation: '127.0.0.1 (Local workstation)',
    deviceSimulation: 'Station Souveraine Ubuntu 24.04',
    isDemo: true
  },
  {
    id: 'sess-ana-active',
    userId: 'user-ana-01',
    startedAt: '2026-09-20 04:30:00',
    lastActivityAt: '2026-09-20 05:35:00',
    expiresAt: '2026-12-31 23:59:59',
    status: 'ACTIVE',
    ipSimulation: '127.0.0.1 (Local workstation)',
    deviceSimulation: 'Station Analyste OSINT ThinkPad',
    isDemo: true
  },
  {
    id: 'sess-admin-active',
    userId: 'user-admin-01',
    startedAt: '2026-09-20 05:20:00',
    lastActivityAt: '2026-09-20 05:42:00',
    expiresAt: '2026-12-31 23:59:59',
    status: 'ACTIVE',
    ipSimulation: '127.0.0.1 (Local terminal)',
    deviceSimulation: 'Console Admin Durcie',
    isDemo: true
  },
  {
    id: 'sess-expired-old',
    userId: 'user-op-01',
    startedAt: '2026-09-19 08:00:00',
    lastActivityAt: '2026-09-19 12:00:00',
    expiresAt: '2026-09-19 16:00:00',
    status: 'EXPIREE',
    ipSimulation: '127.0.0.1 (Local workstation)',
    deviceSimulation: 'Poste Veille Dédié',
    isDemo: true
  },
  {
    id: 'sess-revoked-test',
    userId: 'user-des-01',
    startedAt: '2026-09-16 14:00:00',
    lastActivityAt: '2026-09-16 17:55:00',
    expiresAt: '2026-09-16 22:00:00',
    status: 'REVOQUEE',
    ipSimulation: '127.0.0.1 (Local terminal)',
    deviceSimulation: 'Poste Ancien Collaborateur',
    isDemo: true
  }
];

export const INITIAL_ACCESS_DECISIONS: OsintAccessDecision[] = [
  {
    id: 'dec-001',
    sessionId: 'sess-resp-active',
    userId: 'user-resp-01',
    resource: 'LOT40_SITUATION',
    action: 'VALIDATE',
    allowed: true,
    reason: 'Permission accordée via le rôle RESPONSABLE_RENSEIGNEMENT (perm-lot40-validate)',
    roleIds: ['role-responsable-renseignement'],
    permissionIds: ['perm-lot40-validate'],
    timestamp: '2026-09-20 05:15:00',
    isDemo: true
  },
  {
    id: 'dec-002',
    sessionId: 'sess-ana-active',
    userId: 'user-ana-01',
    resource: 'LOT42_SECURITY',
    action: 'ADMIN',
    allowed: false,
    reason: 'Refus : La permission LOT42_ADMIN requise pour administrer les comptes est absente pour le rôle ANALYSTE_OSINT',
    roleIds: ['role-analyste-osint'],
    permissionIds: [],
    timestamp: '2026-09-20 05:25:00',
    isDemo: true
  },
  {
    id: 'dec-003',
    sessionId: 'sess-admin-active',
    userId: 'user-admin-01',
    resource: 'LOT37_ANALYSIS',
    action: 'VALIDATE',
    allowed: false,
    reason: 'Refus : Séparation des responsabilités. Le compte administrateur système ne dispose pas de la validation analytique opérationnelle.',
    roleIds: ['role-admin-systeme'],
    permissionIds: [],
    timestamp: '2026-09-20 05:32:00',
    isDemo: true
  }
];

export const INITIAL_SECURITY_AUDITS: OsintSecurityAudit[] = [
  {
    id: 'sec-aud-001',
    timestamp: '2026-09-20 05:00:00',
    action: 'SESSION_OPENED',
    entityType: 'SESSION',
    entityId: 'sess-resp-active',
    actorUserId: 'user-resp-01',
    success: true,
    reason: 'Ouverture normale de session locale pour Capitaine Traoré',
    isDemo: true
  },
  {
    id: 'sec-aud-002',
    timestamp: '2026-09-20 05:25:00',
    action: 'ACCESS_DENIED',
    entityType: 'RESOURCE',
    entityId: 'LOT42_SECURITY',
    actorUserId: 'user-ana-01',
    success: false,
    reason: 'Tentative d’accès non autorisé à l’administration de sécurité bloquée par le service de contrôle.',
    before: { requestedAction: 'ADMIN' },
    after: { decision: 'DENIED' },
    isDemo: true
  },
  {
    id: 'sec-aud-003',
    timestamp: '2026-09-16 18:00:00',
    action: 'USER_DISABLED',
    entityType: 'USER',
    entityId: 'user-des-01',
    actorUserId: 'user-admin-01',
    success: true,
    reason: 'Désactivation formelle du compte de Kouassi Mensah suite à fin de mission',
    before: { status: 'ACTIF' },
    after: { status: 'DESACTIVE' },
    isDemo: true
  }
];
