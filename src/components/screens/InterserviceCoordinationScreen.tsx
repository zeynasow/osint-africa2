import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Layers,
  Package,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  History,
  Shield,
  Download,
  Filter,
  Plus,
  ArrowRight,
  Clock,
  Send,
  XCircle,
  Truck,
  Radio,
  HeartPulse,
  MapPin,
  FileText,
  Lock,
  UserCheck
} from 'lucide-react';

import {
  OsintCoordinationOrganization,
  OsintOperationalTeam,
  OsintOperationalResource,
  OsintResourceRequest,
  OsintResourceAssignment,
  OsintOperationalTask,
  OsintCoordinationIncident,
  OsintCoordinationAudit,
  OsintResourceCategory,
  OsintRequestPriority,
  OsintTaskPriority,
  OsintIncidentSeverity
} from '../../types';

import {
  interserviceCoordinationService
} from '../../services/interserviceCoordinationService';

interface InterserviceCoordinationScreenProps {
  onNavigate?: (screenId: any) => void;
}

type TabType =
  | 'overview'
  | 'organizations'
  | 'resources'
  | 'requests'
  | 'tasks'
  | 'incidents'
  | 'audit';

export const InterserviceCoordinationScreen: React.FC<InterserviceCoordinationScreenProps> = ({
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [filterDemoOnly, setFilterDemoOnly] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Modals & Action States
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [showIncidentModal, setShowIncidentModal] = useState<boolean>(false);
  const [showCloseTaskModal, setShowCloseTaskModal] = useState<boolean>(false);
  const [showResolveIncModal, setShowResolveIncModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);

  // Selected entities for actions
  const [selectedRequest, setSelectedRequest] = useState<OsintResourceRequest | null>(null);
  const [selectedTask, setSelectedTask] = useState<OsintOperationalTask | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<OsintCoordinationIncident | null>(null);

  // Form Fields
  const [formCategory, setFormCategory] = useState<OsintResourceCategory>('LOGISTIQUE_TRANSPORT');
  const [formQuantity, setFormQuantity] = useState<number>(2);
  const [formPriority, setFormPriority] = useState<OsintRequestPriority>('HAUTE');
  const [formOperationId, setFormOperationId] = useState<string>('COGC-2026-001');
  const [formJustification, setFormJustification] = useState<string>('');
  const [formRejectionReason, setFormRejectionReason] = useState<string>('');
  const [formHumanConfirm, setFormHumanConfirm] = useState<boolean>(false);

  // Assign Form Fields
  const [assignResourceId, setAssignResourceId] = useState<string>('');
  const [assignTeamId, setAssignTeamId] = useState<string>('');
  const [assignQuantity, setAssignQuantity] = useState<number>(1);
  const [assignJustification, setAssignJustification] = useState<string>('');

  // Task Form Fields
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskDesc, setTaskDesc] = useState<string>('');
  const [taskOrg, setTaskOrg] = useState<string>('');
  const [taskTeam, setTaskTeam] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<OsintTaskPriority>('HAUTE');
  const [taskDueDate, setTaskDueDate] = useState<string>('2026-09-20 18:00:00');
  const [taskDependencies, setTaskDependencies] = useState<string[]>([]);
  const [taskCompletionReport, setTaskCompletionReport] = useState<string>('');

  // Incident Form Fields
  const [incTitle, setIncTitle] = useState<string>('');
  const [incDesc, setIncDesc] = useState<string>('');
  const [incSeverity, setIncSeverity] = useState<OsintIncidentSeverity>('MOYENNE');
  const [incResolution, setIncResolution] = useState<string>('');

  // Feedback Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  };

  const reloadData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Data fetching
  const stats = useMemo(() => {
    return interserviceCoordinationService.calculateCoordinationStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const organizations = useMemo(() => {
    return interserviceCoordinationService.getOrganizations({ isDemo: filterDemoOnly });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, filterDemoOnly]);

  const teams = useMemo(() => {
    return interserviceCoordinationService.getTeams({ isDemo: filterDemoOnly });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, filterDemoOnly]);

  const resources = useMemo(() => {
    return interserviceCoordinationService.getResources({ isDemo: filterDemoOnly });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, filterDemoOnly]);

  const requests = useMemo(() => {
    return interserviceCoordinationService.getRequests({ isDemo: filterDemoOnly });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, filterDemoOnly]);

  const assignments = useMemo(() => {
    return interserviceCoordinationService.getAssignments({ isDemo: filterDemoOnly });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, filterDemoOnly]);

  const tasks = useMemo(() => {
    return interserviceCoordinationService.getTasks({ isDemo: filterDemoOnly });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, filterDemoOnly]);

  const incidents = useMemo(() => {
    return interserviceCoordinationService.getIncidents({ isDemo: filterDemoOnly });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, filterDemoOnly]);

  const auditTrail = useMemo(() => {
    return interserviceCoordinationService.getAuditTrail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const ruptures = useMemo(() => {
    return interserviceCoordinationService.checkCoordinationRuptures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Export JSON
  const handleExportJson = () => {
    const jsonStr = interserviceCoordinationService.exportCoordinationDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OSINT_AFRICA_CCISO_LOT44_EXPORT_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify('success', 'Export des données CCISO généré avec succès en local.');
  };

  // 1. Soumettre Demande
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJustification || formJustification.trim().length < 5) {
      notify('error', 'La justification opérationnelle est obligatoire (min 5 car.).');
      return;
    }
    const req = interserviceCoordinationService.createRequest(
      {
        operationId: formOperationId,
        requestedBy: 'user-op-01',
        resourceCategory: formCategory,
        quantity: formQuantity,
        priority: formPriority,
        justification: formJustification,
        isDemo: filterDemoOnly
      },
      'user-op-01'
    );
    if (req) {
      notify('success', `Demande ${req.id} créée avec le statut PROPOSÉE.`);
      setShowRequestModal(false);
      setFormJustification('');
      reloadData();
    } else {
      notify('error', 'Échec de création de la demande.');
    }
  };

  // 2. Valider Demande
  const handleValidateRequest = (req: OsintResourceRequest) => {
    if (!formHumanConfirm) {
      notify('error', 'Confirmation humaine requise.');
      return;
    }
    if (!formJustification || formJustification.trim().length < 10) {
      notify('error', 'Une justification formelle substantielle (min 10 car.) est obligatoire pour valider.');
      return;
    }
    const res = interserviceCoordinationService.transitionRequest(req.id, 'VALIDEE', {
      actorId: 'user-resp-01',
      justification: formJustification,
      isHumanDecision: true
    });
    if (res.success) {
      notify('success', `Demande ${req.id} validée avec succès.`);
      setSelectedRequest(null);
      setFormJustification('');
      setFormHumanConfirm(false);
      reloadData();
    } else {
      notify('error', res.error || 'Erreur lors de la validation.');
    }
  };

  // 3. Rejeter Demande
  const handleRejectRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!formRejectionReason || formRejectionReason.trim().length < 10) {
      notify('error', 'Le motif du rejet doit comporter au moins 10 caractères.');
      return;
    }
    const res = interserviceCoordinationService.transitionRequest(selectedRequest.id, 'REJETEE', {
      actorId: 'user-resp-01',
      rejectionReason: formRejectionReason,
      isHumanDecision: true
    });
    if (res.success) {
      notify('success', `Demande ${selectedRequest.id} rejetée avec motif consigné.`);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setFormRejectionReason('');
      reloadData();
    } else {
      notify('error', res.error || 'Erreur lors du rejet.');
    }
  };

  // 4. Affecter Ressource
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!assignResourceId || !assignTeamId) {
      notify('error', 'Veuillez sélectionner une ressource et une équipe.');
      return;
    }
    if (!assignJustification || assignJustification.trim().length < 10) {
      notify('error', 'Une justification substantielle (min 10 car.) est requise pour l’affectation.');
      return;
    }
    if (!formHumanConfirm) {
      notify('error', 'Validation humaine explicite obligatoire.');
      return;
    }

    const res = interserviceCoordinationService.createAssignment({
      requestId: selectedRequest.id,
      resourceId: assignResourceId,
      teamId: assignTeamId,
      quantity: assignQuantity,
      assignedBy: 'user-resp-01',
      justification: assignJustification,
      isHumanDecision: true
    });

    if (res.success) {
      notify('success', `Ressource affectée avec succès. Disponibilité mise à jour.`);
      setShowAssignModal(false);
      setSelectedRequest(null);
      setAssignJustification('');
      setFormHumanConfirm(false);
      reloadData();
    } else {
      notify('error', res.error || 'Erreur lors de l’affectation.');
    }
  };

  // 5. Désaffecter / Restituer Ressource
  const handleReleaseAssignment = (asgId: string) => {
    const res = interserviceCoordinationService.releaseAssignment(
      asgId,
      'user-resp-01',
      'Restitution de ressource après exécution de mission.'
    );
    if (res.success) {
      notify('success', `Affectation libérée et ressource restituée au stock disponible.`);
      reloadData();
    } else {
      notify('error', res.error || 'Erreur lors de la libération.');
    }
  };

  // 6. Créer Tâche
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || taskTitle.trim().length < 5) {
      notify('error', 'Titre de tâche invalide (min 5 car.).');
      return;
    }
    const t = interserviceCoordinationService.createTask(
      {
        operationId: formOperationId,
        title: taskTitle,
        description: taskDesc,
        responsibleOrganization: taskOrg || organizations[0]?.id || 'org-sn-min-int',
        responsibleTeam: taskTeam || teams[0]?.id || 'team-sn-trans-01',
        priority: taskPriority,
        status: 'PLANIFIEE',
        startDate: '2026-09-20 12:00:00',
        dueDate: taskDueDate,
        dependencyIds: taskDependencies,
        humanValidation: true,
        isDemo: filterDemoOnly
      },
      'user-resp-01'
    );
    notify('success', `Tâche '${t.title}' planifiée.`);
    setShowTaskModal(false);
    setTaskTitle('');
    setTaskDesc('');
    setTaskDependencies([]);
    reloadData();
  };

  // 7. Clôturer Tâche avec Compte Rendu
  const handleCloseTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    if (!taskCompletionReport || taskCompletionReport.trim().length < 10) {
      notify('error', 'Le compte rendu d’exécution est obligatoire (min 10 car.).');
      return;
    }
    const res = interserviceCoordinationService.updateTaskStatus(selectedTask.id, 'TERMINEE', {
      actorId: 'user-resp-01',
      completionReport: taskCompletionReport,
      humanValidation: true
    });
    if (res.success) {
      notify('success', `Tâche clôturée avec compte rendu consigné.`);
      setShowCloseTaskModal(false);
      setSelectedTask(null);
      setTaskCompletionReport('');
      reloadData();
    } else {
      notify('error', res.error || 'Erreur lors de la clôture.');
    }
  };

  // 8. Déclarer Incident
  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incTitle || incTitle.trim().length < 5) {
      notify('error', 'Titre d’incident trop court.');
      return;
    }
    const inc = interserviceCoordinationService.createIncident(
      {
        operationId: formOperationId,
        title: incTitle,
        description: incDesc,
        severity: incSeverity,
        detectedBy: 'user-resp-01',
        affectedOrganizations: [organizations[0]?.id || 'org-sn-min-int'],
        status: 'SIGNALE',
        isDemo: filterDemoOnly
      },
      'user-resp-01'
    );
    notify('success', `Incident '${inc.title}' déclaré (Score d'impact : ${inc.impactScore}/100).`);
    setShowIncidentModal(false);
    setIncTitle('');
    setIncDesc('');
    reloadData();
  };

  // 9. Résoudre Incident
  const handleResolveIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    if (!incResolution || incResolution.trim().length < 10) {
      notify('error', 'La description de la résolution est obligatoire (min 10 car.).');
      return;
    }
    const res = interserviceCoordinationService.resolveIncident(selectedIncident.id, {
      actorId: 'user-resp-01',
      resolution: incResolution,
      isHumanDecision: true
    });
    if (res.success) {
      notify('success', `Incident résolu et archivé.`);
      setShowResolveIncModal(false);
      setSelectedIncident(null);
      setIncResolution('');
      reloadData();
    } else {
      notify('error', res.error || 'Erreur lors de la résolution.');
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'CRITIQUE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'URGENTE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'HAUTE':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'NORMALE':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'VALIDEE':
      case 'TERMINEE':
      case 'RESOLU':
      case 'OPERATIONNELLE':
      case 'DISPONIBLE':
      case 'ACTIF':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'EN_COURS':
      case 'ENGAGEE':
      case 'PARTIELLEMENT_ENGAGEE':
      case 'AFFECTEE':
      case 'EN_ALERTE':
      case 'EN_COURS_DE_TRAITEMENT':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'PROPOSEE':
      case 'EN_ATTENTE':
      case 'PLANIFIEE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'BLOQUEE':
      case 'SIGNALE':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'REJETEE':
      case 'ANNULEE':
      case 'INDISPONIBLE':
      case 'INACTIF':
        return 'bg-slate-700/50 text-slate-400 border-slate-600/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          id="toast-notification-cciso"
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border shadow-xl text-sm font-medium transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950 border-emerald-500/60 text-emerald-200'
              : 'bg-rose-950 border-rose-500/60 text-rose-200'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* HEADER PRINCIPAL DU MODULE CCISO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold tracking-wider uppercase bg-teal-500/20 text-teal-300 border border-teal-500/40">
              LOT 44
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              100% SOUVERAIN LOCAL · 0 FLUX RÉSEAU
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-400" />
              DÉCISION HUMAINE OBLIGATOIRE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-teal-400" />
            Centre de Coordination Interservices et de Suivi Opérationnel (CCISO)
          </h1>
          <p className="text-sm text-slate-400 max-w-3xl mt-1">
            Centralisation des organisations, équipes, ressources partagées, demandes d’appui, affectations
            et suivi des missions inter-agences sans automatisme de commandement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Bascule DEMO / RÉEL */}
          <button
            id="btn-toggle-demo-mode"
            onClick={() => setFilterDemoOnly(!filterDemoOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              filterDemoOnly
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {filterDemoOnly ? 'Données de Démo (Isolée)' : 'Données Réelles'}
          </button>

          {/* Bouton Export JSON */}
          <button
            id="btn-export-cciso-json"
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            Export JSON
          </button>

          {/* Navigation vers le COGC LOT 43 si disponible */}
          {onNavigate && (
            <button
              id="btn-nav-cogc-lot43"
              onClick={() => onNavigate('crisis-center')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-rose-400" />
              Lien COGC (LOT 43)
            </button>
          )}
        </div>
      </header>

      {/* BANDEAU ALERTES RUPTURES DE COORDINATION */}
      {ruptures.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Point de Contrôle : {ruptures.length} Rupture(s) de Coordination ou de Lien Détectée(s)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-200/90">
            {ruptures.slice(0, 4).map(rup => (
              <div key={rup.id} className="bg-slate-900/80 p-2.5 rounded border border-amber-500/20 flex items-start gap-2">
                <span className="font-mono text-amber-400 text-[10px] uppercase px-1 py-0.5 rounded bg-amber-950">
                  {rup.type}
                </span>
                <div>
                  <span className="font-semibold">{rup.sourceEntity} :</span> {rup.diagnostic}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ONGLET DE NAVIGATION */}
      <nav className="flex flex-wrap border-b border-slate-800 gap-1 sm:gap-2">
        {[
          { id: 'overview', label: 'Vue Globale & Stats', icon: Layers },
          { id: 'organizations', label: `Organisations (${organizations.length})`, icon: Users },
          { id: 'resources', label: `Ressources (${resources.length})`, icon: Package },
          { id: 'requests', label: `Demandes (${requests.length})`, icon: FileCheck2 },
          { id: 'tasks', label: `Tâches (${tasks.length})`, icon: CheckCircle2 },
          { id: 'incidents', label: `Incidents (${incidents.length})`, icon: AlertTriangle },
          { id: 'audit', label: `Journal d'Audit (${auditTrail.length})`, icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-cciso-${tab.id}`}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-t-lg text-xs sm:text-sm font-medium transition-colors border-t border-x ${
                isActive
                  ? 'bg-slate-900 text-teal-300 border-slate-700 border-b-transparent shadow-sm'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* CONTENU SELON ONGLET */}

      {/* 1. VUE GLOBALE & INDICATEURS LOGISTIQUES DÉTERMINISTES */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Cartes KPI */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Organisations</span>
              <div className="text-xl font-bold text-white mt-1">{stats.totalOrganizations}</div>
              <span className="text-[10px] text-emerald-400">{stats.activeOrganizations} actives</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Équipes Engagées</span>
              <div className="text-xl font-bold text-teal-400 mt-1">{stats.engagedTeams}</div>
              <span className="text-[10px] text-slate-400">sur {teams.length} répertoriées</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Ressources Dispo</span>
              <div className="text-xl font-bold text-cyan-400 mt-1">{stats.availableResourceRate}%</div>
              <span className="text-[10px] text-slate-400">{stats.availableResourcesCount}/{stats.totalResources} unités</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Demandes Validées</span>
              <div className="text-xl font-bold text-indigo-400 mt-1">{stats.validatedRequests}</div>
              <span className="text-[10px] text-amber-400">{stats.pendingRequests} en attente</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Tâches Bloquées</span>
              <div className="text-xl font-bold text-rose-400 mt-1">{stats.blockedTasks}</div>
              <span className="text-[10px] text-amber-400">{stats.overdueTasks} en retard</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Saturation Moyens</span>
              <div className="text-xs font-bold text-amber-300 mt-2 px-2 py-1 rounded bg-amber-950/60 border border-amber-500/30 text-center">
                {stats.resourceSaturationLevel}
              </div>
            </div>
          </div>

          {/* Synthèse Opérationnelle Interservices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne Gauche : Équipes sur le terrain & Disponibilité */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <h2 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                <span>Détachements & Équipes Engagées</span>
                <span className="text-xs text-slate-400 font-normal">Capacités inter-agences</span>
              </h2>
              <div className="space-y-2">
                {teams.slice(0, 5).map(team => (
                  <div key={team.id} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-200">{team.name}</div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-teal-400" /> {team.locationReference}</span>
                        <span>·</span>
                        <span>Resp: {team.responsible}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(team.status)}`}>
                        {team.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">Dispo: {team.availability}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colonne Droite : Alertes & Demandes Prioritaires */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-200">Demandes de Ressources Récentes</h2>
                <button
                  id="btn-quick-new-request"
                  onClick={() => setShowRequestModal(true)}
                  className="px-2.5 py-1 rounded text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nouvelle Demande
                </button>
              </div>

              <div className="space-y-2">
                {requests.slice(0, 4).map(req => (
                  <div key={req.id} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(req.priority)}`}>
                          {req.priority}
                        </span>
                        <span className="font-semibold text-slate-200">{req.quantity}x {req.resourceCategory}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-1 mt-1">{req.justification}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">{req.operationId}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ORGANISATIONS & ÉQUIPES */}
      {activeTab === 'organizations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map(org => {
              const orgTeams = teams.filter(t => t.organizationId === org.id);
              return (
                <div key={org.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 px-1.5 py-0.5 rounded bg-teal-950/50 border border-teal-500/30">
                        {org.type}
                      </span>
                      <h3 className="font-bold text-slate-100 text-sm mt-1">{org.name}</h3>
                      <div className="text-xs text-slate-400 font-mono">Sigle: {org.shortName}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(org.status)}`}>
                      {org.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 bg-slate-950/60 p-2.5 rounded border border-slate-800">
                    <div><span className="text-slate-500">Responsable :</span> {org.responsible}</div>
                    <div><span className="text-slate-500">Contact / Liaison :</span> {org.contactReference}</div>
                    <div><span className="text-slate-500">Classification :</span> {org.classification}</div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400">Équipes engagées ({orgTeams.length})</span>
                    <div className="space-y-1">
                      {orgTeams.map(t => (
                        <div key={t.id} className="text-[11px] p-1.5 rounded bg-slate-950/40 border border-slate-800/80 flex items-center justify-between">
                          <span className="text-slate-300 truncate max-w-[180px]">{t.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border ${getStatusBadge(t.status)}`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. RESSOURCES & MOYENS LOGISTIQUES */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200">Inventaire et Disponibilité des Ressources Opérationnelles</h2>
            <div className="text-xs text-slate-400">
              Moyens génériques, civils et de secours uniquement (pas de systèmes d'armes)
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Désignation Ressource</th>
                  <th className="p-3">Catégorie</th>
                  <th className="p-3">Emplacement / Responsable</th>
                  <th className="p-3">Total / Dispo</th>
                  <th className="p-3">Jauge</th>
                  <th className="p-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {resources.map(res => {
                  const pct = res.quantity > 0 ? Math.round((res.availableQuantity / res.quantity) * 100) : 0;
                  return (
                    <tr key={res.id} className="hover:bg-slate-800/30">
                      <td className="p-3">
                        <div className="font-semibold text-slate-200">{res.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{res.id} · {res.classification}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-teal-300 border border-slate-700">
                          {res.category}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-300">{res.locationReference}</div>
                        <div className="text-[10px] text-slate-500">Resp: {res.responsible}</div>
                      </td>
                      <td className="p-3 font-mono font-bold">
                        <span className={res.availableQuantity === 0 ? 'text-rose-400' : 'text-emerald-400'}>
                          {res.availableQuantity}
                        </span>
                        <span className="text-slate-500"> / {res.quantity}</span>
                      </td>
                      <td className="p-3 w-36">
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                          <div
                            className={`h-full ${
                              pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 text-right mt-0.5">{pct}%</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(res.status)}`}>
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. DEMANDES & AFFECTATIONS */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Demandes de Soutien & Affectations de Moyens</h2>
              <p className="text-xs text-slate-400">
                Machine à états stricte (PROPOSÉE → VALIDÉE → AFFECTÉE → SATISFAITE) avec décision humaine obligatoire.
              </p>
            </div>
            <button
              id="btn-new-request"
              onClick={() => setShowRequestModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Soumettre une Demande
            </button>
          </div>

          {/* Section Demandes Actives */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Registres des Demandes</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {requests.map(req => (
                <div key={req.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(req.priority)}`}>
                          {req.priority}
                        </span>
                        <span className="font-bold text-slate-100 text-sm">
                          {req.quantity}x {req.resourceCategory}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Ref: {req.id} · Opération: {req.operationId}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500">Justification :</span> {req.justification}
                  </div>

                  {req.rejectionReason && (
                    <div className="text-xs text-rose-300 bg-rose-950/40 p-2 rounded border border-rose-500/30">
                      <span className="font-semibold">Motif de rejet :</span> {req.rejectionReason}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Demandé par: <span className="font-mono text-slate-300">{req.requestedBy}</span></span>
                    {req.validatedBy && (
                      <span className="flex items-center gap-1 text-teal-400">
                        <UserCheck className="w-3 h-3" /> Validé par {req.validatedBy}
                      </span>
                    )}
                  </div>

                  {/* Actions contextuelles selon statut */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {/* Valider ou Rejeter si PROPOSEE ou EN_ATTENTE */}
                    {(req.status === 'PROPOSEE' || req.status === 'EN_ATTENTE') && (
                      <>
                        <button
                          id={`btn-validate-req-${req.id}`}
                          onClick={() => {
                            setSelectedRequest(req);
                            setFormJustification(`Validation prioritaire de la demande de ${req.quantity}x ${req.resourceCategory}`);
                            setFormHumanConfirm(true);
                            handleValidateRequest(req);
                          }}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-600/80 hover:bg-emerald-600 text-white flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Valider
                        </button>

                        <button
                          id={`btn-reject-req-${req.id}`}
                          onClick={() => {
                            setSelectedRequest(req);
                            setShowRejectModal(true);
                          }}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-rose-700/60 hover:bg-rose-700 text-white flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Rejeter
                        </button>
                      </>
                    )}

                    {/* Affecter si VALIDEE ou AFFECTEE */}
                    {(req.status === 'VALIDEE' || req.status === 'AFFECTEE') && (
                      <button
                        id={`btn-assign-req-${req.id}`}
                        onClick={() => {
                          setSelectedRequest(req);
                          setAssignQuantity(req.quantity);
                          setShowAssignModal(true);
                        }}
                        className="px-2.5 py-1 rounded text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Affecter Ressource
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Affectations Actives */}
          <div className="space-y-3 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Affectations Actives en Cours</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Ref Affectation</th>
                    <th className="p-3">Ressource</th>
                    <th className="p-3">Équipe Bénéficiaire</th>
                    <th className="p-3">Quantité</th>
                    <th className="p-3">Affecté par</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {assignments.map(asg => {
                    const r = resources.find(item => item.id === asg.resourceId);
                    const t = teams.find(item => item.id === asg.teamId);
                    return (
                      <tr key={asg.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-mono text-[10px] text-slate-400">{asg.id}</td>
                        <td className="p-3 font-semibold text-slate-200">{r?.name || asg.resourceId}</td>
                        <td className="p-3 text-teal-300">{t?.name || asg.teamId}</td>
                        <td className="p-3 font-mono font-bold text-amber-300">{asg.quantity}</td>
                        <td className="p-3 text-slate-400">{asg.assignedBy}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(asg.status)}`}>
                            {asg.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {asg.status === 'ACTIVE' && (
                            <button
                              id={`btn-release-asg-${asg.id}`}
                              onClick={() => handleReleaseAssignment(asg.id)}
                              className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                            >
                              Restituer
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TÂCHES & SUIVI OPÉRATIONNEL */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Suivi Opérationnel & Ordonnancement des Tâches</h2>
              <p className="text-xs text-slate-400">
                Contrôle des dépendances, alertes de retard, clôture conditionnée par compte rendu substantiel.
              </p>
            </div>
            <button
              id="btn-new-task"
              onClick={() => setShowTaskModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Planifier une Tâche
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(task => {
              const isOverdue = interserviceCoordinationService.isTaskOverdue(task);
              const org = organizations.find(o => o.id === task.responsibleOrganization);
              const team = teams.find(t => t.id === task.responsibleTeam);

              return (
                <div key={task.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(task.status)}`}>
                        {task.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-100 text-sm">{task.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>

                    <div className="text-xs text-slate-300 space-y-1 bg-slate-950/60 p-2 rounded border border-slate-800">
                      <div><span className="text-slate-500">Organisation :</span> {org?.shortName || task.responsibleOrganization}</div>
                      <div><span className="text-slate-500">Détachement :</span> {team?.name || task.responsibleTeam}</div>
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-500">Échéance :</span>
                        <span className={`font-mono ${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                          {task.dueDate} {isOverdue && '(EN RETARD)'}
                        </span>
                      </div>
                    </div>

                    {task.dependencyIds && task.dependencyIds.length > 0 && (
                      <div className="text-[11px] text-amber-300/80 bg-amber-950/30 p-1.5 rounded border border-amber-500/20">
                        <span className="font-semibold">Dépendances :</span> {task.dependencyIds.join(', ')}
                      </div>
                    )}

                    {task.completionReport && (
                      <div className="text-[11px] text-emerald-300 bg-emerald-950/30 p-2 rounded border border-emerald-500/30">
                        <span className="font-semibold">Compte rendu :</span> {task.completionReport}
                      </div>
                    )}
                  </div>

                  {/* Actions de statut */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    {task.status !== 'TERMINEE' && task.status !== 'ANNULEE' ? (
                      <button
                        id={`btn-close-task-${task.id}`}
                        onClick={() => {
                          setSelectedTask(task);
                          setShowCloseTaskModal(true);
                        }}
                        className="w-full px-2.5 py-1.5 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Clôturer avec Compte Rendu
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">Tâche clôturée · Intègre</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. INCIDENTS DE COORDINATION */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Incidents de Coordination & Frictions Logistiques</h2>
              <p className="text-xs text-slate-400">
                Gestion des congestions radio, blocages de passages frontières, défaillances matérielles.
              </p>
            </div>
            <button
              id="btn-new-incident"
              onClick={() => setShowIncidentModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Signaler un Incident
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidents.map(inc => (
              <div key={inc.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(inc.severity)}`}>
                        {inc.severity}
                      </span>
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        Impact : {inc.impactScore}/100
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm mt-1">{inc.title}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(inc.status)}`}>
                    {inc.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300">{inc.description}</p>

                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800 space-y-1">
                  <div><span className="text-slate-500">Détecté par :</span> {inc.detectedBy} le {inc.detectedAt}</div>
                  <div><span className="text-slate-500">Organismes impactés :</span> {inc.affectedOrganizations.join(', ')}</div>
                </div>

                {inc.resolution && (
                  <div className="text-xs text-emerald-300 bg-emerald-950/40 p-2.5 rounded border border-emerald-500/30">
                    <span className="font-semibold">Résolution appliquée :</span> {inc.resolution}
                  </div>
                )}

                {inc.status !== 'RESOLU' && inc.status !== 'CLOS' && (
                  <button
                    id={`btn-resolve-inc-${inc.id}`}
                    onClick={() => {
                      setSelectedIncident(inc);
                      setShowResolveIncModal(true);
                    }}
                    className="w-full px-2.5 py-1 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Résoudre l'Incident
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. JOURNAL D'AUDIT STRICTEMENT APPEND-ONLY */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Journal d’Audit Inaltérable (Append-Only)</h2>
              <p className="text-xs text-slate-400">
                Toutes les créations, validations, affectations et violations d'intégrité sont consignées de manière immuable.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 px-2 py-1 rounded bg-emerald-950/50 border border-emerald-500/30">
              AUDIT STRICTEMENT PROTÉGÉ
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Horodatage</th>
                  <th className="p-3">Acteur</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entité Cible</th>
                  <th className="p-3">Décision Humaine</th>
                  <th className="p-3">Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {auditTrail.map(aud => (
                  <tr key={aud.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-[10px] text-slate-400">{aud.timestamp}</td>
                    <td className="p-3 font-mono text-teal-300 font-semibold">{aud.actor}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        aud.action.startsWith('VIOLATION')
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-800 text-slate-200 border border-slate-700'
                      }`}>
                        {aud.action}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{aud.entityType} ({aud.entityId})</td>
                    <td className="p-3">
                      {aud.humanDecision ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[10px]">
                          <UserCheck className="w-3 h-3" /> OUI
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">NON</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-300 max-w-md">{aud.justification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODALES D'ACTION (VALIDATION HUMAINE EXPLICITE) */}
      {/* ====================================================================== */}

      {/* MODAL 1 : NOUVELLE DEMANDE */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-teal-400" />
              Soumission d'une Demande de Soutien
            </h3>
            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Catégorie de Ressource</label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value as OsintResourceCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="LOGISTIQUE_TRANSPORT">Logistique & Transport</option>
                  <option value="TRANSMISSION_TELECOM">Transmission & Télécoms</option>
                  <option value="SOIN_MEDICAL">Soin Médical & Sanitaire</option>
                  <option value="CARTOGRAPHIE_GEO">Cartographie & Géospatial</option>
                  <option value="CAPACITE_ANALYTIQUE">Capacité Analytique</option>
                  <option value="SECOURS_SAUVETAGE">Secours & Sauvetage</option>
                  <option value="LIAISON_INTERSERVICES">Liaison Interservices</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Quantité requise</label>
                  <input
                    type="number"
                    min="1"
                    value={formQuantity}
                    onChange={e => setFormQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Priorité</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as OsintRequestPriority)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="BASSE">Basse</option>
                    <option value="NORMALE">Normale</option>
                    <option value="HAUTE">Haute</option>
                    <option value="URGENTE">Urgente</option>
                    <option value="CRITIQUE">Critique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Cellule de Rattachement (COGC LOT 43)</label>
                <input
                  type="text"
                  value={formOperationId}
                  onChange={e => setFormOperationId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Justification Opérationnelle Formelle</label>
                <textarea
                  rows={3}
                  value={formJustification}
                  onChange={e => setFormJustification(e.target.value)}
                  placeholder="Expliquez la nécessité, l'urgence et les contraintes terrain..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold"
                >
                  Enregistrer la Proposition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 : AFFECTATION DE RESSOURCE */}
      {showAssignModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-teal-400" />
              Affectation d'une Ressource
            </h3>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-500">Demande :</span> {selectedRequest.quantity}x {selectedRequest.resourceCategory} ({selectedRequest.id})
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Sélectionner la Ressource en Stock</label>
                <select
                  value={assignResourceId}
                  onChange={e => setAssignResourceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  required
                >
                  <option value="">-- Choisir une ressource --</option>
                  {resources
                    .filter(r => r.category === selectedRequest.resourceCategory && r.availableQuantity > 0)
                    .map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Dispo: {r.availableQuantity}/{r.quantity})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Détachement / Équipe Bénéficiaire</label>
                <select
                  value={assignTeamId}
                  onChange={e => setAssignTeamId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  required
                >
                  <option value="">-- Choisir une équipe --</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Quantité à affecter</label>
                <input
                  type="number"
                  min="1"
                  max={selectedRequest.quantity}
                  value={assignQuantity}
                  onChange={e => setAssignQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Justification Opérationnelle de l'Affectation</label>
                <textarea
                  rows={2}
                  value={assignJustification}
                  onChange={e => setAssignJustification(e.target.value)}
                  placeholder="Motif de mise à disposition..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  required
                />
              </div>

              <div className="flex items-center gap-2 p-2 rounded bg-amber-950/40 border border-amber-500/30">
                <input
                  type="checkbox"
                  id="confirm-human-assign"
                  checked={formHumanConfirm}
                  onChange={e => setFormHumanConfirm(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-0"
                />
                <label htmlFor="confirm-human-assign" className="text-amber-200 text-[11px] font-medium">
                  Je confirme formellement cette affectation de moyens en tant qu'officier responsable.
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!formHumanConfirm}
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-semibold"
                >
                  Affecter Immédiatement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3 : REJET DEMANDE AVEC MOTIF */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              Rejet Motivé de Demande de Ressource
            </h3>
            <form onSubmit={handleRejectRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Motif formel du rejet (min 10 car.)</label>
                <textarea
                  rows={3}
                  value={formRejectionReason}
                  onChange={e => setFormRejectionReason(e.target.value)}
                  placeholder="Justifiez le refus (ex: stocks insuffisants, arbitrage prioritaire...)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                >
                  Confirmer le Rejet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4 : CLÔTURE DE TÂCHE AVEC COMPTE RENDU */}
      {showCloseTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Clôture de Tâche avec Compte Rendu
            </h3>
            <p className="text-xs text-slate-400">
              Tâche : <span className="font-semibold text-slate-200">{selectedTask.title}</span>
            </p>

            <form onSubmit={handleCloseTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Compte rendu d'exécution substantiel (obligatoire)</label>
                <textarea
                  rows={4}
                  value={taskCompletionReport}
                  onChange={e => setTaskCompletionReport(e.target.value)}
                  placeholder="Rapportez les résultats constatés, mesures de sécurité et conformité..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCloseTaskModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Valider et Clôturer la Tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5 : RÉSOLUTION D'INCIDENT */}
      {showResolveIncModal && selectedIncident && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Résolution d'Incident de Coordination
            </h3>
            <p className="text-xs text-slate-400">
              Incident : <span className="font-semibold text-slate-200">{selectedIncident.title}</span>
            </p>

            <form onSubmit={handleResolveIncident} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Mesures correctives appliquées (min 10 car.)</label>
                <textarea
                  rows={3}
                  value={incResolution}
                  onChange={e => setIncResolution(e.target.value)}
                  placeholder="Décrivez comment le canal a été rétabli ou la friction résolue..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResolveIncModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Archiver comme Résolu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
