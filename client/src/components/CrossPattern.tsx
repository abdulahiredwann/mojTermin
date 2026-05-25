export function CrossPattern({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.18]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="medical-crosses"
            x="0"
            y="0"
            width="180"
            height="180"
            patternUnits="userSpaceOnUse"
          >
            <g fill="#2E7D5B">
              <path d="M30 10h14v14h14v14H44v14H30V38H16V24h14z" opacity="0.55" />
              <path d="M130 70h10v10h10v10h-10v10h-10v-10h-10V80h10z" opacity="0.4" />
              <path d="M90 130h12v12h12v12h-12v12H90v-12H78v-12h12z" opacity="0.5" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#medical-crosses)" />
      </svg>
    </div>
  );
}
