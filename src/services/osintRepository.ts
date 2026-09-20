/**
 * OSINT AFRICA - Couche Repository (Architecture Propre)
 * Isole les sources de données pour permettre un remplacement facile
 * des données de démonstration par une API réelle, flux RSS ou base de données future.
 */

import {
  Country,
  OsintEvent,
  OsintAlert,
  AnalyticalDossier,
  UserProfile,
  FilterState,
  OsintSourceItem,
  OsintActor,
  IntelligenceNote,
  SeverityLevel,
  OsintAnalysis,
  OsintEvidence,
  OsintHypothesis,
  ConfiguredAlertRule,
  EventStatus,
  OsintIntelligenceReport,
  OsintProvenance,
} from '../types';
import {
  PRIORITY_COUNTRIES,
  ALL_COUNTRIES,
  DEMO_EVENTS,
  DEMO_ALERTS,
  DEMO_DOSSIERS,
  DEMO_SOURCES,
  REAL_SOURCES,
  INITIAL_SOURCES,
  DEMO_ACTORS,
  DEMO_NOTES,
  DEMO_ANALYSES,
  DEMO_EVIDENCE,
  DEMO_HYPOTHESES,
  DEMO_CONFIGURED_RULES,
  INITIAL_USER_PROFILE,
} from '../data/mockData';
import { mockProductionReports } from '../data/productionData';
import { LOT20_DEMO_PROVENANCES } from '../data/auditDemoData';

const STORAGE_KEYS = {
  DOSSIERS: 'osint_africa_dossiers_v2',
  ALERTS: 'osint_africa_alerts_v2',
  CONFIGURED_RULES: 'osint_africa_rules_v2',
  PROFILE: 'osint_africa_profile_v2',
  EVENTS: 'osint_africa_events_v2',
  SOURCES: 'osint_africa_sources_v2',
  ACTORS: 'osint_africa_actors_v2',
  NOTES: 'osint_africa_notes_v2',
  COUNTRIES: 'osint_africa_countries_v2',
  ANALYSES: 'osint_africa_analyses_v2',
  EVIDENCE: 'osint_africa_evidence_v2',
  HYPOTHESES: 'osint_africa_hypotheses_v2',
  REPORTS: 'osint_africa_reports_v1',
  PROVENANCE: 'osint_africa_audit_v1',
};

class OsintRepository {
  private countries: Country[] = ALL_COUNTRIES;
  private events: OsintEvent[] = [];
  private alerts: OsintAlert[] = [];
  private configuredRules: ConfiguredAlertRule[] = [];
  private dossiers: AnalyticalDossier[] = [];
  private sources: OsintSourceItem[] = [];
  private actors: OsintActor[] = [];
  private notes: IntelligenceNote[] = [];
  private analyses: OsintAnalysis[] = [];
  private evidence: OsintEvidence[] = [];
  private hypotheses: OsintHypothesis[] = [];
  private reports: OsintIntelligenceReport[] = [];
  private provenance: OsintProvenance[] = [];
  private profile: UserProfile = INITIAL_USER_PROFILE;

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage() {
    try {
      const storedCountries = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
      this.countries = storedCountries ? JSON.parse(storedCountries) : ALL_COUNTRIES;

      const storedAnalyses = localStorage.getItem(STORAGE_KEYS.ANALYSES);
      this.analyses = storedAnalyses ? JSON.parse(storedAnalyses) : DEMO_ANALYSES;

      const storedEvidence = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
      this.evidence = storedEvidence ? JSON.parse(storedEvidence) : DEMO_EVIDENCE;

      const storedHypotheses = localStorage.getItem(STORAGE_KEYS.HYPOTHESES);
      this.hypotheses = storedHypotheses ? JSON.parse(storedHypotheses) : DEMO_HYPOTHESES;

      const storedReports = localStorage.getItem(STORAGE_KEYS.REPORTS);
      this.reports = storedReports ? JSON.parse(storedReports) : mockProductionReports;

      const storedProvenance = localStorage.getItem(STORAGE_KEYS.PROVENANCE);
      this.provenance = storedProvenance ? JSON.parse(storedProvenance) : LOT20_DEMO_PROVENANCES;

      const storedDossiers = localStorage.getItem(STORAGE_KEYS.DOSSIERS);
      this.dossiers = storedDossiers ? JSON.parse(storedDossiers) : DEMO_DOSSIERS;

      const storedAlerts = localStorage.getItem(STORAGE_KEYS.ALERTS);
      this.alerts = storedAlerts ? JSON.parse(storedAlerts) : DEMO_ALERTS;

      const storedRules = localStorage.getItem(STORAGE_KEYS.CONFIGURED_RULES);
      this.configuredRules = storedRules ? JSON.parse(storedRules) : DEMO_CONFIGURED_RULES;

      const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      this.profile = storedProfile ? JSON.parse(storedProfile) : INITIAL_USER_PROFILE;

      const storedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      this.events = storedEvents ? JSON.parse(storedEvents) : DEMO_EVENTS;

      const storedSources = localStorage.getItem(STORAGE_KEYS.SOURCES);
      if (storedSources) {
        try {
          const parsed = JSON.parse(storedSources) as OsintSourceItem[];
          const demoMap = new Map<string, OsintSourceItem>();
          DEMO_SOURCES.forEach((ds) => demoMap.set(ds.id, ds));
          parsed
            .filter((s) => !s.isReal)
            .forEach((s) => {
              if (demoMap.has(s.id)) {
                const base = demoMap.get(s.id)!;
                const isActive = s.isActive !== undefined ? s.isActive : (s.status !== 'Inactive' && s.status !== 'Inactif');
                demoMap.set(s.id, {
                  ...base,
                  ...s,
                  isReal: false,
                  isDemo: true,
                  isActive,
                  status: !isActive ? 'Inactive' : 'Démonstration',
                });
              }
            });
          const realMap = new Map<string, OsintSourceItem>();
          REAL_SOURCES.forEach((rs) => {
            const foundInStorage = parsed.find((s) => s.id === rs.id);
            if (foundInStorage) {
              const isActive = foundInStorage.isActive !== undefined ? foundInStorage.isActive : true;
              realMap.set(rs.id, {
                ...rs,
                isActive,
                status: !isActive ? 'Inactive' : rs.status,
                lastChecked: foundInStorage.lastChecked || rs.lastChecked,
              });
            } else {
              realMap.set(rs.id, rs);
            }
          });
          this.sources = [...Array.from(realMap.values()), ...Array.from(demoMap.values())];
        } catch {
          this.sources = INITIAL_SOURCES;
        }
      } else {
        this.sources = INITIAL_SOURCES;
      }

      const storedActors = localStorage.getItem(STORAGE_KEYS.ACTORS);
      this.actors = storedActors ? JSON.parse(storedActors) : DEMO_ACTORS;

      const storedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
      this.notes = storedNotes ? JSON.parse(storedNotes) : DEMO_NOTES;
    } catch {
      this.countries = ALL_COUNTRIES;
      this.dossiers = DEMO_DOSSIERS;
      this.alerts = DEMO_ALERTS;
      this.configuredRules = DEMO_CONFIGURED_RULES;
      this.profile = INITIAL_USER_PROFILE;
      this.events = DEMO_EVENTS;
      this.sources = INITIAL_SOURCES;
      this.actors = DEMO_ACTORS;
      this.notes = DEMO_NOTES;
      this.analyses = DEMO_ANALYSES;
      this.evidence = DEMO_EVIDENCE;
      this.hypotheses = DEMO_HYPOTHESES;
    }
  }

  // Add save methods
  private saveAnalysesToStorage() {
    try { localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(this.analyses)); } catch (e) { console.warn('Storage error', e); }
  }
  private saveEvidenceToStorage() {
    try { localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(this.evidence)); } catch (e) { console.warn('Storage error', e); }
  }
  private saveHypothesesToStorage() {
    try { localStorage.setItem(STORAGE_KEYS.HYPOTHESES, JSON.stringify(this.hypotheses)); } catch (e) { console.warn('Storage error', e); }
  }

  // OsintAnalysis CRUD
  async getAnalyses(): Promise<OsintAnalysis[]> { return [...this.analyses]; }
  async getAnalysisById(id: string): Promise<OsintAnalysis | undefined> { return this.analyses.find(a => a.id === id); }
  async saveAnalysis(analysis: OsintAnalysis): Promise<OsintAnalysis> {
    const index = this.analyses.findIndex(a => a.id === analysis.id);
    if (index >= 0) {
      this.analyses[index] = analysis;
    } else {
      this.analyses.push(analysis);
    }
    this.saveAnalysesToStorage();
    return analysis;
  }

  // OsintEvidence CRUD
  async getEvidenceByEventId(eventId: string): Promise<OsintEvidence[]> { return this.evidence.filter(e => e.eventId === eventId); }
  async saveEvidence(evidence: OsintEvidence): Promise<OsintEvidence> {
    const index = this.evidence.findIndex(e => e.id === evidence.id);
    if (index >= 0) {
      this.evidence[index] = evidence;
    } else {
      this.evidence.push(evidence);
    }
    this.saveEvidenceToStorage();
    return evidence;
  }

  // OsintHypothesis CRUD
  async getHypothesesByAnalysisId(analysisId: string): Promise<OsintHypothesis[]> { return this.hypotheses.filter(h => h.analysisId === analysisId); }
  async saveHypothesis(hypothesis: OsintHypothesis): Promise<OsintHypothesis> {
    const index = this.hypotheses.findIndex(h => h.id === hypothesis.id);
    if (index >= 0) {
      this.hypotheses[index] = hypothesis;
    } else {
      this.hypotheses.push(hypothesis);
    }
    this.saveHypothesesToStorage();
    return hypothesis;
  }

  private saveCountries() {
    try {
      localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(this.countries));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }

  private saveConfiguredRules() {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIGURED_RULES, JSON.stringify(this.configuredRules));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }

  private saveDossiers() {
    try {
      localStorage.setItem(STORAGE_KEYS.DOSSIERS, JSON.stringify(this.dossiers));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }

  private saveAlerts() {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(this.alerts));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }

  private saveProfile() {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(this.profile));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }

  private saveNotes() {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(this.notes));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }

  // Pays (25 pays prioritaires et extension)
  async getPriorityCountries(): Promise<Country[]> {
    const monitoredSet = new Set(this.profile.monitoredCountryIds);
    return this.countries
      .filter((c) => c.isPriority)
      .map((c) => ({
        ...c,
        monitored: monitoredSet.has(c.id),
      }));
  }

  async getAllCountries(): Promise<Country[]> {
    const monitoredSet = new Set(this.profile.monitoredCountryIds);
    return this.countries.map((c) => ({
      ...c,
      monitored: monitoredSet.has(c.id),
    }));
  }

  async getCountryById(id: string): Promise<Country | undefined> {
    const country = this.countries.find((c) => c.id === id || c.code === id);
    if (!country) return undefined;
    return {
      ...country,
      monitored: this.profile.monitoredCountryIds.includes(country.id),
    };
  }

  // Modification manuelle du niveau de surveillance par l'analyste
  async updateCountryRiskLevel(countryId: string, riskLevel: SeverityLevel, manualNote?: string): Promise<Country> {
    const today = new Date().toISOString().split('T')[0];
    let updatedCountry: Country | undefined;

    this.countries = this.countries.map((c) => {
      if (c.id === countryId || c.code === countryId) {
        updatedCountry = {
          ...c,
          riskLevel,
          manualRiskNote: manualNote || `Niveau de surveillance calibré manuellement (${riskLevel})`,
          lastRiskUpdate: today,
        };
        return updatedCountry;
      }
      return c;
    });

    this.saveCountries();
    if (!updatedCountry) {
      throw new Error(`Pays introuvable : ${countryId}`);
    }
    return updatedCountry;
  }

  // Événements & Filtres
  async getEvents(filters?: Partial<FilterState> & { 
    dateRange?: 'all' | '24h' | '7d' | '30d'; 
    sortBy?: 'date' | 'severity' | 'confidence';
    minConfidence?: number;
    subCategory?: string;
    isDemoOnly?: boolean;
  }): Promise<OsintEvent[]> {
    let result = [...this.events];

    // Search (Requirement 3)
    if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.country.toLowerCase().includes(q) ||
          e.region.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.subCategory && e.subCategory.toLowerCase().includes(q)) ||
          e.sourceName.toLowerCase().includes(q) ||
          e.actors.some(a => a.toLowerCase().includes(q))
      );
    }

    // Filter - Country/Region (Requirement 4)
    if (filters?.countryId && filters.countryId !== 'ALL') {
      result = result.filter((e) => e.country === filters.countryId);
    }

    // Filter - Category/SubCategory (Requirement 4)
    if (filters?.category && filters.category !== 'TOUTES') {
      result = result.filter((e) => e.category === filters.category);
    }
    if (filters?.subCategory) {
      result = result.filter((e) => e.subCategory === filters.subCategory);
    }

    // Filter - Status (Requirement 4)
    if (filters?.status && filters.status !== 'TOUS') {
      result = result.filter((e) => e.status === filters.status);
    }

    // Filter - Alert Level (Requirement 4)
    if (filters?.severity && filters.severity !== 'TOUS') {
      result = result.filter((e) => e.alertLevel === filters.severity);
    }

    // Filter - Date (Requirement 5)
    if (filters?.dateRange && filters.dateRange !== 'all') {
      const now = new Date().getTime();
      result = result.filter((e) => {
        const evtTime = new Date(e.publishedAt).getTime();
        const diffHours = (now - evtTime) / (1000 * 60 * 60);
        if (filters.dateRange === '24h') return diffHours <= 24;
        if (filters.dateRange === '7d') return diffHours <= 24 * 7;
        if (filters.dateRange === '30d') return diffHours <= 24 * 30;
        return true;
      });
    }

    // Filter - Demo (Requirement 4)
    if (filters?.isDemoOnly !== undefined) {
      result = result.filter((e) => e.isDemo === filters.isDemoOnly);
    }

    // Sort (Requirement 6)
    if (filters?.sortBy) {
      result.sort((a, b) => {
        if (filters.sortBy === 'date') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        // Add other sorting if needed
        return 0;
      });
    } else {
        // Default sort by date desc
        result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    return result;
  }

  // Correlation helpers (Requirement 9-12)
  async getRelatedEvents(eventId: string): Promise<OsintEvent[]> {
    const event = await this.getEventById(eventId);
    if (!event) return [];
    return this.events.filter(e => event.relatedEventIds.includes(e.id));
  }

  async getEventsBySource(sourceId: string): Promise<OsintEvent[]> {
    return this.events.filter(e => e.sourceId === sourceId);
  }

  async getEventsByCountry(country: string): Promise<OsintEvent[]> {
    return this.events.filter(e => e.country === country);
  }

  async getEventsByCategory(category: string): Promise<OsintEvent[]> {
    return this.events.filter(e => e.category === category);
  }

  // Deduplication/Contradiction helpers (Requirement 13-14)
  async getDuplicates(eventId: string): Promise<OsintEvent[]> {
    const event = await this.getEventById(eventId);
    if (!event) return [];
    // Simple simulation based on title similarity
    return this.events.filter(e => e.id !== event.id && e.title.toLowerCase() === event.title.toLowerCase());
  }

  async getContradictoryEvents(eventId: string): Promise<OsintEvent[]> {
    const event = await this.getEventById(eventId);
    if (!event) return [];
    // Simulation: different status for similar titles
    return this.events.filter(e => e.id !== event.id && e.title.toLowerCase() === event.title.toLowerCase() && e.status !== event.status);
  }

  async updateEventStatus(eventId: string, status: EventStatus): Promise<OsintEvent | undefined> {
    let updated: OsintEvent | undefined;
    this.events = this.events.map((e) => {
      if (e.id === eventId) {
        updated = { ...e, status };
        return updated;
      }
      return e;
    });
    this.saveEvents();
    return updated;
  }

  async mergeEventDuplicates(primaryEventId: string, duplicateIds: string[]): Promise<OsintEvent | undefined> {
    let primary = this.events.find((e) => e.id === primaryEventId);
    if (!primary) return undefined;

    const duplicates = this.events.filter((e) => duplicateIds.includes(e.id));
    const newSources = [...primary.associatedSourcesList];
    const newTags = [...primary.tags];

    duplicates.forEach((d) => {
      if (!newSources.includes(d.source.name)) {
        newSources.push(`${d.source.name} (${d.admiraltyCode})`);
      }
      d.associatedSourcesList.forEach((s) => {
        if (!newSources.includes(s)) newSources.push(s);
      });
      d.tags.forEach((t) => {
        if (!newTags.includes(t)) newTags.push(t);
      });
    });

    primary = {
      ...primary,
      status: 'Confirmé',
      associatedSourcesCount: newSources.length,
      associatedSourcesList: newSources,
      tags: newTags,
      confidenceScore: Math.min(99, Math.max(primary.confidenceScore, 90)),
      detailedAnalysis: `${primary.detailedAnalysis}\n\n[FUSION RECOUPÉE] Informations enrichies par la consolidation de ${duplicates.length} source(s) concordante(s) additionnelle(s).`,
    };

    // Keep primary, update event list
    this.events = this.events.map((e) => (e.id === primaryEventId ? primary! : e));
    this.saveEvents();
    return primary;
  }

  async getEventById(id: string): Promise<OsintEvent | undefined> {
    return this.events.find((e) => e.id === id);
  }

  // Alertes
  async getAlerts(): Promise<OsintAlert[]> {
    return [...this.alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    this.alerts = this.alerts.map((a) =>
      a.id === alertId ? { ...a, acknowledged: true } : a
    );
    this.saveAlerts();
  }

  // Règles d'alerte configurables (Requirement 13)
  async getConfiguredAlertRules(): Promise<ConfiguredAlertRule[]> {
    return [...this.configuredRules];
  }

  async saveConfiguredAlertRule(data: Partial<ConfiguredAlertRule>): Promise<ConfiguredAlertRule> {
    const today = new Date().toISOString().split('T')[0];
    let saved: ConfiguredAlertRule;
    if (data.id && this.configuredRules.some((r) => r.id === data.id)) {
      this.configuredRules = this.configuredRules.map((r) => {
        if (r.id === data.id) {
          saved = { ...r, ...data } as ConfiguredAlertRule;
          return saved;
        }
        return r;
      });
    } else {
      saved = {
        id: `rule-${Date.now()}`,
        name: data.name || 'Nouvelle règle de veille',
        keyword: data.keyword,
        countryId: data.countryId,
        category: data.category || 'TOUTES',
        severity: data.severity || 'TOUS',
        channels: data.channels || ['in_app'],
        emailNotification: data.emailNotification,
        webhookUrl: data.webhookUrl,
        status: data.status || 'active',
        createdAt: today,
        triggeredCount: 0,
        isDemo: true,
      };
      this.configuredRules = [saved, ...this.configuredRules];
    }
    this.saveConfiguredRules();
    return saved!;
  }

  async toggleAlertRule(id: string): Promise<ConfiguredAlertRule | undefined> {
    let updated: ConfiguredAlertRule | undefined;
    this.configuredRules = this.configuredRules.map((r) => {
      if (r.id === id) {
        updated = { ...r, status: r.status === 'active' ? 'paused' : 'active' };
        return updated;
      }
      return r;
    });
    this.saveConfiguredRules();
    return updated;
  }

  async deleteAlertRule(id: string): Promise<void> {
    this.configuredRules = this.configuredRules.filter((r) => r.id !== id);
    this.saveConfiguredRules();
  }

  // Sources (8 types)
  async getSources(filters?: { type?: string; country?: string; search?: string }): Promise<OsintSourceItem[]> {
    let result = [...this.sources];

    if (filters?.type && filters.type !== 'ALL') {
      result = result.filter((s) => s.type === filters.type);
    }

    if (filters?.country && filters.country !== 'ALL') {
      result = result.filter((s) => s.country.toLowerCase().includes(filters.country!.toLowerCase()));
    }

    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q)
      );
    }

    return result;
  }

  async updateSource(id: string, updates: Partial<OsintSourceItem>): Promise<OsintSourceItem | undefined> {
    let updated: OsintSourceItem | undefined;
    this.sources = this.sources.map((s) => {
      if (s.id === id) {
        updated = {
          ...s,
          ...updates,
          updatedAt: new Date().toISOString().split('T')[0],
        };
        return updated;
      }
      return s;
    });
    this.saveSources();
    return updated;
  }

  async toggleSourceActive(id: string): Promise<OsintSourceItem | undefined> {
    let updated: OsintSourceItem | undefined;
    this.sources = this.sources.map((s) => {
      if (s.id === id) {
        const nextActive = !s.isActive;
        let nextStatus = s.status;
        if (!nextActive) {
          nextStatus = 'Inactive';
        } else {
          if (s.isReal) {
            nextStatus = s.isConnected ? 'Réelle / connectée' : 'Réelle / non connectée';
          } else {
            nextStatus = 'Démonstration';
          }
        }

        updated = {
          ...s,
          isActive: nextActive,
          status: nextStatus,
          updatedAt: new Date().toISOString().split('T')[0],
        };
        return updated;
      }
      return s;
    });
    this.saveSources();
    return updated;
  }

  private saveSources(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(this.sources));
    } catch (e) {
      console.error('Failed to persist sources', e);
    }
  }

  private saveEvents(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
    } catch (e) {
      console.error('Failed to persist events', e);
    }
  }

  // Acteurs (6 types)
  async getActors(filters?: { type?: string; country?: string; search?: string }): Promise<OsintActor[]> {
    let result = [...this.actors];

    if (filters?.type && filters.type !== 'ALL') {
      result = result.filter((a) => a.type === filters.type);
    }

    if (filters?.country && filters.country !== 'ALL') {
      result = result.filter((a) => a.country.toLowerCase().includes(filters.country!.toLowerCase()));
    }

    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.country.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q)
      );
    }

    return result;
  }

  // LOT 19: Reports
  async getReports(): Promise<OsintIntelligenceReport[]> {
    return [...this.reports].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getReportById(id: string): Promise<OsintIntelligenceReport | undefined> {
    return this.reports.find((r) => r.id === id);
  }

  async saveReport(report: OsintIntelligenceReport): Promise<OsintIntelligenceReport> {
    const existingIndex = this.reports.findIndex(r => r.id === report.id);
    if (existingIndex >= 0) {
      this.reports[existingIndex] = report;
    } else {
      this.reports.push(report);
    }
    this.persistReports();
    return report;
  }

  async deleteReport(id: string): Promise<boolean> {
    const initialLength = this.reports.length;
    this.reports = this.reports.filter(r => r.id !== id);
    if (this.reports.length < initialLength) {
      this.persistReports();
      return true;
    }
    return false;
  }

  private persistReports() {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(this.reports));
  }

  // Notes de Renseignement
  async getIntelligenceNotes(): Promise<IntelligenceNote[]> {
    return [...this.notes].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async saveIntelligenceNote(data: Partial<IntelligenceNote>): Promise<IntelligenceNote> {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    let savedNote: IntelligenceNote;

    if (data.id && this.notes.some((n) => n.id === data.id)) {
      this.notes = this.notes.map((n) => {
        if (n.id === data.id) {
          savedNote = {
            ...n,
            ...data,
            updatedAt: now,
          } as IntelligenceNote;
          return savedNote;
        }
        return n;
      });
    } else {
      savedNote = {
        id: `note-${Date.now()}`,
        title: data.title || 'Note de Renseignement sans titre',
        object: data.object || 'Objet non spécifié',
        createdAt: now,
        updatedAt: now,
        author: data.author || 'Analyste OSINT',
        classification: data.classification || 'DIFFUSION RESTREINTE',
        targetCountryIds: data.targetCountryIds || [],
        synthese: data.synthese || '',
        faitsPrincipaux: data.faitsPrincipaux || [],
        chronologie: data.chronologie || [],
        acteurs: data.acteurs || [],
        localisation: data.localisation || '',
        evolution: data.evolution || '',
        indicateursSurveillance: data.indicateursSurveillance || [],
        appreciationAnalytique: data.appreciationAnalytique || '',
        conclusion: data.conclusion || '',
        sources: data.sources || [],
        isDemo: true,
      };
      this.notes = [savedNote, ...this.notes];
    }

    this.saveNotes();
    return savedNote!;
  }

  // Dossiers d'analyse
  async getDossiers(): Promise<AnalyticalDossier[]> {
    return [...this.dossiers].sort(
      (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }

  async getDossierById(id: string): Promise<AnalyticalDossier | undefined> {
    return this.dossiers.find((d) => d.id === id);
  }

  async createDossier(data: {
    title: string;
    description: string;
    targetCountries: string[];
    categories: any[];
    analystNotes: string;
    eventIds?: string[];
  }): Promise<AnalyticalDossier> {
    const today = new Date().toISOString().split('T')[0];
    const newDossier: AnalyticalDossier = {
      id: `dos-${Date.now()}`,
      title: data.title,
      description: data.description,
      targetCountries: data.targetCountries,
      categories: data.categories,
      createdDate: today,
      lastUpdated: today,
      analystNotes: data.analystNotes || '',
      eventIds: data.eventIds || [],
      isDemo: true,
    };
    this.dossiers = [newDossier, ...this.dossiers];
    this.saveDossiers();
    return newDossier;
  }

  async addEventToDossier(dossierId: string, eventId: string): Promise<void> {
    this.dossiers = this.dossiers.map((d) => {
      if (d.id === dossierId) {
        const events = d.eventIds.includes(eventId) ? d.eventIds : [...d.eventIds, eventId];
        return {
          ...d,
          eventIds: events,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return d;
    });
    this.saveDossiers();
  }

  async removeEventFromDossier(dossierId: string, eventId: string): Promise<void> {
    this.dossiers = this.dossiers.map((d) => {
      if (d.id === dossierId) {
        return {
          ...d,
          eventIds: d.eventIds.filter((id) => id !== eventId),
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return d;
    });
    this.saveDossiers();
  }

  async updateDossier(id: string, updates: Partial<AnalyticalDossier>): Promise<AnalyticalDossier | undefined> {
    let updated: AnalyticalDossier | undefined;
    this.dossiers = this.dossiers.map((d) => {
      if (d.id === id) {
        updated = {
          ...d,
          ...updates,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
        return updated;
      }
      return d;
    });
    this.saveDossiers();
    return updated;
  }

  async deleteDossier(id: string): Promise<void> {
    this.dossiers = this.dossiers.filter((d) => d.id !== id);
    this.saveDossiers();
  }

  async toggleArchiveDossier(id: string): Promise<AnalyticalDossier | undefined> {
    let updated: AnalyticalDossier | undefined;
    this.dossiers = this.dossiers.map((d) => {
      if (d.id === id) {
        const nextStatus = d.status === 'Archivé' ? 'Actif' : 'Archivé';
        updated = {
          ...d,
          status: nextStatus,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
        return updated;
      }
      return d;
    });
    this.saveDossiers();
    return updated;
  }

  async addActorToDossier(dossierId: string, actorId: string): Promise<void> {
    this.dossiers = this.dossiers.map((d) => {
      if (d.id === dossierId) {
        const actors = d.associatedActorIds ? (d.associatedActorIds.includes(actorId) ? d.associatedActorIds : [...d.associatedActorIds, actorId]) : [actorId];
        return { ...d, associatedActorIds: actors, lastUpdated: new Date().toISOString().split('T')[0] };
      }
      return d;
    });
    this.saveDossiers();
  }

  async addSourceToDossier(dossierId: string, sourceId: string): Promise<void> {
    this.dossiers = this.dossiers.map((d) => {
      if (d.id === dossierId) {
        const sources = d.associatedSourceIds ? (d.associatedSourceIds.includes(sourceId) ? d.associatedSourceIds : [...d.associatedSourceIds, sourceId]) : [sourceId];
        return { ...d, associatedSourceIds: sources, lastUpdated: new Date().toISOString().split('T')[0] };
      }
      return d;
    });
    this.saveDossiers();
  }

  async addNoteToDossier(dossierId: string, noteId: string): Promise<void> {
    this.dossiers = this.dossiers.map((d) => {
      if (d.id === dossierId) {
        const notes = d.associatedNoteIds ? (d.associatedNoteIds.includes(noteId) ? d.associatedNoteIds : [...d.associatedNoteIds, noteId]) : [noteId];
        return { ...d, associatedNoteIds: notes, lastUpdated: new Date().toISOString().split('T')[0] };
      }
      return d;
    });
    this.saveDossiers();
  }

  // Profil et surveillance
  async getUserProfile(): Promise<UserProfile> {
    return { ...this.profile };
  }

  async toggleCountryMonitoring(countryId: string): Promise<boolean> {
    const current = this.profile.monitoredCountryIds;
    let updated: string[];
    let isNowMonitored: boolean;

    if (current.includes(countryId)) {
      updated = current.filter((id) => id !== countryId);
      isNowMonitored = false;
    } else {
      updated = [...current, countryId];
      isNowMonitored = true;
    }

    this.profile = {
      ...this.profile,
      monitoredCountryIds: updated,
    };
    this.saveProfile();
    return isNowMonitored;
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    this.profile = { ...this.profile, ...updates };
    this.saveProfile();
    return { ...this.profile };
  }

  async resetToDemoDefaults(): Promise<void> {
    this.countries = ALL_COUNTRIES;
    this.dossiers = DEMO_DOSSIERS;
    this.alerts = DEMO_ALERTS;
    this.profile = INITIAL_USER_PROFILE;
    this.events = DEMO_EVENTS;
    this.sources = DEMO_SOURCES;
    this.actors = DEMO_ACTORS;
    this.notes = DEMO_NOTES;
    this.saveCountries();
    this.saveDossiers();
    this.saveAlerts();
    this.saveProfile();
    this.saveNotes();
  }

  // Méthodes CRUD pour Provenance
  public getProvenance(): OsintProvenance[] {
    return this.provenance;
  }

  public getProvenanceByObjectId(objectId: string): OsintProvenance | undefined {
    return this.provenance.find(p => p.objectId === objectId);
  }

  public saveProvenance(item: OsintProvenance): void {
    const index = this.provenance.findIndex(p => p.id === item.id);
    if (index !== -1) {
      this.provenance[index] = item;
    } else {
      this.provenance.push(item);
    }
    localStorage.setItem(STORAGE_KEYS.PROVENANCE, JSON.stringify(this.provenance));
  }
}

export const osintRepository = new OsintRepository();
