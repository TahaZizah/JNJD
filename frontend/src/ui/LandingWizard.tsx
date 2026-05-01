import React, { useState, useRef, useEffect } from 'react';
import * as Icons from './icons';
import { cn } from './utils';
import { submitRegistration, getPresignedUrl, uploadFileToMinIO } from '../api/registration';
import { useNavigate } from 'react-router-dom';
import { sanitizePhone, isValidEmail } from '../schemas/registration';

const WIZARD_STEPS = [
  { id: 'team',    label: 'Team',     sub: 'Identity & category' },
  { id: 'members', label: 'Members',  sub: 'Three developers' },
  { id: 'docs',    label: 'Docs',     sub: 'Student IDs & CVs' },
  { id: 'review',  label: 'Review',   sub: 'Confirm & submit' },
];

export function Field({ label, value, onChange, type = 'text', placeholder, error }: any) {
  const [focused, setFocused] = useState(false);
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
        <div className="t-mono text-[10px] uppercase tracking-widest text-red-400 mt-1.5 pl-1">
          {error}
        </div>
      )}
    </div>
  );
}

export function Select({ label, value, onChange, options, error }: any) {
  const has = value && value.length > 0;
  return (
    <div className={`field ${has ? 'has-value' : ''}`}>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled></option>
        {options.map((o: string) => <option key={o} value={o} className="bg-ink-900">{o}</option>)}
      </select>
      <label>{label}</label>
      {error && (
        <div className="t-mono text-[10px] uppercase tracking-widest text-red-400 mt-1.5 pl-1">
          {error}
        </div>
      )}
    </div>
  );
}

export function FileDrop({ label, value, onChange, hint = 'PNG, JPG or PDF · max 5MB', accept = 'image/*,application/pdf', fileType = 'proof' }: any) {
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setFileName(file.name);
    setError('');
    try {
      const presign = await getPresignedUrl(file.name, file.type, fileType);
      await uploadFileToMinIO(presign.uploadUrl, file, (pct) => setProgress(pct));
      onChange({ key: presign.objectKey, name: file.name, size: file.size });
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="t-mono text-[10px] tracking-[0.25em] uppercase text-bone-100/55 mb-2">{label}</div>
      <div
        className={`dz ${value ? 'filled' : ''} ${drag ? 'filled' : ''} ${error ? 'border-red-400' : ''}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files?.[0]); }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="spinner w-6 h-6 text-gold-400"></div>
            <div className="t-mono text-[10px] text-bone-100/50 uppercase">{progress}%</div>
          </div>
        ) : value ? (
          <div className="flex items-center justify-center gap-3">
            <Icons.IconFile size={18} className="text-gold-400" />
            <span className="text-sm text-bone-100/90 t-mono">{value.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onChange(null); setFileName(''); }}
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
            <div className="t-mono text-[10px] uppercase tracking-widest text-bone-100/40">{error || hint}</div>
          </div>
        )}
        <input ref={inputRef} type="file" hidden accept={accept} onChange={(e) => onFile(e.target.files?.[0] as File)} />
      </div>
    </div>
  );
}

export function StepIndicator({ step, onJump }: any) {
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

const STORAGE_KEY = 'jnjd_landing_wizard';

export function Wizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    team: { name: '', category: '', school: '', city: '' },
    members: [
      { name: '', email: '', year: '', role: 'Captain', phone: '', tshirtSize: '' },
      { name: '', email: '', year: '', role: 'Member', phone: '', tshirtSize: '' },
      { name: '', email: '', year: '', role: 'Member', phone: '', tshirtSize: '' },
    ],
    docs: { id1: null, id2: null, id3: null, cv1: null, cv2: null, cv3: null },
    agree: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.data) setData(parsed.data);
        if (typeof parsed.step === 'number') setStep(parsed.step);
      }
    } catch {}
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step }));
    } catch {}
  }, [data, step]);

  const updateTeam = (k: string, v: string) => setData(d => ({ ...d, team: { ...d.team, [k]: v } }));
  const updateMember = (i: number, k: string, v: string) => setData(d => ({
    ...d,
    members: d.members.map((m, idx) => idx === i ? { ...m, [k]: v } : m)
  }));
  const updateDoc = (k: string, v: any) => setData(d => ({ ...d, docs: { ...d.docs, [k]: v } }));

  const isOfficial = data.team.category.includes('Official');

  // Live validation helpers
  const validateMembers = () => {
    const errors: Record<string, string> = {};
    const emails: string[] = [];
    const phones: string[] = [];
    data.members.forEach((m, i) => {
      if (m.email && !isValidEmail(m.email)) {
        errors[`member_${i}_email`] = 'Invalid email (must contain @ and a dot)';
      }
      if (m.phone && m.phone.length > 0 && m.phone.length < 10) {
        errors[`member_${i}_phone`] = 'Phone must be 10 digits';
      }
      if (m.phone && m.phone.length > 0 && !/^0[67]/.test(m.phone)) {
        errors[`member_${i}_phone`] = 'Phone must start with 06 or 07';
      }
      if (m.email) {
        const lower = m.email.toLowerCase().trim();
        if (emails.includes(lower)) {
          errors[`member_${i}_email`] = 'Each member must have a unique email';
        }
        emails.push(lower);
      }
      if (m.phone && m.phone.length === 10) {
        if (phones.includes(m.phone)) {
          errors[`member_${i}_phone`] = 'Each member must have a unique phone number';
        }
        phones.push(m.phone);
      }
    });
    return errors;
  };

  // Update field errors live as members change
  useEffect(() => {
    if (step === 1) {
      setFieldErrors(validateMembers());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.members, step]);

  const canNext = (() => {
    if (step === 0) return data.team.name && data.team.category && data.team.school;
    if (step === 1) {
      const memberErrors = validateMembers();
      const hasFieldErrors = Object.keys(memberErrors).length > 0;
      return data.members.every(m => m.name && m.email && m.phone && m.phone.length === 10 && m.tshirtSize) && !hasFieldErrors;
    }
    if (step === 2) {
      const cvsMissing = !data.docs.cv1 || !data.docs.cv2 || !data.docs.cv3;
      if (cvsMissing) return false;
      if (isOfficial) return data.docs.id1 && data.docs.id2 && data.docs.id3;
      return true;
    }
    if (step === 3) return data.agree;
    return true;
  })();

  const doSubmit = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        teamName: data.team.name,
        isOfficial: isOfficial,
        description: data.team.city ? `City: ${data.team.city}` : '',
        members: data.members.map((m, i) => ({
          fullName: m.name,
          email: m.email,
          phone: m.phone,
          tshirtSize: m.tshirtSize,
          tshirtSizeCustom: '',
          schoolName: data.team.school,
          proofFileKey: (data.docs as any)[`id${i+1}`]?.key || '',
          cvFileKey: (data.docs as any)[`cv${i+1}`]?.key || '',
        }))
      };
      
      const res = await submitRegistration(payload as any);
      localStorage.removeItem(STORAGE_KEY);
      navigate(`/confirmation/${res.id}`);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const go = (delta: number) => {
    if (delta > 0 && step === 3) {
      doSubmit();
      return;
    }
    setStep(s => Math.max(0, Math.min(WIZARD_STEPS.length - 1, s + delta)));
  };

  return (
    <section id="register" className="relative py-28 md:py-36 border-t border-gold-500/10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-10%] top-[20%] w-[540px] h-[540px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.12), transparent 60%)' }} />
      </div>
      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <div className="t-mono text-[10px] uppercase tracking-[0.3em] text-gold-500 mb-4">// Registration</div>
            <h2 className="t-display text-5xl md:text-6xl mb-6">Claim your <span className="gold-text">seat</span>.</h2>
            <p className="text-lg text-bone-100/75 leading-relaxed">
              Four steps. Twelve fields. We'll confirm within 24 hours.
            </p>
            <div className="mt-8 glass rounded-2xl p-5 hair-b">
              <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-3">What you'll need</div>
              <ul className="space-y-2 text-sm text-bone-100/75">
                <li className="flex items-center gap-2"><Icons.IconCheck size={12} className="text-gold-400" /> Team name & category</li>
                <li className="flex items-center gap-2"><Icons.IconCheck size={12} className="text-gold-400" /> 3 members (name, email, size)</li>
                <li className="flex items-center gap-2"><Icons.IconCheck size={12} className="text-gold-400" /> Scanned student IDs (PDF/JPG)</li>
                <li className="flex items-center gap-2"><Icons.IconCheck size={12} className="text-gold-400" /> ~6 minutes</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
              <StepIndicator step={step} onJump={setStep} />
              <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-bone-100/50">
                Step {step + 1} / {WIZARD_STEPS.length} · {WIZARD_STEPS[step].sub}
              </div>
            </div>

            <div className="glass rounded-3xl p-8 md:p-10 min-h-[520px] relative overflow-hidden">
              <div key={step} style={{ animation: 'fadeSlide 500ms cubic-bezier(.2,.7,.2,1)' }}>
                {step === 0 && <StepTeam data={data.team} update={updateTeam} />}
                {step === 1 && <StepMembers members={data.members} update={updateMember} fieldErrors={fieldErrors} />}
                {step === 2 && <StepDocs docs={data.docs} update={updateDoc} members={data.members} isOfficial={isOfficial} />}
                {step === 3 && <StepReview data={data} setAgree={(v: boolean) => setData(d => ({ ...d, agree: v }))} errorMsg={errorMsg} />}
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
                disabled={step === 0 || submitting}
                className={`btn-ghost ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
              >
                <Icons.IconArrow size={14} style={{ transform: 'rotate(180deg)' }} /> Back
              </button>
              <button
                onClick={() => go(1)}
                disabled={!canNext || submitting}
                className={`btn-primary ${!canNext ? 'opacity-40 pointer-events-none' : ''}`}
              >
                {submitting ? 'Submitting...' : step === WIZARD_STEPS.length - 1 ? 'Submit registration' : 'Continue'} <Icons.IconArrow size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepTeam({ data, update }: any) {
  return (
    <div>
      <div className="mb-8">
        <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-2">01 · Identity</div>
        <h3 className="t-display text-3xl md:text-4xl text-bone-100">Name your team.</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <Field label="Team name" value={data.name} onChange={(v: string) => update('name', v)} placeholder="e.g. Sequential Dreams" />
        </div>
        <Select
          label="Category"
          value={data.category}
          onChange={(v: string) => update('category', v)}
          options={['Official · Moroccan institution', 'Unofficial · International', 'Unofficial · 3× JNJD champions']}
        />
        <Field label="School / Institution" value={data.school} onChange={(v: string) => update('school', v)} placeholder="INPT, ENSIAS, EMI…" />
        <div className="md:col-span-2">
          <Field label="City" value={data.city} onChange={(v: string) => update('city', v)} placeholder="Rabat" />
        </div>
      </div>
    </div>
  );
}

function StepMembers({ members, update, fieldErrors }: any) {
  return (
    <div>
      <div className="mb-8">
        <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-2">02 · Roster</div>
        <h3 className="t-display text-3xl md:text-4xl text-bone-100">Three developers.</h3>
        <p className="text-bone-100/60 mt-2">The captain receives all communication and manages the submission.</p>
      </div>
      <div className="space-y-4">
        {members.map((m: any, i: number) => (
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
              <Field label="Full name" value={m.name} onChange={(v: string) => update(i, 'name', v)} />
              <Field label="Email" type="email" value={m.email}
                onChange={(v: string) => update(i, 'email', v)}
                error={fieldErrors[`member_${i}_email`]}
              />
              <Field label="Phone (06XXXXXXXX)" value={m.phone}
                onChange={(v: string) => {
                  const sanitized = sanitizePhone(v);
                  update(i, 'phone', sanitized);
                }}
                error={fieldErrors[`member_${i}_phone`]}
              />
              <Select label="T-Shirt Size"
                value={m.tshirtSize}
                onChange={(v: string) => update(i, 'tshirtSize', v)}
                options={['S', 'M', 'L', 'XL', 'XXL']}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepDocs({ docs, update, members, isOfficial }: any) {
  return (
    <div>
      <div className="mb-8">
        <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-2">03 · Documents</div>
        <h3 className="t-display text-3xl md:text-4xl text-bone-100">{isOfficial ? "Prove enrollment." : "Upload your CVs."}</h3>
        <p className="text-bone-100/60 mt-2">
          {isOfficial 
            ? "We verify each ID against your school's registrar. You must also upload CVs for all members."
            : "No student IDs required for unofficial teams. All members must upload their CV."}
        </p>
      </div>
      
      {isOfficial && (
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <FileDrop label={`ID · ${members[0].name || 'M1'}`} value={docs.id1} onChange={(v: any) => update('id1', v)} />
          <FileDrop label={`ID · ${members[1].name || 'M2'}`} value={docs.id2} onChange={(v: any) => update('id2', v)} />
          <FileDrop label={`ID · ${members[2].name || 'M3'}`} value={docs.id3} onChange={(v: any) => update('id3', v)} />
        </div>
      )}
      
      <div className="grid md:grid-cols-3 gap-5">
        <FileDrop label={`CV · ${members[0].name || 'M1'}`} value={docs.cv1} accept=".pdf,.doc,.docx" hint="PDF/DOCX" onChange={(v: any) => update('cv1', v)} fileType="cv" />
        <FileDrop label={`CV · ${members[1].name || 'M2'}`} value={docs.cv2} accept=".pdf,.doc,.docx" hint="PDF/DOCX" onChange={(v: any) => update('cv2', v)} fileType="cv" />
        <FileDrop label={`CV · ${members[2].name || 'M3'}`} value={docs.cv3} accept=".pdf,.doc,.docx" hint="PDF/DOCX" onChange={(v: any) => update('cv3', v)} fileType="cv" />
      </div>
    </div>
  );
}

function StepReview({ data, setAgree, errorMsg }: any) {
  const Row = ({ k, v }: any) => (
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
          {data.members.map((m: any, i: number) => (
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

      {errorMsg && (
        <div className="mt-4 p-4 border border-red-500/50 bg-red-500/10 rounded-lg text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

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
