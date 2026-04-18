import api from './client'
import type {
  AdminLoginResponse,
  RegistrationResponse,
  RegistrationDetailResponse,
  RegistrationStatus,
  PageResponse,
} from '../types'

export async function adminLogin(username: string, password: string): Promise<AdminLoginResponse> {
  const res = await api.post<AdminLoginResponse>('/admin/auth/login', { username, password })
  return res.data
}

export async function adminLogout(): Promise<void> {
  await api.post('/admin/auth/logout')
}

export async function getRegistrations(params: {
  status?: RegistrationStatus
  isOfficial?: boolean
  page?: number
  size?: number
}): Promise<PageResponse<RegistrationResponse>> {
  const res = await api.get<PageResponse<RegistrationResponse>>('/admin/registrations', { params })
  return res.data
}

export async function getRegistrationDetail(id: string): Promise<RegistrationDetailResponse> {
  const res = await api.get<RegistrationDetailResponse>(`/admin/registrations/${id}`)
  return res.data
}

export async function updateRegistrationStatus(
  id: string,
  status: RegistrationStatus
): Promise<RegistrationDetailResponse> {
  const res = await api.patch<RegistrationDetailResponse>(
    `/admin/registrations/${id}/status`,
    { status }
  )
  return res.data
}

export async function getProofUrl(id: string, objectKey: string): Promise<string> {
  const res = await api.get<{ url: string }>(`/admin/registrations/${id}/proof-url`, {
    params: { objectKey },
  })
  return res.data.url
}
