import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image as PDFImage,
  Svg,
  Line,
  Rect,
  Circle as PDFCircle,
  G,
  Polygon,
  Polyline
} from '@react-pdf/renderer';
import { PAPER_DIMENSIONS, MM_TO_PX, sessionImageCache } from './planEditorConfig';

export const CADPlanPDFDocument = ({ settings, docHeader, planImage, elements, layers, planScale, originalFormat, originalOrientation, companyProfile, t }: any) => {
  const isLandscape = settings.orientation === 'landscape';
  const isA3 = settings.format === 'A3';
  
  const safeImage = planImage ? (sessionImageCache[planImage] || planImage) : null;
  const baseLayer = (layers || []).find((l: any) => l.id === 'default') || (layers || [])[0];
  const layerOrderMap = new Map<string, number>((layers || []).map((l: any, idx: number) => [l.id, idx]));
  const sortedElements = [...(elements || [])].sort((a: any, b: any) => {
    const aOrder: number = layerOrderMap.get(a.layerId || 'default') ?? 0;
    const bOrder: number = layerOrderMap.get(b.layerId || 'default') ?? 0;
    return aOrder - bOrder;
  });

  const PAGE_W = isLandscape ? (isA3 ? 1190.55 : 841.89) : (isA3 ? 841.89 : 595.28);
  const PAGE_H = isLandscape ? (isA3 ? 841.89 : 595.28) : (isA3 ? 1190.55 : 841.89);
  const SAFE_W = PAGE_W - 2;
  const SAFE_H = PAGE_H - 2;

  const isOrigLandscape = originalOrientation === 'landscape';
  const origDims = PAPER_DIMENSIONS[originalFormat] || PAPER_DIMENSIONS.A3;
  const origW_mm = isOrigLandscape ? origDims.w : origDims.h;
  const origH_mm = isOrigLandscape ? origDims.h : origDims.w;
  const SCALE_X = SAFE_W / (origW_mm * MM_TO_PX);
  const SCALE_Y = SAFE_H / (origH_mm * MM_TO_PX);
  const SCALE_AVG = (SCALE_X + SCALE_Y) / 2;

  const getDashArray = (style: string, w: number) => {
    if (style === 'dashed') return `${w*4},${w*4}`;
    if (style === 'dotted') return `${w},${w*2}`;
    return undefined; 
  };

  return (
    <Document>
      <Page size={settings.format} orientation={settings.orientation} style={{ backgroundColor: '#ffffff', margin: 0, padding: 0 }}>
        <View wrap={false} style={{ width: SAFE_W, height: SAFE_H, position: 'relative', margin: 'auto' }}>
          
          {safeImage && (baseLayer?.visible ?? true) && (
            <PDFImage 
              src={safeImage} 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: SAFE_W, 
                height: SAFE_H,
                opacity: baseLayer?.opacity ?? 1
              }} 
            />
          )}
          
          {(sortedElements || []).map((el: any) => {
            if (el.type === 'image') {
              const layer = layers.find((l:any) => l.id === (el.layerId || 'default'));
              if (layer && !layer.visible) return null;
              const totalOpacity = (layer?.opacity ?? 1) * (el.opacity ?? 1);
              
              const sImg = sessionImageCache[el.url] || el.url;
              if (!sImg) return null;
              
              const w = SAFE_W * el.scale; 
              const h = SAFE_H * el.scale;
              return (
                <PDFImage 
                  key={el.id} 
                  src={sImg} 
                  style={{ position: 'absolute', left: el.x * SAFE_W, top: el.y * SAFE_H, width: w, height: h, opacity: totalOpacity }} 
                />
              );
            }
            return null;
          })}

          <View style={{ position: 'absolute', top: 0, left: 0, width: SAFE_W, height: SAFE_H }}>
            <Svg viewBox={`0 0 ${SAFE_W} ${SAFE_H}`} style={{ width: SAFE_W, height: SAFE_H }}>
              {sortedElements.map((el: any) => {
                const layer = layers.find((l:any) => l.id === (el.layerId || 'default'));
                if (layer && !layer.visible) return null;
                const totalOpacity = (layer?.opacity ?? 1) * (el.opacity ?? 1);
                
                if (el.type === 'pen') {
                   const pts = el.points.map((p:any) => `${p.x * SAFE_W},${p.y * SAFE_H}`).join(' ');
                   const thick = ((el.thickness || 1.5) * 0.5 * MM_TO_PX) * SCALE_AVG;
                   return <G key={el.id} opacity={totalOpacity}><Polyline points={pts} stroke={el.color} strokeWidth={thick} fill="none" /></G>;
                }
                if (el.type === 'rect') {
                   const left = Math.min(el.x, el.x + el.w) * SAFE_W; const top = Math.min(el.y, el.y + el.h) * SAFE_H;
                   const w = Math.abs(el.w) * SAFE_W; const h = Math.abs(el.h) * SAFE_H;
                   const rawStrokeWidth = el.strokeWidth ?? 1.5;
                   const hasBorder = el.borderStyle !== 'none' && rawStrokeWidth > 0;
                   const thick = hasBorder ? ((rawStrokeWidth * 0.5 * MM_TO_PX) * SCALE_AVG) : 0;
                   const rot = el.rotation || 0;
                   return (
                     <G key={el.id} opacity={totalOpacity} {...(rot ? { transform: `rotate(${rot}, ${left + w / 2}, ${top + h / 2})` } : {})}>
                       <Rect x={left} y={top} width={w} height={h} fill={el.color} fillOpacity={1} stroke={hasBorder ? (el.strokeColor || '#2563eb') : 'none'} strokeWidth={thick} strokeDasharray={hasBorder ? getDashArray(el.borderStyle, thick * 1.5) : undefined} />
                     </G>
                   );
                }
                if (el.type === 'circle') {
                   const cx = el.x * SAFE_W; const cy = el.y * SAFE_H; const r = el.r * SAFE_W; 
                   const rawStrokeWidth = el.strokeWidth ?? 1.5;
                   const hasBorder = el.borderStyle !== 'none' && rawStrokeWidth > 0;
                   const thick = hasBorder ? ((rawStrokeWidth * 0.5 * MM_TO_PX) * SCALE_AVG) : 0;
                   return <G key={el.id} opacity={totalOpacity}><PDFCircle cx={cx} cy={cy} r={r} fill={el.color} fillOpacity={1} stroke={hasBorder ? (el.strokeColor || '#2563eb') : 'none'} strokeWidth={thick} strokeDasharray={hasBorder ? getDashArray(el.borderStyle, thick * 1.5) : undefined} /></G>;
                }
                if (el.type === 'polygon') {
                   const pts = el.points.map((p:any) => `${p.x * SAFE_W},${p.y * SAFE_H}`).join(' ');
                   const rawStrokeWidth = el.strokeWidth ?? 1.5;
                   const hasBorder = el.borderStyle !== 'none' && rawStrokeWidth > 0;
                   const thick = hasBorder ? ((rawStrokeWidth * 0.5 * MM_TO_PX) * SCALE_AVG) : 0;
                   return <G key={el.id} opacity={totalOpacity}><Polygon points={pts} fill={el.color} fillOpacity={1} stroke={hasBorder ? (el.strokeColor || '#2563eb') : 'none'} strokeWidth={thick} strokeDasharray={hasBorder ? getDashArray(el.borderStyle, thick * 1.5) : undefined} /></G>;
                }
                if (el.type === 'arrow') {
                   const arr = el as any;
                   const sx = arr.start.x * SAFE_W; const sy = arr.start.y * SAFE_H;
                   const ex = arr.end.x * SAFE_W; const ey = arr.end.y * SAFE_H;
                   const strokeW = (arr.strokeWidth || 2) * 0.5 * MM_TO_PX * SCALE_AVG;
                   const angle = Math.atan2(ey - sy, ex - sx);
                   const headLen = 8 * MM_TO_PX * SCALE_AVG;
                   const headAngle = Math.PI / 6;
                   const x1 = ex - headLen * Math.cos(angle - headAngle);
                   const y1 = ey - headLen * Math.sin(angle - headAngle);
                   const x2 = ex - headLen * Math.cos(angle + headAngle);
                   const y2 = ey - headLen * Math.sin(angle + headAngle);
                   const arrowPoints = `${ex},${ey} ${x1},${y1} ${x2},${y2}`;
                   return (
                     <G key={arr.id} opacity={totalOpacity}>
                       <Line x1={sx} y1={sy} x2={ex} y2={ey} stroke={arr.color || '#ef4444'} strokeWidth={strokeW} strokeDasharray={getDashArray(arr.borderStyle, strokeW * 1.5)} />
                       <Polygon points={arrowPoints} fill={arr.color || '#ef4444'} />
                     </G>
                   );
                }
                if (el.type === 'measure') {
                   const sx = el.start.x * SAFE_W; const sy = el.start.y * SAFE_H;
                   const ex = el.end.x * SAFE_W; const ey = el.end.y * SAFE_H;
                   const tScale = el.textScale || 1;
                   return (
                     <G key={el.id} opacity={totalOpacity}>
                       <Line x1={sx} y1={sy} x2={ex} y2={ey} stroke={el.color || '#3b82f6'} strokeWidth={0.5 * MM_TO_PX * SCALE_AVG * tScale} />
                       <PDFCircle cx={sx} cy={sy} r={1.2 * MM_TO_PX * SCALE_AVG * tScale} fill="#000000" />
                       <PDFCircle cx={ex} cy={ey} r={1.2 * MM_TO_PX * SCALE_AVG * tScale} fill="#000000" />
                     </G>
                   );
                }
                if (el.type === 'scalebar') {
                   const relW = (1000 / planScale * el.lengthMeters) / origW_mm; const w_pdf = relW * SAFE_W;
                   const x = el.x * SAFE_W; const y = el.y * SAFE_H; const thick = (el.thickness || 1.5) * MM_TO_PX * SCALE_Y;
                   return (
                     <G key={el.id} opacity={totalOpacity}>
                       <Rect x={x} y={y} width={w_pdf/2} height={thick} fill={el.color} />
                       <Rect x={x + w_pdf/2} y={y} width={w_pdf/2} height={thick} fill="#ffffff" stroke={el.color} strokeWidth={thick/3} />
                     </G>
                   );
                }
                if (el.type === 'defect') {
                   const x = el.x * SAFE_W; const y = el.y * SAFE_H; const r = 3.5 * MM_TO_PX * SCALE_AVG;
                   const st = (el.status || '').toLowerCase();
                   const isDone = st === 'done' || st === 'resolved' || st === 'behoben' || st === 'erledigt';
                   const isReview = st === 'in review' || st === 'review' || st === 'abnahme';
                   const isInProgress = st === 'in progress' || st === 'in_progress' || st === 'in arbeit';
                   const pinColor = isDone ? "#10b981" : isReview ? "#3b82f6" : isInProgress ? "#f59e0b" : "#ef4444";
                   return (
                     <G key={el.id} opacity={totalOpacity}>
                       <PDFCircle cx={x} cy={y} r={1.5 * MM_TO_PX * SCALE_AVG} fill="#000000" />
                       <PDFCircle cx={x} cy={y - (4 * MM_TO_PX * SCALE_AVG)} r={r} fill={pinColor} stroke="#ffffff" strokeWidth={0.8 * MM_TO_PX * SCALE_AVG} />
                       <PDFCircle cx={x} cy={y - (4 * MM_TO_PX * SCALE_AVG)} r={r * 0.45} fill="#ffffff" />
                     </G>
                   );
                }
                if (el.type === 'titleblock') {
                   const x = el.x * SAFE_W; const y = el.y * SAFE_H;
                   const tbWidth = 170 * MM_TO_PX * SCALE_X * el.scale; const h = 54 * MM_TO_PX * SCALE_Y * el.scale;
                   const tCol = el.textColor || '#000000';
                   return (
                     <G key={el.id} opacity={totalOpacity}>
                        <Rect x={x} y={y} width={tbWidth} height={h} fill="#ffffff" stroke={tCol} strokeWidth={1 * SCALE_AVG} />
                        <Line x1={x} y1={y + h*(54/162)} x2={x + tbWidth} y2={y + h*(54/162)} stroke={tCol} strokeWidth={0.5 * SCALE_AVG} />
                        <Line x1={x} y1={y + h*(90/162)} x2={x + tbWidth} y2={y + h*(90/162)} stroke={tCol} strokeWidth={0.5 * SCALE_AVG} />
                        <Line x1={x} y1={y + h*(126/162)} x2={x + tbWidth} y2={y + h*(126/162)} stroke={tCol} strokeWidth={0.5 * SCALE_AVG} />

                        <Line x1={x + tbWidth*0.66} y1={y} x2={x + tbWidth*0.66} y2={y + h*(54/162)} stroke={tCol} strokeWidth={0.5 * SCALE_AVG} />
                        <Line x1={x + tbWidth*0.6} y1={y + h*(54/162)} x2={x + tbWidth*0.6} y2={y + h*(126/162)} stroke={tCol} strokeWidth={0.5 * SCALE_AVG} />
                        <Line x1={x + tbWidth*0.2} y1={y + h*(126/162)} x2={x + tbWidth*0.2} y2={y + h} stroke={tCol} strokeWidth={0.5 * SCALE_AVG} />
                        <Line x1={x + tbWidth*0.4} y1={y + h*(126/162)} x2={x + tbWidth*0.4} y2={y + h} stroke={tCol} strokeWidth={0.5 * SCALE_AVG} />
                        <Line x1={x + tbWidth*0.6} y1={y + h*(126/162)} x2={x + tbWidth*0.6} y2={y + h} stroke={tCol} strokeWidth={0.5 * SCALE_AVG} />
                        <Line x1={x + tbWidth*0.8} y1={y + h*(126/162)} x2={x + tbWidth*0.8} y2={y + h} stroke={tCol} strokeWidth={0.5 * SCALE_AVG} />
                        <Rect x={x + tbWidth*0.6} y={y + h*(54/162)} width={tbWidth*0.4} height={h*(72/162)} fill="#000000" fillOpacity={0.04} />
                        <Rect x={x + tbWidth*0.8} y={y + h*(126/162)} width={tbWidth*0.2} height={h*(36/162)} fill={tCol} />
                     </G>
                   );
                }
                return null;
              })}
            </Svg>
          </View>
          
          <View style={{ position: 'absolute', top: 0, left: 0, width: SAFE_W, height: SAFE_H }}>
            {sortedElements.map((el: any) => {
              const layer = layers.find((l:any) => l.id === (el.layerId || 'default'));
              if (layer && !layer.visible) return null;
              const totalOpacity = (layer?.opacity ?? 1) * (el.opacity ?? 1);

              if (el.type === 'text') {
                return (
                  <View key={el.id} style={{ position: 'absolute', left: el.x * SAFE_W, top: (el.y * SAFE_H) - (el.size * MM_TO_PX * SCALE_AVG), opacity: totalOpacity }}>
                    <Text style={{ color: el.color, fontSize: el.size * MM_TO_PX * SCALE_AVG, fontFamily: 'Helvetica-Bold' }}>{el.text}</Text>
                  </View>
                );
              }
              if (el.type === 'measure') {
                 const dxReal_mm = (el.end.x - el.start.x) * origW_mm; const dyReal_mm = (el.end.y - el.start.y) * origH_mm;
                 const distMeters = ((Math.sqrt(dxReal_mm * dxReal_mm + dyReal_mm * dyReal_mm) * planScale) / 1000).toFixed(2);
                 const mx = (el.start.x * SAFE_W + el.end.x * SAFE_W) / 2;
                 const my = (el.start.y * SAFE_H + el.end.y * SAFE_H) / 2;
                 const tScale = el.textScale || 1;
                 const wBadge = 16 * MM_TO_PX * SCALE_X * tScale;
                 const hBadge = 5 * MM_TO_PX * SCALE_Y * tScale;
                 return (
                   <View key={el.id} style={{ position: 'absolute', left: mx - wBadge / 2, top: my - hBadge / 2, width: wBadge, height: hBadge, backgroundColor: '#ffffff', border: `0.6px solid ${el.color || '#3b82f6'}`, borderRadius: 1 * MM_TO_PX * SCALE_AVG * tScale, justifyContent: 'center', alignItems: 'center', opacity: totalOpacity }}>
                     <Text style={{ color: '#000000', fontSize: 2.8 * MM_TO_PX * SCALE_AVG * tScale, fontFamily: 'Helvetica-Bold' }}>{distMeters} m</Text>
                   </View>
                 );
              }
              if (el.type === 'polygon' && (el as any).showArea !== false && el.points && el.points.length >= 3) {
                 const sum = el.points.reduce((acc: any, p: any) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
                 const cx = (sum.x / el.points.length) * SAFE_W;
                 const cy = (sum.y / el.points.length) * SAFE_H;
                 let area = 0;
                 const n = el.points.length;
                 for (let i = 0; i < n; i++) {
                   const j = (i + 1) % n;
                   const xi_m = (el.points[i].x * origW_mm * planScale) / 1000;
                   const yi_m = (el.points[i].y * origH_mm * planScale) / 1000;
                   const xj_m = (el.points[j].x * origW_mm * planScale) / 1000;
                   const yj_m = (el.points[j].y * origH_mm * planScale) / 1000;
                   area += xi_m * yj_m - xj_m * yi_m;
                 }
                 const areaM2 = (Math.abs(area) / 2).toFixed(2);
                 const rName = (el as any).roomName;
                 const label = rName ? `${rName}: ${areaM2} m²` : `${areaM2} m²`;
                 const tScale = el.textScale || 1;
                 const badgeW = Math.max(30 * MM_TO_PX * SCALE_AVG, (label.length * 2.2 + 6) * MM_TO_PX * SCALE_AVG) * tScale;
                 const badgeH = 5 * MM_TO_PX * SCALE_AVG * tScale;
                 return (
                   <View key={`${el.id}-badge`} style={{ position: 'absolute', left: cx - badgeW / 2, top: cy - badgeH / 2, width: badgeW, height: badgeH, backgroundColor: '#ffffff', border: `0.8px solid ${el.strokeColor || '#2563eb'}`, borderRadius: 1 * MM_TO_PX * SCALE_AVG * tScale, justifyContent: 'center', alignItems: 'center', opacity: totalOpacity }}>
                     <Text style={{ color: '#0f172a', fontSize: 2.6 * MM_TO_PX * SCALE_AVG * tScale, fontFamily: 'Helvetica-Bold' }}>{label}</Text>
                   </View>
                 );
              }
              if (el.type === 'rect' && (el as any).showArea === true && Math.abs(el.w) > 0.01 && Math.abs(el.h) > 0.01) {
                 const cx = (Math.min(el.x, el.x + el.w) + Math.abs(el.w) / 2) * SAFE_W;
                 const cy = (Math.min(el.y, el.y + el.h) + Math.abs(el.h) / 2) * SAFE_H;
                 const w_m = (Math.abs(el.w) * origW_mm * planScale) / 1000;
                 const h_m = (Math.abs(el.h) * origH_mm * planScale) / 1000;
                 const areaM2 = (w_m * h_m).toFixed(2);
                 const rName = (el as any).roomName;
                 const label = rName ? `${rName}: ${areaM2} m²` : `${areaM2} m²`;
                 const tScale = el.textScale || 1;
                 const badgeW = Math.max(30 * MM_TO_PX * SCALE_AVG, (label.length * 2.2 + 6) * MM_TO_PX * SCALE_AVG) * tScale;
                 const badgeH = 5 * MM_TO_PX * SCALE_AVG * tScale;
                 return (
                   <View key={`${el.id}-badge`} style={{ position: 'absolute', left: cx - badgeW / 2, top: cy - badgeH / 2, width: badgeW, height: badgeH, backgroundColor: '#ffffff', border: `0.8px solid ${el.strokeColor || '#2563eb'}`, borderRadius: 1 * MM_TO_PX * SCALE_AVG * tScale, justifyContent: 'center', alignItems: 'center', opacity: totalOpacity }}>
                     <Text style={{ color: '#0f172a', fontSize: 2.6 * MM_TO_PX * SCALE_AVG * tScale, fontFamily: 'Helvetica-Bold' }}>{label}</Text>
                   </View>
                 );
              }
              if (el.type === 'circle' && (el as any).showArea === true && Math.abs(el.r) > 0.005) {
                 const cx = el.x * SAFE_W;
                 const cy = el.y * SAFE_H;
                 const r_m = (Math.abs(el.r) * origW_mm * planScale) / 1000;
                 const areaM2 = (Math.PI * r_m * r_m).toFixed(2);
                 const rName = (el as any).roomName;
                 const label = rName ? `${rName}: ${areaM2} m²` : `${areaM2} m²`;
                 const tScale = el.textScale || 1;
                 const badgeW = Math.max(30 * MM_TO_PX * SCALE_AVG, (label.length * 2.2 + 6) * MM_TO_PX * SCALE_AVG) * tScale;
                 const badgeH = 5 * MM_TO_PX * SCALE_AVG * tScale;
                 return (
                   <View key={`${el.id}-badge`} style={{ position: 'absolute', left: cx - badgeW / 2, top: cy - badgeH / 2, width: badgeW, height: badgeH, backgroundColor: '#ffffff', border: `0.8px solid ${el.strokeColor || '#2563eb'}`, borderRadius: 1 * MM_TO_PX * SCALE_AVG * tScale, justifyContent: 'center', alignItems: 'center', opacity: totalOpacity }}>
                     <Text style={{ color: '#0f172a', fontSize: 2.6 * MM_TO_PX * SCALE_AVG * tScale, fontFamily: 'Helvetica-Bold' }}>{label}</Text>
                   </View>
                 );
              }
              if (el.type === 'scalebar') {
                 const relW = (1000 / planScale * el.lengthMeters) / origW_mm; const w_pdf = relW * SAFE_W;
                 const x = el.x * SAFE_W; const y = el.y * SAFE_H; const textPx = (el.textSize || 4) * MM_TO_PX * SCALE_AVG;
                 const boxW = Math.max(30, textPx * 4);
                 const topPos = y - Math.max(3.5 * MM_TO_PX * SCALE_Y, textPx * 1.15);
                 return (
                   <View key={el.id} style={{ position: 'absolute', left: x, top: topPos, width: w_pdf, opacity: totalOpacity }}>
                     <View style={{ position: 'absolute', left: -boxW / 2, width: boxW, alignItems: 'center' }}>
                       <Text style={{ color: el.color, fontSize: textPx, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>0</Text>
                     </View>
                     <View style={{ position: 'absolute', left: w_pdf / 2 - boxW / 2, width: boxW, alignItems: 'center' }}>
                       <Text style={{ color: el.color, fontSize: textPx, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>{+(el.lengthMeters / 2).toFixed(2)}</Text>
                     </View>
                     <View style={{ position: 'absolute', left: w_pdf - boxW / 2, width: boxW, alignItems: 'center' }}>
                       <Text style={{ color: el.color, fontSize: textPx, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>{el.lengthMeters} m</Text>
                     </View>
                   </View>
                 );
              }
              if (el.type === 'titleblock') {
                 const x = el.x * SAFE_W; const y = el.y * SAFE_H;
                 const tbWidth = 170 * MM_TO_PX * SCALE_X * el.scale; const h = 54 * MM_TO_PX * SCALE_Y * el.scale;
                 const tCol = el.textColor || '#000000';
                 const resolvedLogoUrl = el.data?.logoUrl !== undefined ? el.data.logoUrl : (companyProfile?.logoUrl || settings?.logo || '');
                 const fallbackBrand = companyProfile?.agencyName
                   || (el.data?.planverfasser && el.data.planverfasser !== 'Kreativ Desk' ? el.data.planverfasser : '')
                   || 'PLANVERFASSER';
                 const rawBrand = (el.data?.brandText !== undefined ? el.data.brandText : fallbackBrand).trim() || fallbackBrand;
                 const projTitle = el.data?.projekt || '';
                 const projFontMm = projTitle.length > 34 ? 3.5 : projTitle.length > 24 ? 4.2 : 5.0;

                 return (
                   <View key={el.id} style={{ position: 'absolute', left: x, top: y, width: tbWidth, height: h, opacity: totalOpacity }}>
                      {/* ZEILE 1 LINKS: Projekt & Adresse */}
                      <View style={{ position: 'absolute', left: 4 * SCALE_X, top: h * (4/162), width: tbWidth * 0.66 - 8 * SCALE_X, height: h * (46/162), overflow: 'hidden' }}>
                        <Text style={{ color: tCol, fontSize: 2.3 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('project')}</Text>
                        <Text style={{ color: tCol, fontSize: projFontMm * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold', marginTop: 1, maxLines: 1 } as any}>{el.data?.projekt || ''}</Text>
                        <Text style={{ color: tCol, fontSize: 3.1 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica', marginTop: 1, maxLines: 1 } as any}>{el.data?.adresse || ''}</Text>
                      </View>

                      {/* ZEILE 1 RECHTS: Eigenes Logo oder Firmenname */}
                      <View style={{ position: 'absolute', left: tbWidth * 0.66 + 4 * SCALE_X, top: h * (4/162), width: tbWidth * 0.34 - 8 * SCALE_X, height: h * (46/162), justifyContent: 'center', alignItems: 'flex-end', overflow: 'hidden' }}>
                        {resolvedLogoUrl ? (
                          <PDFImage src={resolvedLogoUrl} style={{ width: tbWidth * 0.34 - 12 * SCALE_X, height: h * (40/162), objectFit: 'contain' }} />
                        ) : (
                          <Text style={{ color: tCol, fontSize: 4.5 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold', textAlign: 'right' }}>{rawBrand}</Text>
                        )}
                      </View>

                      {/* ZEILE 2: Bauherrschaft & Planinhalt */}
                      <View style={{ position: 'absolute', left: 4 * SCALE_X, top: h * (58/162), width: tbWidth * 0.6 - 8 * SCALE_X, height: h * (30/162), overflow: 'hidden' }}>
                        <Text style={{ color: tCol, fontSize: 2.3 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('client')}</Text>
                        <Text style={{ color: tCol, fontSize: 3.5 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold', marginTop: 1 }}>{el.data?.bauherrschaft || ''}</Text>
                      </View>
                      <View style={{ position: 'absolute', left: tbWidth * 0.6 + 4 * SCALE_X, top: h * (58/162), width: tbWidth * 0.4 - 8 * SCALE_X, height: h * (30/162), overflow: 'hidden' }}>
                        <Text style={{ color: tCol, fontSize: 2.3 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('content')}</Text>
                        <Text style={{ color: tCol, fontSize: 4.0 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold', marginTop: 1 }}>{el.data?.planinhalt || ''}</Text>
                      </View>

                      {/* ZEILE 3: Planverfasser & Phase */}
                      <View style={{ position: 'absolute', left: 4 * SCALE_X, top: h * (94/162), width: tbWidth * 0.6 - 8 * SCALE_X, height: h * (30/162), overflow: 'hidden' }}>
                        <Text style={{ color: tCol, fontSize: 2.3 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('planner')}</Text>
                        <Text style={{ color: tCol, fontSize: 3.5 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold', marginTop: 1 }}>{el.data?.planverfasser || ''}</Text>
                      </View>
                      <View style={{ position: 'absolute', left: tbWidth * 0.6 + 4 * SCALE_X, top: h * (94/162), width: tbWidth * 0.4 - 8 * SCALE_X, height: h * (30/162), overflow: 'hidden' }}>
                        <Text style={{ color: tCol, fontSize: 2.3 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('phase')}</Text>
                        <Text style={{ color: tCol, fontSize: 3.3 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold', marginTop: 1 }}>{el.data?.phase || ''}</Text>
                      </View>

                      {/* ZEILE 4: Format, Massstab, Datum, Gez., Plannummer */}
                      <View style={{ position: 'absolute', left: 4 * SCALE_X, top: h * (130/162), width: tbWidth * 0.2 - 6 * SCALE_X, overflow: 'hidden' }}>
                        <Text style={{ color: tCol, fontSize: 2.3 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('format')}</Text>
                        <Text style={{ color: tCol, fontSize: 3.5 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold', marginTop: 1, maxLines: 1 } as any}>{originalFormat}</Text>
                      </View>

                      <View style={{ position: 'absolute', left: tbWidth*0.2 + 4 * SCALE_X, top: h * (130/162), width: tbWidth * 0.2 - 6 * SCALE_X, overflow: 'hidden' }}>
                        <Text style={{ color: tCol, fontSize: 2.3 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('scale')}</Text>
                        <Text style={{ color: tCol, fontSize: 3.5 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold', marginTop: 1, maxLines: 1 } as any}>1:{planScale}</Text>
                      </View>

                      <View style={{ position: 'absolute', left: tbWidth*0.4 + 4 * SCALE_X, top: h * (130/162), width: tbWidth * 0.2 - 6 * SCALE_X, overflow: 'hidden' }}>
                        <Text style={{ color: tCol, fontSize: 2.3 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('date')}</Text>
                        <Text style={{ color: tCol, fontSize: 3.5 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold', marginTop: 1, maxLines: 1 } as any}>{el.data?.datum || ''}</Text>
                      </View>

                      <View style={{ position: 'absolute', left: tbWidth*0.6 + 4 * SCALE_X, top: h * (130/162), width: tbWidth * 0.2 - 6 * SCALE_X, overflow: 'hidden' }}>
                        <Text style={{ color: tCol, fontSize: 2.3 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('drawn_by')}</Text>
                        <Text style={{ color: tCol, fontSize: 3.5 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold', marginTop: 1, maxLines: 1 } as any}>{el.data?.gez || ''}</Text>
                      </View>

                      <View style={{ position: 'absolute', left: tbWidth * 0.8, top: h * (126/162), width: tbWidth * 0.2, height: h * (36/162), backgroundColor: tCol, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 4 * SCALE_X }}>
                        <Text style={{ color: '#ffffff', fontSize: 2.2 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.8, fontFamily: 'Helvetica' }}>{t('plan_no')}</Text>
                        <Text style={{ color: '#ffffff', fontSize: 4 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold', marginTop: 1 }}>{el.data?.planNummer || ''}</Text>
                      </View>
                   </View>
                 );
              }
              return null;
            })}
          </View>
        </View>
      </Page>
    </Document>
  );
};
