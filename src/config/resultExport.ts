export type Axis = "time" | "x" | "y" | "z";
export type QueryResult = {
  dataset: string;
  variant: string;
  configuration: string;
  parameter: { name: string; value: number };
  variable: string;
  datasetPath: string;
  operation: string;
  ranges: Record<Axis, [number, number]>;
  shape: [number, number, number, number];
  dtype: string;
  gridLocation: string;
  valueCount: number;
  time: number[];
  step: number[];
  data: (number | null)[][][][];
};

export function resultFilename(result: QueryResult, format: "csv" | "json") {
  const safe = (value: string) => value.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/\.{2,}/g, "-").replace(/^[.-]+|[.-]+$/g, "");
  const parameter = `${result.parameter.name === "Weber Number" ? "we" : result.parameter.name}-${result.parameter.value}`;
  const frame = result.ranges.time[1] - result.ranges.time[0] === 1
    ? `frame-${result.ranges.time[0]}`
    : `frames-${result.ranges.time[0]}-${result.ranges.time[1] - 1}`;
  return `${safe(result.dataset)}-${safe(result.configuration)}-${safe(parameter)}-${safe(result.variable)}-${safe(frame)}.${format}`;
}

export function resultToJson(result: QueryResult) {
  return JSON.stringify(result, null, 2);
}

export function resultToCsv(result: QueryResult) {
  const rows = ["frameIndex,step,time,xIndex,yIndex,zIndex,value"];
  // The backend always returns [time][x][y][z], including singleton dimensions.
  result.data.forEach((frame, t) => frame.forEach((plane, x) => plane.forEach((line, y) => line.forEach((value, z) => {
    rows.push([
      result.ranges.time[0] + t,
      result.step[t] ?? "",
      result.time[t] ?? "",
      result.ranges.x[0] + x,
      result.ranges.y[0] + y,
      result.ranges.z[0] + z,
      value ?? ""
    ].join(","));
  }))));
  return `${rows.join("\r\n")}\r\n`;
}

export function downloadResult(result: QueryResult, format: "csv" | "json") {
  const content = format === "csv" ? resultToCsv(result) : resultToJson(result);
  const blob = new Blob([content], { type: format === "csv" ? "text/csv;charset=utf-8" : "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = resultFilename(result, format);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
