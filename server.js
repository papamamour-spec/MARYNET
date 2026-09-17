/**
 * MARYNET — serveur HTTP minimal, sans dépendance, prêt pour Railway.
 * - Sert les fichiers statiques du dossier du projet
 * - URLs propres : /familles → familles.html
 * - Écoute sur process.env.PORT (fourni par Railway) ou 3000
 * - /health pour le healthcheck Railway
 */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2"
};

function send(res, status, body, type, cache) {
  res.writeHead(status, {
    "Content-Type": type || "text/plain; charset=utf-8",
    "Cache-Control": cache || "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  });
  res.end(body);
}

function resolve(urlPath) {
  let p = decodeURIComponent(urlPath.split("?")[0]);
  if (p === "/") p = "/index.html";
  else if (!path.extname(p)) p = p.replace(/\/$/, "") + ".html";
  const full = path.normalize(path.join(ROOT, p));
  if (!full.startsWith(ROOT)) return null; // interdit de sortir du dossier
  return full;
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Méthode non autorisée");
  if (req.url.split("?")[0] === "/health") return send(res, 200, JSON.stringify({ status: "ok", app: "marynet" }), TYPES[".json"]);
  const file = resolve(req.url);
  if (!file || file.includes(path.sep + ".") || file.startsWith(path.join(ROOT, "node_modules"))) return send(res, 404, "Introuvable");
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      return fs.readFile(path.join(ROOT, "404.html"), (e, page) => send(res, 404, e ? "Page introuvable" : page, TYPES[".html"]));
    }
    const ext = path.extname(file).toLowerCase();
    const cache = ext === ".html" ? "no-cache" : "public, max-age=3600";
    fs.readFile(file, (e, data) => e ? send(res, 500, "Erreur serveur") : send(res, 200, req.method === "HEAD" ? "" : data, TYPES[ext] || "application/octet-stream", cache));
  });
});

server.listen(PORT, HOST, () => console.log(`MARYNET en ligne sur http://${HOST}:${PORT}`));
