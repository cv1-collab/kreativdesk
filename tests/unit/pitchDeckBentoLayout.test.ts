import { describe, it, expect } from 'vitest';
import { serializeSlideForDb, deserializeSlideFromDb, Slide } from '../../src/utils/pitchDeckHelpers';

describe('Pitch Deck Bento Cards & NotebookLM Archetypes Helper', () => {
  it('correctly serializes a cards-grid slide with Bento cards & key metric into DB envelope', () => {
    const bentoSlide: Slide = {
      id: 'slide-bento-1',
      title: 'Skalierung der Systemintegration',
      content: 'Kernresultate der Machbarkeitsstudie',
      order_index: 1,
      ownerId: 'user-arch-1',
      layout: 'cards-grid',
      dataPayload: {
        kicker: 'EFFIZIENZANALYSE',
        sourceAnchor: 'Dokument S. 04',
        keyMetric: { value: '+140%', label: 'Workflow-Beschleunigung' },
        cards: [
          { badge: 'Fokus 1', title: 'Automatisierte ETL-Pipelines', description: 'Keine manuellen Datensilos mehr.' },
          { badge: 'Fokus 2', title: 'Sub-200ms Latenz', description: 'Höchste Geschwindigkeit im Kreativ Desk OS.' },
          { badge: 'Fokus 3', title: 'SIA-Konformität', description: 'Direkte Normenerfüllung in der Schweiz.' }
        ]
      }
    };

    const serialized = serializeSlideForDb(bentoSlide);
    expect(serialized.id).toBe('slide-bento-1');
    expect(serialized.layout).toBe('cards-grid');
    expect(typeof serialized.content).toBe('string');

    const envelope = JSON.parse(serialized.content);
    expect(envelope.dataPayload.keyMetric.value).toBe('+140%');
    expect(envelope.dataPayload.sourceAnchor).toBe('Dokument S. 04');
    expect(envelope.dataPayload.cards).toHaveLength(3);
    expect(envelope.dataPayload.cards[0].title).toBe('Automatisierte ETL-Pipelines');
  });

  it('correctly deserializes cards-grid, stat-callout, and quote-statement slides from DB', () => {
    // 1. Test Cards-Grid Deserialization
    const rawCardsGrid = {
      id: 'slide-db-cards',
      title: 'Projekt-Highlights',
      layout: 'cards-grid',
      content: JSON.stringify({
        text: 'Übersicht der Meilensteine',
        dataPayload: {
          keyMetric: { value: 'CHF 4.8M', label: 'Gesamtvolumen BKP 1-9' },
          cards: [
            { badge: 'BKP 2', title: 'Rohbau abgeschlossen', description: 'Fristgerechte Fertigstellung' },
            { badge: 'BKP 3', title: 'Ausbau gestartet', description: 'Planmässige Fortführung' }
          ]
        }
      })
    };

    const deserializedCards = deserializeSlideFromDb(rawCardsGrid);
    expect(deserializedCards.layout).toBe('cards-grid');
    expect(deserializedCards.dataPayload.keyMetric.value).toBe('CHF 4.8M');
    expect(deserializedCards.dataPayload.cards).toHaveLength(2);

    // 2. Test Stat-Callout Deserialization
    const rawStat = {
      id: 'slide-db-stat',
      title: 'Grosser Callout',
      layout: 'stat-callout',
      content: JSON.stringify({
        text: 'Reduktion des CO2-Fussabdrucks um 68% durch Holzsystembau',
        dataPayload: {
          kicker: 'NACHHALTIGKEIT',
          keyMetric: { value: '-68%', label: 'CO2-Emissionen' }
        }
      })
    };

    const deserializedStat = deserializeSlideFromDb(rawStat);
    expect(deserializedStat.layout).toBe('stat-callout');
    expect(deserializedStat.dataPayload.kicker).toBe('NACHHALTIGKEIT');
    expect(deserializedStat.dataPayload.keyMetric.value).toBe('-68%');

    // 3. Test Quote-Statement Deserialization
    const rawQuote = {
      id: 'slide-db-quote',
      title: 'Leitsatz',
      layout: 'quote-statement',
      content: JSON.stringify({
        text: 'Architektur ist das kunstvolle, korrekte und großartige Spiel der unter dem Licht versammelten Baukörper.',
        dataPayload: {
          quote: {
            text: 'Architektur ist das kunstvolle, korrekte und großartige Spiel der unter dem Licht versammelten Baukörper.',
            author: 'Le Corbusier',
            role: 'Architekt & Visionär'
          }
        }
      })
    };

    const deserializedQuote = deserializeSlideFromDb(rawQuote);
    expect(deserializedQuote.layout).toBe('quote-statement');
    expect(deserializedQuote.dataPayload.quote.author).toBe('Le Corbusier');
  });
});
