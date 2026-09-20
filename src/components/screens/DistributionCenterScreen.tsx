import React, { useState, useMemo, useEffect } from 'react';
import { 
  Send, CheckCircle2, Clock, AlertTriangle, FileText, Users, 
  UserCheck, Archive, ShieldAlert, Search, Filter, Download, 
  XCircle, Info, Lock, Building, ChevronRight, Eye, FileCheck, 
  RefreshCw, CheckSquare, AlertCircle, Ban, ShieldCheck, UserPlus,
  Layers, ChevronDown
} from 'lucide-react';
import { UseOsintViewModelReturn } from '../../viewmodels/useOsintViewModel';
import { 
  OsintDistribution, 
  OsintDistributionRecipient, 
  OsintDistributionGroup, 
  OsintDistributionLevel, 
  OsintDistributionStatus, 
  OsintArchiveRecord, 
  OsintIntelligenceNote,
  OsintDistributionAudit 
} from '../../types';
import { distributionService } from '../../services/distributionService';
import { intelligenceNoteService } from '../../services/intelligenceNoteService';

interface DistributionCenterScreenProps {
  vm: UseOsintViewModelReturn;
}

export const DistributionCenterScreen: React.FC<DistributionCenterScreenProps> = ({ vm }) => {
  // Navigation interne
  const [activeTab, setActiveTab] = useState<'DISTRIBUTIONS' | 'READY_NOTES' | 'RECIPIENTS' | 'GROUPS' | 'ARCHIVES' | 'AUDIT'>('DISTRIBUTIONS');
  const [dataScope, setDataScope] = useState<'ALL' | 'REAL' | 'DEMO'>('ALL');

  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TOUS');
  const [levelFilter, setLevelFilter] = useState<string>('TOUS');

  // Données chargées
  const [distributions, setDistributions] = useState<OsintDistribution[]>([]);
  const [recipients, setRecipients] = useState<OsintDistributionRecipient[]>([]);
  const [groups, setGroups] = useState<OsintDistributionGroup[]>([]);
  const [archives, setArchives] = useState<OsintArchiveRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<OsintDistributionAudit[]>([]);
  const [notes, setNotes] = useState<OsintIntelligenceNote[]>([]);

  // Modals & sélections
  const [selectedDist, setSelectedDist] = useState<OsintDistribution | null>(null);
  const [selectedArchive, setSelectedArchive] = useState<OsintArchiveRecord | null>(null);
  
  // Modal de nouvelle diffusion
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [distributeTargetNoteId, setDistributeTargetNoteId] = useState<string>('');
  const [distRecipientType, setDistRecipientType] = useState<'RECIPIENT' | 'GROUP'>('RECIPIENT');
  const [distTargetRecipientId, setDistTargetRecipientId] = useState<string>('');
  const [distTargetGroupId, setDistTargetGroupId] = useState<string>('');
  const [distLevel, setDistLevel] = useState<OsintDistributionLevel>('RESTREINT');
  const [distJustification, setDistJustification] = useState('');
  const [distRestrictions, setDistRestrictions] = useState('Usage strictement réservé aux services autorisés. Reproduction interdite sans accord.');
  const [distIsScheduled, setDistIsScheduled] = useState(false);
  const [distScheduledDate, setDistScheduledDate] = useState('');
  const [distAckRequired, setDistAckRequired] = useState(true);
  const [distError, setDistError] = useState<string | null>(null);

  // Modal Accusé de réception
  const [isAckModalOpen, setIsAckModalOpen] = useState(false);
  const [ackTargetDist, setAckTargetDist] = useState<OsintDistribution | null>(null);
  const [ackStatus, setAckStatus] = useState<'ACCEPTE' | 'REFUSE'>('ACCEPTE');
  const [ackComment, setAckComment] = useState('');
  const [ackSignature, setAckSignature] = useState('SIG-OPERATEUR-01');

  // Modal Retrait
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawTargetDist, setWithdrawTargetDist] = useState<OsintDistribution | null>(null);
  const [withdrawReason, setWithdrawReason] = useState('');

  // Modal Destinataire
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<OsintDistributionRecipient | null>(null);
  const [recName, setRecName] = useState('');
  const [recOrg, setRecOrg] = useState('');
  const [recFunction, setRecFunction] = useState('');
  const [recLevel, setRecLevel] = useState<OsintDistributionLevel>('RESTREINT');
  const [recNeedToKnow, setRecNeedToKnow] = useState('');
  const [recEmail, setRecEmail] = useState('');
  const [recIsDemo, setRecIsDemo] = useState(true);

  // Modal Groupe
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<OsintDistributionGroup | null>(null);
  const [grpName, setGrpName] = useState('');
  const [grpDesc, setGrpDesc] = useState('');
  const [grpLevel, setGrpLevel] = useState<OsintDistributionLevel>('RESTREINT');
  const [grpMembers, setGrpMembers] = useState<string[]>([]);
  const [grpIsDemo, setGrpIsDemo] = useState(true);

  // Chargement réactif des données
  const refreshData = () => {
    setDistributions(distributionService.getDistributions(dataScope));
    setRecipients(distributionService.getRecipients(dataScope));
    setGroups(distributionService.getGroups(dataScope));
    setArchives(distributionService.getArchives(dataScope));
    setAuditLogs(distributionService.getAuditLogs());
    setNotes(intelligenceNoteService.getNotes(dataScope));
  };

  useEffect(() => {
    refreshData();
  }, [dataScope]);

  // Notes prêtes à la diffusion (VALIDEE ou DIFFUSABLE)
  const readyNotes = useMemo(() => {
    return notes.filter(n => n.status === 'VALIDEE' || n.status === 'DIFFUSABLE');
  }, [notes]);

  // KPIs
  const kpiStats = useMemo(() => {
    const demo = distributionService.getStats(true);
    const real = distributionService.getStats(false);
    return {
      real,
      demo,
      current: dataScope === 'REAL' ? real : (dataScope === 'DEMO' ? demo : {
        diffusableNotesCount: readyNotes.length,
        scheduledDistributionsCount: distributions.filter(d => d.status === 'DIFFUSION_PLANIFIEE').length,
        sentDistributionsCount: distributions.filter(d => d.status === 'DIFFUSEE' || d.status === 'ACCUSÉE_DE_RECEPTION').length,
        acknowledgedDistributionsCount: distributions.filter(d => d.status === 'ACCUSÉE_DE_RECEPTION').length,
        withdrawnDistributionsCount: distributions.filter(d => d.status === 'RETIREE').length,
        archivedNotesCount: archives.length,
        activeRecipientsCount: recipients.filter(r => r.status === 'ACTIF').length
      })
    };
  }, [distributions, recipients, archives, readyNotes, dataScope]);

  // Filtrage des diffusions
  const filteredDistributions = useMemo(() => {
    return distributions.filter(d => {
      const matchesSearch = 
        d.distributionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.noteId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.justification && d.justification.toLowerCase().includes(searchQuery.toLowerCase())) ||
        d.distributedBy.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'TOUS' || d.status === statusFilter;
      const matchesLevel = levelFilter === 'TOUS' || d.distributionLevel === levelFilter;

      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [distributions, searchQuery, statusFilter, levelFilter]);

  // Helper pour afficher le badge de statut
  const getStatusBadge = (status: OsintDistributionStatus) => {
    switch(status) {
      case 'DIFFUSEE':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">DIFFUSÉE</span>;
      case 'ACCUSÉE_DE_RECEPTION':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">ACCUSÉE RÉCEPTION</span>;
      case 'DIFFUSION_PLANIFIEE':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">PLANIFIÉE</span>;
      case 'REFUSEE':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">REFUSÉE</span>;
      case 'RETIREE':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">RETIRÉE</span>;
      case 'ANNULEE':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-700 text-slate-300 border border-slate-600">ANNULÉE</span>;
      case 'EXPIREE':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-zinc-800 text-zinc-400 border border-zinc-700">EXPIRÉE</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-400 border border-slate-700">{status}</span>;
    }
  };

  const getLevelBadge = (level: OsintDistributionLevel) => {
    switch(level) {
      case 'CONFIDENTIEL':
        return <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-rose-950/80 text-rose-300 border border-rose-600/50">CONFIDENTIEL</span>;
      case 'RESTREINT':
        return <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-amber-950/80 text-amber-300 border border-amber-600/50">RESTREINT</span>;
      case 'DIFFUSION_LIMITEE':
        return <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-cyan-950/80 text-cyan-300 border border-cyan-600/50">DIFF. LIMITÉE</span>;
      case 'INTERNE':
        return <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-600">INTERNE</span>;
      case 'PUBLIC':
        return <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">PUBLIC</span>;
    }
  };

  // Actions de workflow
  const handleOpenDistributeModal = (noteId?: string) => {
    setDistributeTargetNoteId(noteId || (readyNotes[0]?.id || ''));
    setDistTargetRecipientId(recipients[0]?.recipientId || '');
    setDistTargetGroupId(groups[0]?.groupId || '');
    setDistJustification('Diffusion autorisée vers les entités de veille opérationnelle');
    setDistError(null);
    setIsDistributeModalOpen(true);
  };

  const handleConfirmDistribution = () => {
    try {
      setDistError(null);
      if (!distributeTargetNoteId) {
        setDistError('Veuillez sélectionner une note.');
        return;
      }

      distributionService.createDistribution({
        noteId: distributeTargetNoteId,
        recipientId: distRecipientType === 'RECIPIENT' ? distTargetRecipientId : undefined,
        groupId: distRecipientType === 'GROUP' ? distTargetGroupId : undefined,
        distributionLevel: distLevel,
        distributedBy: 'Analyste-Diffuseur',
        justification: distJustification,
        restrictions: distRestrictions,
        scheduledFor: distIsScheduled ? distScheduledDate : undefined,
        acknowledgmentRequired: distAckRequired,
        autoSendImmediately: !distIsScheduled
      });

      setIsDistributeModalOpen(false);
      refreshData();
    } catch (err: any) {
      setDistError(err.message || 'Erreur lors de la diffusion.');
    }
  };

  const handleSendNow = (dist: OsintDistribution) => {
    try {
      distributionService.sendDistribution(dist.distributionId, 'Analyste-Diffuseur', 'Émission immédiate de la diffusion');
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancelScheduled = (dist: OsintDistribution) => {
    const reason = prompt('Motif de l annulation de la diffusion planifiée :');
    if (reason) {
      distributionService.cancelScheduledDistribution(dist.distributionId, 'Analyste-Diffuseur', reason);
      refreshData();
    }
  };

  const handleOpenAckModal = (dist: OsintDistribution) => {
    setAckTargetDist(dist);
    setAckStatus('ACCEPTE');
    setAckComment('Prise en compte opérationnelle de la note');
    setAckSignature(`SIG-DEST-${Date.now().toString().slice(-4)}`);
    setIsAckModalOpen(true);
  };

  const handleConfirmAck = () => {
    if (!ackTargetDist) return;
    try {
      distributionService.acknowledgeDistribution({
        distributionId: ackTargetDist.distributionId,
        recipientId: ackTargetDist.recipientId || 'rec-001',
        status: ackStatus,
        comment: ackComment,
        logicalSignature: ackSignature,
        analystId: 'Analyste-Contrôleur'
      });
      setIsAckModalOpen(false);
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenWithdrawModal = (dist: OsintDistribution) => {
    setWithdrawTargetDist(dist);
    setWithdrawReason('Mise à jour des éléments probants ou obsolescence des données');
    setIsWithdrawModalOpen(true);
  };

  const handleConfirmWithdraw = () => {
    if (!withdrawTargetDist) return;
    try {
      distributionService.withdrawDistribution(withdrawTargetDist.distributionId, 'Analyste-Superviseur', withdrawReason);
      setIsWithdrawModalOpen(false);
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleArchiveNote = (noteId: string) => {
    const reason = prompt('Motif d archivage formel de la note :');
    if (!reason) return;
    try {
      distributionService.archiveNoteRecord(noteId, 'Analyste-Archiviste', reason);
      refreshData();
      alert('Note et son dossier de traçabilité archivés avec succès (statut terminal immuable).');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportJson = () => {
    const jsonStr = distributionService.exportDistributionDataJson(dataScope);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OSINT_AFRICA_DISTRIBUTION_LOT32_${dataScope}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sauvegarde destinataire
  const handleSaveRecipient = () => {
    try {
      const recId = editingRecipient ? editingRecipient.recipientId : `rec-usr-${Date.now()}`;
      const rec: OsintDistributionRecipient = {
        recipientId: recId,
        name: recName,
        organization: recOrg,
        function: recFunction,
        accessLevel: recLevel,
        needToKnow: recNeedToKnow.split(',').map(s => s.trim()).filter(Boolean),
        email: recEmail,
        status: 'ACTIF',
        isDemo: recIsDemo,
        provenance: recIsDemo ? 'Simulation locale de gouvernance - Démo' : 'Registre institutionnel public',
        createdAt: editingRecipient ? editingRecipient.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      distributionService.saveRecipient(rec, 'Analyste-Admin', editingRecipient ? 'Modification destinataire' : 'Création destinataire');
      setIsRecipientModalOpen(false);
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Sauvegarde groupe
  const handleSaveGroup = () => {
    try {
      const grpId = editingGroup ? editingGroup.groupId : `grp-usr-${Date.now()}`;
      const grp: OsintDistributionGroup = {
        groupId: grpId,
        name: grpName,
        description: grpDesc,
        members: grpMembers,
        accessLevel: grpLevel,
        status: 'ACTIF',
        isDemo: grpIsDemo,
        provenance: grpIsDemo ? 'Simulation locale groupe - Démo' : 'Groupe institutionnel public',
        createdAt: editingGroup ? editingGroup.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      distributionService.saveGroup(grp, 'Analyste-Admin', editingGroup ? 'Modification groupe' : 'Création groupe');
      setIsGroupModalOpen(false);
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* 1. Header principal */}
      <div className="flex-none p-5 sm:p-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-slate-900 border border-blue-500/40 flex items-center justify-center shadow-inner">
              <Send className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Centre de Diffusion Contrôlée & Suivi
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-blue-300 font-bold">
                  LOT 32
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Diffusion habilitée, traçabilité des destinataires, accusés de réception, retraits et archivage scellé
              </p>
            </div>
          </div>

          {/* Séparation stricte Réel / Démo & Export */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
              <button 
                id="btn-filter-scope-all"
                onClick={() => setDataScope('ALL')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${dataScope === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                TOUT
              </button>
              <button 
                id="btn-filter-scope-real"
                onClick={() => setDataScope('REAL')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${dataScope === 'REAL' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                RÉEL (0 Démo)
              </button>
              <button 
                id="btn-filter-scope-demo"
                onClick={() => setDataScope('DEMO')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${dataScope === 'DEMO' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                DÉMO
              </button>
            </div>

            <button
              id="btn-export-distribution-json"
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
              title="Exporter l intégralité des diffusions et archives en JSON"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* 2. Bandeau de Non-Confusion Doctrinale et Taxonomie Applicative */}
        <div className="mt-4 p-3 rounded-lg bg-blue-950/20 border border-blue-900/50 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
            <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
            <span>DIRECTIVES ET PRINCIPES DOCTRINAUX DE DIFFUSION DU RENSEIGNEMENT</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] text-slate-300">
            <div className="flex items-start gap-1.5">
              <span className="text-blue-400 font-bold">•</span>
              <span>Une diffusion n'est pas une validation analytique.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-blue-400 font-bold">•</span>
              <span>Un accusé de réception ne signifie pas que le destinataire approuve le contenu.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-blue-400 font-bold">•</span>
              <span>Une hypothèse ne doit jamais être présentée comme un fait établi.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-blue-400 font-bold">•</span>
              <span>Une information non confirmée conserve son statut.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-blue-400 font-bold">•</span>
              <span>La diffusion ne modifie pas le niveau de confiance.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-blue-400 font-bold">•</span>
              <span>La diffusion ne constitue pas une attribution automatique.</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic pt-1 border-t border-blue-950/60">
            * Note doctrinale : Les catégories de diffusion (INTERNE, RESTREINT, CONFIDENTIEL, DIFFUSION_LIMITEE, PUBLIC) sont des catégories applicatives de gouvernance et ne constituent pas automatiquement une classification juridique officielle.
          </p>
        </div>

        {/* 3. Barres de KPI rigoureux */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Notes Diffusables</span>
              <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-indigo-300 mt-1">
              {kpiStats.current.diffusableNotesCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Validées (LOT 31)</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Planifiées</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-300 mt-1">
              {kpiStats.current.scheduledDistributionsCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">En attente d'émission</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Diffusées</span>
              <Send className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-blue-300 mt-1">
              {kpiStats.current.sentDistributionsCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Actives ou reçues</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Accusées</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-300 mt-1">
              {kpiStats.current.acknowledgedDistributionsCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Accusés reçus</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Retirées</span>
              <XCircle className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-purple-300 mt-1">
              {kpiStats.current.withdrawnDistributionsCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Retraits motivés</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Archivées</span>
              <Archive className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-cyan-300 mt-1">
              {kpiStats.current.archivedNotesCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Dossiers scellés</div>
          </div>
        </div>

        {/* 4. Onglets de Navigation principale */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <button
              id="tab-distributions"
              onClick={() => setActiveTab('DISTRIBUTIONS')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'DISTRIBUTIONS' 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Diffusions & Suivi ({distributions.length})</span>
            </button>

            <button
              id="tab-ready-notes"
              onClick={() => setActiveTab('READY_NOTES')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'READY_NOTES' 
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Notes Prêtes ({readyNotes.length})</span>
            </button>

            <button
              id="tab-recipients"
              onClick={() => setActiveTab('RECIPIENTS')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'RECIPIENTS' 
                  ? 'bg-slate-700 text-white font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Destinataires ({recipients.length})</span>
            </button>

            <button
              id="tab-groups"
              onClick={() => setActiveTab('GROUPS')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'GROUPS' 
                  ? 'bg-slate-700 text-white font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Groupes ({groups.length})</span>
            </button>

            <button
              id="tab-archives"
              onClick={() => setActiveTab('ARCHIVES')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'ARCHIVES' 
                  ? 'bg-cyan-700 text-white font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archives Scellées ({archives.length})</span>
            </button>

            <button
              id="tab-audit"
              onClick={() => setActiveTab('AUDIT')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'AUDIT' 
                  ? 'bg-slate-700 text-white font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Piste d'Audit ({auditLogs.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-open-distribute-modal"
              onClick={() => handleOpenDistributeModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nouvelle Diffusion</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Contenu principal par onglet */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
        {/* ========================================================================= */}
        {/* ONGLET 1 : DIFFUSIONS & SUIVI */}
        {/* ========================================================================= */}
        {activeTab === 'DISTRIBUTIONS' && (
          <div className="space-y-4">
            {/* Barre de recherche et filtres */}
            <div className="flex flex-col sm:flex-row gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input 
                  id="input-search-distributions"
                  type="text"
                  placeholder="Rechercher une diffusion par ID, note, diffuseur, motif..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <select
                  id="select-filter-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="TOUS">Tous les statuts</option>
                  <option value="DIFFUSEE">Diffusée</option>
                  <option value="ACCUSÉE_DE_RECEPTION">Accusée de réception</option>
                  <option value="DIFFUSION_PLANIFIEE">Diffusion planifiée</option>
                  <option value="REFUSEE">Refusée</option>
                  <option value="RETIREE">Retirée</option>
                  <option value="ANNULEE">Annulée</option>
                  <option value="EXPIREE">Expirée</option>
                </select>

                <select
                  id="select-filter-level"
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="TOUS">Tous les niveaux</option>
                  <option value="RESTREINT">Restreint</option>
                  <option value="CONFIDENTIEL">Confidentiel</option>
                  <option value="DIFFUSION_LIMITEE">Diffusion Limitée</option>
                  <option value="INTERNE">Interne</option>
                  <option value="PUBLIC">Public</option>
                </select>
              </div>
            </div>

            {/* Tableau récapitulatif des diffusions */}
            {filteredDistributions.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 rounded-xl border border-slate-800/80 space-y-2">
                <Send className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-medium text-slate-400">Aucune diffusion enregistrée correspondant aux critères.</p>
                <p className="text-xs text-slate-500">Cliquez sur « Nouvelle Diffusion » ou sélectionnez une note dans l'onglet « Notes Prêtes ».</p>
              </div>
            ) : (
              <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-3">Réf / Note</th>
                        <th className="p-3">Destinataire / Groupe</th>
                        <th className="p-3">Niveau</th>
                        <th className="p-3">Diffuseur</th>
                        <th className="p-3">Dates & Échéance</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3 text-right">Actions Opérationnelles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredDistributions.map(dist => {
                        const note = intelligenceNoteService.getNoteById(dist.noteId);
                        const rec = dist.recipientId ? distributionService.getRecipientById(dist.recipientId) : null;
                        const grp = dist.groupId ? distributionService.getGroupById(dist.groupId) : null;

                        return (
                          <tr key={dist.distributionId} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3">
                              <div className="font-mono text-blue-400 font-bold">{note?.reference || dist.noteId}</div>
                              <div className="text-slate-300 font-medium line-clamp-1 text-[11px] max-w-xs">{note?.title || 'Note sans titre'}</div>
                              <div className="text-[10px] text-slate-400 font-mono">ID: {dist.distributionId}</div>
                            </td>

                            <td className="p-3">
                              {rec ? (
                                <div>
                                  <div className="font-medium text-slate-200">{rec.name}</div>
                                  <div className="text-[11px] text-slate-400 line-clamp-1">{rec.organization}</div>
                                  <div className="text-[10px] text-slate-500">{rec.function}</div>
                                </div>
                              ) : grp ? (
                                <div>
                                  <div className="font-medium text-purple-300 flex items-center gap-1">
                                    <Users className="w-3 h-3 text-purple-400" />
                                    <span>{grp.name}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400">{grp.members.length} membres habilités</div>
                                </div>
                              ) : (
                                <span className="text-slate-500 italic">Destinataire non identifié</span>
                              )}
                            </td>

                            <td className="p-3 whitespace-nowrap">
                              {getLevelBadge(dist.distributionLevel)}
                            </td>

                            <td className="p-3">
                              <div className="text-slate-300 font-medium">{dist.distributedBy}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {dist.isDemo ? 'Provenance: Démo' : 'Provenance: Réel'}
                              </div>
                            </td>

                            <td className="p-3 text-[11px]">
                              {dist.distributedAt ? (
                                <div className="text-slate-300">
                                  Émis le : {new Date(dist.distributedAt).toLocaleDateString()}
                                </div>
                              ) : dist.scheduledFor ? (
                                <div className="text-amber-400 font-medium">
                                  Planifié : {new Date(dist.scheduledFor).toLocaleDateString()}
                                </div>
                              ) : (
                                <div className="text-slate-500">Non émis</div>
                              )}
                              {dist.acknowledgmentDate && (
                                <div className="text-emerald-400 text-[10px]">
                                  Accusé le : {new Date(dist.acknowledgmentDate).toLocaleDateString()}
                                </div>
                              )}
                              {dist.withdrawalDate && (
                                <div className="text-purple-400 text-[10px]">
                                  Retiré le : {new Date(dist.withdrawalDate).toLocaleDateString()}
                                </div>
                              )}
                            </td>

                            <td className="p-3 whitespace-nowrap">
                              {getStatusBadge(dist.status)}
                            </td>

                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {/* Action selon statut */}
                                {dist.status === 'DIFFUSION_PLANIFIEE' && (
                                  <>
                                    <button
                                      onClick={() => handleSendNow(dist)}
                                      className="px-2 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-300 text-[11px] font-medium"
                                      title="Émettre immédiatement"
                                    >
                                      Émettre
                                    </button>
                                    <button
                                      onClick={() => handleCancelScheduled(dist)}
                                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                                      title="Annuler la planification"
                                    >
                                      Annuler
                                    </button>
                                  </>
                                )}

                                {dist.status === 'DIFFUSEE' && (
                                  <>
                                    <button
                                      onClick={() => handleOpenAckModal(dist)}
                                      className="px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 text-[11px] font-medium"
                                      title="Enregistrer l'accusé de réception du destinataire"
                                    >
                                      Accuser Réception
                                    </button>
                                    <button
                                      onClick={() => handleOpenWithdrawModal(dist)}
                                      className="px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-300 text-[11px]"
                                      title="Retirer la diffusion"
                                    >
                                      Retirer
                                    </button>
                                  </>
                                )}

                                {dist.status === 'ACCUSÉE_DE_RECEPTION' && (
                                  <button
                                    onClick={() => handleOpenWithdrawModal(dist)}
                                    className="px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-300 text-[11px]"
                                    title="Retrait exceptionnel"
                                  >
                                    Retirer
                                  </button>
                                )}

                                <button
                                  onClick={() => setSelectedDist(dist)}
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                                  title="Détails de traçabilité"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ONGLET 2 : NOTES PRÊTES À LA DIFFUSION */}
        {/* ========================================================================= */}
        {activeTab === 'READY_NOTES' && (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-950/20 border border-indigo-900/50 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-indigo-300">RÈGLE DE DOCTRINE : EXCLUSION DES NOTES NON VALIDÉES</span>
                <p>
                  Seules les notes ayant fait l'objet d'une validation humaine formelle explicite (statut <code className="text-indigo-200">VALIDEE</code> ou <code className="text-indigo-200">DIFFUSABLE</code>) peuvent être engagées dans le circuit de diffusion.
                  Toute note au statut <code className="text-rose-300">BROUILLON</code>, <code className="text-rose-300">EN_ELABORATION</code>, <code className="text-rose-300">EN_REVISION</code> ou <code className="text-rose-300">A_VALIDER</code> est formellement bloquée.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readyNotes.map(note => {
                const noteDistributions = distributionService.getDistributionsByNoteId(note.id);
                const isArchived = note.status === 'ARCHIVEE';

                return (
                  <div key={note.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs text-blue-400 font-bold">{note.reference}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            note.status === 'VALIDEE' 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                              : 'bg-blue-950 text-blue-400 border border-blue-500/40'
                          }`}>
                            {note.status}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {note.isDemo ? 'DÉMO' : 'RÉEL'}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-sm font-semibold text-white mt-1.5">{note.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{note.executiveSummary}</p>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                        <div>Diffusions émises : <strong className="text-white">{noteDistributions.length}</strong></div>
                        <div>Sources tracées : <strong className="text-white">{note.sourceCount || 0}</strong></div>
                        <div>Validé par : <span className="text-slate-300 font-mono text-[10px]">{note.reviewerId || 'Analyste-Superviseur'}</span></div>
                        <div>Confiance : <span className="text-amber-400 font-medium">{note.confidence}</span></div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleArchiveNote(note.id)}
                        disabled={isArchived}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                        title="Archiver définitivement le dossier de cette note"
                      >
                        <Archive className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Archiver</span>
                      </button>

                      <button
                        onClick={() => handleOpenDistributeModal(note.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Diffuser cette note</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ONGLET 3 : DESTINATAIRES */}
        {/* ========================================================================= */}
        {activeTab === 'RECIPIENTS' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-xs text-slate-400">
                Gouvernance et annuaire des destinataires habilités (simulation locale de gouvernance, aucune authentification réseau).
              </div>
              <button
                onClick={() => {
                  setEditingRecipient(null);
                  setRecName('');
                  setRecOrg('');
                  setRecFunction('');
                  setRecLevel('RESTREINT');
                  setRecNeedToKnow('');
                  setRecEmail('');
                  setRecIsDemo(dataScope === 'DEMO');
                  setIsRecipientModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200"
              >
                <UserPlus className="w-3.5 h-3.5 text-blue-400" />
                <span>Nouveau Destinataire</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recipients.map(r => (
                <div key={r.recipientId} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{r.name}</h4>
                      <p className="text-xs text-slate-300 font-medium">{r.organization}</p>
                      <p className="text-[11px] text-slate-500">{r.function}</p>
                    </div>
                    {getLevelBadge(r.accessLevel)}
                  </div>

                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 space-y-1">
                    <div>Besoin d'en connaître : <span className="text-slate-200">{r.needToKnow?.join(', ') || 'Non spécifié'}</span></div>
                    {r.email && <div className="font-mono text-[10px] text-slate-400">Contact: {r.email}</div>}
                    <div className="text-[10px] text-slate-400">{r.provenance}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.status === 'ACTIF' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      {r.status}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          distributionService.toggleRecipientActive(r.recipientId, 'Analyste-Admin', 'Modification statut destinataire');
                          refreshData();
                        }}
                        className="text-[11px] text-slate-400 hover:text-white"
                      >
                        {r.status === 'ACTIF' ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingRecipient(r);
                          setRecName(r.name);
                          setRecOrg(r.organization);
                          setRecFunction(r.function);
                          setRecLevel(r.accessLevel);
                          setRecNeedToKnow(r.needToKnow.join(', '));
                          setRecEmail(r.email || '');
                          setRecIsDemo(r.isDemo);
                          setIsRecipientModalOpen(true);
                        }}
                        className="text-[11px] text-blue-400 hover:underline"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ONGLET 4 : GROUPES DE DIFFUSION */}
        {/* ========================================================================= */}
        {activeTab === 'GROUPS' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-xs text-slate-400">
                Groupes de diffusion thématiques pour envois coordonnés et simultanés.
              </div>
              <button
                onClick={() => {
                  setEditingGroup(null);
                  setGrpName('');
                  setGrpDesc('');
                  setGrpLevel('RESTREINT');
                  setGrpMembers([]);
                  setGrpIsDemo(dataScope === 'DEMO');
                  setIsGroupModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200"
              >
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Nouveau Groupe</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groups.map(g => (
                <div key={g.groupId} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span>{g.name}</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">{g.description}</p>
                    </div>
                    {getLevelBadge(g.accessLevel)}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                    <span className="text-slate-500 font-semibold text-[11px] block mb-1">Membres rattachés ({g.members.length}) :</span>
                    <div className="flex flex-wrap gap-1.5">
                      {g.members.map(mid => {
                        const mRec = distributionService.getRecipientById(mid);
                        return (
                          <span key={mid} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                            {mRec?.name || mid}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-[10px] text-slate-400 font-mono">{g.provenance}</span>
                    <button
                      onClick={() => {
                        setEditingGroup(g);
                        setGrpName(g.name);
                        setGrpDesc(g.description);
                        setGrpLevel(g.accessLevel);
                        setGrpMembers(g.members);
                        setGrpIsDemo(g.isDemo);
                        setIsGroupModalOpen(true);
                      }}
                      className="text-blue-400 hover:underline"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ONGLET 5 : ARCHIVES SCELLÉES */}
        {/* ========================================================================= */}
        {activeTab === 'ARCHIVES' && (
          <div className="space-y-4">
            <div className="p-4 bg-cyan-950/20 border border-cyan-900/50 rounded-xl flex items-start gap-3">
              <Archive className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-cyan-300">PRINCIPE D'ARCHIVAGE SCELLÉ ET IMMUABILITÉ</span>
                <p>
                  Toute note archivée conserve son instantané intégral, ses versions, son historique de validation, ses diffusions et ses accusés.
                  Une note archivée ne peut plus être altérée directement. Toute modification ultérieure doit obligatoirement passer par une nouvelle version du LOT 31.
                </p>
              </div>
            </div>

            {archives.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 rounded-xl border border-slate-800/80">
                <Archive className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Aucune note archivée pour le moment.</p>
                <p className="text-xs text-slate-500 mt-1">Vous pouvez archiver une note depuis l'onglet « Notes Prêtes ».</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {archives.map(arch => (
                  <div key={arch.archiveId} className="bg-slate-900/80 border border-cyan-900/40 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs text-cyan-400 font-bold">{arch.noteSnapshot.reference}</span>
                        <h4 className="text-sm font-semibold text-white mt-1">{arch.noteSnapshot.title}</h4>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                        ARCHIVÉE
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <div><strong className="text-slate-400">Justification :</strong> {arch.justification}</div>
                      <div><strong className="text-slate-400">Archivée par :</strong> {arch.archivedBy}</div>
                      <div><strong className="text-slate-400">Date de scellement :</strong> {new Date(arch.archivedAt).toLocaleString()}</div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400 pt-1">
                      <div className="bg-slate-800/60 p-1.5 rounded">
                        <div className="font-bold text-white">{arch.versionsSnapshot?.length || 0}</div>
                        <div className="text-[10px]">Versions</div>
                      </div>
                      <div className="bg-slate-800/60 p-1.5 rounded">
                        <div className="font-bold text-white">{arch.distributionsSnapshot?.length || 0}</div>
                        <div className="text-[10px]">Diffusions</div>
                      </div>
                      <div className="bg-slate-800/60 p-1.5 rounded">
                        <div className="font-bold text-white">{arch.auditSnapshot?.length || 0}</div>
                        <div className="text-[10px]">Traces Audit</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-end">
                      <button
                        onClick={() => setSelectedArchive(arch)}
                        className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspecter l'archive scellée</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ONGLET 6 : PISTE D'AUDIT APPEND-ONLY */}
        {/* ========================================================================= */}
        {activeTab === 'AUDIT' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Piste d'audit append-only des opérations de diffusion (enregistrement immuable sans fonction de suppression ni réécriture).
              </div>
              <span className="text-xs font-mono text-slate-500">{auditLogs.length} entrées scellées</span>
            </div>

            <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px]">
                    <tr>
                      <th className="p-2.5">Date & Heure</th>
                      <th className="p-2.5">Action</th>
                      <th className="p-2.5">Opérateur</th>
                      <th className="p-2.5">Entité Cible</th>
                      <th className="p-2.5">Motif / Justification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-[11px]">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-800/30">
                        <td className="p-2.5 text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-2.5 text-blue-300 font-bold">{log.action}</td>
                        <td className="p-2.5 text-slate-300">{log.analystId}</td>
                        <td className="p-2.5 text-amber-400">{log.entityId}</td>
                        <td className="p-2.5 text-slate-300 font-sans text-xs">{log.justification || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1 : NOUVELLE DIFFUSION & CHECKLIST PRÉ-DIFFUSION */}
      {/* ========================================================================= */}
      {isDistributeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <Send className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Création & Contrôle Pré-Diffusion</h3>
              </div>
              <button onClick={() => setIsDistributeModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {distError && (
                <div className="p-3 bg-rose-950/50 border border-rose-600 rounded-lg text-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{distError}</span>
                </div>
              )}

              {/* Sélection de la note */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Note de renseignement à diffuser :</label>
                <select
                  value={distributeTargetNoteId}
                  onChange={(e) => setDistributeTargetNoteId(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="">Sélectionner une note</option>
                  {notes.map(n => (
                    <option key={n.id} value={n.id}>
                      [{n.status}] {n.reference} — {n.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type de destinataire */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Cible de diffusion :</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="recType" 
                      checked={distRecipientType === 'RECIPIENT'} 
                      onChange={() => setDistRecipientType('RECIPIENT')} 
                    />
                    <span>Destinataire individuel</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="recType" 
                      checked={distRecipientType === 'GROUP'} 
                      onChange={() => setDistRecipientType('GROUP')} 
                    />
                    <span>Groupe de diffusion</span>
                  </label>
                </div>

                {distRecipientType === 'RECIPIENT' ? (
                  <select
                    value={distTargetRecipientId}
                    onChange={(e) => setDistTargetRecipientId(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    {recipients.map(r => (
                      <option key={r.recipientId} value={r.recipientId}>
                        {r.name} ({r.organization}) — Habilitation: {r.accessLevel}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={distTargetGroupId}
                    onChange={(e) => setDistTargetGroupId(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    {groups.map(g => (
                      <option key={g.groupId} value={g.groupId}>
                        {g.name} ({g.members.length} membres) — Niveau: {g.accessLevel}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Niveau et restrictions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Niveau de diffusion applicatif :</label>
                  <select
                    value={distLevel}
                    onChange={(e) => setDistLevel(e.target.value as OsintDistributionLevel)}
                    className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="RESTREINT">RESTREINT</option>
                    <option value="CONFIDENTIEL">CONFIDENTIEL</option>
                    <option value="DIFFUSION_LIMITEE">DIFFUSION LIMITÉE</option>
                    <option value="INTERNE">INTERNE</option>
                    <option value="PUBLIC">PUBLIC</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Accusé de réception requis :</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="chk-ack-req" 
                      checked={distAckRequired} 
                      onChange={(e) => setDistAckRequired(e.target.checked)} 
                    />
                    <label htmlFor="chk-ack-req" className="cursor-pointer">Exiger un accusé de réception signé</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Justification formelle de la diffusion :</label>
                <textarea
                  value={distJustification}
                  onChange={(e) => setDistJustification(e.target.value)}
                  rows={2}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  placeholder="Justifier la nécessité opérationnelle de diffusion..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Restrictions d'usage :</label>
                <input
                  type="text"
                  value={distRestrictions}
                  onChange={(e) => setDistRestrictions(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Planification */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="chk-dist-sched" 
                    checked={distIsScheduled} 
                    onChange={(e) => setDistIsScheduled(e.target.checked)} 
                  />
                  <label htmlFor="chk-dist-sched" className="font-semibold text-slate-300 cursor-pointer">Planifier la diffusion pour une date ultérieure</label>
                </div>

                {distIsScheduled && (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Date et heure d'émission planifiée :</label>
                    <input 
                      type="datetime-local" 
                      value={distScheduledDate} 
                      onChange={(e) => setDistScheduledDate(e.target.value)} 
                      className="p-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-950/60">
              <button
                onClick={() => setIsDistributeModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDistribution}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm"
              >
                {distIsScheduled ? 'Enregistrer la Planification' : 'Valider & Diffuser'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2 : ACCUSÉ DE RÉCEPTION */}
      {/* ========================================================================= */}
      {isAckModalOpen && ackTargetDist && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Enregistrement d'Accusé de Réception</h3>
              </div>
              <button onClick={() => setIsAckModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-2.5 bg-amber-950/20 border border-amber-900/50 rounded-lg text-[11px] text-amber-200">
                ⚠️ <strong>Rappel doctrinal obligatoire :</strong> Un accusé de réception atteste uniquement de la réception de la note et ne signifie <em>en aucun cas</em> que le destinataire approuve ou valide son contenu.
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Décision du destinataire :</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="ackStat" 
                      checked={ackStatus === 'ACCEPTE'} 
                      onChange={() => setAckStatus('ACCEPTE')} 
                    />
                    <span className="text-emerald-400 font-semibold">Accusé Conforme (Reçu)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="ackStat" 
                      checked={ackStatus === 'REFUSE'} 
                      onChange={() => setAckStatus('REFUSE')} 
                    />
                    <span className="text-rose-400 font-semibold">Refus Signifié</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Commentaire / Observation :</label>
                <textarea
                  value={ackComment}
                  onChange={(e) => setAckComment(e.target.value)}
                  rows={2}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Signature logique du destinataire :</label>
                <input
                  type="text"
                  value={ackSignature}
                  onChange={(e) => setAckSignature(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-950/60">
              <button
                onClick={() => setIsAckModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmAck}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
              >
                Signer l'Accusé
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3 : RETRAIT DE DIFFUSION */}
      {/* ========================================================================= */}
      {isWithdrawModalOpen && withdrawTargetDist && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Retrait Contrôlé de Diffusion</h3>
              </div>
              <button onClick={() => setIsWithdrawModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-300">
                Vous êtes sur le point de retirer la diffusion de la note <strong>{withdrawTargetDist.noteId}</strong>.
                Cette action est irréversible et sera consignée dans la piste d'audit.
              </p>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Motif formel du retrait :</label>
                <textarea
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  rows={3}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                  placeholder="Préciser la raison (ex: données périmées, signal contradictoire, révision)..."
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-950/60">
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmWithdraw}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs"
              >
                Confirmer le Retrait
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4 : DÉTAIL D'UNE ARCHIVE SCELLÉE */}
      {/* ========================================================================= */}
      {selectedArchive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Dossier d'Archivage Scellé</h3>
                  <p className="text-[10px] text-cyan-300 font-mono">Archive ID: {selectedArchive.archiveId}</p>
                </div>
              </div>
              <button onClick={() => setSelectedArchive(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="p-3 bg-cyan-950/40 border border-cyan-800 rounded-lg text-cyan-200">
                🔒 <strong>Scellement définitif :</strong> Ce dossier est archivé. Aucune modification directe n'est permise.
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">Résumé de la Note Archivée :</h4>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div><strong>Titre :</strong> {selectedArchive.noteSnapshot.title}</div>
                  <div><strong>Référence :</strong> <span className="font-mono text-cyan-400">{selectedArchive.noteSnapshot.reference}</span></div>
                  <div><strong>Synthèse exécutive :</strong> {selectedArchive.noteSnapshot.executiveSummary}</div>
                  <div><strong>Confiance :</strong> {selectedArchive.noteSnapshot.confidence}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">Versions Consignées ({selectedArchive.versionsSnapshot?.length || 0}) :</h4>
                <div className="space-y-1">
                  {selectedArchive.versionsSnapshot?.map(v => (
                    <div key={v.id} className="p-2 bg-slate-800/60 rounded border border-slate-700/60 flex justify-between">
                      <span>Version #{v.versionNumber} — {v.summary}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{new Date(v.timestamp).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">Historique des Diffusions Rattachées ({selectedArchive.distributionsSnapshot?.length || 0}) :</h4>
                <div className="space-y-1">
                  {selectedArchive.distributionsSnapshot?.map(d => (
                    <div key={d.distributionId} className="p-2 bg-slate-800/60 rounded border border-slate-700/60 flex justify-between items-center">
                      <span>Distribué le {d.distributedAt ? new Date(d.distributedAt).toLocaleDateString() : 'Non émis'}</span>
                      {getStatusBadge(d.status)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/60">
              <button
                onClick={() => setSelectedArchive(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5 : CRÉATION / ÉDITION DESTINATAIRE */}
      {/* ========================================================================= */}
      {isRecipientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">
                {editingRecipient ? 'Modifier Destinataire' : 'Nouveau Destinataire'}
              </h3>
              <button onClick={() => setIsRecipientModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nom complet :</label>
                <input 
                  type="text" 
                  value={recName} 
                  onChange={(e) => setRecName(e.target.value)} 
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  placeholder="ex: Col. Mamadou Diallo"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Organisation :</label>
                <input 
                  type="text" 
                  value={recOrg} 
                  onChange={(e) => setRecOrg(e.target.value)} 
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  placeholder="ex: Centre de Coordination Maritime"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Fonction :</label>
                <input 
                  type="text" 
                  value={recFunction} 
                  onChange={(e) => setRecFunction(e.target.value)} 
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  placeholder="ex: Analyste en Chef"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Niveau d'habilitation :</label>
                <select 
                  value={recLevel} 
                  onChange={(e) => setRecLevel(e.target.value as OsintDistributionLevel)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="RESTREINT">RESTREINT</option>
                  <option value="CONFIDENTIEL">CONFIDENTIEL</option>
                  <option value="DIFFUSION_LIMITEE">DIFFUSION LIMITÉE</option>
                  <option value="INTERNE">INTERNE</option>
                  <option value="PUBLIC">PUBLIC</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Besoin d'en connaître (séparés par virgule) :</label>
                <input 
                  type="text" 
                  value={recNeedToKnow} 
                  onChange={(e) => setRecNeedToKnow(e.target.value)} 
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  placeholder="Sahel, Maritime, Ports"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email :</label>
                <input 
                  type="email" 
                  value={recEmail} 
                  onChange={(e) => setRecEmail(e.target.value)} 
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  placeholder="contact@institution.org"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="chk-rec-demo" 
                  checked={recIsDemo} 
                  onChange={(e) => setRecIsDemo(e.target.checked)} 
                />
                <label htmlFor="chk-rec-demo" className="text-slate-300">Marquer comme destinataire Démo (simulation)</label>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-950/60">
              <button
                onClick={() => setIsRecipientModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveRecipient}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6 : CRÉATION / ÉDITION GROUPE */}
      {/* ========================================================================= */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">
                {editingGroup ? 'Modifier Groupe' : 'Nouveau Groupe de Diffusion'}
              </h3>
              <button onClick={() => setIsGroupModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nom du groupe :</label>
                <input 
                  type="text" 
                  value={grpName} 
                  onChange={(e) => setGrpName(e.target.value)} 
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  placeholder="ex: Groupe Crise Sahel"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description :</label>
                <textarea 
                  value={grpDesc} 
                  onChange={(e) => setGrpDesc(e.target.value)} 
                  rows={2}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  placeholder="Objectif du groupe..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Niveau d'habilitation du groupe :</label>
                <select 
                  value={grpLevel} 
                  onChange={(e) => setGrpLevel(e.target.value as OsintDistributionLevel)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="RESTREINT">RESTREINT</option>
                  <option value="CONFIDENTIEL">CONFIDENTIEL</option>
                  <option value="DIFFUSION_LIMITEE">DIFFUSION LIMITÉE</option>
                  <option value="INTERNE">INTERNE</option>
                  <option value="PUBLIC">PUBLIC</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Sélection des membres :</label>
                <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-950 p-2 rounded border border-slate-800">
                  {recipients.map(r => (
                    <label key={r.recipientId} className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={grpMembers.includes(r.recipientId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGrpMembers([...grpMembers, r.recipientId]);
                          } else {
                            setGrpMembers(grpMembers.filter(id => id !== r.recipientId));
                          }
                        }}
                      />
                      <span>{r.name} ({r.organization})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="chk-grp-demo" 
                  checked={grpIsDemo} 
                  onChange={(e) => setGrpIsDemo(e.target.checked)} 
                />
                <label htmlFor="chk-grp-demo" className="text-slate-300">Marquer comme groupe Démo</label>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-950/60">
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveGroup}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs"
              >
                Enregistrer Groupe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
