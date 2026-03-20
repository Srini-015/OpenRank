export function normalizeBasePath(value = "/") {
  if (!value || value === "/") {
    return "/";
  }

  return `/${String(value).replace(/^\/+|\/+$/g, "")}/`;
}

export function resolveBasePath(env = process.env) {
  const explicitBasePath = env.VITE_BASE_PATH || env.BASE_PATH;

  if (explicitBasePath) {
    return normalizeBasePath(explicitBasePath);
  }

  const repositorySlug = env.GITHUB_REPOSITORY;

  if (!repositorySlug) {
    return "/";
  }

  const [owner, repo] = repositorySlug.split("/");

  if (!owner || !repo) {
    return "/";
  }

  if (repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
    return "/";
  }

  return normalizeBasePath(repo);
}
