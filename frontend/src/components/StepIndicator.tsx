import { CheckIcon } from 'lucide-react'
import type { ElementType } from 'react'

interface Step {
  label: string
  number: number
  icon?: ElementType
}

interface Props {
  steps: Step[]
  current: number
}

export default function StepIndicator({ steps, current }: Props) {
  return (
    <div className="steps" style={{ paddingBottom: '2rem' }}>
      {steps.map((step, i) => {
        const isDone   = current > step.number
        const isActive = current === step.number
        const isLast   = i === steps.length - 1

        return (
          <div key={step.number} className="step-item">
            <div style={{ position: 'relative' }}>
              <div className={`step-circle ${isDone ? 'done' : isActive ? 'active' : 'inactive'}`}>
                {isDone ? <CheckIcon size={14} /> : step.number}
              </div>
              <span className={`step-label ${isActive ? 'active' : ''}`}>{step.label}</span>
            </div>
            {!isLast && (
              <div className={`step-connector ${isDone ? 'done' : ''}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
