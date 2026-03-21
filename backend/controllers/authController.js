import passport from "passport";
import {
  getSessionCookieSettings,
  SESSION_COOKIE_NAME,
} from "../config/session.js";
import { resolveRequestClientUrl } from "../config/clientUrls.js";
import { isGitHubOAuthConfigured } from "../config/passport.js";
import { serializeAuthUser } from "../utils/serializeAuthUser.js";

const joinClientPath = (basePath, pathname) => {
  const normalizedBasePath = basePath.replace(/\/+$/, "");
  const normalizedPath = pathname === "/" ? "/" : `/${pathname.replace(/^\/+/, "")}`;

  return `${normalizedBasePath}${normalizedPath}` || "/";
};

const buildClientRedirect = (clientUrl, pathname, errorCode) => {
  const redirectUrl = new URL(clientUrl);
  redirectUrl.pathname = joinClientPath(redirectUrl.pathname, pathname);
  redirectUrl.search = "";
  redirectUrl.hash = "";

  if (errorCode) {
    redirectUrl.searchParams.set("error", errorCode);
  }

  return redirectUrl.toString();
};

const redirectToLoginError = (req, res, errorCode, clientUrl = resolveRequestClientUrl(req)) =>
  res.redirect(buildClientRedirect(clientUrl, "/login", errorCode));

export const githubLogin = (req, res, next) => {
  if (!isGitHubOAuthConfigured) {
    return redirectToLoginError(req, res, "github_oauth_unavailable");
  }

  if (req.session) {
    req.session.oauthClientUrl = resolveRequestClientUrl(req);
  }

  return passport.authenticate("github", {
    scope: ["read:user", "user:email"],
    state: true,
  })(req, res, next);
};

export const githubCallback = (req, res, next) => {
  if (!isGitHubOAuthConfigured) {
    return redirectToLoginError(req, res, "github_oauth_unavailable");
  }

  passport.authenticate("github", (error, user) => {
    const clientUrl = resolveRequestClientUrl(req);

    if (error) {
      return redirectToLoginError(req, res, "github_auth_failed", clientUrl);
    }

    if (!user) {
      return redirectToLoginError(req, res, "github_auth_failed", clientUrl);
    }

    return req.logIn(user, (loginError) => {
      if (loginError) {
        return redirectToLoginError(req, res, "session_error", clientUrl);
      }

      if (req.session) {
        delete req.session.oauthClientUrl;
      }

      return req.session.save((sessionError) => {
        if (sessionError) {
          return redirectToLoginError(req, res, "session_error", clientUrl);
        }

        return res.redirect(buildClientRedirect(clientUrl, "/dashboard"));
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
