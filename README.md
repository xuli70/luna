# 🌙 Lunar Position App

Aplicación web interactiva para calcular y visualizar la posición de la Luna desde cualquier punto de la Tierra.

## ✨ Características

- **🗺️ Selección de ubicación**: Búsqueda por dirección, ciudad, coordenadas o clic en mapa
- **⏰ Configuración temporal**: Selector de fecha, hora y zona horaria con manejo automático
- **🌙 Cálculos astronómicos**: Altitud, azimut, fase lunar, porcentaje de iluminación, horarios de salida/puesta
- **🗺️ Visualización 2D**: Mapa interactivo con flecha direccional de la Luna
- **🌌 Visualización 3D**: Domo celeste con posición lunar interactiva
- **📱 Responsive**: Optimizado para móvil, tablet y escritorio
- **🌃 Dark Mode**: Estética espacial nocturna optimizada para observación

## 🚀 Instalación y Deploy

### Prerrequisitos
- Node.js 18+ 
- pnpm (recomendado) o npm

### Instalación local
```bash
# Clonar el repositorio
git clone https://github.com/xuli70/luna.git
cd luna

# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev

# Construir para producción
pnpm build

# Vista previa del build
pnpm preview
```

### Deploy en Coolify

1. **Push a GitHub**: Sube el código a tu repositorio
2. **Coolify Dashboard**: 
   - Ve a tu dashboard de Coolify
   - Clic en "New Project"
   - Selecciona "Build & Deploy"
   - Conecta tu repositorio GitHub
   - Configura:
     - **Build Command**: `pnpm build`
     - **Output Directory**: `dist`
     - **Node Version**: 18.x
3. **Deploy**: Coolify automáticamente construirá y desplegará la aplicación
4. **Dominio**: Configura tu dominio personalizado en Coolify

### Variables de entorno (opcional)
Si necesitas configurar variables de entorno, Créalas en Coolify:
- `NODE_ENV=production`
- `BUILD_MODE=prod`

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Design System
- **Cálculos astronómicos**: SunCalc
- **Mapas**: Leaflet + OpenStreetMap  
- **3D**: Three.js
- **Zonas horarias**: Luxon
- **Componentes**: Radix UI + Shadcn/ui

## 📁 Estructura del proyecto

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes UI (shadcn/ui)
│   ├── Moon3DViewer.tsx # Visualizador 3D lunar
│   ├── MapView.tsx      # Mapa interactivo
│   ├── LocationSearch.tsx # Búsqueda de ubicación
│   ├── TimeConfig.tsx   # Configuración temporal
│   └── ResultsPanel.tsx # Panel de resultados
├── hooks/               # Custom hooks
├── lib/                 # Utilidades y configuraciones
├── services/            # APIs y servicios
├── types/               # Definiciones TypeScript
├── utils/               # Funciones utilitarias
├── App.tsx              # Componente principal
└── main.tsx             # Punto de entrada
```

## 🎨 Diseño

- **Paleta**: Modo oscuro con acentos cyan (#00d4ff) y ámbar lunar (#ffb800)
- **Tipografía**: Space Grotesk (display), Inter (body), JetBrains Mono (datos)
- **Responsive**: Desktop (grid 3 cols), Tablet (2 cols), Mobile (stack)

## 📊 Datos astronómicos

La aplicación calcula en tiempo real:
- **Altitud lunar**: Ángulo sobre el horizonte (-90° a 90°)
- **Azimut lunar**: Dirección cardinal (0° = Norte, 90° = Este)
- **Fase lunar**: Nueva, creciente, llena, menguante
- **Iluminación**: Porcentaje de la superficie lunar iluminada
- **Horarios**: Hora de salida y puesta de la Luna

## 🔧 Comandos útiles

```bash
# Desarrollo
pnpm dev              # Servidor de desarrollo
pnpm build            # Construir para producción  
pnpm preview          # Vista previa del build
pnpm lint             # Linter
pnpm clean            # Limpiar dependencias

# Deployment
pnpm build:prod       # Build optimizado para producción
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (stack vertical)
- **Tablet**: 768px - 1024px (grid 2 columnas)
- **Desktop**: > 1024px (grid 3 columnas, split 60/40 visualizaciones)

## 🌟 Características especiales

- **Geolocalización**: Detecta automáticamente la ubicación del usuario
- **Búsqueda inteligente**: Autocompletado para ciudades y direcciones
- **Actualización en tiempo real**: Cambios instantáneos al modificar parámetros
- **Animaciones**: Transiciones suaves y contadores animados
- **Accesibilidad**: Soporte completo para teclado y lectores de pantalla

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**Desarrollado con ❤️ para observar la Luna desde cualquier lugar de la Tierra** 🌙