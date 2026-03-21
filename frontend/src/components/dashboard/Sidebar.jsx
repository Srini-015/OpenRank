import { AnimatePresence, motion } from "framer-motion";
import { CloseIcon, LogoMark } from "../Icons";
import { getAppHref } from "../../lib/routes";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4ZM13 5.5A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v7A1.5 1.5 0 0 1 18.5 14h-4A1.5 1.5 0 0 1 13 12.5v-7ZM4 14.5A1.5 1.5 0 0 1 5.5 13h4A1.5 1.5 0 0 1 11 14.5v4A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5v-4ZM13 17.5A1.5 1.5 0 0 1 14.5 16h4A1.5 1.5 0 0 1 20 17.5v1A1.5 1.5 0 0 1 18.5 20h-4A1.5 1.5 0 0 1 13 18.5v-1Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4 19.5H20M7 16V10M12 16V5M17 16V12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M8 7h8M8 12h8M8 17h5M5.5 4.5h13A1.5 1.5 0 0 1 20 6v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V6A1.5 1.5 0 0 1 5.5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM5 19a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const menuItems = [
  { label: "Dashboard", href: "#overview", Icon: DashboardIcon },
  { label: "Analytics", href: "#analytics", Icon: AnalyticsIcon },
  { label: "Activity", href: "#activity", Icon: ActivityIcon },
  { label: "Profile", href: "#profile", Icon: ProfileIcon },
];

export default function Sidebar({
  isOpen,
  onClose,
  activeItem,
  onItemSelect,
  repositoriesCount = 0,
  lastSyncLabel = "",
}) {
  const asideClassName = `fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white/85 p-5 shadow-2xl backdrop-blur-xl transition-transform duration-300 dark:border-white/10 dark:bg-slate-950/85 lg:translate-x-0 ${
    isOpen ? "translate-x-0" : "-translate-x-full"
  }`;

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          />
        ) : null}
      </AnimatePresence>

      <aside className={asideClassName}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3">
            <a href={getAppHref("/")} className="flex items-center gap-3">
              <LogoMark />
              <div>
                <p className="text-base font-semibold tracking-tight text-slate-950 dark:text-white">
                  OpenRank
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Contribution Tracker
                </p>
              </div>
            </a>

            <button
              type="button"
              aria-label="Close sidebar"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 lg:hidden"
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="mt-10 space-y-2">
            {menuItems.map((item) => {
              const isActive = item.label === activeItem;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    onItemSelect(item.label);
                    onClose();
                  }}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300"
                    }`}
                  >
                    <item.Icon />
                  </span>
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-lg dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Sync Status
            </p>
            <p className="mt-3 text-sm font-medium text-slate-900 dark:text-white">
              {repositoriesCount} repositories tracked
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {lastSyncLabel
                ? `Last GitHub sync completed ${lastSyncLabel}.`
                : "Waiting for the latest GitHub sync."}
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
