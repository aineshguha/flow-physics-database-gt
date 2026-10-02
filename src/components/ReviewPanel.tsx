import { Clipboard, Code2, Send } from "lucide-react";
import { Dataset, EstimatorResult, QueryState } from "../types/flow";
import { flowConfigurations } from "../config/isotropicTurbulenceConfig";
import { buildRequestPayload } from "../config/queryRequest";

function queryLabel(queryType: QueryState["queryType"]) {
  return {
    point: "point query",
    line: "line query",
    slice: "2D slice",
    volume: "3D volume",
    "time-series": "time series"
  }[queryType];
}

function buildSummary(query: QueryState, dataset: Dataset) {
  const context = query.isotropicContext;
  const datasetName = context
    ? `Isotropic Turbulence ${flowConfigurations[context.configuration].label} dataset with a ${context.parameter.type === "density-ratio" ? "density ratio" : "Weber number"} of ${context.parameter.value}`
    : `${dataset.name} dataset`;
  if (query.queryType === "volume") {
    return `You are requesting ${query.variable} data from the ${datasetName} over a 3D volume from x = ${query.bounds.xMin} to ${query.bounds.xMax}, y = ${query.bounds.yMin} to ${query.bounds.yMax}, and z = ${query.bounds.zMin} to ${query.bounds.zMax} at time steps ${query.timeStart} to ${query.timeEnd}.`;
  }

  if (query.queryType === "slice") {
    return `You are requesting ${query.variable} data from the ${datasetName} as a ${query.axis}-axis slice at position ${query.slicePosition}, with width ${query.width}, height ${query.height}, and time step ${query.timeStep}.`;
  }

  if (query.queryType === "time-series") {
    return `You are requesting a ${query.variable} time series from the ${datasetName} at x = ${query.coordinates.x}, y = ${query.coordinates.y}, z = ${query.coordinates.z}, from t = ${query.timeStart} to ${query.timeEnd} every ${query.timeInterval} step(s).`;
  }

  return `You are requesting ${query.variable} data from the ${datasetName} using a ${queryLabel(query.queryType)} at x = ${query.coordinates.x}, y = ${query.coordinates.y}, z = ${query.coordinates.z}, and time step ${query.timeStep}.`;
}

function buildPythonSnippet(query: QueryState, dataset: Dataset) {
  return `from flowdb import FlowDBClient

client = FlowDBClient(token="YOUR_TOKEN")
result = client.query(
    dataset="${dataset.id}",
    variable="${query.variable}",
    query_type="${query.queryType}",
    region=${JSON.stringify(query.queryType === "volume" ? query.bounds : query.coordinates)},
    time_start=${query.timeStart},
    time_end=${query.timeEnd},
    sampling_resolution=${query.samplingResolution}
)
result.to_xarray().to_netcdf("flowdb_export.nc")`;
}

export function ReviewPanel({ query, dataset, estimator }: { query: QueryState; dataset: Dataset; estimator: EstimatorResult }) {
  const spatialSummary = query.queryType === "volume"
    ? `X ${query.bounds.xMin} to ${query.bounds.xMax}, Y ${query.bounds.yMin} to ${query.bounds.yMax}, Z ${query.bounds.zMin} to ${query.bounds.zMax}`
    : query.queryType === "slice"
      ? `${query.axis} slice at ${query.slicePosition}; ${query.width} x ${query.height}`
      : `X ${query.coordinates.x}, Y ${query.coordinates.y}, Z ${query.coordinates.z}`;
  const timeSummary = query.queryType === "volume" || query.queryType === "time-series"
    ? `${query.timeStart} to ${query.timeEnd}${query.queryType === "time-series" ? ` every ${query.timeInterval} step(s)` : ""}`
    : `Step ${query.timeStep}`;
  const queryTypeName = { point: "Point query", line: "Line query", slice: "2D slice", volume: "3D volume", "time-series": "Time series" }[query.queryType];
  const jsonPreview = JSON.stringify(buildRequestPayload(query, estimator), null, 2);
  const pythonSnippet = query.isotropicContext ? null : buildPythonSnippet(query, dataset);

  function copyToClipboard(value: string) {
    void navigator.clipboard?.writeText(value);
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-lg border border-gt-gold/40 bg-cyan-50 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gt-navy">Plain-English request summary</h3>
        <p className="mt-3 text-sm leading-6 text-gt-navy">{buildSummary(query, dataset)}</p>
      </div>

      {query.isotropicContext && <div className="gt-card rounded-lg border p-5"><h3 className="text-lg font-semibold text-gt-navy">Dataset selection</h3><dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-slate-500">Dataset</dt><dd className="font-semibold">Isotropic Turbulence</dd></div>
        <div><dt className="text-slate-500">Configuration</dt><dd className="font-semibold">{flowConfigurations[query.isotropicContext.configuration].label}</dd></div>
        <div><dt className="text-slate-500">{query.isotropicContext.parameter.type === "density-ratio" ? "Density Ratio" : "Weber Number"}</dt><dd className="font-semibold">{query.isotropicContext.parameter.value}</dd></div>
        <div><dt className="text-slate-500">File Format</dt><dd className="font-semibold">{query.isotropicContext.fileFormat ?? "Not yet confirmed"}</dd></div>
        <div><dt className="text-slate-500">Access Mode</dt><dd className="font-semibold">Filtered Query</dd></div>
        <div><dt className="text-slate-500">Variable</dt><dd className="font-semibold">{query.variable}</dd></div>
        <div><dt className="text-slate-500">Query Type</dt><dd className="font-semibold">{queryTypeName}</dd></div>
        <div><dt className="text-slate-500">Spatial Region</dt><dd className="font-semibold">{spatialSummary}</dd></div>
        <div><dt className="text-slate-500">Time Range</dt><dd className="font-semibold">{timeSummary}</dd></div>
        <div><dt className="text-slate-500">Estimated Request</dt><dd className="font-semibold">{(estimator.outputBytes / 1024).toFixed(1)} KB, {estimator.complexity}</dd></div>
      </dl></div>}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-gt-navy p-4 text-white">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold">Query JSON preview</h4>
            <button onClick={() => copyToClipboard(jsonPreview)} className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/15" type="button">
              <Clipboard className="h-3.5 w-3.5" aria-hidden="true" /> Copy query
            </button>
          </div>
          <pre className="max-h-80 overflow-auto rounded-md bg-black/30 p-3 text-xs leading-5 text-cyan-50">
            {jsonPreview}
          </pre>
        </div>

        <div className="gt-card rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900">Python export snippet</h4>
            <button onClick={() => { if (pythonSnippet) copyToClipboard(pythonSnippet); }} disabled={!pythonSnippet} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45" type="button">
              <Code2 className="h-3.5 w-3.5" aria-hidden="true" /> Export Python snippet
            </button>
          </div>
          {pythonSnippet ? <pre className="max-h-80 overflow-auto rounded-md bg-gt-navy p-3 text-xs leading-5 text-cyan-50">{pythonSnippet}</pre> : <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">Python export will be available after the dataset structure and processing connection are configured.</p>}
        </div>
      </div>

      {query.isotropicContext && <p className="rounded-md border border-gt-gold/40 bg-cyan-50 p-4 text-sm font-semibold text-gt-navy">Dataset processing connection coming soon. This query is a frontend preview and cannot be submitted yet.</p>}
      <button type="button" disabled={Boolean(query.isotropicContext)} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gt-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001B33] disabled:cursor-not-allowed disabled:opacity-45">
        <Send className="h-4 w-4" aria-hidden="true" />
        Submit query
      </button>
    </div>
  );
}
