import React, { useEffect, useRef } from 'react';

interface HeroBrandCanvasProps {
  className?: string;
  isDark?: boolean;
}

interface ModuleNode {
  id: string;
  label: string;
  rx: number;
  ry: number;
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

    // 12 Authentic Kreativ Desk OS Module Nodes
    const moduleDefs = [
      { id: 'cube', label: '3D BIM (IFC)', rx: 0.12, ry: 0.18 },
      { id: 'ledger', label: 'Finanzen & BKP', rx: 0.88, ry: 0.16 },
      { id: 'calendar', label: 'Smart Calendar', rx: 0.08, ry: 0.48 },
      { id: 'tickets', label: 'Mängel & Tickets', rx: 0.92, ry: 0.44 },
      { id: 'cad', label: 'CAD Pläne', rx: 0.14, ry: 0.78 },
      { id: 'camera', label: 'Baukamera', rx: 0.86, ry: 0.74 },
      { id: 'offerte', label: 'Smart Offerte', rx: 0.26, ry: 0.22 },
      { id: 'deck', label: 'Pitch Deck Studio', rx: 0.74, ry: 0.20 },
      { id: 'chat', label: 'Meet & Chat', rx: 0.20, ry: 0.62 },
      { id: 'whiteboard', label: 'Whiteboard', rx: 0.80, ry: 0.60 },
      { id: 'bauakte', label: 'Bauakte', rx: 0.32, ry: 0.86 },
      { id: 'rbac', label: 'Rollen & RBAC', rx: 0.68, ry: 0.88 }
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
      } else if (type === 'offerte' || type === 'deck') {
        // Dokument / Präsentation
        ctx.strokeRect(-s * 0.75, -s, s * 1.5, s * 2);
        ctx.beginPath();
        ctx.moveTo(-s * 0.4, -s * 0.4); ctx.lineTo(s * 0.4, -s * 0.4);
        ctx.moveTo(-s * 0.4, 0); ctx.lineTo(s * 0.4, 0);
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

      // Initialize module nodes
      modules = moduleDefs.map((m) => {
        const snapX = Math.round((m.rx * width) / currentSpacing) * currentSpacing;
        const snapY = Math.round((m.ry * height) / currentSpacing) * currentSpacing;
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
      const interactionRadius = isMobile ? 120 : 160;
      const isInteractionActive = mouse.x > -500 && mouse.y > -500;

      // 1. Ambient architectural gradient
      const centerX = width / 2;
      const centerY = height * 0.44;
      const ambientGrad = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.min(width * 0.55, 480)
      );
      ambientGrad.addColorStop(0, isDark ? 'rgba(37, 99, 235, 0.10)' : 'rgba(37, 99, 235, 0.06)');
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

      // 3. 12 Modules Matrix Interaction & Elastic Threads
      const CATCH_RADIUS = isMobile ? 150 : 210;

      modules.forEach((m, idx) => {
        const dx = mouse.x - m.baseX;
        const dy = mouse.y - m.baseY;
        const dist = isInteractionActive ? Math.hypot(dx, dy) : 9999;

        if (dist < CATCH_RADIUS) {
          m.caught = Math.min(1, m.caught + 0.15);
          const pull = (1 - dist / CATCH_RADIUS) * 22;
          const angle = Math.atan2(dy, dx);
          const targetX = m.baseX + Math.cos(angle) * pull;
          const targetY = m.baseY + Math.sin(angle) * pull;
          m.vx += (targetX - m.currentX) * 0.16;
          m.vy += (targetY - m.currentY) * 0.16;
        } else {
          m.caught *= 0.90;
          m.vx += (m.baseX - m.currentX) * 0.12;
          m.vy += (m.baseY - m.currentY) * 0.12;
        }

        m.vx *= 0.78;
        m.vy *= 0.78;
        m.currentX += m.vx;
        m.currentY += m.vy;

        // Draw elastic synaptic filament
        if (m.caught > 0.04 && isInteractionActive) {
          const threadColor = `hsla(${currentHue}, 90%, ${isDark ? '62%' : '48%'}, ${m.caught * 0.75})`;
          ctx.strokeStyle = threadColor;
          ctx.lineWidth = 0.9 + m.caught * 0.5;

          const midX = mouse.x + (m.currentX - mouse.x) * 0.5 + Math.sin(idx + time * 0.003) * (10 * m.caught);
          const midY = mouse.y + (m.currentY - mouse.y) * 0.5 + Math.cos(idx + time * 0.003) * (10 * m.caught);

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

        // Draw Module Icon and Label
        ctx.save();
        ctx.translate(m.currentX, m.currentY);

        if (m.caught <= 0.04) {
          ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.28)' : 'rgba(100, 116, 139, 0.35)';
          drawModuleIcon(m.id, 6);

          ctx.font = '500 8.5px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = isDark ? 'rgba(148, 163, 184, 0.38)' : 'rgba(100, 116, 139, 0.48)';
          ctx.fillText(m.label, 0, 15);
        } else {
          const strokeColor = `hsla(${currentHue}, 90%, ${isDark ? '68%' : '48%'}, ${0.4 + m.caught * 0.6})`;
          ctx.strokeStyle = strokeColor;

          // Glowing halo on activation
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.stroke();

          drawModuleIcon(m.id, 7);

          ctx.font = '600 9px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
          ctx.fillText(m.label, 0, 17);
        }

        ctx.restore();
      });

      // 4. K-Logo Custom Cursor at Pointer Tip
      if (isInteractionActive) {
        ctx.save();
        ctx.translate(mouse.x, mouse.y);

        // Subtle aura behind the K cursor
        const auraRadius = (isMobile ? 28 : 34) + Math.sin(mouse.auraPulse) * 3;
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
