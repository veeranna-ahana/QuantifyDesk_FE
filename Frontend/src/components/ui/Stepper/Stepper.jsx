// src/components/ui/Stepper/Stepper.jsx
// Mirrors @UI/src/components/ui/Stepper/Stepper.tsx exactly
import React from 'react';

/**
 * Multi-step progress indicator.
 * @param {{ steps: Array<{id: number, label: string}>, currentStep: number, onStepChange: (step: number) => void }} props
 */
export function Stepper({ steps, currentStep, onStepChange }) {
  return (
    <div className="stepper">
      <div className="stepper-track">
        <div className="stepper-line" />

        {steps.map((step, index) => {
          const isActive    = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <div
              key={step.id}
              className={[
                'stepper-item',
                index === 0                                    && 'stepper-item-first',
                index === steps.length - 1                    && 'stepper-item-last',
                index > 0 && index < steps.length - 1         && 'stepper-item-middle',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <button
                type="button"
                className="stepper-button"
                onClick={() => onStepChange(step.id)}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={[
                    'stepper-indicator',
                    isActive    && 'stepper-indicator-active',
                    isCompleted && 'stepper-indicator-completed',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {String(step.id).padStart(2, '0')}
                </span>

                <span
                  className={[
                    'stepper-label',
                    isActive && 'stepper-label-active',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {step.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Stepper;
