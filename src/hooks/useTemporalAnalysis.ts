import { useMemo, useState } from 'react';
import { OsintEvent, TemporalGranularity, TemporalAttentionPoint, TrendConfidence } from '../types';
import { subDays, subHours, subMonths, isAfter, isBefore, parseISO, differenceInDays, differenceInHours } from 'date-fns';

export interface TemporalPeriod {
  start: Date;
  end: Date;
  label: string;
}

export function useTemporalAnalysis(events: OsintEvent[]) {
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d' | '90d' | 'custom'>('7d');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const currentPeriod = useMemo((): TemporalPeriod => {
    const now = new Date();
    if (selectedPeriod === '24h') return { start: subHours(now, 24), end: now, label: '24 dernières heures' };
    if (selectedPeriod === '7d') return { start: subDays(now, 7), end: now, label: '7 derniers jours' };
    if (selectedPeriod === '30d') return { start: subDays(now, 30), end: now, label: '30 derniers jours' };
    if (selectedPeriod === '90d') return { start: subDays(now, 90), end: now, label: '90 derniers jours' };
    
    if (selectedPeriod === 'custom' && customStartDate && customEndDate) {
      return { start: new Date(customStartDate), end: new Date(customEndDate), label: 'Période personnalisée' };
    }
    
    return { start: subDays(now, 7), end: now, label: '7 derniers jours' };
  }, [selectedPeriod, customStartDate, customEndDate]);

  const previousPeriod = useMemo((): TemporalPeriod => {
    const { start, end } = currentPeriod;
    const diffDays = differenceInDays(end, start);
    if (diffDays > 0) {
      return { start: subDays(start, diffDays), end: start, label: 'Période précédente' };
    }
    const diffHours = differenceInHours(end, start);
    return { start: subHours(start, diffHours), end: start, label: 'Période précédente' };
  }, [currentPeriod]);

  const { currentEvents, previousEvents } = useMemo(() => {
    const current: OsintEvent[] = [];
    const previous: OsintEvent[] = [];
    
    events.forEach(event => {
      const date = parseISO(event.publishedAt || event.createdAt || new Date().toISOString());
      if (isAfter(date, currentPeriod.start) && isBefore(date, currentPeriod.end)) {
        current.push(event);
      } else if (isAfter(date, previousPeriod.start) && isBefore(date, previousPeriod.end)) {
        previous.push(event);
      }
    });

    return { currentEvents: current, previousEvents: previous };
  }, [events, currentPeriod, previousPeriod]);

  // KPIs
  const eventCount = currentEvents.length;
  const previousEventCount = previousEvents.length;
  
  const variation = eventCount - previousEventCount;
  const variationPercent = previousEventCount === 0 
    ? (eventCount > 0 ? 100 : 0) 
    : Math.round((variation / previousEventCount) * 100);

  const activeCountries = new Set(currentEvents.map(e => e.country).filter(Boolean)).size;
  const activeSources = new Set(currentEvents.map(e => e.sourceId).filter(Boolean)).size;
  const criticalAlerts = currentEvents.filter(e => e.severity === 'CRITIQUE' || e.alertLevel === 'CRITIQUE').length;
  const previousCriticalAlerts = previousEvents.filter(e => e.severity === 'CRITIQUE' || e.alertLevel === 'CRITIQUE').length;

  const trendDirection = variation > 0 ? 'INCREASING' : variation < 0 ? 'DECREASING' : 'STABLE';

  // Analysis / Attention Points
  const attentionPoints = useMemo(() => {
    const points: TemporalAttentionPoint[] = [];
    
    // Check for general spike
    if (variationPercent > 50 && eventCount >= 3) {
      points.push({
        id: 'pt-spike-general',
        type: 'SPIKE',
        title: 'Pic d\'activité détecté',
        observation: `${eventCount} événements enregistrés, soit une hausse de ${variationPercent}% par rapport à la période précédente.`,
        interpretation: 'Cette hausse statistique justifie une revue des récents développements.',
        period: currentPeriod.label,
        eventIds: currentEvents.map(e => e.id).slice(0, 5),
        confidence: eventCount > 10 ? 'ELEVEE' : 'MOYENNE',
      });
    }

    // Check for recurrences by country/category
    const categoryByCountry: Record<string, { count: number, ids: string[] }> = {};
    currentEvents.forEach(e => {
      if (e.country && e.category) {
        const key = `${e.country}-${e.category}`;
        if (!categoryByCountry[key]) categoryByCountry[key] = { count: 0, ids: [] };
        categoryByCountry[key].count++;
        categoryByCountry[key].ids.push(e.id);
      }
    });

    Object.entries(categoryByCountry).forEach(([key, data]) => {
      if (data.count >= 3) {
        const [country, category] = key.split('-');
        points.push({
          id: `pt-rec-${key}`,
          type: 'RECURRENCE',
          title: 'Récurrence géographique et thématique',
          observation: `${data.count} événements de catégorie ${category} observés au ${country} sur la période.`,
          interpretation: 'Corrélation temporelle observée dans les données. À examiner pour lien de causalité éventuel.',
          period: currentPeriod.label,
          eventIds: data.ids,
          relatedCountry: country,
          relatedCategory: category,
          confidence: data.count > 5 ? 'ELEVEE' : 'MOYENNE',
        });
      }
    });

    return points;
  }, [currentEvents, variationPercent, eventCount, currentPeriod]);

  // Trends by Country
  const countryTrends = useMemo(() => {
    const currCount: Record<string, number> = {};
    const prevCount: Record<string, number> = {};
    
    currentEvents.forEach(e => { if (e.country) currCount[e.country] = (currCount[e.country] || 0) + 1; });
    previousEvents.forEach(e => { if (e.country) prevCount[e.country] = (prevCount[e.country] || 0) + 1; });
    
    const allCountries = Array.from(new Set([...Object.keys(currCount), ...Object.keys(prevCount)]));
    return allCountries.map(country => {
      const c = currCount[country] || 0;
      const p = prevCount[country] || 0;
      const v = c - p;
      const vp = p === 0 ? (c > 0 ? 100 : 0) : Math.round((v / p) * 100);
      return { country, current: c, previous: p, variation: vp, direction: v > 0 ? 'INCREASING' : v < 0 ? 'DECREASING' : 'STABLE' };
    }).sort((a, b) => b.current - a.current);
  }, [currentEvents, previousEvents]);

  // Trends by Category
  const categoryTrends = useMemo(() => {
    const currCount: Record<string, number> = {};
    const prevCount: Record<string, number> = {};
    
    currentEvents.forEach(e => { if (e.category) currCount[e.category] = (currCount[e.category] || 0) + 1; });
    previousEvents.forEach(e => { if (e.category) prevCount[e.category] = (prevCount[e.category] || 0) + 1; });
    
    const allCategories = Array.from(new Set([...Object.keys(currCount), ...Object.keys(prevCount)]));
    return allCategories.map(category => {
      const c = currCount[category] || 0;
      const p = prevCount[category] || 0;
      const v = c - p;
      const vp = p === 0 ? (c > 0 ? 100 : 0) : Math.round((v / p) * 100);
      return { category, current: c, previous: p, variation: vp, direction: v > 0 ? 'INCREASING' : v < 0 ? 'DECREASING' : 'STABLE' };
    }).sort((a, b) => b.current - a.current);
  }, [currentEvents, previousEvents]);

  return {
    selectedPeriod,
    setSelectedPeriod,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    currentPeriod,
    previousPeriod,
    currentEvents,
    previousEvents,
    kpis: {
      eventCount,
      variationPercent,
      trendDirection,
      activeCountries,
      activeSources,
      criticalAlerts,
      previousCriticalAlerts
    },
    attentionPoints,
    countryTrends,
    categoryTrends
  };
}
