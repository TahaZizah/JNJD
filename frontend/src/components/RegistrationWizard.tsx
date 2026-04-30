import { useState, useEffect, useCallback } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRightIcon, ChevronLeftIcon, SendIcon, AlertCircleIcon,
  BriefcaseIcon, ShieldCheckIcon, UsersIcon, ClipboardListIcon,
} from 'lucide-react'

import { registrationSchema } from '../schemas/registration'
import type { RegistrationFormValues } from '../schemas/registration'
import { submitRegistration } from '../api/registration'
import StepIndicator from './StepIndicator'
import MemberFieldGroup from './MemberFieldGroup'
import FileUploadZone from './FileUploadZone'
import { FormInput } from './FormFields'
import ReviewSummary from './ReviewSummary'

const STEPS = [
  { number: 1, label: 'Basic Details',      icon: UsersIcon },
  { number: 2, label: 'Competition Status', icon: ShieldCheckIcon },
  { number: 3, label: 'Recruitment',        icon: BriefcaseIcon },
  { number: 4, label: 'Review',             icon: ClipboardListIcon },
]

const ROLE_LABELS = ['Team Captain', 'Second Member', 'Third Member']
const ROLE_COLORS = ['var(--gold)', 'var(--muted)', 'var(--text-muted)']

const DEFAULT_MEMBER = {
  fullName: '', email: '', phone: '',
  tshirtSize: '' as any, tshirtSizeCustom: '',
  schoolName: '', proofFileKey: '', cvFileKey: '',
}

function StepHeader({ icon: Icon, title, subtitle }: {
  icon: React.ElementType; title: string; subtitle: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.75rem' }}>
      <div style={{
        width: 42, height: 42, borderRadius: 'var(--radius-md)', flexShrink: 0,
        background: 'rgba(200,168,75,0.1)', border: '1px solid rgba(200,168,75,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} style={{ color: 'var(--gold)' }} />
      </div>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.2rem' }}>{title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>{subtitle}</p>
      </div>
    </div>
  )
}

export default function RegistrationWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})

  const STORAGE_KEY = 'jnjd_registration_wizard'

  const methods = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      teamName: '', isOfficial: false, description: '',
      members: [{ ...DEFAULT_MEMBER }, { ...DEFAULT_MEMBER }, { ...DEFAULT_MEMBER }],
    },
    mode: 'onChange',
  })

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.values) methods.reset(parsed.values)
        if (typeof parsed.step === 'number') setStep(parsed.step)
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save to localStorage on changes
  const saveToStorage = useCallback(() => {
    try {
      const values = methods.getValues()
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ values, step }))
    } catch {}
  }, [methods, step])

  useEffect(() => {
    saveToStorage()
  }, [step, saveToStorage])

  // Also save on every field change
  useEffect(() => {
    const subscription = methods.watch(() => saveToStorage())
    return () => subscription.unsubscribe()
  }, [methods, saveToStorage])

  const { watch, handleSubmit, setValue, trigger } = methods
  const isOfficial = watch('isOfficial')
  const members = watch('members')

  const mutation = useMutation({
    mutationFn: submitRegistration,
    onSuccess: (data) => {
      localStorage.removeItem(STORAGE_KEY)
      navigate(`/confirmation/${data.id}`)
    },
  })

  const handleNext = async () => {
    let valid = false
    if (step === 1) {
      valid = await trigger(['teamName', 'members'])
    } else if (step === 2) {
      if (isOfficial && members.some((m) => !m.proofFileKey)) {
        setUploadErrors(prev => ({ ...prev, _proof: '1' }))
        return
      }
      valid = true
    } else if (step === 3) {
      // CVs are mandatory for all members
      if (members.some((m) => !m.cvFileKey)) {
        setUploadErrors(prev => ({ ...prev, _cv: '1' }))
        return
      }
      valid = true
    } else {
      valid = true
    }
    if (valid) { setUploadErrors({}); setStep(s => s + 1) }
  }

  const handleBack = () => { setUploadErrors({}); setStep(s => s - 1) }

  const getApiError = () => {
    const err = mutation.error as any
    if (!err) return null
    const details = err?.response?.data?.details
    if (Array.isArray(details)) return details.map((d: any) => d.message).join(', ')
    return err?.response?.data?.error || 'Submission failed. Please try again.'
  }

  return (
    <div className="glass" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', maxWidth: 780, margin: '0 auto' }}>
      <StepIndicator steps={STEPS} current={step} />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(d => mutation.mutate(d as any))} noValidate>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="animate-fade-in-scale">
              <StepHeader icon={UsersIcon} title="Basic Details" subtitle="Tell us about your team and all 3 members." />
              <div style={{ marginBottom: '1.25rem' }}>
                <FormInput name="teamName" control={methods.control as any} label="Team Name" placeholder="e.g. Lambda Squad" required />
              </div>
              <div className="field" style={{ marginBottom: '1.5rem' }}>
                <label className="field-label">Description <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', fontSize: '0.75rem' }}>(optional)</span></label>
                <textarea {...methods.register('description')} placeholder="Brief description of your game concept..." className="textarea" rows={3} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[0, 1, 2].map(i => <MemberFieldGroup key={i} index={i} showSchool />)}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="animate-fade-in-scale">
              <StepHeader icon={ShieldCheckIcon} title="Competition Status" subtitle="Official teams must upload proof of enrollment for each member." />

              {/* Toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1.25rem',
                padding: '1.25rem 1.5rem', marginBottom: '1.75rem',
                background: isOfficial ? 'rgba(200,168,75,0.07)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isOfficial ? 'rgba(200,168,75,0.35)' : 'var(--dim)'}`,
                borderRadius: 'var(--radius-lg)', transition: 'all 0.3s ease',
              }}>
                <label className="toggle" style={{ margin: 0 }}>
                  <input type="checkbox" checked={isOfficial} onChange={e => setValue('isOfficial', e.target.checked)} id="is-official-toggle" />
                  <div className="toggle-track" /><div className="toggle-thumb" />
                </label>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem', fontFamily: 'var(--font-display)' }}>
                    We are an official team&nbsp;
                    {isOfficial && <span className="badge badge-official" style={{ verticalAlign: 'middle' }}>Official</span>}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    All 3 members must upload proof of scholarship / enrollment (PDF or image).
                  </p>
                </div>
              </div>

              {isOfficial && (
                <div className="animate-fade-in-scale">
                  {uploadErrors._proof && (
                    <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                      <AlertCircleIcon size={16} style={{ flexShrink: 0 }} />
                      All 3 members must upload their proof of enrollment before proceeding.
                    </div>
                  )}
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      background: 'var(--bg-2)', border: '1px solid var(--dim)',
                      borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ROLE_COLORS[i] }} />
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>{ROLE_LABELS[i]}</p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{members[i].fullName || `Member ${i + 1}`}</p>
                        </div>
                      </div>
                      <div className="field">
                        <label className="field-label">Proof of Enrollment <span style={{ color: 'var(--gold)' }}>*</span></label>
                        <FileUploadZone
                          uploadId={`proof-${i}`} memberIndex={i}
                          memberName={members[i].fullName || `Member ${i + 1}`}
                          value={members[i].proofFileKey}
                          onChange={key => { setValue(`members.${i}.proofFileKey` as any, key); setUploadErrors(p => { const n = { ...p }; delete n._proof; return n }) }}
                          onError={msg => setUploadErrors(p => ({ ...p, [`proof_${i}`]: msg }))}
                        />
                        {uploadErrors[`proof_${i}`] && <span className="field-error">{uploadErrors[`proof_${i}`]}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isOfficial && (
                <div style={{
                  background: 'rgba(200,168,75,0.05)', border: '1px solid rgba(200,168,75,0.15)',
                  borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem',
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '1.1rem' }}>ℹ️</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    No documents required — registering as an <strong style={{ color: 'var(--text-primary)' }}>unofficial team</strong>. You can still participate fully.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="animate-fade-in-scale">
              <StepHeader icon={BriefcaseIcon} title="Career & Recruitment" subtitle="Upload CVs for all team members." />
              <div style={{
                background: 'linear-gradient(135deg, rgba(200,168,75,0.1) 0%, rgba(200,168,75,0.04) 100%)',
                border: '1px solid rgba(200,168,75,0.22)', borderRadius: 'var(--radius-lg)',
                padding: '1.5rem', marginBottom: '2rem',
              }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  🚀 Get noticed by our sponsor companies!
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  Upload your CV to share it with recruiters at the event stands. All team members must upload their CV.
                </p>
              </div>

              {uploadErrors._cv && (
                <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                  <AlertCircleIcon size={16} style={{ flexShrink: 0 }} />
                  All 3 members must upload their CV before proceeding.
                </div>
              )}

              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  background: 'var(--bg-2)', border: '1px solid var(--dim)',
                  borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: ROLE_COLORS[i] }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>{ROLE_LABELS[i]}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{members[i].fullName || `Member ${i + 1}`}</p>
                    </div>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase',
                      letterSpacing: '0.6px', background: 'rgba(200,168,75,0.08)',
                      padding: '0.15rem 0.55rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(200,168,75,0.2)',
                    }}>Required</span>
                  </div>
                  <div className="field">
                    <label className="field-label">CV / Résumé <span style={{ color: 'var(--gold)' }}>*</span></label>
                    <FileUploadZone
                      uploadId={`cv-${i}`} memberIndex={i}
                      memberName={members[i].fullName || `Member ${i + 1}`}
                      accept=".pdf,.doc,.docx" acceptLabel="PDF, DOC, DOCX — max 5 MB"
                      placeholder="Click to upload CV or drag & drop"
                      value={members[i].cvFileKey}
                      onChange={key => { setValue(`members.${i}.cvFileKey` as any, key); setUploadErrors(p => { const n = { ...p }; delete n._cv; return n }) }}
                      onError={msg => setUploadErrors(p => ({ ...p, [`cv_${i}`]: msg }))}
                    />
                    {uploadErrors[`cv_${i}`] && <span className="field-error">{uploadErrors[`cv_${i}`]}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="animate-fade-in-scale">
              <StepHeader icon={ClipboardListIcon} title="Review Your Registration" subtitle="Verify all details before submitting." />
              <ReviewSummary values={methods.getValues()} />
              {getApiError() && (
                <div className="alert alert-error" style={{ marginTop: '1.25rem' }}>
                  <AlertCircleIcon size={16} style={{ flexShrink: 0 }} />
                  {getApiError()}
                </div>
              )}
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.25rem', gap: '1rem' }}>
            {step > 1
              ? <button type="button" className="btn btn-ghost" onClick={handleBack}><ChevronLeftIcon size={16} /> Back</button>
              : <div />
            }
            {step === 4
              ? (
                <button type="submit" className="btn btn-primary btn-lg" disabled={mutation.isPending} id="submit-registration">
                  {mutation.isPending ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Submitting…</> : <><SendIcon size={16} /> Submit Registration</>}
                </button>
              ) : (
                <button type="button" className="btn btn-primary btn-lg" onClick={handleNext} id={`next-step-${step}`}>
                  Continue <ChevronRightIcon size={16} />
                </button>
              )
            }
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
