import { useEffect, useState, useRef } from 'react';
import Stepper from './Stepper';
import TypewriterForAutoStepper from './TypewriterForAutoStepper';
import { useMobileOptimization } from '../hooks/useMobileOptimization';
import FloatingElement from './FloatingElement';
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
  const { isMobile } = useMobileOptimization();
  
  // Optimizar velocidades para móviles
  const optimizedTypewriterSpeed = isMobile ? typewriterSpeed * 1.5 : typewriterSpeed;
  const optimizedDelay = isMobile ? typewriterDelay * 0.8 : typewriterDelay;
  const optimizedStepDuration = isMobile ? 12000 : 8000; // Más lento en móviles

  // Auto-advance to next step - más lento en móviles para mejor rendimiento
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setCurrent((prev) => {
        const next = prev >= steps.length ? 1 : prev + 1;
        return next;
      });
    }, optimizedStepDuration);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, steps.length, optimizedStepDuration]);

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
    <FloatingElement delay={current * 0.1} duration={6}>
      <div className="auto-stepper card space-y-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 md:p-8 lg:p-9 pr-1 sm:pr-0 text-base shadow-[0_22px_80px_rgba(0,0,0,0.28)] h-full min-h-[260px] flex flex-col card-floating-particles">
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
                <div key={index} className="step-item card-ripple">
                  <h2 className="step-title">
                    {typewriterEnabled ? (
                      <TypewriterForAutoStepper
                        text={step.title}
                        speed={optimizedTypewriterSpeed}
                        delay={optimizedDelay}
                        restartTrigger={stepChangeTriggerRef.current}
                        onTypeComplete={handleTitleComplete}
                        className="typewriter-title"
                      />
                    ) : (
                      <span>{step.title}</span>
                    )}
                  </h2>
                  <p className="step-description interactive-element">
                    {typewriterEnabled ? (
                      <TypewriterForAutoStepper
                        text={step.desc}
                        speed={optimizedTypewriterSpeed * 1.2} // Slightly slower for description
                        delay={optimizedDelay + (step.title.length * optimizedTypewriterSpeed) + 500}
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
    </FloatingElement>
  );
}