import { createRequestHandler } from "@remix-run/express";
import compression from "compression";
import "dotenv/config";
import express from "express";
import http from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";

const app = express();

const server = http.createServer(app);

const socketProxy = createProxyMiddleware({
  target: process.env.SERVER_URL,
  changeOrigin: true,
  ws: true,
  pathFilter: "/socket.io",
});

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true, hmr: { server } },
        })
      );

const remixHandler = createRequestHandler({
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
    : await import("../build/server/index.js"),
});

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  // Vite fingerprints its assets so we can cache forever.
  app.use("/assets", express.static("build/client/assets", { immutable: true, maxAge: "1y" }));
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("build/client", { maxAge: "1h" }));

app.use(morgan("tiny"));

app.use(socketProxy);

// handle SSR requests
app.all("*", remixHandler);

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Express server listening at http://localhost:${port}`));
