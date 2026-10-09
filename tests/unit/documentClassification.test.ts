import { describe, it, expect } from 'vitest';
import { getFileCategory } from '../../src/utils/documentClassifier';

describe('documentClassifier - getFileCategory', () => {
  describe('3D Models & BIM Files', () => {
    const extensions = ['fbx', 'obj', 'blend', 'ifc', 'gltf', 'glb', 'stl', 'dae', '3ds', 'step', 'stp'];

    extensions.forEach((ext) => {
      it(`erkennt .${ext} zuverlässig als '3d' und NIE als 'template'`, () => {
        const item = {
          name: `Modell_Gebäude_A.${ext}`,
          type: 'application/octet-stream', // typischer Browser-Upload-MIME-Typ
          url: `https://example.com/storage/v1/object/public/documents/file.${ext}`
        };
        const category = getFileCategory(item);
        expect(category).toBe('3d');
        expect(category).not.toBe('template');
      });

      it(`erkennt .${ext.toUpperCase()} (Grossschreibung) als '3d'`, () => {
        const item = {
          name: `ARCHITEKTUR_3D.${ext.toUpperCase()}`,
          type: '',
          url: `https://example.com/files/test.${ext.toUpperCase()}`
        };
        expect(getFileCategory(item)).toBe('3d');
      });
    });

    it('verhindert zwingend, dass 3D-Dateien jemals als Vorlage klassifiziert werden', () => {
      const fbxFile = { name: 'Villa_Luxus_Rendering.fbx', type: '' };
      const blendFile = { name: 'Interior_Design_v2.blend', type: 'application/x-blender' };
      const ifcFile = { name: 'Statik_Tragwerk.ifc', type: 'application/octet-stream' };

      expect(getFileCategory(fbxFile)).toBe('3d');
      expect(getFileCategory(blendFile)).toBe('3d');
      expect(getFileCategory(ifcFile)).toBe('3d');

      expect(getFileCategory(fbxFile)).not.toBe('template');
      expect(getFileCategory(blendFile)).not.toBe('template');
      expect(getFileCategory(ifcFile)).not.toBe('template');
    });
  });

  describe('CAD Pläne', () => {
    it("erkennt .dwg und .dxf als 'cad'", () => {
      expect(getFileCategory({ name: 'Grundriss_EG.dwg', type: 'application/acad' })).toBe('cad');
      expect(getFileCategory({ name: 'Fassade_Sued.DXF', type: '' })).toBe('cad');
    });
  });

  describe('Bilder', () => {
    it("erkennt Bildformate per MIME oder Extension als 'image'", () => {
      expect(getFileCategory({ name: 'Baustelle_Foto_1.jpg', type: 'image/jpeg' })).toBe('image');
      expect(getFileCategory({ name: 'Logo.png', type: '' })).toBe('image');
      expect(getFileCategory({ name: 'Rendering.webp', type: 'image/webp' })).toBe('image');
    });
  });

  describe('PDF Dokumente', () => {
    it("erkennt PDFs per Typ oder Extension als 'pdf'", () => {
      expect(getFileCategory({ name: 'Baubewilligung.pdf', type: 'application/pdf' })).toBe('pdf');
      expect(getFileCategory({ name: 'SIA_Vertrag.PDF', type: '' })).toBe('pdf');
    });
  });

  describe('Archive', () => {
    it("erkennt ZIP/RAR Archive als 'archive'", () => {
      expect(getFileCategory({ name: 'Plandaten_Paket.zip', type: 'application/zip' })).toBe('archive');
      expect(getFileCategory({ name: 'Archiv.7z', type: '' })).toBe('archive');
    });
  });

  describe('Echte Vorlagen & Textdokumente', () => {
    it("erkennt echte Vorlagen mit type='vorlage' als 'template'", () => {
      const templateItem = {
        name: 'Briefvorlage Bauherr',
        type: 'vorlage',
        url: 'data:text/html;charset=utf-8,...'
      };
      expect(getFileCategory(templateItem)).toBe('template');
    });

    it("erkennt Textdateien (.txt, .md) als 'template'", () => {
      expect(getFileCategory({ name: 'Notizen.txt', type: 'text/plain' })).toBe('template');
      expect(getFileCategory({ name: 'README.md', type: '' })).toBe('template');
    });
  });

  describe('Allgemeine Dateien', () => {
    it("klassifiziert unbekannte Formate ohne Vorlagen-Hinweis als 'general'", () => {
      expect(getFileCategory({ name: 'tabelle.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })).toBe('general');
    });
  });
});
