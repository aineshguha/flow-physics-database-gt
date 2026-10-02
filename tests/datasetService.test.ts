import assert from "node:assert/strict";
import { test } from "node:test";
import { flowConfigurations, getDatasetConfiguration, getIsotropicDraftFromQueryPath, getIsotropicQueryContext, getIsotropicSelectionFromQueryPath, type FlowCategory } from "../src/config/isotropicTurbulenceConfig";
import { buildRequestPayload } from "../src/config/queryRequest";
import type { EstimatorResult, QueryState } from "../src/types/flow";
import { getDataset } from "../src/services/datasetService";
import { huggingFaceDatasetProvider } from "../src/services/huggingFaceDatasetProvider";
import "./queryBuilder.test";

test("all twelve selections resolve independently without network requests", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("Unexpected network request"); };
  try {
    const configurations = new Set();
    for (const category of Object.keys(flowConfigurations) as FlowCategory[]) {
      const branch = flowConfigurations[category];
      for (const value of branch.values) {
        const selection = { category, parameter: branch.parameter, value };
        const configuration = getDatasetConfiguration(selection);
        assert.ok(configuration);
        configurations.add(configuration);
        assert.equal(configuration.sampleCount, null);
        const result = await getDataset(selection);
        if (category === "emulsions" && value === "0.5") {
          assert.equal(configuration.fileFormat, "HDF5");
          assert.equal(configuration.connection.repositoryId, "Onirban1234/MFlowDB");
          assert.equal(configuration.connection.repositoryType, "dataset");
          assert.equal(configuration.connection.revision, "main");
          assert.equal(configuration.connection.filePath, "HIT/Low_We/emulsions/We_0_5/We_0_5.hdf5");
          assert.equal(configuration.connection.filename, "We_0_5.hdf5");
          assert.equal(configuration.connection.access, "public");
          assert.deepEqual(result, { status: "DatasetAvailable", downloadUrl: "https://huggingface.co/datasets/Onirban1234/MFlowDB/resolve/main/HIT/Low_We/emulsions/We_0_5/We_0_5.hdf5?download=true" });
        } else {
          assert.equal(configuration.fileFormat, null);
          assert.equal(configuration.connection.repositoryId, null);
          assert.equal(configuration.connection.filename, null);
          assert.deepEqual(result, { status: "DatasetNotConfigured" });
        }
      }
    }
    assert.equal(configurations.size, 12);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("invalid selections cannot fall back to a different dataset", async () => {
  assert.equal(getDatasetConfiguration({ category: "bubbles", parameter: "weberNumber", value: 0.001 }), null);
  assert.equal(getDatasetConfiguration({ category: "droplets", parameter: "densityRatio", value: 0.001 }), null);
  assert.deepEqual(await getDataset({ category: "bubbles", parameter: "densityRatio", value: 19 }), { status: "DatasetUnavailable" });
  assert.ok(getDatasetConfiguration({ category: "emulsions", parameter: "weberNumber", value: 2 }));
  assert.ok(getDatasetConfiguration({ category: "droplets", parameter: "densityRatio", value: 1000 }));
});

test("option lists and URL context preserve every supported parameter", () => {
  assert.deepEqual(flowConfigurations.bubbles.values, ["0.001", "0.01", "0.1"]);
  assert.deepEqual(flowConfigurations.droplets.values, ["10", "100", "1000"]);
  assert.deepEqual(flowConfigurations.emulsions.values, ["0.5", "1", "1.25", "1.5", "1.75", "2"]);
  for (const category of Object.keys(flowConfigurations) as FlowCategory[]) {
    const branch = flowConfigurations[category];
    for (const value of branch.values) {
      const path = `/query/isotropic/${category}/${value}`;
      const selection = getIsotropicSelectionFromQueryPath(path);
      assert.ok(selection);
      assert.deepEqual(selection, { category, parameter: branch.parameter, value });
      const context = getIsotropicQueryContext(selection);
      assert.ok(context);
      assert.equal(context.fileFormat, category === "emulsions" && value === "0.5" ? "HDF5" : null);
      assert.equal(context.configuration, category);
      assert.equal(context.parameter.value, Number(value));
    }
  }
  assert.equal(getIsotropicSelectionFromQueryPath("/query/isotropic/bubbles/19"), null);
  assert.equal(getIsotropicSelectionFromQueryPath("/query/isotropic/emulsions/999"), null);
  assert.deepEqual(getIsotropicSelectionFromQueryPath("/query/isotropic/droplets/10/edit"), { category: "droplets", parameter: "densityRatio", value: "10" });
  assert.equal(getIsotropicSelectionFromQueryPath("/query/isotropic/bubbles/1000"), null);
  assert.equal(getIsotropicSelectionFromQueryPath("/query/isotropic/droplets/0.01"), null);
  assert.equal(getIsotropicDraftFromQueryPath("/query/isotropic/emulsions/edit"), "emulsions");
  assert.equal(getIsotropicDraftFromQueryPath("/query/isotropic/bubbles/19/edit"), null);
});

test("complete-file payload cannot inherit query filters", () => {
  const context = getIsotropicQueryContext({ category: "bubbles", parameter: "densityRatio", value: 0.01 });
  assert.ok(context);
  const query = {
    datasetId: "isotropic", isotropicContext: context, accessMode: "full-download",
    variable: "velocity", queryType: "volume", coordinates: { x: 1, y: 2, z: 3 },
    axis: "Z", slicePosition: 0, width: 10, height: 10,
    bounds: { xMin: 0, xMax: 10, yMin: 0, yMax: 10, zMin: 0, zMax: 10 },
    timeStep: 0, timeStart: 0, timeEnd: 10, timeInterval: 1, samplingResolution: 1
  } satisfies QueryState;
  const estimator: EstimatorResult = { gridPoints: 1000, outputBytes: 8000, complexity: "Low", browserSuitability: "Low", warnings: [], suggestions: [] };
  assert.deepEqual(buildRequestPayload(query, estimator), { dataset: context, accessMode: "full-download" });
  const filtered = buildRequestPayload({ ...query, accessMode: "query" }, estimator);
  assert.equal(filtered.accessMode, "query");
  assert.ok("variable" in filtered);
  assert.ok("bounds" in filtered);
});

test("provider errors become a controlled UI state", async () => {
  const resolve = huggingFaceDatasetProvider.resolve;
  huggingFaceDatasetProvider.resolve = async () => { throw new Error("Offline"); };
  try {
    assert.deepEqual(await getDataset({ category: "bubbles", parameter: "densityRatio", value: 0.001 }), { status: "ProviderUnreachable" });
  } finally {
    huggingFaceDatasetProvider.resolve = resolve;
  }
});
