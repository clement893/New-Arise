import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Stepper from '../Stepper';
import type { Step } from '../Stepper';

describe('Stepper', () => {
  const steps: Step[] = [
    { id: '1', label: 'Step 1' },
    { id: '2', label: 'Step 2' },
    { id: '3', label: 'Step 3' },
  ];

  it('renders all steps', () => {
    render(<Stepper steps={steps} currentStep={1} />);

    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  it('marks current step correctly', () => {
    render(<Stepper steps={steps} currentStep={1} />);

    const step2 = screen.getByText('Step 2').closest('button');
    expect(step2).toHaveAttribute('aria-current', 'step');
  });

  it('shows step numbers when enabled', () => {
    render(<Stepper steps={steps} currentStep={1} showStepNumbers={true} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

