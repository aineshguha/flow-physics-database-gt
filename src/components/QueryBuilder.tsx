import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Database, SlidersHorizontal, Variable } from "lucide-react";
import { datasets } from "../data/datasets";
import { EstimatorResult, QueryState, QueryType } from "../types/flow";
import { Badge } from "./Badge";
import { QueryStepIndicator } from "./QueryStepIndicator";
import { RequestEstimator } from "./RequestEstimator";
import { ReviewPanel } from "./ReviewPanel";
import { VisualRegionPreview } from "./VisualRegionPreview";
import { DatasetAccessStep } from "./DatasetAccessStep";
import { flowConfigurations, getIsotropicQueryContext, type DatasetSelection, type FlowCategory } from "../config/isotropicTurbulenceConfig";

const queryTypeLabels: Record<QueryType, string> = {
  point: "Point query",
  line: "Line query",
  slice: "2D slice",
  volume: "3D volume",
  "time-series": "Time series"
};

const initialQuery: QueryState = {
  datasetId: "isotropic",
  variable: "velocity",
  queryType: "volume",
  coordinates: { x: 0.5, y: 0.5, z: 0.5 },
  axis: "Z",
  slicePosition: 0.5,
  width: 256,
  height: 256,
  bounds: { xMin: 0, xMax: 128, yMin: 0, yMax: 128, zMin: 0, zMax: 64 },
  timeStep: 12,
  timeStart: 0,
  timeEnd: 8,
  timeInterval: 1,
  samplingResolution: 8
};

const stepDescriptions = [
  "Pick the simulation archive you want to query. The dataset determines available variables, resolution, and supported access methods.",
  "Choose the physical field to request. Vector variables such as velocity are larger than scalar fields because they contain multiple components.",
  "Select the shape of the data request. Small point queries are good for inspection, while slices and volumes are better for export workflows.",
  "Define where in the flow domain the request should sample data. Keep this region tight before moving to larger cutouts.",
  "Set the time snapshot or time range. Longer windows can quickly increase output size, especially for volume and time-series queries.",
  "Review the plain-English request, generated JSON, and Python snippet before submitting or copying the query."
];

const isotropicSteps = ["Choose dataset", "Flow configuration", "Parameter", "Dataset Access", ...["Choose variable", "Choose query type", "Choose spatial region", "Choose time settings", "Review request"]];

function variableComponentCount(variable: string) {
  if (variable === "velocity" || variable === "gradient") return 3;
  return 1;
}

function isFiniteNumber(value: number) {
  return Number.isFinite(value);
}

function isPositive(value: number) {
  return isFiniteNumber(value) && value > 0;
}

// The estimator intentionally uses transparent mock formulas so a researcher can reason about tradeoffs.
function estimateRequest(query: QueryState): EstimatorResult {
  const components = variableComponentCount(query.variable);
  const timeSteps = Math.max(1, Math.floor((query.timeEnd - query.timeStart) / Math.max(1, query.timeInterval)) + 1);

  let gridPoints = 1;
  if (query.queryType === "line") gridPoints = Math.max(2, query.width);
  if (query.queryType === "slice") gridPoints = Math.max(1, query.width * query.height);
  if (query.queryType === "volume") {
    const nx = Math.max(1, Math.ceil((query.bounds.xMax - query.bounds.xMin) / Math.max(1, query.samplingResolution)));
    const ny = Math.max(1, Math.ceil((query.bounds.yMax - query.bounds.yMin) / Math.max(1, query.samplingResolution)));
    const nz = Math.max(1, Math.ceil((query.bounds.zMax - query.bounds.zMin) / Math.max(1, query.samplingResolution)));
    gridPoints = nx * ny * nz * Math.max(1, query.timeEnd - query.timeStart + 1);
  }
  if (query.queryType === "time-series") gridPoints = timeSteps;

  const outputBytes = gridPoints * components * 8;
  const complexity = outputBytes > 500_000_000 || gridPoints > 20_000_000 ? "High" : outputBytes > 20_000_000 || gridPoints > 900_000 ? "Medium" : "Low";
  const warnings = [];
  const suggestions = [];

  if (complexity === "High") {
    warnings.push("Large request may exceed browser memory or interactive timeout limits.");
    suggestions.push("Reduce time range");
    suggestions.push("Use lower sampling resolution");
  } else if (complexity === "Medium") {
    warnings.push("Request is practical, but export may be better than browser preview.");
    suggestions.push("Preview a smaller spatial subset first");
  } else {
    suggestions.push("Suitable for browser preview");
  }

  if (components > 1) suggestions.push("Request a scalar component if full vector output is not required");

  return {
    gridPoints,
    outputBytes,
    complexity,
    browserSuitability: complexity === "Low" ? "Excellent for browser preview" : complexity === "Medium" ? "Use preview with care" : "Export recommended",
    warnings,
    suggestions
  };
}

function NumberInput({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (value: number) => void; step?: number }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-gt-gold focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}

export function QueryBuilder({ selectedDatasetId, isotropicSelection, isotropicDraft, editableSelection = false }: {
  selectedDatasetId: string;
  isotropicSelection?: DatasetSelection;
  isotropicDraft?: FlowCategory;
  editableSelection?: boolean;
}) {
  const context = isotropicSelection ? getIsotropicQueryContext(isotropicSelection) : null;
  const firstStep = context ? 3 : isotropicDraft ? 2 : 0;
  const minimumStep = context && !editableSelection ? 3 : 0;
  const [activeStep, setActiveStep] = useState(firstStep);
  const [unlockedStep, setUnlockedStep] = useState(firstStep);
  const [selectedCategory, setSelectedCategory] = useState<FlowCategory | null>(isotropicSelection?.category ?? isotropicDraft ?? null);
  const [selectedValue, setSelectedValue] = useState(isotropicSelection ? String(isotropicSelection.value) : "");
  const [query, setQuery] = useState<QueryState>(() => ({ ...initialQuery, datasetId: context || isotropicDraft ? "isotropic" : selectedDatasetId, variable: context || isotropicDraft || selectedDatasetId === "isotropic" ? "" : initialQuery.variable, isotropicContext: context ?? undefined }));

  useEffect(() => {
    if (context || isotropicDraft) return;
    setQuery((current) => {
      const nextDataset = datasets.find((item) => item.id === selectedDatasetId) ?? datasets[0];
      const nextQueryType = nextDataset.queryTypes.includes(current.queryType) ? current.queryType : nextDataset.queryTypes[0];
      return { ...current, datasetId: selectedDatasetId, variable: selectedDatasetId === "isotropic" ? "" : nextDataset.variables[0], queryType: nextQueryType, isotropicContext: undefined, accessMode: undefined };
    });
    setActiveStep(0);
    setUnlockedStep(0);
  }, [selectedDatasetId, context?.configurationId, isotropicDraft]);

  const isotropicMode = query.datasetId === "isotropic";
  const standardStep = isotropicMode && activeStep > 3 ? activeStep - 3 : activeStep;
  const lastStep = isotropicMode ? 8 : 5;
  const branch = selectedCategory ? flowConfigurations[selectedCategory] : null;
  const selectedVariant = selectedCategory && branch && (branch.values as readonly string[]).includes(selectedValue)
    ? { category: selectedCategory, parameter: branch.parameter, value: selectedValue } satisfies DatasetSelection
    : null;
  const steps = isotropicMode
    ? isotropicSteps.map((label, index) => index === 2 && branch ? branch.parameterLabel : label)
    : undefined;
  const showEstimator = !isotropicMode || activeStep >= 4;
  const stepDescription = isotropicMode
    ? activeStep === 1 ? "Choose Bubbles, Droplets, or Emulsions. This determines which parameter values are available."
      : activeStep === 2 ? `Select the ${branch?.parameterLabel.toLowerCase() ?? "parameter"} that identifies the exact scientific dataset.`
        : activeStep === 3 ? "Choose between the complete original file and a filtered query. Download availability depends on the selected dataset."
          : activeStep === 8 ? "Review the request and copy its JSON. Dataset processing and Python export are not connected yet."
            : stepDescriptions[activeStep > 3 ? activeStep - 3 : activeStep]
    : stepDescriptions[activeStep];

  const dataset = useMemo(
    () => datasets.find((item) => item.id === query.datasetId) ?? datasets[0],
    [query.datasetId]
  );
  const estimator = useMemo(() => estimateRequest(query), [query]);

  function updateQuery(patch: Partial<QueryState>) {
    setQuery((current) => ({ ...current, ...patch }));
  }

  function updateCoordinates(key: keyof QueryState["coordinates"], value: number) {
    setQuery((current) => ({ ...current, coordinates: { ...current.coordinates, [key]: value } }));
  }

  function updateBounds(key: keyof QueryState["bounds"], value: number) {
    setQuery((current) => ({ ...current, bounds: { ...current.bounds, [key]: value } }));
  }

  function getStepError(step: number) {
    if (step === 0 && !query.datasetId) return "Choose a dataset before continuing.";
    if (isotropicMode && step === 1) return selectedCategory ? "" : "Choose a flow configuration before continuing.";
    if (isotropicMode && step === 2) return selectedVariant ? "" : `Choose a ${branch?.parameterLabel.toLowerCase() ?? "parameter"} before continuing.`;
    if (isotropicMode && step === 3) return query.isotropicContext ? "" : "Choose an exact dataset variant before continuing.";
    const standard = isotropicMode && step > 3 ? step - 3 : step;
    if (standard === 1 && !query.variable) return "Choose a variable before continuing.";
    if (standard === 2 && !query.queryType) return "Choose a query type before continuing.";

    if (standard === 3) {
      if (query.queryType === "slice" && (!isFiniteNumber(query.slicePosition) || !isPositive(query.width) || !isPositive(query.height))) {
        return "Enter a valid slice position, width, and height.";
      }
      if (query.queryType === "volume") {
        const { xMin, xMax, yMin, yMax, zMin, zMax } = query.bounds;
        if (![xMin, xMax, yMin, yMax, zMin, zMax].every(isFiniteNumber)) return "Enter valid numeric volume bounds.";
        if (xMax <= xMin || yMax <= yMin || zMax <= zMin) return "Each max bound must be greater than its matching min bound.";
      }
      if ((query.queryType === "point" || query.queryType === "time-series" || query.queryType === "line") && !Object.values(query.coordinates).every(isFiniteNumber)) {
        return "Enter valid x, y, and z coordinates.";
      }
      if (query.queryType === "line" && !isPositive(query.width)) return "Enter a positive number of line sample points.";
    }

    if (standard === 4) {
      if (query.queryType === "volume") {
        if (!isFiniteNumber(query.timeStart) || !isFiniteNumber(query.timeEnd)) return "Enter valid start and end time values.";
        if (query.timeEnd < query.timeStart) return "Time end must be greater than or equal to time start.";
        if (!isPositive(query.samplingResolution)) return "Sampling resolution must be positive.";
      } else if (query.queryType === "time-series") {
        if (!isFiniteNumber(query.timeStart) || !isFiniteNumber(query.timeEnd)) return "Enter valid start and end time values.";
        if (query.timeEnd < query.timeStart) return "End time must be greater than or equal to start time.";
        if (!isPositive(query.timeInterval)) return "Time interval must be positive.";
      } else if (!isFiniteNumber(query.timeStep)) {
        return "Enter a valid time step.";
      }
    }

    return "";
  }

  const stepError = getStepError(activeStep);
  const canContinue = stepError.length === 0;

  function goToNextStep() {
    if (!canContinue) return;
    if (isotropicMode && activeStep === 1 && isotropicSelection && selectedCategory) {
      window.location.hash = `/query/isotropic/${selectedCategory}/edit`;
      return;
    }
    if (isotropicMode && activeStep === 2 && selectedVariant) {
      const nextPath = `/query/isotropic/${selectedVariant.category}/${selectedVariant.value}/edit`;
      if (window.location.hash !== `#${nextPath}`) {
        window.location.hash = nextPath;
        return;
      }
      updateQuery({ isotropicContext: getIsotropicQueryContext(selectedVariant) ?? undefined, accessMode: undefined });
    }
    const next = Math.min(lastStep, activeStep + 1);
    setUnlockedStep((current) => Math.max(current, next));
    setActiveStep(next);
  }

  function renderSpatialFields() {
    if (query.queryType === "slice") {
      return (
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Axis</span>
            <select value={query.axis} onChange={(event) => updateQuery({ axis: event.target.value as QueryState["axis"] })} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
              <option>X</option>
              <option>Y</option>
              <option>Z</option>
            </select>
          </label>
          <NumberInput label="Slice position" value={query.slicePosition} onChange={(value) => updateQuery({ slicePosition: value })} step={0.1} />
          <NumberInput label="Width" value={query.width} onChange={(value) => updateQuery({ width: value })} />
          <NumberInput label="Height" value={query.height} onChange={(value) => updateQuery({ height: value })} />
        </div>
      );
    }

    if (query.queryType === "volume") {
      return (
        <div className="grid gap-4 md:grid-cols-3">
          <NumberInput label="X min" value={query.bounds.xMin} onChange={(value) => updateBounds("xMin", value)} />
          <NumberInput label="X max" value={query.bounds.xMax} onChange={(value) => updateBounds("xMax", value)} />
          <NumberInput label="Y min" value={query.bounds.yMin} onChange={(value) => updateBounds("yMin", value)} />
          <NumberInput label="Y max" value={query.bounds.yMax} onChange={(value) => updateBounds("yMax", value)} />
          <NumberInput label="Z min" value={query.bounds.zMin} onChange={(value) => updateBounds("zMin", value)} />
          <NumberInput label="Z max" value={query.bounds.zMax} onChange={(value) => updateBounds("zMax", value)} />
        </div>
      );
    }

    if (query.queryType === "line") {
      return (
        <div className="grid gap-4 md:grid-cols-4">
          <NumberInput label="Start x" value={query.coordinates.x} onChange={(value) => updateCoordinates("x", value)} step={0.1} />
          <NumberInput label="Start y" value={query.coordinates.y} onChange={(value) => updateCoordinates("y", value)} step={0.1} />
          <NumberInput label="Start z" value={query.coordinates.z} onChange={(value) => updateCoordinates("z", value)} step={0.1} />
          <NumberInput label="Sample points" value={query.width} onChange={(value) => updateQuery({ width: value })} />
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-3">
        <NumberInput label="X coordinate" value={query.coordinates.x} onChange={(value) => updateCoordinates("x", value)} step={0.1} />
        <NumberInput label="Y coordinate" value={query.coordinates.y} onChange={(value) => updateCoordinates("y", value)} step={0.1} />
        <NumberInput label="Z coordinate" value={query.coordinates.z} onChange={(value) => updateCoordinates("z", value)} step={0.1} />
      </div>
    );
  }

  function renderTimeFields() {
    if (query.queryType === "volume") {
      return (
        <div className="grid gap-4 md:grid-cols-3">
          <NumberInput label="Time start" value={query.timeStart} onChange={(value) => updateQuery({ timeStart: value })} />
          <NumberInput label="Time end" value={query.timeEnd} onChange={(value) => updateQuery({ timeEnd: value })} />
          <NumberInput label="Sampling resolution" value={query.samplingResolution} onChange={(value) => updateQuery({ samplingResolution: value })} />
        </div>
      );
    }

    if (query.queryType === "time-series") {
      return (
        <div className="grid gap-4 md:grid-cols-3">
          <NumberInput label="Start time" value={query.timeStart} onChange={(value) => updateQuery({ timeStart: value })} />
          <NumberInput label="End time" value={query.timeEnd} onChange={(value) => updateQuery({ timeEnd: value })} />
          <NumberInput label="Time interval" value={query.timeInterval} onChange={(value) => updateQuery({ timeInterval: value })} />
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-3">
        <NumberInput label="Time step" value={query.timeStep} onChange={(value) => updateQuery({ timeStep: value })} />
      </div>
    );
  }

  function renderStepContent() {
    if (activeStep === 0) {
      return (
        <div className="gt-card rounded-lg border p-5">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Database className="h-4 w-4 text-gt-navy" aria-hidden="true" />
            Choose dataset
          </div>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Dataset</span>
            <select
              value={query.datasetId}
              onChange={(event) => {
                const nextDataset = datasets.find((item) => item.id === event.target.value) ?? datasets[0];
                const nextQueryType = nextDataset.queryTypes.includes(query.queryType) ? query.queryType : nextDataset.queryTypes[0];
                setSelectedCategory(null);
                setSelectedValue("");
                setUnlockedStep(0);
                updateQuery({ datasetId: nextDataset.id, variable: nextDataset.id === "isotropic" ? "" : nextDataset.variables[0], queryType: nextQueryType, isotropicContext: undefined, accessMode: undefined });
              }}
              className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            >
              {datasets.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
        </div>
      );
    }

    if (isotropicMode && activeStep === 1) {
      return <fieldset className="gt-card rounded-lg border p-5"><legend className="px-1 text-lg font-semibold text-gt-navy">Select Flow Configuration</legend>
        <p className="mb-5 text-sm text-slate-600">Choose the physical configuration represented by the Isotropic Turbulence dataset.</p>
        <div className="grid gap-3 sm:grid-cols-3">{(Object.entries(flowConfigurations) as [FlowCategory, typeof flowConfigurations[FlowCategory]][]).map(([category, item]) =>
          <label key={category} className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-5 font-semibold ${selectedCategory === category ? "border-gt-navy bg-gt-navy text-white" : "border-slate-200 bg-white text-gt-navy"}`}>
            <input type="radio" name="flow-configuration" checked={selectedCategory === category} onChange={() => {
              setSelectedCategory(category);
              setSelectedValue("");
              setUnlockedStep(1);
              updateQuery({ isotropicContext: undefined, accessMode: undefined, variable: "" });
            }} className="accent-gt-gold" />{item.label}
          </label>)}</div>
      </fieldset>;
    }

    if (isotropicMode && activeStep === 2) {
      return <fieldset className="gt-card rounded-lg border p-5"><legend className="px-1 text-lg font-semibold text-gt-navy">Select {branch?.parameterLabel ?? "Parameter"}</legend>
        <p className="mb-5 text-sm text-slate-600">This value identifies the exact {branch?.label.toLowerCase() ?? "flow"} dataset. Only one value can be used per request.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{branch?.values.map(value => <label key={value} className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 px-3 py-5 font-semibold ${selectedValue === value ? "border-gt-navy bg-gt-navy text-white" : "border-slate-200 bg-white text-gt-navy"}`}>
          <input type="radio" name="flow-parameter" checked={selectedValue === value} onChange={() => { setSelectedValue(value); setUnlockedStep(2); updateQuery({ isotropicContext: undefined, accessMode: undefined }); }} className="accent-gt-gold" />{value}
        </label>)}</div>
      </fieldset>;
    }

    if (isotropicMode && activeStep === 3 && selectedVariant) {
      return <DatasetAccessStep selection={selectedVariant} accessMode={query.accessMode} onSelectMode={(accessMode) => { updateQuery({ accessMode }); if (accessMode === "full-download") setUnlockedStep(3); }} onContinue={() => {
        updateQuery({ accessMode: "query" });
        setUnlockedStep((current) => Math.max(current, 4));
        setActiveStep(4);
      }} />;
    }

    if (standardStep === 1) {
      return (
        <div className="gt-card rounded-lg border p-5">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Variable className="h-4 w-4 text-gt-navy" aria-hidden="true" />
            Choose variable
          </div>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Variable</span>
            <select value={query.variable} onChange={(event) => updateQuery({ variable: event.target.value })} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
              {isotropicMode && <option value="">Choose a prototype variable</option>}
              {dataset.variables.map((variable) => (
                <option key={variable} value={variable}>{variable}</option>
              ))}
            </select>
          </label>
          {isotropicMode && <p className="mt-3 text-sm text-slate-600">These variable choices are a prototype. Available fields will be confirmed as dataset processing is connected.</p>}
        </div>
      );
    }

    if (standardStep === 2) {
      return (
        <div className="gt-card rounded-lg border p-5">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Variable className="h-4 w-4 text-gt-navy" aria-hidden="true" />
            Query type
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(queryTypeLabels).map(([value, label]) => {
              const supported = isotropicMode || dataset.queryTypes.includes(value as QueryType);
              return (
                <button
                  key={value}
                  type="button"
                  disabled={!supported}
                  onClick={() => updateQuery({ queryType: value as QueryType })}
                  className={`min-h-16 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    query.queryType === value
                      ? "border-gt-navy bg-gt-navy text-white"
                      : supported
                        ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (standardStep === 3) {
      return (
        <div className="grid gap-6">
          <div className="gt-card rounded-lg border p-5">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <SlidersHorizontal className="h-4 w-4 text-gt-navy" aria-hidden="true" />
              Choose spatial region
            </div>
            {renderSpatialFields()}
          </div>
          <VisualRegionPreview
            query={query}
            onTimeStepChange={(value) => updateQuery({ timeStep: value })}
            onTimeWindowChange={(patch) => updateQuery(patch)}
          />
        </div>
      );
    }

    if (standardStep === 4) {
      return (
        <div className="grid gap-6">
          <div className="gt-card rounded-lg border p-5">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Clock className="h-4 w-4 text-gt-navy" aria-hidden="true" />
              Choose time settings
            </div>
            {renderTimeFields()}
          </div>
          <VisualRegionPreview
            query={query}
            onTimeStepChange={(value) => updateQuery({ timeStep: value })}
            onTimeWindowChange={(patch) => updateQuery(patch)}
          />
        </div>
      );
    }

    return <ReviewPanel query={query} dataset={dataset} estimator={estimator} />;
  }

  return (
    <section id="query-builder" className="bg-gt-ivory py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
              Guided query builder
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Build a precise request without guessing the cost.</h2>
          </div>
          {showEstimator && <Badge tone={estimator.complexity === "High" ? "red" : estimator.complexity === "Medium" ? "yellow" : "green"}>
            {estimator.complexity} complexity
          </Badge>}
        </div>

        {query.isotropicContext && activeStep >= 4 && <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gt-gold/40 bg-white p-5">
          <div><p className="text-xs font-semibold uppercase text-slate-500">Selected Dataset</p><h3 className="mt-1 text-lg font-semibold text-gt-navy">Isotropic Turbulence</h3>
            <p className="mt-1 text-sm text-slate-700">Configuration: {flowConfigurations[query.isotropicContext.configuration].label} · {query.isotropicContext.parameter.type === "density-ratio" ? "Density Ratio" : "Weber Number"}: {query.isotropicContext.parameter.value} · File Format: {query.isotropicContext.fileFormat ?? "Not yet confirmed"}</p></div>
          <a href={`#/datasets/isotropic/${query.isotropicContext.configuration}`} className="text-sm font-semibold text-gt-navy underline underline-offset-4">Change Dataset</a>
        </div>}

        <QueryStepIndicator steps={steps} activeStep={activeStep} unlockedStep={unlockedStep} minimumStep={minimumStep} onStepChange={setActiveStep} />

        <div className={`mt-8 grid gap-6 ${showEstimator ? "lg:grid-cols-[minmax(0,1fr)_360px]" : ""}`}>
          <div className="grid gap-6">
            <div className="rounded-lg border border-gt-gold/40 bg-cyan-50 p-4 shadow-sm">
              <p className="text-sm font-semibold text-gt-navy">Step {activeStep + 1}: {stepDescription}</p>
            </div>

            {renderStepContent()}

            {!(isotropicMode && activeStep === 3 && minimumStep === 3) && <div className="gt-card rounded-lg border p-5">
              {stepError && (
                <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                  {stepError}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep((step) => Math.max(minimumStep, step - 1))}
                  disabled={activeStep === minimumStep}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
                </button>
                {isotropicMode && activeStep === 3 ? null : activeStep < lastStep ? (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    disabled={!canContinue}
                    className="inline-flex items-center gap-2 rounded-md bg-gt-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#001B33] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : (
                  <span className="inline-flex items-center rounded-md border border-gt-gold/40 bg-cyan-50 px-4 py-2 text-sm font-semibold text-gt-navy">
                    Request ready for review
                  </span>
                )}
              </div>
            </div>}
          </div>

          {showEstimator && <RequestEstimator result={estimator} />}
        </div>
      </div>
    </section>
  );
}
