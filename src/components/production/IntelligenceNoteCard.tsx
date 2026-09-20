import React from 'react';
import { FileText, ShieldCheck, AlertTriangle, User, Calendar, CheckCircle } from 'lucide-react';
import { OsintIntelligenceNote } from '../../types';

interface Props {
  note: OsintIntelligenceNote;
  onOpen: (id: string) => void;
}

export const IntelligenceNoteCard: React.FC<Props> = ({ note, onOpen }) => {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-4 hover:border-slate-600 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-xs text-slate-400 font-mono mb-1">{note.reference} {note.isDemo && <span className="ml-2 text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">DEMO</span>}</div>
          <h3 className="text-lg font-medium text-white">{note.title}</h3>
        </div>
        <div className={`px-2.5 py-1 text-xs rounded-full font-medium border ${
          note.status === 'VALIDEE' || note.status === 'DIFFUSABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
          note.status === 'EN_REVISION' || note.status === 'A_VALIDER' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
          'bg-slate-700 text-slate-300 border-slate-600'
        }`}>
          {note.status}
        </div>
      </div>
      
      <div className="text-sm text-slate-400 mb-4 line-clamp-2">
        {note.executiveSummary || 'Aucune synthèse exécutive...'}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
          <div className="text-xs text-slate-500 mb-1">Qualité Documentaire</div>
          <div className="text-sm text-white font-medium flex items-center gap-1.5">
            <CheckCircle className={`w-3.5 h-3.5 ${note.qualityScore.score > 80 ? 'text-emerald-400' : 'text-amber-400'}`} />
            {note.qualityScore.score}/100
          </div>
        </div>
        
        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
          <div className="text-xs text-slate-500 mb-1">Confiance</div>
          <div className="text-sm text-white font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            {note.confidence}
          </div>
        </div>
        
        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
          <div className="text-xs text-slate-500 mb-1">Sources indép.</div>
          <div className="text-sm text-white font-medium">
            {note.independentSourceCount} / {note.sourceCount}
          </div>
        </div>
        
        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
          <div className="text-xs text-slate-500 mb-1">Lacunes</div>
          <div className="text-sm text-white font-medium flex items-center gap-1.5">
            {note.gapCount > 0 && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
            {note.gapCount} non résolue(s)
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {note.analystId}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(note.updatedAt).toLocaleDateString()}
          </div>
        </div>
        
        <button 
          onClick={() => onOpen(note.id)}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          OUVRIR
        </button>
      </div>
    </div>
  );
};
