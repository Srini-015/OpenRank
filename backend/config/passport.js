import "dotenv/config";
import passport from "passport";
import GitHubStrategy from "passport-github2";
import User from "../models/User.js";

const requireEnv = (name) => {
  const value = process.env[name]?.trim();

  if (value) {
    return value;
  }

  throw new Error(`${name} is required to enable GitHub OAuth.`);
};

const resolveCallbackUrl = () => {
  const callbackUrl = process.env.CALLBACK_URL?.trim();

  if (callbackUrl) {
    return callbackUrl;
  }

  const port = process.env.PORT || 4000;
  return `http://localhost:${port}/auth/github/callback`;
};

const pickEmail = (emails = []) =>
  emails.find((item) => item?.primary)?.value ?? emails[0]?.value ?? "";

passport.use(
  new GitHubStrategy(
    {
      clientID: requireEnv("GITHUB_CLIENT_ID"),
      clientSecret: requireEnv("GITHUB_CLIENT_SECRET"),
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
            new: true,
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
