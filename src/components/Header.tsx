import { useState } from 'react';
import { Moon, Menu, X } from 'lucide-react';
import type { MoonIllumination } from '../types/lunar';
import MoonPhaseIcon from './MoonPhaseIcon';

interface HeaderProps {
  illumination: MoonIllumination | null;
}

export default function Header({ illumination }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#controles', label: 'Controles' },
    { href: '#resultados', label: 'Resultados' },
    { href: '#visualizacion', label: 'Visualizacion' },
  ];

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative">
            <Moon className="w-6 h-6 sm:w-8 sm:h-8 text-accent-secondary" />
            <div className="absolute inset-0 bg-accent-secondary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-display text-body-md sm:text-heading-md text-text-primary">
            Lunar Position
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-body-md text-text-secondary hover:text-text-accent transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right section: Phase indicator + Mobile menu button */}
        <div className="flex items-center gap-3">
          {/* Phase indicator - hidden on very small screens */}
          {illumination && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-bg-elevated rounded-full border border-border-default">
              <MoonPhaseIcon phase={illumination.phase} size={20} />
              <span className="text-body-sm text-accent-secondary hidden lg:inline">
                {illumination.phaseName}
              </span>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label={isMobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-bg-primary/95 backdrop-blur-xl border-b border-border-subtle">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="px-4 py-3 text-body-md text-text-secondary hover:text-text-accent hover:bg-bg-elevated rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            
            {/* Phase indicator in mobile menu */}
            {illumination && (
              <div className="mt-2 pt-4 border-t border-border-subtle">
                <div className="flex items-center gap-3 px-4 py-2">
                  <MoonPhaseIcon phase={illumination.phase} size={24} />
                  <div>
                    <p className="text-body-sm text-text-tertiary">Fase actual</p>
                    <p className="text-body-md text-accent-secondary">{illumination.phaseName}</p>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
