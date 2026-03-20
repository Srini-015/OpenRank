import { motion } from "framer-motion";
import Reveal from "./Reveal";
import { getAppHref } from "../lib/routes";

const heroStats = [
  { label: "Tracked events", value: "1.2M+" },
  { label: "Active repos", value: "18K+" },
  { label: "Portfolio views", value: "94K" },
];

export default function Hero() {
  return (
    <section className="section-shell relative pt-12 pb-16 md:pt-16 md:pb-24" id="explore">
      <div className="grid items-center gap-14 lg:grid-cols-[1.04fr_0.96fr]">
        <Reveal>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-cyan-400/20 dark:bg-white/5 dark:text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live GitHub insights for serious builders
            </div>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-ink-900 dark:text-white sm:text-6xl">
              Track Your Open Source Impact
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Analyze contributions, discover projects, and build your developer
              portfolio.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={getAppHref("/login")} className="button-primary">
                Connect GitHub
              </a>
              <a href="#features" className="button-secondary">
                Explore Projects
              </a>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {heroStats.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.25 + index * 0.12 }}
                  className="surface p-4 shadow-soft"
                >
                  <div className="text-2xl font-semibold text-ink-900 dark:text-white">
                    {item.value}
                  </div>
                  <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="relative">
            <div className="absolute -left-10 top-8 h-32 w-32 rounded-full bg-sky-500/20 blur-3xl dark:bg-cyan-400/20" />
            <div className="absolute -right-4 bottom-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="surface relative overflow-hidden p-4 shadow-soft sm:p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-sky-100/40 dark:from-white/5 dark:via-transparent dark:to-cyan-400/5" />
              <div className="relative">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-slate-950/40">
                  <div>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Repository pulse
                    </div>
                    <div className="mt-1 text-lg font-semibold text-ink-900 dark:text-white">
                      openrank/core
                    </div>
                  </div>
                  <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                    +18.4% this month
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-white p-5 dark:border-white/10 dark:from-slate-900 dark:to-slate-950">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Weekly velocity
                    </div>
                    <div className="mt-4 flex h-32 items-end gap-2">
                      {[34, 58, 44, 70, 62, 88, 74].map((height, index) => (
                        <motion.div
                          key={height}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.6, delay: 0.25 + index * 0.07 }}
                          className="flex-1 rounded-t-2xl bg-gradient-to-t from-sky-500 to-cyan-400"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-white p-5 dark:border-white/10 dark:from-slate-900 dark:to-slate-950">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Signal score
                    </div>
                    <div className="mt-6 flex items-end justify-between">
                      <div>
                        <div className="text-4xl font-semibold text-ink-900 dark:text-white">
                          92
                        </div>
                        <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          Ranked in the top 8% of contributors
                        </div>
                      </div>
                      <div className="h-20 w-20 rounded-full border-[10px] border-emerald-400/20 border-t-emerald-400 border-r-sky-500" />
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl border border-slate-200/70 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Suggested projects
                      </div>
                      <div className="mt-1 text-lg font-semibold text-ink-900 dark:text-white">
                        Matched to your stack
                      </div>
                    </div>
                    <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-cyan-400/10 dark:text-cyan-300">
                      React / Node / Rust
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      { name: "oss-insights/ui", stars: "12.4k" },
                      { name: "typedb/client-js", stars: "4.8k" },
                    ].map((repo) => (
                      <div
                        key={repo.name}
                        className="flex items-center justify-between rounded-2xl border border-slate-200/70 px-4 py-3 dark:border-white/10"
                      >
                        <span className="font-medium text-ink-900 dark:text-white">
                          {repo.name}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {repo.stars} stars
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
