export function LogoMark() {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="h-9 w-9"
      fill="none"
    >
      <rect x="4" y="4" width="40" height="40" rx="14" fill="url(#logo-gradient)" />
      <path
        d="M15 30.5L22.2 22.5L26.6 26.9L33 18.5"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="30.5" r="2.4" fill="white" />
      <circle cx="22.2" cy="22.5" r="2.4" fill="white" />
      <circle cx="26.6" cy="26.9" r="2.4" fill="white" />
      <circle cx="33" cy="18.5" r="2.4" fill="white" />
      <defs>
        <linearGradient id="logo-gradient" x1="8" y1="8" x2="40" y2="40">
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function IconShell({ children }) {
  return (
    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 via-cyan-500/15 to-emerald-500/15 text-sky-700 ring-1 ring-inset ring-sky-500/15 dark:text-cyan-300 dark:ring-cyan-400/20">
      {children}
    </div>
  );
}

export function GitHubIcon() {
  return (
    <IconShell>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
        <path d="M12 .5C5.65.5.5 5.65.5 12A11.5 11.5 0 0 0 8.36 22.4c.58.1.79-.25.79-.56v-1.95c-3.18.69-3.85-1.35-3.85-1.35-.52-1.31-1.27-1.66-1.27-1.66-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.67 1.24 3.32.95.1-.74.4-1.24.73-1.53-2.54-.29-5.2-1.27-5.2-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.47.11-3.07 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.6.23 2.78.11 3.07.74.8 1.18 1.82 1.18 3.07 0 4.4-2.66 5.37-5.2 5.65.41.35.77 1.03.77 2.09v3.1c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
      </svg>
    </IconShell>
  );
}

export function AnalyticsIcon() {
  return (
    <IconShell>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
        <path
          d="M5 19V11M12 19V5M19 19V9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 19.5H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </IconShell>
  );
}

export function HeatmapIcon() {
  return (
    <IconShell>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="4" height="4" rx="1.2" fill="currentColor" />
        <rect x="10" y="4" width="4" height="4" rx="1.2" className="fill-current opacity-80" />
        <rect x="16" y="4" width="4" height="4" rx="1.2" className="fill-current opacity-60" />
        <rect x="4" y="10" width="4" height="4" rx="1.2" className="fill-current opacity-70" />
        <rect x="10" y="10" width="4" height="4" rx="1.2" className="fill-current opacity-95" />
        <rect x="16" y="10" width="4" height="4" rx="1.2" className="fill-current opacity-50" />
        <rect x="4" y="16" width="4" height="4" rx="1.2" className="fill-current opacity-40" />
        <rect x="10" y="16" width="4" height="4" rx="1.2" className="fill-current opacity-65" />
        <rect x="16" y="16" width="4" height="4" rx="1.2" className="fill-current opacity-100" />
      </svg>
    </IconShell>
  );
}

export function DiscoveryIcon() {
  return (
    <IconShell>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
        <path
          d="M11 4a7 7 0 1 0 4.95 11.95L20 20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="11" cy="11" r="2.5" fill="currentColor" />
      </svg>
    </IconShell>
  );
}

export function PortfolioIcon() {
  return (
    <IconShell>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
        <rect
          x="4"
          y="6"
          width="16"
          height="12"
          rx="2.4"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M9 6V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 11.5H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </IconShell>
  );
}

export function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2.5V5M12 19V21.5M21.5 12H19M5 12H2.5M18.7 5.3L16.9 7.1M7.1 16.9L5.3 18.7M18.7 18.7L16.9 16.9M7.1 7.1L5.3 5.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M20 14.2A7.8 7.8 0 1 1 9.8 4 6.2 6.2 0 1 0 20 14.2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M4 7H20M4 12H20M4 17H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
