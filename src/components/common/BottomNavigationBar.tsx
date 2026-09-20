import React from 'react';
import { Home, Map, Flag, Activity, Bell, BrainCircuit, Clock, LayoutDashboard } from 'lucide-react';
import { ScreenId } from '../../types';

interface BottomNavProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  criticalAlertsCount: number;
}

export const BottomNavigationBar: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  criticalAlertsCount,
}) => {
  const navItems: {
    id: ScreenId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'accueil', label: 'Accueil', icon: Home },
    { id: 'situation', label: 'Situation', icon: LayoutDashboard },
    { id: 'flux', label: 'Flux', icon: Activity },
    { id: 'analyse', label: 'Analyse', icon: BrainCircuit },
    { id: 'carte', label: 'Carte', icon: Map },
    { id: 'alertes', label: 'Alertes', icon: Bell, badge: criticalAlertsCount },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d121d]/95 backdrop-blur-lg border-t border-slate-800/90 py-1.5 px-3 select-none"
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 group relative active:scale-95"
            >
              {/* Active Pill Indicator (Material 3 style) */}
              <div
                className={`relative px-4 py-1 rounded-full transition-all duration-300 flex items-center justify-center ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-[#0d121d]">
                    {item.badge}
                  </span>
                ) : null}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] mt-1 font-medium transition-colors ${
                  isActive ? 'text-amber-400 font-semibold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
