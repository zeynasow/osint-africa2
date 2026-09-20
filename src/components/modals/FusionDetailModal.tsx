/**
 * OSINT AFRICA - FICHE DÉTAILLÉE DE FUSION DU RENSEIGNEMENT
 * LOT 18 : Fusion Detail Inspection Modal
 * 
 * Comporte les 18 sections d'audit analytique requises :
 * 1. Identification
 * 2. Situation
 * 3. Chronologie
 * 4. Carte
 * 5. Événements
 * 6. Sources
 * 7. Acteurs
 * 8. Évidences
 * 9. Corrélations
 * 10. Signaux faibles
 * 11. Convergences
 * 12. Contradictions
 * 13. Hypothèses
 * 14. Lacunes informationnelles
 * 15. Questions
 * 16. Évaluation analytique
 * 17. Conclusion
 * 18. Traçabilité
 */

import React, { useState } from 'react';
import {
  OsintFusionCase,
  OsintEvent,
  OsintSourceItem,
  OsintActor,
  OsintCorrelation,
  OsintWeakSignal,
} from '../../types';
import {
  X,
  Layers,
  Calendar,
  MapPin,
  Users2,
  Radio,
  FileText,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Network,
  Activity,
  ArrowRight,
  Shield,
  Clock,
  Compass,
  Link as LinkIcon,
  Search,
  ExternalLink,
  ChevronRight,
  Eye,
  Crosshair,
  BadgeAlert,
  Sliders,
  Scale
} from 'lucide-react';
import { UseOsintViewModelReturn } from '../../viewmodels/useOsintViewModel';
import { DEMO_CORRELATIONS, DEMO_WEAK_SIGNALS } from '../../data/correlationData';
import { DEMO_EVIDENCE, DEMO_HYPOTHESES } from '../../data/analysisData';
import { validateTraceabilityChain } from '../../services/fusionEngine';

interface FusionDetailModalProps {
  fusionCase: OsintFusionCase | null;
  onClose: () => void;
  vm: UseOsintViewModelReturn;
  onOpenEvent?: (evt: OsintEvent) => void;
  onOpenSource?: (src: OsintSourceItem) => void;
  onOpenActor?: (actor: OsintActor) => void;
  onNavigateToCorrelation?: (corrId: string) => void;
}

type SectionKey =
  | 'ident'
  | 'situation'
  | 'chrono'
  | 'carte'
  | 'events'
  | 'sources'
  | 'acteurs'
  | 'evidences'
  | 'correlations'
  | 'signaux'
  | 'convergences'
  | 'contradictions'
  | 'hypotheses'
  | 'lacunes'
  | 'questions'
  | 'evaluation'
  | 'conclusion'
  | 'tracabilite';

const SECTIONS: { key: SectionKey; label: string; icon: any }[] = [
  { key: 'ident', label: '1. Identification', icon: Layers },
  { key: 'situation', label: '2. Situation générale', icon: FileText },
  { key: 'chrono', label: '3. Chronologie', icon: Calendar },
  { key: 'carte', label: '4. Carte d’observation', icon: MapPin },
  { key: 'events', label: '5. Événements liés', icon: Activity },
  { key: 'sources', label: '6. Sources contributrices', icon: Radio },
  { key: 'acteurs', label: '7. Acteurs associés', icon: Users2 },
  { key: 'evidences', label: '8. Évidences & Indices', icon: Crosshair },
  { key: 'correlations', label: '9. Corrélations', icon: Network },
  { key: 'signaux', label: '10. Signaux faibles', icon: Compass },
  { key: 'convergences', label: '11. Convergences', icon: CheckCircle2 },
  { key: 'contradictions', label: '12. Contradictions', icon: Scale },
  { key: 'hypotheses', label: '13. Hypothèses', icon: HelpCircle },
  { key: 'lacunes', label: '14. Lacunes info.', icon: AlertTriangle },
  { key: 'questions', label: '15. Questions analyste', icon: HelpCircle },
  { key: 'evaluation', label: '16. Évaluation', icon: Shield },
  { key: 'conclusion', label: '17. Conclusion', icon: CheckCircle2 },
  { key: 'tracabilite', label: '18. Traçabilité complète', icon: LinkIcon },
];

export const FusionDetailModal: React.FC<FusionDetailModalProps> = ({
  fusionCase,
  onClose,
  vm,
  onOpenEvent,
  onOpenSource,
  onOpenActor,
  onNavigateToCorrelation,
}) => {
  const [activeSection, setActiveSection] = useState<SectionKey>('ident');

  if (!fusionCase) return null;

  // Linked entities
  const linkedEvents = vm.events.filter(e => fusionCase.eventIds.includes(e.id));
  const linkedSources = vm.sources.filter(s => fusionCase.sourceIds.includes(s.id));
  const linkedActors = vm.actors.filter(a => fusionCase.actorIds.includes(a.id));
  const linkedCorrelations = DEMO_CORRELATIONS.filter(c => fusionCase.correlationIds.includes(c.id));
  const linkedWeakSignals = DEMO_WEAK_SIGNALS.filter(w => fusionCase.weakSignalIds.includes(w.id));
  const linkedEvidences = DEMO_EVIDENCE.filter(ev => (fusionCase.evidenceIds || []).includes(ev.id));
  const linkedHypotheses = DEMO_HYPOTHESES.filter(hyp => (fusionCase.hypothesisIds || []).includes(hyp.id));

  // Traceability audit
  const traceabilityAudit = validateTraceabilityChain(fusionCase);

  return (
    <div
      id="modal-fusion-detail-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="modal-fusion-detail-container"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl h-[92vh] max-h-[950px] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider">
                  {fusionCase.id}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950/80 border border-cyan-700/50 text-cyan-300">
                  {fusionCase.status}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                    fusionCase.priority === 'CRITIQUE'
                      ? 'bg-red-950/80 border-red-700/60 text-red-300'
                      : fusionCase.priority === 'HAUTE'
                      ? 'bg-amber-950/80 border-amber-700/60 text-amber-300'
                      : 'bg-blue-950/80 border-blue-700/60 text-blue-300'
                  }`}
                >
                  Priorité {fusionCase.priority}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 border border-slate-700 text-slate-300">
                  État : {fusionCase.situationState}
                </span>
                {fusionCase.isDemo && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    DÉMONSTRATION OSINT
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-1 line-clamp-1">
                {fusionCase.title}
              </h2>
            </div>
          </div>

          <button
            id="btn-close-fusion-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fermer la fiche"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Epistemological Banner */}
        <div className="bg-slate-950 border-b border-amber-500/30 px-5 py-2 flex items-center justify-between text-xs text-amber-300/90 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Avertissement analytique :</strong> Cette fiche de fusion regroupe des éléments observés. Elle ne constitue ni une preuve absolue ni une certitude causale. Arbitrage humain requis.
            </span>
          </div>
          <span className="hidden md:inline font-mono text-[10px] text-slate-500 shrink-0">
            LOT 18 FUSION INTEL
          </span>
        </div>

        {/* Main Body with Sidebar Navigation */}
        <div className="flex-1 flex overflow-hidden">
          {/* Section Navigation Sidebar */}
          <div className="w-56 sm:w-64 border-r border-slate-800 bg-slate-950/40 p-2 overflow-y-auto shrink-0 flex flex-col gap-1">
            <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Sections du Dossier
            </div>
            {SECTIONS.map(s => {
              const Icon = s.icon;
              const isSelected = activeSection === s.key;
              return (
                <button
                  key={s.key}
                  id={`nav-section-${s.key}`}
                  onClick={() => setActiveSection(s.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-200 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section Content View */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-900/60">
            {/* 1. Identification */}
            {activeSection === 'ident' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    1. Identification & Métadonnées de Fusion
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Référencement unique et typologie de la situation de fusion.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">Identifiant Unique</span>
                    <span className="font-mono text-sm font-bold text-cyan-300">{fusionCase.id}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">Pays concernés</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {fusionCase.countryCodes.map(c => (
                        <span key={c} className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono text-slate-200">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">Niveau de Confiance Analytique</span>
                    <span className="text-xs font-bold text-slate-200">{fusionCase.confidence}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">Portée / Importance</span>
                    <span className="text-xs font-bold text-slate-200">{fusionCase.significance}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">Première observation</span>
                    <span className="text-xs text-slate-300 font-mono">
                      {new Date(fusionCase.firstObservedAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">Dernière mise à jour</span>
                    <span className="text-xs text-slate-300 font-mono">
                      {new Date(fusionCase.lastUpdatedAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-300">
                  <span className="font-bold text-cyan-300 block mb-1">Chaîne cognitive respectée :</span>
                  DONNÉE → INFORMATION → ÉVIDENCE → ÉVÉNEMENT → ACTEUR → PAYS → TEMPS → CORRÉLATION → SIGNAL FAIBLE → HYPOTHÈSE → ANALYSE → CONCLUSION
                </div>
              </div>
            )}

            {/* 2. Situation générale */}
            {activeSection === 'situation' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    2. Situation Générale & Faits Établis
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Description factuelle sans extrapolation causale.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-200 leading-relaxed">
                  {fusionCase.description}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Faits confirmés / Établis ({fusionCase.keyFacts.length})
                  </h4>
                  <ul className="space-y-2">
                    {fusionCase.keyFacts.map((fact, idx) => (
                      <li key={idx} className="p-2.5 rounded-lg bg-emerald-950/10 border border-emerald-800/30 text-xs text-slate-300 flex items-start gap-2">
                        <span className="font-mono text-emerald-400 font-bold">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Informations non confirmées ({fusionCase.unconfirmedInformation.length})
                  </h4>
                  <ul className="space-y-2">
                    {fusionCase.unconfirmedInformation.map((info, idx) => (
                      <li key={idx} className="p-2.5 rounded-lg bg-amber-950/10 border border-amber-800/30 text-xs text-amber-200/90 flex items-start gap-2">
                        <span className="font-mono text-amber-400 font-bold">?</span>
                        <span>{info}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 3. Chronologie */}
            {activeSection === 'chrono' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    3. Chronologie Fusionnée des Événements & Signaux
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Échelonnement temporel des observations physiques et rapports d'information.
                  </p>
                </div>

                <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 pl-8">
                  {linkedEvents.map(e => (
                    <div key={e.id} className="relative p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                      <div className="absolute -left-[27px] top-3.5 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-slate-900" />
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-mono text-cyan-300">
                          {new Date(e.publishedAt || e.detectedAt || '').toLocaleString('fr-FR')}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {e.country}
                        </span>
                      </div>
                      <div className="font-bold text-slate-200">{e.title}</div>
                      <p className="text-slate-400 mt-1">{e.summary}</p>
                      <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                        <span>Source : {e.sourceName}</span>
                        <span>•</span>
                        <span>Fiabilité : {e.reliability}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Carte */}
            {activeSection === 'carte' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    4. Carte d'Observation Géospatiale
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Représentation des points d'observation. Aucune qualification de "zone ennemie" sans documentation probante.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-semibold">Périmètre géographique rattaché</span>
                    <span className="text-xs text-cyan-400 font-mono">{fusionCase.regionIds.join(' / ')}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {fusionCase.countryCodes.map(cc => {
                      const cObj = vm.countries.find(c => c.id.toUpperCase() === cc.toUpperCase());
                      return (
                        <div key={cc} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                          <span className="text-lg">{cObj?.flag || '🌍'}</span>
                          <div>
                            <span className="text-xs font-bold text-slate-200 block">{cObj?.name || cc}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Code : {cc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
                    <span className="text-slate-300 font-medium">Principe de neutralité cartographique :</span> Les marqueurs reflètent des points de captation ou de déclaration (coordonnées des événements et nœuds de corrélation) sans extrapolations topologiques subjectives.
                  </div>
                </div>
              </div>
            )}

            {/* 5. Événements */}
            {activeSection === 'events' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    5. Événements Rattachés ({linkedEvents.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Événements OSINT formant le faisceau d'observations primaires.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {linkedEvents.map(e => (
                    <div
                      key={e.id}
                      onClick={() => onOpenEvent && onOpenEvent(e)}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-slate-200">{e.title}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {e.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">{e.summary}</p>
                      <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Source : {e.sourceName}</span>
                        <span className="text-cyan-400 flex items-center gap-1">
                          Consulter l'événement <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Sources */}
            {activeSection === 'sources' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    6. Sources Contributrices ({linkedSources.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    La fréquence de citation ne vaut pas mesure de fiabilité. Évaluation indépendante requise.
                  </p>
                </div>

                <div className="space-y-3">
                  {linkedSources.map(s => (
                    <div
                      key={s.id}
                      onClick={() => onOpenSource && onOpenSource(s)}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 text-xs">{s.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                          {s.type}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-400">
                        <div>Pays d'ancrage : <span className="text-slate-300">{s.country || 'Régional'}</span></div>
                        <div>Fiabilité déclarée : <span className="text-slate-300">{s.reliability || 'Non évaluée'}</span></div>
                      </div>
                      <div className="mt-2 text-[11px] text-cyan-400 flex items-center gap-1">
                        Ouvrir la fiche source <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Acteurs */}
            {activeSection === 'acteurs' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Users2 className="w-4 h-4 text-cyan-400" />
                    7. Acteurs Associés
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Distinction formelle entre <strong>Acteur Mentionné</strong> (cité dans un flux) et <strong>Acteur Impliqué</strong> (responsabilité matérielle attestée).
                  </p>
                </div>

                <div className="space-y-3">
                  {linkedActors.map(a => (
                    <div
                      key={a.id}
                      onClick={() => onOpenActor && onOpenActor(a)}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 text-xs">{a.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
                          STATUT : ACTEUR MENTIONNÉ
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">{a.description}</p>
                      <div className="mt-2 text-[11px] text-cyan-400 flex items-center gap-1">
                        Consulter le dossier acteur <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                  {linkedActors.length === 0 && (
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
                      Aucun acteur étatique ou non étatique n'est formellement identifié à ce stade.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 8. Évidences */}
            {activeSection === 'evidences' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-cyan-400" />
                    8. Évidences & Indices Documentés ({linkedEvidences.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Éléments matériels rattachés selon les disciplines du renseignement d'origine ouverte (IMINT, SIGINT, SOCMINT, etc.).
                  </p>
                </div>

                <div className="space-y-2.5">
                  {linkedEvidences.map(ev => (
                    <div key={ev.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 text-xs">{ev.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 border border-purple-800 text-purple-300 font-bold">
                          {ev.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">{ev.description}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Statut : {ev.verificationStatus}</span>
                        <span>Acquisition : {ev.dateAcquired || 'Récente'}</span>
                      </div>
                    </div>
                  ))}
                  {linkedEvidences.length === 0 && (
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
                      Aucune pièce d'évidence formelle enregistrée pour cette situation.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 9. Corrélations */}
            {activeSection === 'correlations' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Network className="w-4 h-4 text-cyan-400" />
                    9. Corrélations Multi-Critères Associées ({linkedCorrelations.length})
                  </h3>
                  <p className="text-xs text-amber-300/90 mt-1">
                    Corrélation analytique — ne constitue pas une preuve de causalité.
                  </p>
                </div>

                <div className="space-y-3">
                  {linkedCorrelations.map(corr => (
                    <div
                      key={corr.id}
                      onClick={() => onNavigateToCorrelation && onNavigateToCorrelation(corr.id)}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 text-xs">{corr.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 font-bold">
                          Score {corr.score}/{corr.maxScore}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">{corr.description}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Confiance : {corr.confidence}</span>
                        <span className="text-cyan-400 flex items-center gap-1">
                          Voir dans le Centre de Corrélation <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 10. Signaux faibles */}
            {activeSection === 'signaux' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    10. Signaux Faibles Rattachés ({linkedWeakSignals.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Observations à surveiller et non menaces certaines.
                  </p>
                </div>

                <div className="space-y-3">
                  {linkedWeakSignals.map(sig => (
                    <div key={sig.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 text-xs">{sig.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                          {sig.evolution}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">{sig.description}</p>
                      <div className="mt-2 text-[11px] text-slate-400">
                        <strong>Indicateurs :</strong> {sig.indicators.join(' • ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 11. Convergences */}
            {activeSection === 'convergences' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    11. Convergences Multi-Sources ({fusionCase.convergences.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Recoupements indépendants et cohérences d'informations.
                  </p>
                </div>

                <div className="space-y-3">
                  {fusionCase.convergences.map(cnv => (
                    <div key={cnv.id} className="p-3.5 rounded-xl bg-emerald-950/10 border border-emerald-800/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-300 text-xs">{cnv.topic}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-200">
                          Confiance : {cnv.confidence}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{cnv.concordanceSummary}</p>
                      <div className="pt-2 border-t border-emerald-900/30 flex flex-col gap-1.5">
                        {cnv.sources.map((s, sIdx) => (
                          <div key={sIdx} className="text-[11px] text-slate-400 flex items-center justify-between">
                            <span>• {s.sourceName} : « {s.statement} »</span>
                            <span className="font-mono text-[10px] text-emerald-400">({s.independence})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 12. Contradictions */}
            {activeSection === 'contradictions' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400" />
                    12. Contradictions & Divergences à Examiner ({fusionCase.contradictions.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    L'application ne tranche pas automatiquement les contradictions : arbitrage analyste obligatoire.
                  </p>
                </div>

                <div className="space-y-3">
                  {fusionCase.contradictions.map(cot => (
                    <div key={cot.id} className="p-4 rounded-xl bg-amber-950/15 border border-amber-800/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300 text-xs">{cot.topic}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-900/60 text-amber-200 font-bold">
                          {cot.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                          <span className="font-bold text-slate-300 block mb-1">Source A : {cot.sourceA.sourceName}</span>
                          <p className="text-slate-400 italic">« {cot.sourceA.statement} »</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                          <span className="font-bold text-slate-300 block mb-1">Source B : {cot.sourceB.sourceName}</span>
                          <p className="text-slate-400 italic">« {cot.sourceB.statement} »</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-amber-900/20 border border-amber-800/30 text-xs text-amber-200">
                        <strong>Divergence :</strong> {cot.divergence}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="text-amber-400 font-semibold">{cot.analystActionRequired}</span>
                      </div>
                    </div>
                  ))}
                  {fusionCase.contradictions.length === 0 && (
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
                      Aucune contradiction flagrante répertoriée entre les sources actuelles.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 13. Hypothèses */}
            {activeSection === 'hypotheses' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    13. Hypothèses Analytiques en Concurrence
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Le système ne sélectionne aucune hypothèse comme vraie. L'analyste reste responsable de l'évaluation.
                  </p>
                </div>

                <div className="space-y-3">
                  {linkedHypotheses.map(hyp => (
                    <div key={hyp.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 text-xs">{hyp.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300">
                          {hyp.status} ({hyp.confidence})
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{hyp.description}</p>
                      <div className="pt-2 border-t border-slate-800 text-xs grid grid-cols-2 gap-2">
                        <div className="text-emerald-400">
                          ✓ Éléments favorables : {hyp.supportingEvidenceIds.length} indice(s)
                        </div>
                        <div className="text-rose-400">
                          ✕ Éléments défavorables : {(hyp.opposingEvidenceIds || []).length} indice(s)
                        </div>
                      </div>
                    </div>
                  ))}
                  {linkedHypotheses.length === 0 && (
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
                      Hypothèses H1/H2 en cours de modélisation dans le dossier d'analyse lié.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 14. Lacunes */}
            {activeSection === 'lacunes' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    14. Lacunes Informationnelles & Points Aveugles
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Éléments manquants guidant les priorités de recherche futures.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {fusionCase.informationGaps.map((gap, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                      <span className="font-mono text-amber-400 font-bold">[{idx + 1}]</span>
                      <span>{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 15. Questions */}
            {activeSection === 'questions' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    15. Questions Analytiques à Élucider
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Interrogations opérationnelles destinées à lever les ambiguïtés.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {fusionCase.analystQuestions.map((q, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                      <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 16. Évaluation */}
            {activeSection === 'evaluation' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    16. Évaluation Analytique
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Synthèse de situation ordonnée par l'analyste.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 leading-relaxed">
                  {fusionCase.analyticalAssessment}
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/15 border border-amber-500/30 text-xs text-amber-300">
                  <strong>Clause de révision continue :</strong> Cette évaluation est fondée sur les informations actuellement disponibles et doit être réévaluée lorsque de nouvelles données apparaissent.
                </div>
              </div>
            )}

            {/* 17. Conclusion */}
            {activeSection === 'conclusion' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    17. Conclusion & Recommandations de Veille
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Point de situation final pour le commandement ou les décideurs.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-sm text-slate-200 leading-relaxed font-medium">
                  {fusionCase.conclusion}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Incertitudes résiduelles</span>
                    <ul className="space-y-1 text-slate-300">
                      {fusionCase.uncertainties.map((u, i) => (
                        <li key={i}>• {u}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Index de fiabilité globale</span>
                    <span className="text-base font-bold text-cyan-300 font-mono">{fusionCase.confidence}</span>
                    <p className="text-[11px] text-slate-500 mt-1">Évaluation collégiale OSINT.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 18. Traçabilité */}
            {activeSection === 'tracabilite' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-cyan-400" />
                    18. Traçabilité Complète de la Chaîne Cognitive
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Chaque conclusion doit remonter sans rupture jusqu’à la source primaire et l’événement racine.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-200">Statut de l'Audit de Traçabilité</span>
                    {traceabilityAudit.isFullyTraceable ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 border border-emerald-700 text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> CHAÎNE COMPLÈTE
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950 border border-amber-700 text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> TRAÇABILITÉ INCOMPLÈTE
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Norme OSINT : Une conclusion dépourvue de chaîne traçable (Conclusion → Analyse → Hypothèse → Évidence → Source → Information → Événement) ne peut servir de fondement opérationnel.
                  </p>
                </div>

                <div className="space-y-3">
                  {traceabilityAudit.auditResults.map((audit, aIdx) => (
                    <div
                      key={aIdx}
                      className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                        audit.isComplete
                          ? 'bg-slate-950/60 border-slate-800'
                          : 'bg-amber-950/15 border-amber-800/40'
                      }`}
                    >
                      <div className="font-bold text-slate-200">
                        Conclusion : « {audit.conclusion} »
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
                        <div className={`p-2 rounded ${audit.hasAnalysis ? 'bg-slate-900 text-emerald-300' : 'bg-rose-950/30 text-rose-400'}`}>
                          Analyse : {audit.hasAnalysis ? '✓' : '✕'}
                        </div>
                        <div className={`p-2 rounded ${audit.hasHypothesis ? 'bg-slate-900 text-emerald-300' : 'bg-rose-950/30 text-rose-400'}`}>
                          Hypothèse : {audit.hasHypothesis ? '✓' : '✕'}
                        </div>
                        <div className={`p-2 rounded ${audit.hasEvidence ? 'bg-slate-900 text-emerald-300' : 'bg-rose-950/30 text-rose-400'}`}>
                          Évidence : {audit.hasEvidence ? '✓' : '✕'}
                        </div>
                        <div className={`p-2 rounded ${audit.hasSource ? 'bg-slate-900 text-emerald-300' : 'bg-rose-950/30 text-rose-400'}`}>
                          Source : {audit.hasSource ? '✓' : '✕'}
                        </div>
                        <div className={`p-2 rounded ${audit.hasEvent ? 'bg-slate-900 text-emerald-300' : 'bg-rose-950/30 text-rose-400'}`}>
                          Événement : {audit.hasEvent ? '✓' : '✕'}
                        </div>
                      </div>

                      {audit.brokenLinks.length > 0 && (
                        <div className="p-2.5 rounded bg-rose-950/20 border border-rose-900/40 text-rose-300 text-[11px] space-y-1">
                          <span className="font-bold block">Maillons manquants ou rompus :</span>
                          {audit.brokenLinks.map((bl, blIdx) => (
                            <div key={blIdx}>• {bl}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0 text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <span>Dossier : <strong className="text-slate-200">{fusionCase.id}</strong></span>
            <span>•</span>
            <span>Section {SECTIONS.findIndex(s => s.key === activeSection) + 1} sur 18</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const idx = SECTIONS.findIndex(s => s.key === activeSection);
                if (idx > 0) setActiveSection(SECTIONS[idx - 1].key);
              }}
              disabled={activeSection === SECTIONS[0].key}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              Précédent
            </button>
            <button
              onClick={() => {
                const idx = SECTIONS.findIndex(s => s.key === activeSection);
                if (idx < SECTIONS.length - 1) setActiveSection(SECTIONS[idx + 1].key);
              }}
              disabled={activeSection === SECTIONS[SECTIONS.length - 1].key}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors font-medium"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
