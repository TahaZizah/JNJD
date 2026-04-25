import api from './client'
import type {
  RegistrationFormData,
  RegistrationResponse,
  PresignResponse,
} from '../types'

export async function submitRegistration(data: RegistrationFormData): Promise<RegistrationResponse> {
  const res = await api.post<RegistrationResponse>('/registrations', data)
  return res.data
}

export async function getPresignedUrl(filename: string, contentType: string, fileType: 'proof' | 'cv' = 'proof'): Promise<PresignResponse> {
  const res = await api.get<PresignResponse>('/registrations/presign', {
    params: { filename, contentType, fileType },
  })
  return res.data
}

export async function uploadFileToMinIO(
  uploadUrl: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type)

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
    }
    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(file)
  })
}
