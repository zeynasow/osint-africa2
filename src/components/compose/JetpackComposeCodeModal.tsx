import React, { useState } from 'react';
import { X, Code2, Copy, Check, Download, Layers, Smartphone } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const KOTLIN_FILES = {
  'OsintModels.kt': `package com.osintafrica.app.data.model

/**
 * OSINT AFRICA - Modèles de données Kotlin / Jetpack Compose
 * Architecture modulaire découplée
 */

enum class SeverityLevel {
    CRITIQUE, ELEVE, MODERE, NORMAL
}

enum class OsintCategory(val label: String) {
    SECURITE("Sécurité"),
    DEFENSE("Défense"),
    POLITIQUE("Politique"),
    GROUPES_ARMES("Groupes armés"),
    CRIMINALITE("Criminalité"),
    FRONTIERES("Frontières"),
    MIGRATION("Migration"),
    MARITIME("Maritime"),
    ECONOMIE("Économie"),
    RESSOURCES_NATURELLES("Ressources naturelles"),
    HUMANITAIRE("Humanitaire"),
    ENVIRONNEMENT("Environnement"),
    DESINFORMATION("Information et désinformation")
}

data class GeoCoordinates(
    val latitude: Double,
    val longitude: Double
)

data class AdmiraltyCode(
    val reliability: Char, // A à F
    val credibility: Int   // 1 à 6
) {
    override fun toString(): String = "$reliability$credibility"
}

data class OsintSource(
    val name: String,
    val type: String,
    val admiraltyCode: AdmiraltyCode,
    val isDemo: Boolean = true
)

data class Country(
    val id: String,
    val name: String,
    val code: String,
    val capital: String,
    val region: String,
    val isPriority: Boolean,
    val coordinates: GeoCoordinates,
    val riskLevel: SeverityLevel,
    val isMonitored: Boolean = false
)

data class OsintEvent(
    val id: String,
    val title: String,
    val summary: String,
    val detailedAnalysis: String,
    val countryId: String,
    val countryName: String,
    val coordinates: GeoCoordinates,
    val timestamp: String,
    val category: OsintCategory,
    val severity: SeverityLevel,
    val source: OsintSource,
    val confidenceScore: Int,
    val tags: List<String>,
    val isDemo: Boolean = true
)

data class AnalyticalDossier(
    val id: String,
    val title: String,
    val description: String,
    val targetCountries: List<String>,
    val categories: List<OsintCategory>,
    val analystNotes: String,
    val eventIds: List<String>,
    val isDemo: Boolean = true
)`,

  'OsintRepository.kt': `package com.osintafrica.app.data.repository

import com.osintafrica.app.data.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Interface du Repository OSINT
 * Permet de remplacer facilement le MockDemoRepository par un RemoteApiRepository
 */
interface OsintRepository {
    fun getPriorityCountries(): Flow<List<Country>>
    fun getEvents(category: OsintCategory? = null, severity: SeverityLevel? = null): Flow<List<OsintEvent>>
    fun getActiveAlerts(): Flow<List<OsintEvent>>
    fun getDossiers(): Flow<List<AnalyticalDossier>>
    suspend fun createDossier(dossier: AnalyticalDossier)
    suspend fun toggleCountryMonitoring(countryId: String)
}

/**
 * Implémentation Démonstration avec données fictives
 */
class DemoOsintRepository : OsintRepository {
    private val _countries = MutableStateFlow(DemoDataSource.priorityCountries)
    private val _events = MutableStateFlow(DemoDataSource.demoEvents)
    private val _dossiers = MutableStateFlow(DemoDataSource.initialDossiers)

    override fun getPriorityCountries(): Flow<List<Country>> = _countries.asStateFlow()
    override fun getEvents(category: OsintCategory?, severity: SeverityLevel?): Flow<List<OsintEvent>> = _events.asStateFlow()
    override fun getActiveAlerts(): Flow<List<OsintEvent>> = _events.asStateFlow()
    override fun getDossiers(): Flow<List<AnalyticalDossier>> = _dossiers.asStateFlow()

    override suspend fun createDossier(dossier: AnalyticalDossier) {
        _dossiers.value = listOf(dossier) + _dossiers.value
    }

    override suspend fun toggleCountryMonitoring(countryId: String) {
        _countries.value = _countries.value.map {
            if (it.id == countryId) it.copy(isMonitored = !it.isMonitored) else it
        }
    }
}`,

  'HomeViewModel.kt': `package com.osintafrica.app.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.osintafrica.app.data.model.*
import com.osintafrica.app.data.repository.OsintRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class HomeUiState(
    val criticalAlerts: List<OsintEvent> = emptyList(),
    val highAlerts: List<OsintEvent> = emptyList(),
    val recentEvents: List<OsintEvent> = emptyList(),
    val monitoredCountries: List<Country> = emptyList(),
    val isLoading: Boolean = false
)

class HomeViewModel(
    private val repository: OsintRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState(isLoading = true))
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            combine(
                repository.getPriorityCountries(),
                repository.getEvents()
            ) { countries, events ->
                val critical = events.filter { it.severity == SeverityLevel.CRITIQUE }
                val high = events.filter { it.severity == SeverityLevel.ELEVE }
                val monitored = countries.filter { it.isMonitored }
                
                HomeUiState(
                    criticalAlerts = critical,
                    highAlerts = high,
                    recentEvents = events.take(10),
                    monitoredCountries = monitored,
                    isLoading = false
                )
            }.collect { state ->
                _uiState.value = state
            }
        }
    }
}`,

  'HomeScreen.kt': `package com.osintafrica.app.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.osintafrica.app.ui.components.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigateToEvent: (String) -> Unit,
    onNavigateToCountry: (String) -> Unit
) {
    val state by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("OSINT AFRICA", style = MaterialTheme.typography.titleMedium)
                        Text("Veille et analyse de l'information ouverte", style = MaterialTheme.typography.labelSmall)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF0F1422)
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color(0xFF0B0F17))
        ) {
            // Bandeau Données de Démonstration
            item {
                DemoWatermarkBanner(
                    text = "DONNÉES DE DÉMONSTRATION - ÉVALUATION METHODOLOGIQUE"
                )
            }

            // Alertes Critiques
            item {
                SectionHeader(title = "Alertes Critiques (\${state.criticalAlerts.size})")
            }
            items(state.criticalAlerts) { alert ->
                CriticalAlertCard(event = alert, onClick = { onNavigateToEvent(alert.id) })
            }

            // Pays sous surveillance
            item {
                MonitoredCountriesSection(
                    countries = state.monitoredCountries,
                    onCountryClick = onNavigateToCountry
                )
            }

            // Dernières informations
            item {
                SectionHeader(title = "Dernières informations")
            }
            items(state.recentEvents) { event ->
                OsintEventCard(event = event, onClick = { onNavigateToEvent(event.id) })
            }
        }
    }
}`,

  'NavGraph.kt': `package com.osintafrica.app.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.osintafrica.app.ui.home.HomeScreen
import com.osintafrica.app.ui.map.AfricaMapScreen
import com.osintafrica.app.ui.countries.CountriesScreen
import com.osintafrica.app.ui.feed.FeedScreen
import com.osintafrica.app.ui.alerts.AlertsScreen

sealed class Screen(val route: String, val label: String) {
    object Home : Screen("home", "Accueil")
    object Map : Screen("map", "Carte")
    object Countries : Screen("countries", "Pays")
    object Feed : Screen("feed", "Flux")
    object Alerts : Screen("alerts", "Alertes")
}

@Composable
fun OsintAfricaNavGraph() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = Screen.Home.route
    ) {
        composable(Screen.Home.route) { HomeScreen(...) }
        composable(Screen.Map.route) { AfricaMapScreen(...) }
        composable(Screen.Countries.route) { CountriesScreen(...) }
        composable(Screen.Feed.route) { FeedScreen(...) }
        composable(Screen.Alerts.route) { AlertsScreen(...) }
    }
}`
};

export const JetpackComposeCodeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<keyof typeof KOTLIN_FILES>('OsintModels.kt');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentCode = KOTLIN_FILES[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="compose-code-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="compose-code-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-[#0f1422] border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Architecture Android Native (Kotlin & Jetpack Compose)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  Production-Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Code source Kotlin structuré (ViewModels, Repository, Modèles, Screens) directement utilisable sous Android Studio.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-slate-800 bg-[#0d121d] overflow-x-auto custom-scrollbar">
          {(Object.keys(KOTLIN_FILES) as (keyof typeof KOTLIN_FILES)[]).map((fileName) => (
            <button
              key={fileName}
              onClick={() => setActiveTab(fileName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 flex items-center gap-1.5 border ${
                activeTab === fileName
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{fileName}</span>
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#090d15] text-slate-200 font-mono text-xs leading-relaxed custom-scrollbar">
          <pre className="selection:bg-amber-500/30">
            <code>{currentCode}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2">
          <div className="text-xs text-slate-400 hidden sm:block">
            Architecture MVVM avec Kotlin Coroutines, StateFlow et Material 3 Compose.
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Code copié !' : 'Copier ce fichier Kotlin'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
