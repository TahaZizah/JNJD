// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import * as Icons from './icons';
import { IconBolt, IconBrief, IconCircuit, IconCode, IconCrown, IconHandshake, IconTarget, IconUsers } from './icons';
import { cn, Reveal } from './utils';

// Rules section + About section (agentic theme + organizer context)

function SectionHeader({ eyebrow, title, kicker, align = 'left' }) {
  return (
    <div className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <div className="t-eyebrow mb-5 flex items-center gap-3">
        <span className="w-6 h-px bg-gold-500/70"></span>
        <span>{eyebrow}</span>
      </div>
      <h2 className="t-display text-4xl md:text-6xl lg:text-7xl text-bone-100 mb-5" style={{ textWrap: 'balance' }}>
        {title}
      </h2>
      {kicker && <p className="text-lg text-bone-100/70 leading-relaxed" style={{ textWrap: 'pretty' }}>{kicker}</p>}
    </div>
  );
}

function About() {
  return (
    <section className="relative py-28 md:py-36">
      <div className="mx-auto max-w-[1400px]" style={{ paddingLeft: 'var(--container-padding)', paddingRight: 'var(--container-padding)' }}>
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionHeader
                eyebrow="// The Theme"
                title={<>The <span className="gold-text">Agentic</span> Shift.</>}
                kicker="Building systems that think, act, and adapt. This edition traces the quiet revolution moving software from tools we operate to agents that operate for us."
              />
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <Reveal delay={120}>
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { icon: IconCircuit, t: 'LLM Orchestration', d: 'Multi-model pipelines, tool use, memory systems, and evaluation at scale.' },
                  { icon: IconBolt, t: 'Autonomous Reasoning', d: 'Planning, reflection, and chain-of-thought under real-world constraints.' },
                  { icon: IconTarget, t: 'Algorithmic Rigor', d: 'A live contest where correctness, complexity, and clarity still decide winners.' },
                  { icon: IconHandshake, t: 'Industry Crossing', d: 'Students meet the engineering leaders who will recruit them next quarter.' },
                ].map((f, i) => (
                  <div key={i} className="glass rounded-2xl p-6 lift">
                    <div className="w-10 h-10 grid place-items-center rounded-xl hair-b text-gold-400 mb-4">
                      <f.icon size={18} />
                    </div>
                    <div className="t-display text-xl text-bone-100 mb-2">{f.t}</div>
                    <p className="text-sm text-bone-100/65 leading-relaxed">{f.d}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Rules() {
  return (
    <section id="rules" className="relative py-28 md:py-36 border-t border-gold-500/10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
          <Reveal>
            <SectionHeader
              eyebrow="// The Contest"
              title={<>Rules of <span className="gold-text">engagement</span>.</>}
              kicker="Three per team. One contest. Official and unofficial brackets run in parallel, judged on the same problems."
            />
          </Reveal>
          <Reveal delay={100}>
            <div className="glass-gold rounded-2xl px-6 py-4">
              <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-400 mb-1">Registration Fee</div>
              <div className="flex items-baseline gap-2">
                <span className="t-display text-4xl gold-text">180</span>
                <span className="t-mono text-sm text-bone-100/70">MAD · per team</span>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Core rule card */}
          <Reveal delay={60} className="lg:col-span-4">
            <div className="glass rounded-2xl p-8 h-full lift">
              <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-6">Rule 01</div>
              <div className="t-display text-[88px] gold-text mb-2" style={{ lineHeight: 0.85 }}>3</div>
              <div className="t-display text-2xl text-bone-100 mb-3">Developers per team.</div>
              <p className="text-sm text-bone-100/65 leading-relaxed">
                Exactly three — no more, no less. Each member must be an active student; captains manage
                the roster and the submission.
              </p>
              <div className="mt-6 flex items-center gap-2">
                {[0,1,2].map(i => (
                  <div key={i} className="flex-1 hair-b rounded-lg p-3 flex items-center gap-2">
                    <Icons.IconUser size={14} className="text-gold-400" />
                    <span className="t-mono text-[10px] text-bone-100/60 uppercase tracking-widest">Seat {i+1}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Official */}
          <Reveal delay={140} className="lg:col-span-4">
            <div className="relative rounded-2xl p-8 h-full tier-featured">
              <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-400 mb-6">Rule 02 · A</div>
              <div className="flex items-center gap-3 mb-3">
                <Icons.IconShield size={28} className="text-gold-300" />
                <div className="t-display text-3xl text-bone-100">Official teams</div>
              </div>
              <p className="text-sm text-bone-100/75 leading-relaxed mb-5">
                Open to all engineering, scientific and preparatory schools operating on Moroccan soil.
                Eligible for the national title, cash prizes, and the travelling JNJD trophy.
              </p>
              <ul className="space-y-2.5">
                {[
                  'Moroccan academic institution',
                  'All members currently enrolled students',
                  'Team has not won JNJD 3 times prior',
                  'Same-school OR mixed-institution rosters',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-bone-100/80">
                    <span className="mt-0.5 text-gold-400"><Icons.IconCheck size={14} /></span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Unofficial */}
          <Reveal delay={220} className="lg:col-span-4">
            <div className="glass rounded-2xl p-8 h-full lift">
              <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-6">Rule 02 · B</div>
              <div className="flex items-center gap-3 mb-3">
                <Icons.IconGlobe size={28} className="text-mist-400" />
                <div className="t-display text-3xl text-bone-100">Unofficial teams</div>
              </div>
              <p className="text-sm text-bone-100/70 leading-relaxed mb-5">
                Reserved for international schools and teams who have already claimed three JNJD titles.
                They compete for honour, ranking, and the unofficial podium.
              </p>
              <ul className="space-y-2.5">
                {[
                  { ok: true,  t: 'International academic institutions' },
                  { ok: true,  t: 'Three-time JNJD champions' },
                  { ok: false, t: 'Eligible for the national trophy' },
                  { ok: false, t: 'Eligible for the MAD cash prize pool' },
                ].map((it, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-bone-100/75">
                    <span className={`mt-0.5 ${it.ok ? 'text-gold-400' : 'text-red-300/70'}`}>
                      {it.ok ? <Icons.IconCheck size={14} /> : <Icons.IconX size={14} />}
                    </span>
                    <span className={it.ok ? '' : 'text-bone-100/50 line-through decoration-bone-100/30'}>{it.t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Timeline strip */}
          <Reveal delay={80} className="lg:col-span-12">
            <div className="glass rounded-2xl p-2 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-mist-400/10 rounded-xl overflow-hidden">
                {[
                  { step: '01', t: 'Register team', d: 'Until 05 May 2026', icon: IconUsers },
                  { step: '02', t: 'Pay fee (180 MAD)', d: 'Bank transfer or on-site', icon: IconBrief },
                  { step: '03', t: 'Finals @ INPT',   d: '16 May · Rabat',  icon: IconCrown },
                ].map((s, i) => (
                  <div key={i} className="bg-ink-900/90 p-6 flex flex-col items-center justify-center text-center gap-2">
                    <div className="t-display text-3xl gold-text mb-1">{s.step}</div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center justify-center gap-2 t-mono text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-1">
                        <s.icon size={12} /> {s.t}
                      </div>
                      <div className="text-sm text-bone-100/80">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Rules, About, SectionHeader });

export { SectionHeader };

export { About };

export { Rules };
