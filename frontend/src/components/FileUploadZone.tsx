import { useState, useRef } from 'react'
import { UploadIcon, CheckCircleIcon, XCircleIcon, FileIcon } from 'lucide-react'
import { getPresignedUrl, uploadFileToMinIO } from '../api/registration'
import { validateFileForUpload } from '../schemas/registration'

interface Props {
  memberIndex: number
  memberName: string
  value?: string
  onChange: (key: string) => void
  onError: (msg: string) => void
}

export default function FileUploadZone({ memberIndex, memberName, value, onChange, onError }: Props) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [fileName, setFileName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    const validationError = validateFileForUpload(file)
    if (validationError) {
      setStatus('error')
      setErrorMsg(validationError)
      onError(validationError)
      return
    }

    setStatus('uploading')
    setProgress(0)
    setFileName(file.name)
    setErrorMsg('')

    try {
      const presign = await getPresignedUrl(file.name, file.type)
      await uploadFileToMinIO(presign.uploadUrl, file, (pct) => setProgress(pct))
      onChange(presign.objectKey)
      setStatus('done')
    } catch (err: any) {
      const msg = err?.message ?? 'Upload failed. Please try again.'
      setStatus('error')
      setErrorMsg(msg)
      onError(msg)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const reset = () => {
    setStatus('idle')
    setProgress(0)
    setFileName('')
    setErrorMsg('')
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <div
        className={`upload-zone ${status}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {status === 'idle' && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleChange}
              id={`proof-upload-${memberIndex}`}
            />
            <UploadIcon size={24} style={{ color: 'var(--indigo-400)', margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              <strong style={{ color: 'var(--indigo-400)' }}>Click to upload</strong> or drag & drop
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              PDF, PNG, JPG, JPEG — max 5 MB
            </p>
          </>
        )}

        {status === 'uploading' && (
          <div style={{ pointerEvents: 'none' }}>
            <div className="spinner spinner-indigo" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Uploading <strong>{fileName}</strong>… {progress}%
            </p>
            <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {status === 'done' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
            <CheckCircleIcon size={20} style={{ color: 'var(--emerald-400)', flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
                Upload complete
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fileName}</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={reset}
              style={{ marginLeft: 'auto' }}
            >
              Change
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleChange}
              id={`proof-upload-retry-${memberIndex}`}
            />
            <XCircleIcon size={20} style={{ color: 'var(--rose-400)', margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--rose-400)', marginBottom: '0.25rem' }}>
              {errorMsg}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to try again</p>
          </div>
        )}
      </div>
    </div>
  )
}
