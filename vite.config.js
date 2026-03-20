import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolveBasePath } from "./scripts/githubPagesBase.mjs";

export default defineConfig({
  base: resolveBasePath(),
  plugins: [react()],
});
