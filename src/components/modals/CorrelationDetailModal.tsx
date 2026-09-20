import React, { useState } from 'react';
import {
  OsintCorrelation,
  OsintWeakSignal,
  OsintEvent,
  OsintActor,
  OsintSourceItem,
} from '../../types';
import {
  X,
  Network,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  MapPin,
  Calendar,
  Users2,
  Radio,
  FileText,
  ShieldCheck,
  ChevronRight,
  Info,
  Clock,
  ArrowUpRight,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { UseOsintViewModelReturn } from '../../viewmodels/useOsintViewModel';

interface CorrelationDetailModalProps {
  correlation: OsintCorrelation | null;
  weakSignal?: OsintWeakSignal | null;
  onClose: () => void;
  vm: UseOsintViewModelReturn;
  onOpenEvent?: (evt: OsintEvent) => void;
}

export const CorrelationDetailModal: React.FC<CorrelationDetailModalProps> = ({
  correlation,
  weakSignal,
  onClose,
  vm,
  onOpenEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'synthese' | 'facteurs' | 'entites' | 'verification'>(
    'synthese'
  );

  if (!correlation && !weakSignal) return null;

  // Retrieve matching entities from VM
  const eventIds = correlation?.eventIds || weakSignal?.relatedEventIds || [];
  const associatedEvents = vm.events.filter((e) => eventIds.includes(e.id));
  
  const actorIds = correlation?.actorIds || weakSignal?.relatedActorIds || [];
  const associatedActors = vm.actors.filter(
    (a) => actorIds.includes(a.id) || actorIds.includes(a.name)
  );

  const sourceIds = correlation?.sourceIds || weakSignal?.relatedSourceIds || [];
  const associatedSources = vm.sources.filter((s) => sourceIds.includes(s.id));

  const countryCodes = correlation?.countryCodes || weakSignal?.countryCodes || [];
  const associatedCountries = vm.countries.filter(
    (c) => countryCodes.includes(c.id) || countryCodes.includes(c.code)
  );

  const title = correlation?.title || weakSignal?.title || '';
  const description = correlation?.description || weakSignal?.description || '';
  const confidence = correlation?.confidence || weakSignal?.confidence || 'MOYENNE';
  const significance = correlation?.significance || weakSignal?.significance || 'MODÉRÉE';
  const status = correlation?.status || weakSignal?.status || 'À EXAMINER';
  const uncertainties = correlation?.uncertainty || weakSignal?.uncertainty || [];
  const score = correlation ? correlation.score : 5;
  const maxScore = correlation ? correlation.maxScore : 8;
  const factors = correlation?.matchedFactors || [];

  const getConfidenceBadge = (conf: string) => {
    switch (conf) {
      case 'TRÈS ÉLEVÉE':
      case 'ÉLEVÉE':
        return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400';
      case 'MOYENNE':
        return 'bg-amber-500/15 border-amber-500/40 text-amber-400';
      case 'FAIBLE':
      case 'TRÈS FAIBLE':
        return 'bg-orange-500/15 border-orange-500/40 text-orange-400';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  const getSignificanceBadge = (sig: string) => {
    switch (sig) {
      case 'CRITIQUE':
        return 'bg-rose-500/20 border-rose-500/50 text-rose-400';
      case 'IMPORTANTE':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
      case 'MODÉRÉE':
        return 'bg-amber-500/20 border-amber-500/50 text-amber-300';
      case 'FAIBLE':
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b0f19] border border-slate-800 w-full max-w-5xl h-[92vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <header className="p-4 sm:p-5 border-b border-slate-800/90 bg-[#0e1424] flex items-center justify-between gap-4 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Network className="w-3.5 h-3.5" />
                {correlation ? `CORRÉLATION #${correlation.id}` : `SIGNAL FAIBLE #${weakSignal?.id}`}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getConfidenceBadge(confidence)}`}>
                Confiance : {confidence}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getSignificanceBadge(significance)}`}>
                Importance : {significance}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {status}
              </span>
              {(correlation?.isDemo || weakSignal?.isDemo) && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-amber-950/60 text-amber-400 border border-amber-500/30">
                  DONNÉES DÉMO
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">
              {title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-white border border-slate-700 transition-colors shrink-0"
            title="Fermer la modale"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Permanent Methodological Disclaimers (Requirement Sections 2 & 7) */}
        <div className="px-4 sm:px-6 py-2.5 bg-amber-950/30 border-b border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium">
              « Une corrélation indique une relation observée entre plusieurs éléments. Elle ne démontre pas une relation causale. »
            </span>
          </div>
          <span className="hidden md:inline text-[11px] font-mono text-amber-400/90 font-semibold shrink-0">
            Évaluation analytique — ne constitue pas une preuve en soi
          </span>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800 bg-[#0d121e] flex-shrink-0 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('synthese')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'synthese'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Synthèse & Score
          </button>
          <button
            onClick={() => setActiveTab('facteurs')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'facteurs'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Facteurs auditables ({factors.filter((f) => f.matched).length}/{factors.length || 8})
          </button>
          <button
            onClick={() => setActiveTab('entites')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'entites'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Événements & Sources ({associatedEvents.length + associatedSources.length})
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'verification'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Vérification & Questions
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar text-slate-200">
          {activeTab === 'synthese' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Score Bar Banner */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-black text-xl">
                    {score}/{maxScore}
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Score de corrélation observable
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      Indice transparent basé sur {score} facteurs concordants observés (sur {maxScore})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-36 h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all"
                      style={{ width: `${(score / maxScore) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {Math.round((score / maxScore) * 100)}%
                  </span>
                </div>
              </div>

              {/* Description & Analytical Assessment */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Description de la relation observée
                </h3>
                <p className="text-sm leading-relaxed text-slate-300 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                  {description}
                </p>
              </div>

              {/* Weak Signal Specific Observation if available */}
              {weakSignal && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Nombre d'occurrences</div>
                    <div className="text-lg font-mono font-bold text-amber-400 mt-0.5">
                      {weakSignal.observedCount} observations
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Évolution de la tendance</div>
                    <div className="text-lg font-bold text-slate-200 mt-0.5 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      {weakSignal.evolution}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Fenêtre temporelle</div>
                    <div className="text-xs font-mono text-slate-300 mt-1">
                      {weakSignal.firstObservedAt?.slice(0, 10)} → {weakSignal.lastObservedAt?.slice(0, 10)}
                    </div>
                  </div>
                </div>
              )}

              {/* Uncertainty section (Requirement Section 21) */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Incertitudes documentées & Limites de l'analyse
                </h3>
                {uncertainties.length > 0 ? (
                  <ul className="space-y-2">
                    {uncertainties.map((unc, i) => (
                      <li
                        key={i}
                        className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{unc}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Aucune incertitude critique spécifiquement listée. L'analyste doit maintenir sa vigilance.
                  </p>
                )}
              </div>

              {/* Conclusion & Assessment */}
              {correlation?.conclusion && (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Conclusion provisoire de l’analyste
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    « {correlation.conclusion} »
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'facteurs' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-xs text-slate-400">
                Chaque corrélation est calculée de manière explicable selon 8 facteurs audités.
                Aucune pondération opaque ou modèle non vérifiable n'est utilisé.
              </div>

              <div className="space-y-2.5">
                {factors.map((factor, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                      factor.matched
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {factor.matched ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-600 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                          <span>{factor.factor}</span>
                          {factor.matched && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-500/30">
                              +1 FACTEUR VALIDÉ
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{factor.description}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 shrink-0">
                      {factor.matched ? '1/1' : '0/1'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'entites' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Associated Events */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Événements rattachés ({associatedEvents.length})
                </h3>
                {associatedEvents.length > 0 ? (
                  <div className="space-y-2">
                    {associatedEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => onOpenEvent && onOpenEvent(evt)}
                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-colors group flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-[11px] mb-1">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-semibold">
                              {evt.countryName || evt.countryId}
                            </span>
                            <span className="text-slate-500 font-mono">
                              {evt.publishedAt?.slice(0, 10) || evt.date}
                            </span>
                            <span className="text-slate-400 font-medium">({evt.category})</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                            {evt.title}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{evt.summary}</p>
                        </div>
                        <span className="text-xs text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                          Examiner <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Aucun événement lié n'a pu être résolu dans les données actuelles.
                  </p>
                )}
              </div>

              {/* Associated Actors with Strict Distinction Rule (Section 17) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Users2 className="w-4 h-4 text-amber-400" />
                    Acteurs mentionnés ({associatedActors.length})
                  </h3>
                  <span className="text-[10px] text-amber-400/90 font-mono">
                    Statut : « Acteur mentionné » ≠ « Acteur impliqué »
                  </span>
                </div>

                {associatedActors.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {associatedActors.map((act) => (
                      <div
                        key={act.id}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-200">{act.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                              {act.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            {act.description}
                          </p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                          <span>Pays : {act.country}</span>
                          <span className="text-amber-400 font-semibold">Mentionné</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Aucun acteur spécifique répertorié.</p>
                )}
              </div>

              {/* Associated Sources */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-400" />
                  Sources concordantes ({associatedSources.length})
                </h3>
                {associatedSources.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {associatedSources.map((src) => (
                      <div
                        key={src.id}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-200">{src.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {src.type}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
                          <span>Couverture : {src.country}</span>
                          <span className="text-amber-400 font-mono text-[10px]">
                            {src.reliability ? `Fiabilité ${src.reliability}` : 'Source déclarée'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Sources primaires non détaillées.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Analytical Questions (Section 22) */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  Questions analytiques d’orientation (générées localement)
                </h3>
                <div className="space-y-2">
                  {(weakSignal?.analyticalQuestions || [
                    'Le phénomène se répète-t-il sur des périodes ou zones adjacentes ?',
                    'Les sources d’alerte sont-elles mutuellement indépendantes ?',
                    'L’acteur mentionné a-t-il confirmé son implication par voie officielle ?',
                    'Existe-t-il des informations contradictoires non encore répertoriées ?',
                  ]).map((q, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300"
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        {i + 1}
                      </span>
                      <span className="mt-0.5 font-medium">{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations de vérification (Section 23) */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Recommandations méthodologiques de vérification (À VÉRIFIER)
                </h3>
                <div className="space-y-2">
                  {(
                    correlation?.verificationRecommendations ||
                    weakSignal?.recommendedVerification || [
                      'Rechercher une seconde source primaire indépendante.',
                      'Vérifier la date exacte et la localisation géographique précise.',
                      'Contrôler si plusieurs articles ne sont pas une reprise de la même dépêche.',
                    ]
                  ).map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <footer className="p-3.5 sm:p-4 border-t border-slate-800 bg-[#0d121e] flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            {countryCodes.length > 0 && (
              <button
                onClick={() => {
                  vm.setFilter({ countryId: countryCodes[0] });
                  vm.navigateTo('carte');
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Voir sur la carte</span>
              </button>
            )}

            <button
              onClick={() => {
                if (countryCodes.length > 0) {
                  vm.setFilter({ countryId: countryCodes[0] });
                }
                vm.navigateTo('flux');
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Filtrer dans le flux</span>
            </button>

            <button
              onClick={() => {
                vm.navigateTo('temporel');
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Centre temporel</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/40 transition-colors"
          >
            Fermer l’analyse
          </button>
        </footer>
      </div>
    </div>
  );
};
