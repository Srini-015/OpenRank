const DEFAULT_CLIENT_URL = "http://localhost:5173";

const normalizeBasePath = (pathname = "/") => {
  const trimmedPath = pathname.replace(/\/+$/, "");
  return trimmedPath ? `${trimmedPath}/` : "/";
};

const parseClientUrl = (value) => {
  try {
    const url = new URL(value);
    url.search = "";
    url.hash = "";
    url.pathname = normalizeBasePath(url.pathname);
    return url;
  } catch {
    return null;
  }
};

const resolveConfiguredClientUrlValues = () => {
  const explicitValues = process.env.CLIENT_URLS?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (explicitValues?.length) {
    return explicitValues;
  }

  const singleClientUrl = process.env.CLIENT_URL?.trim();
  return singleClientUrl ? [singleClientUrl] : [DEFAULT_CLIENT_URL];
};

const configuredClientUrls = resolveConfiguredClientUrlValues()
  .map((value) => {
    const parsedClientUrl = parseClientUrl(value);

    if (!parsedClientUrl) {
      console.warn(`Ignoring invalid client URL: ${value}`);
    }

    return parsedClientUrl;
  })
  .filter(Boolean)
  .sort((left, right) => right.pathname.length - left.pathname.length);

const allowedClientUrls = configuredClientUrls.length
  ? configuredClientUrls
  : [new URL(DEFAULT_CLIENT_URL)];

const allowedClientUrlStrings = [...new Set(allowedClientUrls.map(String))];

const findAllowedClientUrlByOrigin = (origin) =>
  allowedClientUrls.find((clientUrl) => clientUrl.origin === origin) ?? null;

const matchAllowedClientUrl = (value) => {
  const candidateUrl = parseClientUrl(value);

  if (!candidateUrl) {
    return null;
  }

  return (
    allowedClientUrls.find(
      (clientUrl) =>
        clientUrl.origin === candidateUrl.origin &&
        candidateUrl.pathname.startsWith(clientUrl.pathname),
    ) ?? null
  );
};

export const resolveAllowedClientUrls = () => allowedClientUrlStrings;

export const getDefaultClientUrl = () => allowedClientUrlStrings[0];

export const isAllowedClientOrigin = (origin) =>
  Boolean(origin && findAllowedClientUrlByOrigin(origin));

export const resolveRequestClientUrl = (req) => {
  const sessionClientUrl = matchAllowedClientUrl(req?.session?.oauthClientUrl);
  if (sessionClientUrl) {
    return sessionClientUrl.toString();
  }

  const refererClientUrl = matchAllowedClientUrl(req?.get("referer"));
  if (refererClientUrl) {
    return refererClientUrl.toString();
  }

  const originClientUrl = findAllowedClientUrlByOrigin(req?.get("origin"));
  if (originClientUrl) {
    return originClientUrl.toString();
  }

  return getDefaultClientUrl();
};
