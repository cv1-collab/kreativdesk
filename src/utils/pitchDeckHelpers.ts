export interface Slide { 
  id: string; 
  title: string; 
  content: string; 
  imageUrl?: string; 
  videoUrl?: string;
  order_index: number; 
  ownerId: string; 
  companyId?: string; 
  projectId?: string; 
  layout?: 'title-only' | 'split' | 'image-focus' | 'video-focus' | 'text-only' | 'data-budget' | 'team-grid' | 'smart-calendar' | 'defect-grid' | 'chart-donut' | 'table-of-contents' | 'budget-comparison'; 
  fontSize?: number; 
  titleFontSize?: number;
  dataPayload?: any; 
  notes?: string; 
  stamp?: string; 
  agendaItems?: Array<{ num: string; title: string; desc: string; page: string }>;
  created_at?: string;
}

// Helper to safely serialize a Slide for the remote Supabase schema
// (Valid Supabase columns: id, project_id, company_id, title, subtitle, content, layout, image_url, order_index, created_at)
export const serializeSlideForDb = (slide: Partial<Slide> & { [key: string]: any }): any => {
  const dbRecord: Record<string, any> = {};
  if (slide.id !== undefined) dbRecord.id = slide.id;
  if (slide.title !== undefined) dbRecord.title = slide.title;
  if (slide.subtitle !== undefined) dbRecord.subtitle = slide.subtitle;
  if (slide.layout !== undefined) dbRecord.layout = slide.layout;
  if (slide.imageUrl !== undefined || slide.image_url !== undefined) {
    dbRecord.image_url = slide.imageUrl !== undefined ? slide.imageUrl : slide.image_url;
  }
  if (slide.order_index !== undefined) dbRecord.order_index = slide.order_index;
  if (slide.companyId !== undefined || slide.company_id !== undefined) {
    dbRecord.company_id = slide.companyId !== undefined ? slide.companyId : slide.company_id;
  }
  if (slide.projectId !== undefined || slide.project_id !== undefined) {
    dbRecord.project_id = slide.projectId !== undefined ? slide.projectId : slide.project_id;
  }
  dbRecord.created_at = slide.created_at || new Date().toISOString();

  // Pack rich/extended attributes into content JSON envelope
  const hasExtra = slide.dataPayload !== undefined ||
    slide.notes !== undefined ||
    slide.fontSize !== undefined ||
    slide.titleFontSize !== undefined ||
    slide.stamp !== undefined ||
    slide.agendaItems !== undefined ||
    slide.agenda_items !== undefined ||
    slide.videoUrl !== undefined;

  if (hasExtra) {
    dbRecord.content = JSON.stringify({
      text: slide.content || '',
      dataPayload: slide.dataPayload,
      notes: slide.notes,
      fontSize: slide.fontSize,
      titleFontSize: slide.titleFontSize,
      stamp: slide.stamp,
      agendaItems: slide.agendaItems || slide.agenda_items,
      videoUrl: slide.videoUrl
    });
  } else if (slide.content !== undefined) {
    dbRecord.content = slide.content;
  }

  return dbRecord;
};

// Helper to deserialize a Supabase record back into a full Slide object
export const deserializeSlideFromDb = (d: any, fallbackOwnerId?: string): Slide => {
  let contentText = d.content || '';
  let dataPayload = d.data_payload || d.dataPayload || null;
  let notes = d.notes || '';
  let fontSize = d.font_size || d.fontSize || 18;
  let titleFontSize = d.title_font_size || d.titleFontSize || 36;
  let stamp = d.stamp || '';
  let agendaItems = d.agenda_items || d.agendaItems || null;
  let videoUrl = d.video_url || d.videoUrl;

  if (typeof d.content === 'string' && d.content.trim().startsWith('{')) {
    try {
      const envelope = JSON.parse(d.content);
      if (envelope && typeof envelope === 'object') {
        if ('text' in envelope) contentText = envelope.text || '';
        if ('dataPayload' in envelope) dataPayload = envelope.dataPayload;
        if ('notes' in envelope) notes = envelope.notes;
        if ('fontSize' in envelope) fontSize = envelope.fontSize;
        if ('titleFontSize' in envelope) titleFontSize = envelope.titleFontSize;
        if ('stamp' in envelope) stamp = envelope.stamp;
        if ('agendaItems' in envelope) agendaItems = envelope.agendaItems;
        if ('videoUrl' in envelope) videoUrl = envelope.videoUrl;
      }
    } catch(e) {}
  }

  return {
    id: d.id,
    title: d.title || '',
    content: contentText,
    imageUrl: d.image_url || d.imageUrl || '',
    videoUrl,
    layout: d.layout || 'split',
    order_index: d.order_index ?? 0,
    companyId: d.company_id || d.companyId,
    projectId: d.project_id || d.projectId,
    ownerId: d.owner_id || d.ownerId || fallbackOwnerId || 'admin',
    created_at: d.created_at,
    dataPayload,
    notes,
    fontSize,
    titleFontSize,
    stamp,
    agendaItems
  } as Slide;
};
