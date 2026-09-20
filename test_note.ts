import { intelligenceNoteService } from './src/services/intelligenceNoteService';
import { OsintIntelligenceNote } from './src/types';

// 1. Création d'une note (BROUILLON)
const newNote: Partial<OsintIntelligenceNote> = {
  id: 'test-note-1',
  title: 'Test Note',
  reference: 'REF-001',
  noteType: 'NOTE DE RENSEIGNEMENT',
  status: 'BROUILLON',
  isDemo: false
};

const savedNote = intelligenceNoteService.saveNote(newNote as OsintIntelligenceNote, 'Analyst1', 'Création');
console.log('1. Created:', savedNote.status, savedNote.id);

// 2. Demande de validation (A_VALIDER n'est pas utilisé tel quel par validateNote pour une demande simple ?)
try {
  intelligenceNoteService.validateNote({
    noteId: savedNote.id!,
    analystId: 'Analyst2',
    decision: 'APPROUVER',
    justification: 'Looks good',
    confidence: 'ÉLEVÉ',
    checklist: {},
    logicalSignature: 'SIG1',
    isDemo: false
  });
  const validatedNote = intelligenceNoteService.getNoteById(savedNote.id!);
  console.log('2. Validated:', validatedNote?.status);
} catch (e: any) {
  console.log('Error validating:', e.message);
}

// 3. Versions
const version = intelligenceNoteService.createVersion(savedNote.id!, 'Analyst1', 'V1 saved');
console.log('3. Version created:', version.versionNumber);

// 4. Audit
const audits = intelligenceNoteService.getAuditLogs();
console.log('4. Audits count:', audits.length);
console.log('Audit actions:', audits.slice(0, 4).map(a => a.action).join(', '));

