import User from "../models/User.js";
import {
  shouldRefreshLeaderboard,
  syncUserLeaderboardMetrics,
} from "../utils/openRankAnalytics.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 24;
const DEFAULT_TIMEFRAME = "all-time";
const TIMEFRAME_FIELD_MAP = {
  weekly: "weekly",
  monthly: "monthly",
  "all-time": "allTime",
};
const SORT_STAGE = {
  score: -1,
  totalContributions: -1,
  repositoriesCount: -1,
  followers: -1,
  username: 1,
};

const clampPositiveInt = (value, fallback, max = Number.MAX_SAFE_INTEGER) => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, max);
};

const normalizeTimeframe = (value) =>
  TIMEFRAME_FIELD_MAP[value] ? value : DEFAULT_TIMEFRAME;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildProjectionStage = (timeframeField) => ({
  $project: {
    username: 1,
    displayName: 1,
    avatar: 1,
    profileUrl: 1,
    repositoriesCount: { $ifNull: ["$leaderboard.repositoriesCount", 0] },
    followers: { $ifNull: ["$leaderboard.followers", 0] },
    following: { $ifNull: ["$leaderboard.following", 0] },
    lastSyncedAt: "$leaderboard.lastSyncedAt",
    totalContributions: {
      $ifNull: [`$leaderboard.${timeframeField}.contributions`, 0],
    },
    score: {
      $ifNull: [`$leaderboard.${timeframeField}.score`, 0],
    },
  },
});

const buildRankedPipeline = ({ timeframeField, search }) => {
  const pipeline = [
    {
      $match: {
        username: {
          $exists: true,
          $ne: "",
        },
      },
    },
    buildProjectionStage(timeframeField),
  ];

  if (search) {
    const searchPattern = new RegExp(escapeRegex(search), "i");
    pipeline.push({
      $match: {
        $or: [{ username: searchPattern }, { displayName: searchPattern }],
      },
    });
  }

  pipeline.push(
    { $sort: SORT_STAGE },
    {
      $group: {
        _id: null,
        entries: { $push: "$$ROOT" },
      },
    },
    {
      $unwind: {
        path: "$entries",
        includeArrayIndex: "rankIndex",
      },
    },
    {
      $addFields: {
        "entries.rank": { $add: ["$rankIndex", 1] },
      },
    },
    {
      $replaceRoot: {
        newRoot: "$entries",
      },
    },
  );

  return pipeline;
};

const serializeEntry = (entry, currentUserId) => ({
  id: String(entry._id),
  rank: entry.rank || 0,
  username: entry.username || "",
  displayName: entry.displayName || entry.username || "",
  avatar: entry.avatar || "",
  profileUrl: entry.profileUrl || "",
  totalContributions: entry.totalContributions || 0,
  score: entry.score || 0,
  repositoriesCount: entry.repositoriesCount || 0,
  followers: entry.followers || 0,
  following: entry.following || 0,
  lastSyncedAt: entry.lastSyncedAt || null,
  isCurrentUser: String(entry._id) === String(currentUserId),
});

export const getLeaderboard = async (req, res, next) => {
  try {
    const page = clampPositiveInt(req.query.page, DEFAULT_PAGE);
    const limit = clampPositiveInt(req.query.limit, DEFAULT_LIMIT, MAX_LIMIT);
    const timeframe = normalizeTimeframe(req.query.timeframe);
    const timeframeField = TIMEFRAME_FIELD_MAP[timeframe];
    const search = String(req.query.search || "").trim();
    const skip = (page - 1) * limit;

    if (shouldRefreshLeaderboard(req.user)) {
      await syncUserLeaderboardMetrics(req.user, {
        includeDashboardAnalytics: false,
      });
    }

    const [leaderboardResult, currentUserResult] = await Promise.all([
      User.aggregate([
        ...buildRankedPipeline({ timeframeField, search }),
        {
          $facet: {
            items: [{ $skip: skip }, { $limit: limit }],
            podium: [{ $limit: 3 }],
            totalCount: [{ $count: "value" }],
          },
        },
      ]),
      User.aggregate([
        ...buildRankedPipeline({ timeframeField, search: "" }),
        { $match: { _id: req.user._id } },
        { $limit: 1 },
      ]),
    ]);

    const payload = leaderboardResult[0] || {
      items: [],
      podium: [],
      totalCount: [],
    };
    const total = payload.totalCount[0]?.value || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return res.status(200).json({
      filters: {
        timeframe,
        search,
      },
      podium: payload.podium.map((entry) => serializeEntry(entry, req.user._id)),
      items: payload.items.map((entry) => serializeEntry(entry, req.user._id)),
      currentUser: currentUserResult[0]
        ? serializeEntry(currentUserResult[0], req.user._id)
        : null,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};
