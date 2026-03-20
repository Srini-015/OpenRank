import { motion } from "framer-motion";

function typeClassName(type) {
  if (type === "pull_request") {
    return "bg-sky-400";
  }

  if (type === "issue") {
    return "bg-amber-400";
  }

  if (type === "review") {
    return "bg-violet-400";
  }

  return "bg-emerald-400";
}

export default function ActivityFeed({ items, loading = false }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.18 }}
      className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            Recent Activity
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Timeline of your latest public GitHub events.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 space-y-4 animate-pulse">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 px-4 py-4 dark:border-white/10"
            >
              <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 rounded-full bg-slate-200 dark:bg-white/10" />
                <div className="h-3 w-56 rounded-full bg-slate-200 dark:bg-white/10" />
              </div>
              <div className="h-3 w-16 rounded-full bg-slate-200 dark:bg-white/10" />
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="mt-6 space-y-5">
          {items.map((item, index) => (
            <motion.article
              key={item.id || `${item.repo}-${item.title}-${index}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * index }}
              className="relative pl-8"
            >
              {index < items.length - 1 ? (
                <span className="absolute left-[15px] top-10 h-[calc(100%+1.25rem)] w-px bg-slate-200 dark:bg-white/10" />
              ) : null}

              <span
                className={`absolute left-0 top-1 inline-flex h-8 w-8 items-center justify-center rounded-full ${typeClassName(
                  item.type,
                )} text-xs font-semibold text-slate-950`}
              >
                {item.typeLabel}
              </span>

              <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-950 dark:text-white">
                        {item.repo}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-white/5 dark:text-slate-400">
                        {item.branch}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {item.title}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                    {item.time}
                  </span>
                </div>

                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
                  >
                    View on GitHub
                  </a>
                ) : null}
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-5 py-8 text-center dark:border-white/10">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No activity matched your search. Try another repository or keyword.
          </p>
        </div>
      )}
    </motion.section>
  );
}
