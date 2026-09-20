import React, { useState } from 'react';
import { X, Save, FileCheck2, AlertCircle, Clock, User } from 'lucide-react';
import {
  OsintWatchAction,
  OsintWatchActionType,
  OsintWatchActionStatus,
  WatchPlanPriority,
} from '../../types';
import { watchPilotService } from '../../services/watchPilotService';

interface WatchActionModalProps {
  watchPlanId: string;
  action?: OsintWatchAction | null;
  onClose: () => void;
  onSaved: (action: OsintWatchAction) => void;
  isDemo: boolean;
}

const ACTION_TYPE_LABELS: Record<OsintWatchActionType, string> = {
  VERIFIER_SOURCE: 'Vérifier la fiabilité d’une source',
  COMPARER_SOURCES: 'Comparer des sources contradictoires',
  VERIFIER_CONTRADICTION: 'Investiguer une contradiction documentaire',
  RECHERCHER_INFORMATION_MANQUANTE: 'Combler une lacune / zone grise (Gap)',
  REEVALUER_INDICATEUR: 'Réévaluer un indicateur précurseur',
  REEVALUER_HYPOTHESE: 'Réévaluer une hypothèse analytique',
  METTRE_A_JOUR_SITUATION: 'Mettre à jour le Centre de Situation (LOT 28)',
  METTRE_A_JOUR_DOSSIER: 'Alimenter un dossier d’investigation (LOT 27)',
  PRODUIRE_SYNTHESE: 'Produire une note ou synthèse de veille',
  REVUE_ANALYTIQUE: 'Planifier une revue formelle humaine',
};

export const WatchActionModal: React.FC<WatchActionModalProps> = ({
  watchPlanId,
  action,
  onClose,
  onSaved,
  isDemo,
}) => {
  const isEdit = Boolean(action);

  const [title, setTitle] = useState(action?.title || '');
  const [description, setDescription] = useState(action?.description || '');
  const [type, setType] = useState<OsintWatchActionType>(action?.type || 'COMPARER_SOURCES');
  const [priority, setPriority] = useState<WatchPlanPriority>(action?.priority || 'MOYENNE');
  const [status, setStatus] = useState<OsintWatchActionStatus>(action?.status || 'A_FAIRE');
  const [assignedTo, setAssignedTo] = useState(action?.assignedTo || 'Analyste Pôle Veille');
  const [dueDate, setDueDate] = useState(
    action?.dueDate || new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [justification, setJustification] = useState(action?.justification || '');
  const [notes, setNotes] = useState(action?.notes || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Le titre de l’action est obligatoire.');
      return;
    }
    if (!dueDate) {
      setError('La date d’échéance est obligatoire.');
      return;
    }

    if (isEdit && action) {
      const updated: OsintWatchAction = {
        ...action,
        title: title.trim(),
        description: description.trim(),
        type,
        priority,
        status,
        assignedTo: assignedTo.trim(),
        dueDate,
        justification: justification.trim(),
        notes: notes.trim(),
        completedAt: status === 'TERMINEE' ? action.completedAt || new Date().toISOString() : null,
      };
      watchPilotService.saveAction(updated, assignedTo);
      onSaved(updated);
    } else {
      const created = watchPilotService.createAction(
        {
          watchPlanId,
          title: title.trim(),
          description: description.trim(),
          type,
          priority,
          status,
          assignedTo: assignedTo.trim(),
          dueDate,
          justification: justification.trim(),
          notes: notes.trim(),
          isDemo,
        },
        assignedTo
      );
      onSaved(created);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-slate-100">
              {isEdit ? 'Modifier l’action analytique' : 'Nouvelle action de veille'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-sm">
          {error && (
            <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Type d’action analytique <span className="text-rose-400">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as OsintWatchActionType)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
            >
              {Object.entries(ACTION_TYPE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Titre de l’action <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Recoupement des déclarations du gouverneur..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description / Démarche à accomplir
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détail des sources à contacter, indicateurs à observer..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priorité</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as WatchPlanPriority)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="CRITIQUE">CRITIQUE</option>
                <option value="ELEVEE">ÉLEVÉE</option>
                <option value="MOYENNE">MOYENNE</option>
                <option value="FAIBLE">FAIBLE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OsintWatchActionStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="A_FAIRE">À FAIRE</option>
                <option value="EN_COURS">EN COURS</option>
                <option value="TERMINEE">TERMINÉE</option>
                <option value="EN_ATTENTE">EN ATTENTE</option>
                <option value="ANNULEE">ANNULÉE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assigné à</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date d’échéance <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          {status === 'TERMINEE' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Justification / Constats de clôture
              </label>
              <input
                type="text"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Ex: Sources recoupées avec succès, contradiction levée."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </form>

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
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded shadow transition-colors"
          >
            <Save className="w-4 h-4" />
            Enregistrer l’action
          </button>
        </div>
      </div>
    </div>
  );
};
