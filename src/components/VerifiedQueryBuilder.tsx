import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Clipboard, Database, Download, Play } from "lucide-react";
import { verifiedSchema } from "../config/isotropicTurbulenceConfig";
import { downloadResult, type QueryResult } from "../config/resultExport";

type Axis = "time" | "x" | "y" | "z";
type Operation = "point" | "slice" | "volume" | "time-series";
type Range = [number, number];
type Ranges = Record<Axis, Range>;
type FieldId = keyof typeof verifiedSchema.fields;

const axes: Axis[] = ["time", "x", "y", "z"];
const spatialAxes: Axis[] = ["x", "y", "z"];
const operations: { id: Operation; label: string }[] = [
  { id: "point", label: "Point" },
  { id: "slice", label: "2D slice" },
  { id: "volume", label: "3D volume" },
  { id: "time-series", label: "Time series" }
];
const maximumValues = 4096;
const maximumFrames = 32;

function makeRanges(operation: Operation, indices: Record<Axis, number>, bounds: Ranges, fixedAxis: Axis): Ranges {
  const single = (axis: Axis): Range => [indices[axis], indices[axis] + 1];
  if (operation === "point") return { time: single("time"), x: single("x"), y: single("y"), z: single("z") };
  if (operation === "time-series") return { time: bounds.time, x: single("x"), y: single("y"), z: single("z") };
  if (operation === "volume") return { time: single("time"), x: bounds.x, y: bounds.y, z: bounds.z };
  return {
    time: single("time"),
    x: fixedAxis === "x" ? single("x") : bounds.x,
    y: fixedAxis === "y" ? single("y") : bounds.y,
    z: fixedAxis === "z" ? single("z") : bounds.z
  };
}

function IndexInput({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (value: number) => void }) {
  return <label className="grid gap-1.5 text-sm font-medium text-slate-700">{label}
    <input type="number" min={0} max={max} step={1} value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-10 rounded-md border border-slate-300 px-3 text-slate-900" />
  </label>;
}

export function VerifiedQueryBuilder({ onBack }: { onBack: () => void }) {
  const fields = verifiedSchema.fields;
  const [variable, setVariable] = useState<FieldId>("p");
  const [operation, setOperation] = useState<Operation>("point");
  const [fixedAxis, setFixedAxis] = useState<Axis>("z");
  const [indices, setIndices] = useState<Record<Axis, number>>({ time: 0, x: 0, y: 0, z: 0 });
  const [bounds, setBounds] = useState<Ranges>({ time: [0, 4], x: [0, 8], y: [0, 8], z: [0, 8] });
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<QueryResult | null>(null);
  const requestRevision = useRef(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState("Checking local query service...");
  const field = fields[variable];
  const limits = Object.fromEntries(axes.map((axis, index) => [axis, field.shape[index]])) as Record<Axis, number>;
  const ranges = useMemo(() => makeRanges(operation, indices, bounds, fixedAxis), [operation, indices, bounds, fixedAxis]);
  const valueCount = axes.reduce((product, axis) => product * (ranges[axis][1] - ranges[axis][0]), 1);
  const bytesPerValue = Number(field.dtype.match(/\d+/)?.[0] ?? 0) / 8;
  const validRanges = axes.every((axis) => {
    const [start, stop] = ranges[axis];
    return Number.isInteger(start) && Number.isInteger(stop) && start >= 0 && stop > start && stop <= limits[axis];
  });
  const validOperation = operation === "slice"
    ? spatialAxes.filter((axis) => ranges[axis][1] - ranges[axis][0] === 1).length === 1
    : operation === "time-series" ? ranges.time[1] - ranges.time[0] >= 2 : true;
  const valid = validRanges && validOperation && valueCount <= maximumValues && ranges.time[1] - ranges.time[0] <= maximumFrames;
  const request = { variant: verifiedSchema.variantId, variable, operation, ranges };

  useEffect(() => {
    let active = true;
    fetch("/api/health").then(async (response) => {
      if (!response.ok) throw new Error();
      return response.json() as Promise<{ status: string }>;
    }).then((health) => {
      if (active) setServiceStatus(health.status === "ready" ? "Query service ready" : "Query source is not configured");
    }).catch(() => { if (active) setServiceStatus("Query service is offline"); });
    return () => { active = false; };
  }, []);

  function invalidateResult() {
    requestRevision.current += 1;
    setResult(null);
    setError("");
    setLoading(false);
  }

  function setIndex(axis: Axis, value: number) {
    setIndices((current) => ({ ...current, [axis]: value }));
    invalidateResult();
  }

  function setBound(axis: Axis, side: 0 | 1, value: number) {
    setBounds((current) => ({ ...current, [axis]: side === 0 ? [value, current[axis][1]] : [current[axis][0], value] }));
    invalidateResult();
  }

  function rangeInputs(axis: Axis) {
    return <div key={axis} className="grid grid-cols-2 gap-3">
      <IndexInput label={`${axis.toUpperCase()} start`} value={bounds[axis][0]} max={limits[axis] - 1} onChange={(value) => setBound(axis, 0, value)} />
      <IndexInput label={`${axis.toUpperCase()} stop (exclusive)`} value={bounds[axis][1]} max={limits[axis]} onChange={(value) => setBound(axis, 1, value)} />
    </div>;
  }

  async function submit() {
    if (!valid || loading) return;
    const revision = ++requestRevision.current;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/query", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) });
      const body = await response.json() as QueryResult & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Query failed.");
      if (requestRevision.current === revision) setResult(body);
    } catch (cause) {
      if (requestRevision.current === revision) setError(cause instanceof Error ? cause.message : "Unable to reach the query service.");
    } finally {
      if (requestRevision.current === revision) setLoading(false);
    }
  }

  return <section className="bg-gt-ivory py-12"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <button type="button" onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gt-navy"><ArrowLeft size={16} /> Dataset access</button>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase text-slate-500">Verified HDF5 query</p><h2 className="mt-1 text-2xl font-semibold text-gt-navy">Emulsions · Weber Number 0.5</h2><p className="mt-2 text-sm text-slate-600">Select array indices. Physical coordinates and units are not present in the file.</p></div><span role="status" className="text-sm font-semibold text-gt-navy">{serviceStatus}</span></div>
    <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-5">
        <nav aria-label="Query steps" className="flex flex-wrap gap-2">{["Field", "Operation", "Index region", "Review & run"].map((label, index) => <button key={label} type="button" disabled={index > stage} onClick={() => setStage(index)} className={`rounded-md border px-3 py-2 text-sm font-semibold ${stage === index ? "border-gt-navy bg-gt-navy text-white" : "border-slate-300 bg-white text-gt-navy disabled:opacity-45"}`}>{index + 1}. {label}</button>)}</nav>
        {stage === 0 && <div className="gt-card rounded-lg border p-5"><h3 className="text-lg font-semibold text-gt-navy">Choose a field stored in the file</h3><p className="mt-1 text-sm text-slate-600">Names are shown exactly as recorded in HDF5; scientific meanings and units are not verified.</p>
          <label className="mt-5 grid gap-2 text-sm font-medium">Variable<select value={variable} onChange={(event) => { setVariable(event.target.value as FieldId); invalidateResult(); }} className="h-10 rounded-md border border-slate-300 px-3">{Object.keys(fields).map((id) => <option key={id} value={id}>{id}</option>)}</select></label>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">HDF5 path</dt><dd>{field.path}</dd></div><div><dt className="text-slate-500">Grid location</dt><dd>{field.gridLocation}</dd></div><div><dt className="text-slate-500">Shape [time, x, y, z]</dt><dd>{field.shape.join(" × ")}</dd></div><div><dt className="text-slate-500">Type</dt><dd>{field.dtype}</dd></div></dl>
        </div>}
        {stage === 1 && <div className="gt-card rounded-lg border p-5"><h3 className="text-lg font-semibold text-gt-navy">Choose a supported operation</h3><p className="mt-1 text-sm text-slate-600">All reads return raw values on the selected field grid; no interpolation is performed.</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{operations.map((item) => <button key={item.id} type="button" onClick={() => { setOperation(item.id); invalidateResult(); }} className={`rounded-md border px-4 py-4 text-left text-sm font-semibold ${operation === item.id ? "border-gt-navy bg-gt-navy text-white" : "border-slate-300 bg-white text-gt-navy"}`}>{item.label}</button>)}</div></div>}
        {stage === 2 && <div className="gt-card rounded-lg border p-5"><h3 className="text-lg font-semibold text-gt-navy">Choose integer index bounds</h3><p className="mt-1 text-sm text-slate-600">Start is included; stop is excluded. Valid indices depend on {variable}'s grid shape.</p>
          {operation === "slice" && <label className="mt-5 grid gap-1.5 text-sm font-medium">Fixed axis<select value={fixedAxis} onChange={(event) => { setFixedAxis(event.target.value as Axis); invalidateResult(); }} className="h-10 rounded-md border border-slate-300 px-3">{spatialAxes.map((axis) => <option key={axis} value={axis}>{axis.toUpperCase()}</option>)}</select></label>}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">{operation === "time-series" ? rangeInputs("time") : <IndexInput label="Frame index" value={indices.time} max={limits.time - 1} onChange={(value) => setIndex("time", value)} />}
            {spatialAxes.map((axis) => operation === "volume" || (operation === "slice" && axis !== fixedAxis) ? rangeInputs(axis) : <IndexInput key={axis} label={`${axis.toUpperCase()} index`} value={indices[axis]} max={limits[axis] - 1} onChange={(value) => setIndex(axis, value)} />)}
          </div>
        </div>}
        {stage === 3 && <div className="gt-card rounded-lg border p-5"><h3 className="text-lg font-semibold text-gt-navy">Review and run the HDF5 slice</h3><p className="mt-2 text-sm text-slate-600">{variable} on the {field.gridLocation} grid; {operation} query returning {valueCount.toLocaleString()} raw values. Time values and simulation steps will be read from the matching array indices.</p>
          <div className="mt-4 flex items-center justify-between"><h4 className="text-sm font-semibold">Request JSON</h4><button type="button" onClick={() => void navigator.clipboard?.writeText(JSON.stringify(request, null, 2))} title="Copy query JSON" aria-label="Copy query JSON" className="rounded-md border p-2"><Clipboard size={16} /></button></div>
          <pre className="mt-2 overflow-auto rounded-md bg-gt-navy p-4 text-xs text-white">{JSON.stringify(request, null, 2)}</pre>
          <button type="button" disabled={!valid || loading} onClick={() => void submit()} className="mt-5 inline-flex items-center gap-2 rounded-md bg-gt-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-45"><Play size={16} />{loading ? "Reading slice..." : "Run query"}</button>
          {error && <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {result && <div className="mt-5"><h4 className="font-semibold text-gt-navy">Query Results</h4><p className="mt-1 text-sm text-slate-600">Shape: {result.shape.join(" × ")} · dtype: {result.dtype} · path: {result.datasetPath}</p><pre className="mt-3 max-h-96 overflow-auto rounded-md bg-slate-900 p-4 text-xs text-white">{JSON.stringify(result, null, 2)}</pre><div className="mt-5 border-t border-slate-200 pt-4"><h5 className="text-sm font-semibold text-gt-navy">Download Results</h5><p className="mt-1 text-xs text-slate-600">Export only these returned values, not the full HDF5 dataset.</p><div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={() => downloadResult(result, "csv")} className="inline-flex items-center gap-2 rounded-md border border-gt-navy px-4 py-2 text-sm font-semibold text-gt-navy"><Download size={16} /> Download CSV</button><button type="button" onClick={() => downloadResult(result, "json")} className="inline-flex items-center gap-2 rounded-md border border-gt-navy px-4 py-2 text-sm font-semibold text-gt-navy"><Download size={16} /> Download JSON</button></div></div></div>}
        </div>}
        {!valid && stage >= 2 && <p role="alert" className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{!validRanges ? "Enter integer bounds within this field's shape, with stop greater than start." : !validOperation ? "A slice needs exactly one fixed spatial axis; a time series needs at least two frames." : ranges.time[1] - ranges.time[0] > maximumFrames ? `A query may span at most ${maximumFrames} frames.` : `This request exceeds the ${maximumValues.toLocaleString()}-value limit. Reduce the ranges.`}</p>}
        <div className="flex gap-3"><button type="button" disabled={stage === 0} onClick={() => setStage(stage - 1)} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-gt-navy disabled:opacity-45">Previous</button><button type="button" disabled={stage === 3 || (stage === 2 && !valid)} onClick={() => setStage(stage + 1)} className="rounded-md bg-gt-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-45">Next</button></div>
      </div>
      <aside className="h-fit rounded-lg border border-gt-gold/40 bg-white p-5 lg:sticky lg:top-24"><div className="flex items-center gap-2"><Database size={18} className="text-gt-navy" /><h3 className="font-semibold text-gt-navy">Request estimate</h3></div><dl className="mt-5 space-y-3 text-sm"><div><dt className="text-slate-500">Values</dt><dd className="font-semibold">{valueCount.toLocaleString()} / {maximumValues.toLocaleString()}</dd></div><div><dt className="text-slate-500">Raw data size</dt><dd className="font-semibold">{(valueCount * bytesPerValue).toLocaleString()} bytes</dd></div><div><dt className="text-slate-500">Field dtype</dt><dd className="font-semibold">{field.dtype}</dd></div><div><dt className="text-slate-500">Index limits [time, x, y, z]</dt><dd className="font-semibold">{field.shape.join(" × ")}</dd></div></dl><p className="mt-4 text-xs leading-5 text-slate-500">Limits: {maximumValues.toLocaleString()} values and {maximumFrames} frames. Raw size excludes JSON overhead and HDF5 chunk decompression.</p></aside>
    </div>
  </div></section>;
}
