import { motion } from "framer-motion";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const stats = [
  { label: "Commits", value: "2,847", change: "+18%" },
  { label: "PRs", value: "416", change: "+12%" },
  { label: "Issues", value: "189", change: "+9%" },
];

const graphColumns = [24, 36, 52, 44, 68, 58, 76, 88, 72, 80, 64, 54];

const heatmapRows = [
  [0.15, 0.32, 0.48, 0.28, 0.42, 0.8, 0.66, 0.2, 0.64, 0.88, 0.36, 0.1],
  [0.08, 0.22, 0.34, 0.5, 0.72, 0.85, 0.3, 0.16, 0.46, 0.7, 0.54, 0.24],
  [0.18, 0.42, 0.64, 0.78, 0.62, 0.28, 0.24, 0.38, 0.58, 0.82, 0.48, 0.2],
  [0.12, 0.26, 0.52, 0.68, 0.8, 0.52, 0.22, 0.3, 0.4, 0.62, 0.72, 0.44],
];

export default function DemoPreview() {
  return (
    <section className="section-shell py-16 md:py-24" id="dashboard">
      <div className="grid gap-10 xl:grid-cols-[0.82fr_1.18fr] xl:items-center">
        <Reveal>
          <SectionHeading
            eyebrow="Dashboard"
            title="A clean command center for contribution insights"
            description="Monitor your momentum with high-signal metrics, a contribution graph, and project discovery recommendations all in one place."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {stats.map((stat, index) => (
              <Reveal key={stat.label} delay={0.12 + index * 0.08}>
                <div className="surface flex items-center justify-between px-5 py-4 shadow-soft">
                  <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </div>
                    <div className="mt-1 text-2xl font-semibold text-ink-900 dark:text-white">
                      {stat.value}
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                    {stat.change}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="surface overflow-hidden p-4 shadow-soft sm:p-6" id="login">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  OpenRank demo preview
                </div>
                <div className="mt-1 text-2xl font-semibold text-ink-900 dark:text-white">
                  Contribution Overview
                </div>
              </div>
              <div className="rounded-full border border-slate-200/70 px-4 py-2 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300">
                Updated 2m ago
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="rounded-[28px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-slate-950/40">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Contribution graph
                    </div>
                    <div className="mt-1 text-lg font-semibold text-ink-900 dark:text-white">
                      Last 12 weeks
                    </div>
                  </div>
                  <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-cyan-400/10 dark:text-cyan-300">
                    324 activities
                  </span>
                </div>

                <div className="mt-8 flex h-60 items-end gap-3">
                  {graphColumns.map((height, index) => (
                    <motion.div
                      key={`${height}-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      whileInView={{ height: `${height}%`, opacity: 1 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.55, delay: index * 0.05 }}
                      className="group relative flex-1 rounded-t-[24px] bg-gradient-to-t from-cyan-500 via-sky-500 to-emerald-400"
                    >
                      <span className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded-full bg-slate-950 px-2 py-1 text-[10px] font-medium text-white group-hover:block dark:bg-white dark:text-slate-900">
                        {Math.round((height / 100) * 52)} actions
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[28px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-slate-950/40">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Contribution heatmap
                  </div>
                  <div className="mt-1 text-lg font-semibold text-ink-900 dark:text-white">
                    Activity consistency
                  </div>
                  <div className="mt-5 space-y-2.5">
                    {heatmapRows.map((row, rowIndex) => (
                      <div key={rowIndex} className="grid grid-cols-12 gap-2">
                        {row.map((opacity, columnIndex) => (
                          <motion.div
                            key={`${rowIndex}-${columnIndex}`}
                            initial={{ opacity: 0, scale: 0.85 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{
                              duration: 0.35,
                              delay: 0.1 + (rowIndex * 12 + columnIndex) * 0.02,
                            }}
                            className="aspect-square rounded-md bg-cyan-400"
                            style={{ opacity }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-soft dark:border-white/10 dark:from-slate-800 dark:to-slate-900">
                  <div className="text-sm text-slate-300">Portfolio score</div>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <div>
                      <div className="text-4xl font-semibold">88.6</div>
                      <div className="mt-2 text-sm text-slate-300">
                        Strong documentation and review activity
                      </div>
                    </div>
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-[10px] border-white/10 border-t-cyan-400 border-r-emerald-400 text-sm font-semibold">
                      A+
                    </div>
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
