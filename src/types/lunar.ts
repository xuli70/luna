export interface Location {
  lat: number;
  lon: number;
  name?: string;
}

export interface MoonPosition {
  altitude: number; // degrees above horizon
  azimuth: number; // degrees from north
  distance: number; // km from Earth center
  parallacticAngle: number; // radians
}

export interface MoonIllumination {
  fraction: number; // 0 to 1
  phase: number; // 0 to 1 (0 = new moon, 0.5 = full moon)
  angle: number; // radians
  phaseName: string;
}

export interface MoonTimes {
  rise: Date | null;
  set: Date | null;
  alwaysUp: boolean;
  alwaysDown: boolean;
}

export interface LunarData {
  position: MoonPosition;
  illumination: MoonIllumination;
  times: MoonTimes;
  calculatedAt: Date;
}

export interface AppState {
  location: Location;
  datetime: Date;
  timezone: string;
  lunarData: LunarData | null;
  isLoading: boolean;
  error: string | null;
}

export type PhaseName = 
  | 'Luna Nueva'
  | 'Creciente Iluminante'
  | 'Cuarto Creciente'
  | 'Gibosa Creciente'
  | 'Luna Llena'
  | 'Gibosa Menguante'
  | 'Cuarto Menguante'
  | 'Creciente Menguante';

export interface CardinalDirection {
  label: string;
  degrees: number;
}

export const CARDINAL_DIRECTIONS: CardinalDirection[] = [
  { label: 'N', degrees: 0 },
  { label: 'NE', degrees: 45 },
  { label: 'E', degrees: 90 },
  { label: 'SE', degrees: 135 },
  { label: 'S', degrees: 180 },
  { label: 'SO', degrees: 225 },
  { label: 'O', degrees: 270 },
  { label: 'NO', degrees: 315 },
];
