# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive web application for calculating and visualizing the Moon's position from any point on Earth. Built with React 18 + TypeScript + Vite, featuring real-time astronomical calculations, 2D map visualization, and 3D celestial dome representation.

## Development Commands

```bash
# Development
pnpm dev              # Install deps (prefer-offline) + start dev server
pnpm build            # Full production build (npm install + TypeScript check + Vite build)
pnpm build:prod       # Same as build, with BUILD_MODE=prod env var
pnpm preview          # Install deps + preview production build
pnpm lint             # Install deps + run ESLint

# Utilities
pnpm install-deps     # Install dependencies with --prefer-offline
pnpm clean            # Remove node_modules, .pnpm-store, pnpm-lock.yaml + prune store
```

**Important**: All scripts except `build` and `build:prod` use `pnpm install --prefer-offline` to ensure dependencies are available.

## Architecture

### State Management Pattern

The app uses a **custom hook-based architecture** centered around `useLunarData` hook (src/hooks/useLunarData.ts:31), which manages all lunar calculation state:

- **Inputs**: `location` (lat/lon), `datetime`, `timezone`
- **Output**: `lunarData` (position, illumination, times)
- **Features**: Auto-refresh (configurable interval), user action tracking for database saves, timezone validation
- **Flow**: Input changes → `calculate()` callback → `calculateLunarData()` utility → state update → component re-render

### Core Calculation Engine

Located in src/utils/lunar.ts, uses SunCalc library for astronomical calculations:

1. **getMoonPosition** (src/utils/lunar.ts:43): Converts SunCalc radians to degrees, normalizes azimuth from south-based to north-based (0° = North, 90° = East)
2. **getMoonIllumination** (src/utils/lunar.ts:60): Calculates phase, fraction, angle + maps phase value (0-1) to Spanish phase name
3. **getMoonTimes** (src/utils/lunar.ts:72): Calculates rise/set times with special handling for alwaysUp/alwaysDown cases

**Critical**: Azimuth conversion in src/utils/lunar.ts:48 adds 180° to convert from SunCalc's south-based system to north-based for UI display.

### Component Architecture

```
App.tsx (src/App.tsx:23) - Main orchestrator
├── Header - Displays illumination percentage
├── Controls - User inputs for location/datetime/timezone
│   ├── LocationSearch - Address/city search + geolocation
│   ├── MapView interaction - Click to set location
│   └── TimeConfig - Date/time/timezone selectors
├── DataCards - Display calculated results (altitude, azimuth, phase, times)
├── Map2D (lazy) - Leaflet map with moon direction arrow
└── Scene3D (lazy) - Three.js celestial dome with moon position
```

**Lazy Loading**: Map2D and Scene3D are code-split for performance (src/App.tsx:9-10).

### Coordinate Systems

- **Geographic**: Standard lat/lon (WGS84)
- **Azimuth**: 0° = North, clockwise to 360° (after normalization)
- **Altitude**: -90° (below horizon) to 90° (zenith)
- **Phase**: 0-1 continuous value (0 = new moon, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter)

### Timezone Handling

- Uses Luxon for timezone conversions (IANA timezone database)
- Default: User's browser timezone, validated against COMMON_TIMEZONES list (src/utils/lunar.ts:140-162)
- Fallback: Maps browser timezones to closest match, defaults to Europe/Madrid if no match
- Display: Times shown in selected timezone with UTC offset

## Styling System

Custom design system built on Tailwind CSS with dark-mode-first aesthetic:

### Color Palette
- **Backgrounds**: `bg-base` (#000000), `bg-primary` (#0a0a0f), `bg-elevated` (#12121a)
- **Accents**: `accent-primary` (cyan #00d4ff), `accent-secondary` (lunar amber #ffb800)
- **Text**: `text-primary` (#e4e4e7), `text-secondary` (#a1a1aa), `text-tertiary` (#71717a)

### Typography
- **Display**: Space Grotesk (headings/titles)
- **Body**: Inter (content)
- **Mono**: JetBrains Mono (data/numbers)

### Custom Classes
- Text sizes: `text-display-{lg|md}`, `text-heading-{lg|md}`, `text-body-{lg|md|sm}`, `text-data-{lg|md|sm}`
- Spacing: `space-{1-12}` (4px to 80px scale)
- Shadows: `shadow-glow-accent`, `shadow-glow-lunar` for emphasis

Configuration in tailwind.config.js with full custom theme.

## Path Aliases

TypeScript path alias configured: `@/*` → `./src/*`

Use in imports: `import { calculateLunarData } from '@/utils/lunar'`

## Docker Deployment

### Multi-Stage Dockerfile (Recommended for Coolify)

Dockerfile provides optimized production deployment:
- **Stage 1 (builder)**: Node 22 Alpine + pnpm → build app
- **Stage 2 (runtime)**: nginx:alpine → serve static files
- Exposes port 80 with health check at `/health`
- nginx config: SPA routing, gzip compression, security headers, cache for static assets

### Coolify Deployment

For VPS deployment with Coolify:
1. See **DEPLOY.md** for complete step-by-step guide
2. Configuration:
   - Build Pack: Dockerfile
   - Port: 80 (auto-mapped by Coolify proxy)
   - Health Check: `/health` endpoint
   - SSL: Auto-generated via Let's Encrypt
3. Files:
   - `Dockerfile`: Multi-stage build configuration
   - `nginx.conf`: Server block for nginx (copied to /etc/nginx/conf.d/default.conf)
   - `.dockerignore`: Excludes node_modules, .git, dev files from build context

### docker-compose.yml (Alternative)

Legacy docker-compose configuration available:
- Single-stage build with git clone
- Serves on port 3000
- Less optimized than Dockerfile method

## Testing Lunar Calculations

When modifying calculation logic:
1. Test with known moon events (new/full moon dates from NASA)
2. Verify azimuth normalization (should be 0-360 from North)
3. Check rise/set times against external sources (timeanddate.com)
4. Test edge cases: polar regions (alwaysUp/Down), date boundaries, timezone changes

## Database Integration

Location queries saved via `saveLocationQuery()` in src/services/locationService.ts:
- Tracks user location changes (not auto-location)
- Stores: location, timezone, lunar data snapshot
- Requires Supabase configuration (via @supabase/supabase-js)

## Build Configuration

Vite config (vite.config.ts):
- `BUILD_MODE=prod` disables source-identifier plugin (dev debug tool)
- Path alias resolution for `@/*`
- React plugin with source identifier for debugging
