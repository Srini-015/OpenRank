import api from "../lib/api";

export const fetchRepositories = async ({
  search = "",
  sort = "activity",
} = {}) => {
  const response = await api.get("/api/repositories", {
    params: {
      search: search || undefined,
      sort,
    },
  });

  return response.data;
};

export const fetchRepositoryDetails = async (repoName) => {
  const response = await api.get(
    `/api/repositories/${encodeURIComponent(repoName)}`,
  );

  return response.data;
};
