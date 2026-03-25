import axios from "axios";
import {
  getGitHubHeaders,
  normalizeGitHubServiceError,
} from "../utils/githubApi.js";

const GITHUB_API_BASE_URL = "https://api.github.com";
const EVENTS_PER_PAGE = 50;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const SUPPORTED_TYPES = new Set(["PushEvent", "PullRequestEvent", "IssuesEvent"]);

const clampPositiveInt = (value, fallback, max = Number.MAX_SAFE_INTEGER) => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, max);
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

const buildNotificationUrl = (event) =>
  event.payload?.pull_request?.html_url ||
  event.payload?.issue?.html_url ||
  (event.repo?.name ? `https://github.com/${event.repo.name}` : "");

const serializeNotification = (event, readIds) => {
  const base = {
    id: event.id,
    repo: event.repo?.name || "unknown/repository",
    createdAt: event.created_at,
    time: formatRelativeTime(event.created_at),
    url: buildNotificationUrl(event),
    read: readIds.has(event.id),
  };

  switch (event.type) {
    case "PushEvent": {
      const commitCount = Math.max(
        event.payload?.size || 0,
        event.payload?.commits?.length || 0,
        1,
      );
      const branch = getBranchName(event.payload?.ref);

      return {
        ...base,
        type: "push",
        typeLabel: "Push",
        title: `Pushed ${commitCount} commit${commitCount === 1 ? "" : "s"} to ${branch}`,
        subtitle: `New code landed in ${base.repo}.`,
      };
    }

    case "PullRequestEvent": {
      const action = event.payload?.action || "updated";
      const number = event.payload?.number;
      const title = event.payload?.pull_request?.title || "Pull request update";

      return {
        ...base,
        type: "pull_request",
        typeLabel: "Pull Request",
        title: `${action[0].toUpperCase()}${action.slice(1)} PR #${number}`,
        subtitle: title,
      };
    }

    case "IssuesEvent": {
      const action = event.payload?.action || "updated";
      const issue = event.payload?.issue;

      return {
        ...base,
        type: "issue",
        typeLabel: "Issue",
        title: `${action[0].toUpperCase()}${action.slice(1)} issue #${issue?.number}`,
        subtitle: issue?.title || "Issue update",
      };
    }

    default:
      return {
        ...base,
        type: "event",
        typeLabel: "Event",
        title: "GitHub activity",
        subtitle: base.repo,
      };
  }
};

const fetchGitHubNotifications = async (user, limit) => {
  const username = user?.username;
  const response = await axios.get(
    `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(username)}/events/public`,
    {
      headers: getGitHubHeaders({
        user,
        userAgent: "openrank-notifications",
      }),
      params: {
        per_page: Math.max(limit, EVENTS_PER_PAGE),
        page: 1,
      },
    },
  );

  return (Array.isArray(response.data) ? response.data : [])
    .filter((event) => SUPPORTED_TYPES.has(event.type))
    .slice(0, limit);
};

export const getNotifications = async (req, res, next) => {
  try {
    const username = req.user?.username;

    if (!username) {
      return res.status(400).json({
        message: "Missing GitHub username for the authenticated user.",
      });
    }

    const limit = clampPositiveInt(req.query.limit, DEFAULT_LIMIT, MAX_LIMIT);
    const events = await fetchGitHubNotifications(req.user, limit);
    const readIds = new Set(
      (req.user.notifications || []).map((notification) => notification.eventId),
    );
    const items = events.map((event) => serializeNotification(event, readIds));

    return res.status(200).json({
      items,
      unreadCount: items.filter((item) => !item.read).length,
      lastCheckedAt: new Date().toISOString(),
      pollingIntervalMs: 45000,
    });
  } catch (error) {
    next(
      normalizeGitHubServiceError(
        error,
        "Unable to load GitHub notifications right now.",
      ),
    );
  }
};

export const updateNotificationStatus = async (req, res, next) => {
  try {
    const eventId = decodeURIComponent(req.params.notificationId || "").trim();
    const shouldMarkRead = req.body?.read !== false;

    if (!eventId) {
      return res.status(400).json({
        message: "Notification id is required.",
      });
    }

    const notifications = Array.isArray(req.user.notifications)
      ? [...req.user.notifications]
      : [];
    const nextNotifications = notifications.filter(
      (notification) => notification.eventId !== eventId,
    );

    if (shouldMarkRead) {
      nextNotifications.push({
        eventId,
        readAt: new Date(),
      });
    }

    req.user.notifications = nextNotifications.slice(-300);
    await req.user.save();

    return res.status(200).json({
      id: eventId,
      read: shouldMarkRead,
    });
  } catch (error) {
    next(error);
  }
};
