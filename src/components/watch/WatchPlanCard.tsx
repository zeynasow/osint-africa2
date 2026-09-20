import React from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  Clock,
  MapPin,
  Tag,
  Radio,
  HelpCircle,
  FileCheck,
  ChevronRight,
  User,
  Sparkles,
  Download,
} from 'lucide-react';
import { OsintWatchPlan } from '../../types';
import { watchPilotService, PriorityScoreBreakdown } from '../../services/watchPilotService';

interface WatchPlanCardProps {
  plan: OsintWatchPlan;
  onSelect: (plan: OsintWatchPlan) => void;
  onAddAction: (plan: OsintWatchPlan) => void;
  onNewReview: (plan: OsintWatchPlan) => void;
}

export const WatchPlanCard: React.FC<WatchPlanCardProps> = ({
  plan,
  onSelect,
  onAddAction,
  onNewReview,
}) => {
  const priorityBreakdown: PriorityScoreBreakdown = watchPilotService.calculatePriorityScore(plan);
  const actions = watchPilotService.getActions(plan.id, 'ALL');
  const gaps = watchPilotService.getGaps(plan.id, 'ALL');
  const openGaps = gaps.filter((g) => g.status === 'OUVERT' || g.status === 'EN_COURS');

  // Formatage du délai de revue
  let reviewNotice = 'Non définie';
  let isOverdue = false;
  let isSoon = false;
  if (plan.nextReviewAt) {
    const diffMs = new Date(plan.nextReviewAt).getTime() - Date.now();
    const diffDays = Math.ceil(diffMs / (1000 * 3600 * 24));
    if (diffDays < 0) {
      reviewNotice = `En retard (${Math.abs(diffDays)} j)`;
      isOverdue = true;
    } else if (diffDays === 0) {
      reviewNotice = "Aujourd'hui";
      isSoon = true;
    } else if (diffDays <= 2) {
      reviewNotice = `Dans ${diffDays} j`;
      isSoon = true;
    } else {
      reviewNotice = `Dans ${diffDays} j`;
    }
  }

  // Couleur du score
  let scoreColorClass = 'text-blue-400 border-blue-500/30 bg-blue-950/40';
  let progressColorClass = 'bg-blue-500';
  if (priorityBreakdown.score >= 80) {
    scoreColorClass = 'text-rose-400 border-rose-500/30 bg-rose-950/40';
    progressColorClass = 'bg-rose-500';
  } else if (priorityBreakdown.score >= 60) {
    scoreColorClass = 'text-amber-400 border-amber-500/30 bg-amber-950/40';
    progressColorClass = 'bg-amber-500';
  }

  // Couleurs de statut
  const getStatusBadge = () => {
    switch (plan.status) {
      case 'ACTIF':
      case 'ACTIVE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800">ACTIF</span>;
      case 'SOUS_SURVEILLANCE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/70 text-amber-400 border border-amber-800">SOUS SURVEILLANCE</span>;
      case 'SUSPENDU':
      case 'PAUSED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">SUSPENDU</span>;
      case 'BROUILLON':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950/70 text-indigo-300 border border-indigo-800">BROUILLON</span>;
      case 'ARCHIVE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 text-zinc-500 border border-zinc-800">ARCHIVÉ</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">{plan.status}</span>;
    }
  };

  const getPriorityBadge = () => {
    switch (plan.priority) {
      case 'CRITIQUE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900/60 text-rose-300 border border-rose-700">CRITIQUE</span>;
      case 'ELEVEE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-900/60 text-orange-300 border border-orange-700">ÉLEVÉE</span>;
      case 'MOYENNE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-900/60 text-blue-300 border border-blue-700">MOYENNE</span>;
      case 'FAIBLE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">FAIBLE</span>;
      default:
        return null;
    }
  };

  return (
    <div
      id={`watch-card-${plan.id}`}
      className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-lg p-5 flex flex-col justify-between gap-4 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <div className="space-y-3">
        {/* En-tête : Badges de statut, priorité et réel/démo */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {plan.isDemo ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800/80">
                SANDBOX DÉMO
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                VEILLE RÉELLE (APS)
              </span>
            )}
            {getStatusBadge()}
            {getPriorityBadge()}
          </div>

          {/* Jauge du score de priorité analytique */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${scoreColorClass}`}
            title="Score transparent de priorité de traitement (Attention analytique requise)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Score : {priorityBreakdown.score}/100</span>
          </div>
        </div>

        {/* Titre et description */}
        <div>
          <h3 className="text-base font-bold text-slate-100 line-clamp-2 hover:text-blue-400 cursor-pointer" onClick={() => onSelect(plan)}>
            {plan.title || plan.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {plan.objective || plan.description}
          </p>
        </div>

        {/* Barre de progression du score transparent */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>Priorité de traitement</span>
            <span>{priorityBreakdown.score}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${progressColorClass}`}
              style={{ width: `${priorityBreakdown.score}%` }}
            />
          </div>
        </div>

        {/* Données géographiques et catégories */}
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 pt-1">
          {plan.countries && plan.countries.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="text-slate-300 truncate max-w-[170px]">
                {plan.countries.join(', ')}
              </span>
            </div>
          )}

          {plan.categories && plan.categories.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80">
              <Tag className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="text-slate-300 truncate max-w-[150px]">
                {plan.categories.slice(0, 2).join(', ')}
                {plan.categories.length > 2 ? ` (+${plan.categories.length - 2})` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Métriques d'intelligence rattachées */}
        <div className="grid grid-cols-4 gap-1 py-2 bg-slate-950/60 rounded-md border border-slate-800/60 text-center">
          <div className="p-1">
            <div className="text-xs font-bold text-slate-200">
              {(plan.linkedAlertIds || []).length}
            </div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">Alertes</div>
          </div>
          <div className="p-1 border-l border-slate-800">
            <div className="text-xs font-bold text-slate-200">
              {(plan.linkedWeakSignalIds || []).length + (plan.linkedAnomalyIds || []).length}
            </div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">Signaux</div>
          </div>
          <div className="p-1 border-l border-slate-800">
            <div className={`text-xs font-bold ${openGaps.length > 0 ? 'text-orange-400' : 'text-slate-200'}`}>
              {openGaps.length}
            </div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">Gaps</div>
          </div>
          <div className="p-1 border-l border-slate-800">
            <div className="text-xs font-bold text-slate-200">
              {actions.length}
            </div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">Actions</div>
          </div>
        </div>

        {/* Prochaine revue & Analyste */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-1 text-[11px]">
            <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-400' : isSoon ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>Revue : </span>
            <span className={`font-semibold ${isOverdue ? 'text-rose-400' : isSoon ? 'text-amber-400' : 'text-slate-300'}`}>
              {reviewNotice}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-[130px]">
            <User className="w-3 h-3 text-slate-500" />
            <span className="truncate">{plan.analystId || 'Analyste référent'}</span>
          </div>
        </div>
      </div>

      {/* Boutons d'action en bas de carte */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onAddAction(plan)}
            title="Ajouter une action analytique de veille"
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs font-medium transition-colors"
          >
            + Action
          </button>
          <button
            type="button"
            onClick={() => onNewReview(plan)}
            title="Consigner une nouvelle revue analytique humaine"
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs font-medium transition-colors"
          >
            Revue
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSelect(plan)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
        >
          <span>Consulter le plan</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
