import React, { useState, useEffect } from 'react';
import {
  Radio,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
  Layers,
  Database,
  Hash,
  Activity,
  Lock,
  Unlock,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronRight,
  FileText,
  UserCheck,
  Check,
  X,
  SlidersHorizontal,
  Server,
  Sparkles,
  AlertCircle,
  Copy
} from 'lucide-react';
import {
  realPilotCollectionService,
  PILOT_CONFIG,
  PilotCollectionResult
} from '../../services/realPilotCollectionService';
import { sourceIngestionService } from '../../services/sourceIngestionService';
import {
  OsintSourceConnector,
  PilotChecklistItem,
  OsintRawItem,
  OsintNormalizedItem,
  OsintNetworkLog
} from '../../types';
import { PilotCollectionConfirmModal } from '../modals/PilotCollectionConfirmModal';
import { RawItemInspectModal } from '../modals/RawItemInspectModal';

interface RealPilotCollectionTabProps {
  onRefreshParent: () => void;
}

export const RealPilotCollectionTab: React.FC<RealPilotCollectionTabProps> = ({ onRefreshParent }) => {
  const [connector, setConnector] = useState<OsintSourceConnector>(() => realPilotCollectionService.getConnectorState());
  const [checklist, setChecklist] = useState<PilotChecklistItem[]>(() => realPilotCollectionService.getChecklist());
  const [networkLogs, setNetworkLogs] = useState<OsintNetworkLog[]>(() => realPilotCollectionService.getNetworkLogs());
  const [lastResult, setLastResult] = useState<PilotCollectionResult | null>(() => realPilotCollectionService.getLastCollectionResult());
  const [killSwitchActive, setKillSwitchActive] = useState<boolean>(() => sourceIngestionService.getKillSwitchStatus());

  // États d'interface
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [showChecklistDetails, setShowChecklistDetails] = useState(false);
  const [selectedRawItem, setSelectedRawItem] = useState<OsintRawItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'error' } | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Rechargement des données
  const refreshState = () => {
    setConnector(realPilotCollectionService.getConnectorState());
    setChecklist(realPilotCollectionService.getChecklist());
    setNetworkLogs(realPilotCollectionService.getNetworkLogs());
    setLastResult(realPilotCollectionService.getLastCollectionResult());
    setKillSwitchActive(sourceIngestionService.getKillSwitchStatus());
    onRefreshParent();
  };

  const showToast = (text: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const checklistValidation = realPilotCollectionService.isChecklistFullyValidated();

  // Action : Basculer un élément de la checklist
  const handleToggleChecklist = (id: string, current: boolean) => {
    const updated = realPilotCollectionService.updateChecklistItem(id, !current);
    setChecklist(updated);
  };

  // Action : Soumettre à révision humaine
  const handleSubmitReview = () => {
    const updated = realPilotCollectionService.submitForHumanReview();
    setConnector(updated);
    showToast('Source APS soumise à révision humaine par l’analyste.', 'warning');
  };

  // Action : Autorisation formelle
  const handleAuthorize = () => {
    const res = realPilotCollectionService.authorizeByHuman('Analyste Principal OSINT', 'Autorisation officielle validée pour test One-Shot contrôlé');
    if (res.success) {
      setConnector(res.connector);
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Action : Activation du pilote
  const handleActivatePilot = () => {
    const res = realPilotCollectionService.activatePilot();
    if (res.success) {
      setConnector(res.connector);
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Action d'urgence : Désactiver immédiatement la source (Rule 51)
  const handleEmergencySuspend = () => {
    const res = realPilotCollectionService.suspendPilot('Désactivation manuelle d’urgence');
    setConnector(res.connector);
    refreshState();
    showToast(res.message, 'warning');
  };

  // Lancement effectif de la collecte réelle One-Shot
  const handleConfirmExecuteCollection = async (analystName: string) => {
    setIsCollecting(true);
    try {
      const result = await realPilotCollectionService.executeOneShotPilotCollection(analystName);
      setLastResult(result);
      refreshState();
      setIsConfirmModalOpen(false);
      showToast(`Collecte réelle réussie : ${result.itemsAccepted} dépêches reçues et normalisées avec empreintes SHA-256.`, 'success');
    } catch (err: any) {
      refreshState();
      setIsConfirmModalOpen(false);
      showToast(err.message || 'Erreur lors de la collecte réelle', 'error');
    } finally {
      setIsCollecting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Toast de notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm font-medium animate-in fade-in duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : toastMessage.type === 'warning'
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : toastMessage.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bannière Doctrinale LOT 23-B */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 font-mono text-xs font-bold uppercase tracking-wide">
                LOT 23-B — INTÉGRATION RÉELLE CONTRÔLÉE
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 font-mono text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SOURCE PILOTE UNIQUE (1 SOURCE RÉELLE)
              </span>
              <span className="px-2.5 py-0.5 bg-slate-800 border border-slate-700 rounded-full text-slate-300 font-mono text-xs">
                111 SOURCES RESTANTES : NON CONNECTÉES
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Agence de Presse Sénégalaise (APS)</span>
              <span className="text-sm font-normal text-slate-400 font-mono">({PILOT_CONFIG.sourceId})</span>
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Source publique nationale sénégalaise sélectionnée pour la première intégration réelle de la plateforme. Collecte strictement
              <strong className="text-amber-200"> One-Shot</strong> via le flux RSS officiel (<span className="font-mono text-xs text-amber-300">https://aps.sn/feed/</span>).
              Volume borné à 10 éléments, calcul cryptographique SHA-256 réel, étiquetage formel <strong className="text-emerald-300">DONNÉES RÉELLES</strong> et arrêt d'urgence prioritaire.
            </p>
          </div>

          {/* Bouton de lancement de collecte One-Shot */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isCollecting || killSwitchActive || !checklistValidation.isValid || (connector.authorizationStatus !== 'AUTHORIZED' && connector.authorizationStatus !== 'ACTIVE')}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isCollecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Collecte en cours...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>LANCER COLLECTE PILOTE (ONE-SHOT)</span>
                </>
              )}
            </button>

            {/* Bouton d'urgence : Suspendre (Rule 51) */}
            <button
              onClick={handleEmergencySuspend}
              className="px-4 py-2 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 border border-slate-700 hover:border-rose-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors flex items-center justify-center gap-2"
              title="Désactiver immédiatement la source pilote et revenir en sandbox"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Désactiver / Retour Sandbox</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barre d'alerte Kill Switch si activé */}
      {killSwitchActive && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex items-center justify-between gap-4 text-rose-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm">COLLECTE RÉELLE BLOQUÉE — KILL SWITCH ACTIVÉ</h4>
              <p className="text-xs text-rose-300/90 mt-0.5">
                Le coupe-circuit général est enclenché. Tout appel réseau ou collecte réelle est strictement interdit.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sourceIngestionService.setKillSwitchStatus(false);
              setKillSwitchActive(false);
              showToast('Kill switch désactivé par l’analyste.', 'warning');
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition-colors shrink-0"
          >
            Lever le Kill Switch
          </button>
        </div>
      )}

      {/* État du connecteur & Workflow d'autorisation humaine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne 1 & 2 : Carte d'état et workflow */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Connecteur Pilote : {connector.id}</h3>
                <p className="text-xs text-slate-400">Protocole RSS 2.0 XML sur domaine officiel autorisé (aps.sn)</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                connector.authorizationStatus === 'ACTIVE'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : connector.authorizationStatus === 'AUTHORIZED'
                  ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                  : connector.authorizationStatus === 'HUMAN_REVIEW'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              {connector.statusLabel}
            </span>
          </div>

          {/* Étapes du workflow d'autorisation (Section 3) */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Workflow d'Autorisation Humaine Obligatoire
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  ['READY_TO_CONNECT', 'HUMAN_REVIEW', 'AUTHORIZED', 'ACTIVE'].includes(connector.authorizationStatus || '')
                    ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px]">1. Identifié</span>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold mt-1">Source & RSS Validés</span>
              </div>

              <div
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  ['READY_TO_CONNECT', 'HUMAN_REVIEW', 'AUTHORIZED', 'ACTIVE'].includes(connector.authorizationStatus || '')
                    ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px]">2. Prêt</span>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold mt-1">Checklist 14/14</span>
              </div>

              <div
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  ['HUMAN_REVIEW', 'AUTHORIZED', 'ACTIVE'].includes(connector.authorizationStatus || '')
                    ? 'bg-amber-950/40 border-amber-600/40 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px]">3. Révision</span>
                  {['AUTHORIZED', 'ACTIVE'].includes(connector.authorizationStatus || '') ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="font-semibold mt-1">Examen Déontologique</span>
              </div>

              <div
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  ['AUTHORIZED', 'ACTIVE'].includes(connector.authorizationStatus || '')
                    ? 'bg-teal-950/40 border-teal-600/40 text-teal-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px]">4. Autorisé</span>
                  {['ACTIVE'].includes(connector.authorizationStatus || '') ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="font-semibold mt-1">Pilote One-Shot</span>
              </div>
            </div>

            {/* Actions de changement de statut */}
            <div className="pt-2 flex flex-wrap gap-2">
              {connector.authorizationStatus === 'READY_TO_CONNECT' && (
                <button
                  onClick={handleSubmitReview}
                  className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Soumettre à révision humaine</span>
                </button>
              )}

              {connector.authorizationStatus === 'HUMAN_REVIEW' && (
                <button
                  onClick={handleAuthorize}
                  className="px-3.5 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 rounded-lg text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Approuver et autoriser (Analyste référent)</span>
                </button>
              )}

              {connector.authorizationStatus === 'AUTHORIZED' && (
                <button
                  onClick={handleActivatePilot}
                  className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Activer opérationnellement le connecteur</span>
                </button>
              )}
            </div>
          </div>

          {/* Paramètres techniques d'exécution */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Format & Encodage</span>
              <span className="font-bold text-white mt-0.5 block">XML RSS 2.0 / UTF-8</span>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Quota par Collecte</span>
              <span className="font-bold text-white mt-0.5 block">Max 10 dépêches</span>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Délai d'attente (Timeout)</span>
              <span className="font-bold text-white mt-0.5 block">10 000 ms (1 retry)</span>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Domaine autorisé</span>
              <span className="font-bold text-amber-300 font-mono mt-0.5 block">aps.sn uniquement</span>
            </div>
          </div>
        </div>

        {/* Colonne 3 : Checklist résumé de préactivation */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Checklist Pré-Activation</h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  checklistValidation.isValid
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {checklist.filter((c) => c.isChecked).length} / {checklist.length} validés
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              La collecte réelle est strictement conditionnée à la validation des 14 exigences juridiques, déontologiques et techniques.
            </p>

            {/* Aperçu des 3 catégories */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="text-slate-300">Identification & Domaine</span>
                <span className="text-emerald-400 font-bold">Conforme</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="text-slate-300">Conditions & robots.txt</span>
                <span className="text-emerald-400 font-bold">Autorisé</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="text-slate-300">Gouvernance & Kill Switch</span>
                <span className="text-emerald-400 font-bold">Opérationnel</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowChecklistDetails(!showChecklistDetails)}
            className="w-full mt-4 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showChecklistDetails ? 'Masquer le détail des 14 points' : 'Voir les 14 points d’audit'}</span>
            {showChecklistDetails ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Détail complet de la checklist (si déroulé) */}
      {showChecklistDetails && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Matrice d'Audit Pré-Activation (14 Points de Sécurité)</span>
            </h4>
            <span className="text-xs text-slate-400">Cliquer sur une case pour réévaluer</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {checklist.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleToggleChecklist(item.id, item.isChecked)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  item.isChecked
                    ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    : 'bg-rose-950/20 border-rose-800/40 hover:border-rose-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                    item.isChecked
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-slate-900 border-slate-700 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate">
                      {idx + 1}. {item.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{item.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{item.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Résultat de la dernière collecte réelle (Section 33) */}
      {lastResult && (
        <div className="bg-slate-900/95 border border-emerald-500/30 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">
                  RAPPORT DE COLLECTE RÉELLE ONE-SHOT
                </span>
                <h3 className="text-lg font-bold text-white">COLLECTE TERMINÉE AVEC SUCCÈS</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 font-mono text-xs font-bold">
                DONNÉES RÉELLES (APS)
              </span>
              <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-300 font-mono text-xs">
                Job : {lastResult.jobId}
              </span>
            </div>
          </div>

          {/* Grille métrique de restitution (Section 33) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Source Interrogée</span>
              <span className="font-bold text-white mt-1 block truncate" title={lastResult.sourceName}>
                APS (Sénégal)
              </span>
            </div>
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Connecteur Officiel</span>
              <span className="font-bold text-white mt-1 block truncate">
                {lastResult.connectorId}
              </span>
            </div>
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Durée d'Exécution</span>
              <span className="font-bold text-emerald-400 font-mono mt-1 block">
                {lastResult.durationMs} ms
              </span>
            </div>
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Items Reçus / Acceptés</span>
              <span className="font-bold text-white mt-1 block">
                {lastResult.itemsReceived} reçus / <strong className="text-emerald-400">{lastResult.itemsAccepted}</strong> ingérés
              </span>
            </div>
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Doublons Détectés</span>
              <span className="font-bold text-amber-400 mt-1 block">
                {lastResult.duplicatesCount} (arbitrage requis)
              </span>
            </div>
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Événements Automatiques</span>
              <span className="font-bold text-slate-300 mt-1 block">
                0 (règle doctrinale)
              </span>
            </div>
          </div>

          {/* Liste des dépêches réelles collectées avec SHA-256 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Dépêches Réelles Ingérées ({lastResult.rawItems.length})</span>
              </h4>
              <span className="text-xs text-slate-400">
                Provenance certifiée • Empreinte SHA-256 cryptographique
              </span>
            </div>

            <div className="space-y-2">
              {lastResult.rawItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold rounded">
                        DONNÉES RÉELLES
                      </span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] rounded">
                        #{index + 1}
                      </span>
                      <h5 className="text-sm font-bold text-white hover:text-amber-300 transition-colors">
                        {item.title}
                      </h5>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedRawItem(item)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-colors"
                        title="Inspecter le contenu brut"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Inspecter</span>
                      </button>
                      {item.originalUrl && (
                        <a
                          href={item.originalUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-colors"
                          title="Lien officiel APS"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {item.rawContent.replace(/<[^>]*>?/gm, '')}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400 border-t border-slate-900">
                    <div className="flex items-center gap-3">
                      <span>Publié : {new Date(item.publishedAt).toLocaleString('fr-FR')}</span>
                      <span>Collecté : {new Date(item.collectedAt).toLocaleTimeString('fr-FR')}</span>
                      <span className="text-cyan-400 font-medium">Classification : Heuristique locale</span>
                    </div>

                    {/* Empreinte cryptographique SHA-256 (Section 16) */}
                    <div className="flex items-center gap-1.5 font-mono text-[10px] bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      <Hash className="w-3 h-3 text-amber-400" />
                      <span className="text-slate-400">SHA-256 :</span>
                      <span className="text-amber-300 truncate max-w-[200px]" title={item.contentHash}>
                        {item.contentHash}
                      </span>
                      <button
                        onClick={() => copyToClipboard(item.contentHash)}
                        className="text-slate-500 hover:text-white p-0.5"
                        title="Copier le hash SHA-256"
                      >
                        {copiedHash === item.contentHash ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Journal Réseau de Collecte Réelle (Section 24) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Journal Réseau de la Source Pilote</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {networkLogs.length} requêtes consignées • Aucun secret enregistré
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Ce registre technique audite chaque appel HTTP vers le domaine officiel <span className="text-amber-300 font-mono">aps.sn</span>.
          Conformément aux règles de sécurité OSINT, aucun mot de passe, cookie, jeton ou en-tête d'évasion n'est utilisé ni archivé.
        </p>

        {networkLogs.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-500">
            Aucune requête réseau réelle enregistrée. Lancez la première collecte pilote pour initialiser ce journal.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Horodatage</th>
                  <th className="py-2.5 px-3">Méthode & Domaine</th>
                  <th className="py-2.5 px-3">Point d'Accès (Endpoint)</th>
                  <th className="py-2.5 px-3">Statut HTTP</th>
                  <th className="py-2.5 px-3">Durée</th>
                  <th className="py-2.5 px-3">Éléments</th>
                  <th className="py-2.5 px-3">Résultat</th>
                  <th className="py-2.5 px-3">Initiateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {networkLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-emerald-400 font-bold mr-1.5">{log.method}</span>
                      <span className="text-white font-medium">{log.domain}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{log.endpoint}</td>
                    <td className="py-2.5 px-3">
                      {log.httpStatus ? (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono text-[10px]">
                          {log.httpStatus} OK
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded font-mono text-[10px]">
                          BLOQUÉ
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{log.durationMs} ms</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{log.itemsCount}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.result === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : log.result === 'BLOCKED'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {log.result}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{log.initiator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modale de confirmation formelle pré-collecte (Section 32) */}
      <PilotCollectionConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmExecuteCollection}
        isCollecting={isCollecting}
        killSwitchActive={killSwitchActive}
      />

      {/* Modale d'inspection d'élément brut */}
      {selectedRawItem && (
        <RawItemInspectModal
          item={selectedRawItem}
          onClose={() => setSelectedRawItem(null)}
        />
      )}
    </div>
  );
};
