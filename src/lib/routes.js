const baseUrl = import.meta.env.BASE_URL || "/";
const normalizedBasePath =
  baseUrl === "/" ? "" : `/${baseUrl.replace(/^\/+|\/+$/g, "")}`;
const EXTERNAL_URL_PATTERN = /^[a-z][a-z\d+.-]*:/i;

function normalizePathname(pathname) {
  return pathname.replace(/\/+$/, "") || "/";
}

export function getAppHref(path = "/") {
  if (!path) {
    return normalizedBasePath || "/";
  }

  if (path.startsWith("#") || path.startsWith("//") || EXTERNAL_URL_PATTERN.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBasePath}${normalizedPath}` || "/";
}

export function getAppPathname() {
  if (typeof window === "undefined") {
    return "/";
  }

  const { pathname } = window.location;

  if (!normalizedBasePath) {
    return normalizePathname(pathname);
  }

  if (pathname === normalizedBasePath) {
    return "/";
  }

  if (pathname.startsWith(`${normalizedBasePath}/`)) {
    return normalizePathname(pathname.slice(normalizedBasePath.length));
  }

  return normalizePathname(pathname);
}

export function redirectTo(path, { replace = true } = {}) {
  const nextHref = getAppHref(path);

  if (replace) {
    window.location.replace(nextHref);
    return;
  }

  window.location.assign(nextHref);
}
