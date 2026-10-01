import { ArrowRight, Database, Layers3 } from "lucide-react";
import { Dataset } from "../types/flow";
import { Badge } from "./Badge";

export function DatasetCard({ dataset, onLearnMore }: { dataset: Dataset; onLearnMore: (datasetId: string) => void }) {
  return (
    <article className="gt-card flex h-full flex-col rounded-lg border p-5 transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-ink">{dataset.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{dataset.flowType}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-md border border-gt-gold/40 bg-cyan-50 text-gt-navy">
          <Database className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{dataset.summary}</p>

      <div className="mt-5 grid gap-3 text-sm">
        <div className="flex items-center gap-2 text-slate-700">
          <Layers3 className="h-4 w-4 text-gt-navy" aria-hidden="true" />
          <span className="font-medium">Resolution:</span> {dataset.resolution}
        </div>
        <div>
          <span className="font-medium text-slate-700">Variables:</span>
          <span className="ml-1 text-slate-600">{dataset.variables.join(", ")}</span>
        </div>
        <div>
          <span className="font-medium text-slate-700">Time range:</span>
          <span className="ml-1 text-slate-600">{dataset.timeRange}</span>
        </div>
        <div>
          <span className="font-medium text-slate-700">Query types:</span>
          <span className="ml-1 text-slate-600">{dataset.supportedQueryLabels.join(", ")}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {dataset.tags.map((tag) => (
          <Badge key={tag} tone={tag.includes("Pressure") ? "green" : tag.includes("High") ? "cyan" : "slate"}>
            {tag}
          </Badge>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onLearnMore(dataset.id)}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gt-navy px-4 py-2.5 text-sm font-bold text-white shadow-[0_14px_34px_rgba(0,48,87,0.16)] transition hover:bg-[#001B33]"
      >
        Learn More
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </article>
  );
}
