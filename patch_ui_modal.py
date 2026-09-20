import re

with open('src/components/screens/RequirementCenterScreen.tsx', 'r') as f:
    content = f.read()

# Let's find a good place to add the relation inputs in the create requirement modal
# We will insert them after "Périmètre géographique (Codes ISO) *"

inputs = """              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sources liées (IDs, séparés par virgule)</label>
                <input type="text" value={newReqSourceIds} onChange={e => setNewReqSourceIds(e.target.value)} placeholder="SRC-..., SRC-..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Événements liés (IDs, séparés par virgule)</label>
                <input type="text" value={newReqEventIds} onChange={e => setNewReqEventIds(e.target.value)} placeholder="EVT-..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dossiers liés LOT 27 (IDs, séparés par virgule)</label>
                <input type="text" value={newReqCaseIds} onChange={e => setNewReqCaseIds(e.target.value)} placeholder="DOS-..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hypothèses liées LOT 30 (IDs)</label>
                <input type="text" value={newReqHypothesisIds} onChange={e => setNewReqHypothesisIds(e.target.value)} placeholder="HYP-..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes liées LOT 31 (IDs)</label>
                <input type="text" value={newReqAnalysisIds} onChange={e => setNewReqAnalysisIds(e.target.value)} placeholder="NOT-..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Leçons RETEX LOT 33 (IDs)</label>
                <input type="text" value={newReqLessonIds} onChange={e => setNewReqLessonIds(e.target.value)} placeholder="LES-..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200" />
              </div>
"""

# Find the label "Périmètre géographique (Codes ISO) *" and insert after its container
search_str = """                <input
                  type="text"
                  required
                  value={newReqCountries}
                  onChange={e => setNewReqCountries(e.target.value)}
                  placeholder="ML, NE, BF..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>"""

if search_str in content:
    content = content.replace(search_str, search_str + "\n" + inputs)
    with open('src/components/screens/RequirementCenterScreen.tsx', 'w') as f:
        f.write(content)
    print("Inputs added to modal")
else:
    print("Search string not found")

