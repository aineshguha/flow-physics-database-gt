import type { DatasetProvider } from "./datasetProvider";

export const huggingFaceDatasetProvider: DatasetProvider = {
  async resolve({ connection }) {
    if (!connection.repositoryId || !connection.repositoryType || !connection.filePath || !connection.filename || !connection.revision || !connection.access) {
      return { status: "DatasetNotConfigured" };
    }
    // Private/gated access must later be resolved through secure server-side auth.
    // Never add access tokens to this frontend configuration.
    if (connection.access !== "public") return { status: "AuthenticationRequired" };
    if (connection.repositoryType !== "dataset" || connection.filePath.split("/").pop() !== connection.filename) {
      return { status: "DatasetUnavailable" };
    }
    const encodePath = (value: string) => value.split("/").map(encodeURIComponent).join("/");
    const downloadUrl = new URL(`https://huggingface.co/datasets/${encodePath(connection.repositoryId)}/resolve/${encodeURIComponent(connection.revision)}/${encodePath(connection.filePath)}`);
    downloadUrl.searchParams.set("download", "true");
    // The browser follows this link directly; the frontend never fetches the file.
    return { status: "DatasetAvailable", downloadUrl: downloadUrl.toString() };
  }
};
