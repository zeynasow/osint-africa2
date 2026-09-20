import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  Layers,
  FileText,
  FileCode,
  Hash,
  Activity,
  ArrowRight,
  GitBranch,
  Filter,
  Copy,
  Check,
  AlertCircle,
  Eye,
  Calendar,
  User,
  Database
} from 'lucide-react';
import {
  OsintCollectionJob,
  OsintRawItem,
  OsintNormalizedItem,
  OsintSourceItem
} from '../../types';

interface CollectionJobDetailModalProps {
  job: OsintCollectionJob | null;
  source?: OsintSourceItem | null;
  rawItems: OsintRawItem[];
  normalizedItems: OsintNormalizedItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectRawItem?: (rawItem: OsintRawItem) => void;
}

export const CollectionJobDetailModal: React.FC<CollectionJobDetailModalProps> = ({
  job,
  source,
  rawItems,
  normalizedItems,
  isOpen,
  onClose,
  onSelectRawItem,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pipeline' | 'items' | 'traceability'>('overview');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !job) return null;

  const jobRawItems = rawItems.filter(
    (r) => r.sourceId === job.sourceId || r.connectorId === job.connectorId
  );
  const jobNormItems = normalizedItems.filter(
    (n) => n.sourceId === job.sourceId
  );

  const handleCopyId = () => {
    navigator.clipboard?.writeText(job.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (job.status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> SUCCÈS
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> PARTIEL
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> ÉCHEC
          </span>
        );
      case 'DISABLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">
            <Shield className="w-3.5 h-3.5" /> BLOQUÉ / DÉSACTIVÉ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Activity className="w-3.5 h-3.5" /> {job.status}
          </span>
        );
    }
  };

  return (
    <div
      id="modal-job-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        id="modal-job-detail-card"
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Play className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-mono">{job.id}</h2>
                <button
                  id="btn-copy-job-id"
                  onClick={handleCopyId}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Copier l'identifiant"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {getStatusBadge()}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 tracking-wider">
                  SIMULATION LOCALE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Source : <span className="text-slate-200 font-medium">{source?.name || job.sourceId}</span> • Connecteur : <span className="text-slate-300 font-mono">{job.connectorId}</span>
              </p>
            </div>
          </div>
          <button
            id="btn-close-job-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation par onglets */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-800 bg-slate-900/50">
          <button
            id="tab-job-overview"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Vue d'ensemble & Métriques
          </button>
          <button
            id="tab-job-pipeline"
            onClick={() => setActiveTab('pipeline')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'pipeline'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" /> Pipeline (12 Étapes)
          </button>
          <button
            id="tab-job-items"
            onClick={() => setActiveTab('items')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'items'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Données Brutes & Normalisées ({job.itemsReceived})
          </button>
          <button
            id="tab-job-traceability"
            onClick={() => setActiveTab('traceability')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'traceability'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4" /> Traçabilité Ascendante
          </button>
        </div>

        {/* Contenu défilable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Cartes KPI d'exécution */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800">
                  <div className="text-xs text-slate-400">Items Reçus</div>
                  <div className="text-2xl font-bold text-white mt-1">{job.itemsReceived}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Échantillons capturés</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800">
                  <div className="text-xs text-slate-400">Items Acceptés</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{job.itemsAccepted}</div>
                  <div className="text-[11px] text-emerald-500/70 mt-1">Normalisation réussie</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800">
                  <div className="text-xs text-slate-400">Items Rejetés</div>
                  <div className="text-2xl font-bold text-rose-400 mt-1">{job.itemsRejected}</div>
                  <div className="text-[11px] text-rose-500/70 mt-1">Non-conformité technique</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800">
                  <div className="text-xs text-slate-400">Doublons Détectés</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">{job.duplicatesDetected}</div>
                  <div className="text-[11px] text-amber-500/70 mt-1">Arbitrage requis</div>
                </div>
              </div>

              {/* Fiche d'identification et d'exécution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" /> Identification du Job
                  </h3>
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">ID Unique :</span>
                      <span className="text-slate-200 font-mono">{job.id}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Source Émettrice :</span>
                      <span className="text-slate-200">{source?.name || job.sourceId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Connecteur Utilisé :</span>
                      <span className="text-slate-200 font-mono">{job.connectorId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Mode d’Exécution :</span>
                      <span className="text-purple-400 font-semibold">{job.executionMode}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Initiateur :</span>
                      <span className="text-slate-200">{job.initiatedBy || 'Analyste OSINT'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> Chronométrie & Taux
                  </h3>
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Début :</span>
                      <span className="text-slate-200 font-mono">{job.startedAt}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Fin :</span>
                      <span className="text-slate-200 font-mono">{job.completedAt || 'En cours'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Durée simulée :</span>
                      <span className="text-slate-200">{job.durationMs ? `${(job.durationMs / 1000).toFixed(2)}s` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Taux d’Acceptation :</span>
                      <span className="text-emerald-400 font-semibold">
                        {job.itemsReceived > 0 ? `${Math.round((job.itemsAccepted / job.itemsReceived) * 100)}%` : '0%'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Taux de Rejet :</span>
                      <span className="text-rose-400 font-semibold">
                        {job.itemsReceived > 0 ? `${Math.round((job.itemsRejected / job.itemsReceived) * 100)}%` : '0%'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Erreurs et avertissements */}
              {job.errors && job.errors.length > 0 && (
                <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-rose-400" /> Avertissements et Anomalies Enregistrées ({job.errors.length})
                  </h4>
                  <ul className="text-xs text-rose-200/80 space-y-1 list-disc list-inside">
                    {job.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Avertissement doctrinal */}
              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-purple-300 font-semibold">RAPPEL METHODOLOGIQUE SANDBOX :</span> Les métriques affichées ci-dessus reflètent exclusivement un banc d’essai local sous conditions simulées. Aucune tentative de connexion vers les serveurs récents n’a été réalisée conformément aux consignes de sécurité du LOT 23-A.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Suivi du traitement de l’information à travers les 12 étapes formelles du pipeline d'ingestion locale :
              </p>
              <div className="space-y-2.5">
                {[
                  { step: 1, name: 'Sélection de la Source', desc: `Source validée au registre : ${source?.name || job.sourceId}`, status: 'OK' },
                  { step: 2, name: 'Connecteur Mobilisé', desc: `Protocole et schéma d'ingestion : ${job.connectorId}`, status: 'OK' },
                  { step: 3, name: 'Job de Collecte Simulé', desc: `Instance d'exécution locale : ${job.id}`, status: 'OK' },
                  { step: 4, name: 'Génération des Raw Items', desc: `${job.itemsReceived} données brutes capturées dans le tampon mémoire`, status: 'OK' },
                  { step: 5, name: 'Validation Structurelle', desc: `Contrôle de format, métadonnées et protocoles`, status: job.itemsRejected > 0 ? 'WARNING' : 'OK' },
                  { step: 6, name: 'Normalisation Textuelle', desc: `Élimination du balisage parasite et standardisation du format`, status: 'OK' },
                  { step: 7, name: 'Calcul d’Empreinte Hash', desc: `Génération déterministe d'empreintes SHA-256 de vérification`, status: 'OK' },
                  { step: 8, name: 'Détection des Doublons (8 critères)', desc: `${job.duplicatesDetected} doublons potentiels identifiés sans suppression automatique`, status: job.duplicatesDetected > 0 ? 'WARNING' : 'OK' },
                  { step: 9, name: 'Classification Prédictive', desc: `Assignation indicative de catégorie et de couverture géographique`, status: 'OK' },
                  { step: 10, name: 'Validation Analytique', desc: `Revue de cohérence et conformité doctrinale`, status: 'OK' },
                  { step: 11, name: 'Création d’Événement OSINT', desc: `Préparation des fiches événementielles pour le Centre d'Analyse`, status: 'OK' },
                  { step: 12, name: 'Traçabilité Ascendante', desc: `Horodatage et chaînage infalsifiable des relations de provenance`, status: 'OK' },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-mono font-bold">
                        {item.step}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{item.name}</div>
                        <div className="text-[11px] text-slate-400">{item.desc}</div>
                      </div>
                    </div>
                    {item.status === 'OK' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        VALIDÉ
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        VIGILANCE
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'items' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Données Brutes & Normalisées associées ({jobRawItems.length})
                </h3>
              </div>

              {jobRawItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/30 rounded-lg border border-slate-800">
                  Aucun item spécifique associé directement à ce job d'archivage.
                </div>
              ) : (
                <div className="space-y-3">
                  {jobRawItems.map((raw) => {
                    const norm = jobNormItems.find((n) => n.rawItemId === raw.id);
                    return (
                      <div
                        key={raw.id}
                        className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2 hover:border-slate-700 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {raw.id}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                  raw.processingStatus === 'NORMALIZED'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : raw.processingStatus === 'DUPLICATE'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : raw.processingStatus === 'REJECTED'
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}
                              >
                                {raw.processingStatus}
                              </span>
                              {raw.contentHash && (
                                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                                  <Hash className="w-3 h-3" /> {raw.contentHash}
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-semibold text-white mt-1.5">{raw.title}</h4>
                          </div>
                          {onSelectRawItem && (
                            <button
                              onClick={() => onSelectRawItem(raw)}
                              className="px-2 py-1 rounded text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Inspecter
                            </button>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2">{raw.rawContent}</p>

                        {raw.rejectionReason && (
                          <div className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                            Motif de rejet : {raw.rejectionReason}
                          </div>
                        )}

                        {norm && (
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Normalisé : <strong className="text-slate-200">{norm.category}</strong> ({norm.country})</span>
                            <span>Statut doublon : <strong className="text-amber-300">{norm.duplicateStatus}</strong></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'traceability' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Visualisation de la chaîne de provenance ascendante et descendante :
              </p>
              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="p-3 rounded bg-slate-900 border border-slate-800 text-center w-full sm:w-auto">
                    <div className="text-slate-400 text-[10px]">SOURCE</div>
                    <div className="font-bold text-white mt-0.5">{source?.name || job.sourceId}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block" />
                  <div className="p-3 rounded bg-slate-900 border border-slate-800 text-center w-full sm:w-auto">
                    <div className="text-slate-400 text-[10px]">CONNECTEUR</div>
                    <div className="font-bold text-slate-200 font-mono mt-0.5">{job.connectorId}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block" />
                  <div className="p-3 rounded bg-emerald-950/40 border border-emerald-800/60 text-center w-full sm:w-auto">
                    <div className="text-emerald-400 text-[10px]">JOB DE COLLECTE</div>
                    <div className="font-bold text-emerald-300 font-mono mt-0.5">{job.id}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block" />
                  <div className="p-3 rounded bg-slate-900 border border-slate-800 text-center w-full sm:w-auto">
                    <div className="text-slate-400 text-[10px]">RAW ITEMS</div>
                    <div className="font-bold text-white mt-0.5">{job.itemsReceived} items</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block" />
                  <div className="p-3 rounded bg-slate-900 border border-slate-800 text-center w-full sm:w-auto">
                    <div className="text-slate-400 text-[10px]">NORMALISÉS</div>
                    <div className="font-bold text-white mt-0.5">{job.itemsAccepted} items</div>
                  </div>
                </div>

                <div className="p-3 rounded bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
                  <div className="font-semibold text-slate-200 mb-1">Règle de Traçabilité Doctrinale :</div>
                  Toute information issue de cette simulation locale conserve son empreinte cryptographique d'origine, son horodatage UTC d'ingestion ainsi que la désignation de l’opérateur ayant déclenché la session. En cas de manquement d'un seul maillon, la mention <em>« TRAÇABILITÉ INCOMPLÈTE »</em> est immédiatement appliquée.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="text-[11px] text-slate-400">
            Dernière mise à jour : <span className="text-slate-300">{job.completedAt || job.startedAt}</span>
          </div>
          <button
            id="btn-close-job-modal-footer"
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
