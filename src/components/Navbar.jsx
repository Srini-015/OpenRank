import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CloseIcon, LogoMark, MenuIcon, MoonIcon, SunIcon } from "./Icons";
import { getAppHref } from "../lib/routes";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Explore", href: "#explore" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Login", href: "/login" },
];

const mobileNavLinks = navLinks.filter((link) => link.label !== "Login");

function ThemeToggle({ theme, setTheme }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-700 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export default function Navbar({ theme, setTheme }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 section-shell pt-5">
      <nav className="surface mx-auto flex items-center justify-between px-5 py-4 shadow-soft md:px-6">
        <a href={getAppHref("/")} className="flex items-center gap-3">
          <LogoMark />
          <div>
            <span className="block text-base font-semibold tracking-tight text-ink-900 dark:text-white">
              OpenRank
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              Open Source Contribution Tracker
            </span>
          </div>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={getAppHref(link.href)}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <a href={getAppHref("/login")} className="button-primary">
            Get Started
          </a>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-700 shadow-sm backdrop-blur transition duration-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="surface mt-3 overflow-hidden px-5 py-4 shadow-soft md:hidden"
          >
            <div className="flex flex-col gap-4">
              {mobileNavLinks.map((link) => (
                <a
                  key={link.label}
                  href={getAppHref(link.href)}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={getAppHref("/login")}
                onClick={() => setOpen(false)}
                className="button-primary mt-2 w-full"
              >
                Connect GitHub
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
