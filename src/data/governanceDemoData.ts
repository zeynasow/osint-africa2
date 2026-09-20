/**
 * OSINT AFRICA - Données de Démonstration pour la Gouvernance des Sources (LOT 22)
 * 
 * Strictement HORS LIGNE — Aucune requête externe
 * Contient au minimum les 12 scénarios opérationnels types exigés
 * Toutes les données fictives / simulées portent isDemo: true
 */

import {
  OsintSourceGovernance,
  OsintSourceReview,
  OsintGovernanceAudit,
  PreActivationCheckItem,
  SourcePriority,
  SourceCriticality,
  GovernanceWorkflowStatus
} from '../types';
import { REAL_SOURCES, DEMO_SOURCES } from './sourcesData';

// ============================================================================
// 1. CHECKLIST DE PRÉACTIVATION STANDARD (14 POINTS DE CONTRÔLE DOCTRINAUX)
// ============================================================================

export const INITIAL_PRE_ACTIVATION_CHECKLIST: PreActivationCheckItem[] = [
  {
    id: 'chk-01',
    label: 'Source formellement identifiée et immatriculée',
    category: 'IDENTIFICATION',
    isChecked: true,
    isCritical: true,
    notes: 'Identifiant unique, pays, langue et entité éditrice vérifiés au registre'
  },
  {
    id: 'chk-02',
    label: 'URL canonique et domaine vérifiés',
    category: 'IDENTIFICATION',
    isChecked: true,
    isCritical: true,
    notes: 'Vérification syntaxique et cohérence DNS sans contact direct'
  },
  {
    id: 'chk-03',
    label: 'Source réelle confirmée (distinction nette avec démo)',
    category: 'IDENTIFICATION',
    isChecked: true,
    isCritical: true,
    notes: 'Attribution du drapeau isReal: true et provenance éditoriale établie'
  },
  {
    id: 'chk-04',
    label: 'Conditions Générales d’Utilisation (CGU) examinées',
    category: 'LEGAL',
    isChecked: true,
    isCritical: true,
    notes: 'Absence de clause d’exclusion formelle de veille documentaire'
  },
  {
    id: 'chk-05',
    label: 'Licence et droits d’auteur qualifiés',
    category: 'LEGAL',
    isChecked: true,
    isCritical: true,
    notes: 'Statut droit d’auteur vérifié (Open Data, Éditorial, Dépêches)'
  },
  {
    id: 'chk-06',
    label: 'Directives robots.txt analysées et respectées',
    category: 'LEGAL',
    isChecked: true,
    isCritical: true,
    notes: 'Conformité stricte : pas d’ingestion si Disallow / ou Crawl-delay ignoré'
  },
  {
    id: 'chk-07',
    label: 'Politique de collecte future définie et bornée',
    category: 'TECHNICAL',
    isChecked: true,
    isCritical: true,
    notes: 'Plafond d’items, plage horaire et portée géographique enregistrés'
  },
  {
    id: 'chk-08',
    label: 'Fréquence et limitation de débit (Rate Limit) calibrées',
    category: 'TECHNICAL',
    isChecked: true,
    isCritical: true,
    notes: 'Espacement des requêtes pour préserver l’infrastructure émettrice'
  },
  {
    id: 'chk-09',
    label: 'Mode d’authentification préparé (si applicable)',
    category: 'TECHNICAL',
    isChecked: true,
    isCritical: false,
    notes: 'Vérification de l’absence de clé en clair dans le code source'
  },
  {
    id: 'chk-10',
    label: 'Analyste responsable et Réviseur désignés',
    category: 'RESPONSIBILITY',
    isChecked: true,
    isCritical: true,
    notes: 'Attribution formelle à un binôme analyste/auditeur identifié'
  },
  {
    id: 'chk-11',
    label: 'Validation humaine formelle obtenue et signée',
    category: 'RESPONSIBILITY',
    isChecked: true,
    isCritical: true,
    notes: 'Avis du validateur consigné avec justification et réserves éventuelles'
  },
  {
    id: 'chk-12',
    label: 'Chaîne de traçabilité intégrale préparée (12 échelons)',
    category: 'RESPONSIBILITY',
    isChecked: true,
    isCritical: true,
    notes: 'Garantie de filiation complète depuis le flux brut jusqu’au rapport final'
  },
  {
    id: 'chk-13',
    label: 'Politique de conservation et archivage validée',
    category: 'LEGAL',
    isChecked: true,
    isCritical: true,
    notes: 'Durée de rétention et procédure de purge conforme aux règles éthiques'
  },
  {
    id: 'chk-14',
    label: 'Test de sécurité et isolation hors ligne vérifiés',
    category: 'SECURITY',
    isChecked: true,
    isCritical: true,
    notes: 'Validation de l’absence de fuite de données et du confinement local'
  }
];

// ============================================================================
// 2. SCÉNARIOS TYPES OBLIGATOIRES DE GOUVERNANCE (12 SCÉNARIOS)
// ============================================================================

export const SPECIFIC_GOVERNANCE_SCENARIOS: OsintSourceGovernance[] = [
  // Scénario 1 : Source réelle non connectée et non évaluée (Agence Bénin Presse)
  {
    id: 'gov-real-001',
    sourceId: 'src-real-001',
    priority: 'P5', // À ÉVALUER
    criticality: 'UNKNOWN',
    governanceStatus: 'DRAFT',
    approvalStatus: 'PENDING',
    validationStatus: 'NONE',
    legalStatus: 'Statut juridique en attente de qualification déontologique',
    licensingStatus: 'EDITORIAL_RESTRICTED',
    robotsStatus: 'UNSPECIFIED',
    termsStatus: 'UNKNOWN',
    authenticationStatus: 'NONE',
    collectionPolicy: {
      collectionEnabled: false,
      frequency: 'MANUAL',
      rateLimit: 'Non défini',
      allowedHours: '08:00-18:00 UTC',
      maxItems: 20,
      retentionDays: 180,
      duplicatePolicy: 'HASH_ONLY',
      languagePolicy: 'FR_ONLY',
      geographicScope: 'Bénin',
      legalRestrictions: 'Reproduction soumise à droit de citation',
      humanReviewRequired: true,
      isDemo: true
    },
    retentionPolicy: {
      retentionDays: 180,
      justification: 'Historique de dépêches publiques pour veille nationale',
      informationType: 'Dépêches officielles',
      status: 'ACTIF',
      futureDeletionPolicy: 'Archivage compressé sans indexation externe',
      archivalPolicy: 'Conservation locale chiffrée'
    },
    responsibleAnalyst: 'Analyste Ouest-Africain',
    reviewer: 'En attente de désignation',
    approvalDate: null,
    reviewDate: null,
    suspensionReason: undefined,
    notes: 'Source répertoriée. Nécessite une première évaluation de priorité et vérification robots.txt.',
    validationHistory: [],
    createdAt: '2026-09-10 09:00:00',
    updatedAt: '2026-09-12 14:00:00',
    isDemo: true
  },

  // Scénario 2 : Source réelle à vérifier (Radiodiffusion Télévision du Burkina - RTB)
  {
    id: 'gov-real-005',
    sourceId: 'src-real-005',
    priority: 'P2', // HAUTE
    criticality: 'HIGH',
    governanceStatus: 'TO_VERIFY',
    approvalStatus: 'PENDING',
    validationStatus: 'IN_PROGRESS',
    legalStatus: 'Média public d’État du Burkina Faso',
    licensingStatus: 'GOVERNMENT_NOTICE',
    robotsStatus: 'CRAWL_DELAY',
    termsStatus: 'CHECKED_OK',
    authenticationStatus: 'NONE',
    collectionPolicy: {
      collectionEnabled: false,
      frequency: '1h',
      rateLimit: '30 req/h',
      allowedHours: '24/7',
      maxItems: 40,
      retentionDays: 365,
      duplicatePolicy: 'STRICT_HASH_AND_URL',
      languagePolicy: 'FR_ONLY',
      geographicScope: 'Burkina Faso / Sahel',
      legalRestrictions: 'Citations courtes avec mention obligatoire de la source',
      humanReviewRequired: true,
      isDemo: true
    },
    retentionPolicy: {
      retentionDays: 365,
      justification: 'Suivi de la situation sécuritaire et institutionnelle sahélienne',
      informationType: 'Communiqués officiels et journaux transcrits',
      status: 'ACTIF',
      futureDeletionPolicy: 'Purge des médias volumineux après 1 an',
      archivalPolicy: 'Conservation des métadonnées et résumés'
    },
    responsibleAnalyst: 'Analyste Sahel Céleste',
    reviewer: 'Auditrice Juridique M. Koné',
    approvalDate: null,
    reviewDate: '2026-09-18',
    suspensionReason: undefined,
    notes: 'Dossier transmis au réviseur pour confirmation des métadonnées techniques.',
    validationHistory: [],
    createdAt: '2026-09-11 11:30:00',
    updatedAt: '2026-09-13 16:20:00',
    isDemo: true
  },

  // Scénario 3 : Source réelle vérifiée (Cameroon Tribune)
  {
    id: 'gov-real-012',
    sourceId: 'src-real-012',
    priority: 'P2',
    criticality: 'MEDIUM',
    governanceStatus: 'VERIFIED',
    approvalStatus: 'PENDING',
    validationStatus: 'VALIDATED',
    legalStatus: 'Quotidien bilingue d’information gouvernementale du Cameroun',
    licensingStatus: 'EDITORIAL_RESTRICTED',
    robotsStatus: 'ALLOWED',
    termsStatus: 'CHECKED_OK',
    authenticationStatus: 'NONE',
    collectionPolicy: {
      collectionEnabled: false,
      frequency: '2h',
      rateLimit: '20 req/h',
      allowedHours: '06:00-22:00 UTC',
      maxItems: 30,
      retentionDays: 365,
      duplicatePolicy: 'STRICT_HASH_AND_URL',
      languagePolicy: 'FR_EN',
      geographicScope: 'Cameroun / Bassin du Lac Tchad',
      legalRestrictions: 'Dépêches sous copyright SOPECAM',
      humanReviewRequired: true,
      isDemo: true
    },
    retentionPolicy: {
      retentionDays: 365,
      justification: 'Veille sur le Bassin du Lac Tchad et zone CEMAC',
      informationType: 'Articles de presse',
      status: 'ACTIF',
      futureDeletionPolicy: 'Archivage annuel',
      archivalPolicy: 'Index local protégé'
    },
    responsibleAnalyst: 'Analyste Afrique Centrale',
    reviewer: 'Réviseur Senior Dr. Diallo',
    approvalDate: null,
    reviewDate: '2026-09-20',
    suspensionReason: undefined,
    notes: 'Paramètres techniques et juridiques vérifiés. En attente de la signature d’approbation finale.',
    validationHistory: [
      {
        id: 'val-012-01',
        validator: 'Dr. Diallo (Réviseur Senior)',
        date: '2026-09-13 15:00:00',
        decision: 'APPROVED_WITH_RESERVATIONS',
        justification: 'Source institutionnelle majeure mais prudence requise sur le volume de reprise intégrale.',
        reservations: 'Interdiction de stocker les images haute résolution. Textes seuls autorisés.',
        nextReviewDate: '2026-12-13',
        isDemo: true
      }
    ],
    createdAt: '2026-09-08 14:00:00',
    updatedAt: '2026-09-13 17:00:00',
    isDemo: true
  },

  // Scénario 4 : Source approuvée avec réserves (RTI Côte d'Ivoire)
  {
    id: 'gov-real-022',
    sourceId: 'src-real-022',
    priority: 'P2',
    criticality: 'HIGH',
    governanceStatus: 'APPROVED',
    approvalStatus: 'RESERVATIONS',
    validationStatus: 'VALIDATED',
    legalStatus: 'Radiodiffusion Télévision Ivoirienne - Média public',
    licensingStatus: 'EDITORIAL_RESTRICTED',
    robotsStatus: 'DISALLOWED',
    termsStatus: 'RESTRICTIVE',
    authenticationStatus: 'NONE',
    collectionPolicy: {
      collectionEnabled: false,
      frequency: '6h',
      rateLimit: '10 req/h',
      allowedHours: '07:00-21:00 UTC',
      maxItems: 15,
      retentionDays: 90,
      duplicatePolicy: 'STRICT_HASH_AND_URL',
      languagePolicy: 'FR_ONLY',
      geographicScope: 'Côte d’Ivoire / Afrique de l’Ouest',
      legalRestrictions: 'Collecte automatisée bloquée par robots.txt. Veille manuelle uniquement.',
      humanReviewRequired: true,
      isDemo: true
    },
    retentionPolicy: {
      retentionDays: 90,
      justification: 'Signalements d’actualité institutionnelle',
      informationType: 'Titres et métadonnées courtes',
      status: 'RESTREINT',
      futureDeletionPolicy: 'Purge automatique après 90 jours',
      archivalPolicy: 'Non archivé au-delà de 3 mois'
    },
    responsibleAnalyst: 'Analyste Golfe de Guinée',
    reviewer: 'Directeur d’Analyse Capitaine Traoré',
    approvalDate: '2026-09-12 11:00:00',
    reviewDate: '2026-10-12',
    suspensionReason: 'Robots.txt restrictif interdisant l’indexation automatique',
    notes: 'Approuvée exclusivement pour une revue analytique manuelle. Connecteur automatisé interdit.',
    validationHistory: [
      {
        id: 'val-022-01',
        validator: 'Capitaine Traoré (Directeur)',
        date: '2026-09-12 11:00:00',
        decision: 'APPROVED_WITH_RESERVATIONS',
        justification: 'Importance de la source reconnue, mais interdiction formelle d’activer un robot collecteur.',
        reservations: 'Seule la consultation par analyste humain et saisie de fiches manuelles est autorisée.',
        nextReviewDate: '2026-10-12',
        isDemo: true
      }
    ],
    createdAt: '2026-09-09 10:00:00',
    updatedAt: '2026-09-12 11:00:00',
    isDemo: true
  },

  // Scénario 5 : Source prête à connecter dès ouverture future (APS Sénégal)
  {
    id: 'gov-real-040',
    sourceId: 'src-real-040',
    priority: 'P1', // CRITIQUE
    criticality: 'CRITICAL',
    governanceStatus: 'READY_TO_CONNECT',
    approvalStatus: 'APPROVED',
    validationStatus: 'VALIDATED',
    legalStatus: 'Agence de Presse Sénégalaise - Établissement public',
    licensingStatus: 'GOVERNMENT_OPEN_DATA',
    robotsStatus: 'ALLOWED',
    termsStatus: 'CHECKED_OK',
    authenticationStatus: 'NONE',
    collectionPolicy: {
      collectionEnabled: false, // Hors ligne respecté
      frequency: '30m',
      rateLimit: '120 req/h',
      allowedHours: '24/7',
      maxItems: 50,
      retentionDays: 730,
      duplicatePolicy: 'STRICT_HASH_AND_URL',
      languagePolicy: 'FR_ONLY',
      geographicScope: 'Sénégal / Ouest-Afrique',
      legalRestrictions: 'Flux RSS public libre d’accès pour veille',
      humanReviewRequired: false,
      isDemo: true
    },
    retentionPolicy: {
      retentionDays: 730,
      justification: 'Historique de dépêches de référence pour analyse longitudinale',
      informationType: 'Dépêches publiques syndiquées',
      status: 'ACTIF',
      futureDeletionPolicy: 'Archivage permanent des résumés',
      archivalPolicy: 'Stockage froid sécurisé'
    },
    responsibleAnalyst: 'Analyste Sénégambie K. Ndiaye',
    reviewer: 'Conseiller Juridique Maître Wade',
    approvalDate: '2026-09-14 08:30:00',
    reviewDate: '2027-03-14',
    suspensionReason: undefined,
    notes: 'Toutes les validations (juridiques, techniques, éthiques) sont obtenues. Prête dès la levée du mode hors ligne.',
    validationHistory: [
      {
        id: 'val-040-01',
        validator: 'Maître Wade (Conseil Juridique)',
        date: '2026-09-14 08:30:00',
        decision: 'APPROVED',
        justification: 'Conformité complète aux directives Open Data et robots.txt.',
        reservations: 'Aucune réserve. Limiter la fréquence à 30 minutes.',
        nextReviewDate: '2027-03-14',
        isDemo: true
      }
    ],
    createdAt: '2026-09-07 09:30:00',
    updatedAt: '2026-09-14 08:30:00',
    isDemo: true
  },

  // Scénario 6 : Source suspendue pour raison de conformité (Gabon Review)
  {
    id: 'gov-real-032',
    sourceId: 'src-real-032',
    priority: 'P3',
    criticality: 'MEDIUM',
    governanceStatus: 'SUSPENDED',
    approvalStatus: 'REVOKED',
    validationStatus: 'REJECTED',
    legalStatus: 'Presse en ligne gabonaise indépendante',
    licensingStatus: 'EDITORIAL_RESTRICTED',
    robotsStatus: 'DISALLOWED',
    termsStatus: 'FORBIDDEN',
    authenticationStatus: 'NONE',
    collectionPolicy: {
      collectionEnabled: false,
      frequency: 'MANUAL',
      rateLimit: 'Bloqué',
      allowedHours: 'Interdit',
      maxItems: 0,
      retentionDays: 30,
      duplicatePolicy: 'NONE',
      languagePolicy: 'FR_ONLY',
      geographicScope: 'Gabon',
      legalRestrictions: 'Conditions d’utilisation interdisant expressément les outils automatisés',
      humanReviewRequired: true,
      isDemo: true
    },
    retentionPolicy: {
      retentionDays: 30,
      justification: 'Conservation conservatoire temporaire',
      informationType: 'Néant',
      status: 'SUSPENDU',
      futureDeletionPolicy: 'Purge immédiate des flux non qualifiés',
      archivalPolicy: 'Journalisation du blocage uniquement'
    },
    responsibleAnalyst: 'Analyste Afrique Centrale',
    reviewer: 'Auditeur Déontologique M. Mba',
    approvalDate: null,
    reviewDate: '2026-09-05',
    suspensionReason: 'Clauses contractuelles du site web interdisant explicitement toute extraction automatisée (scraping/crawling).',
    notes: 'Suspension formelle prononcée le 5 septembre 2026. Aucune collecte future autorisée sans accord écrit.',
    validationHistory: [
      {
        id: 'val-032-01',
        validator: 'M. Mba (Auditeur Déontologique)',
        date: '2026-09-05 14:00:00',
        decision: 'REJECTED',
        justification: 'Violation potentielle des CGU du site web tiers.',
        reservations: 'Connecteur interdit jusqu’à protocole d’accord officiel.',
        nextReviewDate: '2027-01-05',
        isDemo: true
      }
    ],
    createdAt: '2026-09-01 10:00:00',
    updatedAt: '2026-09-05 14:30:00',
    isDemo: true
  },

  // Scénario 7 : Source désactivée (Portail d’archives ministériel obsolète)
  {
    id: 'gov-real-055',
    sourceId: 'src-real-055',
    priority: 'P4',
    criticality: 'LOW',
    governanceStatus: 'DISABLED',
    approvalStatus: 'REJECTED',
    validationStatus: 'REJECTED',
    legalStatus: 'Site web public devenu inactif suite à refonte ministérielle',
    licensingStatus: 'UNKNOWN',
    robotsStatus: 'UNKNOWN',
    termsStatus: 'UNKNOWN',
    authenticationStatus: 'NONE',
    collectionPolicy: {
      collectionEnabled: false,
      frequency: 'MANUAL',
      rateLimit: 'N/A',
      allowedHours: 'N/A',
      maxItems: 0,
      retentionDays: 0,
      duplicatePolicy: 'NONE',
      languagePolicy: 'FR_ONLY',
      geographicScope: 'Mali',
      legalRestrictions: 'URL inaccessible ou obsolète',
      humanReviewRequired: true,
      isDemo: true
    },
    retentionPolicy: {
      retentionDays: 0,
      justification: 'Source caduque',
      informationType: 'Néant',
      status: 'INACTIF',
      futureDeletionPolicy: 'Suppression programmée de la cible',
      archivalPolicy: 'Trace archivée au registre'
    },
    responsibleAnalyst: 'Analyste Sahel Céleste',
    reviewer: 'Réviseur Senior Dr. Diallo',
    approvalDate: null,
    reviewDate: '2026-08-20',
    suspensionReason: 'Endpoint 404 permanent constaté lors de la revue documentaire',
    notes: 'Désactivation technique et administrative.',
    validationHistory: [],
    createdAt: '2026-08-15 10:00:00',
    updatedAt: '2026-08-20 16:00:00',
    isDemo: true
  },

  // Scénario 8 : Connecteur simulé actif en bac à sable (src-001 - RFI Afrique)
  {
    id: 'gov-demo-001',
    sourceId: 'src-001',
    priority: 'P1',
    criticality: 'HIGH',
    governanceStatus: 'ACTIVE', // ACTIVE - SIMULATION LOCALE
    approvalStatus: 'APPROVED',
    validationStatus: 'VALIDATED',
    legalStatus: 'Média public international - Flux RSS officiel d’actualité',
    licensingStatus: 'EDITORIAL_RESTRICTED',
    robotsStatus: 'ALLOWED',
    termsStatus: 'CHECKED_OK',
    authenticationStatus: 'NONE',
    collectionPolicy: {
      collectionEnabled: true, // Simulation bac à sable local uniquement
      frequency: '15m',
      rateLimit: '120 req/h',
      allowedHours: '24/7',
      maxItems: 50,
      retentionDays: 365,
      duplicatePolicy: 'STRICT_HASH_AND_URL',
      languagePolicy: 'FR_ONLY',
      geographicScope: 'Afrique Continentale',
      legalRestrictions: 'Flux syndiqué ouvert aux agrégateurs d’actualité',
      humanReviewRequired: false,
      isDemo: true
    },
    retentionPolicy: {
      retentionDays: 365,
      justification: 'Corpus d’actualité panafricain pour le simulateur OSINT',
      informationType: 'Dépêches et alertes simulées',
      status: 'SIMULÉ',
      futureDeletionPolicy: 'Rotation locale en cache',
      archivalPolicy: 'Persistance navigateur locale'
    },
    responsibleAnalyst: 'Équipe Démo OSINT Africa',
    reviewer: 'Lead Développeur Architecture',
    approvalDate: '2026-09-12 10:00:00',
    reviewDate: '2026-12-12',
    suspensionReason: undefined,
    notes: 'Connecteur actif en bac à sable local. Aucune connexion distante.',
    validationHistory: [
      {
        id: 'val-demo-001',
        validator: 'Lead Développeur Architecture',
        date: '2026-09-12 10:00:00',
        decision: 'APPROVED',
        justification: 'Source de référence pour la démonstration pédagogique des flux.',
        reservations: 'Strict confinement dans le bac à sable local.',
        nextReviewDate: '2026-12-12',
        isDemo: true
      }
    ],
    createdAt: '2026-09-12 10:00:00',
    updatedAt: '2026-09-12 10:00:00',
    isDemo: true
  },

  // Scénario 9 : Source avec revue en retard (Agence Mauritanienne d'Information)
  {
    id: 'gov-real-028',
    sourceId: 'src-real-028',
    priority: 'P3',
    criticality: 'MEDIUM',
    governanceStatus: 'TO_VERIFY',
    approvalStatus: 'PENDING',
    validationStatus: 'NONE',
    legalStatus: 'Média d’État mauritanien',
    licensingStatus: 'GOVERNMENT_NOTICE',
    robotsStatus: 'UNSPECIFIED',
    termsStatus: 'UNKNOWN',
    authenticationStatus: 'NONE',
    collectionPolicy: {
      collectionEnabled: false,
      frequency: '6h',
      rateLimit: '20 req/h',
      allowedHours: '08:00-20:00 UTC',
      maxItems: 25,
      retentionDays: 180,
      duplicatePolicy: 'STRICT_HASH_AND_URL',
      languagePolicy: 'FR_AR',
      geographicScope: 'Mauritanie / Sahel',
      legalRestrictions: 'Vérification requise des conditions de citation',
      humanReviewRequired: true,
      isDemo: true
    },
    retentionPolicy: {
      retentionDays: 180,
      justification: 'Veille sous-régionale sahélienne',
      informationType: 'Communiqués officiels',
      status: 'EN_ATTENTE',
      futureDeletionPolicy: 'Purge après 180 jours',
      archivalPolicy: 'Non défini'
    },
    responsibleAnalyst: 'Analyste Sahel Céleste',
    reviewer: 'Réviseur Senior Dr. Diallo',
    approvalDate: null,
    reviewDate: '2026-07-15', // REVUE EN RETARD (> 60 jours)
    suspensionReason: undefined,
    notes: 'Revue périodique échue depuis juillet 2026. Action requise pour mise à jour déontologique.',
    validationHistory: [],
    createdAt: '2026-06-15 09:00:00',
    updatedAt: '2026-07-15 10:00:00',
    isDemo: true
  },

  // Scénario 10 : Source avec revue programmée à venir sous 15 jours (Radio Télévision Nationale Congolaise - RTNC)
  {
    id: 'gov-real-016',
    sourceId: 'src-real-016',
    priority: 'P2',
    criticality: 'HIGH',
    governanceStatus: 'TO_APPROVE',
    approvalStatus: 'PENDING',
    validationStatus: 'IN_PROGRESS',
    legalStatus: 'Radiodiffuseur public de la République Démocratique du Congo',
    licensingStatus: 'GOVERNMENT_NOTICE',
    robotsStatus: 'ALLOWED',
    termsStatus: 'CHECKED_OK',
    authenticationStatus: 'NONE',
    collectionPolicy: {
      collectionEnabled: false,
      frequency: '2h',
      rateLimit: '30 req/h',
      allowedHours: '24/7',
      maxItems: 35,
      retentionDays: 365,
      duplicatePolicy: 'STRICT_HASH_AND_URL',
      languagePolicy: 'FR_ONLY',
      geographicScope: 'RDC / Grands Lacs',
      legalRestrictions: 'Presse audiovisuelle publique',
      humanReviewRequired: true,
      isDemo: true
    },
    retentionPolicy: {
      retentionDays: 365,
      justification: 'Suivi de la dynamique sécuritaire dans les Grands Lacs',
      informationType: 'Dépêches et transcriptions',
      status: 'ACTIF',
      futureDeletionPolicy: 'Archivage annuel',
      archivalPolicy: 'Dépôt sécurisé'
    },
    responsibleAnalyst: 'Analyste Grands Lacs',
    reviewer: 'Réviseur Senior Dr. Diallo',
    approvalDate: null,
    reviewDate: '2026-09-25', // Revue à venir
    suspensionReason: undefined,
    notes: 'Revue planifiée pour validation de l’évaluation de criticité.',
    validationHistory: [],
    createdAt: '2026-09-05 11:00:00',
    updatedAt: '2026-09-12 14:00:00',
    isDemo: true
  },

  // Scénario 11 : Source avec métadonnées incomplètes (Journal Al-Akhbar Nouakchott)
  {
    id: 'gov-real-029',
    sourceId: 'src-real-029',
    priority: 'P5', // À ÉVALUER
    criticality: 'UNKNOWN',
    governanceStatus: 'DRAFT',
    approvalStatus: 'PENDING',
    validationStatus: 'NONE',
    legalStatus: 'Presse en ligne mauritanienne indépendante',
    licensingStatus: 'UNKNOWN', // Métadonnée manquante
    robotsStatus: 'UNKNOWN',    // Métadonnée manquante
    termsStatus: 'UNKNOWN',     // Métadonnée manquante
    authenticationStatus: 'MISSING',
    collectionPolicy: {
      collectionEnabled: false,
      frequency: 'MANUAL',
      rateLimit: 'Non défini',
      allowedHours: 'Non défini',
      maxItems: 0,
      retentionDays: 90,
      duplicatePolicy: 'NONE',
      languagePolicy: 'AR_FR',
      geographicScope: 'Mauritanie',
      legalRestrictions: 'Statut de droit d’auteur non identifié',
      humanReviewRequired: true,
      isDemo: true
    },
    retentionPolicy: {
      retentionDays: 90,
      justification: 'Évaluation en cours',
      informationType: 'Inconnu',
      status: 'INCOMPLET',
      futureDeletionPolicy: 'Purge si non validé',
      archivalPolicy: 'Aucun archivage'
    },
    responsibleAnalyst: 'Non assigné',
    reviewer: 'Non assigné',
    approvalDate: null,
    reviewDate: null,
    suspensionReason: undefined,
    notes: 'Fiche créée lors de l’inventaire mais manquante de tous les critères juridiques et techniques.',
    validationHistory: [],
    createdAt: '2026-09-10 14:00:00',
    updatedAt: '2026-09-10 14:00:00',
    isDemo: true
  },

  // Scénario 12 : Source avec validation humaine complète et audit exemplaire (ECOWARN CEDEAO)
  {
    id: 'gov-demo-002',
    sourceId: 'src-002',
    priority: 'P1', // CRITIQUE
    criticality: 'CRITICAL',
    governanceStatus: 'AUTHORIZED',
    approvalStatus: 'APPROVED',
    validationStatus: 'VALIDATED',
    legalStatus: 'Système d’alerte précoce de la Commission de la CEDEAO (Organisation Intergouvernementale)',
    licensingStatus: 'GOVERNMENT_OPEN_DATA',
    robotsStatus: 'ALLOWED',
    termsStatus: 'CHECKED_OK',
    authenticationStatus: 'CONFIGURED',
    collectionPolicy: {
      collectionEnabled: false,
      frequency: '30m',
      rateLimit: '60 req/h',
      allowedHours: '24/7',
      maxItems: 50,
      retentionDays: 1095, // 3 ans
      duplicatePolicy: 'STRICT_HASH_AND_URL',
      languagePolicy: 'FR_EN',
      geographicScope: 'Espace CEDEAO (15 États)',
      legalRestrictions: 'Données d’alerte institutionnelle ouvertes aux partenaires accrédités',
      humanReviewRequired: false,
      isDemo: true
    },
    retentionPolicy: {
      retentionDays: 1095,
      justification: 'Séries chronologiques stratégiques sur les crises en Afrique de l’Ouest',
      informationType: 'Rapports d’incident et alertes de sécurité',
      status: 'ACTIF',
      futureDeletionPolicy: 'Archivage permanent institutionnel',
      archivalPolicy: 'Référentiel certifié hors ligne'
    },
    responsibleAnalyst: 'Analyste Coopération Régionale',
    reviewer: 'Haut Comité Déontologique CEDEAO',
    approvalDate: '2026-09-13 14:00:00',
    reviewDate: '2027-09-13',
    suspensionReason: undefined,
    notes: 'Dossier complet, audit de traçabilité 12/12 validé, signature de conformité déposée.',
    validationHistory: [
      {
        id: 'val-002-01',
        validator: 'Haut Comité Déontologique CEDEAO',
        date: '2026-09-13 14:00:00',
        decision: 'APPROVED',
        justification: 'Partenariat d’alerte précoce institutionnel pleinement documenté et conforme.',
        reservations: 'Conservation des identifiants d’alerte originaux obligatoire.',
        nextReviewDate: '2027-09-13',
        isDemo: true
      }
    ],
    createdAt: '2026-09-02 08:00:00',
    updatedAt: '2026-09-13 14:00:00',
    isDemo: true
  }
];

// ============================================================================
// 3. GÉNÉRATION DES DONNÉES DE GOUVERNANCE POUR TOUTES LES SOURCES (130)
// ============================================================================

export function generateAllSourceGovernance(): OsintSourceGovernance[] {
  const specificMap = new Map<string, OsintSourceGovernance>();
  SPECIFIC_GOVERNANCE_SCENARIOS.forEach(item => {
    specificMap.set(item.sourceId, item);
  });

  const allGovernances: OsintSourceGovernance[] = [...SPECIFIC_GOVERNANCE_SCENARIOS];

  // Compléter pour toutes les sources réelles restantes
  REAL_SOURCES.forEach((source, index) => {
    if (!specificMap.has(source.id)) {
      // Déterminer une priorité par défaut selon le type
      let defaultPriority: SourcePriority = 'P3';
      let defaultCrit: SourceCriticality = 'MEDIUM';
      let defaultStatus: GovernanceWorkflowStatus = 'TO_VERIFY';

      if (source.type === 'OFFICIEL') {
        defaultPriority = (index % 3 === 0) ? 'P1' : 'P2';
        defaultCrit = (index % 3 === 0) ? 'CRITICAL' : 'HIGH';
        defaultStatus = (index % 2 === 0) ? 'VERIFIED' : 'TO_APPROVE';
      } else if (source.type === 'ORGANISATION') {
        defaultPriority = 'P2';
        defaultCrit = 'HIGH';
        defaultStatus = 'TO_APPROVE';
      } else if (source.type === 'ACADEMIQUE' || source.type === 'LOCAL') {
        defaultPriority = 'P4';
        defaultCrit = 'LOW';
        defaultStatus = 'DRAFT';
      }

      allGovernances.push({
        id: `gov-${source.id}`,
        sourceId: source.id,
        priority: defaultPriority,
        criticality: defaultCrit,
        governanceStatus: defaultStatus,
        approvalStatus: defaultStatus === 'VERIFIED' ? 'PENDING' : 'PENDING',
        validationStatus: defaultStatus === 'VERIFIED' ? 'IN_PROGRESS' : 'NONE',
        legalStatus: `Source d'information nationale répertoriée (${source.countryName || source.country})`,
        licensingStatus: source.type === 'OFFICIEL' ? 'GOVERNMENT_NOTICE' : 'EDITORIAL_RESTRICTED',
        robotsStatus: index % 5 === 0 ? 'CRAWL_DELAY' : (index % 7 === 0 ? 'DISALLOWED' : 'ALLOWED'),
        termsStatus: index % 7 === 0 ? 'RESTRICTIVE' : 'CHECKED_OK',
        authenticationStatus: 'NONE',
        collectionPolicy: {
          collectionEnabled: false, // Hors ligne garanti
          frequency: '4h',
          rateLimit: '30 req/h',
          allowedHours: '06:00-22:00 UTC',
          maxItems: 30,
          retentionDays: 180,
          duplicatePolicy: 'STRICT_HASH_AND_URL',
          languagePolicy: 'FR_ONLY',
          geographicScope: source.countryName || source.country,
          legalRestrictions: 'Usage d’analyse interne uniquement',
          humanReviewRequired: true,
          isDemo: true
        },
        retentionPolicy: {
          retentionDays: 180,
          justification: `Veille générale sur ${source.countryName || source.country}`,
          informationType: 'Articles et dépêches',
          status: 'ACTIF',
          futureDeletionPolicy: 'Purge semestrielle',
          archivalPolicy: 'Conservation locale'
        },
        responsibleAnalyst: `Analyste Pôle ${source.region || 'Afrique'}`,
        reviewer: 'Réviseur Senior Dr. Diallo',
        approvalDate: null,
        reviewDate: `2026-10-${(10 + (index % 15)).toString().padStart(2, '0')}`,
        suspensionReason: index % 7 === 0 ? 'Conditions de réutilisation restrictive' : undefined,
        notes: `Source réelle immatriculée au registre OSINT Africa. Raccordement réseau non activé.`,
        validationHistory: [],
        createdAt: '2026-09-12 10:00:00',
        updatedAt: '2026-09-14 09:00:00',
        isDemo: true
      });
    }
  });

  // Compléter pour les sources de démo restantes
  DEMO_SOURCES.forEach((demoSrc) => {
    if (!specificMap.has(demoSrc.id)) {
      allGovernances.push({
        id: `gov-${demoSrc.id}`,
        sourceId: demoSrc.id,
        priority: 'P3',
        criticality: 'MEDIUM',
        governanceStatus: demoSrc.isActive ? 'ACTIVE' : 'DRAFT',
        approvalStatus: demoSrc.isActive ? 'APPROVED' : 'PENDING',
        validationStatus: demoSrc.isActive ? 'VALIDATED' : 'NONE',
        legalStatus: 'Source simulée pour scénario pédagogique',
        licensingStatus: 'OPEN_DATA',
        robotsStatus: 'ALLOWED',
        termsStatus: 'CHECKED_OK',
        authenticationStatus: 'NONE',
        collectionPolicy: {
          collectionEnabled: demoSrc.isActive ?? false,
          frequency: '1h',
          rateLimit: '60 req/h',
          allowedHours: '24/7',
          maxItems: 20,
          retentionDays: 90,
          duplicatePolicy: 'STRICT_HASH_AND_URL',
          languagePolicy: 'FR_EN',
          geographicScope: demoSrc.countryName || demoSrc.country,
          legalRestrictions: 'Données fictives de démonstration',
          humanReviewRequired: false,
          isDemo: true
        },
        retentionPolicy: {
          retentionDays: 90,
          justification: 'Jeu d’essai démonstrateur',
          informationType: 'Simulation',
          status: 'DÉMO',
          futureDeletionPolicy: 'Réinitialisation lors de la réinitialisation de session',
          archivalPolicy: 'Non archivé'
        },
        responsibleAnalyst: 'Équipe Démo',
        reviewer: 'Superviseur Pédagogique',
        approvalDate: demoSrc.isActive ? '2026-09-10 10:00:00' : null,
        reviewDate: '2026-11-10',
        suspensionReason: undefined,
        notes: 'Source de démonstration intégrée au socle de test.',
        validationHistory: [],
        createdAt: '2026-09-10 10:00:00',
        updatedAt: '2026-09-12 10:00:00',
        isDemo: true
      });
    }
  });

  return allGovernances;
}

// ============================================================================
// 4. CALENDRIER DE REVUES PÉRIODIQUES
// ============================================================================

export const INITIAL_SOURCE_REVIEWS: OsintSourceReview[] = [
  {
    id: 'rev-001',
    sourceId: 'src-real-028', // Agence Mauritanienne d'Information
    reviewDate: '2026-07-15',
    reviewer: 'Dr. Diallo',
    status: 'OVERDUE', // En retard
    decision: 'PENDING',
    notes: 'Revue semestrielle en retard de plus de 60 jours. Audit des CGU requis.',
    nextReviewDate: '2026-07-15',
    isDemo: true
  },
  {
    id: 'rev-002',
    sourceId: 'src-real-032', // Gabon Review
    reviewDate: '2026-09-05',
    reviewer: 'M. Mba (Auditeur Déontologique)',
    status: 'COMPLETED',
    decision: 'REJECTED',
    notes: 'Revue extraordinaire ayant abouti à la suspension suite à directive robots.txt Disallow: /.',
    nextReviewDate: '2027-01-05',
    isDemo: true
  },
  {
    id: 'rev-003',
    sourceId: 'src-real-016', // RTNC Congo
    reviewDate: '2026-09-25',
    reviewer: 'Dr. Diallo',
    status: 'SCHEDULED', // À venir
    decision: 'PENDING',
    notes: 'Revue programmée de la couverture éditoriale sur le Kivu.',
    nextReviewDate: '2026-09-25',
    isDemo: true
  },
  {
    id: 'rev-004',
    sourceId: 'src-real-040', // APS Sénégal
    reviewDate: '2026-09-14',
    reviewer: 'Maître Wade',
    status: 'COMPLETED',
    decision: 'APPROVED',
    notes: 'Revue annuelle de conformité Open Data effectuée avec succès.',
    nextReviewDate: '2027-03-14',
    isDemo: true
  },
  {
    id: 'rev-005',
    sourceId: 'src-real-005', // RTB Burkina
    reviewDate: '2026-09-18',
    reviewer: 'Auditrice M. Koné',
    status: 'SCHEDULED',
    decision: 'PENDING',
    notes: 'Vérification du Crawl-Delay et respect de la charge serveur.',
    nextReviewDate: '2026-09-18',
    isDemo: true
  }
];

// ============================================================================
// 5. JOURNAL D'AUDIT INITIAL DE GOUVERNANCE (APPEND-ONLY)
// ============================================================================

export const INITIAL_GOVERNANCE_AUDITS: OsintGovernanceAudit[] = [
  {
    id: 'gov-aud-001',
    timestamp: '2026-09-14 08:30:00',
    action: 'SOURCE_APPROVED',
    entityType: 'SOURCE',
    entityId: 'src-real-040',
    actor: 'Maître Wade (Conseiller Juridique)',
    details: 'Validation humaine formelle sans réserve. Tous les critères légaux sont remplis.',
    before: { status: 'TO_APPROVE' },
    after: { status: 'READY_TO_CONNECT' },
    isDemo: true
  },
  {
    id: 'gov-aud-002',
    timestamp: '2026-09-05 14:30:00',
    action: 'SOURCE_SUSPENDED',
    entityType: 'SOURCE',
    entityId: 'src-real-032',
    actor: 'M. Mba (Auditeur Déontologique)',
    details: 'Détection d’un Disallow formel dans le fichier robots.txt du média émetteur.',
    before: { status: 'TO_VERIFY' },
    after: { status: 'SUSPENDED' },
    isDemo: true
  },
  {
    id: 'gov-aud-003',
    timestamp: '2026-09-12 11:00:00',
    action: 'VALIDATION_REQUESTED',
    entityType: 'SOURCE',
    entityId: 'src-real-022',
    actor: 'Capitaine Traoré (Directeur d’Analyse)',
    details: 'Approbation limitée à la saisie manuelle. Interdiction d’ingestion automatisée.',
    before: { status: 'VERIFIED' },
    after: { status: 'APPROVED_WITH_RESERVATIONS' },
    isDemo: true
  },
  {
    id: 'gov-aud-004',
    timestamp: '2026-09-14 10:15:00',
    action: 'OFFLINE_BLOCKED',
    entityType: 'SOURCE',
    entityId: 'src-real-001',
    actor: 'Système OSINT AFRICA (Garde-fou)',
    details: 'Tentative d’interrogation HTTP sur endpoint réel interceptée et bloquée par la doctrine hors ligne.',
    before: { status: 'N/A' },
    after: { status: 'BLOCKED' },
    isDemo: true
  },
  {
    id: 'gov-aud-005',
    timestamp: '2026-08-20 16:00:00',
    action: 'SOURCE_DISABLED',
    entityType: 'SOURCE',
    entityId: 'src-real-055',
    actor: 'Dr. Diallo (Réviseur Senior)',
    details: 'Portail web inaccessible et sans relais d’archives actif.',
    before: { status: 'DRAFT' },
    after: { status: 'DISABLED' },
    isDemo: true
  }
];
