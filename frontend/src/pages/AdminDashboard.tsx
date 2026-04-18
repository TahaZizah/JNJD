import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  LogOutIcon, FilterIcon, ChevronDownIcon, ChevronUpIcon,
  ExternalLinkIcon, CheckCircleIcon, XCircleIcon, ClockIcon,
  RefreshCwIcon, TrophyIcon, UsersIcon, ClipboardListIcon,
} from 'lucide-react'
import { getRegistrations, getRegistrationDetail, updateRegistrationStatus, getProofUrl, adminLogout } from '../api/admin'
import type { RegistrationStatus, RegistrationResponse, RegistrationDetailResponse } from '../types'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WAITLISTED', label: 'Waitlisted' },
]

const OFFICIAL_OPTIONS = [
  { value: '', label: 'All Teams' },
  { value: 'true', label: 'Official Only' },
  { value: 'false', label: 'Unofficial Only' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [statusFilter, setStatusFilter] = useState('')
  const [officialFilter, setOfficialFilter] = useState('')
  const [page, setPage] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detailCache, setDetailCache] = useState<Record<string, RegistrationDetailResponse>>({})
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({})

  const params = {
    status: statusFilter as RegistrationStatus || undefined,
    isOfficial: officialFilter === '' ? undefined : officialFilter === 'true',
    page,
    size: 20,
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-registrations', params],
    queryFn: () => getRegistrations(params),
    placeholderData: (prev) => prev,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RegistrationStatus }) =>
      updateRegistrationStatus(id, status),
    onSuccess: (updated) => {
      setDetailCache(prev => ({ ...prev, [updated.id]: updated }))
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] })
    },
  })

  const handleLogout = async () => {
    try { await adminLogout() } catch {}
    localStorage.removeItem('admin_token')
    navigate('/admin')
  }

  const toggleExpand = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return }
    setExpandedId(id)
    if (!detailCache[id]) {
      const detail = await getRegistrationDetail(id)
      setDetailCache(prev => ({ ...prev, [id]: detail }))
    }
  }

  const handleGetProofUrl = async (regId: string, objectKey: string) => {
    const cacheKey = `${regId}:${objectKey}`
    if (proofUrls[cacheKey]) { window.open(proofUrls[cacheKey], '_blank'); return }
    const url = await getProofUrl(regId, objectKey)
    setProofUrls(prev => ({ ...prev, [cacheKey]: url }))
    window.open(url, '_blank')
  }

  const statusBadge = (status: RegistrationStatus) => (
    <span className={`badge badge-${status.toLowerCase()}`}>
      {status === 'PENDING' && '⏳ '}
      {status === 'APPROVED' && '✅ '}
      {status === 'REJECTED' && '❌ '}
      {status === 'WAITLISTED' && '🕐 '}
      {status}
    </span>
  )

  const totalItems = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0

  return (
    <div style={{ minHeight: '100vh', padding: '0' }}>
      {/* ── Topbar ──────────────────────────────────────────── */}
      <header style={{
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)',
        padding: '0 1.5rem', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrophyIcon size={18} style={{ color: 'white' }} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>JNJD Admin</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>19th Edition</p>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="admin-logout">
          <LogOutIcon size={14} /> Sign Out
        </button>
      </header>

      <div style={{ padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        {/* ── Stats row ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Registrations', value: totalItems, icon: <ClipboardListIcon size={18} />, color: 'var(--indigo-400)' },
            { label: 'Pending Review', value: data?.content?.filter(r => r.status === 'PENDING').length ?? 0, icon: <ClockIcon size={18} />, color: 'var(--amber-400)' },
            { label: 'Approved', value: data?.content?.filter(r => r.status === 'APPROVED').length ?? 0, icon: <CheckCircleIcon size={18} />, color: 'var(--emerald-400)' },
            { label: 'Official Teams', value: data?.content?.filter(r => r.isOfficial).length ?? 0, icon: <UsersIcon size={18} />, color: 'var(--violet-500)' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem', color: stat.color }}>
                {stat.icon}
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.label}
                </span>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Filters ───────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: '0.75rem', marginBottom: '1.5rem',
          flexWrap: 'wrap', alignItems: 'center',
        }}>
          <FilterIcon size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
            style={{ width: 'auto', minWidth: 160 }}
            id="filter-status"
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            className="select"
            value={officialFilter}
            onChange={(e) => { setOfficialFilter(e.target.value); setPage(0) }}
            style={{ width: 'auto', minWidth: 160 }}
            id="filter-official"
          >
            {OFFICIAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => refetch()} id="refresh-list">
            <RefreshCwIcon size={13} /> Refresh
          </button>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {totalItems} total
          </span>
        </div>

        {/* ── Table ─────────────────────────────────────────── */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div className="spinner spinner-indigo" style={{ margin: '0 auto 1rem' }} />
            Loading registrations…
          </div>
        ) : isError ? (
          <div className="alert alert-error">Failed to load registrations. Please refresh.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data?.content?.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No registrations found.
                    </td>
                  </tr>
                ) : data?.content?.map((reg) => (
                  <>
                    <tr
                      key={reg.id}
                      className={expandedId === reg.id ? 'expanded' : ''}
                      onClick={() => toggleExpand(reg.id)}
                    >
                      <td>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{reg.teamName}</p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem', fontFamily: 'monospace' }}>
                          {reg.id.slice(0, 8)}…
                        </p>
                      </td>
                      <td>
                        <span className={`badge ${reg.isOfficial ? 'badge-official' : 'badge-unofficial'}`}>
                          {reg.isOfficial ? '🏅 Official' : 'Unofficial'}
                        </span>
                      </td>
                      <td>{statusBadge(reg.status)}</td>
                      <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(reg.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap' }}>
                          {reg.status !== 'APPROVED' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => statusMutation.mutate({ id: reg.id, status: 'APPROVED' })}
                              disabled={statusMutation.isPending}
                              title="Approve"
                              id={`approve-${reg.id}`}
                            >
                              <CheckCircleIcon size={13} /> Approve
                            </button>
                          )}
                          {reg.status !== 'REJECTED' && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => statusMutation.mutate({ id: reg.id, status: 'REJECTED' })}
                              disabled={statusMutation.isPending}
                              title="Reject"
                              id={`reject-${reg.id}`}
                            >
                              <XCircleIcon size={13} /> Reject
                            </button>
                          )}
                          {reg.status !== 'WAITLISTED' && (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => statusMutation.mutate({ id: reg.id, status: 'WAITLISTED' })}
                              disabled={statusMutation.isPending}
                              title="Waitlist"
                              id={`waitlist-${reg.id}`}
                            >
                              <ClockIcon size={13} /> Waitlist
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        {expandedId === reg.id
                          ? <ChevronUpIcon size={16} style={{ color: 'var(--indigo-400)' }} />
                          : <ChevronDownIcon size={16} style={{ color: 'var(--text-muted)' }} />}
                      </td>
                    </tr>

                    {/* ── Expanded row ─────────────────────────── */}
                    {expandedId === reg.id && (
                      <tr key={`${reg.id}-detail`}>
                        <td colSpan={6} style={{ padding: 0, background: 'rgba(99,102,241,0.04)' }}>
                          <ExpandedDetail
                            regId={reg.id}
                            detail={detailCache[reg.id]}
                            onGetProofUrl={handleGetProofUrl}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────── */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${i === page ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <button className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Expanded Detail Sub-component ────────────────────────────
function ExpandedDetail({
  regId,
  detail,
  onGetProofUrl,
}: {
  regId: string
  detail?: RegistrationDetailResponse
  onGetProofUrl: (regId: string, key: string) => void
}) {
  if (!detail) return (
    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div className="spinner spinner-indigo" style={{ margin: '0 auto' }} />
    </div>
  )

  const roleLabels = ['Captain', 'Second', 'Third']
  const roleColors = ['var(--amber-400)', 'var(--indigo-400)', 'var(--emerald-400)']

  return (
    <div style={{ padding: '1.5rem', animation: 'fadeIn 0.25s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        {detail.members.map((m, i) => (
          <div key={m.id} style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
            padding: '1rem', border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: roleColors[i] }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: roleColors[i], textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {roleLabels[i]}
              </span>
            </div>
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{m.fullName}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{m.email}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{m.phone}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              👕 {m.tshirtSize}{m.tshirtSizeCustom ? ` (${m.tshirtSizeCustom})` : ''}
            </p>
            {m.schoolName && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>🏫 {m.schoolName}</p>}
            {m.proofFileKey && (
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '0.5rem' }}
                onClick={() => onGetProofUrl(regId, m.proofFileKey!)}
                id={`view-proof-${m.id}`}
              >
                <ExternalLinkIcon size={12} /> View Proof
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Status history */}
      {detail.statusHistory.length > 0 && (
        <div>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Status History
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {detail.statusHistory.map((h, i) => (
              <div key={i} style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.75rem',
                fontSize: '0.75rem', color: 'var(--text-secondary)',
              }}>
                {h.oldStatus ? `${h.oldStatus} → ` : ''}<strong>{h.newStatus}</strong>
                {' '}by <em>{h.changedBy}</em>
                {' · '}{new Date(h.timestamp).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
