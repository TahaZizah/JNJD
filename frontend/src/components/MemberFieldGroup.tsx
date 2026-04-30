import { useFormContext } from 'react-hook-form'
import { FormInput, FormSelect } from './FormFields'
import type { RegistrationFormValues } from '../schemas/registration'
import { sanitizePhone } from '../schemas/registration'

const TSHIRT_OPTIONS = [
  { value: 'XS',    label: 'XS — Extra Small' },
  { value: 'S',     label: 'S — Small' },
  { value: 'M',     label: 'M — Medium' },
  { value: 'L',     label: 'L — Large' },
  { value: 'XL',    label: 'XL — Extra Large' },
  { value: 'XXL',   label: 'XXL — Double XL' },
  { value: 'OTHER', label: 'Other (specify)' },
]

const ROLE_LABELS: Record<number, { title: string; subtitle: string; className: string; abbr: string }> = {
  0: { title: 'Team Captain', subtitle: 'Primary contact', className: 'role-captain', abbr: '01' },
  1: { title: 'Second Member', subtitle: 'Co-developer',   className: 'role-second',  abbr: '02' },
  2: { title: 'Third Member',  subtitle: 'Team member',    className: 'role-third',   abbr: '03' },
}

interface Props {
  index: number
  /** @deprecated use showSchool instead */
  isOfficial?: boolean
  /** When true renders the school / university field inside this card */
  showSchool?: boolean
}

export default function MemberFieldGroup({ index, isOfficial, showSchool }: Props) {
  const { control, watch } = useFormContext<RegistrationFormValues>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctrl        = control as any
  const tshirtSize  = watch(`members.${index}.tshirtSize` as any)
  const role        = ROLE_LABELS[index]
  const renderSchool = showSchool ?? isOfficial ?? false

  return (
    <div className="member-card animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="member-card-header">
        <div className={`member-role-icon ${role.className}`}>{role.abbr}</div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {role.title}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{role.subtitle}</p>
        </div>
      </div>

      <div className="member-card-body">
        <FormInput
          name={`members.${index}.fullName`}
          control={ctrl}
          label="Full Name"
          placeholder="Ahmed Benali"
          required
        />
        <FormInput
          name={`members.${index}.email`}
          control={ctrl}
          label="Email Address"
          placeholder="ahmed@example.com"
          type="email"
          required
        />
        <FormInput
          name={`members.${index}.phone`}
          control={ctrl}
          label="Phone Number"
          placeholder="0612345678"
          type="tel"
          required
          onChangeFilter={sanitizePhone}
        />
        <FormSelect
          name={`members.${index}.tshirtSize`}
          control={ctrl}
          label="T-Shirt Size"
          options={TSHIRT_OPTIONS}
          required
        />

        {tshirtSize === 'OTHER' && (
          <FormInput
            name={`members.${index}.tshirtSizeCustom`}
            control={ctrl}
            label="Custom T-Shirt Size"
            placeholder="e.g. 3XL, Kids M..."
            required
            className="col-span-2"
          />
        )}

        {renderSchool && (
          <FormInput
            name={`members.${index}.schoolName`}
            control={ctrl}
            label="School / University"
            placeholder="INPT Rabat"
            className="col-span-2"
          />
        )}
      </div>
    </div>
  )
}
