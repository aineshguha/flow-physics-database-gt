# Flow Physics Database

The **Georgia Tech Turbulence Database** is a React, TypeScript, Tailwind CSS, and Vite research-data prototype. The Emulsions / Weber Number 0.5 variant has a direct public full-file download and a Python/HDF5 service for small, real index-based slices read remotely from Hugging Face. Other variants remain unmapped.

## Current Features

- Dataset browser and comparison dashboard using a local mock catalog.
- Isotropic Turbulence selection by flow configuration and parameter, with refresh-safe variant URLs and per-variant file-format metadata.
- A Dataset Preview for every Isotropic variant, using local illustrative artwork clearly distinguished from actual simulation results.
- Guided Query Builder with a verified index-based workflow for Emulsions / Weber Number 0.5. The other catalog entries remain prototypes, not scientific source metadata.
- A direct complete-file download for Emulsions at Weber Number 0.5. Its small-slice queries return actual remote HDF5 values when the query API is running; the full file is not required on a researcher's computer. Other variants remain unavailable for real querying.
- Successful small-slice queries can download only their returned values as CSV (array indices, step, and time per value) or JSON (the complete response and query context). These downloads do not re-read the source file.
- Documentation, citations placeholder, and an informational Machine Learning workspace. No training, inference, NVIDIA integration, or ML data preparation runs.

The other dataset entries and their estimates are prototypes, not verified metadata or measured performance. Python snippets shown for generic mock queries are illustrative; the verified Isotropic HDF5 query uses the local query API, which reads remotely by default.

## Isotropic Turbulence Structure

| Flow configuration | Parameter | Available values |
| --- | --- | --- |
| Bubbles | Density Ratio | 0.001, 0.01, 0.1 |
| Droplets | Density Ratio | 10, 100, 1000 |
| Emulsions | Weber Number | 0.5, 1, 1.25, 1.5, 1.75, 2 |

Only Emulsions at Weber Number **0.5** is mapped to a source file: the public HDF5 file `HIT/Low_We/emulsions/We_0_5/We_0_5.hdf5` in the Hugging Face dataset repository `Onirban1234/MFlowDB` at immutable commit `55532332ae64497403da215139e2ca076b3c31f2`. The file was previously inspected: it is 35,002,509,662 bytes, with 1,054 stored frames and fields `p`, `phi_1`, `u_face`, `v_face`, and `w_face`. The shared [verified schema](metadata/we-0.5.schema.json) holds the commit, path, size, and expected ETag for both the query service and full-download link. See [the inspected schema report](docs/we-0.5-schema.md). Other variants have no source mapping or confirmed format yet.

## Requirements

- Node.js **24.19.0**, recorded in `.nvmrc` and used for validation. The package declares support for Node 24.19.x (`>=24.19.0 <25`).
- **pnpm 11.1.2**, recorded in `package.json` as the package manager. `pnpm-lock.yaml` is the sole dependency lockfile.

Install Node with your preferred version manager. With `nvm`, run `nvm install` and `nvm use` from the project root. If pnpm is not installed, run `npm install --global pnpm@11.1.2` after installing Node.

## Installation

After the project owner creates a GitHub repository and supplies its URL:

```bash
git clone <repository-url> georgia-tech-turbulence-database
cd georgia-tech-turbulence-database
pnpm install
```

For a reproducible clean install, including in CI, use `pnpm install --frozen-lockfile`. Do not use `npm install` in this project; it would create a competing lockfile.

## Running Locally

```bash
pnpm run dev
```

Open the local URL Vite prints in the terminal. The development server binds to the local loopback interface; it is not a hosted deployment. Routes use URL hashes, so a selected Isotropic variant can be opened directly or refreshed.

To preview a production build locally:

```bash
pnpm run build
pnpm run preview
```

## Validation

```bash
pnpm run typecheck
pnpm test
pnpm run build
```

The frontend tests cover variant mapping, download resolution, request payload separation, initial Query Builder/access-screen rendering, and CSV/JSON result serialization. Run `.venv/bin/python -m unittest discover -s backend/tests` for the Python service. Set `FLOWDB_REMOTE_INTEGRATION=1` to also query the public file in a bounded opt-in integration suite. If you have a local reference file, set `FLOWDB_HDF5_PATH` for local tests and remote/local comparisons. Browser interaction checks are still important for the full step-by-step workflow.

## Dataset Access Modes

Each Isotropic variant has its own preview entry in `src/config/isotropicTurbulenceConfig.ts`. The 16:9 placeholder SVGs live in `public/dataset-previews/`. To replace one with a verified scientific visualization, add the image under `public/`, update that variant's `image` and `alt` in `datasetPreviews`, and set its `type` to `visualization`. This changes the displayed label without changing query availability or source-file metadata. Missing images show a fallback.

**Download Full Dataset** is an optional direct Hugging Face link to the complete 32.6 GiB original source file at the pinned commit. It does not require variable, spatial, or time settings. The browser handles the transfer; the app does not fetch or parse the HDF5 file. Other variants show a disabled control. Normal development and queries do not require this download.

**Continue with Query** opens a verified workflow for the We = 0.5 variant. Choose one of the five HDF5 field IDs, an operation (point, 2D slice, 3D volume, or time series), and integer half-open `[start, stop)` index ranges. The browser sends a JSON request to the local API; the Python service validates the variant, field, bounds, operation, and 4,096-value limit before reading only that HDF5 slice. The response includes actual numerical values, shape, dtype, and matching `/time` and `/step` values. No physical-coordinate mapping, resampling, or interpolation is claimed. The other configurations cannot proceed past variable selection until their files are inspected.

**Download Results** appears only after a successful verified query and exports the response already in browser memory. CSV includes the frame, simulation step/time, and per-axis array indices for each value; JSON preserves the dataset, configuration, parameter, field path, request ranges, shape, dtype, and returned values. Changing query inputs or a failed rerun clears these actions. This is separate from **Download Full Dataset** and cannot bypass the same 4,096-value / 32-frame API limits.

## Real-Data Query Service

The 32.6 GiB source file stays outside Git and is **not needed for normal queries**. Install the small Python dependency in a virtual environment and start the remote-mode service:

```bash
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
.venv/bin/python -m backend.server
```

In another terminal, run `pnpm run dev`. Vite proxies `/api` to `127.0.0.1:8765`. The normal path is frontend → local query service → pinned Hugging Face file → bounded HTTP ranges → `h5py` → requested values. Remote mode is the default: the service verifies the file size, expected ETag, and byte-range responses. It never downloads the full file as a fallback. Requests are limited to 4,096 values and 32 frames, and remote transfers are additionally bounded per query. No Hugging Face token, local HDF5 file, `FLOWDB_HDF5_PATH`, or 32.6 GiB of free disk space is required.

For optional local development or comparison, start the service with `FLOWDB_DATA_SOURCE=local FLOWDB_HDF5_PATH="/absolute/path/to/We_0_5.hdf5" .venv/bin/python -m backend.server`. The path is server-side only; browser requests cannot choose a URL or HDF5 path. `FLOWDB_API_HOST` defaults to `127.0.0.1`, and `FLOWDB_API_PORT` defaults to `8765`. If you change the port, update the Vite proxy too. See [remote access design and measured behavior](docs/remote-access.md). Do not expose this development HTTP server publicly; a hosted API still needs authentication, rate limiting, concurrency controls, and production serving infrastructure.

## Dataset Storage

Large scientific datasets are intentionally not stored in Git. The frontend's full-file link remains separate from the server's bounded range access to the same public source. A local override may use `FLOWDB_HDF5_PATH`, but no personal absolute path is committed. Do not commit datasets or secrets. If future access requires credentials, supply them through an appropriate secure service and GitHub secrets/environment configuration, never frontend source or committed `.env` files.

## Project Structure

| Path | Purpose |
| --- | --- |
| `src/App.tsx`, `src/pages/` | Hash routing and application pages |
| `src/components/` | Reusable UI, including Query Builder and Dataset Access |
| `src/config/isotropicTurbulenceConfig.ts` | Authoritative Isotropic variants and route context |
| `public/dataset-previews/`, `src/components/isotropic/DatasetPreview.tsx` | Per-variant placeholder artwork and responsive preview panel |
| `metadata/we-0.5.schema.json` | Verified field shapes and metadata shared by frontend and query service |
| `docs/we-0.5-schema.md` | Human-readable inspection report and prototype comparison |
| `backend/` | Local HDF5 inspection, bounded slice service, and tests |
| `backend/source.py` | Remote and optional local HDF5 storage sources with bounded in-memory range cache |
| `docs/remote-access.md` | Tested remote access methods, safeguards, and performance |
| `src/config/queryRequest.ts` | Separate complete-download and filtered-query payloads |
| `src/config/resultExport.ts` | Client-side CSV/JSON serialization of successful small query results |
| `src/services/` | Dataset provider contract and direct-link Hugging Face resolver |
| `src/data/datasets.ts` | Local mock catalog for the frontend prototype |
| `src/types/` | Shared TypeScript UI/query types |
| `tests/`, `scripts/test.mjs` | Automated tests and test runner |
| `.github/workflows/ci.yml` | Install, typecheck, test, and build on pushes and pull requests |

## Development Status

Planned, but **not yet implemented**: mapping the remaining source files, physical-coordinate queries, large-result exports, hosted/public query API, ML-compatible data preparation, and NVIDIA model integration. The Machine Learning page is informational only.

This project does not yet include a software license. Confirm licensing and repository visibility with the project owner before public release; a private GitHub repository is the safer starting point for research collaboration. See [CONTRIBUTING.md](CONTRIBUTING.md) for a short contribution checklist.
