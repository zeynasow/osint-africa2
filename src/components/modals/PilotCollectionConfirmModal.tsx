import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  CheckCircle2,
  X,
  Lock,
  ArrowRight,
  Server,
  Layers,
  FileCheck
} from 'lucide-react';
import { PILOT_CONFIG } from '../../services/realPilotCollectionService';

interface PilotCollectionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (analystName: string) => void;
  isCollecting: boolean;
  killSwitchActive: boolean;
}

export const PilotCollectionConfirmModal: React.FC<PilotCollectionConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isCollecting,
  killSwitchActive,
}) => {
  const [analystName, setAnalystName] = useState('Analyste Principal OSINT');
  const [hasAcknowledged, setHasAcknowledged] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* En-tête doctrinal de sécurité */}
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 p-6 border-b border-amber-500/30">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-semibold tracking-wider text-amber-400 uppercase">
                  LOT 23-B — Protocole de Collecte Réelle Contrôlée
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Confirmation Formelle Pré-Collecte Pilote
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isCollecting}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corps de la modale */}
        <div className="p-6 space-y-6">
          {/* Avertissement doctrinal encadré */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Engagement Doctrinal & Mandat Opérationnel</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              « Vous êtes sur le point d’effectuer une collecte réelle sur{' '}
              <strong className="text-amber-200">UNE source publique autorisée</strong> ({PILOT_CONFIG.sourceName}).
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">Volume maximal : <strong className="text-white">10 éléments</strong></span>
              </div>
              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-slate-300">Mode : <strong className="text-white">ONE-SHOT manuel</strong></span>
              </div>
              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-slate-300">Réseau : <strong className="text-white">Aucune tâche périodique</strong></span>
              </div>
              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-slate-300">Traçabilité : <strong className="text-white">Provenance totale & SHA-256</strong></span>
              </div>
            </div>
            <p className="text-xs text-slate-400 italic">
              Les données collectées seront conservées avec leur provenance complète et étiquetées distinctement « DONNÉES RÉELLES ».
            </p>
          </div>

          {/* Kill Switch actif avertissement */}
          {killSwitchActive && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-xs">
              <Lock className="w-5 h-5 shrink-0 text-rose-400" />
              <span>
                <strong>ATTENTION : Le Kill Switch est actuellement ACTIVÉ.</strong> La collecte sera immédiatement bloquée par mesure de sécurité.
              </span>
            </div>
          )}

          {/* Identification de l'analyste initiateur */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Identifiant de l'Analyste Responsable
            </label>
            <input
              type="text"
              value={analystName}
              onChange={(e) => setAnalystName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              placeholder="Ex: Analyste Référent Sahel"
            />
            <p className="text-[11px] text-slate-400">
              L'horodatage, le nom de l'analyste et le domaine interrogé (aps.sn) seront immédiatement inscrits au registre d'audit.
            </p>
          </div>

          {/* Case à cocher de confirmation */}
          <div className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <input
              type="checkbox"
              id="ack-check"
              checked={hasAcknowledged}
              onChange={(e) => setHasAcknowledged(e.target.checked)}
              className="mt-1 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
            />
            <label htmlFor="ack-check" className="text-xs text-slate-300 cursor-pointer select-none">
              Je confirme avoir audité la source pilote APS, validé la conformité juridique et déontologique de la requête One-Shot, et certifie qu'aucune collecte continue ne sera entreprise.
            </label>
          </div>
        </div>

        {/* Boutons d'actions strictement conformes à la Section 32 */}
        <div className="p-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isCollecting}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            ANNULER
          </button>
          <button
            type="button"
            onClick={() => onConfirm(analystName)}
            disabled={isCollecting || !hasAcknowledged || !analystName.trim()}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCollecting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Collecte en cours...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>AUTORISER LA COLLECTE PILOTE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
