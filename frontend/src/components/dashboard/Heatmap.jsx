import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

function getHeatColor(level, theme) {
  const darkPalette = [
    "rgba(255,255,255,0.06)",
    "rgba(34,211,238,0.22)",
    "rgba(6,182,212,0.4)",
    "rgba(16,185,129,0.65)",
    "rgba(74,222,128,0.9)",
  ];
  const lightPalette = [
    "rgba(148,163,184,0.16)",
    "rgba(56,189,248,0.18)",
    "rgba(14,165,233,0.32)",
    "rgba(16,185,129,0.48)",
    "rgba(34,197,94,0.72)",
  ];

  return (theme === "dark" ? darkPalette : lightPalette)[level];
}

function formatContributionLabel(count) {
  return `${count} contribution${count === 1 ? "" : "s"}`;
}

export default function Heatmap({ weeks, theme, loading = false }) {
  const cells = useMemo(() => weeks.flatMap((week) => week), [weeks]);
  const fallbackCell = cells[cells.length - 1] || null;
  const [selectedDate, setSelectedDate] = useState(fallbackCell?.date || "");

  useEffect(() => {
    if (!cells.length) {
      setSelectedDate("");
      return;
    }

    if (!cells.some((cell) => cell.date === selectedDate)) {
      setSelectedDate(cells[cells.length - 1].date);
    }
  }, [cells, selectedDate]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg animate-pulse dark:border-white/10 dark:bg-slate-900/70">
        <div className="h-5 w-44 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="mt-3 h-3 w-72 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="mt-8 grid grid-cols-[auto_1fr] gap-4">
          <div className="space-y-4 pt-2">
            <div className="h-3 w-8 rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="h-3 w-8 rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="h-3 w-8 rounded-full bg-slate-200 dark:bg-white/10" />
          </div>
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}
          >
            {Array.from({ length: 126 }).map((_, index) => (
              <div
                key={index}
                className="h-4 w-4 rounded-[4px] bg-slate-200 dark:bg-white/10"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08 }}
      className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            Contribution Heatmap
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Daily contribution activity across the last 18 weeks.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className="h-3 w-3 rounded-[4px]"
              style={{ backgroundColor: getHeatColor(level, theme) }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto overflow-y-visible pb-10 md:pb-0">
        <div className="grid min-w-[760px] grid-cols-[auto_1fr] gap-4">
          <div className="grid grid-rows-7 gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="h-4">Mon</span>
            <span className="h-4" />
            <span className="h-4">Wed</span>
            <span className="h-4" />
            <span className="h-4">Fri</span>
            <span className="h-4" />
            <span className="h-4">Sun</span>
          </div>

          <div className="flex gap-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7 gap-2">
                {week.map((cell) => (
                  <div key={cell.date} className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setSelectedDate(cell.date)}
                      onFocus={() => setSelectedDate(cell.date)}
                      onTouchStart={() => setSelectedDate(cell.date)}
                      onClick={() => setSelectedDate(cell.date)}
                      aria-pressed={selectedDate === cell.date}
                      aria-label={`${formatContributionLabel(cell.count)} on ${cell.label}`}
                      className={`h-4 w-4 rounded-[4px] border border-black/5 shadow-sm transition-transform hover:scale-110 focus:scale-110 focus:outline-none dark:border-white/5 ${
                        selectedDate === cell.date
                          ? "outline outline-2 outline-offset-1 outline-cyan-400/70"
                          : ""
                      }`}
                      style={{ backgroundColor: getHeatColor(cell.level, theme) }}
                      title={`${formatContributionLabel(cell.count)} on ${cell.label}`}
                    />

                    {selectedDate === cell.date ? (
                      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 block min-w-[7.5rem] -translate-x-1/2 rounded-lg bg-slate-950 px-2.5 py-1.5 text-center text-[11px] leading-4 text-white shadow-lg md:hidden dark:bg-white dark:text-slate-900">
                        {formatContributionLabel(cell.count)} on {cell.label}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
