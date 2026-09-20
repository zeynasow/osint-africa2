import { OsintWeakSignal, OsintSignalAssessment } from '../types';
import { INITIAL_DEMO_WEAK_SIGNALS } from '../data/weakSignalDemoData';

export interface ScoreFactorDetail {
  code: string;
  name: string;
  weight: number; // Ex: 10, 15, etc.
  score: number; // Contribution réelle (0 à weight)
  reason: string;
}

export interface SignalScoreResult {
  score: number; // 0 - 100 ("SCORE DE PRIORISATION DU SIGNAL")
  scoreLabel: 'SCORE DE PRIORISATION DU SIGNAL';
  factors: ScoreFactorDetail[];
  reasons: string[];
}

const STORAGE_KEY_SIGNALS = 'OSINT_WEAK_SIGNALS';
const STORAGE_KEY_ASSESSMENTS = 'OSINT_SIGNAL_ASSESSMENTS';

export class WeakSignalService {
  /**
   * Calcul du Score de Priorisation du Signal (0 à 100)
   * Formule transparente explicable sans prédiction ni probabilité
   */
  public calculateSignalPriorityScore(input: Partial<OsintWeakSignal>): SignalScoreResult {
    const factors: ScoreFactorDetail[] = [];
    let total = 0;

    // 1. RECENCY (Poids 10)
    const recencyScore = input.firstObservedAt ? 8 : 5;
    factors.push({
      code: 'RECENCY',
      name: 'Récence temporelle',
      weight: 10,
      score: recencyScore,
      reason: 'Signal observé récemment dans la fenêtre active'
    });
    total += recencyScore;

    // 2. NOVELTY (Poids 15)
    const noveltyScore = 12;
    factors.push({
      code: 'NOVELTY',
      name: 'Nouveauté / Émergence',
      weight: 15,
      score: noveltyScore,
      reason: 'Absence d’antécédent direct identifié sur le même schéma'
    });
    total += noveltyScore;

    // 3. RECURRENCE (Poids 10)
    const recurrenceScore = input.observedCount && input.observedCount > 1 ? 8 : 4;
    factors.push({
      code: 'RECURRENCE',
      name: 'Récurrence / Répétition',
      weight: 10,
      score: recurrenceScore,
      reason: input.observedCount && input.observedCount > 1 
        ? `${input.observedCount} occurrences rapprochées observées` 
        : 'Première occurrence isolée'
    });
    total += recurrenceScore;

    // 4. TEMPORAL_CLUSTER (Poids 10)
    const temporalScore = 7;
    factors.push({
      code: 'TEMPORAL_CLUSTER',
      name: 'Regroupement temporel',
      weight: 10,
      score: temporalScore,
      reason: 'Concentration temporelle dans une fenêtre de surveillance'
    });
    total += temporalScore;

    // 5. SPATIAL_CLUSTER (Poids 10)
    const spatialScore = (input.countryCodes && input.countryCodes.length > 0) ? 8 : 4;
    factors.push({
      code: 'SPATIAL_CLUSTER',
      name: 'Ancrage / Regroupement géographique',
      weight: 10,
      score: spatialScore,
      reason: 'Ancrage sur une zone ou un pays spécifique'
    });
    total += spatialScore;

    // 6. ACTOR_LINK (Poids 10)
    const actorScore = (input.relatedActorIds && input.relatedActorIds.length > 0) ? 8 : 3;
    factors.push({
      code: 'ACTOR_LINK',
      name: 'Lien acteurs / Entités',
      weight: 10,
      score: actorScore,
      reason: input.relatedActorIds?.length ? 'Implication détectée d’acteurs répertoriés' : 'Aucun acteur spécifique associé'
    });
    total += actorScore;

    // 7. SOURCE_DIVERSITY (Poids 15)
    const srcScore = (input.relatedSourceIds && input.relatedSourceIds.length > 1) ? 12 : 6;
    factors.push({
      code: 'SOURCE_DIVERSITY',
      name: 'Diversité des sources',
      weight: 15,
      score: srcScore,
      reason: input.relatedSourceIds && input.relatedSourceIds.length > 1 ? 'Signals recoupés par multiples sources' : 'Signal émis par une source unique'
    });
    total += srcScore;

    // 8. CROSS_CATEGORY (Poids 10)
    const catScore = (input.categoryIds && input.categoryIds.length > 1) ? 8 : 5;
    factors.push({
      code: 'CROSS_CATEGORY',
      name: 'Transversalité thématique',
      weight: 10,
      score: catScore,
      reason: 'Signal chevauchant plusieurs domaines d’analyse'
    });
    total += catScore;

    // 9. CONTRADICTION (Poids 5)
    const contradictionScore = input.uncertainty?.length ? 4 : 1;
    factors.push({
      code: 'CONTRADICTION',
      name: 'Incertitude / Contradiction',
      weight: 5,
      score: contradictionScore,
      reason: input.uncertainty?.length ? 'Présence d’écarts factuels nécessitant revue' : 'Aucune contradiction évidence'
    });
    total += contradictionScore;

    // 10. VOLUME_CHANGE (Poids 5)
    const volumeScore = input.evolution === 'EN HAUSSE' ? 5 : 2;
    factors.push({
      code: 'VOLUME_CHANGE',
      name: 'Variation de volume',
      weight: 5,
      score: volumeScore,
      reason: input.evolution === 'EN HAUSSE' ? 'Tendance haussière détectée' : 'Volume stable ou stationnaire'
    });
    total += volumeScore;

    const finalScore = Math.min(100, Math.max(0, Math.round(total)));

    return {
      score: finalScore,
      scoreLabel: 'SCORE DE PRIORISATION DU SIGNAL',
      factors,
      reasons: factors.map(f => `${f.name}: ${f.reason} (+${f.score}/${f.weight} pts)`)
    };
  }

  /**
   * Charger les signaux faibles (LocalStorage local + Demo)
   */
  public getWeakSignals(isDemo: boolean = true): OsintWeakSignal[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SIGNALS);
      if (stored) {
        const parsed: OsintWeakSignal[] = JSON.parse(stored);
        return parsed.filter(s => Boolean(s.isDemo) === isDemo);
      }
    } catch {
      // Fallback
    }
    return isDemo ? INITIAL_DEMO_WEAK_SIGNALS : [];
  }

  /**
   * Arbitrage / Évaluation humaine
   */
  public saveAssessment(assessment: OsintSignalAssessment): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ASSESSMENTS);
      const assessments: OsintSignalAssessment[] = stored ? JSON.parse(stored) : [];
      assessments.push(assessment);
      localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(assessments));

      // Mettre à jour le statut du signal dans LocalStorage
      const signalsStored = localStorage.getItem(STORAGE_KEY_SIGNALS);
      let signals: OsintWeakSignal[] = signalsStored ? JSON.parse(signalsStored) : INITIAL_DEMO_WEAK_SIGNALS;
      signals = signals.map(s => {
        if (s.id === assessment.signalId) {
          return {
            ...s,
            status: assessment.newStatus as any,
            analystAssessment: assessment.note || assessment.reason,
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      });
      localStorage.setItem(STORAGE_KEY_SIGNALS, JSON.stringify(signals));
    } catch (err) {
      console.error('Erreur sauvegarde arbitrage signal:', err);
    }
  }

  /**
   * Export JSON local auditabilité
   */
  public exportWeakSignalsJSON(): string {
    const signals = this.getWeakSignals(true).concat(this.getWeakSignals(false));
    return JSON.stringify(signals, null, 2);
  }
}

export const weakSignalService = new WeakSignalService();
