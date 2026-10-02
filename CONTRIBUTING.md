# Contributing

Start from an up-to-date branch and create a focused feature branch for your change. Use Node 24.19.0 and pnpm 11.1.2 (see [README.md](README.md)); install with `pnpm install --frozen-lockfile` when verifying a clean checkout.

Before opening a pull request, run:

```bash
pnpm run typecheck
pnpm test
pnpm run build
```

Describe the behavior changed and how you tested it. Keep scientific values tied to verified source material, and label prototype estimates or mock metadata clearly.

Do not commit large scientific datasets (including HDF5 files), generated build output, credentials, access tokens, or `.env` files. Discuss new dataset storage or authentication needs with the project owner before implementing them. The project owner should decide licensing and public-release timing.
