# Handoff — Historical Political Presence Map (V3)

Last updated: 2026-10-25

## Repository and current state

- Repository: https://github.com/imanbarati/bug-free-telegram
- Default branch: `main`
- Project: Historical Political Presence Map V3
- Current map-project commit: `835cbc25d79f84b0d892048e9dea76914c892fb1`
- Commit: https://github.com/imanbarati/bug-free-telegram/commit/835cbc25d79f84b0d892048e9dea76914c892fb1
- Deployment workflow run started for that commit: https://github.com/imanbarati/bug-free-telegram/actions/runs/38111201326

**Important:** The current `main` tree was replaced with the map project after an earlier mix-up with the Trident project. The current tree contains the map project, not Trident. Earlier Trident commits may still be visible in Git history; they are not part of the current `main` tree. Do not restore or add Trident files to this repository.

The deployment run was last observed as queued. A successful build or live deployment has **not** been confirmed in this handoff. Check the Actions run above before claiming deployment succeeded.

## What the app is

A responsive, browser-based reference map for broad historical and political context. It is not intended for operational military tracking.

### Stack

- React 19
- TanStack Start / TanStack Router
- Vite 7
- Leaflet
- GeoJSON
- Cloudflare Workers with Wrangler
- GitHub Actions CI/deployment

Node.js 22 is used in CI and is the documented local requirement.

## Main files

- `src/routes/index.tsx` — main route/page
- `src/routes/__root.tsx` — document root and route outlet
- `src/router.tsx` — router setup
- `src/routeTree.gen.ts` — generated route tree; avoid manual edits unless required by the framework
- `src/components/MapEditor.tsx` — map/editor UI
- `src/styles/app.css` — app styling
- `src/data/groups.geojson` — source data copy
- `public/data/groups.geojson` — public GeoJSON data
- `wrangler.jsonc` — Cloudflare Worker configuration
- `.github/workflows/deploy.yml` — build and deploy workflow
- `package.json` — scripts and dependencies

## Features and data boundaries

- Browse, search, and filter broad references by organization
- Add, edit, and delete references in the browser
- Export GeoJSON
- Responsive map/editor layout
- Initial country-level references for IRGC (Iran), Houthis / Ansar Allah (Yemen), Hezbollah (Lebanon), and Popular Mobilization Forces (Iraq)

The initial records are broad country-level references, not precise operational locations. Keep the project non-operational: do not add bases, strongholds, weapons sites, command centers, unit deployments, tactical positions, or other precise targeting data.

## Important current limitation

Edits made in the browser are held in memory only. They are not persisted to a server or database and may be lost when the page reloads. Use **Export GeoJSON** to save edits. There is no persistence backend in the current implementation.

## Run locally

Install Node.js 22+, then:

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run check
npm run build
npm run preview
```

The build script runs `vite build` and then `tsc --noEmit`.

## Deploy to Cloudflare

### GitHub Actions deployment

The workflow runs on pushes to `main` and supports manual dispatch. Configure these repository Actions secrets:

- `CLOUDFLARE_API_TOKEN` — Cloudflare API token with the permissions needed to deploy Workers
- `CLOUDFLARE_ACCOUNT_ID` — target Cloudflare account ID

Then push to `main` or manually run the workflow from the Actions tab.

Workflow file: [deploy.yml](.github/workflows/deploy.yml)

### Manual deployment

```bash
npm install
npx wrangler login
npm run deploy
```

The configured Worker name is `historical-political-presence-map`. Review `wrangler.jsonc` and Cloudflare account settings before changing production deployment configuration.

## Recommended next steps

1. Open [the latest Actions run](https://github.com/imanbarati/bug-free-telegram/actions/runs/38111201326) and confirm whether it completed. Fix build/deploy errors before reporting success.
2. Run `npm run build` locally or in CI and resolve any TypeScript, Vite, or Cloudflare adapter errors.
3. Verify the deployed Worker URL from Cloudflare; test initial load, map rendering, search/filter, editing, and GeoJSON export.
4. Confirm Leaflet CSS and map tile/network behavior in production.
5. If durable editing is required, design and implement explicit persistence (for example, a Cloudflare D1-backed API) with validation and access controls. Until then, describe edits as temporary browser-session changes.
6. Add automated tests for data parsing, filtering, and GeoJSON export if the project is going to be actively maintained.
7. Keep public-facing copy clear that this is a broad historical/political reference map, not a live or tactical intelligence system.

## Working rules for future agents

- Read this file and `README.md` before making changes.
- Keep changes focused on the map project; do not mix in Trident or unrelated app files.
- Do not claim deployment is live unless the Actions run and deployed URL have both been checked.
- Preserve the non-operational, country-level scope of the reference data.
- Update this handoff when deployment status, architecture, persistence, or major features change.

## License

The repository declares the MIT License. See [LICENSE](LICENSE).
