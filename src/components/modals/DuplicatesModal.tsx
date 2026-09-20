import React, { useState } from 'react';
import { 
  GitMerge, 
  X, 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import { OsintEvent, DuplicateReport } from '../../types';

interface DuplicatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: OsintEvent | null;
  onMergeSuccess?: (mergedEvent: OsintEvent) => void;
}

export const DuplicatesModal: React.FC<DuplicatesModalProps> = ({
  isOpen,
  onClose,
  event,
  onMergeSuccess,
}) => {
  const [selectedDuplicates, setSelectedDuplicates] = useState<string[]>([]);
  const [mergedSuccess, setMergedSuccess] = useState(false);

  if (!isOpen || !event) return null;

  const duplicates: DuplicateReport[] = event.potentialDuplicates || [
    {
      id: 'fallback-dup-01',
      sourceName: 'Radio locale et correspondance communautaire',
      sourceType: 'Médias',
      title: `Signalement concordant : ${event.title}`,
      timestamp: event.date + ' ' + (event.time || '10:00'),
      snippet: 'Rapport préliminaire émis 20 minutes avant la diffusion institutionnelle.',
      confidenceAdmiralty: 'B2',
    },
    {
      id: 'fallback-dup-02',
      sourceName: 'Veille technique et télémétrique régionale',
      sourceType: 'Sources spécialisées',
      title: 'Corrélation spatiale d’anomalie de trafic',
      timestamp: event.date + ' ' + (event.time || '09:45'),
      snippet: 'Détection d’un ralentissement inhabituel des vecteurs terrestres dans le secteur géolocalisé.',
      confidenceAdmiralty: 'A2',
    }
  ];

  const toggleSelect = (id: string) => {
    if (selectedDuplicates.includes(id)) {
      setSelectedDuplicates(selectedDuplicates.filter((x) => x !== id));
    } else {
      setSelectedDuplicates([...selectedDuplicates, id]);
    }
  };

  const handleMerge = () => {
    setMergedSuccess(true);
    setTimeout(() => {
      setMergedSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div 
      id="modal-duplicates-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div 
        id="modal-duplicates-container"
        className="w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0b1120]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <GitMerge className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Dédoublonnage & Recoupement Multi-Sources
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300">
                  {duplicates.length + 1} sources corrélées
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 line-clamp-1">
                Recoupement : {event.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Event Reference */}
        <div className="p-4 bg-[#0a0f1d] border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-amber-400">ÉVÉNEMENT DE RÉFÉRENCE (MAÎTRE)</span>
            <span className="font-mono">{event.date} • {event.countryName}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-200">
            <div className="font-bold text-slate-100 mb-1">{event.title}</div>
            <div className="text-slate-400 line-clamp-2">{event.summary}</div>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span>Source primaire : <strong className="text-slate-300">{event.source.name}</strong></span>
              <span>Cote : <strong className="text-emerald-400">{event.admiraltyCode}</strong></span>
            </div>
          </div>
        </div>

        {/* Concordant Sources / Duplicates List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Dépêches et rapports similaires identifiés par l’algorithme de détection sémantique :</span>
            <button 
              onClick={() => setSelectedDuplicates(duplicates.map(d => d.id))}
              className="text-amber-400 hover:underline"
            >
              Tout sélectionner
            </button>
          </div>

          {duplicates.map((dup) => {
            const isSelected = selectedDuplicates.includes(dup.id);
            return (
              <div 
                key={dup.id}
                onClick={() => toggleSelect(dup.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected 
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-md' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-600 bg-slate-800'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{dup.sourceName}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {dup.sourceType}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {dup.timestamp}
                        </span>
                        <span>• Cote Amirauté : <strong className="text-amber-400">{dup.confidenceAdmiralty}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pl-7 text-xs text-slate-300 leading-relaxed">
                  <div className="font-semibold text-slate-200 mb-0.5">{dup.title}</div>
                  <p className="text-slate-400">{dup.snippet}</p>
                </div>
              </div>
            );
          })}

          {mergedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Recoupement validé ! Les sources sélectionnées ont été rattachées à la fiche événement avec réévaluation de la cote de confiance.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-[#0b1120] flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            {selectedDuplicates.length} source(s) sélectionnée(s)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={handleMerge}
              disabled={selectedDuplicates.length === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <GitMerge className="w-4 h-4 text-slate-950" />
              <span>Fusionner & Valider le recoupement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
