import { describe, it, expect } from 'vitest';
import { getFileCategory, resolve3DModelFormat } from '../../src/utils/documentClassifier';

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

  describe('resolve3DModelFormat', () => {
    it('erkennt FBX auch wenn MIME-Type leer oder octet-stream ist', () => {
      expect(resolve3DModelFormat({ name: 'PHGR_Chur_Erdgeschoss_3D.fbx', type: '' })).toBe('fbx');
      expect(resolve3DModelFormat({ name: 'PHGR_Chur_Erdgeschoss_3D.fbx', type: 'application/octet-stream' })).toBe('fbx');
      expect(resolve3DModelFormat({ name: 'PHGR_Chur_Erdgeschoss_3D.fbx', type: '3D MODELL' })).toBe('fbx');
      expect(resolve3DModelFormat({ url: 'https://storage.com/models/chur_3d.fbx?token=123' })).toBe('fbx');
    });

    it('erkennt IFC, OBJ, GLTF, GLB, DAE, STL, BLEND, DWG zuverlässig', () => {
      expect(resolve3DModelFormat({ name: 'model.ifc' })).toBe('ifc');
      expect(resolve3DModelFormat({ name: 'statik.obj' })).toBe('obj');
      expect(resolve3DModelFormat({ name: 'fassade.gltf' })).toBe('gltf');
      expect(resolve3DModelFormat({ name: 'scene.glb' })).toBe('glb');
      expect(resolve3DModelFormat({ name: 'building.dae' })).toBe('dae');
      expect(resolve3DModelFormat({ name: 'print.stl' })).toBe('stl');
      expect(resolve3DModelFormat({ name: 'project.blend' })).toBe('blend');
      expect(resolve3DModelFormat({ name: 'plan.dwg' })).toBe('dwg');
    });

    it('gibt leeren String für Nicht-3D-Dateien zurück', () => {
      expect(resolve3DModelFormat({ name: 'document.pdf', type: 'application/pdf' })).toBe('');
      expect(resolve3DModelFormat({ name: 'image.png', type: 'image/png' })).toBe('');
      expect(resolve3DModelFormat(null)).toBe('');
    });
  });
});

