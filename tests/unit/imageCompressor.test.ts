import { describe, it, expect } from 'vitest';
import { compressImageForAI, compressBase64ImageIfNeeded } from '../../src/utils/imageCompressor';

describe('imageCompressor Utility', () => {
  it('blockiert PDFs über dem 3.5 MB Limit mit verständlicher Fehlermeldung', async () => {
    // Fake PDF Blob > 3.5 MB
    const largePdf = new Blob(['x'.repeat(4 * 1024 * 1024)], { type: 'application/pdf' });
    Object.defineProperty(largePdf, 'name', { value: 'mega_offerte.pdf' });

    await expect(compressImageForAI(largePdf)).rejects.toThrow('Das PDF ist zu gross');
  });

  it('erlaubt PDFs unter 3.5 MB', async () => {
    const smallPdf = new Blob(['%PDF-1.4 test'], { type: 'application/pdf' });
    Object.defineProperty(smallPdf, 'name', { value: 'kleine_offerte.pdf' });

    const result = await compressImageForAI(smallPdf);
    expect(result.mimeType).toBe('application/pdf');
    expect(result.base64).toBeTruthy();
  });

  it('lässt kleine Base64-Strings unterhalb der Schwelle unverändert', async () => {
    const smallData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const result = await compressBase64ImageIfNeeded(smallData, 'image/png', 1_200_000);
    expect(result.data).toBe(smallData);
    expect(result.mimeType).toBe('image/png');
  });

  it('behandelt Nicht-Bild Mime-Types transparent', async () => {
    const audioData = 'AAAAIGZ0eXBtcDQyAAAAAW1wNDJpc29tYXZjMQ==';
    const result = await compressBase64ImageIfNeeded(audioData, 'audio/mp4');
    expect(result.data).toBe(audioData);
    expect(result.mimeType).toBe('audio/mp4');
  });
});
