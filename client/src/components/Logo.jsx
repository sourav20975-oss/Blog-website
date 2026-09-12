export default function Logo({ size = 'md', showText = true, className = '' }) {
  const sizes = {
    sm: { box: 'h-7 w-7', iconSize: 28, text: 'text-sm' },
    md: { box: 'h-8 w-8', iconSize: 32, text: 'text-base' },
    lg: { box: 'h-10 w-10', iconSize: 40, text: 'text-xl' },
  };

  const current = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Premium Geometric Monogram Icon */}
      <div className={`relative flex ${current.box} shrink-0 items-center justify-center`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Background Gradient */}
            <linearGradient id="bv-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E1E24" />
              <stop offset="100%" stopColor="#0B0B0E" />
            </linearGradient>

            {/* Ember Glow Gradient */}
            <linearGradient id="bv-ember" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF7A1A" />
              <stop offset="50%" stopColor="#FF5500" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            {/* Accent Gold Gradient */}
            <linearGradient id="bv-gold" x1="12" y1="6" x2="28" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDBA74" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>

            {/* Subtle Outer Border Gradient */}
            <linearGradient id="bv-border" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.25)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
            </linearGradient>
          </defs>

          {/* Squircle Base */}
          <rect
            x="1"
            y="1"
            width="38"
            height="38"
            rx="11"
            fill="url(#bv-bg)"
            stroke="url(#bv-border)"
            strokeWidth="1.2"
          />

          {/* Ambient Glow */}
          <circle cx="20" cy="20" r="12" fill="#FF5500" opacity="0.22" filter="blur(6px)" />

          {/* Left Wing / Bracket / 'B' Curve */}
          <path
            d="M13 13.5L8.5 20L13 26.5"
            stroke="url(#bv-gold)"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Wing / Bracket / 'V' Curve */}
          <path
            d="M27 13.5L31.5 20L27 26.5"
            stroke="url(#bv-gold)"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center Dynamic Geometric 'V' Anchor */}
          <path
            d="M16 16.5L20 25.5L24 16.5"
            stroke="url(#bv-ember)"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center Vertex Spark / Core */}
          <circle cx="20" cy="14" r="1.75" fill="#FFAA44" />
        </svg>
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <span className={`font-bold tracking-tight text-zinc-900 dark:text-white ${current.text}`}>
          Blog<span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Verse</span>
        </span>
      )}
    </div>
  );
}
