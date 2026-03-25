import axios from "axios";
import { serializeAuthUser } from "./serializeAuthUser.js";
import {
  getGitHubHeaders,
  normalizeGitHubServiceError,
} from "./githubApi.js";

const GITHUB_API_BASE_URL = "https://api.github.com";
const HEATMAP_WEEKS = 18;
const HEATMAP_DAYS = HEATMAP_WEEKS * 7;
const CHART_DAYS = 14;
const MAX_EVENT_PAGES = 3;
const EVENTS_PER_PAGE = 100;
const ACTIVITY_HISTORY_DAYS = 180;
const WEEKLY_CHART_WEEKS = 12;
const MONTHLY_CHART_MONTHS = 6;
const MAX_REPOSITORY_PAGES = 6;
const LEADERBOARD_STALE_MS = 15 * 60 * 1000;

const formatDateKey = (date) => date.toISOString().slice(0, 10);

const getSafeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getHeatLevel = (count) => {
  if (count >= 8) {
    return 4;
  }

  if (count >= 5) {
    return 3;
  }

  if (count >= 3) {
    return 2;
  }

  if (count >= 1) {
    return 1;
  }

  return 0;
};

const formatRelativeTime = (value) => {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "Recently";
  }

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const getBranchName = (ref = "") => ref.split("/").pop() || "main";

const getEventWeight = (event) => {
  switch (event.type) {
    case "PushEvent":
      return Math.max(
        event.payload?.size || 0,
        event.payload?.commits?.length || 0,
        1,
      );
    case "PullRequestEvent":
      return 2;
    case "IssuesEvent":
    case "IssueCommentEvent":
    case "PullRequestReviewEvent":
    case "CreateEvent":
      return 1;
    default:
      return 1;
  }
};

const getEventMeta = (event) => {
  switch (event.type) {
    case "PushEvent":
      return {
        category: "Commits",
        type: "commit",
        typeLabel: "CM",
      };
    case "PullRequestEvent":
      return {
        category: "Pull Requests",
        type: "pull_request",
        typeLabel: "PR",
      };
    case "IssuesEvent":
    case "IssueCommentEvent":
      return {
        category: "Issues",
        type: "issue",
        typeLabel: "IS",
      };
    case "PullRequestReviewEvent":
      return {
        category: "Reviews",
        type: "review",
        typeLabel: "RV",
      };
    default:
      return {
        category: "Other",
        type: "commit",
        typeLabel: "EV",
      };
  }
};

const buildEventTitle = (event) => {
  const repoName = event.repo?.name || "this repository";

  switch (event.type) {
    case "PushEvent": {
      const commitCount = Math.max(
        event.payload?.size || 0,
        event.payload?.commits?.length || 0,
        1,
      );
      const branch = getBranchName(event.payload?.ref);
      return `Pushed ${commitCount} commit${commitCount === 1 ? "" : "s"} to ${branch}`;
    }
    case "PullRequestEvent": {
      const action = event.payload?.action || "updated";
      const number = event.payload?.number;
      const title = event.payload?.pull_request?.title || "a pull request";
      return `${action[0].toUpperCase()}${action.slice(1)} PR #${number}: ${title}`;
    }
    case "IssuesEvent": {
      const action = event.payload?.action || "updated";
      const issue = event.payload?.issue;
      return `${action[0].toUpperCase()}${action.slice(1)} issue #${issue?.number}: ${issue?.title || "issue update"}`;
    }
    case "IssueCommentEvent": {
      const issue = event.payload?.issue;
      return `Commented on issue #${issue?.number}: ${issue?.title || repoName}`;
    }
    case "PullRequestReviewEvent": {
      const pullRequest = event.payload?.pull_request;
      return `Reviewed PR #${pullRequest?.number}: ${pullRequest?.title || repoName}`;
    }
    case "CreateEvent": {
      const refType = event.payload?.ref_type || "resource";
      const refName = event.payload?.ref || repoName;
      return `Created ${refType} ${refName}`;
    }
    default:
      return `Recorded ${event.type.replace(/Event$/, "")} activity in ${repoName}`;
  }
};

const buildEventUrl = (event) =>
  event.payload?.pull_request?.html_url ||
  event.payload?.issue?.html_url ||
  (event.repo?.name ? `https://github.com/${event.repo.name}` : "");

const buildDailyCounts = (events) => {
  const counts = {};
  const threshold = new Date();
  threshold.setHours(0, 0, 0, 0);
  threshold.setDate(threshold.getDate() - (ACTIVITY_HISTORY_DAYS - 1));

  events.forEach((event) => {
    const createdAt = new Date(event.created_at);

    if (Number.isNaN(createdAt.getTime()) || createdAt < threshold) {
      return;
    }

    const dateKey = formatDateKey(createdAt);
    counts[dateKey] = (counts[dateKey] || 0) + getEventWeight(event);
  });

  return counts;
};

const sumContributionsForDays = (dailyCounts, days) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    return dailyCounts[formatDateKey(date)] || 0;
  }).reduce((total, value) => total + value, 0);
};

const SCORE_WEIGHTS = Object.freeze({
  contributions: 2,
  pullRequestsMerged: 5,
  issuesOpened: 3,
  starsReceived: 1,
});

const isMergedPullRequestEvent = (event) =>
  event.type === "PullRequestEvent" &&
  event.payload?.action === "closed" &&
  Boolean(
    event.payload?.pull_request?.merged ||
      event.payload?.pull_request?.merged_at,
  );

const isOpenedIssueEvent = (event) =>
  event.type === "IssuesEvent" && event.payload?.action === "opened";

const getWindowThreshold = (days) => {
  if (!days) {
    return null;
  }

  const threshold = new Date();
  threshold.setHours(0, 0, 0, 0);
  threshold.setDate(threshold.getDate() - (days - 1));
  return threshold;
};

const countMatchingEvents = (events, predicate, { days } = {}) => {
  const threshold = getWindowThreshold(days);

  return events.reduce((total, event) => {
    if (!predicate(event)) {
      return total;
    }

    const createdAt = new Date(event.created_at);

    if (Number.isNaN(createdAt.getTime())) {
      return total;
    }

    if (threshold && createdAt < threshold) {
      return total;
    }

    return total + 1;
  }, 0);
};

const sumRepositoryStars = (repositories) =>
  repositories.reduce(
    (total, repository) => total + getSafeNumber(repository?.stargazers_count),
    0,
  );

const buildScoreBreakdown = (period = {}) => ({
  contributions: getSafeNumber(period?.contributions),
  pullRequestsMerged: getSafeNumber(period?.pullRequestsMerged),
  issuesOpened: getSafeNumber(period?.issuesOpened),
  starsReceived: getSafeNumber(period?.starsReceived),
});

export const calculateOpenRankScore = ({
  contributions = 0,
  pullRequestsMerged = 0,
  issuesOpened = 0,
  starsReceived = 0,
}) =>
  Math.round(
    contributions * SCORE_WEIGHTS.contributions +
      pullRequestsMerged * SCORE_WEIGHTS.pullRequestsMerged +
      issuesOpened * SCORE_WEIGHTS.issuesOpened +
      starsReceived * SCORE_WEIGHTS.starsReceived,
  );

const buildScoredPeriod = (period = {}) => {
  const metrics = buildScoreBreakdown(period);

  return {
    ...metrics,
    score: calculateOpenRankScore(metrics),
  };
};

const buildContributionSeries = (dailyCounts) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: CHART_DAYS }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (CHART_DAYS - 1 - index));
    const dateKey = formatDateKey(date);

    return {
      date: dateKey,
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      contributions: dailyCounts[dateKey] || 0,
    };
  });
};

const buildWeeklyContributionSeries = (dailyCounts) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonday = new Date(today);
  const mondayOffset = (currentMonday.getDay() + 6) % 7;
  currentMonday.setDate(currentMonday.getDate() - mondayOffset);

  return Array.from({ length: WEEKLY_CHART_WEEKS }, (_, index) => {
    const weekStart = new Date(currentMonday);
    weekStart.setDate(
      currentMonday.getDate() - (WEEKLY_CHART_WEEKS - 1 - index) * 7,
    );

    const contributions = Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + dayIndex);
      return dailyCounts[formatDateKey(date)] || 0;
    }).reduce((total, value) => total + value, 0);

    return {
      label: weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      startDate: formatDateKey(weekStart),
      contributions,
    };
  });
};

const buildMonthlyContributionSeries = (dailyCounts) => {
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  return Array.from({ length: MONTHLY_CHART_MONTHS }, (_, index) => {
    const monthStart = new Date(currentMonth);
    monthStart.setMonth(
      currentMonth.getMonth() - (MONTHLY_CHART_MONTHS - 1 - index),
    );

    const nextMonth = new Date(monthStart);
    nextMonth.setMonth(monthStart.getMonth() + 1);

    let contributions = 0;
    const cursor = new Date(monthStart);

    while (cursor < nextMonth) {
      contributions += dailyCounts[formatDateKey(cursor)] || 0;
      cursor.setDate(cursor.getDate() + 1);
    }

    return {
      label: monthStart.toLocaleDateString("en-US", {
        month: "short",
      }),
      monthKey: monthStart.toISOString().slice(0, 7),
      contributions,
    };
  });
};

const buildHeatmap = (dailyCounts) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonday = new Date(today);
  const mondayOffset = (currentMonday.getDay() + 6) % 7;
  currentMonday.setDate(currentMonday.getDate() - mondayOffset);

  return Array.from({ length: HEATMAP_WEEKS }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(currentMonday);
      date.setDate(
        currentMonday.getDate() -
          (HEATMAP_WEEKS - 1 - weekIndex) * 7 +
          dayIndex,
      );
      const dateKey = formatDateKey(date);
      const count = dailyCounts[dateKey] || 0;

      return {
        date: dateKey,
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        count,
        level: getHeatLevel(count),
      };
    }),
  );
};

const buildStreaks = (dailyCounts) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activityDays = Array.from({ length: ACTIVITY_HISTORY_DAYS }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (ACTIVITY_HISTORY_DAYS - 1 - index));

    return {
      dateKey: formatDateKey(date),
      count: dailyCounts[formatDateKey(date)] || 0,
    };
  });

  let current = 0;

  for (let index = activityDays.length - 1; index >= 0; index -= 1) {
    if (activityDays[index].count > 0) {
      current += 1;
      continue;
    }

    break;
  }

  let longest = 0;
  let running = 0;
  let activeDays = 0;

  activityDays.forEach((entry) => {
    if (entry.count > 0) {
      running += 1;
      activeDays += 1;
      longest = Math.max(longest, running);
      return;
    }

    running = 0;
  });

  return {
    current,
    longest,
    activeDays,
  };
};

const buildRepoActivityComparison = (events) => {
  const totals = events.reduce((accumulator, event) => {
    const repoName = event.repo?.name;

    if (!repoName) {
      return accumulator;
    }

    const current = accumulator[repoName] || {
      fullName: repoName,
      name: repoName.split("/").pop() || repoName,
      contributions: 0,
      events: 0,
    };

    current.contributions += getEventWeight(event);
    current.events += 1;
    accumulator[repoName] = current;
    return accumulator;
  }, {});

  return Object.values(totals)
    .sort((left, right) => {
      const byContributions = right.contributions - left.contributions;

      if (byContributions !== 0) {
        return byContributions;
      }

      return right.events - left.events;
    })
    .slice(0, 6);
};

const buildLanguageBreakdown = (repositories) => {
  const totals = repositories.reduce((accumulator, repository) => {
    const language = repository.language || "Other";
    const weight = Math.max(getSafeNumber(repository.size), 1);
    accumulator[language] = (accumulator[language] || 0) + weight;
    return accumulator;
  }, {});

  const entries = Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value);

  if (entries.length <= 5) {
    return entries;
  }

  const topEntries = entries.slice(0, 5);
  const otherValue = entries
    .slice(5)
    .reduce((total, entry) => total + entry.value, 0);

  return [...topEntries, { name: "Other", value: otherValue }];
};

const buildEventBreakdown = (events) => {
  const totals = events.reduce((accumulator, event) => {
    const { category } = getEventMeta(event);
    accumulator[category] = (accumulator[category] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);
};

const buildRecentActivity = (events) =>
  events.slice(0, 8).map((event) => {
    const meta = getEventMeta(event);

    return {
      id: event.id,
      repo: event.repo?.name || "unknown/repository",
      title: buildEventTitle(event),
      branch: getBranchName(event.payload?.ref),
      time: formatRelativeTime(event.created_at),
      type: meta.type,
      typeLabel: meta.typeLabel,
      url: buildEventUrl(event),
      createdAt: event.created_at,
    };
  });

const fetchGitHubUserProfile = async (user) => {
  const username = user?.username;
  const response = await axios.get(`${GITHUB_API_BASE_URL}/users/${username}`, {
    headers: getGitHubHeaders({
      user,
      userAgent: "openrank-dashboard",
    }),
  });

  return response.data;
};

const fetchGitHubEvents = async (user) => {
  const username = user?.username;
  const responses = await Promise.allSettled(
    Array.from({ length: MAX_EVENT_PAGES }, (_, index) =>
      axios.get(`${GITHUB_API_BASE_URL}/users/${username}/events/public`, {
        headers: getGitHubHeaders({
          user,
          userAgent: "openrank-dashboard",
        }),
        params: {
          per_page: EVENTS_PER_PAGE,
          page: index + 1,
        },
      }),
    ),
  );

  return responses
    .filter((response) => response.status === "fulfilled")
    .flatMap((response) => response.value.data);
};

const fetchGitHubRepositories = async (user) => {
  const username = user?.username;
  const repositories = [];

  for (let page = 1; page <= MAX_REPOSITORY_PAGES; page += 1) {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/users/${username}/repos`, {
      headers: getGitHubHeaders({
        user,
        userAgent: "openrank-dashboard",
      }),
      params: {
        per_page: EVENTS_PER_PAGE,
        page,
        type: "owner",
        sort: "updated",
        direction: "desc",
      },
    });

    const pageItems = Array.isArray(response.data) ? response.data : [];
    repositories.push(...pageItems);

    if (pageItems.length < EVENTS_PER_PAGE) {
      break;
    }
  }

  return repositories;
};

const buildLeaderboardSnapshot = ({
  dailyCounts,
  githubProfile,
  githubEvents,
  githubRepositories,
  existingLeaderboard,
}) => {
  const repositoriesCount = getSafeNumber(githubProfile?.public_repos);
  const followers = getSafeNumber(githubProfile?.followers);
  const following = getSafeNumber(githubProfile?.following);
  const totalRepositoryStars = sumRepositoryStars(githubRepositories);
  const activityWindowContributions = Object.values(dailyCounts).reduce(
    (total, count) => total + getSafeNumber(count),
    0,
  );
  const weeklyContributions = sumContributionsForDays(dailyCounts, 7);
  const monthlyContributions = sumContributionsForDays(dailyCounts, 30);
  const weeklyMergedPullRequests = countMatchingEvents(
    githubEvents,
    isMergedPullRequestEvent,
    { days: 7 },
  );
  const monthlyMergedPullRequests = countMatchingEvents(
    githubEvents,
    isMergedPullRequestEvent,
    { days: 30 },
  );
  const mergedPullRequestsWindow = countMatchingEvents(
    githubEvents,
    isMergedPullRequestEvent,
  );
  const weeklyIssuesOpened = countMatchingEvents(
    githubEvents,
    isOpenedIssueEvent,
    { days: 7 },
  );
  const monthlyIssuesOpened = countMatchingEvents(
    githubEvents,
    isOpenedIssueEvent,
    { days: 30 },
  );
  const issuesOpenedWindow = countMatchingEvents(
    githubEvents,
    isOpenedIssueEvent,
  );
  const existingAllTime = buildScoreBreakdown(existingLeaderboard?.allTime);
  const lastSyncedAt = new Date();
  const allTimeMetrics = {
    contributions: Math.max(
      existingAllTime.contributions,
      activityWindowContributions,
    ),
    pullRequestsMerged: Math.max(
      existingAllTime.pullRequestsMerged,
      mergedPullRequestsWindow,
    ),
    issuesOpened: Math.max(existingAllTime.issuesOpened, issuesOpenedWindow),
    starsReceived: Math.max(existingAllTime.starsReceived, totalRepositoryStars),
  };

  return {
    repositoriesCount,
    followers,
    following,
    activityWindowContributions,
    lastSyncedAt,
    weekly: buildScoredPeriod({
      contributions: weeklyContributions,
      pullRequestsMerged: weeklyMergedPullRequests,
      issuesOpened: weeklyIssuesOpened,
      starsReceived: 0,
    }),
    monthly: buildScoredPeriod({
      contributions: monthlyContributions,
      pullRequestsMerged: monthlyMergedPullRequests,
      issuesOpened: monthlyIssuesOpened,
      starsReceived: 0,
    }),
    allTime: buildScoredPeriod(allTimeMetrics),
  };
};

const buildEmptyAnalytics = () => ({
  weeklyContributionSeries: buildWeeklyContributionSeries({}),
  monthlyContributionSeries: buildMonthlyContributionSeries({}),
  languageBreakdown: [],
  repoActivityComparison: [],
  streaks: {
    current: 0,
    longest: 0,
    activeDays: 0,
  },
});

const buildDashboardAnalytics = ({
  dailyCounts,
  githubEvents,
  githubRepositories,
}) => ({
  weeklyContributionSeries: buildWeeklyContributionSeries(dailyCounts),
  monthlyContributionSeries: buildMonthlyContributionSeries(dailyCounts),
  languageBreakdown: buildLanguageBreakdown(githubRepositories),
  repoActivityComparison: buildRepoActivityComparison(githubEvents),
  streaks: buildStreaks(dailyCounts),
});

const buildFallbackOverview = (user, cachedLeaderboard = {}) => ({
  user,
  stats: {
    totalContributions: getSafeNumber(
      cachedLeaderboard.activityWindowContributions,
    ),
    openRankScore: getSafeNumber(cachedLeaderboard.allTime?.score),
    repositoriesCount: getSafeNumber(cachedLeaderboard.repositoriesCount),
    followers: getSafeNumber(cachedLeaderboard.followers),
    following: getSafeNumber(cachedLeaderboard.following),
    scoreBreakdown: buildScoreBreakdown(cachedLeaderboard.allTime),
  },
  contributionSeries: buildContributionSeries({}),
  eventBreakdown: [],
  recentActivity: [],
  analytics: buildEmptyAnalytics(),
  heatmap: buildHeatmap({}),
  lastSyncAt: cachedLeaderboard.lastSyncedAt || new Date().toISOString(),
});

const buildDashboardOverview = ({
  user,
  githubProfile,
  githubEvents,
  githubRepositories,
  dailyCounts,
  leaderboard,
}) => ({
  user,
  stats: {
    totalContributions: getSafeNumber(
      leaderboard?.activityWindowContributions,
    ),
    openRankScore: getSafeNumber(leaderboard?.allTime?.score),
    repositoriesCount: getSafeNumber(githubProfile?.public_repos),
    followers: getSafeNumber(githubProfile?.followers),
    following: getSafeNumber(githubProfile?.following),
    scoreBreakdown: buildScoreBreakdown(leaderboard?.allTime),
  },
  contributionSeries: buildContributionSeries(dailyCounts),
  eventBreakdown: buildEventBreakdown(githubEvents),
  recentActivity: buildRecentActivity(githubEvents),
  analytics: buildDashboardAnalytics({
    dailyCounts,
    githubEvents,
    githubRepositories,
  }),
  heatmap: buildHeatmap(dailyCounts),
  lastSyncAt: leaderboard?.lastSyncedAt || new Date().toISOString(),
});

export const shouldRefreshLeaderboard = (userDoc) => {
  const lastSyncedAt = userDoc?.leaderboard?.lastSyncedAt;

  if (!lastSyncedAt) {
    return true;
  }

  const parsed = new Date(lastSyncedAt).getTime();

  if (Number.isNaN(parsed)) {
    return true;
  }

  return Date.now() - parsed >= LEADERBOARD_STALE_MS;
};

export const syncUserLeaderboardMetrics = async (
  userDoc,
  { includeDashboardAnalytics = false } = {},
) => {
  const user = serializeAuthUser(userDoc);
  const cachedLeaderboard = userDoc?.leaderboard || {};

  if (!user.username) {
    return {
      overview: buildFallbackOverview(user, cachedLeaderboard),
      leaderboard: cachedLeaderboard,
      synced: false,
      syncMessage: "Missing GitHub username for the authenticated user.",
    };
  }

  const [
    profileResult,
    eventsResult,
    repositoriesResult,
  ] =
    await Promise.allSettled([
      fetchGitHubUserProfile(userDoc),
      fetchGitHubEvents(userDoc),
      fetchGitHubRepositories(userDoc),
    ]);

  const firstFailedResult = [profileResult, eventsResult, repositoriesResult].find(
    (result) => result.status !== "fulfilled",
  );

  if (firstFailedResult) {
    const fallbackLeaderboard = {
      ...cachedLeaderboard,
    };

    if (profileResult.status === "fulfilled") {
      fallbackLeaderboard.repositoriesCount = getSafeNumber(
        profileResult.value?.public_repos,
      );
      fallbackLeaderboard.followers = getSafeNumber(profileResult.value?.followers);
      fallbackLeaderboard.following = getSafeNumber(profileResult.value?.following);
    }

    return {
      overview: buildFallbackOverview(user, fallbackLeaderboard),
      leaderboard: fallbackLeaderboard,
      synced: false,
      syncMessage: normalizeGitHubServiceError(
        firstFailedResult.reason,
        "GitHub activity could not be loaded right now.",
      ).message,
    };
  }

  const githubProfile = profileResult.value;
  const githubEvents = eventsResult.value;
  const githubRepositories = repositoriesResult.value;
  const dailyCounts = buildDailyCounts(githubEvents);
  const leaderboard = buildLeaderboardSnapshot({
    dailyCounts,
    githubProfile,
    githubEvents,
    githubRepositories,
    existingLeaderboard: cachedLeaderboard,
  });

  if (typeof userDoc?.set === "function" && typeof userDoc?.save === "function") {
    try {
      userDoc.set({
        leaderboard,
        openRankScore: getSafeNumber(leaderboard?.allTime?.score),
      });
      await userDoc.save();
    } catch (error) {
      console.error("Failed to persist leaderboard snapshot", error);
    }
  }

  return {
    overview: includeDashboardAnalytics
      ? buildDashboardOverview({
          user,
          githubProfile,
          githubEvents,
          githubRepositories,
          dailyCounts,
          leaderboard,
        })
      : buildFallbackOverview(user, leaderboard),
    leaderboard,
    synced: true,
    syncMessage: "",
  };
};
