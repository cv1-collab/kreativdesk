import React, { useEffect, useRef } from 'react';

interface HeroBrandCanvasProps {
  className?: string;
  isDark?: boolean;
}

interface ModuleNode {
  id: string;
  label: string;
  code: string;
  rx: number;
  ry: number;
  flank: 'left' | 'right';
  baseX: number;
  baseY: number;
  currentX: number;
  currentY: number;
  vx: number;
  vy: number;
  caught: number;
}

/**
 * EndNode: Grid unit with spring tension and interaction physics.
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
      const force = (1 - dist / radius) * (18 * this.depth);
      const angle = Math.atan2(dy, dx);
      this.vx -= Math.cos(angle) * force * 0.2;
      this.vy -= Math.sin(angle) * force * 0.2;
    }

    this.x += this.vx;
    this.y += this.vy;
  }
}

export default function HeroBrandCanvas({ className = '', isDark = true }: HeroBrandCanvasProps) {
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

    // 12 Authentic Kreativ Desk OS Module Nodes - strictly stationed in left & right flanks to keep center reading zone clear
    const moduleDefs = [
      // Left Flank (6 modules)
      { id: 'cube', label: '3D BIM (IFC)', code: 'IFC4::01', rx: 0.08, ry: 0.14, flank: 'left' as const },
      { id: 'cad', label: 'CAD Pläne', code: 'CAD.1:50', rx: 0.13, ry: 0.28, flank: 'left' as const },
      { id: 'calendar', label: 'Smart Calendar', code: 'SIA.TERM', rx: 0.07, ry: 0.44, flank: 'left' as const },
      { id: 'chat', label: 'Meet & Chat', code: 'P2P.VOIP', rx: 0.13, ry: 0.60, flank: 'left' as const },
      { id: 'offerte', label: 'Smart Offerte', code: 'OFF.SIA102', rx: 0.07, ry: 0.76, flank: 'left' as const },
      { id: 'bauakte', label: 'Bauakte', code: 'DOC.VAULT', rx: 0.12, ry: 0.90, flank: 'left' as const },

      // Right Flank (6 modules)
      { id: 'ledger', label: 'Finanzen & BKP', code: 'BKP.100-900', rx: 0.92, ry: 0.14, flank: 'right' as const },
      { id: 'deck', label: 'Pitch Deck Studio', code: 'PDF.VEKTOR', rx: 0.87, ry: 0.28, flank: 'right' as const },
      { id: 'tickets', label: 'Mängel & Tickets', code: 'ISSUE.SYNC', rx: 0.93, ry: 0.44, flank: 'right' as const },
      { id: 'camera', label: 'Baukamera', code: 'CAM.LIVE', rx: 0.87, ry: 0.60, flank: 'right' as const },
      { id: 'whiteboard', label: 'Whiteboard', code: 'CANVAS.2D', rx: 0.93, ry: 0.76, flank: 'right' as const },
      { id: 'rbac', label: 'Rollen & RBAC', code: 'AUTH.RBAC', rx: 0.88, ry: 0.90, flank: 'right' as const }
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

    // Fast vector icon drawer for module nodes
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
        // Finanzen
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

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const isMobile = width < 768;
      currentSpacing = isMobile ? 48 : 38;

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

      // Initialize module nodes strictly in the left and right flanks
      modules = moduleDefs.map((m) => {
        let computedX: number;
        if (m.flank === 'left') {
          const maxLeftX = Math.min(width * 0.16, width / 2 - 440);
          computedX = Math.max(isMobile ? 22 : 36, Math.min(maxLeftX, m.rx * width));
        } else {
          const minRightX = Math.max(width * 0.84, width / 2 + 440);
          computedX = Math.min(width - (isMobile ? 22 : 36), Math.max(minRightX, m.rx * width));
        }

        const computedY = m.ry * height;
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

    const resizeObserver = new ResizeObserver(() => {
      initCanvas();
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

    // Desktop Mouse Handlers - fluid and responsive
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

      // Snappy, silky smooth mouse tracking
      if (mouse.targetX > -1000) {
        mouse.x += (mouse.targetX - mouse.x) * 0.45;
        mouse.y += (mouse.targetY - mouse.y) * 0.45;
      } else {
        mouse.x += (mouse.targetX - mouse.x) * 0.15;
        mouse.y += (mouse.targetY - mouse.y) * 0.15;
      }

      mouse.auraPulse += dt * 3.0;

      ctx.clearRect(0, 0, width, height);

      const isMobile = width < 768;
      const interactionRadius = isMobile ? 110 : 150;

      // Content exclusion zone: central area where headline, subtitle, buttons, and video live
      const contentZoneMinX = isMobile ? width * 0.14 : Math.max(width * 0.18, width / 2 - 450);
      const contentZoneMaxX = isMobile ? width * 0.86 : Math.min(width * 0.82, width / 2 + 450);
      const isInContentZone = mouse.x >= contentZoneMinX && mouse.x <= contentZoneMaxX;

      // Active only in the peripheral margins around the content
      const isInteractionActive = mouse.x > -500 && mouse.y > -500 && !isInContentZone;

      // 1. Ambient architectural gradient
      const centerX = width / 2;
      const centerY = height * 0.44;
      const ambientGrad = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.min(width * 0.55, 480)
      );
      ambientGrad.addColorStop(0, isDark ? 'rgba(37, 99, 235, 0.08)' : 'rgba(37, 99, 235, 0.05)');
      ambientGrad.addColorStop(0.5, isDark ? 'rgba(56, 189, 248, 0.03)' : 'rgba(56, 189, 248, 0.02)');
      ambientGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = ambientGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.min(width * 0.55, 480), 0, Math.PI * 2);
      ctx.fill();

      // 2. Efficient Grid Rendering (Batched crosshairs)
      const crossSize = 2.5;
      ctx.beginPath();
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(71, 85, 105, 0.08)';

      for (let idx = 0; idx < nodes.length; idx++) {
        const node = nodes[idx];
        node.update(mouse.x, mouse.y, interactionRadius);

        ctx.moveTo(node.x - crossSize, node.y);
        ctx.lineTo(node.x + crossSize, node.y);
        ctx.moveTo(node.x, node.y - crossSize);
        ctx.lineTo(node.x, node.y + crossSize);
      }
      ctx.stroke();

      // 3. Flank Blueprint Circuits (Subtle connecting lines down left and right columns)
      ctx.save();
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 4]);

      const drawFlankCircuit = (startIndex: number, endIndex: number) => {
        for (let i = startIndex; i < endIndex; i++) {
          const n1 = modules[i];
          const n2 = modules[i + 1];
          if (!n1 || !n2) continue;

          ctx.strokeStyle = isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.11)';
          ctx.beginPath();
          ctx.moveTo(n1.currentX, n1.currentY);
          const midY = (n1.currentY + n2.currentY) / 2;
          ctx.bezierCurveTo(n1.currentX, midY, n2.currentX, midY, n2.currentX, n2.currentY);
          ctx.stroke();

          // Data pulse particle
          const packetT = ((time * 0.0007 + i * 0.22) % 1);
          const px = (1 - packetT) * n1.currentX + packetT * n2.currentX;
          const py = (1 - packetT) * n1.currentY + packetT * n2.currentY;
          ctx.fillStyle = isDark ? 'rgba(96, 165, 250, 0.45)' : 'rgba(37, 99, 235, 0.35)';
          ctx.fillRect(px - 1, py - 1, 2, 2);
        }
      };

      drawFlankCircuit(0, 5);  // Left flank circuit
      drawFlankCircuit(6, 11); // Right flank circuit
      ctx.restore();

      // 4. 12 Modules Matrix Interaction & Elastic Flank Filaments
      const CATCH_RADIUS = isMobile ? 120 : 180;
      const idleTime = time * 0.0015;

      modules.forEach((m, idx) => {
        // Gentle organic micro-physics floating
        const floatX = Math.sin(idleTime + idx * 0.9) * (isMobile ? 1.5 : 3.0);
        const floatY = Math.cos(idleTime * 0.8 + idx * 0.9) * (isMobile ? 1.5 : 3.0);

        const targetBaseX = m.baseX + floatX;
        const targetBaseY = m.baseY + floatY;

        const dx = mouse.x - targetBaseX;
        const dy = mouse.y - targetBaseY;
        const dist = isInteractionActive ? Math.hypot(dx, dy) : 9999;

        if (dist < CATCH_RADIUS) {
          m.caught = Math.min(1, m.caught + 0.15);
          const pull = (1 - dist / CATCH_RADIUS) * 20;
          const angle = Math.atan2(dy, dx);
          const targetX = targetBaseX + Math.cos(angle) * pull;
          const targetY = targetBaseY + Math.sin(angle) * pull;
          m.vx += (targetX - m.currentX) * 0.16;
          m.vy += (targetY - m.currentY) * 0.16;
        } else {
          m.caught *= 0.88;
          m.vx += (targetBaseX - m.currentX) * 0.10;
          m.vy += (targetBaseY - m.currentY) * 0.10;
        }

        m.vx *= 0.78;
        m.vy *= 0.78;
        m.currentX += m.vx;
        m.currentY += m.vy;

        // Draw elastic synaptic filament strictly in the flank (never crossing center)
        if (m.caught > 0.04 && isInteractionActive) {
          const threadColor = `hsla(${currentHue}, 90%, ${isDark ? '62%' : '48%'}, ${m.caught * 0.75})`;
          ctx.strokeStyle = threadColor;
          ctx.lineWidth = 0.9 + m.caught * 0.5;

          const midX = mouse.x + (m.currentX - mouse.x) * 0.5 + Math.sin(idx + time * 0.003) * (8 * m.caught);
          const midY = mouse.y + (m.currentY - mouse.y) * 0.5 + Math.cos(idx + time * 0.003) * (8 * m.caught);

          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.quadraticCurveTo(midX, midY, m.currentX, m.currentY);
          ctx.stroke();

          // Small light node on the thread
          ctx.fillStyle = threadColor;
          ctx.beginPath();
          ctx.arc(midX, midY, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Module Node (Icon + Label + Matrix CAD Syntax)
        ctx.save();
        ctx.translate(m.currentX, m.currentY);

        if (m.caught <= 0.04) {
          ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.28)' : 'rgba(100, 116, 139, 0.35)';
          drawModuleIcon(m.id, 6);

          // Technical CAD Crosshair at node anchor
          ctx.beginPath();
          ctx.moveTo(-10, 0); ctx.lineTo(-7, 0);
          ctx.moveTo(7, 0); ctx.lineTo(10, 0);
          ctx.stroke();

          ctx.font = '500 8.5px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
          ctx.textAlign = m.flank === 'left' ? 'left' : 'right';
          ctx.fillStyle = isDark ? 'rgba(148, 163, 184, 0.42)' : 'rgba(100, 116, 139, 0.52)';
          ctx.fillText(m.label, m.flank === 'left' ? 12 : -12, 3);

          // Subtle Monospace Matrix Coordinate Badge
          ctx.font = '600 7px "JetBrains Mono", ui-monospace, monospace';
          ctx.fillStyle = isDark ? 'rgba(96, 165, 250, 0.35)' : 'rgba(37, 99, 235, 0.30)';
          ctx.fillText(m.code, m.flank === 'left' ? 12 : -12, 11);
        } else {
          const strokeColor = `hsla(${currentHue}, 90%, ${isDark ? '68%' : '48%'}, ${0.4 + m.caught * 0.6})`;
          ctx.strokeStyle = strokeColor;

          // Glowing halo on activation
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.stroke();

          drawModuleIcon(m.id, 7);

          ctx.font = '600 9px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
          ctx.textAlign = m.flank === 'left' ? 'left' : 'right';
          ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
          ctx.fillText(m.label, m.flank === 'left' ? 14 : -14, 3);

          // Active Matrix Coordinate Badge
          ctx.font = '700 7.5px "JetBrains Mono", ui-monospace, monospace';
          ctx.fillStyle = isDark ? '#60a5fa' : '#2563eb';
          ctx.fillText(`[${m.code}]`, m.flank === 'left' ? 14 : -14, 13);
        }

        ctx.restore();
      });

      // 5. K-Logo Custom Cursor at Pointer Tip (Only in peripheral margins, never over central text/video)
      if (isInteractionActive) {
        ctx.save();
        ctx.translate(mouse.x, mouse.y);

        // Subtle aura behind the K cursor
        const auraRadius = (isMobile ? 26 : 32) + Math.sin(mouse.auraPulse) * 3;
        const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, auraRadius);
        auraGrad.addColorStop(0, `hsla(${currentHue}, 90%, 60%, ${isDark ? 0.30 : 0.22})`);
        auraGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        // K-Logo Badge (22x22 px)
        const size = 22;
        const r = 5.5;
        ctx.fillStyle = '#2563eb'; // Royal Blue
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(-size / 2, -size / 2, size, size, r);
        } else {
          ctx.rect(-size / 2, -size / 2, size, size);
        }
        ctx.fill();
        ctx.stroke();

        // White "K" in center
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 11px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('K', 0, 0.5);

        ctx.restore();
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrameId);
      } else {
        lastTime = performance.now();
        animFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelAnimationFrame(animFrameId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      resizeObserver.disconnect();

      heroZone.removeEventListener('touchstart', onTouchStart);
      heroZone.removeEventListener('touchmove', onTouchMove);
      heroZone.removeEventListener('touchend', onTouchEnd);
      heroZone.removeEventListener('touchcancel', onTouchEnd);

      heroZone.removeEventListener('mousemove', onMouseMove);
      heroZone.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isDark]);

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
