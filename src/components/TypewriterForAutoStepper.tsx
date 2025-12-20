import { useEffect, useRef, useState, useCallback } from 'react';

interface TypewriterForAutoStepperProps {
  text: string;
  speed?: number; // ms per character
  delay?: number; // delay before starting (ms)
  className?: string;
  onTypeStart?: () => void;
  onTypeComplete?: () => void;
  restartTrigger?: number | string | object; // when this changes, restart the animation
  showCursor?: boolean; // whether to show blinking cursor
}

export default function TypewriterForAutoStepper({
  text,
  speed = 50,
  delay = 0,
  className,
  onTypeStart,
  onTypeComplete,
  restartTrigger,
  showCursor = true
}: TypewriterForAutoStepperProps) {
  const [displayed, setDisplayed] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursorState, setShowCursorState] = useState(showCursor);
  const frameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const cursorIntervalRef = useRef<number | null>(null);

  const resetAnimation = useCallback(() => {
    setDisplayed('');
    setIsTyping(false);
    doneRef.current = false;
    
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    if (!text) {
      if (onTypeComplete && !doneRef.current) {
        onTypeComplete();
        doneRef.current = true;
      }
      return;
    }

    // Set initial state
    setIsTyping(true);
    if (onTypeStart) onTypeStart();

    // Delay before starting
    timeoutRef.current = window.setTimeout(() => {
      let i = 0;
      let lastTime = performance.now();
      
      const step = () => {
        const now = performance.now();
        if (now - lastTime >= speed) {
          i++;
          setDisplayed(text.slice(0, i));
          lastTime = now;
        }
        
        if (i < text.length) {
          frameRef.current = requestAnimationFrame(step);
        } else {
          // Animation complete
          setIsTyping(false);
          if (onTypeComplete && !doneRef.current) {
            onTypeComplete();
            doneRef.current = true;
          }
        }
      };
      
      frameRef.current = requestAnimationFrame(step);
    }, delay);
  }, [text, speed, delay, onTypeStart, onTypeComplete]);

  // Restart animation when restartTrigger changes
  useEffect(() => {
    if (restartTrigger !== undefined) {
      resetAnimation();
      startAnimation();
    }
  }, [restartTrigger, startAnimation, resetAnimation]);

  // Cursor blinking effect
  useEffect(() => {
    if (showCursor && isTyping) {
      cursorIntervalRef.current = window.setInterval(() => {
        setShowCursorState(prev => !prev);
      }, 530); // Standard cursor blink rate
    } else {
      setShowCursorState(showCursor);
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
        cursorIntervalRef.current = null;
      }
    }

    return () => {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
        cursorIntervalRef.current = null;
      }
    };
  }, [showCursor, isTyping]);

  // Start animation on mount and when text changes
  useEffect(() => {
    resetAnimation();
    startAnimation();
    
    return () => {
      resetAnimation();
    };
  }, [text, speed, delay, startAnimation, resetAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetAnimation();
    };
  }, [resetAnimation]);

  return (
    <span className={className}>
      {displayed}
      {showCursor && (
        <span 
          className={`typewriter-cursor ${isTyping ? 'cursor-visible' : 'cursor-blink'}`}
          style={{
            display: showCursorState ? 'inline' : 'none',
            marginLeft: '1px',
            fontWeight: 'bold',
            color: '#fb923c', // orange-400 to match AutoStepper theme
            animation: isTyping ? 'none' : 'cursor-blink 1s infinite'
          }}
        >
          |
        </span>
      )}
    </span>
  );
}
