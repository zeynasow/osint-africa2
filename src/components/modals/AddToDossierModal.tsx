import React, { useState } from 'react';
import { 
  FolderPlus, 
  X, 
  Check, 
  FolderGit2, 
  Plus, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';
import { AnalyticalDossier, OsintEvent } from '../../types';

interface AddToDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: OsintEvent | null;
  dossiers: AnalyticalDossier[];
  onAddEventToDossier: (dossierId: string, eventId: string) => Promise<void>;
  onOpenCreateDossier: () => void;
}

export const AddToDossierModal: React.FC<AddToDossierModalProps> = ({
  isOpen,
  onClose,
  event,
  dossiers,
  onAddEventToDossier,
  onOpenCreateDossier,
}) => {
  const [selectedDossierId, setSelectedDossierId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !event) return null;

  const handleConfirm = async () => {
    if (!selectedDossierId) return;
    await onAddEventToDossier(selectedDossierId, event.id);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div 
      id="modal-add-to-dossier-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div 
        id="modal-add-to-dossier-card"
        className="w-full max-w-lg bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0b1120]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                Classement Opérationnel
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-100">
                Ajouter à un Dossier d’Analyse
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Event Preview */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 text-xs">
          <div className="text-slate-400 font-mono mb-1">{event.countryName} • {event.date}</div>
          <div className="text-slate-200 font-bold line-clamp-1">{event.title}</div>
        </div>

        {/* Dossiers Selection List */}
        <div className="p-5 overflow-y-auto max-h-72 space-y-2.5">
          <div className="text-xs text-slate-400 mb-2">
            Sélectionnez le dossier thématique de destination :
          </div>

          {dossiers.map((dossier) => {
            const isAlreadyAdded = dossier.eventIds.includes(event.id);
            const isSelected = selectedDossierId === dossier.id;

            return (
              <div
                key={dossier.id}
                onClick={() => {
                  if (!isAlreadyAdded) setSelectedDossierId(dossier.id);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isAlreadyAdded
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-sm'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'}`}>
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-100 line-clamp-1">
                      {dossier.title}
                    </h4>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>{dossier.targetCountries.join(', ')}</span>
                      <span>•</span>
                      <span>{dossier.eventIds.length} événements</span>
                    </div>
                  </div>
                </div>

                <div>
                  {isAlreadyAdded ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Déjà inclus
                    </span>
                  ) : (
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-700 bg-slate-800'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Événement rattaché avec succès au dossier !</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-[#0b1120] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenCreateDossier();
            }}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau dossier</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedDossierId}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
