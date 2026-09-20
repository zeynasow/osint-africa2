/**
 * OSINT AFRICA - ViewModel Pattern (React Hook)
 * Centralise l'état applicatif et découple la logique métier de l'interface graphique.
 * Conçu pour correspondre au paradigme Android ViewModel / Jetpack Compose.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Country,
  OsintEvent,
  OsintAlert,
  AnalyticalDossier,
  UserProfile,
  ScreenId,
  FilterState,
  Category,
  SeverityLevel,
  OsintSourceItem,
  OsintActor,
  IntelligenceNote,
  OsintAnalysis,
  OsintEvidence,
  OsintHypothesis,
  ConfiguredAlertRule,
  EventStatus,
  OsintIntelligenceReport,
  OsintProvenance,
} from '../types';
import { osintRepository } from '../services/osintRepository';

export interface UseOsintViewModelReturn {
  // Navigation & Écrans
  currentScreen: ScreenId;
  navigateTo: (screen: ScreenId) => void;

  // Données
  countries: Country[];
  priorityCountries: Country[];
  events: OsintEvent[];
  filteredEvents: OsintEvent[];
  alerts: OsintAlert[];
  configuredRules: ConfiguredAlertRule[];
  dossiers: AnalyticalDossier[];
  sources: OsintSourceItem[];
  actors: OsintActor[];
  notes: IntelligenceNote[];
  reports: OsintIntelligenceReport[];
  provenance: OsintProvenance[];
  userProfile: UserProfile;
  loading: boolean;

  // Sélections & Modales
  selectedCountry: Country | null;
  selectCountry: (country: Country | null) => void;
  selectedEvent: OsintEvent | null;
  selectEvent: (event: OsintEvent | null) => void;
  selectedDossier: AnalyticalDossier | null;
  selectDossier: (dossier: AnalyticalDossier | null) => void;
  selectedActor: OsintActor | null;
  selectActor: (actor: OsintActor | null) => void;
  selectedSource: OsintSourceItem | null;
  selectSource: (source: OsintSourceItem | null) => void;
  updateSource: (id: string, updates: Partial<OsintSourceItem>) => Promise<OsintSourceItem | undefined>;
  toggleSourceActive: (id: string) => Promise<OsintSourceItem | undefined>;

  // Filtres
  filters: FilterState;
  setFilter: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Actions métier
  updateCountryRiskLevel: (countryId: string, level: SeverityLevel, note?: string) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  toggleCountryMonitoring: (countryId: string) => Promise<void>;
  
  saveProvenance: (item: OsintProvenance) => Promise<void>;

  // Règles d'alerte configurables (Requirement 13)
  createAlertRule: (rule: Partial<ConfiguredAlertRule>) => Promise<ConfiguredAlertRule>;
  toggleAlertRule: (id: string) => Promise<void>;
  deleteAlertRule: (id: string) => Promise<void>;

  // Gestion des statuts et doublons événements (Requirement 5, 6, 8)
  updateEventStatus: (eventId: string, status: EventStatus) => Promise<void>;
  mergeEventDuplicates: (primaryEventId: string, duplicateIds: string[]) => Promise<void>;

  // Gestion des dossiers (Requirement 11)
  createDossier: (data: {
    title: string;
    description: string;
    targetCountries: string[];
    categories: Category[];
    analystNotes: string;
    eventIds?: string[];
  }) => Promise<AnalyticalDossier>;
  updateDossier: (id: string, updates: Partial<AnalyticalDossier>) => Promise<void>;
  deleteDossier: (id: string) => Promise<void>;
  toggleArchiveDossier: (id: string) => Promise<void>;
  addEventToDossier: (dossierId: string, eventId: string) => Promise<void>;
  removeEventFromDossier: (dossierId: string, eventId: string) => Promise<void>;
  addActorToDossier: (dossierId: string, actorId: string) => Promise<void>;
  addSourceToDossier: (dossierId: string, sourceId: string) => Promise<void>;
  addNoteToDossier: (dossierId: string, noteId: string) => Promise<void>;

  // Analytical Exploitation (LOT 14)
  analyses: OsintAnalysis[];
  evidence: OsintEvidence[];
  hypotheses: OsintHypothesis[];
  selectedAnalysis: OsintAnalysis | null;
  selectAnalysis: (analysis: OsintAnalysis | null) => void;
  saveAnalysis: (analysis: OsintAnalysis) => Promise<OsintAnalysis>;
  saveEvidence: (evidence: OsintEvidence) => Promise<OsintEvidence>;
  saveHypothesis: (hypothesis: OsintHypothesis) => Promise<OsintHypothesis>;

  // Notes de renseignement
  saveIntelligenceNote: (data: Partial<IntelligenceNote>) => Promise<IntelligenceNote>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetToDemoDefaults: () => Promise<void>;

  // Modales spécialisées
  isAiAnalysisOpen: boolean;
  aiTarget: { event?: OsintEvent; country?: Country } | null;
  openAiAnalysis: (target: { event?: OsintEvent; country?: Country }) => void;
  closeAiAnalysis: () => void;

  isNoteModalOpen: boolean;
  noteModalInitialEvents: OsintEvent[];
  noteModalInitialCountry: Country | null;
  openCreateNote: (presetEvents?: OsintEvent[], presetCountry?: Country) => void;
  closeNoteModal: () => void;

  isDuplicatesModalOpen: boolean;
  duplicatesTargetEvent: OsintEvent | null;
  openDuplicatesModal: (event: OsintEvent) => void;
  closeDuplicatesModal: () => void;

  // Statistiques calculées (Requirement 1)
  stats: {
    totalEvents: number;
    criticalAlertsCount: number;
    highAlertsCount: number;
    priorityCountriesCount: number;
    monitoredCountriesCount: number;
    dossiersCount: number;
    sourcesCount: number;
    actorsCount: number;
    notesCount: number;
    events24hCount: number;
    events7dCount: number;
    categoryDistribution: Record<string, number>;
    topActiveCountries: { countryId: string; countryName: string; flag: string; count: number }[];
    dailyActivity7d: { day: string; date: string; count: number }[];
  };

  // LOT 19: Centre de Production
  selectedReport: OsintIntelligenceReport | null;
  selectReport: (report: OsintIntelligenceReport | null) => void;
  saveReport: (report: OsintIntelligenceReport) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;

  // Mode d'affichage simulateur Android / Plein écran
  deviceViewMode: 'phone' | 'fluid';
  setDeviceViewMode: (mode: 'phone' | 'fluid') => void;

  // Vue Code Jetpack Compose
  isComposeCodeOpen: boolean;
  setIsComposeCodeOpen: (open: boolean) => void;
}

const DEFAULT_FILTERS: FilterState = {
  countryId: 'ALL',
  category: 'TOUTES',
  severity: 'TOUS',
  sourceName: 'ALL',
  searchQuery: '',
  dateRange: 'all',
};

export function useOsintViewModel(): UseOsintViewModelReturn {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('accueil');
  const [countries, setCountries] = useState<Country[]>([]);
  const [events, setEvents] = useState<OsintEvent[]>([]);
  const [alerts, setAlerts] = useState<OsintAlert[]>([]);
  const [configuredRules, setConfiguredRules] = useState<ConfiguredAlertRule[]>([]);
  const [dossiers, setDossiers] = useState<AnalyticalDossier[]>([]);
  const [sources, setSources] = useState<OsintSourceItem[]>([]);
  const [actors, setActors] = useState<OsintActor[]>([]);
  const [notes, setNotes] = useState<IntelligenceNote[]>([]);
  const [reports, setReports] = useState<OsintIntelligenceReport[]>([]);
  const [provenance, setProvenance] = useState<OsintProvenance[]>([]);
  const [analyses, setAnalyses] = useState<OsintAnalysis[]>([]);
  const [evidence, setEvidence] = useState<OsintEvidence[]>([]);
  const [hypotheses, setHypotheses] = useState<OsintHypothesis[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(osintRepository['profile']);
  const [loading, setLoading] = useState<boolean>(true);

  // Sélections
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<OsintEvent | null>(null);
  const [selectedDossier, setSelectedDossier] = useState<AnalyticalDossier | null>(null);
  const [selectedActor, setSelectedActor] = useState<OsintActor | null>(null);
  const [selectedSource, setSelectedSource] = useState<OsintSourceItem | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<OsintAnalysis | null>(null);
  const [selectedReport, setSelectedReport] = useState<OsintIntelligenceReport | null>(null);

  // Modales d'analyse et note
  const [isAiAnalysisOpen, setIsAiAnalysisOpen] = useState(false);
  const [aiTarget, setAiTarget] = useState<{ event?: OsintEvent; country?: Country } | null>(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteModalInitialEvents, setNoteModalInitialEvents] = useState<OsintEvent[]>([]);
  const [noteModalInitialCountry, setNoteModalInitialCountry] = useState<Country | null>(null);

  const [isDuplicatesModalOpen, setIsDuplicatesModalOpen] = useState(false);
  const [duplicatesTargetEvent, setDuplicatesTargetEvent] = useState<OsintEvent | null>(null);

  // Filtres
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Device view mode
  const [deviceViewMode, setDeviceViewMode] = useState<'phone' | 'fluid'>('fluid');
  const [isComposeCodeOpen, setIsComposeCodeOpen] = useState<boolean>(false);

  // Charger toutes les données
  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        pCountries, allEvents, allAlerts, allRules, allDossiers, 
        allSources, allActors, allNotes, allAnalyses, allReports, allProvenance, profile
      ] = await Promise.all([
          osintRepository.getAllCountries(),
          osintRepository.getEvents(),
          osintRepository.getAlerts(),
          osintRepository.getConfiguredAlertRules(),
          osintRepository.getDossiers(),
          osintRepository.getSources(),
          osintRepository.getActors(),
          osintRepository.getIntelligenceNotes(),
          osintRepository.getAnalyses(),
          osintRepository.getReports(),
          osintRepository.getProvenance(),
          osintRepository.getUserProfile(),
        ]);
      setCountries(pCountries);
      setEvents(allEvents);
      setAlerts(allAlerts);
      setConfiguredRules(allRules);
      setDossiers(allDossiers);
      setSources(allSources);
      setActors(allActors);
      setNotes(allNotes);
      setAnalyses(allAnalyses);
      setReports(allReports);
      setProvenance(allProvenance);
      setUserProfile(profile);
    } catch (e) {
      console.error('Error fetching OSINT data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // 25 pays prioritaires
  const priorityCountries = useMemo(() => {
    return countries.filter((c) => c.isPriority);
  }, [countries]);

  // Événements filtrés
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Pays
      if (filters.countryId && filters.countryId !== 'ALL' && e.countryId !== filters.countryId) {
        return false;
      }
      // Catégorie
      if (filters.category && filters.category !== 'TOUTES' && e.category !== filters.category) {
        return false;
      }
      // Gravité
      if (filters.severity && filters.severity !== 'TOUS' && e.severity !== filters.severity) {
        return false;
      }
      // Source
      if (filters.sourceName && filters.sourceName !== 'ALL') {
        const sFilter = filters.sourceName.toLowerCase();
        const matchesSource =
          e.source.name.toLowerCase().includes(sFilter) ||
          e.associatedSourcesList?.some((s) => s.toLowerCase().includes(sFilter));
        if (!matchesSource) return false;
      }
      // Date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const eventTime = new Date(e.date + ' ' + (e.time || '00:00')).getTime();
        const now = new Date('2026-09-10T12:00:00Z').getTime(); // Based on current app timeline
        const diffHours = (now - eventTime) / (1000 * 3600);
        if (filters.dateRange === '24h' && diffHours > 24) return false;
        if (filters.dateRange === '7d' && diffHours > 24 * 7) return false;
        if (filters.dateRange === '30d' && diffHours > 24 * 30) return false;
      }
      // Recherche textuelle
      if (filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase().trim();
        const matches =
          e.title.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q) ||
          e.countryName.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.source.name.toLowerCase().includes(q) ||
          (e.locationName && e.locationName.toLowerCase().includes(q)) ||
          e.tags.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [events, filters]);

  // Statistiques calculées (Requirement 1)
  const stats = useMemo(() => {
    const criticalAlertsCount = alerts.filter((a) => a.severity === 'CRITIQUE' && !a.acknowledged).length;
    const highAlertsCount = alerts.filter((a) => a.severity === 'ELEVE' && !a.acknowledged).length;
    const monitoredCountriesCount = countries.filter((c) => c.monitored).length;

    // Temporal anchors based on app reference date
    const now = new Date('2026-09-10T23:59:59').getTime();
    let events24hCount = 0;
    let events7dCount = 0;

    const categoryDistribution: Record<string, number> = {
      'SÉCURITÉ': 0,
      'POLITIQUE': 0,
      'ÉCONOMIE': 0,
      'DIPLOMATIE': 0,
      'SOCIÉTÉ': 0,
      'CLIMAT': 0,
    };

    const countryCounts: Record<string, { countryName: string; flag: string; count: number }> = {};

    // 7-day activity map
    const dayLabels = ['J-6', 'J-5', 'J-4', 'J-3', 'J-2', 'Hier', "Aujourd'hui"];
    const dailyActivity7d = dayLabels.map((day, idx) => {
      const d = new Date('2026-09-10T00:00:00');
      d.setDate(d.getDate() - (6 - idx));
      const dateStr = d.toISOString().split('T')[0];
      return {
        day,
        date: dateStr,
        count: 0,
      };
    });

    events.forEach((e) => {
      const evtTime = new Date(`${e.date}T${e.time || '12:00'}:00`).getTime();
      const diffHours = (now - evtTime) / (1000 * 3600);
      if (diffHours >= -2 && diffHours <= 24) events24hCount++;
      if (diffHours >= -2 && diffHours <= 24 * 7) events7dCount++;

      // Category distribution
      if (categoryDistribution[e.category] !== undefined) {
        categoryDistribution[e.category]++;
      } else {
        categoryDistribution[e.category] = (categoryDistribution[e.category] || 0) + 1;
      }

      // Country count
      if (!countryCounts[e.countryId]) {
        countryCounts[e.countryId] = {
          countryName: e.countryName,
          flag: countries.find((c) => c.id === e.countryId)?.flag || '🌍',
          count: 1,
        };
      } else {
        countryCounts[e.countryId].count++;
      }

      // 7-day map
      const daySlot = dailyActivity7d.find((slot) => slot.date === e.date);
      if (daySlot) {
        daySlot.count++;
      }
    });

    const topActiveCountries = Object.entries(countryCounts)
      .map(([countryId, val]) => ({
        countryId,
        countryName: val.countryName,
        flag: val.flag,
        count: val.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalEvents: events.length,
      criticalAlertsCount,
      highAlertsCount,
      priorityCountriesCount: priorityCountries.length,
      monitoredCountriesCount,
      dossiersCount: dossiers.length,
      sourcesCount: sources.length,
      actorsCount: actors.length,
      notesCount: notes.length,
      events24hCount,
      events7dCount,
      categoryDistribution,
      topActiveCountries,
      dailyActivity7d,
    };
  }, [events, alerts, countries, priorityCountries, dossiers, sources, actors, notes]);

  // Actions
  const navigateTo = useCallback((screen: ScreenId) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const setFilter = useCallback((updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Modification manuelle du niveau de surveillance
  const updateCountryRiskLevel = useCallback(
    async (countryId: string, level: SeverityLevel, note?: string) => {
      const updated = await osintRepository.updateCountryRiskLevel(countryId, level, note);
      setCountries((prev) =>
        prev.map((c) => (c.id === countryId || c.code === countryId ? updated : c))
      );
      if (selectedCountry && (selectedCountry.id === countryId || selectedCountry.code === countryId)) {
        setSelectedCountry(updated);
      }
    },
    [selectedCountry]
  );

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    await osintRepository.acknowledgeAlert(alertId);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  }, []);

  const toggleCountryMonitoring = useCallback(async (countryId: string) => {
    const isMonitored = await osintRepository.toggleCountryMonitoring(countryId);
    setCountries((prev) =>
      prev.map((c) => (c.id === countryId ? { ...c, monitored: isMonitored } : c))
    );
    const updatedProfile = await osintRepository.getUserProfile();
    setUserProfile(updatedProfile);
  }, []);

  // Règles configurables (Requirement 13)
  const createAlertRule = useCallback(async (rule: Partial<ConfiguredAlertRule>) => {
    const saved = await osintRepository.saveConfiguredAlertRule(rule);
    const all = await osintRepository.getConfiguredAlertRules();
    setConfiguredRules(all);
    return saved;
  }, []);

  const toggleAlertRule = useCallback(async (id: string) => {
    await osintRepository.toggleAlertRule(id);
    const all = await osintRepository.getConfiguredAlertRules();
    setConfiguredRules(all);
  }, []);

  const deleteAlertRule = useCallback(async (id: string) => {
    await osintRepository.deleteAlertRule(id);
    const all = await osintRepository.getConfiguredAlertRules();
    setConfiguredRules(all);
  }, []);

  // Gestion des statuts et doublons événements (Requirement 5, 6, 8)
  const updateEventStatus = useCallback(async (eventId: string, status: EventStatus) => {
    const updated = await osintRepository.updateEventStatus(eventId, status);
    if (updated) {
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
      if (selectedEvent?.id === eventId) setSelectedEvent(updated);
    }
  }, [selectedEvent]);

  const mergeEventDuplicates = useCallback(async (primaryEventId: string, duplicateIds: string[]) => {
    const merged = await osintRepository.mergeEventDuplicates(primaryEventId, duplicateIds);
    if (merged) {
      const allEvents = await osintRepository.getEvents();
      setEvents(allEvents);
      setSelectedEvent(merged);
    }
  }, []);

  // Gestion des sources OSINT
  const updateSource = useCallback(async (id: string, updates: Partial<OsintSourceItem>) => {
    const updated = await osintRepository.updateSource(id, updates);
    if (updated) {
      setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
      if (selectedSource?.id === id) setSelectedSource(updated);
    }
    return updated;
  }, [selectedSource]);

  const toggleSourceActive = useCallback(async (id: string) => {
    const updated = await osintRepository.toggleSourceActive(id);
    if (updated) {
      setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
      if (selectedSource?.id === id) setSelectedSource(updated);
    }
    return updated;
  }, [selectedSource]);

  // Dossiers complets (Requirement 11)
  const createDossier = useCallback(
    async (data: {
      title: string;
      description: string;
      targetCountries: string[];
      categories: Category[];
      analystNotes: string;
      eventIds?: string[];
    }) => {
      const newDossier = await osintRepository.createDossier(data);
      setDossiers((prev) => [newDossier, ...prev]);
      return newDossier;
    },
    []
  );

  const updateDossier = useCallback(async (id: string, updates: Partial<AnalyticalDossier>) => {
    const updated = await osintRepository.updateDossier(id, updates);
    if (updated) {
      setDossiers((prev) => prev.map((d) => (d.id === id ? updated : d)));
      if (selectedDossier?.id === id) setSelectedDossier(updated);
    }
  }, [selectedDossier]);

  const deleteDossier = useCallback(async (id: string) => {
    await osintRepository.deleteDossier(id);
    setDossiers((prev) => prev.filter((d) => d.id !== id));
    if (selectedDossier?.id === id) setSelectedDossier(null);
  }, [selectedDossier]);

  const toggleArchiveDossier = useCallback(async (id: string) => {
    const updated = await osintRepository.toggleArchiveDossier(id);
    if (updated) {
      setDossiers((prev) => prev.map((d) => (d.id === id ? updated : d)));
      if (selectedDossier?.id === id) setSelectedDossier(updated);
    }
  }, [selectedDossier]);

  const addEventToDossier = useCallback(async (dossierId: string, eventId: string) => {
    await osintRepository.addEventToDossier(dossierId, eventId);
    const updated = await osintRepository.getDossiers();
    setDossiers(updated);
    if (selectedDossier?.id === dossierId) {
      const found = updated.find((d) => d.id === dossierId);
      if (found) setSelectedDossier(found);
    }
  }, [selectedDossier]);

  const removeEventFromDossier = useCallback(async (dossierId: string, eventId: string) => {
    await osintRepository.removeEventFromDossier(dossierId, eventId);
    const updated = await osintRepository.getDossiers();
    setDossiers(updated);
    if (selectedDossier?.id === dossierId) {
      const found = updated.find((d) => d.id === dossierId);
      if (found) setSelectedDossier(found);
    }
  }, [selectedDossier]);

  const addActorToDossier = useCallback(async (dossierId: string, actorId: string) => {
    await osintRepository.addActorToDossier(dossierId, actorId);
    const updated = await osintRepository.getDossiers();
    setDossiers(updated);
  }, []);

  const addSourceToDossier = useCallback(async (dossierId: string, sourceId: string) => {
    await osintRepository.addSourceToDossier(dossierId, sourceId);
    const updated = await osintRepository.getDossiers();
    setDossiers(updated);
  }, []);

  const addNoteToDossier = useCallback(async (dossierId: string, noteId: string) => {
    await osintRepository.addNoteToDossier(dossierId, noteId);
    const updated = await osintRepository.getDossiers();
    setDossiers(updated);
  }, []);

  const saveIntelligenceNote = useCallback(async (data: Partial<IntelligenceNote>) => {
    const saved = await osintRepository.saveIntelligenceNote(data);
    const updatedNotes = await osintRepository.getIntelligenceNotes();
    setNotes(updatedNotes);
    return saved;
  }, []);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const updated = await osintRepository.updateUserProfile(updates);
    setUserProfile(updated);
  }, []);

  const resetToDemoDefaults = useCallback(async () => {
    await osintRepository.resetToDemoDefaults();
    await refreshAll();
  }, [refreshAll]);

  // Gestion des modales spécialisées
  const openAiAnalysis = useCallback((target: { event?: OsintEvent; country?: Country }) => {
    setAiTarget(target);
    setIsAiAnalysisOpen(true);
  }, []);

  const closeAiAnalysis = useCallback(() => {
    setIsAiAnalysisOpen(false);
    setAiTarget(null);
  }, []);

  const openCreateNote = useCallback((presetEvents?: OsintEvent[], presetCountry?: Country) => {
    setNoteModalInitialEvents(presetEvents || []);
    setNoteModalInitialCountry(presetCountry || null);
    setIsNoteModalOpen(true);
  }, []);

  const closeNoteModal = useCallback(() => {
    setIsNoteModalOpen(false);
    setNoteModalInitialEvents([]);
    setNoteModalInitialCountry(null);
  }, []);

  const openDuplicatesModal = useCallback((event: OsintEvent) => {
    setDuplicatesTargetEvent(event);
    setIsDuplicatesModalOpen(true);
  }, []);

  const closeDuplicatesModal = useCallback(() => {
    setIsDuplicatesModalOpen(false);
    setDuplicatesTargetEvent(null);
  }, []);

  // Analytical Exploitation (LOT 14)
  const saveAnalysis = useCallback(async (analysis: OsintAnalysis) => {
    const saved = await osintRepository.saveAnalysis(analysis);
    setAnalyses(await osintRepository.getAnalyses());
    if (selectedAnalysis?.id === analysis.id) setSelectedAnalysis(saved);
    return saved;
  }, [selectedAnalysis]);

  const saveEvidence = useCallback(async (ev: OsintEvidence) => {
    const saved = await osintRepository.saveEvidence(ev);
    setEvidence(prev => {
      const idx = prev.findIndex(e => e.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    return saved;
  }, []);

  const saveHypothesis = useCallback(async (hyp: OsintHypothesis) => {
    const saved = await osintRepository.saveHypothesis(hyp);
    setHypotheses(prev => {
      const idx = prev.findIndex(h => h.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    return saved;
  }, []);

  const saveReport = useCallback(async (report: OsintIntelligenceReport) => {
    await osintRepository.saveReport(report);
    setReports(await osintRepository.getReports());
  }, []);

  const saveProvenance = useCallback(async (item: OsintProvenance) => {
    await osintRepository.saveProvenance(item);
    setProvenance(await osintRepository.getProvenance());
  }, []);

  const deleteReport = useCallback(async (id: string) => {
    await osintRepository.deleteReport(id);
    setReports(await osintRepository.getReports());
  }, []);

  return {
    currentScreen,
    navigateTo,
    countries,
    priorityCountries,
    events,
    filteredEvents,
    alerts,
    configuredRules,
    dossiers,
    sources,
    actors,
    notes,
    analyses,
    evidence,
    hypotheses,
    reports,
    provenance,
    saveProvenance,
    userProfile,
    loading,
    selectedCountry,
    selectCountry: setSelectedCountry,
    selectedEvent,
    selectEvent: setSelectedEvent,
    selectedDossier,
    selectDossier: setSelectedDossier,
    selectedActor,
    selectActor: setSelectedActor,
    selectedSource,
    selectSource: setSelectedSource,
    selectedAnalysis,
    selectAnalysis: setSelectedAnalysis,
    selectedReport,
    selectReport: setSelectedReport,
    saveReport,
    deleteReport,
    saveAnalysis,
    saveEvidence,
    saveHypothesis,
    updateSource,
    toggleSourceActive,
    filters,
    setFilter,
    resetFilters,
    updateCountryRiskLevel,
    acknowledgeAlert,
    toggleCountryMonitoring,
    createAlertRule,
    toggleAlertRule,
    deleteAlertRule,
    updateEventStatus,
    mergeEventDuplicates,
    createDossier,
    updateDossier,
    deleteDossier,
    toggleArchiveDossier,
    addEventToDossier,
    removeEventFromDossier,
    addActorToDossier,
    addSourceToDossier,
    addNoteToDossier,
    saveIntelligenceNote,
    updateUserProfile,
    resetToDemoDefaults,
    isAiAnalysisOpen,
    aiTarget,
    openAiAnalysis,
    closeAiAnalysis,
    isNoteModalOpen,
    noteModalInitialEvents,
    noteModalInitialCountry,
    openCreateNote,
    closeNoteModal,
    isDuplicatesModalOpen,
    duplicatesTargetEvent,
    openDuplicatesModal,
    closeDuplicatesModal,
    stats,
    deviceViewMode,
    setDeviceViewMode,
    isComposeCodeOpen,
    setIsComposeCodeOpen,
  };
}
