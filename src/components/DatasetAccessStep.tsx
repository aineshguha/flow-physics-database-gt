import { useEffect, useState } from "react";
import { ArrowRight, Download } from "lucide-react";
import { flowConfigurations, getDatasetConfiguration, type DatasetSelection } from "../config/isotropicTurbulenceConfig";
import { getDataset } from "../services/datasetService";
import type { DatasetState } from "../services/datasetProvider";
import type { QueryState } from "../types/flow";

export function DatasetAccessStep({ selection, accessMode, onSelectMode, onContinue }: {
  selection: DatasetSelection;
  accessMode?: QueryState["accessMode"];
  onSelectMode: (mode: NonNullable<QueryState["accessMode"]>) => void;
  onContinue: () => void;
}) {
  const branch = flowConfigurations[selection.category];
  const configuration = getDatasetConfiguration(selection)!;
  const [state, setState] = useState<DatasetState>({ status: "Loading" });
  useEffect(() => {
    let active = true;
    setState({ status: "Loading" });
    void getDataset(selection).then(result => { if (active) setState(result); });
    return () => { active = false; };
  }, [selection.category, selection.parameter, selection.value]);

  return <div className="grid gap-6">
    <section className="border-y border-gt-gold/50 bg-white px-5 py-5" aria-label="Selected dataset">
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold uppercase text-slate-500">Selected Dataset</p><a href={`#/datasets/isotropic/${selection.category}`} className="text-sm font-semibold text-gt-navy underline underline-offset-4">Change Dataset</a></div>
      <h3 className="mt-1 text-xl font-semibold text-gt-navy">Isotropic Turbulence</h3>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div><dt className="text-slate-500">Configuration</dt><dd className="font-semibold text-slate-900">{branch.label}</dd></div>
        <div><dt className="text-slate-500">{branch.parameterLabel}</dt><dd className="font-semibold text-slate-900">{selection.value}</dd></div>
        <div><dt className="text-slate-500">File Format</dt><dd className="font-semibold text-slate-900">{configuration.fileFormat ?? "Not yet confirmed"}</dd></div>
      </dl>
    </section>

    <div><h3 className="text-lg font-semibold text-gt-navy">How would you like to access this dataset?</h3>
      <p className="mt-1 text-sm text-slate-600">Choose the original complete file or build a request for a specific subset.</p></div>

    <div className="grid gap-4 md:grid-cols-2">
      <section className={`gt-card rounded-lg border p-5 ${accessMode === "full-download" ? "border-gt-gold" : "border-slate-200"}`}>
        <label className="flex cursor-pointer items-start gap-3"><input type="radio" name="access-mode" checked={accessMode === "full-download"} onChange={() => onSelectMode("full-download")} className="mt-1 accent-gt-navy" />
          <span><span className="block font-semibold text-gt-navy">Download complete dataset</span><span className="mt-1 block text-sm leading-6 text-slate-600">Get the entire original source file without filters or conversion.</span></span></label>
        <dl className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-slate-500">File Format</dt><dd className="font-medium">{configuration.fileFormat ?? "Not yet confirmed"}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-500">Source file size</dt><dd className="font-medium">{configuration.fileSize === null ? "Not yet verified" : `${configuration.fileSize.toLocaleString()} bytes`}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-500">Source</dt><dd className="font-medium">{configuration.connection.repositoryId ?? "Not yet connected"}</dd></div>
        </dl>
        {state.status === "DatasetAvailable"
          ? <a href={state.downloadUrl} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gt-navy px-4 py-3 text-sm font-semibold text-white"><Download size={17} aria-hidden="true" /> Download Full Dataset</a>
          : <button type="button" disabled className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gt-navy px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"><Download size={17} aria-hidden="true" /> Download Full Dataset</button>}
        <p className="mt-3 text-sm text-slate-600" role="status">{state.status === "DatasetAvailable" ? "Source file available from Hugging Face." : state.status === "Loading" ? "Checking dataset connection..." : "Full dataset download is not available for this configuration yet."}</p>
      </section>

      <section className={`gt-card rounded-lg border p-5 ${accessMode === "query" ? "border-gt-gold" : "border-slate-200"}`}>
        <label className="flex cursor-pointer items-start gap-3"><input type="radio" name="access-mode" checked={accessMode === "query"} onChange={() => onSelectMode("query")} className="mt-1 accent-gt-navy" />
          <span><span className="block font-semibold text-gt-navy">Continue with query</span><span className="mt-1 block text-sm leading-6 text-slate-600">{configuration.verifiedSchemaId ? "Request a small real HDF5 slice using verified field names and array indices." : "No verified field schema is connected yet for this configuration."}</span></span></label>
        <button type="button" onClick={onContinue} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gt-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#001B33]">Continue with Query <ArrowRight size={17} aria-hidden="true" /></button>
      </section>
    </div>
  </div>;
}
