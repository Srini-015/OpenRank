import { syncUserLeaderboardMetrics } from "../utils/openRankAnalytics.js";

export const getDashboardOverview = async (req, res, next) => {
  try {
    const { overview, synced, syncMessage } = await syncUserLeaderboardMetrics(
      req.user,
      {
        includeDashboardAnalytics: true,
      },
    );
    return res.status(200).json({
      ...overview,
      syncStatus: {
        synced,
        message: syncMessage || "",
      },
    });
  } catch (error) {
    next(error);
  }
};
