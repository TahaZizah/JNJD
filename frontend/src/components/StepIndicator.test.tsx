import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StepIndicator from './StepIndicator'

describe('StepIndicator', () => {
  const steps = [
    { label: 'Step 1', number: 1 },
    { label: 'Step 2', number: 2 },
    { label: 'Step 3', number: 3 },
  ]

  it('renders all steps', () => {
    render(<StepIndicator steps={steps} current={1} />)
    
    expect(screen.getByText('Step 1')).toBeInTheDocument()
    expect(screen.getByText('Step 2')).toBeInTheDocument()
    expect(screen.getByText('Step 3')).toBeInTheDocument()
  })

  it('marks current step as active', () => {
    const { container } = render(<StepIndicator steps={steps} current={2} />)
    
    const activeLabel = screen.getByText('Step 2')
    expect(activeLabel).toHaveClass('active')
    
    const activeCircle = activeLabel.previousElementSibling
    expect(activeCircle).toHaveClass('active')
    
    const inactiveLabel = screen.getByText('Step 3')
    expect(inactiveLabel).not.toHaveClass('active')
  })

  it('marks previous steps as done', () => {
    const { container } = render(<StepIndicator steps={steps} current={2} />)
    
    const doneLabel = screen.getByText('Step 1')
    expect(doneLabel).not.toHaveClass('active')
    
    const doneCircle = doneLabel.previousElementSibling
    expect(doneCircle).toHaveClass('done')
    // done circles render a CheckIcon instead of the number
    expect(doneCircle).not.toHaveTextContent('1')
  })
})
