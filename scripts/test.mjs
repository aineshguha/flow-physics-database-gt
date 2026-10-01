import { createRequire } from "node:module";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

// Reuse Vite's installed TypeScript bundler; no extra test dependencies required.
const require = createRequire(import.meta.url);
const viteRequire = createRequire(require.resolve("vite"));
const { build } = viteRequire("esbuild");
const directory = await mkdtemp(join(tmpdir(), "flowdb-tests-"));
try {
  const outfile = join(directory, "dataset-service.cjs");
  await build({ entryPoints: ["tests/datasetService.test.ts"], bundle: true, platform: "node", format: "cjs", jsx: "automatic", outfile });
  const result = spawnSync(process.execPath, ["--test", outfile], { stdio: "inherit" });
  process.exitCode = result.status ?? 1;
} finally {
  await rm(directory, { recursive: true, force: true });
}
