import React, { useState } from 'react';
import { 
  X, 
  FolderGit2, 
  Plus, 
  Calendar, 
  Globe2, 
  Trash2, 
  ExternalLink, 
  FileText, 
  Check, 
  Copy,
  Layers
} from 'lucide-react';
import { AnalyticalDossier, Country, OsintEvent, Category, ALL_CATEGORIES } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';

interface Props {
  dossier: AnalyticalDossier | null;
  isOpen: boolean;
  isCreateMode?: boolean;
  onClose: () => void;
  countries: Country[];
  allEvents: OsintEvent[];
  onSelectEvent: (event: OsintEvent) => void;
  onCreateDossier?: (data: {
    title: string;
    description: string;
    targetCountries: string[];
    categories: Category[];
    analystNotes: string;
  }) => Promise<any>;
  onRemoveEventFromDossier?: (dossierId: string, eventId: string) => Promise<void>;
}

export const DossierDetailModal: React.FC<Props> = ({
  dossier,
  isOpen,
  isCreateMode = false,
  onClose,
  countries,
  allEvents,
  onSelectEvent,
  onCreateDossier,
  onRemoveEventFromDossier,
}) => {
  // Create mode form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['ML', 'BF', 'NE']);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(['Sécurité', 'Groupes armés']);
  const [analystNotes, setAnalystNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !onCreateDossier) return;
    setSubmitting(true);
    try {
      await onCreateDossier({
        title,
        description,
        targetCountries: selectedCountries,
        categories: selectedCategories,
        analystNotes,
      });
      onClose();
      // Reset
      setTitle('');
      setDescription('');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleCategory = (cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const copyDossierReport = () => {
    if (!dossier) return;
    const assignedEvents = allEvents.filter((e) => dossier.eventIds.includes(e.id));
    const text = `=== DOSSIER D'ANALYSE OSINT AFRICA [DONNÉES DE DÉMONSTRATION] ===
Titre : ${dossier.title}
Dernière mise à jour : ${dossier.lastUpdated}
Périmètre géographique : ${dossier.targetCountries.join(', ')}
Catégories ciblées : ${dossier.categories.join(', ')}

NOTE DE SYNTHÈSE ANALYSTE :
${dossier.analystNotes}

ÉVÉNEMENTS LIÉS (${assignedEvents.length}) :
${assignedEvents.map((e, idx) => `${idx + 1}. [${e.date}] [${e.countryName}] ${e.title} (${e.severity})`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Events in this dossier
  const dossierEvents = dossier
    ? allEvents.filter((e) => dossier.eventIds.includes(e.id))
    : [];

  return (
    <div
      id="dossier-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="dossier-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#0f1422] border border-slate-700/80 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Mobile handle */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                {isCreateMode ? 'Créer un nouveau dossier d’analyse' : dossier?.title}
              </h2>
              <p className="text-xs text-slate-400">
                {isCreateMode
                  ? 'Définissez le périmètre géographique et thématique de veille'
                  : `Mis à jour le ${dossier?.lastUpdated} • ${dossierEvents.length} événements classés`}
              </p>
            </div>
          </div>
          <button
            id="btn-close-dossier-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs text-slate-300">
          {isCreateMode ? (
            /* Formulaire de création */
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Intitulé du dossier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Situation sécuritaire au Sahel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Objectif & Description de la veille
                </label>
                <textarea
                  rows={3}
                  placeholder="Décrivez les axes de recherche OSINT et les objectifs d’analyse..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 text-xs resize-none"
                />
              </div>

              {/* Sélection des pays cibles */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Pays prioritaires ciblés</span>
                  <span className="text-[10px] text-slate-500">
                    {selectedCountries.length} sélectionnés
                  </span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-900/80 border border-slate-800 custom-scrollbar">
                  {countries.slice(0, 25).map((c) => {
                    const isChecked = selectedCountries.includes(c.code);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleCountry(c.code)}
                        className={`text-left px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors border flex items-center justify-between ${
                          isChecked
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                            : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        {isChecked && <Check className="w-3 h-3 text-amber-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sélection des catégories */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Catégories d'analyse
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes d'analyste initiales */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes préliminaires de l’analyste
                </label>
                <textarea
                  rows={2}
                  placeholder="Hypothèses initiales, indicateurs de surveillance..."
                  value={analystNotes}
                  onChange={(e) => setAnalystNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim()}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer le dossier</span>
                </button>
              </div>
            </form>
          ) : (
            /* Mode Visualisation de dossier */
            dossier && (
              <div className="space-y-4">
                {/* Description */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 leading-relaxed">
                  <p className="text-xs">{dossier.description}</p>
                </div>

                {/* Scope: Countries & Categories */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Périmètre géographique ({dossier.targetCountries.length} pays)
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {dossier.targetCountries.map((code) => {
                        const country = countries.find((c) => c.code === code || c.id === code);
                        return (
                          <span
                            key={code}
                            className="text-[11px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono"
                          >
                            {country ? country.name : code}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Thématiques associées
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {dossier.categories.map((cat) => (
                        <span
                          key={cat}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes d'analyste */}
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Notes d’analyse opérationnelle</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    « {dossier.analystNotes} »
                  </p>
                </div>

                {/* Événements classés dans ce dossier */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      Événements rattachés au dossier ({dossierEvents.length})
                    </h3>
                  </div>

                  {dossierEvents.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-xs">
                      Aucun événement n’est encore associé à ce dossier. Utilisez le bouton « Ajouter au dossier » depuis le flux ou la carte.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dossierEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-start justify-between gap-3 group"
                        >
                          <div
                            onClick={() => {
                              onClose();
                              onSelectEvent(evt);
                            }}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <SeverityBadge severity={evt.severity} size="sm" />
                              <span className="font-semibold text-amber-400">{evt.countryName}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{evt.date}</span>
                            </div>
                            <h4 className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                              {evt.title}
                            </h4>
                          </div>

                          {onRemoveEventFromDossier && (
                            <button
                              title="Retirer du dossier"
                              onClick={() => onRemoveEventFromDossier(dossier.id, evt.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        {!isCreateMode && dossier && (
          <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-2">
            <button
              id="btn-copy-dossier"
              onClick={copyDossierReport}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Rapport copié' : 'Exporter la synthèse du dossier'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-semibold transition-colors"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
