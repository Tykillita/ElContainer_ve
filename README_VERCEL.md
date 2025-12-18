# Deploy en Vercel - ElContainerVE

## 🚀 Guía de Deployment

Este proyecto está configurado para deploy automático en Vercel con todas las optimizaciones necesarias.

## ✅ Archivos de Configuración

### Archivos Esenciales para Vercel:
- ✅ `vercel.json` - Configuración específica de Vercel
- ✅ `.nvmrc` - Especifica Node.js 18
- ✅ `.npmrc` - Configuración de npm con legacy-peer-deps
- ✅ `package.json` - Overrides para dependencias conflictivas
- ✅ `.gitignore` - Ignora archivos innecesarios
- ✅ `.env.example` - Template completo de variables de entorno

## 🔧 Configuración en Vercel

### 1. Conectar Repositorio
1. Ir a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Conectar tu repositorio de GitHub/GitLab
4. Vercel detectará automáticamente la configuración de `vercel.json`

### 2. Configuración Automática
Vercel detectará automáticamente:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: 18 (desde `.nvmrc`)

### 3. Variables de Entorno Requeridas
En el dashboard de Vercel, agregar estas variables:

```bash
# Obligatorias
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_key

# Opcionales
VITE_API_BASE_URL=https://tu-api.com
VITE_GOOGLE_ANALYTICS_ID=UA-XXXXXXXX-X
VITE_SENTRY_DSN=tu_sentry_dsn
```

### 4. Variables de Sistema (Opcionales)
```bash
NODE_VERSION=18
NPM_FLAGS=--legacy-peer-deps
```

## 🛠️ Build Process

### Proceso Automático:
1. **Install**: `npm install --legacy-peer-deps`
2. **Type Check**: `tsc -b`
3. **Build**: `vite build`
4. **Deploy**: Archivos en `dist/` se despliegan automáticamente

### Verificación de Build:
```bash
# Local test
npm run build

# Should output:
# ✓ built in Xs
# dist/index.html created
# assets/ directory populated
```

## 🔍 Troubleshooting

### Build Falla en Vercel

#### 1. Verificar Logs de Build
```bash
# En Vercel Dashboard > Functions > Build Logs
# Buscar errores específicos:
```

#### 2. Problemas Comunes y Soluciones:

**Error: "Cannot find module '@vitejs/plugin-react-swc'"**
- ✅ **Solucionado**: `legacy-peer-deps=true` en `.npmrc`

**Error: "peer dependency warnings"**
- ✅ **Solucionado**: Overrides en `package.json`

**Error: "Build failed"**
- ✅ **Solucionado**: `vercel.json` con configuración explícita

**Error: "Output directory not found"**
- ✅ **Solucionado**: `outputDirectory: "dist"` en `vercel.json`

#### 3. Variables de Entorno
- ✅ Verificar que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configuradas
- ✅ No agregar variables con prefijos incorrectos (usar `VITE_` para frontend)

#### 4. Node.js Version
- ✅ `.nvmrc` fuerza Node.js 18
- ✅ Verificar que no hay conflictos con versiones de npm

### Performance Issues

#### Optimizaciones Incluidas:
- ✅ **Tree Shaking**: Vite elimina código no usado
- ✅ **Code Splitting**: Configurado automáticamente
- ✅ **Asset Optimization**: Compresión gzip habilitada
- ✅ **Cache Headers**: Configurados en `vercel.json`

#### Warnings Comunes:
```bash
# Warning: "Some chunks are larger than 500 kB"
# ✅ Normal con @react-three/fiber y three.js
# ✅ Considerado en las optimizaciones del proyecto
```

## 📁 Estructura de Archivos para Vercel

```
├── .env.example          # Template de variables
├── .gitignore           # Archivos ignorados
├── .nvmrc               # Node.js 18
├── .npmrc               # npm config
├── package.json         # Dependencias y scripts
├── vercel.json          # Configuración de Vercel
├── src/                 # Código fuente
├── public/              # Assets estáticos
└── dist/                # Build output (generado)
```

## 🔄 CI/CD Pipeline

### Git Workflow:
```bash
# Push a main branch
git push origin main

# Vercel detecta automáticamente el cambio
# Deploys automáticamente en ~2-3 minutos
```

### Branch Previews:
- ✅ **Pull Requests**: Deploy automático en URLs de preview
- ✅ **Feature Branches**: Deploy automático para testing

## 📊 Monitoring

### Vercel Analytics:
- ✅ **Core Web Vitals**: Monitoreo automático
- ✅ **Performance**: Métricas en tiempo real
- ✅ **Errors**: Captura automática de errores

### Integración con Sentry (Opcional):
```bash
VITE_SENTRY_DSN=tu_sentry_dsn
```

## 🚨 Seguridad

### Variables de Entorno:
- ✅ **Frontend**: Solo variables con prefijo `VITE_`
- ✅ **Backend**: Variables del servidor (no incluidas)
- ✅ **Sensitive Data**: Nunca en el repositorio

### Git Security:
- ✅ **`.env`**: Ignorado (archivos reales)
- ✅ **`.env.example`**: Template público
- ✅ **Keys**: Solo en variables de Vercel

## 📞 Soporte

### Si el Deploy Falla:
1. **Revisar Build Logs** en Vercel Dashboard
2. **Verificar Variables** de entorno
3. **Local Test**: `npm run build && npm run preview`
4. **Consultar**: `VERCEL_BUILD_FIX.md` para troubleshooting avanzado

### Contacto:
- 📧 Issues en GitHub
- 📖 Documentación en `DEPENDENCY_FIXES.md`

---

## ✅ Checklist Pre-Deploy

- [ ] `vercel.json` configurado
- [ ] `.nvmrc` con Node.js 18
- [ ] `.npmrc` con legacy-peer-deps
- [ ] `package.json` con overrides
- [ ] `.gitignore` actualizado
- [ ] `.env.example` completo
- [ ] Variables de entorno en Vercel
- [ ] Build local exitoso: `npm run build`
- [ ] Sin errores de TypeScript: `tsc --noEmit`

**¡Listo para deploy! 🚀**