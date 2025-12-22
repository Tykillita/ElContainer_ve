// AutoStepper demo removed
// This file is intentionally left as a small stub for history and reference.

export default function AutoStepperDemo() {
  // Demo removed — use the `AutoStepper` component directly in your pages.
  return null;
}
 
      padding: '2rem', 
      backgroundColor: '#0f0f0f', 
      color: 'white',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ 
          color: '#fb923c', 
          fontSize: '2.5rem',
          fontWeight: '800',
          marginBottom: '1rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          <TypewriterForAutoStepper 
            text="Demo: AutoStepper con Animación Typewriter"
            speed={40}
            delay={100}
            restartTrigger="demo-header"
          />
        </h1>
        <p style={{ 
          color: 'rgba(255,255,255,0.8)', 
          fontSize: '1.1rem',
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Este demo muestra cómo la animación de máquina de escribir se integra perfectamente 
          con el AutoStepper original, añadiendo efectos visuales atractivos sin comprometer 
          la funcionalidad.
        </p>
      </div>

      {/* Controls */}
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto 3rem auto',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h3 style={{ color: '#fb923c', marginBottom: '1rem' }}>
          <TypewriterForAutoStepper 
            text="Controles de Demo"
            speed={60}
            delay={500}
            restartTrigger="controls-header"
          />
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>
              <input 
                type="checkbox"
                checked={typewriterEnabled}
                onChange={(e) => setTypewriterEnabled(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Habilitar Efecto Typewriter
            </label>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>
              Velocidad: {typewriterSpeed}ms por carácter
            </label>
            <input 
              type="range"
              min="10"
              max="150"
              value={typewriterSpeed}
              onChange={(e) => setTypewriterSpeed(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>
              Retraso: {typewriterDelay}ms
            </label>
            <input 
              type="range"
              min="0"
              max="1000"
              step="50"
              value={typewriterDelay}
              onChange={(e) => setTypewriterDelay(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ 
          color: '#fb923c', 
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontSize: '1.5rem'
        }}>
          AutoStepper {typewriterEnabled ? 'Con' : 'Sin'} Animación Typewriter
        </h2>

        {/* AutoStepper Demo */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          padding: '1rem',
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '2rem'
        }}>
          <AutoStepper 
            steps={demoSteps}
            typewriterEnabled={typewriterEnabled}
            typewriterSpeed={typewriterSpeed}
            typewriterDelay={typewriterDelay}
          />
        </div>

        {/* Features Explanation */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <h3 style={{ color: '#fb923c', marginBottom: '1rem' }}>
            Características de la Integración
          </h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <h4 style={{ color: '#fb923c', fontSize: '1rem', marginBottom: '0.5rem' }}>
                ✅ Integración Perfecta
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                La animación typewriter se integra seamlessly con el AutoStepper original, 
                manteniendo toda la funcionalidad existente.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#fb923c', fontSize: '1rem', marginBottom: '0.5rem' }}>
                ✅ Personalizable
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                Control total sobre la velocidad, retraso y activación/desactivación 
                de los efectos de typewriter.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#fb923c', fontSize: '1rem', marginBottom: '0.5rem' }}>
                ✅ Secuencia Sincronizada
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                El título aparece primero, seguido de la descripción con un retraso 
                inteligente basado en la longitud del texto.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#fb923c', fontSize: '1rem', marginBottom: '0.5rem' }}>
                ✅ Sin Impacto en Performance
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                Usa requestAnimationFrame para animaciones suaves y eficientes, 
                sin afectar el rendimiento del componente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div style={{ 
        maxWidth: '800px', 
        margin: '3rem auto 0 auto',
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h3 style={{ color: '#fb923c', marginBottom: '1rem' }}>
          Código de Uso
        </h3>
        
        <pre style={{ 
          color: '#00ff00', 
          fontSize: '0.9rem',
          overflow: 'auto',
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: '1rem',
          borderRadius: '8px',
          lineHeight: '1.4'
        }}>
{`import AutoStepper from './components/AutoStepper';

const pasos = [
  {
    title: "Tu Título Aquí",
    desc: "Tu descripción detallada aquí..."
  },
  // ... más pasos
];

// Con efectos typewriter (por defecto habilitado)
<AutoStepper 
  steps={pasos}
  typewriterEnabled={true}
  typewriterSpeed={50}
  typewriterDelay={300}
/>

// Sin efectos typewriter
<AutoStepper 
  steps={pasos}
  typewriterEnabled={false}
/>`}
        </pre>
      </div>

      {/* Navigation Hint */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          💡 <strong>Tip:</strong> Los pasos cambian automáticamente cada 8 segundos. 
          También puedes hacer clic en los números para navegar manualmente.
        </p>
      </div>
    </div>
  );
}