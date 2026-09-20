import { 
  OsintDistributionRecipient,
  OsintDistributionGroup,
  OsintDistribution,
  OsintDistributionAcknowledgment,
  OsintDistributionAudit,
  OsintArchiveRecord,
  OsintDistributionLevel,
  OsintDistributionStatus,
  OsintPreDistributionChecklist,
  OsintIntelligenceNote
} from '../types';
import { intelligenceNoteService } from './intelligenceNoteService';

const STORAGE_KEYS = {
  RECIPIENTS: 'OSINT_DISTRIBUTION_RECIPIENTS_LOT32',
  GROUPS: 'OSINT_DISTRIBUTION_GROUPS_LOT32',
  DISTRIBUTIONS: 'OSINT_DISTRIBUTIONS_LOT32',
  ACKNOWLEDGMENTS: 'OSINT_DISTRIBUTION_ACKNOWLEDGMENTS_LOT32',
  AUDIT: 'OSINT_DISTRIBUTION_AUDIT_LOT32',
  ARCHIVE: 'OSINT_ARCHIVE_LOT32'
};

const inMemoryStore: Record<string, string> = {};

const safeGetItem = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch {
    // fallback
  }
  return inMemoryStore[key] || null;
};

const safeSetItem = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch {
    // fallback
  }
  inMemoryStore[key] = value;
};

// Initial Seed Recipients (Simulations de gouvernance locale)
const INITIAL_RECIPIENTS: OsintDistributionRecipient[] = [
  {
    recipientId: 'rec-001',
    name: 'Col. Amadou Touré',
    organization: 'Centre de Fusion Opérationnelle Conjointe (CFOC)',
    function: 'Directeur du Renseignement Stratégique',
    accessLevel: 'CONFIDENTIEL',
    needToKnow: ['Sahel', 'Mouvements Transfrontaliers', 'Logistique'],
    email: 'a.toure@cfoc-regional.gov.demo',
    phone: '+223 20 22 01 01',
    status: 'ACTIF',
    isDemo: true,
    provenance: 'Simulation locale de gouvernance - Démo',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z'
  },
  {
    recipientId: 'rec-002',
    name: 'Mme Fatoumata Ndiaye',
    organization: 'Observatoire de Sécurité Maritime du Golfe de Guinée',
    function: 'Analyste en Chef Veille Côtière',
    accessLevel: 'RESTREINT',
    needToKnow: ['Pêche INN', 'AIS', 'Littoral Ouest-Africain'],
    email: 'f.ndiaye@maritime-obs.org.demo',
    phone: '+221 33 821 00 00',
    status: 'ACTIF',
    isDemo: true,
    provenance: 'Simulation locale de gouvernance - Démo',
    createdAt: '2026-09-02T09:30:00.000Z',
    updatedAt: '2026-09-02T09:30:00.000Z'
  },
  {
    recipientId: 'rec-003',
    name: 'Dr. Kwesi Mensah',
    organization: 'Commission Économique Régionale - Cellule Crise',
    function: 'Coordinateur des Alertes Précoces',
    accessLevel: 'DIFFUSION_LIMITEE',
    needToKnow: ['Chaînes d approvisionnement', 'Corridors Commerciaux'],
    email: 'k.mensah@reg-alert.demo',
    phone: '+233 30 277 00 00',
    status: 'ACTIF',
    isDemo: true,
    provenance: 'Simulation locale de gouvernance - Démo',
    createdAt: '2026-09-03T10:15:00.000Z',
    updatedAt: '2026-09-03T10:15:00.000Z'
  },
  {
    recipientId: 'rec-004',
    name: 'Capitaine Ibrahim Traoré',
    organization: 'Direction des Services de Protection et Surveillance',
    function: 'Officier de Liaison',
    accessLevel: 'CONFIDENTIEL',
    needToKnow: ['Zone Liptako-Gourma', 'Sécurisation Axes'],
    email: 'i.traore@dsps-defense.demo',
    phone: '+226 25 30 00 00',
    status: 'ACTIF',
    isDemo: true,
    provenance: 'Simulation locale de gouvernance - Démo',
    createdAt: '2026-09-04T11:00:00.000Z',
    updatedAt: '2026-09-04T11:00:00.000Z'
  },
  // Destinataires réels (catégories institutionnelles ouvertes)
  {
    recipientId: 'rec-real-001',
    name: 'Direction Générale de la Protection Civile',
    organization: 'Service National d Alerte & Gestion de Crise',
    function: 'Point Focal Veille Publique',
    accessLevel: 'RESTREINT',
    needToKnow: ['Sécurité Civile', 'Infrastructures Vitales'],
    email: 'veille@protectioncivile.gov',
    phone: '+221 33 800 12 34',
    status: 'ACTIF',
    isDemo: false,
    provenance: 'Institution Publique Réelle - Registre Ouvert',
    createdAt: '2026-09-05T14:00:00.000Z',
    updatedAt: '2026-09-05T14:00:00.000Z'
  },
  {
    recipientId: 'rec-real-002',
    name: 'Observatoire Régional des Transports et Corridors',
    organization: 'Autorité Publique Portuaire & Routière',
    function: 'Cellule d Analyse Logistique',
    accessLevel: 'DIFFUSION_LIMITEE',
    needToKnow: ['Flux Commerciaux', 'Sûreté Portuaire'],
    email: 'analyse@corridors-afrique.org',
    phone: '+225 20 20 00 00',
    status: 'ACTIF',
    isDemo: false,
    provenance: 'Organisme Public Réel - Répertoire Officiel',
    createdAt: '2026-09-06T15:30:00.000Z',
    updatedAt: '2026-09-06T15:30:00.000Z'
  }
];

// Initial Seed Groups
const INITIAL_GROUPS: OsintDistributionGroup[] = [
  {
    groupId: 'grp-001',
    name: 'Groupe Tactique Sahel - Veille Logistique',
    description: 'Destinataires habilités à recevoir les notes d alerte et de situation transfrontalières.',
    members: ['rec-001', 'rec-004'],
    accessLevel: 'CONFIDENTIEL',
    status: 'ACTIF',
    isDemo: true,
    provenance: 'Simulation locale - Démo',
    createdAt: '2026-09-05T08:00:00.000Z',
    updatedAt: '2026-09-05T08:00:00.000Z'
  },
  {
    groupId: 'grp-002',
    name: 'Groupe Surveillance Façade Maritime',
    description: 'Destinataires chargés du suivi des signaux côtiers et des activités maritimes.',
    members: ['rec-002', 'rec-real-002'],
    accessLevel: 'RESTREINT',
    status: 'ACTIF',
    isDemo: true,
    provenance: 'Simulation locale - Démo',
    createdAt: '2026-09-06T09:00:00.000Z',
    updatedAt: '2026-09-06T09:00:00.000Z'
  },
  {
    groupId: 'grp-real-001',
    name: 'Cellule Interministérielle Veille Ouverte',
    description: 'Organismes publics destinataires des synthèses d information ouverte.',
    members: ['rec-real-001', 'rec-real-002'],
    accessLevel: 'RESTREINT',
    status: 'ACTIF',
    isDemo: false,
    provenance: 'Gouvernance Publique Réelle',
    createdAt: '2026-09-07T10:00:00.000Z',
    updatedAt: '2026-09-07T10:00:00.000Z'
  }
];

class DistributionService {
  // =========================================================================
  // GESTION AUDIT APPEND-ONLY (Section 12)
  // Strictement aucune fonction deleteAudit, updateAudit ou clearAudit
  // =========================================================================
  private logAudit(entry: Omit<OsintDistributionAudit, 'id' | 'timestamp'>): OsintDistributionAudit {
    const logs = this.getAuditLogs();
    const newEntry: OsintDistributionAudit = {
      ...entry,
      id: `daud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newEntry);
    safeSetItem(STORAGE_KEYS.AUDIT, JSON.stringify(logs.slice(0, 1500)));
    return newEntry;
  }

  public getAuditLogs(): OsintDistributionAudit[] {
    const stored = safeGetItem(STORAGE_KEYS.AUDIT);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  // =========================================================================
  // GESTION DES DESTINATAIRES (Section 3)
  // =========================================================================
  public getRecipients(filter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): OsintDistributionRecipient[] {
    const stored = safeGetItem(STORAGE_KEYS.RECIPIENTS);
    let recipients: OsintDistributionRecipient[] = [];
    if (!stored) {
      recipients = [...INITIAL_RECIPIENTS];
      safeSetItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify(recipients));
    } else {
      try {
        recipients = JSON.parse(stored);
      } catch {
        recipients = [...INITIAL_RECIPIENTS];
      }
    }

    if (filter === 'DEMO') return recipients.filter(r => r.isDemo);
    if (filter === 'REAL') return recipients.filter(r => !r.isDemo);
    return recipients;
  }

  public getRecipientById(recipientId: string): OsintDistributionRecipient | undefined {
    const recipients = this.getRecipients('ALL');
    return recipients.find(r => r.recipientId === recipientId);
  }

  public saveRecipient(
    recipient: OsintDistributionRecipient, 
    analystId: string, 
    reason = "Enregistrement destinataire"
  ): OsintDistributionRecipient {
    const recipients = this.getRecipients('ALL');
    const existingIndex = recipients.findIndex(r => r.recipientId === recipient.recipientId);
    const now = new Date().toISOString();
    let action = 'RECIPIENT_CREATED';

    if (existingIndex >= 0) {
      recipient.updatedAt = now;
      recipients[existingIndex] = recipient;
      action = 'RECIPIENT_UPDATED';
    } else {
      recipient.createdAt = recipient.createdAt || now;
      recipient.updatedAt = now;
      recipients.push(recipient);
    }

    safeSetItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify(recipients));

    this.logAudit({
      analystId,
      action,
      entityId: recipient.recipientId,
      justification: reason,
      provenance: recipient.provenance,
      isDemo: recipient.isDemo
    });

    return recipient;
  }

  public toggleRecipientActive(
    recipientId: string, 
    analystId: string, 
    reason: string
  ): OsintDistributionRecipient {
    const recipient = this.getRecipientById(recipientId);
    if (!recipient) throw new Error(`Destinataire introuvable : ${recipientId}`);
    
    const before = recipient.status;
    recipient.status = recipient.status === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    recipient.updatedAt = new Date().toISOString();

    return this.saveRecipient(
      recipient, 
      analystId, 
      `${reason} (Statut modifié de ${before} à ${recipient.status})`
    );
  }

  // =========================================================================
  // GROUPES DE DIFFUSION (Section 4)
  // =========================================================================
  public getGroups(filter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): OsintDistributionGroup[] {
    const stored = safeGetItem(STORAGE_KEYS.GROUPS);
    let groups: OsintDistributionGroup[] = [];
    if (!stored) {
      groups = [...INITIAL_GROUPS];
      safeSetItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    } else {
      try {
        groups = JSON.parse(stored);
      } catch {
        groups = [...INITIAL_GROUPS];
      }
    }

    if (filter === 'DEMO') return groups.filter(g => g.isDemo);
    if (filter === 'REAL') return groups.filter(g => !g.isDemo);
    return groups;
  }

  public getGroupById(groupId: string): OsintDistributionGroup | undefined {
    const groups = this.getGroups('ALL');
    return groups.find(g => g.groupId === groupId);
  }

  public saveGroup(
    group: OsintDistributionGroup, 
    analystId: string, 
    reason = "Enregistrement groupe de diffusion"
  ): OsintDistributionGroup {
    const groups = this.getGroups('ALL');
    const existingIndex = groups.findIndex(g => g.groupId === group.groupId);
    const now = new Date().toISOString();
    let action = 'GROUP_CREATED';

    if (existingIndex >= 0) {
      group.updatedAt = now;
      groups[existingIndex] = group;
      action = 'GROUP_UPDATED';
    } else {
      group.createdAt = group.createdAt || now;
      group.updatedAt = now;
      groups.push(group);
    }

    safeSetItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));

    this.logAudit({
      analystId,
      action,
      entityId: group.groupId,
      justification: reason,
      provenance: group.provenance,
      isDemo: group.isDemo
    });

    return group;
  }

  // =========================================================================
  // CONTRÔLES AVANT DIFFUSION & CHECKLIST (Section 7)
  // =========================================================================
  public verifyPreDistributionChecklist(
    noteId: string,
    recipientId?: string,
    groupId?: string
  ): {
    allowed: boolean;
    errors: string[];
    checklist: OsintPreDistributionChecklist;
  } {
    const note = intelligenceNoteService.getNoteById(noteId);
    const errors: string[] = [];

    if (!note) {
      errors.push('La note spécifiée est introuvable.');
      return {
        allowed: false,
        errors,
        checklist: {
          noteValidated: false,
          levelApproved: false,
          recipientDesignated: false,
          diffuserIdentified: false,
          provenanceVerified: false,
          sourcesVerified: false,
          contradictionsAddressed: false,
          hypothesesAttached: false,
          unconfirmedSeparated: false,
          conclusionPresent: false,
          restrictionsFormalized: false,
          validityDefined: false
        }
      };
    }

    // Contrôle doctrinal absolu : note VALIDEE ou DIFFUSABLE
    const isNoteValidated = note.status === 'VALIDEE' || note.status === 'DIFFUSABLE';
    if (!isNoteValidated) {
      errors.push(`Contrôle doctrinal bloquant : La note est au statut '${note.status}'. Seule une note 'VALIDEE' ou 'DIFFUSABLE' peut être diffusée. Les statuts BROUILLON, EN_ELABORATION, EN_REVISION et A_VALIDER sont strictement bloqués.`);
    }

    // Destinataire ou groupe désigné
    const hasRecipientOrGroup = Boolean(recipientId || groupId);
    if (!hasRecipientOrGroup) {
      errors.push('Aucun destinataire ou groupe de diffusion valide n a été désigné.');
    }

    // Sources présentes et tracées
    const hasSources = (note.sources && note.sources.length > 0) || (note.sourceCount > 0);
    if (!hasSources) {
      errors.push('Absence de source répertoriée dans la note.');
    }

    // Conclusion générale présente
    const hasConclusion = Boolean(note.overallConclusion && note.overallConclusion.keyTakeaways);
    if (!hasConclusion) {
      errors.push('La conclusion générale de renseignement est incomplète ou absente.');
    }

    // Hypothèses attachées
    const hasHypotheses = (note.hypotheses && note.hypotheses.length > 0) || Boolean(note.overallConclusion?.dominantHypothesis);

    const checklist: OsintPreDistributionChecklist = {
      noteValidated: isNoteValidated,
      levelApproved: true,
      recipientDesignated: hasRecipientOrGroup,
      diffuserIdentified: true,
      provenanceVerified: Boolean(note.provenance),
      sourcesVerified: hasSources,
      contradictionsAddressed: (note.contradictionCount || 0) >= 0,
      hypothesesAttached: hasHypotheses,
      unconfirmedSeparated: Array.isArray(note.unconfirmedInformation),
      conclusionPresent: hasConclusion,
      restrictionsFormalized: true,
      validityDefined: true
    };

    return {
      allowed: errors.length === 0,
      errors,
      checklist
    };
  }

  // =========================================================================
  // GESTION DES DIFFUSIONS (Section 6, 8, 9)
  // =========================================================================
  public getDistributions(filter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): OsintDistribution[] {
    const stored = safeGetItem(STORAGE_KEYS.DISTRIBUTIONS);
    let distributions: OsintDistribution[] = [];
    if (stored) {
      try {
        distributions = JSON.parse(stored);
      } catch {
        distributions = [];
      }
    }

    if (filter === 'DEMO') return distributions.filter(d => d.isDemo);
    if (filter === 'REAL') return distributions.filter(d => !d.isDemo);
    return distributions;
  }

  public getDistributionById(distributionId: string): OsintDistribution | undefined {
    const list = this.getDistributions('ALL');
    return list.find(d => d.distributionId === distributionId);
  }

  public saveDistribution(
    dist: OsintDistribution, 
    analystId: string, 
    actionName: string, 
    reason: string
  ): OsintDistribution {
    const list = this.getDistributions('ALL');
    const existingIndex = list.findIndex(d => d.distributionId === dist.distributionId);
    const now = new Date().toISOString();

    dist.updatedAt = now;
    if (existingIndex >= 0) {
      list[existingIndex] = dist;
    } else {
      dist.createdAt = dist.createdAt || now;
      list.push(dist);
    }

    safeSetItem(STORAGE_KEYS.DISTRIBUTIONS, JSON.stringify(list));

    this.logAudit({
      analystId,
      action: actionName,
      entityId: dist.distributionId,
      justification: reason,
      provenance: dist.provenance,
      isDemo: dist.isDemo
    });

    return dist;
  }

  /**
   * Créer une diffusion après passage obligatoire de la checklist
   */
  public createDistribution(params: {
    noteId: string;
    recipientId?: string;
    groupId?: string;
    distributionLevel: OsintDistributionLevel;
    distributedBy: string;
    justification: string;
    restrictions?: string;
    scheduledFor?: string;
    expirationDate?: string;
    acknowledgmentRequired?: boolean;
    autoSendImmediately?: boolean;
  }): OsintDistribution {
    const {
      noteId,
      recipientId,
      groupId,
      distributionLevel,
      distributedBy,
      justification,
      restrictions = "Usage interne strictement réservé aux destinataires autorisés.",
      scheduledFor,
      expirationDate,
      acknowledgmentRequired = true,
      autoSendImmediately = false
    } = params;

    // 1. Contrôles pré-diffusion obligatoires
    const check = this.verifyPreDistributionChecklist(noteId, recipientId, groupId);
    if (!check.allowed) {
      throw new Error(`Échec du contrôle pré-diffusion : ${check.errors.join(' | ')}`);
    }

    const note = intelligenceNoteService.getNoteById(noteId)!;

    // Détermination du statut initial
    let status: OsintDistributionStatus = 'A_DIFFUSER';
    let distributedAt: string | undefined = undefined;

    if (scheduledFor) {
      status = 'DIFFUSION_PLANIFIEE';
    } else if (autoSendImmediately) {
      status = 'DIFFUSEE';
      distributedAt = new Date().toISOString();
    }

    const newDist: OsintDistribution = {
      distributionId: `dist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      noteId,
      recipientId,
      groupId,
      distributionLevel,
      status,
      distributedAt,
      scheduledFor,
      distributedBy,
      justification,
      restrictions,
      expirationDate,
      acknowledgmentRequired,
      provenance: note.provenance,
      isDemo: note.isDemo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const action = status === 'DIFFUSEE' ? 'DISTRIBUTION_SENT' : (status === 'DIFFUSION_PLANIFIEE' ? 'DISTRIBUTION_SCHEDULED' : 'DISTRIBUTION_CREATED');
    return this.saveDistribution(newDist, distributedBy, action, justification);
  }

  /**
   * Planifier une diffusion
   */
  public scheduleDistribution(
    distributionId: string, 
    scheduledDate: string, 
    analystId: string, 
    justification: string
  ): OsintDistribution {
    const dist = this.getDistributionById(distributionId);
    if (!dist) throw new Error('Diffusion introuvable.');

    dist.scheduledFor = scheduledDate;
    dist.status = 'DIFFUSION_PLANIFIEE';
    return this.saveDistribution(dist, analystId, 'DISTRIBUTION_SCHEDULED', justification);
  }

  /**
   * Annuler une diffusion planifiée (DIFFUSION_PLANIFIEE -> ANNULEE)
   */
  public cancelScheduledDistribution(
    distributionId: string, 
    analystId: string, 
    justification: string
  ): OsintDistribution {
    const dist = this.getDistributionById(distributionId);
    if (!dist) throw new Error('Diffusion introuvable.');

    if (dist.status !== 'DIFFUSION_PLANIFIEE') {
      throw new Error(`Seule une diffusion au statut 'DIFFUSION_PLANIFIEE' peut être annulée (statut actuel : ${dist.status}).`);
    }

    dist.status = 'ANNULEE';
    return this.saveDistribution(dist, analystId, 'DISTRIBUTION_CANCELLED', justification);
  }

  /**
   * Émettre la diffusion (DIFFUSEE)
   */
  public sendDistribution(
    distributionId: string, 
    analystId: string, 
    justification: string
  ): OsintDistribution {
    const dist = this.getDistributionById(distributionId);
    if (!dist) throw new Error('Diffusion introuvable.');

    // Contrôle doctrinal : la note doit être VALIDEE ou DIFFUSABLE
    const note = intelligenceNoteService.getNoteById(dist.noteId);
    if (!note || (note.status !== 'VALIDEE' && note.status !== 'DIFFUSABLE')) {
      throw new Error(`Blocage doctrinal : La note ${dist.noteId} n est pas VALIDEE ou DIFFUSABLE.`);
    }

    dist.status = 'DIFFUSEE';
    dist.distributedAt = new Date().toISOString();
    return this.saveDistribution(dist, analystId, 'DISTRIBUTION_SENT', justification);
  }

  /**
   * Accusé de réception (Section 9)
   * Mention obligatoire : "Un accusé de réception ne signifie PAS que le destinataire approuve le contenu."
   */
  public acknowledgeDistribution(params: {
    distributionId: string;
    recipientId: string;
    status: 'ACCEPTE' | 'REFUSE';
    comment?: string;
    logicalSignature?: string;
    analystId: string;
  }): { distribution: OsintDistribution; acknowledgment: OsintDistributionAcknowledgment } {
    const { distributionId, recipientId, status, comment, logicalSignature, analystId } = params;
    const dist = this.getDistributionById(distributionId);
    if (!dist) throw new Error('Diffusion introuvable.');

    const now = new Date().toISOString();
    const ack: OsintDistributionAcknowledgment = {
      id: `ack-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      distributionId,
      noteId: dist.noteId,
      recipientId,
      timestamp: now,
      status,
      comment,
      logicalSignature: logicalSignature || `SIG-ACK-${Date.now()}`,
      provenance: dist.provenance,
      isDemo: dist.isDemo
    };

    // Sauvegarde de l'accusé
    const acks = this.getAcknowledgments('ALL');
    acks.unshift(ack);
    safeSetItem(STORAGE_KEYS.ACKNOWLEDGMENTS, JSON.stringify(acks));

    // Mise à jour de la distribution
    dist.acknowledgmentDate = now;
    if (status === 'ACCEPTE') {
      dist.status = 'ACCUSÉE_DE_RECEPTION';
    } else {
      dist.status = 'REFUSEE';
      dist.refusalReason = comment || 'Refus signifié par le destinataire';
    }

    const action = status === 'ACCEPTE' ? 'DISTRIBUTION_ACKNOWLEDGED' : 'DISTRIBUTION_REFUSED';
    const updatedDist = this.saveDistribution(dist, analystId, action, comment || `Accusé de réception enregistré (${status})`);

    return {
      distribution: updatedDist,
      acknowledgment: ack
    };
  }

  public getAcknowledgments(filter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): OsintDistributionAcknowledgment[] {
    const stored = safeGetItem(STORAGE_KEYS.ACKNOWLEDGMENTS);
    let list: OsintDistributionAcknowledgment[] = [];
    if (stored) {
      try {
        list = JSON.parse(stored);
      } catch {
        list = [];
      }
    }
    if (filter === 'DEMO') return list.filter(a => a.isDemo);
    if (filter === 'REAL') return list.filter(a => !a.isDemo);
    return list;
  }

  /**
   * Retrait contrôlé de diffusion (DIFFUSEE -> RETIREE)
   */
  public withdrawDistribution(
    distributionId: string, 
    analystId: string, 
    reason: string
  ): OsintDistribution {
    const dist = this.getDistributionById(distributionId);
    if (!dist) throw new Error('Diffusion introuvable.');

    dist.status = 'RETIREE';
    dist.withdrawalDate = new Date().toISOString();
    dist.withdrawalReason = reason;

    return this.saveDistribution(dist, analystId, 'DISTRIBUTION_WITHDRAWN', reason);
  }

  /**
   * Expiration de diffusion
   */
  public expireDistribution(
    distributionId: string, 
    analystId: string, 
    reason = "Expiration de la durée de validité de diffusion"
  ): OsintDistribution {
    const dist = this.getDistributionById(distributionId);
    if (!dist) throw new Error('Diffusion introuvable.');

    dist.status = 'EXPIREE';
    return this.saveDistribution(dist, analystId, 'DISTRIBUTION_EXPIRED', reason);
  }

  // =========================================================================
  // ARCHIVAGE CONTRÔLÉ ET INTÈGRE (Section 10)
  // Conserve note, versions, validation, diffusions, accusés, retraits, audit
  // =========================================================================
  public archiveNoteRecord(
    noteId: string, 
    archivedBy: string, 
    justification: string
  ): OsintArchiveRecord {
    const note = intelligenceNoteService.getNoteById(noteId);
    if (!note) throw new Error(`Note introuvable : ${noteId}`);

    // Passage du statut de la note à ARCHIVEE dans le service LOT 31
    intelligenceNoteService.archiveNote(noteId, archivedBy, justification);

    // Extraction des instantanés complets
    const versions = intelligenceNoteService.getVersions(noteId);
    const validations = intelligenceNoteService.getValidations(noteId);
    const noteAudits = intelligenceNoteService.getAuditLogs().filter(a => a.entityId === noteId);
    const distributions = this.getDistributionsByNoteId(noteId);
    const acknowledgments = this.getAcknowledgmentsByNoteId(noteId);
    const distAudits = this.getAuditLogs().filter(a => a.entityId === noteId || distributions.some(d => d.distributionId === a.entityId));

    const archiveRecord: OsintArchiveRecord = {
      archiveId: `arch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      noteId,
      archivedAt: new Date().toISOString(),
      archivedBy,
      justification,
      noteSnapshot: JSON.parse(JSON.stringify(note)),
      versionsSnapshot: JSON.parse(JSON.stringify(versions)),
      validationsSnapshot: JSON.parse(JSON.stringify(validations)),
      distributionsSnapshot: JSON.parse(JSON.stringify(distributions)),
      acknowledgmentsSnapshot: JSON.parse(JSON.stringify(acknowledgments)),
      auditSnapshot: [...noteAudits, ...distAudits],
      provenance: note.provenance,
      isDemo: note.isDemo
    };

    const archives = this.getArchives('ALL');
    archives.unshift(archiveRecord);
    safeSetItem(STORAGE_KEYS.ARCHIVE, JSON.stringify(archives));

    this.logAudit({
      analystId: archivedBy,
      action: 'NOTE_ARCHIVED',
      entityId: noteId,
      justification,
      provenance: note.provenance,
      isDemo: note.isDemo
    });

    return archiveRecord;
  }

  public getArchives(filter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): OsintArchiveRecord[] {
    const stored = safeGetItem(STORAGE_KEYS.ARCHIVE);
    let list: OsintArchiveRecord[] = [];
    if (stored) {
      try {
        list = JSON.parse(stored);
      } catch {
        list = [];
      }
    }
    if (filter === 'DEMO') return list.filter(a => a.isDemo);
    if (filter === 'REAL') return list.filter(a => !a.isDemo);
    return list;
  }

  public getArchiveByNoteId(noteId: string): OsintArchiveRecord | undefined {
    const list = this.getArchives('ALL');
    return list.find(a => a.noteId === noteId);
  }

  public getArchiveById(archiveId: string): OsintArchiveRecord | undefined {
    const list = this.getArchives('ALL');
    return list.find(a => a.archiveId === archiveId);
  }

  /**
   * Blocage formel de modification directe d'une archive
   */
  public attemptDirectArchiveModification(archiveId: string): never {
    throw new Error(`Règle d'intégrité absolue : Une note archivée (${archiveId}) ne peut pas être modifiée directement. Toute révision doit obligatoirement passer par le mécanisme de versionnage du LOT 31.`);
  }

  // =========================================================================
  // TRAÇABILITÉ BIDIRECTIONNELLE (Section 11)
  // Note <-> Distribution, Note <-> Destinataire, Note <-> Accusé, Note <-> Archive
  // =========================================================================
  public getDistributionsByNoteId(noteId: string): OsintDistribution[] {
    return this.getDistributions('ALL').filter(d => d.noteId === noteId);
  }

  public getNoteByDistributionId(distributionId: string): OsintIntelligenceNote | undefined {
    const dist = this.getDistributionById(distributionId);
    if (!dist) return undefined;
    return intelligenceNoteService.getNoteById(dist.noteId);
  }

  public getRecipientsByNoteId(noteId: string): OsintDistributionRecipient[] {
    const distributions = this.getDistributionsByNoteId(noteId);
    const recipientIds = new Set<string>();

    distributions.forEach(d => {
      if (d.recipientId) recipientIds.add(d.recipientId);
      if (d.groupId) {
        const group = this.getGroupById(d.groupId);
        if (group) {
          group.members.forEach(m => recipientIds.add(m));
        }
      }
    });

    const allRecipients = this.getRecipients('ALL');
    return allRecipients.filter(r => recipientIds.has(r.recipientId));
  }

  public getNotesByRecipientId(recipientId: string): OsintIntelligenceNote[] {
    const distributions = this.getDistributions('ALL').filter(d => {
      if (d.recipientId === recipientId) return true;
      if (d.groupId) {
        const group = this.getGroupById(d.groupId);
        return group ? group.members.includes(recipientId) : false;
      }
      return false;
    });

    const noteIds = Array.from(new Set(distributions.map(d => d.noteId)));
    return noteIds.map(nid => intelligenceNoteService.getNoteById(nid)).filter((n): n is OsintIntelligenceNote => Boolean(n));
  }

  public getAcknowledgmentsByNoteId(noteId: string): OsintDistributionAcknowledgment[] {
    return this.getAcknowledgments('ALL').filter(a => a.noteId === noteId);
  }

  public getNoteByAcknowledgmentId(acknowledgmentId: string): OsintIntelligenceNote | undefined {
    const ack = this.getAcknowledgments('ALL').find(a => a.id === acknowledgmentId);
    if (!ack) return undefined;
    return intelligenceNoteService.getNoteById(ack.noteId);
  }

  public getNoteByArchiveId(archiveId: string): OsintIntelligenceNote | undefined {
    const arch = this.getArchiveById(archiveId);
    if (!arch) return undefined;
    return intelligenceNoteService.getNoteById(arch.noteId) || arch.noteSnapshot;
  }

  // =========================================================================
  // EXPORT JSON LOCAL (Section 16)
  // =========================================================================
  public exportDistributionDataJson(filter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): string {
    const exportObject = {
      meta: {
        exportedAt: new Date().toISOString(),
        lot: 'LOT 32 — CENTRE DE DIFFUSION CONTRÔLÉE, SUIVI ET ARCHIVAGE',
        filter,
        system: 'OSINT AFRICA - Plateforme Libre',
        networkConnections: 0
      },
      doctrinalNotice: [
        "Une diffusion n'est pas une validation analytique.",
        "Un accusé de réception ne signifie pas que le destinataire approuve le contenu.",
        "Une hypothèse ne doit jamais être présentée comme un fait établi.",
        "Une information non confirmée conserve son statut.",
        "La diffusion ne modifie pas le niveau de confiance.",
        "La diffusion ne constitue pas une attribution automatique."
      ],
      recipients: this.getRecipients(filter),
      groups: this.getGroups(filter),
      distributions: this.getDistributions(filter),
      acknowledgments: this.getAcknowledgments(filter),
      archives: this.getArchives(filter),
      auditTrail: this.getAuditLogs().filter(a => filter === 'ALL' || (filter === 'DEMO' ? a.isDemo : !a.isDemo))
    };

    return JSON.stringify(exportObject, null, 2);
  }

  // =========================================================================
  // STATISTIQUES & KPIS SÉPARÉS REAL / DEMO (Section 8 & 14)
  // =========================================================================
  public getStats(isDemo: boolean) {
    const filter = isDemo ? 'DEMO' : 'REAL';
    const allNotes = intelligenceNoteService.getNotes(filter);
    const diffusables = allNotes.filter(n => n.status === 'DIFFUSABLE' || n.status === 'VALIDEE');
    const distributions = this.getDistributions(filter);
    const planned = distributions.filter(d => d.status === 'DIFFUSION_PLANIFIEE');
    const sent = distributions.filter(d => d.status === 'DIFFUSEE' || d.status === 'ACCUSÉE_DE_RECEPTION');
    const acknowledged = distributions.filter(d => d.status === 'ACCUSÉE_DE_RECEPTION');
    const withdrawn = distributions.filter(d => d.status === 'RETIREE');
    const archived = this.getArchives(filter);
    const activeRecipients = this.getRecipients(filter).filter(r => r.status === 'ACTIF');

    return {
      diffusableNotesCount: diffusables.length,
      scheduledDistributionsCount: planned.length,
      sentDistributionsCount: sent.length,
      acknowledgedDistributionsCount: acknowledged.length,
      withdrawnDistributionsCount: withdrawn.length,
      archivedNotesCount: archived.length,
      activeRecipientsCount: activeRecipients.length,
      isDemo
    };
  }
}

export const distributionService = new DistributionService();
