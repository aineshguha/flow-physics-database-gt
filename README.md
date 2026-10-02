# Flow Physics Database

The **Georgia Tech Turbulence Database** is a frontend prototype for exploring large-scale flow physics datasets and composing research data requests. It is built with React, TypeScript, Tailwind CSS, and Vite. One Isotropic Turbulence variant has a direct public source-file link; no scientific processing service is connected.

## Current Features

- Dataset browser and comparison dashboard using a local mock catalog.
- Isotropic Turbulence selection by flow configuration and parameter, with refresh-safe variant URLs and per-variant file-format metadata.
- Guided Query Builder with dataset access choice, variable/query-type/spatial/time inputs, a visual region preview, a mock request-size estimator, and JSON review.
- A direct complete-file download for Emulsions at Weber Number 0.5. Other variants remain unavailable. Filtered-query construction works in the UI, but scientific extraction and submission do not.
- Documentation, citations placeholder, and an informational Machine Learning workspace. No training, inference, NVIDIA integration, or ML data preparation runs.

The generic dataset catalog and estimator are prototypes, not verified metadata or measured performance for the eventual scientific files. Python snippets shown for generic mock queries are illustrative; Isotropic Turbulence Python export is disabled.

## Isotropic Turbulence Structure

| Flow configuration | Parameter | Available values |
| --- | --- | --- |
| Bubbles | Density Ratio | 0.001, 0.01, 0.1 |
| Droplets | Density Ratio | 10, 100, 1000 |
| Emulsions | Weber Number | 0.5, 1, 1.25, 1.5, 1.75, 2 |

Only Emulsions at Weber Number **0.5** is mapped to a source file: the public HDF5 file `HIT/Low_We/emulsions/We_0_5/We_0_5.hdf5` in the Hugging Face dataset repository `Onirban1234/MFlowDB` at revision `main`. Its file size and scientific variable metadata have not been verified. Other variants have no source mapping or confirmed format yet.

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

The tests cover the Isotropic configuration and provider state, request payload separation, and initial Query Builder/access-screen rendering. Browser interaction checks are still important for the full step-by-step workflow.

## Dataset Access Modes

**Download Full Dataset** links to the complete, unmodified original source file for one exact variant. It does not require variable, spatial, or time settings. The link is enabled only for Emulsions at Weber Number 0.5 and points directly to Hugging Face's `/resolve/main/` URL with `?download=true`. The browser handles the transfer; the app does not fetch or parse the HDF5 file. Other variants show a disabled control.

**Continue with Query** opens UI controls for a selected variable, query type, spatial region, and time range. Its review produces a structured JSON request with `accessMode: "query"`. No file parsing, filtering, subset download, or query execution is implemented yet.

## Dataset Storage

Large scientific datasets are intentionally not stored in Git. The configuration and provider layer contain one public Hugging Face file mapping, with no token or proxy. Do not commit datasets or secrets. If future access requires credentials, supply them through an appropriate secure service and GitHub secrets/environment configuration, never frontend source or committed `.env` files.

## Project Structure

| Path | Purpose |
| --- | --- |
| `src/App.tsx`, `src/pages/` | Hash routing and application pages |
| `src/components/` | Reusable UI, including Query Builder and Dataset Access |
| `src/config/isotropicTurbulenceConfig.ts` | Authoritative Isotropic variants and route context |
| `src/config/queryRequest.ts` | Separate complete-download and filtered-query payloads |
| `src/services/` | Dataset provider contract and direct-link Hugging Face resolver |
| `src/data/datasets.ts` | Local mock catalog for the frontend prototype |
| `src/types/` | Shared TypeScript UI/query types |
| `tests/`, `scripts/test.mjs` | Automated tests and test runner |
| `.github/workflows/ci.yml` | Install, typecheck, test, and build on pushes and pull requests |

## Development Status

Planned, but **not yet implemented**: mapping the remaining source files, server-side subset extraction, ML-compatible data preparation, and NVIDIA model integration. The Machine Learning page is informational only.

This project does not yet include a software license. Confirm licensing and repository visibility with the project owner before public release; a private GitHub repository is the safer starting point for research collaboration. See [CONTRIBUTING.md](CONTRIBUTING.md) for a short contribution checklist.
