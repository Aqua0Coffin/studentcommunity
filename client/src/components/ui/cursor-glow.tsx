'use client';

import { useEffect, useRef, useState } from 'react';

export default function CursorGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsDesktop(!isTouch && window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Palette mimicking the Antigravity colors
    const colors = ['#facc15', '#fb923c', '#f43f5e', '#a855f7', '#3b82f6'];

    class TrailParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      life: number;
      decay: number;
      length: number;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        
        // Explosion velocity outward
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 0.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.color = color;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.015; // lifetime duration
        this.length = Math.random() * 5 + 3; // dashed line style
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Add minimal gravity / drift if desired, but straight drift is fine
        this.vx *= 0.98; // slow down slightly over time
        this.vy *= 0.98;
        
        this.life -= this.decay;
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (this.life <= 0) return;
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        
        // Short lines pointed in their moving direction
        const velAngle = Math.atan2(this.vy, this.vx);
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
          this.x + Math.cos(velAngle) * this.length, 
          this.y + Math.sin(velAngle) * this.length
        );
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    const particles: TrailParticle[] = [];

    // Helper to spawn a few particles at mouse position
    const emitParticles = (x: number, y: number) => {
      const count = Math.floor(Math.random() * 3) + 2; // Spawn 2 to 4 per move
      for (let i = 0; i < count; i++) {
        // Random color from palette
        const color = colors[Math.floor(Math.random() * colors.length)];
        // Slight spread from absolute mouse center
        const spawnX = x + (Math.random() - 0.5) * 10;
        const spawnY = y + (Math.random() - 0.5) * 10;
        
        particles.push(new TrailParticle(spawnX, spawnY, color));
      }
    };

    const mouse = { x: -1000, y: -1000 };
    let isMoving = false;
    let timeout: NodeJS.Timeout;

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      isMoving = true;
      
      emitParticles(mouse.x, mouse.y);

      if (glowRef.current) {
        // Maintain the ambient mouse glow
        glowRef.current.style.background = `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, rgba(120, 100, 255, 0.1), transparent 70%)`;
        glowRef.current.style.opacity = '1';
      }

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        isMoving = false;
      }, 100); // Stop emitting quickly after mouse stops
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', onResize);

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Loop backward to safely remove dead particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        
        // Remove dead
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }
      
      // Cleanup global alpha
      ctx.globalAlpha = 1;

      // Softly fade out ambient glow when cursor stops completely
      if (!isMoving && glowRef.current) {
        glowRef.current.style.opacity = parseFloat(glowRef.current.style.opacity || '1') > 0 ? 
          (parseFloat(glowRef.current.style.opacity) - 0.02).toString() : '0';
      }

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationId);
      clearTimeout(timeout);
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ opacity: 0.95 }}
      />
      <div
        ref={glowRef}
        className="pointer-events-none fixed inset-0 z-[1] transition-opacity duration-300"
      />
    </>
  );
}
