import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Globe2,
  Radio,
  Building2,
  Newspaper,
  Landmark,
  Compass,
  Rss,
  Satellite,
  Power,
  RotateCcw,
  Languages,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpDown,
  MapPin,
  Wifi,
  WifiOff,
  Check,
  Zap,
  Ship,
  Shield,
  Scale,
  BarChart3,
  Tv,
  Pickaxe,
  Car,
  Plane
} from 'lucide-react';
import { OsintSourceItem, CanonicalSourceType, SourceOperationalStatus } from '../../types';
import { DemoWatermarkBanner } from '../common/DemoWatermarkBanner';
import { SourceDetailModal } from '../modals/SourceDetailModal';

interface SourcesScreenProps {
  sources: OsintSourceItem[];
  onSelectSource?: (source: OsintSourceItem) => void;
  onUpdateSource?: (id: string, updates: Partial<OsintSourceItem>) => void;
  onToggleActive?: (id: string) => void;
}

// 8 Types de sources canoniques requis
const CANONICAL_TYPES: CanonicalSourceType[] = [
  'Institutionnelle',
  'Gouvernementale',
  'Média',
  'Organisation internationale',
  'ONG',
  'Think tank',
  'RSS',
  'Source spécialisée',
];

const SOURCE_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Institutionnelle': Building2,
  'Sources institutionnelles': Building2,
  'Sécurité / Institutionnelle': Shield,
  'Sécurité civile / Institutionnelle': Shield,
  'Institutionnelle / Statistiques': BarChart3,
  'Institutionnelle / Météorologie / Aviation': Building2,
  'Maritime / Sécurité / Institutionnelle': Shield,
  'Économie / Finance / Institutionnelle': Building2,
  'Gouvernementale': Landmark,
  'Sources gouvernementales': Landmark,
  'Gouvernementale / Justice': Scale,
  'Justice / Gouvernementale': Scale,
  'Justice / Services numériques publics': Scale,
  'Gouvernementale / Douanes / Sécurité économique': Landmark,
  'Douanes / Gouvernementale / Économie': Landmark,
  'Sécurité / Gouvernementale': Shield,
  'Mines / Gouvernementale / Économie': Pickaxe,
  'Transport / Infrastructure / Gouvernementale': Car,
  'Gouvernementale / Institutionnelle': Landmark,
  'Gouvernementale / Maritime / Pêche': Ship,
  'Gouvernementale / Numérique / Administration': Landmark,
  'Recherche / Océanographie / Pêche': Compass,
  'Média': Newspaper,
  'Médias': Newspaper,
  'Média / Agence de presse': Newspaper,
  'Média public': Tv,
  'Média public / Agence de presse': Newspaper,
  'Organisation internationale': Globe2,
  'Organisations internationales': Globe2,
  'ONG': Compass,
  'Think tank': Radio,
  'Think tanks': Radio,
  'RSS': Rss,
  'Source spécialisée': Satellite,
  'Sources spécialisées': Satellite,
  'Données satellitaires / Observation de la Terre': Satellite,
  'Open Data / Données statistiques': Database,
  'Statistiques / Institutionnelle': BarChart3,
  'Énergie / Entreprise publique': Zap,
  'Infrastructure / Maritime': Ship,
  'Défense': Shield,
  'Sécurité': Shield,
  'Sécurité / Gendarmerie': Shield,
  'Sécurité intérieure': Shield,
  'Immigration / Frontières': Shield,
  'Justice / Droits humains': Scale,
  'Justice / Gouvernance': Scale,
  'Média institutionnel': Tv,
  'Statistiques': BarChart3,
  'Douanes / Fiscalité': Landmark,
  'Douanes / Frontières': Landmark,
  'Maritime / Infrastructures': Ship,
  'Maritime / Sécurité': Ship,
  'Aviation / Sécurité': Plane,
  'Économie / Finance': Building2,
  'Télécommunications / Numérique': Radio,
  'Information gouvernementale': Newspaper,
  'Administration publique': Landmark,
  'Sécurité / Administration': Shield,
  'Finance / Économie': Building2,
  'Économie / Planification': Building2,
  'Maritime / Pêche': Ship,
  'Transport / Communications': Car,
  'Élections / Gouvernance': Scale,
  'Finance / Statistiques régionales': Globe2,
  'Gouvernement / Information institutionnelle': Newspaper,
  'Gouvernement / Primature': Landmark,
  'Police / Sécurité': Shield,
  'Gendarmerie / Sécurité': Shield,
  'Défense / Forces armées': Shield,
  'Statistiques / Données économiques et sociales': BarChart3,
  'Douanes / Commerce / Frontières': Landmark,
  'Agence de presse / Actualité': Newspaper,
  'Médias / Régulation / Désinformation': Tv,
  'Aviation civile / Transport': Plane,
  'Identification / Documents officiels': Landmark,
  'Administration publique / Services officiels': Landmark,
  'Sécurité intérieure / Administration territoriale': Shield,
  'Agence de presse / Actualité nationale': Newspaper,
  'Économie / Finances publiques / Budget': Landmark,
  'Mines / Ressources naturelles': Pickaxe,
  'Police / Sécurité intérieure': Shield,
  'Sécurité / Ordre public / Protection des populations': Shield,
  'Médias / Communication / Régulation': Tv,
  'Protection des données / Numérique / Gouvernance': Database,
  'Aviation civile / Transport / Sécurité aérienne': Plane,
  'Transport / Commerce / Corridors logistiques': Car,
  'Sécurité / Administration territoriale': Shield,
  'Finances publiques / Budget / Économie': BarChart3,
  'Statistiques / Économie / Démographie': BarChart3,
  'Médias / Audiovisuel / Information publique': Tv,
  'Textes juridiques / Actes officiels': Scale,
  'Finances publiques / Audit / Contrôle': BarChart3,
  'Droits humains / Gouvernance': Scale,
  'Information publique / Actualité': Newspaper,
  'Données / Statistiques / Planification': Database,
  'Immigration / Administration / Mobilité': Shield,
  'Diplomatie / Affaires étrangères': Landmark,
  'Éducation / Recherche / Formation': Building2,
  'Administration publique / Formation': Landmark,
};

// 4 Statuts d'exploitation requis
const OPERATIONAL_STATUSES: { id: SourceOperationalStatus; label: string }[] = [
  { id: 'Démonstration', label: 'Démonstration' },
  { id: 'Réelle / non connectée', label: 'Réelle / non connectée' },
  { id: 'Réelle / connectée', label: 'Réelle / connectée' },
  { id: 'Inactive', label: 'Inactive' },
];

// Normalisation des types pour compatibilité totale (ex: 'Médias' -> 'Média')
const normalizeSourceType = (type: string): string => {
  if (type === 'Sources institutionnelles' || type === 'Sécurité / Institutionnelle' || type === 'Sécurité civile / Institutionnelle' || type === 'Institutionnelle / Statistiques' || type === 'Statistiques / Institutionnelle' || type === 'Institutionnelle / Météorologie / Aviation' || type === 'Maritime / Sécurité / Institutionnelle' || type === 'Économie / Finance / Institutionnelle' || type === 'Statistiques' || type === 'Économie / Finance' || type === 'Administration publique' || type === 'Élections / Gouvernance' || type === 'Administration publique / Services officiels') return 'Institutionnelle';
  if (type === 'Sources gouvernementales' || type === 'Gouvernementale / Justice' || type === 'Justice / Gouvernementale' || type === 'Gouvernementale / Douanes / Sécurité économique' || type === 'Douanes / Gouvernementale / Économie' || type === 'Sécurité / Gouvernementale' || type === 'Mines / Gouvernementale / Économie' || type === 'Transport / Infrastructure / Gouvernementale' || type === 'Gouvernementale / Institutionnelle' || type === 'Gouvernementale / Maritime / Pêche' || type === 'Gouvernementale / Numérique / Administration' || type === 'Défense' || type === 'Sécurité' || type === 'Sécurité / Gendarmerie' || type === 'Sécurité intérieure' || type === 'Immigration / Frontières' || type === 'Justice / Gouvernance' || type === 'Justice / Droits humains' || type === 'Douanes / Fiscalité' || type === 'Douanes / Frontières' || type === 'Sécurité / Administration' || type === 'Finance / Économie' || type === 'Économie / Planification' || type === 'Maritime / Pêche' || type === 'Transport / Communications' || type === 'Gouvernement / Information institutionnelle' || type === 'Gouvernement / Primature' || type === 'Police / Sécurité' || type === 'Gendarmerie / Sécurité' || type === 'Défense / Forces armées' || type === 'Douanes / Commerce / Frontières' || type === 'Sécurité intérieure / Administration territoriale' || type === 'Économie / Finances publiques / Budget' || type === 'Mines / Ressources naturelles' || type === 'Police / Sécurité intérieure' || type === 'Sécurité / Ordre public / Protection des populations' || type === 'Médias / Communication / Régulation' || type === 'Protection des données / Numérique / Gouvernance' || type === 'Gouvernement / Primature' || type === 'Sécurité / Administration territoriale' || type === 'Finances publiques / Budget / Économie' || type === 'Immigration / Administration / Mobilité' || type === 'Diplomatie / Affaires étrangères') return 'Gouvernementale';
  if (type === 'Médias' || type === 'Média / Agence de presse' || type === 'Média public' || type === 'Média public / Agence de presse' || type === 'Média institutionnel' || type === 'Information gouvernementale' || type === 'Agence de presse / Actualité' || type === 'Médias / Régulation / Désinformation' || type === 'Agence de presse / Actualité nationale' || type === 'Médias / Audiovisuel / Information publique' || type === 'Information publique / Actualité') return 'Média';
  if (type === 'Organisations internationales' || type === 'Finance / Statistiques régionales') return 'Organisation internationale';
  if (type === 'Think tanks') return 'Think tank';
  if (type === 'Sources spécialisées' || type === 'Données satellitaires / Observation de la Terre' || type === 'Open Data / Données statistiques' || type === 'Énergie / Entreprise publique' || type === 'Infrastructure / Maritime' || type === 'Justice / Services numériques publics' || type === 'Recherche / Océanographie / Pêche' || type === 'Maritime / Infrastructures' || type === 'Maritime / Sécurité' || type === 'Aviation / Sécurité' || type === 'Télécommunications / Numérique' || type === 'Statistiques / Données économiques et sociales' || type === 'Aviation civile / Transport' || type === 'Identification / Documents officiels' || type === 'Aviation civile / Transport / Sécurité aérienne' || type === 'Transport / Commerce / Corridors logistiques' || type === 'Statistiques / Économie / Démographie' || type === 'Textes juridiques / Actes officiels' || type === 'Finances publiques / Audit / Contrôle' || type === 'Droits humains / Gouvernance' || type === 'Données / Statistiques / Planification' || type === 'Éducation / Recherche / Formation' || type === 'Administration publique / Formation') return 'Source spécialisée';
  return type;
};

export const SourcesScreen: React.FC<SourcesScreenProps> = ({
  sources,
  onSelectSource,
  onUpdateSource,
  onToggleActive,
}) => {
  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedReliability, setSelectedReliability] = useState<string>('ALL');
  const [activeOnly, setActiveOnly] = useState<boolean>(false);

  // Fiche détaillée sélectionnée
  const [detailModalSource, setDetailModalSource] = useState<OsintSourceItem | null>(null);

  // Statistiques d'ensemble calculées dynamiquement sans inventer de compteur
  const stats = useMemo(() => {
    const total = sources.length;
    const realNotConnectedCount = sources.filter((s) => s.status === 'Réelle / non connectée').length;
    const realConnectedCount = sources.filter((s) => s.status === 'Réelle / connectée').length;
    const demoCount = sources.filter(
      (s) => s.status === 'Démonstration' || (!s.isReal && s.status !== 'Inactive' && s.status !== 'Inactif' && s.isActive)
    ).length;
    const inactiveCount = sources.filter(
      (s) => s.status === 'Inactive' || s.status === 'Inactif' || !s.isActive
    ).length;
    const realCount = sources.filter((s) => s.isReal).length;
    const activeCount = sources.filter(
      (s) => s.isActive && s.status !== 'Inactive' && s.status !== 'Inactif'
    ).length;

    return {
      total,
      realCount,
      demoCount,
      realNotConnectedCount,
      realConnectedCount,
      inactiveCount,
      activeCount,
    };
  }, [sources]);

  // Liste dynamique des pays pour le filtre
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    sources.forEach((s) => {
      if (s.country) set.add(s.country);
    });
    return Array.from(set).sort();
  }, [sources]);

  // Liste dynamique des régions pour le filtre
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    sources.forEach((s) => {
      if (s.region) set.add(s.region);
    });
    return Array.from(set).sort();
  }, [sources]);

  // Liste dynamique des langues pour le filtre
  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    sources.forEach((s) => {
      if (s.language) {
        s.language.split('/').forEach((part) => set.add(part.trim()));
      }
    });
    return Array.from(set).sort();
  }, [sources]);

  // Filtrage combiné : Recherche par nom + Authenticité + Pays + Région + Type + Langue + Statut + Fiabilité
  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      // 1. Recherche par nom (et description / mots-clés)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesDesc = s.description.toLowerCase().includes(q);
        const matchesCountry = s.country.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCountry) return false;
      }

      // 2. Filtre Statut / Distinction (Toutes, Démonstration, Réelles / non connectées, Réelles / connectées, Inactives)
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'Démonstration') {
          const isDemo = !s.isReal && s.status !== 'Inactive' && s.status !== 'Inactif' && s.isActive;
          if (!isDemo && s.status !== 'Démonstration') return false;
        } else if (selectedStatus === 'Réelles / non connectées' || selectedStatus === 'Réelle / non connectée') {
          if (s.status !== 'Réelle / non connectée') return false;
        } else if (selectedStatus === 'Réelles / connectées' || selectedStatus === 'Réelle / connectée') {
          if (s.status !== 'Réelle / connectée') return false;
        } else if (selectedStatus === 'Inactive' || selectedStatus === 'Inactives') {
          if (s.status !== 'Inactive' && s.status !== 'Inactif' && s.isActive) return false;
        } else if (s.status !== selectedStatus) {
          return false;
        }
      }

      // 3. Filtre Pays
      if (selectedCountry !== 'ALL' && s.country !== selectedCountry) {
        return false;
      }

      // 4. Filtre Région
      if (selectedRegion !== 'ALL' && s.region !== selectedRegion) {
        return false;
      }

      // 5. Filtre Type
      if (selectedType !== 'ALL') {
        const normItemType = normalizeSourceType(s.type);
        if (normItemType !== selectedType && s.type !== selectedType) {
          return false;
        }
      }

      // 6. Filtre Langue
      if (selectedLanguage !== 'ALL') {
        if (!s.language.toLowerCase().includes(selectedLanguage.toLowerCase())) {
          return false;
        }
      }

      // 7. Filtre Fiabilité
      if (selectedReliability !== 'ALL') {
        const rel = s.reliability || s.reliabilityScore || 'B';
        if (selectedReliability === 'Non évaluée') {
          if (rel !== 'Non évaluée' && rel !== 'À évaluer') return false;
        } else if (rel !== selectedReliability) {
          return false;
        }
      }

      // Filtre optionnel : Actives seulement
      if (activeOnly && !s.isActive) {
        return false;
      }

      return true;
    });
  }, [
    sources,
    searchQuery,
    selectedStatus,
    selectedCountry,
    selectedRegion,
    selectedType,
    selectedLanguage,
    selectedReliability,
    activeOnly,
  ]);

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedCountry('ALL');
    setSelectedRegion('ALL');
    setSelectedType('ALL');
    setSelectedLanguage('ALL');
    setSelectedReliability('ALL');
    setActiveOnly(false);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedStatus !== 'ALL' ||
    selectedCountry !== 'ALL' ||
    selectedRegion !== 'ALL' ||
    selectedType !== 'ALL' ||
    selectedLanguage !== 'ALL' ||
    selectedReliability !== 'ALL' ||
    activeOnly;

  // Ouvrir la fiche détaillée
  const handleOpenDetail = (source: OsintSourceItem) => {
    setDetailModalSource(source);
    if (onSelectSource) {
      onSelectSource(source);
    }
  };

  // Basculer l'état actif depuis la liste
  const handleToggle = (e: React.MouseEvent, sourceId: string) => {
    e.stopPropagation();
    if (onToggleActive) {
      onToggleActive(sourceId);
    } else if (onUpdateSource) {
      const src = sources.find((s) => s.id === sourceId);
      if (src) {
        const nextActive = !src.isActive;
        let nextStatus = src.status;
        if (!nextActive) {
          nextStatus = 'Inactive';
        } else {
          nextStatus = src.isReal
            ? (src.isConnected ? 'Réelle / connectée' : 'Réelle / non connectée')
            : 'Démonstration';
        }
        onUpdateSource(sourceId, {
          isActive: nextActive,
          status: nextStatus,
        });
      }
    }
  };

  return (
    <div id="screen-sources" className="space-y-5 animate-fadeIn pb-12">
      {/* Header Banner avec Distinction Sources Réelles vs Démonstration */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-[#111a2e] to-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100 uppercase tracking-wide">
                Sources répertoriées : <span className="font-mono text-amber-400">{stats.total}</span>
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 font-semibold">
                {stats.realNotConnectedCount} réelles / non connectées
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {stats.demoCount} démo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Cartographie et gestion des sources ouvertes d'information pour la veille panafricaine.
              Architecture préparée pour l'accueil de vraies sources OSINT (institutions, gouvernements, médias, think tanks, satellites).
            </p>
          </div>
        </div>

        <DemoWatermarkBanner compact />
      </div>

      {/* Avertissement Découplage & Respect strict du mode Hors-Ligne */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-slate-100">Architecture prête pour raccordement :</strong> Les sources réelles répertorient leurs URLs officielles vérifiées sans connexion réseau active. Aucune requête sortante n'est émise durant cette phase.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 shrink-0">
          <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            URLs vérifiées
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Connectivité : Hors-ligne (0 scraper actif)
          </span>
        </div>
      </div>

      {/* Barre de Recherche par Nom */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          id="search-source-input"
          placeholder="Rechercher une source par nom (ex: Union Africaine, Studio Tamani, Journal Officiel, Sentinel-2, Daily Trust)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-24 py-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-800 rounded border border-slate-700"
          >
            Effacer
          </button>
        )}
      </div>

      {/* 5 Filtres de Distinction Requis (Toutes, Démonstration, Réelles / non connectées, Réelles / connectées, Inactives) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              selectedStatus === 'ALL'
                ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Toutes</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700/60 font-mono">
              {stats.total}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus('Démonstration')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              selectedStatus === 'Démonstration'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Démonstration</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-900/40 text-amber-300 border border-amber-500/30 font-mono">
              {stats.demoCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus('Réelle / non connectée')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              selectedStatus === 'Réelle / non connectée' || selectedStatus === 'Réelles / non connectées'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Réelles / non connectées</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 font-mono">
              {stats.realNotConnectedCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus('Réelle / connectée')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              selectedStatus === 'Réelle / connectée' || selectedStatus === 'Réelles / connectées'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-cyan-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Réelles / connectées</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 font-mono">
              {stats.realConnectedCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus('Inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              selectedStatus === 'Inactive' || selectedStatus === 'Inactives'
                ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Inactives</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-900/30 text-rose-300 border border-rose-500/30 font-mono">
              {stats.inactiveCount}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-2 text-xs text-slate-400">
          <span>Actives en veille :</span>
          <span className="font-mono text-slate-200 font-semibold">{stats.activeCount} / {stats.total}</span>
        </div>
      </div>

      {/* Bloc des Filtres Requis (Pays, Région, Type, Langue, Statut, Fiabilité) */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Filtres de recherche</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Réinitialiser les filtres</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {/* 1. Filtre Pays */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-slate-500" />
              <span>Pays</span>
            </label>
            <select
              id="filter-country"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="ALL">Tous les pays ({availableCountries.length})</option>
              {availableCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Filtre Région */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>Région</span>
            </label>
            <select
              id="filter-region"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="ALL">Toutes les régions</option>
              {availableRegions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Filtre Type (8 types requis) */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-500" />
              <span>Type de source</span>
            </label>
            <select
              id="filter-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="ALL">Tous les types (8)</option>
              {CANONICAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Filtre Langue */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Languages className="w-3 h-3 text-slate-500" />
              <span>Langue</span>
            </label>
            <select
              id="filter-language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="ALL">Toutes les langues</option>
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Filtre Statut opérationnel (4 statuts requis) */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Statut</span>
            </label>
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="ALL">Tous les statuts</option>
              {OPERATIONAL_STATUSES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Filtre Fiabilité */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-slate-500" />
              <span>Fiabilité (OTAN)</span>
            </label>
            <select
              id="filter-reliability"
              value={selectedReliability}
              onChange={(e) => setSelectedReliability(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="ALL">Toutes les fiabilités</option>
              <option value="Non évaluée">Non évaluée / À évaluer</option>
              <option value="A">A - Établie sans doute</option>
              <option value="B">B - Généralement fiable</option>
              <option value="C">C - Assez fiable</option>
              <option value="D">D - Non éprouvée</option>
            </select>
          </div>
        </div>

        {/* Filtres rapides par type (Pills) */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap mr-1">Types :</span>
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
              selectedType === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Tous ({sources.length})
          </button>
          {CANONICAL_TYPES.map((t) => {
            const count = sources.filter((s) => normalizeSourceType(s.type) === t).length;
            const isSelected = selectedType === t;
            return (
              <button
                key={t}
                onClick={() => setSelectedType(isSelected ? 'ALL' : t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{t}</span>
                <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? 'bg-black/20 text-slate-950' : 'text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Barre de Résultats & Tri */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          <span>Affichage de </span>
          <strong className="text-slate-200 font-mono">{filteredSources.length}</strong>
          <span> source{filteredSources.length > 1 ? 's' : ''}</span>
          {hasActiveFilters && (
            <span className="text-amber-400 font-mono text-[11px] ml-2">
              (filtrées sur {sources.length})
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-xs text-slate-300">Actives uniquement</span>
          </label>
        </div>
      </div>

      {/* Grille des Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSources.map((source) => {
          const normType = normalizeSourceType(source.type);
          const Icon = SOURCE_TYPE_ICONS[normType] || SOURCE_TYPE_ICONS[source.type] || Database;
          const reliabilityKey = source.reliability || source.reliabilityScore || 'B';
          const isReal = source.isReal === true;

          return (
            <div
              key={source.id}
              onClick={() => handleOpenDetail(source)}
              className={`p-4 rounded-xl bg-slate-900/80 border transition-all flex flex-col justify-between group cursor-pointer relative hover:shadow-xl ${
                isReal
                  ? 'border-emerald-950/80 hover:border-emerald-500/50 hover:bg-slate-900/95'
                  : 'border-slate-800/90 hover:border-amber-500/50 hover:bg-slate-900/95'
              }`}
            >
              <div>
                {/* Ligne 1 : INDICATEUR VISUEL CLAIR (SOURCE RÉELLE vs DONNÉES DE DÉMONSTRATION) */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  {source.id === 'src-real-001' ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 tracking-wide flex items-center gap-1.5 shadow-sm">
                      <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                      <span>REAL PILOT (COLLECTE RÉELLE CONTRÔLÉE)</span>
                    </span>
                  ) : isReal ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 tracking-wide flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>RÉELLE — NON CONNECTÉE</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/40 tracking-wide flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>DONNÉES DE DÉMONSTRATION</span>
                    </span>
                  )}

                  {/* Fiabilité OTAN */}
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="text-slate-400 text-[10px]">Fiabilité</span>
                    {reliabilityKey === 'Non évaluée' || reliabilityKey === 'À évaluer' ? (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        Non évaluée
                      </span>
                    ) : (
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold ${
                          reliabilityKey === 'A'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            : reliabilityKey === 'B'
                            ? 'bg-blue-950 text-blue-400 border border-blue-500/40'
                            : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        {reliabilityKey}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ligne 2 : Type de source & Région */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                    <Icon className="w-3 h-3 text-amber-400" />
                    <span>{normType}</span>
                  </span>

                  <span className="text-[11px] font-mono text-slate-400">
                    {source.region || 'Afrique'}
                  </span>
                </div>

                {/* Nom de la source */}
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-2 mb-1.5">
                  {source.name}
                </h3>

                {/* Pays & Langue */}
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-2">
                  <span className="text-slate-300 font-semibold">{source.country}</span>
                  <span>•</span>
                  <span>{source.language}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300/90 leading-relaxed line-clamp-3 mb-3">
                  {source.description}
                </p>

                {/* URL Affichée (Réelle ou Sandbox) */}
                <div className="mb-3 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="truncate pr-2 flex items-center gap-1.5">
                    {isReal ? (
                      <span className="text-emerald-400/90 text-[10px] font-semibold bg-emerald-950/80 px-1 rounded border border-emerald-500/30 shrink-0">
                        OFFICIEL
                      </span>
                    ) : (
                      <span className="text-amber-400/90 text-[10px] font-semibold bg-amber-950/80 px-1 rounded border border-amber-500/30 shrink-0">
                        SANDBOX
                      </span>
                    )}
                    <span className="truncate">{source.url || source.sourceUrl}</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                </div>
              </div>

              {/* Pied de Carte : Statut d'exploitation & Dernière Vérification */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  {/* Statut opérationnel */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        source.status === 'Réelle / connectée'
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
                          : source.status === 'Réelle / non connectée'
                          ? 'bg-cyan-400'
                          : source.status === 'Inactive' || source.status === 'Inactif'
                          ? 'bg-slate-500'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span className="font-semibold text-slate-300">{source.status}</span>
                  </div>

                  {/* Horodatage dernière vérification */}
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>MAJ: {source.lastChecked || source.lastUpdated || '2026-09-11'}</span>
                  </div>
                </div>

                {/* Boutons d'Action rapide */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1">
                    {source.id === 'src-real-001' ? (
                      <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40">
                        Source pilote autorisée (1/112)
                      </span>
                    ) : isReal ? (
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                        Non connectée (111 sources)
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        Simulation locale
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-amber-400 group-hover:text-amber-300 flex items-center gap-1">
                    <span>Fiche détaillée</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Aucun résultat */}
      {filteredSources.length === 0 && (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
          <Database className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">Aucune source trouvée</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Aucune source ne correspond à vos critères de recherche actuels.
            Essayez de réinitialiser les filtres pour afficher l'ensemble du répertoire.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser les filtres</span>
          </button>
        </div>
      )}

      {/* Modal Fiche Détaillée */}
      <SourceDetailModal
        source={detailModalSource}
        isOpen={!!detailModalSource}
        onClose={() => setDetailModalSource(null)}
        onToggleActive={onToggleActive}
        onUpdateSource={onUpdateSource}
      />
    </div>
  );
};
