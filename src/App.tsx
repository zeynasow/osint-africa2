/**
 * OSINT AFRICA - Application Professionnelle de Veille et d'Analyse
 * Plateforme d'Information Ouverte sur l'Afrique
 * Architecture modulaire découplée (ViewModel / Repository / Models)
 */

import React, { useState } from 'react';
import { useOsintViewModel } from './viewmodels/useOsintViewModel';
import { TopAppBar } from './components/common/TopAppBar';
import { BottomNavigationBar } from './components/common/BottomNavigationBar';
import { DemoWatermarkBanner } from './components/common/DemoWatermarkBanner';
import { HomeScreen } from './components/screens/HomeScreen';
import { MapScreen } from './components/screens/MapScreen';
import { CountriesScreen } from './components/screens/CountriesScreen';
import { FeedScreen } from './components/screens/FeedScreen';
import { AlertCenterScreen } from './components/screens/AlertCenterScreen';
import { CaseManagementScreen } from './components/screens/CaseManagementScreen';
import { SourcesScreen } from './components/screens/SourcesScreen';
import { ActorsScreen } from './components/screens/ActorsScreen';
import { AnalysisCenterScreen } from './components/screens/AnalysisCenterScreen';
import { TemporalScreen } from './components/screens/TemporalScreen';
import { CorrelationCenterScreen } from './components/screens/CorrelationCenterScreen';
import { FusionCenterScreen } from './components/screens/FusionCenterScreen';
import { ProductionCenterScreen } from './components/screens/ProductionCenterScreen';
import { AuditCenterScreen } from './components/screens/AuditCenterScreen';
import { ConnectorCenterScreen } from './components/screens/ConnectorCenterScreen';
import { GovernanceCenterScreen } from './components/screens/GovernanceCenterScreen';
import { CollectionCenterScreen } from './components/screens/CollectionCenterScreen';
import { WatchCenterScreen } from './components/screens/WatchCenterScreen';
import { WeakSignalCenterScreen } from './components/screens/WeakSignalCenterScreen';
import { SituationCenterScreen } from './components/screens/SituationCenterScreen';
import { HypothesisCenterScreen } from './components/screens/HypothesisCenterScreen';
import { DistributionCenterScreen } from './components/screens/DistributionCenterScreen';
import { FeedbackCenterScreen } from './components/screens/FeedbackCenterScreen';
import { RequirementCenterScreen } from './components/screens/RequirementCenterScreen';
import { ResearchPlanningCenterScreen } from './components/screens/ResearchPlanningCenterScreen';
import { VerificationQualificationCenterScreen } from './components/screens/VerificationQualificationCenterScreen';
import { AnalyticalAssessmentCenterScreen } from './components/screens/AnalyticalAssessmentCenterScreen';
import { ProspectiveScenarioCenterScreen } from './components/screens/ProspectiveScenarioCenterScreen';
import { IndicatorMonitoringCenterScreen } from './components/screens/IndicatorMonitoringCenterScreen';
import { SituationSynthesisCenterScreen } from './components/screens/SituationSynthesisCenterScreen';
import { GovernanceDashboardScreen } from './components/screens/GovernanceDashboardScreen';
import { SecurityAccessCenterScreen } from './components/screens/SecurityAccessCenterScreen';
import { CrisisOperationsCenterScreen } from './components/screens/CrisisOperationsCenterScreen';
import { InterserviceCoordinationScreen } from './components/screens/InterserviceCoordinationScreen';
import { mockAnalyses } from './data/mockAnalyses';
import { SearchScreen } from './components/screens/SearchScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { EventDetailModal } from './components/modals/EventDetailModal';
import { CountryDetailDrawer } from './components/modals/CountryDetailDrawer';
import { DossierDetailModal } from './components/modals/DossierDetailModal';
import { AiAnalysisModal } from './components/modals/AiAnalysisModal';
import { AnalysisDetailModal } from './components/modals/AnalysisDetailModal';
import { IntelligenceNoteModal } from './components/modals/IntelligenceNoteModal';
import { DuplicatesModal } from './components/modals/DuplicatesModal';
import { AddToDossierModal } from './components/modals/AddToDossierModal';
import { SourceDetailModal } from './components/modals/SourceDetailModal';
import { JetpackComposeCodeModal } from './components/compose/JetpackComposeCodeModal';
import { Wifi, Battery, Signal } from 'lucide-react';
import { OsintEvent, IntelligenceNote } from './types';
import { alertService } from './services/alertService';

export default function App() {
  const vm = useOsintViewModel();
  const [isCreateDossierOpen, setIsCreateDossierOpen] = useState(false);
  const [addToDossierEvent, setAddToDossierEvent] = useState<OsintEvent | null>(null);
  const [readingNote, setReadingNote] = useState<IntelligenceNote | null>(null);

  // Unread alerts count (LOT 25 - alertes prioritaires en attente de qualification)
  const unreadAlertsCount = alertService.getPendingUrgentAlertsCount();

  const handleNavigateToMapWithCountry = (countryId: string) => {
    vm.setFilter({ countryId });
    vm.navigateTo('carte');
  };

  const handleOpenCountryDetailById = (countryId: string) => {
    const country = vm.countries.find((c) => c.id === countryId || c.code === countryId);
    if (country) {
      vm.selectCountry(country);
    }
  };

  // Main screen renderer
  const renderScreen = () => {
    switch (vm.currentScreen) {
      case 'accueil':
        return (
          <HomeScreen
            stats={vm.stats}
            alerts={vm.alerts}
            recentEvents={vm.events}
            countries={vm.countries}
            dossiers={vm.dossiers}
            notes={vm.notes}
            onSelectEvent={vm.selectEvent}
            onSelectCountry={vm.selectCountry}
            onNavigate={vm.navigateTo}
            onOpenNote={(note) => {
              setReadingNote(note);
              vm.openCreateNote([], undefined);
            }}
            onOpenAiAnalysis={vm.openAiAnalysis}
          />
        );
      case 'carte':
        return (
          <MapScreen
            vm={vm}
            countries={vm.priorityCountries}
            events={vm.events}
            filters={vm.filters}
            onSetFilter={vm.setFilter}
            onResetFilters={vm.resetFilters}
            onSelectEvent={vm.selectEvent}
            onSelectCountry={vm.selectCountry}
          />
        );
      case 'pays':
        return (
          <CountriesScreen
            countries={vm.countries}
            priorityCountries={vm.priorityCountries}
            onSelectCountry={vm.selectCountry}
            onToggleMonitoring={vm.toggleCountryMonitoring}
          />
        );
      case 'flux':
        return (
          <FeedScreen
            events={vm.filteredEvents}
            countries={vm.priorityCountries}
            filters={vm.filters}
            onSetFilter={vm.setFilter}
            onResetFilters={vm.resetFilters}
            onSelectEvent={vm.selectEvent}
            onSelectCountry={vm.selectCountry}
            onOpenAiAnalysis={vm.openAiAnalysis}
            onAddToDossier={(evt) => setAddToDossierEvent(evt)}
            onCheckDuplicates={vm.openDuplicatesModal}
          />
        );
      case 'alertes':
        return <AlertCenterScreen onNavigateToWatch={() => vm.navigateTo('veille')} />;
      case 'dossiers':
        return <CaseManagementScreen />;
      case 'sources':
        return (
          <SourcesScreen
            sources={vm.sources}
            onSelectSource={vm.selectSource}
            onUpdateSource={vm.updateSource}
            onToggleActive={vm.toggleSourceActive}
          />
        );
      case 'acteurs':
        return (
          <ActorsScreen
            actors={vm.actors}
            events={vm.events}
            onSelectEvent={vm.selectEvent}
            onOpenAiAnalysis={vm.openAiAnalysis}
          />
        );
      case 'analyse':
        return (
          <AnalysisCenterScreen
            analyses={vm.analyses}
            events={vm.events}
            onSelectAnalysis={vm.selectAnalysis}
            onOpenCreateAnalysis={(id) => console.log('Create analysis', id)}
          />
        );
      case 'temporel':
        return <TemporalScreen vm={vm} />;
      case 'correlation':
        return <CorrelationCenterScreen vm={vm} />;
      case 'fusion':
        return <FusionCenterScreen vm={vm} />;
      case 'production':
        return <ProductionCenterScreen vm={vm} />;
      case 'qualite':
        return <AuditCenterScreen vm={vm} />;
      case 'connecteurs':
        return <ConnectorCenterScreen vm={vm} />;
      case 'gouvernance':
        return <GovernanceCenterScreen vm={vm} />;
      case 'collecte':
        return <CollectionCenterScreen vm={vm} />;
      case 'veille':
        return <WatchCenterScreen onNavigate={vm.navigateTo} />;
      case 'signaux':
        return <WeakSignalCenterScreen />;
      case 'situation':
        return <SituationCenterScreen />;
      case 'hypotheses':
        return <HypothesisCenterScreen />;
      case 'diffusion':
        return <DistributionCenterScreen vm={vm} />;
      case 'feedback':
        return <FeedbackCenterScreen onNavigate={vm.navigateTo} />;
      case 'requirements':
        return <RequirementCenterScreen onNavigate={vm.navigateTo} />;
      case 'research-planning':
        return <ResearchPlanningCenterScreen onNavigate={vm.navigateTo} />;
      case 'verification-center':
        return <VerificationQualificationCenterScreen onNavigate={vm.navigateTo} />;
      case 'analytical-assessment':
        return <AnalyticalAssessmentCenterScreen />;
      case 'prospective-scenario':
        return <ProspectiveScenarioCenterScreen />;
      case 'indicator-monitoring':
        return <IndicatorMonitoringCenterScreen />;
      case 'situation-synthesis':
        return <SituationSynthesisCenterScreen />;
      case 'governance-dashboard':
        return <GovernanceDashboardScreen />;
      case 'security-center':
        return <SecurityAccessCenterScreen />;
      case 'crisis-center':
        return <CrisisOperationsCenterScreen onNavigate={vm.navigateTo} />;
      case 'coordination-center':
        return <InterserviceCoordinationScreen onNavigate={vm.navigateTo} />;
      case 'recherche':
        return (
          <SearchScreen
            events={vm.events}
            countries={vm.priorityCountries}
            onSelectEvent={vm.selectEvent}
            onSelectCountry={vm.selectCountry}
          />
        );
      case 'profil':
        return (
          <ProfileScreen
            userProfile={vm.userProfile}
            countries={vm.priorityCountries}
            dossiers={vm.dossiers}
            alerts={vm.alerts}
            onToggleMonitoring={vm.toggleCountryMonitoring}
            onUpdateProfile={vm.updateUserProfile}
            onResetDefaults={vm.resetToDemoDefaults}
            onOpenComposeCode={() => vm.setIsComposeCodeOpen(true)}
            onNavigate={vm.navigateTo}
            onSelectDossier={vm.selectDossier}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col items-center justify-start selection:bg-amber-500/30 selection:text-amber-200">
      {/* Container wrapper according to Device View Mode */}
      <div
        className={`w-full transition-all duration-300 ${
          vm.deviceViewMode === 'phone'
            ? 'max-w-[430px] my-4 rounded-[40px] border-[8px] border-slate-800/90 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden bg-[#0b0f17] min-h-[860px] relative'
            : 'max-w-7xl min-h-screen flex flex-col bg-[#0b0f17]'
        }`}
      >
        {/* Simulated Android Status Bar in Phone Mode */}
        {vm.deviceViewMode === 'phone' && (
          <div className="bg-[#0d121d] px-6 pt-2.5 pb-1 flex items-center justify-between text-[11px] font-medium text-slate-400 select-none">
            <span>12:04</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Global Demo Banner */}
        <DemoWatermarkBanner />

        {/* Top App Bar */}
        <TopAppBar
          currentScreen={vm.currentScreen}
          onNavigate={vm.navigateTo}
          unreadAlertsCount={unreadAlertsCount}
          deviceViewMode={vm.deviceViewMode}
          onToggleDeviceMode={() =>
            vm.setDeviceViewMode(vm.deviceViewMode === 'phone' ? 'fluid' : 'phone')
          }
          onOpenComposeCode={() => vm.setIsComposeCodeOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-5 max-w-7xl w-full mx-auto pb-20">
          {renderScreen()}
        </main>

        {/* Material 3 Bottom Navigation Bar */}
        <BottomNavigationBar
          currentScreen={vm.currentScreen}
          onNavigate={vm.navigateTo}
          criticalAlertsCount={vm.stats.criticalAlertsCount}
        />
      </div>

      {/* 1. Event Detail Modal */}
      <EventDetailModal
        event={vm.selectedEvent}
        onClose={() => vm.selectEvent(null)}
        dossiers={vm.dossiers}
        onAddToDossier={vm.addEventToDossier}
        onOpenCountryDetail={handleOpenCountryDetailById}
        onOpenAiAnalysis={vm.openAiAnalysis}
        onOpenCreateNote={(events) => vm.openCreateNote(events)}
        onCheckDuplicates={vm.openDuplicatesModal}
      />

      {/* 2. Country Detail Drawer */}
      <CountryDetailDrawer
        country={vm.selectedCountry}
        onClose={() => vm.selectCountry(null)}
        events={vm.events}
        alerts={vm.alerts}
        onSelectEvent={vm.selectEvent}
        onToggleMonitoring={vm.toggleCountryMonitoring}
        onNavigateToMapWithCountry={handleNavigateToMapWithCountry}
        onUpdateRiskLevel={vm.updateCountryRiskLevel}
        onOpenAiAnalysis={(target) => vm.openAiAnalysis(target)}
        onOpenCreateNote={(events, country) => vm.openCreateNote(events, country)}
      />

      {/* 3. Dossier Detail / Edit Modal */}
      <DossierDetailModal
        dossier={vm.selectedDossier}
        isOpen={Boolean(vm.selectedDossier) || isCreateDossierOpen}
        isCreateMode={isCreateDossierOpen}
        onClose={() => {
          vm.selectDossier(null);
          setIsCreateDossierOpen(false);
        }}
        countries={vm.priorityCountries}
        allEvents={vm.events}
        onSelectEvent={vm.selectEvent}
        onCreateDossier={vm.createDossier}
        onRemoveEventFromDossier={vm.removeEventFromDossier}
      />

      {/* 4. AI Structured Analysis Modal (Requirement 8) */}
      <AiAnalysisModal
        isOpen={vm.isAiAnalysisOpen}
        onClose={vm.closeAiAnalysis}
        target={vm.aiTarget}
        onOpenCreateNote={(events, country) => {
          vm.closeAiAnalysis();
          vm.openCreateNote(events, country);
        }}
      />

      <AnalysisDetailModal
        analysis={vm.selectedAnalysis}
        onClose={() => vm.selectAnalysis(null)}
        vm={vm}
      />

      {/* 5. Intelligence Note Modal (Requirement 10) */}
      <IntelligenceNoteModal
        isOpen={vm.isNoteModalOpen}
        onClose={() => {
          vm.closeNoteModal();
          setReadingNote(null);
        }}
        onSaveNote={vm.saveIntelligenceNote}
        initialEvents={vm.noteModalInitialEvents}
        initialCountry={vm.noteModalInitialCountry}
        existingNote={readingNote}
      />

      {/* 6. Duplicates & Concordance Modal (Requirement 7) */}
      <DuplicatesModal
        isOpen={vm.isDuplicatesModalOpen}
        onClose={vm.closeDuplicatesModal}
        event={vm.duplicatesTargetEvent}
      />

      {/* 7. Add to Dossier Modal (Requirement 10) */}
      <AddToDossierModal
        isOpen={Boolean(addToDossierEvent)}
        onClose={() => setAddToDossierEvent(null)}
        event={addToDossierEvent}
        dossiers={vm.dossiers}
        onAddEventToDossier={vm.addEventToDossier}
        onOpenCreateDossier={() => {
          setAddToDossierEvent(null);
          setIsCreateDossierOpen(true);
        }}
      />

      {/* 8. Source Detail Modal */}
      <SourceDetailModal
        source={vm.selectedSource}
        isOpen={Boolean(vm.selectedSource)}
        onClose={() => vm.selectSource(null)}
        onToggleActive={vm.toggleSourceActive}
        onUpdateSource={vm.updateSource}
      />

      {/* 9. Native Jetpack Compose Kotlin Architecture Inspector */}
      <JetpackComposeCodeModal
        isOpen={vm.isComposeCodeOpen}
        onClose={() => vm.setIsComposeCodeOpen(false)}
      />
    </div>
  );
}
