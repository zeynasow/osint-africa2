import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  MapPin, 
  Calendar, 
  ShieldAlert, 
  FileText, 
  FolderPlus, 
  Check, 
  Copy, 
  Compass, 
  ExternalLink,
  Sparkles,
  GitMerge,
  FileEdit,
  CheckCircle2
} from 'lucide-react';
import { OsintEvent, AnalyticalDossier } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

interface Props {
  event: OsintEvent | null;
  onClose: () => void;
  dossiers: AnalyticalDossier[];
  onAddToDossier: (dossierId: string, eventId: string) => Promise<void>;
  onOpenCountryDetail?: (countryId: string) => void;
  onOpenAiAnalysis?: (target: { event: OsintEvent }) => void;
  onOpenCreateNote?: (presetEvents?: OsintEvent[]) => void;
  onCheckDuplicates?: (event: OsintEvent) => void;
}

export const EventDetailModal: React.FC<Props> = ({
  event,
  onClose,
  dossiers,
  onAddToDossier,
  onOpenCountryDetail,
  onOpenAiAnalysis,
  onOpenCreateNote,
  onCheckDuplicates,
}) => {
  const [selectedDossierId, setSelectedDossierId] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!event) return null;

  const handleAdd = async () => {
    if (!selectedDossierId) return;
    await onAddToDossier(selectedDossierId, event.id);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const copyBrief = () => {
    const brief = `[OSINT AFRICA - DONNÉES DE DÉMONSTRATION]
Titre : ${event.title}
Pays : ${event.countryName} (Lat: ${event.coordinates.lat}, Lng: ${event.coordinates.lng})
Date : ${event.date}
Catégorie : ${event.category}
Gravité : ${event.severity}
Évaluation Admiralty : ${event.admiraltyCode} (${event.confidenceScore}%)
Source Démo : ${event.source.name} (${event.source.type})
Résumé : ${event.summary}
Analyse : ${event.detailedAnalysis}`;

    navigator.clipboard.writeText(brief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sourceCount = event.associatedSourcesCount || (event.potentialDuplicates ? event.potentialDuplicates.length + 1 : 3);

  return (
    <div 
      id="event-detail-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="event-detail-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#0f1422] border border-slate-700/80 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Android Sheet drag handle for mobile */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={event.severity} size="sm" />
              <ConfidenceBadge 
                admiraltyCode={event.admiraltyCode} 
                confidenceScore={event.confidenceScore} 
                size="sm" 
              />
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                {event.category}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
              {event.title}
            </h2>
          </div>
          <button
            id="btn-close-event-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Analytical Actions Bar */}
        <div className="px-4 py-2.5 bg-[#0a0f1d] border-b border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          {onOpenAiAnalysis && (
            <button
              onClick={() => {
                onClose();
                onOpenAiAnalysis({ event });
              }}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Analyse approfondie IA</span>
            </button>
          )}

          {onOpenCreateNote && (
            <button
              onClick={() => {
                onClose();
                onOpenCreateNote([event]);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
            >
              <FileEdit className="w-3.5 h-3.5 text-amber-400" />
              <span>Rédiger Note d'Analyse</span>
            </button>
          )}

          {onCheckDuplicates && (
            <button
              onClick={() => {
                onClose();
                onCheckDuplicates(event);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
            >
              <GitMerge className="w-3.5 h-3.5 text-emerald-400" />
              <span>Corrélation ({sourceCount} sources)</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar text-slate-300 text-sm">
          {/* Watermark Banner in Modal */}
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="font-semibold uppercase tracking-wide">
              DONNÉES DE DÉMONSTRATION FICTIVES — ÉVALUATION TECHNIQUE
            </span>
          </div>

          {/* Key Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Pays surveillé</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenCountryDetail?.(event.countryId);
                }}
                className="font-semibold text-amber-400 hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                {event.countryName}
              </button>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Date d’observation</span>
              <span className="font-medium text-slate-200 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {event.date} {event.time || ''}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-500 block mb-0.5">Coordonnées GPS</span>
              <span className="font-mono text-slate-300 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                {event.coordinates.lat.toFixed(4)}, {event.coordinates.lng.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Concordance status */}
          <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-blue-300">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Recoupé par {sourceCount} sources ouvertes indépendantes</span>
            </div>
            {onCheckDuplicates && (
              <button
                onClick={() => {
                  onClose();
                  onCheckDuplicates(event);
                }}
                className="text-amber-400 hover:underline font-mono text-[11px]"
              >
                Examiner les recoupements &gt;
              </button>
            )}
          </div>

          {/* Synthèse de l'événement */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Synthèse opérationnelle
            </h3>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-200 leading-relaxed">
              {event.summary}
            </div>
          </div>

          {/* Analyse OSINT détaillée */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Analyse & Recoupement méthodologique
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs leading-relaxed space-y-2">
              <p>{event.detailedAnalysis}</p>
              <p className="text-slate-400 italic">
                * Note de protocole : Les coordonnées géographiques et identifiants de capteurs sont calibrés pour tester les visualisations géospatiales.
              </p>
            </div>
          </div>

          {/* Source OSINT & Evaluation Admiralty */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Origine & Source d’information</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Source Démo Fictive
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-800/50 border border-slate-800">
                <span className="text-slate-500 text-[11px] block">Organisme / Émetteur</span>
                <span className="font-medium text-slate-200">{event.source.name}</span>
              </div>
              <div className="p-2 rounded bg-slate-800/50 border border-slate-800">
                <span className="text-slate-500 text-[11px] block">Typologie de source</span>
                <span className="font-medium text-slate-200">{event.source.type}</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
              <span>Fiabilité source (Admiralty) : <strong>{event.source.reliability}</strong></span>
              <span>Crédibilité info : <strong>{event.source.credibility}</strong></span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/70 border border-slate-700/60 text-slate-300 font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Add to Dossier Action */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4 text-amber-400" />
              Classer cet événement dans un dossier d’analyse
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <select
                id="select-dossier-assignment"
                value={selectedDossierId}
                onChange={(e) => setSelectedDossierId(e.target.value)}
                className="w-full sm:flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="">Sélectionner un dossier...</option>
                {dossiers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.eventIds.length} événements)
                  </option>
                ))}
              </select>
              <button
                id="btn-confirm-add-dossier"
                disabled={!selectedDossierId}
                onClick={handleAdd}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                {addedSuccess ? <Check className="w-4 h-4 text-slate-950" /> : <FolderPlus className="w-4 h-4" />}
                <span>{addedSuccess ? 'Ajouté !' : 'Ajouter au dossier'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-2">
          <button
            id="btn-copy-brief"
            onClick={copyBrief}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copié dans le presse-papier' : 'Copier la fiche'}</span>
          </button>
          <button
            id="btn-close-modal-bottom"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
