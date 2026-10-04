import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryBuilder } from "../src/components/QueryBuilder";
import { DatasetAccessStep } from "../src/components/DatasetAccessStep";
import { VerifiedQueryBuilder } from "../src/components/VerifiedQueryBuilder";

test("direct Isotropic entry begins at Dataset before configuration", () => {
  const html = renderToStaticMarkup(createElement(QueryBuilder, { selectedDatasetId: "isotropic" }));
  assert.match(html, /Choose dataset/);
  assert.doesNotMatch(html, /Select Flow Configuration/);
  assert.doesNotMatch(html, /Choose variable before continuing/);
});

test("dataset-browser entry opens at access choice with complete download disabled", () => {
  const html = renderToStaticMarkup(createElement(QueryBuilder, {
    selectedDatasetId: "isotropic",
    isotropicSelection: { category: "droplets", parameter: "densityRatio", value: "10" }
  }));
  assert.match(html, /Dataset Access/);
  assert.match(html, /Droplets/);
  assert.match(html, /Density Ratio/);
  assert.match(html, /Not yet confirmed/);
  assert.match(html, /disabled=""[^>]*>.*Download Full Dataset/);
  assert.match(html, /Continue with Query/);
  assert.doesNotMatch(html, /Choose variable before continuing/);
});

test("Emulsions access choice uses the selected Weber number", () => {
  const html = renderToStaticMarkup(createElement(DatasetAccessStep, {
    selection: { category: "emulsions", parameter: "weberNumber", value: "1.75" },
    onSelectMode: () => {}, onContinue: () => {}
  }));
  assert.match(html, /Weber Number/);
  assert.match(html, /1\.75/);
  assert.match(html, /Checking dataset connection/);
});

test("non-Isotropic builder keeps the original dataset step", () => {
  const html = renderToStaticMarkup(createElement(QueryBuilder, { selectedDatasetId: "channel" }));
  assert.match(html, /Channel Flow/);
  assert.doesNotMatch(html, /Flow configuration/);
  assert.doesNotMatch(html, /Dataset Access/);
});

test("verified query flow exposes only real HDF5 fields and index limits", () => {
  const html = renderToStaticMarkup(createElement(VerifiedQueryBuilder, { onBack: () => {} }));
  for (const field of ["p", "phi_1", "u_face", "v_face", "w_face"]) assert.match(html, new RegExp(`<option value="${field}"`));
  for (const invented of ["velocity", "pressure", "vorticity", "gradient"]) assert.doesNotMatch(html, new RegExp(`<option value="${invented}"`));
  assert.match(html, /1054 × 128 × 128 × 128/);
  assert.match(html, /Physical coordinates and units are not present/);
  assert.doesNotMatch(html, /Download CSV|Download JSON/);
});
