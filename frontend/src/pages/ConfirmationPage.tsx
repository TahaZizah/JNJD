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
      background: '#020611', color: '#eeeae0',
      backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 60%)',
    }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>

        <div className="t-mono text-[10px] uppercase tracking-[0.3em] text-gold-500 mb-4">// Confirmation</div>
        <h2 className="t-display text-4xl md:text-5xl mb-6">Registration <span className="gold-text">Received</span>.</h2>
        
        <p className="text-lg text-bone-100/75 leading-relaxed mb-8">
          Your team has been successfully registered for{' '}
          <strong className="text-bone-100">JNJD 20th Edition</strong>.
          Your status is currently <span className="inline-block border border-gold-500/30 text-gold-400 bg-gold-500/10 text-[10px] t-mono uppercase tracking-widest px-2 py-0.5 rounded-full align-middle ml-2">Pending Review</span>.
        </p>

        <div className="glass rounded-3xl p-8 mb-8 hair-b bg-ink-900/40 relative overflow-hidden text-left">
          <p className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-2">
            Your Registration ID
          </p>
          <div className="flex items-center gap-3 justify-between">
            <code className="font-mono text-sm text-bone-100/90 break-all select-all">
              {id}
            </code>
            <button onClick={copy} className="btn-ghost !p-2" title="Copy" id="copy-registration-id">
              {copied ? <span className="text-gold-400 text-xs">Copied!</span> : <ClipboardCopy size={16} />}
            </button>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 mb-8 hair-b bg-ink-900/40 relative overflow-hidden text-left">
          <p className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-2">
            Payment Information
          </p>
          <p className="text-sm text-bone-100/90 mb-2">
            Participation fee: <strong className="text-gold-400">180 MAD</strong> per team.
          </p>
          <p className="text-sm text-bone-100/60 leading-relaxed">
            Payment instructions will be sent to the <strong className="text-bone-100">Team Captain</strong> after review. Questions?{' '}
            <a href="mailto:cit.inpt@gmail.com" className="text-gold-500 hover:text-gold-400 transition">cit.inpt@gmail.com</a>
          </p>
        </div>

        <div className="glass rounded-3xl p-8 mb-10 hair-b bg-ink-900/40 relative overflow-hidden text-left">
          <p className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-4">What happens next?</p>
          <ul className="space-y-4">
            {[
              'Our team will review your registration within 2–5 business days.',
              'The Team Captain will receive an email notification on the approval status.',
              'If approved, payment instructions (180 MAD) will be sent to the Captain.',
              'Questions? Contact us at cit.inpt@gmail.com',
            ].map((text, i) => (
              <li key={i} className="flex gap-4">
                <span className="t-mono text-[10px] tracking-[0.1em] text-gold-500/70 pt-0.5 mt-1">
                  0{i + 1}
                </span>
                <span className="text-sm text-bone-100/75 leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center">
          <Link to="/" className="btn-ghost" id="back-to-home">
            <ArrowLeft size={16} className="mr-2 inline" /> Register another team
          </Link>
        </div>
      </div>
    </div>
  )
}
