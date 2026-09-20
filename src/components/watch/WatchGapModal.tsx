import React, { useState } from 'react';
import { X, Save, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { OsintWatchGap, WatchPlanPriority, OsintWatchGapStatus } from '../../types';
import { watchPilotService } from '../../services/watchPilotService';

interface WatchGapModalProps {
  watchPlanId: string;
  gap?: OsintWatchGap | null;
  mode?: 'CREATE' | 'RESOLVE';
  onClose: () => void;
  onSaved: (gap: OsintWatchGap) => void;
  isDemo: boolean;
}

export const WatchGapModal: React.FC<WatchGapModalProps> = ({
  watchPlanId,
  gap,
  mode = 'CREATE',
  onClose,
  onSaved,
  isDemo,
}) => {
  const isResolveMode = mode === 'RESOLVE' && Boolean(gap);

  const [title, setTitle] = useState(gap?.title || '');
  const [description, setDescription] = useState(gap?.description || '');
  const [priority, setPriority] = useState<WatchPlanPriority>(gap?.priority || 'MOYENNE');
  const [status, setStatus] = useState<OsintWatchGapStatus>(gap?.status || 'OUVERT');
  const [responsable, setResponsable] = useState(gap?.responsable || 'Analyste Pôle Veille');
  const [targetDate, setTargetDate] = useState(
    gap?.targetDate || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [justification, setJustification] = useState(gap?.justification || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Le titre de la lacune (gap) est obligatoire.');
      return;
    }
    if (isResolveMode && !justification.trim()) {
      setError('La justification de la résolution humaine est obligatoire.');
      return;
    }

    if (isResolveMode && gap) {
      watchPilotService.resolveGap(gap.id, responsable.trim(), justification.trim());
      const updated: OsintWatchGap = {
        ...gap,
        status: 'RESOLU',
        justification: justification.trim(),
        resolvedAt: new Date().toISOString(),
        resolvedBy: responsable.trim(),
      };
      onSaved(updated);
    } else {
      const created = watchPilotService.createGap(
        {
          watchPlanId,
          title: title.trim(),
          description: description.trim(),
          priority,
          status,
          responsable: responsable.trim(),
          targetDate,
          justification: justification.trim(),
          isDemo,
        },
        responsable.trim()
      );
      onSaved(created);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            {isResolveMode ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <HelpCircle className="w-5 h-5 text-orange-400" />
            )}
            <h2 className="text-base font-bold text-slate-100">
              {isResolveMode ? 'Résoudre la lacune (Gap)' : 'Identifier une lacune d’information'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {error && (
            <div className="p-2 bg-rose-950 border border-rose-800 rounded text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Intitulé de la lacune <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isResolveMode}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Couverture médiatique indépendante nulle sur le couloir Dori"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 disabled:opacity-60 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description de la zone grise
            </label>
            <textarea
              rows={2}
              disabled={isResolveMode}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Préciser la nature de l'information manquante ou indisponible..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 disabled:opacity-60 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priorité</label>
              <select
                disabled={isResolveMode}
                value={priority}
                onChange={(e) => setPriority(e.target.value as WatchPlanPriority)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 disabled:opacity-60 text-xs"
              >
                <option value="CRITIQUE">CRITIQUE</option>
                <option value="ELEVEE">ÉLEVÉE</option>
                <option value="MOYENNE">MOYENNE</option>
                <option value="FAIBLE">FAIBLE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Responsable</label>
              <input
                type="text"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 text-xs"
              />
            </div>
          </div>

          {isResolveMode ? (
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                Justification formelle de résolution <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Expliquer comment l’information a été obtenue, quelle source alternative a été exploitée..."
                className="w-full px-3 py-2 bg-slate-950 border border-emerald-800 rounded text-slate-100 text-xs focus:outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date cible de traitement
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 text-xs"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded ${
                isResolveMode ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              <Save className="w-4 h-4" />
              {isResolveMode ? 'Valider la résolution humaine' : 'Créer la lacune'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
