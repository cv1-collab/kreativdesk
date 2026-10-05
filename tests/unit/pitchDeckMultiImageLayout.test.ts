import { describe, it, expect } from 'vitest';
import { serializeSlideForDb, deserializeSlideFromDb, Slide } from '../../src/utils/pitchDeckHelpers';

describe('Pitch Deck Multi-Image (Two-Images & Three-Images) Layout & Scaling Helper', () => {
  it('correctly serializes a two-images comparison slide with split ratio and mask scaling into DB envelope', () => {
    const twoImagesSlide: Slide = {
      id: 'slide-dual-1',
      title: 'Vorher / Nachher Sanierung',
      content: '',
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
      compareImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
      order_index: 1,
      ownerId: 'user-1',
      layout: 'two-images',
      dataPayload: {
        images: [
          'https://images.unsplash.com/photo-1513694203232-719a280e022f',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'
        ],
        captions: ['Bestand Altbau 1968', 'Realisierung Umbau 2026'],
        splitRatio: 40,
        displayMode: 'side-by-side',
        maskAspect: '16/9',
        maskRadius: 24,
        sliderPos: 50
      }
    };

    const serialized = serializeSlideForDb(twoImagesSlide);
    expect(serialized.id).toBe('slide-dual-1');
    expect(serialized.title).toBe('Vorher / Nachher Sanierung');
    expect(serialized.layout).toBe('two-images');
    expect(serialized.image_url).toBe('https://images.unsplash.com/photo-1513694203232-719a280e022f');

    const envelope = JSON.parse(serialized.content);
    expect(envelope.compareImageUrl).toBe('https://images.unsplash.com/photo-1600585154340-be6161a56a0c');
    expect(envelope.dataPayload).toBeDefined();
    expect(envelope.dataPayload.images).toHaveLength(2);
    expect(envelope.dataPayload.captions[0]).toBe('Bestand Altbau 1968');
    expect(envelope.dataPayload.captions[1]).toBe('Realisierung Umbau 2026');
    expect(envelope.dataPayload.splitRatio).toBe(40);
    expect(envelope.dataPayload.displayMode).toBe('side-by-side');
    expect(envelope.dataPayload.maskAspect).toBe('16/9');
    expect(envelope.dataPayload.maskRadius).toBe(24);
  });

  it('correctly deserializes a two-images slide from DB record with compareImageUrl and multi-image payload', () => {
    const rawDbRecord = {
      id: 'slide-dual-2',
      title: 'Vorher/Nachher Fassadenstudie',
      layout: 'two-images',
      image_url: '/demo/fassade_alt.jpg',
      order_index: 3,
      content: JSON.stringify({
        text: '',
        compareImageUrl: '/demo/fassade_neu.jpg',
        dataPayload: {
          images: ['/demo/fassade_alt.jpg', '/demo/fassade_neu.jpg'],
          captions: ['Urzustand', 'Neue Holz-Lamellen'],
          splitRatio: 60,
          displayMode: 'slider',
          sliderPos: 45,
          maskRadius: 16
        }
      })
    };

    const deserialized = deserializeSlideFromDb(rawDbRecord, 'owner-dual');
    expect(deserialized.id).toBe('slide-dual-2');
    expect(deserialized.layout).toBe('two-images');
    expect(deserialized.imageUrl).toBe('/demo/fassade_alt.jpg');
    expect(deserialized.compareImageUrl).toBe('/demo/fassade_neu.jpg');
    expect(deserialized.dataPayload.images).toEqual(['/demo/fassade_alt.jpg', '/demo/fassade_neu.jpg']);
    expect(deserialized.dataPayload.displayMode).toBe('slider');
    expect(deserialized.dataPayload.splitRatio).toBe(60);
    expect(deserialized.dataPayload.sliderPos).toBe(45);
    expect(deserialized.dataPayload.maskRadius).toBe(16);
  });

  it('correctly serializes and deserializes a three-images gallery slide with hero-stacked mode and captions', () => {
    const threeImagesSlide: Slide = {
      id: 'slide-gallery-1',
      title: 'Perspektiven & Materialkonzept',
      content: '',
      imageUrl: '/demo/hero.jpg',
      compareImageUrl: '/demo/detail1.jpg',
      order_index: 2,
      ownerId: 'user-gallery',
      layout: 'three-images',
      dataPayload: {
        images: ['/demo/hero.jpg', '/demo/detail1.jpg', '/demo/detail2.jpg'],
        captions: ['Hauptperspektive Südwest', 'Detail Fassadenknoten', 'Innenhof Begrünung'],
        galleryMode: 'hero',
        maskAspect: 'cover',
        maskRadius: 8
      }
    };

    const serialized = serializeSlideForDb(threeImagesSlide);
    expect(serialized.layout).toBe('three-images');
    const envelope = JSON.parse(serialized.content);
    expect(envelope.dataPayload.galleryMode).toBe('hero');
    expect(envelope.dataPayload.images).toHaveLength(3);
    expect(envelope.dataPayload.captions[2]).toBe('Innenhof Begrünung');

    const deserialized = deserializeSlideFromDb({
      id: 'slide-gallery-1',
      title: 'Perspektiven & Materialkonzept',
      layout: 'three-images',
      image_url: '/demo/hero.jpg',
      order_index: 2,
      content: serialized.content
    }, 'user-gallery');

    expect(deserialized.layout).toBe('three-images');
    expect(deserialized.dataPayload.galleryMode).toBe('hero');
    expect(deserialized.dataPayload.images[0]).toBe('/demo/hero.jpg');
    expect(deserialized.dataPayload.images[1]).toBe('/demo/detail1.jpg');
    expect(deserialized.dataPayload.images[2]).toBe('/demo/detail2.jpg');
    expect(deserialized.dataPayload.maskRadius).toBe(8);
  });
});
