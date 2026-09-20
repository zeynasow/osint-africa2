import { IntelligenceNote } from '../types';

export const DEMO_NOTES: IntelligenceNote[] = [
  {
    id: 'note-001',
    title: 'Note de Renseignement n°2026/09-01 : Vulnérabilité de l’axe logistique Gao-Ansongo (RN16)',
    object: 'Évaluation des risques de rupture d’approvisionnement et d’activités de groupes armés sur la RN16',
    createdAt: '2026-09-10 11:30',
    updatedAt: '2026-09-10 12:15',
    author: 'Cellule Veille Sahélienne (Analyste OSINT)',
    classification: 'DIFFUSION RESTREINTE',
    targetCountryIds: ['ML', 'NE'],
    synthese: 'Un faisceau concordant d’imagerie satellitaire civile et de signalements ouverts indique une concentration anormale de pick-ups armés aux abords de la RN16. Cette situation menace directement la continuité de l’acheminement des denrées vivrières et du carburant vers Gao.',
    faitsPrincipaux: [
      'Détection par imagerie Sentinel-2 de plusieurs vecteurs mobiles regroupés sous couvert végétal le long de la RN16.',
      'Corrélation avec des témoignages radioamateurs locaux rapportant des contrôles inopinés de véhicules commerciaux.',
      'Baisse de 35% du trafic des poids lourds de fret civil observé sur les 48 dernières heures.'
    ],
    chronologie: [
      { date: '2026-09-08 14:00', description: 'Premières alertes de transporteurs routiers concernant des entraves sur l’axe.' },
      { date: '2026-09-09 09:30', description: 'Acquisition satellitaire confirmant la présence de silhouettes de pick-ups.' },
      { date: '2026-09-10 10:15', description: 'Publication de l’alerte rouge OSINT AFRICA (Admiralty B2).' }
    ],
    acteurs: [
      'Éléments mobiles non identifiés (présomption factions armées locales)',
      'Forces armées maliennes (FAMA) et patrouilles d’escorte',
      'Syndicats régionaux de transporteurs routiers'
    ],
    localisation: 'Région de Gao, axe Gao-Ansongo (RN16), coordonnées indicatives 16.2719°N, -0.0447°W.',
    evolution: 'Probable sanctuarisation temporaire de la zone de transit pour imposer des droits de passage illégaux aux convois non escortés.',
    indicateursSurveillance: [
      'Fluctuations des prix des denrées de première nécessité sur les marchés de Gao.',
      'Annonces de communiqués d’escorte militaire conjointe.',
      'Fréquence des vols de surveillance aérienne dans le secteur.'
    ],
    appreciationAnalytique: 'FAITS SOURCÉS : La présence de groupes armés et le ralentissement du trafic sont documentés par 4 sources distinctes. APPRÉCIATION ANALYTIQUE : L’objectif tactique ne semble pas être une attaque frontale contre la garnison de Gao, mais une asphyxie économique visant à fragiliser la résilience logistique de la ville.',
    conclusion: 'Niveau de vigilance CRITIQUE maintenu sur le tronçon Gao-Ansongo. Nécessité d’une réévaluation sous 24h avec la prochaine passe satellitaire.',
    sources: [
      'Observatoire Sahélien Démo / Imagerie Sentinel-2 Fictive (Fiabilité B2)',
      'Studio Tamani - Journal régional du 10 septembre (Fiabilité B2)',
      'Réseau OpenMarine / Transports terrestres (Fiabilité A1)'
    ],
    isDemo: true,
  }
];
