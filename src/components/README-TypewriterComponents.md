# Componentes de Máquina de Escribir para AutoStepper

Este directorio contiene componentes especializados para crear efectos de animación de máquina de escribir en el AutoStepper.

## Componentes Disponibles

### 1. `TypewriterForAutoStepper.tsx`

Componente principal de máquina de escribir diseñado específicamente para trabajar con AutoStepper.

#### Props:

- `text` (string): El texto a animar
- `speed` (number, opcional): Velocidad en ms por carácter (default: 50)
- `delay` (number, opcional): Retraso antes de comenzar en ms (default: 0)
- `className` (string, opcional): Clases CSS adicionales
- `onTypeStart` (function, opcional): Callback cuando comienza la animación
- `onTypeComplete` (function, opcional): Callback cuando termina la animación
- `restartTrigger` (number|string|object, opcional): Cuando cambia, reinicia la animación
- `showCursor` (boolean, opcional): Mostrar cursor parpadeante (default: true)

#### Características:

- ✅ Sincronización automática con cambios de paso
- ✅ Cursor parpadeante personalizable
- ✅ Callbacks para control de estado
- ✅ Reinicio automático cuando cambia el texto
- ✅ Optimizado para el tema visual de AutoStepper

### 2. `AutoStepper.tsx` (Mejorado)

**El AutoStepper original ahora incluye integración opcional de efectos typewriter.**

#### Props:

- `steps` (StepData[]): Array de pasos con `title` y `desc`
- `typewriterEnabled` (boolean, opcional): Habilitar/deshabilitar efectos typewriter (default: true)
- `typewriterSpeed` (number, opcional): Velocidad de la máquina de escribir (default: 50)
- `typewriterDelay` (number, opcional): Retraso antes de comenzar (default: 300)

#### Características:

- ✅ **Retrocompatibilidad total** - Funciona exactamente como antes
- ✅ **Efectos typewriter opcionales** - Se pueden habilitar/deshabilitar
- ✅ Animación de título y descripción
- ✅ Secuencia sincronizada (título → descripción)
- ✅ Auto-avance cada 8 segundos
- ✅ Compatible con todos los indicadores del Stepper
- ✅ Estilos optimizados para tema naranja

### 3. `TypewriterExamples.tsx`

Ejemplos adicionales de uso de los componentes typewriter con diferentes configuraciones y casos de uso.

#### Características:

- ✅ Ejemplos de typewriter básico
- ✅ Controles interactivos
- ✅ Secuencias sincronizadas
- ✅ Callbacks y control de estado
- ✅ Casos de uso avanzados

### 4. `AutoStepperDemo.tsx`

Demo interactivo que muestra la integración del typewriter con el AutoStepper original.

#### Características:

- ✅ Comparación lado a lado (con/sin typewriter)
- ✅ Controles interactivos en tiempo real
- ✅ Ejemplos de código
- ✅ Documentación visual integrada

## Uso Básico

### Usando TypewriterForAutoStepper directamente:

```tsx
import TypewriterForAutoStepper from './components/TypewriterForAutoStepper';

function MiComponente() {
  return (
    <div>
      <h2>
        <TypewriterForAutoStepper 
          text="¡Bienvenido a nuestro servicio!"
          speed={40}
          delay={500}
          onTypeComplete={() => console.log('¡Completado!')}
          restartTrigger={ Date.now() }
        />
      </h2>
    </div>
  );
}
```

### Usando AutoStepper Mejorado:

```tsx
import AutoStepper from './components/AutoStepper';

const pasos = [
  {
    title: "Paso 1: Planificación",
    desc: "Definimos los objetivos y requisitos de tu proyecto."
  },
  {
    title: "Paso 2: Diseño",
    desc: "Creamos mockups y prototipos interactivos."
  },
  {
    title: "Paso 3: Desarrollo",
    desc: "Implementamos la solución con las mejores tecnologías."
  }
];

function MiAutoStepper() {
  return (
    <AutoStepper
      steps={pasos}
      typewriterEnabled={true}        // Habilitar efectos typewriter
      typewriterSpeed={45}            // Velocidad personalizada
      typewriterDelay={300}           // Retraso personalizado
    />
  );
}

// Ejemplo sin efectos typewriter (retrocompatible)
function AutoStepperSimple() {
  return (
    <AutoStepper
      steps={pasos}
      typewriterEnabled={false}       // Deshabilitar efectos
    />
  );
}
```

### Demo Interactivo:

```tsx
import AutoStepperDemo from './components/AutoStepperDemo';

function PaginaDemo() {
  return <AutoStepperDemo />;
}
```

## Personalización

### Estilos CSS Personalizados:

El cursor y las animaciones usan las siguientes clases CSS que puedes sobrescribir:

```css
/* Cursor parpadeante */
@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.typewriter-cursor.cursor-visible {
  opacity: 1;
}

.typewriter-cursor.cursor-blink {
  animation: cursor-blink 1s infinite;
}

/* Personalizar color del cursor */
.typewriter-cursor {
  color: #fb923c; /* Cambiar por tu color preferido */
}
```

### Control Avanzado:

```tsx
// Ejemplo con control de estado avanzado
import { useState } from 'react';
import TypewriterForAutoStepper from './components/TypewriterForAutoStepper';

function ControlAvanzado() {
  const [trigger, setTrigger] = useState(0);
  const [texto, setTexto] = useState("Texto inicial");

  const reiniciar = () => {
    setTrigger(prev => prev + 1);
    setTexto("Nuevo texto a animar");
  };

  return (
    <div>
      <TypewriterForAutoStepper 
        text={texto}
        restartTrigger={trigger}
        onTypeStart={() => console.log('Iniciando...')}
        onTypeComplete={() => console.log('¡Terminado!')}
      />
      <button onClick={reiniciar}>Reiniciar Animación</button>
    </div>
  );
}
```

## Consideraciones de Rendimiento

- El componente usa `requestAnimationFrame` para animaciones suaves
- Se limpia automáticamente en unmount para prevenir memory leaks
- Optimizado para texto de hasta 1000 caracteres
- Compatible con React 18+ y TypeScript

## Integración con AutoStepper Original

Si prefieres mantener el AutoStepper original y solo agregar efectos de máquina de escribir, puedes usar el componente TypewriterForAutoStepper directamente dentro de tu implementación existente:

```tsx
import TypewriterForAutoStepper from './TypewriterForAutoStepper';

// Dentro de tu componente AutoStepper existente
<div className="step-title">
  <TypewriterForAutoStepper 
    text={step.title}
    restartTrigger={current}
    speed={50}
  />
</div>
<div className="step-description">
  <TypewriterForAutoStepper 
    text={step.desc}
    restartTrigger={current}
    speed={60}
    delay={200}
  />
</div>
```

## Archivos Relacionados

- `src/components/TypewriterForAutoStepper.tsx` - Componente de máquina de escribir principal
- `src/components/AutoStepper.tsx` - AutoStepper mejorado con integración typewriter
- `src/components/AutoStepperDemo.tsx` - Demo interactivo de la integración
- `src/components/TypewriterExamples.tsx` - Ejemplos adicionales de uso
- `src/styles/autosteper.css` - Estilos específicos para AutoStepper
- `src/components/Stepper.tsx` - Componente Stepper base