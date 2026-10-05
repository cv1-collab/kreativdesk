import { describe, it, expect } from 'vitest';
import { translateProposalTitle, PROPOSAL_TITLE_TRANSLATIONS } from '../../src/components/SmartProposalLandingPage';

describe('Proposal Landing Page Title Translation', () => {
  it('translates standard "Projekt-Präsentation" across DE, FR, EN correctly', () => {
    expect(translateProposalTitle('Projekt-Präsentation', 'de')).toBe('Projekt-Präsentation');
    expect(translateProposalTitle('Projekt-Präsentation', 'fr')).toBe('Présentation du projet');
    expect(translateProposalTitle('Projekt-Präsentation', 'en')).toBe('Project Presentation');
  });

  it('handles variations like "Projekt Präsentation" and "Projektpräsentation"', () => {
    expect(translateProposalTitle('Projekt Präsentation', 'fr')).toBe('Présentation du projet');
    expect(translateProposalTitle('Projektpräsentation', 'fr')).toBe('Présentation du projet');
    expect(translateProposalTitle('projekt-präsentation', 'en')).toBe('Project Presentation');
  });

  it('translates "Offerte" and "Offerte & Präsentation"', () => {
    expect(translateProposalTitle('Offerte', 'fr')).toBe('Offre');
    expect(translateProposalTitle('Offerte', 'en')).toBe('Proposal');
    expect(translateProposalTitle('Offerte', 'de')).toBe('Offerte');

    expect(translateProposalTitle('Offerte & Präsentation', 'fr')).toBe('Offre & Présentation');
    expect(translateProposalTitle('Offerte & Präsentation', 'en')).toBe('Proposal & Presentation');
  });

  it('supports bidirectional translation from FR or EN back to other languages', () => {
    expect(translateProposalTitle('Présentation du projet', 'de')).toBe('Projekt-Präsentation');
    expect(translateProposalTitle('Présentation du projet', 'en')).toBe('Project Presentation');
    expect(translateProposalTitle('Project Presentation', 'fr')).toBe('Présentation du projet');
  });

  it('supports compound titles with prefixes and separators', () => {
    expect(translateProposalTitle('Projekt-Präsentation – Neubau Zürich', 'fr')).toBe('Présentation du projet – Neubau Zürich');
    expect(translateProposalTitle('Projekt-Präsentation - Villa Park', 'en')).toBe('Project Presentation - Villa Park');
    expect(translateProposalTitle('Offerte: Umbau Büro', 'fr')).toBe('Offre: Umbau Büro');
  });

  it('preserves custom specific project titles as fallback', () => {
    expect(translateProposalTitle('Villa Sonnenberg Küsnacht', 'fr')).toBe('Villa Sonnenberg Küsnacht');
    expect(translateProposalTitle('', 'fr')).toBe('');
  });
});
