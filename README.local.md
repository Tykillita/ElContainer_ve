# elcontainer-ve-web

Starter Vite + React + TypeScript + Tailwind scaffold inspirado en la estructura solicitada.

## Scripts
- `npm install` o `pnpm install`
- `npm run dev` corre el servidor en modo desarrollo
- `npm run build` genera la carpeta `dist`
- `npm run preview` sirve el build
- `npm run lint` ejecuta ESLint

## Estructura
- `src/` codigo de la app (components, pages, context, lib, styles)
- `supabase/` espacio para schemas y seeds
- Archivos de docs: arquitectura, checklist de despliegue, quick start, etc.

## Loading Animations and Skeleton Loaders

The project includes comprehensive loading animations and skeleton loaders:

### Components
- `LoadingAnimation.tsx` - Main loading animation component with multiple variants (spinner, dots, pulse, beams, typewriter)
- `PageLoader.tsx` - Full-page loader with both full-screen and skeleton modes
- `PageSkeletonLoader` - Comprehensive page skeleton with header, content, and footer sections
- `SkeletonLoader` - Basic skeleton loader for content sections
- `LoadingContext.tsx` - Context for managing loading state across components

### Usage Examples

1. **Full-page loading** - Integrated in `App.tsx` to show loading animation on initial page load
2. **Content loading** - See `Home.tsx` for example of skeleton loader during content loading
3. **Component loading** - Use `SkeletonLoader` for individual components while loading data

### PageLoader Component

```tsx
<PageLoader loading={showLoader} type="full-screen">
  {/* Your page content */}
</PageLoader>
```

### Loading Context

To ensure the loading animation doesn't finish until the page has completely rendered, use the LoadingContext:

```tsx
// In your components
import { useLoading } from './context/LoadingContext';

function MyComponent() {
  const { registerComponent, unregisterComponent, markComponentReady } = useLoading();
  
  useEffect(() => {
    const id = 'my-component';
    registerComponent(id);
    
    // Mark component as ready when it finishes loading
    markComponentReady(id);
    
    return () => unregisterComponent(id);
  }, []);
}
```

### Loading Hooks

For easier integration, you can use the provided hooks:

```tsx
// Auto-mark component as ready
import { useComponentReady } from './context/LoadingContext';

function MyComponent() {
  useComponentReady('my-component'); // Automatically marks as ready
  
  return <div>My Component Content</div>;
}

// Manually mark component as ready
import { useManualReady } from './context/LoadingContext';

function MyAsyncComponent() {
  const { ready, markReady } = useManualReady('my-async-component');
  
  useEffect(() => {
    // Simulate async operation
    const timer = setTimeout(() => {
      markReady(); // Manually mark as ready
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [markReady]);
  
  return <div>{ready ? 'Ready!' : 'Loading...'}</div>;
}
```

### Skeleton Loaders

For page-level skeleton:
```tsx
<PageSkeletonLoader items={5} header={true} content={true} footer={true} sidebar={false} />
```

For content sections:
```tsx
<SkeletonLoader lines={3} avatar={true} />
```

These components provide smooth loading experiences with skeleton loaders that match your design aesthetic.
