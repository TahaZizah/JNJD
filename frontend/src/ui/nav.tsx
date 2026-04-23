// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import * as Icons from './icons';
import { cn, Magnetic } from './utils';

// Top navigation — glassmorphic, gold accents

function Nav({ route, setRoute }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const on = () => setScrolled(window.scrollY > 16);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const link = (id, label) => (
    <button
      onClick={() => setRoute(id)}
      className={`relative t-mono text-[11px] tracking-[0.2em] uppercase px-3 py-2 transition ${route === id ? 'text-gold-300' : 'text-bone-100/70 hover:text-bone-100'}`}
    >
      {label}
      {route === id && (
        <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-gold-500/80" />
      )}
    </button>
  );

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-6'}`}>
      <div className={`mx-auto max-w-[1400px] px-6 lg:px-10 ${scrolled ? 'opacity-100' : 'opacity-100'}`}>
        <div className={`flex items-center justify-between rounded-full px-4 lg:px-6 py-3 transition-all ${scrolled ? 'glass' : ''}`}>
          {/* Logos */}
          <button onClick={() => setRoute('home')} className="flex items-center gap-4 group">
            <img src="/assets/Logo BW 2.png" alt="JNJD Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
          </button>

          {/* Center links */}
          <nav className="hidden md:flex items-center gap-1">
            {link('home', 'Home')}
            {link('home#rules', 'Rules')}
            {link('home#register', 'Register')}
          </nav>

          {/* Right CTA */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 pr-2 border-r border-mist-400/15">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 dot-live"></span>
              <span className="t-mono text-[10px] tracking-[0.25em] text-bone-100/60 uppercase">May 16 · INPT Rabat</span>
            </div>
            <Magnetic>
              <button onClick={() => setRoute('home#register')} className="btn-primary text-sm py-3 px-5">
                Register <Icons.IconArrow size={14} />
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { Nav });

export { Nav };
