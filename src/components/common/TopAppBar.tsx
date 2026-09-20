import React from 'react';
import { 
  Globe2, 
  Search, 
  Bell, 
  FolderGit2, 
  Users2,
  Database,
  Smartphone, 
  Maximize2, 
  Code2,
  FileText,
  Network,
  Layers,
  FileCheck,
  ShieldCheck,
  Server,
  Scale,
  Cpu,
  Timer,
  Target,
  Send,
  RotateCcw,
  Compass,
  Brain,
  GitGraph,
  Activity,
  FileOutput,
  Shield,
  Radio
} from 'lucide-react';
import { ScreenId } from '../../types';

interface TopAppBarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  unreadAlertsCount: number;
  deviceViewMode: 'phone' | 'fluid';
  onToggleDeviceMode: () => void;
  onOpenComposeCode: () => void;
  onOpenCreateNote?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentScreen,
  onNavigate,
  unreadAlertsCount,
  deviceViewMode,
  onToggleDeviceMode,
  onOpenComposeCode,
  onOpenCreateNote,
}) => {
  return (
    <header 
      id="top-app-bar" 
      className="sticky top-0 z-40 bg-[#0d121d]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 text-slate-100"
    >
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Brand & Identity (Gratuit, aucun badge PRO) */}
        <div 
          onClick={() => onNavigate('accueil')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-emerald-500/10 to-slate-900 border border-amber-500/40 shadow-inner group-hover:border-amber-400/70 transition-all">
            <Globe2 className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0d121d] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-wider text-slate-100 uppercase">
                OSINT <span className="text-amber-400">AFRICA</span>
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-semibold">
                PLATEFORME LIBRE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
              Veille & analyse de l’information publique en Afrique
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Shortcuts */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Create Note Quick Action */}
          {onOpenCreateNote && (
            <button
              id="btn-top-create-note"
              onClick={onOpenCreateNote}
              title="Créer une note de renseignement structurée"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-medium transition-colors"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Créer une note</span>
            </button>
          )}

          {/* Sources Section */}
          <button
            id="btn-top-sources"
            onClick={() => onNavigate('sources')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'sources'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Répertoire des sources OSINT"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Sources</span>
          </button>

          {/* Acteurs Section */}
          <button
            id="btn-top-acteurs"
            onClick={() => onNavigate('acteurs')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'acteurs'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Cartographie des acteurs"
          >
            <Users2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Acteurs</span>
          </button>

          {/* Dossiers Section */}
          <button
            id="btn-top-dossiers"
            onClick={() => onNavigate('dossiers')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'dossiers'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Dossiers d’analyse thématiques"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Dossiers</span>
          </button>

          {/* Centre des Hypothèses (LOT 30) */}
          <button
            id="btn-top-hypotheses"
            onClick={() => onNavigate('hypotheses')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'hypotheses'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre d'Évaluation des Hypothèses (LOT 30)"
          >
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Hypothèses</span>
          </button>

          {/* Centre de Corrélation & Signaux Faibles Section */}
          <button
            id="btn-top-correlation"
            onClick={() => onNavigate('correlation')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'correlation'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Corrélation & Signaux Faibles"
          >
            <Network className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Corrélations</span>
          </button>

          {/* Centre de Fusion du Renseignement OSINT (LOT 18) */}
          <button
            id="btn-top-fusion"
            onClick={() => onNavigate('fusion')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'fusion'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm shadow-cyan-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Fusion du Renseignement OSINT"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Fusion</span>
          </button>

          {/* Centre de Production (LOT 19) */}
          <button
            id="btn-top-production"
            onClick={() => onNavigate('production')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'production'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold shadow-sm shadow-indigo-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Production"
          >
            <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Renseignement</span>
          </button>

          {/* Centre de Diffusion & Suivi (LOT 32) */}
          <button
            id="btn-top-diffusion"
            onClick={() => onNavigate('diffusion')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'diffusion'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold shadow-sm shadow-blue-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Diffusion Contrôlée & Suivi (LOT 32)"
          >
            <Send className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Diffusion</span>
          </button>

          {/* Centre de Retour d'Expérience & Capitalisation (LOT 33) */}
          <button
            id="btn-top-feedback"
            onClick={() => onNavigate('feedback')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'feedback'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 font-semibold shadow-sm shadow-purple-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Retour d'Expérience, Capitalisation et Évaluation Post-Diffusion (LOT 33)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Retex</span>
          </button>

          {/* Centre des Besoins en Renseignement (LOT 34) */}
          <button
            id="btn-top-requirements"
            onClick={() => onNavigate('requirements')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'requirements'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm shadow-amber-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre des Besoins en Renseignement, Questions Prioritaires et Planification de Veille (LOT 34)"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Besoins</span>
          </button>

          {/* Centre de Planification de la Recherche et de la Veille OSINT (LOT 35) */}
          <button
            id="btn-top-planning"
            onClick={() => onNavigate('research-planning')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'research-planning'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm shadow-cyan-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Planification de la Recherche et de la Veille OSINT (LOT 35)"
          >
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Planification</span>
          </button>

          {/* Centre de Vérification & Qualification (LOT 36) */}
          <button
            id="btn-top-verification-center"
            onClick={() => onNavigate('verification-center')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'verification-center'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold shadow-sm shadow-purple-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Vérification et de Qualification des Résultats OSINT (LOT 36)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Vérification</span>
          </button>

          {/* Centre d'Évaluation Analytique & Raisonnement Structuré (LOT 37) */}
          <button
            id="btn-top-analytical-assessment"
            onClick={() => onNavigate('analytical-assessment')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'analytical-assessment'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm shadow-amber-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre d'Évaluation Analytique et de Raisonnement Structuré (LOT 37)"
          >
            <Brain className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Évaluation</span>
          </button>
          
          {/* Centre d'Anticipation, de Scénarios et d'Indicateurs Précurseurs (LOT 38) */}
          <button
            id="btn-top-prospective-scenario"
            onClick={() => onNavigate('prospective-scenario')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'prospective-scenario'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm shadow-amber-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre d'Anticipation, de Scénarios et d'Indicateurs Précurseurs (LOT 38)"
          >
            <GitGraph className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Prospective</span>
          </button>
          
          {/* Centre de Suivi des Indicateurs, Réévaluation et Signaux d'Évolution (LOT 39) */}
          <button
            id="btn-top-indicator-monitoring"
            onClick={() => onNavigate('indicator-monitoring')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'indicator-monitoring'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm shadow-amber-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Suivi des Indicateurs, Réévaluation et Signaux d'Évolution (LOT 39)"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Monitoring</span>
          </button>
          
          {/* Centre de Synthèse Situationnelle (LOT 40) */}
          <button
            id="btn-top-situation-synthesis"
            onClick={() => onNavigate('situation-synthesis')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'situation-synthesis'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm shadow-amber-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Synthèse Situationnelle et de Situation Courante (LOT 40)"
          >
            <FileOutput className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Synthèse</span>
          </button>
          
          {/* Centre de Pilotage Global (LOT 41) */}
          <button
            id="btn-top-governance-dashboard"
            onClick={() => onNavigate('governance-dashboard')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'governance-dashboard'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm shadow-amber-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Pilotage Global et de Gouvernance (LOT 41)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Gouvernance</span>
          </button>

          {/* Centre de Sécurité & Contrôle d'Accès (LOT 42) */}
          <button
            id="btn-top-security-center"
            onClick={() => onNavigate('security-center')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'security-center'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold shadow-sm shadow-indigo-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Sécurité, Contrôle d'Accès et Gouvernance des Utilisateurs (LOT 42)"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Sécurité</span>
          </button>

          {/* Centre Opérationnel de Gestion de Crise & Conduite (LOT 43) */}
          <button
            id="btn-top-crisis-center"
            onClick={() => onNavigate('crisis-center')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'crisis-center'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold shadow-sm shadow-rose-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre Opérationnel de Gestion de Crise et Conduite des Opérations (LOT 43)"
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">COGC</span>
          </button>

          {/* Centre de Coordination Interservices et de Suivi Opérationnel (LOT 44) */}
          <button
            id="btn-top-coordination-center"
            onClick={() => onNavigate('coordination-center')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'coordination-center'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold shadow-sm shadow-teal-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Coordination Interservices et de Suivi Opérationnel (CCISO - LOT 44)"
          >
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">CCISO</span>
          </button>
          
          {/* Centre de Qualité (LOT 20) */}
          <button
            id="btn-top-qualite"
            onClick={() => onNavigate('qualite')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'qualite'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Qualité"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Qualité</span>
          </button>

          {/* Centre des Connecteurs & Ingestion (LOT 21) */}
          <button
            id="btn-top-connecteurs"
            onClick={() => onNavigate('connecteurs')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'connecteurs'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Gestion des Connecteurs & Ingestion OSINT (LOT 21)"
          >
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Connecteurs</span>
          </button>

          {/* Centre de Gouvernance & Orchestration (LOT 22) */}
          <button
            id="btn-top-gouvernance"
            onClick={() => onNavigate('gouvernance')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'gouvernance'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm shadow-amber-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Configuration, Gouvernance et Orchestration des Sources (LOT 22)"
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Gouvernance</span>
          </button>

          {/* Centre de Collecte & Ingestion Sandbox (LOT 23-A) */}
          <button
            id="btn-top-collecte"
            onClick={() => onNavigate('collecte')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'collecte'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold shadow-sm shadow-purple-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Collecte et d'Ingestion OSINT - Sandbox Locale (LOT 23-A)"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Collecte</span>
          </button>

          {/* Centre de Veille Continue Contrôlée (LOT 24) */}
          <button
            id="btn-top-veille"
            onClick={() => onNavigate('veille')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'veille'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm shadow-amber-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Veille Continue & Orchestration (LOT 24)"
          >
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Veille</span>
          </button>

          {/* Centre des Signaux Faibles (LOT 26) */}
          <button
            id="btn-top-signaux"
            onClick={() => onNavigate('signaux')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'signaux'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold shadow-sm shadow-rose-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre des Signaux Faibles (LOT 26)"
          >
            <Network className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Signaux</span>
          </button>

          {/* Centre de Qualification & Gestion des Alertes (LOT 25) */}
          <button
            id="btn-top-alert-center"
            onClick={() => onNavigate('alertes')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              currentScreen === 'alertes'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm shadow-amber-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Centre de Qualification et Gestion des Alertes (LOT 25)"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Alertes</span>
            {unreadAlertsCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-rose-600 text-[10px] font-bold text-white">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Quick Search */}
          <button
            id="btn-top-search"
            onClick={() => onNavigate('recherche')}
            className={`p-2 rounded-lg transition-colors ${
              currentScreen === 'recherche'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Recherche générale OSINT"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Alerts Bell */}
          <button
            id="btn-top-alerts"
            onClick={() => onNavigate('alertes')}
            className={`p-2 rounded-lg transition-colors relative ${
              currentScreen === 'alertes'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Flux des alertes critiques"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-[10px] font-bold text-white shadow">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Kotlin / Jetpack Compose code viewer */}
          <button
            id="btn-open-compose-code"
            onClick={onOpenComposeCode}
            title="Consulter le code Android natif Jetpack Compose (Kotlin)"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700 text-xs text-amber-300 font-mono transition-colors"
          >
            <Code2 className="w-4 h-4 text-amber-400" />
            <span className="hidden xl:inline font-sans text-[11px]">Compose</span>
          </button>

          {/* Device viewport toggle */}
          <button
            id="btn-toggle-device-mode"
            onClick={onToggleDeviceMode}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors hidden sm:flex items-center"
            title={
              deviceViewMode === 'phone'
                ? 'Passer en affichage fluide / plein écran'
                : 'Simuler le ratio smartphone Android (Pixel)'
            }
          >
            {deviceViewMode === 'phone' ? (
              <Maximize2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Smartphone className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Profile Shortcut */}
          <button
            id="btn-top-profile"
            onClick={() => onNavigate('profil')}
            className={`flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-lg border transition-colors ${
              currentScreen === 'profil'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
            title="Espace Analyste & Paramètres"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-[10px] font-bold text-slate-950">
              OA
            </div>
            <span className="text-xs font-medium hidden lg:inline">Analyste</span>
          </button>
        </div>
      </div>
    </header>
  );
};
