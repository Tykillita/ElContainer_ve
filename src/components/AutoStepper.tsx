import { useEffect, useState, useRef } from 'react';
import Stepper from './Stepper';
import TypewriterForAutoStepper from './TypewriterForAutoStepper';
import '../styles/autosteper.css';

interface StepData {
  title: string;
  desc: string;
}

interface AutoStepperProps {
  steps: StepData[];
  typewriterEnabled?: boolean; // Enable/disable typewriter effect
  typewriterSpeed?: number; // Speed for typewriter animation
  typewriterDelay?: number; // Delay before starting typewriter
}

export default function AutoStepper({
  steps,
  typewriterEnabled = true,
  typewriterSpeed = 50,
  typewriterDelay = 300
}: AutoStepperProps) {
  const [current, setCurrent] = useState(1);
  const timeoutRef = useRef<number | null>(null);
  const stepChangeTriggerRef = useRef(0);

  // Auto-advance to next step every 8 seconds
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setCurrent((prev) => {
        const next = prev >= steps.length ? 1 : prev + 1;
        return next;
      });
    }, 8000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, steps.length]);

  // Trigger typewriter restart when step changes
  useEffect(() => {
    if (typewriterEnabled) {
      stepChangeTriggerRef.current += 1;
    }
  }, [current, typewriterEnabled]);

  const handleTitleComplete = () => {
    // Title animation completed - could add logic here
  };

  return (
    <div className="auto-stepper card space-y-3 h-full min-h-[260px] flex flex-col p-4 md:p-5">
      <Stepper
          initialStep={current}
          disableStepIndicators={false}
          nextButtonText=""
          backButtonText=""
          onStepChange={setCurrent}
          footerClassName="footer-container"
          className="step-content"
          stepCircleContainerClassName="step-circle-container"
          stepContainerClassName="step-indicator-row"
          contentClassName="step-content-default"
          renderStepIndicator={({ step, currentStep, onStepClick }) => {
            const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';
            
            return (
              <div
                className="step-indicator"
                onClick={() => onStepClick(step)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: status === 'active' ? '#ffffff' : '#e35c27',
                  color: status === 'active' ? '#e35c27' : '#ffffff',
                  border: '2px solid #e35c27',
                  boxShadow: '0 2px 8px rgba(227, 92, 39, 0.3)',
                  fontWeight: '700',
                  fontSize: '14px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  cursor: 'pointer',
                  userSelect: 'none',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility',
                  position: 'relative',
                  zIndex: 1
                } as React.CSSProperties}
              >
                <span style={{
                  position: 'relative',
                  zIndex: 2,
                  lineHeight: 1
                } as React.CSSProperties}>
                  {step}
                </span>
              </div>
            );
          }}
        >
          {/* Render only the active step with typewriter effects */}
          {steps.map((step, index) => {
            if (current === index + 1) {
              return (
                <div key={index} className="step-item">
                  <h2 className="step-title">
                    {typewriterEnabled ? (
                      <TypewriterForAutoStepper
                        text={step.title}
                        speed={typewriterSpeed}
                        delay={typewriterDelay}
                        restartTrigger={stepChangeTriggerRef.current}
                        onTypeComplete={handleTitleComplete}
                        className="typewriter-title"
                      />
                    ) : (
                      step.title
                    )}
                  </h2>
                  <p className="step-description">
                    {typewriterEnabled ? (
                      <TypewriterForAutoStepper
                        text={step.desc}
                        speed={typewriterSpeed * 1.2} // Slightly slower for description
                        delay={typewriterDelay + (step.title.length * typewriterSpeed) + 500}
                        restartTrigger={stepChangeTriggerRef.current}
                        className="typewriter-description"
                      />
                    ) : (
                      step.desc
                    )}
                  </p>
                </div>
              );
            } else {
              return (
                <div key={`${step.title}-${current}`} className="step-item" style={{ display: 'none' }}>
                  <h2 className="step-title">{step.title}</h2>
                  <p className="step-description">{step.desc}</p>
                </div>
              );
            }
          })}
        </Stepper>
    </div>
  );
}