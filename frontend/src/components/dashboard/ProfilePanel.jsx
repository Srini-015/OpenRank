import { motion } from "framer-motion";

function ProfileSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg animate-pulse dark:border-white/10 dark:bg-slate-900/70">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="space-y-2">
          <div className="h-5 w-40 rounded-full bg-slate-200 dark:bg-white/10" />
          <div className="h-4 w-28 rounded-full bg-slate-200 dark:bg-white/10" />
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-20 rounded-2xl bg-slate-200 dark:bg-white/10"
          />
        ))}
      </div>
    </div>
  );
}

function DetailCard({ label, value, href }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
        >
          {value}
        </a>
      ) : (
        <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
          {value}
        </p>
      )}
    </div>
  );
}

export default function ProfilePanel({ user, loading = false }) {
  if (loading) {
    return <ProfileSkeleton />;
  }

  const username = user?.username || "openrank-dev";
  const displayName = user?.displayName || username;
  const avatar = user?.avatar || "";
  const email = user?.email || "GitHub email is private";
  const githubId = user?.githubId || "Unavailable";
  const profileUrl = user?.profileUrl || `https://github.com/${username}`;
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {avatar ? (
          <img
            src={avatar}
            alt={`${username} avatar`}
            className="h-20 w-20 rounded-full object-cover ring-4 ring-slate-200 dark:ring-white/10"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 text-2xl font-semibold text-white shadow-lg shadow-indigo-500/20">
            {initials}
          </div>
        )}

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
            GitHub Profile
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {displayName}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            @{username}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <DetailCard label="Username" value={`@${username}`} />
        <DetailCard label="Email" value={email} />
        <DetailCard label="GitHub ID" value={githubId} />
        <DetailCard
          label="Profile URL"
          value="Open on GitHub"
          href={profileUrl}
        />
      </div>
    </motion.section>
  );
}
