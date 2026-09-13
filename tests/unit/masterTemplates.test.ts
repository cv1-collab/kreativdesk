import { describe, it, expect } from 'vitest';
import { MASTER_TEMPLATES, TEMPLATE_CATEGORIES } from '../../src/data/masterTemplates';
import { bindTemplateVariables, getCachedCompanyProfile } from '../../src/utils/templateVariableEngine';

describe('Master Templates & Variable Engine', () => {
  it('should have all master templates defined with DE and EN content', () => {
    expect(MASTER_TEMPLATES.length).toBeGreaterThanOrEqual(8);

    for (const tpl of MASTER_TEMPLATES) {
      expect(tpl.code).toBeTruthy();
      expect(tpl.title.de).toBeTruthy();
      expect(tpl.title.en).toBeTruthy();
      expect(tpl.description.de).toBeTruthy();
      expect(tpl.description.en).toBeTruthy();
      expect(tpl.content.de).toBeTruthy();
      expect(tpl.content.en).toBeTruthy();
      expect(tpl.tags.length).toBeGreaterThan(0);
    }
  });

  it('should contain all essential standard categories', () => {
    const categoryIds = TEMPLATE_CATEGORIES.map(c => c.id);
    expect(categoryIds).toContain('all');
    expect(categoryIds).toContain('contracts');
    expect(categoryIds).toContain('fees');
    expect(categoryIds).toContain('execution');
    expect(categoryIds).toContain('rights_ai');
  });

  it('should cleanly bind company and project variables in German', () => {
    const rawTemplate = 'Auftragnehmer: {{company.name}}, {{company.address}}, {{company.zipCity}}\nProjekt: {{project.name}} ({{project.number}})\nHonorar: {{currency}} {{project.budget}}';
    
    const bound = bindTemplateVariables(rawTemplate, {
      company: {
        name: 'Muster Architekten AG',
        address: 'Gotthardstrasse 5',
        zipCity: '6000 Luzern',
        city: 'Luzern'
      },
      project: {
        name: 'Umbau Wohnhaus',
        number: 'PRJ-2026-99',
        budget: '250\'000.00',
        currency: 'CHF'
      },
      language: 'de'
    });

    expect(bound).toContain('Auftragnehmer: Muster Architekten AG, Gotthardstrasse 5, 6000 Luzern');
    expect(bound).toContain('Projekt: Umbau Wohnhaus (PRJ-2026-99)');
    expect(bound).toContain('Honorar: CHF 250\'000.00');
    expect(bound).not.toContain('{{company.name}}');
    expect(bound).not.toContain('{{project.name}}');
  });

  it('should cleanly bind company and project variables in English', () => {
    const rawTemplate = 'Contractor: {{company.name}}\nProject: {{project.name}}\nVenue: {{project.siteLocation}}\nJurisdiction: {{jurisdiction}}';
    
    const bound = bindTemplateVariables(rawTemplate, {
      company: {
        name: 'Alpine Spatial Design Ltd.',
        city: 'Zurich'
      },
      project: {
        name: 'Art Museum Exhibition',
        siteLocation: 'Basel Exhibition Hall'
      },
      language: 'en'
    });

    expect(bound).toContain('Contractor: Alpine Spatial Design Ltd.');
    expect(bound).toContain('Project: Art Museum Exhibition');
    expect(bound).toContain('Venue: Basel Exhibition Hall');
    expect(bound).toContain('Jurisdiction: Zurich, Switzerland');
  });

  it('should provide robust fallback branding when no company data is passed', () => {
    const profile = getCachedCompanyProfile('non-existent-company');
    expect(profile.name).toBeTruthy();
    expect(profile.address).toBeTruthy();
    expect(profile.zipCity).toBeTruthy();
    expect(profile.iban).toBeTruthy();
  });
});
