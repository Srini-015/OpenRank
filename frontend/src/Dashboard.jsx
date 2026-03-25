import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/dashboard/Sidebar";
import Topbar from "./components/dashboard/Topbar";
import ProfilePanel from "./components/dashboard/ProfilePanel";
import StatCard from "./components/dashboard/StatCard";
import ChartSection from "./components/dashboard/ChartSection";
import Heatmap from "./components/dashboard/Heatmap";
import ActivityFeed from "./components/dashboard/ActivityFeed";
import { fetchCurrentUser, logoutSession } from "./services/auth";
import { fetchDashboardOverview } from "./services/dashboard";
import { getApiErrorMessage } from "./lib/apiError";
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

function formatSyncTimestamp(dateValue) {
  if (!dateValue) {
    return "";
  }

  return new Date(dateValue).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function ContributionsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M7 12h10M12 7v10M5.5 4.5h13A1.5 1.5 0 0 1 20 6v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V6A1.5 1.5 0 0 1 5.5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="m12 4 2.3 4.7 5.2.8-3.8 3.7.9 5.3L12 16l-4.6 2.5.9-5.3-3.8-3.7 5.2-.8L12 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RepositoryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M7 5h9.5A2.5 2.5 0 0 1 19 7.5v9A2.5 2.5 0 0 1 16.5 19H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM9 5v14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FollowersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M16.5 7.5A2.5 2.5 0 1 1 14 5a2.5 2.5 0 0 1 2.5 2.5ZM10 9A3 3 0 1 1 7 6a3 3 0 0 1 3 3ZM14 18.5a4 4 0 0 1 8 0M2.5 18a4.5 4.5 0 0 1 9 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FollowingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M15 6.5h5M17.5 4v5M8.5 11.5A3.5 3.5 0 1 0 8.5 4.5a3.5 3.5 0 0 0 0 7ZM3.5 19a5 5 0 0 1 10 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function createEmptyHeatmap() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonday = new Date(today);
  const mondayOffset = (currentMonday.getDay() + 6) % 7;
  currentMonday.setDate(currentMonday.getDate() - mondayOffset);

  return Array.from({ length: 18 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(currentMonday);
      date.setDate(currentMonday.getDate() - (17 - weekIndex) * 7 + dayIndex);

      return {
        date: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        count: 0,
        level: 0,
      };
    }),
  );
}

function createEmptyContributionSeries() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (13 - index));

    return {
      date: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      contributions: 0,
    };
  });
}

function createEmptyWeeklySeries() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonday = new Date(today);
  const mondayOffset = (currentMonday.getDay() + 6) % 7;
  currentMonday.setDate(currentMonday.getDate() - mondayOffset);

  return Array.from({ length: 12 }, (_, index) => {
    const weekStart = new Date(currentMonday);
    weekStart.setDate(currentMonday.getDate() - (11 - index) * 7);

    return {
      label: weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      contributions: 0,
    };
  });
}

function createEmptyMonthlySeries() {
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  return Array.from({ length: 6 }, (_, index) => {
    const monthStart = new Date(currentMonth);
    monthStart.setMonth(currentMonth.getMonth() - (5 - index));

    return {
      label: monthStart.toLocaleDateString("en-US", {
        month: "short",
      }),
      contributions: 0,
    };
  });
}

const EMPTY_OVERVIEW = {
  stats: {
    openRankScore: 0,
    totalContributions: 0,
    repositoriesCount: 0,
    followers: 0,
    following: 0,
    scoreBreakdown: {
      contributions: 0,
      pullRequestsMerged: 0,
      issuesOpened: 0,
      starsReceived: 0,
    },
  },
  contributionSeries: createEmptyContributionSeries(),
  eventBreakdown: [],
  recentActivity: [],
  analytics: {
    weeklyContributionSeries: createEmptyWeeklySeries(),
    monthlyContributionSeries: createEmptyMonthlySeries(),
    languageBreakdown: [],
    repoActivityComparison: [],
    streaks: {
      current: 0,
      longest: 0,
      activeDays: 0,
    },
  },
  heatmap: createEmptyHeatmap(),
  lastSyncAt: "",
  syncStatus: {
    synced: true,
    message: "",
  },
};

export default function Dashboard() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [logoutPending, setLogoutPending] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const hashToSection = {
      "#overview": "Dashboard",
      "#analytics": "Analytics",
      "#activity": "Activity",
      "#profile": "Profile",
    };

    const syncActiveItem = () => {
      const nextItem = hashToSection[window.location.hash] || "Dashboard";
      setActiveItem(nextItem);
    };

    syncActiveItem();
    window.addEventListener("hashchange", syncActiveItem);

    return () => window.removeEventListener("hashchange", syncActiveItem);
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      const [userResult, overviewResult] = await Promise.allSettled([
        fetchCurrentUser(),
        fetchDashboardOverview(),
      ]);

      if (ignore) {
        return;
      }

      if (userResult.status === "rejected") {
        if (userResult.reason?.response?.status === 401) {
          redirectTo("/login");
          return;
        }

        setError(
          getApiErrorMessage(
            userResult.reason,
            "Unable to load your authenticated session.",
          ),
        );
        setLoading(false);
        return;
      }

      setUserProfile(userResult.value);

      if (overviewResult.status === "fulfilled") {
        const nextOverview = {
          ...EMPTY_OVERVIEW,
          ...overviewResult.value,
        };
        setOverview(nextOverview);
        setError(
          nextOverview.syncStatus?.synced === false
            ? nextOverview.syncStatus.message ||
                "We signed you in, but GitHub activity could not be loaded right now."
            : "",
        );
      } else {
        setOverview(EMPTY_OVERVIEW);
        setError(
          getApiErrorMessage(
            overviewResult.reason,
            "We signed you in, but GitHub activity could not be loaded right now.",
          ),
        );
      }

      setLoading(false);
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredActivity = useMemo(() => {
    if (!normalizedQuery) {
      return overview.recentActivity;
    }

    return overview.recentActivity.filter((item) =>
      [item.repo, item.title, item.branch, item.typeLabel]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [normalizedQuery, overview.recentActivity]);

  const stats = useMemo(
    () => [
      {
        title: "OpenRank Score",
        value: formatCompactNumber(overview.stats.openRankScore),
        trend: "Auto synced",
        description: "2x contributions + 5x merged PR + 3x issues + 1x stars",
        icon: <ScoreIcon />,
        accentClassName:
          "bg-gradient-to-br from-amber-500/15 to-orange-500/20 text-amber-500 dark:text-amber-300",
        badgeClassName:
          "bg-amber-500/15 text-amber-600 dark:text-amber-300",
      },
      {
        title: "Total Contributions",
        value: formatCompactNumber(overview.stats.totalContributions),
        trend: `${formatCompactNumber(overview.stats.scoreBreakdown.contributions)} scored units`,
        description: "Public activity used in the OpenRank formula",
        icon: <ContributionsIcon />,
        accentClassName:
          "bg-gradient-to-br from-cyan-500/15 to-sky-500/20 text-cyan-500 dark:text-cyan-300",
        badgeClassName:
          "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300",
      },
      {
        title: "Repositories Count",
        value: formatCompactNumber(overview.stats.repositoriesCount),
        trend: "Live",
        description: "Public repositories on GitHub",
        icon: <RepositoryIcon />,
        accentClassName:
          "bg-gradient-to-br from-emerald-500/15 to-teal-500/20 text-emerald-500 dark:text-emerald-300",
        badgeClassName:
          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
      },
      {
        title: "Followers",
        value: formatCompactNumber(overview.stats.followers),
        trend: "Audience",
        description: "People following your work",
        icon: <FollowersIcon />,
        accentClassName:
          "bg-gradient-to-br from-indigo-500/15 to-violet-500/20 text-indigo-500 dark:text-indigo-300",
        badgeClassName:
          "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
      },
      {
        title: "Following",
        value: formatCompactNumber(overview.stats.following),
        trend: "Network",
        description: "Developers and projects you follow",
        icon: <FollowingIcon />,
        accentClassName:
          "bg-gradient-to-br from-amber-500/15 to-orange-500/20 text-amber-500 dark:text-amber-300",
        badgeClassName:
          "bg-amber-500/15 text-amber-600 dark:text-amber-300",
      },
    ],
    [overview.stats],
  );

  const pageClassName =
    theme === "dark"
      ? "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-white transition-colors duration-300"
      : "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] text-slate-900 transition-colors duration-300";

  const welcomeName =
    userProfile?.displayName || userProfile?.username || "developer";
  const lastSyncLabel = formatSyncTimestamp(overview.lastSyncAt);

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
    <div className={pageClassName}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem={activeItem}
        onItemSelect={setActiveItem}
        repositoriesCount={overview.stats.repositoriesCount}
        lastSyncLabel={lastSyncLabel}
      />

      <div className="lg:pl-72">
        <Topbar
          theme={theme}
          onThemeToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMenuOpen={() => setSidebarOpen(true)}
          user={userProfile}
          onLogout={handleLogout}
          logoutPending={logoutPending}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <section id="overview" className="scroll-mt-24">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
                    Dashboard
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    Welcome back, {welcomeName}
                  </h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Your authenticated OpenRank dashboard now reflects your latest
                    public GitHub profile, activity, and network snapshot.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    {lastSyncLabel ? `Last sync: ${lastSyncLabel}` : "Syncing GitHub data..."}
                  </div>
                  <a
                    href={getAppHref("/repositories")}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                  >
                    Repositories
                  </a>
                  <a
                    href={getAppHref("/leaderboard")}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                  >
                    Leaderboard
                  </a>
                  <a
                    href={getAppHref("/settings")}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                  >
                    Settings
                  </a>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={logoutPending}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 sm:hidden"
                  >
                    {logoutPending ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                  {error}
                </div>
              ) : null}

              <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <section id="profile" className="scroll-mt-24">
                  <ProfilePanel user={userProfile} loading={loading} />
                </section>

                <div className="grid gap-4 sm:grid-cols-2">
                  {stats.map((stat, index) => (
                    <StatCard
                      key={stat.title}
                      {...stat}
                      delay={0.05 * index}
                      loading={loading}
                    />
                  ))}
                </div>
              </div>
            </section>

            <Heatmap
              weeks={overview.heatmap}
              theme={theme}
              loading={loading}
            />

            <section id="analytics" className="scroll-mt-24">
              <ChartSection
                analytics={overview.analytics}
                theme={theme}
                loading={loading}
              />
            </section>

            <section id="activity" className="scroll-mt-24">
              <ActivityFeed items={filteredActivity} loading={loading} />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
