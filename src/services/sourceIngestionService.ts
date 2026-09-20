/**
 * OSINT AFRICA - Service d'Ingestion, Normalisation et Moteur de Collecte Sandbox (LOT 21 & LOT 23-A)
 * Couche architecturale de traitement découplée, autonome et auditable
 * 
 * STRICTEMENT HORS LIGNE — AUCUNE REQUÊTE RÉSEAU
 * Tout appel réseau (fetch, xhr, ws, rss réel, api distante) est proscrit.
 * Toutes les opérations s’exécutent en sandbox locale.
 */

import {
  OsintRawItem,
  OsintNormalizedItem,
  DuplicateAssessment,
  OsintEvent,
  OsintTraceabilityLink,
  OsintSourceConnector,
  OsintConnectorAudit,
  Category,
  SeverityLevel,
  IngestionDuplicateStatus,
  OsintCollectionJob,
  CollectionAuditLog,
  DuplicateArbitrationAction,
  OsintIngestionError,
  NormalizedProcessingStatus
} from '../types';
import {
  SANDBOX_RAW_ITEMS,
  INITIAL_SANDBOX_JOBS,
  INITIAL_COLLECTION_AUDIT_LOGS,
  SANDBOX_DEMO_SOURCES,
  SANDBOX_DEMO_CONNECTORS
} from '../data/collectionSandboxData';
import { governanceService } from './governanceService';

// Clés de persistance locale
const STORAGE_KILL_SWITCH = 'osint_collection_kill_switch';
const STORAGE_JOBS = 'osint_collection_jobs';
const STORAGE_RAW_ITEMS = 'osint_collection_raw_items';
const STORAGE_NORMALIZED_ITEMS = 'osint_collection_normalized_items';
const STORAGE_AUDIT_LOGS = 'osint_collection_audit_logs';

/**
 * Calcule une empreinte de hachage déterministe (FNV-1a 32-bit hex)
 * pour éviter les dépendances lourdes tout en garantissant l'intégrité
 */
export function calculateContentHash(content: string, title: string = ''): string {
  const normalizedString = `${title.trim().toLowerCase()}|${content.trim().toLowerCase()}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < normalizedString.length; i++) {
    hash ^= normalizedString.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `sha256-sim-${hex}`;
}

/**
 * Valide la structure et le contenu d'un élément brut avant normalisation
 */
export function validateRawItem(item: OsintRawItem): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!item.id || item.id.trim() === '') {
    errors.push('Identifiant brut manquant ou vide');
  }

  if (!item.sourceId || item.sourceId.trim() === '') {
    errors.push('Identifiant de la source émettrice manquant');
  }

  if (!item.connectorId || item.connectorId.trim() === '') {
    errors.push('Identifiant du connecteur d’ingestion manquant');
  }

  if (!item.title || item.title.trim().length < 5) {
    errors.push('Titre brut insuffisant ou absent (< 5 caractères)');
  }

  if (!item.rawContent || item.rawContent.trim().length < 20) {
    errors.push('Contenu brut textuel insuffisant (< 20 caractères)');
  }

  if (!item.originalUrl || !item.originalUrl.startsWith('http')) {
    errors.push('URL source d’origine invalide ou protocole manquant');
  }

  if (!item.publishedAt || isNaN(Date.parse(item.publishedAt))) {
    errors.push('Horodatage de publication absent ou format invalide');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valide les métadonnées techniques d'ingestion associées
 */
export function validateSourceMetadata(metadata: Record<string, any>): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (!metadata) {
    return { valid: true, warnings: ['Métadonnées absentes (objet vide)'] };
  }

  if (!metadata.mimeType) {
    warnings.push('Type MIME non spécifié dans les en-têtes');
  }

  if (!metadata.encoding) {
    warnings.push('Encodage de caractères non précisé (supposé UTF-8)');
  }

  if (metadata.httpStatus && metadata.httpStatus !== 200) {
    warnings.push(`Statut HTTP non nominal enregistré : ${metadata.httpStatus}`);
  }

  return {
    valid: warnings.length < 3,
    warnings,
  };
}

/**
 * Normalise un élément brut en entité standardisée exploitable par l'analyste
 */
export function normalizeRawItem(
  item: OsintRawItem,
  options?: Partial<OsintNormalizedItem>
): OsintNormalizedItem {
  const validation = validateRawItem(item);
  const contentHash = item.contentHash || calculateContentHash(item.rawContent, item.title);

  // Nettoyage de surface du titre et résumé textuel
  const cleanTitle = item.title
    .replace(/[\r\n\t]+/g, ' ')
    .trim();

  const cleanContent = item.rawContent
    .replace(/<[^>]*>?/gm, '') // Nettoyage tags HTML
    .replace(/[\r\n\t]+/g, ' ')
    .trim();

  const cleanSummary = cleanContent.slice(0, 300).trim() + (cleanContent.length > 300 ? '...' : '');

  // Détermination de canonical URL
  const canonicalUrl = item.canonicalUrl || item.originalUrl.split('#')[0].split('?utm')[0];

  // Classification automatique indicative
  const classification = classifyRawItem(item);

  return {
    id: `norm-${item.id.replace(/^raw-/, '')}`,
    rawItemId: item.id,
    sourceId: item.sourceId,
    connectorId: item.connectorId,
    title: cleanTitle,
    normalizedTitle: cleanTitle,
    summary: options?.summary || cleanSummary,
    content: cleanContent,
    normalizedContent: cleanContent,
    language: item.language || 'Français',
    canonicalUrl,
    publishedAt: item.publishedAt || new Date().toISOString(),
    normalizedAt: new Date().toISOString(),
    country: options?.country || classification.country,
    countryId: options?.countryId || 'REG',
    region: options?.region || classification.region,
    category: options?.category || classification.category,
    subcategory: options?.subcategory || classification.subcategory,
    suggestedSeverity: options?.suggestedSeverity || ('MODERE' as SeverityLevel),
    contentHash,
    duplicateStatus: options?.duplicateStatus || 'UNIQUE',
    matchedExistingId: options?.matchedExistingId,
    validationStatus: validation.isValid ? 'VALID' : 'WARNING',
    validationErrors: validation.errors,
    confidence: classification.confidence,
    processingStatus: validation.isValid ? 'NORMALIZED' : 'REVIEW_REQUIRED',
    traceabilityId: `trc-${item.id}`,
    generatedEventId: options?.generatedEventId,
    hashAlgorithm: options?.hashAlgorithm || item.hashAlgorithm || 'FNV-1A-SIMULATED',
    isDemo: options?.isDemo !== undefined ? options.isDemo : item.isDemo,
  };
}

/**
 * Prédit une classification locale indicative basée sur les mots-clés du texte
 */
export function classifyRawItem(item: OsintRawItem): {
  category: Category;
  subcategory: string;
  country: string;
  region: string;
  confidence: number;
  language: string;
} {
  const text = `${item.title} ${item.rawContent}`.toLowerCase();

  let category: Category = 'Sécurité';
  let subcategory = 'Général';
  let country = 'Régional / Panafricain';
  let region = 'Afrique de l’Ouest';
  let confidence = 0.75;

  // Détection géographique indicative
  if (text.includes('mali') || text.includes('mopti') || text.includes('sévaré') || text.includes('gao')) {
    country = 'Mali';
    region = 'Afrique de l’Ouest';
    confidence += 0.1;
  } else if (text.includes('niger') || text.includes('diffa') || text.includes('niamey')) {
    country = 'Niger';
    region = 'Afrique de l’Ouest';
    confidence += 0.1;
  } else if (text.includes('tchad') || text.includes('chari') || text.includes('bol') || text.includes("n'djamena")) {
    country = 'Tchad';
    region = 'Afrique Centrale';
    confidence += 0.1;
  } else if (text.includes('burkina') || text.includes('soum') || text.includes('dori')) {
    country = 'Burkina Faso';
    region = 'Afrique de l’Ouest';
    confidence += 0.1;
  } else if (text.includes('benin') || text.includes('cotonou')) {
    country = 'Bénin';
    region = 'Afrique de l’Ouest';
    confidence += 0.1;
  } else if (text.includes('senegal') || text.includes('dakar')) {
    country = 'Sénégal';
    region = 'Afrique de l’Ouest';
    confidence += 0.1;
  } else if (text.includes('guinea') || text.includes('bissau')) {
    country = 'Guinée-Bissau';
    region = 'Afrique de l’Ouest';
    confidence += 0.1;
  }

  // Détection thématique indicative
  if (text.includes('maritime') || text.includes('tanker') || text.includes('skiff') || text.includes('ais') || text.includes('trawler')) {
    category = 'Sécurité maritime' as Category;
    subcategory = 'Surveillance côtière et ZEE';
  } else if (text.includes('or') || text.includes('minier') || text.includes('carburant') || text.includes('douane') || text.includes('coton')) {
    category = 'Économie & Trafics' as Category;
    subcategory = 'Flux et corridors économiques';
  } else if (text.includes('feu') || text.includes('thermique') || text.includes('crue') || text.includes('sentinel') || text.includes('inondation')) {
    category = 'Environnement & Ressources' as Category;
    subcategory = 'Observation spectrale & hydrologie';
  } else if (text.includes('pastoral') || text.includes('transhumance') || text.includes('bétail') || text.includes('éleveur')) {
    category = 'Tensions communautaires' as Category;
    subcategory = 'Conflits agro-pastoraux';
  } else if (text.includes('convoi') || text.includes('armée') || text.includes('escorte') || text.includes('blocus')) {
    category = 'Groupes armés' as Category;
    subcategory = 'Liberté de circulation & axes logistiques';
  }

  return {
    category,
    subcategory,
    country,
    region,
    confidence: Math.min(0.95, confidence),
    language: item.language || 'Français',
  };
}

/**
 * Détecte les doublons potentiels selon les 8 critères méthodologiques prescrits :
 * 1. canonical URL
 * 2. externalId
 * 3. normalized title
 * 4. publication date
 * 5. sourceId
 * 6. contentHash
 * 7. similar content
 * 8. temporal proximity
 * 
 * RÈGLE FONDAMENTALE : Ne jamais supprimer automatiquement une information.
 */
export function detectPotentialDuplicate(
  item: OsintRawItem | OsintNormalizedItem,
  existingPool: (OsintNormalizedItem | OsintEvent)[]
): DuplicateAssessment {
  const itemTitle = ('title' in item ? item.title : '').trim().toLowerCase();
  const itemUrl = ('canonicalUrl' in item ? item.canonicalUrl : ('originalUrl' in item ? item.originalUrl : '')).toLowerCase();
  const itemSourceId = item.sourceId;
  const itemPubDate = item.publishedAt ? new Date(item.publishedAt).getTime() : 0;
  const itemExternalId = 'externalId' in item ? item.externalId : undefined;
  const itemHash = 'contentHash' in item ? item.contentHash : '';

  let highestScore = 0;
  let bestMatchId: string | undefined;
  let bestMatchTitle: string | undefined;
  let primaryReason = 'Aucune similitude significative constatée';

  let matchedFlags = {
    canonicalUrl: false,
    externalId: false,
    normalizedTitle: false,
    publicationDate: false,
    sourceId: false,
    contentHash: false,
    similarContent: false,
    temporalProximity: false,
  };

  for (const existing of existingPool) {
    if (existing.id === item.id) continue;

    let score = 0;
    const currentFlags = {
      canonicalUrl: false,
      externalId: false,
      normalizedTitle: false,
      publicationDate: false,
      sourceId: false,
      contentHash: false,
      similarContent: false,
      temporalProximity: false,
    };

    const exTitle = existing.title.trim().toLowerCase();
    const exUrl = ('canonicalUrl' in existing ? existing.canonicalUrl : ('originalUrl' in existing ? existing.originalUrl : '')).toLowerCase();
    const exSourceId = 'sourceId' in existing ? existing.sourceId : undefined;
    const exPubDate = 'publishedAt' in existing && existing.publishedAt ? new Date(existing.publishedAt).getTime() : 0;
    const exHash = 'contentHash' in existing ? existing.contentHash : '';

    // 1. Canonical URL match (+40 pts)
    if (itemUrl && exUrl && itemUrl === exUrl) {
      score += 40;
      currentFlags.canonicalUrl = true;
    }

    // 2. External ID match (+35 pts)
    if (itemExternalId && 'externalId' in existing && (existing as any).externalId === itemExternalId) {
      score += 35;
      currentFlags.externalId = true;
    }

    // 3. Content Hash match (+45 pts)
    if (itemHash && exHash && itemHash === exHash) {
      score += 45;
      currentFlags.contentHash = true;
    }

    // 4. Normalized title exact or high similarity (+30 pts)
    if (itemTitle && exTitle) {
      if (itemTitle === exTitle) {
        score += 30;
        currentFlags.normalizedTitle = true;
      } else if (itemTitle.length > 15 && (itemTitle.includes(exTitle.slice(0, 20)) || exTitle.includes(itemTitle.slice(0, 20)))) {
        score += 20;
        currentFlags.similarContent = true;
      }
    }

    // 5. Source ID match (+10 pts)
    if (itemSourceId && exSourceId && itemSourceId === exSourceId) {
      score += 10;
      currentFlags.sourceId = true;
    }

    // 6. Temporal proximity (diff < 12h = +15 pts, diff < 48h = +5 pts)
    if (itemPubDate > 0 && exPubDate > 0) {
      const diffHours = Math.abs(itemPubDate - exPubDate) / (1000 * 60 * 60);
      if (diffHours < 12) {
        score += 15;
        currentFlags.temporalProximity = true;
        if (diffHours < 2) {
          currentFlags.publicationDate = true;
        }
      } else if (diffHours < 48) {
        score += 5;
        currentFlags.temporalProximity = true;
      }
    }

    // Retenir le meilleur match
    if (score > highestScore) {
      highestScore = score;
      bestMatchId = existing.id;
      bestMatchTitle = existing.title;
      matchedFlags = currentFlags;

      if (score >= 75) {
        primaryReason = 'Concordance forte (URL canonique, empreinte de hachage et/ou titre normalisé)';
      } else if (score >= 45) {
        primaryReason = 'Forte présomption de doublon (titre approchant et proximité temporelle sous 12h)';
      } else if (score >= 25) {
        primaryReason = 'Recoupement thématique ou source commune';
      }
    }
  }

  let status: IngestionDuplicateStatus = 'UNIQUE';
  if (highestScore >= 75) {
    status = 'CONFIRMED_DUPLICATE';
  } else if (highestScore >= 45) {
    status = 'PROBABLE_DUPLICATE';
  } else if (highestScore >= 25) {
    status = 'POSSIBLE_OVERLAP';
  }

  return {
    status,
    score: Math.min(100, highestScore),
    matchedFields: matchedFlags,
    matchedItemId: bestMatchId,
    matchedItemTitle: bestMatchTitle,
    reason: primaryReason,
    analystArbitrationRequired: status !== 'UNIQUE',
  };
}

/**
 * Associe un élément normalisé à un projet d'événement OSINT
 */
export function mapRawItemToEvent(
  rawItem: OsintRawItem,
  normalized: OsintNormalizedItem,
  countryName: string = 'Régional'
): Partial<OsintEvent> {
  return {
    id: `evt-from-${rawItem.id}`,
    title: normalized.title,
    summary: normalized.summary,
    description: rawItem.rawContent,
    sourceId: rawItem.sourceId,
    originalUrl: rawItem.originalUrl,
    country: normalized.country || countryName,
    region: (normalized.region as any) || 'Afrique de l’Ouest',
    category: normalized.category,
    publishedAt: normalized.publishedAt,
    detectedAt: rawItem.collectedAt,
    severity: normalized.suggestedSeverity,
    status: 'Nouveau',
    isDemo: true,
  };
}

/**
 * Crée un maillon de traçabilité entre deux étapes de la chaîne de renseignement
 */
export function createTraceabilityLink(
  fromStage: string,
  fromId: string,
  toStage: string,
  toId: string,
  isDirect: boolean = true
): OsintTraceabilityLink {
  return {
    fromStage,
    fromId,
    toStage,
    toId,
    createdAt: new Date().toISOString(),
    isDirect,
    confidence: isDirect ? 'Établie' : 'Indirecte',
  };
}

/**
 * Simule le test d'un connecteur en mode HORS LIGNE
 * INTERDICTION STRICTE D'ÉMETTRE UNE REQUÊTE RÉSEAU
 */
export function testConnectorOffline(connector: OsintSourceConnector): {
  success: boolean;
  message: string;
  auditLog: OsintConnectorAudit;
} {
  const auditLog: OsintConnectorAudit = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    connectorId: connector.id,
    sourceId: connector.sourceId,
    action: 'TEST_BLOCKED_OFFLINE',
    timestamp: new Date().toISOString(),
    actor: 'Analyste OSINT (Session locale)',
    result: 'BLOCKED_OFFLINE',
    message: 'Test réseau bloqué : mode hors ligne strict actif dans LOT 21. Aucune connexion distante émise.',
    details: {
      endpoint: connector.endpoint,
      connectorType: connector.connectorType,
      method: connector.method,
    },
    isDemo: true,
  };

  return {
    success: false,
    message: 'Test réseau désactivé dans le mode hors ligne actuel.',
    auditLog,
  };
}

// ============================================================================
// CLASSE SINGLETON DU MOTEUR D'INGESTION SANDBOX (LOT 23-A)
// ============================================================================

export class SourceIngestionService {
  private killSwitch: boolean = false;
  private jobs: OsintCollectionJob[] = [];
  private rawItems: OsintRawItem[] = [];
  private normalizedItems: OsintNormalizedItem[] = [];
  private auditLogs: CollectionAuditLog[] = [];
  private errors: OsintIngestionError[] = [];

  constructor() {
    this.loadState();
  }

  /**
   * Charge l'état local depuis le localStorage avec repli sur le jeu de démo
   */
  private loadState(): void {
    try {
      // 1. Kill switch
      const savedKs = localStorage.getItem(STORAGE_KILL_SWITCH);
      if (savedKs !== null) {
        this.killSwitch = savedKs === 'true';
      }

      // 2. Jobs
      const savedJobs = localStorage.getItem(STORAGE_JOBS);
      if (savedJobs) {
        this.jobs = JSON.parse(savedJobs);
      } else {
        this.jobs = [...INITIAL_SANDBOX_JOBS];
      }

      // 3. Raw Items
      const savedRaw = localStorage.getItem(STORAGE_RAW_ITEMS);
      if (savedRaw) {
        this.rawItems = JSON.parse(savedRaw);
      } else {
        this.rawItems = [...SANDBOX_RAW_ITEMS];
      }

      // 4. Normalized Items
      const savedNorm = localStorage.getItem(STORAGE_NORMALIZED_ITEMS);
      if (savedNorm) {
        this.normalizedItems = JSON.parse(savedNorm);
      } else {
        // Normaliser les raw items initiaux valides
        this.normalizedItems = this.rawItems
          .filter((r) => r.processingStatus === 'NORMALIZED' || r.processingStatus === 'DUPLICATE')
          .map((r) => normalizeRawItem(r));
      }

      // 5. Audit logs
      const savedAudits = localStorage.getItem(STORAGE_AUDIT_LOGS);
      if (savedAudits) {
        this.auditLogs = JSON.parse(savedAudits);
      } else {
        this.auditLogs = [...INITIAL_COLLECTION_AUDIT_LOGS];
      }
    } catch (e) {
      console.warn('[sourceIngestionService] Erreur lors du chargement local, initialisation par défaut.', e);
      this.jobs = [...INITIAL_SANDBOX_JOBS];
      this.rawItems = [...SANDBOX_RAW_ITEMS];
      this.normalizedItems = this.rawItems
        .filter((r) => r.processingStatus === 'NORMALIZED')
        .map((r) => normalizeRawItem(r));
      this.auditLogs = [...INITIAL_COLLECTION_AUDIT_LOGS];
    }
  }

  /**
   * Sauvegarde l'état local dans localStorage
   */
  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KILL_SWITCH, String(this.killSwitch));
      localStorage.setItem(STORAGE_JOBS, JSON.stringify(this.jobs));
      localStorage.setItem(STORAGE_RAW_ITEMS, JSON.stringify(this.rawItems));
      localStorage.setItem(STORAGE_NORMALIZED_ITEMS, JSON.stringify(this.normalizedItems));
      localStorage.setItem(STORAGE_AUDIT_LOGS, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.error('[sourceIngestionService] Échec de la sauvegarde locale dans localStorage', e);
    }
  }

  // ==========================================================================
  // GESTION DU KILL SWITCH D'URGENCE (LOT 23-A - Consigne 26)
  // ==========================================================================

  public getKillSwitchStatus(): boolean {
    return this.killSwitch;
  }

  public setKillSwitchStatus(enabled: boolean): void {
    this.killSwitch = enabled;
    this.addAuditLog({
      jobId: 'system',
      sourceId: 'system',
      sourceName: 'Système Global Ingestion',
      action: 'KILL_SWITCH_TRIGGERED',
      result: enabled ? 'WARNING' : 'SUCCESS',
      items: 0,
      errors: enabled ? ['ARRÊT D’URGENCE ACTIVÉ : Toutes les simulations de collecte sont verrouillées.'] : [],
      initiator: 'Officier de Permanence / Superviseur',
      mode: 'SIMULATED',
      details: enabled ? 'Activation manuelle du Kill Switch de collecte' : 'Désactivation du Kill Switch de collecte',
    });
    this.saveState();
  }

  // ==========================================================================
  // CONSULTATION DES ENTITÉS
  // ==========================================================================

  public getAllJobs(): OsintCollectionJob[] {
    return [...this.jobs].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  public getJobById(id: string): OsintCollectionJob | undefined {
    return this.jobs.find((j) => j.id === id);
  }

  public getAllRawItems(): OsintRawItem[] {
    return [...this.rawItems];
  }

  public getRawItemById(id: string): OsintRawItem | undefined {
    return this.rawItems.find((r) => r.id === id);
  }

  public getAllNormalizedItems(): OsintNormalizedItem[] {
    return [...this.normalizedItems];
  }

  public getNormalizedItemById(id: string): OsintNormalizedItem | undefined {
    return this.normalizedItems.find((n) => n.id === id);
  }

  public getAuditLogs(): CollectionAuditLog[] {
    return [...this.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getMetrics() {
    const totalJobs = this.jobs.length;
    const simulatedJobs = this.jobs.filter((j) => j.executionMode === 'SIMULATED' || j.executionMode === 'SIMULATION').length;
    const successJobs = this.jobs.filter((j) => j.status === 'SUCCESS').length;
    const partialJobs = this.jobs.filter((j) => j.status === 'PARTIAL').length;
    const failedJobs = this.jobs.filter((j) => j.status === 'FAILED' || j.status === 'DISABLED').length;

    const itemsReceived = this.rawItems.length;
    const itemsNormalized = this.normalizedItems.length;
    const itemsRejected = this.rawItems.filter((r) => r.processingStatus === 'REJECTED').length;
    const duplicatesDetected = this.normalizedItems.filter((n) => n.duplicateStatus !== 'UNIQUE').length;
    const eventsCreated = this.normalizedItems.filter((n) => Boolean(n.generatedEventId)).length;

    return {
      totalJobs,
      simulatedJobs,
      successJobs,
      partialJobs,
      failedJobs,
      itemsReceived,
      itemsNormalized,
      itemsRejected,
      duplicatesDetected,
      eventsCreated,
    };
  }

  // ==========================================================================
  // SIMULATION DU CYCLE COMPLET DE COLLECTE ET D'INGESTION (Consignes 6 & 10)
  // STRICTEMENT LOCAL ET HORS LIGNE
  // ==========================================================================

  public async simulateCollection(
    sourceId: string,
    connectorId: string,
    options?: {
      maxItems?: number;
      simulateErrors?: boolean;
      initiatedBy?: string;
    }
  ): Promise<{
    job: OsintCollectionJob;
    rawItems: OsintRawItem[];
    normalizedItems: OsintNormalizedItem[];
    duplicates: DuplicateAssessment[];
    errors: string[];
    blockedReason?: string;
  }> {
    const initiatedBy = options?.initiatedBy || 'Analyste OSINT (Session Sandbox)';
    const maxItems = options?.maxItems || 4;

    // 1. CONTRÔLE KILL SWITCH
    if (this.killSwitch) {
      const err = 'COLLECTE DÉSACTIVÉE PAR LE KILL SWITCH : Arrêt d’urgence actif.';
      const blockedJob: OsintCollectionJob = {
        id: `job-sb-${Date.now()}`,
        sourceId,
        connectorId,
        status: 'DISABLED',
        startedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        itemsReceived: 0,
        itemsAccepted: 0,
        itemsRejected: 0,
        duplicatesDetected: 0,
        errors: [err],
        executionMode: 'SIMULATED',
        durationMs: 0,
        initiatedBy,
        isDemo: true,
      };
      this.jobs.unshift(blockedJob);
      this.addAuditLog({
        jobId: blockedJob.id,
        sourceId,
        sourceName: sourceId,
        action: 'KILL_SWITCH_TRIGGERED',
        result: 'BLOCKED_OFFLINE',
        items: 0,
        errors: [err],
        initiator: initiatedBy,
        mode: 'SIMULATED',
        details: 'Tentative de collecte interceptée par le Kill Switch de sécurité.',
      });
      this.saveState();
      return {
        job: blockedJob,
        rawItems: [],
        normalizedItems: [],
        duplicates: [],
        errors: [err],
        blockedReason: err,
      };
    }

    // 2. CONTRÔLE GOUVERNANCE (Consigne 25)
    const gov = governanceService.getGovernanceBySourceId(sourceId);
    if (gov) {
      if (gov.governanceStatus === 'DISABLED' || gov.governanceStatus === 'SUSPENDED') {
        const err = `COLLECTE SIMULÉE BLOQUÉE PAR LA GOUVERNANCE : La source est au statut ${gov.governanceStatus}. Motif : ${gov.suspensionReason || 'Non autorisé'}`;
        const blockedJob: OsintCollectionJob = {
          id: `job-sb-${Date.now()}`,
          sourceId,
          connectorId,
          status: 'FAILED',
          startedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
          completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
          itemsReceived: 0,
          itemsAccepted: 0,
          itemsRejected: 0,
          duplicatesDetected: 0,
          errors: [err],
          executionMode: 'SIMULATED',
          durationMs: 0,
          initiatedBy,
          isDemo: true,
        };
        this.jobs.unshift(blockedJob);
        this.addAuditLog({
          jobId: blockedJob.id,
          sourceId,
          sourceName: sourceId,
          action: 'OFFLINE_ACTION_BLOCKED',
          result: 'BLOCKED_OFFLINE',
          items: 0,
          errors: [err],
          initiator: initiatedBy,
          mode: 'SIMULATED',
          details: 'Blocage préventif par les politiques de gouvernance.',
        });
        this.saveState();
        return {
          job: blockedJob,
          rawItems: [],
          normalizedItems: [],
          duplicates: [],
          errors: [err],
          blockedReason: err,
        };
      }
    }

    // 3. CONTRÔLE SOURCE RÉELLE (Consigne 11 & Règle N°1)
    // Si la source est une source réelle immatriculée (non demo)
    const isRealSource = sourceId.startsWith('src-real-');
    if (isRealSource) {
      const err = 'SOURCE RÉELLE — NON CONNECTÉE : La collecte réseau réelle est strictement interdite dans ce lot.';
      const blockedJob: OsintCollectionJob = {
        id: `job-sb-${Date.now()}`,
        sourceId,
        connectorId,
        status: 'DISABLED',
        startedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        itemsReceived: 0,
        itemsAccepted: 0,
        itemsRejected: 0,
        duplicatesDetected: 0,
        errors: [err],
        executionMode: 'SIMULATED',
        durationMs: 0,
        initiatedBy,
        isDemo: true,
      };
      this.jobs.unshift(blockedJob);
      this.addAuditLog({
        jobId: blockedJob.id,
        sourceId,
        sourceName: sourceId,
        action: 'OFFLINE_ACTION_BLOCKED',
        result: 'BLOCKED_OFFLINE',
        items: 0,
        errors: [err],
        initiator: initiatedBy,
        mode: 'SIMULATED',
        details: 'Garde-fou réseau : Tentative de collecte sur une source réelle interceptée.',
      });
      this.saveState();
      return {
        job: blockedJob,
        rawItems: [],
        normalizedItems: [],
        duplicates: [],
        errors: [err],
        blockedReason: err,
      };
    }

    // 4. EXÉCUTION DE LA SIMULATION EN SANDBOX LOCALE
    const startTime = Date.now();
    const jobId = `job-sb-${Date.now()}`;

    // Sélection d'échantillons depuis le catalogue de test de la sandbox
    const matchingRaw = SANDBOX_RAW_ITEMS.filter((r) => r.sourceId === sourceId);
    const candidateRaw = matchingRaw.length > 0 ? matchingRaw : SANDBOX_RAW_ITEMS;
    const selectedRawSlice = candidateRaw.slice(0, maxItems);

    const generatedRawItems: OsintRawItem[] = [];
    const generatedNormalizedItems: OsintNormalizedItem[] = [];
    const detectedDuplicates: DuplicateAssessment[] = [];
    const jobErrors: string[] = [];

    let acceptedCount = 0;
    let rejectedCount = 0;
    let duplicateCount = 0;

    for (const template of selectedRawSlice) {
      const newRawId = `raw-sb-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const rawItem: OsintRawItem = {
        ...template,
        id: newRawId,
        sourceId,
        connectorId,
        collectedAt: new Date().toISOString(),
        isDemo: true,
      };

      generatedRawItems.push(rawItem);

      // Validation structurelle (Étape 5)
      const val = validateRawItem(rawItem);
      if (!val.isValid) {
        rawItem.processingStatus = 'REJECTED';
        rawItem.rejectionReason = val.errors.join(' ; ');
        rejectedCount++;
        jobErrors.push(`Item brut ${rawItem.id} rejeté : ${rawItem.rejectionReason}`);
        continue;
      }

      // Normalisation (Étape 6 & 7)
      const normItem = normalizeRawItem(rawItem);

      // Déduplication contre les items existants (Étape 8)
      const dup = detectPotentialDuplicate(normItem, this.normalizedItems);
      normItem.duplicateStatus = dup.status;
      if (dup.status !== 'UNIQUE') {
        duplicateCount++;
        normItem.matchedExistingId = dup.matchedItemId;
        normItem.processingStatus = 'DUPLICATE_CANDIDATE';
        detectedDuplicates.push(dup);
      } else {
        acceptedCount++;
        normItem.processingStatus = 'NORMALIZED';
      }

      generatedNormalizedItems.push(normItem);
    }

    const durationMs = Date.now() - startTime + Math.floor(Math.random() * 1200 + 500);
    const jobStatus = jobErrors.length === 0 ? 'SUCCESS' : acceptedCount > 0 ? 'PARTIAL' : 'FAILED';

    const newJob: OsintCollectionJob = {
      id: jobId,
      sourceId,
      connectorId,
      status: jobStatus,
      startedAt: new Date(startTime).toISOString().replace('T', ' ').slice(0, 19),
      completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      itemsReceived: generatedRawItems.length,
      itemsAccepted: acceptedCount,
      itemsRejected: rejectedCount,
      duplicatesDetected: duplicateCount,
      errors: jobErrors,
      executionMode: 'SIMULATED',
      durationMs,
      initiatedBy,
      isDemo: true,
    };

    // Mise à jour de l'état
    this.jobs.unshift(newJob);
    this.rawItems.unshift(...generatedRawItems);
    this.normalizedItems.unshift(...generatedNormalizedItems);

    // Audit de l'opération
    this.addAuditLog({
      jobId: newJob.id,
      sourceId,
      sourceName: this.getSourceName(sourceId),
      action: 'COLLECTION_SIMULATED',
      result: jobStatus === 'SUCCESS' ? 'SUCCESS' : jobStatus === 'PARTIAL' ? 'WARNING' : 'FAILURE',
      items: generatedRawItems.length,
      errors: jobErrors,
      initiator: initiatedBy,
      mode: 'SIMULATED',
      details: `Collecte locale terminée. ${acceptedCount} items normalisés, ${rejectedCount} rejetés, ${duplicateCount} doublons détectés.`,
    });

    this.saveState();

    return {
      job: newJob,
      rawItems: generatedRawItems,
      normalizedItems: generatedNormalizedItems,
      duplicates: detectedDuplicates,
      errors: jobErrors,
    };
  }

  // ==========================================================================
  // ARBITRAGE HUMAIN DES DOUBLONS (Consigne 16)
  // ==========================================================================

  public arbitrateDuplicate(
    normalizedItemId: string,
    action: DuplicateArbitrationAction,
    analystComment?: string,
    actorName: string = 'Analyste Réviseur'
  ): boolean {
    const item = this.normalizedItems.find((n) => n.id === normalizedItemId);
    if (!item) return false;

    switch (action) {
      case 'KEEP_UNIQUE':
        item.duplicateStatus = 'UNIQUE';
        item.processingStatus = 'NORMALIZED';
        break;
      case 'CONFIRM_DUPLICATE':
        item.duplicateStatus = 'CONFIRMED_DUPLICATE';
        item.processingStatus = 'REVIEW_REQUIRED';
        break;
      case 'MARK_OVERLAP':
        item.duplicateStatus = 'POSSIBLE_OVERLAP';
        item.processingStatus = 'REVIEW_REQUIRED';
        break;
      case 'LINK_TO_EXISTING':
        item.duplicateStatus = 'CONFIRMED_DUPLICATE';
        break;
      case 'REQUEST_REVIEW':
        item.processingStatus = 'REVIEW_REQUIRED';
        break;
    }

    this.addAuditLog({
      jobId: item.rawItemId,
      sourceId: item.sourceId,
      sourceName: this.getSourceName(item.sourceId),
      action: 'DUPLICATE_ARBITRATED',
      result: 'SUCCESS',
      items: 1,
      errors: [],
      initiator: actorName,
      mode: 'SIMULATED',
      details: `Décision d'arbitrage : ${action}. Commentaire : ${analystComment || 'Aucun'}`,
    });

    this.saveState();
    return true;
  }

  // ==========================================================================
  // REJET D'UN ÉLÉMENT BRUT (Consigne 17)
  // ==========================================================================

  public rejectRawItem(rawItemId: string, reason: string, actor: string = 'Analyste OSINT'): boolean {
    const raw = this.rawItems.find((r) => r.id === rawItemId);
    if (!raw) return false;

    raw.processingStatus = 'REJECTED';
    raw.rejectionReason = reason;

    // Mettre à jour l'item normalisé correspondant s'il existe
    const norm = this.normalizedItems.find((n) => n.rawItemId === rawItemId);
    if (norm) {
      norm.validationStatus = 'REJECTED';
      norm.processingStatus = 'REJECTED';
      norm.validationErrors.push(reason);
    }

    this.addAuditLog({
      jobId: raw.id,
      sourceId: raw.sourceId,
      sourceName: this.getSourceName(raw.sourceId),
      action: 'RAW_ITEM_REJECTED',
      result: 'WARNING',
      items: 1,
      errors: [reason],
      initiator: actor,
      mode: 'SIMULATED',
      details: `Rejet formel de l'item brut ${rawItemId}. Motif conservé : ${reason}`,
    });

    this.saveState();
    return true;
  }

  // ==========================================================================
  // CONVERSION EN ÉVÉNEMENT OSINT (Consigne 19)
  // Conserve la traçabilité complète : rawItemId -> normalizedItemId -> eventId
  // ==========================================================================

  public convertNormalizedItemToEvent(
    normalizedItemId: string,
    actorName: string = 'Analyste Renseignement'
  ): { success: boolean; eventId?: string; error?: string } {
    const item = this.normalizedItems.find((n) => n.id === normalizedItemId);
    if (!item) {
      return { success: false, error: 'Élément normalisé introuvable' };
    }

    if (item.validationStatus === 'REJECTED') {
      return { success: false, error: 'Impossible de créer un événement à partir d’un élément rejeté' };
    }

    const eventId = `evt-ingested-${Date.now()}`;
    item.generatedEventId = eventId;
    item.processingStatus = 'READY_FOR_EVENT';

    this.addAuditLog({
      jobId: item.rawItemId,
      sourceId: item.sourceId,
      sourceName: this.getSourceName(item.sourceId),
      action: 'EVENT_CREATED',
      result: 'SUCCESS',
      items: 1,
      errors: [],
      initiator: actorName,
      mode: 'SIMULATED',
      details: `Événement créé avec succès : ${eventId} rattaché au titre "${item.title}". Traçabilité ascendante préservée.`,
    });

    this.saveState();
    return { success: true, eventId };
  }

  // ==========================================================================
  // UTILITAIRES & RÉINITIALISATION
  // ==========================================================================

  private getSourceName(sourceId: string): string {
    const s = SANDBOX_DEMO_SOURCES.find((src) => src.id === sourceId);
    if (s) return s.name;
    return sourceId;
  }

  public addAuditLog(log: Omit<CollectionAuditLog, 'id' | 'timestamp' | 'isDemo'> & { isDemo?: boolean }): CollectionAuditLog {
    const fullLog: CollectionAuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      isDemo: log.isDemo ?? true,
      ...log,
    };
    this.auditLogs.unshift(fullLog);
    this.saveState();
    return fullLog;
  }

  public saveRawItems(items: OsintRawItem[]): void {
    this.rawItems = items;
    this.saveState();
  }

  public saveNormalizedItems(items: OsintNormalizedItem[]): void {
    this.normalizedItems = items;
    this.saveState();
  }

  public saveJobs(jobs: OsintCollectionJob[]): void {
    this.jobs = jobs;
    this.saveState();
  }

  public resetSandboxData(): void {
    this.killSwitch = false;
    this.jobs = [...INITIAL_SANDBOX_JOBS];
    this.rawItems = [...SANDBOX_RAW_ITEMS];
    this.normalizedItems = this.rawItems
      .filter((r) => r.processingStatus === 'NORMALIZED' || r.processingStatus === 'DUPLICATE')
      .map((r) => normalizeRawItem(r));
    this.auditLogs = [...INITIAL_COLLECTION_AUDIT_LOGS];
    this.saveState();
  }
}

export const sourceIngestionService = new SourceIngestionService();
