import React, { useState, useEffect } from 'react';
import { Briefcase, Activity, AlertTriangle, Clock, Search, Filter, Eye } from 'lucide-react';
import { OsintCase, OsintCaseStatus } from '../../types';
import { CaseManagementService } from '../../services/caseManagementService';
import { CaseDetailModal } from '../modals/CaseDetailModal';

export const CaseManagementScreen: React.FC = () => {
  const [cases, setCases] = useState<OsintCase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedCase, setSelectedCase] = useState<OsintCase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = () => {
    setCases(CaseManagementService.getCases());
  };

  const handleCreateCase = () => {
    const newCase: OsintCase = {
      id: `case-${Date.now()}`,
      title: 'Nouveau Dossier d\'Investigation',
      description: 'Dossier créé manuellement.',
      status: 'DRAFT',
      priority: 'LOW',
      category: 'INVESTIGATION',
      alertIds: [],
      signalIds: [],
      eventIds: [],
      indicatorIds: [],
      actorIds: [],
      evidenceIds: [],
      tasks: [],
      milestones: [],
      assessments: [],
      contradictions: [],
      intelligenceGaps: [],
      team: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false,
      provenance: 'Analyst'
    };
    CaseManagementService.saveCase(newCase, 'Current_User', 'Création initiale');
    loadCases();
  };

  const getActiveCasesCount = () => {
    return cases.filter(c => ['OPEN', 'ACTIVE', 'UNDER_REVIEW'].includes(c.status)).length;
  };

  const getHighPriorityCount = () => {
    return cases.filter(c => ['HIGH', 'CRITICAL'].includes(c.priority)).length;
  };

  const getAverageAgeDays = () => {
    if (cases.length === 0) return 0;
    const totalAge = cases.reduce((acc, c) => {
      const start = new Date(c.createdAt).getTime();
      const end = c.closedAt ? new Date(c.closedAt).getTime() : new Date().getTime();
      return acc + (end - start);
    }, 0);
    return Math.round(totalAge / cases.length / (1000 * 60 * 60 * 24));
  };

  const getOverdueTasksCount = () => {
    let overdue = 0;
    const now = new Date().getTime();
    cases.forEach(c => {
      c.tasks.forEach(t => {
        if (t.status !== 'DONE' && t.status !== 'CANCELLED' && t.dueDate) {
          if (new Date(t.dueDate).getTime() < now) {
            overdue++;
          }
        }
      });
    });
    return overdue;
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'ACTIVE':
      case 'OPEN': return 'bg-green-100 text-green-800';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED': return 'bg-orange-100 text-orange-800';
      case 'CLOSED':
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch(priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600" />
            Centre de Gestion des Dossiers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Supervision, investigations et qualification des situations OSINT
          </p>
        </div>
        <button 
          onClick={handleCreateCase}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
        >
          <Briefcase className="w-4 h-4" />
          Nouveau Dossier
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Dossiers Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{getActiveCasesCount()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Haute Priorité / Critiques</p>
              <p className="text-2xl font-bold text-gray-900">{getHighPriorityCount()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Âge Moyen</p>
              <p className="text-2xl font-bold text-gray-900">{getAverageAgeDays()} <span className="text-sm font-normal text-gray-500">jours</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Tâches en retard</p>
              <p className="text-2xl font-bold text-gray-900">{getOverdueTasksCount()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par ID ou Titre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="OPEN">Ouvert</option>
              <option value="ACTIVE">Actif</option>
              <option value="UNDER_REVIEW">En révision</option>
              <option value="SUSPENDED">Suspendu</option>
              <option value="CLOSED">Fermé</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">ID Dossier</th>
                <th className="px-6 py-3">Titre & Catégorie</th>
                <th className="px-6 py-3">Priorité</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3">Équipe</th>
                <th className="px-6 py-3">Dernière maj.</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCases.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {c.id}
                    </span>
                    {c.isDemo && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800">
                        DEMO
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{c.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{c.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(c.priority)}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2 overflow-hidden">
                      {c.team && c.team.length > 0 ? (
                        c.team.map((member, i) => (
                          <div key={i} className="inline-block h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600">
                            {member.substring(0, 2).toUpperCase()}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">Non assigné</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setSelectedCase(c);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Détail du dossier"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Aucun dossier ne correspond à vos critères de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <CaseDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        osintCase={selectedCase}
      />
    </div>
  );
};
