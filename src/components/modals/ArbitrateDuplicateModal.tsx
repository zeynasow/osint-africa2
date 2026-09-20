import React, { useState } from 'react';
import {
  X,
  GitMerge,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Hash,
  ArrowRight,
  Shield,
  FileText,
  Clock,
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import {
  OsintNormalizedItem,
  DuplicateArbitrationAction,
  DuplicateAssessment
} from '../../types';

interface ArbitrateDuplicateModalProps {
  item: OsintNormalizedItem | null;
  existingItem?: OsintNormalizedItem | null;
  assessment?: DuplicateAssessment | null;
  isOpen: boolean;
  onClose: () => void;
  onArbitrate: (
    itemId: string,
    action: DuplicateArbitrationAction,
    comment: string
  ) => void;
}

export const ArbitrateDuplicateModal: React.FC<ArbitrateDuplicateModalProps> = ({
  item,
  existingItem,
  assessment,
  isOpen,
  onClose,
  onArbitrate,
}) => {
  const [action, setAction] = useState<DuplicateArbitrationAction>('KEEP_UNIQUE');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    onArbitrate(item.id, action, comment);
    setSubmitting(false);
    onClose();
  };

  return (
    <div
      id="modal-arbitrate-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        id="modal-arbitrate-card"
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <GitMerge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Arbitrage Humain de Déduplication</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Règle doctrinale : Aucune suppression automatique • Analyse et décision motivée obligatoire
              </p>
            </div>
          </div>
          <button
            id="btn-close-arbitrate-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps du modal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Comparaison côte à côte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item candidat */}
            <div className="p-4 rounded-lg bg-slate-950/60 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  NOUVEL ÉLÉMENT CANDIDAT
                </span>
                <span className="text-xs text-slate-400 font-mono">{item.id}</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white line-clamp-2">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-3">{item.summary}</p>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                <div>Source : <span className="text-slate-200">{item.sourceId}</span></div>
                <div>Date : <span className="text-slate-200">{item.publishedAt}</span></div>
                <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                  <Hash className="w-3 h-3" /> {item.contentHash}
                </div>
              </div>
            </div>

            {/* Item existant en base */}
            <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  ÉLÉMENT EXISTANT EN BASE
                </span>
                <span className="text-xs text-slate-400 font-mono">{existingItem?.id || item.matchedExistingId || 'N/A'}</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 line-clamp-2">
                  {existingItem?.title || assessment?.matchedItemTitle || 'Élément référent de comparaison'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-3">
                  {existingItem?.summary || 'Contenu archivé lors d’un cycle de collecte antérieur.'}
                </p>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                <div>Statut similitude : <strong className="text-amber-400">{item.duplicateStatus}</strong></div>
                {assessment && (
                  <div>Score concordant : <strong className="text-amber-300 font-mono">{assessment.score}%</strong></div>
                )}
                {assessment?.reason && (
                  <div className="text-[10px] text-slate-400 italic">« {assessment.reason} »</div>
                )}
              </div>
            </div>
          </div>

          {/* Formulaire de décision */}
          <form id="form-arbitrate-duplicate" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Sélectionnez la décision d’arbitrage :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    value: 'KEEP_UNIQUE',
                    label: 'Conserver comme Unique',
                    desc: 'L’information apporte des éléments nouveaux justifiant un enregistrement distinct.',
                    badge: 'Indépendant',
                  },
                  {
                    value: 'LINK_TO_EXISTING',
                    label: 'Lier au Doublon Existant',
                    desc: 'Créer un lien de corrélation documentaire sans dupliquer l’événement.',
                    badge: 'Rattachement',
                  },
                  {
                    value: 'CONFIRM_DUPLICATE',
                    label: 'Confirmer comme Doublon',
                    desc: 'Reprise circulaire pure ou syndication mot pour mot avérée.',
                    badge: 'Doublon avéré',
                  },
                  {
                    value: 'MARK_OVERLAP',
                    label: 'Marquer comme Chevauchement',
                    desc: 'Angle d’analyse partiel nécessitant un croisement thématique.',
                    badge: 'Partiel',
                  },
                  {
                    value: 'REQUEST_REVIEW',
                    label: 'Demander une Revue Approfondie',
                    desc: 'Transmettre au chef de pôle pour vérification des sources primaires.',
                    badge: 'Revue humaine',
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex flex-col p-3 rounded-lg border cursor-pointer transition ${
                      action === opt.value
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="arbitration-action"
                          value={opt.value}
                          checked={action === opt.value}
                          onChange={() => setAction(opt.value as DuplicateArbitrationAction)}
                          className="accent-amber-500"
                        />
                        <span className="text-xs font-bold">{opt.label}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {opt.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 pl-5">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="arbitration-comment" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Motif & Justification de l’Analyste (Obligatoire pour l'audit) :
              </label>
              <textarea
                id="arbitration-comment"
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ex. : Concordance textuelle vérifiée. Les détails chronologiques apportent des précisions sur le timing d'ouverture de l'axe routier."
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                id="btn-cancel-arbitrate"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                id="btn-confirm-arbitrate"
                disabled={submitting || !comment.trim()}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Valider l’Arbitrage
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
