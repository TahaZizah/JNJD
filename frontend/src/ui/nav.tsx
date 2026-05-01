// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import * as Icons from './icons';
import { cn, Magnetic } from './utils';

// Top navigation — glassmorphic, gold accents, with mobile hamburger menu

function Nav({ route, setRoute }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [pastHero, setPastHero] = React.useState(false);
  const [pastCta, setPastCta] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 16);
      setPastHero(window.scrollY > window.innerHeight * 0.85);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  // Track when the hero register button scrolls out of view
  React.useEffect(() => {
    const el = document.getElementById('hero-cta');
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setPastCta(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => { setMobileOpen(false); }, [route]);

  // Trap scroll when mobile menu is open
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const link = (id, label) => (
    <button
      onClick={() => { setRoute(id); setMobileOpen(false); }}
      className={`relative t-mono text-[11px] tracking-[0.2em] uppercase px-3 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70 rounded ${route === id ? 'text-gold-300' : 'text-bone-100/70 hover:text-bone-100'}`}
    >
      {label}
      {route === id && (
        <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-gold-500/80" />
      )}
    </button>
  );

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-6'}`}>
        <div className="mx-auto max-w-[1400px]" style={{ paddingLeft: 'var(--container-padding)', paddingRight: 'var(--container-padding)' }}>
          <div className={`flex items-center justify-between rounded-full px-4 lg:px-6 py-3 transition-all ${scrolled ? 'glass' : ''}`}>
            {/* Logo */}
            <button onClick={() => setRoute('home')} className="flex items-center gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70 rounded-full px-2">
              <img src="/assets/Logo BW 2.png" alt="JNJD Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" width={40} height={40} />
            </button>

            {/* Desktop center — scroll-triggered event title */}
            <div className="hidden md:flex items-center justify-center flex-1 min-w-0 overflow-hidden">
              <span
                className={`t-mono text-[10px] tracking-[0.25em] text-bone-100/60 uppercase whitespace-nowrap transition-all duration-500 ${pastCta ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
              >
                Journée Nationale des Jeunes Développeurs
              </span>
            </div>

            {/* Right CTA */}
            <div className="flex items-center gap-3">
              <div className={`hidden lg:flex items-center gap-2 transition-all duration-300 ${pastCta ? 'pr-2 border-r border-mist-400/15' : ''}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 dot-live" aria-hidden="true" />
                <span className="t-mono text-[10px] tracking-[0.25em] text-bone-100/60 uppercase">May 16 · INPT Rabat</span>
              </div>
              <div className={`hidden md:block transition-all duration-300 ${pastCta ? 'opacity-100 translate-y-0 max-w-[200px]' : 'opacity-0 translate-y-1 pointer-events-none max-w-0 overflow-hidden'}`}>
                <Magnetic>
                  <button onClick={() => setRoute('home#register')} className="btn-primary text-sm py-3 px-5">
                    Register <Icons.IconArrow size={14} />
                  </button>
                </Magnetic>
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(v => !v)}
                className="md:hidden w-10 h-10 flex items-center justify-center text-bone-100/70 hover:text-gold-300 transition rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen
                  ? <Icons.IconX size={20} />
                  : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <rect y="3" width="20" height="2" rx="1" fill="currentColor"/>
                      <rect y="9" width="14" height="2" rx="1" fill="currentColor"/>
                      <rect y="15" width="20" height="2" rx="1" fill="currentColor"/>
                    </svg>
                  )
                }
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" />
        </div>
      )}
      <div
        className={`fixed top-0 inset-x-0 z-40 md:hidden transition-all duration-300 ${mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        <div className="glass border-b border-gold-500/15 pt-24 pb-8" style={{ paddingLeft: 'var(--container-padding)', paddingRight: 'var(--container-padding)' }}>
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            <div className="py-3 px-2">
              <h2 className="t-display gold-text text-lg" style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Journée Nationale des Jeunes Développeurs
              </h2>
            </div>
          </nav>
          <div className="mt-6">
            <button
              onClick={() => { setRoute('home#register'); setMobileOpen(false); }}
              className="btn-primary w-full justify-center"
            >
              Register a team <Icons.IconArrow size={14} />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 dot-live" aria-hidden="true" />
            <span className="t-mono text-[10px] tracking-[0.25em] text-bone-100 opacity-60 uppercase">May 16 · INPT Rabat</span>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { Nav });

export { Nav };
