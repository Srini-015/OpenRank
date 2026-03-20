import api from "../lib/api";

export const fetchDashboardOverview = async () => {
  const response = await api.get("/api/dashboard/overview");
  return response.data;
};
