import React, { useState } from 'react';
import { OsintAnalysis, OsintEvidence, OsintHypothesis, AnalysisNote, AnalysisQuestion, OsintEvent, OsintSourceItem } from '../../types';
import { X, ShieldAlert, BrainCircuit, FileCheck, Info, FileText, Target, Crosshair, HelpCircle, Layers, Activity, FileSearch, Flag, AlertTriangle } from 'lucide-react';
import { UseOsintViewModelReturn } from '../../viewmodels/useOsintViewModel';

interface AnalysisDetailModalProps {
  analysis: OsintAnalysis | null;
  onClose: () => void;
  vm: UseOsintViewModelReturn;
}

export const AnalysisDetailModal: React.FC<AnalysisDetailModalProps> = ({ analysis, onClose, vm }) => {
  const [activeTab, setActiveTab] = useState<'fiche' | 'synthese'>('fiche');

  if (!analysis) return null;

  // Retrieve related data from VM
  const event = vm.events.find(e => e.id === analysis.eventId);
  const hypotheses = vm.hypotheses.filter(h => analysis.hypothesisIds?.includes(h.id));
  const evidence = vm.evidence.filter(e => analysis.evidenceIds?.includes(e.id));
  const relatedEvents = vm.events.filter(e => analysis.relatedEventIds?.includes(e.id));
  const sources = vm.sources.filter(s => analysis.sourceIds?.includes(s.id));
  
  // Format Confidence Level
  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'TRÈS ÉLEVÉE': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
      case 'ÉLEVÉE': return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'MOYENNE': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      case 'FAIBLE': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'TRÈS FAIBLE': return 'text-red-500 bg-red-500/10 border-red-500/30';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#070a10] border border-slate-700 w-full max-w-6xl h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#0d121d] flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-amber-500" />
              Fiche d'Exploitation Analytique
            </h2>
            <div className="text-sm text-slate-400 mt-1 flex items-center gap-3">
              <span>{analysis.title}</span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-300">
                {analysis.status}
              </span>
              {analysis.isDemo && (
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-amber-900/30 text-amber-500">
                  DÉMO
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-[#131a27] rounded-lg p-1 border border-slate-800">
              <button 
                onClick={() => setActiveTab('fiche')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'fiche' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Fiche Technique
              </button>
              <button 
                onClick={() => setActiveTab('synthese')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'synthese' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Synthèse du Renseignement
              </button>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 bg-[#0b0f17]">
          {activeTab === 'fiche' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Colonne 1 : Situation, Faits, Infos */}
              <div className="space-y-6 lg:col-span-2">
                <section className="bg-[#131a27] border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    1. Situation & Objectif
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Objectif d'analyse</div>
                      <div className="text-sm text-slate-200">{analysis.objective}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Résumé initial</div>
                      <div className="text-sm text-slate-200">{analysis.summary}</div>
                    </div>
                  </div>
                </section>

                <section className="bg-[#131a27] border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    2. Faits Établis (Vérifiés)
                  </h3>
                  {analysis.establishedFacts?.length > 0 ? (
                    <ul className="space-y-2">
                      {analysis.establishedFacts.map((fact, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          {fact}
                        </li>
                      ))}
                    </ul>
                  ) : <div className="text-sm text-slate-500 italic">Aucun fait établi à ce stade.</div>}
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <section className="bg-[#131a27] border border-slate-800 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      3. Informations Rapportées
                    </h3>
                    <ul className="space-y-2">
                      {analysis.reportedInformation?.map((info, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="text-slate-500 mt-0.5">-</span>
                          {info}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="bg-[#131a27] border border-slate-800 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      4. Informations Non Confirmées
                    </h3>
                    <ul className="space-y-2">
                      {analysis.unconfirmedInformation?.map((info, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="text-orange-500/50 mt-0.5">?</span>
                          {info}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section className="bg-[#241315] border border-red-900/30 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    5. Éléments Contradictoires (CONTRADICTION À EXAMINER)
                  </h3>
                  {analysis.contradictoryInformation?.length > 0 ? (
                    <div className="space-y-4">
                      {analysis.contradictoryInformation.map((contra, i) => {
                        const srcA = vm.sources.find(s => s.id === contra.sourceAId);
                        const srcB = vm.sources.find(s => s.id === contra.sourceBId);
                        return (
                          <div key={i} className="bg-[#1a0f12] p-3 rounded border border-red-900/40">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-red-400/70 mb-1">Source A ({srcA?.name || 'Inconnue'})</div>
                                <div className="text-sm text-slate-300">{contra.infoA}</div>
                              </div>
                              <div className="border-l border-red-900/30 pl-4">
                                <div className="text-xs text-red-400/70 mb-1">Source B ({srcB?.name || 'Inconnue'})</div>
                                <div className="text-sm text-slate-300">{contra.infoB}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : <div className="text-sm text-slate-500 italic">Aucune contradiction détectée.</div>}
                </section>

                <section className="bg-[#131a27] border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    6. Hypothèses Analytiques
                  </h3>
                  {hypotheses?.length > 0 ? (
                    <div className="space-y-4">
                      {hypotheses.map((hyp, i) => (
                        <div key={hyp.id} className="border border-slate-700 bg-[#0d121d] rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-medium text-white flex items-center gap-2">
                              <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-xs">H{i+1}</span>
                              {hyp.title}
                            </h4>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              {hyp.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 mb-4">{hyp.description}</p>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-emerald-900/10 p-2 rounded border border-emerald-900/30">
                              <div className="text-xs text-emerald-500 mb-1 font-medium">Éléments favorables</div>
                              <ul className="text-xs text-slate-300 space-y-1">
                                {hyp.supportingEvidenceIds?.length > 0 ? 
                                  hyp.supportingEvidenceIds.map(id => {
                                    const ev = vm.evidence.find(e => e.id === id);
                                    return <li key={id}>✓ {ev?.title || 'Preuve'}</li>
                                  })
                                  : <li className="text-slate-500 italic">Aucun</li>
                                }
                              </ul>
                            </div>
                            <div className="bg-red-900/10 p-2 rounded border border-red-900/30">
                              <div className="text-xs text-red-500 mb-1 font-medium">Éléments défavorables</div>
                              <ul className="text-xs text-slate-300 space-y-1">
                                {hyp.opposingEvidenceIds?.length > 0 ? 
                                  hyp.opposingEvidenceIds.map(id => {
                                    const ev = vm.evidence.find(e => e.id === id);
                                    return <li key={id}>✗ {ev?.title || 'Preuve'}</li>
                                  })
                                  : <li className="text-slate-500 italic">Aucun</li>
                                }
                              </ul>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <div className={`px-2 py-0.5 rounded border font-medium ${getConfidenceColor(hyp.confidence)}`}>
                              Confiance: {hyp.confidence}
                            </div>
                            <button className="text-amber-500 hover:text-amber-400">Examiner l'hypothèse &rarr;</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-sm text-slate-500 italic">Aucune hypothèse formulée.</div>}
                </section>
              </div>

              {/* Colonne 2 : Preuves, Sources, Questions, Conclusion */}
              <div className="space-y-6">
                <section className="bg-[#131a27] border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-4">
                    Évaluation de Confiance Globale
                  </h3>
                  <div className={`p-4 rounded-lg border flex items-center justify-center mb-4 ${getConfidenceColor(analysis.confidence)}`}>
                    <div className="text-center">
                      <div className="text-xs uppercase tracking-wider opacity-80 mb-1">Indice de confiance</div>
                      <div className="text-xl font-bold">{analysis.confidence}</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-300 bg-[#0d121d] p-3 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">Justification analytique</div>
                    {analysis.confidenceReason}
                  </div>
                </section>

                <section className="bg-[#131a27] border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileSearch className="w-4 h-4" />
                    Éléments de Preuve ({evidence?.length || 0})
                  </h3>
                  {evidence?.length > 0 ? (
                    <div className="space-y-2">
                      {evidence.map(ev => (
                        <div key={ev.id} className="p-2 bg-[#0d121d] rounded border border-slate-800 flex justify-between items-center cursor-pointer hover:border-slate-600 transition">
                          <div>
                            <div className="text-xs font-medium text-white">{ev.title}</div>
                            <div className="text-[10px] text-slate-400">{ev.type}</div>
                          </div>
                          <div className={`text-[10px] px-1.5 py-0.5 rounded ${ev.verificationStatus === 'Vérifié' ? 'bg-emerald-900/30 text-emerald-500' : 'bg-slate-800 text-slate-400'}`}>
                            {ev.verificationStatus}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-sm text-slate-500 italic">Aucune preuve rattachée.</div>}
                </section>

                <section className="bg-[#131a27] border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Questions Analytiques ({analysis.questions?.length || 0})
                  </h3>
                  {analysis.questions?.length > 0 ? (
                    <ul className="space-y-3">
                      {analysis.questions.map(q => (
                        <li key={q.id} className="text-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-amber-500 font-medium">Q:</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${q.status === 'Résolue' ? 'bg-emerald-900/30 text-emerald-500' : 'bg-slate-800 text-slate-400'}`}>
                              {q.status}
                            </span>
                          </div>
                          <div className="text-slate-300 pl-4">{q.question}</div>
                        </li>
                      ))}
                    </ul>
                  ) : <div className="text-sm text-slate-500 italic">Aucune question en suspens.</div>}
                </section>

                <section className="bg-[#131a27] border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-4">
                    Conclusion de l'Événement
                  </h3>
                  <div className="bg-[#0d121d] p-4 rounded-lg border border-slate-700">
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {analysis.conclusion}
                    </p>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            // ONGLET SYNTHESE
            <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-slate-900"></div>
              
              <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-8">
                <div>
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Synthèse du Renseignement</div>
                  <h1 className="text-3xl font-bold text-slate-900 leading-tight">{analysis.title}</h1>
                  <div className="mt-4 flex gap-4 text-sm text-slate-600">
                    <div><span className="font-semibold">Réf:</span> {analysis.id}</div>
                    <div><span className="font-semibold">Date:</span> {new Date().toLocaleDateString('fr-FR')}</div>
                    <div><span className="font-semibold">Statut:</span> {analysis.status}</div>
                  </div>
                </div>
                <div className={`px-4 py-2 border-2 font-bold uppercase tracking-widest ${analysis.confidence === 'TRÈS ÉLEVÉE' || analysis.confidence === 'ÉLEVÉE' ? 'border-green-600 text-green-600' : 'border-amber-600 text-amber-600'}`}>
                  CONF: {analysis.confidence}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-2 mb-4 uppercase tracking-wider">1. Situation</h2>
                  <p className="text-slate-700 text-justify leading-relaxed">{analysis.summary}</p>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-2 mb-4 uppercase tracking-wider">2. Faits Essentiels</h2>
                  <ul className="list-disc list-inside text-slate-700 space-y-2">
                    {analysis.establishedFacts?.map((fact, i) => <li key={i}>{fact}</li>)}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-2 mb-4 uppercase tracking-wider">3. Éléments Concordants</h2>
                    <ul className="list-disc list-inside text-slate-700 space-y-2">
                      {analysis.reportedInformation?.map((info, i) => <li key={i}>{info}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-2 mb-4 uppercase tracking-wider">4. Contradictions</h2>
                    {analysis.contradictoryInformation?.length > 0 ? (
                      <ul className="list-disc list-inside text-slate-700 space-y-2">
                        {analysis.contradictoryInformation.map((contra, i) => (
                          <li key={i} className="text-red-700">Divergence entre {vm.sources.find(s=>s.id===contra.sourceAId)?.name || 'A'} et {vm.sources.find(s=>s.id===contra.sourceBId)?.name || 'B'}</li>
                        ))}
                      </ul>
                    ) : <p className="text-slate-500 italic">Aucune contradiction majeure.</p>}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-2 mb-4 uppercase tracking-wider">5. Appréciation Analytique</h2>
                  <p className="text-slate-700 text-justify leading-relaxed">{analysis.analyticalAssessment}</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Points à Surveiller & Implications
                  </h2>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 font-medium">
                    {analysis.implications?.map((imp, i) => <li key={i}>{imp}</li>)}
                  </ul>
                </div>

              </div>
              
              <div className="mt-12 pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
                Généré par le Centre d'Analyse OSINT AFRICA - Document strictement confidentiel
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
