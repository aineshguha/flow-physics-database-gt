import { Download, Code2, Info } from "lucide-react";
import type { DatasetConfiguration, DatasetState } from "../../services/datasetProvider";
import type { DatasetSelection } from "../../config/isotropicTurbulenceConfig";
import { flowConfigurations } from "../../config/isotropicTurbulenceConfig";

export function DatasetBreadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-600"><ol className="flex flex-wrap items-center gap-2">
    {items.map((item, index) => <li key={item.label} className="flex items-center gap-2">
      {index > 0 && <span aria-hidden="true">/</span>}
      {item.href ? <a className="font-medium text-gt-navy underline-offset-4 hover:underline" href={item.href}>{item.label}</a> : <span aria-current="page">{item.label}</span>}
    </li>)}
  </ol></nav>;
}

const statusMessages: Record<DatasetState["status"], string> = {
  Loading: "Loading dataset information...",
  DatasetAvailable: "Dataset available",
  DatasetUnavailable: "Dataset unavailable",
  DatasetNotConfigured: "Dataset not yet connected",
  ProviderUnreachable: "Unable to reach data provider",
  AuthenticationRequired: "Authentication required",
  DatasetFileNotFound: "Dataset file not found"
};

export function DatasetStatus({ state }: { state: DatasetState }) {
  return <div role="status" aria-live="polite" className="my-6 flex items-start gap-3 border-l-4 border-gt-gold bg-white p-4 text-gt-navy">
    <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
    <div><p className="font-semibold">{statusMessages[state.status]}</p>
      {state.status === "DatasetNotConfigured" && <p className="mt-1 text-sm text-slate-600">Dataset connection coming soon.</p>}
    </div>
  </div>;
}

export function DatasetMetadata({ configuration, selection }: { configuration: DatasetConfiguration; selection: DatasetSelection }) {
  const branch = flowConfigurations[selection.category];
  const rows = [
    ["Dataset name", configuration.name], ["Configuration", branch.label],
    ["Parameter", branch.parameterLabel], ["Parameter value", String(selection.value)],
    ["Dataset description", configuration.description],
    ["File size", configuration.fileSize === null ? null : `${configuration.fileSize.toLocaleString()} bytes`],
    ["File format", configuration.fileFormat], ["Available variables", configuration.variables.join(", ") || null],
    ["Number of samples/data points", configuration.sampleCount?.toLocaleString()],
    ["Dataset version", configuration.version], ["Last updated", configuration.lastUpdated], ["Data source", configuration.dataSource]
  ];
  return <section aria-labelledby="metadata-heading"><h2 id="metadata-heading" className="text-xl font-semibold text-gt-navy">Dataset Information</h2>
    <dl className="mt-4 divide-y divide-slate-200 border-y border-slate-200">{rows.map(([label, value]) => <div key={label} className="grid gap-1 py-4 sm:grid-cols-2 sm:gap-4">
      <dt className="text-sm font-medium text-slate-600">{label}</dt><dd className="break-words text-sm text-slate-900">{value ?? "Not yet connected"}</dd>
    </div>)}</dl>
  </section>;
}

export function DatasetAccessPanel({ state }: { state: DatasetState }) {
  return <section className="border-t border-gt-gold/40 pt-6" aria-labelledby="access-heading">
    <h2 id="access-heading" className="text-xl font-semibold text-gt-navy">Access Dataset</h2>
    <p className="mt-3 text-sm leading-6 text-slate-600">Dataset access will become available once this configuration is connected to the data repository.</p>
    <div className="mt-5 flex flex-wrap gap-3">
      <button disabled className="inline-flex items-center gap-2 rounded-md bg-gt-navy px-4 py-3 text-sm font-semibold text-white opacity-50 disabled:cursor-not-allowed"><Download size={18} aria-hidden="true" />Download Dataset</button>
      <button disabled className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold opacity-50 disabled:cursor-not-allowed"><Code2 size={18} aria-hidden="true" />Use in Python</button>
    </div>
    <details className="mt-6 border-y border-slate-200 py-4"><summary className="cursor-pointer font-semibold text-gt-navy">Use in Python</summary>
      {state.status === "DatasetAvailable" && state.pythonCode ? <pre className="mt-4 overflow-x-auto text-sm">{state.pythonCode}</pre> : <p className="mt-3 text-sm leading-6 text-slate-600">Python integration will be generated automatically after the dataset repository is connected.</p>}
    </details>
  </section>;
}
