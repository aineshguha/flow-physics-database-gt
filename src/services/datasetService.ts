import { getDatasetConfiguration, type DatasetSelection } from "../config/isotropicTurbulenceConfig";
import type { DatasetProvider, DatasetResult } from "./datasetProvider";
import { huggingFaceDatasetProvider } from "./huggingFaceDatasetProvider";

// Add another storage provider here without changing the selection UI.
const providers: Record<string, DatasetProvider> = { huggingFace: huggingFaceDatasetProvider };

export async function getDataset(selection: DatasetSelection): Promise<DatasetResult> {
  const configuration = getDatasetConfiguration(selection);
  if (!configuration) return { status: "DatasetUnavailable" };
  const provider = providers[configuration.connection.provider];
  if (!provider) return { status: "DatasetUnavailable" };
  try {
    return await provider.resolve(configuration);
  } catch {
    return { status: "ProviderUnreachable" };
  }
}
