import React, { useState } from 'react';
import { ShieldCheck, Edit3, Save, AlertCircle, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { OsintSituation } from '../../types';

interface SituationAnalyticalEvaluationProps {
  situation: OsintSituation;
  onSaveEvaluation: (updated: {
    assessment: string;
    conclusion: string;
    analystNote: string;
    confidence: OsintSituation['confidence'];
  }) => void;
}

export const SituationAnalyticalEvaluation: React.FC<SituationAnalyticalEvaluationProps> = ({
  situation,
  onSaveEvaluation,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [assessment, setAssessment] = useState(situation.assessment || '');
  const [conclusion, setConclusion] = useState(situation.conclusion || '');
  const [analystNote, setAnalystNote] = useState(situation.analystNote || '');
  const [confidence, setConfidence] = useState<OsintSituation['confidence']>(situation.confidence || 'MOYENNE');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    onSaveEvaluation({
      assessment,
      conclusion,
      analystNote,
      confidence,
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const hasEvaluationContent = Boolean(
    situation.assessment?.trim() || situation.conclusion?.trim() || situation.analystNote?.trim()
  );

  return (
    <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-5 space-y-4">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Évaluation Analytique & Synthèse Opérationnelle
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Évaluation colligée sous stricte autorité humaine. 
            <strong className="text-amber-400 font-normal ml-1">
              Aucune conclusion n'est générée automatiquement par un algorithme.
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/40">
              <CheckCircle2 className="w-3.5 h-3.5" /> Enregistré avec traçabilité
            </span>
          )}
          {isEditing ? (
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Valider & Sauvegarder</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Éditer l'Évaluation</span>
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        /* Formulaire d'édition humaine */
        <div className="space-y-4 bg-[#0e1422] border border-slate-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Niveau de confiance assigné par l'analyste
              </label>
              <select
                value={confidence}
                onChange={(e) => setConfidence(e.target.value as any)}
                className="w-full bg-[#131926] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="TRÈS ÉLEVÉE">TRÈS ÉLEVÉE</option>
                <option value="ÉLEVÉE">ÉLEVÉE</option>
                <option value="MOYENNE">MOYENNE</option>
                <option value="FAIBLE">FAIBLE</option>
                <option value="TRÈS FAIBLE">TRÈS FAIBLE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Évaluation globale de la situation (Faits corroborés, tendances et contexte)
            </label>
            <textarea
              rows={4}
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="Rédigez ici l'évaluation consolidée des faits..."
              className="w-full bg-[#131926] border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-sans leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Conclusion analytique humaine
            </label>
            <textarea
              rows={3}
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              placeholder="Formulez les conclusions et recommandations de veille..."
              className="w-full bg-[#131926] border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-sans leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes méthodologiques & réserves de l'analyste
            </label>
            <textarea
              rows={2}
              value={analystNote}
              onChange={(e) => setAnalystNote(e.target.value)}
              placeholder="Notes sur la fiabilité des sources, incertitudes ou lacunes subsistantes..."
              className="w-full bg-[#131926] border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-sans leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                setAssessment(situation.assessment || '');
                setConclusion(situation.conclusion || '');
                setAnalystNote(situation.analystNote || '');
                setConfidence(situation.confidence || 'MOYENNE');
                setIsEditing(false);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition shadow-sm"
            >
              Enregistrer l'évaluation
            </button>
          </div>
        </div>
      ) : !hasEvaluationContent ? (
        /* Empty State strict imposé par les règles */
        <div className="p-8 text-center bg-[#0e1422] rounded-lg border border-slate-800 space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <div className="text-sm font-semibold text-amber-300">
            Évaluation humaine non renseignée.
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Conformément à la doctrine OSINT, le système ne génère aucune conclusion automatisée.
            Un analyste accrédité doit qualifier les faits et consigner son analyse.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-3 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition"
          >
            <Edit3 className="w-3.5 h-3.5" /> Rédiger l'évaluation
          </button>
        </div>
      ) : (
        /* Affichage de l'évaluation existante */
        <div className="space-y-4">
          {/* Cartouches structurées */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#0e1422] border border-slate-800 p-3.5 rounded-lg">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Niveau de confiance assigné
              </div>
              <div className="text-sm font-bold text-sky-400">
                {situation.confidence || 'MOYENNE'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Attribué par l'analyste référent
              </div>
            </div>

            <div className="bg-[#0e1422] border border-slate-800 p-3.5 rounded-lg">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Statut de veille opérationnelle
              </div>
              <div className="text-sm font-bold text-white">
                {situation.status}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Dernière révision le {situation.lastUpdated || situation.updatedAt?.split('T')[0]}
              </div>
            </div>

            <div className="bg-[#0e1422] border border-slate-800 p-3.5 rounded-lg">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Traçabilité & Origine
              </div>
              <div className="text-sm font-bold text-emerald-400">
                {situation.provenance || 'Pôle Situation OSINT Africa'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {situation.isDemo ? 'Données calibrées Démonstration' : 'Données de production réelles'}
              </div>
            </div>
          </div>

          {/* Évaluation */}
          <div className="bg-[#0e1422] border border-slate-800 p-4 rounded-lg space-y-2">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              Évaluation consolidée des faits et tendances
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {situation.assessment || 'Aucune évaluation détaillée consignée.'}
            </p>
          </div>

          {/* Conclusion */}
          <div className="bg-[#0e1422] border border-slate-800 p-4 rounded-lg space-y-2">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Conclusion analytique humaine
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {situation.conclusion || 'Aucune conclusion formulée.'}
            </p>
          </div>

          {/* Notes méthodologiques */}
          {situation.analystNote && (
            <div className="bg-[#0e1422] border border-amber-900/30 p-3.5 rounded-lg space-y-1">
              <h4 className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3 h-3 text-amber-400" />
                Notes méthodologiques et réserves
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{situation.analystNote}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
