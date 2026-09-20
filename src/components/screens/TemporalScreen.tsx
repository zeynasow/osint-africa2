import React, { useMemo } from 'react';
import { UseOsintViewModelReturn } from '../../viewmodels/useOsintViewModel';
import { useTemporalAnalysis } from '../../hooks/useTemporalAnalysis';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp, AlertTriangle, Activity, AlertCircle, ArrowUpRight, ArrowDownRight, Minus, Search, Calendar, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TemporalScreenProps {
  vm: UseOsintViewModelReturn;
}

export const TemporalScreen: React.FC<TemporalScreenProps> = ({ vm }) => {
  const { events } = vm;
  const temporal = useTemporalAnalysis(events);

  // Group events by day for the chart
  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    temporal.currentEvents.forEach(e => {
      const date = parseISO(e.publishedAt || e.createdAt || new Date().toISOString());
      const dayStr = format(date, 'MMM dd', { locale: fr });
      data[dayStr] = (data[dayStr] || 0) + 1;
    });
    
    return Object.entries(data).map(([date, count]) => ({ date, count }));
  }, [temporal.currentEvents]);

  const renderTrendIcon = (direction: string) => {
    if (direction === 'INCREASING') return <ArrowUpRight className="w-4 h-4 text-red-400" />;
    if (direction === 'DECREASING') return <ArrowDownRight className="w-4 h-4 text-green-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] overflow-hidden text-gray-200">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800/50 bg-[#111]">
        <div>
          <h1 className="text-2xl font-light text-white tracking-wide flex items-center gap-3">
            <Clock className="w-6 h-6 text-indigo-400" />
            CENTRE DE VEILLE TEMPORELLE
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-mono">DÉTECTION DES TENDANCES OSINT</p>
        </div>
        
        {/* FILTERS */}
        <div className="flex items-center gap-2">
          {['24h', '7d', '30d', '90d'].map(period => (
            <button
              key={period}
              onClick={() => temporal.setSelectedPeriod(period as any)}
              className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${
                temporal.selectedPeriod === period 
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' 
                : 'bg-gray-800/30 text-gray-400 border-gray-700/50 hover:bg-gray-800'
              }`}
            >
              {period === '24h' ? '24 H' : period === '7d' ? '7 JOURS' : period === '30d' ? '30 JOURS' : '90 JOURS'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* KPI ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
            <div className="text-sm text-gray-400 mb-2 flex items-center justify-between">
              ÉVÉNEMENTS
              <Activity className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-3xl font-light text-white flex items-end gap-3">
              {temporal.kpis.eventCount}
              <span className={`text-sm flex items-center pb-1 ${temporal.kpis.variationPercent > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {renderTrendIcon(temporal.kpis.trendDirection)}
                {temporal.kpis.variationPercent > 0 ? '+' : ''}{temporal.kpis.variationPercent}%
              </span>
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
            <div className="text-sm text-gray-400 mb-2 flex items-center justify-between">
              PAYS ACTIFS
              <span className="w-4 h-4 text-gray-500">🌍</span>
            </div>
            <div className="text-3xl font-light text-white">
              {temporal.kpis.activeCountries}
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
            <div className="text-sm text-gray-400 mb-2 flex items-center justify-between">
              SOURCES ENGAGÉES
              <FileText className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-3xl font-light text-white">
              {temporal.kpis.activeSources}
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
            <div className="text-sm text-gray-400 mb-2 flex items-center justify-between">
              ALERTES CRITIQUES
              <AlertTriangle className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-3xl font-light text-white flex items-end gap-3">
              {temporal.kpis.criticalAlerts}
              <span className={`text-sm flex items-center pb-1 ${temporal.kpis.criticalAlerts > temporal.kpis.previousCriticalAlerts ? 'text-red-400' : 'text-gray-400'}`}>
                {temporal.kpis.criticalAlerts > temporal.kpis.previousCriticalAlerts ? <ArrowUpRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                {Math.abs(temporal.kpis.criticalAlerts - temporal.kpis.previousCriticalAlerts)}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CHART AREA */}
          <div className="col-span-1 lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-lg p-5">
            <h2 className="text-sm font-medium text-gray-400 tracking-wider mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              ÉVOLUTION TEMPORELLE DES ÉVÉNEMENTS
            </h2>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666" 
                      tick={{ fill: '#888', fontSize: 12 }} 
                      tickMargin={10}
                    />
                    <YAxis 
                      stroke="#666" 
                      tick={{ fill: '#888', fontSize: 12 }} 
                      allowDecimals={false}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#eee' }}
                      itemStyle={{ color: '#818cf8' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="Événements"
                      stroke="#818cf8" 
                      strokeWidth={2} 
                      dot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#6366f1', stroke: '#111', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 italic">
                  Données insuffisantes pour établir une courbe d'évolution.
                </div>
              )}
            </div>
            <div className="mt-4 p-3 bg-gray-800/30 rounded border border-gray-800 text-xs text-gray-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
              <p>
                <strong>NOTE ANALYTIQUE :</strong> Une tendance statistique (hausse/baisse du volume) reflète le volume d'informations collectées (OBSERVATION) et ne constitue pas automatiquement une validation de menace (INTERPRÉTATION).
              </p>
            </div>
          </div>

          {/* ATTENTION POINTS */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5 flex flex-col">
            <h2 className="text-sm font-medium text-amber-500/80 tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              POINTS D'ATTENTION
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {temporal.attentionPoints.length > 0 ? (
                temporal.attentionPoints.map(point => (
                  <div key={point.id} className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-md">
                    <h3 className="text-sm font-medium text-amber-200 mb-1">{point.title}</h3>
                    <p className="text-xs text-gray-300 mb-2">{point.observation}</p>
                    <div className="text-[11px] text-gray-500 border-t border-amber-500/10 pt-2 mt-2">
                      <span className="font-semibold text-gray-400">Interprétation :</span> {point.interpretation}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={() => vm.setCurrentScreen('analyse')}
                        className="text-[10px] px-2 py-1 bg-amber-500/10 text-amber-400 rounded hover:bg-amber-500/20 transition-colors uppercase font-medium"
                      >
                        Analyser
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 text-center py-8">
                  Aucune anomalie statistique ou récurrence majeure détectée sur la période.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TRENDS BY COUNTRY & CATEGORY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
            <h2 className="text-sm font-medium text-gray-400 tracking-wider mb-4">TENDANCES PAR PAYS</h2>
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-xs font-medium text-gray-500 mb-2 pb-2 border-b border-gray-800">
                <div className="col-span-5">PAYS</div>
                <div className="col-span-3 text-right">VOL. (ACTUEL)</div>
                <div className="col-span-4 text-right">VARIATION</div>
              </div>
              {temporal.countryTrends.length > 0 ? temporal.countryTrends.map(t => (
                <div key={t.country} className="grid grid-cols-12 text-sm items-center py-1">
                  <div className="col-span-5 text-gray-300 truncate">{t.country}</div>
                  <div className="col-span-3 text-right font-mono text-gray-400">{t.current}</div>
                  <div className="col-span-4 flex items-center justify-end gap-2 font-mono">
                    <span className={t.variation > 0 ? 'text-red-400' : t.variation < 0 ? 'text-green-400' : 'text-gray-500'}>
                      {t.variation > 0 ? '+' : ''}{t.variation}%
                    </span>
                    {renderTrendIcon(t.direction)}
                  </div>
                </div>
              )) : (
                <div className="text-sm text-gray-500 text-center py-4">Données insuffisantes</div>
              )}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
            <h2 className="text-sm font-medium text-gray-400 tracking-wider mb-4">TENDANCES PAR CATÉGORIE</h2>
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-xs font-medium text-gray-500 mb-2 pb-2 border-b border-gray-800">
                <div className="col-span-5">CATÉGORIE</div>
                <div className="col-span-3 text-right">VOL. (ACTUEL)</div>
                <div className="col-span-4 text-right">VARIATION</div>
              </div>
              {temporal.categoryTrends.length > 0 ? temporal.categoryTrends.map(t => (
                <div key={t.category} className="grid grid-cols-12 text-sm items-center py-1">
                  <div className="col-span-5 text-gray-300 truncate">{t.category}</div>
                  <div className="col-span-3 text-right font-mono text-gray-400">{t.current}</div>
                  <div className="col-span-4 flex items-center justify-end gap-2 font-mono">
                    <span className={t.variation > 0 ? 'text-red-400' : t.variation < 0 ? 'text-green-400' : 'text-gray-500'}>
                      {t.variation > 0 ? '+' : ''}{t.variation}%
                    </span>
                    {renderTrendIcon(t.direction)}
                  </div>
                </div>
              )) : (
                <div className="text-sm text-gray-500 text-center py-4">Données insuffisantes</div>
              )}
            </div>
          </div>
        </div>

        {/* CHRONOLOGY */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
          <h2 className="text-sm font-medium text-gray-400 tracking-wider mb-6 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            CHRONOLOGIE ANALYTIQUE ({temporal.currentPeriod.label})
          </h2>
          <div className="relative border-l border-gray-800 ml-3 pl-6 space-y-6">
            {temporal.currentEvents
              .sort((a, b) => new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime())
              .slice(0, 15) // Limit to recent 15 for UX
              .map(event => {
                const date = parseISO(event.publishedAt || event.createdAt || new Date().toISOString());
                const isCritical = event.severity === 'CRITIQUE' || event.alertLevel === 'CRITIQUE';
                return (
                  <div key={event.id} className="relative">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[30px] w-3 h-3 rounded-full border-2 border-[#0a0a0a] ${isCritical ? 'bg-red-500' : 'bg-indigo-500'}`} />
                    
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-400">
                            {format(date, 'dd MMM • HH:mm', { locale: fr }).toUpperCase()}
                          </span>
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded-sm bg-gray-800 text-gray-400">
                            {event.country}
                          </span>
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded-sm bg-gray-800 text-gray-400">
                            {event.category}
                          </span>
                          {isCritical && (
                            <span className="text-[10px] uppercase font-bold text-red-400 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> CRITIQUE
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-gray-200 leading-snug">{event.title}</h4>
                      </div>
                      <button 
                        onClick={() => vm.setFilters({ ...vm.filters, countryId: event.country || '' })}
                        className="shrink-0 text-xs text-indigo-400 hover:text-indigo-300 transition-colors whitespace-nowrap"
                      >
                        Filtrer
                      </button>
                    </div>
                  </div>
                );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
