import type { IsotropicQueryContext } from "../config/isotropicTurbulenceConfig";

export type QueryType = "point" | "line" | "slice" | "volume" | "time-series";

export type Difficulty = "Low" | "Medium" | "High";

export interface Dataset {
  id: string;
  name: string;
  flowType: string;
  resolution: string;
  spatialResolution: string;
  timeResolution: string;
  variables: string[];
  timeRange: string;
  queryTypes: QueryType[];
  supportedQueryLabels: string[];
  tags: string[];
  bestUseCase: string;
  difficulty: Difficulty;
  summary: string;
}

export interface QueryState {
  datasetId: string;
  isotropicContext?: IsotropicQueryContext;
  accessMode?: "full-download" | "query";
  variable: string;
  queryType: QueryType;
  coordinates: {
    x: number;
    y: number;
    z: number;
  };
  axis: "X" | "Y" | "Z";
  slicePosition: number;
  width: number;
  height: number;
  bounds: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    zMin: number;
    zMax: number;
  };
  timeStep: number;
  timeStart: number;
  timeEnd: number;
  timeInterval: number;
  samplingResolution: number;
}

export interface EstimatorResult {
  gridPoints: number;
  outputBytes: number;
  complexity: Difficulty;
  browserSuitability: string;
  warnings: string[];
  suggestions: string[];
}
