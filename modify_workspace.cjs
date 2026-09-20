const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/screens/ProductionCenterScreen.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const search = `      {isWorkspaceOpen && selectedReportId && (
        <ProductionWorkspace
          vm={vm}
          reportId={selectedReportId}
          onClose={handleCloseWorkspace}
        />
      )}`;

const replacement = `      {isWorkspaceOpen && productionMode === 'REPORTS' && selectedReportId && (
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
            setIsWorkspaceOpen(false);
            setSelectedNoteId(null);
            setNotes(intelligenceNoteService.getNotes('ALL'));
          }}
        />
      )}`;

content = content.replace(search, replacement);

// And update the Plus button to handle new Note vs new Report
const btnSearch = `<button \n            onClick={() => handleOpenWorkspace('')}\n            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"\n          >\n            <Plus className="w-4 h-4" />\n            Nouveau Rapport\n          </button>`;

const btnReplacement = `<button 
            onClick={() => {
              if (productionMode === 'REPORTS') {
                handleOpenWorkspace('');
              } else {
                setSelectedNoteId(null);
                setIsWorkspaceOpen(true);
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau {productionMode === 'REPORTS' ? 'Rapport' : 'Note'}
          </button>`;
          
content = content.replace(btnSearch, btnReplacement);
fs.writeFileSync(filePath, content);
