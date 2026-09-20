import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Radio,
  FileText,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Download,
  Search,
  Filter,
  Users,
  Activity,
  ArrowRight,
  RefreshCw,
  Plus,
  Compass,
  Link as LinkIcon,
  ShieldAlert,
  Send,
  Eye,
  Sliders,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  OsintCrisisCell,
  OsintCrisisLogEntry,
  OsintCrisisDirective,
  OsintCrisisSitrep,
  OsintCrisisPosture,
  OsintCrisisStatus,
  OsintCrisisSeverity,
  OsintCrisisIncidentType,
  OsintCrisisUrgency,
  OsintDirectiveStatus,
  OsintDirectivePriority,
  ScreenId
} from '../../types';
import { crisisOperationService } from '../../services/crisisOperationService';
import { accessControlService } from '../../services/accessControlService';

interface CrisisOperationsCenterScreenProps {
  onNavigate?: (screen: ScreenId) => void;
}

export const CrisisOperationsCenterScreen: React.FC<CrisisOperationsCenterScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'cells' | 'logs' | 'directives' | 'sitreps' | 'traceability' | 'audit'>('cells');
  const [selectedCellId, setSelectedCellId] = useState<string>('crisis-cell-01');
  const [postureFilter, setPostureFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Data reloads
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Modals / forms
  const [showCreateCellModal, setShowCreateCellModal] = useState<boolean>(false);
  const [showCreateLogModal, setShowCreateLogModal] = useState<boolean>(false);
  const [showCreateDirectiveModal, setShowCreateDirectiveModal] = useState<boolean>(false);
  const [showCreateSitrepModal, setShowCreateSitrepModal] = useState<boolean>(false);
  const [showCloseCellModal, setShowCloseCellModal] = useState<boolean>(false);
  const [showEscalateModal, setShowEscalateModal] = useState<boolean>(false);

  // Form states
  const [newCellTitle, setNewCellTitle] = useState<string>('');
  const [newCellTheater, setNewCellTheater] = useState<string>('');
  const [newCellCountries, setNewCellCountries] = useState<string>('ML, BF, NE');
  const [newCellDesc, setNewCellDesc] = useState<string>('');
  const [newCellPosture, setNewCellPosture] = useState<OsintCrisisPosture>('CRISE_ACTIVE');
  const [newCellSeverity, setNewCellSeverity] = useState<OsintCrisisSeverity>('MAJEURE');

  // Form close cell
  const [closureJustification, setClosureJustification] = useState<string>('');
  const [closureSummary, setClosureSummary] = useState<string>('');

  // Form escalate posture
  const [targetPosture, setTargetPosture] = useState<OsintCrisisPosture>('CRISE_ACTIVE');
  const [postureReason, setPostureReason] = useState<string>('');

  // Form log
  const [logTitle, setLogTitle] = useState<string>('');
  const [logContent, setLogContent] = useState<string>('');
  const [logLocation, setLogLocation] = useState<string>('');
  const [logType, setLogType] = useState<OsintCrisisIncidentType>('OBSERVATION_TERRAIN');
  const [logUrgency, setLogUrgency] = useState<OsintCrisisUrgency>('URGENT');

  // Form directive
  const [dirTitle, setDirTitle] = useState<string>('');
  const [dirDesc, setDirDesc] = useState<string>('');
  const [dirTarget, setDirTarget] = useState<string>('');
  const [dirPriority, setDirPriority] = useState<OsintDirectivePriority>('URGENTE');

  // Form sitrep
  const [sitrepTitle, setSitrepTitle] = useState<string>('');
  const [sitrepClass, setSitrepClass] = useState<'DIFFUSION_RESTREINTE' | 'CONFIDENTIEL' | 'SECRET'>('CONFIDENTIEL');
  const [sitrepSummary, setSitrepSummary] = useState<string>('');
  const [sitrepPoints, setSitrepPoints] = useState<string>('');

  // Notification / message feedback
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Active user simulation from accessControlService
  const currentUser = accessControlService.getCurrentUser() || {
    id: 'user-resp-01',
    displayName: 'Capt. Moussa Traoré (Commandement)',
    username: 'capt.traore'
  };

  // Memoized lists
  const cells = useMemo(() => {
    return crisisOperationService.listCrisisCells();
  }, [refreshTrigger]);

  const selectedCell = useMemo(() => {
    return cells.find(c => c.id === selectedCellId) || cells[0] || null;
  }, [cells, selectedCellId]);

  const logs = useMemo(() => {
    if (!selectedCell) return [];
    return crisisOperationService.listLogs(selectedCell.id);
  }, [selectedCell, refreshTrigger]);

  const directives = useMemo(() => {
    if (!selectedCell) return [];
    return crisisOperationService.listDirectives(selectedCell.id);
  }, [selectedCell, refreshTrigger]);

  const sitreps = useMemo(() => {
    if (!selectedCell) return [];
    return crisisOperationService.listSitreps(selectedCell.id);
  }, [selectedCell, refreshTrigger]);

  const traceLinks = useMemo(() => {
    if (!selectedCell) return [];
    return crisisOperationService.verifyCrisisTraceability(selectedCell.id);
  }, [selectedCell, refreshTrigger]);

  const audits = useMemo(() => {
    return crisisOperationService.getSecurityAudit();
  }, [refreshTrigger]);

  const filteredCells = useMemo(() => {
    return cells.filter(c => {
      if (postureFilter !== 'ALL' && c.posture !== postureFilter) return false;
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.theater.toLowerCase().includes(q);
      }
      return true;
    });
  }, [cells, postureFilter, statusFilter, searchTerm]);

  // Handlers
  const handleCreateCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCellTitle.trim() || !newCellTheater.trim()) {
      setStatusMessage('Erreur : Titre et théâtre obligatoires');
      return;
    }
    const countryList = newCellCountries.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    const created = crisisOperationService.createCrisisCell({
      title: newCellTitle.trim(),
      theater: newCellTheater.trim(),
      countryIds: countryList,
      description: newCellDesc.trim() || 'Cellule opérationnelle activée',
      posture: newCellPosture,
      severity: newCellSeverity,
      commanderId: currentUser.id,
      leadAnalystId: 'user-ana-01',
      synthesisIds: ['synth-2026-001'],
      indicatorIds: ['ind-mon-001'],
      scenarioIds: [],
      hypothesisIds: [],
      eventIds: [],
      caseIds: [],
      requirementIds: [],
      isDemo: true
    }, currentUser.id);

    setSelectedCellId(created.id);
    setShowCreateCellModal(false);
    setNewCellTitle('');
    setNewCellTheater('');
    setNewCellDesc('');
    setRefreshTrigger(prev => prev + 1);
    setStatusMessage(`Cellule ${created.code} créée avec succès`);
  };

  const handleEscalate = () => {
    if (!selectedCell) return;
    if (!postureReason.trim()) {
      setStatusMessage('Erreur : Motif obligatoire pour changement de posture');
      return;
    }
    crisisOperationService.escalatePosture(selectedCell.id, targetPosture, postureReason.trim(), currentUser.id);
    setShowEscalateModal(false);
    setPostureReason('');
    setRefreshTrigger(prev => prev + 1);
    setStatusMessage(`Posture de la cellule basculée en ${targetPosture}`);
  };

  const handleCloseCell = () => {
    if (!selectedCell) return;
    if (closureJustification.trim().length < 10) {
      setStatusMessage('Erreur : Justification d’au moins 10 caractères requise');
      return;
    }
    const closed = crisisOperationService.closeCrisisCell(
      selectedCell.id,
      closureJustification.trim(),
      closureSummary.trim() || 'Clôture opérationnelle conforme',
      currentUser.id
    );
    if (closed) {
      setShowCloseCellModal(false);
      setClosureJustification('');
      setClosureSummary('');
      setRefreshTrigger(prev => prev + 1);
      setStatusMessage(`Cellule ${selectedCell.code} clôturée et archivée au statut immuable`);
    } else {
      setStatusMessage('Erreur lors de la clôture');
    }
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell || !logTitle.trim() || !logContent.trim()) {
      setStatusMessage('Erreur : Titre et contenu du log obligatoires');
      return;
    }
    crisisOperationService.addLogEntry({
      crisisId: selectedCell.id,
      incidentType: logType,
      urgency: logUrgency,
      title: logTitle.trim(),
      content: logContent.trim(),
      location: logLocation.trim(),
      authorId: currentUser.id,
      authorName: currentUser.displayName,
      isDemo: true
    }, currentUser.id);

    setShowCreateLogModal(false);
    setLogTitle('');
    setLogContent('');
    setLogLocation('');
    setRefreshTrigger(prev => prev + 1);
    setStatusMessage('Entrée ajoutée à la main courante opérationnelle');
  };

  const handleCreateDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell || !dirTitle.trim() || !dirTarget.trim()) {
      setStatusMessage('Erreur : Titre et entité cible obligatoires');
      return;
    }
    crisisOperationService.createDirective({
      crisisId: selectedCell.id,
      title: dirTitle.trim(),
      description: dirDesc.trim(),
      targetEntity: dirTarget.trim(),
      priority: dirPriority,
      proposedBy: currentUser.id,
      isDemo: true
    }, currentUser.id);

    setShowCreateDirectiveModal(false);
    setDirTitle('');
    setDirDesc('');
    setDirTarget('');
    setRefreshTrigger(prev => prev + 1);
    setStatusMessage('Directive tactique proposée avec succès');
  };

  const handleDecideDirective = (directiveId: string, isApproved: boolean) => {
    const justification = window.prompt(`Justification de la décision humaine (${isApproved ? 'Approbation' : 'Rejet'}) :`);
    if (!justification || justification.trim().length < 5) {
      alert('Justification obligatoire d’au moins 5 caractères.');
      return;
    }
    crisisOperationService.decideDirective(directiveId, currentUser.id, justification.trim(), isApproved, currentUser.id);
    setRefreshTrigger(prev => prev + 1);
    setStatusMessage(`Directive ${isApproved ? 'approuvée' : 'rejetée'} par décision humaine formelle`);
  };

  const handleExecuteDirective = (directiveId: string) => {
    const report = window.prompt('Rapport de compte-rendu d’exécution opérationnelle :');
    if (!report || report.trim().length < 5) {
      alert('Compte-rendu obligatoire.');
      return;
    }
    const executed = crisisOperationService.executeDirective(directiveId, currentUser.displayName, report.trim(), currentUser.id);
    if (!executed) {
      alert('Erreur : Seule une directive préalablement approuvée (DECIDEE) peut être exécutée.');
      return;
    }
    setRefreshTrigger(prev => prev + 1);
    setStatusMessage('Directive marquée comme exécutée avec compte-rendu');
  };

  const handleCreateSitrep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell || !sitrepTitle.trim() || !sitrepSummary.trim()) {
      setStatusMessage('Erreur : Titre et résumé de situation obligatoires');
      return;
    }
    const pts = sitrepPoints.split('\n').map(s => s.trim()).filter(Boolean);
    crisisOperationService.createSitrep({
      crisisId: selectedCell.id,
      title: sitrepTitle.trim(),
      classificationLevel: sitrepClass,
      summary: sitrepSummary.trim(),
      situationPoints: pts.length > 0 ? pts : ['Situation stationnaire sous contrôle de la cellule.'],
      threatDevelopments: ['Veille continue des capteurs maintenue.'],
      decisionsAndDirectives: ['Application stricte des directives en cours.'],
      recommendations: ['Maintenir la posture actuelle jusqu’au prochain point H+8.'],
      authorId: currentUser.id,
      recipients: ['Centre de Fusion Régional', 'Coordination Inter-Services'],
      isDemo: true
    }, currentUser.id);

    setShowCreateSitrepModal(false);
    setSitrepTitle('');
    setSitrepSummary('');
    setSitrepPoints('');
    setRefreshTrigger(prev => prev + 1);
    setStatusMessage('Point de situation tactique généré');
  };

  const handleValidateSitrep = (sitrepId: string) => {
    crisisOperationService.validateSitrep(sitrepId, currentUser.displayName, currentUser.id);
    setRefreshTrigger(prev => prev + 1);
    setStatusMessage('Sitrep validé formellement par le commandement');
  };

  const handleExportJson = () => {
    const jsonStr = crisisOperationService.exportCrisisDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OSINT_AFRICA_LOT43_COGC_EXPORT_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Export JSON souverain généré et téléchargé');
  };

  // Visual helper for posture badge
  const renderPostureBadge = (posture: OsintCrisisPosture) => {
    switch (posture) {
      case 'CRISE_ACTIVE':
        return <span className="px-2.5 py-1 text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 rounded-full flex items-center gap-1.5 animate-pulse"><Radio className="w-3.5 h-3.5 text-rose-400" /> CRISE ACTIVE</span>;
      case 'PRE_ALERTE':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded-full flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> PRÉ-ALERTE</span>;
      case 'VEILLE_RENFORCEE':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/50 rounded-full flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-blue-400" /> VEILLE RENFORCÉE</span>;
      case 'RETOUR_A_LA_NORMALE':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 rounded-full flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> RETOUR À LA NORMALE</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600/20 border border-rose-500/30 rounded-lg text-rose-400">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                Centre Opérationnel de Gestion de Crise & Conduite des Opérations (COGC)
                <span className="text-xs font-mono font-normal bg-rose-950 text-rose-300 border border-rose-700/50 px-2 py-0.5 rounded">
                  LOT 43
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Activation de cellules opérationnelles, Main courante tactique, Directives d'action et Traçabilité multi-lots souveraine.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-export-crisis-json"
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            Export JSON
          </button>
          <button
            id="btn-create-crisis-cell"
            onClick={() => setShowCreateCellModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-rose-900/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouvelle Cellule
          </button>
        </div>
      </div>

      {/* FEEDBACK STATUS MESSAGE */}
      {statusMessage && (
        <div className="bg-slate-800/90 border border-indigo-500/40 text-indigo-200 px-4 py-2.5 rounded-lg text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BANDEAU DOCTRINE DU RENSEIGNEMENT */}
      <div className="bg-slate-900/60 border border-slate-800/80 px-4 py-2.5 rounded-lg text-xs text-slate-400 flex items-center gap-3 overflow-x-auto">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="font-semibold text-slate-300">Rappels Doctrinaux COGC :</span>
        <span className="border-l border-slate-700 pl-3">Corrélation ≠ Causalité</span>
        <span className="border-l border-slate-700 pl-3">Anomalie ≠ Menace</span>
        <span className="border-l border-slate-700 pl-3">Score d’Impact ≠ Probabilité</span>
        <span className="border-l border-slate-700 pl-3">Priorité ≠ Danger</span>
        <span className="border-l border-slate-700 pl-3 text-amber-300/90 font-medium">Décision humaine obligatoire (isHumanDecision: true)</span>
      </div>

      {/* BARRE D'ONGLETS */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-0">
        <button
          onClick={() => setActiveTab('cells')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'cells'
              ? 'border-rose-500 text-rose-400 bg-rose-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          Cellules de Crise ({cells.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'logs'
              ? 'border-rose-500 text-rose-400 bg-rose-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Main Courante ({logs.length})
        </button>

        <button
          onClick={() => setActiveTab('directives')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'directives'
              ? 'border-rose-500 text-rose-400 bg-rose-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Directives d'Action ({directives.length})
        </button>

        <button
          onClick={() => setActiveTab('sitreps')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'sitreps'
              ? 'border-rose-500 text-rose-400 bg-rose-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Points de Situation Flash ({sitreps.length})
        </button>

        <button
          onClick={() => setActiveTab('traceability')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'traceability'
              ? 'border-rose-500 text-rose-400 bg-rose-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Traçabilité Multi-Lots ({traceLinks.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-rose-500 text-rose-400 bg-rose-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          Audit Append-Only ({audits.length})
        </button>
      </div>

      {/* SÉLECTEUR RAPIDE DE CELLULE ACTIVE */}
      {selectedCell && (
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-mono">Cellule Opérationnelle Sélectionnée :</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-bold text-white text-sm">{selectedCell.code} — {selectedCell.title}</span>
                {renderPostureBadge(selectedCell.posture)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-xs px-2.5 py-1 bg-slate-800 rounded border border-slate-700 text-slate-300">
              Score d’Impact : <span className="font-bold text-rose-400">{selectedCell.operationalImpactScore}/100</span>
            </div>
            <div className="text-xs px-2.5 py-1 bg-slate-800 rounded border border-slate-700 text-slate-300">
              Statut : <span className="font-bold text-white">{selectedCell.status}</span>
            </div>

            {selectedCell.status !== 'CLOTUREE' && selectedCell.status !== 'ARCHIVEE' && (
              <>
                <button
                  id="btn-escalate-posture"
                  onClick={() => setShowEscalateModal(true)}
                  className="px-2.5 py-1 bg-amber-600/80 hover:bg-amber-500 text-white rounded text-xs font-medium transition-colors"
                >
                  Changer Posture
                </button>
                <button
                  id="btn-close-crisis-cell"
                  onClick={() => setShowCloseCellModal(true)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded text-xs font-medium transition-colors"
                >
                  Clôturer Cellule
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 1 : CELLULES DE CRISE */}
      {activeTab === 'cells' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/40 p-3 rounded-lg border border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par code, titre, théâtre..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={postureFilter}
                onChange={e => setPostureFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">Toutes Postures</option>
                <option value="CRISE_ACTIVE">Crise Active</option>
                <option value="PRE_ALERTE">Pré-Alerte</option>
                <option value="VEILLE_RENFORCEE">Veille Renforcée</option>
                <option value="RETOUR_A_LA_NORMALE">Retour à la Normale</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">Tous Statuts</option>
                <option value="EN_COURS">En Cours</option>
                <option value="SOUS_CONTROLE">Sous Contrôle</option>
                <option value="CLOTUREE">Clôturée</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCells.map(cell => (
              <div
                key={cell.id}
                onClick={() => setSelectedCellId(cell.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  selectedCellId === cell.id
                    ? 'bg-slate-900 border-rose-500/80 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-rose-400">{cell.code}</span>
                  {renderPostureBadge(cell.posture)}
                </div>

                <h3 className="text-sm font-semibold text-white line-clamp-1 mb-1">{cell.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">{cell.description}</p>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Théâtre :</span>
                    <span className="text-right text-slate-300 truncate max-w-[160px]">{cell.theater}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pays couverts :</span>
                    <span className="font-mono text-slate-200">{cell.countryIds.join(', ') || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Score d’Impact :</span>
                    <span className="font-bold text-rose-400">{cell.operationalImpactScore}/100</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Mis à jour : {cell.updatedAt.substring(11, 16)}</span>
                  <span className="font-medium text-slate-300 flex items-center gap-1">
                    {selectedCellId === cell.id ? 'Sélectionné' : 'Voir détails'} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 2 : MAIN COURANTE OPÉRATIONNELLE */}
      {activeTab === 'logs' && selectedCell && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-lg border border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white">Main Courante Opérationnelle Tactique</h2>
              <p className="text-xs text-slate-400">Registre chronologique inaltérable des faits et messages opérationnels.</p>
            </div>
            {selectedCell.status !== 'CLOTUREE' && (
              <button
                id="btn-add-log-entry"
                onClick={() => setShowCreateLogModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Consigner un Fait
              </button>
            )}
          </div>

          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
                Aucune entrée de main courante consignée pour cette cellule.
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.urgency === 'FLASH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500' :
                        log.urgency === 'IMMEDIAT' ? 'bg-orange-500/20 text-orange-300 border border-orange-500' :
                        log.urgency === 'URGENT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500'
                      }`}>
                        {log.urgency}
                      </span>
                      <span className="text-xs font-semibold text-slate-300 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                        {log.incidentType}
                      </span>
                      <h4 className="text-sm font-bold text-white">{log.title}</h4>
                    </div>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {log.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pl-1">{log.content}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <span>Rédacteur : <strong className="text-slate-200">{log.authorName || log.authorId}</strong></span>
                      {log.location && <span>Localisation : <strong className="text-slate-200">{log.location}</strong></span>}
                    </div>
                    {log.isPostPublication && (
                      <span className="text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40 text-[10px]">
                        Post-Publication (antériorité découverte tardive)
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 3 : DIRECTIVES D'ACTION */}
      {activeTab === 'directives' && selectedCell && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-lg border border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white">Directives Opérationnelles & Ordres d'Action</h2>
              <p className="text-xs text-slate-400">Toute directive requiert une décision humaine formelle (isHumanDecision: true).</p>
            </div>
            {selectedCell.status !== 'CLOTUREE' && (
              <button
                id="btn-propose-directive"
                onClick={() => setShowCreateDirectiveModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Proposer Directive
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {directives.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
                Aucune directive tactique enregistrée pour cette cellule.
              </div>
            ) : (
              directives.map(dir => (
                <div key={dir.id} className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        dir.status === 'EXECUTEE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        dir.status === 'DECIDEE' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                        dir.status === 'ABANDONNEE' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {dir.status}
                      </span>
                      <span className="text-xs font-semibold text-rose-400 font-mono">
                        Priorité : {dir.priority}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1">{dir.title}</h4>
                    <p className="text-xs text-slate-300 mb-2">{dir.description}</p>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div>Entité Cible : <strong className="text-slate-200">{dir.targetEntity}</strong></div>
                      {dir.deadline && <div>Échéance : <span className="font-mono text-slate-300">{dir.deadline}</span></div>}
                    </div>

                    {dir.isHumanDecision && (
                      <div className="mt-2.5 p-2 bg-slate-950/70 rounded border border-slate-800 text-xs text-slate-300">
                        <div className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Décision Humaine Validée par {dir.decidedBy}
                        </div>
                        {dir.decisionJustification && (
                          <div className="text-slate-400 text-[11px] mt-0.5 italic">"{dir.decisionJustification}"</div>
                        )}
                      </div>
                    )}

                    {dir.executionReport && (
                      <div className="mt-2 p-2 bg-emerald-950/20 border border-emerald-800/30 rounded text-xs text-emerald-300">
                        <strong>Rapport d'exécution ({dir.executedBy}) :</strong> {dir.executionReport}
                      </div>
                    )}
                  </div>

                  {/* BOUTONS D'ACTION SELON STATUT */}
                  {selectedCell.status !== 'CLOTUREE' && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                      {dir.status === 'PROPOSEE' && (
                        <>
                          <button
                            onClick={() => handleDecideDirective(dir.id, false)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium"
                          >
                            Rejeter
                          </button>
                          <button
                            onClick={() => handleDecideDirective(dir.id, true)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Approuver (Décision Humaine)
                          </button>
                        </>
                      )}

                      {dir.status === 'DECIDEE' && (
                        <button
                          onClick={() => handleExecuteDirective(dir.id)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Rendre Compte de l'Exécution
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 4 : SITREPS FLASH */}
      {activeTab === 'sitreps' && selectedCell && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-lg border border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white">Points de Situation Tactiques (Sitreps Flash)</h2>
              <p className="text-xs text-slate-400">Diffusion tactique souveraine et synthèse des événements de conduite.</p>
            </div>
            {selectedCell.status !== 'CLOTUREE' && (
              <button
                id="btn-create-sitrep"
                onClick={() => setShowCreateSitrepModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Rédiger un Sitrep
              </button>
            )}
          </div>

          <div className="space-y-4">
            {sitreps.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
                Aucun Sitrep flash publié pour cette cellule.
              </div>
            ) : (
              sitreps.map(sitrep => (
                <div key={sitrep.id} className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded text-xs">
                        SITREP #{sitrep.number}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 bg-slate-800 border border-slate-700 text-amber-300 rounded font-semibold">
                        {sitrep.classificationLevel}
                      </span>
                      <h3 className="text-base font-bold text-white">{sitrep.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {sitrep.isHumanDecision ? (
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Validé par {sitrep.validatedBy}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleValidateSitrep(sitrep.id)}
                          className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1 rounded font-semibold transition-colors"
                        >
                          Valider Sitrep
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{sitrep.summary}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                      <h5 className="text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-blue-400" /> Faits & Points de Situation :
                      </h5>
                      <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                        {sitrep.situationPoints.map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                      <h5 className="text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-amber-400" /> Directives & Recommandations :
                      </h5>
                      <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                        {sitrep.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>Destinataires : {sitrep.recipients.join(', ')}</span>
                    <span className="font-mono">Horodatage : {sitrep.publishedAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 5 : TRAÇABILITÉ MULTI-LOTS ET DÉTECTION RUPTURE_LIEN */}
      {activeTab === 'traceability' && selectedCell && (
        <div className="space-y-4">
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-indigo-400" />
                Chaîne de Traçabilité Multi-Lots & Détection de Rupture de Lien
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Vérification continue des dépendances amont (LOT 40, LOT 39, LOT 38, LOT 37, LOT 34, Événements et Dossiers).
              </p>
            </div>
            <button
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
              Re-vérifier Liens
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {traceLinks.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
                Aucun lien de traçabilité rattaché à cette cellule.
              </div>
            ) : (
              traceLinks.map(link => (
                <div
                  key={link.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    link.status === 'VALIDE'
                      ? 'bg-slate-900/70 border-slate-800'
                      : 'bg-rose-950/20 border-rose-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300">{link.targetLot}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      link.status === 'VALIDE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse'
                    }`}>
                      {link.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 my-2">
                    <div className="font-mono text-slate-400">Entité : <strong className="text-white">{link.targetEntityId}</strong> ({link.targetEntityType})</div>
                    <div className={`text-xs ${link.status === 'VALIDE' ? 'text-slate-400' : 'text-rose-300 font-medium'}`}>
                      {link.diagnostic}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 font-mono">
                    Vérifié à : {link.verifiedAt}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 6 : AUDIT SÉCURITÉ APPEND-ONLY */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Journal d'Audit Append-Only au Niveau du Service (LOT 43)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Traçabilité rigoureuse de toutes les créations, décisions humaines, escalades de posture et clôtures.
              </p>
            </div>
            <div className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg">
              Total événements : <strong className="text-white">{audits.length}</strong>
            </div>
          </div>

          <div className="overflow-x-auto bg-slate-900/70 border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-slate-800 font-mono">
                <tr>
                  <th className="px-4 py-2.5">Horodatage</th>
                  <th className="px-4 py-2.5">Action</th>
                  <th className="px-4 py-2.5">Entité</th>
                  <th className="px-4 py-2.5">Acteur</th>
                  <th className="px-4 py-2.5">Résultat</th>
                  <th className="px-4 py-2.5">Motif / Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {audits.map(a => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-2 text-slate-400 whitespace-nowrap">{a.timestamp}</td>
                    <td className="px-4 py-2 font-bold text-rose-400 whitespace-nowrap">{a.action}</td>
                    <td className="px-4 py-2 text-slate-300 whitespace-nowrap">{a.entityType}:{a.entityId}</td>
                    <td className="px-4 py-2 text-slate-400 whitespace-nowrap">{a.actorUserId}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {a.success ? (
                        <span className="text-emerald-400 font-bold">SUCCÈS</span>
                      ) : (
                        <span className="text-rose-400 font-bold">REFUS</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-300 font-sans">{a.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CRÉATION DE CELLULE */}
      {showCreateCellModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-rose-400" />
                Activation d'une Nouvelle Cellule Opérationnelle
              </h3>
              <button onClick={() => setShowCreateCellModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCell} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Titre de la Cellule :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cellule Conjointe de Suivi — Corridor Liptako"
                  value={newCellTitle}
                  onChange={e => setNewCellTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Théâtre d'Opérations :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sahel Central (Mali - Burkina Faso - Niger)"
                  value={newCellTheater}
                  onChange={e => setNewCellTheater(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pays (Codes ISO) :</label>
                  <input
                    type="text"
                    value={newCellCountries}
                    onChange={e => setNewCellCountries(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Gravité Initiale :</label>
                  <select
                    value={newCellSeverity}
                    onChange={e => setNewCellSeverity(e.target.value as OsintCrisisSeverity)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none"
                  >
                    <option value="MINEURE">Mineure</option>
                    <option value="SIGNIFICATIVE">Significative</option>
                    <option value="MAJEURE">Majeure</option>
                    <option value="CRITIQUE">Critique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Posture Opérationnelle :</label>
                <select
                  value={newCellPosture}
                  onChange={e => setNewCellPosture(e.target.value as OsintCrisisPosture)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none"
                >
                  <option value="CRISE_ACTIVE">Crise Active</option>
                  <option value="PRE_ALERTE">Pré-Alerte</option>
                  <option value="VEILLE_RENFORCEE">Veille Renforcée</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cadrage / Description Opérationnelle :</label>
                <textarea
                  rows={3}
                  value={newCellDesc}
                  onChange={e => setNewCellDesc(e.target.value)}
                  placeholder="Contexte de l'escalade, objectifs de la cellule..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCellModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-md"
                >
                  Activer la Cellule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHANGEMENT DE POSTURE */}
      {showEscalateModal && selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              Évolution de Posture Opérationnelle
            </h3>
            <p className="text-xs text-slate-400">
              Cellule : <strong className="text-white">{selectedCell.code}</strong> (Posture actuelle : {selectedCell.posture})
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nouvelle Posture :</label>
                <select
                  value={targetPosture}
                  onChange={e => setTargetPosture(e.target.value as OsintCrisisPosture)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  <option value="CRISE_ACTIVE">Crise Active</option>
                  <option value="PRE_ALERTE">Pré-Alerte</option>
                  <option value="VEILLE_RENFORCEE">Veille Renforcée</option>
                  <option value="RETOUR_A_LA_NORMALE">Retour à la Normale</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Motif Opérationnel :</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Justification des signaux observés motivant la bascule..."
                  value={postureReason}
                  onChange={e => setPostureReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleEscalate}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-md"
                >
                  Confirmer la Bascule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CLÔTURE DE CELLULE */}
      {showCloseCellModal && selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Clôture et Archivage Formel de la Cellule
            </h3>
            <p className="text-xs text-rose-300 bg-rose-950/30 p-2.5 rounded border border-rose-800/40">
              Attention : Après clôture, la cellule devient strictement <strong>immuable</strong>. Toute modification ultérieure sera rejetée par le service.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Justification Opérationnelle de Clôture (min. 10 car.) :
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Rétablissement avéré de la situation sans menace dérivée..."
                  value={closureJustification}
                  onChange={e => setClosureJustification(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Synthèse de Sortie de Crise :</label>
                <textarea
                  rows={2}
                  placeholder="Recommandations et leçons pour le RETEX LOT 33..."
                  value={closureSummary}
                  onChange={e => setClosureSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCloseCellModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCloseCell}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-md"
                >
                  Clôturer Définitivement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUT D'UN FAIT À LA MAIN COURANTE */}
      {showCreateLogModal && selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-400" />
              Consigner un Fait à la Main Courante
            </h3>

            <form onSubmit={handleAddLog} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Titre de l'Événement :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Signalement de convoi non identifié"
                  value={logTitle}
                  onChange={e => setLogTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Type d'Incident :</label>
                  <select
                    value={logType}
                    onChange={e => setLogType(e.target.value as OsintCrisisIncidentType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="OBSERVATION_TERRAIN">Observation Terrain</option>
                    <option value="INCIDENT_MAJEUR">Incident Majeur</option>
                    <option value="CONTACT_LIAISON">Contact Liaison</option>
                    <option value="ORDRE_OPERATIONNEL">Ordre Opérationnel</option>
                    <option value="POINT_DE_SITUATION">Point de Situation</option>
                    <option value="ALERTE_TACTIQUE">Alerte Tactique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Urgence Opérationnelle :</label>
                  <select
                    value={logUrgency}
                    onChange={e => setLogUrgency(e.target.value as OsintCrisisUrgency)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="ROUTINE">Routine</option>
                    <option value="URGENT">Urgent</option>
                    <option value="IMMEDIAT">Immédiat</option>
                    <option value="FLASH">Flash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Localisation / Secteur :</label>
                <input
                  type="text"
                  placeholder="Ex: Axe Dori - Gorom-Gorom"
                  value={logLocation}
                  onChange={e => setLogLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Détails Opérationnels :</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Description précise des faits constatés..."
                  value={logContent}
                  onChange={e => setLogContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateLogModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-md"
                >
                  Consigner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PROPOSITION DE DIRECTIVE */}
      {showCreateDirectiveModal && selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-rose-400" />
              Proposer une Directive d'Action
            </h3>

            <form onSubmit={handleCreateDirective} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Titre de la Directive :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Renforcement de la surveillance radio"
                  value={dirTitle}
                  onChange={e => setDirTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Entité Cible :</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pôle Veille & Détection"
                    value={dirTarget}
                    onChange={e => setDirTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priorité :</label>
                  <select
                    value={dirPriority}
                    onChange={e => setDirPriority(e.target.value as OsintDirectivePriority)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="NORMALE">Normale</option>
                    <option value="HAUTE">Haute</option>
                    <option value="URGENTE">Urgente</option>
                    <option value="VITALE">Vitale</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Instructions Opérationnelles :</label>
                <textarea
                  rows={3}
                  placeholder="Détail des actions attendues et conditions d'exécution..."
                  value={dirDesc}
                  onChange={e => setDirDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDirectiveModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-md"
                >
                  Proposer la Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RÉDACTION SITREP */}
      {showCreateSitrepModal && selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-400" />
              Rédiger un Point de Situation (Sitrep)
            </h3>

            <form onSubmit={handleCreateSitrep} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Titre du Sitrep :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SITREP FLASH #02 — Évolution Zone Frontalière"
                  value={sitrepTitle}
                  onChange={e => setSitrepTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Niveau de Classification :</label>
                <select
                  value={sitrepClass}
                  onChange={e => setSitrepClass(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  <option value="DIFFUSION_RESTREINTE">Diffusion Restreinte</option>
                  <option value="CONFIDENTIEL">Confidentiel</option>
                  <option value="SECRET">Secret</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Résumé Opérationnel :</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Synthèse exécutive de la situation actuelle..."
                  value={sitrepSummary}
                  onChange={e => setSitrepSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Points Faits Clés (1 par ligne) :</label>
                <textarea
                  rows={3}
                  placeholder="Fait 1&#10;Fait 2"
                  value={sitrepPoints}
                  onChange={e => setSitrepPoints(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateSitrepModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-md"
                >
                  Générer le Sitrep
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
