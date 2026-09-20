import React, { useMemo } from 'react';
import {
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Link,
  HelpCircle,
  Clock,
  Layers,
  CheckCircle2,
  GitBranch,
  Scale,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';
import { OsintProvenance, OsintIntelligenceReport, OsintEvent } from '../../types';
import { UseOsintViewModelReturn } from '../../viewmodels/useOsintViewModel';
import { TraceabilityChain } from '../audit/TraceabilityChain';
import {
  getQualityScoreBreakdown,
  detectGaps,
  generateVerificationQuestions,
} from '../../lib/auditUtils';

interface AuditDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  provenance?: OsintProvenance;
  vm: UseOsintViewModelReturn;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  provenance: propProvenance,
  vm,
}) => {
  if (!isOpen || !item) return null;

  // Récupération de la provenance associée
  const provenance: OsintProvenance | undefined = useMemo(() => {
    if (propProvenance) return propProvenance;
    if (item.objectType && item.id) {
      return vm.provenance?.find((p) => p.objectId === item.id || p.id === item.id);
    }
    return vm.provenance?.find((p) => p.objectId === item.id || p.id === item.id);
  }, [propProvenance, item, vm.provenance]);

  // Calcul du score de qualité et critères
  const qualityBreakdown = useMemo(() => {
    return getQualityScoreBreakdown(item, provenance);
  }, [item, provenance]);

  // Détection des lacunes réelles
  const gaps = useMemo(() => {
    return detectGaps(item, provenance);
  }, [item, provenance]);

  // Questions de vérification
  const verificationQuestions = useMemo(() => {
    return generateVerificationQuestions(item, gaps);
  }, [item, gaps]);

  // Données associées
  const sourceName =
    provenance?.sourceName ||
    item?.source?.name ||
    (item?.sourceId ? vm.sources?.find((s) => s.id === item.sourceId)?.name : 'Source non documentée');

  const sourceUrl =
    provenance?.sourceUrl ||
    item?.source?.originalUrlPlaceholder ||
    item?.url;

  const isDemo = Boolean(item?.isDemo || provenance?.isDemo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10">
          <div className="space-y-1.5 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                FICHE D’AUDIT & PROVENANCE
              </span>

              {isDemo && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wide">
                  DONNÉES DE DÉMONSTRATION
                </span>
              )}

              <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
                ID: {item.id || provenance?.id || 'NON DÉFINI'}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-100 leading-snug">
              {item.title || item.reference || provenance?.transformationType || 'Élément audité'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps défilant avec les sections d'audit */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Section 1 : Score de Qualité Documentaire */}
          <div className="p-5 rounded-xl border border-indigo-900/40 bg-indigo-950/20 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider font-bold text-indigo-400">
                  INDICATEUR DE QUALITÉ DOCUMENTAIRE
                </div>
                <div className="text-2xl font-black text-slate-100 mt-1 flex items-baseline gap-2">
                  <span>{qualityBreakdown.score}</span>
                  <span className="text-sm font-normal text-slate-400">/ 100</span>
                  <span
                    className={`ml-3 text-xs px-2.5 py-0.5 rounded font-bold border ${
                      qualityBreakdown.verdict === 'EXCELLENT'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : qualityBreakdown.verdict === 'SATISFAISANT'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : qualityBreakdown.verdict === 'INSUFFISANT'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {qualityBreakdown.verdict}
                  </span>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="w-48 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${
                    qualityBreakdown.score >= 80
                      ? 'bg-emerald-500'
                      : qualityBreakdown.score >= 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${qualityBreakdown.score}%` }}
                />
              </div>
            </div>

            {/* Note doctrinale impérative */}
            <div className="text-xs text-indigo-300/90 bg-indigo-900/30 p-3 rounded-lg border border-indigo-800/40 flex items-start gap-2">
              <Scale className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Avertissement méthodologique :</strong> Cet indice mesure exclusivement la rigueur de l'archivage documentaire, la présence des métadonnées et la complétude des liaisons.
                <strong> QUALITÉ DOCUMENTAIRE ≠ FIABILITÉ ≠ CONFIANCE ≠ CERTITUDE.</strong> Ce score ne reflète en rien la véracité intrinsèque de l'information.
              </span>
            </div>

            {/* Détail des critères formels */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-slate-300">CRITÈRES AYANT CONDUIT AU SCORE :</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {qualityBreakdown.criteria.map((crit) => (
                  <div
                    key={crit.id}
                    className="p-2.5 rounded bg-slate-800/60 border border-slate-700/60 flex items-start justify-between text-xs"
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="font-semibold text-slate-200">{crit.name}</div>
                      <div className="text-[11px] text-slate-400">{crit.detail}</div>
                    </div>
                    <div className="font-mono font-bold text-slate-300 shrink-0">
                      {crit.points}/{crit.maxPoints} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2 : Chaîne de Traçabilité Visuelle */}
          <TraceabilityChain
            item={item}
            provenance={provenance}
            allSources={vm.sources}
            allEvents={vm.events}
            allReports={vm.reports}
          />

          {/* Section 3 : Grille des Détails Méthodologiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bloc Identification & Source */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                IDENTIFICATION & SOURCE
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Objet / Type :</span>
                  <span className="font-semibold text-slate-200 uppercase font-mono">
                    {item.objectType || item.reportType || 'ÉVÉNEMENT'}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Source primaire :</span>
                  <span className="font-semibold text-slate-200">{sourceName}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Cote Fiabilité (Amirauté) :</span>
                  <span className="font-mono font-bold text-indigo-300">
                    {provenance?.reliability || item?.source?.reliability || 'Non évalué'}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Degré de certitude :</span>
                  <span className="text-slate-200">
                    {provenance?.certainty || 'Non renseigné'}
                  </span>
                </div>

                {sourceUrl && (
                  <div className="pt-1">
                    <span className="text-slate-400 block mb-1">URL / Référence d'origine :</span>
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 break-all"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {sourceUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Bloc Traçabilité & Provenance */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                HORODATAGE & PROVENANCE
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Date d'observation :</span>
                  <span className="font-mono text-slate-200">
                    {provenance?.observationDate || item?.date || 'Non renseignée'}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Date de publication :</span>
                  <span className="font-mono text-slate-200">
                    {provenance?.publicationDate || item?.createdAt || 'Non renseignée'}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Ingestion registre :</span>
                  <span className="font-mono text-slate-200">
                    {provenance?.ingestionDate || 'Automatique'}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Analyste référent :</span>
                  <span className="text-slate-200">
                    {provenance?.analystLabel || item?.author || 'Analyste Pôle Sahel'}
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-slate-400 block mb-1">Transformation appliquée :</span>
                  <span className="text-slate-300 font-medium">
                    {provenance?.transformationType || 'Acquisition brute sans altération'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4 : Lacunes de renseignement constatées */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                LACUNES DE RENSEIGNEMENT CONSTATÉES ({gaps.length})
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Détection automatique
              </span>
            </h3>

            {gaps.length === 0 ? (
              <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Aucune anomalie structurelle ni lacune de métadonnées relevée sur ce dossier.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {gaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 flex items-start gap-2"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{gap}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5 : Questions de vérification ciblées */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              QUESTIONS DE VÉRIFICATION ANALYTIQUE
            </h3>

            <p className="text-xs text-slate-400">
              Générées automatiquement en réponse aux lacunes et incertitudes constatées afin de guider l'analyste dans sa collecte de corroboration.
            </p>

            <div className="space-y-2">
              {verificationQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-slate-800/80 border border-slate-700 text-xs text-slate-200 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] flex items-center justify-center font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-200">{q}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Dossier d'audit consigné dans le registre immuable local.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Fermer la fiche
          </button>
        </div>

      </div>
    </div>
  );
};
