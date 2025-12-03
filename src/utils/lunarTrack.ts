import { DateTime } from 'luxon';
import type { Location, LunarTrackPoint, LunarTrack } from '../types/lunar';
import { getMoonPosition } from './lunar';

interface TrackConfig {
  intervalMinutes: number;
  hoursBeforeAfter: number;
}

const DEFAULT_CONFIG: TrackConfig = {
  intervalMinutes: 10,
  hoursBeforeAfter: 12,
};

/**
 * Genera muestras de la trayectoria lunar para un rango de tiempo.
 *
 * Estrategia: En lugar de depender de rise/set (que pueden ser undefined),
 * generamos puntos en un rango fijo centrado en la fecha/hora actual.
 * Esto garantiza consistencia independientemente de casos edge.
 */
export function generateLunarTrack(
  centerDatetime: Date,
  location: Location,
  config: Partial<TrackConfig> = {}
): LunarTrack {
  const { intervalMinutes, hoursBeforeAfter } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const centerDt = DateTime.fromJSDate(centerDatetime);
  const startDt = centerDt.minus({ hours: hoursBeforeAfter });
  const endDt = centerDt.plus({ hours: hoursBeforeAfter });

  const points: LunarTrackPoint[] = [];
  let currentDt = startDt;

  // Generar puntos a intervalos regulares
  while (currentDt <= endDt) {
    const jsDate = currentDt.toJSDate();
    // Usa getMoonPosition que ya normaliza azimut a norte-based y retorna grados
    const position = getMoonPosition(jsDate, location);

    const point: LunarTrackPoint = {
      datetime: jsDate,
      altitude: position.altitude,
      azimuth: position.azimuth,
      isAboveHorizon: position.altitude > 0,
    };

    points.push(point);
    currentDt = currentDt.plus({ minutes: intervalMinutes });
  }

  // Encontrar puntos especiales
  const risePoint = findRisePoint(points);
  const setPoint = findSetPoint(points);
  const transitPoint = findTransitPoint(points);

  return {
    points,
    risePoint,
    setPoint,
    transitPoint,
  };
}

/**
 * Encuentra el punto de salida (transición de bajo a sobre horizonte)
 */
function findRisePoint(points: LunarTrackPoint[]): LunarTrackPoint | null {
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    if (!prev.isAboveHorizon && curr.isAboveHorizon) {
      return curr;
    }
  }
  return null;
}

/**
 * Encuentra el punto de puesta (transición de sobre a bajo horizonte)
 */
function findSetPoint(points: LunarTrackPoint[]): LunarTrackPoint | null {
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    if (prev.isAboveHorizon && !curr.isAboveHorizon) {
      return prev;
    }
  }
  return null;
}

/**
 * Encuentra el punto de tránsito (máxima altitud sobre horizonte)
 */
function findTransitPoint(points: LunarTrackPoint[]): LunarTrackPoint | null {
  const aboveHorizon = points.filter(p => p.isAboveHorizon);
  if (aboveHorizon.length === 0) return null;

  return aboveHorizon.reduce((max, point) =>
    point.altitude > max.altitude ? point : max
  );
}

/**
 * Convierte un punto de la trayectoria a coordenadas 3D.
 * Usa el mismo sistema de coordenadas que Scene3D.tsx.
 *
 * Sistema de coordenadas:
 * - Azimuth 0° = Norte (+Z)
 * - Azimuth 90° = Este (-X) - negado para que Este aparezca a la derecha mirando desde el Sur
 * - Altitude 0° = Horizonte
 * - Altitude 90° = Cenit (+Y)
 */
export function trackPointToVector3(
  point: LunarTrackPoint,
  radius: number = 4
): { x: number; y: number; z: number } {
  const altRad = (point.altitude * Math.PI) / 180;
  const azRad = (point.azimuth * Math.PI) / 180;

  return {
    x: -radius * Math.cos(altRad) * Math.sin(azRad),
    y: radius * Math.sin(altRad),
    z: radius * Math.cos(altRad) * Math.cos(azRad),
  };
}

/**
 * Agrupa puntos contiguos por su estado (sobre/bajo horizonte).
 * Útil para renderizar segmentos con diferentes estilos.
 */
export function groupPointsByHorizon(points: LunarTrackPoint[]): {
  aboveHorizon: LunarTrackPoint[][];
  belowHorizon: LunarTrackPoint[][];
} {
  const aboveHorizon: LunarTrackPoint[][] = [];
  const belowHorizon: LunarTrackPoint[][] = [];

  let currentAbove: LunarTrackPoint[] = [];
  let currentBelow: LunarTrackPoint[] = [];

  for (const point of points) {
    if (point.isAboveHorizon) {
      if (currentBelow.length > 0) {
        belowHorizon.push(currentBelow);
        currentBelow = [];
      }
      currentAbove.push(point);
    } else {
      if (currentAbove.length > 0) {
        aboveHorizon.push(currentAbove);
        currentAbove = [];
      }
      currentBelow.push(point);
    }
  }

  // Push remaining groups
  if (currentAbove.length > 0) aboveHorizon.push(currentAbove);
  if (currentBelow.length > 0) belowHorizon.push(currentBelow);

  return { aboveHorizon, belowHorizon };
}
