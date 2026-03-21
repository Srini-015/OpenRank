import api, { API_BASE_URL } from "../lib/api";

const AUTH_ERROR_MESSAGES = {
  github_auth_failed:
    "GitHub sign-in failed. Please try again or re-check your OAuth app callback URL.",
  session_error:
    "We couldn't create your session. Please try again in a moment.",
};

export const beginGitHubLogin = () => {
  window.location.assign(`${API_BASE_URL}/auth/github`);
};

export const fetchCurrentUser = async () => {
  const response = await api.get("/api/auth/me");
  return response.data.user;
};

export const logoutSession = async () => {
  await api.post("/auth/logout");
};

export const getAuthErrorMessage = (errorCode) => {
  if (!errorCode) {
    return "";
  }

  return (
    AUTH_ERROR_MESSAGES[errorCode] ||
    "Authentication failed. Please try again."
  );
};
