import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DatasetCard } from "../components/DatasetCard";
import { datasets } from "../data/datasets";

export function DatasetsPage({ onLearnMore }: { onLearnMore: (datasetId: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDatasets = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return datasets;

    return datasets.filter((dataset) => {
      const searchableText = [
        dataset.name,
        dataset.flowType,
        dataset.resolution,
        dataset.spatialResolution,
        dataset.timeResolution,
        dataset.timeRange,
        dataset.summary,
        dataset.bestUseCase,
        dataset.difficulty,
        ...dataset.variables,
        ...dataset.supportedQueryLabels,
        ...dataset.tags
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [searchTerm]);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-gt-gold/40 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gt-navy">
              Dataset browser
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">Browse simulation-ready flow archives.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Each dataset card shows scientific context, available variables, query support, and tags that matter when planning an analysis workflow.
            </p>
          </div>
          <label className="flex min-w-72 items-center gap-2 rounded-lg border border-gt-gold/30 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm transition focus-within:border-gt-gold focus-within:ring-2 focus-within:ring-gt-gold/20">
            <Search className="h-4 w-4 text-gt-navy" aria-hidden="true" />
            <span className="sr-only">Search datasets</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search datasets, variables, tags..."
              className="w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-600">
            Showing <span className="font-semibold text-gt-navy">{filteredDatasets.length}</span> of {datasets.length} datasets
          </p>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="rounded-md border border-gt-gold/30 bg-white px-3 py-1.5 text-xs font-semibold text-gt-navy transition hover:bg-cyan-50"
            >
              Clear search
            </button>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {filteredDatasets.map((dataset) => (
            <DatasetCard key={dataset.id} dataset={dataset} onLearnMore={onLearnMore} />
          ))}
        </div>

        {filteredDatasets.length === 0 && (
          <div className="gt-panel mt-6 rounded-lg border p-8 text-center">
            <h2 className="text-xl font-semibold text-ink">No datasets matched that search.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Try searching by flow type, variable, tag, or query method, such as velocity, pressure, wall bounded, time series, or high resolution.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
