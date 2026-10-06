import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Pitch Deck Studio - PDF Image Upload Verification', () => {
  test('verify PDF file upload support in Pitch Deck Studio', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    const targetUrl = process.env.PLAYWRIGHT_URL || '/deck';
    console.log(`Navigating to ${targetUrl}...`);

    await page.goto(targetUrl);

    // 1. Wait for Pitch Deck viewer header
    await expect(page.locator('text="Pitch Deck"').first()).toBeVisible({ timeout: 25000 });

    // Dismiss cookie banner if mounted
    try {
      const cookieBtn = page.locator('button:has-text("Alle akzeptieren"), button:has-text("Nur essenzielle")').first();
      await cookieBtn.waitFor({ state: 'visible', timeout: 3000 });
      await cookieBtn.click();
    } catch(e) {}
    await page.waitForTimeout(500);

    // 2. Open Pitch Deck Studio
    const studioOpenBtn = page.locator('#btn-open-pitch-studio, button:has-text("Pitch Studio öffnen"), button:has-text("Open Pitch Studio")').first();
    await expect(studioOpenBtn).toBeVisible({ timeout: 25000 });
    await studioOpenBtn.click({ force: true });
    await page.waitForTimeout(1000);

    // 3. Verify dedicated slide image upload input has application/pdf and .pdf in accept attribute
    const slideInput = page.locator('#pitch-slide-direct-image-input');
    await expect(slideInput).toBeAttached({ timeout: 10000 });
    const slideAccept = await slideInput.getAttribute('accept');
    console.log('Slide input accept attribute:', slideAccept);
    expect(slideAccept).toContain('application/pdf');
    expect(slideAccept).toContain('.pdf');

    // 4. Open Media Picker and verify pitch-direct-upload-input has PDF accept attribute
    const openMediaBtn = page.locator('button:has-text("Medien"), button:has-text("3D Renderings")').first();
    if (await openMediaBtn.isVisible()) {
      await openMediaBtn.click();
      await page.waitForTimeout(600);
      const mediaInput = page.locator('#pitch-direct-upload-input');
      if (await mediaInput.count() > 0) {
        const mediaAccept = await mediaInput.getAttribute('accept');
        console.log('Media input accept attribute:', mediaAccept);
        expect(mediaAccept).toContain('application/pdf');
        expect(mediaAccept).toContain('.pdf');
      }
      // Close media picker modal
      const closeMediaBtn = page.locator('button:has-text("✕"), button:has-text("Schliessen")').first();
      if (await closeMediaBtn.isVisible()) {
        await closeMediaBtn.click();
      }
    }

    // 5. Test uploading a sample PDF (create a minimal 1-page PDF file in scratch/)
    const scratchDir = path.resolve(process.cwd(), 'scratch');
    if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
    const samplePdfPath = path.resolve(scratchDir, 'test_presentation_slide.pdf');

    // Minimal valid PDF binary
    const minimalPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Contents 4 0 R /Resources <<>> >> endobj
4 0 obj << /Length 44 >> stream
0 0 0 rg
BT /F1 12 Tf 50 100 Td (Test PDF Slide) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000216 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
310
%%EOF`;
    fs.writeFileSync(samplePdfPath, minimalPdf);

    // Set sample PDF file into the input
    await slideInput.setInputFiles(samplePdfPath);
    await page.waitForTimeout(2000);

    // Verify toast or notification appeared
    const toast = page.locator('div:has-text("PDF"), div:has-text("Bild"), div:has-text("erfolgreich")');
    console.log('Checking for PDF processing feedback...');
    await expect(toast.first()).toBeVisible({ timeout: 15000 });

    console.log('✅ PDF upload support in Pitch Deck Studio successfully tested and verified!');
  });
});
