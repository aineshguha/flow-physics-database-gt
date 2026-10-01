import type { EstimatorResult, QueryState } from "../types/flow";

export function buildRequestPayload(query: QueryState, estimator: EstimatorResult) {
  const dataset = query.isotropicContext ?? query.datasetId;
  if (query.accessMode === "full-download") {
    return { dataset, accessMode: "full-download" as const };
  }

  return {
    dataset,
    accessMode: "query" as const,
    variable: query.variable,
    queryType: query.queryType,
    coordinates: query.coordinates,
    slice: { axis: query.axis, position: query.slicePosition, width: query.width, height: query.height },
    bounds: query.bounds,
    time: { step: query.timeStep, start: query.timeStart, end: query.timeEnd, interval: query.timeInterval },
    samplingResolution: query.samplingResolution,
    estimate: { gridPoints: estimator.gridPoints, outputBytes: estimator.outputBytes, complexity: estimator.complexity }
  };
}
