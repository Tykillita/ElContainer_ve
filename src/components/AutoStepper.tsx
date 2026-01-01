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
      <Stepper
        initialStep={current}
        disableStepIndicators={false}
        nextButtonText=""
        backButtonText=""
        onStepChange={setCurrent}
        footerClassName="footer-container"
        className="auto-stepper"
        stepCircleContainerClassName="step-circle-container"
        stepContainerClassName="step-indicator-row"
        contentClassName="step-content"
      >
        {/* Cada paso es solo el contenido, no una tarjeta */}
        {steps.map((step, idx) => (
          <div key={idx} className="step-item card-ripple" style={{display: current === idx + 1 ? 'block' : 'none'}}>
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
                  speed={optimizedTypewriterSpeed * 1.2}
                  delay={optimizedDelay + (step.title.length * optimizedTypewriterSpeed) + 500}
                  restartTrigger={stepChangeTriggerRef.current}
                  className="typewriter-description"
                />
              ) : (
                step.desc
              )}
            </p>
          </div>
        ))}
      </Stepper>
    </FloatingElement>
  );
}