import passport from "passport";
import {
  getSessionCookieSettings,
  SESSION_COOKIE_NAME,
} from "../config/session.js";
import { serializeAuthUser } from "../utils/serializeAuthUser.js";

const clientUrl = process.env.CLIENT_URL?.trim() || "http://localhost:5173";

const buildClientRedirect = (pathname, errorCode) => {
  const redirectUrl = new URL(pathname, clientUrl);

  if (errorCode) {
    redirectUrl.searchParams.set("error", errorCode);
  }

  return redirectUrl.toString();
};

export const githubLogin = passport.authenticate("github", {
  scope: ["read:user", "user:email"],
  state: true,
});

export const githubCallback = (req, res, next) => {
  passport.authenticate("github", (error, user) => {
    if (error) {
      return res.redirect(buildClientRedirect("/login", "github_auth_failed"));
    }

    if (!user) {
      return res.redirect(buildClientRedirect("/login", "github_auth_failed"));
    }

    return req.logIn(user, (loginError) => {
      if (loginError) {
        return res.redirect(buildClientRedirect("/login", "session_error"));
      }

      return req.session.save((sessionError) => {
        if (sessionError) {
          return res.redirect(buildClientRedirect("/login", "session_error"));
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
