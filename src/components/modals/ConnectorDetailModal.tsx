import React, { useState } from 'react';
import {
  X,
  Server,
  Database,
  Globe,
  Radio,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Power,
  RefreshCw,
  FileCode,
  FileText,
  AlertCircle,
  Link2,
  MapPin,
  Scale,
  Hash,
  Activity,
  Layers,
  Info
} from 'lucide-react';
import {
  OsintSourceConnector,
  OsintSourceItem,
  ConnectorStatus,
  RobotsPolicy,
  LicensingStatus
} from '../../types';
import { testConnectorOffline } from '../../services/sourceIngestionService';

interface ConnectorDetailModalProps {
  connector: OsintSourceConnector | null;
  source?: OsintSourceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleEnabled?: (connectorId: string) => void;
}

export const ConnectorDetailModal: React.FC<ConnectorDetailModalProps> = ({
  connector,
  source,
  isOpen,
  onClose,
  onToggleEnabled,
}) => {
  const [testNotification, setTestNotification] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen || !connector) return null;

  const handleTestConnector = () => {
    const result = testConnectorOffline(connector);
    setTestNotification(result.message);
    setTimeout(() => {
      setTestNotification(null);
    }, 6000);
  };

  const handleCopyEndpoint = () => {
    if (connector.endpoint) {
      navigator.clipboard.writeText(connector.endpoint);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Helper pour badge de statut
  const getStatusBadge = (status: ConnectorStatus) => {
    switch (status) {
      case 'SOURCE_IDENTIFIED':
        return {
          label: 'SOURCE IDENTIFIÉE',
          sub: 'Réelle / non connectée',
          bg: 'bg-slate-800/80 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
        };
      case 'SOURCE_CONFIGURED':
        return {
          label: 'SOURCE CONFIGURÉE',
          sub: 'En attente d’activation',
          bg: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
          dot: 'bg-blue-400',
        };
      case 'READY_TO_CONNECT':
        return {
          label: 'PRÊTE À ÊTRE CONNECTÉE',
          sub: 'Paramètres validés',
          bg: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60',
          dot: 'bg-cyan-400',
        };
      case 'ACTIVE':
        return {
          label: 'ACTIVE (SIMULATION)',
          sub: 'Environnement sandbox',
          bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
          dot: 'bg-emerald-400 animate-pulse',
        };
      case 'ERROR':
        return {
          label: 'SOURCE EN ERREUR',
          sub: 'Défaillance ou timeout',
          bg: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
          dot: 'bg-rose-400',
        };
      case 'SUSPENDED':
        return {
          label: 'SOURCE SUSPENDUE',
          sub: 'Robots.txt ou rate limit',
          bg: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
          dot: 'bg-amber-400',
        };
      case 'DISABLED':
        return {
          label: 'SOURCE DÉSACTIVÉE',
          sub: 'Arrêt manuel par l’analyste',
          bg: 'bg-slate-900 text-slate-400 border-slate-800',
          dot: 'bg-slate-500',
        };
      default:
        return {
          label: status,
          sub: '',
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  const statusBadge = getStatusBadge(connector.status);

  return (
    <div
      id="modal-connector-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="modal-connector-detail-container"
        className="bg-[#0f1420] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative text-slate-200 selection:bg-amber-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête de la modale */}
        <div className="sticky top-0 z-10 bg-[#0f1420]/95 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-bold">
                  CONNECTEUR OSINT #{connector.id}
                </span>
                {connector.isDemo ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                    DONNÉES DE DÉMONSTRATION
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                    SOURCE RÉELLE (NON CONNECTÉE)
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-1 flex items-center gap-2">
                <span>{source?.name || connector.sourceId}</span>
              </h2>
            </div>
          </div>

          <button
            id="btn-close-connector-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bannière de notification lors du test désactivé */}
        {testNotification && (
          <div
            id="banner-test-offline-notification"
            className="mx-6 mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 flex items-start gap-3 shadow-lg animate-fadeIn"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-400">
                Mode Hors Ligne Strict Actif (LOT 21)
              </div>
              <div className="text-sm font-semibold mt-0.5">
                {testNotification}
              </div>
              <p className="text-xs text-amber-300/80 mt-1">
                Conformément aux spécifications de sécurité, aucune requête Internet n’est émise. Les tests sont journalisés localement dans l’audit d’ingestion sans impact sur le réseau.
              </p>
            </div>
          </div>
        )}

        {/* Corps principal */}
        <div className="p-6 space-y-6">
          {/* Section 1 : Statut et Informations Générales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Statut opérationnel */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${statusBadge.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium opacity-80">Statut du Connecteur</span>
                <span className={`w-2.5 h-2.5 rounded-full ${statusBadge.dot}`} />
              </div>
              <div>
                <div className="text-sm font-black tracking-wide uppercase">
                  {statusBadge.label}
                </div>
                <div className="text-xs opacity-75 mt-0.5">
                  {statusBadge.sub}
                </div>
              </div>
            </div>

            {/* Origine Géographique & Pays */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Pays & Région</span>
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100">
                  {source?.country || 'Panafricain / Régional'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {source?.region || 'Afrique'}
                </div>
              </div>
            </div>

            {/* Typologie Source & Connecteur */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Type de source & Protocole</span>
                <Layers className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-amber-400">
                  {connector.connectorType}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Format : {connector.format} ({connector.method})
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 : Spécifications Techniques d'Ingestion */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>Paramètres Techniques & Endpoint</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Point de terminaison (Endpoint) :</span>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-slate-200 break-all">
                  <span className="flex-1">{connector.endpoint || 'Aucun endpoint distant configuré (source déclarative passive)'}</span>
                  {connector.endpoint && (
                    <button
                      onClick={handleCopyEndpoint}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans"
                    >
                      {copySuccess ? 'Copié !' : 'Copier'}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500 block text-[11px]">Méthode HTTP :</span>
                  <span className="font-mono font-bold text-slate-200">{connector.method}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500 block text-[11px]">Format attendu :</span>
                  <span className="font-mono font-bold text-slate-200">{connector.format}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500 block text-[11px]">Fréquence prévue :</span>
                  <span className="font-mono font-bold text-slate-200">{connector.fetchInterval}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500 block text-[11px]">Limite (Rate Limit) :</span>
                  <span className="font-mono font-bold text-slate-200">{connector.rateLimit}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 : Conformité Légale, Déontologie & Robots.txt */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Conformité Juridique, Licence & Robots.txt (OSINT)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-slate-400 mb-1">Politique Robots.txt</div>
                <div className="flex items-center gap-2 font-bold">
                  {connector.robotsPolicy === 'ALLOWED' && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> AUTORISÉ
                    </span>
                  )}
                  {connector.robotsPolicy === 'RESTRICTED' && (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> RESTREINT
                    </span>
                  )}
                  {connector.robotsPolicy === 'DISALLOWED' && (
                    <span className="text-rose-400 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> EXCLUSION STRICTE
                    </span>
                  )}
                  {connector.robotsPolicy === 'UNSPECIFIED' && (
                    <span className="text-slate-400">NON AUDITÉ</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {connector.robotsPolicyNotes || 'Règles standards du domaine'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-slate-400 mb-1">Statut Licence & Réutilisation</div>
                <div className="font-bold text-slate-200">
                  {connector.licensingStatus}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {connector.legalNotes || 'Diffusion sous réserve d’audit des droits'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-slate-400 mb-1">Conditions d’Utilisation (ToS)</div>
                <div className="font-bold">
                  {connector.termsAccepted ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> VALIDÉES PAR L’ANALYSTE
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> EN ATTENTE D’ACCEPTATION
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Revue des conditions d’accès public requise
                </div>
              </div>
            </div>
          </div>

          {/* Section 4 : Sécurité & Authentification (Secrets JAMAIS stockés dans le code) */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Gestion Sécurisée de l’Authentification</span>
            </h3>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                {connector.authenticationRequired ? (
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Lock className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Unlock className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <div className="font-bold text-slate-200">
                    {connector.authenticationRequired
                      ? `Authentification Requise (${connector.authenticationType || 'Jeton / Clé'})`
                      : 'Accès Libre / Sans Authentification'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {connector.authenticationConfigured
                      ? 'Empreinte de configuration présente (coffre-fort local simulé)'
                      : 'Aucun identifiant requis'}
                  </div>
                </div>
              </div>

              <div className="text-right font-mono text-[11px] text-slate-500">
                <span>Sécurité : Zéro secret en clair</span>
              </div>
            </div>
          </div>

          {/* Section 5 : Horodatages et Historique des Tentatives */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Dernière tentative :</span>
              <span className="font-mono text-slate-300">
                {connector.lastAttempt || 'Aucune tentative (Hors ligne)'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Dernière réussite :</span>
              <span className="font-mono text-slate-300">
                {connector.lastSuccess || 'Néant'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Dernière erreur :</span>
              <span className="font-mono text-rose-400 truncate block">
                {connector.lastError || 'Aucune erreur consignée'}
              </span>
            </div>
          </div>
        </div>

        {/* Pied de page de la modale avec actions */}
        <div className="sticky bottom-0 z-10 bg-[#0f1420]/95 backdrop-blur-md border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Mode actuel : Hors ligne strict. Aucune collecte Internet réelle.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onToggleEnabled && (
              <button
                id="btn-toggle-connector-enabled"
                onClick={() => onToggleEnabled(connector.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                  connector.enabled
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{connector.enabled ? 'Désactiver' : 'Activer (Simulation)'}</span>
              </button>
            )}

            {/* Bouton de test réseau : AFFICHE STRICTEMENT L'AVERTISSEMENT SANS REQUÊTE RÉSEAU */}
            <button
              id="btn-test-connector"
              onClick={handleTestConnector}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-amber-950/30"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Tester le connecteur</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
