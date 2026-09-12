import React, { useEffect, useRef } from 'react';

interface HeroBrandCanvasProps {
  className?: string;
  isDark?: boolean;
}

interface ModuleItem {
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
  caught: number; // 0 = resting, 1 = fully caught
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

    let animFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse & Touch interaction state
    const mouse = {
      x: -2000,
      y: -2000,
      targetX: -2000,
      targetY: -2000,
      isActive: false,
      speed: 0
    };
    let lastMouse = { x: 0, y: 0 };

    // Dynamic Hue: starts at 221 (Royal Blue), shifts between 185 (Cyan) and 270 (Indigo/Violet)
    let currentHue = 221;
    let targetHue = 221;

    // Catch radius of the K-Logo Spider
    const CATCH_RADIUS = 230;

    // Engmaschiges Raster spacing
    const gridSpacing = 24;

    // 12 Authentic Kreativ Desk OS Modules scattered across the hero space
    const moduleDefs = [
      { id: 'cube', label: '3D Viewer (IFC)', rx: 0.12, ry: 0.20 },
      { id: 'ledger', label: 'Finanzen & BKP', rx: 0.88, ry: 0.18 },
      { id: 'calendar', label: 'Smart Calendar', rx: 0.08, ry: 0.50 },
      { id: 'tickets', label: 'Mängel & Tickets', rx: 0.92, ry: 0.46 },
      { id: 'cad', label: 'CAD Pläne', rx: 0.14, ry: 0.80 },
      { id: 'camera', label: 'Baukamera', rx: 0.86, ry: 0.76 },
      { id: 'offerte', label: 'Smart Offerte', rx: 0.28, ry: 0.24 },
      { id: 'deck', label: 'Pitch Deck Studio', rx: 0.72, ry: 0.22 },
      { id: 'chat', label: 'Meet & Chat', rx: 0.22, ry: 0.64 },
      { id: 'whiteboard', label: 'Whiteboard', rx: 0.78, ry: 0.62 },
      { id: 'bauakte', label: 'Bauakte', rx: 0.35, ry: 0.88 },
      { id: 'rbac', label: 'Rollen & RBAC', rx: 0.65, ry: 0.90 }
    ];

    let modules: ModuleItem[] = [];

    // 1. Retina Canvas Init & Snap Modules to Grid
    const initCanvas = () => {
      dpr = window.devicePixelRatio || 1;
      width = container.clientWidth;
      height = container.clientHeight;

      if (width === 0 || height === 0) return;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Snap modules to the fine grid
      modules = moduleDefs.map((m) => {
        const snapX = Math.round((m.rx * width) / gridSpacing) * gridSpacing;
        const snapY = Math.round((m.ry * height) / gridSpacing) * gridSpacing;
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
    };

    initCanvas();

    const resizeObserver = new ResizeObserver(() => {
      initCanvas();
    });
    resizeObserver.observe(container);

    // 2. Vector Icon Rendering for all 12 modules
    const drawModuleIcon = (type: string, s: number) => {
      ctx.lineWidth = 1.15;
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
        ctx.moveTo(0, 0);
        ctx.lineTo(0, s);
        ctx.moveTo(0, 0);
        ctx.lineTo(s, -s * 0.5);
        ctx.moveTo(0, 0);
        ctx.lineTo(-s, -s * 0.5);
        ctx.stroke();
      } else if (type === 'ledger') {
        // Finanzen / Münzen
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.4, s, s * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, s * 0.35, s, s * 0.4, 0, 0, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-s, -s * 0.4);
        ctx.lineTo(-s, s * 0.35);
        ctx.moveTo(s, -s * 0.4);
        ctx.lineTo(s, s * 0.35);
        ctx.stroke();
      } else if (type === 'calendar') {
        // Smart Calendar
        ctx.strokeRect(-s, -s * 0.8, s * 2, s * 1.6);
        ctx.beginPath();
        ctx.moveTo(-s, -s * 0.25);
        ctx.lineTo(s, -s * 0.25);
        ctx.moveTo(-s * 0.45, -s * 1.1);
        ctx.lineTo(-s * 0.45, -s * 0.5);
        ctx.moveTo(s * 0.45, -s * 1.1);
        ctx.lineTo(s * 0.45, -s * 0.5);
        ctx.stroke();
      } else if (type === 'tickets') {
        // Mängel & Tickets
        ctx.strokeRect(-s * 0.85, -s * 0.85, s * 1.7, s * 1.7);
        ctx.beginPath();
        ctx.moveTo(-s * 0.4, -s * 0.1);
        ctx.lineTo(-s * 0.1, s * 0.3);
        ctx.lineTo(s * 0.45, -s * 0.35);
        ctx.stroke();
      } else if (type === 'cad') {
        // CAD Pläne
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(-s * 0.8, s * 0.8);
        ctx.lineTo(s * 0.8, s * 0.8);
        ctx.closePath();
        ctx.stroke();
      } else if (type === 'camera') {
        // Baukamera
        ctx.strokeRect(-s, -s * 0.6, s * 2, s * 1.4);
        ctx.beginPath();
        ctx.arc(0, 0.1 * s, s * 0.4, 0, Math.PI * 2);
        ctx.moveTo(-s * 0.5, -s * 0.6);
        ctx.lineTo(-s * 0.2, -s * 0.9);
        ctx.lineTo(s * 0.2, -s * 0.9);
        ctx.lineTo(s * 0.5, -s * 0.6);
        ctx.stroke();
      } else if (type === 'offerte') {
        // Smart Offerte
        ctx.strokeRect(-s * 0.7, -s, s * 1.4, s * 2);
        ctx.beginPath();
        ctx.moveTo(-s * 0.35, -s * 0.4);
        ctx.lineTo(s * 0.35, -s * 0.4);
        ctx.moveTo(-s * 0.35, 0);
        ctx.lineTo(s * 0.35, 0);
        ctx.stroke();
      } else if (type === 'deck') {
        // Pitch Deck
        ctx.strokeRect(-s, -s * 0.7, s * 2, s * 1.3);
        ctx.beginPath();
        ctx.moveTo(0, s * 0.6);
        ctx.lineTo(0, s);
        ctx.moveTo(-s * 0.5, s);
        ctx.lineTo(s * 0.5, s);
        ctx.stroke();
      } else if (type === 'chat') {
        // Meet & Chat Bubble
        ctx.beginPath();
        ctx.arc(0, -s * 0.2, s * 0.75, 0, Math.PI * 2);
        ctx.moveTo(-s * 0.3, s * 0.4);
        ctx.lineTo(-s * 0.6, s * 0.9);
        ctx.lineTo(0.1 * s, s * 0.5);
        ctx.stroke();
      } else if (type === 'whiteboard') {
        // Whiteboard
        ctx.strokeRect(-s, -s * 0.8, s * 2, s * 1.6);
        ctx.beginPath();
        ctx.moveTo(-s * 0.55, s * 0.3);
        ctx.lineTo(s * 0.55, -s * 0.3);
        ctx.stroke();
      } else if (type === 'bauakte') {
        // Bauakte Ordner
        ctx.beginPath();
        ctx.moveTo(-s, -s * 0.5);
        ctx.lineTo(-s * 0.3, -s * 0.5);
        ctx.lineTo(0, -s * 0.8);
        ctx.lineTo(s, -s * 0.8);
        ctx.lineTo(s, s * 0.8);
        ctx.lineTo(-s, s * 0.8);
        ctx.closePath();
        ctx.stroke();
      } else if (type === 'rbac') {
        // Rollen & RBAC Schild
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.8, -s * 0.5);
        ctx.lineTo(s * 0.8, s * 0.2);
        ctx.quadraticCurveTo(0, s, 0, s);
        ctx.quadraticCurveTo(-s * 0.8, s * 0.2, -s * 0.8, s * 0.2);
        ctx.lineTo(-s * 0.8, -s * 0.5);
        ctx.closePath();
        ctx.stroke();
      }
    };

    // 3. Event Listeners for Touch and Mouse
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        mouse.targetX = touch.clientX - rect.left;
        mouse.targetY = touch.clientY - rect.top;
        mouse.isActive = true;

        const mdx = mouse.targetX - lastMouse.x;
        const mdy = mouse.targetY - lastMouse.y;
        mouse.speed = Math.sqrt(mdx * mdx + mdy * mdy);
        lastMouse.x = mouse.targetX;
        lastMouse.y = mouse.targetY;

        targetHue = 185 + (touch.clientX / Math.max(window.innerWidth, 1)) * 85;
      }
    };

    const onTouchStart = (e: TouchEvent) => handleTouch(e);
    const onTouchMove = (e: TouchEvent) => handleTouch(e);
    const onTouchEnd = () => {
      mouse.targetX = -2000;
      mouse.targetY = -2000;
      mouse.isActive = false;
      mouse.speed = 0;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.isActive = true;

      const mdx = mouse.targetX - lastMouse.x;
      const mdy = mouse.targetY - lastMouse.y;
      mouse.speed = Math.sqrt(mdx * mdx + mdy * mdy);
      lastMouse.x = mouse.targetX;
      lastMouse.y = mouse.targetY;

      targetHue = 185 + (e.clientX / Math.max(window.innerWidth, 1)) * 85;
    };

    const onMouseLeave = () => {
      mouse.targetX = -2000;
      mouse.targetY = -2000;
      mouse.isActive = false;
      mouse.speed = 0;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchEnd, { passive: true });

    container.addEventListener('mousemove', onMouseMove, { passive: true });
    container.addEventListener('mouseleave', onMouseLeave, { passive: true });

    // 4. Main Animation Loop
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.24;
      mouse.y += (mouse.targetY - mouse.y) * 0.24;

      // Smooth Hue interpolation
      currentHue += (targetHue - currentHue) * 0.08;
      if (mouse.speed < 0.5) {
        targetHue += (221 - targetHue) * 0.03;
      }

      // 1. Engmaschiges, ultrafeines CAD-Raster im Hintergrund
      const dotAlpha = isDark ? 0.18 : 0.14;
      ctx.fillStyle = isDark ? `rgba(148, 163, 184, ${dotAlpha})` : `rgba(100, 116, 139, ${dotAlpha})`;
      for (let x = gridSpacing / 2; x < width; x += gridSpacing) {
        for (let y = gridSpacing / 2; y < height; y += gridSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 0.75, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const isPointerActive = mouse.x > -500 && mouse.y > -500;

      // 2. Spider-Interaktion mit allen verstreuten Modulen
      modules.forEach((m, idx) => {
        const dx = mouse.x - m.baseX;
        const dy = mouse.y - m.baseY;
        const dist = isPointerActive ? Math.hypot(dx, dy) : 9999;

        if (dist < CATCH_RADIUS) {
          m.caught = Math.min(1, m.caught + 0.18);
          // Elastischer Zug zum K-Spider hin
          const pull = (1 - dist / CATCH_RADIUS) * 26;
          const angle = Math.atan2(dy, dx);
          const targetPullX = m.baseX + Math.cos(angle) * pull;
          const targetPullY = m.baseY + Math.sin(angle) * pull;
          m.vx += (targetPullX - m.currentX) * 0.14;
          m.vy += (targetPullY - m.currentY) * 0.14;
        } else {
          m.caught *= 0.90;
          m.vx += (m.baseX - m.currentX) * 0.1;
          m.vy += (m.baseY - m.currentY) * 0.1;
        }

        m.vx *= 0.72;
        m.vy *= 0.72;
        m.currentX += m.vx;
        m.currentY += m.vy;

        // Faden spinnen, wenn eingefangen
        if (m.caught > 0.04 && isPointerActive) {
          const threadColor = `hsla(${currentHue}, 95%, ${isDark ? '60%' : '48%'}, ${m.caught * 0.85})`;
          ctx.strokeStyle = threadColor;
          ctx.lineWidth = 1 + m.caught * 0.4;

          const midX = mouse.x + (m.currentX - mouse.x) * 0.5 + Math.sin(idx + time * 0.003) * (14 * m.caught);
          const midY = mouse.y + (m.currentY - mouse.y) * 0.5 + Math.cos(idx + time * 0.003) * (14 * m.caught);

          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.quadraticCurveTo(midX, midY, m.currentX, m.currentY);
          ctx.stroke();

          // Kleiner Lichtknoten auf der Fadenmitte
          ctx.fillStyle = threadColor;
          ctx.beginPath();
          ctx.arc(midX, midY, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Modul zeichnen
        ctx.save();
        ctx.translate(m.currentX, m.currentY);

        if (m.caught <= 0.04) {
          // Ruhender Zustand im Raster
          ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.35)' : 'rgba(100, 116, 139, 0.4)';
          drawModuleIcon(m.id, 6.5);

          ctx.font = '500 8.5px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = isDark ? 'rgba(148, 163, 184, 0.45)' : 'rgba(100, 116, 139, 0.55)';
          ctx.fillText(m.label, 0, 16);
        } else {
          // Aktiviert & erleuchtet durch das K
          const strokeColor = `hsla(${currentHue}, 90%, ${isDark ? '65%' : '48%'}, ${0.4 + m.caught * 0.6})`;
          ctx.strokeStyle = strokeColor;

          // Haloring bei Aktivierung
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.stroke();

          drawModuleIcon(m.id, 7.5);

          ctx.font = '600 9px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
          ctx.fillText(m.label, 0, 18);
        }

        ctx.restore();
      });

      // 3. K-Spider Cursor an der Maus-/Touch-Spitze
      if (isPointerActive) {
        ctx.save();
        ctx.translate(mouse.x, mouse.y);

        // Sanfter bläulicher Aura-Glow hinter dem K
        const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 38);
        auraGrad.addColorStop(0, `hsla(${currentHue}, 90%, 60%, ${isDark ? 0.35 : 0.28})`);
        auraGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 38, 0, Math.PI * 2);
        ctx.fill();

        // K-Logo Badge (24x24 px)
        const size = 24;
        const r = 6;
        ctx.fillStyle = '#2563eb'; // Royal Blue
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(-size / 2, -size / 2, size, size, r);
        } else {
          ctx.rect(-size / 2, -size / 2, size, size);
        }
        ctx.fill();
        ctx.stroke();

        // Weißes "K" im Zentrum
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('K', 0, 0);

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

      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);

      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className={`hero-canvas-container absolute inset-0 w-full h-full overflow-hidden select-none ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none block"
      />
    </div>
  );
}
