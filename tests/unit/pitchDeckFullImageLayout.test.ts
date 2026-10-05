import { describe, it, expect } from 'vitest';
import { serializeSlideForDb, deserializeSlideFromDb, Slide } from '../../src/utils/pitchDeckHelpers';

describe('Pitch Deck Full-Image Background & Scaling Helper', () => {
  it('correctly serializes a full-image slide with image scaling attributes into the DB envelope', () => {
    const fullImageSlide: Slide = {
      id: 'slide-full-1',
      title: 'Neubau Wohnpark Panorama',
      content: 'Aussenansicht & Umgebungsgestaltung',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
      order_index: 0,
      ownerId: 'user-1',
      layout: 'full-image',
      dataPayload: {
        imageFit: 'cover',
        imageScale: 1.15,
        imagePosition: 'center',
        overlayOpacity: 0.35,
        textPosition: 'bottom-left'
      }
    };

    const serialized = serializeSlideForDb(fullImageSlide);
    expect(serialized.id).toBe('slide-full-1');
    expect(serialized.title).toBe('Neubau Wohnpark Panorama');
    expect(serialized.layout).toBe('full-image');
    expect(serialized.image_url).toBe('https://images.unsplash.com/photo-1600585154340-be6161a56a0c');
    expect(typeof serialized.content).toBe('string');

    const envelope = JSON.parse(serialized.content);
    expect(envelope.text).toBe('Aussenansicht & Umgebungsgestaltung');
    expect(envelope.dataPayload).toBeDefined();
    expect(envelope.dataPayload.imageFit).toBe('cover');
    expect(envelope.dataPayload.imageScale).toBe(1.15);
    expect(envelope.dataPayload.imagePosition).toBe('center');
    expect(envelope.dataPayload.overlayOpacity).toBe(0.35);
    expect(envelope.dataPayload.textPosition).toBe('bottom-left');
  });

  it('correctly deserializes a full-image slide from DB record with intact scaling attributes', () => {
    const rawDbRecord = {
      id: 'slide-full-2',
      title: 'Grossformatige Visualisierung',
      layout: 'full-image',
      image_url: '/demo-assets/bau_pitch_render.jpg',
      order_index: 2,
      content: JSON.stringify({
        text: 'Cinema 16:9 Format ohne Rahmen',
        dataPayload: {
          imageFit: 'contain',
          imageScale: 0.9,
          imagePosition: 'top',
          overlayOpacity: 0.5,
          textPosition: 'center'
        },
        fontSize: 20,
        titleFontSize: 44
      })
    };

    const deserialized = deserializeSlideFromDb(rawDbRecord, 'owner-99');
    expect(deserialized.id).toBe('slide-full-2');
    expect(deserialized.title).toBe('Grossformatige Visualisierung');
    expect(deserialized.layout).toBe('full-image');
    expect(deserialized.imageUrl).toBe('/demo-assets/bau_pitch_render.jpg');
    expect(deserialized.content).toBe('Cinema 16:9 Format ohne Rahmen');
    expect(deserialized.dataPayload).toBeDefined();
    expect(deserialized.dataPayload.imageFit).toBe('contain');
    expect(deserialized.dataPayload.imageScale).toBe(0.9);
    expect(deserialized.dataPayload.imagePosition).toBe('top');
    expect(deserialized.dataPayload.overlayOpacity).toBe(0.5);
    expect(deserialized.dataPayload.textPosition).toBe('center');
    expect(deserialized.fontSize).toBe(20);
    expect(deserialized.titleFontSize).toBe(44);
  });
});
