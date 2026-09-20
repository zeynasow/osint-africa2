import React, { useState } from 'react';
import { X, Save, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { OsintWatchReview } from '../../types';
import { watchPilotService } from '../../services/watchPilotService';

interface WatchReviewModalProps {
  watchPlanId: string;
  onClose: () => void;
  onSaved: (review: OsintWatchReview) => void;
  isDemo: boolean;
}

export const WatchReviewModal: React.FC<WatchReviewModalProps> = ({
  watchPlanId,
  onClose,
  onSaved,
  isDemo,
}) => {
  const [analystId, setAnalystId] = useState('Analyste Pôle Veille');
  const [assessment, setAssessment] = useState('');
  const [factsInput, setFactsInput] = useState('');
  const [unconfirmedInput, setUnconfirmedInput] = useState('');
  const [contradictionsInput, setContradictionsInput] = useState('');
  const [changesInput, setChangesInput] = useState('');
  const [implicationsInput, setImplicationsInput] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [confidence, setConfidence] = useState<
    'TRES_FAIBLE' | 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'TRES_ELEVEE'
  >('MOYENNE');
  const [questionsInput, setQuestionsInput] = useState('');
  const [gapsInput, setGapsInput] = useState('');
  const [actionsInput, setActionsInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessment.trim()) {
      setError('L’évaluation analytique globale est requise.');
      return;
    }
    if (!conclusion.trim()) {
      setError('La conclusion analytique humaine est requise.');
      return;
    }

    const facts = factsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const unconfirmedInformation = unconfirmedInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const contradictions = contradictionsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const changes = changesInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const implications = implicationsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const questions = questionsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const gaps = gapsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const recommendedActions = actionsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const created = watchPilotService.createReview(
      {
        watchPlanId,
        analystId: analystId.trim(),
        reviewDate: new Date().toISOString(),
        assessment: assessment.trim(),
        facts,
        unconfirmedInformation,
        contradictions,
        changes,
        implications,
        conclusion: conclusion.trim(),
        confidence,
        questions,
        gaps,
        recommendedActions,
        isDemo,
      },
      analystId.trim()
    );

    onSaved(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">
              Formaliser une Revue Analytique Humaine
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-sm">
          {error && (
            <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Doctrinal note */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded text-xs text-slate-400">
            <strong className="text-emerald-400 font-semibold">Exigence Doctrinale :</strong> La revue humaine est le jalon officiel d’arbitrage. Elle sépare explicitement les faits vérifiés des allégations non confirmées et formalise le degré de confiance.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Analyste responsable <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={analystId}
                onChange={(e) => setAnalystId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Indice de confiance analytique <span className="text-rose-400">*</span>
              </label>
              <select
                value={confidence}
                onChange={(e) =>
                  setConfidence(
                    e.target.value as 'TRES_FAIBLE' | 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'TRES_ELEVEE'
                  )
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="TRES_FAIBLE">TRÈS FAIBLE (Données parcellaires / non corroborées)</option>
                <option value="FAIBLE">FAIBLE (Faisceau d’indices ténu)</option>
                <option value="MOYENNE">MOYENNE (Sources crédibles partiellement recoupées)</option>
                <option value="ELEVEE">ÉLEVÉE (Sources multiples et indépendantes)</option>
                <option value="TRES_ELEVEE">TRÈS ÉLEVÉE (Données probantes vérifiées)</option>
              </select>
            </div>
          </div>

          {/* Évaluation d'ensemble */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Évaluation narrative d'ensemble <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="Synthèse de l’état de la situation sous surveillance au cours de la période écoulée..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Faits constatés vs Éléments non confirmés */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                Faits constatés & vérifiés (1 par ligne)
              </label>
              <textarea
                rows={3}
                value={factsInput}
                onChange={(e) => setFactsInput(e.target.value)}
                placeholder="- Incident documenté par l'autorité portuaire&#10;- Positionnement AIS confirmé"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1">
                Éléments non confirmés / Rumeurs (1 par ligne)
              </label>
              <textarea
                rows={3}
                value={unconfirmedInput}
                onChange={(e) => setUnconfirmedInput(e.target.value)}
                placeholder="- Bilan humain diffusé sur réseaux sociaux&#10;- Revendication sans preuve matérielle"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Contradictions & Changements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-rose-400 mb-1">
                Contradictions identifiées (1 par ligne)
              </label>
              <textarea
                rows={2}
                value={contradictionsInput}
                onChange={(e) => setContradictionsInput(e.target.value)}
                placeholder="- Décalage d’horodatage de 12h entre agence A et agence B"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-blue-400 mb-1">
                Changements & Évolutions observés (1 par ligne)
              </label>
              <textarea
                rows={2}
                value={changesInput}
                onChange={(e) => setChangesInput(e.target.value)}
                placeholder="- Hausse des alertes P2 sur le fuseau central"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Implications stratégiques */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Implications opérationnelles & tactiques (1 par ligne)
            </label>
            <input
              type="text"
              value={implicationsInput}
              onChange={(e) => setImplicationsInput(e.target.value)}
              placeholder="Ex: Maintenir une surveillance accrue sur les corridors logistiques"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* Conclusion humaine */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Conclusion analytique humaine motivée <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              placeholder="Conclusion claire et formelle signée par l'analyste..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Gaps & Actions recommandées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nouvelles lacunes (Gaps) à documenter
              </label>
              <textarea
                rows={2}
                value={gapsInput}
                onChange={(e) => setGapsInput(e.target.value)}
                placeholder="- Données météo locales manquantes"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Actions de veille recommandées
              </label>
              <textarea
                rows={2}
                value={actionsInput}
                onChange={(e) => setActionsInput(e.target.value)}
                placeholder="- Recouper la déclaration ministérielle sous 48h"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>
        </form>

        {/* Pied */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded shadow transition-colors"
          >
            <Save className="w-4 h-4" />
            Consigner la revue humaine
          </button>
        </div>
      </div>
    </div>
  );
};
