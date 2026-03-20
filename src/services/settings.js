import api from "../lib/api";

export const fetchSettings = async () => {
  const response = await api.get("/api/settings");
  return response.data;
};

export const updateProfileSettings = async (payload) => {
  const response = await api.put("/api/settings/profile", payload);
  return response.data;
};

export const updatePreferenceSettings = async (payload) => {
  const response = await api.put("/api/settings/preferences", payload);
  return response.data;
};

export const updateGitHubConnection = async (connected) => {
  const response = await api.patch("/api/settings/github", { connected });
  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete("/api/settings/account");
  return response.data;
};
