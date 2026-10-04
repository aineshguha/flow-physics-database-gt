import assert from "node:assert/strict";
import { test } from "node:test";
import { resultFilename, resultToCsv, resultToJson, type QueryResult } from "../src/config/resultExport";

const result: QueryResult = {
  dataset: "Isotropic Turbulence",
  variant: "isotropic/emulsions/0.5",
  configuration: "emulsions",
  parameter: { name: "Weber Number", value: 0.5 },
  variable: "p",
  datasetPath: "/p",
  operation: "time-series",
  ranges: { time: [4, 6], x: [11, 12], y: [22, 23], z: [33, 34] },
  shape: [2, 1, 1, 1],
  dtype: "float32",
  gridLocation: "cell-centered",
  valueCount: 2,
  time: [0.5, 0.625],
  step: [17000, 17250],
  data: [[[[1.009291172027588]]], [[[0.9876543283462524]]]]
};

test("JSON export retains the exact response values and scientific query context", () => {
  assert.deepEqual(JSON.parse(resultToJson(result)), result);
  assert.match(resultToJson(result), /1\.009291172027588/);
  assert.match(resultFilename(result, "json"), /^isotropic-turbulence-emulsions-we-0\.5-p-frames-4-5\.json$/);
});

test("CSV maps each returned value to its selected array indices, frame, step and time", () => {
  assert.equal(resultToCsv(result), [
    "frameIndex,step,time,xIndex,yIndex,zIndex,value",
    "4,17000,0.5,11,22,33,1.009291172027588",
    "5,17250,0.625,11,22,33,0.9876543283462524",
    ""
  ].join("\r\n"));
});

test("CSV keeps independent staggered field indices and safe filenames", () => {
  const face: QueryResult = {
    ...result,
    variable: "u_face",
    datasetPath: "/u_face",
    gridLocation: "x-face",
    operation: "point",
    ranges: { time: [0, 1], x: [128, 129], y: [0, 1], z: [0, 1] },
    shape: [1, 1, 1, 1],
    valueCount: 1,
    time: [0],
    step: [16000],
    data: [[[[0.125]]]]
  };
  assert.match(resultToCsv(face), /0,16000,0,128,0,0,0\.125/);
  assert.equal(resultFilename(face, "csv"), "isotropic-turbulence-emulsions-we-0.5-u-face-frame-0.csv");
  assert.match(resultFilename({ ...face, variable: "../../unsafe name" }, "csv"), /^[a-z0-9.-]+\.csv$/);
  assert.doesNotMatch(resultFilename({ ...face, variable: "../../unsafe name" }, "csv"), /\.\./);
  assert.equal(resultToCsv({ ...face, ranges: { time: [0, 1], x: [0, 1], y: [128, 129], z: [0, 1] } }).split("\r\n")[1], "0,16000,0,0,128,0,0.125");
  assert.equal(resultToCsv({ ...face, ranges: { time: [0, 1], x: [0, 1], y: [0, 1], z: [128, 129] } }).split("\r\n")[1], "0,16000,0,0,0,128,0.125");
});

test("spatial CSV export emits every result cell without assuming a shared field shape", () => {
  const volume: QueryResult = {
    ...result,
    operation: "volume",
    ranges: { time: [2, 3], x: [7, 9], y: [4, 6], z: [1, 2] },
    shape: [1, 2, 2, 1],
    valueCount: 4,
    time: [0.2],
    step: [16500],
    data: [[[[1], [2]], [[3], [4]]]]
  };
  assert.deepEqual(resultToCsv(volume).trim().split("\r\n").slice(1), [
    "2,16500,0.2,7,4,1,1", "2,16500,0.2,7,5,1,2",
    "2,16500,0.2,8,4,1,3", "2,16500,0.2,8,5,1,4"
  ]);
});
