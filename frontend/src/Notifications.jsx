import { startTransition, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LogoMark, MoonIcon, SunIcon } from "./components/Icons";
import { getApiErrorMessage } from "./lib/apiError";
import { logoutSession } from "./services/auth";
import {
  fetchNotifications,
  updateNotificationStatus,
} from "./services/notifications";
import { getAppHref, redirectTo } from "./lib/routes";

const THEME_KEY = "openrank-theme";
const EMPTY_STATE = {
  items: [],
  unreadCount: 0,
  lastCheckedAt: "",
  pollingIntervalMs: 45000,
};

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

function formatTimestamp(value) {
  if (!value) {
    return "Just now";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M15 6.5 9.5 12 15 17.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5"
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

function PushIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 4v10M8 8l4-4 4 4M6 20h12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PullRequestIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M7 6.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17 22.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM7 6.5v10a5 5 0 0 0 5 5h2.5M17 17.5v-10M17 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IssueIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 8v4M12 15.5h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function notificationMeta(item) {
  if (item.type === "push") {
    return {
      icon: <PushIcon />,
      accent: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300",
    };
  }

  if (item.type === "pull_request") {
    return {
      icon: <PullRequestIcon />,
      accent: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
    };
  }

  return {
    icon: <IssueIcon />,
    accent: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  };
}

export default function Notifications() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [data, setData] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [logoutPending, setLogoutPending] = useState(false);
  const [pendingIds, setPendingIds] = useState([]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;

    const loadNotifications = async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await fetchNotifications();

        if (!cancelled) {
          setData({
            ...EMPTY_STATE,
            ...response,
          });
          setError("");
        }
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        if (requestError?.response?.status === 401) {
          redirectTo("/login");
          return;
        }

        setError(
          getApiErrorMessage(
            requestError,
            "Unable to load GitHub notifications right now.",
          ),
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    loadNotifications(false);
    const intervalId = window.setInterval(
      () => loadNotifications(true),
      data.pollingIntervalMs || 45000,
    );

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [data.pollingIntervalMs]);

  const filteredItems = useMemo(() => {
    if (filter === "unread") {
      return data.items.filter((item) => !item.read);
    }

    return data.items;
  }, [data.items, filter]);

  const handleLogout = async () => {
    if (logoutPending) {
      return;
    }

    setLogoutPending(true);

    try {
      await logoutSession();
    } catch (logoutError) {
      console.error("Logout failed", logoutError);
    } finally {
      redirectTo("/login");
    }
  };

  const handleToggleRead = async (item) => {
    if (pendingIds.includes(item.id)) {
      return;
    }

    setPendingIds((current) => [...current, item.id]);

    try {
      await updateNotificationStatus(item.id, !item.read);
      setData((current) => {
        const items = current.items.map((notification) =>
          notification.id === item.id
            ? { ...notification, read: !notification.read }
            : notification,
        );

        return {
          ...current,
          items,
          unreadCount: items.filter((notification) => !notification.read).length,
        };
      });
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        redirectTo("/login");
        return;
      }

      setError(
        getApiErrorMessage(
          requestError,
          "Unable to update the notification state.",
        ),
      );
    } finally {
      setPendingIds((current) => current.filter((id) => id !== item.id));
    }
  };

  const pageClassName =
    theme === "dark"
      ? "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_24%),radial-gradient(circle_at_right,_rgba(34,197,94,0.14),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-white"
      : "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_24%),radial-gradient(circle_at_right,_rgba(34,197,94,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] text-slate-900";

  return (
    <div className={`${pageClassName} transition-colors duration-300`}>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <a
              href={getAppHref("/dashboard")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
              aria-label="Back to dashboard"
            >
              <ArrowLeftIcon />
            </a>
            <a href={getAppHref("/")} className="flex items-center gap-3">
              <LogoMark />
              <div>
                <p className="text-base font-semibold tracking-tight text-slate-950 dark:text-white">
                  OpenRank
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Notifications
                </p>
              </div>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle
              theme={theme}
              onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutPending}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            >
              {logoutPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="surface relative overflow-hidden p-6 sm:p-8"
        >
          <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_48%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.18),_transparent_48%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
                <BellIcon />
                Live Feed
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Recent GitHub events, kept in sync with polling.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Notifications are pulled from public GitHub events for pushes,
                pull requests, and issues. Read state is stored in MongoDB so it
                persists across refreshes.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  { value: "all", label: "All" },
                  { value: "unread", label: "Unread" },
                ].map((option) => {
                  const isActive = filter === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => startTransition(() => setFilter(option.value))}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-slate-950 text-white shadow-lg dark:bg-white dark:text-slate-950"
                          : "border border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white/75 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Unread
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  {data.unreadCount}
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-white/75 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Last Checked
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">
                  {formatTimestamp(data.lastCheckedAt)}
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-white/75 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Polling
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">
                  Every {Math.round((data.pollingIntervalMs || 45000) / 1000)}s
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-white/75 p-5 text-left shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3 text-slate-950 dark:text-white">
                  <RefreshIcon />
                  <span className="font-semibold">
                    {refreshing ? "Refreshing..." : "Auto-refresh active"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  Polling keeps the feed live without using sockets.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <section className="surface mt-8 overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-white/10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Notification Feed
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {loading ? "Loading notifications..." : `${filteredItems.length} visible events`}
              </h2>
            </div>
            <button
              type="button"
              onClick={async () => {
                setRefreshing(true);
                try {
                  const response = await fetchNotifications();
                  setData({
                    ...EMPTY_STATE,
                    ...response,
                  });
                } catch (requestError) {
                  if (requestError?.response?.status === 401) {
                    redirectTo("/login");
                    return;
                  }
                  setError(
                    getApiErrorMessage(
                      requestError,
                      "Unable to refresh notifications right now.",
                    ),
                  );
                } finally {
                  setRefreshing(false);
                }
              }}
              className="button-secondary px-4 py-2"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-4 p-4 sm:p-6">
            {filteredItems.map((item, index) => {
              const meta = notificationMeta(item);
              const isPending = pendingIds.includes(item.id);

              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.04 * index }}
                  className={`rounded-[1.75rem] border p-5 ${
                    item.read
                      ? "border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/5"
                      : "border-cyan-400/30 bg-cyan-500/10"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${meta.accent}`}
                        >
                          {meta.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-base font-semibold text-slate-950 dark:text-white">
                              {item.title}
                            </p>
                            {!item.read ? (
                              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                            ) : null}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {item.typeLabel} in {item.repo}
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                        {item.subtitle}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>{item.time}</span>
                        <span>{formatTimestamp(item.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleRead(item)}
                        disabled={isPending}
                        className="button-secondary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isPending
                          ? "Saving..."
                          : item.read
                            ? "Mark unread"
                            : "Mark read"}
                      </button>
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="button-primary px-4 py-2"
                        >
                          View on GitHub
                        </a>
                      ) : null}
                    </div>
                  </div>
                </motion.article>
              );
            })}

            {!loading && filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-10 text-center dark:border-white/10">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {filter === "unread"
                    ? "You are all caught up. No unread notifications remain."
                    : "No recent push, pull request, or issue events were found."}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
