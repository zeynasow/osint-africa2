import React from 'react';
import { OsintWeakSignal } from '../../types';
import { weakSignalService } from '../../services/weakSignalService';
import { Shield, Network, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface Props {
  signal: OsintWeakSignal;
  onClose: () => void;
  onOpenAssessment: () => void;
}

export const WeakSignalDetailModal: React.FC<Props> = ({ signal, onClose, onOpenAssessment }) => {
  const scoreResult = weakSignalService.calculateSignalPriorityScore(signal);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-3xl w-full text-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-amber-400 font-semibold">{signal.id}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {signal.signalType}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                  signal.isDemo ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {signal.isDemo ? 'DEMO' : 'RÉEL'}
                </span>
              </div>
              <h2 className="font-bold text-lg text-slate-100 mt-1">{signal.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Doctrinal Banner */}
          <div className="p-3 bg-slate-950 border border-amber-500/30 rounded-lg flex items-start gap-3 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold uppercase tracking-wide text-amber-300">Doctrine OSINT AFRICA :</span>
              <p className="text-slate-300 mt-0.5">
                Le score ci-dessous est un <strong>Score de Priorisation du Signal</strong> (0 à 100). Il n'exprime ni une probabilité, ni une certitude, ni une menace avérée. Toute qualification définitive nécessite un arbitrage humain.
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description du Signal</h3>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
              {signal.description}
            </p>
          </div>

          {/* Score & Factors Decomposition */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Indice de Priorisation</span>
                <div className="text-2xl font-black text-amber-400 flex items-baseline gap-2">
                  {scoreResult.score} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Statut Actuel</span>
                <div className="text-sm font-semibold text-amber-300">{signal.status}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Décomposition Explicable des 10 Facteurs
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {scoreResult.factors.map((f) => (
                  <div key={f.code} className="p-2.5 bg-slate-900 rounded border border-slate-800/80 space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-200">{f.name}</span>
                      <span className="text-amber-400 font-mono">+{f.score}/{f.weight} pts</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{f.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Provenance & Traçabilité */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Traçabilité & Provenance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Pays Associés</span>
                <span className="text-slate-200 font-mono">{signal.countryCodes.join(', ') || 'Global'}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Catégories</span>
                <span className="text-slate-200 font-mono">{signal.categoryIds.join(', ')}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Sources Liées</span>
                <span className="text-slate-200 font-mono">{signal.relatedSourceIds.length} sources</span>
              </div>
            </div>
          </div>

          {/* Incertitudes & Recommandations */}
          {signal.uncertainty && signal.uncertainty.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Points d'Incertitude à Lever</h3>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 bg-rose-500/5 p-3 rounded-lg border border-rose-500/20">
                {signal.uncertainty.map((u, idx) => (
                  <li key={idx}>{u}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-800 bg-slate-900/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenAssessment();
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-colors shadow-lg shadow-amber-500/20"
          >
            <Shield className="w-4 h-4" />
            Arbitrer / Qualifier
          </button>
        </div>
      </div>
    </div>
  );
};
