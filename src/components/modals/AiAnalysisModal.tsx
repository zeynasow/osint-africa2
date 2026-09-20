import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  ShieldAlert, 
  Users, 
  Eye, 
  Compass, 
  AlertCircle,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { OsintEvent, Country } from '../../types';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: { event?: OsintEvent; country?: Country } | null;
  onOpenCreateNote?: (presetEvents?: OsintEvent[], presetCountry?: Country) => void;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  target,
  onOpenCreateNote,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'synthese' | 'hypotheses' | 'acteurs' | 'recommandations'>('synthese');

  if (!isOpen || !target) return null;

  const event = target.event;
  const country = target.country;

  const title = event ? event.title : `Évaluation stratégique : ${country?.name}`;
  const subtitle = event 
    ? `${event.countryName} • ${event.category} • ${event.date}`
    : `Surveillance Pays • Niveau ${country?.riskLevel} • Capitale : ${country?.capital}`;

  // Generated structured analysis
  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 600);
  };

  const analysisData = {
    resumeExecutif: event
      ? `L’analyse automatisée des métadonnées de l’incident à ${event.locationName || event.countryName} corrobore une activité anormale. Le recoupement multi-sources (cote Amirauté ${event.admiraltyCode || 'B2'}) confirme une probabilité élevée de perturbation logistique. Les signaux faibles détectés sur les canaux secondaires suggèrent une réorganisation tactique plutôt qu’un incident isolé.`
      : `Le profil géopolitique de ${country?.name} présente une dynamique sécuritaire sous tension continue (${country?.riskLevel}). Les principaux vecteurs de friction se concentrent autour des corridors frontaliers et des zones d’activités extractives. La résilience institutionnelle demeure le facteur clé d'amortissement.`,
    analyseRisques: event
      ? [
          'Risque d’asphyxie logistique sur les axes secondaires reliés.',
          'Effet d’aubaine pour les groupes d’intermédiation illicite et passeurs.',
          'Désinformation rapide sur les réseaux sociaux locaux avant confirmation officielle.',
        ]
      : [
          'Vulnérabilité des flux transfrontaliers non régulés.',
          'Pressions économiques sur les populations rurales dépendantes des axes marchands.',
          'Impact des fluctuations des matières premières sur les équilibres régionaux.',
        ],
    hypotheses: [
      {
        id: 'H1',
        title: 'Hypothèse la plus probable (70%)',
        desc: event 
          ? 'Manœuvre d’intimidation visant à racketter les transporteurs et forcer la négociation de droits de passage.'
          : 'Maintien d’un niveau d’instabilité localisé sans dégradation systémique de l’appareil étatique.',
      },
      {
        id: 'H2',
        title: 'Hypothèse alternative (25%)',
        desc: event
          ? 'Mise en place d’une base logistique avancée pour une opération coordonnée d’envergure sous 72 heures.'
          : 'Effet de contagion sécuritaire depuis un pays limitrophe accentuant la pression sur les forces armées.',
      },
      {
        id: 'H3',
        title: 'Hypothèse de rupture (5%)',
        desc: 'Faux signalement délibéré ou manœuvre de leurre (opérations d’infoguerre pour disperser l’attention).',
      }
    ],
    acteursImpliques: event
      ? [
          { nom: 'Groupes mobiles non conventionnels', role: 'Vecteur de perturbation sur le terrain' },
          { nom: 'Transporteurs et usagers de l’axe', role: 'Victimes d’extorsion et premières sources d’alerte' },
          { nom: 'Forces de sécurité territoriales', role: 'Dispositif de réaction et escorte' },
        ]
      : [
          { nom: 'Autorités gouvernementales centrales', role: 'Régulation et maintien de l’ordre républicain' },
          { nom: 'Organisations communautaires locales', role: 'Médiation et vigie citoyenne' },
          { nom: 'Bailleurs et partenaires internationaux', role: 'Appui technique et aide d’urgence' },
        ],
    indicateursSuivre: [
      'Évolution du prix des denrées alimentaires de base sur les marchés environnants (indicateur de rupture d’approvisionnement).',
      'Activité radar et fréquence des coupures de transpondeurs AIS / balises GSM dans le secteur.',
      'Nombre de mentions sur les canaux Telegram et forums régionaux surveillés (pic d’activité anormal).',
      'Mouvements de relève des patrouilles militaires régulières.',
    ],
    recommandationsVeille: [
      'Activer une surveillance satellitaire haute résolution (Sentinel-2 / Planet) sur le rayon de 30 km.',
      'Recouper les déclarations des témoins locaux avec les comptes rendus des missions humanitaires présentes sur zone.',
      'Créer un sous-dossier d’alerte dédié pour consigner les incidents similaires des 14 derniers jours.',
      'Vérifier la fiabilité des sources secondaires via la matrice de l’Amirauté avant diffusion externe.',
    ],
    fiabiliteEstimee: {
      score: event ? event.confidenceScore : 86,
      admiralty: event ? event.admiraltyCode : 'B2',
      evaluation: 'Données recoupées par plusieurs sources ouvertes indépendantes. Faisceau concordant avec marge d’incertitude résiduelle modérée.',
    }
  };

  const handleCopyText = () => {
    const fullText = `[OSINT AFRICA - RAPPORT D'ANALYSE IA]
${title}
${subtitle}
Date de génération : ${new Date().toISOString()}

1. RÉSUMÉ EXÉCUTIF
${analysisData.resumeExecutif}

2. ANALYSE DES RISQUES
${analysisData.analyseRisques.map((r, i) => `- ${r}`).join('\n')}

3. HYPOTHÈSES ANALYTIQUES
${analysisData.hypotheses.map((h) => `* [${h.id}] ${h.title}: ${h.desc}`).join('\n')}

4. ACTEURS IMPLIQUÉS
${analysisData.acteursImpliques.map((a) => `- ${a.nom} : ${a.role}`).join('\n')}

5. INDICATEURS À SUIVRE
${analysisData.indicateursSuivre.map((ind) => `- ${ind}`).join('\n')}

6. RECOMMANDATIONS DE VEILLE
${analysisData.recommandationsVeille.map((rec) => `- ${rec}`).join('\n')}

7. FIABILITÉ ESTIMÉE
Score : ${analysisData.fiabiliteEstimee.score}% (Cote Amirauté : ${analysisData.fiabiliteEstimee.admiralty})
${analysisData.fiabiliteEstimee.evaluation}

[DONNÉES DE DÉMONSTRATION - OSINT AFRICA PLATFORM]`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportToNote = () => {
    onClose();
    if (onOpenCreateNote) {
      onOpenCreateNote(event ? [event] : [], country || undefined);
    }
  };

  return (
    <div 
      id="modal-ai-analysis-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div 
        id="modal-ai-analysis-container"
        className="w-full max-w-3xl bg-[#0f172a] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0b1120]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Moteur d’Analyse IA OSINT
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-emerald-400" />
                  Gemini Flash Analytique
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 line-clamp-1">
                {title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
              title="Régénérer l'analyse"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subheader Banner */}
        <div className="px-5 py-2.5 bg-amber-500/5 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-300 font-medium">{subtitle}</span>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-400">Fiabilité :</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold">
              {analysisData.fiabiliteEstimee.score}% ({analysisData.fiabiliteEstimee.admiralty})
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#0c1222] px-5 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('synthese')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'synthese'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Synthèse & Risques
          </button>
          <button
            onClick={() => setActiveTab('hypotheses')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'hypotheses'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Hypothèses (3)
          </button>
          <button
            onClick={() => setActiveTab('acteurs')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'acteurs'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Acteurs Impliqués
          </button>
          <button
            onClick={() => setActiveTab('recommandations')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'recommandations'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Indicateurs & Veille
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-200">
          {activeTab === 'synthese' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  1. Résumé Exécutif
                </h3>
                <p className="text-sm leading-relaxed text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  {analysisData.resumeExecutif}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  2. Analyse des Risques Identifiés
                </h3>
                <div className="space-y-2">
                  {analysisData.analyseRisques.map((r, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-300">{r}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-slate-200">Évaluation de la fiabilité des informations</div>
                  <p className="text-slate-400">{analysisData.fiabiliteEstimee.evaluation}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hypotheses' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-1">
                Hypothèses de travail formulées selon la méthodologie d’analyse d’hypothèses concurrentes (ACH) :
              </div>
              {analysisData.hypotheses.map((h) => (
                <div 
                  key={h.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      {h.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {h.title}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {h.desc}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'acteurs' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-1">
                Cartographie des entités et forces interagissant sur ce théâtre :
              </div>
              {analysisData.acteursImpliques.map((act, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-sm font-semibold text-slate-100">{act.nom}</span>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                    {act.role}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'recommandations' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                  <Eye className="w-3.5 h-3.5" />
                  Indicateurs de Surveillance Continue
                </h3>
                <div className="space-y-2">
                  {analysisData.indicateursSuivre.map((ind, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{ind}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                  <Compass className="w-3.5 h-3.5" />
                  Recommandations Opérationnelles de Veille
                </h3>
                <div className="space-y-2">
                  {analysisData.recommandationsVeille.map((rec, i) => (
                    <div key={i} className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs sm:text-sm text-emerald-200 flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-[#0b1120] flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 font-mono">
            DONNÉES DE DÉMONSTRATION • CADRE MÉTHODOLOGIQUE OSINT
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-medium transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'Copié !' : 'Copier texte'}</span>
            </button>

            {onOpenCreateNote && (
              <button
                onClick={handleExportToNote}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                <FileText className="w-4 h-4 text-slate-950" />
                <span>Transformer en Note</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
