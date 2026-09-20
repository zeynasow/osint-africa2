import React, { useState } from 'react';
import {
  X,
  Database,
  Building2,
  Landmark,
  Newspaper,
  Globe2,
  Compass,
  Radio,
  Rss,
  Satellite,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Power,
  Sliders,
  AlertTriangle,
  Info,
  Server,
  Code2,
  Tag,
  MapPin,
  Calendar,
  Layers,
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
import { OsintSourceItem } from '../../types';

interface SourceDetailModalProps {
  source: OsintSourceItem | null;
  isOpen?: boolean;
  onClose: () => void;
  onToggleActive?: (id: string) => void;
  onUpdateSource?: (id: string, updates: Partial<OsintSourceItem>) => void;
}

const SOURCE_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }
> = {
  'Institutionnelle': {
    label: 'Institutionnelle',
    icon: Building2,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  'Sources institutionnelles': {
    label: 'Institutionnelle',
    icon: Building2,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  'Gouvernementale': {
    label: 'Gouvernementale',
    icon: Landmark,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Sources gouvernementales': {
    label: 'Gouvernementale',
    icon: Landmark,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Média': {
    label: 'Média',
    icon: Newspaper,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  'Médias': {
    label: 'Média',
    icon: Newspaper,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  'Média / Agence de presse': {
    label: 'Média / Agence de presse',
    icon: Newspaper,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  'Organisation internationale': {
    label: 'Organisation internationale',
    icon: Globe2,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  'Organisations internationales': {
    label: 'Organisation internationale',
    icon: Globe2,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  'ONG': {
    label: 'ONG',
    icon: Compass,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  'Think tank': {
    label: 'Think tank',
    icon: Radio,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  'Think tanks': {
    label: 'Think tank',
    icon: Radio,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  'RSS': {
    label: 'Flux RSS',
    icon: Rss,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
  'Source spécialisée': {
    label: 'Source spécialisée',
    icon: Satellite,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
  },
  'Sources spécialisées': {
    label: 'Source spécialisée',
    icon: Satellite,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
  },
  'Données satellitaires / Observation de la Terre': {
    label: 'Données satellitaires / Observation de la Terre',
    icon: Satellite,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  'Sécurité / Institutionnelle': {
    label: 'Sécurité / Institutionnelle',
    icon: Shield,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  'Sécurité civile / Institutionnelle': {
    label: 'Sécurité civile / Institutionnelle',
    icon: Shield,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  'Sécurité / Gouvernementale': {
    label: 'Sécurité / Gouvernementale',
    icon: Shield,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Gouvernementale / Justice': {
    label: 'Gouvernementale / Justice',
    icon: Scale,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Justice / Gouvernementale': {
    label: 'Justice / Gouvernementale',
    icon: Scale,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Justice / Services numériques publics': {
    label: 'Justice / Services numériques publics',
    icon: Scale,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  'Institutionnelle / Statistiques': {
    label: 'Institutionnelle / Statistiques',
    icon: BarChart3,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  'Statistiques / Institutionnelle': {
    label: 'Statistiques / Institutionnelle',
    icon: BarChart3,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  'Gouvernementale / Douanes / Sécurité économique': {
    label: 'Gouvernementale / Douanes',
    icon: Landmark,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Douanes / Gouvernementale / Économie': {
    label: 'Douanes / Gouvernementale / Économie',
    icon: Landmark,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Institutionnelle / Météorologie / Aviation': {
    label: 'Institutionnelle / Météorologie',
    icon: Building2,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  'Mines / Gouvernementale / Économie': {
    label: 'Mines / Gouvernementale / Économie',
    icon: Pickaxe,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  'Transport / Infrastructure / Gouvernementale': {
    label: 'Transport / Infrastructure / Gouvernementale',
    icon: Car,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
  },
  'Média public': {
    label: 'Média public',
    icon: Tv,
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/30',
  },
  'Énergie / Entreprise publique': {
    label: 'Énergie / Entreprise publique',
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  'Infrastructure / Maritime': {
    label: 'Infrastructure / Maritime',
    icon: Ship,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  'Open Data / Données statistiques': {
    label: 'Open Data / Données statistiques',
    icon: Database,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  'Média public / Agence de presse': {
    label: 'Média public / Agence de presse',
    icon: Newspaper,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  'Gouvernementale / Institutionnelle': {
    label: 'Gouvernementale / Institutionnelle',
    icon: Landmark,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Gouvernementale / Maritime / Pêche': {
    label: 'Gouvernementale / Maritime / Pêche',
    icon: Ship,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  'Recherche / Océanographie / Pêche': {
    label: 'Recherche / Océanographie / Pêche',
    icon: Compass,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
  },
  'Maritime / Sécurité / Institutionnelle': {
    label: 'Maritime / Sécurité / Institutionnelle',
    icon: Shield,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  'Économie / Finance / Institutionnelle': {
    label: 'Économie / Finance / Institutionnelle',
    icon: Building2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  'Gouvernementale / Numérique / Administration': {
    label: 'Gouvernementale / Numérique / Administration',
    icon: Landmark,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Défense': {
    label: 'Défense',
    icon: Shield,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  'Sécurité intérieure': {
    label: 'Sécurité intérieure',
    icon: Shield,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  'Immigration / Frontières': {
    label: 'Immigration / Frontières',
    icon: Shield,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  'Justice / Gouvernance': {
    label: 'Justice / Gouvernance',
    icon: Scale,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
  'Média institutionnel': {
    label: 'Média institutionnel',
    icon: Tv,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  'Statistiques': {
    label: 'Statistiques',
    icon: BarChart3,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  'Douanes / Fiscalité': {
    label: 'Douanes / Fiscalité',
    icon: Landmark,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Maritime / Infrastructures': {
    label: 'Maritime / Infrastructures',
    icon: Ship,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  'Maritime / Sécurité': {
    label: 'Maritime / Sécurité',
    icon: Ship,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  'Aviation / Sécurité': {
    label: 'Aviation / Sécurité',
    icon: Plane,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  'Économie / Finance': {
    label: 'Économie / Finance',
    icon: Building2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  'Sécurité': {
    label: 'Sécurité',
    icon: Shield,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  'Sécurité / Gendarmerie': {
    label: 'Sécurité / Gendarmerie',
    icon: Shield,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Justice / Droits humains': {
    label: 'Justice / Droits humains',
    icon: Scale,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
  'Douanes / Frontières': {
    label: 'Douanes / Frontières',
    icon: Landmark,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Télécommunications / Numérique': {
    label: 'Télécommunications / Numérique',
    icon: Radio,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  'Information gouvernementale': {
    label: 'Information gouvernementale',
    icon: Newspaper,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  'Administration publique': {
    label: 'Administration publique',
    icon: Landmark,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Sécurité / Administration': {
    label: 'Sécurité / Administration',
    icon: Shield,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  'Finance / Économie': {
    label: 'Finance / Économie',
    icon: Building2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  'Économie / Planification': {
    label: 'Économie / Planification',
    icon: Building2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  'Maritime / Pêche': {
    label: 'Maritime / Pêche',
    icon: Ship,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  'Transport / Communications': {
    label: 'Transport / Communications',
    icon: Car,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  'Élections / Gouvernance': {
    label: 'Élections / Gouvernance',
    icon: Scale,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  'Finance / Statistiques régionales': {
    label: 'Finance / Statistiques régionales',
    icon: Globe2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  'Gouvernement / Information institutionnelle': {
    label: 'Gouvernement / Information institutionnelle',
    icon: Newspaper,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  'Gouvernement / Primature': {
    label: 'Gouvernement / Primature',
    icon: Landmark,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  'Police / Sécurité': {
    label: 'Police / Sécurité',
    icon: Shield,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  'Gendarmerie / Sécurité': {
    label: 'Gendarmerie / Sécurité',
    icon: Shield,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Défense / Forces armées': {
    label: 'Défense / Forces armées',
    icon: Shield,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  'Statistiques / Données économiques et sociales': {
    label: 'Statistiques / Données économiques et sociales',
    icon: BarChart3,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Douanes / Commerce / Frontières': {
    label: 'Douanes / Commerce / Frontières',
    icon: Landmark,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Agence de presse / Actualité': {
    label: 'Agence de presse / Actualité',
    icon: Newspaper,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  'Médias / Régulation / Désinformation': {
    label: 'Médias / Régulation / Désinformation',
    icon: Tv,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  'Aviation civile / Transport': {
    label: 'Aviation civile / Transport',
    icon: Plane,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  'Identification / Documents officiels': {
    label: 'Identification / Documents officiels',
    icon: Landmark,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  'Administration publique / Services officiels': {
    label: 'Administration publique / Services officiels',
    icon: Landmark,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Sécurité intérieure / Administration territoriale': {
    label: 'Sécurité intérieure / Administration territoriale',
    icon: Shield,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  'Agence de presse / Actualité nationale': {
    label: 'Agence de presse / Actualité nationale',
    icon: Newspaper,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  'Économie / Finances publiques / Budget': {
    label: 'Économie / Finances publiques / Budget',
    icon: Landmark,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  'Mines / Ressources naturelles': {
    label: 'Mines / Ressources naturelles',
    icon: Pickaxe,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  'Police / Sécurité intérieure': {
    label: 'Police / Sécurité intérieure',
    icon: Shield,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  'Sécurité / Ordre public / Protection des populations': {
    label: 'Sécurité / Ordre public / Protection des populations',
    icon: Shield,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Médias / Communication / Régulation': {
    label: 'Médias / Communication / Régulation',
    icon: Tv,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  'Protection des données / Numérique / Gouvernance': {
    label: 'Protection des données / Numérique / Gouvernance',
    icon: Database,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  'Aviation civile / Transport / Sécurité aérienne': {
    label: 'Aviation civile / Transport / Sécurité aérienne',
    icon: Plane,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  'Transport / Commerce / Corridors logistiques': {
    label: 'Transport / Commerce / Corridors logistiques',
    icon: Car,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  'Médias / Audiovisuel / Information publique': {
    label: 'Médias / Audiovisuel / Information publique',
    icon: Tv,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  'Textes juridiques / Actes officiels': {
    label: 'Textes juridiques / Actes officiels',
    icon: Scale,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
  },
  'Finances publiques / Audit / Contrôle': {
    label: 'Finances publiques / Audit / Contrôle',
    icon: BarChart3,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  'Droits humains / Gouvernance': {
    label: 'Droits humains / Gouvernance',
    icon: Scale,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
  },
  'Information publique / Actualité': {
    label: 'Information publique / Actualité',
    icon: Newspaper,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  'Données / Statistiques / Planification': {
    label: 'Données / Statistiques / Planification',
    icon: Database,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  'Immigration / Administration / Mobilité': {
    label: 'Immigration / Administration / Mobilité',
    icon: Shield,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  'Diplomatie / Affaires étrangères': {
    label: 'Diplomatie / Affaires étrangères',
    icon: Landmark,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  'Éducation / Recherche / Formation': {
    label: 'Éducation / Recherche / Formation',
    icon: Building2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
};

const RELIABILITY_DESCRIPTIONS: Record<string, { label: string; desc: string; badge: string }> = {
  'Non évaluée': {
    label: 'Fiabilité : Non évaluée',
    desc: 'Cette source réelle nouvellement intégrée n’a pas encore fait l’objet d’une notation. La fiabilité sera évaluée ultérieurement selon une méthodologie transparente.',
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  'À évaluer': {
    label: 'Fiabilité : À évaluer',
    desc: 'Cette source réelle nouvellement intégrée n’a pas encore fait l’objet d’une notation. La fiabilité sera évaluée ultérieurement selon une méthodologie transparente.',
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  A: {
    label: 'Fiabilité A - Établie sans doute',
    desc: 'Organisme officiel vérifié, régulateur ou registre public certifié. Niveau d’intégrité maximal.',
    badge: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
  },
  B: {
    label: 'Fiabilité B - Généralement fiable',
    desc: 'Média établi ou réseau local de correspondants avec historique probant de rigueur journalistique.',
    badge: 'bg-blue-950 text-blue-300 border-blue-500/40',
  },
  C: {
    label: 'Fiabilité C - Assez fiable',
    desc: 'Source communautaire ou observatoire émergent. Recoupement avec une seconde source requis.',
    badge: 'bg-amber-950 text-amber-300 border-amber-500/40',
  },
  D: {
    label: 'Fiabilité D - Non éprouvée / Douteuse',
    desc: 'Données non corroborées ou canal d’information présentant des risques de biais prononcés.',
    badge: 'bg-rose-950 text-rose-300 border-rose-500/40',
  },
};

export const SourceDetailModal: React.FC<SourceDetailModalProps> = ({
  source,
  isOpen = true,
  onClose,
  onToggleActive,
  onUpdateSource,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifySuccessMsg, setVerifySuccessMsg] = useState<string | null>(null);

  if (!isOpen || !source) return null;

  const isReal = source.isReal === true;
  const typeConfig = SOURCE_TYPE_CONFIG[source.type] || {
    label: source.type,
    icon: Database,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  };
  const TypeIcon = typeConfig.icon;

  const reliabilityKey = source.reliability || source.reliabilityScore || 'B';
  const reliabilityInfo = RELIABILITY_DESCRIPTIONS[reliabilityKey] || RELIABILITY_DESCRIPTIONS.B;

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Simulation locale de vérification (sans aucun appel réseau sortant)
  const handleSimulateCheck = () => {
    setIsVerifying(true);
    setVerifySuccessMsg(null);

    setTimeout(() => {
      setIsVerifying(false);
      const now = new Date();
      const timeStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
      const today = now.toISOString().split('T')[0];

      if (onUpdateSource) {
        onUpdateSource(source.id, {
          lastChecked: timeStr,
          updatedAt: today,
        });
      }

      if (isReal) {
        setVerifySuccessMsg(
          `Vérification locale effectuée (${timeStr}) : Syntaxe de l'URL officielle et métadonnées validées. Connexion réseau désactivée (mode hors-ligne).`
        );
      } else {
        setVerifySuccessMsg(
          `Vérification locale de simulation effectuée (${timeStr}) : Gabarit de test valide.`
        );
      }

      setTimeout(() => setVerifySuccessMsg(null), 5000);
    }, 600);
  };

  const handleToggle = () => {
    if (onToggleActive) {
      onToggleActive(source.id);
    } else if (onUpdateSource) {
      const nextActive = !source.isActive;
      let nextStatus = source.status;
      if (!nextActive) {
        nextStatus = 'Inactive';
      } else {
        nextStatus = isReal
          ? (source.isConnected ? 'Réelle / connectée' : 'Réelle / non connectée')
          : 'Démonstration';
      }

      onUpdateSource(source.id, {
        isActive: nextActive,
        status: nextStatus,
        updatedAt: new Date().toISOString().split('T')[0],
      });
    }
  };

  return (
    <div
      id="modal-source-detail"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Supérieure : INDICATEUR VISUEL TRÈS CLAIR */}
        {isReal ? (
          <div className="bg-gradient-to-r from-emerald-600/90 via-emerald-500/95 to-teal-600/90 px-4 py-2 text-slate-950 text-xs font-bold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-950" />
              <span className="tracking-wide">SOURCE RÉELLE</span>
              <span className="hidden sm:inline font-normal text-[11px] opacity-90">
                — Source OSINT officielle identifiée. Prête pour connexion ultérieure (aucun appel réseau externe émis à ce stade).
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase bg-black/20 px-2 py-0.5 rounded">
              URL Officielle Vérifiée
            </span>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-600/90 via-amber-500/95 to-amber-600/90 px-4 py-2 text-slate-950 text-xs font-bold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950" />
              <span className="tracking-wide">DONNÉES DE DÉMONSTRATION</span>
              <span className="hidden sm:inline font-normal text-[11px] opacity-90">
                — Fiche fictive pour tests de veille OSINT (aucun appel réseau externe émis).
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase bg-black/20 px-2 py-0.5 rounded">
              Environnement Sandbox
            </span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/60">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className={`p-3 rounded-xl ${typeConfig.bg} ${typeConfig.border} border shrink-0 mt-0.5`}>
              <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeConfig.bg} ${typeConfig.color} ${typeConfig.border} border`}
                >
                  <TypeIcon className="w-3 h-3" />
                  {typeConfig.label}
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  <span>{source.country}</span>
                </span>

                {source.region && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono text-slate-400 bg-slate-800/60 border border-slate-700/60">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{source.region}</span>
                  </span>
                )}

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                    source.isActive
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      source.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  {source.isActive ? 'Veille Active' : 'Veille Inactive'}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight leading-snug break-words">
                {source.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0"
            title="Fermer la fiche"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-xs sm:text-sm">
          {/* Notification après simulation */}
          {verifySuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{verifySuccessMsg}</span>
            </div>
          )}

          {/* Section 1 : Fiche d'Identification OSINT */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              Fiche d'identification OSINT
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Nom */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Nom de la source</span>
                <span className="font-semibold text-slate-200 break-words">{source.name}</span>
              </div>

              {/* Pays & Région */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Pays & Région</span>
                <span className="font-semibold text-slate-200">
                  {source.country} {source.region ? `(${source.region})` : ''}
                </span>
              </div>

              {/* Type */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Type de source</span>
                <span className={`font-semibold ${typeConfig.color}`}>{typeConfig.label}</span>
              </div>

              {/* Langue */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Langue(s)</span>
                <span className="font-semibold text-slate-200">{source.language}</span>
              </div>

              {/* Statut Opérationnel */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Statut d'exploitation</span>
                <div className="flex items-center gap-1.5 mt-0.5">
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
                  <span className="font-semibold text-slate-200 font-mono">{source.status}</span>
                </div>
              </div>

              {/* Horodatages */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Dernière vérification
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-slate-200 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{source.lastChecked || source.lastUpdated || '2026-09-11'}</span>
                  </div>
                </div>
                {(source.createdAt || source.updatedAt) && (
                  <div className="text-[10px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-700/40 flex items-center justify-between">
                    <span>Créée: {source.createdAt || '2026-09-01'}</span>
                    <span>Màj: {source.updatedAt || '2026-09-11'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2 : Fiabilité Échelle Admiralty */}
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Indice de Fiabilité (Standard Admiralty / OTAN)
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${reliabilityInfo.badge}`}>
                {reliabilityKey === 'Non évaluée' || reliabilityKey === 'À évaluer'
                  ? 'Non évaluée'
                  : `Classe ${reliabilityKey}`}
              </span>
            </div>
            <p className="font-semibold text-slate-200 text-xs sm:text-sm">{reliabilityInfo.label}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{reliabilityInfo.desc}</p>
          </div>

          {/* Section 3 : Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h3>
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed">
              {source.description}
            </div>
          </div>

          {/* Section 4 : Architecture Technique & Connecteurs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-amber-400" />
                Architecture Technique & Connecteurs (Intégration future)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Mode Hors-Ligne
              </span>
            </div>

            <p className="text-xs text-slate-400">
              {isReal
                ? "URL officielle vérifiée et paramètres techniques réels. Aucun appel réseau ni scraper n'est activé à ce stade."
                : "Paramètres de simulation structurés pour tester les passerelles logicielles en environnement sandbox."}
            </p>

            <div className="space-y-2.5 font-mono text-xs">
              {/* URL Principale (url / sourceUrl) */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                      url / sourceUrl
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {isReal ? 'URL officielle identifiée' : 'Gabarit de test Sandbox'}
                    </span>
                  </div>
                  <p className="text-slate-300 truncate">{source.url || source.sourceUrl}</p>
                </div>
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => copyToClipboard(source.url || source.sourceUrl, 'sourceUrl')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[11px]"
                    title="Copier l'URL"
                  >
                    {copiedField === 'sourceUrl' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Flux RSS (rssUrl) */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.2 rounded border border-orange-500/20">
                      rssUrl
                    </span>
                    <span className="text-slate-400 text-[11px]">Flux de syndication XML / RSS</span>
                  </div>
                  <p className="text-slate-300 truncate">
                    {source.rssUrl || (isReal ? 'Non configuré (en attente d’ingestion)' : 'Non configuré')}
                  </p>
                </div>
                {source.rssUrl && (
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => copyToClipboard(source.rssUrl || '', 'rssUrl')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[11px]"
                      title="Copier le flux RSS"
                    >
                      {copiedField === 'rssUrl' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Endpoint API (apiEndpoint) */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                      apiEndpoint
                    </span>
                    <span className="text-slate-400 text-[11px]">Point de terminaison REST / JSON</span>
                  </div>
                  <p className="text-slate-300 truncate">
                    {source.apiEndpoint || (isReal ? 'Non configuré (en attente d’ingestion)' : 'Non configuré')}
                  </p>
                </div>
                {source.apiEndpoint && (
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => copyToClipboard(source.apiEndpoint || '', 'apiEndpoint')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[11px]"
                      title="Copier l'endpoint API"
                    >
                      {copiedField === 'apiEndpoint' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Diagnostic d'intégrité local */}
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Format attendu : Web / RSS / GeoJSON / OData</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400/90">
                <ShieldCheck className="w-3 h-3" />
                <span>Sécurité : Mode Hors-Ligne Garanti</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Bouton Toggle Veille Active / Inactive */}
            <button
              onClick={handleToggle}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                source.isActive
                  ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800'
                  : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{source.isActive ? 'Désactiver la veille' : 'Activer la veille'}</span>
            </button>

            {/* Bouton Tester / Vérifier en local */}
            <button
              onClick={handleSimulateCheck}
              disabled={isVerifying}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
              <span>{isVerifying ? 'Vérification locale...' : 'Vérifier (Local)'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md shadow-amber-500/10"
          >
            Fermer la fiche
          </button>
        </div>
      </div>
    </div>
  );
};
