// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import * as Icons from './icons';
import { cn } from './utils';

// Animated "agentic" background — constellation of nodes + drifting aurora

function AgenticField({ density = 42 }) {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, dpr;
    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Nodes: simulate a mesh of autonomous agents
    const nodes = Array.from({ length: density }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.4 + 0.4,
      hub: Math.random() < 0.12, // a few "hub" agents — gold
    }));

    let mouseX = -9999, mouseY = -9999;
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouseX = e.clientX - r.left; mouseY = e.clientY - r.top;
    };
    const onLeave = () => { mouseX = -9999; mouseY = -9999; };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    let raf;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);

      // links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 160) {
            const alpha = (1 - d / 160) * 0.22;
            ctx.strokeStyle = a.hub || b.hub
              ? `rgba(201, 168, 76, ${alpha * 0.9})`
              : `rgba(140, 174, 222, ${alpha * 0.55})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        // mouse attraction
        const dx = mouseX - n.x, dy = mouseY - n.y;
        const d = Math.hypot(dx, dy);
        if (d < 180) {
          n.vx += (dx / d) * 0.004;
          n.vy += (dy / d) * 0.004;
        }
        n.x += n.vx; n.y += n.vy;
        // damping
        n.vx *= 0.995; n.vy *= 0.995;
        // wrap
        if (n.x < -20) n.x = W + 20; if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20; if (n.y > H + 20) n.y = -20;

        ctx.beginPath();
        if (n.hub) {
          // gold glow
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 8);
          g.addColorStop(0, 'rgba(232, 201, 106, 0.9)');
          g.addColorStop(1, 'rgba(232, 201, 106, 0)');
          ctx.fillStyle = g;
          ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.fillStyle = '#f4e9b8';
          ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(140, 174, 222, 0.75)';
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [density]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 agentic-field" />
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="aurora" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'auto' }} />
      <div className="absolute inset-0 noise" />
      {/* vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(2,6,17,0.7) 100%)'
      }} />
    </div>
  );
}

Object.assign(window, { AgenticField });

export { AgenticField };
