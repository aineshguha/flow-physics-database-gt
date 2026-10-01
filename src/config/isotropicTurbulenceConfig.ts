import type { DatasetConfiguration } from "../services/datasetProvider";

const ISOTROPIC_FILE_FORMAT = "HDF4" as const;

export const flowConfigurations = {
  bubbles: { label: "Bubbles", parameter: "densityRatio", parameterLabel: "Density Ratio", values: ["1000", "100", "10"], description: "Explore bubble configurations by density ratio." },
  droplets: { label: "Droplets", parameter: "densityRatio", parameterLabel: "Density Ratio", values: ["0.001", "0.01", "0.1"], description: "Explore droplet configurations by density ratio." },
  emulsions: { label: "Emulsions", parameter: "weberNumber", parameterLabel: "Weber Number", values: ["0.5", "1", "1.25", "1.5", "1.75", "2"], description: "Explore emulsion configurations by Weber number." }
} as const;

export type FlowCategory = keyof typeof flowConfigurations;
export interface DatasetSelection {
  category: FlowCategory;
  parameter: "densityRatio" | "weberNumber";
  value: string | number;
}

export interface IsotropicQueryContext {
  family: "isotropic-turbulence";
  configurationId: string;
  configuration: FlowCategory;
  parameter: { type: "density-ratio" | "weber-number"; value: number };
  fileFormat: "HDF4";
}

function disconnectedDataset(): DatasetConfiguration {
  return {
    name: null, description: null, fileSize: null, fileFormat: ISOTROPIC_FILE_FORMAT,
    variables: [], sampleCount: null, version: null, lastUpdated: null, dataSource: null,
    connection: { provider: "huggingFace", repositoryId: null, filename: null, revision: null, access: null }
  };
}

// Option lists live only in flowConfigurations; each leaf has independent future metadata.
export const isotropicTurbulenceConfig: Record<FlowCategory, Record<string, Record<string, DatasetConfiguration>>> =
  Object.fromEntries(Object.entries(flowConfigurations).map(([category, branch]) => [
    category,
    { [branch.parameter]: Object.fromEntries(branch.values.map(value => [value, disconnectedDataset()])) }
  ])) as Record<FlowCategory, Record<string, Record<string, DatasetConfiguration>>>;

export function isFlowCategory(value: string): value is FlowCategory {
  return Object.prototype.hasOwnProperty.call(flowConfigurations, value);
}

export function getDatasetConfiguration(selection: DatasetSelection): DatasetConfiguration | null {
  if (!isFlowCategory(selection.category)) return null;
  const branch = flowConfigurations[selection.category];
  if (selection.parameter !== branch.parameter || !(branch.values as readonly string[]).includes(String(selection.value))) return null;
  return isotropicTurbulenceConfig[selection.category][selection.parameter][String(selection.value)];
}

export function getIsotropicQueryContext(selection: DatasetSelection): IsotropicQueryContext | null {
  if (!getDatasetConfiguration(selection)) return null;
  return {
    family: "isotropic-turbulence",
    configurationId: `isotropic-${selection.category}-${selection.parameter === "densityRatio" ? "dr" : "we"}-${selection.value}`,
    configuration: selection.category,
    parameter: { type: selection.parameter === "densityRatio" ? "density-ratio" : "weber-number", value: Number(selection.value) },
    fileFormat: ISOTROPIC_FILE_FORMAT
  };
}

export function getIsotropicSelectionFromQueryPath(path: string): DatasetSelection | null {
  const match = /^\/query\/isotropic\/([^/]+)\/([^/]+)(?:\/edit)?$/.exec(path);
  if (!match || !isFlowCategory(match[1])) return null;
  const branch = flowConfigurations[match[1]];
  const selection: DatasetSelection = { category: match[1], parameter: branch.parameter, value: match[2] };
  return getDatasetConfiguration(selection) ? selection : null;
}

export function getIsotropicDraftFromQueryPath(path: string): FlowCategory | null {
  const match = /^\/query\/isotropic\/([^/]+)\/edit$/.exec(path);
  return match && isFlowCategory(match[1]) ? match[1] : null;
}
