import { useState, useRef } from 'react'
import { UploadIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'
import { getPresignedUrl, uploadFileToMinIO } from '../api/registration'
import { validateFileForUpload, CV_EXTENSIONS } from '../schemas/registration'

interface Props {
  /** Unique DOM id prefix for the hidden file input */
  uploadId: string
  memberIndex: number
  memberName: string
  value?: string
  onChange: (key: string) => void
  onError: (msg: string) => void
  /** File types accepted by the native input (e.g. ".pdf,.png,.jpg,.jpeg") */
  accept?: string
  /** Human-readable format hint shown in idle state */
  acceptLabel?: string
  /** Placeholder text shown in idle state */
  placeholder?: string
}

const DEFAULT_ACCEPT       = '.pdf,.png,.jpg,.jpeg'
const DEFAULT_ACCEPT_LABEL = 'PDF, PNG, JPG, JPEG — max 5 MB'
const DEFAULT_PLACEHOLDER  = 'Click to upload or drag & drop'

export default function FileUploadZone({
  uploadId,
  memberIndex,
  memberName,
  value,
  onChange,
  onError,
  accept       = DEFAULT_ACCEPT,
  acceptLabel  = DEFAULT_ACCEPT_LABEL,
  placeholder  = DEFAULT_PLACEHOLDER,
}: Props) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus]     = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [fileName, setFileName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef                = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    const isCv = accept.includes('.doc')
    const validationError = validateFileForUpload(file, isCv ? CV_EXTENSIONS : undefined)
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
              accept={accept}
              onChange={handleChange}
              id={`${uploadId}-input`}
            />
            <UploadIcon size={24} style={{ color: 'var(--indigo-400)', margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              <strong style={{ color: 'var(--indigo-400)' }}>{placeholder}</strong>
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{acceptLabel}</p>
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
              accept={accept}
              onChange={handleChange}
              id={`${uploadId}-retry`}
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
