"use client";

export default function GoldEyesLogo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GOLD Eyes Logo"
    >
      {/* Outer eye shape */}
      <path
        d="M50 20C25 20 5 50 5 50C5 50 25 80 50 80C75 80 95 50 95 50C95 50 75 20 50 20Z"
        stroke="#D4AF37"
        strokeWidth="3"
        fill="none"
      />
      {/* Gold circle (iris) */}
      <circle cx="50" cy="50" r="18" fill="url(#goldGradient)" />
      {/* Inner circle (pupil) */}
      <circle cx="50" cy="50" r="8" fill="#0B0B0B" />
      {/* Candlestick in pupil */}
      <rect x="48.5" y="43" width="3" height="14" rx="1" fill="#D4AF37" />
      <rect x="47" y="46" width="6" height="6" rx="1" fill="#D4AF37" />
      {/* Light reflection */}
      <circle cx="56" cy="44" r="3" fill="rgba(255,255,255,0.4)" />
      {/* Gold gradient definition */}
      <defs>
        <radialGradient id="goldGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8C547" />
          <stop offset="70%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8941F" />
        </radialGradient>
      </defs>
    </svg>
  );
}
