import axios from "axios";
import {
  getGitHubHeaders,
  normalizeGitHubServiceError,
} from "../utils/githubApi.js";

const GITHUB_API_BASE_URL = "https://api.github.com";
const GITHUB_PER_PAGE = 100;
const MAX_REPO_PAGES = 10;
const RECENT_COMMITS_LIMIT = 10;
const TOP_CONTRIBUTORS_LIMIT = 6;
const DEFAULT_SORT = "activity";
const ALLOWED_SORTS = new Set(["activity", "stars"]);

const normalizeSort = (value) =>
  ALLOWED_SORTS.has(value) ? value : DEFAULT_SORT;

const getTimestamp = (value) => {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const matchesSearch = (repo, search) => {
  if (!search) {
    return true;
  }

  const query = search.toLowerCase();

  return [repo.name, repo.fullName, repo.description, repo.language]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(query));
};

const sortRepositories = (repositories, sort) => {
  const sorted = [...repositories];

  sorted.sort((left, right) => {
    if (sort === "stars") {
      const byStars = right.stars - left.stars;

      if (byStars !== 0) {
        return byStars;
      }
    }

    const byActivity =
      getTimestamp(right.lastCommitDate) - getTimestamp(left.lastCommitDate);

    if (byActivity !== 0) {
      return byActivity;
    }

    const byStars = right.stars - left.stars;

    if (byStars !== 0) {
      return byStars;
    }

    return left.name.localeCompare(right.name);
  });

  return sorted;
};

const serializeRepository = (repo) => ({
  id: repo.id,
  name: repo.name || "",
  fullName: repo.full_name || "",
  description: repo.description || "",
  htmlUrl: repo.html_url || "",
  homepage: repo.homepage || "",
  language: repo.language || "",
  stars: repo.stargazers_count || 0,
  forks: repo.forks_count || 0,
  issues: repo.open_issues_count || 0,
  watchers: repo.watchers_count || 0,
  sizeKb: repo.size || 0,
  lastCommitDate: repo.pushed_at || repo.updated_at || null,
  updatedAt: repo.updated_at || null,
  createdAt: repo.created_at || null,
  visibility: repo.private ? "Private" : "Public",
  defaultBranch: repo.default_branch || "main",
  archived: Boolean(repo.archived),
  topics: Array.isArray(repo.topics) ? repo.topics : [],
});

const serializeCommit = (commit) => ({
  sha: commit.sha || "",
  shortSha: commit.sha ? commit.sha.slice(0, 7) : "",
  message: commit.commit?.message?.split("\n")[0] || "Commit",
  authoredAt:
    commit.commit?.author?.date || commit.commit?.committer?.date || null,
  authorName: commit.author?.login || commit.commit?.author?.name || "Unknown",
  authorAvatar: commit.author?.avatar_url || "",
  url: commit.html_url || "",
});

const serializeContributor = (contributor) => ({
  id: contributor.id,
  username: contributor.login || "",
  avatar: contributor.avatar_url || "",
  profileUrl: contributor.html_url || "",
  contributions: contributor.contributions || 0,
});

const serializeLanguageBreakdown = (languages) => {
  const entries = Object.entries(languages || {});
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  if (total === 0) {
    return [];
  }

  return entries
    .map(([name, value]) => ({
      name,
      value,
      percentage: Number(((value / total) * 100).toFixed(1)),
    }))
    .sort((left, right) => right.value - left.value);
};

const fetchUserRepositories = async (user) => {
  const username = user?.username;
  const repositories = [];

  for (let page = 1; page <= MAX_REPO_PAGES; page += 1) {
    const response = await axios.get(
      `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(username)}/repos`,
      {
        headers: getGitHubHeaders({
          user,
          userAgent: "openrank-repositories",
        }),
        params: {
          per_page: GITHUB_PER_PAGE,
          page,
          type: "owner",
          sort: "updated",
          direction: "desc",
        },
      },
    );

    const pageItems = Array.isArray(response.data) ? response.data : [];
    repositories.push(...pageItems);

    if (pageItems.length < GITHUB_PER_PAGE) {
      break;
    }
  }

  return repositories;
};

const fetchRepository = async (owner, repoName, user) => {
  const ownerSegment = encodeURIComponent(owner);
  const repoSegment = encodeURIComponent(repoName);
  const response = await axios.get(
    `${GITHUB_API_BASE_URL}/repos/${ownerSegment}/${repoSegment}`,
    {
      headers: getGitHubHeaders({
        user,
        userAgent: "openrank-repositories",
      }),
    },
  );

  return response.data;
};

const fetchRepositoryCommits = async (owner, repoName, user) => {
  try {
    const ownerSegment = encodeURIComponent(owner);
    const repoSegment = encodeURIComponent(repoName);
    const response = await axios.get(
      `${GITHUB_API_BASE_URL}/repos/${ownerSegment}/${repoSegment}/commits`,
      {
        headers: getGitHubHeaders({
          user,
          userAgent: "openrank-repositories",
        }),
        params: {
          per_page: RECENT_COMMITS_LIMIT,
        },
      },
    );

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    if (error.response?.status === 409) {
      return [];
    }

    throw error;
  }
};

const fetchRepositoryLanguages = async (owner, repoName, user) => {
  const ownerSegment = encodeURIComponent(owner);
  const repoSegment = encodeURIComponent(repoName);
  const response = await axios.get(
    `${GITHUB_API_BASE_URL}/repos/${ownerSegment}/${repoSegment}/languages`,
    {
      headers: getGitHubHeaders({
        user,
        userAgent: "openrank-repositories",
      }),
    },
  );

  return response.data || {};
};

const fetchRepositoryContributors = async (owner, repoName, user) => {
  try {
    const ownerSegment = encodeURIComponent(owner);
    const repoSegment = encodeURIComponent(repoName);
    const response = await axios.get(
      `${GITHUB_API_BASE_URL}/repos/${ownerSegment}/${repoSegment}/contributors`,
      {
        headers: getGitHubHeaders({
          user,
          userAgent: "openrank-repositories",
        }),
        params: {
          per_page: TOP_CONTRIBUTORS_LIMIT,
        },
      },
    );

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }

    throw error;
  }
};

export const getRepositories = async (req, res, next) => {
  try {
    const username = req.user?.username;

    if (!username) {
      return res.status(400).json({
        message: "Missing GitHub username for the authenticated user.",
      });
    }

    const search = String(req.query.search || "").trim();
    const sort = normalizeSort(String(req.query.sort || DEFAULT_SORT));
    const repositories = await fetchUserRepositories(req.user);
    const normalizedRepositories = repositories.map(serializeRepository);
    const filteredRepositories = normalizedRepositories.filter((repo) =>
      matchesSearch(repo, search),
    );
    const sortedRepositories = sortRepositories(filteredRepositories, sort);

    return res.status(200).json({
      items: sortedRepositories,
      total: sortedRepositories.length,
      filters: {
        search,
        sort,
      },
    });
  } catch (error) {
    next(
      normalizeGitHubServiceError(
        error,
        "Unable to load repository insights right now.",
      ),
    );
  }
};

export const getRepositoryDetails = async (req, res, next) => {
  try {
    const owner = req.user?.username;
    const repoName = decodeURIComponent(req.params.repoName || "").trim();

    if (!owner) {
      return res.status(400).json({
        message: "Missing GitHub username for the authenticated user.",
      });
    }

    if (!repoName) {
      return res.status(400).json({
        message: "Repository name is required.",
      });
    }

    const repository = await fetchRepository(owner, repoName, req.user);
    const [commitsResult, languagesResult, contributorsResult] =
      await Promise.allSettled([
        fetchRepositoryCommits(owner, repoName, req.user),
        fetchRepositoryLanguages(owner, repoName, req.user),
        fetchRepositoryContributors(owner, repoName, req.user),
      ]);

    return res.status(200).json({
      repo: serializeRepository(repository),
      recentCommits:
        commitsResult.status === "fulfilled"
          ? commitsResult.value.map(serializeCommit)
          : [],
      languageBreakdown:
        languagesResult.status === "fulfilled"
          ? serializeLanguageBreakdown(languagesResult.value)
          : [],
      topContributors:
        contributorsResult.status === "fulfilled"
          ? contributorsResult.value.map(serializeContributor)
          : [],
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        message: "Repository not found for the authenticated user.",
      });
    }

    next(
      normalizeGitHubServiceError(
        error,
        "Unable to load repository analytics right now.",
      ),
    );
  }
};
