import { 
  OsintIntelligenceNote, 
  OsintNoteValidation, 
  OsintNoteAudit, 
  OsintNoteVersion,
  OsintNoteType,
  OsintNoteStatus,
  OsintNoteSource
} from '../types';

const STORAGE_KEYS = {
  NOTES: 'OSINT_NOTES_LOT31',
  VERSIONS: 'OSINT_NOTE_VERSIONS_LOT31',
  VALIDATIONS: 'OSINT_NOTE_VALIDATIONS_LOT31',
  AUDIT: 'OSINT_NOTE_AUDIT_LOT31',
  TEMPLATES: 'OSINT_NOTE_TEMPLATES_LOT31'
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

class IntelligenceNoteService {
  private logAudit(entry: Omit<OsintNoteAudit, 'id' | 'timestamp'>) {
    try {
      const logs = this.getAuditLogs();
      const newEntry: OsintNoteAudit = {
        ...entry,
        id: `naud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString()
      };
      logs.unshift(newEntry);
      safeSetItem(STORAGE_KEYS.AUDIT, JSON.stringify(logs.slice(0, 1000)));
    } catch (e) {
      console.error('Erreur audit note:', e);
    }
  }

  public getAuditLogs(): OsintNoteAudit[] {
    const stored = safeGetItem(STORAGE_KEYS.AUDIT);
    return stored ? JSON.parse(stored) : [];
  }

  public getNotes(isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): OsintIntelligenceNote[] {
    const stored = safeGetItem(STORAGE_KEYS.NOTES);
    let items: OsintIntelligenceNote[] = stored ? JSON.parse(stored) : this.generateDemoNotes();
    if (!stored) safeSetItem(STORAGE_KEYS.NOTES, JSON.stringify(items));
    
    if (isDemoFilter === 'REAL') return items.filter(i => !i.isDemo);
    if (isDemoFilter === 'DEMO') return items.filter(i => i.isDemo);
    return items;
  }

  public getNoteById(id: string): OsintIntelligenceNote | undefined {
    return this.getNotes('ALL').find(n => n.id === id);
  }

  public canTransition(currentStatus: OsintNoteStatus, targetStatus: OsintNoteStatus): { allowed: boolean; reason?: string } {
    if (currentStatus === targetStatus) {
      return { allowed: true };
    }

    // Matrice stricte du workflow:
    // BROUILLON -> EN_ELABORATION
    // EN_ELABORATION -> EN_REVISION | A_VALIDER
    // EN_REVISION -> A_VALIDER | ARCHIVEE
    // A_VALIDER -> VALIDEE (uniquement via décision humaine APPROUVER) | EN_REVISION (via décision REJETER/DEMANDER_CORRECTION)
    // VALIDEE -> DIFFUSABLE (marquage diffusion explicite) | EN_REVISION (invalidation pour correction) | ARCHIVEE
    // DIFFUSABLE -> ARCHIVEE
    // ARCHIVEE -> aucune transition

    if (currentStatus === 'BROUILLON') {
      if (targetStatus === 'EN_ELABORATION') return { allowed: true };
      return { allowed: false, reason: "Depuis BROUILLON, seule la transition vers EN_ELABORATION est autorisée. Aucune validation directe n'est permise." };
    }

    if (currentStatus === 'EN_ELABORATION') {
      if (targetStatus === 'EN_REVISION' || targetStatus === 'A_VALIDER') return { allowed: true };
      return { allowed: false, reason: "Depuis EN_ELABORATION, la note peut uniquement passer en EN_REVISION ou être soumise A_VALIDER." };
    }

    if (currentStatus === 'EN_REVISION') {
      if (targetStatus === 'A_VALIDER' || targetStatus === 'ARCHIVEE') return { allowed: true };
      return { allowed: false, reason: "Depuis EN_REVISION, la note doit être soumise A_VALIDER après corrections, ou être ARCHIVEE." };
    }

    if (currentStatus === 'A_VALIDER') {
      if (targetStatus === 'VALIDEE' || targetStatus === 'EN_REVISION') return { allowed: true };
      return { allowed: false, reason: "Une note A_VALIDER ne peut être que VALIDEE (approbation) ou renvoyée EN_REVISION (rejet/correction)." };
    }

    if (currentStatus === 'VALIDEE') {
      if (targetStatus === 'DIFFUSABLE' || targetStatus === 'EN_REVISION' || targetStatus === 'ARCHIVEE') return { allowed: true };
      return { allowed: false, reason: "Depuis VALIDEE, la note peut être rendue DIFFUSABLE, renvoyée EN_REVISION ou ARCHIVEE." };
    }

    if (currentStatus === 'DIFFUSABLE') {
      if (targetStatus === 'ARCHIVEE') return { allowed: true };
      return { allowed: false, reason: "Depuis DIFFUSABLE, la note peut uniquement être ARCHIVEE." };
    }

    if (currentStatus === 'ARCHIVEE') {
      return { allowed: false, reason: "Le statut ARCHIVEE est terminal. Aucune modification de statut n'est permise." };
    }

    return { allowed: false, reason: `Transition interdite de ${currentStatus} vers ${targetStatus}` };
  }

  public changeStatus(noteId: string, targetStatus: OsintNoteStatus, analystId: string, justification: string): OsintIntelligenceNote {
    const note = this.getNoteById(noteId);
    if (!note) throw new Error('Note introuvable');

    if (targetStatus === 'VALIDEE') {
      throw new Error("Transition interdite : Le statut VALIDEE ne peut pas être appliqué directement. Il exige une décision de validation humaine explicite via validateNote() sur une note au statut 'A_VALIDER'.");
    }

    if (targetStatus === 'DIFFUSABLE' && note.status !== 'VALIDEE') {
      throw new Error(`Transition interdite : Une note doit impérativement être VALIDEE par un analyste avant de pouvoir être marquée DIFFUSABLE (statut actuel: ${note.status}).`);
    }

    const check = this.canTransition(note.status, targetStatus);
    if (!check.allowed) {
      throw new Error(check.reason || `Transition interdite de ${note.status} vers ${targetStatus}`);
    }

    const prevStatus = note.status;
    note.status = targetStatus;
    note.updatedAt = new Date().toISOString();

    if (targetStatus === 'DIFFUSABLE') {
      note.publishedAt = new Date().toISOString();
    }

    this.saveNote(note, analystId, justification);

    this.logAudit({
      analystId,
      action: `STATUS_CHANGED_${prevStatus}_TO_${targetStatus}`,
      entityId: note.id,
      reason: justification,
      isDemo: note.isDemo
    });

    return note;
  }

  public startElaboration(noteId: string, analystId: string, justification = "Début de la rédaction / élaboration de la note"): OsintIntelligenceNote {
    return this.changeStatus(noteId, 'EN_ELABORATION', analystId, justification);
  }

  public sendToRevision(noteId: string, analystId: string, justification = "Mise en révision pour relecture technique"): OsintIntelligenceNote {
    return this.changeStatus(noteId, 'EN_REVISION', analystId, justification);
  }

  public submitForValidation(noteId: string, analystId: string, justification = "Soumission pour validation hiérarchique"): OsintIntelligenceNote {
    return this.changeStatus(noteId, 'A_VALIDER', analystId, justification);
  }

  public markDiffusable(noteId: string, analystId: string, justification = "Mise en diffusion après validation humaine"): OsintIntelligenceNote {
    const note = this.getNoteById(noteId);
    if (!note) throw new Error('Note introuvable');
    if (note.status !== 'VALIDEE') {
      throw new Error(`Transition interdite : Seule une note au statut 'VALIDEE' peut être marquée DIFFUSABLE (statut actuel : ${note.status}). Une validation humaine préalable est requise.`);
    }
    note.status = 'DIFFUSABLE';
    note.publishedAt = new Date().toISOString();
    note.updatedAt = new Date().toISOString();
    this.saveNote(note, analystId, justification);
    this.logAudit({
      analystId,
      action: 'NOTE_MARKED_DIFFUSABLE',
      entityId: note.id,
      reason: justification,
      isDemo: note.isDemo
    });
    return note;
  }

  public archiveNote(noteId: string, analystId: string, justification = "Archivage de la note"): OsintIntelligenceNote {
    return this.changeStatus(noteId, 'ARCHIVEE', analystId, justification);
  }

  public saveNote(note: OsintIntelligenceNote, analystId: string, reason: string): OsintIntelligenceNote {
    const notes = this.getNotes('ALL');
    const existingIndex = notes.findIndex(n => n.id === note.id);
    
    const now = new Date().toISOString();
    let action = 'NOTE_CREATED';
    
    if (existingIndex >= 0) {
      const oldStatus = notes[existingIndex].status;
      note.updatedAt = now;
      notes[existingIndex] = note;
      action = oldStatus !== note.status ? `STATUS_CHANGED_${oldStatus}_TO_${note.status}` : 'NOTE_UPDATED';
    } else {
      note.createdAt = now;
      note.updatedAt = now;
      notes.push(note);
    }
    
    safeSetItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    
    this.logAudit({
      analystId,
      action,
      entityId: note.id,
      reason,
      isDemo: note.isDemo
    });
    
    return note;
  }

  public validateNote(validation: Omit<OsintNoteValidation, 'id' | 'timestamp'>): OsintNoteValidation {
    const notes = this.getNotes('ALL');
    const note = notes.find(n => n.id === validation.noteId);
    
    if (!note) throw new Error('Note introuvable');

    // RÈGLE FORMELLE DOCTRINALE : Seule une note au statut 'A_VALIDER' peut être validée ou rejetée
    if (note.status !== 'A_VALIDER') {
      throw new Error(`Transition interdite : La note '${note.reference || note.id}' est au statut '${note.status}'. Seule une note au statut 'A_VALIDER' peut être soumise à une décision de validation humaine explicite.`);
    }
    
    const newValidation: OsintNoteValidation = {
      ...validation,
      id: `val-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    const validations = this.getValidations();
    validations.push(newValidation);
    safeSetItem(STORAGE_KEYS.VALIDATIONS, JSON.stringify(validations));
    
    let newStatus: OsintNoteStatus = note.status;
    let action = 'VALIDATION_REQUESTED';
    
    switch(validation.decision) {
      case 'APPROUVER':
        newStatus = 'VALIDEE';
        note.validatedAt = newValidation.timestamp;
        note.reviewerId = validation.analystId;
        action = 'NOTE_APPROVED';
        break;
      case 'REJETER':
        newStatus = 'EN_REVISION';
        action = 'NOTE_REJECTED';
        break;
      case 'DEMANDER_CORRECTION':
        newStatus = 'EN_REVISION';
        action = 'CORRECTION_REQUESTED';
        break;
      case 'MAINTENIR_EN_REVISION':
        newStatus = 'EN_REVISION';
        action = 'REVIEW_STARTED';
        break;
    }
    
    note.status = newStatus;
    this.saveNote(note, validation.analystId, validation.justification);
    
    this.logAudit({
      analystId: validation.analystId,
      action,
      entityId: note.id,
      reason: validation.justification,
      isDemo: note.isDemo
    });
    
    return newValidation;
  }

  public getValidations(noteId?: string): OsintNoteValidation[] {
    const stored = safeGetItem(STORAGE_KEYS.VALIDATIONS);
    const validations: OsintNoteValidation[] = stored ? JSON.parse(stored) : [];
    if (noteId) return validations.filter(v => v.noteId === noteId);
    return validations;
  }

  public createVersion(noteId: string, authorId: string, reason: string): OsintNoteVersion {
    const note = this.getNoteById(noteId);
    if (!note) throw new Error('Note introuvable');
    
    const versions = this.getVersions(noteId);
    const newVersion: OsintNoteVersion = {
      id: `ver-${Date.now()}`,
      noteId,
      versionNumber: versions.length + 1,
      timestamp: new Date().toISOString(),
      authorId,
      reason,
      summary: `Version ${versions.length + 1} de la note`,
      status: note.status,
      data: JSON.parse(JSON.stringify(note))
    };
    
    const allVersions = this.getAllVersions();
    allVersions.push(newVersion);
    safeSetItem(STORAGE_KEYS.VERSIONS, JSON.stringify(allVersions));
    
    this.logAudit({
      analystId: authorId,
      action: 'VERSION_CREATED',
      entityId: note.id,
      reason,
      isDemo: note.isDemo
    });
    
    return newVersion;
  }

  private getAllVersions(): OsintNoteVersion[] {
    const stored = safeGetItem(STORAGE_KEYS.VERSIONS);
    return stored ? JSON.parse(stored) : [];
  }

  public getVersions(noteId: string): OsintNoteVersion[] {
    return this.getAllVersions().filter(v => v.noteId === noteId).sort((a, b) => b.versionNumber - a.versionNumber);
  }
  
  public getQualityScore(note: Partial<OsintIntelligenceNote>) {
    let score = 0;
    
    const completeness = !!(note.executiveSummary && note.situationOverview && note.subject);
    const traceability = !!(note.sourceCount && note.sourceCount > 0);
    const sourceCoverage = !!(note.independentSourceCount && note.independentSourceCount >= 2);
    const contradictionCoverage = !!(note.contradictionCount !== undefined && note.contradictionCount >= 0);
    const gapCoverage = !!(note.gapCount !== undefined && note.gapCount >= 0);
    const conclusionPresent = !!(note.overallConclusion?.currentSituation);
    const structuralCoherence = !!(note.events && note.events.length > 0);
    const validated = note.status === 'VALIDEE' || note.status === 'DIFFUSABLE';
    
    if (completeness) score += 20;
    if (traceability) score += 20;
    if (sourceCoverage) score += 15;
    if (contradictionCoverage) score += 10;
    if (gapCoverage) score += 10;
    if (conclusionPresent) score += 15;
    if (structuralCoherence) score += 10;
    
    return {
      score,
      completeness,
      traceability,
      sourceCoverage,
      contradictionCoverage,
      gapCoverage,
      conclusionPresent,
      structuralCoherence,
      validated
    };
  }

  // Traçabilité bidirectionnelle réelle
  public getNotesByEventId(eventId: string): OsintIntelligenceNote[] {
    return this.getNotes('ALL').filter(n => 
      n.events?.some(e => e.eventId === eventId || e.id === eventId)
    );
  }

  public getNotesBySourceId(sourceId: string): OsintIntelligenceNote[] {
    return this.getNotes('ALL').filter(n => 
      n.sources?.some(s => s.sourceId === sourceId || s.id === sourceId) ||
      n.events?.some(e => e.sourceIds?.includes(sourceId))
    );
  }

  public getNotesByEvidenceId(evidenceId: string): OsintIntelligenceNote[] {
    return this.getNotes('ALL').filter(n => 
      n.evidence?.some(ev => ev.evidenceId === evidenceId || ev.id === evidenceId)
    );
  }

  public getNotesByHypothesisId(hypothesisId: string): OsintIntelligenceNote[] {
    return this.getNotes('ALL').filter(n => 
      n.hypotheses?.some(h => (typeof h === 'string' ? h === hypothesisId : (h.hypothesisId === hypothesisId || h.id === hypothesisId)))
    );
  }

  public getNotesByContradictionId(contradictionId: string): OsintIntelligenceNote[] {
    return this.getNotes('ALL').filter(n => 
      n.contradictions?.some(c => (typeof c === 'string' ? c === contradictionId : (c.contradictionId === contradictionId || c.id === contradictionId)))
    );
  }

  public getNotesByGapId(gapId: string): OsintIntelligenceNote[] {
    return this.getNotes('ALL').filter(n => 
      n.gaps?.some(g => (typeof g === 'string' ? g === gapId : (g.gapId === gapId || g.id === gapId)))
    );
  }

  public exportNoteJson(noteId: string, analystId: string): string {
    const note = this.getNoteById(noteId);
    if (!note) throw new Error('Note introuvable');
    
    const exportData = {
      exportVersion: '1.0.0',
      applicationVersion: '31.0.0',
      generatedAt: new Date().toISOString(),
      note,
      versions: this.getVersions(noteId),
      validations: this.getValidations(noteId),
      audit: this.getAuditLogs().filter(a => a.entityId === noteId)
    };
    
    this.logAudit({
      analystId,
      action: 'NOTE_EXPORTED',
      entityId: noteId,
      reason: 'Export JSON',
      isDemo: note.isDemo
    });
    
    return JSON.stringify(exportData, null, 2);
  }

  private generateDemoNotes(): OsintIntelligenceNote[] {
    const notes: OsintIntelligenceNote[] = [];
    const now = new Date().toISOString();
    
    const statuses: OsintNoteStatus[] = [
      'BROUILLON',
      'EN_ELABORATION',
      'EN_REVISION',
      'A_VALIDER',
      'VALIDEE'
    ];

    for (let i = 1; i <= 5; i++) {
      const type: OsintNoteType = i % 2 === 0 ? 'NOTE DE SITUATION' : 'NOTE DE RENSEIGNEMENT';
      const status = statuses[i-1];
      
      const note: OsintIntelligenceNote = {
        id: `note-demo-${i}`,
        title: `Évolution d’une situation sécuritaire régionale - Zone ${i}`,
        reference: `OSINT-AFRICA-2026-N${i.toString().padStart(3, '0')}`,
        noteType: type,
        classification: 'NON CLASSIFIÉ',
        priority: i === 1 ? 'Critique' : 'Normale',
        status,
        subject: `Situation sécuritaire Zone ${i}`,
        geographicScope: `Zone ${i}`,
        temporalScope: 'Septembre 2026',
        createdAt: now,
        updatedAt: now,
        createdBy: 'System',
        analystId: 'Analyste Demo',
        validatedAt: status === 'VALIDEE' ? now : undefined,
        reviewerId: status === 'VALIDEE' ? 'Superviseur Renseignement' : undefined,
        
        executiveSummary: `Synthèse exécutive relative aux évolutions constatées en Zone ${i}. Les indicateurs concordent sur des flux inhabituels.`,
        keyJudgments: 'Jugements clés : risque de déstabilisation modéré à élevé sur les corridors de transit.',
        situationOverview: 'Présentation générale du contexte sous-régional et surveillance des axes stratégiques.',
        
        events: [
          {
            id: `evt-${i}-1`,
            eventId: `osint-evt-${i}-1`,
            title: `Incidents observés le ${i}/09/2026 en Zone ${i}`,
            summary: `Des mouvements logistiques inhabituels ont été détectés et corroborés.`,
            analyticalConclusion: 'Conclusion événementielle : les éléments confirment une activité anormale.',
            confidence: 'MOYEN',
            sourceIds: [`src-00${i}`, 'src-real-001']
          }
        ],
        sources: [
          {
            id: `nsrc-${i}-1`,
            sourceId: 'src-real-001',
            name: 'Agence de Presse Sénégalaise (APS)',
            date: now,
            type: 'Agence de presse',
            provenance: 'APS',
            confidence: 'ÉLEVÉ',
            isDemo: false
          },
          {
            id: `nsrc-${i}-2`,
            sourceId: `src-00${i}`,
            name: `Source Institutionnelle Démo ${i}`,
            date: now,
            type: 'Institutionnelle',
            provenance: 'DEMO',
            confidence: 'MOYEN',
            isDemo: true
          }
        ],
        facts: [`Fait 1 vérifié en Zone ${i}`, 'Fait 2 étayé par dépêche officielle.'],
        reportedInformation: ['Information rapportée non vérifiée par radio locale'],
        unconfirmedInformation: ['Rumeur concernant des mouvements nocturnes non confirmés'],
        
        evidence: [
          {
            id: `nev-${i}-1`,
            evidenceId: `evi-${i}01`,
            nature: 'DOCUMENT',
            date: now,
            relevance: 'DIRECTE',
            status: 'CONFIRMÉ',
            limitations: 'Sources ouvertes uniquement'
          }
        ],
        actors: [
          { id: `act-${i}-1`, name: `Acteur Surveillé Zone ${i}`, role: 'Opérateur de transit' }
        ],
        contradictions: [
          {
            id: `ncon-${i}-1`,
            contradictionId: `ctrd-${i}01`,
            description: `Divergence d\'estimation du volume de convois entre la source locale et la dépêche APS`,
            sourceAId: `src-00${i}`,
            sourceBId: 'src-real-001'
          }
        ],
        hypotheses: [
          {
            id: `nhyp-${i}-1`,
            hypothesisId: `hyp-${i}01`,
            label: `H${i}: Flux logistiques anormaux coordonnés en Zone ${i}`,
            confidence: 'MOYEN',
            statement: 'Hypothèse d\'une filière de transbordement non déclarée'
          }
        ],
        gaps: [
          {
            id: `ngap-${i}-1`,
            gapId: `gap-${i}01`,
            description: `Manque de confirmation sur le point d'embarquement maritime en Zone ${i}`,
            watchActionRequired: 'Veille renforcée sur flux AIS côtiers'
          }
        ],
        indicators: ['SIG-001', `IND-LOG-0${i}`],
        
        analyticalAssessment: {
          id: `ass-${i}`,
          established: 'Mouvements confirmés par 2 sources.',
          notEstablished: 'Intentions finales des commanditaires.',
          trends: 'Augmentation progressive de la fréquence.',
          supportedHypotheses: [`hyp-${i}01`],
          uncertainties: 'Origine précise du fret.',
          limitations: 'Veille en sources ouvertes uniquement.',
          missingInfo: 'Identité formelle du transporteur.'
        },
        eventConclusions: [
          {
            id: `evt-${i}-1`,
            eventId: `osint-evt-${i}-1`,
            title: `Incidents observés le ${i}/09/2026`,
            summary: `Des mouvements inhabituels ont été observés.`,
            analyticalConclusion: 'Conclusion : les éléments confirment une activité anormale.',
            confidence: 'MOYEN',
            sourceIds: [`src-00${i}`, 'src-real-001']
          }
        ],
        overallConclusion: {
          id: `conc-${i}`,
          currentSituation: 'Situation volatile sous surveillance active.',
          keyTakeaways: 'Risque de rupture de chaîne logistique sous-régionale.',
          dominantHypothesis: `hyp-${i}01`,
          uncertainties: 'Plusieurs incertitudes demeurent sur le commanditaire.',
          gaps: 'Besoin de corroboration satellitaire ou de capteurs de terrain.',
          watchIndicators: 'Surveiller les dépêches portuaires et les alertes côtières.'
        },
        recommendations: [
          'Renforcer la veille sur les corridors frontaliers.',
          'Croiser systématiquement avec les données maritimes ouvertes.'
        ],
        limitations: [
          'Sources ouvertes uniquement, absence de capteurs tactiques.'
        ],
        
        confidence: 'MOYEN',
        
        sourceCount: 2,
        independentSourceCount: 2,
        evidenceCount: 1,
        contradictionCount: 1,
        gapCount: 1,
        
        qualityScore: {
          score: 85,
          completeness: true,
          traceability: true,
          sourceCoverage: true,
          contradictionCoverage: true,
          gapCoverage: true,
          conclusionPresent: true,
          structuralCoherence: true,
          validated: status === 'VALIDEE'
        },
        
        isDemo: true,
        provenance: 'SCENARIO_DEMO'
      };
      
      notes.push(note);
    }
    
    return notes;
  }
}

export const intelligenceNoteService = new IntelligenceNoteService();
