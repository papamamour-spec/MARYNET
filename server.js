/**
 * MARYNET — serveur HTTP sans dépendance, prêt pour Railway.
 *
 * Site public  : fichiers statiques, URLs propres (/familles → familles.html)
 * Back-office  : /admin (protégé par mot de passe, variable ADMIN_PASSWORD)
 * API          : /api/settings (lecture publique), /api/admin/* (authentifié)
 * Données      : DATA_DIR (défaut ./data) — sur Railway, monter un Volume et
 *                définir DATA_DIR=/data pour conserver paramètres et historique.
 * Santé        : /health
 */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "data");
const IS_PROD = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === "production");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (IS_PROD ? "" : "marynet2026");
const SESSION_HOURS = 12;

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2"
};

/* ------------------------------------------------------------------ */
/* Stockage fichier (JSON)                                              */
/* ------------------------------------------------------------------ */
function ensureDir() { try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {} }
function readJSON(name, fallback) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), "utf8")); } catch (e) { return fallback; }
}
function writeJSON(name, data) {
  ensureDir();
  const tmp = path.join(DATA_DIR, name + ".tmp");
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, path.join(DATA_DIR, name));
}

const DEFAULT_SETTINGS = {
  commissions: {
    heure: 10, heureOr: 8, heurePlatine: 7, urgenceMajoration: 25, urgencePart: 10,
    placementPct: 50, serenite: 9500, serenitePartage: 4500, b2bMax: 12, b2bMin: 8,
    diaspora: 3, agence: 6, agenceLicence: 25000, institution: 6, apporteur: 10
  },
  salaires: { plancherMensuel: 75000, plancherHoraire: 1500, tirelirePct: 5, cotisationsPct: 12.6 },
  niveaux: { argent: 60, or: 80, platine: 92, suspension: 40, indiceDepart: 55 },
  formules: { permanent: true, heure: true, partage: true, abonnement: true, urgence: true, diaspora: true },
  paiements: { wave: true, orange: true, free: true, carte: true, virement: true },
  villes: ["Dakar", "Thiès", "Saly / Mbour", "Saint-Louis", "Ziguinchor", "Touba", "Kaolack"],
  alertes: { litigeMaxPct: 1, kycDelaiHeures: 24, slaRemplacementHeures: 48 },
  updatedAt: null
};

function getSettings() {
  const s = readJSON("settings.json", null);
  if (!s) return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  // fusion superficielle par section pour tolérer les nouveaux champs
  const out = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  Object.keys(out).forEach(k => {
    if (s[k] === undefined) return;
    out[k] = (out[k] && typeof out[k] === "object" && !Array.isArray(out[k])) ? Object.assign({}, out[k], s[k]) : s[k];
  });
  return out;
}

/* ------------------------------------------------------------------ */
/* Jeu de données de démonstration (déterministe)                       */
/* ------------------------------------------------------------------ */
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function pick(r, arr, weights) {
  if (!weights) return arr[Math.floor(r() * arr.length)];
  let t = weights.reduce((a, b) => a + b, 0), x = r() * t;
  for (let i = 0; i < arr.length; i++) { x -= weights[i]; if (x <= 0) return arr[i]; }
  return arr[arr.length - 1];
}
const TX_TYPES = {
  heure:     { label: "Mission à l'heure",      acteur: "famille",     canaux: ["Wave", "Orange Money", "Free Money"], montant: [4500, 16000],     taux: [0.07, 0.10] },
  urgence:   { label: "Urgence",                 acteur: "famille",     canaux: ["Wave", "Orange Money"],               montant: [6000, 18000],     taux: [0.18, 0.18] },
  placement: { label: "Frais de placement",      acteur: "famille",     canaux: ["Wave", "Orange Money", "Carte"],      montant: [37500, 80000],    taux: [1, 1] },
  serenite:  { label: "Abonnement Sérénité",     acteur: "famille",     canaux: ["Wave", "Orange Money", "Free Money"], montant: [4500, 9500],      taux: [1, 1] },
  salaire:   { label: "Salaire mensuel",         acteur: "famille",     canaux: ["Wave", "Orange Money", "Free Money"], montant: [75000, 160000],   taux: [0, 0] },
  b2b:       { label: "Facture B2B",             acteur: "entreprise",  canaux: ["Virement", "Carte"],                  montant: [900000, 5200000], taux: [0.08, 0.12] },
  diaspora:  { label: "Sama Kër (diaspora)",     acteur: "diaspora",    canaux: ["Carte"],                              montant: [60000, 220000],   taux: [0.03, 0.03] },
  agence:    { label: "Flux agence",             acteur: "agence",      canaux: ["Orange Money", "Virement"],           montant: [400000, 1800000], taux: [0.06, 0.06] },
  programme: { label: "Programme institutionnel",acteur: "institution", canaux: ["Virement"],                           montant: [2000000, 8000000],taux: [0.06, 0.06] },
  apport:    { label: "Apport partenaire",       acteur: "partenaire",  canaux: ["Prélèvement"],                        montant: [40000, 200000],   taux: [0.10, 0.10] }
};
const FIRST = ["Awa", "Mariama", "Khady", "Ndèye", "Rama", "Aïda", "Fatou", "Sokhna", "Moussa", "Ibrahima", "Oumar", "Cheikh"];
const LAST = ["Ndiaye", "Sow", "Fall", "Diallo", "Ba", "Sarr", "Diop", "Kane", "Faye", "Mbaye", "Ndour", "Gueye"];

function seedTransactions() {
  const r = rng(20260917);
  const villes = DEFAULT_SETTINGS.villes, vw = [55, 10, 12, 6, 5, 6, 6];
  const types = Object.keys(TX_TYPES), tw = [34, 4, 6, 14, 14, 5, 8, 4, 2, 3];
  const out = [];
  const end = new Date("2026-09-19T00:00:00Z"), start = new Date(end); start.setUTCMonth(start.getUTCMonth() - 6);
  const days = Math.round((end - start) / 86400000);
  let n = 0;
  for (let d = 0; d < days; d++) {
    const day = new Date(start.getTime() + d * 86400000);
    const growth = 1 + d / days * 1.6; // activité en croissance
    const count = Math.round((3 + r() * 4) * growth);
    for (let i = 0; i < count; i++) {
      const type = pick(r, types, tw), T = TX_TYPES[type];
      const ville = pick(r, villes, vw);
      const montant = Math.round((T.montant[0] + r() * (T.montant[1] - T.montant[0])) / 100) * 100;
      const taux = +(T.taux[0] + r() * (T.taux[1] - T.taux[0])).toFixed(2);
      const statut = pick(r, ["Versé", "Encaissé", "Séquestre", "Litige", "Remboursé"], [70, 18, 8, 2.5, 1.5]);
      const hour = 7 + Math.floor(r() * 13), min = Math.floor(r() * 60);
      const date = new Date(day); date.setUTCHours(hour, min, 0, 0);
      const pro = pick(r, FIRST) + " " + pick(r, LAST)[0] + ".";
      const client = T.acteur === "famille" ? "Famille " + pick(r, LAST) : T.acteur === "entreprise" ? pick(r, ["Teranga Résidences", "Cabinet Sénégal Conseil", "Clinique du Cap", "Résidence Les Filaos", "Hôtel Lamantin"]) :
        T.acteur === "diaspora" ? pick(r, FIRST) + " (" + pick(r, ["Paris", "Milan", "New York", "Montréal", "Madrid"]) + ")" : T.acteur === "agence" ? pick(r, ["Agence Kërsa", "Agence Teranga Services", "Sunu Kër Agency"]) :
        T.acteur === "institution" ? pick(r, ["Commune de Ouakam", "ONG Jàppo", "Ministère du Travail", "Mairie de Thiès"]) : pick(r, ["Mutuelle Santé Plus", "Baobab Microfinance", "Centre de formation Jàng"]);
      out.push({
        id: "TX-" + String(40000 + ++n).padStart(5, "0"), date: date.toISOString(), type, label: T.label, acteur: T.acteur,
        ville, canal: pick(r, T.canaux), client, pro: type === "salaire" || type === "heure" || type === "urgence" ? pro : "",
        montant, taux, commission: Math.round(montant * taux), statut
      });
    }
  }
  return out.sort((a, b) => a.date < b.date ? 1 : -1);
}
function seedOps() {
  return {
    kyc: [
      { id: "KYC-1042", nom: "Rama Faye", role: "pro", ville: "Dakar", etape: "Références : 1/2 appelée", depuisHeures: 18, statut: "en attente" },
      { id: "KYC-1043", nom: "Cabinet Diagne", role: "entreprise", ville: "Dakar", etape: "NINEA à contrôler", depuisHeures: 30, statut: "en attente" },
      { id: "KYC-1044", nom: "Oumar B. (Milan)", role: "diaspora", ville: "Thiès", etape: "Carte 3-D Secure validée", depuisHeures: 5, statut: "en attente" },
      { id: "KYC-1045", nom: "Sokhna Mbaye", role: "pro", ville: "Saly / Mbour", etape: "Pièce d'identité floue", depuisHeures: 52, statut: "en attente" },
      { id: "KYC-1046", nom: "Agence Sunu Kër", role: "agence", ville: "Thiès", etape: "Agrément reçu, à vérifier", depuisHeures: 9, statut: "en attente" }
    ],
    litiges: [
      { id: "LT-311", objet: "Annulation tardive par la famille", parties: "Famille Ndoye / Rama F.", montant: 6000, ouvertDepuisHeures: 20, statut: "ouvert", decision: "" },
      { id: "LT-312", objet: "Retards répétés (pointage)", parties: "Famille Sarr / Khady N.", montant: 0, ouvertDepuisHeures: 44, statut: "ouvert", decision: "" },
      { id: "LT-314", objet: "Objet cassé, RC mission", parties: "Mme Sy / Aïda M.", montant: 45000, ouvertDepuisHeures: 6, statut: "ouvert", decision: "" },
      { id: "LT-309", objet: "Salaire versé en retard (client)", parties: "Cabinet Diagne / équipe Diallo", montant: 320000, ouvertDepuisHeures: 96, statut: "résolu", decision: "Indice client −8, paiement régularisé" }
    ]
  };
}
function getTransactions() {
  let tx = readJSON("transactions.json", null);
  if (!tx) { tx = seedTransactions(); try { writeJSON("transactions.json", tx); } catch (e) {} }
  return tx;
}
function getOps() {
  let ops = readJSON("ops.json", null);
  if (!ops) { ops = seedOps(); try { writeJSON("ops.json", ops); } catch (e) {} }
  return ops;
}

/* ------------------------------------------------------------------ */
/* Reporting                                                            */
/* ------------------------------------------------------------------ */
function filterTx(tx, q) {
  const from = q.get("from"), to = q.get("to"), ville = q.get("ville"), type = q.get("type"), acteur = q.get("acteur"), canal = q.get("canal"), statut = q.get("statut");
  return tx.filter(t =>
    (!from || t.date.slice(0, 10) >= from) && (!to || t.date.slice(0, 10) <= to) &&
    (!ville || t.ville === ville) && (!type || t.type === type) && (!acteur || t.acteur === acteur) &&
    (!canal || t.canal === canal) && (!statut || t.statut === statut));
}
function groupBy(list, keyFn, labelFn) {
  const m = new Map();
  list.forEach(t => {
    const k = keyFn(t); const g = m.get(k) || { cle: k, label: labelFn ? labelFn(t) : k, gmv: 0, revenu: 0, nb: 0 };
    g.gmv += t.montant; g.revenu += t.commission; g.nb++; m.set(k, g);
  });
  return Array.from(m.values());
}
function report(tx, q) {
  const list = filterTx(tx, q);
  const gmv = list.reduce((a, t) => a + t.montant, 0), revenu = list.reduce((a, t) => a + t.commission, 0);
  const litiges = list.filter(t => t.statut === "Litige" || t.statut === "Remboursé").length;
  const recurrents = new Set(["serenite", "b2b", "diaspora", "agence"]);
  const revRec = list.filter(t => recurrents.has(t.type)).reduce((a, t) => a + t.commission, 0);
  const parMois = groupBy(list, t => t.date.slice(0, 7)).sort((a, b) => a.cle < b.cle ? -1 : 1);
  const byRev = (a, b) => b.revenu - a.revenu;
  return {
    periode: { from: q.get("from") || null, to: q.get("to") || null },
    kpis: {
      gmv, revenu, nb: list.length, prisePct: gmv ? +(revenu / gmv * 100).toFixed(2) : 0,
      litigesPct: list.length ? +(litiges / list.length * 100).toFixed(2) : 0, recurrentPct: revenu ? Math.round(revRec / revenu * 100) : 0,
      sequestre: list.filter(t => t.statut === "Séquestre").reduce((a, t) => a + t.montant, 0),
      clientsActifs: new Set(list.map(t => t.client)).size, prosActifs: new Set(list.filter(t => t.pro).map(t => t.pro)).size
    },
    parMois, parType: groupBy(list, t => t.type, t => t.label).sort(byRev), parVille: groupBy(list, t => t.ville).sort(byRev),
    parActeur: groupBy(list, t => t.acteur).sort(byRev), parCanal: groupBy(list, t => t.canal).sort(byRev),
    parStatut: groupBy(list, t => t.statut).sort((a, b) => b.nb - a.nb)
  };
}
function toCSV(list) {
  const cols = ["id", "date", "type", "label", "acteur", "ville", "canal", "client", "pro", "montant", "taux", "commission", "statut"];
  const esc = v => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
  return "﻿" + cols.join(";") + "\n" + list.map(t => cols.map(c => esc(t[c])).join(";")).join("\n");
}

/* ------------------------------------------------------------------ */
/* Authentification back-office                                         */
/* ------------------------------------------------------------------ */
const sessions = new Map();     // token → expiration (ms)
const attempts = new Map();     // ip → { n, until }
function parseCookies(req) {
  const out = {}; (req.headers.cookie || "").split(";").forEach(c => { const i = c.indexOf("="); if (i > 0) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim()); });
  return out;
}
function isAuthed(req) {
  const t = parseCookies(req).mn_admin; if (!t) return false;
  const exp = sessions.get(t); if (!exp) return false;
  if (exp < Date.now()) { sessions.delete(t); return false; }
  return true;
}
function clientIp(req) { return (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress || "?"; }
function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest(), hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}
function cookieHeader(req, token, maxAge) {
  const secure = (req.headers["x-forwarded-proto"] || "").includes("https") ? "; Secure" : "";
  return `mn_admin=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

/* ------------------------------------------------------------------ */
/* Utilitaires HTTP                                                     */
/* ------------------------------------------------------------------ */
function send(res, status, body, type, extra) {
  res.writeHead(status, Object.assign({
    "Content-Type": type || "text/plain; charset=utf-8", "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin"
  }, extra || {}));
  res.end(body);
}
function json(res, status, obj, extra) { send(res, status, JSON.stringify(obj), TYPES[".json"], extra); }
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let data = ""; req.on("data", c => { data += c; if (data.length > (limit || 65536)) { reject(new Error("trop volumineux")); req.destroy(); } });
    req.on("end", () => resolve(data)); req.on("error", reject);
  });
}
function serveFile(req, res, file) {
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) return fs.readFile(path.join(ROOT, "404.html"), (e, page) => send(res, 404, e ? "Page introuvable" : page, TYPES[".html"]));
    const ext = path.extname(file).toLowerCase();
    fs.readFile(file, (e, data) => e ? send(res, 500, "Erreur serveur") : send(res, 200, req.method === "HEAD" ? "" : data, TYPES[ext] || "application/octet-stream", { "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600" }));
  });
}
function resolveStatic(urlPath) {
  let p = decodeURIComponent(urlPath);
  if (p === "/") p = "/index.html";
  else if (!path.extname(p)) p = p.replace(/\/$/, "") + ".html";
  const full = path.normalize(path.join(ROOT, p));
  if (!full.startsWith(ROOT + path.sep) || full.includes(path.sep + ".") || full.startsWith(path.join(ROOT, "node_modules")) || full.startsWith(DATA_DIR) || full === path.join(ROOT, "server.js")) return null;
  return full;
}

/* ------------------------------------------------------------------ */
/* API                                                                  */
/* ------------------------------------------------------------------ */
function validateSettings(input) {
  const s = getSettings(), num = (v, min, max) => { const n = Number(v); return Number.isFinite(n) && n >= min && n <= max ? n : null; };
  const errors = [];
  const sections = { commissions: [0, 100000], salaires: [0, 1000000], niveaux: [0, 100], alertes: [0, 100000] };
  Object.keys(sections).forEach(sec => {
    if (!input[sec]) return;
    Object.keys(s[sec]).forEach(k => {
      if (input[sec][k] === undefined) return;
      const v = num(input[sec][k], sections[sec][0], sections[sec][1]);
      if (v === null) errors.push(sec + "." + k + " invalide"); else s[sec][k] = v;
    });
  });
  ["formules", "paiements"].forEach(sec => { if (input[sec]) Object.keys(s[sec]).forEach(k => { if (input[sec][k] !== undefined) s[sec][k] = Boolean(input[sec][k]); }); });
  if (Array.isArray(input.villes)) s.villes = input.villes.map(v => String(v).trim()).filter(Boolean).slice(0, 50);
  if (s.niveaux.argent >= s.niveaux.or || s.niveaux.or >= s.niveaux.platine) errors.push("niveaux : Argent < Or < Platine requis");
  if (s.commissions.b2bMin > s.commissions.b2bMax) errors.push("commissions : B2B min > max");
  if (s.commissions.heurePlatine > s.commissions.heureOr || s.commissions.heureOr > s.commissions.heure) errors.push("commissions : Platine ≤ Or ≤ standard requis");
  return { settings: s, errors };
}

async function handleApi(req, res, url) {
  const p = url.pathname, q = url.searchParams;
  if (p === "/api/settings" && req.method === "GET") return json(res, 200, getSettings());

  if (p === "/api/admin/login" && req.method === "POST") {
    if (!ADMIN_PASSWORD) return json(res, 503, { error: "Back-office désactivé : définissez la variable ADMIN_PASSWORD sur le serveur." });
    const ip = clientIp(req), a = attempts.get(ip) || { n: 0, until: 0 };
    if (a.until > Date.now()) return json(res, 429, { error: "Trop de tentatives. Réessayez dans " + Math.ceil((a.until - Date.now()) / 60000) + " min." });
    let body = {}; try { body = JSON.parse(await readBody(req) || "{}"); } catch (e) {}
    if (!body.password || !safeEqual(body.password, ADMIN_PASSWORD)) {
      a.n++; if (a.n >= 5) { a.n = 0; a.until = Date.now() + 15 * 60000; } attempts.set(ip, a);
      return json(res, 401, { error: "Mot de passe incorrect." });
    }
    attempts.delete(ip);
    const token = crypto.randomBytes(24).toString("hex"); sessions.set(token, Date.now() + SESSION_HOURS * 3600000);
    return json(res, 200, { ok: true }, { "Set-Cookie": cookieHeader(req, token, SESSION_HOURS * 3600) });
  }
  if (p === "/api/admin/logout" && req.method === "POST") {
    sessions.delete(parseCookies(req).mn_admin);
    return json(res, 200, { ok: true }, { "Set-Cookie": cookieHeader(req, "", 0) });
  }
  if (p.startsWith("/api/admin/")) {
    if (!isAuthed(req)) return json(res, 401, { error: "Non authentifié" });
    if (p === "/api/admin/me") return json(res, 200, { ok: true, expiresInHours: SESSION_HOURS, dataDir: DATA_DIR, persistent: DATA_DIR !== path.join(ROOT, "data") });
    if (p === "/api/admin/report") return json(res, 200, report(getTransactions(), q));
    if (p === "/api/admin/report.csv") {
      const list = filterTx(getTransactions(), q);
      return send(res, 200, toCSV(list), TYPES[".csv"], { "Content-Disposition": 'attachment; filename="marynet-transactions.csv"' });
    }
    if (p === "/api/admin/transactions") {
      const list = filterTx(getTransactions(), q), page = Math.max(1, Number(q.get("page")) || 1), limit = Math.min(200, Number(q.get("limit")) || 25);
      return json(res, 200, { total: list.length, page, pages: Math.max(1, Math.ceil(list.length / limit)), items: list.slice((page - 1) * limit, page * limit) });
    }
    if (p === "/api/admin/settings") {
      if (req.method === "GET") return json(res, 200, getSettings());
      if (req.method === "PUT") {
        let body; try { body = JSON.parse(await readBody(req)); } catch (e) { return json(res, 400, { error: "JSON invalide" }); }
        const { settings, errors } = validateSettings(body);
        if (errors.length) return json(res, 422, { error: errors.join(" · "), errors });
        settings.updatedAt = new Date().toISOString();
        try { writeJSON("settings.json", settings); } catch (e) { return json(res, 500, { error: "Impossible d'écrire dans " + DATA_DIR }); }
        return json(res, 200, settings);
      }
    }
    if (p === "/api/admin/ops" && req.method === "GET") return json(res, 200, getOps());
    const m = p.match(/^\/api\/admin\/(kyc|litiges)\/([\w-]+)$/);
    if (m && req.method === "POST") {
      let body = {}; try { body = JSON.parse(await readBody(req) || "{}"); } catch (e) {}
      const ops = getOps(), item = ops[m[1]].find(x => x.id === m[2]);
      if (!item) return json(res, 404, { error: "Introuvable" });
      if (m[1] === "kyc") item.statut = body.action === "rejeter" ? "rejeté" : "validé";
      else { item.statut = "résolu"; item.decision = String(body.decision || "Résolu par la médiation").slice(0, 300); }
      try { writeJSON("ops.json", ops); } catch (e) {}
      return json(res, 200, item);
    }
    if (p === "/api/admin/reset" && req.method === "POST") {
      try { writeJSON("transactions.json", seedTransactions()); writeJSON("ops.json", seedOps()); } catch (e) {}
      return json(res, 200, { ok: true });
    }
  }
  return json(res, 404, { error: "Route inconnue" });
}

/* ------------------------------------------------------------------ */
/* Serveur                                                              */
/* ------------------------------------------------------------------ */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const p = url.pathname;
  try {
    if (p === "/health") return json(res, 200, { status: "ok", app: "marynet", admin: Boolean(ADMIN_PASSWORD) });
    if (p.startsWith("/api/")) return await handleApi(req, res, url);
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Méthode non autorisée");
    if (p === "/admin" || p === "/admin/" || p === "/admin.html") {
      return serveFile(req, res, path.join(ROOT, isAuthed(req) ? "admin.html" : "admin-login.html"));
    }
    if (p === "/admin-login" || p === "/admin-login.html") return serveFile(req, res, path.join(ROOT, "admin-login.html"));
    const file = resolveStatic(p);
    if (!file) return send(res, 404, "Introuvable");
    serveFile(req, res, file);
  } catch (e) {
    console.error(e); send(res, 500, "Erreur serveur");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`MARYNET en ligne sur http://${HOST}:${PORT} · données : ${DATA_DIR}`);
  if (!ADMIN_PASSWORD) console.warn("⚠️  ADMIN_PASSWORD non défini : le back-office /admin est désactivé.");
  else if (!process.env.ADMIN_PASSWORD) console.warn("⚠️  Mot de passe back-office par défaut (développement) : marynet2026");
});
