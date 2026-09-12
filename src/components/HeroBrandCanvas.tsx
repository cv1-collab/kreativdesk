import React, { useEffect, useRef } from 'react';

interface HeroBrandCanvasProps {
  className?: string;
  isDark?: boolean;
}

interface SymbolNode {
  id: string;
  label: string;
  badge: string;
  icon: string;
  baseAngle: number;
  currentAngle: number;
  scale: number;
  targetScale: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

class EndNode {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  depth: number;
  i: number;
  j: number;

  constructor(x: number, y: number, depth: number, i: number, j: number) {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.vx = 0;
    this.vy = 0;
    this.depth = depth;
    this.i = i;
    this.j = j;
  }

  update(mouseX: number, mouseY: number, radius: number) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const dist = Math.hypot(dx, dy);

    // Spring tension towards origin
    const springK = 0.05 * this.depth;
    const damping = 0.84;

    const ax = (this.originX - this.x) * springK;
    const ay = (this.originY - this.y) * springK;

    this.vx = (this.vx + ax) * damping;
    this.vy = (this.vy + ay) * damping;

    // Interaction displacement
    if (dist < radius && dist > 0) {
      const force = (1 - dist / radius) * (20 * this.depth);
      const angle = Math.atan2(dy, dx);
      this.vx -= Math.cos(angle) * force * 0.22;
      this.vy -= Math.sin(angle) * force * 0.22;
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

    let animFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: EndNode[] = [];

    // Interaction states
    const mouse = {
      x: -2000,
      y: -2000,
      targetX: -2000,
      targetY: -2000,
      isActive: false,
      isTouch: false,
      auraPulse: 0
    };

    let currentHue = 195;
    let targetHue = 195;

    // Branded Swiss Architecture & OS Symbols
    const symbolsData = [
      { id: 'arch', label: 'Architektur', badge: 'SIA 102', icon: '🏢' },
      { id: 'budget', label: 'BKP Budget', badge: 'CHF Live', icon: '💰' },
      { id: 'calendar', label: 'Terminplan', badge: 'Phasen 31-53', icon: '📅' },
      { id: 'bim', label: '3D BIM', badge: 'IFC Model', icon: '📐' },
      { id: 'kdesk', label: 'Kreativ Desk', badge: 'OS Engine', icon: '⚡' }
    ];

    const symbols: SymbolNode[] = symbolsData.map((s, idx) => {
      const angle = (idx / symbolsData.length) * Math.PI * 2;
      return {
        ...s,
        baseAngle: angle,
        currentAngle: angle,
        scale: 0,
        targetScale: 0,
        x: -2000,
        y: -2000,
        vx: 0,
        vy: 0
      };
    });

    // 1. Retina-Sharp Canvas Initialization
    const initCanvas = () => {
      dpr = window.devicePixelRatio || 1;
      width = container.clientWidth;
      height = container.clientHeight;

      if (width === 0 || height === 0) return;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transforms
      ctx.scale(dpr, dpr);

      // Adaptive grid spacing
      const isMobile = width < 768;
      const spacing = isMobile ? 42 : 36;

      nodes = [];
      let i = 0;
      for (let x = spacing / 2; x < width; x += spacing) {
        let j = 0;
        for (let y = spacing / 2; y < height; y += spacing) {
          const depth = (i + j) % 3 === 0 ? 0.75 : 1.0;
          nodes.push(new EndNode(x, y, depth, i, j));
          j++;
        }
        i++;
      }
    };

    initCanvas();

    const resizeObserver = new ResizeObserver(() => {
      initCanvas();
    });
    resizeObserver.observe(container);

    // 2. Touch Interaction for iPad & iPhone
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        mouse.targetX = touch.clientX - rect.left;
        mouse.targetY = touch.clientY - rect.top;
        mouse.isActive = true;
        mouse.isTouch = true;

        // Dynamic Hue Modulation when swiping
        targetHue = 185 + (touch.clientX / Math.max(window.innerWidth, 1)) * 85;
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      handleTouch(e);
    };

    const onTouchMove = (e: TouchEvent) => {
      handleTouch(e);
    };

    const onTouchEnd = () => {
      // Smooth damped springback on touch release
      mouse.targetX = -2000;
      mouse.targetY = -2000;
      mouse.isActive = false;
    };

    // 3. Desktop Mouse Handlers
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.isActive = true;
      mouse.isTouch = false;

      targetHue = 185 + (e.clientX / Math.max(window.innerWidth, 1)) * 85;
    };

    const onMouseLeave = () => {
      mouse.targetX = -2000;
      mouse.targetY = -2000;
      mouse.isActive = false;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchEnd, { passive: true });

    container.addEventListener('mousemove', onMouseMove, { passive: true });
    container.addEventListener('mouseleave', onMouseLeave, { passive: true });

    // 4. Main Render Loop
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Color lerp
      currentHue += (targetHue - currentHue) * 0.08;

      // Mouse position smoothing
      if (mouse.targetX > -1000) {
        mouse.x += (mouse.targetX - mouse.x) * 0.16;
        mouse.y += (mouse.targetY - mouse.y) * 0.16;
      } else {
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;
      }

      mouse.auraPulse += dt * 2.5;

      ctx.clearRect(0, 0, width, height);

      const interactionRadius = width < 768 ? 130 : 160;
      const isInteractionActive = mouse.x > -500 && mouse.y > -500;

      // Draw Aura Glow under pointer / finger
      if (isInteractionActive) {
        const auraRadius = (width < 768 ? 75 : 95) + Math.sin(mouse.auraPulse) * 8;
        const auraGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, auraRadius);
        auraGrad.addColorStop(0, `hsla(${currentHue}, 85%, 65%, ${isDark ? 0.22 : 0.18})`);
        auraGrad.addColorStop(0.5, `hsla(${currentHue + 15}, 80%, 60%, ${isDark ? 0.08 : 0.06})`);
        auraGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        // Delicate Central Core Ring
        ctx.strokeStyle = `hsla(${currentHue}, 90%, 65%, ${isDark ? 0.45 : 0.35})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 14 + Math.sin(mouse.auraPulse * 1.5) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Update & Render Grid Nodes
      const activeNodes: EndNode[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.update(mouse.x, mouse.y, interactionRadius);

        const distToMouse = isInteractionActive ? Math.hypot(mouse.x - node.x, mouse.y - node.y) : 999;
        const isNear = distToMouse < interactionRadius;

        if (isNear) {
          activeNodes.push(node);
        }

        // Draw Crosshair Node (+)
        const crossSize = (node.depth === 1.0 ? 3.5 : 2.5);
        let alpha = isDark ? 0.12 : 0.09;
        let strokeColor = isDark ? 'rgba(148, 163, 184, ' : 'rgba(71, 85, 105, ';

        if (isNear) {
          const proximityFactor = 1 - distToMouse / interactionRadius;
          alpha = (isDark ? 0.25 : 0.2) + proximityFactor * 0.6;
          ctx.strokeStyle = `hsla(${currentHue}, 80%, ${isDark ? '68%' : '48%'}, ${alpha})`;
          ctx.lineWidth = 1.2;
        } else {
          ctx.strokeStyle = `${strokeColor}${alpha})`;
          ctx.lineWidth = 0.8;
        }

        ctx.beginPath();
        ctx.moveTo(node.x - crossSize, node.y);
        ctx.lineTo(node.x + crossSize, node.y);
        ctx.moveTo(node.x, node.y - crossSize);
        ctx.lineTo(node.x, node.y + crossSize);
        ctx.stroke();
      }

      // Draw Synapse Lines between nearby active nodes
      if (activeNodes.length > 1) {
        ctx.lineWidth = 0.9;
        for (let i = 0; i < activeNodes.length; i++) {
          for (let j = i + 1; j < activeNodes.length; j++) {
            const na = activeNodes[i];
            const nb = activeNodes[j];
            const d = Math.hypot(na.x - nb.x, na.y - nb.y);

            if (d < 54) {
              const lineAlpha = (1 - d / 54) * 0.35;
              ctx.strokeStyle = `hsla(${currentHue}, 85%, 62%, ${lineAlpha})`;
              ctx.beginPath();
              ctx.moveTo(na.x, na.y);
              ctx.lineTo(nb.x, nb.y);
              ctx.stroke();
            }
          }
        }
      }

      // 5. Orbiting & Blooming Brand Symbols
      const symbolOrbitRadius = width < 768 ? 68 : 96;

      for (let sIdx = 0; sIdx < symbols.length; sIdx++) {
        const sym = symbols[sIdx];

        if (isInteractionActive) {
          sym.targetScale = 1;
          sym.currentAngle += 0.007;

          const targetSymX = mouse.x + Math.cos(sym.currentAngle) * symbolOrbitRadius;
          const targetSymY = mouse.y + Math.sin(sym.currentAngle) * symbolOrbitRadius;

          sym.x += (targetSymX - sym.x) * 0.18;
          sym.y += (targetSymY - sym.y) * 0.18;
        } else {
          sym.targetScale = 0;
          sym.x += (sym.x - mouse.x) * 0.05;
        }

        // Spring scale animation
        sym.scale += (sym.targetScale - sym.scale) * 0.14;

        if (sym.scale > 0.02) {
          ctx.save();
          ctx.translate(sym.x, sym.y);
          ctx.scale(sym.scale, sym.scale);

          // Subtle connection synapse from center
          ctx.strokeStyle = `hsla(${currentHue}, 85%, 65%, 0.22)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo((mouse.x - sym.x) * 0.4, (mouse.y - sym.y) * 0.4);
          ctx.stroke();

          // Glassmorphic Badge Pill
          const pillW = 86;
          const pillH = 26;
          const r = 13;

          ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.94)';
          ctx.strokeStyle = `hsla(${currentHue}, 80%, 60%, 0.45)`;
          ctx.lineWidth = 1.2;

          ctx.beginPath();
          if (typeof (ctx as any).roundRect === 'function') {
            (ctx as any).roundRect(-pillW / 2, -pillH / 2, pillW, pillH, r);
          } else {
            ctx.rect(-pillW / 2, -pillH / 2, pillW, pillH);
          }
          ctx.fill();
          ctx.stroke();

          // Icon and Text
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(sym.icon, -pillW / 2 + 7, 1);

          ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
          ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
          ctx.fillText(sym.badge, -pillW / 2 + 24, 0);

          ctx.restore();
        }
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    // Pause when page is hidden to save battery
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
      className={`hero-canvas-container absolute inset-0 w-full h-full overflow-hidden select-none touch-pan-y ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none block"
      />
    </div>
  );
}
