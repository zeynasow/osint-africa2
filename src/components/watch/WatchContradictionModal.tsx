import React, { useState } from 'react';
import { X, Save, Scale, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  OsintWatchContradiction,
  OsintContradictionCategory,
  OsintContradictionStatus,
} from '../../types';
import { watchPilotService } from '../../services/watchPilotService';

interface WatchContradictionModalProps {
  watchPlanId: string;
  contradiction?: OsintWatchContradiction | null;
  mode?: 'CREATE' | 'ARBITRATE';
  onClose: () => void;
  onSaved: (item: OsintWatchContradiction) => void;
  isDemo: boolean;
}

const CATEGORY_LABELS: Record<OsintContradictionCategory, string> = {
  CHIFFRES: 'Écart de bilan chiffré / statistiques',
  DATE_HEURE: 'Divergence temporelle (date ou heure)',
  LOCALISATION: 'Divergence géographique (lieu exact)',
  STATUT: 'Contradiction sur l’état opérationnel / statut',
  RESULTAT: 'Issue ou dénouement de l’événement',
  ACTEUR: 'Attribution ou implication d’un acteur',
  NARRATION_INCOMPATIBLE: 'Narrations factuellement incompatibles',
};

export const WatchContradictionModal: React.FC<WatchContradictionModalProps> = ({
  watchPlanId,
  contradiction,
  mode = 'CREATE',
  onClose,
  onSaved,
  isDemo,
}) => {
  const isArbitrateMode = mode === 'ARBITRATE' && Boolean(contradiction);

  const [title, setTitle] = useState(contradiction?.title || '');
  const [category, setCategory] = useState<OsintContradictionCategory>(
    contradiction?.category || 'CHIFFRES'
  );
  const [sourceA, setSourceA] = useState(contradiction?.sourceA || '');
  const [claimA, setClaimA] = useState(contradiction?.claimA || '');
  const [sourceB, setSourceB] = useState(contradiction?.sourceB || '');
  const [claimB, setClaimB] = useState(contradiction?.claimB || '');
  const [status, setStatus] = useState<OsintContradictionStatus>(
    contradiction?.status || 'EN_EXAMEN'
  );
  const [resolutionNotes, setResolutionNotes] = useState(
    contradiction?.resolutionNotes || ''
  );
  const [analystId, setAnalystId] = useState('Analyste Pôle Veille');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('L’intitulé de la contradiction est obligatoire.');
      return;
    }
    if (!sourceA.trim() || !claimA.trim()) {
      setError('La source A et sa déclaration sont requises.');
      return;
    }
    if (!sourceB.trim() || !claimB.trim()) {
      setError('La source B et sa déclaration sont requises.');
      return;
    }
    if (isArbitrateMode && !resolutionNotes.trim()) {
      setError('Les notes d’arbitrage humain sont obligatoires pour statuer.');
      return;
    }

    if (isArbitrateMode && contradiction) {
      watchPilotService.resolveContradiction(
        contradiction.id,
        status,
        resolutionNotes.trim(),
        analystId.trim()
      );
      const updated: OsintWatchContradiction = {
        ...contradiction,
        status,
        resolutionNotes: resolutionNotes.trim(),
        resolvedBy: analystId.trim(),
        resolvedAt: new Date().toISOString(),
      };
      onSaved(updated);
    } else {
      const created = watchPilotService.createContradiction(
        {
          watchPlanId,
          title: title.trim(),
          category,
          sourceA: sourceA.trim(),
          claimA: claimA.trim(),
          sourceB: sourceB.trim(),
          claimB: claimB.trim(),
          status,
          resolutionNotes: resolutionNotes.trim(),
          isDemo,
        },
        analystId.trim()
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
            <Scale className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100">
              {isArbitrateMode ? 'Arbitrer la contradiction entre sources' : 'Documenter une contradiction documentaire'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-sm">
          {error && (
            <div className="p-2 bg-rose-950 border border-rose-800 rounded text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Doctrinal note */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded text-xs text-slate-400">
            <strong className="text-amber-400 font-semibold">Principe de Traitement :</strong> Une contradiction entre sources ouvertes ne se tranche jamais unilatéralement. L’analyste documente les thèses opposées, formule un arbitrage motivé et archive les éléments probants.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Objet du litige factuel <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isArbitrateMode}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Divergence sur le bilan humain de l’opération..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 disabled:opacity-60 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Catégorie</label>
              <select
                disabled={isArbitrateMode}
                value={category}
                onChange={(e) => setCategory(e.target.value as OsintContradictionCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 disabled:opacity-60 text-xs"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Statut d'arbitrage</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OsintContradictionStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 text-xs"
              >
                <option value="EN_EXAMEN">EN EXAMEN (En cours d’enquête)</option>
                <option value="MAINTENUE">MAINTENUE (Divergence actée)</option>
                <option value="RESOLUE">RÉSOLUE (Tranchée par preuve)</option>
                <option value="CLASSEE">CLASSÉE SANS SUITE</option>
              </select>
            </div>
          </div>

          {/* Source A vs Source B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <span className="text-xs font-bold text-blue-400 block">Source A</span>
              <input
                type="text"
                required
                disabled={isArbitrateMode}
                value={sourceA}
                onChange={(e) => setSourceA(e.target.value)}
                placeholder="Nom / Type source A"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
              />
              <textarea
                rows={2}
                required
                disabled={isArbitrateMode}
                value={claimA}
                onChange={(e) => setClaimA(e.target.value)}
                placeholder="Déclaration exacte ou chiffre source A..."
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
              />
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <span className="text-xs font-bold text-amber-400 block">Source B</span>
              <input
                type="text"
                required
                disabled={isArbitrateMode}
                value={sourceB}
                onChange={(e) => setSourceB(e.target.value)}
                placeholder="Nom / Type source B"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
              />
              <textarea
                rows={2}
                required
                disabled={isArbitrateMode}
                value={claimB}
                onChange={(e) => setClaimB(e.target.value)}
                placeholder="Déclaration exacte ou chiffre source B..."
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Notes d'arbitrage */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes d’arbitrage analytique & Évaluation humaine
            </label>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Expliquer les hypothèses, les raisons de la divergence, les éléments confirmés..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Analyste</label>
            <input
              type="text"
              value={analystId}
              onChange={(e) => setAnalystId(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 text-xs"
            />
          </div>

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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded"
            >
              <Save className="w-4 h-4" />
              {isArbitrateMode ? 'Enregistrer l’arbitrage' : 'Créer la contradiction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
