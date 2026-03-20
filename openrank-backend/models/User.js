import mongoose from "mongoose";

const leaderboardPeriodSchema = new mongoose.Schema(
  {
    contributions: {
      type: Number,
      default: 0,
      min: 0,
    },
    pullRequestsMerged: {
      type: Number,
      default: 0,
      min: 0,
    },
    issuesOpened: {
      type: Number,
      default: 0,
      min: 0,
    },
    starsReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const leaderboardSchema = new mongoose.Schema(
  {
    repositoriesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    followers: {
      type: Number,
      default: 0,
      min: 0,
    },
    following: {
      type: Number,
      default: 0,
      min: 0,
    },
    activityWindowContributions: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    weekly: {
      type: leaderboardPeriodSchema,
      default: () => ({}),
    },
    monthly: {
      type: leaderboardPeriodSchema,
      default: () => ({}),
    },
    allTime: {
      type: leaderboardPeriodSchema,
      default: () => ({}),
    },
  },
  {
    _id: false,
  },
);

const notificationStateSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      trim: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const preferencesSchema = new mongoose.Schema(
  {
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "dark",
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    weeklyDigest: {
      type: Boolean,
      default: true,
    },
    liveUpdates: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  },
);

const integrationsSchema = new mongoose.Schema(
  {
    githubConnected: {
      type: Boolean,
      default: true,
    },
    disconnectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const userSchema = new mongoose.Schema(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    displayName: {
      type: String,
      default: "",
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    profileUrl: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 280,
    },
    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    openRankScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    leaderboard: {
      type: leaderboardSchema,
      default: () => ({}),
    },
    notifications: {
      type: [notificationStateSchema],
      default: [],
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
    integrations: {
      type: integrationsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({
  "leaderboard.weekly.score": -1,
  "leaderboard.weekly.contributions": -1,
});
userSchema.index({
  "leaderboard.monthly.score": -1,
  "leaderboard.monthly.contributions": -1,
});
userSchema.index({
  "leaderboard.allTime.score": -1,
  "leaderboard.allTime.contributions": -1,
});

export default mongoose.models.User || mongoose.model("User", userSchema);
