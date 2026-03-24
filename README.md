# OpenRank

OpenRank is a GitHub contribution analytics app with:

- a Vite/React frontend in `frontend/`
- a Node.js/Express backend in `backend/`

## Project structure

```text
.
|-- backend/
|-- frontend/
|-- .github/
|-- package.json
`-- render.yaml
```

## Frontend deployment

The frontend is configured for GitHub Pages through:

- `.github/workflows/deploy.yml`
- `frontend/vite.config.js`
- `frontend/scripts/create404.mjs`

Set the GitHub Actions secret `VITE_API_BASE_URL` to your deployed backend URL before publishing.

## Backend deployment

The repo now includes a root `render.yaml` so you can deploy the backend to Render with a Blueprint.

Render steps:

1. Open Render and choose `New +` -> `Blueprint`.
2. Select this GitHub repository.
3. Render will detect `render.yaml` and create the `openrank-backend` web service from `backend/`.
4. Fill in the prompted secret values.
5. Deploy the service and copy the final backend URL.

Required backend environment variables:

- `NODE_ENV=production`
- `MONGO_URI=<your production MongoDB connection string>`
- `CLIENT_URLS=<comma-separated frontend URLs that are allowed to call the API>`
- `SESSION_SECRET=<long random secret>`
- `GITHUB_CLIENT_ID=<your GitHub OAuth app client id>`
- `GITHUB_CLIENT_SECRET=<your GitHub OAuth app client secret>`
- `GITHUB_CALLBACK_URL=https://<your-backend-domain>/auth/github/callback`
- `GITHUB_API_TOKEN=<optional GitHub token for higher API limits>`

`CALLBACK_URL` is still accepted as a legacy alias, but prefer `GITHUB_CALLBACK_URL` for new deployments.

After the backend is live:

1. Update the GitHub OAuth app callback URL to the same `GITHUB_CALLBACK_URL`.
2. Set the repository secret `VITE_API_BASE_URL=https://<your-backend-domain>`.
3. Push a new commit so GitHub Pages rebuilds the frontend with the live backend URL.

Examples:

- GitHub Pages: `CLIENT_URLS=https://srini-015.github.io/OpenRank/`
- Vercel: `CLIENT_URLS=https://your-app.vercel.app`
- Multiple frontends: `CLIENT_URLS=https://your-app.vercel.app,https://srini-015.github.io/OpenRank/,http://localhost:5173`

Important:

- Include every frontend origin that should be allowed to call the backend
- The backend now redirects GitHub OAuth back to whichever allowed frontend started the login flow
- If `/login` shows `We couldn't verify your current session.`, the current frontend URL is usually missing from `CLIENT_URLS`

## Local development

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev
```

From the repo root you can also use:

```bash
npm run dev:frontend
npm run dev:backend
```
