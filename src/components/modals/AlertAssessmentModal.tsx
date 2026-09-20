import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Eye,
  Copy,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import {
  OsintAlert,
  AlertAssessmentDecision,
  OsintAlertAssessment,
  OsintAlertConfidence,
  OsintAlertPriority,
} from '../../types';

interface Props {
  alert: OsintAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveAssessment: (alertId: string, assessment: OsintAlertAssessment) => Promise<void> | void;
}

export const AlertAssessmentModal: React.FC<Props> = ({
  alert,
  isOpen,
  onClose,
  onSaveAssessment,
}) => {
  if (!isOpen || !alert) return null;

  const [decision, setDecision] = useState<AlertAssessmentDecision>('CONFIRMED');
  const [analystNote, setAnalystNote] = useState<string>(alert.analystNote || '');
  const [justification, setJustification] = useState<string>('');
  const [confirmationBasis, setConfirmationBasis] = useState<string>('');
  const [dismissalReason, setDismissalReason] = useState<string>('');
  const [escalationReason, setEscalationReason] = useState<string>('');
  const [assignedConfidence, setAssignedConfidence] = useState<OsintAlertConfidence>(alert.confidence || 'HIGH');
  const [assignedPriority, setAssignedPriority] = useState<OsintAlertPriority>(alert.priority || 'P2_HIGH');
  const [analystName, setAnalystName] = useState<string>('Analyste Renseignement - O. Fall');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!analystNote.trim()) {
      setErrorMsg('La note d’analyse est strictement obligatoire.');
      return;
    }

    if (!justification.trim()) {
      setErrorMsg('La justification méthodologique est strictement obligatoire.');
      return;
    }

    if (decision === 'CONFIRMED' && !confirmationBasis.trim()) {
      setErrorMsg('La base factuelle de confirmation est obligatoire pour valider une alerte.');
      return;
    }

    if (decision === 'DISMISSED' && !dismissalReason.trim()) {
      setErrorMsg('Le motif formel d’infirmation est obligatoire pour écarter un signal.');
      return;
    }

    if (decision === 'ESCALATED' && !escalationReason.trim()) {
      setErrorMsg('Le motif d’escalade prioritaire est obligatoire.');
      return;
    }

    const assessment: OsintAlertAssessment = {
      alertId: alert.id,
      decision,
      analystNote: analystNote.trim(),
      justification: justification.trim(),
      confirmationBasis: decision === 'CONFIRMED' ? confirmationBasis.trim() : undefined,
      dismissalReason: decision === 'DISMISSED' ? dismissalReason.trim() : undefined,
      escalationReason: decision === 'ESCALATED' ? escalationReason.trim() : undefined,
      confidenceAssigned: assignedConfidence,
      priorityAssigned: assignedPriority,
      assessedBy: analystName.trim(),
      assessedAt: new Date().toISOString(),
    };

    onSaveAssessment(alert.id, assessment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        id="modal-alert-assessment"
        className="bg-[#0f1422] border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0d121d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                Arbitrage & Qualification de l'Alerte
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                ID: {alert.id} • {alert.isDemo ? 'Simulation Sandbox' : 'Source Réelle (APS)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctrine Warning Banner */}
        <div className="bg-amber-950/40 border-b border-amber-500/30 px-5 py-2.5 flex items-center gap-2.5 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Règle Doctrinale :</strong> Priorité de revue élevée ≠ confirmation factuelle. Toute validation engage la responsabilité de l'analyste.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {/* Alert Context Summary */}
          <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Source : <strong className="text-slate-200">{alert.sourceName || alert.sourceId}</strong></span>
              <span className="font-mono">Score de revue : <strong className="text-amber-400">{alert.priorityScore || 0}/100</strong></span>
            </div>
            <p className="text-xs font-semibold text-slate-200 line-clamp-2">
              {alert.title}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-950/60 border border-rose-500/50 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Decision Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Décision de Qualification *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecision('CONFIRMED')}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  decision === 'CONFIRMED'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-900/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Confirmer</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('DISMISSED')}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  decision === 'DISMISSED'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-sm shadow-rose-900/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Infirmer / Écarter</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('UNDER_SURVEILLANCE')}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  decision === 'UNDER_SURVEILLANCE'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm shadow-amber-900/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Sous surveillance</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('DUPLICATE')}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  decision === 'DUPLICATE'
                    ? 'bg-slate-700/50 text-slate-200 border-slate-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Copy className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Marquer doublon</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('CONTRADICTED')}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  decision === 'CONTRADICTED'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Contradiction</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('ESCALATED')}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  decision === 'ESCALATED'
                    ? 'bg-red-500/20 text-red-300 border-red-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-red-400 shrink-0" />
                <span>Escalader (P1)</span>
              </button>
            </div>
          </div>

          {/* Conditional Fields based on Decision */}
          {decision === 'CONFIRMED' && (
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                Base Factuelle de Confirmation *
              </label>
              <input
                type="text"
                value={confirmationBasis}
                onChange={(e) => setConfirmationBasis(e.target.value)}
                placeholder="Ex: Corroboration par dépêche officielle + signaux radio concordants"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
          )}

          {decision === 'DISMISSED' && (
            <div>
              <label className="block text-xs font-semibold text-rose-400 mb-1">
                Motif d'Infirmation / Écartement *
              </label>
              <input
                type="text"
                value={dismissalReason}
                onChange={(e) => setDismissalReason(e.target.value)}
                placeholder="Ex: Démenti officiel des autorités préfectorales et absence de trace matérielle"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />
            </div>
          )}

          {decision === 'ESCALATED' && (
            <div>
              <label className="block text-xs font-semibold text-red-400 mb-1">
                Motif d'Escalade P1 Critique *
              </label>
              <input
                type="text"
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="Ex: Menace imminente sur corridor stratégique nécessitant synthèse exécutive"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-400"
              />
            </div>
          )}

          {/* Mandatory Analyst Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Note d'Analyse Structurée *
            </label>
            <textarea
              rows={3}
              value={analystNote}
              onChange={(e) => setAnalystNote(e.target.value)}
              placeholder="Synthèse opérationnelle rédigée par l'analyste..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Mandatory Methodology Justification */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Justification Méthodologique de la Décision *
            </label>
            <textarea
              rows={2}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Expliquer les critères retenus (indépendance des sources, temporalité, recoupement)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Analyst Signature & Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Niveau de Confiance Attribué
              </label>
              <select
                value={assignedConfidence}
                onChange={(e) => setAssignedConfidence(e.target.value as OsintAlertConfidence)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="VERY_LOW">Très faible (VERY_LOW)</option>
                <option value="LOW">Faible (LOW)</option>
                <option value="MEDIUM">Moyenne (MEDIUM)</option>
                <option value="HIGH">Élevée (HIGH)</option>
                <option value="VERY_HIGH">Très élevée (VERY_HIGH)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Priorité Validée
              </label>
              <select
                value={assignedPriority}
                onChange={(e) => setAssignedPriority(e.target.value as OsintAlertPriority)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="P1_CRITICAL">P1 - Critique (Examen immédiat)</option>
                <option value="P2_HIGH">P2 - Haute (Prioritaire)</option>
                <option value="P3_MEDIUM">P3 - Moyenne (Normal)</option>
                <option value="P4_LOW">P4 - Basse (Faible)</option>
                <option value="P5_INFO">P5 - Info (Contexte)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Analyste Responsable *
              </label>
              <input
                type="text"
                value={analystName}
                onChange={(e) => setAnalystName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-800 bg-[#0d121d]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-lg shadow-amber-950/50 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Valider l'Arbitrage Humain</span>
          </button>
        </div>
      </div>
    </div>
  );
};
