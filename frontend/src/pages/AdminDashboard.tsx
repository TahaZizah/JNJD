import { useState, Fragment } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  LogOutIcon, FilterIcon, ChevronDownIcon, ChevronUpIcon,
  ExternalLinkIcon, CheckCircleIcon, XCircleIcon, ClockIcon,
  RefreshCwIcon, TrophyIcon, UsersIcon, ClipboardListIcon,
  XIcon, FileTextIcon, MailIcon, PhoneIcon, SchoolIcon, ShirtIcon,
  DownloadIcon, HistoryIcon, InfoIcon,
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

const ROLE_META = [
  { label: 'Captain', color: '#c8b87a', glow: 'rgba(200,184,122,0.15)' },
  { label: 'Second', color: '#7baad4', glow: 'rgba(123,170,212,0.15)' },
  { label: 'Third', color: '#34d399', glow: 'rgba(52,211,153,0.15)' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [statusFilter, setStatusFilter] = useState('')
  const [officialFilter, setOfficialFilter] = useState('')
  const [page, setPage] = useState(0)
  const [drawerRegId, setDrawerRegId] = useState<string | null>(null)
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

  // Separate lightweight queries for global stat counts
  const { data: statsAll } = useQuery({
    queryKey: ['admin-stats-all'],
    queryFn: () => getRegistrations({ size: 1 }),
  })
  const { data: statsPending } = useQuery({
    queryKey: ['admin-stats-pending'],
    queryFn: () => getRegistrations({ status: 'PENDING' as RegistrationStatus, size: 1 }),
  })
  const { data: statsApproved } = useQuery({
    queryKey: ['admin-stats-approved'],
    queryFn: () => getRegistrations({ status: 'APPROVED' as RegistrationStatus, size: 1 }),
  })
  const { data: statsOfficial } = useQuery({
    queryKey: ['admin-stats-official'],
    queryFn: () => getRegistrations({ isOfficial: true, size: 1 }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RegistrationStatus }) =>
      updateRegistrationStatus(id, status),
    onSuccess: (updated) => {
      setDetailCache(prev => ({ ...prev, [updated.id]: updated }))
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats-all'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats-pending'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats-approved'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats-official'] })
    },
  })

  const handleLogout = async () => {
    try { await adminLogout() } catch {}
    localStorage.removeItem('admin_token')
    navigate('/admin')
  }

  const openDrawer = async (id: string) => {
    setDrawerRegId(id)
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

  const totalItems = data?.total ?? 0
  const pageSize = data?.pageable?.pageSize ?? 20
  const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0
  const drawerDetail = drawerRegId ? detailCache[drawerRegId] : null
  const drawerReg = drawerRegId ? data?.content?.find(r => r.id === drawerRegId) : null

  return (
    <div className="admin-layout">
      {/* Decorative orbits */}
      <div className="admin-orbit-1" />
      <div className="admin-orbit-2" />

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(180deg, rgba(201,168,76,0.2) 0%, rgba(201,168,76,0.06) 100%)',
            border: '1px solid rgba(201,168,76,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(201,168,76,0.15)',
          }}>
            <TrophyIcon size={18} style={{ color: 'var(--text-gold)' }} />
          </div>
          <div>
            <p className="t-display" style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>JNJD Admin</p>
            <p className="t-mono" style={{ fontSize: '9px', letterSpacing: '0.25em', color: 'var(--text-gold)', textTransform: 'uppercase' }}>20th Edition · Dashboard</p>
          </div>
        </div>
        <button className="btn-ghost btn-sm" onClick={handleLogout} id="admin-logout" style={{ borderRadius: 999, padding: '8px 18px' }}>
          <LogOutIcon size={13} /> Sign Out
        </button>
      </header>

      <div style={{ padding: 'clamp(1.25rem, 4vw, 2.5rem)', maxWidth: 1300, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* ── Page title ───────────────────────────────────── */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="t-mono" style={{ fontSize: '10px', letterSpacing: '0.3em', color: 'var(--text-gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            // Registration Management
          </div>
          <h1 className="t-display" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--text-primary)' }}>
            Team <span className="gold-text">Submissions</span>
          </h1>
        </div>

        {/* ── Stats row ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total', value: statsAll?.total ?? 0, icon: <ClipboardListIcon size={16} />, glow: 'rgba(200,184,122,0.12)' },
            { label: 'Pending', value: statsPending?.total ?? 0, icon: <ClockIcon size={16} />, glow: 'rgba(245,158,11,0.12)' },
            { label: 'Approved', value: statsApproved?.total ?? 0, icon: <CheckCircleIcon size={16} />, glow: 'rgba(16,185,129,0.12)' },
            { label: 'Official', value: statsOfficial?.total ?? 0, icon: <UsersIcon size={16} />, glow: 'rgba(123,170,212,0.12)' },
          ].map((stat) => (
            <div key={stat.label} className="admin-stat-card" style={{ '--stat-glow': stat.glow } as React.CSSProperties}>
              <div className="t-mono" style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {stat.icon} {stat.label}
              </div>
              <p className="t-display gold-text" style={{ fontSize: '2.25rem' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ───────────────────────────────────────── */}
        <div className="admin-filters">
          <FilterIcon size={14} style={{ color: 'var(--text-gold)', opacity: 0.7 }} />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }} id="filter-status">
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={officialFilter} onChange={(e) => { setOfficialFilter(e.target.value); setPage(0) }} id="filter-official">
            {OFFICIAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className="btn-ghost btn-sm" onClick={() => refetch()} id="refresh-list" style={{ borderRadius: 999, padding: '8px 16px' }}>
            <RefreshCwIcon size={12} /> Refresh
          </button>
          <span className="t-mono" style={{ marginLeft: 'auto', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {totalItems} teams
          </span>
        </div>

        {/* ── Table ─────────────────────────────────────────── */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem', color: 'var(--text-gold)' }} />
            <p className="t-mono" style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Loading registrations…</p>
          </div>
        ) : isError ? (
          <div className="alert alert-error">Failed to load registrations. Please refresh.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {data?.content?.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                      <p className="t-mono" style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>No registrations found.</p>
                    </td>
                  </tr>
                ) : data?.content?.map((reg) => (
                  <tr
                    key={reg.id}
                    className={drawerRegId === reg.id ? 'row-expanded' : ''}
                    onClick={() => openDrawer(reg.id)}
                  >
                    <td>
                      <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>{reg.teamName}</p>
                      <p className="t-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '0.15rem', letterSpacing: '0.05em' }}>
                        {reg.id.slice(0, 8)}…
                      </p>
                    </td>
                    <td>
                      <span className={`badge ${reg.isOfficial ? 'badge-official' : 'badge-unofficial'}`}>
                        {reg.isOfficial ? '🏅 Official' : 'Unofficial'}
                      </span>
                    </td>
                    <td>{statusBadge(reg.status)}</td>
                    <td>
                      <span className="t-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(reg.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap' }}>
                        {reg.status !== 'APPROVED' && (
                          <button className="btn-success btn-sm" onClick={() => statusMutation.mutate({ id: reg.id, status: 'APPROVED' })} disabled={statusMutation.isPending} id={`approve-${reg.id}`}>
                            <CheckCircleIcon size={12} /> Approve
                          </button>
                        )}
                        {reg.status !== 'REJECTED' && (
                          <button className="btn-danger btn-sm" onClick={() => statusMutation.mutate({ id: reg.id, status: 'REJECTED' })} disabled={statusMutation.isPending} id={`reject-${reg.id}`}>
                            <XCircleIcon size={12} /> Reject
                          </button>
                        )}
                        {reg.status !== 'WAITLISTED' && (
                          <button className="btn-ghost btn-sm" onClick={() => statusMutation.mutate({ id: reg.id, status: 'WAITLISTED' })} disabled={statusMutation.isPending} id={`waitlist-${reg.id}`} style={{ borderRadius: 6, padding: '6px 12px' }}>
                            <ClockIcon size={12} /> Waitlist
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <ExternalLinkIcon size={14} style={{ color: 'var(--text-gold)', opacity: 0.5 }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────── */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' }}>
            <button className="btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ borderRadius: 999, padding: '8px 16px' }}>← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={`btn-sm ${i === page ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(i)} style={{ borderRadius: 999, padding: '8px 14px', minWidth: 36 }}>{i + 1}</button>
            ))}
            <button className="btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} style={{ borderRadius: 999, padding: '8px 16px' }}>Next →</button>
          </div>
        )}
      </div>

      {/* ── Team Detail Drawer ──────────────────────────────── */}
      {drawerRegId && (
        <>
          <div className="admin-drawer-overlay" onClick={() => setDrawerRegId(null)} />
          <div className="admin-drawer">
            {/* Drawer header */}
            <div style={{
              padding: '1.25rem clamp(1.25rem, 4vw, 2rem)',
              borderBottom: '1px solid rgba(201,168,76,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(201,168,76,0.03)',
            }}>
              <div>
                <p className="t-mono" style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--text-gold)', marginBottom: '0.25rem' }}>Team Details</p>
                <h2 className="t-display" style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>
                  {drawerReg?.teamName || 'Loading…'}
                </h2>
              </div>
              <button onClick={() => setDrawerRegId(null)} style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(140,174,212,0.08)', border: '1px solid rgba(140,174,212,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 180ms ease', color: 'var(--text-muted)',
              }}>
                <XIcon size={16} />
              </button>
            </div>

            {!drawerDetail ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <div className="spinner" style={{ margin: '0 auto', color: 'var(--text-gold)' }} />
              </div>
            ) : (
              <>
                {/* Team info section */}
                <div className="drawer-section">
                  <p className="t-mono" style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <InfoIcon size={12} /> Registration Info
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <span className={`badge ${drawerDetail.isOfficial ? 'badge-official' : 'badge-unofficial'}`}>
                      {drawerDetail.isOfficial ? '🏅 Official' : 'Unofficial'}
                    </span>
                    {statusBadge(drawerDetail.status)}
                  </div>
                  <div className="admin-info-row">
                    <span className="info-label">ID</span>
                    <span className="info-value t-mono" style={{ fontSize: '0.8rem', letterSpacing: '0.03em' }}>{drawerDetail.id}</span>
                  </div>
                  <div className="admin-info-row">
                    <span className="info-label">Submitted</span>
                    <span className="info-value">{new Date(drawerDetail.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  <div className="admin-info-row">
                    <span className="info-label">Updated</span>
                    <span className="info-value">{new Date(drawerDetail.updatedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  {drawerDetail.description && (
                    <div className="admin-info-row" style={{ alignItems: 'flex-start' }}>
                      <span className="info-label">About</span>
                      <span className="info-value" style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>{drawerDetail.description}</span>
                    </div>
                  )}
                </div>

                {/* Members section */}
                <div className="drawer-section">
                  <p className="t-mono" style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UsersIcon size={12} /> Team Members
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {drawerDetail.members.map((m, i) => {
                      const role = ROLE_META[i] || ROLE_META[0]
                      return (
                        <div key={m.id} className="admin-member-card" style={{ '--member-accent': role.color } as React.CSSProperties}>
                          {/* Role badge */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: role.color, boxShadow: `0 0 8px ${role.glow}` }} />
                            <span className="t-mono" style={{ fontSize: '10px', fontWeight: 700, color: role.color, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{role.label}</span>
                          </div>
                          {/* Name */}
                          <p className="t-display" style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{m.fullName}</p>
                          {/* Details grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              <MailIcon size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> {m.email}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              <PhoneIcon size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> {m.phone}
                            </div>
                            {m.schoolName && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                <SchoolIcon size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> {m.schoolName}
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              <ShirtIcon size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> {m.tshirtSize}{m.tshirtSizeCustom ? ` (${m.tshirtSizeCustom})` : ''}
                            </div>
                          </div>
                          {/* File buttons */}
                          {(m.proofFileKey || m.cvFileKey) && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                              {m.proofFileKey && (
                                <button className="admin-file-btn" onClick={() => handleGetProofUrl(drawerDetail.id, m.proofFileKey!)} id={`view-proof-${m.id}`}>
                                  <FileTextIcon size={13} /> View Proof
                                </button>
                              )}
                              {m.cvFileKey && (
                                <button className="admin-file-btn" onClick={() => handleGetProofUrl(drawerDetail.id, m.cvFileKey!)} id={`view-cv-${m.id}`}>
                                  <DownloadIcon size={13} /> View CV
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Status history */}
                {drawerDetail.statusHistory.length > 0 && (
                  <div className="drawer-section">
                    <p className="t-mono" style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <HistoryIcon size={12} /> Status History
                    </p>
                    <div className="admin-timeline">
                      {drawerDetail.statusHistory.map((h, i) => (
                        <div key={i} className="admin-timeline-item">
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                            {h.oldStatus ? <><span style={{ color: 'var(--text-muted)' }}>{h.oldStatus}</span> → </> : ''}
                            <strong>{h.newStatus}</strong>
                          </div>
                          <div className="t-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '0.2rem', letterSpacing: '0.1em' }}>
                            by {h.changedBy} · {new Date(h.timestamp).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drawer actions */}
                <div className="drawer-section" style={{ position: 'sticky', bottom: 0, background: 'rgba(3,8,22,0.9)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(201,168,76,0.12)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {drawerDetail.status !== 'APPROVED' && (
                      <button className="btn-success btn-sm" style={{ borderRadius: 999, padding: '8px 18px' }}
                        onClick={() => statusMutation.mutate({ id: drawerDetail.id, status: 'APPROVED' })}
                        disabled={statusMutation.isPending}>
                        <CheckCircleIcon size={13} /> Approve
                      </button>
                    )}
                    {drawerDetail.status !== 'REJECTED' && (
                      <button className="btn-danger btn-sm" style={{ borderRadius: 999, padding: '8px 18px' }}
                        onClick={() => statusMutation.mutate({ id: drawerDetail.id, status: 'REJECTED' })}
                        disabled={statusMutation.isPending}>
                        <XCircleIcon size={13} /> Reject
                      </button>
                    )}
                    {drawerDetail.status !== 'WAITLISTED' && (
                      <button className="btn-ghost btn-sm" style={{ borderRadius: 999, padding: '8px 18px' }}
                        onClick={() => statusMutation.mutate({ id: drawerDetail.id, status: 'WAITLISTED' })}
                        disabled={statusMutation.isPending}>
                        <ClockIcon size={13} /> Waitlist
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
