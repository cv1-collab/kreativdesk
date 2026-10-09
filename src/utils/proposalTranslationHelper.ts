/**
 * Utility helper for translating proposal titles across languages (de, en, fr)
 */

export const PROPOSAL_TITLE_TRANSLATIONS: Record<string, { de: string; en: string; fr: string }> = {
  'Projekt-Präsentation': {
    de: 'Projekt-Präsentation',
    en: 'Project Presentation',
    fr: 'Présentation du projet'
  },
  'Projekt Präsentation': {
    de: 'Projekt Präsentation',
    en: 'Project Presentation',
    fr: 'Présentation du projet'
  },
  'Projektpräsentation': {
    de: 'Projektpräsentation',
    en: 'Project Presentation',
    fr: 'Présentation du projet'
  },
  'Project Presentation': {
    de: 'Projekt-Präsentation',
    en: 'Project Presentation',
    fr: 'Présentation du projet'
  },
  'Présentation du projet': {
    de: 'Projekt-Präsentation',
    en: 'Project Presentation',
    fr: 'Présentation du projet'
  },
  'Présentation de projet': {
    de: 'Projekt-Präsentation',
    en: 'Project Presentation',
    fr: 'Présentation du projet'
  },
  'Offerte': {
    de: 'Offerte',
    en: 'Proposal',
    fr: 'Offre'
  },
  'Offre': {
    de: 'Offerte',
    en: 'Proposal',
    fr: 'Offre'
  },
  'Proposal': {
    de: 'Offerte',
    en: 'Proposal',
    fr: 'Offre'
  },
  'Offerte & Präsentation': {
    de: 'Offerte & Präsentation',
    en: 'Proposal & Presentation',
    fr: 'Offre & Présentation'
  },
  'Offerte und Präsentation': {
    de: 'Offerte und Präsentation',
    en: 'Proposal and Presentation',
    fr: 'Offre et Présentation'
  },
  'Proposal & Presentation': {
    de: 'Offerte & Präsentation',
    en: 'Proposal & Presentation',
    fr: 'Offre & Présentation'
  },
  'Offre & Présentation': {
    de: 'Offerte & Präsentation',
    en: 'Proposal & Presentation',
    fr: 'Offre & Présentation'
  },
  'Projekt-Offerte': {
    de: 'Projekt-Offerte',
    en: 'Project Proposal',
    fr: 'Offre de projet'
  },
  'Projekt Offerte': {
    de: 'Projekt Offerte',
    en: 'Project Proposal',
    fr: 'Offre de projet'
  },
  'Projekt-Präsentation & Offerte': {
    de: 'Projekt-Präsentation & Offerte',
    en: 'Project Presentation & Proposal',
    fr: 'Présentation de projet & Offre'
  },
  'Projektangebot': {
    de: 'Projektangebot',
    en: 'Project Proposal',
    fr: 'Offre de projet'
  },
  'Projekt-Exposé': {
    de: 'Projekt-Exposé',
    en: 'Project Exposé',
    fr: 'Exposé du projet'
  },
  'Projekt Exposé': {
    de: 'Projekt Exposé',
    en: 'Project Exposé',
    fr: 'Exposé du projet'
  },
  'Exposé': {
    de: 'Exposé',
    en: 'Exposé',
    fr: 'Exposé'
  },
  'Smart Proposal': {
    de: 'Smart Proposal',
    en: 'Smart Proposal',
    fr: 'Offre intelligente'
  },
  'Kreativ Desk OS • Schweizer Architektur- & Projekt-Präsentation': {
    de: 'Kreativ Desk OS • Schweizer Architektur- & Projekt-Präsentation',
    en: 'Kreativ Desk OS • Swiss Architecture & Project Presentation',
    fr: 'Kreativ Desk OS • Présentation d’architecture & de projet suisse'
  },
  'Architektur- & Ausführungsplanung Neubau Residenz am Park': {
    de: 'Architektur- & Ausführungsplanung Neubau Residenz am Park',
    en: 'Architecture & Execution Planning New Construction Residence at the Park',
    fr: 'Architecture & planification d\'exécution Nouvelle construction Résidence du Parc'
  },
  'interacTV Smart Station – 4K Messe- & Event-Paket': {
    de: 'interacTV Smart Station – 4K Messe- & Event-Paket',
    en: 'interacTV Smart Station – 4K Trade Fair & Event Package',
    fr: 'interacTV Smart Station – Pack Salon & Événement 4K'
  },
  'Quartier Neubau Süd - Residenz am Park': {
    de: 'Quartier Neubau Süd - Residenz am Park',
    en: 'New District South - Residence at the Park',
    fr: 'Nouveau quartier Sud - Résidence du Parc'
  },
  'Neubau Wohn- & Gewerbepark': {
    de: 'Neubau Wohn- & Gewerbepark',
    en: 'New Residential & Commercial Park',
    fr: 'Nouveau parc résidentiel et commercial'
  },
  'Projekt Status Overview': {
    de: 'Projekt Status Overview',
    en: 'Project Status Overview',
    fr: 'Aperçu du statut du projet'
  },
  'Projektstatus Übersicht': {
    de: 'Projektstatus Übersicht',
    en: 'Project Status Overview',
    fr: 'Aperçu du statut du projet'
  },
  'Aktueller Baufortschritt': {
    de: 'Aktueller Baufortschritt',
    en: 'Current Construction Progress',
    fr: 'Avancement actuel des travaux'
  }
};

export function translateProposalTitle(title?: string, proposalLang: 'de' | 'fr' | 'en' = 'de'): string {
  if (!title) return '';
  const trimmed = title.trim();
  if (!trimmed) return '';

  // 1. Exact key match in dictionary
  if (PROPOSAL_TITLE_TRANSLATIONS[trimmed]?.[proposalLang]) {
    return PROPOSAL_TITLE_TRANSLATIONS[trimmed][proposalLang];
  }

  // 2. Case-insensitive & normalized search across all dictionary entries (bidirectional)
  const normalizedInput = trimmed.toLowerCase().replace(/[\s\-_]+/g, ' ');
  for (const [key, entry] of Object.entries(PROPOSAL_TITLE_TRANSLATIONS)) {
    const matchDe = entry.de.toLowerCase().replace(/[\s\-_]+/g, ' ') === normalizedInput;
    const matchEn = entry.en.toLowerCase().replace(/[\s\-_]+/g, ' ') === normalizedInput;
    const matchFr = entry.fr.toLowerCase().replace(/[\s\-_]+/g, ' ') === normalizedInput;
    const matchKey = key.toLowerCase().replace(/[\s\-_]+/g, ' ') === normalizedInput;
    if (matchDe || matchEn || matchFr || matchKey) {
      return entry[proposalLang];
    }
  }

  // 3. Prefix matching for compound titles (e.g. "Projekt-Präsentation - Neubau Villa", "Offerte: Umbau")
  const commonPrefixes: Array<{ de: string; en: string; fr: string }> = [
    { de: 'Projekt-Präsentation & Offerte', en: 'Project Presentation & Proposal', fr: 'Présentation de projet & Offre' },
    { de: 'Offerte & Präsentation', en: 'Proposal & Presentation', fr: 'Offre & Présentation' },
    { de: 'Projekt-Präsentation', en: 'Project Presentation', fr: 'Présentation du projet' },
    { de: 'Projektpräsentation', en: 'Project Presentation', fr: 'Présentation du projet' },
    { de: 'Projekt-Offerte', en: 'Project Proposal', fr: 'Offre de projet' },
    { de: 'Offerte', en: 'Proposal', fr: 'Offre' },
    { de: 'Projektangebot', en: 'Project Proposal', fr: 'Offre de projet' },
    { de: 'Smart Proposal', en: 'Smart Proposal', fr: 'Offre interactive' }
  ];

  const separators = [' – ', ' - ', ': ', ' • ', ' | ', ' / '];

  for (const pref of commonPrefixes) {
    for (const variant of [pref.de, pref.en, pref.fr]) {
      for (const sep of separators) {
        const testStart = `${variant}${sep}`;
        if (trimmed.toLowerCase().startsWith(testStart.toLowerCase())) {
          const remainder = trimmed.slice(testStart.length).trim();
          const translatedPrefix = pref[proposalLang];
          return `${translatedPrefix}${sep}${remainder}`;
        }
      }
    }
  }

  // 4. Default fallback: return title as provided
  return title;
}
