import { useController } from 'react-hook-form'

interface Props {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any
  label: string
  placeholder?: string
  type?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function FormInput({
  name, control, label, placeholder, type = 'text', required, disabled, className
}: Props) {
  const { field, fieldState } = useController({ name, control })
  return (
    <div className={`field ${className ?? ''}`}>
      <label className="field-label" htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        {...field}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`input ${fieldState.error ? 'error' : ''}`}
        id={name}
      />
      {fieldState.error && (
        <span className="field-error">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {fieldState.error.message}
        </span>
      )}
    </div>
  )
}

interface SelectProps {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any
  label: string
  options: { value: string; label: string }[]
  required?: boolean
  disabled?: boolean
  className?: string
}

export function FormSelect({ name, control, label, options, required, disabled, className }: SelectProps) {
  const { field, fieldState } = useController({ name, control })
  return (
    <div className={`field ${className ?? ''}`}>
      <label className="field-label" htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      <select
        {...field}
        disabled={disabled}
        className={`select ${fieldState.error ? 'error' : ''}`}
        id={name}
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {fieldState.error && (
        <span className="field-error">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {fieldState.error.message}
        </span>
      )}
    </div>
  )
}
