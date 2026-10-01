export interface DatasetConnection {
  provider: string;
  repositoryId: string | null;
  filename: string | null;
  revision: string | null;
  access: "public" | "private" | "gated" | null;
}

export interface DatasetConfiguration {
  name: string | null;
  description: string | null;
  fileSize: number | null;
  fileFormat: string | null;
  variables: string[];
  sampleCount: number | null;
  version: string | null;
  lastUpdated: string | null;
  dataSource: string | null;
  connection: DatasetConnection;
}

export type DatasetResult =
  // downloadUrl must resolve to the complete, unmodified source file.
  | { status: "DatasetAvailable"; downloadUrl: string; pythonCode?: string }
  | { status: "DatasetNotConfigured" | "DatasetUnavailable" | "ProviderUnreachable" | "AuthenticationRequired" | "DatasetFileNotFound" };

export type DatasetState = DatasetResult | { status: "Loading" };

export interface DatasetProvider {
  resolve(configuration: DatasetConfiguration): Promise<DatasetResult>;
}
