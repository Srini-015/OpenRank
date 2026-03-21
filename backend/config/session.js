import session from "express-session";
import { createSessionStore } from "./sessionStore.js";

const isProduction = process.env.NODE_ENV === "production";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const SESSION_COOKIE_NAME = "openrank.sid";

export const getSessionCookieSettings = () => ({
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  path: "/",
});

const resolveSessionSecret = () => {
  const sessionSecret = process.env.SESSION_SECRET?.trim();

  if (sessionSecret) {
    return sessionSecret;
  }

  if (isProduction) {
    throw new Error("SESSION_SECRET is required in production.");
  }

  console.warn(
    "SESSION_SECRET is missing. Falling back to a development-only secret.",
  );
  return "openrank-development-session-secret";
};

export const sessionMiddleware = session({
  name: SESSION_COOKIE_NAME,
  secret: resolveSessionSecret(),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  proxy: isProduction,
  store: createSessionStore(),
  cookie: {
    ...getSessionCookieSettings(),
    maxAge: SESSION_TTL_MS,
  },
});
