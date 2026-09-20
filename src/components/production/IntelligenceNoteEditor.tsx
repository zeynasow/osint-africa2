import React, { useState, useEffect } from 'react';
import { 
  X, Save, FileText, CheckCircle, ShieldCheck, 
  Eye, GitCommit, Search, Plus, Trash2, AlertTriangle, Archive, Send
} from 'lucide-react';
import { UseOsintViewModelReturn } from '../../viewmodels/useOsintViewModel';
import { OsintIntelligenceNote, OsintNoteStatus, OsintNoteConfidence } from '../../types';
import { intelligenceNoteService } from '../../services/intelligenceNoteService';

interface Props {
  vm: UseOsintViewModelReturn;
  noteId: string | null;
  onClose: () => void;
}

export const IntelligenceNoteEditor: React.FC<Props> = ({ vm, noteId, onClose }) => {
  const [note, setNote] = useState<Partial<OsintIntelligenceNote>>({});
  const [activeTab, setActiveTab] = useState<'EDIT' | 'PREVIEW' | 'VALIDATION' | 'HISTORIQUE'>('EDIT');
  const [activeSection, setActiveSection] = useState<string>('identification');

  useEffect(() => {
    if (noteId) {
      const existing = intelligenceNoteService.getNoteById(noteId);
      if (existing) {
        setNote(existing);
      }
    } else {
      setNote({
        status: 'BROUILLON',
        noteType: 'NOTE DE RENSEIGNEMENT',
        classification: 'NON CLASSIFIÉ',
        confidence: 'NON ÉVALUÉ',
        qualityScore: {
          score: 0,
          completeness: false,
          traceability: false,
          sourceCoverage: false,
          contradictionCoverage: false,
          gapCoverage: false,
          conclusionPresent: false,
          structuralCoherence: false,
          validated: false
        },
        events: [],
        facts: [],
        reportedInformation: [],
        unconfirmedInformation: [],
        evidence: [],
        actors: [],
        contradictions: [],
        hypotheses: [],
        gaps: [],
        indicators: [],
        eventConclusions: [],
        overallConclusion: { id: '', currentSituation: '', keyTakeaways: '', uncertainties: '', gaps: '', watchIndicators: '' },
        analyticalAssessment: { id: '', established: '', notEstablished: '', trends: '', supportedHypotheses: [], uncertainties: '', limitations: '', missingInfo: '' },
        recommendations: [],
        limitations: [],
        sourceCount: 0,
        independentSourceCount: 0,
        evidenceCount: 0,
        contradictionCount: 0,
        gapCount: 0,
        isDemo: true,
        provenance: 'USER_CREATED'
      });
    }
  }, [noteId]);

  const handleChange = (field: keyof OsintIntelligenceNote, value: any) => {
    setNote(prev => {
      const updated = { ...prev, [field]: value };
      updated.qualityScore = intelligenceNoteService.getQualityScore(updated);
      return updated;
    });
  };

  const handleSave = () => {
    if (!note.title) return;
    
    if (!note.reference) {
      note.reference = `OSINT-AFRICA-${new Date().getFullYear()}-N${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
    
    const saved = intelligenceNoteService.saveNote(
      note as OsintIntelligenceNote, 
      vm.userProfile?.name || 'Analyste', 
      'Sauvegarde manuelle'
    );
    setNote(saved);
  };

  const handleExportJSON = () => {
    if (!note.id) return;
    const json = intelligenceNoteService.exportNoteJson(note.id, vm.userProfile?.name || 'Analyste');
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.reference || 'export'}.json`;
    a.click();
  };

  const [justification, setJustification] = useState('');
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [checklist, setChecklist] = useState({
    sources: true,
    uncertainty: true,
    hypotheses: true,
    conclusion: true
  });

  const handleStartElaboration = () => {
    try {
      setWorkflowError(null);
      const updated = intelligenceNoteService.startElaboration(note.id, vm.userProfile?.name || 'Analyste', justification || 'Début d\'élaboration');
      setNote({ ...updated });
    } catch (e: any) {
      setWorkflowError(e.message);
    }
  };

  const handleSendToRevision = () => {
    try {
      setWorkflowError(null);
      const updated = intelligenceNoteService.sendToRevision(note.id, vm.userProfile?.name || 'Analyste', justification || 'Mise en révision pour relecture');
      setNote({ ...updated });
    } catch (e: any) {
      setWorkflowError(e.message);
    }
  };

  const handleSubmitForValidation = () => {
    try {
      setWorkflowError(null);
      const updated = intelligenceNoteService.submitForValidation(note.id, vm.userProfile?.name || 'Analyste', justification || 'Soumission pour validation hiérarchique');
      setNote({ ...updated });
    } catch (e: any) {
      setWorkflowError(e.message);
    }
  };

  const handleApprove = () => {
    try {
      setWorkflowError(null);
      intelligenceNoteService.validateNote({
        noteId: note.id,
        analystId: vm.userProfile?.name || 'Analyste',
        decision: 'APPROUVER',
        justification: justification || 'Validation conforme aux critères méthodologiques',
        confidence: note.confidence || 'MOYEN',
        checklist: { ...checklist },
        logicalSignature: `SIG-APP-${Date.now()}`,
        isDemo: !!note.isDemo
      });
      const updated = intelligenceNoteService.getNoteById(note.id);
      if (updated) setNote({ ...updated });
    } catch (e: any) {
      setWorkflowError(e.message);
    }
  };

  const handleReject = () => {
    try {
      setWorkflowError(null);
      intelligenceNoteService.validateNote({
        noteId: note.id,
        analystId: vm.userProfile?.name || 'Analyste',
        decision: 'REJETER',
        justification: justification || 'Rejet motivé par insuffisance de sources',
        confidence: note.confidence || 'FAIBLE',
        checklist: { ...checklist },
        logicalSignature: `SIG-REJ-${Date.now()}`,
        isDemo: !!note.isDemo
      });
      const updated = intelligenceNoteService.getNoteById(note.id);
      if (updated) setNote({ ...updated });
    } catch (e: any) {
      setWorkflowError(e.message);
    }
  };

  const handleRequestCorrection = () => {
    try {
      setWorkflowError(null);
      intelligenceNoteService.validateNote({
        noteId: note.id,
        analystId: vm.userProfile?.name || 'Analyste',
        decision: 'DEMANDER_CORRECTION',
        justification: justification || 'Demande de corrections sur les hypothèses',
        confidence: note.confidence || 'MOYEN',
        checklist: { ...checklist },
        logicalSignature: `SIG-CORR-${Date.now()}`,
        isDemo: !!note.isDemo
      });
      const updated = intelligenceNoteService.getNoteById(note.id);
      if (updated) setNote({ ...updated });
    } catch (e: any) {
      setWorkflowError(e.message);
    }
  };

  const handleMarkDiffusable = () => {
    try {
      setWorkflowError(null);
      const updated = intelligenceNoteService.markDiffusable(note.id, vm.userProfile?.name || 'Analyste', justification || 'Marquage en diffusion autorisé');
      setNote({ ...updated });
    } catch (e: any) {
      setWorkflowError(e.message);
    }
  };

  const handleArchive = () => {
    try {
      setWorkflowError(null);
      const updated = intelligenceNoteService.archiveNote(note.id, vm.userProfile?.name || 'Analyste', justification || 'Archivage de la note');
      setNote({ ...updated });
    } catch (e: any) {
      setWorkflowError(e.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 absolute inset-0 z-50">
      <div className="h-16 border-b border-slate-700/50 bg-slate-800/80 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-white">{note.reference || 'Nouvelle Note'}</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">{note.noteType}</span>
              <span className="text-slate-600">•</span>
              <span className={`px-1.5 py-0.5 rounded font-medium border ${
                note.status === 'VALIDEE' || note.status === 'DIFFUSABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                note.status === 'EN_REVISION' || note.status === 'A_VALIDER' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-slate-700 text-slate-300 border-slate-600'
              }`}>{note.status}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-1 max-w-md mx-8">
          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700/50 w-full">
            <button
              onClick={() => setActiveTab('EDIT')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-2 ${activeTab === 'EDIT' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <FileText className="w-3.5 h-3.5" /> Rédaction
            </button>
            <button
              onClick={() => setActiveTab('PREVIEW')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-2 ${activeTab === 'PREVIEW' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Eye className="w-3.5 h-3.5" /> Aperçu
            </button>
            <button
              onClick={() => setActiveTab('VALIDATION')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-2 ${activeTab === 'VALIDATION' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Qualité & Validation
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg flex items-center gap-2"
          >
            Imprimer / PDF
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg flex items-center gap-2"
          >
            JSON
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" /> Sauvegarder
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {activeTab === 'EDIT' && (
          <>
            <div className="w-64 bg-slate-800/50 border-r border-slate-700/50 flex flex-col overflow-y-auto">
              <div className="p-4 border-b border-slate-700/50 font-medium text-sm text-slate-300">Sections</div>
              <button onClick={() => setActiveSection('identification')} className={`text-left px-4 py-3 text-sm font-medium border-l-2 ${activeSection === 'identification' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-transparent text-slate-400 hover:bg-slate-800'}`}>En-tête & Objet</button>
              <button onClick={() => setActiveSection('synthesis')} className={`text-left px-4 py-3 text-sm font-medium border-l-2 ${activeSection === 'synthesis' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-transparent text-slate-400 hover:bg-slate-800'}`}>Synthèse Exécutive</button>
              <button onClick={() => setActiveSection('facts')} className={`text-left px-4 py-3 text-sm font-medium border-l-2 ${activeSection === 'facts' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-transparent text-slate-400 hover:bg-slate-800'}`}>Faits & Informations</button>
              <button onClick={() => setActiveSection('events')} className={`text-left px-4 py-3 text-sm font-medium border-l-2 ${activeSection === 'events' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-transparent text-slate-400 hover:bg-slate-800'}`}>Chronologie & Événements</button>
              <button onClick={() => setActiveSection('analysis')} className={`text-left px-4 py-3 text-sm font-medium border-l-2 ${activeSection === 'analysis' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-transparent text-slate-400 hover:bg-slate-800'}`}>Appréciation Analytique</button>
              <button onClick={() => setActiveSection('conclusion')} className={`text-left px-4 py-3 text-sm font-medium border-l-2 ${activeSection === 'conclusion' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-transparent text-slate-400 hover:bg-slate-800'}`}>Conclusion Générale</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto space-y-6">
                {activeSection === 'identification' && (
                  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50">
                    <h3 className="text-lg font-medium text-white mb-4">En-tête & Objet</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Titre (Objet)</label>
                        <input 
                          type="text" 
                          value={note.title || ''} 
                          onChange={e => handleChange('title', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Type de note</label>
                          <select 
                            value={note.noteType || 'NOTE DE RENSEIGNEMENT'}
                            onChange={e => handleChange('noteType', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                          >
                            <option value="NOTE DE SITUATION">NOTE DE SITUATION</option>
                            <option value="NOTE DE RENSEIGNEMENT">NOTE DE RENSEIGNEMENT</option>
                            <option value="NOTE DE SYNTHÈSE">NOTE DE SYNTHÈSE</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Classification</label>
                          <select 
                            value={note.classification || 'NON CLASSIFIÉ'}
                            onChange={e => handleChange('classification', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                          >
                            <option value="NON CLASSIFIÉ">NON CLASSIFIÉ</option>
                            <option value="USAGE INTERNE">USAGE INTERNE</option>
                            <option value="RESTREINT">RESTREINT</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Périmètre Géographique</label>
                        <input 
                          type="text" 
                          value={note.geographicScope || ''} 
                          onChange={e => handleChange('geographicScope', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" 
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {activeSection === 'synthesis' && (
                  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50">
                    <h3 className="text-lg font-medium text-white mb-4">Synthèse Exécutive</h3>
                    <textarea 
                      value={note.executiveSummary || ''} 
                      onChange={e => handleChange('executiveSummary', e.target.value)}
                      rows={6}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500" 
                      placeholder="Résumé très court permettant au décideur de comprendre ce qui s’est passé, où, quand..."
                    />
                  </div>
                )}
                
                {activeSection === 'facts' && (
                  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Faits Établis
                      </h3>
                      <p className="text-xs text-slate-400 mb-3">Uniquement les faits suffisamment étayés.</p>
                      <textarea 
                        value={(note.facts || []).join('\n')} 
                        onChange={e => handleChange('facts', e.target.value.split('\n'))}
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500" 
                        placeholder="Chaque fait doit pouvoir être relié à sa source..."
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Informations Rapportées
                      </h3>
                      <p className="text-xs text-slate-400 mb-3">Informations nécessitant prudence ou confirmation.</p>
                      <textarea 
                        value={(note.reportedInformation || []).join('\n')} 
                        onChange={e => handleChange('reportedInformation', e.target.value.split('\n'))}
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500" 
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        Non Confirmé
                      </h3>
                      <p className="text-xs text-slate-400 mb-3">Éléments signalés mais sans corroboration minimale.</p>
                      <textarea 
                        value={(note.unconfirmedInformation || []).join('\n')} 
                        onChange={e => handleChange('unconfirmedInformation', e.target.value.split('\n'))}
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500" 
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Contradictions
                      </h3>
                      <p className="text-xs text-slate-400 mb-3">Divergences factuelles entre plusieurs sources.</p>
                      <textarea 
                        value={(note.contradictions || []).join('\n')} 
                        onChange={e => handleChange('contradictions', e.target.value.split('\n'))}
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>
                )}
                
                {activeSection === 'events' && (
                  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50">
                    <h3 className="text-lg font-medium text-white mb-4">Chronologie & Conclusions par Événement</h3>
                    {note.events?.length === 0 ? (
                      <div className="p-8 text-center bg-slate-900 rounded-lg border border-slate-700/50">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Plus className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-slate-400 text-sm">Aucun événement ajouté à la note.</p>
                        <button 
                          onClick={() => {
                            const newEvent = {
                              id: `evt-${Date.now()}`,
                              eventId: `ref-${Date.now()}`,
                              title: 'Nouvel événement',
                              summary: '',
                              analyticalConclusion: '',
                              confidence: 'MODÉRÉ' as any,
                              sourceIds: []
                            };
                            handleChange('events', [newEvent]);
                          }}
                          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium text-white transition-colors"
                        >
                          Associer des événements du LOT 12
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {note.events?.map((evt, idx) => (
                          <div key={idx} className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                            <h4 className="font-medium text-white mb-2">{evt.title}</h4>
                            <p className="text-sm text-slate-400 mb-3">{evt.summary}</p>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Conclusion Analytique Courte</label>
                            <textarea
                              value={evt.analyticalConclusion}
                              onChange={(e) => {
                                const newEvts = [...(note.events || [])];
                                newEvts[idx].analyticalConclusion = e.target.value;
                                handleChange('events', newEvts);
                              }}
                              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-white"
                              rows={2}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {activeSection === 'analysis' && (
                  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 space-y-4">
                    <h3 className="text-lg font-medium text-white mb-4">Appréciation Analytique</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Hypothèses</label>
                      <textarea 
                        value={(note.hypotheses || []).join('\n')} 
                        onChange={e => handleChange('hypotheses', e.target.value.split('\n'))}
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Tendances observées (Appréciation)</label>
                      <textarea 
                        value={note.analyticalAssessment?.trends || ''} 
                        onChange={e => handleChange('analyticalAssessment', { ...note.analyticalAssessment, trends: e.target.value })}
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Incertitudes</label>
                      <textarea 
                        value={note.analyticalAssessment?.uncertainties || ''} 
                        onChange={e => handleChange('analyticalAssessment', { ...note.analyticalAssessment, uncertainties: e.target.value })}
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Lacunes de renseignement</label>
                      <textarea 
                        value={(note.gaps || []).join('\n')} 
                        onChange={e => handleChange('gaps', e.target.value.split('\n'))}
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>
                )}
                
                {activeSection === 'conclusion' && (
                  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 space-y-4">
                    <h3 className="text-lg font-medium text-white mb-4">Conclusion Générale</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Situation actuelle</label>
                      <textarea 
                        value={note.overallConclusion?.currentSituation || ''} 
                        onChange={e => handleChange('overallConclusion', { ...note.overallConclusion, currentSituation: e.target.value })}
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Principaux enseignements</label>
                      <textarea 
                        value={note.overallConclusion?.keyTakeaways || ''} 
                        onChange={e => handleChange('overallConclusion', { ...note.overallConclusion, keyTakeaways: e.target.value })}
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'VALIDATION' && (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto">
              <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-white">Qualité Documentaire</h3>
                  <div className={`text-2xl font-bold ${note.qualityScore?.score && note.qualityScore.score > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {note.qualityScore?.score || 0}/100
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    {note.qualityScore?.completeness ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                    <span className="text-sm text-slate-300">Complétude structurelle</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {note.qualityScore?.traceability ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-rose-500" />}
                    <span className="text-sm text-slate-300">Traçabilité & Sources</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {note.qualityScore?.conclusionPresent ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                    <span className="text-sm text-slate-300">Conclusions par événement</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {note.qualityScore?.sourceCoverage ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                    <span className="text-sm text-slate-300">Croisement de sources indép.</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-300">
                    <span className="font-semibold">RAPPEL DOCTRINAL :</span> Le score de qualité de la note mesure uniquement la complétude documentaire, la traçabilité et le respect des normes analytiques. Il ne représente JAMAIS la vérité ou la probabilité d'une hypothèse.
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Workflow & Validation Humaine</h3>
                  <span className="px-2.5 py-1 text-xs rounded-full font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Statut actuel : {note.status}
                  </span>
                </div>

                <div className="mb-6 p-3 bg-slate-900/60 rounded-lg border border-slate-700/40 text-xs text-slate-300">
                  <p className="font-semibold text-slate-200 mb-1">Cycle de validation doctrinale :</p>
                  <p className="text-slate-400">
                    BROUILLON → EN_ELABORATION → EN_REVISION → A_VALIDER → VALIDEE → DIFFUSABLE → ARCHIVEE
                  </p>
                </div>

                {workflowError && (
                  <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm">
                    {workflowError}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Justification / Motif analytique (requis pour audit)
                  </label>
                  <textarea
                    rows={2}
                    value={justification}
                    onChange={e => setJustification(e.target.value)}
                    placeholder="Préciser le motif de la transition, les réserves ou la décision..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Critères doctrinaux de relecture */}
                <div className="space-y-3 mb-6 bg-slate-900/40 p-4 rounded-lg border border-slate-700/30">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Contrôle de conformité analytique</p>
                  <label className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={checklist.sources}
                      onChange={e => setChecklist(c => ({ ...c, sources: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-900" 
                    />
                    <span className="text-sm text-slate-300">Les faits importants sont sourcés et vérifiés</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={checklist.uncertainty}
                      onChange={e => setChecklist(c => ({ ...c, uncertainty: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-900" 
                    />
                    <span className="text-sm text-slate-300">Les informations incertaines sont explicitement identifiées</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={checklist.hypotheses}
                      onChange={e => setChecklist(c => ({ ...c, hypotheses: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-900" 
                    />
                    <span className="text-sm text-slate-300">Les hypothèses sont rigoureusement séparées des faits</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={checklist.conclusion}
                      onChange={e => setChecklist(c => ({ ...c, conclusion: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-900" 
                    />
                    <span className="text-sm text-slate-300">La conclusion générale et les points d'alerte sont présents</span>
                  </label>
                </div>

                {/* Actions contextuelles selon statut */}
                <div className="space-y-3">
                  {note.status === 'BROUILLON' && (
                    <button 
                      onClick={handleStartElaboration} 
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors"
                    >
                      DÉMARRER L'ÉLABORATION (EN_ELABORATION)
                    </button>
                  )}

                  {note.status === 'EN_ELABORATION' && (
                    <div className="flex gap-3">
                      <button 
                        onClick={handleSubmitForValidation} 
                        className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-lg transition-colors"
                      >
                        SOUMETTRE À VALIDATION (A_VALIDER)
                      </button>
                      <button 
                        onClick={handleSendToRevision} 
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2.5 rounded-lg transition-colors"
                      >
                        METTRE EN RÉVISION (EN_REVISION)
                      </button>
                    </div>
                  )}

                  {note.status === 'EN_REVISION' && (
                    <div className="flex gap-3">
                      <button 
                        onClick={handleSubmitForValidation} 
                        className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-lg transition-colors"
                      >
                        SOUMETTRE À VALIDATION (A_VALIDER)
                      </button>
                      <button 
                        onClick={handleArchive} 
                        className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2.5 rounded-lg transition-colors"
                      >
                        ARCHIVER
                      </button>
                    </div>
                  )}

                  {note.status === 'A_VALIDER' && (
                    <div className="space-y-2">
                      <div className="flex gap-3">
                        <button 
                          onClick={handleApprove} 
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg transition-colors"
                        >
                          APPROUVER ET VALIDER LA NOTE (VALIDEE)
                        </button>
                        <button 
                          onClick={handleReject} 
                          className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-medium py-2.5 rounded-lg transition-colors"
                        >
                          REJETER (EN_REVISION)
                        </button>
                      </div>
                      <button 
                        onClick={handleRequestCorrection} 
                        className="w-full bg-slate-700 hover:bg-slate-600 text-amber-300 font-medium py-2 rounded-lg transition-colors text-sm"
                      >
                        DEMANDER DES CORRECTIONS (EN_REVISION)
                      </button>
                    </div>
                  )}

                  {note.status === 'VALIDEE' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
                        Cette note a fait l'objet d'une validation humaine explicite le {note.validatedAt ? new Date(note.validatedAt).toLocaleString('fr-FR') : 'récemment'}. Elle peut maintenant être mise en diffusion.
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={handleMarkDiffusable} 
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors"
                        >
                          MARQUER COMME DIFFUSABLE
                        </button>
                        <button 
                          onClick={handleSendToRevision} 
                          className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2.5 rounded-lg transition-colors"
                        >
                          RENVOYER EN RÉVISION
                        </button>
                        <button 
                          onClick={handleArchive} 
                          className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2.5 rounded-lg transition-colors"
                        >
                          ARCHIVER
                        </button>
                      </div>
                    </div>
                  )}

                  {note.status === 'DIFFUSABLE' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-300">
                        Cette note est autorisée à la diffusion externe / institutionnelle.
                      </div>
                      <button 
                        onClick={handleArchive} 
                        className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2.5 rounded-lg transition-colors"
                      >
                        ARCHIVER LA NOTE
                      </button>
                    </div>
                  )}

                  {note.status === 'ARCHIVEE' && (
                    <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-center text-xs text-slate-400">
                      Cette note est archivée. Son statut est terminal et le document est en lecture seule.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PREVIEW' && (
          <div className="flex-1 overflow-y-auto p-8 bg-slate-300 text-slate-900 font-serif">
            <div className="max-w-3xl mx-auto bg-white p-12 shadow-xl min-h-[1056px]">
              <div className="border-b-2 border-slate-900 pb-4 mb-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wider">{note.noteType}</h1>
                    <div className="text-sm text-slate-600 mt-1">RÉF: {note.reference}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold border border-slate-900 px-3 py-1 inline-block uppercase text-sm">
                      {note.classification}
                    </div>
                    <div className="text-sm text-slate-600 mt-2">{new Date(note.updatedAt || new Date()).toLocaleDateString()}</div>
                  </div>
                </div>
                <h2 className="text-xl font-bold mt-6">{note.title}</h2>
              </div>
              
              <div className="space-y-6">
                {note.executiveSummary && (
                  <section>
                    <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-2">Synthèse Exécutive</h3>
                    <p className="text-justify leading-relaxed">{note.executiveSummary}</p>
                  </section>
                )}
                
                {(note.facts && note.facts.length > 0) && (
                  <section>
                    <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-2 mt-6">Faits Établis</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {note.facts.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </section>
                )}
                
                {(note.overallConclusion?.currentSituation) && (
                  <section>
                    <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-2 mt-6">Conclusion</h3>
                    <p className="text-justify leading-relaxed">{note.overallConclusion.currentSituation}</p>
                    <p className="text-justify leading-relaxed mt-2">{note.overallConclusion.keyTakeaways}</p>
                  </section>
                )}
              </div>
              
              <div className="mt-16 pt-8 border-t border-slate-300 text-xs text-slate-500 flex justify-between">
                <span>Auteur : {note.analystId}</span>
                <span>OSINT AFRICA - CONFIDENTIALITÉ APPLICABLE</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
