import { ArrowLeft, ArrowRight, BarChart3, CheckCircle2, Clock, Database, Layers3, Microscope, Ruler } from "lucide-react";
import { Badge } from "../components/Badge";
import { datasets } from "../data/datasets";

const methodNotes = [
  "Start with a point query to confirm coordinates and variable names.",
  "Use slices for quick visual diagnostics before requesting a 3D cutout.",
  "Prefer coarser sampling for first-pass volume exports.",
  "Use time-series access when the scientific question is temporal rather than spatial."
];

export function DatasetDetailPage({
  datasetId,
  onStartQuery
}: {
  datasetId: string;
  onStartQuery: (datasetId: string) => void;
}) {
  const dataset = datasets.find((item) => item.id === datasetId) ?? datasets[0];

  return (
    <section className="bg-gt-ivory py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <a href="#/datasets" className="inline-flex items-center gap-2 text-sm font-semibold text-gt-navy transition hover:text-gt-navy">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to datasets
        </a>

        <div className="mt-6 grid gap-8 lg:grid-cols-[0.64fr_0.36fr]">
          <div className="gt-card rounded-lg border p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex rounded-full border border-gt-gold/40 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gt-navy">
                  Dataset detail
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">{dataset.name}</h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{dataset.summary}</p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-gt-navy text-gt-gold">
                <Database className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {dataset.tags.map((tag) => (
                <Badge key={tag} tone={tag.includes("Pressure") ? "green" : tag.includes("High") ? "cyan" : "slate"}>
                  {tag}
                </Badge>
              ))}
              <Badge tone={dataset.difficulty === "High" ? "red" : dataset.difficulty === "Medium" ? "yellow" : "green"}>
                {dataset.difficulty} difficulty
              </Badge>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gt-gold/30 bg-gt-ivory p-4">
                <Microscope className="h-5 w-5 text-gt-navy" aria-hidden="true" />
                <h2 className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Flow type</h2>
                <p className="mt-1 text-base font-semibold text-slate-900">{dataset.flowType}</p>
              </div>
              <div className="rounded-lg border border-gt-gold/30 bg-gt-ivory p-4">
                <Layers3 className="h-5 w-5 text-gt-navy" aria-hidden="true" />
                <h2 className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Spatial resolution</h2>
                <p className="mt-1 text-base font-semibold text-slate-900">{dataset.spatialResolution}</p>
              </div>
              <div className="rounded-lg border border-gt-gold/30 bg-gt-ivory p-4">
                <Clock className="h-5 w-5 text-gt-navy" aria-hidden="true" />
                <h2 className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Time coverage</h2>
                <p className="mt-1 text-base font-semibold text-slate-900">{dataset.timeRange}</p>
                <p className="mt-1 text-sm text-slate-600">{dataset.timeResolution}</p>
              </div>
              <div className="rounded-lg border border-gt-gold/30 bg-gt-ivory p-4">
                <BarChart3 className="h-5 w-5 text-gt-navy" aria-hidden="true" />
                <h2 className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Best use case</h2>
                <p className="mt-1 text-sm leading-6 text-slate-700">{dataset.bestUseCase}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div>
                <h2 className="text-lg font-semibold text-ink">Available variables</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {dataset.variables.map((variable) => (
                    <Badge key={variable} tone="cyan">{variable}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ink">Supported query types</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {dataset.supportedQueryLabels.map((queryType) => (
                    <Badge key={queryType}>{queryType}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="grid content-start gap-5">
            <div className="gt-card rounded-lg border p-5">
              <Ruler className="h-5 w-5 text-gt-navy" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold text-ink">How to work with this dataset</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                {methodNotes.map((note) => (
                  <li key={note} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gt-gold" aria-hidden="true" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-gt-gold/40 bg-cyan-50 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gt-navy">Ready to build a request?</h2>
              <p className="mt-2 text-sm leading-6 text-gt-navy">
                Open the guided query builder with {dataset.name} preselected and use the live estimator to tune request size.
              </p>
              <button
                type="button"
                onClick={() => onStartQuery(dataset.id)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gt-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001B33]"
              >
                Start query with this dataset
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
