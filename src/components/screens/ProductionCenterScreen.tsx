import React, { useState, useMemo } from 'react';
import { 
  FileText, Search, Filter, Plus, Clock, CheckCircle, 
  ChevronRight, FileSearch, ShieldCheck, Send 
} from 'lucide-react';
import { UseOsintViewModelReturn } from '../../viewmodels/useOsintViewModel';
import { OsintIntelligenceReport, ReportStatus, ReportType, ReportPriority, ReportConfidence, TraceabilityStatus } from '../../types';
import { ProductionWorkspace } from '../production/ProductionWorkspace';
import { IntelligenceNoteCard } from '../production/IntelligenceNoteCard';
import { IntelligenceNoteEditor } from '../production/IntelligenceNoteEditor';
import { intelligenceNoteService } from '../../services/intelligenceNoteService';

interface ProductionCenterScreenProps {
  vm: UseOsintViewModelReturn;
}

export const ProductionCenterScreen: React.FC<ProductionCenterScreenProps> = ({ vm }) => {
  const [productionMode, setProductionMode] = useState<'REPORTS' | 'NOTES'>('NOTES');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'TOUS'>('TOUS');
  
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [notes, setNotes] = useState(() => intelligenceNoteService.getNotes('ALL'));

  const reports = vm.reports || [];

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            r.reference.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'TOUS' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reports, searchQuery, statusFilter]);

  const handleOpenWorkspace = (reportId: string) => {
    setSelectedReportId(reportId || null);
    setIsWorkspaceOpen(true);
  };

  const handleCloseWorkspace = () => {
    setIsWorkspaceOpen(false);
    setSelectedReportId(null);
    setSelectedNoteId(null);
  };

  const getStatusColor = (status: ReportStatus | string) => {
    switch(status) {
      case 'VALIDÉ':
      case 'VALIDEE':
      case 'DIFFUSÉ':
      case 'DIFFUSABLE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'EN REVUE':
      case 'EN_REVISION':
      case 'A_VALIDER':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'REJETÉ':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getPriorityColor = (priority: ReportPriority | string) => {
    switch(priority) {
      case 'Critique': return 'text-rose-500';
      case 'Élevée': return 'text-orange-500';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden relative">
      <div className="flex-none p-6 border-b border-slate-800 bg-slate-900/50">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Centre de Production</h1>
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700/50">
              <button 
                onClick={() => setProductionMode('REPORTS')} 
                className={`px-4 py-1.5 text-sm font-medium rounded-md ${productionMode === 'REPORTS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Rapports (LOT 19)
              </button>
              <button 
                onClick={() => setProductionMode('NOTES')} 
                className={`px-4 py-1.5 text-sm font-medium rounded-md ${productionMode === 'NOTES' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Notes OSINT (LOT 31)
              </button>
            </div>
          </div>
          
          <button 
            onClick={() => {
              if (productionMode === 'REPORTS') {
                handleOpenWorkspace('');
              } else {
                setSelectedNoteId(null);
                setIsWorkspaceOpen(true);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle {productionMode === 'REPORTS' ? 'Rapport' : 'Note'}
          </button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Rechercher par titre ou référence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'TOUS')}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="BROUILLON">Brouillons</option>
            <option value="EN REVUE">En revue / En révision</option>
            <option value="VALIDÉ">Validés</option>
            <option value="DIFFUSÉ">Diffusés</option>
            <option value="ARCHIVÉ">Archivés</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {productionMode === 'REPORTS' ? (
          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Aucun rapport trouvé.
              </div>
            ) : (
              filteredReports.map((report) => (
                <div 
                  key={report.id} 
                  onClick={() => handleOpenWorkspace(report.id)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-colors group flex flex-col md:flex-row gap-4 md:items-center justify-between"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {report.reference}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      {report.isDemo && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30">
                          DÉMO
                        </span>
                      )}
                      <span className={`text-xs font-semibold ${getPriorityColor(report.priority)}`}>
                        Priorité: {report.priority}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-1">{report.subtitle || report.executiveSummary}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(report.updatedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileSearch className="w-3.5 h-3.5" />
                        {report.reportType}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className={`w-3.5 h-3.5 ${report.traceabilityStatus === 'TRAÇABILITÉ COMPLÈTE' ? 'text-emerald-400' : 'text-orange-400'}`} />
                        {report.traceabilityStatus === 'TRAÇABILITÉ COMPLÈTE' ? 'Traçabilité OK' : 'Traçabilité Incomplète'}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className={`w-3.5 h-3.5 ${report.completenessScore >= 80 ? 'text-emerald-400' : 'text-slate-400'}`} />
                        Complétude {report.completenessScore}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-none">
                    <div className="flex items-center gap-1 text-sm font-semibold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Ouvrir <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.filter(n => 
                (n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.reference.toLowerCase().includes(searchQuery.toLowerCase())) &&
                (statusFilter === 'TOUS' || n.status === statusFilter)
              ).map(note => (
                <IntelligenceNoteCard 
                  key={note.id} 
                  note={note} 
                  onOpen={(id) => {
                    setSelectedNoteId(id);
                    setIsWorkspaceOpen(true);
                  }} 
                />
              ))}
            </div>
            {notes.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                Aucune note OSINT (LOT 31) trouvée.
              </div>
            )}
          </div>
        )}
      </div>

      {isWorkspaceOpen && productionMode === 'REPORTS' && selectedReportId !== null && (
        <ProductionWorkspace 
          vm={vm} 
          reportId={selectedReportId} 
          onClose={handleCloseWorkspace} 
        />
      )}

      {isWorkspaceOpen && productionMode === 'NOTES' && (
        <IntelligenceNoteEditor
          vm={vm}
          noteId={selectedNoteId}
          onClose={() => {
            handleCloseWorkspace();
            setNotes(intelligenceNoteService.getNotes('ALL'));
          }}
        />
      )}
    </div>
  );
};
