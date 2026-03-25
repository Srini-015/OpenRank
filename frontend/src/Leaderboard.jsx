import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import { LogoMark, MoonIcon, SunIcon } from "./components/Icons";
import { getApiErrorMessage } from "./lib/apiError";
import { logoutSession } from "./services/auth";
import { fetchLeaderboard } from "./services/leaderboard";
import { getAppHref, redirectTo } from "./lib/routes";

const THEME_KEY = "openrank-theme";
const PAGE_SIZE = 10;
const TIMEFRAME_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "all-time", label: "All-time" },
];
const EMPTY_BOARD = {
  podium: [],
  items: [],
  currentUser: null,
  pagination: {
    page: 1,
    total: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  },
  filters: {
    timeframe: "all-time",
    search: "",
  },
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

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function formatRank(value) {
  return value ? `#${value}` : "Unranked";
}

function buildVisiblePages(currentPage, totalPages) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);

  return Array.from(
    { length: end - adjustedStart + 1 },
    (_, index) => adjustedStart + index,
  );
}

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

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M14.5 6.5 9 12l5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M9.5 6.5 15 12l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="m4 7 4.2 4.6L12 6l3.8 5.6L20 7l-1.8 10H5.8L4 7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 19h10"
        stroke="currentColor"
        strokeWidth="1.7"
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

function UserAvatar({ user, size = "h-11 w-11" }) {
  const initials = (user?.username || "OR").slice(0, 2).toUpperCase();

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={`${user.username} avatar`}
        className={`${size} rounded-2xl object-cover`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`flex ${size} items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-emerald-400 text-sm font-semibold text-white`}
    >
      {initials}
    </div>
  );
}

function PodiumCard({ entry, theme }) {
  const rankThemes = {
    1: "from-amber-400/30 via-orange-400/15 to-rose-400/10 border-amber-300/40 dark:border-amber-300/20",
    2: "from-slate-300/35 via-slate-200/20 to-white/5 border-slate-300/60 dark:border-white/10",
    3: "from-orange-300/30 via-amber-200/15 to-white/5 border-orange-300/50 dark:border-orange-300/15",
  };
  const layoutClassName =
    entry.rank === 1
      ? "lg:order-2 lg:-translate-y-6"
      : entry.rank === 2
        ? "lg:order-1 lg:translate-y-6"
        : "lg:order-3 lg:translate-y-10";

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 * entry.rank }}
      className={`relative overflow-hidden rounded-[2rem] border bg-gradient-to-br p-6 shadow-soft backdrop-blur-xl ${rankThemes[entry.rank] || rankThemes[3]} ${layoutClassName}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-20 ${
          theme === "dark"
            ? "bg-gradient-to-r from-white/10 to-transparent"
            : "bg-gradient-to-r from-white/70 to-transparent"
        }`}
      />
      <div className="relative flex items-start justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
          <CrownIcon />
          {formatRank(entry.rank)}
        </div>
        {entry.isCurrentUser ? (
          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
            You
          </span>
        ) : null}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <UserAvatar user={entry} size="h-14 w-14" />
        <div>
          <p className="text-lg font-semibold text-slate-950 dark:text-white">
            {entry.displayName}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            @{entry.username}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-white/70 px-4 py-3 dark:bg-slate-950/30">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Score
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {formatCompactNumber(entry.score)}
          </p>
        </div>
        <div className="rounded-2xl bg-white/70 px-4 py-3 dark:bg-slate-950/30">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Contributions
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {formatCompactNumber(entry.totalContributions)}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

export default function Leaderboard() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [timeframe, setTimeframe] = useState("all-time");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logoutPending, setLogoutPending] = useState(false);
  const deferredSearch = useDeferredValue(searchQuery.trim());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    let ignore = false;

    const loadLeaderboard = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchLeaderboard({
          timeframe,
          search: deferredSearch,
          page,
          limit: PAGE_SIZE,
        });

        if (!ignore) {
          setBoard({
            ...EMPTY_BOARD,
            ...data,
          });
        }
      } catch (requestError) {
        if (ignore) {
          return;
        }

        if (requestError?.response?.status === 401) {
          redirectTo("/login");
          return;
        }

        setError(
          getApiErrorMessage(
            requestError,
            "Unable to load the leaderboard right now.",
          ),
        );
        setBoard(EMPTY_BOARD);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadLeaderboard();

    return () => {
      ignore = true;
    };
  }, [deferredSearch, page, timeframe]);

  const user = board.currentUser;
  const pageClassName =
    theme === "dark"
      ? "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_24%),radial-gradient(circle_at_right,_rgba(59,130,246,0.18),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-white"
      : "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_26%),radial-gradient(circle_at_right,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] text-slate-900";
  const visiblePages = useMemo(
    () => buildVisiblePages(board.pagination.page, board.pagination.totalPages),
    [board.pagination.page, board.pagination.totalPages],
  );

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
                  Leaderboard
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
          <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_48%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">
                <CrownIcon />
                Ranked by OpenRank
              </div>
              <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Competitive leaderboard for your active GitHub community.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                OpenRank now scores 2 points per contribution, 5 per merged
                pull request, 3 per opened issue, and 1 per star received.
                Search by user, switch timeframes, and keep your own position
                pinned in view.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {TIMEFRAME_OPTIONS.map((option) => {
                  const isActive = timeframe === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        startTransition(() => {
                          setTimeframe(option.value);
                          setPage(1);
                        })
                      }
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

              <label className="mt-6 block">
                <span className="sr-only">Search leaderboard</span>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 inline-flex items-center text-slate-400 dark:text-slate-500">
                    <SearchIcon />
                  </span>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setSearchQuery(nextValue);
                      setPage(1);
                    }}
                    placeholder="Search by username or display name"
                    className="h-14 w-full rounded-full border border-slate-200 bg-white/90 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/20"
                  />
                </div>
              </label>

              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                  {formatCompactNumber(board.pagination.total)} ranked users
                </span>
                <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                  Page {board.pagination.page} of {board.pagination.totalPages}
                </span>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white/75 p-6 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Your Position
              </p>
              {user ? (
                <>
                  <div className="mt-6 flex items-center gap-4">
                    <UserAvatar user={user} size="h-14 w-14" />
                    <div>
                      <p className="text-lg font-semibold text-slate-950 dark:text-white">
                        {user.displayName}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-950 px-4 py-4 text-white dark:bg-white dark:text-slate-950">
                      <p className="text-xs uppercase tracking-[0.2em] opacity-70">
                        Rank
                      </p>
                      <p className="mt-2 text-3xl font-semibold">
                        {formatRank(user.rank)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-400 px-4 py-4 text-white">
                      <p className="text-xs uppercase tracking-[0.2em] opacity-80">
                        Score
                      </p>
                      <p className="mt-2 text-3xl font-semibold">
                        {formatCompactNumber(user.score)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-slate-950/30">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Contributions
                      </p>
                      <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                        {formatCompactNumber(user.totalContributions)}
                      </p>
                    </div>
                    <a
                      href={user.profileUrl || `https://github.com/${user.username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="button-secondary px-4 py-2"
                    >
                      View GitHub
                    </a>
                  </div>
                </>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                  We&apos;re syncing your leaderboard position.
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          {(loading && board.podium.length === 0
            ? Array.from({ length: 3 }, (_, index) => ({
                id: `skeleton-${index}`,
                rank: index + 1,
                displayName: "Loading...",
                username: "loading",
                score: 0,
                totalContributions: 0,
              }))
            : board.podium
          ).map((entry) => (
            <PodiumCard key={entry.id || entry.rank} entry={entry} theme={theme} />
          ))}
        </section>

        <section className="surface mt-8 overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Full Rankings
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Page {board.pagination.page} leaderboard results
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  startTransition(() =>
                    setPage((currentPage) => Math.max(1, currentPage - 1)),
                  )
                }
                disabled={!board.pagination.hasPreviousPage}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
              >
                <ChevronLeftIcon />
              </button>
              <button
                type="button"
                onClick={() =>
                  startTransition(() =>
                    setPage((currentPage) =>
                      Math.min(board.pagination.totalPages, currentPage + 1),
                    ),
                  )
                }
                disabled={!board.pagination.hasNextPage}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
              <thead className="bg-slate-50/80 dark:bg-white/5">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Contributions</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Repos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-white/5">
                {board.items.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`transition ${
                      entry.isCurrentUser
                        ? "bg-cyan-500/10"
                        : "bg-transparent hover:bg-slate-50/80 dark:hover:bg-white/5"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-slate-950 dark:text-white">
                      {formatRank(entry.rank)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <UserAvatar user={entry} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">
                              {entry.displayName}
                            </p>
                            {entry.isCurrentUser ? (
                              <span className="rounded-full bg-slate-950 px-2 py-0.5 text-[11px] font-semibold text-white dark:bg-white dark:text-slate-950">
                                You
                              </span>
                            ) : null}
                          </div>
                          <a
                            href={entry.profileUrl || `https://github.com/${entry.username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-slate-500 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-300"
                          >
                            @{entry.username}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {formatCompactNumber(entry.totalContributions)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-950 dark:text-white">
                      {formatCompactNumber(entry.score)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {formatCompactNumber(entry.repositoriesCount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 p-4 md:hidden">
            {board.items.map((entry) => (
              <article
                key={entry.id}
                className={`rounded-[1.75rem] border p-4 ${
                  entry.isCurrentUser
                    ? "border-cyan-400/40 bg-cyan-500/10"
                    : "border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={entry} size="h-12 w-12" />
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-white">
                        {entry.displayName}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        @{entry.username}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Rank
                    </p>
                    <p className="text-lg font-semibold text-slate-950 dark:text-white">
                      {formatRank(entry.rank)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-950/40">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Score
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-950 dark:text-white">
                      {formatCompactNumber(entry.score)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Contrib
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-950 dark:text-white">
                      {formatCompactNumber(entry.totalContributions)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Repos
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-950 dark:text-white">
                      {formatCompactNumber(entry.repositoriesCount)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {!loading && board.items.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              No leaderboard users matched this search yet.
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 px-6 py-5 dark:border-white/10">
            {visiblePages.map((visiblePage) => {
              const isActive = visiblePage === board.pagination.page;

              return (
                <button
                  key={visiblePage}
                  type="button"
                  onClick={() => startTransition(() => setPage(visiblePage))}
                  className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  {visiblePage}
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
