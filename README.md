# OpenRank

OpenRank is a GitHub contribution analytics app with:

- a Vite/React frontend in the project root
- a Node.js/Express backend in `openrank-backend`

## Frontend deployment

The frontend is configured for GitHub Pages through:

- `.github/workflows/deploy.yml`
- `vite.config.js`
- `scripts/create404.mjs`

Set the GitHub Actions secret `VITE_API_BASE_URL` to your deployed backend URL before publishing.

## Backend deployment

The repo now includes a root `render.yaml` so you can deploy the backend to Render with a Blueprint.

Render steps:

1. Open Render and choose `New +` -> `Blueprint`.
2. Select this GitHub repository.
3. Render will detect `render.yaml` and create the `openrank-backend` web service.
4. Fill in the prompted secret values.
5. Deploy the service and copy the final backend URL.

Required backend environment variables:

- `NODE_ENV=production`
- `MONGO_URI=<your production MongoDB connection string>`
- `CLIENT_URL=https://srini-015.github.io/OpenRank/`
- `SESSION_SECRET=<long random secret>`
- `GITHUB_CLIENT_ID=<your GitHub OAuth app client id>`
- `GITHUB_CLIENT_SECRET=<your GitHub OAuth app client secret>`
- `CALLBACK_URL=https://<your-backend-domain>/auth/github/callback`
- `GITHUB_API_TOKEN=<optional GitHub token for higher API limits>`

After the backend is live:

1. Update the GitHub OAuth app callback URL to the same `CALLBACK_URL`.
2. Set the repository secret `VITE_API_BASE_URL=https://<your-backend-domain>`.
3. Push a new commit so GitHub Pages rebuilds the frontend with the live backend URL.

Important:

- `CLIENT_URL` must stay `https://srini-015.github.io/OpenRank/`
- The backend now preserves the `/OpenRank/` subpath during OAuth redirects, which is required for GitHub Pages

## Local development

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd openrank-backend
npm install
npm run dev
```
