import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, ClipboardCopy, ArrowLeft } from 'lucide-react'
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
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem',
      background: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(200,168,75,0.07) 0%, transparent 60%)',
    }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(200,168,75,0.1)',
          border: '2px solid rgba(200,168,75,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.75rem',
          boxShadow: '0 0 40px rgba(200,168,75,0.2)',
          animation: 'pulse-glow 2.5s ease-in-out infinite',
        }}>
          <CheckCircle2 size={36} style={{ color: 'var(--gold)' }} />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900,
          color: 'var(--gold)', marginBottom: '0.75rem',
        }}>
          Registration Received!
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.7 }}>
          Your team has been successfully registered for{' '}
          <strong style={{ color: 'var(--text-primary)' }}>JNJD 19th Edition</strong>.
          Your status is currently <span className="badge badge-pending" style={{ verticalAlign: 'middle' }}>Pending Review</span>.
        </p>

        {/* Registration ID */}
        <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginBottom: '0.5rem' }}>
            Your Registration ID
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
            <code style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--gold)', wordBreak: 'break-all' }}>
              {id}
            </code>
            <button onClick={copy} className="btn btn-ghost btn-sm" title="Copy" id="copy-registration-id">
              {copied ? '✓' : <ClipboardCopy size={13} />}
            </button>
          </div>
        </div>

        {/* Payment box */}
        <div style={{
          background: 'rgba(200,168,75,0.07)', border: '1px solid rgba(200,168,75,0.25)',
          borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem', textAlign: 'left',
        }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            Payment Information
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            Participation fee: <strong>180 MAD</strong> per team.
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
            Payment instructions will be sent after review. Questions?{' '}
            <a href="mailto:cit.inpt@gmail.com" style={{ color: 'var(--gold)' }}>cit.inpt@gmail.com</a>
          </p>
        </div>

        {/* What's next */}
        <div style={{
          background: 'var(--bg-1)', border: '1px solid var(--dim)',
          borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left',
        }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1rem' }}>📋 What happens next?</p>
          {[
            'Our team will review your registration within 2–5 business days.',
            'You will receive an email notification on your approval status.',
            'If approved, payment instructions (180 MAD) will be sent to all 3 members.',
            'Questions? Contact us at cit.inpt@gmail.com',
          ].map((text, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: i < 3 ? '0.75rem' : 0 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 800, color: 'var(--gold)', minWidth: 22, paddingTop: 3 }}>
                0{i + 1}
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{text}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-ghost" id="back-to-home">
            <ArrowLeft size={15} /> Register another team
          </Link>
        </div>
      </div>
    </div>
  )
}
