// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import * as Icons from './icons';
import { cn } from './utils';

function Footer({ setRoute }) {
  return (
    <footer className="relative border-t border-gold-500/15 bg-ink-950">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-20">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="t-display text-5xl md:text-6xl text-bone-100 mb-4" style={{ textWrap: 'balance' }}>
              JNJD <span className="gold-text">2026</span>.
            </div>
            <div className="t-mono text-[11px] uppercase tracking-[0.3em] text-bone-100/50 mb-6">
              Twentieth edition · Agentic Shift
            </div>
            <p className="text-bone-100/60 max-w-md leading-relaxed">
              An event by the Club Informatique &amp; Télécom, hosted at INPT Rabat. Built for the
              students who will write the next layer of the stack.
            </p>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <FooterCol title="Event" links={['Home', 'Rules', 'Register', 'Schedule']} onClick={setRoute} />
            <FooterCol title="Partners" links={['Brochure', 'Press kit']} onClick={setRoute} />
            <FooterCol title="Community" links={['CIT', 'INPT', 'LinkedIn', 'Instagram']} onClick={setRoute} />
          </div>
        </div>
        <div className="hr-gold my-12"></div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="t-mono text-[10px] uppercase tracking-[0.3em] text-bone-100/40">
            © 2026 CIT · INPT Rabat · All rights reserved
          </div>
          <div className="t-mono text-[10px] uppercase tracking-[0.3em] text-bone-100/40">
            Built in Morocco · Signed in gold
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <div className="t-mono text-[10px] uppercase tracking-[0.3em] text-gold-500 mb-4">{title}</div>
      <ul className="space-y-2.5">
        {links.map(l => (
          <li key={l}>
            <a className="text-bone-100/70 hover:text-gold-300 transition text-sm" href="#">{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

Object.assign(window, { Footer });

export { Footer };

export { FooterCol };
