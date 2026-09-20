const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/screens/ProductionCenterScreen.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const listStart = content.indexOf('{/* LIST */}');
const closeDiv = '        </div>\n      </div>\n    </div>\n  );\n};';
const listEnd = content.indexOf(closeDiv) + '        </div>\n'.length;

const listSection = content.substring(listStart, listEnd);

const replacement = `
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
                      <span className={\`text-[10px] font-bold px-2 py-0.5 rounded border \${getStatusColor(report.status)}\`}>
                        {report.status}
                      </span>
                      {report.isDemo && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30">
                          DÉMO
                        </span>
                      )}
                      <span className={\`text-xs font-semibold \${getPriorityColor(report.priority)}\`}>
                        Priorité: {report.priority}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-1">{report.subtitle || report.executiveSummary}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(report.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileSearch className="w-3.5 h-3.5" />
                        {report.reportType}
                      </div>
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {report.classification}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
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
`;

content = content.replace(listSection, replacement);

fs.writeFileSync(filePath, content);
