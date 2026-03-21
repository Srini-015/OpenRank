import session from "express-session";
import Session from "../models/Session.js";

const DEFAULT_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const getExpirationDate = (sessionData) => {
  const cookieExpiration = sessionData?.cookie?.expires
    ? new Date(sessionData.cookie.expires)
    : null;

  if (cookieExpiration && !Number.isNaN(cookieExpiration.getTime())) {
    return cookieExpiration;
  }

  const maxAge = Number(sessionData?.cookie?.maxAge);

  if (Number.isFinite(maxAge) && maxAge > 0) {
    return new Date(Date.now() + maxAge);
  }

  return new Date(Date.now() + DEFAULT_SESSION_TTL_MS);
};

const normalizeSession = (storedSession) => {
  const sessionData = storedSession?.session;

  if (sessionData?.cookie?.expires) {
    const cookieExpiration = new Date(sessionData.cookie.expires);

    if (!Number.isNaN(cookieExpiration.getTime())) {
      sessionData.cookie.expires = cookieExpiration;
    }
  }

  return sessionData;
};

class MongooseSessionStore extends session.Store {
  get(sid, callback) {
    Session.findOne({ sid })
      .lean()
      .then((storedSession) => {
        if (!storedSession) {
          callback(null, null);
          return;
        }

        if (storedSession.expiresAt <= new Date()) {
          return Session.deleteOne({ sid }).then(() => callback(null, null));
        }

        callback(null, normalizeSession(storedSession));
      })
      .catch((error) => callback(error));
  }

  set(sid, sessionData, callback) {
    Session.findOneAndUpdate(
      { sid },
      {
        sid,
        session: sessionData,
        expiresAt: getExpirationDate(sessionData),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    )
      .then(() => callback?.(null))
      .catch((error) => callback?.(error));
  }

  touch(sid, sessionData, callback) {
    Session.findOneAndUpdate(
      { sid },
      {
        expiresAt: getExpirationDate(sessionData),
        session: sessionData,
      },
      { new: true },
    )
      .then(() => callback?.(null))
      .catch((error) => callback?.(error));
  }

  destroy(sid, callback) {
    Session.deleteOne({ sid })
      .then(() => callback?.(null))
      .catch((error) => callback?.(error));
  }
}

export const createSessionStore = () => new MongooseSessionStore();
