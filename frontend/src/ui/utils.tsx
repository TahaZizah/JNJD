// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Shared utilities + framer-motion shortcuts

const { useMotionValue, useTransform, useScroll, useSpring } = window.Motion || window.framerMotion || window['framer-motion'] || {};
// framer-motion UMD exposes as window.Motion in v11
window.M = window.Motion || window.framerMotion || window['framer-motion'];

const EVENT_DATE = new Date('2026-05-16T09:00:00+01:00');

function useCountdown(target) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { d, h, m, s };
}

function pad(n) { return String(n).padStart(2, '0'); }

// Simple in-view hook (no framer-motion dep needed)
function useInView(opts = { threshold: 0.12 }) {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Immediate viewport check — if already onscreen at mount, reveal without waiting
    const checkNow = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh * 0.95 && r.bottom > 0) {
        setInView(true);
        return true;
      }
      return false;
    };
    if (checkNow()) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect(); }
    }, opts);
    io.observe(el);
    // Safety net: re-check after layout settles
    const raf = requestAnimationFrame(() => { if (checkNow()) io.disconnect(); });
    const t = setTimeout(() => { if (checkNow()) io.disconnect(); }, 150);
    return () => { io.disconnect(); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);
  return [ref, inView];
}

// Reveal wrapper
function Reveal({ children, delay = 0, y = 24, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `opacity 700ms cubic-bezier(.2,.7,.2,1) ${delay}ms, transform 900ms cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Stagger children
function Stagger({ children, step = 80, className = '' }) {
  const kids = React.Children.toArray(children);
  return (
    <div className={className}>
      {kids.map((c, i) => <Reveal key={i} delay={i * step}>{c}</Reveal>)}
    </div>
  );
}

// Magnetic hover
function Magnetic({ children, strength = 18 }) {
  const ref = React.useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${(x / r.width) * strength}px, ${(y / r.height) * strength}px)`;
  };
  const onLeave = () => { const el = ref.current; if (el) el.style.transform = 'translate(0,0)'; };
  return (
    <span ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ display: 'inline-flex', transition: 'transform 220ms ease' }}>
      {children}
    </span>
  );
}

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export {  EVENT_DATE, useCountdown, pad, useInView, Reveal, Stagger, Magnetic  };
