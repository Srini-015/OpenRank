import api from "../lib/api";

export const fetchLeaderboard = async ({
  timeframe = "all-time",
  search = "",
  page = 1,
  limit = 10,
} = {}) => {
  const response = await api.get("/api/leaderboard", {
    params: {
      timeframe,
      search: search || undefined,
      page,
      limit,
    },
  });

  return response.data;
};
