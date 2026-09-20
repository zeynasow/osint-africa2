import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  Save, 
  Copy, 
  Check, 
  Download, 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Eye, 
  CheckCircle2, 
  Sparkles,
  Printer
} from 'lucide-react';
import { IntelligenceNote, OsintEvent, Country } from '../../types';

interface IntelligenceNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNote: (note: Partial<IntelligenceNote>) => Promise<IntelligenceNote>;
  initialEvents?: OsintEvent[];
  initialCountry?: Country | null;
  existingNote?: IntelligenceNote | null;
}

export const IntelligenceNoteModal: React.FC<IntelligenceNoteModalProps> = ({
  isOpen,
  onClose,
  onSaveNote,
  initialEvents = [],
  initialCountry,
  existingNote,
}) => {
  const primaryEvent = initialEvents[0];
  const defaultCountry = initialCountry?.name || primaryEvent?.countryName || 'Sahel & Afrique de l’Ouest';

  // Form State
  const [title, setTitle] = useState(
    existingNote?.title ||
    (primaryEvent 
      ? `Note de Renseignement : ${primaryEvent.title.replace(' [DONNÉES DE DÉMONSTRATION]', '')}`
      : `Note de Renseignement d'Analyse : ${defaultCountry}`)
  );
  const [object, setObject] = useState(
    existingNote?.object ||
    (primaryEvent
      ? `Évaluation tactique et sécuritaire concernant ${primaryEvent.locationName || primaryEvent.countryName}`
      : `Analyse prospective des vulnérabilités de veille sur ${defaultCountry}`)
  );
  const [author, setAuthor] = useState(existingNote?.author || 'Analyste OSINT - Cellule Veille Afrique');
  const [classification, setClassification] = useState(existingNote?.classification || 'DIFFUSION RESTREINTE');

  // 10 Mandatory Sections
  const [synthese, setSynthese] = useState(
    existingNote?.synthese ||
    (primaryEvent
      ? `Un faisceau de signalements concordants corroboré par l'imagerie civile documente une recrudescence d'activités suspectes sur le secteur de ${primaryEvent.locationName || primaryEvent.countryName}. Le niveau de vigilance est rehaussé à titre préventif.`
      : `Synthèse analytique globale de la situation d'observation établie à partir de sources publiques accréditées.`)
  );

  const [faitsPrincipaux, setFaitsPrincipaux] = useState<string[]>(
    existingNote?.faitsPrincipaux || [
      primaryEvent ? primaryEvent.summary : 'Observation d’un ralentissement des corridors commerciaux terrestres.',
      'Corrélation spatiale d’au moins deux sources ouvertes indépendantes.',
      'Absence de démenti officiel des autorités administratives territoriales à cette heure.'
    ]
  );

  const [chronologie, setChronologie] = useState<{ date: string; description: string }[]>(
    existingNote?.chronologie || [
      { date: '2026-09-08 14:00', description: 'Premiers signaux faibles rapportés par les correspondants locaux.' },
      { date: '2026-09-09 10:30', description: 'Acquisition satellitaire confirmant la concentration de vecteurs mobiles.' },
      { date: '2026-09-10 08:00', description: 'Publication de la note d’alerte préliminaire OSINT AFRICA.' }
    ]
  );

  const [acteurs, setActeurs] = useState<string[]>(
    existingNote?.acteurs || [
      'Forces de défense et de sécurité territoriales',
      'Groupes non conventionnels opérant dans le secteur',
      'Syndicats de transporteurs et commerçants'
    ]
  );

  const [localisation, setLocalisation] = useState(
    existingNote?.localisation ||
    (primaryEvent?.locationName
      ? `${primaryEvent.locationName} (${primaryEvent.coordinates.lat.toFixed(4)}°N, ${primaryEvent.coordinates.lng.toFixed(4)}°E)`
      : `${defaultCountry} - Zones de vigilance frontalière`)
  );

  const [evolution, setEvolution] = useState(
    existingNote?.evolution ||
    'Probable persistance des tensions sur un horizon court (48-72h) sous réserve d’un déploiement d’escortes mobiles coordonnées.'
  );

  const [indicateursSurveillance, setIndicateursSurveillance] = useState<string[]>(
    existingNote?.indicateursSurveillance || [
      'Prix des denrées alimentaires de première nécessité sur les marchés locaux.',
      'Taux d’émission des transpondeurs AIS et balises de transport.',
      'Fréquence des rotations de fret civil sur l’axe.'
    ]
  );

  const [appreciationAnalytique, setAppreciationAnalytique] = useState(
    existingNote?.appreciationAnalytique ||
    `[FAITS SOURCÉS DOCUMENTÉS]
La présence physique de groupes armés et l’entrave aux voies de communication sont attestées par trois flux distincts.

[APPRÉCIATION ANALYTIQUE ET DÉDUCTIONS]
L'intention stratégique observée semble consister en une démonstration de force locale et un chantage financier sur les flux marchands, sans viser une occupation territoriale permanente.`
  );

  const [conclusion, setConclusion] = useState(
    existingNote?.conclusion ||
    'Maintien du statut de surveillance prioritaire. Proposition de mise à jour quotidienne à 18h00 UTC.'
  );

  const [sources, setSources] = useState<string[]>(
    existingNote?.sources || [
      primaryEvent ? primaryEvent.source.name : 'Sources institutionnelles & dépêches ouvertes vérifiées',
      'Observatoire Sahélien Démo / Imagerie Sentinel-2 Fictive',
      'Rapports d’alerte communautaires consolidés'
    ]
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Add / Remove helpers
  const addFait = () => setFaitsPrincipaux([...faitsPrincipaux, 'Nouveau fait sourcé constaté sur le terrain...']);
  const removeFait = (index: number) => setFaitsPrincipaux(faitsPrincipaux.filter((_, i) => i !== index));

  const addChrono = () => setChronologie([...chronologie, { date: '2026-09-10 12:00', description: 'Nouvelle occurrence constatée...' }]);
  const removeChrono = (index: number) => setChronologie(chronologie.filter((_, i) => i !== index));

  const addActeur = () => setActeurs([...acteurs, 'Nouvel acteur identifié']);
  const removeActeur = (index: number) => setActeurs(acteurs.filter((_, i) => i !== index));

  const addIndicateur = () => setIndicateursSurveillance([...indicateursSurveillance, 'Nouvel indicateur de suivi']);
  const removeIndicateur = (index: number) => setIndicateursSurveillance(indicateursSurveillance.filter((_, i) => i !== index));

  const addSource = () => setSources([...sources, 'Nouvelle source ouverte accréditée']);
  const removeSource = (index: number) => setSources(sources.filter((_, i) => i !== index));

  const generateFullText = () => {
    return `================================================================================
RÉPUBLIQUE DU RENSEIGNEMENT OUVERT • OSINT AFRICA
NOTE DE RENSEIGNEMENT • ${classification}
================================================================================
OBJET : ${object}
TITRE : ${title}
AUTEUR : ${author}
DATE : ${new Date().toISOString().replace('T', ' ').slice(0, 16)}
MENTION OBLIGATOIRE : DONNÉES DE DÉMONSTRATION - EXCLUSIVEMENT À USAGE MÉTHODOLOGIQUE

--------------------------------------------------------------------------------
1. SYNTHÈSE EXÉCUTIVE
--------------------------------------------------------------------------------
${synthese}

--------------------------------------------------------------------------------
2. FAITS PRINCIPAUX SOURCÉS
--------------------------------------------------------------------------------
${faitsPrincipaux.map((f, i) => `[2.${i + 1}] ${f}`).join('\n')}

--------------------------------------------------------------------------------
3. CHRONOLOGIE DES ÉVÉNEMENTS
--------------------------------------------------------------------------------
${chronologie.map((c) => `- ${c.date} : ${c.description}`).join('\n')}

--------------------------------------------------------------------------------
4. ACTEURS IMPLIQUÉS
--------------------------------------------------------------------------------
${acteurs.map((a, i) => `* ${a}`).join('\n')}

--------------------------------------------------------------------------------
5. LOCALISATION GÉOGRAPHIQUE
--------------------------------------------------------------------------------
${localisation}

--------------------------------------------------------------------------------
6. ÉVOLUTION PRÉVISIBLE
--------------------------------------------------------------------------------
${evolution}

--------------------------------------------------------------------------------
7. INDICATEURS À SURVEILLER
--------------------------------------------------------------------------------
${indicateursSurveillance.map((ind) => `- [ ] ${ind}`).join('\n')}

--------------------------------------------------------------------------------
8. APPRÉCIATION ANALYTIQUE (DISTINCTION FAITS VS DÉDUCTIONS)
--------------------------------------------------------------------------------
${appreciationAnalytique}

--------------------------------------------------------------------------------
9. CONCLUSION ET RECOMMANDATIONS OPÉRATIONNELLES
--------------------------------------------------------------------------------
${conclusion}

--------------------------------------------------------------------------------
10. SOURCES EXPLOITÉES
--------------------------------------------------------------------------------
${sources.map((s, i) => `[SRC-${i + 1}] ${s}`).join('\n')}

================================================================================
FIN DE LA NOTE • OSINT AFRICA • DONNÉES DE DÉMONSTRATION
================================================================================`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateFullText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const text = generateFullText();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `note-osint-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    await onSaveNote({
      id: existingNote?.id,
      title,
      object,
      author,
      classification,
      synthese,
      faitsPrincipaux,
      chronologie,
      acteurs,
      localisation,
      evolution,
      indicateursSurveillance,
      appreciationAnalytique,
      conclusion,
      sources,
      isDemo: true,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div 
      id="modal-note-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div 
        id="modal-note-container"
        className="w-full max-w-4xl bg-[#0f172a] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0b1120]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Éditeur de Note de Renseignement
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold">
                  {classification}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 line-clamp-1">
                {title || 'Nouvelle Note de Renseignement'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Demo Banner */}
        <div className="px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>DONNÉES DE DÉMONSTRATION — Note éditable selon la structure de renseignement en 10 points.</span>
          </div>
          <span className="font-mono text-[10px] text-amber-400/80 hidden sm:inline">NORME OSINT AFRICA</span>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-slate-200">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] uppercase tracking-wider font-mono text-slate-400">Titre de la Note</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider font-mono text-slate-400">Classification</label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400"
              >
                <option value="DIFFUSION RESTREINTE">DIFFUSION RESTREINTE</option>
                <option value="USAGE INTERNE">USAGE INTERNE</option>
                <option value="CONFIDENTIEL OSINT">CONFIDENTIEL OSINT</option>
                <option value="DOMAINE PUBLIC (TLP:CLEAR)">DOMAINE PUBLIC (TLP:CLEAR)</option>
              </select>
            </div>
            <div className="md:col-span-3 space-y-1">
              <label className="text-[11px] uppercase tracking-wider font-mono text-slate-400">Objet de la Note</label>
              <input
                type="text"
                value={object}
                onChange={(e) => setObject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* 1. Synthèse */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                1. Synthèse Exécutive
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Bref condensé destiné aux décideurs</span>
            </div>
            <textarea
              rows={3}
              value={synthese}
              onChange={(e) => setSynthese(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* 2. Faits principaux */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                2. Faits Principaux (Éléments sourcés vérifiés)
              </label>
              <button
                type="button"
                onClick={addFait}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-mono"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter un fait
              </button>
            </div>
            <div className="space-y-2">
              {faitsPrincipaux.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-mono shrink-0">
                    2.{i + 1}
                  </span>
                  <input
                    type="text"
                    value={f}
                    onChange={(e) => {
                      const updated = [...faitsPrincipaux];
                      updated[i] = e.target.value;
                      setFaitsPrincipaux(updated);
                    }}
                    className="flex-1 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => removeFait(i)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Chronologie */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                3. Chronologie des Faits
              </label>
              <button
                type="button"
                onClick={addChrono}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-mono"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter un jalon
              </button>
            </div>
            <div className="space-y-2">
              {chronologie.map((c, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD HH:mm"
                    value={c.date}
                    onChange={(e) => {
                      const updated = [...chronologie];
                      updated[i].date = e.target.value;
                      setChronologie(updated);
                    }}
                    className="w-full sm:w-40 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-amber-300"
                  />
                  <input
                    type="text"
                    value={c.description}
                    onChange={(e) => {
                      const updated = [...chronologie];
                      updated[i].description = e.target.value;
                      setChronologie(updated);
                    }}
                    className="flex-1 w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeChrono(i)}
                    className="p-1 text-slate-500 hover:text-rose-400 self-end sm:self-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Acteurs & 5. Localisation Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 4. Acteurs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                  4. Acteurs Impliqués
                </label>
                <button
                  type="button"
                  onClick={addActeur}
                  className="flex items-center gap-1 text-[11px] text-amber-400 font-mono"
                >
                  <Plus className="w-3.5 h-3.5" /> Ajouter
                </button>
              </div>
              <div className="space-y-1.5">
                {acteurs.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={a}
                      onChange={(e) => {
                        const updated = [...acteurs];
                        updated[i] = e.target.value;
                        setActeurs(updated);
                      }}
                      className="flex-1 bg-slate-900/90 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeActeur(i)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Localisation */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                5. Localisation Précise
              </label>
              <textarea
                rows={3}
                value={localisation}
                onChange={(e) => setLocalisation(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* 6. Évolution */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
              6. Évolution Prévisible (Scénarios à court et moyen terme)
            </label>
            <textarea
              rows={2}
              value={evolution}
              onChange={(e) => setEvolution(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* 7. Indicateurs à surveiller */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                7. Indicateurs de Déclenchement / Surveillance
              </label>
              <button
                type="button"
                onClick={addIndicateur}
                className="flex items-center gap-1 text-[11px] text-amber-400 font-mono"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter
              </button>
            </div>
            <div className="space-y-1.5">
              {indicateursSurveillance.map((ind, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ind}
                    onChange={(e) => {
                      const updated = [...indicateursSurveillance];
                      updated[i] = e.target.value;
                      setIndicateursSurveillance(updated);
                    }}
                    className="flex-1 bg-slate-900/90 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeIndicateur(i)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 8. Appréciation analytique (FAITS VS DÉDUCTIONS) */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                8. Appréciation Analytique (Règle d’or OSINT : Faits sourcés vs Déductions)
              </label>
            </div>
            <p className="text-[11px] text-amber-200/70 mb-1">
              Distinguer formellement ce qui est prouvé par des sources vérifiées de ce qui relève de l’hypothèse de travail de l’analyste.
            </p>
            <textarea
              rows={4}
              value={appreciationAnalytique}
              onChange={(e) => setAppreciationAnalytique(e.target.value)}
              className="w-full bg-slate-950/80 border border-amber-500/40 rounded-lg p-2.5 text-xs sm:text-sm text-amber-100 font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* 9. Conclusion */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
              9. Conclusion Opérationnelle
            </label>
            <textarea
              rows={2}
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* 10. Sources */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                10. Sources Exploités & Cotes de Fiabilité
              </label>
              <button
                type="button"
                onClick={addSource}
                className="flex items-center gap-1 text-[11px] text-amber-400 font-mono"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter une source
              </button>
            </div>
            <div className="space-y-1.5">
              {sources.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-mono w-12">SRC-{i + 1}</span>
                  <input
                    type="text"
                    value={s}
                    onChange={(e) => {
                      const updated = [...sources];
                      updated[i] = e.target.value;
                      setSources(updated);
                    }}
                    className="flex-1 bg-slate-900/90 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeSource(i)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Note de renseignement enregistrée avec succès dans le référentiel d’analyses !</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-[#0b1120] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors"
              title="Copier le texte intégral formaté"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'Copié !' : 'Copier texte'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors"
              title="Exporter sous format Markdown (.md)"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export .MD</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>Enregistrer la Note</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
