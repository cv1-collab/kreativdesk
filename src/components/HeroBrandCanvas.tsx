import React, { useEffect, useRef } from 'react';

interface HeroBrandCanvasProps {
  className?: string;
  isDark?: boolean;
}

/**
 * Calm Swiss Architectural Spatial Blueprint Canvas
 * Features:
 * - Retina-sharp CAD blueprint grid with subtle metric crosshairs (+)
 * - Soft radial vignette and ambient corporate blue architectural glow
 * - Gentle, unobtrusive light gliding smoothly with user motion (no custom cursor, no spider lines)
 * - Ultra-smooth 60fps, battery-saving visibility handling & touch-action: pan-y
 */
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

    // Smooth cursor lighting state
    const light = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isActive: false
    };

    const gridSpacing = 40;

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
    };

    initCanvas();

    const resizeObserver = new ResizeObserver(() => {
      initCanvas();
    });
    resizeObserver.observe(container);

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      light.targetX = e.clientX - rect.left;
      light.targetY = e.clientY - rect.top;
      light.isActive = true;
    };

    const onMouseLeave = () => {
      light.targetX = -1000;
      light.targetY = -1000;
      light.isActive = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        light.targetX = touch.clientX - rect.left;
        light.targetY = touch.clientY - rect.top;
        light.isActive = true;
      }
    };

    const onTouchEnd = () => {
      light.targetX = -1000;
      light.targetY = -1000;
      light.isActive = false;
    };

    container.addEventListener('mousemove', onMouseMove, { passive: true });
    container.addEventListener('mouseleave', onMouseLeave, { passive: true });
    container.addEventListener('touchstart', onTouchMove, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchEnd, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth interpolation for subtle ambient lighting
      if (light.targetX > -500) {
        light.x += (light.targetX - light.x) * 0.08;
        light.y += (light.targetY - light.y) * 0.08;
      } else {
        light.x += (light.targetX - light.x) * 0.04;
        light.y += (light.targetY - light.y) * 0.04;
      }

      const centerX = width / 2;
      const centerY = height * 0.42;

      // 1. Central Ambient Blueprint Glow (Architecture Studio lighting)
      const ambientGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.min(width * 0.55, 480)
      );
      ambientGrad.addColorStop(0, isDark ? 'rgba(37, 99, 235, 0.12)' : 'rgba(37, 99, 235, 0.07)');
      ambientGrad.addColorStop(0.5, isDark ? 'rgba(56, 189, 248, 0.04)' : 'rgba(56, 189, 248, 0.02)');
      ambientGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = ambientGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.min(width * 0.55, 480), 0, Math.PI * 2);
      ctx.fill();

      // 2. Subtle Gliding Light under Cursor (Very soft, non-intrusive)
      if (light.x > -200 && light.y > -200) {
        const cursorGrad = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, 140);
        cursorGrad.addColorStop(0, isDark ? 'rgba(59, 130, 246, 0.10)' : 'rgba(37, 99, 235, 0.06)');
        cursorGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = cursorGrad;
        ctx.beginPath();
        ctx.arc(light.x, light.y, 140, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Precision CAD Blueprint Crosshairs (+) & Grid Matrix
      ctx.lineWidth = 0.75;

      const baseAlpha = isDark ? 0.13 : 0.09;
      const crossSize = 2.5;

      for (let x = gridSpacing / 2; x < width; x += gridSpacing) {
        for (let y = gridSpacing / 2; y < height; y += gridSpacing) {
          // Calculate radial falloff from center (vignette effect)
          const distToCenter = Math.hypot(x - centerX, y - centerY);
          const maxDim = Math.max(width, height) * 0.65;
          const radialVignette = Math.max(0, 1 - distToCenter / maxDim);

          if (radialVignette <= 0.05) continue;

          // Subtle interaction brightness if cursor is nearby
          const distToLight = Math.hypot(x - light.x, y - light.y);
          const proximity = distToLight < 120 ? (1 - distToLight / 120) * 0.25 : 0;

          const totalAlpha = (baseAlpha * radialVignette + proximity);

          ctx.strokeStyle = isDark
            ? `rgba(148, 163, 184, ${totalAlpha.toFixed(3)})`
            : `rgba(71, 85, 105, ${totalAlpha.toFixed(3)})`;

          // Draw fine crosshair at intersection
          ctx.beginPath();
          ctx.moveTo(x - crossSize, y);
          ctx.lineTo(x + crossSize, y);
          ctx.moveTo(x, y - crossSize);
          ctx.lineTo(x, y + crossSize);
          ctx.stroke();
        }
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrameId);
      } else {
        animFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelAnimationFrame(animFrameId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      resizeObserver.disconnect();

      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('touchstart', onTouchMove);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
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
