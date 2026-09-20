import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Layers,
  ArrowUpRight,
  Info,
  CheckCircle2,
  XCircle,
  Hash,
  Database,
  History,
  Activity,
  Globe,
  Tag,
  UserCheck,
} from 'lucide-react';
import {
  OsintAlert,
  OsintAlertAction,
  OsintAlertAudit,
  OsintAlertGroup,
  OsintAlertContradiction,
} from '../../types';

interface Props {
  alert: OsintAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAssessment: (alert: OsintAlert) => void;
  onTriage: (alertId: string) => void;
  onStartReview: (alertId: string) => void;
  onResolve: (alertId: string) => void;
  actions: OsintAlertAction[];
  audits: OsintAlertAudit[];
  group?: OsintAlertGroup;
}

export const AlertDetailModal: React.FC<Props> = ({
  alert,
  isOpen,
  onClose,
  onOpenAssessment,
  onTriage,
  onStartReview,
  onResolve,
  actions,
  audits,
  group,
}) => {
  if (!isOpen || !alert) return null;

  const [copiedHash, setCopiedHash] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'score' | 'provenance' | 'convergence' | 'audit'>('overview');

  const alertActions = actions.filter((a) => a.alertId === alert.id);
  const alertAudits = audits.filter((au) => au.alertId === alert.id);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority) {
      case 'P1_CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'P2_HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'P3_MEDIUM':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'P4_LOW':
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'DISMISSED':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'UNDER_REVIEW':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'DUPLICATE':
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
      case 'CONTRADICTED':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'ESCALATED':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'RESOLVED':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      default:
        return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        id="modal-alert-detail"
        className="bg-[#0f1422] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-800 bg-[#0d121d]">
          <div className="space-y-1.5 flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-bold font-mono rounded-lg border ${getPriorityBadgeClass(alert.priority)}`}>
                {alert.priority}
              </span>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg border ${getStatusBadgeClass(alert.status)}`}>
                {alert.status}
              </span>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg border ${alert.isDemo ? 'bg-amber-950/60 text-amber-300 border-amber-600/40' : 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'}`}>
                {alert.isDemo ? '🧪 SIMULATION / DÉMO' : '🟢 SOURCE RÉELLE AUDITÉE (APS)'}
              </span>
              {alert.isHumanValidated ? (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  Arbitré par l'analyste
                </span>
              ) : (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  En attente de qualification
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 line-clamp-2">
              {alert.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span>ID: <strong className="text-slate-300 font-mono">{alert.id}</strong></span>
              <span>Source: <strong className="text-slate-300">{alert.sourceName || alert.sourceId}</strong></span>
              {alert.country && <span>Pays: <strong className="text-slate-300">{alert.country}</strong></span>}
              <span>Détecté le: <strong className="text-slate-300">{new Date(alert.detectedAt || alert.createdAt).toLocaleString('fr-FR')}</strong></span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-[#0d121d]/50 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Vue Générale</span>
          </button>
          <button
            onClick={() => setActiveTab('score')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'score'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Score & Explicabilité ({alert.priorityScore || 0}/100)</span>
          </button>
          <button
            onClick={() => setActiveTab('provenance')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'provenance'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Traçabilité SHA-256 & RAW</span>
          </button>
          <button
            onClick={() => setActiveTab('convergence')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'convergence'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Convergence & Contradictions {alert.contradictions?.length ? `(${alert.contradictions.length})` : ''}</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historique & Audit ({alertActions.length + alertAudits.length})</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Doctrinal Warning */}
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <strong>Avertissement Doctrinal OSINT AFRICA :</strong> Ce signal est issu de la détection heuristique locale. Son score de priorité ({alert.priorityScore}/100) indique une <em>urgence de traitement pour l'analyste</em> et non une confirmation automatique de vérité.
                </div>
              </div>

              {/* Summary / Content */}
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Résumé / Contenu Normalisé
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {alert.summary || 'Aucun résumé disponible.'}
                </p>
                {alert.originalUrl && (
                  <div className="pt-2">
                    <a
                      href={alert.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Consulter la source d'origine</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Analyst Qualification Status Card */}
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>État de l'Arbitrage Humain</span>
                  </h4>
                  {alert.assessment ? (
                    <span className="text-xs font-bold text-emerald-400">Qualifié</span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-400">Non qualifié</span>
                  )}
                </div>

                {alert.assessment ? (
                  <div className="space-y-2.5 bg-slate-950/60 rounded-lg p-3.5 border border-slate-800 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                      <div>Décision : <strong className="text-slate-100">{alert.assessment.decision}</strong></div>
                      <div>Analyste : <strong className="text-slate-100">{alert.assessment.assessedBy}</strong></div>
                      <div>Date : <span className="font-mono text-slate-400">{new Date(alert.assessment.assessedAt).toLocaleString('fr-FR')}</span></div>
                      <div>Confiance validée : <strong className="text-slate-100">{alert.assessment.confidenceAssigned}</strong></div>
                    </div>
                    {alert.assessment.confirmationBasis && (
                      <div className="text-emerald-300/90 pt-1 border-t border-slate-800">
                        <strong>Base de confirmation :</strong> {alert.assessment.confirmationBasis}
                      </div>
                    )}
                    {alert.assessment.dismissalReason && (
                      <div className="text-rose-300/90 pt-1 border-t border-slate-800">
                        <strong>Motif d'infirmation :</strong> {alert.assessment.dismissalReason}
                      </div>
                    )}
                    <div className="text-slate-300 pt-1 border-t border-slate-800">
                      <strong>Note d'analyse :</strong> {alert.assessment.analystNote}
                    </div>
                    <div className="text-slate-400">
                      <strong>Justification méthodologique :</strong> {alert.assessment.justification}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-slate-950/60 rounded-lg p-3.5 border border-slate-800">
                    <p className="text-xs text-slate-400">
                      Aucune qualification humaine formelle n'a encore été enregistrée pour ce signal.
                    </p>
                    <button
                      onClick={() => onOpenAssessment(alert)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shrink-0 ml-3"
                    >
                      Qualifier l'Alerte
                    </button>
                  </div>
                )}
              </div>

              {/* Tags & Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Catégorie</span>
                  <span className="font-semibold text-slate-200">{alert.category}</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Sévérité potentielle</span>
                  <span className="font-semibold text-slate-200">{alert.severity}</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Niveau d'indépendance</span>
                  <span className="font-semibold text-slate-200">{alert.independenceLevel || 'UNKNOWN'}</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Contradiction</span>
                  <span className="font-semibold text-slate-200">{alert.contradictionLevel || 'NONE'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SCORE & EXPLICABILITY */}
          {activeTab === 'score' && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">
                    Décomposition Transparente du Score de Priorisation
                  </h4>
                  <p className="text-xs text-slate-400">
                    Calcul mathématique local basé sur les critères de récence, gouvernance, convergence et criticité.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-amber-400">
                    {alert.priorityScore || 0}<span className="text-xs text-slate-500 font-normal">/100</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">{alert.priority}</span>
                </div>
              </div>

              {/* Factors Breakdown Table */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Facteurs de Pondération
                </h5>
                {alert.priorityFactors && alert.priorityFactors.length > 0 ? (
                  <div className="space-y-2">
                    {alert.priorityFactors.map((factor, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-200 flex items-center gap-2">
                            <span>{factor.name}</span>
                            <span className="text-[10px] font-mono text-slate-500">[{factor.code}]</span>
                          </div>
                          <p className="text-slate-400 text-[11px]">{factor.reason}</p>
                        </div>
                        <div className="text-right font-mono shrink-0">
                          <span className={`font-bold ${factor.score >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {factor.score > 0 ? `+${factor.score}` : factor.score} pts
                          </span>
                          {factor.weight > 0 && (
                            <span className="text-[10px] text-slate-500 block">max {factor.weight}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 bg-slate-900/40 p-4 rounded-xl text-center">
                    Facteurs détaillés calculés lors de l'ingestion.
                  </div>
                )}
              </div>

              {/* Reasons List */}
              {alert.reasons && alert.reasons.length > 0 && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Justifications Automatisées de Détection
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {alert.reasons.map((r, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB: PROVENANCE & SHA-256 */}
          {activeTab === 'provenance' && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-amber-400" />
                  <span>Intégrité Cryptographique & Empreinte</span>
                </h4>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Algorithme : <strong className="text-slate-200">{alert.hashAlgorithm || 'SHA-256'}</strong></span>
                    <button
                      onClick={() => copyToClipboard(alert.contentHash || '')}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedHash ? 'Copié !' : 'Copier le hash'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
                    {alert.contentHash || 'Non disponible'}
                  </div>
                </div>
              </div>

              {/* Pipeline Links */}
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Traçabilité du Pipeline de Veille (LOTS 23-B / 24 / 25)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">sourceId</span>
                    <span className="font-mono text-slate-200">{alert.sourceId || 'N/A'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">connectorId</span>
                    <span className="font-mono text-slate-200">{alert.connectorId || 'N/A'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">watchPlanId</span>
                    <span className="font-mono text-slate-200">{alert.watchPlanId || 'N/A'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">executionId</span>
                    <span className="font-mono text-slate-200">{alert.executionId || 'N/A'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">rawItemId</span>
                    <span className="font-mono text-slate-200">{alert.rawItemId || 'N/A'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">normalizedItemId</span>
                    <span className="font-mono text-slate-200">{alert.normalizedItemId || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONVERGENCE & CONTRADICTIONS */}
          {activeTab === 'convergence' && (
            <div className="space-y-4">
              {/* Group Convergence */}
              {group ? (
                <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Groupe de Convergence Rattaché
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300">
                      Score Convergence : {group.convergenceScore}/100
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{group.title}</h4>
                  <p className="text-xs text-slate-300">{group.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>Alertes associées : <strong className="text-slate-200">{group.alertIds.length}</strong></span>
                    <span>Sources impliquées : <strong className="text-slate-200">{group.sourceIds.length}</strong></span>
                    <span>Indépendance : <strong className="text-slate-200">{group.independenceLevel}</strong></span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800 text-xs text-slate-400 text-center">
                  Aucun groupe de convergence multi-sources consolidé pour ce signal unique.
                </div>
              )}

              {/* Contradictions */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-purple-400" />
                  <span>Divergences Factuelles & Contradictions Identifiées</span>
                </h5>
                {alert.contradictions && alert.contradictions.length > 0 ? (
                  <div className="space-y-2.5">
                    {alert.contradictions.map((ctrd) => (
                      <div key={ctrd.id} className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-300">{ctrd.field}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/30 text-purple-200">
                            {ctrd.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                          <div className="p-2 bg-slate-950 rounded border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">Valeur / Thèse A</span>
                            {ctrd.valueA}
                          </div>
                          <div className="p-2 bg-slate-950 rounded border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">Valeur / Thèse B</span>
                            {ctrd.valueB}
                          </div>
                        </div>
                        {ctrd.analystAssessment && (
                          <div className="text-slate-400 text-[11px] pt-1">
                            <strong>Note d'arbitrage :</strong> {ctrd.analystAssessment}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800 text-xs text-slate-400 text-center">
                    Aucune contradiction documentée avec les autres signaux indexés.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: AUDIT & ACTIONS */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Journal d'Audit Immuable de l'Alerte
              </h5>
              <div className="space-y-2">
                {alertActions.map((act) => (
                  <div key={act.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{act.action}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{act.actor}</span>
                      </div>
                      {act.note && <p className="text-slate-300 text-[11px]">{act.note}</p>}
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 shrink-0">
                      {new Date(act.timestamp).toLocaleString('fr-FR')}
                    </span>
                  </div>
                ))}
                {alertAudits.map((aud) => (
                  <div key={aud.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400">{aud.action}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{aud.actor}</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{aud.reason}</p>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 shrink-0">
                      {new Date(aud.timestamp).toLocaleString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-6 py-3.5 border-t border-slate-800 bg-[#0d121d]">
          <div className="flex items-center gap-2">
            {alert.status === 'NEW' && (
              <button
                type="button"
                onClick={() => onTriage(alert.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Prendre en charge (Triage)
              </button>
            )}
            {alert.status === 'TRIAGED' && (
              <button
                type="button"
                onClick={() => onStartReview(alert.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
              >
                Démarrer la Revue d'Analyse
              </button>
            )}
            {alert.status !== 'RESOLVED' && alert.status !== 'ARCHIVED' && (
              <button
                type="button"
                onClick={() => onResolve(alert.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors"
              >
                Clôturer / Résoudre
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={() => onOpenAssessment(alert)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-lg shadow-amber-950/50 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Arbitrer / Qualifier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
