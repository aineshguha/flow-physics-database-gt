import { QueryState } from "../types/flow";

const DOMAIN_MIN = 0;
const DOMAIN_MAX = 256;
const DOMAIN_SPAN = DOMAIN_MAX - DOMAIN_MIN;

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function toPercent(value: number) {
  return clamp(((value - DOMAIN_MIN) / DOMAIN_SPAN) * 100);
}

function sizePercent(span: number, minimum = 3) {
  return clamp((Math.abs(span) / DOMAIN_SPAN) * 100, minimum, 92);
}

export function VisualRegionPreview({
  query,
  onTimeStepChange,
  onTimeWindowChange
}: {
  query: QueryState;
  onTimeStepChange: (value: number) => void;
  onTimeWindowChange: (patch: Partial<Pick<QueryState, "timeStart" | "timeEnd">>) => void;
}) {
  const isRangeQuery = query.queryType === "volume" || query.queryType === "time-series";
  const domainEnd = Math.max(100, query.timeEnd, query.timeStart + 1, query.timeStep);
  const sliderValue = isRangeQuery ? query.timeEnd : query.timeStep;

  const pointLeft = toPercent(query.coordinates.x);
  const pointTop = 100 - toPercent(query.coordinates.y);
  const xMinPercent = toPercent(Math.min(query.bounds.xMin, query.bounds.xMax));
  const yMaxPercent = 100 - toPercent(Math.max(query.bounds.yMin, query.bounds.yMax));
  const xWidthPercent = sizePercent(query.bounds.xMax - query.bounds.xMin);
  const yHeightPercent = sizePercent(query.bounds.yMax - query.bounds.yMin);
  const sliceWidthPercent = sizePercent(query.width, 8);
  const sliceHeightPercent = sizePercent(query.height, 8);
  const sliceLeft = clamp(toPercent(query.slicePosition) - sliceWidthPercent / 2, 2, 98 - sliceWidthPercent);
  const sliceTop = clamp(50 - sliceHeightPercent / 2, 2, 98 - sliceHeightPercent);
  const lineWidthPercent = sizePercent(query.width, 10);
  const lineLeft = clamp(pointLeft, 2, 98 - lineWidthPercent);

  const regionStyle = {
    point: {
      left: `${pointLeft}%`,
      top: `${pointTop}%`,
      transform: "translate(-50%, -50%)"
    },
    line: {
      left: `${lineLeft}%`,
      top: `${pointTop}%`,
      width: `${lineWidthPercent}%`,
      transform: "translateY(-50%)"
    },
    slice: {
      left: `${sliceLeft}%`,
      top: `${sliceTop}%`,
      width: `${sliceWidthPercent}%`,
      height: `${sliceHeightPercent}%`
    },
    volume: {
      left: `${xMinPercent}%`,
      top: `${yMaxPercent}%`,
      width: `${xWidthPercent}%`,
      height: `${yHeightPercent}%`
    },
    "time-series": {
      left: `${pointLeft}%`,
      top: `${pointTop}%`,
      transform: "translate(-50%, -50%)"
    }
  }[query.queryType];

  const regionClass = {
    point: "h-5 w-5 rounded-full border-4 border-gt-navy bg-white shadow-lg",
    line: "h-2 rounded-full bg-gt-gold shadow-lg",
    slice: "border-2 border-gt-navy bg-cyan-200/55 shadow-lg",
    volume: "border-2 border-gt-navy bg-cyan-200/50 shadow-lg",
    "time-series": "h-7 w-7 rounded-full border-4 border-gt-gold bg-white shadow-lg"
  }[query.queryType];

  return (
    <div className="gt-card rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800">Visual region preview</h4>
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Domain map</span>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-300 bg-[linear-gradient(90deg,rgba(14,116,144,0.12)_1px,transparent_1px),linear-gradient(0deg,rgba(14,116,144,0.12)_1px,transparent_1px)] bg-[size:28px_28px]">
        <div className="absolute inset-6 border-2 border-slate-500/50" />
        <div className={`absolute ${regionClass}`} style={regionStyle} />
        <span className="absolute bottom-3 right-4 text-xs font-semibold text-slate-600">X</span>
        <span className="absolute left-3 top-4 text-xs font-semibold text-slate-600">Y</span>
        <span className="absolute right-8 top-8 text-xs font-semibold text-slate-600">Z</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
        <span>
          X preview: <span className="font-semibold text-slate-700">{query.queryType === "volume" ? `${query.bounds.xMin} to ${query.bounds.xMax}` : query.queryType === "slice" ? query.slicePosition : query.coordinates.x}</span>
        </span>
        <span>
          Y preview: <span className="font-semibold text-slate-700">{query.queryType === "volume" ? `${query.bounds.yMin} to ${query.bounds.yMax}` : query.coordinates.y}</span>
        </span>
      </div>
      <div className="mt-4 rounded-md border border-gt-gold/30 bg-gt-ivory p-3">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>{isRangeQuery ? `start t = ${query.timeStart}` : "time step"}</span>
          <span className="font-semibold text-gt-navy">{isRangeQuery ? `end t = ${query.timeEnd}` : `t = ${query.timeStep}`}</span>
        </div>
        <input
          aria-label={isRangeQuery ? "Preview time window end" : "Preview time step"}
          type="range"
          min={0}
          max={domainEnd}
          value={Math.min(domainEnd, Math.max(0, sliderValue))}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (isRangeQuery) {
              onTimeWindowChange({ timeEnd: Math.max(query.timeStart, value) });
            } else {
              onTimeStepChange(value);
            }
          }}
          className="w-full accent-gt-gold"
        />
        {isRangeQuery && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Start
              <input
                type="number"
                value={query.timeStart}
                onChange={(event) => onTimeWindowChange({ timeStart: Number(event.target.value) })}
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm font-normal tracking-normal text-slate-900"
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              End
              <input
                type="number"
                value={query.timeEnd}
                onChange={(event) => onTimeWindowChange({ timeEnd: Number(event.target.value) })}
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm font-normal tracking-normal text-slate-900"
              />
            </label>
          </div>
        )}
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {isRangeQuery
            ? "Adjusts the previewed time window end and updates the request estimate."
            : "Adjusts the request time step and updates the previewed query."}
        </p>
      </div>
    </div>
  );
}
