/**
 * OSINT AFRICA - LOT 25
 * Service de Détection et de Gestion des Contradictions Factuelles
 *
 * Principes stricts :
 * 1. Détection des divergences de dates, bilans chiffrés, lieux, acteurs et statuts.
 * 2. Une contradiction AUGMENTE la priorité de revue humaine.
 * 3. AUCUNE contradiction ne doit être résolue automatiquement (arbitrage humain obligatoire).
 */

import {
  OsintAlert,
  OsintAlertContradiction,
} from '../types';

export class AlertContradictionService {
  /**
   * Analyse et extrait des contradictions potentielles entre alertes ou dépêches
   */
  public detectContradictions(
    alertA: OsintAlert,
    alertB: OsintAlert
  ): OsintAlertContradiction[] {
    const contradictions: OsintAlertContradiction[] = [];

    if (alertA.id === alertB.id) return contradictions;

    const textA = `${alertA.title} ${alertA.summary || ''}`.toLowerCase();
    const textB = `${alertB.title} ${alertB.summary || ''}`.toLowerCase();

    // 1. Détection de divergences de statut / démenti vs revendication
    const hasClaimA = textA.includes('revendique') || textA.includes('confirme') || textA.includes('déclare');
    const hasDenialB = textB.includes('dément') || textB.includes('refuse') || textB.includes('rejette') || textB.includes('infirme');

    if (hasClaimA && hasDenialB) {
      contradictions.push({
        id: `ctrd-${Date.now()}-status`,
        alertId: alertA.id,
        itemAId: alertA.rawItemId || alertA.id,
        itemBId: alertB.rawItemId || alertB.id,
        field: 'Statut / Revendication vs Démenti',
        valueA: alertA.summary?.slice(0, 120) || alertA.title,
        valueB: alertB.summary?.slice(0, 120) || alertB.title,
        detectedAt: new Date().toISOString(),
        status: 'DETECTED',
        isDemo: alertA.isDemo || alertB.isDemo,
      });
    }

    // 2. Détection de divergences de chiffres / bilans
    const numbersA = (alertA.summary || alertA.title).match(/\b\d{1,4}\b/g);
    const numbersB = (alertB.summary || alertB.title).match(/\b\d{1,4}\b/g);

    if (numbersA && numbersB && numbersA.length > 0 && numbersB.length > 0) {
      const numA = parseInt(numbersA[0], 10);
      const numB = parseInt(numbersB[0], 10);
      if (Math.abs(numA - numB) > 5 && (textA.includes('victime') || textA.includes('mort') || textA.includes('blessé') || textA.includes('migrant') || textA.includes('tonne'))) {
        contradictions.push({
          id: `ctrd-${Date.now()}-figures`,
          alertId: alertA.id,
          itemAId: alertA.rawItemId || alertA.id,
          itemBId: alertB.rawItemId || alertB.id,
          field: 'Bilan chiffré / Évaluation quantitative',
          valueA: `Donnée source A : ${numA} (Extrait: ${alertA.title})`,
          valueB: `Donnée source B : ${numB} (Extrait: ${alertB.title})`,
          detectedAt: new Date().toISOString(),
          status: 'DETECTED',
          isDemo: alertA.isDemo || alertB.isDemo,
        });
      }
    }

    return contradictions;
  }
}

export const alertContradictionService = new AlertContradictionService();
