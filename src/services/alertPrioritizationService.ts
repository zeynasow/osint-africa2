/**
 * OSINT AFRICA - LOT 25
 * Service de Priorisation Transparente et Explicable des Alertes
 *
 * Principes stricts :
 * 1. 100% Local, explicable, auditable et décomposable.
 * 2. AUCUN appel distant, AUCUNE IA opaque, AUCUN LLM externe.
 * 3. Le score (0 à 100) représente strictement la "PRIORITÉ DE REVUE ANALYSTE"
 *    et NON une probabilité de vérité ou une confirmation automatique.
 */

import {
  OsintAlertPriority,
  OsintAlertSeverity,
  OsintAlertConfidence,
  OsintAlertScoreFactor,
  OsintIndependenceLevel,
} from '../types';

export interface PrioritizationInput {
  title: string;
  content?: string;
  category?: string;
  country?: string;
  sourceId?: string;
  publishedAt?: string;
  detectedAt?: string;
  isDuplicate?: boolean;
  duplicateCount?: number;
  sourceCount?: number;
  independenceLevel?: OsintIndependenceLevel;
  hasContradiction?: boolean;
  contradictionCount?: number;
  actorCount?: number;
  isOfficialSource?: boolean;
  isGovernedSource?: boolean;
  rawItemAvailable?: boolean;
  hasSha256?: boolean;
}

export interface PrioritizationResult {
  score: number; // 0 - 100
  priority: OsintAlertPriority;
  severity: OsintAlertSeverity;
  confidence: OsintAlertConfidence;
  factors: OsintAlertScoreFactor[];
  reasons: string[];
  calculatedAt: string;
}

export class AlertPrioritizationService {
  /**
   * Calcule le score de priorisation transparent et explicable
   */
  public calculatePriorityScore(input: PrioritizationInput): PrioritizationResult {
    const factors: OsintAlertScoreFactor[] = [];
    const reasons: string[] = [];
    let totalScore = 0;

    // 1. FACTEUR QUALITÉ ET GOUVERNANCE SOURCE (Poids 15)
    let srcQualityScore = 0;
    if (input.isOfficialSource || input.sourceId === 'src-real-001' || input.sourceId === 'src-aps-001') {
      srcQualityScore = 15;
      reasons.push('Source officielle auditée (APS) avec traçabilité complète');
    } else if (input.isGovernedSource) {
      srcQualityScore = 12;
      reasons.push('Source institutionnelle validée par la gouvernance');
    } else {
      srcQualityScore = 7;
      reasons.push('Source publique standard en cours de qualification');
    }
    factors.push({
      code: 'SOURCE_QUALITY',
      name: 'Qualité et gouvernance source',
      score: srcQualityScore,
      weight: 15,
      reason: reasons[reasons.length - 1],
    });
    totalScore += srcQualityScore;

    // 2. FACTEUR RÉCENCE (Poids 15)
    let recencyScore = 5;
    const now = Date.now();
    const pubTime = input.publishedAt ? new Date(input.publishedAt).getTime() : now;
    const ageHours = Math.max(0, (now - pubTime) / (1000 * 60 * 60));

    if (ageHours <= 2) {
      recencyScore = 15;
      reasons.push('Information très récente (< 2 heures)');
    } else if (ageHours <= 6) {
      recencyScore = 12;
      reasons.push('Information récente (< 6 heures)');
    } else if (ageHours <= 24) {
      recencyScore = 8;
      reasons.push('Information de moins de 24 heures');
    } else {
      recencyScore = 4;
      reasons.push('Information archivée ou consolidée (> 24 heures)');
    }
    factors.push({
      code: 'RECENCY',
      name: 'Récence temporelle',
      score: recencyScore,
      weight: 15,
      reason: reasons[reasons.length - 1],
    });
    totalScore += recencyScore;

    // 3. FACTEUR CONVERGENCE MULTI-SOURCES ET INDÉPENDANCE (Poids 20)
    let convergenceScore = 0;
    const sourceCount = input.sourceCount || 1;
    const independence = input.independenceLevel || 'UNKNOWN';

    if (sourceCount >= 3 && independence === 'HIGH') {
      convergenceScore = 20;
      reasons.push(`Convergence forte (${sourceCount} sources indépendantes distinctes)`);
    } else if (sourceCount >= 2 && (independence === 'HIGH' || independence === 'MEDIUM')) {
      convergenceScore = 15;
      reasons.push(`Convergence modérée (${sourceCount} sources corroborantes)`);
    } else if (sourceCount >= 2 && independence === 'LOW') {
      convergenceScore = 8;
      reasons.push(`Multiples dépêches détectées mais indépendance faible (dépêches dérivées)`);
    } else {
      convergenceScore = 4;
      reasons.push('Source unique - corroboration humaine recommandée');
    }
    factors.push({
      code: 'CROSS_SOURCE_CONVERGENCE',
      name: 'Convergence & Indépendance sources',
      score: convergenceScore,
      weight: 20,
      reason: reasons[reasons.length - 1],
    });
    totalScore += convergenceScore;

    // 4. FACTEUR THÉMATIQUE / CATÉGORIE (Poids 15)
    let catScore = 6;
    const catUpper = (input.category || '').toUpperCase();
    const textLower = ((input.title || '') + ' ' + (input.content || '')).toLowerCase();

    const criticalCategories = ['SECURITY', 'DISASTER', 'MARITIME', 'AVIATION', 'ENERGY', 'INFRASTRUCTURE', 'HEALTH'];
    const highCategories = ['POLITICS', 'DIPLOMACY', 'ECONOMY', 'JUSTICE', 'GOVERNANCE'];
    const mediumCategories = ['TRANSPORT', 'SOCIAL', 'MEDIA'];

    const criticalKeywords = ['sécurité', 'security', 'attaque', 'conflit', 'crise', 'armé', 'maritime', 'naufrage', 'épidémie', 'explosion', 'défense', 'frontière', 'infrastructure critique', 'catastrophe'];
    const highKeywords = ['politique', 'diplomatie', 'élection', 'sanction', 'tension', 'énergie', 'barrage', 'port', 'aéroport', 'justice', 'gouvernance'];

    if (criticalCategories.includes(catUpper)) {
      catScore = 15;
      reasons.push('Thématique sensible (Sécurité / Crise / Infrastructure critique)');
    } else if (highCategories.includes(catUpper)) {
      catScore = 11;
      reasons.push('Thématique stratégique (Politique / Diplomatie / Énergie)');
    } else if (mediumCategories.includes(catUpper)) {
      catScore = 6;
      reasons.push('Thématique sectorielle / civile');
    } else if (criticalKeywords.some((k) => textLower.includes(k))) {
      catScore = 15;
      reasons.push('Mots-clés sensibles détectés (Sécurité / Crise / Infrastructure)');
    } else if (highKeywords.some((k) => textLower.includes(k))) {
      catScore = 11;
      reasons.push('Mots-clés stratégiques détectés (Politique / Diplomatie / Énergie)');
    } else {
      catScore = 3;
      reasons.push('Thématique générale');
    }
    factors.push({
      code: 'CATEGORY_RELEVANCE',
      name: 'Pertinence thématique',
      score: catScore,
      weight: 15,
      reason: reasons[reasons.length - 1],
    });
    totalScore += catScore;

    // 5. FACTEUR CONTRADICTION (Poids 15)
    // Note doctrinale : une contradiction AUGMENTE la priorité de revue humaine urgente
    let contradictionScore = 0;
    if (input.hasContradiction || (input.contradictionCount && input.contradictionCount > 0)) {
      contradictionScore = 15;
      reasons.push('Contradiction ou divergence factuelle détectée (arbitrage prioritaire)');
    } else {
      contradictionScore = 0;
    }
    factors.push({
      code: 'CONTRADICTION',
      name: 'Présence de contradictions',
      score: contradictionScore,
      weight: 15,
      reason: contradictionScore > 0 ? reasons[reasons.length - 1] : 'Aucune contradiction flagrante identifiée',
    });
    totalScore += contradictionScore;

    // 6. FACTEUR INTÉGRITÉ & HASH CRYPTOGRAPHIQUE (Poids 10)
    let integrityScore = 0;
    if (input.hasSha256 && input.rawItemAvailable) {
      integrityScore = 10;
      reasons.push('Intégrité cryptographique SHA-256 certifiée avec RAW conservé');
    } else if (input.hasSha256) {
      integrityScore = 6;
      reasons.push('Empreinte SHA-256 calculée');
    } else {
      integrityScore = 2;
    }
    factors.push({
      code: 'INTEGRITY_AUDIT',
      name: 'Intégrité cryptographique & RAW',
      score: integrityScore,
      weight: 10,
      reason: reasons[reasons.length - 1],
    });
    totalScore += integrityScore;

    // 7. FACTEUR PÉNALITÉ DOUBLON (-25)
    let duplicatePenalty = 0;
    if (input.isDuplicate || (input.duplicateCount && input.duplicateCount > 0)) {
      duplicatePenalty = -25;
      reasons.push('Information déjà répertoriée (doublon dédupliqué)');
      factors.push({
        code: 'DUPLICATION',
        name: 'Pénalité doublon',
        score: duplicatePenalty,
        weight: 0,
        reason: 'Information redondante avec un signal préexistant',
      });
      totalScore += duplicatePenalty;
    }

    // Normalisation finale (bornes 0 - 100)
    const finalScore = Math.max(0, Math.min(100, Math.round(totalScore)));

    // Déduction de la priorité de traitement humaine
    let priority: OsintAlertPriority = 'P5_INFO';
    if (finalScore >= 80) {
      priority = 'P1_CRITICAL';
    } else if (finalScore >= 65) {
      priority = 'P2_HIGH';
    } else if (finalScore >= 45) {
      priority = 'P3_MEDIUM';
    } else if (finalScore >= 25) {
      priority = 'P4_LOW';
    } else {
      priority = 'P5_INFO';
    }

    // Déduction indicative de sévérité (impact potentiel si confirmé)
    let severity: OsintAlertSeverity = 'INFO';
    if (catScore === 15 && srcQualityScore >= 12) {
      severity = 'CRITICAL';
    } else if (catScore >= 11 || (input.hasContradiction && srcQualityScore >= 12)) {
      severity = 'HIGH';
    } else if (catScore >= 6) {
      severity = 'MEDIUM';
    } else {
      severity = 'LOW';
    }

    // Déduction indicative de confiance initiale (qualité de la donnée technique)
    let confidence: OsintAlertConfidence = 'MEDIUM';
    if (srcQualityScore >= 12 && input.hasSha256 && convergenceScore >= 15) {
      confidence = 'HIGH';
    } else if (srcQualityScore >= 12 && input.hasSha256) {
      confidence = 'MEDIUM';
    } else if (input.hasContradiction) {
      confidence = 'LOW';
    } else if (!input.hasSha256) {
      confidence = 'VERY_LOW';
    }

    return {
      score: finalScore,
      priority,
      severity,
      confidence,
      factors,
      reasons,
      calculatedAt: new Date().toISOString(),
    };
  }
}

export const alertPrioritizationService = new AlertPrioritizationService();
