import React from 'react';
import { Target } from 'lucide-react';

interface Props {
  admiraltyCode: string;
  confidenceScore: number;
  size?: 'sm' | 'md';
}

export const ConfidenceBadge: React.FC<Props> = ({
  admiraltyCode,
  confidenceScore,
  size = 'md',
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40';
    if (score >= 75) return 'text-sky-400 border-sky-500/30 bg-sky-950/40';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-950/40';
    return 'text-rose-400 border-rose-500/30 bg-rose-950/40';
  };

  const style = getScoreColor(confidenceScore);

  return (
    <div
      id={`confidence-badge-${admiraltyCode}`}
      title={`Code d'évaluation Admiralty : ${admiraltyCode} (${confidenceScore}% de confiance)`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border font-mono ${
        size === 'sm' ? 'text-[10px]' : 'text-xs'
      } ${style}`}
    >
      <Target className="w-3 h-3 shrink-0 opacity-80" />
      <span className="font-bold tracking-wider">{admiraltyCode}</span>
      <span className="opacity-40">•</span>
      <span>{confidenceScore}%</span>
    </div>
  );
};
