import React, { useState } from 'react';
import {
  X,
  FileCode,
  Hash,
  Clock,
  Globe,
  Database,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Shield,
  Send,
  Layers,
  ArrowRight,
  FileText
} from 'lucide-react';
import {
  OsintRawItem,
  OsintNormalizedItem
} from '../../types';

interface RawItemInspectModalProps {
  item: OsintRawItem | null;
  normalizedItem?: OsintNormalizedItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRejectItem: (rawItemId: string, reason: string) => void;
  onConvertToEvent?: (normalizedItemId: string) => void;
}

export const RawItemInspectModal: React.FC<RawItemInspectModalProps> = ({
  item,
  normalizedItem,
  isOpen,
  onClose,
  onRejectItem,
  onConvertToEvent,
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen || !item) return null;

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(item.contentHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    onRejectItem(item.id, rejectReason);
    setShowRejectForm(false);
    onClose();
  };

  return (
    <div
      id="modal-raw-inspect-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        id="modal-raw-inspect-card"
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-mono">{item.id}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.processingStatus === 'NORMALIZED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : item.processingStatus === 'DUPLICATE'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : item.processingStatus === 'REJECTED'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {item.processingStatus}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  SANDBOX
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Source : <span className="text-slate-200">{item.sourceId}</span> • Connecteur : <span className="font-mono text-slate-300">{item.connectorId}</span>
              </p>
            </div>
          </div>
          <button
            id="btn-close-raw-inspect"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Titre et Charge Brute */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Titre Brut Capturé :</label>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-sm font-semibold text-white">
              {item.title || '<Aucun titre fourni>'}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contenu Brut (Payload d'origine) :</label>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
              {item.rawContent}
            </div>
          </div>

          {/* Grille technique */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800 text-xs space-y-2">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" /> Métadonnées Réseau & Source
              </h4>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">URL d'origine :</span>
                <span className="text-slate-200 truncate max-w-[200px]" title={item.originalUrl}>
                  {item.originalUrl || 'N/A (absente)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">URL Canonique :</span>
                <span className="text-slate-200 truncate max-w-[200px]" title={item.canonicalUrl}>
                  {item.canonicalUrl || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Identifiant Externe :</span>
                <span className="text-slate-200 font-mono">{item.externalId}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Langue détectée :</span>
                <span className="text-slate-200">{item.language}</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800 text-xs space-y-2">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-emerald-400" /> Intégrité Cryptographique
              </h4>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Publié le :</span>
                <span className="text-slate-200">{item.publishedAt || 'Non précisé'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Collecté le :</span>
                <span className="text-slate-200 font-mono">{item.collectedAt}</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-400">Empreinte Hash :</span>
                <div className="flex items-center gap-1">
                  <span className="text-emerald-400 font-mono text-[11px]">{item.contentHash}</span>
                  <button
                    onClick={handleCopyHash}
                    className="p-1 text-slate-400 hover:text-white rounded"
                    title="Copier l'empreinte"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Rejet ou anomalies */}
          {item.rejectionReason && (
            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              <strong className="block font-bold mb-1 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-400" /> Item Rejeté :
              </strong>
              {item.rejectionReason}
            </div>
          )}

          {/* Formulaire de Rejet Manuel */}
          {showRejectForm ? (
            <form onSubmit={handleRejectSubmit} className="p-4 rounded-lg bg-slate-950 border border-rose-500/40 space-y-3">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Rejeter formellement cet élément brut
              </h4>
              <textarea
                rows={2}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Indiquez le motif de rejet (ex. contenu incohérent, format non standardisé, falsification suspectée)..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-3 py-1.5 text-xs rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold rounded bg-rose-600 hover:bg-rose-500 text-white"
                >
                  Confirmer le Rejet
                </button>
              </div>
            </form>
          ) : null}

          {/* Lien avec l'élément normalisé si existant */}
          {normalizedItem && (
            <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Normalisation associée :</span>
                <span className="text-slate-200 font-semibold">{normalizedItem.title}</span>
                <span className="text-slate-400 block text-[11px] mt-0.5">
                  Catégorie : <strong>{normalizedItem.category}</strong> • Pays : {normalizedItem.country}
                </span>
              </div>
              {onConvertToEvent && !normalizedItem.generatedEventId && (
                <button
                  onClick={() => onConvertToEvent(normalizedItem.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" /> Créer Événement
                </button>
              )}
              {normalizedItem.generatedEventId && (
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono">
                  Événement : {normalizedItem.generatedEventId}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/60">
          <div>
            {!showRejectForm && item.processingStatus !== 'REJECTED' && (
              <button
                onClick={() => setShowRejectForm(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Rejeter cet item
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
