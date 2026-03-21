export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}) {
  const alignment =
    align === "center"
      ? "mx-auto max-w-2xl text-center"
      : "max-w-2xl text-left";

  return (
    <div className={alignment}>
      <span className="inline-flex rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink-900 dark:text-white md:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
        {description}
      </p>
    </div>
  );
}
