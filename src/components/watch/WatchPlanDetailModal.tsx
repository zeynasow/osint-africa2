import React, { useState } from 'react';
import {
  X,
  Shield,
  Clock,
  Sparkles,
  MapPin,
  Tag,
  Search,
  User,
  AlertTriangle,
  Radio,
  FileCheck2,
  TrendingUp,
  HelpCircle,
  Download,
  Edit3,
  Plus,
  Scale,
  Calendar,
  Layers,
  History,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  OsintWatchPlan,
  OsintWatchAction,
  OsintWatchReview,
  OsintWatchGap,
  OsintWatchContradiction,
  WatchPlanStatus,
} from '../../types';
import { watchPilotService, PriorityScoreBreakdown } from '../../services/watchPilotService';

interface WatchPlanDetailModalProps {
  plan: OsintWatchPlan;
  onClose: () => void;
  onEditPlan: (plan: OsintWatchPlan) => void;
  onAddAction: (plan: OsintWatchPlan) => void;
  onNewReview: (plan: OsintWatchPlan) => void;
  onAddGap: (plan: OsintWatchPlan) => void;
  onResolveGap: (plan: OsintWatchPlan, gap: OsintWatchGap) => void;
  onAddContradiction: (plan: OsintWatchPlan) => void;
  onArbitrateContradiction: (plan: OsintWatchPlan, contradiction: OsintWatchContradiction) => void;
  onPlanStatusChange: (plan: OsintWatchPlan, newStatus: WatchPlanStatus) => void;
}

type DetailTab =
  | 'SYNTHESE'
  | 'MATRICE'
  | 'INTELLIGENCE'
  | 'CHRONOLOGIE'
  | 'QUESTIONS_GAPS'
  | 'ACTIONS'
  | 'REVUES'
  | 'CONTRADICTIONS'
  | 'AUDIT';

export const WatchPlanDetailModal: React.FC<WatchPlanDetailModalProps> = ({
  plan,
  onClose,
  onEditPlan,
  onAddAction,
  onNewReview,
  onAddGap,
  onResolveGap,
  onAddContradiction,
  onArbitrateContradiction,
  onPlanStatusChange,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('SYNTHESE');

  const priorityBreakdown: PriorityScoreBreakdown = watchPilotService.calculatePriorityScore(plan);
  const actions: OsintWatchAction[] = watchPilotService.getActions(plan.id, 'ALL');
  const reviews: OsintWatchReview[] = watchPilotService.getReviews(plan.id, 'ALL');
  const gaps: OsintWatchGap[] = watchPilotService.getGaps(plan.id, 'ALL');
  const contradictions: OsintWatchContradiction[] = watchPilotService.getContradictions(plan.id, 'ALL');
  const audits = watchPilotService.getAuditLogs(plan.id, 'ALL');

  const handleExportPlan = () => {
    const jsonStr = watchPilotService.exportWatchPlanJson(plan.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OSINT_WATCH_PLAN_${plan.id}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleActionStatus = (action: OsintWatchAction) => {
    const nextStatus = action.status === 'TERMINEE' ? 'EN_COURS' : 'TERMINEE';
    watchPilotService.updateActionStatus(
      action.id,
      nextStatus,
      'Analyste Pôle Veille',
      'Mise à jour rapide du statut depuis la fiche détaillée'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-5xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* En-tête de la fiche de pilotage */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                {plan.isDemo ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                    SANDBOX DÉMO
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    VEILLE RÉELLE (APS)
                  </span>
                )}

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                  STATUT : {plan.status}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    plan.priority === 'CRITIQUE'
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : plan.priority === 'ELEVEE'
                      ? 'bg-orange-950 text-orange-300 border-orange-700'
                      : 'bg-blue-950 text-blue-300 border-blue-700'
                  }`}
                >
                  PRIORITÉ : {plan.priority || 'MOYENNE'}
                </span>

                <span className="text-xs text-slate-400">
                  ID: <code className="text-slate-300 font-mono">{plan.id}</code>
                </span>
              </div>

              <h1 className="text-lg sm:text-xl font-bold text-slate-100">
                {plan.title || plan.name}
              </h1>
            </div>

            {/* Score & Bouton Fermer */}
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-xs ${
                  priorityBreakdown.score >= 80
                    ? 'text-rose-400 border-rose-500/40 bg-rose-950/40'
                    : priorityBreakdown.score >= 60
                    ? 'text-amber-400 border-amber-500/40 bg-amber-950/40'
                    : 'text-blue-400 border-blue-500/40 bg-blue-950/40'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Score : {priorityBreakdown.score}/100</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Barre de boutons d'actions rapides */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onAddAction(plan)}
                className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter une action
              </button>

              <button
                type="button"
                onClick={() => onNewReview(plan)}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                Formaliser une revue
              </button>

              <button
                type="button"
                onClick={() => onAddGap(plan)}
                className="flex items-center gap-1 px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Signaler un Gap
              </button>

              <button
                type="button"
                onClick={() => onAddContradiction(plan)}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
              >
                <Scale className="w-3.5 h-3.5" />
                Divergence documentaire
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Sélecteur de statut rapide */}
              <select
                value={plan.status}
                onChange={(e) => onPlanStatusChange(plan, e.target.value as WatchPlanStatus)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-500"
              >
                <option value="ACTIF">Statut : ACTIF</option>
                <option value="SOUS_SURVEILLANCE">Statut : SOUS SURVEILLANCE</option>
                <option value="SUSPENDU">Statut : SUSPENDU</option>
                <option value="BROUILLON">Statut : BROUILLON</option>
                <option value="ARCHIVE">Statut : ARCHIVÉ</option>
              </select>

              <button
                type="button"
                onClick={() => onEditPlan(plan)}
                title="Éditer les paramètres du plan"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleExportPlan}
                title="Télécharger l'instantané JSON complet"
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                Export JSON
              </button>
            </div>
          </div>

          {/* Onglets de navigation */}
          <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-800/80 pt-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('SYNTHESE')}
              className={`px-3 py-1.5 rounded-t-md font-medium whitespace-nowrap transition-colors ${
                activeTab === 'SYNTHESE'
                  ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Synthèse & Objectif
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MATRICE')}
              className={`px-3 py-1.5 rounded-t-md font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'MATRICE'
                  ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Matrice de Priorisation</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] text-blue-400 font-bold">
                {priorityBreakdown.score}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('INTELLIGENCE')}
              className={`px-3 py-1.5 rounded-t-md font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'INTELLIGENCE'
                  ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Intelligence Associée</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] text-slate-300">
                {(plan.linkedAlertIds || []).length + (plan.linkedWeakSignalIds || []).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('CHRONOLOGIE')}
              className={`px-3 py-1.5 rounded-t-md font-medium whitespace-nowrap transition-colors ${
                activeTab === 'CHRONOLOGIE'
                  ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Chronologie
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ACTIONS')}
              className={`px-3 py-1.5 rounded-t-md font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'ACTIONS'
                  ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Actions</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] text-blue-400">
                {actions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('REVUES')}
              className={`px-3 py-1.5 rounded-t-md font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'REVUES'
                  ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Revues Humaines</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] text-emerald-400">
                {reviews.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('QUESTIONS_GAPS')}
              className={`px-3 py-1.5 rounded-t-md font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'QUESTIONS_GAPS'
                  ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Questions & Gaps</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] text-orange-400">
                {gaps.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('CONTRADICTIONS')}
              className={`px-3 py-1.5 rounded-t-md font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'CONTRADICTIONS'
                  ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Contradictions</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] text-amber-400">
                {contradictions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('AUDIT')}
              className={`px-3 py-1.5 rounded-t-md font-medium whitespace-nowrap transition-colors ${
                activeTab === 'AUDIT'
                  ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Audit ({audits.length})
            </button>
          </div>
        </div>

        {/* Corps de l'onglet actif */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-300 space-y-6">
          {/* ================================================================= */}
          {/* ONGLET 1 : SYNTHÈSE & OBJECTIF */}
          {/* ================================================================= */}
          {activeTab === 'SYNTHESE' && (
            <div className="space-y-6">
              {/* Description et Objectif */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Objectif de la veille
                  </h3>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {plan.objective || 'Non spécifié.'}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Cadre contextuel
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {plan.description}
                  </p>
                </div>
              </div>

              {/* Paramètres géographiques et thématiques */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Pays & Régions suivis
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(plan.countries || []).map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200">
                        {c}
                      </span>
                    ))}
                    {(plan.regions || []).map((r) => (
                      <span key={r} className="px-2 py-0.5 rounded bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    Catégories prioritaires
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(plan.categories || []).map((cat) => (
                      <span key={String(cat)} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200">
                        {String(cat)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    Termes & Critères de signaux
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(plan.searchTerms || []).map((term) => (
                      <span key={term} className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-blue-300">
                        #{term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Responsabilités & Cycles de revue */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Analyste responsable</span>
                  <strong className="text-slate-200 text-sm">{plan.analystId || 'Pôle Veille'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Fréquence de revue</span>
                  <strong className="text-slate-200 text-sm">{plan.reviewFrequency || 'WEEKLY'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Dernière revue effectuée</span>
                  <span className="text-slate-300">
                    {plan.lastReviewAt ? new Date(plan.lastReviewAt).toLocaleDateString('fr-FR') : 'Aucune revue'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Prochaine revue planifiée</span>
                  <strong className="text-amber-400">
                    {plan.nextReviewAt ? new Date(plan.nextReviewAt).toLocaleDateString('fr-FR') : 'À planifier'}
                  </strong>
                </div>
              </div>

              {/* Notes et consignes */}
              {plan.notes && (
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-1">
                  <span className="font-semibold text-slate-300 block">Consignes & Notes de méthodologie :</span>
                  <p className="text-slate-400">{plan.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* ONGLET 2 : MATRICE DE PRIORISATION TRANSPARENTE */}
          {/* ================================================================= */}
          {activeTab === 'MATRICE' && (
            <div className="space-y-5">
              {/* Carte Score */}
              <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-slate-400">Calcul transparent :</span>
                    <span className="text-xs font-semibold text-blue-400">{priorityBreakdown.label}</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-100">
                    {priorityBreakdown.score} / 100
                  </h2>
                  <p className="text-xs text-amber-400/90 max-w-xl font-medium">
                    {priorityBreakdown.doctrinalDisclaimer}
                  </p>
                </div>

                <div className="w-full md:w-64 space-y-1 shrink-0">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Niveau de priorité</span>
                    <span className="font-bold text-slate-200">{priorityBreakdown.score}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        priorityBreakdown.score >= 80
                          ? 'bg-rose-500'
                          : priorityBreakdown.score >= 60
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${priorityBreakdown.score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tableau déterministe des 6 facteurs */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-300">
                  Décomposition mathématique explicable des facteurs
                </div>
                <div className="divide-y divide-slate-800/80">
                  {priorityBreakdown.factors.map((f, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                      <div className="space-y-0.5 flex-1">
                        <div className="font-semibold text-slate-200 text-sm">{f.name}</div>
                        <div className="text-slate-400">{f.reason}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-blue-400 text-sm">
                          +{f.score} / {f.weight} pts
                        </div>
                        <div className="text-[10px] text-slate-500">Pondération fixe</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* ONGLET 3 : INTELLIGENCE ASSOCIÉE */}
          {/* ================================================================= */}
          {activeTab === 'INTELLIGENCE' && (
            <div className="space-y-5">
              {/* Alertes rattachées */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Alertes qualifiées rattachées ({(plan.linkedAlertIds || []).length})
                  </h3>
                  <span className="text-[11px] text-slate-500">Alerte ≠ Événement confirmé</span>
                </div>
                {(plan.linkedAlertIds || []).length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Aucune alerte active liée à ce plan.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(plan.linkedAlertIds || []).map((altId) => (
                      <div key={altId} className="p-2.5 bg-slate-900 border border-slate-800 rounded flex items-center justify-between text-xs">
                        <div className="font-mono text-slate-300 font-semibold">{altId}</div>
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-bold">QUALIFIÉE</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Signaux faibles & Anomalies */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Radio className="w-4 h-4" />
                    Signaux faibles & Anomalies sous observation
                  </h3>
                  <span className="text-[11px] text-slate-500">Signal faible ≠ Menace imminente</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(plan.linkedWeakSignalIds || []).map((sigId) => (
                    <div key={sigId} className="p-2.5 bg-slate-900 border border-slate-800 rounded flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-slate-300 block font-semibold">{sigId}</span>
                        <span className="text-[11px] text-slate-400">Signal faible précurseur</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-semibold">ACTIF</span>
                    </div>
                  ))}
                  {(plan.linkedAnomalyIds || []).map((anoId) => (
                    <div key={anoId} className="p-2.5 bg-slate-900 border border-slate-800 rounded flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-slate-300 block font-semibold">{anoId}</span>
                        <span className="text-[11px] text-slate-400">Anomalie statistique locale</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-semibold">À REVÉRIFIER</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Indicateurs suivis */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    Indicateurs précurseurs rattachés
                  </h3>
                  <span className="text-[11px] text-slate-500">Seuils et variations déterministes</span>
                </div>
                <div className="space-y-2">
                  {(plan.linkedIndicatorIds || []).map((indId) => (
                    <div key={indId} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between gap-4 text-xs">
                      <div>
                        <strong className="text-slate-200 block text-sm">{indId}</strong>
                        <span className="text-slate-400">Mesure locale de volume et divergence multi-sources</span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-amber-950 border border-amber-800 text-amber-300 font-semibold">
                        SOUS SURVEILLANCE
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* ONGLET 4 : CHRONOLOGIE MULTI-FLUX */}
          {/* ================================================================= */}
          {activeTab === 'CHRONOLOGIE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-blue-400" />
                  Chronologie intégrée des événements et jalons de veille
                </h3>
                <span className="text-xs text-slate-500">Tri antichronologique</span>
              </div>

              <div className="space-y-3 border-l-2 border-slate-800 pl-4 ml-2">
                {/* Derniers jalons réels et simulés */}
                <div className="relative space-y-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 absolute -left-[21px] top-1" />
                  <div className="text-[11px] text-slate-400">
                    {new Date(plan.updatedAt).toLocaleString('fr-FR')}
                  </div>
                  <div className="font-semibold text-slate-200 text-xs">Dernière mise à jour du plan de veille</div>
                  <p className="text-xs text-slate-400">Actualisation des métriques et synchronisation locale.</p>
                </div>

                {reviews.map((r) => (
                  <div key={r.id} className="relative space-y-1 pt-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[21px] top-3" />
                    <div className="text-[11px] text-emerald-400 font-medium">
                      {new Date(r.reviewDate).toLocaleString('fr-FR')} • Revue Humaine Formelle
                    </div>
                    <div className="font-semibold text-slate-200 text-xs">{r.conclusion}</div>
                    <p className="text-xs text-slate-400">Analyste : {r.analystId} (Confiance : {r.confidence})</p>
                  </div>
                ))}

                {actions.map((a) => (
                  <div key={a.id} className="relative space-y-1 pt-2">
                    <span className={`w-2.5 h-2.5 rounded-full absolute -left-[21px] top-3 ${a.status === 'TERMINEE' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <div className="text-[11px] text-slate-400">
                      {new Date(a.createdAt).toLocaleString('fr-FR')} • Action ({a.type})
                    </div>
                    <div className="font-semibold text-slate-200 text-xs">{a.title}</div>
                    <p className="text-xs text-slate-400">Assigné : {a.assignedTo} — Échéance : {a.dueDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* ONGLET 5 : ACTIONS DE VEILLE */}
          {/* ================================================================= */}
          {activeTab === 'ACTIONS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Actions de veille et vérification ({actions.length})
                </h3>
                <button
                  type="button"
                  onClick={() => onAddAction(plan)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nouvelle action
                </button>
              </div>

              {actions.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-lg border border-slate-800 text-slate-500 text-xs">
                  Aucune action consignée pour ce plan. Cliquez sur « Nouvelle action » pour en créer une.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {actions.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              act.status === 'TERMINEE'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {act.status}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                            {act.type}
                          </span>
                          <span className="text-slate-400">Échéance : {act.dueDate}</span>
                        </div>
                        <div className="font-semibold text-slate-200 text-sm">{act.title}</div>
                        {act.description && <p className="text-slate-400">{act.description}</p>}
                        {act.justification && (
                          <p className="text-emerald-400/90 text-[11px] font-medium">
                            Clôture : {act.justification}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleActionStatus(act)}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                            act.status === 'TERMINEE'
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                          }`}
                        >
                          {act.status === 'TERMINEE' ? 'Rouvrir' : 'Marquer terminée'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* ONGLET 6 : REVUES ANALYTIQUES HUMAINES */}
          {/* ================================================================= */}
          {activeTab === 'REVUES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Revues analytiques formelles consignées ({reviews.length})
                </h3>
                <button
                  type="button"
                  onClick={() => onNewReview(plan)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nouvelle revue humaine
                </button>
              </div>

              {reviews.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-lg border border-slate-800 text-slate-500 text-xs">
                  Aucune revue formelle enregistrée. La revue humaine périodique permet de valider les faits et d’arbitrer les contradictions.
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 bg-slate-950 border border-slate-800 rounded-lg space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200 text-sm">
                            Revue du {new Date(rev.reviewDate).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="text-slate-400">par {rev.analystId}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-semibold text-[10px]">
                          Confiance : {rev.confidence}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 font-semibold block mb-1">Évaluation globale :</span>
                        <p className="text-slate-200 leading-relaxed">{rev.assessment}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                        <div className="space-y-1">
                          <span className="font-semibold text-emerald-400 block">Faits constatés :</span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                            {rev.facts.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1">
                          <span className="font-semibold text-amber-400 block">Éléments non confirmés :</span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                            {rev.unconfirmedInformation.length > 0 ? (
                              rev.unconfirmedInformation.map((u, i) => <li key={i}>{u}</li>)
                            ) : (
                              <li className="text-slate-500 italic">Aucun élément non confirmé signalé</li>
                            )}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60">
                        <span className="font-semibold text-slate-300 block mb-0.5">Conclusion motivée :</span>
                        <p className="text-slate-200 font-medium">{rev.conclusion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* ONGLET 7 : QUESTIONS ANALYTIQUES & GAPS */}
          {/* ================================================================= */}
          {activeTab === 'QUESTIONS_GAPS' && (
            <div className="space-y-5">
              {/* Questions analytiques */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Questions directrices d’analyse OSINT
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {(plan.analyticalQuestions || []).length > 0 ? (
                    (plan.analyticalQuestions || []).map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{q}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500 italic">Aucune question directrice enregistrée.</li>
                  )}
                </ul>
              </div>

              {/* Lacunes d'information (Gaps) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    Lacunes d’information & Zones grises ({gaps.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => onAddGap(plan)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-semibold shadow transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Signaler une lacune
                  </button>
                </div>

                <div className="space-y-2.5">
                  {gaps.map((g) => (
                    <div
                      key={g.id}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              g.status === 'RESOLU'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-orange-950 text-orange-300 border border-orange-800'
                            }`}
                          >
                            {g.status}
                          </span>
                          <span className="text-slate-400">Priorité : {g.priority}</span>
                          <span className="text-slate-500">Responsable : {g.responsable}</span>
                        </div>
                        <div className="font-semibold text-slate-200 text-sm">{g.title}</div>
                        {g.description && <p className="text-slate-400">{g.description}</p>}
                        {g.justification && (
                          <p className="text-emerald-400 text-[11px] font-medium">
                            Résolution : {g.justification}
                          </p>
                        )}
                      </div>

                      {g.status !== 'RESOLU' && (
                        <button
                          type="button"
                          onClick={() => onResolveGap(plan, g)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold shrink-0"
                        >
                          Résoudre avec justification
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* ONGLET 8 : CONTRADICTIONS ENTRE SOURCES */}
          {/* ================================================================= */}
          {activeTab === 'CONTRADICTIONS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  Divergences et contradictions documentaires ({contradictions.length})
                </h3>
                <button
                  type="button"
                  onClick={() => onAddContradiction(plan)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold shadow transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Consigner une divergence
                </button>
              </div>

              {contradictions.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-lg border border-slate-800 text-slate-500 text-xs">
                  Aucune divergence de source relevée. Lorsqu'une disparité factuelle apparaît, elle doit être consignée sans suppression arbitraire.
                </div>
              ) : (
                <div className="space-y-3">
                  {contradictions.map((ctrd) => (
                    <div
                      key={ctrd.id}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200 text-sm">{ctrd.title}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                            {ctrd.category}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            ctrd.status === 'RESOLUE'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : ctrd.status === 'EN_EXAMEN'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {ctrd.status}
                        </span>
                      </div>

                      {/* Source A vs Source B */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                          <strong className="text-blue-400 block text-xs mb-1">
                            Source A : {ctrd.sourceA}
                          </strong>
                          <p className="text-slate-300 italic">« {ctrd.claimA} »</p>
                        </div>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                          <strong className="text-amber-400 block text-xs mb-1">
                            Source B : {ctrd.sourceB}
                          </strong>
                          <p className="text-slate-300 italic">« {ctrd.claimB} »</p>
                        </div>
                      </div>

                      {ctrd.resolutionNotes && (
                        <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded text-slate-300">
                          <strong className="text-slate-400 block text-[11px]">Arbitrage analytique :</strong>
                          <p className="text-slate-200">{ctrd.resolutionNotes}</p>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => onArbitrateContradiction(plan, ctrd)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
                        >
                          Modifier l'arbitrage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* ONGLET 9 : AUDIT APPEND-ONLY */}
          {/* ================================================================= */}
          {activeTab === 'AUDIT' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Journal d’audit infalsifiable (Append-only) — {audits.length} entrées
                </h3>
                <span className="text-xs text-slate-500">Traçabilité complète</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-800/80">
                {audits.map((aud) => (
                  <div key={aud.id} className="p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-mono text-slate-300 font-bold">{aud.action}</span>
                      <span>{new Date(aud.timestamp).toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="text-slate-300">
                      Analyste : <strong className="text-slate-100">{aud.analystId}</strong> • Objet :{' '}
                      <span className="font-mono text-blue-400">{aud.objectType}</span> ({aud.objectId})
                    </div>
                    {aud.previousValue && (
                      <div className="text-slate-500 text-[11px]">Avant : {aud.previousValue}</div>
                    )}
                    {aud.newValue && (
                      <div className="text-emerald-400 text-[11px]">Après : {aud.newValue}</div>
                    )}
                    <div className="text-slate-400 text-[11px]">Motif : {aud.justification}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pied de modal */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Plateforme OSINT AFRICA • LOT 29 Centre de Pilotage de la Veille</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
