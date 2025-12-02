interface MoonPhaseIconProps {
  phase: number; // 0 to 1
  size?: number;
  className?: string;
}

export default function MoonPhaseIcon({ phase, size = 24, className = '' }: MoonPhaseIconProps) {
  // Phase: 0 = new moon, 0.5 = full moon, 1 = new moon again
  // We'll render an SVG that shows the illuminated portion
  
  const illuminatedPercent = phase < 0.5 
    ? phase * 2 // 0 to 1 as we go from new to full
    : (1 - phase) * 2; // 1 to 0 as we go from full to new
  
  const isWaxing = phase < 0.5;
  
  // Calculate the curve for the terminator line
  const curveX = size * 0.5 * (1 - illuminatedPercent * 2);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`text-accent-secondary ${className}`}
      fill="none"
    >
      <defs>
        <clipPath id={`moonClip-${phase}`}>
          <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} />
        </clipPath>
        <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffb800" />
          <stop offset="100%" stopColor="#ff9500" />
        </linearGradient>
      </defs>
      
      {/* Dark background (unlit portion) */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 1}
        fill="#1e1e2e"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.3"
      />
      
      {/* Illuminated portion */}
      <g clipPath={`url(#moonClip-${phase})`}>
        {phase === 0 || phase === 1 ? (
          // New moon - no illumination
          null
        ) : phase === 0.5 ? (
          // Full moon - full circle
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 1}
            fill="url(#moonGradient)"
          />
        ) : (
          // Partial phases
          <path
            d={
              isWaxing
                ? `M ${size / 2} 1 
                   A ${size / 2 - 1} ${size / 2 - 1} 0 1 1 ${size / 2} ${size - 1}
                   A ${Math.abs(curveX)} ${size / 2 - 1} 0 0 ${curveX > 0 ? 0 : 1} ${size / 2} 1`
                : `M ${size / 2} 1 
                   A ${size / 2 - 1} ${size / 2 - 1} 0 1 0 ${size / 2} ${size - 1}
                   A ${Math.abs(curveX)} ${size / 2 - 1} 0 0 ${curveX > 0 ? 1 : 0} ${size / 2} 1`
            }
            fill="url(#moonGradient)"
          />
        )}
      </g>
      
      {/* Glow effect */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 1}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        filter="url(#glow)"
      />
    </svg>
  );
}
