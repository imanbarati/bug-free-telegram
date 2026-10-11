# Historical Political Presence Map — V3

Human-friendly editor for broad historical/political context. This is a non-operational reference map, not a military tracking tool.

## Stack
- TanStack Start + React
- Leaflet + GeoJSON
- Cloudflare Workers + Wrangler
- GitHub Actions

## Local development
Requires Node.js 22+.

```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy to Cloudflare Workers
Run `npx wrangler login`, then `npm run deploy`.

For automatic GitHub deployment, add repository Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, then push to `main`. See `.github/workflows/deploy.yml`.

## Features
- Search and filter broad references by organization
- Add, edit, and delete references in the browser
- Export GeoJSON
- Responsive layout

The editor currently keeps edits in browser memory; use **Export GeoJSON** to save your changes. The app intentionally excludes bases, strongholds, weapons sites, command centers, deployments, and tactical positions.

## Initial data
`public/data/groups.geojson` contains country-level reference points for IRGC (Iran), Houthis / Ansar Allah (Yemen), Hezbollah (Lebanon), and Popular Mobilization Forces (Iraq). These are broad geographic references, not operational locations.

## License
MIT
