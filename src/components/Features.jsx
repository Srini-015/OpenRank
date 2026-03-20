import {
  AnalyticsIcon,
  DiscoveryIcon,
  GitHubIcon,
  HeatmapIcon,
  PortfolioIcon,
} from "./Icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const features = [
  {
    title: "GitHub Integration",
    description:
      "Connect your GitHub account to sync repositories, pull requests, issues, and commit activity in minutes.",
    Icon: GitHubIcon,
  },
  {
    title: "Contribution Analytics",
    description:
      "Measure trends across commits, reviews, and merged pull requests with clear weekly and monthly breakdowns.",
    Icon: AnalyticsIcon,
  },
  {
    title: "Heatmaps Visualization",
    description:
      "Turn your contribution history into readable heatmaps that spotlight consistency, streaks, and peak activity.",
    Icon: HeatmapIcon,
  },
  {
    title: "Project Discovery",
    description:
      "Surface relevant open source repositories based on your languages, contribution history, and areas of interest.",
    Icon: DiscoveryIcon,
  },
  {
    title: "Portfolio Builder",
    description:
      "Generate a polished developer profile that showcases your best work and your growth over time.",
    Icon: PortfolioIcon,
  },
];

export default function Features() {
  return (
    <section className="section-shell py-16 md:py-24" id="features">
      <Reveal>
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to quantify and showcase your OSS work"
          description="OpenRank combines contribution tracking, discovery, and presentation tools into one clean workspace for developers."
          align="center"
        />
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {features.map((feature, index) => (
          <Reveal key={feature.title} delay={index * 0.08}>
            <article className="surface group h-full p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-glow">
              <feature.Icon />
              <h3 className="mt-5 text-xl font-semibold text-ink-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {feature.description}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
