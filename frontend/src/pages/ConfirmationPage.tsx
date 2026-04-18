import { useParams, Link } from 'react-router-dom'
import { CheckCircleIcon, ClipboardCopyIcon, ArrowLeftIcon } from 'lucide-react'
import { useState } from 'react'

export default function ConfirmationPage() {
  const { id } = useParams<{ id: string }>()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (id) {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem 1rem',
    }}>
      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>

        {/* Success icon */}
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.05) 70%)',
          border: '2px solid rgba(16,185,129,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.75rem',
          animation: 'pulse-glow 2.5s ease-in-out infinite',
          boxShadow: '0 0 40px rgba(16,185,129,0.2)',
        }}>
          <CheckCircleIcon size={40} style={{ color: 'var(--emerald-400)' }} />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900,
          marginBottom: '0.75rem',
          background: 'linear-gradient(135deg, #34d399 0%, #38bdf8 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Registration Submitted!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.7 }}>
          Your team has been successfully registered for <strong style={{ color: 'var(--text-primary)' }}>JNJD 19th Edition</strong>.
          Your status is currently <span className="badge badge-pending">Pending Review</span>.
        </p>

        {/* Registration ID */}
        <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Your Registration ID
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
            <code style={{
              fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--indigo-400)',
              wordBreak: 'break-all',
            }}>
              {id}
            </code>
            <button
              onClick={copy}
              className="btn btn-ghost btn-sm"
              title="Copy registration ID"
              id="copy-registration-id"
            >
              {copied ? '✓ Copied' : <ClipboardCopyIcon size={14} />}
            </button>
          </div>
        </div>

        {/* Next steps */}
        <div style={{
          background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left',
        }}>
          <p style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>📋 What happens next?</p>
          {[
            { num: '01', text: 'Our team will review your registration within 2–5 business days.' },
            { num: '02', text: 'You will receive an email notification on your approval status.' },
            { num: '03', text: 'If approved, payment instructions (180 MAD) will be sent to all 3 members.' },
            { num: '04', text: 'Questions? Contact us at cit.inpt@gmail.com' },
          ].map((step) => (
            <div key={step.num} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 800, color: 'var(--indigo-400)',
                fontFamily: 'var(--font-display)', minWidth: 24, paddingTop: 2,
              }}>{step.num}</span>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.text}</p>
            </div>
          ))}
        </div>

        <Link to="/" className="btn btn-ghost" id="back-to-home">
          <ArrowLeftIcon size={15} /> Register another team
        </Link>
      </div>
    </div>
  )
}
