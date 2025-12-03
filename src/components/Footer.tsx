import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 py-8 border-t border-border-subtle">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-body-sm text-text-tertiary">
              Desarrollado por XULI Master | Calculos astronomicos precisos basados en SunCalc
            </p>
            <p className="text-body-sm text-text-tertiary mt-1">
              Datos de mapas por OpenStreetMap y CARTO
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/mourner/suncalc"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-body-sm text-text-secondary hover:text-accent-primary transition-colors"
            >
              SunCalc
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.openstreetmap.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-body-sm text-text-secondary hover:text-accent-primary transition-colors"
            >
              OpenStreetMap
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://threejs.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-body-sm text-text-secondary hover:text-accent-primary transition-colors"
            >
              Three.js
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border-subtle text-center">
          <p className="text-body-sm text-text-tertiary">
            Los calculos astronomicos son aproximaciones y pueden variar ligeramente de los valores reales.
            Para observacion profesional, consulte fuentes especializadas.
          </p>
        </div>
      </div>
    </footer>
  );
}
