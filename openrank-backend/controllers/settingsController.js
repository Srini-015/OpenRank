import User from "../models/User.js";
import { serializeAuthUser } from "../utils/serializeAuthUser.js";
import {
  getSessionCookieSettings,
  SESSION_COOKIE_NAME,
} from "../config/session.js";

const sanitizeString = (value, fallback = "") =>
  typeof value === "string" ? value.trim() : fallback;

const sanitizeBoolean = (value, fallback) =>
  typeof value === "boolean" ? value : fallback;

export const getSettings = (req, res) => {
  return res.status(200).json({
    settings: serializeAuthUser(req.user),
  });
};

export const updateProfileSettings = async (req, res, next) => {
  try {
    req.user.set({
      displayName:
        sanitizeString(req.body?.displayName) ||
        req.user.displayName ||
        req.user.username,
      email: sanitizeString(req.body?.email),
      bio: sanitizeString(req.body?.bio),
      location: sanitizeString(req.body?.location),
    });

    await req.user.save();

    return res.status(200).json({
      settings: serializeAuthUser(req.user),
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreferenceSettings = async (req, res, next) => {
  try {
    const nextTheme =
      req.body?.theme === "light" || req.body?.theme === "dark"
        ? req.body.theme
        : req.user.preferences?.theme || "dark";

    req.user.set({
      preferences: {
        theme: nextTheme,
        emailNotifications: sanitizeBoolean(
          req.body?.emailNotifications,
          req.user.preferences?.emailNotifications ?? true,
        ),
        weeklyDigest: sanitizeBoolean(
          req.body?.weeklyDigest,
          req.user.preferences?.weeklyDigest ?? true,
        ),
        liveUpdates: sanitizeBoolean(
          req.body?.liveUpdates,
          req.user.preferences?.liveUpdates ?? true,
        ),
      },
    });

    await req.user.save();

    return res.status(200).json({
      settings: serializeAuthUser(req.user),
    });
  } catch (error) {
    next(error);
  }
};

export const updateGitHubConnection = async (req, res, next) => {
  try {
    const connected = sanitizeBoolean(
      req.body?.connected,
      req.user.integrations?.githubConnected ?? true,
    );

    req.user.set({
      integrations: {
        githubConnected: connected,
        disconnectedAt: connected ? null : new Date(),
      },
    });

    await req.user.save();

    return res.status(200).json({
      settings: serializeAuthUser(req.user),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    await User.deleteOne({ _id: userId });

    req.logout((logoutError) => {
      if (logoutError) {
        return next(logoutError);
      }

      if (!req.session) {
        res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieSettings());
        return res.status(200).json({ message: "Account deleted successfully." });
      }

      return req.session.destroy((sessionError) => {
        if (sessionError) {
          return next(sessionError);
        }

        res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieSettings());
        return res.status(200).json({ message: "Account deleted successfully." });
      });
    });
  } catch (error) {
    next(error);
  }
};
