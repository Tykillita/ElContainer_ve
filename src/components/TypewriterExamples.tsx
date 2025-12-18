import { useState } from 'react';
import TypewriterForAutoStepper from './TypewriterForAutoStepper';
import AutoStepperWithTypewriter from './AutoStepperWithTypewriter';

/**
 * Ejemplos de uso de los componentes de máquina de escribir para AutoStepper
 */

const pasosEjemplo = [
  {
    title: "Bienvenido al Servicio",
    desc: "Descubre cómo podemos ayudarte a alcanzar tus objetivos con nuestras soluciones profesionales."
  },
  {
    title: "Proceso Simplificado", 
    desc: "Nuestro método probado garantiza resultados eficientes en tiempo record."
  },
  {
    title: "Resultados Garantizados",
    desc: "Miles de clientes satisfechos confirman la calidad de nuestro servicio excepcional."
  }
];

const ejemplosTexto = [
  "¡Hola! Soy un componente de máquina de escribir.",
  "Este texto se está escribiendo carácter por carácter.",
  "Puedes personalizar la velocidad y los efectos.",
  "¡Perfecto para destacar contenido importante!"
];

export default function TypewriterExamples() {
  const [ejemploActivo, setEjemploActivo] = useState(0);
  const [textoPersonalizado, setTextoPersonalizado] = useState("Escribe algo aquí...");
  const [velocidad, setVelocidad] = useState(50);
  const [retraso, setRetraso] = useState(0);
  const [mostrarCursor, setMostrarCursor] = useState(true);

  const cambiarEjemplo = () => {
    setEjemploActivo((prev) => (prev + 1) % ejemplosTexto.length);
  };

  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#1a1a1a', 
      color: 'white',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        color: '#fb923c', 
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        Ejemplos de Componentes Typewriter para AutoStepper
      </h1>

      {/* Ejemplo 1: AutoStepper con Typewriter */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: '#fb923c', marginBottom: '1rem' }}>
          1. AutoStepper con Animación de Máquina de Escribir
        </h2>
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto',
          backgroundColor: '#2a2a2a',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <AutoStepperWithTypewriter 
            steps={pasosEjemplo}
            typewriterSpeed={45}
            typewriterDelay={200}
          />
        </div>
      </section>

      {/* Ejemplo 2: Typewriter básico */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: '#fb923c', marginBottom: '1rem' }}>
          2. Typewriter Básico - Cambio Automático
        </h2>
        <div style={{ 
          backgroundColor: '#2a2a2a', 
          padding: '1.5rem', 
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <p style={{ marginBottom: '1rem', color: '#ccc' }}>
            Texto actual: "{ejemplosTexto[ejemploActivo]}"
          </p>
          <div style={{ 
            fontSize: '1.2rem', 
            padding: '1rem',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <TypewriterForAutoStepper 
              text={ejemplosTexto[ejemploActivo]}
              speed={velocidad}
              delay={retraso}
              restartTrigger={ejemploActivo}
              showCursor={mostrarCursor}
            />
          </div>
          <button 
            onClick={cambiarEjemplo}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#fb923c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cambiar Texto
          </button>
        </div>
      </section>

      {/* Ejemplo 3: Controles interactivos */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: '#fb923c', marginBottom: '1rem' }}>
          3. Controles Interactivos
        </h2>
        <div style={{ 
          backgroundColor: '#2a2a2a', 
          padding: '1.5rem', 
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>
              Texto personalizado:
            </label>
            <input 
              type="text"
              value={textoPersonalizado}
              onChange={(e) => setTextoPersonalizado(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: '#1a1a1a',
                color: 'white',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>
              Velocidad: {velocidad}ms por carácter
            </label>
            <input 
              type="range"
              min="10"
              max="200"
              value={velocidad}
              onChange={(e) => setVelocidad(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>
              Retraso: {retraso}ms
            </label>
            <input 
              type="range"
              min="0"
              max="2000"
              step="100"
              value={retraso}
              onChange={(e) => setRetraso(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', color: '#ccc' }}>
              <input 
                type="checkbox"
                checked={mostrarCursor}
                onChange={(e) => setMostrarCursor(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Mostrar cursor parpadeante
            </label>
          </div>

          <div style={{ 
            fontSize: '1.1rem', 
            padding: '1rem',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            minHeight: '50px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <TypewriterForAutoStepper 
              text={textoPersonalizado}
              speed={velocidad}
              delay={retraso}
              restartTrigger={`${textoPersonalizado}-${velocidad}-${retraso}`}
              showCursor={mostrarCursor}
            />
          </div>
        </div>
      </section>

      {/* Ejemplo 4: Secuencias sincronizadas */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: '#fb923c', marginBottom: '1rem' }}>
          4. Secuencias Sincronizadas (Título → Descripción)
        </h2>
        <div style={{ 
          backgroundColor: '#2a2a2a', 
          padding: '1.5rem', 
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h3 style={{ color: '#fb923c', marginBottom: '0.5rem' }}>
            <TypewriterForAutoStepper 
              text="Título Principal"
              speed={60}
              delay={0}
              restartTrigger="titulo-secuencia"
            />
          </h3>
          <p style={{ color: '#ccc', lineHeight: '1.6' }}>
            <TypewriterForAutoStepper 
              text="Esta es la descripción que aparece después del título, creando una secuencia visual atractiva y profesional."
              speed={40}
              delay={1500} // Se sincroniza con el final del título
              restartTrigger="titulo-secuencia"
            />
          </p>
        </div>
      </section>

      {/* Ejemplo 5: Callbacks y control de estado */}
      <section>
        <h2 style={{ color: '#fb923c', marginBottom: '1rem' }}>
          5. Con Callbacks y Control de Estado
        </h2>
        <div style={{ 
          backgroundColor: '#2a2a2a', 
          padding: '1.5rem', 
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{ 
            fontSize: '1.1rem', 
            padding: '1rem',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            minHeight: '50px',
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <TypewriterForAutoStepper 
              text="Texto con callbacks activos"
              speed={50}
              onTypeStart={() => console.log('🚀 Animación iniciada')}
              onTypeComplete={() => console.log('✅ Animación completada')}
              restartTrigger="callbacks-ejemplo"
            />
          </div>
          <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
            Abre la consola del navegador para ver los logs de los callbacks.
          </p>
        </div>
      </section>
    </div>
  );
}