import React, { useState, useEffect } from 'react';
import { 
  X, Briefcase, Calendar, AlertTriangle, User, Users, CheckSquare, Target, 
  GitMerge, FileText, Activity, AlertCircle, Eye, Download, ShieldAlert, 
  Zap, Network, Shield, Fingerprint, Lock, ShieldQuestion, Search, Clock, 
  ListChecks, FileOutput, ArrowUpRight, HelpCircle, FileCheck, Info
} from 'lucide-react';
import { 
  OsintCase, OsintCaseAudit, OsintEvidence, OsintHypothesis, OsintActor, 
  AnalysisQuestion, OsintIntelligenceReport, OsintEvent, OsintAlert, 
  OsintWeakSignal, OsintCorrelation, OsintAnomaly, OsintIndicator 
} from '../../types';
import { CaseManagementService } from '../../services/caseManagementService';

// Import existing repositories / demo data
import { DEMO_EVIDENCE, DEMO_HYPOTHESES, DEMO_ANALYSES } from '../../data/analysisData';
import { DEMO_ACTORS } from '../../data/actorsData';
import { mockProductionReports } from '../../data/productionData';
import { INITIAL_DEMO_WEAK_SIGNALS, INITIAL_DEMO_CORRELATIONS, INITIAL_DEMO_ANOMALIES, INITIAL_DEMO_INDICATORS } from '../../data/weakSignalDemoData';
import { INITIAL_DEMO_ALERTS } from '../../data/alertDemoData';
import { DEMO_OSINT_EVENTS } from '../../data/osintEventsData';

interface CaseDetailModalProps {
  osintCase: OsintCase | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({ osintCase, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('synthese');
  const [audits, setAudits] = useState<OsintCaseAudit[]>([]);

  useEffect(() => {
    if (osintCase) {
      setAudits(CaseManagementService.getAudits(osintCase.id));
    }
  }, [osintCase]);

  if (!isOpen || !osintCase) return null;

  const handleExport = () => {
    const json = CaseManagementService.exportCaseJson(osintCase.id);
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dossier_${osintCase.id}_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Resolution of relation IDs to real objects
  const resolvedEvents: OsintEvent[] = (osintCase.eventIds || [])
    .map(id => DEMO_OSINT_EVENTS.find(e => e.id === id))
    .filter((e): e is OsintEvent => e !== undefined)
    .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());

  const resolvedAlerts: OsintAlert[] = (osintCase.alertIds || [])
    .map(id => INITIAL_DEMO_ALERTS.find(a => a.id === id))
    .filter((a): a is OsintAlert => a !== undefined);

  const resolvedWeakSignals: OsintWeakSignal[] = (osintCase.signalIds || [])
    .map(id => INITIAL_DEMO_WEAK_SIGNALS.find(s => s.id === id))
    .filter((s): s is OsintWeakSignal => s !== undefined);

  const resolvedCorrelations: OsintCorrelation[] = (osintCase.correlationIds || [])
    .map(id => INITIAL_DEMO_CORRELATIONS.find(c => c.id === id))
    .filter((c): c is OsintCorrelation => c !== undefined);

  const resolvedAnomalies: OsintAnomaly[] = (osintCase.anomalyIds || [])
    .map(id => INITIAL_DEMO_ANOMALIES.find(a => a.id === id))
    .filter((a): a is OsintAnomaly => a !== undefined);

  const resolvedIndicators: OsintIndicator[] = (osintCase.indicatorIds || [])
    .map(id => INITIAL_DEMO_INDICATORS.find(i => i.id === id))
    .filter((i): i is OsintIndicator => i !== undefined);

  const resolvedEvidence: OsintEvidence[] = (osintCase.evidenceIds || [])
    .map(id => DEMO_EVIDENCE.find(ev => ev.id === id))
    .filter((ev): ev is OsintEvidence => ev !== undefined);

  const resolvedHypotheses: OsintHypothesis[] = (osintCase.hypothesisIds || [])
    .map(id => DEMO_HYPOTHESES.find(h => h.id === id))
    .filter((h): h is OsintHypothesis => h !== undefined);

  const resolvedActors: OsintActor[] = (osintCase.actorIds || [])
    .map(id => DEMO_ACTORS.find(act => act.id === id))
    .filter((act): act is OsintActor => act !== undefined);

  const resolvedReports: OsintIntelligenceReport[] = (osintCase.reportIds || [])
    .map(id => mockProductionReports.find(r => r.id === id))
    .filter((r): r is OsintIntelligenceReport => r !== undefined);

  // Extract all questions from DEMO_ANALYSES
  const allDemoQuestions: { id: string; question: string; priority: string; status: string; assignee: string; createdAt: string }[] = [
    { id: 'q-001', question: 'Quelle est la véritable appartenance de ce groupe armé ?', priority: 'HAUTE', status: 'En cours', assignee: 'Analyste_A', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 'q-002', question: 'Le groupe dispose-t-il d\'appuis de tirs indirects ?', priority: 'MOYENNE', status: 'Ouverte', assignee: 'Analyste_B', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 'q-003', question: 'Qui finance cette ferme de trolls ?', priority: 'CRITIQUE', status: 'En cours', assignee: 'Analyste_C', createdAt: new Date(Date.now() - 86400000 * 1).toISOString() }
  ];

  const resolvedQuestions = (osintCase.questionIds || [])
    .map(id => allDemoQuestions.find(q => q.id === id))
    .filter((q): q is typeof allDemoQuestions[0] => q !== undefined);

  // Tabs structure
  const tabs = [
    { id: 'synthese', label: '1. Synthèse', icon: Briefcase, count: null },
    { id: 'chronologie', label: '2. Chronologie', icon: Clock, count: resolvedEvents.length },
    { id: 'matrice', label: '3. Matrice de Suivi', icon: ListChecks, count: null },
    { id: 'alertes', label: '4. Alertes', icon: ShieldAlert, count: resolvedAlerts.length },
    { id: 'signaux', label: '5. Signaux faibles', icon: Activity, count: resolvedWeakSignals.length },
    { id: 'correlations', label: '6. Corrélations', icon: Network, count: resolvedCorrelations.length },
    { id: 'anomalies', label: '7. Anomalies', icon: AlertTriangle, count: resolvedAnomalies.length },
    { id: 'indicateurs', label: '8. Indicateurs', icon: Target, count: resolvedIndicators.length },
    { id: 'preuves', label: '9. Preuves', icon: Shield, count: resolvedEvidence.length },
    { id: 'hypotheses', label: '10. Hypothèses', icon: Search, count: resolvedHypotheses.length },
    { id: 'acteurs', label: '11. Acteurs', icon: Fingerprint, count: resolvedActors.length },
    { id: 'questions', label: '12. Questions & Lacunes', icon: ShieldQuestion, count: resolvedQuestions.length + (osintCase.intelligenceGaps?.length || 0) },
    { id: 'taches', label: '13. Tâches & Jalons', icon: CheckSquare, count: (osintCase.tasks?.length || 0) + (osintCase.milestones?.length || 0) },
    { id: 'rapports', label: '14. Rapports', icon: FileOutput, count: resolvedReports.length },
    { id: 'audit', label: '15. Audit & Traçabilité', icon: Lock, count: audits.length }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-7xl h-[90vh] bg-white rounded-2xl shadow-2xl flex overflow-hidden border border-slate-200">
        
        {/* Sidebar */}
        <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-slate-200 sticky top-0 bg-slate-50 z-10">
            <h3 className="font-bold text-slate-900 truncate" title={osintCase.title}>{osintCase.title}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono">
              <span>{osintCase.id}</span>
              <span>•</span>
              <span className="capitalize">{osintCase.category}</span>
            </div>
          </div>
          <div className="flex-1 py-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left ${
                    activeTab === tab.id 
                    ? 'bg-indigo-50 text-indigo-700 font-medium border-r-4 border-indigo-600' 
                    : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {tab.count !== null && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Header */}
          <div className="flex-none px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                {osintCase.status}
              </span>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                PRIORITÉ: {osintCase.priority}
              </span>
              {osintCase.isDemo && (
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                  <Info className="w-3 h-3" /> DEMO
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleExport}
                className="px-3.5 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-2 border border-slate-200"
              >
                <Download className="w-4 h-4 text-slate-600" /> Export JSON
              </button>
              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">

            {/* 1. SYNTHÈSE */}
            {activeTab === 'synthese' && (
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-sm flex items-start gap-3">
                  <Activity className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold uppercase tracking-wide text-xs text-amber-800">INDICATEUR DE PROGRESSION — NE CONSTITUE PAS UNE ÉVALUATION DE MENACE</h4>
                    <p className="mt-1">Ce dossier est actuellement au stade de recueil et d'analyse préliminaire. Aucune conclusion ne doit être automatiquement présentée comme un fait.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Description & Contexte</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{osintCase.description}</p>
                    <div className="pt-2 text-xs text-slate-500 space-y-1">
                      <div><span className="font-semibold">Responsable :</span> {osintCase.owner || 'Non assigné'}</div>
                      <div><span className="font-semibold">Équipe :</span> {osintCase.team.join(', ') || 'Aucune équipe affectée'}</div>
                      <div><span className="font-semibold">Créé le :</span> {new Date(osintCase.createdAt).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Situation Analytique Actuelle</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <span className="text-xs font-bold text-emerald-700 uppercase">Faits établis</span>
                        <p className="text-sm mt-1 text-emerald-900 font-medium">{resolvedEvidence.filter(e => e.verificationStatus === 'Vérifié').length} élément(s) de preuve vérifié(s).</p>
                      </div>
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <span className="text-xs font-bold text-amber-700 uppercase">Faits rapportés / Non confirmés</span>
                        <p className="text-sm mt-1 text-amber-900 font-medium">{resolvedEvidence.filter(e => e.verificationStatus !== 'Vérifié').length} élément(s) en cours de recoupement.</p>
                      </div>
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                        <span className="text-xs font-bold text-rose-700 uppercase">Contradictions</span>
                        <p className="text-sm mt-1 text-rose-900 font-medium">{osintCase.contradictions?.length || 0} contradiction(s) formellement répertoriée(s).</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. CHRONOLOGIE */}
            {activeTab === 'chronologie' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="font-bold text-slate-900">Chronologie des Événements Associes ({resolvedEvents.length})</h3>
                  <span className="text-xs text-slate-500 font-mono">Ordre chronologique décroissant</span>
                </div>
                {resolvedEvents.length > 0 ? (
                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                    {resolvedEvents.map(evt => (
                      <div key={evt.id} className="relative pl-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="absolute left-2 top-5 w-3 h-3 bg-indigo-600 rounded-full ring-4 ring-white" />
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900">{evt.title}</h4>
                          <span className="text-xs font-mono text-slate-500">{evt.publishedAt ? new Date(evt.publishedAt).toLocaleDateString() : 'Date inconnue'}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">{evt.summary}</p>
                        <div className="mt-3 flex gap-3 text-xs">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-medium">{evt.category}</span>
                          {evt.country && <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-medium">Pays: {evt.country}</span>}
                          {evt.sourceName && <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-medium">Source: {evt.sourceName}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
                    <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">Aucun événement lié à ce dossier</p>
                    <p className="text-xs text-slate-400 mt-1">Aucun identifiant d'événement valide associé dans osintCase.eventIds.</p>
                  </div>
                )}
              </div>
            )}

            {/* 3. MATRICE DE SUIVI */}
            {activeTab === 'matrice' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="font-bold text-slate-900">Matrice de Suivi (Intelligence Tracking Matrix)</h3>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-3 font-semibold text-slate-600">Élément</th>
                        <th className="p-3 font-semibold text-slate-600">Statut</th>
                        <th className="p-3 font-semibold text-slate-600">Confiance</th>
                        <th className="p-3 font-semibold text-slate-600">Source</th>
                        <th className="p-3 font-semibold text-slate-600">Dernière mise à jour</th>
                        <th className="p-3 font-semibold text-slate-600">Analyste</th>
                        <th className="p-3 font-semibold text-slate-600">Action requise</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {resolvedEvidence.map(ev => (
                        <tr key={ev.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-medium text-slate-900">{ev.title}</td>
                          <td className="p-3"><span className="px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">{ev.verificationStatus}</span></td>
                          <td className="p-3"><span className="text-xs font-semibold text-slate-700">ÉLEVÉE</span></td>
                          <td className="p-3 text-slate-600">{ev.sourceId || 'Source locale'}</td>
                          <td className="p-3 text-slate-500 text-xs">{ev.dateAcquired || 'Récent'}</td>
                          <td className="p-3 text-slate-700">{osintCase.owner || 'Analyste'}</td>
                          <td className="p-3 text-slate-600 text-xs font-medium">Validation technique</td>
                        </tr>
                      ))}
                      {resolvedHypotheses.map(hyp => (
                        <tr key={hyp.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-medium text-slate-900">[Hypothèse] {hyp.title}</td>
                          <td className="p-3"><span className="px-2 py-0.5 text-xs rounded bg-purple-50 text-purple-700 border border-purple-200 font-medium">{hyp.status}</span></td>
                          <td className="p-3"><span className="text-xs font-semibold text-purple-800">{hyp.confidence}</span></td>
                          <td className="p-3 text-slate-600">Interne</td>
                          <td className="p-3 text-slate-500 text-xs">En évaluation</td>
                          <td className="p-3 text-slate-700">{osintCase.owner || 'Analyste'}</td>
                          <td className="p-3 text-slate-600 text-xs font-medium">Recherche d'éléments contraires</td>
                        </tr>
                      ))}
                      {resolvedEvidence.length === 0 && resolvedHypotheses.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500">
                            <ListChecks className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            <p className="font-medium text-slate-700">Matrice de suivi vierge</p>
                            <p className="text-xs text-slate-400 mt-1">Aucune preuve ni hypothèse associée pour alimenter la matrice.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. ALERTES */}
            {activeTab === 'alertes' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3">Alertes Associées ({resolvedAlerts.length})</h3>
                {resolvedAlerts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resolvedAlerts.map(alt => (
                      <div key={alt.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-rose-100 text-rose-800 border border-rose-200 uppercase">{alt.severity}</span>
                          <span className="text-xs text-slate-500 font-mono">{alt.id}</span>
                        </div>
                        <h4 className="font-bold text-slate-900">{alt.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{alt.summary}</p>
                        <div className="pt-2 text-xs text-slate-500 flex justify-between border-t border-slate-100">
                          <span>Source: {alt.sourceName}</span>
                          <span>Détecté: {new Date(alt.detectedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
                    <ShieldAlert className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">Aucune alerte reliée</p>
                    <p className="text-xs text-slate-400 mt-1">osintCase.alertIds est vide ou contient des IDs absents du registre.</p>
                  </div>
                )}
              </div>
            )}

            {/* 5. SIGNAUX FAIBLES */}
            {activeTab === 'signaux' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3">Signaux Faibles ({resolvedWeakSignals.length})</h3>
                {resolvedWeakSignals.length > 0 ? (
                  <div className="space-y-3">
                    {resolvedWeakSignals.map(sig => (
                      <div key={sig.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-800">{sig.signalType}</span>
                            <span className="text-xs font-semibold text-slate-500">Évolution: {sig.evolution}</span>
                          </div>
                          <h4 className="font-bold text-slate-900">{sig.title}</h4>
                          <p className="text-sm text-slate-600">{sig.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0 text-xs text-slate-500">
                          <div>Confiance: <span className="font-bold text-slate-800">{sig.confidence}</span></div>
                          <div>Statut: <span className="font-bold text-indigo-700">{sig.status}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
                    <Activity className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">Aucun signal faible détecté</p>
                    <p className="text-xs text-slate-400 mt-1">Aucun signal précurseur associé à ce dossier.</p>
                  </div>
                )}
              </div>
            )}

            {/* 6. CORRÉLATIONS */}
            {activeTab === 'correlations' && (
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <Network className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>CORRÉLATION ≠ CAUSALITÉ — Les corrélations identifiées traduisent des cooccurrences statistiques ou temporelles et ne prouvent pas de lien de causalité direct.</span>
                </div>
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3">Corrélations Détectées ({resolvedCorrelations.length})</h3>
                {resolvedCorrelations.length > 0 ? (
                  <div className="space-y-3">
                    {resolvedCorrelations.map(corr => (
                      <div key={corr.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900">{corr.title}</h4>
                          <span className="px-2 py-0.5 text-xs font-bold rounded bg-indigo-100 text-indigo-800">Score: {corr.score}/{corr.maxScore}</span>
                        </div>
                        <p className="text-sm text-slate-600">{corr.description}</p>
                        <div className="flex gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <span>Type: {corr.correlationType}</span>
                          <span>Confiance: {corr.confidence}</span>
                          <span>Signification: {corr.significance}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
                    <Network className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">Aucune corrélation établie</p>
                    <p className="text-xs text-slate-400 mt-1">Aucun identifiant de corrélation associé dans correlationIds.</p>
                  </div>
                )}
              </div>
            )}

            {/* 7. ANOMALIES */}
            {activeTab === 'anomalies' && (
              <div className="space-y-4">
                <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>ANOMALIE ≠ MENACE CONFIRMÉE — Une déviation statistique par rapport à la ligne de base nécessite un examen humain approfondi avant qualification.</span>
                </div>
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3">Anomalies de Détection ({resolvedAnomalies.length})</h3>
                {resolvedAnomalies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resolvedAnomalies.map(anom => (
                      <div key={anom.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 text-xs font-bold rounded bg-rose-100 text-rose-800">{anom.type}</span>
                          <span className="text-xs font-semibold text-slate-500">Sévérité: {anom.severity}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{anom.description}</p>
                        <div className="bg-slate-50 p-2.5 rounded text-xs grid grid-cols-3 gap-2 text-center border border-slate-100">
                          <div><span className="block text-slate-400">Baseline</span><span className="font-bold text-slate-700">{anom.baselineValue}</span></div>
                          <div><span className="block text-slate-400">Observé</span><span className="font-bold text-rose-600">{anom.observedValue}</span></div>
                          <div><span className="block text-slate-400">Déviation</span><span className="font-bold text-slate-900">+{anom.deviation}%</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
                    <AlertTriangle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">Aucune anomalie signalée</p>
                    <p className="text-xs text-slate-400 mt-1">Les métriques de surveillance sont conformes à la ligne de base.</p>
                  </div>
                )}
              </div>
            )}

            {/* 8. INDICATEURS */}
            {activeTab === 'indicateurs' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3">Indicateurs de Suivi ({resolvedIndicators.length})</h3>
                {resolvedIndicators.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resolvedIndicators.map(ind => (
                      <div key={ind.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900">{ind.name}</h4>
                          <span className="px-2 py-0.5 text-xs font-bold rounded bg-slate-100 text-slate-700">{ind.status}</span>
                        </div>
                        <p className="text-xs text-slate-600">{ind.description}</p>
                        <div className="flex justify-between items-end border-t border-slate-100 pt-2 text-xs">
                          <div>
                            <span className="text-slate-400 block">Valeur actuelle</span>
                            <span className="text-lg font-extrabold text-slate-900">{ind.currentValue} {ind.unit}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 block">Seuil ({ind.period})</span>
                            <span className="font-bold text-slate-700">{ind.threshold}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
                    <Target className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">Aucun indicateur spécifique</p>
                    <p className="text-xs text-slate-400 mt-1">Aucun indicateur associé à ce dossier d'investigation.</p>
                  </div>
                )}
              </div>
            )}

            {/* 9. PREUVES */}
            {activeTab === 'preuves' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3">Preuves & Éléments de Preuve ({resolvedEvidence.length})</h3>
                {resolvedEvidence.length > 0 ? (
                  <div className="space-y-3">
                    {resolvedEvidence.map(ev => (
                      <div key={ev.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-indigo-100 text-indigo-800">{ev.type}</span>
                            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">{ev.verificationStatus}</span>
                            {ev.isDemo && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">DEMO</span>}
                          </div>
                          <span className="text-xs text-slate-400 font-mono">{ev.id}</span>
                        </div>
                        <h4 className="font-bold text-slate-900">{ev.title}</h4>
                        <p className="text-sm text-slate-600">{ev.description}</p>
                        <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <span>Source: {ev.sourceId || 'Non spécifiée'}</span>
                          <span>Acquis le: {ev.dateAcquired || 'Récent'}</span>
                          <span>Provenance: {ev.provenance || 'System'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
                    <Shield className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">Aucune preuve associée</p>
                    <p className="text-xs text-slate-400 mt-1">osintCase.evidenceIds ne contient aucun ID de preuve valide.</p>
                  </div>
                )}
              </div>
            )}

            {/* 10. HYPOTHÈSES */}
            {activeTab === 'hypotheses' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3">Hypothèses d'Investigation ({resolvedHypotheses.length})</h3>
                {resolvedHypotheses.length > 0 ? (
                  <div className="space-y-4">
                    {resolvedHypotheses.map(hyp => (
                      <div key={hyp.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 text-xs font-bold rounded bg-purple-100 text-purple-800 uppercase">{hyp.status}</span>
                            <span className="text-xs font-bold text-slate-600">Confiance: {hyp.confidence}</span>
                          </div>
                          <span className="text-xs font-mono text-slate-400">{hyp.id}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base">{hyp.title}</h4>
                        <p className="text-sm text-slate-700">{hyp.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                          <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200">
                            <span className="font-bold text-emerald-800 block mb-1">Éléments Favorables ({hyp.supportingEvidenceIds?.length || 0})</span>
                            <span className="text-emerald-900 font-mono">{hyp.supportingEvidenceIds?.join(', ') || 'Aucun'}</span>
                          </div>
                          <div className="bg-rose-50 p-2.5 rounded border border-rose-200">
                            <span className="font-bold text-rose-800 block mb-1">Éléments Défavorables / Contradictions ({hyp.opposingEvidenceIds?.length || 0})</span>
                            <span className="text-rose-900 font-mono">{hyp.opposingEvidenceIds?.join(', ') || 'Aucun'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
                    <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">Aucune hypothèse formulée</p>
                    <p className="text-xs text-slate-400 mt-1">Aucune hypothèse associée dans hypothesisIds.</p>
                  </div>
                )}
              </div>
            )}

            {/* 11. ACTEURS */}
            {activeTab === 'acteurs' && (
              <div className="space-y-4">
                <div className="bg-slate-100 border border-slate-200 text-slate-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  <span>ACTEURS ASSOCIÉS PAR OBSERVATION — L'association d'un acteur résulte d'une mention croisée ou d'une présence observée. Aucune causalité n'est déduite automatiquement.</span>
                </div>
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3">Acteurs Identifiés ({resolvedActors.length})</h3>
                {resolvedActors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resolvedActors.map(act => (
                      <div key={act.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900">{act.name}</h4>
                          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700">{act.status}</span>
                        </div>
                        <p className="text-xs text-slate-600">{act.description}</p>
                        <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <span>Type: {act.type}</span>
                          <span>Pays: {act.country}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
                    <Fingerprint className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">Aucun acteur lié</p>
                    <p className="text-xs text-slate-400 mt-1">osintCase.actorIds ne contient aucun ID d'acteur répertorié.</p>
                  </div>
                )}
              </div>
            )}

            {/* 12. QUESTIONS & LACUNES */}
            {activeTab === 'questions' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3 mb-3">Questions d'Analyse ({resolvedQuestions.length})</h3>
                  {resolvedQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {resolvedQuestions.map(q => (
                        <div key={q.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start">
                          <div>
                            <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-800 uppercase mr-2">{q.priority}</span>
                            <span className="font-semibold text-slate-900 text-sm">{q.question}</span>
                            <div className="text-xs text-slate-500 mt-1">Responsable: {q.assignee} • Créé le {new Date(q.createdAt).toLocaleDateString()}</div>
                          </div>
                          <span className="px-2.5 py-1 text-xs font-bold rounded bg-slate-100 text-slate-700">{q.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-slate-500 italic">Aucune question d'analyse répertoriée.</p>}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3 mb-3">Lacunes de Renseignement ({osintCase.intelligenceGaps?.length || 0})</h3>
                  {osintCase.intelligenceGaps?.length > 0 ? (
                    <div className="space-y-3">
                      {osintCase.intelligenceGaps.map(g => (
                        <div key={g.id} className="p-4 border border-amber-200 bg-amber-50 rounded-xl space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-amber-900">{g.title}</h4>
                            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase">{g.status}</span>
                          </div>
                          <p className="text-sm text-amber-800">{g.description}</p>
                          <div className="text-xs text-amber-700 flex gap-4 pt-1">
                            <span>Priorité: {g.priority}</span>
                            <span>Identifié le: {new Date(g.identifiedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-slate-500 italic">Aucune lacune de renseignement identifiée.</p>}
                </div>
              </div>
            )}

            {/* 13. TÂCHES & JALONS */}
            {activeTab === 'taches' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3 mb-3">Tâches d'Investigation ({osintCase.tasks?.length || 0})</h3>
                  {osintCase.tasks?.length > 0 ? (
                    <div className="space-y-2">
                      {osintCase.tasks.map(t => (
                        <div key={t.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3">
                            <CheckSquare className={`w-4 h-4 ${t.status === 'DONE' ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <span className="font-medium text-slate-900 text-sm">{t.title}</span>
                          </div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{t.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-slate-500 italic">Aucune tâche assignée.</p>}
                </div>
                
                <div>
                  <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3 mb-3">Jalons d'Investigation ({osintCase.milestones?.length || 0})</h3>
                  {osintCase.milestones?.length > 0 ? (
                    <div className="space-y-2">
                      {osintCase.milestones.map(m => (
                        <div key={m.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between shadow-sm">
                          <span className="font-medium text-slate-900 text-sm">{m.title}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">{m.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-slate-500 italic">Aucun jalon planifié.</p>}
                </div>
              </div>
            )}

            {/* 14. RAPPORTS */}
            {activeTab === 'rapports' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3">Rapports de Renseignement Produits ({resolvedReports.length})</h3>
                {resolvedReports.length > 0 ? (
                  <div className="space-y-3">
                    {resolvedReports.map(rep => (
                      <div key={rep.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-slate-100 text-slate-700 border border-slate-200">{rep.classification}</span>
                          <span className="text-xs font-mono text-slate-500">{rep.reference}</span>
                        </div>
                        <h4 className="font-bold text-slate-900">{rep.title}</h4>
                        <p className="text-xs text-slate-600">{rep.subtitle || rep.executiveSummary}</p>
                        <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <span>Auteur: {rep.author}</span>
                          <span>Statut: {rep.status}</span>
                          <span>Créé le: {new Date(rep.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
                    <FileOutput className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">Aucun rapport produit</p>
                    <p className="text-xs text-slate-400 mt-1">Aucun rapport de renseignement formel associé à ce dossier.</p>
                  </div>
                )}
              </div>
            )}

            {/* 15. AUDIT & TRAÇABILITÉ */}
            {activeTab === 'audit' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3">Journal d'Audit Immuable ({audits.length})</h3>
                {audits.length > 0 ? (
                  <div className="space-y-3">
                    {audits.map(a => (
                      <div key={a.id} className="p-3 bg-white border border-slate-200 rounded-xl text-sm shadow-sm space-y-1">
                        <div className="flex justify-between text-xs text-slate-400 font-mono">
                          <span>{new Date(a.timestamp).toLocaleString()}</span>
                          <span>{a.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-700">{a.action}</span>
                          <span className="text-slate-600">sur {a.object} par</span>
                          <span className="font-semibold text-slate-900">{a.analystId}</span>
                        </div>
                        {a.justification && <p className="text-xs text-slate-500 italic mt-1">Motif: "{a.justification}"</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
                    <Lock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">Aucun historique d'audit</p>
                    <p className="text-xs text-slate-400 mt-1">Ce dossier n'a fait l'objet d'aucune modification récente.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
