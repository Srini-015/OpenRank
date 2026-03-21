import { syncUserLeaderboardMetrics } from "../utils/openRankAnalytics.js";

export const getDashboardOverview = async (req, res, next) => {
  try {
    const { overview } = await syncUserLeaderboardMetrics(req.user, {
      includeDashboardAnalytics: true,
    });
    return res.status(200).json(overview);
  } catch (error) {
    next(error);
  }
};
