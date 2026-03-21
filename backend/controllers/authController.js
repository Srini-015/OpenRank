import passport from "passport";
import {
  getSessionCookieSettings,
  SESSION_COOKIE_NAME,
} from "../config/session.js";
import { isGitHubOAuthConfigured } from "../config/passport.js";
import { serializeAuthUser } from "../utils/serializeAuthUser.js";

const clientUrl = process.env.CLIENT_URL?.trim() || "http://localhost:5173";

const joinClientPath = (basePath, pathname) => {
  const normalizedBasePath = basePath.replace(/\/+$/, "");
  const normalizedPath = pathname === "/" ? "/" : `/${pathname.replace(/^\/+/, "")}`;

  return `${normalizedBasePath}${normalizedPath}` || "/";
};

const buildClientRedirect = (pathname, errorCode) => {
  const redirectUrl = new URL(clientUrl);
  redirectUrl.pathname = joinClientPath(redirectUrl.pathname, pathname);
  redirectUrl.search = "";
  redirectUrl.hash = "";

  if (errorCode) {
    redirectUrl.searchParams.set("error", errorCode);
  }

  return redirectUrl.toString();
};

const redirectToLoginError = (res, errorCode) =>
  res.redirect(buildClientRedirect("/login", errorCode));

export const githubLogin = (req, res, next) => {
  if (!isGitHubOAuthConfigured) {
    return redirectToLoginError(res, "github_oauth_unavailable");
  }

  return passport.authenticate("github", {
    scope: ["read:user", "user:email"],
    state: true,
  })(req, res, next);
};

export const githubCallback = (req, res, next) => {
  if (!isGitHubOAuthConfigured) {
    return redirectToLoginError(res, "github_oauth_unavailable");
  }

  passport.authenticate("github", (error, user) => {
    if (error) {
      return redirectToLoginError(res, "github_auth_failed");
    }

    if (!user) {
      return redirectToLoginError(res, "github_auth_failed");
    }

    return req.logIn(user, (loginError) => {
      if (loginError) {
        return redirectToLoginError(res, "session_error");
      }

      return req.session.save((sessionError) => {
        if (sessionError) {
          return redirectToLoginError(res, "session_error");
        }

        return res.redirect(buildClientRedirect("/dashboard"));
      });
    });
  })(req, res, next);
};

export const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  return res.status(200).json({ user: serializeAuthUser(req.user) });
};

export const logoutUser = (req, res, next) => {
  req.logout((logoutError) => {
    if (logoutError) {
      return next(logoutError);
    }

    if (!req.session) {
      res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieSettings());
      return res.status(200).json({ message: "Logged out successfully." });
    }

    return req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieSettings());
      return res.status(200).json({ message: "Logged out successfully." });
    });
  });
};
