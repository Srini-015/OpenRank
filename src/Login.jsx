import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogoMark, MoonIcon, SunIcon } from "./components/Icons";
import {
  beginGitHubLogin,
  fetchCurrentUser,
  getAuthErrorMessage,
} from "./services/auth";
import { getAppHref, redirectTo } from "./lib/routes";

const THEME_KEY = "openrank-theme";

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = window.localStorage.getItem(THEME_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return "dark";
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12A11.5 11.5 0 0 0 8.36 22.4c.58.1.79-.25.79-.56v-1.95c-3.18.69-3.85-1.35-3.85-1.35-.52-1.31-1.27-1.66-1.27-1.66-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.67 1.24 3.32.95.1-.74.4-1.24.73-1.53-2.54-.29-5.2-1.27-5.2-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.47.11-3.07 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.6.23 2.78.11 3.07.74.8 1.18 1.82 1.18 3.07 0 4.4-2.66 5.37-5.2 5.65.41.35.77 1.03.77 2.09v3.1c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M2.8 12S6.3 5.5 12 5.5 21.2 12 21.2 12 17.7 18.5 12 18.5 2.8 12 2.8 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  );
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  const className = isDark
    ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white/10"
    : "inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={className}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export default function Login() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [checkingSession, setCheckingSession] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    let ignore = false;
    const errorCode = new URLSearchParams(window.location.search).get("error");

    setAuthError(getAuthErrorMessage(errorCode));

    fetchCurrentUser()
      .then(() => {
        if (ignore) {
          return;
        }

        redirectTo("/dashboard");
      })
      .catch((error) => {
        if (ignore) {
          return;
        }

        if (error.response?.status !== 401 && !errorCode) {
          setAuthError("We couldn't verify your current session.");
        }
      })
      .finally(() => {
        if (ignore) {
          return;
        }

        setCheckingSession(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const isDark = theme === "dark";
  const pageClassName = isDark
    ? "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.28),_transparent_32%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.18),_transparent_36%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-white transition-colors duration-300"
    : "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_34%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.12),_transparent_36%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] text-slate-900 transition-colors duration-300";
  const cardClassName = isDark
    ? "w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/70 p-8 shadow-xl backdrop-blur-xl md:max-w-md"
    : "w-full max-w-md rounded-2xl border border-slate-200 bg-white/85 p-8 shadow-xl backdrop-blur-xl md:max-w-md";
  const infoCardClassName = isDark
    ? "rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white"
    : "rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900";
  const mutedTextClassName = isDark ? "text-slate-400" : "text-slate-500";
  const logoShellClassName = isDark
    ? "rounded-2xl border border-white/10 bg-white/5 p-3 shadow-lg backdrop-blur"
    : "rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-lg backdrop-blur";

  return (
    <main className={pageClassName}>
      <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-24 h-56 w-56 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute bottom-20 left-10 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeToggle
            theme={theme}
            onToggle={() => setTheme(isDark ? "light" : "dark")}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={cardClassName}
        >
          <div className="flex justify-center">
            <a href={getAppHref("/")} className="inline-flex flex-col items-center text-center">
              <div className={logoShellClassName}>
                <LogoMark />
              </div>
            </a>
          </div>

          <div className="mt-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              <a href={getAppHref("/")} className="transition hover:opacity-80">
                OpenRank
              </a>
            </h1>
            <p className={`mt-2 text-sm ${mutedTextClassName}`}>
              Sign in with GitHub to unlock your developer dashboard
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <div className={infoCardClassName}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-indigo-400">
                  <EyeIcon />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    Secure session-based login
                  </p>
                  <p className={`mt-1 text-sm ${mutedTextClassName}`}>
                    We use GitHub OAuth, Passport.js, and an Express session to
                    keep your dashboard login persistent and secure.
                  </p>
                </div>
              </div>
            </div>

            {authError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                {authError}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setRedirecting(true);
                beginGitHubLogin();
              }}
              disabled={checkingSession || redirecting}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-slate-900 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              {checkingSession || redirecting ? <Spinner /> : <GitHubMark />}
              {checkingSession
                ? "Checking session..."
                : redirecting
                  ? "Redirecting to GitHub..."
                  : "Continue with GitHub"}
            </button>

            <p className={`text-center text-sm ${mutedTextClassName}`}>
              After approval, you'll be redirected straight to your dashboard.
            </p>
          </div>

          <p className={`mt-6 text-center text-sm ${mutedTextClassName}`}>
            Need a new account? GitHub will handle the identity step for you.
          </p>

          <p className={`mt-8 text-center text-xs ${mutedTextClassName}`}>
            &copy; 2026 OpenRank. All rights reserved.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
