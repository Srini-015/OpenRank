import Reveal from "./Reveal";
import { getAppHref } from "../lib/routes";

export default function CTASection() {
  return (
    <section className="section-shell py-16 md:py-24" id="get-started">
      <Reveal>
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-gradient-to-br from-sky-600 via-cyan-500 to-emerald-400 px-6 py-14 text-white shadow-soft sm:px-10 md:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.25),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.18),_transparent_38%)]" />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
                Join the next wave of open source builders
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Start Building Your Developer Reputation
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/85 md:text-lg">
                Turn your commits, pull requests, and reviews into a portfolio that helps
                you stand out.
              </p>
            </div>
            <a
              href={getAppHref("/login")}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Get Started Free
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
