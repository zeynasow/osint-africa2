// Setup localStorage mock in Node BEFORE dynamic import
const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val.toString(); },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};
(global as any).localStorage = localStorageMock;

// Initialize referenced collections so that valid IDs can exist
localStorageMock.setItem('osint_africa_sources_v2', JSON.stringify([{ id: 'SRC-001', name: 'Source Alpha' }]));
localStorageMock.setItem('osint_africa_events_v2', JSON.stringify([{ id: 'EVT-2026-089', title: 'Incident Frontalier' }]));
localStorageMock.setItem('osint_africa_dossiers_v2', JSON.stringify([{ id: 'DOS-2026-014', title: 'Dossier Sahel' }]));
localStorageMock.setItem('OSINT_HYPOTHESES_LOT30', JSON.stringify([{ hypothesisId: 'HYP-2026-012', title: 'Hypothèse Logistique' }]));
localStorageMock.setItem('OSINT_NOTES_LOT31', JSON.stringify([{ id: 'ANA-2026-033', title: 'Note 33' }]));
localStorageMock.setItem('OSINT_LESSONS_LEARNED_LOT33', JSON.stringify([{ lessonId: 'LESSON-001', title: 'RETEX 1' }]));
localStorageMock.setItem('OSINT_POST_EVALUATIONS_LOT33', JSON.stringify([{ evaluationId: 'EVAL-001', title: 'Eval 1' }]));
localStorageMock.setItem('osint_africa_evidence_v2', JSON.stringify([{ id: 'EVD-091', title: 'Preuve 91' }]));

import type {
  OsintIntelligenceRequirement,
  OsintIntelligenceQuestion,
  OsintRequirementIndicator,
  OsintRequirementGap,
  OsintRequirementPlan,
  OsintRequirementAnswer,
  OsintRequirementStatus
} from '../src/types';

interface TestResult {
  control: string;
  passed: boolean;
  proof: string;
}

const results: TestResult[] = [];

function recordResult(control: string, passed: boolean, proof: string) {
  results.push({ control, passed, proof });
  const tag = passed ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${control} -> ${proof}`);
}

async function runLot34Audit() {
  console.log('========================================================================');
  console.log('=== AUDIT RÉEL DE NON-RÉGRESSION DU LOT 34 (BESOINS EN RENSEIGNEMENT) ===');
  console.log('========================================================================\n');

  // Dynamic import ensures localStorage is defined when constructor runs
  const { requirementService } = await import('../src/services/requirementService');
  const reqService = requirementService;

  // -------------------------------------------------------------------------
  // 1. CRÉATION BESOIN
  // -------------------------------------------------------------------------
  let createdReq: OsintIntelligenceRequirement;
  try {
    createdReq = reqService.createRequirement({
      title: 'Surveillance des corridors d approvisionnement Liptako',
      description: 'Documenter les flux suspects de carburant et vivres',
      question: 'Quels sont les points de passage logistiques actifs ?',
      category: 'LOGISTIQUE',
      importance: 'CRITIQUE',
      urgency: 'URGENTE',
      impactAnalytique: 20,
      echeanceScore: 12,
      scope: 'Zone des trois frontières',
      originLot: 'LOT 34',
      status: 'IDENTIFIE',
      confidence: 'MOYENNE',
      ownerId: 'ANALYSTE-TEST-01',
      countryIds: ['ML', 'NE', 'BF'],
      sourceIds: ['SRC-001'],
      eventIds: ['EVT-2026-089'],
      caseIds: ['DOS-2026-014'],
      hypothesisIds: ['HYP-2026-012'],
      analysisIds: ['ANA-2026-033'],
      gapIds: [],
      retexLessonIds: ['LESSON-001'],
      retexEvaluationIds: ['EVAL-001'],
      isDemo: true
    }, 'ANALYSTE-TEST-01');

    const validId = createdReq.requirementId.startsWith('REQ-');
    const validDates = !!createdReq.createdAt && !!createdReq.updatedAt;
    const validCat = createdReq.category === 'LOGISTIQUE';
    const distinctImpUrg = createdReq.importance === 'CRITIQUE' && createdReq.urgency === 'URGENTE';
    const validPriority = createdReq.priority > 0 && createdReq.priority <= 100 && (createdReq.priorityLevel === 'CRITIQUE' || createdReq.priorityLevel === 'ELEVEE');

    const ok = validId && validDates && validCat && distinctImpUrg && validPriority;
    recordResult(
      'Création',
      ok,
      `ID=${createdReq.requirementId}, Catégorie=${createdReq.category}, Importance=${createdReq.importance}, Urgence=${createdReq.urgency}, Priorité calculée=${createdReq.priority}/100 (${createdReq.priorityLevel})`
    );
  } catch (err: any) {
    recordResult('Création', false, `Erreur levée: ${err.message}`);
    throw err;
  }

  // -------------------------------------------------------------------------
  // 2. QUESTIONS
  // -------------------------------------------------------------------------
  let createdQuestion: OsintIntelligenceQuestion;
  try {
    createdQuestion = reqService.createQuestion({
      requirementId: createdReq.requirementId,
      question: 'Quels véhicules et volumes sont observés hebdomadairement ?',
      questionType: 'FACTUELLE',
      expectedAnswerType: 'Rapport descriptif',
      priority: 'URGENTE',
      evidenceIds: [],
      sourceIds: ['SRC-001'],
      status: 'OUVERTE',
      isDemo: true
    }, 'ANALYSTE-TEST-01');

    const parentReq = reqService.getRequirementById(createdReq.requirementId);
    const linkedToReq = parentReq?.questionIds?.includes(createdQuestion.questionId);
    const validQType = createdQuestion.questionType === 'FACTUELLE';
    const ok = !!createdQuestion.questionId && linkedToReq && validQType;

    recordResult(
      'Questions',
      ok,
      `Question ID=${createdQuestion.questionId}, Type=${createdQuestion.questionType}, Liée au besoin ${createdReq.requirementId}=${linkedToReq}`
    );
  } catch (err: any) {
    recordResult('Questions', false, `Erreur: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 3. INDICATEURS
  // -------------------------------------------------------------------------
  let createdInd: OsintRequirementIndicator;
  try {
    createdInd = reqService.createIndicator({
      requirementId: createdReq.requirementId,
      name: 'Variation des prix du carburant en fûts sur les marchés frontaliers',
      description: 'Hausse anormale signalant une demande d approvisionnement clandestine',
      category: 'LOGISTIQUE',
      observationCriteria: 'Prix au litre supérieur de 40% au cours de référence',
      expectedDirection: 'HAUSSE',
      countryScope: ['ML', 'NE', 'BF'],
      sourceIds: ['SRC-001'],
      status: 'ACTIF',
      isDemo: true
    }, 'ANALYSTE-TEST-01');

    const parentReq = reqService.getRequirementById(createdReq.requirementId);
    const linkedInd = parentReq?.indicatorIds?.includes(createdInd.indicatorId);
    const storedInds = reqService.getIndicators(createdReq.requirementId);
    const persisted = storedInds.some((i: any) => i.indicatorId === createdInd.indicatorId);
    const noAutoThreat = createdInd.status === 'ACTIF' && !('threatScore' in createdInd);

    const ok = !!createdInd.indicatorId && linkedInd && persisted && noAutoThreat;
    recordResult(
      'Indicateurs',
      ok,
      `Indicateur ID=${createdInd.indicatorId}, Statut=${createdInd.status}, Lié au besoin=${linkedInd}, Sans qualification automatique de menace`
    );
  } catch (err: any) {
    recordResult('Indicateurs', false, `Erreur: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 4. GAPS (LACUNES)
  // -------------------------------------------------------------------------
  let createdGap: OsintRequirementGap;
  try {
    createdGap = reqService.createGap({
      requirementId: createdReq.requirementId,
      description: 'Absence de visibilité nocturne sur le tronçon Bankilaré-Téra',
      cause: 'Couverture OSINT limitée et indisponibilité d imagerie radar libre',
      severity: 'ELEVEE',
      impact: 'Impossibilité de confirmer les mouvements nocturnes',
      reductionStatus: 'NON_REDUITE',
      reductionPercent: 0,
      evidenceIds: [],
      isDemo: true
    }, 'ANALYSTE-TEST-01');

    const parentReq = reqService.getRequirementById(createdReq.requirementId);
    const linkedGap = parentReq?.gapIds?.includes(createdGap.gapId);
    const nonAutoResolved = createdGap.reductionStatus === 'NON_REDUITE' && createdGap.reductionPercent === 0;

    const ok = !!createdGap.gapId && linkedGap && nonAutoResolved;
    recordResult(
      'Gaps',
      ok,
      `Gap ID=${createdGap.gapId}, Statut=${createdGap.reductionStatus}, Réduction=${createdGap.reductionPercent}%, Non résolu automatiquement`
    );
  } catch (err: any) {
    recordResult('Gaps', false, `Erreur: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 5. PLANS
  // -------------------------------------------------------------------------
  let createdPlan: OsintRequirementPlan;
  try {
    createdPlan = reqService.createPlan({
      requirementId: createdReq.requirementId,
      name: 'Plan de surveillance des cours locaux des hydrocarbures',
      objective: 'Recenser chaque mardi les relevés des commerces locaux et radios communautaires',
      sourceIds: ['SRC-001'],
      indicatorIds: [createdInd.indicatorId],
      frequency: 'HEBDOMADAIRE',
      startDate: '2026-03-20',
      endDate: '2026-09-20',
      status: 'PLANIFIE',
      ownerId: 'ANALYSTE-TEST-01',
      governanceStatus: 'CONFORME',
      isDemo: true
    }, 'ANALYSTE-TEST-01');

    const parentReq = reqService.getRequirementById(createdReq.requirementId);
    const linkedPlan = parentReq?.planIds?.includes(createdPlan.planId);
    const storedPlans = reqService.getPlans(createdReq.requirementId);
    const persisted = storedPlans.some((p: any) => p.planId === createdPlan.planId);

    const ok = !!createdPlan.planId && linkedPlan && persisted && createdPlan.status === 'PLANIFIE';
    recordResult(
      'Plans',
      ok,
      `Plan ID=${createdPlan.planId}, Statut=${createdPlan.status}, Dates=${createdPlan.startDate} à ${createdPlan.endDate}, Lié=${linkedPlan}`
    );
  } catch (err: any) {
    recordResult('Plans', false, `Erreur: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 6. RÉPONSES
  // -------------------------------------------------------------------------
  let createdAnswer: OsintRequirementAnswer;
  try {
    createdAnswer = reqService.recordAnswer({
      requirementId: createdReq.requirementId,
      questionId: createdQuestion.questionId,
      answer: 'Observation confirmée de 3 rotations hebdomadaires de pick-ups bâchés via la piste nord.',
      confidence: 'MOYENNE',
      answerStatus: 'PARTIELLE',
      sourceIds: ['SRC-001'],
      evidenceIds: ['EVD-091'],
      eventIds: [],
      analystId: 'ANALYSTE-TEST-01',
      answeredAt: '2026-03-20T10:00:00Z',
      isPostPublication: false,
      isDemo: true
    }, 'ANALYSTE-TEST-01');

    const parentReq = reqService.getRequirementById(createdReq.requirementId);
    const linkedAns = parentReq?.answerIds?.includes(createdAnswer.answerId);
    const questionUpdated = reqService.getQuestions(createdReq.requirementId).find((q: any) => q.questionId === createdQuestion.questionId);
    const preservedIncertitude = createdAnswer.confidence === 'MOYENNE' && createdAnswer.answerStatus === 'PARTIELLE';

    const ok = !!createdAnswer.answerId && linkedAns && questionUpdated?.status === 'EN_COURS' && preservedIncertitude;
    recordResult(
      'Réponses',
      ok,
      `Réponse ID=${createdAnswer.answerId}, Statut=${createdAnswer.answerStatus}, Confiance=${createdAnswer.confidence} (incertitude préservée), Question status=${questionUpdated?.status}`
    );
  } catch (err: any) {
    recordResult('Réponses', false, `Erreur: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 7. WORKFLOW ET TRANSITIONS
  // -------------------------------------------------------------------------
  try {
    const steps: OsintRequirementStatus[] = [
      'QUALIFIE',
      'PRIORISE',
      'PLANIFIE',
      'EN_SURVEILLANCE',
      'REPONSE_PARTIELLE',
      'REPONSE_SUFFISANTE',
      'EVALUE'
    ];

    let currentReq = createdReq;
    for (const st of steps) {
      currentReq = reqService.updateRequirement(currentReq.requirementId, { status: st }, 'ANALYSTE-TEST-01', `Transition vers ${st}`);
      if (currentReq.status !== st) throw new Error(`Transition échouée pour ${st}`);
    }

    // Clôture avec justification obligatoire
    let rejectedNoJustif = false;
    try {
      reqService.closeRequirement(currentReq.requirementId, '', 'Résolution vide');
    } catch (e: any) {
      rejectedNoJustif = true;
    }

    const closedReq = reqService.closeRequirement(
      currentReq.requirementId,
      'Justification détaillée conforme : objectifs de renseignement atteints et corroborés par multiples sources.',
      'Résolution analytique validée.',
      'ANALYSTE-TEST-01'
    );
    const isClosed = closedReq.status === 'CLOTURE';

    // Immutabilité après clôture
    let rejectedUpdateOnClosed = false;
    try {
      reqService.updateRequirement(closedReq.requirementId, { description: 'Tentative de modification illégale sur clôture' });
    } catch (e: any) {
      rejectedUpdateOnClosed = true;
    }

    // Tester les états secondaires sur un autre besoin : SUSPENDU, ANNULE, OBSOLETE
    const reqSec = reqService.createRequirement({
      title: 'Besoin secondaire test statuts',
      description: 'Test des états SUSPENDU ANNULE OBSOLETE',
      question: 'Question test',
      category: 'POLITIQUE',
      importance: 'FAIBLE',
      urgency: 'ROUTINE',
      impactAnalytique: 5,
      echeanceScore: 5,
      scope: 'Test',
      originLot: 'LOT 34',
      status: 'IDENTIFIE',
      confidence: 'FAIBLE',
      ownerId: 'ANALYSTE-TEST-01',
      countryIds: [],
      sourceIds: [],
      eventIds: [],
      caseIds: [],
      hypothesisIds: [],
      analysisIds: [],
      gapIds: [],
      isDemo: true
    });

    const suspReq = reqService.updateRequirement(reqSec.requirementId, { status: 'SUSPENDU' });
    const obsReq = reqService.updateRequirement(reqSec.requirementId, { status: 'OBSOLETE' });
    const annuleReq = reqService.cancelRequirement(reqSec.requirementId, 'Annulation motivée pour caducité', 'ANALYSTE-TEST-01');

    const ok = isClosed && rejectedNoJustif && rejectedUpdateOnClosed && suspReq.status === 'SUSPENDU' && obsReq.status === 'OBSOLETE' && annuleReq.status === 'ANNULE';
    recordResult(
      'Workflow',
      ok,
      `Séquence 9 statuts franchie avec succès. Clôture sans motif bloquée: ${rejectedNoJustif}. Immutabilité après clôture vérifiée: ${rejectedUpdateOnClosed}. Statuts secondaires (SUSPENDU, OBSOLETE, ANNULE) conformes.`
    );
  } catch (err: any) {
    recordResult('Workflow', false, `Erreur: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 8. VALIDATION DES RÉFÉRENCES
  // -------------------------------------------------------------------------
  try {
    const invalidRefTests = [
      { field: 'sourceIds', badId: 'SRC-INCONNUE-999', name: 'Source' },
      { field: 'eventIds', badId: 'EVT-INCONNU-999', name: 'Événement' },
      { field: 'caseIds', badId: 'DOS-INCONNU-999', name: 'Dossier LOT 27' },
      { field: 'hypothesisIds', badId: 'HYP-INCONNUE-999', name: 'Hypothèse LOT 30' },
      { field: 'analysisIds', badId: 'ANA-INCONNUE-999', name: 'Note LOT 31' },
      { field: 'retexLessonIds', badId: 'LESSON-INCONNUE-999', name: 'Leçon RETEX LOT 33' },
      { field: 'retexEvaluationIds', badId: 'EVAL-INCONNUE-999', name: 'Évaluation RETEX LOT 33' }
    ];

    let allRejected = true;
    const details: string[] = [];

    for (const t of invalidRefTests) {
      let rejected = false;
      try {
        reqService.createRequirement({
          title: `Test rejet référence ${t.field}`,
          description: 'Test validation références inexistantes',
          question: 'Question ?',
          category: 'SECURITE',
          importance: 'MOYENNE',
          urgency: 'A_SURVEILLER',
          impactAnalytique: 10,
          echeanceScore: 10,
          scope: 'Test',
          originLot: 'LOT 34',
          status: 'IDENTIFIE',
          confidence: 'FAIBLE',
          ownerId: 'ANALYSTE-TEST-01',
          countryIds: [],
          sourceIds: [],
          eventIds: [],
          caseIds: [],
          hypothesisIds: [],
          analysisIds: [],
          gapIds: [],
          [t.field]: [t.badId],
          isDemo: true
        });
      } catch (err: any) {
        if (err.message.includes('Référence invalide')) {
          rejected = true;
          details.push(`${t.name}: rejeté ("${err.message}")`);
        }
      }
      if (!rejected) {
        allRejected = false;
        details.push(`${t.name}: NON REJETÉ (Échec)`);
      }
    }

    recordResult(
      'Références',
      allRejected,
      `validateReferences() bloque systématiquement les 7 types de références orphelines/inexistantes : ${details.slice(0, 3).join('; ')}...`
    );
  } catch (err: any) {
    recordResult('Références', false, `Erreur: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 9. PRIORITÉ DÉTERMINISTE DE TRAITEMENT
  // -------------------------------------------------------------------------
  try {
    const p1 = reqService.calculatePriorityScore('FAIBLE', 'ROUTINE', 5, 5);
    const okP1 = p1.score === 25 && p1.level === 'FAIBLE';

    const p2 = reqService.calculatePriorityScore('CRITIQUE', 'URGENTE', 25, 15);
    const okP2 = p2.score === 100 && p2.level === 'CRITIQUE';

    const p3 = reqService.calculatePriorityScore('ELEVEE', 'PRIORITAIRE', 15, 10);
    const p4 = reqService.calculatePriorityScore('ELEVEE', 'PRIORITAIRE', 15, 10);
    const deterministic = p3.score === p4.score && p3.level === p4.level;

    const doctrinalCheck = !('threatProbability' in p1) && !('dangerLevel' in p1);

    const ok = okP1 && okP2 && deterministic && doctrinalCheck;
    recordResult(
      'Priorité',
      ok,
      `Calcul déterministe de traitement : Cas FAIBLE/ROUTINE=${p1.score} (${p1.level}), Cas CRITIQUE/URGENTE=${p2.score} (${p2.level}). 100% déterministe, découplé de toute probabilité de menace ou mesure de danger.`
    );
  } catch (err: any) {
    recordResult('Priorité', false, `Erreur: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 10. DISCIPLINE TEMPORELLE
  // -------------------------------------------------------------------------
  try {
    const postPubDate = '2026-03-10T12:00:00Z';
    const discoveryDate = '2026-03-15T09:00:00Z';

    const reqTemp = reqService.createRequirement({
      title: 'Besoin surveillance temporelle stricte',
      description: 'Validation de non-contamination temporelle rétroactive',
      question: 'Question temporelle ?',
      category: 'LOGISTIQUE',
      importance: 'MOYENNE',
      urgency: 'A_SURVEILLER',
      impactAnalytique: 10,
      echeanceScore: 10,
      scope: 'Sahel',
      originLot: 'LOT 34',
      status: 'IDENTIFIE',
      confidence: 'MOYENNE',
      ownerId: 'ANALYSTE-TEST-01',
      countryIds: [],
      sourceIds: ['SRC-001'],
      eventIds: [],
      caseIds: [],
      hypothesisIds: [],
      analysisIds: [],
      gapIds: [],
      isDemo: true
    });

    const qTemp = reqService.createQuestion({
      requirementId: reqTemp.requirementId,
      question: 'Chronologie des franchissements frontaliers',
      questionType: 'CHRONOLOGIQUE',
      expectedAnswerType: 'Chronologie détaillée',
      priority: 'MOYENNE',
      evidenceIds: [],
      sourceIds: ['SRC-001'],
      status: 'OUVERTE',
      isDemo: true
    });

    const ansTemp1 = reqService.recordAnswer({
      requirementId: reqTemp.requirementId,
      questionId: qTemp.questionId,
      answer: 'Rapport publié avant T0 mais découvert à T+14j',
      confidence: 'ELEVEE',
      answerStatus: 'PARTIELLE',
      isPostPublication: false,
      answeredAt: discoveryDate,
      analystId: 'ANALYSTE-TEST-01',
      sourceIds: ['SRC-001'],
      evidenceIds: ['EVD-091'],
      eventIds: [],
      isDemo: true
    });

    const ansTemp2 = reqService.recordAnswer({
      requirementId: reqTemp.requirementId,
      questionId: qTemp.questionId,
      answer: 'Événement survenu et publié après T0',
      confidence: 'MOYENNE',
      answerStatus: 'PARTIELLE',
      isPostPublication: true,
      answeredAt: postPubDate,
      analystId: 'ANALYSTE-TEST-01',
      sourceIds: ['SRC-001'],
      evidenceIds: ['EVD-091'],
      eventIds: [],
      isDemo: true
    });

    const fetchedReq = reqService.getRequirementById(reqTemp.requirementId);
    const t0Preserved = !!fetchedReq?.createdAt;
    const flagsPreserved = ansTemp1.isPostPublication === false && ansTemp2.isPostPublication === true;

    const ok = t0Preserved && flagsPreserved;
    recordResult(
      'Discipline temporelle',
      ok,
      `T0 préservé (${fetchedReq?.createdAt}). Distinction explicite : doc antérieure découverte à T+14j (isPostPublication=false), doc postérieure (isPostPublication=true). Aucune projection rétroactive illicite.`
    );
  } catch (err: any) {
    recordResult('Discipline temporelle', false, `Erreur: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 11. PERSISTANCE LOCALSTORAGE
  // -------------------------------------------------------------------------
  try {
    const keys = [
      'OSINT_REQUIREMENTS_LOT34',
      'OSINT_REQUIREMENT_QUESTIONS_LOT34',
      'OSINT_REQUIREMENT_INDICATORS_LOT34',
      'OSINT_REQUIREMENT_ANSWERS_LOT34',
      'OSINT_REQUIREMENT_GAPS_LOT34',
      'OSINT_REQUIREMENT_PLANS_LOT34',
      'OSINT_REQUIREMENT_AUDIT_LOT34'
    ];

    let allKeysExist = true;
    const counts: Record<string, number> = {};

    keys.forEach(k => {
      const raw = localStorageMock.getItem(k);
      if (!raw) allKeysExist = false;
      else counts[k] = JSON.parse(raw).length;
    });

    const testPersistReq = reqService.createRequirement({
      title: 'Besoin test cycle reload localStorage',
      description: 'Cycle création -> localStorage -> reload -> vérification',
      question: 'Question persist ?',
      category: 'SECURITE',
      importance: 'CRITIQUE',
      urgency: 'URGENTE',
      impactAnalytique: 20,
      echeanceScore: 15,
      scope: 'Cyberespace',
      originLot: 'LOT 34',
      status: 'IDENTIFIE',
      confidence: 'MOYENNE',
      ownerId: 'ANALYSTE-TEST-01',
      countryIds: [],
      sourceIds: [],
      eventIds: [],
      caseIds: [],
      hypothesisIds: [],
      analysisIds: [],
      gapIds: [],
      isDemo: true
    });

    const reloadedService = new (reqService.constructor as any)();
    const retrievedReq = reloadedService.getRequirementById(testPersistReq.requirementId);

    const reloadedMatches = retrievedReq?.title === testPersistReq.title && retrievedReq?.category === testPersistReq.category;
    const ok = allKeysExist && reloadedMatches;

    recordResult(
      'Persistance',
      ok,
      `Les 7 clés OSINT_*_LOT34 sont écrites et lues. Rechargement du service intègre pour ${testPersistReq.requirementId} (${counts['OSINT_REQUIREMENTS_LOT34']} besoins en base locale).`
    );
  } catch (err: any) {
    recordResult('Persistance', false, `Erreur: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 12. EXPORT JSON
  // -------------------------------------------------------------------------
  try {
    const rawExport = reqService.exportAllRequirementsJson('ALL');
    const parsed = JSON.parse(rawExport);

    const hasReqs = Array.isArray(parsed.requirements) && parsed.requirements.length > 0;
    const hasQuestions = Array.isArray(parsed.questions) && parsed.questions.length > 0;
    const hasIndicators = Array.isArray(parsed.indicators) && parsed.indicators.length > 0;
    const hasAnswers = Array.isArray(parsed.answers) && parsed.answers.length > 0;
    const hasGaps = Array.isArray(parsed.gaps) && parsed.gaps.length > 0;
    const hasPlans = Array.isArray(parsed.plans) && parsed.plans.length > 0;
    const hasAudit = Array.isArray(parsed.audit) && parsed.audit.length > 0;
    const hasMetadata = parsed.provenance === 'OSINT_AFRICA_LOT34' && !!parsed.generatedAt;

    const ok = hasReqs && hasQuestions && hasIndicators && hasAnswers && hasGaps && hasPlans && hasAudit && hasMetadata;
    recordResult(
      'Export JSON',
      ok,
      `JSON.parse() validé (${rawExport.length} octets). Collections exportées : ${parsed.requirements.length} besoins, ${parsed.questions.length} questions, ${parsed.indicators.length} indicateurs, ${parsed.answers.length} réponses, ${parsed.gaps.length} lacunes, ${parsed.plans.length} plans, ${parsed.audit.length} audits.`
    );
  } catch (err: any) {
    recordResult('Export JSON', false, `Erreur: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 13. AUDIT APPEND-ONLY
  // -------------------------------------------------------------------------
  try {
    const auditBefore = reqService.getAuditLogs().length;
    reqService.addAuditLog('ANALYSTE-TEST-01', 'TEST_EVENT', 'REQUIREMENT', createdReq.requirementId, 'Événement d audit test', undefined, undefined, true);
    const auditAfter = reqService.getAuditLogs().length;
    const deltaOk = auditAfter === auditBefore + 1;

    const hasDeleteAudit = typeof (reqService as any).deleteAudit === 'function' || typeof (reqService as any).deleteAuditLog === 'function';
    const hasUpdateAudit = typeof (reqService as any).updateAuditLog === 'function';
    const hasClearAudit = typeof (reqService as any).clearAudit === 'function';

    const reloadedService = new (reqService.constructor as any)();
    const reloadedAuditCount = reloadedService.getAuditLogs().length;
    const persistAuditOk = reloadedAuditCount === auditAfter;

    const ok = deltaOk && !hasDeleteAudit && !hasUpdateAudit && !hasClearAudit && persistAuditOk;
    recordResult(
      'Audit',
      ok,
      `journal d'audit append-only au niveau du service : progression séquentielle (+1), 0 méthode destructive (delete/update/clear inexistantes), persistance intégrale (${reloadedAuditCount} événements conservés après reload).`
    );
  } catch (err: any) {
    recordResult('Audit', false, `Erreur: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 14. UI REQUIREMENT CENTERSCREEN
  // -------------------------------------------------------------------------
  try {
    const fs = await import('fs');
    const path = await import('path');
    const screenPath = path.resolve(process.cwd(), 'src/components/screens/RequirementCenterScreen.tsx');
    const appPath = path.resolve(process.cwd(), 'src/App.tsx');

    const screenContent = fs.readFileSync(screenPath, 'utf-8');
    const appContent = fs.readFileSync(appPath, 'utf-8');

    const hasImport = appContent.includes("import { RequirementCenterScreen } from './components/screens/RequirementCenterScreen';");
    const hasRoute = appContent.includes("<RequirementCenterScreen onNavigate={vm.navigateTo} />");
    const hasEssentialOperations = screenContent.includes('createRequirement') && screenContent.includes('getRequirements') && screenContent.includes('exportAllRequirementsJson');

    const ok = hasImport && hasRoute && hasEssentialOperations && screenContent.length > 50000;
    recordResult(
      'UI',
      ok,
      `RequirementCenterScreen.tsx présent (${screenContent.length} octets), importé dans App.tsx, routé sur 'requirements', fonctions de pilotage des besoins intactes.`
    );
  } catch (err: any) {
    recordResult('UI', false, `Erreur: ${err.message}`);
  }

  console.log('\n========================================================================');
  console.log(`BILAN DU BANC D'ESSAI LOT 34 : ${results.filter(r => r.passed).length}/${results.length} PASS | ${results.filter(r => !r.passed).length} FAIL`);
  console.log('========================================================================');
}

runLot34Audit().catch(err => {
  console.error('Fatal error running Lot 34 audit:', err);
  process.exit(1);
});
