import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import { LogoMark, MoonIcon, SunIcon } from "./components/Icons";
import { logoutSession } from "./services/auth";
import { fetchRepositories } from "./services/repositories";
import { getAppHref, redirectTo } from "./lib/routes";

const THEME_KEY = "openrank-theme";
const SORT_OPTIONS = [
  { value: "activity", label: "Activity" },
  { value: "stars", label: "Stars" },
];
const EMPTY_STATE = {
  items: [],
  total: 0,
  filters: {
    search: "",
    sort: "activity",
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

function formatDate(value) {
  if (!value) {
    return "No activity";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeDate(value) {
  if (!value) {
    return "No recent pushes";
  }

  const diff = Date.now() - new Date(value).getTime();
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "Updated today";
  }

  if (diffDays === 1) {
    return "Updated yesterday";
  }

  if (diffDays < 30) {
    return `Updated ${diffDays}d ago`;
  }

  return `Updated ${Math.floor(diffDays / 30)}mo ago`;
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

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="m12 4 2.3 4.7 5.2.8-3.8 3.7.9 5.3L12 16l-4.6 2.5.9-5.3-3.8-3.7 5.2-.8L12 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GitBranchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M7 6.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17 22.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM7 6.5v10a5 5 0 0 0 5 5h2.5M17 17.5v-10M17 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IssueIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 8v4M12 15.5h.01"
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

function SummaryCard({ label, value, icon, accent }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white/75 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function RepositoryInsights() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("activity");
  const [data, setData] = useState(EMPTY_STATE);
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

    const loadRepositories = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetchRepositories({
          search: deferredSearch,
          sort,
        });

        if (!ignore) {
          setData({
            ...EMPTY_STATE,
            ...response,
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

        setError("Unable to load repository insights right now.");
        setData(EMPTY_STATE);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadRepositories();

    return () => {
      ignore = true;
    };
  }, [deferredSearch, sort]);

  const summary = useMemo(() => {
    const totalStars = data.items.reduce((sum, repo) => sum + repo.stars, 0);
    const totalForks = data.items.reduce((sum, repo) => sum + repo.forks, 0);
    const totalIssues = data.items.reduce((sum, repo) => sum + repo.issues, 0);
    const activeRepos = data.items.filter((repo) => {
      const lastCommit = new Date(repo.lastCommitDate).getTime();

      if (Number.isNaN(lastCommit)) {
        return false;
      }

      return Date.now() - lastCommit <= 1000 * 60 * 60 * 24 * 30;
    }).length;

    return {
      totalStars,
      totalForks,
      totalIssues,
      activeRepos,
    };
  }, [data.items]);

  const pageClassName =
    theme === "dark"
      ? "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_24%),radial-gradient(circle_at_right,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-white"
      : "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_24%),radial-gradient(circle_at_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] text-slate-900";

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
                  Repository Insights
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
          <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_48%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_48%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
                Repository Health
              </div>
              <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Explore every public GitHub repository in your workspace.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Search by repo name, sort by activity or stars, then drill into a
                dedicated analytics view for commit history, language usage, and
                contributor context.
              </p>

              <label className="mt-6 block">
                <span className="sr-only">Search repositories</span>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 inline-flex items-center text-slate-400 dark:text-slate-500">
                    <SearchIcon />
                  </span>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by repository name, description, or language"
                    className="h-14 w-full rounded-full border border-slate-200 bg-white/90 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/20"
                  />
                </div>
              </label>

              <div className="mt-5 flex flex-wrap gap-3">
                {SORT_OPTIONS.map((option) => {
                  const isActive = sort === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => startTransition(() => setSort(option.value))}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-slate-950 text-white shadow-lg dark:bg-white dark:text-slate-950"
                          : "border border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                      }`}
                    >
                      Sort by {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SummaryCard
                label="Repositories"
                value={formatCompactNumber(data.total)}
                icon={<GitBranchIcon />}
                accent="bg-cyan-500/15 text-cyan-600 dark:text-cyan-300"
              />
              <SummaryCard
                label="Total Stars"
                value={formatCompactNumber(summary.totalStars)}
                icon={<StarIcon />}
                accent="bg-amber-500/15 text-amber-600 dark:text-amber-300"
              />
              <SummaryCard
                label="Forks"
                value={formatCompactNumber(summary.totalForks)}
                icon={<GitBranchIcon />}
                accent="bg-indigo-500/15 text-indigo-600 dark:text-indigo-300"
              />
              <SummaryCard
                label="Active 30d"
                value={formatCompactNumber(summary.activeRepos)}
                icon={<IssueIcon />}
                accent="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
              />
            </div>
          </div>
        </motion.section>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <section className="surface mt-8 overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Repository List
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {loading ? "Loading repositories..." : `${data.total} repositories found`}
              </h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              Sorted by {sort}
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
              <thead className="bg-slate-50/80 dark:bg-white/5">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4">Repository</th>
                  <th className="px-6 py-4">Stars</th>
                  <th className="px-6 py-4">Forks</th>
                  <th className="px-6 py-4">Issues</th>
                  <th className="px-6 py-4">Last Commit</th>
                  <th className="px-6 py-4 text-right">Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-white/5">
                {data.items.map((repo) => (
                  <tr
                    key={repo.id}
                    className="bg-transparent transition hover:bg-slate-50/80 dark:hover:bg-white/5"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">
                          {repo.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {repo.description || "No description provided."}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {repo.language ? (
                            <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300">
                              {repo.language}
                            </span>
                          ) : null}
                          {repo.archived ? (
                            <span className="rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                              Archived
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {formatCompactNumber(repo.stars)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {formatCompactNumber(repo.forks)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {formatCompactNumber(repo.issues)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-950 dark:text-white">
                        {formatDate(repo.lastCommitDate)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatRelativeDate(repo.lastCommitDate)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={getAppHref(`/repositories/${encodeURIComponent(repo.name)}`)}
                        className="button-secondary px-4 py-2"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 p-4 md:hidden">
            {data.items.map((repo) => (
              <article
                key={repo.id}
                className="rounded-[1.75rem] border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-slate-950 dark:text-white">
                      {repo.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {repo.description || "No description provided."}
                    </p>
                  </div>
                  <a
                    href={getAppHref(`/repositories/${encodeURIComponent(repo.name)}`)}
                    className="button-secondary px-3 py-2"
                  >
                    Open
                  </a>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/40">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Stars
                    </p>
                    <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                      {formatCompactNumber(repo.stars)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Forks
                    </p>
                    <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                      {formatCompactNumber(repo.forks)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Issues
                    </p>
                    <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                      {formatCompactNumber(repo.issues)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Last Commit
                    </p>
                    <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                      {formatDate(repo.lastCommitDate)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {!loading && data.items.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              No repositories matched this search.
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
