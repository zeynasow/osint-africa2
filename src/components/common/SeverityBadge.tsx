import React from 'react';
import { SeverityLevel } from '../../types';
import { AlertCircle, AlertTriangle, Shield, CheckCircle } from 'lucide-react';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
  showIcon = true,
}) => {
  const getStyle = () => {
    switch (severity) {
      case 'CRITIQUE':
        return {
          bg: 'bg-rose-950/70 border-rose-500/50 text-rose-300',
          dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]',
          label: 'CRITIQUE',
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
        };
      case 'ELEVE':
        return {
          bg: 'bg-orange-950/70 border-orange-500/50 text-orange-300',
          dot: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]',
          label: 'ÉLEVÉ',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />,
        };
      case 'MODERE':
        return {
          bg: 'bg-amber-950/70 border-amber-500/50 text-amber-300',
          dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]',
          label: 'MODÉRÉ',
          icon: <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
        };
      case 'NORMAL':
      default:
        return {
          bg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
          dot: 'bg-emerald-400',
          label: 'NORMAL',
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
        };
    }
  };

  const config = getStyle();

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1 font-semibold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span
      id={`severity-badge-${severity.toLowerCase()}`}
      className={`inline-flex items-center rounded-full border tracking-wide uppercase transition-colors ${config.bg} ${sizeClasses}`}
    >
      {showIcon ? config.icon : <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />}
      <span>{config.label}</span>
    </span>
  );
};
