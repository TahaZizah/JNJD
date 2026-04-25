// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import * as Icons from './icons';
import { cn, Reveal } from './utils';

// Multi-step registration wizard — team → members → uploads → review

const WIZARD_STEPS = [
  { id: 'team',    label: 'Team',     sub: 'Identity & category' },
  { id: 'members', label: 'Members',  sub: 'Three developers' },
  { id: 'docs',    label: 'Docs',     sub: 'Student IDs' },
  { id: 'review',  label: 'Review',   sub: 'Confirm & submit' },
];

function Field({ label, value, onChange, type = 'text', placeholder, error }) {
  const [focused, setFocused] = React.useState(false);
  const has = focused || (value && value.length > 0);
  return (
    <div className={`field ${has ? 'has-value' : ''}`}>
      <input
        type={type}
        value={value || ''}
        placeholder={has ? placeholder : ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <label>{label}</label>
      {error && (
        <div className="t-mono text-[10px] uppercase tracking-widest text-red-300/90 mt-1.5 pl-1">
          {error}
        </div>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  const has = value && value.length > 0;
  return (
    <div className={`field ${has ? 'has-value' : ''}`}>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled></option>
        {options.map(o => <option key={o} value={o} className="bg-ink-900">{o}</option>)}
      </select>
      <label>{label}</label>
    </div>
  );
}

function FileDrop({ label, value, onChange, hint = 'PNG, JPG or PDF · max 5MB' }) {
  const [drag, setDrag] = React.useState(false);
  const inputRef = React.useRef(null);
  const onFile = (f) => { if (f) onChange({ name: f.name, size: f.size }); };
  return (
    <div>
      <div className="t-mono text-[10px] tracking-[0.25em] uppercase text-bone-100/55 mb-2">{label}</div>
      <div
        className={`dz ${value ? 'filled' : ''} ${drag ? 'filled' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files?.[0]); }}
      >
        {value ? (
          <div className="flex items-center justify-center gap-3">
            <Icons.IconFile size={18} className="text-gold-400" />
            <span className="text-sm text-bone-100/90 t-mono">{value.name}</span>
            <span className="t-mono text-[10px] text-bone-100/50 uppercase tracking-wider">
              {(value.size/1024/1024).toFixed(2)} MB
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="text-bone-100/50 hover:text-red-300 transition"
            ><Icons.IconX size={14} /></button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 grid place-items-center rounded-full hair-b text-gold-400">
              <Icons.IconUpload size={16} />
            </div>
            <div className="text-sm text-bone-100/80">
              <span className="text-gold-300">Click to upload</span> or drag and drop
            </div>
            <div className="t-mono text-[10px] uppercase tracking-widest text-bone-100/40">{hint}</div>
          </div>
        )}
        <input ref={inputRef} type="file" hidden accept="image/*,application/pdf" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
    </div>
  );
}

function StepIndicator({ step, onJump }) {
  return (
    <div className="glass rounded-full p-2 flex items-center gap-1">
      {WIZARD_STEPS.map((s, i) => {
        const done = i < step; const active = i === step;
        return (
          <React.Fragment key={s.id}>
            <button
              onClick={() => done && onJump(i)}
              className={`step-dot flex items-center gap-3 rounded-full px-4 py-2 transition ${
                active ? 'bg-gold-500/15 text-gold-300' :
                done ? 'text-bone-100/80 hover:bg-ink-700/50' : 'text-bone-100/35'
              }`}
            >
              <span className={`t-mono text-[10px] w-6 h-6 rounded-full grid place-items-center border transition ${
                active ? 'border-gold-400/60 bg-gold-500/10' :
                done ? 'border-gold-500/40 bg-gold-500/10' : 'border-mist-400/20'
              }`}>
                {done ? <Icons.IconCheck size={12} /> : <span>{String(i+1).padStart(2,'0')}</span>}
              </span>
              <span className="t-mono text-[11px] tracking-[0.2em] uppercase hidden md:block">{s.label}</span>
            </button>
            {i < WIZARD_STEPS.length - 1 && (
              <span className={`w-5 h-px ${done ? 'bg-gold-500/50' : 'bg-mist-400/15'}`}></span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Wizard() {
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState({
    team: { name: '', category: '', school: '', city: '' },
    members: [
      { name: '', email: '', year: '', role: 'Captain' },
      { name: '', email: '', year: '', role: 'Member' },
      { name: '', email: '', year: '', role: 'Member' },
    ],
    docs: { id1: null, id2: null, id3: null, payment: null },
    agree: false,
  });
  const [submitted, setSubmitted] = React.useState(false);
  const [dir, setDir] = React.useState(1);

  const updateTeam = (k, v) => setData(d => ({ ...d, team: { ...d.team, [k]: v } }));
  const updateMember = (i, k, v) => setData(d => ({
    ...d,
    members: d.members.map((m, idx) => idx === i ? { ...m, [k]: v } : m)
  }));
  const updateDoc = (k, v) => setData(d => ({ ...d, docs: { ...d.docs, [k]: v } }));

  const canNext = (() => {
    if (step === 0) return data.team.name && data.team.category && data.team.school;
    if (step === 1) return data.members.every(m => m.name && m.email);
    if (step === 2) return data.docs.id1 && data.docs.id2 && data.docs.id3;
    if (step === 3) return data.agree;
    return true;
  })();

  const go = (delta) => {
    if (delta > 0 && step === 3) { setSubmitted(true); return; }
    setDir(delta);
    setStep(s => Math.max(0, Math.min(WIZARD_STEPS.length - 1, s + delta)));
  };

  if (submitted) {
    return (
      <section id="register" className="relative py-28 md:py-36 border-t border-gold-500/10">
        <div className="relative mx-auto max-w-[1400px]" style={{ paddingLeft: 'var(--container-padding)', paddingRight: 'var(--container-padding)' }}>
          <div className="glass-gold rounded-3xl p-14 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full grid place-items-center mb-8" style={{
              background: 'radial-gradient(circle, rgba(201,168,76,0.3), transparent 70%)',
              border: '1px solid rgba(201,168,76,0.5)'
            }}>
              <Icons.IconCheck size={24} className="text-gold-300" />
            </div>
            <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-400 mb-4">// Confirmation sent</div>
            <h3 className="t-display text-5xl md:text-6xl mb-5"><span className="gold-text">Registered.</span></h3>
            <p className="text-lg text-bone-100/75 mb-8 leading-relaxed" style={{ textWrap: 'pretty' }}>
              Team <span className="text-gold-300 t-mono">{data.team.name || '—'}</span> is on the roster.
              We've sent payment instructions and contest details to the captain's email.
            </p>
            <button onClick={() => { setSubmitted(false); setStep(0); }} className="btn-ghost">
              Register another team <Icons.IconArrow size={14} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="register" className="relative py-28 md:py-36 border-t border-gold-500/10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-10%] top-[20%] w-[540px] h-[540px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.12), transparent 60%)' }} />
      </div>
      <div className="relative mx-auto max-w-[1400px]" style={{ paddingLeft: 'var(--container-padding)', paddingRight: 'var(--container-padding)' }}>
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <Reveal>
              <SectionHeader
                eyebrow="// Registration"
                title={<>Claim your <span className="gold-text">seat</span>.</>}
                kicker="Four steps. Twelve fields. Three document uploads. We'll confirm within 24 hours."
              />
              <div className="mt-8 glass rounded-2xl p-5 hair-b">
                <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-3">What you'll need</div>
                <ul className="space-y-2 text-sm text-bone-100/75">
                  <li className="flex items-center gap-2"><Icons.IconCheck size={12} className="text-gold-400" /> Team name & category</li>
                  <li className="flex items-center gap-2"><Icons.IconCheck size={12} className="text-gold-400" /> 3 members (name, email, year)</li>
                  <li className="flex items-center gap-2"><Icons.IconCheck size={12} className="text-gold-400" /> Scanned student IDs (PDF/JPG)</li>
                  <li className="flex items-center gap-2"><Icons.IconCheck size={12} className="text-gold-400" /> ~6 minutes</li>
                </ul>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <Reveal delay={120}>
              <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <StepIndicator step={step} onJump={setStep} />
                <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-bone-100/50">
                  Step {step + 1} / {WIZARD_STEPS.length} · {WIZARD_STEPS[step].sub}
                </div>
              </div>

              <div className="glass rounded-3xl p-8 md:p-10 min-h-[520px] relative overflow-hidden">
                <div key={step} style={{ animation: 'fadeSlide 500ms cubic-bezier(.2,.7,.2,1)' }}>
                  {step === 0 && <StepTeam data={data.team} update={updateTeam} />}
                  {step === 1 && <StepMembers members={data.members} update={updateMember} />}
                  {step === 2 && <StepDocs docs={data.docs} update={updateDoc} members={data.members} />}
                  {step === 3 && <StepReview data={data} setAgree={(v) => setData(d => ({ ...d, agree: v }))} />}
                </div>

                <style>{`
                  @keyframes fadeSlide {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                  }
                `}</style>
              </div>

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => go(-1)}
                  disabled={step === 0}
                  className={`btn-ghost ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                >
                  <Icons.IconArrow size={14} style={{ transform: 'rotate(180deg)' }} /> Back
                </button>
                <button
                  onClick={() => go(1)}
                  disabled={!canNext}
                  className={`btn-primary ${!canNext ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  {step === WIZARD_STEPS.length - 1 ? 'Submit registration' : 'Continue'} <Icons.IconArrow size={14} />
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepTeam({ data, update }) {
  return (
    <div>
      <div className="mb-8">
        <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-2">01 · Identity</div>
        <h3 className="t-display text-3xl md:text-4xl text-bone-100">Name your team.</h3>
        <p className="text-bone-100/60 mt-2">Pick something memorable — you'll wear it for the next six months.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <Field label="Team name" value={data.name} onChange={(v) => update('name', v)} placeholder="e.g. Sequential Dreams" />
        </div>
        <Select
          label="Category"
          value={data.category}
          onChange={(v) => update('category', v)}
          options={['Official · Moroccan institution', 'Unofficial · International', 'Unofficial · 3× JNJD champions']}
        />
        <Field label="School / Institution" value={data.school} onChange={(v) => update('school', v)} placeholder="INPT, ENSIAS, EMI…" />
        <div className="md:col-span-2">
          <Field label="City" value={data.city} onChange={(v) => update('city', v)} placeholder="Rabat" />
        </div>
      </div>
    </div>
  );
}

function StepMembers({ members, update }) {
  return (
    <div>
      <div className="mb-8">
        <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-2">02 · Roster</div>
        <h3 className="t-display text-3xl md:text-4xl text-bone-100">Three developers.</h3>
        <p className="text-bone-100/60 mt-2">The captain receives all communication and manages the submission.</p>
      </div>
      <div className="space-y-4">
        {members.map((m, i) => (
          <div key={i} className="hair-b rounded-2xl p-5 bg-ink-900/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full grid place-items-center hair-b text-gold-400 t-mono text-[11px]">
                  {String(i+1).padStart(2,'0')}
                </div>
                <div className="t-mono text-[11px] tracking-[0.25em] uppercase text-bone-100/70">
                  {m.role}
                </div>
              </div>
              {i === 0 && <span className="t-mono text-[10px] tracking-[0.25em] uppercase text-gold-500/90">primary contact</span>}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full name" value={m.name} onChange={(v) => update(i, 'name', v)} />
              <Field label="Email" type="email" value={m.email} onChange={(v) => update(i, 'email', v)} />
              <Select label="Academic year"
                value={m.year}
                onChange={(v) => update(i, 'year', v)}
                options={['1st cycle', '2nd cycle', '3rd cycle', 'Master', 'PhD']}
              />
              <Field label="Phone (optional)" value={m.phone} onChange={(v) => update(i, 'phone', v)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepDocs({ docs, update, members }) {
  return (
    <div>
      <div className="mb-8">
        <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-2">03 · Verification</div>
        <h3 className="t-display text-3xl md:text-4xl text-bone-100">Prove enrollment.</h3>
        <p className="text-bone-100/60 mt-2">We verify each ID against your school's registrar. Scans or crisp photos both work.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <FileDrop label={`Student ID · ${members[0].name || 'Member 1'}`} value={docs.id1} onChange={(v) => update('id1', v)} />
        <FileDrop label={`Student ID · ${members[1].name || 'Member 2'}`} value={docs.id2} onChange={(v) => update('id2', v)} />
        <FileDrop label={`Student ID · ${members[2].name || 'Member 3'}`} value={docs.id3} onChange={(v) => update('id3', v)} />
        <FileDrop label="Payment proof (optional)" value={docs.payment} onChange={(v) => update('payment', v)} hint="You can also pay on-site on May 10" />
      </div>
    </div>
  );
}

function StepReview({ data, setAgree }) {
  const Row = ({ k, v }) => (
    <div className="flex items-start justify-between py-3 hair-bottom">
      <div className="t-mono text-[10px] uppercase tracking-widest text-bone-100/50">{k}</div>
      <div className="text-sm text-bone-100/90 text-right max-w-[60%]">{v || <span className="text-bone-100/30">—</span>}</div>
    </div>
  );
  return (
    <div>
      <div className="mb-8">
        <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-2">04 · Confirm</div>
        <h3 className="t-display text-3xl md:text-4xl text-bone-100">Everything check out?</h3>
        <p className="text-bone-100/60 mt-2">One last look. We'll lock your registration once you submit.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="hair-b rounded-2xl p-5 bg-ink-900/40">
          <div className="t-mono text-[10px] uppercase tracking-widest text-gold-500 mb-3">Team</div>
          <Row k="Name" v={data.team.name} />
          <Row k="Category" v={data.team.category} />
          <Row k="School" v={data.team.school} />
          <Row k="City" v={data.team.city} />
        </div>
        <div className="hair-b rounded-2xl p-5 bg-ink-900/40">
          <div className="t-mono text-[10px] uppercase tracking-widest text-gold-500 mb-3">Members</div>
          {data.members.map((m, i) => (
            <div key={i} className="py-3 hair-bottom">
              <div className="flex items-center justify-between">
                <div className="text-sm text-bone-100/90">{m.name || `Member ${i+1}`}</div>
                <div className="t-mono text-[10px] uppercase tracking-widest text-bone-100/50">{m.role}</div>
              </div>
              <div className="t-mono text-[11px] text-mist-400/70 mt-1">{m.email}</div>
            </div>
          ))}
        </div>
      </div>

      <label className="mt-6 flex items-start gap-3 p-5 hair-b rounded-2xl bg-ink-900/40 cursor-pointer">
        <input
          type="checkbox"
          checked={!!data.agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-1 accent-yellow-600"
        />
        <span className="text-sm text-bone-100/75 leading-relaxed">
          I confirm that all information is accurate and that each team member is a currently enrolled student.
          I accept the JNJD Code of Conduct and contest rules.
        </span>
      </label>
    </div>
  );
}

Object.assign(window, { Wizard });

export { Field };

export { Select };

export { FileDrop };

export { StepIndicator };

export { Wizard };

export { StepTeam };

export { StepMembers };

export { StepDocs };

export { StepReview };
