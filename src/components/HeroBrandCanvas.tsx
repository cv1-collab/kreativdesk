import React, { useEffect, useRef } from 'react';

interface HeroBrandCanvasProps {
  className?: string;
  isDark?: boolean;
}

/**
 * EndNode: Grid unit with spring tension, damping, and elastic repulsion physics.
 */
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

    // Interaction displacement: pushes nodes elastically away from finger/pointer
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

    const heroZone = (container.closest('.hero-zone') as HTMLElement) ||
      (document.querySelector('.hero-zone') as HTMLElement) ||
      container;

    let animFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: EndNode[] = [];
    let currentSpacing = 36;

    // Mouse & Touch interaction state
    const mouse = {
      x: -2000,
      y: -2000,
      targetX: -2000,
      targetY: -2000,
      auraPulse: 0
    };

    let currentHue = 195;
    let targetHue = 195;

    // 1. Retina-Scharfe Canvas-Initialisierung für iPhone & iPad
    function initCanvas() {
      dpr = window.devicePixelRatio || 1;

      width = heroZone.clientWidth;
      height = heroZone.clientHeight;

      if (width === 0 || height === 0) return;

      // Interne Auflösung für Retina hochskalieren
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Raster-Dichte mobil optimieren (auf kleinen Screens etwas luftiger)
      const isMobile = width < 768;
      currentSpacing = isMobile ? 42 : 36;

      nodes = [];
      let i = 0;
      for (let x = currentSpacing / 2; x < width; x += currentSpacing) {
        let j = 0;
        for (let y = currentSpacing / 2; y < height; y += currentSpacing) {
          const depth = ((i + j) % 3 === 0) ? 0.75 : 1.0;
          nodes.push(new EndNode(x, y, depth, i, j));
          j++;
        }
        i++;
      }
    }

    initCanvas();

    const resizeObserver = new ResizeObserver(() => {
      initCanvas();
    });
    resizeObserver.observe(heroZone);

    // 2. Touch-Interaktion für iPad / iPhone
    function handleTouch(e: TouchEvent) {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = heroZone.getBoundingClientRect();

        mouse.targetX = touch.clientX - rect.left;
        mouse.targetY = touch.clientY - rect.top;

        // Sanfte Farbmodulation beim Streichen über das Display
        targetHue = 185 + (touch.clientX / Math.max(window.innerWidth, 1)) * 85;
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      handleTouch(e);
    };

    const onTouchMove = (e: TouchEvent) => {
      handleTouch(e);
    };

    const onTouchEnd = () => {
      // Beim Loslassen federn die Synapsen geschmeidig zurück
      mouse.targetX = -2000;
      mouse.targetY = -2000;
    };

    // Desktop Mouse Handlers
    const onMouseMove = (e: MouseEvent) => {
      const rect = heroZone.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;

      targetHue = 185 + (e.clientX / Math.max(window.innerWidth, 1)) * 85;
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

    // 3. Ultra-Smooth 60/120fps Render Loop
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Smooth Hue Transition
      currentHue += (targetHue - currentHue) * 0.1;

      // Mouse / Touch Follow Interpolation
      if (mouse.targetX > -1000) {
        mouse.x += (mouse.targetX - mouse.x) * 0.26;
        mouse.y += (mouse.targetY - mouse.y) * 0.26;
      } else {
        mouse.x += (mouse.targetX - mouse.x) * 0.10;
        mouse.y += (mouse.targetY - mouse.y) * 0.10;
      }

      mouse.auraPulse += dt * 3.0;

      ctx.clearRect(0, 0, width, height);

      const isMobile = width < 768;
      const interactionRadius = isMobile ? 120 : 155;
      const isInteractionActive = mouse.x > -500 && mouse.y > -500;

      // A. Ambient Architectural Depth Lighting
      const centerX = width / 2;
      const centerY = height * 0.44;
      const ambientGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.min(width * 0.55, 480)
      );
      ambientGrad.addColorStop(0, isDark ? 'rgba(37, 99, 235, 0.11)' : 'rgba(37, 99, 235, 0.07)');
      ambientGrad.addColorStop(0.5, isDark ? 'rgba(56, 189, 248, 0.03)' : 'rgba(56, 189, 248, 0.02)');
      ambientGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = ambientGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.min(width * 0.55, 480), 0, Math.PI * 2);
      ctx.fill();

      // B. Synaptic Field Aura directly under Finger / Pointer
      if (isInteractionActive) {
        const auraRadius = (isMobile ? 80 : 105) + Math.sin(mouse.auraPulse) * 6;
        const auraGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, auraRadius);
        auraGrad.addColorStop(0, `hsla(${currentHue}, 85%, 65%, ${isDark ? 0.20 : 0.16})`);
        auraGrad.addColorStop(0.5, `hsla(${currentHue + 15}, 80%, 60%, ${isDark ? 0.07 : 0.05})`);
        auraGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        // Delicate Core Synapse Ring
        ctx.strokeStyle = `hsla(${currentHue}, 90%, 65%, ${isDark ? 0.40 : 0.30})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 14 + Math.sin(mouse.auraPulse * 1.5) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // C. Update & Collect Active Nodes
      const activeNodes: { node: EndNode; dist: number; prox: number }[] = [];

      for (let idx = 0; idx < nodes.length; idx++) {
        const node = nodes[idx];
        node.update(mouse.x, mouse.y, interactionRadius);

        const distToMouse = isInteractionActive ? Math.hypot(mouse.x - node.x, mouse.y - node.y) : 999;
        const isNear = distToMouse < interactionRadius;

        if (isNear) {
          activeNodes.push({
            node,
            dist: distToMouse,
            prox: 1 - distToMouse / interactionRadius
          });

          // Filament ray from touch center to nearby node
          if (distToMouse < interactionRadius * 0.70) {
            const filamentAlpha = (1 - distToMouse / (interactionRadius * 0.70)) * (isDark ? 0.32 : 0.22);
            ctx.strokeStyle = `hsla(${currentHue}, 90%, 65%, ${filamentAlpha})`;
            ctx.lineWidth = 0.85;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(node.x, node.y);
            ctx.stroke();
          }
        }

        // Render Retina Crosshairs (+)
        const crossSize = node.depth === 1.0 ? 3.5 : 2.5;
        let alpha = isDark ? 0.12 : 0.08;
        const strokeColor = isDark ? 'rgba(148, 163, 184, ' : 'rgba(71, 85, 105, ';

        if (isNear) {
          const prox = 1 - distToMouse / interactionRadius;
          alpha = (isDark ? 0.25 : 0.18) + prox * 0.65;
          ctx.strokeStyle = `hsla(${currentHue}, 80%, ${isDark ? '68%' : '46%'}, ${alpha})`;
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

      // D. Draw Synaptic Connection Lines between Neighboring Active Nodes
      if (activeNodes.length > 1) {
        const maxSynapseDist = currentSpacing * 1.55;
        ctx.lineWidth = 0.95;

        for (let a = 0; a < activeNodes.length; a++) {
          for (let b = a + 1; b < activeNodes.length; b++) {
            const itemA = activeNodes[a];
            const itemB = activeNodes[b];
            const d = Math.hypot(itemA.node.x - itemB.node.x, itemA.node.y - itemB.node.y);

            if (d < maxSynapseDist) {
              const avgProx = (itemA.prox + itemB.prox) * 0.5;
              const lineAlpha = (1 - d / maxSynapseDist) * (0.12 + avgProx * 0.48);

              ctx.strokeStyle = `hsla(${currentHue}, 85%, ${isDark ? '66%' : '46%'}, ${lineAlpha})`;
              ctx.beginPath();
              ctx.moveTo(itemA.node.x, itemA.node.y);
              ctx.lineTo(itemB.node.x, itemB.node.y);
              ctx.stroke();
            }
          }
        }
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
