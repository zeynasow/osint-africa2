/**
 * OSINT AFRICA - Fiche Complète de Gouvernance d'une Source (LOT 22)
 * 
 * Strictement HORS LIGNE — Règle doctrinale :
 * « CRITICITÉ ≠ FIABILITÉ », « PRÊTE À CONNECTER ≠ CONNECTÉE », « APPROUVÉE ≠ FIABLE »
 */

import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Scale,
  CheckCircle2,
  Clock,
  UserCheck,
  Lock,
  ExternalLink,
  Layers,
  FileText,
  Radio,
  History,
  Info,
  Check,
  Ban,
  WifiOff,
  Sparkles
} from 'lucide-react';
import {
  OsintSourceItem,
  OsintSourceGovernance,
  SourcePriority,
  SourceCriticality,
  GovernanceWorkflowStatus,
  HumanValidationDecision,
  SOURCE_PRIORITY_LABELS,
  SOURCE_CRITICALITY_LABELS,
  GOVERNANCE_STATUS_LABELS,
  OsintSourceConnector,
  PreActivationCheckItem
} from '../../../types';
import { governanceService } from '../../../services/governanceService';

interface SourceGovernanceDetailModalProps {
  source: OsintSourceItem;
  governance: OsintSourceGovernance;
  connector?: OsintSourceConnector;
  onClose: () => void;
  onUpdated: () => void;
}

export const SourceGovernanceDetailModal: React.FC<SourceGovernanceDetailModalProps> = ({
  source,
  governance,
  connector,
  onClose,
  onUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'identification' | 'conformite' | 'connecteur' | 'validation' | 'checklist' | 'historique'>('identification');
  
  // État du formulaire de validation humaine
  const [validatorName, setValidatorName] = useState('Analyste Senior OSINT');
  const [decision, setDecision] = useState<HumanValidationDecision>('APPROVED');
  const [justification, setJustification] = useState('');
  const [reservations, setReservations] = useState('');
  const [nextReviewDate, setNextReviewDate] = useState('2027-03-14');
  const [validationSuccessMsg, setValidationSuccessMsg] = useState<string | null>(null);

  // État de la priorité et criticité
  const [selectedPriority, setSelectedPriority] = useState<SourcePriority>(governance.priority);
  const [selectedCriticality, setSelectedCriticality] = useState<SourceCriticality>(governance.criticality);
  const [prioUpdateMsg, setPrioUpdateMsg] = useState<string | null>(null);

  // Checklist de préactivation
  const [checklist, setChecklist] = useState<PreActivationCheckItem[]>(() =>
    governanceService.getChecklistForSource(source.id)
  );

  // Message d'alerte hors ligne
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  // Calcul du statut de conformité pour préactivation
  const criticalMissing = checklist.some((item) => item.isCritical && !item.isChecked);
  const isAuthorizedToConnect = !criticalMissing && (governance.approvalStatus === 'APPROVED' || governance.approvalStatus === 'RESERVATIONS');

  const handleToggleChecklist = (itemId: string, currentVal: boolean) => {
    const updated = governanceService.updateChecklistItem(source.id, itemId, !currentVal, validatorName);
    setChecklist(updated);
    onUpdated();
  };

  const handleSavePriorityCriticality = () => {
    governanceService.updatePriorityAndCriticality(
      source.id,
      selectedPriority,
      selectedCriticality,
      validatorName,
      'Ajustement manuel de gouvernance'
    );
    setPrioUpdateMsg('Priorité et Criticité mises à jour avec succès.');
    setTimeout(() => setPrioUpdateMsg(null), 3500);
    onUpdated();
  };

  const handleSubmitValidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      alert('Veuillez fournir une justification motivée pour votre décision.');
      return;
    }

    governanceService.submitHumanValidation(source.id, {
      validator: validatorName,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      decision,
      justification,
      reservations: reservations.trim() || undefined,
      nextReviewDate
    });

    setValidationSuccessMsg(`Décision « ${decision} » enregistrée dans le registre d'audit.`);
    setTimeout(() => setValidationSuccessMsg(null), 4000);
    onUpdated();
  };

  const triggerOfflineBlock = (actionName: string) => {
    const res = governanceService.blockOfflineAction(source.id, actionName, validatorName);
    setOfflineNotice(res.message);
    setTimeout(() => setOfflineNotice(null), 4500);
    onUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        id="modal-governance-detail"
        className="bg-[#0b101b] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn"
      >
        {/* Header de la Fiche */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-start justify-between bg-gradient-to-r from-slate-900 via-slate-900/90 to-[#0c1424]">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-0.5">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  FICHE DE GOUVERNANCE & QUALIFICATION OSINT
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  source.isReal 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {source.isReal ? 'SOURCE RÉELLE' : 'SOURCE DÉMO'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {source.countryName}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>{source.name}</span>
                <span className="text-xs font-normal text-slate-400 font-mono">({source.id})</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bannière Alerte Hors Ligne si déclenchée */}
        {offlineNotice && (
          <div className="px-5 py-2.5 bg-rose-500/20 border-b border-rose-500/40 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-mono font-bold">
              <WifiOff className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>{offlineNotice}</span>
              <span className="text-slate-400 font-normal">| Aucune requête externe n’a été émise.</span>
            </div>
            <button onClick={() => setOfflineNotice(null)} className="text-rose-300 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Avertissement Doctrinal Permanent */}
        <div className="px-5 py-2 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-amber-300">RAPPEL DOCTRINAL :</span>
            <span>CRITICITÉ ≠ FIABILITÉ • APPROUVÉE ≠ FIABLE • PRÊTE À CONNECTER ≠ CONNECTÉE</span>
          </div>
          <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            ISOLATION LOCALE : 100% HORS LIGNE
          </span>
        </div>

        {/* Onglets de navigation interne */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 px-5 overflow-x-auto">
          {[
            { id: 'identification', label: '1. Identification & Statut', icon: Info },
            { id: 'conformite', label: '2. Conformité & Droit', icon: Scale },
            { id: 'connecteur', label: '3. Connecteur Découplé', icon: Layers },
            { id: 'validation', label: '4. Validation Humaine', icon: UserCheck },
            { id: 'checklist', label: '5. Checklist Préactivation (14)', icon: ShieldCheck },
            { id: 'historique', label: '6. Journal d’Audit', icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Corps de la modale */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-sm text-slate-200">
          
          {/* ================================================================ */}
          {/* VUE 1 : IDENTIFICATION & STATUTS */}
          {/* ================================================================ */}
          {activeTab === 'identification' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Carte Identification */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Identité Référentielle</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Nom officiel :</span>
                      <span className="font-semibold text-slate-200">{source.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Pays émetteur :</span>
                      <span className="font-mono text-slate-200">{source.countryName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Région géographique :</span>
                      <span className="text-slate-200">{source.region || 'Afrique de l’Ouest'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Typologie doctrinale :</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10px]">
                        {source.type}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Langue principale :</span>
                      <span className="text-slate-200">{source.language || 'Français'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">URL canonique déclarée :</span>
                      <span className="font-mono text-cyan-400 truncate max-w-[220px]" title={source.url}>
                        {source.url}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Carte Statuts Opérationnels */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Statuts & Échelons de Veille</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Nature de la source :</span>
                      <span className={`font-mono font-bold ${source.isReal ? 'text-blue-400' : 'text-amber-400'}`}>
                        {source.isReal ? 'Réelle (Non connectée)' : 'Démonstration pédagogique'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Statut Workflow Gouvernance :</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${GOVERNANCE_STATUS_LABELS[governance.governanceStatus].bg}`}>
                        {GOVERNANCE_STATUS_LABELS[governance.governanceStatus].label}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Statut d’Approbation :</span>
                      <span className="font-mono font-bold text-slate-200">
                        {governance.approvalStatus}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Statut de Validation :</span>
                      <span className="font-mono text-slate-200">{governance.validationStatus}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Analyste Responsable :</span>
                      <span className="text-slate-200">{governance.responsibleAnalyst}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Réviseur Référent :</span>
                      <span className="text-slate-200">{governance.reviewer}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module de qualification Priorité & Criticité */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Attribution de la Priorité & Criticité Opérationnelle</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Rappel : La priorité (P1-P5) et la criticité n'attribuent ni ne garantissent la fiabilité des informations produites.
                    </p>
                  </div>
                  {prioUpdateMsg && (
                    <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                      {prioUpdateMsg}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Niveau de Priorité Opérationnelle :
                    </label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value as SourcePriority)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                    >
                      <option value="P1">P1 — CRITIQUE (Surveillance immédiate prioritaire)</option>
                      <option value="P2">P2 — HAUTE (Veille renforcée)</option>
                      <option value="P3">P3 — NORMALE (Flux standard régulier)</option>
                      <option value="P4">P4 — FAIBLE (Source d’appoint)</option>
                      <option value="P5">P5 — À ÉVALUER (Priorité non encore fixée)</option>
                    </select>
                    <div className="mt-1 text-[11px] text-slate-400">
                      {SOURCE_PRIORITY_LABELS[selectedPriority].desc}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Niveau de Criticité Opérationnelle :
                    </label>
                    <select
                      value={selectedCriticality}
                      onChange={(e) => setSelectedCriticality(e.target.value as SourceCriticality)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                    >
                      <option value="CRITICAL">CRITIQUE (Vital pour la couverture)</option>
                      <option value="HIGH">ÉLEVÉE (Couverture majeure)</option>
                      <option value="MEDIUM">MOYENNE (Couverture standard)</option>
                      <option value="LOW">FAIBLE (Recoupement secondaire)</option>
                      <option value="UNKNOWN">INCONNUE (Non qualifiée)</option>
                    </select>
                    <div className="mt-1 text-[11px] text-slate-400">
                      {SOURCE_CRITICALITY_LABELS[selectedCriticality].desc}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSavePriorityCriticality}
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                  >
                    Enregistrer la qualification
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* VUE 2 : CONFORMITÉ & DROIT */}
          {/* ================================================================ */}
          {activeTab === 'conformite' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>Cadre Déontologique & Conformité Juridique</span>
                </h3>
                <p className="text-xs text-slate-400">
                  L'OSINT éthique exige le strict respect de la propriété intellectuelle, des conditions d'utilisation des éditeurs et des directives robots.txt.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 block">Directives robots.txt déclarées :</span>
                    <span className="font-mono font-bold text-amber-300 text-xs">
                      {governance.robotsStatus || 'UNSPECIFIED'}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {governance.robotsStatus === 'ALLOWED' && '✓ Autorise l’indexation standard sans blocage racine.'}
                      {governance.robotsStatus === 'DISALLOWED' && '⚠ Directive Disallow / détectée : collecte automatisée formellement interdite.'}
                      {governance.robotsStatus === 'CRAWL_DELAY' && 'ℹ Respect impératif de temporisation (crawl-delay).'}
                      {governance.robotsStatus === 'UNSPECIFIED' && '? Non vérifié à ce stade.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 block">Licence de diffusion :</span>
                    <span className="font-mono font-bold text-cyan-300 text-xs">
                      {governance.licensingStatus || 'UNKNOWN'}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {governance.collectionPolicy?.legalRestrictions || 'Usage interne sous droit de courte citation.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 block">Conditions d'Utilisation (CGU) :</span>
                    <span className="font-mono font-bold text-slate-200 text-xs">
                      {governance.termsStatus}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {governance.termsStatus === 'CHECKED_OK' && 'Clauses d’agrégation documentaire vérifiées.'}
                      {governance.termsStatus === 'RESTRICTIVE' && 'Limitations éditoriales imposant un traitement manuel.'}
                      {governance.termsStatus === 'FORBIDDEN' && 'Moissonnage expressément proscrit par l’éditeur.'}
                      {governance.termsStatus === 'UNKNOWN' && 'Qualification en attente d’analyse juridique.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 block">Politique de conservation locale :</span>
                    <span className="font-mono font-bold text-emerald-400 text-xs">
                      {governance.retentionPolicy?.retentionDays ?? 180} jours
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Justification : {governance.retentionPolicy?.justification || 'Veille sectorielle'}
                    </p>
                  </div>
                </div>

                {governance.suspensionReason && (
                  <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    <span className="font-bold">Motif de suspension ou restriction :</span> {governance.suspensionReason}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* VUE 3 : CONNECTEUR DÉCOUPLÉ */}
          {/* ================================================================ */}
          {activeTab === 'connecteur' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Spécifications du Connecteur Associé (LOT 21)</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Connecteur ID : {connector?.id || `conn-${source.id}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Type de protocole :</span>
                    <span className="font-mono font-bold text-amber-300">{connector?.connectorType || 'MANUAL'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Méthode d’appel :</span>
                    <span className="font-mono font-bold text-slate-200">{connector?.method || 'GET'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Format de données :</span>
                    <span className="font-mono font-bold text-slate-200">{connector?.format || 'HTML'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Fréquence future :</span>
                    <span className="font-mono text-slate-200">{connector?.fetchInterval || 'MANUAL'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Limitation de débit (Rate Limit) :</span>
                    <span className="font-mono text-slate-200">{connector?.rateLimit || '1 req/min'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Authentification :</span>
                    <span className="font-mono text-slate-200">
                      {connector?.authenticationRequired ? 'Requise (Token/Clé)' : 'Aucune (Public)'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                  <span className="text-slate-400 block text-[11px]">Endpoint technique cible :</span>
                  <div className="font-mono text-cyan-300 bg-slate-900 px-2 py-1.5 rounded border border-slate-800 text-[11px] truncate">
                    {connector?.endpoint || source.url}
                  </div>
                </div>

                {/* Bouton de test hors ligne */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Statut actuel : {connector?.statusLabel || 'Source identifiée (non connectée)'}
                  </span>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => triggerOfflineBlock('Test du connecteur')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Radio className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tester le connecteur (Simulé)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerOfflineBlock('Activation réseau de la source')}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5 text-rose-400" />
                      <span>Activer la collecte (Bloqué)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* VUE 4 : VALIDATION HUMAINE FORMELLE */}
          {/* ================================================================ */}
          {activeTab === 'validation' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Décision de Validation Humaine Obligatoire</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Dernière revue : {governance.reviewDate || 'Aucune'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Règle absolue : Une source ne peut être approuvée ou autorisée de manière algorithmique. Un avis motivé est exigé.
                </p>

                {validationSuccessMsg && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{validationSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitValidation} className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nom et Titre du Validateur / Réviseur :
                      </label>
                      <input
                        type="text"
                        value={validatorName}
                        onChange={(e) => setValidatorName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                        placeholder="Ex: Dr. Diallo (Réviseur Senior)"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Décision Formelle :
                      </label>
                      <select
                        value={decision}
                        onChange={(e) => setDecision(e.target.value as HumanValidationDecision)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                      >
                        <option value="APPROVED">APPROUVÉE (Tous critères conformes)</option>
                        <option value="APPROVED_WITH_RESERVATIONS">APPROUVÉE AVEC RÉSERVES (Restrictions strictes)</option>
                        <option value="REJECTED">REFUSÉE (Non conformité ou suspension)</option>
                        <option value="TO_REEXAMINE">À RÉEXAMINER (Complément requis)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Justification Motivée :
                    </label>
                    <textarea
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                      placeholder="Ex: Source publique de référence, conformité Open Data vérifiée, recul nécessaire sur les flux sensibles."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Réserves & Conditions d'Exploitation :
                      </label>
                      <input
                        type="text"
                        value={reservations}
                        onChange={(e) => setReservations(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                        placeholder="Ex: Saisie manuelle uniquement, pas de stockage multimédia"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Prochaine Date de Revue :
                      </label>
                      <input
                        type="date"
                        value={nextReviewDate}
                        onChange={(e) => setNextReviewDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Signer et Enregistrer la Validation</span>
                    </button>
                  </div>
                </form>

                {/* Historique des validations signées */}
                {governance.validationHistory && governance.validationHistory.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Historique des Signatures et Arbitrages Antérieurs ({governance.validationHistory.length})
                    </h4>
                    <div className="space-y-2">
                      {governance.validationHistory.map((rec) => (
                        <div key={rec.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{rec.validator}</span>
                            <span className="font-mono text-[10px] text-slate-500">{rec.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                              {rec.decision}
                            </span>
                            <span className="text-slate-300">{rec.justification}</span>
                          </div>
                          {rec.reservations && (
                            <div className="text-[11px] text-orange-400">
                              <span className="font-semibold">Réserves :</span> {rec.reservations}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* VUE 5 : CHECKLIST DE PRÉACTIVATION (14 POINTS) */}
          {/* ================================================================ */}
          {activeTab === 'checklist' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Checklist de Contrôle Préalable à Toute Activation (14 Points)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tous les éléments critiques doivent être validés avant que la source ne puisse être marquée « AUTORISÉE ».
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold inline-block border ${
                      isAuthorizedToConnect
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {isAuthorizedToConnect ? '✓ ÉLIGIBLE À L’AUTORISATION' : '⛔ NON AUTORISÉE'}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-800/80 pt-2">
                  {checklist.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id, item.isChecked)}
                      className="py-2.5 px-2 rounded-lg hover:bg-slate-800/40 cursor-pointer flex items-start gap-3 transition-colors group"
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        item.isChecked
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-600 bg-slate-950 group-hover:border-slate-400'
                      }`}>
                        {item.isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono text-slate-500 font-semibold">
                            #{String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className={`text-xs font-medium ${item.isChecked ? 'text-slate-200' : 'text-slate-400'}`}>
                            {item.label}
                          </span>
                          {item.isCritical && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              CRITIQUE
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-mono">
                            [{item.category}]
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.notes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* VUE 6 : JOURNAL D'AUDIT */}
          {/* ================================================================ */}
          {activeTab === 'historique' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-cyan-400" />
                  <span>Journal d'Audit et Traçabilité des Décisions (Append-Only)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Consigne chronologique inaltérable des qualifications, arbitrages et blocages hors ligne.
                </p>

                <div className="space-y-2 pt-2">
                  {governanceService.getAllAudits()
                    .filter((a) => a.sourceId === source.id)
                    .map((a) => (
                      <div key={a.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-amber-400 font-bold">{a.action}</span>
                          <span className="font-mono text-[10px] text-slate-500">{a.timestamp}</span>
                        </div>
                        <div className="text-slate-300">
                          <span className="text-slate-500">Acteur :</span> {a.actor}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          <span className="text-slate-500">Motif :</span> {a.reason}
                        </div>
                        {a.previousValue && a.newValue && (
                          <div className="text-[10px] font-mono text-slate-400">
                            Transition : <span className="text-slate-300">{a.previousValue}</span> → <span className="text-cyan-300">{a.newValue}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  {governanceService.getAllAudits().filter((a) => a.sourceId === source.id).length === 0 && (
                    <div className="p-4 text-center text-slate-500 text-xs italic">
                      Aucun événement d’audit spécifique consigné pour cette source.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer avec actions rapides */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>ID Source : {source.id}</span>
            <span>•</span>
            <span>Mode : Hors Ligne</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
