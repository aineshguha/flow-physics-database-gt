import { useState } from "react";
import { ArrowRight, BookOpen, Code2, Layers3, Network, Ruler, Search, TimerReset } from "lucide-react";

const docCards = [
  {
    id: "pointwise",
    icon: Network,
    title: "Pointwise browser access",
    body: "Use point queries to inspect a small number of coordinates before building a larger cutout. This is best for sanity checks, diagnostics, and teaching examples.",
    purpose: "Retrieve values at one or more x, y, z coordinates for a selected variable and time step.",
    useWhen: ["You need a quick value check", "You are debugging coordinate conventions", "You want a low-cost browser preview"],
    inputs: ["Dataset", "Variable", "x/y/z coordinate", "Time step"],
    output: "A small table or JSON-like response with scalar or vector values at the requested point.",
    guidance: "Start here before requesting a larger region. If the value looks wrong, the issue is usually coordinate scale, variable component choice, or time index."
  },
  {
    id: "local-access",
    icon: Code2,
    title: "Python and MATLAB local access",
    body: "Export reviewed requests as snippets for local workflows. The prototype uses mock snippets, but the shape mirrors a real client library request.",
    purpose: "Move a reviewed query into a reproducible local analysis workflow.",
    useWhen: ["You need repeatable analysis", "You want to save analysis outputs", "You are integrating with NumPy, xarray, MATLAB, or plotting tools"],
    inputs: ["API token", "Dataset id", "Variable", "Query type", "Region and time settings"],
    output: "A script-ready request that can download, reshape, and save data for local analysis.",
    guidance: "Use local access after the estimator says the request is too large for browser preview or when the analysis needs to be repeated."
  },
  {
    id: "cutout",
    icon: Layers3,
    title: "Cutout service",
    body: "Volume and slice queries behave like cutouts: choose a subdomain, time range, variable, and sampling resolution, then estimate output size.",
    purpose: "Extract a 2D slice or 3D subvolume from a larger simulation field.",
    useWhen: ["You need a spatial patch", "You are visualizing planes or local structures", "You need data for downstream simulation or ML preprocessing"],
    inputs: ["x/y/z bounds", "Axis or volume region", "Time start/end", "Sampling resolution", "Variable components"],
    output: "A grid-aligned spatial subset with metadata describing bounds, spacing, and requested time range.",
    guidance: "Cutouts can grow quickly. Reduce x/y/z span, time window, or sampling density before exporting."
  },
  {
    id: "spatial",
    icon: Ruler,
    title: "Spatial methods",
    body: "Spatial inputs map directly to a flow domain preview. In a production portal, this area would document interpolation, grid indexing, and coordinate conventions.",
    purpose: "Explain how requested coordinates map to simulation grid locations.",
    useWhen: ["You need interpolation rules", "You are converting physical units to grid indices", "You want to understand axis orientation"],
    inputs: ["Coordinate system", "Grid resolution", "Interpolation method", "Boundary behavior"],
    output: "A documented interpretation of how x/y/z values are sampled against the stored field.",
    guidance: "Always confirm whether coordinates are normalized, physical units, or grid indices before comparing across datasets."
  },
  {
    id: "temporal",
    icon: TimerReset,
    title: "Temporal methods",
    body: "Time-series and time-windowed volume requests show why saved snapshot cadence matters. The estimator treats longer time ranges as larger requests.",
    purpose: "Describe how time steps, saved snapshots, and intervals affect request size and interpretation.",
    useWhen: ["You need time-series behavior", "You are comparing transient events", "You want a time-windowed volume export"],
    inputs: ["Time step", "Start time", "End time", "Interval", "Snapshot cadence"],
    output: "Values or cutouts sampled across one or more saved simulation times.",
    guidance: "Long time ranges multiply request size. First use a coarse interval, then refine around the time window that matters."
  },
  {
    id: "query-choice",
    icon: Search,
    title: "Choosing a query type",
    body: "Start with point or line access, move to slices for visual inspection, and only request 3D volume exports once region and time settings are constrained.",
    purpose: "Help researchers pick the least expensive query that still answers the scientific question.",
    useWhen: ["You are unsure where to start", "You need to balance detail and cost", "You are preparing a request for export"],
    inputs: ["Scientific goal", "Dataset scale", "Needed variables", "Spatial and temporal scope"],
    output: "A recommended query pattern: point, line, slice, volume, or time series.",
    guidance: "Use the smallest query that preserves the physics you need. A good workflow is point, then line, then slice, then volume."
  }
];

export function DocsPage() {
  const [selectedDocId, setSelectedDocId] = useState(docCards[0].id);
  const selectedDoc = docCards.find((item) => item.id === selectedDocId) ?? docCards[0];

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full border border-gt-gold/40 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gt-navy">
            Method docs
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">Access methods for large flow-field data.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This page explains the main query patterns a researcher would expect from a turbulence database-style portal: point reads, cutouts, local client access, and spatial or temporal method notes.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {docCards.map((item) => (
            <button
              type="button"
              key={item.title}
              onClick={() => setSelectedDocId(item.id)}
              className={`rounded-lg border p-5 text-left transition ${
                selectedDocId === item.id
                  ? "border-gt-gold bg-cyan-50 shadow-[0_18px_55px_rgba(0,48,87,0.10)]"
                  : "border-gt-gold/25 bg-gt-ivory hover:border-gt-gold/60 hover:bg-white"
              }`}
            >
              <item.icon className="h-5 w-5 text-gt-navy" aria-hidden="true" />
              <div className="mt-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-ink">{item.title}</h2>
                <ArrowRight className={`h-4 w-4 shrink-0 text-gt-navy transition ${selectedDocId === item.id ? "translate-x-1" : ""}`} aria-hidden="true" />
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </button>
          ))}
        </div>

        <section className="gt-panel mt-10 rounded-lg border p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-gt-gold/40 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gt-navy">
                Expanded method
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">{selectedDoc.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{selectedDoc.purpose}</p>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-gt-navy text-gt-gold">
              <selectedDoc.icon className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-gt-gold/30 bg-gt-ivory p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Use when</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {selectedDoc.useWhen.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-gt-gold/30 bg-gt-ivory p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Typical inputs</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {selectedDoc.inputs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-gt-gold/30 bg-gt-ivory p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Expected output</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">{selectedDoc.output}</p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-gt-gold/40 bg-cyan-50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gt-navy">Practical guidance</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{selectedDoc.guidance}</p>
          </div>
        </section>

        <div className="mt-10 rounded-lg border border-slate-200 bg-gt-navy p-5 text-white">
          <BookOpen className="h-5 w-5 text-cyan-200" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold">Prototype note</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            No backend is connected. All fields, estimates, and snippets are mock data intended to show how a professor-facing frontend MVP could guide scientific decisions before an expensive data request.
          </p>
        </div>
      </div>
    </section>
  );
}
