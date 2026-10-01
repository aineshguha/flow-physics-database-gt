import { ArrowRight, Braces, Clock, Cuboid, Database, Download, GitCompareArrows, LineChart, MonitorDot, Sigma } from "lucide-react";
import { datasets } from "../data/datasets";

const basics = [
  {
    icon: Cuboid,
    title: "What each dataset contains",
    body: "Each archive represents a direct numerical simulation or high-fidelity flow field sampled on a structured spatial grid. Users can inspect velocity, pressure, vorticity, scalar, thermal, and wall-derived quantities depending on the dataset."
  },
  {
    icon: Clock,
    title: "How time is stored",
    body: "The mock catalog treats time as saved simulation snapshots. Some datasets are strongly time resolved for time-series analysis, while others are better suited for spatial cutouts and profile comparisons."
  },
  {
    icon: Sigma,
    title: "Variables and components",
    body: "Vector fields such as velocity usually have multiple components, while scalar fields such as pressure or concentration have one value per grid point. That difference directly affects request size."
  },
  {
    icon: Braces,
    title: "Access styles",
    body: "The interface models pointwise browser access, line and slice extraction, 3D volume cutouts, local Python or MATLAB-style workflows, and method documentation for spatial and temporal interpolation."
  }
];

const accessMethods = [
  "Point queries for quick inspection at x, y, z, and time",
  "Line queries for profiles through a flow domain",
  "2D slices for planar visualization and diagnostics",
  "3D volume cutouts for local subdomain analysis",
  "Time series queries for temporal behavior at fixed points"
];

export function HomePage() {
  return (
    <div className="bg-gt-ivory">
      <section className="relative overflow-hidden border-b border-gt-gold/40 bg-gt-navy text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(179,163,105,0.24),transparent_30rem),linear-gradient(135deg,rgba(0,48,87,1),rgba(0,27,51,1))]" />
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-[linear-gradient(90deg,rgba(179,163,105,0.24)_1px,transparent_1px),linear-gradient(0deg,rgba(179,163,105,0.16)_1px,transparent_1px)] bg-[size:52px_52px]" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gt-gold" />
        <div className="relative mx-auto grid min-h-[580px] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_0.86fr] lg:px-8">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-gt-gold/45 bg-gt-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#efe7cf]">
              Flow physics database primer
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Explore Large-Scale Flow Physics Data
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Georgia Tech Turbulence Database helps researchers understand what is inside each simulation archive before requesting data: grid structure, flow type, available variables, time coverage, cutout limits, and the best access method for the job.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#/query" className="inline-flex items-center gap-2 rounded-md bg-gt-gold px-5 py-3 text-sm font-bold text-gt-navy shadow-[0_16px_40px_rgba(179,163,105,0.22)] transition hover:bg-cyan-200">
                Start Query <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="#/compare" className="inline-flex items-center gap-2 rounded-md border border-gt-gold/40 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                <GitCompareArrows className="h-4 w-4" aria-hidden="true" /> Compare Datasets
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-gt-gold/35 bg-white/10 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.28)] backdrop-blur">
            <div className="flex items-center gap-3 border-b border-gt-gold/25 pb-4">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-gt-gold text-gt-navy">
                <Database className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Dataset catalog snapshot</h2>
                <p className="text-sm text-slate-300">Four representative flow archives</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {datasets.map((dataset) => (
                <div key={dataset.id} className="rounded-md border border-white/10 bg-[#001B33]/78 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-cyan-50">{dataset.name}</span>
                    <span className="text-xs text-slate-300">{dataset.resolution}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{dataset.flowType}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-gt-gold/40 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gt-navy">
              Dataset basics
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Understand the archive before you download the flow field.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Scientific turbulence databases are powerful because they expose enormous simulation fields through smaller access patterns. This prototype makes those choices visible before a request is submitted.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {basics.map((item) => (
              <article key={item.title} className="gt-card rounded-lg border p-5 transition hover:-translate-y-1">
                <item.icon className="h-5 w-5 text-gt-navy" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-gt-gold/30 bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.42fr_0.58fr] lg:px-8">
          <div>
            <div className="inline-flex rounded-full border border-gt-gold/40 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gt-navy">
              Access methods
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">From browser inspection to local research workflows.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Like established turbulence data portals, Georgia Tech Turbulence Database separates small interactive reads from larger cutouts and export-ready requests.
            </p>
          </div>
          <div className="grid gap-3">
            {accessMethods.map((method, index) => (
              <div key={method} className="flex items-center gap-3 rounded-lg border border-gt-gold/30 bg-gt-ivory p-4 shadow-sm">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-gt-navy text-sm font-semibold text-gt-gold">{index + 1}</span>
                <span className="text-sm font-medium text-slate-700">{method}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {[
            { icon: MonitorDot, title: "Estimate first", body: "The live estimator translates region size, time range, and variable components into grid points and output size." },
            { icon: LineChart, title: "Compare scientifically", body: "The comparison page frames dataset choice around flow type, resolution, variables, difficulty, and best use case." },
            { icon: Download, title: "Export cleanly", body: "The review page gives a plain-English request summary, JSON preview, and Python-style snippet for local analysis." }
          ].map((item) => (
            <article key={item.title} className="gt-card rounded-lg border p-5 transition hover:-translate-y-1">
              <item.icon className="h-5 w-5 text-gt-navy" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
