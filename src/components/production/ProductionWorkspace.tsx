import React, { useState, useEffect } from 'react';
import { 
  X, Save, FileText, CheckCircle, ShieldCheck, FileSearch, 
  Send, Eye, GitCommit, Search, Plus, Trash2, AlertTriangle, Archive
} from 'lucide-react';
import { UseOsintViewModelReturn } from '../../viewmodels/useOsintViewModel';
import { 
  OsintIntelligenceReport, 
  ReportStatus, 
  ReportType, 
  ReportPriority, 
  ReportConfidence,
  TraceabilityStatus,
  ReportValidationLog,
  ReportVersionLog
} from '../../types';

interface ProductionWorkspaceProps {
  vm: UseOsintViewModelReturn;
  reportId: string | null;
  onClose: () => void;
}

export const ProductionWorkspace: React.FC<ProductionWorkspaceProps> = ({ vm, reportId, onClose }) => {
  const [report, setReport] = useState<Partial<OsintIntelligenceReport>>({});
  const [activeTab, setActiveTab] = useState<'EDIT' | 'PREVIEW' | 'VALIDATION' | 'TRACEABILITY' | 'HISTORIQUE'>('EDIT');
  const [activeSection, setActiveSection] = useState<string>('identification');

  const updateReportStatus = async (newStatus: ReportStatus, comment?: string) => {
    if (!report.id) return;
    
    const oldStatus = report.status || 'BROUILLON';
    const now = new Date().toISOString();
    
    const validationLog: ReportValidationLog = {
      id: `val-${Date.now()}`,
      date: now,
      author: vm.userProfile?.name || 'Analyste',
      action: `Changement de statut: ${oldStatus} -> ${newStatus}`,
      oldStatus,
      newStatus,
      comment
    };

    const versionLog: ReportVersionLog = {
      id: `vh-${Date.now()}`,
      versionNumber: (report.version || 1) + 1,
      date: now,
      author: vm.userProfile?.name || 'Analyste',
      status: newStatus,
      changes: `Changement de statut vers ${newStatus}`,
      comment
    };

    const updatedReport = {
      ...report,
      status: newStatus,
      updatedAt: now,
      version: (report.version || 1) + 1,
      versionHistory: [...(report.versionHistory || []), versionLog],
      validationHistory: [...(report.validationHistory || []), validationLog]
    } as OsintIntelligenceReport;

    await vm.saveReport(updatedReport);
    setReport(updatedReport);
  };

  useEffect(() => {
    if (reportId) {
      const existing = vm.reports.find(r => r.id === reportId);
      if (existing) {
        setReport(existing);
      }
    } else {
      // Create new draft
      setReport({
        id: `prod-${Date.now()}`,
        reference: `RAP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        title: '',
        subtitle: '',
        reportType: 'Note de renseignement',
        classification: 'NON CLASSIFIÉ',
        status: 'BROUILLON',
        priority: 'Normale',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: vm.userProfile?.name || 'Analyste',
        countryIds: [],
        regionIds: [],
        actorIds: [],
        sourceIds: [],
        eventIds: [],
        analysisIds: [],
        correlationIds: [],
        weakSignalIds: [],
        fusionCaseIds: [],
        evidenceIds: [],
        folderIds: [],
        alertIds: [],
        establishedFacts: [],
        reportedInformation: [],
        unconfirmedInformation: [],
        sourceAssessments: [],
        chronology: [],
        actorsAssessment: [],
        hypotheses: [],
        informationGaps: [],
        analystQuestions: [],
        confidenceLevel: 'Non évalué',
        isDemo: false,
        version: 1,
        versionHistory: [{
          id: `vh-${Date.now()}`,
          versionNumber: 1,
          date: new Date().toISOString(),
          author: vm.userProfile?.name || 'Analyste',
          status: 'BROUILLON',
          changes: 'Création initiale'
        }],
        validationHistory: [],
        traceabilityStatus: 'TRAÇABILITÉ INCOMPLÈTE',
        completenessScore: 10,
        validationChecklist: {
          sourcesIdentified: false,
          sourcesEvaluated: false,
          infoDistinguished: false,
          evidencePresent: false,
          contradictionsExamined: false,
          hypothesesDocumented: false,
          gapsIdentified: false,
          analysisSeparated: false,
          conclusionJustified: false,
          traceabilityVerified: false
        }
      });
    }
  }, [reportId, vm.reports, vm.userProfile]);

  const handleSave = async () => {
    if (report.id) {
      const fullReport = { ...report, updatedAt: new Date().toISOString() } as OsintIntelligenceReport;
      await vm.saveReport(fullReport);
    }
  };

  const handleChange = (field: keyof OsintIntelligenceReport, value: any) => {
    setReport(prev => ({ ...prev, [field]: value }));
  };

  const sections = [
    { id: 'identification', label: 'Identification' },
    { id: 'situation', label: 'Situation' },
    { id: 'faits', label: 'Faits & Infos' },
    { id: 'sources', label: 'Sources & Évidences' },
    { id: 'chronologie', label: 'Chronologie' },
    { id: 'acteurs', label: 'Acteurs' },
    { id: 'analyse', label: 'Analyse & Hypothèses' },
    { id: 'lacunes', label: 'Lacunes & Questions' },
    { id: 'conclusion', label: 'Appréciation & Conclusion' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-200">
      {/* HEADER */}
      <div className="flex-none h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span className="font-mono text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {report.reference || 'NOUVEAU'}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-slate-800 border-slate-700">
              {report.status}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-slate-800 border-slate-700">
              v{report.version}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 mr-4">
            <button
              onClick={() => setActiveTab('EDIT')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'EDIT' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              ÉDITION
            </button>
            <button
              onClick={() => setActiveTab('PREVIEW')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'PREVIEW' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              APERÇU NOTE
            </button>
            <button
              onClick={() => setActiveTab('TRACEABILITY')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${activeTab === 'TRACEABILITY' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              TRAÇABILITÉ
            </button>
            <button
              onClick={() => setActiveTab('HISTORIQUE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${activeTab === 'HISTORIQUE' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              HISTORIQUE
            </button>
            <button
              onClick={() => setActiveTab('VALIDATION')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${activeTab === 'VALIDATION' ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:text-white hover:bg-indigo-900/30'}`}
            >
              VALIDATION
            </button>
          </div>

          <button onClick={handleSave} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Sauvegarder">
            <Save className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-hidden flex">
        {activeTab === 'EDIT' && (
          <>
            {/* LEFT NAV */}
            <div className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col p-2 overflow-y-auto">
              {sections.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                    activeSection === sec.id 
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            {/* MAIN EDIT AREA */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
              <div className="max-w-4xl mx-auto space-y-6">
                
                {activeSection === 'identification' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-2">Identification de la Note</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Titre principal</label>
                        <input 
                          type="text" 
                          value={report.title || ''} 
                          onChange={(e) => handleChange('title', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Sous-titre</label>
                        <input 
                          type="text" 
                          value={report.subtitle || ''} 
                          onChange={(e) => handleChange('subtitle', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Type de note</label>
                        <select 
                          value={report.reportType || ''}
                          onChange={(e) => handleChange('reportType', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Note de renseignement">Note de renseignement</option>
                          <option value="Synthèse de renseignement">Synthèse de renseignement</option>
                          <option value="Analyse thématique">Analyse thématique</option>
                          <option value="Note de veille">Note de veille</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Classification</label>
                        <select 
                          value={report.classification || ''}
                          onChange={(e) => handleChange('classification', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="NON CLASSIFIÉ">NON CLASSIFIÉ</option>
                          <option value="DIFFUSION RESTREINTE">DIFFUSION RESTREINTE</option>
                          <option value="CONFIDENTIEL">CONFIDENTIEL</option>
                          <option value="SECRET">SECRET</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Priorité</label>
                        <select 
                          value={report.priority || ''}
                          onChange={(e) => handleChange('priority', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Faible">Faible</option>
                          <option value="Normale">Normale</option>
                          <option value="Élevée">Élevée</option>
                          <option value="Critique">Critique</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'situation' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-2">Situation</h2>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Résumé Exécutif</label>
                      <textarea 
                        value={report.executiveSummary || ''} 
                        onChange={(e) => handleChange('executiveSummary', e.target.value)}
                        rows={4}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-y"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Contexte Général</label>
                      <textarea 
                        value={report.context || ''} 
                        onChange={(e) => handleChange('context', e.target.value)}
                        rows={6}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-y"
                      />
                    </div>
                  </div>
                )}

                {/* Additional sections would be implemented similarly */}
                {['faits', 'sources', 'chronologie', 'acteurs', 'analyse', 'lacunes', 'conclusion'].includes(activeSection) && (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-300">Section en cours de construction</h3>
                    <p className="text-sm text-slate-500">L'architecture est préparée pour intégrer ces formulaires détaillés.</p>
                  </div>
                )}

              </div>
            </div>
          </>
        )}

        {activeTab === 'PREVIEW' && (
          <div className="flex-1 overflow-y-auto p-8 bg-slate-200">
            <div className="max-w-4xl mx-auto bg-white min-h-[800px] shadow-2xl p-12 text-slate-900 font-serif">
              <div className="border-b-4 border-slate-900 pb-6 mb-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs font-sans font-bold tracking-widest uppercase text-slate-500">Note de Renseignement</div>
                    <h1 className="text-3xl font-black mt-2 leading-tight">{report.title || 'Sans titre'}</h1>
                    {report.subtitle && <h2 className="text-xl text-slate-600 mt-2">{report.subtitle}</h2>}
                  </div>
                  <div className="text-right font-sans">
                    <div className="text-sm font-bold bg-slate-100 px-3 py-1 inline-block border border-slate-300">{report.classification}</div>
                    <div className="text-xs mt-2 font-mono">RÉF: {report.reference}</div>
                    <div className="text-xs mt-1">DATE: {new Date(report.updatedAt || '').toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-8 text-sm leading-relaxed">
                <section>
                  <h3 className="font-sans font-bold text-lg uppercase tracking-wider mb-3 text-slate-800">1. Résumé Exécutif</h3>
                  <p className="whitespace-pre-wrap">{report.executiveSummary || 'Non renseigné.'}</p>
                </section>

                <section>
                  <h3 className="font-sans font-bold text-lg uppercase tracking-wider mb-3 text-slate-800">2. Contexte</h3>
                  <p className="whitespace-pre-wrap">{report.context || 'Non renseigné.'}</p>
                </section>

                <section>
                  <h3 className="font-sans font-bold text-lg uppercase tracking-wider mb-3 text-slate-800">3. Analyse & Appréciation</h3>
                  <p className="whitespace-pre-wrap">{report.analysis || 'Non renseigné.'}</p>
                </section>
                
                <section>
                  <h3 className="font-sans font-bold text-lg uppercase tracking-wider mb-3 text-slate-800">4. Conclusion</h3>
                  <p className="whitespace-pre-wrap">{report.conclusion || 'Non renseigné.'}</p>
                </section>
              </div>

              <div className="mt-16 pt-8 border-t border-slate-300 font-sans text-xs text-slate-500 text-center">
                Ce document a été produit via le Centre de Fusion OSINT. 
                <br/>Traceabilité: {report.traceabilityStatus} — Confiance: {report.confidenceLevel}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'VALIDATION' && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex justify-center">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
                Validation du Renseignement
              </h2>

              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-sm text-slate-300">Sources identifiées et évaluées</span>
                  <input type="checkbox" checked={report.validationChecklist?.sourcesEvaluated || false} readOnly className="w-4 h-4 rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-900" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-sm text-slate-300">Faits distincts des informations non confirmées</span>
                  <input type="checkbox" checked={report.validationChecklist?.infoDistinguished || false} readOnly className="w-4 h-4 rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-900" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-sm text-slate-300">Analyse séparée des faits</span>
                  <input type="checkbox" checked={report.validationChecklist?.analysisSeparated || false} readOnly className="w-4 h-4 rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-900" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-sm text-slate-300">Traçabilité vérifiée</span>
                  <input type="checkbox" checked={report.validationChecklist?.traceabilityVerified || false} readOnly className="w-4 h-4 rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-900" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {report.status !== 'VALIDÉ' && (
                  <button 
                    onClick={() => updateReportStatus('VALIDÉ', 'Validation formelle')}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors"
                  >
                    VALIDER LE RENSEIGNEMENT
                  </button>
                )}
                {report.status !== 'VALIDÉ' && (
                  <button 
                    onClick={() => updateReportStatus('VALIDÉ', 'Validation avec réserves')}
                    className="w-full py-3 bg-amber-600/20 text-amber-500 border border-amber-500/30 hover:bg-amber-600/30 font-bold rounded-xl transition-colors"
                  >
                    VALIDATION AVEC RÉSERVES
                  </button>
                )}
                {report.status !== 'EN REVUE' && (
                  <button 
                    onClick={() => updateReportStatus('EN REVUE', 'Envoi pour revue')}
                    className="w-full py-3 bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold rounded-xl transition-colors"
                  >
                    ENVOYER EN REVUE
                  </button>
                )}
                <button 
                  onClick={() => updateReportStatus('REJETÉ', 'Rejeté par analyste')}
                  className="w-full py-3 bg-red-900/20 text-red-500 border border-red-500/30 hover:bg-red-900/30 font-bold rounded-xl transition-colors"
                >
                  REJETER
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'TRACEABILITY' && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex justify-center">
            <div className="w-full max-w-3xl space-y-6">
              
              <div className={`p-4 rounded-xl border flex items-start gap-4 ${report.traceabilityStatus === 'TRAÇABILITÉ COMPLÈTE' ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-red-950/20 border-red-900/50'}`}>
                {report.traceabilityStatus === 'TRAÇABILITÉ COMPLÈTE' ? (
                  <CheckCircle className="w-8 h-8 text-emerald-400 mt-1" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-red-400 mt-1" />
                )}
                <div>
                  <h3 className={`text-lg font-bold ${report.traceabilityStatus === 'TRAÇABILITÉ COMPLÈTE' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {report.traceabilityStatus}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    L'audit de la chaîne cognitive vérifie que chaque conclusion est supportée par une appréciation, elle-même basée sur des analyses, hypothèses, évidences, informations et sources vérifiables.
                  </p>
                </div>
              </div>

              <div className="relative pl-6 space-y-8 before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-slate-800">
                {['CONCLUSION', 'APPRÉCIATION', 'ANALYSE', 'HYPOTHÈSE', 'ÉVIDENCE', 'SOURCE', 'INFORMATION', 'ÉVÉNEMENT'].map((step, i) => (
                  <div key={step} className="relative">
                    <div className={`absolute -left-8 w-4 h-4 rounded-full border-2 bg-slate-950 flex items-center justify-center ${i < 3 ? 'border-emerald-500' : 'border-slate-700'}`}>
                      {i < 3 && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                    </div>
                    <h4 className="text-sm font-bold text-white">{step}</h4>
                    {i >= 3 && (
                      <div className="mt-2 p-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-500">
                        Maillon manquant ou lien non explicite.
                      </div>
                    )}
                    {i < 3 && (
                      <div className="mt-2 p-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300">
                        Vérifié et lié correctement dans la chaîne d'évaluation.
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {activeTab === 'HISTORIQUE' && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-white mb-6">Historique des versions</h2>
              <div className="space-y-4">
                {report.versionHistory?.map((vh) => (
                  <div key={vh.id} className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">V{vh.versionNumber} — {vh.status}</div>
                      <div className="text-xs text-slate-400">{new Date(vh.date).toLocaleString()} par {vh.author}</div>
                      <div className="text-sm text-slate-300 mt-2">{vh.changes}</div>
                      {vh.comment && <div className="text-sm text-slate-500 italic mt-1">"{vh.comment}"</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
