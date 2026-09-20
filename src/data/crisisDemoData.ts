import {
  OsintCrisisCell,
  OsintCrisisLogEntry,
  OsintCrisisDirective,
  OsintCrisisSitrep,
  OsintCrisisAudit
} from '../types';

export const INITIAL_CRISIS_CELLS: OsintCrisisCell[] = [
  {
    id: 'crisis-cell-01',
    code: 'COGC-2026-001',
    title: 'Cellule Conjointe de Suivi — Sécurisation Couloir Liptako-Gourma',
    theater: 'Zone Tri-frontalière Sahel Central (Mali - Burkina Faso - Niger)',
    countryIds: ['ML', 'BF', 'NE'],
    description: 'Coordination tactique et veille opérationnelle renforcée suite à des mouvements anormaux de convois non identifiés signalés par capteurs locaux.',
    posture: 'CRISE_ACTIVE',
    status: 'EN_COURS',
    severity: 'MAJEURE',
    operationalImpactScore: 74,
    commanderId: 'user-resp-01',
    leadAnalystId: 'user-ana-01',
    liaisonOfficerId: 'user-op-01',
    transmissionCoordinatorId: 'user-cons-01',
    createdAt: '2026-09-18 06:00:00',
    updatedAt: '2026-09-20 05:30:00',
    activatedAt: '2026-09-18 08:15:00',
    synthesisIds: ['synth-2026-001'],
    indicatorIds: ['ind-mon-001'],
    scenarioIds: ['scen-sahel-01'],
    hypothesisIds: ['hyp-lot37-01'],
    eventIds: ['evt-2026-001'],
    caseIds: ['case-001'],
    requirementIds: ['REQ-2026-001'],
    isDemo: true
  },
  {
    id: 'crisis-cell-02',
    code: 'COGC-2026-002',
    title: 'Cellule d’Alerte Précoce — Cyber-Menaces sur Hubs Portuaires Golfe de Guinée',
    theater: 'Façade Maritime & Hubs Logistiques Côtiers (Abidjan - Lomé - Cotonou)',
    countryIds: ['CI', 'TG', 'BJ'],
    description: 'Surveillance des signaux de perturbations numériques ciblant les systèmes de dédouanement et le fret maritime.',
    posture: 'PRE_ALERTE',
    status: 'EN_COURS',
    severity: 'SIGNIFICATIVE',
    operationalImpactScore: 48,
    commanderId: 'user-resp-01',
    leadAnalystId: 'user-ana-01',
    createdAt: '2026-09-19 14:00:00',
    updatedAt: '2026-09-20 04:00:00',
    activatedAt: '2026-09-19 16:30:00',
    synthesisIds: [],
    indicatorIds: ['ind-mon-002'],
    scenarioIds: [],
    hypothesisIds: [],
    eventIds: [],
    caseIds: [],
    requirementIds: ['REQ-2026-002'],
    isDemo: true
  },
  {
    id: 'crisis-cell-03',
    code: 'COGC-2026-003',
    title: 'Cellule Clôturée — Surveillance Perturbation Fluviale Bassin Moyen Niger',
    theater: 'Bassin Fluvial & Corridors Vivriers',
    countryIds: ['NE', 'NG'],
    description: 'Surveillance d’étiage sévère et de blocages temporaires de passages de barges commerciales.',
    posture: 'RETOUR_A_LA_NORMALE',
    status: 'CLOTUREE',
    severity: 'MINEURE',
    operationalImpactScore: 22,
    commanderId: 'user-resp-01',
    leadAnalystId: 'user-ana-01',
    createdAt: '2026-09-10 09:00:00',
    updatedAt: '2026-09-17 18:00:00',
    activatedAt: '2026-09-10 10:00:00',
    closedAt: '2026-09-17 18:00:00',
    closureJustification: 'Reprise normale du trafic fluvial et stabilisation certifiée par les points focaux hydrauliques régionaux.',
    closureSummary: 'Incident résolu sans impact sécuritaire dérivé. Recommandations transmises au RETEX LOT 33.',
    synthesisIds: [],
    indicatorIds: [],
    scenarioIds: [],
    hypothesisIds: [],
    eventIds: [],
    caseIds: [],
    requirementIds: [],
    isDemo: true
  }
];

export const INITIAL_CRISIS_LOGS: OsintCrisisLogEntry[] = [
  {
    id: 'log-001',
    crisisId: 'crisis-cell-01',
    timestamp: '2026-09-18 08:30:00',
    incidentType: 'POINT_DE_SITUATION',
    urgency: 'URGENT',
    title: 'Ouverture formelle de la cellule et cadrage du périmètre opérationnel',
    content: 'Activation de la posture CRISE_ACTIVE ordonnée par le commandement. Périmètre Liptako-Gourma défini.',
    location: 'PC Opérationnel Conjoint',
    authorId: 'user-resp-01',
    authorName: 'Capt. Moussa Traoré',
    evidenceIds: ['evd-001'],
    sourceIds: ['src-001'],
    isPostPublication: false,
    isDemo: true
  },
  {
    id: 'log-002',
    crisisId: 'crisis-cell-01',
    timestamp: '2026-09-18 12:45:00',
    incidentType: 'OBSERVATION_TERRAIN',
    urgency: 'IMMEDIAT',
    title: 'Signalement de convoi logistique non identifié à proximité de Dori',
    content: 'Trois véhicules tout-terrain aperçus hors des axes bitumés. Signalement corroboré par source locale de confiance moyenne.',
    location: 'Axe Dori - Frontière NE',
    authorId: 'user-op-01',
    authorName: 'Moussa Keïta',
    evidenceIds: ['evd-sahel-01'],
    sourceIds: ['src-local-01'],
    isPostPublication: false,
    isDemo: true
  },
  {
    id: 'log-003',
    crisisId: 'crisis-cell-01',
    timestamp: '2026-09-19 09:15:00',
    incidentType: 'ORDRE_OPERATIONNEL',
    urgency: 'URGENT',
    title: 'Directive de bascule vers surveillance satellite et SIG ouverte',
    content: 'Ordre de priorisation de l’imagerie optique basse résolution sur la passe stratégique de Gao-Ansongo.',
    location: 'Centre de Fusion SIG',
    authorId: 'user-resp-01',
    authorName: 'Capt. Moussa Traoré',
    evidenceIds: [],
    sourceIds: [],
    isPostPublication: false,
    isDemo: true
  },
  {
    id: 'log-004',
    crisisId: 'crisis-cell-02',
    timestamp: '2026-09-19 16:45:00',
    incidentType: 'ALERTE_TACTIQUE',
    urgency: 'URGENT',
    title: 'Rapport CERT régional sur tentatives de scans automatisés',
    content: 'Multiplication des requêtes de cartographie réseau ciblant les terminaux conteneurs autonomes.',
    location: 'Zone Industrielle Portuaire',
    authorId: 'user-ana-01',
    authorName: 'Dr. Aïssatou Diallo',
    evidenceIds: ['evd-cyber-01'],
    sourceIds: ['src-cert-01'],
    isPostPublication: false,
    isDemo: true
  }
];

export const INITIAL_CRISIS_DIRECTIVES: OsintCrisisDirective[] = [
  {
    id: 'dir-001',
    crisisId: 'crisis-cell-01',
    title: 'Renforcement du monitoring des canaux radio communautaires et capteurs civils',
    description: 'Affecter 2 opérateurs de veille dédiés aux fréquences publiques et réseaux citoyens du secteur Dori-Gorom.',
    targetEntity: 'Pôle Veille & Détection Terrain',
    priority: 'URGENTE',
    status: 'EN_COURS',
    deadline: '2026-09-20 18:00:00',
    proposedBy: 'user-ana-01',
    proposedAt: '2026-09-18 09:00:00',
    isHumanDecision: true,
    decidedBy: 'user-resp-01',
    decidedAt: '2026-09-18 09:20:00',
    decisionJustification: 'Nécessité de confirmer l’itinéraire du convoi signalé avant toute décision de bouclage de zone.',
    isDemo: true
  },
  {
    id: 'dir-002',
    crisisId: 'crisis-cell-01',
    title: 'Diffusion d’un Sitrep Flash aux postes de coordination frontaliers',
    description: 'Transmission du point de situation tactique n°1 sous classification DIFFUSION_RESTREINTE.',
    targetEntity: 'Officier de Liaison Inter-Forces',
    priority: 'HAUTE',
    status: 'EXECUTEE',
    deadline: '2026-09-18 14:00:00',
    proposedBy: 'user-resp-01',
    proposedAt: '2026-09-18 11:00:00',
    isHumanDecision: true,
    decidedBy: 'user-resp-01',
    decidedAt: '2026-09-18 11:15:00',
    decisionJustification: 'Alerte immédiate des partenaires étatiques concernés.',
    executedBy: 'user-op-01',
    executedAt: '2026-09-18 13:30:00',
    executionReport: 'Accusé de réception formel reçu des 3 points focaux désignés.',
    isDemo: true
  },
  {
    id: 'dir-003',
    crisisId: 'crisis-cell-02',
    title: 'Isolement des passerelles d’administration réseau exposées',
    description: 'Mettre hors ligne préventivement les interfaces télécoms secondaires non indispensables à l’exploitation portuaire.',
    targetEntity: 'Pôle Cyberdéfense',
    priority: 'URGENTE',
    status: 'DECIDEE',
    deadline: '2026-09-20 12:00:00',
    proposedBy: 'user-ana-01',
    proposedAt: '2026-09-19 17:00:00',
    isHumanDecision: true,
    decidedBy: 'user-resp-01',
    decidedAt: '2026-09-19 17:30:00',
    decisionJustification: 'Atténuation immédiate de la surface d’attaque en posture de pré-alerte.',
    isDemo: true
  }
];

export const INITIAL_CRISIS_SITREPS: OsintCrisisSitrep[] = [
  {
    id: 'sitrep-001',
    crisisId: 'crisis-cell-01',
    number: 1,
    title: 'SITREP FLASH #01 — Mouvements Tactiques Zone Liptako',
    classificationLevel: 'CONFIDENTIEL',
    summary: 'Constat de mouvements inhabituels dans la zone tri-frontalière. Posture active maintenue, chaîne de commandement opérationnelle.',
    situationPoints: [
      'Convoi non identifié signalé à 15km au nord-est de Dori.',
      'Corrélation préliminaire avec le scénario prospectif SCEN-SAHEL-01.',
      'Dispositifs d’écoute et de veille locale portés au niveau d’alerte maximum.'
    ],
    threatDevelopments: [
      'Risque potentiel de perturbation des liaisons marchandes transfrontalières.',
      'Pas d’engagement cinétique rapporté à cette heure.'
    ],
    decisionsAndDirectives: [
      'Application de la directive DIR-001 (surveillance radio renforcée).',
      'Validation de la transmission sécurisée aux unités territoriales.'
    ],
    recommendations: [
      'Maintenir la posture CRISE_ACTIVE pour 48h renouvelables.',
      'Procéder à une réévaluation du score d’impact lors du point de situation H+12.'
    ],
    authorId: 'user-ana-01',
    validatedBy: 'user-resp-01',
    validatedAt: '2026-09-18 13:00:00',
    isHumanDecision: true,
    publishedAt: '2026-09-18 13:15:00',
    recipients: ['Centre de Fusion Régional', 'État-Major Tactique Interarmées', 'Direction Renseignement'],
    isDemo: true
  }
];

export const INITIAL_CRISIS_AUDITS: OsintCrisisAudit[] = [
  {
    id: 'c-audit-001',
    timestamp: '2026-09-18 06:00:00',
    action: 'CRISIS_CELL_CREATED',
    entityType: 'CRISIS_CELL',
    entityId: 'crisis-cell-01',
    actorUserId: 'user-resp-01',
    success: true,
    reason: 'Initialisation de la cellule de crise Liptako-Gourma',
    isDemo: true
  },
  {
    id: 'c-audit-002',
    timestamp: '2026-09-18 08:15:00',
    action: 'POSTURE_ESCALATED',
    entityType: 'CRISIS_CELL',
    entityId: 'crisis-cell-01',
    actorUserId: 'user-resp-01',
    success: true,
    reason: 'Escalade en posture CRISE_ACTIVE suite aux signaux convergents de terrain',
    isDemo: true
  },
  {
    id: 'c-audit-003',
    timestamp: '2026-09-18 09:20:00',
    action: 'DIRECTIVE_DECIDED',
    entityType: 'CRISIS_DIRECTIVE',
    entityId: 'dir-001',
    actorUserId: 'user-resp-01',
    success: true,
    reason: 'Décision humaine formelle : directive de surveillance radio approuvée',
    isDemo: true
  },
  {
    id: 'c-audit-004',
    timestamp: '2026-09-18 13:00:00',
    action: 'SITREP_VALIDATED',
    entityType: 'CRISIS_SITREP',
    entityId: 'sitrep-001',
    actorUserId: 'user-resp-01',
    success: true,
    reason: 'Validation humaine formelle du Sitrep Flash n°1 par le commandant',
    isDemo: true
  },
  {
    id: 'c-audit-005',
    timestamp: '2026-09-19 16:30:00',
    action: 'POSTURE_ESCALATED',
    entityType: 'CRISIS_CELL',
    entityId: 'crisis-cell-02',
    actorUserId: 'user-resp-01',
    success: true,
    reason: 'Activation de la posture PRE_ALERTE sur alerte cyber portuaire',
    isDemo: true
  }
];
