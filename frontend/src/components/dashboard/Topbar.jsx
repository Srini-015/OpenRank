import { MenuIcon, MoonIcon, SunIcon } from "../Icons";
import { getAppHref } from "../../lib/routes";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM19 19l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 4.5A4.5 4.5 0 0 0 7.5 9v2.17c0 .63-.2 1.25-.58 1.75L5.5 14.8h13l-1.42-1.88a2.9 2.9 0 0 1-.58-1.75V9A4.5 4.5 0 0 0 12 4.5ZM10 18a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  const className = isDark
    ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition duration-300 hover:-translate-y-0.5 hover:bg-white/10"
    : "inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:border-slate-300";

  return (
    <button
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={onToggle}
      className={className}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export default function Topbar({
  theme,
  onThemeToggle,
  searchQuery,
  onSearchChange,
  onMenuOpen,
  user,
  onLogout,
  logoutPending,
}) {
  const username = user?.username || "openrank-dev";
  const displayName = user?.displayName || username;
  const email = user?.email || "GitHub account";
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={onMenuOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 lg:hidden"
          >
            <MenuIcon />
          </button>

          <div className="relative hidden w-full max-w-xl sm:block">
            <SearchIconWrapper />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search repos, activity, or event types"
              className="h-12 w-full rounded-full border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />

          <a
            href={getAppHref("/notifications")}
            aria-label="Notifications"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
          >
            <BellIcon />
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </a>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onLogout}
              disabled={logoutPending}
              className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 sm:inline-flex"
            >
              {logoutPending ? "Logging out..." : "Logout"}
            </button>

            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-left dark:border-white/10 dark:bg-white/5">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${username} avatar`}
                  className="h-10 w-10 rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 text-xs font-semibold text-white">
                  {initials}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 sm:hidden">
        <div className="relative">
          <SearchIconWrapper />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search repos, activity, or event types"
            className="h-12 w-full rounded-full border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
          />
        </div>
      </div>
    </header>
  );
}

function SearchIconWrapper() {
  return (
    <span className="pointer-events-none absolute inset-y-0 left-4 inline-flex items-center text-slate-400 dark:text-slate-500">
      <SearchIcon />
    </span>
  );
}
