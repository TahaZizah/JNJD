// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import * as Icons from './icons';
import { cn, useCountdown, EVENT_DATE, pad, Reveal, Magnetic } from './utils';
import { AgenticField } from './background';
import { motion, AnimatePresence } from 'framer-motion';

// Hero — massive display type, countdown, agentic background, orbit motif

function CountdownDigit({ label, value }) {
  const paddedValue = pad(value);
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ perspective: 800 }}>
        {/* Invisible spacer to maintain layout size */}
        {/* Fluid min-width: scales from ~64px on mobile to 90px on desktop */}
        <div className="glass rounded-xl px-4 md:px-5 py-3 md:py-4 invisible flex items-center justify-center" style={{ minWidth: 'clamp(4rem, 8vw, 5.625rem)' }}>
          <div className="t-display tabular-nums text-center" style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}>
            00
          </div>
        </div>
        
        <AnimatePresence mode="popLayout">
          <motion.div
            key={paddedValue}
            initial={{ rotateX: -90, opacity: 0, y: -20, scale: 0.95 }}
            animate={{ rotateX: 0, opacity: 1, y: 0, scale: 1 }}
            exit={{ rotateX: 90, opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
            className="absolute inset-0 glass rounded-xl flex items-center justify-center overflow-hidden"
            style={{ transformOrigin: 'center center' }}
          >
            <div className="t-display gold-text tabular-nums text-center" style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}>
              {paddedValue}
            </div>
            {/* The split line should be part of the card so it flips with it! */}
            <div className="absolute inset-x-0 top-1/2 h-[2px] bg-ink-950/80 z-10 shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
          </motion.div>
        </AnimatePresence>
      </div>
      <span className="mt-3 t-mono text-[10px] tracking-[0.3em] text-bone-100/50 uppercase">{label}</span>
    </div>
  );
}

function Hero() {
  const { d, h, m, s } = useCountdown(EVENT_DATE);

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
      <AgenticField density={46} />

      {/* decorative orbit rings */}
      <div className="absolute -right-[12%] top-[22%] w-[620px] h-[620px] orbit opacity-60 pointer-events-none" />
      <div className="absolute -right-[6%] top-[30%] w-[440px] h-[440px] orbit opacity-40 pointer-events-none" style={{ animationDirection: 'reverse', animationDuration: '48s' }} />

      <div className="relative mx-auto max-w-[1400px] pt-40 pb-24 lg:pt-48 lg:pb-32" style={{ paddingLeft: 'var(--container-padding)', paddingRight: 'var(--container-padding)' }}>
        {/* top strip */}
        <Reveal>
          <div className="flex items-center gap-4 mb-10">
            <span className="t-mono text-[10px] tracking-[0.35em] text-gold-500 uppercase">// Edition 20</span>
            <span className="hr-gold flex-1 max-w-[180px]"></span>
            <span className="t-mono text-[10px] tracking-[0.3em] text-bone-100/50 uppercase">National · INPT · Rabat</span>
          </div>
        </Reveal>

        {/* Title block */}
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <Reveal delay={80}>
              {/* Fluid hero type: 2.5rem on mobile → 8.125rem on large desktop, never causes horizontal scroll */}
              <h1 className="t-display" style={{ fontSize: 'clamp(2.5rem, 8vw, 8.125rem)' }}>
                <span className="block text-bone-100">JOURNÉE</span>
                <span className="block text-bone-100/95">NATIONALE <span className="shimmer-text">des</span></span>
                <span className="block">
                  <span className="gold-text">JEUNES</span>
                  <span className="text-bone-100/90"> DÉVelopeurs</span>
                </span>
              </h1>
            </Reveal>
          </div>
          <div className="lg:col-span-4 lg:pb-6">
            <Reveal delay={220}>
              <div className="t-mono text-[11px] tracking-[0.3em] text-gold-500 uppercase mb-4">The Agentic Shift</div>
              <p className="text-lg md:text-xl text-bone-100/75 leading-relaxed" style={{ textWrap: 'pretty' }}>
                Twenty years of Morocco's most rigorous student programming contest.
                This edition: building systems that <em className="text-gold-300 not-italic">think, act, and adapt</em>.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Meta row */}
        <Reveal delay={320}>
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 hair-bottom pb-8">
            <MetaItem label="Date" value="16 May 2026" sub="Saturday · 09:00 GMT+1" />
            <MetaItem label="Venue" value="INPT Rabat" sub="Madinat Al Irfane" />
            <MetaItem label="Participants" value="500+" sub="30+ institutions" />
            <MetaItem label="Organiser" value="CIT" sub="Club Informatique & Télécom" />
          </div>
        </Reveal>

        {/* Countdown + CTAs */}
        <div className="mt-14 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <Reveal delay={120}>
              <div className="flex items-end gap-3 md:gap-4 flex-wrap">
                <CountdownDigit label="Days" value={d} />
                <span className="t-display text-gold-600/60 pb-7" style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}>:</span>
                <CountdownDigit label="Hours" value={h} />
                <span className="t-display text-gold-600/60 pb-7" style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}>:</span>
                <CountdownDigit label="Minutes" value={m} />
                <span className="t-display text-gold-600/60 pb-7" style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}>:</span>
                <CountdownDigit label="Seconds" value={s} />
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={220}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-3">
                  <Magnetic>
                    <a href="#register" className="btn-primary">
                      Register a team <Icons.IconArrow size={16} />
                    </a>
                  </Magnetic>
                  <Magnetic>
                    <a href="#rules" className="btn-ghost">
                      Read the rules
                    </a>
                  </Magnetic>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex -space-x-2">
                    {['#c9a84c', '#8caede', '#112b55'].map((c, i) => (
                      <span key={i} className="w-7 h-7 rounded-full border border-ink-950" style={{ background: c, opacity: 0.9 - i * 0.1 }}></span>
                    ))}
                  </div>
                  <span className="t-mono text-[11px] tracking-[0.2em] uppercase text-bone-100/60">
                    312 teams · 936 developers registered
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-8 flex flex-col items-center gap-2 opacity-70 hidden md:flex">
          <span className="t-mono text-[10px] tracking-[0.3em] uppercase text-bone-100/50">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-gold-500/60 to-transparent" />
        </div>
      </div>

      {/* Thematic ticker */}
      <div className="relative border-y border-gold-500/15 bg-ink-900/40 backdrop-blur-sm">
        <div className="overflow-hidden">
          <div className="flex gap-10 marquee-track whitespace-nowrap py-5" style={{ width: 'max-content' }}>
            {[...Array(2)].map((_, i) => (
              <React.Fragment key={i}>
                <TickItem text="LLM ORCHESTRATION" />
                <TickItem text="AUTONOMOUS SYSTEMS" dot />
                <TickItem text="ALGORITHMIC CHALLENGE" />
                <TickItem text="EXPERT CONFERENCES" dot />
                <TickItem text="CORPORATE RECRUITING" />
                <TickItem text="AGENT-NATIVE ARCHITECTURE" dot />
                <TickItem text="NATIONAL FINALS" />
                <TickItem text="INPT · RABAT" dot />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}

function MetaItem({ label, value, sub }) {
  return (
    <div>
      <div className="t-mono text-[10px] tracking-[0.3em] text-gold-500/90 uppercase mb-2">{label}</div>
      <div className="t-display text-2xl md:text-3xl text-bone-100">{value}</div>
      <div className="t-mono text-[11px] text-mist-400/70 mt-1">{sub}</div>
    </div>
  );
}

function TickItem({ text, dot }) {
  return (
    <div className="flex items-center gap-6 t-mono text-[11px] tracking-[0.35em] uppercase text-bone-100/60">
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-gold-500/80"></span>}
      {!dot && <span className="text-gold-500/80">◆</span>}
      <span>{text}</span>
    </div>
  );
}

Object.assign(window, { Hero });

export { CountdownDigit };

export { Hero };

export { MetaItem };

export { TickItem };
