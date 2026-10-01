import { ArrowRight, GitCompareArrows } from "lucide-react";

export function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-slate-200 bg-gt-navy text-white">
      <div className="absolute inset-0 opacity-35">
        <div className="h-full w-full bg-[linear-gradient(90deg,rgba(179,163,105,0.24)_1px,transparent_1px),linear-gradient(0deg,rgba(179,163,105,0.16)_1px,transparent_1px)] bg-[size:52px_52px]" />
      </div>
      <div className="relative mx-auto grid min-h-[520px] max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
            Research-grade query workflow
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Explore Large-Scale Flow Physics Data
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Compare simulation datasets, build spatial and temporal queries, estimate request size before export, and move from scientific question to usable data product with fewer blind turns.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#query-builder"
              className="inline-flex items-center gap-2 rounded-md bg-gt-gold px-5 py-3 text-sm font-semibold text-gt-navy transition hover:bg-cyan-200"
            >
              Start Query <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#compare"
              className="inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <GitCompareArrows className="h-4 w-4" aria-hidden="true" /> Compare Datasets
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="rounded-lg border border-white/15 bg-white/10 p-4 shadow-panel backdrop-blur">
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 36 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 rounded border border-cyan-200/10 bg-cyan-100/10"
                  style={{ opacity: 0.25 + ((index % 7) * 0.08) }}
                />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-md bg-[#001B33]/70 p-3">
                <span className="block text-2xl font-semibold text-cyan-100">4</span>
                <span className="text-slate-300">Datasets</span>
              </div>
              <div className="rounded-md bg-[#001B33]/70 p-3">
                <span className="block text-2xl font-semibold text-cyan-100">5</span>
                <span className="text-slate-300">Query modes</span>
              </div>
              <div className="rounded-md bg-[#001B33]/70 p-3">
                <span className="block text-2xl font-semibold text-cyan-100">8B</span>
                <span className="text-slate-300">Bytes/value</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
