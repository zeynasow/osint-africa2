import React, { useState } from 'react';
import { 
  User, 
  Eye, 
  Bell, 
  FolderGit2, 
  Settings, 
  ShieldCheck, 
  MapPin, 
  Trash2, 
  RefreshCw, 
  Code2, 
  Smartphone, 
  Mail, 
  Building, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { UserProfile, Country, AnalyticalDossier, OsintAlert, ScreenId } from '../../types';

interface Props {
  userProfile: UserProfile;
  countries: Country[];
  dossiers: AnalyticalDossier[];
  alerts: OsintAlert[];
  onToggleMonitoring: (countryId: string) => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  onResetDefaults: () => Promise<void>;
  onOpenComposeCode: () => void;
  onNavigate: (screen: ScreenId) => void;
  onSelectDossier: (dossier: AnalyticalDossier) => void;
}

export const ProfileScreen: React.FC<Props> = ({
  userProfile,
  countries,
  dossiers,
  alerts,
  onToggleMonitoring,
  onUpdateProfile,
  onResetDefaults,
  onOpenComposeCode,
  onNavigate,
  onSelectDossier,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profil' | 'pays' | 'alertes' | 'dossiers' | 'parametres'>('profil');
  const [resetting, setResetting] = useState(false);

  const monitoredCountries = countries.filter((c) => c.monitored);

  const handleReset = async () => {
    if (confirm('Voulez-vous réinitialiser toutes les données de démonstration à leur état initial ?')) {
      setResetting(true);
      try {
        await onResetDefaults();
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div id="screen-profil" className="space-y-4 pb-8 animate-fadeIn">
      {/* User Card Header */}
      <div className="bg-[#0f1422] p-4 sm:p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg border border-amber-400/40">
              OA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  {userProfile.name}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                  Accès Analyste
                </span>
              </div>
              <p className="text-xs text-amber-400 font-medium">
                {userProfile.role}
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Building className="w-3 h-3 text-slate-500" />
                {userProfile.organization}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-profile-compose-code"
              onClick={onOpenComposeCode}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
            >
              <Code2 className="w-4 h-4 text-amber-400" />
              <span>Architecture Kotlin / Compose</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-5 pt-3 border-t border-slate-800 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveSubTab('profil')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeSubTab === 'profil'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Profil</span>
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('pays')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeSubTab === 'pays'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Pays surveillés ({monitoredCountries.length})</span>
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('alertes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeSubTab === 'alertes'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              <span>Alertes ({alerts.length})</span>
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('dossiers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeSubTab === 'dossiers'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Dossiers ({dossiers.length})</span>
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('parametres')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeSubTab === 'parametres'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              <span>Paramètres</span>
            </span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Contents */}
      {activeSubTab === 'profil' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Informations de l'analyste
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <span className="text-slate-500 block mb-1">Identifiant d'accès</span>
                <span className="font-mono text-slate-200 font-semibold">{userProfile.id}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <span className="text-slate-500 block mb-1">Adresse électronique</span>
                <span className="text-slate-200">{userProfile.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <span className="text-slate-500 block mb-1">Affectation opérationnelle</span>
                <span className="text-slate-200">{userProfile.organization}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <span className="text-slate-500 block mb-1">Statut d’environnement</span>
                <span className="text-amber-400 font-semibold">Mode Démonstration Actif</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'pays' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pays sous surveillance directe ({monitoredCountries.length})
            </h3>
            <button
              onClick={() => onNavigate('pays')}
              className="text-xs text-amber-400 hover:underline"
            >
              Gérer la liste complète des 25 pays
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {monitoredCountries.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-amber-400">
                    {c.code}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{c.name}</h4>
                    <span className="text-[10px] text-slate-500">{c.region}</span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleMonitoring(c.id)}
                  title="Retirer de ma surveillance"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'alertes' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Gestion & Seuils des alertes
            </h3>
            <button
              onClick={() => onNavigate('alertes')}
              className="text-xs text-amber-400 hover:underline"
            >
              Consulter le centre d'alertes
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Seuil de notification automatique prioritaire
              </label>
              <select
                value={userProfile.notificationSeverityThreshold}
                onChange={(e) => onUpdateProfile({ notificationSeverityThreshold: e.target.value as any })}
                className="w-full sm:w-64 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="CRITIQUE">Seulement CRITIQUE</option>
                <option value="ELEVE">CRITIQUE et ÉLEVÉ</option>
                <option value="MODERE">CRITIQUE, ÉLEVÉ et MODÉRÉ</option>
                <option value="NORMAL">Toutes les alertes</option>
              </select>
            </div>
            <p className="text-slate-500 text-[11px]">
              Toutes les alertes affichées sont étiquetées « DONNÉES DE DÉMONSTRATION » conformément au protocole de test.
            </p>
          </div>
        </div>
      )}

      {activeSubTab === 'dossiers' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mes dossiers d'analyse ({dossiers.length})
            </h3>
            <button
              onClick={() => onNavigate('dossiers')}
              className="text-xs text-amber-400 hover:underline"
            >
              Accéder à la gestion des dossiers
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {dossiers.map((d) => (
              <div
                key={d.id}
                onClick={() => onSelectDossier(d)}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
              >
                <h4 className="text-xs font-bold text-slate-200">{d.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{d.description}</p>
                <div className="mt-2 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>{d.targetCountries.join(', ')}</span>
                  <span>{d.eventIds.length} événements</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'parametres' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-400 text-xs">
              Paramètres système & Environnement de démonstration
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200 block">Code natif Android Kotlin</span>
                  <span className="text-slate-500 text-[11px]">
                    Inspectez les classes ViewModels, Repository et Composables Jetpack Compose.
                  </span>
                </div>
                <button
                  onClick={onOpenComposeCode}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shrink-0"
                >
                  Voir le code
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200 block">Réinitialiser les données de démo</span>
                  <span className="text-slate-500 text-[11px]">
                    Restaure le jeu d'événements, d'alertes et de dossiers d'origine.
                  </span>
                </div>
                <button
                  disabled={resetting}
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 font-semibold text-xs shrink-0 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                  <span>Réinitialiser</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
