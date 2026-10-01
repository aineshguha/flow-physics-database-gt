import { useMemo, useState } from "react";
import { BarChart3, Check, HelpCircle } from "lucide-react";
import { datasets } from "../data/datasets";
import { Badge } from "./Badge";

const comparisonRows = [
  { label: "Flow type", getValue: (id: string) => datasets.find((d) => d.id === id)?.flowType },
  { label: "Spatial resolution", getValue: (id: string) => datasets.find((d) => d.id === id)?.spatialResolution },
  { label: "Time resolution", getValue: (id: string) => datasets.find((d) => d.id === id)?.timeResolution },
  { label: "Variables", getValue: (id: string) => datasets.find((d) => d.id === id)?.variables.join(", ") },
  { label: "Query support", getValue: (id: string) => datasets.find((d) => d.id === id)?.supportedQueryLabels.join(", ") },
  { label: "Best use case", getValue: (id: string) => datasets.find((d) => d.id === id)?.bestUseCase },
  { label: "Estimated difficulty", getValue: (id: string) => datasets.find((d) => d.id === id)?.difficulty }
];

export function DatasetComparison() {
  const [selectedIds, setSelectedIds] = useState(["isotropic", "channel", "mixing-layer"]);

  const selectedDatasets = useMemo(
    () => datasets.filter((dataset) => selectedIds.includes(dataset.id)),
    [selectedIds]
  );

  function toggleDataset(datasetId: string) {
    setSelectedIds((current) => {
      if (current.includes(datasetId)) {
        return current.length === 2 ? current : current.filter((id) => id !== datasetId);
      }

      return [...current, datasetId];
    });
  }

  return (
    <section id="compare" className="border-y border-gt-gold/30 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.38fr_0.62fr]">
          <div>
            <div className="inline-flex rounded-full border border-gt-gold/40 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gt-navy">
              Comparison dashboard
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Choose the right dataset before writing a query.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Select any number of candidates and compare scientific fit, query support, and expected workflow difficulty side by side.
            </p>

            <div className="mt-6 grid gap-3">
              {datasets.map((dataset) => {
                const checked = selectedIds.includes(dataset.id);
                return (
                  <label
                    key={dataset.id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition ${
                      checked ? "border-gt-gold bg-cyan-50" : "border-gt-gold/25 bg-white hover:bg-cyan-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`grid h-5 w-5 place-items-center rounded border ${checked ? "border-gt-navy bg-gt-navy text-white" : "border-slate-300"}`}>
                        {checked && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-slate-800">{dataset.name}</span>
                        <span className="text-xs text-slate-500">{dataset.flowType}</span>
                      </span>
                    </span>
                    <input className="sr-only" type="checkbox" checked={checked} onChange={() => toggleDataset(dataset.id)} />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gt-gold/40 bg-gt-ivory shadow-[0_20px_60px_rgba(0,48,87,0.08)]">
            <div className="flex items-center justify-between border-b border-gt-gold/30 bg-white px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <BarChart3 className="h-4 w-4 text-gt-navy" aria-hidden="true" />
                Research decision matrix
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {selectedDatasets.length} selected
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[760px] divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-gt-navy">
                  <tr>
                    <th className="w-44 px-4 py-3 font-semibold text-gt-gold">Field</th>
                    {selectedDatasets.map((dataset) => (
                      <th key={dataset.id} className="px-4 py-3 font-semibold text-white">{dataset.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {comparisonRows.map((row) => (
                    <tr key={row.label} className="align-top">
                      <th className="bg-gt-ivory px-4 py-4 font-semibold text-gt-navy">{row.label}</th>
                      {selectedDatasets.map((dataset) => {
                        const value = row.getValue(dataset.id);
                        return (
                          <td key={dataset.id} className="px-4 py-4 text-slate-600">
                            {row.label === "Estimated difficulty" ? (
                              <Badge tone={value === "High" ? "red" : value === "Medium" ? "yellow" : "green"}>{value}</Badge>
                            ) : (
                              value
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
