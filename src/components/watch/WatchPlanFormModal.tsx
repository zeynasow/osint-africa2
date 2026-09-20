import React, { useState } from 'react';
import { X, Save, AlertTriangle, MapPin, Tag, Search, User, Shield } from 'lucide-react';
import { OsintWatchPlan, WatchPlanStatus, WatchPlanPriority, WatchPlanFrequency } from '../../types';
import { watchPilotService } from '../../services/watchPilotService';

interface WatchPlanFormModalProps {
  plan?: OsintWatchPlan | null;
  onClose: () => void;
  onSaved: (plan: OsintWatchPlan) => void;
  defaultIsDemo?: boolean;
}

export const WatchPlanFormModal: React.FC<WatchPlanFormModalProps> = ({
  plan,
  onClose,
  onSaved,
  defaultIsDemo = true,
}) => {
  const isEdit = Boolean(plan);

  const [title, setTitle] = useState(plan?.title || plan?.name || '');
  const [description, setDescription] = useState(plan?.description || '');
  const [objective, setObjective] = useState(plan?.objective || '');
  const [status, setStatus] = useState<WatchPlanStatus>(plan?.status || 'ACTIF');
  const [priority, setPriority] = useState<WatchPlanPriority>(plan?.priority || 'MOYENNE');
  const [countriesInput, setCountriesInput] = useState((plan?.countries || []).join(', '));
  const [regionsInput, setRegionsInput] = useState((plan?.regions || []).join(', '));
  const [categoriesInput, setCategoriesInput] = useState((plan?.categories || []).join(', '));
  const [searchTermsInput, setSearchTermsInput] = useState((plan?.searchTerms || []).join(', '));
  const [signalCriteriaInput, setSignalCriteriaInput] = useState((plan?.signalCriteria || []).join(', '));
  const [analystId, setAnalystId] = useState(plan?.analystId || 'Analyste Pôle Veille');
  const [reviewFrequency, setReviewFrequency] = useState<WatchPlanFrequency>(
    (plan?.reviewFrequency as WatchPlanFrequency) || 'WEEKLY'
  );
  const [notes, setNotes] = useState(plan?.notes || '');
  const [isDemo, setIsDemo] = useState(plan ? plan.isDemo : defaultIsDemo);
  const [justification, setJustification] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Le titre du plan de veille est obligatoire.');
      return;
    }
    if (!description.trim()) {
      setError('La description du plan est requise.');
      return;
    }

    const countries = countriesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const regions = regionsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const categories = categoriesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const searchTerms = searchTermsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const signalCriteria = signalCriteriaInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (isEdit && plan) {
      const updated: OsintWatchPlan = {
        ...plan,
        title: title.trim(),
        name: title.trim(),
        description: description.trim(),
        objective: objective.trim(),
        status,
        priority,
        countries,
        regions,
        categories,
        searchTerms,
        signalCriteria,
        analystId: analystId.trim(),
        reviewFrequency,
        notes: notes.trim(),
        isDemo,
        updatedAt: new Date().toISOString(),
      };
      watchPilotService.saveWatchPlan(
        updated,
        analystId,
        justification.trim() || 'Modification du plan de veille'
      );
      onSaved(updated);
    } else {
      const created = watchPilotService.createWatchPlan(
        {
          title: title.trim(),
          description: description.trim(),
          objective: objective.trim(),
          status,
          priority,
          countries,
          regions,
          categories,
          searchTerms,
          signalCriteria,
          analystId: analystId.trim(),
          reviewFrequency,
          notes: notes.trim(),
          isDemo,
          linkedCaseIds: [],
          linkedSituationIds: [],
          linkedEventIds: [],
          linkedAlertIds: [],
          linkedWeakSignalIds: [],
          linkedCorrelationIds: [],
          linkedAnomalyIds: [],
          linkedIndicatorIds: [],
          analyticalQuestions: [],
        },
        analystId
      );
      onSaved(created);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-slate-100">
              {isEdit ? 'Modifier le Plan de Veille' : 'Nouveau Plan de Veille OSINT'}
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

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Rappel doctrinal */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded text-xs text-slate-400">
            <strong className="text-amber-400 font-semibold">Doctrine OSINT :</strong> La création d’un plan de veille structure la surveillance et le recoupement. Un statut « ACTIF » ou une priorité « CRITIQUE » n’établit pas la véracité d’une menace.
          </div>

          {/* Périmètre Réel / Démo */}
          <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <div>
              <span className="font-semibold text-slate-200 block text-xs">Environnement du plan :</span>
              <span className="text-[11px] text-slate-400">
                {isDemo
                  ? 'Sandbox Démo (données simulées et signaux d’exercice)'
                  : 'Veille Réelle (connecté au flux d’information réel APS Sénégal)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDemo(true)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  isDemo
                    ? 'bg-amber-800/80 text-amber-200 border border-amber-600'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                Sandbox Démo
              </button>
              <button
                type="button"
                onClick={() => setIsDemo(false)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  !isDemo
                    ? 'bg-emerald-800/80 text-emerald-200 border border-emerald-600'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Réel APS
              </button>
            </div>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Titre du plan de veille <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Situation sécuritaire au Sahel central (Liptako-Gourma)"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Objectif stratégique */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Objectif opérationnel de la veille
            </label>
            <textarea
              rows={2}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Ex: Détecter les basculements d’itinéraires, identifier les poches d’insécurité et qualifier les déclarations contradictoires..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description contextuelle <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Surveillance approfondie des dynamiques régionales..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Statut & Priorité */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Statut du plan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WatchPlanStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="ACTIF">ACTIF (En cours de veille)</option>
                <option value="SOUS_SURVEILLANCE">SOUS SURVEILLANCE (Attention accrue)</option>
                <option value="SUSPENDU">SUSPENDU (Mis en sommeil)</option>
                <option value="BROUILLON">BROUILLON</option>
                <option value="ARCHIVE">ARCHIVÉ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Priorité de traitement
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as WatchPlanPriority)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="CRITIQUE">CRITIQUE (Urgence d'analyse)</option>
                <option value="ELEVEE">ÉLEVÉE</option>
                <option value="MOYENNE">MOYENNE</option>
                <option value="FAIBLE">FAIBLE</option>
              </select>
            </div>
          </div>

          {/* Pays & Régions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pays ciblés (séparés par des virgules)
              </label>
              <input
                type="text"
                value={countriesInput}
                onChange={(e) => setCountriesInput(e.target.value)}
                placeholder="Ex: Mali, Niger, Burkina Faso"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Régions géographiques
              </label>
              <input
                type="text"
                value={regionsInput}
                onChange={(e) => setRegionsInput(e.target.value)}
                placeholder="Ex: Afrique de l’Ouest, Sahel"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Catégories & Termes de recherche */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Catégories thématiques
              </label>
              <input
                type="text"
                value={categoriesInput}
                onChange={(e) => setCategoriesInput(e.target.value)}
                placeholder="Ex: Sécurité, Défense, Frontières"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mots-clés et filtres de recherche
              </label>
              <input
                type="text"
                value={searchTermsInput}
                onChange={(e) => setSearchTermsInput(e.target.value)}
                placeholder="Ex: convoi, embuscade, Dori, FAMA"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Critères de détection de signaux */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Critères de détection des signaux recherchés
            </label>
            <input
              type="text"
              value={signalCriteriaInput}
              onChange={(e) => setSignalCriteriaInput(e.target.value)}
              placeholder="Ex: Coupure télécoms, regroupement de véhicules, hausse brutale de prix"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Analyste & Fréquence de revue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Analyste référent
              </label>
              <input
                type="text"
                value={analystId}
                onChange={(e) => setAnalystId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fréquence de revue humaine
              </label>
              <select
                value={reviewFrequency}
                onChange={(e) => setReviewFrequency(e.target.value as WatchPlanFrequency)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="DAILY">Quotidienne (24h)</option>
                <option value="WEEKLY">Hebdomadaire (7 jours)</option>
                <option value="BIWEEKLY">Bi-mensuelle (14 jours)</option>
                <option value="MONTHLY">Mensuelle (30 jours)</option>
              </select>
            </div>
          </div>

          {/* Justification de la modification (si edit) */}
          {isEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Justification pour le journal d’audit (append-only)
              </label>
              <input
                type="text"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Ex: Révision des critères géographiques suite aux derniers événements"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Notes libres */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes & Consignes méthodologiques
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Consignes de validation humaine, règles déontologiques spécifiques..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>

        {/* Pied de modal */}
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
            {isEdit ? 'Enregistrer les modifications' : 'Créer le plan de veille'}
          </button>
        </div>
      </div>
    </div>
  );
};
