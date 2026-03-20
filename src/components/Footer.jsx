import { LogoMark } from "./Icons";

const footerLinks = [
  { label: "About", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "Contact", href: "#" },
];

export default function Footer() {
  return (
    <footer className="section-shell pb-8 pt-4 md:pb-10 md:pt-6">
      <div className="border-t border-slate-200/80 px-1 pt-5 md:hidden dark:border-white/10">
        <div className="flex items-center justify-center gap-3">
          <LogoMark />
          <div className="text-left">
            <div className="text-sm font-semibold text-ink-900 dark:text-white">
              OpenRank
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Open Source Contribution Tracker
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition hover:text-slate-950 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          Copyright 2026 OpenRank.
        </p>
      </div>

      <div className="surface hidden flex-col gap-6 px-6 py-6 shadow-soft md:flex md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <div className="text-sm font-semibold text-ink-900 dark:text-white">
              OpenRank
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Open Source Contribution Tracker
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500 dark:text-slate-400">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition hover:text-slate-950 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Copyright 2026 OpenRank. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
