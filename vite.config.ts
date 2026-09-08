/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Run the /api/* Edge functions during `vite dev`. Vercel runs them in
 * production; this middleware loads the same handler modules and adapts
 * Node's req/res to the Web Request/Response they expect.
 */
function apiDev(env: Record<string, string>): Plugin {
  return {
    name: "stub-api-dev",
    apply: "serve",
    configureServer(server) {
      for (const [k, v] of Object.entries(env)) {
        if (!k.startsWith("VITE_") && v) process.env[k] = v;
      }
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();
        const name = req.url.split("?")[0].slice("/api/".length).replace(/[^a-z0-9_-]/gi, "");
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.ts`);
          const handler = mod.default as (r: Request) => Promise<Response>;
          const request = new Request(`http://localhost${req.url}`, { method: req.method });
          const out = await handler(request);
          res.statusCode = out.status;
          out.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await out.arrayBuffer()));
        } catch (err) {
          res.statusCode = 500;
          res.end(String(err));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), apiDev(env)],
    server: { port: 5173 },
    build: {
      // Split the heavy, rarely-changing libraries out of the app bundle so a
      // first visit doesn't pull one big file, and repeat visits keep the
      // vendor chunk cached across app deploys.
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "data-vendor": ["@tanstack/react-query", "@supabase/supabase-js"],
          },
        },
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      css: false,
    },
  };
});
