import { AlertTriangle, Gauge, Lightbulb } from "lucide-react";
import { EstimatorResult } from "../types/flow";
import { Badge } from "./Badge";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes.toFixed(0)} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[index]}`;
}

export function RequestEstimator({ result }: { result: EstimatorResult }) {
  const tone = result.complexity === "High" ? "red" : result.complexity === "Medium" ? "yellow" : "green";

  return (
    <aside className="sticky top-24 rounded-lg border border-gt-gold/40 bg-white p-5 shadow-[0_24px_70px_rgba(0,48,87,0.10)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-gt-gold/40 bg-cyan-50 text-gt-navy">
            <Gauge className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-ink">Live request estimator</h3>
            <p className="text-xs text-slate-500">Mock calculation, 8 bytes/value</p>
          </div>
        </div>
        <Badge tone={tone}>{result.complexity}</Badge>
      </div>

      <dl className="mt-5 grid gap-3">
        <div className="rounded-md border border-gt-gold/20 bg-gt-ivory p-3">
          <dt className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Grid points</dt>
          <dd className="mt-1 text-2xl font-semibold text-slate-900">{result.gridPoints.toLocaleString()}</dd>
        </div>
        <div className="rounded-md border border-gt-gold/20 bg-gt-ivory p-3">
          <dt className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Output size</dt>
          <dd className="mt-1 text-2xl font-semibold text-slate-900">{formatBytes(result.outputBytes)}</dd>
        </div>
        <div className="rounded-md border border-gt-gold/20 bg-gt-ivory p-3">
          <dt className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Browser suitability</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-800">{result.browserSuitability}</dd>
        </div>
      </dl>

      {result.warnings.length > 0 && (
        <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-800">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Warnings
          </div>
          <ul className="space-y-1 text-sm text-rose-700">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 rounded-lg border border-gt-gold/40 bg-cyan-50 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gt-navy">
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
          Suggestions
        </div>
        <ul className="space-y-1 text-sm text-gt-navy">
          {result.suggestions.map((suggestion) => (
            <li key={suggestion}>{suggestion}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
