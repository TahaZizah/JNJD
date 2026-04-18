export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED'
export type MemberRole = 'CAPTAIN' | 'SECOND' | 'THIRD'
export type TshirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'OTHER'

export interface MemberFormData {
  fullName: string
  email: string
  phone: string
  tshirtSize: TshirtSize | ''
  tshirtSizeCustom?: string
  schoolName?: string
  proofFileKey?: string
}

export interface RegistrationFormData {
  teamName: string
  isOfficial: boolean
  description?: string
  members: [MemberFormData, MemberFormData, MemberFormData]
}

export interface RegistrationResponse {
  id: string
  teamName: string
  isOfficial: boolean
  status: RegistrationStatus
  description?: string
  createdAt: string
}

export interface MemberDetail {
  id: string
  role: MemberRole
  fullName: string
  email: string
  phone: string
  tshirtSize: TshirtSize
  tshirtSizeCustom?: string
  schoolName?: string
  proofFileKey?: string
}

export interface StatusHistoryEntry {
  oldStatus?: RegistrationStatus
  newStatus: RegistrationStatus
  changedBy: string
  timestamp: string
}

export interface RegistrationDetailResponse extends RegistrationResponse {
  updatedAt: string
  members: MemberDetail[]
  statusHistory: StatusHistoryEntry[]
}

export interface PresignResponse {
  uploadUrl: string
  objectKey: string
  expiresInSeconds: number
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface ApiError {
  status: number
  error: string
  details: Array<{ field: string; message: string }> | string
  timestamp: string
}

export interface AdminLoginResponse {
  token: string
  username: string
  expiresInMs: number
}
