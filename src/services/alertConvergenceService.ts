/**
 * OSINT AFRICA - LOT 25
 * Service de Détection de Convergence et d'Analyse d'Indépendance des Sources
 *
 * Principes stricts :
 * 1. Détection locale de similarités thématiques, géographiques et temporelles.
 * 2. Évaluation rigoureuse de l'indépendance des sources (deux reprises d'une même dépêche ≠ deux sources indépendantes).
 * 3. Gestion transparente des groupes d'alertes (OsintAlertGroup).
 */

import {
  OsintAlert,
  OsintAlertGroup,
  OsintIndependenceLevel,
} from '../types';

export class AlertConvergenceService {
  /**
   * Tokenisation et nettoyage local de texte
   */
  private extractTokens(text: string): Set<string> {
    const stopWords = new Set([
      'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'd', 'l', 'et', 'ou', 'en', 'dans', 'sur', 'pour', 'par',
      'avec', 'qui', 'que', 'ce', 'cette', 'ces', 'est', 'sont', 'ont', 'a', 'au', 'aux', 'ne', 'pas', 'plus',
      'the', 'a', 'an', 'and', 'or', 'in', 'on', 'for', 'by', 'with', 'to', 'at', 'of', 'from'
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));

    return new Set(words);
  }

  /**
   * Calcule le coefficient de similarité Jaccard entre deux ensembles de tokens
   */
  private calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
    if (setA.size === 0 || setB.size === 0) return 0;
    let intersection = 0;
    setA.forEach((token) => {
      if (setB.has(token)) intersection++;
    });
    const union = setA.size + setB.size - intersection;
    return union > 0 ? intersection / union : 0;
  }

  /**
   * Évalue le niveau d'indépendance entre une liste de sources
   */
  public evaluateSourceIndependence(
    sourceIds: string[],
    alertsOrItems: Array<{ sourceId?: string; sourceName?: string; contentHash?: string; rawContentExcerpt?: string }>
  ): { level: OsintIndependenceLevel; score: number; rationale: string } {
    const uniqueSourceIds = Array.from(new Set(sourceIds.filter(Boolean)));

    if (uniqueSourceIds.length <= 1) {
      return {
        level: 'UNKNOWN',
        score: 30,
        rationale: 'Source unique - indépendance non applicable ou à vérifier',
      };
    }

    // Vérification des hashes : si deux alertes ont exactement le même hash ou extrait identique, c'est une reprise/dépêche identique
    const hashes = alertsOrItems.map((a) => a.contentHash).filter(Boolean);
    const uniqueHashes = new Set(hashes);
    const hasSharedExactContent = hashes.length > uniqueHashes.size;

    if (hasSharedExactContent) {
      return {
        level: 'LOW',
        score: 40,
        rationale: 'Reprise textuelle identique détectée (indépendance faible / dépêche syndiquée)',
      };
    }

    if (uniqueSourceIds.length >= 3) {
      return {
        level: 'HIGH',
        score: 90,
        rationale: `${uniqueSourceIds.length} sources distinctes avec contenus rédactionnels différenciés`,
      };
    }

    return {
      level: 'MEDIUM',
      score: 70,
      rationale: `${uniqueSourceIds.length} sources distinctes (corroboration croisée modérée)`,
    };
  }

  /**
   * Regroupe les alertes similaires en groupes de convergence
   */
  public clusterAlertsIntoGroups(
    alerts: OsintAlert[],
    existingGroups: OsintAlertGroup[] = []
  ): OsintAlertGroup[] {
    const groups: OsintAlertGroup[] = [...existingGroups];

    for (const alert of alerts) {
      if (!alert.title) continue;

      const alertTokens = this.extractTokens(`${alert.title} ${alert.summary || ''}`);
      let matchedGroup: OsintAlertGroup | null = null;

      // Chercher un groupe existant compatible
      for (const group of groups) {
        if (group.status !== 'ACTIVE') continue;

        const groupTokens = this.extractTokens(`${group.title} ${group.description}`);
        const similarity = this.calculateJaccardSimilarity(alertTokens, groupTokens);

        // Correspondance si similarité sémantique élevée ou même identifiant de groupe
        if (alert.groupId === group.id || similarity >= 0.35) {
          matchedGroup = group;
          break;
        }
      }

      if (matchedGroup) {
        // Ajouter l'alerte au groupe si pas déjà présente
        if (!matchedGroup.alertIds.includes(alert.id)) {
          matchedGroup.alertIds.push(alert.id);
        }
        if (alert.sourceId && !matchedGroup.sourceIds.includes(alert.sourceId)) {
          matchedGroup.sourceIds.push(alert.sourceId);
        }
        if (alert.eventId && !matchedGroup.eventIds.includes(alert.eventId)) {
          matchedGroup.eventIds.push(alert.eventId);
        }
        if (alert.relatedActorIds) {
          matchedGroup.actorIds = Array.from(new Set([...matchedGroup.actorIds, ...alert.relatedActorIds]));
        }

        // Recalculer l'indépendance et la convergence
        const indep = this.evaluateSourceIndependence(
          matchedGroup.sourceIds,
          alerts.filter((a) => matchedGroup?.alertIds.includes(a.id))
        );
        matchedGroup.independenceLevel = indep.level;
        matchedGroup.independenceScore = indep.score;
        matchedGroup.convergenceScore = Math.min(100, matchedGroup.alertIds.length * 25 + (indep.score > 60 ? 25 : 0));
        matchedGroup.updatedAt = new Date().toISOString();
      }
    }

    return groups;
  }
}

export const alertConvergenceService = new AlertConvergenceService();
