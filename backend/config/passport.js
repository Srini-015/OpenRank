import "dotenv/config";
import passport from "passport";
import GitHubStrategy from "passport-github2";
import User from "../models/User.js";

const getConfiguredEnv = (name) => {
  const value = process.env[name]?.trim();

  if (
    value &&
    !value.startsWith("your-") &&
    !value.startsWith("replace-with-")
  ) {
    return value;
  }

  return "";
};

const githubClientId = getConfiguredEnv("GITHUB_CLIENT_ID");
const githubClientSecret = getConfiguredEnv("GITHUB_CLIENT_SECRET");

export const isGitHubOAuthConfigured = Boolean(
  githubClientId && githubClientSecret
);

const resolveCallbackUrl = () => {
  const callbackURL = process.env.GITHUB_CALLBACK_URL?.trim();

  if (callbackURL) {
    return callbackURL;
  }

  const port = process.env.PORT || 4000;
  return `http://localhost:${port}/auth/github/callback`;
};

const pickEmail = (emails = []) =>
  emails.find((item) => item?.primary)?.value ?? emails[0]?.value ?? "";

if (isGitHubOAuthConfigured) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: githubClientId,
        clientSecret: githubClientSecret,
        callbackURL: resolveCallbackUrl(),
        scope: ["read:user", "user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = pickEmail(profile.emails);
          const existingUser = await User.findOne({ githubId: profile.id });
          const update = {
            username: profile.username || profile.displayName || "github-user",
            avatar: profile.photos?.[0]?.value ?? "",
            profileUrl: profile.profileUrl ?? "",
            lastLoginAt: new Date(),
            "integrations.githubConnected": true,
            "integrations.disconnectedAt": null,
          };

          if (!existingUser?.displayName) {
            update.displayName =
              profile.displayName || profile.username || "GitHub User";
          }

          if (!existingUser?.email) {
            update.email = email;
          }

          const user = await User.findOneAndUpdate(
            { githubId: profile.id },
            { $set: update },
            {
              upsert: true,
              returnDocument: "after",
              runValidators: true,
              setDefaultsOnInsert: true,
            },
          );

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );
} else {
  console.warn(
    "GitHub OAuth is disabled. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to enable it.",
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await User.findById(userId);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
