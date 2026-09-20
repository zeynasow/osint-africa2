import React, { useState, useMemo } from 'react';
import {
  X,
  Play,
  AlertTriangle,
  CheckCircle2,
  Shield,
  ShieldAlert,
  Server,
  Database,
  Radio,
  Clock,
  Layers,
  Info,
  Lock,
  Cpu,
  RefreshCw
} from 'lucide-react';
import {
  OsintSourceItem,
  OsintSourceConnector,
} from '../../types';
import { SANDBOX_DEMO_SOURCES, SANDBOX_DEMO_CONNECTORS } from '../../data/collectionSandboxData';
import { governanceService } from '../../services/governanceService';

interface LaunchCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (sourceId: string, connectorId: string, options: { maxItems: number; simulateErrors?: boolean }) => Promise<void>;
  killSwitchActive: boolean;
  allSources: OsintSourceItem[];
  allConnectors: OsintSourceConnector[];
}

export const LaunchCollectionModal: React.FC<LaunchCollectionModalProps> = ({
  isOpen,
  onClose,
  onLaunch,
  killSwitchActive,
  allSources,
  allConnectors,
}) => {
  // Liste combinée : sources de la sandbox + sources de démonstration + sources réelles (avec garde-fou)
  const [selectedSourceId, setSelectedSourceId] = useState<string>(SANDBOX_DEMO_SOURCES[0].id);
  const [itemCount, setItemCount] = useState<number>(4);
  const [simulateErrors, setSimulateErrors] = useState<boolean>(false);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);

  // Source sélectionnée
  const currentSource = useMemo(() => {
    return (
      SANDBOX_DEMO_SOURCES.find((s) => s.id === selectedSourceId) ||
      allSources.find((s) => s.id === selectedSourceId)
    );
  }, [selectedSourceId, allSources]);

  // Connecteur associé
  const currentConnector = useMemo(() => {
    const sbConn = SANDBOX_DEMO_CONNECTORS.find((c) => c.sourceId === selectedSourceId);
    if (sbConn) return sbConn;
    const existing = allConnectors.find((c) => c.sourceId === selectedSourceId);
    return existing || null;
  }, [selectedSourceId, allConnectors]);

  // Vérification de la gouvernance de la source
  const governanceRecord = useMemo(() => {
    return governanceService.getGovernanceBySourceId(selectedSourceId);
  }, [selectedSourceId]);

  const isRealSource = selectedSourceId.startsWith('src-real-') || (currentSource && currentSource.isReal && !currentSource.isDemo);
  const isBlockedByGov = governanceRecord && (governanceRecord.governanceStatus === 'DISABLED' || governanceRecord.governanceStatus === 'SUSPENDED');
  const hasGovWarning = governanceRecord && (governanceRecord.governanceStatus === 'TO_VERIFY' || governanceRecord.governanceStatus === 'TO_APPROVE');

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (killSwitchActive || isRealSource || isBlockedByGov) return;

    setIsLaunching(true);
    try {
      const connectorId = currentConnector?.id || `conn-sb-${selectedSourceId}`;
      await onLaunch(selectedSourceId, connectorId, {
        maxItems: itemCount,
        simulateErrors,
      });
      onClose();
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div
      id="modal-launch-collection-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && !isLaunching && onClose()}
    >
      <div
        id="modal-launch-collection-card"
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Play className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Lancer une Collecte Simulée</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Banc d’essai local • Émulation complète du pipeline d’ingestion sans trafic externe
              </p>
            </div>
          </div>
          <button
            id="btn-close-launch-modal"
            disabled={isLaunching}
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AVERTISSEMENT DOCTRINAL OBLIGATOIRE (Consigne 10) */}
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-purple-300 uppercase tracking-wider mb-0.5">
                SANDBOX — AUCUNE CONNEXION INTERNET
              </strong>
              Cette opération utilise exclusivement des données de démonstration locales. Aucune requête HTTP, aucun scraping, aucun appel RSS distant ne sera effectué. L'environnement opère en isolation complète.
            </div>
          </div>

          {/* Si Kill Switch Actif */}
          {killSwitchActive && (
            <div className="p-4 rounded-lg bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-rose-300 uppercase tracking-wider mb-0.5">
                  ARRÊT D’URGENCE ACTIF (KILL SWITCH)
                </strong>
                Toutes les simulations de collecte sont actuellement suspendues par décision de commandement. Désactivez le Kill Switch sur le bandeau supérieur pour autoriser une exécution.
              </div>
            </div>
          )}

          {/* Sélection de la source */}
          <div className="space-y-2">
            <label htmlFor="source-select" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Sélectionner la Source OSINT :
            </label>
            <select
              id="source-select"
              value={selectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 transition"
            >
              <optgroup label="── SOURCES SIMULÉES DE LA SANDBOX (LOT 23-A) ──">
                {SANDBOX_DEMO_SOURCES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.country} • {s.type}) [Simulation locale]
                  </option>
                ))}
              </optgroup>
              <optgroup label="── SOURCES RÉELLES RÉPERTORIÉES (112 SOURCES - NON CONNECTÉES) ──">
                {allSources
                  .filter((s) => s.isReal && !s.isDemo)
                  .slice(0, 15)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.country}) [SOURCE RÉELLE — NON CONNECTÉE]
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Diagnostic de la Source Sélectionnée */}
          {currentSource && (
            <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{currentSource.name}</span>
                {isRealSource ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    SOURCE RÉELLE — NON CONNECTÉE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    SOURCE SIMULÉE
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px]">{currentSource.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div>Pays : <strong className="text-slate-200">{currentSource.country}</strong></div>
                <div>Fiabilité : <strong className="text-slate-200">Admiralty {currentSource.reliability}</strong></div>
                <div>Connecteur : <strong className="text-slate-200 font-mono">{currentConnector?.connectorType || 'RSS'}</strong></div>
              </div>

              {/* Blocage source réelle */}
              {isRealSource && (
                <div className="mt-2 p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    <strong>COLLECTE BLOQUÉE :</strong> Les 112 sources réelles restent strictly non connectées. Aucune transmission externe autorisée.
                  </span>
                </div>
              )}

              {/* Blocage gouvernance */}
              {isBlockedByGov && (
                <div className="mt-2 p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    <strong>COLLECTE SIMULÉE BLOQUÉE PAR LA GOUVERNANCE :</strong> Statut {governanceRecord?.governanceStatus}.
                  </span>
                </div>
              )}

              {/* Avertissement gouvernance */}
              {hasGovWarning && (
                <div className="mt-2 p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>AVERTISSEMENT GOUVERNANCE :</strong> Source au statut {governanceRecord?.governanceStatus}. Validation humaine préalable recommandée.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Paramètres de la simulation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="item-count-select" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Volume d'items simulés :
              </label>
              <select
                id="item-count-select"
                value={itemCount}
                onChange={(e) => setItemCount(Number(e.target.value))}
                disabled={isRealSource || killSwitchActive}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 transition disabled:opacity-50"
              >
                <option value={2}>2 éléments bruts (test rapide)</option>
                <option value={4}>4 éléments bruts (cycle standard)</option>
                <option value={6}>6 éléments bruts (avec doublons et rejets)</option>
                <option value={8}>8 éléments bruts (banc d’essai complet)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="simulate-errors-toggle" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Comportement du Banc d'Essai :
              </label>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Injecter des anomalies</span>
                <input
                  type="checkbox"
                  id="simulate-errors-toggle"
                  checked={simulateErrors}
                  onChange={(e) => setSimulateErrors(e.target.checked)}
                  disabled={isRealSource || killSwitchActive}
                  className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              id="btn-cancel-launch"
              disabled={isLaunching}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              id="btn-confirm-launch"
              disabled={isLaunching || killSwitchActive || isRealSource || isBlockedByGov}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 transition flex items-center gap-2"
            >
              {isLaunching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Simulation en cours...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Lancer la Collecte Simulée
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
