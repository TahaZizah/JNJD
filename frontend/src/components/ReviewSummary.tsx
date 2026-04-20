import type { RegistrationFormValues } from '../schemas/registration'

interface Props {
  values: RegistrationFormValues
}

const ROLE_LABELS  = ['Team Captain', 'Second Member', 'Third Member']
const ROLE_COLORS  = ['var(--amber-400)', 'var(--indigo-400)', 'var(--emerald-400)']

export default function ReviewSummary({ values }: Props) {
  return (
    <div>
      {/* Team summary */}
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1rem',
      }}>
        <p style={{
          fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.75rem',
        }}>
          Team Details
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Team Name</p>
            <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>{values.teamName}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Status</p>
            <span className={`badge ${values.isOfficial ? 'badge-official' : 'badge-unofficial'}`}>
              {values.isOfficial ? '🏅 Official' : 'Unofficial'}
            </span>
          </div>
          {values.description && (
            <div style={{ width: '100%' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Description</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{values.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Members summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {values.members.map((m, i) => (
          <div key={i} style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', padding: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: ROLE_COLORS[i], flexShrink: 0 }} />
              <p style={{ fontWeight: 700, fontSize: '0.85rem', color: ROLE_COLORS[i] }}>{ROLE_LABELS[i]}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem', fontSize: '0.85rem' }}>
              <ReviewRow label="Full Name"   value={m.fullName} />
              <ReviewRow label="Email"       value={m.email} />
              <ReviewRow label="Phone"       value={m.phone} />
              <ReviewRow label="T-Shirt"     value={m.tshirtSize === 'OTHER' ? `Other: ${m.tshirtSizeCustom}` : m.tshirtSize} />
              {m.schoolName   && <ReviewRow label="University"       value={m.schoolName} />}
              {m.proofFileKey && <ReviewRow label="Enrollment Proof" value="✅ Uploaded" />}
              {m.cvFileKey    && <ReviewRow label="CV / Résumé"      value="✅ Uploaded" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null
  return (
    <div>
      <p style={{
        fontSize: '0.72rem', color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.15rem',
      }}>
        {label}
      </p>
      <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{value}</p>
    </div>
  )
}
