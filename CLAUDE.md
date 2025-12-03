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

The app uses a **custom hook-based architecture** centered around `useLunarData` hook (src/hooks/useLunarData.ts:33), which manages all lunar calculation state:

- **Inputs**: `location` (lat/lon), `datetime`, `timezone`
- **Output**: `lunarData` (position, illumination, times)
- **Features**: Auto-refresh (configurable interval), user action tracking for database saves, timezone validation, **intelligent auto-update pause**
- **Flow**: Input changes → `calculate()` callback → `calculateLunarData()` utility → state update → component re-render

### Auto-Update Behavior

The hook includes intelligent auto-update that pauses when the user manually sets a datetime:

- **State**: `isManualDatetime` tracks if user configured time manually
- **When user changes datetime**: Auto-update pauses automatically (won't overwrite user's selection)
- **Resume**: User clicks "Reanudar tiempo real" button to resume auto-updates
- **Functions**:
  - `setDatetime()`: Sets datetime and marks as manual (pauses auto-update)
  - `resumeRealtime()`: Resets to current time and resumes auto-update
- **Location**: `src/hooks/useLunarData.ts:95-116`

### Core Calculation Engine

Located in src/utils/lunar.ts, uses SunCalc library for astronomical calculations:

1. **getMoonPosition** (src/utils/lunar.ts:43): Converts SunCalc radians to degrees, normalizes azimuth from south-based to north-based (0° = North, 90° = East)
2. **getMoonIllumination** (src/utils/lunar.ts:60): Calculates phase, fraction, angle + maps phase value (0-1) to Spanish phase name
3. **getMoonTimes** (src/utils/lunar.ts:72): Calculates rise/set times with special handling for alwaysUp/alwaysDown cases

**Critical**: Azimuth conversion in src/utils/lunar.ts:48 adds 180° to convert from SunCalc's south-based system to north-based for UI display.

### Lunar Trajectory Engine

Located in src/utils/lunarTrack.ts, generates the Moon's path across the sky:

1. **generateLunarTrack** (src/utils/lunarTrack.ts:21): Generates trajectory points every 10 minutes in a ±12 hour range centered on datetime. Uses `getMoonPosition()` to ensure consistent azimuth normalization.
2. **trackPointToVector3** (src/utils/lunarTrack.ts:106): Converts altitude/azimuth (degrees) to 3D coordinates using same formula as Scene3D.
3. **groupPointsByHorizon** (src/utils/lunarTrack.ts:122): Groups contiguous points by horizon state for rendering with different styles.

**Types** (src/types/lunar.ts:70-84):
- `LunarTrackPoint`: Individual trajectory point (datetime, altitude, azimuth, isAboveHorizon)
- `LunarTrack`: Complete result with points array and special markers (risePoint, setPoint, transitPoint)

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
└── Scene3D (lazy) - Three.js celestial dome with moon position + trajectory
```

**Lazy Loading**: Map2D and Scene3D are code-split for performance (src/App.tsx:9-10).

### Scene3D Visualization

The 3D dome (src/components/Scene3D.tsx) includes moon position and lunar trajectory visualization:

- **Props**: Receives `location` and `datetime` in addition to moonPosition/moonIllumination
- **Computation**: Uses `useMemo` to calculate trajectory only when location/datetime change
- **Moon Rendering**:
  - Small white/gray sphere (radius 0.15) - realistic lunar color (#e8e8e8)
  - Subtle silver glow effect (radius 0.22, #c0c0c0)
  - Blue altitude line from Moon down to horizon projection
- **Trajectory Rendering**:
  - Solid amber line (opacity 0.6) for segments above horizon
  - Dashed amber line (opacity 0.2) for segments below horizon
  - Green sphere marker (0.08 radius) at moonrise point
  - Orange sphere marker (0.08 radius) at transit/culmination point (#ffa500)
  - Red sphere marker (0.08 radius) at moonset point
- **Toggle**: Checkbox in control bar to show/hide trajectory with color legend
- **Performance**: CatmullRomCurve3 for smooth curves, geometry disposal on updates

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
- **Stage 1 (builder)**: Node 22 Alpine + **npm** → build app
  - Uses `npm ci` for fast, deterministic install from `package-lock.json`
  - Builds manually with `npx tsc -b && npx vite build` (avoids PATH issues)
  - Build time: ~35-45s total
- **Stage 2 (runtime)**: nginx:alpine → serve static files
  - Lightweight (~50MB final image)
  - Exposes port 80 with health check at `/health`
  - nginx config: SPA routing, gzip compression, security headers, cache for static assets

**Important**: Uses **npm** not pnpm. Repository has `package-lock.json` (npm), not `pnpm-lock.yaml`.

### Coolify Deployment

For VPS deployment with Coolify:
1. See **DEPLOY.md** for complete step-by-step guide with troubleshooting
2. Configuration:
   - Build Pack: Dockerfile
   - Port: 80 (auto-mapped by Coolify proxy)
   - Health Check: `/health` endpoint (30s interval)
   - SSL: Auto-generated via Let's Encrypt
3. Files:
   - `Dockerfile`: Multi-stage build configuration
   - `nginx.conf`: Server block for nginx (copied to /etc/nginx/conf.d/default.conf)
   - `.dockerignore`: Excludes node_modules, .git, dev files from build context

**Deployment metrics** (production):
- Build time: ~59 seconds
- npm ci: 438 packages in 16.3s
- TypeScript compile: ~9s
- Vite build: 1585 modules in 8.76s
- Bundle size: ~1.1 MB total (HTML + CSS + JS)

### Known Issues & Solutions

**Issue 1: ERR_PNPM_NO_LOCKFILE**
- Cause: Dockerfile tried to use pnpm but repo only has package-lock.json
- Solution: Changed to npm with `npm ci`

**Issue 2: sh: tsc: not found**
- Cause: `tsc` and `vite` binaries not in PATH
- Solution: Use `npx tsc` and `npx vite` instead of direct commands
- Why: `npx` automatically finds binaries in `node_modules/.bin/`

**Issue 3: Redundant npm install**
- Cause: `npm run build` script ran `npm install` again after `npm ci`
- Solution: Execute build commands manually in Dockerfile
- Result: Faster builds, more explicit

**Issue 4: Auto-update overwrites manual datetime (FIXED)**
- Cause: Auto-update interval executed `setDatetime(new Date())` every 60 seconds, overwriting any manually configured datetime
- Solution: Added `isManualDatetime` state that pauses auto-update when user manually changes time
- Location: `src/hooks/useLunarData.ts:95-116`
- UX: "Reanudar tiempo real" button appears when auto-update is paused

### docker-compose.yml (Alternative)

Legacy docker-compose configuration available:
- Single-stage build with git clone
- Serves on port 3000
- Less optimized than Dockerfile method
- Not recommended for production

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

## Quick Reference

### Local Development

```bash
# Start dev server
pnpm dev

# Build for production (test locally)
npm run build
pnpm preview

# Lint
pnpm lint
```

### Docker Testing Locally

```bash
# Build the Docker image
docker build -t luna-test .

# Run locally
docker run -p 8080:80 luna-test

# Access at http://localhost:8080

# Check health
curl http://localhost:8080/health

# View logs
docker logs [container_id]

# Access container shell
docker exec -it [container_id] sh
```

### Coolify Deployment

```bash
# After pushing to GitHub, Coolify will auto-deploy

# Manual deploy:
# Coolify Dashboard → Application → Deploy button

# View logs:
# Coolify Dashboard → Application → Logs

# Check metrics:
# Coolify Dashboard → Application → Metrics
```

### Troubleshooting Checklist

If deployment fails:

1. ✅ Check logs in Coolify Dashboard → Application → Logs
2. ✅ Verify `package-lock.json` is committed to repo
3. ✅ Ensure `Dockerfile` and `nginx.conf` are in repo root
4. ✅ Confirm build commands use `npx` for binaries
5. ✅ Check DNS points to VPS IP
6. ✅ Verify ports 80 and 443 are open

Common errors:
- `ERR_PNPM_NO_LOCKFILE` → Use npm, not pnpm
- `tsc: not found` → Use `npx tsc` not `tsc`
- `502 Bad Gateway` → Check container is running and port 80 exposed
- `503 Service Unavailable` → Check health check at `/health`

### Production URLs

- Main app: https://luna.axcsol.com/
- Health check: https://luna.axcsol.com/health
- Coolify dashboard: [Your VPS IP]:8000 (or configured domain)

### Package Manager Notes

- **Local development**: Can use pnpm (scripts use `pnpm install --prefer-offline`)
- **Production build**: Uses npm (Dockerfile uses `npm ci`)
- **Reason**: Repository has `package-lock.json`, not `pnpm-lock.yaml`
- **Recommendation**: Standardize on npm for consistency, or generate pnpm-lock.yaml if preferring pnpm

### Performance Expectations

- **Build time**: 35-60 seconds
- **Bundle size**: ~1.1 MB (HTML + CSS + JS)
- **Lighthouse score**: 90+ (Performance, Accessibility)
- **First load**: ~2-3 seconds on 3G
- **Memory usage**: ~10-20 MB (nginx idle)
