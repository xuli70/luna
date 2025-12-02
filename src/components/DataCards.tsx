import { Mountain, Compass, Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import type { LunarData } from '../types/lunar';
import { formatTime, getCardinalDirection } from '../utils/lunar';
import MoonPhaseIcon from './MoonPhaseIcon';

interface DataCardsProps {
  lunarData: LunarData | null;
  timezone: string;
}

interface DataCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  description?: string;
  accentColor?: 'cyan' | 'amber';
  progress?: number;
}

function DataCard({ icon, label, value, unit, description, accentColor = 'cyan', progress }: DataCardProps) {
  return (
    <div className="group bg-bg-elevated rounded-xl border border-border-default p-6 shadow-card hover:border-border-strong hover:bg-bg-interactive transition-all duration-250 hover:-translate-y-0.5">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${accentColor === 'amber' ? 'bg-accent-secondary/10 text-accent-secondary' : 'bg-accent-primary/10 text-accent-primary'}`}>
          {icon}
        </div>
        <span className="text-body-sm text-text-secondary">{label}</span>
      </div>
      
      <div className="mb-2">
        <span className="font-mono text-data-lg text-text-primary animate-fade-in">
          {value}
        </span>
        {unit && (
          <span className="text-body-md text-text-tertiary ml-1">{unit}</span>
        )}
      </div>
      
      {progress !== undefined && (
        <div className="h-2 bg-bg-interactive rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-accent-secondary rounded-full transition-all duration-data"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      
      {description && (
        <p className="text-body-sm text-text-tertiary">{description}</p>
      )}
    </div>
  );
}

export default function DataCards({ lunarData, timezone }: DataCardsProps) {
  if (!lunarData) {
    return (
      <section id="resultados" className="scroll-mt-20">
        <h2 className="font-display text-heading-lg text-text-primary mb-6">
          Datos Lunares
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-bg-elevated rounded-xl border border-border-default p-6 shadow-card animate-pulse">
              <div className="h-6 w-24 bg-bg-interactive rounded mb-4" />
              <div className="h-10 w-32 bg-bg-interactive rounded mb-2" />
              <div className="h-4 w-40 bg-bg-interactive rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const { position, illumination, times } = lunarData;
  const altitudeDescription = position.altitude > 0 
    ? 'Luna visible sobre el horizonte' 
    : 'Luna bajo el horizonte';
  
  const cardinalDir = getCardinalDirection(position.azimuth);

  return (
    <section id="resultados" className="scroll-mt-20">
      <h2 className="font-display text-heading-lg text-text-primary mb-6">
        Datos Lunares
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Altitude */}
        <DataCard
          icon={<Mountain className="w-5 h-5" />}
          label="Altitud"
          value={position.altitude.toFixed(1)}
          unit="grados"
          description={altitudeDescription}
        />

        {/* Azimuth */}
        <DataCard
          icon={<Compass className="w-5 h-5" />}
          label="Azimut"
          value={position.azimuth.toFixed(1)}
          unit={`grados (${cardinalDir})`}
          description="Direccion desde el Norte"
        />

        {/* Phase */}
        <DataCard
          icon={<MoonPhaseIcon phase={illumination.phase} size={20} />}
          label="Fase Lunar"
          value={illumination.phaseName}
          description={`Ciclo: ${(illumination.phase * 100).toFixed(0)}%`}
          accentColor="amber"
        />

        {/* Illumination */}
        <DataCard
          icon={<Sun className="w-5 h-5" />}
          label="Iluminacion"
          value={(illumination.fraction * 100).toFixed(1)}
          unit="%"
          progress={illumination.fraction * 100}
          description="Porcentaje de superficie iluminada"
          accentColor="amber"
        />

        {/* Moonrise */}
        <DataCard
          icon={<Sunrise className="w-5 h-5" />}
          label="Salida de Luna"
          value={times.alwaysUp ? 'Siempre visible' : times.alwaysDown ? 'No sale' : formatTime(times.rise, timezone)}
          description={times.rise ? `Hora local (${timezone.split('/').pop()})` : times.alwaysUp ? 'La Luna permanece visible' : 'La Luna permanece bajo el horizonte'}
        />

        {/* Moonset */}
        <DataCard
          icon={<Sunset className="w-5 h-5" />}
          label="Puesta de Luna"
          value={times.alwaysUp ? 'No se pone' : times.alwaysDown ? 'No visible' : formatTime(times.set, timezone)}
          description={times.set ? `Hora local (${timezone.split('/').pop()})` : times.alwaysUp ? 'La Luna permanece visible' : 'La Luna permanece bajo el horizonte'}
        />
      </div>
    </section>
  );
}
