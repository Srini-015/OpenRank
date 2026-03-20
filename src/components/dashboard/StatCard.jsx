import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  trend,
  description,
  icon,
  accentClassName,
  badgeClassName,
  delay = 0,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-lg animate-pulse dark:border-white/10 dark:bg-slate-900/70">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="h-3 w-24 rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="h-8 w-28 rounded-full bg-slate-200 dark:bg-white/10" />
          </div>
          <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-white/10" />
        </div>
        <div className="mt-6 h-3 w-32 rounded-full bg-slate-200 dark:bg-white/10" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accentClassName}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            badgeClassName ||
            "bg-emerald-400/15 text-emerald-600 dark:text-emerald-300"
          }`}
        >
          {trend}
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {description}
        </span>
      </div>
    </motion.div>
  );
}
