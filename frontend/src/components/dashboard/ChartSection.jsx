import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";

const pieColors = ["#6366f1", "#38bdf8", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6"];

function TooltipShell({ theme, children }) {
  const containerClassName =
    theme === "dark"
      ? "rounded-xl border border-white/10 bg-slate-950/95 px-3 py-2 text-white shadow-xl"
      : "rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-xl";

  return <div className={containerClassName}>{children}</div>;
}

function ContributionTooltip({ active, payload, label, theme }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <TooltipShell theme={theme}>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold">
        {payload[0].value} contribution{payload[0].value === 1 ? "" : "s"}
      </p>
    </TooltipShell>
  );
}

function PieTooltip({ active, payload, theme }) {
  if (!active || !payload?.length) {
    return null;
  }

  const entry = payload[0].payload;

  return (
    <TooltipShell theme={theme}>
      <p className="text-sm font-semibold">{entry.name}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {entry.percentage}% of tracked language usage
      </p>
    </TooltipShell>
  );
}

function RepoTooltip({ active, payload, label, theme }) {
  if (!active || !payload?.length) {
    return null;
  }

  const entry = payload[0].payload;

  return (
    <TooltipShell theme={theme}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {entry.contributions} weighted contribution points
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {entry.events} GitHub event{entry.events === 1 ? "" : "s"}
      </p>
    </TooltipShell>
  );
}

function EmptyChartState({ message }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 text-center dark:border-white/10">
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

function InsightCard({ title, subtitle, children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
    >
      <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {subtitle}
      </p>
      {children}
    </motion.section>
  );
}

export default function ChartSection({
  analytics,
  theme,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[0.75fr_1.1fr_1.1fr]">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg animate-pulse dark:border-white/10 dark:bg-slate-900/70"
            >
              <div className="h-5 w-40 rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="mt-3 h-3 w-56 rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="mt-8 h-64 rounded-2xl bg-slate-200 dark:bg-white/10" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg animate-pulse dark:border-white/10 dark:bg-slate-900/70"
            >
              <div className="h-5 w-40 rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="mt-3 h-3 w-56 rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="mt-8 h-72 rounded-2xl bg-slate-200 dark:bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const axisColor = theme === "dark" ? "#94a3b8" : "#64748b";
  const gridColor =
    theme === "dark" ? "rgba(148,163,184,0.16)" : "rgba(148,163,184,0.28)";
  const weeklyData = analytics?.weeklyContributionSeries || [];
  const monthlyData = analytics?.monthlyContributionSeries || [];
  const streaks = analytics?.streaks || {
    current: 0,
    longest: 0,
    activeDays: 0,
  };
  const totalLanguageWeight = (analytics?.languageBreakdown || []).reduce(
    (sum, item) => sum + (item.value || 0),
    0,
  );
  const languageData = (analytics?.languageBreakdown || []).map((item) => ({
    ...item,
    percentage: totalLanguageWeight
      ? Number(((item.value / totalLanguageWeight) * 100).toFixed(1))
      : 0,
  }));
  const repoComparisonData = analytics?.repoActivityComparison || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.1fr_1.1fr]">
        <InsightCard
          title="Streak Tracking"
          subtitle="Consecutive active days based on recent GitHub event history."
          delay={0.08}
        >
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.75rem] bg-gradient-to-br from-cyan-500 to-emerald-400 p-5 text-white shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                Current Streak
              </p>
              <p className="mt-3 text-4xl font-semibold">{streaks.current}</p>
              <p className="mt-2 text-sm text-white/80">
                {streaks.current === 1 ? "Active day" : "Active days"} in a row
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl bg-slate-50 px-4 py-4 dark:bg-slate-950/40">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Longest
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {streaks.longest} days
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4 dark:bg-slate-950/40">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Active Days
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {streaks.activeDays}
                </p>
              </div>
            </div>
          </div>
        </InsightCard>

        <InsightCard
          title="Weekly Contributions"
          subtitle="12-week trend derived from weighted GitHub public events."
          delay={0.12}
        >
          <div className="mt-6 h-72">
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="weekly-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={gridColor} vertical={false} />
                  <XAxis dataKey="label" stroke={axisColor} tickLine={false} axisLine={false} />
                  <YAxis stroke={axisColor} tickLine={false} axisLine={false} width={36} />
                  <Tooltip content={<ContributionTooltip theme={theme} />} />
                  <Area
                    type="monotone"
                    dataKey="contributions"
                    stroke="#38bdf8"
                    fill="url(#weekly-gradient)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Weekly contribution data is not available yet." />
            )}
          </div>
        </InsightCard>

        <InsightCard
          title="Monthly Contributions"
          subtitle="6-month rollup for higher-level contribution momentum."
          delay={0.16}
        >
          <div className="mt-6 h-72">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="monthly-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={gridColor} vertical={false} />
                  <XAxis dataKey="label" stroke={axisColor} tickLine={false} axisLine={false} />
                  <YAxis stroke={axisColor} tickLine={false} axisLine={false} width={36} />
                  <Tooltip content={<ContributionTooltip theme={theme} />} />
                  <Area
                    type="monotone"
                    dataKey="contributions"
                    stroke="#6366f1"
                    fill="url(#monthly-gradient)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Monthly contribution data is not available yet." />
            )}
          </div>
        </InsightCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <InsightCard
          title="Language Usage"
          subtitle="Primary repository languages weighted by repository footprint."
          delay={0.2}
        >
          <div className="mt-6 h-72">
            {languageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={3}
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip theme={theme} />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Language usage data is not available for this account yet." />
            )}
          </div>

          {languageData.length > 0 ? (
            <div className="mt-4 grid gap-3">
              {languageData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5"
                >
                  <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: pieColors[index % pieColors.length] }}
                    />
                    {item.name}
                  </span>
                  <span className="text-sm font-semibold text-slate-950 dark:text-white">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </InsightCard>

        <InsightCard
          title="Repository Activity Comparison"
          subtitle="Most active repositories ranked by weighted public GitHub events."
          delay={0.24}
        >
          <div className="mt-6 h-72">
            {repoComparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={repoComparisonData}
                  layout="vertical"
                  margin={{ top: 4, right: 8, bottom: 4, left: 8 }}
                >
                  <CartesianGrid stroke={gridColor} horizontal={false} />
                  <XAxis type="number" stroke={axisColor} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    hide
                  />
                  <Tooltip content={<RepoTooltip theme={theme} />} />
                  <Bar
                    dataKey="contributions"
                    fill="#22c55e"
                    radius={[0, 12, 12, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Repository activity comparison needs more recent GitHub events." />
            )}
          </div>

          {repoComparisonData.length > 0 ? (
            <div className="mt-4 grid gap-3">
              {repoComparisonData.map((item) => (
                <div
                  key={item.fullName}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.events} event{item.events === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-950 dark:text-white">
                    {item.contributions}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </InsightCard>
      </div>
    </div>
  );
}
