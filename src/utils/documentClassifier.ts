export type DocumentCategory = '3d' | 'cad' | 'image' | 'pdf' | 'archive' | 'template' | 'general';

export interface DocumentLikeItem {
  name?: string;
  url?: string;
  file_url?: string;
  type?: string;
  [key: string]: any;
}

/**
 * Robust classifier for uploaded files and bauakte documents.
 * Prioritises file extensions over browser-reported MIME types (which often default to empty or octet-stream for 3D/CAD).
 */
export function getFileCategory(item: DocumentLikeItem): DocumentCategory {
  const name = (item.name || '').toLowerCase();
  const fileUrl = item.url || item.file_url || '';

  // 3D / BIM / Blender Models (.fbx, .blend, .ifc, .obj, etc.)
  if (/\.(fbx|obj|blend|ifc|gltf|glb|stl|dae|3ds|step|stp)$/i.test(name)) {
    return '3d';
  }
  // CAD Pläne (.dwg, .dxf)
  if (/\.(dwg|dxf)$/i.test(name)) {
    return 'cad';
  }
  // Bilder
  if (item.type?.startsWith('image/') || /\.(png|jpe?g|webp|svg|gif|bmp|tiff)$/i.test(name)) {
    return 'image';
  }
  // PDF Dokumente
  if (item.type === 'application/pdf' || name.endsWith('.pdf') || fileUrl.includes('.pdf') || fileUrl.startsWith('data:application/pdf')) {
    return 'pdf';
  }
  // Archive
  if (/\.(zip|rar|7z|tar|gz)$/i.test(name)) {
    return 'archive';
  }
  // Echte Vorlagen / Text-Dokumente
  if (item.type === 'vorlage' || name.endsWith('.txt') || name.endsWith('.md') || fileUrl.startsWith('data:text')) {
    return 'template';
  }
  return 'general';
}
