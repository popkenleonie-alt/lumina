'use client';

export function HeroArea() {
  return (
    <div className="relative h-28 md:h-36 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/30 to-purple-900/20" />
      
      {/* Decorative SVG Wave */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 430 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0 40C50 60 100 70 150 60C200 50 250 30 300 35C350 40 400 55 430 50V80H0V40Z"
          fill="url(#wave-gradient)"
          fillOpacity="0.4"
        />
        <path
          d="M0 50C60 65 120 75 180 65C240 55 300 40 360 45C390 48 410 52 430 55V80H0V50Z"
          fill="url(#wave-gradient-2)"
          fillOpacity="0.3"
        />
        <defs>
          <linearGradient id="wave-gradient" x1="0" y1="0" x2="430" y2="0">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#6d28d9" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
          <linearGradient id="wave-gradient-2" x1="0" y1="0" x2="430" y2="0">
            <stop offset="0%" stopColor="#581c87" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Decorative Blobs */}
      <div className="absolute top-4 left-1/4 w-20 h-20 rounded-full bg-gradient-to-br from-violet-600/20 to-purple-600/20 blur-xl" />
      <div className="absolute top-8 right-1/4 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 blur-xl" />
      <div className="absolute bottom-8 left-1/2 w-24 h-16 rounded-full bg-gradient-to-br from-violet-500/15 to-indigo-500/15 blur-2xl" />
    </div>
  );
}
