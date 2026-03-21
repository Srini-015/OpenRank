import { mkdir, writeFile } from "node:fs/promises";
import { resolveBasePath } from "./githubPagesBase.mjs";

const redirectStorageKey = "openrank-spa-redirect";
const basePath = resolveBasePath();

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="robots" content="noindex" />
    <title>OpenRank</title>
    <script>
      window.sessionStorage.setItem(
        ${JSON.stringify(redirectStorageKey)},
        window.location.pathname + window.location.search + window.location.hash,
      );
      window.location.replace(${JSON.stringify(basePath)});
    </script>
  </head>
  <body></body>
</html>
`;

await mkdir("dist", { recursive: true });
await writeFile("dist/404.html", html, "utf8");
