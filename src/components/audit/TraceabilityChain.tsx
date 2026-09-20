import React from 'react';
import {
  CheckCircle2,
  XCircle,
  ArrowDown,
  ShieldAlert,
  ShieldCheck,
  Link as LinkIcon,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { OsintProvenance, OsintIntelligenceReport, OsintEvent } from '../../types';

export interface TraceabilityNode {
  level:
    | 'SOURCE'
    | 'INFORMATION'
    | 'ÉVÉNEMENT'
    | 'PREUVE'
    | 'ANALYSE'
    | 'HYPOTHÈSE'
    | 'CORRÉLATION'
    | 'FUSION'
    | 'RAPPORT'
    | 'CONCLUSION';
  status: 'TROUVÉ' | 'ABSENT';
  relationType: 'DIRECTE' | 'INDIRECTE' | 'AUCUNE';
  identifier?: string;
  name?: string;
  detail?: string;
}

interface TraceabilityChainProps {
  item: any;
  provenance?: OsintProvenance;
  allSources?: any[];
  allEvents?: OsintEvent[];
  allReports?: OsintIntelligenceReport[];
  compact?: boolean;
}

export const TraceabilityChain: React.FC<TraceabilityChainProps> = ({
  item,
  provenance,
  allSources = [],
  allEvents = [],
  allReports = [],
  compact = false,
}) => {
  // 1. Déduction dynamique des 10 nœuds sans fabrication
  const nodes: TraceabilityNode[] = React.useMemo(() => {
    // 1. SOURCE
    const sourceId = provenance?.sourceId || item?.sourceId || item?.sourceIds?.[0] || item?.source?.id;
    const sourceObj = sourceId ? allSources.find((s) => s.id === sourceId) : undefined;
    const sourceName = provenance?.sourceName || item?.source?.name || sourceObj?.name;
    const hasSource = Boolean(sourceId || sourceName);

    // 2. INFORMATION
    const infoText =
      item?.statement ||
      (item?.reportedInformation && item.reportedInformation[0]) ||
      item?.summary ||
      item?.executiveSummary ||
      item?.title;
    const hasInfo = Boolean(infoText);

    // 3. ÉVÉNEMENT
    const isEvent = item?.objectType === 'event' || Boolean(item?.coordinates && item?.severity);
    const eventId = isEvent ? item?.id : item?.eventId || item?.eventIds?.[0] || provenance?.parentObjectId;
    const eventObj = eventId ? allEvents.find((e) => e.id === eventId) : undefined;
    const hasEvent = isEvent || Boolean(eventId || eventObj);

    // 4. PREUVE
    const hasEvidence = Boolean(
      (item?.evidenceIds && item.evidenceIds.length > 0) ||
      (item?.supportingEvidenceIds && item.supportingEvidenceIds.length > 0) ||
      item?.objectType === 'evidence'
    );
    const evidenceId = item?.evidenceIds?.[0] || item?.supportingEvidenceIds?.[0] || (item?.objectType === 'evidence' ? item?.id : undefined);

    // 5. ANALYSE
    const isAnalysis = item?.objectType === 'analysis' || Boolean(item?.analysis && typeof item.analysis === 'string' && item.analysis.length > 10);
    const analysisId = item?.analysisId || item?.analysisIds?.[0] || (isAnalysis ? item?.id : undefined);
    const hasAnalysis = Boolean(analysisId || isAnalysis);

    // 6. HYPOTHÈSE
    const hasHypothesis = Boolean(
      (item?.hypotheses && item.hypotheses.length > 0) ||
      item?.hypothesisId ||
      item?.objectType === 'hypothesis'
    );
    const hypothesisTitle = item?.hypotheses?.[0]?.title || item?.hypotheses?.[0]?.description;

    // 7. CORRÉLATION
    const hasCorrelation = Boolean(
      (item?.correlationIds && item.correlationIds.length > 0) ||
      item?.correlationId ||
      item?.objectType === 'correlation'
    );
    const correlationId = item?.correlationIds?.[0] || item?.correlationId;

    // 8. FUSION
    const hasFusion = Boolean(
      (item?.fusionCaseIds && item.fusionCaseIds.length > 0) ||
      item?.fusionId ||
      item?.objectType === 'fusion'
    );
    const fusionId = item?.fusionCaseIds?.[0] || item?.fusionId;

    // 9. RAPPORT
    const isReport = item?.reportType !== undefined || item?.objectType === 'report';
    const reportId = isReport ? item?.id : item?.reportId || provenance?.objectId;
    const reportObj = reportId ? allReports.find((r) => r.id === reportId) : undefined;
    const hasReport = isReport || Boolean(reportObj);

    // 10. CONCLUSION
    const hasConclusion = Boolean(item?.conclusion || reportObj?.conclusion);

    return [
      {
        level: 'SOURCE',
        status: hasSource ? 'TROUVÉ' : 'ABSENT',
        relationType: sourceId ? 'DIRECTE' : hasSource ? 'INDIRECTE' : 'AUCUNE',
        identifier: sourceId,
        name: sourceName || 'Aucune source identifiée',
        detail: provenance?.sourceType || item?.source?.type,
      },
      {
        level: 'INFORMATION',
        status: hasInfo ? 'TROUVÉ' : 'ABSENT',
        relationType: hasInfo ? 'DIRECTE' : 'AUCUNE',
        name: infoText ? `${infoText.slice(0, 60)}...` : 'Information brute non renseignée',
      },
      {
        level: 'ÉVÉNEMENT',
        status: hasEvent ? 'TROUVÉ' : 'ABSENT',
        relationType: isEvent ? 'DIRECTE' : eventId ? 'DIRECTE' : 'AUCUNE',
        identifier: eventId,
        name: eventObj?.title || (isEvent ? item?.title : 'Événement non associé'),
      },
      {
        level: 'PREUVE',
        status: hasEvidence ? 'TROUVÉ' : 'ABSENT',
        relationType: hasEvidence ? 'DIRECTE' : 'AUCUNE',
        identifier: evidenceId,
        name: hasEvidence ? `Élément probatoire (${evidenceId || 'rattaché'})` : 'Aucune preuve matérielle',
      },
      {
        level: 'ANALYSE',
        status: hasAnalysis ? 'TROUVÉ' : 'ABSENT',
        relationType: isAnalysis ? 'DIRECTE' : analysisId ? 'INDIRECTE' : 'AUCUNE',
        identifier: analysisId,
        name: hasAnalysis ? 'Analyse structurée documentée' : 'Aucune analyse formelle',
      },
      {
        level: 'HYPOTHÈSE',
        status: hasHypothesis ? 'TROUVÉ' : 'ABSENT',
        relationType: hasHypothesis ? 'DIRECTE' : 'AUCUNE',
        name: hypothesisTitle ? `Hypothèse : ${hypothesisTitle.slice(0, 50)}...` : hasHypothesis ? 'Hypothèse formulée' : 'Aucune hypothèse répertoriée',
      },
      {
        level: 'CORRÉLATION',
        status: hasCorrelation ? 'TROUVÉ' : 'ABSENT',
        relationType: hasCorrelation ? 'DIRECTE' : 'AUCUNE',
        identifier: correlationId,
        name: hasCorrelation ? `Corrélation multi-flux (${correlationId})` : 'Pas de corrélation enregistrée',
      },
      {
        level: 'FUSION',
        status: hasFusion ? 'TROUVÉ' : 'ABSENT',
        relationType: hasFusion ? 'DIRECTE' : 'AUCUNE',
        identifier: fusionId,
        name: hasFusion ? `Cas de fusion multi-source (${fusionId})` : 'Non intégré en synthèse de fusion',
      },
      {
        level: 'RAPPORT',
        status: hasReport ? 'TROUVÉ' : 'ABSENT',
        relationType: isReport ? 'DIRECTE' : reportObj ? 'INDIRECTE' : 'AUCUNE',
        identifier: reportId,
        name: isReport ? item?.title : reportObj?.title || 'Non intégré dans un rapport diffusé',
      },
      {
        level: 'CONCLUSION',
        status: hasConclusion ? 'TROUVÉ' : 'ABSENT',
        relationType: hasConclusion ? 'DIRECTE' : 'AUCUNE',
        name: hasConclusion ? 'Conclusion analytique proportionnée formulée' : 'Aucune conclusion validée',
      },
    ];
  }, [item, provenance, allSources, allEvents, allReports]);

  // Détermination de la complétude
  const missingNodes = nodes.filter((n) => n.status === 'ABSENT');
  const isComplete = missingNodes.length === 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Header avec Statut de Traçabilité */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-100 text-sm tracking-wide">
            CHAÎNE DE TRAÇABILITÉ DU RENSEIGNEMENT
          </h3>
        </div>

        <div>
          {isComplete ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <ShieldCheck className="w-4 h-4" />
              TRAÇABILITÉ COMPLÈTE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <ShieldAlert className="w-4 h-4" />
              TRAÇABILITÉ INCOMPLÈTE ({missingNodes.length} maillon{missingNodes.length > 1 ? 's' : ''} manquant{missingNodes.length > 1 ? 's' : ''})
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Reconstitution stricte des relations existantes. Si un maillon n’a pas été formellement consigné, il est notifié absent sans fabrication de relation.
      </p>

      {/* Visualisation verticale ou compacte de la chaîne */}
      <div className="space-y-2 relative">
        {nodes.map((node, index) => {
          const isFound = node.status === 'TROUVÉ';
          return (
            <div key={node.level} className="relative">
              <div
                className={`p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                  isFound
                    ? 'bg-slate-800/60 border-slate-700/80 text-slate-200'
                    : 'bg-slate-950/60 border-dashed border-red-900/40 text-slate-400 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isFound ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400/80" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                        {node.level}
                      </span>
                      {isFound && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${
                            node.relationType === 'DIRECTE'
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          }`}
                        >
                          RELATION {node.relationType}
                        </span>
                      )}
                      {!isFound && (
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          ABSENT
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-200 font-medium">
                      {node.name}
                    </div>
                    {node.detail && (
                      <div className="text-[11px] text-slate-400">
                        {node.detail}
                      </div>
                    )}
                  </div>
                </div>

                {node.identifier && (
                  <div className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    ID: {node.identifier}
                  </div>
                )}
              </div>

              {/* Connecteur flèche vers le bas sauf dernier élément */}
              {index < nodes.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className={`w-3.5 h-3.5 ${isFound ? 'text-indigo-400/70' : 'text-slate-600'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
