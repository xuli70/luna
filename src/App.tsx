import { Suspense, lazy } from 'react';
import Header from './components/Header';
import Controls from './components/Controls';
import DataCards from './components/DataCards';
import Footer from './components/Footer';
import { useLunarData } from './hooks/useLunarData';

// Lazy load heavy components
const Map2D = lazy(() => import('./components/Map2D'));
const Scene3D = lazy(() => import('./components/Scene3D'));

function LoadingFallback() {
  return (
    <div className="w-full h-[400px] lg:h-[500px] rounded-xl bg-bg-elevated border border-border-default flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-body-sm text-text-secondary">Cargando visualizacion...</p>
      </div>
    </div>
  );
}

function App() {
  const {
    lunarData,
    location,
    datetime,
    timezone,
    isManualDatetime,
    setLocation,
    setDatetime,
    setTimezone,
    resumeRealtime,
  } = useLunarData({ autoUpdate: true, updateInterval: 60000 });

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <Header illumination={lunarData?.illumination || null} />

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-8">
        {/* Hero Section */}
        <section className="text-center mb-8 md:mb-12">
          <h1 className="font-display text-display-md md:text-display-lg text-text-primary mb-3 md:mb-4">
            <span className="text-gradient">Posicion Lunar</span>
          </h1>
          <p className="text-body-md md:text-body-lg text-text-secondary max-w-2xl mx-auto px-2">
            Calcula la posicion exacta de la Luna desde cualquier punto de la Tierra. 
            Visualiza altitud, azimut, fase lunar y horarios de salida y puesta.
          </p>
        </section>

        {/* Controls Section */}
        <div className="mb-8 md:mb-12">
          <Controls
            location={location}
            datetime={datetime}
            timezone={timezone}
            isManualDatetime={isManualDatetime}
            onLocationChange={setLocation}
            onDatetimeChange={setDatetime}
            onTimezoneChange={setTimezone}
            onResumeRealtime={resumeRealtime}
          />
        </div>

        {/* Data Cards Section */}
        <div className="mb-8 md:mb-12">
          <DataCards lunarData={lunarData} timezone={timezone} />
        </div>

        {/* Visualizations Section */}
        <section id="visualizacion" className="scroll-mt-20">
          <h2 className="font-display text-heading-lg text-text-primary mb-6">
            Visualizacion
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Map 2D - 60% */}
            <div className="lg:col-span-3">
              <div className="mb-3">
                <h3 className="text-heading-md text-text-primary">Mapa Interactivo</h3>
                <p className="text-body-sm text-text-secondary">
                  Haz clic o arrastra el marcador para cambiar la ubicacion
                </p>
              </div>
              <Suspense fallback={<LoadingFallback />}>
                <Map2D
                  location={location}
                  moonPosition={lunarData?.position || null}
                  onLocationChange={setLocation}
                />
              </Suspense>
            </div>

            {/* Scene 3D - 40% */}
            <div className="lg:col-span-2">
              <div className="mb-3">
                <h3 className="text-heading-md text-text-primary">Vista del Cielo 3D</h3>
                <p className="text-body-sm text-text-secondary">
                  Posicion de la Luna en el domo celeste
                </p>
              </div>
              <Suspense fallback={<LoadingFallback />}>
                <Scene3D
                  moonPosition={lunarData?.position || null}
                  moonIllumination={lunarData?.illumination || null}
                />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="mt-12 p-6 bg-bg-elevated rounded-xl border border-border-default">
          <h3 className="text-heading-md text-text-primary mb-4">Como usar esta herramienta</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-body-md text-accent-primary font-semibold mb-2">1. Selecciona tu ubicacion</h4>
              <p className="text-body-sm text-text-secondary">
                Busca una ciudad, introduce coordenadas o haz clic en el mapa. 
                Tambien puedes usar tu ubicacion actual.
              </p>
            </div>
            <div>
              <h4 className="text-body-md text-accent-primary font-semibold mb-2">2. Ajusta fecha y hora</h4>
              <p className="text-body-sm text-text-secondary">
                Configura la fecha y hora para la que deseas calcular la posicion lunar.
                Selecciona la zona horaria correcta.
              </p>
            </div>
            <div>
              <h4 className="text-body-md text-accent-primary font-semibold mb-2">3. Explora los resultados</h4>
              <p className="text-body-sm text-text-secondary">
                Observa los datos calculados, la direccion en el mapa 2D 
                y la posicion en el visualizador 3D del cielo.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
