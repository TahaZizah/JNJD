import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ChevronRightIcon, ChevronLeftIcon, SendIcon, AlertCircleIcon } from 'lucide-react'

import { registrationSchema, officialRegistrationSchema } from '../schemas/registration'
import type { RegistrationFormValues } from '../schemas/registration'
import { submitRegistration } from '../api/registration'
import StepIndicator from '../components/StepIndicator'
import MemberFieldGroup from '../components/MemberFieldGroup'
import FileUploadZone from '../components/FileUploadZone'
import { FormInput } from '../components/FormFields'
import ReviewSummary from '../components/ReviewSummary'

const STEPS = [
  { number: 1, label: 'Team & Members' },
  { number: 2, label: 'Official Proof' },
  { number: 3, label: 'Review' },
]

const DEFAULT_MEMBER = {
  fullName: '', email: '', phone: '',
  tshirtSize: '' as any, tshirtSizeCustom: '',
  schoolName: '', proofFileKey: '',
}

export default function RegistrationPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})

  const methods = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      teamName: '',
      isOfficial: false,
      description: '',
      members: [{ ...DEFAULT_MEMBER }, { ...DEFAULT_MEMBER }, { ...DEFAULT_MEMBER }],
    },
    mode: 'onBlur',
  })

  const { watch, handleSubmit, setValue, trigger, formState: { errors } } = methods
  const isOfficial = watch('isOfficial')
  const members = watch('members')

  const mutation = useMutation({
    mutationFn: submitRegistration,
    onSuccess: (data) => navigate(`/confirmation/${data.id}`),
  })

  const handleNext = async () => {
    let valid = false
    if (step === 1) {
      valid = await trigger(['teamName', 'members'])
    } else if (step === 2) {
      // Check all proofFileKeys filled
      const missingProof = members.some((m) => !m.proofFileKey)
      if (missingProof) {
        setUploadErrors(prev => ({ ...prev, _form: '1' }))
        return
      }
      valid = true
    }
    if (valid) setStep((s) => s + 1)
  }

  const handleBack = () => setStep((s) => s - 1)

  const onSubmit = (data: RegistrationFormValues) => {
    mutation.mutate(data as any)
  }

  const effectiveSteps = isOfficial ? STEPS : STEPS.filter(s => s.number !== 2).map((s, i) => ({ ...s, number: i + 1 }))
  const displayStep = isOfficial ? step : step === 3 ? 2 : step

  const getApiError = () => {
    const err = mutation.error as any
    if (!err) return null
    const details = err?.response?.data?.details
    if (Array.isArray(details)) return details.map((d: any) => d.message).join(', ')
    return err?.response?.data?.error || 'Submission failed. Please try again.'
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem 4rem' }}>
      {/* ── Hero Header ─────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: '100px', padding: '0.35rem 1rem', marginBottom: '1.25rem',
          fontSize: '0.78rem', fontWeight: 700, color: 'var(--indigo-400)',
          textTransform: 'uppercase', letterSpacing: '1px',
        }}>
          🏆 19th Edition
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 900, lineHeight: 1.1, marginBottom: '0.75rem',
          background: 'linear-gradient(135deg, #f1f5f9 0%, #818cf8 60%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          JNJD Registration
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 520, margin: '0 auto' }}>
          Journées Nationales de Jeux Développés — Register your team of 3 to compete.
        </p>
      </div>

      {/* ── Form Card ────────────────────────────────────────── */}
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="glass" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
          <StepIndicator
            steps={isOfficial ? STEPS : [
              { number: 1, label: 'Team & Members' },
              { number: 2, label: 'Review' },
            ]}
            current={isOfficial ? step : (step === 3 ? 2 : step === 2 ? 2 : 1)}
          />

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              {/* ── Step 1: Team Info + Members ──────────────── */}
              {step === 1 && (
                <div className="animate-fade-in-scale">
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Team Information
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Enter your team details and all 3 member profiles below.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <FormInput
                      name="teamName"
                      control={methods.control as any}
                      label="Team Name"
                      placeholder="e.g. CodeCraft"
                      required
                      className="col-span-2"
                    />
                  </div>

                  <div className="field" style={{ marginBottom: '1rem' }}>
                    <label className="field-label">Description <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', fontSize: '0.78rem' }}>(optional)</span></label>
                    <textarea
                      {...methods.register('description')}
                      placeholder="Brief description of your game concept..."
                      className="textarea"
                      rows={3}
                    />
                  </div>

                  {/* Official toggle */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.25rem',
                    background: isOfficial ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isOfficial ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)', marginBottom: '2rem',
                    transition: 'all 0.25s ease',
                  }}>
                    <label className="toggle" style={{ margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={isOfficial}
                        onChange={(e) => setValue('isOfficial', e.target.checked)}
                        id="is-official-toggle"
                      />
                      <div className="toggle-track" />
                      <div className="toggle-thumb" />
                    </label>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.15rem' }}>
                        Official Team {isOfficial && <span className="badge badge-official" style={{ verticalAlign: 'middle', marginLeft: '0.5rem' }}>Official</span>}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        All 3 members must provide school name + enrollment proof (PDF/image)
                      </p>
                    </div>
                  </div>

                  {/* Member cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {[0, 1, 2].map((i) => (
                      <MemberFieldGroup key={i} index={i} isOfficial={false} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Step 2: Official Proof Upload ────────────── */}
              {step === 2 && isOfficial && (
                <div className="animate-fade-in-scale">
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Enrollment Proof
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Upload proof of enrollment for each team member (PDF, PNG, JPG — max 5 MB).
                  </p>

                  {Object.keys(uploadErrors).includes('_form') && (
                    <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                      <AlertCircleIcon size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                      All 3 members must upload their proof of enrollment before proceeding.
                    </div>
                  )}

                  {[0, 1, 2].map((i) => {
                    const member = members[i]
                    const roleLabels = ['Team Captain', 'Second Member', 'Third Member']
                    const roleColors = ['var(--amber-400)', 'var(--indigo-400)', 'var(--emerald-400)']
                    return (
                      <div key={i} style={{
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: roleColors[i], flexShrink: 0,
                          }} />
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{roleLabels[i]}</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {member.fullName || `Member ${i + 1}`}
                            </p>
                          </div>
                        </div>

                        <div className="field" style={{ marginBottom: '1rem' }}>
                          <label className="field-label">
                            School / University <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="INPT Rabat"
                            className="input"
                            value={member.schoolName ?? ''}
                            onChange={(e) => setValue(`members.${i}.schoolName` as any, e.target.value)}
                            id={`school-name-${i}`}
                          />
                        </div>

                        <div className="field">
                          <label className="field-label">
                            Proof of Enrollment <span className="required">*</span>
                          </label>
                          <FileUploadZone
                            memberIndex={i}
                            memberName={member.fullName || `Member ${i + 1}`}
                            value={member.proofFileKey}
                            onChange={(key) => {
                              setValue(`members.${i}.proofFileKey` as any, key)
                              setUploadErrors(prev => {
                                const next = { ...prev }
                                delete (next as any)._form
                                return next
                              })
                            }}
                            onError={(msg) => setUploadErrors(prev => ({ ...prev, [i]: msg }))}
                          />
                          {uploadErrors[i] && (
                            <span className="field-error">{uploadErrors[i]}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ── Step 3 (or 2 for unofficial): Review ─────── */}
              {(step === 3 || (step === 2 && !isOfficial)) && (
                <div className="animate-fade-in-scale">
                  <ReviewSummary values={methods.getValues()} />
                  {getApiError() && (
                    <div className="alert alert-error" style={{ marginTop: '1.25rem' }}>
                      <AlertCircleIcon size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                      {getApiError()}
                    </div>
                  )}
                </div>
              )}

              {/* ── Navigation Buttons ───────────────────────── */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginTop: '2rem', gap: '1rem',
              }}>
                {step > 1 ? (
                  <button type="button" className="btn btn-ghost" onClick={handleBack}>
                    <ChevronLeftIcon size={16} /> Back
                  </button>
                ) : <div />}

                {(step === 3 || (step === 2 && !isOfficial)) ? (
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={mutation.isPending}
                    id="submit-registration"
                  >
                    {mutation.isPending ? (
                      <><div className="spinner" style={{ width: 16, height: 16 }} /> Submitting…</>
                    ) : (
                      <><SendIcon size={16} /> Submit Registration</>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={handleNext}
                    id={`next-step-${step}`}
                  >
                    Continue <ChevronRightIcon size={16} />
                  </button>
                )}
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  )
}
