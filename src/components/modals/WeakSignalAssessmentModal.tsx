import React, { useState } from 'react';
import { OsintWeakSignal, OsintSignalAssessment } from '../../types';
import { weakSignalService } from '../../services/weakSignalService';
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, Archive, X } from 'lucide-react';

interface Props {
  signal: OsintWeakSignal;
  onClose: () => void;
  onSave: () => void;
}

export const WeakSignalAssessmentModal: React.FC<Props> = ({ signal, onClose, onSave }) => {
  const [newStatus, setNewStatus] = useState<string>('CONFIRMED');
  const [analyst, setAnalyst] = useState<string>('Analyst OSINT Senior');
  const [reason, setReason] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('La justification / raison de l\'arbitrage est obligatoire.');
      return;
    }

    const assessment: OsintSignalAssessment = {
      id: `assess-${Date.now()}`,
      signalId: signal.id,
      actor: analyst,
      timestamp: new Date().toISOString(),
      previousStatus: signal.status,
      newStatus,
      reason: reason.trim(),
      note: note.trim() || undefined,
      isDemo: signal.isDemo
    };

    weakSignalService.saveAssessment(assessment);
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-xl w-full text-slate-100 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h2 className="font-semibold text-lg">Arbitrage Humain du Signal Faible</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 text-xs text-slate-300">
            <span className="font-mono text-amber-300 font-semibold">{signal.id}</span> — {signal.title}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Action / Décision d'Arbitrage (Obligatoire)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'CONFIRMED', label: 'CONFIRMER', icon: CheckCircle2, color: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' },
                { id: 'WATCH', label: 'SURVEILLANCE', icon: AlertTriangle, color: 'border-amber-500/50 text-amber-400 bg-amber-500/10' },
                { id: 'INFIRMED', label: 'INFIRMER', icon: XCircle, color: 'border-rose-500/50 text-rose-400 bg-rose-500/10' },
                { id: 'ESCALATED', label: 'ESCALADER', icon: ShieldAlert, color: 'border-purple-500/50 text-purple-400 bg-purple-500/10' },
                { id: 'ARCHIVED', label: 'ARCHIVER', icon: Archive, color: 'border-slate-500/50 text-slate-400 bg-slate-500/10' }
              ].map((opt) => {
                const Icon = opt.icon;
                const active = newStatus === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setNewStatus(opt.id)}
                    className={`flex items-center gap-1.5 p-2.5 rounded-lg border text-left font-medium transition-all ${
                      active ? opt.color + ' ring-1 ring-amber-400' : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Identifiant de l'Analyste (Obligatoire)
            </label>
            <input
              type="text"
              value={analyst}
              onChange={(e) => setAnalyst(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/60"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Motivation / Raison de la Décision (Obligatoire)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Expliciter les éléments factuels justifiant cet arbitrage..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-colors shadow-lg shadow-amber-500/20"
            >
              Enregistrer l'Arbitrage Humain
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
