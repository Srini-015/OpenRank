import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogoMark, MoonIcon, SunIcon } from "./components/Icons";
import { getApiErrorMessage } from "./lib/apiError";
import { logoutSession } from "./services/auth";
import { fetchRepositoryDetails } from "./services/repositories";
import { getAppHref, redirectTo } from "./lib/routes";

const THEME_KEY = "openrank-theme";
const LANGUAGE_BAR_STYLES = [
  "from-cyan-500 to-sky-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-indigo-500 to-violet-500",
  "from-rose-500 to-pink-500",
];
const EMPTY_DETAIL = {
  repo: null,
  recentCommits: [],
  languageBreakdown: [],
  topContributors: [],
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

function formatDateTime(value) {
  if (!value) {
    return "Unavailable";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M10 6h8v8M14 10l4-4M18 14v3a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3"
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

function StatTile({ label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white/75 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function ContributorAvatar({ contributor }) {
  if (contributor.avatar) {
    return (
      <img
        src={contributor.avatar}
        alt={`${contributor.username} avatar`}
        className="h-11 w-11 rounded-2xl object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-emerald-400 text-sm font-semibold text-white">
      {(contributor.username || "OR").slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function RepositoryDetail({ repoName }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [data, setData] = useState(EMPTY_DETAIL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logoutPending, setLogoutPending] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    let ignore = false;

    const loadDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetchRepositoryDetails(repoName);

        if (!ignore) {
          setData({
            ...EMPTY_DETAIL,
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

        if (requestError?.response?.status === 404) {
          setError("Repository not found for the authenticated GitHub account.");
        } else {
          setError(
            getApiErrorMessage(
              requestError,
              "Unable to load repository analytics right now.",
            ),
          );
        }

        setData(EMPTY_DETAIL);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      ignore = true;
    };
  }, [repoName]);

  const repo = data.repo;
  const pageClassName =
    theme === "dark"
      ? "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_24%),radial-gradient(circle_at_right,_rgba(251,191,36,0.14),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-white"
      : "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_24%),radial-gradient(circle_at_right,_rgba(251,191,36,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] text-slate-900";

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
              href={getAppHref("/repositories")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
              aria-label="Back to repositories"
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
                  Repo Analytics
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
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="surface relative overflow-hidden p-6 sm:p-8"
        >
          <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_48%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_48%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">
                Repository Detail
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {loading ? "Loading repository..." : repo?.name || repoName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                {repo?.description || "This repository does not have a description yet."}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {repo?.language ? (
                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300">
                    {repo.language}
                  </span>
                ) : null}
                {repo?.visibility ? (
                  <span className="rounded-full bg-slate-500/10 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                    {repo.visibility}
                  </span>
                ) : null}
                {repo?.defaultBranch ? (
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    {repo.defaultBranch}
                  </span>
                ) : null}
                {repo?.archived ? (
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                    Archived
                  </span>
                ) : null}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={repo?.htmlUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="button-primary"
                >
                  Open on GitHub
                </a>
                {repo?.homepage ? (
                  <a
                    href={repo.homepage}
                    target="_blank"
                    rel="noreferrer"
                    className="button-secondary"
                  >
                    Visit Homepage
                  </a>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <StatTile label="Stars" value={formatCompactNumber(repo?.stars)} />
              <StatTile label="Forks" value={formatCompactNumber(repo?.forks)} />
              <StatTile label="Issues" value={formatCompactNumber(repo?.issues)} />
              <StatTile
                label="Last Commit"
                value={
                  repo?.lastCommitDate
                    ? new Date(repo.lastCommitDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"
                }
              />
            </div>
          </div>
        </motion.section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <article className="surface p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Repo Meta
              </p>
              <div className="mt-5 space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-white/10">
                  <div>
                    <p className="text-sm font-medium text-slate-950 dark:text-white">
                      Full Name
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {repo?.fullName || "Unavailable"}
                    </p>
                  </div>
                  {repo?.htmlUrl ? (
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-500 dark:text-cyan-300"
                    >
                      Open <ExternalLinkIcon />
                    </a>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/40">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Updated
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                      {formatDateTime(repo?.updatedAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/40">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Created
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                      {formatDateTime(repo?.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/40">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Watchers
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                      {formatCompactNumber(repo?.watchers)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/40">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Size
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                      {formatCompactNumber(repo?.sizeKb)} KB
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    Topics
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {repo?.topics?.length ? (
                      repo.topics.map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                        >
                          {topic}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No repository topics were found.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </article>

            <article className="surface p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Top Contributors
              </p>
              <div className="mt-5 space-y-4">
                {data.topContributors.length ? (
                  data.topContributors.map((contributor) => (
                    <div
                      key={contributor.id}
                      className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/40"
                    >
                      <div className="flex items-center gap-3">
                        <ContributorAvatar contributor={contributor} />
                        <div>
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">
                            {contributor.username}
                          </p>
                          <a
                            href={contributor.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-300"
                          >
                            View profile
                          </a>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                          Contributions
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                          {formatCompactNumber(contributor.contributions)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Contributor analytics are not available for this repository yet.
                  </p>
                )}
              </div>
            </article>
          </div>

          <div className="space-y-6">
            <article className="surface p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Language Breakdown
              </p>
              <div className="mt-5 space-y-4">
                {data.languageBreakdown.length ? (
                  data.languageBreakdown.map((language, index) => (
                    <div key={language.name}>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <p className="font-medium text-slate-950 dark:text-white">
                          {language.name}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">
                          {language.percentage}%
                        </p>
                      </div>
                      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${LANGUAGE_BAR_STYLES[index % LANGUAGE_BAR_STYLES.length]}`}
                          style={{ width: `${language.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No language statistics were returned for this repository.
                  </p>
                )}
              </div>
            </article>

            <article className="surface p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Recent Commits
              </p>
              <div className="mt-5 space-y-4">
                {data.recentCommits.length ? (
                  data.recentCommits.map((commit) => (
                    <div
                      key={commit.sha}
                      className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">
                            {commit.message}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                            {commit.shortSha}
                          </p>
                        </div>
                        <a
                          href={commit.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-500 dark:text-cyan-300"
                        >
                          Open <ExternalLinkIcon />
                        </a>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>{commit.authorName}</span>
                        <span>{formatDateTime(commit.authoredAt)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No recent commit activity was returned for this repository.
                  </p>
                )}
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
