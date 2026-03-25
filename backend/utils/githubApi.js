const trimToken = (value) => (typeof value === "string" ? value.trim() : "");

export const resolveGitHubToken = (user) => {
  const userToken = trimToken(user?.githubAccessToken);

  if (userToken) {
    return userToken;
  }

  return trimToken(process.env.GITHUB_API_TOKEN);
};

export const getGitHubHeaders = ({ user, userAgent }) => {
  const headers = {
    Accept: "application/vnd.github+json",
  };

  if (userAgent) {
    headers["User-Agent"] = userAgent;
  }

  const token = resolveGitHubToken(user);

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const getResponseMessage = (error) => {
  const message = error?.response?.data?.message;
  return typeof message === "string" ? message.trim() : "";
};

export const normalizeGitHubServiceError = (error, fallbackMessage) => {
  if (!error?.response) {
    return error;
  }

  const status = Number(error.response?.status);
  const remaining = trimToken(error.response?.headers?.["x-ratelimit-remaining"]);
  const normalizedError = new Error(fallbackMessage);

  if (status === 401) {
    normalizedError.message =
      "GitHub access expired for this account. Please log out and sign in again.";
    normalizedError.statusCode = 502;
    return normalizedError;
  }

  if (status === 403 || status === 429) {
    normalizedError.message =
      remaining === "0"
        ? "GitHub API rate limit reached. Please try again in a few minutes."
        : getResponseMessage(error) || fallbackMessage;
    normalizedError.statusCode = 503;
    return normalizedError;
  }

  normalizedError.message = getResponseMessage(error) || fallbackMessage;
  normalizedError.statusCode = status === 404 ? 404 : 502;
  return normalizedError;
};
