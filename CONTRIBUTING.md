# Contributing

Start from an up-to-date branch and create a focused feature branch for your change. Use Node 24.19.0 and pnpm 11.1.2 (see [README.md](README.md)); install with `pnpm install --frozen-lockfile` when verifying a clean checkout.

For real We = 0.5 queries, create a Python virtual environment and install `backend/requirements.txt`, then run `.venv/bin/python -m backend.server` in one terminal and `pnpm run dev` in another. The frontend calls the local query service, which reads bounded ranges from the immutable Hugging Face revision recorded in `metadata/we-0.5.schema.json`. No local HDF5 download or `FLOWDB_HDF5_PATH` is needed. The full-file download is optional and separate from Run Query. Optional public-file integration tests use `FLOWDB_REMOTE_INTEGRATION=1 .venv/bin/python -m unittest discover -s backend/tests` and transfer only bounded ranges. See [remote access notes](docs/remote-access.md).

Before opening a pull request, run:

```bash
pnpm run typecheck
pnpm test
pnpm run build
```

Describe the behavior changed and how you tested it. Keep scientific values tied to verified source material, and label prototype estimates or mock metadata clearly.

Do not commit large scientific datasets (including HDF5 files), generated build output, credentials, access tokens, or `.env` files. Discuss new dataset storage or authentication needs with the project owner before implementing them. The project owner should decide licensing and public-release timing.
