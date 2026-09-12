import React, { useEffect, useRef } from 'react';

interface HeroBrandCanvasProps {
  className?: string;
  isDark?: boolean;
  language?: string;
}

interface ModuleNode {
  id: string;
  labelDe: string;
  labelEn: string;
  codeDe: string;
  codeEn: string;
  rx: number;
  ry: number;
  align: 'left' | 'right' | 'center';
  baseX: number;
  baseY: number;
  currentX: number;
  currentY: number;
  vx: number;
  vy: number;
  caught: number;
}

/**
 * EndNode: Grid unit with spring tension and interaction physics for the blueprint raster.
 */
class EndNode {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  depth: number;

  constructor(x: number, y: number, depth: number) {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.vx = 0;
    this.vy = 0;
    this.depth = depth;
  }

  update(mouseX: number, mouseY: number, radius: number) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const dist = Math.hypot(dx, dy);

    // Spring tension towards origin
    const springK = 0.05 * this.depth;
    const damping = 0.85;

    const ax = (this.originX - this.x) * springK;
    const ay = (this.originY - this.y) * springK;

    this.vx = (this.vx + ax) * damping;
    this.vy = (this.vy + ay) * damping;

    // Interaction displacement
    if (dist < radius && dist > 0) {
      const force = (1 - dist / radius) * (16 * this.depth);
      const angle = Math.atan2(dy, dx);
      this.vx -= Math.cos(angle) * force * 0.18;
      this.vy -= Math.sin(angle) * force * 0.18;
    }

    this.x += this.vx;
    this.y += this.vy;
  }
}

export default function HeroBrandCanvas({ className = '', isDark = true, language = 'de' }: HeroBrandCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const heroZone = (container.closest('.hero-zone') as HTMLElement) ||
      (document.querySelector('.hero-zone') as HTMLElement) ||
      container;

    let animFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: EndNode[] = [];
    let currentSpacing = 36;
    const isDe = (language || 'de').toLowerCase().startsWith('de');

    // 14 Module Nodes placed cleanly in clear background zones away from the central video
    const moduleDefs = [
      // Top Arch above headline (in the clear upper matrix zone)
      { id: 'cad', labelDe: 'CAD Pläne', labelEn: 'CAD Plans', codeDe: 'CAD.1:50', codeEn: 'CAD.1:50', rx: 0.25, ry: 0.15, align: 'left' as const },
      { id: 'cube', labelDe: '3D BIM (IFC)', labelEn: '3D BIM (IFC)', codeDe: 'IFC4::01', codeEn: 'IFC4::01', rx: 0.42, ry: 0.11, align: 'center' as const },
      { id: 'deck', labelDe: 'Pitch Deck Studio', labelEn: 'Pitch Deck Studio', codeDe: 'PDF.VEKTOR', codeEn: 'PDF.VECTOR', rx: 0.58, ry: 0.11, align: 'center' as const },
      { id: 'ledger', labelDe: 'Finanzen & BKP', labelEn: 'Finance & Cost Plans', codeDe: 'BKP.100-900', codeEn: 'CFC.100-900', rx: 0.75, ry: 0.15, align: 'right' as const },

      // Left Flank (strictly on the open white background to the left of the central video)
      { id: 'offerte', labelDe: 'Smart Offerte', labelEn: 'Smart Proposals', codeDe: 'OFF.SIA102', codeEn: 'PROP.SIA102', rx: 0.08, ry: 0.32, align: 'left' as const },
      { id: 'calendar', labelDe: 'Smart Calendar', labelEn: 'Smart Calendar', codeDe: 'SIA.TERM', codeEn: 'SCHED.SIA', rx: 0.10, ry: 0.44, align: 'left' as const },
      { id: 'chat', labelDe: 'Meet & Chat', labelEn: 'Meet & Chat', codeDe: 'P2P.VOIP', codeEn: 'P2P.VOIP', rx: 0.07, ry: 0.56, align: 'left' as const },
      { id: 'bauakte', labelDe: 'Bauakte', labelEn: 'Project Archive', codeDe: 'DOC.VAULT', codeEn: 'DOC.VAULT', rx: 0.09, ry: 0.69, align: 'left' as const },
      { id: 'rbac', labelDe: 'Rollen & RBAC', labelEn: 'Roles & RBAC', codeDe: 'AUTH.RBAC', codeEn: 'AUTH.RBAC', rx: 0.07, ry: 0.82, align: 'left' as const },

      // Right Flank (strictly on the open white background to the right of the central video)
      { id: 'tickets', labelDe: 'Mängel & Tickets', labelEn: 'Defects & Tickets', codeDe: 'ISSUE.SYNC', codeEn: 'ISSUE.SYNC', rx: 0.92, ry: 0.32, align: 'right' as const },
      { id: 'camera', labelDe: 'Baukamera', labelEn: 'Site Camera', codeDe: 'CAM.LIVE', codeEn: 'CAM.LIVE', rx: 0.90, ry: 0.44, align: 'right' as const },
      { id: 'whiteboard', labelDe: 'Whiteboard', labelEn: 'Whiteboard', codeDe: 'CANVAS.2D', codeEn: 'CANVAS.2D', rx: 0.93, ry: 0.56, align: 'right' as const },
      { id: 'ai', labelDe: 'KI-Concierge', labelEn: 'AI Concierge', codeDe: 'AI.NEURAL', codeEn: 'AI.NEURAL', rx: 0.91, ry: 0.69, align: 'right' as const },
      { id: 'cloud', labelDe: 'Colocation & Cloud', labelEn: 'Colocation & Cloud', codeDe: 'CH.HOSTING', codeEn: 'CH.HOSTING', rx: 0.93, ry: 0.82, align: 'right' as const }
    ];

    // Synapse network connections linking nodes into a technical blueprint matrix
    const synapseConnections: [number, number][] = [
      // Top arch chain
      [0, 1], // cad -> cube
      [1, 2], // cube -> deck
      [2, 3], // deck -> ledger

      // Left flank & inner network
      [0, 4], // cad -> offerte
      [4, 5], // offerte -> calendar
      [5, 6], // calendar -> chat
      [6, 7], // chat -> bauakte
      [7, 8], // bauakte -> rbac
      [4, 6], // offerte -> chat (cross matrix)
      [5, 8], // calendar -> rbac (cross matrix)

      // Right flank & inner network
      [3, 9], // ledger -> tickets
      [9, 10], // tickets -> camera
      [10, 11], // camera -> whiteboard
      [11, 12], // whiteboard -> ai
      [12, 13], // ai -> cloud
      [9, 11], // tickets -> whiteboard (cross matrix)
      [11, 13], // whiteboard -> cloud (cross matrix)

      // Bridge connections around perimeter
      [1, 5], // cube -> calendar
      [2, 11]  // deck -> whiteboard
    ];

    let modules: ModuleNode[] = [];

    // Mouse & Touch interaction state
    const mouse = {
      x: -2000,
      y: -2000,
      targetX: -2000,
      targetY: -2000,
      auraPulse: 0
    };

    let currentHue = 215;
    let targetHue = 215;

    // Vector icon drawer for all 14 authentic Kreativ Desk OS modules
    const drawModuleIcon = (type: string, s: number) => {
      ctx.lineWidth = 1.1;
      if (type === 'cube') {
        // 3D IFC Kubus
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s, -s * 0.5);
        ctx.lineTo(s, s * 0.5);
        ctx.lineTo(0, s);
        ctx.lineTo(-s, s * 0.5);
        ctx.lineTo(-s, -s * 0.5);
        ctx.closePath();
        ctx.moveTo(0, 0); ctx.lineTo(0, s);
        ctx.moveTo(0, 0); ctx.lineTo(s, -s * 0.5);
        ctx.moveTo(0, 0); ctx.lineTo(-s, -s * 0.5);
        ctx.stroke();
      } else if (type === 'ledger') {
        // Finanzen & BKP
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.35, s, s * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, s * 0.35, s, s * 0.35, 0, 0, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-s, -s * 0.35); ctx.lineTo(-s, s * 0.35);
        ctx.moveTo(s, -s * 0.35); ctx.lineTo(s, s * 0.35);
        ctx.stroke();
      } else if (type === 'calendar') {
        // Kalender
        ctx.strokeRect(-s, -s, s * 2, s * 2);
        ctx.beginPath();
        ctx.moveTo(-s, -s * 0.3); ctx.lineTo(s, -s * 0.3);
        ctx.stroke();
      } else if (type === 'camera') {
        // Kamera
        ctx.strokeRect(-s, -s * 0.7, s * 2, s * 1.4);
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2);
        ctx.stroke();
      } else if (type === 'offerte' || type === 'deck' || type === 'bauakte') {
        // Dokument / Plan / Mappe
        ctx.strokeRect(-s * 0.75, -s, s * 1.5, s * 2);
        ctx.beginPath();
        ctx.moveTo(-s * 0.4, -s * 0.4); ctx.lineTo(s * 0.4, -s * 0.4);
        ctx.moveTo(-s * 0.4, 0); ctx.lineTo(s * 0.4, 0);
        ctx.stroke();
      } else if (type === 'cad') {
        // CAD Fadenkreuz mit Kreis
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
        ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
        ctx.moveTo(0, -s); ctx.lineTo(0, s);
        ctx.stroke();
      } else if (type === 'tickets') {
        // Mängel Ticket Dreieck
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s, s * 0.8);
        ctx.lineTo(-s, s * 0.8);
        ctx.closePath();
        ctx.moveTo(0, -s * 0.3); ctx.lineTo(0, s * 0.2);
        ctx.stroke();
      } else if (type === 'chat') {
        // Sprechblase
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.1, s * 0.9, s * 0.7, 0, 0, Math.PI * 2);
        ctx.moveTo(-s * 0.4, s * 0.4);
        ctx.lineTo(-s * 0.7, s * 0.85);
        ctx.lineTo(-s * 0.1, s * 0.55);
        ctx.stroke();
      } else if (type === 'rbac') {
        // Security Shield / RBAC
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.8, -s * 0.5);
        ctx.lineTo(s * 0.8, s * 0.2);
        ctx.quadraticCurveTo(s * 0.8, s * 0.8, 0, s);
        ctx.quadraticCurveTo(-s * 0.8, s * 0.8, -s * 0.8, s * 0.2);
        ctx.lineTo(-s * 0.8, -s * 0.5);
        ctx.closePath();
        ctx.stroke();
      } else if (type === 'whiteboard') {
        // Whiteboard / Canvas
        ctx.strokeRect(-s, -s * 0.75, s * 2, s * 1.5);
        ctx.beginPath();
        ctx.moveTo(-s * 0.5, s * 0.2);
        ctx.lineTo(0, -s * 0.3);
        ctx.lineTo(s * 0.5, s * 0.1);
        ctx.stroke();
      } else if (type === 'ai') {
        // KI-Concierge Sparkle / Neural Node
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -s); ctx.lineTo(0, s);
        ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
        ctx.moveTo(-s * 0.6, -s * 0.6); ctx.lineTo(s * 0.6, s * 0.6);
        ctx.moveTo(s * 0.6, -s * 0.6); ctx.lineTo(-s * 0.6, s * 0.6);
        ctx.stroke();
      } else if (type === 'cloud') {
        // Colocation & Cloud Hosting
        ctx.beginPath();
        ctx.arc(-s * 0.35, 0, s * 0.45, Math.PI * 0.7, Math.PI * 1.8);
        ctx.arc(s * 0.1, -s * 0.3, s * 0.55, Math.PI * 1.1, Math.PI * 1.95);
        ctx.arc(s * 0.4, 0, s * 0.4, Math.PI * 1.8, Math.PI * 0.4);
        ctx.closePath();
        ctx.stroke();
      } else {
        // Standard Synapsen-Knoten
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    function initCanvas() {
      dpr = window.devicePixelRatio || 1;
      width = heroZone.clientWidth;
      height = heroZone.clientHeight;

      if (width === 0 || height === 0) return;

      // On mobile / smartphones, leave out background canvas play to avoid cluttering small screens
      if (width < 768) {
        nodes = [];
        modules = [];
        ctx.clearRect(0, 0, width, height);
        return;
      }

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      currentSpacing = 36;

      nodes = [];
      let i = 0;
      for (let x = currentSpacing / 2; x < width; x += currentSpacing) {
        let j = 0;
        for (let y = currentSpacing / 2; y < height; y += currentSpacing) {
          const depth = ((i + j) % 3 === 0) ? 0.75 : 1.0;
          nodes.push(new EndNode(x, y, depth));
          j++;
        }
        i++;
      }

      // Dynamic Video Exclusion Zone:
      // The central video is max-w-5xl (1024px) centered. Compute its boundaries on screen:
      const maxVideoWidth = 1024;
      const horizontalGutter = Math.max(16, (width - maxVideoWidth) / 2);
      const videoLeftEdge = horizontalGutter;
      const videoRightEdge = width - horizontalGutter;

      // Initialize 14 module nodes mapped onto proportional positions
      modules = moduleDefs.map((m) => {
        let computedX = m.rx * width;
        let computedY = m.ry * height;

        // If node is in the vertical range of the central video (ry > 0.46)
        if (m.ry > 0.46) {
          if (m.rx < 0.4) {
            // Keep strictly to the left of the video frame in the open white space
            computedX = Math.min(videoLeftEdge - 34, computedX);
          } else if (m.rx > 0.6) {
            // Keep strictly to the right of the video frame in the open white space
            computedX = Math.max(videoRightEdge + 34, computedX);
          }
        }

        // Ensure nodes maintain safe margin from viewport edges so text is never clipped
        if (m.rx < 0.3) {
          computedX = Math.max(28, Math.min(videoLeftEdge - 28, computedX));
        }
        if (m.rx > 0.7) {
          computedX = Math.min(width - 28, Math.max(videoRightEdge + 28, computedX));
        }

        const snapX = Math.round(computedX / currentSpacing) * currentSpacing;
        const snapY = Math.round(computedY / currentSpacing) * currentSpacing;

        return {
          ...m,
          baseX: snapX,
          baseY: snapY,
          currentX: snapX,
          currentY: snapY,
          vx: 0,
          vy: 0,
          caught: 0
        };
      });
    }

    initCanvas();

    let lastW = heroZone.clientWidth;
    let lastH = heroZone.clientHeight;
    const resizeObserver = new ResizeObserver(() => {
      const newW = heroZone.clientWidth;
      const newH = heroZone.clientHeight;
      if (Math.abs(newW - lastW) >= 4 || Math.abs(newH - lastH) >= 4) {
        lastW = newW;
        lastH = newH;
        initCanvas();
        render(performance.now());
      }
    });
    resizeObserver.observe(heroZone);

    // Touch Handlers
    function handleTouch(e: TouchEvent) {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = heroZone.getBoundingClientRect();
        mouse.targetX = touch.clientX - rect.left;
        mouse.targetY = touch.clientY - rect.top;
        targetHue = 195 + (touch.clientX / Math.max(window.innerWidth, 1)) * 65;
      }
    }

    const onTouchStart = (e: TouchEvent) => handleTouch(e);
    const onTouchMove = (e: TouchEvent) => handleTouch(e);
    const onTouchEnd = () => {
      mouse.targetX = -2000;
      mouse.targetY = -2000;
    };

    // Desktop Mouse Handlers
    const onMouseMove = (e: MouseEvent) => {
      const rect = heroZone.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      targetHue = 195 + (e.clientX / Math.max(window.innerWidth, 1)) * 65;
    };

    const onMouseLeave = () => {
      mouse.targetX = -2000;
      mouse.targetY = -2000;
    };

    heroZone.addEventListener('touchstart', onTouchStart, { passive: true });
    heroZone.addEventListener('touchmove', onTouchMove, { passive: true });
    heroZone.addEventListener('touchend', onTouchEnd, { passive: true });
    heroZone.addEventListener('touchcancel', onTouchEnd, { passive: true });

    heroZone.addEventListener('mousemove', onMouseMove, { passive: true });
    heroZone.addEventListener('mouseleave', onMouseLeave, { passive: true });

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      currentHue += (targetHue - currentHue) * 0.1;

      // Fluid mouse tracking
      if (mouse.targetX > -1000) {
        mouse.x += (mouse.targetX - mouse.x) * 0.45;
        mouse.y += (mouse.targetY - mouse.y) * 0.45;
      } else {
        mouse.x += (mouse.targetX - mouse.x) * 0.15;
        mouse.y += (mouse.targetY - mouse.y) * 0.15;
      }

      mouse.auraPulse += dt * 3.0;

      ctx.clearRect(0, 0, width, height);

      // On mobile / smartphones, leave out background canvas play completely
      if (width < 768) {
        animFrameId = requestAnimationFrame(render);
        return;
      }

      const interactionRadius = 160;

      // 1. Ambient Blueprint Radial Gradient
      const centerX = width / 2;
      const centerY = height * 0.38;
      const ambientGrad = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.min(width * 0.58, 560)
      );
      ambientGrad.addColorStop(0, isDark ? 'rgba(37, 99, 235, 0.08)' : 'rgba(37, 99, 235, 0.08)');
      ambientGrad.addColorStop(0.5, isDark ? 'rgba(56, 189, 248, 0.03)' : 'rgba(56, 189, 248, 0.04)');
      ambientGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = ambientGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.min(width * 0.58, 560), 0, Math.PI * 2);
      ctx.fill();

      // 2. Blueprint Raster Grid (Major subdivision lines every 144px)
      const majorStep = currentSpacing * 4; // 144px
      ctx.save();
      ctx.lineWidth = 0.65;
      ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.05)' : 'rgba(37, 99, 235, 0.09)';
      ctx.beginPath();
      for (let x = majorStep / 2; x < width; x += majorStep) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = majorStep / 2; y < height; y += majorStep) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Technical coordinate stamps in corners
      ctx.font = '500 7px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillStyle = isDark ? 'rgba(148, 163, 184, 0.22)' : 'rgba(37, 99, 235, 0.35)';
      ctx.fillText('REF.SIA416::CH-LV95', 20, 24);
      ctx.fillText(`CANVAS.${Math.round(width)}x${Math.round(height)}`, width - 118, 24);
      ctx.restore();

      // 3. Grid Crosshairs with Spring Physics
      const crossSize = 2.5;
      ctx.beginPath();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(37, 99, 235, 0.18)';

      for (let idx = 0; idx < nodes.length; idx++) {
        const node = nodes[idx];
        node.update(mouse.x, mouse.y, interactionRadius);

        ctx.moveTo(node.x - crossSize, node.y);
        ctx.lineTo(node.x + crossSize, node.y);
        ctx.moveTo(node.x, node.y - crossSize);
        ctx.lineTo(node.x, node.y + crossSize);
      }
      ctx.stroke();

      // 4. Blueprint Synapse Network (Connecting curves & traveling data packets)
      ctx.save();
      ctx.lineWidth = 0.85;
      ctx.setLineDash([3, 4]);

      for (let i = 0; i < synapseConnections.length; i++) {
        const [idxA, idxB] = synapseConnections[i];
        const n1 = modules[idxA];
        const n2 = modules[idxB];
        if (!n1 || !n2) continue;

        ctx.strokeStyle = isDark ? 'rgba(59, 130, 246, 0.20)' : 'rgba(37, 99, 235, 0.18)';
        ctx.beginPath();
        ctx.moveTo(n1.currentX, n1.currentY);
        
        // Curved blueprint arch between nodes
        const midX = (n1.currentX + n2.currentX) / 2;
        const midY = (n1.currentY + n2.currentY) / 2;
        ctx.quadraticCurveTo(midX, midY, n2.currentX, n2.currentY);
        ctx.stroke();

        // Traveling data packet along synapse
        const packetT = ((time * 0.0006 + i * 0.14) % 1);
        const px = (1 - packetT) * (1 - packetT) * n1.currentX + 2 * (1 - packetT) * packetT * midX + packetT * packetT * n2.currentX;
        const py = (1 - packetT) * (1 - packetT) * n1.currentY + 2 * (1 - packetT) * packetT * midY + packetT * packetT * n2.currentY;
        
        ctx.fillStyle = isDark ? 'rgba(96, 165, 250, 0.65)' : 'rgba(37, 99, 235, 0.50)';
      }
      ctx.restore();

      // 5. Module Nodes Rendering & Elastic Synapse Reaction
      const CATCH_RADIUS = 170;
      const idleTime = time * 0.0015;

      modules.forEach((m, idx) => {
        // Organic floating micro-physics
        const floatX = Math.sin(idleTime + idx * 0.85) * 2.6;
        const floatY = Math.cos(idleTime * 0.75 + idx * 0.85) * 2.6;

        const targetBaseX = m.baseX + floatX;
        const targetBaseY = m.baseY + floatY;

        const dx = mouse.x - targetBaseX;
        const dy = mouse.y - targetBaseY;
        const dist = mouse.x > -500 ? Math.hypot(dx, dy) : 9999;

        if (dist < CATCH_RADIUS) {
          m.caught = Math.min(1, m.caught + 0.14);
          const pull = (1 - dist / CATCH_RADIUS) * 18;
          const angle = Math.atan2(dy, dx);
          const targetX = targetBaseX + Math.cos(angle) * pull;
          const targetY = targetBaseY + Math.sin(angle) * pull;
          m.vx += (targetX - m.currentX) * 0.15;
          m.vy += (targetY - m.currentY) * 0.15;
        } else {
          m.caught *= 0.88;
          m.vx += (targetBaseX - m.currentX) * 0.10;
          m.vy += (targetBaseY - m.currentY) * 0.10;
        }

        m.vx *= 0.78;
        m.vy *= 0.78;
        m.currentX += m.vx;
        m.currentY += m.vy;

        // Dynamic elastic filament towards active pointer
        if (m.caught > 0.04 && mouse.x > -500) {
          const threadColor = `hsla(${currentHue}, 90%, ${isDark ? '62%' : '48%'}, ${m.caught * 0.75})`;
          ctx.strokeStyle = threadColor;
          ctx.lineWidth = 0.9 + m.caught * 0.5;

          const filMidX = mouse.x + (m.currentX - mouse.x) * 0.5 + Math.sin(idx + time * 0.003) * (6 * m.caught);
          const filMidY = mouse.y + (m.currentY - mouse.y) * 0.5 + Math.cos(idx + time * 0.003) * (6 * m.caught);

          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.quadraticCurveTo(filMidX, filMidY, m.currentX, m.currentY);
          ctx.stroke();

          ctx.fillStyle = threadColor;
          ctx.beginPath();
          ctx.arc(filMidX, filMidY, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Module Node
        ctx.save();
        ctx.translate(m.currentX, m.currentY);

        const nodeLabel = isDe ? m.labelDe : m.labelEn;
        const nodeCode = isDe ? m.codeDe : m.codeEn;

        // Determine label alignment based on position: facing away from center
        let textAnchorX = 0;
        let textAnchorY = 0;
        let textAlignMode: CanvasTextAlign = 'center';
        let codeY = 11;

        if (m.align === 'left') {
          // Left side: label to the left of node, facing outwards
          textAlignMode = 'right';
          textAnchorX = -13;
          textAnchorY = 3;
          codeY = 11;
        } else if (m.align === 'right') {
          // Right side: label to the right of node, facing outwards
          textAlignMode = 'left';
          textAnchorX = 13;
          textAnchorY = 3;
          codeY = 11;
        } else {
          // Top arch: label above node
          textAlignMode = 'center';
          textAnchorX = 0;
          textAnchorY = -12;
          codeY = -20;
        }

        if (m.caught <= 0.04) {
          ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.35)' : 'rgba(37, 99, 235, 0.45)';
          drawModuleIcon(m.id, 6.5);

          // Technical CAD Crosshairs at node anchor
          ctx.beginPath();
          ctx.moveTo(-10, 0); ctx.lineTo(-7, 0);
          ctx.moveTo(7, 0); ctx.lineTo(10, 0);
          ctx.stroke();

          ctx.font = '600 8.5px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
          ctx.textAlign = textAlignMode;
          ctx.fillStyle = isDark ? 'rgba(148, 163, 184, 0.60)' : 'rgba(51, 65, 85, 0.75)';
          ctx.fillText(nodeLabel, textAnchorX, textAnchorY);

          // Matrix coordinate badge
          ctx.font = '600 7px "JetBrains Mono", ui-monospace, monospace';
          ctx.fillStyle = isDark ? 'rgba(96, 165, 250, 0.45)' : 'rgba(37, 99, 235, 0.50)';
          ctx.fillText(nodeCode, textAnchorX, codeY);
        } else {
          const strokeColor = `hsla(${currentHue}, 90%, ${isDark ? '68%' : '48%'}, ${0.4 + m.caught * 0.6})`;
          ctx.strokeStyle = strokeColor;

          // Glowing synaptic halo
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.stroke();

          drawModuleIcon(m.id, 7.5);

          ctx.font = '600 9px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
          ctx.textAlign = textAlignMode;
          ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
          ctx.fillText(nodeLabel, textAnchorX, textAnchorY);

          // Active coordinate badge
          ctx.font = '700 7.5px "JetBrains Mono", ui-monospace, monospace';
          ctx.fillStyle = isDark ? '#60a5fa' : '#2563eb';
          ctx.fillText(`[${nodeCode}]`, textAnchorX, codeY);
        }

        ctx.restore();
      });

      // 6. Custom K-Cursor Indicator
      if (mouse.x > -500 && mouse.y > -500) {
        ctx.save();
        ctx.translate(mouse.x, mouse.y);

        const auraRadius = 30 + Math.sin(mouse.auraPulse) * 3;
        const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, auraRadius);
        auraGrad.addColorStop(0, `hsla(${currentHue}, 90%, 60%, ${isDark ? 0.28 : 0.20})`);
        auraGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        // K-Logo Badge (22x22 px)
        const size = 22;
        const r = 5.5;
        ctx.fillStyle = '#2563eb';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(-size / 2, -size / 2, size, size, r);
        } else {
          ctx.rect(-size / 2, -size / 2, size, size);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 11px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('K', 0, 0.5);

        ctx.restore();
      }

      animFrameId = requestAnimationFrame(render);
    };

    // Immediate initial paint so canvas is never left blank
    render(performance.now());

    // Pause heavy render loop when scrolled offscreen to conserve GPU/CPU and prevent texture purging
    let isIntersecting = true;
    const intersectionObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      isIntersecting = entry.isIntersecting;
      if (isIntersecting) {
        lastTime = performance.now();
        cancelAnimationFrame(animFrameId);
        animFrameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animFrameId);
      }
    }, {
      rootMargin: '120px'
    });
    intersectionObserver.observe(heroZone);

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrameId);
      } else if (isIntersecting) {
        lastTime = performance.now();
        animFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelAnimationFrame(animFrameId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();

      heroZone.removeEventListener('touchstart', onTouchStart);
      heroZone.removeEventListener('touchmove', onTouchMove);
      heroZone.removeEventListener('touchend', onTouchEnd);
      heroZone.removeEventListener('touchcancel', onTouchEnd);

      heroZone.removeEventListener('mousemove', onMouseMove);
      heroZone.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isDark, language]);

  return (
    <div
      ref={containerRef}
      className={`hero-canvas-container absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none block"
      />
    </div>
  );
}
