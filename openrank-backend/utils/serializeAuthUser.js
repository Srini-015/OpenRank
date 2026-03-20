export const serializeAuthUser = (user) => ({
  id: user.id,
  githubId: user.githubId,
  username: user.username,
  displayName: user.displayName || user.username,
  avatar: user.avatar || "",
  email: user.email || "",
  profileUrl: user.profileUrl || "",
  bio: user.bio || "",
  location: user.location || "",
  openRankScore: user.openRankScore || user.leaderboard?.allTime?.score || 0,
  preferences: {
    theme: user.preferences?.theme || "dark",
    emailNotifications: user.preferences?.emailNotifications ?? true,
    weeklyDigest: user.preferences?.weeklyDigest ?? true,
    liveUpdates: user.preferences?.liveUpdates ?? true,
  },
  integrations: {
    githubConnected: user.integrations?.githubConnected !== false,
    disconnectedAt: user.integrations?.disconnectedAt || null,
  },
});
