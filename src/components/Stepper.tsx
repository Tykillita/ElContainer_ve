import React, { useState, Children, useRef, useLayoutEffect, ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  header,
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  // footerClassName,
  // backButtonProps,
  // nextButtonProps,
  // backButtonText,
  // nextButtonText,
  disableStepIndicators = false,
  renderStepIndicator,
  validateStep,
  ...rest
}: {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  header?: ReactNode;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  disableStepIndicators?: boolean;
  renderStepIndicator?: (props: StepIndicatorProps) => ReactNode;
  validateStep?: (step: number) => boolean;
  [key: string]: unknown;
}) {
  const { className, ...divProps } = rest
  const [currentStep, setCurrentStep] = useState<number>(initialStep)
  // Sincroniza el paso actual con initialStep si cambia (para animación automática)
  React.useEffect(() => {
    setCurrentStep(initialStep)
  }, [initialStep])
  const [direction, setDirection] = useState<number>(0)
  const stepsArray = Children.toArray(children)
  const totalSteps = stepsArray.length
  const isCompleted = currentStep > totalSteps
  // const isLastStep = currentStep === totalSteps

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep)
    if (newStep > totalSteps) {
      onFinalStepCompleted()
    } else {
      onStepChange(newStep)
    }
  }

  // handleBack, handleNext, handleComplete eliminados porque ya no se usan

  return (
    <div className={`outer-container ${className ?? ''}`} {...divProps}>
      {header && <div className="stepper-header">{header}</div>}
      <div className={`step-circle-container ${stepCircleContainerClassName}`}>
        <div className={`step-indicator-row ${stepContainerClassName}`} style={{ flexDirection: 'row', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {stepsArray.map((_: ReactNode, index: number) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            // Validación extra: solo permite avanzar si el paso actual está completo
            const canAdvance = validateStep ? validateStep(currentStep) : true;
            const handleStepClick = (clicked: number) => {
              if (clicked > currentStep && !canAdvance) return;
              setDirection(clicked > currentStep ? 1 : -1);
              updateStep(clicked);
            };
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep,
                    onClickStep: handleStepClick
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={currentStep}
                    onClickStep={handleStepClick}
                  />
                )}
                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
              </React.Fragment>
            );
          })}
        </div>

        <div style={{ marginBottom: '1.25rem' }} />
        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={`step-content-default ${contentClassName}`}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {/* Botón de continuar eliminado, solo se muestra el botón personalizado dentro del contenido del paso */}
      </div>
    </div>
  )
}

interface StepContentWrapperProps {
  isCompleted: boolean
  currentStep: number
  direction: number
  children: ReactNode
  className?: string
}

function StepContentWrapper({ isCompleted, currentStep, direction, children, className }: StepContentWrapperProps) {
  const [parentHeight, setParentHeight] = useState<number>(0)
  const heightValue = isCompleted ? 0 : parentHeight || 'auto'

  return (
    <motion.div
      className={className}
      style={{ position: 'relative', overflow: 'hidden' }}
      animate={{ height: heightValue }}
      initial={false}
      transition={{ type: 'spring', duration: 0.4 }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition key={currentStep} direction={direction} onHeightReady={(h) => setParentHeight(h)}>
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface SlideTransitionProps {
  children: ReactNode
  direction: number
  onHeightReady: (h: number) => void
}

function SlideTransition({ children, direction, onHeightReady }: SlideTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (containerRef.current) {
      onHeightReady(containerRef.current.offsetHeight)
    }
  }, [children, onHeightReady])

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.8 }}
      style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  )
}

const stepVariants: Variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? '-100%' : '100%',
    opacity: 0
  }),
  center: {
    x: '0%',
    opacity: 1
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? '50%' : '-50%',
    opacity: 0
  })
}

interface StepProps {
  children: ReactNode
}

export function Step({ children }: StepProps): React.ReactElement {
  return <div className="step-default">{children}</div>
}

interface StepIndicatorProps {
  step: number
  currentStep: number
  onClickStep: (step: number) => void
  disableStepIndicators?: boolean
}

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators }: StepIndicatorProps) {
  const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) {
      onClickStep(step);
    }
  };

  let bg = 'rgba(255,255,255,0.12)', color = '#fff', border = 'none';
  if (status === 'active') {
    bg = '#e35c27';
    color = '#fff';
    border = '2px solid #fff';
  } else if (status === 'complete') {
    bg = '#e35c27';
    color = '#fff';
    border = '2px solid #e35c27';
  }

  return (
    <div
      onClick={handleClick}
      className="step-indicator"
      style={{ cursor: disableStepIndicators ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 0.5rem' }}
    >
      <div
        className="step-indicator-inner"
        style={{
          background: bg,
          color,
          border,
          height: '2.25rem',
          width: '2.25rem',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '1rem',
          boxShadow: status === 'active' ? '0 0 0 2px #fff' : 'none',
          transition: 'all 0.2s',
        }}
      >
        <span className="step-number">{step}</span>
      </div>
    </div>
  );
}

interface StepConnectorProps {
  isComplete: boolean
}

function StepConnector({ isComplete }: StepConnectorProps) {
  return (
    <div style={{ flex: 1, height: '0.25rem', background: isComplete ? '#e35c27' : 'rgba(255,255,255,0.25)', borderRadius: '2px', margin: '0 0.25rem', minWidth: '2rem', maxWidth: '100%' }} />
  );
}


